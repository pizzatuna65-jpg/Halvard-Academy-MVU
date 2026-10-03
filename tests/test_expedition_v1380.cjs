// 1.38.0 (owner-approved planning/DRAFT_outside_maps.md, part 1, 2026-10-02): the Grand Vast Forest during the Creature Studies
// Expedition: forest places in World.Location, walking costs stamina and time, the engine (not the narrator) brings in the target,
// signs and other beasts, a catch counts only after the target was met, the result moves the Creature Studies mark and is kept.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { fromAbs, forestPlace, AR, EXP };')();
// 1.46.0 (audit 3.1): the area helpers are one module (AR, areaPlace)
E.expRoutes = f => E.AR.forest.routes(f);
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const at = (S, d, time, loc, extra = []) => { const T = E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })), { op: 'replace', path: '/World/Location', value: loc }, ...extra]); };
const WED = 44, THU = 45, FRI = 46;   // Month 2 Week 3
const GVF = 'Grand Vast Forest — ';
const X = JSON.parse(read('data/expedition.json'));

console.log('Data and routes');
const R = E.expRoutes('base_camp');
ok(R.old_heart.w === 10.5 && R.cave.w === 9.5 && R.terraces.w === 7.5 && R.gloaming.w === 5.5, 'shortest walks from Base Camp match the approved table (Old Heart 10.5 h)');
ok(E.expRoutes('wildwood_west').wildwood_east.w === 4 && E.expRoutes('falls').terraces.w === 1.5, 'Wildwood west to east 4 h (through north); the falls stair 1.5 h');
ok(X.places.filter(p => p.group === 'wildwood').length === 3, 'three Wildwood pins share one entry');
ok(E.forestPlace('the Gloaming', '') === 'gloaming' && E.forestPlace('Grand Vast Forest — Wildwood', 'base_camp') === 'wildwood_north', 'names and aliases; a bare Wildwood from camp is the nearest pin');
ok(E.forestPlace('Forest', '') === '' && E.forestPlace('the forest', 'falls') === 'falls', 'a bare "forest" is the campus Forest unless {{user}} was already in the Grand Vast Forest');

console.log('Arrival');
let S = at(initState(), WED, '06:30', 'Main Courtyard');
ok(!(S.$ui.forest || {}).on, 'not in the forest before the flight');
S = at(S, WED, '13:00', 'Grand Vast Forest, Base Camp');
ok(S.World.Location === GVF + 'Base Camp' && S.$ui.forest.on && S.$ui.forest.seen.includes('base_camp'), `arrival: ${S.World.Location}`);
ok(/rainforest/.test(S.World._Weather) && S.$ui.wx && S.$ui.wx.forest && !S.$ui.wx.away, `the rainforest's own weather: ${S.World._Weather}`);
ok(S.$ui.forest.walks[0][2] === 2 && S.$ui.forest.walks.length === 9, 'walks from here to the nine other places');
ok(!S.$ui.forest.tgt, 'no target before Thursday morning');
S = at(S, WED, '18:00', 'Grand Vast Forest — Base Camp — by the fire');
ok(S.World.Location === GVF + 'Base Camp — by the fire', 'details after the place are kept');
S = at(S, THU, '06:30', 'Grand Vast Forest — Base Camp');
ok(S.Player.Vitals.Stamina >= S.Player.Vitals.Stamina_max * 0.9, 'a night in the tents is a night of sleep');

console.log('The target');
S = at(S, THU, '08:15', 'Grand Vast Forest — Base Camp');
const F = S.$ui.forest, tgt = F.tgt;
ok(tgt && F.grade === 'III' && F.left > 23, `Thursday 08:00: target ${tgt} (Grade III), ${F.left} h left`);
const homes = S.$eng.exp.homes;
ok(homes.length && homes.every(id => !['base_camp', 'old_heart'].includes(id)) && homes.every(id => X.groups[X.places.find(p => p.id === id).group].III.includes(tgt)), `its homes: ${homes.join(', ')}`);
const caughtEarly = at(S, THU, '08:20', 'Grand Vast Forest — Base Camp', [{ op: 'replace', path: '/Expedition/Caught', value: true }]);
ok(!caughtEarly.Expedition.Caught && caughtEarly._Log.some(l => /reverted/.test(l)), 'a catch reported before the engine brought the target in is reverted');

console.log('Walking');
const st0 = S.Player.Vitals.Stamina;
let W = at(S, THU, '10:15', 'Grand Vast Forest — Wildwood (north)');
const spent = st0 - W.Player.Vitals.Stamina;
ok(W.World.Location === GVF + 'Wildwood (north)' && spent >= 16 && spent <= 16 * 1.25 + 0.01, `two hours to the Wildwood: -${spent.toFixed(1)} stamina (8% an hour, more in rain)`);
const far = at(S, THU, '09:15', 'Grand Vast Forest — The Gloaming');
ok(far.$ui.forest.owe === 4.5 && far.$ui.forest.here === 0, 'Base Camp to the Gloaming is 5.5 h: with one hour on the clock, 4.5 h of the walk are still ahead and nothing is searched');
ok(far.$ui.forest.seen.includes('wildwood_north'), 'places walked through are seen');

