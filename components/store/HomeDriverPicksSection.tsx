import { Link } from "@/i18n/navigation";
import type { FeaturedBlock } from "@/lib/api";

type Props = {
  blocks: FeaturedBlock[];
  title: string;
  viewAll: string;
};

/**
 * Quick links from featured home categories (reference: driver essentials row).
 */
export function HomeDriverPicksSection({ blocks, title, viewAll }: Props) {
  if (blocks.length === 0) {
    return null;
  }
  const rows = blocks.slice(0, 8);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-secondary">{title}</h2>
        <Link
          href="/shop/categories"
          className="text-sm font-medium text-primary hover:underline"
        >
          {viewAll}
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {rows.map((b) => (
          <li key={b.category.id}>
            <Link
              href={`/shop/categories/${b.category.id}`}
              className="store-card flex min-h-[3rem] items-center justify-center px-2 py-2 text-center text-xs font-semibold text-secondary sm:text-sm hover:border-primary/30"
            >
              {b.category.name ?? `#${b.category.id}`}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
