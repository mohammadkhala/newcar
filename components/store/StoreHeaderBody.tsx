"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CartBadge } from "@/components/store/CartBadge";
import { HeaderSearch } from "@/components/store/HeaderSearch";
import { HeaderAccountMenu } from "@/components/store/HeaderAccountMenu";
import { LocaleSwitcher } from "@/components/store/LocaleSwitcher";
import { VehicleFitmentPicker } from "@/components/vehicle/VehicleFitmentPicker";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type {
  CategoryTreeNode,
  LanguageOption,
  VehicleBrandsResponse,
} from "@/lib/types";

export type NavCategoryItem = {
  id: number;
  name: string;
  imageSrc: string | null;
};

type Props = {
  navCategories: NavCategoryItem[];
  featuredNavItems: CategoryTreeNode[];
  languageOptions: LanguageOption[] | null;
  isAuthenticated: boolean;
  vehicleBrands: VehicleBrandsResponse["brands"];
  apiConfigured: boolean;
};

function CategoryThumb({
  imageSrc,
  label,
  size = 44,
}: {
  imageSrc: string | null;
  label: string;
  size?: number;
}) {
  if (imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-md object-cover"
        unoptimized
      />
    );
  }
  const letter = label.slice(0, 1) || "?";
  const small = size <= 32;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md bg-primary/15 font-bold text-primary ${small ? "text-[10px]" : "text-sm"}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {letter}
    </span>
  );
}

