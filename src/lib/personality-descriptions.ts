/**
 * 診断6タイプの性格特性コピー（結果画面用）
 * キーは DiagnosisResult.type（日本語のタイプ名）と一致させる
 */

import type { PersonalityDescription } from "@/types/diagnosis";
import type { AiKind } from "@/types/ai";

export type { PersonalityDescription } from "@/types/diagnosis";

const PERSONALITY_DESCRIPTIONS_JA: Record<string, PersonalityDescription> = {
  相談相手タイプ: {
    characterName: "共感ジャンキー",
    catchCopy: "正しいかより、わかってほしい。",
    supplement:
      "AIを「ツール」ではなく「対話相手」として扱える、かなり珍しいタイプです。",
    whoYouAre:
      "あなたは「答え」より「プロセス」を大切にする人です。結論を急がず、物事をじっくり言語化しながら考える。頭の中に霧がかかっているとき、誰かに話すことで初めて自分の気持ちが見えてくるタイプ。AIに対しても同じで、「正解を教えてくれる機械」ではなく「一緒に考えてくれる相手」として使います。共感力が高く、相手の感情を敏感に察知できる反面、自分の気持ちを整理するのに時間がかかることがあります。",
    thinkingPattern:
      "感情と思考が密接につながっています。「なぜそう感じたのか」を深掘りすることで初めて「何をすべきか」が見えてくる。表面的な答えでは満足できず、本質にたどり着くまで考え続ける傾向があります。情報を受け取るとき、事実よりも「その情報が自分にとって何を意味するか」を先に考えます。",
    workStyle:
      "チームの感情的な空気を読むのが得意で、対立が起きたときに場を和らげる役割を自然と担います。一方、締め切りや数字に追われる環境ではストレスを感じやすく、「もっと深く考えたい」という欲求と「早く決めなければ」という焦りのあいだで揺れることがあります。",
    aiCompatibility:
      "Claudeは感情や曖昧な言葉をそのまま受け取り、一緒に言語化してくれる唯一のAIです。「答えをください」ではなく「整理を手伝ってください」という使い方が最も力を引き出します。1回のやり取りで終わらせず、3往復以上続けることで本来の価値が出ます。",
    contraryCopy:
      "「正論を言われるより、一言『お疲れ様』が欲しい時がある。」",
    strengths: [
      "言葉のニュアンスや温度差に敏感で、ズレをすぐ修正できる",
      "頭の中のモヤモヤを「ちゃんと伝わる形」に整理できる",
    ],
    weaknesses: [
      "納得してから動きたいので、初動が遅れることがある",
      "正しい意見でも「共感」がないと受け入れにくい",
    ],
    oppositeType: {
      typeJa: "秘書タイプ",
      aiName: "Copilot",
      description:
        "効率と構造を最優先にする秘書タイプとは、AIへの向き合い方が最も異なります。でも、そのドライさを取り入れると生産性が変わります。",
    },
    ngUsage:
      "AIに『正しい答えを一つ出して』と命令するように使うと、Claudeの本領が発揮されません。命令ではなく対話として使うのがこのタイプの正解です。",
    literacyAnalysis:
      "あなたは情報の『生成』より『整理・共鳴』にバイアスがかかっています。AIを思考の鏡として使う能力が高い。",
    shareText: "これ、あの人に見せたい。",
  },
  万能助手タイプ: {
    characterName: "丸投げ屋",
    catchCopy: "考える前に、もう動いてる。",
    supplement:
      "考えながら動くより、動きながら最適解に近づいていくタイプです。",
    whoYouAre:
      "あなたは「完璧な準備」より「とりあえず動く」を優先する行動派です。考えすぎて手が止まるくらいなら、粗くてもいいから形にして走り出す。AIに対しても「一緒に考えよう」より「とりあえず出して」というスタンス。最初のアウトプットを叩き台にして、そこから磨いていく進め方が性に合っています。",
    thinkingPattern:
      "まず動いてから考えるタイプ。頭の中で完成形を描くより、手を動かすことで思考が整理されます。「どうすれば完璧にできるか」より「どうすれば今日中に終わるか」を先に考えます。情報の取捨選択が速く、必要なものだけを素早く拾い上げます。",
    workStyle:
      "プロジェクトの初動を作るのが得意です。会議では叩き台を持ち込んで議論を前に進める役割を担います。一方、細部の詰めや長期的な計画管理が苦手なことがあり、完璧主義な人と組むと補完関係になりやすいです。",
    aiCompatibility:
      "ChatGPTはどんな雑な指示でも即座に形にしてくれる、丸投げ屋に最も向いたAIです。最初の答えで満足せず、「もっと具体的に」「別の角度で」と返すことで急に使えるアウトプットになります。",
    contraryCopy:
      "「完璧な100点より、まずは『叩き台の60点』を愛している。」",
    strengths: [
      "とにかく手を動かすので、結果的に誰よりも経験値が溜まる",
      "ゼロからでも形にするスピードが速い",
    ],
    weaknesses: [
      "「とりあえずこれでいいか」が積み重なり、粗さが残ることがある",
      "深く詰める前に次へ進みがち",
    ],
    oppositeType: {
      typeJa: "研究者タイプ",
      aiName: "Perplexity",
      description:
        "根拠を徹底的に確認してから動く研究者タイプとは、意思決定のスピードと順序が真逆です。ただし、彼らの検証プロセスは弱点を補います。",
    },
    ngUsage:
      "ChatGPTを深い思考整理や感情の壁打ちに使うのは、ポテンシャルの無駄遣いです。量と速さが必要な場面に集中させましょう。",
    literacyAnalysis:
      "あなたは情報の『整理』より『実行』にバイアスがかかっています。アウトプット量でカバーするタイプのAI活用者です。",
    shareText: "心当たりある人、いません？",
  },
  情報通タイプ: {
    characterName: "情報スナイパー",
    catchCopy: "知らないままは、無理。",
    supplement:
      "「知らない状態」でいることに、強い違和感を持つタイプです。",
    whoYouAre:
      "あなたは情報の鮮度にこだわる、リアルタイム志向の人です。「今この瞬間に何が起きているか」を誰よりも早く把握したい。古い情報や曖昧な情報では動けず、最新・正確・具体的な情報をもとに意思決定します。トレンドへの感度が高く、業界の変化をいち早く察知します。",
    thinkingPattern:
      "常に「今の状況」を更新し続けるタイプ。情報が古くなると不安になり、定期的にリサーチしなければ気が済みません。複数の情報源を横断して比較し、矛盾がないかを確認してから結論を出します。",
    workStyle:
      "市場調査・競合分析・トレンドリサーチで圧倒的な力を発揮します。プレゼンや提案資料の「現状分析」パートを作るのが得意。一方、情報収集に時間をかけすぎて機会を逃すことも。",
    aiCompatibility:
      "GeminiはGoogleと直結しているため、今この瞬間の情報にアクセスできる唯一のAIです。時間軸を指定すること（「2025年以降の」など）で情報の鮮度が上がります。",
    contraryCopy:
      "「膨大な情報の海を泳いでいるとき、一番自分らしくいられる。」",
    strengths: [
      "新しい情報やトレンドを誰より早くキャッチできる",
      "複数の情報源を横断して全体像を掴むのが得意",
    ],
    weaknesses: [
      "情報収集で満足してしまい、意思決定が遅れることがある",
      "広く追いすぎて、深さが足りなくなることがある",
    ],
    oppositeType: {
      typeJa: "相談相手タイプ",
      aiName: "Claude",
      description:
        "感情と共感を重視する相談相手タイプとは、情報への向き合い方が対照的です。深い対話が苦手な場面で力を借りられます。",
    },
    ngUsage:
      "Geminiを創作・感情対話に使うのは向いていません。情報収集とGoogleツール連携に特化させると力を発揮します。",
    literacyAnalysis:
      "あなたは情報の『深さ』より『鮮度と速度』にバイアスがかかっています。リアルタイム性を最大化したAI設計が向いています。",
    shareText: "情報収集が趣味の人、全員これ。",
  },
  研究者タイプ: {
    characterName: "裏取りマニア",
    catchCopy: "\"なんとなく\"は、全部疑う。",
    supplement:
      "「なんとなく正しそう」を信用しない。根拠のない言葉には本能的に疑問を持つ。",
    whoYouAre:
      "あなたは根拠なしには動けない、徹底的な検証主義者です。「みんなそう言ってるから」では納得できず、一次情報・出典・根拠を自分で確認してから判断します。慎重で丁寧な意思決定が強みで、周囲からは「論理的」「信頼できる」と見られます。",
    thinkingPattern:
      "結論より証拠を先に求めます。どんな主張も「なぜそう言えるのか」「反論の余地はないか」という問いを立ててから受け入れます。一つの情報源では満足できず、複数のソースで裏を取ってから確信に変えます。",
    workStyle:
      "提案・企画・意思決定の場で「本当にそのデータは正しいか？」という重要な視点を提供します。調査レポート・エビデンスベースの提案・リスク分析が得意。一方、検証に時間をかけすぎて決断が遅れることがあります。",
    aiCompatibility:
      "Perplexityは全ての回答に出典URLが付く唯一のAIです。ChatGPTで得た情報をPerplexityで裏取りするという二段階活用が最も効果的です。",
    contraryCopy:
      "「AIの嘘を見抜く瞬間、少しだけ自分が勝った気がする。」",
    strengths: [
      "根拠の薄い情報を見抜く精度が高い",
      "信頼できる結論を出すためのプロセスを持っている",
    ],
    weaknesses: [
      "確実性を重視するあまり、スピード勝負に弱い場面がある",
      "感覚で判断する人の意思決定に違和感を持ちやすい",
    ],
    oppositeType: {
      typeJa: "万能助手タイプ",
      aiName: "ChatGPT",
      description:
        "とりあえず動いて結果を出す万能助手タイプとは、情報処理の哲学が真逆です。スピードが求められる場面で彼らの動き方は参考になります。",
    },
    ngUsage:
      "Perplexityでアイデア出しや感情の整理をしようとすると、出典のない回答に物足りなさを感じるはずです。調査・検証の場面だけに使うのが正解です。",
    literacyAnalysis:
      "あなたは情報の『量』より『根拠の質』にバイアスがかかっています。検証プロセスを持つ、信頼性の高いAI活用者です。",
    shareText: "これ、わかる人には刺さる。",
  },
  秘書タイプ: {
    characterName: "整理の鬼",
    catchCopy: "感情より、最短ルート。",
    supplement:
      "感情より構造。「やるべきことが整理されている状態」が、あなたにとっての安心です。",
    whoYouAre:
      "あなたは「整理されていないと動けない」構造化思考の持ち主です。情報が散らかっている状態に強いストレスを感じ、まず整理してから動きたいタイプ。周囲からは「仕事が丁寧」「抜け漏れがない」と評価されます。",
    thinkingPattern:
      "全体を俯瞰してから細部に入るトップダウン型の思考です。優先順位・カテゴリ・時系列で情報を整理することを自然に行います。曖昧さを嫌い、定義・範囲・基準を最初に決めたい傾向があります。",
    workStyle:
      "プロジェクト管理・議事録・マニュアル作成で圧倒的な力を発揮します。Microsoft 365環境では特に真価を発揮します。一方、完璧に整理しようとするあまりスピードが求められる場面で遅れをとることがあります。",
    aiCompatibility:
      "CopilotはMicrosoft 365と直接連携し、業務整理に特化したAIです。「この情報を整理して」「優先順位をつけて」という指示が最も力を引き出します。Google系ツールとは相性が悪いため、Microsoft環境が前提になります。",
    contraryCopy:
      "「『やるべきこと』が整理されていない時間は、苦痛でしかない。」",
    strengths: [
      "やるべきことを瞬時に分解し、順序立てて処理できる",
      "今ある環境を最大効率で使いこなせる",
    ],
    weaknesses: [
      "効率を優先しすぎて、遠回りの価値を見落とすことがある",
      "感情ベースのやり取りに疲れやすい",
    ],
    oppositeType: {
      typeJa: "相談相手タイプ",
      aiName: "Claude",
      description:
        "感情を優先して考える相談相手タイプとは、判断の軸が真逆です。行き詰まったとき、彼らの視点が突破口になります。",
    },
    ngUsage:
      "CopilotをGoogle環境や創作の場面で使おうとすると、連携の弱さが目立ちます。MS環境の中だけで使うのが最大効率です。",
    literacyAnalysis:
      "あなたは情報の『発見』より『処理と効率化』にバイアスがかかっています。既存フローにAIを統合する能力が高い。",
    shareText: "効率の鬼、集まれ。",
  },
  自由人タイプ: {
    characterName: "AI遊牧民",
    catchCopy: "一つに決めるのが、一番ムダ。",
    supplement:
      "一つに絞れないのは、最適解を探し続ける思考が強いからです。",
    whoYouAre:
      "あなたはひとつの場所にとどまらず、常に最適な選択肢を探し続ける自由人です。AIに対しても「ひとつに依存する」ことに違和感を覚え、用途によって使い分けることを自然に行います。好奇心が旺盛で、新しいツールや方法論をいち早く試します。",
    thinkingPattern:
      "「今の方法が本当に最善か？」という問いを常に持っています。複数の視点から物事を見ることができ、単一の答えに縛られません。「AとBを組み合わせたらどうなるか」という発想が自然に出てきます。",
    workStyle:
      "新しいツール・プロセス・方法論の導入を推進する役割を担います。特定の専門領域よりも、複数の領域をつなぐ横断的な仕事で力を発揮します。一方、「結局何が専門なの？」と問われることも。",
    aiCompatibility:
      "調査はPerplexity・整理はChatGPT・深掘りはClaude・確認はPerplexityという4段階フローが最も効果を発揮します。「なんとなく使い分ける」のは遊牧民ではなく迷子。フェーズごとに使うAIを意識的に決めることで真の力が出ます。",
    contraryCopy:
      "「一途になれないのではない。最適解が常に変わるだけだ。」",
    strengths: [
      "目的ごとに最適なAIを選べる柔軟性がある",
      "新しいツールへの適応が早く、変化に強い",
    ],
    weaknesses: [
      "「これでいい」と止める判断が難しい",
      "一つを極める前に次へ移りやすい",
    ],
    oppositeType: {
      typeJa: "秘書タイプ",
      aiName: "Copilot",
      description:
        "一つのツールを深く使い込む秘書タイプとは、AIとの付き合い方が対照的です。選択肢を絞る力が、あなたの次のステージです。",
    },
    ngUsage:
      "複数のAIを目的なく使い回すのは、かえって習熟を遅らせます。用途ごとに『これはこのAI』とルールを決めると力が出ます。",
    literacyAnalysis:
      "あなたは特定のAIへの依存を避ける、メタ的なAI活用スタイルを持っています。最適化思考が強い上級者タイプです。",
    shareText: "複数AIを使い分ける人を探してる。",
  },
};

