// 1.91.0 (owner-approved planning/DRAFT_kerja_club.md §4): club services anyone can visit for. Tailoring and Smithing on Saturday
// afternoons at the Workshop (mending, repairs, made-to-measure and forged orders collected a week later), the Fishing Club at dawn
// (its smoked fish, the Saturday guest session), the Library Assistants (a book on loan, an Archive records search); half price for
// a member; how {{user}} learns of them (the directory, the Map, the Price Guide, <now>, the chip, the Agenda).
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { toAbs, fromAbs, gearOf, DAY_MIN };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (id, S) => ejs.render(card.character_book.entries.find(e => e.id === id).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value });
const buy = (Item, more = {}) => ({ op: 'insert', path: '/Purchases/-', value: { Item, Qty: 1, ...more } });
function at(W, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 2, Week: 1, Day: 'Sat', Time: '13:30', Location: 'Workshop', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Year: 1, Name: 'Aria Vale' });
  S.Player.Wallet.Points = 300; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = 777;
  for (const [k, v] of Object.entries(extra)) _.set(S, k, v);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = [], text = '') => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], { text });
const pts = S => S.Player.Wallet.Points;
const cwNow = S => render(505, S).split('\n').filter(l => l.startsWith('Club work: '));

console.log('Tailoring and Smithing at the Workshop');
const W = at({});
ok(W.$ui.cw.svc && W.$ui.cw.open.includes('Made-to-measure warm garment') && W.$ui.cw.open.includes('Repair a damaged item'), 'Saturday 13:30: both clubs take work');
ok(/Made-to-measure warm garment: 50 pts; Tailoring Club, Sat 13:00–16:00/.test(render(506, W)), 'the Price Guide lists the services and their hours');
ok(cwNow(W).some(l => /^Club work: Tailoring Club services here until 16:00: .*Made-to-measure formal wear 90/.test(l)), '<now> says what is on offer here');
ok(!at({ Day: 'Fri', Time: '14:00' }).$ui.cw.open.length, 'not on a weekday');
let O = go(W, { Time: '13:40' }, [buy('Made-to-measure warm garment', { Note: 'a charcoal wool coat with silver buttons' })]);
ok(pts(O) === 250 && O.$eng.orders.length === 1 && !O.Inventory['Made-to-measure warm garment'], 'ordered: 50 points, nothing in the Bag yet');
ok((O.$ui.agenda || []).some(x => x.k === 'order' && /warm garment: ready to collect at the Workshop/.test(x.t)), 'the Agenda has it');
ok(O.$ui.cw.orders[0].ready === 'M2 W2 Sat' && !O.$ui.cw.orders[0].ok, 'ready next Saturday');
const early = go(O, { Week: 2, Day: 'Fri', Time: '14:00' });
ok(!early.Inventory['Made-to-measure warm garment'], 'not before its day');
const got = go(early, { Day: 'Sat', Time: '13:10' });
const coat = got.Inventory['Made-to-measure warm garment'];
ok(coat && /charcoal wool coat with silver buttons/.test(coat.Note) && !got.$eng.orders.length, 'collected at the Workshop, with its design: ' + (coat && coat.Note));
ok(E.gearOf(got.Inventory, null, 0).warm, 'and it keeps {{user}} warm');
ok((got.Journal || []).some(l => /Collected Made-to-measure warm garment/.test(l)), 'a Journal line');
const away = go(early, { Day: 'Sat', Time: '13:10', Location: 'Canteen' });
ok(!away.Inventory['Made-to-measure warm garment'] && cwNow(away).some(l => /Ready to collect: Made-to-measure warm garment at the Workshop/.test(l)), 'elsewhere: <now> says it is ready');
const formal = go(W, { Time: '13:40' }, [buy('Made-to-measure formal wear', { Note: 'midnight silk' })]);
ok(formal.$ui.cw.orders[0].ready === 'M2 W3 Sat', 'formal wear takes two Saturdays');
const torn = at({}, { Inventory: { 'Wool coat': { Qty: 1, Kind: 'gear', Note: 'damaged, torn sleeve', Plan: '' }, 'Brass lantern': { Qty: 1, Kind: 'other', Note: 'damaged', Plan: '' } } });
const mended = go(torn, { Time: '13:40' }, [buy('Mend damaged clothing')]);
ok(pts(mended) === 295 && !/damaged/.test(mended.Inventory['Wool coat'].Note), 'mending: 5 points, the coat is no longer damaged');
const fixed = go(mended, { Time: '13:50' }, [buy('Repair a damaged item')]);
ok(pts(fixed) === 285 && !/damaged/.test(fixed.Inventory['Brass lantern'].Note), 'a repair: 10 points, the lantern works again');
const none = go(W, { Time: '13:40' }, [buy('Mend damaged clothing')]);
ok(pts(none) === 300 && /no damaged clothing/.test(JSON.stringify(none._Log || '')), 'nothing to mend: refused, not charged');
const member = at({}, { 'Player.Profile.Club': 'Tailoring Club' });
ok(pts(go(member, { Time: '13:40' }, [buy('Made-to-measure garment', { Note: 'a green vest' })])) === 285, 'a member pays half (30 → 15)');
ok(pts(go(member, { Time: '13:40' }, [buy('Repair a damaged item')])) === 300, "not another club's (nothing to repair, and no discount either)");

