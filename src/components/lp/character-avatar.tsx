"use client";

import { useState } from "react";

interface CharacterAvatarProps {
  src: string;
  alt: string;
  color: string;
}

/**
 * 画像未配置時は色付き円プレースホルダーにフォールバックする
 */
export function CharacterAvatar({
  src,
  alt,
  color,
}: Readonly<CharacterAvatarProps>) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="relative mx-auto h-24 w-24 overflow-hidden rounded-full shadow-sm"
      style={{ backgroundColor: color }}
      aria-label={alt}
    >
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => {
            setHasError(true);
          }}
        />
      ) : null}
    </div>
  );
}
