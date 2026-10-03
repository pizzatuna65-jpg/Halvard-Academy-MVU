// 1.45.0 (audit/AUDIT_2026-10-03_3_batch_perbaikan.md, Batch 3): reports the engine settles. One ledger for Points and Coin
// (audit 3.5), one Bag ledger (3.4), /Purchases, one practice session report with tracks (3.9).
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const W = (o, x = [], opts) => [Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x), opts];
const go = (S, o, x, opts) => applyPatch(S, ...W(o, x, opts));
const ins = (p, v) => ({ op: 'insert', path: p + '/-', value: v });
const present = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const S0 = go(initState({ etnie: true }), { Location: 'Fire Dormitory', Time: '09:00' }, [{ op: 'replace', path: '/Player/Wallet/Points', value: 100 }]);
const tx = X => X.Player.Wallet.Transactions;
const ni = X => tx(X).filter(l => /not itemised/.test(l)).length;
const SEASON = JSON.parse(rd('data/calendar.json')).seasons;

console.log('3.5 one ledger for Points and Coin');
{
  // an engine payment (studio practice, tutoring ...) and a narrator change with no line in the same reply: the narrator's is caught
  const eng = rd('src/scripts/engine.template.js');
  ok(!/Wallet\.Transactions\.push\(|Wallet\.Transactions = \[\.\.\.S\.Player/.test(eng), 'no engine step writes Transactions except through ledger()');
  ok(/S\.Player\.Wallet\.Transactions = S\.Player\.Wallet\.Transactions\.slice\(-20\)/.test(eng.slice(eng.indexOf('function stepCommit'))), 'Transactions are cut to 20 once, in stepCommit');
  const M = go(go(S0, { Location: 'The Mall' }), { Time: '09:30' }, [ins('/Purchases', { Item: 'Bakery roll', Shop: 'The Mall — bakery' }),
    { op: 'delta', path: '/Player/Wallet/Points', value: -10 }]);
  ok(M.Player.Wallet.Points === 75 && tx(M).includes('-10 (not itemised)'), `an engine purchase (-15) and an unlogged -10 in one reply: the -10 is "not itemised" (Points ${M.Player.Wallet.Points})`);
  const N = go(go(S0, { Location: 'The Mall' }), { Time: '09:30' }, [ins('/Purchases', { Item: 'Bakery roll' })]);
  ok(ni(N) === ni(S0) && N.Player.Wallet.Points === 85, 'the engine purchase alone: no "not itemised" line');
  const C = go(S0, { Time: '09:30' }, [ins('/Player/Wallet/Transactions', '-30 coin: ferry')]);
  ok(!C.$ui.toasts.includes('Not enough points'), 'a coin line is not counted as points spent');
  ok(C.$ui.toasts.includes('Not enough coin') && C._Log.some(l => /had 0 coin but this reply spent 30/.test(l)), 'spending coin {{user}} does not have is caught, like points');
  let L = S0; for (let i = 0; i < 25; i++) L = go(L, { Time: `${10 + Math.floor(i / 6)}:${String(10 * (i % 6)).padStart(2, '0')}` }, [ins('/Player/Wallet/Transactions', `-1 sweet ${i}`), { op: 'delta', path: '/Player/Wallet/Points', value: -1 }]);
  ok(tx(L).length === 20 && !tx(L).some(l => /not itemised/.test(l)), `25 logged spends: 20 lines kept, none "not itemised" (${tx(L).length}: ${tx(L).filter(l => /not itemised/.test(l))})`);
}

console.log('3.4 the Bag ledger');
{
  const bag = go(S0, {}, [{ op: 'replace', path: '/Inventory', value: { 'Quick-dry powder': { Qty: 2, Kind: 'other' } } },
    { op: 'replace', path: '/Player/Conditions/Soaked', value: { Effect: 'wet', Since: '' } }]);
  const own = go(bag, { Time: '09:10' }, [ins('/Consumables', 'Quick-dry powder'), { op: 'replace', path: '/Inventory/Quick-dry powder/Qty', value: 1 }]);
  ok(own.Inventory['Quick-dry powder'].Qty === 1, 'a use the narrator already took from the Bag is not taken again');
  const two = go(bag, { Time: '09:10' }, [ins('/Consumables', 'Quick-dry powder'), ins('/Consumables', 'a Quick-dry powder')]);
  ok(!two.Inventory['Quick-dry powder'], 'two uses of one item in a reply add up (2 → 0)');
  const bought = go(bag, { Time: '09:10' }, [{ op: 'replace', path: '/Inventory/Quick-dry powder/Qty', value: 4 }, ins('/Consumables', 'Quick-dry powder')]);
  ok(bought.Inventory['Quick-dry powder'].Qty === 3, `two more put in the Bag and one used: 3 left (${bought.Inventory['Quick-dry powder'].Qty})`);
}

console.log('/Purchases');
{
  const mall = go(S0, { Location: 'The Mall' });
  const R = go(mall, { Time: '09:30' }, [ins('/Purchases', { Item: 'bakery roll', Qty: 2, Shop: 'The Mall — bakery' })]);
  ok(R.Inventory['Bakery roll'] && R.Inventory['Bakery roll'].Qty === 2 && R.Player.Wallet.Points === 70 && tx(R).some(l => /^-30 Bakery roll x2 \(The Mall/.test(l)),
    `listed price at its shop: -30 points, two Bakery rolls in the Bag (${tx(R).slice(-1)})`);
  ok(R.Purchases.length === 0, 'the list is emptied');
  const far = go(S0, { Time: '09:30' }, [ins('/Purchases', { Item: 'Bakery roll' })]);
  ok(!far.Inventory['Bakery roll'] && far.Player.Wallet.Points === 100 && far._Log.some(l => /Bakery roll refused: .*sold at The Mall/.test(l)), 'not at a shop that sells it, no Price: refused in _Log');
  const story = go(S0, { Time: '09:30' }, [ins('/Purchases', { Item: 'Hand-carved whistle', Price: 12, Shop: 'a first-year' })]);
  ok(story.Inventory['Hand-carved whistle'] && story.Player.Wallet.Points === 88 && tx(story).some(l => /-12 Hand-carved whistle \(a first-year, story price\)/.test(l)), 'an item not listed: the narrator\'s Price, logged as a story price');
  const none = go(S0, { Time: '09:30' }, [ins('/Purchases', { Item: 'Hand-carved whistle' })]);
  ok(!none.Inventory['Hand-carved whistle'] && none._Log.some(l => /no listed price; give its Price/.test(l)), 'an unlisted item with no Price: refused');
  const poor = go(mall, { Time: '09:30' }, [{ op: 'replace', path: '/Player/Wallet/Points', value: 10 }, ins('/Purchases', { Item: 'Bakery roll' })]);
  ok(!poor.Inventory['Bakery roll'] && poor.Player.Wallet.Points === 10 && poor._Log.some(l => /costs 15 points and \{\{user\}\} has 10/.test(l)), 'not enough points: refused, nothing paid');
  const meal = go(mall, { Time: '12:30' }, [ins('/Purchases', { Item: 'Restaurant meal', Used: true })]);
  ok(!meal.Inventory['Restaurant meal'] && meal.Player.Wallet.Points === 55, 'Used at once: paid, not kept');
  // seasonal: a hot drink in its season clears Chilled when bought and drunk in one reply; out of season it is refused
  const m = SEASON.findIndex(x => x === 'Winter') + 1, ms = SEASON.findIndex(x => x === 'Summer') + 1;
  const cold = go(go(S0, { Location: 'The Mall', Month: m }), { Time: '09:30' }, [{ op: 'replace', path: '/Player/Conditions/Chilled', value: { Effect: 'cold', Since: '' } }]);
  const tea = go(cold, { Time: '09:40' }, [ins('/Purchases', { Item: 'Hot spiced tea', Used: true })]);
  ok(!tea.Player.Conditions.Chilled && !tea.Inventory['Hot spiced tea'] && tea.Player.Wallet.Points === 88, 'a hot drink bought and drunk at once clears Chilled, never enters the Bag');
  const keep = go(go(cold, {}, [{ op: 'replace', path: '/Inventory', value: { 'Hot spiced tea': { Qty: 1, Kind: 'drink' } } }]), { Time: '09:40' }, [ins('/Purchases', { Item: 'Hot spiced tea', Used: true }), ins('/Consumables', 'Hot spiced tea')]);
  ok(keep.Inventory['Hot spiced tea'] && keep.Inventory['Hot spiced tea'].Qty === 1, 'bought and drunk at once (also in /Consumables): the one already in the Bag stays');
  const summer = go(go(S0, { Location: 'The Mall', Month: ms }), { Time: '09:40' }, [ins('/Purchases', { Item: 'Hot spiced tea', Price: 5 })]);
  ok(!summer.Inventory['Hot spiced tea'] && summer._Log.some(l => /sold here only in/.test(l)), 'out of season at its shop: refused, even with a Price');
}
