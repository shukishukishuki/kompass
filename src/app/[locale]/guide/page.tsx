import Link from "next/link";
import { getTypeCharacterByTypeId, type TypeId } from "@/lib/type-characters";

const GUIDE_CARD_ORDER: readonly TypeId[] = [
  "empath",
  "generalist",
  "scout",
  "analyst",
  "executive",
  "orchestrator",
] as const;

/**
 * AIガイド一覧ページ
 */
export default async function GuidePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const title =
    locale === "en"
      ? "Are you really using AI well?"
      : "あなたのAI、ちゃんと使えてますか？";
  const subtitle =
    locale === "en"
      ? "Knowing type-based usage patterns changes AI answers."
      : "タイプ別の使い方を知ると、AIの答えが変わります";
  const commonTips = [
    "AIは1回で使い切るな（3往復して初めて価値が出る）",
    "最初に「役割と目的」を伝える",
    "「なぜそう思う？」で深掘りする",
  ] as const;

  return (
    <main className="bg-[#f8f7ff] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-center text-3xl font-bold text-slate-900 md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-center text-sm text-slate-600 md:text-base">
          {subtitle}
        </p>

        <section className="mt-10">
          <div className="grid grid-cols-2 gap-4">
            {GUIDE_CARD_ORDER.map((typeId) => {
              const character = getTypeCharacterByTypeId(typeId);
              if (character === null) {
                return null;
              }
              return (
                <Link
                  key={typeId}
                  href={`/${locale}/guide/${typeId}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {character.characterName}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                    {character.typeEn}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">共通Tips</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
            {commonTips.map((tip, idx) => (
              <li key={tip}>
                {idx + 1}. {tip}
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/diagnosis`}
            className="inline-flex rounded-full bg-[#52B788] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            まだ診断していない人はこちら →
          </Link>
        </div>
      </div>
    </main>
  );
}
