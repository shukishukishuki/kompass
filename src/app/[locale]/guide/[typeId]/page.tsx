import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PromptList } from "@/components/guide/prompt-list";
import { getTypeCharacterByTypeId, hexToRgba, type TypeId } from "@/lib/type-characters";
import { AI_THEME_COLORS, type AiKind } from "@/types/ai";

interface GuideDetailContent {
  oneShotCopy: string;
  whenToUse: string;
  strengths: [string, string];
  prompts: readonly string[];
  ngUsages: [string, string];
  quickUseButtons: readonly {
    label: string;
    href: string;
  }[];
}

const GUIDE_DETAILS: Record<TypeId, GuideDetailContent> = {
  empath: {
    oneShotCopy: "考える前の思考を扱うAI",
    whenToUse:
      "頭の中がモヤモヤしているとき。何が問題かわかる前に、まず話しかける。答えを求めるより「整理したい」ときに使う。",
    strengths: [
      "感情や曖昧な言葉をそのまま受け取ってくれる",
      "「なぜそう感じたのか」を一緒に掘り下げてくれる",
    ],
    prompts: [
      "あなたは私の思考整理のパートナーです。答えを出すより先に、私が何を感じているかを一緒に言語化してください。",
      "今こんな状況で困っています。解決策より先に、状況を整理するのを手伝ってください：[状況を書く]",
      "これについてどう思うか、まず私の話を聞いてください。判断はしないでください：[話したいことを書く]",
      "[文章や企画]を読んで、私が本当に伝えたいことが伝わっているか教えてください。",
      "この選択肢で迷っています。どちらが正しいかではなく、私が何を優先しているかを引き出してください：[選択肢を書く]",
    ],
    ngUsages: [
      "最新ニュースや今日の株価を聞く",
      "「これで合ってますか？」と1回で終わらせる",
    ],
    quickUseButtons: [{ label: "Claudeを開く", href: "https://claude.ai" }],
  },
  generalist: {
    oneShotCopy: "とりあえず出すなら最速",
    whenToUse:
      "とにかく最初のアウトプットを出したいとき。考えすぎて手が止まっているとき。まず叩き台が欲しいとき。",
    strengths: [
      "指示が曖昧でも形にしてくれる",
      "文章・企画・コード・要約・翻訳、何でも一発対応",
    ],
    prompts: [
      "以下の内容について、まず最速でアウトプットを出してください。精度より速度優先です：[内容]",
      "[タスク]をやりたいです。何から始めればいいか、手順をざっくり教えてください。",
      "これを[形式]にしてください：[素材を貼る]",
      "[文章]を半分の長さに要約してください。",
      "アイデアを10個出してください。質より量で。テーマ：[テーマ]",
    ],
    ngUsages: ["深い感情的な相談", "出典や根拠が重要な調べもの"],
    quickUseButtons: [{ label: "ChatGPTを開く", href: "https://chatgpt.com" }],
  },
  scout: {
    oneShotCopy: "今この瞬間の正解を取りに行くAI",
    whenToUse:
      "最新情報が必要なとき。Googleで調べるより早く答えが欲しいとき。今起きていることを知りたいとき。",
    strengths: [
      "Googleと直結しているので情報が新しい",
      "動画・画像・テキストを同時に扱える",
    ],
    prompts: [
      "今この瞬間の最新情報を教えてください。情報源も明示してください：[調べたいこと]",
      "[トピック]について、最近1ヶ月以内の動向を教えてください。",
      "[商品・サービス名]の最新の評判・レビューをまとめてください。",
      "[競合他社名]が最近何をやっているか調べてください。",
      "これについてYouTubeやSNSで話題になっていることを教えてください：[テーマ]",
    ],
    ngUsages: ["感情的な相談", "深い思考の壁打ち"],
    quickUseButtons: [{ label: "Geminiを開く", href: "https://gemini.google.com" }],
  },
  analyst: {
    oneShotCopy: "“それ本当？”を潰すAI",
    whenToUse:
      "情報の根拠が欲しいとき。ChatGPTの答えを検証したいとき。重要な判断をする前に裏を取りたいとき。",
    strengths: [
      "回答に出典URLが必ずつく",
      "複数ソースを横断して答えを組み立てる",
    ],
    prompts: [
      "以下の内容について、根拠・出典・反論の余地を含めて教えてください：[内容]",
      "[主張や情報]は本当ですか？根拠となるソースとともに教えてください。",
      "[テーマ]について、信頼できる情報源をもとに現状をまとめてください。",
      "[AIが出した回答を貼り付ける]、これは正確ですか？確認してください。",
      "[テーマ]のメリット・デメリットを、それぞれ出典付きで教えてください。",
    ],
    ngUsages: ["感情や創作系のタスク", "スピード重視の叩き台出し"],
    quickUseButtons: [
      { label: "Perplexityを開く", href: "https://www.perplexity.ai" },
    ],
  },
  executive: {
    oneShotCopy: "仕事を人間より整理するAI",
    whenToUse:
      "WordやExcel、OutlookなどMicrosoft製品を使っているとき。資料をまとめたり、メールを整理したり、業務フローを作りたいとき。",
    strengths: [
      "Microsoft 365と直接連携できる",
      "会議の要約・メール作成・スプレッドシート操作が得意",
    ],
    prompts: [
      "以下の情報を構造化・整理してください。見やすい形式で出力してください：[情報]",
      "この会議メモを要点だけにまとめてください：[メモを貼る]",
      "[資料の内容]をもとに、提案書の骨子を作ってください。",
      "このメールに返信する文章を、丁寧なビジネス口調で書いてください：[メール内容]",
      "[タスク一覧]を優先順位と担当者つきの表に整理してください。",
    ],
    ngUsages: [
      "Google系ツールとの連携（非対応）",
      "感情的な相談・創作",
    ],
    quickUseButtons: [
      {
        label: "Copilotを開く",
        href: "https://copilot.microsoft.com",
      },
    ],
  },
  orchestrator: {
    oneShotCopy: "AIを使う側に回った人",
    whenToUse:
      "1つのAIでは足りないと気づいたとき。タスクによってAIを使い分けられるようになったとき。",
    strengths: [
      "各AIの強みを理解して使い分けられる",
      "AIの進化に最速でついていける",
    ],
    prompts: [
      "【調査/Perplexity】[テーマ]について最新情報と根拠を集めてください。",
      "【整理/ChatGPT】以下の情報をもとに企画の叩き台を出してください：[情報]",
      "【深掘り/Claude】この企画の問題点と改善案を一緒に考えてください：[企画]",
      "【確認/Perplexity】この内容に事実誤認はありますか？ソース付きで確認してください：[最終版]",
      "【振り返り/Claude】今日のAI活用で何が効率化できて、何が足りなかったかを整理してください。",
    ],
    ngUsages: [
      "使い分けを意識せず「なんとなく使う」",
      "全部1つのAIに任せる",
    ],
    quickUseButtons: [
      { label: "Claude", href: "https://claude.ai" },
      { label: "ChatGPT", href: "https://chatgpt.com" },
      { label: "Perplexity", href: "https://www.perplexity.ai" },
    ],
  },
};