function FeaturedPanel({
  node,
  onNavigate,
}: {
  node: CategoryTreeNode;
  onNavigate: () => void;
}) {
  const t = useTranslations("Nav");
  return (
    <div className="max-h-[min(75vh,36rem)] overflow-y-auto p-4">
      <div className="mb-3 border-b border-border-soft pb-3">
        <Link
          href={`/shop/categories/${node.id}`}
          className="text-sm font-bold text-primary hover:underline"
          onClick={onNavigate}
        >
          {t("viewAll")} — {node.name}
        </Link>
      </div>
      {node.children.length === 0 ? (
        <p className="text-sm text-secondary/70">{t("allCategories")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {node.children.map((ch) => (
            <div key={ch.id} className="min-w-0">
              <Link
                href={`/shop/categories/${ch.id}`}
                className="group flex flex-col items-center gap-2 rounded-lg border border-transparent p-2 text-center transition-colors hover:border-primary/20 hover:bg-primary/5"
                onClick={onNavigate}
              >
                <CategoryThumb imageSrc={ch.imageSrc} label={ch.name} size={56} />
                <span className="line-clamp-2 text-xs font-semibold text-secondary group-hover:text-primary">
                  {ch.name}
                </span>
              </Link>
              {ch.children.length > 0 ? (
                <ul className="mt-2 space-y-1 border-t border-border-soft/80 pt-2 text-start">
                  {ch.children.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/shop/categories/${sub.id}`}
                        className="line-clamp-2 text-[11px] text-secondary/90 hover:text-primary hover:underline"
                        onClick={onNavigate}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main header row, mobile drawer, desktop navigation with category mega menu and featured category flyouts.
 */
export function StoreHeaderBody({
  navCategories,
  featuredNavItems,
  languageOptions,
  isAuthenticated,
  vehicleBrands,
  apiConfigured,
}: Props) {
  const t = useTranslations("Nav");
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [openFeaturedId, setOpenFeaturedId] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".desktop-categories-dropdown")) {
        setCategoriesDropdownOpen(false);
      }
      if (!target.closest(".desktop-shop-dropdown")) {
        setShopDropdownOpen(false);
      }
      if (!target.closest(".desktop-featured-nav")) {
        setOpenFeaturedId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeAllDesktop = () => {
    setCategoriesDropdownOpen(false);
    setShopDropdownOpen(false);
    setOpenFeaturedId(null);
  };

  const shopLinks = (
    <ul className="flex flex-col gap-1 py-2 text-sm md:min-w-[220px]">
      <li>
        <Link
          href="/shop/vehicle"
          className="block rounded-md px-3 py-2 text-secondary hover:bg-surface-muted"
          onClick={() => setMenuOpen(false)}
        >
          {t("shopByVehicle")}
        </Link>
      </li>
      <li>
        <Link
          href="/shop/search"
          className="block rounded-md px-3 py-2 text-secondary hover:bg-surface-muted"
          onClick={() => setMenuOpen(false)}
        >
          {t("search")}
        </Link>
      </li>
      <li>
        <Link
          href="/shop/categories"
          className="block rounded-md px-3 py-2 text-secondary hover:bg-surface-muted"
          onClick={() => setMenuOpen(false)}
        >
          {t("categories")}
        </Link>
      </li>
      <li>
        <Link
          href="/shop/brands"
          className="block rounded-md px-3 py-2 text-secondary hover:bg-surface-muted"
          onClick={() => setMenuOpen(false)}
        >
          {t("brands")}
        </Link>
      </li>
    </ul>
  );

  const megaMenu = (
    <div className="grid max-h-[min(75vh,36rem)] grid-cols-2 content-start gap-4 overflow-y-auto p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {navCategories.length === 0 ? (
        <div className="col-span-full py-8 text-center text-secondary/60">
          {t("allCategories")}
        </div>
      ) : (
        navCategories.map((c) => (
          <Link
            key={c.id}
            href={`/shop/categories/${c.id}`}
            className="group flex flex-col items-center gap-3 rounded-xl border border-transparent p-3 text-center transition-all hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm"
            onClick={() => {
              setMenuOpen(false);
              setCategoriesDropdownOpen(false);
            }}
          >
            <CategoryThumb imageSrc={c.imageSrc} label={c.name} size={64} />
            <span className="line-clamp-2 text-sm font-bold text-secondary group-hover:text-primary">
              {c.name}
            </span>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <div className="overflow-visible shadow-md">
      <div className="bg-slate-900 text-white">
        <div className="store-shell py-3 md:py-4">
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex min-h-11 flex-nowrap items-center gap-2">
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-white/20 text-white"
                aria-expanded={menuOpen}
                aria-controls="store-mobile-nav"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span className="sr-only">{t("openMenu")}</span>
                <span aria-hidden className="flex flex-col gap-1">
                  <span className="block h-0.5 w-5 bg-white" />
                  <span className="block h-0.5 w-5 bg-white" />
                  <span className="block h-0.5 w-5 bg-white" />
                </span>
              </button>
              <Link
                href="/"
                className="flex shrink-0 items-center rounded-xl bg-white p-2 shadow-md ring-1 ring-black/5"
              >
                <Image
                  src="/logo.png"
                  alt="NEW CAR"
                  width={150}
                  height={51}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <div className="ms-auto flex min-h-11 shrink-0 items-center gap-1.5">
                <HeaderAccountMenu isAuthenticated={isAuthenticated} />
                <CartBadge variant="dark" />
                <LocaleSwitcher languageOptions={languageOptions} variant="dark" />
              </div>
            </div>
            <div className="w-full min-w-0">
              <HeaderSearch />
            </div>
          </div>

          <div className="hidden md:flex md:flex-nowrap md:items-center md:gap-4">
            <Link
              href="/"
              className="flex shrink-0 items-center rounded-xl bg-white p-2 shadow-md ring-1 ring-black/5"
            >
              <Image
                src="/logo.png"
                alt="NEW CAR"
                width={150}
                height={51}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <div className="flex min-w-0 flex-1 justify-center px-3">
              <HeaderSearch />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <HeaderAccountMenu isAuthenticated={isAuthenticated} />
              <CartBadge variant="dark" />
              <LocaleSwitcher languageOptions={languageOptions} variant="dark" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[200] border-b border-border-soft bg-white">
        <div className="store-shell flex flex-wrap items-center justify-between gap-2 py-2 md:flex-nowrap md:gap-4">
          <div className="order-1 flex shrink-0 items-center gap-2">
            <div className="hidden md:block desktop-categories-dropdown">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriesDropdownOpen(!categoriesDropdownOpen);
                    setShopDropdownOpen(false);
                    setOpenFeaturedId(null);
                  }}
                  className={`inline-flex min-h-[2.75rem] max-w-[min(100vw-2rem,16rem)] items-center gap-3 truncate rounded-lg px-4 text-sm font-bold text-white shadow-sm outline-none ring-primary/40 transition-all focus-visible:ring-2 sm:max-w-none ${
                    categoriesDropdownOpen
                      ? "bg-primary-strong ring-2"
                      : "bg-primary hover:bg-primary-strong"
                  }`}
                >
                  <span className="shrink-0 text-lg" aria-hidden>
                    ☰
                  </span>
                  <span className="truncate">{t("allPartsByCategory")}</span>
                </button>
                {categoriesDropdownOpen ? (
                  <div className="absolute start-0 top-full z-[120] pt-2">
                    <div className="w-[min(95vw,60rem)] overflow-hidden rounded-2xl border border-border-soft bg-white shadow-2xl">
                      {megaMenu}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-surface-muted px-3 text-sm font-bold text-secondary outline-none ring-black/40 hover:bg-surface-muted/80 focus-visible:ring-2 md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span aria-hidden>☰</span>
              <span className="max-w-[10rem] truncate">{t("allPartsByCategory")}</span>
            </button>
          </div>

          <nav
            className="order-3 hidden min-h-10 min-w-0 flex-1 md:order-2 md:flex md:items-center md:justify-center"
            aria-label={t("secondaryNav")}
          >
            <ul className="flex max-w-full flex-wrap items-center justify-center gap-1 px-1 py-1">
              <li className="relative shrink-0 desktop-shop-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setShopDropdownOpen(!shopDropdownOpen);
                    setCategoriesDropdownOpen(false);
                    setOpenFeaturedId(null);
                  }}
                  className={`inline-flex min-h-[2.5rem] whitespace-nowrap rounded-lg px-3 text-sm font-bold outline-none ring-primary/40 transition-colors focus-visible:ring-2 ${
                    shopDropdownOpen
                      ? "bg-surface-muted text-primary ring-2"
                      : "text-secondary hover:bg-surface-muted hover:text-primary"
                  }`}
                >
                  {t("shopByVehicle")}
                </button>
                {shopDropdownOpen ? (
                  <div
                    className="absolute start-0 top-full z-[120] pt-2"
                    role="region"
                    aria-label={t("shopByVehicle")}
                  >
                    <div className="max-h-[min(80vh,28rem)] w-[min(92vw,22rem)] overflow-y-auto rounded-xl border border-border-soft bg-white py-3 shadow-2xl">
                      {shopLinks}
                      {apiConfigured && vehicleBrands.length > 0 ? (
                        <div className="border-t border-border-soft px-3 pt-3">
                          <VehicleFitmentPicker
                            brands={vehicleBrands}
                            apiConfigured={apiConfigured}
                            onSearch={() => {
                              setShopDropdownOpen(false);
                              closeAllDesktop();
                            }}
                          />
                          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-secondary/60">
                            {t("brands")}
                          </p>
                          <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-sm">
                            {vehicleBrands.slice(0, 20).map((b) => {
                              const src = resolveMediaUrl(
                                b.image_full_url ?? b.image ?? null,
                                { defaultFolder: "vehicle-brand" },
                              );
                              return (
                                <li key={b.id}>
                                  <Link
                                    href={`/shop/search?vehicle_brand_id=${b.id}&offset=1`}
                                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-secondary hover:bg-surface-muted"
                                    onClick={() => setShopDropdownOpen(false)}
                                  >
                                    {src ? (
                                      <Image
                                        src={src}
                                        alt=""
                                        width={28}
                                        height={28}
                                        className="h-7 w-7 shrink-0 rounded-full object-cover"
                                        unoptimized
                                      />
                                    ) : (
                                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                        {b.name.slice(0, 1)}
                                      </span>
                                    )}
                                    <span className="truncate">{b.name}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </li>

              {featuredNavItems.map((node) => (
                <li key={node.id} className="relative shrink-0 desktop-featured-nav">
                  <button
                    type="button"
                    onClick={() => {
                      const next = openFeaturedId === node.id ? null : node.id;
                      setOpenFeaturedId(next);
                      setCategoriesDropdownOpen(false);
                      setShopDropdownOpen(false);
                    }}
                    className={`inline-flex min-h-[2.5rem] max-w-[10rem] truncate rounded-lg px-3 text-sm font-bold outline-none ring-primary/40 transition-colors focus-visible:ring-2 sm:max-w-[14rem] ${
                      openFeaturedId === node.id
                        ? "bg-surface-muted text-primary ring-2"
                        : "text-secondary hover:bg-surface-muted hover:text-primary"
                    }`}
                  >
                    {node.name}
                  </button>
                  {openFeaturedId === node.id ? (
                    <div className="absolute start-0 top-full z-[120] pt-2">
                      <div className="w-[min(95vw,48rem)] overflow-hidden rounded-2xl border border-border-soft bg-white shadow-2xl">
                        <FeaturedPanel
                          node={node}
                          onNavigate={() => {
                            setOpenFeaturedId(null);
                            closeAllDesktop();
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[400] md:hidden"
          id="store-mobile-nav"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={t("closeMenu")}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute start-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-xl"
            dir="auto"
          >
            <div className="flex items-center justify-between border-b border-surface-muted px-4 py-3">
              <span className="text-sm font-semibold text-secondary">
                {t("allPartsByCategory")}
              </span>
              <button
                type="button"
                className="rounded-lg px-3 py-1 text-sm font-medium text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {t("closeMenu")}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <HeaderSearch />
              <div className="mt-3 flex items-center justify-end gap-2">
                <LocaleSwitcher languageOptions={languageOptions} variant="light" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary/70">
                {t("shopByVehicle")}
              </p>
              {shopLinks}
              {apiConfigured && vehicleBrands.length > 0 ? (
                <div className="mt-4 border-t border-surface-muted pt-4">
                  <VehicleFitmentPicker
                    brands={vehicleBrands}
                    apiConfigured={apiConfigured}
                    onSearch={() => setMenuOpen(false)}
                  />
                </div>
              ) : null}
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary/70">
                {t("shopMenu")}
              </p>
              {megaMenu}
              {featuredNavItems.length > 0 ? (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary/70">
                    {t("categoriesMenu")}
                  </p>
                  <ul className="mt-2 space-y-3 text-sm">
                    {featuredNavItems.map((node) => (
                      <li key={node.id}>
                        <Link
                          href={`/shop/categories/${node.id}`}
                          className="font-bold text-secondary hover:text-primary"
                          onClick={() => setMenuOpen(false)}
                        >
                          {node.name}
                        </Link>
                        {node.children.length > 0 ? (
                          <ul className="ms-2 mt-1 space-y-1 border-s border-border-soft ps-2">
                            {node.children.map((ch) => (
                              <li key={ch.id}>
                                <Link
                                  href={`/shop/categories/${ch.id}`}
                                  className="text-secondary/90 hover:text-primary"
                                  onClick={() => setMenuOpen(false)}
                                >
                                  {ch.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
