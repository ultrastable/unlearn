// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// UNLEARN-CHANGE-1: practices are graded entries with a private trial kit; the server counts only anonymous events and learns plan order.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { handle } from './index.js';
import { ENTRIES, CATEGORIES, STRENGTH } from './entries.js';
import { PRACTICES, PRACTICE_CATEGORIES, KITS, OVERSOLD } from './practices.js';
import { CHANGE, REASONS, eventKey, rankPlans, practiceStats, ics } from './change.js';
import { checkDraft, SEARCHES } from './lab.js';

function d1() {
  const raw = new DatabaseSync(':memory:');
  const stmt = (sql) => { let a = []; const o = { bind(...x) { a = x; return o; },
    async all() { return { results: raw.prepare(sql).all(...a).map(r => ({ ...r })) }; },
    async first() { const r = raw.prepare(sql).get(...a); return r ? { ...r } : null; },
    async run() { const r = raw.prepare(sql).run(...a); return { meta: { changes: Number(r.changes) } }; } }; return o; };
  return { raw, prepare: stmt, async batch(list) { const out = []; for (const s of list) out.push(await s.run()); return out; } };
}
const get = (p) => new Request('https://u.test' + p);
const post = (p, b, ip = '1.2.3.4') => new Request('https://u.test' + p, { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip }, body: JSON.stringify(b) });
const byId = Object.fromEntries(ENTRIES.map(e => [e.id, e]));

test('practices are full entries in change categories, each with a usable kit, and oversold claims never get one', () => {
  assert.ok(PRACTICES.length >= 15, 'at least 15 practices');
  for (const c of PRACTICE_CATEGORIES) { assert.equal(c.kind, 'change'); assert.ok(CATEGORIES.includes(c)); assert.ok(PRACTICES.filter(p => p.cat === c.id).length >= 3, c.id); }
  for (const p of PRACTICES) {
    assert.ok(ENTRIES.includes(p), p.id + ' is an entry');
    const k = p.change; assert.ok(k, p.id + ' kit');
    assert.ok(k.name.length >= 3 && k.tiny.length > 15 && k.days >= 7 && k.days <= CHANGE.habit_days, p.id + ' kit fields');
    assert.ok(k.plans.length >= 1 && k.plans.every(x => x.length === 2 && x[0].length > 5 && x[1].length > 5), p.id + ' if-then plans');
  }
  for (const id of Object.keys(KITS)) assert.ok(byId[id] && byId[id].change === KITS[id], 'kit attached to ' + id);
  for (const o of OVERSOLD) { assert.ok(byId[o.id], 'oversold entry exists ' + o.id); assert.ok(!byId[o.id].change, o.id + ' gets no kit'); }
  // honest grading: a practice graded limited says so on its page as a reason to treat it as a bet
  for (const p of PRACTICES.filter(x => x.strength === 'limited')) assert.match(p.holds, /small|few|observational|promising|bet/i, p.id);
});

test('event keys accept only real trial steps for practices, and name the suggested plan', () => {
  const e = byId['if-then-plans'];
  assert.equal(eventKey(e, 'start', 1), 'plan:start:1');
  assert.equal(eventKey(e, 'start', 'own'), 'plan:start:own');
  assert.equal(eventKey(e, 'start', 99), 'plan:start');
  assert.equal(eventKey(e, 'keep', 0), 'plan:keep:0');
  assert.equal(eventKey(e, 'done'), 'plan:done');
  assert.equal(eventKey(e, 'r:forgot'), 'plan:r:forgot');
  assert.equal(eventKey(e, 'hack'), null);
  assert.equal(eventKey(byId['broken-windows'], 'start', 0), null, 'a myth without a kit takes no trial events');
  assert.ok(REASONS.every(r => r.tip.length > 30));
});

test('suggested plans are re-ordered by how often readers who picked them kept going, with a prior for new plans', () => {
  const kit = { plans: [['a cue', 'act one'], ['b cue', 'act two'], ['c cue', 'act three']] };
  assert.deepEqual(rankPlans(kit).map(x => x.i), [0, 1, 2], 'no data keeps the written order');
  const r = rankPlans(kit, { 'plan:start:0': 20, 'plan:keep:0': 2, 'plan:start:1': 20, 'plan:keep:1': 15 });
  assert.equal(r[0].i, 1, 'the plan readers keep rises');
  assert.equal(r[1].i, 2, 'an untried plan sits above one that keeps failing');
  const st = practiceStats([{ entry: 'if-then-plans', key: 'plan:start:0', n: 3 }, { entry: 'if-then-plans', key: 'plan:start:own', n: 2 }, { entry: 'if-then-plans', key: 'plan:keep:0', n: 1 }, { entry: 'if-then-plans', key: 'plan:done', n: 9 }, { entry: 'if-then-plans', key: 'plan:miss', n: 1 }, { entry: 'broken-windows', key: 'plan:start', n: 5 }], byId);
  assert.deepEqual(st['if-then-plans'], { started: 5, kept: 1, stopped: 0, done: 9, missed: 1 });
  assert.equal(st['broken-windows'], undefined);
});

