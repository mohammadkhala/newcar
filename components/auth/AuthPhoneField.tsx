"use client";

import { DEFAULT_AUTH_COUNTRY_CODE } from "@/lib/phone";

type AuthPhoneFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: "tel-national" | "tel";
};

export function AuthPhoneField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "tel-national",
}: AuthPhoneFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-secondary">
        {label}
      </label>
      <div className="flex items-stretch gap-2" dir="ltr">
        <span
          className="store-input inline-flex min-w-[4.75rem] shrink-0 items-center justify-center bg-surface-muted px-3 text-sm font-semibold text-secondary"
          aria-hidden
        >
          {DEFAULT_AUTH_COUNTRY_CODE}
        </span>
        <input
          id={id}
          required
          inputMode="tel"
          minLength={8}
          maxLength={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="store-input min-w-0 flex-1"
          placeholder={placeholder}
          autoComplete={autoComplete}
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}
