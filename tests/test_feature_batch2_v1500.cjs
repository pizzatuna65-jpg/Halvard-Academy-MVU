// 1.50.0 (audit/AUDIT_2026-10-03_4_batch_fitur.md, feature batch 2, audit 4.5): the routine week. Planned in $ui.plan, armed by a
// player-tool patch (stepRoutine: span, stoppers, moments, <now>'s line), run by the next story reply (routineStart, routineSchool,
// routineProf) through the ordinary rules and weekly limits.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const go = (S, o, x = [], opts) => applyPatch(S, [...W(o), ...x], opts);
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const ins = (p, v) => ({ op: 'insert', path: p + '/-', value: v });
const TOOL = put('/$eng/tool', 1);
const tool = (S, ops) => applyPatch(S, [...ops, TOOL]);
const newLog = (X, Y, rx) => Y._Log.filter(l => !X._Log.includes(l) && rx.test(l));
const CLUB = 'Archery Club';

const PLAN = { study: 6, club: true, acts: [{ a: 'main_library|Study a subject', s: 'History', n: 2 }, { a: 'gymnasium|Train', n: 3 }, { a: "bell_tower|Bell-keeper's shift (paid)", n: 3 }] };
let S0 = go(initState({ etnie: true }), { Week: 2, Day: 'Mon', Time: '17:00', Location: 'Main Library' }, [put('/Player/Profile/Dorm', 'Fire')]);
S0 = tool(S0, [put('/$ui/discovered', [...S0.$ui.discovered, 'Main Library', 'Gymnasium', 'Bell Tower', 'Fire Dormitory'])]);
S0 = go(S0, { Time: '18:00', Location: 'Fire Dormitory' }, [put('/Player/Profile/Club', CLUB)]);

console.log('arming');
const A = tool(S0, [put('/$ui/plan', { ...PLAN, run: 1 })]);
const R = A.$ui.routine;
ok(R && R.at === 'M1 W2 Sun 20:00' && R.stop === 'Sunday evening' && A.$ui.plan.run === 1, `armed from Monday evening to ${R && R.at} (${R && R.days} days)`);
ok(R.moments.length >= 1 && R.moments.length <= 2, `one or two moments to play (${R.moments.map(m => m.day + ': ' + m.text.slice(0, 50)).join(' | ')})`);
ok(A.World.Day === 'Mon' && A.World.Time === '18:00', 'arming moves no clock');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data.character_book.entries;
const now = renderEntry({ character_book: { entries: card } }, 505, A);
ok(/Routine week: in this reply \{\{user\}\} lives their planned routine from now until M1 W2 Sun 20:00/.test(now) && /History/.test(now), '<now> tells the narrator the span, the plan and the moments');
const off = tool(A, [put('/$ui/plan', { ...PLAN, run: 0 })]);
ok(off.$ui.routine === null && !/Routine week/.test(renderEntry({ character_book: { entries: card } }, 505, off)), 'disarmed: no line');

