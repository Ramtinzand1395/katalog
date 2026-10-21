# Kerman Atari Gallery

یک کاتالوگ مستقل و سبک برای نمایش تابلوهای کرمان آتاری. این پروژه فقط نام و تصویر تابلوهای قابل نمایش را نشان می‌دهد و هیچ وابستگی اجرایی به وب‌سایت اصلی ندارد.

## معماری

- Next.js App Router و TypeScript
- Tailwind CSS
- MongoDB Atlas با درایور رسمی MongoDB
- یک endpoint نوشتنی: `POST /api/sync`
- مجموعهٔ مستقل `gallery_items` با ایندکس یکتا روی `sourceId`
- رندر سمت سرور، cache دادهٔ ۶۰ ثانیه‌ای و بازاعتبارسنجی فوری پس از همگام‌سازی

## اجرای محلی

به Node.js 22 یا جدیدتر نیاز دارید.

```bash
npm install
cp .env.example .env.local
npm run dev
```

متغیرهای `.env.local` را مقداردهی کنید:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=kermanatari_gallery
GALLERY_SYNC_API_KEY=یک-کلید-تصادفی-قوی
```

هیچ‌یک از این متغیرها نباید با `NEXT_PUBLIC_` شروع شوند. فایل‌های `.env.local` در Git ذخیره نمی‌شوند.

## قرارداد API

تمام درخواست‌ها باید هدر زیر را داشته باشند:

```http
Authorization: Bearer YOUR_SECRET_KEY
Content-Type: application/json
```

### Upsert

```bash
curl -X POST 'http://localhost:3000/api/sync' \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json' \
  --data '{
    "action": "upsert",
    "item": {
      "sourceId": "wall-art-123",
      "name": "تابلو The Last of Us",
      "imageUrl": "https://example.com/art.webp",
      "images": ["https://example.com/art.webp"],
      "sortOrder": 1,
      "isVisible": true
    }
  }'
```

### Delete

حذف شناسه‌ای که وجود ندارد نیز با وضعیت موفق پاسخ داده می‌شود و `deleted` برابر `false` است.

```bash
curl -X POST 'http://localhost:3000/api/sync' \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json' \
  --data '{"action":"delete","sourceId":"wall-art-123"}'
```

### Replace all

کل payload پیش از هر تغییری اعتبارسنجی می‌شود. جایگزینی در یک transaction انجام می‌شود و شناسه‌های تکراری رد می‌شوند.

```bash
curl -X POST 'http://localhost:3000/api/sync' \
  -H 'Authorization: Bearer YOUR_SECRET_KEY' \
  -H 'Content-Type: application/json' \
  --data '{
    "action": "replace_all",
    "items": [
      {
        "sourceId": "wall-art-123",
        "name": "تابلو The Last of Us",
        "imageUrl": "https://example.com/art.webp",
        "images": [],
        "sortOrder": 1,
        "isVisible": true
      }
    ]
  }'
```

برای پاک‌کردن عمدی کل کاتالوگ باید صریحاً `allowEmpty` ارسال شود:

```json
{ "action": "replace_all", "items": [], "allowEmpty": true }
```

### محدودیت اندازهٔ درخواست

این برنامه payload را به **۴ MiB** محدود می‌کند تا پایین‌تر از محدودیت ۴٫۵ MB بدنهٔ Vercel Functions باقی بماند. `replace_all` فقط زمانی مناسب است که JSON کامل در این حد جا شود. برای کاتالوگ بزرگ‌تر، رکوردها را با درخواست‌های `upsert` همگام کنید؛ تصویرها هرگز داخل payload قرار نمی‌گیرند و فقط URL ذخیره می‌شود.

## MongoDB Atlas مستقل

1. در Atlas یک project یا cluster جدا از وب‌سایت اصلی بسازید.
2. یک database user با دسترسی فقط به دیتابیس `kermanatari_gallery` ایجاد کنید.
3. دسترسی شبکه را برای Vercel تنظیم کنید. از قرار دادن رمز عبور در کد یا Git خودداری کنید.
4. connection string را در `MONGODB_URI` قرار دهید.
5. Atlas clusterها replica set هستند و transaction موردنیاز `replace_all` را پشتیبانی می‌کنند.

ایندکس یکتای `sourceId` در نخستین اتصال برنامه به‌صورت خودکار ساخته می‌شود.

## استقرار مستقل در Vercel

1. یک repository جدید GitHub فقط برای محتوای همین پوشه، مثلاً `kermanatari-gallery`، بسازید.
2. repository را در یک Project جدید Vercel وارد کنید؛ آن را به پروژهٔ وب‌سایت اصلی متصل نکنید.
3. سه متغیر `MONGODB_URI`، `MONGODB_DB_NAME` و `GALLERY_SYNC_API_KEY` را برای Production و Preview تنظیم کنید. URI و کلید API را از نوع Secret نگه دارید.
4. deploy را اجرا کنید. Vercel به‌صورت خودکار Next.js و Route Handler را تشخیص می‌دهد.
5. یکی از درخواست‌های curl بالا را با دامنهٔ deployment اجرا کنید.
6. صفحهٔ اصلی را باز کنید و نام و تصویر رکورد همگام‌شده را بررسی کنید.

نام پیشنهادی پروژه: `kermanatari-gallery` و دامنهٔ پیشنهادی: `kermanatari-gallery.vercel.app`.

## بررسی کیفیت

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

تست‌های API ایجاد، به‌روزرسانی، حذف موجود و ناموجود، جایگزینی کامل، جلوگیری از شناسهٔ تکراری، جلوگیری از حذف تصادفی کاتالوگ خالی، احراز هویت، payload نامعتبر، محدودیت اندازه و خطای دیتابیس را پوشش می‌دهند. حالت خالی و قرارداد شبکهٔ واکنش‌گرا نیز تست می‌شوند. برای تست یکپارچهٔ واقعی transaction، یک Atlas database آزمایشی جداگانه به `.env.local` وصل کنید و درخواست‌های بالا را اجرا کنید.

## رفتار خطا و تصاویر

- جزئیات خطای MongoDB هیچ‌گاه در پاسخ API ارسال نمی‌شود.
- فقط URLهای `http` و `https` پذیرفته می‌شوند.
- چون میزبان تصویر از طریق API خصوصی و به‌صورت پویا تعیین می‌شود، تصویر مستقیماً در مرورگر بارگذاری می‌شود و از سرور Next.js عبور نمی‌کند؛ این کار خطر proxy کردن URL دلخواه را حذف می‌کند.
- تصویر خراب با یک placeholder فارسی جایگزین می‌شود.
