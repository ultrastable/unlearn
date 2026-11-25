// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// The Unlearn encyclopedia: entry data integrity, pages, reader taps, and the evidence loop against a fake Crossref and Europe PMC.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { handle, beat, encyclopediaMetrics } from './index.js';
import { ENTRIES, CATEGORIES, STRENGTH, DIRECTION, DESIGN, FORMAT, METHOD } from './entries.js';
import { titleMatch, resolveSource, findLeads, pickBatch, freshness, reviewQueue, EVIDENCE } from './evidence.js';
import { search } from './site.js';

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
const DAY = 86400000;

// A fake network: Crossref answers with the cited title (so it resolves), Europe PMC with one new review and one already-cited source.
function fakeFetch(calls = []) {
  return async (url) => {
    calls.push(url);
    if (url.startsWith('https://api.crossref.org/')) {
      const q = decodeURIComponent(url.split('query.bibliographic=')[1]);
      const e = ENTRIES.flatMap(x => x.sources).find(s => q.startsWith(s.title));
      return Response.json({ message: { items: e ? [{ DOI: '10.1/' + e.year, title: [e.title], issued: { 'date-parts': [[e.year]] } }] : [] } });
    }
    if (url.startsWith('https://www.ebi.ac.uk/europepmc/')) {
      const q = decodeURIComponent(url.split('query=')[1]);
      const e = ENTRIES.find(x => q.startsWith('(' + x.query + ')'));
      return Response.json({ resultList: { result: [
        { id: '1', pmid: '99' + e.id.length, doi: '10.9/new-' + e.id, title: 'A new systematic review on ' + e.query, journalTitle: 'Journal X', pubYear: '2026' },
        { id: '2', title: e.sources[0].title, journalTitle: e.sources[0].venue, pubYear: String(e.sources[0].year) }
      ] } });
    }
    return new Response('no', { status: 404 });
  };
}

test('every entry follows the guided format, cites graded sources and links only to real entries', () => {
  assert.ok(ENTRIES.length >= 30, 'at least 30 entries');
  const ids = new Set();
  for (const e of ENTRIES) {
    assert.ok(!ids.has(e.id), 'unique id ' + e.id); ids.add(e.id);
    assert.match(e.id, /^[a-z0-9-]+$/);
    assert.ok(CATEGORIES.some(c => c.id === e.cat), e.id + ' category');
    for (const f of ['belief', 'feels', 'says', 'slip', 'instead', 'holds', 'query']) assert.ok(String(e[f] || '').length > 10, e.id + ' ' + f);
    assert.ok(STRENGTH[e.strength], e.id + ' strength'); assert.ok(DIRECTION[e.direction], e.id + ' direction');
    assert.ok(e.guess.options.length >= 2 && Number.isInteger(e.guess.answer) && e.guess.answer < e.guess.options.length, e.id + ' guess');
    assert.ok(e.sources.length >= 1, e.id + ' sources');
    for (const s of e.sources) { assert.ok(DESIGN[s.design], e.id + ' design ' + s.design); assert.ok(s.year >= 1950 && s.year <= 2026); for (const f of ['authors', 'title', 'venue', 'finding']) assert.ok(s[f], e.id + ' ' + f); }
    // a strong grade needs at least one review, replication or panel report behind it
    if (e.strength === 'strong') assert.ok(e.sources.some(s => DESIGN[s.design].rank >= 4), e.id + ' strong needs a review-level source');
  }
  for (const e of ENTRIES) for (const r of e.related || []) assert.ok(ids.has(r), e.id + ' related ' + r);
  for (const c of CATEGORIES) assert.ok(ENTRIES.filter(e => e.cat === c.id).length >= 3, c.id + ' has entries');
  assert.deepEqual(FORMAT, ['feels', 'guess', 'says', 'slip', 'instead', 'holds', 'sources']);
  assert.ok(METHOD.length >= 4);
});

