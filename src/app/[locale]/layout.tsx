import type { ReactNode } from "react";

/** 静的生成対象のロケール一覧 */
const LOCALES = ["ja", "en"] as const;

/**
 * App Router で [locale] セグメント用の静的パラメータを返す
 */
export function generateStaticParams(): { locale: string }[] {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * 言語別ルートの共通ラッパー（next-intl 連携は後続で拡張）
 */
export default function LocaleLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
