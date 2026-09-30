// 1.11.1 bug hunt (docs/BUGHUNT_2026-09-28.md): dorm rank past #80, bonds written straight into /Bonds, attendance wording,
// partial calendar rollover and time jumps, Fortune roll across player-tool edits, name reveals from ordinary words, spending
// more than {{user}} has, small scenes, birthday parties in home breaks, parseWhen.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { parseWhen, toAbs, fromAbs, NO_BOND, ARRIVES };')();
const W = (S, o, ops = [], text = '') => applyPatch(S, [...Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...ops], { text });
const at = S => `Y${S.World.Year} M${S.World.Month} W${S.World.Week} ${S.World.Day} ${S.World.Time}`;
const S0 = initState();

console.log('#1 dorm rank on Results day');
for (const [r0, lo, hi] of [[81, 51, 999], [150, 51, 999], [60, 26, 80], [0, 26, 80]]) {
  let S = W(S0, { Month: 5, Week: 2, Day: 'Thu', Time: '20:00' }, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }, { op: 'replace', path: '/Player/Profile/Dorm_rank', value: r0 }]);
  S = W(S, { Day: 'Fri', Time: '09:30' });
  const r = S.Player.Profile.Dorm_rank;
  ok(r >= lo && r <= hi, `rank ${r0 || 'unranked'} -> #${r} (never a jump to the top band)`);
}

console.log('#2 bonds written straight into /Bonds');
const rival = [...E.NO_BOND][0], incoming = Object.keys(E.ARRIVES).find(id => E.ARRIVES[id] === 2);
for (const who of ['Bob Baker', rival, incoming]) {
  let S = W(S0, { Time: '09:00' }, [{ op: 'replace', path: '/Bonds/' + who, value: { Rank: 1, Trust: 50 } }, { op: 'replace', path: '/Scene/Present', value: { [who]: { Note: '' } } }]);
  S = W(S, { Time: '09:30' }, [{ op: 'insert', path: '/Interactions/-', value: { With: who, Kind: 'talk' } }]);
  ok(!S.Bonds[who] && S._Log.some(l => l.includes(`Bond record "${who}" was removed`)), `${who}: no bond, and the narrator is told why`);
}
{
  let S = W(S0, { Time: '09:00' }, [{ op: 'replace', path: '/Bonds/Irene', value: { Rank: 0 } }]);
  ok(!!S.Bonds.Irene, 'a roster NPC written into /Bonds still gets a bond');
  const Y2 = W(S0, { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '10:00' }, [{ op: 'replace', path: '/Bonds/' + incoming, value: { Rank: 0 } }]);
  ok(!!Y2.Bonds[incoming], `${incoming} can have a bond once their year has come`);
}

console.log('#3 attendance: the narrator\'s wording is not a skipped class');
const cls = W(S0, { Week: 2, Time: '07:30' }, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);
const lesson = (day, t0, t1, loc) => { let A = W(cls, { Day: day, Time: t0, Location: loc }); A = W(A, { Time: t1 }); return A.$ui.absent; };
for (const [day, loc] of [['Mon', 'Classroom'], ['Fri', 'Seminar Room 4'], ['Wed', 'Forest Clearing'], ['Thu', 'Sparring Pavilion'], ['Tue', 'potions classroom']]) {
  const t0 = day === 'Mon' ? '08:00' : '13:00', t1 = day === 'Mon' ? '09:30' : '14:30';
  ok(!lesson(day, t0, t1, loc), `${day} class at "${loc}": present`);
}
ok(!!lesson('Mon', '08:00', '09:30', 'Canteen'), 'a known place away from the venue is still a skipped class');
ok(!!lesson('Mon', '08:00', '09:30', 'Fire Dormitory'), 'so is staying in the dorm');

console.log('#4 partial calendar rollover and time jumps');
{
  const B = W(S0, { Month: 3, Week: 4, Day: 'Sun', Time: '21:00' });
  const A = W(B, { Month: 4, Day: 'Mon', Time: '07:00' });
  ok(at(A) === 'Y1 M4 W1 Mon 07:00' && A._Log.some(l => /Week was not reset/.test(l)), `Month +1 with Week left at 4: the next Monday (${at(A)})`);
  const Bz = W(S0, { Month: 12, Week: 4, Day: 'Sun', Time: '21:00' });
  const Az = W(Bz, { Year: 2, Month: 1, Day: 'Mon', Time: '07:00' });
  ok(at(Az) === 'Y2 M1 W1 Mon 07:00', `Year +1 with Week left at 4: the next Monday (${at(Az)})`);
  const Bm = W(S0, { Month: 3, Week: 2, Day: 'Tue', Time: '14:00' });
  const Am = W(Bm, { Month: 4, Time: '15:00' });
  ok(at(Am) === 'Y1 M4 W2 Tue 15:00' && Am.$ui.toasts.some(t => /Time jumped 28 days/.test(t)), 'a written month later is kept, with a "Time jumped" toast');
  const Aw = W(Bm, { Day: 'Wed', Time: '09:00' });
  ok(!Aw.$ui.toasts.some(t => /Time jumped/.test(t)), 'an ordinary next day gives no toast');
}