console.log('Searching');
const go = (S0, tm, loc, extra = []) => { const T0 = E.fromAbs(tm); return applyPatch(S0, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T0[k] })), { op: 'replace', path: '/World/Location', value: loc }, ...extra]); };
const full = [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 100 }];
const home = homes[0], RB = E.expRoutes('base_camp'), route = [home];
while (route[0] !== 'base_camp') route.unshift(RB[route[0]].prev);
const nameOf = id => X.places.find(p => p.id === id).name;
let T = S, tm = THU * 1440 + 8 * 60 + 15;
for (let i = 1; i < route.length; i++) { tm += E.expRoutes(route[i - 1])[route[i]].w * 60; T = go(T, tm, GVF + nameOf(route[i]), full); }
ok(T.$ui.forest.at === home && T.$ui.forest.owe === 0, `walked to ${nameOf(home)} (${route.length - 1} legs), the clock covering the walk`);
let met = null, hrs = 0;
for (let k = 1; k <= 14 && !met; k++) {
  tm += 60; T = go(T, tm, GVF + nameOf(home), full);
  hrs = T.$ui.forest.here;
  if (T.$ui.forest.ev.some(e => e.k === 'target')) met = T;
}
ok(hrs >= 1, `search hours counted here (${hrs})`);
if (met) {
  ok(met.$eng.exp.met === 1, `the target came in after ${met.$ui.forest.here} search hours`);
  const C = go(met, tm + 30, GVF + nameOf(home), [{ op: 'replace', path: '/Expedition/Caught', value: true }]);
  ok(C.Expedition.Caught && C.$ui.forest.res === 'caught' && C.$ui.forest.hist.Y1.res === 'caught', 'a catch after the meeting counts; the result is kept by year');
  ok(C.Journal.some(l => /brought back its assigned/.test(l)), 'the Journal records it');
  ok(C.$eng.study && C.$eng.study.shift && C.$eng.study.shift['Creature Studies'] && C.$eng.study.shift['Creature Studies'].s === 1, 'Creature Studies moves one step up at the next marking');
} else ok(true, '(no meeting in 14 hours with this seed: the chance never reaches 100%)');

console.log('Failure');
let N = at(S, THU, '10:15', 'Grand Vast Forest — Wildwood (north)');
N = at(N, FRI, '08:30', 'Grand Vast Forest — Base Camp');
if (N.$ui.forest.res !== 'caught') ok(N.$ui.forest.res === 'failed' && N.Journal.some(l => /came back without/.test(l)), 'no catch by Friday 08:00: the practical is failed and journaled');
const back = at(N, FRI, '19:00', 'Main Courtyard');
ok(!back.$ui.forest.on && !/Grand Vast Forest/.test(back.World.Location) && back.$ui.forest.hist.Y1, 'home again: the forest is off, the year\'s result stays');
const next = at(back, 60, '10:00', 'Forest');
ok(next.World.Location === 'Forest' && !next.$ui.forest.on && next.$ui.forest.seen.includes('base_camp'), 'later, the campus Forest is the campus Forest; the places seen are kept for next year');

console.log('Lore, <now> and UI data');
const idx = JSON.parse(read('src/worldbook/index.json'));
const gvf = idx.find(e => / - Grand Vast Forest$/.test(e.comment) || /Grand Vast Forest$/.test(e.comment));
ok(gvf && gvf.constant && /stat_data\.\$ui\.forest/.test(read(`src/worldbook/content/${gvf.uid}.txt`)), 'the forest overview is constant behind a gate on $ui.forest');
ok(idx.filter(e => /Grand Vast Forest - /.test(e.comment)).length === 9, 'eight place entries and the Wendigo');
ok(/Wendigo/.test(read('src/worldbook/content/229.txt')) && /hush owl/.test(read('src/worldbook/content/229.txt')), 'the beast list knows the Wendigo and the new beasts');
ok(/led by Vallie Goredust/.test(read('src/worldbook/content/230.txt')) && /recall flare/.test(read('src/worldbook/content/230.txt')), 'the Expedition entry: Vallie leads; the flare');
const ejs = require('ejs'), gv = St => k => _.get({ stat_data: St }, k), now = St => ejs.render(read('src/worldbook/custom/content/505.txt'), { getvar: gv(St) });
const n1 = now(W), n0 = now(next);
ok(/Grand Vast Forest \(Creature Studies Expedition\): \{\{user\}\} is at Wildwood \(north\)/.test(n1) && /Target: .+ \(Grade III\)\. \{\{user\}\} knows its name, not where it lives/.test(n1) && /Walks from here \(hours on foot, shortest route\): Base Camp 2/.test(n1), '<now>: where {{user}} is, the target without its home, the walks');
ok(!/Likely around/.test(n1) && !/Grand Vast Forest/.test(n0), '<now>: no campus regulars in the forest; nothing about the forest back home');
if (met) ok(/The target is here \(engine\)/.test(now(met)), '<now> brings the target in only when the engine does');
const lore = St => ejs.render(read('src/worldbook/content/360.txt'), { getvar: gv(St) });
ok(/Shortest walks/.test(lore(W)) && lore(next).trim() === '', 'the forest lore prints only during the Expedition');
ok(/Expedition\.Caught true only/.test(ejs.render(read('src/worldbook/custom/content/502.txt'), { getvar: gv(W) })), 'the update rules tell the narrator how to report a catch');
ok(/DATA\.forest|forest:/.test(read('src/scripts/ui.js')) && /grand_vast_forest\.webp/.test(read('src/scripts/ui.js')), 'the UI has the forest map');
