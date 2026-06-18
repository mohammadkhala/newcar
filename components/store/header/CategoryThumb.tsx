"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  imageSrc: string | null;
  label: string;
  size?: number;
};

export function CategoryThumb({ imageSrc, label, size = 44 }: Props) {
  const [broken, setBroken] = useState(false);

  const showFallback = !imageSrc || broken;

  if (!showFallback) {
    return (
      <Image
        src={imageSrc!}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-md object-cover"
        unoptimized
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-md bg-white p-1"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain opacity-60"
        unoptimized
      />
    </span>
  );
}
