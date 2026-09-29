// 1.10.0 Batch 1 (planning/DRAFT_batch_fp7_fp11.md): FP7 attendance, FP10 weekly recap, FP12 small scenes on ordinary days.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { fromAbs, eventsOn };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const DAY = 1440;
const at = (S, d, hhmm, loc, extra = []) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : []), ...extra]); };
const acad = S => S.Player.Profile.Reputation.$xp.Academy, stud = S => S.Player.Profile.Reputation.$xp.Student;
const S0 = applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: 99 }, { op: 'replace', path: '/$ui/wxfx', value: 'off' },
  { op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }, { op: 'replace', path: '/Player/Profile/Club', value: 'Magic Duelling Club' },
  { op: 'replace', path: '/$ui/built', value: true }, { op: 'replace', path: '/$eng/auth', value: 'builder' }]);
const TUE = 36;   // Month 2 Week 2 Tuesday: an ordinary class day (P1 Dark Magic Defense [D], Lecture Halls)
ok(E.fromAbs(TUE * DAY).Day === 'Tue' && !E.eventsOn(E.fromAbs(TUE * DAY)).length, 'fixture: M2 W2 Tue has no calendar event');
const morning = at(S0, TUE, '07:55', 'Canteen');
const base = acad(morning);

console.log('FP7 attendance');
const skip = at(morning, TUE, '09:00', 'Canteen');
ok(acad(skip) === base - 2 && skip.$ui.absent && skip.$ui.absent.cls === 'Dark Magic Defense', `an hour of P1 in the Canteen is a skipped class: Academy ${base} -> ${acad(skip)}`);
ok(/was absent from Dark Magic Defense this period; the absence is on record\. .* reacts in character/.test(render(505, skip)), '<now> tells the narrator the teacher reacts');
const later = at(skip, TUE, '09:40', 'Canteen');
ok(acad(later) === acad(skip) && !later.$ui.absent, 'one period is counted once');
const go = at(at(morning, TUE, '08:10', 'Lecture Halls'), TUE, '10:00', 'Lecture Halls');
ok(acad(go) === base && !go.$ui.absent, 'arriving ten minutes late and staying is attendance');
const t29 = at(at(morning, TUE, '08:00', 'Canteen'), TUE, '08:29', 'Canteen');
ok(acad(t29) === base, '29 minutes away: not yet skipped');
ok(acad(at(t29, TUE, '08:31', 'Canteen')) === base - 2, '31 minutes away: skipped (Settings default 30)');
ok(acad(at(applyPatch(morning, [{ op: 'replace', path: '/$ui/tune', value: { att_minutes: 45 } }]), TUE, '08:40', 'Canteen')) === base, 'Settings: 45 minutes allowed');
ok(acad(at(morning, TUE, '09:00', 'Medical Centre')) === base && acad(at(at(morning, TUE, '07:56', 'Medical Centre'), TUE, '09:00', 'Medical Centre')) === base, 'excused at the Medical Centre');
ok(acad(at(morning, TUE, '09:00', 'Canteen', [{ op: 'insert', path: '/Player/Injuries/Twisted ankle', value: { Severity: 'moderate' } }])) === base, 'excused with a moderate injury');
ok(acad(at(morning, TUE, '15:00', 'Canteen')) === base, 'a long skip (over six hours) is assumed to follow the routine');
const expo = 44;   // M2 W3 Wed: Creature Studies Expedition, away, no classes
ok(acad(at(at(S0, expo, '07:55', 'Canteen'), expo, '09:30', 'Canteen')) === acad(at(S0, expo, '07:55', 'Canteen')), 'no classes on an event day that suspends them');

const SAT = 40;   // M2 W2 Sat, P3 clubs
const club = at(at(S0, SAT, '12:55', 'Combat Grounds'), SAT, '14:00', 'Combat Grounds');
ok(stud(club) === stud(at(S0, SAT, '12:55', 'Combat Grounds')) + 1, 'an hour at the club venue on Saturday afternoon: Student +1');

