// 1.90.0 (owner-approved planning/DRAFT_kerja_club.md §3): club work for the whole campus. The Academy Newspaper's Monday issue
// (results, the rumour it prints, which then lives longer), the club stalls (the Saturday bake, the potion table, free cold remedies
// on flu days, Greenwick's herbs), the snow Groundskeeping clears, the Festival Committee's postings, and the Club work toggle.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { toAbs, fromAbs, wxDay, fluOn, cwBakeGood, DAY_MIN, YEAR_DAYS, SHOP_PRICE };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (id, S) => ejs.render(card.character_book.entries.find(e => e.id === id).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value });
const ins = (p, value) => ({ op: 'insert', path: p + '/-', value });
const SEED = 777;
function at(W, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 2, Week: 1, Day: 'Wed', Time: '10:00', Location: 'Canteen', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Year: 1, Name: 'Aria Vale' });
  S.Player.Wallet.Points = 200; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = SEED;
  for (const [k, v] of Object.entries(extra)) _.set(S, k, v);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = []) => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops]);
const W0 = d => { const T = E.fromAbs(d * E.DAY_MIN); return { Year: T.Year, Month: T.Month, Week: T.Week, Day: T.Day }; };
const dayOf = W => Math.floor(E.toAbs({ ...W, Time: '00:00' }) / E.DAY_MIN);
const cwNow = S => render(505, S).split('\n').filter(l => l.startsWith('Club work: '));

