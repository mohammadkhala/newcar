"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { buildInternationalPhone, normalizePhoneLocal } from "@/lib/phone";
import { parseAuthApiError, networkErrorResult } from "@/lib/auth-api-message";

const DEFAULT_CC = "+972" as const;

export default function LoginPage() {
  const t = useTranslations("Auth");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState("");
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

  function applyError(status: number, data: { temporary_token?: string; errors?: Array<{ message?: string }>; message?: string }) {
    const result = parseAuthApiError(status, data);
    setError(result.type === "raw" ? result.message : t(result.key));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // buildInternationalPhone strips the leading zero automatically
    let firstTry: Awaited<ReturnType<typeof postLogin>>;
    try {
      firstTry = await postLogin(buildInternationalPhone(phone, DEFAULT_CC));
    } catch {
      setError(t(networkErrorResult().key));
      return;
    }

    if (firstTry.res.ok && firstTry.data.status === true) {
      router.push("/account");
      return;
    }

    // Backward compat: retry keeping the leading zero for legacy accounts
    const primaryPhone = buildInternationalPhone(phone, DEFAULT_CC);
    const fallbackPhone = `${DEFAULT_CC}${normalizePhoneLocal(phone)}`;
    if (fallbackPhone !== primaryPhone) {
      try {
        const secondTry = await postLogin(fallbackPhone);
        if (secondTry.res.ok && secondTry.data.status === true) {
          router.push("/account");
          return;
        }
        applyError(secondTry.res.status, secondTry.data);
      } catch {
        setError(t(networkErrorResult().key));
      }
      return;
    }

    applyError(firstTry.res.status, firstTry.data);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-secondary">
          {t("loginTitle")}
        </h1>
      </header>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-secondary">
            {t("whatsAppPhone")}
          </span>
          <input
            required
            inputMode="tel"
            minLength={9}
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="store-input w-full"
            placeholder="0591234567"
            autoComplete="tel-national"
          />
        </label>
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
