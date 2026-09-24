// v1.1.0 (docs/SPEC_v1_1_0_world_systems.md §6): weather, forecast, inventory, feature settings, conditions, sleep, bonds, Dove cover,
// class-aware presence, hooks, gossip, weather-aware happenings. Uses the same schema + engine path as MVU (tests/harness.cjs).
const fs = require('fs'), path = require('path'), ejs = require('ejs'), YAML = require('yaml');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8')
  + '\nreturn { wxDay, wxForecast, rawHappening, fromAbs, blockOf, fluOn, HAPPENINGS, hash32, OUTDOOR };')();
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const entry = uid => card.character_book.entries.find(e => e.id === uid).content;
const render = (uid, S) => ejs.render(entry(uid), { getvar: k => _.get({ stat_data: S }, k) });
const tok = s => Math.round(s.length / 3.6);
const omit$ = o => (Array.isArray(o) ? o.map(omit$) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, omit$(v)])) : o);
const DAY = 1440, SEEDS = [12345, 987654, 55555];
const seasonOf = d => ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'][Math.floor(((d % 336) + 336) % 336 / 28)];

// a fresh game with a fixed seed, moved (forward) to minute `m` of day `d` at `loc`
const SEED = 424242;
const S0 = applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: SEED }]);
function at(S, d, hhmm, loc, extra = []) {
  const [h, mi] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + mi);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : []), ...extra]);
}
const later = (S, mins, loc, extra = []) => { const a = S.$eng.abs + mins, T = E.fromAbs(a); return at(S, Math.floor(a / DAY), T.Time, loc, extra); };
// first day >= from (on campus, not a break) whose block b satisfies pred
const QUIET = d => { const m = Math.floor(((d % 336) + 336) % 336 / 28) + 1; return m !== 12 && m !== 7 && !(m === 5 && Math.floor((d % 28) / 7) === 3); };
const find = (b, pred, from = 3) => { for (let d = from; d < from + 4000; d++) if (QUIET(d) && pred(E.wxDay(SEED, d).blocks[b], E.wxDay(SEED, d))) return d; throw new Error('no such day'); };

