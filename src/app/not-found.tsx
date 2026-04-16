import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">ページが見つかりません</h1>
      <p className="text-sm text-gray-500 mb-8">
        URLが間違っているか、ページが移動・削除された可能性があります。
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/ja"
          className="rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-gray-700 transition-colors"
        >
          トップへ戻る
        </Link>
        <Link
          href="/ja/diagnosis"
          className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          診断してみる →
        </Link>
        <Link
          href="/ja/types"
          className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          タイプ一覧を見る
        </Link>
      </div>
    </main>
  );
}
