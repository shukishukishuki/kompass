import { GUIDE_DETAILS } from "@/lib/guide-details";
import { AI_KIND_TO_GUIDE } from "@/lib/type-id-map";
import { TYPE_CHARACTERS, type TypeId } from "@/lib/type-characters";

export interface FollowupEmailTemplate {
  subject: string;
  html: string;
}

const TYPE_ONE_LINE_DESCRIPTIONS: Record<TypeId, string> = {
  empath: "答えより先に、気持ちを整理したい人です。",
  generalist: "まず形にして、あとから考える人です。",
  scout: "最新情報をいち早くつかみたい人です。",
  analyst: "根拠なしには動けない、徹底的な検証主義者です。",
  executive: "整理されていないと動けない、構造化思考の持ち主です。",
  orchestrator: "1つのAIに縛られず、最適な選択肢を探し続ける自由人です。",
};

/**
 * 結果保存時に送る結果URLメールを作成する
 */
export function buildResultSaveEmailTemplate(): FollowupEmailTemplate {
  const subject = "【Kompass】診断結果を保存しました";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.75; padding: 16px;">
      <h1 style="font-size: 20px; margin: 0 0 14px;">${escapeHtml(subject)}</h1>
      <p style="margin: 0 0 10px;">診断お疲れ様でした！</p>
      <p style="margin: 0 0 6px;">あなたの診断結果はこちらから確認できます：</p>
      <p style="margin: 0 0 14px;">
        → <a href="https://kompass-rosy.vercel.app/ja/diagnosis/result">https://kompass-rosy.vercel.app/ja/diagnosis/result</a>
      </p>
      <p style="margin: 0 0 16px; color: #4b5563;">
        スマホやPCを変えたときもこのリンクから見返せます。<br />
        ブックマークしておくと便利です。
      </p>
    </div>
  `;
  return { subject, html };
}

function resolveTypeId(aiType: string): TypeId | null {
  const raw = aiType.trim();
  if (raw === "") {
    return null;
  }
  const lower = raw.toLowerCase();
  if (
    lower === "empath" ||
    lower === "generalist" ||
    lower === "scout" ||
    lower === "analyst" ||
    lower === "executive" ||
    lower === "orchestrator"
  ) {
    return lower;
  }
  const mapped = AI_KIND_TO_GUIDE[lower];
  if (mapped !== undefined) {
    return mapped as TypeId;
  }
  const byCharacter = TYPE_CHARACTERS.find(
    (item) =>
      item.typeJa === raw ||
      item.characterName === raw ||
      item.typeEn.toLowerCase() === lower
  );
  return byCharacter?.typeId ?? null;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * タイプ別×Layer別のフォローアップメール本文を作成する
 */
export function buildFollowupEmailTemplate(
  aiType: string,
  _layerCompleted: number
): FollowupEmailTemplate {
  const typeId = resolveTypeId(aiType) ?? "generalist";
  const character = TYPE_CHARACTERS.find((item) => item.typeId === typeId);
  const content = GUIDE_DETAILS[typeId];
  const typeLabel = character?.characterName ?? "AIタイプ";
  const prompts = content.prompts.slice(0, 3);
  const typeDescription = TYPE_ONE_LINE_DESCRIPTIONS[typeId];
  const subject = `【Kompass】${typeLabel}のあなたへ：今日から使えるAI活用法`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.75; padding: 16px;">
      <h1 style="font-size: 20px; margin: 0 0 14px;">${escapeHtml(subject)}</h1>
      <p style="margin: 0 0 12px;">
        診断お疲れ様でした。<br><br>
        あなたは「${escapeHtml(typeLabel)}」タイプです。<br>
        ${escapeHtml(typeDescription)}<br><br>
        ---<br><br>
        あなたに合った最適なAIへの指示文を用意しました。<br><br>
        ■ 今すぐ使える3つのプロンプト<br><br>
        1. ${escapeHtml(prompts[0]?.title ?? "シーン1")}<br>
        「${escapeHtml(prompts[0]?.prompt ?? "")}」<br><br>
        2. ${escapeHtml(prompts[1]?.title ?? "シーン2")}<br>
        「${escapeHtml(prompts[1]?.prompt ?? "")}」<br><br>
        3. ${escapeHtml(prompts[2]?.title ?? "シーン3")}<br>
        「${escapeHtml(prompts[2]?.prompt ?? "")}」<br><br>
        ---<br><br>
        ＊プロンプトとは、AIへの「指示文」のことです。<br>
        [ ]内はAIに相談したいことを自由に書き換えて、そのままAIに貼り付けてください。<br><br>
        診断結果はこちら：<br>
        https://kompass-rosy.vercel.app/ja/diagnosis/result<br><br>
        Kompass
      </p>
    </div>
  `;

  return { subject, html };
}
