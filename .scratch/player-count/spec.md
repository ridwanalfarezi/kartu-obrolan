# Exact player count for conversation sessions

## Outcome

Make every question package fit the exact number of people sharing the phone by requiring a player count before generation and carrying it through the full conversation session.

## Product decisions

- A conversation session supports 2–12 players.
- Player count is a required numeric choice on the existing setup screen, before category and depth.
- Missing, non-integer, below-range, and above-range values receive an inline Indonesian error and do not start generation.
- The accepted count remains in client session state, is visible during the question flow, and is reused for retries, regeneration, and replay with the same settings.
- Initial and replacement requests send the exact count through the provider-neutral `QuestionGenerator` boundary.
- Gemini is instructed to address all players collectively without creating a reader, host, or facilitator role. Known facilitator, card-narrator, and impossible two-player phrasing is rejected at the generated-output boundary.
- Existing exact-duplicate rejection and active-package avoidance remain unchanged.

## Acceptance criteria

- A user must explicitly enter a supported player count before a session starts.
- The initial package and every replacement receive the same exact count.
- Two-player questions never require or assume three or more people.
- Questions remain player-neutral and do not use `bacakan`, `tanyakan`, `pilih tiga orang`, `tunjuk teman`, or first-person card narration.
- `Lewati` and `Buat ulang` remain available in the shared-phone question flow.
- The setup remains usable at 320–430 px and matches the existing Meja Tengah design system.
