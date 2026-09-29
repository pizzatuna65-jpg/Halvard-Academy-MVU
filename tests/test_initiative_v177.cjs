// FP1: seeded NPC initiative uses approved Stages, respects scene/status/Tension, and never rerolls within a day.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const E = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data.character_book.entries.find(x => x.id === 505).content;
const render = S => ejs.render(E, { getvar: k => _.get({ stat_data: S }, k) });
const stage = JSON.parse(rd('data/npc_canon.json')).voice.Etnie.stages['3-5'];
const move = (S, day, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Day', value: day }, { op: 'replace', path: '/World/Time', value: '09:00' }, ...extra]);
function seedFor(base, day, id) {
  for (let seed = 1; seed <= 100; seed++) {
    const S = Schema.parse(_.cloneDeep(base)); S.$eng.seed = seed; S.World.Day = day; S.World.Time = '09:00';
    runEngine(S, base, '');
    if (S.$ui.initiative && S.$ui.initiative.id === id) return seed;
  }
  throw new Error(`no seed found for ${id} on ${day}`);
}

console.log('NPC initiative 1.7.7');
let S = initState({ etnie: true });
ok(S.Bonds.Etnie.Rank === 3 && !S.$ui.initiative, 'Etnie is eligible from her first meeting, with no initiative before the next day');
S.$eng.seed = seedFor(S, 'Tue', 'Etnie');
S = move(S, 'Tue');
const picked = S.$eng.initiative.id;
ok(picked === 'Etnie' && S.$ui.initiative.stage === stage, 'a seeded day selects Etnie and uses her approved Rank 3-5 Stage');
ok(/NPC initiative today: Etnie/.test(render(S)) && render(S).includes(stage), '<now> shows the contact and its canon Stage');
ok(!S.Scene.Present.Etnie, 'the engine does not move Etnie into Scene.Present');
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '10:00' }]);
ok(S.$eng.initiative.id === picked && S.$ui.initiative.id === picked, 'another update that day keeps the same selection');
S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: 'arrived' } } }]);
ok(S.$eng.initiative.done && !S.$ui.initiative && !/NPC initiative today/.test(render(S)), 'an actual arrival consumes the opportunity');
S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: {} }]);
ok(!S.$ui.initiative, 'leaving the scene does not reactivate a spent opportunity');
let Z = initState({ etnie: true }); Z.$eng.seed = seedFor(Z, 'Tue', 'Etnie'); Z = move(Z, 'Tue');
Z = applyPatch(Z, [{ op: 'replace', path: '/Bonds/Etnie/Rank', value: 2 }]);
Z = applyPatch(Z, [{ op: 'replace', path: '/Bonds/Etnie/Rank', value: 3 }]);
ok(Z.$eng.initiative.done && !Z.$ui.initiative, 'a bond falling below Rank 3 spends the opportunity for that day');

let T = initState({ etnie: true }); T.$eng.seed = seedFor(T, 'Tue', 'Etnie'); T.Bonds.Etnie.Tension = 80;
T = move(T, 'Tue');
ok(T.$ui.initiative && T.$ui.initiative.strained && /The approach is not friendly at this Tension/.test(render(T)), 'Tension 70+ never frames the approach as friendly');
T = applyPatch(T, [{ op: 'replace', path: '/$ui/off', value: ['npc_initiative'] }]);
ok(!T.$ui.initiative && !/NPC initiative today/.test(render(T)), 'Features OFF removes the prompt immediately');
T = applyPatch(T, [{ op: 'replace', path: '/$ui/off', value: [] }]);
ok(!T.$ui.initiative, 'turning the feature back on waits for the next day');

let U = initState({ etnie: true }); U.$eng.seed = seedFor(U, 'Tue', 'Etnie');
U = move(U, 'Tue', [{ op: 'replace', path: '/Campus_State/NPC_status/Etnie', value: 'Away visiting family' }]);
ok(!U.$ui.initiative, 'an NPC status prevents selection');
let V = initState({ etnie: true }); V.$eng.seed = seedFor(V, 'Tue', 'Etnie');
V = move(V, 'Tue', [{ op: 'replace', path: '/Trip/Active', value: true }]);
ok(!V.$ui.initiative, 'no campus contact is scheduled during a trip');

