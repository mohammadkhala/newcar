import { cookies } from "next/headers";
import {
  fetchCategoryChildren,
  fetchConfig,
  fetchLanguages,
  fetchRootCategories,
  fetchVehicleBrands,
  getApiBaseUrl,
} from "@/lib/api";
import { categoryDisplayImageSrc } from "@/lib/category-image";
import { resolveStoreLogoUrl } from "@/lib/resolve-store-logo";
import { StoreHeaderBody } from "@/components/store/StoreHeaderBody";
import { StoreHeaderCategoriesBar } from "@/components/store/header/StoreHeaderCategoriesBar";
import type {
  CategoryRow,
  CategoryTreeNode,
  LanguageOption,
  VehicleBrandsResponse,
} from "@/lib/types";

// 38=تسوق حسب القطعة, 36=ماركات عالمية, 26=راحة وخدمة السائق, 22=العناية وتنظيف السيارة,
// 37=VIP كماليات فارهه و فاخرة — mirrors hala-car's secondary nav order.
const FEATURED_NAV_IDS = [38, 36, 26, 22, 37];

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

  const config = (await fetchConfig().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const storeLogoSrc = resolveStoreLogoUrl(config) || "/logo.png";
  const storeLogoAlt = String(
    (config?.business_name as string) ||
      (config?.ecommerce_name as string) ||
      "NEW CAR",
  ).trim() || "NEW CAR";
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
    const [roots, brandsRes, langs] = await Promise.all([
      fetchRootCategories().catch(() => [] as CategoryRow[]),
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
      await Promise.allSettled(
        FEATURED_NAV_IDS.map(async (fid) => {
          const row = rootById.get(fid);
          if (!row) return null;
          const node = rowToNode(row);
          try {
            await fillChildren(node, 0, 3);
          } catch {
            // Children failed to load — show parent node without submenu
          }
          return node;
        }),
      )
    )
      .filter((r): r is PromiseFulfilledResult<CategoryTreeNode | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((x): x is CategoryTreeNode => x !== null);
  }

  return (
    <>
      <header className="relative z-[300]">
        <StoreHeaderBody
          languageOptions={languageOptions}
          isAuthenticated={isAuthenticated}
          storeLogoSrc={storeLogoSrc}
          storeLogoAlt={storeLogoAlt}
        />
      </header>

      {/* Sibling of <main>, not nested in the header block above — see
          StoreHeaderCategoriesBar's docstring for why this is required for `sticky`
          to keep this bar pinned through the whole page scroll, not just past ~216px. */}
      <StoreHeaderCategoriesBar
        navCategories={navCategories}
        featuredNavItems={featuredNavItems}
        languageOptions={languageOptions}
        vehicleBrands={vehicleBrands}
        apiConfigured={apiConfigured}
      />
    </>
  );
}
