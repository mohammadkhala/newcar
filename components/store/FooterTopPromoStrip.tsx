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

  if (cod && digital) {
    return t("promoPayBodyBoth");
  }
  if (cod) {
    return t("promoPayBodyCod");
  }
  if (digital) {
    return t("promoPayBodyCard");
  }
  return t("promoPayBody");
}

/**
 * Four USP tiles above footer columns (hala-car footer-content-top / service-banner-style04).
 */
export async function FooterTopPromoStrip() {
  const t = await getTranslations("Footer");
  const config = (await fetchConfig().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const items = [
    {
      key: "luxury",
      title: t("promoLuxuryTitle"),
      body: t("promoLuxuryBody"),
      icon: <FooterIconTags />,
    },
    {
      key: "range",
      title: t("promoRangeTitle"),
      body: t("promoRangeBody"),
      icon: <FooterIconPlane />,
    },
    {
      key: "care",
      title: t("promoCareTitle"),
      body: t("promoCareBody"),
      icon: <FooterIconPhone />,
    },
    {
      key: "pay",
      title: t("promoPayTitle"),
      body: paymentPromoBody(config, t),
      icon: <FooterIconLock />,
    },
  ];

  return (
    <div className="footer-content-top">
      <div className="footer-content-top-inner container">
        <ul className="service-banner-style04 row">
          {items.map((item) => (
            <li key={item.key} className="service-banner-style04-item item">
              <div className="item-icon">{item.icon}</div>
              <div className="item-text">
                <p className="item-title">{item.title}</p>
                <p className="item-sub-title">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
