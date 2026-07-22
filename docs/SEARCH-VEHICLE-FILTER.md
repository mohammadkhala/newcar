# فلتر ماركة السيارة ثم الموديل (المتجر)

> **آخر تحديث:** 2026-07-22  
> **المتجر:** https://newcarpal.com  
> **API:** https://admin.newcarpal.com/api/v1  

---

## السلوك في الواجهة

1. الضغط على **ماركة** في شريط البحث → كل منتجات هذه الماركة (بدون موديل/سنة في الرابط).  
2. الضغط على **موديل** → تصفية أضيق لنفس الماركة + الموديل.  
3. **كل الموديلات** → العودة لعرض كل منتجات الماركة.

الروابط:

- ماركة: `/ar/shop/search?vehicle_brand_id={id}&offset=1` (الترتيب الافتراضي `best_selling` حتى لا يفرّغ `new_arrival` النتائج)
- موديل: يضيف `vehicle_model_id` ويبقي الماركة

ملفات الواجهة:

| ملف | دور |
|-----|-----|
| `components/store/VehicleBrandSlider.tsx` | شريط الماركات |
| `components/store/VehicleModelSlider.tsx` | شريط الموديلات + «كل الموديلات» |
| `app/[locale]/shop/search/page.tsx` | صفحة النتائج |

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
