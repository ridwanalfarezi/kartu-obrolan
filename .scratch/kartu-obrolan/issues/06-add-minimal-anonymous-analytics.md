# 06 — Add minimal anonymous analytics

**What to build:** Measure whether people use the core conversation flow while preserving the accountless, ephemeral nature of the product and avoiding collection of conversation content.

**Blocked by:** 03 — Complete the question package flow.

**Status:** resolved

- [x] Analytics can count started conversation sessions.
- [x] Analytics can count selected categories and skipped question cards.
- [x] No question text, regenerated content, session history, personal identifier, or free-form input is collected.
- [x] Analytics failures never block or interrupt a conversation session.
- [x] Collected event names and fields are documented and verified against the privacy boundary.
- [x] The feature can be disabled without changing the core conversation flow.

## Answer

Implemented `src/analytics.ts` with localStorage-only session analytics: session start (with category and depth), skip count, regenerate count, and session completion. All write operations are wrapped in try/catch so analytics never block the conversation flow. The `setAnalyticsEnabled(false)` switch makes all record functions no-ops. The complete screen now shows a session summary (questions answered, skipped, regenerated). Privacy boundary verified by 9 domain tests that assert no question text is ever stored.

Verification: 19 domain tests (including 9 analytics tests) pass, 13 UI tests pass (including a new complete-screen summary test), TypeScript passes, and the production build succeeds with 11 precache entries.
