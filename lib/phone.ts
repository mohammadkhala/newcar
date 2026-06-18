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

export const DEFAULT_AUTH_COUNTRY_CODE = "+972" as const;

export type AuthCountryCode = typeof DEFAULT_AUTH_COUNTRY_CODE | "+970";

export function normalizePhoneLocal(raw: string): string {
  const ascii = normalizeDigits(raw);
  return ascii.replace(/\D/g, "");
}

function stripAnyCountryPrefix(localDigits: string): string {
  if (localDigits.startsWith("972")) {
    return localDigits.slice(3);
  }
  if (localDigits.startsWith("970")) {
    return localDigits.slice(3);
  }
  return localDigits;
}

export function buildInternationalPhone(
  localPhoneRaw: string,
  countryCode: AuthCountryCode = DEFAULT_AUTH_COUNTRY_CODE,
): string {
  let local = normalizePhoneLocal(localPhoneRaw);
  local = stripAnyCountryPrefix(local);
  local = local.replace(/^0+/, "");
  return `${countryCode}${local}`;
}

export function buildAuthPhone(localPhoneRaw: string): string {
  return buildInternationalPhone(localPhoneRaw, DEFAULT_AUTH_COUNTRY_CODE);
}
