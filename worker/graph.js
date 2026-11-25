// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// KGRAPH-1 for Unlearn: the encyclopedia's knowledge graph, built and kept current by the hourly beat with the shared engine
// (vendor/ultrastable/knowledge.js, kept equal to the core by vendor-sync). Every piece of data Unlearn holds is a record: each entry (its
// topic, the studies it cites, their authors and venues, the beliefs it is related to), each new review the evidence loop found for an entry,
// and each Lab draft with the paper it came from. The engine finds what nobody wrote down: beliefs that rest on the same researchers' work,
// researchers whose work spans topics, entries with no systematic review behind them. Each finding is checked later (a suggested
// connection is kept when readers follow it or an editor links it), and kinds of finding that come true are trusted more next time.
// Pages: /graph (live: re-measured on every load), connections on each entry page. Data: /api/graph.json, /api/graph/insights, /api/graph/method.
import { runKg, insights, kgHealth, analysis, practices, methodHtml, follow, handleKg, nodeId } from "../vendor/ultrastable/knowledge.js";
import { ENTRIES, CATEGORIES } from "./entries.js";

export const TENANT = "unlearn";
const byId = Object.fromEntries(ENTRIES.map(e => [e.id, e]));
const catName = Object.fromEntries(CATEGORIES.map(c => [c.id, c.name]));

// "Braga, Welsh and Schnell" -> three people; "Branas et al." -> Branas; an organisation stays whole.
export function authorsOf(s) {
  const t = String(s || "").replace(/\bet al\.?/g, "").trim();
  if (!t) return [];
  if (/council|academies|organization|organisation|institute|association|panel|committee|office/i.test(t)) return [t];
  return t.split(/,\s*|\s+and\s+|\s*&\s*/).map(x => x.trim()).filter(Boolean);
}

export const MAPPERS = {
  entry: (e, { node, edge }) => {
    const me = node("entry", e.belief, { strength: e.strength, direction: e.direction, slug: e.id }, "entry:" + e.id);
    edge(me, "in_topic", node("topic", catName[e.cat] || e.cat, { slug: e.cat }, "topic:" + e.cat));
    for (const s of e.sources || []) {
      const st = node("study", s.title, { year: s.year, design: s.design });
      edge(me, "cites", st);
      if (s.design === "review" || s.design === "consensus" || s.design === "replication") edge(me, "cites_review", st);
      for (const a of authorsOf(s.authors)) { const au = node("author", a); edge(st, "by", au); edge(me, "draws_on", au, { weight: 0.5 }); }  // the entry-to-researcher shortcut makes a shared researcher a shared neighbour
      if (s.venue) edge(st, "in_venue", node("venue", s.venue));
    }
    for (const r of e.related || []) if (byId[r]) edge(me, "related", node("entry", byId[r].belief, { slug: r }, "entry:" + r));
  },
  lead: (l, { node, edge }) => {
    if (!byId[l.entry] || !l.title) return;
    const st = node("study", l.title, { year: l.year || null, found_by: "evidence loop", stance: l.stance || null });
    edge(st, "new_evidence_for", node("entry", byId[l.entry].belief, { slug: l.entry }, "entry:" + l.entry));
    if (l.venue) edge(st, "in_venue", node("venue", l.venue));
  },
  draft: (c, { node, edge }) => {
    if (!c.belief || !c.title) return;
    edge(node("draft", c.belief, { lab_id: c.id }, "draft:" + c.id), "drafted_from", node("study", c.title, { year: c.year || null }));
  },
};

export const SPEC = {
  predict: [{ from: "entry", to: "entry" }],
  via_kinds: ["study", "author"],  // only shared research counts as evidence for a connection, so "rest on the same research" stays true
  bridge_kinds: ["author"],
  gaps: [
    { id: "no-review", kind: "entry", need: { rel: "cites_review", dir: "out" }, weight: 0.6, text: n => `"${n.label}" cites no systematic review, expert panel or multi-lab replication yet.` },
    { id: "no-related", kind: "entry", need: { rel: "related", dir: "out" }, weight: 0.4, text: n => `"${n.label}" is not linked to any related belief.` },
  ],
  link_text: (a, b, via) => `"${a}" and "${b}" are not linked, but rest on the same research (${via.slice(0, 3).join("; ")}).`,
  bridge_text: (n, k) => `Research by ${n} is cited across ${k} separate clusters of beliefs: a thread that ties them together.`,
  max_new_per_run: 6,
};

export async function records(db, entries = ENTRIES) {
  const rows = async sql => { try { return (await db.prepare(sql).all()).results || []; } catch (e) { if (/no such table/.test(String(e && e.message))) return []; throw e; } };
  const leads = await rows("SELECT id, entry, title, venue, year, stance FROM leads ORDER BY id DESC LIMIT 1500");
  const drafts = (await rows("SELECT id, title, year, draft FROM candidates WHERE status='drafted' ORDER BY id DESC LIMIT 500"))
    .map(c => { let d = null; try { d = JSON.parse(c.draft); } catch (e) { d = null; } return { id: c.id, title: c.title, year: c.year, belief: d && d.belief }; });
  return [...entries.map(e => ({ type: "entry", source: "entry/" + e.id, data: e })), ...leads.map(l => ({ type: "lead", source: "lead/" + l.id, data: l })),
    ...drafts.map(c => ({ type: "draft", source: "draft/" + c.id, data: c }))];
}

// Step 7 of the hourly beat.
export async function graphBeat(db, now = Date.now()) {
  return runKg(db, { tenant: TENANT, records: await records(db), mappers: MAPPERS, spec: SPEC, now });
}

// Suggested connections for one entry: open or confirmed link findings that name it and are not already a "related" link.
export async function connections(db, entryId, limit = 4) {
  const me = "entry:" + entryId, e = byId[entryId], rel = new Set((e && e.related) || []);
  const rows = [...await insights(db, TENANT, { kind: "link", status: "open", limit: 300 }), ...await insights(db, TENANT, { kind: "link", status: "kept", limit: 300 })];
  const out = [];
  for (const r of rows) {
    if (r.subject !== me && r.object !== me) continue;
    const other = (r.subject === me ? r.object : r.subject).slice(6);
    if (!byId[other] || rel.has(other) || out.some(x => x.entry.id === other)) continue;
    out.push({ id: r.id, entry: byId[other], why: r.text, status: r.status });
    if (out.length >= limit) break;
  }
  return out;
}

export async function graphHealth(db, now = Date.now()) { return kgHealth(db, TENANT, now); }
export async function graphApi(req, db, now = Date.now()) { return handleKg(req, db, { tenant: TENANT, now }); }
export async function graphFollow(db, id) { return follow(db, TENANT, id); }

// Everything the /graph page shows, read live.
export async function graphView(db, now = Date.now()) {
  const [a, p, open, kept] = await Promise.all([analysis(db, TENANT), practices(db, TENANT, now), insights(db, TENANT, { status: "open", limit: 30 }), insights(db, TENANT, { status: "kept", limit: 10 })]);
  const ids = a ? [...new Set([...(a.hubs || []), ...(a.bridges || [])])].slice(0, 40) : [];
  const labels = {};
  if (ids.length) for (const r of ((await db.prepare(`SELECT id, kind, label FROM kg_nodes WHERE tenant = ? AND retired_at IS NULL AND id IN (${ids.map(() => "?").join(",")})`).bind(TENANT, ...ids).all()).results || [])) labels[r.id] = { kind: r.kind, label: r.label };
  return { analysis: a, practices: p, method: methodHtml(p), open, kept, labels };
}
export { nodeId };
