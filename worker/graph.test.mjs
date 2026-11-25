// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// KGRAPH-1 for Unlearn: the hourly beat builds the knowledge graph from every entry, review and draft; it finds connections nobody wrote down,
// shows them on entry pages and /graph, counts readers' clicks as the check, and re-measures its own method live.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { handle, beat, health } from './index.js';
import { authorsOf, graphBeat, records, connections, TENANT } from './graph.js';
import { ENTRIES } from './entries.js';
import * as kg from '../vendor/ultrastable/knowledge.js';

function d1() {
  const raw = new DatabaseSync(':memory:');
  const stmt = (sql) => { let a = []; const o = { bind(...x) { a = x; return o; },
    async all() { return { results: raw.prepare(sql).all(...a).map(r => ({ ...r })) }; },
    async first() { const r = raw.prepare(sql).get(...a); return r ? { ...r } : null; },
    async run() { const r = raw.prepare(sql).run(...a); return { meta: { changes: Number(r.changes) } }; } }; return o; };
  return { raw, prepare: stmt, async batch(list) { const out = []; for (const s of list) out.push(await s.run()); return out; } };
}
const get = (p) => new Request('https://u.test' + p);
const NOW = Date.parse('2026-11-25T17:00:00Z');

test('authors split into people; organisations stay whole', () => {
  assert.deepEqual(authorsOf('Braga, Welsh and Schnell'), ['Braga', 'Welsh', 'Schnell']);
  assert.deepEqual(authorsOf('Branas et al.'), ['Branas']);
  assert.deepEqual(authorsOf('National Research Council'), ['National Research Council']);
});

test('the beat builds the graph from every entry, then writes nothing when nothing changed', async () => {
  const db = d1(); await handle(get('/health'), { DB: db });
  const r = await graphBeat(db, NOW);
  assert.ok(r.ok, r.error);
  assert.equal(r.added, ENTRIES.length);
  assert.ok(r.nodes > ENTRIES.length * 3, `nodes ${r.nodes}`);
  assert.ok(r.communities >= 3 && r.modularity > 0.3, `communities ${r.communities}, modularity ${r.modularity}`);
  assert.ok(r.insights_new > 0);
  const again = await graphBeat(db, NOW + 3600e3);
  assert.equal(again.unchanged, ENTRIES.length); assert.equal(again.added + again.changed + again.retired, 0);
  const g = await kg.load(db, TENANT);
  assert.ok(g.nodes.get('author:nagin'), 'Nagin is one author across entries');
  assert.ok(g.edges.some(e => e.rel === 'related'));
});

test('reviews the evidence loop found and Lab drafts join the graph', async () => {
  const db = d1(); await handle(get('/health'), { DB: db });
  db.raw.prepare("INSERT INTO leads (entry, ref, title, venue, year, url, found) VALUES ('broken-windows','MED:1','Disorder and crime: an updated review','Criminology',2026,'https://x',1)").run();
  db.raw.prepare("INSERT INTO candidates (ref, title, year, found, status, draft) VALUES ('MED:2','Myths about learning styles',2026,1,'drafted','{\"belief\":\"Teaching to learning styles helps\"}')").run();
  const recs = await records(db);
  assert.ok(recs.some(r => r.type === 'lead') && recs.some(r => r.type === 'draft'));
  await graphBeat(db, NOW);
  const nb = await kg.neighbors(db, TENANT, 'entry:broken-windows');
  assert.ok(nb.some(n => n.rel === 'new_evidence_for' && /updated review/.test(n.label)));
});

test('suggested connections appear on entry pages, never duplicate an editor link, and a reader click is the check', async () => {
  const env = { DB: d1() };
  await handle(get('/health'), env); await graphBeat(env.DB, NOW);
  const links = await kg.insights(env.DB, TENANT, { kind: 'link', limit: 50 });
  assert.ok(links.length > 0, 'the graph found unlinked beliefs that share research');
  const l = links[0], slug = l.subject.slice(6);
  const list = await connections(env.DB, slug);
  const e = ENTRIES.find(x => x.id === slug);
  for (const c of list) assert.ok(!(e.related || []).includes(c.entry.id));
  const html = await (await handle(get('/e/' + slug), env, NOW)).text();
  assert.match(html, /Connected by shared research/); assert.match(html, /data-ins=/);
  for (let i = 0; i < 3; i++) {
    const r = await handle(new Request('https://u.test/api/graph/follow', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '9.9.9.' + i }, body: JSON.stringify({ id: l.id }) }), env, NOW);
    assert.equal((await r.json()).ok, true);
  }
  const after = await graphBeat(env.DB, NOW + 3600e3);
  assert.ok(after.kept >= 1, 'three follows keep the finding');
  assert.ok((await kg.insights(env.DB, TENANT, { status: 'kept' })).some(i => i.id === l.id));
});

test('/graph is live and the APIs answer; health carries the graph and stays green before the first build', async () => {
  const env = { DB: d1() };
  const h0 = await health(env, NOW); assert.equal(h0.ok, true, 'a fresh deploy is not red before the first graph build'); assert.equal(h0.graph.nodes, 0);
  await beat(env, NOW);
  const page = await handle(get('/graph'), env, NOW);
  assert.equal(page.status, 200); assert.equal(page.headers.get('cache-control'), 'no-store');
  const t = await page.text();
  assert.match(t, /The knowledge graph/); assert.match(t, /checked right now/); assert.match(t, /Open findings/); assert.match(t, /href="\/graph"/);
  const j = await (await handle(get('/api/graph.json'), env, NOW)).json(); assert.ok(j.nodes.length > 100);
  const m = await (await handle(get('/api/graph/method'), env, NOW)).json();
  assert.ok(m.practices.find(p => p.id === 'fresh').status === 'holds');
  const h = await health(env, NOW); assert.equal(h.ok, true); assert.ok(h.graph.nodes > 0);
  assert.ok((await handle(get('/sitemap.xml'), env, NOW).then(r => r.text())).includes('/graph'));
});

test('the vendored engine is the core file, unedited (TENANT-SYNC-1)', () => {
  const v = readFileSync(new URL('../vendor/ultrastable/knowledge.js', import.meta.url), 'utf8');
  assert.match(v, /KGRAPH-1/); assert.match(v, /export async function runKg/);
});
