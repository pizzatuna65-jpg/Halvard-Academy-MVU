// 1.16.0 (owner-approved planning/DRAFT_dynamic_ambience.md): ambience (crowd, light, cue), seeded beats, the secret uncanny roll,
// the ten new ghost stories, Tilly's journal and the Scene Engine clause.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT, loreOf } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { fromAbs, EVENTS };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const entry = uid => loreOf((card.character_book.entries.find(e => e.id === uid) || {}).content || '');   // 1.60.0: without the overlay
const render = (uid, S) => ejs.render(entry(uid), { getvar: k => _.get({ stat_data: S }, k) });
const DAY = 1440;
const at = (S, d, hhmm, loc, extra = []) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : []), ...extra]); };
const set = (S, ops) => applyPatch(S, ops.map(([p, v]) => ({ op: 'replace', path: p, value: v })));
const S0 = set(initState(), [['/$eng/seed', 7], ['/$ui/wxfx', 'off'], ['/Player/Profile/Dorm', 'Fire'], ['/$ui/built', true], ['/$eng/auth', 'builder']]);
const amb = S => S.$ui.amb || {};
const TUE = 36;   // M2 W2 Tue, an ordinary class day

console.log('Crowd');
const go = (d, hhmm, loc, from = S0) => at(at(from, d, '06:30', 'Canteen'), d, hhmm, loc);
ok(amb(go(TUE, '09:00', 'Lecture Halls')).crowd === 'packed', 'Lecture Halls during P1 on a class day: packed');
ok(amb(go(TUE, '09:00', 'Main Library')).crowd === 'quiet', 'the Main Library during P1: quiet');
ok(amb(go(TUE, '12:30', 'Canteen')).crowd === 'packed', 'the Canteen at lunch: packed');
ok(amb(go(57, '14:00', 'Main Library')).crowd === 'packed', 'the Main Library in exam week: packed');
const late = at(at(go(TUE, '19:30', 'Courtyards'), TUE, '20:30', 'Courtyards'), TUE, '21:00', 'Fire Dormitory, Common Room');
ok(amb(at(go(TUE, '19:30', 'Courtyards'), TUE, '20:30', 'Courtyards')).crowd === 'empty' && amb(late).crowd === 'busy', 'after curfew: the courtyard empty, the common room busy');
ok(amb(go(123, '09:30', 'Arbiter Hall')).crowd === 'packed', 'Results day assembly: the Arbiter Hall packed');
ok(amb(go(134, '11:00', 'Canteen')).crowd === 'empty', 'Mid-Year Break: empty');

console.log('Light');
const W = (m, w) => ((m - 1) * 4 + (w - 1)) * 7;   // day number of M? W? Mon in Year 1
ok(amb(go(W(10, 2), '16:40', 'Gardens')).light === 'dusk' && amb(go(W(10, 2), '17:10', 'Gardens')).light.startsWith('dark'), 'December (M10): dusk at 16:40, dark by 17:10');
ok(amb(go(W(4, 2) + 1, '20:15', 'Gardens')).light === 'dusk' && amb(go(W(4, 2) + 1, '12:00', 'Gardens')).light === 'daylight', 'June (M4): still dusk at 20:15, daylight at noon');
ok(amb(go(W(10, 2), '18:00', 'Main Library')).light === 'lamps lit' && amb(go(W(10, 2), '11:00', 'Main Library')).light === 'daylight through the windows', 'indoors: lamps after dark, daylight by day');
ok(/dusk \(about 18:30\): the Bell Tower rings/.test(JSON.stringify(E.EVENTS.find(e => /Warding Rite/.test(e.t)).s)), 'Warding Rite: dusk about 18:30 (the sun table)');

console.log('Cue and beats');
const a1 = go(TUE, '15:00', 'Gardens');
ok(amb(a1).cue && /Ambience at Gardens: /.test(render(505, a1)), 'arriving: a crowd, the light and a cue type in <now>');
ok(!at(a1, TUE, '15:10', 'Gardens').$ui.amb, 'staying ten minutes in the same block: no new line');
let v = S0; const cues = [];
for (let d = 0; d < 3; d++) { v = at(v, TUE + d, '15:00', 'Gardens'); cues.push(amb(v).cue); v = at(v, TUE + d, '16:30', 'Canteen'); }
ok(new Set(cues).size === 3, `the same place gets a different cue type each visit within three days (${cues.join(' / ')})`);
ok(JSON.stringify(go(TUE, '15:00', 'Gardens').$ui.amb) === JSON.stringify(amb(a1)), 'the same update gives the same ambience (swipe-safe)');
let beats = { 1: 0, 3: 0 }, seen = [];
for (const f of [1, 3]) { let s = set(S0, [['/$ui/tune', { amb_freq: f }]]);
  for (let i = 0; i < 40; i++) { s = at(s, TUE + Math.floor(i / 8), ['09:00', '10:30', '12:30', '14:00', '15:30', '16:45', '18:00', '19:15'][i % 8], ['Canteen', 'Courtyards', 'Main Library', 'The Mall', 'Gardens'][i % 5]); if (amb(s).beat) { beats[f]++; seen.push(amb(s).beat.text); } } }
