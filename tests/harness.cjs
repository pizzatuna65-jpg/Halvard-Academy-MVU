// Node harness: loads schema.js + engine.js the way MVU would run them (zod 4 + lodash as globals).
// Usage: NODE_PATH=<dir with zod,lodash,yaml> node tests/<test>.cjs
const fs = require('fs'), path = require('path');
global._ = require('lodash');
global.z = require('zod');
const ROOT = path.join(__dirname, '..');
function loadSchema() {
  let src = fs.readFileSync(path.join(ROOT, 'src/scripts/schema.js'), 'utf8');
  src = src.replace(/^import .*$/m, '').replace(/export const Schema/, 'const Schema')
           .replace(/\$\(\(\) => \{[\s\S]*?\}\);\s*$/, '') + '\nreturn Schema;';
  return new Function(src)();
}
function loadEngine() {
  const src = fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8');
  const run = new Function(src + '\nreturn runEngine;')();
  return process.env.ENGINE_DIFF ? diffEngine(run, process.env.ENGINE_DIFF) : run;
}
// 1.20.0 (audit A5): ENGINE_DIFF=<an older engine.js> runs that engine on a copy of every input next to the current one and stops
// at the first run whose state (after, and before) or error differs. For refactors that must not change behaviour.
function diffEngine(run, oldFile) {
  const old = new Function(fs.readFileSync(oldFile, 'utf8') + '\nreturn runEngine;')();
  let calls = 0;
  // 1.46.0: ENGINE_DIFF_IGNORE=<regex> skips paths that differ on purpose ("after/$ui/capital/ev/0/ride"), for a list of explained differences
  const ign = process.env.ENGINE_DIFF_IGNORE ? new RegExp(process.env.ENGINE_DIFF_IGNORE) : null;
  const firstDiff = (a, b, at) => {
    if (_.isEqual(a, b) || (ign && ign.test(at))) return null;
    if (!_.isObject(a) || !_.isObject(b) || Array.isArray(a) !== Array.isArray(b)) return `${at}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`.slice(0, 600);
    for (const k of _.union(Object.keys(a), Object.keys(b))) { const d = firstDiff(a[k], b[k], `${at}/${k}`); if (d) return d; }
    return ign ? null : `${at}: key order or undefined values differ`;   // with ENGINE_DIFF_IGNORE, only ignored children differed
  };
  process.on('exit', () => console.error(`ENGINE_DIFF: ${calls} engine runs identical to ${path.basename(oldFile)}`));
  const nowDiff = { n: 0 };
  if (process.env.NOW_DIFF) process.on('exit', () => console.error(`NOW_DIFF: ${nowDiff.n} <now> renders identical`));
  return (S, B, ...rest) => {
    const [S2, B2] = _.cloneDeep([S, B]);   // one copy keeps objects S and B share (a test may pass a parsed save and its source)
    let e1 = null, e2 = null;
    try { old(S2, B2, ...rest); } catch (e) { e1 = e; }
    try { run(S, B, ...rest); } catch (e) { e2 = e; }
    const d = String(e1 && e1.message) !== String(e2 && e2.message) ? `error: ${e1 && e1.message} vs ${e2 && e2.message}` : firstDiff(S2, S, 'after') || firstDiff(B2, B, 'before');
    if (d) { console.error(`ENGINE_DIFF mismatch (run ${calls + 1}, old vs new) ${d}`); process.exit(3); }
    // 1.48.0: NOW_DIFF=<the older engine's card .json> also renders <now> (505) of that card on the older engine's state and of the
    // current card on the new state, and stops at the first run whose text differs (for moving <now> rules into the engine)
    if (process.env.NOW_DIFF && !e1 && !e2 && S.World && S2.World) {
      nowDiff.old = nowDiff.old || JSON.parse(fs.readFileSync(process.env.NOW_DIFF, 'utf8'));
      nowDiff.cur = nowDiff.cur || JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8'));
      const a = renderEntry(nowDiff.old, 505, S2), b = renderEntry(nowDiff.cur, 505, S);
      if (a !== b) { const al = a.split('\n'), bl = b.split('\n'); console.error(`NOW_DIFF mismatch (run ${calls + 1}): ${JSON.stringify(al.filter(x => !bl.includes(x)).slice(0, 3))} vs ${JSON.stringify(bl.filter(x => !al.includes(x)).slice(0, 3))}`.slice(0, 900)); process.exit(3); }
      nowDiff.n++;
    }
    calls++;
    if (e2) throw e2;
  };
}
const Schema = loadSchema(), runEngine = loadEngine();
const YAML = require('yaml');
function initState(opts = {}) {
  const ver = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/card/card.json'), 'utf8')).character_version;   // 1.3.4: as build_card.py does
  const raw = YAML.parse(fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/500.txt'), 'utf8').replace('@@VERSION@@', ver));
  const S = Schema.parse(raw); runEngine(S, undefined);
  // 1.3.1: Etnie is no longer bonded at the start; opts.etnie meets her first (her bond starts at Rank 3), as older suites assume
  return opts.etnie ? applyPatch(applyPatch(Schema.parse(S), [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: 'hugging you' } } }]), [{ op: 'replace', path: '/Scene/Present', value: {} }]) : Schema.parse(S);
}
// apply a JSONPatch the way MVU translates it (replace/delta/insert/remove), then schema + engine.
// opts.mvu: also emulate the MVU zod helper (StageDog mvu_zod.ts, isReadonlyPath): a command whose path has any segment
// starting with "_" is dropped before the schema runs, whoever wrote it (AI or a player tool). v1.0.3 (bug hunt F12).
// 1.3.3: like the MVU zod helper (util/mvu_zod.ts, checked upstream), each command is parsed on its own and a command whose
// result fails the schema is dropped (the previous value stays); applyPatch.dropped lists them. opts.strict throws instead.
function applyPatch(before, ops, opts = {}) {
  let S = _.cloneDeep(before);
  applyPatch.dropped = [];
  for (const op of ops) {
    const segs = op.path.replace(/^\//, '').split('/');
    if (opts.mvu && segs.some(x => x.startsWith('_'))) continue;
    const prev = _.cloneDeep(S);
    applyOp(S, op, segs);
    const r = Schema.safeParse(S);
    if (r.success) S = r.data;
    else if (opts.strict) throw r.error;
    else { applyPatch.dropped.push(op); S = prev; }
  }
  const P = Schema.parse(S);
  runEngine(P, before, opts.text || '', undefined, opts.user || '');   // 1.12.0: opts.user = the player's message
  return Schema.parse(P);
}
function applyOp(S, op, segs) {
  if (op.op === 'replace') _.set(S, segs, _.cloneDeep(op.value));
  else if (op.op === 'delta') _.set(S, segs, (_.get(S, segs) || 0) + op.value);
  else if (op.op === 'insert' || op.op === 'add') {
    const last = segs[segs.length - 1], at = segs.slice(0, -1);
    let cont = at.length ? _.get(S, at) : S;
    if (cont == null) { cont = last === '-' ? [] : {}; _.set(S, at, cont); }   // MVU creates the missing container
    if (Array.isArray(cont) && last === '-') cont.push(_.cloneDeep(op.value)); else if (typeof cont === 'object') cont[last] = _.cloneDeep(op.value);
  } else if (op.op === 'remove') {                         // arrays splice (as MVU does), records delete
    const last = segs[segs.length - 1], cont = segs.length > 1 ? _.get(S, segs.slice(0, -1)) : S;
    if (Array.isArray(cont)) cont.splice(+last, 1); else _.unset(S, segs);
  }
}
function extractPatch(text) {
  const m = text.match(/<JSONPatch>([\s\S]*?)<\/JSONPatch>/); return m ? JSON.parse(m[1]) : [];
}
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) fails++; };
process.on('exit', () => { if (fails) { console.log(`${fails} FAILED`); process.exitCode = 1; } else console.log('ALL PASSED'); });
// 1.48.0 (audit 2.7): a worldbook entry as SillyTavern and Prompt Template render it. An entry's leading @@ lines are decorators
// (stripped); "@@if <expr>" drops the entry before the scan unless <expr> holds (ST-Prompt-Template handler.ts applyDecorators).
// The Cast Sheet (509) is a group: its head 509, the per-NPC sheets (600+) still standing and its tail 599, in insertion order and
// joined with "\n" as SillyTavern joins one depth's entries (script.js worldInfoDepth), then rendered as one template.
// card: the parsed card (or its data); S: the state; gv: a getvar to use instead of reading S; locals: more names the template sees
// (1.99.6: lastUserMessage, as Prompt Template gives it).
function renderEntry(card, uid, S, gv, locals) {
  const ejs = require('ejs'), E = (card.data || card).character_book.entries, getvar = gv || (k => _.get({ stat_data: S }, k));
  const strip = e => { let c = e.content, keep = true; while (c.startsWith('@@')) { const nl = c.indexOf('\n'), line = c.slice(0, nl);
    if (line.startsWith('@@if ')) keep = keep && ejs.render(`<%- !!(${line.slice(5)}) %>`, { getvar }) === 'true'; c = c.slice(nl + 1); } return keep ? c : null; };
  const group = uid === 509 ? E.filter(e => e.id === 509 || e.id === 599 || (e.id >= 600 && e.id < 700)).sort((a, b) => a.insertion_order - b.insertion_order) : [E.find(e => e.id === uid)];
  return ejs.render(group.map(strip).filter(c => c !== null).join('\n'), { getvar, ...(locals || {}) });
}
// 1.60.0: a built lore entry's own text, without build_card's Lore_changes overlay (LORE_OPEN … LORE_CLOSE)
const LORE_OPEN_RX = /^((?:@@[^\n]*\n)*)<%_ \{ const _lc = getvar\('stat_data\.Campus_State\.Lore_changes'\)[^\n]*\n[^\n]*\n<%_ \} if \(!\(_lx && _lx\.Replace\)\) \{ _%>\n/;
const loreOf = c => { const m = LORE_OPEN_RX.exec(String(c)); return m ? m[1] + String(c).slice(m[0].length).replace(/\n<%_ \} \} _%>$/, '') : c; };
module.exports = { Schema, runEngine, initState, applyPatch, extractPatch, ok, ROOT, renderEntry, loreOf };
