"use client";

import { typeColors } from "@/lib/type-characters";
import type { AiKind } from "@/types/ai";

interface AxisScore {
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
}

interface AxisGraphProps {
  axes: AxisScore[];
  typeId: AiKind;
}

const AXES_CONFIG = [
  { leftLabel: "共感", rightLabel: "解決" },
  { leftLabel: "スピード", rightLabel: "精度" },
  { leftLabel: "直感", rightLabel: "根拠" },
  { leftLabel: "相棒", rightLabel: "道具" },
] as const;

/**
 * 4軸の思考スタイルを横バーで表示する
 */
export function AxisGraph({ axes, typeId }: Readonly<AxisGraphProps>) {
  const color = typeColors[typeId] ?? "#C9A84C";

  return (
    <div className="w-full space-y-3 rounded-xl bg-gray-50 p-4">
      <p className="mb-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
        思考スタイル分析
      </p>
      {axes.map((axis, i) => {
        const left = Math.max(0, Math.min(100, Math.round(axis.leftValue)));
        const right = 100 - left;
        const leftDominant = left >= right;
        const labels = AXES_CONFIG[i] ?? {
          leftLabel: axis.leftLabel,
          rightLabel: axis.rightLabel,
        };

        return (
          <div key={`${labels.leftLabel}-${labels.rightLabel}-${i}`} className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span style={leftDominant ? { color } : {}}>
                {labels.leftLabel} {left}%
              </span>
              <span style={!leftDominant ? { color } : {}}>
                {right}% {labels.rightLabel}
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                style={{ width: `${left}%`, backgroundColor: color }}
                className="h-full rounded-full transition-all duration-700"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
