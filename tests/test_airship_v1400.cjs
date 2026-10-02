// 1.40.0 (owner-approved planning/DRAFT_airship.md, 2026-10-02): the academy's airship. During a flight World.Location is
// "Airship — <place>" (Promenade Deck, Common Room, Cabin Deck, Cargo Hold); boarding, holding {{user}} aboard, landing at the
// destination, the Kingdom flights only for the team, the bathing stalls, the seeded sky / stage / hold, the lore gate, <now>, the tab.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { fromAbs, airPlace, airFlight, AIR };')();
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const T = (d, time) => E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
const at = (S, d, time, loc, extra = []) => applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T(d, time)[k] })), { op: 'replace', path: '/World/Location', value: loc }, ...extra]);
const EXP = 28 + 14 + 2, CROWN = 3 * 28 + 7 + 1, KTUE = 8 * 28 + 21 + 1, TRIP = 10 * 28 + 7 + 5, TRIPH = 10 * 28 + 14 + 3;
const AIRL = 'Airship — ';
const A = JSON.parse(read('data/airship.json'));
const team = [{ op: 'replace', path: '/Competition/Tier', value: 'Kingdom' }, { op: 'replace', path: '/Competition/Status', value: 'selected' }];

console.log('Data and names');
ok(A.flights.length === 8 && A.places.map(p => p.id).join() === 'promenade_deck,common_room,cabin_deck,cargo_hold', 'eight flights, four places aboard');
ok(E.airPlace('Airship — the bar', false) === 'common_room' && E.airPlace('The bar', false) === '' && E.airPlace('the bar', true) === 'common_room', 'short aliases only aboard ("the bar" on campus stays on campus)');
ok(E.airPlace('Airship', false) === 'common_room' && E.airPlace('Cargo Hold — behind the crates', false) === 'cargo_hold', '"Airship" alone is the Common Room; place names always count');
ok(T(EXP, '08:00').Day === 'Wed' && T(CROWN, '08:00').Day === 'Tue' && T(TRIP, '08:00').Day === 'Sat' && T(TRIPH, '08:00').Day === 'Thu' && T(KTUE, '08:00').Day === 'Tue', 'test days: Expedition Wed, Crowning Tue, Trip Sat and Thu, Kingdom Tue');

