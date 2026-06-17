"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";

type Props = {
  /** From Laravel `config` via `resolveStoreLogoUrl`, or `/logo.png` fallback. */
  logoSrc: string;
  imageAlt: string;
};

/**
 * Business purpose: home link with the same store logo as the admin / footer, sized for the black Hala-style header.
 */
export function HeaderStoreLogo({ logoSrc, imageAlt }: Props) {
  return (
    <Link
      href="/"
      className="store-header-wordmark group flex min-w-0 max-w-[13rem] shrink-0 flex-col items-center sm:max-w-[15rem] sm:items-start rtl:sm:items-end"
    >
      <Image
        src={logoSrc}
        alt={imageAlt}
        width={120}
        height={130}
        className="h-12 w-auto max-w-full object-contain object-center sm:h-14 lg:h-16"
        unoptimized
        priority
      />
    </Link>
  );
}
