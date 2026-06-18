"use client";

import { useState } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  fallbackClassName?: string;
};

export function FallbackImg({ src, className, fallbackClassName, ...props }: Props) {
  const [broken, setBroken] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={broken ? "/logo.png" : src}
      className={broken ? (fallbackClassName ?? `${className ?? ""} object-contain p-4 opacity-60`) : className}
      onError={() => setBroken(true)}
      alt={props.alt ?? ""}
      {...props}
    />
  );
}
