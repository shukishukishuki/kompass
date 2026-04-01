"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  DIAGNOSIS_RESULT_STORAGE_KEY,
  DIAGNOSIS_RESUME_FROM_LAYER_KEY,
  DIAGNOSIS_SCORING_STORAGE_KEY,
} from "@/app/[locale]/diagnosis/page";
import {
  getAiLabelJaForKind,
  getThemeColorForBaseAiName,
} from "@/lib/ai-display";
import {
  AI_KIND_TO_PERSONALITY_EN,
  AI_KIND_TO_PERSONALITY_JA,
  applyMBTICorrection,
  detectResultChange,
  getMBTICompatibilityComment,
  normalizeMBTI,
} from "@/lib/mbti-correction";
import { getPersonalityDescription } from "@/lib/personality-descriptions";
import { buildScoringResultFromAggregatedScores } from "@/lib/scoringEngine";
import { getDiagnosisStats, type DiagnosisTypeStats } from "@/lib/supabase";
import enMessages from "@/messages/en.json";
import jaMessages from "@/messages/ja.json";
import type { DiagnosisResult } from "@/types/diagnosis";
import type { DiagnosisResultPageCopy } from "@/types/diagnosis-messages";
import type { MessagesFile } from "@/types/diagnosis-messages";
import { AI_KINDS, type AiKind } from "@/types/ai";
import type { ScoringResult } from "@/types/scoring";

const messagesByLocale: Record<string, MessagesFile> = {
  ja: jaMessages as MessagesFile,
  en: enMessages as MessagesFile,
};

/** resultPage 未定義時のフォールバック（ja） */
const FALLBACK_RESULT_COPY: DiagnosisResultPageCopy = {
  statsAggregating: "集計中",
  statsPercentTemplate: "全診断ユーザーの {percent}% がこのタイプ",
  rarityOften: "よく見るタイプ",
  rarityGeneral: "一般的なタイプ",
  rarityUnusual: "少し珍しいタイプ",
  rarityRare: "レアタイプ",
};

/** MBTI 適用後の表示用スナップショット */
interface MbtiAppliedView {
  changeMessage: string;
  compatibilityComment: string;
  /** 補正後の診断タイプ（日本語） */
  correctedPersonalityJa: string;
  correctedTypeEn: string;
  /** 補正後のメイン推奨AIの表示名 */
  displayPrimaryLabel: string;
}

/**
 * sessionStorage のスコアリング結果が利用可能か
 */
function isScoringSnapshot(value: unknown): value is ScoringResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  if (o.userLayer !== "general" && o.userLayer !== "advanced") {
    return false;
  }
  const scores = o.scoresByAi;
  if (typeof scores !== "object" || scores === null) {
    return false;
  }
  const sb = scores as Record<string, unknown>;
  for (const k of AI_KINDS) {
    if (typeof sb[k] !== "number" || Number.isNaN(sb[k])) {
      return false;
    }
  }
  if (!isAiKindString(o.first) || !isAiKindString(o.displayPrimaryAi)) {
    return false;
  }
  if (o.layerCompleted !== 1 && o.layerCompleted !== 2 && o.layerCompleted !== 3) {
    return false;
  }
  return true;
}

function isAiKindString(v: unknown): v is AiKind {
  return typeof v === "string" && (AI_KINDS as readonly string[]).includes(v);
}

/**
 * sessionStorage の JSON が DiagnosisResult として扱えるか検証する
 */
