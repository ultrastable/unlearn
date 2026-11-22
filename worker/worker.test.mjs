// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// Unlearn end to end on an in-memory SQLite standing in for D1: ask, move, follow-up, note, beat, phase gate, retention, health, budget.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker, { handle, beat, health, modelOrder } from './index.js';
import { MOVES } from './moves.js';
import { leaksAnswer, openPhase, metrics, topicOf, classifyNote, pickMove, guardRewording, LIMITS, nextKinds, kindVariety } from './logic.js';
import PHASES from '../phases.json' with { type: 'json' };

function d1() {
  const raw = new DatabaseSync(':memory:');
  const stmt = (sql) => { let a = []; const o = { bind(...x) { a = x; return o; },
    async all() { return { results: raw.prepare(sql).all(...a).map(r => ({ ...r })) }; },
    async first() { const r = raw.prepare(sql).get(...a); return r ? { ...r } : null; },
    async run() { const r = raw.prepare(sql).run(...a); return { meta: { changes: Number(r.changes) } }; }, _sql: sql }; return o; };
  return { raw, prepare: stmt, async batch(list) { const out = []; for (const s of list) out.push(await s.run()); return out; } };
}
const env = (extra = {}) => ({ DB: d1(), ...extra });
const post = (p, b, ip = '1.2.3.4') => new Request('https://u.test' + p, { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip }, body: JSON.stringify(b) });
const get = (p) => new Request('https://u.test' + p);
const DAY = 86400000;

test('page renders the pill ask bar with a mic and age chips', async () => {
  const r = await handle(get('/'), env()); const h = await r.text();
  assert.equal(r.status, 200); assert.match(h, /class="pill"/); assert.match(h, /id="mic"/); assert.match(h, /data-age="6-9"/);
  assert.doesNotMatch(h, /Coaching a school group/, 'phase 2 UI stays dark in phase 1');
});

test('a curiosity gets a library move with no model, never an explanation, and follow-ups at 7 and 14 days', async () => {
  const e = env(); const r = await handle(post('/api/curiosity', { text: 'She wants to know why the bread rose', age: '6-9' }), e, Date.UTC(2026, 10, 21));
  const j = await r.json(); assert.equal(j.ok, true); assert.equal(j.topic, 'why the bread rose');
  assert.ok(MOVES.some(m => m.id === j.move.id)); assert.equal(leaksAnswer(j.move.text), false);
  assert.deepEqual(j.followups, ['2026-11-28', '2026-12-05']);
});

test('no library move explains an answer, and every kind and age band is covered', () => {
  for (const m of MOVES) assert.equal(leaksAnswer(m.text), false, m.id);
  for (const k of ['ask', 'try', 'connect', 'wait']) for (const a of ['u6', '6-9', '10-13', '14+']) assert.ok(MOVES.some(m => m.kind === k && (m.ages === 'any' || m.ages.split(',').includes(a))), k + ' ' + a);
});

test('a model re-wording that explains is refused and the library text is kept; a retired model falls through to the next', async () => {
  const calls = [];
  const AI = { async run(model) { calls.push(model); if (calls.length === 1) throw new Error('5028: model deprecated'); return { response: 'It rises because yeast makes gas.' }; } };
  const e = env({ AI }); const j = await (await handle(post('/api/curiosity', { text: 'why bread rises' }), e)).json();
  assert.equal(leaksAnswer(j.move.text), false); assert.ok(calls.length >= 2, 'tried the next model'); assert.equal(calls[0], modelOrder()[0]);
  const h = await health(e); assert.ok(h.ai.today['ai_error:' + calls[0]] >= 1); assert.equal(h.ai.today.ai_guard_refused, 1);
  assert.equal(guardRewording('', 'Ask them what they think makes it puff up, then wait.').ok, true);
});

test('the AI daily cap holds and the app keeps answering from the library', async () => {
  let n = 0; const AI = { async run() { n++; return { response: 'Ask them what they have noticed so far, and listen.' }; } };
  const e = env({ AI, AI_DAILY_CAP: '2' });
  for (let i = 0; i < 4; i++) { const j = await (await handle(post('/api/curiosity', { text: 'clouds ' + i }, '9.9.9.' + i), e)).json(); assert.equal(j.ok, true); }
  assert.equal(n, 2);
});

test('writes per source per day are capped with a plain message', async () => {
  const e = env(); let last;
  for (let i = 0; i <= LIMITS.writes_per_source_day; i++) last = await handle(post('/api/curiosity', { text: 'x' + i }), e);
  assert.equal(last.status, 429); assert.match((await last.json()).message, /tomorrow/);
});

