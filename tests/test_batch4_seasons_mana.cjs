// Playtest Batch 4 (1.9.4): spring-start seasons, rebaselined weather, direct soaking/freezing via /Exposure, passive mana regeneration.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { wxDay, fluOn, fromAbs, SEASONS };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const DAY = 1440, SEED = 424242, SEEDS = [12345, 987654, 55555, SEED];
const monthOf = d => Math.floor(((d % 336) + 336) % 336 / 28) + 1;
const QUIET = d => { const m = monthOf(d); return m !== 12 && m !== 7 && !(m === 5 && Math.floor((d % 28) / 7) === 3); };
const S0 = applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: SEED }]);
function at(S, d, hhmm, loc, extra = []) {
  const [h, mi] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + mi);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : []), ...extra]);
}
const later = (S, mins, loc, extra = []) => { const a = S.$eng.abs + mins, T = E.fromAbs(a); return at(S, Math.floor(a / DAY), T.Time, loc, extra); };

console.log('Playtest Batch 4: seasons and weather');
{
  const want = ['Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter', 'Winter', 'Winter'];
  ok(JSON.stringify(E.SEASONS) === JSON.stringify(want), 'engine: M1-3 Spring, M4-6 Summer, M7-9 Autumn, M10-12 Winter');
  const bounds = [[0, 'Spring'], [83, 'Spring'], [84, 'Summer'], [167, 'Summer'], [168, 'Autumn'], [251, 'Autumn'], [252, 'Winter'], [335, 'Winter'], [336, 'Spring']];
  ok(bounds.every(([d, s]) => E.wxDay(SEED, d).season === s), 'month boundaries switch season on the first day of M4, M7, M10 and the new year');
  // 1.43.0 (audit batch 2): one table, data/calendar.json "seasons" through shared.js, in the engine, the panels and the bracelet
  const sh = f => (/const SH = (\{.*?\});/.exec(read(f)) || [])[1];
  ok(['src/scripts/engine.js', 'src/scripts/ui.js', 'src/ui/statusbar.html'].every(f => sh(f) && JSON.stringify(JSON.parse(sh(f)).seasons) === JSON.stringify(want)) && /const season = SEASON_OF\(W\.Month\)/.test(read('src/ui/statusbar.template.html')),
    'Activities shop and bracelet use the same season table as the engine (shared.js)');
  const mean = (months, b) => { let t = 0, n = 0; for (const seed of SEEDS) for (let d = 0; d < 336; d++) if (months.includes(monthOf(d))) { t += E.wxDay(seed, d).blocks[b].temp; n++; } return t / n; };
  const m1 = mean([1], 0), su = mean([4, 5, 6], 1), wi = mean([10, 11, 12], 2);
  ok(m1 >= 4 && m1 <= 10, `Month 1 mornings are cool spring, not freezing (${m1.toFixed(1)} °C)`);
  ok(su >= 20 && su <= 28, `summer afternoons are warm (${su.toFixed(1)} °C)`);
  ok(wi <= 0, `winter nights reach freezing (${wi.toFixed(1)} °C)`);
  let snowOut = 0, snowIn = 0;
  for (const seed of SEEDS) for (let d = 0; d < 336; d++) for (const b of E.wxDay(seed, d).blocks) if (b.snow) (monthOf(d) >= 10 ? snowIn++ : snowOut++);
  ok(snowOut === 0 && snowIn > 10, `snow only in Months 10-12 (${snowIn} winter blocks, ${snowOut} elsewhere)`);
  let fluMonths = new Set(); for (const seed of SEEDS) for (let d = 0; d < 336; d++) if (E.fluOn(seed, d)) fluMonths.add(monthOf(d));
  ok([...fluMonths].every(m => m === 10 || m === 11) && fluMonths.size >= 1, 'the flu wave falls in winter term (Months 10-11): ' + [...fluMonths].join(', '));
  const spring = at(S0, 10, '10:00', 'Canteen'), sb = read('src/ui/statusbar.html');
  ok(spring.World._Season === 'Spring' && /, spring: /.test(spring.World._Weather), `World._Season and _Weather follow the new table (${spring.World._Weather})`);
  ok(/' · ' \+ season/.test(sb) && /wx\.now\.temp\) \+ ' °C/.test(sb), 'bracelet shows season and temperature beside Month/Week');
}

