import Link from "next/link";

/**
 * トップページ（ロケール付き）— 仮構成：見出しと診断への導線のみ
 */
export default async function LocaleHomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Kompass
      </h1>
      <Link
        href={`/${locale}/diagnosis`}
        className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        診断を始める
      </Link>
    </main>
  );
}