const EN_SUPPLEMENT_BY_TYPE_JA: Record<string, string> = {
  相談相手タイプ:
    "Process over answers. You need to feel understood before you can move forward.",
  万能助手タイプ:
    "Speed over perfection. A rough draft beats a blank page every time.",
  情報通タイプ:
    "Fresh over familiar. Stale information isn't just useless — it's dangerous.",
  研究者タイプ:
    "Evidence over opinion. If you can't back it up, it doesn't count.",
  秘書タイプ:
    "Structure over chaos. You can't work well until everything has its place.",
  自由人タイプ:
    "Options over commitment. One tool was never going to be enough.",
};

const EN_CHARACTER_NAME_BY_TYPE_JA: Record<string, string> = {
  相談相手タイプ: "The Confidant",
  万能助手タイプ: "The Generalist",
  情報通タイプ: "The Scout",
  研究者タイプ: "The Analyst",
  秘書タイプ: "The Executive",
  自由人タイプ: "The Orchestrator",
};

const EN_CATCH_COPY_BY_TYPE_JA: Record<string, string> = {
  相談相手タイプ: "I don't need answers. I need to be heard.",
  万能助手タイプ: "Why think when you can delegate?",
  情報通タイプ: "Just give me what I need. Nothing else.",
  研究者タイプ: "I don't do 'probably'.",
  秘書タイプ: "Chaos isn't a vibe. It's a problem.",
  自由人タイプ: "One AI was never going to be enough.",
};

