"use client";

const GUEST_KEY = "nc_guest_id";

/**
 * Persists Laravel guest user id for guest-id header (coupon, orders, notifications).
 */
export function getStoredGuestId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(GUEST_KEY) ?? "";
}

export function setStoredGuestId(id: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(GUEST_KEY, id);
}
