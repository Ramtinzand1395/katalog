export function GalleryEmptyState() {
  return (
    <div className="mx-auto max-w-lg rounded-[2rem] border border-dashed border-white/15 bg-white/[0.02] px-8 py-20 text-center sm:py-28">
      <div
        className="mx-auto grid size-14 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/40"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="size-5">
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5zM4.5 16l4.1-4.1a1.5 1.5 0 0 1 2.1 0l1.8 1.8 1.1-1.1a1.5 1.5 0 0 1 2.1 0l3.8 3.8M15.5 9h.01" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mt-6 text-lg font-medium text-white">
        هنوز تابلویی اضافه نشده است
      </h2>
      <p className="mt-3 text-sm leading-7 text-white/40">
        تابلوهای جدید به‌زودی در این صفحه نمایش داده می‌شوند.
      </p>
    </div>
  );
}
