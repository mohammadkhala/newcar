"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { buildAuthPhone, buildInternationalPhone } from "@/lib/phone";
import { parseAuthApiError, networkErrorResult } from "@/lib/auth-api-message";
import { AuthPhoneField } from "@/components/auth/AuthPhoneField";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function postLogin(emailOrPhone: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-localization": locale },
      body: JSON.stringify({ email_or_phone: emailOrPhone, password, type: "phone" }),
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
    setLoading(true);

    try {
      const firstTry = await postLogin(buildAuthPhone(phone));
      if (firstTry.res.ok && firstTry.data.status === true) {
        router.push("/account");
        return;
      }
      // Fallback: +970 for legacy Palestinian accounts
      const secondTry = await postLogin(buildInternationalPhone(phone, "+970"));
      if (secondTry.res.ok && secondTry.data.status === true) {
        router.push("/account");
        return;
      }
      applyError(secondTry.res.status, secondTry.data);
    } catch {
      setError(t(networkErrorResult().key));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Logo + title */}
      <div className="flex flex-col items-center gap-3 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo.png" alt="نيو كار" className="h-12 w-auto object-contain" />
        <div>
          <h1 className="text-xl font-bold text-secondary">{t("loginTitle")}</h1>
          <p className="mt-1 text-sm text-secondary/50">أهلاً بك! سجّل دخولك للمتابعة</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthPhoneField value={phone} onChange={setPhone} />

        {/* Password with show/hide toggle */}
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-secondary">{t("password")}</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="store-input w-full pe-10"
              autoComplete="current-password"
              suppressHydrationWarning
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 end-3 flex items-center text-secondary/40 hover:text-secondary/70 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </label>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="store-btn-primary w-full py-3 font-semibold disabled:opacity-60"
          suppressHydrationWarning
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              جاري الدخول...
            </span>
          ) : t("submitLogin")}
        </button>
      </form>

      <p className="border-t border-border-soft pt-5 text-center text-sm text-secondary/60">
        ليس لديك حساب؟{" "}
        <Link href="/auth/register" className="font-semibold text-primary hover:underline">
          {tNav("register")}
        </Link>
      </p>
    </div>
  );
}
