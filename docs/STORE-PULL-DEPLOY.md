# سحب ونشر المتجر على السيرفر (store-v2)

> **آخر تحديث:** 2026-06-23  
> **الدومين:** https://newcarpal.com  
> **الريبو:** https://github.com/mohammadkhala/newcar (public)

---

## المرجع السريع

| البند | القيمة |
|-------|--------|
| مسار السيرفر | `/home/baitpait/public_html/newcarpal-store` |
| مستخدم التشغيل | `baitpait` |
| PM2 | **`newcar-store`** (ليس `newcarpal-store`) |
| Node | 20 عبر nvm |
| ملف البيئة | `.env.production` (قبل `npm run build`) |

فلتر البحث حسب السيارة (ماركة → موديل) وظهور بيانات الأدمن:  
انظر [`SEARCH-VEHICLE-FILTER.md`](./SEARCH-VEHICLE-FILTER.md).

---

## أوامر النشر (نسخ ولصق)

```bash
# 1) امسح اعتماد GitHub القديم (إذا طلب username)
sudo -u baitpait bash -lc 'printf "protocol=https\nhost=github.com\n\n" | git credential reject'

# 2) سحب الكود
sudo -u baitpait bash -lc 'cd /home/baitpait/public_html/newcarpal-store && git pull origin main'

# 3) بناء الإنتاج
sudo -u baitpait bash -lc 'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20; cd /home/baitpait/public_html/newcarpal-store && npm ci && npm run build'

# 4) إعادة تشغيل
sudo -u baitpait pm2 restart newcar-store
```

إذا فشل `npm ci` (اختلاف lockfile):

```bash
sudo -u baitpait bash -lc 'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 20; cd /home/baitpait/public_html/newcarpal-store && npm install && npm run build'
sudo -u baitpait pm2 restart newcar-store
```

### تحقق

```bash
sudo -u baitpait pm2 status
curl -sI https://newcarpal.com/ar | head -3
```

---

## Git — أعطال شائعة

### `could not read Username for 'https://github.com'`

**السبب:** بيانات اعتماد قديمة محفوظة، أو الريبو كان خاصاً ثم أُعلِن public.

**الحل:**

```bash
sudo -u baitpait bash -lc 'printf "protocol=https\nhost=github.com\n\n" | git credential reject'
sudo -u baitpait bash -lc 'GIT_TERMINAL_PROMPT=0 git ls-remote https://github.com/mohammadkhala/newcar.git HEAD'
```

إذا ظهر hash (مثل `d47b07c...`) → الريبو يُقرأ بدون تسجيل دخول؛ نفّذ `git pull`.

**تحقق أن الريبو عام:**

```bash
curl -sI https://github.com/mohammadkhala/newcar | head -3
# HTTP/2 200 = متاح
```

### `dubious ownership`

شغّل `git` كـ `baitpait` وليس root:

```bash
sudo -u baitpait bash -lc 'cd /home/baitpait/public_html/newcarpal-store && git pull origin main'
```

---

## متغيرات البيئة (`.env.production`)

تُدمَج `NEXT_PUBLIC_*` في **وقت البناء**:

```env
NEXT_PUBLIC_API_BASE_URL=https://admin.newcarpal.com/api/v1
NEXT_PUBLIC_SITE_URL=https://newcarpal.com
```

بعد تغييرها: أعد `npm run build` و `pm2 restart newcar-store`.

---

## التطوير المحلي

```bash
cd store-v2
git pull origin main
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1 NEXT_PUBLIC_SITE_URL=http://localhost:3001 npx next dev -p 3001
```

Laravel API محلياً: `php artisan serve --host=127.0.0.1 --port=8000` من `admin/DB/Admin DB`.

---

## آخر تحديثات المتجر (2026-06-23)

| Commit | الوصف |
|--------|--------|
| `d47b07c` | لون زر الرجوع → الأصفر الأساسي `#ffb700` |
| `e9ea906` | زر رجوع في السلة، المنتج، الدفع، الحساب، CMS |
| `ddd4ad6` | سلايدر ماركات المنتجات عند الفلترة |
| `63ad775` | صور موديلات السيارة في سلايدر البحث |
| `d320697` | اللون الأساسي من برتقالي إلى أصفر |

مكوّن جديد: `components/store/BackButton.tsx`

---

## مراجع

- `docs/SERVER-DEPLOYMENT-NEWCARPAL.md` — Apache، Passport، تشخيص أعطال
- `store/docs/SESSION-HANDOFF.md` — سياق المشروع الكامل
