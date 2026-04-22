import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPersonalityDescription } from "@/lib/personality-descriptions";
import { AI_KIND_TO_GUIDE } from "@/lib/type-id-map";
import { TYPE_CHARACTERS } from "@/lib/type-characters";
import { AI_THEME_COLORS } from "@/types/ai";

const RESULT_PAGE_COPY = {
  ja: {
    ctaTitle: "あなたのタイプを診断してみる",
    ctaSub: "同じタイプかどうか、確かめてみよう",
    ctaButton: "診断してタイプを知る",
    otherTypes: "他のタイプを見る",
    guideLink: (name: string) => `${name}のAI活用ガイドを見る →`,
    shareOnX: "Xでシェアする",
  },
  en: {
    ctaTitle: "Take the diagnosis and see your result",
    ctaSub: "Check whether this type matches you.",
    ctaButton: "Find your type",
    otherTypes: "See other types",
    guideLink: (name: string) => `See ${name} AI guide →`,
    shareOnX: "Share on X",
  },
} as const;

export function generateStaticParams(): { locale: string; typeId: string }[] {
  return ["ja", "en"].flatMap((locale) =>
    TYPE_CHARACTERS.map((character) => ({ locale, typeId: character.typeId }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ typeId: string; locale: string }>;
}): Promise<Metadata> {
  const { typeId, locale } = await params;
  const isEn = locale === "en";
  const character = TYPE_CHARACTERS.find((item) => item.typeId === typeId);
  const personality = character
    ? getPersonalityDescription(character.typeJa, isEn ? "en" : "ja")
    : null;
  const displayName = personality?.characterName ?? character?.characterName;
  const description = personality?.catchCopy ?? character?.oneLiner;
  const ogUrl = `https://kompass-rosy.vercel.app/api/og?type=${typeId}&lang=${isEn ? "en" : "ja"}`;
  return {
    metadataBase: new URL("https://kompass-rosy.vercel.app"),
    title:
      displayName !== undefined
        ? isEn
          ? `${displayName} | AI Type Result`
          : `${displayName}｜AIタイプ診断結果`
        : undefined,
    description,
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
  const isEn = locale === "en";
  const copy = isEn ? RESULT_PAGE_COPY.en : RESULT_PAGE_COPY.ja;
  const character = TYPE_CHARACTERS.find((item) => item.typeId === typeId);
  if (character === undefined) {
    notFound();
  }
  const personality = getPersonalityDescription(character.typeJa, isEn ? "en" : "ja");
  const displayName = personality?.characterName ?? character.characterName;
  const catchCopy = personality?.catchCopy ?? character.oneLiner;

  const color = AI_THEME_COLORS[character.aiKind] ?? "#C9A84C";
  const guideTypeId = AI_KIND_TO_GUIDE[typeId] ?? typeId;
  const shareText = encodeURIComponent(
    isEn
      ? `My AI type is '${displayName}'. What's yours? → https://usekompass.com/en #Kompass`
      : `私のAIタイプは「${displayName}」でした！あなたは何タイプ？ → https://usekompass.com #Kompass`
  );
  const xShareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

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
            {displayName}
          </h1>
          <p className="text-sm text-gray-500">{catchCopy}</p>
        </div>

        <div
          className="space-y-3 rounded-xl p-5 text-center"
          style={{
            backgroundColor: `${color}11`,
            border: `1px solid ${color}33`,
          }}
        >
          <p className="text-sm font-bold text-gray-800">
            {copy.ctaTitle}
          </p>
          <p className="text-xs text-gray-500">
            {copy.ctaSub}
          </p>
          <Link
            href={`/${locale}/diagnosis`}
            className="inline-block rounded-full px-7 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: color }}
          >
            {copy.ctaButton}
          </Link>
        </div>

        <div className="text-center">
          <a
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-600"
          >
            {copy.shareOnX}
          </a>
        </div>

        <div className="text-center">
          <Link
            href={`/${locale}/types`}
            className="text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-600"
          >
            {copy.otherTypes}
          </Link>
        </div>
        <div className="text-center mt-2">
          <a
            href={`/${locale}/guide/${guideTypeId}`}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            {copy.guideLink(displayName)}
          </a>
        </div>
      </div>
    </main>
  );
}
