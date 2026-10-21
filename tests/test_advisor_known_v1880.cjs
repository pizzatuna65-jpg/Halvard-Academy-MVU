// 1.88.0 (owner playtest, 2026-10-22: "semua teacher di club ke unlock"): a teacher's Role line ("advises the X", 1.75.0) is open at
// Rank 0, so the Clubs list showed every advisor before {{user}} had met them. An advisor with no Club field now shows once {{user}}
// knows it: Rank 1 (as a student's Club field), a member of that club, or a known fact naming the club. The dossier's Role line keeps
// the "advises the" clause back until then. The 1.87.0 save loads.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('Club advisors 1.88.0');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { acClubs, clubsNow, graphModel, view, roleShown, EDGE };')();
const T = (S, time, ops) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...ops]);
const card = (S, name) => { const h = U.acClubs(S), i = h.search(new RegExp(`>${name}</(b|span)>`)); return i < 0 ? '' : h.slice(i, h.indexOf('data-fill', i)); };

let S = initState();
ok(!/\(advisor\)/.test(U.acClubs(S)), 'a new game: no advisor shown in any club');
ok(!/advises/.test(U.roleShown('Vallie', 'Teaches Creature Studies; advises the Beast Handling Club. Age 48.', S)),
  'the dossier Role line hides "advises the" while unknown');
S = T(S, '09:00', [{ op: 'replace', path: '/Scene/Present', value: { Vallie: { Note: '' } } }, { op: 'insert', path: '/Bonds/Vallie', value: { Rank: 0 } }]);
ok(!/\(advisor\)/.test(card(S, 'Beast Handling Club')), 'met at Rank 0: still not shown');
S.Bonds.Vallie.Known_facts = ['Advises the Beast Handling Club'];
ok(/\(advisor\)/.test(card(S, 'Beast Handling Club')) && /advises the Beast Handling Club/.test(U.roleShown('Vallie', 'Teaches; advises the Beast Handling Club. Age 48.', S)),
  'a known fact naming the club: shown in the list and in the dossier');
S.Bonds.Vallie.Known_facts = []; S.Bonds.Vallie.Rank = 1;
ok(/\(advisor\)/.test(card(S, 'Beast Handling Club')), 'Rank 1 (as a student\'s Club field): shown');
let M = T(initState(), '09:00', [{ op: 'replace', path: '/Player/Profile/Club', value: 'Card Club' }]);
ok(/\(advisor\)/.test(card(M, 'Card Club')) && !/\(advisor\)/.test(card(M, 'Beast Handling Club')), 'a member of the Card Club knows its advisor, not other clubs\'');
U.view.gtypes = new Set(Object.keys(U.EDGE)); U.view.ggroups = new Set(['club']);
ok(!U.graphModel(initState()).links.some(l => l.type === 'group' && l.target === 'Vallie'), 'the People graph uses the same rule');

const save = JSON.parse(rd('tests/fixtures/saves/save_1.87.0.json'));
const L = T(save, save.World.Time, []);
ok(L.$eng.ver === JSON.parse(rd('src/card/card.json')).character_version && Object.keys(save.Bonds).every(id => L.Bonds[id] && L.Bonds[id].Rank === save.Bonds[id].Rank),
  'the 1.87.0 save loads with every bond unchanged');
