import { getTranslations, setRequestLocale } from "next-intl/server";
import { VehicleFitmentPicker } from "@/components/vehicle/VehicleFitmentPicker";
import { fetchVehicleBrands, getApiBaseUrl } from "@/lib/api";

type Props = { params: Promise<{ locale: string }> };

export default async function VehicleShopPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
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
      <VehicleFitmentPicker brands={brands} apiConfigured={Boolean(apiBase)} />
    </div>
  );
}
