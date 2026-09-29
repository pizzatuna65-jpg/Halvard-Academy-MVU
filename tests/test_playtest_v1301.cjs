// 1.30.1 (owner playtest, chat 2026-09-30): far-grounds gates open only while {{user}} is in that area; rival academy students are
// never at Halvard; an update block that lost its <JSONPatch> tags is read by the engine instead of being dropped.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
global.window = { parent: { document: {} } };
const U = new Function(read('src/scripts/ui.js') + '\nreturn { DATA, PANELS, view, discovered };')();
const E = new Function(read('src/scripts/engine.js') + '\nreturn { fromAbs, recoverPatch, patchCommands };')();
const at = (S, d, hhmm, loc, extra = []) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * 1440 + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : []), ...extra]); };
const set = (S, ops) => applyPatch(S, ops.map(([p, v]) => ({ op: 'replace', path: p, value: v })));
const S0 = set(initState(), [['/$eng/seed', 7], ['/$ui/wxfx', 'off'], ['/Player/Profile/Dorm', 'Fire'], ['/$ui/built', true], ['/$eng/auth', 'builder']]);
const L = U.DATA.locs, open = (S, id) => U.discovered(S, L[id]);

console.log('Gates open only in their area');
let S = at(S0, 6, '10:00', 'Grassy Field and Hills');
ok(open(S, 'observation_tower') && open(S, 'old_hut'), 'at the Grassy Field: the Observation Tower and the Old Hut show');
S = at(S, 6, '10:30', 'Observation Tower');
ok(open(S, 'observation_tower') && open(S, 'old_hut'), 'at the Observation Tower: both still show (same area)');
S = at(S, 6, '11:00', 'Old Hut');
ok(open(S, 'observation_tower') && open(S, 'old_hut'), 'at the Old Hut: both still show');
S = at(S, 6, '11:30', 'Courtyards');
ok(!open(S, 'observation_tower') && !open(S, 'old_hut') && open(S, 'grassy_field_and_hills'), 'back at the Courtyards: both hide again; the Grassy Field itself stays');
S = at(S, 6, '12:00', 'Boathouse and Lake');
ok(open(S, 'fishing_house') && open(S, 'willow_island') && !open(S, 'observation_tower'), 'at the boathouse: the Fishing House and Willow Island show, the Grassy Field\'s places do not');
S = at(S, 6, '12:20', 'Fishing House');
ok(open(S, 'willow_island'), 'at the Fishing House: Willow Island still shows');
ok(!open(at(S, 6, '13:00', 'The Arbiter Hall'), 'fishing_house'), 'in the Arbiter Hall: the Fishing House hides');
ok(!open(S0, 'rooftop') && open(S0, 'lecture_halls'), 'ungated places and the Rooftop (D21) are unchanged');

