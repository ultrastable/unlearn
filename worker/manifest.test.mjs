// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// Phases, principles and runway probes, moved here from the core's tests/foundation/test_unlearn.py with the code they check.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const tests = read('worker/worker.test.mjs');
const phases = JSON.parse(read('phases.json'));
const runway = JSON.parse(read('runway.json'));

test('phases are gated, and phase 3 waits on its privacy prerequisites', () => {
  assert.equal(phases.principles.length, 11);
  const ph = phases.phases;
  assert.deepEqual(ph.map(p => p.id), [1, 2, 3]);
  for (const p of ph.slice(0, 2)) { assert.ok(p.exit_gates.length, p.name); for (const g of p.exit_gates) assert.ok(['>=', '<=', '=='].includes(g.op)); }
  assert.ok(ph[0].child_data.startsWith('none'));
  for (const need of ['dpia_complete', 'parental_consent_flow', 'retention_policy_published', 'no_companion_persona']) assert.ok(ph[2].prerequisites.includes(need), need);
  assert.ok('default_in_effect' in ph[2].identity_bound_gate);
});

function holds(probe, id, phase) {
  const [kind, ...r] = probe.split(':'); const rest = r.join(':');
  if (kind === 'test') return assert.ok(tests.includes("test('" + rest + "'"), id);
  if (kind === 'grep') { const [path, needle] = rest.split('::'); return assert.ok(read(path).includes(needle), id); }
  if (kind === 'file') return assert.ok(existsSync(new URL(rest, root)), id);
  if (kind === 'phase3' && phase === 3) return assert.ok(phases.phases[2].ships.includes(rest), id);
  assert.fail('unknown probe kind ' + kind + ' in ' + id);
}

test('every principle names the code that carries it', () => {
  for (const p of phases.principles) { if (p.probe.startsWith('test:')) assert.equal(p.phase, 1, p.id); holds(p.probe, p.id, p.phase); }
});

test('runway probes that live in this repository hold', () => {
  assert.ok(runway.target_days >= 365);
  for (const r of runway.risks) if (r.probe.startsWith('test:')) holds(r.probe, r.id);
});
