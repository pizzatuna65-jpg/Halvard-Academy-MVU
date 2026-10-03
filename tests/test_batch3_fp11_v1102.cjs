// 1.10.2 Batch 3 (planning/DRAFT_batch_fp7_fp11.md): FP11 varied, in-character reasons for NPC initiative.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { fromAbs };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = S => ejs.render(card.character_book.entries.find(e => e.id === 505).content, { getvar: k => _.get({ stat_data: S }, k) });
// 1.49.0: a day's reason may be one of the category's favours (data/initiative_asks.json favours)
const _AD = JSON.parse(read('data/initiative_asks.json')), ASKS = Object.fromEntries(Object.entries(_AD.categories).map(([k, v]) => [k, [...v, ...((_AD.favours.asks || {})[k] || [])]]));
const DAY = 1440;
const at = (S, d, hhmm, extra = []) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })), ...extra]); };
const fits = (cat, ask) => ASKS[cat].some(t => ask.startsWith(t.split('{')[0].replace('{{user}}', '{{user}}')) || new RegExp('^' + t.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\{user\}\}/g, '\\{\\{user\\}\\}').replace(/\{(place|thing|club|event)\}/g, '.+') + '$').test(ask));
// a chat where one NPC is bonded at Rank 3, NPC initiative often; collect the reasons on the days it fires
function run(id, days, extra = []) {
  let S = applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: 31 }, { op: 'replace', path: '/$ui/tune', value: { init_rate: 3 } }, { op: 'replace', path: '/$ui/wxfx', value: 'off' }]);
  S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } }]);
  S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: {} }]);
  if (id !== 'Etnie') { S = _.cloneDeep(S); S.Bonds[id] = { ...S.Bonds.Etnie, Rank: 3 }; delete S.Bonds.Etnie; }   // the rank is engine-owned: set it on the prior state
  if (extra.length) S = applyPatch(S, extra);
  const asks = [];
  for (let d = 2; d < days; d++) { S = at(S, d, '09:00'); if (S.$ui.initiative && S.$ui.initiative.id === id) asks.push([d, S.$ui.initiative.ask, S]); }
  return asks;
}

console.log('FP11 initiative reasons');
const et = run('Etnie', 200);
ok(et.length >= 20 && et.every(([, a]) => a), `Etnie reaches out on ${et.length} days in ~28 weeks, each with a reason`);
const first20 = et.slice(0, 20).map(x => x[1]);
const combos = new Set(et.map(x => x[1])).size;
ok(new Set(first20).size === Math.min(20, combos), `no reason repeats within 20 uses (${new Set(first20).size} distinct of ${combos} possible)`);
ok(et.every(([, a]) => fits('social', a)), 'Etnie (no category of her own) gets social reasons');
const [d0, a0, S0] = et[0];
ok(new RegExp(`Today's reason: Etnie ${a0.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&')}\\.`).test(render(S0)), '<now> adds the reason after the Stage');
const later = at(S0, d0, '15:00');
ok(later.$ui.initiative && later.$ui.initiative.ask === a0, 'latched for the day: a later update keeps the same reason');
ok(at(S0, d0, '09:00').$ui.initiative.ask === a0, 'swipe/replay gives the same reason');
const ruby = run('Ruby', 120);
ok(ruby.length && ruby.every(([, a]) => fits('withdrawn', a)), `a withdrawn character (Ruby) only gets withdrawn reasons: "${ruby[0] && ruby[0][1]}"`);
const tense = run('Ruby', 120, [{ op: 'replace', path: '/Bonds/Ruby/Tension', value: 80 }]);
const hot = tense.filter(([, , S]) => S.Bonds.Ruby.Tension >= 70), cool = tense.filter(([, , S]) => S.Bonds.Ruby.Tension < 70);
ok(hot.length && hot.every(([, a]) => fits('strained', a)) && cool.every(([, a]) => fits('withdrawn', a)), `strained reasons while Tension is 70+ ("${hot[0] && hot[0][1]}"), her own again once it fades`);
ok(Object.values(ASKS).flat().every(t => !/\{(?!place\}|thing\}|club\}|event\}|\{user\}\})/.test(t.replace(/\{\{user\}\}/g, ''))), 'templates use only known placeholders');
