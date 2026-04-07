"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconCart, IconUser } from "@/components/store/header-icons";
import { useCart } from "@/lib/cart-context";
import type { SVGProps } from "react";
import type { ReactNode } from "react";

function IconHome({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconGrid({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function IconCar({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-2.7-.6-3.6-1.9C11.4 6.5 10.8 4 12 4h4" />
      <path d="M5 17h2" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
      <path d="M14 10h2l2 3" />
    </svg>
  );
}

function pathActive(pathname: string, href: string, options?: { prefix?: boolean }): boolean {
  const p = pathname || "/";
  if (href === "/") {
    return p === "/" || p === "";
  }
  if (options?.prefix) {
    return p === href || p.startsWith(`${href}/`);
  }
  return p === href || p.startsWith(`${href}/`);
}

/**
 * Fixed bottom tab bar for small viewports only; keeps primary shop flows one tap away.
 */
export function MobileBottomNav() {
  const t = useTranslations("MobileNav");
  const pathname = usePathname();
  const { lines } = useCart();
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  const accountActive =
    pathActive(pathname, "/account", { prefix: true }) ||
    pathActive(pathname, "/auth/login") ||
    pathActive(pathname, "/auth/register", { prefix: true });

  const cartActive =
    pathActive(pathname, "/shop/cart", { prefix: true }) ||
    pathActive(pathname, "/shop/checkout", { prefix: true });

  const items: {
    href: string;
    label: string;
    icon: ReactNode;
    active: boolean;
    badge?: number;
  }[] = [
    {
      href: "/",
      label: t("home"),
      icon: <IconHome className="h-6 w-6" />,
      active: pathActive(pathname, "/"),
    },
    {
      href: "/shop/categories",
      label: t("categories"),
      icon: <IconGrid className="h-6 w-6" />,
      active: pathActive(pathname, "/shop/categories", { prefix: true }),
    },
    {
      href: "/shop/vehicle",
      label: t("vehicle"),
      icon: <IconCar className="h-6 w-6" />,
      active: pathActive(pathname, "/shop/vehicle", { prefix: true }),
    },
    {
      href: "/shop/cart",
      label: t("cart"),
      icon: <IconCart className="h-6 w-6" />,
      active: cartActive,
      badge: count,
    },
    {
      href: "/account",
      label: t("account"),
      icon: <IconUser className="h-6 w-6" />,
      active: accountActive,
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[280] border-t border-border-soft bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(20,20,20,0.08)] backdrop-blur-md md:hidden"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${
              item.active ? "text-primary" : "text-secondary/75 hover:text-secondary"
            }`}
          >
            <span className="relative inline-flex">
              {item.icon}
              {item.badge != null && item.badge > 0 ? (
                <span className="absolute -top-1.5 -end-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </span>
            <span className="line-clamp-1 max-w-full">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
