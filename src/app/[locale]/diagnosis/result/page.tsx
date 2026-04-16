"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DIAGNOSIS_RESULT_STORAGE_KEY,
  DIAGNOSIS_SCORING_STORAGE_KEY,
} from "@/app/[locale]/diagnosis/page";
import {
  getAiLabelJaForKind,
} from "@/lib/ai-display";
import { AFFILIATE_LINKS } from "@/lib/affiliate-links";
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
import {
  hexToRgba,
  resolveTypeCharacter,
  TYPE_CHARACTERS,
} from "@/lib/type-characters";
import {
  getDiagnosisStats,
  saveUserFollowupEmail,
  type DiagnosisTypeStats,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";
import enMessages from "@/messages/en.json";
import jaMessages from "@/messages/ja.json";
import type { DiagnosisResult } from "@/types/diagnosis";
import type { DiagnosisResultPageCopy } from "@/types/diagnosis-messages";
import type { MessagesFile } from "@/types/diagnosis-messages";
import { AI_KINDS, AI_THEME_COLORS, type AiKind } from "@/types/ai";
import type { ScoringResult } from "@/types/scoring";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { OneClickAIButton } from "@/components/diagnosis/OneClickAIButton";
import { AxisGraph } from "@/components/diagnosis/AxisGraph";
import { PersonalizedPrompts } from "@/components/diagnosis/PersonalizedPrompts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const messagesByLocale: Record<string, MessagesFile> = {
  ja: jaMessages as MessagesFile,
  en: enMessages as MessagesFile,
};

const TYPE_COMPATIBILITY: Record<string, { good: string; bad: string }> = {
  claude: { good: "perplexity", bad: "chatgpt" },
  chatgpt: { good: "copilot", bad: "claude" },
  gemini: { good: "perplexity", bad: "copilot" },
  perplexity: { good: "claude", bad: "chatgpt" },
  copilot: { good: "chatgpt", bad: "jiyujin" },
  jiyujin: { good: "gemini", bad: "copilot" },
};

const TYPE_FAMOUS: Record<string, { names: string[]; reason: string }> = {
  claude: {
    names: ["村上春樹", "糸井重里", "ほぼ日刊イトイ新聞"],
    reason: "感情と言語を丁寧に扱う思考スタイル",
  },
  chatgpt: {
    names: ["堀江貴文", "イーロン・マスク", "孫正義"],
    reason: "速度と結果を最優先する実行型",
  },
  gemini: {
    names: ["池上彰", "佐々木俊尚", "ニュースピックス"],
    reason: "情報収集と発信を軸にした知識探求型",
  },
  perplexity: {
    names: ["成田悠輔", "ひろゆき", "養老孟司"],
    reason: "根拠と論理を徹底的に追求する分析型",
  },
  copilot: {
    names: ["トヨタ生産方式", "無印良品", "山本五十六"],
    reason: "構造化・整理・実行を得意とする管理型",
  },
  jiyujin: {
    names: ["千利休", "スティーブ・ジョブズ", "岡本太郎"],
    reason: "既存の枠にとらわれない独自路線型",
  },
};

