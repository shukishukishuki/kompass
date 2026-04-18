import type { Metadata } from "next";
import type { ReactNode } from "react";

interface ResultLayoutProps {
  children: ReactNode;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const typeId = params?.type ?? "claude";

  const TYPE_LABELS: Record<string, string> = {
    claude: "共感ジャンキー",
    chatgpt: "丸投げ屋",
    gemini: "情報スナイパー",
    perplexity: "裏取りマニア",
    copilot: "整理の鬼",
    jiyujin: "AI遊牧民",
  };

  const label = TYPE_LABELS[typeId] ?? "AIタイプ";
  const ogUrl = `https://kompass-rosy.vercel.app/api/og?type=${typeId}&lang=ja`;
  const storyOgUrl = `https://kompass-rosy.vercel.app/api/og/story?type=${typeId}&lang=ja`;

  return {
    title: `私のAIタイプは「${label}」でした`,
    description:
      "あなたのAIタイプも診断してみよう。ChatGPT・Claude・Gemini・Perplexity・Copilotの中から最適な1つが見つかります。",
    openGraph: {
      images: [
        { url: ogUrl, width: 1200, height: 630 },
        { url: storyOgUrl, width: 1080, height: 1920 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `私のAIタイプは「${label}」でした`,
      description: "あなたのAIタイプも診断してみよう。",
      images: [ogUrl],
    },
  };
}

export default function DiagnosisResultLayout({
  children,
}: Readonly<ResultLayoutProps>) {
  return children;
}
