import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

const FCM_TOKEN_STORAGE_KEY = 'nc_fcm_token';
const RETRY_DELAYS_MS = [1000, 3000, 10000, 30000];
const PUSH_DENIED_INFO_KEY = 'nc_push_denied_info_shown';

declare global {
  interface Window {
    setFcmToken?: (token: string) => void | Promise<void>;
  }
}

let pushListenersAttached = false;
let permissionFlowPromise: Promise<void> | null = null;

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

/**
 * Business purpose: register push notification listeners once per WebView lifetime to avoid duplicate handlers.
 */
function attachPushListenersOnce(): void {
  if (pushListenersAttached) {
    return;
  }
  pushListenersAttached = true;

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

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    void notification;
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    const data = notification.notification.data;
    if (data && data.url) {
      window.location.href = data.url;
    }
  });
}

/**
 * Business purpose: on native shells, use the OS permission UI (iOS/Android) once per load and register when granted.
 */
async function runNativePermissionAndRegister(): Promise<void> {
  const isArabicUi = getIsArabicUi();

  const permissionResult = await PushNotifications.checkPermissions();
  if (permissionResult.receive === "granted") {
    await PushNotifications.register();
    return;
  }

  const permStatus = await PushNotifications.requestPermissions();

  if (permStatus.receive === "granted") {
    await PushNotifications.register();
    return;
  }

  try {
    if (window.localStorage.getItem(PUSH_DENIED_INFO_KEY) === "1") {
      return;
    }
    window.localStorage.setItem(PUSH_DENIED_INFO_KEY, "1");
  } catch {
    // If storage fails, still avoid repeated alerts in this session by skipping below when key set fails — show once.
  }

  const deniedMessage = isArabicUi
    ? "تم رفض إذن الإشعارات. يمكنك تفعيل الإشعارات لاحقًا من إعدادات التطبيق في الجهاز."
    : "Notification permission was denied. You can enable notifications later from app settings.";
  window.alert(deniedMessage);
}

export async function setupCapacitorPushNotifications() {
  if (typeof window === 'undefined') return;

  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    attachPushListenersOnce();

    if (!permissionFlowPromise) {
      permissionFlowPromise = runNativePermissionAndRegister().catch(() => {
        permissionFlowPromise = null;
      });
    }
    await permissionFlowPromise;
  } catch (error) {
    void error;
  }
}
