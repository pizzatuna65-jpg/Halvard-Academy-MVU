// ---- shared.js (1.43.0, audit batch 2): one source for the constants and small rules the engine, the panels (ui.js), the bracelet
// (statusbar.html) and the <now> entry (505) all use. tools/common.py shared_js() fills SH from data/calendar.json and each generator
// puts this file at its template's SHARED placeholder. Edit it here only. Plain ES2017: no lodash, no DOM, no state.
const SH = /*@@SHARED_DATA@@*/{ periods: [], exam_months: [], seasons: [], trips: [], dorm_colors: {}, breaks: [] };
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
// the lines of a list that are new in after (a multiset difference: a repeated line counts once per repeat; Transactions, Journal)
const newLines = (before, after) => { const n = {}, seen = {};
  for (const l of Array.isArray(before) ? before : []) n[l] = (n[l] || 0) + 1;
  return (Array.isArray(after) ? after : []).filter(l => (seen[l] = (seen[l] || 0) + 1) > (n[l] || 0)); };
// 1.79.0 (Megumin audit MS1): what a reply changed, from the state before it (A) to the state after it (B), as [group, text] rows
// for the bracelet's "This reply" fold. People rows name the NPC as {npc:id} (the reader puts in the name the player knows). The
// engine's own bookkeeping ($ keys other than bond and proficiency XP), Hooks and hidden magic are never listed.
const DELTA_GROUPS = ['People', 'Money', 'Body', 'Studies', 'Bag', 'Records'];
function replyDelta(A, B) {
  const out = [], o = x => (x && typeof x === 'object' ? x : {}), nm = (x, d) => { const v = Number(x); return Number.isFinite(v) ? v : d; };
  const sg = d => (d > 0 ? '+' : '−') + Math.abs(d), add = (g, t) => out.push([g, t]);
  const dif = (a, b) => Math.round(nm(b, 0) - nm(a, 0));
  // People: one row per bond that moved
  const BA = o(A && A.Bonds), BB = o(B && B.Bonds);
  for (const id of Object.keys(BB)) {
    const a = BA[id], b = o(BB[id]), bits = [];
    if (!a) bits.push('new bond, Rank ' + nm(b.Rank, 0));
    else if (nm(b.Rank, 0) !== nm(a.Rank, 0)) bits.push('Rank ' + nm(a.Rank, 0) + ' → ' + nm(b.Rank, 0));
    else if (dif(a.$xp, b.$xp)) bits.push('bond XP ' + sg(dif(a.$xp, b.$xp)));
    if (a && dif(a.Trust, b.Trust)) bits.push('Trust ' + sg(dif(a.Trust, b.Trust)));
    if (a && dif(a.Tension, b.Tension)) bits.push('Tension ' + sg(dif(a.Tension, b.Tension)));
    if (bits.length) add('People', '{npc:' + id + '}: ' + bits.join(', '));
  }
  const PA = o(A && A.Player), PB = o(B && B.Player);
  // Money: each new Transactions line (they carry their sign and reason), then the net when it is more than one line
  const WA = o(PA.Wallet), WB = o(PB.Wallet), tx = newLines(WA.Transactions, WB.Transactions);
  for (const l of tx.slice(-6)) add('Money', l);
  for (const k of ['Points', 'Coin']) { const d = dif(WA[k], WB[k]); if (d && tx.length !== 1) add('Money', k + ' ' + sg(d) + ' in all'); }
  // Body: vitals and their maximums, injuries and weather conditions
  const VA = o(PA.Vitals), VB = o(PB.Vitals);
  const vit = [['HP', 'Health'], ['Stamina', 'Stamina'], ['Mana', 'Mana']].map(([k, label]) => {
    const d = dif(VA[k], VB[k]), m = dif(VA[k + '_max'], VB[k + '_max']);
    return (d ? label + ' ' + sg(d) : '') + (m ? (d ? ' (' : label + ' ') + 'max ' + sg(m) + (d ? ')' : '') : '');
  }).filter(Boolean);
  if (vit.length) add('Body', vit.join(' · '));
  const IA = o(PA.Injuries), IB = o(PB.Injuries);
  for (const k of Object.keys(IB)) if (!IA[k]) add('Body', 'Injury: ' + k + (o(IB[k]).Severity ? ' (' + IB[k].Severity + ')' : ''));
  for (const k of Object.keys(IA)) if (!IB[k]) add('Body', 'Healed: ' + k);
  const CA = o(PA.Conditions), CB = o(PB.Conditions);
  for (const k of Object.keys(CB)) if (!CA[k]) add('Body', 'Now ' + k);
  for (const k of Object.keys(CA)) if (!CB[k]) add('Body', 'No longer ' + k);
  // Studies: reputation, proficiency
  const RA = o(o(PA.Profile).Reputation), RB = o(o(PB.Profile).Reputation);
  for (const k of ['Academy', 'Student', 'Doves']) {
    const d = dif(o(RA.$xp)[k], o(RB.$xp)[k]), la = nm(RA['_' + k], 0), lb = nm(RB['_' + k], 0);
    if (d || la !== lb) add('Studies', k + ' reputation ' + (d ? sg(d) + ' XP' : '') + (la !== lb ? (d ? ', ' : '') + 'level ' + la + ' → ' + lb : ''));
  }
  const RkA = o(PA._Proficiency), RkB = o(PB._Proficiency), XA = o(o(o(A && A.$eng).prof).xp), XB = o(o(o(B && B.$eng).prof).xp);
  for (const k of Object.keys(Object.assign({}, RkB, XB))) {
    const r0 = nm(RkA[k], 0), r1 = nm(RkB[k], 0), d = dif(XA[k], XB[k]);
    if (r1 !== r0) add('Studies', k + ': Rank ' + r0 + ' → ' + r1); else if (d > 0) add('Studies', k + ' ' + sg(d) + ' XP');
  }
  // Bag: what came in or went out, by quantity
  const GA = o(A && A.Inventory), GB = o(B && B.Inventory);
  for (const k of Object.keys(Object.assign({}, GA, GB))) {
    const d = dif(GA[k] ? nm(o(GA[k]).Qty, 1) : 0, GB[k] ? nm(o(GB[k]).Qty, 1) : 0);
    if (d) add('Bag', sg(d) + ' ' + k);
  }
  // Records: new promises and deadlines, Journal lines
  const CmA = o(A && A.Commitments), CmB = o(B && B.Commitments);
  for (const k of Object.keys(CmB)) if (!CmA[k]) add('Records', 'Planner: ' + k + (o(CmB[k]).Due ? ' (' + CmB[k].Due + ')' : ''));
  for (const k of Object.keys(CmA)) if (!CmB[k]) add('Records', 'Planner done: ' + k);
  const jn = newLines(A && A.Journal, B && B.Journal).length;
  if (jn) add('Records', 'Journal ' + sg(jn) + ' line' + (jn > 1 ? 's' : ''));
  return out.sort((x, y) => DELTA_GROUPS.indexOf(x[0]) - DELTA_GROUPS.indexOf(y[0]));
}
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
// a Settings feature is on, read from $ui as the engine left it ($ui.on; older saves: off, happenings, wxfx, ambience)
const uiOn = (UI, id) => { const U = UI || {}; return typeof (U.on || {})[id] === 'boolean' ? U.on[id] : id === 'happenings' ? U.happenings !== 'off' : id === 'weather' ? (U.wxfx || 'full') !== 'off'
  : id === 'ambience' ? (U.ambience || 'full') !== 'off' : !(U.off || []).includes(id); };
