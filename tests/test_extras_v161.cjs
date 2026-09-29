// 1.6.1 (Batch D, planning/DRAFT_batch_plan.md): N5 Extras (characters the narrator invented: counted each time they enter the
// scene, asked for a record from their second appearance, shown in <cast>, alias and case merge, cap 20 with a hidden archive
// that gives a record back, the player's Keep pin). N4 Campus_State.Events { Text, Updated } with stale events in <now>.
// N6 campus phases (the framework; the phase lines are canon and stay empty until the owner approves them).
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { keepOps, nbJournal };')();
console.log('Extras, campus events and phases 1.6.1');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const E = uid => card.character_book.entries.find(e => e.id === uid);
const gv = S => k => _.get({ stat_data: S }, k);
const R = (uid, S) => ejs.render(E(uid).content, { getvar: gv(S) });
const here = (o) => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { Note: v }])) });
let S = initState();
const at = (time, ops, day) => { S = applyPatch(S, [...(day ? [{ op: 'replace', path: '/World/Day', value: day }] : []), { op: 'replace', path: '/World/Time', value: time }, ...ops]); return S; };

// ---- N5: first appearance, second appearance, the record
at('09:00', [here({ 'Marta Bellweather': 'counting receipts' })]);
ok(S.$eng.xs['marta bellweather'].n === 1 && !S.$ui.cast.xnew.length, 'first appearance: counted, no record asked for');
ok(!/<cast>/.test(R(509, S)) && !/final_cast_gate/.test(R(510, S)), 'a one-off invented character: no <cast>, no gate');
at('09:20', [here({ 'Marta Bellweather': 'still counting' })]);
ok(S.$eng.xs['marta bellweather'].n === 1, 'staying in the scene is not a new appearance');
at('10:00', [here({})]);
at('11:00', [here({ Marta: 'at the till again' })]);
ok(S.$eng.xs['marta bellweather'].n === 2 && S.$ui.cast.xnew.includes('Marta'), 'back later (by first name): the second appearance of the same person');
let t = R(509, S);
ok(/Seen before, with no Extras record yet: Marta\. Add their record in this reply's update/.test(t) && /final_cast_gate/.test(R(510, S)), '<cast> asks for the record; the gate is on with only an invented character present');
at('11:05', [{ op: 'replace', path: '/Extras/Marta Bellweather', value: { Who: 'Commissary clerk, 50s, Human', Looks: 'grey bun, ink-stained cuffs, half-moon glasses', Manner: 'brisk, counts twice, softens for first-years', Calls_user: 'dear', Voice: '"Sign here, dear. No, the other here."' } }]);
ok(S.Scene.Present['Marta Bellweather'] && !S.Scene.Present.Marta, 'Scene.Present "Marta" becomes the recorded full name');
t = R(509, S);
ok(/\[Marta Bellweather\] Commissary clerk, 50s, Human Looks: grey bun, ink-stained cuffs, half-moon glasses\. Manner: brisk, counts twice, softens for first-years\. Calls \{\{user\}\} "dear"\. Voice: "Sign here, dear\. No, the other here\."/.test(t), '<cast> shows the Extras card');
ok(!/Seen before, with no Extras record/.test(t) && S.$ui.cast.extras[0] === 'Marta Bellweather', 'recorded: no longer asked for');
ok(/final_cast_gate/.test(R(510, S)) && /<cast> sheet or Extras card/.test(R(510, S)), 'the gate names Extras cards');
at('11:10', [{ op: 'replace', path: '/Extras/marta bellweather', value: { Looks: 'grey bun, a new green scarf' } }]);
ok(Object.keys(S.Extras).join() === 'Marta Bellweather' && S.Extras['Marta Bellweather'].Looks === 'grey bun, a new green scarf' && S.Extras['Marta Bellweather'].Manner === 'brisk, counts twice, softens for first-years', 'a write under another case merges into the record (its new field wins, the rest stays)');
at('11:15', [{ op: 'replace', path: '/Extras/Irene', value: 'Council President' }]);
ok(!S.Extras.Irene && /Irene is a roster character/.test(S._Log.join(' ')), 'a roster character is never an Extra');
at('11:20', [{ op: 'replace', path: '/Extras/Old Tom', value: 'Boatman at the lake' }]);
ok(S.Extras['Old Tom'].Who === 'Boatman at the lake' && S.Extras['Old Tom'].Keep === false, 'a bare string is the Who');

// ---- cap 20, archive, Keep
at('12:00', [here({}), { op: 'replace', path: '/Extras/Marta Bellweather/Keep', value: true }]);
for (let i = 0; i < 21; i++) at(`${13 + Math.floor(i / 6)}:${String((i % 6) * 10).padStart(2, '0')}`, [{ op: 'replace', path: `/Extras/Extra ${String(i).padStart(2, '0')}`, value: { Who: 'student ' + i } }]);
ok(Object.keys(S.Extras).length === 20 && S.Extras['Marta Bellweather'] && !S.Extras['Old Tom'] && S.$ui.xold['Old Tom'], 'at most 20: the least recently seen leave first (into the archive), a kept one stays: ' + Object.keys(S.$ui.xold).join(', '));
at('17:00', [here({ 'Old Tom': 'mending a net' })]);
ok(S.Extras['Old Tom'] && S.Extras['Old Tom'].Who === 'Boatman at the lake' && !S.$ui.xold['Old Tom'] && S.$ui.cast.extras.includes('Old Tom'), 'back again: the archived record returns');
ok(Object.keys(S.Extras).length === 20 && S.Extras['Marta Bellweather'], 'the cap holds, and the kept one is still there');

// the player's pin (cast strip): a hidden tool patch
let ops = U.keepOps(S, 'Old Tom');
ok(ops.length === 1 && ops[0].path === '/Extras/Old Tom/Keep' && ops[0].value === true, 'Keep toggles the record');
S = applyPatch(S, ops, { mvu: true });
ok(S.Extras['Old Tom'].Keep === true && applyPatch(S, U.keepOps(S, 'Old Tom'), { mvu: true }).Extras['Old Tom'].Keep === false, 'pinned, then let go');
at('17:10', [here({ 'Old Tom': 'mending a net', 'Pell Hatchard': 'selling bait' })]);
ops = U.keepOps(S, 'Pell Hatchard');
S = applyPatch(S, ops, { mvu: true });
ok(S.Extras['Pell Hatchard'] && S.Extras['Pell Hatchard'].Keep && S.$ui.cast.xnew.includes('Pell Hatchard'), 'pinning someone without a record creates it; <cast> asks the narrator to describe them');
const bar = rd('src/ui/statusbar.template.html'), ui = rd('src/scripts/ui.template.js');
ok(/data-keep="/.test(bar) && /eventEmit\('eldrasil:keep'/.test(bar) && /eventOn\('eldrasil:keep'/.test(ui) && /commitSetting\(ops/.test(ui), 'the cast strip pin writes through the player-tool message');

// ---- 502 rules
const rules = ejs.render(E(502).content, { getvar: gv(S) });
ok(/When <cast> asks \(their second appearance\), add their record/.test(rules) && /Never change Keep \(the player's\)/.test(rules), '502: when to write an Extras record, Keep is the player\'s');
ok(/Naming \(the roster's own patterns\)/.test(rules) && /Never give a new character a roster character's first or family name/.test(rules), '502: the naming guide');
ok(/Events \{"<short title>": \{"Text": "one-line summary"\}\}/.test(rules), '502: Events are { Text }');

// ---- N4: campus events
S = initState();
at('09:00', [{ op: 'replace', path: '/Campus_State/Events/Library flood', value: 'The west wing is closed after a burst pipe.' }]);
let ev = S.Campus_State.Events['Library flood'];
ok(ev.Text === 'The west wing is closed after a burst pipe.' && ev.Updated === 'M1 W1 Mon' && ev.$d === 0, 'a bare string becomes { Text, Updated } dated today');
at('09:00', [], 'Wed');
ok(S.Campus_State.Events['Library flood'].Updated === 'M1 W1 Mon' && !S.$ui.stale.length, 'no news: the date stays; not stale yet');
at('09:00', [{ op: 'replace', path: '/Campus_State/Events/Library flood/Updated', value: 'M1 W1 Wed' }], 'Thu');
ok(S.Campus_State.Events['Library flood'].Updated === 'M1 W1 Mon', 'Updated is the engine\'s');
at('09:00', [{ op: 'replace', path: '/World/Week', value: 2 }], 'Wed');
ok(S.$ui.stale.length === 1 && S.$ui.stale[0][0] === 'Library flood', 'no news for over a week: stale');
let now = R(505, S);
ok(/Campus events with no news for over a week \(the world moves on without \{\{user\}\}[^)]*\): Library flood \(last news M1 W1 Mon, last week\)/.test(now), '<now> asks for it to move on, with its age');
at('10:00', [{ op: 'replace', path: '/Campus_State/Events/Library flood', value: { Text: 'The west wing reopens on Friday.' } }]);
ok(S.Campus_State.Events['Library flood'].Updated === 'M1 W2 Wed' && !S.$ui.stale.length && !/Campus events with no news/.test(R(505, S)), 'news re-dates it');
const nb = U.nbJournal(S);
ok(/<dt>Library flood<\/dt><dd>The west wing reopens on Friday\.<span class="sub"> · M1 W2 Wed<\/span><\/dd>/.test(nb), 'the notebook shows the news and its date');
const nbOld = U.nbJournal({ Campus_State: { Events: { Fair: 'Stalls on the lawn.' } }, $ui: {} });
ok(/<dd>Stalls on the lawn\.<\/dd>/.test(nbOld), 'the notebook still reads a bare string');

// a save from 1.6.0 (Events were strings)
const old = JSON.parse(rd('tests/fixtures/saves/save_1.6.0.json'));
const was = old.Campus_State.Events['Library flood'];
const P = Schema.parse(_.cloneDeep(old));
ok(typeof was === 'string' && P.Campus_State.Events['Library flood'].Text === was, 'a 1.6.0 save: the event\'s text is kept as its Text');
const S2 = applyPatch(P, [{ op: 'replace', path: '/World/Time', value: '23:00' }]);
ok(S2.Campus_State.Events['Library flood'].Text === was && /^M\d+ W\d \w{3}$/.test(S2.Campus_State.Events['Library flood'].Updated), 'and it is dated on the first update');

// ---- N6: campus phases (framework; empty data until the owner approves the lines)
ok(JSON.parse(rd('data/campus_phases.json')).phases.length === 0, 'data/campus_phases.json is empty (canon comes through the canon waves)');
{
  const src = rd('src/scripts/engine.js').replace(/const PHASES = \[[^\n]*\];/, 'const PHASES = [{"id":"exams","from":"M1 W2 Mon","to":"M1 W3 Fri","line":"Exam fortnight: the campus is quiet and short-tempered."}];');
  ok(src.includes('"id":"exams"'), 'engine source patched for the test');
  const run = new Function(src + '\nreturn runEngine;')();
  const T = Schema.parse(_.cloneDeep(S)); run(T, S, '');
  ok(T.$ui.phase && T.$ui.phase.id === 'exams', 'a phase covering today is active');
  ok(/Campus phase: Exam fortnight: the campus is quiet and short-tempered\./.test(R(505, Schema.parse(T))), '<now> prints its line');
  const T2 = Schema.parse(_.cloneDeep(S)); T2.World.Week = 4; run(T2, S, '');
  ok(T2.$ui.phase === null && !/Campus phase:/.test(R(505, Schema.parse(T2))), 'outside it: nothing');
}
