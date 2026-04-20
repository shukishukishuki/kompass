import Link from "next/link";
import { CharacterAvatar } from "@/components/lp/character-avatar";
import { AI_KIND_TO_GUIDE } from "@/lib/type-id-map";
import { AI_THEME_COLORS } from "@/types/ai";

interface CharacterCard {
  nameJa: string;
  nameEn: string;
  recommendedAi: string;
  color: string;
  imageSrc: string;
}

const CHARACTER_CARDS: CharacterCard[] = [
  {
    nameJa: "共感ジャンキー",
    nameEn: "The Confidant",
    recommendedAi: "Claude",
    color: "#52B788",
    imageSrc: "/images/kompass_char_01_empath.png",
  },
  {
    nameJa: "整理の鬼",
    nameEn: "The Executive",
    recommendedAi: "Copilot",
    color: "#4A7FC1",
    imageSrc: "/images/kompass_char_02_executor.png",
  },
  {
    nameJa: "裏取りマニア",
    nameEn: "The Analyst",
    recommendedAi: "Perplexity",
    color: "#9B4DCA",
    imageSrc: "/images/kompass_char_03_analyst.png",
  },
  {
    nameJa: "丸投げ屋",
    nameEn: "The Generalist",
    recommendedAi: "ChatGPT",
    color: "#E8A020",
    imageSrc: "/images/kompass_char_04_generalist.png",
  },
  {
    nameJa: "情報スナイパー",
    nameEn: "The Scout",
    recommendedAi: "Gemini",
    color: "#F07C2A",
    imageSrc: "/images/kompass_char_05_scout.png",
  },
  {
    nameJa: "AI遊牧民",
    nameEn: "The Orchestrator",
    recommendedAi: "複数AI",
    color: "#C9A84C",
    imageSrc: "/images/kompass_char_06_nomad.png",
  },
];

const TYPE_PREVIEWS = [
  {
    id: "claude",
    name: "共感ジャンキー",
    en: "The Confidant",
    color: AI_THEME_COLORS.claude,
    catch: "答えより、わかってほしかった。",
    img: "/images/kompass_char_01_empath.png",
  },
  {
    id: "copilot",
    name: "整理の鬼",
    en: "The Executive",
    color: AI_THEME_COLORS.copilot,
    catch: "混沌を見ると、手を動かしたくなる。",
    img: "/images/kompass_char_02_executor.png",
  },
  {
    id: "perplexity",
    name: "裏取りマニア",
    en: "The Analyst",
    color: AI_THEME_COLORS.perplexity,
    catch: "「たぶん」で動くのは無理。",
    img: "/images/kompass_char_03_analyst.png",
  },
  {
    id: "chatgpt",
    name: "丸投げ屋",
    en: "The Generalist",
    color: AI_THEME_COLORS.chatgpt,
    catch: "考えるより、投げた方が早い。",
    img: "/images/kompass_char_04_generalist.png",
  },
  {
    id: "gemini",
    name: "情報スナイパー",
    en: "The Scout",
    color: AI_THEME_COLORS.gemini,
    catch: "いらない情報、本当にいらない。",
    img: "/images/kompass_char_05_scout.png",
  },
  {
    id: "jiyujin",
    name: "AI遊牧民",
    en: "The Orchestrator",
    color: AI_THEME_COLORS.jiyujin,
    catch: "1つのAIで満足できたことがない。",
    img: "/images/kompass_char_06_nomad.png",
  },
] as const;

type LocaleCode = "ja" | "en";

interface LandingCopy {
  logo: string;
  headerCta: string;
  heroTag: string;
  heroLead: string;
  heroTitle: string;
  heroSub: string;
  heroCta: string;
  heroNote: string;
  heroBadge: string;
  empathyTitle: string;
  empathyItems: string[];
  typesTitle: string;
  typesSub: string;
  stepTitle: string;
  steps: { title: string; description: string }[];
  bottomCtaTitle: string;
  bottomCtaSub: string;
  bottomCtaButton: string;
  recommendedPrefix: string;
}

