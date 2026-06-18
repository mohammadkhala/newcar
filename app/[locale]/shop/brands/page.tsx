import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
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
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {brands.map((b) => {
            const imgSrc = b.image_full_url ?? b.image ?? null;
            return (
              <li key={b.id}>
                <Link
                  href={`/shop/brands/${encodeURIComponent(b.slug)}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-surface-muted bg-white p-4 text-center shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-16 w-full items-center justify-center">
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={b.name}
                        width={96}
                        height={64}
                        className="max-h-16 w-auto max-w-full object-contain"
                        unoptimized
                      />
                    ) : (
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted text-xl font-black text-secondary/40">
                        {b.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-black group-hover:text-primary">
                    {b.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
