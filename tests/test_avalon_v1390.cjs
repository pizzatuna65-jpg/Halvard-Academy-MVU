// 1.39.0 (owner-approved planning/DRAFT_outside_maps.md, part 2, 2026-10-02): Avalon, the capital, on Crowning Day and for the
// Kingdom Competition team: city places in World.Location (pins hold places, like the campus map), walks and hire carriages, the
// White Line (the castle is the Kingdom winners' only), the Crowning Day muster, the city's seeded life once an hour, Tsubaki met
// before she comes to Halvard, the lore gate, <now> and the map tab.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { fromAbs, avPlace, avRoutes, avMin, AV };')();
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const T = (d, time) => E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
const at = (S, d, time, loc, extra = []) => applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T(d, time)[k] })), { op: 'replace', path: '/World/Location', value: loc }, ...extra]);
const CROWN = 3 * 28 + 7 + 1;                          // Month 4 Week 2 Tuesday
const KTUE = 8 * 28 + 21 + 1, KSAT = KTUE + 4;         // Month 9 Week 4: the Kingdom Competition, Tuesday to Sunday
const AVL = 'Avalon — ';
const A = JSON.parse(read('data/avalon.json'));
const coin = (S, n) => [{ op: 'replace', path: '/Player/Wallet/Coin', value: n }];

console.log('Data and routes');
ok(A.pins.length === 7 && A.places.length === 19 && A.pins.filter(p => p.locked).map(p => p.id).join() === 'castle', 'seven pins (the castle locked), nineteen places');
const R = E.avRoutes('gate');
ok(R.square.m === 25 && R.garden.m === 80 && R.oldtown.m === 90 && R.castle.m === 70, 'walks from the Great Gate match the approved table (Garden 80, Old Town 90)');
ok(E.avRoutes('oldtown').arena.m === 95 && E.avRoutes('lantern').garden.m === 100, 'the castle is never a way through (Old Town to the Arena 95, round the ring)');
ok(E.avMin('skyport', 'gilded_arcade') === 10 && E.avMin('old_town', 'skywheel_fair') === 10 && E.avMin('crown_square', 'grand_cathedral') === 5, 'inside a pin: a few minutes');
ok(E.avPlace('Avalon — Lantern Market', '') === 'lantern_market' && E.avPlace('Lantern Quarter', '') === 'lantern_market' && E.avPlace('Garden of Avalon — by the statue', '') === 'garden_of_avalon', 'names and pin names');
ok(E.avPlace('The Cathedral', '') === '' && E.avPlace('the cathedral', 'crown_square') === 'grand_cathedral' && E.avPlace('Avalon, the market', '') === 'lantern_market', 'short aliases only once in Avalon: the campus Cathedral stays the campus Cathedral');
ok(E.avPlace('Avalon', '') === 'skyport' && E.avPlace('Halvard — packing for the capital trip', '') === '', '"Avalon" alone is the Skyport on arrival; a sentence about the capital is not');

console.log('Crowning Day: arrival');
let S = at(initState(), CROWN, '07:00', 'Main Courtyard');
ok(!(S.$ui.capital || {}).on && !/Avalon/.test(S.World.Location), 'morning speeches at Halvard: not in Avalon');
S = at(S, CROWN, '09:40', 'Avalon — Skyport', coin(S, 200));
ok(S.World.Location === AVL + 'Skyport' && S.$ui.capital.on && S.$ui.capital.pin === 'gate', `arrival: ${S.World.Location}`);
ok(!S.$ui.wx || (!S.$ui.wx.away && /Avalon/.test(S.World._Weather)), `the kingdom's weather of the day: ${S.World._Weather}`);
ok(S.$ui.capital.walks.length === 5 && !S.$ui.capital.walks.some(w => w[0] === 'castle') && S.$ui.capital.walks[0][0] === 'square', 'walks to the five open pins; the castle is not among them');
ok(S.$ui.capital.muster && S.$ui.capital.muster.at === '15:30' && !S.$ui.capital.muster.free, 'the muster is 15:30; free time has not begun');

