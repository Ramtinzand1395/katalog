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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-8">
        {items.map((item, index) => (
          <article key={item.id} className="gallery-card min-w-0">
            <button
              type="button"
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-white/[0.09] bg-[#151515] text-right shadow-[0_24px_80px_rgba(0,0,0,0.18)] transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_90px_rgba(0,0,0,0.42)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              onClick={() => setSelectedItem(item)}
              aria-label={`نمایش بزرگ‌تر ${item.name}`}
            >
              <GalleryImage
                key={item.images[0]}
                src={item.images[0]}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                eager={index < 3}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/20 opacity-90 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-6">
                <span className="text-xs font-medium tabular-nums text-white/60">
                  {new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(index + 1)}
                </span>
                {item.images.length > 1 ? (
                  <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[0.68rem] text-white/75 backdrop-blur-md">
                    {new Intl.NumberFormat("fa-IR").format(item.images.length)} تصویر
                  </span>
                ) : null}
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="mb-2 text-[0.65rem] tracking-[0.14em] text-white/45">اثر منتخب</p>
                  <h3 className="line-clamp-2 text-lg font-medium leading-8 tracking-tight text-white sm:text-xl">
                    {item.name}
                  </h3>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:rotate-[-8deg] group-hover:bg-white group-hover:text-black">
                  <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
                    <path d="M6 14 14 6M8 6h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </button>
          </article>
        ))}
      </div>

      {selectedItem ? (
        <ImagePreview item={selectedItem} onClose={() => setSelectedItem(null)} />
      ) : null}
    </>
  );
}
