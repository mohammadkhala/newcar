"use client";

import { useEffect } from "react";
import { CartBadge } from "@/components/store/CartBadge";
import { HeaderStoreLogo } from "@/components/store/HeaderStoreLogo";
import { HeaderSearch } from "@/components/store/HeaderSearch";
import { HeaderAccountMenu } from "@/components/store/HeaderAccountMenu";
import { LocaleSwitcher } from "@/components/store/LocaleSwitcher";
import { useFcmTokenListener } from "@/hooks/use-fcm-token-listener";
import { setupCapacitorPushNotifications } from "@/lib/capacitor-push";
import type { LanguageOption } from "@/lib/types";

export type { NavCategoryItem } from "@/components/store/header/types";

type Props = {
  languageOptions: LanguageOption[] | null;
  isAuthenticated: boolean;
  storeLogoSrc: string;
  storeLogoAlt: string;
};

/**
 * Top locale bar + logo/search/cart row. The orange categories nav lives in its own
 * sticky sibling (StoreHeaderCategoriesBar) so it isn't trapped inside this ~216px-tall
 * block's containing box — see that component's docstring for why.
 */
export function StoreHeaderBody({
  languageOptions,
  isAuthenticated,
  storeLogoSrc,
  storeLogoAlt,
}: Props) {
  useFcmTokenListener(isAuthenticated);

  useEffect(() => {
    // Capacitor push: native only; setupCapacitorPushNotifications no-ops on web
    void setupCapacitorPushNotifications();
  }, []);

  return (
    <div className="page-header store-header-newcar overflow-visible shadow-md">
      <div id="header-top" className="header-top border-b border-white/10 bg-black">
        <div className="store-shell flex min-h-8 items-center justify-start py-0.5 md:min-h-9 md:py-1.5">
          <LocaleSwitcher languageOptions={languageOptions} variant="newcarTop" />
        </div>
      </div>

      <div id="header-middle" className="header-middle bg-black">
        <div className="store-shell header-panel-container py-3 md:py-4">
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex min-h-11 flex-nowrap items-center justify-between gap-2">
              <div className="min-w-0 shrink-0 self-center">
                <HeaderStoreLogo logoSrc={storeLogoSrc} imageAlt={storeLogoAlt} />
              </div>
              <div className="flex min-h-11 shrink-0 items-center gap-1 sm:gap-2">
                <HeaderAccountMenu
                  isAuthenticated={isAuthenticated}
                  variant="newcar"
                  compact
                />
                <CartBadge variant="newcar" compact />
              </div>
            </div>
            <div className="w-full min-w-0">
              <HeaderSearch variant="newcar" />
            </div>
          </div>

          <div className="hidden md:flex md:min-h-[5rem] md:flex-row md:flex-nowrap md:items-center md:gap-4 lg:gap-6">
            <div className="flex shrink-0 items-center justify-start min-w-[8rem] lg:min-w-[12rem]">
              <HeaderStoreLogo logoSrc={storeLogoSrc} imageAlt={storeLogoAlt} />
            </div>
            <div className="min-w-0 flex-1">
              <HeaderSearch variant="newcar" />
            </div>
            <div className="flex shrink-0 items-center justify-end gap-3 min-w-[8rem] lg:min-w-[12rem]">
              <HeaderAccountMenu
                isAuthenticated={isAuthenticated}
                variant="newcar"
              />
              <CartBadge variant="newcar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
