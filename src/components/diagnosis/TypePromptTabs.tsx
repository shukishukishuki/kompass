"use client";

import { useEffect, useState, type CSSProperties } from "react";
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
  const isLockedTab =
    String(activeTypeId).trim() !== String(userTypeId).trim();

  useEffect(() => {
    console.log("[TypePromptTabs] userTypeId:", JSON.stringify(userTypeId));
    console.log("[TypePromptTabs] activeTypeId:", JSON.stringify(activeTypeId));
    console.log(
      "[TypePromptTabs] isLocked:",
      String(activeTypeId).trim() !== String(userTypeId).trim()
    );
  }, [activeTypeId, isLockedTab, userTypeId]);

  const shareOverlay = (
    <>
      <p style={{ fontSize: 14, textAlign: "center", fontWeight: 600 }}>
        他のタイプのプロンプトを見るには
        <br />
        友達にKompassを試してもらおう 👉
      </p>
      <a
        href={twitterShareHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "#000",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 8,
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        Xでシェアする
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
        {isLockedTab ? (
          <div style={{ position: "relative" }}>
            <div
              style={{
                filter: "blur(8px)",
                pointerEvents: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              <PromptList prompts={GUIDE_DETAILS[activeTypeId].prompts} />
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255,255,255,0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 24,
                borderRadius: 12,
              }}
            >
              {shareOverlay}
            </div>
          </div>
        ) : (
          <PromptList prompts={GUIDE_DETAILS[activeTypeId].prompts} />
        )}
      </div>
    </section>
  );
}
