// 1.99.4 (bug-hunt audit/AUDIT_2026-10-23_2_audit_menyeluruh.md batch 3): the card's rule entries carry each rule once.
// T2: while a topic's rule card shows (511), the 502 core line it repeats steps aside (502 `_card`, the list 511 prints, fail-open).
// T3: the reputation kinds, the Extras record and Exposure moved out of 502 into rule cards with state triggers (The Vigil report and
// the forbidden-gift line stay core lines, DECISIONS §6). T6: ordinary magic is legal once (WORLD INDEX). S6: Conditions as a category. R3: one
// optional thread a reply. R4: a sheet with Imprints says up front that they are true now. R5: Ambience is the background.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
console.log('Rule cards and rule text 1.99.4');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const R = (uid, S) => renderEntry(card, uid, S);
const here = o => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(Object.keys(o).map(k => [k, { Note: o[k] }])) });
const go = (S, time, where, people, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, { op: 'replace', path: '/World/Location', value: where }, here(people || {}), ...extra]);
const rules = S => S.$ui.now.rules || [];
let S = applyPatch(initState(), [{ op: 'replace', path: '/World/Week', value: 2 }, { op: 'replace', path: '/World/Day', value: 'Wed' }, { op: 'replace', path: '/World/Time', value: '10:00' }]);
S.Player.Profile.Dorm = 'Fire';   // sorted (the engine keeps Dorm from the sorting on)

