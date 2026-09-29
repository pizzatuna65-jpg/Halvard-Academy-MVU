// 1.6.11 (owner playtest, 2026-09-26: "saya bertemu trixie untuk pertama kali, kenapa status trustnya 10, dan betrayed?"): a new
// bond starts at the character's own Trust (1.4.3 category start); a number the narrator writes on a first meeting gives way,
// and the output format's example no longer shows one. Drops on a bond that already exists still work. A club in People → Connections
// shows someone only once their Club field is open (Rank 1), as the club list in Activities does. A 1.6.10 save loads.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('New bonds 1.6.11');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const meet = (id, v) => [{ op: 'replace', path: '/Scene/Present', value: { [id]: { Note: '' } } }, { op: 'insert', path: '/Bonds/' + id, value: v }];
const T = (S, time, ops) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...ops]);

let A = T(initState(), '09:00', meet('Trixie', { Rank: 0, Trust: 10, Tension: 0, Title: 'Fox girl' }));
ok(A.Bonds.Trixie.Trust === 60, `Trixie (open) met with "Trust": 10 written: Trust ${A.Bonds.Trixie.Trust} (her start, 60), not Betrayed`);
ok((A._Log || []).some(l => /Trixie is new: Trust starts at 60/.test(l)), 'the log tells the narrator why');
const B = T(initState(), '09:00', meet('Trixie', { Rank: 0, Title: 'Fox girl' }));
ok(B.Bonds.Trixie.Trust === 60 && !(B._Log || []).some(l => /is new: Trust/.test(l)), 'with no Trust written: 60, no log line');
const C = T(initState(), '09:00', meet('Mimosa', { Rank: 0, Trust: 90 }));
ok(C.Bonds.Mimosa.Trust === 30, `a closed character cannot be written higher on a first meeting either (Mimosa ${C.Bonds.Mimosa.Trust})`);
const E = T(initState(), '09:00', meet('Etnie', { Rank: 0, Trust: 10 }));
ok(E.Bonds.Etnie.Rank >= 1 && E.Bonds.Etnie.Trust >= 50, `Etnie keeps her own start (Rank ${E.Bonds.Etnie.Rank}, Trust ${E.Bonds.Etnie.Trust})`);
// an existing bond: the narrator's drop still counts
A = T(A, '09:30', [{ op: 'replace', path: '/Bonds/Trixie/Trust', value: 45 }]);
ok(A.Bonds.Trixie.Trust === 45, `the next reply, a lie found out (60 -> 45): Trust ${A.Bonds.Trixie.Trust}`);
// the narrator is told
const f503 = rd('src/worldbook/custom/content/503.txt'), f502 = rd('src/worldbook/custom/content/502.txt');
ok(!/"\/Bonds\/\w+", "value": \{[^}]*"Trust"/.test(f503), 'the output format example inserts a bond without a Trust number');
ok(/A new record starts at the character's own Trust \(engine\): leave Trust out when you insert one\./.test(f502), 'rule 502 says a new record starts at their own Trust');
// a 1.6.10 save loads
const save = JSON.parse(rd('tests/fixtures/saves/save_1.6.10.json'));
const L = T(save, '17:00', []);
ok(L.$eng.ver === JSON.parse(rd('src/card/card.json')).character_version && Object.keys(save.Bonds).every(id => L.Bonds[id] && L.Bonds[id].Rank === save.Bonds[id].Rank && L.Bonds[id].Trust === save.Bonds[id].Trust),
  'the 1.6.10 save loads with every bond, rank and Trust unchanged');

// ---- a club shows its members only once their Club field is open (owner: Ottavio at Rank 0 already showed the Fishing Club)
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { graphModel, view, DATA, EDGE };')();
U.view.gtypes = new Set(Object.keys(U.EDGE)); U.view.ggroups = new Set(['club']);
const club = (S, id) => U.graphModel(S).links.some(l => l.type === 'group' && l.target === id && /^grp:club:/.test(l.source));
let O = T(initState(), '10:00', meet('Ottavio', { Rank: 0 }));
ok(!club(O, 'Ottavio'), 'Ottavio at Rank 0: no club line');
O.Bonds.Ottavio.Rank = 1;
ok(club(O, 'Ottavio'), 'Ottavio at Rank 1 (Club field open): the Fishing Club line');
const src = rd('src/ui/parts/10_people.js');
ok(/\.filter\(id => clubFieldOpen\(id, S\)\)/.test(src), 'the graph uses the same rule as the club list in Activities (clubFieldOpen)');
