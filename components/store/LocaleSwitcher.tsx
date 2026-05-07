"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { LanguageOption } from "@/lib/types";

const FALLBACK_LABELS: Partial<Record<string, string>> = {
  ar: "العربية",
  en: "English",
  he: "עברית",
};

const LOCALE_FLAGS: Record<string, string> = {
  ar: "🇵🇸",
  en: "🇬🇧",
  he: "🇮🇱",
};

type Props = {
  languageOptions?: LanguageOption[] | null;
  /** Top strip: text label + dropdown (New Car header-top). halaTop: black bar, white text. */
  variant?: "light" | "dark" | "topBar" | "halaTop";
};

export function LocaleSwitcher({ languageOptions, variant = "light" }: Props) {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    const allowed = new Set<string>(routing.locales);
    if (languageOptions && languageOptions.length > 0) {
      const fromApi = languageOptions.filter((o) => allowed.has(o.key));
      if (fromApi.length > 0) {
        return fromApi;
      }
    }
    return routing.locales.map((key) => ({
      key,
      value: FALLBACK_LABELS[key] ?? key,
    }));
  }, [languageOptions]);

  const currentLabel =
    options.find((o) => o.key === locale)?.value ?? FALLBACK_LABELS[locale] ?? locale;

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

  const isTop = variant === "topBar";
  const isHala = variant === "halaTop";
  const triggerDark =
    "min-h-11 min-w-11 rounded-xl border border-white/20 bg-white/10 p-2 text-2xl leading-none shadow-sm transition-colors hover:border-primary/40 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
  const triggerLight =
    "min-h-11 min-w-11 rounded-xl border border-surface-muted bg-white p-2 text-2xl leading-none shadow-sm transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
  const triggerTopBar =
    "inline-flex min-h-7 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-semibold text-secondary/90 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
  const triggerHalaTop =
    "inline-flex min-h-7 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-white transition-colors hover:text-[#EAB308] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

  const panelDark =
    "absolute left-1/2 top-full z-[10001] mt-2 min-w-[8.5rem] -translate-x-1/2 rounded-xl border border-white/15 bg-slate-800 p-1.5 shadow-2xl ring-1 ring-black/30";
  const panelLight =
    "absolute left-1/2 top-full z-[10001] mt-2 min-w-[8.5rem] -translate-x-1/2 rounded-xl border border-border-soft bg-white p-1.5 shadow-xl";
  const panelTopBar =
    "absolute end-0 top-full z-[10001] mt-1.5 min-w-[8.5rem] rounded-md border border-border-soft bg-white p-1 shadow-lg ring-1 ring-black/5";
  const panelHalaTop =
    "absolute end-0 top-full z-[10001] mt-1.5 min-w-[8.5rem] rounded-md border border-white/15 bg-neutral-950 p-1 shadow-xl ring-1 ring-white/10";

  const optDark =
    "flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-2xl leading-none transition-colors hover:bg-white/10";
  const optLight =
    "flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-2xl leading-none transition-colors hover:bg-surface-muted";
  const optTopBar =
    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-surface-muted";
  const optHalaTop =
    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10";

  const triggerClass = isHala
    ? triggerHalaTop
    : isTop
      ? triggerTopBar
      : variant === "dark"
        ? triggerDark
        : triggerLight;
  const panelClass = isHala
    ? panelHalaTop
    : isTop
      ? panelTopBar
      : variant === "dark"
        ? panelDark
        : panelLight;
  const optionClass = isHala
    ? optHalaTop
    : isTop
      ? optTopBar
      : variant === "dark"
        ? optDark
        : optLight;

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={currentLabel}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={triggerClass}
      >
        {isTop || isHala ? (
          <>
            <span aria-hidden className={`text-sm ${isHala ? "opacity-90" : "opacity-80"}`}>
              {LOCALE_FLAGS[locale] ?? "🌐"}
            </span>
            <span>{currentLabel}</span>
            <span
              aria-hidden
              className={`text-[10px] ${isHala ? "text-white/50" : "text-secondary/50"}`}
            >
              ▼
            </span>
          </>
        ) : (
          <span aria-hidden>{LOCALE_FLAGS[locale] ?? "🌐"}</span>
        )}
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={t("language")}
          className={panelClass}
        >
          {options.map((o) => {
            const selected = o.key === locale;
            return (
              <li key={o.key} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={o.value}
                  disabled={selected}
                  className={`${optionClass} w-full text-start ${selected ? "cursor-default opacity-50" : ""}`}
                  onClick={() => {
                    if (o.key !== locale) {
                      router.replace(pathname, { locale: o.key });
                    }
                    setOpen(false);
                  }}
                >
                  {isTop || isHala ? (
                    <>
                      <span aria-hidden>{LOCALE_FLAGS[o.key] ?? "🌐"}</span>
                      <span>{o.value}</span>
                    </>
                  ) : (
                    <span aria-hidden>{LOCALE_FLAGS[o.key] ?? "🌐"}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