console.log('Walking, crowds and carriages');
let W = at(at(S, CROWN, '10:05', 'Avalon — Skyport'), CROWN, '10:50', 'Avalon — Crown Square — the Halvard stands');
ok(W.World.Location === AVL + 'Crown Square — the Halvard stands' && W._Log.some(l => /Walked Skyport → Crown Square: 38 min.*holiday crowds/.test(l)), 'the holiday crowd: Crown Avenue takes half as long again (25 → 38 min)');
let F = at(S, CROWN, '11:40', 'Avalon — Crown Square');
F = at(F, CROWN, '13:10', 'Avalon — Crown Square');
F = at(F, CROWN, '14:30', 'Avalon — Garden of Avalon');
const walkLog = F._Log.find(l => /Walked Crown Square → Garden of Avalon/.test(l));
ok(walkLog && /75 min/.test(walkLog) && /stamina/.test(walkLog), `on foot: ${walkLog}`);
let C = at(at(S, CROWN, '11:40', 'Avalon — Crown Square'), CROWN, '13:10', 'Avalon — Crown Square');
const c0 = C.Player.Wallet.Coin, s0 = C.Player.Vitals.Stamina;
C = at(C, CROWN, '13:50', 'Avalon — Garden of Avalon — on the flower terraces', [{ op: 'replace', path: '/Avalon/Ride', value: true }]);
ok(C.Player.Wallet.Coin <= c0 - 10 && C.Avalon.Ride === false && C._Log.some(l => /Hire carriage Crown Square → Garden of Avalon: 38 min, -10 coin/.test(l)), 'a hire carriage: half the time, 10 coin, the flag cleared');
ok(C.World.Location === AVL + 'Garden of Avalon — on the flower terraces' && C.$ui.capital.near.some(n => n[0] === 'Grand Theatre'), 'the garden pin: the theatre is minutes away');
const poor = at(at(S, CROWN, '11:40', 'Avalon — Crown Square', coin(S, 3)), CROWN, '13:00', 'Avalon — Royal Arena', [{ op: 'replace', path: '/Avalon/Ride', value: true }]);
ok(poor._Log.some(l => /has 3: they walked/.test(l)) && poor.Player.Wallet.Coin <= 3, 'not enough coin for a carriage: they walk');

console.log('The White Line');
let L = at(S, CROWN, '12:00', 'Avalon — Crown Square');
L = at(L, CROWN, '12:20', 'Avalon — Eldrasil Castle');
ok(L.World.Location === AVL + 'Crown Square' && L.$ui.capital.ev.some(e => e.k === 'white') && L._Log.some(l => /Royal Guard turned \{\{user\}\} back/.test(l)), 'the castle is past the White Line: held at Crown Square');
const L2 = at(L, CROWN, '12:40', 'Avalon — Noble Ring');
ok(L2.$eng.cap.wl === 2 && L2._Log.some(l => /reported it to the staff/.test(l)), 'a second try is reported (Academy reputation, defied_staff)');

