"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { bffFetch } from "@/lib/bff-client";

/**
 * Listens for FCM token messages from the Native Wrapper (WebView)
 * and sends the token to the Laravel backend.
 */
export function useFcmTokenListener(isAuthenticated: boolean) {
  const locale = useLocale();

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
      (window as any).__ncLastFcmToken = token;
    };

    const readPersistedToken = (): string => {
      const fromWindow = String((window as any).__ncLastFcmToken || "").trim();
      if (fromWindow) {
        return fromWindow;
      }
      try {
        return String(localStorage.getItem(tokenStorageKey) || "").trim();
      } catch {
        return "";
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
      console.log("FCM Token successfully linked to user profile.");
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
        console.log(`FCM Token subscribed to '${languageTopic}' topic.`);
      } catch (e) {
        console.error("Failed to subscribe to topic:", e);
      }

      // 2) Only authenticated users get token linked on users.cm_firebase_token.
      const authenticatedNow = await isSessionAuthenticated();
      if (authenticatedNow) {
        try {
          await linkTokenToProfile(normalizedToken);
        } catch (e) {
          console.error("Failed to link FCM token to profile:", e);
        }
      }
    };

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data && data.type === "FCM_TOKEN" && data.token) {
          await processToken(data.token);
        }
      } catch (error) {
        // Ignore parsing errors for other messages
      }
    };

    window.addEventListener("message", handleMessage);
    
    (window as any).setFcmToken = async (token: string) => {
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
      delete (window as any).setFcmToken;
    };
  }, [isAuthenticated, locale]);
}
