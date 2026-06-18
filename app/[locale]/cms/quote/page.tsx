"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { clientPostJson } from "@/lib/client-post";

export default function QuotePage() {
  const t = useTranslations("CMS");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await clientPostJson(
      "quotes",
      { name, email: email || undefined, phone: phone || undefined, message, source: "store-web" },
      locale,
    );
    setStatus(res.ok ? "ok" : "err");
    if (res.ok) setMessage("");
  }

  if (status === "ok") {
    return (
      <div className="store-shell flex min-h-[60vh] items-center justify-center py-10">
        <div className="store-card w-full max-w-md p-10 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-secondary">تم إرسال طلبك بنجاح!</h2>
          <p className="mt-2 text-sm text-secondary/60">
            سيتواصل معك فريقنا في أقرب وقت ممكن
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="store-btn-primary mt-6 inline-flex w-full items-center justify-center text-sm"
          >
            إرسال طلب جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="store-shell py-10 md:py-14">

      {/* Header */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-l from-primary via-amber-400 to-yellow-300 px-8 py-12 text-black md:px-14">
        <div className="relative z-10 max-w-lg">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black/10 text-2xl">
            💬
          </div>
          <h1 className="text-3xl font-black">{t("quoteTitle")}</h1>
          <p className="mt-2 text-sm font-medium opacity-75">
            أرسل لنا تفاصيل احتياجك وسنرد عليك بأفضل عرض سعر
          </p>
        </div>
        <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 end-20 h-28 w-28 rounded-full bg-white/10" />
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_340px]">

        {/* Form */}
        <div className="store-card p-6 md:p-8">
          <h2 className="mb-6 text-lg font-black text-secondary">بيانات الطلب</h2>
          <form onSubmit={onSubmit} className="space-y-5">

            <div>
              <label className="mb-1.5 block text-sm font-bold text-secondary">
                {t("quoteName")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الكامل"
                className="store-input w-full"
                autoComplete="name"
                suppressHydrationWarning
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-secondary">
                  {t("quotePhone")}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="store-input w-full"
                  autoComplete="tel"
                  dir="ltr"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-secondary">
                  {t("quoteEmail")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="store-input w-full"
                  autoComplete="email"
                  dir="ltr"
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-secondary">
                {t("quoteMessage")} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="اذكر تفاصيل القطعة أو الكمالية المطلوبة، موديل سيارتك، وأي تفاصيل إضافية..."
                className="store-input w-full resize-none"
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-secondary/40">
                كلما كانت التفاصيل أوضح، كان ردنا أسرع وأدق
              </p>
            </div>

            {status === "err" && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
                <span className="shrink-0 text-base">⚠️</span>
                <span>{t("throttle")}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="store-btn-primary flex w-full items-center justify-center gap-2 text-sm disabled:opacity-60"
              suppressHydrationWarning
            >
              {status === "loading" ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  جاري الإرسال...
                </>
              ) : (
                t("quoteSubmit")
              )}
            </button>
          </form>
        </div>

        {/* Side info */}
        <aside className="space-y-4">
          {[
            { icon: "⚡", title: "رد سريع", desc: "نرد على طلبات عروض الأسعار خلال ساعات قليلة في أيام العمل." },
            { icon: "💯", title: "أسعار تنافسية", desc: "نقدم أفضل الأسعار مع ضمان الجودة الأصلية للمنتجات." },
            { icon: "🚚", title: "توصيل لبابك", desc: "بعد الموافقة على العرض نوصل طلبك مباشرةً إلى عنوانك." },
            { icon: "🔒", title: "بياناتك محمية", desc: "جميع معلوماتك سرية ولن تُشارَك مع أي طرف ثالث." },
          ].map((card) => (
            <div key={card.title} className="store-card flex gap-4 p-4">
              <span className="shrink-0 text-2xl leading-none">{card.icon}</span>
              <div>
                <p className="text-sm font-black text-secondary">{card.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-secondary/55">{card.desc}</p>
              </div>
            </div>
          ))}
        </aside>

      </div>
    </div>
  );
}
