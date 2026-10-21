import { connection } from "next/server";

import { GalleryEmptyState } from "@/components/GalleryEmptyState";
import { GalleryGrid } from "@/components/GalleryGrid";
import { listVisibleGalleryItems } from "@/lib/gallery-repository";
import type { PublicGalleryItem } from "@/models/GalleryItem";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connection();

  let items: PublicGalleryItem[] = [];
  let unavailable = false;

  try {
    items = await listVisibleGalleryItems();
  } catch (error) {
    unavailable = true;
    console.error("The public gallery could not be loaded.", error);
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-amber-700">
              KERMAN ATARI
            </p>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
              کاتالوگ تابلوهای کرمان آتاری
            </h1>
          </div>
          {!unavailable && items.length > 0 ? (
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-600 sm:text-sm">
              {new Intl.NumberFormat("fa-IR").format(items.length)} تابلو
            </span>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        {unavailable ? (
          <div className="mx-auto max-w-md rounded-2xl border border-rose-100 bg-rose-50 px-6 py-10 text-center">
            <h2 className="text-base font-semibold text-stone-900">گالری در دسترس نیست</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              در حال حاضر امکان بارگذاری تصاویر وجود ندارد. لطفاً کمی بعد دوباره تلاش کنید.
            </p>
          </div>
        ) : items.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <GalleryGrid items={items} />
        )}
      </section>
    </main>
  );
}
