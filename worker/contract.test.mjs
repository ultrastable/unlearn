// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// FLEET-CONTRACT-1: Unlearn serves the fleet contract, and every statement holds front to back and back to front against the real router,
// on an in-memory SQLite standing in for D1 (the same stand-in worker.test.mjs uses).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { verify, routesIn } from '../vendor/ultrastable/contract.js';
import { handle } from './index.js';
import { SPEC } from './contract.js';
import { ENTRIES } from './entries.js';

function d1() {
  const raw = new DatabaseSync(':memory:');
  const stmt = (sql) => { let a = []; const o = { bind(...x) { a = x; return o; },
    async all() { return { results: raw.prepare(sql).all(...a).map(r => ({ ...r })) }; },
    async first() { const r = raw.prepare(sql).get(...a); return r ? { ...r } : null; },
    async run() { const r = raw.prepare(sql).run(...a); return { meta: { changes: Number(r.changes) } }; }, _sql: sql }; return o; };
  return { raw, prepare: stmt, async batch(list) { const out = []; for (const s of list) out.push(await s.run()); return out; } };
}
const now = Date.UTC(2026, 10, 25, 12);
// a system whose evidence loop has checked every entry, as in production an hour after a deploy
async function site() {
  const env = { DB: d1() };
  await handle(new Request('https://u.test/health'), env, now);  // creates the tables
  for (const e of ENTRIES) await env.DB.prepare('INSERT INTO evidence_checks (entry, at) VALUES (?1, ?2)').bind(e.id, now - 3600000).run();
  return path => handle(new Request('https://u.test' + path), env, now);
}
const src = readFileSync(new URL('./index.js', import.meta.url), 'utf8');

test('every surface answers and every statement is backed, both ways; every public endpoint is named or internal with a reason', async () => {
  const apis = [...routesIn(src), '/api/graph', '/api/graph/insights', '/api/graph/node', '/api/graph/method', '/api/graph/health'];
  for (const need of ['/api/entries.json', '/api/freshness', '/api/review-queue.json', '/api/phase', '/api/guess']) assert.ok(apis.includes(need), need + ' read from the router');
  const r = await verify(await site(), SPEC, { apis });
  assert.deepEqual(r.failures, []);
  assert.ok(r.checks > 30);
});

test('a statement whose endpoint stops answering fails the reading, front to back', async () => {
  const real = await site();
  const r = await verify(async p => p === '/api/phase' ? new Response('gone', { status: 404 }) : real(p), SPEC);
  assert.ok(r.failures.some(f => f.id === 'phases' && f.direction === 'front-to-back'), JSON.stringify(r.failures));
  assert.ok(r.failures.every(f => f.direction === 'front-to-back'));
});

test('an endpoint nothing describes fails the reading, back to front', async () => {
  const r = await verify(await site(), SPEC, { apis: ['/api/entries.json', '/api/undescribed'] });
  assert.deepEqual(r.failures.map(f => [f.id, f.direction]), [['/api/undescribed', 'back-to-front']]);
});

test('a write route read with GET says it takes POST, so a page that posts to it is not read as a dead link', async () => {
  const r = await (await site())('/api/candidate-vote');
  assert.equal(r.status, 405); assert.equal(r.headers.get('allow'), 'POST'); assert.equal((await r.json()).error, 'method_not_allowed');
});

test('the manifest names this system and the claims list every statement', async () => {
  const real = await site();
  const m = await (await real('/.well-known/ultrastable.json')).json(), c = await (await real('/claims.json')).json();
  assert.equal(m.ultrastable, 1); assert.equal(m.url, 'https://unlearn.ultrastable.org'); assert.equal(m.repo, 'https://github.com/ultrastable/unlearn');
  assert.deepEqual(c.statements.map(s => s.id), SPEC.statements.map(s => s.id));
});
