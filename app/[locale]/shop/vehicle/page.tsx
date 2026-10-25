import { getTranslations, setRequestLocale } from "next-intl/server";
import { VehicleFitmentPicker } from "@/components/vehicle/VehicleFitmentPicker";
import { fetchVehicleBrands, getApiBaseUrl } from "@/lib/api";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Positive integer id from ?brand=/?model=/?year=, else "". */
function idParam(value: string | string[] | undefined): number | "" {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : "";
}

export default async function VehicleShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("Vehicle");
  const apiBase = getApiBaseUrl();
  const brands = apiBase
    ? (await fetchVehicleBrands().catch(() => ({ brands: [] }))).brands
    : [];

  return (
    <div className="store-shell py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary md:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-secondary/75">{t("subtitle")}</p>
      </div>
      <VehicleFitmentPicker
        brands={brands}
        apiConfigured={Boolean(apiBase)}
        initialBrandId={idParam(sp.brand)}
        initialModelId={idParam(sp.model)}
        initialYearId={idParam(sp.year)}
      />
    </div>
  );
}
