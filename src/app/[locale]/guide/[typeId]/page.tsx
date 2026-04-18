"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DIAGNOSIS_RESULT_STORAGE_KEY } from "@/app/[locale]/diagnosis/page";
import { OneClickAIButton } from "@/components/diagnosis/OneClickAIButton";
import { PromptList } from "@/components/guide/prompt-list";
import { GUIDE_DETAILS } from "@/lib/guide-details";
import { AI_KIND_TO_PERSONALITY_JA } from "@/lib/mbti-correction";
import { AI_KIND_TO_GUIDE, GUIDE_TO_AI_KIND } from "@/lib/type-id-map";
import { getTypeCharacterByTypeId, hexToRgba, type TypeId } from "@/lib/type-characters";
import { AI_THEME_COLORS, type AiKind } from "@/types/ai";

type StoredDiagnosisResult = {
  type?: string;
};

const OTHER_TYPES: Record<TypeId, string> = {
  empath: "共感ジャンキー",
  generalist: "丸投げ屋",
  scout: "情報スナイパー",
  analyst: "裏取りマニア",
  executive: "整理の鬼",
  orchestrator: "AI遊牧民",
};

const JA_LABEL_TO_GUIDE_TYPE: Record<string, TypeId> = (
  Object.entries(OTHER_TYPES) as [TypeId, string][]
).reduce<Record<string, TypeId>>((acc, [id, ja]) => {
  acc[ja] = id;
  return acc;
}, {});

/** 診断 API の type（例: 相談相手タイプ）→ ガイド slug */
const PERSONALITY_JA_TO_GUIDE_TYPE: Record<string, TypeId> = {
  [AI_KIND_TO_PERSONALITY_JA.claude]: "empath",
  [AI_KIND_TO_PERSONALITY_JA.chatgpt]: "generalist",
  [AI_KIND_TO_PERSONALITY_JA.gemini]: "scout",
  [AI_KIND_TO_PERSONALITY_JA.perplexity]: "analyst",
  [AI_KIND_TO_PERSONALITY_JA.copilot]: "executive",
  [AI_KIND_TO_PERSONALITY_JA.jiyujin]: "orchestrator",
};

/**
 * sessionStorage の診断結果から、ユーザーのガイド typeId を取り出す
 *（type が AI 種別キー・キャラ名日本語・診断タイプ日本語のいずれでも解決）
 */
