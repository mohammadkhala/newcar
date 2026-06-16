"use client";

import Image from "next/image";

type Props = {
  imageSrc: string | null;
  label: string;
  size?: number;
};

export function CategoryThumb({ imageSrc, label, size = 44 }: Props) {
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