console.log('#5 Fortune roll across player-tool edits');
{
  const R = W(S0, { Time: '10:00' }, [], 'A story reply.');
  const T1 = applyPatch(R, [{ op: 'replace', path: '/$ui/happenings', value: 'rare' }, { op: 'replace', path: '/$eng/tool', value: 1 }]);
  const T2 = applyPatch(T1, [{ op: 'replace', path: '/$ui/happenings', value: 'normal' }], { text: 'Player setting (player tool). Not part of the story.' });
  ok(T1.$eng.turn === R.$eng.turn && T1.$ui.fortune.roll === R.$ui.fortune.roll && T2.$ui.fortune.roll === R.$ui.fortune.roll && T1.$eng.tool === 0, 'a Builder or Settings edit keeps the turn and the roll');
  const N = W(T2, { Time: '10:05' }, [], 'The story goes on.');
  ok(N.$eng.turn === R.$eng.turn + 1, 'the next story reply is the next turn');
  const ui = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
  ok((ui.match(/\.\.\.ops, TOOL_OP\]/g) || []).length === 2, 'both player-tool writers (Builder, Settings) send /$eng/tool');
}

console.log('#6 name reveals');
{
  const Y2 = W(S0, { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '10:00' });
  const A = W(Y2, { Time: '10:05' }, [], 'Maple leaves drifted across the path. Ruby light spilled from the window. Pip-pip, went the kettle.');
  ok(!['Maple', 'Ruby', 'Pip'].some(x => A.$ui.names.includes(x) && !Y2.$ui.names.includes(x)), 'a first name that is also a word, opening a sentence, reveals nothing');
  const B = W(Y2, { Time: '10:10' }, [], 'You wave to Maple across the courtyard.');
  ok(B.$ui.names.includes('Maple'), 'the name inside a sentence still counts');
}

console.log('#7 spending more than {{user}} has');
{
  const A = W(S0, { Time: '09:00' }, [{ op: 'delta', path: '/Player/Wallet/Points', value: -500 }, { op: 'insert', path: '/Player/Wallet/Transactions/-', value: '-500 enchanted boots (The Mall)' }]);
  ok(A.Player.Wallet.Points === 0 && A.$ui.toasts.includes('Not enough points') && A._Log.some(l => /200 missing were not paid/.test(l)), 'the narrator is told the missing 200 were not paid');
  const Ok = W(S0, { Time: '09:00' }, [{ op: 'delta', path: '/Player/Wallet/Points', value: -300 }, { op: 'insert', path: '/Player/Wallet/Transactions/-', value: '-300 textbooks' }]);
  ok(!Ok.$ui.toasts.includes('Not enough points'), 'spending exactly what is there is fine');
}

console.log('#9 small scenes');
{
  const S = W(S0, { Month: 2, Week: 2, Day: 'Sun', Time: '14:00', Location: 'Canteen' }, [{ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(['Saffi', 'Irene', 'Gareth', 'Ruby', 'Kuroo', 'Bob Baker'].map(k => [k, { Note: '' }])) }]);
  ok(S.$ui.leave && S.$ui.leave.id === 'Bob Baker', `an invented character without a record leaves first (${S.$ui.leave && S.$ui.leave.id})`);
}

console.log('#10 birthday parties');
{
  const bonds = { Etnie: { Rank: 8, Trust: 80 } };
  const mk = (m, w, d) => { let S = W(S0, { Time: '09:00' }, [{ op: 'replace', path: '/Player/Profile/Birthday', value: `M${m} W${w} ${d}` }, { op: 'replace', path: '/Player/Profile/Dorm', value: 'Viridian' }]); S.Bonds.Etnie = { ...S.Bonds.Etnie, ...bonds.Etnie, Rank: 8 }; return W(S, { Month: m, Week: w, Day: d, Time: '12:00' }); };
  ok(!!mk(3, 2, 'Wed').$ui.party, 'an ordinary term day has the party (control)');
  ok(mk(5, 4, 'Wed').$ui.party === null && mk(12, 2, 'Fri').$ui.party === null, 'no party is arranged while students are home (Mid-Year Break, Month 12)');
}

console.log('#11 parseWhen');
{
  const now = { Year: 1, Month: 3, Week: 2, Day: 'Wed', Time: '14:00' }, abs = E.toAbs(now), f = s => { const x = E.parseWhen(s, now, abs); return x < 0 ? '' : (T => `Y${T.Year} M${T.Month} W${T.Week} ${T.Day} ${T.Time}`)(E.fromAbs(x)); };
  const want = { 'by noon': 'Y1 M3 W2 Wed 12:00', 'noon tomorrow': 'Y1 M3 W2 Thu 12:00', 'Sat morning': 'Y1 M3 W2 Sat 09:00', 'this evening': 'Y1 M3 W2 Wed 19:00',
    'in two days': 'Y1 M3 W2 Fri 23:59', 'in a week': 'Y1 M3 W3 Wed 23:59', 'next week': 'Y1 M3 W3 Sun 23:59', 'Tue next week': 'Y1 M3 W3 Tue 23:59',
    'Y2 M1 W1 Mon': 'Y2 M1 W1 Mon 23:59', 'tomorrow 9am': 'Y1 M3 W2 Thu 09:00', 'Fri 18:00': 'Y1 M3 W2 Fri 18:00', 'someday': '' };
  for (const [s, v] of Object.entries(want)) ok(f(s) === v, `"${s}" -> ${f(s) || '(none)'}`);
}
