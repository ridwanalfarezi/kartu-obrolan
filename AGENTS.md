## Agent skills

### Coding task routing

- Use Sol Advisor as the top-level orchestration layer for features, bug fixes, refactors, and other substantial code changes. It owns route selection, architecture, delegation, verification, review, and final acceptance.
- Select and fully follow only the smallest relevant set of Matt Pocock skills installed in `.agents/skills`; do not require the user to name them and do not load unrelated skills.
- Use `impeccable` for UI or interaction work, preserving the established product and design system.
- Prefer solo execution. Delegate only when task risk or genuinely independent work justifies it, and carry every applicable selected-skill requirement into each delegated-agent prompt.
- Preserve uncommitted and unrelated work. Follow this repository's issue-tracker workflow, `CONTEXT.md`, applicable ADRs, existing interfaces, and established verification commands.

### Issue tracker

Issues and specs are tracked as local Markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default five triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo using root-level `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.
