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
      className="m-auto max-h-none max-w-none border-0 bg-transparent p-0 text-right backdrop:bg-black/95 backdrop:backdrop-blur-xl open:flex open:h-dvh open:w-dvw open:items-center open:justify-center"
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
      <div className="preview-panel relative grid h-full w-full grid-rows-[minmax(0,1fr)_auto] bg-[#090909] lg:h-[calc(100dvh-3rem)] lg:w-[calc(100dvw-3rem)] lg:max-w-[96rem] lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-1 lg:overflow-hidden lg:rounded-[2rem] lg:border lg:border-white/10">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="absolute left-4 top-4 z-20 grid size-11 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6 sm:top-6"
          aria-label="بستن پیش‌نمایش"
          autoFocus
        >
          <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
            <path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative flex min-h-0 w-full items-center justify-center overflow-hidden bg-[#111] p-4 sm:p-8 lg:p-12">
          <div className="absolute inset-0 opacity-25 blur-3xl" aria-hidden="true">
            <GalleryImage
              src={item.images[activeIndex]}
              alt=""
              className="h-full w-full scale-110 object-cover"
              eager
            />
          </div>
          <div className="absolute inset-0 bg-black/55" />
          <GalleryImage
            key={item.images[activeIndex]}
            src={item.images[activeIndex]}
            alt={`${item.name}، تصویر ${activeIndex + 1}`}
            className="relative z-10 max-h-full w-auto max-w-full rounded-sm object-contain shadow-[0_32px_100px_rgba(0,0,0,0.55)]"
            eager
          />

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute right-4 z-20 grid size-12 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
                aria-label="تصویر قبلی"
              >
                <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
                  <path d="m8 5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute left-4 z-20 grid size-12 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
                aria-label="تصویر بعدی"
              >
                <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
                  <path d="m12 5-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          ) : null}

          <span className="absolute bottom-4 right-4 z-20 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs tabular-nums text-white/65 backdrop-blur-md sm:bottom-6 sm:right-6">
            {new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(activeIndex + 1)}
            <span className="mx-1.5 text-white/25">/</span>
            {new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(item.images.length)}
          </span>
        </div>

        <aside className="flex min-h-0 flex-col border-t border-white/10 bg-[#0d0d0d] p-5 sm:p-7 lg:border-r lg:border-t-0 lg:p-8">
          <div className="lg:mt-20">
            <p className="mb-4 text-[0.65rem] tracking-[0.16em] text-white/35">SELECTED WORK</p>
            <h2 id="preview-title" className="text-xl font-medium leading-9 tracking-tight text-white lg:text-2xl">
              {item.name}
            </h2>
            <div className="mt-6 h-px w-10 bg-white/20" />
          </div>

          {hasMultipleImages ? (
            <div className="mt-6 min-h-0 lg:mt-auto">
              <p className="mb-3 text-xs text-white/35">نماهای دیگر</p>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible" aria-label="تصاویر تابلو">
                {item.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border transition-all lg:w-auto ${
                      activeIndex === index
                        ? "border-white opacity-100"
                        : "border-white/10 opacity-45 hover:border-white/30 hover:opacity-90"
                    }`}
                    aria-label={`نمایش تصویر ${index + 1} از ${item.images.length}`}
                    aria-current={activeIndex === index ? "true" : undefined}
                  >
                    <GalleryImage src={image} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 text-[0.6rem] tabular-nums text-white/70">
                      {new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(index + 1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </dialog>
  );
}