console.log('Crowning Day: boarding, aboard, landing');
let S = at(initState(), CROWN, '07:00', 'Main Courtyard');
ok(!S.$ui.airship.on && S.$ui.airship.soon && S.$ui.airship.soon.from === '07:30', 'the speeches: the flight leaves within 90 min (soon)');
S = at(S, CROWN, '07:40', 'Main Courtyard');
ok(S.World.Location === AIRL + 'Common Room' && S.$ui.airship.on && S._Log.some(l => /is aboard; World\.Location was set to Airship — Common Room/.test(l)), `boarding: ${S.World.Location}`);
ok(/^Away from campus \(aboard the airship\)/.test(S.World._Curfew) && S.$ui.airship.left === 110 && S.$ui.airship.bar === true, 'aboard: no dorm curfew; lands in 110 min; a holiday, so the bar serves students');
let P = at(S, CROWN, '07:50', 'Airship — Promenade Deck — at the bow');
ok(P.World.Location === AIRL + 'Promenade Deck — at the bow' && /Halvard's grounds falling away/.test(P.$ui.airship.view), `the promenade: the view for the first third (${P.$ui.airship.view.slice(0, 40)}…)`);
const P2 = at(P, CROWN, '09:10', 'Airship — Promenade Deck');
ok(/Avalon ahead/.test(P2.$ui.airship.view), 'approaching: Avalon ahead');
const H = at(S, CROWN, '08:00', 'the hold');
ok(H.World.Location === AIRL + 'Cargo Hold' && /banners and spare uniforms/.test(H.$ui.airship.cargo) && !H.$ui.airship.view, 'an alias aboard: the Cargo Hold, with this route\'s cargo');
const early = at(H, CROWN, '08:30', 'Avalon — Skyport');
ok(early.World.Location === AIRL + 'Cargo Hold' && early._Log.some(l => /Nobody leaves the airship until it lands \(09:30\)/.test(l)) && !(early.$ui.capital || {}).on, 'nobody leaves before landing: kept aboard, not in Avalon');
const land = at(at(S, CROWN, '09:20', 'Airship — Common Room'), CROWN, '09:40', 'Airship — Common Room');
ok(land.World.Location === 'Avalon — Skyport' && land.$ui.capital.on && !land.$ui.airship.on && land._Log.some(l => /has landed \(09:30\)/.test(l)), 'landing: the Location still said the airship, so it becomes the Skyport');
const land2 = at(at(S, CROWN, '09:20', 'Airship — Common Room'), CROWN, '09:45', 'Avalon — Crown Square');
ok(land2.World.Location === 'Avalon — Crown Square' && land2.$ui.capital.on, 'the story already wrote Avalon: that stands');

console.log('Crowning Day: home');
let R = at(land, CROWN, '15:20', 'Avalon — Skyport');
R = at(R, CROWN, '16:05', 'Avalon — Skyport');
ok(R.World.Location === 'Avalon — Skyport' && !R.$ui.airship.on && R.$ui.capital.on, 'a flight home leaves a place in Avalon to the city until the story boards');
R = at(R, CROWN, '16:10', 'Airship — Cabin Deck — the bathing stalls', [{ op: 'insert', path: '/Player/Conditions/Soaked', value: { Effect: 'x' } }]);
ok(R.World.Location === AIRL + 'Cabin Deck — the bathing stalls' && R.$ui.airship.on && !R.$ui.airship.board, 'boarded by the story: the Cabin Deck');
const R2 = at(R, CROWN, '16:25', 'Airship — Cabin Deck — the bathing stalls');
ok(!(R2.Player.Conditions || {}).Soaked && R2._Log.some(l => /Soaked ended: a hot bath/.test(l)), 'ten minutes in the bathing stalls: Soaked ends');
const home = at(R2, CROWN, '18:10', 'Airship — Promenade Deck');
ok(home.World.Location === 'Grassy Field and Hills' && !home.$ui.airship.on && !/^Away/.test(home.World._Curfew || ''), `home: ${home.World.Location}`);

console.log('Who flies');
const kNo = at(initState(), KTUE, '08:30', 'Main Courtyard');
ok(!/Airship/.test(kNo.World.Location) && !kNo.$ui.airship.on, 'the Kingdom flight: not on the team, not aboard');
const kYes = at(initState(), KTUE, '08:30', 'Main Courtyard', team);
ok(kYes.World.Location === AIRL + 'Common Room' && kYes.$ui.airship.bar === false && /Kingdom Competition/.test(kYes.$ui.airship.event), 'the team boards; a weekday, so no alcohol');
const ex = at(at(initState(), EXP, '06:50', 'Fire Dormitory'), EXP, '07:20', 'Fire Dormitory');
ok(ex.World.Location === AIRL + 'Common Room' && ex.$ui.airship.lands.startsWith('Base Camp'), 'the Expedition flight boards everyone');
const exL = at(at(ex, EXP, '11:30', 'Airship — Promenade Deck'), EXP, '12:10', 'Airship — Promenade Deck');
ok(exL.World.Location === 'Grand Vast Forest — Base Camp' && exL.$ui.forest.on, 'landing at the forest: Base Camp, and the forest map takes over');

console.log('The sky, the stage, the hold');
let Q = at(at(initState(), TRIP, '06:55', 'Main Courtyard'), TRIP, '07:05', 'Airship — Common Room');
const kinds = new Set(), seen = [];
for (let h = 8; h <= 19; h++) { Q = at(Q, TRIP, `${String(h).padStart(2, '0')}:10`, h < 14 ? 'Airship — Common Room' : 'Airship — Cargo Hold'); Q.$ui.airship.ev.forEach(e => { kinds.add(e.k); seen.push(e); }); }
ok([...kinds].every(k => ['sky', 'stage', 'hold'].includes(k)) && kinds.has('stage') && kinds.has('hold'), `a day's flight to Sunreach: ${seen.map(e => e.k).join(', ')}`);
ok(seen.filter(e => e.k === 'sky').every(e => A.sky.sunreach.includes(e.t)) && seen.filter(e => e.k === 'hold').every(e => A.hold.includes(e.t)), 'the sky from the Sunreach pool; the hold from its own');
const Q1 = at(at(initState(), TRIP, '07:05', 'Airship — Common Room'), TRIP, '11:10', 'Airship — Common Room');
ok(JSON.stringify(Q1.$ui.airship.ev) === JSON.stringify(at(at(initState(), TRIP, '07:05', 'Airship — Common Room'), TRIP, '11:10', 'Airship — Common Room').$ui.airship.ev), 'the same hours roll the same (a swipe sees the same flight)');
const Qs = at(at(initState(), TRIPH, '08:05', 'Airship — Common Room'), TRIPH, '19:00', 'Airship — Cabin Deck', [{ op: 'replace', path: '/Player/Vitals/Resting', value: 'sleep' }]);
ok(!Qs.$ui.airship.ev.length, 'asleep: nothing is rolled');
const tl = at(at(initState(), TRIPH, '08:05', 'Airship — Promenade Deck'), TRIPH, '19:30', 'Airship — Promenade Deck');
ok(/Halvard's towers in the dark/.test(tl.$ui.airship.view) && tl.$ui.airship.lands.startsWith('Halvard'), 'the way home from Sunreach: the coast, then Halvard in the dark');

console.log('Lore, <now>, update rules and UI');
const _ = require('lodash'), ejs = require('ejs'), gv = St => k => _.get({ stat_data: St }, k);
const idx = JSON.parse(read('src/worldbook/index.json'));
const ae = idx.filter(e => /^(\[mvu_plot\] )?Airship - /.test(e.comment));
ok(ae.length === 4 && ae.map(e => e.uid).join() === '378,379,380,381' && ae.every(e => e.constant && /stat_data\.\$ui\.airship/.test(read(`src/worldbook/content/${e.uid}.txt`))), 'four airship entries (378-381), constant behind a gate on $ui.airship');
const lore = (uid, St) => ejs.render(read(`src/worldbook/content/${uid}.txt`), { getvar: gv(St) });
const free = at(land, CROWN, '12:00', 'Avalon — Crown Square');
ok(/small raised stage/.test(lore(379, S)) && /\[Airship: Cargo Hold\]/.test(lore(381, H)) && /\[Airship: Promenade Deck\]/.test(lore(378, at(initState(), CROWN, '07:00', 'Main Courtyard'))), 'the entries print aboard, and in the 90 minutes before a flight');
ok(lore(379, free).trim() === '' && lore(381, home).trim() === '' && !/beast pen/i.test(A.places.map(p => p.desc).join(' ')), 'nothing outside a flight; no beast pens');
const now = St => ejs.render(read('src/worldbook/custom/content/505.txt'), { getvar: gv(St) });
const nH = now(H), nP = now(P), nK = now(kYes);
ok(/Aboard the airship \(Independence Crowning Day\): \{\{user\}\} is in the Cargo Hold\. It lands at the Skyport, Avalon at 09:30 \(in 1h 30m\)/.test(nH) && /In the hold this flight: the academy's banners/.test(nH), '<now>: where, landing, the hold\'s cargo');
ok(/View from the promenade now:/.test(nP) && /today students may drink/.test(nP) && /no alcohol for students today/.test(nK) && !/Likely around/.test(nP), '<now>: the view, the bar\'s rule; no campus regulars aboard');
ok(/Airship: the flight for Independence Crowning Day leaves at 07:30/.test(now(at(initState(), CROWN, '07:00', 'Main Courtyard'))) && !/Aboard the airship|Airship:/.test(now(free)), '<now>: the flight soon; nothing in Avalon');
const r502 = St => ejs.render(read('src/worldbook/custom/content/502.txt'), { getvar: gv(St) });
ok(/Airship \(1\.40\.0\)/.test(r502(S)) && !/Airship \(1\.40\.0\)/.test(r502(home)), 'the update rules: the airship Location format only around a flight');
const ui = read('src/scripts/ui.js');
ok(/renderAirship/.test(ui) && /"Cargo Hold"/.test(ui) && /data-ago/.test(ui), 'the UI has the Airship tab and its four places');
