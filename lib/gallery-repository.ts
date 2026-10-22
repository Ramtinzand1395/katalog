import { unstable_cache } from "next/cache";
import type { Collection } from "mongodb";

import { getDatabase } from "@/lib/mongodb";
import { toPublicGalleryItem } from "@/lib/gallery-item";
import type { GalleryItemDocument, PublicGalleryItem } from "@/models/GalleryItem";

const COLLECTION_NAME = "gallery_items";

async function getCollection(): Promise<Collection<GalleryItemDocument>> {
  const database = await getDatabase();
  return database.collection<GalleryItemDocument>(COLLECTION_NAME);
}

async function queryVisibleGalleryItems(): Promise<PublicGalleryItem[]> {
  const collection = await getCollection();
  const items = await collection
    .find(
      {},
      {
        projection: {
          _id: 1,
          name: 1,
          images: 1,
        },
      },
    )
    .sort({ _id: 1 })
    .toArray();

  return items.flatMap((item) => {
    const publicItem = toPublicGalleryItem(item);
    return publicItem ? [publicItem] : [];
  });
}

export const listVisibleGalleryItems = unstable_cache(
  queryVisibleGalleryItems,
  ["visible-gallery-items"],
  { revalidate: 60, tags: ["gallery-items"] },
);
