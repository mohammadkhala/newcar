import { cookies } from "next/headers";
import {
  fetchCategoryChildren,
  fetchLanguages,
  fetchRootCategories,
  fetchVehicleBrands,
  getApiBaseUrl,
} from "@/lib/api";
import { categoryDisplayImageSrc } from "@/lib/category-image";
import { StoreHeaderBody } from "@/components/store/StoreHeaderBody";
import type {
  CategoryRow,
  CategoryTreeNode,
  LanguageOption,
  VehicleBrandsResponse,
} from "@/lib/types";

const FEATURED_NAV_IDS = [38, 36, 26, 22, 214];

function rowToNode(row: CategoryRow): CategoryTreeNode {
  return {
    id: row.id,
    name: row.name ?? `#${row.id}`,
    imageSrc: categoryDisplayImageSrc(row),
    children: [],
  };
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

/**
 * Server header: loads navigation trees, vehicle brands, languages, and auth hint from cookie for the storefront shell.
 */
export async function StoreHeader() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get("nc_access_token")?.value);
  const apiConfigured = Boolean(getApiBaseUrl());

  let navCategories: {
    id: number;
    name: string;
    imageSrc: string | null;
  }[] = [];
  let languageOptions: LanguageOption[] = [];
  let vehicleBrands: Awaited<
    ReturnType<typeof fetchVehicleBrands>
  >["brands"] = [];
  let featuredNavItems: CategoryTreeNode[] = [];

  if (apiConfigured) {
    try {
      const [roots, brandsRes, langs] = await Promise.all([
        fetchRootCategories(),
        fetchVehicleBrands().catch(
          () =>
            ({
              brands: [] as VehicleBrandsResponse["brands"],
            }) satisfies Pick<VehicleBrandsResponse, "brands">,
        ),
        fetchLanguages().catch(() => [] as LanguageOption[]),
      ]);
      navCategories = roots.map((c) => ({
        id: c.id,
        name: c.name ?? `#${c.id}`,
        imageSrc: categoryDisplayImageSrc(c),
      }));
      vehicleBrands = brandsRes.brands ?? [];
      languageOptions = langs;

      const rootById = new Map(roots.map((r) => [r.id, r]));
      featuredNavItems = (
        await Promise.all(
          FEATURED_NAV_IDS.map(async (fid) => {
            const row = rootById.get(fid);
            if (!row) {
              return null;
            }
            const node = rowToNode(row);
            await fillChildren(node, 0, 3);
            return node;
          }),
        )
      ).filter((x): x is CategoryTreeNode => x !== null);
    } catch {
      navCategories = [];
      languageOptions = [];
      vehicleBrands = [];
      featuredNavItems = [];
    }
  }

  return (
    <header className="sticky top-0 z-[300]">
      <StoreHeaderBody
        navCategories={navCategories}
        languageOptions={languageOptions}
        isAuthenticated={isAuthenticated}
        featuredNavItems={featuredNavItems}
        vehicleBrands={vehicleBrands}
        apiConfigured={apiConfigured}
      />
    </header>
  );
}
