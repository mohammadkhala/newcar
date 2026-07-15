import {
  fetchConfig,
  fetchLanguages,
  fetchRootCategories,
  fetchVehicleBrands,
  getApiBaseUrl,
} from "@/lib/api";
import { getCachedFeaturedNav } from "@/lib/featured-nav";
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

/**
 * Server header: loads navigation trees, vehicle brands, languages.
 * Auth is resolved client-side via /api/auth/session so this RSC does not call
 * cookies() — which would force Cache-Control: no-store on every page.
 */
export async function StoreHeader() {
  const apiConfigured = Boolean(getApiBaseUrl());

  const config = (await fetchConfig().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const storeLogoSrc = resolveStoreLogoUrl(config) || "/logo.png";
  const storeLogoAlt =
    String(
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
    const [roots, brandsRes, langs, featured] = await Promise.all([
      fetchRootCategories().catch(() => [] as CategoryRow[]),
      fetchVehicleBrands().catch(
        () =>
          ({
            brands: [] as VehicleBrandsResponse["brands"],
          }) satisfies Pick<VehicleBrandsResponse, "brands">,
      ),
      fetchLanguages().catch(() => [] as LanguageOption[]),
      getCachedFeaturedNav().catch(() => [] as CategoryTreeNode[]),
    ]);
    navCategories = roots.map((c) => ({
      id: c.id,
      name: c.name ?? `#${c.id}`,
      imageSrc: categoryDisplayImageSrc(c),
    }));
    vehicleBrands = brandsRes.brands ?? [];
    languageOptions = langs;
    featuredNavItems = featured;
  }

  return (
    <>
      <header className="relative z-[300]">
        <StoreHeaderBody
          languageOptions={languageOptions}
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
