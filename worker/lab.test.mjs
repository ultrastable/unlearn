// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// The improvement loops: grounded triage, automatic re-grading, belief discovery for the Lab, and wording trials, with a fake model and network.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { handle, labBeat, grades, wording } from './index.js';
import { ENTRIES } from './entries.js';
import { grounded, noNewFacts, checkTriage, regrade, checkDraft, checkVariant, decide, pickForVariant, discover, LAB } from './lab.js';
import { reviewQueue } from './evidence.js';

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
const BW = ENTRIES.find(e => e.id === 'broken-windows');
const ABSTRACT = 'We pooled thirty studies of order-maintenance policing. Aggressive arrests for minor disorder did not reduce serious crime in most cities studied. Community problem-solving showed modest benefits.';
const QUOTE = 'Aggressive arrests for minor disorder did not reduce serious crime in most cities studied.';

test('a label or draft is kept only when its quote is really in the abstract and it adds no facts', () => {
  assert.ok(grounded(QUOTE, ABSTRACT));
  assert.ok(!grounded('Arrests cut serious crime by half in every city.', ABSTRACT));
  assert.ok(!grounded('did not', ABSTRACT), 'too short to count as a quote');
  assert.deepEqual(checkTriage(JSON.stringify({ stance: 'contradicts_belief', quote: QUOTE }), ABSTRACT), { ok: true, stance: 'contradicts_belief', quote: QUOTE });
  assert.equal(checkTriage(JSON.stringify({ stance: 'supports_belief', quote: 'Made up sentence that is long enough to pass.' }), ABSTRACT).ok, false);
  assert.equal(checkTriage('not json', ABSTRACT).ok, false);
  assert.equal(checkTriage('{"stance":"unrelated"}', ABSTRACT).stance, 'unrelated');
  assert.ok(noNewFacts('Arrests for minor disorder did not lower serious crime.', ABSTRACT));
  assert.ok(!noNewFacts('Arrests fell 40% in Chicago.', ABSTRACT), 'new number and new name are refused');
  const c = { title: 'Order-maintenance policing: a systematic review', abstract: ABSTRACT };
  assert.equal(checkDraft(JSON.stringify({ belief: 'Cracking down on small offences prevents serious crime.', says: 'Aggressive arrests for minor disorder did not reduce serious crime in most cities studied.', quote: QUOTE }), c).ok, true);
  assert.equal(checkDraft(JSON.stringify({ belief: 'Cracking down on small offences prevents serious crime.', says: 'Crime fell by 75 percent in Boston after arrests.', quote: QUOTE }), c).why, 'fact not in abstract');
  assert.equal(checkDraft('{"belief":null}', c).ok, false);
  assert.equal(checkVariant('People see disorder and crime together, so it is natural to think one causes the other, but both come from the same deeper conditions.', BW).ok, true);
  assert.equal(checkVariant('A 2019 study in Denver proved it wrong.', BW).ok, false);
  assert.equal(checkVariant(BW.slip, BW).ok, false);
});

test('regrade: newer reviews that agree raise the grade one step; reviews that support the belief flag the entry', () => {
  const lim = { ...BW, strength: 'limited', direction: 'contradicts' };
  assert.equal(regrade(lim, []).status, 'stable');
  const r = regrade(lim, [{ stance: 'contradicts_belief' }, { stance: 'contradicts_belief' }]);
  assert.equal(r.status, 'reinforced'); assert.equal(r.strength, 'moderate'); assert.equal(r.base_strength, 'limited');
  assert.equal(regrade({ ...BW, strength: 'strong' }, [{ stance: 'contradicts_belief' }, { stance: 'contradicts_belief' }]).strength, 'strong', 'strong stays strong');
  assert.equal(regrade({ ...BW, strength: 'mixed' }, [{ stance: 'contradicts_belief' }, { stance: 'contradicts_belief' }]).strength, 'mixed', 'a split body of evidence is not raised');
  const ch = regrade(BW, [{ stance: 'supports_belief' }, { stance: 'supports_belief' }, { stance: 'contradicts_belief' }]);
  assert.equal(ch.status, 'challenged');
  const q = reviewQueue({}, ENTRIES, { [BW.id]: ch });
  assert.deepEqual(q.map(x => [x.entry, x.reason]), [[BW.id, 'challenged']]);
});

test('wording trials need enough answers and a clear difference; no winner by the cap keeps the original', () => {
  assert.equal(decide({ yes: 10, total: 20 }, { yes: 20, total: 20 }), 'running');
  assert.equal(decide({ yes: 20, total: 100 }, { yes: 45, total: 100 }), 'challenger');
  assert.equal(decide({ yes: 45, total: 100 }, { yes: 20, total: 100 }), 'control');
  assert.equal(decide({ yes: 150, total: LAB.variant_max_arm }, { yes: 152, total: LAB.variant_max_arm }), 'control');
  const shift = { [BW.id]: { yes: 2, total: 30 }, dare: { yes: 25, total: 30 }, 'spanking': { yes: 0, total: 5 } };
  assert.equal(pickForVariant(shift, new Set()).id, BW.id, 'the entry changing fewest minds, with enough answers');
  assert.equal(pickForVariant(shift, new Set([BW.id])).id, 'dare');
});

test('discovery skips reviews already cited and abstracts that are missing', async () => {
  const f = async () => Response.json({ resultList: { result: [
    { id: 'a', doi: '10.5/myth', title: 'Common myths about sleep: a systematic review', journalTitle: 'J', pubYear: '2026', abstractText: ABSTRACT },
    { id: 'b', title: BW.sources[0].title, abstractText: ABSTRACT },
    { id: 'c', title: 'No abstract myths review' }] } });
  const c = await discover('2026-01-01', f);
  assert.deepEqual(c.map(x => x.ref), ['doi:10.5/myth']);
});

