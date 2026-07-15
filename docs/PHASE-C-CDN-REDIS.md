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

## 4) Redis كاش Laravel (اختياري — فقط إذا نجح فحص الامتداد)

> **حالة الإنتاج (2026-07-15):** بقي على `CACHE_DRIVER=file` بعد فشل سابق
> (`Class "Redis" not found`). لا تفعّل Redis قبل تثبيت `php-redis`.

### مسار آمن (نسخ ولصق على السيرفر كـ root)

```bash
# 1) Redis server
apt-get update && apt-get install -y redis-server
systemctl enable --now redis-server
redis-cli ping   # يجب: PONG

# 2) امتداد PHP (عدّل 8.2 حسب php -v)
PHP_VER=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')
apt-get install -y "php${PHP_VER}-redis" || apt-get install -y php-redis
phpenmod redis 2>/dev/null || true
# إن لزم: أعد تشغيل php-fpm
systemctl restart "php${PHP_VER}-fpm" 2>/dev/null || systemctl restart php-fpm 2>/dev/null || true

php -m | grep -i redis   # يجب أن يظهر redis
```

### تفعيل فقط بعد ظهور `redis` في `php -m`

في `/home/baitpait/public_html/adminNewcar/.env`:

```env
CACHE_DRIVER=redis
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

```bash
cd /home/baitpait/public_html/adminNewcar
rm -f bootstrap/cache/config.php
php artisan optimize:clear
php artisan config:cache
php artisan tinker --execute="echo config('cache.default').PHP_EOL; Cache::put('nc_ping','ok',60); echo Cache::get('nc_ping');"
```

المتوقع: `redis` ثم `ok`.

إن فشل أي خطوة: أعد فوراً `CACHE_DRIVER=file` ثم `config:cache`.

---

## 5) Cloudflare CDN (يتطلب حسابكم + تغيير DNS — لا يُنفَّذ من الكود)

> **فحص حي (2026-07-15):** الاستجابات من `Server: Apache` بدون `cf-ray`
> → النطاق **ليس** خلف Cloudflare حالياً. التفعيل يحتاج نقل DNS عند المسجّل.

1. أنشئ موقعاً في Cloudflare لـ `newcarpal.com` و`www`.  
2. انقل Nameservers عند المسجّل إلى Cloudflare.  
3. سجّل DNS: `@` و`www` → IP السيرفر (**Proxied / سحابة برتقالية**).  
4. `admin.newcarpal.com` → نفس الـ IP (Proxied إن أردت كاش `/storage`).  
5. SSL/TLS: **Full (strict)** بعد شهادة صالحة على Apache.  
6. قواعد كاش (Cache Rules):

| URI | إعداد |
|-----|--------|
| `newcarpal.com/_next/static/*` | Cache Everything · Edge TTL 1 month · Browser TTL 1 month |
| `admin.newcarpal.com/storage/*` | Cache Everything · Edge TTL 7–30 days |

7. **لا** تكش HTML لـ `/account/*` أو `/shop/checkout*`.

تحقق بعد التفعيل: `curl -sSI https://newcarpal.com/ar | grep -i cf-ray`

---

## 5b) تنظيف أسماء صور فئات مكسورة (اختياري — DB)

أربع فئات تشير لملفات غير موجودة (`category-*-thumb.png`). المتجر يتجاهلها بعد إصلاح `category-image.ts`. لتنظيف الأدمن/API أيضاً:

```sql
UPDATE categories
SET image = NULL, updated_at = NOW()
WHERE image IN (
  'category-1-thumb.png',
  'category-22-thumb.png',
  'category-26-thumb.png',
  'category-30-thumb.png'
);
```

---

## 6) مراقبة الأداء

PageSpeed (يدوياً في المتصفح — API قد يكون محدود الحصة):

- https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fnewcarpal.com%2Far&form_factor=mobile

من السيرفر:

```bash
curl -sSI https://newcarpal.com/ar | grep -iE 'cache-control|x-nextjs-cache'
curl -sS -o /dev/null -w "ttfb=%{time_starttransfer}s\n" https://newcarpal.com/ar
```
