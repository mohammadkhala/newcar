"use client";

import { Link } from "@/i18n/navigation";
import { CategoryThumb } from "@/components/store/header/CategoryThumb";
import type { NavCategoryItem } from "@/components/store/header/types";

type Props = {
  navCategories: NavCategoryItem[];
  emptyLabel: string;
  onNavigate: () => void;
};

export function CategoryMegaGrid({ navCategories, emptyLabel, onNavigate }: Props) {
  return (
    <div className="grid max-h-[min(75vh,36rem)] grid-cols-2 content-start gap-4 overflow-y-auto p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {navCategories.length === 0 ? (
        <div className="col-span-full py-8 text-center text-secondary/60">
          {emptyLabel}
        </div>
      ) : (
        navCategories.map((category) => (
          <Link
            key={category.id}
            href={`/shop/categories/${category.id}`}
            className="group flex flex-col items-center gap-3 rounded-xl border border-transparent p-3 text-center transition-all hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm"
            onClick={onNavigate}
          >
            <CategoryThumb imageSrc={category.imageSrc} label={category.name} size={64} />
            <span className="line-clamp-2 text-sm font-bold text-black group-hover:text-primary">
              {category.name}
            </span>
          </Link>
        ))
      )}
    </div>
  );
}