console.log('The city, once an hour');
let H = at(S, CROWN, '11:35', 'Avalon — Lantern Market', coin(S, 500));
const evs = [];
for (let h = 12; h <= 15; h++) { H = at(H, CROWN, `${h}:05`, h % 2 ? 'Avalon — Lantern Market' : 'Avalon — Spellwright Row'); evs.push(...H.$ui.capital.ev); }
ok(evs.every(e => ['walk', 'pick', 'procession', 'street', 'rival', 'tsubaki'].includes(e.k)), `events: ${evs.map(e => e.k).join(', ') || 'none this seed'}`);
const H2 = at(at(S, CROWN, '11:35', 'Avalon — Lantern Market', coin(S, 500)), CROWN, '12:05', 'Avalon — Spellwright Row');
ok(JSON.stringify(H2.$ui.capital.ev) === JSON.stringify(at(at(S, CROWN, '11:35', 'Avalon — Lantern Market', coin(S, 500)), CROWN, '12:05', 'Avalon — Spellwright Row').$ui.capital.ev), 'the same hour rolls the same (a swipe sees the same street)');
const P0 = at(S, CROWN, '10:05', 'Avalon — Lantern Market');
ok(!P0.$ui.capital.ev.some(e => e.k !== 'walk'), 'nothing is rolled during the parade and the speech');
// enough hours in many places to see each kind once (seeded, so this is a fixed walk through the city)
const kinds = new Set(), RIV = new Set();
let Q = at(S, CROWN, '11:35', 'Avalon — Old Town', coin(S, 2000));
const route = ['Old Town', 'Skywheel Fair', 'The Great Spire', 'Garden of Avalon', 'Grand Theatre', 'Royal Arena', 'Crown Square', 'Lantern Market', 'Spellwright Row', 'Gilded Arcade', 'Skyport'];
for (let i = 0; i < 40; i++) {
  const d = CROWN + 28 * 12 * Math.floor(i / 4), hh = 12 + (i % 4);
  Q = at(Q, d, `${hh}:10`, AVL + route[i % route.length], coin(Q, 2000));
  for (const e of Q.$ui.capital.ev || []) { kinds.add(e.k); if (e.k === 'rival') RIV.add(e.id); }
}
ok(kinds.has('rival') && kinds.has('street'), `over many years' Crowning Days: ${[...kinds].join(', ')}`);
ok([...RIV].every(id => A.places && id in E.AV.rivals), `rival students met: ${[...RIV].join(', ')}`);

console.log('The muster');
let M = at(S, CROWN, '15:00', 'Avalon — Garden of Avalon');
ok(M.$ui.capital.muster.warn && M.$ui.capital.muster.back === 80, 'half an hour before the muster, 80 min from the Skyport: a warning');
M = at(M, CROWN, '15:40', 'Avalon — Garden of Avalon');
ok(M.$ui.capital.muster.missed && M.Journal.some(l => /missed the afternoon muster/.test(l)), 'missed the muster: journaled, a detention\'s worth of Academy reputation');
const home = at(M, CROWN, '18:30', 'Main Courtyard');
ok(!home.$ui.capital.on && !/Avalon/.test(home.World.Location) && home.$ui.capital.seen.includes('garden_of_avalon'), 'home: Avalon is off; the places seen are kept');
const later = at(home, CROWN + 1, '10:00', 'The Cathedral');
ok(later.World.Location === 'The Cathedral' && !later.$ui.capital.on, 'the next day the campus Cathedral is the campus Cathedral');

console.log('Tsubaki, before Halvard');
const TS = at(at(S, CROWN, '12:00', 'Avalon — Old Town'), CROWN, '12:30', 'Avalon — Old Town', [{ op: 'add', path: '/Scene/Present/Tsubaki', value: 'lost, asking the way' }]);
ok(TS.$eng.cap.tsu && !TS.Bonds.Tsubaki && !TS._Log.some(l => /Tsubaki is not at Halvard yet/.test(l)), 'met in Avalon in Year 1: remembered, no bond yet, no warning');

console.log('Kingdom Competition');
const team = [{ op: 'replace', path: '/Competition/Tier', value: 'Kingdom' }, { op: 'replace', path: '/Competition/Status', value: 'selected' }];
let K = at(initState(), KTUE, '12:00', 'Avalon — Whitestone Hotel', team);
ok(K.$ui.capital.on && K.$ui.capital.kd && !K.$ui.capital.crown, 'Halvard\'s team at the Whitestone Hotel');
const notTeam = at(initState(), KTUE, '12:00', 'Avalon — Whitestone Hotel');
ok(!notTeam.$ui.capital.on, 'not on the team: Avalon is not on (the story keeps it at Halvard)');
K = at(K, KSAT, '20:00', 'Avalon — Whitestone Hotel', [{ op: 'replace', path: '/Competition/Status', value: 'champion' }]);
K = at(K, KSAT, '20:30', 'Avalon — Eldrasil Castle — the reception');
ok(K.World.Location === AVL + 'Eldrasil Castle — the reception' && K.$ui.capital.pass && K.$ui.capital.castle, 'the royal reception: the winners pass the White Line; the castle pin shows from now on');

