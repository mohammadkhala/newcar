import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fetchRootCategories, getApiBaseUrl } from "@/lib/api";
import { categoryDisplayImageSrc } from "@/lib/category-image";

type Props = { params: Promise<{ locale: string }> };

export default async function CategoriesIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Categories");
  const list = getApiBaseUrl() ? await fetchRootCategories() : [];

  return (
    <div className="store-shell space-y-6 py-8">
      <h1 className="text-2xl font-bold text-secondary md:text-3xl">
        {t("title")}
      </h1>
      {list.length === 0 ? (
        <p className="text-sm text-secondary/80">{t("empty")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {list.map((c) => {
            const img = categoryDisplayImageSrc(c);
            const label = c.name ?? `#${c.id}`;

            return (
              <li key={c.id}>
                <Link
                  href={`/shop/categories/${c.id}`}
                  className="store-panel flex h-full flex-col overflow-hidden transition-colors hover:border-primary/35"
                >
                  <div className="relative aspect-[4/3] w-full bg-surface-muted/70">
                    {img ? (
                      <Image
                        src={img}
                        alt={label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl font-black text-primary/25">
                        {label.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <span className="font-semibold text-secondary">{label}</span>
                    {c.products_count != null ? (
                      <span className="text-xs text-secondary/70">
                        {c.products_count}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