const COPY_BY_LOCALE: Record<LocaleCode, LandingCopy> = {
  ja: {
    logo: "Kompass",
    headerCta: "無料で診断する",
    heroTag: "AIをもっと自分らしく",
    heroLead:
      "ChatGPT・Claude・Gemini・Perplexity・Copilot——あなたの思考スタイルに合うAIを、診断で見つける。",
    heroTitle: "AI使ってるのに、\nなんかしっくりこない人へ",
    heroSub: "10問でわかる、あなたに合うAIの使い方",
    heroCta: "無料で診断する（30秒）",
    heroNote: "登録不要ですぐ無料公開",
    heroBadge: "✦ まず10問から ✦ 約1分〜 ✦ 登録不要",
    empathyTitle: "こんなこと、ありませんか？",
    empathyItems: [
      "毎回「それっぽい答え」しか返ってこない",
      "企画書の叩き台を出させたら、使えなかった",
      "調べものを頼んだら、古い情報が混じってた",
      "結局自分でやり直した",
    ],
    typesTitle: "6つのAI思考タイプ",
    typesSub: "あなたの本当の強みを引き出すAIはどれ？",
    stepTitle: "わずか30秒で自己発見",
    steps: [
      { title: "30秒で完了", description: "直感で答える10個の質問" },
      {
        title: "思考パターンを分類",
        description: "あなたの思考パターンを6タイプに分類",
      },
      {
        title: "最適なAIを提案",
        description: "明日から使える具体的な活用法がわかる",
      },
    ],
    bottomCtaTitle: "あなたの「型」を見つけよう",
    bottomCtaSub: "AIとの付き合い方が、今日から変わる。",
    bottomCtaButton: "無料で診断する（30秒）",
    recommendedPrefix: "おすすめ",
  },
  en: {
    logo: "Kompass",
    headerCta: "Start Free Diagnosis",
    heroTag: "Find your AI fit",
    heroLead:
      "ChatGPT, Claude, Gemini, Perplexity, and Copilot - find the AI that matches your thinking style.",
    heroTitle: "Stop settling.\nFind the AI that fits how you think.",
    heroSub: "You're not using the wrong AI. You're using it wrong.",
    heroCta: "Find your Base AI",
    heroNote: "No signup required",
    heroBadge: "Free · No sign-up · 10 questions to start",
    empathyTitle: "Does this sound familiar?",
    empathyItems: [
      'The AI always gives "pretty good" answers — nothing more',
      "You tried it for a work task. The output was unusable.",
      "You asked it to research something. It mixed in outdated info.",
      "You ended up doing it yourself anyway.",
    ],
    typesTitle: "6 AI Thinking Types",
    typesSub: "Which AI brings out your real strengths?",
    stepTitle: "Self-discovery in 30 seconds",
    steps: [
      { title: "Done in 30 sec", description: "10 instinctive questions" },
      {
        title: "Pattern classification",
        description: "Your thinking style mapped into 6 types",
      },
      {
        title: "Best AI recommendation",
        description: "Actionable ways you can use tomorrow",
      },
    ],
    bottomCtaTitle: "Find your own “type”",
    bottomCtaSub: "Your relationship with AI changes from today.",
    bottomCtaButton: "Start Free Diagnosis (30 sec)",
    recommendedPrefix: "Best with",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale === "en") {
    return {
      title: "Kompass | Find Your Perfect AI",
      description:
        "Discover which AI — ChatGPT, Claude, Gemini, Perplexity, or Copilot — fits your thinking style. Free, 40-question diagnosis.",
    };
  }

  return {
    title: "Kompass｜あなたに合うAIを40問で診断",
    description:
      "ChatGPT・Claude・Gemini・Perplexity・Copilotの中から、あなたの思考スタイルに最適なAIを診断。無料・登録不要・3〜5分。",
  };
}

