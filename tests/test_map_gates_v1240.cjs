// 1.24.0 (owner playtest): places behind a gate (1.24.1: far grounds only), lore heard in the story, map labels at the edge, zoom,
// and "Create your student" on the collapsed bracelet.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
global.window = { parent: { document: {} } };
const U = new Function(read('src/scripts/ui.js') + '\nreturn { DATA, PANELS, view, discovered };')();
const E = new Function(read('src/scripts/engine.js') + '\nreturn { fromAbs, PLACE_LORE };')();
const DAY = 1440;
const at = (S, d, hhmm, loc, opts) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : [])], opts); };
const set = (S, ops) => applyPatch(S, ops.map(([p, v]) => ({ op: 'replace', path: p, value: v })));
const S0 = set(initState(), [['/$eng/seed', 7], ['/$ui/wxfx', 'off'], ['/Player/Profile/Dorm', 'Fire'], ['/$ui/built', true], ['/$eng/auth', 'builder']]);
const pinsOf = S => { U.view.pin = null; return [...U.PANELS.map.render(S).matchAll(/data-pin="(\d+)"/g)].map(m => +m[1]); };
const L = U.DATA.locs;

console.log('Gates');
let p = pinsOf(S0);
ok(p.includes(1) && p.includes(22) && !p.includes(35) && !p.includes(34) && !p.includes(11) && !p.includes(9) && !p.includes(10) && p.includes(12) && p.includes(37) && p.includes(36),
  'at the start: Willow Island, the Fishing House, the Clearing, the Observation Tower and the Old Hut do not show');
ok(U.discovered(S0, L.lecture_halls) && U.discovered(S0, L.merryhews) && !U.discovered(S0, L.rooftop), '1.24.1 (owner): castle rooms and Mall shops show from the start; the Rooftop keeps D21');
let h;
let S = at(S0, 36, '10:00', 'Boathouse and Lake');
ok(pinsOf(S).includes(35) && pinsOf(S).includes(34), 'Willow Island and the Fishing House show after the boathouse');
S = at(S, 36, '14:00', 'Grassy Field and Hills');
ok(pinsOf(S).includes(9) && pinsOf(S).includes(10) && !pinsOf(S).includes(11), 'the Grassy Field opens the Observation Tower and the Old Hut, not the Clearing');

console.log('Lore heard in the story');
U.view.pin = 21; h = U.PANELS.map.render(set(S0, [['/World/Location', "Founder's Statue and Park"]]));
ok(/Lore and rumours \(0\/2\)/.test(h) && !/Faraway Laugh/.test(h), "no lore on the map until it is heard");
S = at(S0, 36, '10:00', 'Main Courtyard', { text: 'Etnie wiped her hands. "Want a Sunfizz? And don\'t start on the Faraway Laugh again."' });
ok(S.$ui.lore.includes('210') && S.$ui.lore.includes('342'), 'named in the narration: Sunfizz and the Faraway Laugh are heard');
S = at(S, 36, '10:30', 'Main Courtyard', { text: 'They walked the long corridor and heard applause from the hall.' });
ok(!S.$ui.lore.includes('206') && !S.$ui.lore.includes('346'), 'the same words in passing (lower case) do not count');
U.view.pin = 21; h = U.PANELS.map.render(S);
ok(/Lore and rumours \(1\/2\)/.test(h) && /Faraway Laugh/.test(h) && /1 more you have not heard yet/.test(h), 'the map lists what was heard and counts the rest');
// overheard at the place (Ambience Full): seeded, at most once a day
let heard = null, T = at(S0, 36, '06:30', 'Canteen');
for (let i = 0; i < 40 && !heard; i++) {
  T = at(T, 36 + Math.floor(i / 12), `${String(8 + (i % 12)).padStart(2, '0')}:${i % 2 ? '45' : '15'}`, i % 2 ? 'Canteen' : 'Commissary');
  if (T.$ui.amb && T.$ui.amb.beat && T.$ui.amb.beat.kind === 'lore') heard = T;
}
ok(heard && heard.$ui.lore.length === 1 && /^(The Lucky Roll|Sunfizz|Firetooth)\. /.test(heard.$ui.amb.beat.text) && heard.$ui.toasts.some(x => /^Heard at /.test(x)),
  `overheard in the Canteen or the Commissary: ${heard ? heard.$ui.amb.beat.text.slice(0, 60) : 'never'}`);
