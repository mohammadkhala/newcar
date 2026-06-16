import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { CampaignBannerRow } from "@/lib/types";

type Props = {
  items: CampaignBannerRow[];
};

/**
 * Small corner ornament shown on every promo card — brand orange (matches the logo's
 * star/car-icon color), not tied to any banner data — purely visual.
 */
function PromoCardOrnament() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="absolute end-2 top-2 h-7 w-7 text-primary drop-shadow-[0_0_4px_rgba(0,0,0,0.6)]"
      fill="currentColor"
    >
      <path d="M12 1.5c.9 2.4 2.1 3.9 4 5.3-1.9 1.4-3.1 2.9-4 5.3-.9-2.4-2.1-3.9-4-5.3 1.9-1.4 3.1-2.9 4-5.3Z" />
      <path d="M5.2 13.8c.5 1.3 1.1 2.1 2.2 2.9-1.1.8-1.7 1.6-2.2 2.9-.5-1.3-1.1-2.1-2.2-2.9 1.1-.8 1.7-1.6 2.2-2.9Z" />
      <path d="M18.8 13.8c.5 1.3 1.1 2.1 2.2 2.9-1.1.8-1.7 1.6-2.2 2.9-.5-1.3-1.1-2.1-2.2-2.9 1.1-.8 1.7-1.6 2.2-2.9Z" />
    </svg>
  );
}

/**
 * Promotional campaign strip; each banner is clickable to product/category target.
 * Renders `items` in array order: two columns on md+ (row: left, right, then next row).
 * Dark gradient + title overlay + brand-orange corner ornament.
 */
export function CampaignPromoGrid({ items }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const raw = item.image_full_url ?? item.image ?? null;
          const src = resolveMediaUrl(raw, { defaultFolder: "campaign-banners" });
          if (!src) {
            return null;
          }

          return (
            <li key={item.id} className="store-card overflow-hidden rounded-2xl bg-black">
              <Link href={item.target_url ?? "#"} className="group block" aria-label={item.title}>
                <div className="relative aspect-[69/26] w-full bg-black">
                  <Image
                    src={src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
                  <PromoCardOrnament />
                  {item.title ? (
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <p className="line-clamp-2 text-sm font-bold text-white drop-shadow-sm">
                        {item.title}
                      </p>
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
