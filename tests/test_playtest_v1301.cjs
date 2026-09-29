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
