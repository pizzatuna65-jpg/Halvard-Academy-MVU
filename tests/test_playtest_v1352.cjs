// 1.35.2 (owner playtest, chat 2026-10-01): feast nights move curfew (the Entrance Feast starts at 19:00, curfew was 20:00);
// the Warding Rite lifts it until dawn; an engine Journal line replaces the narrator's line that says the same thing; a new chat
// gets no "estimated from weeks already played" proficiency offer (the Builder already chooses).
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { fromAbs };')();
const at = (S, d, hhmm, loc, extra = []) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * 1440 + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    { op: 'replace', path: '/World/Location', value: loc }, ...extra]); };
const set = (S, ops) => applyPatch(S, ops.map(([p, v]) => ({ op: 'replace', path: p, value: v })));
const S0 = set(initState(), [['/$eng/seed', 7], ['/Player/Profile/Dorm', 'Fire'], ['/$ui/built', true], ['/$eng/auth', 'builder']]);
const missedCurfew = S => (S.$ui.missed || []).some(l => /after dorm curfew/.test(l));

console.log('Feast nights');
let S = at(S0, 0, '18:50', 'Ring Dining Hall');
S = at(S, 0, '20:10', 'Ring Dining Hall');
ok(S.World._Curfew === '' && !missedCurfew(S) && S.$ui.amb.crowd !== 'empty', 'Entrance Feast at 20:10: no curfew, no reminder, the hall is not empty');
S = at(S, 0, '22:10', 'Ring Dining Hall');
ok(/^CURFEW \(22:00/.test(S.World._Curfew) && missedCurfew(S), 'from 22:00 the curfew applies');
ok(/classes begin tomorrow, Tuesday/.test(at(S0, 0, '09:00', 'The Arbiter Hall').World._Event_today), 'the Entrance day says when classes begin');
ok(/^CURFEW \(20:00/.test(at(S0, 1, '20:10', 'Courtyards').World._Curfew), 'an ordinary evening keeps the 20:00 curfew');
ok(at(S0, 32, '23:00', 'Ring Dining Hall').World._Curfew === '' && at(S0, 33, '03:00', 'Ring Dining Hall').World._Curfew === '', 'Warding Rite: no curfew Friday night to Saturday dawn');
ok(/^CURFEW \(21:00/.test(at(S0, 9 * 28 + 1, '21:10', 'Grassy Field and Hills').World._Curfew), 'Remembrance Day: curfew at 21:00');

console.log('Journal');
const U = set(initState(), [['/$eng/seed', 7], ['/$ui/built', true], ['/$eng/auth', 'builder']]);
const sorted = applyPatch(U, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }, { op: 'insert', path: '/Journal/-', value: '[M1 W1 Mon] Sorted into Fire Dormitory by the Arbiter Stone.' }]);
ok(sorted.Journal.filter(l => /Sorted into/.test(l)).length === 1, 'the sorting is journaled once');
const other = applyPatch(U, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }, { op: 'insert', path: '/Journal/-', value: 'Met Tilly on the Fire benches.' }]);
ok(other.Journal.some(l => /Met Tilly/.test(l)) && other.Journal.some(l => /Sorted into the Fire/.test(l)), 'a different narrator line stays');

console.log('Proficiency on a new chat');
const first = applyPatch(initState(), [{ op: 'replace', path: '/World/Time', value: '07:31' }]);
ok(!first.$ui.prof_offer && !(first._Log || []).some(l => /estimated from weeks/.test(l)), 'no starting-proficiency offer or estimate on a new chat');
