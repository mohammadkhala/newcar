import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function BrandNotFound() {
  const t = await getTranslations("Brands");

  return (
    <div className="space-y-4 py-8 text-center">
      <p className="text-secondary">{t("notFound")}</p>
      <Link href="/shop/brands" className="text-primary hover:underline">
        Brands
      </Link>
    </div>
  );
}
