import { unstable_cache } from "next/cache";
import type { Collection, Document } from "mongodb";

import { getDatabase, getMongoClient } from "@/lib/mongodb";
import type {
  GalleryItemDocument,
  GalleryItemInput,
  PublicGalleryItem,
} from "@/models/GalleryItem";

const COLLECTION_NAME = "gallery_items";

const globalGallery = globalThis as typeof globalThis & {
  galleryIndexPromise?: Promise<string>;
};

export interface UpsertResult {
  created: boolean;
}

export interface DeleteResult {
  deleted: boolean;
}

export interface GalleryRepository {
  upsert(item: GalleryItemInput): Promise<UpsertResult>;
  delete(sourceId: string): Promise<DeleteResult>;
  replaceAll(items: GalleryItemInput[]): Promise<void>;
}

async function getCollection(): Promise<Collection<GalleryItemDocument>> {
  const database = await getDatabase();
  const collection = database.collection<GalleryItemDocument>(COLLECTION_NAME);

  if (!globalGallery.galleryIndexPromise) {
    globalGallery.galleryIndexPromise = collection
      .createIndex({ sourceId: 1 }, { unique: true })
      .catch((error) => {
        globalGallery.galleryIndexPromise = undefined;
        throw error;
      });
  }

  await globalGallery.galleryIndexPromise;
  return collection;
}

function toIdempotentUpdate(item: GalleryItemInput): Document[] {
  const now = new Date();
  const literal = (value: unknown) => ({ $literal: value });
  const unchanged = {
    $and: [
      { $eq: ["$sourceId", literal(item.sourceId)] },
      { $eq: ["$name", literal(item.name)] },
      { $eq: ["$imageUrl", literal(item.imageUrl)] },
      { $eq: ["$images", literal(item.images)] },
      { $eq: ["$sortOrder", item.sortOrder] },
      { $eq: ["$isVisible", item.isVisible] },
    ],
  };

  return [
    {
      $set: {
        sourceId: literal(item.sourceId),
        name: literal(item.name),
        imageUrl: literal(item.imageUrl),
        images: literal(item.images),
        sortOrder: item.sortOrder,
        isVisible: item.isVisible,
        updatedAt: {
          $cond: [unchanged, { $ifNull: ["$updatedAt", literal(now)] }, literal(now)],
        },
      },
    },
  ];
}

export class MongoGalleryRepository implements GalleryRepository {
  async upsert(item: GalleryItemInput): Promise<UpsertResult> {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { sourceId: item.sourceId },
      toIdempotentUpdate(item),
      { upsert: true },
    );

    return { created: result.upsertedCount === 1 };
  }

  async delete(sourceId: string): Promise<DeleteResult> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ sourceId });
    return { deleted: result.deletedCount === 1 };
  }

  async replaceAll(items: GalleryItemInput[]): Promise<void> {
    const client = await getMongoClient();
    const collection = await getCollection();

    await client.withSession(async (session) => {
      await session.withTransaction(
        async () => {
          if (items.length > 0) {
            await collection.bulkWrite(
              items.map((item) => ({
                updateOne: {
                  filter: { sourceId: item.sourceId },
                  update: toIdempotentUpdate(item),
                  upsert: true,
                },
              })),
              { ordered: true, session },
            );

            await collection.deleteMany(
              { sourceId: { $nin: items.map((item) => item.sourceId) } },
              { session },
            );
          } else {
            await collection.deleteMany({}, { session });
          }
        },
        {
          readConcern: { level: "snapshot" },
          writeConcern: { w: "majority" },
        },
      );
    });
  }
}

async function queryVisibleGalleryItems(): Promise<PublicGalleryItem[]> {
  const collection = await getCollection();
  const items = await collection
    .find(
      { isVisible: true },
      {
        projection: {
          _id: 0,
          sourceId: 1,
          name: 1,
          imageUrl: 1,
        },
      },
    )
    .sort({ sortOrder: 1, updatedAt: -1 })
    .toArray();

  return items.map((item) => ({
    sourceId: item.sourceId,
    name: item.name,
    imageUrl: item.imageUrl,
  }));
}

export const listVisibleGalleryItems = unstable_cache(
  queryVisibleGalleryItems,
  ["visible-gallery-items"],
  { revalidate: 60, tags: ["gallery-items"] },
);
