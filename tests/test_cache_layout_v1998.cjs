// 1.99.8 (bug-hunt audit 2026-10-23 T1): the prompt layout for a provider's prefix cache (build/build_card.py cache_layout). Lorebook
// Before holds only constant entries; every keyword entry sits in Lorebook After behind the constants, in its old order among the
// keyword entries; every constant Before/After entry ignores the World Info budget. Measure a chat: node tests/cache_replay.cjs <chat.jsonl>.
const fs = require('fs'), path = require('path');
const { initState, ok, ROOT } = require('./harness.cjs');
const { assemble } = require('./cache_replay.cjs');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/worldbook/index.json'), 'utf8'));
const E = card.character_book.entries.filter(e => e.enabled !== false), pos = e => (e.extensions || {}).position;
const kw = E.filter(e => !e.constant && (e.keys || []).length && [0, 1].includes(pos(e)));
const cst = E.filter(e => e.constant && [0, 1].includes(pos(e)));

console.log('the layout');
ok(kw.length > 300 && kw.every(e => pos(e) === 1 && e.position === 'after_char'), `all ${kw.length} keyword entries are in Lorebook After`);
ok(cst.every(e => e.extensions.ignore_budget), `the ${cst.length} constant entries ignore the budget`);
ok(Math.max(...cst.filter(e => pos(e) === 1).map(e => e.insertion_order)) < Math.min(...kw.map(e => e.insertion_order)), 'keyword lore follows every constant of Lorebook After');
{
  const of = id => src.find(s => s.uid === id), was = e => { const s = of(e.id); return s ? [s.position === 0 ? 0 : 1, s.order] : null; };
  const pairs = kw.filter(e => was(e)).map(e => [was(e), e.insertion_order]);
  ok(pairs.every(([a, x]) => pairs.every(([b, y]) => !(a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])) || x < y)), 'the keyword entries keep their old order (the former Before ones first)');
}

console.log('the reuse');
{
  const S = initState(), A = assemble(card, S, 'We walk to the Fire Dormitory.', ''), B = assemble(card, S, 'The Light Dormitory, then the Library.', '');
  const cut = parts => parts.findIndex(p => kw.some(e => (e.comment || String(e.id)) === p.name));
  const stable = parts => parts.slice(0, cut(parts)).map(p => p.text).join('\n');
  ok(cut(A) > 0 && cut(B) > 0 && stable(A) === stable(B) && stable(A).length > 40000, `two replies with different keyword lore start with the same ${Math.round(stable(A).length / 4)} tokens`);
}
