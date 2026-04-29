"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  return (
    <footer className="w-full border-t border-gray-100 py-6 mt-10">
      <div className="mx-auto max-w-2xl px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
        <p>Kompass © 2026</p>
        <div className="flex gap-4">
          <Link
            href="/terms"
            className="hover:text-gray-600 transition-colors"
          >
            {isEn ? "Terms" : "利用規約"}
          </Link>
          <Link
            href="/privacy"
            className="hover:text-gray-600 transition-colors"
          >
            {isEn ? "Privacy" : "プライバシーポリシー"}
          </Link>
          <a
            href={
              isEn
                ? "https://twitter.com/intent/tweet?text=I%20just%20took%20the%20AI%20Type%20Diagnosis!%20%23Kompass&url=https://usekompass.com/en"
                : "https://twitter.com/intent/tweet?text=AIタイプ診断やってみた！%20%23Kompass&url=https://usekompass.com/ja"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 transition-colors"
          >
            {isEn ? "X (Twitter)" : "X（旧Twitter）"}
          </a>
        </div>
      </div>
    </footer>
  );
}
