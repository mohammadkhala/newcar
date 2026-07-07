"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  const t = useTranslations("Nav");

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-secondary/60 transition-colors hover:text-primary ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4 shrink-0 rtl:rotate-180"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12.5 5L7.5 10l5 5" />
      </svg>
      {t("back")}
    </button>
  );
}
