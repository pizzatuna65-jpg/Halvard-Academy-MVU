// 1.97.3 (owner-approved planning/DRAFT_world_competition.md §5, 2026-10-22): Hanakaze, the capital of Yozakura, host of the World
// Competition in campaign Year 1. The national four fly out on a Yozakuran liner (airship who 'world', Year 1 only), land at the
// Skyport on W3 Mon 13:00 and board home on W4 Mon 12:00; pins from the owner's map; walks; the team carriage to the match grounds on
// their days only; the Alpha's Residence closed; the Warrens hidden until visited, with the Alpha's Watch raids; the Challenge Crossing;
// other nations' fours; a snowy winter; the inn's hours; the index (468) and keyword places; <now>, 502 and the map tab.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { fromAbs, AR, areaPlace, hkWindow, HK };')();
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const D = JSON.parse(read('data/hanakaze.json')), A = E.AR.hanakaze, place = (l, p) => E.areaPlace(A, l, p);
const T = (d, time) => E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
const at = (S, d, time, loc, extra = []) => applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T(d, time)[k] })), { op: 'replace', path: '/World/Location', value: loc }, ...extra]);
const PRE = 10 * 28 + 13, OUT = PRE + 1, TUE = OUT + 1, THU = OUT + 3, SUN = OUT + 6, HOME = OUT + 7;   // W2 Sun, then W3 Mon to W4 Mon
const HZ = 'Hanakaze — ';
const four = [{ op: 'replace', path: '/Competition/Tier', value: 'World' }, { op: 'replace', path: '/Competition/Status', value: 'selected' }];
const coin = n => [{ op: 'replace', path: '/Player/Wallet/Coin', value: n }];
const P = id => HZ + D.places.find(p => p.id === id).name;
const ev = (S, k) => (S.$ui.area.hanakaze.ev || []).filter(e => e.k === k);

console.log('Data, names, routes, window');
ok(D.pins.length === 11 && D.places.length === 21 && D.places.filter(p => !p.kc).length === 19 && T(OUT, '08:00').Day === 'Mon' && T(OUT, '08:00').Week === 3 && T(HOME, '08:00').Week === 4, 'eleven pins, 19 city places and two match grounds; the test days are the competition week');
ok(D.pins.every(p => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100) && D.map === 'map/yozakura.webp' && /4d229ce5/.test(JSON.parse(read('data/assets_manifest.json')).base_url), 'pins are percent positions on the owner\'s map, pinned in the assets commit');
ok(A.routes('skyport').ring.w === 20 && A.routes('ring').bamboo.w === 40 && A.routes('ring').shiroyama.w === 25 && A.routes('skyport').bamboo.w === 60, 'walks: Skyport to the Ring 20; the grounds 40 and 25 from the inn\'s pin');
ok(place('The Eternal Sakura', '') === 'eternal_sakura' && place('the inn', '') === '' && place('the inn', 'eternal_sakura') === 'thousand_lantern_inn' && place('Hanakaze', '') === 'hanakaze_skyport', 'names always, short aliases only in Hanakaze; "Hanakaze" alone is the Skyport');
ok(place('Victors\' Avenue', '') === 'challenge_crossing' && place('Sakura Park', '') === 'eternal_sakura' && place('Yozakura — the tree', '') === 'eternal_sakura', 'a part\'s name means its first place; "Yozakura" lets the short aliases count');
const W1 = { ...T(OUT, '13:30') }, S4 = { Competition: { Tier: 'World' } };
ok(!E.hkWindow(T(OUT, '12:30'), S4) && E.hkWindow(W1, S4) && E.hkWindow(T(SUN, '23:00'), S4) && !E.hkWindow(T(HOME, '12:30'), S4), 'the city from the landing (W3 Mon 13:00) to the liner home (W4 Mon 12:00)');
ok(!E.hkWindow(W1, { Competition: { Tier: 'Kingdom' } }) && !E.hkWindow({ ...W1, Year: 2 }, S4), 'only for the national four, and only in Year 1 (Yozakura\'s turn to host)');

