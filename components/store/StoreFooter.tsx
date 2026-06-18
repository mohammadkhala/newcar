import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchConfig, fetchServices } from "@/lib/api";

type SocialLink = { id: number; name: string; link: string; status: number };

const SOCIAL_META: Record<string, { color: string; icon: ReactNode }> = {
  facebook: {
    color: "bg-[#1877f2]",
    icon: <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  instagram: {
    color: "bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]",
    icon: <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  },
  twitter: {
    color: "bg-black",
    icon: <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  tiktok: {
    color: "bg-black border border-neutral-700",
    icon: <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.13-3.65-5.46-.02-.14-.02-.29-.02-.44.01-1.48.47-2.92 1.34-4.12 1.3-1.84 3.46-3.04 5.72-3.2.14-.02.29-.02.44-.02v4.04c-1.37.03-2.73.54-3.76 1.48-.6.54-1.04 1.25-1.2 2.05-.13.56-.1 1.15.06 1.7.35 1.12 1.28 1.97 2.42 2.26.79.2 1.63.15 2.39-.17.92-.37 1.61-1.12 1.92-2.06.12-.34.18-.7.18-1.07V.02h4.08z"/></svg>,
  },
  youtube: {
    color: "bg-[#ff0000]",
    icon: <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
  },
  whatsapp: {
    color: "bg-[#25D366]",
    icon: <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  },
  telegram: {
    color: "bg-[#0088cc]",
    icon: <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.21 3.46-.49.33-.94.5-1.34.49-.44-.01-1.28-.24-1.91-.44-.77-.25-1.38-.38-1.33-.81.03-.22.34-.44.93-.67 3.65-1.59 6.08-2.6 7.3-3.11 3.47-1.44 4.19-1.69 4.66-1.7.1 0 .34.02.49.15.13.11.16.27.17.38-.01.1-.01.22-.03.31z"/></svg>,
  },
  snapchat: {
    color: "bg-[#fffc00]",
    icon: <svg className="h-4 w-4 text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M12.166 3.302c-.105 0-.21.003-.314.007-.042.001-.087.005-.129.006a9.89 9.89 0 00-.193.01c-2.388.155-4.143 1.34-5.093 3.422-.558 1.231-.613 2.62-.558 3.906-.285.052-.58.085-.84.085-.265 0-.64-.06-.94-.19-.14-.061-.27-.14-.37-.25-.08-.086-.1-.13-.08-.18.08-.21.36-.35.48-.41.02-.01.04-.02.07-.03.41-.18.58-.29.65-.44.08-.17.04-.4-.07-.56-.14-.2-.38-.28-.62-.28-.11 0-.21.02-.3.05-.26.08-.6.27-.68.46-.06.14-.05.29.01.43.07.17.22.32.43.46l.03.02c.13.08.21.14.26.2.13.15.15.34.09.57-.58 1.24-.81 2.59-.61 3.87.15.97.5 1.81 1.01 2.49-.61.44-1.29.65-2.03.65-.34 0-.67-.05-.97-.14-.28-.09-.51-.23-.66-.42-.1-.14-.13-.29-.07-.44.1-.28.38-.44.56-.53l.05-.03c.41-.2.62-.35.67-.52.06-.22-.04-.47-.27-.66-.28-.23-.69-.34-1.07-.25-.14.03-.27.08-.39.15-.47.26-.84.71-.85 1.18-.01.26.07.5.22.7.31.43.87.73 1.52.87.28.06.57.09.87.09h.09c.7 0 1.43-.18 2.16-.52.37.64.88 1.18 1.53 1.6.93.61 2.07.93 3.28.93 1.21 0 2.35-.32 3.28-.93.65-.42 1.16-.96 1.53-1.6.73.34 1.46.52 2.16.52h.09c.3 0 .59-.03.87-.09.65-.14 1.21-.44 1.52-.87.15-.2.23-.44.22-.7-.01-.47-.38-.92-.85-1.18a1.96 1.96 0 00-.39-.15c-.38-.09-.79.02-1.07.25-.23.19-.33.44-.27.66.05.17.26.32.67.52l.05.03c.18.09.46.25.56.53.06.15.03.3-.07.44-.15.19-.38.33-.66.42-.3.09-.63.14-.97.14-.74 0-1.42-.21-2.03-.65.51-.68.86-1.52 1.01-2.49.2-1.28-.03-2.63-.61-3.87-.06-.23-.04-.42.09-.57.05-.06.13-.12.26-.2l.03-.02c.21-.14.36-.29.43-.46.06-.14.07-.29.01-.43-.08-.19-.42-.38-.68-.46-.09-.03-.19-.05-.3-.05-.24 0-.48.08-.62.28-.11.16-.15.39-.07.56.07.15.24.26.65.44.03.01.05.02.07.03.12.06.4.2.48.41.02.05 0 .09-.08.18-.1.11-.23.189-.37.25-.3.13-.675.19-.94.19-.26 0-.555-.033-.84-.085.055-1.286 0-2.675-.558-3.906-.95-2.082-2.705-3.267-5.093-3.422a9.89 9.89 0 00-.193-.01c-.042-.001-.087-.005-.129-.006A5.31 5.31 0 0012.166 3.302z"/></svg>,
  },
  linkedin: {
    color: "bg-[#0077b5]",
    icon: <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
  },
};

export async function StoreFooter() {
  const t = await getTranslations("Footer");
  const [services, config] = await Promise.all([
    fetchServices().catch(() => []) as Promise<{ slug?: string; title?: string; name?: string }[]>,
    fetchConfig().catch(() => null),
  ]);

  const rawSocial = (config?.social_media_link ?? []) as SocialLink[];
  const socialLinks = rawSocial.filter((s) => s.status === 1 && s.link && s.link !== "#");

  return (
    <footer className="mt-auto bg-secondary text-white border-t border-surface-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-10 max-md:pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-5">

          {/* Column 1: Brand + apps + social — full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-white">نيو كار</h3>
            <p className="text-sm leading-relaxed text-neutral-300">{t("taglineHala")}</p>

            {/* App store badges */}
            <div className="flex flex-row gap-2">
              <a href="https://apps.apple.com/ae/app/%D9%86%D9%8A%D9%88-%D9%83%D8%A7%D8%B1-newcar/id6767830089" target="_blank" rel="noopener noreferrer" className="flex-1" aria-label="Download on the App Store">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/app-store.svg" alt="App Store" className="h-9 w-full object-contain" />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.newcarpal.app" target="_blank" rel="noopener noreferrer" className="flex-1" aria-label="Get it on Google Play">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/google-play.svg" alt="Google Play" className="h-9 w-full object-contain" />
              </a>
            </div>

            {/* Social icons from API */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s) => {
                  const meta = SOCIAL_META[s.name.toLowerCase()];
                  if (!meta) return null;
                  return (
                    <a
                      key={s.id}
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.color} transition-opacity hover:opacity-80`}
                    >
                      {meta.icon}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2: Company */}
          <div>
            <p className="mb-4 border-b border-neutral-700 pb-2 text-sm font-bold text-white">{t("colCompany")}</p>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <li><Link href="/cms/about" className="hover:text-white transition-colors">{t("linkAboutUs")}</Link></li>
              <li><Link href="/cms/privacy" className="hover:text-white transition-colors">{t("linkPrivacy")}</Link></li>
              <li><Link href="/cms/return-policy" className="hover:text-white transition-colors">{t("linkReturnPolicy")}</Link></li>
              <li><Link href="/cms/contact" className="hover:text-white transition-colors">{t("linkCompanyAddress")}</Link></li>
              <li><Link href="/cms/faqs" className="hover:text-white transition-colors">{t("linkFaqs")}</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <p className="mb-4 border-b border-neutral-700 pb-2 text-sm font-bold text-white">{t("colService")}</p>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <li><Link href="/account" className="hover:text-white transition-colors">{t("linkAccount")}</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">{t("linkOrders")}</Link></li>
              <li><Link href="/cms/return-policy" className="hover:text-white transition-colors">{t("linkReturnPolicy")}</Link></li>
              <li><Link href="/cms/contact" className="hover:text-white transition-colors">{t("linkContact")}</Link></li>
            </ul>
          </div>

          {/* Column 4: Explore */}
          <div>
            <p className="mb-4 border-b border-neutral-700 pb-2 text-sm font-bold text-white">{t("colExplore")}</p>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <li><Link href="/shop/flash-sale" className="hover:text-white transition-colors">{t("linkFlash")}</Link></li>
              <li><Link href="/shop/new-arrivals" className="hover:text-white transition-colors">{t("linkNewArrivals")}</Link></li>
              <li><Link href="/shop/best-sellers" className="hover:text-white transition-colors">{t("linkBestSellers")}</Link></li>
              <li><Link href="/shop/global" className="hover:text-white transition-colors">{t("linkGlobalGoods")}</Link></li>
              <li><Link href="/shop/most-requested" className="hover:text-white transition-colors">{t("linkMostRequested")}</Link></li>
            </ul>
          </div>

          {/* Column 5: Car Services */}
          <div>
            <p className="mb-4 border-b border-neutral-700 pb-2 text-sm font-bold text-white">{t("colCarServices")}</p>
            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              {(services as { slug?: string; title?: string; name?: string }[]).map((svc, i) => {
                const slug = svc.slug;
                if (!slug) return null;
                return (
                  <li key={`${slug}-${i}`}>
                    <Link href={`/cms/services/${encodeURIComponent(slug)}`} className="hover:text-white transition-colors">
                      {svc.title ?? svc.name ?? slug}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="bg-primary py-3">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <a href="https://baitpait.com/" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-white/80 hover:text-white transition-colors">
            {t("devCredit")}
          </a>
        </div>
      </div>
    </footer>
  );
}