function resolveUserTypeIdFromStorage(raw: string | null): TypeId | null {
  if (raw === null || raw === "") {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as StoredDiagnosisResult;
    if (typeof parsed.type !== "string") {
      return null;
    }
    const t = parsed.type;
    const fromAiKind = AI_KIND_TO_GUIDE[t];
    if (fromAiKind !== undefined && fromAiKind in GUIDE_DETAILS) {
      return fromAiKind as TypeId;
    }
    const fromCharJa = JA_LABEL_TO_GUIDE_TYPE[t];
    if (fromCharJa !== undefined) {
      return fromCharJa;
    }
    const fromPersonalityJa = PERSONALITY_JA_TO_GUIDE_TYPE[t];
    if (fromPersonalityJa !== undefined) {
      return fromPersonalityJa;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * タイプ別のAIガイド詳細ページ
 */
export default function GuideTypeDetailPage() {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "ja";
  const rawTypeId = typeof params?.typeId === "string" ? params.typeId : "";
  const typeId = rawTypeId as TypeId;

  const [userTypeId, setUserTypeId] = useState<TypeId | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(DIAGNOSIS_RESULT_STORAGE_KEY);
    setUserTypeId(resolveUserTypeIdFromStorage(stored));
  }, []);

  const content = GUIDE_DETAILS[typeId];
  const character = getTypeCharacterByTypeId(typeId);

  const aiKind = useMemo(() => {
    const guideMapped = GUIDE_TO_AI_KIND[typeId];
    return (guideMapped ?? typeId) as AiKind;
  }, [typeId]);

  if (content === undefined || character === null) {
    return (
      <main className="bg-[#f8f7ff] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-600">指定されたガイドが見つかりませんでした。</p>
          <Link
            href={`/${locale}/guide`}
            className="mt-4 inline-flex text-sm font-medium text-slate-700 underline underline-offset-2"
          >
            AI活用ガイドに戻る
          </Link>
        </div>
      </main>
    );
  }

  const accentColor = AI_THEME_COLORS[character.aiKind];
  const previewLocked = userTypeId === null || typeId !== userTypeId;

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
          <div className="flex flex-col items-center gap-4 overflow-visible text-center">
            <Image
              src={character.imageSrc}
              alt={character.characterName}
              width={252}
              height={252}
              className="h-[252px] w-[252px] max-w-full object-contain"
              priority
            />
            <p className="text-sm uppercase tracking-wide text-white/90">{character.typeEn}</p>
            <h1 className="text-3xl font-extrabold md:text-4xl">{character.characterName}</h1>
            <p className="text-3xl font-black leading-tight md:text-5xl">{content.oneShotCopy}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">いつ使うか</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{content.whenToUse}</p>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">何が強いか</h2>
          <ul className="mt-3 space-y-2">
            {content.strengths.map((item, i) => (
              <li key={i} className="mt-0.5 flex items-start gap-2 text-sm text-gray-600">
                <span className="shrink-0 text-blue-400">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
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

          <div className="mt-6 space-y-2">
            <h2 className="text-sm font-bold text-gray-700">実際の使い方</h2>
            <ul className="space-y-2">
              {content.useCases.map((item, i) => (
                <li
                  key={i}
                  className="rounded-lg bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700"
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
          <h2 className="text-xl font-bold text-slate-900">
            自分の性格に合った使い方をAIに指示する
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            右のボタンでそのままコピーして使えます。
          </p>
          <div className="mb-2 mt-3 space-y-2">
            <h3 className="text-sm font-bold text-gray-700">すぐ使えるプロンプト</h3>
            <p className="text-xs text-gray-400">
              コピーしてそのままAIに貼り付けて使えます。診断済みの方はあなた専用プロンプトが結果画面に表示されます。
            </p>
          </div>
          <div className="relative mt-4">
            <PromptList
              prompts={content.prompts}
              previewLocked={previewLocked}
              previewOverlay={
                <>
                  <p
                    className="max-w-sm px-2 text-center text-slate-700"
                    style={{ fontSize: 14, textAlign: "center" }}
                  >
                    診断すると、あなた専用のプロンプトが解放されます
                  </p>
                  <Link
                    href={`/${locale}/diagnosis`}
                    className="font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      background: "#1a7a4a",
                      color: "white",
                      padding: "12px 24px",
                      borderRadius: 10,
                    }}
                  >
                    診断してプロンプトを解放する →
                  </Link>
                </>
              }
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">NGな使い方</h2>
          <div className="relative mt-3">
            <ul
              className="space-y-2"
              style={
                previewLocked
                  ? {
                      filter: "blur(6px)",
                      pointerEvents: "none",
                      userSelect: "none",
                    }
                  : undefined
              }
            >
              {content.ngUsages.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 shrink-0 text-red-400">✕</span>
                  {item}
                </li>
              ))}
            </ul>
            {previewLocked ? (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.6)" }}
              >
                <Link
                  href={`/${locale}/diagnosis`}
                  className="inline-block rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-700"
                >
                  診断してプロンプトを解放する →
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <OneClickAIButton
              typeId={aiKind}
              accentColor={character.theme.primary}
              actionLabelColor={character.theme.cText}
            />
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-6 pb-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            OTHER TYPES
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(OTHER_TYPES) as TypeId[])
              .filter((id) => id !== typeId)
              .map((id) => (
                <a
                  key={id}
                  href={`/${locale}/guide/${id}`}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
                >
                  {OTHER_TYPES[id]}
                </a>
              ))}
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-6 py-10">
          <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm font-bold text-gray-800">自分のタイプを知っていますか？</p>
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
