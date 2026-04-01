import Anthropic from "@anthropic-ai/sdk";
import type { AiKind } from "@/types/ai";
import type { ClaudeGeneratedText } from "@/types/claude";
import type { ScoringResult, UserLayer } from "@/types/scoring";

/** 利用モデル（Kompass 診断コピー生成） */
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

/** プロンプト・フォールバックで使う製品名（日本語UI向け） */
const AI_LABEL_JA: Record<AiKind, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  copilot: "Microsoft Copilot",
  jiyujin: "複数のAIの使い分け",
};

const SYSTEM_PROMPT = `あなたはKompassという「ベースAI診断」サービスのコピーライターです。
ユーザーへの出力は必ず自然な日本語のみとし、JSON以外の説明文や前置きは付けないでください。
必ず指定スキーマのJSONオブジェクト1つだけを返してください。`;

/**
 * 診断スコアリング結果とユーザー層を渡し、Claude API で reason / setup /（上級者のみ）expertView を生成する
 *
 * @param scoringResult スコアリングエンジンの出力
 * @param userLayer 明示的なユーザー層（画面/API から渡す値を優先）
 */
export async function generateDiagnosisTexts(
  scoringResult: ScoringResult,
  userLayer: UserLayer
): Promise<ClaudeGeneratedText> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey === undefined || apiKey.trim() === "") {
    return getFallbackDiagnosisTexts(scoringResult, userLayer);
  }

  try {
    const client = new Anthropic({ apiKey });
    const userContent = buildUserPrompt(scoringResult, userLayer);

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const rawText = extractTextContent(response);
    const parsed = parseGeneratedJson(rawText);
    if (parsed === null) {
      return getFallbackDiagnosisTexts(scoringResult, userLayer);
    }

    return normalizeOutput(parsed, userLayer, scoringResult);
  } catch {
    return getFallbackDiagnosisTexts(scoringResult, userLayer);
  }
}

/**
 * API 応答テキストから JSON を取り出して検証する
 */
