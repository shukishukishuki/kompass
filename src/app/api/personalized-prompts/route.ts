import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AI_KINDS, type AiKind } from "@/types/ai";

interface PersonalizedPrompt {
  title: string;
  prompt: string;
}

interface PersonalizedPromptsBody {
  typeId: string;
  answers: Record<string, string>;
}

const client = new Anthropic();

const TYPE_LABELS: Record<AiKind, string> = {
  claude: "共感ジャンキー",
  chatgpt: "丸投げ屋",
  gemini: "情報スナイパー",
  perplexity: "裏取りマニア",
  copilot: "整理の鬼",
  jiyujin: "AI遊牧民",
};

function isRecordOfString(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.values(value).every((v) => typeof v === "string");
}

function isBody(value: unknown): value is PersonalizedPromptsBody {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return typeof o.typeId === "string" && isRecordOfString(o.answers);
}

function sanitizePrompts(value: unknown): PersonalizedPrompt[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const out: PersonalizedPrompt[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const o = item as Record<string, unknown>;
    if (typeof o.title !== "string" || typeof o.prompt !== "string") {
      continue;
    }
    const title = o.title.trim();
    const prompt = o.prompt.trim();
    if (title === "" || prompt === "") {
      continue;
    }
    out.push({ title, prompt });
  }
  return out.slice(0, 3);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ prompts: [] }, { status: 400 });
  }
  if (!isBody(body)) {
    return NextResponse.json({ prompts: [] }, { status: 400 });
  }

  const aiKind = (AI_KINDS as readonly string[]).includes(body.typeId)
    ? (body.typeId as AiKind)
    : null;
  const typeLabel = aiKind !== null ? TYPE_LABELS[aiKind] : body.typeId;
  const layer4Lines = Object.entries(body.answers)
    .map(([q, a]) => `- ${q}: ${a}`)
    .join("\n");

  const prompt = `あなたはAI活用の専門家です。
以下のユーザー情報をもとに、そのユーザーがすぐに使えるAIプロンプトを3本作成してください。

ユーザーのAIタイプ: ${typeLabel}
Layer4回答:
${layer4Lines}

条件:
- 各プロンプトは実際にAIチャットに貼り付けてすぐ使えるもの
- 抽象的なものではなく、具体的なシチュエーションに即したもの
- ユーザーの職種・目的・悩みを反映した一点もの
- 各プロンプトに15字以内のタイトルをつける

以下のJSON形式のみで返してください。前置きや説明は不要です：
[
  {"title": "タイトル1", "prompt": "プロンプト本文1"},
  {"title": "タイトル2", "prompt": "プロンプト本文2"},
  {"title": "タイトル3", "prompt": "プロンプト本文3"}
]`;

  try {
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    const text =
      message.content[0] !== undefined && message.content[0].type === "text"
        ? message.content[0].text
        : "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const prompts = sanitizePrompts(JSON.parse(clean));
    return NextResponse.json({ prompts });
  } catch {
    return NextResponse.json({ prompts: [] }, { status: 500 });
  }
}
