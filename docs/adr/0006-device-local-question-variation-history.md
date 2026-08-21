# Device-local question variation history

The MVP remembers at most 200 accepted questions for 30 days in the user's browser so new conversation sessions can avoid exact repeats and close paraphrases without accounts or a database. The browser sends this bounded list as `avoidQuestions` only while requesting a package or replacement; application code and server functions do not persist it as server-side history.

Gemini receives an explicit avoidance instruction, but prompt guidance is not treated as enforcement. Generated candidates are normalized for case, punctuation, and whitespace, then compared by word/topic similarity at a 0.75 threshold. A rejected candidate is regenerated individually at most three times. Only the accepted final package or replacement is added to device history.

This deliberately narrows the earlier ephemeral-session decision: conversation sessions and answers remain temporary and no history is retained on the server, while recent question text may persist on one device solely for variation. The setup screen discloses that behavior and provides `Reset variasi pertanyaan`, which does not clear anonymous analytics.
