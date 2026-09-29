// 1.11.3: the VectFox cleaning patterns (docs/vectfox_cleaning_patterns.json) keep the in-world time and place for EventBase
// in every form the narrator writes the Analysis line (rule 503), from Year 2 with its year, and pass VectFox's import check.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
const pats = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/vectfox_cleaning_patterns.json'), 'utf8'));
const clean = t => pats.filter(p => p.enabled !== false).reduce((s, p) => s.replace(new RegExp(p.pattern, p.flags || 'g'), p.replacement || ''), t).replace(/\n{3,}/g, '\n\n').trim();
const msg = a => `<StatusPlaceHolderImpl/>\n\nIrene looks up.\n\n<gold:measured>"Curfew is at eight,"</gold:measured> she says.\n\n<!-- GFX_START -->\n<div style="x">NOTICE: Library closed.</div>\n<!-- GFX_END -->\n\n<UpdateVariable>\n<Analysis>\n${a}\n- Present: Irene\n</Analysis>\n<JSONPatch>\n[{"op": "replace", "path": "/World/Time", "value": "13:40"}]\n</JSONPatch>\n</UpdateVariable>`;
const cases = [
  ['the 503 example', '- Time: M1 W2 Wed 13:30 → M1 W2 Wed 13:40 (+10 min) | Location: Canteen → Courtyards', 'M1 W2 Wed 13:40, at Courtyards'],
  ['place unchanged, no arrow', '- Time: M1 W2 Wed 13:30 → M1 W2 Wed 13:40 (+10 min) | Location: Courtyards (unchanged)', 'M1 W2 Wed 13:40, at Courtyards'],
  ['Year 2 date', '- Time: Y2 M1 W2 Wed 13:30 → Y2 M1 W2 Wed 13:40 (+10 min) | Location: Canteen → Courtyards', 'Y2 M1 W2 Wed 13:40, at Courtyards'],
  ['time and place on two lines, a sub-spot', '- Time: M1 W2 Wed 13:30 → M1 W2 Wed 13:40 (+10 min)\n- Location: Canteen → Main Library — west wing', 'M1 W2 Wed 13:40, at Main Library — west wing'],
  ['ASCII arrow', '- Time: M1 W2 Wed 13:30 -> M1 W2 Wed 13:40 | Location: Canteen -> Courtyards', 'M1 W2 Wed 13:40, at Courtyards'],
];
for (const [label, a, want] of cases) {
  const out = clean(msg(a));
  ok(out.endsWith(`[In-world time: ${want}]`) && !/UpdateVariable|JSONPatch|StatusPlaceHolder|<gold|GFX_|<div/.test(out) && /"Curfew is at eight," she says\.\n\nNOTICE: Library closed\./.test(out), `${label}: prose kept, block dropped, "${want}"`);
}
ok(clean(msg('- Present: nobody')) === 'Irene looks up.\n\n"Curfew is at eight," she says.\n\nNOTICE: Library closed.', 'no Time line: the block is still dropped');
// VectFox 3.6.9 (commit 3623dc8) core/text-cleaning.js importPatterns: at most 300 characters, no nested quantifier motif
const REDOS_MOTIF_RE = /\([^)]*[+*][^)]*\)\s*[+*]|\([^)]*\|[^)]*\)\s*[+*]/;
ok(pats.every(p => p.pattern.length <= 300 && !REDOS_MOTIF_RE.test(p.pattern)), 'every pattern passes VectFox\'s import check (length, ReDoS motif)');
const f503 = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/503.txt'), 'utf8');
ok(/"M\? W\? Day HH:MM" \(from campaign Year 2: "Y\? M\? W\? Day HH:MM"\)/.test(f503), 'rule 503 asks for the year from campaign Year 2, as the card dates things');
