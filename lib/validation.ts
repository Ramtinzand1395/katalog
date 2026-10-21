import { z } from "zod";

const httpUrl = z
  .string()
  .trim()
  .min(1)
  .max(2_048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Image URLs must use http or https.");

export const galleryItemSchema = z
  .object({
    sourceId: z.string().trim().min(1).max(160),
    name: z.string().trim().min(1).max(240),
    imageUrl: httpUrl,
    images: z.array(httpUrl).max(24),
    sortOrder: z.number().int().min(-1_000_000).max(1_000_000),
    isVisible: z.boolean(),
  })
  .strict();

const upsertSchema = z
  .object({
    action: z.literal("upsert"),
    item: galleryItemSchema,
  })
  .strict();

const deleteSchema = z
  .object({
    action: z.literal("delete"),
    sourceId: z.string().trim().min(1).max(160),
  })
  .strict();

const replaceAllSchema = z
  .object({
    action: z.literal("replace_all"),
    items: z.array(galleryItemSchema).max(10_000),
    allowEmpty: z.boolean().optional(),
  })
  .strict()
  .superRefine((payload, context) => {
    if (payload.items.length === 0 && payload.allowEmpty !== true) {
      context.addIssue({
        code: "custom",
        path: ["allowEmpty"],
        message: "Set allowEmpty to true to intentionally clear the catalog.",
      });
    }

    const seen = new Set<string>();
    payload.items.forEach((item, index) => {
      if (seen.has(item.sourceId)) {
        context.addIssue({
          code: "custom",
          path: ["items", index, "sourceId"],
          message: `Duplicate sourceId: ${item.sourceId}`,
        });
      }
      seen.add(item.sourceId);
    });
  });

export const syncPayloadSchema = z.discriminatedUnion("action", [
  upsertSchema,
  deleteSchema,
  replaceAllSchema,
]);

export type SyncPayload = z.infer<typeof syncPayloadSchema>;
