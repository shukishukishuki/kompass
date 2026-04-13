import Link from "next/link";
import { CharacterAvatar } from "@/components/lp/character-avatar";

const CTA_HREF = "https://kompass-rosy.vercel.app/ja/diagnosis";

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
    color: "#F5C518",
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

type LocaleCode = "ja" | "en";

interface LandingCopy {
  logo: string;
  headerCta: string;
  heroTag: string;
  heroTitle: string;
  heroSub: string;
  heroCta: string;
  heroNote: string;
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
    heroTitle: "AI使ってるのに、\nなんかしっくりこない人へ",
    heroSub: "10問でわかる、あなたに合うAIの使い方",
    heroCta: "無料で診断する（30秒）",
    heroNote: "登録不要ですぐ無料公開",
    empathyTitle: "こんなこと、ありませんか？",
    empathyItems: [
      "使ってるけど、しっくりこない",
      "毎回「それっぽい答え」しか返ってこない",
      "周りはうまく使ってるのに自分だけ遅れてる気がする",
      "ChatGPTとClaudeの違いが正直わからない",
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
    heroTitle: "Using AI already,\nbut it still feels off?",
    heroSub: "10 quick questions to find your best AI style",
    heroCta: "Start Free Diagnosis (30 sec)",
    heroNote: "No signup required",
    empathyTitle: "Does this sound familiar?",
    empathyItems: [
      "I use AI, but it still doesn't click",
      "I only get generic “sounds-right” answers",
      "Others seem ahead while I feel behind",
      "I honestly can't tell ChatGPT from Claude",
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

export default async function LocaleHomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const lc: LocaleCode = locale === "en" ? "en" : "ja";
  const copy = COPY_BY_LOCALE[lc];

  return (
    <main className="bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href={`/${locale}`} className="font-semibold tracking-tight">
            {copy.logo}
          </Link>
          <a
            href={CTA_HREF}
            className="rounded-full bg-[#52B788] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-95 sm:text-sm"
          >
            {copy.headerCta}
          </a>
        </div>
      </header>

      <section className="bg-[#f0faf4] px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="inline-flex rounded-full border border-[#52B788]/20 bg-white px-3 py-1 text-xs font-medium text-[#2f6c56]">
            {copy.heroTag}
          </p>
          <h1 className="mt-6 text-4xl leading-tight font-extrabold whitespace-pre-line text-slate-900 md:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-700 md:text-xl">
            {copy.heroSub}
          </p>
          <a
            href={CTA_HREF}
            className="mt-8 inline-flex rounded-full bg-[#52B788] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#52B788]/30 transition hover:brightness-95 md:text-base"
          >
            {copy.heroCta}
          </a>
          <p className="mt-3 text-xs text-slate-500">{copy.heroNote}</p>
        </div>
      </section>

      <section className="px-4 py-16">
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

      <section className="bg-[#f8fafc] px-4 py-16">
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
              href={CTA_HREF}
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

      <section className="bg-[#f0faf4] px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {copy.bottomCtaTitle}
          </h2>
          <p className="mt-4 text-slate-600">{copy.bottomCtaSub}</p>
          <a
            href={CTA_HREF}
            className="mt-8 inline-flex rounded-full bg-[#52B788] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#52B788]/30 transition hover:brightness-95 md:text-base"
          >
            {copy.bottomCtaButton}
          </a>
        </div>
      </section>

      <footer className="border-t border-zinc-200 px-4 py-8 text-center text-sm text-slate-600">
        Kompass © 2026
      </footer>
    </main>
  );
}