console.log('FP7 clean week + FP10 recap');
const nextMon = TUE + 6;
const clean = at(go, nextMon, '09:00', 'Lecture Halls');
ok(acad(clean) === acad(go) + 2 && clean.Journal.some(j => /Week recap \(M2 W2\): .*a clean week/.test(j)), 'a week with lessons and no skip: Academy +2 and a recap line');
const dirty = at(skip, nextMon, '09:00', 'Lecture Halls');
ok(acad(dirty) === acad(skip) && dirty.Journal.some(j => /Week recap \(M2 W2\): .*skipped 1 class/.test(j)), 'a skipped class: no clean week; the recap says so');
const paid = at(at(S0, 30, '17:00', 'Canteen'), TUE, '17:00', 'Canteen');   // after the month's payout, so the week has no big point change
const quiet = at(paid, nextMon, '17:00', 'Canteen');
ok(!quiet.Journal.some(j => /Week recap/.test(j)), 'a week with nothing notable (no lessons seen; the monthly payout is not news): no recap line');
const every = at(applyPatch(paid, [{ op: 'replace', path: '/$ui/tune', value: { recap_mode: 2 } }]), nextMon, '17:00', 'Canteen');
ok(every.Journal.some(j => /Week recap \(M2 W2\): a quiet week\./.test(j)), 'Settings "Every week": a quiet week is recorded too');
ok(JSON.stringify(at(go, nextMon, '09:00', 'Lecture Halls')) === JSON.stringify(clean), 'swipe/replay of the rollover gives the same state');

console.log('FP12 small scenes');
const crowd = { Etnie: { Note: '' }, Saffi: { Note: '' }, Trixie: { Note: '' }, Aiden: { Note: '' }, Ruby: { Note: '' } };
const eve = at(S0, TUE, '17:00', 'Canteen');
const five = applyPatch(eve, [{ op: 'replace', path: '/Scene/Present', value: crowd }, { op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'talk' } }]);
ok(five.$ui.leave && five.$ui.leave.id !== 'Etnie' && five.$ui.leave.n === 5 && five.$ui.leave.cap === 4, `five people on an ordinary evening: ${five.$ui.leave && five.$ui.leave.id} takes their leave, never the one {{user}} is talking to`);
ok(/More than 4 people are with \{\{user\}\} on an ordinary day: \w+ takes their leave/.test(render(505, five)), '<now> asks the narrator to play the goodbye');
const four = applyPatch(eve, [{ op: 'replace', path: '/Scene/Present', value: _.omit(crowd, 'Ruby') }]);
ok(!four.$ui.leave, 'four people: nobody has to leave');
const six = applyPatch(applyPatch(eve, [{ op: 'replace', path: '/$ui/tune', value: { scene_cap: 6 } }]), [{ op: 'replace', path: '/Scene/Present', value: crowd }]);
ok(!six.$ui.leave, 'Settings: a cap of six allows five');
const classNow = applyPatch(at(S0, TUE, '10:30', 'Lecture Halls'), [{ op: 'replace', path: '/Scene/Present', value: crowd }]);
ok(!classNow.$ui.leave, 'exempt during a class period');
const festival = 290;   // M11 W2 Fri? any day with a calendar event
const fd = (() => { for (let d = 250; d < 330; d++) if (E.eventsOn(E.fromAbs(d * DAY)).length) return d; })();
ok(!applyPatch(at(S0, fd, '17:00', 'Canteen'), [{ op: 'replace', path: '/Scene/Present', value: crowd }]).$ui.leave, 'no limit on a calendar event day');
const off = applyPatch(applyPatch(eve, [{ op: 'replace', path: '/$ui/off', value: ['small_scenes'] }]), [{ op: 'replace', path: '/Scene/Present', value: crowd }]);
ok(!off.$ui.leave && !/takes their leave/.test(render(505, off)), 'Features off: no limit');

console.log('Rules and toggles');
const r502on = render(502, S0), r502off = render(502, applyPatch(S0, [{ op: 'replace', path: '/$ui/off', value: ['attendance'] }]));
ok(/Attendance \(a skipped class, a clean week, Saturday club time\) is counted by the engine/.test(r502on) && !/skipped period −2/.test(r502on) && !/a clean week \(no skipped class/.test(r502on), 'Attendance on: the narrator never reports attendance');
ok(/skipped period −2/.test(r502off) && /a clean week \(no skipped class, no curfew break\) \+2/.test(r502off) && /Saturday club time \+1/.test(r502off), 'Attendance off: the old reporting rules return');
const noAtt = at(applyPatch(morning, [{ op: 'replace', path: '/$ui/off', value: ['attendance'] }]), TUE, '09:00', 'Canteen');
ok(acad(noAtt) === base && !noAtt.$ui.absent, 'Attendance off: nothing is counted');