console.log('Weather: distribution, continuity, rare events, determinism');
{
  const share = {}, sums = {};
  let ro = [0, 0], ra = [0, 0], cc = [0, 0], clearAll = [0, 0], snowHot = 0, rareM = Array(12).fill(0);
  for (const seed of SEEDS) for (let d = 0; d < 336 * 3; d++) {
    const D = E.wxDay(seed, d), s = D.season, m = Math.floor((d % 336) / 28);
    for (const b of D.blocks) { (share[seed + s] = share[seed + s] || {})[b.sky] = (share[seed + s][b.sky] || 0) + 1; if (b.snow && b.temp > 3) snowHot++; if (b.rare) rareM[m]++; }
    const [mo, af] = D.blocks; ra[1]++; if (af.sky === 'Rain') ra[0]++;
    if (mo.sky === 'Overcast') { ro[1]++; if (af.sky === 'Rain') ro[0]++; }
    if (mo.sky === 'Clear') { cc[1]++; if (af.sky === 'Clear') cc[0]++; }
    clearAll[1]++; if (af.sky === 'Clear') clearAll[0]++;
  }
  for (const [k, v] of Object.entries(share)) { const n = Object.values(v).reduce((a, x) => a + x, 0); const s = k.replace(/^\d+/, ''); sums[s] = sums[s] || {}; for (const sky of Object.keys(v)) (sums[s][sky] = sums[s][sky] || []).push(100 * v[sky] / n); }
  let spread = 0;
  for (const s of Object.keys(sums)) for (const xs of Object.values(sums[s])) { const mean = xs.reduce((a, x) => a + x, 0) / xs.length; spread = Math.max(spread, ...xs.map(x => Math.abs(x - mean))); }
  ok(spread <= 5, `per-season sky frequencies agree across seeds within ±5 points (max ${spread.toFixed(1)})`);
  const summerClear = sums.Summer.Clear.reduce((a, x) => a + x, 0) / 3;
  ok(summerClear > 51 && summerClear < 61, `summer is about 56% clear (${summerClear.toFixed(0)}%)`);
  ok(ro[0] / ro[1] > ra[0] / ra[1] + 0.08, `P(rain afternoon | overcast morning) ${(ro[0] / ro[1]).toFixed(2)} > P(rain afternoon) ${(ra[0] / ra[1]).toFixed(2)}`);
  ok(cc[0] / cc[1] > clearAll[0] / clearAll[1] + 0.1, `P(clear | clear morning) ${(cc[0] / cc[1]).toFixed(2)} > base ${(clearAll[0] / clearAll[1]).toFixed(2)}`);
  const perMonth = rareM.map(x => x / SEEDS.length / 3), avg = perMonth.reduce((a, x) => a + x, 0) / 12;
  ok(avg >= 0.5 && avg <= 3, `rare weather ${avg.toFixed(2)} blocks a month on average`);
  const sp = (perMonth[2] + perMonth[3] + perMonth[4]) / 3, su = (perMonth[5] + perMonth[6] + perMonth[7]) / 3, wi = (perMonth[0] + perMonth[1] + perMonth[11]) / 3;
  ok(sp < su && sp < wi, `spring runs lowest (spring ${sp.toFixed(2)}, summer ${su.toFixed(2)}, winter ${wi.toFixed(2)})`);
  ok(snowHot === 0, 'snow never above 3 °C');
  ok(JSON.stringify(E.wxDay(7, 100)) === JSON.stringify(E.wxDay(7, 100)) && JSON.stringify(new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn wxDay;')()(7, 100)) === JSON.stringify(E.wxDay(7, 100)), 'same seed + day -> same weather (fresh engine instance too)');
  let mism = 0; for (let d = 1; d < 500; d++) { const a = E.wxDay(SEED, d - 1).blocks[2]; /* the night as shown yesterday */ const b = E.wxDay(SEED, d); if (!b) mism++; }
  ok(mism === 0, 'every day has weather');
  const A = at(S0, 40, '13:00', 'Canteen'), B = at(S0, 40, '13:00', 'Canteen');
  ok(A.World._Weather === B.World._Weather && /°C \((freezing|cold|cool|mild|warm|hot)\)$/.test(A.World._Weather) && A.World._Season, `swipe-safe: ${A.World._Weather}`);
  const off = applyPatch(A, [{ op: 'replace', path: '/$ui/wxfx', value: 'off' }]);
  ok(off.World._Weather === '' && off.World._Season === '' && off.$ui.wx === null, 'Off mode: nothing computed, _Weather empty');
  const tripD = 294;   // M11 W3 Mon: Academy Trip (away)
  const away = at(S0, tripD, '10:00', 'Sunreach Bay — beach');
  ok(/^Away/.test(away.World._Weather) && !away.$ui.wx.field, `away from campus: ${away.World._Weather}`);
}

console.log('Divination Society forecast');
{
  let hit = 0, n = 0;
  for (const seed of SEEDS) for (let d = 0; d < 336; d++) E.wxForecast(seed, d).forEach((f, i) => { n++; if (f.sky === E.wxDay(seed, d).blocks[i].sky) hit++; });
  ok(hit / n >= 0.7 && hit / n <= 0.8, `accuracy over a year ${(100 * hit / n).toFixed(1)}% (70-80%)`);
  const m = at(S0, 30, '08:00', 'Canteen'), e = at(S0, 30, '06:30', 'Canteen');
  ok(m.$ui.wx.fc.tomorrow && m.$ui.wx.fc.day === 31 && !e.$ui.wx.fc.tomorrow && e.$ui.wx.fc.day === 30, 'posted at 07:00 for the next day (before 07:00 the board still shows today)');
  const nowTxt = render(505, m);
  ok(/Divination Society forecast on the Notice Board for tomorrow: morning \w+ \(\w+\), afternoon/.test(nowTxt), 'the narrator reads the posted forecast in <now>');
  ok(E.wxForecast(SEED, 31).every(f => !/storm|hail|blizzard|heatwave/.test(f.text) || f.sky === 'Storm'), 'rare events are never forecast');
}

console.log('Inventory (Bag)');
{
  let S = applyPatch(S0, [{ op: 'insert', path: '/Inventory/Star Cookie', value: { Qty: 1, Kind: 'food', Plan: 'tonight' } }]);
  ok(S.$ui.unlocks.includes('inventory'), 'first item unlocks the Bag');
  S = applyPatch(S, [{ op: 'insert', path: '/Inventory/star cookie ', value: { Qty: 2, Kind: 'food', Note: 'from Etnie' } }]);
  ok(Object.keys(S.Inventory).length === 1 && S.Inventory['Star Cookie'].Qty === 3 && S.Inventory['Star Cookie'].Note === 'from Etnie' && S.Inventory['Star Cookie'].Plan === 'tonight', 'case / space duplicates merge (Qty adds, newer non-empty Note kept)');
  S = applyPatch(S, [{ op: 'delta', path: '/Inventory/Star Cookie/Qty', value: -1 }]); ok(S.Inventory['Star Cookie'].Qty === 2, 'delta -1 subtracts');
  S = applyPatch(S, [{ op: 'delta', path: '/Inventory/Star Cookie/Qty', value: -2 }]); ok(!S.Inventory['Star Cookie'], 'Qty 0 removes the item');
  const many = Object.fromEntries(Array.from({ length: 45 }, (_x, i) => [`Item ${i}`, { Qty: 1, Kind: i < 3 ? 'gear' : i < 20 ? 'other' : 'book' }]));
  S = applyPatch(S, [{ op: 'replace', path: '/Inventory', value: many }]);
  ok(Object.keys(S.Inventory).length === 40 && ['Item 0', 'Item 1', 'Item 2'].every(k => S.Inventory[k]) && !S.Inventory['Item 3'] && S.Inventory['Item 20'], 'cap 40: other/food go first, oldest first, never gear');
  let F = at(S0, 1, '12:00', 'Commissary', [{ op: 'insert', path: '/Inventory/Sunfizz', value: { Qty: 2, Kind: 'drink' } }]);
  F = applyPatch(F, [{ op: 'delta', path: '/Inventory/Sunfizz/Qty', value: -1 }]);
  ok(F.Inventory['Empty Sunfizz bottle'] && F.Inventory['Empty Sunfizz bottle'].Qty === 1 && F.Inventory.Sunfizz.Qty === 1, 'drinking a Sunfizz leaves an empty bottle');
  F = applyPatch(F, [{ op: 'remove', path: '/Inventory/Sunfizz' }]); ok(F.Inventory['Empty Sunfizz bottle'].Qty === 2, 'a removed Sunfizz counts too');
  const p0 = F.Player.Wallet.Points;
  let G = applyPatch(F, [{ op: 'replace', path: '/World/Location', value: 'Canteen' }, { op: 'delta', path: '/Inventory/Empty Sunfizz bottle/Qty', value: -1 }]);
  ok(G.Player.Wallet.Points === p0, 'dropping a bottle away from the shops pays nothing');
  G = applyPatch(F, [{ op: 'delta', path: '/Inventory/Empty Sunfizz bottle/Qty', value: -2 }]);
  ok(G.Player.Wallet.Points === p0 + 4 && !G.Inventory['Empty Sunfizz bottle'] && G.Player.Wallet.Transactions.slice(-1)[0] === '+4 returned Sunfizz bottles (2)' && G._Log.some(l => /Returned 2 Sunfizz bottles/.test(l)), 'returning 2 bottles at the Commissary pays +2 each, once');
  G = applyPatch(G, [{ op: 'replace', path: '/World/Time', value: '12:30' }]); ok(G.Player.Wallet.Points === p0 + 4, 'no second payment');
}

console.log('Conditions and gear (Full)');
{
  const rainD = find(1, b => b.sky === 'Rain' && !b.snow && b.rain !== 'heavy' && !b.wind && b.temp > 8);
  const walk = (S, d, mins, hhmm = '13:00') => later(at(S, d, hhmm, 'Lecture Halls'), mins, 'Sports Field');
  let S = later(walk(S0, rainD, 10), 25, 'Sports Field');
  ok(S.Player.Conditions.Soaked && S.$ui.unlocks.includes('conditions') && S.$ui.toasts.includes('Condition: Soaked'), `Soaked after 30 min in the rain (${S.World._Weather})`);
  const U = later(walk(applyPatch(S0, [{ op: 'insert', path: '/Inventory/Umbrella', value: { Qty: 1, Kind: 'gear' } }]), rainD, 10), 25, 'Sports Field');
  ok(!U.Player.Conditions.Soaked, 'an umbrella keeps you dry when there is no wind');
  const windD = find(1, b => b.sky === 'Rain' && !b.snow && !!b.wind && b.rain !== 'heavy' && b.temp > 8);
  const UW = later(walk(applyPatch(S0, [{ op: 'insert', path: '/Inventory/Umbrella', value: { Qty: 1, Kind: 'gear' } }]), windD, 10), 25, 'Sports Field');
  ok(UW.Player.Conditions.Soaked, `...but not in the wind (${UW.World._Weather})`);
  const WP = later(walk(applyPatch(S0, [{ op: 'insert', path: '/Inventory/Oilskin rain cloak', value: { Qty: 1, Kind: 'gear' } }]), windD, 10), 25, 'Sports Field');
  ok(!WP.Player.Conditions.Soaked, 'waterproof gear always keeps you dry');
  const off = later(walk(applyPatch(S0, [{ op: 'replace', path: '/$ui/off', value: ['inventory'] }, { op: 'insert', path: '/Inventory/Umbrella', value: { Qty: 1, Kind: 'gear' } }]), rainD, 10), 25, 'Sports Field');
  ok(off.Player.Conditions.Soaked, 'with the Bag off, gear counts as absent');
  let D = later(S, 10, 'Lecture Halls'); ok(D.Player.Conditions.Soaked, 'still wet just after going in');
  D = later(D, 60, 'Lecture Halls'); ok(!D.Player.Conditions.Soaked && D.$ui.toasts.includes('Soaked: over'), 'an hour indoors dries you');
  const Fl = later(walk(applyPatch(S0, [{ op: 'replace', path: '/$ui/wxfx', value: 'flavor' }]), rainD, 10), 25, 'Sports Field');
  ok(!Object.keys(Fl.Player.Conditions).length && Fl.World._Weather, 'Flavor: weather shown, no conditions');
  // Chilled: 30 min outdoors at <= 0 °C; warm gear lowers the threshold to -5 °C
  const frostD = find(0, b => b.temp <= 0 && b.temp > -5 && b.sky !== 'Rain' && b.sky !== 'Storm');
  const ch = later(walk(S0, frostD, 10, '07:00'), 30, 'Sports Field');
  ok(ch.Player.Conditions.Chilled, `Chilled after 30 min at ${ch.$ui.wx.now.temp} °C`);
  const ch2 = later(walk(applyPatch(S0, [{ op: 'insert', path: '/Inventory/Wool scarf and mittens', value: { Qty: 1, Kind: 'gear' } }]), frostD, 10, '07:00'), 30, 'Sports Field');
  ok(!ch2.Player.Conditions.Chilled, 'warm gear: not chilled above -5 °C');
  const st0 = ch.Player.Vitals.Stamina, ch3 = later(ch, 60, 'Sports Field');
  ok(Math.round(st0 - ch3.Player.Vitals.Stamina) === 10, `Chilled costs 10 stamina per outdoor hour (${st0} -> ${ch3.Player.Vitals.Stamina})`);
  const coldRain = find(1, b => b.sky === 'Rain' && !b.snow && b.temp <= 8 && b.temp > 3 && !b.wind);
  const cr = later(walk(S0, coldRain, 10), 25, 'Sports Field');
  ok(cr.Player.Conditions.Soaked && cr.Player.Conditions.Chilled, 'Soaked at <= 8 °C also means Chilled');
  const hotD = find(1, b => b.temp >= 28 && b.temp < 31 && (b.sky === 'Clear' || b.sky === 'Cloudy'));
  const ho = later(walk(S0, hotD, 10), 60, 'Sports Field');
  ok(ho.Player.Conditions.Overheated, `Overheated after an hour at ${ho.$ui.wx.now.temp} °C`);
  ok(!later(walk(applyPatch(S0, [{ op: 'insert', path: '/Inventory/Straw sun hat', value: { Qty: 1, Kind: 'gear' } }]), hotD, 10), 60, 'Sports Field').Player.Conditions.Overheated, 'a sun hat raises the threshold to 31 °C');
  ok(!later(later(ho, 2, 'Canteen'), 30, 'Canteen').Player.Conditions.Overheated, 'half an hour indoors cools you down');
  // Head cold: the daily roll at the first update of a new day (15% after Soaked/Chilled); stamina capped at 80%
  let hc = null, tries = 0;
  for (let k = 0; k < 60 && !hc; k++) {
    const d = find(1, b => b.sky === 'Rain' && !b.snow && !b.wind && b.rain !== 'heavy', rainD + 1 + k * 3); tries++;
    const X = later(later(walk(S0, d, 10), 25, 'Sports Field'), 60, 'Lecture Halls');
    const Y = at(X, d + 1, '08:00', 'Lecture Halls');
    if (Y.Player.Conditions['Head cold']) hc = Y;
  }
  ok(!!hc, `a head cold can follow a soaking (15% a day; found after ${tries} tries)`);
  if (hc) {
    const full = applyPatch(hc, [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 100 }]);
    ok(full.Player.Vitals.Stamina === 80, 'Head cold caps stamina at 80% of max');
    const until = hc.$eng.wxs.hc, day = Math.floor(hc.$eng.abs / DAY);
    ok(until - day >= 2 && until - day <= 4, `lasts 2-4 days (${until - day})`);
    ok(!at(hc, until, '09:00', 'Lecture Halls').Player.Conditions['Head cold'], 'and passes');
    ok(!applyPatch(hc, [{ op: 'remove', path: '/Player/Conditions/Head cold' }]).Player.Conditions['Head cold'], 'the story may cure it (Medical Centre)');
  }
}

console.log('Sleep quality, bond cap, Dove cover');
{
  const sleep = (d, S = S0) => { const A = at(S, d, '22:00', 'Fire Dormitory', [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 10 }]); return later(A, 240, 'Fire Dormitory', [{ op: 'replace', path: '/Player/Vitals/Resting', value: 'sleep' }]).Player.Vitals.Stamina - 10; };
  const plain = find(2, b => b.sky === 'Clear' && b.temp < 22), cosy = find(2, b => b.sky === 'Rain' && !b.snow && b.rain !== 'heavy' && b.temp < 22);
  const storm = find(2, b => b.sky === 'Storm' && b.temp < 22);
  const g0 = sleep(plain), g1 = sleep(cosy), g2 = sleep(storm);
  ok(Math.abs(g1 / g0 - 1.1) < 0.01 && Math.abs(g2 / g0 - 0.8) < 0.01, `sleep: rain at night +10% (${g1.toFixed(1)}), storm -20% (${g2.toFixed(1)}) vs ${g0.toFixed(1)}`);
  const warmN = find(2, b => b.sky === 'Clear' && b.temp >= 22);
  ok(Math.abs(sleep(warmN) / g0 - 0.9) < 0.01, 'a night at >= 22 °C: -10%');
  // 1.2.2: bond XP replaces Progress; the weather still adds once a day (+1 XP) to time spent together
  const IA = k => ({ op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: k } });
  const bond = (d, loc, kinds, S = S0) => applyPatch(at(S, d, '13:00', loc), kinds.map(IA)).Bonds.Etnie.$xp - (S.Bonds.Etnie.$xp || 0);
  const rainAft = find(1, b => b.sky === 'Rain'), fineAft = find(1, b => (b.sky === 'Clear' || b.sky === 'Cloudy') && b.temp >= 15 && b.temp <= 27), dull = find(1, b => b.sky === 'Overcast');
  ok(bond(dull, 'Canteen', ['talk', 'hangout']) === 5, 'a talk and a hangout: 5 XP');
  ok(bond(rainAft, 'Canteen', ['talk', 'hangout']) === 6, 'stuck indoors together in the rain: +1');
  ok(bond(fineAft, 'Gardens', ['talk']) === 3, 'outdoors in fine mild weather: +1');
  ok(bond(rainAft, 'Canteen', ['talk', 'hangout', 'talk', 'hangout']) === 6, 'never more than one talk, one hangout and +1 a day');
  ok(bond(rainAft, 'Canteen', ['talk', 'hangout'], applyPatch(S0, [{ op: 'replace', path: '/$ui/wxfx', value: 'flavor' }])) === 5, 'Flavor: no weather bonus');
  const hid = applyPatch(S0, [{ op: 'replace', path: '/Hidden', value: { _True_magic: 'Unmaking', Cover_magic: 'Telekinesis', Concealment: '', Known_by: [], Dove_attention: 0 } }, { op: 'replace', path: '/$eng/auth', value: 'builder' }]);
  const fogD = find(0, b => b.sky === 'Fog');
  const fo = applyPatch(at(hid, fogD, '09:30', 'Courtyards'), [{ op: 'delta', path: '/Hidden/Dove_attention', value: 9 }]);
  ok(fo.Hidden.Dove_attention === 5 && fo._Log.some(l => /halved by the weather/.test(l)), 'outdoors in fog a Dove attention rise is halved (9 -> 5)');
  ok(applyPatch(at(hid, fogD, '09:30', 'Main Library'), [{ op: 'delta', path: '/Hidden/Dove_attention', value: 9 }]).Hidden.Dove_attention === 9, 'indoors it is not');
}

