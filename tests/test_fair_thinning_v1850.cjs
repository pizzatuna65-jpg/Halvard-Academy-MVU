// 1.85.0 (owner-approved planning/DRAFT_event_frame.md 4.4-4.6, release D): the Magical & Science Fair's panel mark (a Project with
// Kind "fair", stepSchoolWeek) and its stand-in for the Month 9 Magic Theory midterm; the Thinning's own ambience beats; the Circus
// stalls (hours by day); the family-visit line on the Showcase and Harvest days.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { toAbs };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (id, S) => ejs.render(card.character_book.entries.find(e => e.id === id).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value });
function at(W, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 7, Week: 2, Day: 'Mon', Time: '10:00', Location: 'Canteen', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Viridian', Year: 1, Name: 'Aria Vale' });
  S.Player.Wallet.Points = 200; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = 777;
  Object.assign(S, extra);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = [], text = '') => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], { text });
const stand = (p, w = 'Etnie') => ({ 'Mana lamp': { Kind: 'fair', Goal: 'a lamp that runs on residual mana', Progress: p, Where: 'Main Courtyard', Due: 'M7 W2 Sat', With: w } });

console.log('Magical & Science Fair');
const M0 = at({ Day: 'Mon' });
ok(/If \{\{user\}\} builds a stand, record it as a Project with Kind "fair"/.test(render(505, M0)), 'Fair week without a stand: <now> says how to record one');
const T = at({ Day: 'Thu', Time: '17:00' }, { Projects: stand(100) });
ok(/\{\{user\}\}'s stand: "Mana lamp" \(Progress 100\)\. On Saturday the staff panel/.test(render(505, T)), 'with a stand: its name and Progress');
const Sat = go(go(T, { Day: 'Sat', Time: '12:00' }), { Time: '18:10' });
const FR = Sat.$eng.study.fair;
ok(FR && FR.m != null && FR.k === 'Mana lamp', 'the panel scored it at the close: ' + (FR && FR.why));
ok((Sat.Journal || []).some(l => /Magical & Science Fair: the panel scored "Mana lamp" [A-F] \(a group stand with Etnie\)/.test(l)), 'a Journal line; the partner shares it');
ok(new RegExp(`The panel scored \\{\\{user\\}\\}'s stand ${'FDCBA'[FR.m]}`).test(render(505, Sat)), "<now> gives the panel's mark");
const half = go(go(at({ Day: 'Thu', Time: '17:00' }, { Projects: stand(60) }), { Day: 'Sat', Time: '12:00' }), { Time: '18:10' }).$eng.study.fair;
ok(half.m < FR.m || FR.m === 0, `an unfinished stand scores lower (${'FDCBA'[half.m]} against ${'FDCBA'[FR.m]}): ${half.why}`);
const early = go(T, { Day: 'Sat', Time: '17:50' });
ok(early.$eng.study.fair.m == null, 'not before the close');
const again = go(Sat, { Day: 'Sun', Time: '10:00' }, [{ op: 'remove', path: '/Projects/Mana lamp' }]);
ok(again.$eng.study.fair.m === FR.m && !(again.Journal || []).slice((Sat.Journal || []).length).some(l => /Fair/.test(l)), 'scored once; removing the Project afterwards keeps the mark');
const none = go(go(at({ Day: 'Thu', Time: '17:00' }), { Day: 'Sat', Time: '12:00' }), { Time: '18:10' });
ok(none.$eng.study.fair.m == null, 'no stand, no mark');
// an A pays fair_prize, once; a reported fair_prize is the engine's
const A = at({ Month: 8, Week: 1 });
A.$eng.study.fair = { y: 1, k: 'x', p: 100, w: '', m: 4 };
const A2 = go(A, { Time: '11:00' });
ok(/the Fair mark A replaces the written paper/.test(A2.$ui.grades.why['Magic Theory']) && A2.$ui.grades.marks['Magic Theory'] === 'A', 'the Month 9 midterm forecast uses the Fair mark: ' + A2.$ui.grades.why['Magic Theory']);
ok(A2.$ui.grades.fair === 'A', 'the Studies tab shows the Fair mark');
const lowA = at({ Month: 8, Week: 1 }); lowA.$eng.study.fair = { y: 1, k: 'x', p: 100, w: '', m: 0 };
ok(!/Fair mark/.test(go(lowA, { Time: '11:00' }).$ui.grades.why['Magic Theory']), 'a worse Fair mark leaves the written paper');
const R = go(at({ Day: 'Sun' }), { Time: '11:00' }, [{ op: 'insert', path: '/Rep_events/-', value: { Kind: 'fair_prize', Why: 'x' } }]);
ok(R.Player.Profile.Reputation.$xp.Academy === at({ Day: 'Sun' }).Player.Profile.Reputation.$xp.Academy, 'a reported fair_prize is not counted (the engine pays it)');

console.log('The Thinning');
const BEATS = JSON.parse(read('data/ambience.json')).beats.filter(b => b[3].ev).map(b => b[2]);
ok(BEATS.length >= 8, `${BEATS.length} Thinning beats`);
const walk = (W0, n) => { let S = at({ ...W0, Location: 'Viridian Dormitory — Common Room' }); const seen = []; const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  for (let i = 0; i < n; i++) { const d = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Math.floor(i / hours.length) % 7]; S = go(S, { Day: d, Time: `${hours[i % hours.length]}:00` }); const b = S.$ui.amb && S.$ui.amb.beat; if (b && b.text) seen.push(b.text); }
  return seen; };
const th = walk({ Month: 7, Week: 3 }, 60), normal = walk({ Month: 7, Week: 4 }, 60);
ok(th.some(x => BEATS.includes(x)), `Thinning week: its own beats come up (${th.filter(x => BEATS.includes(x)).length} of ${th.length})`);
ok(!normal.some(x => BEATS.includes(x)), 'never in another week');

console.log('Circus stalls and family visits');
const C1 = at({ Month: 8, Week: 2, Day: 'Thu', Time: '15:00', Location: 'Courtyards' });
const ev = S => (S.$ui.ev || []).find(e => e.id === 'circus');
ok(ev(C1) && !ev(C1).stall, 'Thursday afternoon: the stalls are not open yet');
const C2 = go(C1, { Time: '19:00' });
ok(ev(C2).stall && /Event stalls here \(Circus stalls, Thu 18:00–22:00, Fri 13:00–22:00/.test(render(506, C2)), 'Thursday evening: open, the Price Guide lists them with their hours');
const C3 = go(C2, { Time: '19:10' }, [{ op: 'insert', path: '/Purchases/-', value: { Item: 'Candied apple', Qty: 1 } }]);
ok(C2.Player.Wallet.Points - C3.Player.Wallet.Points === 5 && C3.Inventory['Candied apple'], 'a candied apple: 5 points, in the Bag');
ok(go(at({ Month: 8, Week: 2, Day: 'Sun', Time: '10:00', Location: 'Courtyards' }), { Time: '10:05' }).$ui.ev.find(e => e.id === 'circus').stall, 'Sunday: open all day');
const SH = at({ Month: 8, Week: 3, Day: 'Fri' }), HV = at({ Month: 10, Week: 4, Day: 'Sat' }), CF = at({ Month: 8, Week: 2, Day: 'Fri' });
const FAM = /Families are visiting today\. \{\{user\}\}'s family comes only if the player says so/;
ok(FAM.test(render(505, SH)) && FAM.test(render(505, HV)) && !FAM.test(render(505, CF)), 'the family line on the Showcase and Harvest days only');
