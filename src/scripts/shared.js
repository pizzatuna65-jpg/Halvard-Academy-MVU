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
const PLACE_SPLIT = /\s+[—-]\s+/;
const locParts = loc => String(loc || '').split(LOC_SPLIT);
const placeOf = loc => String(loc || '').split(PLACE_SPLIT)[0].trim();
const placeKey = loc => placeOf(loc).toLowerCase().replace(/^the /, '');
// an item's name as one key: lowercase, without a leading article or a trailing "(...)"; itemBase keeps the "(...)"
const itemBase = x => String(x || '').trim().toLowerCase().replace(/^(an?|the)\s+/, '');
const itemKey = x => itemBase(x).replace(/\s*\(.*\)$/, '');
// the key of a record (the Bag, perks) written in any case: the name as stored, or undefined
const keyIn = (O, name) => { const lo = String(name == null ? '' : name).toLowerCase(); return Object.keys(O || {}).find(k => k.toLowerCase() === lo); };
// ---- end of shared.js
