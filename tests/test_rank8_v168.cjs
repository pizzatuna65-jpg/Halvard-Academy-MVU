// 1.6.8 Rank 8 branches (owner, approved 2026-09-26 in the brainstorm thread, planning/DRAFT_rank8_branches.md): each NPC allows
// some of best friend, romance and rival (A all, B best friend or rival, C best friend or romance, D best friend only). A rivalry
// opens only under the Rank 8 Trust gate; a C or D bond waits for the gate instead. Romance is refused for B and D. The branch the
// bond took is recorded once at Rank 8 ($branch), and the Cast Sheet adds that branch's line.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('Rank 8 branches 1.6.8');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const R = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const C = JSON.parse(rd('data/npc_canon.json'));
const clone = o => JSON.parse(JSON.stringify(o));
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const set = (S, id, o) => { const X = clone(S); Object.assign(X.Bonds[id], o); return X; };
const rom = id => ({ op: 'replace', path: `/Bonds/${id}/Romance`, value: true });
const rank = (id, r) => ({ op: 'replace', path: `/Bonds/${id}/Rank`, value: r });

// ---- data
const LINES = { A: ['romance', 'rival'], B: ['rival'], C: ['romance'], D: [] };
ok(Object.keys(C.change).every(id => 'ABCD'.includes(C.branch[id]) && C.branch[id].length === 1), 'every NPC with canon has a branch A-D');
ok(Object.keys(C.change).every(id => JSON.stringify(['romance', 'rival'].filter(k => C.voice[id][k])) === JSON.stringify(LINES[C.branch[id]])), 'each voice has exactly the lines its branch needs');
const n = k => Object.values(C.branch).filter(x => x === k).length;
// 1.7.0: cohort 2 adds A Nerys, Hadrian, Tsubaki and C Linus, Maple, Wren (planning/DRAFT_cohort2_npcs.md)
ok(n('A') === 23 && n('B') === 2 && n('C') === 12 && n('D') === 7, `categories as approved: A 23, B 2, C 12, D 7 (${n('A')}, ${n('B')}, ${n('C')}, ${n('D')})`);
ok(C.branch.Krieg === 'B' && C.branch.Tristan === 'B' && C.branch.Althair === 'D' && C.branch.Florian === 'A' && C.branch.Milena === 'A' && ['Trixie', 'Vera', 'Tilly', 'Ruby', 'Etnie'].every(id => C.branch[id] === 'C'), 'the owner\'s moves (Florian, Milena A; Tristan B; Trixie, Vera, Tilly C; Althair D)');
ok(/a romance with \{\{user\}\} is the one exception, and he will not call it one/.test(C.voice.Florian.dont_flatten), 'Florian: the approved exception in Don\'t flatten');
const TASTE = /\bparagraphs?\b|point of view|\bPOV\b|\btense\b|third person|second person|first person|word count|\bprose style\b|\{\{user\}\}'s (words|thoughts|choices)/i;
ok(!Object.values(C.voice).some(v => TASTE.test((v.romance || '') + ' ' + (v.rival || ''))), 'no branch line sets prose taste (card vs preset)');
ok(/Nothing is cured/.test(C.voice.Alyssa.romance) && /The rules do not bend for \{\{user\}\}/.test(C.voice.Dante.romance), 'Alyssa is still not cured; Dante still bends no rule');

// ---- engine
const ids = ['Irene', 'Ruby', 'Krieg', 'Gavlan', 'Tristan', 'Althair', 'Trixie'];
let S = T(initState(), '09:00', [meet(ids)]);
// A with low Trust: never held, rivalry only; at Rank 8 the branch is rival and the Cast Sheet prints the rival line
let A = T(set(S, 'Irene', { Rank: 7, $xp: 999, $cool: -1, Trust: 40 }), '09:10');
ok(A.Bonds.Irene._Event_ready && /can only turn into a sworn rivalry/.test(A.$ui.bev.Irene.dir), 'A, Trust 40: the event is ready and can only end in a rivalry');
A = T(A, '09:20', [rank('Irene', 8)]);
ok(A.Bonds.Irene.Rank === 8 && A.Bonds.Irene.$branch === 'rival', `A, Trust 40, Rank 8: branch rival (${A.Bonds.Irene.$branch})`);
let t = R(509, A);
ok(/Sworn rival of \{\{user\}\}: Treats \{\{user\}\} as the problem the rules exist for/.test(t) && !/Romance with \{\{user\}\}/.test(t), 'the Cast Sheet prints Irene\'s rival line');
// C with low Trust: held for Trust 50; with Trust 55 ready, best friendship or romance
let Cq = T(set(S, 'Ruby', { Rank: 7, $xp: 999, $cool: -1, Trust: 40 }), '09:10');
ok(!Cq.Bonds.Ruby._Event_ready && Cq.$ui.bev.Ruby.held && Cq.$ui.bev.Ruby.why === 'trust' && Cq.$ui.bev.Ruby.need === 50, 'C, Trust 40: the Rank 8 event waits for Trust 50');
Cq = set(Cq, 'Ruby', { Trust: 55 }); Cq = T(Cq, '09:20');
ok(Cq.Bonds.Ruby._Event_ready && /best friendship or a romance here; not a rivalry/.test(Cq.$ui.bev.Ruby.dir), 'C, Trust 55: ready, a best friendship or a romance');
Cq = T(Cq, '09:30', [rank('Ruby', 8)]);
ok(Cq.Bonds.Ruby.$branch === 'friend' && !/Romance with|Sworn rival/.test(R(509, Cq).split('[Ruby')[1] || ''), 'C at Rank 8 as friends: no extra line');
Cq = T(Cq, '09:40', [rom('Ruby')]);
ok(Cq.Bonds.Ruby.Romance && Cq.Bonds.Ruby.$branch === 'romance' && /Romance with \{\{user\}\}: Tells \{\{user\}\} with the guitar/.test(R(509, Cq)), 'C: a romance is accepted, recorded, and its line printed');
// B: rival possible, romance refused; with Trust 60 only a best friendship
let B = T(set(S, 'Tristan', { Rank: 7, $xp: 999, $cool: -1, Trust: 60 }), '09:10');
ok(/can only turn into a best friendship here; not a romance or a rivalry/.test(B.$ui.bev.Tristan.dir), 'B, Trust 60: only a best friendship');
let K = T(set(S, 'Krieg', { Rank: 8, Trust: 60 }), '09:10', [rom('Krieg')]);
ok(!K.Bonds.Krieg.Romance && K._Log.some(l => /Romance with Krieg is closed/.test(l)), 'B (Krieg): the romance flag is refused');
// D: romance refused; no_gates (Althair) is never held and only a best friendship
let D = T(set(S, 'Gavlan', { Rank: 8, Trust: 80 }), '09:10', [rom('Gavlan')]);
ok(!D.Bonds.Gavlan.Romance && D._Log.some(l => /Romance with Gavlan is closed/.test(l)), 'D (Gavlan): the romance flag is refused');
let Al = T(set(S, 'Althair', { Rank: 7, $xp: 999, $cool: -1 }), '09:10');
ok(Al.Bonds.Althair._Event_ready && !Al.$ui.bev.Althair.held && /only turn into a best friendship/.test(Al.$ui.bev.Althair.dir), 'D with no gates (Althair): never held, a best friendship only');
// romance switched off in Settings: a C character's event offers only a best friendship
let Off = set(S, 'Trixie', { Rank: 7, $xp: 999, $cool: -1, Trust: 70 }); Off.$ui.romrank = 11; Off = T(Off, '09:10');
ok(/only turn into a best friendship here \(romance is closed at this rank in Settings\)/.test(Off.$ui.bev.Trixie.dir), 'romance off in Settings: a best friendship only');