ok(beats[3] > beats[1] && beats[1] > 0, `beats: Rare ${beats[1]}, Often ${beats[3]} in 40 moves`);
const bat = go(TUE, '15:00', 'Gardens', set(S0, [['/Battle/Active', true]]));
ok(!amb(bat).beat, 'no beat during a battle');
ok(!amb(go(TUE, '15:00', 'Gardens', set(S0, [['/$ui/ambience', 'texture']]))).beat && amb(go(TUE, '15:00', 'Gardens', set(S0, [['/$ui/ambience', 'texture']]))).cue, 'Texture: the line without beats');
const off = go(TUE, '15:00', 'Gardens', set(S0, [['/$ui/ambience', 'off']]));
ok(!off.$ui.amb && !/Ambience at/.test(render(505, off)) && !/- Ambience:/.test(render(504, off)) && /- Ambience:/.test(render(504, S0)), 'Off: no line and no rule');

console.log('Uncanny');
let u = at(S0, W(10, 1), '17:00', 'Boathouse and Lake'), hit = null, n = 0;
for (let i = 0; i < 400 && !hit; i++) { u = at(u, W(10, 1) + Math.floor(i / 6), ['17:00', '17:40', '18:20', '19:00', '19:30', '19:55'][i % 6], i % 2 ? 'Boathouse and Lake' : 'Fishing House'); n++; if (amb(u).unc) hit = u; }
ok(hit && amb(hit).unc.id === 'crying_water', `the lake after dark: the Crying on the Water in time (${n} updates)`);
ok(hit && /Uncanny \(narrator only, secret; The Crying on the Water\)/.test(render(505, hit)) && !hit.$ui.toasts.some(x => /crying|uncanny/i.test(x)) && !hit.Journal.some(x => /crying|uncanny/i.test(x)), 'secret: only a narrator line in <now>, no toast or Journal');
let again = hit, twice = false;
if (hit) {
  const d0 = hit.$eng.amb.unc.last.crying_water, wk = hit.$eng.amb.unc.w;
  for (let d = d0 + 1; Math.floor(d / 7) === wk; d++) for (const [hh, loc] of [['18:00', 'Swimming Pool'], ['19:00', 'Grassy Field and Hills'], ['19:30', 'Old Hut']]) {
    again = at(again, d, hh, loc); if (amb(again).unc) twice = true;
  }
}
ok(hit && !twice, 'at most one uncanny moment a week');
const day = go(W(10, 1), '12:00', 'Boathouse and Lake');
ok(!amb(day).unc, 'no uncanny moment by day at the lake');

console.log('Lore, Tilly, preset');
const GS = ['The Thirteenth Stroke', 'The Night Swimmer', 'The Walking Lantern', 'Breath on the Glass', 'When the Pens Go Quiet', 'The Faraway Laugh', 'The Polite Walker', 'The Last Bed', 'The Other Climber', 'The Applause'];
ok(GS.every((t, i) => entry(337 + i).startsWith(`[${t}]`) && /Where: .*\nStory: .*\nRule: .*\nKnown for: /.test(entry(337 + i))), 'ten new Ghost Story entries (uid 337-346)');
ok(/Home of the Night Swimmer story/.test(entry(74)) && /Home of the Last Bed story/.test(entry(82)) && /home of the Polite Walker story/.test(entry(132)), 'each place names its story');
ok(/the night student, the thirteenth stroke, .* the applause\./.test(entry(0)), 'World Index lists the new stories');
ok(/Halvard Unexplained has a page for every newer story too \(the Thirteenth Stroke, .*the Applause\)/.test(entry(323)), "Tilly's journal knows them");
const A = JSON.parse(read('data/ambience.json'));
ok(A.uncanny_chance === 5 && A.uncanny.length === 17 && !A.uncanny.some(x => x.id === 'walking_lantern' && x.x2), 'uncanny: 5%, 17 stories, the Walking Lantern not tied to Remembrance Day');
// 1.68.0: the preset is RF 2.2.1.3 as it ships (its Scene Engine adds detail only when it changes something; its Scent Killswitch
// keeps smells to food, a strong source close by or a rite), so the card's rule 504 alone asks for the cue, and no cue names a smell
ok(!/one light touch of the setting/.test(read('dist/Realistic_Frankenstein_2_2_1_3_Eldrasil.json')) && /Ambience: keep the prose consistent with <now>'s Ambience line/.test(read('src/worldbook/custom/content/504.txt')), 'the ambience cue is the card\'s rule (504), not a preset clause');
ok(![...A.cues, ...A.beats].some(x => /smell|scent|whiff|odou?r|aroma/i.test(x[2])), '1.68.0: no cue or beat names a smell (a named smell primes Gemini)');
