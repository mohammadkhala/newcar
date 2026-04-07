import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ProductNotFound() {
  const t = await getTranslations("Errors");

  return (
    <div className="space-y-4 py-8 text-center">
      <p className="text-secondary">{t("notFound")}</p>
      <Link href="/shop/search" className="text-primary hover:underline">
        Search
      </Link>
    </div>
  );
}
