// 1.13.0 (owner): the map follows the calendar (data/assets_manifest.json map_variants; 20_map.js mapFor). An event variant while
// the event is on (in its hours), then a season variant, then the default; the card crops keep the default underneath.
// 1.14.3: all 13 maps are in (10 events, Spring, Autumn, Winter); the default map is the Summer map.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
const U = new Function(src + '\nreturn { DATA, PANELS, view, mapFor, cropStyle, pinOf, CAL };')();
console.log('Map variants 1.13.0 / 1.14.3');
const MAN = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/assets_manifest.json'), 'utf8'));
const DEF = MAN.map, byId = id => (MAN.map_variants.find(v => v.id === id) || {}).file;
const STAR = byId('star_night'), SPRING = byId('spring'), AUTUMN = byId('autumn'), WINTER = byId('winter');
const at = (M, W, D, T) => ({ World: { Year: 1, Month: M, Week: W, Day: D, Time: T } });

// manifest sanity: every variant names a real event (with hours on that event's days) or a season, and a file
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
for (const v of MAN.map_variants) {
  const ev = v.event && U.CAL.EVENTS.find(e => e.t.startsWith(v.event));
  ok(v.file && /^map\/[^ ]+\.webp$/.test(v.file) && (ev || SEASONS.includes(v.season)), `variant ${v.id}: a file (no spaces) and a real event or season`);
  if (v.hours) ok(Object.keys(v.hours).every(d => ev && ev.d.includes(d)) && Object.values(v.hours).every(([a, b]) => a >= 0 && b <= 24 && a < b), `variant ${v.id}: hours on the event's own days`);
}
ok(MAN.map_variants.length === 13 && MAN.map_variants.filter(v => v.event).length === 10 && SPRING && AUTUMN && WINTER && !byId('summer'),
  '13 variants: 10 events and Spring, Autumn, Winter (the default map is Summer)');
ok(STAR === 'map/halvard_spring_starnight.webp' && /f42990c5/.test(MAN.base_url), 'the owner\'s Star Night map, at the pinned commit with all 13 maps');
ok(byId('graduation') === 'map/halvard_winter_graduation.webp', 'Graduation map path matches the asset repository');

// Star Night: M1 W3 Sat 18:00 to Sun 06:00; outside it the season's map
ok(U.mapFor(at(1, 3, 'Sat', '20:00')) === STAR, 'Saturday night of Star Night: the star map');
ok(U.mapFor(at(1, 3, 'Sun', '03:30')) === STAR, 'until dawn on Sunday');
ok(U.mapFor(at(1, 3, 'Sat', '12:00')) === SPRING, 'Saturday afternoon: the spring map');
ok(U.mapFor(at(1, 3, 'Sun', '07:00')) === SPRING, 'Sunday after dawn: the spring map');
ok(U.mapFor(at(2, 3, 'Sat', '20:00')) === SPRING, 'another spring Saturday night: the spring map');
ok(U.mapFor(undefined) === SPRING, 'no state reads as Month 1: the spring map');

// seasons, and events over them
ok(U.mapFor(at(5, 1, 'Mon', '09:00')) === DEF, 'summer: the default map');
ok(U.mapFor(at(8, 1, 'Mon', '09:00')) === AUTUMN && U.mapFor(at(11, 1, 'Mon', '09:00')) === WINTER, 'autumn and winter maps follow the calendar month');
ok(U.mapFor(at(11, 4, 'Sun', '15:00')) === byId('graduation') && U.mapFor(at(11, 4, 'Sun', '09:00')) === WINTER, 'Graduation afternoon: its map; the morning ceremony: the winter map');
ok(U.mapFor(at(7, 3, 'Wed', '10:00')) === byId('thinning') && U.mapFor(at(7, 1, 'Wed', '10:00')) === AUTUMN, 'The Thinning week: its map; another autumn week: the autumn map');
ok(U.mapFor(at(4, 2, 'Tue', '20:00')) === byId('crowning_night') && U.mapFor(at(4, 2, 'Tue', '10:00')) === DEF, 'Crowning Day: the fireworks map at night only');
const saved = U.DATA.assets.variants;
U.DATA.assets.variants = [{ id: 'spring0', file: 'map/spring0.webp', season: 'Spring' }, ...saved];
ok(U.mapFor(at(1, 3, 'Sat', '21:00')) === STAR && U.mapFor(at(2, 1, 'Mon', '09:00')) === 'map/spring0.webp', 'an event map beats a season map listed before it');
U.DATA.assets.variants = saved;

// card crops layer the variant over the default; the big map falls back to the default through data-alt
const pin = U.pinOf('mall'), night = at(1, 3, 'Sat', '20:00');
const cs = U.cropStyle(pin, night);
ok(cs.indexOf(STAR) > -1 && cs.indexOf(DEF) > cs.indexOf(STAR), 'a card crop shows the variant over the default');
ok(!U.cropStyle(pin, at(5, 1, 'Mon', '12:00')).includes(STAR) && !U.cropStyle(pin, at(5, 1, 'Mon', '12:00')).split(';')[0].includes(','), 'summer: the default alone');
let S = initState();
S = applyPatch(S, [{ op: 'replace', path: '/World/Month', value: 1 }, { op: 'replace', path: '/World/Week', value: 3 }, { op: 'replace', path: '/World/Day', value: 'Sat' }, { op: 'replace', path: '/World/Time', value: '20:00' }]);
U.view.panel = 'map';
const html = U.PANELS.map.render(S);
ok(html.includes(STAR) && /data-alt="[^"]*halvard_map\.webp"/.test(html), 'the map panel shows the star map, with the default as its fallback');
