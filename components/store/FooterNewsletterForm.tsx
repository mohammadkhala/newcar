"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

/**
 * Subscribes email via BFF to Laravel POST /api/v1/newsletter/subscribe.
 */
export function FooterNewsletterForm() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("idle");
    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string)?.trim() ?? "";
    if (!email) {
      setStatus("err");
      return;
    }
    try {
      const res = await fetch("/api/bff/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-localization": locale,
        },
        body: JSON.stringify({ email, locale }),
      });
      if (res.ok) {
        setStatus("ok");
        form.reset();
        return;
      }
      setStatus("err");
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch"
        noValidate
      >
        <label className="sr-only" htmlFor="footer-newsletter-email">
          {t("newsletterEmailLabel")}
        </label>
        <input
          id="footer-newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("newsletterPlaceholder")}
          className="store-panel min-h-[44px] flex-1 border-border-soft px-3 text-sm text-secondary outline-none focus:border-primary/40"
          required
        />
        <button
          type="submit"
          className="store-btn-primary min-h-[44px] px-4 text-sm whitespace-nowrap"
        >
          {t("newsletterSubmit")}
        </button>
      </form>
      {status === "ok" ? (
        <p className="mt-2 text-center text-xs text-green-700" role="status">
          {t("newsletterSuccess")}
        </p>
      ) : null}
      {status === "err" ? (
        <p className="mt-2 text-center text-xs text-red-600" role="alert">
          {t("newsletterError")}
        </p>
      ) : null}
    </div>
  );
}