console.log('The Fishing Club');
const dawn = at({ Day: 'Sat', Time: '06:30', Location: 'Fishing House' });
ok(pts(go(dawn, { Time: '06:40' }, [buy('Smoked river fish')])) === 296, 'smoked river fish at the dock: 4 points');
const fish = x => (x.$ui.practice || []).find(a => a.action === 'Fish the pond or the lake');
ok(fish(dawn) && !fish(dawn).locked, 'Saturday dawn: a non-member may fish with them');
ok(cwNow(dawn).some(l => /dawn session/.test(l)), '<now> says so');
const sun = at({ Day: 'Sun', Time: '06:30', Location: 'Fishing House' });
ok(fish(sun) && /Fishing Club/.test(fish(sun).locked), 'Sunday: members only');

console.log('The Library Assistants');
const lib = at({ Day: 'Wed', Time: '17:00', Location: 'Main Library' });
const noSubj = go(lib, { Time: '17:05' }, [buy('Library book loan')]);
ok(!noSubj.Inventory['Library book: Magic Theory'] && /name the subject/.test(JSON.stringify(noSubj._Log || '')), 'a loan names its subject');
const L = go(lib, { Time: '17:05' }, [buy('Library book loan', { Note: 'Magic Theory' })]);
ok(L.Inventory['Library book: Magic Theory'] && L.Inventory['Library book: Magic Theory'].Kind === 'book' && pts(L) === 300, 'a free loan, a book in the Bag');
ok(!go(L, { Time: '17:10' }, [buy('Library book loan', { Note: 'History' })]).Inventory['Library book: History'], 'one book at a time');
ok((L.$ui.agenda || []).some(x => x.k === 'order' && /return Library book: Magic Theory/.test(x.t)), 'the Agenda has the return');
const room = go(L, { Time: '19:00', Location: 'Fire Dormitory' });
const mins = S => S.$eng.study ? S.$eng.study.mins : 0;
const withBook = go(room, { Time: '21:00' }, [], 'I spend the evening in my room and study the Magic Theory book.');
const room0 = go(lib, { Time: '19:00', Location: 'Fire Dormitory' }), noBook = go(room0, { Time: '21:00' }, [], 'I spend the evening in my room and study the Magic Theory book.');
ok(mins(withBook) - mins(room) === 60 && mins(noBook) === mins(room0), 'two hours studying in the dorm with the book count 60 study minutes (half of the Library rate, 120), without it none');
ok(mins(go(room, { Time: '21:00' }, [], 'I spend the evening in my room writing letters.')) === mins(room), 'only when the reply says {{user}} studies');
let late = L; for (const d of ['Thu', 'Fri', 'Sat', 'Sun']) late = go(late, { Day: d, Time: '10:00', Location: 'Canteen' });
late = go(late, { Week: 2, Day: 'Mon', Time: '10:00' }); late = go(late, { Day: 'Tue' }); late = go(late, { Day: 'Wed' }); late = go(late, { Day: 'Thu' });
ok(!(late.Inventory['Library book: Magic Theory'] || {}).Qty && late.$eng.loan.ban > 0, 'kept past its week: recalled, no loans for 14 days');
const banned = go(late, { Time: '17:00', Location: 'Main Library' }, [buy('Library book loan', { Note: 'History' })]);
ok(!banned.Inventory['Library book: History'] && /no loans until/.test(JSON.stringify(banned._Log || '')), 'a loan during the ban is refused');
const back = go(go(L, { Time: '17:20' }, [op('/Inventory/Library book: Magic Theory/Qty', 0)]), { Time: '17:30' }, [buy('Library book loan', { Note: 'History' })]);
ok(back.Inventory['Library book: History'] && back.Inventory['Library book: History'].Qty === 1, 'returned (out of the Bag): the next loan is fine');
const R = go(lib, { Time: '17:05' }, [buy('Archive records search')]);
ok(R.$eng.records && R.$eng.records.ready === Math.floor(E.toAbs(R.World) / E.DAY_MIN) + 1, 'a records search: ready tomorrow');
ok(/already under way/.test(JSON.stringify(go(R, { Time: '17:10' }, [buy('Archive records search')])._Log || '')), 'one at a time');

console.log('The directory, the Map, the chip, the toggle');
const ui = read('src/scripts/ui.js'), bar = read('src/ui/statusbar.html');
ok(/Services \(\$\{esc\(where\)\}/.test(ui) && /<h3>Your orders<\/h3>/.test(ui) && /' · services: '/.test(ui), "the directory's Services line, Your orders, the Map card's Clubs here row");
ok(/'Services here'/.test(bar), 'the Services here chip');
ok(/Club services \(the Price Guide's "Club stalls here"\)/.test(render(502, W)), 'entry 502 tells the narrator how to order');
const off = applyPatch(W, [op('/$ui/off', ['clubwork'])]);
ok(off.$ui.cw === null && pts(go(off, { Time: '13:40' }, [buy('Made-to-measure garment', { Note: 'x' })])) === 300, 'Club work off: no services');
ok(!/Club services \(the Price Guide/.test(render(502, off)), 'and no rule line');
