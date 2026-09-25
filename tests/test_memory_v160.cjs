// 1.6.0 (Batch C, planning/DRAFT_batch_plan.md): the character's side of a bond. Mind, Knows (dated, 15 kept), Imprints (weight
// 5+, at most 5, Change rules), $Defining (engine, 5), Next (Rank 3+: since you last saw them, lapses into $Recent, may be here),
// Meanwhile (Rank 7+ unseen a week), N13 ages in words, D6 / P8 / V1 rules, the dossier shows defining moments but never Mind.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view };')();
console.log('NPC memory 1.6.0');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data, E = uid => card.character_book.entries.find(e => e.id === uid).content;
const gv = S => k => require('lodash').get({ stat_data: S }, k);
const R = (uid, S) => ejs.render(E(uid), { getvar: gv(S) });
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let S = initState({ etnie: true });
const P = (time, ops, text, day) => { S = applyPatch(S, [...(day ? [{ op: 'replace', path: '/World/Day', value: day }] : []), { op: 'replace', path: '/World/Time', value: time }, ...ops], { text: text || '' }); return S; };
const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const B = (id, f, v) => ({ op: 'replace', path: `/Bonds/${id}/${f}`, value: v });
const ins = (id, f, v) => ({ op: 'insert', path: `/Bonds/${id}/${f}/-`, value: v });
P('09:00', [here(['Irene'])]);
S.Bonds.Irene.Rank = 3;