test('the lab beat labels reviews, drafts Lab candidates, runs a wording trial, and the pages show it', async () => {
  const db = d1(); const now = Date.UTC(2026, 10, 22, 12);
  const calls = [];
  const AI = { async run(model, { messages }) {
    calls.push(messages[0].content.slice(0, 30));
    const sys = messages[0].content;
    if (sys.startsWith('You classify')) return { response: JSON.stringify({ stance: 'contradicts_belief', quote: QUOTE }) };
    if (sys.startsWith('From one research abstract')) return { response: JSON.stringify({ belief: 'Cracking down on small offences prevents serious crime.', says: 'Aggressive arrests for minor disorder did not reduce serious crime in most cities studied.', quote: QUOTE }) };
    return { response: 'People see disorder and crime together, so it is natural to think one causes the other, but both come from the same deeper conditions.' };
  } };
  const env = { DB: db, AI };
  await handle(get('/health'), env, now); // creates the schema
  for (const [i, ref] of ['doi:1', 'doi:2'].entries()) await db.prepare("INSERT INTO leads (entry, ref, title, venue, year, url, found, abstract) VALUES (?1,?2,?3,'J',2026,'https://doi.org/x',?4,?5)").bind(BW.id, ref, 'Review ' + i, now, ABSTRACT).run();
  await db.prepare("INSERT INTO leads (entry, ref, title, venue, year, url, found, abstract) VALUES (?1,'doi:3','Bad','J',2026,'u',?2,?3)").bind('dare', now, 'Short abstract with nothing in it at all.').run();
  for (let i = 0; i < 30; i++) await db.prepare("INSERT INTO reader_counts (entry, key, n) VALUES (?1, ?2, 1) ON CONFLICT(entry, key) DO UPDATE SET n = n + 1").bind(BW.id, i < 3 ? 'shift:yes' : 'shift:no').run();
  const fetchFn = async () => Response.json({ resultList: { result: [{ id: 'a', doi: '10.5/myth', title: 'Order-maintenance policing myths: a systematic review', journalTitle: 'J', pubYear: '2026', abstractText: ABSTRACT }] } });
  const out = await labBeat(env, db, now, fetchFn);
  assert.equal(out.triaged, 2); assert.equal(out.refused, 1, 'a quote not in the abstract is refused');
  assert.equal(out.discovered, 1); assert.equal(out.drafted, 1);
  assert.deepEqual(out.trial, { entry: BW.id, started: true });
  const g = (await grades(db))[BW.id];
  assert.equal(g.status, 'reinforced');

  const page = await (await handle(get('/e/' + BW.id), env, now)).text();
  assert.match(page, /Reinforced/); assert.ok(page.includes('Points the same way as this entry'));
  assert.ok(page.includes(QUOTE.replace(/'/g, '&#39;')), 'the quoted sentence is on the page');
  assert.match(page, /data-variant="\d+"/);
  const lab = await handle(get('/lab'), env, now); const lh = await lab.text();
  assert.equal(lab.status, 200); assert.match(lh, /Cracking down on small offences prevents serious crime/); assert.match(lh, /not entries/);
  const cand = await (await handle(get('/api/candidates.json'), env, now)).json();
  const id = cand.candidates[0].id;
  assert.equal((await (await handle(post('/api/candidate-vote', { id, vote: 'yes' }), env, now)).json()).counted, true);
  assert.equal((await handle(post('/api/candidate-vote', { id: 99999, vote: 'yes' }, '5.5.5.5'), env, now)).status, 404);
  assert.equal((await handle(post('/api/candidate-vote', { id, vote: 'maybe' }), env, now)).status, 400);

  // shift taps on each arm feed the trial; a decided trial promotes the winner, which the page then shows
  const w = await wording(db, BW.id, () => 0.9); assert.ok(w.variant);
  await handle(post('/api/shift', { entry: BW.id, shift: 'yes', variant: w.variant }, '9.9.9.9'), env, now);
  assert.equal(db.raw.prepare('SELECT total, yes FROM variants WHERE id=?').get(w.variant).total, 1);
  db.raw.prepare("UPDATE variants SET total=100, yes=CASE arm WHEN 'challenger' THEN 50 ELSE 20 END").run();
  const out2 = await labBeat(env, db, now + 3600000, null);
  assert.deepEqual(out2.trial, { entry: BW.id, decided: 'challenger' });
  const after = await wording(db, BW.id);
  assert.equal(after.variant, null); assert.match(after.slip, /same deeper conditions/);
  assert.match(await (await handle(get('/e/' + BW.id), env, now)).text(), /same deeper conditions/);
  const how = await (await handle(get('/how'), env, now)).text();
  assert.match(how, /How it improves itself/);
  const m = await (await handle(get('/api/metrics'), env, now)).json();
  assert.equal(m.encyclopedia.lab.entries_reinforced, 1); assert.equal(m.encyclopedia.lab.wording_trials.winner, 1);
});

test('with no model the lab beat changes nothing and records no refusals', async () => {
  const db = d1(); const now = Date.UTC(2026, 10, 22);
  await handle(get('/health'), { DB: db }, now);
  await db.prepare("INSERT INTO leads (entry, ref, title, venue, year, url, found, abstract) VALUES (?1,'doi:1','R','J',2026,'u',?2,?3)").bind(BW.id, now, ABSTRACT).run();
  const out = await labBeat({ DB: db }, db, now, null);
  assert.equal(out.triaged + out.refused + out.drafted, 0);
  assert.equal(db.raw.prepare('SELECT classified FROM leads').get().classified, null, 'left for the next beat');
});
