"use client";

import { useTranslations } from "next-intl";
import { IconSearch } from "@/components/store/header-icons";
import { useRouter } from "@/i18n/navigation";

export function HeaderSearch() {
  const t = useTranslations("Search");
  const router = useRouter();

  return (
    <form
      className="flex w-full max-w-2xl min-w-0 items-center gap-1 rounded-full border border-white/25 bg-white px-2 py-1 shadow-lg shadow-black/20 ring-1 ring-black/5"
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
          className="pointer-events-none absolute start-3 top-1/2 z-[1] -translate-y-1/2 text-secondary/50"
          aria-hidden
        >
          <IconSearch className="h-4 w-4 md:h-5 md:w-5" />
        </span>
        <input
          name="q"
          type="search"
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
