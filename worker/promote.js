// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// TENANT-PROMO-1: promotion is part of a tenant's role. Unlearn serves its social queue at /social-queue.json (built by the shared
// seed/worker/src/promoqueue.js, drained by the core publisher within social/gate.json) and links the other live systems that run on Ultrastable
// from every page, read from doctrine/stakeholders.json so a new sibling appears here without a code change. Check: foundation/tenantpromo.py.
import { promoQueue } from "../../../seed/worker/src/promoqueue.js";
import SH from "../../../doctrine/stakeholders.json" with { type: "json" };
import { ENTRIES, CATEGORIES, DIRECTION, STRENGTH } from "./entries.js";

export const SITE = "https://unlearn.ultrastable.org";
export const HOOK = "Unlearn runs on Ultrastable.";
export const START = "2026-11-23", EVERY_DAYS = 2;

// Live siblings with a public home, never this app itself.
export const SIBLINGS = (SH.showcases || []).filter(c => c.status === "live" && c.home && c.id !== "unlearn").map(c => ({ id: c.id, name: c.name, home: c.home }));

// Entries in turn across topics, so consecutive posts are about different subjects.
export function order(entries = ENTRIES, cats = CATEGORIES) {
  const by = cats.map(c => entries.filter(e => e.cat === c.id)), out = [];
  for (let i = 0; by.some(l => i < l.length); i++) for (const l of by) if (i < l.length) out.push(l[i]);
  return out;
}

export function postText(e) {
  const st = (STRENGTH[e.strength] || {}).name || "";
  return `Common belief: ${e.belief}\n${DIRECTION[e.direction].name}${st ? ` (${st.toLowerCase()} evidence)` : ""}. Guess first, then see the studies:`;
}

export function socialQueue(now = Date.now()) {
  const items = order().map(e => ({ id: e.id, path: "/e/" + e.id, text: postText(e), kind: "belief" }));
  return promoQueue({ tenant: "unlearn", site: SITE, hook: HOOK, items, start: START, every_days: EVERY_DAYS, now });
}
