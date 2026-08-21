# 01 — Add exact player count to conversation sessions

**What to build:** Require and preserve an exact 2–12 player count, then use it to shape and validate initial and replacement questions.

**Blocked by:** none

**Status:** resolved

- [x] Setup requires an explicit supported player count and explains invalid values inline.
- [x] The active conversation session retains and displays the selected count.
- [x] Initial and replacement API requests include the exact count.
- [x] `QuestionGenerator` prompts and output validation enforce exact-group suitability and player neutrality.
- [x] Two-player sessions reject instructions or assumptions involving three or more people.
- [x] Existing novelty, `Lewati`, `Buat ulang`, recovery, and shared-phone behavior remain intact.
- [x] Public-boundary domain tests, UI tests, type checks, build, React checks, and mobile browser verification pass. The repository does not define a lint command.

## Answer

Added a required 2–12 player-count field to the existing setup screen and kept the accepted value through generation, retry, replacement, replay, and active-session metadata. Both API boundaries and `QuestionGenerator` inputs now require the exact count. Shared Gemini instructions and the active-card footer address all players collectively without assigning a reader; the generator prohibits reader/host/facilitator and card-narrator phrasing and adds an explicit two-player rule. Output validation rejects the named prohibited wording and common Indonesian affixed forms, impossible two-player assumptions, and explicit group sizes that conflict with the selected count without rejecting quoted player speech or valid collective wording. Exact duplicate and active-package avoidance remain intact.

Verification: 43 domain tests and 16 UI tests pass; TypeScript, production PWA build, and `git diff --check` pass. React Doctor completed at 81/100 with four pre-existing structural/custom-modal warnings and no errors. Browser checks at 320, 390, and 430 px found no DOM overflow, console errors, or Vite overlay; missing and unsupported counts produced the expected accessible inline errors. Browser checks used viewport emulation rather than a physical device.

## Comments

- 2026-08-21: Selected 2–12 as the supported shared-phone range. Public TDD seams are the setup/start request flow and `QuestionGenerator.generatePackage()` / `generateReplacement()`.
