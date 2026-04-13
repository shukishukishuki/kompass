import Image from "next/image";
import Link from "next/link";
import { AI_THEME_COLORS } from "@/types/ai";
import {
  getTypeCircleBackgroundColor,
  hexToRgba,
  TYPE_CHARACTERS,
} from "@/lib/type-characters";

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
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TYPE_CHARACTERS.map((character) => (
            <article
              key={character.typeJa}
              className="rounded-2xl border border-zinc-200 p-5 shadow-sm"
              style={{
                backgroundColor: hexToRgba(AI_THEME_COLORS[character.aiKind], 0.12),
              }}
            >
              <div
                className="mx-auto flex h-[140px] w-[140px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: getTypeCircleBackgroundColor(character.aiKind),
                }}
              >
                <Image
                  src={character.imageSrc}
                  alt={character.characterName}
                  width={120}
                  height={120}
                  className="h-[120px] w-[120px] object-contain"
                />
              </div>
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
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/diagnosis`}
            className="inline-flex rounded-full bg-[#52B788] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </main>
  );
}
