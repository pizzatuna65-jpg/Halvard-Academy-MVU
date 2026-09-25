// Stress test (bug hunt 1.3.3): random Student Builder drafts (odd names, pacts with abilities, hidden magic) -> validate ->
// patch as MVU sees it -> schema + engine -> load back -> save again must change nothing. Usage: node tests/stress/fuzz_builder.cjs [n=300]
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ROOT } = require('../harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + `
return { TEMPLATES, blankDraft, blankTech, blankPact, blankMove, draftFromState, buildOps, validate, techRecord, PACT_KINDS, TYPES, builderMismatch, manaOf };`)();
const N = +process.argv[2] || 300;
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const NAMES = ['Spark', 'Flame Lash', 'a/b.c', '  spaced  out ', 'Ω-ray', 'Summon X', 'Quote"s', "Apostrophe's", 'Colon: yes', 'x'.repeat(60), 'Lash'];
const problems = new Map(); const report = (k, c) => { if (!problems.has(k)) problems.set(k, { n: 0, c }); problems.get(k).n++; };
const S0 = initState();
let ok = 0;
for (let i = 0; i < N; i++) {
  const d = rnd() < 0.5 ? Object.assign(U.blankDraft(), pick(U.TEMPLATES).make()) : U.blankDraft();
  d.name = pick(['Aria Vale', 'Ren', 'Zoë "Z" Ashford', 'A$&B']); d.age = pick([18, 19, 25, '18']);
  if (!d.types.length) { d.types = [pick(U.TYPES)]; d.dominant = d.types[0]; }
  d.mana = pick([50, 100, 102.5, 333.33, 999, 5000]);
  for (let k = ri(0, 3); k > 0; k--) { const t = Object.assign(U.blankTech(), { name: pick(NAMES) + k, type: pick(d.types), subtype: pick(['', 'Fire', 'Illusion', 'My own art']), effect: 'does a thing', mode: pick(['per_use', 'sustained', 'hybrid']), act: pick([0, 5, 12.5]), up: pick([0.1, 0.3]), trig: pick([0, 3]), open: false }); d.techs.push(t); }
  for (let k = ri(0, 2); k > 0; k--) {
    const kind = pick(Object.keys(U.PACT_KINDS)), p = Object.assign(U.blankPact(), { kind, name: pick(['Ember', 'Vex', 'Mote', 'Old One']) + k, tier: pick(U.PACT_KINDS[kind].tiers), presence: pick(['summoned', 'terms']), applied: true });
    for (let j = ri(0, 5); j > 0; j--) p.moves.push(Object.assign(U.blankMove(p), { name: pick(NAMES) + j, effect: 'hits', mode: pick(['per_use', 'sustained']), scale: pick(['Light', 'Standard', 'Heavy', 'Ultimate', '']), act: pick([3, 6, 7.5]), up: pick([0, 0.15]), open: false }));
    d.pacts.push(p);
  }
  if (rnd() < 0.3) { d.hidden.on = true; Object.assign(d.hidden.truth, { name: 'True ' + i, type: d.types[0], effect: 'secret', act: 20 }); d.hidden.cover = 'Cover'; d.hidden.cover_type = d.types[0]; }
  const ctx = JSON.stringify({ name: d.name, techs: d.techs.map(t => t.name), pacts: d.pacts.map(p => [p.kind, p.tier, p.name, p.moves.map(m => m.name)]) }).slice(0, 400);
  let V; try { V = U.validate(d, S0); } catch (e) { report('validate threw ' + e.message, ctx); continue; }
  if (V.blocking) continue;
  let S, d2;
  try {
    S = applyPatch(S0, U.buildOps(d, S0), { mvu: true });
    const miss = U.builderMismatch(d, S); if (miss.length) report('saved state differs from the draft: ' + miss.join(', '), ctx);
    d2 = U.draftFromState(S);
    const ops2 = U.buildOps(d2, S).slice(0, -2).map(o => o.path);
    if (ops2.length) report('load + save again changes ' + ops2.join(', '), ctx);
    if (U.validate(d2, S).blocking) report('a saved student no longer validates: ' + Object.values(U.validate(d2, S).E).flat().slice(0, 2).join(' | '), ctx);
    const T = S.Magic._Techniques;
    for (const p of d.pacts) for (const m of p.moves) if (!Object.keys(T).some(k => k.endsWith(': ' + String(m.name).replace(/[./]/g, '-').replace(/\s+/g, ' ').trim()))) report('ability missing from techniques', ctx);
    // cast every technique once, with every pact summoned: mana must drop by exactly what the techniques say (or stop at 0)
    const casts = Object.keys(T).filter(k => T[k].Cost_mode === 'per_use').map(k => ({ op: 'insert', path: '/Magic/Casts/-', value: { Technique: k, Times: 1 } }));
    const sum = [...new Set(Object.keys(S.Magic.Pacts))].map(pk => ({ op: 'replace', path: `/Magic/Pacts/${pk}/Summoned`, value: true }));
    const X = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '08:00' }, ...sum, ...casts]);
    const want = Math.max(0, S.Player.Vitals.Mana - Object.keys(T).filter(k => T[k].Cost_mode === 'per_use').reduce((a, k) => a + T[k].Activation, 0));
    if (Math.abs(X.Player.Vitals.Mana - want) > 0.01 && want > 0) report(`casting charged ${S.Player.Vitals.Mana - X.Player.Vitals.Mana}, techniques say ${S.Player.Vitals.Mana - want}`, ctx);
    ok++;
  } catch (e) { report('threw ' + e.message.slice(0, 120) + ' ' + (e.stack || '').split('\n')[1], ctx); }
}
console.log(`builder fuzz: ${N} drafts, ${ok} saved and checked`);
if (!problems.size) console.log('no problems');
for (const [k, v] of problems) console.log(`[${v.n}x] ${k}\n     ${v.c}`);
process.exitCode = problems.size ? 1 : 0;
