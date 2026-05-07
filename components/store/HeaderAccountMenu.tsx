"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { IconLogout, IconUser } from "@/components/store/header-icons";

type Props = {
  isAuthenticated: boolean;
  /** New Car: black header, white stacked icon in ring + “حسابي”. */
  variant?: "light" | "dark" | "newcar";
  /** Narrow mobile strip: same layout, smaller. */
  compact?: boolean;
};

/**
 * Business purpose: account entry; `newcar` matches stacked icon+label and `account` copy (e.g. حسابي).
 */
export function HeaderAccountMenu({
  isAuthenticated,
  variant = "dark",
  compact = false,
}: Props) {
  const t = useTranslations("Nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    if (logoutBusy) return;
    setLogoutBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setOpen(false);
      router.refresh();
    } finally {
      setLogoutBusy(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const newcar = variant === "newcar";
  const light = variant === "light" && !newcar;
  const itemClassDark =
    "flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:text-sm";
  const itemClassLight =
    "flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-surface-muted sm:text-sm";
  const itemClass = newcar ? itemClassLight : light ? itemClassLight : itemClassDark;

  const accountLabel = t("account");

  const halaRing = compact ? "h-7 w-7" : "h-8 w-8 sm:h-9 sm:w-9";
  const halaIcon = compact ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5";
  const halaText = compact ? "text-[9px] leading-tight" : "text-[10px] font-semibold leading-tight sm:text-xs";

  const halaBase =
    "account-trigger cdz-top-link flex min-w-0 max-w-[5.75rem] flex-col items-center gap-0.5 text-center text-white no-underline outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#EAB308]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:max-w-[6.5rem]";

  if (newcar && !isAuthenticated) {
    return (
      <div className="account-wrapper">
        <Link href="/auth/login" className={halaBase} aria-label={accountLabel}>
          <span
            className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white ${halaRing}`}
            aria-hidden
          >
            <IconUser className={`${halaIcon} text-white`} />
          </span>
          <span className={halaText}>{accountLabel}</span>
        </Link>
      </div>
    );
  }

  if (newcar && isAuthenticated) {
    return (
      <div ref={rootRef} className="account-wrapper relative">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls="store-header-account-panel"
          className={halaBase}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <span
            className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white ${halaRing}`}
            aria-hidden
          >
            <IconUser className={`${halaIcon} text-white`} />
          </span>
          <span className={halaText}>{accountLabel}</span>
        </button>
        {open ? (
          <div
            id="store-header-account-panel"
            role="menu"
            className="absolute end-0 top-full z-[10000] mt-1.5 w-max min-w-[9rem] max-w-[min(calc(100vw-1rem),12rem)] rounded-lg border border-border-soft bg-white p-1 shadow-xl ring-1 ring-black/5"
          >
            <Link
              href="/account"
              role="menuitem"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <IconUser className="h-4 w-4 shrink-0 opacity-90" />
              <span className="min-w-0 truncate">{accountLabel}</span>
            </Link>
            <div className="my-1 h-px bg-border-soft" role="presentation" />
            <button
              type="button"
              role="menuitem"
              disabled={logoutBusy}
              aria-busy={logoutBusy}
              className={`${itemClass} w-full text-start text-red-600 hover:bg-red-50 disabled:opacity-60`}
              onClick={() => void handleLogout()}
            >
              <IconLogout className="h-4 w-4 shrink-0 opacity-90" />
              <span className="min-w-0 truncate">{t("logout")}</span>
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  const triggerClassLight = `account-trigger cdz-top-link group inline-flex max-w-full min-h-0 items-center border-0 bg-transparent p-0 text-inherit ${
    compact ? "h-10 gap-1.5 py-0.5 text-xs font-bold" : "h-12 gap-2 py-0 text-sm font-semibold"
  } text-secondary no-underline outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
    open ? "text-primary" : ""
  } flex-row rtl:flex-row-reverse`;

  const triggerClassDark = `account-trigger inline-flex h-11 min-h-0 items-center border-0 bg-transparent px-0.5 text-sm font-bold text-white outline-none flex-row rtl:flex-row-reverse ${
    open ? "text-white" : ""
  } gap-2 hover:underline focus-visible:ring-2 focus-visible:ring-primary/50`;

  const iconClass = compact ? "h-5 w-5" : "h-6 w-6";
  const iconColor = light ? "shrink-0 text-primary" : "shrink-0 text-white";
  const labelClass = "whitespace-nowrap";

  if (light && !isAuthenticated) {
    return (
      <div className="account-wrapper">
        <Link
          href="/auth/login"
          className={`${triggerClassLight} w-auto`}
          aria-label={accountLabel}
        >
          <IconUser className={`${iconClass} ${iconColor}`} />
          <span className={labelClass}>{accountLabel}</span>
        </Link>
      </div>
    );
  }

  if (light && isAuthenticated) {
    return (
      <div ref={rootRef} className="account-wrapper relative">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls="store-header-account-panel"
          className={triggerClassLight}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <IconUser className={`${iconClass} ${iconColor}`} />
          <span className={labelClass}>{accountLabel}</span>
        </button>
        {open ? (
          <div
            id="store-header-account-panel"
            role="menu"
            className="absolute end-0 top-full z-[10000] mt-1.5 w-max min-w-[9rem] max-w-[min(calc(100vw-1rem),12rem)] rounded-lg border border-border-soft bg-white p-1 shadow-xl ring-1 ring-black/5"
          >
            <Link
              href="/account"
              role="menuitem"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <IconUser className="h-4 w-4 shrink-0 opacity-90" />
              <span className="min-w-0 truncate">{accountLabel}</span>
            </Link>
            <div className="my-1 h-px bg-border-soft" role="presentation" />
            <button
              type="button"
              role="menuitem"
              disabled={logoutBusy}
              aria-busy={logoutBusy}
              className={`${itemClass} w-full text-start text-red-600 hover:bg-red-50 disabled:opacity-60`}
              onClick={() => void handleLogout()}
            >
              <IconLogout className="h-4 w-4 shrink-0 opacity-90" />
              <span className="min-w-0 truncate">{t("logout")}</span>
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (!light && !isAuthenticated) {
    return (
      <div className="account-wrapper">
        <Link
          href="/auth/login"
          className={triggerClassDark}
          aria-label={accountLabel}
        >
          <IconUser className="h-5 w-5 shrink-0" />
          <span className="whitespace-nowrap text-xs sm:text-sm">{t("loginShort")}</span>
        </Link>
      </div>
    );
  }

  if (!light && isAuthenticated) {
    return (
      <div ref={rootRef} className="account-wrapper relative">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls="store-header-account-panel"
          className={triggerClassDark}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <IconUser className="h-5 w-5 shrink-0" />
          <span className="whitespace-nowrap text-xs sm:text-sm">{accountLabel}</span>
        </button>
        {open ? (
          <div
            id="store-header-account-panel"
            role="menu"
            className="absolute end-0 top-full z-[10000] mt-1.5 w-max min-w-[9rem] max-w-[min(calc(100vw-1rem),12rem)] rounded-lg border border-white/10 bg-slate-800 p-1 shadow-2xl ring-1 ring-black/40"
          >
            <Link href="/account" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
              <IconUser className="h-4 w-4 shrink-0 opacity-90" />
              <span className="min-w-0 truncate">{accountLabel}</span>
            </Link>
            <div className="my-1 h-px bg-white/10" role="presentation" />
            <button
              type="button"
              role="menuitem"
              disabled={logoutBusy}
              aria-busy={logoutBusy}
              className={`${itemClass} w-full text-start text-red-200 hover:bg-red-950/40 hover:text-red-100 disabled:opacity-60`}
              onClick={() => void handleLogout()}
            >
              <IconLogout className="h-4 w-4 shrink-0 opacity-90" />
              <span className="min-w-0 truncate">{t("logout")}</span>
            </button>
          </div>
        ) : null}
      </div>
    );
  }
}