const EN_WHO_YOU_ARE_BY_TYPE_JA: Record<string, string> = {
  自由人タイプ:
    "You never settle in one place. You're always hunting for the best option — and that applies to AI too. Using multiple tools for different jobs feels completely natural to you. Highly curious, always the first to try something new.",
  相談相手タイプ:
    "You value process over answers. You think by talking — the fog lifts when someone listens. You treat AI not as an answer machine but as a thinking partner. High empathy, but you sometimes need time to sort out your own feelings.",
  万能助手タイプ:
    "You move first and think second. A rough draft beats a blank page. Your approach to AI: 'Just give me something to work with.' You take the first output and shape it from there.",
  情報通タイプ:
    "You're obsessed with freshness. You need to know what's happening right now. Old or vague information stops you cold. High trend sensitivity — you spot industry shifts before most people.",
  研究者タイプ:
    "You don't move without evidence. 'Everyone says so' means nothing to you. You verify primary sources yourself before you commit. Others see you as logical and trustworthy.",
  秘書タイプ:
    "Disorder is physically stressful to you. You need to organize before you can act. People call your work thorough and airtight.",
};

const EN_THINKING_PATTERN_BY_TYPE_JA: Record<string, string> = {
  自由人タイプ:
    "You constantly ask 'Is this really the best way?' You can hold multiple perspectives at once and you're never stuck with a single answer. Combining A and B to see what happens is just how your mind works.",
  相談相手タイプ:
    "Emotion and logic are deeply linked for you. 'Why did I feel that?' comes before 'What should I do?' You're not satisfied with surface answers. You keep digging until you hit something real.",
  万能助手タイプ:
    "Action unlocks your thinking. 'How do I finish this today?' beats 'How do I make this perfect?' You filter fast and grab only what you need.",
  情報通タイプ:
    "You're always updating your picture of the present. Multiple sources, cross-checked for contradictions, before you land on a conclusion.",
  研究者タイプ:
    "Proof before conclusion. Every claim gets 'Why is that true?' and 'Where's the counter-argument?' One source is never enough.",
  秘書タイプ:
    "Top-down: big picture first, then details. You naturally sort by priority, category, and sequence. Ambiguity bothers you — you want definitions and scope locked in before you start.",
};

