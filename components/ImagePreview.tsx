"use client";

import { useEffect, useRef, useState } from "react";

import { GalleryImage } from "@/components/GalleryImage";
import type { PublicGalleryItem } from "@/models/GalleryItem";

interface ImagePreviewProps {
  item: PublicGalleryItem;
  onClose: () => void;
}

export function ImagePreview({ item, onClose }: ImagePreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = item.images.length > 1;

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? item.images.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % item.images.length);
  };

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!hasMultipleImages) return;
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current + 1) % item.images.length);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === 0 ? item.images.length - 1 : current - 1,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleImages, item.images.length]);

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

        <div className="relative flex max-h-[70vh] min-h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-stone-900/60 sm:min-h-96">
          <GalleryImage
            key={item.images[activeIndex]}
            src={item.images[activeIndex]}
            alt={`${item.name}، تصویر ${activeIndex + 1}`}
            className="max-h-[70vh] w-auto max-w-full object-contain"
            eager
          />

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/90 text-3xl text-stone-900 shadow-lg transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="تصویر قبلی"
              >
                ›
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/90 text-3xl text-stone-900 shadow-lg transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="تصویر بعدی"
              >
                ‹
              </button>
            </>
          ) : null}
        </div>
        <h2
          id="preview-title"
          className="mt-4 max-w-3xl text-center text-base font-medium text-white sm:text-lg"
        >
          {item.name}
        </h2>
        {hasMultipleImages ? (
          <div className="mt-3 flex max-w-full gap-2 overflow-x-auto px-1 pb-1" aria-label="تصاویر تابلو">
            {item.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity ${
                  activeIndex === index
                    ? "border-amber-500 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`نمایش تصویر ${index + 1} از ${item.images.length}`}
                aria-current={activeIndex === index ? "true" : undefined}
              >
                <GalleryImage
                  src={image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