// ---- Mind and Knows
P('09:30', [B('Irene', 'Mind', 'Warier of {{user}} than she shows.'), ins('Irene', 'Knows', 'saw {{user}} out after curfew')]);
ok(S.Bonds.Irene.Mind === 'Warier of {{user}} than she shows.' && S.Bonds.Irene.Knows[0] === '[M1 W1 Mon] saw {{user}} out after curfew', 'Mind kept; a Knows line is dated by the engine');
P('09:40', Array.from({ length: 16 }, (_, i) => ins('Irene', 'Knows', 'fact ' + i)));
ok(S.Bonds.Irene.Knows.length === 15 && S.Bonds.Irene.$Knows_old.length === 2 && S.Bonds.Irene.$Knows_old[0].includes('curfew'), 'Knows keeps the latest 15; older lines move to $Knows_old');
P('09:50', []);
ok(S.Bonds.Irene.Knows.length === 15 && S.Bonds.Irene.Knows.every(k => !/^\[M1 W1 Mon\] \[M1/.test(k)), 'dates are not stamped twice');

// ---- Imprints
const imp = (b, w) => ins('Irene', 'Imprints', { Belief: b, Weight: w, From: 'test' });
P('10:00', [imp('Small thing', 3)]);
ok(!S.Bonds.Irene.Imprints.length && /needs weight 5 or more/.test(S._Log.join(' ')), 'an Imprint under weight 5 is refused');
P('10:05', [imp('A', 5), imp('B', 6), imp('C', 7), imp('D', 8), imp('E', 9)]);
ok(S.Bonds.Irene.Imprints.length === 5 && S.Bonds.Irene.Imprints[0].When === 'M1 W1 Mon', 'five Imprints, dated');
P('10:10', [imp('F', 5)]);
ok(S.Bonds.Irene.Imprints.length === 5 && !S.Bonds.Irene.Imprints.some(x => x.Belief === 'F') && /does not outweigh the lightest/.test(S._Log.join(' ')), 'a sixth that does not outweigh the lightest is refused');
P('10:15', [imp('G', 10)]);
const G = S.Bonds.Irene.Imprints.find(x => x.Belief === 'G');
ok(S.Bonds.Irene.Imprints.length === 5 && G && G.Was === 'A' && !S.Bonds.Irene.Imprints.some(x => x.Belief === 'A'), 'a heavier one replaces the lightest and keeps what it replaced (Was)');
{ // a "fixed" character (data/npc_canon.json Change) is never rewritten: same engine with Irene fixed
  const src = rd('src/scripts/engine.js').replace(/const CHANGE = \{[^\n]*\};/, "const CHANGE = {\"Irene\":\"fixed\"};");
  const run = new Function(src + '\nreturn runEngine;')();
  const T = Schema.parse(_.cloneDeep(S)); T.Bonds.Irene.Imprints.push({ Belief: 'H', Weight: 10, When: '', From: '', Was: '' }); run(T, S, '');
  ok(!T.Bonds.Irene.Imprints.some(x => x.Belief === 'H') && /does not change at the core \(fixed\)/.test(T._Log.join(' ')), 'a fixed character: a sixth Imprint is refused however heavy');
}

// ---- Defining moments
P('11:00', [B('Irene', 'Trust', S.Bonds.Irene.Trust - 20), { op: 'insert', path: '/Interactions/-', value: { With: 'Irene', Kind: 'other', Note: 'Read her private letter aloud.' } }]);
const D = S.Bonds.Irene.$Defining;
ok(D.length === 1 && D[0].n === 'Read her private letter aloud.' && /Trust −\d+/.test(D[0].fx), 'a Trust drop of 20 becomes a defining moment');
P('11:05', [{ op: 'insert', path: '/Interactions/-', value: { With: 'Irene', Kind: 'talk', Note: 'Chatted.' } }]);
ok(S.Bonds.Irene.$Defining.length === 1, 'a small moment is not defining');

// ---- Next
P('12:00', [B('Etnie', 'Next', { What: 'Nap', Where: 'Library', Until: 'M1 W1 Mon 14:00' })]);
ok(S.Bonds.Etnie.Next && S.Bonds.Etnie.Next.What === 'Nap', 'Etnie (Rank 3) keeps a Next plan');
P('12:05', [here(['Ruby'])]);
P('12:10', [B('Ruby', 'Next', { What: 'Bake', Where: 'Canteen', Until: 'M1 W1 Mon 18:00' })]);
ok(S.Bonds.Ruby.Next === null && /Next plans are kept for bonds of Rank 3/.test(S._Log.join(' ')), 'a Rank 0 bond keeps no Next plan');
P('12:20', [here([]), B('Irene', 'Next', { What: 'Council budget meeting, then the library', Where: 'Main Library', Until: 'M1 W1 Mon 18:00' })]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Location', value: 'Main Library' }, { op: 'replace', path: '/World/Time', value: '13:00' }]);
ok(S.$ui.maybe.some(([id]) => id === 'Irene') && /May be here by their own plans \(Next\): [^\n]*Irene \(Council budget/.test(R(505, S)), '{{user}} is where Irene planned to be: she may be here');
P('13:30', [here(['Irene'])]);
ok(S.Bonds.Irene.Next === null && S.$ui.since[0][0] === 'Irene' && /Since you last saw Irene: Council budget meeting, then the library \(Main Library\)/.test(R(505, S)), 'meeting again: "since you last saw" once, then the plan is spent');
P('13:35', []);
ok(!S.$ui.since.length, '...only once');
P('15:00', [here([])]);
ok(S.Bonds.Etnie.Next === null && /\(Off-screen\) Nap \(Library\)\./.test(S.Bonds.Etnie.$Recent.slice(-1)[0].n), 'a plan that lapsed unseen moves into $Recent');

// ---- Meanwhile (Rank 7+, unseen a week)
S.Bonds.Irene.Rank = 7;
for (let d = 1; d <= 8; d++) P('12:00', [], '', DAYS[d % 7]);   // Tue .. Tue: to the next week
S = applyPatch(S, [{ op: 'replace', path: '/World/Week', value: 2 }, { op: 'replace', path: '/World/Day', value: 'Wed' }]);
const mw = S.Journal.filter(l => /Meanwhile: Irene/.test(l));
ok(mw.length === 1, 'a Rank 7 bond unseen for a week gets one Meanwhile line: ' + (mw[0] || 'none'));
S = applyPatch(S, [{ op: 'replace', path: '/World/Day', value: 'Thu' }]);
ok(S.Journal.filter(l => /Meanwhile: Irene/.test(l)).length === 1, 'at most one a week');

// ---- N13 ages in words
const ageSrc = E(505).match(/const ageOf = [^\n]*/)[0];
const ageOf = new Function(ageSrc + '\nreturn ageOf;')();
const W = { Month: 3, Week: 2, Day: 'Wed' };
const cases = [['M3 W2 Wed 08:00', 'earlier today'], ['M3 W2 Tue', 'yesterday'], ['M3 W1 Fri', '5 days ago'], ['M3 W1 Wed', 'last week'], ['M2 W4 Wed', '2 weeks ago'],
  ['M2 W2 Wed', 'last month'], ['M1 W2 Wed', '2 months ago'], ['M12 W4 Sun', '2 months ago'], ['M3 W2', 'this week'], ['M3 W1', 'last week'], ['M2 W4', '2 weeks ago'], ['yesterday-ish', ''], ['M13 W9', '']];
const bad = cases.filter(([w, a]) => ageOf(w, W) !== a);
ok(!bad.length, 'age bands at day, week, month and year edges; unreadable dates get none' + (bad.length ? ': ' + bad.map(([w, a]) => `${w} -> "${ageOf(w, W)}" (want "${a}")`).join('; ') : ''));
ok(ageOf('M12 W4 Sun', { Month: 1, Week: 1, Day: 'Mon' }) === 'yesterday', 'over the new year: yesterday');

// ---- Cast Sheet and <now>
S = applyPatch(S, [here(['Irene', 'Aiden', 'Castor', 'Kanae', 'Zara'])]);
let t = R(509, S);
ok(/Their mind now: Warier of \{\{user\}\} than she shows\./.test(t) && /What they know about \{\{user\}\}[^\n]*\[M1 W1 Mon, [a-z0-9 ]+\] fact/.test(t), 'full sheet: Mind and Knows with their age');
ok(/Imprints \(the only things that have changed who they are\): [^\n]*"G" \(weight 10, M1 W1 Mon, [a-z0-9 ]+; from test; replaced "A"\)/.test(t) && /Defining moments with \{\{user\}\}: \[M1 W1 Mon 11:00, [a-z0-9 ]+\] Read her private letter aloud/.test(t), 'full sheet: Imprints and defining moments');
ok(/Recent with \{\{user\}\}: Irene \(newest first\): \[M1 W\d \w{3} [\d:]+, [a-z0-9 ]+\]/.test(R(505, S)), '<now>: recent rows carry their age');
ok(/Journal dates, newest first: M1 W\d \w{3} = /.test(R(505, S)), '<now>: the age of the newest Journal dates');
const r504 = R(504, S), r502 = E(502);
ok(/Only an Imprint changes who a character is/.test(r504) && /Arrivals take the walk time between places/.test(r504) && /use the age <now> gives it; never guess/.test(r504), '504: P8 imprint line, D6 walk time, N13 age rule');
ok(/Recalled memories say what happened, not who knows it/.test(r504) && /Next plans that fall due/.test(r504), '504: V1 memory line; Next in the world sources');
ok(/- Mind: /.test(r502) && /- Knows: /.test(r502) && /- Imprints: /.test(r502) && /- Next: /.test(r502), '502: how to write Mind, Knows, Imprints and Next');

// ---- dossier: defining moments yes, the character's mind never
U.view.arg = 'Irene';
const dos = U.PANELS.npc.render(S);
ok(/Defining moments/.test(dos) && /Read her private letter aloud/.test(dos), 'dossier shows defining moments');
ok(!/Warier of/.test(dos) && !/fact 3/.test(dos) && !/"G"|>G</.test(dos), 'dossier never shows Mind, Knows or Imprints (narrator only)');