const EN_WORK_STYLE_BY_TYPE_JA: Record<string, string> = {
  自由人タイプ:
    "You push new tools, processes, and methods into your team. You thrive in cross-functional roles that connect different domains. The flip side: people sometimes ask 'So what exactly is your specialty?'",
  相談相手タイプ:
    "You naturally read the emotional temperature of a room and smooth over conflicts. Under pressure from deadlines and numbers, you feel the tension between 'I need to think this through' and 'I have to decide now.'",
  万能助手タイプ:
    "You're great at getting projects off the ground. You walk into meetings with a draft and move things forward. Detail-heavy planning and long-term management can slow you down — but pair with a perfectionist and you're unstoppable.",
  情報通タイプ:
    "Market research, competitive analysis, trend tracking — you dominate here. The risk: spending so long gathering that you miss the window to act.",
  研究者タイプ:
    "You're the person who asks 'Is that data actually correct?' in a room full of people nodding. Strong at research reports, evidence-based proposals, risk analysis. Watch out for analysis paralysis.",
  秘書タイプ:
    "Project management, meeting notes, documentation — you're exceptional here. Microsoft 365 is your natural habitat. The risk: optimizing so hard for completeness that speed suffers.",
};

const EN_AI_COMPATIBILITY_BY_TYPE_JA: Record<string, string> = {
  自由人タイプ:
    "Your power move is a 4-step flow: Perplexity for research, ChatGPT for organizing, Claude for deep thinking, Perplexity again to verify. Winging the tool choice makes you a wanderer, not an orchestrator. Decide which AI handles which phase.",
  相談相手タイプ:
    "Claude receives messy, emotional language without judgment and helps you find the words. Don't aim for a one-shot answer — go three exchanges deep and that's where the real value shows up.",
  万能助手タイプ:
    "ChatGPT turns even vague instructions into something fast. Don't stop at the first output — push back with 'more specific' or 'different angle' and it gets genuinely useful.",
  情報通タイプ:
    "Gemini is directly connected to Google, giving you real-time information no other AI can match. Specify a time range ('since 2025') and the freshness goes up sharply.",
  研究者タイプ:
    "Perplexity attaches source URLs to every answer — no other AI does this by default. Use ChatGPT to generate ideas, then Perplexity to verify them. That two-step is your power combo.",
  秘書タイプ:
    "Copilot integrates directly with Microsoft 365 and is built for exactly this kind of structured work. 'Organize this' and 'prioritize this' are the commands that unlock its best output. It works poorly outside the Microsoft ecosystem.",
};

