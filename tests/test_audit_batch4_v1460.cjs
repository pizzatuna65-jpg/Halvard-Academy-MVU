// 1.46.0 (audit/AUDIT_2026-10-03_3_batch_perbaikan.md, Batch 4): the outside areas as one module. One graph search shared by the
// engine and the Map panel (2.1), one Area record per data file with one parser, formatter, move, theft and hourly loop (3.1), the
// climate as data (3.7), $ui.area / $eng.area with the old keys migrated, one Map renderer and one <now> block.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { AR, areaPlace, areaLoc, areaWx, fromAbs, wxDay };')();
const eng = rd('src/scripts/engine.template.js'), ui = rd('src/scripts/ui.js'), now = rd('src/worldbook/custom/505.template.ejs');
const T = (d, time) => E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
const at = (S, d, time, loc, extra = []) => applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T(d, time)[k] })), { op: 'replace', path: '/World/Location', value: loc }, ...extra]);
const coin = n => ({ op: 'replace', path: '/Player/Wallet/Coin', value: n });

console.log('2.1 one shortest-way search');
ok(!/function (expRoutes|avRoutes|srRoutes)\b/.test(eng) && (eng.match(/let u = null; for \(const k in d\)/g) || []).length === 0, 'the engine has no Dijkstra of its own (shared.js areaRoutes)');
ok(!/function (forestWalks|capWalks|srWalks)\b/.test(rd('src/ui/parts/20_map.js')) && /areaRoutes\(/.test(rd('src/ui/parts/20_map.js')), 'the Map panel walks with the same search');
ok((ui.match(/function areaRoutes\(/g) || []).length === 1, 'ui.js holds the search once (from shared.js)');

console.log('3.1 one record per area');
for (const k of ['forest', 'avalon', 'airship', 'sunreach']) ok(E.AR[k] && E.AR[k].PL && typeof E.AR[k].routes === 'function', `AR.${k}: places, graph, names`);
ok(E.areaPlace(E.AR.avalon, 'the market', 'crown_square') === 'lantern_market' && E.areaPlace(E.AR.avalon, 'the market', '') === '', 'one parser: aliases only inside the area');
ok(E.areaLoc(E.AR.sunreach, 'Sunreach Bay — The Golden Tide — at the wheel', 'golden_tide') === 'Sunreach Bay — The Golden Tide — at the wheel', 'one formatter keeps the story\'s detail');
ok(!/function (avPlace|srPlace|airPlace|avLoc|srLoc|airLoc|forestLoc)\b/.test(eng), 'no area keeps its own parser or formatter');
const AV = JSON.parse(rd('data/avalon.json')), SR = JSON.parse(rd('data/sunreach.json'));
ok(AV.theft && SR.theft && AV.theft.ev === 'pick' && SR.theft.ev === 'hustle' && !('pick_seen' in AV.rates) && !('hustle_seen' in SR.rates), 'the pickpocket and the hustler are one mechanic (data theft blocks)');
ok(/function areaTheft/.test(eng) && !/roll\('pseen'\)|roll\('hseen'\)/.test(eng), 'areaTheft is the only theft code');

console.log('3.7 climate as data');
const EX = JSON.parse(rd('data/expedition.json'));
ok(EX.climate && SR.climate && !EX.weather && !SR.weather && !/function (forestWx|srWx)\b/.test(eng), 'forest and Sunreach climates are data; one areaWx');
const w = E.areaWx(E.AR.sunreach, 12345, 300, 1);
ok(w && typeof w.temp === 'number' && w.temp >= 27 && w.temp <= 33 && !w.snow, `Sunreach's own warm sky (${w.sky}, ${w.temp} °C)`);

console.log('state: $ui.area and $eng.area, migrated');
const SAVE = JSON.parse(rd('tests/fixtures/saves/save_1.41.0.json'));
const old = { ...SAVE, $ui: { ...SAVE.$ui, capital: { on: false, seen: ['skyport', 'crown_square'], castle: false, coin: '' } }, $eng: { ...SAVE.$eng, cap: { d: 1, owe: 0, met: [], tsu: 'M4 W2 Tue 12:30' } } };
const M = applyPatch(old, []);
ok(M.$ui.area.avalon && M.$ui.area.avalon.seen.includes('crown_square') && !('capital' in M.$ui), 'the old $ui.capital moved to $ui.area.avalon');
ok(M.$eng.area.avalon && M.$eng.area.avalon.tsu === 'M4 W2 Tue 12:30' && !('cap' in M.$eng), 'the old $eng.cap moved to $eng.area.avalon (Tsubaki\'s Avalon memory kept)');

console.log('play: Avalon and Sunreach through the module');
const CROWN = 3 * 28 + 7 + 1;
let S = at(initState(), CROWN, '07:00', 'Main Courtyard');
S = at(S, CROWN, '09:40', 'Avalon — Skyport', [coin(200)]);
S = at(S, CROWN, '11:40', 'Avalon — Old Town', [{ op: 'replace', path: '/Avalon/Ride', value: true }]);
const walk = S.$ui.area.avalon.ev.find(e => e.k === 'walk');
ok(S.$ui.area.avalon.on && walk && walk.ride === 'carriage' && S.Player.Wallet.Coin === 190 && S.Player.Wallet.Transactions.some(l => /-10 coin: hire carriage in Avalon/.test(l)), 'a hire carriage: the fare through the ledger, ride "carriage"');
const SRD = 10 * 28 + 7 + 2;   // Month 11 Week 2 Wednesday (1.97.1: the Trip is W2 Mon-Sat)
let R = at(at(initState(), SRD, '09:00', 'Sunreach Bay — The Hanabira', [coin(5)]), SRD, '10:00', 'Sunreach Bay — Open Sea');
ok(R.World.Location === 'Sunreach Bay — The Hanabira' && R._Log.some(l => /The tour boat costs 15 coin and \{\{user\}\} has 5: no boat/.test(l)), 'no coin for the tour boat: the move is refused');

console.log('one Map renderer, one <now> block');
ok(/function renderArea\(/.test(ui) && !/function render(Forest|Capital|Sunreach|Airship)\(/.test(ui), 'the Map panel: one renderArea for every area tab');
const nowFn = rd('src/scripts/engine.js').split('function nowOf(')[1].split('\nfunction stepNow')[0];   // 1.48.0: the area block is the engine's ($ui.now.area)
ok((nowFn.match(/\bif \(AREA\) \{/g) || []).length === 1 && /NOW\.area/.test(now) && !/FOREST|CAPITAL|SUNREACH\b(?! Bay)/.test(now.replace(/\/\*@@[A-Z]+@@\*\//g, '')), '<now>: one block for the outside areas');
