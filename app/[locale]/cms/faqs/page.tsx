import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchFaqs, getApiBaseUrl } from "@/lib/api";
import { FaqsAccordion } from "@/components/cms/FaqsAccordion";
import { BackButton } from "@/components/store/BackButton";

type Props = { params: Promise<{ locale: string }> };

export default async function FaqsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CMS");
  const raw = getApiBaseUrl() ? await fetchFaqs() : [];

  const list = (raw as { question?: string; answer?: string }[])
    .filter((r) => r.question)
    .map((r) => ({ question: r.question!, answer: r.answer ?? "" }));

  return (
    <div className="store-shell py-10 md:py-14">
      <BackButton className="mb-6" />

      {/* Header */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-l from-primary via-amber-400 to-yellow-300 px-8 py-12 text-center text-black">
        <div className="relative z-10">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-black/10 text-3xl font-black">
            ؟
          </div>
          <h1 className="text-3xl font-black">{t("faqsTitle")}</h1>
          <p className="mt-2 text-sm font-medium opacity-70">
            إجابات على أكثر الأسئلة شيوعاً من عملائنا
          </p>
        </div>
        <div className="absolute -end-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 start-8 h-24 w-24 rounded-full bg-white/10" />
      </div>

      {/* Accordion */}
      <div className="mx-auto max-w-3xl">
        <FaqsAccordion items={list} />
      </div>

      {/* Contact CTA */}
      <div className="mx-auto mt-10 max-w-3xl">
        <div className="store-card border-primary/20 bg-primary/5 p-6 text-center">
          <p className="font-black text-secondary">لم تجد إجابة على سؤالك؟</p>
          <p className="mt-1 text-sm text-secondary/60">
            فريقنا جاهز للإجابة على استفساراتك
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
