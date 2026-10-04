// 1.61.1 (memory audit M13): what each update did to the card's memory lists. Used by tools/replay_chat.cjs --memory (a real chat)
// and tests/stress/memory_soak.cjs (a synthetic one). Needs the test harness's globals (lodash) and a built card for tok501.
//   memDiff(S, N, ops) -> { <list>: { written, left, kept, gone, story, folded?, lost?, cut? }, openClues, pinsLost }
//                         S = state before, N = after, ops = the block
//   memEnd(S)          -> { sizes: {...}, hooks: [{ key, days, weight, state }] }
//   tok501(S)          -> <current_state> (entry 501) as rendered, in tokens (chars / 3.6, as tests/token_audit.cjs)
// A list's entries are "in view" (the narrator reads them) or "kept" (an archive only the UI reads, or a short record for Extras).
// left = left the view this update; kept = of those, now in an archive; gone = lost for good this update (left the view without an
// archive, or dropped out of an archive); story = removed by an explicit "remove" in the block (the story's choice, not forgetting).
// 1.63.0 (memory audit M5): the Journal, Knows and Known_facts also have a queue of lines waiting for a fold (QUEUES). folded = lines
// that left the queue (or a list's earlier fold line) with a fold; lost = lines that left the view or the queue with no fold: always 0
// unless a safety cap was hit (an archive dropping a folded line is not a loss).
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

