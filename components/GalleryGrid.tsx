"use client";

import { useState } from "react";

import { GalleryImage } from "@/components/GalleryImage";
import { ImagePreview } from "@/components/ImagePreview";
import type { PublicGalleryItem } from "@/models/GalleryItem";

interface GalleryGridProps {
  items: PublicGalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<PublicGalleryItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-11">
        {items.map((item, index) => (
          <article key={item.id} className="min-w-0">
            <button
              type="button"
              className="group block w-full overflow-hidden rounded-2xl bg-stone-100 text-right shadow-[0_1px_0_rgba(28,25,23,0.06),0_10px_30px_rgba(28,25,23,0.06)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700"
              onClick={() => setSelectedItem(item)}
              aria-label={`نمایش بزرگ‌تر ${item.name}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <GalleryImage
                  key={item.images[0]}
                  src={item.images[0]}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                  eager={index < 4}
                />
                {item.images.length > 1 ? (
                  <span className="absolute bottom-2 left-2 rounded-full bg-stone-950/75 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                    {new Intl.NumberFormat("fa-IR").format(item.images.length)} تصویر
                  </span>
                ) : null}
              </div>
            </button>
            <h2 className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-stone-800 sm:text-base sm:leading-7">
              {item.name}
            </h2>
          </article>
        ))}
      </div>

      {selectedItem ? (
        <ImagePreview item={selectedItem} onClose={() => setSelectedItem(null)} />
      ) : null}
    </>
  );
}
