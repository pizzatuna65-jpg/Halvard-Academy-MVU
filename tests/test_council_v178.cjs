// Focused FP2 check: election week, Saturday club override, result, and Year 2 handover.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const entry = id => JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data.character_book.entries.find(x => x.id === id).content;
const now = S => ejs.render(entry(505), { getvar: k => _.get({ stat_data: S }, k) });
const at = (S, Day, Time, ops = []) => applyPatch(S, [
  { op: 'replace', path: '/World/Month', value: 10 }, { op: 'replace', path: '/World/Week', value: 3 },
  { op: 'replace', path: '/World/Day', value: Day }, { op: 'replace', path: '/World/Time', value: Time }, ...ops,
]);
let S = initState();
ok(S.Campus_State.Council.President === 'Irene' && S.Campus_State.Council.VicePresident === 'Caspian', 'Irene and Caspian lead Year 1');
S = at(S, 'Fri', '17:00');
ok(/debate in the Seminar Rooms/.test(S.World._Event_today), 'Friday debate uses existing Seminar Rooms');
S = at(S, 'Sat', '14:00');
ok(/Student Council Election/.test(S.World._Period) && /replaces every club meeting/.test(S.World._Event_today), 'Saturday voting replaces club time');
ok(/ordinary clubs do not meet/.test(now(S)) && !/Club time:/.test(now(S)), '<now> does not announce club meetings');
const rep = applyPatch(S, [{ op: 'insert', path: '/Rep_events/-', value: { Rep: 'Student', XP: 1, Kind: 'repeat', Why: 'club time' } }]);
ok(rep.Player.Profile.Reputation.$xp.Student === S.Player.Profile.Reputation.$xp.Student, 'club attendance reputation is suppressed on election Saturday');
S = at(S, 'Sat', '17:00', [{ op: 'replace', path: '/Campus_State/Council/Results/1', value: { President: 'Dante' } }]);
// 1.86.0 (planning/DRAFT_event_frame.md, release E): two other students' election is counted by the engine; the story's result gives way
const W1 = S.Campus_State.Council.Results['1'], L1 = W1 && (W1.President === 'Florian' ? 'Dante' : 'Florian');
ok(W1 && ['Florian', 'Dante'].includes(W1.President) && W1.VicePresident === L1 && S.Campus_State.Council.President === 'Irene', `the engine counted: ${W1 && W1.President} wins, ${L1} is chosen VP, Irene remains President`);
S = applyPatch(S, [{ op: 'replace', path: '/World/Year', value: 2 }, { op: 'replace', path: '/World/Month', value: 1 }, { op: 'replace', path: '/World/Week', value: 1 }, { op: 'replace', path: '/World/Day', value: 'Mon' }]);
ok(S.Campus_State.Council.President === W1.President && S.Campus_State.Council.VicePresident === L1, 'Year 2 handover follows the recorded result');