// ---- saves from before 1.6.8: the branch is filled from what the bond already shows, and nothing else changes
let O = clone(S);
Object.assign(O.Bonds.Gavlan, { Rank: 8, Romance: true, Trust: 70 }); Object.assign(O.Bonds.Irene, { Rank: 9, Title: 'Sworn rival', Trust: 40 }); Object.assign(O.Bonds.Trixie, { Rank: 8, Trust: 70 });
for (const id of ['Gavlan', 'Irene', 'Trixie']) delete O.Bonds[id].$branch;
O = T(O, '09:50');
ok(O.Bonds.Gavlan.Romance && O.Bonds.Gavlan.$branch === 'romance' && O.Bonds.Irene.$branch === 'rival' && O.Bonds.Irene.Rank === 9 && O.Bonds.Irene.Title === 'Sworn rival' && O.Bonds.Trixie.$branch === 'friend',
  'an older save keeps its romance (even with a D character), rival title and ranks; $branch is filled in');

// ---- the dossier says in advance what Rank 8 can open (Rank 6-7)
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { PANELS, view };')();
let V = clone(S); for (const [id, r] of [['Irene', 6], ['Ruby', 7], ['Krieg', 7], ['Gavlan', 6], ['Althair', 7], ['Trixie', 8]]) V.Bonds[id].Rank = r;
const dos = id => { U.view.arg = id; return U.PANELS.npc.render(V); };
ok(/At Rank 8 this bond can become: best friends · romance · sworn rivals \(only while Trust is under 50\)\./.test(dos('Irene')), 'dossier, A: all three, rivalry under Trust 50');
ok(/can become: best friends · romance\. The Rank 8 event waits for Trust 50\./.test(dos('Ruby')), 'dossier, C: friends or romance; waits for Trust 50');
ok(/can become: best friends · sworn rivals/.test(dos('Krieg')) && /can become: best friends\. The Rank 8 event waits/.test(dos('Gavlan')), 'dossier, B and D');
ok(/can become: best friends\.<\/div>/.test(dos('Althair')) && !/At Rank 8 this bond/.test(dos('Trixie')), 'dossier: Althair (no gates) never waits; nothing shown from Rank 8 on');

// ---- a real 1.6.7 save with a Rank 8 romance (Kanae) and a Rank 8 sworn rival (Irene): the branch is filled in on load
const { Schema, runEngine } = require('./harness.cjs');
const old = JSON.parse(rd('tests/fixtures/saves/save_1.6.7_rank8.json'));
const P = Schema.parse(_.cloneDeep(old)); runEngine(P, _.cloneDeep(old), ''); const L = Schema.parse(P);
ok(L.Bonds.Kanae.Romance && L.Bonds.Kanae.$branch === 'romance' && L.Bonds.Irene.$branch === 'rival' && L.Bonds.Irene.Title === 'Sworn rival' && L.$eng.ver === JSON.parse(rd('src/card/card.json')).character_version,
  'save 1.6.7: Kanae romance and Irene rival keep their state; $branch filled in; version updated');
L.Scene.Present = { Kanae: { Note: '' }, Irene: { Note: '' } }; L.$ui.cast = { full: ['Kanae', 'Irene'], brief: [] };
t = R(509, L);
ok(/Romance with \{\{user\}\}: \{\{user\}\} is hers/.test(t) && /Sworn rival of \{\{user\}\}: Treats \{\{user\}\} as the problem/.test(t), 'save 1.6.7: the Cast Sheet prints both branch lines');
