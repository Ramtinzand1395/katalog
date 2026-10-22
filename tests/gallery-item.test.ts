import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";

import { toPublicGalleryItem } from "@/lib/gallery-item";

describe("manual MongoDB gallery data", () => {
  it("accepts the name and images array format", () => {
    const _id = new ObjectId();
    const item = toPublicGalleryItem({
      _id,
      name: "تست تابلو gta",
      images: [
        "https://res.cloudinary.com/crch1hle/image/upload/v1792058028/oynbdatylcsvqjm4f7ne.png",
        "https://res.cloudinary.com/crch1hle/image/upload/v1792058136/n9agk6drkznwnu6gyno3.png",
      ],
    });

    expect(item).toEqual({
      id: _id.toString(),
      name: "تست تابلو gta",
      images: [
        "https://res.cloudinary.com/crch1hle/image/upload/v1792058028/oynbdatylcsvqjm4f7ne.png",
        "https://res.cloudinary.com/crch1hle/image/upload/v1792058136/n9agk6drkznwnu6gyno3.png",
      ],
    });
  });

  it("trims values and removes duplicate or invalid URLs", () => {
    const item = toPublicGalleryItem({
      _id: new ObjectId(),
      name: "  تابلو نمونه  ",
      images: [
        " https://example.com/art.png ",
        "https://example.com/art.png",
        "javascript:alert(1)",
        42,
      ],
    });

    expect(item?.name).toBe("تابلو نمونه");
    expect(item?.images).toEqual(["https://example.com/art.png"]);
  });

  it("rejects incomplete records", () => {
    expect(toPublicGalleryItem({ _id: new ObjectId(), images: [] })).toBeNull();
    expect(
      toPublicGalleryItem({ _id: new ObjectId(), name: "بدون تصویر", images: [] }),
    ).toBeNull();
  });
});
