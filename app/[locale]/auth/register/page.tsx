"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { buildInternationalPhone, normalizePhoneLocal } from "@/lib/phone";
import { parseAuthApiError } from "@/lib/auth-api-message";

function generateUniqueEmail(seedPhone: string): string {
  const phonePart = normalizePhoneLocal(seedPhone).slice(-6) || "000000";
  const timePart = Date.now().toString(36);
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);

  return `nc-${phonePart}-${timePart}-${randomPart}@auto.newcar`;
}

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [countryCode, setCountryCode] = useState<"+970" | "+972">("+970");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-localization": locale,
      },
      body: JSON.stringify({
        f_name: fName,
        l_name: lName,
        email: generateUniqueEmail(phone),
        phone: buildInternationalPhone(phone, countryCode),
        password,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      temporary_token?: string;
      errors?: Array<{ message?: string }>;
      message?: string;
    };
    if (!res.ok) {
      const result = parseAuthApiError(res.status, data);
      if (result.type === "tooManyAttempts") { setError(t("tooManyAttempts")); return; }
      if (result.type === "raw") { setError(result.message); return; }
      setError(t("error"));
      return;
    }
    if (data.ok) {
      router.push("/account");
      return;
    }
    if (data.temporary_token) {
      setError(t("needVerify"));
      return;
    }
    setError(t("error"));
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-secondary">
          {t("registerTitle")}
        </h1>
      </header>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-secondary">{t("firstName")}</span>
          <input
            required
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            className="store-input w-full"
            autoComplete="given-name"
          />
        </label>
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-secondary">{t("lastName")}</span>
          <input
            required
            value={lName}
            onChange={(e) => setLName(e.target.value)}
            className="store-input w-full"
            autoComplete="family-name"
          />
        </label>
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-secondary" id="register-phone-label">
            {t("phone")}
          </span>
          <div
            className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] sm:items-stretch"
            role="group"
            aria-labelledby="register-phone-label"
          >
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value as "+970" | "+972")}
              className="store-input w-full min-w-0 text-sm sm:text-base"
              aria-label={t("countryCode")}
              autoComplete="tel-country-code"
            >
              <option value="+970">+970 {t("countryPalestine")}</option>
              <option value="+972">+972 {t("countryIsrael")}</option>
            </select>
            <input
              required
              minLength={8}
              maxLength={11}
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="store-input min-w-0 w-full"
              placeholder="59XXXXXXXX"
              autoComplete="tel-national"
              aria-label={t("phone")}
            />
          </div>
        </div>
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-secondary">{t("password")}</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="store-input w-full"
            autoComplete="new-password"
          />
        </label>
        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <button type="submit" className="store-btn-primary w-full">
          {t("submitRegister")}
        </button>
      </form>
      <p className="border-t border-border-soft pt-5 text-center text-sm text-secondary/80">
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          {tNav("login")}
        </Link>
      </p>
    </div>
  );
}
