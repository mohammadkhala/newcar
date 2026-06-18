import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

const sections = [
  {
    title: "مقدمة",
    body: `نيو كار يلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. تصف هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها عند استخدامك لموقعنا الإلكتروني أو تطبيقنا.`,
  },
  {
    title: "المعلومات التي نجمعها",
    body: `نجمع المعلومات التالية عند تسجيلك أو استخدامك لخدماتنا:
• الاسم الكامل وبيانات الاتصال (البريد الإلكتروني، رقم الهاتف).
• عنوان التوصيل.
• بيانات الدفع (يتم معالجتها بشكل آمن عبر بوابات الدفع المعتمدة ولا نحتفظ بها).
• سجل الطلبات والمشتريات.
• بيانات تصفح الموقع (ملفات الكوكيز وعنوان IP).`,
  },
  {
    title: "كيف نستخدم معلوماتك",
    body: `نستخدم معلوماتك للأغراض التالية:
• معالجة طلباتك وتوصيلها إليك.
• التواصل معك بشأن طلباتك وخدمة العملاء.
• إرسال عروض وتحديثات (يمكنك إلغاء الاشتراك في أي وقت).
• تحسين تجربتك على الموقع.
• الامتثال للمتطلبات القانونية.`,
  },
  {
    title: "حماية بياناتك",
    body: `نتخذ إجراءات أمنية صارمة لحماية بياناتك الشخصية من الوصول غير المصرح به أو الكشف أو التعديل أو الحذف. نستخدم بروتوكول HTTPS المشفر لجميع الاتصالات، ونخزن البيانات على خوادم آمنة.`,
  },
  {
    title: "مشاركة المعلومات مع أطراف ثالثة",
    body: `لا نبيع أو نؤجر أو نتاجر بمعلوماتك الشخصية مع أطراف ثالثة. قد نشارك بياناتك فقط مع:
• شركات الشحن والتوصيل لإتمام طلباتك.
• بوابات الدفع لمعالجة المعاملات المالية.
• الجهات القانونية عند الاقتضاء القانوني.`,
  },
  {
    title: "ملفات الكوكيز",
    body: `نستخدم ملفات الكوكيز لتحسين تجربتك على الموقع وتذكر تفضيلاتك. يمكنك تعطيل الكوكيز من إعدادات المتصفح، لكن قد يؤثر ذلك على بعض وظائف الموقع.`,
  },
  {
    title: "حقوقك",
    body: `لديك الحق في:
• الاطلاع على بياناتك الشخصية المخزنة لدينا.
• تصحيح أي بيانات غير دقيقة.
• طلب حذف بياناتك.
• إلغاء الاشتراك في الرسائل التسويقية.
للاستفسار عن أي من هذه الحقوق، تواصل معنا عبر صفحة اتصل بنا.`,
  },
  {
    title: "التعديلات على سياسة الخصوصية",
    body: `نحتفظ بالحق في تعديل هذه السياسة في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع. استمرارك في استخدام الموقع بعد نشر التغييرات يعني قبولك لها.`,
  },
];

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="store-shell py-10 md:py-14">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-secondary">سياسة الخصوصية</h1>
        <p className="mt-2 text-sm text-secondary/50">
          آخر تحديث: {new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl space-y-4">
        {sections.map((section, i) => (
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
          <p className="text-sm font-semibold text-secondary">
            للاستفسار عن سياسة الخصوصية أو ممارسة حقوقك
          </p>
          <a
            href={`/${locale}/cms/contact`}
            className="store-btn-primary mt-3 inline-flex items-center justify-center px-8 text-sm"
          >
            تواصل معنا
          </a>
        </div>
      </div>

    </div>
  );
}
