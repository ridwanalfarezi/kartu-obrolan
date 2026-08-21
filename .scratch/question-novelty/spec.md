# Device-local question novelty

## Outcome

Keep question packages fresh across conversation sessions without accounts or server-side history by remembering recently accepted questions on the user's device.

## Product decisions

- Remember at most 200 accepted questions in device `localStorage` for 30 days.
- Send the current device history as `avoidQuestions` only while generating a package or replacement; the server does not persist it.
- Normalize case, punctuation, and whitespace for exact matching.
- Reject paraphrases at a 0.75 word/topic similarity threshold.
- Regenerate only rejected candidates, with at most three replacement attempts per candidate.
- Save only candidates that pass final validation.
- Provide `Reset variasi pertanyaan` on the setup screen with immediate, accessible feedback.
- A storage failure must never block the conversation flow.

## Acceptance criteria

- A new package request includes the unexpired device history as `avoidQuestions`.
- Exact duplicates and paraphrases of device history or accepted package candidates are rejected.
- The two regret-question examples in the product decision are treated as similar.
- Rejected candidates are regenerated individually and retries are bounded at three.
- Only a fully accepted package or accepted replacement is added to device history.
- History retains the newest 200 entries and removes entries older than 30 days.
- Reset removes question history without removing anonymous analytics.
- The setup screen truthfully explains temporary request use and lack of server persistence.
