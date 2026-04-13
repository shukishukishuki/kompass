import { resolveAiKindFromDisplayName } from "@/lib/ai-display";
import { AI_THEME_COLORS, type AiKind, type PersonalityTypeEn, type PersonalityTypeJa } from "@/types/ai";

/** タイプ別キャラクター表示情報 */
export interface TypeCharacter {
  typeJa: PersonalityTypeJa;
  typeEn: PersonalityTypeEn;
  characterName: string;
  oneLiner: string;
  aiKind: AiKind;
  aiName: string;
  imageSrc: string;
}

/** タイプ一覧ページと結果画面で共通利用する6タイプ定義 */
export const TYPE_CHARACTERS: readonly TypeCharacter[] = [
  {
    typeJa: "相談相手タイプ",
    typeEn: "The Confidant",
    characterName: "共感ジャンキー",
    oneLiner: "感情の機微をつかむ、対話型の共感ドライバー。",
    aiKind: "claude",
    aiName: "Claude",
    imageSrc: "/images/kompass_char_01_empath.png",
  },
  {
    typeJa: "秘書タイプ",
    typeEn: "The Executive",
    characterName: "整理の鬼",
    oneLiner: "タスクを整列し、最短で実行に落とし込む。",
    aiKind: "copilot",
    aiName: "Copilot",
    imageSrc: "/images/kompass_char_02_executor.png",
  },
  {
    typeJa: "研究者タイプ",
    typeEn: "The Analyst",
    characterName: "裏取りマニア",
    oneLiner: "根拠を重ねて、精度重視で結論に辿りつく。",
    aiKind: "perplexity",
    aiName: "Perplexity",
    imageSrc: "/images/kompass_char_03_analyst.png",
  },
  {
    typeJa: "万能助手タイプ",
    typeEn: "The Generalist",
    characterName: "丸投げ屋",
    oneLiner: "まず任せる。速度と幅で前に進める。",
    aiKind: "chatgpt",
    aiName: "ChatGPT",
    imageSrc: "/images/kompass_char_04_generalist.png",
  },
  {
    typeJa: "情報通タイプ",
    typeEn: "The Scout",
    characterName: "情報スナイパー",
    oneLiner: "最新情報を射抜き、意思決定を速くする。",
    aiKind: "gemini",
    aiName: "Gemini",
    imageSrc: "/images/kompass_char_05_scout.png",
  },
  {
    typeJa: "自由人タイプ",
    typeEn: "The Orchestrator",
    characterName: "AI遊牧民",
    oneLiner: "目的に合わせて、複数AIを使い分ける。",
    aiKind: "jiyujin",
    aiName: "複数のAIの使い分け",
    imageSrc: "/images/kompass_char_06_nomad.png",
  },
] as const;

/**
 * 16進カラーを透過付きrgba文字列に変換する
 */
export function hexToRgba(hexColor: string, alpha: number): string {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 診断タイプ名からキャラクター情報を取得する
 */
export function getTypeCharacterByTypeJa(typeJa: string): TypeCharacter | null {
  return TYPE_CHARACTERS.find((item) => item.typeJa === typeJa) ?? null;
}

/**
 * 表示AI名から近いキャラクター情報を取得する
 */
export function getTypeCharacterByAiDisplayName(aiDisplayName: string): TypeCharacter | null {
  const kind = resolveAiKindFromDisplayName(aiDisplayName);
  if (kind === null) {
    return null;
  }
  return TYPE_CHARACTERS.find((item) => item.aiKind === kind) ?? null;
}

/**
 * タイプ名または表示AI名からキャラ情報を解決する
 */
export function resolveTypeCharacter(
  typeJa: string,
  aiDisplayName: string
): TypeCharacter {
  const byType = getTypeCharacterByTypeJa(typeJa);
  if (byType !== null) {
    return byType;
  }
  const byAiName = getTypeCharacterByAiDisplayName(aiDisplayName);
  if (byAiName !== null) {
    return byAiName;
  }
  return TYPE_CHARACTERS[0];
}

/**
 * AIテーマカラーを20%透明で返す（円背景用）
 */
export function getTypeCircleBackgroundColor(aiKind: AiKind): string {
  return hexToRgba(AI_THEME_COLORS[aiKind], 0.2);
}
