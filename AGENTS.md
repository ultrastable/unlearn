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
- Vendored core files stay current by themselves: `vendor-sync.yml` daily fetches what the core's registry maps for Unlearn, tests, commits to main, and the platform redeploys (`node vendor/ultrastable/tools/vendor_sync.mjs --check` is the probe). Never edit `vendor/` by hand.
- Feeds: `/feed.xml` (Atom) and `/feed.json` (JSON Feed 1.1, read by the platform's stickiness step) share one item list (`feedItems` in `worker/site.js`).
- STATIC-1 (Rowan, 2026-11-25: "Static content is NOT autonomous"): content grows by the loops, not by hand. Discovery walks Europe PMC every six hours (newest plus the back catalogue by cursor), drafts pass the grounding guards, and a guarded draft publishes itself after `LAB.publish_after_hours` unless readers vote it down. Hand-written entries are re-graded hourly by the evidence loop. Grading stays honest: a draft is always labelled a draft from one paper.

<!-- ultrastable:standard (TENANT-STANDARD-1: written by the platform scaffold; write the tenant's own rules outside this block) -->
## Platform standard

- Bootstrap: at the start of every session fetch https://raw.githubusercontent.com/ultrastable/ultrastable/main/agents/AGENTS.md and follow it. It carries the current fleet-wide rules and wins over anything stale here.
- Test: `npm test` (`node --test --no-warnings worker/*.test.mjs`). CI runs it on every pull request and push to main.
- Standard: `python3 vendor/ultrastable/tools/tenantstd.py --check --tenant .` reads this repository against `vendor/ultrastable/tenant-standard.json`; CI runs it too. Fix the repository, never the standard.
- Identity: `ultrastable.json` `identity` (name, summary, repository, public URL, the Worker it runs as) and the README's Live block are written by the platform from its registries; never type them here.
- Contract: `worker/contract.js` declares every statement a page makes, the page and the endpoint that backs it (FLEET-CONTRACT-1). Change a page and its statement together; `worker/contract.test.mjs` reads both ways against the real router.
- Vendored core files: never edit `vendor/ultrastable/` by hand. `vendor-sync.yml` refreshes it daily from the core's registry, tests, and commits to main (`node vendor/ultrastable/tools/vendor_sync.mjs --check` is the probe).
- Deploy: the platform builds this repository's `main` into the `ultrastable-unlearn` Worker (D1 `ultrastable-unlearn`). Nothing here holds a credential and no agent deploys from here.
- Branches: `branch-cleanup.yml` deletes a branch when its pull request is merged or closed (BRANCH-CLEANUP-1).
- Dependencies: none. Plain Worker modules and Node's built-in test runner.
<!-- /ultrastable:standard -->