export default async function LocaleHomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const lc: LocaleCode = locale === "en" ? "en" : "ja";
  const copy = COPY_BY_LOCALE[lc];
  const ctaHref = `https://kompass-rosy.vercel.app/${lc}/diagnosis`;

  return (
    <main className="bg-[#f8f7ff] text-slate-900">
      <section className="bg-[#fafafa] px-4 py-20 text-center opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-center gap-2">
            {[
              { src: "/images/kompass_char_01_empath.png", color: AI_THEME_COLORS.claude },
              { src: "/images/kompass_char_02_executor.png", color: AI_THEME_COLORS.copilot },
              { src: "/images/kompass_char_03_analyst.png", color: AI_THEME_COLORS.perplexity },
              { src: "/images/kompass_char_04_generalist.png", color: AI_THEME_COLORS.chatgpt },
              { src: "/images/kompass_char_05_scout.png", color: AI_THEME_COLORS.gemini },
              { src: "/images/kompass_char_06_nomad.png", color: AI_THEME_COLORS.jiyujin },
            ].map((char, i) => (
              <div
                key={i}
                className="h-20 w-20 overflow-visible rounded-full hover:scale-110 transition-transform duration-200 cursor-pointer"
                style={{ backgroundColor: `${char.color}33` }}
              >
                <img
                  src={char.src}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: 18,
              letterSpacing: "0.3em",
              color: "#555",
              fontWeight: 600,
              marginTop: 16,
              marginBottom: 20,
              fontFamily: "Georgia, serif",
            }}
          >
            — KOMPASS —
          </p>
          <h1
            className="whitespace-pre-line leading-tight text-slate-900"
            style={{
              fontWeight: 400,
              fontFamily: "Georgia, serif",
              fontSize: "clamp(28px, 4vw, 48px)",
            }}
          >
            {copy.heroTitle}
          </h1>
          <p className="mb-4 mt-4 text-center text-sm leading-relaxed text-gray-500">{copy.heroLead}</p>
          <p className="mt-0 text-center text-xs text-gray-400">
            {lc === "en" ? "Up to 40 questions if you want to go deeper" : "深く知りたい人は最大40問まで"}
          </p>
          <div className="mb-4 mt-4 flex flex-wrap justify-center gap-2">
            {[
              { name: "ChatGPT", color: AI_THEME_COLORS.chatgpt },
              { name: "Claude", color: AI_THEME_COLORS.claude },
              { name: "Gemini", color: AI_THEME_COLORS.gemini },
              { name: "Perplexity", color: AI_THEME_COLORS.perplexity },
              { name: "Copilot", color: AI_THEME_COLORS.copilot },
            ].map((ai) => (
              <span
                key={ai.name}
                className="rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: ai.color }}
              >
                {ai.name}
              </span>
            ))}
          </div>
          <p className="mx-auto mb-4 mt-0 max-w-2xl text-base text-slate-700 md:text-xl">
            {copy.heroSub}
          </p>
          <div className="mb-4 flex items-center justify-center text-xs text-gray-400">
            <span>{copy.heroBadge}</span>
          </div>
          <a
            href={ctaHref}
            className="inline-flex rounded-full bg-[#52B788] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#52B788]/30 transition hover:brightness-95 md:text-base"
          >
            {copy.heroCta}
          </a>
          <p className="mt-3 text-xs text-slate-500">{copy.heroNote}</p>
        </div>
      </section>

      <section className="bg-[#fff8f0] px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            {copy.empathyTitle}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {copy.empathyItems.map((item) => (
              <article
                key={item}
                className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm"
              >
                <span className="mr-2" aria-hidden>
                  😕
                </span>
                {item}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f0fff4] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            {copy.typesTitle}
          </h2>
          <p className="mt-3 text-center text-sm text-slate-600">{copy.typesSub}</p>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {CHARACTER_CARDS.map((card) => (
              <article
                key={card.nameEn}
                className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm"
              >
                <CharacterAvatar
                  src={card.imageSrc}
                  alt={card.nameJa}
                  color={card.color}
                />
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {card.nameJa}
                </h3>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
                  {card.nameEn}
                </p>
                <p className="mt-2 rounded-md bg-zinc-50 py-1 text-xs text-slate-600">
                  {copy.recommendedPrefix}: {card.recommendedAi}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a
              href={ctaHref}
              className="inline-flex rounded-full bg-[#52B788] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#52B788]/30 transition hover:brightness-95 md:text-base"
            >
              {copy.heroCta}
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            {copy.stepTitle}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {copy.steps.map((step, idx) => (
              <article
                key={step.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#52B788]/15 text-sm font-bold text-[#2f6c56]">
                  {idx + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f0ff] px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {copy.bottomCtaTitle}
          </h2>
          <p className="mt-4 text-slate-600">{copy.bottomCtaSub}</p>
          <a
            href={ctaHref}
            className="mt-8 inline-flex rounded-full bg-[#52B788] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#52B788]/30 transition hover:brightness-95 md:text-base"
          >
            {copy.bottomCtaButton}
          </a>
        </div>
      </section>

      <div className="flex items-center justify-center gap-6 py-6 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">6</p>
          <p className="text-xs text-gray-400">AIタイプ</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-gray-900">40</p>
          <p className="text-xs text-gray-400">診断問題数</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-gray-900">無料</p>
          <p className="text-xs text-gray-400">完全無料</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-gray-900">1分</p>
          <p className="text-xs text-gray-400">で診断完了</p>
        </div>
      </div>

      {/* タイプ紹介セクション */}
      <section className="mx-auto w-full max-w-2xl px-6 py-12">
        <p className="mb-2 text-center text-xs font-bold tracking-widest text-gray-400 uppercase">
          6 TYPES
        </p>
        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          あなたはどのタイプ？
        </h2>
        <p className="mb-8 text-center text-sm text-gray-500">
          思考スタイルで、あなたに合うAIが決まる。
        </p>

        <div className="grid grid-cols-2 gap-3">
          {TYPE_PREVIEWS.map((type) => (
            <Link
              key={type.id}
              href={`/${locale}/guide/${AI_KIND_TO_GUIDE[type.id] ?? type.id}`}
              className="block rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: `${type.color}15`,
                border: `1px solid ${type.color}33`,
              }}
            >
              <img
                src={type.img}
                alt={type.name}
                width={78}
                height={78}
                className="shrink-0 rounded-full object-contain"
                style={{ backgroundColor: `${type.color}33` }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">
                  {type.name}
                </p>
                <p className="mb-1 text-xs text-gray-400">{type.en}</p>
                <p className="text-xs leading-relaxed text-gray-600">
                  {type.catch}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={`/${locale}/diagnosis`}
            className="inline-block rounded-full bg-gray-900 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            診断してタイプを知る →
          </a>
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto px-6 py-10">
        <p className="text-center text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
          HOW IT WORKS
        </p>
        <h2 className="text-center text-xl font-bold text-gray-900 mb-8">
          3ステップで完了
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { step: "01", title: "診断する", desc: "10問に答えるだけ。約1分で完了。" },
            { step: "02", title: "タイプを知る", desc: "あなたの思考スタイルに合うAIが判明。" },
            { step: "03", title: "使い始める", desc: "専用プロンプトですぐにAIを活用。" },
          ].map((item) => (
            <div key={item.step} className="space-y-2">
              <p className="text-2xl font-bold text-gray-200">{item.step}</p>
              <p className="text-sm font-bold text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto px-6 py-10">
        <p className="text-center text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
          VOICES
        </p>
        <h2 className="text-center text-xl font-bold text-gray-900 mb-6">
          診断した人の声
        </h2>
        <div className="space-y-3">
          {[
            {
              type: "丸投げ屋",
              text: "ChatGPTをなんとなく使ってたけど、診断して使い方が変わった。作業が半分になった気がする。",
              role: "フリーランス / 30代",
            },
            {
              type: "裏取りマニア",
              text: "Perplexityは知ってたけど「自分向け」だとわかって初めてちゃんと使い始めた。",
              role: "マーケター / 20代",
            },
            {
              type: "共感ジャンキー",
              text: "Claudeって感情的な相談が得意なんですね。転職悩みを整理するのに使ってます。",
              role: "会社員 / 30代",
            },
          ].map((v, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed">「{v.text}」</p>
              <div className="flex items-center gap-2">
                <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                  {v.type}
                </span>
                <span className="text-xs text-gray-400">{v.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-center text-xl font-bold text-gray-900 mb-6">よくある質問</h2>
        <div className="space-y-3">
          {[
            {
              q: "診断は無料ですか？",
              a: "はい、完全無料です。登録も不要でそのまま診断できます。",
            },
            {
              q: "何問ありますか？",
              a: "まず10問で診断できます。深く知りたい方は最大40問まで回答できます。",
            },
            {
              q: "診断結果は保存されますか？",
              a: "診断結果はブラウザのセッションに保存されます。ブラウザを閉じると消えるため、結果はスクリーンショットやシェア機能でお手元に保存してください。",
            },
            {
              q: "どのAIが一番いいですか？",
              a: "「一番良いAI」は人によって違います。Kompassはあなたの思考スタイルに合ったAIを提案します。使い方次第でどのAIも強力なツールになります。",
            },
            {
              q: "診断結果が気に入らない場合は？",
              a: "何度でも診断し直せます。また、結果はあくまで参考です。気になる別のAIを試してみることも大切です。",
            },
          ].map((item, i) => (
            <details key={i} className="rounded-xl border border-gray-200 bg-white">
              <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-gray-800 list-none flex items-center justify-between group">
                {item.q}
                <span className="text-gray-400 text-xs ml-2 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto px-6 py-10 text-center">
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
          ABOUT
        </p>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Kompassについて</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Kompassは「思考スタイルで最適なAIを選ぶ」という新しい視点でAI選びを提案する診断サービスです。
          ChatGPT・Claude・Gemini・Perplexity・Copilotそれぞれの特性を分析し、あなたの思考パターンに本当に合う1つのAIを提案します。
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <span>✦ 2026年提供開始</span>
          <span>✦ 完全無料</span>
          <span>✦ 登録不要</span>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "診断は無料ですか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "はい、完全無料です。登録も不要でそのまま診断できます。",
                },
              },
              {
                "@type": "Question",
                name: "何問ありますか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "まず10問で診断できます。深く知りたい方は最大40問まで回答できます。",
                },
              },
              {
                "@type": "Question",
                name: "診断結果は保存されますか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "診断結果はブラウザのセッションに保存されます。ブラウザを閉じると消えるため、結果はスクリーンショットやシェア機能でお手元に保存してください。",
                },
              },
              {
                "@type": "Question",
                name: "どのAIが一番いいですか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "「一番良いAI」は人によって違います。Kompassはあなたの思考スタイルに合ったAIを提案します。",
                },
              },
              {
                "@type": "Question",
                name: "診断結果が気に入らない場合は？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "何度でも診断し直せます。また、結果はあくまで参考です。気になる別のAIを試してみることも大切です。",
                },
              },
            ],
          }),
        }}
      />

    </main>
  );
}