test('home, topics, entry, play, how, search and sitemap render from the data, with no script needed to read', async () => {
  const env = { DB: d1() };
  const h = await (await handle(get('/'), env)).text();
  assert.match(h, /Some of what everyone knows is wrong/); for (const c of CATEGORIES) assert.ok(h.includes('href="/topics/' + c.id + '"'));
  for (const e of ENTRIES) assert.ok(h.includes('href="/e/' + e.id + '"'), 'home links ' + e.id);
  const e = ENTRIES[0], p = await handle(get('/e/' + e.id), env), ph = await p.text();
  assert.equal(p.status, 200);
  for (const k of ['Why it feels true', 'Your guess', 'What the evidence shows', 'Where the intuition slips', 'What works instead', 'Where the belief may still hold', 'Sources']) assert.ok(ph.includes(k), k);
  assert.ok(ph.indexOf('Why it feels true') < ph.indexOf('Your guess') && ph.indexOf('Your guess') < ph.indexOf('What the evidence shows'), 'feels, then guess, then evidence');
  assert.match(ph, /<details class="reveal"/, 'evidence is revealed after the guess, and readable without script');
  assert.equal((await handle(get('/topics/crime'), env)).status, 200);
  assert.equal((await handle(get('/topics/nope'), env)).status, 404);
  assert.equal((await handle(get('/e/nope'), env)).status, 404);
  assert.match(await (await handle(get('/play'), env)).text(), /Test your intuition/);
  assert.match(await (await handle(get('/how'), env)).text(), /Debunking Handbook/);
  assert.match(await (await handle(get('/search?q=prison'), env)).text(), /href="\/e\/prison-reoffending"/);
  const sm = await (await handle(get('/sitemap.xml'), env)).text(); assert.equal((sm.match(/<loc>/g) || []).length, 9 + CATEGORIES.length + ENTRIES.length);
  assert.ok(search('sugar').some(x => x.id === 'sugar-hyperactive'));
  const j = await (await handle(get('/api/entries.json'), env)).json(); assert.equal(j.entries.length, ENTRIES.length);
  assert.equal((await (await handle(get('/api/entries/broken-windows.json'), env)).json()).entry.id, 'broken-windows');
  assert.match(await (await handle(get('/coach'), env)).text(), /Coach a curious child/);
});

test('entry text is escaped, never injected', async () => {
  const h = await (await handle(get('/search?q=%3Cscript%3Ealert(1)%3C/script%3E'), { DB: d1() })).text();
  assert.ok(!h.includes('<script>alert(1)'));
});

test('reader guesses and shifts are counted anonymously and measure surprise and shift', async () => {
  const env = { DB: d1() }, e = ENTRIES.find(x => x.id === 'scared-straight');
  for (let i = 0; i < 6; i++) assert.equal((await (await handle(post('/api/guess', { entry: e.id, choice: i < 4 ? 0 : e.guess.answer }, '5.5.5.' + i), env)).json()).counted, true);
  assert.equal((await handle(post('/api/guess', { entry: e.id, choice: 9 }), env)).status, 400);
  assert.equal((await handle(post('/api/guess', { entry: 'nope', choice: 0 }), env)).status, 400);
  await handle(post('/api/shift', { entry: e.id, shift: 'yes' }), env); await handle(post('/api/shift', { entry: e.id, shift: 'no' }), env);
  assert.equal((await handle(post('/api/shift', { entry: e.id, shift: 'maybe' }), env)).status, 400);
  const m = await encyclopediaMetrics(env.DB);
  assert.equal(m.guesses, 6); assert.ok(Math.abs(m.surprise_share - 4 / 6) < 1e-9); assert.equal(m.shift_share, 0.5);
  assert.equal(m.surprising[0].entry, e.id);
  assert.match(await (await handle(get('/'), env)).text(), /Most surprising so far/);
  assert.match(await (await handle(get('/e/' + e.id), env)).text(), /33% of 6 readers guessed right/);
  const cols = env.DB.raw.prepare("SELECT name FROM pragma_table_info('reader_counts')").all().map(r => r.name);
  assert.deepEqual(cols, ['entry', 'key', 'n'], 'no reader identifier is stored');
});

