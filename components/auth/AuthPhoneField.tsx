"use client";

import { useTranslations } from "next-intl";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function AuthPhoneField({ value, onChange }: Props) {
  const t = useTranslations("Auth");
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-semibold text-secondary">
        {t("whatsAppPhone")}
      </span>
      <input
        required
        inputMode="tel"
        minLength={9}
        maxLength={11}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="store-input w-full"
        placeholder="0591234567"
        autoComplete="tel-national"
        suppressHydrationWarning
      />
    </label>
  );
}