console.log('The day before, the liner, the landing');
let S = at(applyPatch(initState(), four), PRE, '18:00', 'Main Library');
ok(/World Competition in Hanakaze/.test(S.$ui.area.hanakaze.coin) && !S.$ui.area.hanakaze.on && at(initState(), PRE, '18:00', 'Main Library').$ui.area.hanakaze.coin === '', 'W2 Sunday: the coin reminder, for the four only');
S = at(at(S, OUT, '06:50', 'Main Courtyard', coin(500)), OUT, '07:10', 'Main Courtyard');
ok(S.World.Location === 'Airship — Common Room' && /Yozakuran liner/.test(S.$ui.area.airship.event), 'Monday 07:00: aboard the Yozakuran liner');
const stay = at(at(initState(), OUT, '06:50', 'Main Courtyard'), OUT, '07:10', 'Main Courtyard');
ok(!/Airship/.test(stay.World.Location) && !stay.$ui.area.airship.on, 'anyone not in the four stays at Halvard');
const y2 = at(at(applyPatch(initState(), [...four, { op: 'replace', path: '/World/Year', value: 2 }]), OUT + 336, '06:50', 'Main Courtyard'), OUT + 336, '07:10', 'Main Courtyard');
ok(!/Airship/.test(y2.World.Location) && !y2.$ui.area.airship.on, 'Year 2: no liner to Hanakaze (another host)');
S = at(S, OUT, '13:10', 'Airship — Promenade Deck');
ok(S.World.Location === HZ + 'Hanakaze Skyport' && S.$ui.area.hanakaze.on && !S.$ui.area.airship.on, `landing: ${S.World.Location}`);
ok(/Hanakaze \(snowy winter\)/.test(S.World._Weather) && /^Away from campus \(Hanakaze/.test(S.World._Curfew), `Hanakaze weather and hours: ${S.World._Weather}`);
let wx = 0, snow = 0;
for (let d = OUT; d < HOME; d++) for (const t of ['08:00', '14:00', '20:00']) { const Q = at(S, d, t, HZ + 'The Eternal Sakura'); wx++; if (/\): [a-z ]*snow,/.test(Q.World._Weather)) snow++; }
ok(snow >= 3 && snow < wx, `a snowy winter week: snow in ${snow} of ${wx} blocks`);

console.log('Walks, the Residence, the match grounds, the Warrens');
const S1 = at(S, OUT, '13:40', P('thousand_lantern_inn'));
ok(S1._Log.some(l => /Walked Hanakaze Skyport → The Thousand Lantern Inn: \d+ min/.test(l)), 'on foot from the Skyport to the inn');
ok(/^Inn curfew \(22:00-07:00\)/.test(at(S1, OUT, '22:30', P('thousand_lantern_inn')).World._Curfew) && /^Back at the Thousand Lantern Inn by 22:00/.test(at(S1, OUT, '21:20', P('thousand_lantern_inn')).World._Curfew), 'the inn\'s hours: back by 22:00, the curfew after');
const H0 = at(S1, OUT, '18:30', P('hall_of_victors')), H1 = at(H0, OUT, '18:40', HZ + 'The Alpha\'s Residence'), H2 = at(H1, OUT, '18:50', HZ + 'The Alpha\'s Residence');
ok(H1.World.Location === P('hall_of_victors') && ev(H1, 'barred').length === 1 && H1._Log.some(l => /closed to every guest/.test(l)), 'the Residence: turned back, kept at the Hall');
ok(H2._Log.some(l => /again and told Gavlan Haverton/.test(l)), 'a second try the same day is told to the coach');
const walksOf = St => St.$ui.now.area.find(l => /^Walks from here/.test(l)) || '';
ok(!/Residence/.test(walksOf(H0)) && !/Bamboo Sea|Shiroyama/.test(walksOf(H0)) && /Castle Hill|Sakura Park/.test(walksOf(H0)), 'the Residence and a closed ground are never offered');
const G0 = at(S1, OUT, '15:00', HZ + 'The Bamboo Sea');
ok(G0.World.Location === P('thousand_lantern_inn') && G0._Log.some(l => /a match ground, open only on its match days/.test(l)), 'Monday: the Bamboo Sea is closed; kept at the inn');
const T0 = at(at(S1, TUE, '07:30', P('thousand_lantern_inn')), TUE, '08:50', HZ + 'The Bamboo Sea');
ok(T0.World.Location === HZ + 'The Bamboo Sea' && T0._Log.some(l => /Team carriage The Thousand Lantern Inn → The Bamboo Sea: 40 min/.test(l)) && T0.$ui.area.hanakaze.kc.join() === '1', 'Tuesday: the team carriage to the Bamboo Sea, 40 min, no fare');
const T1 = at(at(S1, THU, '07:30', P('thousand_lantern_inn')), THU, '08:40', HZ + 'Old Castle Shiroyama');
ok(T1.World.Location === HZ + 'Old Castle Shiroyama' && T1.$ui.area.hanakaze.kc.join() === '2', 'Thursday: Old Castle Shiroyama is open');
const A0 = at(S1, OUT, '14:30', P('hundred_alleys'));
ok(!/The Warrens/.test(walksOf(A0)), 'the Warrens are not offered before a visit');
const A1 = at(A0, OUT, '14:50', HZ + 'The Warrens'), A2 = at(A1, OUT, '15:10', P('hundred_alleys'));
ok(A1.World.Location === HZ + 'The Warrens' && A2.$ui.area.hanakaze.seen.includes('the_warrens') && /The Warrens 10/.test(walksOf(A2)), 'once visited, the Warrens are known');