console.log('Class-aware presence (Now entry)');
{
  const mon9 = (S, loc, extra = []) => at(S, 7, '09:00', loc, extra);   // M1 W2 Mon 09:00, P1 Magic Theory [M]
  const lib = render(505, mon9(S0, 'Main Library'));
  const likely = /Likely around Main Library[^:]*: (.*)/.exec(lib)[1];
  ok(!/Etnie|Gareth|Irene|Zara/.test(likely) && /Students are in class until 10:00\./.test(lib), `Monday 09:00 at the Main Library: no students (${likely})`);
  const lh = render(505, mon9(S0, 'Lecture Halls'));
  ok(/Your class now: Magic Theory \[M\] \(Year 1, all dorms\) at Lecture Halls — teacher Yvette; classmates on record: .*Trixie.*Zara/.test(lh) && !/classmates on record:.*Florian/.test(lh), 'Lecture Halls: Year 1 Magic Theory, teacher Yvette, Year 1 classmates');
  const fireD = at(S0, 8, '11:00', 'Lecture Halls', [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);   // Tue P2 Magic Theory [D]
  const d = render(505, fireD);
  ok(/\(Year 1, Fire only\)/.test(d) && /classmates on record: Caralynn, Trixie$/m.test(d), `[D] class filters by dorm (${/classmates on record: (.*)/.exec(d)[1]})`);
  const sat2 = render(505, at(S0, 12, '11:00', 'Main Library')), sat2b = render(505, at(S0, 12, '11:00', 'Canteen'));
  ok(/Study Hall until 12:00: most students are here/.test(sat2) && /Students are at Study Hall/.test(sat2b), 'Saturday P2: Study Hall at the Main Library');
  const sat3 = render(505, at(S0, 12, '14:00', 'Club Rooms')), sat3b = render(505, at(S0, 12, '14:00', 'Laundry'));
  ok(/Club time: .*Board Game Club: meeting here until 16:00 \(members on record: Gareth\)/.test(sat3) && /Students are at their clubs until 16:00/.test(sat3b), 'Saturday P3: club venues list members');
  const y2 = render(505, at(S0, 336 + 7, '09:00', 'Lecture Halls'));
  ok(/classmates on record: .*Trixie/.test(y2) === false || /Year 1/.test(y2), 'Year 2 campaign: last year\'s first-years moved up');
  const y2b = render(505, at(S0, 336 + 7, '09:00', 'Lecture Halls', [{ op: 'replace', path: '/Player/Profile/Year', value: 2 }]));
  ok(/\(Year 2, all dorms\).*teacher Ezrel; classmates on record: .*Trixie/.test(y2b) && !/classmates on record:.*Florian/.test(y2b), 'Year 2 campaign, {{user}} in Year 2: teacher Ezrel, classmates = the moved-up cohort');
  const offc = render(505, mon9(applyPatch(S0, [{ op: 'replace', path: '/$ui/off', value: ['class'] }]), 'Main Library'));
  ok(!/in class/.test(offc) && /Etnie/.test(offc), 'class presence off: habits only');
}

console.log('Story hooks');
{
  let S = applyPatch(at(S0, 1, '10:00', 'Canteen'), [{ op: 'insert', path: '/Hooks/Irene returns', value: { Note: 'back at noon with the ledger', Who: 'irene chanare', Kind: 'promise', Weight: 2, Due: 'today 12:00' } }]);
  const H = S.Hooks['Irene returns'];
  ok(H.Who === 'Irene' && H.Planted === 'M1 W1 Tue' && H._State === 'waiting' && H.$abs === DAY + 720, 'new hook: Planted, anchored Due, Who via aliases');
  S = later(S, 100, 'Canteen'); ok(S.Hooks['Irene returns']._State === 'due' && S._Log.some(l => /Hook due now: "Irene returns"/.test(l)), 'due from 30 min before (logged once)');
  ok(/Hooks due now: Irene returns \(Irene: back at noon with the ledger\)/.test(render(505, S)), '<now> lists the hook that is due');
  S = later(S, 220, 'Canteen'); ok(S.Hooks['Irene returns']._State === 'overdue' && S._Log.filter(l => /Hook due now/.test(l)).length === 1, 'overdue 3 h after (the due log was written once)');
  let O = applyPatch(S0, [{ op: 'insert', path: '/Hooks/Cracked seal', value: { Note: 'hairline crack on the east ward', Weight: 2 } }, { op: 'insert', path: '/Hooks/Odd smell', value: { Note: 'x', Weight: 1 } }]);
  O = at(O, 15, '09:00', 'Canteen');
  ok(O.Hooks['Cracked seal']._State === 'old' && O.Hooks['Odd smell']._State === 'waiting' && /Old hooks \(pay off or drop\): Cracked seal/.test(render(505, O)), 'Weight >= 2 without Due turns old after 14 days');
  const many = Object.fromEntries(Array.from({ length: 16 }, (_x, i) => [`H${i}`, { Note: 'n', Weight: i % 2 ? 2 : 1 }]));
  const C = applyPatch(S0, [{ op: 'replace', path: '/Hooks', value: many }]);
  ok(Object.keys(C.Hooks).length === 15 && !C.Hooks.H0 && C.Hooks.H2 && C.Hooks.H1, 'cap 15: the oldest Weight-1 hook goes first');
  const R = applyPatch(S, [{ op: 'replace', path: '/Hooks/Irene returns', value: { Note: 'back at noon', Who: 'Irene', Weight: 2, Due: 'today 12:00' } }]);
  ok(R.Hooks['Irene returns'].$abs === DAY + 720 && R.Hooks['Irene returns'].$born === S.Hooks['Irene returns'].$born, 'a whole-record replace keeps the anchor and birth');
  ok(!render(505, applyPatch(S, [{ op: 'replace', path: '/$ui/off', value: ['hooks'] }])).includes('Hooks due'), 'hooks off: no hook lines');
}

console.log('Gossip');
{
  const fates = { fizzle: 0, normal: 0, fast: 0 };
  for (let i = 0; i < 2000; i++) { const d = E.hash32(SEED, `rumour ${i}`, 'rum') % 20 + 1; fates[d <= 3 ? 'fizzle' : d >= 18 ? 'fast' : 'normal']++; }
  ok(Math.abs(fates.fizzle / 2000 - 0.15) < 0.03 && Math.abs(fates.fast / 2000 - 0.15) < 0.03, `fate d20: fizzle ${fates.fizzle}, normal ${fates.normal}, fast ${fates.fast} of 2000`);
  const txt = (S0.$eng.seed, Array.from({ length: 40 }, (_x, i) => `Someone saw a light in the Bell Tower (${i})`));
  const pick = f => txt.find(t => { const d = E.hash32(SEED, t, 'rum') % 20 + 1; return f === 'fizzle' ? d <= 3 : f === 'fast' ? d >= 18 : d > 3 && d < 18; });
  const N = pick('normal'), Z = pick('fizzle'), F = pick('fast');
  let S = applyPatch(at(S0, 2, '10:00', 'Canteen'), [{ op: 'replace', path: '/Campus_State/Rumours', value: [N, Z, F] }]);
  const reach = (S, r) => (S.$ui.gossip.find(g => g[0] === r) || [])[1];
  ok(reach(S, N) === 'only witnesses' && S.$eng.rum[N].fate === 'normal', 'day 0: only witnesses');
  S = at(S, 3, '10:00', 'Canteen'); ok(reach(S, N) === "the source's dorm and club" && reach(S, F) === 'all over campus', 'day 1: dorm and club (fast: campus-wide)');
  S = at(S, 5, '10:00', 'Canteen'); ok(!S.Campus_State.Rumours.includes(Z) && S.$ui.rumours_old.includes(Z) && reach(S, N) === 'most of campus', 'a fizzle dies on day 3; day 3: most of campus');
  ok(/Rumours going around: .*\(most of campus, day 3\)/.test(render(505, S)), '<now> gives reach and day');
  S = at(S, 9, '10:00', 'Canteen'); ok(reach(S, N) === 'old news, everyone knows', 'day 7: old news');
  S = at(S, 23, '10:00', 'Canteen'); ok(!S.Campus_State.Rumours.includes(N) && S.$ui.rumours_old.includes(N), 'day 21: removed to the UI archive');
  let T = applyPatch(at(S0, 2, '10:00', 'Canteen'), [{ op: 'replace', path: '/Campus_State/Rumours', value: [N] }]);
  T = applyPatch(T, [{ op: 'remove', path: '/Campus_State/Rumours/0' }]); ok(!T.$eng.rum[N], 'the story removes a rumour: its metadata goes too');
}

console.log('Feature settings (parking)');
{
  let S = applyPatch(at(S0, 1, '10:00', 'Canteen'), [{ op: 'insert', path: '/Letters/From home', value: { From: 'Mother', Gist: 'Proud of you', Status: 'waiting' } },
    { op: 'insert', path: '/Commitments/Essay', value: { Desc: 'x', Due: 'M1 W1 Tue 12:00' } }]);
  ok(S.$ui.unlocks.includes('letters'), 'letters unlocked');
  const J0 = S.Journal.length;
  let O = applyPatch(S, [{ op: 'replace', path: '/$ui/off', value: ['letters', 'planner'] }]);
  const cs = YAML.stringify(omit$(O));
  ok(!Object.keys(O.Letters).length && !cs.includes('Proud of you') && !cs.includes('Essay') && O.$ui.parked.letters.Letters['From home'].Gist === 'Proud of you', 'off: the state is parked (gone from <current_state>)');
  ok(!/Letters \(Mail Tower/.test(render(502, O)) && !/Commitments: \{/.test(render(502, O)) && !/Mail Tower:/.test(render(505, O)), 'off: its rules are gone from 502 and 505');
  ok(O.Journal.length === J0 && !O.$ui.toasts.some(t => /Letter|Overdue/.test(t)), 'parking is not a story event (no journal, no toasts)');
  O = applyPatch(O, [{ op: 'insert', path: '/Letters/Reply', value: { From: 'Mother', Gist: 'Write back!', Status: 'waiting' } }]);
  ok(!Object.keys(O.Letters).length && O.$ui.parked.letters.Letters.Reply, 'an AI write into a parked module is merged into the parking');
  O = later(O, 180, 'Canteen');   // the essay goes overdue while the planner is off
  ok(!O._Log.some(l => /Essay/.test(l)), 'a parked module is not processed');
  const R = applyPatch(O, [{ op: 'replace', path: '/$ui/off', value: [] }]);
  ok(R.Letters['From home'] && R.Letters.Reply && R.Commitments.Essay && !R.$ui.parked.letters && !R.$ui.parked.planner, 'on: everything is restored');
  ok(R.Commitments.Essay._Late && R._Log.some(l => /"Essay" is overdue/.test(l)) && !R.Journal.some(l => /Set off|Back from/.test(l)), 'catch-up rules run once (the overdue essay is logged)');
  const T = at(applyPatch(S0, [{ op: 'replace', path: '/$ui/off', value: ['trip'] }]), 85, '10:00', 'Canteen');
  ok(!T.$ui.unlocks.includes('trip') && at(S0, 85, '10:00', 'Canteen').$ui.unlocks.includes('trip'), 'a feature that is off does not unlock (trip window before Crowning Day)');
  const W = applyPatch(at(S0, 1, '10:00', 'Canteen'), [{ op: 'insert', path: '/Player/Conditions/Soaked', value: { Effect: 'x' } }, { op: 'replace', path: '/$ui/wxfx', value: 'flavor' }]);
  ok(!Object.keys(W.Player.Conditions).length && W.$ui.parked.weather['Player.Conditions'].Soaked, 'weather below Full parks Conditions');
  // token numbers shown in the UI = a re-measurement of the rendered rules (±10%)
  const FC = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/feature_cost.json'), 'utf8'));
  const both = S => tok(render(502, S)) + tok(render(504, S));
  let worst = 0;
  for (const f of JSON.parse(fs.readFileSync(path.join(ROOT, 'data/features.json'), 'utf8')).features) {
    const off = f.control === 'levels' ? [{ op: 'replace', path: `/$ui/${f.field}`, value: 'off' }] : [{ op: 'replace', path: '/$ui/off', value: [f.id] }];
    const d = both(S0) - both(applyPatch(S0, off)), want = FC.rules[f.id];
    worst = Math.max(worst, Math.abs(d - want) / Math.max(want, 10));
  }
  ok(worst <= 0.1, `rule token estimates match a re-measurement within 10% (worst ${(100 * worst).toFixed(0)}%)`);
}

console.log('Happenings and weather');
{
  const HP = E.HAPPENINGS, outdoor = new Set(HP.filter(h => h.outdoor).map(h => h.id));
  let skipped = 0, bad = 0, wxOnly = 0, wxWrong = 0;
  for (const seed of SEEDS) for (let d = 3; d < 336 * 2; d++) {
    const h = E.rawHappening(seed, d, 1, [], 'full'); if (!h) continue;
    const D = E.wxDay(seed, d).blocks, Y = E.wxDay(seed, d - 1).blocks;
    const heavy = [D[0], D[1]].some(b => b.sky === 'Storm' || b.rain === 'heavy' || b.rare === 'blizzard' || b.rare === 'hail');
    if (heavy && outdoor.has(h.id)) bad++;
    if (h.weather) { wxOnly++; const okw = { snow: Y[2].snow || D[0].snow, after_storm: Y.some(b => b.rare === 'lightning storm' || b.wind === 'gale'), dense_fog: D[0].rare === 'dense fog', clear_night: D[2].sky === 'Clear' }[h.weather]; if (!okw) wxWrong++; }
    if (heavy) skipped++;
  }
  ok(bad === 0 && skipped > 20, `outdoor happenings are skipped on heavy-weather days (${skipped} such days checked)`);
  ok(wxOnly > 20 && wxWrong === 0, `weather-only happenings appear only in their weather (${wxOnly} seen)`);
  let offW = 0; for (let d = 3; d < 600; d++) { const h = E.rawHappening(SEED, d, 1, [], 'off'); if (h && h.weather && h.weather !== 'clear_night') offW++; }
  ok(offW === 0, 'weather Off: no weather-only happenings');
}

console.log('Weather in the Now entry: indoor schedules, flu, moods, battle field');
{
  const rainD = find(1, b => b.sky === 'Rain' && !b.snow);
  const sf = render(505, at(S0, rainD, '16:30', 'Sports Field'));
  ok(/Moved indoors in this weather \(Gymnasium, Common Rooms\): .*Percival/.test(sf) && /Likely around Sports Field[^:]*: no regulars/.test(sf), 'rain: regulars of outdoor places move indoors');
  const satRain = (() => { for (let d = 5; d < 3000; d += 7) { const D = E.wxDay(SEED, d); if (QUIET(d) && D.blocks[1].sky === 'Rain' && !D.blocks[1].snow) return d; } })();
  ok(/Soccer Club: practising indoors \(Gymnasium\) or cancelled/.test(render(505, at(S0, satRain, '14:00', 'Sports Field'))), 'Saturday clubs with only outdoor venues practise indoors or cancel');
  ok(/Fishing Club: meeting here/.test(render(505, at(S0, satRain, '14:00', 'Fishing House'))), '...except the Fishing Club, which goes out in the rain (at its Fishing House, 1.2.0)');
  const fluD = (() => { for (let d = 3; d < 56; d++) if (E.fluOn(SEED, d) && QUIET(d)) return d; for (let d = 339; d < 392; d++) if (E.fluOn(SEED, d)) return d; })();
  const F = at(S0, fluD, '17:00', 'Main Library'), ft = render(505, F);
  ok(F.$ui.wx.flu && F.$ui.wx.sick.length >= 1 && /A cold is going around campus\. Off sick in their dorm today: /.test(ft), `flu wave: ${F.$ui.wx.sick.join(', ')} off sick`);
  const likely = /Likely around[^:]*: (.*)/.exec(ft)[1];
  ok(F.$ui.wx.sick.every(id => !likely.includes(id)), 'the sick are not "likely around"');
  const coldD = find(1, b => b.temp <= 7);
  ok(/Idris is cold-blooded: sluggish/.test(render(505, at(S0, coldD, '14:00', 'Canteen', [{ op: 'replace', path: '/Scene/Present', value: { Idris: { Note: '' } } }]))), 'canon weather mood: Idris in the cold');
  const windD = find(1, b => !!b.wind && b.sky !== 'Rain');
  const bt = at(S0, windD, '14:00', 'Combat Grounds', [{ op: 'replace', path: '/Battle', value: { Active: true, Combatants: { Sophia: { HP: 100 } } } }]);
  ok(/Battle field \(outdoors\): .*gusts/.test(render(505, bt)), `outdoor fight: field line (${bt.$ui.wx.field})`);
  ok(!/Battle field/.test(render(505, at(S0, windD, '14:00', 'Sparring Pavilion', [{ op: 'replace', path: '/Battle', value: { Active: true, Combatants: { Sophia: { HP: 100 } } } }]))), 'indoor fight: no field line');
}

console.log('UI (Student file, Notebook, Activities)');
{
  global.window = { parent: { document: {} } };
  const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view, renderProfile, featureOps, DATA };')();
  let S = applyPatch(at(S0, 1, '10:00', 'Canteen'), [{ op: 'insert', path: '/Inventory/Star Cookie', value: { Qty: 1, Kind: 'food', Plan: 'tonight' } },
    { op: 'insert', path: '/Letters/From home', value: { From: 'Mother', Gist: 'x', Status: 'waiting' } }]);
  U.view.tab = 'bag'; let h = U.renderProfile(S);
  ok(/data-tab="bag"/.test(h) && /I eat the Star Cookie\./.test(h) && /tonight/.test(h), 'Bag tab: item, plan and a Use button that drafts "I eat the Star Cookie."');
  U.view.tab = 'settings'; h = U.renderProfile(S);
  ok((h.match(/class="feat( off)?"/g) || []).length === U.DATA.features.length && /Estimated always-on total for this chat now: <b>≈[\d,]+<\/b>/.test(h), 'Settings → Features: one row per feature and a live total');
  const ops = U.featureOps(S, 'letters', 'off');
  ok(ops && ops.ops[0].path === '/$ui/off' && ops.ops[0].value.includes('letters'), 'a toggle is a /$ui/off patch (commitSetting, D3)');
  const O = applyPatch(S, ops.ops);
  U.view.tab = 'settings'; ok(/saved by features that are off: ≈\d+/.test(U.renderProfile(O)), 'the footer shows what the off features save');
  h = U.PANELS.notebook.render(O); ok(!/data-nb="letters"/.test(h), 'Notebook: the Letters tab hides when letters are off');
  U.view.nb = 'notices'; h = U.PANELS.notebook.render(applyPatch(S, [{ op: 'replace', path: '/World/Location', value: 'Notice Board' }]));
  ok(/Divination Society — tomorrow's skies/.test(h) && /no responsibility for umbrellas/.test(h), 'Notice Board: the Divination Society forecast card');
  U.view.act = 'shop'; U.view.shop = 'All'; h = U.PANELS.activities.render(applyPatch(S, [{ op: 'replace', path: '/World/Location', value: 'The Mall' }]));
  ok(/Straw sun hat.*out of season/.test(h) && /Wool scarf and mittens/.test(h) && !/Wool scarf and mittens <span class="pill oos"/.test(h), 'Shop: off-season items greyed (winter: no sun hat), in-season ones normal');
  const T = at(applyPatch(S0, [{ op: 'replace', path: '/$ui/off', value: ['trip'] }]), 85, '10:00', 'Canteen');
  h = U.PANELS.activities.render(T); ok(!/data-actab="trip"/.test(h), 'Activities: the Trips tab hides when trips are off');
}
{
  const A = applyPatch(at(S0, 1, '10:00', 'Canteen'), [{ op: 'insert', path: '/Player/Conditions/Soaked', value: { Effect: 'bucket of water' } }]);
  ok(A.Player.Conditions.Soaked && !later(A, 30, 'Canteen').Player.Conditions.Soaked === false && !later(later(A, 30, 'Canteen'), 35, 'Canteen').Player.Conditions.Soaked,
    'a condition the story adds indoors lasts its full hour, then clears');
}
