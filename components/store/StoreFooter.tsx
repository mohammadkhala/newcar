import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { fetchConfig } from "@/lib/api";
import { resolveStoreLogoUrl } from "@/lib/resolve-store-logo";
import { FooterNewsletterForm } from "@/components/store/FooterNewsletterForm";
import { FooterTopPromoStrip } from "@/components/store/FooterTopPromoStrip";

type SocialRow = { name?: string; link?: string; status?: number };

function socialRows(raw: unknown): SocialRow[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(
    (x): x is SocialRow =>
      x != null &&
      typeof (x as SocialRow).link === "string" &&
      (x as SocialRow).status === 1,
  );
}

/**
 * Multi-column footer: company (from config when available), service, explore, CMS, newsletter, promo strip.
 */
export async function StoreFooter() {
  const t = await getTranslations("Footer");
  const tCms = await getTranslations("CMS");
  const tNav = await getTranslations("Nav");

  const config = (await fetchConfig().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const businessName = String(
    (config?.business_name as string) ||
      (config?.ecommerce_name as string) ||
      "",
  ).trim();
  const displayName = businessName || t("defaultBrandName");
  const logoSrc = resolveStoreLogoUrl(config);
  const address = String(
    (config?.address as string) || (config?.ecommerce_address as string) || "",
  ).trim();
  const phone = String(
    (config?.phone as string) || (config?.ecommerce_phone as string) || "",
  ).trim();
  const email = String(
    (config?.email as string) || (config?.ecommerce_email as string) || "",
  ).trim();
  const socials = socialRows(config?.social_media_link);

  return (
    <footer className="mt-auto border-t border-surface-muted bg-surface-muted/50">
      <FooterTopPromoStrip />
      <div className="mx-auto max-w-7xl border-b border-surface-muted/80 px-4 py-10">
        <p className="text-center text-sm font-semibold text-secondary">
          {t("newsletterTitle")}
        </p>
        <p className="mt-1 text-center text-xs text-secondary/70">{t("newsletterHint")}</p>
        <div className="mt-4 flex justify-center">
          <FooterNewsletterForm />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 max-md:pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {logoSrc ? (
              <div className="mb-3">
                <Image
                  src={logoSrc}
                  alt=""
                  width={140}
                  height={48}
                  unoptimized
                  className="h-12 w-auto object-contain object-start"
                />
              </div>
            ) : null}
            <p className="text-sm font-semibold text-secondary">{t("colCompany")}</p>
            <p className="mt-2 text-sm font-bold text-primary">{displayName}</p>
            <p className="mt-2 text-sm text-secondary/85">
              {address || t("tagline")}
            </p>
            {phone ? (
              <p className="mt-2 text-sm text-secondary/90">
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {t("labelPhone")}: {phone}
                </a>
              </p>
            ) : null}
            {email ? (
              <p className="mt-1 text-sm text-secondary/90">
                <a href={`mailto:${email}`} className="hover:text-primary">
                  {t("labelEmail")}: {email}
                </a>
              </p>
            ) : null}
            {socials.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-3 text-sm">
                {socials.map((s, i) => (
                  <li key={`${s.link}-${i}`}>
                    <a
                      href={s.link}
                      className="font-medium text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.name || t("linkSocial")}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-4 text-xs text-secondary/60">
              © {new Date().getFullYear()} {displayName} — {t("rights")}
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