test('/change, /plan, a practice page with its kit, and /api/plan counting work end to end', async () => {
  const env = { DB: d1() };
  const c = await (await handle(get('/change'), env)).text();
  assert.match(c, /Change what you do/); for (const p of PRACTICES) assert.ok(c.includes('href="/e/' + p.id + '"'), p.id);
  assert.match(c, /Oversold/); for (const o of OVERSOLD) assert.ok(c.includes('href="/e/' + o.id + '"'));
  const pl = await handle(get('/plan'), env); assert.equal(pl.status, 200); const plh = await pl.text();
  assert.match(plh, /My plans/); assert.match(plh, /localStorage/); assert.match(plh, /Delete everything on this device/);
  const e = await (await handle(get('/e/self-compassion'), env)).text();
  assert.match(e, /Put it to work: try it for 14 days/); assert.match(e, /name="pl"/); assert.match(e, /Saved only in this browser/);
  assert.ok(!(await (await handle(get('/e/broken-windows'), env)).text()).includes('id="kit"'), 'myths without a kit show none');
  // anonymous counts
  assert.equal((await handle(post('/api/plan', { entry: 'self-compassion', event: 'start', plan: 0 }), env)).status, 200);
  await handle(post('/api/plan', { entry: 'self-compassion', event: 'keep', plan: 0 }), env);
  await handle(post('/api/plan', { entry: 'self-compassion', event: 'done' }), env);
  assert.equal((await handle(post('/api/plan', { entry: 'self-compassion', event: 'nope' }), env)).status, 400);
  assert.equal((await handle(post('/api/plan', { entry: 'broken-windows', event: 'start' }), env)).status, 400);
  const rows = env.DB.raw.prepare("SELECT key, n FROM reader_counts WHERE entry='self-compassion' ORDER BY key").all().map(r => r.key + '=' + r.n);
  assert.deepEqual(rows, ['plan:done=1', 'plan:keep:0=1', 'plan:start:0=1']);
  const api = await (await handle(get('/api/practices.json'), env)).json();
  assert.equal(api.practices.length, ENTRIES.filter(x => x.change).length);
  assert.deepEqual(api.practices.find(x => x.id === 'self-compassion').readers, { started: 1, kept: 1, stopped: 0, done: 1, missed: 0 });
  const m = await (await handle(get('/api/metrics'), env)).json();
  assert.equal(m.encyclopedia.change.trials_started, 1); assert.equal(m.encyclopedia.change.keep_share, 1);
  const home = await (await handle(get('/'), env)).text(); assert.match(home, /Change what you do/); assert.match(home, /href="\/change"/);
  assert.match(await (await handle(get('/how'), env)).text(), /From believing to doing/);
});

test('the Lab also searches for practices, and a practice draft needs its name grounded in the abstract', () => {
  assert.ok(SEARCHES.some(s => s.kind === 'practice'));
  const abs = 'We pooled 40 randomised trials of implementation intention interventions for physical activity. Implementation intention interventions increased physical activity compared with control conditions across settings.';
  const c = { kind: 'practice', title: 'Implementation intentions and physical activity: a meta-analysis', abstract: abs };
  const ok = checkDraft(JSON.stringify({ belief: 'Getting more active is mostly about motivation.', practice: 'Implementation intentions', says: 'Implementation intention interventions increased physical activity compared with control conditions.', quote: 'Implementation intention interventions increased physical activity compared with control conditions across settings.' }), c);
  assert.ok(ok.ok, ok.why); assert.equal(ok.draft.practice, 'Implementation intentions');
  const bad = checkDraft(JSON.stringify({ belief: 'Getting more active is mostly about motivation.', practice: 'Harvard Habit Method', says: 'Implementation intention interventions increased physical activity compared with control conditions.', quote: 'Implementation intention interventions increased physical activity compared with control conditions across settings.' }), c);
  assert.equal(bad.ok, false, 'a name the abstract does not contain is refused');
});

test('the calendar reminder is a valid daily recurring event built from the reader plan', () => {
  const t = ics('Self-compassion', 'I make a mistake', 'I name it, then plan one change', '2026-11-22', 14);
  assert.match(t, /^BEGIN:VCALENDAR\r\n/); assert.match(t, /RRULE:FREQ=DAILY;COUNT=14/); assert.match(t, /DTSTART;VALUE=DATE:20261122/);
  assert.match(t, /I name it\\, then plan one change/, 'commas are escaped');
  assert.ok(STRENGTH);
});
