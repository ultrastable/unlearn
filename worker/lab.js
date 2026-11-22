// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// The improvement loops behind the encyclopedia. Every step that uses a model is grounded and guarded: a model may only label or re-phrase,
// and every label it gives must quote a sentence that is really in the abstract it read. Nothing a model writes changes an entry's sources.
//   1. triage:   read each new review's abstract and classify it against the belief (supports, contradicts, mixed, unrelated), with a quote.
//   2. regrade:  from the classified reviews, mark each entry stable, reinforced (strength raised one step) or challenged (flagged on the page
//                and queued for re-writing). Pure function, so the rule is testable and visible at /how.
//   3. discover: search Europe PMC daily for reviews about myths and misconceptions, and draft candidate beliefs for /lab from the abstract
//                alone; readers vote on which should become entries.
//   4. variants: when an entry's explanation changes few minds, draft another wording of "where the intuition slips" from the entry's own
//                text, test it against the current one on the "did this change your view" answers, and keep the winner.
import { ENTRIES, STRENGTH } from "./entries.js";
import { titleMatch, EVIDENCE } from "./evidence.js";

export const LAB = {
  triage_per_beat: 3,
  drafts_per_beat: 2,
  discover_every_hours: 24,
  regrade_min: 2,            // classified reviews needed before an entry is marked reinforced or challenged
  variant_min_answers: 20,   // an entry needs this many "changed my view" answers before a new wording is drafted
  variant_min_arm: 40,       // answers per arm before a trial can be decided
  variant_max_arm: 300,      // a trial with no clear winner by then keeps the current wording
  z: 1.96
};
export const STANCES = ["supports_belief", "contradicts_belief", "mixed", "unrelated"];
const RANKED = Object.entries(STRENGTH).sort((a, b) => a[1].rank - b[1].rank).map(([k]) => k);

