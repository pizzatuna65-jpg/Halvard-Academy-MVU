// Audit token measure: render every enabled constant entry of the built card for a few states.
const fs = require('fs'), path = require('path');
process.chdir('D:/Halvard-Academy-MVU-main');
const h = require('D:/Halvard-Academy-MVU-main/tests/harness.cjs');
const _ = require('lodash'), ejs = require('ejs'), YAML = require('yaml');
const card = JSON.parse(fs.readFileSync('dist/Eldrasil_Halvard.json', 'utf8')).data;
const E = card.character_book.entries;
const tk = s => Math.round(s.length / 4);
function renderOne(e, S) {
  const getvar = k => _.get({ stat_data: S }, k);
  let c = e.content, keep = true;
  while (c.startsWith('@@')) { const nl = c.indexOf('\n'), line = c.slice(0, nl); if (line.startsWith('@@if ')) keep = keep && ejs.render(`<%- !!(${line.slice(5)}) %>`, { getvar }) === 'true'; c = c.slice(nl + 1); }
  if (!keep) return '';
  try { return ejs.render(c, { getvar }); } catch (err) { return 'RENDER_ERROR ' + err.message; }
}
function measure(label, S) {
  const rows = []; let tot = 0;
  for (const e of E) {
    if (!e.enabled || !e.constant) continue;
    const out = renderOne(e, S).replace(/\n{3,}/g, '\n\n');
    const t = tk(out.trim()); tot += t; if (t) rows.push([e.id, e.comment.slice(0, 50), t]);
  }
  rows.sort((a, b) => b[2] - a[2]);
  console.log(`\n== ${label}: constant entries total ~${tot} tok (chars/4)`);
  rows.slice(0, 25).forEach(r => console.log('  ', r.join(' | ')));
  return rows;
}
const save = JSON.parse(fs.readFileSync('tests/fixtures/saves/save_1.98.3.json', 'utf8'));
let S0 = h.Schema.parse(_.cloneDeep(save));
// quiet: alone in dorm at night
let Sq = h.applyPatch(S0, [{ op: 'replace', path: '/Scene/Present', value: {} }, { op: 'replace', path: '/World/Time', value: '22:30' }]);
measure('quiet (alone, dorm, night)', Sq);
// busy: 3 bonded NPCs present in the Canteen at lunch
let Sb = h.applyPatch(S0, [{ op: 'replace', path: '/World/Location', value: 'Canteen' }, { op: 'replace', path: '/World/Time', value: '12:10' }, { op: 'replace', path: '/World/Day', value: 'Mon' },
  { op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'eating' }, Kanae: { Note: 'reading' }, Etnie: { Note: 'chatting' } } }], { text: 'Irene looked up. "Sit," she said. Kanae nodded. Etnie waved.' });
Sb = h.applyPatch(Sb, [{ op: 'replace', path: '/World/Time', value: '12:20' }], { text: '"So," Irene said. Kanae turned a page. "Hi," said Etnie.' });
const rows = measure('busy (3 NPCs at lunch)', Sb);
fs.writeFileSync('D:/Halvard-Academy-MVU-main/audit/render_busy.txt',
  E.filter(e => e.enabled && e.constant).sort((a, b) => a.insertion_order - b.insertion_order).map(e => `\n######## ${e.id} ${e.comment}\n` + renderOne(e, Sb).replace(/\n{3,}/g, '\n\n')).join(''));
fs.writeFileSync('D:/Halvard-Academy-MVU-main/audit/render_quiet.txt',
  E.filter(e => e.enabled && e.constant).sort((a, b) => a.insertion_order - b.insertion_order).map(e => `\n######## ${e.id} ${e.comment}\n` + renderOne(e, Sq).replace(/\n{3,}/g, '\n\n')).join(''));
// the description + first_mes
console.log('\ncard description ~', tk(card.description), 'tok');