// ---- the founded club (1.75.0, owner-approved planning/DRAFT_club_sendiri.md): Campus_State.Founded_club as every runtime reads it
// next to the build's club list; null until it has a name. vkey: its venue as a place key; members: the students besides the player
// (roster ids, as the engine keeps them); founded: the engine marked it founded. Once it is, a member has left their lore club for it
// (movedToFounded); the Student Council is apart.
function foundedClub(S) {
  const F = ((S || {}).Campus_State || {}).Founded_club;
  if (!F || typeof F !== 'object' || !String(F.Name || '').trim()) return null;
  return { name: String(F.Name).trim(), field: String(F.Field || ''), venue: placeOf(F.Venue), vkey: placeKey(F.Venue), advisor: String(F.Advisor || '').trim(),
    members: (Array.isArray(F.Members) ? F.Members : []).map(x => String(x || '').trim()).filter(Boolean), founded: F.Status === 'founded', since: String(F.Since || '') };
}
const movedToFounded = (F, id) => !!F && F.founded && F.members.includes(id);
// ---- whereabouts (1.47.0, audit 3.8): one answer to "where is NPC X now" and "who is likely around this place" for the engine
// (it writes $ui.here for <now>; NPC initiative, Next plans and appointments, the students met in an outside area) and the Map
// panel's Regulars. PD is the presence data each runtime is given (tools/common.py presence_data): reg (place key -> regulars),
// stu (Halvard student -> [lorebook year, campaign year they arrive, dorm]), arr (NPC -> campaign year they arrive), teach, tt (the
// timetable with venues), clubv (place key -> [club, members, all outdoors, the Fishing Club]), outd (outdoor place keys), vn (place
// key -> map name). presenceView reads the moment once (the period and what it holds, flu, weather); on(id): a Settings feature.
function presenceView(PD, S, on) {
  const W = S.World || {}, UI = S.$ui || {}, PR = (S.Player || {}).Profile || {}, CS = S.Campus_State || {};
  const WX = on('weather') && UI.wx && !UI.wx.away && UI.wx.now ? UI.wx : null, FULL = !!WX && WX.mode === 'full';
  const per = /^P([123]) /.exec(String(W._Period || '')), pIdx = per ? +per[1] - 1 : -1;
  const election = W.Month === 10 && W.Week === 3 && W.Day === 'Sat' && pIdx === 2;
  const councilAm = W.Day === 'Sat' && pIdx === 1 && PR.Council && !councilRemedial(S.Commitments, W);
  const cls = election ? ['Student Council Election', '', ['main courtyard'], 'election'] : councilAm ? ['Student Council', '', ['student council chamber'], 'council']
    : on('class') && pIdx >= 0 && (PD.tt || {})[W.Day] ? PD.tt[W.Day][pIdx] : null;   // [subject, M|D, venues, class|study|clubs]
  const gale = FULL && WX.now.wind === 'gale';
  return { W, UI, PR, NST: CS.NPC_status || {}, GRAD: CS.Graduated || [], Y: Math.max(1, Number(W.Year) || 1), COUNCIL: CS.Council || {}, pIdx, cls,
    until: PERIOD_END[pIdx], sick: FULL && WX.flu ? (WX.sick || []) : [], gale, bad: FULL && (WX.now.sky === 'Rain' || WX.now.sky === 'Storm' || gale), rain: FULL && WX.now.sky === 'Rain',
    min: hmMin(W.Time), dkey: [W.Year || 1, W.Month, W.Week, W.Day].join('-'), seed: Number((S.$eng || {}).seed) || 0, rton: on('npc_routines'), FC: foundedClub(S),   // 1.52.0: the routine roll
    brk: breakStaysNow(PD, S) };   // 1.83.0: a break's stayers (null: no break today)
}
// NPC id at this moment: gone (graduated, or their cohort has not arrived), st (Campus_State.NPC_status), sick (the flu), busy
// ([what they are doing, the place keys where that keeps them in sight]: students in class, at Study Hall, voting or at their clubs;
// a teacher teaching the period's subject). The Council's Saturday morning keeps nobody from anywhere. 1.52.0 (owner-approved
// planning/DRAFT_npc_routines.md, feature batch 4): rt, a weekly routine ([days, from, to, place key, name, what, label]) when nothing
// above keeps them and the day's shared roll says they keep to it (PD.rate %, owner: 70, "usually"); else their haunts as before.
function whereabouts(PD, V, id) {
  const c = V.cls, k = c ? c[3] : '', stu = !!(PD.stu || {})[id];
  const teach = k === 'class' && ((PD.teach || {})[id] || []).some(x => x[0] === c[0]);
  const busy = !c || k === 'council' ? null : teach ? ['teaching ' + c[0] + ' until ' + V.until, c[2]] : !stu ? null
    : k === 'class' ? ['in class until ' + V.until, []] : k === 'study' ? ['at Study Hall until ' + PERIOD_END[1], c[2]]
    : k === 'election' ? ['voting in the Main Courtyard until ' + PERIOD_END[2], []] : ['at their club until ' + PERIOD_END[2], []];
  const gone = V.GRAD.includes(id) ? 'graduated' : ((PD.arr || {})[id] || 1) > V.Y ? 'not at Halvard yet' : V.brk && stu && !V.brk.includes(id) ? 'home for the break' : '', st = npcStatusOf(V.NST, id), sick = V.sick.includes(id);
  const rt = !V.rton || gone || sick || st || busy || V.min == null ? null : ((PD.rt || {})[id] || []).find((r, i) => r[0].includes(V.W.Day) && V.min >= r[1] && V.min < r[2]
    && roll100(V.seed, V.dkey, 'routine', id, i) < (PD.rate == null ? 70 : PD.rate)) || null;
  return { id, gone, st, sick, busy, rt };
}
const whereFree = w => !w.gone && !w.sick;   // at Halvard and on their feet
// who is likely around the place of loc now (the <now> presence block): place, pres (what the period holds), regs (regulars likely
// here), moved (regulars of an outdoor place moved indoors by the weather), club (clubs meeting here), st ([regular, status] pairs)
function presenceAt(PD, V, loc) {
  const place = placeOf(loc), pk = place.toLowerCase().replace(/^the /, ''), c = V.cls, k = c ? c[3] : '', REG = PD.reg || {};
  const wh = id => whereabouts(PD, V, id), here = id => whereFree(wh(id));
  let cand = (REG[place.toLowerCase()] || REG[pk] || []).filter(here);
  if (pk === 'student council chamber') cand = [...new Set([...cand, ...(V.COUNCIL.Members || []).filter(r => r !== V.PR.Name && here(r))])];
  let regs1 = cand.filter(id => { const b = wh(id).busy; return !b || b[1].includes(pk); });
  // 1.52.0: a regular away on a routine elsewhere is not here; someone whose routine is here now is (why: what they do here)
  const why = {};
  regs1 = regs1.filter(id => { const r = wh(id).rt; return !r || r[3] === pk; });
  for (const id of Object.keys(PD.rt || {})) { const w = wh(id); if (w.rt && w.rt[3] === pk && whereFree(w)) { if (!regs1.includes(id)) regs1.push(id); if (w.rt[5]) why[id] = w.rt[5]; } }
  const pres = [], P = PERIOD_END;
  let clubs = [];
  if (k === 'class') pres.push('Students are in class until ' + V.until + '.');
  else if (k === 'study') pres.push(c[2].includes(pk) ? 'Study Hall until ' + P[1] + ': most students are here.' : 'Students are at Study Hall in the Main Library until ' + P[1] + '.');
  else if (k === 'council') pres.push(c[2].includes(pk) ? 'Student Council meets here until ' + P[1] + '; members attend instead of Study Hall.' : 'Student Council members meet in the Chamber until ' + P[1] + '.');
  else if (k === 'election') pres.push('Students vote for Student Council President in the Main Courtyard until ' + P[2] + '; ordinary clubs do not meet this afternoon.');
  else if (c) {   // 1.75.0: the founded club meets at its venue, and its members have left their lore clubs
    const FC = V.FC && V.FC.founded ? V.FC : null;
    clubs = ((PD.clubv || {})[pk] || []).map(x => FC ? [x[0], x[1].filter(id => !FC.members.includes(id)), x[2], x[3]] : x);
    if (FC && FC.vkey === pk) clubs = [...clubs, [FC.name, FC.members, false, false]];
    if (!clubs.length) pres.push('Students are at their clubs until ' + P[2] + '.');
  }
  let moved = [];
  if (V.bad && (PD.outd || []).includes(pk) && !((pk === 'boathouse and lake' || pk === 'fishing house') && V.rain && !V.gale)) {   // the Fishing Club likes rain
    moved = regs1.filter(id => !(V.gale && id === 'Ottavio')); regs1 = regs1.filter(id => V.gale && id === 'Ottavio');
  }
  const club = clubs.map(x => {
    const m = x[1].filter(id => { const w = wh(id); return whereFree(w) && !w.st; });
    return x[0] + (V.bad && x[2] && (!x[3] || V.gale) ? ': practising indoors (Gymnasium) or cancelled in this weather' : ': meeting here until ' + P[2] + (m.length ? ' (members on record: ' + m.join(', ') + ')' : ''));
  }).join('; ');
  return { place, pres, regs: regs1.filter(r => !wh(r).st), moved, club, st: regs1.filter(r => wh(r).st).map(r => [r, wh(r).st]), why };
}
// ---- breaks and Secret Fools Day (1.83.0, owner-approved planning/DRAFT_event_frame.md 4.2, 4.3), computed, never stored.
// A break is a calendar event with home (SH.breaks: the Mid-Year Break; the Month 12 weeks are one holiday). Most Halvard students go
// home; PD.ct.breaks.stay stay (their lore leaves them no home to go to), and anyone else with PD.ct.breaks.chance percent, drawn per
// student, campaign year and break. The others are away (whereabouts: 'home for the break'; the engine's npcAwayIn).
const breakOf = W => (SH.breaks || []).find(b => b.m === W.Month && b.w === W.Week && b.d.includes(W.Day)) || null;
function breakStays(PD, seed, year, key) {
  const B = (PD.ct || {}).breaks || {}, stay = B.stay || [];
  return Object.keys(PD.stu || {}).filter(id => { const st = PD.stu[id], y = st[0] + year - (st[1] || 1); return y >= 1 && y <= 3; })
    .filter(id => stay.includes(id) || roll100(seed, year, 'break', key, id) < (Number(B.chance) || 0)).sort();
}
const breakStaysNow = (PD, S) => { const W = (S || {}).World || {}, b = breakOf(W); return b ? breakStays(PD, Number(((S || {}).$eng || {}).seed) || 0, Math.max(1, Number(W.Year) || 1), b.key) : null; };
// Secret Fools Day's dorm name-draw for {{user}} (lore 235): the name {{user}} draws (to) and who drew {{user}} (by), each a roster
// dorm-mate at Halvard this year (PD.ct.fools.named percent) or '' (a dorm-mate the narrator invents)
function foolsDraw(PD, seed, year, dorm) {
  const mates = Object.keys(PD.stu || {}).filter(id => { const st = PD.stu[id], y = st[0] + year - (st[1] || 1); return st[2] === dorm && y >= 1 && y <= 3; }).sort();
  const pct = Number(((PD.ct || {}).fools || {}).named) || 0;
  const to = rollTable(mates, { roll: [seed, year, 'fools-to'], pct, pick: [seed, year, 'fools-to-pick'] }) || '';
  const by = rollTable(mates, { roll: [seed, year, 'fools-by'], pct, pick: [seed, year, 'fools-by-pick'], skip: id => id === to }) || '';
  return { to, by };
}
// ---- contest (1.82.0, owner-approved planning/DRAFT_event_frame.md section 3): the Dorm Competition, computed from the seed and
// never stored (DECISIONS §7 "computed, not stored"). PD.ct is data/event_frame.json contest (tools/common.py contest_data). A role's
// bracket in a dorm is a pure function of (seed, campaign year, dorm, role) and the bouts the story decided, so the engine (bouts in
// <now>, Placement and Status), the Competition tab and every swipe agree. Most entrants are unnamed ('Fire Y2 student'): the
// narrator invents them; roster students are seeded apart, so they tend to meet late. Formats (lore 19): knockout (Attack, Control),
// heats (Defense, Healing), paired (Support, judged on a same-dorm Attack partner's bouts). It runs in the engine and the panels only.
const CT_ORD = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const ctPin = (PD, id, year) => { const p = ((PD.ct || {}).pins || {})[id]; return p && (!p.years || p.years.includes(year)) ? p : null; };
const ctSlots = n => { let s = [1]; while (s.length < n) { const m = s.length * 2 + 1; s = s.flatMap(x => [x, m - x]); } return s; };
const ctOrder = E => [...E].sort((a, b) => (b.named ? 1 : 0) - (a.named ? 1 : 0) || b.s - a.s || (a.id < b.id ? -1 : 1));
// {{user}} as an entrant: the dorm, the role (the first in Combat_role; none on record: Attack), the school year and the strength
function contestUser(PD, S) {
  const PR = (S.Player || {}).Profile || {}, ST = (PD.ct || {}).strength || {}, dorm = String(PR.Dorm || '');
  if (!/^(Fire|Light|Sky|Viridian)$/.test(dorm)) return null;
  const y = Math.min(3, Math.max(1, Number(PR.Year) || 1)), pr = Number(((S.Player || {})._Proficiency || {}).Prowess) || 0;
  return { dorm, role: classRoleOf(PR) || 'Attack', y, s: ST.user_base + ST.user_per_year * (y - 1) + ST.user_per_prowess * pr };
}
// one role's entrants in one dorm: its roster students there this year, {{user}} when it is theirs, unnamed students up to the
// bracket's size; each { id, y, s, named, user, label }
function contestField(PD, seed, year, dorm, role, user) {
  const CT = PD.ct || {}, D = CT.dorm || {}, ST = CT.strength || {};
  const str = (id, y) => ST.base + ST.per_year * (y - 1) + rollInt(0, ST.spread, seed, year, 'ct-str', id) + (Number((ctPin(PD, id, year) || {}).str) || 0);
  const E = Object.keys(CT.roles || {}).filter(id => CT.roles[id] === role && ((PD.stu || {})[id] || [])[2] === dorm)
    .map(id => { const st = PD.stu[id]; return { id, y: st[0] + year - (st[1] || 1), named: true }; })
    .filter(e => e.y >= 1 && e.y <= 3).map(e => ({ ...e, s: str(e.id, e.y) }));
  if (user && user.dorm === dorm && user.role === role) E.push({ id: '{{user}}', y: user.y, s: user.s, user: true });
  const size = Math.max(E.length, rollInt(D.size[0], D.size[1], seed, year, 'ct-size', dorm, role));
  for (let i = 0; E.length < size; i++) { const id = `${dorm}:${role}:${i}`, y = rollInt(1, 3, seed, year, 'ct-y', id); E.push({ id, y, s: str(id, y), label: `${dorm} Y${y} student` }); }
  return E;
}
// knockout. res: { id: [true | false | undefined per round] }, the bouts the story decided ({{user}}'s, or a Support {{user}}'s
// partner's); one still to report is pending (w undefined), and so is all that follows from it. Byes are null.
function contestKnockout(PD, seed, year, dorm, role, E, res) {
  const ST = (PD.ct || {}).strength || {}, order = ctOrder(E), R = Math.max(1, Math.ceil(Math.log2(order.length)));
  const loseAt = id => { const p = ctPin(PD, id, year); return !p || p.lose == null ? 0 : p.lose === 'semi' ? R - 1 : Number(p.lose); };
  const win = (a, b, r) => {
    for (const [x, y] of [[a, b], [b, a]]) if (res[x.id]) { const f = res[x.id][r - 1]; return f === undefined ? undefined : f ? x : y; }
    const la = loseAt(a.id), lb = loseAt(b.id);
    if (la === r && lb !== r) return b;
    if (lb === r && la !== r) return a;
    if (la > r && !(lb > r)) return a;
    if (lb > r && !(la > r)) return b;
    return roll100(seed, year, 'ct-ko', dorm, role, r, a.id, b.id) < Math.min(ST.clamp[1], Math.max(ST.clamp[0], 50 + a.s - b.s)) ? a : b;
  };
  const rounds = [];
  let cur = ctSlots(2 ** R).map(k => order[k - 1] || null);
  for (let r = 1; r <= R; r++) {
    const ms = [];
    for (let i = 0; i < cur.length; i += 2) {
      const a = cur[i], b = cur[i + 1];
      ms.push({ r, a, b, w: a === undefined || b === undefined ? undefined : !a || !b ? a || b : win(a, b, r) });
    }
    rounds.push(ms); cur = ms.map(m => m.w);
  }
  const lost = {}, champ = rounds[R - 1][0].w || null;
  for (const ms of rounds) for (const m of ms) if (m.w && m.a && m.b) lost[(m.w === m.a ? m.b : m.a).id] = m.r;
  const reach = e => (champ && champ.id === e.id ? R + 1 : lost[e.id] || 0);   // 0: still in
  const tie = x => ((ctPin(PD, x.id, year) || {}).tie === 'first' ? 1 : 0);
  const cmp = (x, y) => tie(y) - tie(x) || y.s - x.s || (x.id < y.id ? -1 : 1);
  // the place: every entrant still in or out later comes first, then the same round's losers by pin and strength
  const place = e => { const k = reach(e); return k ? 1 + E.filter(x => x !== e && (!reach(x) || reach(x) > k || (reach(x) === k && cmp(x, e) < 0))).length : 0; };
  return { fmt: 'knockout', R, rounds, place, champ };
}
// heats: snake-seeded heats of up to heat_size (so the roster spreads), the top heat_up of each go to one final heat. {{user}}'s
// res: [advanced (true) or out (false), the place in the final]
function contestHeats(PD, seed, year, dorm, role, E, res) {
  const D = (PD.ct || {}).dorm || {}, UP = D.heat_up, order = ctOrder(E), H = Math.max(1, Math.ceil(order.length / D.heat_size));
  const heats = Array.from({ length: H }, () => []);
  order.forEach((e, i) => heats[Math.floor(i / H) % 2 ? H - 1 - i % H : i % H].push(e));
  const sc = (e, r) => ((ctPin(PD, e.id, year) || {}).lose == 1 ? -1 : e.s + rollInt(0, 40, seed, year, 'ct-heat', dorm, role, r, e.id));
  const by = r => (a, b) => sc(b, r) - sc(a, r) || (a.id < b.id ? -1 : 1);
  const r1 = heats.map(h => {
    const u = h.find(e => res[e.id]), f = u ? res[u.id][0] : null, rest = h.filter(e => e !== u).sort(by(1));
    if (u && f === undefined) return { h, ranked: null };
    return { h, ranked: !u ? rest : f ? [u, ...rest] : [...rest.slice(0, UP), u, ...rest.slice(UP)] };
  });
  const ready = r1.every(x => x.ranked), up = ready ? r1.flatMap(x => x.ranked.slice(0, UP)) : [];
  let fin = null;
  if (ready) {
    const u = up.find(e => res[e.id]), k = u ? res[u.id][1] : 0;
    if (!u || typeof k === 'number') {
      const rest = up.filter(e => e !== u).sort(by(2)), at = Math.max(0, Math.min(Number(k) || 1, up.length) - 1);
      fin = u ? [...rest.slice(0, at), u, ...rest.slice(at)] : rest;
    }
  }
  const outs = ready ? r1.flatMap(x => x.ranked.slice(UP).map((e, i) => [e, i])).sort((a, b) => a[1] - b[1] || b[0].s - a[0].s || (a[0].id < b[0].id ? -1 : 1)).map(x => x[0]) : [];
  const place = e => { const i = fin ? fin.indexOf(e) : -1, j = outs.indexOf(e); return i >= 0 ? i + 1 : j >= 0 ? up.length + j + 1 : 0; };
  return { fmt: 'heats', R: 2, heats: r1, up, fin, place };
}
// Support: each entrant is paired at random with an Attack fighter of the same dorm (each once while there are enough) and placed by
// that partner's run; a Support {{user}}'s bouts are their partner's
function contestPaired(PD, seed, year, dorm, E, user, res) {
  const A = contestField(PD, seed, year, dorm, 'Attack', user);
  const pool = [...A].sort((a, b) => roll100(seed, year, 'ct-pair', dorm, a.id) - roll100(seed, year, 'ct-pair', dorm, b.id) || (a.id < b.id ? -1 : 1));
  const partner = {}, ures = { ...res };
  ctOrder(E).forEach((e, i) => { partner[e.id] = pool[i % pool.length]; });
  const U = E.find(e => e.user);
  if (U && res[U.id]) { ures[partner[U.id].id] = res[U.id]; delete ures[U.id]; }
  const K = contestKnockout(PD, seed, year, dorm, 'Attack', A, ures), pp = e => K.place(partner[e.id]);
  const place = e => { const p = pp(e); return p ? 1 + E.filter(x => x !== e && (!pp(x) || pp(x) < p || (pp(x) === p && (x.s > e.s || (x.s === e.s && x.id < e.id))))).length : 0; };
  return { fmt: 'paired', R: K.R, K, partner, place };
}
// one role's bracket in one dorm, with the bouts the story decided ({{user}}'s results as res['{{user}}'])
function dormContest(PD, seed, year, dorm, role, user, res) {
  const E = contestField(PD, seed, year, dorm, role, user), fmt = (((PD.ct || {}).dorm || {}).format || {})[role] || 'knockout';
  const K = fmt === 'heats' ? contestHeats(PD, seed, year, dorm, role, E, res || {}) : fmt === 'paired' ? contestPaired(PD, seed, year, dorm, E, user, res || {})
    : contestKnockout(PD, seed, year, dorm, role, E, res || {});
  return { ...K, E, dorm, role };
}
// {{user}}'s reported bouts at a tier ("Dorm R2: beat Sophia"; the tier may be left out): res [true | false | a place in a heats
// final, per round] and the names they gave their opponents
function contestResults(lines, tier) {
  const res = [], who = [];
  for (const l of lines || []) {
    const m = /^\s*(?:(Dorm|Academy|Kingdom|World)\s+)?R(\d)\s*:\s*(.+)$/i.exec(String(l));
    if (!m || (m[1] && m[1].toLowerCase() !== String(tier).toLowerCase())) continue;
    const r = +m[2] - 1, t = m[3], pl = /\bplaced\s+(\d+)/i.exec(t);
    res[r] = pl ? +pl[1] : /\b(beat|won|wins|advanced)\b/i.test(t) ? true : /\b(lost|out|eliminated|forfeited)\b/i.test(t) ? false : res[r];
    const nm = /\b(?:beat|lost to)\s+(.+?)\s*(?:\(.*\))?\s*$/i.exec(t);
    if (nm) who[r] = nm[1].trim();
  }
  return { res, who };
}
// the start of round r ([day, 'HH:MM']), and whether it has come on a day of the competition (Saturday, then Sunday)
const ctTime = (PD, fmt, r) => { const T = (((PD.ct || {}).dorm || {}).times || {})[fmt === 'heats' ? 'heats' : 'knockout'] || []; return T[Math.min(r, T.length) - 1] || null; };
const ctReached = (W, at) => !!at && (DAYS.indexOf(W.Day) > DAYS.indexOf(at[0]) || (W.Day === at[0] && hmMin(W.Time) >= hmMin(at[1])));
const ctName = e => (!e ? 'a bye' : e.user ? '{{user}}' : e.named ? e.id : e.label);
// ---- end of whereabouts (tools/common.py shared_js(presence=False) leaves the section out of the bracelet, 505 and 506)
// ---- end of shared.js
