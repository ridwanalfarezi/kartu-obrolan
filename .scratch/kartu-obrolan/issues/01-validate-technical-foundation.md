# 01 — Validate the technical foundation and AI provider

**What to build:** Prove that the intended MVP stack can generate a valid question package of 10 natural Indonesian questions through a provider-neutral AI boundary, then record the approved runtime, hosting, and AI provider decisions before product implementation depends on them.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [x] Compare viable runtime, hosting, and AI provider options against Indonesian-language quality, latency, cost, usage limits, and PWA compatibility.
- [x] Demonstrate a live generation request that returns exactly 10 questions for a selected category and depth.
- [x] Reject malformed responses through explicit response validation rather than passing them into the product flow.
- [x] Keep provider-specific details behind a provider-neutral boundary.
- [x] Present the trade-offs and obtain user approval before recording the selected technical decisions.
- [x] Record every approved, hard-to-reverse choice as an ADR.

## Answer

Validated the provider-neutral `QuestionGenerator` boundary with explicit structured-output validation and four passing automated tests. A live `mixed` / `personal` request to `gemini-3.5-flash-lite` through the Gemini Developer API returned exactly 10 valid Indonesian questions in 2,152 ms.

The approved foundation is React + TypeScript + Vite on Vercel, Vercel AI SDK as the application boundary, and direct Gemini API access for the initial MVP. ADR-0005 records the direct transport decision and explicitly supersedes only the blocked AI Gateway transport portion of ADR-0004.
