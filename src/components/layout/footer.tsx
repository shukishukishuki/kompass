import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 py-6 mt-10">
      <div className="mx-auto max-w-2xl px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
        <p>Kompass © 2026</p>
        <div className="flex gap-4">
          <Link
            href="/ja/terms"
            className="hover:text-gray-600 transition-colors"
          >
            利用規約
          </Link>
          <Link
            href="/ja/privacy"
            className="hover:text-gray-600 transition-colors"
          >
            プライバシーポリシー
          </Link>
          <a
            href="https://twitter.com/intent/tweet?text=AIタイプ診断やってみた！%20%23Kompass&url=https://kompass-rosy.vercel.app/ja"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 transition-colors"
          >
            X（旧Twitter）
          </a>
        </div>
      </div>
    </footer>
  );
}
