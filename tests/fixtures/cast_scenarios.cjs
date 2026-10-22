// 1.48.0 (audit batch 7, 2.7): states whose Cast Sheet was compared between 1.47.0's one-template 509 and the per-NPC entries, and is
// kept in cast_1470.json (tests/test_audit_batch7_v1480.cjs). Deterministic: one to six people present (full and brief sheets),
// ranks, Trust and Tension, romance, statuses, secrets, Mind, Knows, Imprints, invented characters, Year 2 and Entrance morning.
const fs = require('fs'), path = require('path');
const { Schema, runEngine, initState, applyPatch, ROOT } = require('../harness.cjs');
const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/npcs.json'), 'utf8'));
const IDS = Object.keys(npcs).filter(id => npcs[id].group !== 'World teams').sort();   // 1.97.2: the World teams (abroad, no bond) stay out, so the scenarios keep their people
const op = (p, value) => ({ op: 'replace', path: p, value });
function scenario(i) {
  let S = initState();
  const n = 1 + (i % 6), who = [...new Set(Array.from({ length: n }, (_, k) => IDS[(i * 7 + k * 13) % IDS.length]))];
  const ops = [op('/Scene/Present', Object.fromEntries(who.map(w => [w, { Note: 'here' }])))];
  if (i % 5 === 0) ops.push(op('/World/Year', 2));
  if (i % 11 === 0) ops.push(op('/World/Month', 1), op('/World/Week', 1), op('/World/Day', 'Mon'), op('/World/Time', '08:30'));
  if (i % 4 === 1) ops.push(op('/Extras', { Marta: { Who: 'canteen cook', Looks: 'flour to the elbows', Manner: 'brisk', Calls_user: 'dear', Voice: 'loud' } }), op('/Scene/Present/Marta', { Note: 'serving' }));
  if (i % 7 === 3) ops.push(op('/Campus_State/NPC_status', { [who[0]]: 'limping after a fall' }));
  if (i % 6 === 2) ops.push(op('/Campus_State/Secrets_revealed', [who[0] + '.' + 'past']));
  S = applyPatch(S, ops);
  for (const [k, id] of who.entries()) {
    const b = S.Bonds[id]; if (!b) continue;
    b.Rank = (i + k * 3) % 11; b.Trust = (i * 17 + k * 29) % 101; b.Tension = (i * 23 + k * 11) % 101;
    if (i % 3 === 0) b.Mind = 'wondering about the exam';
    if (i % 4 === 0) b.Knows = ['[M1 W1 Mon] {{user}} likes tea'];
    if (i % 8 === 0) b.Imprints = [{ Belief: '{{user}} keeps promises', Weight: 6, When: 'M1 W1 Mon', From: '', Was: '' }];
    if (i % 9 === 0 && b.Rank >= 8) b.Romance = true;
  }
  const A = Schema.parse(S); runEngine(A, S); return Schema.parse(A);
}
module.exports = { scenario, N: 240 };
