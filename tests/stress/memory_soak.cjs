// 1.61.1 (memory audit M13): a long synthetic chat that writes memory the way the narrator does (Known_facts, Knows, Journal lines,
// clues of several mysteries that open and get solved, invented characters who come and go, hooks), faster than the owner's chat so
// every list fills and overflows. Checks the memory invariants on every update and reports what was lost for good.
// Usage: node tests/stress/memory_soak.cjs [updates=3000] [--quiet]   (exit 1 when an invariant breaks)
// Invariants: a clue of an open mystery never leaves while a clue of a solved or cold one is on record; whatever leaves the
// narrator's view of a list goes to its archive (it is lost only when the archive itself overflows); the state and <current_state>
// stay within the budget below; 1.62.0: a pinned line never leaves the view while its list has room (Journal 20, a bond list 5).
// 1.63.0: nothing in the Journal, Knows or Known_facts is lost before it is folded.
const fs = require('fs'), path = require('path');
const { Schema, runEngine, initState, ROOT } = require('../harness.cjs');
const { memDiff, memEnd, tok501, LISTS } = require('../../tools/memory_lists.cjs');
const N = +(process.argv.find(a => /^\d+$/.test(a)) || 3000), QUIET = process.argv.includes('--quiet');
// measured at 1.61.1 on this soak: 3,000 updates 131 KB of stat_data and 4,200 tokens of 501 at most; 10,000 updates 148 KB and
// 5,400 (12 bonds; the owner's chat will have more). 1.63.0 (pins kept in view, the Chronicle): 10,000 updates 163 KB and 7,400
// (22 Chronicle entries, 20 kept pinned lines; the soak writes the Journal three times faster than the owner). 1.65.0 (M7, 501 by
// relevance): 10,000 updates 6,980 (this soak writes no statuses, relations or secrets; a mature state saves about a third). The budget leaves room; a memory batch that grows them past it says so here
const BUDGET = { bytes: 200000, t501: 9000 };
// owner's chat (1.34.2, 37 replies): Journal 1, Knows 1, Known_facts 13. Here: Known_facts as the owner, the rest several times faster
const RATE = { fact: 35, knows: 10, journal: 8, clue: 6, extra: 5, hook: 3, solve: 0.4, pin: 10, fold: 80 };   // pin: % of Journal lines (a fifth of that for facts)
let seed = 12345;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;   // deterministic (never Math.random)
const chance = p => rnd() * 100 < p, pick = a => a[Math.floor(rnd() * a.length)];
const FRIENDS = ['Etnie', 'Irene', 'Castor', 'Kanae', 'Zara', 'Aiden', 'Rei', 'Caine', 'Saffi', 'Gareth', 'Ruby', 'Kuroo'];
const PLACES = ['Canteen', 'Main Library', 'Courtyards', 'Gardens', 'Gymnasium', 'The Mall', 'Boathouse and Lake'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function apply(S, ops) {   // JSON patch as MVU's commands do it (replace / insert / remove), then the schema once
  const X = _.cloneDeep(S);
  for (const o of ops) {
    const segs = o.path.replace(/^\//, '').split('/'), last = segs.pop(), parent = segs.length ? _.get(X, segs) : X;
    if (o.op === 'remove') { if (Array.isArray(parent)) parent.splice(+last, 1); else if (parent) delete parent[last]; continue; }
    if (o.op === 'insert' && Array.isArray(parent)) { last === '-' ? parent.push(o.value) : parent.splice(+last, 0, o.value); continue; }
    _.set(X, [...segs, last], _.cloneDeep(o.value));
  }
  return Schema.parse(X);
}
let S = initState({ etnie: true }), abs = 8 * 60;
S = apply(S, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);
const threads = ['The scorched ledger', 'The bell at midnight', 'The empty locker', 'The violet ink', 'The sealed stair', 'The Arbiter Stone\'s crack'];
let nThread = threads.length, nClue = 0, nFact = 0, nExtra = 0, nHook = 0, broken = 0;
const tot = Object.fromEntries(Object.keys(LISTS).map(k => [k, { written: 0, left: 0, kept: 0, gone: 0, story: 0, folded: 0, lost: 0 }]));
let maxBytes = 0, max501 = 0, cut = 0;
const t0 = Date.now();
const fail = (i, msg) => { broken++; if (broken <= 10) console.log(`  ✗ update ${i}: ${msg}`); };
for (let i = 0; i < N; i++) {
  abs += 10 + Math.floor(rnd() * 20);
  if (abs % 1440 > 23 * 60) abs = (Math.floor(abs / 1440) + 1) * 1440 + 7 * 60;
  const d = Math.floor(abs / 1440), doy = d % 336, tm = abs % 1440;
  const W = { Year: 1 + Math.floor(d / 336), Month: 1 + Math.floor(doy / 28), Week: 1 + Math.floor(doy % 28 / 7), Day: DAYS[doy % 7],
    Time: `${String(Math.floor(tm / 60)).padStart(2, '0')}:${String(tm % 60).padStart(2, '0')}`, Location: PLACES[Math.floor(i / 6) % PLACES.length] };
  const who = _.uniq([pick(FRIENDS), ...(chance(50) ? [pick(FRIENDS)] : []), ...(chance(20) ? [pick(FRIENDS)] : [])]);
  const present = Object.fromEntries(who.map(w => [w, { Note: 'here' }]));
  const ops = Object.entries(W).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
  if (chance(RATE.extra)) { const x = chance(30) && nExtra > 5 ? `Clerk ${Math.floor(rnd() * nExtra)}` : `Clerk ${nExtra++}`; present[x] = { Note: 'at the counter' };
    ops.push({ op: 'replace', path: `/Extras/${x}`, value: { Who: `a clerk of the Registry, the ${x.split(' ')[1]}th`, Looks: 'grey coat, ink-stained fingers', Voice: 'clipped' } }); }
  ops.push({ op: 'replace', path: '/Scene/Present', value: present });
  ops.push(...who.map(w => ({ op: 'insert', path: '/Interactions/-', value: { With: w, Kind: 'talk' } })));
  for (const w of who) {
    if (S.Bonds[w] && chance(RATE.fact)) ops.push({ op: 'insert', path: `/Bonds/${w}/Known_facts/-`, value: `Fact ${nFact++}: ${w} likes the ${pick(['east', 'west', 'north'])} stairs` });
    if (S.Bonds[w] && chance(RATE.knows)) ops.push({ op: 'insert', path: `/Bonds/${w}/Knows/-`, value: `saw {{user}} at the ${W.Location} (${nFact})` });
  }
  if (chance(RATE.journal)) ops.push({ op: 'insert', path: '/Journal/-', value: `${chance(RATE.pin) ? '! ' : ''}Turning point ${i}: ${who.join(' and ')} at the ${W.Location}.` });
  if (S.Bonds[who[0]] && chance(RATE.pin / 5)) ops.push({ op: 'insert', path: `/Bonds/${who[0]}/Known_facts/-`, value: `! A fact ${who[0]} must never forget (${i})` });
  if (chance(RATE.clue)) { const open = Object.keys(S.Mysteries || {}).filter(t => S.Mysteries[t].Status === 'open'); const th = open.length && chance(85) ? pick(open) : pick(threads);
    ops.push({ op: 'replace', path: `/Clues/Clue ${nClue++}`, value: { Thread: th, Detail: `a detail seen at the ${W.Location}`, Where: W.Location } }); }
  if (chance(RATE.solve)) { const open = Object.keys(S.Mysteries || {}).filter(t => S.Mysteries[t].Status === 'open');
    if (open.length > 1) { const t = pick(open); ops.push({ op: 'replace', path: `/Mysteries/${t}`, value: { Status: chance(70) ? 'solved' : 'cold', Summary: 'settled' } }); threads.push(`New mystery ${nThread++}`); } }
  // 1.63.0: the update model answers the fold the rule card asks for, most of the time (the rest exercises the engine's plain fold)
  if (S.$ui.fold && chance(RATE.fold)) ops.push({ op: 'replace', path: '/Fold', value: `Folded at ${i}: ${S.$ui.fold.lines.map(l => String(l).replace(/^\[[^\]]*\]\s*/, '').split(' ').slice(0, 3).join(' ')).join(', ')}.`.split(' ').slice(0, S.$ui.fold.max).join(' ') });
  if (chance(RATE.hook)) ops.push({ op: 'replace', path: `/Hooks/Hook ${nHook++}`, value: { Note: `something ${who[0]} said`, Who: who[0], Kind: 'detail', Weight: 1 + Math.floor(rnd() * 3) } });
  const B = S, P = apply(B, ops);
  runEngine(P, B, `They talk at the ${W.Location}.
<UpdateVariable></UpdateVariable>`, 'soak', 'I talk with them.');
  const Nx = Schema.parse(P);
  const md = memDiff(B, Nx, ops);
  for (const k of Object.keys(LISTS)) for (const f of Object.keys(tot[k])) tot[k][f] += md[k][f] || 0;
  cut += md.Extras.cut || 0;
  if (md.openClues && Object.values(Nx.Clues || {}).some(c => ((Nx.Mysteries || {})[c.Thread] || {}).Status !== 'open')) fail(i, `${md.openClues} open clue(s) left while a closed one is on record`);
  for (const k of ['Clues', 'Extras']) if (md[k].left !== md[k].kept) fail(i, `${k}: ${md[k].left - md[k].kept} left the view without reaching the archive`);
  for (const k of ['Journal', 'Knows', 'Known_facts']) if (md[k].lost) fail(i, `${k}: ${md[k].lost} line(s) gone before they were folded`);
  if (md.pinsLost) fail(i, `${md.pinsLost} pinned line(s) left the view while their list had room`);
  // 1.64.0 (M6): what is recalled is never a line still in view, and stays within its cap
  { const nw = Nx.$ui.now || {}, inView = new Set([...(Nx.Journal || []), ...(Nx._Kept_from_earlier || [])]), strip = l => l.replace(/^\[([^\],]*)(?:, [^\]]*)?\]/, '[$1]');
    const rc = [...Object.values(nw.earlier || {}).flat(), ...(nw.recall || [])];
    if (rc.some(l => inView.has(strip(l))) || Object.values(nw.earlier || {}).some(a => a.length > 3) || (nw.recall || []).length > 2) fail(i, 'recall printed a line still in view, or more than its cap'); }
  const bytes = JSON.stringify(Nx).length; maxBytes = Math.max(maxBytes, bytes);
  if (i % 250 === 249 || i === N - 1) { const t = tok501(Nx); max501 = Math.max(max501, t || 0); if (!QUIET) console.log(`  update ${i + 1} (${Nx.World.Year > 1 ? 'Y' + Nx.World.Year + ' ' : ''}M${Nx.World.Month}): state ${Math.round(bytes / 1000)} KB, 501 ${t} tokens`); }
  S = Nx;
}
if (maxBytes > BUDGET.bytes) fail(N, `state ${maxBytes} bytes over the budget ${BUDGET.bytes}`);
if (max501 > BUDGET.t501) fail(N, `<current_state> ${max501} tokens over the budget ${BUDGET.t501}`);
const E = memEnd(S);
console.log(`${N} updates in ${((Date.now() - t0) / 1000).toFixed(0)} s; state max ${Math.round(maxBytes / 1000)} KB, 501 max ${max501} tokens`);
console.log('per list (written / left the view / kept in the archive / dropped from the archive / folded / lost before a fold):');
for (const [k, t] of Object.entries(tot)) console.log(`  ${k}: ${t.written} / ${t.left} / ${t.kept} / ${t.gone}${'folded' in t && k.match(/^(Journal|Knows|Known_facts)$/) ? ` / ${t.folded} / ${t.lost}` : ''}${k === 'Extras' ? ` (${cut} cut to a short record)` : ''}`);
console.log('at the end', JSON.stringify(E.sizes), `open Hooks ${E.hooks.length}, oldest ${Math.max(0, ...E.hooks.map(h => h.days || 0))} days`);
if (process.env.DEBUG) console.log('fold now', JSON.stringify(S.$ui.fold).slice(0, 300), JSON.stringify(S.$eng.fold), JSON.stringify(S.$eng.chron).slice(0, 200));
console.log(broken ? `${broken} INVARIANT FAILURES` : 'invariants held');
process.exitCode = broken ? 1 : 0;
module.exports = { tot, maxBytes, max501, broken };
