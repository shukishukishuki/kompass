/**
 * 移行ガイドページ（プレースホルダー）
 */
export default async function GuideSlugPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">移行ガイド</h1>
      <p className="mt-2 text-sm text-zinc-600">{slug}</p>
    </main>
  );
}
