"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { IconLogout, IconUser, IconUserPlus } from "@/components/store/header-icons";

type Props = {
  isAuthenticated: boolean;
};

export function HeaderAccountMenu({ isAuthenticated }: Props) {
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

  const itemClass =
    "flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:text-sm";

  return (
    <div ref={rootRef} className="relative header-account-menu">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="store-header-account-panel"
        aria-label={t("accountMenuAria")}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex min-h-11 items-center rounded-xl border text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 ${
          isAuthenticated
            ? "min-w-11 justify-center p-2"
            : "gap-2 px-2.5 py-2 sm:px-3"
        } ${
          open
            ? "border-primary/60 bg-white/15"
            : "border-white/25 bg-white/5 hover:border-primary/40 hover:bg-white/10"
        }`}
      >
        <IconUser className="h-5 w-5 shrink-0 opacity-95" />
        {!isAuthenticated ? (
          <span className="max-w-[5rem] truncate text-xs font-bold sm:max-w-[6.5rem] sm:text-sm">
            {t("loginShort")}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id="store-header-account-panel"
          role="menu"
          className="absolute end-0 top-full z-[10000] mt-1.5 w-max min-w-[9rem] max-w-[min(calc(100vw-1rem),12rem)] rounded-lg border border-white/10 bg-slate-800 p-1 shadow-2xl ring-1 ring-black/40"
        >
          {!isAuthenticated ? (
            <>
              <Link href="/auth/login" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                <IconUser className="h-4 w-4 shrink-0 opacity-80" />
                <span className="min-w-0 truncate">{t("login")}</span>
              </Link>
              <Link href="/auth/register" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                <IconUserPlus className="h-4 w-4 shrink-0 opacity-80" />
                <span className="min-w-0 truncate">{t("register")}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/account" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                <IconUser className="h-4 w-4 shrink-0 opacity-90" />
                <span className="min-w-0 truncate">{t("account")}</span>
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
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
