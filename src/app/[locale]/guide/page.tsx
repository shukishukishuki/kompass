import Link from "next/link";

interface AiGuide {
  id: string;
  name: string;
  color: string;
  tagline: string;
  description: string;
  bestFor: string[];
  url: string;
}

const AI_GUIDES: AiGuide[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    color: "#10A37F",
    tagline: "なんでも屋の万能選手",
    description:
      "文章・コード・翻訳・アイデア出しまで幅広く対応。迷ったらまずここ。無料枠が最も充実している。",
    bestFor: [
      "とにかく速く答えがほしい",
      "作業を丸投げしたい",
      "AIを使い始めたばかり",
    ],
    url: "https://chatgpt.com",
  },
  {
    id: "claude",
    name: "Claude",
    color: "#CC785C",
    tagline: "思考の深さで選ぶなら",
    description:
      "長文の読解・複雑な思考整理・感情に寄り添った対話が得意。答えより過程を大事にしたい人向け。",
    bestFor: [
      "考えを整理・言語化したい",
      "長い文章を読み解きたい",
      "じっくり壁打ちしたい",
    ],
    url: "https://claude.ai",
  },
  {
    id: "gemini",
    name: "Gemini",
    color: "#4285F4",
    tagline: "最新情報を即座に",
    description:
      "Googleの検索力と連携。リアルタイム情報・画像理解・Googleサービスとの連携が強み。",
    bestFor: [
      "今起きていることを知りたい",
      "Googleと連携したい",
      "画像と一緒に使いたい",
    ],
    url: "https://gemini.google.com",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: "#20B2AA",
    tagline: "根拠付きで調べるなら",
    description:
      "回答に出典・ソースが明示される。「それ本当に正しいの？」が気になる人に最適。",
    bestFor: [
      "情報の裏取りをしたい",
      "出典・ソースを確認したい",
      "リサーチ・調査が多い",
    ],
    url: "https://perplexity.ai",
  },
  {
    id: "copilot",
    name: "Copilot",
    color: "#0078D4",
    tagline: "仕事の整理・構造化に",
    description:
      "Microsoft Officeとの連携が強力。Word・Excel・Teamsで使えば業務効率が大幅アップ。",
    bestFor: [
      "Office系ツールをよく使う",
      "情報を整理・構造化したい",
      "職場で使いたい",
    ],
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
          <div
            key={ai.id}
            className="space-y-3 rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: ai.color }}
                />
                <span className="font-bold text-gray-900">{ai.name}</span>
                <span className="text-xs text-gray-400">{ai.tagline}</span>
              </div>
              <a
                href={ai.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-gray-600"
              >
                試す →
              </a>
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
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-6">
        <p className="mb-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
          TYPE GUIDE
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "claude", name: "共感ジャンキー", color: "#CC785C" },
            { id: "copilot", name: "整理の鬼", color: "#0078D4" },
            { id: "perplexity", name: "裏取りマニア", color: "#20B2AA" },
            { id: "chatgpt", name: "丸投げ屋", color: "#10A37F" },
            { id: "gemini", name: "情報スナイパー", color: "#4285F4" },
            { id: "jiyujin", name: "AI遊牧民", color: "#7C3AED" },
          ].map((type) => (
            <a
              key={type.id}
              href={`/${locale}/guide/${type.id}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-sm font-medium text-gray-800">{type.name}</span>
              <span className="ml-auto text-xs text-gray-400">→</span>
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-10">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div>
            <p className="mb-1 text-sm font-bold text-gray-800">
              まだ診断していない方へ
            </p>
            <p className="text-xs text-gray-500">
              診断するとあなた専用のガイドが解放されます
            </p>
          </div>
          <Link
            href={`/${locale}/diagnosis`}
            className="shrink-0 rounded-full bg-gray-900 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700"
          >
            診断する →
          </Link>
        </div>
      </div>
    </main>
  );
}
