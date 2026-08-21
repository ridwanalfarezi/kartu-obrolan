# 01 — Add device-local question novelty

**What to build:** Add bounded device history, similarity validation, targeted candidate regeneration, and a visible reset control.

**Blocked by:** none

**Status:** resolved

- [x] Persist at most 200 accepted questions for 30 days on the device.
- [x] Send validated `avoidQuestions` through initial and replacement boundaries.
- [x] Reject normalized exact duplicates and paraphrases at a 0.75 threshold.
- [x] Regenerate rejected cards only, at most three times each.
- [x] Store only accepted package and replacement questions.
- [x] Add `Reset variasi pertanyaan` and truthful privacy copy.
- [x] Update domain/spec/ADR privacy decisions.
- [x] Pass public-boundary tests, type checking, production build, React Doctor, and responsive browser verification.

## Answer

Added a separate device-local question variation history with a 200-question cap and per-entry 30-day expiry. Initial package and replacement requests send only the current bounded history as `avoidQuestions`; active package questions are not duplicated in replacement history. The provider prompt treats history items as data, while deterministic normalization and 0.75 word/topic similarity remain the enforcement boundary. Rejected candidates are replaced individually with one shared 90-second operation deadline and at most three attempts.

The setup screen now explains the temporary request use and lack of server persistence, shows the current local-history count, and exposes `Reset variasi pertanyaan` without clearing analytics. Product vocabulary, the MVP spec, README privacy guidance, and ADR 0006 document the narrowed ephemeral-session decision.

Verification: 54 domain tests and 19 UI tests pass; TypeScript and the production PWA build pass; `git diff --check` passes. React Doctor remains at 81/100 with the same four pre-existing `App` structure/custom-modal warnings and no new diagnostic family. Browser checks at 320, 390, and 430 px found no horizontal overflow, console errors, or Vite overlay; the variation copy and reset control were present and accessible. Browser checks used viewport emulation rather than a physical device.

## Comments

- 2026-08-21: User approved a 200-question, 30-day device history, 0.75 similarity threshold, three regeneration attempts, and reset control.
- 2026-08-21: Approved public TDD seams are `question-history`, `QuestionGenerator`, and the `App` request/reset flow.