function isDiagnosisResult(value: unknown): value is DiagnosisResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  if (typeof o.type !== "string" || typeof o.typeEn !== "string") {
    return false;
  }
  if (typeof o.scoreDiff !== "number" || Number.isNaN(o.scoreDiff)) {
    return false;
  }
  if (
    o.displayMode !== "definitive" &&
    o.displayMode !== "borderline" &&
    o.displayMode !== "mixed"
  ) {
    return false;
  }
  if (typeof o.expertView !== "string") {
    return false;
  }
  if (o.layerCompleted !== 1 && o.layerCompleted !== 2 && o.layerCompleted !== 3) {
    return false;
  }
  const base = o.baseAI;
  const sub = o.subAI;
  if (typeof base !== "object" || base === null) {
    return false;
  }
  if (!Array.isArray(sub)) {
    return false;
  }
  const b = base as Record<string, unknown>;
  for (const item of sub) {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const e = item as Record<string, unknown>;
    if (typeof e.name !== "string" || typeof e.usage !== "string") {
      return false;
    }
  }
  if (
    typeof b.name !== "string" ||
    typeof b.score !== "number" ||
    typeof b.reason !== "string" ||
    typeof b.setup !== "string"
  ) {
    return false;
  }
  if ("note" in b && b.note !== undefined && typeof b.note !== "string") {
    return false;
  }
  if (
    "userPercentage" in o &&
    o.userPercentage !== undefined &&
    (typeof o.userPercentage !== "number" || Number.isNaN(o.userPercentage))
  ) {
    return false;
  }
  if (
    "rarityLabel" in o &&
    o.rarityLabel !== undefined &&
    typeof o.rarityLabel !== "string"
  ) {
    return false;
  }
  if (
    "personalityDescription" in o &&
    o.personalityDescription !== undefined
  ) {
    const pd = o.personalityDescription;
    if (typeof pd !== "object" || pd === null) {
      return false;
    }
    const p = pd as Record<string, unknown>;
    if (
      typeof p.catchCopy !== "string" ||
      typeof p.supplement !== "string" ||
      typeof p.contraryCopy !== "string" ||
      typeof p.shareText !== "string" ||
      typeof p.ngUsage !== "string" ||
      typeof p.literacyAnalysis !== "string"
    ) {
      return false;
    }
    if (!Array.isArray(p.strengths) || !Array.isArray(p.weaknesses)) {
      return false;
    }
    if (
      !p.strengths.every((t) => typeof t === "string") ||
      !p.weaknesses.every((t) => typeof t === "string")
    ) {
      return false;
    }
    const opposite = p.oppositeType;
    if (typeof opposite !== "object" || opposite === null) {
      return false;
    }
    const o2 = opposite as Record<string, unknown>;
    if (
      typeof o2.typeJa !== "string" ||
      typeof o2.aiName !== "string" ||
      typeof o2.description !== "string"
    ) {
      return false;
    }
  }
  return true;
}

/**
 * 上級者層っぽい結果か（サブAIや expertView が埋まっている場合）
 */
function isAdvancedPresentation(result: DiagnosisResult): boolean {
  return (
    result.expertView.trim().length > 0 ||
    result.subAI.some((s) => s.name.trim().length > 0)
  );
}

/**
 * X シェア用のテキストを生成する
 */
function buildShareText(result: DiagnosisResult): string {
  return `私は${result.type}(${result.typeEn})でした！あなたのベースAIは？ #Kompass`;
}

/**
 * タイプ別件数マップの合計件数
 */
function sumTypeStats(stats: DiagnosisTypeStats): number {
  let n = 0;
  for (const v of Object.values(stats)) {
    n += v;
  }
  return n;
}

/**
 * 割合（0–100、整数）とレア度ラベルを求める
 */
function resolvePercentAndRarity(
  stats: DiagnosisTypeStats | null,
  typeJa: string,
  resultCopy: DiagnosisResultPageCopy
): {
  line: string;
  badge: string | null;
} {
  if (stats === null) {
    return { line: resultCopy.statsAggregating, badge: null };
  }
  const total = sumTypeStats(stats);
  if (total === 0) {
    return { line: resultCopy.statsAggregating, badge: null };
  }
  const count = stats[typeJa] ?? 0;
  const percent = Math.round((count / total) * 100);
  const badge = rarityLabelForPercent(percent, resultCopy);
  const line = resultCopy.statsPercentTemplate.replace(
    "{percent}",
    String(percent)
  );
  return { line, badge };
}

/**
 * 割合からレア度バッジ文言を返す
 */
