// 1.6.9 bug hunt (stress test, bug hunt and compatibility round after 1.6.8): the Rank 8 branch is decided by the Trust the
// 7->8 event was played on, a character with no romance branch says so in their sheet, and the dossier's Rank 8 line follows
// the romance rank in Settings. A 1.6.8 save with a bond waiting at Rank 7 still loads and takes the right branch.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('Bug hunt 1.6.9');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const R = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { view, PANELS };')();
const clone = o => JSON.parse(JSON.stringify(o));
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const set = (S, id, o) => { const X = clone(S); Object.assign(X.Bonds[id], o); return X; };
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const rank = (id, r) => ({ op: 'replace', path: `/Bonds/${id}/Rank`, value: r });
const S0 = T(initState(), '09:00', [meet(['Irene', 'Gavlan', 'Krieg', 'Ruby'])]);

// ---- the Rank 8 branch follows the directions the narrator had (Trust before the +3 a rank earned adds)
for (const tr of [45, 47, 49, 50, 52]) {
  let A = T(set(S0, 'Irene', { Rank: 7, $xp: 999, $cool: -1, Trust: tr }), '09:10');
  const rival = /can only turn into a sworn rivalry/.test(A.$ui.bev.Irene.dir);
  A = T(A, '09:20', [rank('Irene', 8)]);
  ok(A.Bonds.Irene.Rank === 8 && A.Bonds.Irene.$branch === (rival ? 'rival' : 'friend') && rival === tr < 50,
    `Irene at Trust ${tr}: told ${rival ? 'rivalry' : 'friendship'}, recorded ${A.Bonds.Irene.$branch} (Trust now ${A.Bonds.Irene.Trust})`);
}
// a branch already recorded never changes with later Trust
let A = T(set(S0, 'Irene', { Rank: 7, $xp: 999, $cool: -1, Trust: 48 }), '09:10');
A = T(A, '09:20', [rank('Irene', 8)]);
A = T(set(A, 'Irene', { Trust: 70 }), '09:30');
ok(A.Bonds.Irene.$branch === 'rival', 'the rivalry stays recorded when Trust later rises');

// ---- a character with no romance branch (B, D) says so in their sheet from Rank 6; others do not
let B = T(set(set(set(S0, 'Gavlan', { Rank: 6 }), 'Krieg', { Rank: 9 }), 'Ruby', { Rank: 9 }), '09:10');
let t = R(509, B);
ok(/Not a romance: Gavlan does not become \{\{user\}\}'s romance/.test(t) && /Not a romance: Krieg does not become/.test(t), 'B and D sheets (Gavlan Rank 6, Krieg Rank 9) say they do not become a romance');
ok(!/Not a romance: Ruby/.test(t) && !/Not a romance: Irene/.test(t), 'C and A sheets do not');
B = T(set(B, 'Gavlan', { Rank: 5 }), '09:20');
ok(!/Not a romance: Gavlan/.test(R(509, B)), 'under Rank 6 the line is not printed');
B = set(B, 'Krieg', { Romance: true }); B.Bonds.Krieg.Romance = true;
ok(!/Not a romance: Krieg/.test(R(509, B)), 'a romance kept from an older save gets no such line');
const TASTE = /\bparagraphs?\b|point of view|\bPOV\b|\btense\b|third person|second person|first person|word count|\bprose style\b/i;
ok(!TASTE.test(rd('src/worldbook/custom/509.template.ejs')), 'the new line sets no prose taste (card vs preset)');

// ---- the dossier's Rank 8 line follows the romance rank in Settings
const dossier = (S, id) => { U.view.arg = id; return U.PANELS.npc.render(S); };
let D = T(set(S0, 'Ruby', { Rank: 7 }), '09:10');
const line = S => ((dossier(S, 'Ruby').match(/At Rank 8 this bond can become: [^<]*/) || [''])[0]);
ok(/romance(?! \()/.test(line(D)), 'default Settings: romance at Rank 8 (' + line(D) + ')');
D.$ui.romrank = 10;
ok(/romance \(from Rank 10 in Settings\)/.test(line(D)), 'romance from Rank 10 in Settings: the line says so (' + line(D) + ')');
D.$ui.romrank = 11;
ok(/romance \(off in Settings\)/.test(line(D)), 'romance off: the line says so');

// ---- a 1.6.8 save loads; a bond ready at Rank 7 with Trust 48 still becomes the rivalry it was told
const save = JSON.parse(rd('tests/fixtures/saves/save_1.6.8.json'));
let L = T(save, '17:00');
ok(L.$eng.ver === JSON.parse(rd('src/card/card.json')).character_version && Object.keys(save.Bonds).every(id => L.Bonds[id] && L.Bonds[id].Rank === save.Bonds[id].Rank), 'the 1.6.8 save loads with every bond and rank');
L = T(set(L, 'Irene', { Rank: 7, $xp: 999, $cool: -1, Trust: 48 }), '17:10', [meet(['Irene'])]);
L = T(L, '17:20', [rank('Irene', 8)]);
ok(L.Bonds.Irene.$branch === 'rival', 'from the 1.6.8 save: Irene at Trust 48 becomes a sworn rival');
