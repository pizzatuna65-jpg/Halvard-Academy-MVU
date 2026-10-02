// 1.42.0 (audit/AUDIT_2026-10-03_3_batch_perbaikan.md, Batch 1): every bug from audit part 1 (1.1-1.10 and the "Rendah" table).
// One regression check per bug.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const W = (o, x = [], opts) => [Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x), opts];
const go = (S, o, x, opts) => applyPatch(S, ...W(o, x, opts));
const present = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const S0 = go(initState({ etnie: true }), { Location: 'Fire Dormitory', Time: '09:00' });

console.log('1.1 dialogue-colour regexes');
{
  const R = JSON.parse(rd('src/regex/index.json'));
  ok(R.every(r => ![...String(r.findRegex)].some(ch => ch.charCodeAt(0) < 32)), 'no findRegex holds a control character (a JSON "\\b" is a backspace)');
  for (const r of R.filter(x => /dialogue colours: (stray tags|strip tags)/.test(x.scriptName))) {
    const m = r.findRegex.match(/^\/(.*)\/(\w*)$/s), rx = new RegExp(m[1], m[2]);
    ok('<say:Irene>"Hi."</say>'.replace(rx, '') === '"Hi."', `${r.scriptName.replace(/^.*: /, '')}: removes <say:Irene> and </say>`);
  }
}

console.log('1.3 consumables: one item-name key');
{
  const bag = go(S0, {}, [{ op: 'replace', path: '/Inventory', value: { 'Quick-dry powder': { Qty: 2, Kind: 'other' } } },
    { op: 'replace', path: '/Player/Conditions/Soaked', value: { Effect: 'wet', Since: '' } }]);
  const M = go(bag, { Time: '09:10' }, [{ op: 'insert', path: '/Consumables/-', value: 'a Quick-dry powder' }]);
  ok(!M.Player.Conditions.Soaked && M.Inventory['Quick-dry powder'].Qty === 1, `"a Quick-dry powder" clears Soaked and lowers the Bag (Qty ${M.Inventory['Quick-dry powder'].Qty})`);
}

console.log('1.5 "not itemised": lines counted as a multiset');
{
  let P = go(S0, {}, [{ op: 'replace', path: '/Player/Wallet/Points', value: 100 }]);
  const tea = [{ op: 'delta', path: '/Player/Wallet/Points', value: -3 }, { op: 'insert', path: '/Player/Wallet/Transactions/-', value: '-3 tea at the Snug' }];
  const ni = X => X.Player.Wallet.Transactions.filter(l => /not itemised/.test(l)).length, n0 = ni(P);
  P = go(P, { Time: '10:00' }, tea);
  P = go(P, { Time: '15:00' }, tea);
  ok(P.Player.Wallet.Points === 94 && ni(P) === n0 && P.Player.Wallet.Transactions.filter(l => l === '-3 tea at the Snug').length === 2, 'the same tea line twice: no false "(not itemised)"');
}

console.log('1.9 core dependencies pinned');
ok(/MagVarUpdate@[0-9a-f]{40}\//.test(rd('src/scripts/mvu_loader.js').split('\n')[0]), 'MVU bundle pinned to a commit');
ok(/tavern_resource@[0-9a-f]{40}\//.test(rd('src/scripts/schema.js').split('\n')[0]), 'mvu_zod pinned to a commit');

console.log('1.10 a full Bag says what it left behind');
{
  const I = Object.fromEntries(Array.from({ length: 45 }, (_, i) => [`Pebble ${i + 1}`, { Qty: 1, Kind: 'other' }]));
  const M = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Inventory', value: I }]);
  ok(Object.keys(M.Inventory).length === 40 && M.$ui.toasts.some(t => /Bag full/.test(t)) && M._Log.some(l => /Pebble 1, .*left behind/.test(l)), '45 items: 40 kept, a toast and a log line name the rest');
}
