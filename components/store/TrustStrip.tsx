import { getTranslations } from "next-intl/server";

/**
 * Four trust signals for the storefront home (delivery, payment, quality, service).
 */
export async function TrustStrip() {
  const t = await getTranslations("Home.trust");

  const iconClass =
    "h-5 w-5 text-primary sm:h-6 sm:w-6";

  const items = [
    {
      title: t("delivery"),
      desc: t("deliveryDesc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path d="M3 6h11v8H3z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M14 9h3.2l2.8 2.8V14H14z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="8" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      title: t("payment"),
      desc: t("paymentDesc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
          <path d="M7 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: t("quality"),
      desc: t("qualityDesc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path d="M12 3l2.3 4.6 5.1.8-3.7 3.6.9 5-4.6-2.4-4.6 2.4.9-5L4.6 8.4l5.1-.8z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      title: t("service"),
      desc: t("serviceDesc"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path d="M12 3a5 5 0 015 5v2.2a3 3 0 001 2.1l.5.5a1 1 0 01-.7 1.7H5.7a1 1 0 01-.7-1.7l.5-.5a3 3 0 001-2.1V8a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9.5 18a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="store-card px-4 py-4 md:py-5">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.title}
            className="store-panel flex items-start gap-3 px-4 py-3.5"
          >
            <span className="mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 p-2">
              {item.icon}
            </span>
            <div>
              <p className="text-base font-bold text-primary">{item.title}</p>
              <p className="mt-1 text-sm text-secondary/85">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
