// 1.73.0: time apart (a character back in the scene after a week or more unseen) and asking after (a plan of {{user}}'s a
// character heard about, once its day has passed): engine stepBondMemory ($apart) and askAfter in stepAgenda ($ui.asks), printed
// in the Cast Sheet's "Now with {{user}}" block by nowOf.
const { Schema, runEngine, initState, applyPatch, ok } = require('./harness.cjs');
const op = (p, value) => ({ op: 'replace', path: p, value }), ins = (p, value) => ({ op: 'insert', path: p, value }), rm = p => ({ op: 'remove', path: p });
function base(bonds, present, W = {}) {
  const S = initState(); S.World = { ...S.World, Month: 4, Week: 2, Day: 'Wed', Time: '14:00', Location: 'Canteen', ...W };
  S.$eng.seed = 12345;
  for (const [id, rank] of Object.entries(bonds)) S.Bonds[id] = { Rank: rank, Trust: 50, Tension: 0, $xp: 0, Known_facts: [], Milestones: [] };
  for (const id of present) S.Scene.Present[id] = { Note: '' };
  const A = Schema.parse(S); runEngine(A); return Schema.parse(A);
}
const when = (W, more = []) => [op('/World/Month', W[0]), op('/World/Week', W[1]), op('/World/Day', W[2]), op('/World/Time', W[3]), ...more];
const lines = (S, id) => ((S.$ui.now || {}).people || {})[id] || [];
const has = (S, id, rx) => lines(S, id).some(l => rx.test(l));

console.log('Time apart');
let S = base({ Etnie: 4, Kotaro: 1 }, ['Etnie', 'Kotaro']);
S = applyPatch(S, [rm('/Scene/Present/Etnie'), rm('/Scene/Present/Kotaro')]);
S = applyPatch(S, when([4, 4, 'Mon', '10:00']));   // twelve days later
ok(!has(S, 'Etnie', /^Apart/), 'nobody present: no line');
S = applyPatch(S, [ins('/Scene/Present/Etnie', { Note: '' }), ins('/Scene/Present/Kotaro', { Note: '' })]);
ok(S.Bonds.Etnie.$apart === 12 && has(S, 'Etnie', /^Apart: last saw \{\{user\}\} 12 days ago\. The time apart is real to them/), 'Etnie back after 12 days: the Apart line');
ok(!has(S, 'Kotaro', /^Apart/), 'Rank 1 (below APART_RANK): no line');
S = applyPatch(S, [op('/World/Time', '11:00')]);
ok(has(S, 'Etnie', /^Apart: last saw \{\{user\}\} 12 days ago/), 'the line stays for the rest of the scene');
S = applyPatch(S, [rm('/Scene/Present/Etnie')]);
S = applyPatch(S, [op('/World/Time', '12:00'), ins('/Scene/Present/Etnie', { Note: '' })]);
ok(S.Bonds.Etnie.$apart === 0 && !has(S, 'Etnie', /^Apart/), 'gone and back the same day: no gap');
S = applyPatch(S, [rm('/Scene/Present/Etnie')]);
S = applyPatch(S, when([4, 4, 'Wed', '10:00']));
S = applyPatch(S, [ins('/Scene/Present/Etnie', { Note: '' })]);
ok(!has(S, 'Etnie', /^Apart/), 'two days apart is not a gap');
S = applyPatch(S, [rm('/Scene/Present/Etnie')]);
S = applyPatch(S, when([5, 1, 'Wed', '10:00']));   // a new month starts at W1
S = applyPatch(S, when([5, 3, 'Wed', '10:00']));
S = applyPatch(S, [ins('/Scene/Present/Etnie', { Note: '' })]);
ok(has(S, 'Etnie', /^Apart: last saw \{\{user\}\} 3 weeks ago/), 'a long gap (21 days) is told in weeks');
S = applyPatch(S, [op('/World/Day', 'Thu')]);
ok(!has(S, 'Etnie', /^Apart/), 'the next day the gap is spent');

