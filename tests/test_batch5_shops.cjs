// Playtest Batch 5 (1.9.5): seasonal stock with real effects in several shops, item effects in the engine, shop and Bag, Mall links.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { wxDay, fromAbs, SEASONS };')();
global.window = { parent: { document: {} } };
const U = new Function(read('src/scripts/ui.js') + '\nreturn { PANELS, view, renderProfile, DATA, locCard };')();
const shop = JSON.parse(read('data/shop.json')).items, gifts = JSON.parse(read('data/gift_prefs.json'));
const DAY = 1440, SEED = 424242;
// 1.16.1 (audit B2): a used item must be in the Bag, so the student carries one of each item these checks use
const BAG = ['Quick-dry powder', 'Hot spiced tea', 'Mulled apple cider', 'Ember pouch', 'Rain-ward charm', 'Salted lemon water', 'Elderflower cold syrup', 'Blossom honey cake', 'The Vigil', 'Star Cookie'];
const S0 = applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: SEED }, { op: 'replace', path: '/Inventory', value: Object.fromEntries(BAG.map(k => [k, { Qty: 9, Kind: 'other' }])) }]);
function at(S, d, hhmm, loc, extra = []) {
  const [h, mi] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + mi);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : []), ...extra]);
}
const later = (S, mins, loc, extra = []) => { const a = S.$eng.abs + mins, T = E.fromAbs(a); return at(S, Math.floor(a / DAY), T.Time, loc, extra); };
const use = name => ({ op: 'insert', path: '/Consumables/-', value: name });

