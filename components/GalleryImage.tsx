"use client";

import { useState } from "react";

interface GalleryImageProps {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

export function GalleryImage({
  src,
  alt,
  className = "",
  eager = false,
}: GalleryImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-stone-100 px-4 text-center text-sm text-stone-500 ${className}`}
        role="img"
        aria-label={`تصویر ${alt} در دسترس نیست`}
      >
        تصویر در دسترس نیست
      </div>
    );
  }

  // Image hosts are supplied through the private sync API. A native image keeps
  // arbitrary remote URLs in the browser instead of proxying them through the server.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
