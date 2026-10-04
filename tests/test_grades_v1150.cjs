// 1.15.0 (owner-approved planning/DRAFT_grades_exams.md): engine-marked grades and exams, their effects and rewards.
// 1.30.0: the new mark formula (preparation, proficiency, attendance, exam-day roll). Seed 550 has a neutral exam day in every
// subject at the first midterm, so the marks below follow preparation, rank and attendance only.
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
const acad = S => S.Player.Profile.Reputation.$xp.Academy;
const MID = 56, RESULTS = 123;   // M3 W1 Mon; M5 W2 Fri
const Sb = set(initState(), [['/$eng/seed', 550], ['/$ui/wxfx', 'off'], ['/Player/Profile/Dorm', 'Fire'], ['/$ui/built', true], ['/$eng/auth', 'builder']]);   // M1 W1
const S0 = at(Sb, MID - 1, '20:00', 'Main Library');
ok(E.fromAbs(MID * DAY).Month === 3 && E.fromAbs(RESULTS * DAY).Day === 'Fri', 'fixtures: M3 W1 Mon, M5 W2 Fri');
const hours = (S, h) => set(S, [['/$eng/study/mins', h * 60]]);
// Rank 2 in every proficiency: excellent preparation then gives B in theory (50+12+20=82) and practicals (30+20+20=70)
const rank2 = S => set(S, [['/$eng/prof/xp', { Knowledge: 30, Arcana: 30, Craft: 30, Prowess: 30, Society: 30, Nature: 30 }]]);
const good = S => rank2(hours(S, 28));
// the midterm week, a few updates a day; hooks[`${day} ${time}`] adds patch ops to that update
const STEPS = ['07:30', '08:30', '10:30', '13:30', '17:00'];
function week(S, hooks = {}) {
  for (let d = MID; d < MID + 4; d++) for (const t of STEPS) S = at(S, d, t, 'Lecture Halls', hooks[`${d} ${t}`] || []);
  return at(S, MID + 4, '09:00', 'Canteen', hooks.fri || []);
}
const perk = (S, id, which = 'Rank 10') => set(S, [['/_Perks/' + (which === 'Rank 10' ? `${id} (Rank 10)` : which), { From: id, Kind: which === 'Rank 10' ? 'rank10' : 'gift', Effect: 'x', Uses: which === 'Rank 10' ? 0 : 1 }], ['/$eng/auth', 'builder']]);

console.log('Marks and posting');
const mon = at(at(good(S0), MID, '07:30', 'Lecture Halls'), MID, '08:30', 'Lecture Halls');
ok(/Exam week\. \{\{user\}\}'s preparation: excellent \(28 hours studied since the last exams\)\. Today: Magic Theory expected B \(excellent preparation 50 · Arcana Rank 2 12 · attended 100% 20 = 82: B\)/.test(render(505, mon)), '<now> in exam week: today\'s exams with their expected marks and the sum');
const solid = week(good(S0));
const G = S => S.Player.Academics.Grades;
ok(Object.values(G(solid)).length === 7 && Object.values(G(solid)).every(m => m === 'B'), `excellent preparation, Rank 2, no skips: B in every subject (${JSON.stringify(G(solid))})`);
ok(/^Magic Theory B, History B, .*Creature Studies B$/.test(solid.Player.Academics.Exams['Y1 M3 Midterm']), 'the Midterm line is recorded under "Y1 M3 Midterm"');
ok(acad(solid) - acad(at(good(S0), MID + 3, '17:00')) === 8, 'average B: Academy +8 (above average)');
ok(/Marks posted \(Y1 M3 Midterm\): Magic Theory B/.test(render(505, solid)) && [...solid.Journal, ...(solid.$ui.jnotes || [])].some(l => /Y1 M3 Midterm marks/.test(l)), '<now> and the Journal announce the marks');
const thu = at(week(good(S0)), MID + 4, '12:00', 'Canteen');
ok(!/Marks posted/.test(render(505, thu)) && thu.Player.Academics.Exams['Y1 M3 Midterm'], 'posted once');
const none = week(hours(S0, 0));
ok(Object.values(G(none)).every(m => m === 'C'), 'no study but every class attended: C (the attendance floor)');
const mid = week(hours(S0, 18));
ok(Object.values(G(mid)).every(m => m === 'C'), 'solid preparation at Rank 0: C (theory 57.5; practicals 42.5 lifted by the floor)');
const tired = week(good(S0), { [`${MID} 08:30`]: [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 50 }] });
ok(G(tired)['Magic Theory'] === 'C' && G(tired).History === 'B', `Tired during Magic Theory: one step down (${G(tired)['Magic Theory']}), the rest unchanged`);
const ill = week(good(S0), { [`${MID} 08:30`]: [{ op: 'replace', path: '/World/Location', value: 'Medical Centre' }] });
ok(G(ill)['Magic Theory'] === 'C', 'in the Medical Centre at the exam: a make-up, at most C');
const shift = week(good(S0), { [`${MID + 1} 08:30`]: [{ op: 'insert', path: '/Exam_events/-', value: { Subject: 'History', Shift: 1, Why: 'cited the founding charter' } },
  { op: 'insert', path: '/Exam_events/-', value: { Subject: 'Practical Magic', Fail: true, Why: 'caught with a charm' } }] });