console.log('Direct soaking and cold');
// a winter morning cold enough: the block's wind-chilled temperature at or below -2 °C outdoors
const chillOf = bk => bk.temp - (bk.wind === 'gale' ? 14 : bk.wind === 'windy' ? 7 : 0);
const cold = (() => { for (let d = 252; d < 3000; d++) { const bk = E.wxDay(SEED, d).blocks[0]; if (QUIET(d) && monthOf(d) >= 10 && bk.temp <= -2 && chillOf(bk) > -5 && !['Rain', 'Storm'].includes(bk.sky)) return d; } })();
ok(cold > 0, `a dry subzero winter morning exists (day ${cold}, ${E.wxDay(SEED, cold).blocks[0].temp} °C)`);
// arrive from indoors a minute before (a long jump outdoors would already have chilled {{user}}), rested
const C = later(at(S0, cold, '08:59', 'Canteen', [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 100 }]), 1, 'Sports Field');
ok(!Object.keys(C.Player.Conditions).length, 'no condition before the hit');
const hitOp = { op: 'insert', path: '/Exposure/-', value: { Kind: 'soaked', Cause: "Vera's water bolt" } };
const H = applyPatch(C, [hitOp]);
ok(H.Player.Conditions.Soaked && H.Player.Conditions.Chilled, 'water hit outdoors at subzero: Soaked and Chilled in the same update');
ok(H._Log.some(l => /Soaked \(Vera's water bolt\)/.test(l)) && H.Exposure.length === 0, 'the cause is logged and /Exposure is emptied');
const now = render(505, H);
ok(/is Soaked and Chilled right now: show it in this reply without being reminded, in the body and in what \{\{user\}\} can do, with a detail not used before/.test(now) && !/clinging clothes/.test(now), 'the next <now> tells the narrator to show both conditions (1.99.4, audit S6: a category, not a ready-made picture)');
const H2 = later(H, 10, 'Sports Field');
ok(H2.Player.Conditions.Soaked && H2.Player.Conditions.Chilled && H2.Player.Vitals.Stamina < H.Player.Vitals.Stamina, 'the conditions persist outdoors and cost stamina');
const warm = applyPatch(C, [{ op: 'replace', path: '/Inventory', value: { 'Wool scarf and mittens': { Qty: 1 } } }]);
const W1 = applyPatch(warm, [hitOp]);
ok(W1.Player.Conditions.Soaked && !W1.Player.Conditions.Chilled, 'warm gear holds off the immediate chill...');
ok(later(W1, 5, 'Sports Field').Player.Conditions.Chilled, '...but a few wet minutes outdoors still chill');
const I = applyPatch(at(S0, cold, '09:00', 'Canteen'), [hitOp]);
ok(I.Player.Conditions.Soaked && !I.Player.Conditions.Chilled, 'a hit indoors soaks without chilling (shelter)');
const Id = later(I, 60, 'Canteen');
ok(!Id.Player.Conditions.Soaked, 'an hour indoors dries it');
const story = applyPatch(C, [{ op: 'insert', path: '/Player/Conditions/Soaked', value: { Effect: 'x' } }]);
ok(story.Player.Conditions.Chilled, 'a Soaked condition written directly outdoors at freezing chills at once too');
const frost = applyPatch(at(S0, 30, '09:00', 'Canteen'), [{ op: 'insert', path: '/Exposure/-', value: { Kind: 'chilled', Cause: 'a frost spell' } }]);
ok(frost.Player.Conditions.Chilled && !frost.Player.Conditions.Soaked, 'a freezing hit reports Chilled on its own');
const flav = applyPatch(applyPatch(C, [{ op: 'replace', path: '/$ui/wxfx', value: 'flavor' }]), [hitOp]);
ok(!Object.keys(flav.Player.Conditions).length && flav.Exposure.length === 0, 'weather effects Flavor: no condition, the report is still emptied');
ok(JSON.stringify(applyPatch(C, [hitOp])) === JSON.stringify(H), 'swipe/replay of the hit gives the same state');
const r502 = card.character_book.entries.find(e => e.id === 502).content, r504 = card.character_book.entries.find(e => e.id === 504).content;
ok(/\/Exposure\/-/.test(r502) && /"Kind":"soaked\|chilled"/.test(r502) && /in every reply while they last, without waiting for the player/.test(r504), 'narrator rules explain /Exposure and persistent conditions (1.99.4: the full Exposure rule is a card)');

console.log('Passive mana regeneration');
{
  const base = applyPatch(at(S0, 30, '08:00', 'Canteen'), [{ op: 'replace', path: '/$ui/wxfx', value: 'off' },
    { op: 'replace', path: '/Player/Vitals/Mana_max', value: 137 }, { op: 'replace', path: '/Player/Vitals/Mana', value: 0 },
    { op: 'replace', path: '/$ui/built', value: true }, { op: 'replace', path: '/$eng/auth', value: 'builder' }]);
  ok(base.Player.Vitals.Mana === 0 && base.Player.Vitals.Mana_max === 137, 'empty pool, max 137');
  const awake = later(base, 360, 'Canteen');
  ok(awake.Player.Vitals.Mana === 137, `awake: 360 minutes restore exactly the maximum (${awake.Player.Vitals.Mana})`);
  const slept = later(base, 360, 'Canteen', [{ op: 'replace', path: '/Player/Vitals/Resting', value: 'sleep' }]);
  ok(slept.Player.Vitals.Mana === 137, `asleep: the same, no extra refill (${slept.Player.Vitals.Mana})`);
  const half = later(base, 180, 'Canteen');
  ok(half.Player.Vitals.Mana === 68.5, `180 minutes restore half (${half.Player.Vitals.Mana})`);
  const rest = later(base, 60, 'Canteen', [{ op: 'replace', path: '/Player/Vitals/Resting', value: 'rest' }]);
  ok(Math.abs(rest.Player.Vitals.Mana - 137 / 6) < 0.06, `resting adds no mana beyond regeneration (${rest.Player.Vitals.Mana})`);
  let X = base, peak = 0;
  for (let i = 0; i < 120; i++) { X = later(X, 3, 'Canteen'); peak = Math.max(peak, X.Player.Vitals.Mana); }
  ok(X.Player.Vitals.Mana === 137 && peak <= 137, `120 turns of 3 minutes reach exactly the maximum, never above (${X.Player.Vitals.Mana})`);
  let Y = base; for (let i = 0; i < 59; i++) Y = later(Y, 3, 'Canteen');
  ok(Y.Player.Vitals.Mana < 137 && Math.abs(Y.Player.Vitals.Mana - 137 * 177 / 360) < 0.06, `short turns lose nothing to rounding (${Y.Player.Vitals.Mana} after 177 min)`);
  ok(JSON.stringify(later(base, 360, 'Canteen')) === JSON.stringify(awake), 'swipe/replay gives the same mana');
  const dead = later(applyPatch(base, [{ op: 'replace', path: '/Player/Vitals/Lethal_flag', value: true }, { op: 'replace', path: '/Player/Vitals/HP', value: 0 }]), 60, 'Canteen');
  ok(dead.Player.Vitals.Mana === 0, 'no regeneration after death');
  // costs counted once: upkeep is offset by regeneration minute by minute
  const T = { 'Warm Aura': { Type: 'Elemental', Subtype: 'Fire', Cost_mode: 'sustained', Activation: 10, Upkeep_per_min: 0.5 } };
  let U = applyPatch(base, [{ op: 'replace', path: '/Magic/_Techniques', value: T }, { op: 'replace', path: '/Player/Vitals/Mana_max', value: 120 },
    { op: 'replace', path: '/Player/Vitals/Mana', value: 60 }, { op: 'replace', path: '/$ui/built', value: true }, { op: 'replace', path: '/$eng/auth', value: 'builder' }]);
  U = applyPatch(U, [{ op: 'insert', path: '/Magic/Active/Aura', value: { Technique: 'Warm Aura' } }]);
  ok(U.Player.Vitals.Mana === 50, 'activation charged once (60 - 10)');
  const U1 = later(U, 60, 'Canteen');
  ok(U1.Player.Vitals.Mana === 40 && U1.Magic.Active.Aura, `60 min: upkeep 30 - regeneration 20 = 40 (${U1.Player.Vitals.Mana})`);
  const U2 = later(U1, 300, 'Canteen');
  ok(!U2.Magic.Active.Aura && U2._Log.some(l => /Aura ended at .*mana ran out/.test(l)), 'upkeep above regeneration still empties the pool and ends the effect');
  ok(U2.Player.Vitals.Mana > 0 && U2.Player.Vitals.Mana < 120, `regeneration after the effect ended stays (${U2.Player.Vitals.Mana})`);
  const cheap = { 'Glow': { Type: 'Elemental', Subtype: 'Fire', Cost_mode: 'sustained', Activation: 0, Upkeep_per_min: 0.2 } };
  let G = applyPatch(base, [{ op: 'replace', path: '/Magic/_Techniques', value: cheap }, { op: 'replace', path: '/Player/Vitals/Mana_max', value: 120 },
    { op: 'replace', path: '/Player/Vitals/Mana', value: 120 }, { op: 'replace', path: '/$ui/built', value: true }, { op: 'replace', path: '/$eng/auth', value: 'builder' }]);
  G = later(applyPatch(G, [{ op: 'insert', path: '/Magic/Active/Glow', value: { Technique: 'Glow' } }]), 120, 'Canteen');
  ok(G.Player.Vitals.Mana === 120, `upkeep below regeneration keeps a full pool full (${G.Player.Vitals.Mana})`);
  const cast = { 'Bolt': { Type: 'Elemental', Subtype: 'Water', Cost_mode: 'per_use', Activation: 30 } };
  let K = applyPatch(base, [{ op: 'replace', path: '/Magic/_Techniques', value: cast }, { op: 'replace', path: '/Player/Vitals/Mana', value: 10 },
    { op: 'replace', path: '/$ui/built', value: true }, { op: 'replace', path: '/$eng/auth', value: 'builder' }]);
  const K1 = later(K, 120, 'Canteen', [{ op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Bolt', Times: 1 } }]);
  ok(Math.abs(K1.Player.Vitals.Mana - (10 + 137 / 3 - 30)) < 0.06 && !K1._Log.some(l => /strained/.test(l)), `a cast late in a long turn draws on that turn's regeneration once (${K1.Player.Vitals.Mana})`);
  ok(/Mana regenerates by itself with elapsed time/.test(card.character_book.entries.find(e => e.id === 502).content), 'narrator rule: never add mana for rest yourself');
}
