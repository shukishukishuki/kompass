import { AI_KINDS, type AiKind } from "@/types/ai";

/** 16タイプの MBTI 識別子 */
export type MBTIType =
  | "INFJ"
  | "INFP"
  | "INTJ"
  | "INTP"
  | "ISFJ"
  | "ISFP"
  | "ISTJ"
  | "ISTP"
  | "ENFJ"
  | "ENFP"
  | "ENTJ"
  | "ENTP"
  | "ESFJ"
  | "ESFP"
  | "ESTJ"
  | "ESTP";

const MBTI_TYPES: readonly MBTIType[] = [
  "INFJ",
  "INFP",
  "INTJ",
  "INTP",
  "ISFJ",
  "ISFP",
  "ISTJ",
  "ISTP",
  "ENFJ",
  "ENFP",
  "ENTJ",
  "ENTP",
  "ESFJ",
  "ESFP",
  "ESTJ",
  "ESTP",
] as const;

type CorrectionEntry = {
  primary: { type: AiKind; bonus: number };
  secondary: { type: AiKind; bonus: number };
};

/**
 * 16タイプの Kompass スコア補正テーブル
 */
export const MBTI_CORRECTION_TABLE: Readonly<Record<MBTIType, CorrectionEntry>> =
  {
    INFJ: {
      primary: { type: "claude", bonus: 2 },
      secondary: { type: "perplexity", bonus: 1 },
    },
    INFP: {
      primary: { type: "claude", bonus: 2 },
      secondary: { type: "jiyujin", bonus: 1 },
    },
    INTJ: {
      primary: { type: "perplexity", bonus: 2 },
      secondary: { type: "claude", bonus: 1 },
    },
    INTP: {
      primary: { type: "perplexity", bonus: 2 },
      secondary: { type: "jiyujin", bonus: 1 },
    },
    ISFJ: {
      primary: { type: "copilot", bonus: 1 },
      secondary: { type: "claude", bonus: 1 },
    },
    ISFP: {
      primary: { type: "claude", bonus: 1 },
      secondary: { type: "chatgpt", bonus: 1 },
    },
    ISTJ: {
      primary: { type: "copilot", bonus: 2 },
      secondary: { type: "perplexity", bonus: 1 },
    },
    ISTP: {
      primary: { type: "perplexity", bonus: 1 },
      secondary: { type: "jiyujin", bonus: 1 },
    },
    ENFJ: {
      primary: { type: "claude", bonus: 2 },
      secondary: { type: "chatgpt", bonus: 1 },
    },
    ENFP: {
      primary: { type: "chatgpt", bonus: 2 },
      secondary: { type: "claude", bonus: 1 },
    },
    ENTJ: {
      primary: { type: "jiyujin", bonus: 2 },
      secondary: { type: "copilot", bonus: 1 },
    },
    ENTP: {
      primary: { type: "jiyujin", bonus: 2 },
      secondary: { type: "chatgpt", bonus: 1 },
    },
    ESFJ: {
      primary: { type: "chatgpt", bonus: 2 },
      secondary: { type: "copilot", bonus: 1 },
    },
    ESFP: {
      primary: { type: "chatgpt", bonus: 2 },
      secondary: { type: "gemini", bonus: 1 },
    },
    ESTJ: {
      primary: { type: "copilot", bonus: 2 },
      secondary: { type: "chatgpt", bonus: 1 },
    },
    ESTP: {
      primary: { type: "chatgpt", bonus: 2 },
      secondary: { type: "jiyujin", bonus: 1 },
    },
  };

/** AiKind から診断タイプ名（日本語） */
export const AI_KIND_TO_PERSONALITY_JA: Readonly<Record<AiKind, string>> = {
  claude: "相談相手タイプ",
  chatgpt: "万能助手タイプ",
  gemini: "情報通タイプ",
  perplexity: "研究者タイプ",
  copilot: "秘書タイプ",
  jiyujin: "自由人タイプ",
};

/** AiKind から診断タイプ名（英語） */
export const AI_KIND_TO_PERSONALITY_EN: Readonly<Record<AiKind, string>> = {
  claude: "The Confidant",
  chatgpt: "The Generalist",
  gemini: "The Scout",
  perplexity: "The Analyst",
  copilot: "The Executive",
  jiyujin: "The Orchestrator",
};

/**
 * MBTI によるスコア補正を適用した新しいスコアマップを返す（入力は変更しない）
 */
export function applyMBTICorrection(
  scores: Record<AiKind, number>,
  mbti: MBTIType
): Record<AiKind, number> {
  const entry = MBTI_CORRECTION_TABLE[mbti];
  const next = {} as Record<AiKind, number>;
  for (const k of AI_KINDS) {
    next[k] = scores[k];
  }
  next[entry.primary.type] += entry.primary.bonus;
  next[entry.secondary.type] += entry.secondary.bonus;
  return next;
}

/**
 * 補正前後の「診断タイプ（日本語）」を比較し、ユーザー向けメッセージを返す
 */
export function detectResultChange(
  beforeType: string,
  afterType: string
): string {
  if (beforeType === afterType) {
    return "診断結果はそのまま。あなたは一致度が高いです";
  }
  return `MBTIを考慮すると、${afterType}の傾向がさらに強くなりました`;
}

