// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// Unlearn logic: pure functions, tested by instances/unlearn/worker/logic.test.mjs. No I/O here.
import { MOVES, KINDS, fits } from "./moves.js";
import PHASES from "../phases.json" with { type: "json" };

export const LIMITS = { text_max: 280, note_max: 1000, writes_per_source_day: 30, ai_calls_day: 200, retention_days: 400 };

export function topicOf(text) {
  let t = String(text || "").replace(/\s+/g, " ").trim().slice(0, LIMITS.text_max);
  t = t.replace(/^(she|he|they|my (son|daughter|kid|child)|the (kid|child))\s+(wants? to know|asked|is curious about|wonders?|keeps asking)\s+/i, "");
  t = t.replace(/[?.!]+$/, "");
  return t.length > 80 ? t.slice(0, 77).replace(/\s+\S*$/, "") + "..." : t || "this";
}

// Beta-Bernoulli sampling over move outcomes: a move that keeps children going (yes at 14 days) is picked more; an untried one still gets tried.
export function pickMove({ age, weights = {}, rand = Math.random, exclude = [] }) {
  const pool = MOVES.filter(m => fits(m, age) && !exclude.includes(m.id));
  let best = null, bestScore = -1;
  for (const m of pool) {
    const w = weights[m.id] || { yes: 0, no: 0 };
    const s = betaSample(1 + w.yes, 1 + w.no, rand);
    if (s > bestScore) { best = m; bestScore = s; }
  }
  return best || MOVES[0];
}
function gammaSample(k, rand) {  // Marsaglia-Tsang for k >= 1
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do { const u1 = rand() || 1e-9, u2 = rand(); x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); v = 1 + c * x; } while (v <= 0);
    v = v * v * v; const u = rand() || 1e-9;
    if (Math.log(u) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v;
  }
}
export function betaSample(a, b, rand = Math.random) { const x = gammaSample(a, rand), y = gammaSample(b, rand); return x / (x + y); }

export function render(move, topic) { return move.text.replaceAll("{topic}", topic); }

// The answer guard: a coaching move may never explain the answer. Used on every model re-wording; a failure falls back to the library text.
const EXPLAIN = [/\bbecause\b/i, /\bthe answer\b/i, /\bis caused by\b/i, /\bthis happens when\b/i, /\bthe reason (is|why)\b/i, /\bit'?s called\b/i, /\bscientists (say|know)\b/i, /\bin fact\b/i, /\bthe truth is\b/i, /\bis (made|due) (of|to)\b/i, /\bworks by\b/i, /\bexplain (to them|that)\b/i, /\btell (them|her|him) (that|how|why)\b/i];
export function leaksAnswer(text) { return EXPLAIN.some(r => r.test(String(text || ""))); }
export function guardRewording(original, candidate) {
  const c = String(candidate || "").trim().replace(/^["']|["']$/g, "");
  if (!c || c.length > 400 || c.length < 20) return { ok: false, why: "length" };
  if (leaksAnswer(c)) return { ok: false, why: "explains" };
  if (/https?:\/\//i.test(c)) return { ok: false, why: "link" };
  return { ok: true, text: c };
}

// Telling versus asking, for an adult's coach note. A note is "telling" when its sentences mostly instruct or explain rather than ask.
export function classifyNote(text) {
  const s = String(text || "").split(/(?<=[.!?])\s+|\n+/).map(x => x.trim()).filter(Boolean);
  if (!s.length) return { asks: 0, tells: 0, label: "empty" };
  let asks = 0, tells = 0;
  for (const x of s) {
    if (/\?\s*$/.test(x) || /^(i asked|we wondered|she asked|he asked|they asked|asked)\b/i.test(x)) asks++;
    else if (/^(i (told|explained|showed|taught|corrected)|told (her|him|them)|explained|i said (that|it)|you have to|you need to|the answer)/i.test(x) || leaksAnswer(x)) tells++;
  }
  return { asks, tells, label: tells > asks ? "telling" : asks > 0 ? "asking" : "neutral" };
}

export function dueFollowups(createdMs, done, nowMs) {
  const day = 86400000, out = [];
  for (const d of [7, 14]) if (!done.includes(d) && nowMs >= createdMs + d * day) out.push(d);
  return out;
}

// Metrics the phase gates read. rows: explorations with fields f14 (1 yes, 0 no, null unanswered); notes with label; moves with leak flag.
export function metrics({ explorations = [], notes = [], adults8w = 0, schools8w = 0, leaks = 0, dpia = 0 }) {
  const answered = explorations.filter(e => e.f14 === 0 || e.f14 === 1);
  const labelled = notes.filter(n => n.label === "telling" || n.label === "asking");
  return {
    continuation_14d: answered.length ? answered.filter(e => e.f14 === 1).length / answered.length : null,
    continuation_14d_n: answered.length,
    telling_share: labelled.length ? labelled.filter(n => n.label === "telling").length / labelled.length : null,
    telling_share_n: labelled.length,
    active_adults_8w: adults8w, schools_active_8w: schools8w, move_answer_leaks: leaks, dpia_complete: dpia
  };
}
const SAMPLE = { continuation_14d: "continuation_14d_n", telling_share: "telling_share_n" };
export function gateMet(g, m) {
  const v = m[g.metric]; if (v === null || v === undefined) return false;
  if (g.min_sample && (m[SAMPLE[g.metric]] || 0) < g.min_sample) return false;
  return g.op === ">=" ? v >= g.value : g.op === "<=" ? v <= g.value : v === g.value;
}
// The open phase: phase N+1 opens when every exit gate of phase N is met. Phase 3 also needs its prerequisites and the identity-bound gate.
export function openPhase(m, prereqs = {}) {
  const ph = PHASES.phases; let open = 1;
  for (let i = 0; i < ph.length - 1; i++) {
    const p = ph[i]; if (!p.exit_gates.length || !p.exit_gates.every(g => gateMet(g, m))) break;
    const next = ph[i + 1];
    if (next.prerequisites && !next.prerequisites.every(k => prereqs[k])) break;
    open = next.id;
  }
  return open;
}
export function gateReport(m) {
  return PHASES.phases.filter(p => p.exit_gates.length).map(p => ({ phase: p.id, name: p.name, gates: p.exit_gates.map(g => ({ ...g, value_now: m[g.metric] ?? null, sample_now: SAMPLE[g.metric] ? m[SAMPLE[g.metric]] : undefined, met: gateMet(g, m) })) }));
}
export { KINDS, PHASES };
