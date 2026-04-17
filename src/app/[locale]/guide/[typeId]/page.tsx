import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OneClickAIButton } from "@/components/diagnosis/OneClickAIButton";
import { PromptList } from "@/components/guide/prompt-list";
import { GUIDE_TO_AI_KIND } from "@/lib/type-id-map";
import { GUIDE_DETAILS } from "@/lib/guide-details";
import {
  getTypeCharacterByTypeId,
  hexToRgba,
  TYPE_CHARACTERS,
  type TypeId,
} from "@/lib/type-characters";
import { AI_THEME_COLORS, type AiKind } from "@/types/ai";

/**
 * guide の静的生成対象パラメータ
 */
export function generateStaticParams(): { typeId: TypeId }[] {
  return Object.keys(GUIDE_DETAILS).map((typeId) => ({
    typeId: typeId as TypeId,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ typeId: string }>;
}) {
  const { typeId } = await params;
  const detail = GUIDE_DETAILS[typeId as keyof typeof GUIDE_DETAILS];
  const character = TYPE_CHARACTERS.find((item) => item.typeId === typeId);
  if (detail === undefined || character === undefined) {
    return {};
  }

  const descriptionSegments = [detail.whenToUse];
  if (Array.isArray(detail.bestFor) && detail.bestFor.length > 0) {
    descriptionSegments.push(`${detail.bestFor.join("・")}に向いています。`);
  }

  return {
    title: `${character.characterName}（${character.aiName}）の使い方ガイド`,
    description: descriptionSegments.join(" "),
  };
}

/**
 * タイプ別のAIガイド詳細ページ
 */
export default async function GuideTypeDetailPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string; typeId: string }>;
}>) {
  const { locale, typeId } = await params;
  const content = GUIDE_DETAILS[typeId as TypeId];
  const character = getTypeCharacterByTypeId(typeId);
  if (content === undefined || character === null) {
    notFound();
  }
  const accentColor = AI_THEME_COLORS[character.aiKind];
  const aiKind = GUIDE_TO_AI_KIND[typeId] ?? typeId;

  return (
    <main className="bg-[#f8f7ff] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href={`/${locale}/guide`}
          className="inline-flex text-sm font-medium text-slate-600 underline underline-offset-2"
        >
          ← AI活用ガイドに戻る
        </Link>

        <section
          className="rounded-3xl border p-6 text-white shadow-sm md:p-10"
          style={{ backgroundColor: accentColor, borderColor: accentColor }}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <Image
              src={character.imageSrc}
              alt={character.characterName}
              width={180}
              height={180}
              className="h-[180px] w-[180px] object-contain"
              priority
            />
            <p className="text-sm uppercase tracking-wide text-white/90">
              {character.typeEn}
            </p>
            <h1 className="text-3xl font-extrabold md:text-4xl">
              {character.characterName}
            </h1>
            <p className="text-3xl font-black leading-tight md:text-5xl">
              {content.oneShotCopy}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">いつ使うか</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {content.whenToUse}
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">何が強いか</h2>
          <ul className="mt-3 space-y-2">
            {content.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="shrink-0 text-blue-400 mt-0.5">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* こんな人に向いている */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-gray-700">こんな人に向いている</h2>
            <ul className="space-y-1.5">
              {content.bestFor.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 text-green-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 具体的な使用例 */}
          <div className="space-y-2 mt-6">
            <h2 className="text-sm font-bold text-gray-700">実際の使い方</h2>
            <ul className="space-y-2">
              {content.useCases.map((item, i) => (
                <li
                  key={i}
                  className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700 leading-relaxed"
                >
                  「{item}」
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="rounded-2xl border p-6 shadow-sm"
          style={{
            backgroundColor: hexToRgba(accentColor, 0.08),
            borderColor: hexToRgba(accentColor, 0.35),
          }}
        >
          <h2 className="text-xl font-bold text-slate-900">プロンプト5個</h2>
          <p className="mt-2 text-sm text-slate-600">
            右のボタンでそのままコピーして使えます。
          </p>
          <div className="space-y-2 mb-2">
            <h2 className="text-sm font-bold text-gray-700">すぐ使えるプロンプト</h2>
            <p className="text-xs text-gray-400">
              コピーしてそのままAIに貼り付けて使えます。診断済みの方はあなた専用プロンプトが結果画面に表示されます。
            </p>
          </div>
          <div className="mt-4">
            <PromptList prompts={content.prompts} />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">NGな使い方</h2>
          <ul className="mt-3 space-y-2">
            {content.ngUsages.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="shrink-0 text-red-400 mt-0.5">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-gray-700">今すぐ使う</h2>
            <OneClickAIButton typeId={aiKind} />
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-6 pb-4">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
            OTHER TYPES
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries({
              empath: "共感ジャンキー",
              generalist: "丸投げ屋",
              scout: "情報スナイパー",
              analyst: "裏取りマニア",
              executive: "整理の鬼",
              orchestrator: "AI遊牧民",
            })
              .filter(([id]) => id !== typeId)
              .map(([id, name]) => (
                <a
                  key={id}
                  href={`/${locale}/guide/${id}`}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {name}
                </a>
              ))}
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-6 py-10">
          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm font-bold text-gray-800">
              自分のタイプを知っていますか？
            </p>
            <p className="text-xs text-gray-500">
              診断するとあなた専用のプロンプトが生成されます
            </p>
            <Link
              href={`/${locale}/diagnosis`}
              className="inline-block rounded-full bg-gray-900 px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-700"
            >
              診断してみる →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