test('follow-ups, notes and the beat close the loop: weights learn, metrics measure, telling is caught', async () => {
  const e = env(), t0 = Date.UTC(2026, 0, 1);
  const j = await (await handle(post('/api/curiosity', { text: 'magnets' }), e, t0)).json();
  const mine = await (await handle(post('/api/mine', { tokens: [j.token] }), e, t0 + 15 * DAY)).json();
  assert.deepEqual(mine.items[0].due, [7, 14]);
  assert.equal((await handle(post('/api/followup', { token: j.token, day: 14, still: true }), e)).status, 200);
  const n = await (await handle(post('/api/note', { token: j.token, text: 'I explained that magnets have poles. I told her how it works.' }), e)).json();
  assert.equal(n.label, 'telling');
  const b = await beat(e, t0 + 15 * DAY); assert.equal(b.ok, true);
  assert.equal(b.metrics.continuation_14d, 1); assert.equal(b.metrics.telling_share, 1);
  const w = e.DB.raw.prepare('SELECT yes FROM move_weights WHERE move_id=?').get(j.move.id); assert.equal(w.yes, 1);
});

test('phase 2 opens by itself when the phase 1 gates hold, and its school-group UI lights', async () => {
  const e = env(), t = Date.UTC(2026, 5, 1);
  for (let i = 0; i < 120; i++) { const adult = (i % 25).toString(16).padStart(16, '0');
    const j = await (await handle(post('/api/curiosity', { text: 'q' + i, adult }, '10.0.' + i + '.1'), e, t)).json();
    await handle(post('/api/followup', { token: j.token, day: 14, still: i % 3 !== 0 }), e);
    if (i < 60) await handle(post('/api/note', { token: j.token, text: 'What do you think happens next? I asked what she noticed.' }, '10.1.' + i + '.1'), e, t); }
  assert.equal((await handle(post('/api/group', {}), e, t)).status, 403);
  const b = await beat(e, t + DAY); assert.equal(b.phase, 2);
  assert.equal((await handle(post('/api/group', { name: 'Coach A' }, '10.9.9.9'), e, t)).status, 200);
  assert.match(await (await handle(get('/'), e)).text(), /Coaching a school group/);
  const m = await (await handle(get('/api/metrics'), e, t + DAY)).json(); assert.ok(m.gates[0].gates.every(g => g.met));
});

test('phase 3 never opens on metrics alone: it needs its privacy prerequisites', () => {
  const m = { continuation_14d: 0.9, continuation_14d_n: 500, telling_share: 0.1, telling_share_n: 500, active_adults_8w: 99, schools_active_8w: 9, dpia_complete: 1 };
  assert.equal(openPhase(m, {}), 2);
  assert.equal(openPhase(m, Object.fromEntries(PHASES.phases[2].prerequisites.map(k => [k, true]))), 3);
});

test('retention removes old text and keeps the counts; health reports a stopped clock', async () => {
  const e = env(), t0 = Date.UTC(2025, 0, 1);
  await handle(post('/api/curiosity', { text: 'volcanoes' }), e, t0);
  await beat(e, t0 + (LIMITS.retention_days + 1) * DAY);
  assert.equal(e.DB.raw.prepare('SELECT topic FROM explorations').get().topic, '(removed after retention period)');
  const h = await health(e, t0 + (LIMITS.retention_days + 1) * DAY + 5 * 3600000); assert.equal(h.clock, 'stopped'); assert.equal(h.ok, false);
});

test('HALT stops the cron and new writes; reads keep serving', async () => {
  const e = env({ HALT: '1' }); let ran = false;
  await worker.scheduled({}, e, { waitUntil() { ran = true; } }); assert.equal(ran, false);
  assert.equal((await handle(post('/api/curiosity', { text: 'x' }), e)).status, 503);
  assert.equal((await handle(get('/api/phase'), e)).status, 200);
});

test('helpers', () => {
  assert.equal(topicOf('My son keeps asking how planes stay up?'), 'how planes stay up');
  assert.equal(classifyNote('What do you think? Why?').label, 'asking');
  assert.ok(pickMove({ age: 'u6', rand: () => 0.5 }));
  assert.equal(metrics({}).continuation_14d, null);
  assert.ok(modelOrder().length >= 1, 'doctrine/models.json names at least one available fallback model');
});

test('a silent cron is caught up by the next visit (second route for the clock)', async () => {
  const e = env(), t = Date.UTC(2026, 10, 21, 12);
  await handle(get('/'), e, t);
  assert.equal(e.DB.raw.prepare('SELECT COUNT(*) n FROM beats').get().n, 1, 'first visit with no beat runs one');
  await handle(get('/'), e, t + 3600000);
  assert.equal(e.DB.raw.prepare('SELECT COUNT(*) n FROM beats').get().n, 1, 'a recent beat is not repeated');
  await handle(get('/'), e, t + 3 * 3600000);
  assert.equal(e.DB.raw.prepare('SELECT COUNT(*) n FROM beats').get().n, 2);
});