const arr = v => (Array.isArray(v) ? v.map(String) : []);
const keys = v => (v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v) : []);
const bondLines = (S, field) => Object.entries((S && S.Bonds) || {}).flatMap(([id, b]) => arr(b && b[field]).map(l => `${id}\u0000${l}`));
// each list: what is in view, what is kept, and which "remove" paths count as the story's own
const LISTS = {
  Journal: { view: S => [...arr(S.Journal), ...arr(S._Kept_from_earlier)], kept: S => arr((S.$ui || {}).archive), story: /^\/Journal\// },   // 1.62.0: pinned lines kept in view
  Knows: { view: S => bondLines(S, 'Knows'), kept: S => bondLines(S, '$Knows_old'), story: /^\/Bonds\/[^/]+\/Knows\// },
  Known_facts: { view: S => bondLines(S, 'Known_facts'), kept: S => bondLines(S, '$Known_old'), story: /^\/Bonds\/[^/]+\/Known_facts\// },
  Clues: { view: S => keys(S.Clues), kept: S => keys((S.$ui || {}).cluearch), story: /^\/Clues\// },
  Extras: { view: S => keys(S.Extras), kept: S => [...keys((S.$ui || {}).xold), ...keys((S.$ui || {}).xgone)], story: /^\/Extras\// },
};
// what the block itself wrote to a list (an insert or a new key), for the narrator's writing rate
const WRITES = { Journal: /^\/Journal\/(?:-|\d+)$/, Knows: /^\/Bonds\/[^/]+\/Knows\/(?:-|\d+)$/, Known_facts: /^\/Bonds\/[^/]+\/Known_facts\/(?:-|\d+)$/,
  Clues: /^\/Clues\/[^/]+$/, Extras: /^\/Extras\/[^/]+$/ };

// per list: groups of waiting lines (one per character for Knows / Known_facts) and the mark that changes when a group is folded
const tailQ = (b, oldKey, qKey) => { const o = arr(b && b[oldKey]), q = Math.min(Number(b && b[qKey]) || 0, o.length); return q ? o.slice(o.length - q) : []; };
const FOLDED = /^\[until [^\]]*\]/, unY = l => String(l).replace(/^\[Y\d+ /, '[');
const QUEUES = {
  Journal: { q: S => ({ '': arr((S.$eng || {}).jq) }), mark: S => ({ '': JSON.stringify(arr(S._Chronicle)) }), view: S => ({ '': LISTS.Journal.view(S) }) },
  Knows: { q: S => _.mapValues((S && S.Bonds) || {}, b => tailQ(b, '$Knows_old', '$Knows_q')), mark: S => _.mapValues((S && S.Bonds) || {}, b => arr(b && b.Knows).find(l => FOLDED.test(l)) || ''),
    view: S => _.mapValues((S && S.Bonds) || {}, b => arr(b && b.Knows)) },
  Known_facts: { q: S => _.mapValues((S && S.Bonds) || {}, b => tailQ(b, '$Known_old', '$Known_q')), mark: S => _.mapValues((S && S.Bonds) || {}, b => arr(b && b.Known_facts).find(l => FOLDED.test(l)) || ''),
    view: S => _.mapValues((S && S.Bonds) || {}, b => arr(b && b.Known_facts)) },
};

function memDiff(S, N, ops) {
  ops = (ops || []).filter(o => o && typeof o.path === 'string');
  const removedByStory = name => ops.some(o => o.op === 'remove' && LISTS[name].story.test(o.path));
  const out = {};
  for (const [name, L] of Object.entries(LISTS)) {
    const v0 = new Set(L.view(S)), v1 = new Set(L.view(N)), k0 = new Set(L.kept(S)), k1 = new Set(L.kept(N));
    const left = [...v0].filter(x => !v1.has(x)), story = removedByStory(name);
    const kept = left.filter(x => k1.has(x)).length;
    const gone = left.filter(x => !k1.has(x)).length + [...k0].filter(x => !k1.has(x) && !v1.has(x)).length;
    const written = ops.filter(o => (o.op === 'insert' || o.op === 'add' || (o.op === 'replace' && name !== 'Journal')) && WRITES[name].test(o.path)
      && (name !== 'Clues' && name !== 'Extras' ? true : !v0.has(decodeURIComponent(o.path.split('/')[2] || '')))).length;
    out[name] = { written, left: story ? 0 : left.length, kept: story ? 0 : kept, gone: story ? 0 : gone, story: story ? left.length : 0 };
  }
  for (const [name, Q] of Object.entries(QUEUES)) {
    const q0 = Q.q(S), q1 = Q.q(N), m0 = Q.mark(S), m1 = Q.mark(N), v0 = Q.view(S), v1 = Q.view(N);
    let folded = 0, lost = 0;
    for (const g of Object.keys(v0)) {
      if (!(g in v1)) continue;   // a bond record removed by the story
      const inN = new Set([...(v1[g] || []), ...(q1[g] || [])].map(unY)), foldNow = m0[g] !== m1[g];
      const outQ = (q0[g] || []).filter(l => !inN.has(unY(l)));
      if (foldNow) folded += outQ.length; else lost += outQ.length;
      if (!removedByStory(name)) for (const l of v0[g] || []) if (!inN.has(unY(l))) { if (FOLDED.test(l) && foldNow) folded++; else if (!(q0[g] || []).includes(l)) lost++; }
    }
    Object.assign(out[name], { folded, lost });
  }
  // Extras squeezed from a full archived record into a short one (Who, Looks, Voice)
  const xo0 = new Set(keys((S.$ui || {}).xold)), xg1 = new Set(keys((N.$ui || {}).xgone));
  out.Extras.cut = [...xo0].filter(k => xg1.has(k) && !keys((S.$ui || {}).xgone).includes(k)).length;
  // a clue that left while its mystery was still open (and the story did not remove it)
  const my = (N && N.Mysteries) || {};
  out.openClues = removedByStory('Clues') ? 0 : keys(S.Clues).filter(k => !(k in ((N && N.Clues) || {})) && ((my[(S.Clues[k] || {}).Thread] || {}).Status || 'open') === 'open').length;
  // 1.62.0 (memory audit M3): pinned lines that left the view although their list had room (the Journal keeps 20, a bond list 5)
  const pin = l => /^(?:\[[^\]]*\]\s*)?!/.test(l), v1 = new Set(LISTS.Journal.view(N));
  out.pinsLost = !removedByStory('Journal') && LISTS.Journal.view(S).some(l => pin(l) && !v1.has(l)) && arr(N._Kept_from_earlier).length < 20 ? 1 : 0;
  for (const [id, b] of Object.entries((S && S.Bonds) || {})) for (const f of ['Knows', 'Known_facts']) {
    const nb = ((N && N.Bonds) || {})[id] || {}, now = new Set(arr(nb[f]));
    if (arr(b[f]).some(l => pin(l) && !now.has(l)) && arr(nb[f]).filter(pin).length < 5 && !removedByStory(f)) out.pinsLost++;
  }
  return out;
}

function memEnd(S) {
  const B = Object.values(S.Bonds || {});
  const max = f => Math.max(0, ...B.map(b => arr(b && b[f]).length));
  const now = Number((S.$eng || {}).abs);
  const hooks = Object.entries(S.Hooks || {}).map(([key, h]) => ({ key, days: now >= 0 && Number(h.$born) >= 0 ? Math.round((now - h.$born) / 1440) : null,
    weight: h.Weight, state: h._State || '' }));
  return {
    sizes: { Journal: arr(S.Journal).length, kept_pinned: arr(S._Kept_from_earlier).length, journal_waiting: arr((S.$eng || {}).jq).length,
      chronicle: _.countBy((Array.isArray((S.$eng || {}).chron) ? S.$eng.chron : []).map(m => 'L' + ((m && m.L) || 1))), knows_waiting_max: Math.max(0, ...B.map(b => Number(b && b.$Knows_q) || 0)),
      facts_waiting_max: Math.max(0, ...B.map(b => Number(b && b.$Known_q) || 0)), journal_archive: arr((S.$ui || {}).archive).length, Knows_max: max('Knows'), Knows_old_max: max('$Knows_old'),
      Known_facts_max: max('Known_facts'), Known_old_max: max('$Known_old'), Clues: keys(S.Clues).length, clue_archive: keys((S.$ui || {}).cluearch).length,
      Extras: keys(S.Extras).length, xold: keys((S.$ui || {}).xold).length, xgone: keys((S.$ui || {}).xgone).length, Hooks: hooks.length, bonds: B.length },
    hooks,
  };
}

let CARD = null;
function tok501(S) {
  const { renderEntry } = require('../tests/harness.cjs');
  CARD = CARD || JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8'));
  try { return Math.round(renderEntry(CARD, 501, S).length / 3.6); } catch (e) { return null; }
}

module.exports = { LISTS, memDiff, memEnd, tok501 };