const EN_FIRST_STEP_TEXT_BY_TYPE_JA: Record<string, string> = {
  自由人タイプ:
    "Start by routing today's tasks to the right AI for each one. Research -> Perplexity. Writing -> ChatGPT. Deep thinking -> Claude.",
  相談相手タイプ:
    "Open Claude and describe one thing that's been on your mind lately. Don't ask for a solution — just start talking.",
  万能助手タイプ:
    "Take one task you've been putting off and throw it at ChatGPT. Don't overthink the prompt.",
  情報通タイプ:
    "Search one thing you've been curious about this week on Gemini. Notice how fresh the results are.",
  研究者タイプ:
    "Find one claim you've accepted without questioning it and run it through Perplexity.",
  秘書タイプ:
    "Dump everything in your head right now into Copilot and ask it to organize it.",
};

const EN_LITERACY_ANALYSIS_BY_TYPE_JA: Record<string, string> = {
  相談相手タイプ:
    "You're wired for reflection and resonance over raw generation. You use AI as a mirror — to understand yourself, not just to produce output.",
  万能助手タイプ:
    "You're built for speed and iteration. AI is your launchpad. The first output is never the final output — you treat it as a starting point.",
  情報通タイプ:
    "You're tuned for real-time signal detection. You use AI to stay ahead of the curve, not to process what you already know.",
  研究者タイプ:
    "You're wired for verification over acceptance. AI is a research partner, not an authority. You always cross-check.",
  秘書タイプ:
    "You're optimized for structure and efficiency. You use AI to process and organize information, not to explore or reflect.",
  自由人タイプ:
    "You're built for flexibility over depth. Your edge is knowing which AI to use for which job — and switching without friction.",
};