/** MBTI を大まかな気質グループに分類（相性コメントのトーン分け用） */
const MBTI_FAMILY: Record<MBTIType, "NF" | "NT" | "SJ" | "SP"> = {
  INFJ: "NF",
  INFP: "NF",
  ENFJ: "NF",
  ENFP: "NF",
  INTJ: "NT",
  INTP: "NT",
  ENTJ: "NT",
  ENTP: "NT",
  ISFJ: "SJ",
  ISTJ: "SJ",
  ESFJ: "SJ",
  ESTJ: "SJ",
  ISFP: "SP",
  ISTP: "SP",
  ESFP: "SP",
  ESTP: "SP",
};

/**
 * MBTI × 推奨AI の簡易相性コメント（日本語）
 */
const COMPATIBILITY_COMMENTS: Record<
  MBTIType,
  Record<AiKind, string>
> = buildCompatibilityComments();

function buildCompatibilityComments(): Record<MBTIType, Record<AiKind, string>> {
  const out = {} as Record<MBTIType, Record<AiKind, string>>;
  for (const m of MBTI_TYPES) {
    out[m] = {
      claude: commentFor(m, "claude"),
      chatgpt: commentFor(m, "chatgpt"),
      gemini: commentFor(m, "gemini"),
      perplexity: commentFor(m, "perplexity"),
      copilot: commentFor(m, "copilot"),
      jiyujin: commentFor(m, "jiyujin"),
    };
  }
  return out;
}

function commentFor(mbti: MBTIType, ai: AiKind): string {
  const tone = MBTI_FAMILY[mbti];
  const aiJa: Record<AiKind, string> = {
    claude: "Claude",
    chatgpt: "ChatGPT",
    gemini: "Gemini",
    perplexity: "Perplexity",
    copilot: "Copilot",
    jiyujin: "複数のAIの使い分け",
  };
  const name = aiJa[ai];
  switch (tone) {
    case "NF":
      if (ai === "claude" || ai === "chatgpt") {
        return `${mbti}気質と${name}は、対話と言語のニュアンスの面で相性がよい傾向です。`;
      }
      if (ai === "perplexity") {
        return `${mbti}の探究心と${name}は、深い調べものと組み合わせやすいです。`;
      }
      if (ai === "gemini") {
        return `${mbti}と${name}は、情報の幅と直感のバランスが取りやすいです。`;
      }
      if (ai === "copilot") {
        return `${mbti}でも業務直結の${name}は、型にはめたいときに助けになります。`;
      }
      return `${mbti}のマルチ用途志向と${name}は、役割分担の設計と相性があります。`;
    case "NT":
      if (ai === "perplexity" || ai === "claude") {
        return `${mbti}の論理・構造化志向と${name}は、分析と文章化の両面で噛み合いやすいです。`;
      }
      if (ai === "chatgpt") {
        return `${mbti}と${name}は、試行錯誤のスピード感を共有しやすいです。`;
      }
      if (ai === "gemini") {
        return `${mbti}と${name}は、情報の横断と要約に向いた組み合わせです。`;
      }
      if (ai === "copilot") {
        return `${mbti}の効率志向と${name}は、ドキュメント作業の加速に向きます。`;
      }
      return `${mbti}の戦略性と${name}は、ツールを組み合わせる設計に向いています。`;
    case "SJ":
      if (ai === "copilot" || ai === "chatgpt") {
        return `${mbti}の安定運用志向と${name}は、手順化・テンプレ化と相性がよいです。`;
      }
      if (ai === "claude") {
        return `${mbti}でも丁寧な${name}は、文章の整えや相談に安心感があります。`;
      }
      if (ai === "perplexity") {
        return `${mbti}の慎重さと${name}は、根拠付き調査の補助に向きます。`;
      }
      if (ai === "gemini") {
        return `${mbti}と${name}は、日常ツールとの連携を重視するなら相性があります。`;
      }
      return `${mbti}の実務志向と${name}は、用途別の最適化を進めやすいです。`;
    case "SP":
      if (ai === "chatgpt" || ai === "gemini") {
        return `${mbti}の即応性と${name}は、試しながら進めるスタイルに合いやすいです。`;
      }
      if (ai === "jiyujin") {
        return `${mbti}の柔軟さと${name}は、状況に応じた切り替えと相性があります。`;
      }
      if (ai === "perplexity") {
        return `${mbti}と${name}は、現場の疑問をその場で掘るのに向きます。`;
      }
      if (ai === "claude") {
        return `${mbti}でも対話重視の${name}は、言葉の調整に時間をかけたいときに合います。`;
      }
      return `${mbti}の実務スピードと${name}は、業務フローへの組み込みと相性があります。`;
    default:
      return `${mbti}と${name}は、使い方次第で十分に力を発揮できる組み合わせです。`;
  }
}

/**
 * MBTI と推奨 AI 種別から相性コメント（日本語1文）を返す
 */
export function getMBTICompatibilityComment(
  mbti: MBTIType,
  aiKind: AiKind
): string {
  return COMPATIBILITY_COMMENTS[mbti][aiKind];
}

/**
 * 入力が16タイプのいずれか（大文字4文字）かを検証する
 */
export function isValidMBTI(input: string): boolean {
  const trimmed = input.trim().toUpperCase();
  if (trimmed.length !== 4) {
    return false;
  }
  return (MBTI_TYPES as readonly string[]).includes(trimmed);
}

/**
 * 正規化した MBTI 文字列（大文字4文字）を返す。不正な場合は null
 */
export function normalizeMBTI(input: string): MBTIType | null {
  const trimmed = input.trim().toUpperCase();
  if (!isValidMBTI(trimmed)) {
    return null;
  }
  return trimmed as MBTIType;
}
