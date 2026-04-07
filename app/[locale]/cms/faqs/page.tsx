import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchFaqs, getApiBaseUrl } from "@/lib/api";

type Props = { params: Promise<{ locale: string }> };

export default async function FaqsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CMS");
  const list = getApiBaseUrl() ? await fetchFaqs() : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold text-secondary">{t("faqsTitle")}</h1>
      <ul className="space-y-4">
        {list.map((item, i) => {
          const row = item as { question?: string; answer?: string };
          return (
            <li
              key={i}
              className="rounded-xl border border-surface-muted bg-white p-4 shadow-sm"
            >
              <h2 className="font-semibold text-secondary">{row.question}</h2>
              <div
                className="mt-2 text-sm text-secondary/90"
                dangerouslySetInnerHTML={{ __html: row.answer ?? "" }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
