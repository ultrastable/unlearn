// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// Unlearn: an evidence encyclopedia of popular beliefs the evidence contradicts (entries.js, pages in site.js, evidence loop in evidence.js),
// plus the original coaching companion for the adult beside a curious child, now at /coach ("Most of what kids want to learn, you can't teach them.").
// One Worker, one D1 database, one hourly cron. It needs no secret and no model to run: moves come from the library (moves.js), chosen by
// weights learned from 7 and 14 day follow-ups; a Workers AI model may re-word a move only inside the daily cap and behind the answer guard.
// The hourly beat re-learns weights, records metrics, opens the next phase when its gates are met (../phases.json) and prunes old data.
// Year-long safeguards: instances/unlearn/runway.json. Tests: instances/unlearn/worker/logic.test.mjs, worker.test.mjs.
import { MOVES, AGE_BANDS } from "./moves.js";
import { LIMITS, LED, FIRST_KINDS, nextKinds, topicOf, pickMove, render, guardRewording, classifyNote, dueFollowups, metrics, openPhase, gateReport, PHASES } from "./logic.js";
import MODELS from "../../../doctrine/models.json" with { type: "json" };
import { page } from "./page.js";
import { ENTRIES, CATEGORIES } from "./entries.js";
import { checkEntries, freshness, reviewQueue } from "./evidence.js";
import { home, topics, topic, entryPage, searchPage, playPage, howPage, sitemap, entryJson, byId, notFound } from "./site.js";

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS explorations (id TEXT PRIMARY KEY, token TEXT UNIQUE NOT NULL, created INTEGER NOT NULL, topic TEXT NOT NULL, age TEXT, move_id TEXT NOT NULL, move_text TEXT NOT NULL, reworded INTEGER NOT NULL DEFAULT 0, f7 INTEGER, f14 INTEGER, adult TEXT, grp TEXT, pseudonym TEXT)",
  "CREATE INDEX IF NOT EXISTS ix_expl_created ON explorations(created)",
  "CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, exploration TEXT NOT NULL, created INTEGER NOT NULL, text TEXT, label TEXT NOT NULL, asks INTEGER NOT NULL, tells INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS move_weights (move_id TEXT PRIMARY KEY, yes INTEGER NOT NULL DEFAULT 0, no INTEGER NOT NULL DEFAULT 0, updated INTEGER)",
  "CREATE TABLE IF NOT EXISTS groups_ (code TEXT PRIMARY KEY, created INTEGER NOT NULL, name TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS counters (day TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, key))",
  "CREATE TABLE IF NOT EXISTS beats (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, started_at TEXT NOT NULL, phase INTEGER NOT NULL, metrics TEXT NOT NULL, pruned INTEGER NOT NULL DEFAULT 0, error TEXT)",
  "CREATE TABLE IF NOT EXISTS state (k TEXT PRIMARY KEY, v TEXT NOT NULL)",
  // encyclopedia: source DOIs resolved by Crossref, new reviews found on Europe PMC, when each entry was last checked, anonymous reader taps
  "CREATE TABLE IF NOT EXISTS sources (key TEXT PRIMARY KEY, entry TEXT NOT NULL, doi TEXT, found_title TEXT, tried INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, entry TEXT NOT NULL, ref TEXT NOT NULL, title TEXT, venue TEXT, year INTEGER, url TEXT, found INTEGER NOT NULL, reviewed INTEGER NOT NULL DEFAULT 0, UNIQUE(entry, ref))",
  "CREATE TABLE IF NOT EXISTS evidence_checks (entry TEXT PRIMARY KEY, at INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS reader_counts (entry TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (entry, key))"
];
// Columns added after the first deploy. SQLite has no ADD COLUMN IF NOT EXISTS, so a duplicate-column error means already applied;
// any other error is thrown (never swallowed).
const COLUMNS = ["ALTER TABLE explorations ADD COLUMN led TEXT"];
async function addColumns(db) {
  for (const sql of COLUMNS) {
    try { await db.prepare(sql).run(); } catch (e) { if (!/duplicate column/i.test(String(e && e.message))) throw e; }
  }
}
const ready = new WeakMap();  // per database binding (one isolate can serve tests with several)
async function ensure(db) { if (!ready.has(db)) ready.set(db, db.batch(SCHEMA.map(s => db.prepare(s))).then(() => addColumns(db)).catch(e => { ready.delete(db); throw e; })); return ready.get(db); }
const day = (ms = Date.now()) => new Date(ms).toISOString().slice(0, 10);
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" } });
const say = (code, message, s = 400) => J({ ok: false, code, message }, s);  // USER-BACKEND-1: plain words for the user, detail stays server-side
const rid = () => crypto.randomUUID().replace(/-/g, "");
export function halted(env) { const v = String((env && env.HALT) || "").trim().toLowerCase(); return v === "1" || v === "true" || v === "on"; }

