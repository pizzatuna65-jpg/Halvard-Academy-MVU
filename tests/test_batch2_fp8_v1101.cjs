// 1.10.1 Batch 2 (planning/DRAFT_batch_fp7_fp11.md): FP8 study time -> exam preparation, FP9 engine-computed dorm rank.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { fromAbs };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const DAY = 1440;
const at = (S, d, hhmm, loc, extra = []) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : []), ...extra]); };
const set = (S, ops) => applyPatch(S, ops.map(([p, v]) => ({ op: 'replace', path: p, value: v })));
const S0 = set(initState(), [['/$eng/seed', 5], ['/$ui/wxfx', 'off'], ['/Player/Profile/Dorm', 'Fire'], ['/$ui/built', true], ['/$eng/auth', 'builder']]);
const TUE = 36, MIDTERM = 56, RESULTS = 123;   // M2 W2 Tue; M3 W1 Mon; M5 W2 Fri
ok(E.fromAbs(MIDTERM * DAY).Month === 3 && E.fromAbs(MIDTERM * DAY).Day === 'Mon' && E.fromAbs(RESULTS * DAY).Month === 5 && E.fromAbs(RESULTS * DAY).Day === 'Fri', 'fixtures: M3 W1 Mon, M5 W2 Fri');

console.log('FP8 study time and preparation');
const eve = at(S0, TUE, '17:00', 'Main Library');
ok(eve.$eng.study && eve.$eng.study.key === 'Y1M3' && eve.$eng.study.grace === false, 'a new chat starts counting toward the first Midterm (no grace)');
const two = at(eve, TUE, '19:00', 'Main Library');
ok(Math.round(two.$eng.study.mins - eve.$eng.study.mins) === 120, `two evening hours in the Main Library: +120 minutes (${Math.round(two.$eng.study.mins - eve.$eng.study.mins)})`);
const cls = at(at(S0, TUE, '07:30', 'Main Library'), TUE, '08:30', 'Main Library');
ok(Math.round(cls.$eng.study.mins) === 30, `the library during a lesson does not count (only the 30 minutes before P1 at 08:00: ${Math.round(cls.$eng.study.mins)})`);
const sess = applyPatch(eve, [{ op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'study' } }]);
ok(Math.round(sess.$eng.study.mins - eve.$eng.study.mins) === 60, 'a study session with a friend: +60 minutes');
const withH = h => set(eve, [['/$eng/study/mins', h * 60]]);
const tierAt = h => at(withH(h), MIDTERM, '09:00', 'Lecture Halls').$ui.exam;
ok(tierAt(0).tier === 'unprepared' && tierAt(4).tier === 'shaky' && tierAt(10).tier === 'fair' && tierAt(18).tier === 'solid' && tierAt(28).tier === 'excellent', 'Standard tiers: 0 / 4 / 10 / 18 / 28 hours');
ok(at(set(withH(6), [['/$ui/tune', { study_tiers: 1 }]]), MIDTERM, '09:00').$ui.exam.tier === 'fair', 'Settings Light: 6 hours is fair');
const exam = at(withH(19), MIDTERM, '09:00', 'Lecture Halls');
ok(/Exam week\. \{\{user\}\}'s preparation: solid \(19 hours studied since the last exams\)/.test(render(505, exam)), '<now> in exam week');
ok(!at(withH(19), MIDTERM + 7, '09:00').$ui.exam, 'no exam line outside exam week');
const after = at(exam, MIDTERM + 8, '17:00', 'Canteen');
ok(after.$eng.study.key === 'Y1M5' && after.$eng.study.hist.Y1M3 === 3 && Math.round(after.$eng.study.mins) === 0, 'after the Midterm: its tier is kept, the count starts again for the next exams');
const old = at(set(eve, [['/$eng/study', null]]), TUE, '19:00', 'Canteen');
ok(old.$eng.study.grace === true && at(old, MIDTERM, '09:00').$ui.exam.tier === 'fair', 'a save that gains the feature mid-term: at least "fair" for the first exams');

console.log('FP9 dorm rank on Results day');
const ready = (hist, rank, extra = []) => at(set(S0, [['/$eng/study', { key: 'Y1M9', mins: 0, grace: false, hist }], ['/Player/Profile/Dorm_rank', rank], ...extra]), RESULTS - 1, '17:00', 'Canteen');
// 1.15.0: the jump to the day before Results posts the Midterm marks (their reputation); the checks below measure Results day only
const goodBase = ready({ Y1M3: 4, Y1M5: 4 }, 0, [['/Competition/Tier', 'Academy'], ['/Competition/Status', 'qualified']]);
const good = at(goodBase, RESULTS, '09:30', 'Arbiter Hall');
const acad = S => S.Player.Profile.Reputation.$xp.Academy;
ok(good.Player.Profile.Dorm_rank >= 26 && good.Player.Profile.Dorm_rank <= 50 && good.$ui.ranknews.to === good.Player.Profile.Dorm_rank, `unranked + excellent exams + Academy qualifier: up one band to #${good.Player.Profile.Dorm_rank}`);
ok(acad(good) - acad(goodBase) === 5, 'moving up a band: Academy +5 (the engine reports it)');
ok(/Announce at the Results assembly: \{\{user\}\} is now #\d+ in the Fire Dormitory/.test(render(505, good)), '<now> gives the announcement');
const again = at(good, RESULTS, '11:00', 'Canteen');
ok(again.Player.Profile.Dorm_rank === good.Player.Profile.Dorm_rank && !again.$ui.ranknews, 'only once per Results day');
const two2 = at(ready({ Y1M3: 4, Y1M5: 4 }, 0, [['/Competition/Tier', 'Academy'], ['/Competition/Status', 'qualified'], ['/$ui/tune', { rank_move: 2 }]]), RESULTS, '09:30');
ok(two2.Player.Profile.Dorm_rank >= 11 && two2.Player.Profile.Dorm_rank <= 25, `Settings "two bands": #${two2.Player.Profile.Dorm_rank}`);
const poorBase = ready({ Y1M3: 0, Y1M5: 0 }, 5), poor = at(poorBase, RESULTS, '09:30');
ok(poor.Player.Profile.Dorm_rank >= 11 && poor.Player.Profile.Dorm_rank <= 25 && acad(poor) === acad(poorBase), `#5 with unprepared exams: down one band to #${poor.Player.Profile.Dorm_rank}, no reputation gain`);
const same = at(ready({ Y1M3: 2, Y1M5: 3 }, 30), RESULTS, '09:30');
ok(same.Player.Profile.Dorm_rank >= 11 && same.Player.Profile.Dorm_rank <= 50, `#30 with fair / solid exams stays within a band of where it was (#${same.Player.Profile.Dorm_rank})`);
ok(JSON.stringify(at(ready({ Y1M3: 4, Y1M5: 4 }, 0, [['/Competition/Tier', 'Academy'], ['/Competition/Status', 'qualified']]), RESULTS, '09:30', 'Arbiter Hall')) === JSON.stringify(good), 'swipe/replay gives the same rank');

console.log('Toggle and rules');
const off = at(set(ready({ Y1M3: 4, Y1M5: 4 }, 0), [['/$ui/off', ['study']]]), RESULTS, '09:30');
ok(off.Player.Profile.Dorm_rank === 0 && off._Log.some(l => /update Player\.Profile\.Dorm_rank when the results are announced/.test(l)), 'Features off: the narrator sets the rank as before');
const r502 = render(502, S0), r502off = render(502, set(S0, [['/$ui/off', ['study']]]));
ok(/- Exams: the engine marks each subject/.test(r502) && /the engine sets it and <now> gives the announcement/.test(r502) && !/dorm rank up on Results day \+5/.test(r502), 'rule 502 with the feature on');
const withCard = (S, id) => { const X = JSON.parse(JSON.stringify(S)); X.$ui.now = { ...(X.$ui.now || {}), rules: [...((X.$ui.now || {}).rules || []), id] }; return X; };   // 1.99.4: show that rule card
ok(!/- Exams: the engine marks/.test(r502off) && /dorm rank up on Results day \+5/.test(render(511, withCard(set(S0, [['/$ui/off', ['study']]]), 'reputation'))), 'rule 502 with the feature off (1.99.4: the reputation card carries the Study-off reports)');
