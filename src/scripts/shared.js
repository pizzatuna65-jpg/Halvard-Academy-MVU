// ---- shared.js (1.43.0, audit batch 2): one source for the constants and small rules the engine, the panels (ui.js), the bracelet
// (statusbar.html) and the <now> entry (505) all use. tools/common.py shared_js() fills SH from data/calendar.json and each generator
// puts this file at its template's SHARED placeholder. Edit it here only. Plain ES2017: no lodash, no DOM, no state.
const SH = /*@@SHARED_DATA@@*/{ periods: [], exam_months: [], seasons: [], trips: [], dorm_colors: {} };
const hmMin = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '').trim()); return m ? +m[1] * 60 + +m[2] : null; };
// class periods: P1, P2, P3 as [from, to] minutes of the day; their "HH:MM-HH:MM" and end times
const PERIODS = SH.periods.map(p => p.map(hmMin));
const PERIOD_TEXT = SH.periods.map(p => p.join('-'));
const PERIOD_END = SH.periods.map(p => p[1]);
const EXAM_MONTHS = SH.exam_months;   // midterms and finals, in Week 1 of these months
const SEASONS = SH.seasons;           // by Month - 1
const SEASON_OF = m => { const x = Number(m); return SEASONS[(((Number.isFinite(x) ? x : 1) - 1) % 12 + 12) % 12]; };
const TRIPS = SH.trips;               // [{ m, w, d, name }]: each trip's first day (data/calendar.json "trip")
const DORM_COLOR = SH.dorm_colors;
// Practical Magic is taught per combat role: the first role written in Combat_role ('' before roles are assigned)
const ROLES5 = ['Attack', 'Defense', 'Healing', 'Support', 'Control'];
const classRoleOf = P => { const t = String((P || {}).Combat_role || ''); return ROLES5.map(r => [r, t.search(new RegExp(`\\b${r}\\b`, 'i'))]).filter(x => x[1] >= 0).sort((a, b) => a[1] - b[1]).map(x => x[0])[0] || ''; };
// a Council member's Saturday P2 is the Council, unless an F remedial (a Commitment "Remedial …" due that Saturday) takes it
const councilRemedial = (C, W) => Object.entries(C || {}).some(([k, v]) => k.startsWith('Remedial ') && String((v || {}).Due || '').includes(`M${W.Month} W${W.Week} Sat`));
// the band a value falls in: bands = [[from, name], ...] ascending (Trust, Tension)
const bandOf = (bands, x) => (bands || []).reduce((a, [from, nm]) => (x >= from ? nm : a), '');
// Campus_State.NPC_status for an NPC: by id (or, with an alias map, any alias), any case, or the first word of a full name
const npcStatusOf = (N, id, alias) => {
  const lo = String(id).toLowerCase(), k = Object.keys(N || {}).find(x => {
    const xl = String(x).toLowerCase();
    return (alias ? (alias[xl] || x) === id : x === id || xl === lo) || xl.split(/\s+/)[0] === lo;
  });
  return k ? String(N[k] || '') : '';
};
// a Location's parts: "Place — detail, more"; placeOf is the place, placeKey its lowercase key without "the"
const LOC_SPLIT = /\s+[—–-]\s+|,\s+/;
const PLACE_SPLIT = /\s+[—–-]\s+/;   // 1.43.0: with the en dash (a narrator may write "Canteen – kitchen")
const locParts = loc => String(loc || '').split(LOC_SPLIT);
const placeOf = loc => String(loc || '').split(PLACE_SPLIT)[0].trim();
const placeKey = loc => placeOf(loc).toLowerCase().replace(/^the /, '');
// an item's name as one key: lowercase, without a leading article or a trailing "(...)"; itemBase keeps the "(...)"
const itemBase = x => String(x || '').trim().toLowerCase().replace(/^(an?|the)\s+/, '');
const itemKey = x => itemBase(x).replace(/\s*\(.*\)$/, '');
// the key of a record (the Bag, perks) written in any case: the name as stored, or undefined
const keyIn = (O, name) => { const lo = String(name == null ? '' : name).toLowerCase(); return Object.keys(O || {}).find(k => k.toLowerCase() === lo); };
// ---- seeded draws (1.43.0, audit 3.6). Every seeded chance and pick goes through these, so a swipe or a replay of the same
// update draws the same: each is a pure function of its parts (the chat seed, the day or hour, the place, a salt naming the draw).
const hash32 = (...parts) => {
  let h = 2166136261;
  for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return h >>> 0;
};
const rand01 = (...parts) => hash32(...parts) / 4294967296;       // [0, 1)
const roll100 = (...parts) => rand01(...parts) * 100;             // [0, 100): "roll100(...) < pct" is a pct% chance
const d100 = (...parts) => hash32(...parts) % 100 + 1;            // 1..100
const rollInt = (lo, hi, ...parts) => lo + hash32(...parts) % (hi - lo + 1);
const pickOf = (arr, ...parts) => arr[hash32(...parts) % arr.length];
// rollTable(pool, o): one draw from a table. o.roll: the chance's parts, against o.p (0..1, rand01) or o.pct (0..100, roll100);
// without o.roll there is no chance step. o.skip(x): entries out for now (a cooldown, no repeat). o.weight(x): a weighted pick,
// rand01(...o.pick) x the total weight; otherwise a uniform pickOf(pool, ...o.pick). The entry, or null.
function rollTable(pool, o) {
  if (o.roll && !('pct' in o ? roll100(...o.roll) < o.pct : rand01(...o.roll) < o.p)) return null;
  const P = o.skip ? (pool || []).filter(x => !o.skip(x)) : pool || [];
  if (!P.length) return null;
  if (!o.weight) return pickOf(P, ...o.pick);
  let r = rand01(...o.pick) * P.reduce((a, x) => a + o.weight(x), 0);
  for (const x of P) { r -= o.weight(x); if (r < 0) return x; }
  return null;
}
// ---- outside areas (1.46.0, audit 2.1 / 3.1): one shortest-way search for every area map, in the engine and the Map panel.
// areaNb(legs): { node: [[neighbour, weight, ...the leg's other fields], ...] } in the legs' order. areaRoutes(nb, from, blocked):
// { node: { w, prev } }; blocked(id) is a node that can be reached but not crossed (Avalon's castle); a tie keeps the first found.
const areaNb = legs => { const nb = {}; for (const [a, b, ...x] of legs || []) { (nb[a] = nb[a] || []).push([b, ...x]); (nb[b] = nb[b] || []).push([a, ...x]); } return nb; };
function areaRoutes(nb, from, blocked) {
  const d = { [from]: { w: 0, prev: '' } }, done = new Set();
  for (;;) {
    let u = null; for (const k in d) if (!done.has(k) && (u === null || d[k].w < d[u].w)) u = k;
    if (u === null) break; done.add(u);
    if (u !== from && blocked && blocked(u)) continue;
    for (const [v, w] of nb[u] || []) if (!d[v] || d[u].w + w < d[v].w) d[v] = { w: d[u].w + w, prev: u };
  }
  return d;
}
const areaPath = (R, a, b) => { if (!R[b]) return []; const p = [b]; while (p[0] !== a) p.unshift(R[p[0]].prev); return p; };
// minutes between two places of a pin map: inside one pin their "in" minutes (at least 5), else the pins' shortest way
const inMin = x => { const v = Number(x); return Number.isFinite(v) ? v : 5; };
const areaMin = (PL, routesOf, a, b) => a === b ? 0 : PL[a].pin === PL[b].pin ? Math.max(5, inMin(PL[a].in) + inMin(PL[b].in)) : (routesOf(PL[a].pin)[PL[b].pin] || { w: 999 }).w;
// ---- end of shared.js
