import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

export type HomeServiceRow = {
  id: number;
  slug: string;
  title?: string;
  summary?: string;
  image?: string;
  image_full_url?: string;
  icon?: string;
};

type Props = {
  items: HomeServiceRow[];
  title: string;
  subtitle: string;
  viewAll: string;
  readMore: string;
};

function excerpt(raw: string | undefined, maxLen: number): string {
  if (!raw?.trim()) {
    return "";
  }
  const plain = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLen) {
    return plain;
  }
  return `${plain.slice(0, maxLen).trim()}…`;
}

function serviceImageSrc(row: HomeServiceRow): string | null {
  const fromApi =
    typeof row.image_full_url === "string" ? row.image_full_url.trim() : "";
  if (fromApi && !fromApi.includes("img2.jpg")) {
    return resolveMediaUrl(fromApi, { defaultFolder: "service" });
  }
  return resolveMediaUrl(
    typeof row.image === "string" ? row.image : null,
    { defaultFolder: "service" },
  );
}

/**
 * Storefront home block for CMS services (same data as admin Services).
 */
export function HomeServicesSection({
  items,
  title,
  subtitle,
  viewAll,
  readMore,
}: Props) {
  const valid = items.filter(
    (s) => typeof s.slug === "string" && s.slug.length > 0,
  );
  if (valid.length === 0) {
    return null;
  }

  const shown = valid.slice(0, 6);

  return (
    <section className="store-card px-4 py-6 md:px-6">
      <div className="cdz-block-title text-center">
        <h2 className="text-2xl font-black text-secondary">{title}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-secondary/85">
          {subtitle}
        </p>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((row) => {
          const img = serviceImageSrc(row);
          const name = row.title?.trim() || row.slug;
          const blurb = excerpt(row.summary, 140);

          return (
            <li key={row.id}>
              <Link
                href={`/cms/services/${encodeURIComponent(row.slug)}`}
                className="store-panel flex h-full flex-col overflow-hidden transition-colors hover:border-primary/35"
              >
                <div className="relative aspect-video w-full bg-surface-muted/60">
                  {img ? (
                    <Image
                      src={img}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-primary/40">
                      {row.icon?.trim() ? (
                        <span aria-hidden>{row.icon.trim()}</span>
                      ) : (
                        <span aria-hidden className="font-black">
                          {name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-base font-bold text-secondary">{name}</h3>
                  {blurb ? (
                    <p className="line-clamp-3 text-sm text-secondary/80">
                      {blurb}
                    </p>
                  ) : null}
                  <span className="mt-auto pt-2 text-sm font-semibold text-primary">
                    {readMore}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 text-center">
        <Link
          href="/cms/services"
          className="store-btn-primary inline-flex items-center justify-center px-6 text-sm"
        >
          {viewAll}
        </Link>
      </div>
    </section>
  );
}
