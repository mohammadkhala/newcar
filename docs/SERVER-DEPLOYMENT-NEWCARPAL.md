# توثيق سيرفر الإنتاج — NEW CAR / newcarpal.com

**آخر تحديث:** 2026-04-07  
**الغرض:** مرجع تشغيل وصيانة لبيئة **server1** (Webuzo + Apache) دون فقدان السياق بعد جلسة التشخيص والنشر.

---

## 1) ملخص تنفيذي (ماذا يعمل وأين)

| المكوّن | المسار على السيرفر | المستودع GitHub |
|--------|---------------------|-----------------|
| Laravel + API v1 (`/api/v1/...`) | `/home/baitpait/public_html/adminNewcar` | `https://github.com/baitpait/Newcaradmin.git` |
| متجر Next.js (واجهة الزبائن) | `/home/baitpait/public_html/newcarpal-store` | `https://github.com/baitpait/New-Stor.git` |

- **النطاق العام للمتجر:** `newcarpal.com` (واجهة تظهر في المتصفح غالباً عبر طبقة **nginx** أمام التطبيق؛ رأس الاستجابة قد يكون `Server: nginx`).
- **لوحة/ API الإدارة:** `admin.newcarpal.com` (Laravel).
- **Apache (Webuzo):** الجذر `HTTPD_ROOT=/usr/local/apps/apache2`، الإعداد الرئيسي: `/usr/local/apps/apache2/etc/httpd.conf`، يتضمن `Include etc/conf.d/*.conf`.
- **VirtualHosts المولّدة:** `/usr/local/apps/apache2/etc/conf.d/webuzoVH.conf` — **لا تُعدَّل يدوياً** (تُعاد توليدها).
- **تخصيص نطاق المتجر (المكان الصحيح للتعديل):**  
  `/var/webuzo-data/apache2/custom/domains/newcarpal.com.conf`

---

## 2) سلسلة الطلب: المتصفح → المتجر → Laravel

1. الزائر يضرب `https://newcarpal.com` (طبقة أمامية قد تكون nginx ثم Apache حسب Webuzo).
2. Apache (ملف `newcarpal.com.conf` المخصص) يعمل **reverse proxy** إلى الخلفية:  
   `ProxyPass / https://127.0.0.1:2003/` (مع استثناء `/.well-known`).
3. التطبيق على **2003** هو مسار التشغيل الفعلي للمتجر في هذا الإعداد (ليس بالضرورة 3000 في ملف Apache).
4. مسارات Next مثل `/api/auth/register` و`/api/bff/...` تستدعي من السيرفر Laravel عبر `NEXT_PUBLIC_API_BASE_URL` (يجب أن تكون قاعدة حتى `/api/v1`).

---

## 3) Apache — تمرير IP الزائر (معدّل 2026-04-07)

**الملف:** `/var/webuzo-data/apache2/custom/domains/newcarpal.com.conf`

محتوى مرجعي (إضافة الترويسات بعد `X-Forwarded-Proto`):

```apache
SSLProxyEngine on
SSLProxyVerify none
SSLProxyCheckPeerCN off
SSLProxyCheckPeerName off
ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto "https"
RequestHeader set X-Real-IP expr=%{REMOTE_ADDR}
RequestHeader set X-Forwarded-For expr=%{REMOTE_ADDR}

ProxyPass /.well-known !
ProxyPass / https://127.0.0.1:2003/
ProxyPassReverse / https://127.0.0.1:2003/
```

**التحقق وإعادة التحميل:**

```bash
sudo /usr/local/apps/apache2/bin/apachectl configtest
sudo /usr/local/apps/apache2/bin/apachectl graceful
```

**ملاحظة:** أوامر `proxy_set_header` خاصة بـ **nginx**؛ على Apache تُستخدم `RequestHeader` كما فوق. لا تُنفَّذ في الطرفية كأوامر shell.

---

## 4) Laravel (adminNewcar)

### متغيرات وثقة البروكسي

- ملف: `config/trustedproxy.php` — يقرأ `TRUSTED_PROXIES` من `.env` (افتراضي `127.0.0.1,::1`).
- إذا كان Next أو طبقة أخرى تتصل بـ `admin.newcarpal.com` من IP غير loopback، أضف ذلك الـ IP إلى `TRUSTED_PROXIES` حتى يُعتمد `X-Forwarded-For` في حدود الطلبات.

### حد الطلبات (Rate limit)

- مجموعة API العامة: `throttle:300,1` في `bootstrap/app.php`.
- مجموعة `auth`: `throttle:120,1` في `routes/api/v1/api.php`.

### Passport — مفاتيح OAuth (خطأ شائع)

- الملفات: `storage/oauth-private.key` و `storage/oauth-public.key`.
- **لا** تترك الملكية `root:root` مع `600` إن كان PHP/Apache يعمل كمستخدم آخر → Laravel يسجّل:  
  `Key path ... oauth-private.key does not exist or is not readable` عند `createToken` (تسجيل، دخول، …).
- **إصلاح نموذجي:**