console.log('The city: challenges, other nations, raids, the same hours');
let Q = at(S1, OUT, '14:00', P('challenge_crossing')), ch = 0, n = 0; const chs = [];
for (let d = TUE; d <= SUN; d++) for (let h = 10; h <= 20; h += 2) { Q = at(Q, d, `${String(h).padStart(2, '0')}:05`, P('challenge_crossing')); n++; ch += ev(Q, 'challenge').length; chs.push(...ev(Q, 'challenge')); }
ok(ch >= 4 && ch < n, `the Challenge Crossing: ${ch} challenges in ${n} visits`);
ok(chs.length && chs.every(c => D.challengers.includes(c.who) && D.challenges.includes(c.t)), 'a challenge names a challenger and a contest from the data');
let I = at(S1, OUT, '14:00', P('thousand_lantern_inn')); const met = [];
for (let h = 15; h <= 20; h++) { I = at(I, OUT, `${h}:05`, P('thousand_lantern_inn')); met.push(...ev(I, 'team').map(e => e.n)); }
for (let h = 8; h <= 20; h++) { I = at(I, TUE, `${String(h).padStart(2, '0')}:05`, P('thousand_lantern_inn')); met.push(...ev(I, 'team').map(e => e.n)); }
ok(met.length >= 2 && met.every(x => D.teams.includes(x)) && met.slice(0, 5).length === new Set(met.slice(0, 5)).size, `other nations' fours met: ${met.join(', ')}`);
let R = A1, raids = 0, caught = 0;
for (let d = TUE; d <= SUN; d++) for (let h = 9; h <= 20; h++) { R = at(R, d, `${String(h).padStart(2, '0')}:30`, HZ + 'The Warrens'); const e = ev(R, 'raid'); raids += e.length; caught += e.filter(x => x.caught).length; }
ok(raids >= 1 && raids <= 12, `the Alpha's Watch: ${raids} raid(s) in 72 hours in the Warrens, ${caught} caught`);
const Z1 = at(at(S1, TUE, '12:00', P('hundred_alleys')), TUE, '15:05', P('hundred_alleys'));
ok(JSON.stringify(Z1.$ui.area.hanakaze.ev) === JSON.stringify(at(at(S1, TUE, '12:00', P('hundred_alleys')), TUE, '15:05', P('hundred_alleys')).$ui.area.hanakaze.ev), 'the same hours roll the same (a swipe sees the same city)');

