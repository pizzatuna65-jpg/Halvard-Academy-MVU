// 1.41.0 (owner-approved planning/DRAFT_outside_maps.md, part 3, 2026-10-03): Sunreach Bay, the Academy Trip's city (FP7 area 3).
// One city with two faces (night 18:00-06:00, a night map); pins holding places; walks, horse carriages, water taxis and the tour
// boat; the teachers' curfew; bets settled by the engine; students of the other academies and of Halvard met where their
// personality takes them; the sea and the Leviathan; the index pattern (247 for Sunreach, 360 forest, 370 Avalon, 465 airship) with
// keyword place entries; <now>, 502 and the map tab.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { fromAbs, AR, areaPlace, srWindow, SR };')();
// 1.46.0 (audit 3.1): the area helpers are one module (AR, areaPlace)
E.srPlace = (l, p) => E.areaPlace(E.AR.sunreach, l, p); E.srRoutes = f => E.AR.sunreach.routes(f); E.srMin = (a, b) => E.AR.sunreach.min(a, b);
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const T = (d, time) => E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
const at = (S, d, time, loc, extra = []) => applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T(d, time)[k] })), { op: 'replace', path: '/World/Location', value: loc }, ...extra]);
const FRI = 10 * 28 + 7 + 4, SAT = FRI + 1, SUN = SAT + 1, MON = SUN + 1, WED = SUN + 3, THU = SUN + 4;
const SB = 'Sunreach Bay — ';
const D = JSON.parse(read('data/sunreach.json'));
const coin = n => [{ op: 'replace', path: '/Player/Wallet/Coin', value: n }];
const ride = r => [{ op: 'replace', path: '/Sunreach/Ride', value: r }];
const bet = (g, n) => [{ op: 'replace', path: '/Sunreach/Bet', value: { Game: g, Stake: n } }];

console.log('Data, names and routes');
ok(D.pins.length === 10 && D.places.length === 21 && T(SAT, '08:00').Day === 'Sat' && T(THU, '08:00').Day === 'Thu' && T(SAT, '08:00').Month === 11, 'ten pins, 21 places; the test days are the Trip');
ok(E.srRoutes('skydock').casino.w === 40 && E.srRoutes('skydock').sea.w === 70 && E.srMin('the_hanabira', 'coral_beach') === 10, 'walks: Skydock to Casino Row 40, to the Open Sea 70 (by the Sea Dock); inside a pin 10');
ok(E.srPlace('The Golden Tide', '') === 'golden_tide' && E.srPlace('the casino', '') === '' && E.srPlace('the casino', 'coral_beach') === 'golden_tide' && E.srPlace('Sunreach Bay', '') === 'skydock', 'names always, short aliases only in Sunreach; "Sunreach Bay" alone is the Skydock');
ok(E.srPlace('Cliffside Terraces', '') === 'the_terraces' && E.srPlace('Coral Strand', '') === 'coral_beach' && E.srPlace('Casino Row', '') === 'golden_tide', 'a part\'s name means its own place, else its first');
ok(!E.srWindow(T(SAT, '19:00')) && E.srWindow(T(SAT, '20:30')) && E.srWindow(T(WED, '23:00')) && !E.srWindow(T(THU, '08:30')), 'the city map from the landing (Sat 20:00) to the boarding (Thu 08:00)');

