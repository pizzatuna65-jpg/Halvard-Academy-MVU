// 1.10.3 (token audit): a bond whose Trust or Tension moved a lot without a history row of its own (engine-side changes, the TEST
// card's start) crashed the defining-moments code (empty $Recent) or would have kept an old row as "defining".
const fs = require('fs'), path = require('path'), YAML = require('yaml');
const { Schema, runEngine, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('Bug hunt 1.10.3');
for (const f of ['Eldrasil_TEST_Rank7', 'Eldrasil_TEST_Year2']) {
  const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/test', f + '.json'), 'utf8')).data;
  let S = Schema.parse(YAML.parse(card.character_book.entries.find(e => e.id === 500).content)); runEngine(S, undefined, ''); S = Schema.parse(S);
  let T, err = '';
  try { T = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '17:00' }]); } catch (e) { err = e.message; }
  ok(!err && T, `${f}: the first update after the start runs (${err || 'no error'})`);
  const wrong = T ? Object.entries(T.Bonds).filter(([id, b]) => (b.$Defining || []).length > (S.Bonds[id].$Defining || []).length) : [];
  ok(T && !wrong.length, `${f}: no defining moment is added without a history row of its own` + (wrong.length ? ': ' + wrong.map(x => x[0]).join(', ') : ''));
}
