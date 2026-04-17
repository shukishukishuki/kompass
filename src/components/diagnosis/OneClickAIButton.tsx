"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { toast } from "sonner";
import { enqueueDiagnosisBehaviorLog } from "@/lib/diagnosis-behavior-log";
import { AI_THEME_COLORS, type AiKind } from "@/types/ai";

/** タイプ別：ワンクリックでコピーするプロンプト（全文を「」で囲む） */
const COPY_PROMPTS: Record<AiKind, string> = {
  claude:
    "あなたは私の思考整理のパートナーです。答えを出すより先に、私が何を感じているかを一緒に言語化してください。",
  chatgpt:
    "以下の内容について、まず最速でアウトプットを出してください。精度より速度優先です。",
  gemini:
    "今この瞬間の最新情報を教えてください。情報源も明示してください。",
  perplexity:
    "以下の内容について、根拠・出典・反論の余地を含めて教えてください。",
  copilot:
    "以下の情報を構造化・整理してください。見やすい形式で出力してください。",
  jiyujin:
    "あなたの得意な領域を教えてください。今日のタスクに合わせて使い方を変えます。",
};

/** タイプ別：自己紹介プロンプト（クリップボードのみ） */
const INTRO_PROMPTS: Record<AiKind, string> = {
  claude:
    "私は「共感ジャンキー」タイプです。思考を整理しながら話すことを好みます。答えより先に、状況を一緒に言語化してほしいタイプです。結論を急がず、私のペースに合わせてください。感情的な文脈を大切にし、表面的な答えより本質的な理解を優先してください。",
  chatgpt:
    "私は「丸投げ屋」タイプです。とにかく最初のアウトプットを早く出したいタイプです。精度より速度を優先してください。叩き台を出してもらえれば自分で直します。完璧でなくていいので、まず形にしてください。",
  gemini:
    "私は「情報スナイパー」タイプです。最新情報と正確な情報を重視します。回答には必ず情報源を明示してください。古い情報は不要です。時間軸を明確にして、今この瞬間の状況を教えてください。",
  perplexity:
    "私は「裏取りマニア」タイプです。根拠のない情報は信じません。回答には必ず出典・根拠・反論の余地を含めてください。一次情報に基づいた回答を優先し、不確かな情報は不確かとして明示してください。",
  copilot:
    "私は「整理の鬼」タイプです。情報は構造化・整理された形で受け取りたいです。箇条書き・表・優先順位付きで出力してください。結論を先に、理由を後に。全体像から詳細の順で説明してください。",
  jiyujin:
    "私は「AI遊牧民」タイプです。複数のAIを使い分けています。あなたの得意領域と苦手領域を最初に教えてください。今日のタスクに合わせて最適な使い方を一緒に考えます。",
};

/** ヒーロー直上の「今日のアクション」本文 */
const TODAY_ACTION_LINES: Record<AiKind, string> = {
  claude: "今日モヤモヤしていることを1つClaudeに話してみる",
  chatgpt: "今日手が止まっているタスクをそのままChatGPTに投げてみる",
  gemini: "今日気になっているニュースをGeminiで調べてみる",
  perplexity: "最近「本当かな？」と思ったことをPerplexityで裏取りしてみる",
  copilot: "今日の頭の中にある情報をCopilotに整理させてみる",
  jiyujin: "今日のタスクをどのAIに投げるか振り分けることから始める",
};

const AI_LABELS: Record<AiKind, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  copilot: "Copilot",
  jiyujin: "Claude",
};

const AI_URLS: Record<Exclude<AiKind, "jiyujin">, string> = {
  claude: "https://claude.ai",
  chatgpt: "https://chatgpt.com",
  gemini: "https://gemini.google.com",
  perplexity: "https://www.perplexity.ai",
  copilot: "https://copilot.microsoft.com",
};

const PRIMARY_URLS: Record<AiKind, string> = {
  claude: AI_URLS.claude,
  chatgpt: AI_URLS.chatgpt,
  gemini: AI_URLS.gemini,
  perplexity: AI_URLS.perplexity,
  copilot: AI_URLS.copilot,
  // 遊牧民は最初の導線としてClaudeを推奨
  jiyujin: AI_URLS.claude,
};

