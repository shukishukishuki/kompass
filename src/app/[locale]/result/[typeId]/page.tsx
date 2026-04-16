import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AI_KIND_TO_GUIDE } from "@/lib/type-id-map";
import { TYPE_CHARACTERS } from "@/lib/type-characters";
import { AI_THEME_COLORS } from "@/types/ai";

export function generateStaticParams(): { typeId: string }[] {
  return TYPE_CHARACTERS.map((character) => ({ typeId: character.typeId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ typeId: string; locale: string }>;
}): Promise<Metadata> {
  const { typeId } = await params;
  const character = TYPE_CHARACTERS.find((item) => item.typeId === typeId);
  const ogUrl = `https://kompass-rosy.vercel.app/api/og?type=${typeId}&lang=ja`;
  return {
    metadataBase: new URL("https://kompass-rosy.vercel.app"),
    title:
      character !== undefined
        ? `${character.characterName}｜AIタイプ診断結果`
        : undefined,
    description: character?.oneLiner,
    openGraph: {
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogUrl],
    },
  };
}

export default async function TypeResultPage({
  params,
}: {
  params: Promise<{ typeId: string; locale: string }>;
}) {
  const { typeId, locale } = await params;
  const character = TYPE_CHARACTERS.find((item) => item.typeId === typeId);
  if (character === undefined) {
    notFound();
  }

  const color = AI_THEME_COLORS[character.aiKind] ?? "#7C3AED";
  const guideTypeId = AI_KIND_TO_GUIDE[typeId] ?? typeId;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-md space-y-6 px-6 py-12">
        <div className="space-y-3 text-center">
          <div
            className="mx-auto flex h-32 w-32 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}22` }}
          >
            <Image
              src={character.imageSrc}
              alt={character.characterName}
              width={112}
              height={112}
              className="object-contain"
            />
          </div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color }}>
            {character.typeEn}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {character.characterName}
          </h1>
          <p className="text-sm text-gray-500">{character.oneLiner}</p>
        </div>

        <div
          className="space-y-3 rounded-xl p-5 text-center"
          style={{
            backgroundColor: `${color}11`,
            border: `1px solid ${color}33`,
          }}
        >
          <p className="text-sm font-bold text-gray-800">
            あなたのタイプを診断してみる
          </p>
          <p className="text-xs text-gray-500">
            同じタイプかどうか、確かめてみよう
          </p>
          <Link
            href={`/${locale}/diagnosis`}
            className="inline-block rounded-full px-7 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: color }}
          >
            無料で診断する →
          </Link>
        </div>

        <div className="text-center">
          <Link
            href={`/${locale}/types`}
            className="text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-600"
          >
            他のタイプを見る
          </Link>
        </div>
        <div className="text-center mt-2">
          <a
            href={`/${locale}/guide/${guideTypeId}`}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            {character.characterName}のAI活用ガイドを見る →
          </a>
        </div>
      </div>
    </main>
  );
}
