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

  const load = useCallback(async () => {
    const res = await bffFetch("customer/info", { method: "GET", locale });
    if (res.status === 401) {
      setUnauthorized(true);
      setInfo(null);
      return;
    }
    if (!res.ok) {
      setUnauthorized(true);
      return;
    }
    setUnauthorized(false);
    setInfo((await res.json()) as Record<string, unknown>);
  }, [locale]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void load();
    });
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
      const res = await bffFetch("customer/remove-account", {
        method: "DELETE",
        locale,
      });
      if (res.ok) {
        await logout();
      } else {
        alert("فشل في الحذف.");
      }
    } catch {
      alert("حدث خطأ.");
    }
  }

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-secondary">{t("unauthorized")}</p>
        <a
          href={`/${locale}/auth/login`}
          className="mt-4 inline-block text-primary hover:underline"
        >
          {tNav("login")}
        </a>
      </div>
    );
  }

  // Use loyalty points if available, otherwise 0
  const pointsCount = info?.loyalty_point ? Number(info.loyalty_point) : 0;
  const fullName = `${String(info?.["f_name"] ?? "")} ${String(info?.["l_name"] ?? "")}`.trim();
  const profileImage =
    info?.["image_full_url"] ||
    info?.["image_fullpath"] ||
    info?.["image"] ||
    null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      
      <div className="store-card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-start">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border-soft bg-surface-muted shadow-sm">
            {profileImage ? (
              <img
                src={String(profileImage)}
                alt={fullName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                  (e.target as HTMLImageElement).className =
                    "h-full w-full object-contain p-2 opacity-50";
                }}
              />
            ) : (
              <img
                src="/logo.png"
                alt="NEW CAR"
                className="h-full w-full object-contain p-2 opacity-50"
              />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary sm:text-2xl">
              {fullName || "..."}
            </h1>
            <p className="mt-1 text-sm text-secondary/75">
              {t("pointsValue", { count: pointsCount })}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Options */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        
        {/* Notifications */}
        <Link href="/notifications" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("notifications")}</span>
        </Link>

        {/* Points */}
        <Link href="/account/loyalty" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("points")}</span>
        </Link>

        {/* Address */}
        <Link href="/account/addresses" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("addresses")}</span>
        </Link>

        {/* Profile */}
        <Link href="/account/profile" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("profile")}</span>
        </Link>

        {/* Track Order */}
        <Link href="/account/track-order" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("trackOrder")}</span>
        </Link>

        {/* Orders */}
        <Link href="/account/orders" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5v-1zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V8zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("orders")}</span>
        </Link>

        {/* Logout */}
        <button type="button" onClick={() => void logout()} className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-red-500/50 hover:bg-red-50/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{tNav("logout")}</span>
        </button>

        {/* Delete Account */}
        <button type="button" onClick={() => void deleteAccount()} className="store-card flex aspect-square flex-col items-center justify-center gap-2 p-4 text-center border-red-200 bg-red-50/30 text-red-600 transition-colors hover:bg-red-50 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{t("deleteAccount")}</span>
            <span className="text-[10px] opacity-70">{t("deleteWarning")}</span>
          </div>
        </button>

        {/* About Us */}
        <Link href="/cms/pages" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("aboutUs")}</span>
        </Link>

        {/* Contact Us */}
        <Link href="/cms/contact" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("contactUs")}</span>
        </Link>

        {/* Terms & Conditions */}
        <Link href="/cms/pages?slug=terms-and-conditions" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
            <path d="M4.5 12.5A.5.5 0 0 1 5 12h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0-2A.5.5 0 0 1 5 10h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm1.639-3.708 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047l1.888.974V8.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8s1.54-1.274 1.639-1.208zM6.25 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("terms")}</span>
        </Link>

        {/* Privacy Policy */}
        <Link href="/cms/pages?slug=privacy-policy" className="store-card flex aspect-square flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-muted/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
            <path d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415z"/>
          </svg>
          <span className="text-sm font-semibold text-secondary">{t("privacy")}</span>
        </Link>
        
      </div>
    </div>
  );
}