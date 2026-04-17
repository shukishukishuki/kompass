"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
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
import {
  AI_KIND_TO_PERSONALITY_EN,
  AI_KIND_TO_PERSONALITY_JA,
  applyMBTICorrection,
  detectResultChange,
  getMBTICompatibilityComment,
  normalizeMBTI,
} from "@/lib/mbti-correction";
import { enqueueDiagnosisBehaviorLog } from "@/lib/diagnosis-behavior-log";
import {
  getPersonalityDescription,
  PERSONALITY_DESCRIPTIONS,
} from "@/lib/personality-descriptions";
import { buildScoringResultFromAggregatedScores } from "@/lib/scoringEngine";
import { AI_KIND_TO_GUIDE } from "@/lib/type-id-map";
import {
  hexToRgba,
  resolveTypeCharacter,
  TYPE_CHARACTERS,
} from "@/lib/type-characters";
import {
  getDiagnosisStats,
  saveUserFollowupEmail,
  saveUserResultEmail,
  type DiagnosisTypeStats,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";
import enMessages from "@/messages/en.json";
import jaMessages from "@/messages/ja.json";
import type { DiagnosisResult } from "@/types/diagnosis";
import type { DiagnosisResultPageCopy } from "@/types/diagnosis-messages";
import type { MessagesFile } from "@/types/diagnosis-messages";
import {
  AI_KINDS,
  AI_KIND_THEMES,
  AI_THEME_COLORS,
  type AiKind,
} from "@/types/ai";
import type { ScoringResult } from "@/types/scoring";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { OneClickAIButton } from "@/components/diagnosis/OneClickAIButton";
import { AxisGraph } from "@/components/diagnosis/AxisGraph";
import { PersonalizedPrompts } from "@/components/diagnosis/PersonalizedPrompts";
import { TypePromptTabs } from "@/components/diagnosis/TypePromptTabs";
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

const TYPE_COMPANIES: Record<string, { companies: string[]; reason: string }> = {
  claude: {
    companies: ["note", "ほぼ日", "文藝春秋"],
    reason: "言葉と感情を大切にするサービス・メディア",
  },
  chatgpt: {
    companies: ["DeNA", "サイバーエージェント", "メルカリ"],
    reason: "スピードと実行力で成長したスタートアップ",
  },
  gemini: {
    companies: ["Google", "Yahoo!ニュース", "SmartNews"],
    reason: "情報収集・配信を軸にしたサービス",
  },
  perplexity: {
    companies: ["McKinsey", "野村総研", "東大松尾研"],
    reason: "根拠と分析を武器にするプロ集団",
  },
  copilot: {
    companies: ["トヨタ", "三菱商事", "NTT"],
    reason: "構造化・管理・実行を強みとする大企業",
  },
  jiyujin: {
    companies: ["GAFA全部使う人", "フリーランス", "スタートアップCTO"],
    reason: "特定ツールに縛られない自由人",
  },
};

const TYPE_ROADMAP: Record<string, { steps: string[] }> = {
  claude: {
    steps: [
      "まず日記や悩みをClaudeに話しかけてみる",
      "週1回の振り返りをClaudeと一緒に行う",
      "長文ドキュメントの要約・分析に使う",
    ],
  },
  chatgpt: {
    steps: [
      "作業の丸投げから始める（メール・資料作成）",
      "プロンプトテンプレートを作って使い回す",
      "GPTsで自分専用のAIを作る",
    ],
  },
  gemini: {
    steps: [
      "Googleアカウントと連携して使い始める",
      "最新ニュースの要約を毎朝頼む",
      "Google WorkspaceのAI機能を全部オンにする",
    ],
  },
  perplexity: {
    steps: [
      "気になるニュースの裏取りに使う",
      "レポート・論文の参考文献収集に使う",
      "競合調査・市場分析のメインツールにする",
    ],
  },
  copilot: {
    steps: [
      "Microsoft 365と連携して議事録自動化",
      "ExcelデータをAIで分析する",
      "Teamsの会議サマリーを自動生成する",
    ],
  },
  jiyujin: {
    steps: [
      "用途別にAIを使い分けるルールを作る",
      "新しいAIが出たら即試してみる",
      "複数AIの回答を比較して最善策を選ぶ",
    ],
  },
};

const CHAR_ANIMATIONS: Record<string, string> = {
  claude: "sway 3s ease-in-out infinite",
  copilot: "snap 2.5s ease-in-out infinite",
  perplexity: "scrutinize 4s ease-in-out infinite",
  chatgpt: "bounce-soft 2s ease-in-out infinite",
  gemini: "snipe 3s ease-in-out infinite",
  jiyujin: "float 5s ease-in-out infinite",
};

const TYPE_NEXT_ACTIONS: Record<
  string,
  { actions: { label: string; url: string }[] }
> = {
  claude: {
    actions: [
      { label: "Claudeを無料で試す", url: "https://claude.ai" },
      { label: "共感ジャンキーのガイドを見る", url: `/guide/${AI_KIND_TO_GUIDE.claude}` },
      { label: "もう一度診断する", url: "/diagnosis" },
    ],
  },
  chatgpt: {
    actions: [
      { label: "ChatGPTを無料で試す", url: "https://chatgpt.com" },
      { label: "丸投げ屋のガイドを見る", url: `/guide/${AI_KIND_TO_GUIDE.chatgpt}` },
      { label: "もう一度診断する", url: "/diagnosis" },
    ],
  },
  gemini: {
    actions: [
      { label: "Geminiを無料で試す", url: "https://gemini.google.com" },
      { label: "情報スナイパーのガイドを見る", url: `/guide/${AI_KIND_TO_GUIDE.gemini}` },
      { label: "もう一度診断する", url: "/diagnosis" },
    ],
  },
  perplexity: {
    actions: [
      { label: "Perplexityを無料で試す", url: "https://perplexity.ai" },
      { label: "裏取りマニアのガイドを見る", url: `/guide/${AI_KIND_TO_GUIDE.perplexity}` },
      { label: "もう一度診断する", url: "/diagnosis" },
    ],
  },
  copilot: {
    actions: [
      { label: "Copilotを無料で試す", url: "https://copilot.microsoft.com" },
      { label: "整理の鬼のガイドを見る", url: `/guide/${AI_KIND_TO_GUIDE.copilot}` },
      { label: "もう一度診断する", url: "/diagnosis" },
    ],
  },
  jiyujin: {
    actions: [
      { label: "まずClaudeを無料で試す", url: "https://claude.ai" },
      { label: "AI遊牧民のガイドを見る", url: `/guide/${AI_KIND_TO_GUIDE.jiyujin}` },
      { label: "もう一度診断する", url: "/diagnosis" },
    ],
  },
};

const AI_LABEL_JA: Record<string, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  copilot: "Copilot",
  jiyujin: "遊牧民",
};

