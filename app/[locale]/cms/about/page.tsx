import { BackButton } from "@/components/store/BackButton";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const values = [
    {
      icon: "🏆",
      title: "الجودة أولاً",
      desc: "نختار كل منتج بعناية فائقة لضمان أعلى معايير الجودة لعملائنا.",
    },
    {
      icon: "🚗",
      title: "خبرة في عالم السيارات",
      desc: "سنوات من الخبرة في سوق كماليات السيارات تجعلنا الخيار الأمثل لك.",
    },
    {
      icon: "💎",
      title: "تنوع المنتجات",
      desc: "مئات المنتجات من أفضل الماركات العالمية تحت سقف واحد.",
    },
    {
      icon: "🤝",
      title: "خدمة العملاء",
      desc: "فريقنا دائماً متاح لمساعدتك في اختيار المنتج المناسب لسيارتك.",
    },
    {
      icon: "🚀",
      title: "توصيل سريع",
      desc: "نوصل طلبك إلى باب بيتك في أسرع وقت ممكن بكل أمان.",
    },
    {
      icon: "🔒",
      title: "دفع آمن",
      desc: "خيارات دفع متعددة وآمنة تناسب جميع العملاء.",
    },
  ];

  return (
    <div className="store-shell py-10 md:py-14">
      <BackButton className="mb-6" />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary via-amber-400 to-yellow-300 px-8 py-14 text-center text-black md:px-16">
        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
              <Image
                src="/logo.png"
                alt="NEW CAR"
                width={64}
                height={64}
                className="object-contain p-1"
              />
            </div>
          </div>
          <h1 className="text-3xl font-black md:text-4xl">تعرّف علينا</h1>
          <p className="mt-4 text-base font-medium opacity-80 md:text-lg">
            متجرك الأول لكماليات وإكسسوارات السيارات
          </p>
        </div>
        <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 start-8 h-28 w-28 rounded-full bg-white/10" />
      </div>

      {/* About text */}
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="store-card space-y-4 p-6 md:p-8">
          <h2 className="text-xl font-black text-secondary">من نحن</h2>
          <p className="leading-relaxed text-secondary/75">
            نيو كار هو متجر متخصص في كماليات وإكسسوارات السيارات، يقدم لك أفضل
            المنتجات من أشهر الماركات العالمية بأسعار تنافسية. نسعى دائماً لتوفير
            تجربة تسوق مريحة وموثوقة لكل عشاق السيارات.
          </p>
          <p className="leading-relaxed text-secondary/75">
            انطلقنا بهدف واضح: جعل عملية الحصول على قطع الغيار والكماليات الأصلية
            أمراً سهلاً وبسيطاً لكل سائق، مع ضمان الجودة والأصالة في كل منتج نقدمه.
          </p>
        </div>

        <div className="store-card space-y-4 p-6 md:p-8">
          <h2 className="text-xl font-black text-secondary">رسالتنا ورؤيتنا</h2>
          <div className="space-y-3">
            <div className="rounded-xl bg-primary/5 p-4 ring-1 ring-primary/20">
              <p className="text-sm font-black text-primary">رسالتنا</p>
              <p className="mt-1 text-sm leading-relaxed text-secondary/75">
                تقديم أفضل كماليات السيارات بجودة عالية وخدمة متميزة تليق
                بثقة عملائنا.
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <p className="text-sm font-black text-amber-700">رؤيتنا</p>
              <p className="mt-1 text-sm leading-relaxed text-secondary/75">
                أن نكون الوجهة الأولى والأكثر موثوقية لكماليات السيارات في
                منطقتنا.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mt-12">
        <h2 className="mb-6 text-center text-2xl font-black text-secondary">
          لماذا تختارنا؟
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.title}
              className="store-card flex gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="shrink-0 text-3xl leading-none">{v.icon}</span>
              <div>
                <p className="font-black text-secondary">{v.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-secondary/60">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 store-card border-primary/20 bg-gradient-to-l from-primary/5 to-white p-8 text-center">
        <h2 className="text-xl font-black text-secondary">
          ابدأ تجربة التسوق الآن
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-secondary/70">
          اكتشف مئات المنتجات التي تناسب سيارتك وأسلوبك
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop/search"
            className="store-btn-primary inline-flex items-center justify-center px-8 text-sm"
          >
            تسوق الآن
          </Link>
          <Link
            href="/cms/contact"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl border border-border-soft bg-white px-8 text-sm font-semibold text-secondary transition hover:border-primary/30 hover:text-primary"
          >
            تواصل معنا
          </Link>
        </div>
      </div>

    </div>
  );
}
