"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { DIAGNOSIS_RESULT_STORAGE_KEY } from "@/app/[locale]/diagnosis/page";
import { Button } from "@/components/ui/button";
import type { GuidePromptItem } from "@/lib/guide-details";
import { cn } from "@/lib/utils";

interface PromptListProps {
  prompts: readonly GuidePromptItem[];
  /**
   * 他タイプ閲覧時など：診断状態に関わらず 6px ブラー＋オーバーレイ
   * （結果画面の TypePromptTabs 用）
   */
  previewLocked?: boolean;
  /** previewLocked 時に表示するオーバーレイ（未指定なら空） */
  previewOverlay?: ReactNode;
}

/**
 * プロンプトを一覧表示し、各行でコピーできるUI
 */
export function PromptList({
  prompts,
  previewLocked = false,
  previewOverlay = null,
}: Readonly<PromptListProps>) {
  const params = useParams();
  const locale =
    typeof params?.locale === "string" && params.locale.length > 0
      ? params.locale
      : "ja";
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDiagnosed, setIsDiagnosed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(DIAGNOSIS_RESULT_STORAGE_KEY);
    setIsDiagnosed(!!stored);
  }, []);

  const showDiagnosisGate = !isDiagnosed && !previewLocked;
  const blurInner =
    (!isDiagnosed && !previewLocked) || previewLocked;

  return (
    <div className="relative min-h-[120px]">
      <div
        className={cn(
          blurInner && "pointer-events-none select-none",
          !isDiagnosed && !previewLocked && "blur-sm",
          previewLocked && "blur-[6px]"
        )}
        style={
          previewLocked
            ? {
                filter: "blur(6px)",
                pointerEvents: "none",
                userSelect: "none",
              }
            : undefined
        }
      >
        <div className="space-y-3">
          {prompts.map((promptItem, index) => (
            <div
              key={`${index}-${promptItem.title}-${promptItem.prompt.slice(0, 12)}`}
              className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-semibold text-slate-500">{promptItem.title}</p>
                <p className="text-sm leading-relaxed text-slate-700">{promptItem.prompt}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(promptItem.prompt);
                    setCopiedIndex(index);
                    setTimeout(() => {
                      setCopiedIndex((current) =>
                        current === index ? null : current
                      );
                    }, 1200);
                  } catch {
                    // クリップボード非対応環境ではUIだけ保持して失敗を無視
                  }
                }}
                className="shrink-0"
              >
                {copiedIndex === index ? "コピー済み" : "コピー"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {previewLocked && previewOverlay !== null ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-white/75 px-4 py-6 backdrop-blur-[2px]">
          {previewOverlay}
        </div>
      ) : null}

      {showDiagnosisGate ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/10">
          <p className="px-4 text-center text-sm font-medium text-gray-600">
            診断を完了するとプロンプトが解放されます
          </p>
          <Link
            href={`/${locale}/diagnosis`}
            className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-700"
          >
            診断する →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
