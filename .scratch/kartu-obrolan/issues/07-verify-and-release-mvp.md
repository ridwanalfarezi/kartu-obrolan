# 07 — Verify and release the MVP

**What to build:** Deliver a production deployment whose complete browser-to-AI conversation flow has been verified on mobile, including failure recovery, PWA behaviour, analytics boundaries, and ephemeral-session privacy.

**Blocked by:** 04 — Recover from AI failures; 05 — Polish the mobile PWA experience; 06 — Add minimal anonymous analytics.

**Status:** ready-for-agent

- [ ] Automated tests and the production build complete successfully.
- [ ] The deployed home-to-question flow works against the configured production AI provider.
- [ ] Next, skip, regenerate, completion, and retry paths are verified on a mobile viewport.
- [ ] PWA installation and standalone launch are verified on a supported mobile browser.
- [ ] Production monitoring confirms that question content and session history are not persisted.
- [ ] Anonymous analytics contain only the approved minimal events and fields.
- [ ] The verified production URL and release evidence are recorded for handoff.
