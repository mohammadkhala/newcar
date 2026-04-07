import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchProductBrands, getApiBaseUrl } from "@/lib/api";

type Props = { params: Promise<{ locale: string }> };

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Brands");
  const data = getApiBaseUrl()
    ? await fetchProductBrands("48", "1")
    : null;
  const brands = data?.brands ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">{t("title")}</h1>
      {brands.length === 0 ? (
        <p className="text-sm text-secondary/80">{t("empty")}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {brands.map((b) => (
            <li key={b.id}>
              <Link
                href={`/shop/brands/${encodeURIComponent(b.slug)}`}
                className="block rounded-xl border border-surface-muted bg-white p-4 text-center shadow-sm hover:bg-surface-muted/30"
              >
                <span className="font-medium text-secondary">{b.name}</span>
                {b.products_count != null && (
                  <span className="mt-1 block text-xs text-secondary/70">
                    {b.products_count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