console.log('The day before, and the Kingdom hotel');
const eve = at(initState(), CROWN - 1, '18:00', 'Main Courtyard');
ok(eve.$ui.capital.coin === 'Independence Crowning Day', 'the day before Crowning Day: the Banking House reminder');
ok(/^Hotel curfew/.test(at(K, KSAT, '22:30', 'Avalon — Whitestone Hotel').World._Curfew), 'the team keeps the Whitestone Hotel\'s curfew, not the dorm curfew');

console.log('Lore, <now>, update rules and UI data');
const _ = require('lodash'), ejs = require('ejs'), gv = St => k => _.get({ stat_data: St }, k);
const idx = JSON.parse(read('src/worldbook/index.json'));
const av = idx.filter(e => /^(\[mvu_plot\] )?Avalon( - |$)/.test(e.comment));
ok(av.length === 21 && av.every(e => e.uid === 370 ? e.constant && /stat_data\.\$ui\.capital/.test(read('src/worldbook/content/370.txt')) : !e.constant), '1.41.0: the index (370) constant behind a gate on $ui.capital; 18 places, the Rookery and the Royal Mages as keyword entries');
const lore = (uid, St) => ejs.render(read(`src/worldbook/content/${uid}.txt`), { getvar: gv(St) });
ok(/Walks between the parts/.test(lore(370, W)) && /Crown Square: Great Gate 25/.test(lore(370, W)) && lore(370, home).trim() === '', 'the overview (with the walk table) prints only in Avalon');
ok(/Tsubaki Hoshikage this year/.test(lore(377, W)) && /narrator_only/.test(lore(376, W)), 'Year 1: Tsubaki described in the Royal Mages entry; the Rookery\'s way in is narrator-only');
ok(/its capital is Avalon/.test(read('src/worldbook/content/0.txt')) && /Royal Mages at its head/.test(read('src/worldbook/content/24.txt')) && /Whitestone Hotel/.test(read('src/worldbook/content/19.txt')), 'World Index, Crowning Day and the Kingdom Competition name Avalon');
const now = St => ejs.render(read('src/worldbook/custom/content/505.txt'), { getvar: gv(St) });
const nW = now(W), nM = now(M), nH = now(home), nE = now(eve);
ok(/Avalon \(Independence Crowning Day\): \{\{user\}\} is at Crown Square\./.test(nW) && /Walks from here \(minutes on foot; a hire carriage/.test(nW) && /Muster in \d+ min/.test(nW), '<now>: where, the walks, the muster');
ok(/missed the muster/.test(nM) && !/Likely around/.test(nW) && !/Avalon \(/.test(nH), '<now>: the missed muster; no campus regulars in Avalon; nothing about Avalon at home');
ok(/Tomorrow: Independence Crowning Day in Avalon/.test(nE), '<now>: the day before, points into coin');
ok(/Avalon \(Kingdom Competition, with Halvard's team\)/.test(now(K)) && /the King receives them/.test(now(K)), '<now>: the Kingdom team, the winners\' reception');
const r502 = St => ejs.render(read('src/worldbook/custom/content/502.txt'), { getvar: gv(St) });
ok(/Avalon \(1\.39\.0\)/.test(r502(W)) && !/Avalon \(1\.39\.0\)/.test(r502(later)), 'the update rules: the Avalon location format only around a visit');
const ui = read('src/scripts/ui.js');
ok(/avalon\.webp/.test(ui) && /renderCapital/.test(ui) && /"Garden of Avalon"/.test(ui), 'the UI has the Avalon map, its pins and places');

module.exports = { at, CROWN, S, W, M, home, K };
