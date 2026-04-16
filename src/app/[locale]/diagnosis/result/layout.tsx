import type { Metadata } from "next";
import type { ReactNode } from "react";

interface ResultLayoutProps {
  children: ReactNode;
}

interface MetadataParams {
  searchParams: Promise<{ type?: string }>;
}

/**
 * 結果ページ専用のOGPメタデータ
 */
export async function generateMetadata({
  searchParams,
}: MetadataParams): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const typeId = resolvedSearchParams?.type ?? "claude";
  const ogUrl = `https://kompass-rosy.vercel.app/api/og?type=${typeId}&lang=ja`;

  return {
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogUrl],
    },
  };
}

export default function DiagnosisResultLayout({
  children,
}: Readonly<ResultLayoutProps>) {
  return children;
}
