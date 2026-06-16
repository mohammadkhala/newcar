import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

/**
 * Catch-all for unmatched paths under a valid locale (e.g. /ar/typo-route).
 * Without this, the App Router can't resolve a layout tree for the path at all and
 * falls back to the bare root layout (no <html>/<body>), throwing NEXT_MISSING_ROOT_TAGS.
 * This file lets routing land inside [locale] so app/[locale]/not-found.tsx (and the
 * html/body-rendering app/[locale]/layout.tsx) handle the 404 instead.
 */
export default async function CatchAllPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