console.log('Going home');
const home = at(at(S1, HOME, '10:30', P('thousand_lantern_inn')), HOME, '12:10', 'Airship — Common Room');
ok(home.World.Location === 'Airship — Common Room' && !home.$ui.area.hanakaze.on && home.$ui.area.airship.on, 'W4 Monday 12:00: boarded the liner home, Hanakaze off');
const notFour = at(initState(), TUE, '12:00', HZ + 'The Eternal Sakura');
ok(!notFour.$ui.area.hanakaze.on, 'without the national four, a Hanakaze Location is not the area');

console.log('Lore, <now>, update rules and UI');
const _ = require('lodash'), ejs = require('ejs'), gv = St => k => _.get({ stat_data: St }, k);
const idx = JSON.parse(read('src/worldbook/index.json')), byUid = Object.fromEntries(idx.map(e => [e.uid, e]));
const lore = (uid, St) => ejs.render(read(`src/worldbook/content/${uid}.txt`), { getvar: gv(St) });
const hz = idx.filter(e => /^(\[mvu_plot\] )?Hanakaze - /.test(e.comment));
ok(hz.length === 22 && byUid[468].constant && hz.filter(e => e.uid !== 468).every(e => !e.constant && e.uid >= 469 && e.uid <= 489), 'Hanakaze: an index (468) and 21 keyword entries (469-489)');
ok(/HANAKAZE INDEX/.test(lore(468, S1)) && lore(468, initState()).trim() === '' && /The team carriage from the Thousand Lantern Inn: The Bamboo Sea 40 min, Old Castle Shiroyama 25 min/.test(lore(468, S1)), '468: the index only while in the city, with the walks and the team carriage');
ok(/^\[Hanakaze — The Warrens\]/.test(lore(487, S1).trim()) && /<narrator_only>The way in: behind the oldest noodle stall/.test(read('src/worldbook/content/487.txt')), '487: the Warrens, the way in for the narrator only');
ok(/^\[The Eternal Sakura\]/.test(read(`src/worldbook/content/${hz.find(e => /Eternal Sakura/.test(e.comment)).uid}.txt`)), 'a place entry in the campus format');
const c19 = read('src/worldbook/content/19.txt');
ok(/This year Yozakura hosts it, in its capital, Hanakaze/.test(lore(19, initState())) && !/Caelmar hosts/.test(lore(19, initState())) && /This year Caelmar hosts it/.test(lore(19, applyPatch(initState(), [{ op: 'replace', path: '/World/Year', value: 2 }]))) && /moves each year between the four invited nations/.test(c19), '19: the host by campaign year');
ok(/Capital: Hanakaze/.test(read('src/worldbook/content/335.txt')), '335: Yozakura\'s capital');
const nowA = H0.$ui.now.area.join('\n');
ok(/^Hanakaze \(the World Competition, with Eldrasil's national four\): \{\{user\}\} is at The Hall of Victors \(Castle Hill\)/.test(nowA) && /Today at 19:00: the opening banquet/.test(nowA) && /back at the Thousand Lantern Inn by 22:00/.test(nowA), '<now>: where, the inn\'s hours, the banquet tonight');
ok(/The Alpha's Residence \(engine\): its guards bow/.test(H1.$ui.now.area.join('\n')) && /Open today by team carriage from the inn: the Bamboo Sea \(Phase 1\)/.test(at(S1, TUE, '07:30', P('thousand_lantern_inn')).$ui.now.area.join('\n')), '<now>: the turn-back, and the ground open today');
ok(/Tomorrow: the World Competition in Hanakaze/.test(at(applyPatch(initState(), four), PRE, '18:00', 'Main Library').$ui.now.area.join('\n')), '<now>: the day before');
const r502 = St => ejs.render(read('src/worldbook/custom/content/502.txt'), { getvar: gv(St) });
ok(/Hanakaze \(1\.97\.3\)/.test(r502(S1)) && !/Hanakaze \(1\.97\.3\)/.test(r502(initState())), '502: the Hanakaze Location format in the city only');
const ui = read('src/scripts/ui.js');
ok(/yozakura\.webp/.test(ui) && /'hanakaze'/.test(ui) && /by team carriage from/.test(ui), 'the UI: the Hanakaze tab on the owner\'s map, the team carriage line');