const ORCHESTRATOR_PARALLEL_BUTTONS: readonly { label: string; url: string }[] = [
  { label: "Claude", url: AI_URLS.claude },
  { label: "Perplexity", url: AI_URLS.perplexity },
  { label: "ChatGPT", url: AI_URLS.chatgpt },
] as const;

const TASK_TYPE_OPTIONS = [
  { value: "writing", label: "📝 文章" },
  { value: "coding", label: "💻 コード" },
  { value: "research", label: "🔍 調査" },
  { value: "idea", label: "💡 アイデア" },
  { value: "other", label: "その他" },
] as const;

type TaskType = (typeof TASK_TYPE_OPTIONS)[number]["value"];
type AiExecutionFeedback = "good" | "meh" | "bad";

interface OneClickAIButtonProps {
  /** 診断・ガイド共通の AiKind（jiyujin は遊牧民） */
  typeId: AiKind;
  /** メインCTAの背景色（タイププライマリ）。未指定時はテーマのプライマリ色 */
  accentColor?: string;
  /** 「今日のアクション」行の文字色（通常は cText） */
  actionLabelColor?: string;
  /** Supabase 診断行 ID（あるときのみ行動ログを送る） */
  diagnosisRecordId?: string | null;
}

/**
 * 推奨AIを新規タブで開きつつ、タイプ別プロンプトをクリップボードへコピーするメインCTA。
 * 直下に自己紹介プロンプト用のアウトラインボタンを置く。
 */