// ---- alone in the library: core lines, no cards for people or deeds
S = go(S, '10:30', 'Main Library', {});
let t502 = R(502, S), t511 = R(511, S);
ok(!rules(S).includes('interactions') && !rules(S).includes('reputation'), 'alone: no Interactions or reputation card (' + rules(S).join(', ') + ')');
ok(/Interactions: each real interaction with a roster character this reply goes in \/Interactions\/- \{"With": "<roster first name>", "Kind": "talk\|hangout\|study\|gift/.test(t502) && /never write their numbers\. Report the deed as an interaction/.test(t502), 'alone: 502 keeps the Interactions and Trust/Tension core lines');
ok(!/Academy kinds:|Student kinds:|Doves kinds:/.test(t502) && /the kinds show in <rule_cards> while someone is here/.test(t502) && /use the legacy \{"Rep"/.test(t502), 'T3: the reputation kinds left 502; its core line and the legacy form stay');
ok(!/Academy kinds:/.test(t511), 'alone: no reputation card');
ok(!/"Looks": "what anyone would notice/.test(t502) && /the record's shape shows in <rule_cards> when <now> asks for one/.test(t502), 'T3: the Extras record shape left 502');
ok(/Exposure: a hit or accident that soaks \{\{user\}\} through goes in \/Exposure\/- as \{"Kind":"soaked\|chilled"/.test(t502) && !/A splash that does not soak through/.test(t502), 'T3: Exposure keeps its path and shape in 502; the rest is a card');
ok(/Forbidden-magic gifts are dangerous to hold/.test(t502) && /on consuming The Vigil, insert "The Vigil" into \/Consumables\/-/.test(t502), 'The Vigil report and the forbidden-gift line stay core lines in 502 (DECISIONS §6)');

// ---- with Irene here: the cards show and 502 points to them
S = go(S, '11:00', 'Main Library', { Irene: 'shelving' });
t502 = R(502, S); t511 = R(511, S);
ok(['interactions', 'trust_tension', 'reputation'].every(id => rules(S).includes(id)), 'Irene here: Interactions, Trust/Tension and reputation cards');
ok(/Interactions: each real interaction with a roster character this reply goes in \/Interactions\/-; the full rule is in <rule_cards> now\./.test(t502) && !/"Kind": "talk\|hangout/.test(t502), 'T2: 502\'s Interactions line steps aside for its card');
ok(/Trust 0–100 and Tension 0–100: never write their numbers; report letdowns and offences by the scale in <rule_cards>\./.test(t502) && !/"Weight": "small\|broken/.test(t502), 'T2: 502\'s Trust/Tension line steps aside for its card');
ok(/Interactions: for each real interaction in this reply/.test(t511) && /small: late for or forgetting/.test(t511), 'the cards hold the whole rule');
ok(/Reputation deeds, each reported in \/Rep_events\/-[\s\S]*Academy kinds: staff_job, crisis_help[\s\S]*Student kinds: student_notice_help, club_office[\s\S]*Doves kinds: cooperated_with_dove/.test(t511)
  && /Paid tutoring is \/Tutoring, not student_notice_help\./.test(t511) && !/With Study off/.test(t511) && !/club_time/.test(t511), 'T3: the reputation card, with Study and Attendance on');
const So = JSON.parse(JSON.stringify(S)); So.$ui.on = { ...So.$ui.on, study: false, attendance: false };
ok(/With Study off: the Academy kinds also include fair_prize; report exam top of the year \+15/.test(R(511, So)) && /With Attendance off, the Student kinds also include club_time\./.test(R(511, So)) && !/Paid tutoring/.test(R(511, So)),
  'T3: with Study and Attendance off the card adds their variants (as 502 did)');
const Sf = JSON.parse(JSON.stringify(S)); delete Sf.$ui.now.rules;
ok(/the full rule is in <rule_cards> now/.test(R(502, Sf)) && /Academy kinds:/.test(R(511, Sf)) && /Exposure: when a hit or accident soaks/.test(R(511, Sf)), 'fail-open: with no list every card shows and 502 points to them');

// ---- after curfew: out of the dorm a deed can happen, in it not
S = go(S, '23:30', 'Courtyards', {});
ok(rules(S).includes('reputation'), 'T3: out after curfew: the reputation card (' + S.World._Curfew + ')');
S = go(S, '23:40', 'Fire Dormitory', {});
ok(!rules(S).includes('reputation'), 'T3: in {{user}}\'s own dorm after curfew: no reputation card');

// ---- Exposure by the water
S = go(S, '23:50', 'Boathouse and Lake', {});
ok(rules(S).includes('exposure') && /Exposure: when a hit or accident soaks \{\{user\}\} through \(a water spell, a dunking in the lake/.test(R(511, S)), 'T3: by the lake the exposure card shows');
const Sw = JSON.parse(JSON.stringify(S)); Sw.$ui.wxfx = 'flavor';
ok(!applyPatch(Sw, [{ op: 'replace', path: '/World/Time', value: '23:55' }]).$ui.now.rules.includes('exposure'), 'T3: with weather effects below full, no exposure card');

// ---- an invented character back a second time: the Extras card
let X = go(S, '09:00', 'Main Library', { 'Marta Bellweather': 'at the desk' });
X = go(X, '10:00', 'Main Library', {}); X = go(X, '11:00', 'Main Library', { Marta: 'at the desk again' });
ok(X.$ui.cast.xnew.includes('Marta') && rules(X).includes('extras') && /Extras: when <now> asks \(their second appearance\), add their record: \{"<Full Name>": \{"Who"/.test(R(511, X)), 'T3: <now> asks for a record: the Extras card shows its shape');

// ---- T6, S6, R5, R3, R4
const idx = R(0, S), r504 = R(504, S), gate = R(510, go(S, '12:00', 'Main Library', { Irene: '' }));
ok(/Magic is everyday at Halvard: .*ordinary movement magic included.*nobody asks permission/.test(idx) && !/Ordinary safe magic is allowed|needs no permission|step in only/.test(r504) && !/safe casting|Duelling Club/.test(gate) && /elapsed time matches the shown conversation, travel and magic\./.test(gate),
  'T6: ordinary magic is legal in the WORLD INDEX only; the gate keeps its time check');
ok(!/dripping hair|chattering teeth/.test(r504) && /in the body and in what \{\{user\}\} can do, with a detail not used before/.test(r504), 'S6: 504 gives the conditions as a category');
ok(/Ambience line is background, not something to describe in every reply: keep the prose consistent with it/.test(r504) && /never open two replies in a row with the surroundings/.test(r504), 'R5: Ambience is the background');
const Sc = JSON.parse(JSON.stringify(S)); Sc.Player.Conditions = { Soaked: { Until: '' } };
const nowC = R(505, Sc);
ok(/is Soaked right now: show it in this reply without being reminded, in the body and in what \{\{user\}\} can do, with a detail not used before\./.test(nowC) && !/dripping hair/.test(nowC), 'S6: <now> names the condition, not a ready-made picture');
const tpl = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/505.template.ejs'), 'utf8');
ok(/advance one of them through talk, a rumour, a notice or a letter; remove any that is over/.test(tpl) && !/advance each/.test(tpl), 'R3: stale campus events: advance one at a time');
const Sb = applyPatch(applyPatch(initState(), [{ op: 'replace', path: '/World/Week', value: 2 }, { op: 'replace', path: '/World/Day', value: 'Wed' }, { op: 'replace', path: '/World/Time', value: '10:00' }, { op: 'replace', path: '/$ui/off', value: ['presence_roll'] }]),
  [{ op: 'replace', path: '/World/Time', value: '12:30' }, { op: 'replace', path: '/World/Location', value: 'Canteen' }]);
const nowB = R(505, Sb);
ok(/^Likely around Canteen/m.test(nowB) && /Optional threads \(Likely around[^)]*\): use at most one of them in this reply, and none while \{\{user\}\} is in the middle of an action or a focused conversation; the rest can wait\./.test(nowB),
  'R3: with optional threads in <now> (the Canteen at lunch), at most one a reply');
const Sn = applyPatch(Sb, [{ op: 'replace', path: '/World/Time', value: '18:00' }, { op: 'replace', path: '/World/Location', value: 'Ring Dining Hall' }]);
ok(!/Optional threads \(Likely around/.test(R(505, Sn)), 'R3: "no regulars on record" is no thread');
const Si = go(S, '13:00', 'Main Library', { Irene: '' });
Si.Bonds.Irene.Imprints = [{ Belief: 'A rule can bend for someone who earns it', Weight: 2, When: 'M1 W2 Wed' }];
const sheet = R(509, Si);
ok(/Changed by experience: their Imprints \(below\) are true now; where one differs from their Personality, the Imprint wins\./.test(sheet) && sheet.indexOf('Changed by experience') < sheet.indexOf('Imprints (the only things'),
  'R4: a sheet with Imprints says up front that they are true now');
ok(!/Changed by experience/.test(R(509, go(S, '13:10', 'Main Library', { Irene: '' }))), 'R4: no line without Imprints');
