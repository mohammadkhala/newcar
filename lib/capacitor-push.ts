import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export async function setupCapacitorPushNotifications() {
  if (typeof window === 'undefined') return;

  console.log("Checking if running in Capacitor...");
  
  if (!Capacitor.isNativePlatform()) {
    console.log("Not running on a native platform, skipping push notifications setup.");
    return;
  }

  console.log("Initializing Capacitor Push Notifications...");

  try {
    // Attach listeners before register() so we don't miss fast registration callbacks.
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);

      if (typeof (window as any).setFcmToken === 'function') {
        (window as any).setFcmToken(token.value);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Add a listener for when the app is in the foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received in foreground: ' + JSON.stringify(notification));
      // Show an alert or custom UI if you want to notify the user while they are using the app
      // Capacitor push notifications by default won't show the system banner if the app is in the foreground
      alert(notification.title + "\n" + notification.body);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));

      // Extract URL from the notification payload
      const data = notification.notification.data;
      if (data && data.url) {
        console.log("Redirecting to URL from notification:", data.url);
        // Using Next.js router would be better, but window.location works as a fallback
        // Since we're in a global context, we'll use window.location
        window.location.href = data.url;
      }
    });

    console.log("Requesting push notification permissions...");
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    const permStatus = await PushNotifications.requestPermissions();
    console.log("Push permission status: " + JSON.stringify(permStatus));

    if (permStatus.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
    } else {
      console.warn("User denied push notification permissions");
    }

  } catch (error) {
    console.error("Error setting up push notifications:", error);
  }
}
