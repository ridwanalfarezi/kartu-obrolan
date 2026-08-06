# 05 — Polish the mobile PWA experience

**What to build:** Make the complete conversation flow feel warm, playful, slightly mischievous, and comfortable to use from one shared phone, while clearly setting expectations for explorative mode.

**Blocked by:** 03 — Complete the question package flow.

**Status:** resolved

- [x] Home, setup, and question-card screens are usable at common mobile viewport sizes.
- [x] Question cards prioritize legibility and provide comfortably sized touch targets.
- [x] Category and depth choices have clear selected, unselected, loading, and disabled states.
- [x] Card transitions use lightweight motion without obstructing interaction or accessibility.
- [x] The session setup clearly explains that explorative mode may include adult, sensitive, or controversial questions.
- [x] The app can be installed as a PWA and launches into a usable standalone experience.

## Answer

Polished the complete mobile flow around the existing violet, amber, and card-table visual language. Setup choices retain explicit selected and unselected treatments, the generation step moves into a dedicated loading state, and in-flight question actions use clear disabled states. Mobile helper and metadata text is now at least 14 px, primary controls remain at least 44 px tall, and question changes use a short directional transition that respects `prefers-reduced-motion`.

The setup now warns that explorative mode can include adult, sensitive, or controversial topics and explicitly reminds the group that every question may be skipped. Added a production PWA manifest, standalone portrait launch settings, branded standard/maskable/Apple icons, automatic service-worker updates, and a Workbox precache for the application shell. AI generation intentionally remains online-only.

Verification: all 22 automated tests pass (10 domain and 12 UI), TypeScript passes, and the production build generates an 11-entry precache plus `manifest.webmanifest`, `sw.js`, and Workbox runtime. Preview HTTP checks returned 200 with correct content types for the application shell, manifest, service worker, and 192/512/maskable icons. Automated desktop-browser access to localhost was denied by the browser security policy in this run, so no new live screenshot was captured; the preceding 320x568 browser audit had no horizontal overflow, console errors, or Vite overlay.