console.log('Playtest Batch 5: seasonal stock');
{
  const seasonal = shop.filter(i => Array.isArray(i.season));
  ok(seasonal.every(i => i.gear || i.use) && U.DATA.shop.filter(i => Array.isArray(i.season)).every(i => i.effect), 'every seasonal item has a mechanical effect, worded for the shop');
  for (const s of E.SEASONS.filter((x, i, a) => a.indexOf(x) === i)) {
    const inS = seasonal.filter(i => i.season.includes(s)), shops = new Set(inS.map(i => i.shop.split(' — ')[0]));
    ok(inS.length >= 5 && shops.size >= 3, `${s}: ${inS.length} useful seasonal items in ${shops.size} shops`);
  }
  const kinds = s => new Set(seasonal.filter(i => i.season.includes(s)).flatMap(i => [i.gear, i.use && i.use.buff, ...((i.use && i.use.clears) || [])]).filter(Boolean));
  ok(kinds('Spring').has('waterproof') && kinds('Summer').has('sun') && kinds('Summer').has('Overheated') && kinds('Winter').has('warm') && kinds('Winter').has('Chilled') && kinds('Autumn').has('Soaked'),
    'each season covers its weather: rain in spring, heat in summer, wet in autumn, cold in winter');
  ok(new Set(shop.map(i => i.item + '|' + i.shop)).size === shop.length, 'no duplicate listings');
  const giftNames = JSON.stringify(gifts);
  ok(['Lined winter cloak', 'Straw sun hat', 'Hot chocolate with cream'].every(n => shop.some(i => i.item === n)) && /Lined winter cloak/.test(giftNames), 'items named in gift tastes keep their names');
  const guide = read('src/worldbook/custom/content/506.txt');
  ok(/- Ember pouch: 15 pts; The Tinker's Bench;.*in season: Autumn, Winter; When used: warm: holds off Chilled for 4 hours/.test(guide) && /insert its exact name into \/Consumables\/-/.test(guide), 'Price Guide states season and effect, and how to report use');
  ok(/whose Price Guide line says "When used"/.test(read('src/worldbook/custom/content/502.txt')), 'narrator rule: report used items in /Consumables');
  // the shop greys out-of-season stock and shows effects
  U.view.act = 'shop'; U.view.shop = 'All';
  const spring = at(S0, 10, '10:00', 'The Mall'), winter = at(S0, 280, '10:00', 'The Mall');
  const hs = U.PANELS.activities.render(spring), hw = U.PANELS.activities.render(winter);
  const row = (h, n) => (h.split('<tr').find(r => r.includes(`<b>${n}</b>`)) || '');
  ok(/pill oos/.test(row(hs, 'Ember pouch')) && /disabled/.test(row(hs, 'Ember pouch')) && !/pill oos/.test(row(hw, 'Ember pouch')), 'Ember pouch: out of season (and not buyable) in spring, stocked in winter');
  ok(!/pill oos/.test(row(hs, 'Blossom honey cake')) && /pill oos/.test(row(hw, 'Blossom honey cake')), 'Blossom honey cake: spring only');
  ok(/class="sub fx">When used: \+10 stamina/.test(row(hs, 'Blossom honey cake')), 'the shop row shows the effect');
  const bag = applyPatch(spring, [{ op: 'insert', path: '/Inventory/Rain-ward charm', value: { Qty: 2, Kind: 'gear' } }]);
  U.view.tab = 'bag';
  ok(/Rain-ward charm[\s\S]*?class="sub fx">When used: waterproof: no Soaked from rain or snow for 3 hours/.test(U.renderProfile(bag)), 'the Bag shows what a carried item does');
}

console.log('Item effects in the engine');
const winterDay = (() => { for (let d = 252; d < 1500; d++) { const bk = E.wxDay(SEED, d).blocks[0]; if (Math.floor((d % 336) / 28) + 1 < 12 && bk.temp <= -2 && !['Rain', 'Storm'].includes(bk.sky) && !bk.wind) return d; } })();
const rainDay = (() => { for (let d = 3; d < 1500; d++) { const bk = E.wxDay(SEED, d).blocks[1]; const m = Math.floor((d % 336) / 28) + 1; if (m <= 3 && bk.sky === 'Rain' && !bk.wind && !bk.snow) return d; } })();
const hotDay = (() => { for (let d = 84; d < 1500; d++) { const D = E.wxDay(SEED, d), bk = D.blocks[1]; if (D.season === 'Summer' && bk.temp >= 28 && bk.temp < 31 && ['Clear', 'Cloudy'].includes(bk.sky)) return d; } })();
ok(winterDay > 0 && rainDay > 0 && hotDay > 0, `fixtures: subzero winter morning ${winterDay}, spring rain ${rainDay}, summer heat ${hotDay}`);
{
  const C = later(at(S0, winterDay, '08:59', 'Canteen', [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 60 }]), 1, 'Sports Field');
  const wet = applyPatch(C, [{ op: 'insert', path: '/Exposure/-', value: { Kind: 'soaked', Cause: 'the lake' } }]);
  ok(wet.Player.Conditions.Soaked && wet.Player.Conditions.Chilled, 'soaked and chilled on a subzero morning');
  const dry = applyPatch(wet, [use('Quick-dry powder')]);
  ok(!dry.Player.Conditions.Soaked && dry.Player.Conditions.Chilled && dry._Log.some(l => /Quick-dry powder: Soaked cleared/.test(l)), 'Quick-dry powder clears Soaked (the chill stays)');
  const tea = applyPatch(dry, [use('Hot spiced tea')]);
  ok(!tea.Player.Conditions.Chilled, 'Hot spiced tea clears Chilled');
  const cider = applyPatch(wet, [use('a Mulled apple cider')]);
  ok(!cider.Player.Conditions.Chilled && cider.Player.Vitals.Stamina === wet.Player.Vitals.Stamina + 5, 'Mulled apple cider: clears Chilled and +5 stamina (article tolerated)');
  // timed gear: an Ember pouch keeps the cold off like a scarf for four hours
  const bare = later(C, 40, 'Sports Field');
  ok(bare.Player.Conditions.Chilled, 'forty minutes outdoors at freezing without gear: Chilled');
  const pouch = later(applyPatch(C, [use('Ember pouch')]), 40, 'Sports Field');
  ok(!pouch.Player.Conditions.Chilled && pouch.$eng.wxs.buff.warm === C.$eng.abs + 240, 'Ember pouch: no chill for the same forty minutes (warm until +4 h)');
  const worn = later(applyPatch(C, [{ op: 'insert', path: '/Inventory/Fleece-lined boots', value: { Qty: 1, Kind: 'gear' } }]), 40, 'Sports Field');
  ok(!worn.Player.Conditions.Chilled, 'Fleece-lined boots in the Bag count as warm gear by name');
  const gone = later(applyPatch(C, [use('Ember pouch')]), 300, 'Sports Field');
  ok(!(gone.$eng.wxs.buff || {}).warm, 'the pouch runs out after four hours');
}
{
  const R = at(S0, rainDay, '13:00', 'Canteen');
  const plain = later(later(R, 1, 'Sports Field'), 30, 'Sports Field');
  ok(plain.Player.Conditions.Soaked, 'half an hour in spring rain unprotected: Soaked');
  const ward = later(later(applyPatch(R, [use('Rain-ward charm')]), 1, 'Sports Field'), 30, 'Sports Field');
  ok(!ward.Player.Conditions.Soaked, 'Rain-ward charm: dry for the same half hour');
}
{
  const H = later(at(S0, hotDay, '12:59', 'Canteen'), 1, 'Sports Field');
  const hot = later(H, 70, 'Sports Field');
  ok(hot.Player.Conditions.Overheated, 'over an hour in summer sun: Overheated');
  const shirt = later(applyPatch(H, [{ op: 'insert', path: '/Inventory/Linen summer shirt', value: { Qty: 1, Kind: 'gear' } }]), 70, 'Sports Field');
  ok(!shirt.Player.Conditions.Overheated, 'Linen summer shirt gives shade like a sun hat');
  const water = applyPatch(hot, [use('Salted lemon water')]);
  ok(!water.Player.Conditions.Overheated && water._Log.some(l => /Salted lemon water: Overheated cleared, \+10 stamina/.test(l)), 'Salted lemon water clears Overheated and restores stamina');
}
{
  let S = applyPatch(at(S0, 30, '10:00', 'Canteen'), [{ op: 'insert', path: '/Player/Conditions/Head cold', value: { Effect: 'x' } }]);
  S.$eng.wxs.hc = S.$eng.abs / DAY + 4 | 0;
  S = applyPatch(S, [use('Elderflower cold syrup')]);
  ok(S.$eng.wxs.hc === Math.floor(S.$eng.abs / DAY) + 1, 'Elderflower cold syrup: the head cold ends by the next day');
  const next = at(S, Math.floor(S.$eng.abs / DAY) + 1, '08:00', 'Canteen');
  ok(!next.Player.Conditions['Head cold'], '...and it is gone the next morning');
  const cake = applyPatch(applyPatch(at(S0, 12, '10:00', 'Canteen'), [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 40 }]), [use('Blossom honey cake')]);
  ok(cake.Player.Vitals.Stamina === 50 && cake.Consumables.length === 0, 'Blossom honey cake: +10 stamina; the list is emptied');
  const vig = applyPatch(at(S0, 12, '10:00', 'Canteen'), [use('The Vigil'), use('Star Cookie')]);
  ok(vig.$ui.sleep && vig.$ui.sleep.vigil && !vig._Log.some(l => /Star Cookie:/.test(l)), 'The Vigil still works; items without an effect do nothing');
  const again = applyPatch(at(S0, 12, '10:00', 'Canteen'), [{ op: 'replace', path: '/Player/Vitals/Stamina', value: 40 }]);
  ok(JSON.stringify(applyPatch(again, [use('Blossom honey cake')])) === JSON.stringify(applyPatch(again, [use('Blossom honey cake')])), 'swipe/replay gives the same result');
}

console.log('Mall connections');
{
  const L = JSON.parse(read('data/locations.json'));
  const shops = Object.values(L).filter(l => l.kind === 'shop');
  ok(shops.length === 10 && shops.every(l => l.connections.includes('mall') && L.mall.connections.includes(l.id)), `every Mall shop links to The Mall and back (${shops.length})`);
  ok(shops.every(l => l.walk_min === L.mall.walk_min + 1 && l.near.some(([o, m]) => o === 'mall' && m === 1)), 'each shop is a one-minute walk inside the Mall');
  const S = at(S0, 10, '10:00', 'The Mall');
  ok(shops.every(l => new RegExp(`Connected to</dt><dd>[^]*?data-loc="mall"`).test(U.locCard(l.id, S, 'mall', { x: 50, y: 50 }) || '')), 'each shop card shows Connected to: The Mall');
}
