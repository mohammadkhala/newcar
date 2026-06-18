"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { bffFetch } from "@/lib/bff-client";

export default function AccountPage() {
  const t = useTranslations("Account");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const [info, setInfo] = useState<Record<string, unknown> | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await bffFetch("customer/info", { method: "GET", locale });
    if (res.status === 401) { setUnauthorized(true); setInfo(null); setLoading(false); return; }
    if (!res.ok) { setUnauthorized(true); setLoading(false); return; }
    setUnauthorized(false);
    setInfo((await res.json()) as Record<string, unknown>);
    setLoading(false);
  }, [locale]);

  useEffect(() => {
    const id = requestAnimationFrame(() => { void load(); });
    return () => cancelAnimationFrame(id);
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setInfo(null);
    setUnauthorized(true);
  }

  async function deleteAccount() {
    if (!confirm(t("deleteWarning"))) return;
    try {
      const res = await bffFetch("customer/remove-account", { method: "DELETE", locale });
      if (res.ok) { await logout(); } else { alert("فشل في الحذف."); }
    } catch { alert("حدث خطأ."); }
  }

  if (!loading && unauthorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="store-card w-full max-w-sm p-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-black text-secondary">{t("unauthorized")}</h2>
          <a href={`/${locale}/auth/login`} className="store-btn-primary mt-4 inline-flex w-full justify-center text-sm">
            {tNav("login")}
          </a>
        </div>
      </div>
    );
  }

  const points = info?.loyalty_point ? Number(info.loyalty_point) : 0;
  const fullName = `${String(info?.["f_name"] ?? "")} ${String(info?.["l_name"] ?? "")}`.trim();
  const email = String(info?.["email"] ?? "");
  const profileImage = info?.["image_full_url"] || info?.["image_fullpath"] || info?.["image"] || null;

  const navLinks = [
    { href: "/account/orders", label: t("orders"), icon: "📦" },
    { href: "/account/track-order", label: t("trackOrder"), icon: "🚚" },
    { href: "/account/loyalty", label: t("points"), icon: "⭐" },
    { href: "/account/profile", label: t("profile"), icon: "✏️" },
    { href: "/account/addresses", label: t("addresses"), icon: "📍" },
    { href: "/notifications", label: t("notifications"), icon: "🔔" },
  ];

  const helpLinks = [
    { href: "/cms/contact", label: t("contactUs") },
    { href: "/cms/about", label: t("aboutUs") },
    { href: "/cms/privacy", label: t("privacy") },
    { href: "/cms/return-policy", label: "سياسة الإرجاع" },
    { href: "/cms/pages?slug=terms-and-conditions", label: t("terms") },
  ];

  const mainCards = [
    {
      href: "/account/orders",
      label: t("orders"),
      desc: "عرض وتتبع طلباتك",
      color: "from-orange-400 to-amber-500",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/>
        </svg>
      ),
    },
    {
      href: "/account/track-order",
      label: t("trackOrder"),
      desc: "تتبع شحنتك الآن",
      color: "from-blue-400 to-cyan-500",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
        </svg>
      ),
    },
    {
      href: "/account/loyalty",
      label: t("points"),
      desc: `${points} نقطة متاحة`,
      color: "from-yellow-400 to-orange-400",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
        </svg>
      ),
    },
    {
      href: "/account/profile",
      label: t("profile"),
      desc: "تعديل بياناتك الشخصية",
      color: "from-violet-400 to-purple-500",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
        </svg>
      ),
    },
    {
      href: "/account/addresses",
      label: t("addresses"),
      desc: "إدارة عناوين التوصيل",
      color: "from-emerald-400 to-teal-500",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
        </svg>
      ),
    },
    {
      href: "/notifications",
      label: t("notifications"),
      desc: "آخر إشعاراتك",
      color: "from-rose-400 to-pink-500",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="store-shell py-6 md:py-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

        {/* ── Sidebar ── */}
        <aside className="space-y-4">
          {/* Profile card */}
          <div className="store-card overflow-hidden p-0">
            <div className="h-16 bg-gradient-to-l from-primary via-amber-400 to-yellow-300" />
            <div className="px-4 pb-4">
              <div className="-mt-8 mb-3">
                <div className="inline-flex h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-white shadow">
                  {profileImage ? (
                    <img src={String(profileImage)} alt={fullName} className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; (e.target as HTMLImageElement).className = "h-full w-full object-contain p-2 opacity-40"; }}
                    />
                  ) : (
                    <img src="/logo.png" alt="NEW CAR" className="h-full w-full object-contain p-2 opacity-40" />
                  )}
                </div>
              </div>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
                </div>
              ) : (
                <>
                  <p className="font-black text-secondary">{fullName || "—"}</p>
                  {email && <p className="mt-0.5 text-xs text-secondary/50 truncate">{email}</p>}
                  <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-yellow-50 px-2.5 py-1 ring-1 ring-yellow-200">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-xs font-black text-yellow-700">{points}</span>
                    <span className="text-xs text-yellow-600">نقطة</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Nav links */}
          <div className="store-card p-2">
            <nav className="space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary/70 transition-colors hover:bg-surface-muted hover:text-secondary"
                >
                  <span className="text-base leading-none">{link.icon}</span>
                  <span className="flex-1">{link.label}</span>
                  <span className="text-secondary/25 text-base leading-none">‹</span>
                </Link>
              ))}
            </nav>

            <div className="my-2 border-t border-border-soft" />

            <nav className="space-y-0.5">
              {helpLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-secondary/50 transition-colors hover:bg-surface-muted hover:text-secondary/70"
                >
                  <span className="flex-1">{link.label}</span>
                  <span className="text-secondary/20 text-base leading-none">‹</span>
                </Link>
              ))}
            </nav>

            <div className="my-2 border-t border-border-soft" />

            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary/50 transition-colors hover:bg-surface-muted hover:text-secondary"
            >
              <span className="text-base leading-none">🚪</span>
              <span>{tNav("logout")}</span>
            </button>
            <button
              type="button"
              onClick={() => void deleteAccount()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <span className="text-base leading-none">🗑️</span>
              <span>{t("deleteAccount")}</span>
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="space-y-6">
          {/* Welcome banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary via-amber-400 to-yellow-300 p-6 text-black">
            <div className="relative z-10 max-w-[60%]">
              <p className="text-sm font-semibold opacity-75">مرحباً بك</p>
              <h1 className="mt-0.5 text-2xl font-black md:text-3xl">
                {loading ? "..." : (fullName || "عزيزي العميل")} 👋
              </h1>
              <p className="mt-1.5 text-sm opacity-70">إدارة حسابك وطلباتك من مكان واحد</p>
            </div>
            {/* Company logo */}
            <div className="absolute end-5 top-1/2 z-10 -translate-y-1/2">
              <img
                src="/logo.png"
                alt="NEW CAR"
                className="h-20 w-auto object-contain drop-shadow-md md:h-24"
              />
            </div>
            {/* Decorative circles */}
            <div className="absolute -end-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 end-16 h-24 w-24 rounded-full bg-white/10" />
          </div>

          {/* Action cards grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {mainCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group store-card flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="font-black text-secondary group-hover:text-primary transition-colors">{card.label}</p>
                  <p className="mt-0.5 text-xs text-secondary/50">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </main>

      </div>
    </div>
  );
}
