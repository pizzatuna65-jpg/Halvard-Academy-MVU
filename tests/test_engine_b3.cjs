const { Schema, initState, applyPatch, ok } = require('./harness.cjs');
console.log('engine / schema — Batch 3 additions');
let S = initState();
ok(S.$ui.built === false && S.Magic._Affinity.Preset === '', 'initvar: not built, empty affinity');
ok(Schema.parse(Schema.parse(S)) && _.isEqual(Schema.parse(Schema.parse(S)), Schema.parse(S)), 'schema idempotent');
// builder patch
const tech = {
  'Frost Lance': { Type: 'Elemental', Subtype: 'Ice', Effect: 'a spear of ice', Cost_mode: 'per_use', Activation: 12 },
  'Ice Wall': { Type: 'Elemental', Subtype: 'Ice', Effect: 'wall', Cost_mode: 'hybrid', Activation: 10, Upkeep_per_min: 0.5, Trigger: 6 },
};
S = applyPatch(S, [
  { op: 'replace', path: '/Magic/_Techniques', value: tech },
  { op: 'replace', path: '/Magic/_Affinity', value: { Types: ['Elemental'], Dominant: 'Elemental', Specialties: ['Ice'], Preset: 'Gifted' } },
  { op: 'replace', path: '/Player/Vitals/Mana_max', value: 130 }, { op: 'replace', path: '/Player/Vitals/Mana', value: 130 },
  { op: 'replace', path: '/$ui/built', value: true }, { op: 'replace', path: '/$eng/auth', value: 'builder' },
]);
ok(Object.keys(S.Magic._Techniques).length === 2 && S.$ui.built === true, 'builder patch writes read-only fields');
ok(S.$eng.auth === '', 'auth token cleared after the update');
ok(S.$ui.toasts.includes('Student file updated'), 'builder toast');
ok(S.Player.Vitals.Mana === 130, 'mana set to preset max');
// AI tries to edit read-only fields
let T = applyPatch(S, [{ op: 'replace', path: '/Magic/_Techniques/Frost Lance/Activation', value: 0 },
  { op: 'replace', path: '/Magic/_Affinity/Dominant', value: 'Occult' }, { op: 'replace', path: '/World/Time', value: '07:40' }]);
ok(T.Magic._Techniques['Frost Lance'].Activation === 12 && T.Magic._Affinity.Dominant === 'Elemental', 'AI edits to read-only fields are reverted');
ok(T._Log.some(l => /read-only/.test(l)), '_Log explains the revert');
ok(T.$ui.toasts.length === 0, 'toasts reset each update');
// hybrid: start (activation 10), 20 min upkeep (10), then triggered use (6) instead of activation
T = applyPatch(S, [{ op: 'insert', path: '/Magic/Active/Ice Wall', value: { Technique: 'Ice Wall' } }, { op: 'replace', path: '/World/Time', value: '07:40' }]);
ok(T.Player.Vitals.Mana === 120, `hybrid start charges activation (mana ${T.Player.Vitals.Mana})`);
T = applyPatch(T, [{ op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Ice Wall', Times: 1 } }, { op: 'replace', path: '/World/Time', value: '08:00' }]);
ok(T.Player.Vitals.Mana === 104, `20 min upkeep (10) + trigger (6) → 104 (got ${T.Player.Vitals.Mana})`);
T = applyPatch(T, [{ op: 'remove', path: '/Magic/Active/Ice Wall' }, { op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Ice Wall' } }, { op: 'replace', path: '/World/Time', value: '08:00' }]);
ok(T.Player.Vitals.Mana === 94, `cast while not running costs activation (got ${T.Player.Vitals.Mana})`);
T = applyPatch(T, [{ op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Frost Lance', Times: 2 } }, { op: 'replace', path: '/World/Time', value: '08:05' }]);
ok(T.Player.Vitals.Mana === 70, `per-use ×2 = 24 (got ${T.Player.Vitals.Mana})`);
// pact tiers
const P = Schema.parse({ Magic: { Pacts: { Ember: { Spirit: 'Ember', Tier: 'Basic', Terms: 'shares warmth' } } } });
ok(P.Magic.Pacts.Ember.Tier === 'Basic' && P.Magic.Pacts.Ember.Terms === 'shares warmth', 'pact tier Basic + Terms accepted');
// ---- Batch 4: names revealed by story prose ----
{
  const { runEngine } = require('./harness.cjs');
  let A = initState(); const B = _.cloneDeep(A);
  A.World.Time = '07:45';
  runEngine(A, B, 'Irene Chanare looked up. "BB fixed it," she said. Reinforcement spells hummed. <UpdateVariable>{"path":"/Bonds/Caspian"}</UpdateVariable>');
  ok(A.$ui.names.includes('Irene') && A.$ui.names.includes('Bobby'), `names from prose: ${A.$ui.names.join(', ')}`);
  ok(!A.$ui.names.includes('Rei') && !A.$ui.names.includes('Caspian'), 'no match inside words; update block ignored');
}
