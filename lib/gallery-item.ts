import type { WithId } from "mongodb";

import type { GalleryItemDocument, PublicGalleryItem } from "@/models/GalleryItem";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function toPublicGalleryItem(
  item: WithId<GalleryItemDocument>,
): PublicGalleryItem | null {
  if (typeof item.name !== "string" || !Array.isArray(item.images)) return null;

  const name = item.name.trim();
  const images = [
    ...new Set(
      item.images
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && isHttpUrl(value)),
    ),
  ];

  if (!name || images.length === 0) return null;

  return {
    id: item._id.toString(),
    name,
    images,
  };
}