console.log('The day before, the flight, the landing');
let S = at(initState(), FRI, '18:00', 'Main Library');
ok(S.$ui.sunreach.coin === 'the Academy Trip to Sunreach Bay' && !S.$ui.sunreach.on, 'Friday: the coin reminder');
S = at(at(S, SAT, '06:50', 'Main Courtyard', coin(400)), SAT, '07:10', 'Main Courtyard');
ok(S.World.Location === 'Airship — Common Room', 'Saturday 07:00: aboard');
S = at(S, SAT, '20:10', 'Airship — Promenade Deck');
ok(S.World.Location === SB + 'Skydock' && S.$ui.sunreach.on && S.$ui.sunreach.night && !S.$ui.airship.on, `landing: ${S.World.Location}, night`);
ok(/Sunreach Bay \(warm south\)/.test(S.World._Weather) && /^Away from campus \(Sunreach Bay/.test(S.World._Curfew), `Sunreach weather and hours: ${S.World._Weather}`);
const late = at(at(S, SAT, '20:40', 'Sunreach Bay — The Hanabira — lobby'), SAT, '22:30', 'Sunreach Bay — Coral Beach');
ok(/^Hotel curfew \(22:00-07:00\): the teachers' curfew at The Hanabira/.test(late.World._Curfew), 'after 22:00: the teachers\' curfew (a reminder only)');
let H = at(at(S, SAT, '20:40', 'Sunreach Bay — The Hanabira'), SUN, '08:00', 'Sunreach Bay — The Hanabira — breakfast hall', [{ op: 'replace', path: '/Player/Vitals/Resting', value: 'sleep' }]);
ok(H.World.Location === SB + 'The Hanabira — breakfast hall' && !H.$ui.sunreach.night && H.$ui.sunreach.today.some(t => t[0] === '09:00' && /briefing/.test(t[1])), 'Sunday morning: day, and the 09:00 briefing is on today\'s list');

console.log('Walks, carriages, water taxis, the tour boat');
let W = at(H, SUN, '10:00', 'Sunreach Bay — The Hanabira', coin(400));
const W1 = at(W, SUN, '10:20', 'Sunreach Bay — Sunreach Crossing');
ok(W1._Log.some(l => /Walked The Hanabira → Sunreach Crossing: 10 min/.test(l)), 'on foot: Coral Strand to the Crossing, 10 min');
const W2 = at(W1, SUN, '10:40', 'Sunreach Bay — Plaza Dourada', ride('carriage'));
ok(W2._Log.some(l => /Horse carriage Sunreach Crossing → Plaza Dourada: 8 min, -6 coin/.test(l)) && W2.Sunreach.Ride === '', 'a horse carriage: half the time, 6 coin, the flag cleared');
const W3 = at(W, SUN, '10:30', 'Sunreach Bay — The Lagoon', ride('boat'));
ok(W3._Log.some(l => /Water taxi The Hanabira → The Lagoon via Sunpier, Casino Row: 23 min, -8 coin/.test(l)), 'a water taxi between two shore parts: half of 45 min, 8 coin');
const W4 = at(W1, SUN, '10:50', 'Sunreach Bay — Old Fort', ride('boat'));
ok(W4._Log.some(l => /Horse carriage Sunreach Crossing → Old Fort/.test(l)), 'a boat asked for the hilltop: a carriage instead');
const fm = at(W, SUN, '10:20', 'Sunreach Bay — Fish Market');
const sea = at(fm, SUN, '11:30', 'Sunreach Bay — Open Sea');
ok(sea.World.Location === SB + 'Open Sea' && sea._Log.some(l => /Tour boat Fish Market → Open Sea: 60 min, tour boat -15 coin/.test(l)), 'the tour boat: 60 min, 15 coin');
const poor = at(at(W, SUN, '10:20', 'Sunreach Bay — Fish Market', coin(4)), SUN, '11:30', 'Sunreach Bay — Open Sea');
ok(poor.World.Location === SB + 'Fish Market' && poor._Log.some(l => /no boat/.test(l)), 'no coin for the tour boat: kept at the Fish Market');

console.log('The Golden Tide');
const G0 = at(W2, SUN, '11:00', 'Sunreach Bay — The Golden Tide');
const c0 = G0.Player.Wallet.Coin, G1 = at(G0, SUN, '11:10', 'Sunreach Bay — The Golden Tide', bet('dice', 50));
const b1 = G1.$ui.sunreach.ev.find(e => e.k === 'bet');
ok(b1 && G1.Player.Wallet.Coin === c0 + b1.net && (b1.net === 50 || b1.net === -50) && G1.Sunreach.Bet.Game === '', `a bet the engine settles: dice 50, ${b1 && b1.win ? 'won' : 'lost'}`);
ok(JSON.stringify(at(G0, SUN, '11:10', 'Sunreach Bay — The Golden Tide', bet('dice', 50)).$ui.sunreach.ev) === JSON.stringify(G1.$ui.sunreach.ev), 'a swipe sees the same throw');
let wins = 0, n = 0, G = G0;
for (let k = 0; k < 40; k++) { G = at(G, SUN, `11:${String(11 + k).padStart(2, '0')}`, 'Sunreach Bay — The Golden Tide', [...coin(500), ...bet('cards', 10)]); const e = G.$ui.sunreach.ev.find(x => x.k === 'bet'); if (e) { n++; wins += e.win; } }
ok(n === 40 && wins > 8 && wins < 32, `forty card bets: ${wins} won (about half)`);
ok(at(G0, SUN, '11:10', 'Sunreach Bay — The Golden Tide', bet('dice', 500))._Log.some(l => /1 to 200 coin a bet/.test(l)), 'the house limit is 200 a bet');
ok(at(W, SUN, '10:05', 'Sunreach Bay — The Hanabira', bet('dice', 10))._Log.some(l => /only at The Golden Tide/.test(l)), 'a bet elsewhere is cleared');

console.log('Who is met (personality places), the sea and the Leviathan');
const met = [], places = ['coral_beach', 'sunreach_crossing', 'plaza_dourada', 'tidehouse_aquarium', 'the_terraces', 'old_fort', 'fish_market', 'sunpier', 'velvet_lanes', 'glowtide_grotto'];
let Q = at(H, SUN, '09:30', 'Sunreach Bay — The Hanabira');
for (let d = SUN, k = 0; d <= WED; d++) for (let h = 10; h <= 21; h++, k++) {
  const id = places[k % places.length];
  Q = at(Q, d, `${String(h).padStart(2, '0')}:05`, SB + D.places.find(p => p.id === id).name);
  Q.$ui.sunreach.ev.filter(e => e.k === 'rival' || e.k === 'student').forEach(e => met.push([e.k, e.id, Q.$ui.sunreach.at, Q.$ui.sunreach.night ? 1 : 0]));
}
const R = met.filter(m => m[0] === 'rival'), Hs = met.filter(m => m[0] === 'student');
ok(R.length >= 5 && Hs.length >= 5, `four days in the city: ${R.length} students of other academies, ${Hs.length} of Halvard`);
ok(met.every(([k, id, p, nt]) => (D.meet[k === 'rival' ? 'rivals' : 'halvard'][id][nt] || []).includes(p)), 'everyone met is where their personality puts them (day or night list)');
ok(!Hs.some(m => ['Tsubaki', 'Linus', 'Aurelian'].includes(m[1])), 'Year 1: nobody who has not come to Halvard yet');
ok(new Set(met.map(m => m[1])).size >= 6, 'many different faces, not one person again and again');
let O = at(at(H, SUN, '09:30', 'Sunreach Bay — Fish Market'), SUN, '10:40', 'Sunreach Bay — Open Sea', coin(500)), sights = 0, lev = 0;
for (let d = SUN; d <= WED; d++) for (let h = 11; h <= 17; h++) { O = at(O, d, `${h}:30`, SB + 'Open Sea'); sights += O.$ui.sunreach.ev.filter(e => e.k === 'sea').length; lev += O.$ui.sunreach.ev.filter(e => e.k === 'leviathan').length; }
ok(sights >= 8 && lev <= 1, `the open sea: ${sights} sights in 28 hours, the Leviathan ${lev} time(s) (once in a Trip at most)`);
const Z = at(at(H, SUN, '09:30', 'Sunreach Bay — Coral Beach'), SUN, '13:05', 'Sunreach Bay — Coral Beach');
ok(JSON.stringify(Z.$ui.sunreach.ev) === JSON.stringify(at(at(H, SUN, '09:30', 'Sunreach Bay — Coral Beach'), SUN, '13:05', 'Sunreach Bay — Coral Beach').$ui.sunreach.ev), 'the same hours roll the same (a swipe sees the same city)');

console.log('Going home');
const home = at(at(H, WED, '21:30', 'Sunreach Bay — The Hanabira'), THU, '08:10', 'Airship — Common Room');
ok(home.World.Location === 'Airship — Common Room' && !home.$ui.sunreach.on && home.$ui.airship.on, 'Thursday 08:00: boarded, Sunreach off');

console.log('Lore: indexes and keyword places');
const _ = require('lodash'), ejs = require('ejs'), gv = St => k => _.get({ stat_data: St }, k);
const idx = JSON.parse(read('src/worldbook/index.json')), byUid = Object.fromEntries(idx.map(e => [e.uid, e]));
const lore = (uid, St) => ejs.render(read(`src/worldbook/content/${uid}.txt`), { getvar: gv(St) });
const sr = idx.filter(e => /^(\[mvu_plot\] )?Sunreach Bay - /.test(e.comment));
ok(sr.length === 21 && sr.every(e => !e.constant && e.uid >= 431 && e.uid <= 451), 'Sunreach: 21 keyword place entries (431-451)');
const night = at(H, SUN, '21:00', 'Sunreach Bay — Velvet Lanes'), day = at(H, SUN, '11:00', 'Sunreach Bay — Coral Beach');
const vl = sr.find(e => /Velvet Lanes/.test(e.comment)).uid;
ok(/Feel at night:/.test(lore(vl, night)) && !/At night:/.test(lore(vl, day)) && /^\[Velvet Lanes\]/.test(lore(vl, day).trim()), 'a place entry in the campus format; its night lines only at night');
ok(sr.every(e => !/out of bounds|curfew|students may|forbidden/i.test(read(`src/worldbook/content/${e.uid}.txt`))), 'no rules for {{user}} in the place entries');
ok(byUid[247].constant && /SUNREACH BAY INDEX/.test(lore(247, day)) && /The Hanabira/.test(lore(247, S)) && lore(247, initState()).trim() === '', '247: the Trip and the city index while there; nothing outside Month 11');
ok(/^\[Academy Trip\]/.test(lore(247, at(initState(), FRI, '12:00', 'Main Library')).trim()) && !/SUNREACH BAY INDEX/.test(lore(247, at(initState(), FRI, '12:00', 'Main Library'))), 'the week before: the Trip, not yet the index');
ok(byUid[360].constant && /GRAND VAST FOREST INDEX/.test(read('src/worldbook/content/360.txt')) && [361, 362, 363, 364, 365, 366, 367, 368, 369].every(u => !byUid[u].constant), 'the forest: an index (360) and keyword places');
const av = idx.filter(e => /^(\[mvu_plot\] )?Avalon - /.test(e.comment));
ok(byUid[370].constant && /AVALON INDEX/.test(read('src/worldbook/content/370.txt')) && av.length === 20 && av.every(e => !e.constant), 'Avalon: an index (370), 18 place entries, the Rookery and the Royal Mages, all keyword');
ok(/\(the grey old quarter\)/.test(read('src/worldbook/content/370.txt')) && /^\[Crown Square\]/.test(read(`src/worldbook/content/${av.find(e => /Crown Square/.test(e.comment)).uid}.txt`)), 'the Avalon index has a line per place; a place entry in the campus format');
ok(byUid[465].constant && /AIRSHIP INDEX/.test(read('src/worldbook/content/465.txt')) && [378, 379, 380, 381].every(u => !byUid[u].constant), 'the airship: a mini index (465) and keyword places');

console.log('<now>, update rules and UI');
const now = St => ejs.render(read('src/worldbook/custom/content/505.txt'), { getvar: gv(St) });
const nD = now(day), nN = now(night), nG = now(G1);
ok(/Sunreach Bay \(the Academy Trip, day\): \{\{user\}\} is at Coral Beach \(Coral Strand\)/.test(nD) && /horse carriage for 6 coin/.test(nD) && !/Likely around/.test(nD), '<now>: where, the rides; no campus regulars');
ok(/night: the whole city lit by rune-light/.test(nN) && /out of bounds for Halvard students\. A reminder only/.test(nN) && !/out of bounds/.test(nD), '<now>: night, and the reminder only on the night side');
ok(/The bet \(engine\): 50 coin on dice/.test(nG) && /Never decide a bet yourself/.test(nG), '<now>: the bet result and the rule at the tables');
ok(/Tomorrow: the Academy Trip to Sunreach Bay, abroad/.test(now(at(initState(), FRI, '18:00', 'Main Library'))), '<now>: the day before');
const r502 = St => ejs.render(read('src/worldbook/custom/content/502.txt'), { getvar: gv(St) });
ok(/Sunreach Bay \(1\.41\.0\)/.test(r502(day)) && !/Sunreach Bay \(1\.41\.0\)/.test(r502(initState())), '502: the Sunreach Location format around the Trip only');
const ui = read('src/scripts/ui.js');
ok(/renderSunreach/.test(ui) && /sunreach_night\.webp/.test(ui) && /sunreach_day\.webp/.test(ui) && /data-rgo/.test(ui), 'the UI: the Sunreach tab with its day and night maps');
ok(/4620b2ce/.test(JSON.parse(read('data/assets_manifest.json')).base_url), 'assets pinned to the commit with both Sunreach maps');
