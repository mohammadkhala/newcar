import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Multi-column footer: company, customer service, explore, and CMS links.
 */
export async function StoreFooter() {
  const t = await getTranslations("Footer");
  const tCms = await getTranslations("CMS");
  const tNav = await getTranslations("Nav");

  return (
    <footer className="mt-auto border-t border-surface-muted bg-surface-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 max-md:pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold text-secondary">{t("colCompany")}</p>
            <p className="mt-3 text-sm text-secondary/85">{t("tagline")}</p>
            <p className="mt-3 text-xs text-secondary/70">{t("trust")}</p>
            <p className="mt-4 text-xs text-secondary/60">
              © {new Date().getFullYear()} NEW CAR — {t("rights")}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-secondary">{t("colService")}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/account" className="text-secondary/90 hover:text-primary">
                  {t("linkAccount")}
                </Link>
              </li>
              <li>
                <Link href="/shop/cart" className="text-secondary/90 hover:text-primary">
                  {t("linkCart")}
                </Link>
              </li>
              <li>
                <Link href="/cms/contact" className="text-secondary/90 hover:text-primary">
                  {t("linkContact")}
                </Link>
              </li>
              <li>
                <Link href="/cms/quote" className="text-secondary/90 hover:text-primary">
                  {t("linkQuote")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-secondary">{t("colExplore")}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/shop/categories" className="text-secondary/90 hover:text-primary">
                  {t("linkCategories")}
                </Link>
              </li>
              <li>
                <Link href="/shop/brands" className="text-secondary/90 hover:text-primary">
                  {t("linkBrands")}
                </Link>
              </li>
              <li>
                <Link href="/shop/flash-sale" className="text-secondary/90 hover:text-primary">
                  {t("linkFlash")}
                </Link>
              </li>
              <li>
                <Link href="/shop/vehicle" className="text-secondary/90 hover:text-primary">
                  {tNav("shopByVehicle")}
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="text-secondary/90 hover:text-primary">
                  {t("linkNotifications")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-secondary">{t("linkAboutPages")}</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/cms/pages" className="text-secondary/90 hover:text-primary">
                  {tCms("pagesTitle")}
                </Link>
              </li>
              <li>
                <Link href="/cms/faqs" className="text-secondary/90 hover:text-primary">
                  {t("linkFaqs")}
                </Link>
              </li>
              <li>
                <Link href="/cms/services" className="text-secondary/90 hover:text-primary">
                  {t("linkServices")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