test('the restart route runs a stale beat once and is idempotent', async () => {
  const e = env(), t = Date.UTC(2026, 10, 22);
  assert.equal((await (await handle(post('/pulse/watch', {}), e, t)).json()).ran, true);
  assert.equal((await (await handle(post('/pulse/watch', {}), e, t + 60000)).json()).ran, false);
});

// Research principles in code (phases.json principles; research: https://claude.ai/artifact/9tSXs9RsEVf4xi3Hr4v9kW).
test('the first move asks or waits, and another climbs the help ladder', async () => {
  const e = env(), t = Date.UTC(2026, 10, 22);
  for (let i = 0; i < 20; i++) {
    const j = await (await handle(post('/api/curiosity', { text: 'how magnets work ' + i, age: '10-13' }, '9.9.9.' + i), e, t)).json();
    assert.ok(['ask', 'wait'].includes(j.move.kind), 'first move ' + j.move.id);
    const a = await (await handle(post('/api/another', { token: j.token }), e, t)).json();
    assert.equal(a.move.kind, 'try', 'second rung is something to try');
    const b = await (await handle(post('/api/another', { token: j.token }), e, t)).json();
    assert.equal(b.move.kind, 'connect', 'third rung is someone or somewhere to go');
    const c = await (await handle(post('/api/another', { token: j.token }), e, t)).json();
    assert.equal(c.move.kind, 'connect', 'the top rung stays; explaining is never a rung');
  }
  assert.deepEqual(nextKinds('ask'), ['try']); assert.deepEqual(nextKinds('connect'), ['connect']);
});

test('who led at 14 days is recorded and measured', async () => {
  const e = env(), t = Date.UTC(2026, 10, 22);
  const toks = [];
  for (let i = 0; i < 4; i++) toks.push((await (await handle(post('/api/curiosity', { text: 'bees ' + i }, '8.8.8.' + i), e, t)).json()).token);
  for (const [i, led] of [[0, 'child'], [1, 'child'], [2, 'together'], [3, 'adult']]) assert.equal((await handle(post('/api/followup', { token: toks[i], day: 14, still: true, led }), e, t)).status, 200);
  assert.equal((await handle(post('/api/followup', { token: toks[0], day: 7, still: true, led: 'adult' }), e, t)).status, 200);
  const m = (await (await handle(get('/api/metrics'), e, t)).json()).metrics;
  assert.equal(m.child_led_14d, 0.5); assert.equal(m.child_led_14d_n, 4);
  assert.equal(e.DB.raw.prepare("SELECT led FROM explorations WHERE token=?").get(toks[0]).led, 'child', 'a day-7 answer never overwrites who led');
});

test('move kind variety is measured (wide walls)', async () => {
  assert.equal(kindVariety([]), null); assert.equal(kindVariety(['ask', 'ask']), 0); assert.equal(kindVariety(['ask', 'try', 'connect', 'wait']), 1);
  const e = env(), t = Date.UTC(2026, 10, 22);
  await handle(post('/api/curiosity', { text: 'clouds' }), e, t);
  const m = (await (await handle(get('/api/metrics'), e, t)).json()).metrics;
  assert.equal(m.move_kind_variety_8w, 0);
});

test('no extrinsic hooks: the page has no score, streak, badge, points or leaderboard', async () => {
  const h = await (await handle(get('/'), env())).text();
  assert.doesNotMatch(h.replace(/No grades, streaks or child accounts/g, ''), /\b(streaks?|badges?|points|leaderboard|score|level up|XP)\b/i);
});

test('an existing database gains the led column once, and a second start does not fail', async () => {
  const e = env();
  e.DB.raw.exec("CREATE TABLE explorations (id TEXT PRIMARY KEY, token TEXT UNIQUE NOT NULL, created INTEGER NOT NULL, topic TEXT NOT NULL, age TEXT, move_id TEXT NOT NULL, move_text TEXT NOT NULL, reworded INTEGER NOT NULL DEFAULT 0, f7 INTEGER, f14 INTEGER, adult TEXT, grp TEXT, pseudonym TEXT)");
  await handle(get('/api/phase'), e);
  assert.ok(e.DB.raw.prepare("PRAGMA table_info(explorations)").all().some(c => c.name === 'led'));
  const e2 = { DB: { ...e.DB } };  // a fresh isolate on the same database re-runs the migration
  await handle(get('/api/phase'), e2);
  assert.ok(e.DB.raw.prepare("PRAGMA table_info(explorations)").all().some(c => c.name === 'led'));
});
