import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { CampaignBannerRow } from "@/lib/types";

type Props = {
  items: CampaignBannerRow[];
};

/**
 * Promotional campaign strip; each banner is clickable to product/category target.
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
            <li key={item.id} className="store-card overflow-hidden">
              <Link href={item.target_url ?? "#"} className="group block" aria-label={item.title}>
                <div className="relative aspect-[69/26] w-full bg-surface-muted">
                  <Image
                    src={src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

