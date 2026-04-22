import Image from "next/image";
import Link from "next/link";
import { AI_THEME_COLORS } from "@/types/ai";
import { hexToRgba, TYPE_CHARACTERS } from "@/lib/type-characters";
import { getPersonalityDescription } from "@/lib/personality-descriptions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale === "en") {
    return {
      title: "6 AI Thinking Types",
      description: "Find the AI type that matches how you think.",
    };
  }
  return {
    title: "AIタイプ一覧",
    description:
      "共感ジャンキー・丸投げ屋・情報スナイパー・裏取りマニア・整理の鬼・AI遊牧民。あなたはどのAIタイプ？診断して自分のタイプを見つけよう。",
  };
}

interface TypesPageCopy {
  title: string;
  subtitle: string;
  aiLabel: string;
  cta: string;
}

const COPY_BY_LOCALE: Record<"ja" | "en", TypesPageCopy> = {
  ja: {
    title: "6つのAI思考タイプ",
    subtitle: "あなたの思考スタイルに合うAIタイプを見つけよう",
    aiLabel: "対応AI",
    cta: "診断ページへ",
  },
  en: {
    title: "6 AI Thinking Types",
    subtitle: "Find the AI type that matches how you think.",
    aiLabel: "Recommended AI",
    cta: "Go to Diagnosis",
  },
};

/**
 * タイプ一覧ページ
 */
export default async function TypesPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const lc = locale === "en" ? "en" : "ja";
  const copy = COPY_BY_LOCALE[lc];

  return (
    <main className="bg-[#f8f7ff] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-3xl font-bold text-slate-900 md:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-3 text-center text-sm text-slate-600 md:text-base">
          {copy.subtitle}
        </p>
        <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
          {lc === "en"
            ? "Which type are you? Tap to see how to use each one."
            : "あなたはどのタイプ？タップして詳しい使い方を見る。"}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TYPE_CHARACTERS.map((character) => {
            const color = AI_THEME_COLORS[character.aiKind];
            const personalityDescription = getPersonalityDescription(
              character.typeJa,
              lc
            );
            const displayName = personalityDescription?.characterName ?? character.characterName;
            const catchCopy = personalityDescription?.catchCopy ?? character.oneLiner;
            return (
              <Link
                key={character.typeId}
                href={`/${locale}/guide/${character.typeId}`}
                className="block transition-opacity hover:opacity-90"
              >
                <article
                  className="overflow-visible rounded-2xl border border-zinc-200 p-5 shadow-sm"
                  style={{
                    backgroundColor: hexToRgba(color, 0.12),
                    borderLeft: `4px solid ${color}`,
                  }}
                >
                  <Image
                    src={character.imageSrc}
                    alt={displayName}
                    width={220}
                    height={220}
                    className="mx-auto h-[220px] w-[220px] max-w-full object-contain"
                  />
                  <p className="mt-4 text-lg font-bold text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {character.typeEn}
                  </p>
                  <p className="mt-3 text-sm text-slate-700">{catchCopy}</p>
                  <p className="mt-4 rounded-lg bg-white/75 px-3 py-2 text-sm font-medium text-slate-800">
                    {copy.aiLabel}: {character.aiName}
                  </p>
                </article>
              </Link>
            );
          })}
        </div>
        <div className="mt-10 space-y-2 text-center">
          <p className="text-sm text-gray-500">
            {lc === "en" ? "Want to find your type?" : "自分がどのタイプか気になったら"}
          </p>
          <Link
            href={`/${locale}/diagnosis`}
            className="inline-block rounded-full bg-gray-900 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            {lc === "en" ? "Take diagnosis →" : "診断してタイプを知る →"}
          </Link>
        </div>
      </div>
    </main>
  );
}
