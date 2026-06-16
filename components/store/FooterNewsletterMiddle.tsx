import { getTranslations } from "next-intl/server";
import { resolveFooterSupportContact } from "@/lib/footer-support";

type Props = {
  config: Record<string, unknown> | null;
};

function FooterHeadsetIcon() {
  return (
    <svg
      width={56}
      height={56}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className="footer-middle-headset-icon block shrink-0"
    >
      <path
        d="M18 32v-6a14 14 0 1128 0v6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="12"
        y="32"
        width="10"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect
        x="42"
        y="32"
        width="10"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M22 48v4a10 10 0 0020 0v-4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 22v-4M26 18h12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatSupportPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 12 && digits.startsWith("972")) {
    const local = digits.slice(3);
    if (local.length >= 9) {
      return `+972 ${local.slice(0, 2)}-${local.slice(2, 5)}-${local.slice(5, 9)}`;
    }
  }
  if (raw.startsWith("+")) {
    return raw;
  }
  return digits ? `+${digits}` : raw;
}

/**
 * Footer middle-top — hala layout: newsletter (start) + support line (end).
 */
export async function FooterNewsletterMiddle({ config }: Props) {
  const t = await getTranslations("Footer");
  const support = resolveFooterSupportContact(config);
  const phoneDisplay = formatSupportPhoneDisplay(support.displayNumber);

  return (
    <section className="footer-middle-band" aria-label={t("newsletterMiddleTitle")}>
      <div className="footer-middle-band-inner">
        <div className="footer-middle-row">
          {support.hasContact ? (
            <div className="footer-middle-support-group">
              {support.whatsappHref ? (
                <a
                  href={support.whatsappHref}
                  className="footer-middle-headset-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("whatsappContact")}
                >
                  <FooterHeadsetIcon />
                </a>
              ) : (
                <span className="footer-middle-headset-link footer-middle-headset-static">
                  <FooterHeadsetIcon />
                </span>
              )}
              <div className="footer-middle-support-copy">
                <p className="footer-middle-support-tagline">
                  {t("supportHandLineTitle")}
                </p>
                {support.telHref ? (
                  <a href={support.telHref} className="footer-middle-phone-accent">
                    {phoneDisplay}
                  </a>
                ) : (
                  <p className="footer-middle-phone-accent">{phoneDisplay}</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