test('reader taps have their own daily cap and never use up the coaching cap', async () => {
  const env = { DB: d1() };
  for (let i = 0; i < 40; i++) await handle(post('/api/guess', { entry: 'dare', choice: 0 }), env);
  const j = await (await handle(post('/api/curiosity', { text: 'why the sky is blue' }), env)).json();
  assert.equal(j.ok, true);
});

test('crossref matches only on title and year, and europe pmc leads exclude already cited sources', async () => {
  assert.equal(titleMatch('Learning styles: Concepts and evidence', 'Learning Styles: Concepts and Evidence'), 1);
  assert.ok(titleMatch('Learning styles: Concepts and evidence', 'Concepts of style in fashion') < 0.8);
  const src = ENTRIES[0].sources[0];
  assert.equal((await resolveSource(src, fakeFetch())).doi, '10.1/' + src.year);
  const wrongYear = async () => Response.json({ message: { items: [{ DOI: '10.1/x', title: [src.title], issued: { 'date-parts': [[src.year + 5]] } }] } });
  assert.equal(await resolveSource(src, wrongYear), null);
  const leads = await findLeads(ENTRIES[0], '2024-01-01', fakeFetch());
  assert.equal(leads.length, 1); assert.match(leads[0].ref, /^doi:/);
  await assert.rejects(resolveSource(src, async () => new Response('x', { status: 500 })));
});

test('the beat checks a batch of entries, stores DOIs and leads, and rotates until every entry is fresh', async () => {
  const calls = [], env = { DB: d1(), FETCH: fakeFetch(calls) }, t0 = Date.UTC(2026, 10, 22);
  const r = await beat(env, t0);
  assert.equal(r.ok, true); assert.equal(r.metrics.evidence.checked.length, EVIDENCE.batch);
  assert.ok(r.metrics.evidence.resolved >= EVIDENCE.batch); assert.equal(r.metrics.evidence.new_leads, EVIDENCE.batch);
  const first = r.metrics.evidence.checked[0];
  assert.match(await (await handle(get('/e/' + first), env)).text(), /New evidence the loop found/);
  assert.match(await (await handle(get('/e/' + first), env)).text(), /DOI 10\.1\//);
  assert.equal((await handle(get('/api/freshness'), env, t0)).status, 503, 'not every entry checked yet');
  const rounds = Math.ceil(ENTRIES.length / EVIDENCE.batch);
  for (let i = 1; i < rounds; i++) await beat(env, t0 + i * 3600000);
  const fr = await (await handle(get('/api/freshness'), env, t0 + rounds * 3600000)).json();
  assert.equal(fr.ok, true); assert.equal(fr.checked, ENTRIES.length);
  // resolved sources are not looked up again on the next round
  const before = calls.filter(u => u.includes('crossref')).length; await beat(env, t0 + (rounds + 1) * 3600000);
  assert.equal(calls.filter(u => u.includes('crossref')).length, before);
  assert.equal((await handle(get('/api/freshness'), env, t0 + 30 * DAY)).status, 503, 'stale after recheck_days');
});

test('a failing evidence source is logged, retried next beat, and never stops the coaching loop', async () => {
  const env = { DB: d1(), FETCH: async () => new Response('down', { status: 503 }) };
  const r = await beat(env, Date.UTC(2026, 10, 22));
  assert.equal(r.ok, true); assert.equal(r.metrics.evidence.checked.length, 0); assert.ok(r.metrics.evidence.errors > 0);
  assert.equal(pickBatch({})[0].id, [...ENTRIES].map(e => e.id).sort()[0]);
});

test('an entry with enough new reviews joins the review queue for re-grading', () => {
  const q = reviewQueue({ 'broken-windows': EVIDENCE.review_after_leads, dare: 1 });
  assert.deepEqual(q.map(x => x.entry), ['broken-windows']);
  assert.equal(freshness({}, Date.now()).ok, false);
});
