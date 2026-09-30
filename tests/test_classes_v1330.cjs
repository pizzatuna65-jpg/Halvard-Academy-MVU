// 1.33.0 classes and teachers (owner-approved planning/DRAFT_classes_and_teachers.md): Practical Magic by combat role, a teacher
// for every subject and year, free periods, the Dorm Competition bracket prize and the Combat -> Practical Magic save migration.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn {freeWhy, teacherOf, classRole, fromAbs, toAbs, SUBJECTS, FREE};')();
const npcs = JSON.parse(read('data/npcs.json'));
const op = (p, value) => ({ op: 'replace', path: p, value });

console.log('Posts');
const NEW = ['Hester', 'Anselm', 'Magnus', 'Dorian', 'Cedric', 'Anya', 'Kotaro', 'Valentin'];
ok(NEW.every(id => npcs[id] && npcs[id].group === 'Staff'), 'the eight new teachers are staff NPCs');
ok(E.SUBJECTS.includes('Practical Magic') && !E.SUBJECTS.includes('Combat'), 'Combat is Practical Magic');
const post = (s, y, r) => E.teacherOf(s, y, r);
ok(post('Practical Magic', 1, 'Attack') === 'Gavlan' && post('Practical Magic', 3, 'Defense') === 'Anselm' && post('Practical Magic', 2, 'Healing') === 'Hester'
  && post('Practical Magic', 1, 'Support') === 'Magnus' && post('Practical Magic', 2, 'Control') === 'Dorian', 'one teacher per role class, for every year');
ok(post('History', 2) === 'Baelin' && post('History', 3) === 'Cedric' && post('Magic Theory', 3) === 'Althair' && post('Etiquette', 2) === 'Anya'
  && post('Potion Crafting', 2) === 'Kotaro' && post('Potion Crafting', 3) === 'Valentin' && post('Creature Studies', 3) === 'Vallie', 'every subject and year has a teacher');
ok(E.classRole({ Combat_role: 'Control, Defense' }) === 'Control' && E.classRole({ Combat_role: '' }) === 'Attack', 'the class is the first role listed (the joint assessment before roles)');

console.log('Free periods');
let k = 0, n = 0, firstFree = null, firstHeld = null;
for (let m = 2; m <= 10; m++) for (let w = 1; w <= 4; w++) {
  const W = { Year: 1, Month: m, Week: w, Day: 'Tue' };
  n++; if (E.freeWhy(W, 2, 'Potion Crafting', 'Kotaro')) { k++; firstFree = firstFree || W; } else if (!firstHeld) firstHeld = W;
}
ok(k > 0 && k < n / 2, `Kotaro misses some lessons, not most (${k} of ${n} Tuesdays)`);
ok(E.freeWhy({ Year: 1, Month: 1, Week: 1, Day: 'Thu' }, 2, 'Practical Magic', 'Gavlan') === '', 'never in Month 1 Week 1 (the joint assessment)');
ok(E.freeWhy({ Year: 1, Month: 3, Week: 1, Day: 'Mon' }, 0, 'Magic Theory', 'Yvette') === '', 'never on a calendar event day (midterms)');
const why = E.freeWhy(firstFree, 2, 'Potion Crafting', 'Kotaro');
ok(why && why === E.freeWhy(firstFree, 2, 'Potion Crafting', 'Kotaro') && E.FREE.npcs.Kotaro.why.includes(why), 'seeded: the same day gives the same reason, from his own list');

// a second-year in the Canteen through the Tuesday afternoon Potion Crafting: absent when the class runs, free when Kotaro is away
function afternoon(W) {
  const S = initState();
  S.World = { ...S.World, ...W, Time: '12:55', Location: 'Canteen' };
  S.Player.Profile = { ...S.Player.Profile, Year: 2, Dorm: 'Fire', Combat_role: 'Healing' };
  S.$eng.abs = E.toAbs(S.World);
  const A = Schema.parse(S); runEngine(A); const S0 = Schema.parse(A);
  return applyPatch(S0, [op('/World/Time', '15:30')]);
}
const held = afternoon(firstHeld), free = afternoon(firstFree);
ok(held.$ui.absent && held.$ui.absent.cls === 'Potion Crafting' && held.$ui.absent.teacher === 'Kotaro', 'a class that runs: skipping it is on record, with its Year 2 teacher');
ok(!free.$ui.absent, 'a free period: nobody is absent from a class that was not held');
const now = S => ejs.render(JSON.parse(read('dist/Eldrasil_Halvard.json')).data.character_book.entries.find(e => e.id === 505).content, { getvar: k => _.get({ stat_data: S }, k) });
const F = applyPatch(afternoon(firstFree), [op('/World/Time', '13:30'), op('/World/Location', 'Potion Halls')]);
ok(F.$ui.free && F.$ui.free.some(f => f.s === 'Potion Crafting' && f.t === 'Kotaro'), 'the engine lists today\'s free periods');
ok(/Free period: Potion Crafting is not held now \(Kotaro /.test(now(F)), '<now> says the class is a free period and why');

console.log('Dorm Competition brackets');
const S1 = afternoon(firstHeld), p0 = S1.Player.Wallet.Points;
const won = applyPatch(S1, [op('/Competition', { Tier: 'Dorm', Status: 'qualified', Placement: '2nd of 12, Healing bracket', Team: [], Results: [] })]);
ok(won.Player.Wallet.Points - p0 === 50 && won.Player.Wallet.Transactions.some(t => /\+50 Dorm Competition prize \(runner-up\)/.test(t)), 'a bracket runner-up earns 50 points');
const again = applyPatch(won, [op('/Competition/Placement', '1st of 12, Healing bracket')]);
ok(again.Player.Wallet.Points === won.Player.Wallet.Points, 'the Dorm prize is paid once a year');

console.log('Save migration');
const O = initState();
O.$eng.ver = '1.32.0';
O.Player.Academics = { Grades: { Combat: 'B', History: 'C' }, Exams: { 'Y1 M3 midterms': 'Combat B, History C' } };
O.Commitments = { 'Remedial Combat': { Desc: 'Make-up session for the Combat F', Due: 'M3 W2 Sat 10:00', With: 'Gavlan', Where: '', Type: 'appointment' } };
const M = Schema.parse(_.cloneDeep(O)); runEngine(M, _.cloneDeep(O), ''); const S2 = Schema.parse(M);
ok(S2.Player.Academics.Grades['Practical Magic'] === 'B' && !('Combat' in S2.Player.Academics.Grades), 'a Combat mark becomes the Practical Magic mark');
ok(/Practical Magic B/.test(S2.Player.Academics.Exams['Y1 M3 midterms']) && S2.Commitments['Remedial Practical Magic'] && !S2.Commitments['Remedial Combat'], 'exam lines and a pending remedial follow the rename');
