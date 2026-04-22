import type { Metadata } from "next";
import type { ReactNode } from "react";

interface ResultLayoutProps {
  children: ReactNode;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; typeId?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const typeId = resolvedSearchParams?.typeId ?? resolvedSearchParams?.type ?? "empath";
  const lang = locale === "en" ? "en" : "ja";
  const isEn = lang === "en";

  const TYPE_LABELS: Record<string, string> = {
    empath: isEn ? "The Confidant" : "共感ジャンキー",
    executor: isEn ? "The Executive" : "整理の鬼",
    analyst: isEn ? "The Analyst" : "裏取りマニア",
    generalist: isEn ? "The Generalist" : "丸投げ屋",
    scout: isEn ? "The Scout" : "情報スナイパー",
    orchestrator: isEn ? "The Orchestrator" : "AI遊牧民",
  };

  const label = TYPE_LABELS[typeId] ?? "AIタイプ";
  const ogUrl = `https://kompass-rosy.vercel.app/api/og?type=${typeId}&lang=${lang}`;
  const storyOgUrl = `https://kompass-rosy.vercel.app/api/og/story?type=${typeId}&lang=${lang}`;
  const title = isEn
    ? `My AI type is "${label}"`
    : `私のAIタイプは「${label}」でした`;
  const description = isEn
    ? "Find your AI type and discover how to use AI in a way that fits how you think."
    : "あなたのAIタイプも診断してみよう。ChatGPT・Claude・Gemini・Perplexity・Copilotの中から最適な1つが見つかります。";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        { url: ogUrl, width: 1200, height: 630 },
        { url: storyOgUrl, width: 1080, height: 1920 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default function DiagnosisResultLayout({
  children,
}: Readonly<ResultLayoutProps>) {
  return children;
}