let W = initState({ etnie: true }); W.$eng.seed = seedFor(W, 'Tue', 'Etnie');
W.$eng.initiative.count = 2; W.$eng.initiative.week = 0;
W = move(W, 'Tue');
ok(!W.$ui.initiative && W.$eng.initiative.count === 2, 'at most two selections per campaign week');
let X = initState({ etnie: true }); X.$eng.seed = seedFor(X, 'Tue', 'Etnie');
X.$eng.initiative.last.Etnie = 0;
X = move(X, 'Tue');
ok(!X.$ui.initiative, 'the same NPC has a seven-day cooldown');

let R = initState({ etnie: true }); R.Bonds.Etnie.Rank = 6; R.$eng.seed = seedFor(R, 'Tue', 'Etnie');
R = move(R, 'Tue');
ok(R.$ui.initiative && R.$ui.initiative.stage === JSON.parse(rd('data/npc_canon.json')).voice.Etnie.stages['6-8'], 'a higher bond uses its current Stage band');
let G = initState({ etnie: true }); G.$eng.seed = seedFor(G, 'Tue', 'Etnie');
G = move(G, 'Tue', [{ op: 'replace', path: '/Campus_State/Graduated', value: ['Etnie'] }]);
ok(!G.$ui.initiative, 'a graduate cannot be selected');
let L = initState(); L.Bonds.Linus = Schema.parse({ Bonds: { Linus: { Rank: 3 } } }).Bonds.Linus;
L = move(L, 'Tue');
ok(!L.$ui.initiative, 'an incoming Year 2 student cannot be selected in Year 1');
let Q = initState({ etnie: true }); Q.$eng.seed = 42;
for (const id of ['Irene', 'Castor']) Q.Bonds[id] = Schema.parse({ Bonds: { [id]: { Rank: 3 } } }).Bonds[id];
const selected = [], days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
for (let d = 1; d < 28; d++) {
  Q = applyPatch(Q, [{ op: 'replace', path: '/World/Week', value: Math.floor(d / 7) + 1 },
    { op: 'replace', path: '/World/Day', value: days[d % 7] }, { op: 'replace', path: '/World/Time', value: '09:00' }]);
  if (Q.$ui.initiative) selected.push([d, Q.$ui.initiative.id]);
}
ok(selected.length > 0 && [0, 1, 2, 3].every(w => selected.filter(([d]) => Math.floor(d / 7) === w).length <= 2), 'over four weeks, at most two contacts are offered per week');
ok(selected.every(([d, id], i) => !selected.slice(0, i).some(([p, who]) => who === id && d - p < 7)), 'over four weeks, no NPC is picked twice within seven days');

const feat = JSON.parse(rd('data/features.json')).features.find(x => x.id === 'npc_initiative');
ok(feat && feat.control === 'toggle' && !feat.paths, 'NPC initiative is a Features toggle with no story state to park');
global.window = { parent: { document: {} } };
const UI = new Function(rd('src/scripts/ui.js') + '\nreturn { featureOps, renderProfile, view };')();
UI.view.tab = 'settings';
ok(/NPC initiative/.test(UI.renderProfile(S)) && UI.featureOps(S, 'npc_initiative', 'off').ops[0].value.includes('npc_initiative'), 'the Settings row can switch the feature off');
const old = JSON.parse(rd('tests/fixtures/saves/save_1.7.6.json'));
const migrated = Schema.parse(_.cloneDeep(old)); runEngine(migrated, old, '');
ok(migrated.$eng.ver === JSON.parse(rd('src/card/card.json')).character_version && Object.keys(old.Bonds).every(id => migrated.Bonds[id].Rank === old.Bonds[id].Rank), 'the 1.7.6 save loads with every bond rank unchanged');
