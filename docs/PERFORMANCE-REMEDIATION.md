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

### المرحلة C — التالية (سيرفر / محتوى)

1. إعادة ضغط بنرات الهيرو (&lt;150KB)  
2. CDN لـ `/storage` و`/_next/static`  
3. Redis كاش على Laravel للفئات والماركات  
4. مراقبة: PageSpeed Mobile بعد النشر  

---

## نشر السيرفر

### المتجر

```bash
sudo -u baitpait bash -lc 'cd /home/baitpait/public_html/newcarpal-store && git pull origin main'
sudo -u baitpait bash -lc 'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20; cd /home/baitpait/public_html/newcarpal-store && npm ci && npm run build'
sudo -u baitpait pm2 restart newcar-store
```

### Laravel (mega-nav)

```bash
cd /home/baitpait/public_html/adminNewcar
git pull origin main
php artisan optimize:clear
```

تحقق:

```bash
curl -sS "https://admin.newcarpal.com/api/v1/categories/mega-nav" -H "X-localization: ar" | head -c 200
curl -sSI https://newcarpal.com/ar | grep -iE 'cache-control|x-nextjs-cache'
```
