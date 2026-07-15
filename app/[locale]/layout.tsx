import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Cairo, Noto_Sans_Hebrew, Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GuestInitializer } from "@/components/store/GuestInitializer";
import { FooterTopPromoStrip } from "@/components/store/FooterTopPromoStrip";
import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { FloatingWhatsApp } from "@/components/store/FloatingWhatsApp";
import { MobileBottomNav } from "@/components/store/MobileBottomNav";
import { NavigationProgress } from "@/components/store/NavigationProgress";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { fetchConfig } from "@/lib/api";
import { routing } from "@/i18n/routing";

const fontAr = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-ar",
  weight: ["400", "500", "600", "700"],
});

const fontEn = Inter({
  subsets: ["latin"],
  variable: "--font-en",
});

const fontHe = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-he",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const PWA_THEME_COLOR = "#F15A24";

/**
 * Mobile browser chrome and notch handling; pairs with manifest `theme_color` and safe-area CSS.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: PWA_THEME_COLOR,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const metadataBase =
    siteUrl && /^https?:\/\//i.test(siteUrl) ? new URL(siteUrl) : undefined;

  return {
    ...(metadataBase ? { metadataBase } : {}),
    title: t("homeTitle"),
    description: t("homeDescription"),
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: t("pwaShortTitle"),
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    alternates: {
      languages: {
        ar: "/ar",
        en: "/en",
        he: "/he",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "ar" || locale === "he" ? "rtl" : "ltr";

  let whatsappNumber = "";
  try {
    const config = await fetchConfig();
    // In Laravel backend, whatsapp config returns { status: 1|0, number: "..." }
    if (
      config?.whatsapp &&
      typeof config.whatsapp === "object" &&
      (config.whatsapp as Record<string, unknown>).status === 1 &&
      typeof (config.whatsapp as Record<string, unknown>).number === "string"
    ) {
      whatsappNumber = (config.whatsapp as Record<string, unknown>).number as string;
    } else if (typeof config?.whatsapp === "string") {
      whatsappNumber = config.whatsapp;
    }
  } catch {
    // Ignore fetch error, just don't show the button
  }

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontAr.variable} ${fontEn.variable} ${fontHe.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-white text-secondary" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <WishlistProvider>
              <GuestInitializer />
              <NavigationProgress />
              <StoreHeader />
              <main className="relative z-0 flex-1 overflow-x-clip px-0 py-0 max-md:pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]">
                {children}
              </main>
              <FooterTopPromoStrip />
              <StoreFooter />
              <MobileBottomNav />
              <FloatingWhatsApp whatsapp={whatsappNumber} />
              <Toaster position="bottom-center" toastOptions={{ style: { direction: dir } }} />
            </WishlistProvider>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
