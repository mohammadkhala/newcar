import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

type Section = { icon: string; title: string; body: string };
type Stat = { label: string; value: string };

type LocaleContent = {
  title: string;
  subtitle: string;
  stats: Stat[];
  sections: Section[];
  contactTitle: string;
  contactSubtitle: string;
  contactCta: string;
};

const content: Record<string, LocaleContent> = {
  ar: {
    title: "سياسة الإرجاع والاستبدال",
    subtitle: "نسعى دائماً لضمان رضاك التام عن كل منتج تستلمه",
    stats: [
      { label: "مدة الإرجاع", value: "7 أيام" },
      { label: "استرداد المبلغ", value: "5-10 أيام" },
      { label: "حالة المنتج", value: "غير مستخدم" },
    ],
    sections: [
      {
        icon: "✅",
        title: "شروط قبول الإرجاع",
        body: `يُقبل الإرجاع في الحالات التالية:\n• المنتج معيب أو تالف عند الاستلام.\n• المنتج لا يطابق المواصفات المذكورة في الموقع.\n• استلام منتج مختلف عن المطلوب.\n• المنتج في حالته الأصلية غير مستخدم وفي عبوته الأصلية.`,
      },
      {
        icon: "📅",
        title: "مدة الإرجاع",
        body: `• يحق للعميل طلب الإرجاع خلال 7 أيام من تاريخ الاستلام.\n• بعد انقضاء هذه المدة لن يُقبل طلب الإرجاع إلا في حالات استثنائية تخضع لتقدير فريق خدمة العملاء.\n• منتجات الإلكترونيات والأجهزة: خلال 3 أيام من الاستلام.`,
      },
      {
        icon: "🚫",
        title: "حالات لا يُقبل فيها الإرجاع",
        body: `لا يُقبل الإرجاع في الحالات التالية:\n• المنتجات المستخدمة أو التالفة بسبب سوء الاستخدام.\n• المنتجات التي تم تركيبها في السيارة.\n• المنتجات المخصصة أو المصنوعة حسب الطلب.\n• المنتجات المخفضة أو التي تم شراؤها في عروض خاصة (إلا في حالة العيب).\n• المنتجات التي فُكّت عبوتها الأصلية وأُعيد تغليفها.`,
      },
      {
        icon: "🔄",
        title: "خطوات الإرجاع",
        body: `للقيام بعملية الإرجاع اتبع الخطوات التالية:\n١. تواصل مع فريق خدمة العملاء عبر WhatsApp أو صفحة اتصل بنا.\n٢. أرسل صور واضحة للمنتج وفاتورة الشراء.\n٣. سيتم مراجعة طلبك خلال 24-48 ساعة عمل.\n٤. في حال الموافقة، سيتم تحديد موعد لاستلام المنتج.\n٥. بعد استلام المنتج وفحصه، يتم معالجة الاسترداد.`,
      },
      {
        icon: "💰",
        title: "استرداد المبلغ",
        body: `• يتم رد المبلغ بنفس طريقة الدفع الأصلية خلال 5-10 أيام عمل.\n• في حالة الدفع نقداً عند الاستلام: يتم الرد نقداً أو رصيداً في المتجر حسب اتفاق الطرفين.\n• رصيد المتجر: يُضاف فوراً ويمكن استخدامه في أي طلب مستقبلي.\n• تكاليف الشحن غير مستردة إلا في حالة كون المنتج معيباً.`,
      },
      {
        icon: "🔃",
        title: "الاستبدال",
        body: `نتيح خيار الاستبدال بدلاً من الإرجاع في الحالات التالية:\n• استبدال المنتج المعيب بمنتج آخر سليم من نفس النوع.\n• استبدال المنتج بمنتج آخر مختلف مع تسوية فرق السعر.\n• الاستبدال خاضع لتوافر المنتج في المخزون.`,
      },
      {
        icon: "🚚",
        title: "تكاليف الشحن عند الإرجاع",
        body: `• إذا كان الإرجاع بسبب عيب في المنتج أو خطأ منّا: نتحمل نحن تكاليف الشحن كاملة.\n• إذا كان الإرجاع برغبة العميل (تغيير رأي): يتحمل العميل تكاليف الشحن.\n• يُرجى التواصل معنا قبل إرسال المنتج لتحديد آلية الشحن.`,
      },
    ],
    contactTitle: "هل لديك استفسار عن الإرجاع؟",
    contactSubtitle: "فريقنا جاهز لمساعدتك في أي وقت",
    contactCta: "تواصل معنا",
  },
  en: {
    title: "Return & Exchange Policy",
    subtitle: "We always strive to ensure your complete satisfaction with every product you receive",
    stats: [
      { label: "Return Window", value: "7 Days" },
      { label: "Refund Time", value: "5-10 Days" },
      { label: "Item Condition", value: "Unused" },
    ],
    sections: [
      {
        icon: "✅",
        title: "Return Eligibility",
        body: `Returns are accepted in the following cases:\n• The product is defective or damaged upon receipt.\n• The product does not match the specifications listed on the site.\n• A different product was received than what was ordered.\n• The product is unused and in its original packaging.`,
      },
      {
        icon: "📅",
        title: "Return Period",
        body: `• Customers may request a return within 7 days of receipt.\n• After this period, return requests will only be accepted in exceptional cases at the discretion of the customer service team.\n• Electronics and devices: within 3 days of receipt.`,
      },
      {
        icon: "🚫",
        title: "Non-Returnable Items",
        body: `Returns are not accepted in the following cases:\n• Products that have been used or damaged due to misuse.\n• Products that have been installed in a vehicle.\n• Custom or made-to-order products.\n• Discounted products or those purchased during special offers (except in case of defect).\n• Products whose original packaging has been opened and re-wrapped.`,
      },
      {
        icon: "🔄",
        title: "Return Process",
        body: `To initiate a return, follow these steps:\n1. Contact our customer service team via WhatsApp or the Contact Us page.\n2. Send clear photos of the product and purchase receipt.\n3. Your request will be reviewed within 24-48 business hours.\n4. If approved, a pickup appointment will be scheduled.\n5. After receiving and inspecting the product, the refund will be processed.`,
      },
      {
        icon: "💰",
        title: "Refunds",
        body: `• Refunds are issued to the original payment method within 5-10 business days.\n• For cash-on-delivery payments: refunds are given in cash or as store credit, by mutual agreement.\n• Store credit: added immediately and usable on any future order.\n• Shipping costs are non-refundable unless the product was defective.`,
      },
      {
        icon: "🔃",
        title: "Exchanges",
        body: `We offer the option to exchange instead of return in the following cases:\n• Exchange a defective product for an identical working product.\n• Exchange for a different product with a price adjustment.\n• Exchange is subject to product availability in stock.`,
      },
      {
        icon: "🚚",
        title: "Return Shipping Costs",
        body: `• If the return is due to a product defect or our error: we cover all shipping costs.\n• If the return is at the customer's request (change of mind): the customer bears the shipping costs.\n• Please contact us before shipping the product to arrange the logistics.`,
      },
    ],
    contactTitle: "Have a question about a return?",
    contactSubtitle: "Our team is ready to help you at any time",
    contactCta: "Contact Us",
  },
  he: {
    title: "מדיניות החזרות והחלפות",
    subtitle: "אנו תמיד שואפים להבטיח את שביעות רצונך המלאה מכל מוצר שתקבל",
    stats: [
      { label: "חלון החזרה", value: "7 ימים" },
      { label: "זמן החזר כספי", value: "5-10 ימים" },
      { label: "מצב המוצר", value: "לא בשימוש" },
    ],
    sections: [
      {
        icon: "✅",
        title: "תנאי קבלת החזרה",
        body: `החזרות מתקבלות במקרים הבאים:\n• המוצר פגום או ניזוק בעת הקבלה.\n• המוצר אינו תואם למפרט המופיע באתר.\n• התקבל מוצר שונה מהמוזמן.\n• המוצר אינו בשימוש ובאריזתו המקורית.`,
      },
      {
        icon: "📅",
        title: "תקופת ההחזרה",
        body: `• לקוחות רשאים לבקש החזרה תוך 7 ימים מהקבלה.\n• לאחר תקופה זו, בקשות החזרה יתקבלו רק במקרים חריגים לפי שיקול דעת צוות שירות הלקוחות.\n• אלקטרוניקה ומכשירים: תוך 3 ימים מהקבלה.`,
      },
      {
        icon: "🚫",
        title: "פריטים שלא ניתן להחזיר",
        body: `החזרות לא מתקבלות במקרים הבאים:\n• מוצרים שנעשה בהם שימוש או שניזוקו עקב שימוש לרעה.\n• מוצרים שהותקנו ברכב.\n• מוצרים מותאמים אישית או עשויים לפי הזמנה.\n• מוצרים מוזלים או שנרכשו במבצעים מיוחדים (למעט במקרה של פגם).\n• מוצרים שאריזתם המקורית נפתחה ועוטפה מחדש.`,
      },
      {
        icon: "🔄",
        title: "תהליך ההחזרה",
        body: `לתחילת תהליך ההחזרה, בצע את השלבים הבאים:\n1. צור קשר עם צוות שירות הלקוחות שלנו בוואטסאפ או בעמוד צור קשר.\n2. שלח תמונות ברורות של המוצר וקבלת הרכישה.\n3. הבקשה תבחן תוך 24-48 שעות עסקיות.\n4. אם תאושר, ייקבע מועד לאיסוף המוצר.\n5. לאחר קבלת המוצר ובדיקתו, יעובד ההחזר הכספי.`,
      },
      {
        icon: "💰",
        title: "החזרים כספיים",
        body: `• ההחזר ינתן לאמצעי התשלום המקורי תוך 5-10 ימי עסקים.\n• לתשלומים במזומן בעת האספקה: ההחזר יינתן במזומן או כזיכוי בחנות, בהסכמה הדדית.\n• זיכוי בחנות: נוסף מיידית וניתן לשימוש בכל הזמנה עתידית.\n• עלויות משלוח אינן ניתנות להחזר אלא אם המוצר היה פגום.`,
      },
      {
        icon: "🔃",
        title: "החלפות",
        body: `אנו מציעים אפשרות החלפה במקום החזרה במקרים הבאים:\n• החלפת מוצר פגום במוצר זהה תקין.\n• החלפה במוצר שונה עם התאמת מחיר.\n• ההחלפה כפופה לזמינות המוצר במלאי.`,
      },
      {
        icon: "🚚",
        title: "עלויות משלוח בהחזרה",
        body: `• אם ההחזרה נובעת מפגם במוצר או מטעותנו: אנו נשאים בכל עלויות המשלוח.\n• אם ההחזרה היא לפי בקשת הלקוח (שינוי דעה): הלקוח נושא בעלויות המשלוח.\n• אנא צור קשר לפני משלוח המוצר לתיאום הלוגיסטיקה.`,
      },
    ],
    contactTitle: "יש לך שאלה לגבי החזרה?",
    contactSubtitle: "הצוות שלנו מוכן לעזור לך בכל עת",
    contactCta: "צור קשר",
  },
};

export default async function ReturnPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const c = content[locale] ?? content.ar;

  return (
    <div className="store-shell py-10 md:py-14">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-secondary">{c.title}</h1>
        <p className="mt-2 text-sm text-secondary/50">{c.subtitle}</p>
      </div>

      {/* Quick summary strip */}
      <div className="mb-8 grid grid-cols-3 gap-3 text-center">
        {c.stats.map((stat) => (
          <div key={stat.label} className="store-card py-4">
            <p className="text-lg font-black text-primary">{stat.value}</p>
            <p className="mt-0.5 text-xs text-secondary/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl space-y-4">
        {c.sections.map((section, i) => (
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
          <p className="font-black text-secondary">{c.contactTitle}</p>
          <p className="mt-1 text-sm text-secondary/60">{c.contactSubtitle}</p>
          <Link
            href="/cms/contact"
            className="store-btn-primary mt-4 inline-flex items-center justify-center px-8 text-sm"
          >
            {c.contactCta}
          </Link>
        </div>
      </div>

    </div>
  );
}
