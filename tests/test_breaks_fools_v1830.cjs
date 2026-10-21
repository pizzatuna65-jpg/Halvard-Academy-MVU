// 1.83.0 (owner-approved planning/DRAFT_event_frame.md 4.2, 4.3, release B): Secret Fools Day's name-draw and Merryhew's sale; a
// break's stayers (shared.js breakStays: who is away in whereabouts and npcAwayIn), going home for a break in one reply (homeSpan,
// armed from the Event tab like the routine week), and <now>'s lines for both.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { breakStays, breakOf, foolsDraw, npcAwayIn, presenceView, whereabouts, PRESENCE, toAbs };')();
const PD = E.PRESENCE, card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (id, S) => ejs.render(card.character_book.entries.find(e => e.id === id).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value }), TOOL = op('/$eng/tool', 1);
function at(W, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 5, Week: 4, Day: 'Mon', Time: '10:00', Location: 'Canteen', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Viridian', Year: 1, Name: 'Aria Vale' });
  S.Player.Wallet.Points = 200; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = 777;
  Object.assign(S, extra);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = [], text = '') => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], { text });

console.log('Who stays for a break');
const st = E.breakStays(PD, 777, 1, 'midyear_break');
ok(['Etnie', 'Dante', 'Lenna', 'Castor', 'Tilly'].every(id => st.includes(id)), 'the five whose lore leaves them no home stay: ' + st.join(', '));
const extra = st.filter(id => !['Etnie', 'Dante', 'Lenna', 'Castor', 'Tilly'].includes(id)).length;
ok(extra < 15 && JSON.stringify(st) === JSON.stringify(E.breakStays(PD, 777, 1, 'midyear_break')), `about one in five of the rest stays (${extra} more), the same every time`);
ok(!st.includes('Maple') && !E.breakStays(PD, 777, 2, 'midyear_break').includes('Gareth'), 'only students at Halvard that year');
ok(E.breakOf({ Month: 12, Week: 3, Day: 'Wed' }).key === 'holiday' && !E.breakOf({ Month: 5, Week: 3, Day: 'Sun' }), 'the Month 12 weeks are one holiday');
const S = at({});
const goneHome = Object.keys(PD.stu).find(id => !st.includes(id) && PD.stu[id][1] === 1);
ok(E.npcAwayIn(S, goneHome) && !E.npcAwayIn(S, 'Etnie'), `${goneHome} is away for the break; Etnie is not`);
const V = E.presenceView(PD, S, () => true);
ok(E.whereabouts(PD, V, goneHome).gone === 'home for the break' && !E.whereabouts(PD, V, 'Etnie').gone, 'whereabouts (the Map, <now>) agrees');
const W0 = at({ Month: 5, Week: 3, Day: 'Sun' });
ok(!E.npcAwayIn(W0, goneHome), 'the day before the break they are still here');
const ev = S.$ui.ev.find(e => e.id === 'midyear_break');
ok(ev && JSON.stringify(ev.stay) === JSON.stringify(st), "<now>'s data names who stayed");
ok(/Most students have gone home for the break\. Students on record who stayed: Castor/.test(render(505, S)), '<now> says so');

console.log('Going home for the break');
const A = applyPatch(W0, [op('/$ui/plan', { home: 1 }), TOOL]);
ok(A.$ui.routine && A.$ui.routine.home && A.$ui.routine.at === 'M5 W4 Sun 18:00' && A.$ui.plan.run === 1, 'armed the day before: back on the break\'s last day at 18:00');
ok(/^Going home for the Mid-Year Break: in this reply \{\{user\}\} leaves Halvard[^\n]*home and family are the player's/.test(A.$ui.routine.line), 'its line: ' + A.$ui.routine.line.slice(0, 90));
ok(new RegExp(A.$ui.routine.line.slice(0, 40).replace(/[{}()]/g, '\\$&')).test(render(505, A)), '<now> prints it even with the routine week off');
const H = go(A, { Time: '12:00' }, [{ op: 'insert', path: '/Interactions/-', value: { With: 'Etnie', Kind: 'talk', Note: 'x' } }], 'The weeks at home pass.');
ok(H.World.Month === 5 && H.World.Week === 4 && H.World.Day === 'Sun' && H.World.Time === '18:00', 'the next story reply ends on the last evening');
ok((H.Journal || []).some(l => /^(\[[^\]]+\] )?Home for the Mid-Year Break \(/.test(l)) && !(H.Interactions || []).length, 'a Journal line; no interactions counted');
const No = applyPatch(at({ Month: 4, Week: 2, Day: 'Wed' }), [op('/$ui/plan', { home: 1 }), TOOL]);
ok(No.$ui.routine && No.$ui.routine.why === 'there is no break today or tomorrow', 'refused away from a break');
const Trip = go(at({}), {}, [op('/Trip/Active', true), op('/Trip/Destination', 'home')]);
ok(/\{\{user\}\} is home for the break\. Their home and family are the player's/.test(render(505, Trip)), 'played at home over several replies (a Trip home): the home-and-family line');

console.log('Secret Fools Day');
const F = E.foolsDraw(PD, 777, 1, 'Viridian');
ok(F.to !== F.by || !F.to, 'the name drawn and the one who drew {{user}} are two people: ' + JSON.stringify(F));
ok(['to', 'by'].every(k => !F[k] || PD.stu[F[k]][2] === 'Viridian'), 'both from {{user}}\'s dorm (or invented)');
const draws = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => E.foolsDraw(PD, s, 1, 'Fire'));
ok(draws.some(d => !d.to) && draws.some(d => d.to), 'sometimes a roster dorm-mate, sometimes one the narrator invents');
const FD = at({ Month: 4, Week: 1, Day: 'Wed', Location: "The Mall — Merryhew's" });
const fl = FD.$ui.ev.find(e => e.id === 'fools_day');
ok(fl && fl.fools && fl.sale && fl.sale.pct === 25, 'the day carries the draw and the sale');
const now = render(505, FD);
ok(/Secret Fools Day: if \{\{user\}\} drew a name this morning, it was [^.]+\. Whoever drew \{\{user\}\}: [^;]+; keep it hidden/.test(now) && /Today Merryhew's sells everything at 25% off/.test(now), '<now>: the draw and the sale');
ok(/Today: Merryhew's sells everything at 25% off its listed prices/.test(render(506, FD)), 'the Price Guide says so');
const item = JSON.parse(read('data/shop.json')).items.find(i => i.shop === "Merryhew's" && i.price);
const P = go(FD, { Time: '10:10' }, [{ op: 'insert', path: '/Purchases/-', value: { Item: item.item, Qty: 1 } }]);
ok(FD.Player.Wallet.Points - P.Player.Wallet.Points === Math.round(item.price * 0.75), `${item.item}: ${Math.round(item.price * 0.75)} points instead of ${item.price}`);
const P2 = go(at({ Month: 4, Week: 1, Day: 'Thu', Location: "The Mall — Merryhew's" }), { Time: '10:10' }, [{ op: 'insert', path: '/Purchases/-', value: { Item: item.item, Qty: 1 } }]);
ok(200 - P2.Player.Wallet.Points === item.price, 'the day after, full price');
