"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { clientPostJson } from "@/lib/client-post";

export default function ContactPage() {
  const t = useTranslations("CMS");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    const res = await clientPostJson(
      "contact-us",
      {
        name,
        email,
        phone: phone || undefined,
        subject: subject || undefined,
        message,
      },
      locale,
    );
    if (res.ok) {
      setStatus("ok");
      setMessage("");
    } else if (res.status === 429) {
      setStatus("err");
    } else {
      setStatus("err");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold text-secondary">{t("contactTitle")}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Phone (optional)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Subject (optional)
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("contactMessage")}
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-surface-muted px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white"
        >
          {t("contactSubmit")}
        </button>
      </form>
      {status === "ok" && (
        <p className="text-sm text-green-700">{t("sent")}</p>
      )}
      {status === "err" && (
        <p className="text-sm text-red-600">{t("throttle")}</p>
      )}
    </div>
  );
}
