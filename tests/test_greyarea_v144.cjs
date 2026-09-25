// 1.4.4 (owner, DRAFT_greyarea.md approved 2026-09-25): maximum Tension breaks one rank per blow-up (re-armed below 70), kindness
// eases Tension by the character's nature, "understood" gives back part of the last Trust drop, and the narrator's rules for
// intent, teasing and the other grey areas (rule 502, the Teasing line in <now>).
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('Grey areas 1.4.4');
const clone = o => JSON.parse(JSON.stringify(o));
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
function adv(S, extra = []) {
  const W = S.World; let d = DAYS.indexOf(W.Day) + 1, wk = W.Week, mo = W.Month;
  if (d > 6) { d = 0; wk += 1; if (wk > 4) { wk = 1; mo += 1; } }
  return applyPatch(S, [{ op: 'replace', path: '/World/Month', value: mo }, { op: 'replace', path: '/World/Week', value: wk }, { op: 'replace', path: '/World/Day', value: DAYS[d] }, { op: 'replace', path: '/World/Time', value: '16:00' }, ...extra]);
}
const ten = (id, v) => ({ op: 'replace', path: `/Bonds/${id}/Tension`, value: v });
const tr = (id, v) => ({ op: 'replace', path: `/Bonds/${id}/Trust`, value: v });
const IA = (With, Kind, Public) => ({ op: 'insert', path: '/Interactions/-', value: Public ? { With, Kind, Public: true } : { With, Kind } });
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const set = (S, id, o) => { const X = clone(S); Object.assign(X.Bonds[id], o); return X; };
let S = T(initState(), '09:00', [meet(['Ruby', 'Irene', 'Sophia', 'Caralynn', 'Mimosa', 'Krieg', 'Etnie'])]);

// ---- E1: one rank per blow-up
let R = set(S, 'Sophia', { Rank: 4, Tension: 90 });
R = T(R, '09:10', [ten('Sophia', 100)]);
ok(R.Bonds.Sophia.Rank === 3 && R.Bonds.Sophia.$tbrk === 1, 'maximum Tension breaks a rank');
R = adv(R); R = adv(R, [ten('Sophia', 100)]);
ok(R.Bonds.Sophia.Rank === 3, 'cooling to 99 and back to 100 breaks nothing more');
R = adv(R, [ten('Sophia', 60)]); R = adv(R, [ten('Sophia', 100)]);
ok(R.Bonds.Sophia.Rank === 2, 'after falling below 70, a new blow-up breaks another rank');

// ---- E2: kindness eases Tension by nature, once a day
let K = set(set(set(set(set(S, 'Ruby', { Tension: 30 }), 'Irene', { Tension: 30 }), 'Sophia', { Tension: 30 }), 'Caralynn', { Tension: 30 }), 'Krieg', { Tension: 30 });
K = T(K, '09:20', [IA('Ruby', 'help'), IA('Irene', 'keep'), IA('Sophia', 'help'), IA('Caralynn', 'defend'), IA('Krieg', 'keep')]);
ok(K.Bonds.Ruby.Tension === 25 && K.Bonds.Irene.Tension === 27 && K.Bonds.Sophia.Tension === 30 && K.Bonds.Krieg.Tension === 30,
  'withdrawn -5, authority -3 (good conduct), confrontational and dangerous 0');
ok(K.Bonds.Caralynn.Tension === 30, 'social: a private defence does not ease it');
K = T(K, '09:30', [IA('Caralynn', 'defend', true), IA('Ruby', 'keep')]);
ok(K.Bonds.Caralynn.Tension === 25 && K.Bonds.Ruby.Tension === 25, 'social: a public defence does (-5); once a day (Ruby unchanged)');

// ---- E3: understood
let U = T(S, '09:10', [tr('Irene', 20), tr('Ruby', 40), tr('Mimosa', 10)]);
ok(U.Bonds.Irene.Trust === 15 && U.Bonds.Irene.$tlast === 25, 'a drop is remembered (guarded x1.25: 40 -20 -> 15, drop 25)');
U = T(U, '10:00', [IA('Irene', 'understood'), IA('Ruby', 'understood'), IA('Mimosa', 'understood')]);
ok(U.Bonds.Irene.Trust === 21 && U.Bonds.Ruby.Trust === 50 && U.Bonds.Mimosa.Trust === 0, 'understood gives back guarded 25% (+6), open 50% (+10), closed nothing (Mimosa stays at 0: 30 -20 x1.5)');
ok(U._Log.some(l => /Mimosa understands, but it does not give back what was lost \(not in their nature\)/.test(l)), 'closed: said why');
U = T(U, '10:10', [IA('Irene', 'understood')]);
ok(U.Bonds.Irene.Trust === 21, 'once per drop');
let U2 = T(S, '09:10', [tr('Ruby', 40)]);
for (let i = 0; i < 32; i++) U2 = adv(U2);
U2 = adv(U2, [IA('Ruby', 'understood')]);
ok(U2._Log.some(l => /Ruby understands, but it does not give back what was lost \(too long ago\)/.test(l)), 'not after 30 days');

// ---- the tsundere use case: a month of barbs with warm deeds no longer grinds Sophia down to Rank 0
let Y = T(initState(), '09:00', [meet(['Sophia', 'Irene', 'Ruby'])]);
Y = set(set(set(Y, 'Sophia', { Rank: 2 }), 'Irene', { Rank: 2 }), 'Ruby', { Rank: 2 });
for (let i = 0; i < 28; i++) {
  const day = DAYS[(i + 1) % 7];
  Y = adv(Y, ['Sophia', 'Irene', 'Ruby'].flatMap(id => [IA(id, 'talk'), ...(day === 'Mon' ? [IA(id, 'keep')] : []), ...(day === 'Wed' ? [IA(id, 'help')] : []), ...(day === 'Thu' ? [IA(id, 'defend', true)] : [])]));
  Y = applyPatch(Y, ['Sophia', 'Irene', 'Ruby'].map(id => ten(id, Math.min(100, Y.Bonds[id].Tension + (day === 'Tue' ? 12 : 4)))));
}
ok(Y.Bonds.Sophia.Rank >= 1 && Y.Bonds.Irene.Tension < 100 && Y.Bonds.Ruby.Tension < 30, `tsundere, 4 weeks: Sophia loses one rank at most (Rank ${Y.Bonds.Sophia.Rank}), Irene stays under 100 (${Y.Bonds.Irene.Tension}), Ruby eases (${Y.Bonds.Ruby.Tension})`);

// ---- narrator rules and <now>
const rules = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/502.txt'), 'utf8');
ok(/by what the character believes \{\{user\}\} meant/.test(rules) && /Teasing, mock insults and play-fighting that both sides enjoy are not offences/.test(rules) && /A consensual spar is a fight, not violence/.test(rules) && /\|understood"\}/.test(rules),
  'rule 502: intent, teasing, consent, the understood kind');
const now505 = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/505.txt'), 'utf8');
const nw = ejs.render(now505, { getvar: k => require('lodash').get({ stat_data: S }, k) });
ok(/Teasing \(how each present character takes it\): [^\n]*Sophia loves it, shoves included/.test(nw) && /Irene tolerates light teasing from those they trust/.test(nw) && /Etnie any attention from \{\{user\}\} is a gift/.test(nw),
  '<now>: how each present character takes teasing');
