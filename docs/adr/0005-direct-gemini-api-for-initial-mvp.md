# Direct Gemini API for the initial MVP

The initial MVP sends AI requests directly to the Gemini Developer API through the Google provider for Vercel AI SDK, using `gemini-3.5-flash-lite` and the Gemini free tier. This supersedes only the initial AI Gateway transport described in ADR-0004 because AI Gateway could not perform inference without adding a billing card; the provider-neutral `QuestionGenerator` boundary from ADR-0002 remains unchanged so the transport and model can still be replaced later.

The Gemini API key must remain in the server environment and must never be exposed to the browser. Initial requests send the selected category, depth, explorative-mode setting, and exact player count. Replacement requests also send the active generated-question package so Gemini can avoid repeating it. The application does not send or persist the players' answers or conversation content.
