import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

type Section = { title: string; body: string };

type LocaleContent = {
  title: string;
  subtitle: string;
  contactNote: string;
  contactCta: string;
  sections: Section[];
};

const content: Record<string, LocaleContent> = {
  ar: {
    title: "سياسة الخصوصية",
    subtitle: "آخر تحديث: يونيو 2025",
    contactNote: "للاستفسار عن سياسة الخصوصية أو ممارسة حقوقك",
    contactCta: "تواصل معنا",
    sections: [
      {
        title: "مقدمة",
        body: `نيو كار يلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. تصف هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها عند استخدامك لموقعنا الإلكتروني أو تطبيقنا.`,
      },
      {
        title: "المعلومات التي نجمعها",
        body: `نجمع المعلومات التالية عند تسجيلك أو استخدامك لخدماتنا:\n• الاسم الكامل وبيانات الاتصال (البريد الإلكتروني، رقم الهاتف).\n• عنوان التوصيل.\n• بيانات الدفع (يتم معالجتها بشكل آمن عبر بوابات الدفع المعتمدة ولا نحتفظ بها).\n• سجل الطلبات والمشتريات.\n• بيانات تصفح الموقع (ملفات الكوكيز وعنوان IP).`,
      },
      {
        title: "كيف نستخدم معلوماتك",
        body: `نستخدم معلوماتك للأغراض التالية:\n• معالجة طلباتك وتوصيلها إليك.\n• التواصل معك بشأن طلباتك وخدمة العملاء.\n• إرسال عروض وتحديثات (يمكنك إلغاء الاشتراك في أي وقت).\n• تحسين تجربتك على الموقع.\n• الامتثال للمتطلبات القانونية.`,
      },
      {
        title: "حماية بياناتك",
        body: `نتخذ إجراءات أمنية صارمة لحماية بياناتك الشخصية من الوصول غير المصرح به أو الكشف أو التعديل أو الحذف. نستخدم بروتوكول HTTPS المشفر لجميع الاتصالات، ونخزن البيانات على خوادم آمنة.`,
      },
      {
        title: "مشاركة المعلومات مع أطراف ثالثة",
        body: `لا نبيع أو نؤجر أو نتاجر بمعلوماتك الشخصية مع أطراف ثالثة. قد نشارك بياناتك فقط مع:\n• شركات الشحن والتوصيل لإتمام طلباتك.\n• بوابات الدفع لمعالجة المعاملات المالية.\n• الجهات القانونية عند الاقتضاء القانوني.`,
      },
      {
        title: "ملفات الكوكيز",
        body: `نستخدم ملفات الكوكيز لتحسين تجربتك على الموقع وتذكر تفضيلاتك. يمكنك تعطيل الكوكيز من إعدادات المتصفح، لكن قد يؤثر ذلك على بعض وظائف الموقع.`,
      },
      {
        title: "حقوقك",
        body: `لديك الحق في:\n• الاطلاع على بياناتك الشخصية المخزنة لدينا.\n• تصحيح أي بيانات غير دقيقة.\n• طلب حذف بياناتك.\n• إلغاء الاشتراك في الرسائل التسويقية.\nللاستفسار عن أي من هذه الحقوق، تواصل معنا عبر صفحة اتصل بنا.`,
      },
      {
        title: "التعديلات على سياسة الخصوصية",
        body: `نحتفظ بالحق في تعديل هذه السياسة في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع. استمرارك في استخدام الموقع بعد نشر التغييرات يعني قبولك لها.`,
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    subtitle: "Last updated: June 2025",
    contactNote: "For inquiries about our privacy policy or to exercise your rights",
    contactCta: "Contact Us",
    sections: [
      {
        title: "Introduction",
        body: `New Car is committed to protecting your privacy and the security of your personal data. This policy describes how we collect, use, and protect your information when you use our website or app.`,
      },
      {
        title: "Information We Collect",
        body: `We collect the following information when you register or use our services:\n• Full name and contact details (email, phone number).\n• Delivery address.\n• Payment data (processed securely through certified payment gateways; we do not store it).\n• Order and purchase history.\n• Website browsing data (cookies and IP address).`,
      },
      {
        title: "How We Use Your Information",
        body: `We use your information for the following purposes:\n• Processing and delivering your orders.\n• Communicating with you about your orders and customer service.\n• Sending offers and updates (you can unsubscribe at any time).\n• Improving your experience on the site.\n• Complying with legal requirements.`,
      },
      {
        title: "Protecting Your Data",
        body: `We take strict security measures to protect your personal data from unauthorized access, disclosure, modification, or deletion. We use encrypted HTTPS protocol for all communications and store data on secure servers.`,
      },
      {
        title: "Sharing with Third Parties",
        body: `We do not sell, rent, or trade your personal information with third parties. We may share your data only with:\n• Shipping and delivery companies to fulfill your orders.\n• Payment gateways to process financial transactions.\n• Legal authorities when legally required.`,
      },
      {
        title: "Cookies",
        body: `We use cookies to improve your experience on the site and remember your preferences. You can disable cookies in your browser settings, but this may affect some website functions.`,
      },
      {
        title: "Your Rights",
        body: `You have the right to:\n• Access your personal data stored with us.\n• Correct any inaccurate data.\n• Request deletion of your data.\n• Unsubscribe from marketing messages.\nTo inquire about any of these rights, contact us through our Contact Us page.`,
      },
      {
        title: "Policy Updates",
        body: `We reserve the right to modify this policy at any time. You will be notified of any significant changes via email or a notice on the site. Your continued use of the site after changes are published means your acceptance of them.`,
      },
    ],
  },
  he: {
    title: "מדיניות פרטיות",
    subtitle: "עודכן לאחרונה: יוני 2025",
    contactNote: "לפניות בנושא מדיניות הפרטיות או מימוש זכויותיך",
    contactCta: "צור קשר",
    sections: [
      {
        title: "מבוא",
        body: `NEW CAR מחויבת להגן על פרטיותך ועל אבטחת המידע האישי שלך. מדיניות זו מתארת כיצד אנו אוספים, משתמשים ומגינים על המידע שלך בעת השימוש באתר או באפליקציה שלנו.`,
      },
      {
        title: "מידע שאנו אוספים",
        body: `אנו אוספים את המידע הבא בעת ההרשמה או השימוש בשירותינו:\n• שם מלא ופרטי קשר (דוא"ל, מספר טלפון).\n• כתובת משלוח.\n• נתוני תשלום (מעובדים באופן מאובטח דרך שערי תשלום מוסמכים; איננו שומרים אותם).\n• היסטוריית הזמנות ורכישות.\n• נתוני גלישה באתר (עוגיות וכתובת IP).`,
      },
      {
        title: "כיצד אנו משתמשים במידע שלך",
        body: `אנו משתמשים במידע שלך למטרות הבאות:\n• עיבוד והעברת ההזמנות שלך.\n• תקשורת איתך בנוגע להזמנותיך ושירות לקוחות.\n• שליחת הצעות ועדכונים (ניתן לבטל את המנוי בכל עת).\n• שיפור חוויתך באתר.\n• עמידה בדרישות חוקיות.`,
      },
      {
        title: "הגנה על המידע שלך",
        body: `אנו נוקטים אמצעי אבטחה קפדניים כדי להגן על המידע האישי שלך מפני גישה בלתי מורשית, חשיפה, שינוי או מחיקה. אנו משתמשים בפרוטוקול HTTPS מוצפן לכל התקשורת ושומרים את הנתונים בשרתים מאובטחים.`,
      },
      {
        title: "שיתוף מידע עם צדדים שלישיים",
        body: `איננו מוכרים, מחכירים או סוחרים במידע האישי שלך עם צדדים שלישיים. אנו עשויים לשתף את הנתונים שלך רק עם:\n• חברות שילוח ומשלוחים לביצוע הזמנותיך.\n• שערי תשלום לעיבוד עסקאות פיננסיות.\n• גורמים משפטיים כאשר נדרש על פי חוק.`,
      },
      {
        title: "עוגיות",
        body: `אנו משתמשים בעוגיות כדי לשפר את חוויתך באתר ולזכור את העדפותיך. ניתן להשבית עוגיות בהגדרות הדפדפן, אך הדבר עלול להשפיע על חלק מפונקציות האתר.`,
      },
      {
        title: "הזכויות שלך",
        body: `יש לך את הזכות:\n• לעיין במידע האישי שלך השמור אצלנו.\n• לתקן נתונים לא מדויקים.\n• לבקש מחיקת המידע שלך.\n• לבטל מנוי להודעות שיווקיות.\nלבירורים בנוגע לזכויות אלו, צור איתנו קשר דרך עמוד צור קשר.`,
      },
      {
        title: "עדכונים למדיניות",
        body: `אנו שומרים לעצמנו את הזכות לשנות מדיניות זו בכל עת. תקבל הודעה על שינויים מהותיים כלשהם בדוא"ל או בהודעה באתר. המשך השימוש שלך באתר לאחר פרסום השינויים מהווה הסכמתך אליהם.`,
      },
    ],
  },
};

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const c = content[locale] ?? content.ar;

  return (
    <div className="store-shell py-10 md:py-14">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-secondary">{c.title}</h1>
        <p className="mt-2 text-sm text-secondary/50">{c.subtitle}</p>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl space-y-4">
        {c.sections.map((section, i) => (
          <div key={i} className="store-card p-6 md:p-7">
            <h2 className="mb-3 flex items-center gap-2 text-base font-black text-secondary">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-black text-black">
                {i + 1}
              </span>
              {section.title}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-secondary/70">
              {section.body}
            </p>
          </div>
        ))}

        {/* Contact note */}
        <div className="store-card border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-sm font-semibold text-secondary">{c.contactNote}</p>
          <Link
            href="/cms/contact"
            className="store-btn-primary mt-3 inline-flex items-center justify-center px-8 text-sm"
          >
            {c.contactCta}
          </Link>
        </div>
      </div>

    </div>
  );
}