```bash
# إن كان PHP كـ baitpait:
sudo chown baitpait:baitpait storage/oauth-private.key storage/oauth-public.key
sudo chmod 600 storage/oauth-private.key
sudo chmod 644 storage/oauth-public.key

# أو إن كان المجموعة nobody (مثال Webuzo):
sudo chown baitpait:nobody storage/oauth-private.key storage/oauth-public.key
sudo chmod 640 storage/oauth-private.key storage/oauth-public.key
```

- توليد المفاتيح يُفضَّل كمستخدم المشروع:

```bash
sudo -u baitpait php artisan passport:keys
```

- التحقق من عملاء Passport:

```bash
php artisan tinker --execute="echo \Illuminate\Support\Facades\DB::table('oauth_clients')->count();"
```

توقّع على الأقل **2** (Personal + Password) بعد التهيئة الصحيحة.

### إصلاحات API مرتبطة بهذه الجلسة (مرجع كود)

- فلتر الفئات في البحث: `Helpers::applyProductCategoryIdsFilter` — مطابقة `category_ids` عبر `LIKE` بمعرّفات رقمية موجبة (تفادي أعطال SQL/JSON على عمود VARCHAR).
- `Helpers::apply_user_type_prices_to_products`: `try/catch` حول `auth('api')->user()` لتفادي سقوط واجهات عامة عند مفاتيح Passport غير صالحة مؤقتاً.

بعد أي سحب:

```bash
cd /home/baitpait/public_html/adminNewcar
git pull origin main
php artisan optimize:clear
```

---

## 5) متجر Next (newcarpal-store)

### متطلبات

- **Node.js ≥ 20.9** (المشروع يحدد `>=20`). على السيرفر: **nvm** تحت مستخدم `baitpait`، مثلاً `nvm use 20`.

### Git

- تشغيل `git` كـ **root** داخل مجلد مملوك لـ `baitpait` يظهر **dubious ownership**؛ الأفضل:

```bash
sudo -u baitpait bash -lc 'cd /home/baitpait/public_html/newcarpal-store && git pull origin main'
```

أو إضافة safe.directory لـ root إن اضطررت (أقل تفضيلاً).

### بناء ونشر

```bash
sudo -u baitpait bash -lc 'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20; cd /home/baitpait/public_html/newcarpal-store && npm ci && npm run build'
sudo -u baitpait bash -lc 'pm2 restart newcarpal-store'
```

- **PM2:** يجب أن توجد **عملية واحدة** بنفس الاسم لتفادي `EADDRINUSE` على المنفذ. بعد التكرار: `pm2 delete` للمكرر ثم `pm2 save`.

### BFF و Auth (توثيق سلوك)

- `app/api/bff/[[...path]]/route.ts` و`app/api/auth/register` و`login` يمرّرون IP العميل عبر `lib/laravel-forward-headers.ts` إلى Laravel لتحسين الـ throttling لكل زائر.
- مسار التسجيل يلتقط فشل `fetch` إلى Laravel ويعيد JSON واضحاً بدل سقوط Next بـ 500 صامت.

---

## 6) أعطال تم تشخيصها في الجلسة (مرجع سريع)

| العرض | السبب | الإجراء |
|--------|--------|---------|
| 500 على `/_next/static/...` من Next | لا يوجد `.next` كامل بعد `build` أو عملية قديمة على نفس المنفذ | `rm -rf .next && npm run build` كـ baitpait + Node 20؛ إيقاف العملية القديمة ثم `pm2 start` |
| 500 على `products/search` | أخطاء SQL/Passport سابقة؛ ثم Passport keys | إصلاح الفلتر في الكود؛ مفاتيح oauth + صلاحيات الملفات |
| 429 على API / BFF | نفس IP لكل الطلبات (BFF من السيرفر) + حد 60/دقيقة سابق | رفع الحد؛ تمرير `X-Forwarded-For`؛ `TRUSTED_PROXIES` |
| 500 تسجيل | `oauth-private.key` غير مقروء لـ PHP | `chown`/`chmod` كما في §4 |
| 403 تسجيل | تحقق Laravel (هاتف/بريد مكرر، إلخ) | قراءة جسم JSON في Network |
| `curl https://127.0.0.1` SSL error | المنفذ المحلي ليس HTTPS كما توقّعته | اختبار بـ `curl -I https://newcarpal.com/` |

---

## 7) أوامر تشخيص مفيدة

```bash
# من يستخدم المنفذ 3000 أو 2003 (حسب إعدادك)
sudo ss -tlnp | grep -E ':3000|:2003'

# سجل Laravel
tail -n 100 /home/baitpait/public_html/adminNewcar/storage/logs/laravel.log

# سجلات المتجر
sudo -u baitpait pm2 logs newcarpal-store --lines 50
```

---

## 8) ختام جلسة التوثيق (2026-04-07)

- تم توثيق مسارات المشروع على السيرفر، Apache/Webuzo، البروكسي إلى المنفذ **2003**، ترويسات IP، Laravel (Passport، throttling، trusted proxy)، وNext (Node 20، nvm، PM2، Git).
- أي تغيير لاحق يُفضَّل تسجيله هنا مع تاريخ في أعلى الملف أو بجانب القسم.

**هذا الملف موجود في مستودع المتجر:** `docs/SERVER-DEPLOYMENT-NEWCARPAL.md` — يُرفع مع **New-Stor** عند `git push`.
