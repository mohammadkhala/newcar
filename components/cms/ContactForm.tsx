"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { clientPostJson } from "@/lib/client-post";

export function ContactForm() {
  const t = useTranslations("CMS");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await clientPostJson(
      "contact-us",
      { name, email, phone: phone || undefined, subject: subject || undefined, message },
      locale,
    );
    if (res.ok) {
      setStatus("ok");
      setName(""); setEmail(""); setPhone(""); setSubject(""); setMessage("");
    } else {
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-secondary">{t("sent")}</p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm text-primary hover:underline"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="block text-sm font-semibold text-secondary">{t("contactName")}</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="store-input w-full"
            autoComplete="name"
            suppressHydrationWarning
          />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-sm font-semibold text-secondary">{t("contactEmail")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="store-input w-full"
            autoComplete="email"
            suppressHydrationWarning
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="block text-sm font-semibold text-secondary">{t("contactPhone")}</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="store-input w-full"
            autoComplete="tel"
            inputMode="tel"
            suppressHydrationWarning
          />
        </label>
        <label className="block space-y-1.5">
          <span className="block text-sm font-semibold text-secondary">{t("contactSubject")}</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="store-input w-full"
            autoComplete="off"
            suppressHydrationWarning
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="block text-sm font-semibold text-secondary">{t("contactMessage")}</span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="store-input w-full resize-none"
          autoComplete="off"
        />
      </label>

      {status === "err" && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{t("throttle")}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="store-btn-primary w-full py-3 font-semibold disabled:opacity-60"
        suppressHydrationWarning
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            جاري الإرسال...
          </span>
        ) : t("contactSubmit")}
      </button>
    </form>
  );
}