function parseGeneratedJson(raw: string): ClaudeGeneratedText | null {
  let s = raw.trim();
  const fenceMatch = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/m.exec(s);
  if (fenceMatch !== null) {
    s = fenceMatch[1].trim();
  }

  try {
    const data: unknown = JSON.parse(s);
    if (!isClaudeGeneratedText(data)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * ClaudeGeneratedText の型ガード
 */
function isClaudeGeneratedText(value: unknown): value is ClaudeGeneratedText {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  if (typeof o.reason !== "string" || typeof o.setup !== "string") {
    return false;
  }
  if (
    "expertView" in o &&
    o.expertView !== undefined &&
    typeof o.expertView !== "string"
  ) {
    return false;
  }
  return true;
}

/**
 * 一般層では expertView を付けないよう正規化する。
 * 上級者層で expertView が空ならフォールバック1文を補う。
 */
function normalizeOutput(
  parsed: ClaudeGeneratedText,
  userLayer: UserLayer,
  scoringResult: ScoringResult
): ClaudeGeneratedText {
  if (userLayer === "general") {
    return {
      reason: parsed.reason.trim(),
      setup: parsed.setup.trim(),
    };
  }
  const fallbackExpert = getFallbackDiagnosisTexts(
    scoringResult,
    "advanced"
  ).expertView;
  const trimmedExpert = parsed.expertView?.trim();
  return {
    reason: parsed.reason.trim(),
    setup: parsed.setup.trim(),
    expertView:
      trimmedExpert !== undefined && trimmedExpert.length > 0
        ? trimmedExpert
        : fallbackExpert,
  };
}

/**
 * Anthropic Messages API のテキストブロックを連結する
 */
function extractTextContent(message: Anthropic.Messages.Message): string {
  const chunks: string[] = [];
  for (const block of message.content) {
    if (block.type === "text") {
      chunks.push(block.text);
    }
  }
  return chunks.join("\n").trim();
}

/**
 * ユーザー向けプロンプト本文を組み立てる
 */
function buildUserPrompt(
  scoringResult: ScoringResult,
  userLayer: UserLayer
): string {
  const mainJa = getAiLabelJa(scoringResult.displayPrimaryAi);
  const subJa =
    scoringResult.displayMode === "mixed"
      ? getAiLabelJa("jiyujin")
      : scoringResult.first === "jiyujin" && scoringResult.second !== null
        ? getAiLabelJa("jiyujin")
        : scoringResult.second !== null
          ? getAiLabelJa(scoringResult.second)
          : "（なし）";

  const context = {
    userLayer,
    personalityKind: scoringResult.first,
    displayPrimaryKind: scoringResult.displayPrimaryAi,
    baseAiKind: scoringResult.first,
    subAiKind: scoringResult.second,
    baseAiLabelJa: mainJa,
    subAiLabelJa: subJa,
    displayMode: scoringResult.displayMode,
    scoreDiff: scoringResult.scoreDiff,
    scoresByAi: scoringResult.scoresByAi,
    ranking: scoringResult.ranking,
  };

  if (userLayer === "general") {
    return `## 診断コンテキスト（JSON）
${JSON.stringify(context, null, 2)}

## あなたのタスク
上記の診断結果に基づき、ベースAIとして「${mainJa}」を推す理由と、最初の一歩を書いてください。

## 制約
- reason: 日本語でちょうど2文。${mainJa}がなぜベースAIに合うかを具体的に。
- setup: 日本語で1文。今日からできる最初のアクション。
- 出力は次のJSONのみ（キーは reason と setup の2つ）:
{"reason":"...","setup":"..."}`;
  }

  return `## 診断コンテキスト（JSON）
${JSON.stringify(context, null, 2)}

## あなたのタスク
上記の診断結果に基づき、メインのベースAI「${mainJa}」と補助としての「${subJa}」の推薦理由・最初の一歩・使い分けを書いてください。

## 制約
- reason: 日本語でちょうど2文。${mainJa}を主軸にする理由。
- setup: 日本語で1文。${mainJa}で始める最初の具体的アクション。
- expertView: 日本語で1文。${mainJa}と${subJa}の役割分担（例: 骨組みと仕上げ、調査と執筆など）。
- 出力は次のJSONのみ（キーは reason, setup, expertView の3つ）:
{"reason":"...","setup":"...","expertView":"..."}`;
}

/**
 * AiKind から画面表示用の日本語ラベルを返す
 */
export function getAiLabelJa(kind: AiKind): string {
  return AI_LABEL_JA[kind];
}

/**
 * API 失敗時・キー未設定時の固定文言（画面を壊さないための最低限の内容）
 */
export function getFallbackDiagnosisTexts(
  scoringResult: ScoringResult,
  userLayer: UserLayer
): ClaudeGeneratedText {
  const main = getAiLabelJa(scoringResult.displayPrimaryAi);
  const sub =
    scoringResult.displayMode === "mixed"
      ? getAiLabelJa("jiyujin")
      : scoringResult.first === "jiyujin" && scoringResult.second !== null
        ? getAiLabelJa("jiyujin")
        : scoringResult.second !== null
          ? getAiLabelJa(scoringResult.second)
          : "ChatGPT";

  const reason = `${main}は、あなたの回答から算出したスコアでは最もバランスよく一致するベースAIです。まずは日常の相談や作業をこの1つに集約し、慣れてから用途に応じて広げていくのがおすすめです。`;

  const setup = `今日から1週間は、${main}だけをメインのチャット窓口にし、よく使う依頼文を3つメモに残しておきましょう。`;

  if (userLayer === "general") {
    return { reason, setup };
  }

  return {
    reason,
    setup,
    expertView: `まずは${main}で下書きや構成を固め、仕上げ・別視点の確認は${sub}に任せると、スピードと質の両立がしやすくなります。`,
  };
}