const now = read('src/worldbook/custom/content/505.txt');
ok(/AMB\.beat\.kind === 'lore' \? "Overheard \(weave it into this reply/.test(read('src/scripts/engine.js')),   // 1.48.0: <now>'s ambience lines are the engine's
   '<now> tells the narrator to weave the overheard story in');
S = at(set(S0, [['/$ui/ambience', 'off']]), 36, '10:00', "Founder's Statue and Park");
ok(S.$ui.lore.includes('223') && S.$ui.lore.includes('342'), 'with Ambience off, a place\'s stories come with the first visit');
ok(Object.keys(E.PLACE_LORE).length >= 20 && E.PLACE_LORE['mall'].some(x => x[1] === 'Oracle Shell'), 'PLACE_LORE: names as prose writes them');

console.log('Map view');
U.view.pin = 35; h = U.PANELS.map.render(at(S0, 36, '10:00', 'Boathouse and Lake'));
ok(/class="plab r b"[^>]*>Willow Island/.test(h) || /class="plab r"[^>]*>Willow Island/.test(h), 'Willow Island label grows inward from the right edge');
U.view.pin = 9; h = U.PANELS.map.render(at(S0, 36, '10:00', 'Grassy Field and Hills'));
ok(/class="plab b"[^>]*>Observation Tower/.test(h), 'the Observation Tower label sits below its pin at the top edge');
ok(/data-zoom="1"/.test(h) && /data-zoom="-1"[^>]*disabled/.test(h) && /class="map" style="width:100%"/.test(h), 'zoom buttons; at 100% zoom out is off');
U.PANELS.map.click({ dataset: { zoom: '1' } }, S0);
ok(/class="map" style="width:150%"/.test(U.PANELS.map.render(S0)), 'zoom in: the map is drawn at 150%');
const bar = read('src/ui/statusbar.html');
ok(!/\.band\.collapsed \.cta[,{]/.test(bar.replace(/\.band\.collapsed \.cta\{margin/, '')), 'the collapsed bracelet keeps "Create your student"');

console.log('Year floors (1.24.2, 1.24.3)');
{
  const Y2 = set(S0, [['/Player/Profile/Year', 2], ['/World/Location', 'Main Courtyard']]);
  U.view.pin = 1; U.view.floor = ''; let m = U.PANELS.map.render(Y2);
  ok(/data-floor="Floor 1" class="on"/.test(m) && /data-floor="Floor 3"/.test(m) && /data-floor="Floor 4"/.test(m), 'from outside the castle opens on Floor 1; Floors 3 and 4 are tabs');
  U.view.floor = 'Floor 3';
  const onF3 = []; for (let i = 0; i < 6; i++) { U.view.card = i; U.view.cardPin = '1|Floor 3'; const x = /data-loccard="([^"]+)"/.exec(U.PANELS.map.render(Y2)); if (x && !onF3.includes(x[1])) onF3.push(x[1]); }
  ok(['lecture_halls', 'study_rooms', 'storage_and_lockers', 'seminar_rooms'].every(id => onF3.includes(id)), `Floor 3 lists the Lecture Halls, Study Rooms, lockers and Seminar Rooms: ${onF3.join(', ')}`);
  U.view.card = onF3.indexOf('lecture_halls'); m = U.PANELS.map.render(Y2);
  ok(/<b>Second-year Lecture Halls<\/b>/.test(m) && /1 \/ \d+ · Second-year Lecture Halls|· Second-year Lecture Halls</.test(m) && /data-go="lecture_halls" data-gofl="Floor 3"/.test(m),
    '1.24.3: the card and the arrows name the Second-year Lecture Halls; Go here carries the floor');
  ok(/<b>Floor 3<\/b> · for Year 2 students · <span class="mine">your year<\/span>/.test(m) && /data-floor="Floor 3" class="on">Floor 3 <small>Year 2<\/small>/.test(m), 'the floor line and tab say whose floor it is (and that it is yours)');
  U.view.card = onF3.indexOf('storage_and_lockers'); ok(/<b>Second-year Lockers<\/b>/.test(U.PANELS.map.render(Y2)), 'the lockers are the Second-year Lockers');
  let said = ''; global.fillChat = t => { said = t; };
  const H = set(S0, [['/World/Location', 'Lecture Halls — Floor 4']]); U.view.floor = '';
  U.view.pin = 1; m = U.PANELS.map.render(H);
  ok(/data-floor="Floor 4" class="on"/.test(m), 'World.Location "Lecture Halls — Floor 4" opens Floor 4');
  const E132 = read('src/worldbook/content/132.txt');
  ok(/Floor 3: second-year Lecture Halls with their own Study Rooms/.test(E132) && /Floor 4: third-year Lecture Halls with their own Study Rooms/.test(E132), 'Campus Map lore: Study Rooms on Floors 3 and 4');
}
console.log('Year-floor locations in the engine (1.24.3)');
{
  const Ecl = new Function(read('src/scripts/engine.js') + '\nreturn { canonLocation };')().canonLocation;
  const C = { 'Second-year Lecture Halls': 'Lecture Halls — Floor 3', 'Lecture Halls, Floor 3': 'Lecture Halls — Floor 3', 'Floor 4 — Study Rooms': 'Study Rooms — Floor 4',
    'the lockers on the third-year floor': 'Storage and Lockers — Floor 4', 'Lecture Halls — Floor 3 — back row': 'Lecture Halls — Floor 3 — back row', 'Lecture Halls': 'Lecture Halls',
    'Fire Dormitory — lockers on the second-year corridor': 'Fire Dormitory — lockers on the second-year corridor', 'Seminar Rooms, Floor 3': 'Seminar Rooms, Floor 3' };
  const bad = Object.entries(C).filter(([a, b]) => Ecl(a) !== b).map(([a]) => `${a} -> ${Ecl(a)}`);
  ok(!bad.length, 'every way of writing a year floor becomes "<place> — Floor N"; another place named first keeps its own' + (bad.length ? ': ' + bad.join('; ') : ''));
  // attendance: a second-year in P1 Magic Theory (Lecture Halls) is present on any floor wording, absent in the Study Rooms
  const S2 = set(S0, [['/Player/Profile/Year', 2]]), MON = 35;
  const stay = loc => { let x = at(S2, MON, '07:50', loc); x = at(x, MON, '09:55', loc); return x; };
  const r = ['Second-year Lecture Halls', 'Lecture Halls, Floor 3', 'Floor 3 — Lecture Halls', 'Lecture Hall 3B'].map(stay);
  ok(r.every(x => x.$eng.wk.skipped === 0) && r.slice(0, 3).every(x => x.World.Location === 'Lecture Halls — Floor 3') && stay('Study Rooms — Floor 3').$eng.wk.skipped === 1,
    'attendance: present in the Lecture Halls on any floor wording (unknown room names get the benefit of the doubt), absent in the Study Rooms');
  const now = read('src/worldbook/custom/content/505.txt'), upd = read('src/worldbook/custom/content/502.txt');
  ok(/pk === 'lecture halls' \? ' — Floor ' \+ \(PY \+ 1\)/.test(read('src/scripts/engine.js')) && /NOW\.pres/.test(now) &&   // 1.47.0: the class line is the engine's ($ui.here)
     /"Lecture Halls — Floor 3" \(Floor 2 first-years, 3 second-years, 4 third-years\)/.test(upd), '<now> names the class floor; the update rules show the year-floor form');
}
ok(/addEventListener\('wheel', e => \{\s*const step/.test(read('src/ui/parts/20_map.js')) && !/if \(!e\.ctrlKey\) return/.test(read('src/ui/parts/20_map.js')), 'the mouse wheel zooms without Ctrl');
