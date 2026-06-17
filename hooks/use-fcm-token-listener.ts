"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { bffFetch } from "@/lib/bff-client";

declare global {
  interface Window {
    setFcmToken?: (token: string) => void | Promise<void>;
    __ncLastFcmToken?: string;
  }
}

/**
 * Listens for FCM token messages from the Native Wrapper (WebView)
 * and sends the token to the Laravel backend.
 */
export function useFcmTokenListener(isAuthenticated: boolean) {
  const params = useParams();
  const locale = String(params?.locale ?? "ar");

  useEffect(() => {
    const normalizedLocale = String(locale || "ar").toLowerCase();
    const languageTopic = `market_${normalizedLocale}`;
    const tokenStorageKey = "nc_fcm_token";

    const subscribeToLanguageTopic = async (token: string) => {
      await bffFetch("fcm-subscribe-to-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, topic: languageTopic }),
        locale,
      });
    };

    const persistToken = (token: string) => {
      try {
        localStorage.setItem(tokenStorageKey, token);
      } catch {
        // Ignore storage failures (private mode / restricted WebView).
      }
      window.__ncLastFcmToken = token;
    };

    const readPersistedToken = (): string => {
      const fromWindow = String(window.__ncLastFcmToken || "").trim();
      if (fromWindow) {
        return fromWindow;
      }
      try {
        return String(localStorage.getItem(tokenStorageKey) || "").trim();
      } catch {
        return "";
      }
    };

    const linkDeviceToAccount = async (token: string) => {
      const res = await bffFetch("customer/device/push-token/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        locale,
      });
      if (!res.ok) {
        throw new Error(`Device link failed (${res.status})`);
      }
    };

    const linkTokenToProfile = async (token: string) => {
      const res = await bffFetch("customer/cm-firebase-token", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cm_firebase_token: token }),
        locale,
      });
      if (!res.ok) {
        throw new Error(`Token link failed (${res.status})`);
      }
    };

    const isSessionAuthenticated = async (): Promise<boolean> => {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          return false;
        }
        const payload = (await res.json()) as { authenticated?: boolean };
        return Boolean(payload?.authenticated);
      } catch {
        return isAuthenticated;
      }
    };

    const processToken = async (token: string) => {
      const normalizedToken = String(token || "").trim();
      if (!normalizedToken) {
        return;
      }
      persistToken(normalizedToken);

      // 1) Always subscribe to locale topic (works for guest/authenticated users).
      try {
        await subscribeToLanguageTopic(normalizedToken);
      } catch (e) {
        void e;
      }

      // 2) Only authenticated users get token linked on users.cm_firebase_token.
      const authenticatedNow = await isSessionAuthenticated();
      if (authenticatedNow) {
        try {
          await linkDeviceToAccount(normalizedToken);
        } catch (e) {
          void e;
        }
        try {
          await linkTokenToProfile(normalizedToken);
        } catch (e) {
          void e;
        }
      }
    };

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data && data.type === "FCM_TOKEN" && data.token) {
          await processToken(data.token);
        }
      } catch {
        // Ignore parsing errors for other messages
      }
    };

    window.addEventListener("message", handleMessage);
    
    window.setFcmToken = async (token: string) => {
      await processToken(token);
    };

    // If token arrived before login, bind it once authentication is available.
    if (isAuthenticated) {
      void processToken(readPersistedToken());
    }

    const retryLink = () => {
      void processToken(readPersistedToken());
    };
    const retryOnVisibility = () => {
      if (document.visibilityState === "visible") {
        retryLink();
      }
    };
    window.addEventListener("focus", retryLink);
    document.addEventListener("visibilitychange", retryOnVisibility);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("focus", retryLink);
      document.removeEventListener("visibilitychange", retryOnVisibility);
      delete window.setFcmToken;
    };
  }, [isAuthenticated, locale]);
}
