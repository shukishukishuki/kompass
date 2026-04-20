"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  locale: string;
}

interface NavItem {
  label: string;
  href: string;
}

/**
 * 指定パスがリンクの配下にいるかを判定する
 */
function isActivePath(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }
  return pathname.startsWith(`${href}/`);
}

/**
 * PC向けの上部ナビゲーション
 */
export function Header({ locale }: Readonly<HeaderProps>) {
  const pathname = usePathname();
  const isEn = locale === "en";
  const navItems: NavItem[] = [
    { label: isEn ? "Diagnosis" : "診断", href: `/${locale}/diagnosis` },
    { label: isEn ? "Types" : "タイプ", href: `/${locale}/types` },
    { label: isEn ? "AI Guide" : "AI活用ガイド", href: `/${locale}/guide` },
    { label: isEn ? "My Results" : "マイ結果", href: `/${locale}/diagnosis/result` },
  ];

  return (
    <header className="sticky top-0 z-30 hidden border-b border-zinc-200 bg-white md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 text-[#1a7a4a]"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 4l2.2 8L12 20l-2.2-8L12 4z" fill="currentColor" />
            <path d="M12 4l8 8h-8l-8-8h8z" fill="currentColor" opacity="0.25" />
          </svg>
          Kompass
        </Link>
        <nav aria-label={isEn ? "Main navigation" : "メインナビゲーション"} className="flex items-center gap-2">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-[#52B788]/15 text-[#2f6c56]"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href={`/${locale}/diagnosis`}
          className="rounded-full bg-[#52B788] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
        >
          {isEn ? "Start" : "診断を始める"}
        </Link>
      </div>
    </header>
  );
}
