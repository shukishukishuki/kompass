# Kompass — Find Your Base AI

**Stop picking AI tools by features. Pick by who you are.**

Most people choose AI based on tasks. Kompass takes a different approach: we match you with your Base AI based on how you think, feel, and process information.

→ **[Try the diagnosis](https://usekompass.com)**

---

## What is Kompass?

Kompass is a personality-based AI selection service. Through a 40-question diagnostic, we identify your thinking style and match you with the AI that fits you best — not just for one task, but as your primary AI companion.

**The core idea:** Just like people have different personality types, different AIs have different "personalities." The AI that works for your colleague might not work for you.

---

## The 6 Types

| Type | English Name | Base AI | Color |
|---|---|---|---|
| 共感ジャンキー | The Confidant | Claude | #52B788 |
| 丸投げ屋 | The Generalist | ChatGPT | #F5C518 |
| 情報スナイパー | The Scout | Gemini | #F07C2A |
| 裏取りマニア | The Analyst | Perplexity | #9B4DCA |
| 整理の鬼 | The Executive | Copilot | #4A7FC1 |
| AI遊牧民 | The Orchestrator | Multiple | #C9A84C |

---

## Scoring Logic (Open Source)

The scoring algorithm that maps your answers to AI types is fully open source.

**Why open source?**
- Any single AI has inherent bias toward itself
- We used Claude, ChatGPT, Gemini, and Perplexity in combination to design the scoring
- The AI landscape changes weekly — the scoring should evolve with it
- Community discussion keeps it honest

**What's public:** Scoring matrix, use-case classification, AI trait mapping  
**What's private:** Fine-tuning weights, user behavior logs, CVR optimization

**The principle:** Reproducible, but not fully optimizable.

---

## How to Contribute

We want this scoring logic to be discussed and improved by the global AI community.

**To propose a scoring change:**
1. Open an Issue describing the change and your reasoning
2. Reference real-world AI behavior that supports your proposal
3. The community discusses, we evaluate and merge

**To report a bias:**
If you think a particular AI is over- or under-represented in the scoring, open an Issue with `[bias]` in the title.

We take scoring integrity seriously. The goal is the most accurate AI-personality matching possible, not promotion of any single AI.

---

## Tech Stack

- **Frontend:** Next.js + TypeScript + Tailwind CSS + shadcn/ui
- **Auth:** Clerk
- **Database:** Supabase
- **AI:** Claude API (Haiku)
- **Deploy:** Vercel
- **Scoring:** `scoringEngine.ts` (this repo)

---

## Roadmap

- [x] 40-question diagnostic (4-layer structure)
- [x] 6 personality types
- [x] Result sharing cards
- [ ] English version
- [ ] Monthly AI update reports (type-personalized)
- [ ] Community scoring updates via Issues/PRs
- [ ] Product Hunt launch

---

## Philosophy

AI tools are evolving faster than any individual can track. Kompass exists to help people build a long-term relationship with the right AI — not just use whatever's trending.

We believe the question isn't *"which AI is best?"* but *"which AI is best for you?"*

---

## License

Scoring logic: MIT  
Brand assets and character designs: All rights reserved

---

*Built with Claude, ChatGPT, Gemini, and Perplexity — because no single AI should decide this alone.*
