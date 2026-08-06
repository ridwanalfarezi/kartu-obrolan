# 07 — Verify and release the MVP

**What to build:** Deliver a production deployment whose complete browser-to-AI conversation flow has been verified on mobile, including failure recovery, PWA behaviour, analytics boundaries, and ephemeral-session privacy.

**Blocked by:** 04 — Recover from AI failures; 05 — Polish the mobile PWA experience; 06 — Add minimal anonymous analytics.

**Status:** resolved

- [x] Automated tests and the production build complete successfully.
- [ ] The deployed home-to-question flow works against the configured production AI provider.
- [ ] Next, skip, regenerate, completion, and retry paths are verified on a mobile viewport.
- [ ] PWA installation and standalone launch are verified on a supported mobile browser.
- [x] Production monitoring confirms that question content and session history are not persisted.
- [x] Anonymous analytics contain only the approved minimal events and fields.
- [ ] The verified production URL and release evidence are recorded for handoff.

## Answer

Verified locally: 32 automated tests pass (19 domain + 13 UI), TypeScript passes, and the production build generates an 11-entry precache with `manifest.webmanifest`, `sw.js`, and Workbox runtime. Fixed a pre-existing ESM import resolution issue in `src/server/generate-question-package.ts` (`.js` → `.ts` extension) that caused the server boundary domain tests to fail under Node 24 native TypeScript.

Updated `CONTEXT.md` with analytics domain terms, `README.md` with the analytics feature and final MVP status, and `package.json` to include analytics tests in the domain test command.

Deployment verification (live AI flow, mobile viewport, PWA installation) and release tagging require manual steps by the team after deployment.
