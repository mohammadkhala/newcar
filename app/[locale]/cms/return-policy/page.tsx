import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

const sections = [
  {
    icon: "✅",
    title: "شروط قبول الإرجاع",
    body: `يُقبل الإرجاع في الحالات التالية:
• المنتج معيب أو تالف عند الاستلام.
• المنتج لا يطابق المواصفات المذكورة في الموقع.
• استلام منتج مختلف عن المطلوب.
• المنتج في حالته الأصلية غير مستخدم وفي عبوته الأصلية.`,
  },
  {
    icon: "📅",
    title: "مدة الإرجاع",
    body: `• يحق للعميل طلب الإرجاع خلال **7 أيام** من تاريخ الاستلام.
• بعد انقضاء هذه المدة لن يُقبل طلب الإرجاع إلا في حالات استثنائية تخضع لتقدير فريق خدمة العملاء.
• منتجات الإلكترونيات والأجهزة: خلال 3 أيام من الاستلام.`,
  },
  {
    icon: "🚫",
    title: "حالات لا يُقبل فيها الإرجاع",
    body: `لا يُقبل الإرجاع في الحالات التالية:
• المنتجات المستخدمة أو التالفة بسبب سوء الاستخدام.
• المنتجات التي تم تركيبها في السيارة.
• المنتجات المخصصة أو المصنوعة حسب الطلب.
• المنتجات المخفضة أو التي تم شراؤها في عروض خاصة (إلا في حالة العيب).
• المنتجات التي فُكّت عبوتها الأصلية وأُعيد تغليفها.`,
  },
  {
    icon: "🔄",
    title: "خطوات الإرجاع",
    body: `للقيام بعملية الإرجاع اتبع الخطوات التالية:
١. تواصل مع فريق خدمة العملاء عبر WhatsApp أو صفحة اتصل بنا.
٢. أرسل صور واضحة للمنتج وفاتورة الشراء.
٣. سيتم مراجعة طلبك خلال 24-48 ساعة عمل.
٤. في حال الموافقة، سيتم تحديد موعد لاستلام المنتج.
٥. بعد استلام المنتج وفحصه، يتم معالجة الاسترداد.`,
  },
  {
    icon: "💰",
    title: "استرداد المبلغ",
    body: `• يتم رد المبلغ بنفس طريقة الدفع الأصلية خلال 5-10 أيام عمل.
• في حالة الدفع نقداً عند الاستلام: يتم الرد نقداً أو رصيداً في المتجر حسب اتفاق الطرفين.
• رصيد المتجر: يُضاف فوراً ويمكن استخدامه في أي طلب مستقبلي.
• تكاليف الشحن غير مستردة إلا في حالة كون المنتج معيباً.`,
  },
  {
    icon: "🔃",
    title: "الاستبدال",
    body: `نتيح خيار الاستبدال بدلاً من الإرجاع في الحالات التالية:
• استبدال المنتج المعيب بمنتج آخر سليم من نفس النوع.
• استبدال المنتج بمنتج آخر مختلف مع تسوية فرق السعر.
• الاستبدال خاضع لتوافر المنتج في المخزون.`,
  },
  {
    icon: "🚚",
    title: "تكاليف الشحن عند الإرجاع",
    body: `• إذا كان الإرجاع بسبب عيب في المنتج أو خطأ منّا: نتحمل نحن تكاليف الشحن كاملة.
• إذا كان الإرجاع برغبة العميل (تغيير رأي): يتحمل العميل تكاليف الشحن.
• يُرجى التواصل معنا قبل إرسال المنتج لتحديد آلية الشحن.`,
  },
];

export default async function ReturnPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="store-shell py-10 md:py-14">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-secondary">سياسة الإرجاع والاستبدال</h1>
        <p className="mt-2 text-sm text-secondary/50">
          نسعى دائماً لضمان رضاك التام عن كل منتج تستلمه
        </p>
      </div>

      {/* Quick summary strip */}
      <div className="mb-8 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "مدة الإرجاع", value: "7 أيام" },
          { label: "استرداد المبلغ", value: "5-10 أيام" },
          { label: "حالة المنتج", value: "غير مستخدم" },
        ].map((stat) => (
          <div key={stat.label} className="store-card py-4">
            <p className="text-lg font-black text-primary">{stat.value}</p>
            <p className="mt-0.5 text-xs text-secondary/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl space-y-4">
        {sections.map((section, i) => (
          <div key={i} className="store-card p-6 md:p-7">
            <h2 className="mb-3 flex items-center gap-3 text-base font-black text-secondary">
              <span className="shrink-0 text-2xl leading-none">{section.icon}</span>
              {section.title}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-secondary/70">
              {section.body}
            </p>
          </div>
        ))}

        {/* Contact note */}
        <div className="store-card border-primary/20 bg-primary/5 p-6 text-center">
          <p className="font-black text-secondary">هل لديك استفسار عن الإرجاع؟</p>
          <p className="mt-1 text-sm text-secondary/60">
            فريقنا جاهز لمساعدتك في أي وقت
          </p>
          <a
            href={`/${locale}/cms/contact`}
            className="store-btn-primary mt-4 inline-flex items-center justify-center px-8 text-sm"
          >
            تواصل معنا
          </a>
        </div>
      </div>

    </div>
  );
}
