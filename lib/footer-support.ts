export type FooterSupportContact = {
  displayNumber: string;
  telHref: string | null;
  whatsappHref: string | null;
  hasContact: boolean;
};

/**
 * Support line for footer middle-top: WhatsApp number (if enabled) then store phone from config.
 */
export function resolveFooterSupportContact(
  config: Record<string, unknown> | null,
): FooterSupportContact {
  let whatsappNumber = "";

  if (config?.whatsapp != null) {
    if (typeof config.whatsapp === "object") {
      const row = config.whatsapp as Record<string, unknown>;
      if (row.status === 1 && typeof row.number === "string") {
        whatsappNumber = row.number.trim();
      }
    } else if (typeof config.whatsapp === "string") {
      whatsappNumber = config.whatsapp.trim();
    }
  }

  const storePhone = String(
    (config?.phone as string) || (config?.ecommerce_phone as string) || "",
  ).trim();

  const displayNumber = whatsappNumber || storePhone;
  const digits = displayNumber.replace(/\D/g, "");

  return {
    displayNumber,
    telHref: digits ? `tel:+${digits.replace(/^\+/, "")}` : null,
    whatsappHref: digits ? `https://wa.me/${digits}` : null,
    hasContact: Boolean(displayNumber),
  };
}