const BOTTOM_SECTION_HEADING_CLASS =
  "mb-2 text-[11px] font-semibold tracking-[0.1em] text-[#999] uppercase";

/** resultPage 未定義時のフォールバック（ja） */
const FALLBACK_RESULT_COPY: DiagnosisResultPageCopy = {
  statsAggregating: "まだ集計中（診断者募集中！）",
  statsPercentTemplate: "全診断ユーザーの {percent}% がこのタイプ",
  rarityOften: "よく見るタイプ",
  rarityGeneral: "一般的なタイプ",
  rarityUnusual: "少し珍しいタイプ",
  rarityRare: "レアタイプ",
  heroTabResult: "結果",
  heroTabDetail: "詳細",
  heroTabAiUsage: "AI活用法",
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
      typeof p.whoYouAre !== "string" ||
      typeof p.thinkingPattern !== "string" ||
      typeof p.workStyle !== "string" ||
      typeof p.aiCompatibility !== "string" ||
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
  if (
    "recordId" in o &&
    o.recordId !== undefined &&
    typeof o.recordId !== "string"
  ) {
    return false;
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
  const [resultSaveExpanded, setResultSaveExpanded] = useState(false);
  const [resultSaveEmail, setResultSaveEmail] = useState("");
  const [resultSaveStatus, setResultSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [resultSaveError, setResultSaveError] = useState<string | null>(null);
  /** ヒーロー下タブの見た目用（詳細・AI活用法は該当セクションへスクロール） */
  const [heroTab, setHeroTab] = useState<"result" | "detail" | "usage">(
    "result"
  );

  const logXShareClicked = useCallback(() => {
    const id = result?.recordId;
    if (typeof id === "string" && id.trim() !== "") {
      enqueueDiagnosisBehaviorLog({
        recordId: id.trim(),
        clicked_share: true,
      });
    }
  }, [result?.recordId]);

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
    const id = result?.recordId;
    if (typeof id !== "string" || id.trim() === "") {
      return;
    }
    enqueueDiagnosisBehaviorLog({
      recordId: id.trim(),
      markVisited: true,
    });
  }, [result?.recordId]);

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

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [hydrated]);

  useEffect(() => {
    if (hydrated && result?.layerCompleted === 4) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [
          "#52B788",
          "#E8A020",
          "#F07C2A",
          "#9B4DCA",
          "#4A7FC1",
          "#C9A84C",
        ],
      });
    }
  }, [hydrated, result?.layerCompleted]);

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

  const personalityDetailSections = useMemo(() => {
    if (personalityBlock === null) {
      return [];
    }
    return [
      { title: "あなたはこういう人です", body: personalityBlock.whoYouAre },
      { title: "思考パターン", body: personalityBlock.thinkingPattern },
      { title: "職場での振る舞い", body: personalityBlock.workStyle },
      { title: "AIとの相性", body: personalityBlock.aiCompatibility },
    ];
  }, [personalityBlock]);

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

  const isOrchestratorDisplay = useMemo(() => {
    if (result === null) {
      return false;
    }
    return (
      resolvedTypeCharacter.aiKind === "jiyujin" ||
      resolvedTypeCharacter.typeId === "orchestrator" ||
      result.type === "jiyujin" ||
      result.type === "自由人タイプ" ||
      displayPersonalityJa === "自由人タイプ" ||
      result.typeEn.toLowerCase() === "orchestrator"
    );
  }, [
    result,
    resolvedTypeCharacter.aiKind,
    resolvedTypeCharacter.typeId,
    displayPersonalityJa
  ]);

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

  const personalityDesc = PERSONALITY_DESCRIPTIONS[resolvedTypeCharacter.aiKind];
  const shareText = encodeURIComponent(
    personalityDesc?.shareText
      ? `${personalityDesc.shareText} #Kompass #AI診断`
      : `私のAIタイプは「${resolvedTypeCharacter.characterName}」でした！\n\nあなたのベースAIは？ #Kompass #AI診断`
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("正しいメールアドレスを入力してください");
      setFollowupError("有効なメールアドレスを入力してください。");
      setFollowupStatus("error");
      return;
    }
    setFollowupStatus("saving");
    setFollowupError(null);
    const saved = await saveUserFollowupEmail(email, displayPersonalityJa, {
      aiType: resolvedTypeCharacter.aiKind,
      layerCompleted: result.layerCompleted,
    });
    if (saved) {
      setFollowupStatus("saved");
      setFollowupEmail("");
      return;
    }
    setFollowupStatus("error");
    setFollowupError("現在は登録できません。時間をおいて再度お試しください。");
  }, [result, followupEmail, displayPersonalityJa, resolvedTypeCharacter.aiKind]);

  const handleResultSaveSubmit = useCallback(async () => {
    if (result === null) {
      return;
    }
    const email = resultSaveEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResultSaveError("有効なメールアドレスを入力してください。");
      setResultSaveStatus("error");
      return;
    }

    setResultSaveStatus("saving");
    setResultSaveError(null);
    const saved = await saveUserResultEmail(email, displayPersonalityJa, {
      aiType: resolvedTypeCharacter.aiKind,
      layerCompleted: result.layerCompleted,
    });

    if (saved) {
      setResultSaveStatus("saved");
      setResultSaveEmail("");
      toast.success("保存しました。メールを確認してください");
      return;
    }

    setResultSaveStatus("error");
    setResultSaveError("現在は保存できません。時間をおいて再度お試しください。");
  }, [result, resultSaveEmail, displayPersonalityJa, resolvedTypeCharacter.aiKind]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md px-6 space-y-4 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded-full mx-auto" />
          <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto" />
          <div className="h-8 w-48 bg-gray-200 rounded-full mx-auto" />
          <div className="h-4 w-64 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-56 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (result === null) {
    return (
      <main className="min-h-screen pb-16">
        <section
          className="px-6 pb-12 pt-12 text-center text-white shadow-lg"
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
          <div className="relative mx-auto mt-6 max-w-2xl">
            <div className={!isDiagnosed ? "blur-sm pointer-events-none select-none" : ""}>
              <div className="mx-auto mt-6 max-w-2xl">
                <OneClickAIButton
                  typeId={resolvedTypeCharacter.aiKind}
                  accentColor={AI_KIND_THEMES[resolvedTypeCharacter.aiKind].primary}
                  actionLabelColor={AI_KIND_THEMES[resolvedTypeCharacter.aiKind].cText}
                />
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
        </section>
      </main>
    );
  }

  const advanced = isAdvancedPresentation(result);
  const heroTheme = AI_KIND_THEMES[resolvedTypeCharacter.aiKind];
  const theme = heroTheme;
  const heroTypeEnLine = mbtiApplied?.correctedTypeEn ?? result.typeEn;
  const heroCharacterName =
    personalityBlock?.characterName ?? displayPersonalityJa;
  const resolvedTypeCharacterView = {
    ...resolvedTypeCharacter,
    imagePath: resolvedTypeCharacter.imageSrc,
    nameJa: heroCharacterName,
  };
  const oppositeTypeId = personalityBlock?.oppositeType.typeJa;
  const oppositeCharacter = TYPE_CHARACTERS.find(
    (character) => character.typeJa === oppositeTypeId
  );
  const oppositeGuideTypeId =
    (oppositeCharacter !== undefined
      ? AI_KIND_TO_GUIDE[oppositeCharacter.aiKind]
      : undefined) ??
    oppositeCharacter?.typeId ??
    "empath";

  return (
    <main className="min-h-screen pb-16">
      {/* 上部ゾーン（スクショ用）：キャラ名・コピー・固定文・推奨AI・シェア */}
      <section
        id="section-hero-result"
        className="relative overflow-x-clip px-6 pb-4 pt-12 text-center shadow-lg"
        style={{
          background: `linear-gradient(180deg, ${heroTheme.cMid} 0%, ${heroTheme.cLight} 55%, #f8fffe 85%, #ffffff 100%)`,
          boxShadow: `0 4px 20px ${hexToRgba(heroTheme.primary, 0.15)}`,
        }}
        aria-labelledby="hero-heading"
      >
        {/* 右上：放射状の光（::before 相当） */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute right-0 top-0 h-[min(55vh,28rem)] w-full max-w-[720px]"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 70% 100%, ${hexToRgba(heroTheme.primary, 0.35)} 0%, transparent 70%)`,
            }}
          />
        </div>

        {/* 背景装飾：英語タイプ名 */}
        <p
          className="pointer-events-none absolute bottom-0 left-[-4px] z-0 max-w-[100vw] select-none overflow-hidden text-left text-[clamp(2.25rem,11vw,6rem)] font-medium leading-none tracking-[-4px]"
          style={{ color: hexToRgba(heroTheme.primary, 0.1) }}
          aria-hidden
        >
          {heroTypeEnLine}
        </p>

        <div className="relative z-10 mx-auto max-w-5xl">
          <p
            className="mb-4 mt-1 text-center text-xs"
            style={{ color: `${heroTheme.cText}99` }}
          >
            診断完了 ✦ あなたのAIタイプが決まりました
          </p>

          <div className="mx-auto flex w-full max-w-2xl flex-col items-center overflow-visible">
            <div
              style={{
                position: "relative",
                width: 280,
                height: 280,
                margin: "0 auto 16px",
                overflow: "visible",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: "50%",
                  background: theme.cMid,
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedTypeCharacterView.imagePath}
                alt={resolvedTypeCharacterView.nameJa}
                style={{
                  position: "absolute",
                  width: 320,
                  height: 320,
                  objectFit: "contain",
                  bottom: 0,
                  left: "50%",
                  animation:
                    CHAR_ANIMATIONS[result.type] ?? "float 5s ease-in-out infinite",
                  transformOrigin: "50% 90%",
                  willChange: "transform",
                  zIndex: 10,
                }}
              />
            </div>
            <h1
              id="hero-heading"
              className="mt-2 leading-tight"
              style={{
                color: heroTheme.cText,
                fontWeight: 500,
                fontSize: 36,
                fontFamily: '"Noto Sans JP", "BIZ UDGothic", sans-serif',
              }}
            >
              {heroCharacterName}
            </h1>
            {scoringSnapshot ? (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {Object.entries(scoringSnapshot.scoresByAi)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([aiKind, score]) => (
                    <a
                      key={aiKind}
                      href={`/${locale}/guide/${AI_KIND_TO_GUIDE[aiKind as string] ?? aiKind}`}
                      className="rounded-full px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor:
                          AI_THEME_COLORS[
                            aiKind as keyof typeof AI_THEME_COLORS
                          ] ?? "#C9A84C",
                      }}
                    >
                      {AI_LABEL_JA[aiKind as string] ?? (aiKind as string)}{" "}
                      {Math.round(score as number)}pt
                    </a>
                  ))}
              </div>
            ) : null}
            <p
              className="mt-2 text-sm uppercase tracking-wide md:text-base"
              style={{ color: `${heroTheme.cText}cc` }}
            >
              {resolvedTypeCharacter.typeEn}
            </p>
          </div>
        </div>
        {personalityBlock !== null ? (
          <p
            className="relative z-10 mx-auto mt-6 max-w-3xl px-1 leading-snug"
            style={{
              fontFamily: 'Georgia, "游明朝", "Yu Mincho", serif',
              fontWeight: 400,
              fontSize: 22,
              fontStyle: "normal",
              letterSpacing: "0.02em",
              color: heroTheme.cText,
            }}
          >
            {personalityBlock.catchCopy}
          </p>
        ) : null}
        {isOrchestratorDisplay ? null : (
          <p
            className="relative z-10 mt-6 text-sm font-medium"
            style={{ color: heroTheme.cText }}
          >
            {resultPageCopy.recommendedAi}
          </p>
        )}
        <p
          className="relative z-10 text-xl font-semibold md:text-2xl"
          style={{ color: heroTheme.cText, marginTop: isOrchestratorDisplay ? 24 : undefined }}
        >
          {isOrchestratorDisplay
            ? "メインAI: Claude（深掘り・思考整理）"
            : (mbtiApplied?.displayPrimaryLabel ?? result.baseAI.name)}
        </p>
        {isOrchestratorDisplay && (
          <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
            サブAI: Perplexity（調査・裏取り）/ ChatGPT（整理・アウトプット）
          </p>
        )}
        {/* ヒーロー下部タブ（見た目＋スクロール） */}
        <nav
          className="relative z-10 mx-auto mt-10 flex max-w-lg gap-0 overflow-hidden rounded-t-2xl border border-black/[0.06] bg-white/55 backdrop-blur-md"
          aria-label="結果セクション内ナビ"
        >
          <button
            type="button"
            className={cn(
              "flex-1 py-3.5 text-sm font-semibold transition-colors",
              heroTab === "result"
                ? "border-b-2 text-[#0a2e18]"
                : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-800"
            )}
            style={
              heroTab === "result"
                ? { borderBottomColor: heroTheme.primary }
                : undefined
            }
            onClick={() => {
              setHeroTab("result");
              document
                .getElementById("section-hero-result")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {resultPageCopy.heroTabResult}
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 py-3.5 text-sm font-semibold transition-colors",
              heroTab === "detail"
                ? "border-b-2 text-[#0a2e18]"
                : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-800"
            )}
            style={
              heroTab === "detail"
                ? { borderBottomColor: heroTheme.primary }
                : undefined
            }
            onClick={() => {
              setHeroTab("detail");
              document
                .getElementById("section-detail")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {resultPageCopy.heroTabDetail}
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 py-3.5 text-sm font-semibold transition-colors",
              heroTab === "usage"
                ? "border-b-2 text-[#0a2e18]"
                : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-800"
            )}
            style={
              heroTab === "usage"
                ? { borderBottomColor: heroTheme.primary }
                : undefined
            }
            onClick={() => {
              setHeroTab("usage");
              document
                .getElementById("section-ai-usage")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {resultPageCopy.heroTabAiUsage}
          </button>
        </nav>
      </section>

      <section className="mx-auto mt-8 w-full max-w-2xl px-6">
        <div className="space-y-8">
          <div className="space-y-6">
            {personalityDetailSections.length > 0 ? (
              <section className="space-y-3">
                {personalityDetailSections.map((section) => (
                  <article
                    key={section.title}
                    className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                    style={{
                      borderLeftWidth: "2px",
                      borderLeftColor: AI_THEME_COLORS[resolvedTypeCharacter.aiKind] ?? "#C9A84C",
                    }}
                  >
                    <p className="mb-2 text-[12px] uppercase tracking-[0.1em] text-[#999]">
                      {section.title}
                    </p>
                    <p className="text-[15px] leading-[1.8] text-gray-800">{section.body}</p>
                  </article>
                ))}
              </section>
            ) : null}
            <Card
              id="section-detail"
              className="text-left scroll-mt-4"
              style={{
                backgroundColor: "#fff",
                border: `1.5px solid ${hexToRgba(AI_THEME_COLORS[resolvedTypeCharacter.aiKind], 0.2)}`,
                borderRadius: 16,
              }}
            >
              <CardHeader>
                <CardTitle>{resultPageCopy.detailTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {personalityBlock?.supplement ?? ""}
                </p>
                <p className="text-sm leading-relaxed">{result.baseAI.reason}</p>
                {result.baseAI.note !== undefined &&
                result.baseAI.note.trim() !== "" ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {result.baseAI.note}
                  </p>
                ) : null}
                {result.layerCompleted >= 2 ? (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold">{resultPageCopy.strengths}</p>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                        {(personalityBlock?.strengths ?? []).map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{resultPageCopy.weaknesses}</p>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                        {(personalityBlock?.weaknesses ?? []).map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : null}
                {result.layerCompleted >= 3 ? (
                  <>
                    <Separator />
                    <AxisGraph
                      typeId={resolvedTypeCharacter.aiKind}
                      axes={axisScores}
                    />
                  </>
                ) : null}
              </CardContent>
            </Card>
            {result.layerCompleted >= 2
              ? (() => {
                  const roadmap = TYPE_ROADMAP[resolvedTypeCharacter.aiKind];
                  if (!roadmap) return null;
                  return (
                    <div className="space-y-3">
                      <p className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-[#999] uppercase">
                        活用ロードマップ
                      </p>
                      <div
                        className="rounded-2xl bg-white p-4 space-y-3"
                        style={{
                          border: `1.5px solid ${hexToRgba(AI_THEME_COLORS[resolvedTypeCharacter.aiKind], 0.2)}`,
                        }}
                      >
                        {roadmap.steps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span
                              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{
                                backgroundColor:
                                  AI_THEME_COLORS[resolvedTypeCharacter.aiKind] ?? "#C9A84C",
                              }}
                            >
                              {i + 1}
                            </span>
                            <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              : null}
          </div>
          <div className="space-y-6">
            <Card className="text-left bg-white/95 text-gray-900 shadow-md">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3">
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
            <div className="relative">
              <div className={!isDiagnosed ? "blur-sm pointer-events-none select-none" : ""}>
                <OneClickAIButton
                  typeId={resolvedTypeCharacter.aiKind}
                  accentColor={heroTheme.primary}
                  actionLabelColor={heroTheme.cText}
                  diagnosisRecordId={result.recordId ?? null}
                />
              </div>
              {!isDiagnosed ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <p className="px-4 text-center text-sm font-medium text-[#1a3328]">
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
            {result.layerCompleted >= 2
              ? (() => {
                  const compat = TYPE_COMPATIBILITY[resolvedTypeCharacter.aiKind];
                  const goodChar = TYPE_CHARACTERS.find((c) => c.aiKind === compat?.good);
                  const badChar = TYPE_CHARACTERS.find((c) => c.aiKind === compat?.bad);
                  if (!compat || !goodChar || !badChar) return null;
                  return (
                    <div className="space-y-3">
                      <p className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-[#999] uppercase">
                        タイプ相性
                      </p>
                      <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f9f9f9] p-3">
                        <div className="rounded-xl bg-green-50 p-3 text-center">
                          <p className="text-xs text-green-600 font-bold mb-1">相性◎</p>
                          <p className="text-sm font-bold text-gray-800">{goodChar.characterName}</p>
                          <p className="text-xs text-gray-400">{goodChar.aiName}</p>
                          <a
                            href={`/${locale}/guide/${AI_KIND_TO_GUIDE[compat.good] ?? compat.good}`}
                            className="text-xs underline underline-offset-2 text-green-600 hover:text-green-800 mt-1 block"
                          >
                            使い方を見る →
                          </a>
                        </div>
                        <div className="rounded-xl bg-red-50 p-3 text-center">
                          <p className="text-xs text-red-500 font-bold mb-1">注意⚠</p>
                          <p className="text-sm font-bold text-gray-800">{badChar.characterName}</p>
                          <p className="text-xs text-gray-400">{badChar.aiName}</p>
                          <a
                            href={`/${locale}/guide/${AI_KIND_TO_GUIDE[compat.bad] ?? compat.bad}`}
                            className="text-xs underline underline-offset-2 text-red-400 hover:text-red-600 mt-1 block"
                          >
                            使い方を見る →
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })()
              : null}
            {result.layerCompleted >= 2
              ? (() => {
                  const famous = TYPE_FAMOUS[resolvedTypeCharacter.aiKind];
                  if (!famous) return null;
                  return (
                    <div className="space-y-3">
                      <p className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-[#999] uppercase">
                        同じタイプの有名人
                      </p>
                      <div className="rounded-xl bg-[#f9f9f9] p-4 space-y-2">
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
                })()
              : null}
            {result.layerCompleted >= 2
              ? (() => {
                  const companies = TYPE_COMPANIES[resolvedTypeCharacter.aiKind];
                  if (!companies) return null;
                  return (
                    <div className="space-y-2">
                      <div className="rounded-xl bg-[#f9f9f9] p-4 space-y-2">
                        <p className="mb-3 text-[11px] font-semibold tracking-[0.1em] text-[#999] uppercase">
                          同じタイプの企業・職種
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {companies.companies.map((name) => (
                            <span
                              key={name}
                              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">{companies.reason}</p>
                      </div>
                    </div>
                  );
                })()
              : null}
          </div>
        </div>
      </section>

      {result.layerCompleted >= 1 ? (
        <div className="mx-auto mt-6 w-full max-w-2xl px-6">
          <div className="space-y-4 rounded-2xl bg-[#fafafa] p-5 text-left">
              <button
                type="button"
                aria-label="この診断結果を保存して、後から見返す"
                onClick={() => {
                  setResultSaveExpanded((prev) => !prev);
                  setResultSaveError(null);
                  if (resultSaveStatus !== "idle") {
                    setResultSaveStatus("idle");
                  }
                }}
                className="w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: heroTheme.primary,
                }}
              >
                この診断結果を保存して、後から見返す
              </button>
              {resultSaveExpanded ? (
                <form
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleResultSaveSubmit();
                  }}
                >
                  <input
                    type="email"
                    name="result-save-email"
                    autoComplete="email"
                    value={resultSaveEmail}
                    onChange={(e) => {
                      setResultSaveEmail(e.target.value);
                      setResultSaveError(null);
                      if (resultSaveStatus !== "idle") {
                        setResultSaveStatus("idle");
                      }
                    }}
                    placeholder="you@example.com"
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-center text-sm focus-visible:ring-2 focus-visible:outline-none"
                    required
                  />
                  <Button type="submit" disabled={resultSaveStatus === "saving"}>
                    {resultSaveStatus === "saving" ? "保存中..." : "保存する"}
                  </Button>
                </form>
              ) : null}
              {resultSaveError !== null ? (
                <p className="text-sm text-destructive" role="alert">
                  {resultSaveError}
                </p>
              ) : null}
          </div>
        </div>
      ) : null}

      {result.layerCompleted < 4 && remainingQuestions > 0 ? (
        <div className="mx-auto mt-6 w-full max-w-2xl px-6">
          <div
            style={{
              background: `linear-gradient(135deg, ${hexToRgba(heroTheme.primary, 0.12)} 0%, ${hexToRgba(heroTheme.primary, 0.06)} 100%)`,
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              animation: "ctaPulse 2.5s ease-in-out infinite",
              boxShadow: `0 4px 20px ${hexToRgba(heroTheme.primary, 0.15)}`,
            }}
            className="space-y-3"
          >
            <p className={BOTTOM_SECTION_HEADING_CLASS}>続きを診断する</p>
            <p
              style={{
                fontSize: 13,
                color: heroTheme.cText,
                opacity: 0.8,
                marginBottom: 12,
              }}
            >
              続けて診断すると「NGな使い方」「AIリテラシー分析」が解放されます
            </p>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: heroTheme.primary,
                color: "#fff",
              }}
            >
              🔍 もっと深く知る
            </span>
            <p className="text-[18px] font-bold" style={{ color: heroTheme.cText }}>
              診断の精度をもっと上げられます
            </p>
            <p className="text-sm leading-relaxed text-zinc-700">
              残り{remainingQuestions}
              問に答えると、より詳細な分析と専用プロンプトが解放されます
            </p>
            <a
              href={`/${locale}/diagnosis?resumeFromLayer=${result.layerCompleted}`}
              className="block w-full text-center font-bold text-white transition-opacity hover:opacity-90"
              style={{
                background: heroTheme.cText,
                color: "#fff",
                borderRadius: 12,
                padding: "14px 24px",
                fontSize: 16,
                width: "100%",
                boxShadow: `0 4px 16px ${hexToRgba(heroTheme.primary, 0.3)}`,
              }}
            >
              続きを診断する（残り{remainingQuestions}問）→
            </a>
          </div>
        </div>
      ) : null}

      {result.layerCompleted >= 1 ? (
      <div className="mx-auto mt-8 w-full max-w-2xl px-6">
        <p className="mb-3 text-center text-[14px] font-bold tracking-[0.12em] text-[#444] uppercase">
          SHARE YOUR TYPE
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            LINE
          </a>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(
                `https://kompass-rosy.vercel.app/${locale}/result/${resolvedTypeCharacter.typeId ?? resolvedTypeCharacter.aiKind}`
              );
              toast.success("リンクをコピーしました ✓");
            }}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </a>
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
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Instagram
          </button>
        </div>
      </div>
      ) : null}

      {/* 下部ゾーン：スクロールで詳細 */}
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-10">
        {personalityBlock !== null ? (
          <>
            {result.layerCompleted >= 4 ? (
              <PersonalizedPrompts
                typeId={resolvedTypeCharacter.aiKind}
                answers={layer4Answers}
                accentColor={AI_THEME_COLORS[resolvedTypeCharacter.aiKind] ?? "#C9A84C"}
              />
            ) : null}
            {result.layerCompleted >= 3 ? (
              <div className="mx-auto mt-6 max-w-2xl">
                <TypePromptTabs
                  userTypeId={resolvedTypeCharacter.typeId}
                  twitterShareHref={twitterUrl}
                  onXShareClick={logXShareClicked}
                />
              </div>
            ) : null}
            {result.layerCompleted >= 3 ? (
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
            ) : null}
            {result.layerCompleted >= 3 ? (
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
                  <a
                    href={`/${locale}/guide/${oppositeGuideTypeId}`}
                    className="text-xs underline underline-offset-2 text-gray-400 hover:text-gray-600 mt-1 block"
                  >
                    使い方を見る →
                  </a>
                </CardContent>
              </Card>
            ) : null}
            {result.layerCompleted >= 4 ? (
              <>
                <div className="mx-auto mt-4 max-w-2xl">
                  <p className="text-center text-xs text-gray-400 mb-2">
                    ✦ Layer {result.layerCompleted} 解放済み
                  </p>
                </div>
                <Card className="text-left">
                  <CardHeader>
                    <CardTitle>{resultPageCopy.ngTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {[personalityBlock.ngUsage].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="shrink-0 text-red-400 mt-0.5">✕</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="text-left">
                  <CardHeader>
                    <CardTitle>{resultPageCopy.literacyTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
                      AI LITERACY
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {personalityBlock.literacyAnalysis}
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : null}
            <section
              id="section-ai-usage"
              className="scroll-mt-4 border-t border-[#f0f0f0] bg-white pt-6 text-center"
            >
              <p className={BOTTOM_SECTION_HEADING_CLASS}>次の一歩 / まずこれだけOK</p>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
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
                    <p>{result.baseAI.setup}</p>
                  </div>
                )}
              </div>
            </section>
            <section className="border-t border-[#f0f0f0] bg-white pt-6 text-center flex flex-col items-center">
              <p className={BOTTOM_SECTION_HEADING_CLASS}>WEEKLY UPDATE</p>
              <p className="mb-1 text-sm font-bold text-gray-900">
                毎週、あなたのタイプ向けAI活用法を届けます
              </p>
              <p className="mb-4 text-xs text-gray-500">
                新しいプロンプト・使い方のヒントをメールでお届け。いつでも解除できます。
              </p>
              <form
                className="w-full"
                style={{ width: "fit-content", margin: "0 auto" }}
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
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full max-w-[280px] rounded-md border px-3 py-2 text-center text-sm focus-visible:ring-2 focus-visible:outline-none"
                  style={{
                    display: "block",
                    margin: "0 auto",
                    maxWidth: 280,
                    width: "100%",
                    textAlign: "center",
                  }}
                  required
                />
                <Button
                  type="submit"
                  disabled={followupStatus === "saving"}
                  style={{ display: "block", margin: "8px auto 0" }}
                >
                  {followupStatus === "saving" ? "登録中..." : "無料で受け取る"}
                </Button>
              </form>
              {followupStatus === "saved" ? (
                <p className="mt-3 text-sm text-emerald-600">
                  登録しました。次回のアップデートをお楽しみに ✓
                </p>
              ) : null}
              {followupError !== null ? (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {followupError}
                </p>
              ) : null}
            </section>
            {result.layerCompleted >= 1
              ? (() => {
                  const nextActions = TYPE_NEXT_ACTIONS[resolvedTypeCharacter.aiKind];
                  if (!nextActions) return null;
                  return (
                    <section className="border-t border-[#f0f0f0] bg-white pt-6 text-center">
                      <p className={BOTTOM_SECTION_HEADING_CLASS}>次のアクション</p>
                      <div className="space-y-2">
                        {nextActions.actions.map((action, i) => (
                          <a
                            key={i}
                            href={
                              action.url.startsWith("/")
                                ? `/${locale}${action.url}`
                                : action.url
                            }
                            target={action.url.startsWith("http") ? "_blank" : undefined}
                            rel={
                              action.url.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <span>{action.label}</span>
                            <span className="text-gray-400">→</span>
                          </a>
                        ))}
                      </div>
                    </section>
                  );
                })()
              : null}
            <section className="border-t border-[#f0f0f0] bg-white pt-6 text-center flex flex-col items-center">
              <p className="mb-2 text-[13px] font-semibold tracking-[0.1em] text-[#999] uppercase">
                MBTI入力
              </p>
              <p className="mb-3 text-[15px] font-semibold text-[#333]">
                {resultPageCopy.mbtiCardTitle}
              </p>
              <div className="w-full" style={{ width: "fit-content", margin: "0 auto" }}>
                <label className="block min-w-0">
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
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full max-w-[160px] rounded-md border px-3 py-2 text-center text-sm font-medium tracking-widest focus-visible:ring-2 focus-visible:outline-none"
                    style={{
                      display: "block",
                      margin: "0 auto",
                      maxWidth: 160,
                      width: "100%",
                      textAlign: "center",
                    }}
                  />
                </label>
                <Button
                  type="button"
                  onClick={() => handleMbtiApply()}
                  disabled={scoringSnapshot === null}
                  style={{ display: "block", margin: "8px auto 0" }}
                >
                  {resultPageCopy.mbtiApply}
                </Button>
              </div>
              {mbtiFieldError !== null ? (
                <p className="mt-3 text-destructive text-sm" role="alert">
                  {mbtiFieldError}
                </p>
              ) : null}
              {scoringSnapshot === null ? (
                <p className="mt-3 text-muted-foreground text-xs">
                  {resultPageCopy.mbtiNoScoresHint}
                </p>
              ) : null}
              {mbtiApplied !== null ? (
                <div className="mt-3 space-y-2 text-sm leading-relaxed">
                  <p className="text-foreground">{mbtiApplied.changeMessage}</p>
                  <p className="text-muted-foreground">
                    {mbtiApplied.compatibilityComment}
                  </p>
                </div>
              ) : null}
              <p className="mt-3 text-muted-foreground text-xs">
                <a
                  href="https://www.16personalities.com/ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium underline underline-offset-2"
                >
                  {resultPageCopy.mbtiWhatLink}
                </a>
              </p>
            </section>
            <section className="border-t border-[#f0f0f0] bg-white pt-6 text-center">
              <p className={BOTTOM_SECTION_HEADING_CLASS}>診断日時</p>
              <p className="text-xs text-gray-500">
                診断日：
                {new Date().toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </section>
            <section className="border-t border-[#f0f0f0] bg-white pt-6">
              <p className="mb-3 text-center text-[14px] font-bold tracking-[0.12em] text-[#444] uppercase">
                SHARE YOUR TYPE
              </p>
              <div className="flex flex-wrap justify-center gap-2">
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                LINE
              </a>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `https://kompass-rosy.vercel.app/${locale}/result/${resolvedTypeCharacter.typeId ?? resolvedTypeCharacter.aiKind}`
                  );
                  toast.success("リンクをコピーしました ✓");
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
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
                className="flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </button>
              </div>
            </section>
            <section className="border-t border-[#f0f0f0] bg-white pt-6">
              <p className={cn(BOTTOM_SECTION_HEADING_CLASS, "text-center mb-3")}>
                もう一度診断する
              </p>
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
            </section>
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
      </div>
    </main>
  );
}