console.log('Asking after');
S = base({ Sophia: 4, Kotaro: 1, Ruby: 4, Etnie: 4 }, ['Sophia', 'Kotaro', 'Ruby']);
S = applyPatch(S, [ins('/Commitments/Duel with Ruby', { Desc: 'a duel', Due: 'M4 W2 Fri 16:00', With: 'Ruby', Type: 'appointment' })]);
const AK = () => ((S.$eng.agenda || {}).ask || {});
ok(AK()['c:Duel with Ruby'] && AK()['c:Duel with Ruby'].h.join() === 'Sophia,Kotaro', 'heard by those present, not the one it is with');
ok(!Object.keys(S.$ui.asks).length, 'nothing to ask before its day');
S = applyPatch(S, [rm('/Scene/Present/Sophia'), rm('/Scene/Present/Kotaro'), rm('/Scene/Present/Ruby')]);
S = applyPatch(S, when([4, 2, 'Fri', '18:00']));
ok(AK()['c:Duel with Ruby'].end >= 0 && !Object.keys(S.$ui.asks).length, 'its time passed with nobody there: owed, nobody asked yet');
S = applyPatch(S, when([4, 2, 'Sat', '10:00'], [ins('/Scene/Present/Sophia', { Note: '' }), ins('/Scene/Present/Kotaro', { Note: '' })]));
ok(has(S, 'Sophia', /^Knew about \{\{user\}\}'s "Duel with Ruby" \(M4 W2 Fri\) and has not heard how it went: may ask, if that is like them\.$/), 'Sophia may ask, in her Cast Sheet block');
ok(!S.$ui.asks.Kotaro, 'Kotaro (Rank 1) does not');
S = applyPatch(S, [op('/World/Time', '11:00')]);
ok(has(S, 'Sophia', /^Knew about/), 'it stays for that scene');
S = applyPatch(S, [op('/World/Day', 'Sun')]);
ok(!S.$ui.asks.Sophia, 'the next day it is spent');
ok(AK()['c:Duel with Ruby'] && AK()['c:Duel with Ruby'].h.join() === 'Kotaro', 'Kotaro is still owed (he may reach Rank 3 within the window)');
S = applyPatch(S, when([4, 4, 'Tue', '10:00']));   // eleven days after Fri
ok(!AK()['c:Duel with Ruby'], 'after ASK_DAYS the matter is dropped');

console.log('Seen it, cancelled, switched off, older saves');
S = base({ Sophia: 4, Etnie: 4 }, ['Sophia', 'Etnie']);
S = applyPatch(S, [ins('/Commitments/Exam revision', { Desc: 'revise', Due: 'M4 W2 Thu 09:00', Type: 'task' })]);
S = applyPatch(S, [rm('/Scene/Present/Etnie')]);
S = applyPatch(S, when([4, 2, 'Thu', '10:00']));   // Sophia is there when it happens
S = applyPatch(S, when([4, 2, 'Fri', '10:00'], [ins('/Scene/Present/Etnie', { Note: '' })]));
ok(S.$ui.asks.Etnie && !S.$ui.asks.Sophia, 'whoever was there when it happened saw it; Etnie was not');
S = base({ Sophia: 4 }, ['Sophia']);
S = applyPatch(S, [ins('/Commitments/Picnic', { Desc: 'picnic', Due: 'M4 W3 Sat 12:00', Type: 'appointment' })]);
S = applyPatch(S, [rm('/Commitments/Picnic'), rm('/Scene/Present/Sophia')]);
ok(!AK()['c:Picnic'], 'removed before its day (cancelled or done early): nobody asks');
S = base({ Sophia: 4 }, ['Sophia']);
S = applyPatch(S, [ins('/Commitments/Match', { Desc: 'match', Due: 'M4 W2 Thu 16:00', Type: 'appointment' }), op('/$ui/off', ['npc_initiative'])]);
S = applyPatch(S, [rm('/Scene/Present/Sophia')]);
S = applyPatch(S, when([4, 2, 'Fri', '10:00'], [ins('/Scene/Present/Sophia', { Note: '' })]));
ok(!S.$ui.asks.Sophia, 'NPC initiative off: no asking after');
S = base({ Sophia: 4 }, ['Sophia']);
S = applyPatch(S, [ins('/Commitments/Old plan', { Desc: 'x', Due: 'M4 W2 Thu 16:00', Type: 'appointment' })]);
delete S.$eng.agenda.ask;   // a save from before 1.73.0
S = applyPatch(S, [op('/World/Time', '15:00')]);
ok(AK()['c:Old plan'] && !AK()['c:Old plan'].h.length, 'an older save records what is on the Agenda without inventing who heard it');
