"use client";

import { useLocale, useTranslations } from "next-intl";
import { IconSearch } from "@/components/store/header-icons";
import { useRouter } from "@/i18n/navigation";

type SearchVariant = "light" | "dark" | "newcar";

type Props = {
  /** Light: soft bar. Dark: on slate. Hala: white pill, yellow start button, physical-LTR control bar. */
  variant?: SearchVariant;
};

export function HeaderSearch({ variant = "light" }: Props) {
  const t = useTranslations("Search");
  const router = useRouter();
  const locale = useLocale();
  const light = variant === "light";
  const newcar = variant === "newcar";
  const rtl = locale === "ar" || locale === "he";

  if (newcar) {
    return (
      <form
        dir="ltr"
        className="flex w-full min-w-0 max-w-3xl items-stretch overflow-hidden rounded-full border-0 bg-white p-1 shadow-sm ring-1 ring-white/30"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get("q") ?? "").trim();
          const q = new URLSearchParams();
          if (name) {
            q.set("name", name);
          }
          q.set("offset", "1");
          router.push(`/shop/search?${q.toString()}`);
        }}
      >
        <button
          type="submit"
          aria-label={t("submit")}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAB308] text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-10 sm:w-10"
        >
          <IconSearch className="h-5 w-5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <input
            name="q"
            type="search"
            autoComplete="search"
            dir={rtl ? "rtl" : "ltr"}
            placeholder={t("headerPlaceholder")}
            className={`h-9 w-full min-w-0 border-0 bg-transparent px-2 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none sm:h-10 ${rtl ? "text-right" : "text-left"}`}
            style={{ textAlign: rtl ? "right" : "left" }}
            aria-label={t("nameLabel")}
          />
        </div>
      </form>
    );
  }

  return (
    <form
      className={
        light
          ? "flex w-full max-w-2xl min-w-0 items-center gap-1 rounded-full border border-border-soft bg-surface-muted px-2 py-1 shadow-sm ring-1 ring-black/[0.04]"
          : "flex w-full max-w-2xl min-w-0 items-center gap-1 rounded-full border border-white/25 bg-white px-2 py-1 shadow-lg shadow-black/20 ring-1 ring-black/5"
      }
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get("q") ?? "").trim();
        const q = new URLSearchParams();
        if (name) {
          q.set("name", name);
        }
        q.set("offset", "1");
        router.push(`/shop/search?${q.toString()}`);
      }}
    >
      <div className="relative min-h-10 min-w-0 flex-1">
        <span
          className={`pointer-events-none absolute start-3 top-1/2 z-[1] -translate-y-1/2 ${light ? "text-secondary/45" : "text-secondary/50"}`}
          aria-hidden
        >
          <IconSearch className="h-4 w-4 md:h-5 md:w-5" />
        </span>
        <input
          name="q"
          type="search"
          autoComplete="search"
          placeholder={t("namePlaceholder")}
          className="min-h-10 w-full min-w-0 rounded-full border-0 bg-transparent py-2 ps-10 pe-2 text-sm text-secondary placeholder:text-secondary/55 focus:outline-none md:ps-11"
          aria-label={t("nameLabel")}
        />
      </div>
      <button
        type="submit"
        aria-label={t("submit")}
        className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-primary px-3 text-white transition-opacity hover:opacity-90"
      >
        <IconSearch className="h-5 w-5" aria-hidden />
      </button>
    </form>
  );
}
