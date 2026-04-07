/**
 * Formats money for display using active locale and optional currency code from config.
 */
export function formatMoney(
  amount: number,
  locale: string,
  currencyCode: string = "ILS",
): string {
  const intlLocale =
    locale === "ar" ? "ar" : locale === "he" ? "he-IL" : "en";
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}
