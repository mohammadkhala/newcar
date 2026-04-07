"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api-base";
import { getStoredGuestId } from "@/lib/guest-storage";

export default function NotificationsPage() {
  const t = useTranslations("Notifications");
  const locale = useLocale();
  const [items, setItems] = useState<unknown[]>([]);

  useEffect(() => {
    const base = getApiBaseUrl();
    const guestId = getStoredGuestId();
    if (!base || !guestId) {
      return;
    }
    void (async () => {
      const res = await fetch(`${base}/notifications`, {
        headers: {
          Accept: "application/json",
          "X-localization": locale,
          "guest-id": guestId,
        },
      });
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    })();
  }, [locale]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
      <h1 className="text-2xl font-bold text-secondary">{t("title")}</h1>
      {!getStoredGuestId() && (
        <p className="text-sm text-secondary/70">{t("guestHint")}</p>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-secondary/80">{t("empty")}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((row, i) => (
            <li key={i} className="rounded-lg border border-surface-muted p-3">
              <pre className="whitespace-pre-wrap font-sans">
                {JSON.stringify(row, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
