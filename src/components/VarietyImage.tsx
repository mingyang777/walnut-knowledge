"use client";

import Image from "next/image";

interface VarietyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
}

/** 本地上传图走 /api/media，需 unoptimized */
export default function VarietyImage({
  src,
  alt,
  fill,
  className,
  style,
  priority,
  sizes,
}: VarietyImageProps) {
  const isLocalUpload = src.startsWith("/api/media/");

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      style={style}
      priority={priority}
      sizes={sizes}
      unoptimized={isLocalUpload}
    />
  );
}
