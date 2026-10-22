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
    <main className="gallery-shell min-h-screen overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#090909]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#top" className="group flex items-center gap-3" aria-label="ابتدای صفحه">
            <span className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/[0.04] transition-colors group-hover:border-white/30">
              <svg viewBox="0 0 24 24" className="size-4 text-white" aria-hidden="true">
                <path d="M5 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-medium tracking-tight text-white sm:text-base">
              گالری آثار
            </span>
          </a>
          {!unavailable && items.length > 0 ? (
            <a
              href="#collection"
              className="flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-white sm:text-sm"
            >
              <span>{new Intl.NumberFormat("fa-IR").format(items.length)} اثر</span>
              <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
                <path d="m5 8 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ) : null}
        </div>
      </header>

      <section id="top" className="relative mx-auto max-w-[90rem] px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:px-12 lg:pb-36 lg:pt-36">
        <div className="max-w-5xl">
          <div className="mb-7 flex items-center gap-3 text-xs font-medium tracking-[0.16em] text-white/45 sm:mb-9">
            <span className="h-px w-10 bg-white/25" />
            آرشیو تصویری
          </div>
          <h1 className="max-w-4xl text-[clamp(2.8rem,8vw,7.5rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-white">
            مجموعه‌ای برای
            <span className="block text-white/35">کشف جزئیات.</span>
          </h1>
          <div className="mt-10 flex max-w-2xl flex-col gap-7 border-r border-white/15 pr-5 sm:mt-14 sm:flex-row sm:items-end sm:justify-between sm:pr-7">
            <p className="max-w-lg text-sm leading-8 text-white/50 sm:text-base sm:leading-9">
              گزیده‌ای تصویری از آثار؛ هر قاب را باز کنید و جزئیات آن را در نمایی کامل و بدون حواس‌پرتی ببینید.
            </p>
          </div>
        </div>
      </section>

      <section id="collection" className="relative mx-auto max-w-[90rem] scroll-mt-20 px-5 pb-24 sm:px-8 sm:pb-32 lg:px-12 lg:pb-40">
        <div className="mb-8 flex items-end justify-between border-t border-white/10 pt-6 sm:mb-12 sm:pt-8">
          <div>
            <p className="mb-2 text-[0.68rem] font-medium tracking-[0.16em] text-white/35">COLLECTION</p>
            <h2 className="text-2xl font-medium tracking-tight text-white sm:text-3xl">مجموعه‌ی آثار</h2>
          </div>
          {!unavailable && items.length > 0 ? (
            <p className="hidden text-xs text-white/35 sm:block">برای نمایش کامل، روی هر اثر کلیک کنید</p>
          ) : null}
        </div>

        {unavailable ? (
          <div className="mx-auto max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.035] px-8 py-16 text-center">
            <div className="mx-auto mb-6 grid size-12 place-items-center rounded-full border border-white/10 text-white/50">!</div>
            <h2 className="text-lg font-medium text-white">گالری در دسترس نیست</h2>
            <p className="mt-3 text-sm leading-7 text-white/45">
              در حال حاضر امکان بارگذاری تصاویر وجود ندارد. لطفاً کمی بعد دوباره تلاش کنید.
            </p>
          </div>
        ) : items.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <GalleryGrid items={items} />
        )}
      </section>

      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-5 py-8 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span>آرشیو آنلاین آثار</span>
          <a href="#top" className="transition-colors hover:text-white">بازگشت به بالا ↑</a>
        </div>
      </footer>
    </main>
  );
}
