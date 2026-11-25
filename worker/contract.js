// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// FLEET-CONTRACT-1: what Unlearn states, the page that shows each statement and the endpoint that backs it. The shared module
// (vendor/ultrastable/contract.js, the core's seed/worker/src/contract.js) serves /.well-known/ultrastable.json and /claims.json from this one
// declaration; contract.test.mjs runs its verify() against the real router, and the platform runs the same reading against the deployed site.
// Every sentence below is printed on the page it names (site.js, page.js); change the page and this file together.
import { SITE } from "./promote.js";

export const SPEC = {
  name: "Unlearn",
  summary: "Popular beliefs and famous findings set against the evidence: guess first, then see the studies.",
  url: SITE,
  repo: "ultrastable/unlearn",
  statements: [
    { id: "sources", text: "Every entry cites its sources; an hourly loop checks them and watches for new reviews.", page: "/", api: "/api/entries.json" },
    { id: "hourly-check", text: "Every hour the beat checks a batch of entries: it resolves each cited study to a DOI and searches for reviews published since the entry was last checked.", page: "/how", api: "/api/freshness" },
    { id: "new-evidence", text: "New reviews appear on the entry as \"New evidence the loop found\".", page: "/how", api: "/api/leads" },
    { id: "review-queue", text: "When enough new reviews pile up, the entry goes on the review queue for re-grading.", page: "/how", api: "/api/review-queue.json" },
    { id: "regrade", text: "When enough newer reviews point the same way, the entry is marked reinforced and its grade rises one step.", page: "/how", api: "/api/grades.json" },
    { id: "live-numbers", text: "The numbers on the How it works page are live: entries checked, sources matched to a DOI, new reviews found and the share of readers whose view shifted.", page: "/how", api: "/api/metrics" },
    { id: "lab", text: "The loop drafts candidate beliefs from new reviews and shows them in the Lab, where readers vote on them.", page: "/lab", api: "/api/candidates.json" },
    { id: "practices", text: "Each practice is graded like every other entry and comes with a small trial you can start in a minute.", page: "/change", api: "/api/practices.json" },
    { id: "phases", text: "Unlearn's coaching side opens in phases, each gated on measured results.", page: "/coach", api: "/api/phase" },
    { id: "graph", text: "Every entry, study, researcher, journal, new review and Lab draft on Unlearn is a node in one graph, rebuilt by the hourly loop.", page: "/graph", api: "/api/graph" },
  ],
  internal: [
    { path: "/api/entries/*", why: "one entry of /api/entries.json by id (the sources statement's data); each entry page /e/<id> shows the same record" },
    { path: "/api/graph/*", why: "sub-routes of the graph statement's endpoint (insights, node, method, health, follow), all shown on /graph" },
    { path: "/api/guess", why: "POST only: records a reader's guess from the entry page; nothing to read" },
    { path: "/api/shift", why: "POST only: records the 'did this change how you see it' tap; totals are read at /api/metrics" },
    { path: "/api/plan", why: "POST only: anonymous trial events from /plan; totals are read at /api/practices.json" },
    { path: "/api/candidate-vote", why: "POST only: a reader's Lab vote; counts are read at /api/candidates.json" },
    { path: "/api/curiosity", why: "POST only: the coach form on /coach; returns a move for that one request" },
    { path: "/api/another", why: "POST only: a different move for the same curiosity on /coach" },
    { path: "/api/followup", why: "POST only: the 7 and 14 day follow-up answer from /coach" },
    { path: "/api/note", why: "POST only: an optional coach note from /coach" },
    { path: "/api/mine", why: "POST only: the adult's own list, by tokens their browser holds" },
    { path: "/api/group", why: "POST only: a phase 2 coach group code; dark in phase 1" },
  ],
};
