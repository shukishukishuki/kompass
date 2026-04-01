/**
 * 診断6タイプの性格特性コピー（結果画面用）
 * キーは DiagnosisResult.type（日本語のタイプ名）と一致させる
 */

import type { PersonalityDescription } from "@/types/diagnosis";

export type { PersonalityDescription } from "@/types/diagnosis";

const PERSONALITY_DESCRIPTIONS_JA: Record<string, PersonalityDescription> = {
  相談相手タイプ: {
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
    shareText: "これ、あの人に見せたい。",
  },
  万能助手タイプ: {
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
    shareText: "心当たりある人、いません？",
  },
  情報通タイプ: {
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
    shareText: "情報収集が趣味の人、全員これ。",
  },
  研究者タイプ: {
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
    shareText: "うちの上司、絶対これ。",
  },
  秘書タイプ: {
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
    shareText: "効率の鬼、集まれ。",
  },
  自由人タイプ: {
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
