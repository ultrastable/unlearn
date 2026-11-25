# Unlearn: agent instructions

> Ultrastable is the foundation for any autonomous system.

Unlearn is a tenant system on Ultrastable. This repository holds its code: the evidence encyclopedia and its loops (`worker/`), the coaching
tool's phases (`phases.json`), and core files it reads, vendored under `vendor/ultrastable/`. Its manifest (IDEA.md, instance.json,
lifecycle.json, runway.json) and the platform rules every agent follows live in the core repository, `ultrastable/ultrastable`
(`agents/AGENTS.md`, `instances/unlearn/`, `doctrine/tenant-repos.json`).

- Test: `node --test worker/*.test.mjs` (CI runs it on every pull request).
- Deploy: the platform builds this repository's `main` into the `ultrastable-unlearn` Worker (D1 `ultrastable-unlearn`, Workers AI, hourly
  cron, `unlearn.ultrastable.org`). Nothing here holds a credential.
- Honest grading: nothing publishes on an unverified citation; a model may only label or re-word, never add a number, a name or a source.
- No child accounts and no child data; no cookies; reader taps are anonymous counts.
