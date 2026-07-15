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

### المرحلة B — التالية (كود)

1. تقسيم الصفحة بـ `Suspense` (Hero أولاً، أسفل الصفحة لاحقاً)  
2. Endpoint Laravel واحد `GET /nav/mega` بدل childes المتكررة  
3. تصغير استجابة `config` أو تقسيمها  
4. `optimizePackageImports` وكاش BFF للـ GET العامة  

### المرحلة C — سيرفر / محتوى

1. إعادة ضغط بنرات الهيرو (&lt;150KB)  
2. CDN لـ `/storage` و`/_next/static`  
3. Redis كاش على Laravel للفئات والماركات  
4. مراقبة: PageSpeed Mobile بعد النشر  

---

## نشر السيرفر

```bash
sudo -u baitpait bash -lc 'cd /home/baitpait/public_html/newcarpal-store && git pull origin main'
sudo -u baitpait bash -lc 'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20; cd /home/baitpait/public_html/newcarpal-store && npm ci && npm run build'
sudo -u baitpait pm2 restart newcar-store
```

## تحقق بعد النشر

```bash
curl -sSI https://newcarpal.com/ar | grep -i cache-control
# يُفضَّل ألا يكون no-store دائماً للزائر العام

curl -sS -o /dev/null -w "ttfb=%{time_starttransfer}s total=%{time_total}s\n" https://newcarpal.com/ar
```

هدف المرحلة A: انخفاض TTFB عند الزيارات الدافئة + انخفاض عدد طلبات Laravel للهيدر + أخف لصور الهيرو.