const norm = s => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();
const digits = s => (String(s || "").match(/\d+(?:[.,]\d+)?/g) || []);
export function grounded(quote, text) { const q = norm(quote); return q.length >= 30 && norm(text).includes(q); }
// New wording may not bring in a number or a name the entry does not already contain.
export function noNewFacts(candidate, source) {
  const have = new Set(digits(source)); if (digits(candidate).some(d => !have.has(d))) return false;
  const words = new Set(String(source).split(/[^A-Za-z']+/).map(w => w.toLowerCase()));
  const caps = String(candidate).split(/(?<=[.!?])\s+/).flatMap(sent => sent.split(/\s+/).slice(1)).map(w => w.replace(/[^A-Za-z']/g, "")).filter(w => /^[A-Z]/.test(w));
  return caps.every(w => words.has(w.toLowerCase()));
}
function parseJSON(text) {
  if (!text) return null;
  const m = String(text).match(/\{[\s\S]*\}/); if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}

// ---- 1. triage -------------------------------------------------------------------------------------------------------------------------
export function triagePrompt(entry, lead) {
  return [{ role: "system", content: "You classify a research abstract against a popular belief. Reply with JSON only: {\"stance\": one of supports_belief, contradicts_belief, mixed, unrelated, \"quote\": one sentence copied exactly from the abstract that shows the stance}. Use unrelated when the abstract does not test the belief." },
    { role: "user", content: `Belief: ${entry.belief}\n\nAbstract (${lead.title}):\n${String(lead.abstract).slice(0, 3000)}` }];
}
export function checkTriage(out, abstract) {
  const j = parseJSON(out);
  if (!j || !STANCES.includes(j.stance)) return { ok: false, why: "no stance" };
  if (j.stance === "unrelated") return { ok: true, stance: "unrelated", quote: null };
  if (!grounded(j.quote, abstract)) return { ok: false, why: "quote not in abstract" };
  return { ok: true, stance: j.stance, quote: String(j.quote).trim().slice(0, 500) };
}

// ---- 2. regrade (pure) -----------------------------------------------------------------------------------------------------------------
export function regrade(entry, leads) {
  const c = s => leads.filter(l => l.stance === s).length;
  const sup = c("supports_belief"), con = c("contradicts_belief"), mix = c("mixed");
  let status = "stable", strength = entry.strength, why = "No classified new reviews disagree with this grade.";
  if (sup >= LAB.regrade_min && sup >= con) { status = "challenged"; why = `${sup} newer reviews support the belief; this entry is queued to be re-written.`; }
  else if (con >= LAB.regrade_min && ["contradicts", "mostly-contradicts", "unsupported"].includes(entry.direction)) {
    status = "reinforced"; const i = RANKED.indexOf(entry.strength);
    if (entry.strength !== "mixed" && i < RANKED.length - 1) strength = RANKED[Math.max(i + 1, RANKED.indexOf("moderate"))];
    why = `${con} newer reviews point the same way as this entry.`;
  }
  return { status, strength, base_strength: entry.strength, supports: sup, contradicts: con, mixed: mix, why };
}

// ---- 3. discover -----------------------------------------------------------------------------------------------------------------------
export const DISCOVER_QUERY = '(TITLE:"myth" OR TITLE:"myths" OR TITLE:"misconception" OR TITLE:"misconceptions" OR TITLE:"common belief" OR TITLE:"popular belief" OR TITLE:"debunking") AND (PUB_TYPE:"systematic-review" OR PUB_TYPE:"review" OR TITLE:"meta-analysis" OR TITLE:"systematic review")';
export async function discover(since, fetchFn, entries = ENTRIES) {
  const url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=10&sort=FIRST_PDATE_D%20desc&query=" + encodeURIComponent(`${DISCOVER_QUERY} AND FIRST_PDATE:[${since} TO 3000-01-01]`);
  const r = await fetchFn(url, { headers: { "user-agent": EVIDENCE.ua, accept: "application/json" } });
  if (!r.ok) throw new Error("europepmc " + r.status);
  const list = ((await r.json()).resultList || {}).result || [];
  const cited = entries.flatMap(e => e.sources.map(s => s.title));
  return list.filter(x => x.abstractText && !cited.some(t => titleMatch(t, x.title) >= 0.8)).map(x => ({
    ref: x.doi ? "doi:" + String(x.doi).toLowerCase() : x.pmid ? "pmid:" + x.pmid : "epmc:" + x.id, title: String(x.title || "").slice(0, 400),
    venue: String(x.journalTitle || (x.journalInfo && x.journalInfo.journal && x.journalInfo.journal.title) || "").slice(0, 200), year: Number(x.pubYear) || null,
    url: x.doi ? "https://doi.org/" + x.doi : x.pmid ? "https://europepmc.org/article/MED/" + x.pmid : "https://europepmc.org/search?query=" + encodeURIComponent(x.title || ""),
    abstract: String(x.abstractText).replace(/<[^>]+>/g, " ").slice(0, 4000) }));
}
export function draftPrompt(c) {
  return [{ role: "system", content: "From one research abstract, state the popular belief it tests and what it found. Reply with JSON only: {\"belief\": the popular belief in one plain sentence as people say it, \"says\": what the review found in one or two plain sentences, using only facts in the abstract, \"quote\": one sentence copied exactly from the abstract that supports what it found}. If the abstract does not test a popular belief, reply {\"belief\": null}." },
    { role: "user", content: `${c.title}\n\n${String(c.abstract).slice(0, 3500)}` }];
}
export function checkDraft(out, c) {
  const j = parseJSON(out);
  if (!j || !j.belief) return { ok: false, why: "no belief" };
  const belief = String(j.belief).trim(), says = String(j.says || "").trim();
  if (belief.length < 10 || belief.length > 200 || says.length < 20 || says.length > 500) return { ok: false, why: "length" };
  if (!grounded(j.quote, c.abstract)) return { ok: false, why: "quote not in abstract" };
  if (!noNewFacts(says, c.abstract + " " + c.title)) return { ok: false, why: "fact not in abstract" };
  return { ok: true, draft: { belief, says, quote: String(j.quote).trim().slice(0, 500) } };
}

// ---- 4. variants -----------------------------------------------------------------------------------------------------------------------
export function variantPrompt(entry) {
  return [{ role: "system", content: "You rewrite one short explanation so it helps a reader who holds a popular belief see where their intuition goes wrong. Respectful, concrete, no blame. Use only facts already in the text given; add no numbers, names or studies. One or two sentences. Reply with the explanation only." },
    { role: "user", content: `Belief: ${entry.belief}\nWhy it feels true: ${entry.feels}\nWhat the evidence shows: ${entry.says}\nCurrent explanation of where the intuition slips: ${entry.slip}` }];
}
export function checkVariant(out, entry) {
  const t = String(out || "").replace(/^["'\s]+|["'\s]+$/g, "").replace(/\s+/g, " ");
  if (t.length < 30 || t.length > 320) return { ok: false, why: "length" };
  if (norm(t) === norm(entry.slip)) return { ok: false, why: "same as current" };
  if (/https?:|www\./i.test(t)) return { ok: false, why: "link" };
  if (!noNewFacts(t, [entry.belief, entry.feels, entry.says, entry.slip, entry.instead, entry.holds].join(" "))) return { ok: false, why: "new fact" };
  return { ok: true, text: t };
}
// Two-proportion test on "changed my view" (yes or a little) between control and challenger.
export function decide(control, challenger) {
  if (control.total < LAB.variant_min_arm || challenger.total < LAB.variant_min_arm) return "running";
  const p1 = control.yes / control.total, p2 = challenger.yes / challenger.total, p = (control.yes + challenger.yes) / (control.total + challenger.total);
  const se = Math.sqrt(p * (1 - p) * (1 / control.total + 1 / challenger.total));
  const z = se > 0 ? (p2 - p1) / se : 0;
  if (z >= LAB.z) return "challenger";
  if (z <= -LAB.z || (control.total >= LAB.variant_max_arm && challenger.total >= LAB.variant_max_arm)) return "control";
  return "running";
}
// Which entry most needs a better explanation: enough answers, lowest share of readers whose view shifted.
export function pickForVariant(shift, busy, entries = ENTRIES) {
  return entries.filter(e => !busy.has(e.id) && shift[e.id] && shift[e.id].total >= LAB.variant_min_answers)
    .sort((a, b) => shift[a.id].yes / shift[a.id].total - shift[b.id].yes / shift[b.id].total)[0] || null;
}
