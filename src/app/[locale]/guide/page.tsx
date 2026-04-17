import Image from "next/image";
import Link from "next/link";
import { AI_THEME_COLORS } from "@/types/ai";

export async function generateMetadata() {
  return {
    title: "AI活用ガイド",
    description:
      "ChatGPT・Claude・Gemini・Perplexity・Copilotの特徴と使い分けを解説。あなたに合うAIの使い方を見つけよう。",
  };
}

interface AiGuide {
  id: string;
  name: string;
  color: string;
  tagline: string;
  readTime: string;
  description: string;
  bestFor: string[];
  free: boolean;
  url: string;
}

const AI_GUIDES: AiGuide[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    color: AI_THEME_COLORS.chatgpt,
    tagline: "なんでも屋の万能選手",
    readTime: "初心者向け",
    description:
      "文章・コード・翻訳・アイデア出しまで幅広く対応。迷ったらまずここ。無料枠が最も充実している。",
    bestFor: [
      "とにかく速く答えがほしい",
      "作業を丸投げしたい",
      "AIを使い始めたばかり",
    ],
    free: true,
    url: "https://chatgpt.com",
  },
  {
    id: "claude",
    name: "Claude",
    color: AI_THEME_COLORS.claude,
    tagline: "思考の深さで選ぶなら",
    readTime: "中級者向け",
    description:
      "長文の読解・複雑な思考整理・感情に寄り添った対話が得意。答えより過程を大事にしたい人向け。",
    bestFor: [
      "考えを整理・言語化したい",
      "長い文章を読み解きたい",
      "じっくり壁打ちしたい",
    ],
    free: true,
    url: "https://claude.ai",
  },
  {
    id: "gemini",
    name: "Gemini",
    color: AI_THEME_COLORS.gemini,
    tagline: "最新情報を即座に",
    readTime: "初心者向け",
    description:
      "Googleの検索力と連携。リアルタイム情報・画像理解・Googleサービスとの連携が強み。",
    bestFor: [
      "今起きていることを知りたい",
      "Googleと連携したい",
      "画像と一緒に使いたい",
    ],
    free: true,
    url: "https://gemini.google.com",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: AI_THEME_COLORS.perplexity,
    tagline: "根拠付きで調べるなら",
    readTime: "中級者向け",
    description:
      "回答に出典・ソースが明示される。「それ本当に正しいの？」が気になる人に最適。",
    bestFor: [
      "情報の裏取りをしたい",
      "出典・ソースを確認したい",
      "リサーチ・調査が多い",
    ],
    free: true,
    url: "https://perplexity.ai",
  },
  {
    id: "copilot",
    name: "Copilot",
    color: AI_THEME_COLORS.copilot,
    tagline: "仕事の整理・構造化に",
    readTime: "ビジネス向け",
    description:
      "Microsoft Officeとの連携が強力。Word・Excel・Teamsで使えば業務効率が大幅アップ。",
    bestFor: [
      "Office系ツールをよく使う",
      "情報を整理・構造化したい",
      "職場で使いたい",
    ],
    free: true,
    url: "https://copilot.microsoft.com",
  },
];

/**
 * AI活用ガイド一覧ページ
 */
export default async function GuidePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <main className="bg-[#f8f7ff] px-4 py-10">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="mb-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
          AI USAGE GUIDE
        </p>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          主要AIの特徴と使い分け
        </h1>
        <p className="text-sm leading-relaxed text-gray-500">
          ChatGPT・Claude・Gemini・Perplexity・Copilot——それぞれ得意なことが違います。あなたに合ったAIを知るには、まず診断してみてください。
        </p>
      </div>
      <div className="mx-auto max-w-2xl space-y-4 px-6 pb-6">
        {AI_GUIDES.map((ai) => (
          <a
            key={ai.id}
            href={ai.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 block hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: ai.color }}
                />
                <span className="font-bold text-gray-900">{ai.name}</span>
                <span className="text-xs text-gray-400">{ai.tagline}</span>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  {ai.readTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {ai.free ? (
                  <span className="text-xs rounded-full px-2 py-0.5 bg-green-100 text-green-700 font-medium">
                    無料あり
                  </span>
                ) : null}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              {ai.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {ai.bestFor.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: `${ai.color}CC` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              WEEKLY TOPICS
            </p>
            <span className="text-xs rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 font-medium">
              coming soon
            </span>
          </div>
          <p className="text-sm font-bold text-gray-700">今週のAI最新トピック</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            毎週月曜日に更新予定。ChatGPT・Claude・Geminiなど主要AIの最新情報を
            あなたのタイプ別視点でお届けします。1,000ユーザー達成後に開始。
          </p>
          <p className="text-xs text-gray-300">メール登録で更新通知を受け取れます →</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-6">
        <p className="mb-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
          TYPE GUIDE
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              id: "claude",
              name: "共感ジャンキー",
              color: AI_THEME_COLORS.claude,
              img: "/images/kompass_char_01_empath.png",
            },
            {
              id: "copilot",
              name: "整理の鬼",
              color: AI_THEME_COLORS.copilot,
              img: "/images/kompass_char_02_executor.png",
            },
            {
              id: "perplexity",
              name: "裏取りマニア",
              color: AI_THEME_COLORS.perplexity,
              img: "/images/kompass_char_03_analyst.png",
            },
            {
              id: "chatgpt",
              name: "丸投げ屋",
              color: AI_THEME_COLORS.chatgpt,
              img: "/images/kompass_char_04_generalist.png",
            },
            {
              id: "gemini",
              name: "情報スナイパー",
              color: AI_THEME_COLORS.gemini,
              img: "/images/kompass_char_05_scout.png",
            },
            {
              id: "jiyujin",
              name: "AI遊牧民",
              color: AI_THEME_COLORS.jiyujin,
              img: "/images/kompass_char_06_nomad.png",
            },
          ].map((type) => (
            <a
              key={type.id}
              href={`/${locale}/guide/${type.id}`}
              className="flex items-center gap-3 overflow-visible rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-visible rounded-full">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: `${type.color}33` }}
                />
                <Image
                  src={type.img}
                  alt={type.name}
                  width={92}
                  height={92}
                  className="absolute bottom-0 left-1/2 h-[92px] w-[92px] -translate-x-1/2 object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-medium text-gray-800">{type.name}</span>
                <span
                  className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: type.color }}
                >
                  TYPE GUIDE
                </span>
              </div>
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="ml-auto text-xs text-gray-400">→</span>
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-10">
        <div className="rounded-2xl bg-gray-900 p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white mb-1">あなたのAIタイプは？</p>
            <p className="text-xs text-gray-400">10問・無料・登録不要</p>
          </div>
          <Link
            href={`/${locale}/diagnosis`}
            className="shrink-0 rounded-full bg-white px-5 py-2 text-xs font-bold text-gray-900 hover:bg-gray-100 transition-colors"
          >
            診断する →
          </Link>
        </div>
      </div>
    </main>
  );
}
