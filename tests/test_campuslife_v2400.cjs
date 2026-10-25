// 2.4.0 (roadmap M3, stage 1): the Academy Newspaper's "Campus life" column: last week's public Own time lines (data/offscreen.json
// paper) and one "Overheard" rumour that reached campus, which (unlike the front page) does not live longer.
const fs = require('fs'), path = require('path'), _ = require('lodash');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { PRESENCE, NPC_GROUP };')();
const O = JSON.parse(rd('data/offscreen.json')), P = E.PRESENCE;
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const at = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const IDS = (P.roster || []).filter(id => E.NPC_GROUP[id] && E.NPC_GROUP[id] !== 'rival' && !(P.arr || {})[id]);
function run(off) {
  let S = _.cloneDeep(applyPatch(initState({ etnie: true }), [...W({ ...at(8), Time: '20:00', Location: 'Fire Dormitory' }), put('/Player/Profile/Dorm', 'Fire')]));
  for (const id of IDS) S.Bonds[id] = { ...(S.Bonds[id] || S.Bonds.Etnie), Rank: 3, $Recent: [], Trust: 50, Tension: 0 };
  if (off) S.$ui.off = [...(S.$ui.off || []), 'offscreen'];
  S = applyPatch(S, W({ Time: '20:10' }));
  const issues = [];
  for (let n = 9; n < 72; n++) {
    S = applyPatch(S, W({ ...at(n), Time: '08:00', Location: 'Fire Dormitory' }));
    const I = (S.$eng.paper || {}).issue;
    if (n % 7 === 0 && I) issues.push({ I: _.cloneDeep(I), S: _.cloneDeep(S) });
  }
  return issues;
}
const on = run(false), off = run(true);
const texts = O.items.filter(i => O.paper.items.includes(i.id)).map(i => new RegExp('^' + i.text.replace(/\{\w+\}/g, '.+') + '\\.$'));
const lines = on.flatMap(x => x.I.life || []);
ok(on.length >= 8 && on.every(x => Array.isArray(x.I.life) && x.I.life.length <= O.paper.max), `every Monday issue has a Campus life column of at most ${O.paper.max} (${on.length} issues)`);
ok(on.filter(x => x.I.life.length).length >= on.length / 2, `most issues print something (${on.map(x => x.I.life.length).join(' ')})`);
ok(lines.every(l => { const id = IDS.find(i => l.startsWith(i + ' ')); return id && texts.some(rx => rx.test(l.slice(id.length + 1))); }), 'every line is "<NPC> <a public Own time line>." (no letters, marks or sleep)');
ok(off.every(x => !(x.I.life || []).length), 'Own time off: the column stays empty');
ok(_.isEqual(on.map(x => [x.I.head, x.I.res, x.I.soon]), off.map(x => [x.I.head, x.I.res, x.I.soon])), 'the rest of the issue is unchanged by the column');
const over = on.filter(x => x.I.over);
ok(over.every(x => x.I.over !== x.I.head && (x.S.$eng.rum[x.I.over] || {}).paper == null), `"Overheard" is never the front page and is not printed news (no longer life; ${over.length} issues had one)`);
