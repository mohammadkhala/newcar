import { Link } from "@/i18n/navigation";
import { FallbackImg } from "@/components/store/FallbackImg";

type HomeCategoryVisualItem = {
  id: number;
  name: string;
  imageSrc: string | null;
};

type Props = {
  items: HomeCategoryVisualItem[];
  title: string;
  subtitle: string;
  viewAll: string;
};

/**
 * Visual "shop by category" section with image cards.
 */
export function HomeCategoryVisualSection({
  items,
  title,
  subtitle,
  viewAll,
}: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <section className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-black text-secondary">{title}</h2>
          <p className="mt-1 text-sm text-secondary/80">{subtitle}</p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/shop/categories/${item.id}`}
                className="store-card flex min-h-[7.5rem] flex-col items-center justify-center gap-2 px-3 py-3 text-center hover:border-primary/30"
              >
                <div className="flex h-[3.5rem] w-full items-center justify-center">
                  <FallbackImg
                    src={item.imageSrc ?? "/logo.png"}
                    alt={item.name}
                    width={120}
                    height={56}
                    className="h-14 w-auto object-contain"
                    fallbackClassName="h-14 w-auto object-contain opacity-60"
                  />
                </div>
                <span className="line-clamp-2 text-sm font-semibold text-black">
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="text-center">
        <Link
          href="/shop/categories"
          className="text-sm font-medium text-primary hover:underline"
        >
          {viewAll}
        </Link>
      </div>
    </>
  );
}
