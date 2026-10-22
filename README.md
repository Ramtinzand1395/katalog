# Kerman Atari Gallery

یک کاتالوگ مستقل و سبک برای نمایش تابلوهای کرمان آتاری. داده‌ها مستقیماً و به‌صورت دستی در MongoDB Atlas وارد می‌شوند و برنامه فقط آن‌ها را می‌خواند.

## ساختار داده

نام دیتابیس پیش‌فرض `kermanatari_gallery` و نام collection برابر `gallery_items` است. فایل JSON قابل import باید آرایه‌ای با این ساختار باشد:

```json
[
  {
    "name": "تست تابلو gta",
    "images": [
      "https://res.cloudinary.com/example/image/upload/front.png",
      "https://res.cloudinary.com/example/image/upload/side.png"
    ]
  }
]
```

MongoDB هنگام import فیلد `_id` را خودکار می‌سازد؛ نیازی نیست آن را در JSON قرار دهید. تصویر اول هر آرایه روی کارت نمایش داده می‌شود و همهٔ تصاویر در پیش‌نمایش قابل ورق‌زدن هستند.

قواعد داده:

- `name` باید یک رشتهٔ غیرخالی باشد.
- `images` باید حداقل یک URL معتبر `http` یا `https` داشته باشد.
- URLهای تکراری حذف و URLهای نامعتبر نادیده گرفته می‌شوند.
- رکورد ناقص یا رکوردی که تصویر معتبر ندارد در صفحه نشان داده نمی‌شود.

## ورود دستی در MongoDB Atlas

1. در Atlas دیتابیس `kermanatari_gallery` را بسازید.
2. collection با نام `gallery_items` بسازید.
3. از بخش **Add Data → Import JSON or CSV file** فایل JSON را وارد کنید.
4. حالت فایل را JSON array انتخاب کنید.
5. پس از پایان import، سایت را باز کنید. به‌علت cache ممکن است نمایش تغییرات حداکثر ۶۰ ثانیه زمان ببرد.

اگر نسخهٔ قبلی برنامه قبلاً به همین collection متصل شده بود، در تب **Indexes** بررسی کنید که ایندکس قدیمی `sourceId_1` وجود نداشته باشد. آن ایندکس برای ساختار جدید لازم نیست و چون رکوردهای دستی `sourceId` ندارند، باید پیش از ورود چند رکورد حذف شود.

## اجرای محلی

به Node.js 22 یا جدیدتر نیاز دارید.

```bash
npm install
cp .env.example .env.local
npm run dev
```

فایل `.env.local`:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=kermanatari_gallery
```

این مقادیر نباید با `NEXT_PUBLIC_` شروع شوند و فایل `.env.local` نباید در Git ذخیره شود.

## استقرار در Vercel

1. پوشهٔ `kermanatari-gallery` را به‌عنوان یک repository مستقل در GitHub قرار دهید.
2. آن را در یک Vercel Project جدید import کنید.
3. متغیرهای `MONGODB_URI` و `MONGODB_DB_NAME` را برای Production و Preview تنظیم کنید.
4. دسترسی شبکهٔ Atlas را برای Vercel مجاز و deploy را اجرا کنید.

## بررسی کیفیت

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

تصاویر مستقیماً در مرورگر بارگذاری می‌شوند. اگر یک تصویر بعداً از دسترس خارج شود، یک placeholder فارسی جای آن نمایش داده می‌شود.
