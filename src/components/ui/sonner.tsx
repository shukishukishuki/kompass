"use client";

import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

/**
 * アプリ共通のトースト表示コンポーネント
 */
export function Toaster(props: Readonly<ToasterProps>) {
  return (
    <Sonner
      toastOptions={{
        style: {
          border: "1px solid #e4e4e7",
        },
      }}
      {...props}
    />
  );
}
