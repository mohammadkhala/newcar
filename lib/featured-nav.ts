import { unstable_cache } from "next/cache";
import { fetchCategoryChildren, fetchRootCategories } from "@/lib/api";
import { categoryDisplayImageSrc } from "@/lib/category-image";
import type { CategoryRow, CategoryTreeNode } from "@/lib/types";

/** Mirrors hala-car secondary nav order. */
export const FEATURED_NAV_IDS = [38, 36, 26, 22, 37];

function rowToNode(row: CategoryRow): CategoryTreeNode {
  return {
    id: row.id,
    name: row.name ?? `#${row.id}`,
    imageSrc: categoryDisplayImageSrc(row),
    children: [],
  };
}

/**
 * Fill one level of children only (depth capped). Parallelize siblings; avoid
 * recursive fan-out beyond maxDepth that used to fire dozens of Laravel calls.
 */
async function fillChildren(
  node: CategoryTreeNode,
  depth: number,
  maxDepth: number,
): Promise<void> {
  if (depth >= maxDepth) {
    return;
  }
  const rows = await fetchCategoryChildren(node.id);
  node.children = await Promise.all(
    rows.map(async (r) => {
      const cn = rowToNode(r);
      await fillChildren(cn, depth + 1, maxDepth);
      return cn;
    }),
  );
}

async function buildFeaturedNavTree(): Promise<CategoryTreeNode[]> {
  const roots = await fetchRootCategories().catch(() => [] as CategoryRow[]);
  const rootById = new Map(roots.map((r) => [r.id, r]));

  const settled = await Promise.allSettled(
    FEATURED_NAV_IDS.map(async (fid) => {
      const row = rootById.get(fid);
      if (!row) return null;
      const node = rowToNode(row);
      try {
        // Depth 2 is enough for mega menus and halves worst-case Laravel calls.
        await fillChildren(node, 0, 2);
      } catch {
        // Parent-only node is still usable in the bar.
      }
      return node;
    }),
  );

  return settled
    .filter(
      (r): r is PromiseFulfilledResult<CategoryTreeNode | null> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .filter((x): x is CategoryTreeNode => x !== null);
}

/**
 * Cached mega-menu tree shared across requests (10 min). Bypasses per-request
 * recursive category/childes storms that dominated home TTFB.
 */
export const getCachedFeaturedNav = unstable_cache(
  async () => buildFeaturedNavTree(),
  ["store-featured-nav-v2"],
  { revalidate: 600 },
);
