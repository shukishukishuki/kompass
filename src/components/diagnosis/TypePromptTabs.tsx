"use client";

import { useState } from "react";
import { TYPE_CHARACTERS } from "@/lib/type-characters";
import { GUIDE_DETAILS } from "@/lib/guide-details";
import { PromptList } from "@/components/guide/prompt-list";
import type { TypeId } from "@/lib/type-characters";

type Props = {
  userTypeId: string;
  twitterShareHref: string;
  /** Xシェアリンククリック時（行動ログ用・任意） */
  onXShareClick?: () => void;
};

export function TypePromptTabs({
  userTypeId,
  twitterShareHref,
  onXShareClick,
}: Props) {
  const [activeTab, setActiveTab] = useState(userTypeId);

  return (
    <div>
      {/* タブ */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
        {TYPE_CHARACTERS.map((char) => {
          const isUser = char.typeId === userTypeId;
          const isActive = char.typeId === activeTab;
          return (
            <button
              key={char.typeId}
              onClick={() => setActiveTab(char.typeId)}
              style={{
                whiteSpace: "nowrap",
                padding: "6px 14px",
                borderRadius: 20,
                border: isActive ? "2px solid currentColor" : "1.5px solid #ddd",
                background: isActive ? (isUser ? "#f0faf5" : "#f5f5f5") : "white",
                fontWeight: isUser ? 700 : 400,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {char.characterName}
            </button>
          );
        })}
      </div>

      {/* パネル */}
      <div style={{ marginTop: 16 }}>
        {activeTab === userTypeId ? (
          <PromptList prompts={GUIDE_DETAILS[activeTab as TypeId]?.prompts ?? []} />
        ) : (
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", minHeight: 200 }}>
            {/* ブラーコンテンツ */}
            <div style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none" }}>
              <PromptList prompts={GUIDE_DETAILS[activeTab as TypeId]?.prompts ?? []} />
            </div>
            {/* オーバーレイ */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255,255,255,0.75)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 24,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6 }}>
                他のタイプのプロンプトを見るには
                <br />
                友達にKompassを試してもらおう 👉
              </p>
              <a
                href={twitterShareHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  onXShareClick?.();
                }}
                style={{
                  background: "#000",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: 8,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Xでシェアする
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
