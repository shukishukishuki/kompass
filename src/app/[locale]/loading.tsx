import { AI_THEME_COLORS, AI_KINDS } from "@/types/ai";

export default function Loading() {
  const paletteDots = AI_KINDS.map((k) => AI_THEME_COLORS[k]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {paletteDots.map(
            (color, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full animate-bounce"
                style={{
                  backgroundColor: color,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            )
          )}
        </div>
        <p className="text-xs text-gray-400">読み込み中...</p>
      </div>
    </div>
  );
}
