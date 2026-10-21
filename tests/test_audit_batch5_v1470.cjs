// 1.47.0 (audit batch 5): the campus as an Area (3.2), the area {{user}} is in (3.3) and one whereabouts model (3.8).
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn {toAbs, areaNow, awayIn, whereabouts, presenceNow, PRESENCE, breakOf};')();
const now = S => ejs.render(JSON.parse(read('dist/Eldrasil_Halvard.json')).data.character_book.entries.find(e => e.id === 505).content, { getvar: k => _.get({ stat_data: S }, k) });
const op = (p, value) => ({ op: 'replace', path: p, value });

console.log('Whereabouts: <now> presence as 1.46.0 wrote it');
// tests/fixtures/presence_1460.json: the presence lines 1.46.0's <now> (its own EJS rules) gave for each scenario; the same states now
// get them from the engine ($ui.here). The full <now> of all 360 was compared byte for byte when the rules moved (CHANGELOG 1.47.0).
const { scenario, N } = require('./fixtures/presence_scenarios.cjs');
const REC = JSON.parse(read('tests/fixtures/presence_1460.json'));
const PRES = /^(Students |Study Hall|Student Council (meets|members)|Likely around|Moved indoors|Club time|Regulars here|Your class now|Free period|Presence:)/;
const bad = [];
// 1.52.0: with the NPC routines off (Features), as before them
// 1.83.0: on a break day (the Mid-Year Break) most students have gone home (shared.js breakStays): those scenarios may only lose names
const brk = [], fd = [];
for (let i = 0; i < N; i++) {
  const sc = scenario(i, E, ['npc_routines']), got = now(sc).split('\n').filter(l => PRES.test(l));
  if (E.breakOf(sc.World)) {
    brk.push(i);
    const same = (l, r) => l === r || (l.split(': ')[0] === r.split(': ')[0] && l.split(': ').slice(1).join(': ').replace(/no regulars on record/, '').split(/,\s*/).filter(Boolean).every(w => r.includes(w)));
    if (got.length !== REC[i].length || got.some((l, k) => !same(l, REC[i][k]))) bad.push(i);
    continue;
  }
  // 1.86.0: Founder Day has no classes (lore 25, calendar noclass): its timetable, the Saturday club block included, is suspended
  if (/Academy Founder Day/.test(sc.World._Event_today || '') && /Timetable suspended/.test(sc.World._Period || '')) {
    fd.push(i);
    if (got.some(l => /^(Students are at their clubs|Club time)/.test(l))) bad.push(i);
    continue;
  }
  if (JSON.stringify(got) !== JSON.stringify(REC[i])) bad.push(i);
}
ok(brk.length > 0, `the break-day scenarios (${brk.join(', ')}) only lose the students who went home`);
ok(REC.length === N && !bad.length, `every scenario's presence block is the same (${N} scenarios: places, periods, Study Hall, clubs, the election, the Council, weather, flu, statuses, graduates, Settings)` + (bad.length ? ': differs in ' + bad.slice(0, 5).join(', ') : ''));
const lines = REC.flat();
ok(['Likely around', 'Students are in class', 'Students are at Study Hall', 'Your class', 'Free period', 'Club time', 'Moved indoors', 'Regulars here', 'Students vote', 'Student Council', 'Presence: after']
  .every(k => lines.some(l => l.startsWith(k))), 'the scenarios reach every kind of presence line');
const tmpl = read('src/worldbook/custom/505.template.ejs');
ok(!/REG|TEACH|CLUBV|OUTD/.test(tmpl.replace(/\/\/.*$/gm, '')) && /NOW\.pres/.test(tmpl), '<now> no longer carries the presence rules or their data: it prints the engine\'s lines ($ui.now.pres since 1.48.0)');
ok(!/whereabouts/.test(read('src/ui/statusbar.html')) && /function whereabouts/.test(read('src/scripts/ui.js')), 'the whereabouts code goes to the engine and the panels, not the bracelet');

console.log('One model for one NPC');
const S0 = initState();
const at = (W, extra = {}) => { const S = initState(); S.World = { ...S.World, ...W }; Object.assign(S.Campus_State, extra); S.$eng.abs = E.toAbs(S.World); const A = Schema.parse(S); runEngine(A); return Schema.parse(A); };
const P1 = at({ Month: 2, Week: 1, Day: 'Mon', Time: '08:30', Location: 'Canteen' }, { NPC_status: { Irene: 'away visiting family' }, Graduated: ['Castor'] });
const w = id => E.whereabouts(E.PRESENCE, E.presenceNow(P1), id);
ok(/^in class until /.test(w('Etnie').busy[0]) && w('Irene').st === 'away visiting family' && w('Castor').gone === 'graduated', 'a student in a class period is in class; a status and a graduate are on record');
const tch = Object.keys(E.PRESENCE.teach).find(id => w(id).busy);
ok(tch && /^teaching /.test(w(tch).busy[0]) && w(tch).busy[1].length, 'the period\'s teacher is teaching, and counts as here at the venue');

console.log('The area {{user}} is in');
ok(E.areaNow(S0) === 'campus' && !E.awayIn(S0), 'a new chat is on the campus');
const off = _.cloneDeep(S0); off.World.Location = 'Riverside Inn';
ok(E.areaNow(off) === '' && !E.awayIn(off), 'off the grounds on an ordinary day: no area, not away');
const sky = _.cloneDeep(S0); sky.World.Location = 'Airship — Common Room';
ok(E.areaNow(sky) === 'airship' && E.awayIn(sky), 'aboard the airship: an outside area, away');

