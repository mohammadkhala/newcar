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
  variant?: "light" | "dark";
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

  const triggerDark =
    "min-h-11 min-w-11 rounded-xl border border-white/20 bg-white/10 p-2 text-2xl leading-none shadow-sm transition-colors hover:border-primary/40 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
  const triggerLight =
    "min-h-11 min-w-11 rounded-xl border border-surface-muted bg-white p-2 text-2xl leading-none shadow-sm transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  const panelDark =
    "absolute left-1/2 top-full z-[10001] mt-2 min-w-[8.5rem] -translate-x-1/2 rounded-xl border border-white/15 bg-slate-800 p-1.5 shadow-2xl ring-1 ring-black/30";
  const panelLight =
    "absolute left-1/2 top-full z-[10001] mt-2 min-w-[8.5rem] -translate-x-1/2 rounded-xl border border-border-soft bg-white p-1.5 shadow-xl";

  const optDark =
    "flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-2xl leading-none transition-colors hover:bg-white/10";
  const optLight =
    "flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-2xl leading-none transition-colors hover:bg-surface-muted";

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
        className={variant === "dark" ? triggerDark : triggerLight}
      >
        <span aria-hidden>{LOCALE_FLAGS[locale] ?? "🌐"}</span>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={t("language")}
          className={variant === "dark" ? panelDark : panelLight}
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
                  className={`${variant === "dark" ? optDark : optLight} ${selected ? "cursor-default opacity-50" : ""}`}
                  onClick={() => {
                    if (o.key !== locale) {
                      router.replace(pathname, { locale: o.key });
                    }
                    setOpen(false);
                  }}
                >
                  <span aria-hidden>{LOCALE_FLAGS[o.key] ?? "🌐"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
