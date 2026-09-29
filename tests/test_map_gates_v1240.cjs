// 1.24.0 (owner playtest): places behind a gate, the castle entrance, lore heard in the story, map labels at the edge, zoom,
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
ok(p.includes(1) && !p.includes(35) && !p.includes(11) && !p.includes(9) && !p.includes(10) && p.includes(12) && p.includes(37) && p.includes(36),
  'at the start: the castle pin shows; Willow Island, the Clearing, the Observation Tower and the Old Hut do not');
ok(!U.discovered(S0, L.lecture_halls) && !U.discovered(S0, L.merryhews) && U.discovered(S0, L.mall), 'castle rooms and Mall shops hidden, the Mall itself known');
U.view.pin = 1; let h = U.PANELS.map.render(S0);
ok(/data-gocastle="1"/.test(h) && !/data-loccard=/.test(h), 'the castle pin shows the castle entrance card before the player has been inside');
let S = at(S0, 36, '10:00', 'Boathouse and Lake');
ok(pinsOf(S).includes(35), 'Willow Island shows after the boathouse');
S = at(S, 36, '12:00', 'Castle — entrance hall');
ok(S.$ui.discovered.includes('Castle') && U.discovered(S, L.lecture_halls) && !U.discovered(S, L.rooftop), 'entering the castle opens its halls; the Rooftop keeps D21');
S = at(S, 36, '13:00', "The Mall — Merryhew's");
ok(U.discovered(S, L.quillfeathers), 'the Mall opens its shops');
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
ok(/AMB\.beat\.kind === 'lore' \? "Overheard \(weave it into this reply/.test(now), '<now> tells the narrator to weave the overheard story in');
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
