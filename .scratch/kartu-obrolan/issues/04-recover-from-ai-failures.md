# 04 — Recover from AI failures

**What to build:** Keep the conversation experience understandable and recoverable when initial package generation or question regeneration fails, without silently substituting static content or discarding the active session.

**Blocked by:** 03 — Complete the question package flow.

**Status:** resolved

- [x] Initial generation failures display a clear failure state and `Coba lagi` action.
- [x] Regeneration failures leave the current question and active package intact.
- [x] Retrying repeats the intended failed operation with the same category and depth.
- [x] Invalid or incomplete AI responses use the same visible recovery flow as transport failures.
- [x] No static question fallback is shown when AI is unavailable.
- [x] Recovery behaviour is covered by automated tests.

## Answer

Implemented explicit recovery for both AI operations. Initial package failures now show a dedicated state with `Coba lagi` and `Ubah pengaturan`; retries preserve and resend the selected category and depth. Regeneration failures stay inline, retain the active package, question, and progress, and retry only the failed replacement operation. Transport failures and malformed or duplicate AI responses share these recovery paths, with no static fallback.

Verification: all 21 automated tests pass and the production build succeeds. Browser verification at 320×568 confirmed retry returns to loading, settings remain selected, the recovery screen has no horizontal overflow, and no console error or Vite overlay is present.