ok(G(shift).History === 'A' && G(shift)['Practical Magic'] === 'F', 'the story moves a mark one step (History A) or fails it (Practical Magic F)');
ok(shift.Commitments['Remedial Practical Magic'] && shift.Commitments['Remedial Practical Magic'].With === 'Gavlan', 'an F brings a remedial with the subject\'s teacher');
ok(JSON.stringify(week(good(S0))) === JSON.stringify(solid), 'replay gives the same marks');
const wrote = applyPatch(solid, [{ op: 'replace', path: '/Player/Academics/Grades/History', value: 'A' }]);
ok(G(wrote).History === 'B' && wrote._Log.some(l => /Player\.Academics is written by the engine/.test(l)), 'a direct write to Player.Academics is reverted');

console.log('Skips and the remedial');
const skip = (S, d, from, to) => at(at(S, d, from, 'Canteen'), d, to, 'Canteen');
// History x3: M2 W2 Thu P1, M2 W3 Mon P2, M2 W4 Mon P2 (M2 W3 Wed-Fri is the Expedition, no classes)
const sk = skip(skip(skip(Sb, 38, '08:00', '10:00'), 42, '10:00', '12:00'), 49, '10:00', '12:00');
ok(sk.$eng.study.skip.History === 3, `three History classes skipped are counted (${JSON.stringify(sk.$eng.study.skip)})`);
const before = at(sk, MID - 1, '20:00', 'Canteen'), sat = week(before);
ok(G(sat).History === 'F' && G(sat)['Magic Theory'] === 'C' && /attended \d+%/.test(at(before, MID - 1, '21:00').$ui.grades.why.History), 'History: skipped classes lower attendance and lose the floor -> F; other subjects keep the floor (C)');
ok(acad(sat) - acad(at(before, MID + 3, '17:00')) === 3 - 8, 'reputation: average +3, one F -8');
const rem = sat.Commitments['Remedial History'];
ok(rem && rem.With === 'Layla' && /M3 W2 Sat 10:00/.test(rem.Due), `remedial on next week's Saturday at 10:00 with Layla (${rem && rem.Due})`);
const r1 = at(sat, 68, '09:30', 'Main Library');
const went = applyPatch(at(at(r1, 68, '10:15', 'Main Library'), 68, '11:00', 'Main Library'), [{ op: 'remove', path: '/Commitments/Remedial History' }]);
ok(G(went).History === 'D' && /History D \(make-up\)/.test(went.Player.Academics.Exams['Y1 M3 Midterm']) && went.$eng.study.marks.Y1M3.History === 1, 'the remedial attended (removed at the end of the session): F counts as D');
const late = applyPatch(at(at(r1, 68, '12:00', 'Canteen'), 68, '13:30'), [{ op: 'remove', path: '/Commitments/Remedial History' }]);
ok(G(late).History === 'F', 'removed more than three hours after it began: missed, the F stands');

console.log('Rewards: teachers, Fortune, tutoring');
const std = set(S0, [['/$eng/study/stand', { 'Practical Magic': 4, Etiquette: 3 }]]);
ok(std.$ui.fortune.mods.some(m => /top mark in Practical Magic: .* \+10/.test(m)) && !std.$ui.fortune.mods.some(m => /top mark in Etiquette/.test(m)), 'an A adds +10 to Fortune in its field; a B does not');
const tut = x => applyPatch(x, [0, 1, 2].map(() => ({ op: 'insert', path: '/Tutoring/-', value: { Subject: 'Practical Magic', Student: 'Aiden' } })));
const paid = tut(std);
ok(paid.Player.Wallet.Points - std.Player.Wallet.Points === 80 && paid.Player.Wallet.Transactions.includes('+40 tutoring (Practical Magic, Aiden)'), 'tutoring with an A: 40 points a session, two a week');
ok(paid.Player.Profile.Reputation.$xp.Student - std.Player.Profile.Reputation.$xp.Student === 4, 'each paid session is a Notice Board request (Student +2)');
const noA = applyPatch(std, [{ op: 'insert', path: '/Tutoring/-', value: { Subject: 'History' } }]);
ok(noA.Player.Wallet.Points === std.Player.Wallet.Points && noA._Log.some(l => /needs an A/.test(l)), 'no A, no pay');
const meet = S => at(applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: { Kuroo: { Note: '' } } }, { op: 'insert', path: '/Bonds/Kuroo', value: { Rank: 1 } }]), MID - 1, '21:00');
const talk = S => at(S, MID, '07:00', 'Lecture Halls', [{ op: 'insert', path: '/Interactions/-', value: { With: 'Kuroo', Kind: 'talk' } }]).Bonds.Kuroo.$xp;
const m0 = meet(S0), m1 = meet(std);
ok(talk(m1) - talk(m0) === 1, `a talk with the teacher of a subject with an A or B: +1 XP (${talk(m0)} -> ${talk(m1)})`);

