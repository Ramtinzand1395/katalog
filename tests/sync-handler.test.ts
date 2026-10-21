import { describe, expect, it } from "vitest";

import type {
  DeleteResult,
  GalleryRepository,
  UpsertResult,
} from "@/lib/gallery-repository";
import { handleSyncRequest, MAX_SYNC_BODY_BYTES } from "@/lib/sync-handler";
import type { GalleryItemInput } from "@/models/GalleryItem";

const API_KEY = "test-secret-key";

const sampleItem: GalleryItemInput = {
  sourceId: "wall-art-123",
  name: "تابلو The Last of Us",
  imageUrl: "https://example.com/art.webp",
  images: ["https://example.com/art.webp"],
  sortOrder: 1,
  isVisible: true,
};

class MemoryGalleryRepository implements GalleryRepository {
  readonly items = new Map<string, GalleryItemInput>();
  fail = false;

  async upsert(item: GalleryItemInput): Promise<UpsertResult> {
    if (this.fail) throw new Error("database details must remain private");
    const created = !this.items.has(item.sourceId);
    this.items.set(item.sourceId, structuredClone(item));
    return { created };
  }

  async delete(sourceId: string): Promise<DeleteResult> {
    if (this.fail) throw new Error("database details must remain private");
    return { deleted: this.items.delete(sourceId) };
  }

  async replaceAll(items: GalleryItemInput[]): Promise<void> {
    if (this.fail) throw new Error("database details must remain private");
    this.items.clear();
    items.forEach((item) => this.items.set(item.sourceId, structuredClone(item)));
  }
}

function makeRequest(body: unknown, apiKey = API_KEY): Request {
  return new Request("http://localhost/api/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function makeDependencies(repository: GalleryRepository) {
  return {
    getApiKey: () => API_KEY,
    getRepository: () => repository,
  };
}

describe("POST /api/sync", () => {
  it("creates and then updates an item by sourceId", async () => {
    const repository = new MemoryGalleryRepository();

    const created = await handleSyncRequest(
      makeRequest({ action: "upsert", item: sampleItem }),
      makeDependencies(repository),
    );
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ ok: true, result: "created" });

    const updated = await handleSyncRequest(
      makeRequest({
        action: "upsert",
        item: { ...sampleItem, name: "نام تازه" },
      }),
      makeDependencies(repository),
    );
    expect(updated.status).toBe(200);
    expect(await updated.json()).toMatchObject({ ok: true, result: "updated" });
    expect(repository.items.get(sampleItem.sourceId)?.name).toBe("نام تازه");
  });

  it("deletes an existing item and treats a missing item idempotently", async () => {
    const repository = new MemoryGalleryRepository();
    repository.items.set(sampleItem.sourceId, sampleItem);

    const deleted = await handleSyncRequest(
      makeRequest({ action: "delete", sourceId: sampleItem.sourceId }),
      makeDependencies(repository),
    );
    expect(await deleted.json()).toMatchObject({ ok: true, deleted: true });

    const missing = await handleSyncRequest(
      makeRequest({ action: "delete", sourceId: sampleItem.sourceId }),
      makeDependencies(repository),
    );
    expect(missing.status).toBe(200);
    expect(await missing.json()).toMatchObject({ ok: true, deleted: false });
  });

  it("replaces the full catalog", async () => {
    const repository = new MemoryGalleryRepository();
    repository.items.set("old", { ...sampleItem, sourceId: "old" });
    const replacement = [sampleItem, { ...sampleItem, sourceId: "wall-art-456" }];

    const response = await handleSyncRequest(
      makeRequest({ action: "replace_all", items: replacement }),
      makeDependencies(repository),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, count: 2 });
    expect([...repository.items.keys()]).toEqual(["wall-art-123", "wall-art-456"]);
  });

  it("rejects duplicate source IDs before replacement", async () => {
    const repository = new MemoryGalleryRepository();
    const response = await handleSyncRequest(
      makeRequest({ action: "replace_all", items: [sampleItem, sampleItem] }),
      makeDependencies(repository),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: "Replacement contains duplicate source IDs.",
    });
    expect(repository.items.size).toBe(0);
  });

  it("requires allowEmpty to intentionally clear the catalog", async () => {
    const repository = new MemoryGalleryRepository();
    repository.items.set(sampleItem.sourceId, sampleItem);

    const rejected = await handleSyncRequest(
      makeRequest({ action: "replace_all", items: [] }),
      makeDependencies(repository),
    );
    expect(rejected.status).toBe(422);
    expect(repository.items.size).toBe(1);

    const accepted = await handleSyncRequest(
      makeRequest({ action: "replace_all", items: [], allowEmpty: true }),
      makeDependencies(repository),
    );
    expect(accepted.status).toBe(200);
    expect(repository.items.size).toBe(0);
  });

  it("rejects missing or invalid authorization", async () => {
    const repository = new MemoryGalleryRepository();
    const response = await handleSyncRequest(
      makeRequest({ action: "upsert", item: sampleItem }, "wrong-key"),
      makeDependencies(repository),
    );

    expect(response.status).toBe(401);
    expect(repository.items.size).toBe(0);
  });

  it("rejects invalid and partial payloads", async () => {
    const repository = new MemoryGalleryRepository();
    const response = await handleSyncRequest(
      makeRequest({
        action: "upsert",
        item: { sourceId: "incomplete", name: "ناقص" },
      }),
      makeDependencies(repository),
    );

    expect(response.status).toBe(422);
    expect(repository.items.size).toBe(0);
  });

  it("rejects payloads above the application limit", async () => {
    const repository = new MemoryGalleryRepository();
    const request = new Request("http://localhost/api/sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Length": String(MAX_SYNC_BODY_BYTES + 1),
      },
      body: "{}",
    });

    const response = await handleSyncRequest(request, makeDependencies(repository));
    expect(response.status).toBe(413);
  });

  it("returns a sanitized response when the database fails", async () => {
    const repository = new MemoryGalleryRepository();
    repository.fail = true;

    const response = await handleSyncRequest(
      makeRequest({ action: "upsert", item: sampleItem }),
      makeDependencies(repository),
    );
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).not.toContain("database details");
  });
});