console.log('The campus as an Area: walks');
const W0 = (S, ops, text) => applyPatch(S, ops, { text: text || '' });
let C = W0(initState(), [op('/Player/Profile/Dorm', 'Fire'), op('/World/Month', 2), op('/World/Week', 1), op('/World/Day', 'Sun'), op('/World/Time', '10:00'), op('/World/Location', 'Canteen')]);
const CA = () => C.$ui.area.campus, rates = JSON.parse(read('data/campus.json'));
const walks = () => ((C.$ui.now.walk || [])[0] || '').replace(/^.*?\): /, '').split(/\.(?: |$)/)[0].split(', ');   // 1.48.0: <now>'s line ($ui.now.walk)
ok(CA().on && CA().at === 'canteen' && walks().length >= rates.walks_listed && walks().some(w => /^Fire Dormitory \d+$/.test(w)) && /Close by \(Castle\): Main Library 1/.test(C.$ui.now.walk[0]),
  'on the grounds: the walks to the nearest map pins, the own dorm always among them, and the places close by');
const st0 = C.Player.Vitals.Stamina;
C = W0(C, [op('/World/Time', '10:01'), op('/World/Location', 'Main Library')]);
ok(CA().owe === 0 && C.Player.Vitals.Stamina === st0 && !/Walked/.test(C._Log.join(' ')), 'a minute\'s walk in the castle: nothing owed, no stamina, no log');
C = W0(C, [op('/World/Time', '10:06'), op('/World/Location', 'Boathouse and Lake')]);
const lake = CA().owe;
ok(lake > 20 && /Walked Main Library → Boathouse and Lake: \d+ min on foot, -3% stamina; \d+ min of the way are still ahead/.test(C._Log.slice(-1)[0]) && C.Player.Vitals.Stamina < st0,
  'a long walk the clock has not spent: the minutes are owed, and it costs stamina (5% an hour)');
ok(/Walks from here \(minutes on foot[^\n]*Fishing House 3/.test(now(C)) && new RegExp(`Still on the way: ${lake} min of the last walk`).test(now(C)), '<now>: the walks from here and the minutes still owed');
C = W0(C, [op('/World/Time', '10:16')]);
ok(CA().owe === lake - 10, 'time that passes pays the walk off');
C = W0(C, [op('/World/Time', '10:20')], 'Two hours later, she sits by the water.');
ok(!(C.$ui.missed || []).some(x => /moves time on/.test(x)), 'R3 is not doubled while <now> already says the walk is owed');
C = W0(C, [op('/World/Time', '11:30')]);
ok(CA().owe === 0 && !/Still on the way/.test(now(C)), 'paid off: nothing owed');
C = W0(C, [op('/World/Time', '11:31'), op('/World/Location', 'Fire Dormitory — Common Rooms')]);
C = W0(C, [op('/World/Time', '12:20')], 'She walks into the Common Rooms and drops onto a sofa.');
ok(CA().at === 'fire_dormitory' && !(C.$ui.missed || []).some(x => /arriving at/.test(x)), 'R4 reads the campus parser: the Common Rooms are in {{user}}\'s own dorm');
C = W0(C, [op('/World/Time', '12:21')], 'She walks into the Gymnasium.');
ok((C.$ui.missed || []).some(x => /arriving at Gymnasium, but Location is Fire Dormitory/.test(x)), 'R4 still catches a place Location does not show');
const fl = W0(W0(C, [op('/World/Time', '12:30'), op('/World/Location', 'Lecture Halls — Floor 2')]), [op('/World/Time', '13:30'), op('/World/Location', 'Lecture Halls — Floor 4')]);
ok(/Walked Lecture Halls → Lecture Halls/.test(fl._Log.join(' ')) === false && fl.$ui.area.campus.at === 'lecture_halls', 'two floors up in the Lecture Halls is a short climb, not a walk on record');
ok(!applyPatch(C, [op('/World/Location', 'Riverside Inn')]).$ui.area.campus.on, 'off the grounds the campus area is off');

console.log('Whereabouts for Next plans, appointments, initiative and the areas');
let N0 = initState({ etnie: true });
N0 = applyPatch(N0, [op('/World/Time', '12:00'), op('/Bonds/Etnie/Next', { What: 'Reading', Where: 'the library', Until: 'M1 W1 Mon 18:00' })]);
N0 = applyPatch(N0, [op('/World/Time', '12:30'), op('/World/Location', 'Main Library')]);
ok(N0.$ui.maybe.some(([id]) => id === 'Etnie'), 'a Next plan at this place (written "the library") puts them in "May be here"');
const N1 = applyPatch(N0, [op('/World/Time', '12:35'), op('/Campus_State/NPC_status', { Etnie: 'in the hospital wing, unconscious' })]);
ok(!N1.$ui.maybe.some(([id]) => id === 'Etnie'), 'a status that keeps them away keeps them out of "May be here"');
const src = read('src/scripts/engine.template.js');
ok(/!npcOut\(PV, S, id\) && !S\.Scene\.Present\[id\]/.test(src) && /meetOne\('student', M\.halvard, id => [^\n]*!npcOut\(PV, S, id\)/.test(src), 'NPC initiative and the Halvard students met in Sunreach Bay ask the same whereabouts (not off sick, not away)');