function rarityLabelForPercent(
  percent: number,
  copy: DiagnosisResultPageCopy
): string {
  if (percent >= 20) {
    return copy.rarityOften;
  }
  if (percent >= 10) {
    return copy.rarityGeneral;
  }
  if (percent >= 5) {
    return copy.rarityUnusual;
  }
  return copy.rarityRare;
}

/**
 * 診断結果の表示ページ
 */
export default function DiagnosisResultPage() {
  const params = useParams();
  const router = useRouter();
  const locale =
    typeof params?.locale === "string" && params.locale.length > 0
      ? params.locale
      : "ja";

  const copy = messagesByLocale[locale] ?? messagesByLocale.ja;
  const resultPageCopy =
    copy.diagnosis.resultPage ?? FALLBACK_RESULT_COPY;

  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  /** null = 未取得、取得後はオブジェクト（空もあり得る） */
  const [typeStats, setTypeStats] = useState<DiagnosisTypeStats | null>(null);
  const [scoringSnapshot, setScoringSnapshot] = useState<ScoringResult | null>(
    null
  );
  const [mbtiInput, setMbtiInput] = useState("");
  const [mbtiFieldError, setMbtiFieldError] = useState<string | null>(null);
  const [mbtiApplied, setMbtiApplied] = useState<MbtiAppliedView | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(DIAGNOSIS_RESULT_STORAGE_KEY);
    if (raw === null || raw === "") {
      router.replace(`/${locale}/diagnosis`);
      return;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isDiagnosisResult(parsed)) {
        router.replace(`/${locale}/diagnosis`);
        return;
      }
      setResult(parsed);

      const scoringRaw = sessionStorage.getItem(DIAGNOSIS_SCORING_STORAGE_KEY);
      if (scoringRaw !== null && scoringRaw !== "") {
        try {
          const sp: unknown = JSON.parse(scoringRaw);
          if (isScoringSnapshot(sp)) {
            setScoringSnapshot(sp);
          }
        } catch {
          // スコアが無い場合は MBTI 補正のみ無効
        }
      }
    } catch {
      router.replace(`/${locale}/diagnosis`);
      return;
    }
    setHydrated(true);
  }, [locale, router]);

  useEffect(() => {
    if (result === null) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const stats = await getDiagnosisStats();
        if (!cancelled) {
          setTypeStats(stats);
        }
      } catch {
        if (!cancelled) {
          setTypeStats({});
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [result]);

  const displayPersonalityJa = useMemo(() => {
    if (result === null) {
      return "";
    }
    return mbtiApplied?.correctedPersonalityJa ?? result.type;
  }, [result, mbtiApplied]);

  const personalityBlock = useMemo(() => {
    if (result === null) {
      return null;
    }
    return getPersonalityDescription(displayPersonalityJa, locale);
  }, [result, locale, displayPersonalityJa]);

  const statsDisplay = useMemo(() => {
    if (result === null) {
      return {
        line: resultPageCopy.statsAggregating,
        badge: null as string | null,
      };
    }
    const typeKey = mbtiApplied?.correctedPersonalityJa ?? result.type;
    return resolvePercentAndRarity(typeStats, typeKey, resultPageCopy);
  }, [result, typeStats, resultPageCopy, mbtiApplied]);

  const headerBg = useMemo(() => {
    if (result === null) {
      return "#52525b";
    }
    const name =
      mbtiApplied?.displayPrimaryLabel ?? result.baseAI.name;
    return getThemeColorForBaseAiName(name);
  }, [result, mbtiApplied]);

  const handleMbtiApply = useCallback(() => {
    if (result === null) {
      return;
    }
    const normalized = normalizeMBTI(mbtiInput);
    if (normalized === null) {
      setMbtiFieldError(
        "有効なMBTIタイプを入力してください（例：INFJ）"
      );
      return;
    }
    if (scoringSnapshot === null) {
      setMbtiFieldError(
        "スコア情報がありません。もう一度診断してください。"
      );
      return;
    }

    const correctedScores = applyMBTICorrection(
      scoringSnapshot.scoresByAi,
      normalized
    );
    const newSr = buildScoringResultFromAggregatedScores(
      correctedScores,
      scoringSnapshot.userLayer
    );

    const afterPersonalityJa = AI_KIND_TO_PERSONALITY_JA[newSr.first];
    const changeMessage = detectResultChange(result.type, afterPersonalityJa);
    const compatibilityComment = getMBTICompatibilityComment(
      normalized,
      newSr.displayPrimaryAi
    );

    setMbtiFieldError(null);
    setMbtiApplied({
      changeMessage,
      compatibilityComment,
      correctedPersonalityJa: afterPersonalityJa,
      correctedTypeEn: AI_KIND_TO_PERSONALITY_EN[newSr.first],
      displayPrimaryLabel: getAiLabelJaForKind(newSr.displayPrimaryAi),
    });
  }, [mbtiInput, result, scoringSnapshot]);

  const shareHref = useMemo(() => {
    if (result === null) {
      return "";
    }
    const text = buildShareText(result);
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  }, [result]);

  const continueLabel = useMemo(() => {
    if (result === null) {
      return null;
    }
    if (result.layerCompleted === 1) {
      return "続きを診断する（残り20問）";
    }
    if (result.layerCompleted === 2) {
      return "続きを診断する（残り10問）";
    }
    return null;
  }, [result]);

  if (!hydrated || result === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-sm text-zinc-500">読み込み中…</p>
      </main>
    );
  }

  const advanced = isAdvancedPresentation(result);

  return (
    <main className="min-h-screen pb-16">
      <header
        className="px-4 pb-10 pt-14 text-center text-white shadow-lg"
        style={{ backgroundColor: headerBg }}
      >
        <p className="text-sm font-medium uppercase tracking-wide opacity-90">
          {mbtiApplied?.correctedTypeEn ?? result.typeEn}
        </p>
        <h1 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
          {mbtiApplied?.correctedPersonalityJa ?? result.type}
        </h1>
        <p className="mt-6 text-xl font-semibold md:text-2xl">
          {mbtiApplied?.displayPrimaryLabel ?? result.baseAI.name}
        </p>
        {result.baseAI.note !== undefined &&
        result.baseAI.note.trim() !== "" ? (
          <p className="mx-auto mt-3 max-w-md text-left text-sm leading-relaxed opacity-90">
            {result.baseAI.note}
          </p>
        ) : null}
        <p className="mx-auto mt-6 max-w-md text-left text-sm leading-relaxed opacity-95">
          {result.baseAI.reason}
        </p>
      </header>

      <div className="mx-auto flex max-w-lg flex-col items-center gap-8 px-4 pt-10 text-center">
        {personalityBlock !== null ? (
          <section
            className="w-full text-left text-zinc-800"
            aria-labelledby="personality-heading"
          >
            <h2 id="personality-heading" className="sr-only">
              性格特性
            </h2>
            <p className="text-4xl font-extrabold leading-tight tracking-tight">
              {personalityBlock.catchCopy}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-700">
              {personalityBlock.supplement}
            </p>
            <blockquote className="mt-4 border-l-4 border-zinc-300 pl-3 text-sm italic text-zinc-700">
              {personalityBlock.contraryCopy}
            </blockquote>
            <p className="mt-5 text-sm font-semibold text-zinc-900">強み</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-left text-sm leading-relaxed text-zinc-700">
              {personalityBlock.strengths.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-semibold text-zinc-900">弱み</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-left text-sm leading-relaxed text-zinc-700">
              {personalityBlock.weaknesses.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {result.layerCompleted === 1 ? (
              <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">
                  真逆のAIタイプ
                </p>
                <p className="mt-2 text-sm text-zinc-700">
                  {personalityBlock.oppositeType.typeJa}（
                  {personalityBlock.oppositeType.aiName}）
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                  {personalityBlock.oppositeType.description}
                </p>
              </div>
            ) : null}
            {result.layerCompleted >= 2 ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-sm font-semibold text-zinc-900">
                    NGな使い方
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                    {personalityBlock.ngUsage}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-sm font-semibold text-zinc-900">
                    AIリテラシー分析
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                    {personalityBlock.literacyAnalysis}
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-5 text-left"
          aria-labelledby="stats-heading"
        >
          <h2 id="stats-heading" className="sr-only">
            タイプの割合
          </h2>
          <p className="text-sm font-medium text-zinc-800">{statsDisplay.line}</p>
          {statsDisplay.badge !== null ? (
            <p className="mt-3 inline-block rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-800">
              {statsDisplay.badge}
            </p>
          ) : null}
        </section>

        <section
          className="w-full text-left text-sm leading-relaxed text-zinc-700"
          aria-labelledby="layer-heading"
        >
          <h2 id="layer-heading" className="sr-only">
            次の一歩
          </h2>
          {advanced ? (
            <div className="space-y-4">
              {result.subAI.map((entry, idx) => (
                <div key={`sub-${idx}-${entry.name}`} className="space-y-2">
                  <p>
                    <span className="font-semibold text-zinc-900">
                      サブAI（補助）
                    </span>
                    ：{entry.name}
                  </p>
                  {entry.usage !== "" ? <p>{entry.usage}</p> : null}
                </div>
              ))}
              {result.expertView !== "" ? (
                <p className="border-l-4 border-zinc-300 pl-3">
                  {result.expertView}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="font-medium text-zinc-900">まずこれだけでOK</p>
              <p>{result.baseAI.setup}</p>
            </div>
          )}
        </section>

        {personalityBlock !== null && result.layerCompleted === 1 ? (
          <p className="w-full text-left text-xs text-zinc-500">
            {personalityBlock.shareText}
          </p>
        ) : null}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={shareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Xでシェア
          </a>
          <Link
            href={`/${locale}/diagnosis`}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
          >
            もう一度診断する
          </Link>
        </div>
        {continueLabel !== null ? (
          <button
            type="button"
            onClick={() => {
              const v = result.layerCompleted;
              if (v === 1 || v === 2) {
                sessionStorage.setItem(
                  DIAGNOSIS_RESUME_FROM_LAYER_KEY,
                  String(v)
                );
              }
              router.push(`/${locale}/diagnosis`);
            }}
            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-900 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
          >
            {continueLabel}
          </button>
        ) : null}

        <section
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-5 text-left shadow-sm"
          aria-labelledby="mbti-heading"
        >
          <h2
            id="mbti-heading"
            className="text-sm font-semibold text-zinc-900"
          >
            MBTIを入力すると精度が上がります（任意）
          </h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block flex-1 text-left">
              <span className="sr-only">MBTI 4文字</span>
              <input
                type="text"
                name="mbti"
                maxLength={4}
                autoCapitalize="characters"
                autoComplete="off"
                value={mbtiInput}
                onChange={(e) => {
                  const v = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .slice(0, 4);
                  setMbtiInput(v);
                  setMbtiFieldError(null);
                  setMbtiApplied(null);
                }}
                placeholder="例: INFJ"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium tracking-widest text-zinc-900 placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </label>
            <button
              type="button"
              onClick={() => handleMbtiApply()}
              disabled={scoringSnapshot === null}
              className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              適用する
            </button>
          </div>
          {mbtiFieldError !== null ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {mbtiFieldError}
            </p>
          ) : null}
          {scoringSnapshot === null ? (
            <p className="mt-2 text-xs text-zinc-500">
              スコア情報がないため MBTI 補正は使えません。最新の診断フローでもう一度お試しください。
            </p>
          ) : null}
          {mbtiApplied !== null ? (
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-800">
              <p>{mbtiApplied.changeMessage}</p>
              <p className="text-zinc-700">{mbtiApplied.compatibilityComment}</p>
            </div>
          ) : null}
          <p className="mt-4 text-xs text-zinc-500">
            <a
              href="https://www.16personalities.com/ja"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
            >
              MBTIって何？
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
