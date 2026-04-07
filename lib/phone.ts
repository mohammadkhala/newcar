"use client";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function normalizeDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const arIndex = ARABIC_DIGITS.indexOf(ch);
    if (arIndex >= 0) {
      out += String(arIndex);
      continue;
    }
    const faIndex = EASTERN_ARABIC_DIGITS.indexOf(ch);
    if (faIndex >= 0) {
      out += String(faIndex);
      continue;
    }
    out += ch;
  }
  return out;
}

export function normalizePhoneLocal(raw: string): string {
  const ascii = normalizeDigits(raw);
  return ascii.replace(/\D/g, "");
}

export function buildInternationalPhone(
  localPhoneRaw: string,
  countryCode: "+970" | "+972",
): string {
  let local = normalizePhoneLocal(localPhoneRaw);
  local = local.replace(/^0+/, "");
  return `${countryCode}${local}`;
}
