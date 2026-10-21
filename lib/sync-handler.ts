import { createHash, timingSafeEqual } from "node:crypto";

import type { GalleryRepository } from "@/lib/gallery-repository";
import { syncPayloadSchema } from "@/lib/validation";

export const MAX_SYNC_BODY_BYTES = 4 * 1024 * 1024;

interface SyncHandlerDependencies {
  getApiKey: () => string | undefined;
  getRepository: () => GalleryRepository;
  onSynced?: () => void | Promise<void>;
}

class BodyTooLargeError extends Error {}

function jsonResponse(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function secretsMatch(actual: string, expected: string): boolean {
  const actualDigest = createHash("sha256").update(actual).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}

async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_SYNC_BODY_BYTES) {
    throw new BodyTooLargeError();
  }

  if (!request.body) {
    return undefined;
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    byteLength += value.byteLength;
    if (byteLength > MAX_SYNC_BODY_BYTES) {
      await reader.cancel();
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(new TextDecoder().decode(body));
}

export async function handleSyncRequest(
  request: Request,
  dependencies: SyncHandlerDependencies,
): Promise<Response> {
  const configuredApiKey = dependencies.getApiKey()?.trim();
  if (!configuredApiKey) {
    console.error("Gallery sync is unavailable because its API key is not configured.");
    return jsonResponse(
      { ok: false, error: "Synchronization is temporarily unavailable." },
      503,
    );
  }

  const authorization = request.headers.get("authorization");
  const suppliedApiKey = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!suppliedApiKey || !secretsMatch(suppliedApiKey, configuredApiKey)) {
    return jsonResponse({ ok: false, error: "Unauthorized." }, 401);
  }

  let rawPayload: unknown;
  try {
    rawPayload = await readJsonBody(request);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return jsonResponse(
        {
          ok: false,
          error: "Request body is too large.",
          maxBytes: MAX_SYNC_BODY_BYTES,
        },
        413,
      );
    }

    return jsonResponse({ ok: false, error: "Request body must be valid JSON." }, 400);
  }

  const parsed = syncPayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    const hasDuplicate = parsed.error.issues.some((issue) =>
      issue.message.startsWith("Duplicate sourceId:"),
    );

    return jsonResponse(
      {
        ok: false,
        error: hasDuplicate
          ? "Replacement contains duplicate source IDs."
          : "Request payload is invalid.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      422,
    );
  }

  try {
    const repository = dependencies.getRepository();
    const payload = parsed.data;

    if (payload.action === "upsert") {
      const result = await repository.upsert(payload.item);
      await dependencies.onSynced?.();
      return jsonResponse(
        {
          ok: true,
          action: "upsert",
          sourceId: payload.item.sourceId,
          result: result.created ? "created" : "updated",
        },
        result.created ? 201 : 200,
      );
    }

    if (payload.action === "delete") {
      const result = await repository.delete(payload.sourceId);
      await dependencies.onSynced?.();
      return jsonResponse(
        {
          ok: true,
          action: "delete",
          sourceId: payload.sourceId,
          deleted: result.deleted,
        },
        200,
      );
    }

    await repository.replaceAll(payload.items);
    await dependencies.onSynced?.();
    return jsonResponse(
      {
        ok: true,
        action: "replace_all",
        count: payload.items.length,
      },
      200,
    );
  } catch (error) {
    console.error("Gallery synchronization failed.", error);
    return jsonResponse(
      { ok: false, error: "Synchronization could not be completed." },
      503,
    );
  }
}
