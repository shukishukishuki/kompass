import Image from "next/image";
import Link from "next/link";
import { AI_THEME_COLORS } from "@/types/ai";
import { hexToRgba, TYPE_CHARACTERS } from "@/lib/type-characters";

export async function generateMetadata() {
  return {
    title: "AIタイプ一覧",
    description:
      "共感ジャンキー・丸投げ屋・情報スナイパー・裏取りマニア・整理の鬼・AI遊牧民。6つのAIタイプの特徴を解説。",
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
    subtitle: "キャラクターから、あなたに合う使い方を見つけよう。",
    aiLabel: "対応AI",
    cta: "診断ページへ",
  },
  en: {
    title: "6 AI Thinking Types",
    subtitle: "Find your best usage style through each character.",
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
          あなたはどのタイプ？タップして詳しい使い方を見る。
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TYPE_CHARACTERS.map((character) => (
            <Link
              key={character.typeId}
              href={`/${locale}/guide/${character.typeId}`}
              className="block transition-opacity hover:opacity-90"
            >
              <article
                className="rounded-2xl border border-zinc-200 p-5 shadow-sm"
                style={{
                  backgroundColor: hexToRgba(AI_THEME_COLORS[character.aiKind], 0.12),
                }}
              >
                <Image
                  src={character.imageSrc}
                  alt={character.characterName}
                  width={160}
                  height={160}
                  className="mx-auto h-[160px] w-[160px] object-contain"
                />
                <p className="mt-4 text-lg font-bold text-slate-900">
                  {character.characterName}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {character.typeEn}
                </p>
                <p className="mt-3 text-sm text-slate-700">{character.oneLiner}</p>
                <p className="mt-4 rounded-lg bg-white/75 px-3 py-2 text-sm font-medium text-slate-800">
                  {copy.aiLabel}: {character.aiName}
                </p>
              </article>
            </Link>
          ))}
        </div>
        <div className="mt-10 space-y-2 text-center">
          <p className="text-sm text-gray-500">自分がどのタイプか気になったら</p>
          <Link
            href={`/${locale}/diagnosis`}
            className="inline-block rounded-full bg-gray-900 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            診断してタイプを知る →
          </Link>
        </div>
      </div>
    </main>
  );
}
