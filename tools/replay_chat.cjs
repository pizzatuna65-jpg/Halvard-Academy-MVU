// 1.53.1 (narrator-load audit U10): replays the update blocks of an exported SillyTavern chat (.jsonl) through the CURRENT engine and
// prints, per narrator reply, what the engine had to correct. Offline; tools/audit_chat.py --mechanics runs it and writes the report.
//   node tools/replay_chat.cjs <chat.jsonl> [--memory]   -> JSON on stdout
// 1.61.1 (memory audit M13): --memory also reports, per reply, what left each memory list (Journal, Knows, Known_facts, Clues, Extras)
// and where it went (an archive, or gone for good), the state's size, <current_state>'s tokens (every few replies), and at the end
// the open Hooks' ages. tools/audit_chat.py --memory writes the report; tests/stress/memory_soak.cjs uses memDiff on a synthetic chat.
// The replay starts from the first state stored in the chat (MVU keeps one per message), else from the card's starting state. Each
// block is read as MVU reads it (a complete <JSONPatch> list), else as the engine's recovery reads a malformed one; a top-level list
// written under /Player is moved back to the root as the engine does; paths starting with "_" are dropped like MVU's zod helper.
const fs = require('fs'), path = require('path');
console.log = (...a) => console.error(...a);   // the harness reports on stdout; keep stdout for the JSON
const { initState, applyPatch, Schema } = require('../tests/harness.cjs');
const ROOT = path.join(__dirname, '..');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { recoverPatch, ROOT_LISTS };')();

const { memDiff, memEnd, tok501 } = require('./memory_lists.cjs');
const file = process.argv[2], MEM = process.argv.includes('--memory');
if (!file) { console.error('usage: node tools/replay_chat.cjs <chat.jsonl> [--memory]'); process.exit(2); }
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => l.trim());
const msgs = lines.slice(1).map(l => JSON.parse(l));
const stateOf = m => {
  let v = m && m.variables;
  if (Array.isArray(v) && v.length) v = v[Math.min(m.swipe_id || 0, v.length - 1)];
  return v && v.stat_data && v.stat_data.World ? v.stat_data : null;
};
const hasBlock = m => !m.is_user && !m.is_system && /<UpdateVariable>/i.test(String(m.mes || ''));

function readBlock(text) {
  const m = /<JSONPatch>([\s\S]*?)<\/JSONPatch>/i.exec(text);
  if (m) { try { const ops = JSON.parse(m[1].trim()); if (Array.isArray(ops)) return { ops, how: 'ok' }; } catch (e) { /* fall through to recovery */ } }
  const r = E.recoverPatch(text);
  if (r && r.ops && r.ops.length) return { ops: r.ops, how: 'repaired' };
  return { ops: [], how: 'unreadable', error: (r && r.error) || 'no list found' };
}
function fixStray(ops) {
  const moved = [];
  for (const o of ops) {
    if (typeof o.path !== 'string') continue;
    const segs = o.path.replace(/^\//, '').split('/');
    if (segs[0] === 'stat_data') segs.shift();
    let n = 0;
    if (/^(Player|World|Scene)$/.test(segs[0]) && (E.ROOT_LISTS.has(segs[1]) || segs[1] === 'Bag')) n = 1;
    if (segs[n] !== 'Bag' && !(n && E.ROOT_LISTS.has(segs[n]))) { o.path = '/' + segs.join('/'); continue; }
    moved.push(segs.slice(0, n + 1).join('.'));
    o.path = '/' + [segs[n] === 'Bag' ? 'Inventory' : segs[n], ...segs.slice(n + 1)].join('/');
  }
  return moved;
}
const stampOf = W => (W ? `${(W.Year || 1) > 1 ? `Y${W.Year} ` : ''}M${W.Month} W${W.Week} ${W.Day} ${W.Time}` : '');

const first = msgs.findIndex(hasBlock);
let start = -1;
for (let i = 0; i < msgs.length && (first < 0 || i < first); i++) if (stateOf(msgs[i])) start = i;
let S = start >= 0 ? Schema.parse(_.cloneDeep(stateOf(msgs[start]))) : initState();
const out = { chat: path.basename(file), start: start >= 0 ? `message ${start + 1}` : 'the card\'s starting state', replies: [] };
let said = '';
const every = Math.max(1, Math.round(msgs.filter(hasBlock).length / 40));
if (MEM) out.memory = { t0: tok501(S), bytes0: JSON.stringify(S).length, text: _.sum(msgs.map(m => JSON.stringify(m).length - JSON.stringify(m.variables || null).length)) / Math.max(1, msgs.length) };
msgs.forEach((m, i) => {
  if (m.is_user && !m.is_system) said = String(m.mes || '');
  if (!hasBlock(m)) return;
  const text = String(m.mes || ''), blk = readBlock(text), ops = blk.ops.filter(o => o && typeof o === 'object' && typeof o.path === 'string');
  const stray = fixStray(ops);
  const r = { msg: i + 1, read: blk.how, ops: ops.length, stray, dropped: [], log: [], missed: [], minutes: 0, at: '' };
  if (blk.error) r.error = blk.error;
  try {
    const log0 = (S._Log || []).slice(), abs0 = num(S.$eng && S.$eng.abs);
    const N = applyPatch(S, ops, { mvu: true, text, user: said });
    r.dropped = applyPatch.dropped.map(o => `${o.op} ${o.path}`);
    const seen = _.countBy(log0);
    r.log = (N._Log || []).filter(l => (seen[l] = (seen[l] || 0) - 1) < 0).map(l => String(l).replace(/^\[[^\]]*\]\s*/, ''));
    r.missed = ((N.$ui || {}).missed || []).slice();
    r.minutes = abs0 >= 0 && N.$eng && N.$eng.abs >= 0 ? N.$eng.abs - abs0 : 0;
    r.at = stampOf(N.World);
    if (MEM) { r.mem = memDiff(S, N, ops); r.bytes = JSON.stringify(N).length; if (out.replies.length % every === 0) r.t501 = tok501(N); }
    S = N;
  } catch (e) { r.error = 'engine: ' + String(e.message || e).slice(0, 120); }
  out.replies.push(r);
});
function num(v) { const x = Number(v); return Number.isFinite(x) ? x : -1; }
if (MEM) {
  // what MVU stores per floor (stat_data and its display and delta copies) against stat_data alone, from the newest floor that has it
  const last = [...msgs].reverse().find(stateOf), v = last && (Array.isArray(last.variables) ? last.variables[Math.min(last.swipe_id || 0, last.variables.length - 1)] : last.variables);
  const floor = v ? JSON.stringify(v).length : 0, stat = v ? JSON.stringify(v.stat_data).length : 0;
  Object.assign(out.memory, memEnd(S), { t1: tok501(S), bytes1: JSON.stringify(S).length, floor_ratio: stat ? floor / stat : 2.5,
    floors_with_state: msgs.filter(stateOf).length, messages: msgs.length });
}
process.stdout.write(JSON.stringify(out));
