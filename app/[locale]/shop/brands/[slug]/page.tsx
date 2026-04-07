import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import {
  fetchConfig,
  fetchProductBrandProducts,
  getApiBaseUrl,
} from "@/lib/api";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ offset?: string; sort_by?: string }>;
};

export default async function BrandProductsPage({
  params,
  searchParams,
}: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("Brands");
  const offset = sp.offset ?? "1";
  const sortBy = sp.sort_by ?? "latest";

  const data =
    getApiBaseUrl() &&
    (await fetchProductBrandProducts(slug, {
      limit: "12",
      offset,
      sort_by: sortBy,
    }));

  if (!data) {
    notFound();
  }

  const config = await fetchConfig();
  const currencyCode =
    (config?.currency_code as string | undefined) || "ILS";

  const products = data.products ?? [];
  const total = data.total_size ?? 0;
  const limitNum = 12;
  const offsetNum = Number(offset) || 1;
  const shownSoFar = (offsetNum - 1) * limitNum + products.length;
  const hasPrev = offsetNum > 1;
  const hasNext = shownSoFar < total;

  function pageHref(next: number): string {
    const q = new URLSearchParams();
    q.set("offset", String(next));
    q.set("sort_by", sortBy);
    return `/shop/brands/${encodeURIComponent(slug)}?${q.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">
          {data.brand.name}
        </h1>
        <p className="text-sm text-secondary/80">{t("products")}</p>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-secondary/80">{t("empty")}</p>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} currencyCode={currencyCode} />
              </li>
            ))}
          </ul>
          <nav className="flex flex-wrap justify-center gap-3">
            {hasPrev && (
              <Link
                href={pageHref(offsetNum - 1)}
                className="rounded-lg border border-surface-muted px-4 py-2 text-sm"
              >
                Prev
              </Link>
            )}
            {hasNext && (
              <Link
                href={pageHref(offsetNum + 1)}
                className="rounded-lg border border-surface-muted px-4 py-2 text-sm"
              >
                Next
              </Link>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
