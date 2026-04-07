import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFoundPage() {
  const t = await getTranslations("Errors");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-secondary">{t("notFound")}</h1>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white"
      >
        Home
      </Link>
    </div>
  );
}
