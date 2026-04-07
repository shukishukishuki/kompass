/**
 * 診断6タイプの性格特性コピー（結果画面用）
 * キーは DiagnosisResult.type（日本語のタイプ名）と一致させる
 */

import type { PersonalityDescription } from "@/types/diagnosis";

export type { PersonalityDescription } from "@/types/diagnosis";

const PERSONALITY_DESCRIPTIONS_JA: Record<string, PersonalityDescription> = {
  相談相手タイプ: {
    characterName: "共感ジャンキー",
    catchCopy: "正しいかより、わかってほしい。",
    supplement:
      "AIを「ツール」ではなく「対話相手」として扱える、かなり珍しいタイプです。",
    contraryCopy:
      "「正論を言われるより、一言『お疲れ様』が欲しい時がある。」",
    strengths: [
      "言葉のニュアンスや温度差に敏感で、ズレをすぐ修正できる",
      "頭の中のモヤモヤを「ちゃんと伝わる形」に整理できる",
    ],
    weaknesses: [
      "納得してから動きたいので、初動が遅れることがある",
      "正しい意見でも「共感」がないと受け入れにくい",
    ],
    oppositeType: {
      typeJa: "秘書タイプ",
      aiName: "Copilot",
      description:
        "効率と構造を最優先にする秘書タイプとは、AIへの向き合い方が最も異なります。でも、そのドライさを取り入れると生産性が変わります。",
    },
    ngUsage:
      "AIに『正しい答えを一つ出して』と命令するように使うと、Claudeの本領が発揮されません。命令ではなく対話として使うのがこのタイプの正解です。",
    literacyAnalysis:
      "あなたは情報の『生成』より『整理・共鳴』にバイアスがかかっています。AIを思考の鏡として使う能力が高い。",
    shareText: "これ、あの人に見せたい。",
  },
  万能助手タイプ: {
    characterName: "丸投げ屋",
    catchCopy: "考える前に、もう動いてる。",
    supplement:
      "考えながら動くより、動きながら最適解に近づいていくタイプです。",
    contraryCopy:
      "「完璧な100点より、まずは『叩き台の60点』を愛している。」",
    strengths: [
      "とにかく手を動かすので、結果的に誰よりも経験値が溜まる",
      "ゼロからでも形にするスピードが速い",
    ],
    weaknesses: [
      "「とりあえずこれでいいか」が積み重なり、粗さが残ることがある",
      "深く詰める前に次へ進みがち",
    ],
    oppositeType: {
      typeJa: "研究者タイプ",
      aiName: "Perplexity",
      description:
        "根拠を徹底的に確認してから動く研究者タイプとは、意思決定のスピードと順序が真逆です。ただし、彼らの検証プロセスは弱点を補います。",
    },
    ngUsage:
      "ChatGPTを深い思考整理や感情の壁打ちに使うのは、ポテンシャルの無駄遣いです。量と速さが必要な場面に集中させましょう。",
    literacyAnalysis:
      "あなたは情報の『整理』より『実行』にバイアスがかかっています。アウトプット量でカバーするタイプのAI活用者です。",
    shareText: "心当たりある人、いません？",
  },
  情報通タイプ: {
    characterName: "情報スナイパー",
    catchCopy: "知らないままは、無理。",
    supplement:
      "「知らない状態」でいることに、強い違和感を持つタイプです。",
    contraryCopy:
      "「膨大な情報の海を泳いでいるとき、一番自分らしくいられる。」",
    strengths: [
      "新しい情報やトレンドを誰より早くキャッチできる",
      "複数の情報源を横断して全体像を掴むのが得意",
    ],
    weaknesses: [
      "情報収集で満足してしまい、意思決定が遅れることがある",
      "広く追いすぎて、深さが足りなくなることがある",
    ],
    oppositeType: {
      typeJa: "相談相手タイプ",
      aiName: "Claude",
      description:
        "感情と共感を重視する相談相手タイプとは、情報への向き合い方が対照的です。深い対話が苦手な場面で力を借りられます。",
    },
    ngUsage:
      "Geminiを創作・感情対話に使うのは向いていません。情報収集とGoogleツール連携に特化させると力を発揮します。",
    literacyAnalysis:
      "あなたは情報の『深さ』より『鮮度と速度』にバイアスがかかっています。リアルタイム性を最大化したAI設計が向いています。",
    shareText: "情報収集が趣味の人、全員これ。",
  },
  研究者タイプ: {
    characterName: "裏取りマニア",
    catchCopy: "\"なんとなく\"は、全部疑う。",
    supplement:
      "「なんとなく正しそう」を信用しない。根拠のない言葉には本能的に疑問を持つ。",
    contraryCopy:
      "「AIの嘘を見抜く瞬間、少しだけ自分が勝った気がする。」",
    strengths: [
      "根拠の薄い情報を見抜く精度が高い",
      "信頼できる結論を出すためのプロセスを持っている",
    ],
    weaknesses: [
      "確実性を重視するあまり、スピード勝負に弱い場面がある",
      "感覚で判断する人の意思決定に違和感を持ちやすい",
    ],
    oppositeType: {
      typeJa: "万能助手タイプ",
      aiName: "ChatGPT",
      description:
        "とりあえず動いて結果を出す万能助手タイプとは、情報処理の哲学が真逆です。スピードが求められる場面で彼らの動き方は参考になります。",
    },
    ngUsage:
      "Perplexityでアイデア出しや感情の整理をしようとすると、出典のない回答に物足りなさを感じるはずです。調査・検証の場面だけに使うのが正解です。",
    literacyAnalysis:
      "あなたは情報の『量』より『根拠の質』にバイアスがかかっています。検証プロセスを持つ、信頼性の高いAI活用者です。",
    shareText: "うちの上司、絶対これ。",
  },
  秘書タイプ: {
    characterName: "整理の鬼",
    catchCopy: "感情より、最短ルート。",
    supplement:
      "感情より構造。「やるべきことが整理されている状態」が、あなたにとっての安心です。",
    contraryCopy:
      "「『やるべきこと』が整理されていない時間は、苦痛でしかない。」",
    strengths: [
      "やるべきことを瞬時に分解し、順序立てて処理できる",
      "今ある環境を最大効率で使いこなせる",
    ],
    weaknesses: [
      "効率を優先しすぎて、遠回りの価値を見落とすことがある",
      "感情ベースのやり取りに疲れやすい",
    ],
    oppositeType: {
      typeJa: "相談相手タイプ",
      aiName: "Claude",
      description:
        "感情を優先して考える相談相手タイプとは、判断の軸が真逆です。行き詰まったとき、彼らの視点が突破口になります。",
    },
    ngUsage:
      "CopilotをGoogle環境や創作の場面で使おうとすると、連携の弱さが目立ちます。MS環境の中だけで使うのが最大効率です。",
    literacyAnalysis:
      "あなたは情報の『発見』より『処理と効率化』にバイアスがかかっています。既存フローにAIを統合する能力が高い。",
    shareText: "効率の鬼、集まれ。",
  },
  自由人タイプ: {
    characterName: "AI遊牧民",
    catchCopy: "一つに決めるのが、一番ムダ。",
    supplement:
      "一つに絞れないのは、最適解を探し続ける思考が強いからです。",
    contraryCopy:
      "「一途になれないのではない。最適解が常に変わるだけだ。」",
    strengths: [
      "目的ごとに最適なAIを選べる柔軟性がある",
      "新しいツールへの適応が早く、変化に強い",
    ],
    weaknesses: [
      "「これでいい」と止める判断が難しい",
      "一つを極める前に次へ移りやすい",
    ],
    oppositeType: {
      typeJa: "秘書タイプ",
      aiName: "Copilot",
      description:
        "一つのツールを深く使い込む秘書タイプとは、AIとの付き合い方が対照的です。選択肢を絞る力が、あなたの次のステージです。",
    },
    ngUsage:
      "複数のAIを目的なく使い回すのは、かえって習熟を遅らせます。用途ごとに『これはこのAI』とルールを決めると力が出ます。",
    literacyAnalysis:
      "あなたは特定のAIへの依存を避ける、メタ的なAI活用スタイルを持っています。最適化思考が強い上級者タイプです。",
    shareText: "一つに決められない仲間を探してる。",
  },
};

/**
 * タイプ名（日本語）から性格特性ブロックを返す
 * @param typeJa API の result.type（日本語）
 * @param locale UI ロケール（ja / en）
 */
export function getPersonalityDescription(
  typeJa: string,
  _locale: string
): PersonalityDescription | null {
  const desc = PERSONALITY_DESCRIPTIONS_JA[typeJa];
  return desc !== undefined ? desc : null;
}
