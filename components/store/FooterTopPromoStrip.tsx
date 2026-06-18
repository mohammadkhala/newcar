import { getTranslations } from "next-intl/server";
import { fetchConfig } from "@/lib/api";
import {
  FooterIconLock,
  FooterIconPhone,
  FooterIconPlane,
  FooterIconTags,
} from "@/components/store/FooterPromoIcons";

function paymentPromoBody(
  config: Record<string, unknown> | null,
  t: Awaited<ReturnType<typeof getTranslations<"Footer">>>,
): string {
  const cod =
    config?.cash_on_delivery === true ||
    config?.cash_on_delivery === "true" ||
    config?.cash_on_delivery === 1;
  const digital =
    config?.digital_payment === true ||
    config?.digital_payment === "true" ||
    config?.digital_payment === 1 ||
    (Array.isArray(config?.active_payment_method_list) &&
      (config.active_payment_method_list as unknown[]).length > 0);

  if (cod && digital) return t("promoPayBodyBoth");
  if (cod) return t("promoPayBodyCod");
  if (digital) return t("promoPayBodyCard");
  return t("promoPayBody");
}

export async function FooterTopPromoStrip() {
  const t = await getTranslations("Footer");
  const config = (await fetchConfig().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const items = [
    { key: "luxury", title: t("promoLuxuryTitle"), body: t("promoLuxuryBody"), icon: <FooterIconTags /> },
    { key: "range",  title: t("promoRangeTitle"),  body: t("promoRangeBody"),  icon: <FooterIconPlane /> },
    { key: "care",   title: t("promoCareTitle"),   body: t("promoCareBody"),   icon: <FooterIconPhone /> },
    { key: "pay",    title: t("promoPayTitle"),    body: paymentPromoBody(config, t), icon: <FooterIconLock /> },
  ];

  return (
    <div className="bg-primary py-4">
      <div className="mx-auto max-w-7xl px-4">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{item.title}</p>
                <p className="line-clamp-2 text-xs leading-snug text-white/70">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
