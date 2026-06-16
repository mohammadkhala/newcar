import Image from "next/image";
import { Link } from "@/i18n/navigation";

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
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      width={120}
                      height={56}
                      unoptimized
                      className="h-14 w-auto object-contain"
                    />
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
                      {item.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <span className="line-clamp-2 text-sm font-semibold text-secondary">
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