async function bump(db, key, ms = Date.now()) {
  const r = await db.prepare("INSERT INTO counters (day, key, n) VALUES (?1, ?2, 1) ON CONFLICT(day, key) DO UPDATE SET n = n + 1 RETURNING n").bind(day(ms), key).first();
  return r ? r.n : 0;
}
async function sourceKey(req) {  // a daily, one-way key per source: the address itself is never stored
  const ip = req.headers.get("cf-connecting-ip") || "unknown";
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + "|" + day()));
  return "src:" + [...new Uint8Array(h)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}
async function allowWrite(db, req) { return (await bump(db, await sourceKey(req))) <= LIMITS.writes_per_source_day; }
const TAPS_PER_SOURCE_DAY = 300;  // reader guesses and shifts have their own cap, so playing never uses up the coaching cap
async function allowTap(db, req) { return (await bump(db, (await sourceKey(req)) + ":tap")) <= TAPS_PER_SOURCE_DAY; }
async function getState(db, k, d = null) { const r = await db.prepare("SELECT v FROM state WHERE k=?1").bind(k).first(); return r ? JSON.parse(r.v) : d; }
async function setState(db, k, v) { await db.prepare("INSERT INTO state (k, v) VALUES (?1, ?2) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(k, JSON.stringify(v)).run(); }

export function modelOrder() { const avail = new Set(MODELS.available || []); return (MODELS.fallback_order || []).filter(m => avail.has(m)); }

// Optional re-wording. Any failure (no binding, cap reached, model retired, guard refusal) returns the library text: the app never stops on AI.
async function reword(env, db, text, topic) {
  if (!env.AI || env.AI_OFF === "1") return { text, reworded: false, why: "ai off" };
  const cap = Number(env.AI_DAILY_CAP || LIMITS.ai_calls_day);
  if ((await bump(db, "ai_calls")) > cap) return { text, reworded: false, why: "daily cap" };
  const prompt = [{ role: "system", content: "You re-word coaching tips for a parent or coach of a curious child. Keep the same action. Never explain the answer to the child's question, never state facts about the topic, never add links. One or two short sentences, plain words." },
    { role: "user", content: `Topic: ${topic}\nTip: ${text}\nRe-word the tip so it fits this topic naturally. Reply with the tip only.` }];
  for (const model of modelOrder()) {
    try {
      const r = await env.AI.run(model, { messages: prompt, max_tokens: 160 });
      const out = typeof r === "string" ? r : (r && (r.response ?? (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content))) || "";
      const g = guardRewording(text, out);
      if (g.ok) return { text: g.text, reworded: true, model };
      await bump(db, "ai_guard_refused");
      return { text, reworded: false, why: "guard: " + g.why };
    } catch (e) {
      await bump(db, "ai_error:" + model);
      console.error("unlearn ai", model, e && e.message);  // logged and counted; the next model in the order is tried
    }
  }
  return { text, reworded: false, why: "no model answered" };
}

async function weights(db) {
  const { results } = await db.prepare("SELECT move_id, yes, no FROM move_weights").all();
  return Object.fromEntries((results || []).map(r => [r.move_id, { yes: r.yes, no: r.no }]));
}

export async function computeMetrics(db, now = Date.now()) {
  const since = now - 56 * 86400000;
  const ex = (await db.prepare("SELECT f14, led FROM explorations WHERE f14 IS NOT NULL OR led IS NOT NULL").all()).results || [];
  const kinds = ((await db.prepare("SELECT move_id FROM explorations WHERE created >= ?1").bind(since).all()).results || []).map(r => (MOVES.find(m => m.id === r.move_id) || {}).kind).filter(Boolean);
  const notes = (await db.prepare("SELECT label FROM notes").all()).results || [];
  const adults = await db.prepare("SELECT COUNT(DISTINCT adult) n FROM explorations WHERE created >= ?1 AND adult IS NOT NULL").bind(since).first();
  const schools = await db.prepare("SELECT COUNT(DISTINCT grp) n FROM explorations WHERE created >= ?1 AND grp IS NOT NULL").bind(since).first();
  const leaks = await db.prepare("SELECT COALESCE(SUM(n),0) n FROM counters WHERE key='move_answer_leaks'").first();
  const dpia = await getState(db, "dpia_complete", 0);
  const m = metrics({ explorations: ex, notes, adults8w: adults ? adults.n : 0, schools8w: schools ? schools.n : 0, leaks: leaks ? leaks.n : 0, dpia, kinds8w: kinds });
  const totals = await db.prepare("SELECT COUNT(*) n, SUM(CASE WHEN created >= ?1 THEN 1 ELSE 0 END) d7 FROM explorations").bind(now - 7 * 86400000).first();
  return { ...m, explorations_total: totals ? totals.n : 0, explorations_7d: totals ? (totals.d7 || 0) : 0 };
}

// The encyclopedia's evidence loop needs the network. In the Worker it uses fetch; tests inject env.FETCH; anywhere else it is skipped.
function evidenceFetch(env) {
  if (env.FETCH) return env.FETCH;
  if (env.EVIDENCE_OFF === "1") return null;
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers" ? fetch : null;
}
async function checkedMap(db) { return Object.fromEntries((((await db.prepare("SELECT entry, at FROM evidence_checks").all()).results) || []).map(r => [r.entry, r.at])); }
async function doiMap(db, entry) {
  const { results } = await db.prepare("SELECT key, doi FROM sources WHERE entry=?1 AND doi IS NOT NULL").bind(entry).all();
  return Object.fromEntries((results || []).map(r => [Number(r.key.split("#")[1]), r.doi]));
}
async function readerCounts(db, entry) {
  const { results } = await db.prepare("SELECT key, n FROM reader_counts WHERE entry=?1").bind(entry).all();
  return Object.fromEntries((results || []).map(r => [r.key, r.n]));
}
// Encyclopedia measures: evidence coverage and freshness, and what readers' taps show (surprise = wrong guesses / guesses; shift = yes or a little / answers).
export async function encyclopediaMetrics(db, now = Date.now()) {
  const src = await db.prepare("SELECT COUNT(*) n, SUM(CASE WHEN doi IS NOT NULL THEN 1 ELSE 0 END) d FROM sources").first();
  const leads = await db.prepare("SELECT COUNT(*) n FROM leads WHERE reviewed=0").first();
  const rc = (await db.prepare("SELECT entry, key, n FROM reader_counts").all()).results || [];
  let guesses = 0, wrong = 0, shiftYes = 0, shiftAll = 0; const per = {};
  for (const r of rc) {
    const e = byId[r.entry]; if (!e) continue;
    per[r.entry] = per[r.entry] || { g: 0, w: 0 };
    if (r.key.startsWith("guess:")) { guesses += r.n; per[r.entry].g += r.n; if (Number(r.key.slice(6)) !== e.guess.answer) { wrong += r.n; per[r.entry].w += r.n; } }
    if (r.key.startsWith("shift:")) { shiftAll += r.n; if (r.key !== "shift:no") shiftYes += r.n; }
  }
  const fresh = freshness(await checkedMap(db), now);
  const sources_total = ENTRIES.reduce((n, e) => n + e.sources.length, 0);
  const surprising = Object.entries(per).filter(([, v]) => v.g >= 5).map(([entry, v]) => ({ entry, surprise: v.w / v.g, guesses: v.g })).sort((a, b) => b.surprise - a.surprise).slice(0, 6);
  return { entries: ENTRIES.length, categories: CATEGORIES.length, sources_total, sources_resolved: (src && src.d) || 0, leads: (leads && leads.n) || 0,
    entries_fresh: fresh.checked, evidence_fresh_share: fresh.checked / fresh.entries, guesses, surprise_share: guesses ? wrong / guesses : null,
    shift_answers: shiftAll, shift_share: shiftAll ? shiftYes / shiftAll : null, surprising };
}

// The hourly beat: the loop that closes itself.
export async function beat(env, now = Date.now()) {
  const db = env.DB; await ensure(db);
  let err = null, pruned = 0, phase = 1, m = {};
  try {
    // 1. re-learn move weights from answered 14-day follow-ups (yes = the child kept going on their own)
    const { results } = await db.prepare("SELECT move_id, SUM(CASE WHEN f14=1 THEN 1 ELSE 0 END) yes, SUM(CASE WHEN f14=0 THEN 1 ELSE 0 END) no FROM explorations WHERE f14 IS NOT NULL GROUP BY move_id").all();
    if (results && results.length) await db.batch(results.map(r => db.prepare("INSERT INTO move_weights (move_id, yes, no, updated) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(move_id) DO UPDATE SET yes=excluded.yes, no=excluded.no, updated=excluded.updated").bind(r.move_id, r.yes, r.no, now)));
    // 2. measure, 3. open the next phase when its gates hold (never closes a phase it opened: children's groups are not cut off)
    m = await computeMetrics(db, now);
    const prereqs = await getState(db, "prereqs", {});
    const was = await getState(db, "phase", 1);
    phase = Math.max(was, openPhase(m, prereqs));
    if (phase !== was) await setState(db, "phase", phase), await setState(db, "phase_opened_" + phase, new Date(now).toISOString());
    // 4. retention: text older than the limit is removed; counts stay for the measures
    const cut = now - LIMITS.retention_days * 86400000;
    const a = await db.prepare("UPDATE explorations SET topic='(removed after retention period)', move_text='', pseudonym=NULL WHERE created < ?1 AND topic != '(removed after retention period)'").bind(cut).run();
    const b = await db.prepare("UPDATE notes SET text=NULL WHERE created < ?1 AND text IS NOT NULL").bind(cut).run();
    await db.prepare("DELETE FROM counters WHERE day < ?1").bind(day(now - 30 * 86400000)).run();
    await db.prepare("DELETE FROM beats WHERE at < ?1").bind(now - 90 * 86400000).run();
    pruned = ((a.meta && a.meta.changes) || 0) + ((b.meta && b.meta.changes) || 0);
  } catch (e) { err = String(e && e.message || e); console.error("unlearn beat", err); }
  // 5. the encyclopedia's evidence loop: resolve sources, watch for new reviews. A source or search failure is logged and retried next beat;
  // it never stops the coaching loop above.
  const f = evidenceFetch(env);
  if (f) {
    try {
      const ev = await checkEntries(db, now, f);
      m.evidence = { checked: ev.checked, resolved: ev.resolved, new_leads: ev.leads, errors: ev.errors.length };
      for (const x of ev.errors) console.error("unlearn evidence", x);
    } catch (e) { m.evidence = { error: String(e && e.message || e) }; console.error("unlearn evidence", m.evidence.error); }
  }
  await db.prepare("INSERT INTO beats (at, started_at, phase, metrics, pruned, error) VALUES (?1, ?2, ?3, ?4, ?5, ?6)").bind(now, new Date(now).toISOString(), phase, JSON.stringify(m), pruned, err).run();
  return { ok: !err, phase, metrics: m, pruned, error: err };
}

export async function health(env, now = Date.now()) {
  const db = env.DB; await ensure(db);
  const last = await db.prepare("SELECT at, phase, error FROM beats ORDER BY id DESC LIMIT 1").first();
  const age = last ? Math.round((now - last.at) / 60000) : null;
  const ai = await db.prepare("SELECT key, n FROM counters WHERE day=?1 AND (key='ai_calls' OR key LIKE 'ai_error:%' OR key='ai_guard_refused')").bind(day(now)).all();
  const clock = last === null ? "no beat yet" : age <= 90 ? "ticking" : age <= 180 ? "late" : "stopped";
  return { ok: clock !== "stopped" && !(last && last.error), service: "unlearn", phase: last ? last.phase : 1, clock, last_beat_minutes_ago: age, last_error: last ? last.error : null,
    ai: { binding: !!env.AI, models: modelOrder(), today: Object.fromEntries(((ai && ai.results) || []).map(r => [r.key, r.n])) }, halted: halted(env), moves_in_library: MOVES.length,
    encyclopedia: { entries: ENTRIES.length, categories: CATEGORIES.length, evidence_loop: !!evidenceFetch(env) } };
}

async function body(req) { try { return await req.json(); } catch (e) { return null; } }

// Second route for the clock: when the cron has been silent for two hours, the next visit runs the beat itself (CLOCKWORK-1, No single route).
export async function catchUp(env, ctx, now = Date.now()) {
  const last = await env.DB.prepare("SELECT at FROM beats ORDER BY id DESC LIMIT 1").first();
  if (halted(env) || (last && now - last.at < 2 * 3600000)) return false;
  const p = beat(env, now).then(r => { if (!r.ok) console.error("unlearn catch-up beat failed", r.error); });
  if (ctx && ctx.waitUntil) ctx.waitUntil(p); else await p;
  return true;
}

export async function handle(req, env, now = Date.now(), ctx = null) {
  const u = new URL(req.url), db = env.DB;
  if (req.method === "OPTIONS") return new Response(null, { headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST", "access-control-allow-headers": "content-type" } });
  await ensure(db);
  if (u.pathname === "/pulse/watch" && req.method === "POST") {  // RESILIENCE-1 restart route: runs the beat only when it is stale; safe for anyone to call
    const ran = await catchUp(env, null, now); return J({ ok: true, ran });
  }
  if (u.pathname === "/health") { const h = await health(env, now); return J(h, h.ok ? 200 : 503); }
  const html = (h, s = 200) => new Response(h, { status: s, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
  if (req.method === "GET" || req.method === "HEAD") {
    const p = u.pathname.replace(/\/+$/, "") || "/";
    if (p === "/" || p === "/index.html") { await catchUp(env, ctx, now); const m = await encyclopediaMetrics(db, now); return html(home({ stats: m, surprising: m.surprising })); }
    if (p === "/topics") return html(topics());
    if (p.startsWith("/topics/")) { const h = topic(p.slice(8)); if (h) return html(h); }
    if (p.startsWith("/e/")) {
      const e = byId[p.slice(3)];
      if (e) {
        const leads = (await db.prepare("SELECT title, venue, year, url FROM leads WHERE entry=?1 AND reviewed=0 ORDER BY found DESC LIMIT 8").bind(e.id).all()).results || [];
        return html(entryPage(e, { dois: await doiMap(db, e.id), leads, counts: await readerCounts(db, e.id) }));
      }
    }
    if (p === "/search") return html(searchPage(u.searchParams.get("q") || ""));
    if (p === "/play") return html(playPage());
    if (p === "/how") return html(howPage({ fresh: freshness(await checkedMap(db), now), metrics: await encyclopediaMetrics(db, now) }));
    if (p === "/sitemap.xml") return new Response(sitemap(), { headers: { "content-type": "application/xml; charset=utf-8" } });
    if (p === "/robots.txt") return new Response("User-agent: *\nAllow: /\nSitemap: https://unlearn.ultrastable.org/sitemap.xml\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
    if (p === "/api/entries.json") {
      const all = (await db.prepare("SELECT key, entry, doi FROM sources WHERE doi IS NOT NULL").all()).results || [];
      const dmap = {}; for (const r of all) (dmap[r.entry] = dmap[r.entry] || {})[Number(r.key.split("#")[1])] = r.doi;
      return J({ ok: true, categories: CATEGORIES, entries: ENTRIES.map(e => entryJson(e, dmap[e.id] || {})) });
    }
    if (p.startsWith("/api/entries/")) { const e = byId[p.slice(13).replace(/\.json$/, "")]; if (e) return J({ ok: true, entry: entryJson(e, await doiMap(db, e.id)) }); }
    if (p === "/api/freshness") { const fr = freshness(await checkedMap(db), now); return J(fr, fr.ok ? 200 : 503); }
    if (p === "/api/leads") return J({ ok: true, leads: (await db.prepare("SELECT entry, ref, title, venue, year, url, found FROM leads WHERE reviewed=0 ORDER BY found DESC LIMIT 200").all()).results || [] });
    if (p === "/api/review-queue.json") {
      const rows = (await db.prepare("SELECT entry, COUNT(*) n FROM leads WHERE reviewed=0 GROUP BY entry").all()).results || [];
      return J({ ok: true, queue: reviewQueue(Object.fromEntries(rows.map(r => [r.entry, r.n]))) });
    }
  }
  if (u.pathname === "/api/guess" && req.method === "POST") {
    const b = await body(req); const e = b && byId[b.entry]; const c = b && Number(b.choice);
    if (!e || !Number.isInteger(c) || c < 0 || c >= e.guess.options.length) return say("bad", "Pick one of the answers.");
    if (!(await allowTap(db, req))) return J({ ok: true, counted: false });  // over the daily cap: thanked, not counted
    await db.prepare("INSERT INTO reader_counts (entry, key, n) VALUES (?1, ?2, 1) ON CONFLICT(entry, key) DO UPDATE SET n = n + 1").bind(e.id, "guess:" + c).run();
    return J({ ok: true, counted: true, right: c === e.guess.answer });
  }
  if (u.pathname === "/api/shift" && req.method === "POST") {
    const b = await body(req); const e = b && byId[b.entry];
    if (!e || !["yes", "some", "no"].includes(b.shift)) return say("bad", "Choose yes, a little, or no.");
    if (!(await allowTap(db, req))) return J({ ok: true, counted: false });
    await db.prepare("INSERT INTO reader_counts (entry, key, n) VALUES (?1, ?2, 1) ON CONFLICT(entry, key) DO UPDATE SET n = n + 1").bind(e.id, "shift:" + b.shift).run();
    return J({ ok: true, counted: true });
  }
  if (u.pathname === "/coach" || u.pathname === "/coach/") {
    await catchUp(env, ctx, now);
    const phase = await getState(db, "phase", 1);
    return new Response(page({ phase, ages: AGE_BANDS }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }
  if (u.pathname === "/api/metrics" && req.method === "GET") {
    const m = await computeMetrics(db, now), phase = await getState(db, "phase", 1);
    return J({ ok: true, phase, metrics: m, gates: gateReport(m), encyclopedia: await encyclopediaMetrics(db, now), measured_at: new Date(now).toISOString() });
  }
  if (u.pathname === "/api/phase") return J({ ok: true, phase: await getState(db, "phase", 1), phases: PHASES.phases.map(p => ({ id: p.id, name: p.name, audience: p.audience })) });
  if (u.pathname === "/api/curiosity" && req.method === "POST") {
    if (halted(env)) return say("paused", "Unlearn is paused for maintenance. Please try again later.", 503);
    const b = await body(req); const text = b && String(b.text || "").trim();
    if (!text) return say("empty", "Tell us in a few words what the child is curious about.");
    if (!(await allowWrite(db, req))) return say("busy", "That's a lot of curiosities for one day. Come back tomorrow, or follow up on the ones you have.", 429);
    const age = AGE_BANDS.includes(b.age) ? b.age : null, topic = topicOf(text);
    const phase = await getState(db, "phase", 1);
    let grp = null, pseudonym = null;
    if (phase >= 2 && b.group) { const g = await db.prepare("SELECT code FROM groups_ WHERE code=?1").bind(String(b.group).toUpperCase()).first(); if (g) { grp = g.code; pseudonym = b.pseudonym ? String(b.pseudonym).slice(0, 24) : null; } }
    const move = pickMove({ age, weights: await weights(db), kinds: FIRST_KINDS });  // ask-before-answer: the first move asks back or waits
    const base = render(move, topic), rw = await reword(env, db, base, topic);
    const id = rid(), token = rid(), adult = b.adult && /^[a-f0-9]{16,64}$/.test(b.adult) ? b.adult : null;
    await db.prepare("INSERT INTO explorations (id, token, created, topic, age, move_id, move_text, reworded, adult, grp, pseudonym) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)").bind(id, token, now, topic, age, move.id, rw.text, rw.reworded ? 1 : 0, adult, grp, pseudonym).run();
    return J({ ok: true, token, topic, move: { id: move.id, kind: move.kind, text: rw.text }, followups: [7, 14].map(d => new Date(now + d * 86400000).toISOString().slice(0, 10)) });
  }
  if (u.pathname === "/api/another" && req.method === "POST") {  // a different move for the same curiosity
    const b = await body(req); const e = b && await db.prepare("SELECT * FROM explorations WHERE token=?1").bind(String(b.token || "")).first();
    if (!e) return say("unknown", "We couldn't find that curiosity. Start a new one.", 404);
    const move = pickMove({ age: e.age, weights: await weights(db), exclude: [e.move_id], kinds: nextKinds((MOVES.find(m => m.id === e.move_id) || {}).kind) }), base = render(move, e.topic), rw = await reword(env, db, base, e.topic);
    await db.prepare("UPDATE explorations SET move_id=?1, move_text=?2, reworded=?3 WHERE token=?4").bind(move.id, rw.text, rw.reworded ? 1 : 0, e.token).run();
    return J({ ok: true, move: { id: move.id, kind: move.kind, text: rw.text } });
  }
  if (u.pathname === "/api/followup" && req.method === "POST") {
    const b = await body(req); const d = Number(b && b.day);
    if (![7, 14].includes(d) || !b || (b.still !== true && b.still !== false)) return say("bad", "Choose yes or no.");
    const led = d === 14 && LED.includes(b.led) ? b.led : null;  // child-part-visible: who led, only asked at 14 days
    const r = led ? await db.prepare("UPDATE explorations SET f14=?1, led=?2 WHERE token=?3").bind(b.still ? 1 : 0, led, String(b.token || "")).run()
      : await db.prepare(`UPDATE explorations SET f${d}=?1 WHERE token=?2`).bind(b.still ? 1 : 0, String(b.token || "")).run();
    return (r.meta && r.meta.changes) ? J({ ok: true }) : say("unknown", "We couldn't find that curiosity.", 404);
  }
  if (u.pathname === "/api/note" && req.method === "POST") {
    const b = await body(req); const e = b && await db.prepare("SELECT id FROM explorations WHERE token=?1").bind(String(b.token || "")).first();
    if (!e) return say("unknown", "We couldn't find that curiosity.", 404);
    if (!(await allowWrite(db, req))) return say("busy", "That's a lot of notes for one day. Come back tomorrow.", 429);
    const text = String(b.text || "").slice(0, LIMITS.note_max), c = classifyNote(text);
    await db.prepare("INSERT INTO notes (exploration, created, text, label, asks, tells) VALUES (?1,?2,?3,?4,?5,?6)").bind(e.id, now, text, c.label, c.asks, c.tells).run();
    const tip = c.label === "telling" ? "That note reads like telling. Next time, try turning one sentence into a question back to them." : c.label === "asking" ? "Nice: that's coaching by asking." : "Noted.";
    return J({ ok: true, label: c.label, tip });
  }
  if (u.pathname === "/api/mine" && req.method === "POST") {  // the adult's own list, by the tokens their browser holds
    const b = await body(req); const toks = (b && Array.isArray(b.tokens) ? b.tokens : []).slice(0, 50).map(String);
    if (!toks.length) return J({ ok: true, items: [] });
    const { results } = await db.prepare(`SELECT token, created, topic, move_text, f7, f14 FROM explorations WHERE token IN (${toks.map((_, i) => "?" + (i + 1)).join(",")})`).bind(...toks).all();
    return J({ ok: true, items: (results || []).map(r => ({ token: r.token, topic: r.topic, move: r.move_text, created: new Date(r.created).toISOString().slice(0, 10), due: dueFollowups(r.created, [r.f7 !== null && 7, r.f14 !== null && 14].filter(Boolean), now), f7: r.f7, f14: r.f14 })).sort((a, z) => z.created.localeCompare(a.created)) });
  }
  if (u.pathname === "/api/group" && req.method === "POST") {  // phase 2: a coach group code; the school keeps who is who
    if ((await getState(db, "phase", 1)) < 2) return say("not_yet", "School groups open when the first phase meets its goals. Coaches and parents can start now.", 403);
    if (!(await allowWrite(db, req))) return say("busy", "Too many groups today.", 429);
    const b = await body(req); const code = rid().slice(0, 6).toUpperCase();
    await db.prepare("INSERT INTO groups_ (code, created, name) VALUES (?1, ?2, ?3)").bind(code, now, String((b && b.name) || "Group").slice(0, 60)).run();
    return J({ ok: true, code });
  }
  if (req.method === "GET" && !u.pathname.startsWith("/api/")) return html(notFound(), 404);
  return say("not_found", "There's nothing here.", 404);
}

export default {
  async fetch(req, env, ctx) {
    try { return await handle(req, env, Date.now(), ctx); }
    catch (e) { console.error("unlearn fetch", e && e.stack || e); return say("error", "Something went wrong on our side. It has been logged; please try again in a minute.", 500); }
  },
  async scheduled(event, env, ctx) { if (halted(env)) return; ctx.waitUntil(beat(env).then(r => { if (!r.ok) console.error("unlearn beat failed", r.error); })); }
};
