/**
 * 診断6タイプの性格特性コピー（結果画面用）
 * キーは DiagnosisResult.type（日本語のタイプ名）と一致させる
 */

import type { PersonalityDescription } from "@/types/diagnosis";

export type { PersonalityDescription } from "@/types/diagnosis";

const PERSONALITY_DESCRIPTIONS_JA: Record<string, PersonalityDescription> = {
  相談相手タイプ: {
    headline: "あなたはAIに「頭脳」より「心」を求めるタイプ。",
    body: "答えより、整理されること・共感されることを大切にする。言葉の質に敏感で、雑な文章に違和感を感じやすい。Claudeとは、波長が自然と合う。",
    traits: [
      "答えより「整理されること」を求める",
      "正確さより共感を優先しがち",
      "長文・丁寧な説明が苦にならない",
      "深夜にAIに話しかけたことがある",
    ],
  },
  万能助手タイプ: {
    headline: "あなたはAIを「道具」として使いこなすタイプ。",
    body: "まず動いて後で考える行動派。完璧より速さを重視し、幅広い場面でAIをフル活用している（またはしたい）。ChatGPTの万能さは、あなたの行動力と相性がいい。",
    traits: [
      "完璧より速さを優先する",
      "とにかく試してみて、後で判断する",
      "多機能・何でもこなせる環境が好き",
      "AIを「何でも屋」として使う",
    ],
  },
  情報通タイプ: {
    headline: "あなたはAIを「情報インフラ」として活用するタイプ。",
    body: "スピードと鮮度を重視し、常に最新の動きを把握していたい。Google系ツールを日常的に使っており、シームレスな連携を好む。Geminiは、あなたのデジタル環境にすでに溶け込める。",
    traits: [
      "最新情報を誰より早く知りたい",
      "Google系ツールをヘビーに使っている",
      "情報収集は習慣になっている",
      "効率と速度を最優先する",
    ],
  },
  研究者タイプ: {
    headline: "あなたはAIに「裏どり」を求めるタイプ。",
    body: "曖昧な情報より、出典と根拠を重視する。調べものは深掘りしてしまい、「本当にそれは正しいのか？」と考える癖がある。Perplexityはあなたの知的好奇心に唯一応えられるAIかもしれない。",
    traits: [
      "「ソースは？」と思うことが多い",
      "調べものは深掘りしてしまう",
      "慎重に考えてから動く",
      "情報の質にこだわる",
    ],
  },
  秘書タイプ: {
    headline: "あなたはAIを「業務の延長」として使いたいタイプ。",
    body: "Word・Excel・Teamsが中心の仕事環境で、ツールを切り替えるストレスを嫌う。効率第一の合理主義者。Copilotは、あなたの仕事の流れにほぼシームレスに入り込む。",
    traits: [
      "仕事の流れを崩したくない",
      "ツールの切り替えが面倒",
      "会社・組織の中でのアウトプットを重視する",
      "Microsoftツールがメインの環境",
    ],
  },
  自由人タイプ: {
    headline: "あなたはAIを「複数の専門家チーム」として使いこなすタイプ。",
    body: "一つのAIに縛られず、目的に応じて最適なAIを選べる。AIリテラシーが高く、上級者向けの使い方が向いている。あなたには、1つのAIを選ぶより「チーム設計」の方が合っている。",
    traits: [
      "目的によって最適解を選べる",
      "一つのAIに満足したことがない",
      "新しいAIツールを試すことに抵抗がない",
      "AIを「使いこなしている」感覚がある",
    ],
  },
};

/** 英語UI用（type は API の日本語タイプ名のままキー参照） */
const PERSONALITY_DESCRIPTIONS_EN: Record<string, PersonalityDescription> = {
  相談相手タイプ: {
    headline: "You look for heart, not just horsepower, from AI.",
    body: "You value being heard and organized over quick answers. You’re sensitive to tone and put off by sloppy wording. Claude’s style tends to match your wavelength.",
    traits: [
      "You want clarity and structure before “the answer”",
      "You often prioritize empathy over raw accuracy",
      "Long, careful explanations don’t bother you",
      "You’ve messaged AI late at night",
    ],
  },
  万能助手タイプ: {
    headline: "You treat AI as a tool you can wield.",
    body: "You move first and refine later. You favor speed over perfection and want AI across many tasks (or you’re ready to). ChatGPT’s versatility fits your momentum.",
    traits: [
      "Speed often beats perfection for you",
      "Try first, judge later",
      "You like one place that can do many things",
      "You use AI as a generalist “do-it-all”",
    ],
  },
  情報通タイプ: {
    headline: "You use AI as part of your information infrastructure.",
    body: "You care about freshness and speed, and you like staying on top of what’s new. You already live in Google tools and value seamless workflows. Gemini can slot into that stack.",
    traits: [
      "You want the latest updates early",
      "You lean heavily on Google’s ecosystem",
      "Gathering info is a habit",
      "Efficiency and speed come first",
    ],
  },
  研究者タイプ: {
    headline: "You want AI that can show its work.",
    body: "You prefer sources and evidence over vague claims. You go deep on research and keep asking, “Is that really true?” Perplexity may be the best match for that curiosity.",
    traits: [
      "You often think, “Where’s the source?”",
      "Research tends to turn into a rabbit hole",
      "You act after you’ve thought it through",
      "You care about information quality",
    ],
  },
  秘書タイプ: {
    headline: "You want AI as an extension of how you already work.",
    body: "Word, Excel, and Teams anchor your day, and switching tools feels costly. You’re efficiency-first and output-focused in an org setting. Copilot can sit close to that flow.",
    traits: [
      "You don’t want your workflow disrupted",
      "Switching tools feels tedious",
      "You care about deliverables inside a company context",
      "Microsoft tools are your home base",
    ],
  },
  自由人タイプ: {
    headline: "You run AI like a team of specialists.",
    body: "You’re not locked to one model—you pick the best tool for each goal. You’re comfortable with advanced setups. Designing a “team” of AIs may suit you more than choosing just one.",
    traits: [
      "You can pick the right tool for each goal",
      "One AI rarely feels “enough”",
      "You’re open to trying new AI tools",
      "You feel like you truly “use” AI, not just chat",
    ],
  },
};

/**
 * タイプ名（日本語）から性格特性ブロックを返す
 * @param typeJa API の result.type（日本語）
 * @param locale UI ロケール（ja / en）
 */
export function getPersonalityDescription(
  typeJa: string,
  locale: string
): PersonalityDescription | null {
  const map = locale === "en" ? PERSONALITY_DESCRIPTIONS_EN : PERSONALITY_DESCRIPTIONS_JA;
  const desc = map[typeJa];
  return desc !== undefined ? desc : null;
}
