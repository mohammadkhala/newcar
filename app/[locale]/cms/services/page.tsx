import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchServices, getApiBaseUrl } from "@/lib/api";

type Props = { params: Promise<{ locale: string }> };

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CMS");
  const list = getApiBaseUrl() ? await fetchServices() : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold text-secondary">{t("servicesTitle")}</h1>
      <ul className="space-y-2">
        {list.map((item, i) => {
          const row = item as { slug?: string; title?: string; name?: string };
          const slug = row.slug;
          if (!slug) {
            return null;
          }
          return (
            <li key={i}>
              <Link
                href={`/cms/services/${encodeURIComponent(slug)}`}
                className="block rounded-lg border border-surface-muted px-4 py-3 hover:bg-surface-muted/40"
              >
                {row.title ?? row.name ?? slug}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
