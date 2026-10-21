// 1.86.0 (owner-approved planning/DRAFT_event_frame.md 4.1, 4.7, release E): the Bazaar's stalls and haggling (the first Fortune
// number <now> gave), Founder Day's treasure hunt (sh:huntStops, stepHunt, the prize), the Council election counted by the engine
// when both nominees are other students, the Harvest and Graduation stalls.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { huntStops, PRESENCE, toAbs };')();
const PD = E.PRESENCE, card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (id, S) => ejs.render(card.character_book.entries.find(e => e.id === id).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value });
function at(W, extra = {}, seed = 777) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 9, Week: 3, Day: 'Sat', Time: '10:00', Location: 'Arbiter Hall', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Viridian', Year: 1, Name: 'Aria Vale' });
  S.Player.Wallet.Points = 500; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = seed;
  Object.assign(S, extra);
  return applyPatch(Schema.parse(S), []);
}
const hu = S => (S.$ui.ev.find(e => e.id === 'founder_day') || {}).hunt || {};
const go = (B, W, ops = [], text = '') => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], { text });
const buy = (Item, Qty = 1) => ({ op: 'insert', path: '/Purchases/-', value: { Item, Qty } });

console.log("Founder Day's treasure hunt");
const st = E.huntStops(PD, 777, 1), EX = ['forest', 'rooftop', 'bathhouse and washrooms', 'common rooms', 'fire dormitory', 'light dormitory', 'sky dormitory', 'viridian dormitory'];
ok(st.length === 6 && new Set(st.map(x => x[0])).size === 6 && !st.some(x => EX.includes(x[0])), 'six different places with lore, none private or out of bounds: ' + st.map(x => x[1]).join(', '));
ok(JSON.stringify(st) === JSON.stringify(E.huntStops(PD, 777, 1)) && JSON.stringify(st) !== JSON.stringify(E.huntStops(PD, 777, 2)), 'the same every swipe; rewritten each year');
const early = at({ Time: '09:10' });
ok(!(early.$ui.ev.find(e => e.id === 'founder_day') || {}).hunt.next, 'not before 09:30 (the rite)');
let H = go(early, { Time: '09:40' });
const now0 = render(505, H);
ok(new RegExp(`Founder Day hunt \\(optional\\): everyone got the same first clue[^\\n]*holds clue 1 of 6\\. Its answer is the ${st[0][1].replace(/^The /, '')};`).test(now0), '<now>: optional, and the first answer');
const idle = go(H, { Time: '10:20', Location: st[0][1] }, [], 'Aria buys a cup of tea.');
ok(idle.$eng.hunt.at === 0, 'at the place without a word of the hunt: nothing');
let rep0 = H.Player.Profile.Reputation.$xp.Academy, t = 10 * 60;
for (let i = 0; i < 6; i++) {
  t += 40;
  H = go(H, { Time: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`, Location: st[i][1] }, [], 'Aria reads the clue again and the riddle falls into place.');
  if (i < 5) ok(H.$eng.hunt.at === i + 1 && H.Clues[`Founder Day hunt Y1: clue ${i + 1}`] && H.Clues[`Founder Day hunt Y1: clue ${i + 1}`].Where === st[i][1] && hu(H).next === st[i + 1][1], `clue ${i + 1} solved at the ${st[i][1]}; the next answer is given`);
}
ok(H.$eng.hunt.at === 6 && H.$eng.hunt.fin === 1 && H.Mysteries['Founder Day hunt Y1'].Status === 'solved', 'all six: finished, the thread solved');
ok(H.Player.Profile.Reputation.$xp.Academy - rep0 === 10, "founder_hunt: Academy +10 (and no class skipped: Founder Day has none)");
ok((H.Journal || []).some(l => /Finished the Founder Day treasure hunt, the first in years/.test(l)), 'a Journal line');
ok(/Founder Day hunt finished\. Tonight the Headmaster names \{\{user\}\} at the feast[^\n]*"A school that keeps the seal and loses its students has kept nothing\."/.test(render(505, H)), '<now> gives the prize once');
const after = go(H, { Time: '16:30' });
ok(!/Founder Day hunt/.test(render(505, after)), '... and not again');
const R = go(at({}), { Time: '10:10' }, [{ op: 'insert', path: '/Rep_events/-', value: { Kind: 'founder_hunt', Why: 'x' } }]);
ok(R.Player.Profile.Reputation.$xp.Academy === at({}).Player.Profile.Reputation.$xp.Academy, 'a reported founder_hunt is not counted');
let C = go(at({ Time: '09:40' }), { Time: '10:30', Location: st[0][1] }, [], 'the first clue');
C = go(C, { Time: '18:10', Location: 'Ring Dining Hall' });
ok(C.$eng.hunt.at === 1 && C.Mysteries['Founder Day hunt Y1'].Status === 'cold' && !hu(C).next, 'unfinished at 18:00: the thread goes cold, no more clues');

console.log('The Bazaar');
const B0 = at({ Month: 9, Week: 2, Day: 'Thu', Time: '10:00', Location: 'Courtyards' });
ok(/Event stalls here \(Bazaar traders, 09:00–18:00\)[^]*Caelmari rune lock: 30 pts[^]*Haggling: each price above is the trader's opening offer/.test(render(506, B0)), 'the Price Guide: the traders, and the haggling rule');
const pct = S => { const F = S.$ui.fortune, r = F.rolls[0]; return r <= F.fail ? 100 : r <= F.part ? 90 : 80; };
let paid = new Set();
for (const s of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
  const S0 = at({ Month: 9, Week: 2, Day: 'Thu', Time: '10:00', Location: 'Courtyards' }, {}, s), S1 = go(S0, { Time: '10:10' }, [buy('Caelmari rune lock')]);
  const got = S0.Player.Wallet.Points - S1.Player.Wallet.Points;
  if (got !== Math.round(30 * pct(S0) / 100)) ok(false, `seed ${s}: paid ${got}, expected ${Math.round(30 * pct(S0) / 100)}`);
  paid.add(got);
}
ok(paid.size >= 2, 'the price paid follows the Fortune number <now> gave: ' + [...paid].join(', '));
const M0 = at({ Month: 9, Week: 2, Day: 'Mon', Time: '10:00', Location: 'Courtyards' }), M1 = go(M0, { Time: '10:10' }, [buy('Caelmari rune lock')]);
ok(M0.Player.Wallet.Points === M1.Player.Wallet.Points, 'no Bazaar, no rune lock');

console.log('The Council election');
const V0 = at({ Month: 10, Week: 3, Day: 'Sat', Time: '15:50', Location: 'Courtyards' }), V1 = go(V0, { Time: '16:10' });
const w = V1.Campus_State.Council.Results['1'];
ok(w && ['Florian', 'Dante'].includes(w.President) && w.VicePresident === (w.President === 'Florian' ? 'Dante' : 'Florian'), `counted at 16:00: ${w && w.President} President, ${w && w.VicePresident} Vice`);
ok(!V0.Campus_State.Council.Results['1'], 'not before the close');
ok(JSON.stringify(go(V0, { Time: '16:10' }).Campus_State.Council.Results) === JSON.stringify(V1.Campus_State.Council.Results), 'the same every swipe');
const other = w.President === 'Florian' ? 'Dante' : 'Florian';
const V2 = go(V0, { Time: '16:10' }, [op('/Campus_State/Council/Results', { 1: { President: other } })]);
ok(V2.Campus_State.Council.Results['1'].President === w.President, 'a result the story wrote gives way to the count');
ok((V1.Journal || []).some(l => /Student Council election: (Florian|Dante) was elected President/.test(l)) && /Incoming Council leaders/.test(render(505, V1)), 'the Journal and <now>');
const wins = new Set([1, 2, 3, 4, 5, 6, 7, 8].map(s => go(at({ Month: 10, Week: 3, Day: 'Sat', Time: '15:50' }, {}, s), { Time: '16:10' }).Campus_State.Council.Results['1'].President));
ok(wins.size === 2, 'either nominee can win');

console.log('Harvest and Graduation stalls');
const HV = go(at({ Month: 10, Week: 4, Day: 'Fri', Time: '16:00', Location: 'Courtyards' }), { Time: '17:30' });
ok(HV.$ui.ev.find(e => e.id === 'harvest').stall && /Harvest Festival stalls/.test(render(506, HV)), 'Harvest Friday from 17:00');
const GR = go(at({ Month: 11, Week: 4, Day: 'Sun', Time: '12:30', Location: 'Courtyards' }), { Time: '12:40' }, [buy('Knitted dorm scarf')]);
ok(GR.Inventory['Knitted dorm scarf'] && GR.$ui.ev.find(e => e.id === 'graduation').stall, 'the farewell winter market: a knitted dorm scarf');
