import { getTranslations } from "next-intl/server";

/**
 * Four USP-style tiles above the main footer columns (reference: hala footer-content-top).
 */
export async function FooterTopPromoStrip() {
  const t = await getTranslations("Footer");

  const items = [
    { title: t("promoLuxuryTitle"), body: t("promoLuxuryBody") },
    { title: t("promoRangeTitle"), body: t("promoRangeBody") },
    { title: t("promoCareTitle"), body: t("promoCareBody") },
    { title: t("promoPayTitle"), body: t("promoPayBody") },
  ];

  return (
    <div className="border-b border-surface-muted/80 bg-surface-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.title}
              className="store-panel border-primary/10 px-4 py-4 text-center sm:text-start"
            >
              <p className="text-sm font-bold text-secondary">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-secondary/80">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
