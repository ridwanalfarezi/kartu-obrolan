# Kartu Obrolan MVP

## Outcome

Help a group of friends start and sustain a casual conversation by presenting AI-generated questions one at a time on a shared mobile device.

## Users and context

- Primary users: groups of two or more adult friends.
- Context: spontaneous, casual hangouts.
- Device pattern: one phone is passed around or viewed by the group.

## Core flow

1. The user opens the mobile-first web app.
2. The user taps `Mulai sesi`.
3. The user selects one category and one depth.
4. The AI generates a package of 10 questions.
5. The app shows one question card at a time.
6. The group can use `Lewati`, `Buat ulang`, or `Pertanyaan berikutnya`.
7. When generation fails, the app shows a clear error and `Coba lagi`.
8. The session ends when the package is finished or the user leaves; no server-side history is retained.

## Categories and depth

Categories include light, funny, experience-based, reflective, and mixed. Depth options are casual, personal, and deep.

The default language is natural, casual Indonesian. Explorative mode permits adult, sensitive, or controversial topics when relevant to the selected category and depth.

## Product boundaries

### In scope

- Mobile-first/PWA experience.
- Three primary screens: home, session settings, and question card.
- AI-generated question package of 10 cards.
- Skip, regenerate, next-question, and retry actions.
- Provider-neutral AI boundary.
- Anonymous minimal analytics: session count, selected category, and skipped-question count.

### Out of scope for MVP

- User accounts, login, payments, or subscriptions.
- Saved sessions or server-side conversation history.
- Free-form prompts.
- Multi-device rooms, room codes, or real-time synchronization.
- Static question-library fallback when AI is unavailable.
- Choosing a specific AI provider or model before technical validation.

## Acceptance criteria

- A group can start a session without registering or logging in.
- A session can be configured with category and depth.
- A successful generation produces 10 questions and displays them individually.
- The active question can be skipped or replaced.
- AI failures are visible and recoverable through `Coba lagi`.
- The experience is usable on a mobile viewport and communicates its playful, warm tone.
- No conversation content or session history is persisted on the server.
- Analytics, if enabled, contains only the agreed anonymous minimal metrics.

## Open decisions

- AI provider and model selection after comparing quality, latency, cost, and limits.
- Exact prompt contract and response validation for the provider-neutral AI boundary.
- Hosting and runtime choice for the PWA and AI request boundary.
- Final content presentation and wording for the explorative-mode disclosure.
