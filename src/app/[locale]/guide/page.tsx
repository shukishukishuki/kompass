import Link from "next/link";
import { TYPE_CHARACTERS } from "@/lib/type-characters";

interface GuidePageCopy {
  title: string;
  subtitle: string;
  preparing: string;
  cta: string;
}

const COPY_BY_LOCALE: Record<"ja" | "en", GuidePageCopy> = {
  ja: {
    title: "AIの使い方ガイド",
    subtitle: "タイプ別の実践ガイドを順次公開します。",
    preparing: "準備中",
    cta: "まず診断してみる →",
  },
  en: {
    title: "AI Usage Guide",
    subtitle: "Practical guides by type are coming soon.",
    preparing: "Coming soon",
    cta: "Try diagnosis first →",
  },
};

/**
 * AIガイド一覧ページ
 */
export default async function GuidePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const lc = locale === "en" ? "en" : "ja";
  const copy = COPY_BY_LOCALE[lc];

  return (
    <main className="bg-[#f8f7ff] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-center text-3xl font-bold text-slate-900 md:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-3 text-center text-sm text-slate-600 md:text-base">
          {copy.subtitle}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TYPE_CHARACTERS.map((character) => (
            <article
              key={character.typeJa}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{character.typeJa}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                {character.typeEn}
              </p>
              <p className="mt-4 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                {copy.preparing}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={`/${locale}/diagnosis`}
            className="inline-flex rounded-full bg-[#52B788] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </main>
  );
}
