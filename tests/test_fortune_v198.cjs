// 1.9.8 Fortune roll (planning/DRAFT_outside_presets.md A1): one seeded d100 per update for the next reply, the same on every
// swipe; Gentle bands by default; standing modifiers from {{user}}'s state; a Features toggle; the rule and the <now> line.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const entry = uid => card.character_book.entries.find(e => e.id === uid).content;
const render = (uid, S) => ejs.render(entry(uid), { getvar: k => _.get({ stat_data: S }, k) });
const at = (S, hhmm, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: hhmm }, ...extra]);

console.log('Fortune roll 1.9.8');
let S = applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: 424242 }]);
S = at(S, '08:00');
const F = S.$ui.fortune;
ok(F && F.roll >= 1 && F.roll <= 100 && F.fail === 10 && F.part === 35, `a roll for the next reply with Gentle bands by default (${F && F.roll})`);
const again = at(applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: 424242 }]), '08:00');
ok(again.$ui.fortune.roll === F.roll && again.$eng.turn === S.$eng.turn, 'deterministic: the same prior state and patch give the same number (every swipe of the next reply reads this state)');
const rolls = []; let X = S;
for (let i = 0; i < 300; i++) { X = at(X, `${String(9 + Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`); rolls.push(X.$ui.fortune.roll); }
const mean = rolls.reduce((a, b) => a + b, 0) / rolls.length;
ok(new Set(rolls).size > 80 && mean > 42 && mean < 58 && Math.min(...rolls) >= 1 && Math.max(...rolls) <= 100, `rolls vary turn to turn and spread over 1-100 (mean ${mean.toFixed(1)})`);
const same = at(X, X.World.Time), same2 = at(X, X.World.Time);
ok(same.$ui.fortune.roll === same2.$ui.fortune.roll && same.$eng.turn === X.$eng.turn + 1, 'the turn counter moves the roll on even when the clock does not');

const harsh = at(applyPatch(S, [{ op: 'replace', path: '/$ui/tune', value: { fortune_band: 3 } }]), '08:05');
ok(harsh.$ui.fortune.fail === 30 && harsh.$ui.fortune.part === 65, 'Settings: Harsh bands');
const standard = at(applyPatch(S, [{ op: 'replace', path: '/$ui/tune', value: { fortune_band: 2 } }]), '08:05');
ok(standard.$ui.fortune.fail === 20 && standard.$ui.fortune.part === 50, 'Settings: Standard bands');

const hurt = at(S, '08:10', [
  { op: 'insert', path: '/Player/Conditions/Chilled', value: { Effect: 'x' } },
  { op: 'replace', path: '/Player/Vitals/Stamina', value: 10 },
  { op: 'insert', path: '/Player/Injuries/Sprained wrist', value: { Severity: 'moderate' } },
  { op: 'insert', path: '/Rep_events/-', value: { Rep: 'Academy', XP: 40, Kind: 'event', Why: 'top of the year' } },
  { op: 'insert', path: '/Rep_events/-', value: { Rep: 'Doves', XP: -20, Kind: 'event', Why: 'defied a Dove' } },
  { op: 'insert', path: '/Magic/Active/Veil', value: { Technique: 'Shadow Veil' } },
]);
const M = hurt.$ui.fortune.mods.join('; ');
ok(/Chilled -10/.test(M) && /Exhausted -15/.test(M) && /injured -10/.test(M), `state modifiers: ${M}`);
ok(/with staff \+10/.test(M) && /with Doves -5/.test(M) && !/with students/.test(M), 'reputation modifiers only for non-zero standing');
ok(hurt.$ui.fortune.active.some(a => /Veil/.test(a)), 'active magic is listed for the situational bonus: ' + hurt.$ui.fortune.active.join(', '));

const now = render(505, hurt), rules = render(504, hurt);
ok(/Fortune \(important uncertain attempts only; one number per attempt, in order\): \d+, then \d+, then \d+; after modifiers 10 or less fails, 11-35 partial or costly, 36\+ clean\. Modifiers: .*Chilled -10/.test(now) && /Active magic: Veil/.test(now), '<now> shows the number, bands, modifiers and active magic');
ok(/- Fortune: only for an important, genuinely uncertain attempt/.test(rules) && /invisibility while sneaking past people who cannot sense it \+40, or no roll if they cannot notice/.test(rules) && /never naming the number|without naming the number/.test(rules), 'rule 504: important moments only, fitting magic (invisibility) outweighs plain sneaking, number never shown');

const off = at(applyPatch(S, [{ op: 'replace', path: '/$ui/off', value: ['fortune'] }]), '08:15');
ok(off.$ui.fortune === null && !/Fortune/.test(render(505, off)) && !/- Fortune:/.test(render(504, off)), 'Features off: no roll, no <now> line, no rule');

console.log('1.78.0 (Megumin audit MS2): one number per attempt');
const R = S.$ui.fortune.rolls;
ok(Array.isArray(R) && R.length === 3 && R[0] === S.$ui.fortune.roll && R.every(r => r >= 1 && r <= 100), `three numbers, the first is the roll crafting reads (${R})`);
ok(_.isEqual(again.$ui.fortune.rolls, R), 'all three are seeded: the same on every swipe');
const all = []; for (let i = 0; i < 200; i++) { X = at(X, `${String(14 + Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`); all.push(X.$ui.fortune.rolls); }
ok(all.filter(r => r[0] === r[1] && r[1] === r[2]).length < 3 && new Set(all.map(r => r[1])).size > 60, 'the later numbers vary on their own');
ok(/next unused Fortune number in <now> \(one per attempt, in order; when they run out, no more rolls this reply\)/.test(rules), 'rule 504: one number per attempt, in order');
const legacy = _.cloneDeep(hurt); delete legacy.$ui.fortune.rolls;
ok(render(505, legacy).includes(`in order): ${legacy.$ui.fortune.roll}; after modifiers`), 'a state from before 1.78.0 (one roll) still renders');