console.log('Rival academy students are not at Halvard');
const med = at(S0, 6, '09:40', 'Medical Centre', [{ op: 'replace', path: '/Scene/Present', value: { 'Mirelle Lullwyn': { Note: 'senior Viridian healer on reception duty' } } }]);
ok(!med.Scene.Present.Mirelle && !med.Scene.Present['Mirelle Lullwyn'] && med._Log.some(l => /Mirelle is on a rival academy's team/.test(l)), 'a rival team member written into a Halvard scene is removed, with the reason in the Log');
ok(!((med.$ui.cast || {}).full || []).includes('Mirelle'), 'and her sheet is not loaded');
const trip = at(set(S0, [['/Trip/Active', true], ['/Trip/Destination', 'Sunreach Bay']]), 6, '09:40', 'Sunreach Bay harbour', [{ op: 'replace', path: '/Scene/Present', value: { Mirelle: { Note: 'on holiday' } } }]);
ok(!!trip.Scene.Present.Mirelle, 'away from campus (a trip) she may be present');
const kc = at(S0, 7 * 35 + 3, '10:00', 'the Kingdom Competition arena', [{ op: 'replace', path: '/Scene/Present', value: { Mirelle: { Note: 'waiting for her bout' } } }]);
ok(!!kc.Scene.Present.Mirelle, 'at the Kingdom Competition she may be present');

console.log('A malformed update block is recovered');
const chat = read('tests/fixtures/playtest_v1301_blocks.json') && JSON.parse(read('tests/fixtures/playtest_v1301_blocks.json'));
const r4 = E.recoverPatch(chat.no_tags), r24 = E.recoverPatch(chat.no_close);
ok(r4 && r4.ops && r4.ops.length === 5 && r4.ops[1].value === "Founder's Park", 'a block with no <JSONPatch> tags: all five operations are read');
ok(r24 && r24.ops && r24.ops.length === 8 && r24.ops[1].value === 'Arbiter Hall', 'a block with no opening [ and no </JSONPatch>: all eight operations are read');
const cmds = E.patchCommands(r24.ops);
ok(cmds[0].type === 'set' && cmds[0].args[0] === '["World"]["Time"]' && cmds[0].args[1] === '"10:46"' && cmds[0].reason === 'json_patch', 'replace becomes MVU\'s set command (same path and value form as MagVarUpdate extractJsonPatch)');
ok(cmds[3].type === 'add' && cmds[3].args[1] === '-5', 'delta becomes add');
ok(cmds[4].type === 'insert' && cmds[4].args[0] === '["Bonds"]' && cmds[4].args[1] === '"Gareth"', 'insert into a record: container path and quoted key');
ok(cmds[6].type === 'insert' && cmds[6].args[0] === '["Interactions"]' && cmds[6].args[1] === '"-"', 'append to a list keeps "-"');
ok(E.recoverPatch('Just prose, no block.') === null, 'no update block: nothing to recover');
const bad = E.recoverPatch('<UpdateVariable><JSONPatch>{"op": "replace", "path": "/World/Time" "value": 1}</UpdateVariable>');
ok(bad && bad.error && !bad.ops, 'unreadable JSON: an error to report, no operations');
const rule = read('src/worldbook/custom/content/503.txt');
ok(/without them the whole update is lost/.test(rule), '503 says both JSONPatch tags are required');

console.log('1.30.2: the period on a day without classes');
const P = (d, hhmm) => at(S0, d, hhmm, 'Reception and Gatehouse').World._Period;
ok(P(0, '07:30') === 'Morning, no classes today' && P(0, '17:00') === 'Afternoon, no classes today', `Entrance Event (M1 W1 Mon): no "before classes" (${P(0, '07:30')} / ${P(0, '17:00')})`);
ok(P(1, '07:30') === 'Morning, before classes' && P(1, '17:00') === 'After classes', 'an ordinary school day keeps "before classes" and "After classes"');

console.log('1.30.3: special occasions are clear (the weather roll is suspended)');
const W = new Function(read('src/scripts/engine.js') + '\nreturn { wxDay, wxForecast, EVENTS, fromAbs };')();
const CAL = JSON.parse(read('data/calendar.json')).events;
const dayOf = (m, w, d) => (m - 1) * 28 + (w - 1) * 7 + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(d);
const fairDays = CAL.filter(e => e.fair).flatMap(e => e.d.map(d => dayOf(e.m, e.w, d)));
const calm = bk => bk.sky === 'Clear' && !bk.wind && !bk.rain && !bk.snow && !bk.rare;
let allClear = true, winterCold = true;
for (let seed = 1; seed <= 60; seed++) for (const d of fairDays) {
  const D = W.wxDay(seed, d);
  if (!D.blocks.every(calm)) allClear = false;
  if (D.season === 'Winter' && D.blocks[1].temp > 12) winterCold = false;
}
ok(fairDays.length === 41 && allClear, `every block of the ${fairDays.length} special-occasion days is clear and calm (60 seeds)`);
ok(winterCold, 'the temperature still follows the season (a winter festival stays cold)');
ok(W.wxDay(1699121023, 0).blocks.every(calm), 'the playtest chat\'s Entrance Event (light rain before) is now clear');
ok(W.wxForecast(1699121023, 0).every(f => f.sky === 'Clear'), 'the Divination Society forecasts it right');
const exam = dayOf(3, 1, 'Mon'), wet = [...Array(60).keys()].some(s => W.wxDay(s + 1, exam).blocks.some(b => b.sky !== 'Clear'));
ok(wet && !CAL.some(e => e.fair && /exam|Training Week|Thinning|holiday|Break/i.test(e.t)), 'exam weeks, long weeks, breaks and the Thinning keep ordinary weather');
const arrive = at(set(initState(), [['/$eng/seed', 1699121023], ['/$ui/built', true], ['/$eng/auth', 'builder']]), 0, '08:30', 'Courtyards');
ok(!arrive.Player.Conditions.Soaked && /clear/i.test(arrive.World._Weather || ''), `outdoors on the Entrance morning: no Soaked (${arrive.World._Weather})`);

console.log('1.30.4: the Charles template (the owner\'s playtest student)');
const B = new Function(read('src/scripts/ui.js') + '\nreturn { TEMPLATES, blankDraft, validate, buildOps };')();
const tpl = B.TEMPLATES.find(t => t.id === 'charles'), dc = Object.assign(B.blankDraft(), tpl.make());
ok(dc.name === 'Charles Chevalier' && B.validate(dc, initState()).blocking === 0, 'the template brings his name and is valid as it is');
const built = applyPatch(initState(), B.buildOps(dc, initState()), { mvu: true });
const P0 = built.Player.Profile, T0 = built.Magic._Techniques;
ok(P0.Name === 'Charles Chevalier' && P0.Pronouns === 'he/him' && P0.Birthday === 'M4 W2 Mon' && built.Player.Vitals.Mana_max === 200 && P0.Goal === 'Having fun and enjoying life', 'profile: name, pronouns, birthday M4 W2 Mon, 200 mana, goal');
ok(JSON.stringify(built.Magic._Affinity.Specialties) === '["Lightning"]' && Object.values(built.Player._Proficiency).every(v => v === 0), 'Elemental, Lightning; normal starting proficiency (all Rank 0)');
const want = { 'Voltaic Core': ['sustained', 10, 0.3], 'Electromagnetic Flight': ['sustained', 20, 0.8], 'Lightning Arc': ['per_use', 12, 0], 'Lightning Blast': ['per_use', 45, 0] };
ok(Object.keys(T0).length === 4 && Object.entries(want).every(([k, [m, a, u]]) => T0[k] && T0[k].Cost_mode === m && T0[k].Activation === a && T0[k].Upkeep_per_min === u), 'the four techniques with the same modes and costs as the Charles built in the playtest chat');

console.log('1.30.5: the SillyTavern persona picture in the Student file');
const Up = new Function(read('src/scripts/ui.js') + '\nreturn { portraitURL, personaFile, renderProfile, view };')();
const built0 = applyPatch(initState(), B.buildOps(dc, initState()), { mvu: true });
global.SillyTavern = { name1: 'Charles', chatMetadata: {}, chat: [], powerUserSettings: { personas: { 'charles.png': 'Charles', 'other.png': 'Mira' } } };
ok(Up.portraitURL(built0) === '/User%20Avatars/charles.png', 'no picture uploaded: the persona named as {{user}} gives its picture');
Up.view.tab = 'overview';
let ov = Up.renderProfile(built0);
ok(/Your SillyTavern persona picture/.test(ov) && /Use another picture/.test(ov) && !/data-act="portraitdel"/.test(ov), 'the Student file says where it comes from and offers another picture, with nothing to remove');
const withPic = set(built0, [['/$ui/portrait', 'user/images/Eldrasil/student_1.jpg']]);
ov = Up.renderProfile(withPic);
ok(Up.portraitURL(withPic) === '/user/images/Eldrasil/student_1.jpg' && /data-act="portraitdel"/.test(ov) && !/persona picture/.test(ov), 'an uploaded picture still wins, and can be removed (back to the persona picture)');
global.SillyTavern = { name1: 'Charles', chatMetadata: { persona: 'charles_b.png' }, chat: [], powerUserSettings: { personas: { 'charles_a.png': 'Charles', 'charles_b.png': 'Charles' } } };
ok(Up.personaFile() === 'charles_b.png', 'two personas with that name: the one locked to this chat');
global.SillyTavern = { name1: 'Charles', chatMetadata: {}, chat: [{ is_user: true, force_avatar: '/thumbnail?type=persona&file=charles_a.png' }, { is_user: false }], powerUserSettings: { personas: { 'charles_a.png': 'Charles', 'charles_b.png': 'Charles' } } };
ok(Up.personaFile() === 'charles_a.png', 'else the one on the player\'s latest message');
global.SillyTavern = { name1: 'Nobody', chatMetadata: {}, chat: [], powerUserSettings: { personas: {} } };
ok(Up.portraitURL(built0) === '' && /No picture yet/.test(Up.renderProfile(built0)), 'no persona picture: "No picture yet" as before');
delete global.SillyTavern;
ok(Up.personaFile() === '', 'outside SillyTavern: nothing, no error');