console.log('The Academy Newspaper');
let N = at({ Month: 2, Week: 1, Day: 'Wed', Time: '10:00' }, { '$eng.paper': { log: [] } });
N = go(N, { Time: '10:30' }, [op('/Campus_State/Rumours', ['Someone saw lights in the Bell Tower at night'])]);
ok(N.$ui.cw.paper && N.$ui.cw.paper.on === 'Y1 M2 W1' && !N.$ui.cw.paper.head, "midweek: this week's issue, out before the rumour");
const mon = dayOf({ Year: 1, Month: 2, Week: 2, Day: 'Mon' });
N.$eng.paper.log = [[mon - 2, 'Sports Day: Sky took the most medals (Sky 9, Fire 7).'], [mon - 20, 'An old result.']];
const early = go(N, { Week: 2, Day: 'Mon', Time: '06:30' });
ok(!early.$ui.cw.paper || early.$ui.cw.paper.on !== 'Y1 M2 W2', 'Monday 06:30: not out yet');
N = go(N, { Week: 2, Day: 'Mon', Time: '07:30' });
const P = N.$ui.cw.paper;
ok(P && P.on === 'Y1 M2 W2', 'Monday 07:30: the issue is out (' + (P && P.on) + ')');
ok(P.head === 'Someone saw lights in the Bell Tower at night', 'the front page prints the rumour that has reached campus');
ok(JSON.stringify(P.res) === JSON.stringify(['Sports Day: Sky took the most medals (Sky 9, Fire 7).']), "last week's results, not older ones");
ok(P.ghost && P.soon, 'a ghost corner and the week ahead: ' + P.ghost);
ok((N.$ui.gossip || []).some(g => /in the Newspaper/.test(g[1])), 'the printed rumour is all over campus');
ok(cwNow(N).some(l => /Academy Newspaper .* leads with the rumour "Someone saw lights/.test(l)), '<now> on Monday: what the paper leads with');
ok(!cwNow(go(N, { Day: 'Thu', Time: '10:00' })).some(l => /Newspaper/.test(l)), 'not from Thursday');
ok(JSON.stringify(go(N, { Time: '09:00' }).$ui.cw.paper) === JSON.stringify(P), 'one issue a week: the same all week');
// a printed rumour lives keep days longer than an unprinted one
const life = days => { let S = N; for (let i = 1; i <= days; i++) S = go(S, W0(mon + i)); return S.Campus_State.Rumours.length; };
const base = 21;   // Settings default rumour lifetime (data/tuning.json gossip_life def)
const born = dayOf({ Year: 1, Month: 2, Week: 1, Day: 'Wed' });
ok(life(born + base + 1 - mon) === 1, 'printed: still going round after its usual lifetime');
ok(life(born + base + 3 - mon) === 0, 'and gone three days later');

console.log('The club stalls');
const sats = []; for (let d = mon + 5; sats.length < 20; d += 7) sats.push(d);
const good = sats.find(d => E.cwBakeGood({ $eng: { seed: SEED } }, { ...W0(d), Time: '15:30' })), bad = sats.find(d => !E.cwBakeGood({ $eng: { seed: SEED } }, { ...W0(d), Time: '15:30' }));
ok(good != null && bad != null, 'some Saturdays the bake works, some it does not');
const G = at({ ...W0(good), Time: '15:30', Location: 'Canteen' });
ok(G.$ui.cw.open.includes('Cooking Club honey bread') && !G.$ui.cw.open.includes('Cooking Club failed batch') && G.$ui.cw.stall, 'a good batch: honey bread on sale, the Stalls chip');
const Gb = go(G, { Time: '15:40' }, [ins('/Purchases', { Item: 'Cooking Club honey bread', Qty: 1 })]);
ok(Gb.Player.Wallet.Points === 197, 'honey bread costs 3 points (' + Gb.Player.Wallet.Points + ')');
ok(/Club stalls here[\s\S]*Cooking Club honey bread: 3 pts/.test(render(506, G)), 'the Price Guide lists it');
const Bd = at({ ...W0(bad), Time: '15:30', Location: 'Canteen' });
ok(Bd.$ui.cw.open.includes('Cooking Club failed batch') && !Bd.$ui.cw.open.includes('Cooking Club honey bread'), 'a failed batch: given away');
ok(cwNow(Bd).some(l => /gone wrong today/.test(l)), '<now> says which');
const late = go(G, { Time: '17:30' }, [ins('/Purchases', { Item: 'Cooking Club honey bread', Qty: 1 })]);
ok(late.Player.Wallet.Points === 200 && !late.$ui.cw.open.length, 'after 17:00 the bake is over and nothing is bought');
const T = at({ ...W0(good), Time: '15:00', Location: 'Potion Halls' });
ok(['Warming draught', 'Cooling draught', 'Cold remedy'].every(n => T.$ui.cw.open.includes(n)), 'Saturday: the potion table in the Potion Halls');
ok(go(T, { Time: '15:10' }, [ins('/Purchases', { Item: 'Cold remedy', Qty: 1 })]).Player.Wallet.Points === 185, 'a cold remedy costs 15 (sale 10 x 1.5)');
ok(!at({ ...W0(good + 1), Time: '15:00', Location: 'Potion Halls' }).$ui.cw.open.length, 'not on Sunday');
const spring = at({ Month: 4, Week: 1, Day: 'Tue', Time: '11:00', Location: "Greenwick's" });
ok(go(spring, { Time: '11:10' }, [ins('/Purchases', { Item: 'Foraged reagent', Qty: 1 })]).Player.Wallet.Points === 188, "Greenwick's sells the Gardening Club's herbs, 12 points");

console.log('Flu days');
let flu = null; for (let d = 0; d < E.YEAR_DAYS && flu == null; d++) if (E.fluOn(SEED, d) && !['Sat', 'Sun'].includes(W0(d).Day)) flu = d;
ok(flu != null, 'a flu day this year');
const F = at({ ...W0(flu), Time: '10:00', Location: 'Medical Centre' });
ok(F.$ui.wx.flu && F.$ui.cw.open.includes('Cold remedy') && F.$ui.cw.stall, 'the Volunteers hand out cold remedies');
ok(go(F, { Time: '10:10' }, [ins('/Purchases', { Item: 'Cold remedy', Qty: 1 })]).Player.Wallet.Points === 200, 'free');
ok(cwNow(F).some(l => /Flu days/.test(l)), '<now> says so');
let nf = null; for (let d = 30; d < E.YEAR_DAYS && nf == null; d++) if (!E.fluOn(SEED, d) && !['Sat', 'Sun'].includes(W0(d).Day)) nf = d;
ok(!at({ ...W0(nf), Time: '10:00', Location: 'Medical Centre' }).$ui.cw.open.length, 'not on other days');

console.log('Snow, and Groundskeeping');
const snowy = d => E.wxDay(SEED, d - 1).blocks[2].snow || E.wxDay(SEED, d).blocks[0].snow;
let sd = null; for (let d = 1; d < 2 * E.YEAR_DAYS && sd == null; d++) if (snowy(d)) sd = d;
ok(sd != null, 'a snowy morning');
const walks = S => (render(505, S).split('\n').find(l => l.startsWith('Walks from here')) || '').match(/\d+/g).map(Number);
const dawn = at({ ...W0(sd), Time: '06:30', Location: 'Canteen' }), noon = go(dawn, { Time: '10:00' }), eve = go(dawn, { Time: '16:00' });
const a = walks(dawn), b = walks(noon), e = walks(eve);
ok(a.every((m, i) => m >= Math.round(e[i] * 1.5) - 1) && a.some((m, i) => m > e[i]), 'before 07:00 every walk takes half again as long');
const lake = at({ ...W0(sd), Time: '10:00', Location: 'Boathouse and Lake' }), lakeEve = go(lake, { Time: '16:00' });
ok(JSON.stringify(b) === JSON.stringify(e) && walks(lake).some((m, i) => m > walks(lakeEve)[i]), 'after 07:00 the main paths are clear, the far grounds are still slow');
ok(cwNow(dawn).some(l => /every path is deep/.test(l)) && cwNow(noon).some(l => /far grounds/.test(l)) && !cwNow(eve).some(l => /Snow/.test(l)), '<now> follows it');
const moved = go(go(dawn, { Time: '06:31' }), { Time: '06:40', Location: 'Grassy Field and Hills' });
ok(/through the snow/.test(JSON.stringify(moved._Log || moved.$ui)), 'a walk in the snow is logged as one');

console.log('Festival Committee, the directory, the toggle');
const ui = read('src/scripts/ui.js');
ok(/by: FC\.includes\(x\.id\) \? 'Festival Committee'/.test(ui) && /On the programme: /.test(ui), 'the Committee signs the festivals it runs, with the programme');
ok(/For the campus: /.test(ui) && /"Newspaper":"Prints the Academy Newspaper/.test(ui), "the Clubs directory's line");
const off = id => applyPatch(at({ ...W0(good), Time: '15:30', Location: 'Canteen' }), [op('/$ui/off', [id])]);
const O = off('clubwork');
ok(O.$ui.cw === null && !cwNow(O).length && !/Club stalls here/.test(render(506, O)), 'Club work off: no stalls, no lines');
ok(go(O, { Time: '15:40' }, [ins('/Purchases', { Item: 'Cooking Club honey bread', Qty: 1 })]).Player.Wallet.Points === 200, 'and nothing to buy');
const Od = applyPatch(at({ ...W0(sd), Time: '06:30', Location: 'Canteen' }), [op('/$ui/off', ['clubwork'])]);
ok(JSON.stringify(walks(Od)) === JSON.stringify(walks(go(Od, { Time: '16:00' }))), 'and no snow slowdown');
