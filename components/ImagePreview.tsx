"use client";

import { useEffect, useRef } from "react";

import { GalleryImage } from "@/components/GalleryImage";
import type { PublicGalleryItem } from "@/models/GalleryItem";

interface ImagePreviewProps {
  item: PublicGalleryItem;
  onClose: () => void;
}

export function ImagePreview({ item, onClose }: ImagePreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="m-auto max-h-none max-w-none border-0 bg-transparent p-4 text-right backdrop:bg-stone-950/88 backdrop:backdrop-blur-sm open:flex open:h-dvh open:w-dvw open:items-center open:justify-center sm:p-8"
      aria-labelledby="preview-title"
      onCancel={(event) => {
        event.preventDefault();
        dialogRef.current?.close();
      }}
      onClose={onClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="relative flex max-h-full w-full max-w-5xl flex-col items-center">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="absolute -top-1 left-0 z-10 grid size-11 place-items-center rounded-full bg-white text-2xl leading-none text-stone-800 shadow-lg transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:top-0"
          aria-label="بستن پیش‌نمایش"
          autoFocus
        >
          ×
        </button>

        <div className="flex max-h-[78vh] min-h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-stone-900/60 sm:min-h-96">
          <GalleryImage
            key={item.imageUrl}
            src={item.imageUrl}
            alt={item.name}
            className="max-h-[78vh] w-auto max-w-full object-contain"
            eager
          />
        </div>
        <h2
          id="preview-title"
          className="mt-4 max-w-3xl text-center text-base font-medium text-white sm:text-lg"
        >
          {item.name}
        </h2>
      </div>
    </dialog>
  );
}
