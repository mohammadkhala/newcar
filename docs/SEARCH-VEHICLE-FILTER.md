# فلتر ماركة السيارة ثم الموديل (المتجر)

> **آخر تحديث:** 2026-10-25  
> **المتجر:** https://newcarpal.com  
> **API:** https://admin.newcarpal.com/api/v1  

---

## السلوك في الواجهة

1. الضغط على **ماركة** في شريط البحث → كل منتجات هذه الماركة (بدون موديل/سنة في الرابط).  
2. الضغط على **موديل** → تصفية أضيق لنفس الماركة + الموديل.  
3. **كل الموديلات** → العودة لعرض كل منتجات الماركة.
4. ماركة/موديل/سنة **بلا منتجات** تظهر **باهتة مع «قريباً»** ولا يمكن الضغط عليها، والمتوفر يظهر أولاً. تصبح فعّالة تلقائياً عند ربط أول منتج بها.
5. الضغط على ماركة أثناء بحث نصي **يحتفظ بكلمة البحث** (`name`).

الروابط:

- ماركة: `/ar/shop/search?vehicle_brand_id={id}&offset=1` (الترتيب الافتراضي `best_selling` حتى لا يفرّغ `new_arrival` النتائج)
- موديل: يضيف `vehicle_model_id` ويبقي الماركة

ملفات الواجهة:

| ملف | دور |
|-----|-----|
| `components/store/VehicleBrandSlider.tsx` | شريط الماركات |
| `components/store/VehicleModelSlider.tsx` | شريط الموديلات + «كل الموديلات» |
| `app/[locale]/shop/search/page.tsx` | صفحة النتائج |
| `components/vehicle/VehicleFitmentPicker.tsx` | صفحة «سيارات» `/shop/vehicle` (زر التطبيق السفلي) — تحفظ الاختيار في الرابط `?brand=&model=&year=` فيعمل زر الرجوع |
| `components/store/HomeExactModelSection.tsx` | «اختر سيارتك» في الرئيسية (قوائم منسدلة) |
| `components/store/header/VehicleByCarMegaPanel.tsx` | قائمة «حسب سيارتك» في الهيدر |
| `lib/vehicle-availability.ts` | `hasProducts()` / `availableFirst()` — بلا `products_count` (API قديم) يُعتبر الخيار متوفراً |

### «قريباً» ومصدر العدد

`vehicles/brands`، `vehicles/models?brand_id=`، `vehicles/years?model_id=` تعيد `products_count` لكل عنصر (منتجات فعّالة مربوطة). النص من `messages/*.json` → `VehiclePicker.comingSoon` (قريباً / Coming soon / בקרוב).

قائمة الماركات في الخادم مخزّنة 10 دقائق (`revalidate: 600`)؛ بعد ربط منتج بماركة جديدة قد تبقى «قريباً» حتى 10 دقائق. الموديلات والسنوات تُجلب من المتصفح بلا كاش.

### البحث النصي من شريط البحث

`name=` يطابق اسم المنتج **أو** ماركة/موديل السيارة المربوطة، كل كلمة على حدة، مع تطبيع أ/ا، ة/ه، ى/ي ومرادفات قاموس `fitment-name-rules.php` في لوحة التحكم. البحث بكلمة لا يقص على آخر 3 أشهر حتى مع `sort_by=new_arrival`.

---

## ظهور بيانات جديدة من لوحة التحكم

| إجراء الأدمن | يظهر في الفلتر؟ | تحتاج تعديلاً في الكود؟ |
|--------------|-----------------|-------------------------|
| حفظ منتج مع توافق مركبة (ماركة/موديل/سنة) | نعم فوراً بعد الحفظ | لا |
| إضافة ماركة/موديل/سنة | نعم في الأشرطة | لا |
| منتج بلا توافق يدوي | لا تحت فلتر السيارة | لا — اربط من الأدمن أو شغّل أمر الربط الجماعي |

تفاصيل أمر الربط من الأسماء والعمليات الجماعية:  
[`admin/DB/Admin DB/database/catalog-import/FITMENT-LINKING.md`](../../admin/DB/Admin%20DB/database/catalog-import/FITMENT-LINKING.md)

---

## API

- البحث: `GET /api/v1/products/search?vehicle_brand_id=&vehicle_model_id=&vehicle_year_id=`
- الفلتر يمر عبر `Helpers::applyProductVehicleFitmentFilters` (join على `product_vehicle_fitments` + `vehicle_models`)
- مع فلتر مركبة: `sort_by=new_arrival` **لا** يقص المنتجات لآخر 3 أشهر

تحقق:

```bash
curl -sS 'https://admin.newcarpal.com/api/v1/products/search?vehicle_brand_id=20&limit=1&offset=1&sort_by=new_arrival' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_size'))"
```
