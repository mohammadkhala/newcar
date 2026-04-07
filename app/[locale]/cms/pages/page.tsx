import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchPages, getApiBaseUrl } from "@/lib/api";

type Props = { params: Promise<{ locale: string }> };

export default async function CmsPagesIndex({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CMS");
  const pages = getApiBaseUrl() ? await fetchPages() : [];

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
      <h1 className="text-2xl font-bold text-secondary">{t("pagesTitle")}</h1>
      <ul className="space-y-2 text-sm">
        {pages.map((p, i) => (
          <li key={i} className="rounded-lg border border-surface-muted p-3">
            <pre className="whitespace-pre-wrap font-sans text-secondary/90">
              {JSON.stringify(p, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
