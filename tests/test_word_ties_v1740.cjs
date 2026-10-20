// 1.74.0: word gets around (a loud moment reaches the teller's friends as a Knows line), ties (the present character's own line to
// someone {{user}} is close to) and asking after an injury (askAfter's new source). Engine stepBonds / stepBondMemory, nowOf, askAfter.
const { Schema, runEngine, initState, applyPatch, ok } = require('./harness.cjs');
const op = (p, value) => ({ op: 'replace', path: p, value }), ins = (p, value) => ({ op: 'insert', path: p, value }), rm = p => ({ op: 'remove', path: p });
const IA = (With, Kind, o = {}) => ins('/Interactions/-', { With, Kind, ...o });
function base(bonds, present, W = {}) {
  const S = initState(); S.World = { ...S.World, Month: 4, Week: 2, Day: 'Wed', Time: '14:00', Location: 'Canteen', ...W };
  S.$eng.seed = 12345;
  for (const [id, rank] of Object.entries(bonds)) S.Bonds[id] = { Rank: rank, Trust: 50, Tension: 0, $xp: 0, Known_facts: [], Milestones: [] };
  for (const id of present) S.Scene.Present[id] = { Note: '' };
  const A = Schema.parse(S); runEngine(A); return Schema.parse(A);
}
const when = (W, more = []) => [op('/World/Month', W[0]), op('/World/Week', W[1]), op('/World/Day', W[2]), op('/World/Time', W[3]), ...more];
const lines = (S, id) => ((S.$ui.now || {}).people || {})[id] || [];
const has = (S, id, rx) => lines(S, id).some(l => rx.test(l));

console.log('Word gets around');
let S = base({ Aiden: 3, Bobby: 2, Sophia: 2, Irene: 3, Zara: 2 }, ['Aiden', 'Sophia', 'Irene']);
S = applyPatch(S, [IA('Aiden', 'offence', { Weight: 'violence', Note: '{{user}} shoved Aiden into the fountain.' })]);
const w = S.$eng.word || [];
ok(S.Bonds.Aiden.Tension >= 20 && w.length === 1 && w[0].from === 'Aiden' && w[0].to.includes('Bobby') && !w[0].to.includes('Sophia'),
  'a loud moment with Aiden (open) is on its way to his friends; Sophia was there and saw it');
S = applyPatch(S, [op('/World/Day', 'Thu')]);
ok(!(S.Bonds.Bobby.Knows || []).some(k => /Heard from Aiden/.test(k)), 'not yet the next day');
S = applyPatch(S, [op('/World/Day', 'Fri')]);
ok((S.Bonds.Bobby.Knows || []).some(k => /^\[M4 W2 Fri\] Heard from Aiden: \{\{user\}\} shoved Aiden into the fountain\.$/.test(k)), 'two days later Bobby knows, dated');
ok(!(S.Bonds.Sophia.Knows || []).some(k => /Heard from/.test(k)) && !(S.$eng.word || []).length, 'not Sophia; the word is delivered once');
S = applyPatch(S, [IA('Irene', 'offence', { Weight: 'violence', Note: '{{user}} knocked Irene down.' })]);
ok(!(S.$eng.word || []).length, 'Irene (guarded) keeps it to herself');
S = applyPatch(S, [IA('Aiden', 'offence', { Weight: 'slight', Note: 'A rude joke.' })]);
ok(!(S.$eng.word || []).length, 'a small moment does not travel');

console.log('Ties');
S = base({ Aiden: 2, Althair: 6, Irene: 7, Bobby: 6, Sophia: 1 }, ['Aiden']);
ok(has(S, 'Aiden', /^Ties: knows \{\{user\}\} is close to Althair, whom they dislike, and to their rival Irene\. How that colours their view/), 'Aiden: dislike first, then the rival; two at most');
ok(!lines(S, 'Aiden').some(l => /Bobby/.test(l)), 'the third (a friend) is left out');
S = base({ Aiden: 2, Bobby: 6 }, ['Aiden']);
ok(has(S, 'Aiden', /^Ties: knows \{\{user\}\} is close to their friend Bobby\./), 'a friend alone');
S = base({ Aiden: 2, Bobby: 5 }, ['Aiden']);
ok(!has(S, 'Aiden', /^Ties/), 'below Rank 6: no line');

console.log('Asking after an injury');
S = base({ Sophia: 4, Etnie: 4, Kotaro: 4 }, ['Sophia']);
S = applyPatch(S, [ins('/Player/Injuries/Sprained wrist', { Severity: 'moderate', Body_part: 'wrist', Effect: 'clumsy hand', Heals_by: 'M4 W3 Mon' }),
  ins('/Player/Injuries/Paper cut', { Severity: 'minor', Body_part: 'finger', Effect: '', Heals_by: 'tomorrow' })]);
S = applyPatch(S, [op('/World/Time', '17:00'), ins('/Scene/Present/Etnie', { Note: '' })]);
ok(has(S, 'Etnie', /^Has not seen \{\{user\}\} since the injury \(Sprained wrist, M4 W2 Wed\): may notice it or ask, if that is like them\.$/), 'Etnie was not there: she may notice or ask');
ok(!S.$ui.asks.Sophia, 'Sophia was there');
ok(!Object.keys((S.$eng.agenda || {}).ask || {}).some(k => /Paper cut/.test(k)), 'a minor injury is not news');
S = applyPatch(S, [rm('/Player/Injuries/Sprained wrist'), op('/World/Day', 'Thu'), ins('/Scene/Present/Kotaro', { Note: '' })]);
ok(!S.$ui.asks.Kotaro && !Object.keys(S.$eng.agenda.ask || {}).some(k => /Sprained/.test(k)), 'healed: nobody asks any more');
