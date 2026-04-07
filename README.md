# New-Stor — واجهة المتجر (Next.js)

متجر الزبائن لـ **New Car**، مبني على **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4** + **next-intl** (عربي / إنجليزي / عبري).

**المستودع:** [github.com/baitpait/New-Stor](https://github.com/baitpait/New-Stor)

الخلفية (Laravel + Passport + API `v1`) تعمل منفصلة؛ هذا المشروع يستهلك الـ API فقط عبر `NEXT_PUBLIC_API_BASE_URL`.

---

## المتطلبات

- **Node.js 20+** (يُفضّل LTS الحالي)
- **npm** (أو `pnpm` / `yarn` مع تعديل الأوامر)

---

## التطوير المحلي

```bash
npm install
cp .env.local.example .env.local
```

عدّل `.env.local` واضبط `NEXT_PUBLIC_API_BASE_URL` على قاعدة الـ API كاملة حتى `/api/v1`، مثال:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

```bash
npm run dev
```

يفتح التطبيق على [http://localhost:3000](http://localhost:3000) (أو المنفذ الذي يعرضه Next).

---

## النشر على السيرفر (VPS / Node)

### 1) متغيرات البيئة (مهم جداً)

متغيرات `NEXT_PUBLIC_*` تُدمَج في **وقت البناء** (`npm run build`). غيابها أو خطأها يعني واجهة بدون API.

على السيرفر أنشئ ملف بيئة (مثلاً `.env.production` أو `.env.local`) **قبل** البناء:

| المتغير | وصف |
|--------|-----|
| `NEXT_PUBLIC_API_BASE_URL` | إلزامي. مثال: `https://your-admin-domain.com/api/v1` (بدون شرطة مائلة أخيرة اختياري؛ الكود يطبّع المسار). |
| `NEXT_PUBLIC_SITE_URL` | اختياري. رابط المتجر العلني لـ Open Graph و`metadataBase` وPWA (مثال: `https://store.yourdomain.com`). |

### 2) CORS على Laravel

في `.env` الخاص بلوحة Laravel / الـ API، تأكد أن `CORS_ALLOWED_ORIGINS` يتضمن **أصل المتجر** (البروتوكول + الدومين + المنفذ إن وُجد)، مثال:

```env
CORS_ALLOWED_ORIGINS=https://store.yourdomain.com,https://www.store.yourdomain.com
```

ثم على الخادم:

```bash
php artisan optimize:clear
```

### 3) بناء وتشغيل الإنتاج

```bash
cd /path/to/New-Stor   # جذر مستنسخ المستودع
npm ci
npm run build
npm run start
```

افتراضياً `next start` يستمع على المنفذ **3000**. خلف **Nginx** أو **Caddy** كـ reverse proxy مع TLS.

مثال موجز لـ Nginx (استبدل الدومين والمسار):

```nginx
server {
    server_name store.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4) تشغيل دائم (اختياري)

استخدم **systemd** أو **PM2** لتشغيل `npm run start` بعد إعادة التشغيل. عند كل نشر جديد: سحب الكود، `npm ci`, `npm run build`, إعادة تشغيل العملية.

---

## أوامر مفيدة

| الأمر | الغرض |
|--------|--------|
| `npm run lint` | ESLint |
| `npm run build` | بناء إنتاج |
| `npm run start` | تشغيل بعد البناء |
| `npm run verify-api-localization` | تحقق اختياري من ترويسة `X-localization` للـ API |

---

## هيكل مرتبط بالتكامل

- `lib/api.ts` — جلب من الخادم (مع `revalidate` حيث ينطبق).
- `lib/client-api.ts` — جلب من المتصفح (فلاتر المركبة وغيرها عبر CORS).
- `public/logo.png` — شعار المتجر.

لمزيد من تخطيط المنتج والـ IA راجع مستودع المشروع الأوسع: `store/STORE-MASTER-PLAN.md` إن وُجد ضمن نسختك المحلية للمونوريبو.

---

## الترخيص

خاص بالمشروع (Private) ما لم يُحدَّد غير ذلك في المستودع.
