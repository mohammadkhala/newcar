/**
 * Vehicle options with no fitted products are shown greyed out ("coming soon")
 * instead of leading shoppers to an empty result page.
 */
type Countable = { products_count?: number };

/** Older API builds send no count — treat those options as available. */
export function hasProducts(item: Countable): boolean {
  return item.products_count === undefined || item.products_count > 0;
}

/** Available options first; original order kept within each group. */
export function availableFirst<T extends Countable>(items: T[]): T[] {
  return [...items.filter(hasProducts), ...items.filter((i) => !hasProducts(i))];
}
