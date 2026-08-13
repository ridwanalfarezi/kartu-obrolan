# 08 — Make question cards player-neutral

**What to build:** Ensure generated question cards work for two or more players without assuming a specific group size or giving the card a first-person narrator voice.

**Blocked by:** 03 — Complete the question package flow.

**Status:** resolved

- [x] Initial question packages support two or more players without mentioning a fixed player count.
- [x] Replacement questions use the same player-neutral contract.
- [x] Every card is written directly to all players and can be answered by anyone.
- [x] Prompts prohibit a first-person card narrator such as `gue`, `aku`, or `saya`.
- [x] Product, domain, design, and README documentation use the same audience model.
- [x] Prompt behaviour is covered through the public `QuestionGenerator` boundary.

## Answer

Replaced the previous 3–8-person and read-aloud prompt assumptions with one shared audience contract used by both package generation and replacement generation. The model is now instructed to support two or more adult players, avoid explicit player counts, address every card directly to the whole group, and never speak as a first-person card narrator. A concrete bad/good example clarifies that `Apa hal dari gue yang kalian nggak suka?` must be reframed neutrally.

Verification: 21 domain tests and 14 UI tests pass, TypeScript passes, `git diff --check` passes, and the production PWA build succeeds.