console.log('Bond rewards');
const fc = S => at(S, MID - 1, '21:00').$ui.grades.marks;
ok(fc(perk(S0, 'Layla')).History === 'A', "Layla (Rank 10): History at least A");
ok(fc(perk(hours(S0, 18), 'Gareth'))['Magic Theory'] === 'B' && fc(hours(S0, 18))['Magic Theory'] === 'C', "Gareth (Rank 10): preparation one tier up (solid -> excellent: C -> B)");
const aly = fc(perk(S0, 'Alyssa'));
ok(aly['Potion Crafting'] === 'B' && aly['Practical Magic'] === 'C', "Alyssa (Rank 10): one practical subject +1");
const drt = perk(good(S0), 'Mimosa', "Mimosa's focus draught");
const focus = week(drt, { [`${MID} 08:30`]: [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 50 }, { op: 'insert', path: '/Perk_use/-', value: "Mimosa's focus draught" }] });
ok(G(focus)['Magic Theory'] === 'B' && !focus._Perks["Mimosa's focus draught"], "Mimosa's focus draught on the day: no penalty for being Tired, and it is spent");

console.log('Training, assignments, finals and the dorm rank');
let tr = S0;
for (let i = 0; i < 6; i++) tr = applyPatch(tr, [{ op: 'insert', path: '/Training/-', value: { Track: 'mana' } }]);
ok(tr.$eng.study.train === undefined && fc(hours(tr, 18))['Practical Magic'] === fc(hours(S0, 18))['Practical Magic'], '1.30.0: training no longer lifts the Practical Magic mark (it raises Prowess)');
const asg = applyPatch(at(Sb, 49, '09:00', 'Canteen', [{ op: 'insert', path: '/Commitments/Potion essay', value: { Desc: 'Potion Crafting essay', Due: 'M2 W4 Fri 18:00', Type: 'assignment' } }]), [{ op: 'remove', path: '/Commitments/Potion essay' }]);
ok(Math.round(asg.$eng.study.mins) === 45, 'an assignment done on time: +45 minutes of study');
const fin = at(at(solid, 111, '20:00', 'Canteen'), 116, '12:00', 'Canteen');
ok(fin.$eng.study.res.Y1M5 && !fin.Player.Academics.Exams['Y1 M5 Finals'], 'finals: marked at the end of exam week, not yet announced');
ok(/^(Mon|Tue|Wed|Thu) (0[89]|1[0-5]):00$/.test(at(solid, 112, '07:00').$ui.grades.run), `finals: {{user}}'s run is a seeded day and hour (${at(solid, 112, '07:00').$ui.grades.run})`);
const res = at(set(fin, [['/Player/Profile/Dorm_rank', 0]]), RESULTS, '09:30', 'Arbiter Hall');
ok(res.Player.Academics.Exams['Y1 M5 Finals'] && res._Log.some(l => /Results day: dorm rank .*marks \d\.\d of 4/.test(l)), 'Results day: the finals are posted and the dorm rank reads the marks');
ok(JSON.stringify(at(set(fin, [['/Player/Profile/Dorm_rank', 0]]), RESULTS, '09:30', 'Arbiter Hall')) === JSON.stringify(res), 'replay gives the same result');

console.log('Toggle and rules');
const off = week(set(good(S0), [['/$ui/off', ['study']]]), { [`${MID} 08:30`]: [{ op: 'insert', path: '/Exam_events/-', value: { Subject: 'History', Shift: 1 } }] });
ok(!Object.keys(G(off)).length && !off.Exam_events.length && !off.$ui.grades, 'Features off: no marks, the lists are emptied');
const r502 = render(502, S0), r502off = render(502, set(S0, [['/$ui/off', ['study']]]));
ok(/\/Exam_events\/-/.test(r502) && /\/Tutoring\/-/.test(fs.readFileSync(path.join(ROOT, 'data/rule_cards.json'), 'utf8')) && !/exam top of the year \+15/.test(r502) && !/top Dark Magic Defense exam \+8/.test(r502), 'rule 502 (on): Exam_events and Tutoring; the exam reputation is the engine\'s');
ok(!/Exam_events/.test(r502off) && /exam top of the year \+15/.test(r502off) && /Player\.Academics: Grades/.test(r502off), 'rule 502 (off): the narrator reports as before');
