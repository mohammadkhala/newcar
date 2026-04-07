import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { fetchServiceDetail, getApiBaseUrl } from "@/lib/api";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CMS");
  const data =
    getApiBaseUrl() &&
    (await fetchServiceDetail(slug));

  if (!data) {
    notFound();
  }

  const title =
    (data.title as string) || (data.name as string) || slug;
  const body = (data.description as string) || (data.content as string) || "";

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
      <h1 className="text-2xl font-bold text-secondary">
        {t("serviceDetail")}: {title}
      </h1>
      <div
        className="prose prose-sm max-w-none text-secondary/90"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}
