# 02 — Start a conversation session

**What to build:** Let a hangout group open the mobile-first app, choose a category and depth, start an accountless conversation session, and see the first question card from an AI-generated package of 10 questions.

**Blocked by:** 01 — Validate the technical foundation and AI provider.

**Status:** resolved

- [x] The home screen provides a clear `Mulai sesi` action.
- [x] Session setup offers the agreed categories and casual, personal, and deep depth options.
- [x] Starting a session requests one question package containing exactly 10 validated questions.
- [x] The first question card is displayed after successful generation.
- [x] Starting a session requires no account, login, payment, or room code.
- [x] Question content and session history are not persisted on the server.

## Answer

Implemented the mobile-first React flow from home to setup, loading, error recovery, and the first question. The server-only Gemini boundary uses `gemini-3.5-flash-lite`, validates exactly 10 unique non-empty questions, and does not persist the package or session. Verified with domain tests, UI tests, production build, browser checks at 320 px, 390 px, and desktop, plus one successful live Gemini generation.
