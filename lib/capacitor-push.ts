import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

const FCM_TOKEN_STORAGE_KEY = 'nc_fcm_token';
const RETRY_DELAYS_MS = [1000, 3000, 10000, 30000];

declare global {
  interface Window {
    setFcmToken?: (token: string) => void | Promise<void>;
  }
}

function getIsArabicUi(): boolean {
  if (typeof document === "undefined") {
    return true;
  }
  const lang = (document.documentElement.lang || "").toLowerCase();
  return lang.startsWith("ar");
}

function readOptionalTemporaryToken(): string {
  try {
    return String(window.localStorage.getItem("nc_temporary_token") || "").trim();
  } catch {
    return "";
  }
}

/**
 * Business purpose: persist the native FCM token server-side before the WebView listener is ready (anonymous register).
 */
async function postDevicePushTokenToBackend(token: string, localeHeader: string): Promise<boolean> {
  const rawPlatform = Capacitor.getPlatform();
  const platform = rawPlatform === "ios" ? "ios" : rawPlatform === "android" ? "android" : "web";
  const temporaryToken = readOptionalTemporaryToken();
  const body: Record<string, string> = { token, platform };
  if (temporaryToken) {
    body.temporary_token = temporaryToken;
  }

  const res = await fetch("/api/bff/device/push-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-localization": localeHeader,
    },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return res.ok;
}

/**
 * Business purpose: tolerate transient WebView/network failures when registering the device token with Laravel.
 */
async function registerPushTokenWithRetry(token: string, localeHeader: string): Promise<void> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      if (await postDevicePushTokenToBackend(token, localeHeader)) {
        return;
      }
    } catch {
      // Continue retry loop.
    }
    if (attempt < RETRY_DELAYS_MS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
    }
  }
}

export async function setupCapacitorPushNotifications() {
  if (typeof window === 'undefined') return;
  
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const isArabicUi = getIsArabicUi();

    // Attach listeners before register() so we don't miss fast registration callbacks.
    PushNotifications.addListener('registration', (event) => {
      const tokenValue = String(event.value || "").trim();
      if (!tokenValue) {
        return;
      }
      try {
        window.localStorage.setItem(FCM_TOKEN_STORAGE_KEY, tokenValue);
      } catch {
        // Ignore storage failures (private mode / restricted WebView).
      }
      if (typeof window.setFcmToken === "function") {
        void window.setFcmToken(tokenValue);
      }
      const localeHeader = getIsArabicUi() ? "ar" : "en";
      void registerPushTokenWithRetry(tokenValue, localeHeader);
    });

    PushNotifications.addListener('registrationError', (error) => {
      void error;
    });

    // Add a listener for when the app is in the foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      void notification;
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      // Extract URL from the notification payload
      const data = notification.notification.data;
      if (data && data.url) {
        // Using Next.js router would be better, but window.location works as a fallback
        // Since we're in a global context, we'll use window.location
        window.location.href = data.url;
      }
    });

    const prePermissionMessage = isArabicUi
      ? "لتصلك تحديثات الطلب والعروض الجديدة، يرجى السماح بالإشعارات."
      : "To receive order updates and offers, please allow notifications.";
    const continuePermissionRequest = window.confirm(prePermissionMessage);
    if (!continuePermissionRequest) {
      return;
    }

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
    } else {
      const deniedMessage = isArabicUi
        ? "تم رفض إذن الإشعارات. يمكنك تفعيل الإشعارات لاحقًا من إعدادات التطبيق في الجهاز."
        : "Notification permission was denied. You can enable notifications later from app settings.";
      window.alert(deniedMessage);
    }

  } catch (error) {
    void error;
  }
}
