"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { buildAuthPhone, buildInternationalPhone } from "@/lib/phone";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";
import { authApiErrorMessage } from "@/lib/auth-api-message";

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const primaryPhone = buildAuthPhone(phone);
    const firstTry = await postLogin(primaryPhone);

    if (firstTry.res.ok && firstTry.data.status === true) {
      router.push("/account");
      return;
    }

    // حسابات قديمة سُجّلت بمقدمة +970
    const legacyPhone = buildInternationalPhone(phone, "+970");
    if (legacyPhone !== primaryPhone) {
      const secondTry = await postLogin(legacyPhone);
      if (secondTry.res.ok && secondTry.data.status === true) {
        router.push("/account");
        return;
      }
      if (secondTry.data.temporary_token) {
        setError(t("needVerify"));
        return;
      }
      const apiMessage = authApiErrorMessage(secondTry.res, secondTry.data, t);
      setError(apiMessage);
      return;
    }

    if (firstTry.data.temporary_token) {
      setError(t("needVerify"));
      return;
    }
    setError(authApiErrorMessage(firstTry.res, firstTry.data, t));
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-secondary">
          {t("loginTitle")}
        </h1>
      </header>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <AuthPhoneField
          id="login-phone"
          label={t("whatsAppPhone")}
          value={phone}
          onChange={setPhone}
          placeholder={t("phonePlaceholder")}
        />
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
