# توثيق سيرفر الإنتاج — NEW CAR / newcarpal.com

**آخر تحديث:** 2026-04-08  
**الغرض:** مرجع تشغيل وصيانة لبيئة **server1** (Webuzo + Apache) دون فقدان السياق بعد جلسة التشخيص والنشر.

---

## 1) ملخص تنفيذي (ماذا يعمل وأين)

| المكوّن | المسار على السيرفر | المستودع GitHub |
|--------|---------------------|-----------------|
| Laravel + API v1 (`/api/v1/...`) | `/home/baitpait/public_html/adminNewcar` | `https://github.com/baitpait/Newcaradmin.git` |
| متجر Next.js (واجهة الزبائن) | `/home/baitpait/public_html/newcarpal-store` | `https://github.com/baitpait/New-Stor.git` |

- **النطاق العام للمتجر:** `https://newcarpal.com` — على **server1** الطبقة التي تستمع على **80/443** هي **Apache (`httpd`)**، وليست nginx كـ front للنطاقات (قد يظهر `Server: nginx` في اختبارات خارجية إن وُجدت طبقة CDN/بروكسي أمامية منفصلة).
- **Next.js في الإنتاج:** يعمل عبر **PM2** ويستمع على **`0.0.0.0:3000`** (`next start`). التأكيد: `ss -tlnp | grep 3000`.
- **المنفذ 2003 على نفس السيرفر:** **nginx تابع لـ Webuzو** — يعرض **لوحة تحكم Webuzو** (PHP، كوكي `SOFTCookies…`، توجيه `index.php?act=login`). **ليس** منفذ المتجر.
- **لوحة الإدارة (Laravel):** `admin.newcarpal.com`.
- **Apache (Webuzo):** `HTTPD_ROOT=/usr/local/apps/apache2`، الإعداد الرئيسي: `/usr/local/apps/apache2/etc/httpd.conf`، يتضمن `Include etc/conf.d/*.conf`.
- **VirtualHosts المولّدة:** `/usr/local/apps/apache2/etc/conf.d/webuzoVH.conf` — **لا تُعدَّل يدوياً** (تُعاد توليدها).
- **تخصيص نطاق المتجر (المكان الصحيح للتعديل):**  
  `/var/webuzo-data/apache2/custom/domains/newcarpal.com.conf`

---

## 2) سلسلة الطلب: المتصفح → المتجر → Laravel

1. الزائر يضرب `https://newcarpal.com`.
2. **Apache** (تضمين `IncludeOptional …/newcarpal.com.conf` داخل الـ vhost في `webuzoVH.conf`) يعمل **reverse proxy** إلى **Next**:  
   **`ProxyPass / http://127.0.0.1:3000/`** مع استثناء **`/.well-known`** (شهادات ACME).
3. **لا** تُوجَّه جذور المتجر إلى **`https://127.0.0.1:2003/`** — ذلك يمرّر الزوار إلى **واجهة تسجيل دخول Webuzو** بدل المتجر (انظر §9).
4. مسارات Next مثل `/api/auth/register` و`/api/bff/...` تستدعي Laravel من السيرفر عبر `NEXT_PUBLIC_API_BASE_URL` (قاعدة حتى `/api/v1`).

---

## 3) Apache — إعداد البروكسي لـ newcarpal.com (صحيح من 2026-04-08)

**الملف:** `/var/webuzo-data/apache2/custom/domains/newcarpal.com.conf`

**المرجع المعتمد:** بروكسي إلى **HTTP** على **3000** (Next). **لا** تُستخدم أسطر `SSLProxy*` هنا لأن الخلفية ليست `https://` على 2003.

```apache
ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto "https"

ProxyPass /.well-known !
ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
RequestHeader set X-Real-IP expr=%{REMOTE_ADDR}
RequestHeader set X-Forwarded-For expr=%{REMOTE_ADDR}
```

**قبل التعديل (خطأ تشغيلي):** كان الملف يحتوي `ProxyPass / https://127.0.0.1:2003/` + `SSLProxyEngine on` — وهذا يوجّه النطاق العام إلى **لوحة Webuzو** على 2003.

**التحقق وإعادة التحميل:**

```bash
sudo cp -a /var/webuzo-data/apache2/custom/domains/newcarpal.com.conf \
  /var/webuzo-data/apache2/custom/domains/newcarpal.com.conf.bak-$(date +%Y%m%d)
sudo /usr/local/apps/apache2/bin/apachectl configtest
sudo /usr/local/apps/apache2/bin/apachectl graceful
```

**ملاحظة:** `proxy_set_header` خاصة بـ **nginx**؛ على Apache تُستخدم **`RequestHeader`** كما فوق. لا تُنفَّذ في الطرفية كأوامر shell.

---

## 3.1) الوصول إلى لوحة Webuzو بعد تصحيح البروكسي

- تعديل **`newcarpal.com.conf`** **لا يعطّل** خدمة Webuzو على **2003**؛ يمنع فقط استخدام **نطاق المتجر** كقناة إلى ذلك المنفذ.
- الدخول للوحة: عادةً **`https://<IP-السيرفر>:2003`** أو **`https://server1.newcarpal.com:2003`** (حسب جدار النار وإعداد Webuzو). ما يظهر على **`curl -skI https://127.0.0.1:2003/`** هو واجهة Webuzو (PHP 7.4، `Server: Webuzo`).
- **`http://127.0.0.1:2003`** قد يعيد **400** من nginx إن كان المنفذ مضبوطاً لـ HTTPS فقط.

---

## 4) Laravel (adminNewcar)

### متغيرات وثقة البروكسي