console.log('the routine reply');
const st0 = A.$eng.study.mins, pts0 = A.Player.Wallet.Points, xp0 = { ...A.$eng.prof.xp };
const D = go(A, { Day: 'Tue', Time: '09:00' }, [ins('/Interactions', { With: 'Etnie', Kind: 'talk' }), ins('/Practice', { Action: 'Train', With: '' })]);
ok(D.World.Day === 'Sun' && D.World.Week === 2 && D.World.Time === '20:00', `the clock goes to the routine's end, whatever the narrator wrote (${D.World.Day} ${D.World.Time})`);
ok(!D._Log.some(l => /Time moved \d+ days/.test(l)) && !D.$ui.toasts.some(t => /Time jumped/.test(t)), 'no "time jumped" warning');
ok(D.Journal.some(l => /Routine week \(M1 W2 Mon 18:00 to M1 W2 Sun 20:00\): .*classes attended/.test(l)), `a Journal recap (${D.Journal.slice(-1)})`);
ok(D.$eng.study.mins - st0 >= 6 * 60, `study time counted (${st0} -> ${D.$eng.study.mins} minutes)`);
ok(D.Player.Wallet.Points - pts0 === 60, `paid shifts: two a week, not three (+${D.Player.Wallet.Points - pts0})`);
ok(D.$eng.prof.xp.Prowess > xp0.Prowess && D.$eng.prof.wk.Prowess <= 6, `Practice XP inside the weekly limit (Prowess ${xp0.Prowess} -> ${D.$eng.prof.xp.Prowess})`);
ok(D.$eng.prof.xp.Knowledge > xp0.Knowledge, 'History study and study time give Knowledge');
ok(D.Player.$Training.stamina.wg > 0, `three gym sessions train stamina (+${D.Player.$Training.stamina.wg}, weekly cap applies)`);
ok(newLog(A, D, /interactions with people outside its moments/).length === 1 || R.moments.some(m => m.who === 'Etnie'), 'a talk with someone outside the moments is not counted');
ok(!newLog(A, D, /Practice Train/).length && D.$eng.prof.xp.Prowess === 6, "the narrator's own Practice report is dropped (only the plan counts)");
ok(D.$ui.plan.run === 0 && D.$ui.routine === null, 'disarmed after one run');
ok(D.Player.Vitals.Stamina >= D.Player.Vitals.Stamina_max * 0.9, 'slept through the nights');
const D2 = go(D, { Day: 'Mon', Week: 3, Time: '08:00' });
ok(!D2.Journal.some(l => /Routine week/.test(l) && !D.Journal.includes(l)), 'the next reply is ordinary');

console.log('stoppers');
{
  const W3 = go(D, { Week: 3, Day: 'Mon', Time: '18:00' });
  const s = tool(W3, [put('/$ui/plan', { ...PLAN, run: 1 })]).$ui.routine;
  ok(s && s.at === 'M1 W3 Fri 20:00' && /Star Night/.test(s.stop), `an event later in the span: the evening before (${s.at}, before ${s.stop})`);
  const c = tool(go(W3, { Time: '18:10' }, [put('/Commitments/Meet Etnie', { Desc: 'x', Due: 'M1 W3 Thu 15:00', With: 'Etnie', Type: 'promise' })]), [put('/$ui/plan', { ...PLAN, run: 1 })]).$ui.routine;
  ok(c && c.at === 'M1 W3 Wed 20:00' && /Meet Etnie/.test(c.stop), `a Commitment due: the evening before (${c.at})`);
  const soon = tool(go(W3, { Day: 'Fri', Time: '10:00' }), [put('/$ui/plan', { ...PLAN, run: 1 })]);
  ok(soon.$ui.routine && /too close/.test(soon.$ui.routine.why) && soon.$ui.plan.run === 0, `too short a span: refused (${soon.$ui.routine.why})`);
  const short = go(tool(W3, [put('/$ui/plan', { ...PLAN, run: 1 })]), { Day: 'Tue', Time: '09:00' });
  ok(short.World.Day === 'Fri' && short.World.Time === '20:00' && short.Player.Wallet.Points - W3.Player.Wallet.Points <= 60, 'a cut span runs to its stop, the plan scaled to its days');
  const noB = tool(go(initState({ etnie: true }), { Week: 2, Day: 'Mon', Time: '18:00' }), [put('/$ui/plan', { ...PLAN, run: 1 })]);
  ok(/not been sorted/.test(noB.$ui.routine.why), 'unsorted: refused');
}

console.log('without a plan');
{
  const plain = go(S0, { Day: 'Tue', Time: '09:00' });
  ok(plain.World.Day === 'Tue' && !plain.Journal.some(l => /Routine week/.test(l)) && plain.$ui.routine === null, 'an ordinary reply is untouched');
  const swipe = go(go(S0, { Time: '18:05' }, [put('/$ui/plan', { ...PLAN, run: 1 })]), { Day: 'Tue', Time: '09:00' });
  ok(swipe.World.Day === 'Tue', 'a plan the narrator wrote (no player tool) arms nothing');
}
