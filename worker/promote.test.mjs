// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// TENANT-PROMO-1: Unlearn's social queue and its links to sibling systems.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { handle } from './index.js';
import { socialQueue, order, SIBLINGS, HOOK } from './promote.js';
import { ENTRIES } from './entries.js';
import { layout } from './site.js';

function d1() {
  const raw = new DatabaseSync(':memory:');
  const stmt = (sql) => { let a = []; const o = { bind(...x) { a = x; return o; },
    async all() { return { results: raw.prepare(sql).all(...a).map(r => ({ ...r })) }; },
    async first() { const r = raw.prepare(sql).get(...a); return r ? { ...r } : null; },
    async run() { const r = raw.prepare(sql).run(...a); return { meta: { changes: Number(r.changes) } }; } }; return o; };
  return { raw, prepare: stmt, async batch(list) { const out = []; for (const s of list) out.push(await s.run()); return out; } };
}

test('every entry is in the promotion order once, topics alternate', () => {
  const o = order();
  assert.equal(o.length, ENTRIES.length);
  assert.equal(new Set(o.map(e => e.id)).size, ENTRIES.length);
  assert.notEqual(o[0].cat, o[1].cat);
});

test('the queue posts entries with the hook and the entry link, inside the limit, none refused', () => {
  const q = socialQueue(Date.parse('2026-12-01T12:00:00Z'));
  assert.equal(q.refused.length, 0, JSON.stringify(q.refused));
  assert.ok(q.posts.length >= 10);
  for (const p of q.posts) { assert.ok(p.text.includes(HOOK) && p.text.includes('https://unlearn.ultrastable.org/e/')); assert.ok(p.text.length <= 300); assert.equal(p.tenant, 'unlearn'); }
  // every entry fits the 300-character limit when its turn comes
  const all = socialQueue(Date.parse('2027-03-01T00:00:00Z'));
  assert.equal(all.refused.length, 0);
});

test('/social-queue.json is served, and every page links the live sibling systems', async () => {
  const r = await handle(new Request('https://u.test/social-queue.json'), { DB: d1() }, Date.parse('2026-12-01T12:00:00Z'));
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.ok(j.posts.length > 0 && j.posts.every(p => p.id.startsWith('unlearn:')));
  assert.ok(SIBLINGS.some(s => s.id === 'practical-solutions'));
  assert.ok(!SIBLINGS.some(s => s.id === 'unlearn'));
  assert.match(layout('t', 'b'), /Also run on Ultrastable: <a href="https:\/\/ultrastable.org\/">Practical Solutions<\/a>/);
});
