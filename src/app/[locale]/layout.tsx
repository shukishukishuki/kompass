import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

/** 静的生成対象のロケール一覧 */
const LOCALES = ["ja", "en"] as const;

/**
 * App Router で [locale] セグメント用の静的パラメータを返す
 */
export function generateStaticParams(): { locale: string }[] {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    openGraph: {
      siteName: "Kompass",
      locale: isEn ? "en_US" : "ja_JP",
    },
  };
}

/**
 * 言語別ルートの共通ラッパー（next-intl 連携は後続で拡張）
 */
export default function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  return (
    <LocaleLayoutBody params={params}>
      {children}
    </LocaleLayoutBody>
  );
}

/**
 * locale を解決して共通レイアウトを描画する
 */
async function LocaleLayoutBody({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  return (
    <div className="min-h-screen">
      <Header locale={locale} />
      <main className="pb-16 md:pb-0">{children}</main>
      <BottomNav locale={locale} />
      <Toaster position="bottom-center" />
    </div>
  );
}
