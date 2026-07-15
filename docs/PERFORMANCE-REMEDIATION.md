# خطة علاجية لأداء المتجر (newcarpal.com)

> **تاريخ البدء:** 2026-07-15  
> **المصدر:** تقرير فحص `/ar` (TTFB مرتفع، 250 طلب شبكة، no-store، fan-out API)

---

## التشخيص المختصر

| السبب | الأثر |
|--------|--------|
| `cookies()` في الهيدر → `Cache-Control: no-store` | كل زيارة SSR كامل |
| شجرة ميجا-منيو بعمق 3 (عشرات childes) | TTFB يتضخم |
| 3× `products/search` على SSR | أبطأ endpoint ~1.8s |
| صور `img` / `unoptimized` + بنرات ضخمة | بطء بعد الرسم على الموبايل |

---

## المراحل

### المرحلة A — نُفّذت في الكود (هذه الجلسة)

1. **كاش ميجا-منيو** — `lib/featured-nav.ts` عبر `unstable_cache` (600s) + عمق 2 بدل 3  
2. **فصل المصادقة عن SSR** — الهيدر لا يستدعي `cookies()`؛ العميل يقرأ `/api/auth/session`  
3. **SSR تبويب واحد** لمنتجات «لكم» (best_selling)؛ التبويبات الأخرى تُحمَّل عند الاختيار  
4. **Hero بـ next/image** + `priority` للأولى + تحميل الشرائح القريبة فقط  
5. **إزالة `unoptimized`** من بنرات الحملة وماركات الصفحة الرئيسية  
6. **`revalidate = 60`** على الصفحة الرئيسية + رفع TTLs لـ config/banners/categories  

### المرحلة B — نُفّذت (2026-07-15)

1. **Suspense:** `HomeBelowFold` — Hero + ثقة + فئات أولاً؛ منتجات/ماركات/خدمات لاحقاً  
2. **Laravel `GET /api/v1/categories/mega-nav`** — شجرة عمق 2 في طلب واحد (مع fallback للـ childes)  
3. **إزالة `fetchConfig` من الرئيسية** — العملة عبر `NEXT_PUBLIC_CURRENCY_CODE` أو `ILS`  
4. **BFF:** كاش 60s لـ GET العامة (بدون توكن) + `optimizePackageImports`  

### المرحلة C — جاهزة للتنفيذ على السيرفر (2026-07-15)

التفاصيل الكاملة: **`docs/PHASE-C-CDN-REDIS.md`**

1. أمر Laravel `media:optimize-storage-images` لضغط الصور &gt;150KB  
2. `.htaccess` كاش طويل لـ `/storage` + headers لـ `/_next/static`  
3. دليل تفعيل **Redis** + **Cloudflare**  
4. روابط مراقبة PageSpeed  

---

## نشر السيرفر

### Laravel (+ ضغط صور + كاش storage)

```bash
cd /home/baitpait/public_html/adminNewcar
git pull origin main
php artisan media:optimize-storage-images --dry-run --max-kb=150
php artisan media:optimize-storage-images --max-kb=150 --max-width=1600 --quality=78 --backup
php artisan optimize:clear
```

### المتجر (كاش _next/static)

```bash
sudo -u baitpait bash -lc 'cd /home/baitpait/public_html/newcarpal-store && git pull origin main'
sudo -u baitpait bash -lc 'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20; cd /home/baitpait/public_html/newcarpal-store && npm ci && npm run build'
sudo -u baitpait pm2 restart newcar-store
```

تحقق:

```bash
curl -sSI https://newcarpal.com/ar | grep -iE 'cache-control|x-nextjs-cache'
curl -sSI "https://admin.newcarpal.com/storage/banner/2026-07-10-6a512d6bb3c66.webp" | grep -i cache-control
```
