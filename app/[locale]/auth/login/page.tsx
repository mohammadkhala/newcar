"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { buildInternationalPhone, normalizePhoneLocal } from "@/lib/phone";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState<"+970" | "+972">("+970");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function postLogin(emailOrPhone: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-localization": locale,
      },
      body: JSON.stringify({
        email_or_phone: emailOrPhone,
        password,
        type: "phone",
      }),
    });

    const data = (await res.json()) as {
      status?: boolean;
      temporary_token?: string;
      errors?: Array<{ message?: string }>;
      message?: string;
    };

    return { res, data };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const primaryPhone = buildInternationalPhone(phone, countryCode);
    const firstTry = await postLogin(primaryPhone);

    if (firstTry.res.ok && firstTry.data.status === true) {
      router.push("/account");
      return;
    }

    // Backward compatibility: some legacy accounts may have been saved with an extra leading zero.
    const fallbackPhone = `${countryCode}${normalizePhoneLocal(phone)}`;
    if (fallbackPhone !== primaryPhone) {
      const secondTry = await postLogin(fallbackPhone);
      if (secondTry.res.ok && secondTry.data.status === true) {
        router.push("/account");
        return;
      }
      if (secondTry.data.temporary_token) {
        setError(t("needVerify"));
        return;
      }
      const apiMessage = secondTry.data.errors?.[0]?.message ?? secondTry.data.message;
      setError(apiMessage || t("error"));
      return;
    }

    if (firstTry.data.temporary_token) {
      setError(t("needVerify"));
      return;
    }
    const apiMessage = firstTry.data.errors?.[0]?.message ?? firstTry.data.message;
    setError(apiMessage || t("error"));
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-secondary">
          {t("loginTitle")}
        </h1>
      </header>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-secondary" id="login-phone-label">
            {t("whatsAppPhone")}
          </span>
          <div
            className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] sm:items-stretch"
            role="group"
            aria-labelledby="login-phone-label"
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
              inputMode="tel"
              minLength={8}
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="store-input min-w-0 w-full"
              placeholder="59XXXXXXXX"
              autoComplete="tel-national"
              aria-label={t("whatsAppPhone")}
            />
          </div>
        </div>
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-secondary">{t("password")}</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="store-input w-full"
            autoComplete="current-password"
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
          {t("submitLogin")}
        </button>
      </form>
      <p className="border-t border-border-soft pt-5 text-center text-sm text-secondary/80">
        <Link href="/auth/register" className="font-semibold text-primary hover:underline">
          {tNav("register")}
        </Link>
      </p>
    </div>
  );
}
