# المرحلة C — CDN + Redis + ضغط الصور

> تاريخ: 2026-07-15

---

## 1) ضغط صور التخزين (Laravel)

على السيرفر بعد `git pull` في `adminNewcar`:

```bash
cd /home/baitpait/public_html/adminNewcar

# معاينة
php artisan media:optimize-storage-images --dry-run --max-kb=150

# تنفيذ + نسخة .bak
php artisan media:optimize-storage-images --max-kb=150 --max-width=1600 --quality=78 --backup

php artisan optimize:clear
```

المجلدات الافتراضية: `banner`, `campaign-banners`, `product`, `product-brand`, `vehicle-brand`, `category`.

ملاحظة: بنرات الهيرو الحالية غالباً &lt;150KB؛ الأثقل غالباً `product/` و`campaign-banners/`.

---

## 2) كاش Apache لملفات `/storage`

أُضيف `storage/app/public/.htaccess` (يظهر عبر symlink كـ `public/storage/.htaccess`):

```
Cache-Control: public, max-age=2592000, stale-while-revalidate=86400
```

تحقق:

```bash
curl -sSI "https://admin.newcarpal.com/storage/banner/2026-07-10-6a512d6bb3c66.webp" | grep -i cache-control
```

إن لم يظهر الهيدر: تأكد أن Apache `AllowOverride` يتيح `Headers` لمجلد `public` / `storage`.

---

## 3) كاش `/_next/static` (المتجر)

مضاف في `next.config.ts` → `Cache-Control: public, max-age=31536000, immutable`.

يحتاج `npm run build` + `pm2 restart newcar-store`.

---

## 4) Redis كاش Laravel (موصى به)

### تثبيت سريع (Debian/Ubuntu)

```bash
apt-get update && apt-get install -y redis-server
systemctl enable --now redis-server
redis-cli ping   # PONG
```

### `.env` في adminNewcar

```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

ثم:

```bash
cd /home/baitpait/public_html/adminNewcar
php artisan optimize:clear
php artisan config:cache
```

إن فشل Redis، أعد `CACHE_DRIVER=file` فوراً.

---

## 5) Cloudflare CDN (موصى به للدومين العام)

1. أضف النطاق `newcarpal.com` إلى Cloudflare (DNS برتقالي / Proxied).  
2. قواعد كاش (Cache Rules):

| URI | إعداد |
|-----|--------|
| `newcarpal.com/_next/static/*` | Cache Everything · Edge TTL 1 month · Browser TTL 1 month |
| `admin.newcarpal.com/storage/*` | Cache Everything · Edge TTL 7–30 days |

3. اختياري: تفعيل **Polish** / **Mirage** للصور على `admin` إن كانت الخطة تدعم ذلك.

لا تفعّل كاش HTML لصفحات الحساب/الدفع.

---

## 6) مراقبة الأداء

PageSpeed (يدوياً في المتصفح — API قد يكون محدود الحصة):

- https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fnewcarpal.com%2Far&form_factor=mobile

من السيرفر:

```bash
curl -sSI https://newcarpal.com/ar | grep -iE 'cache-control|x-nextjs-cache'
curl -sS -o /dev/null -w "ttfb=%{time_starttransfer}s\n" https://newcarpal.com/ar
```