/**
 * guide の静的生成対象パラメータ
 */
export function generateStaticParams(): { typeId: TypeId }[] {
  return Object.keys(GUIDE_DETAILS).map((typeId) => ({
    typeId: typeId as TypeId,
  }));
}

/**
 * タイプ別のAIガイド詳細ページ
 */
export default async function GuideTypeDetailPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string; typeId: string }>;
}>) {
  const { locale, typeId } = await params;
  const content = GUIDE_DETAILS[typeId as TypeId];
  const character = getTypeCharacterByTypeId(typeId);
  if (content === undefined || character === null) {
    notFound();
  }
  const accentColor = AI_THEME_COLORS[character.aiKind];

  return (
    <main className="bg-[#f8f7ff] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href={`/${locale}/guide`}
          className="inline-flex text-sm font-medium text-slate-600 underline underline-offset-2"
        >
          ← ガイド一覧に戻る
        </Link>

        <section
          className="rounded-3xl border p-6 text-white shadow-sm md:p-10"
          style={{ backgroundColor: accentColor, borderColor: accentColor }}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <Image
              src={character.imageSrc}
              alt={character.characterName}
              width={180}
              height={180}
              className="h-[180px] w-[180px] object-contain"
              priority
            />
            <p className="text-sm uppercase tracking-wide text-white/90">
              {character.typeEn}
            </p>
            <h1 className="text-3xl font-extrabold md:text-4xl">
              {character.characterName}
            </h1>
            <p className="text-3xl font-black leading-tight md:text-5xl">
              {content.oneShotCopy}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">いつ使うか</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {content.whenToUse}
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">何が強いか</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            <li>{content.strengths[0]}</li>
            <li>{content.strengths[1]}</li>
          </ul>
        </section>

        <section
          className="rounded-2xl border p-6 shadow-sm"
          style={{
            backgroundColor: hexToRgba(accentColor, 0.08),
            borderColor: hexToRgba(accentColor, 0.35),
          }}
        >
          <h2 className="text-xl font-bold text-slate-900">プロンプト5個</h2>
          <p className="mt-2 text-sm text-slate-600">
            右のボタンでそのままコピーして使えます。
          </p>
          <div className="mt-4">
            <PromptList prompts={content.prompts} />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">NGな使い方</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            <li>{content.ngUsages[0]}</li>
            <li>{content.ngUsages[1]}</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">今すぐ使う</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {content.quickUseButtons.map((button) => (
              <a
                key={button.label}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                style={{ backgroundColor: accentColor }}
              >
                {button.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
