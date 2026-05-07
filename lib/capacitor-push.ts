import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

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

export async function setupCapacitorPushNotifications() {
  if (typeof window === 'undefined') return;
  
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const isArabicUi = getIsArabicUi();

    // Attach listeners before register() so we don't miss fast registration callbacks.
    PushNotifications.addListener('registration', (token) => {
      if (typeof window.setFcmToken === "function") {
        void window.setFcmToken(token.value);
      }
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
