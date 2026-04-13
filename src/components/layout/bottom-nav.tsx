"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { BarChart2, BookOpen, Compass, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  locale: string;
}

interface BottomNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
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
 * スマホ向けの下部タブナビゲーション
 */
export function BottomNav({ locale }: Readonly<BottomNavProps>) {
  const pathname = usePathname();
  const items: BottomNavItem[] = [
    { label: "診断", href: `/${locale}/diagnosis`, icon: Compass },
    { label: "タイプ", href: `/${locale}/types`, icon: Users },
    { label: "AIガイド", href: `/${locale}/guide`, icon: BookOpen },
    { label: "マイ結果", href: `/${locale}/diagnosis/result`, icon: BarChart2 },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white md:hidden"
      aria-label="下部ナビゲーション"
    >
      <ul className="grid h-16 grid-cols-4">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition",
                  active ? "text-[#2f6c56]" : "text-zinc-500"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-[#52B788]" : "text-zinc-400"
                  )}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
