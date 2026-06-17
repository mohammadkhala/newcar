import { getTranslations } from "next-intl/server";
import { fetchConfig } from "@/lib/api";
import { resolveFooterSupportContact } from "@/lib/footer-support";
import { ContactForm } from "@/components/cms/ContactForm";

export default async function ContactPage() {
  const t = await getTranslations("CMS");
  const config = await fetchConfig().catch(() => null);
  const support = resolveFooterSupportContact(config);

  const email = String((config?.email as string) || (config?.business_email as string) || "").trim();
  const address = String((config?.address as string) || (config?.business_address as string) || "").trim();

  // Map embed: admin panel stores it as map_embed_code or map
  const rawMap = String(
    (config?.map_embed_code as string) ||
    (config?.map as string) ||
    (config?.google_map as string) ||
    ""
  ).trim();

  // Accept either a full <iframe> tag or a plain src URL
  let mapSrc = "";
  if (rawMap.startsWith("<iframe")) {
    const m = rawMap.match(/src="([^"]+)"/);
    if (m) mapSrc = m[1];
  } else if (rawMap.startsWith("http")) {
    mapSrc = rawMap;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">

      {/* ── Hero ── */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-secondary">{t("contactTitle")}</h1>
        <p className="mt-2 text-base text-secondary/60">{t("contactSubtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">

        {/* ── Left: contact info ── */}
        <aside className="flex flex-col gap-5 lg:col-span-2">

          {support.hasContact && (
            <div className="store-card flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary/50">{t("contactPhone2")}</p>
                <a href={support.telHref ?? "#"} className="mt-0.5 block font-bold text-secondary hover:text-primary transition-colors" dir="ltr">
                  {support.displayNumber}
                </a>
              </div>
            </div>
          )}

          {support.whatsappHref && (
            <div className="store-card flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.17 1.83 5.82L2.5 22l4.31-1.28C8.42 21.54 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.66 0-3.23-.42-4.57-1.16l-.33-.18-2.61.77.78-2.54-.2-.31A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.35-5.69c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.04-.71-.52-1.19-1.16-1.33-1.4-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.22 0-.58.08-.88.4-.3.32-1.14 1.12-1.14 2.74 0 1.62 1.17 3.18 1.33 3.4.16.22 2.32 3.54 5.62 4.97.79.34 1.4.54 1.88.69.79.25 1.51.21 2.08.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.4.19-1.54-.08-.14-.3-.22-.54-.34z"/>
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary/50">{t("contactWhatsApp")}</p>
                <a href={support.whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-0.5 block font-bold text-secondary hover:text-[#25D366] transition-colors" dir="ltr">
                  {support.displayNumber}
                </a>
              </div>
            </div>
          )}

          {email && (
            <div className="store-card flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary/50">{t("contactEmailLabel")}</p>
                <a href={`mailto:${email}`} className="mt-0.5 block truncate font-bold text-secondary hover:text-primary transition-colors" dir="ltr">
                  {email}
                </a>
              </div>
            </div>
          )}

          {address && (
            <div className="store-card flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary/50">{t("contactAddress")}</p>
                <p className="mt-0.5 font-bold text-secondary leading-snug">{address}</p>
              </div>
            </div>
          )}
        </aside>

        {/* ── Right: form ── */}
        <div className="store-card p-6 lg:col-span-3">
          <h2 className="mb-5 text-lg font-bold text-secondary">{t("contactFormTitle")}</h2>
          <ContactForm />
        </div>

      </div>

      {/* ── Map ── */}
      {mapSrc && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-secondary">{t("contactLocation")}</h2>
          <div className="overflow-hidden rounded-2xl border border-border-soft shadow-sm">
            <iframe
              src={mapSrc}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="موقعنا على الخريطة"
            />
          </div>
        </div>
      )}

    </div>
  );
}
