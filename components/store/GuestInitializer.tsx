"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { getApiBaseUrl } from "@/lib/api-base";
import { getStoredGuestId, setStoredGuestId } from "@/lib/guest-storage";

/**
 * Dedupes guest/add while a request is in flight (e.g. React Strict Mode double mount in dev).
 */
let guestAddInFlight: Promise<void> | null = null;

const GUEST_ADD_BACKOFF_KEY = "nc_guest_add_backoff_until";

function guestBackoffUntil(): number {
  if (typeof window === "undefined") {
    return 0;
  }
  try {
    const raw = window.sessionStorage.getItem(GUEST_ADD_BACKOFF_KEY);
    return raw ? Number.parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function setGuestBackoff(msFromNow: number) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(
      GUEST_ADD_BACKOFF_KEY,
      String(Date.now() + msFromNow),
    );
  } catch {
    /* ignore */
  }
}

/**
 * Ensures a Laravel guest row exists and stores guest-id for coupon/order headers.
 */
export function GuestInitializer() {
  const locale = useLocale();

  useEffect(() => {
    if (getStoredGuestId()) {
      return;
    }
    if (Date.now() < guestBackoffUntil()) {
      return;
    }
    const base = getApiBaseUrl();
    if (!base) {
      return;
    }
    if (guestAddInFlight) {
      void guestAddInFlight;
      return;
    }
    guestAddInFlight = (async () => {
      const res = await fetch(`${base}/guest/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-localization": locale,
          Accept: "application/json",
        },
        body: JSON.stringify({}),
      });
      if (res.status === 429) {
        setGuestBackoff(90_000);
        return;
      }
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { guest?: { id?: number } };
      if (data.guest?.id != null) {
        setStoredGuestId(String(data.guest.id));
      }
    })().finally(() => {
      guestAddInFlight = null;
    });
  }, [locale]);

  return null;
}