/** resultPage 未定義時のフォールバック（ja） */
const FALLBACK_RESULT_COPY: DiagnosisResultPageCopy = {
  statsAggregating: "集計中",
  statsPercentTemplate: "全診断ユーザーの {percent}% がこのタイプ",
  rarityOften: "よく見るタイプ",
  rarityGeneral: "一般的なタイプ",
  rarityUnusual: "少し珍しいタイプ",
  rarityRare: "レアタイプ",
  screenshotTagline: "",
  shareOnX: "Xでシェア",
  redoDiagnosis: "もう一度診断する",
  recommendedAi: "おすすめAI",
  detailTitle: "もうちょい深く",
  strengths: "強み",
  weaknesses: "弱み",
  contraryTitle: "逆張りコピー",
  oppositeTitle: "真逆のAIタイプ",
  ngTitle: "NGな使い方",
  literacyTitle: "AIリテラシー分析",
  statsTitle: "タイプの割合",
  nextStepTitle: "次の一歩",
  subAiLabel: "サブAI（補助）",
  mbtiCardTitle: "MBTIを入力すると精度が上がります（任意）",
  mbtiApply: "適用する",
  mbtiPlaceholder: "例: INFJ",
  mbtiInvalid: "有効なMBTIタイプを入力してください（例：INFJ）",
  mbtiNoScores: "スコア情報がありません。もう一度診断してください。",
  mbtiNoScoresHint:
    "スコア情報がないため MBTI 補正は使えません。最新の診断フローでもう一度お試しください。",
  mbtiWhatLink: "MBTIって何？",
  continueLayer1: "続きを診断する（残り20問）",
  continueLayer2: "続きを診断する（残り10問）",
  continueLayer3: "続きを診断する（残り10問）",
  setupOkTitle: "まずこれだけでOK",
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
  if (
    o.layerCompleted !== 1 &&
    o.layerCompleted !== 2 &&
    o.layerCompleted !== 3 &&
    o.layerCompleted !== 4
  ) {
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
  if (
    o.layerCompleted !== 1 &&
    o.layerCompleted !== 2 &&
    o.layerCompleted !== 3 &&
    o.layerCompleted !== 4
  ) {
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
      typeof p.characterName !== "string" ||
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
  if ("answers" in o && o.answers !== undefined) {
    const answers = o.answers;
    if (typeof answers !== "object" || answers === null) {
      return false;
    }
    const entries = Object.entries(answers as Record<string, unknown>);
    if (!entries.every(([k, v]) => typeof k === "string" && typeof v === "string")) {
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
function buildShareText(typeJa: string): string {
  return `私のAIタイプは「${typeJa}」でした！ #Kompass #AI診断`;
}

/**
 * メール形式として最低限妥当かを判定する
 */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
 * 左右2軸のスコアから左側(0-100)を算出する
 */
function resolveLeftPercent(leftScore: number, rightScore: number): number {
  const total = leftScore + rightScore;
  if (total <= 0) {
    return 50;
  }
  return Math.max(0, Math.min(100, (leftScore / total) * 100));
}

/**
 * AIスコアを4軸表示向けに変換する
 */
function buildAxisScoresFromAiScores(scoresByAi: Record<AiKind, number>): {
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
}[] {
  const empathy = scoresByAi.claude * 1.0 + scoresByAi.jiyujin * 0.4;
  const solution =
    scoresByAi.chatgpt * 1.0 +
    scoresByAi.copilot * 1.0 +
    scoresByAi.gemini * 0.6 +
    scoresByAi.perplexity * 0.4;

  const speed =
    scoresByAi.chatgpt * 1.0 +
    scoresByAi.gemini * 1.0 +
    scoresByAi.copilot * 0.8 +
    scoresByAi.jiyujin * 0.3;
  const accuracy =
    scoresByAi.perplexity * 1.0 +
    scoresByAi.copilot * 0.8 +
    scoresByAi.claude * 0.5 +
    scoresByAi.gemini * 0.4;

  const intuition =
    scoresByAi.claude * 1.0 +
    scoresByAi.chatgpt * 0.6 +
    scoresByAi.jiyujin * 0.5;
  const evidence =
    scoresByAi.perplexity * 1.0 +
    scoresByAi.gemini * 0.7 +
    scoresByAi.copilot * 0.6;

  const companion =
    scoresByAi.claude * 1.0 +
    scoresByAi.chatgpt * 0.4 +
    scoresByAi.jiyujin * 0.7;
  const tool =
    scoresByAi.copilot * 1.0 +
    scoresByAi.perplexity * 0.7 +
    scoresByAi.gemini * 0.6 +
    scoresByAi.chatgpt * 0.3;

  return [
    {
      leftLabel: "共感",
      rightLabel: "解決",
      leftValue: resolveLeftPercent(empathy, solution),
    },
    {
      leftLabel: "スピード",
      rightLabel: "精度",
      leftValue: resolveLeftPercent(speed, accuracy),
    },
    {
      leftLabel: "直感",
      rightLabel: "根拠",
      leftValue: resolveLeftPercent(intuition, evidence),
    },
    {
      leftLabel: "相棒",
      rightLabel: "道具",
      leftValue: resolveLeftPercent(companion, tool),
    },
  ];
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
  const [isDiagnosed, setIsDiagnosed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  /** null = 未取得、取得後はオブジェクト（空もあり得る） */
  const [typeStats, setTypeStats] = useState<DiagnosisTypeStats | null>(null);
  const [scoringSnapshot, setScoringSnapshot] = useState<ScoringResult | null>(
    null
  );
  const [mbtiInput, setMbtiInput] = useState("");
  const [mbtiFieldError, setMbtiFieldError] = useState<string | null>(null);
  const [mbtiApplied, setMbtiApplied] = useState<MbtiAppliedView | null>(null);
  const [mbtiAppliedScores, setMbtiAppliedScores] = useState<
    Record<AiKind, number> | null
  >(null);
  const [followupEmail, setFollowupEmail] = useState("");
  const [followupStatus, setFollowupStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [followupError, setFollowupError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(DIAGNOSIS_RESULT_STORAGE_KEY);
    if (raw === null || raw === "") {
      setResult(null);
      setIsDiagnosed(false);
      setHydrated(true);
      return;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isDiagnosisResult(parsed)) {
        setResult(null);
        setIsDiagnosed(false);
        setHydrated(true);
        return;
      }
      setResult(parsed);
      setIsDiagnosed(true);

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
      setResult(null);
      setIsDiagnosed(false);
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

  /** タイプ割合バー用（0–100）。集計できないときは null */
  const userTypePercent = useMemo(() => {
    if (result === null || typeStats === null) {
      return null;
    }
    const total = sumTypeStats(typeStats);
    if (total === 0) {
      return null;
    }
    const typeKey = mbtiApplied?.correctedPersonalityJa ?? result.type;
    const count = typeStats[typeKey] ?? 0;
    return Math.round((count / total) * 100);
  }, [result, typeStats, mbtiApplied]);

  const displayPrimaryAiName = useMemo(() => {
    if (result === null) {
      return "";
    }
    return mbtiApplied?.displayPrimaryLabel ?? result.baseAI.name;
  }, [result, mbtiApplied]);

  const resolvedTypeCharacter = useMemo(() => {
    if (result === null) {
      return resolveTypeCharacter("万能助手タイプ", "ChatGPT");
    }
    return resolveTypeCharacter(displayPersonalityJa, displayPrimaryAiName);
  }, [result, displayPersonalityJa, displayPrimaryAiName]);

  const axisScores = useMemo(() => {
    const baseScores = mbtiAppliedScores ?? scoringSnapshot?.scoresByAi ?? null;
    if (baseScores === null) {
      // スコアがない場合はデフォルト値で表示（グラフを常に表示する）
      return [
        { leftLabel: "共感", rightLabel: "解決", leftValue: 50 },
        { leftLabel: "スピード", rightLabel: "精度", leftValue: 50 },
        { leftLabel: "直感", rightLabel: "根拠", leftValue: 50 },
        { leftLabel: "相棒", rightLabel: "道具", leftValue: 50 },
      ];
    }
    return buildAxisScoresFromAiScores(baseScores);
  }, [mbtiAppliedScores, scoringSnapshot]);

  const layer4Answers = useMemo(() => {
    if (result === null) {
      return {};
    }
    return result.answers ?? {};
  }, [result]);

  const resultHeroBackground = useMemo(() => {
    return AI_THEME_COLORS[resolvedTypeCharacter.aiKind];
  }, [resolvedTypeCharacter.aiKind]);

  const handleMbtiApply = useCallback(() => {
    if (result === null) {
      return;
    }
    const normalized = normalizeMBTI(mbtiInput);
    if (normalized === null) {
      setMbtiFieldError(resultPageCopy.mbtiInvalid);
      return;
    }
    if (scoringSnapshot === null) {
      setMbtiFieldError(resultPageCopy.mbtiNoScores);
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
    setMbtiAppliedScores(correctedScores);
    setMbtiApplied({
      changeMessage,
      compatibilityComment,
      correctedPersonalityJa: afterPersonalityJa,
      correctedTypeEn: AI_KIND_TO_PERSONALITY_EN[newSr.first],
      displayPrimaryLabel: getAiLabelJaForKind(newSr.displayPrimaryAi),
    });
  }, [mbtiInput, result, scoringSnapshot, resultPageCopy]);

  const shareText = encodeURIComponent(
    `私のAIタイプは「${resolvedTypeCharacter.characterName}」でした！\n\nあなたのベースAIは何？ #Kompass #AI診断`
  );
  const shareUrl = encodeURIComponent(
    `https://kompass-rosy.vercel.app/${locale}/result/${resolvedTypeCharacter.typeId ?? resolvedTypeCharacter.aiKind}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;

  const remainingQuestions = result
    ? result.layerCompleted === 1
      ? 30
      : result.layerCompleted === 2
        ? 20
        : result.layerCompleted === 3
          ? 10
          : 0
    : 0;

  const handleFollowupSubmit = useCallback(async () => {
    if (result === null) {
      return;
    }
    const email = followupEmail.trim();
    if (!isValidEmail(email)) {
      setFollowupError("有効なメールアドレスを入力してください。");
      setFollowupStatus("error");
      return;
    }
    setFollowupStatus("saving");
    setFollowupError(null);
    const saved = await saveUserFollowupEmail(email, displayPersonalityJa);
    if (saved) {
      setFollowupStatus("saved");
      setFollowupEmail("");
      return;
    }
    setFollowupStatus("error");
    setFollowupError("現在は登録できません。時間をおいて再度お試しください。");
  }, [result, followupEmail, displayPersonalityJa]);

  if (!hydrated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">{copy.diagnosis.loadingLabel}</p>
      </main>
    );
  }

  if (result === null) {
    const link = AFFILIATE_LINKS[resolvedTypeCharacter.aiKind];
    return (
      <main className="min-h-screen pb-16">
        <section
          className="px-4 pb-12 pt-12 text-center text-white shadow-lg"
          style={{ backgroundColor: resultHeroBackground }}
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">
              {resolvedTypeCharacter.typeEn}
            </p>
            <div className="mt-4 flex justify-center">
              <Image
                src={resolvedTypeCharacter.imageSrc}
                alt="診断前キャラクターのプレビュー"
                width={280}
                height={280}
                className="h-[280px] w-[280px] object-contain"
                priority
              />
            </div>
            <h1
              id="hero-heading"
              className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl"
            >
              診断であなたのタイプを表示
            </h1>
          </div>
          <div className="relative mx-auto mt-6 max-w-md">
            <div className={!isDiagnosed ? "blur-sm pointer-events-none select-none" : ""}>
              <div className="mx-auto mt-6 max-w-md">
                <OneClickAIButton typeId={resolvedTypeCharacter.aiKind} />
              </div>
              {link !== undefined ? (
                <div className="mx-auto mt-3 max-w-md text-center">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 underline underline-offset-4 transition-colors hover:text-gray-600"
                  >
                    {link.label} →
                  </a>
                </div>
              ) : null}
            </div>
            {!isDiagnosed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <p className="px-4 text-center text-sm font-medium text-white">
                  診断を完了するとプロンプトが解放されます
                </p>
                <Link
                  href={`/${locale}/diagnosis`}
                  className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-700"
                >
                  診断する →
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  const advanced = isAdvancedPresentation(result);
  const heroCharacterName =
    personalityBlock?.characterName ?? displayPersonalityJa;

  return (
    <main className="min-h-screen pb-16">
      {/* 上部ゾーン（スクショ用）：キャラ名・コピー・固定文・推奨AI・シェア */}
      <section
        className="px-4 pb-12 pt-12 text-center text-white shadow-lg"
        style={{ backgroundColor: resultHeroBackground }}
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-wide opacity-90">
            {mbtiApplied?.correctedTypeEn ?? result.typeEn}
          </p>
          <p className="text-center text-xs text-gray-400 mb-4">
            診断完了 ✦ あなたのAIタイプが決まりました
          </p>
          <div
            className="mx-auto w-full max-w-md rounded-2xl p-8 text-center"
            style={{ backgroundColor: `${AI_THEME_COLORS[resolvedTypeCharacter.aiKind]}15` }}
          >
            <div className="mt-4 flex justify-center">
              <Image
                src={resolvedTypeCharacter.imageSrc}
                alt={`${heroCharacterName} のキャラクター`}
                width={280}
                height={280}
                className="h-[280px] w-[280px] object-contain"
                priority
              />
            </div>
            <h1
              id="hero-heading"
              className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl"
            >
              {heroCharacterName}
            </h1>
            <p className="mt-2 text-sm uppercase tracking-wide text-white/90 md:text-base">
              {resolvedTypeCharacter.typeEn}
            </p>
          </div>
        </div>
        <div className="relative">
          <div className={!isDiagnosed ? "blur-sm pointer-events-none select-none" : ""}>
            <div className="mx-auto mt-6 max-w-md">
              <OneClickAIButton typeId={resolvedTypeCharacter.aiKind} />
            </div>
          </div>
          {!isDiagnosed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <p className="px-4 text-center text-sm font-medium text-white">
                診断を完了するとプロンプトが解放されます
              </p>
              <Link
                href={`/${locale}/diagnosis`}
                className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-700"
              >
                診断する →
              </Link>
            </div>
          ) : null}
        </div>
        {personalityBlock !== null ? (
          <p className="mx-auto mt-6 max-w-3xl text-2xl font-bold leading-snug md:text-3xl">
            {personalityBlock.catchCopy}
          </p>
        ) : null}
        <p className="mt-3 text-xs opacity-90">
          {resultPageCopy.screenshotTagline}
        </p>
        <p className="mt-6 text-sm font-medium opacity-95">
          {resultPageCopy.recommendedAi}
        </p>
        <p className="text-xl font-semibold md:text-2xl">
          {mbtiApplied?.displayPrimaryLabel ?? result.baseAI.name}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Xでシェアする
          </a>
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            LINE
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </a>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `https://kompass-rosy.vercel.app/${locale}/result/${resolvedTypeCharacter.typeId ?? resolvedTypeCharacter.aiKind}`
              );
              toast.success("リンクをコピーしました ✓");
            }}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            コピー
          </button>
          <button
            type="button"
            onClick={() => {
              const imageUrl = `https://kompass-rosy.vercel.app/api/og?type=${resolvedTypeCharacter.aiKind}&lang=ja`;
              const link = document.createElement("a");
              link.href = imageUrl;
              link.download = `kompass_${resolvedTypeCharacter.aiKind}.png`;
              link.click();
              toast.success(
                "画像をダウンロードしました。Instagramストーリーに使えます ✓"
              );
            }}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Instagram
          </button>
        </div>
      </section>

      {/* 下部ゾーン：スクロールで詳細 */}
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-10">
        {personalityBlock !== null ? (
          <>
            <Card
              className="text-left"
              style={{
                backgroundColor: hexToRgba(
                  AI_THEME_COLORS[resolvedTypeCharacter.aiKind],
                  0.1
                ),
              }}
            >
              <CardHeader>
                <CardTitle>{resultPageCopy.detailTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {personalityBlock.supplement}
                </p>
                <p className="text-sm leading-relaxed">{result.baseAI.reason}</p>
                {result.baseAI.note !== undefined &&
                result.baseAI.note.trim() !== "" ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {result.baseAI.note}
                  </p>
                ) : null}
                <Separator />
                <div>
                  <p className="text-sm font-semibold">{resultPageCopy.strengths}</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {personalityBlock.strengths.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold">{resultPageCopy.weaknesses}</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {personalityBlock.weaknesses.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <>
                  <Separator />
                  <AxisGraph
                    typeId={resolvedTypeCharacter.aiKind}
                    axes={axisScores}
                  />
                  {(() => {
                    const compat = TYPE_COMPATIBILITY[resolvedTypeCharacter.aiKind];
                    const goodChar = TYPE_CHARACTERS.find(
                      (c) => c.aiKind === compat?.good
                    );
                    const badChar = TYPE_CHARACTERS.find(
                      (c) => c.aiKind === compat?.bad
                    );
                    if (!compat || !goodChar || !badChar) return null;
                    return (
                      <div className="mx-auto mt-6 max-w-md space-y-3">
                        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                          タイプ相性
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-center">
                            <p className="text-xs text-green-600 font-bold mb-1">相性◎</p>
                            <p className="text-sm font-bold text-gray-800">
                              {goodChar.characterName}
                            </p>
                            <p className="text-xs text-gray-400">{goodChar.aiName}</p>
                          </div>
                          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center">
                            <p className="text-xs text-red-500 font-bold mb-1">注意⚠</p>
                            <p className="text-sm font-bold text-gray-800">
                              {badChar.characterName}
                            </p>
                            <p className="text-xs text-gray-400">{badChar.aiName}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {(() => {
                    const famous = TYPE_FAMOUS[resolvedTypeCharacter.aiKind];
                    if (!famous) return null;
                    return (
                      <div className="mx-auto mt-6 max-w-md space-y-3">
                        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                          同じタイプの有名人
                        </p>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {famous.names.map((name) => (
                              <span
                                key={name}
                                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">{famous.reason}</p>
                        </div>
                      </div>
                    );
                  })()}
                </>
              </CardContent>
            </Card>

            {result.layerCompleted === 4 ? (
              <PersonalizedPrompts
                typeId={resolvedTypeCharacter.aiKind}
                answers={layer4Answers}
                accentColor={AI_THEME_COLORS[resolvedTypeCharacter.aiKind] ?? "#7C3AED"}
              />
            ) : null}

            {(() => {
              const link = AFFILIATE_LINKS[resolvedTypeCharacter.aiKind];
              if (!link) {
                return null;
              }
              return (
                <div className="mx-auto mt-3 max-w-md text-center">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-700"
                  >
                    {link.label} →
                  </a>
                </div>
              );
            })()}

            <Card className="text-left">
              <CardHeader>
                <CardTitle>{resultPageCopy.contraryTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="border-l-4 border-border pl-3 text-sm italic text-muted-foreground">
                  {personalityBlock.contraryCopy}
                </blockquote>
              </CardContent>
            </Card>

            {result.layerCompleted >= 1 ? (
              <Card className="text-left">
                <CardHeader>
                  <CardTitle>{resultPageCopy.oppositeTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {personalityBlock.oppositeType.typeJa}（
                    {personalityBlock.oppositeType.aiName}）
                  </p>
                  <p>{personalityBlock.oppositeType.description}</p>
                </CardContent>
              </Card>
            ) : null}

            {result.layerCompleted >= 2 ? (
              <>
                <Card className="text-left">
                  <CardHeader>
                    <CardTitle>{resultPageCopy.ngTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {personalityBlock.ngUsage}
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-left">
                  <CardHeader>
                    <CardTitle>{resultPageCopy.literacyTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {personalityBlock.literacyAnalysis}
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </>
        ) : (
          <Card className="text-left">
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed">{result.baseAI.reason}</p>
              {result.baseAI.note !== undefined &&
              result.baseAI.note.trim() !== "" ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {result.baseAI.note}
                </p>
              ) : null}
            </CardContent>
          </Card>
        )}

        <Card className="text-left">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">{resultPageCopy.statsTitle}</CardTitle>
            {statsDisplay.badge !== null ? (
              <Badge variant="secondary">{statsDisplay.badge}</Badge>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{statsDisplay.line}</p>
            <Progress value={userTypePercent} />
          </CardContent>
        </Card>

        <Card className="text-left">
          <CardHeader>
            <CardTitle className="text-base">{resultPageCopy.nextStepTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {advanced ? (
              <>
                {result.subAI.map((entry, idx) => (
                  <div key={`sub-${idx}-${entry.name}`} className="space-y-2">
                    <p>
                      <span className="font-semibold text-foreground">
                        {resultPageCopy.subAiLabel}
                      </span>
                      ：{entry.name}
                    </p>
                    {entry.usage !== "" ? <p>{entry.usage}</p> : null}
                  </div>
                ))}
                <Separator />
                {result.expertView !== "" ? (
                  <p className="border-l-4 border-border pl-3 text-foreground">
                    {result.expertView}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-foreground">
                  {resultPageCopy.setupOkTitle}
                </p>
                <p>{result.baseAI.setup}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {personalityBlock !== null && result.layerCompleted === 1 ? (
          <p className="text-left text-xs text-muted-foreground">
            {personalityBlock.shareText}
          </p>
        ) : null}

        <Card className="text-left">
          <CardContent className="space-y-3 pt-6">
            <p className="mb-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
              WEEKLY UPDATE
            </p>
            <p className="mb-1 text-sm font-bold text-gray-900">
              毎週、あなたのタイプ向けAI活用法を届けます
            </p>
            <p className="mb-4 text-xs text-gray-500">
              新しいプロンプト・使い方のヒントをメールでお届け。いつでも解除できます。
            </p>
            <form
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
              onSubmit={(e) => {
                e.preventDefault();
                void handleFollowupSubmit();
              }}
            >
              <input
                type="email"
                name="followup-email"
                autoComplete="email"
                value={followupEmail}
                onChange={(e) => {
                  setFollowupEmail(e.target.value);
                  setFollowupError(null);
                  if (followupStatus !== "idle") {
                    setFollowupStatus("idle");
                  }
                }}
                placeholder="you@example.com"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                required
              />
              <Button type="submit" disabled={followupStatus === "saving"}>
                {followupStatus === "saving" ? "登録中..." : "無料で受け取る"}
              </Button>
            </form>
            {followupStatus === "saved" ? (
              <p className="text-sm text-emerald-600">
                登録しました。次回のアップデートをお楽しみに ✓
              </p>
            ) : null}
            {followupError !== null ? (
              <p className="text-sm text-destructive" role="alert">
                {followupError}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="mx-auto mt-4 max-w-md text-center">
          <p className="text-xs text-gray-400">
            最新のAI活用情報は
            <a
              href="https://twitter.com/intent/follow?screen_name=kompass_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gray-600 transition-colors mx-1"
            >
              X（@kompass_ai）
            </a>
            で発信中
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}/diagnosis`}
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "inline-flex rounded-full px-6"
            )}
          >
            {resultPageCopy.redoDiagnosis}
          </Link>
        </div>

        {result.layerCompleted < 4 && remainingQuestions > 0 ? (
          <div className="mx-auto mt-4 max-w-md">
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-4 text-center space-y-2">
              <p className="text-xs text-gray-500 font-medium">
                もっと詳しく診断できます
              </p>
              <a
                href={`/${locale}/diagnosis?resume=true`}
                className="inline-block rounded-full bg-gray-800 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-600 transition-colors"
              >
                続きを診断する（残り{remainingQuestions}問）→
              </a>
            </div>
          </div>
        ) : null}

        <Card className="text-left">
          <CardHeader>
            <CardTitle className="text-base">{resultPageCopy.mbtiCardTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block min-w-0 flex-1">
                <span className="sr-only">MBTI</span>
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
                    setMbtiAppliedScores(null);
                  }}
                  placeholder={resultPageCopy.mbtiPlaceholder}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm font-medium tracking-widest focus-visible:ring-2 focus-visible:outline-none"
                />
              </label>
              <Button
                type="button"
                onClick={() => handleMbtiApply()}
                disabled={scoringSnapshot === null}
              >
                {resultPageCopy.mbtiApply}
              </Button>
            </div>
            {mbtiFieldError !== null ? (
              <p className="text-destructive text-sm" role="alert">
                {mbtiFieldError}
              </p>
            ) : null}
            {scoringSnapshot === null ? (
              <p className="text-muted-foreground text-xs">
                {resultPageCopy.mbtiNoScoresHint}
              </p>
            ) : null}
            {mbtiApplied !== null ? (
              <div className="space-y-2 text-sm leading-relaxed">
                <p className="text-foreground">{mbtiApplied.changeMessage}</p>
                <p className="text-muted-foreground">
                  {mbtiApplied.compatibilityComment}
                </p>
              </div>
            ) : null}
            <p className="text-muted-foreground text-xs">
              <a
                href="https://www.16personalities.com/ja"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-medium underline underline-offset-2"
              >
                {resultPageCopy.mbtiWhatLink}
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="mx-auto mt-6 max-w-md text-center">
          <a
            href={`/${locale}/diagnosis`}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-4 transition-colors"
          >
            もう一度診断する
          </a>
        </div>
      </div>
    </main>
  );
}
