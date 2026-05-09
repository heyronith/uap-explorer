"use client";

import { useCallback, useState, type ReactNode } from "react";

type BrandImageProps = {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  fallback?: ReactNode;
};

/** Local /public image with graceful fallback if the file is missing. */
export function BrandImage({ src, alt, className, width, height, fallback }: BrandImageProps) {
  const [ok, setOk] = useState(true);
  const onError = useCallback(() => setOk(false), []);

  if (!ok) {
    return fallback ?? null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- public brand assets; no optimization needed
    <img src={src} alt={alt} width={width} height={height} className={className} onError={onError} />
  );
}
