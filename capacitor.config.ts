import type { CapacitorConfig } from '@capacitor/cli';

const PRODUCTION_URL = 'https://newcarpal.com';

const config: CapacitorConfig = {
  appId: 'com.newcarpal.app',
  appName: 'نيو كار - New Car',
  webDir: 'out',
  /** Load live storefront in WebView (emulator/device). Use local dev URL only when debugging Next.js. */
  server: {
    url: PRODUCTION_URL,
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
