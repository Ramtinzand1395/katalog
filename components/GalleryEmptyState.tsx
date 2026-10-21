export function GalleryEmptyState() {
  return (
    <div className="mx-auto max-w-md py-20 text-center sm:py-28">
      <div
        className="mx-auto grid size-16 place-items-center rounded-full bg-stone-100 text-2xl"
        aria-hidden="true"
      >
        ◇
      </div>
      <h2 className="mt-5 text-lg font-semibold text-stone-900">
        هنوز تابلویی اضافه نشده است
      </h2>
      <p className="mt-2 text-sm leading-7 text-stone-500">
        تابلوهای جدید به‌زودی در این صفحه نمایش داده می‌شوند.
      </p>
    </div>
  );
}
