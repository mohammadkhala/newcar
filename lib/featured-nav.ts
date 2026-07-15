import { unstable_cache } from "next/cache";
import {
  fetchCategoryChildren,
  fetchRootCategories,
  getApiBaseUrl,
} from "@/lib/api";
import { apiLocalizationHeaders } from "@/lib/server-locale-headers";
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

type MegaNavApiNode = {
  id: number;
  name?: string | null;
  image?: string | null;
  image_fullpath?: string | null;
  image_full_url?: string | null;
  children?: MegaNavApiNode[];
};

function megaApiNodeToTree(node: MegaNavApiNode): CategoryTreeNode {
  const row = {
    id: node.id,
    name: node.name ?? `#${node.id}`,
    image: node.image ?? undefined,
    image_fullpath: node.image_fullpath ?? undefined,
    image_full_url: node.image_full_url ?? undefined,
  } as CategoryRow;

  return {
    id: node.id,
    name: row.name ?? `#${node.id}`,
    imageSrc: categoryDisplayImageSrc(row),
    children: (node.children ?? []).map(megaApiNodeToTree),
  };
}

async function fetchMegaNavFromApi(): Promise<CategoryTreeNode[] | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  try {
    const locHeaders = await apiLocalizationHeaders();
    const res = await fetch(`${base}/categories/mega-nav`, {
      headers: { Accept: "application/json", ...locHeaders },
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { items?: MegaNavApiNode[] };
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return null;
    }
    return data.items.map(megaApiNodeToTree);
  } catch {
    return null;
  }
}

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

/** Fallback when Laravel mega-nav is unavailable. */
async function buildFeaturedNavTreeLegacy(): Promise<CategoryTreeNode[]> {
  const roots = await fetchRootCategories().catch(() => [] as CategoryRow[]);
  const rootById = new Map(roots.map((r) => [r.id, r]));

  const settled = await Promise.allSettled(
    FEATURED_NAV_IDS.map(async (fid) => {
      const row = rootById.get(fid);
      if (!row) return null;
      const node = rowToNode(row);
      try {
        await fillChildren(node, 0, 2);
      } catch {
        /* parent-only */
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

async function buildFeaturedNavTree(): Promise<CategoryTreeNode[]> {
  const fromApi = await fetchMegaNavFromApi();
  if (fromApi && fromApi.length > 0) {
    return fromApi;
  }
  return buildFeaturedNavTreeLegacy();
}

/**
 * Cached mega-menu tree shared across requests (10 min).
 */
export const getCachedFeaturedNav = unstable_cache(
  async () => buildFeaturedNavTree(),
  ["store-featured-nav-v3-mega"],
  { revalidate: 600 },
);