/** aiKind から結果画面用の説明を引けるマップ */
export const PERSONALITY_DESCRIPTIONS: Record<AiKind, PersonalityDescription> = {
  claude: PERSONALITY_DESCRIPTIONS_JA["相談相手タイプ"],
  chatgpt: PERSONALITY_DESCRIPTIONS_JA["万能助手タイプ"],
  gemini: PERSONALITY_DESCRIPTIONS_JA["情報通タイプ"],
  perplexity: PERSONALITY_DESCRIPTIONS_JA["研究者タイプ"],
  copilot: PERSONALITY_DESCRIPTIONS_JA["秘書タイプ"],
  jiyujin: PERSONALITY_DESCRIPTIONS_JA["自由人タイプ"],
};

/**
 * タイプ名（日本語）から性格特性ブロックを返す
 * @param typeJa API の result.type（日本語）
 * @param locale UI ロケール（ja / en）
 */
export function getPersonalityDescription(
  typeJa: string,
  locale: string
): PersonalityDescription | null {
  const desc = PERSONALITY_DESCRIPTIONS_JA[typeJa];
  if (desc === undefined) {
    return null;
  }
  if (locale !== "en") {
    return desc;
  }
  const supplement = EN_SUPPLEMENT_BY_TYPE_JA[typeJa];
  const characterName = EN_CHARACTER_NAME_BY_TYPE_JA[typeJa];
  const catchCopy = EN_CATCH_COPY_BY_TYPE_JA[typeJa];
  const whoYouAre = EN_WHO_YOU_ARE_BY_TYPE_JA[typeJa];
  const thinkingPattern = EN_THINKING_PATTERN_BY_TYPE_JA[typeJa];
  const workStyle = EN_WORK_STYLE_BY_TYPE_JA[typeJa];
  const aiCompatibility = EN_AI_COMPATIBILITY_BY_TYPE_JA[typeJa];
  const firstStepText = EN_FIRST_STEP_TEXT_BY_TYPE_JA[typeJa];
  const literacyAnalysis = EN_LITERACY_ANALYSIS_BY_TYPE_JA[typeJa];
  return {
    ...desc,
    supplement: supplement ?? desc.supplement,
    characterName: characterName ?? desc.characterName,
    catchCopy: catchCopy ?? desc.catchCopy,
    whoYouAre: whoYouAre ?? desc.whoYouAre,
    thinkingPattern: thinkingPattern ?? desc.thinkingPattern,
    workStyle: workStyle ?? desc.workStyle,
    aiCompatibility: aiCompatibility ?? desc.aiCompatibility,
    firstStepText,
    literacyAnalysis: literacyAnalysis ?? desc.literacyAnalysis,
  };
}