- ملف: `config/trustedproxy.php` — يقرأ `TRUSTED_PROXIES` من `.env` (افتراضي `127.0.0.1,::1`).
- **إنتاج newcarpal:** المتجر (Next BFF) يتصل بـ `admin.newcarpal.com` من IP السيرفر وليس loopback — بدون ثقة البروكسي يُحسب **كل الزوار** في دلو واحد → رسالة `Too Many Attempts` عند التسجيل.
- **الإصلاح على السيرفر:**

```bash
# في .env داخل adminNewcar
TRUSTED_PROXIES=*
php artisan config:clear
```

### حد الطلبات (Rate limit)

- مجموعة API العامة: `throttle:300,1` في `bootstrap/app.php`.
- مسارات `auth`: `throttle:auth` (60/دقيقة لكل IP) و`registration` منفصل: `throttle:auth-register` (20/دقيقة) — يتطلب `TRUSTED_PROXIES` أعلاه.

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

### متغيرات البيئة (قبل `npm run build`)

أنشئ `.env.production` أو `.env.local` على السيرفر (لا ترفعها إلى Git):

| المتغير | مثال | ملاحظة |
|---------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://admin.newcarpal.com/api/v1` | إلزامي — نفس تطبيق لوحة التحكم على الخادم. |
| `NEXT_PUBLIC_SITE_URL` | `https://newcarpal.com` | لـ `metadataBase` وOG وروابط تسويقية. |

**Laravel (نفس المضيف):** `CORS_ALLOWED_ORIGINS` يتضمّن `https://newcarpal.com,https://www.newcarpal.com` ثم `php artisan optimize:clear`.

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
| **`newcarpal.com` يفتح تسجيل دخول Webuzو** (`index.php?act=login`، `SOFTCookies…`، PHP) | **`ProxyPass` إلى `https://127.0.0.1:2003/`** — **2003** = لوحة Webuzو وليس Next | بروكسي إلى **`http://127.0.0.1:3000/`**؛ إزالة `SSLProxy*`؛ `configtest` + `graceful` (§3) |
| **`nginx: command not found` على SSH** | nginx ليس في `PATH`؛ **443** على server1 = **Apache** | `ss -tlnp`؛ بحث تحت `/usr/local/apps/apache2` |
| 500 على `/_next/static/...` من Next | لا يوجد `.next` كامل بعد `build` أو عملية قديمة على نفس المنفذ | `rm -rf .next && npm run build` كـ baitpait + Node 20؛ إيقاف العملية القديمة ثم `pm2 start` |
| 500 على `products/search` | أخطاء SQL/Passport سابقة؛ ثم Passport keys | إصلاح الفلتر في الكود؛ مفاتيح oauth + صلاحيات الملفات |
| 429 على API / BFF | نفس IP لكل الطلبات (BFF من السيرفر) + حد 60/دقيقة سابق | رفع الحد؛ تمرير `X-Forwarded-For`؛ `TRUSTED_PROXIES` |
| 500 تسجيل | `oauth-private.key` غير مقروء لـ PHP | `chown`/`chmod` كما في §4 |
| 403 تسجيل | تحقق Laravel (هاتف/بريد مكرر، إلخ) | قراءة جسم JSON في Network |
| `curl https://127.0.0.1` SSL error | المنفذ المحلي ليس HTTPS كما توقّعته | اختبار بـ `curl -I https://newcarpal.com/` أو `--resolve` (§8) |

---

## 7) أوامر تشخيص مفيدة

```bash
# Next (3000) مقابل Webuzو (2003)
sudo ss -tlnp | grep -E ':3000|:2003'

# Apache + SNI محلياً لنطاق المتجر
curl -skI --resolve newcarpal.com:443:127.0.0.1 https://newcarpal.com/ | head -25

# سجل Laravel
tail -n 100 /home/baitpait/public_html/adminNewcar/storage/logs/laravel.log

# سجلات المتجر
sudo -u baitpait pm2 logs newcarpal-store --lines 50

# مرجع vhost Webuzو
sudo grep -Rsn "newcarpal" /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf | head -20
sudo /usr/local/apps/apache2/bin/apachectl -S
```

---

## 8) سجل حادثة — Webuzو على جذر newcarpal.com (2026-04-08)

| البند | التفاصيل |
|--------|-----------|
| **العرض** | توجيه **`index.php?act=login`** وكوكي **`SOFTCookies…`** بدل Next. |
| **تشخيص** | `curl -skI https://127.0.0.1:2003/` → **Webuzو** (PHP). `ss` → **2003** = nginx لوحة، **3000** = `next-server`. |
| **السبب** | **`newcarpal.com.conf`** كان **`ProxyPass / https://127.0.0.1:2003/`**. |
| **الإصلاح** | **`ProxyPass` / `ProxyPassReverse` إلى `http://127.0.0.1:3000/`**؛ حذف **`SSLProxy*`**؛ نسخة احتياطية؛ **`apachectl configtest`** + **`graceful`**. |
| **التحقق** | `curl -skI --resolve newcarpal.com:443:127.0.0.1 https://newcarpal.com/` — لا Webuzو على الجذر. |
| **لوحة Webuzو** | تبقى على **2003 مباشرة** (§3.1)؛ لم تُلغَ، فقط فُصلت عن نطاق المتجر. |

---

## 9) ختام التوثيق

- **2026-04-08:** تصحيح البروكسي (3000 بدل 2003)، أدوار المنافذ، حادثة كاملة، الوصول إلى Webuzو.
- **ما سبق:** Laravel (Passport، throttling، proxy)، Next (Node 20، PM2، BFF)، ترويسات IP.

**المسار في المستودع:** `store/web/docs/SERVER-DEPLOYMENT-NEWCARPAL.md` — يُرفع مع **New-Stor** عند `git push`.
