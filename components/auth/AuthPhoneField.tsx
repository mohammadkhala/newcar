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
      <div dir="ltr">
        <input
          id={id}
          required
          inputMode="tel"
          minLength={8}
          maxLength={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="store-input w-full"
          placeholder={placeholder}
          autoComplete={autoComplete}
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}