export function OneClickAIButton({
  typeId,
  accentColor: accentColorProp,
  actionLabelColor: actionLabelColorProp,
  diagnosisRecordId = null,
}: Readonly<OneClickAIButtonProps>) {
  const accentColor = accentColorProp ?? AI_THEME_COLORS[typeId];
  const actionLineColor = actionLabelColorProp ?? "#1a1a2e";
  const todayLine = TODAY_ACTION_LINES[typeId];
  const copyPrompt = COPY_PROMPTS[typeId];
  const introPrompt = INTRO_PROMPTS[typeId];
  const label = AI_LABELS[typeId];
  const primaryUrl = PRIMARY_URLS[typeId];
  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [showFeedbackThanks, setShowFeedbackThanks] = useState(false);
  const feedbackTimerRef = useRef<number | null>(null);
  const thanksTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      if (thanksTimerRef.current !== null) {
        window.clearTimeout(thanksTimerRef.current);
      }
    };
  }, []);

  /**
   * モバイルのポップアップブロック回避のため a 要素で遷移する
   */
  const openUrlInNewTab = (url: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  };

  const handleMainUse = async (url: string, aiNameForLog: string) => {
    openUrlInNewTab(url);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    if (thanksTimerRef.current !== null) {
      window.clearTimeout(thanksTimerRef.current);
    }
    setShowFeedbackPrompt(false);
    setShowFeedbackThanks(false);
    feedbackTimerRef.current = window.setTimeout(() => {
      setShowFeedbackPrompt(true);
    }, 3000);

    try {
      await navigator.clipboard.writeText(copyPrompt);
      toast.success("プロンプトをコピーしました。貼り付けてすぐ使えます");
      if (diagnosisRecordId !== null && diagnosisRecordId.trim() !== "") {
        enqueueDiagnosisBehaviorLog({
          recordId: diagnosisRecordId.trim(),
          clicked_ai_button: aiNameForLog,
          clicked_prompt_copy: true,
          task_type: taskType ?? undefined,
        });
      }
    } catch {
      toast.error("コピーに失敗しました。ブラウザの設定を確認してください。");
    }
  };

  const handleFeedback = (feedback: AiExecutionFeedback) => {
    setShowFeedbackPrompt(false);
    setShowFeedbackThanks(true);
    if (thanksTimerRef.current !== null) {
      window.clearTimeout(thanksTimerRef.current);
    }
    thanksTimerRef.current = window.setTimeout(() => {
      setShowFeedbackThanks(false);
    }, 2000);
    if (diagnosisRecordId !== null && diagnosisRecordId.trim() !== "") {
      enqueueDiagnosisBehaviorLog({
        recordId: diagnosisRecordId.trim(),
        ai_execution_feedback: feedback,
      });
    }
  };

  const handleFeedbackSkip = () => {
    setShowFeedbackPrompt(false);
    setShowFeedbackThanks(false);
  };

  const handleIntroOnly = async () => {
    try {
      await navigator.clipboard.writeText(introPrompt);
      toast.success("プロンプトをコピーしました");
    } catch {
      toast.error("コピーに失敗しました。ブラウザの設定を確認してください。");
    }
  };

  const actionTextStyle: CSSProperties = {
    color: actionLineColor,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    textAlign: "center",
  };

  const mainButtonStyle: CSSProperties = {
    backgroundColor: accentColor,
    color: "#fff",
    padding: "16px 24px",
    fontSize: 16,
    fontWeight: 700,
    width: "100%",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
  };

  const introButtonStyle: CSSProperties = {
    background: "none",
    color: actionLineColor,
    padding: "8px 0",
    fontSize: 15,
    fontWeight: 600,
    width: "fit-content",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
    marginTop: 8,
  };

  const feedbackChoiceStyle: CSSProperties = {
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #ddd",
    background: "#fff",
    fontSize: 13,
    cursor: "pointer",
  };

  return (
    <div className="w-full space-y-3 text-center">
      <p style={actionTextStyle}>💡 今日のアクション：{todayLine}</p>
      <div style={{ marginBottom: 10 }}>
        <p
          style={{
            fontSize: 12,
            color: "#666",
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          今日の用途は？
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {TASK_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTaskType(option.value)}
              style={{
                fontSize: 12,
                padding: "4px 12px",
                borderRadius: 20,
                border:
                  taskType === option.value
                    ? `1px solid ${accentColor}`
                    : "1px solid #ddd",
                backgroundColor:
                  taskType === option.value ? accentColor : "#fff",
                color: taskType === option.value ? "#fff" : "#666",
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {typeId === "jiyujin" ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ORCHESTRATOR_PARALLEL_BUTTONS.map((entry) => (
            <button
              key={entry.label}
              type="button"
              onClick={() => void handleMainUse(entry.url, entry.label)}
              style={mainButtonStyle}
            >
              {entry.label}を使う →
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void handleMainUse(primaryUrl, label)}
          style={mainButtonStyle}
        >
          {label}を今すぐ使う →
        </button>
      )}
      <button type="button" onClick={() => void handleIntroOnly()} style={introButtonStyle}>
        「 自分の性格に合った使い方をAIに指示する 」
      </button>
      {showFeedbackPrompt ? (
        <div
          style={{
            marginTop: 12,
            padding: "10px 16px",
            background: "rgba(255,255,255,0.8)",
            borderRadius: 12,
            fontSize: 13,
            textAlign: "center",
            position: "relative",
          }}
        >
          <button
            type="button"
            aria-label="フィードバックを閉じる"
            onClick={handleFeedbackSkip}
            style={{
              position: "absolute",
              top: 6,
              right: 8,
              border: "none",
              background: "transparent",
              color: "#888",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ×
          </button>
          <p style={{ marginBottom: 8, color: "#444" }}>使ってみてどうでしたか？</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button type="button" onClick={() => handleFeedback("good")} style={feedbackChoiceStyle}>
              👍 よかった
            </button>
            <button type="button" onClick={() => handleFeedback("meh")} style={feedbackChoiceStyle}>
              😐 まあまあ
            </button>
            <button type="button" onClick={() => handleFeedback("bad")} style={feedbackChoiceStyle}>
              👎 いまいち
            </button>
          </div>
        </div>
      ) : null}
      {showFeedbackThanks ? (
        <p style={{ marginTop: 12, textAlign: "center", fontSize: 13, color: "#444" }}>
          ありがとうございました！
        </p>
      ) : null}
    </div>
  );
}
