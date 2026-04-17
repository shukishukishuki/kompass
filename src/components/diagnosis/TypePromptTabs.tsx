"use client";

import { useState, type CSSProperties } from "react";
import { PromptList } from "@/components/guide/prompt-list";
import { GUIDE_DETAILS } from "@/lib/guide-details";
import {
  hexToRgba,
  TYPE_CHARACTERS,
  type TypeId,
} from "@/lib/type-characters";
import { cn } from "@/lib/utils";

interface TypePromptTabsProps {
  /** 表示上の自分のタイプID（result 側で確定済み） */
  userTypeId: TypeId;
  /** X シェア用の intent URL（既存の twitterUrl を渡す） */
  twitterShareHref: string;
}

/**
 * 6タイプ分のガイドプロンプトをタブで切り替え。
 * 自分のタイプのみ通常表示し、他タイプはブラー＋シェア誘導オーバーレイ。
 */
export function TypePromptTabs({
  userTypeId,
  twitterShareHref,
}: Readonly<TypePromptTabsProps>) {
  const [activeTypeId, setActiveTypeId] = useState<TypeId>(userTypeId);

  const shareOverlay = (
    <>
      <p className="max-w-md text-center text-sm font-medium leading-relaxed text-gray-800">
        他のタイプのプロンプトを見るには、友達にKompassを試してもらおう 👉
      </p>
      <a
        href={twitterShareHref}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-700"
      >
        シェアする
      </a>
    </>
  );

  return (
    <section
      className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      aria-label="タイプ別プロンプト集"
    >
      <h2 className="text-base font-bold text-slate-900">
        AI活用ガイドのプロンプト
      </h2>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        ガイドページと同じ5本をタイプ別に表示します。あなたのタイプ以外はシェアで解放のイメージです。
      </p>

      <div
        className="mt-4 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="タイプ選択"
      >
        {TYPE_CHARACTERS.map((char) => {
          const isUser = char.typeId === userTypeId;
          const isActive = char.typeId === activeTypeId;
          const userTabStyle: CSSProperties | undefined = isUser
            ? {
                borderColor: char.theme.primary,
                backgroundColor: hexToRgba(
                  char.theme.primary,
                  isActive ? 0.18 : 0.1
                ),
                color: char.theme.cText,
              }
            : undefined;
          return (
            <button
              key={char.typeId}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveTypeId(char.typeId);
              }}
              className={cn(
                "shrink-0 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
                isActive && "z-[1] shadow-sm",
                !isUser &&
                  !isActive &&
                  "border-transparent bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200/80",
                !isUser &&
                  isActive &&
                  "border-zinc-200 bg-white text-zinc-900"
              )}
              style={userTabStyle}
            >
              {char.characterName}
            </button>
          );
        })}
      </div>

      <div className="mt-4" role="tabpanel">
        <PromptList
          prompts={GUIDE_DETAILS[activeTypeId].prompts}
          previewLocked={activeTypeId !== userTypeId}
          previewOverlay={activeTypeId !== userTypeId ? shareOverlay : null}
        />
      </div>
    </section>
  );
}
