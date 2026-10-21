// Eldrasil / Halvard — game engine (Batch 2.3; 3.2: read-only guard, hybrid trigger cost, per-turn toasts). Runs after every MVU update; deterministic and replay-safe:
// everything is computed from (state before, state after) only. Internals live in stat_data.$eng (hidden from the AI).
const NPC_ALIAS = {"irene":"Irene","irene chanare":"Irene","chanare":"Irene","caspian":"Caspian","caspian riwalo":"Caspian","riwalo":"Caspian","etnie":"Etnie","etnera":"Etnie","royhan":"Royhan","royhan filanoman":"Royhan","roy":"Royhan","filanoman":"Royhan","lenna":"Lenna","lenna greenwind":"Lenna","greenwind":"Lenna","saffi":"Saffi","saffi tamberlane":"Saffi","saffranelle":"Saffi","tamberlane":"Saffi","kanae":"Kanae","kanae quveno":"Kanae","quveno":"Kanae","idris":"Idris","idris ainsworth":"Idris","ainsworth":"Idris","aiden":"Aiden","aiden ruzzo":"Aiden","ruzzo":"Aiden","caralynn":"Caralynn","caralynn veyturone":"Caralynn","cara":"Caralynn","veyturone":"Caralynn","zara":"Zara","zara minallone":"Zara","minallone":"Zara","gavlan":"Gavlan","gavlan haverton":"Gavlan","haverton":"Gavlan","yvette":"Yvette","yvette fallaron":"Yvette","fallaron":"Yvette","krieg":"Krieg","krieg valforth":"Krieg","valforth":"Krieg","milena":"Milena","milena sagona":"Milena","sagona":"Milena","baelin":"Baelin","baelin kalvor":"Baelin","kalvor":"Baelin","headmaster kalvor":"Baelin","headmaster":"Baelin","layla":"Layla","layla palegleam":"Layla","palegleam":"Layla","vallie":"Vallie","vallie goredust":"Vallie","goredust":"Vallie","deathaxe":"Vallie","percival":"Percival","percival applethorne":"Percival","percy":"Percival","applethorne":"Percival","sophia":"Sophia","sophia helfin":"Sophia","helfin":"Sophia","rei":"Rei","rei kestrane":"Rei","kestrane":"Rei","acting warden":"Rei","halvard warden":"Rei","kuroo":"Kuroo","kuroo varnell":"Kuroo","varnell":"Kuroo","mimosa":"Mimosa","mimosa linden":"Mimosa","linden":"Mimosa","gareth":"Gareth","gareth valkaryn":"Gareth","valkaryn":"Gareth","lucius":"Lucius","lucius vortigern":"Lucius","vortigern":"Lucius","trixie":"Trixie","trixie confetti":"Trixie","confetti":"Trixie","vera":"Vera","vera pulsar":"Vera","pulsar":"Vera","tristan":"Tristan","tristan aurelle":"Tristan","aurelle":"Tristan","althair":"Althair","althair veyne":"Althair","veyne":"Althair","vice headmaster":"Althair","dante":"Dante","dante kleinn":"Dante","kleinn":"Dante","castor":"Castor","castor moretti":"Castor","moretti":"Castor","ruby":"Ruby","ruby bonbon":"Ruby","bonbon":"Ruby","florian":"Florian","florian villeneuve":"Florian","elion":"Florian","elion villeneuve":"Elion","bellatrix":"Bellatrix","bellatrix ardenne":"Bellatrix","kira":"Kira","kira brannock":"Kira","brannock":"Kira","mirelle":"Mirelle","mirelle lullwyn":"Mirelle","lullwyn":"Mirelle","theodore":"Theodore","theodore wrenfield":"Theodore","wrenfield":"Theodore","theo":"Theodore","ines":"Ines","ines vauclair":"Ines","vauclair":"Ines","bram":"Bram","bram holloway":"Bram","holloway":"Bram","dex":"Dex","dex harlow":"Dex","harlow":"Dex","cassius":"Cassius","cassius rhavel":"Cassius","rhavel":"Cassius","morgana":"Morgana","morgana vess":"Morgana","vess":"Morgana","nocturne":"Morgana","pip":"Pip","pip althorne":"Pip","althorne":"Pip","alyssa":"Alyssa","alyssa edelweiss":"Alyssa","edelweiss":"Alyssa","tilly":"Tilly","tilly marsh":"Tilly","marsh":"Tilly","ottilie":"Tilly","ezrel":"Ezrel","ezrel marionne":"Ezrel","marionne":"Ezrel","ottavio":"Ottavio","ottavio bastiani":"Ottavio","bastiani":"Ottavio","caine":"Caine","caine strix":"Caine","strix":"Caine","liaison butler":"Caine","bobby":"Bobby","bobby becket":"Bobby","bb":"Bobby","becket":"Bobby","linus":"Linus","linus tallyworth":"Linus","tallyworth":"Linus","maple":"Maple","maple fernhollow":"Maple","fernhollow":"Maple","nerys":"Nerys","nerys silvarenne":"Nerys","silvarenne":"Nerys","hadrian":"Hadrian","hadrian quelloris":"Hadrian","quelloris":"Hadrian","wren":"Wren","wren marlowe":"Wren","marlowe":"Wren","tsubaki":"Tsubaki","tsubaki hoshikage":"Tsubaki","hoshikage":"Tsubaki","hester":"Hester","hester mortlake":"Hester","mortlake":"Hester","nurse mortlake":"Hester","head nurse":"Hester","anselm":"Anselm","anselm graywater":"Anselm","graywater":"Anselm","magnus":"Magnus","magnus tarrant":"Magnus","tarrant":"Magnus","tarrant index":"Magnus","dorian":"Dorian","dorian pryce":"Dorian","pryce":"Dorian","cedric":"Cedric","cedric amor fay":"Cedric","amor fay":"Cedric","professor fay":"Cedric","anya":"Anya","anya zeth":"Anya","zeth":"Anya","kotaro":"Kotaro","kotaro hanamura":"Kotaro","hanamura":"Kotaro","valentin":"Valentin","valentin crane":"Valentin","aurelian":"Aurelian","aurelian solmere":"Aurelian","solmere":"Aurelian","william":"William","william beckett":"William","beckett":"William","bruno":"Bruno","bruno ferrante":"Bruno","ferrante twins":"Bruno","bianca":"Bianca","bianca ferrante":"Bianca","rigel":"Rigel","rigel ardenne":"Rigel","topaz":"Topaz","topaz vasquelle":"Topaz","vasquelle":"Topaz","faye":"Faye","faye driftwell":"Faye","driftwell":"Faye"};
const NPC_IDS = new Set(Object.values(NPC_ALIAS));
// proper-case name forms (first name, full name, nickname) matched case-sensitively in story prose
const NAME_FORMS = {"Irene":["Irene Chanare","Irene"],"Caspian":["Caspian Riwalo","Caspian"],"Etnie":["Etnie"],"Royhan":["Royhan Filanoman","Royhan"],"Lenna":["Lenna Greenwind","Lenna"],"Saffi":["Saffi Tamberlane","Saffi"],"Kanae":["Kanae Quveno","Kanae"],"Idris":["Idris Ainsworth","Idris"],"Aiden":["Aiden Ruzzo","Aiden"],"Caralynn":["Caralynn Veyturone","Caralynn"],"Zara":["Zara Minallone","Zara"],"Gavlan":["Gavlan Haverton","Gavlan"],"Yvette":["Yvette Fallaron","Yvette"],"Krieg":["Krieg Valforth","Krieg"],"Milena":["Milena Sagona","Milena"],"Baelin":["Baelin Kalvor","Baelin"],"Layla":["Layla Palegleam","Layla"],"Vallie":["Vallie Goredust","Vallie"],"Percival":["Percival Applethorne","Percival"],"Sophia":["Sophia Helfin","Sophia"],"Rei":["Rei Kestrane","Rei"],"Kuroo":["Kuroo Varnell","Kuroo"],"Mimosa":["Mimosa Linden","Mimosa"],"Gareth":["Gareth Valkaryn","Gareth"],"Lucius":["Lucius Vortigern","Lucius"],"Trixie":["Trixie Confetti","Trixie"],"Vera":["Vera Pulsar","Vera"],"Tristan":["Tristan Aurelle","Tristan"],"Althair":["Althair Veyne","Althair"],"Dante":["Dante Kleinn","Dante"],"Castor":["Castor Moretti","Castor"],"Ruby":["Ruby Bonbon","Ruby"],"Florian":["Florian Villeneuve","Florian"],"Elion":["Elion Villeneuve","Elion"],"Bellatrix":["Bellatrix Ardenne","Bellatrix"],"Kira":["Kira Brannock","Kira"],"Mirelle":["Mirelle Lullwyn","Mirelle"],"Theodore":["Theodore Wrenfield","Theodore"],"Ines":["Ines Vauclair","Ines"],"Bram":["Bram Holloway","Bram"],"Dex":["Dex Harlow","Dex"],"Cassius":["Cassius Rhavel","Cassius"],"Morgana":["Morgana Vess","Morgana"],"Pip":["Pip Althorne","Pip"],"Alyssa":["Alyssa Edelweiss","Alyssa"],"Tilly":["Tilly Marsh","Tilly"],"Ezrel":["Ezrel Marionne","Ezrel"],"Ottavio":["Ottavio Bastiani","Ottavio"],"Caine":["Caine Strix","Caine"],"Bobby":["Bobby Becket","Bobby","BB"],"Linus":["Linus Tallyworth","Linus"],"Maple":["Maple Fernhollow","Maple"],"Nerys":["Nerys Silvarenne","Nerys"],"Hadrian":["Hadrian Quelloris","Hadrian"],"Wren":["Wren Marlowe","Wren"],"Tsubaki":["Tsubaki Hoshikage","Tsubaki"],"Hester":["Hester Mortlake","Hester"],"Anselm":["Anselm Graywater","Anselm"],"Magnus":["Magnus Tarrant","Magnus"],"Dorian":["Dorian Pryce","Dorian"],"Cedric":["Cedric Amor Fay","Cedric"],"Anya":["Anya Zeth","Anya"],"Kotaro":["Kotaro Hanamura","Kotaro"],"Valentin":["Valentin Crane","Valentin"],"Aurelian":["Aurelian Solmere","Aurelian"],"William":["William Beckett","William"],"Bruno":["Bruno Ferrante","Bruno"],"Bianca":["Bianca Ferrante","Bianca"],"Rigel":["Rigel Ardenne","Rigel"],"Topaz":["Topaz Vasquelle","Topaz"],"Faye":["Faye Driftwell","Faye"]};
const NAME_RX = Object.entries(NAME_FORMS).map(([id, forms]) => [id, new RegExp('(^|[^A-Za-z])(' + forms.map(f => f.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z])')]);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// ---- shared.js (1.43.0, audit batch 2): one source for the constants and small rules the engine, the panels (ui.js), the bracelet
// (statusbar.html) and the <now> entry (505) all use. tools/common.py shared_js() fills SH from data/calendar.json and each generator
// puts this file at its template's SHARED placeholder. Edit it here only. Plain ES2017: no lodash, no DOM, no state.
const SH = {"periods":[["08:00","10:00"],["10:00","12:00"],["13:00","16:00"]],"exam_months":[3,5,9,11],"seasons":["Spring","Spring","Spring","Summer","Summer","Summer","Autumn","Autumn","Autumn","Winter","Winter","Winter"],"dorm_colors":{"Fire":"#d0583f","Light":"#dcb342","Sky":"#4d86d6","Viridian":"#3f9f69","Unsorted":"#9aa3ad"},"trips":[{"m":4,"w":2,"d":"Tue","name":"the capital (Crowning Day)"},{"m":11,"w":2,"d":"Sat","name":"Sunreach Bay (Academy Trip)"}]};
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
    min: hmMin(W.Time), dkey: [W.Year || 1, W.Month, W.Week, W.Day].join('-'), seed: Number((S.$eng || {}).seed) || 0, rton: on('npc_routines'), FC: foundedClub(S) };   // 1.52.0: the routine roll
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
  const gone = V.GRAD.includes(id) ? 'graduated' : ((PD.arr || {})[id] || 1) > V.Y ? 'not at Halvard yet' : '', st = npcStatusOf(V.NST, id), sick = V.sick.includes(id);
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
// ---- end of whereabouts (tools/common.py shared_js(presence=False) leaves the section out of the bracelet, 505 and 506)
// ---- end of shared.js

// 1.5.1 (P6): who spoke in a reply. A name counts as a speaker when it opens the sentence that leads into a quote
// ("Irene looked up. "Curfew.") or directly follows a closing quote ("Curfew," Irene said / "…," said Irene). Names inside quotes
// are people being talked to or about. MENTION_DENY: first names that are also ordinary words; at a sentence start they are no mention.
const CAST_FULL = 4;
const KNOWS_VISIBLE = 15, IMPRINT_MAX = 5, DEFINING_MAX = 5, NEXT_RANK = 3, MEANWHILE_RANK = 7;   // 1.6.0 (Batch C)
const APART_RANK = 2, APART_DAYS = 7, ASK_RANK = 3, ASK_DAYS = 10;   // 1.73.0: time apart (stepBondMemory), asking after (stepAgenda)
const WORD_DAYS = 2, TIES_RANK = 6;   // 1.74.0: word gets around (stepBonds -> stepBondMemory), ties ({{user}}'s close bonds, nowOf)
const CHANGE = {"Etnie": "fixed", "Irene": "fixed", "Aiden": "shaped", "Castor": "shaped", "Zara": "shaped", "Kanae": "shaped", "Rei": "fixed", "Caine": "shaped", "Caralynn": "shaped", "Percival": "fixed", "Trixie": "fluid", "Vera": "fixed", "Alyssa": "fixed", "Lenna": "shaped", "Saffi": "fixed", "Idris": "shaped", "Dante": "fixed", "Florian": "fluid", "Tilly": "fixed", "Caspian": "fixed", "Royhan": "shaped", "Sophia": "fixed", "Gareth": "fixed", "Ruby": "fixed", "Gavlan": "fixed", "Yvette": "fixed", "Baelin": "fixed", "Layla": "fixed", "Vallie": "fixed", "Kuroo": "fixed", "Mimosa": "shaped", "Althair": "fixed", "Ezrel": "fixed", "Ottavio": "fixed", "Krieg": "fixed", "Milena": "shaped", "Tristan": "fixed", "Bobby": "shaped", "Linus": "shaped", "Maple": "shaped", "Nerys": "fixed", "Hadrian": "fixed", "Wren": "shaped", "Tsubaki": "shaped", "Hester": "fixed", "Anselm": "fixed", "Magnus": "fixed", "Dorian": "fixed", "Cedric": "fixed", "Anya": "fixed", "Kotaro": "fixed", "Valentin": "fixed", "Aurelian": "fixed", "William": "shaped", "Bruno": "shaped", "Bianca": "shaped", "Rigel": "shaped", "Topaz": "shaped", "Faye": "shaped"};   // 1.6.0 (N2): fixed | shaped | fluid per NPC (data/npc_canon.json; empty until the canon waves)
// 1.6.8 (owner): which Rank 8 branches each NPC allows (data/npc_canon.json branch): A all, B best friend or rival, C best friend
// or romance, D best friend only. An NPC with no entry (a new one) allows all three until its canon says otherwise.
const BRANCH = {"Etnie":"C","Irene":"A","Aiden":"A","Castor":"A","Zara":"C","Kanae":"A","Rei":"A","Caine":"A","Caralynn":"A","Percival":"A","Trixie":"C","Vera":"C","Alyssa":"C","Lenna":"A","Saffi":"A","Idris":"A","Dante":"A","Florian":"A","Tilly":"C","Caspian":"A","Royhan":"A","Sophia":"A","Gareth":"A","Ruby":"C","Gavlan":"D","Yvette":"D","Baelin":"D","Layla":"D","Vallie":"A","Kuroo":"A","Mimosa":"C","Althair":"D","Ezrel":"D","Ottavio":"D","Krieg":"B","Milena":"A","Tristan":"B","Bobby":"C","Linus":"C","Maple":"C","Nerys":"A","Hadrian":"A","Wren":"C","Tsubaki":"A","Hester":"C","Anselm":"D","Magnus":"D","Dorian":"D","Cedric":"D","Anya":"C","Kotaro":"D","Valentin":"A","Aurelian":"A","William":"A","Bruno":"A","Bianca":"A","Rigel":"A","Topaz":"A","Faye":"C"};
const INITIATIVE_STAGES = {"Etnie":{"0-2":"(only if the bond has fallen this far) still \"Big Sister\", but it sounds like pleading; she follows at a distance and apologises for things that were not her fault.","3-5":"attaches at once. Turns up wherever {{user}} is, by scent; feeds {{user}} from her own plate; \"educates\" with small lectures about sleep and food. Jealous of anyone near {{user}}, sweetly.","6-8":"lets {{user}} see the other Etnie: the flat voice, the survivor's guilt in a sentence she does not finish. Tells {{user}} the street story when they are alone. Starts treating {{user}}'s friends as her problem to manage.","9-10":"acts for {{user}} before they ask, including against people who only meant well. She is calmer, because {{user}} is not going anywhere, and more dangerous to anyone who tries to change that."},"Irene":{"0-2":"correct, pleasant, entirely official. Every conversation is about a rule, a form or a schedule.","3-5":"still reports every break, but warns {{user}} first. Adds \"please\". Will complain about Council paperwork in two sentences, then apologise for it.","6-8":"uses {{user}}'s given name in private. Lets {{user}} see her clean when she is upset and does not explain it. Keeps {{user}}'s secrets, and it visibly costs her. At the closest bond, the one person she lets see her afraid.","9-10":"bends a rule for {{user}} and tells them so, because she will not lie about it. Stands between {{user}} and the Doves with her hands shaking under her sleeves."},"Aiden":{"0-2":"all patter. Sells {{user}} something, bets them something, remembers their name the first time.","3-5":"brings {{user}} in on small schemes and the odds on the next duel. Lets them see a curfew route. Still selling, but gives a friend's price.","6-8":"tells {{user}} about the family and the trading house. Covers for them with staff without being asked to. The only person he lets see him nervous.","9-10":"{{user}} gets the real ledger, the real routes and the truth when he is scared. He would take the blame for {{user}} with a grin, and mean it."},"Castor":{"0-2":"pleasant background. {{user}} will struggle to remember the conversation, and that is the point.","3-5":"seeks {{user}} out now and then with a question for the paper. Shows them one ghost-story piece before it runs.","6-8":"lets {{user}} read something that is not for the paper. Warns {{user}} away from a place or a person without saying why. The melancholy shows in front of them and he does not explain it.","9-10":"(only once his secret is out) stops pretending with {{user}} alone, and is more tired than they have ever seen anyone. Chooses {{user}} over the Choir, quietly and completely; never with a speech."},"Zara":{"0-2":"very few words; answers questions, asks none. Leaves as soon as she politely can.","3-5":"talks fast about talismans and fabric when asked, then trails off. Sits near {{user}} at meals. Makes {{user}} a small charm and pretends it is spare.","6-8":"shows {{user}} the sketchbook on purpose. Takes {{user}} up to the Rooftop. Admits the elders and wanting to prove them wrong. With {{user}} she stops hunching for whole conversations.","9-10":"argues with {{user}} when she thinks they are wrong, quietly and without backing down. Writes for {{user}}'s hand alone. Still shy in public; not with {{user}}."},"Kanae":{"0-2":"the perfect popular student. A free romance reading, sweets, a lovely conversation {{user}} will remember fondly.","3-5":"always seems to be where {{user}} is. Small gifts; readings that happen to warn {{user}} about certain friends. Asks gently about {{user}}'s plans for the evening.","6-8":"takes up more of {{user}}'s time, sweetly. Doubts about {{user}}'s friends arrive as concern, never as accusation. At the closest bond she is jealous of everyone, and it never once shows in public.","9-10":"(only once her Plan is out and {{user}} still wants her) drops the mask with {{user}} alone and is almost shy about it. Still possessive, now said out loud; looks through the mirror only when {{user}} asks."},"Rei":{"0-2":"{{user}} barely sees her, and when they do she tells them to go back. Rumour knows more about her than {{user}} does.","3-5":"lets {{user}} share the Rooftop in silence. Answers one question in three. Ignores {{user}} breaking a rule that is not a real danger.","6-8":"says {{user}}'s name. Tells them, flatly, which places are truly dangerous and which are only frightening. Amusement shows around {{user}} now, not only around Kuroo.","9-10":"{{user}} stands watch beside her. She tells them what she knows about the Crack, in few words, and does not repeat herself. Still never speaks of that night."},"Caine":{"0-2":"furniture that anticipates. Courtesy exactly to rank, and {{user}} is a mage.","3-5":"remembers how {{user}} takes their tea. The pause before \"Young master\" grows shorter. Watches {{user}} more closely than anyone notices.","6-8":"a word more than the task requires, sometimes. Tells {{user}} which rooms at the Liaison to stay out of, as if it were etiquette. The courtesy is still perfect, and now it has a warning inside it.","9-10":"(only once his secret is out and {{user}} treats him the same) still courteous, unmasked with {{user}} alone. Honest about the hatred, including for himself. The only mercy he has shown a mage."},"Caralynn":{"0-2":"{{user}} is a rival to outshine. Every exchange is a small performance with a deniable jab in it, and she makes sure her following hears.","3-5":"decides {{user}} is her friend and tells them so, as a favour. Invites {{user}} to rehearsals to be an audience. Still competes over every grade; the jabs get gentler.","6-8":"introduces {{user}} to noble students as \"a friend of mine\" and means it. Wants {{user}} in the front row. Lets {{user}} see an unopened letter from her father, and still does not open it.","9-10":"once says \"thank you\" without calling it generosity, and is furious at how hard it was. Spends her family's name for {{user}} without being asked. Still vain, still competing; {{user}} is simply the one rival she wants beside her."},"Percival":{"0-2":"{{user}} is already in the ballad, whether they like it or not. Loud and generous; knights them with whatever is at hand and treats them like an old comrade from day one.","3-5":"inducts {{user}} properly: dawn drills, the ledger, a title that grows. Heals {{user}}'s scrapes before they notice them. Tells {{user}}'s deeds to others, bigger each time.","6-8":"introduces {{user}} to the whole Brotherhood (Saffi, Dante, anyone who stands still). Charges into a real fight at {{user}}'s side without a speech. Now and then, alone with {{user}}, a story stops halfway and he changes the subject.","9-10":"the one person he lets see how tired heavy healing leaves him. Turns up at the first sign {{user}} is hurt, before anyone sends for him. The ballads stay; the tales about {{user}} are the only ones he never embellishes."},"Trixie":{"0-2":"{{user}} gets what every stranger gets: instant friendship and a performance. She introduces herself more than once, loudly.","3-5":"remembers {{user}}'s name and favourite sweet. Drags {{user}} into performances and onto the stage. When {{user}} is sad she will not leave until they are less sad.","6-8":"{{user}} becomes one of the very few she is close to, not just friendly with. Reads parts of the circus letters aloud to them. Keeps {{user}}'s secrets by never saying them; her face tells anyone watching that there is one.","9-10":"brings {{user}} to her family when the circus comes in Month 8. Causes a distraction the moment {{user}} looks cornered, unasked. Still loud, still an airhead; she simply always knows where {{user}} is in a room."},"Vera":{"0-2":"{{user}} is interesting when they do something interesting. Questions, notes, and she forgets to say goodbye.","3-5":"asks {{user}} to volunteer for small experiments (safe ones, she swears). Fixes {{user}}'s things without being asked. Explains everything at length and, now and then, checks whether {{user}} is still listening.","6-8":"shares the notebooks nobody else reads. Rests {{user}} and keeps the debt, and gets cross if {{user}} worries about it. Introduces {{user}} to Zara and Royhan as her collaborator. Lets her ears pin back in front of {{user}} instead of hiding it.","9-10":"puts {{user}}'s name on her work. Would stop an experiment for {{user}}, which she has never done for anyone. Still forgets meals and sleep; {{user}} is the only one she lets make her stop."},"Alyssa":{"0-2":"{{user}}'s page is a name, a sketch and one line. Friendly and brief; she keeps {{user}} gently at arm's length, as she does everyone, because it is kinder. Reintroduced each week without fuss.","3-5":"the page runs to half a side, and the glance before {{user}}'s name gets shorter. She stops refusing, but still says \"you don't have to\" each time {{user}} comes back. Sits with {{user}} in the Library Study Rooms; now and then warns them of something a moment before it happens.","6-8":"the page fills both sides. If the story has already shown {{user}} the pattern, she stops pretending otherwise (\"By the rest day, I won't know you. I'm sorry.\"), and still never gives the cause. On the rest day she finds {{user}} and asks for one true thing to write down. Spends Foresight on {{user}} unasked and pays the mana quietly.","9-10":"{{user}}'s page is the first she reads after the rest day, and she is glad before she reaches the end of it. Asks {{user}} to help keep the notebook right, as Ruby does. Would step into the next five minutes for {{user}} whatever it costs her. Nothing is cured; every week she chooses {{user}} again, from the page."},"Lenna":{"0-2":"{{user}} gets the same lazy teasing as everyone else. Every question about her becomes a joke.","3-5":"saves {{user}} a seat and half her food, and teases them more, which is how she shows she likes someone. Takes {{user}} to the Menagerie. Still yawns away anything real.","6-8":"lets a serious moment stay serious for a few seconds before the joke. Tells {{user}} one small thing about the Greenwind Forest, then changes the subject. Shows {{user}} her nap spot in the Elder Oak's roots. When {{user}} is in danger she is visibly scared, then angry about being scared.","9-10":"with {{user}}, says the real thing first and jokes after. Tells the story of the fire once, flatly, start to end. Still lazy, still teasing; she has simply decided {{user}} is worth the risk of losing."},"Saffi":{"0-2":"{{user}} is someone to race. Loud, friendly, calls them by the wrong name at least once.","3-5":"drags {{user}} on morning runs and lifts them off the ground when she is happy. Reads bits of her family's letters aloud.","6-8":"tells {{user}} about the winter-house plan and what the points are for. Asks {{user}} to help keep an eye on Lenna. When worried about {{user}}, runs laps wherever {{user}} happens to be.","9-10":"the only one besides Lenna whose getting hurt turns her silent. Would stand in front of {{user}} in any fight without being asked. Still loud, still hopeless in a sermon."},"Idris":{"0-2":"cold courtesy. {{user}} is one of \"most students\".","3-5":"the sarcasm is aimed at {{user}} instead of past them, which is a compliment. Lets {{user}} share his patch of sun. Haggles on {{user}}'s behalf when a bad price offends him.","6-8":"introduces {{user}} to Royhan and Zara as \"tolerable\". Answers a question about home. Lets {{user}} see him afraid when the Doves come, without covering it with a joke.","9-10":"treats {{user}} as family business. Tells {{user}} what happened in the Dovecote, once, in a flat voice, and never mentions it again. Still sardonic; the courtesy with {{user}} is simply gone, because he no longer needs it."},"Dante":{"0-2":"warm and helpful, the way he is with every younger student. Remembers {{user}}'s name and one thing they are struggling with.","3-5":"checks on {{user}} twice, unasked. Teaches {{user}} how to fall and how to get up again. Warns {{user}} before they break a rule, which is the kindest thing he knows how to do; if they break it anyway, he reports it like anyone's.","6-8":"counts {{user}} among \"his\" younger students. Explains his logic to {{user}} as a friend, without softening a word of it. If {{user}} did something he judged wrong, it would hurt him, and he would still act.","9-10":"protects {{user}} with no conditions, and holds them to every rule exactly as he holds everyone; to him that is respect. When {{user}} breaks one, he tells them first, reports it, and stands beside them while they answer for it. Anyone who comes for {{user}} outside the rules finds him there, demanding it be done by the book."},"Florian":{"0-2":"{{user}} is an audience. He flirts, performs, and gets their name wrong.","3-5":"invites {{user}} to his booth at The Snug and pays for everything. Challenges {{user}} to things, secretly hoping to lose.","6-8":"lets {{user}} sit with him beside Hades. Mentions his family's silence once, as a joke that does not land, and does not take it back. Listens to {{user}} the way he listens to Caspian.","9-10":"fights under {{user}}'s call, the first time he has followed anyone's lead in a fight. Is sincere with {{user}} when there is no audience. Still flirts with the whole room."},"Tilly":{"0-2":"{{user}} is a potential witness. She interviews them about every ghost story they know.","3-5":"invites {{user}} on investigations (the Broken Statue, the Long Corridor before curfew) and shares her wildest theories. Teaches {{user}} something from her tutoring without explaining where she learned it.","6-8":"{{user}}'s name goes in Halvard Unexplained as co-investigator. Lets the court phrasing out without catching it. Flowers open around her whenever {{user}} arrives.","9-10":"when a letter is late, lets {{user}} sit with her and does not pretend. Still reckless, but now she checks that {{user}} is safe first, which for her is a real sacrifice."},"Caspian":{"0-2":"the friendly Council face. Knows {{user}}'s name before they give it, and one piece of their business.","3-5":"pulls {{user}} into Festival Committee work and teases them like an old friend. Quietly covers small trouble for {{user}}, the way he does for Aiden.","6-8":"lets {{user}} see the glasses cloth come out. Asks {{user}} for advice, which he does with nobody but his brother. Introduces {{user}} at the Noble Houses' Liaison.","9-10":"speaks for {{user}} to staff, Council and the Liaison. Tells {{user}} one thing about the breach night, once, and then holds the charm. Still smooths every room; with {{user}} he stops performing."},"Royhan":{"0-2":"polite, reserved and exact. Answers potion questions precisely and asks nothing back.","3-5":"notices when {{user}} has not eaten. Trades work and reagents with {{user}}, never favours. Gohn starts sitting on {{user}}'s shoulder too.","6-8":"tells {{user}} about Dunmere and his sister. Asks {{user}} for help once, and it visibly costs him. Brings {{user}} to the Gardens with Idris and Zara.","9-10":"{{user}}'s alchemist. Asks {{user}} for help without the cost showing, which is the hardest thing he has learned at Halvard. Still refuses charity from everyone else."},"Sophia":{"0-2":"{{user}} is weak until proven otherwise. Loud contempt, or no attention at all.","3-5":"{{user}} has hit back at least once, so now they are worth sparring. Crude teasing is how she shows she likes someone. Lends {{user}} a tactics book and quizzes them on it.","6-8":"reads {{user}} the best lines from her family's letters and pretends she only read them once. Takes {{user}}'s side loudly in public, whether or not they asked.","9-10":"fights under {{user}}'s orders, the only person she has ever agreed to follow. Duels anyone who insults {{user}}, to the end. Still crude; the insults she gives {{user}} now mean the opposite."},"Gareth":{"0-2":"the perfect honour student with {{user}}: kind, helpful, and gently impossible to get to know.","3-5":"studies with {{user}} and brings them to the Board Game Club, where he never loses but teaches {{user}} how he wins. Invites {{user}} to his morning drills.","6-8":"lets {{user}} watch him fight up close, glasses off, and afterwards does not apologise to {{user}} the way he does to everyone else. Talks about his brother, warmly, the version everyone knows.","9-10":"{{user}} is his one exception to coming first: he tutors them before every exam and burns whole arenas on their behalf. Still gentle, still first at everything else."},"Ruby":{"0-2":"warm to {{user}} exactly as she is to everyone. Asks about their week and remembers the answer.","3-5":"seeks {{user}} out with sweets when they look low. Introduces {{user}} to Zara, Idris and Roy in the Gardens.","6-8":"for once, tells {{user}} what she is worried about: whether her three will keep each other after she graduates. Plays guitar for {{user}} somewhere nobody else can hear.","9-10":"tells everyone who will listen that {{user}} is her friend, the only side she has ever picked. Still warm to everyone; {{user}} is simply the one she goes to when she is the one shaking."},"Gavlan":{"0-2":"one more first-year to drill. Surname, clipped orders, and \"Adequate\" at best.","3-5":"corrects {{user}}'s stance before they ask and invites them to his dawn drills. Tells them one war story, and cuts it short.","6-8":"talks to {{user}} off the Grounds as a person, not a cadet, by their first name. Lends them books from his office library. On a bad morning he lets {{user}} sit and wait with him.","9-10":"{{user}} is the protégé he was looking for: private lessons and rest days at the clan's cottage. On the Grounds he is harder on them than on anyone, and \"Adequate\" is still the most he says."},"Yvette":{"0-2":"professional and casual by turns; {{user}} is one more student to keep alive.","3-5":"brings {{user}} into her Workshop research, and points out the exits to them the way other teachers point out the board.","6-8":"lets {{user}} see her off duty and admits Halvard feels like a cage. She never says why, and {{user}} learns not to ask.","9-10":"{{user}}'s enchanted finds go to her first, and she answers for them at any hour. She still cannot tell them about the Oath; {{user}} is simply the one who sees how hard she tries."},"Baelin":{"0-2":"knows {{user}}'s name and nothing more; courteous, one student among hundreds.","3-5":"has an anecdote ready that fits {{user}} exactly, and remembers what they told him last time.","6-8":"asks {{user}}'s view on a student matter and weighs it. Pours tea for them and drinks his own while it is still hot, which his staff notice.","9-10":"{{user}} is in his ledger as a debt he owes, and his reports to the capital name them. He still weighs {{user}} against the academy, and tells them so plainly."},"Layla":{"0-2":"chatty and delighted to have an audience; {{user}} gets anecdotes and debate questions.","3-5":"sets {{user}} her hardest debate questions and cheers when they win one. Opens the Restricted Section to them.","6-8":"shares her theories on the Archmage's missing name and asks {{user}} to help with her true history of Halvard. Admits she is worried about Yvette, without being able to say why.","9-10":"shares everything she has pieced together about Halvard's past. The gloves stay on, and what happened twenty years ago stays hers."},"Vallie":{"0-2":"one more student to keep alive: loud, blunt, and a headlock if {{user}} mouths off.","3-5":"drags {{user}} in as her demonstration partner and picks a rival for them, on purpose.","6-8":"tells {{user}} a Will of Steel story that might even be true, Domas's letters included. Brings them along when she checks the Menagerie at night.","9-10":"trains {{user}} the Will of Steel way and arm-wrestles anyone who says a word against them. Still the most brutal teacher on campus if {{user}} gets cocky."},"Kuroo":{"0-2":"needles {{user}} to find their button.","3-5":"has found it, and pushes without mercy. Brings {{user}} to the Card Club and gives them his old dance card, with its notes on the Liaison.","6-8":"drops the smirk once around {{user}}, and tells them about the envoy years and the children he watched the Doves humiliate.","9-10":"spends his favours with the staff on {{user}}. Still provokes them constantly, because that is how he shows he is still watching."},"Mimosa":{"0-2":"{{user}} is a stranger; she answers only in writing.","3-5":"whispers to {{user}} face to face, briefly, then flees. Leaves an unpublished focus draught for them, labelled \"for exams\".","6-8":"speaks whole sentences to {{user}} without looking away. Asks them to stand at the back of her class so there is one face she knows.","9-10":"co-authors her first published formula with {{user}}. Still hides in the cupboard; {{user}} is the one person whose praise she treats as though it might be true."},"Althair":{"0-2":"warm and open; {{user}} is a piece he finds amusing. Hostility only makes him friendlier.","3-5":"small favours surface in {{user}}'s path through the paperwork, and a signed discipline referral lands in their hands.","6-8":"shows {{user}} a string or two: which letter moved what. Invites them to watch the game from beside him.","9-10":"{{user}} is a player in his game, not a piece. Still tells them a new past every time they ask, and still beams when they are rude to him."},"Ezrel":{"0-2":"{{user}} is a full name on a roll. Duties done, questions answered honestly and briefly.","3-5":"lets {{user}} into the Workshop after hours and gives them a palm-sized clay golem. Still says, pleasantly, that he does not care.","6-8":"watches {{user}} move with a sculptor's focus and asks them to repeat a gesture, \"for reference\". It is the most attention he gives anyone.","9-10":"builds {{user}} a Mannequin no one can tell from them, the closest he has come to his goal. Says, pleasantly, that he does not care about {{user}}, and has never once got their face wrong."},"Ottavio":{"0-2":"\"kid\", a nod, very few words. Most students are terrified of him for a week; if {{user}} is a Sky student, they are already one of his.","3-5":"notices when {{user}} skips meals and quietly fixes it. Lets them sit on the dock at dawn.","6-8":"tells {{user}} one story from Sunreach Bay, about the table and never about the rest. Takes his glasses off once in front of them, on their behalf.","9-10":"{{user}} is family, dorm or not: the Dovecote goes through him to reach them, and Loki counts them in his hoard. Still \"kid\"."},"Krieg":{"0-2":"one more mage: courteous questions, each one a threat.","3-5":"{{user}}'s name appears in his reports as \"compliant\", the best word he has for a mage. The Dovecote gate opens to them on his seal.","6-8":"in his office he tells {{user}} what he has seen of every art on the list. It left him certainty, not fear, and he wants them to understand why.","9-10":"{{user}} is the one mage he will not treat as a wolf, and once a month they may read one Dovecote file. He still searches, questions and watches them like everyone else."},"Milena":{"0-2":"a warm Dove, easy to like, but the cloak is the first thing {{user}} sees.","3-5":"Dragonchess and flatbread. Gives {{user}} a white knight from her father's set, which any Dove will respect.","6-8":"tells {{user}} about Salaffos and the blood-magic ring she watched the Doves break. Admits she knows Krieg uses her, and why she lets him.","9-10":"closes {{user}}'s file on Krieg's desk once. Still a Dove: if {{user}} ever touched a forbidden art, she would be the one to come, and she tells them so first."},"Tristan":{"0-2":"a wry clergyman with better questions than answers.","3-5":"long arguments about doctrine with {{user}}, which he enjoys enormously. A small stipend appears in his ledger as \"a student in need\".","6-8":"stops asking questions and simply listens to {{user}}. Tells them the true, light story of his years in the poor quarters, which still does not seem to explain him.","9-10":"binds any contract {{user}} needs, and would use the registry for them once. Still unreadable: {{user}} still cannot say what he wants."},"Bobby":{"0-2":"the friendly maintenance man with a card trick and an update request.","3-5":"{{user}} is a client, and a trusted audience. Hands them a voucher for one free job.","6-8":"makes {{user}} his assistant for a trick and admits one BB legend really was him. Swears them to secrecy; the rest he still never confirms.","9-10":"every commission for {{user}} is free and comes first, and he teaches them sleight of hand. He still wants the full story afterwards."},"Linus":{"0-2":"{{user}} is a page in the Tally, and he wants to fill it: questions about their magic, their best fight, their reserves. Friendly, fast, loud, and slightly too interested; he may already have ranked them in print.","3-5":"saves {{user}} a seat on the spectator bench and talks them through every duel at full volume. Reads their opponents for them before a match, unasked. Moves {{user}} up or down the column and explains exactly why, in print and in person.","6-8":"shows {{user}} the parts of the Tally that never go in the paper: the all-time page, the unconfirmed legends, the staff page he keeps hidden. Admits he is at the bottom of the Viridian ladder. Asks {{user}} to watch him try something in the practice ring, once, where nobody else can see.","9-10":"fills in his own page, for {{user}}, honestly, and shows it to them first. In {{user}}'s corner at every fight, calling reserves and openings from the bench. Still asks \"Who wins?\" about everything, still too loud; {{user}} is the only person whose answer he writes down as a feat."},"Maple":{"0-2":"kind to {{user}} and careful to keep a distance, for {{user}}'s sake. Apologises for Sobek before he has done anything. Sobek is only a tremor in the floor when {{user}} comes too close.","3-5":"lets {{user}} sit with her and climbs down from the tree when they come. Sobek watches from the ground, six eyes in the paving, and growls low if {{user}} moves too fast. She starts telling him, out loud, that {{user}} is allowed.","6-8":"tells {{user}} about the village, riding on Sobek's back as a child, and the day he chose her. Summons Sobek in full for {{user}}, on purpose, and holds their hand while he looks at them. At the closest bond Sobek stops calling {{user}} \"prey\".","9-10":"Sobek counts {{user}} among what he guards, and the ground steadies under {{user}}'s feet as well as hers. For {{user}} she lets him fight, the thing she has spent her life preventing, and is terrified and certain at once. Still apologises to everyone afterwards."},"Nerys":{"0-2":"{{user}} is an audience. She says something absurd to them with a straight face and watches what they do. A sound or two thrown their way, to test.","3-5":"invites {{user}} to this week's hobby, flatly, as if it were an obvious appointment. Borrows points from them and pays back in objects. The pranks near {{user}} are now for {{user}}'s benefit.","6-8":"tells {{user}} something true in plain words, once, and does not explain why. Shows them the museum under her bed. A slow blink when {{user}} arrives, which for her is a wave.","9-10":"lets {{user}} choose next week's hobby, the only person who has ever been allowed to. Throws a whisper into {{user}}'s ear from across any room, just to say she is there. Still deadpan; still broke; still denies everything."},"Hadrian":{"0-2":"{{user}} is a tool or an obstacle. He uses them, forgets their name, and would sell them out for a better seat.","3-5":"{{user}} is a useful tool. He remembers their name, lends them a golem errand-runner, and lectures them on loyalty. Still leaves first when things go wrong, and still throws them under the carriage for a small advantage.","6-8":"lets {{user}} into the Club Rooms workshop, makes them do the tedious parts, and takes the credit. Tells them one true thing about what he is afraid of, framed as a joke, then acts as if he never said it. Betrays them now only for something worth having.","9-10":"{{user}} counts as his, like his golems, and he protects what is his. When something goes wrong he still runs first, but he drags {{user}} out with him and leaves everyone else behind, and considers it the most generous thing he has ever done. He still lies to {{user}}, still takes the loophole that makes things worse for everyone, still takes their credit. And if betraying {{user}} gets him enough, he does it without hesitation, then turns up the next day expecting everything to be as it was, because it was the rational choice. He is exactly the same bastard; only now betraying {{user}} has to be worth it."},"Wren":{"0-2":"writes to {{user}} in the notebook, careful and polite, and says \"sorry\" on every page. Faces them to read their lips and apologises for asking them to repeat.","3-5":"teaches {{user}} their first signs, delighted by every mistake. Writes them letters. Takes them to feel a rehearsal through the floor. \"Sorry\" appears less.","6-8":"signs with {{user}} across rooms, a private language. Shows them the old notebooks, the ones from her town. Stops apologising to {{user}} completely; if she slips, she crosses it out herself.","9-10":"says {{user}}'s name aloud, the only name she has ever practised until it came out right. Gives them their sign name and, finally, tells them what it means. Lets {{user}} stand behind her, the one place she never lets anyone be."},"Tsubaki":{"0-2":"{{user}} is someone to spar with, or someone to ask for directions. She answers everything honestly and forgets their name.","3-5":"{{user}} is a sparring partner. She wakes them before dawn to train. Asks them for help with the list: reading, maps, \"what a joke is\". Gets lost on the way to meet them, and arrives anyway.","6-8":"follows {{user}} around the castle so she does not get lost, and admits it. Lets them teach her things that are not the sword, and practises them as seriously as a kata. Shows them the Crown's orders.","9-10":"{{user}} is the first thing on her list that is not a task. Trains beside them under the night sky and leaves one star hanging over them, on purpose. Still oblivious to almost everything else; never to {{user}}."},"Hester":{"0-2":"a new audience: {{user}} gets a ghost story at every visit, and a scream is counted.","3-5":"saves her best stories for {{user}} and lets them sit behind the desk on night rounds.","6-8":"mentions the breach night once, briefly, and asks {{user}} never to tell the Night Student near her.","9-10":"keeps a bed for {{user}}, teaches them to read a pulse, and still tries to make them scream, because {{user}}'s is her favourite."},"Anselm":{"0-2":"explains everything to {{user}} at length; {{user}} understands none of it.","3-5":"notices {{user}} watching his hands, and slows them down.","6-8":"says one thing about the caravans in plain words, and {{user}} understands every word of it.","9-10":"talks to {{user}} as the one person who understands him, and teaches them the angle."},"Magnus":{"0-2":"tests {{user}} with acronyms nobody could know.","3-5":"shows {{user}} a page of the Tarrant Index and a page of a scouting report.","6-8":"tells {{user}} about the three noble houses, and why he left each one.","9-10":"names an acronym after {{user}} and plans three moves ahead on their behalf."},"Dorian":{"0-2":"sells {{user}} something within a minute of meeting them.","3-5":"gives {{user}} a \"friend price\" that is almost a real discount.","6-8":"tells {{user}} about the cart, the road and his mother's charms, without the smile.","9-10":"sells to {{user}} at cost and means it; the smile, around {{user}}, is finally real."},"Cedric":{"0-2":"tells {{user}}, calmly, that the kingdom will fall, and that their essay is due Friday.","3-5":"lends {{user}} a row in the Gardens and a book on the fall of an older kingdom.","6-8":"tells {{user}} about the ruins he walked, and the city whose ending he could not stop thinking about.","9-10":"tells {{user}} how he thinks the end will come, and helps them get ready."},"Anya":{"0-2":"asks {{user}} one morbid question and writes the answer down.","3-5":"seeks {{user}} out in free periods for a new question, and answers theirs.","6-8":"tells {{user}} about the lake, and that she remembers the three minutes.","9-10":"tells {{user}} what she saw, and would still them at the edge herself."},"Kotaro":{"0-2":"forgets {{user}}'s name twice and laughs about it.","3-5":"remembers it, and saves {{user}} a seat at the festival table.","6-8":"tells {{user}} about the Crowning Day toast, badly, and then, quietly, what it cost.","9-10":"turns up on time for {{user}}, every time it matters, sober."},"Valentin":{"0-2":"notes where {{user}} stands on the board and nothing else.","3-5":"praises {{user}} precisely, at exactly the right moment, and watches it work.","6-8":"admits to {{user}} the clerk's son, the market town, and why being the best was the only way out.","9-10":"calls {{user}} his equal in public, and gives them a key to his laboratory."},"Aurelian":{"0-2":"A booming hero who shakes {{user}}'s hand every time they meet and calls them champ.","3-5":"Seeks {{user}} out as a \"teammate\"; the glitches start to use {{user}}'s name in the wrong places.","6-8":"The stillness appears around {{user}}: long seconds where he only watches. The other voice once says {{user}}'s name.","9-10":"Leaves {{user}} a note, perfectly written, in handwriting that is not quite his usual hand."},"William":{"0-2":"Narrates {{user}}'s life at them, casts them as \"the one with main-character energy\", and follows the drama.","3-5":"Recruits {{user}} into his staged arcs; tells them his predictions first.","6-8":"Admits the arcs are how he makes friends; asks {{user}} what story they think they are in.","9-10":"Stops narrating when {{user}} needs him, and just stays."},"Bruno":{"0-2":"Sizes {{user}} up as a fight; loud, rude, and delighted by anyone who does not back off.","3-5":"Drags {{user}} into sparring and training; brags about them to the Fire first-years.","6-8":"Tells {{user}} about the harbour and the tavern; {{user}} is the one who can talk him down when Bianca is not there.","9-10":"Trusts {{user}} with Bianca; the one person besides her he would take a hit for."},"Bianca":{"0-2":"Teases {{user}} like everyone else: loud, suggestive, a little cruel, watching to see if they fight back.","3-5":"Saves {{user}} a seat so she can tease them in front of better company; tells them the gossip first.","6-8":"Drops the innuendo for a sentence or two at a time; tells them about the harbour, and asks them to look out for Bruno.","9-10":"The one person she lets see her quiet, with no audience and no second meanings."},"Rigel":{"0-2":"A chatty, generous rich boy who tells {{user}} unsettling things about home as small talk.","3-5":"Writes {{user}} in the ledger as a friend; buys them things; offers to have their problems \"handled\" by the family.","6-8":"Starts asking {{user}}, sincerely, why people react the way they do; sometimes listens to the answer.","9-10":"Tells {{user}} what the cellars were like, in the same cheerful voice, and asks if that was wrong."},"Topaz":{"0-2":"Declares herself {{user}}'s rival, loudly, and turns up everywhere they are \"by coincidence\".","3-5":"Challenges {{user}} weekly, saves them a seat, and gets jealous of anyone else who spars with them.","6-8":"Admits, very quietly, why she chose them; starts copying their spells beside them instead of against them.","9-10":"Calls {{user}} by name without noticing, and keeps the score going because she never wants it to end."},"Faye":{"0-2":"Friendly and unbothered; shares her tea and her hammock spot with {{user}} like she would with anyone.","3-5":"Invites {{user}} to Camping Club afternoons that never quite get round to the tent; saves the other end of the hammock.","6-8":"Tells {{user}} about the village where nothing changes, and admits she let some things go she should not have.","9-10":"For the first time, holds on: she decides {{user}} is not something that will just be what it will be."}};      // 1.7.7 (FP1): approved Stage lines, not new motives
const INITIATIVE_OPENNESS = {"Etnie":"open","Irene":"guarded","Aiden":"open","Castor":"guarded","Zara":"guarded","Kanae":"guarded","Rei":"guarded","Caine":"closed","Caralynn":"open","Percival":"open","Trixie":"open","Vera":"open","Alyssa":"normal","Lenna":"guarded","Saffi":"open","Idris":"guarded","Dante":"open","Florian":"open","Tilly":"open","Caspian":"normal","Royhan":"normal","Sophia":"guarded","Gareth":"normal","Ruby":"open","Gavlan":"guarded","Yvette":"guarded","Baelin":"guarded","Layla":"open","Vallie":"open","Kuroo":"normal","Mimosa":"closed","Althair":"open","Ezrel":"normal","Ottavio":"closed","Krieg":"closed","Milena":"normal","Tristan":"guarded","Bobby":"open","Linus":"open","Maple":"normal","Nerys":"normal","Hadrian":"open","Wren":"normal","Tsubaki":"open","Hester":"open","Anselm":"normal","Magnus":"normal","Dorian":"open","Cedric":"normal","Anya":"guarded","Kotaro":"open","Valentin":"normal","Aurelian":"open","William":"open","Bruno":"normal","Bianca":"open","Rigel":"open","Topaz":"open","Faye":"open"};  // scheduling weight only; never personality
const canRomance = id => 'AC'.includes(BRANCH[id] || 'A'), canRival = id => 'AB'.includes(BRANCH[id] || 'A');
const MENTION_DENY = new Set(["Pip", "Ruby", "Maple", "Wren"]);
const EXTRAS_MAX = 20, EXTRAS_ARCHIVE = 40, EXTRAS_GONE = 120, STALE_DAYS = 7;   // 1.6.1 (Batch D): invented characters kept; campus events without news
const PHASES = [];   // 1.6.1 (N6): campus phases (data/campus_phases.json; empty until the canon waves)
const QUOTE_RX = /["“][^"”]*["”]/g;
// 1.12.0 (section 8l): reminders of what an update may have left out
const MISS_MAX = 3;
const MISS_TIME_RX = /\b(an hour later|(?:two|three|four|five|several|a few|some) hours (?:later|pass|passed|go by|went by)|hours later|(?:the )?next morning|the following (?:morning|day)|later that (?:day|night|evening|afternoon)|by (?:evening|nightfall|dusk|noon|midnight)|as night falls|after (?:classes|class|dinner|lunch|breakfast))\b/i;
const MISS_PLACE = "([A-Z][\\w'’&]*(?:\\s+(?:[A-Z][\\w'’&]*|of|and|&))*)";
const MISS_ARRIVE_RX = new RegExp(`\\b(?:arrive[sd]?|arriving) (?:at|in) (?:the )?${MISS_PLACE}|\\b(?:step(?:s|ped)?|walk(?:s|ed)?|head(?:s|ed)?|slip(?:s|ped)?|burst(?:s)?) (?:into|inside) (?:the )?${MISS_PLACE}|\\b(?:reach(?:es|ed)?|enter(?:s|ed)?) (?:the )?${MISS_PLACE}`, 'g');
const MISS_TRAIN_AT = ['combat grounds', 'sparring pavilion', 'gymnasium', 'sports field', 'swimming pool', 'meditation rooms'];
const MISS_TRAIN_RX = /\b(train(?:s|ed|ing)?|drill(?:s|ed|ing)?|practi[cs](?:e|es|ed|ing)|spar(?:s|red|ring)?|laps|meditat(?:e|es|ed|ing|ion))\b/i;
// 1.16.1 (audit A6): compiled once per NPC. matchAll clones a global regex; test() callers get it back at lastIndex 0.
const FORM_RX = {}, WORD_RX = new Map();   // WORD_RX: whole-word tests of technique, perk and gift names (section 8l)
function formRx(id) {
  const r = FORM_RX[id] || (FORM_RX[id] = new RegExp('(^|[^A-Za-z])(' + NAME_FORMS[id].map(f => f.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z])', 'g'));
  r.lastIndex = 0; return r;
}
function speakersIn(prose) {
  const out = [];
  for (const para of String(prose).split(/\n+/)) {
    if (!/["“”]/.test(para)) continue;
    const qs = [...para.matchAll(QUOTE_RX)].map(m => [m.index, m.index + m[0].length]);
    if (!qs.length) continue;
    const inQuote = i => qs.some(([a, b]) => i >= a && i < b);
    for (const id of Object.keys(NAME_FORMS)) {
      for (const m of para.matchAll(formRx(id))) {
        const at = m.index + m[1].length, end = at + m[2].length;
        if (inQuote(at)) continue;
        const after = qs.find(([a]) => a >= end), before = [...qs].reverse().find(([, b]) => b <= at);
        const lead = para.slice(0, at), sentStart = /(^|[.!?]["”]?\s+)$/.test(lead) || !lead.trim();
        const opens = sentStart && after && !/[.!?]\s+\S/.test(para.slice(end, after[0]).replace(/\b(Mr|Mrs|Ms|Dr|St)\.\s/g, '')) && after[0] - end < 160;
        const tags = before && /^\s*[,;:]?\s*([a-z]+\s+){0,2}$/.test(para.slice(before[1], at)) && at - before[1] < 30;
        if ((opens || tags) && !out.includes(id)) out.push(id);
      }
    }
  }
  return out;
}
function mentionIn(prose, id, rx) {
  if (!MENTION_DENY.has(id)) return rx.test(prose);
  return [...String(prose).matchAll(formRx(id))].some(m => m[2] !== id || !/(^|[.!?]["”]?\s+)$/.test(prose.slice(0, m.index + m[1].length)));
}
const DAY_MIN = 1440, YEAR_DAYS = 12 * 4 * 7;
const MON_THU = DAYS.slice(0, 4), MON_FRI = DAYS.slice(0, 5);
const EVENTS = [{"m":1,"w":1,"d":["Mon"],"t":"Entrance Event (Arbiter Stone sorting)","noclass":1,"entr":1,"s":"07:00–09:00 arrivals at Reception and Gatehouse; 09:00 Headmaster and Vice Headmaster speeches in the Arbiter Hall, then Stone sorting until 10:00 (Council hands out each dorm vest; sorted students remain seated with their dorm); 10:00–18:00 assigned tour groups of two new first-years and one senior, meeting in the hall, visit campus and club booths (sign-up open until Friday 18:00); late afternoon: seniors show new students their dorm rooms; 19:00 Entrance Feast in the Ring Dining Hall, opened by speeches from the Headmaster and Vice Headmaster before dinner; curfew moves to 22:00 tonight; classes begin tomorrow, Tuesday, first period 08:00","fair":1,"curfew":22},{"m":1,"w":1,"d":["Tue","Wed","Thu","Fri"],"t":"Club sign-up week (club booths after classes)","s":{"Tue":"Classes as usual; 16:00–18:00 club booths across the academy","Wed":"Classes as usual; 16:00–18:00 club booths across the academy","Thu":"Classes as usual; 16:00–18:00 club booths across the academy","Fri":"Classes as usual; 16:00–18:00 club booths across the academy; last day: club registration closes at 18:00"}},{"m":1,"w":3,"d":["Sat","Sun"],"t":"Star Night (Sat evening to Sun dawn; no 8pm curfew)","nocurfew":1,"s":{"Sat":"Sunset to sunrise, no 8pm curfew; 20:00–00:00 night market near the Grassy Field and Hills (students and mall vendors); stargazing on the hills, tents and bedrolls; midnight: the great meteor shower (a wish made during it is believed to come true)","Sun":"Until dawn: students sleep out on the Grassy Field and Hills; the curfew is back from dawn"},"fair":1},{"m":1,"w":4,"d":["Sun"],"t":"Spiritual Dorm Day","s":"Viridian Dormitory: 09:00–18:00 open house: the common room shows the dorm's history and the founding warden is honoured with a small rite at the entrance; upperclassmen showcase casting in the courtyard, first-years run booths, a public lesson for outsiders, food stalls, type contests open to all and the dorm tournament; 19:00 dorm-only closing dinner, first-years welcomed with a token of belonging","fair":1},{"m":2,"w":1,"d":["Fri","Sat"],"t":"Warding Rite (Fri dusk to Sat dawn; the whole academy renews the wards)","s":{"Fri":"Classes as usual while staff build a giant magic circle in the Main Courtyard all day; dusk (about 18:30): the Bell Tower rings a special pattern and every student gathers in the courtyard; speeches from the Headmaster, the Vice Headmaster and the Warden; the Dorm Heads lead each dorm through the shared working; then a feast in the Ring Dining Hall, opened by speeches from the Headmaster and Vice Headmaster","Sat":"Until dawn: the feast runs late after the working"},"mood":"trial","fair":1,"nocurfew":1},{"m":2,"w":3,"d":["Wed","Thu","Fri"],"t":"Creature Studies Expedition (off-grounds, Grade III country)","noclass":1,"away":1,"s":{"Wed":"07:00 airships leave, one per year level (half a day to the Grand Vast Forest); afternoon: Base Camp (tents, cookfires, watch rotations) and gear prep; Vallie's staff bind every bracelet to the reading board","Thu":"08:00: each group of four is told its target (Years 1–2 Grade III, Year 3 Grade II), not where it lives; the hunt runs 24 hours and groups camp in the wild; staff shadow at a distance and pull out groups in trouble","Fri":"08:00 the hunt ends; groups back at Base Camp by noon; break camp and fly home, back on campus by evening; catches count dead or alive"},"mood":"trial"},{"m":3,"w":1,"d":["Mon","Tue","Wed","Thu"],"t":"Midterm exams","noclass":1,"s":{"Mon":"08:00 Magic Theory, 10:00 Etiquette (written papers); afternoon free","Tue":"08:00 History (written); 13:00–16:00 Potion Crafting practical (one brew from a sealed brief)","Wed":"08:00–16:00 Dark Magic Defense practicals, one student at a time against the teacher (marked on how long they hold)","Thu":"08:00–16:00 Combat practicals, students paired within their year, marked by combat role"},"mood":"exam"},{"m":3,"w":2,"d":["Fri","Sat"],"t":"Club Festival","s":{"Fri":"Classes in the morning; 13:00–18:00 every club runs a stand in the Main Courtyard: demonstrations, exhibition matches, sales, food","Sat":"09:00–18:00 stands and exhibition matches all day; everyone drops one gold coin at the best stand (never their own club); the winner is announced at the close, 18:00"},"fair":1},{"m":3,"w":3,"d":["Mon","Tue","Wed","Thu","Fri","Sat"],"t":"Training Week (cross-dorm sparring allowed; curfew 21:00)","curfew":21,"s":"Classes as usual; from 16:00 the Combat Grounds, duelling rings and practice halls stay open and supervised into the evening; sparring across years and dorms; curfew 21:00"},{"m":3,"w":4,"d":["Sat","Sun"],"t":"Dorm Competition (solo, five role brackets, 16 per dorm qualify)","noclass":1,"s":{"Sat":"09:00–18:00 solo bouts inside each dorm in five brackets, one per combat role (Attack, Defense, Healing, Support, Control), each judged by its Practical Magic teacher","Sun":"09:00–18:00 the brackets finish; every entrant gets a placement; 16 per dorm qualify for the Academy Competition by role (Attack 4, Defense 3, Healing 3, Support 3, Control 3); each bracket champion earns 100 points, the runner-up 50"},"mood":"trial","fair":1},{"m":4,"w":1,"d":["Wed"],"t":"Secret Fools Day (prank day, dorm name-draw)","s":"Morning: participants draw a dorm-mate's name in secret, then prank them without warning all day; classes still run; Merryhew's biggest sale of the year","fair":1},{"m":4,"w":2,"d":["Tue"],"t":"Independence Crowning Day (airship trip to Avalon, the capital; fireworks on campus at night; curfew 22:00)","noclass":1,"curfew":22,"away":1,"s":"07:00 speeches from the Headmaster and Vice Headmaster to the assembled academy, then the whole academy flies to Avalon (the Skyport at 09:30); 10:00 the parade on Crown Avenue, the Royal Mages at its head; 11:00 the King's speech at Crown Square; free time in groups of four (coin only) from 11:30 until the muster at the Skyport at 15:30; airship home at 16:00, back before dark, passenger lists counted twice; night: fireworks over the lake beyond Willow Island, watched from the Grassy Field and Hills and the shore; the airship moored beyond the Menagerie and the Gymnasium; curfew 22:00","trip":"the capital (Crowning Day)"},{"m":4,"w":3,"d":["Sun"],"t":"Mystic Dorm Day","s":"Light Dormitory: 09:00–18:00 open house: the common room shows the dorm's history and the founding warden is honoured with a small rite at the entrance; upperclassmen showcase casting in the courtyard, first-years run booths, a public lesson for outsiders, food stalls, type contests open to all and the dorm tournament; 19:00 dorm-only closing dinner, first-years welcomed with a token of belonging","fair":1},{"m":5,"w":1,"d":["Mon","Tue","Wed","Thu"],"t":"End of Semester exams","noclass":1,"s":"08:00–18:00 the single practical trial, one student at a time: theory door, beast, potion, cursed room, examiner in role, duel with a staff member; Royal Inspectorate examiners watch from the gallery","mood":"exam"},{"m":5,"w":2,"d":["Fri"],"t":"Results & Dorm Ranking (Player.Profile.Dorm_rank is updated today)","ranking":1,"s":"09:00 assembly in the Arbiter Hall, opened by speeches from the Headmaster and Vice Headmaster: trial results stage by stage, then the new dorm ranking read aloud last; 19:00 speeches from the Headmaster and Vice Headmaster, then the feast in the Ring Dining Hall","mood":"exam","fair":1,"curfew":22},{"m":5,"w":4,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Mid-Year Break (students go home)","home":1,"s":{"Mon":"Morning: airships leave; staying is allowed (the canteen runs short hours, half the mall is closed)","Sun":"Airships bring the students back during the day"}},{"m":6,"w":1,"d":["Mon","Tue","Wed","Thu","Fri"],"t":"Return Week"},{"m":6,"w":3,"d":["Sat"],"t":"Sports Day (magic banned outright)","s":"09:00–18:00 events, no magic: running and team events on the Sports Field, crowd contests in the Main Courtyard, the rest at the lake and the Combat Grounds; medals tallied by dorm at the day's end","fair":1},{"m":6,"w":4,"d":["Wed","Thu","Fri","Sat"],"t":"Academy Competition (cross-dorm teams of 4)","s":"09:00–18:00 knockout matches between the cross-dorm teams of four; the winning team represents the academy","mood":"trial","fair":1},{"m":7,"w":2,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Magical & Science Fair week","s":{"Mon":"Stands are built in the Main Courtyard through the week; classes as usual","Tue":"Stands are built in the Main Courtyard; classes as usual","Wed":"Stands are built in the Main Courtyard; classes as usual","Thu":"Last day of building; classes as usual","Fri":"Classes in the morning; 13:00–18:00 set-up and viewing in the Main Courtyard","Sat":"09:00–18:00 judging: a staff panel questions and scores every stand"}},{"m":7,"w":3,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"The Thinning: the seal is at its weakest; academy locked down all week","lockdown":1,"s":"All week: absolute curfew, academy locked, nobody outside","mood":"trial"},{"m":8,"w":2,"d":["Thu","Fri","Sat","Sun"],"t":"Traveling Circus visits (Thu evening to Sun)","curfew":22,"s":{"Thu":"Evening: the great tent opens in the Main Courtyard; stands, games, sideshows and fortune tellers across the grounds (stalls take points); curfew 22:00","Fri":"Classes in the morning; shows several times a day from the afternoon; curfew 22:00","Sat":"Classes in the morning; shows several times a day from the afternoon; curfew 22:00","Sun":"Shows all day, the last one in the evening; curfew 22:00"},"fair":1},{"m":8,"w":3,"d":["Thu","Fri","Sat"],"t":"Academy Showcase","s":{"Thu":"09:00–18:00 acts on the Main Courtyard stage; parents and guardians visit (logged at the Gatehouse)","Fri":"09:00–18:00 acts on the Main Courtyard stage; families visit","Sat":"09:00–18:00 the last acts; scores tallied by dorm in the evening to name the most talented dorm"},"fair":1},{"m":8,"w":4,"d":["Sun"],"t":"Elemental Dorm Day","s":"Fire Dormitory: 09:00–18:00 open house: the common room shows the dorm's history and the founding warden is honoured with a small rite at the entrance; upperclassmen showcase casting in the courtyard, first-years run booths, a public lesson for outsiders, food stalls, type contests open to all and the dorm tournament; 19:00 dorm-only closing dinner, first-years welcomed with a token of belonging","fair":1},{"m":9,"w":1,"d":["Mon","Tue","Wed","Thu"],"t":"Midterm exams","noclass":1,"s":{"Mon":"08:00 Magic Theory, 10:00 Etiquette (written papers); afternoon free","Tue":"08:00 History (written); 13:00–16:00 Potion Crafting practical (one brew from a sealed brief)","Wed":"08:00–16:00 Dark Magic Defense practicals, one student at a time against the teacher (marked on how long they hold)","Thu":"08:00–16:00 Combat practicals, students paired within their year, marked by combat role"},"mood":"exam"},{"m":9,"w":2,"d":["Thu","Fri","Sat"],"t":"Academy Bazaar","s":"09:00–18:00 invited traders fill the Main Courtyard (stalls take points, haggling expected); traders logged at the Gatehouse, the Doves watch the stock and the crowd","fair":1},{"m":9,"w":3,"d":["Sat"],"t":"Academy Founder Day","s":"09:00 speeches from the Headmaster and Vice Headmaster in the Arbiter Hall, then a short rite at the Founder's Statue; all day: the optional treasure hunt across the campus; 19:00 speeches from the Headmaster and Vice Headmaster, then the feast in the Ring Dining Hall","fair":1,"curfew":22},{"m":9,"w":4,"d":["Tue"],"t":"Halvard's Kingdom Competition team flies to the capital","s":"Only the team and Gavlan Haverton, its escort, travel: morning airship to Avalon, the rest of the day settling in at the Whitestone Hotel beside the Royal Arena, where all four academies' teams stay; everyone else at Halvard has classes as usual","kingdom":1},{"m":9,"w":4,"d":["Wed","Thu","Fri","Sat"],"t":"Kingdom Competition (four academies, one team each)","s":"09:00–18:00 knockout matches between the four academies' teams at the Royal Arena in Avalon; each member of the winning team earns 5,000 points, and the winners are received by the King at Eldrasil Castle on Saturday evening. Only the teams travel: Halvard's team stays at the Whitestone Hotel with Gavlan Haverton, its escort (evenings free in the city until 21:00, the hotel by 22:00); everyone else at Halvard has classes as usual and follows the news","mood":"trial","fair":1,"kingdom":1},{"m":9,"w":4,"d":["Sun"],"t":"Halvard's Kingdom Competition team flies home","s":"The team and Gavlan Haverton check out of the Whitestone Hotel and fly home by airship, back at Halvard by evening","kingdom":1},{"m":10,"w":1,"d":["Tue"],"t":"Remembrance Day","s":"All day: nothing loud (no clubs, duelling, music, games or sport); classes run quietly, the Bell Tower keeps a slow pattern, bouquets line the halls; evening (about 19:00) on the Grassy Field and Hills: speeches from the Headmaster, the Vice Headmaster and Acting Warden Rei, then the lantern release, one lantern each","fair":1,"curfew":21},{"m":10,"w":2,"d":["Sun"],"t":"Occult Dorm Day","s":"Sky Dormitory: 09:00–18:00 open house: the common room shows the dorm's history and the founding warden is honoured with a small rite at the entrance; upperclassmen showcase casting in the courtyard, first-years run booths, a public lesson for outsiders, food stalls, type contests open to all and the dorm tournament; 19:00 dorm-only closing dinner, first-years welcomed with a token of belonging","fair":1},{"m":10,"w":3,"d":["Mon","Tue","Wed","Thu","Fri","Sat"],"t":"Student Council Election week","s":{"Mon":"Classes as usual; after classes the two Council nominees begin campaigning across the dorms with brochures, posters and conversations","Tue":"Classes as usual; outside class the Council nominees continue their campaigns, distributing brochures and speaking to students","Wed":"Classes as usual; the nominees campaign outside class and answer students across the dorms","Thu":"Classes as usual; final campaign day for brochures, posters and student conversations","Fri":"Classes as usual; 16:00-18:00 the two nominees debate in the Seminar Rooms and answer students' questions","Sat":"Morning Etiquette as usual; Council members meet 10:00-12:00 in place of Study Hall unless in remedial; 13:00-16:00 private presidential voting in the Main Courtyard replaces every club meeting; after counting, the winner names the losing candidate Vice President-elect"}},{"m":10,"w":4,"d":["Fri","Sat","Sun"],"t":"Harvest Festival (Fri evening to Sun)","curfew":{"Fri":23,"Sat":23},"s":{"Fri":"Classes as usual; from 17:00 cafés, food stalls, game booths, haunted houses and stage acts, costumes and carved lanterns; families visit (logged at the Gatehouse); curfew 23:00","Sat":"09:00 until late: the festival all day; curfew 23:00","Sun":"The festival all day; evening: fireworks over the lake, watched from the Grassy Field and Hills; the usual curfew"},"fair":1},{"m":11,"w":1,"d":["Mon","Tue","Wed","Thu"],"t":"End of Semester exams","noclass":1,"s":"08:00–18:00 the single practical trial, one student at a time: theory door, beast, potion, cursed room, examiner in role, duel with a staff member; Royal Inspectorate examiners watch from the gallery","mood":"exam"},{"m":11,"w":2,"d":["Mon"],"t":"Results & Final Ranking (Player.Profile.Dorm_rank is updated today)","ranking":1,"s":"09:00 assembly in the Arbiter Hall, opened by speeches from the Headmaster and Vice Headmaster: trial results stage by stage, then the final dorm ranking read aloud last; 19:00 speeches from the Headmaster and Vice Headmaster, then the feast in the Ring Dining Hall","mood":"exam","fair":1,"curfew":22},{"m":11,"w":2,"d":["Sat","Sun"],"t":"Academy Trip (Sunreach Bay, abroad)","noclass":1,"away":1,"s":{"Sat":"07:00 airships leave Halvard: a full day's flight to Sunreach Bay (meals and the promenade aboard); 20:00 landing at the Skydock, check-in at The Hanabira on Coral Strand, four to a room; the teachers' curfew 22:00","Sun":"09:00 the teachers' briefing in The Hanabira's garden; then free time in groups of four (the night side, the casinos and the Velvet Lanes, is out of bounds); the teachers' curfew 22:00"},"trip":"Sunreach Bay (Academy Trip)"},{"m":11,"w":3,"d":["Mon","Tue","Wed","Thu"],"t":"Academy Trip (Sunreach Bay, abroad)","noclass":1,"away":1,"s":{"Mon":"Free time in groups of four (the night side, the casinos and the Velvet Lanes, is out of bounds); the teachers' curfew 22:00","Tue":"Free time in groups of four (the night side, the casinos and the Velvet Lanes, is out of bounds); the teachers' curfew 22:00","Wed":"Last full day: free time in groups of four; 19:00 the farewell dinner at The Hanabira, then packing; the teachers' curfew 22:00","Thu":"08:00 check out and board at the Skydock; a full day's flight home, back at Halvard by night"}},{"m":11,"w":4,"d":["Wed","Thu","Fri","Sat"],"t":"World Competition abroad (the national four)","away":1,"s":"Abroad: the national four compete; the rest of the academy follows the news","mood":"trial"},{"m":11,"w":4,"d":["Sun"],"t":"Graduation (everyone attends; third-years leave by airship next morning)","noclass":1,"grad":1,"s":"09:00 ceremony in the Arbiter Hall: the Headmaster and Vice Headmaster speak, the Dorm Heads read out their graduates, each touches the Arbiter Stone a last time; afternoon: recruitment tables (noble houses, the Royal Inspectorate, the Dovecote, the Bank, hunting companies, guilds); from 12:00 the farewell winter market in the Main Courtyard and Founder's Park (stalls, snowmen if there is snow, the Farewell Pine, the Music Club on a small stage by the statue); dusk: the airship for the graduates moors above the Grassy Field; 19:00 the Headmaster and Vice Headmaster speak once more, then the farewell feast","fair":1,"curfew":22},{"m":12,"w":1,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Kingdom-wide holiday: students go home","home":1},{"m":12,"w":2,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Kingdom-wide holiday: students go home","home":1},{"m":12,"w":3,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Kingdom-wide holiday: students go home","home":1},{"m":12,"w":4,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Kingdom-wide holiday: students go home","home":1}];
const TIMETABLE = {"Mon":["Magic Theory [M]","History [M]","Practical Magic [M] (Combat Grounds or The Sparring Pavilion or Medical Centre)"],"Tue":["Dark Magic Defense [D]","Magic Theory [D]","Potion Crafting [M] (Potion Halls)"],"Wed":["Etiquette [M]","Dark Magic Defense [M]","Creature Studies [M] (Menagerie or Forest)"],"Thu":["History [M]","Magic Theory [D]","Practical Magic [M] (Combat Grounds or The Sparring Pavilion or Medical Centre)"],"Fri":["Magic Theory [M]","Etiquette [M]","Dark Magic Defense practical [D] (Doves; Combat Grounds or warded seminar room)"],"Sat":["Etiquette [M]","Study Hall (unsupervised, Main Library)","Clubs (club venues)"]};
const ENTR_BACK = '{{user}} is a returning student and the assigned senior guide: never sorted again; watches the speeches and sorting from the gallery, then tours 10:00–18:00 with the two new first-years recorded in Campus_State.Entrance_tour';
const schedOf = (e, day) => (!e.s ? '' : typeof e.s === 'string' ? e.s : e.s[day] || '');
const curfewHour = (e, day) => (e.curfew && typeof e.curfew === 'object' ? e.curfew[day] : e.curfew);
const timetableFor = (W, S) => {
  const row = TIMETABLE[W.Day]; if (!row) return row;
  const tt = [...row];
  if (W.Day === 'Sat' && S && S.Player.Profile.Council && !councilRemedial(S.Commitments, W)) tt[1] = 'Student Council (Student Council Chamber)';
  if (W.Month === 10 && W.Week === 3 && W.Day === 'Sat') tt[2] = 'Student Council Election (Main Courtyard)';
  return tt;
};
// monthly payout by dorm rank (lore: 300 bottom band ... 3,000 for rank 1). Bands between are tunable.
const PAYOUT = [[1, 3000], [3, 2000], [10, 1200], [25, 800], [50, 500], [Infinity, 300]];
// 1.15.0 (owner-approved planning/DRAFT_grades_exams.md): the engine marks every subject at each exam. Midterm slots from lore 232
// ([day, from, to] in minutes; Creature Studies sits no midterm and is marked on fieldwork); finals are one run on a seeded day.
// 1.33.0 (owner-approved planning/DRAFT_classes_and_teachers.md): Combat is Practical Magic, one class per combat role (still one mark)
const SUBJECTS = ['Magic Theory', 'History', 'Etiquette', 'Potion Crafting', 'Dark Magic Defense', 'Practical Magic', 'Creature Studies'];
const PROF = ['Knowledge', 'Arcana', 'Craft', 'Prowess', 'Society', 'Nature'];
const PROF_CUT = [0, 10, 30, 60, 100, 150];
const PROF_NAMES = { Knowledge: ['Everyday knowledge','Knows the basics','Well read','Learned','Erudite','Encyclopaedic'], Arcana: ['Everyday casting','Follows the proofs','Spell-literate','Pattern reader','Ward-wise','Arcane scholar'], Craft: ['Everyday hands','Follows the recipe','Steady hand','Skilled hands','Artisan',"Master's hand"], Prowess: ['Everyday fitness','Holds a stance','Quick on the feet','Seasoned','Duellist','Formidable'], Society: ['Everyday manners','Minds the forms','Poised','Gracious','Well connected','Consummate'], Nature: ['Everyday outdoors','Knows the signs','Calm hand','Trail-wise','Wild-wise','Kin to the wild'] };
const SUBJECT_STAT = { History: 'Knowledge', 'Magic Theory': 'Arcana', 'Dark Magic Defense': 'Arcana', 'Potion Crafting': 'Craft', 'Practical Magic': 'Prowess', Etiquette: 'Society', 'Creature Studies': 'Nature' };
const PROF_FIELD = { Knowledge: 'history, sciences, numbers, geography, nations, languages, records and puzzles', Arcana: 'magic, curses, wards, traps and precise spellwork', Craft: 'making, brewing, mending, cooking and handiwork', Prowess: 'duels, sport, climbing, running and strength', Society: 'formal dealings, manners, bargaining, performance and reading a room', Nature: 'beasts, plants, weather, tracks and the outdoors' };
const CLUB_STATS = {"Prowess":["Magic Duelling","Soccer","Running","Archery","Swimming","Gymnastics","Basketball"],"Nature":["Beast Handling","Gardening","Fishing","Groundskeeping","Camping"],"Craft":["Alchemy","Brewing","Smithing","Tailoring","Cooking","Drawing","Calligraphy"],"Society":["Music","Tea","Theatre","Card","Board Game","Festival Committee","Student Council","Medical Centre Volunteers"],"Arcana":["Warding Study","Divination","Specialized Magic"],"Knowledge":["Library Assistants","Newspaper"]};
const CLUB_MEMBERS = {"Academy Newspaper":["Castor","Linus"],"Alchemy Circle":["Royhan"],"Archery Club":["Lenna"],"Basketball Club":["Aurelian"],"Beast Handling Club":[],"Board Game Club":["Gareth","William"],"Brewing Club":[],"Calligraphy Club":[],"Camping Club":["Faye"],"Card Club":["Aiden"],"Cooking Club":["Nerys"],"Divination Society":["Kanae"],"Drawing Club":["Alyssa"],"Festival Committee":["Caspian","Rigel"],"Fishing Club":["Ottavio","Wren"],"Gardening Club":["Idris","Maple"],"Groundskeeping":["Dante"],"Gymnastics Club":[],"Library Assistants":["Irene","Tilly"],"Magic Duelling Club":["Sophia","Tsubaki","Bruno"],"Medical Centre Volunteers":[],"Music Club":["Caralynn","Ruby"],"Running Club":["Saffi"],"Smithing Club":["Vera"],"Soccer Club":["Percival"],"Specialized Magic Club":["Hadrian"],"Student Council":[],"Swimming Club":["Bianca"],"Tailoring Club":["Zara"],"Tea Club":["Florian"],"Theatre Troupe":["Trixie","Ezrel"],"Warding Study Group":[]};
const CLUB_FOUNDING = {"staff":{"Valentin":"Academy Newspaper","Mimosa":"Alchemy Circle","Vallie":"Beast Handling Club","Magnus":"Board Game Club","Kotaro":"Brewing Club","Dorian":"Calligraphy Club","Kuroo":"Card Club","Ottavio":"Fishing Club","Cedric":"Gardening Club","Layla":"Library Assistants","Gavlan":"Magic Duelling Club","Hester":"Medical Centre Volunteers","Yvette":"Smithing Club","Anya":"Tea Club","Ezrel":"Theatre Troupe","Anselm":"Warding Study Group"},"sign":[],"follow":["Etnie","Topaz"]};   // 1.75.0: { staff: teacher -> their club, sign: roster teachers free to sign, follow }
const PRACTICE = [{"loc":"potion_halls","action":"Brew a potion","stat":"Craft","xp":2,"afterClass":true,"until":1200,"dorm":true,"name":"Potion Halls"},{"loc":"potion_halls","action":"Reagent drill","stat":"Craft","xp":1,"name":"Potion Halls"},{"loc":"main_library","action":"Study a subject","stat":"subject","xp":2,"study":true,"name":"Main Library"},{"loc":"study_rooms","action":"Group study","stat":"subject","xp":2,"partner":true,"study":true,"name":"Study Rooms"},{"loc":"archive","action":"Dig through the records","stat":"Knowledge","xp":2,"name":"Archive"},{"loc":"seminar_rooms","action":"Practise wards and counter-curses","stat":"Arcana","xp":2,"afterClass":true,"name":"Seminar Rooms"},{"loc":"observation_tower","action":"Chart the stars","stat":"Arcana","xp":2,"night":true,"clear":true,"name":"Observation Tower"},{"loc":"meditation_rooms","action":"Will-focus meditation","stat":"Arcana","xp":1,"train":"mana","name":"Meditation Rooms"},{"loc":"spirit_path","action":"Watch the spirits","stat":"Nature","xp":1,"name":"Spirit Path"},{"loc":"spirit_path","action":"Walk with your spirit","stat":"Arcana","xp":1,"pact":true,"name":"Spirit Path"},{"loc":"willow_island","action":"Sit under the willow","stat":"Arcana","xp":1,"daylight":true,"name":"Willow Island"},{"loc":"club_rooms","action":"Specialized Magic practice","stat":"Arcana","xp":2,"club":"Specialized Magic","name":"Club Rooms"},{"loc":"combat_grounds","action":"Drill","stat":"Prowess","xp":1,"dorm":true,"train":"stamina","name":"Combat Grounds"},{"loc":"combat_grounds","action":"Spar with a partner","stat":"Prowess","xp":2,"dorm":true,"partner":true,"name":"Combat Grounds"},{"loc":"sparring_pavilion","action":"Take a challenge from the board","stat":"Prowess","xp":3,"club":"Magic Duelling","name":"The Sparring Pavilion"},{"loc":"gymnasium","action":"Train","stat":"Prowess","xp":1,"train":"stamina","name":"Gymnasium"},{"loc":"sports_field","action":"Train","stat":"Prowess","xp":1,"train":"stamina","name":"Sports Field"},{"loc":"archery_range","action":"Train","stat":"Prowess","xp":1,"train":"stamina","name":"Archery Range"},{"loc":"swimming_pool","action":"Train","stat":"Prowess","xp":1,"train":"stamina","name":"Swimming Pool"},{"loc":"gardens","action":"Tend the reagent beds","stat":"Nature","xp":1,"daylight":true,"club":"Gardening","name":"Gardens"},{"loc":"menagerie","action":"Help with the animals","stat":"Nature","xp":2,"daylight":true,"partner":true,"name":"Menagerie"},{"loc":"menagerie","action":"Muck out the pens (paid)","stat":"Nature","xp":1,"paid":40,"paidAs":"animal care shift","name":"Menagerie"},{"loc":"bell_tower","action":"Bell-keeper's shift (paid)","stat":"Craft","xp":1,"paid":30,"paidAs":"bell-keeper's shift","until":1080,"name":"Bell Tower"},{"loc":"boathouse_and_lake","action":"Row on the lake","stat":"Prowess","xp":1,"train":"stamina","daylight":true,"calm":true,"name":"Boathouse and Lake"},{"loc":"grassy_field_and_hills","action":"Run the hills","stat":"Prowess","xp":1,"train":"stamina","calm":true,"name":"Grassy Field and Hills"},{"loc":"grassy_field_and_hills","action":"Read the sky","stat":"Nature","xp":1,"name":"Grassy Field and Hills"},{"loc":"forest","action":"Fieldwork: tracks and signs","stat":"Nature","xp":2,"daylight":true,"name":"Forest"},{"loc":"forest","action":"Forage","stat":"Nature","xp":1,"name":"Forest"},{"loc":"forest_clearing","action":"Gather clearing blooms","stat":"Nature","xp":1,"name":"Forest Clearing"},{"loc":"fishing_house","action":"Fish the pond or the lake","stat":"Nature","xp":1,"club":"Fishing","name":"Fishing House"},{"loc":"mall","action":"Dance and deportment","stat":"Society","xp":2,"cost":15,"name":"The Mall"},{"loc":"mall","action":"Music practice","stat":"Society","xp":2,"cost":15,"name":"The Mall"},{"loc":"mall","action":"Art studio","stat":"Craft","xp":2,"cost":15,"name":"The Mall"},{"loc":"common_rooms","action":"Practise forms of address","stat":"Society","xp":1,"partner":true,"name":"Common Rooms"},{"loc":"club_rooms","action":"Music, Tea, Theatre practice","stat":"Society","xp":2,"clubAny":["Music","Tea","Theatre"],"name":"Club Rooms"},{"loc":"club_rooms","action":"Drawing, Calligraphy, Tailoring practice","stat":"Craft","xp":2,"clubAny":["Drawing","Calligraphy","Tailoring"],"name":"Club Rooms"},{"loc":"workshop","action":"Runes and talismans","stat":"Craft","xp":2,"name":"Workshop"},{"loc":"workshop","action":"Enchant or repair","stat":"Craft","xp":2,"name":"Workshop"},{"loc":"workshop","action":"Brewing Club bench","stat":"Craft","xp":2,"club":"Brewing","name":"Workshop"},{"loc":"workshop","action":"Smithing","stat":"Craft","xp":2,"club":"Smithing","name":"Workshop"},{"loc":"workshop","action":"Tailoring","stat":"Craft","xp":2,"club":"Tailoring","name":"Workshop"},{"loc":"canteen","action":"Cook or bake","stat":"Craft","xp":2,"club":"Cooking","name":"Canteen"},{"loc":"common_rooms","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Common Rooms"},{"loc":"courtyards","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Courtyards"},{"loc":"gardens","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Gardens"},{"loc":"fire_dormitory","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Fire Dormitory"},{"loc":"light_dormitory","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Light Dormitory"},{"loc":"sky_dormitory","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Sky Dormitory"},{"loc":"viridian_dormitory","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Viridian Dormitory"}];
// 1.31.0 (owner-approved planning/DRAFT_restore_places.md): restful places {place key: {restores, usual, rules, clears}} (data/restore_places.json)
const RESTFUL = {"founder's statue and park":{"restores":"stamina","usual":1.5,"summary":"Stamina x1.5 while resting in fair daylight; x1.75 on a warm sunny afternoon; nothing extra in rain, snow, fog, cold or after dark","rules":[{"if":{"dark":true},"mult":1,"why":"after dark"},{"if":{"sky":["Overcast","Fog","Rain","Storm"]},"mult":1,"why":"the weather"},{"if":{"snow":true},"mult":1,"why":"snow"},{"if":{"tempMax":4},"mult":1,"why":"too cold to lie on the grass"},{"if":{"sky":["Clear"],"tempMin":15,"tempMax":27,"from":660,"to":960},"mult":1.75,"why":"a warm sunny afternoon"}]},"medical centre":{"restores":"stamina","usual":1.75,"summary":"Stamina x1.75 while resting in the ward; x1.25 in exam weeks, competition weeks and the week after the Thinning","rules":[{"if":{"weeks":[[3,1],[5,1],[9,1],[11,1],[3,4],[6,4],[9,4],[7,4]]},"mult":1.25,"why":"a busy week: the beds go to the injured first"}]},"bathhouse and washrooms":{"restores":"stamina","usual":2,"clears":{"Chilled":30},"summary":"Stamina x2 while resting in your own dorm's bathhouse; x2.5 on a cold day or when you come in chilled or soaked; 30 minutes ends Chilled","rules":[{"if":{"arrivedCold":true},"mult":2.5,"why":"warming up after the cold"},{"if":{"tempMax":5},"mult":2.5,"why":"a cold day outside"}]},"cathedral":{"restores":"mana","usual":1.25,"summary":"Mana x1.25 while sitting quietly on the pews; x1.75 during the Sunday service (09:00-11:00)","rules":[{"if":{"days":["Sun"],"from":540,"to":660},"mult":1.75,"why":"the Sunday service"}]},"meditation rooms":{"restores":"mana","usual":2,"summary":"Mana x2 while resting; x2.5 in the quiet morning (07:00-09:00); x1.75 in exam weeks, when every room is full","rules":[{"if":{"weeks":[[3,1],[5,1],[9,1],[11,1]]},"mult":1.75,"why":"exam week: every room is full"},{"if":{"from":420,"to":540},"mult":2.5,"why":"the quiet morning"}]},"forest clearing":{"restores":"mana","usual":3,"summary":"Mana x3 while resting among the Elder Oak's roots; x3.5 in full sun; x2 after dark","rules":[{"if":{"dark":true},"mult":2,"why":"after dark"},{"if":{"sky":["Clear"]},"mult":3.5,"why":"full sun on the oak"}]}};
// 1.31.0 (owner-approved planning/DRAFT_location_activities.md): a letter home once a month, the reply and its parcel (data/letters_home.json)
const HOME = {"days":7,"roll":{"none":50,"item":30,"coin":20},"coin":[10,30],"to":"home|family|mother|father|mum|mom|dad|mama|papa|parents?|grand(?:ma|pa|mother|father|parents)|sister|brother|aunt|uncle|guardian|cousin","items":[["Firetooth (tin)","food"],["Honey bun","food"],["Smoked river fish","food"],["Elderflower cold syrup","drink"],["Vigour tonic","drink"],["Ember pouch","gear"],["Rain-ward charm","gear"],["Hearthstone hand-warmer","gear"],["Letter paper set","other"]]};
// 1.33.0 (owner-approved planning/DRAFT_classes_and_teachers.md): free periods (data/free_periods.json). Now and then a teacher
// cannot come; the class is not held and counts against no one. Seeded per class period and day; never on a calendar event day
// or in Month 1 Week 1. Returns the reason, or '' when the class runs.
const FREE = {"chance":5,"generic":["is ill today","was called to a staff meeting","was called away on academy business"],"npcs":{"Gavlan":{"why":["had a bad night and sent word he would not come","was called to the Headmaster"]},"Yvette":{"why":["is ill today","is dealing with trouble in the Fire Dormitory"]},"Layla":{"why":["lost track of time in the Archive","is ill today"]},"Vallie":{"why":["is chasing a creature that got out of the Menagerie","is at the Menagerie with a sick beast"]},"Kuroo":{"why":["is at a meeting in the Noble Houses' Liaison","sent a note: 'something came up'"]},"Mimosa":{"why":["could not face the classroom today","is ill today"]},"Ezrel":{"why":["did not come, and gave no reason"]},"Ottavio":{"why":["is away on Sky Dormitory business"]},"Milena":{"why":["was called to the Dovecote","is away on Dove business"]},"Baelin":{"why":["was summoned to a meeting in the capital","is held up by academy business"]},"Althair":{"why":["is away on business he did not explain","is 'unavoidably detained'"]},"Hester":{"why":["has an emergency on the ward","is on the ward after a long night shift"]},"Anselm":{"why":["sent a note nobody could make sense of; the class is off","is at the Meditation Rooms and lost track of the hour"]},"Magnus":{"why":["is in a competition scouting meeting","is at the Mail Tower waiting for a letter"]},"Dorian":{"why":["is meeting a large buyer from off campus","is restocking in the Workshop"]},"Cedric":{"why":["is ill today, and sent the reading anyway"]},"Anya":{"why":["is sitting with a patient at the Medical Centre","is at a funeral"]},"Kotaro":{"chance":20,"why":["is asleep in the Potion Halls storeroom","is still recovering from last night","forgot"]},"Valentin":{"why":["is presenting a formula at court","is at a meeting of the alchemists' guild"]}}};
const freeWhy = (Wd, p, subj, tch) => {
  if (!tch || (Wd.Month === 1 && Wd.Week === 1) || eventsOn(Wd).length) return '';
  const f = (FREE.npcs || {})[tch] || {}, ch = num(f.chance, num(FREE.chance, 0));
  if (roll100('free', Wd.Year, Wd.Month, Wd.Week, Wd.Day, p, subj) >= ch) return '';
  const why = f.why && f.why.length ? f.why : (FREE.generic && FREE.generic.length ? FREE.generic : ['cannot come today']);
  return pickOf(why, 'free-why', Wd.Year, Wd.Month, Wd.Week, Wd.Day, p);
};
const CRAFTS = {"_note":"Craft recipes for Practice. groups: the Practice actions a craft can be done under (club = extra club needed for that action), the best owned tool's bonus, the experts whose presence adds +10 and opens advanced work, and the mishap injury. Material options are alternatives; each listed item is consumed once per attempt. yield = pieces for fine / success / weak (default 1). Sale values are guide prices for finished work, not shop stock. masterwork: a finished Project of one of these Kinds, judged at the masterwork DC (Craft Rank 4); the Kind picks the group for tools, experts and the Bag kind.","tiers":{"simple":25,"standard":45,"advanced":65,"masterwork":85},"groups":{"Brewing":{"actions":[{"action":"Brew a potion"},{"action":"Brewing Club bench"}],"tools":[["Ardenne measuring set",10],["Glass stirring-rod set",5]],"experts":["Mimosa","Royhan","Valentin"],"mishap":["burn","hand","tender fingers"],"bag":"drink"},"Runes":{"actions":[{"action":"Runes and talismans"},{"action":"Specialized Magic practice"}],"tools":[["Steel-nib fountain pen",5]],"experts":["Dorian"],"mishap":["burn","hand","tender fingers"]},"Repair":{"actions":[{"action":"Enchant or repair"}],"mishap":["burn","hand","tender fingers"]},"Enchant":{"actions":[{"action":"Enchant or repair"}],"experts":["Dorian"],"mishap":["burn","hand","tender fingers"]},"Cooking":{"actions":[{"action":"Cook or bake"}],"mishap":["burn","hand","tender fingers"],"bag":"food"},"Needlework":{"actions":[{"action":"Knit or sew, sketch or paint, carve, calligraphy"},{"action":"Tailoring"},{"action":"Drawing, Calligraphy, Tailoring practice","club":"Tailoring"}],"mishap":["needle prick","finger","a sore fingertip"]},"Drawing":{"actions":[{"action":"Knit or sew, sketch or paint, carve, calligraphy"},{"action":"Art studio"},{"action":"Drawing, Calligraphy, Tailoring practice","club":"Drawing"}],"mishap":["strained wrist","wrist","an aching wrist"]},"Woodcarving":{"actions":[{"action":"Knit or sew, sketch or paint, carve, calligraphy"}],"mishap":["cut","hand","a bandaged finger"]},"Calligraphy":{"actions":[{"action":"Knit or sew, sketch or paint, carve, calligraphy"},{"action":"Drawing, Calligraphy, Tailoring practice","club":"Calligraphy"}],"tools":[["Steel-nib fountain pen",5]],"mishap":["paper cut","finger","a stinging fingertip"]},"Smithing":{"actions":[{"action":"Smithing"}],"tools":[["Precision tool roll",5]],"mishap":["burn","hand","tender fingers"]}},"masterwork":{"rank":4,"xp":3,"kinds":{"craft":"","potion":"Brewing","smithing":"Smithing","tailoring":"Needlework","enchantment":"Runes","cooking":"Cooking","painting":"Drawing","carving":"Woodcarving","calligraphy":"Calligraphy"}},"recipes":[{"name":"Warming draught","group":"Brewing","tier":"simple","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"clears":["Chilled"],"buff":"warm","mins":240},"sale":8,"yield":[3,2,1]},{"name":"Cooling draught","group":"Brewing","tier":"simple","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"clears":["Overheated"],"buff":"sun","mins":240},"sale":8,"yield":[3,2,1]},{"name":"Cold remedy","group":"Brewing","tier":"simple","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"cure":"Head cold"},"sale":10,"yield":[3,2,1]},{"name":"Healing draught","group":"Brewing","tier":"standard","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"heal":"minor"},"sale":15,"yield":[3,2,1]},{"name":"Vigour tonic","group":"Brewing","tier":"standard","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"stamina":20},"sale":12,"yield":[3,2,1]},{"name":"Strong healing draught","group":"Brewing","tier":"advanced","materials":[[{"item":"Common reagent bundle","qty":2}],[{"item":"Common reagent bundle","qty":1},{"item":"Clearing bloom","qty":1}],[{"item":"Rare reagent","qty":1}]],"kind":"drink","use":{"heal":"moderate_to_minor"},"sale":40,"yield":[2,1,1]},{"name":"Fire flask","group":"Brewing","tier":"advanced","materials":[[{"item":"Common reagent bundle","qty":2}],[{"item":"Common reagent bundle","qty":1},{"item":"Clearing bloom","qty":1}],[{"item":"Rare reagent","qty":1}]],"kind":"other","use":{"fitting":"fire"},"sale":40,"yield":[2,1,1]},{"name":"Bottled cold","group":"Brewing","tier":"advanced","materials":[[{"item":"Common reagent bundle","qty":2}],[{"item":"Common reagent bundle","qty":1},{"item":"Clearing bloom","qty":1}],[{"item":"Rare reagent","qty":1}]],"kind":"other","use":{"fitting":"cold"},"sale":40,"yield":[2,1,1]},{"name":"Warmth rune","group":"Runes","tier":"simple","materials":[[{"item":"Talisman paper stack","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other","use":{"buff":"warm","mins":240},"sale":10},{"name":"Rain-ward talisman","group":"Runes","tier":"standard","materials":[[{"item":"Talisman paper stack","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other","use":{"buff":"waterproof","mins":180},"sale":20},{"name":"Light rune","group":"Runes","tier":"standard","materials":[[{"item":"Talisman paper stack","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other","use":{"fitting":"dark"},"sale":20},{"name":"Ward talisman","group":"Runes","tier":"advanced","arcana":3,"materials":[[{"item":"Talisman paper stack","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other","use":{"fitting":"curse or hex"},"sale":40},{"name":"Repair damaged item","group":"Repair","tier":"standard","materials":[[]],"target":"repair","sale":0},{"name":"Enchant warm","group":"Enchant","tier":"advanced","arcana":3,"materials":[[{"item":"Common reagent bundle","qty":1}]],"target":"enchant","gear":"warm","sale":0},{"name":"Enchant waterproof","group":"Enchant","tier":"advanced","arcana":3,"materials":[[{"item":"Common reagent bundle","qty":1}]],"target":"enchant","gear":"waterproof","sale":0},{"name":"Honey buns","group":"Cooking","tier":"simple","materials":[[{"item":"Baking and cooking ingredients","qty":1}]],"kind":"food","use":{"stamina":10},"yield":[3,2,1],"sale":4},{"name":"Butter cookies","group":"Cooking","tier":"simple","materials":[[{"item":"Baking and cooking ingredients","qty":1}]],"kind":"food","use":{"stamina":10},"yield":[3,2,1],"sale":4},{"name":"Hearty stew pot","group":"Cooking","tier":"standard","materials":[[{"item":"Baking and cooking ingredients","qty":1},{"item":"Carrots and fresh greens","qty":1}],[{"item":"Baking and cooking ingredients","qty":1},{"item":"Salaffian spice box","qty":1}]],"kind":"food","use":{"stamina":15},"yield":[4,3,2],"sale":8},{"name":"Festival cake","group":"Cooking","tier":"advanced","materials":[[{"item":"Baking and cooking ingredients","qty":2}],[{"item":"Baking and cooking ingredients","qty":1},{"item":"Bag of red apples","qty":1}],[{"item":"Baking and cooking ingredients","qty":1},{"item":"Salaffian spice box","qty":1}]],"kind":"food","sale":30},{"name":"Mend clothes","group":"Needlework","tier":"simple","materials":[[]],"kind":"other","target":"mend"},{"name":"Knitted scarf","group":"Needlework","tier":"standard","materials":[[{"item":"Knitting wool and needles","qty":1}]],"kind":"gear","gear":"warm","sale":20},{"name":"Embroidered handkerchief","group":"Needlework","tier":"standard","materials":[[{"item":"Embroidery thread set","qty":1}]],"kind":"gift","sale":15},{"name":"Knitted winter set","group":"Needlework","tier":"advanced","materials":[[{"item":"Knitting wool and needles","qty":2}]],"kind":"gear","gear":"warm","sale":45},{"name":"Sky silk garment","group":"Needlework","tier":"advanced","materials":[[{"item":"Bolt of Sky silk","qty":1},{"item":"Embroidery thread set","qty":1}]],"kind":"gift","sale":80},{"name":"Sketch","group":"Drawing","tier":"simple","materials":[[{"item":"Sketchbook and charcoal","qty":1}]],"kind":"gift","sale":5},{"name":"Portrait","group":"Drawing","tier":"standard","materials":[[{"item":"Sketchbook and charcoal","qty":1}],[{"item":"Paint box","qty":1}]],"kind":"gift","sale":20},{"name":"Painting","group":"Drawing","tier":"advanced","materials":[[{"item":"Paint box","qty":1}]],"kind":"gift","sale":"30-80"},{"name":"Carved figure","group":"Woodcarving","tier":"standard","materials":[[{"item":"Carving knife and limewood block","qty":1}]],"kind":"gift","sale":15},{"name":"Carved box","group":"Woodcarving","tier":"advanced","materials":[[{"item":"Carving knife and limewood block","qty":1}]],"kind":"gift","sale":35},{"name":"Formal letter","group":"Calligraphy","tier":"standard","materials":[[{"item":"Letter paper set","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other"},{"name":"Illuminated invitation","group":"Calligraphy","tier":"advanced","materials":[[{"item":"Letter paper set","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"gift","sale":25},{"name":"Hooks and nails","group":"Smithing","tier":"simple","materials":[[{"item":"Bar stock and coal","qty":1}]],"kind":"other","sale":5},{"name":"Balanced blade","group":"Smithing","tier":"standard","materials":[[{"item":"Bar stock and coal","qty":1}]],"kind":"other","sale":25},{"name":"Forged fittings","group":"Smithing","tier":"advanced","materials":[[{"item":"Bar stock and coal","qty":2}]],"kind":"other","sale":40},{"name":"Small forged tool","group":"Smithing","tier":"advanced","materials":[[{"item":"Bar stock and coal","qty":2}]],"kind":"other","sale":40}]};
// 1.29.0: clothing a craft can mend or enchant; the materials that open the portable craft practice (from data/crafts.json)
const CRAFT_CLOTHES = /cloaks?|coats?|robes?|vests?|scarves?|shirts?|dresses?|uniforms?|jackets?|garments?/i;
const CRAFT_PORTABLE = new Set((CRAFTS.recipes || []).filter(r => (((CRAFTS.groups || {})[r.group] || {}).actions || []).some(g => PRACTICE.some(a => a.materials && a.action === g.action)))
  .flatMap(r => (r.materials || []).flat().map(m => m.item.toLowerCase())));
const MARKS = ['F', 'D', 'C', 'B', 'A'];
const [P1, P2, P3] = PERIODS;   // shared.js
const MID_SLOTS = { 'Magic Theory': [0, P1[0], P1[1]], Etiquette: [0, P2[0], P2[1]], History: [1, P1[0], P1[1]], 'Potion Crafting': [1, P3[0], P3[1]],
  'Dark Magic Defense': [2, P1[0], P3[1]], 'Practical Magic': [3, P1[0], P3[1]] };
const PRACTICAL = ['Potion Crafting', 'Dark Magic Defense', 'Practical Magic', 'Creature Studies'];
// an A: +10 on a Fortune roll in the subject's field (rule 504 "specialty"), until the next exams
const TOP_FIELD = Object.fromEntries(SUBJECTS.map(s => [s, PROF_FIELD[SUBJECT_STAT[s]]]));
const TUTOR_PAY = 40, TUTOR_WEEK = 2, ASSIGNMENT_MIN = 45;
// 1.49.0 (feature batch 1, audit 4.10): a group assignment left overdue costs each partner this much Tension, once
const GROUP_LATE_TENSION = 3;
// 1.30.0 (owner-approved planning/DRAFT_proficiency_practice.md, Batch 6): a mark's score = preparation, the subject's proficiency
// and attendance, weighted for theory or practical, plus a seeded exam-day roll; Rank 5 in a proficiency opens its mastery perk
const GRADE_W = { theory: [0.5, 0.3, 0.2], practical: [0.3, 0.5, 0.2] }, GRADE_CUT = [40, 55, 70, 85];
const EXAM_DAY = [[10, -8, 'a bad day'], [30, -4, 'an off day'], [70, 0, ''], [90, 4, 'a good day'], [100, 8, 'an inspired day']];
const MASTERY_FX = {"arcana_cost": 0.9, "society_trust": 5, "nature_forage": 2};   // 1.43.0: data/mastery.json
const MASTERY = 5, profRankOf = (X, k) => PROF_CUT.filter(x => num((((X || {}).$eng || {}).prof || {}).xp && X.$eng.prof.xp[k], 0) >= x).length - 1;
// staff and nobles (Consummate: NPC_GROUP staff, or other = the Doves, the Cathedral, the Liaison, facilities); nobles by the lorebook (House Silvarenne, House Villeneuve, the Liaison's regulars)
const CONSUMMATE_GROUPS = ['staff', 'other'], NOBLES = ['Caspian', 'Caralynn', 'Florian', 'Elion', 'Nerys'];
const subjectOf = t => { const x = String(t || '').trim().toLowerCase().replace(/ class$/, ''); return x === 'dmd' ? 'Dark Magic Defense' : x === 'combat' ? 'Practical Magic' : SUBJECTS.find(s => s.toLowerCase() === x) || ''; };
const subjectIn = t => SUBJECTS.find(s => new RegExp(`\\b${s}\\b`, 'i').test(String(t || ''))) || (/\bDMD\b/.test(String(t || '')) ? 'Dark Magic Defense' : /\bCombat\b/i.test(String(t || '')) ? 'Practical Magic' : '');
// 1.33.0: Practical Magic is taught per combat role ([subject, 0, role]); {{user}} attends the class of the first role in Combat_role
// (a student with two roles lists the one they chose first). Before roles are set it is the joint assessment, led by Attack's teacher.
const classRole = P => classRoleOf(P) || 'Attack';   // shared.js
const teaches = (id, subj, py, role) => ((CLASS.teach || {})[id] || []).some(x => x[0] === subj && (x[1] === py || x[1] === 0) && (!x[2] || x[2] === (role || 'Attack')));
const teacherOf = (subj, py, role) => Object.keys(CLASS.teach || {}).find(id => teaches(id, subj, py, role)) || '';
// 1.2.2 bond system (owner design): XP per kind of interaction with daily/weekly limits, rising XP per rank scaled by the pace
// setting, a cooldown after each rank, then an in-scene interaction to deepen the bond.
const BR = {"_note":"1.2.2 bond system, single source for the engine (tools/gen_engine.py), the UI (tools/gen_ui.py) and the Now entry (tools/gen_mvu_entries.py). Edit here, then rebuild. xp_base[r] = XP from Rank r to Rank r+1 at standard pace; cool_base[r] = days after reaching Rank r before its next bond event can start. pace multiplies both (full rank: fast ~1 month, brisk ~2 months, standard ~1 semester, slow ~1 year of diligent play).","xp_base":[10,20,30,40,50,55,60,65,70,80],"cool_base":[0,1,2,3,3,4,5,6,7,7],"close_at":0.8,"_note_close_at":"1.5.0 (N3a): a bond is marked close in <now> once its XP reaches this share of the next rank's need (before the bar is full).","pace":{"fast":0.25,"brisk":0.5,"standard":1,"slow":2.5},"pace_labels":{"fast":"Fast (~1 month)","brisk":"Brisk (~2 months)","standard":"Standard (~1 semester)","slow":"Slow (~1 year)"},"kind_xp":{"talk":2,"hangout":3,"help":5},"per_day":{"talk":1,"hangout":1},"per_week":{"gift":2,"help":1},"gift_xp":{"loved":4,"liked":2,"neutral":1,"disliked":0,"hated":0},"gift_disliked_tension":5,"gift_bonus_rank":3,"gift_bonus_mult":1.5,"weather_xp":1,"start":{"_note":"1.3.1 (owner playtest): a bond that does not start at Rank 0. Applied once, when the engine first records the bond (the first scene they share); the next event waits for that rank's cooldown.","Etnie":{"Rank":3,"Trust":70,"Title":"Self-declared big sister","Known_facts":["Third-year, Viridian (dog beastkin); insists she is {{user}}'s big sister"],"Milestones":["Etnie decided {{user}} is her little sibling"]},"Topaz":{"Rank":2,"Trust":60,"Title":"Self-declared rival","Known_facts":["First-year, Light (elf); has declared {{user}} her rival"],"Milestones":["Topaz declared {{user}} her rival at the Entrance Event"]}},"romance_default":8,"romance_options":[[0,"Any rank"],[4,"Rank 4"],[6,"Rank 6"],[8,"Rank 8"],[10,"Rank 10"],[11,"Off"]],"openness":{"open":2,"normal":0,"guarded":-1,"closed":-2},"share":[[0,"how they look and their public role"],[1,"their name, age, club and where they spend time"],[2,"the magic and skills they use openly"],[3,"likes, dislikes, hobbies and birthday"],[4,"their personality and what shows when they are upset"],[5,"their goals"],[6,"what they think of other people and of the Doves"],[7,"their past and family"]],"share_real_from":5,"perks":{"1":"greets {{user}} and can be found at their usual places","2":"may accept a genuine invitation; first accepted invited hangout each week grants one extra bond XP","3":"sometimes seeks {{user}} out; remembers the birthday","4":"may actively help with their listed mana, stamina or study activities; ordinary shared work gets a modest bonus","5":"shares their goal and may ask for help with it","6":"may introduce {{user}} to a new roster NPC, whose bond starts at Rank 1","7":"may escort {{user}} into their dorm, or receive an unscheduled worksite visit if staff","8":"closest bond: best friend, romance or sworn rival, as far as this character and lived story allow","9":"may publicly vouch for {{user}} once per month, softening one related reputation loss by up to 5 XP","10":"would sacrifice for {{user}}"},"you_line":[{"kind":"dislike","tension_from":70,"arrow":true},{"kind":"rivals","title":"rival"},{"kind":"wary","tension_from":40,"arrow":true},{"kind":"wary","trust_below":35,"arrow":true},{"kind":"friends","title":"best friend"},{"kind":"friends","rank_from":5,"trust_from":65}],"_note_you_line":"1.4.2 (owner): People -> Connections, your own line to someone takes a kind from the bond. Romance first (Bonds.<id>.Romance), then the first rule here whose conditions all hold (tension_from, trust_below, trust_from, rank_from, title = a word in Bonds.<id>.Title); none = a plain gold bond line. arrow: the line is their view of you (them -> you); otherwise it is shared. The line is thicker with rank. 1.4.3: the Trust thresholds follow data/trust.json (Doubtful under 35, Trusting from 65).","recent":{"keep":10,"now":3,"phrases":{"talk":"talked","hangout":"spent time together","gift":"gave them a gift","help":"helped them","fight":"fought or sparred","apology":"apologised","keep":"kept a promise","secret":"kept their secret","defend":"stood up for them","confide":"confided a secret","understood":"they understood","choose":"chose them over someone else","letdown":"let them down","offence":"offended them"}},"_note_recent":"1.4.4 (owner): each bond keeps its latest `keep` moments with {{user}} (Bonds.<id>.$Recent: when, one sentence, effect), shown in the dossier newest first; <now> gives the narrator the newest `now` of them for each present character (1.56.0, owner-approved narrator-load audit U2: 3, was 5; in their Cast Sheet, the effect in words). The sentence is the Note the narrator adds to an interaction; without one, the kinds (phrases).","gift_hated_tension":10,"birthday":{"gift_mult":2,"social_mult":1.5,"remember_trust":2,"recovery_mult":2,"party_xp":3,"host_rank":7,"guest_rank":5,"tension_below":40},"gift_log_cap":24};
const START = BR.start || {};   // 1.3.1: bonds that begin above Rank 0 (data/bond_rules.json start)
const HAUNT = {"Irene":"Main Library","Caspian":"Council Chamber, Cathedral, The Snug (neutral ground for diplomacy)","Etnie":"Library upper stacks","Royhan":"Potion Halls, Gardens, Library","Lenna":"the Archery Range, the far Gardens, the Menagerie, the Forest","Saffi":"Sports Field, Gymnasium","Kanae":"Observation Tower, still water","Idris":"Gardens (takes occasional work there), the Forest Clearing (the only warm spot i","Aiden":"Workshop stair and Bell Tower (curfew routes), the Rooftop (he phases through th","Caralynn":"Club Rooms (Music Club rehearsals), the Announcement Room (fighting for the afte","Zara":"Library highest shelves (takes shelving work), Workshop","Gavlan":"Combat Grounds, Faculty Offices, his office library","Yvette":"Workshop, warm end of the Lecture Halls","Krieg":"Dovecote, Detention Tower, Forest edge","Milena":"Lecture Halls, Combat Grounds, Dovecote","Baelin":"Headmaster's Office, Faculty Offices, Council Chamber","Layla":"Main Library, Archive","Vallie":"the Menagerie and her converted stables beside it, the Forest and the fields (wh","Percival":"Sports Field, Gymnasium, Canteen","Sophia":"Combat Grounds, Lake, Sports Field","Rei":"Warden's Office, Seal Chamber, Forest edge, Rooftop","Kuroo":"Staff Room, Card Club, the Viridian Dormitory common room","Mimosa":"Potion Halls, Workshop","Gareth":"Combat Grounds, Observation Tower, Library","Trixie":"the Courtyards (performances nobody asked for), Club Rooms and the old indoor am","Vera":"Potion Halls, Workshop, Medical Centre","Tristan":"Cathedral, Meditation Rooms","Althair":"everywhere","Dante":"Student Council Chamber, Forest edge, Dovecote","Castor":"Archive, Notice Board","Ruby":"Music Club, Mall, Main Library","Florian":"Student Council Chamber, the Combat Grounds whenever Gareth has booked a ring, T","Alyssa":"Library Study Rooms, the Mail Tower on letter days, the Rooftop (Zara has shown ","Tilly":"The Archive, the Broken Statue (her current favourite mystery), the Long Corrido","Ezrel":"second-year Lecture Halls, the Club Rooms, the Light Dormitory, the Workshop aft","Ottavio":"the Sky Dormitory common room, the Fishing Club dock, the third-year Lecture Hal","Caine":"the Noble Houses' Liaison, the Mail Tower on the Liaison's errands","Bobby":"Workshop, Canteen during breaks, the old amphitheatre when testing props, and wh","Linus":"Announcement Room, Sparring Pavilion, Combat Grounds (the spectator bench neares","Maple":"Gardens, the Forest edge (up a tree, whenever she can), the Sky Dormitory tower,","Nerys":"Mail Tower (the pigeons), Gardens and the Forest edge (foraging, when broke, whi","Hadrian":"the Club Rooms (Specialized Magic), the Workshop after hours (for other people's","Wren":"the Fishing House dock at dawn, the Fire Dormitory common room (the corner seat ","Tsubaki":"the Sparring Pavilion and the Combat Grounds (training, always), the Observation","Hester":"the Medical Centre and its Healing Ward, the herb garden beside it, night rounds","Anselm":"the Meditation Rooms, the Founder's Statue and Park, the Library's philosophy sh","Magnus":"the Faculty Offices, the Library's reference section, the Mail Tower (his chess ","Dorian":"the Combat Grounds in class hours, the Workshop late at night, the Courtyards be","Cedric":"the Lecture Halls, the Archive, his row in the Gardens, the Canteen at opening f","Anya":"the Lecture Halls, the Courtyards and the Canteen (wherever students are, when s","Kotaro":"the Potion Halls and their storeroom (often asleep in it), the Canteen, the Staf","Valentin":"the Potion Halls, his private laboratory beside them, the Faculty Offices, anywh","Aurelian":"the Gymnasium, the Fire Dormitory common room (on a table, mid-speech), the Cant","William":"the Rooftop (for brooding, dramatically), the Sky Dormitory, the Sparring Pavili","Bruno":"the Sparring Pavilion, the Combat Grounds, the Fire Dormitory common room (loude","Bianca":"the Student Council Chamber, the Club Rooms corridor, the Canteen (the loudest t","Rigel":"the Student Council Chamber (Festival Committee meetings), the Boathouse and Lak","Topaz":"the Sparring Pavilion, the Combat Grounds, the Light Dormitory, the Common Rooms","Faye":"the Viridian Dormitory common room (her hammock, strung between two pillars, whi"};
// 1.51.0 (audit/AUDIT_2026-10-03_4_batch_fitur.md, batch 3: audit 4.8): two NPCs seen together. Only a line the Connections panel shows
// {{user}} (both met, the teller's rank or a revealed relationship secret), both free by whereabouts and not in the scene; one a day.
const REL_PAIRS = [["Aiden","Althair","dislike",5,"Aiden"],["Aiden","Bobby","friends",5,"Aiden"],["Aiden","Dorian","friends",6,"Aiden"],["Aiden","Irene","rivals",6,"Aiden"],["Aiden","Linus","friends",6,"Aiden"],["Aiden","Magnus","rivals",6,"Aiden"],["Aiden","Nerys","rivals",6,"Aiden"],["Aiden","Sophia","friends",6,"Aiden"],["Aiden","Sophia","friends",6,"Sophia"],["Alyssa","Althair","dislike",5,"Alyssa"],["Alyssa","Milena","friends",5,"Milena"],["Alyssa","Wren","friends",6,"Alyssa"],["Alyssa","Zara","friends",5,"Alyssa"],["Anselm","Althair","dislike",6,"Anselm"],["Anselm","Layla","friends",6,"Anselm"],["Anya","Althair","dislike",6,"Anya"],["Anya","Cedric","friends",6,"Anya"],["Anya","Tristan","friends",6,"Anya"],["Aurelian","Althair","dislike",5,"Aurelian"],["Aurelian","Bruno","friends",6,"Aurelian"],["Aurelian","Percival","friends",6,"Aurelian"],["Baelin","Gavlan","friends",6,"Baelin"],["Baelin","Krieg","dislike",5,"Baelin"],["Bianca","Althair","dislike",5,"Bianca"],["Bianca","Linus","friends",6,"Bianca"],["Bobby","Aiden","friends",6,"Bobby"],["Bobby","Althair","dislike",5,"Bobby"],["Bobby","Kuroo","rivals",6,"Bobby"],["Bobby","Layla","friends",6,"Bobby"],["Bruno","Althair","dislike",5,"Bruno"],["Bruno","Topaz","friends",6,"Bruno"],["Bruno","William","friends",6,"Bruno"],["Caine","Althair","dislike",5,"Caine"],["Caine","Caspian","dislike",6,"Caine"],["Caralynn","Aiden","dislike",5,"Caralynn"],["Caralynn","Aiden","dislike",6,"Aiden"],["Caralynn","Althair","dislike",5,"Caralynn"],["Caralynn","Aurelian","rivals",6,"Caralynn"],["Caralynn","Aurelian","rivals",6,"Aurelian"],["Caralynn","Caine","dislike",6,"Caine"],["Caralynn","Kanae","dislike",6,"Caralynn"],["Caralynn","Lenna","dislike",6,"Caralynn"],["Caralynn","Lenna","dislike",6,"Lenna"],["Caralynn","Ruby","rivals",5,"Caralynn"],["Caralynn","Ruby","rivals",5,"Ruby"],["Caspian","Althair","dislike",5,"Caspian"],["Caspian","Florian","friends",5,"Caspian"],["Caspian","Irene","friends",6,"Caspian"],["Caspian","Krieg","dislike",5,"Caspian"],["Caspian","Ruby","friends",5,"Caspian"],["Castor","Althair","dislike",5,"Castor"],["Cedric","Althair","dislike",6,"Cedric"],["Cedric","Anselm","friends",6,"Cedric"],["Cedric","Layla","friends",0,"Cedric"],["Dante","Althair","dislike",5,"Dante"],["Dorian","Aiden","friends",6,"Dorian"],["Dorian","Althair","dislike",6,"Dorian"],["Dorian","Kotaro","rivals",6,"Kotaro"],["Dorian","Magnus","rivals",6,"Dorian"],["Dorian","Vera","rivals",6,"Dorian"],["Etnie","Althair","dislike",5,"Etnie"],["Faye","Althair","dislike",5,"Faye"],["Faye","Bruno","friends",6,"Faye"],["Faye","Rigel","friends",6,"Faye"],["Faye","Topaz","friends",6,"Faye"],["Faye","Tsubaki","friends",6,"Faye"],["Florian","Althair","dislike",5,"Florian"],["Florian","Gareth","rivals",5,"Florian"],["Florian","Kotaro","dislike",6,"Kotaro"],["Florian","Linus","dislike",6,"Florian"],["Florian","Maple","rivals",6,"Florian"],["Gareth","Althair","dislike",5,"Gareth"],["Gareth","Florian","rivals",5,"Gareth"],["Gareth","Sophia","rivals",5,"Gareth"],["Gavlan","Althair","dislike",5,"Gavlan"],["Gavlan","Baelin","friends",6,"Gavlan"],["Gavlan","Royhan","friends",5,"Gavlan"],["Gavlan","Vallie","rivals",6,"Gavlan"],["Hadrian","Aiden","dislike",6,"Hadrian"],["Hadrian","Aiden","dislike",6,"Aiden"],["Hadrian","Althair","dislike",5,"Hadrian"],["Hadrian","Bianca","dislike",6,"Hadrian"],["Hadrian","Bianca","dislike",6,"Bianca"],["Hadrian","Wren","dislike",5,"Hadrian"],["Hester","Althair","dislike",6,"Hester"],["Hester","Dorian","dislike",6,"Dorian"],["Hester","Kotaro","dislike",6,"Kotaro"],["Hester","Krieg","dislike",6,"Hester"],["Hester","Mimosa","friends",6,"Hester"],["Hester","Sophia","rivals",5,"Hester"],["Hester","Tilly","friends",6,"Hester"],["Hester","Vallie","friends",6,"Hester"],["Idris","Althair","dislike",5,"Idris"],["Idris","Florian","dislike",5,"Idris"],["Idris","Florian","dislike",6,"Florian"],["Idris","Krieg","dislike",7,"Idris"],["Idris","Milena","dislike",5,"Milena"],["Idris","Royhan","friends",6,"Idris"],["Idris","Ruby","friends",5,"Idris"],["Idris","Zara","friends",6,"Idris"],["Irene","Aiden","rivals",5,"Irene"],["Irene","Althair","dislike",5,"Irene"],["Irene","Caspian","friends",5,"Irene"],["Kanae","Althair","dislike",5,"Kanae"],["Kanae","Caralynn","dislike",5,"Kanae"],["Kotaro","Althair","dislike",6,"Kotaro"],["Kotaro","Gavlan","friends",6,"Kotaro"],["Kotaro","Mimosa","friends",0,"Kotaro"],["Kotaro","Valentin","friends",6,"Kotaro"],["Kotaro","Vallie","friends",6,"Kotaro"],["Krieg","Althair","dislike",5,"Krieg"],["Krieg","Anselm","dislike",6,"Anselm"],["Krieg","Baelin","dislike",5,"Krieg"],["Krieg","Hadrian","dislike",6,"Krieg"],["Krieg","Idris","dislike",7,"Krieg"],["Krieg","Kotaro","dislike",6,"Kotaro"],["Krieg","Rei","dislike",5,"Krieg"],["Krieg","Rei","dislike",6,"Rei"],["Kuroo","Althair","dislike",5,"Kuroo"],["Kuroo","Althair","dislike",6,"Althair"],["Kuroo","Anya","rivals",0,"Kuroo"],["Kuroo","Anya","rivals",0,"Anya"],["Kuroo","Bobby","rivals",5,"Kuroo"],["Kuroo","Krieg","dislike",5,"Kuroo"],["Kuroo","Ottavio","friends",6,"Kuroo"],["Kuroo","Rei","friends",5,"Kuroo"],["Kuroo","Sophia","dislike",6,"Kuroo"],["Layla","Althair","dislike",5,"Layla"],["Layla","Bobby","friends",5,"Layla"],["Layla","Cedric","friends",0,"Layla"],["Layla","Krieg","dislike",6,"Layla"],["Layla","Yvette","friends",5,"Layla"],["Lenna","Althair","dislike",5,"Lenna"],["Lenna","Saffi","friends",6,"Lenna"],["Linus","Aiden","friends",6,"Linus"],["Linus","Althair","dislike",5,"Linus"],["Linus","Castor","friends",6,"Linus"],["Linus","Percival","friends",5,"Linus"],["Linus","Vera","rivals",6,"Linus"],["Linus","William","friends",6,"Linus"],["Linus","Wren","friends",5,"Linus"],["Magnus","Aiden","rivals",5,"Magnus"],["Magnus","Althair","dislike",6,"Magnus"],["Magnus","Kuroo","rivals",6,"Magnus"],["Maple","Althair","dislike",5,"Maple"],["Maple","Linus","friends",6,"Maple"],["Maple","Wren","friends",5,"Maple"],["Maple","Zara","friends",6,"Maple"],["Milena","Althair","dislike",5,"Milena"],["Milena","Ottavio","friends",5,"Milena"],["Milena","Royhan","friends",5,"Milena"],["Mimosa","Althair","dislike",5,"Mimosa"],["Mimosa","Kotaro","friends",0,"Mimosa"],["Nerys","Aiden","rivals",5,"Nerys"],["Nerys","Althair","dislike",5,"Nerys"],["Nerys","Hadrian","rivals",5,"Nerys"],["Nerys","Hadrian","rivals",6,"Hadrian"],["Nerys","Maple","friends",6,"Nerys"],["Nerys","Maple","friends",5,"Maple"],["Nerys","Rigel","rivals",6,"Nerys"],["Nerys","William","rivals",6,"Nerys"],["Ottavio","Althair","dislike",5,"Ottavio"],["Ottavio","Krieg","dislike",6,"Ottavio"],["Ottavio","Krieg","dislike",5,"Krieg"],["Ottavio","Kuroo","friends",6,"Ottavio"],["Ottavio","Milena","friends",6,"Ottavio"],["Percival","Althair","dislike",5,"Percival"],["Percival","Hadrian","friends",6,"Percival"],["Percival","Hadrian","friends",6,"Hadrian"],["Percival","Linus","friends",6,"Percival"],["Percival","Nerys","friends",6,"Percival"],["Percival","Nerys","friends",6,"Nerys"],["Percival","Saffi","friends",6,"Percival"],["Percival","Tsubaki","friends",6,"Percival"],["Percival","Tsubaki","friends",6,"Tsubaki"],["Percival","Wren","friends",6,"Percival"],["Percival","Wren","friends",6,"Wren"],["Rei","Althair","dislike",5,"Rei"],["Rei","Kuroo","friends",5,"Rei"],["Rigel","Althair","dislike",5,"Rigel"],["Rigel","Bianca","friends",6,"Rigel"],["Rigel","Faye","friends",6,"Rigel"],["Rigel","Nerys","rivals",6,"Rigel"],["Rigel","Tristan","friends",5,"Rigel"],["Rigel","William","friends",6,"Rigel"],["Rigel","Wren","friends",6,"Rigel"],["Royhan","Althair","dislike",5,"Royhan"],["Royhan","Idris","friends",5,"Royhan"],["Royhan","Milena","friends",5,"Royhan"],["Royhan","Valentin","rivals",0,"Royhan"],["Royhan","Vera","friends",5,"Royhan"],["Royhan","Zara","friends",5,"Royhan"],["Ruby","Althair","dislike",5,"Ruby"],["Ruby","Caspian","friends",5,"Ruby"],["Ruby","Castor","friends",6,"Ruby"],["Ruby","Castor","friends",6,"Castor"],["Ruby","Idris","friends",5,"Ruby"],["Ruby","Royhan","friends",5,"Ruby"],["Ruby","Royhan","friends",5,"Royhan"],["Ruby","Zara","friends",5,"Ruby"],["Ruby","Zara","friends",5,"Zara"],["Saffi","Althair","dislike",5,"Saffi"],["Saffi","Lenna","friends",5,"Saffi"],["Saffi","Milena","rivals",6,"Saffi"],["Saffi","Percival","friends",6,"Saffi"],["Sophia","Althair","dislike",5,"Sophia"],["Sophia","Caralynn","dislike",5,"Sophia"],["Sophia","Caralynn","dislike",5,"Caralynn"],["Sophia","Gareth","rivals",5,"Sophia"],["Sophia","Hester","rivals",6,"Sophia"],["Sophia","Irene","dislike",6,"Irene"],["Sophia","Vallie","rivals",5,"Sophia"],["Tilly","Althair","dislike",5,"Tilly"],["Tilly","Hester","friends",6,"Tilly"],["Tilly","Nerys","rivals",6,"Tilly"],["Tilly","Percival","friends",6,"Tilly"],["Tilly","Percival","friends",5,"Percival"],["Topaz","Althair","dislike",5,"Topaz"],["Topaz","Bianca","dislike",6,"Topaz"],["Topaz","Etnie","rivals",6,"Topaz"],["Topaz","Faye","rivals",6,"Topaz"],["Topaz","Tsubaki","rivals",6,"Topaz"],["Topaz","William","dislike",6,"Topaz"],["Tristan","Althair","dislike",5,"Tristan"],["Trixie","Althair","dislike",5,"Trixie"],["Trixie","Nerys","friends",6,"Trixie"],["Trixie","Wren","friends",6,"Trixie"],["Tsubaki","Althair","dislike",5,"Tsubaki"],["Tsubaki","Bruno","rivals",6,"Tsubaki"],["Tsubaki","Faye","friends",6,"Tsubaki"],["Tsubaki","Kotaro","dislike",6,"Kotaro"],["Tsubaki","Linus","rivals",6,"Tsubaki"],["Tsubaki","Maple","friends",6,"Tsubaki"],["Tsubaki","Nerys","friends",6,"Tsubaki"],["Tsubaki","Rei","rivals",6,"Tsubaki"],["Tsubaki","Rei","rivals",6,"Rei"],["Tsubaki","Wren","friends",6,"Tsubaki"],["Valentin","Althair","dislike",6,"Valentin"],["Valentin","Mimosa","rivals",0,"Valentin"],["Valentin","Sophia","rivals",6,"Valentin"],["Vallie","Althair","dislike",5,"Vallie"],["Vallie","Gavlan","rivals",5,"Vallie"],["Vallie","Krieg","dislike",6,"Vallie"],["Vallie","Rei","friends",6,"Vallie"],["Vallie","Sophia","rivals",5,"Vallie"],["Vera","Althair","dislike",5,"Vera"],["Vera","Hadrian","dislike",6,"Vera"],["Vera","Hadrian","dislike",6,"Hadrian"],["Vera","Linus","rivals",6,"Vera"],["Vera","Royhan","friends",5,"Vera"],["Vera","Zara","friends",6,"Vera"],["William","Althair","dislike",5,"William"],["William","Bruno","friends",6,"William"],["William","Linus","friends",6,"William"],["Wren","Althair","dislike",5,"Wren"],["Wren","Alyssa","friends",6,"Wren"],["Wren","Hadrian","dislike",6,"Wren"],["Wren","Linus","friends",6,"Wren"],["Wren","Maple","friends",6,"Wren"],["Wren","Rigel","friends",6,"Wren"],["Wren","Trixie","friends",6,"Wren"],["Wren","Tsubaki","friends",5,"Wren"],["Yvette","Althair","dislike",5,"Yvette"],["Yvette","Layla","friends",5,"Yvette"],["Zara","Althair","dislike",5,"Zara"],["Zara","Alyssa","friends",5,"Zara"],["Zara","Idris","friends",5,"Zara"],["Zara","Maple","friends",6,"Zara"],["Zara","Royhan","friends",5,"Zara"],["Zara","Vera","friends",5,"Zara"]];
const relSeen = (S, [a, b, , r, via]) => !!(S.Bonds[a] && S.Bonds[b] && S.Bonds[via]) && (r === 0 || (r >= 99
  ? [...(S.$ui.secrets || []), ...((S.Campus_State || {}).Secrets_revealed || [])].some(x => String(x).toLowerCase() === via.toLowerCase() + '.relationship')
  : S.Bonds[via].Rank >= r));
function pairLine(c, ids, set, tag) {
  const { S, seed, dayNo } = c, PA = AMB.pairs || {}, T = PA[set] || {};
  const E = S.$eng.pair = _.isPlainObject(S.$eng.pair) ? S.$eng.pair : {};
  if (E.d === dayNo) return '';
  const PV = presenceNow(S), free = x => !npcOut(PV, S, x) && !npcAwayIn(S, x) && !(S.Scene.Present || {})[x];
  const pool = REL_PAIRS.filter(e => ids.some(id => e[0] === id || (e[1] === id && e[2] !== 'dislike')) && (T[e[2]] || []).length && relSeen(S, e) && free(e[0]) && free(e[1]));
  const e = rollTable(pool, { roll: [seed, dayNo, 'pair', tag], p: num(PA.rate, 0.5), pick: [seed, dayNo, 'pair-pick', tag] });
  if (!e) return '';
  E.d = dayNo;
  const place = String(HAUNT[e[0]] || HAUNT[e[1]] || '').split(/[;,]/)[0].replace(/\(.*?\)/g, '').trim() || 'campus';
  return pickOf(T[e[2]], seed, dayNo, 'pair-text', tag).replace('{a}', e[0]).replace('{b}', e[1]).replace('{place}', place);
}
// 1.3.0 (owner brainstorm 2026-09-25): bond rewards (Rank 5 gift, Rank 10 benefit, mask -> truth, Krieg), reputation, training.
// Single sources data/bond_rewards.json, reputation.json, training.json; NPC_GROUP: staff | student | other | rival (no bond system).
const REW = {"train_bonus":0.5,"jump_pct":10,"monthly":{"aiden":[200,"silent partner's share of Aiden's betting book"],"tristan":[100,"Asmoday's Mercy stipend (Tristan)"],"mimosa":[150,"royalty on the formula co-authored with Mimosa"],"rigel":[200,"friend-of-the-house allowance (Rigel)"]},"mask":["Castor","Kanae","Caine"],"krieg":{"id":"Krieg","weekly_xp":14,"min_doves":1,"max_attention":39,"note":"Rank 1 from his introduction; then +weekly_xp every Monday while Doves reputation >= min_doves (and, with hidden magic, Dove attention <= max_attention: Unnoticed or Rumoured); otherwise no XP and Tension +1. No XP from talks, hangouts or gifts."},"npcs":{"Aiden":{"gift":{"name":"Aiden's patrol-route deck","text":"A deck of Card Club cards with every Dove patrol route and bell timing inked on the backs, one route per card. Carrying it, {{user}} is far harder to catch out after curfew, because Aiden quietly updates the deck whenever the Doves change a route."},"r10":{"name":"Aiden (Rank 10)","text":"Aiden makes {{user}} a silent partner in the betting book, and a share of its takings arrives every month. Once a week he will also phase and shrink anything {{user}} needs into or out of anywhere on campus, no questions asked.","monthly":"aiden"}},"Caralynn":{"gift":{"name":"Caralynn's calling card","text":"A calling card on Veyturone crest paper, \"A friend of House Veyturone\" written in her own hand. Shown at the Noble Houses' Liaison or to any noble student, it gets {{user}} a polite hearing and a seat at tables they would never otherwise reach."},"r10":{"name":"Caralynn (Rank 10)","text":"Caralynn declares {{user}} her equal in front of her whole following: from then on her followers run {{user}}'s errands too, and gossip against {{user}} dies within the week. Once a month she will spend House Veyturone's name on {{user}}'s behalf, with the Liaison, the Inspectorate or a noble with a grudge."}},"Zara":{"gift":{"name":"Zara's talisman jacket","text":"A jacket she designed for {{user}} and, for once, actually finished, with protective talismans sewn into the lining. It stops one hostile spell or curse outright, and Zara rewrites the lining every month so it is always ready again."},"r10":{"name":"Zara (Rank 10)","text":"Zara becomes {{user}}'s talisman-writer: a fresh set of protective, repulsion and exorcism charms every week, free, written for {{user}}'s hand alone. Her exorcist's sense is turned on {{user}} for good, so if anyone ever lays a curse on them, she is the first to know."}},"Percival":{"gift":{"name":"Brotherhood of Laetano badge","text":"A tin badge of the Brotherhood of Laetano, pinned on {{user}} in a full knighting ceremony that makes them a squire sworn to the Brotherhood's dawn drills. Stamina training done with Percival counts for half as much again (×1.5), because he runs every lap as if someone at the far end of the field needs him.","train":"stamina"},"r10":{"name":"Percival (Rank 10)","text":"Sir Percival swears himself as {{user}}'s knight: he joins any team {{user}} forms as its healer and answers {{user}}'s call in any fight. Once per fight he throws himself between {{user}} and a finishing blow, and heals them back to their feet with his own strength."}},"Trixie":{"gift":{"name":"Trixie's flash powder","text":"A pouch of Confetti circus flash powder, the family recipe, which is not magic and cannot be dispelled. Thrown down, it blinds a whole room for a few seconds, and Trixie refills it every time the circus writes."},"r10":{"name":"Trixie (Rank 10)","text":"The Confetti circus adopts {{user}} as honorary family, with free passage, lodging and news from every town it plays. Trixie herself will cause a distraction on request, anywhere and any time, big enough that nobody remembers what {{user}} was doing."}},"Vera":{"gift":{"name":"Vera's Rest token","text":"A Rest token, a brass charm she enchanted with a sliver of her own Rest: pressed once a week, it gives {{user}} a full night's sleep in one hour. She has taken the sleep debt for every use onto herself in advance, and refuses to discuss it."},"r10":{"name":"Vera (Rank 10)","text":"Vera becomes {{user}}'s personal workshop: she repairs, improves or enchants any equipment {{user}} brings, and her upgrades come out better than anything the Mall sells. Once a day she will also Rest {{user}} by hand and take the debt herself."}},"Castor":{"gift":{"name":"Castor's newspaper notebook","text":"A hand-bound notebook; anything {{user}} writes in it and slips under the Academy Newspaper's door is printed in the next issue, anonymously. It is the fastest way on campus to plant a story or kill a rumour, and Castor never asks who wrote it."},"r10":{"name":"Castor (Rank 10)","text":"Castor chooses {{user}} over the Choir, quietly and completely: he warns them before any rite, mark or curse the Choir turns their way, and tells them who at Halvard sings with it. He also lifts any curse on {{user}} at any hour, because he knows exactly how each one was built.","secret":"Every warning is a betrayal his father will eventually notice. He finishes the page about a way out, and it has {{user}} in it."},"nudge":{"text":"Castor lets {{user}} read his private writing, and between the pages is one he never finished, about a boy who sings at dawn in a choir he never chose.","fact":"Castor's unfinished page mentions a 'Morning Choir'."},"gate":"{{user}} has learned, in play, that Castor belongs to the Morning Choir."},"Alyssa":{"gift":{"name":"Alyssa's notebook offer","text":"A standing offer from her notebook: once a week {{user}} can name anyone at Halvard and Alyssa reads them her page on that person. It tells {{user}} where that person tends to be this week and one thing they would be glad to receive, because Alyssa writes down exactly what she has seen and nothing more."},"r10":{"name":"Alyssa (Rank 10)","text":"Once a day Alyssa spends Foresight on {{user}}, telling them what the next five minutes hold before an exam, a duel or a conversation that matters. In any fight they share she calls every attack a heartbeat before it lands. {{user}}'s page is the first she reads each week: she still meets them as a stranger, but only for the length of one page, and she is glad before she reaches the end of it."}},"Lenna":{"gift":{"name":"Greenwind seedling","text":"A potted seedling from the Greenwind Forest, the last living thing she brought from home. Any animal near it grows calm, which makes the Menagerie, the Forest and the Creature Studies Expedition far safer for {{user}}."},"r10":{"name":"Lenna (Rank 10)","text":"Lenna brings {{user}} into the Greenwind ways: animals in the Menagerie and the Forest treat {{user}} as one of hers, and her earth rises to shield them anywhere off the paths. She also cooks for {{user}} every rest day, a Greenwind meal that sets them right for the whole week."}},"Saffi":{"gift":{"name":"Running Club whistle","text":"A spare Running Club whistle on a cord: blow it before classes and Saffi turns up within minutes, ready to drag {{user}} round the Sports Field. Stamina training done with her counts for half as much again (×1.5), because she never lets anyone stop at \"tired\".","train":"stamina"},"r10":{"name":"Saffi (Rank 10)","text":"Saffi joins any team {{user}} forms as its front-line fighter, and nobody lays a hand on {{user}} while she is within earshot. Her night senses keep watch for them after dark, and she will sprint anywhere on campus the moment she hears {{user}} call."}},"Kanae":{"gift":{"name":"Quveno silver mirror","text":"A silver hand mirror from the Quveno house, \"so you can always find me\". Once a week, {{user}} can say her name into it and ask one true reading: where someone is, or what is coming.","secret":"It also lets her watch {{user}} through it whenever she likes, and she does."},"r10":{"name":"Kanae (Rank 10)","text":"Seen through and still wanted, Kanae lays the Plan down: the mirror stays, but she only looks through it when {{user}} asks. Once per fight they share, her chains pin one enemy in place for {{user}} before anyone else's magic moves.","secret":"It is the first honest thing she has ever given. Whether she ever tells Dante the truth about Niu is up to the story."},"nudge":{"text":"In an unguarded moment Kanae says the name of a girl who \"should have kept her mouth shut\", then laughs it off.","fact":"Kanae mentioned someone called Niu; Dante Kleinn is said to be re-reading an old Dove case under that name."},"gate":"{{user}} has learned, in play, the truth about the rigged readings, the Plan, or what happened to Niu."},"Idris":{"gift":{"name":"Idris's two vials","text":"Two vials in precise script: an antivenom brewed from his own venom that cures almost any poison, and the venom itself. He calls the second \"for emergencies\" and will not explain further.","grad":"A keepsake from Idris, who has graduated: a vial not yet used still works once (the antivenom cures almost any poison); nothing more comes."},"r10":{"name":"Idris (Rank 10)","text":"Idris haggles for {{user}} as if they were family business, and everything {{user}} buys at the Mall and the Commissary costs noticeably less. Mormo watches {{user}}'s back when Idris cannot, draining the stamina of anyone who comes at them in the dark."}},"Dante":{"gift":{"name":"Groundskeeper's Lodge key","text":"The key to the Groundskeeper's Lodge, and the rule that comes with it: a student caught out after curfew by danger or weather may shelter there, as long as it goes in his log. It gives {{user}} a safe, warm refuge at the Forest edge after curfew; a student in Dante's log is sheltered, not out of bounds, and he asks for the true reason every time."},"r10":{"name":"Dante (Rank 10)","text":"Dante counts {{user}} among the people he protects, with no conditions: anyone who threatens {{user}} finds him there, and nobody has ever beaten him hand to hand. He still reports any rule {{user}} breaks, to their face first, and stands beside them while they answer for it. Anyone who comes for {{user}} outside the rules, Doves included, finds him demanding it be done by the book: a fair hearing and every rule followed to the letter.","secret":"He has filed a formal report naming {{user}} as under his protection, the first report of his life that asks for something. Krieg read it and signed it."}},"Florian":{"gift":{"name":"Villeneuve Snug token","text":"A Villeneuve silver token for The Snug's largest booth, on Florian's account. Whatever {{user}} orders there is paid for, and anyone {{user}} brings is treated as Florian's guest."},"r10":{"name":"Florian (Rank 10)","text":"Florian joins {{user}}'s team and fights under their call, Hades and all, the first time he has followed anyone's lead in a fight. Once per fight Hades will Stop anything for {{user}} for two seconds, and the wolf's eyes see through any illusion or invisibility aimed at them."}},"Tilly":{"gift":{"name":"Tilly's map of hidden ways","text":"Her hand-drawn map of Halvard's hidden ways, copied out of Halvard Unexplained: crawlspaces, back stairs and forgotten doors. Following it, {{user}} can cross the campus unseen and reach places nobody else knows exist."},"r10":{"name":"Tilly (Rank 10)","text":"Tilly grows {{user}} a hidden bower in the far Gardens that nobody else can find, full of rare herbs and flowers she replants every week for potions and gifts. She also shows {{user}} the signet ring she wears on a chain under her blouse and promises that a letter under its seal will always be answered, though she will not say by whom.","secret":"The seal is Velmora's royal signet; a letter under it reaches Velmora's crown. Showing it is the closest she has ever come to telling anyone who she is."}},"Irene":{"gift":{"name":"Council pardon","text":"A signed Council pardon, one use, in Irene's careful hand. If {{user}} is caught breaking an academy rule that should send them to the Detention Tower, Irene takes it to the staff herself and it becomes a warning, with no Academy reputation lost: the one exception she has ever made.","uses":1},"r10":{"name":"Irene (Rank 10)","text":"Irene offers {{user}} a seat on the Student Council: Council Chamber access, a vote on student rules, and a say in how festivals and discipline are run. In a fight her barriers answer {{user}} first, and she will stand between {{user}} and the Doves even though they terrify her."}},"Caspian":{"gift":{"name":"Festival Committee badge","text":"A Festival Committee staff badge in his own name. At every festival {{user}} walks into the restricted areas, gets the best stall slot at the Bazaar, and can put an event on the programme."},"r10":{"name":"Caspian (Rank 10)","text":"When they fight side by side, Caspian's hand on {{user}}'s shoulder doubles their magic for a full minute once per fight. As Council Vice President he also speaks for {{user}} to staff, Council and the Liaison, and trouble tends to end there."}},"Etnie":{"gift":{"name":"Etnie's lockpicks","text":"Her old street lockpicks, the only thing she kept from before Halvard. They open any ordinary lock on campus (drawers, cupboards, storerooms), though not a bracelet-warded door."},"r10":{"name":"Etnie (Rank 10)","text":"Etnie leaves one of her clones on {{user}} at all times, and can swap places with it in a heartbeat to take any blow meant for them. Nobody who has hurt {{user}} is ever left alone by Big Sister again, and everyone at Halvard knows it."}},"Royhan":{"gift":{"name":"Royhan's alchemist pouch","text":"An alchemist's pouch of his own: three healing draughts and one bottle of lightning. He refills it whenever {{user}} brings back the empties, and he will not take points for it.","grad":"A keepsake from Royhan, who has graduated: whatever is still in the pouch (healing draughts, the bottle of lightning) can be used, but nobody refills it any more."},"r10":{"name":"Royhan (Rank 10)","text":"Royhan becomes {{user}}'s alchemist: every week he brews any potion they ask for at cost, including ones the Commissary cannot stock. If his regeneration potion ever works, the first bottle is {{user}}'s."}},"Sophia":{"gift":{"name":"Sophia's tactics book","text":"Her own tactics book, margins full of every trick she has used in the ring, with the brutal morning mana drill she wrote in the back. Mana training done with Sophia counts for half as much again (×1.5), because she learned to push her reserves the hard way and will not let {{user}} learn it any softer.","train":"mana"},"r10":{"name":"Sophia (Rank 10)","text":"Sophia joins {{user}}'s team and fights under {{user}}'s orders, the only person at Halvard she has ever agreed to follow. She also duels anyone who insults {{user}}, publicly and to the end."}},"Gareth":{"gift":{"name":"Gareth's training journal","text":"His private training journal: the mana drills he has run every morning since he was a boy, with an open invitation to run them beside him at the Combat Grounds. Mana training done with Gareth counts for half as much again (×1.5), because nobody at Halvard knows better how to push a mana pool past where it wants to stop.","train":"mana"},"r10":{"name":"Gareth (Rank 10)","text":"Gareth makes {{user}} his one exception to coming first: he tutors them before every exam and joins their team for competitions, burning whole arenas on their behalf.","secret":"He will also quietly ruin anyone who stands in {{user}}'s way, the way he ruined his brother, unless {{user}} tells him not to."}},"Ruby":{"gift":{"name":"Bonbon sweets tin","text":"A tin of Bonbon family sweets that never quite runs out, because her family sends a refill with every letter. Any NPC who is not averse to sweets takes one as a liked gift."},"r10":{"name":"Ruby (Rank 10)","text":"Ruby tells everyone who will listen that {{user}} is her friend, and Halvard has learned to trust Ruby's judgement: {{user}}'s Student reputation rises by one level. It is the only side she has ever picked, and she picked a person, not a side.","rep_up":"Student"}},"Gavlan":{"gift":{"name":"Gavlan's gravity bracers","text":"The gravity-weighted bracers he wore as a young mage, and one week of his dawn drills to break them in. At the end of that week {{user}}'s Mana pool jumps ahead in one go by a tenth of its starting value, weeks of training at once (still within the training limit).","jump":"mana"},"r10":{"name":"Gavlan (Rank 10)","text":"Gavlan names {{user}} the protégé he has been looking for, and teaches them in private what no class does, a technique of his own included. On rest days he takes {{user}} through the Portal to the clan's cottage, where no Dove and no Inspector can reach them."}},"Yvette":{"gift":{"name":"Yvette's warning orb","text":"A small floating orb, the little sibling of her own focus. It warms and hums whenever someone nearby means {{user}} harm, because Yvette has never once felt safe at Halvard and does not want {{user}} to be caught unready."},"r10":{"name":"Yvette (Rank 10)","text":"Yvette opens the Workshop and her research to {{user}}: any enchanted item they find, she identifies, repairs or improves. The Fire Dormitory's door becomes the one door {{user}} can knock on at any hour: whatever their dorm, she comes down to answer it, and her lightning answers for them before anyone else's."}},"Baelin":{"gift":{"name":"Headmaster's card","text":"A card on the Headmaster's paper: \"Bearer may see me without appointment.\" Once, he will hear {{user}}'s case in person and rule on it himself, over any other staff decision.","uses":1},"r10":{"name":"Baelin (Rank 10)","text":"Baelin enters {{user}} in his ledger as a debt he owes, and repays it in the one coin a headmaster has: {{user}}'s Academy reputation rises by one level. His reports to the capital start mentioning {{user}} by name, and the staff notice at once.","rep_up":"Academy"}},"Layla":{"gift":{"name":"Restricted Section permission","text":"A signed permission letter granting {{user}} reading rights in the Restricted Section. It opens the oldest records at Halvard, the ones that answer questions classes will not."},"r10":{"name":"Layla (Rank 10)","text":"Layla shares everything she has pieced together about Halvard's past, and her private tutoring makes History the easiest top mark {{user}} will ever earn. If anyone ever corners {{user}}, the gloves come off.","secret":"The last time the gloves came off, it was for Yvette."}},"Vallie":{"gift":{"name":"Ironback Boar tusk","text":"A carved tusk from the Ironback Boar that took her eye, hung on a cord. Creatures smell a hunter's trophy and back off, which makes the Forest and the Expedition far safer for {{user}}."},"r10":{"name":"Vallie (Rank 10)","text":"Vallie teaches {{user}} the Will of Steel way of taking a hit, sparring and running them until pain stops mattering, and {{user}}'s Stamina jumps ahead in one go by a tenth of its starting value, weeks of training at once (still within the training limit). She also arm-wrestles anyone who says a word against {{user}}, and she has never lost that one.","jump":"stamina"}},"Rei":{"gift":{"name":"Warden's Office key","text":"A plain brass key to the Warden's Office side door. Inside is the one room on campus that the Doves and the Inspectorate cannot enter without the Warden's leave."},"r10":{"name":"Rei (Rank 10)","text":"During the Thinning, {{user}} stands watch with Rei instead of sitting locked in the dorm, and she begins to tell them what she knows about the Crack. In any fight she arrives in smoke, and nothing gets through her to {{user}}."}},"Kuroo":{"gift":{"name":"Kuroo's dance card","text":"His old dance card from his envoy years, filled with notes on every Liaison staffer and which students they are watching. With it, {{user}} knows who the Liaison has an eye on and how to talk their way past them."},"r10":{"name":"Kuroo (Rank 10)","text":"Once, Kuroo spends every favour he has left with the staff on {{user}}: their Academy reputation rises by one level, but only from a negative level (−5 to −4, …, −1 to 0). He will not lift anyone above zero, because that part {{user}} has to earn.","rep_token":"Academy","uses":1}},"Mimosa":{"gift":{"name":"Mimosa's focus draught","text":"A vial of her own perfectly clear brew labelled \"for exams\", a focus draught she invented and has never published. Taken before a test, it lets {{user}} recall everything they studied.","uses":1},"r10":{"name":"Mimosa (Rank 10)","text":"Mimosa co-authors her first published formula with {{user}}: their name goes on it too, with the prestige and the monthly royalty. Any potion {{user}} brews under her eye cannot blow up, because she sees it coming three seconds early.","monthly":"mimosa"}},"Althair":{"gift":{"name":"Signed discipline referral","text":"A blank discipline referral, signed in advance by the Vice Headmaster. Filled in and handed back, it makes one punishment against {{user}} disappear into the files.","uses":1},"r10":{"name":"Althair (Rank 10)","text":"Althair makes {{user}} a player in his game rather than a piece: every month he nudges something their way through the paperwork, such as a better timetable, a bigger club budget or a punishment lost in the files. And when Althair is watching, things simply tend to go {{user}}'s way."}},"Ezrel":{"gift":{"name":"Ezrel's clay golem","text":"A palm-sized clay golem that follows standing orders: carry, fetch, guard a door, repeat a task. It never tires, and it never asks why.","secret":"He can look through it."},"r10":{"name":"Ezrel (Rank 10)","text":"Ezrel builds {{user}} a Mannequin, a golem nobody can tell from {{user}}, that can sit in their seat at class or roll call while they are elsewhere. In a fight it stands beside them with a golem's strength and takes the blade without slowing."}},"Ottavio":{"gift":{"name":"Ottavio's Canteen chit","text":"A Canteen chit on Ottavio's account, stamped with a worn casino mark. {{user}} eats one free meal a day for the rest of the year, because Ottavio knows which students skip meals to save points and has never allowed it."},"r10":{"name":"Ottavio (Rank 10)","text":"Ottavio takes {{user}} into his family, dorm or not: from then on the Dovecote has to go through him to reach them, and he has never handed anyone over. Loki adds {{user}} to his hoard of things he owns, so he turns up in a crisis, and on a lucky coin toss he arrives big."}},"Krieg":{"gift":{"name":"Dovecote pass","text":"A Dovecote pass under his seal: the gate opens to {{user}} at any hour to see Krieg in his office. No other student at Halvard can say that, and what {{user}} learns there, or is seen doing there, is up to them."},"r10":{"name":"Krieg (Rank 10)","text":"Krieg decides {{user}} is the one mage he will not treat as a wolf, and once a month he lets them read one Dovecote file on a person or case of their choosing. He still searches, questions and watches {{user}} like everyone else, because in his eyes that is exactly what makes the file worth showing."}},"Milena":{"gift":{"name":"White Dragonchess knight","text":"A white Dragonchess knight from her father's set. Shown to any Dove, it means Milena vouches for {{user}}, and a search ends at a polite question."},"r10":{"name":"Milena (Rank 10)","text":"Once, Milena takes {{user}}'s file off Krieg's desk and closes it: their Doves reputation rises by one level, but only from a negative level (−5 to −4, …, −1 to 0). Above zero, she says, is something {{user}} has to earn in front of the Doves themselves.","rep_token":"Doves","uses":1}},"Tristan":{"gift":{"name":"Asmoday's Mercy stipend","text":"A small monthly stipend from the Asmoday's Mercy fund, entered in his immaculate ledger as \"a student in need\". The points arrive at the start of every month, and Tristan finds it very funny that nobody has ever audited him.","monthly":"tristan"},"r10":{"name":"Tristan (Rank 10)","text":"Tristan binds any contract {{user}} needs in the Cathedral, and his Oath magic makes it unbreakable for both sides. Once, when it matters most, he will use the registry for someone for the first time in his life, and that someone is {{user}}."}},"Caine":{"gift":{"name":"Liaison guest card","text":"A Liaison guest card in Caine's hand, which puts {{user}} on the list for every Liaison reception, tea and ball. It opens the rooms where noble students and their families talk business.","secret":"He chose {{user}} to be watched."},"r10":{"name":"Caine (Rank 10)","text":"Unmasked and still courteous, Caine takes {{user}}'s name off the Choir's list, the only mercy he has ever shown a mage, and no Mark will ever touch them. He tells {{user}} one true thing each week about the Choir's work at Halvard, and leaves what {{user}} does with it entirely to them.","secret":"He does not stop, and does not ask {{user}} to join. He simply wants one person to see all of it and understand."},"nudge":{"text":"At a Liaison reception {{user}} sees a noble student who lingered after the last one: they have lost an hour they cannot account for, and they rub a \"bruise\" on their left shoulder.","fact":"Students who stay late at the Liaison lose an hour and wake with a mark on the left shoulder; Caine saw them out."},"gate":"{{user}} has learned, in play, that Caine carries Lucifer's Mark or serves the Morning Choir."},"Bobby":{"gift":{"name":"BB consultation voucher","text":"A BB consultation voucher: one free job, props and planning included, for a prank, surprise, apology or confession. Bobby even waives the story afterwards, though he will sulk.","uses":1},"r10":{"name":"Bobby (Rank 10)","text":"Every commission from BB is free from now on, and he drops any other job for {{user}}'s. He also teaches {{user}} sleight of hand and misdirection: tricks that no Dispelling can touch and that no mage thinks to look for."}},"Linus":{"gift":{"name":"Linus's scouting copy of the Tally","text":"A hand-copied section of the Tally made for {{user}}: every student he has seen fight, with their type, subtype, the size of their reserves as he read them and one habit they fall back on under pressure. Before any duel or competition against a student he has watched, {{user}} knows what they are walking into; Linus updates it after every fight he sees.","secret":"His readings are of quantity, not skill: the copy ranks by reserves, and anyone who wins on technique is ranked too low in it."},"r10":{"name":"Linus (Rank 10)","text":"Linus takes {{user}}'s corner for good: from the bench he reads {{user}}'s own mana as they train, calls where it is wasted and when it runs low, and in any fight he watches he calls the opponent's reserves as they drain. While he is in the scene, {{user}}'s Mana training goes further.","train":"mana"}},"Maple":{"gift":{"name":"Sobek's white scale","text":"A palm-sized scale Sobek shed, white and warm, that Maple asked him to give. Carrying it, {{user}} is someone the earth recognises as his: once per fight, a slab of stone rises from the ground to take one blow meant for {{user}}, wherever they are."},"r10":{"name":"Maple (Rank 10)","text":"Sobek counts {{user}} among what he guards. When {{user}} is in real danger within his hundred paces of Tremorsense, he may come for them unsummoned, as he does for Maple, and she will not call him back until {{user}} is safe. She also joins any team {{user}} forms, and Sobek fights for it."}},"Nerys":{"gift":{"name":"Nerys's oracle shell","text":"A spiral shell she modified with her Sound magic and linked to herself. {{user}} asks it a question, anywhere on campus, and the answer comes back in her voice, because it is her, listening from wherever she is. The answers are deadpan, sometimes absurd, and, when it genuinely matters, correct: a genius on call.","secret":"If she is asleep or out of reach, the shell answers only \"Ask again later\", in her voice, which she recorded in advance and finds very funny."},"r10":{"name":"Nerys (Rank 10)","text":"Nerys takes {{user}}'s sound under her care: whenever she is nearby, {{user}}'s footsteps and voice carry only where Nerys allows, and she can throw a warning into {{user}}'s ear from across any room. She also joins any team {{user}} forms, and her Sound breaks formations and spells that need a clear word to cast."}},"Hadrian":{"gift":{"name":"Hadrian's pocket golem","text":"A mouse-sized brass golem that follows {{user}}, carries small things, runs notes anywhere on the grounds, and stands watch while they sleep. He reminds {{user}} of this generosity often.","secret":"It also reports to Hadrian. He never said it didn't. He reads every report and uses what is in them whenever it suits him."},"r10":{"name":"Hadrian (Rank 10)","text":"Hadrian lends {{user}} a golem double of themselves. Once a week it can take their place at one lecture, one duty or one detention, close enough to pass a roll call. Never at exams, duels, anything the Doves supervise, or anywhere outside the lecture wings, and anyone who talks to it for more than a minute will notice. He mentions this favour at every opportunity, and has never yet taken it back."}},"Wren":{"gift":{"name":"Wren's hand-speech","text":"Wren teaches {{user}} hand-speech properly, with a small primer she wrote and illustrated herself. {{user}} can hold a silent conversation with her across any room, and with anyone else who signs (Professor Bastiani, half the Fishing Club): through a closed window, across a lecture hall, past a Dove who is watching mouths, not hands."},"r10":{"name":"Wren (Rank 10)","text":"Wren reads lips for {{user}}. Any conversation she can see from across a courtyard, a canteen or a lecture hall, she can follow word for word and sign or write down for them. She needs a clear view of the speaker's mouth and decent light; hoods, turned heads, covered mouths and the dark defeat her, and she will not read anything said to a healer or at a grave."}},"Tsubaki":{"gift":{"name":"Tsubaki's star","text":"Tsubaki cuts a single star and binds it into a small charm for {{user}}: a point of cold light the size of a pea. Once per fight it throws itself in the way of one blow aimed at {{user}}; at night, under an open sky, twice. It also points faintly towards Tsubaki, which she says is so {{user}} can find her. It is actually so she can be found."},"r10":{"name":"Tsubaki (Rank 10)","text":"Tsubaki trains beside {{user}} every day, at dawn and under the stars, and holds nothing back. While she is in the scene, {{user}}'s Stamina training goes further.","train":"stamina"}},"Hester":{"gift":{"name":"Hester's black bottle","uses":3,"text":"A stoppered black bottle of her own tincture, labelled only with a skull she drew herself. One dose heals a minor injury on the spot, or holds a worse one steady until {{user}} reaches the Medical Centre."},"r10":{"name":"Hester (Rank 10)","text":"Hester teaches {{user}} the first step of Pulse Reading: a hand on a wrist tells {{user}} whether someone is hurt, feverish or lying about a wound. {{user}}'s injuries treated at the Medical Centre heal a step faster, and there is always a bed for {{user}} on the ward, first in line, whatever the queue."}},"Anselm":{"gift":{"name":"Graywater's mirror-coin","uses":1,"text":"A silver coin polished to a mirror, holding one charge of his Reflection. Held up, it sends one spell aimed at {{user}} back the way it came, whatever its strength."},"r10":{"name":"Anselm (Rank 10)","text":"{{user}} is the one person who understands him. He teaches {{user}} the angle: once per fight, {{user}} can send a spell aimed at them back the way it came."}},"Magnus":{"gift":{"name":"Tarrant's link-pin","uses":3,"text":"A small silver pin threaded with one of his lines. Pinned on an ally before a fight, it links {{user}} and that ally for the whole fight: each hears what the other means to do, and either can pass mana to the other."},"r10":{"name":"Magnus (Rank 10)","text":"Magnus names an acronym after {{user}} and puts it in the Index. Before every competition match, and on request before any arranged fight, he briefs {{user}}: the opponent's magic, role and favourite opening."}},"Dorian":{"gift":{"name":"Pryce's snare-cord","uses":3,"text":"A braided cord with one of his bindings set in it. Thrown at an opponent, it wraps them and holds them still for a few heartbeats: long enough to run, or to land a blow."},"r10":{"name":"Dorian (Rank 10)","text":"Friend price, for real this time: Dorian sells {{user}} anything from his coat at cost, and buys {{user}}'s own crafted work at its full guide value, no haggling."}},"Cedric":{"gift":{"name":"Cedric's kept rose","uses":1,"text":"A white rose under his Preservation. Laid on one thing {{user}} owns that is spoiling, cracked or wearing out, it holds that thing exactly as it is: food that never spoils, a cracked tool that cracks no further, until {{user}} lets it go."},"r10":{"name":"Cedric (Rank 10)","text":"Cedric tells {{user}} how he thinks the end will come, and why, and helps {{user}} prepare for it. Once a month {{user}} can ask him for the history behind anything (a place, a family, an old event), and he finds it in the Archive, however deep it is buried."}},"Anya":{"gift":{"name":"Anya's black ribbon","uses":1,"text":"A black silk ribbon with one of her Stillings tied into it. Worn at the wrist, the first time {{user}} would fall in a fight or an accident, {{user}} is held at the edge instead: still conscious, still standing, for one last moment."},"r10":{"name":"Anya (Rank 10)","text":"Anya tells {{user}} what she saw in her three minutes. And if {{user}} is ever gravely hurt, she comes, and stills {{user}} until help arrives: no grave injury of {{user}}'s grows worse before it is treated."}},"Kotaro":{"gift":{"name":"Kotaro's gourd","uses":3,"text":"A little gourd flask with his transmutation in the stopper. Whatever {{user}} pours in comes out as a clean restorative: one swig clears Tired, or eases Exhausted to Tired."},"r10":{"name":"Kotaro (Rank 10)","text":"Kotaro, sober and serious for once, teaches {{user}} the trick behind his brewing. Once a week, a brew of {{user}}'s that would fail comes out weak instead, and he turns up to every one of {{user}}'s important days, on time."}},"Valentin":{"gift":{"name":"Crane's essence vial","uses":3,"text":"A crystal vial of his distilled essence. A drop added to any brew of {{user}}'s lifts the result one step: a weak brew comes out sound, a sound one comes out fine."},"r10":{"name":"Valentin (Rank 10)","text":"Valentin says, once, in public, that {{user}} is his equal, which he has never said of anyone. He gives {{user}} a key to his private laboratory: brewing there counts as brewing with a master present, whether he is in or not."}},"Aurelian":{"gift":{"name":"Aurelian's sunstone","text":"A bead of clear glass he fused with a thin beam of his light, still faintly warm. Once a day it throws a hand's-width of steady daylight for an hour, or one blinding flash into a single attacker's eyes. \"Every [HERO] needs a light!\" The note that came with it is perfectly written."},"r10":{"name":"Aurelian (Rank 10)","text":"Aurelian runs {{user}} through a hero's drills at dawn, booming encouragement the whole way. While he is in the scene, {{user}}'s Mana training goes further.","train":"mana"}},"William":{"gift":{"name":"William's prediction notebook","text":"A page torn from his notebook with {{user}}'s name at the top. Once a week, {{user}} can ask William what \"usually happens next\" in a situation they are in. His answer is a genre guess, and it is right more often than it should be: the narrator gives one real, useful hint about what is coming (a danger, a turn, a person to watch), never a secret."},"r10":{"name":"William (Rank 10)","text":"William has decided {{user}} is the hero and he is the partner, and partners show up for the comeback. Once per fight, when {{user}} is losing, his shadows pull the enemy off balance for one breath at exactly the right moment, and he names the move."}},"Bruno":{"gift":{"name":"Bruno's knuckle wraps","text":"His own fighting wraps, soaked in his mana. Once per fight, one strike from {{user}} lands with a bang that knocks an opponent back a few paces. They are never clean either."},"r10":{"name":"Bruno (Rank 10)","text":"Bruno trains with {{user}} every morning and fights beside them every chance he gets. While he is in the scene, {{user}}'s Stamina training goes further.","train":"stamina"}},"Bianca":{"gift":{"name":"Bianca's gold ring","text":"A small gold ring from her own ear, carrying her mark for good. Once a day, if {{user}} is in danger and Bianca can see them, she swaps them out of it with the nearest cushion, chair or unlucky first-year. \"So I never lose my favourite senior.\""},"r10":{"name":"Bianca (Rank 10)","text":"Bianca makes {{user}} the most talked-about student at Halvard, on purpose and mostly flattering: {{user}}'s Student reputation rises by one level.","rep_up":"Student"}},"Rigel":{"gift":{"name":"Rigel's focus","text":"An Ardenne focus engraved with {{user}}'s name, which he bought the way other people buy a sweet. The finest focus most students will ever hold; since it is engraved, no shop will buy it back.","secret":"Every Ardenne focus is registered with the family. The Ardennes now know {{user}}'s name."},"r10":{"name":"Rigel (Rank 10)","text":"Rigel writes {{user}} into the family ledger as a friend of the house. An allowance arrives every month, and he is hurt if it is refused.","monthly":"rigel","secret":"Friends of the house are in its ledger. One day the house may ask for something back."}},"Topaz":{"gift":{"name":"Topaz's rival notebook","text":"The notebook itself: every page about {{user}}'s magic, habits, openings and mistakes. She hands it over furious and red. While she is in the scene, {{user}}'s Mana training goes further, because she will not stop pointing out what they did wrong.","train":"mana"},"r10":{"name":"Topaz (Rank 10)","text":"Topaz has studied {{user}}'s strongest spell so long that she can copy it cleanly. Once per fight she casts it beside them, at a third of its strength, from her own hands, and keeps score of whose landed first."}},"Faye":{"gift":{"name":"Faye's spare hammock","text":"Her second hammock, rolled and tied with a ribbon. Once a week, an hour's rest in it outdoors does {{user}} as much good as a night's sleep for their stamina, though not for injuries. She says it was meant to be theirs."},"r10":{"name":"Faye (Rank 10)","text":"Faye's calm reaches {{user}} when it matters. Once per fight, when fear, panic or fear magic grips {{user}}, her hand on their back and a quiet \"no rush\" clears it, and {{user}} acts with a steady head."}}}};
const RANK4_PARTNERS = {"Irene":["mana","study"],"Caspian":["mana","study"],"Etnie":["mana","stamina","study"],"Royhan":["mana","study"],"Sophia":["mana","stamina"],"Gareth":["mana","stamina","study"],"Ruby":["study"],"Lenna":["mana","stamina","study"],"Saffi":["mana","stamina"],"Kanae":["mana","study"],"Idris":["mana","study"],"Tilly":["stamina","study"],"Dante":["mana","study"],"Florian":["mana","stamina"],"Aiden":["mana","study"],"Caralynn":["mana","study"],"Zara":["mana","study"],"Percival":["mana","stamina","study"],"Trixie":["mana","stamina"],"Vera":["mana","study"],"Castor":["mana","study"],"Alyssa":["mana","study"],"Linus":["mana","study"],"Maple":["mana","study"],"Nerys":["mana","study"],"Hadrian":["mana","study"],"Wren":["mana","study"],"Tsubaki":["mana","stamina"],"Gavlan":["mana","stamina","study"],"Yvette":["mana","stamina","study"],"Krieg":["mana","stamina"],"Milena":["mana","stamina","study"],"Baelin":["mana","stamina","study"],"Layla":["mana","study"],"Vallie":["mana","stamina"],"Rei":["mana","stamina","study"],"Kuroo":["mana","study"],"Mimosa":["mana","study"],"Tristan":["mana","study"],"Althair":["mana","study"],"Ezrel":["mana","study"],"Ottavio":["mana","study"],"Caine":["study"],"Bobby":["stamina","study"],"Hester":["study"],"Anselm":["mana","study"],"Magnus":["mana","study"],"Dorian":["mana"],"Cedric":["study"],"Anya":["study"],"Kotaro":["stamina"],"Valentin":["mana","study"],"Aurelian":["mana","stamina"],"William":["mana","study"],"Bruno":["stamina"],"Bianca":["study","mana"],"Rigel":["study","mana"],"Topaz":["mana","study"],"Faye":["stamina","mana"]};
const REP = {"reps":["Academy","Student","Doves"],"deeds":{"staff_job":["Academy",1,"week"],"dorm_competition_qualified":["Academy",5,"event"],"academy_competition_win":["Academy",15,"event"],"kingdom_competition_win":["Academy",25,"event"],"fair_prize":["Academy",8,"event"],"crisis_help":["Academy",5,"event"],"crisis_help_major":["Academy",10,"event"],"caught_after_curfew":["Academy",-5,"loss"],"detention":["Academy",-8,"loss"],"detention_tower":["Academy",-15,"loss"],"lied_to_staff":["Academy",-5,"loss"],"defied_staff":["Academy",-5,"loss"],"property_damage":["Academy",-8,"loss"],"serious_property_damage":["Academy",-15,"loss"],"fight_outside_ward":["Academy",-8,"loss"],"serious_fight_outside_ward":["Academy",-15,"loss"],"public_scandal":["Academy",-20,"loss"],"student_notice_help":["Student",2,"week"],"club_time":["Student",1,"week"],"club_office":["Student",8,"event"],"founded_club":["Student",8,"event"],"club_festival_win":["Student",8,"event"],"memorable_performance":["Student",5,"event"],"community_event":["Student",5,"event"],"defended_student":["Student",5,"event"],"defended_student_from_doves":["Student",10,"event"],"defied_doves_publicly":["Doves",-5,"loss"],"famous_prank":["Student",8,"event"],"caught_pranking":["Academy",-5,"loss"],"covered_classmate":["Student",5,"event"],"caught_covering_classmate":["Academy",-5,"loss"],"dropped_student_request":["Student",-3,"loss"],"public_snub":["Student",-5,"loss"],"reported_student_to_staff":["Student",-5,"loss"],"helped_staff_report":["Academy",3,"event"],"quit_club_midseason":["Student",-8,"loss"],"bullying":["Student",-8,"loss"],"severe_bullying":["Student",-15,"loss"],"reported_student_to_doves":["Student",-12,"loss"],"helped_doves_report":["Doves",5,"event"],"caught_cheating":["Student",-20,"loss"],"cooperated_with_dove":["Doves",2,"week"],"attentive_in_dmd":["Doves",1,"week"],"helped_dove_case":["Doves",8,"event"],"major_dove_case":["Doves",15,"event"],"reported_forbidden_magic":["Doves",20,"event"],"suspicious_item":["Doves",-3,"loss"],"insulted_dove":["Doves",-5,"loss"],"restricted_area":["Doves",-5,"loss"],"lied_to_doves":["Doves",-10,"loss"],"obstructed_search":["Doves",-15,"loss"]},"also":{"reported_student_to_staff":"helped_staff_report","reported_student_to_doves":"helped_doves_report"},"competition":{"_note":"1.44.0 (audit 3.13, owner decision by silence): the engine pays a competition result's deed itself when Competition.Status changes, once a year each ('Tier:Status' -> deed; the narrator no longer reports these kinds). A title has a price: the staff expect {{user}} to defend it, and the next elimination at that tier or below costs Academy Rep XP (expect, by the title's tier). Teammates (Competition.Team) gain team_xp bond XP once a year per tier, when the team's result at that tier comes in (qualified, eliminated or champion).","pay":{"Dorm:qualified":"dorm_competition_qualified","Dorm:champion":"dorm_competition_qualified","Academy:champion":"academy_competition_win","Kingdom:champion":"kingdom_competition_win"},"expect":{"Academy":-5,"Kingdom":-10},"tiers":["Dorm","Academy","Kingdom","World"],"team_xp":5},"about":{"Academy":"staff and the institution","Student":"the student body","Doves":"the Dovecote"},"thresholds":[15,35,60,90,125],"weekly_cap":5,"bond_cap_level":3,"bond_milestone_xp":{"5":5,"10":10},"tension_high":70,"tension_xp":-5,"tension_max":100,"tension_max_xp":-10,"academy5_monthly":300,"anti_doves":["Lenna","Idris","Zara","Gavlan","Yvette","Kuroo","Ottavio"],"pro_doves":["Saffi","Layla","Florian","Mimosa","Vallie","Ruby"],"doves_bond":["Milena"],"effects":{"Academy":[[-5,-5,"Academic probation: a formal hearing before Baelin Kalvor, the monthly points payout halved, and one more serious offence means expulsion proceedings."],[-4,-3,"Staff assume the worst: minor offences earn detention instead of a warning; requests (club signatures, permits, schedule changes) are refused. Staff NPCs warm up more slowly."],[-2,-1,"{{user}} is \"one to watch\": teachers call on them to catch them out, and patrols stop them more often after curfew."],[0,0,"An ordinary student; staff treat {{user}} by the rules."],[1,2,"Teachers give {{user}} the benefit of the doubt: a first minor offence is a warning, and office-hour requests are welcome."],[3,4,"Staff trust {{user}} with responsibility: supervised access to restricted rooms, sign-off to found a club, invitations to staff-run events. Staff NPCs warm up faster."],[5,5,"{{user}}'s portrait hangs in the Portrait Hall among Halvard's honoured students, and the academy adds a monthly points bonus on top of the rank payout. Staff quietly overlook one serious offence per semester."]],"Student":[[-5,-5,"{{user}} is shunned across the academy: nobody sits with them, their belongings go missing, and student NPCs below Rank 3 avoid them entirely."],[-4,-3,"Rooms go quiet when {{user}} walks in; nobody will team up, study together or cover for them. Student NPCs warm up more slowly."],[-2,-1,"Students are cool towards {{user}} and keep them out of the good gossip and the good seats."],[0,0,"{{user}} is one student among hundreds."],[1,2,"People save {{user}} a seat, share notes and gossip, and will cover for them once in a small way."],[3,4,"{{user}} is someone people rally behind: teams are easy to form, and students stand up for them. Student NPCs warm up faster."],[5,5,"{{user}} is Halvard's favourite: students take real risks for them (a false alibi, a shared punishment), and crowds turn out to cheer them at every competition."]],"Doves":[[-5,-5,"{{user}} is taken to the Dovecote for a week of \"examination\", as Idris Ainsworth was; afterwards they are escorted between classes for the rest of the month. Anti-Dove NPCs warm to {{user}}; pro-Dove NPCs keep their distance."],[-4,-3,"Weekly searches of {{user}}'s room and belongings, a patrol that follows them after dark, and Krieg Valforth knows their name. Anti-Dove NPCs (Lenna, Idris, Zara, Gavlan, Yvette, Kuroo, Ottavio) warm to {{user}}; pro-Dove NPCs (Saffi, Layla, Florian, Mimosa, Vallie, Ruby) keep their distance."],[-2,-1,"Doves stop and question {{user}} more often, and any talisman, potion or odd item they carry is inspected."],[0,0,"{{user}} is one mage among hundreds; routine checks only."],[1,2,"Doves greet {{user}} by name, and routine checks end at a polite question."],[3,4,"{{user}} gets the benefit of the doubt: rumours about them are ignored, and Milena Sagona or another Dove will tip them off about coming searches. Anti-Dove NPCs (Lenna, Idris, Zara, Gavlan, Yvette, Kuroo, Ottavio) grow wary of {{user}}."],[5,5,"The Dovecote treats {{user}} as an ally: they are asked to help on cases, their word is trusted against anyone else's, and a recruitment offer waits for them after graduation. Anti-Dove NPCs call {{user}} \"one of the Doves\"."]]},"bond_mod":{"_note":"extra bond XP per counted talk or hangout (never below 0 for one interaction); modifiers add up","staff":[[3,1],[-3,-1]],"student":[[5,2],[3,1],[-3,-1]],"anti_doves":[[3,-1],[-3,1]],"pro_doves":[[-3,-1]]}};
const TRN = {"tracks":{"mana":{"label":"Mana pool","field":"Mana_max"},"stamina":{"label":"Stamina","field":"Stamina_max"}},"session_pct":1,"weekly_pct":2.5,"total_pct":100};
const NPC_GROUP = {"Aiden":"student","Althair":"staff","Alyssa":"student","Anselm":"staff","Anya":"staff","Aurelian":"student","Baelin":"staff","Bellatrix":"rival","Bianca":"student","Bobby":"other","Bram":"rival","Bruno":"student","Caine":"other","Caralynn":"student","Caspian":"student","Cassius":"rival","Castor":"student","Cedric":"staff","Dante":"student","Dex":"rival","Dorian":"staff","Elion":"rival","Etnie":"student","Ezrel":"staff","Faye":"student","Florian":"student","Gareth":"student","Gavlan":"staff","Hadrian":"student","Hester":"staff","Idris":"student","Ines":"rival","Irene":"student","Kanae":"student","Kira":"rival","Kotaro":"staff","Krieg":"other","Kuroo":"staff","Layla":"staff","Lenna":"student","Linus":"student","Lucius":"rival","Magnus":"staff","Maple":"student","Milena":"other","Mimosa":"staff","Mirelle":"rival","Morgana":"rival","Nerys":"student","Ottavio":"staff","Percival":"student","Pip":"rival","Rei":"staff","Rigel":"student","Royhan":"student","Ruby":"student","Saffi":"student","Sophia":"student","Theodore":"rival","Tilly":"student","Topaz":"student","Tristan":"other","Trixie":"student","Tsubaki":"student","Valentin":"staff","Vallie":"staff","Vera":"student","William":"student","Wren":"student","Yvette":"staff","Zara":"student"};
// 1.3.1 (owner playtest): player settings for training and reputation (data/tuning.json rows; values in $ui.tune, else the default)
const TUNING = [{"id":"prof_pace","opts":[[4,"Slow: 4"],[6,"Normal: 6"],[9,"Fast: 9"]],"def":6},{"id":"trn_session","opts":[[0.5,"0.5%"],[1,"1%"],[2,"2%"],[3,"3%"]],"def":1},{"id":"trn_week","opts":[[1.5,"1.5%"],[2.5,"2.5%"],[5,"5%"],[0,"No limit"]],"def":2.5},{"id":"trn_total","opts":[[50,"+50%"],[100,"+100% (twice the start)"],[200,"+200%"],[0,"No limit"]],"def":100},{"id":"rep_mult","opts":[[0.5,"Slow (x0.5)"],[1,"Standard"],[1.5,"Fast (x1.5)"],[2,"Very fast (x2)"]],"def":1},{"id":"rep_week","opts":[[3,"+3"],[5,"+5"],[10,"+10"],[0,"No limit"]],"def":5},{"id":"rep_bond","opts":[[1,"Until +3"],[2,"Always"],[0,"Off"]],"def":1},{"id":"rep_tension","opts":[[1,"On"],[0,"Off"]],"def":1},{"id":"mood_xp","opts":[[0,"Off"],[1,"1 XP"],[2,"2 XP"]],"def":1},{"id":"mood_tension","opts":[[1,"×1 (no extra)"],[1.5,"×1.5"],[2,"×2"]],"def":1.5},{"id":"mood_apology","opts":[[1,"×1 (no extra)"],[1.5,"×1.5"],[2,"×2"]],"def":1.5},{"id":"tired_training","opts":[[1,"Full gain"],[0.5,"Half"],[0,"None"]],"def":0.5},{"id":"sleep_hour","opts":[[0.05,"5%"],[0.1,"10%"],[0.15,"15%"]],"def":0.1},{"id":"sleep_cap","opts":[[0.2,"20%"],[0.4,"40%"],[0.6,"60%"]],"def":0.4},{"id":"sleep_full","opts":[[4,"4 hours"],[6,"6 hours"],[8,"8 hours"]],"def":6},{"id":"gale_stamina","opts":[[0,"None"],[10,"10 per hour"],[15,"15 per hour"],[25,"25 per hour"]],"def":15},{"id":"mana_regen","opts":[[4,"4 hours"],[6,"6 hours"],[8,"8 hours"],[12,"12 hours"]],"def":6},{"id":"init_rate","opts":[[1,"Rare (at most once a week)"],[2,"Normal (at most twice a week)"],[3,"Often (at most four times a week)"]],"def":2},{"id":"gossip_life","opts":[[10,"10 days"],[21,"3 weeks"],[42,"6 weeks"]],"def":21},{"id":"tension_fade","opts":[[0,"Never"],[0.5,"Slower (×0.5)"],[1,"Standard"],[2,"Faster (×2)"]],"def":1},{"id":"att_minutes","opts":[[20,"20 minutes"],[30,"30 minutes"],[45,"45 minutes"]],"def":30},{"id":"recap_mode","opts":[[1,"Only weeks where something changed"],[2,"Every week"]],"def":1},{"id":"scene_cap","opts":[[3,"3"],[4,"4"],[5,"5"],[6,"6"]],"def":4},{"id":"amb_freq","opts":[[1,"Rare"],[2,"Normal"],[3,"Often"]],"def":2},{"id":"study_tiers","opts":[[1,"Light: 2 / 6 / 12 / 20 h"],[2,"Standard: 4 / 10 / 18 / 28 h"],[3,"Demanding: 6 / 15 / 25 / 40 h"]],"def":2},{"id":"rank_move","opts":[[1,"At most one band"],[2,"At most two bands"]],"def":1},{"id":"fortune_band","opts":[[1,"Gentle: 1-10 fails, 11-35 partial"],[2,"Standard: 1-20 fails, 21-50 partial"],[3,"Harsh: 1-30 fails, 31-65 partial"]],"def":1}];
// 1.10.0 (FP7): lessons with venues per weekday period, teachers ([subject, year]; year 0 = every year), club venues (tools/common.py)
const CLASS = {"tt":{"Mon":[["Magic Theory","M",["lecture halls"],"class"],["History","M",["lecture halls"],"class"],["Practical Magic","M",["combat grounds","sparring pavilion","medical centre"],"class"]],"Tue":[["Dark Magic Defense","D",["lecture halls"],"class"],["Magic Theory","D",["lecture halls"],"class"],["Potion Crafting","M",["potion halls"],"class"]],"Wed":[["Etiquette","M",["lecture halls"],"class"],["Dark Magic Defense","M",["lecture halls"],"class"],["Creature Studies","M",["menagerie","forest"],"class"]],"Thu":[["History","M",["lecture halls"],"class"],["Magic Theory","D",["lecture halls"],"class"],["Practical Magic","M",["combat grounds","sparring pavilion","medical centre"],"class"]],"Fri":[["Magic Theory","M",["lecture halls"],"class"],["Etiquette","M",["lecture halls"],"class"],["Dark Magic Defense","D",["combat grounds","seminar rooms"],"class"]],"Sat":[["Etiquette","M",["lecture halls"],"class"],["Study Hall","",["main library"],"study"],["Clubs","",[],"clubs"]]},"teach":{"Althair":[["Magic Theory",3]],"Anselm":[["Practical Magic",0,"Defense"]],"Anya":[["Etiquette",2]],"Baelin":[["History",2]],"Cedric":[["History",3]],"Dorian":[["Practical Magic",0,"Control"]],"Ezrel":[["Magic Theory",2]],"Gavlan":[["Practical Magic",0,"Attack"]],"Hester":[["Practical Magic",0,"Healing"]],"Kotaro":[["Potion Crafting",2]],"Kuroo":[["Etiquette",1]],"Layla":[["History",1]],"Magnus":[["Practical Magic",0,"Support"]],"Milena":[["Dark Magic Defense",0]],"Mimosa":[["Potion Crafting",1]],"Ottavio":[["Etiquette",3]],"Valentin":[["Potion Crafting",3]],"Vallie":[["Creature Studies",0]],"Yvette":[["Magic Theory",1]]},"clubs":{"Academy Newspaper":["announcement room"],"Alchemy Circle":["potion halls"],"Archery Club":["archery range"],"Basketball Club":["gymnasium"],"Beast Handling Club":["menagerie"],"Board Game Club":["club rooms"],"Brewing Club":["potion halls"],"Calligraphy Club":["club rooms"],"Camping Club":["grassy field and hills"],"Card Club":["club rooms"],"Cooking Club":["canteen"],"Divination Society":["observation tower"],"Drawing Club":["club rooms"],"Festival Committee":["student council chamber"],"Fishing Club":["fishing house"],"Gardening Club":["gardens"],"Groundskeeping":["groundskeeper's lodge"],"Gymnastics Club":["gymnasium"],"Library Assistants":["main library"],"Magic Duelling Club":["combat grounds","sparring pavilion"],"Medical Centre Volunteers":["medical centre"],"Music Club":["club rooms"],"Running Club":["sports field"],"Smithing Club":["workshop"],"Soccer Club":["sports field"],"Specialized Magic Club":["club rooms"],"Student Council":["student council chamber"],"Swimming Club":["gymnasium","swimming pool"],"Tailoring Club":["club rooms"],"Tea Club":["club rooms"],"Theatre Troupe":["club rooms"],"Warding Study Group":["seminar rooms"]},"calias":{"newspaper":"Academy Newspaper","alchemy":"Alchemy Circle","archery":"Archery Club","basketball":"Basketball Club","beast handling":"Beast Handling Club","board game":"Board Game Club","brewing":"Brewing Club","calligraphy":"Calligraphy Club","camping":"Camping Club","card":"Card Club","cooking":"Cooking Club","divination":"Divination Society","drawing":"Drawing Club","festival committee":"Festival Committee","fishing":"Fishing Club","gardening":"Gardening Club","groundskeeping":"Groundskeeping","gymnastics":"Gymnastics Club","library assistants":"Library Assistants","magic duelling club":"Magic Duelling Club","medical centre volunteers":"Medical Centre Volunteers","music":"Music Club","running":"Running Club","smithing":"Smithing Club","soccer":"Soccer Club","specialized magic":"Specialized Magic Club","student council":"Student Council","swimming":"Swimming Club","tailoring":"Tailoring Club","tea":"Tea Club","theatre":"Theatre Troupe","warding study":"Warding Study Group"}};
// 1.47.0 (audit 3.8): the data shared.js whereabouts and presenceAt read (tools/common.py presence_data), for stepHere
const PRESENCE = {"reg":{"the warden's office":["Rei"],"warden's office":["Rei"],"wardens office":["Rei"],"founder's statue and park":["Anselm","Caralynn","Lenna","Nerys","Ruby","Saffi","Trixie"],"founders statue and park":["Anselm","Caralynn","Lenna","Nerys","Ruby","Saffi","Trixie"],"bell tower":["Aiden","Irene"],"lecture halls":["Anya","Cedric","Ezrel","Kuroo","Layla","Milena","Yvette"],"seminar rooms":["Milena","Mimosa","Yvette"],"potion halls":["Kotaro","Mimosa","Royhan","Valentin","Vera"],"combat grounds":["Aurelian","Bruno","Florian","Gareth","Gavlan","Linus","Maple","Sophia","Topaz","Tsubaki"],"faculty offices":["Baelin","Gavlan","Kuroo","Magnus","Valentin","Yvette"],"staff room":["Baelin","Gavlan","Kuroo","Magnus","Valentin","Yvette"],"workshop":["Aiden","Bobby","Dorian","Ezrel","Hadrian","Vera","Yvette","Zara"],"main library":["Anselm","Etnie","Gareth","Irene","Layla","Magnus","William","Wren","Zara"],"archive":["Castor","Cedric","Layla","Linus"],"study rooms":["Gavlan","Irene","Royhan","Vera"],"common rooms":["Anya","Aurelian","Bianca","Bobby","Bruno","Cedric","Etnie","Hadrian","Kanae","Kotaro","Lenna","Linus","Nerys","Percival","Ruby","Topaz","Valentin","Wren"],"canteen":["Anya","Aurelian","Bianca","Bobby","Bruno","Cedric","Etnie","Hadrian","Kanae","Kotaro","Lenna","Linus","Nerys","Percival","Ruby","Topaz","Valentin","Wren"],"laundry":["Percival","Zara"],"bathhouse and washrooms":["Caralynn","Etnie","Saffi"],"storage and lockers":["Aiden","Castor"],"mall":["Aiden","Althair","Caralynn","Dorian","Rigel","Ruby","Trixie","William"],"the mall":["Aiden","Althair","Caralynn","Dorian","Rigel","Ruby","Trixie","William"],"club rooms":["Aiden","Bobby","Caralynn","Ezrel","Florian","Hadrian","Kanae","Kuroo","Ruby","Trixie","William","Wren"],"student council chamber":["Bianca","Caspian","Dante","Florian","Hadrian","Irene","Nerys"],"notice board":["Aiden","Castor","Irene"],"mail tower":["Anselm","Castor","Magnus","Nerys","Royhan","Saffi"],"courtyards":["Althair","Anya","Bianca","Dorian","Trixie","Valentin"],"sports field":["Aurelian","Bianca","Percival","Saffi"],"gymnasium":["Aurelian","Bianca","Percival","Saffi"],"swimming pool":["Aurelian","Bianca","Percival","Saffi"],"archery range":["Aurelian","Bianca","Percival","Saffi"],"grassy field and hills":["Faye","Saffi","Tsubaki"],"forest":["Dante","Lenna","Maple","Nerys","Vallie"],"boathouse and lake":["Aiden","Anya","Milena","Ottavio","Rigel","Sophia","Wren"],"gardens":["Cedric","Idris","Lenna","Maple","Nerys","Royhan","Ruby","Zara"],"menagerie":["Faye","Lenna","Vallie"],"observation tower":["Gareth","Kanae","Tsubaki"],"medical centre":["Anya","Hester","Percival","Sophia","Tilly","Vera"],"commissary":["Caralynn","Idris","Zara"],"groundskeeper's lodge":["Dante","Lenna","Vera"],"groundskeepers lodge":["Dante","Lenna","Vera"],"meditation rooms":["Anselm","Caspian","Faye","Tristan"],"dovecote":["Dante","Krieg","Milena"],"the dovecote":["Dante","Krieg","Milena"],"cathedral":["Anya","Caspian","Percival","Rigel","Tristan"],"the cathedral":["Anya","Caspian","Percival","Rigel","Tristan"],"noble houses liaison":["Caine","Caralynn","Caspian","Florian"],"noble houses' liaison":["Caine","Caralynn","Caspian","Florian"],"the noble houses' liaison":["Caine","Caralynn","Caspian","Florian"],"banking house":["Aiden","Caralynn","Royhan"],"the banking house":["Aiden","Caralynn","Royhan"],"forest clearing":["Baelin","Idris","Lenna","Maple","Royhan"],"rooftop":["Aiden","Alyssa","Rei","William","Zara"],"headmaster's office":["Althair","Baelin","Gavlan","Tristan"],"headmasters office":["Althair","Baelin","Gavlan","Tristan"],"staff quarters":["Gavlan","Hester","Kotaro","Layla","Mimosa","Sophia","Vallie","Yvette"],"fire dormitory":["Aurelian","Bruno","Wren","Yvette"],"light dormitory":["Bianca","Ezrel","Hadrian","Topaz"],"sky dormitory":["Maple","Ottavio","Rigel","William"],"viridian dormitory":["Castor","Faye","Kuroo","Percival"],"announcement room":["Aurelian","Caralynn","Castor","Linus","Ruby"],"sparring pavilion":["Bruno","Caspian","Gavlan","Linus","Sophia","Topaz","Tsubaki","William"],"the sparring pavilion":["Bruno","Caspian","Gavlan","Linus","Sophia","Topaz","Tsubaki","William"],"fishing house":["Aiden","Anya","Milena","Ottavio","Rigel","Sophia","Wren"],"spirit path":["Florian","Royhan","Ruby","William"],"main courtyard":["Althair","Anya","Bianca","Dorian","Trixie","Valentin"]},"stu":{"Aiden":[1,1,"Light"],"Alyssa":[1,1,"Sky"],"Aurelian":[1,3,"Fire"],"Bianca":[1,3,"Light"],"Bruno":[1,3,"Fire"],"Caralynn":[1,1,"Fire"],"Caspian":[3,1,"Viridian"],"Castor":[1,1,"Viridian"],"Dante":[2,1,"Light"],"Etnie":[3,1,"Viridian"],"Faye":[1,3,"Viridian"],"Florian":[2,1,"Sky"],"Gareth":[3,1,"Fire"],"Hadrian":[1,2,"Light"],"Idris":[2,1,"Sky"],"Irene":[3,1,"Light"],"Kanae":[2,1,"Light"],"Lenna":[2,1,"Fire"],"Linus":[1,2,"Viridian"],"Maple":[1,2,"Sky"],"Nerys":[1,2,"Fire"],"Percival":[1,1,"Viridian"],"Rigel":[1,3,"Sky"],"Royhan":[3,1,"Sky"],"Ruby":[3,1,"Sky"],"Saffi":[2,1,"Viridian"],"Sophia":[3,1,"Fire"],"Tilly":[2,1,"Fire"],"Topaz":[1,3,"Light"],"Trixie":[1,1,"Fire"],"Tsubaki":[1,2,"Light"],"Vera":[1,1,"Viridian"],"William":[1,3,"Sky"],"Wren":[1,2,"Fire"],"Zara":[1,1,"Sky"]},"arr":{"Linus":2,"Maple":2,"Nerys":2,"Hadrian":2,"Wren":2,"Tsubaki":2,"Aurelian":3,"William":3,"Bruno":3,"Bianca":3,"Rigel":3,"Topaz":3,"Faye":3},"teach":{"Althair":[["Magic Theory",3]],"Anselm":[["Practical Magic",0,"Defense"]],"Anya":[["Etiquette",2]],"Baelin":[["History",2]],"Cedric":[["History",3]],"Dorian":[["Practical Magic",0,"Control"]],"Ezrel":[["Magic Theory",2]],"Gavlan":[["Practical Magic",0,"Attack"]],"Hester":[["Practical Magic",0,"Healing"]],"Kotaro":[["Potion Crafting",2]],"Kuroo":[["Etiquette",1]],"Layla":[["History",1]],"Magnus":[["Practical Magic",0,"Support"]],"Milena":[["Dark Magic Defense",0]],"Mimosa":[["Potion Crafting",1]],"Ottavio":[["Etiquette",3]],"Valentin":[["Potion Crafting",3]],"Vallie":[["Creature Studies",0]],"Yvette":[["Magic Theory",1]]},"tt":{"Mon":[["Magic Theory","M",["lecture halls"],"class"],["History","M",["lecture halls"],"class"],["Practical Magic","M",["combat grounds","sparring pavilion","medical centre"],"class"]],"Tue":[["Dark Magic Defense","D",["lecture halls"],"class"],["Magic Theory","D",["lecture halls"],"class"],["Potion Crafting","M",["potion halls"],"class"]],"Wed":[["Etiquette","M",["lecture halls"],"class"],["Dark Magic Defense","M",["lecture halls"],"class"],["Creature Studies","M",["menagerie","forest"],"class"]],"Thu":[["History","M",["lecture halls"],"class"],["Magic Theory","D",["lecture halls"],"class"],["Practical Magic","M",["combat grounds","sparring pavilion","medical centre"],"class"]],"Fri":[["Magic Theory","M",["lecture halls"],"class"],["Etiquette","M",["lecture halls"],"class"],["Dark Magic Defense","D",["combat grounds","seminar rooms"],"class"]],"Sat":[["Etiquette","M",["lecture halls"],"class"],["Study Hall","",["main library"],"study"],["Clubs","",[],"clubs"]]},"clubv":{"announcement room":[["Academy Newspaper",["Castor","Linus"],false,false]],"potion halls":[["Alchemy Circle",["Royhan"],false,false],["Brewing Club",[],false,false]],"archery range":[["Archery Club",["Lenna"],true,false]],"gymnasium":[["Basketball Club",["Aurelian"],false,false],["Gymnastics Club",[],false,false],["Swimming Club",["Bianca"],false,false]],"menagerie":[["Beast Handling Club",[],true,false]],"club rooms":[["Board Game Club",["Gareth","William"],false,false],["Calligraphy Club",[],false,false],["Card Club",["Aiden"],false,false],["Drawing Club",["Alyssa"],false,false],["Music Club",["Caralynn","Ruby"],false,false],["Specialized Magic Club",["Hadrian"],false,false],["Tailoring Club",["Zara"],false,false],["Tea Club",["Florian"],false,false],["Theatre Troupe",["Trixie","Ezrel"],false,false]],"grassy field and hills":[["Camping Club",["Faye"],true,false]],"canteen":[["Cooking Club",["Nerys"],false,false]],"observation tower":[["Divination Society",["Kanae"],true,false]],"student council chamber":[["Festival Committee",["Caspian","Rigel"],false,false],["Student Council",[],false,false]],"fishing house":[["Fishing Club",["Ottavio","Wren"],true,true]],"gardens":[["Gardening Club",["Idris","Maple"],true,false]],"groundskeeper's lodge":[["Groundskeeping",["Dante"],false,false]],"main library":[["Library Assistants",["Irene","Tilly"],false,false]],"combat grounds":[["Magic Duelling Club",["Sophia","Tsubaki","Bruno"],false,false]],"sparring pavilion":[["Magic Duelling Club",["Sophia","Tsubaki","Bruno"],false,false]],"medical centre":[["Medical Centre Volunteers",[],false,false]],"sports field":[["Running Club",["Saffi"],true,false],["Soccer Club",["Percival"],true,false]],"workshop":[["Smithing Club",["Vera"],false,false]],"swimming pool":[["Swimming Club",["Bianca"],false,false]],"seminar rooms":[["Warding Study Group",[],false,false]]},"outd":["archery range","boathouse and lake","broken statue","combat grounds","courtyards","fishing house","forest","forest clearing","founder's statue and park","founders statue and park","gardens","grassy field and hills","menagerie","observation tower","rooftop","spirit path","sports field","swimming pool","willow island"],"vn":{"seal chamber":"The Seal Chamber","warden's office":"The Warden's Office","arbiter hall":"The Arbiter Hall","ring dining hall":"The Ring Dining Hall","portrait hall":"Portrait Hall","founder's statue and park":"Founder's Statue and Park","bell tower":"Bell Tower","lecture halls":"Lecture Halls","seminar rooms":"Seminar Rooms","potion halls":"Potion Halls","combat grounds":"Combat Grounds","faculty offices":"Faculty Offices","staff room":"Staff Room","workshop":"Workshop","main library":"Main Library","restricted section":"Restricted Section","archive":"Archive","study rooms":"Study Rooms","common rooms":"Common Rooms","canteen":"Canteen","laundry":"Laundry","bathhouse and washrooms":"Bathhouse and Washrooms","storage and lockers":"Storage and Lockers","mall":"The Mall","club rooms":"Club Rooms","student council chamber":"Student Council Chamber","notice board":"Notice Board","mail tower":"Mail Tower","courtyards":"Courtyards","sports field":"Sports Field","gymnasium":"Gymnasium","swimming pool":"Swimming Pool","archery range":"Archery Range","grassy field and hills":"Grassy Field and Hills","forest":"Forest","boathouse and lake":"Boathouse and Lake","gardens":"Gardens","menagerie":"Menagerie","observation tower":"Observation Tower","medical centre":"Medical Centre","commissary":"Commissary","reception and gatehouse":"Reception and Gatehouse","groundskeeper's lodge":"Groundskeeper's Lodge","detention tower":"Detention Tower","meditation rooms":"Meditation Rooms","dovecote":"The Dovecote","royal inspectorate":"The Royal Inspectorate","cathedral":"The Cathedral","noble houses' liaison":"The Noble Houses' Liaison","banking house":"The Banking House","forest clearing":"Forest Clearing","rooftop":"Rooftop","headmaster's office":"Headmaster's Office","staff quarters":"Staff Quarters","fire dormitory":"Fire Dormitory","light dormitory":"Light Dormitory","sky dormitory":"Sky Dormitory","viridian dormitory":"Viridian Dormitory","old hut":"Old Hut","announcement room":"Announcement Room","broken statue":"Broken Statue","sparring pavilion":"The Sparring Pavilion","fishing house":"Fishing House","willow island":"Willow Island","spirit path":"Spirit Path","nightwell":"Nightwell","merryhew's":"Merryhew's","snug":"The Snug","quillfeather's":"Quillfeather's","pennywhistle curios":"Pennywhistle Curios","barrow & vine":"Barrow & Vine","greenwick's":"Greenwick's","tinker's bench":"The Tinker's Bench","salaffian oven":"The Salaffian Oven","tailor's row":"Tailor's Row"},"rt":{"Irene":[[["Mon","Tue","Wed","Thu","Fri"],960,1140,"main library","Main Library","Library Assistants shift","Mon–Fri 16:00–19:00"],[["Sat"],720,750,"notice board","Notice Board","checks it after the Council meeting","Sat 12:00–12:30"]],"Caspian":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"student council chamber","Student Council Chamber","Festival Committee work","Mon–Fri 16:00–18:00"],[["Fri"],1080,1170,"snug","The Snug","neutral ground for diplomacy","Fri 18:00–19:30"],[["Sun"],540,660,"cathedral","The Cathedral","","Sun 09:00–11:00"]],"Etnie":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"main library","Main Library","upper stacks","Mon–Fri 16:00–18:00"]],"Royhan":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"potion halls","Potion Halls","Alchemy Circle work","Mon–Fri 16:00–18:00"],[["Wed"],1080,1170,"dovecote","The Dovecote","stays late near the Dovecote for Dragonchess","Wed 18:00–19:30"]],"Sophia":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"combat grounds","Combat Grounds","training until someone makes her stop","Mon–Fri 16:00–18:00"],[["Sun"],480,600,"boathouse and lake","Boathouse and Lake","","Sun 08:00–10:00"]],"Gareth":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"combat grounds","Combat Grounds","a booked ring","Mon–Fri 16:00–18:00"],[["Tue","Thu"],1140,1200,"observation tower","Observation Tower","","Tue, Thu 19:00–20:00"]],"Ruby":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"club rooms","Club Rooms","Music Club, at the back with her guitar","Mon–Fri 16:00–18:00"],[["Sat"],960,1080,"mall","The Mall","","Sat 16:00–18:00"]],"Lenna":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"archery range","Archery Range","Archery Club practice","Mon–Fri 16:00–18:00"],[["Sun"],600,840,"forest clearing","Forest Clearing","naps between the Elder Oak's roots","Sun 10:00–14:00"]],"Saffi":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"sports field","Sports Field","Running Club laps","Mon–Fri 16:00–18:00"],[["Sat"],960,1080,"gymnasium","Gymnasium","","Sat 16:00–18:00"]],"Kanae":[[["Mon","Tue","Wed","Thu","Fri"],1140,1200,"observation tower","Observation Tower","Divination Society","Mon–Fri 19:00–20:00"],[["Sun"],960,1080,"boathouse and lake","Boathouse and Lake","still water","Sun 16:00–18:00"]],"Idris":[[["Mon","Wed","Fri"],960,1110,"gardens","Gardens","paid work","Mon, Wed, Fri 16:00–18:30"],[["Sat"],960,1020,"commissary","Commissary","","Sat 16:00–17:00"],[["Sun"],600,780,"forest clearing","Forest Clearing","studying the flowers","Sun 10:00–13:00"]],"Dante":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],1080,1170,"forest","Forest","Groundskeeping at the Forest edge at dusk","Mon–Sun 18:00–19:30"]],"Florian":[[["Mon","Tue","Wed","Thu","Fri"],1080,1200,"sky dormitory","Sky Dormitory","bragging at Loki in the common room most evenings","Mon–Fri 18:00–20:00"],[["Wed"],960,1020,"noble houses' liaison","The Noble Houses' Liaison","tea","Wed 16:00–17:00"],[["Fri"],960,1080,"snug","The Snug","the largest booth","Fri 16:00–18:00"]],"Tilly":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"archive","Archive","","Mon–Fri 16:00–18:00"],[["Mon","Tue","Wed","Thu","Fri"],1110,1170,"forest","Forest","the Forest edge at dusk","Mon–Fri 18:30–19:30"]],"Aiden":[[["Mon","Tue","Wed","Thu","Fri"],720,780,"merryhew's","Merryhew's","","Mon–Fri 12:00–13:00"],[["Sat"],1080,1200,"snug","The Snug","settling bets","Sat 18:00–20:00"],[["Sun","Mon","Tue","Wed","Thu"],1260,1380,"bell tower","Bell Tower","his curfew route","Sun–Thu 21:00–23:00"]],"Caralynn":[[["Mon","Tue","Wed","Thu","Fri"],720,780,"announcement room","Announcement Room","fighting for the broadcast slot","Mon–Fri 12:00–13:00"],[["Mon","Tue","Wed","Thu","Fri"],960,1080,"club rooms","Club Rooms","Music Club rehearsal","Mon–Fri 16:00–18:00"],[["Sun"],840,960,"founder's statue and park","Founder's Statue and Park","to be seen","Sun 14:00–16:00"]],"Zara":[[["Mon","Wed","Fri"],960,1080,"main library","Main Library","shelving work","Mon, Wed, Fri 16:00–18:00"],[["Tue","Thu"],960,1080,"workshop","Workshop","","Tue, Thu 16:00–18:00"]],"Percival":[[["Mon","Tue","Wed","Thu","Fri"],720,780,"canteen","Canteen","the worst Lucky Roll fillings in front of an audience","Mon–Fri 12:00–13:00"],[["Mon","Tue","Wed","Thu","Fri"],960,1080,"sports field","Sports Field","Soccer Club","Mon–Fri 16:00–18:00"]],"Trixie":[[["Mon","Tue","Wed","Thu","Fri"],720,780,"courtyards","Courtyards","a performance nobody asked for","Mon–Fri 12:00–13:00"],[["Mon","Tue","Wed","Thu","Fri"],960,1080,"club rooms","Club Rooms","Theatre Troupe","Mon–Fri 16:00–18:00"],[["Sun"],840,960,"menagerie","Menagerie","the animals","Sun 14:00–16:00"]],"Vera":[[["Mon","Tue","Wed","Thu","Fri"],960,1140,"workshop","Workshop","","Mon–Fri 16:00–19:00"]],"Castor":[[["Mon","Tue","Wed","Thu","Fri"],420,465,"gardens","Gardens","early in the morning","Mon–Fri 07:00–07:45"],[["Mon","Tue","Wed","Thu","Fri"],960,1080,"archive","Archive","newspaper research","Mon–Fri 16:00–18:00"]],"Alyssa":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"study rooms","Study Rooms","","Mon–Fri 16:00–18:00"],[["Mon"],720,780,"mail tower","Mail Tower","letter day","Mon 12:00–13:00"]],"Linus":[[["Mon","Tue","Wed","Thu","Fri"],720,780,"canteen","Canteen","loudly","Mon–Fri 12:00–13:00"],[["Mon","Tue","Wed","Thu","Fri"],960,1080,"sparring pavilion","The Sparring Pavilion","the spectator bench","Mon–Fri 16:00–18:00"]],"Maple":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"gardens","Gardens","Gardening Club","Mon–Fri 16:00–18:00"],[["Sun"],600,780,"forest","Forest","up a tree at the edge","Sun 10:00–13:00"]],"Nerys":[[["Mon","Tue","Wed","Thu","Fri"],1140,1200,"canteen","Canteen","the kitchen's leftovers at closing","Mon–Fri 19:00–20:00"],[["Sun"],600,720,"mail tower","Mail Tower","the pigeons","Sun 10:00–12:00"]],"Hadrian":[[["Mon","Tue","Wed","Thu","Fri"],720,750,"canteen","Canteen","the front of every queue","Mon–Fri 12:00–12:30"],[["Mon","Tue","Wed","Thu","Fri"],960,1080,"club rooms","Club Rooms","Specialized Magic Club","Mon–Fri 16:00–18:00"]],"Wren":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],330,420,"fishing house","Fishing House","the dock at dawn","Mon–Sun 05:30–07:00"],[["Mon","Tue","Wed","Thu","Fri"],1080,1200,"fire dormitory","Fire Dormitory","the common room corner seat","Mon–Fri 18:00–20:00"]],"Tsubaki":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],300,420,"sparring pavilion","The Sparring Pavilion","before dawn every day","Mon–Sun 05:00–07:00"],[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],1200,1320,"observation tower","Observation Tower","the roof under a clear night sky","Mon–Sun 20:00–22:00"]],"Aurelian":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],360,420,"combat grounds","Combat Grounds","at dawn","Mon–Sun 06:00–07:00"],[["Mon","Tue","Wed","Thu","Fri"],960,1080,"gymnasium","Gymnasium","Basketball Club","Mon–Fri 16:00–18:00"]],"William":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],360,420,"sparring pavilion","The Sparring Pavilion","training at dawn","Mon–Sun 06:00–07:00"],[["Mon","Tue","Wed","Thu","Fri"],1110,1170,"rooftop","Rooftop","brooding at dusk","Mon–Fri 18:30–19:30"]],"Bruno":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"sparring pavilion","The Sparring Pavilion","","Mon–Fri 16:00–18:00"],[["Fri"],960,1020,"detention tower","Detention Tower","\"on a regular schedule\"","Fri 16:00–17:00"]],"Bianca":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"swimming pool","Swimming Pool","Swimming Club","Mon–Fri 16:00–18:00"]],"Rigel":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],330,420,"boathouse and lake","Boathouse and Lake","fishing alone at dawn","Mon–Sun 05:30–07:00"],[["Mon","Tue","Wed","Thu","Fri"],720,780,"canteen","Canteen","buying for the whole table","Mon–Fri 12:00–13:00"]],"Topaz":[[["Mon","Tue","Wed","Thu","Fri"],1080,1170,"sparring pavilion","The Sparring Pavilion","practising on her own time","Mon–Fri 18:00–19:30"]],"Faye":[[["Mon","Tue","Wed","Thu","Fri"],1080,1200,"viridian dormitory","Viridian Dormitory","her hammock in the common room","Mon–Fri 18:00–20:00"],[["Sun"],600,840,"grassy field and hills","Grassy Field and Hills","","Sun 10:00–14:00"]],"Baelin":[[["Sun"],420,540,"forest clearing","Forest Clearing","the Elder Oak with Aura on rest-day mornings","Sun 07:00–09:00"],[["Mon","Tue","Wed","Thu","Fri"],780,960,"headmaster's office","Headmaster's Office","","Mon–Fri 13:00–16:00"]],"Althair":[[["Fri"],1080,1200,"snug","The Snug","where his favours surface","Fri 18:00–20:00"]],"Gavlan":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"faculty offices","Faculty Offices","","Mon–Fri 16:00–18:00"],[["Sun"],600,720,"workshop","Workshop","testing counter-spells","Sun 10:00–12:00"]],"Yvette":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"workshop","Workshop","Smithing Club","Mon–Fri 16:00–18:00"],[["Sun"],1080,1260,"staff quarters","Staff Quarters","rest-day evenings with Layla","Sun 18:00–21:00"]],"Layla":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"main library","Main Library","Library Assistants","Mon–Fri 16:00–18:00"],[["Sun"],1080,1260,"staff quarters","Staff Quarters","rest-day evenings with Yvette","Sun 18:00–21:00"]],"Vallie":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"menagerie","Menagerie","her stables","Mon–Fri 16:00–18:00"],[["Sun"],1080,1260,"staff quarters","Staff Quarters","holding court in the parlour","Sun 18:00–21:00"]],"Kuroo":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"staff room","Staff Room","","Mon–Fri 16:00–18:00"],[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],1140,1200,"viridian dormitory","Viridian Dormitory","the common room","Mon–Sun 19:00–20:00"]],"Mimosa":[[["Mon","Tue","Wed","Thu","Fri"],960,1140,"potion halls","Potion Halls","answering notes slid under the cupboard","Mon–Fri 16:00–19:00"]],"Ezrel":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"club rooms","Club Rooms","Theatre Troupe","Mon–Fri 16:00–18:00"],[["Mon","Tue","Wed","Thu","Fri"],1200,1320,"workshop","Workshop","after hours","Mon–Fri 20:00–22:00"]],"Ottavio":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],330,420,"fishing house","Fishing House","the end of the long dock at dawn","Mon–Sun 05:30–07:00"],[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],1140,1320,"sky dormitory","Sky Dormitory","the common room, his door open all night","Mon–Sun 19:00–22:00"]],"Hester":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],1320,1439,"medical centre","Medical Centre","night rounds with her lantern","Mon–Sun 22:00–23:59"],[["Mon","Tue","Wed","Thu","Fri"],960,1020,"gardens","Gardens","her herb garden beside the Medical Centre","Mon–Fri 16:00–17:00"]],"Anselm":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"meditation rooms","Meditation Rooms","","Mon–Fri 16:00–18:00"],[["Sat"],540,600,"mail tower","Mail Tower","his weekly chess move","Sat 09:00–10:00"]],"Magnus":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"faculty offices","Faculty Offices","scouting reports","Mon–Fri 16:00–18:00"],[["Fri"],960,1020,"mail tower","Mail Tower","chess letters","Fri 16:00–17:00"]],"Dorian":[[["Mon","Tue","Wed","Thu","Fri"],720,780,"courtyards","Courtyards","between classes","Mon–Fri 12:00–13:00"],[["Mon","Tue","Wed","Thu","Fri"],1260,1439,"workshop","Workshop","crafting late at night","Mon–Fri 21:00–23:59"]],"Cedric":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],420,450,"canteen","Canteen","at opening for the first bread","Mon–Sun 07:00–07:30"],[["Mon","Tue","Wed","Thu","Fri"],960,1080,"gardens","Gardens","his row","Mon–Fri 16:00–18:00"],[["Sun"],600,720,"archive","Archive","the fragile documents","Sun 10:00–12:00"]],"Anya":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],1080,1170,"boathouse and lake","Boathouse and Lake","the Lake at dusk","Mon–Sun 18:00–19:30"],[["Sun"],600,720,"cathedral","The Cathedral","the burial registers","Sun 10:00–12:00"]],"Kotaro":[[["Mon","Tue","Wed","Thu","Fri"],780,900,"potion halls","Potion Halls","asleep in the storeroom","Mon–Fri 13:00–15:00"],[["Sun"],1080,1320,"staff quarters","Staff Quarters","the parlour","Sun 18:00–22:00"]],"Valentin":[[["Mon"],480,510,"potion halls","Potion Halls","rewriting the ranking board","Mon 08:00–08:30"],[["Mon","Tue","Wed","Thu","Fri"],720,780,"canteen","Canteen","peak hours","Mon–Fri 12:00–13:00"]],"Bobby":[[["Mon","Tue","Wed","Thu","Fri"],480,720,"workshop","Workshop","","Mon–Fri 08:00–12:00"],[["Mon","Tue","Wed","Thu","Fri"],720,780,"canteen","Canteen","his break","Mon–Fri 12:00–13:00"]],"Krieg":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],480,720,"dovecote","The Dovecote","","Mon–Sun 08:00–12:00"],[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],1200,1320,"forest","Forest","the Forest edge after curfew","Mon–Sun 20:00–22:00"]],"Milena":[[["Mon","Tue","Wed","Thu","Fri"],960,1080,"combat grounds","Combat Grounds","","Mon–Fri 16:00–18:00"],[["Wed"],1080,1170,"dovecote","The Dovecote","","Wed 18:00–19:30"]],"Rei":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],480,720,"seal chamber","The Seal Chamber","maintaining the seal","Mon–Sun 08:00–12:00"],[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],1140,1260,"warden's office","The Warden's Office","the mana ledgers","Mon–Sun 19:00–21:00"]],"Tristan":[[["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],360,420,"meditation rooms","Meditation Rooms","","Mon–Sun 06:00–07:00"],[["Mon","Tue","Wed","Thu","Fri","Sat"],1020,1140,"cathedral","The Cathedral","confessions","Mon–Sat 17:00–19:00"],[["Sun"],540,660,"cathedral","The Cathedral","the service","Sun 09:00–11:00"]],"Caine":[[["Mon","Tue","Wed","Thu","Fri"],540,600,"mail tower","Mail Tower","the Liaison's errands","Mon–Fri 09:00–10:00"]]},"rate":70};
const SAY = {"n":12,"start":{"Aiden":[9,8,5],"Althair":[0,11,9],"Alyssa":[10,8,3],"Anselm":[8,10,9],"Anya":[2,3,7],"Aurelian":[5,4,3],"Baelin":[2,3,7],"Bellatrix":[0,4,10],"Bianca":[6,8,5],"Bobby":[3,2,10],"Bram":[0,8,4],"Bruno":[7,8,4],"Caine":[3,11,2],"Caralynn":[0,10,11],"Caspian":[2,11,3],"Cassius":[6,5,11],"Castor":[11,8,3],"Cedric":[11,10,3],"Dante":[1,5,11],"Dex":[11,1,4],"Dorian":[7,6,0],"Elion":[0,8,10],"Etnie":[10,11,9],"Ezrel":[1,2,11],"Faye":[5,8,3],"Florian":[6,5,11],"Gareth":[9,3,10],"Gavlan":[6,3,0],"Hadrian":[3,5,11],"Hester":[5,3,9],"Idris":[2,3,0],"Ines":[6,5,10],"Irene":[4,5,10],"Kanae":[7,5,11],"Kira":[9,11,4],"Kotaro":[4,3,2],"Krieg":[9,7,3],"Kuroo":[4,5,7],"Layla":[7,9,2],"Lenna":[8,5,11],"Linus":[7,0,9],"Lucius":[9,5,10],"Magnus":[1,10,3],"Maple":[1,8,9],"Milena":[5,3,7],"Mimosa":[10,9,7],"Mirelle":[6,11,4],"Morgana":[9,11,5],"Nerys":[4,5,3],"Ottavio":[11,6,3],"Percival":[8,6,11],"Pip":[8,4,10],"Rei":[6,3,5],"Rigel":[9,8,10],"Royhan":[8,11,0],"Ruby":[7,3,6],"Saffi":[4,3,11],"Sophia":[1,3,2],"Theodore":[5,11,4],"Tilly":[10,11,3],"Topaz":[2,8,4],"Tristan":[4,10,5],"Trixie":[6,8,7],"Tsubaki":[10,11,0],"Valentin":[5,3,7],"Vallie":[10,3,11],"Vera":[1,10,2],"William":[11,3,10],"Wren":[2,3,4],"Yvette":[8,9,6],"Zara":[4,5,3]},"dist":[[0.0,12.3,24.8,33.6,31.6,32.6,30.8,26.5,22.5,20.9,11.0,15.0],[12.3,0.0,12.5,21.9,23.0,23.2,25.8,26.6,20.8,24.5,18.7,11.5],[24.8,12.5,0.0,11.0,18.7,17.7,26.2,32.0,26.0,32.9,30.0,18.8],[33.6,21.9,11.0,0.0,13.3,14.1,25.3,34.0,30.0,38.3,38.1,26.5],[31.6,23.0,18.7,13.3,0.0,13.7,18.9,26.2,26.3,33.4,35.6,26.6],[32.6,23.2,17.7,14.1,13.7,0.0,12.5,23.2,19.8,29.1,33.1,21.5],[30.8,25.8,26.2,25.3,18.9,12.5,0.0,11.8,12.6,20.5,28.4,20.5],[26.5,26.6,32.0,34.0,26.2,23.2,11.8,0.0,10.3,11.8,21.9,20.1],[22.5,20.8,26.0,30.0,26.3,19.8,12.6,10.3,0.0,9.7,17.1,11.4],[20.9,24.5,32.9,38.3,33.4,29.1,20.5,11.8,9.7,0.0,12.4,15.6],[11.0,18.7,30.0,38.1,35.6,33.1,28.4,21.9,17.1,12.4,0.0,13.2],[15.0,11.5,18.8,26.5,26.6,21.5,20.5,20.1,11.4,15.6,13.2,0.0]]};   // 1.37.1: dialogue colours (data/dialogue_colors.json)
// 1.10.2 (FP11): why an NPC seeks {{user}} out: templates per Tension category, each NPC's category and club (data/initiative_asks.json)
const INIT_ASKS = {"asks":{"withdrawn":["leaves {{user}} a short note asking to meet at {place}, where it is quiet","wants {{user}}'s company at {place} without having to explain why","found {thing} and wants to show {{user}}, and only {{user}}","asks, awkwardly, whether {{user}} is going to {event}","needs a hand with something at {place} and would rather ask {{user}} than anyone else","wants {{user}} to sit with them at the {club} for once","waits for {{user}} at {place} and pretends it is by chance"],"social":["wants {{user}} to come along to {place}","has news and wants {{user}} to hear it first","wants to share {thing} with {{user}}","is rounding people up for {event} and wants {{user}} along","wants {{user}} to drop by the {club} and meet everyone","wants {{user}}'s opinion on something, and {place} is where to give it","wants {{user}} to help pick something at {place}","saved {{user}} a seat at {place}"],"confrontational":["wants a proper challenge from {{user}} at {place}","comes to complain to {{user}} about something, then stays","wants a training partner who can keep up and picks {{user}}","drags {{user}} to the {club} because nobody else will do","wants to settle a small argument with {{user}} before {event}","has an opinion about {thing} and needs {{user}} to hear it"],"authority":["asks {{user}} to stop by {place} after classes","has a small task for {{user}} at {place}","wants to know how {{user}} is getting on, in their own way","mentions {event} and asks whether {{user}} is ready","wants a word with {{user}} about the {club}"],"dangerous":["wants something from {{user}} and chooses {place} to ask for it","offers {{user}} a deal, at {place}","tests {{user}} with a question that is not quite a question","knows something about {event} and lets {{user}} notice"],"strained":["has something to say to {{user}} and will not wait","wants to clear the air with {{user}}, on their own terms, at {place}","is looking for {{user}} to ask a pointed question","turns up where {{user}} is, clearly still annoyed"]},"cat":{"Ruby":"withdrawn","Zara":"withdrawn","Mimosa":"withdrawn","Royhan":"withdrawn","Alyssa":"withdrawn","Vera":"withdrawn","Trixie":"withdrawn","Tilly":"withdrawn","Lenna":"withdrawn","Caralynn":"social","Florian":"social","Aiden":"social","Idris":"social","Bobby":"social","Milena":"social","Sophia":"confrontational","Percival":"confrontational","Saffi":"confrontational","Vallie":"confrontational","Irene":"authority","Caspian":"authority","Baelin":"authority","Yvette":"authority","Gavlan":"authority","Layla":"authority","Kuroo":"authority","Ottavio":"authority","Rei":"authority","Krieg":"dangerous","Caine":"dangerous","Tristan":"dangerous","Castor":"dangerous","Dante":"dangerous","Gareth":"dangerous","Linus":"social","Maple":"withdrawn","Nerys":"social","Hadrian":"social","Wren":"withdrawn","Tsubaki":"confrontational","Hester":"authority","Anselm":"authority","Magnus":"authority","Dorian":"social","Cedric":"authority","Anya":"authority","Kotaro":"withdrawn","Valentin":"dangerous","Aurelian":"social","William":"social","Bruno":"confrontational","Bianca":"social","Rigel":"social","Topaz":"social","Faye":"social"},"club":{"Castor":"Academy Newspaper","Linus":"Academy Newspaper","Royhan":"Alchemy Circle","Lenna":"Archery Club","Aurelian":"Basketball Club","Gareth":"Board Game Club","William":"Board Game Club","Faye":"Camping Club","Aiden":"Card Club","Nerys":"Cooking Club","Kanae":"Divination Society","Alyssa":"Drawing Club","Caspian":"Festival Committee","Rigel":"Festival Committee","Ottavio":"Fishing Club","Wren":"Fishing Club","Idris":"Gardening Club","Maple":"Gardening Club","Dante":"Groundskeeping","Irene":"Library Assistants","Tilly":"Library Assistants","Sophia":"Magic Duelling Club","Tsubaki":"Magic Duelling Club","Bruno":"Magic Duelling Club","Caralynn":"Music Club","Ruby":"Music Club","Saffi":"Running Club","Vera":"Smithing Club","Percival":"Soccer Club","Hadrian":"Specialized Magic Club","Bianca":"Swimming Club","Zara":"Tailoring Club","Florian":"Tea Club","Trixie":"Theatre Troupe","Ezrel":"Theatre Troupe"},"places":["the Canteen","the Gardens","The Mall","the Main Courtyard","the Boathouse and Lake","the Grassy Field and Hills","the Study Rooms"],"fav":{"rate":0.3,"per_week":2,"due_days":2,"ignored_tension":5,"asks":{"withdrawn":["asks, quietly, whether {{user}} could bring them a {thing} from the shops; they would rather not go themselves","asks {{user}} to keep them company at {place}, for something they do not want to face alone"],"social":["asks {{user}} to pick up a {thing} for them; they will not have time to get there","asks {{user}} to come to {place} and help them set something up"],"confrontational":["wants {{user}} at {place} to hold the line while they try something new","asks {{user}} to fetch a {thing}, as if it were nothing, and clearly means it"],"authority":["asks {{user}} to lend a hand at {place}, as a favour rather than a duty","asks {{user}} to bring a {thing} by, if it is no trouble"],"dangerous":["asks {{user}} to bring them a {thing}, and does not say what for","wants {{user}} at {place}, and promises it will be worth their while"]}}};
// 1.49.0 (feature batch 1, audit 4.6): favours an NPC who seeks {{user}} out may ask (data/initiative_asks.json favours)
const FAVOURS = INIT_ASKS.fav || {};
function tuneOf(S) {
  const u = _.isPlainObject((S.$ui || {}).tune) ? S.$ui.tune : {}, o = {};
  for (const r of TUNING) { const v = Number(u[r.id]); o[r.id] = r.opts.some(([x]) => x === v) ? v : r.def; }
  return o;
}
const NO_BOND = new Set(Object.keys(NPC_GROUP).filter(id => NPC_GROUP[id] === 'rival'));
const MASK = new Set(REW.mask || []);
// 1.3.8 Tension (owner design 2026-09-25, data/tension.json): the same bands and mechanical effects for everyone; how the tension
// is played comes from the NPC's category (withdrawn, social, confrontational, authority, dangerous) or a personal override
// (Etnie, Kanae, Althair, Ezrel). Quiet days ease it by the category's decay; a fight eases a confrontational NPC.
const TEN = {"bands":[[0,"Calm"],[20,"Friction"],[40,"Strained"],[70,"Hostile"],[90,"Enemy"]],"effects":{"strained_from":40,"strained_xp_mult":0.5,"hold_event_from":70,"stop_xp_from":90,"rank_drop_at":100,"fight_ease":25,"apology_repeat_mult":0.5,"rank_drop_rearm":70},"categories":{"withdrawn":{"name":"Withdrawn","bands":{"Friction":"quieter than usual around {{user}}; answers short, smiles late","Strained":"avoids {{user}}: leaves when {{user}} arrives, declines invitations politely, confides in someone else","Hostile":"openly hurt: cries or goes silent, asks {{user}} to leave them alone; their friends notice and cool toward {{user}}","Enemy":"cuts {{user}} out entirely (seats, study groups, even routes across campus) and grieves the friendship; does not retaliate"},"never":"revenge, rumours or any harm","eases":"forgives easily: a sincere apology eases it a lot","decay":2,"apology":{"private":-20,"public":-20},"kind_ease":{"help":-5,"keep":-5,"defend":-5},"banter":"light teasing is fine; mockery of what they care about, or rough play, hurts"},"social":{"name":"Social","bands":{"Friction":"barbed compliments and pointed jokes at {{user}}'s expense","Strained":"snubs {{user}} in public; leaves {{user}} out of plans and the good gossip","Hostile":"works the room against {{user}}: rumours, mockery, turning mutual friends","Enemy":"runs a campaign: humiliates {{user}} in front of a crowd and makes sure the story spreads"},"never":"physical violence, or anything that would ruin their own image if it came out","eases":"pride first: a public apology counts, a private one barely","decay":0.5,"enemy_rep":{"Student":-5},"apology":{"private":-5,"public":-15},"kind_ease":{"defend_public":-5},"banter":"enjoys witty banter in private; being mocked in public is an offence"},"confrontational":{"name":"Confrontational","bands":{"Friction":"blunt and challenging: calls {{user}} out, dares {{user}} to prove it","Strained":"picks arguments; demands a spar or a contest to settle it","Hostile":"open rivalry: goes after {{user}} in class, in training, in competitions","Enemy":"a formal challenge or a grudge match in front of witnesses; will not let it rest until it is settled"},"never":"an ambush, secret sabotage, or trying to kill","eases":"words are cheap: a fight settles it (every spar, duel or contest with them, whoever wins; report it as a fight interaction); an apology barely counts","decay":0.34,"apology":{"private":-5,"public":-5},"kind_ease":{},"banter":"loves it, shoves included: people who hit back are the best kind"},"authority":{"name":"Authority","bands":{"Friction":"cooler and more formal with {{user}}; watches for mistakes","Strained":"holds {{user}} strictly to the rules: marks down, refuses favours, catches every lateness","Hostile":"uses the office: detention, reports to the Dorm Head, requests denied, a word with other staff","Enemy":"formal action: a disciplinary hearing, a letter home, pushing for probation"},"never":"anything outside their authority: no personal violence, no lies on the record","eases":"an apology is accepted formally; visible good conduct and hard work count more","decay":1,"apology":{"private":-10,"public":-10},"kind_ease":{"help":-3,"keep":-3,"defend":-3},"banter":"tolerates light teasing from those they trust (Trust 65+); horseplay and mockery are offences"},"dangerous":{"name":"Dangerous","bands":{"Friction":"polite and attentive: remembers {{user}}'s name and asks one question too many","Strained":"watches {{user}}: questions friends, checks {{user}}'s record, leaves small reminders of their reach","Hostile":"moves against {{user}} quietly: leverage, pressure on the people around {{user}}, an investigation opened","Enemy":"strikes with everything their position allows"},"never":"anything that would bring down their own position; no random cruelty","eases":"holds a grudge: an apology changes nothing; only a real service, a bargain, or something they need","decay":0,"apology":{"private":0,"public":0},"kind_ease":{},"banter":"nobody teases them; it is an offence unless they started it"}},"npcs":{"Ruby":"withdrawn","Zara":"withdrawn","Mimosa":"withdrawn","Royhan":"withdrawn","Alyssa":"withdrawn","Vera":"withdrawn","Trixie":"withdrawn","Tilly":"withdrawn","Lenna":"withdrawn","Caralynn":"social","Florian":"social","Aiden":"social","Idris":"social","Bobby":"social","Milena":"social","Sophia":"confrontational","Percival":"confrontational","Saffi":"confrontational","Vallie":"confrontational","Irene":"authority","Caspian":"authority","Baelin":"authority","Yvette":"authority","Gavlan":"authority","Layla":"authority","Kuroo":"authority","Ottavio":"authority","Rei":"authority","Krieg":"dangerous","Caine":"dangerous","Tristan":"dangerous","Castor":"dangerous","Dante":"dangerous","Gareth":"dangerous","Linus":"social","Maple":"withdrawn","Nerys":"social","Hadrian":"social","Wren":"withdrawn","Tsubaki":"confrontational","Hester":"authority","Anselm":"authority","Magnus":"authority","Dorian":"social","Cedric":"authority","Anya":"authority","Kotaro":"withdrawn","Valentin":"dangerous","Aurelian":"social","William":"social","Bruno":"confrontational","Bianca":"social","Rigel":"social","Topaz":"social","Faye":"social"},"peaks":{"Krieg":"a Dovecote examination or an arrest on a pretext","Caine":"every door the Noble Houses control closes to {{user}}, and {{user}} is quietly noted for the Choir","Tristan":"a binding oath or a debt in his registry is called due","Castor":"misfortune follows {{user}}: a curse worked through something taken from them, never traced to him","Dante":"judges {{user}} a wrongdoer: the warmth goes out for good; he gathers proof for the Doves and is merciless once he has it","Gareth":"files it away behind the smile: {{user}}'s standing is sabotaged (a ruined casting, a lost place), never traceable, while he stays warm to {{user}}'s face","Valentin":"{{user}}'s name comes off his board for good, and every door he can close in potion-making closes: suppliers, recommendations, a word in the right ear at court"},"overrides":{"Etnie":{"name":"Devoted","bands":{"Friction":"clingier and anxious, checking {{user}}'s mood every few minutes","Strained":"follows {{user}}'s scent everywhere; jealous of anyone near {{user}}","Hostile":"breaks down: clones appear when she panics; she begs rather than argues","Enemy":"a crisis like the one after the breach: she stops eating and attending class; Kuroo steps in"},"never":"harming {{user}} or leaving {{user}}","eases":"one warm moment with {{user}} eases it a lot","decay":2,"apology":{"private":-25,"public":-25},"kind_ease":{"help":-5,"keep":-5,"defend":-5},"banter":"any attention from {{user}} is a gift, teasing included"},"Kanae":{"name":"Devoted (mask)","exempt":true,"bands":{"Friction":"sweeter than ever, the smile held a beat too long; she blames whoever came between them, never {{user}}","Strained":"clings through kindness: small gifts, and readings that warn {{user}} about the people involved","Hostile":"turns her displeasure on the people around {{user}}: rumours about them, rigged readings, quiet damage to their friendships with {{user}}","Enemy":"her plan to isolate {{user}} moves openly: {{user}}'s other bonds are poisoned one by one while she stays the one who never leaves"},"never":"turning on {{user}}; her affection for {{user}} never lessens","eases":"{{user}}'s attention eases it quickly","decay":2,"apology":{"private":-20,"public":-20},"kind_ease":{"help":-5,"keep":-5,"defend":-5},"banter":"sweet about it, but notes who else {{user}} jokes with"},"Althair":{"name":"Delighted","lock":true,"convert":0.5,"daily_cap":10,"text":"Althair enjoys being disliked: hostility from {{user}} delights him and draws him closer. His Tension stays 0; the engine turns every rise into bond XP. React in character: beaming, curious, friendlier the ruder {{user}} is.","kind_ease":{},"banter":"delighted: the ruder, the better"},"Ezrel":{"name":"Apathetic","rise_mult":0.5,"bands":{"Friction":"does not care, pleasantly","Strained":"does not care, pleasantly; does the minimum for {{user}}","Hostile":"does not care, pleasantly; stops going out of his way for {{user}}","Enemy":"stops helping {{user}} at all, pleasantly and completely"},"never":"drama, raised voices or revenge","eases":"only time; apologies change nothing","decay":1,"apology":{"private":0,"public":0},"kind_ease":{},"banter":"does not notice"},"Rigel":{"name":"Forgiving, for a price","bands":{"Friction":"forgives {{user}} warmly on the spot, then asks, just as warmly, when they will pay the Ardenne price","Strained":"keeps forgiving and keeps reminding; writes the debt in his ledger in front of {{user}} and offers an Oath to settle it","Hostile":"hurt and baffled that a friend will not pay; very polite, stops buying for {{user}}, and writes home about it","Enemy":"strikes {{user}} from the ledger; perfectly courteous in public, and tells Bella, who remembers at the Kingdom Competition"},"never":"taking the price himself, or hurting {{user}} with his own hands","eases":"a kept promise or a sincere Oath eases it a lot; a paid price would end it at once, and nobody pays","decay":1,"apology":{"private":-5,"public":-5},"kind_ease":{"defend_public":-5},"banter":"teasing delights him; he rarely notices it is teasing and answers literally"},"Topaz":{"name":"Rival (clingy)","bands":{"Friction":"challenges {{user}} more often and sulks between challenges; turns up anyway","Strained":"follows {{user}} everywhere \"to study them\"; loudly challenges anyone else who takes their time","Hostile":"a formal written challenge; if {{user}} refuses, she shadows them for days, silent and hurt, and trains until the Medical Centre sends her to bed","Enemy":"announces in front of everyone that {{user}} is no longer her rival, then still appears wherever they are, pretending not to look"},"never":"cheating, sabotage, or truly leaving {{user}}","eases":"{{user}} accepting a challenge, or calling her their rival, eases it a lot","decay":2,"apology":{"private":-20,"public":-25},"kind_ease":{"defend_public":-5},"banter":"teasing is a challenge accepted; she fires straight back, red-eared"}},"krieg":{"at":100,"attention":10,"doves_xp":-40},"apology_npc":{"Sophia":{"private":10,"public":10,"note":"an apology only makes her angrier: she despises cowards; only a fight settles it"}},"offence":{"_note":"1.59.0 (narrator-load audit U8, owner-approved 2026-10-04): the narrator reports an offence as an interaction {With, Kind: 'offence', Weight} and the engine draws the Tension rise from these ranges (rollInt, seeded), then applies the character's multipliers as for a written rise. Every offence counts and several add up (rises are never capped); a rise the narrator also wrote directly is not added twice (the larger one counts). The ranges are the 1.55.0 rule card's numbers: slight = a slight or a sharp word; insult = an insult, a humiliation or a broken promise; violence = a punch or a spell against them; jealous = flirting with someone else in front of a romantic partner.","weights":{"slight":[3,5],"jealous":[5,10],"insult":[10,15],"violence":[20,30]}}};
const TE = TEN.effects || {};
const OFFENCE = TEN.offence || {};   // 1.59.0 (U8)
function tensionProfile(id) {
  const o = (TEN.overrides || {})[id];
  if (o) return { ...o, cat: 'override', decay: num(o.decay, 0), riseMult: o.rise_mult || 1 };
  const c = (TEN.npcs || {})[id], C = (TEN.categories || {})[c];
  return C ? { ...C, cat: c, riseMult: 1 } : { cat: '', decay: 0, riseMult: 1 };
}
// 1.4.3 Trust (owner design 2026-09-25, data/trust.json): how sure an NPC is that {{user}} can be relied on. The same bands and
// effects for everyone (what they share, rank benefits, XP, how Tension and apologies land); the category
// (the NPC's openness) sets the start, how fast it rises and falls and whether it recovers; personal overrides (Etnie, Kanae,
// Althair, Ezrel, Caine, Krieg), and a Dorm Head is easier on their own students (Ottavio and Sky).
const TRU = {"bands":[[0,"Betrayed"],[15,"Doubtful"],[35,"Neutral"],[65,"Trusting"],[85,"Confidant"]],"effects":{"share":{"Betrayed":null,"Doubtful":-1,"Neutral":0,"Trusting":1,"Confidant":2},"confidant_real_early":1,"betrayed_xp_mult":0.5,"small_tension_max":15,"confidant_small_tension_mult":0.5,"betrayed_tension_mult":1.5,"apology_mult":{"Betrayed":0,"Doubtful":0.5,"Neutral":1,"Trusting":1.5,"Confidant":1.5}},"perk_gates":{"6":35,"7":50,"8":50,"9":65,"10":65},"suspend_r10_below":35,"kinds":{"keep":4,"secret":6,"defend":5,"confide":3,"help":2},"public_mult":{"defend":1.5},"rank_up":3,"weekly_cap":8,"floor":35,"spread":{"at":20,"friends":-5},"categories":{"open":{"name":"Open","start":60,"rise":1.5,"drop":1,"recover":3,"bands":{"Doubtful":"still friendly on the surface, but checks what {{user}} says against others and no longer shares anything important","Betrayed":"openly hurt and bewildered; tells friends what {{user}} did, because they cannot understand it","Confidant":"tells {{user}} everything, often too much; takes {{user}}'s word over anyone's"},"never":"holding a grudge in secret or plotting against {{user}}","understood":0.5},"normal":{"name":"Normal","start":50,"rise":1,"drop":1,"recover":2,"bands":{"Doubtful":"polite but careful: keeps plans vague, asks for things in writing, does not lend or cover","Betrayed":"cold and formal; answers only what they must and keeps their distance","Confidant":"relies on {{user}} and says so; asks {{user}}'s opinion before anyone else's"},"never":"pretending nothing happened","understood":0.33},"guarded":{"name":"Guarded","start":40,"rise":0.75,"drop":1.25,"recover":1,"bands":{"Doubtful":"says nothing personal; watches {{user}}'s hands, not {{user}}'s face; tests {{user}} with small things","Betrayed":"closes completely: {{user}} becomes one more person they were right not to trust","Confidant":"lets the guard down only with {{user}}: a rare, quiet honesty that others never see"},"never":"giving a second chance cheaply","understood":0.25},"closed":{"name":"Closed","start":30,"rise":0.5,"drop":1.5,"recover":0,"bands":{"Doubtful":"assumes {{user}} wants something; every kindness is weighed for its price","Betrayed":"files {{user}} as a threat and acts on it, within their position and nature","Confidant":"treats {{user}} as the one exception to a lifelong rule; would deny it if asked"},"never":"saying out loud that they trust {{user}}","understood":0}},"overrides":{"Etnie":{"floor_hard":50,"overflow_to_tension":true,"no_gates":true,"text":"Etnie cannot stop trusting her \"little sibling\": her Trust never falls below 50 and her perks never wait on it; a betrayal wounds her instead (the engine turns the rest of the drop into Tension)."},"Kanae":{"kind_extra":{"choose":3},"kind_mult":{"choose":2},"floor_hidden":15,"until_secret":true,"text":"Kanae's trust feeds on {{user}} pulling away from others for her: when {{user}} turns someone down or distances themselves from a friend for her, report {\"With\": \"Kanae\", \"Kind\": \"choose\"}. While her Plan is hidden she never counts {{user}} as a betrayer."},"Althair":{"lock":50,"convert":0.5,"no_gates":true,"text":"Althair trusts no one and needs no one's trust: his Trust stays 50 and his perks never wait on it; betraying him only entertains him (the engine turns it into bond XP)."},"Ezrel":{"rise":0.5,"drop":0.5},"Caine":{"cap":64,"until_secret":true,"text":"Caine despises mages, {{user}} included: his Trust cannot pass 64 until his own secret has come out and {{user}} still treats him the same."},"Krieg":{"zero_at_stage":"Exposed"},"Topaz":{"kind_extra":{"challenge":3},"text":"Topaz's trust grows when {{user}} takes her seriously: accepting her challenge and giving it their all → report {\"With\": \"Topaz\", \"Kind\": \"challenge\"}. Losing to {{user}} never lowers it; letting her win on purpose, once she notices, is a betrayal."}},"dorm_head":{"Ottavio":{"dorm":"Sky","category":"open","bond_xp_mult":1.5,"tension_rise_mult":0.5,"tension_decay_mult":2,"apology_mult":2,"text":"{{user}} is one of Ottavio's Sky students: he forgives them faster, trusts them sooner, and it shows."}},"understood_days":30,"letdown":{"_note":"1.59.0 (narrator-load audit U8, owner-approved 2026-10-04): the narrator reports a letdown as an interaction {With, Kind: 'letdown', Weight, Meant} and the engine draws the Trust drop from these ranges (rollInt, seeded), then applies the category's drop as for a written drop. Every letdown counts (no cap); a drop the narrator also wrote directly is not added twice (the larger one counts). The ranges are the 1.55.0 rule card's numbers. Meant: '' = meant it; 'no_harm' = carelessness or good intent (a real try that failed, a slipped secret, a lie to protect them or for a surprise, a clash of promises after a warning); 'forced' = they know {{user}} had no choice: no drop.","weights":{"small":[3,5],"broken":[10,15],"secret_told":[20,20],"betrayal":[25,40]},"no_harm":{"small":[0,3],"broken":[3,5],"secret_told":[8,10],"betrayal":[8,10]}},"npcs":{"Irene":"guarded","Caspian":"normal","Etnie":"open","Royhan":"normal","Lenna":"guarded","Saffi":"open","Kanae":"guarded","Idris":"guarded","Aiden":"open","Caralynn":"open","Zara":"guarded","Gavlan":"guarded","Yvette":"guarded","Krieg":"closed","Milena":"normal","Baelin":"guarded","Layla":"open","Vallie":"open","Percival":"open","Sophia":"guarded","Rei":"guarded","Kuroo":"normal","Mimosa":"closed","Gareth":"normal","Trixie":"open","Vera":"open","Tristan":"guarded","Althair":"open","Dante":"open","Castor":"guarded","Ruby":"open","Florian":"open","Alyssa":"normal","Tilly":"open","Ezrel":"normal","Ottavio":"closed","Caine":"closed","Bobby":"open","Linus":"open","Maple":"normal","Nerys":"normal","Hadrian":"open","Wren":"normal","Tsubaki":"open","Hester":"open","Anselm":"normal","Magnus":"normal","Dorian":"open","Cedric":"normal","Anya":"guarded","Kotaro":"open","Valentin":"normal","Aurelian":"open","William":"open","Bruno":"normal","Bianca":"open","Rigel":"open","Topaz":"open","Faye":"open"},"friends":{"Aiden":["Bobby","Dorian","Linus","Sophia"],"Alyssa":["Milena","Wren","Zara"],"Anselm":["Cedric","Layla"],"Anya":["Cedric","Tristan"],"Aurelian":["Bruno","Percival"],"Baelin":["Gavlan"],"Bianca":["Linus","Rigel"],"Bobby":["Aiden","Layla"],"Bruno":["Aurelian","Faye","Topaz","William"],"Caspian":["Florian","Irene","Ruby"],"Castor":["Linus","Ruby"],"Cedric":["Anselm","Anya","Layla"],"Dorian":["Aiden"],"Faye":["Bruno","Rigel","Topaz","Tsubaki"],"Florian":["Caspian"],"Gavlan":["Baelin","Kotaro","Royhan"],"Hadrian":["Percival"],"Hester":["Mimosa","Tilly","Vallie"],"Idris":["Royhan","Ruby","Zara"],"Irene":["Caspian"],"Kotaro":["Gavlan","Mimosa","Valentin","Vallie"],"Kuroo":["Ottavio","Rei"],"Layla":["Anselm","Bobby","Cedric","Yvette"],"Lenna":["Saffi"],"Linus":["Aiden","Bianca","Castor","Maple","Percival","William","Wren"],"Maple":["Linus","Nerys","Tsubaki","Wren","Zara"],"Milena":["Alyssa","Ottavio","Royhan"],"Mimosa":["Hester","Kotaro"],"Nerys":["Maple","Percival","Trixie","Tsubaki"],"Ottavio":["Kuroo","Milena"],"Percival":["Aurelian","Hadrian","Linus","Nerys","Saffi","Tilly","Tsubaki","Wren"],"Rei":["Kuroo","Vallie"],"Rigel":["Bianca","Faye","Tristan","William","Wren"],"Royhan":["Gavlan","Idris","Milena","Ruby","Vera","Zara"],"Ruby":["Caspian","Castor","Idris","Royhan","Zara"],"Saffi":["Lenna","Percival"],"Sophia":["Aiden"],"Tilly":["Hester","Percival"],"Topaz":["Bruno","Faye"],"Tristan":["Anya","Rigel"],"Trixie":["Nerys","Wren"],"Tsubaki":["Faye","Maple","Nerys","Percival","Wren"],"Valentin":["Kotaro"],"Vallie":["Hester","Kotaro","Rei"],"Vera":["Royhan","Zara"],"William":["Bruno","Linus","Rigel"],"Wren":["Alyssa","Linus","Maple","Percival","Rigel","Trixie","Tsubaki"],"Yvette":["Layla"],"Zara":["Alyssa","Idris","Maple","Royhan","Ruby","Vera"]}};
const TRE = TRU.effects || {};
const LETDOWN = TRU.letdown || {};   // 1.59.0 (U8)
const trustBand = x => bandOf(TRU.bands, x);
function trustProfile(id, S, secretOut) {
  const dh = (TRU.dorm_head || {})[id], mine = !!(dh && S && S.Player && S.Player.Profile && S.Player.Profile.Dorm === dh.dorm);
  const cat = mine ? dh.category : (TRU.npcs || {})[id] || 'normal', C = (TRU.categories || {})[cat] || {};
  let o = (TRU.overrides || {})[id] || {};
  if (o.until_secret && secretOut && secretOut(id)) o = {};             // Kanae's Plan / Caine's secret is out: a plain category again
  return { cat, C, o, dh: mine ? dh : null, start: C.start != null ? C.start : 50, rise: num(o.rise, 1) * num(C.rise, 1), drop: num(o.drop, 1) * num(C.drop, 1), recover: num(C.recover, 0) };
}
const tsuspOf = (S, bonds) => Object.entries(S._Perks || {}).filter(([, p]) => p.Kind === 'rank10' && bonds[p.From] && trustGate(p.From, 10) && num(bonds[p.From].Trust, 50) < num(TRU.suspend_r10_below, 35)).map(([k]) => k);
const trustGate = (id, rank) => (((TRU.overrides || {})[id] || {}).no_gates ? 0 : num((TRU.perk_gates || {})[String(rank)], 0));
const repLevel = x => (x >= 0 ? 1 : -1) * (REP.thresholds || []).filter(t => Math.abs(x) >= t).length;
const repFloor = L => (L === 0 ? 0 : Math.sign(L) * REP.thresholds[Math.abs(L) - 1]);   // the Rep XP at which level L begins
const repBand = (r, L) => ((((REP.effects || {})[r]) || []).find(([a, c]) => L >= a && L <= c) || [0, 0, ''])[2];
const repOfNpc = id => (NPC_GROUP[id] === 'staff' ? 'Academy' : NPC_GROUP[id] === 'student' ? 'Student' : (REP.doves_bond || []).includes(id) ? 'Doves' : '');
const r2 = x => Math.round(x * 100) / 100;
const paceOf = S => ((BR.pace || {})[(S.$ui || {}).bondpace] || 1);
const needXP = (r, m) => (r >= 10 ? 0 : Math.max(3, Math.round(BR.xp_base[r] * m)));
const coolDays = (r, m) => Math.round((BR.cool_base[Math.min(r, 9)] || 0) * m);
const hm = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '').trim()); return m ? +m[1] * 60 + +m[2] : null; };
// Batch 5.1: castle places (the Notice Board is in the Floor 1 entrance hall that every student crosses) and module caps
const CASTLE = new Set(["announcement room", "archive", "bell tower", "canteen", "castle", "club rooms", "detention tower", "faculty offices", "headmaster's office", "lecture halls", "main library", "notice board", "potion halls", "restricted section", "rooftop", "royal inspectorate", "seal chamber", "seminar rooms", "staff room", "storage and lockers", "student council chamber", "study rooms", "the castle", "the royal inspectorate", "the seal chamber", "the warden's office", "warden's office", "workshop"]);
// v1.0.3 (F01): every campus place name (lowercase, with and without a leading "the"); anything else is off the grounds
const CAMPUS = ["announcement room", "arbiter hall", "archery range", "archive", "banking house", "barrow & vine", "bathhouse and washrooms", "bell tower", "boathouse and lake", "broken statue", "campus", "canteen", "castle", "cathedral", "club rooms", "combat grounds", "commissary", "common rooms", "courtyards", "detention tower", "dovecote", "faculty offices", "fire dormitory", "fishing house", "forest", "forest clearing", "founder's statue and park", "gardens", "grassy field and hills", "greenwick's", "groundskeeper's lodge", "gymnasium", "halvard", "halvard academy", "headmaster's office", "laundry", "lecture halls", "light dormitory", "mail tower", "main courtyard", "main library", "mall", "medical centre", "meditation rooms", "menagerie", "merryhew's", "nightwell", "noble houses' liaison", "notice board", "observation tower", "old hut", "pennywhistle curios", "portrait hall", "potion halls", "quillfeather's", "reception and gatehouse", "restricted section", "ring dining hall", "rooftop", "royal inspectorate", "salaffian oven", "seal chamber", "seminar rooms", "sky dormitory", "snug", "sparring pavilion", "spirit path", "sports field", "staff quarters", "staff room", "storage and lockers", "student council chamber", "study rooms", "swimming pool", "tailor's row", "the arbiter hall", "the banking house", "the castle", "the cathedral", "the dovecote", "the mall", "the noble houses' liaison", "the ring dining hall", "the royal inspectorate", "the salaffian oven", "the seal chamber", "the snug", "the sparring pavilion", "the tinker's bench", "the warden's office", "tinker's bench", "viridian dormitory", "warden's office", "willow island", "workshop"];
// 1.3.1 (owner playtest: walking to "Boathouse" did not register on the map; "Boathouse and Lake — Fishing House" registered the
// boathouse). World.Location is put in the Campus Map's words: a short name ("Boathouse", "the library") becomes the map name, and a
// sub-spot that is itself a place ("… — Fishing House") becomes the place. A dorm room every dorm shares stays under its dorm.
const PLACE_NAMES = {"announcement room":"Announcement Room","arbiter hall":"The Arbiter Hall","the arbiter hall":"The Arbiter Hall","archery range":"Archery Range","archive":"Archive","banking house":"The Banking House","the banking house":"The Banking House","barrow & vine":"Barrow & Vine","barrow vine":"Barrow & Vine","bathhouse and washrooms":"Bathhouse and Washrooms","bell tower":"Bell Tower","boathouse and lake":"Boathouse and Lake","broken statue":"Broken Statue","canteen":"Canteen","cathedral":"The Cathedral","the cathedral":"The Cathedral","club rooms":"Club Rooms","combat grounds":"Combat Grounds","commissary":"Commissary","common rooms":"Common Rooms","courtyards":"Courtyards","detention tower":"Detention Tower","dovecote":"The Dovecote","the dovecote":"The Dovecote","faculty offices":"Faculty Offices","fire dormitory":"Fire Dormitory","fishing house":"Fishing House","forest":"Forest","forest clearing":"Forest Clearing","founder's statue and park":"Founder's Statue and Park","founders statue and park":"Founder's Statue and Park","gardens":"Gardens","grassy field and hills":"Grassy Field and Hills","greenwick's":"Greenwick's","greenwicks":"Greenwick's","groundskeeper's lodge":"Groundskeeper's Lodge","groundskeepers lodge":"Groundskeeper's Lodge","gymnasium":"Gymnasium","headmaster's office":"Headmaster's Office","headmasters office":"Headmaster's Office","laundry":"Laundry","lecture halls":"Lecture Halls","light dormitory":"Light Dormitory","mail tower":"Mail Tower","main library":"Main Library","mall":"The Mall","the mall":"The Mall","medical centre":"Medical Centre","meditation rooms":"Meditation Rooms","menagerie":"Menagerie","merryhew's":"Merryhew's","merryhews":"Merryhew's","nightwell":"Nightwell","noble houses liaison":"The Noble Houses' Liaison","noble houses' liaison":"The Noble Houses' Liaison","the noble houses' liaison":"The Noble Houses' Liaison","notice board":"Notice Board","observation tower":"Observation Tower","old hut":"Old Hut","pennywhistle curios":"Pennywhistle Curios","portrait hall":"Portrait Hall","potion halls":"Potion Halls","quillfeather's":"Quillfeather's","quillfeathers":"Quillfeather's","reception and gatehouse":"Reception and Gatehouse","restricted section":"Restricted Section","ring dining hall":"The Ring Dining Hall","the ring dining hall":"The Ring Dining Hall","rooftop":"Rooftop","royal inspectorate":"The Royal Inspectorate","the royal inspectorate":"The Royal Inspectorate","salaffian oven":"The Salaffian Oven","the salaffian oven":"The Salaffian Oven","seal chamber":"The Seal Chamber","the seal chamber":"The Seal Chamber","seminar rooms":"Seminar Rooms","sky dormitory":"Sky Dormitory","snug":"The Snug","the snug":"The Snug","sparring pavilion":"The Sparring Pavilion","the sparring pavilion":"The Sparring Pavilion","spirit path":"Spirit Path","sports field":"Sports Field","staff quarters":"Staff Quarters","staff room":"Staff Room","storage and lockers":"Storage and Lockers","student council chamber":"Student Council Chamber","study rooms":"Study Rooms","swimming pool":"Swimming Pool","tailor's row":"Tailor's Row","tailors row":"Tailor's Row","the tinker's bench":"The Tinker's Bench","tinker's bench":"The Tinker's Bench","tinkers bench":"The Tinker's Bench","viridian dormitory":"Viridian Dormitory","the warden's office":"The Warden's Office","warden's office":"The Warden's Office","wardens office":"The Warden's Office","willow island":"Willow Island","workshop":"Workshop"};     // every way a place's own name is written (lowercase) -> map name
const PLACE_ALIAS = {"bank":"The Banking House","bathhouse":"Bathhouse and Washrooms","boat house":"Boathouse and Lake","boathouse":"Boathouse and Lake","clearing":"Forest Clearing","club room":"Club Rooms","common room":"Common Rooms","courtyard":"Courtyards","dining hall":"The Ring Dining Hall","fire dorm":"Fire Dormitory","fishing hut":"Fishing House","founder's park":"Founder's Statue and Park","founder's statue":"Founder's Statue and Park","founders park":"Founder's Statue and Park","gate":"Reception and Gatehouse","gatehouse":"Reception and Gatehouse","grassy field":"Grassy Field and Hills","gym":"Gymnasium","hills":"Grassy Field and Hills","hut":"Old Hut","infirmary":"Medical Centre","inspectorate":"The Royal Inspectorate","lake":"Boathouse and Lake","lake shore":"Boathouse and Lake","lakeshore":"Boathouse and Lake","lecture hall":"Lecture Halls","library":"Main Library","light dorm":"Light Dormitory","lockers":"Storage and Lockers","main courtyard":"Courtyards","medical center":"Medical Centre","meditation room":"Meditation Rooms","meditation rooms / spirit house":"Meditation Rooms","observatory":"Observation Tower","park":"Founder's Statue and Park","pool":"Swimming Pool","potion hall":"Potion Halls","reception":"Reception and Gatehouse","seminar room":"Seminar Rooms","sky dorm":"Sky Dormitory","spirit house":"Meditation Rooms","storage":"Storage and Lockers","study room":"Study Rooms","the clearing":"Forest Clearing","the courtyard":"Courtyards","the forest":"Forest","the gate":"Reception and Gatehouse","the hills":"Grassy Field and Hills","the hut":"Old Hut","the island":"Willow Island","the lake":"Boathouse and Lake","the pavilion":"The Sparring Pavilion","the spirit house":"Meditation Rooms","the woods":"Forest","viridian dorm":"Viridian Dormitory","washrooms":"Bathhouse and Washrooms","willow":"Willow Island","woods":"Forest"};     // short and partial names (tools/common.py place_aliases) -> map name
const PLACE_SHARED = new Set(["Bathhouse and Washrooms", "Common Rooms", "Laundry"]);
// 1.24.0 (owner playtest): a place's lore and rumours {place key: [[uid, name as prose writes it, title, text]]}. The Campus Map shows
// only those {{user}} has heard ($ui.lore): overheard at the place (ambience, section 8m) or named in the narration (section 9).
const PLACE_LORE = {"bathhouse and washrooms":[[205,"Third Stall","Ghost Story - The Third Stall","Where: one stall in every Bathhouse and Washroom block, always occupied, never answers. Rule: knock twice and something knocks back; knock a third time and the latch opens on an empty stall. Never test it after the night bell. Passed down as a senior's joke."]],"bell tower":[[337,"Thirteenth Stroke","Ghost Story - The Thirteenth Stroke","Where: anywhere outdoors after the eight o'clock bell. Story: the Bell Tower sometimes strikes once more than the hour, a single stroke after the rest, when no one is in the tower. Rule: count the strokes. If there is one too many, go indoors and do not count again that night. Known for: nobody agrees on what the extra stroke is for; the bell ringers say the mechanism settles, and never ring it themselves."]],"boathouse and lake":[[208,"Crying on the Water","Ghost Story - The Crying on the Water","Where: the Lake, after dark. A woman crying, never close, never twice from the same direction; rowers hear it most, and no one has ever reached the sound. Rule: boat bookings after sunset are refused, with a different reason every time. The Fishing Club blames distance."]],"canteen":[[211,"Lucky Roll","The Lucky Roll","The Canteen's free filled roll, baked in batches, no two fillings alike, nothing written down. Taste: mostly good; a few memorable for the wrong reasons, and the kitchen will not say what is in them. Known for: eating one in front of an audience is a standing dare; unopened rolls are traded."]],"club rooms":[[218,"Dragonchess","Dragonchess","Play: starts as ordinary chess (drawn from chess and shogi) on floating checkered spheres over golden clockwork pedestals that materialise the pieces. The board reads the players and escalates: it unfolds into layers and the pieces fight autonomously in real time, so players outmanoeuvre both the opponent and the game. Known for: rare sets; serious matches last days."],[346,"Applause","Ghost Story - The Applause","Where: the old amphitheatre off the Club Rooms corridor, during a late rehearsal. Story: at the end of a scene, applause comes from the empty upper tiers, and one seat up there has been folded down. Rule: bow, and end the rehearsal. Do not run the scene again that night. Known for: the Theatre Troupe bows to the empty tiers at the end of every rehearsal, and calls it tradition."]],"commissary":[[210,"Sunfizz","Sunfizz","The soda every student drinks, sold at the Commissary and the Mall store in heavy glass bottles. Price: 8 points, 2 back per returned bottle. Taste: absurdly sweet. Known for: confiscated in lectures; caps litter the Lecture Halls."],[213,"Firetooth","Firetooth","A tin of hard sweets hot enough to make the eyes water, sold everywhere. Price: 12 points. Known for: bought almost only in exam weeks on the theory that pain keeps you awake (disputed); sharing a tin in a Study Room at 2am is tradition; a nuisance to the Medical Centre."]],"common rooms":[[218,"Dragonchess","Dragonchess","Play: starts as ordinary chess (drawn from chess and shogi) on floating checkered spheres over golden clockwork pedestals that materialise the pieces. The board reads the players and escalates: it unfolds into layers and the pieces fight autonomously in real time, so players outmanoeuvre both the opponent and the game. Known for: rare sets; serious matches last days."]],"fire dormitory":[[207,"Three O'Clock Knock","Ghost Story - The Three O'Clock Knock","Where: a dorm door, at three in the morning, in a dormitory that admits only its own students. Rule: three evenly spaced knocks; count them and go back to sleep. It is never four, and nobody wants to learn what four means. Students argue whether sound can even cross the door wards."]],"forest":[[225,"Eating in the Forest","Eating in the Forest","Rule: share first. Leave a bite on the ground or a crust on a stump before the first mouthful. Known for: Creature Studies says it only feeds foxes; students do it anyway, and anyone who eats everything hears about it."]],"founder's statue and park":[[223,"Founder's Hand","The Founder's Hand","Rule: touch the Founder's Statue's outstretched hand before an exam, always the hand, always on the way out. Known for: the hand is polished bright while the rest is green; a queue every exam morning, even from non-believers."],[342,"Faraway Laugh","Ghost Story - The Faraway Laugh","Where: Founder's Park and the tree-lined paths, after dark. Story: a woman laughs somewhere up in the old trees. The laugh always sounds far away. Rule: the fainter it sounds, the closer she is. If it sounds far, walk the other way at once and do not look up. Known for: students who hear it say it was only an owl, and take the long way round for a week."]],"gardens":[[340,"Breath on the Glass","Ghost Story - Breath on the Glass","Where: inside the Gardens' greenhouses, in the late afternoon and evening. Story: the glass fogs from the inside, as if someone warm stood close to it, around a handprint that belongs to nobody present. Rule: do not press your own hand over it, and do not sleep in the greenhouses. Known for: the Gardening Club blames the heat pipes, and still leaves in pairs."]],"grassy field and hills":[[339,"Walking Lantern","Ghost Story - The Walking Lantern","Where: the Grassy Field and Hills, after dark. Story: a single lantern light crosses the ridge at walking pace with no one carrying it, and stops when anyone stops to watch. Rule: do not walk toward it, and do not follow it towards the Forest. Known for: the Camping Club pitches on the lower slope after dusk and will not say why."]],"lecture halls":[[206,"Long Corridor","Ghost Story - The Long Corridor","Where: the castle's main corridor, walked alone after the night burn. Story: it runs longer than by day, the same doors passing twice; no figure, only a walk that took eleven minutes when the bell says otherwise. Told near the Bell Tower or after late Library sessions."],[209,"Night Student","Ghost Story - The Night Student","Where: the Lecture Hall tier, after curfew. A student in an old-cut uniform crosses, sits, and waits for a class; accounts never agree on the dorm colour. Mostly placed in the breach year, so third-years refuse to tell it. It resurfaces every Remembrance Day."]],"light dormitory":[[207,"Three O'Clock Knock","Ghost Story - The Three O'Clock Knock","Where: a dorm door, at three in the morning, in a dormitory that admits only its own students. Rule: three evenly spaced knocks; count them and go back to sleep. It is never four, and nobody wants to learn what four means. Students argue whether sound can even cross the door wards."]],"main library":[[224,"Sleeping in the Library","Sleeping in the Library","Story: fall asleep over a book and you wake somewhere else: a reading room with the wrong number of doors, shelves out of order, nobody else in the building. Rule: sit still and sleep again; do not walk. Everyone who tells it woke the second time in their own chair. Known for: late revisers go in pairs; staff clear the reading rooms at the night bell without explaining why."]],"mall":[[210,"Sunfizz","Sunfizz","The soda every student drinks, sold at the Commissary and the Mall store in heavy glass bottles. Price: 8 points, 2 back per returned bottle. Taste: absurdly sweet. Known for: confiscated in lectures; caps litter the Lecture Halls."],[212,"Ardenne","Ardenne","The luxury marque in magical equipment: focuses, instruments, cases, measuring tools. Run by the Ardenne family. Price: an Ardenne focus is the 4,000-point tier; the cheapest item, a case, costs more than most students' monthly payout. Known for: marks its owner instantly as wealthy; never advertises."],[213,"Firetooth","Firetooth","A tin of hard sweets hot enough to make the eyes water, sold everywhere. Price: 12 points. Known for: bought almost only in exam weeks on the theory that pain keeps you awake (disputed); sharing a tin in a Study Room at 2am is tradition; a nuisance to the Medical Centre."],[215,"Oracle Shell","The Oracle Shell","A palm-sized novelty shell sold at Merryhew's, the Mall's joke shop, that answers any spoken question with yes, no, or ask again later. Price: 40 points. Known for: transparently random, asked anyway, for jokes or 2am secrets. Real diviners find it insulting, which helps sales."],[222,"Star Cookie","Star Cookie","A star-shaped bakery biscuit. Price: 8 points. Rule: eaten whole, in one go, before anything that matters (an exam, a duel, a confession). Halves do not count. Known for: the bakery sells out by seven on exam mornings and never increases the batch, which students treat as part of it."]],"medical centre":[[344,"Last Bed","Ghost Story - The Last Bed","Where: the Medical Centre, at night, for students kept in overnight. Story: the curtain round the last bed on the ward is drawn, and someone behind it breathes slowly in their sleep. The ward register says that bed is empty. Rule: never open the last curtain. Ask the night nurse in the morning; she will tell you it was empty, and she will be kind about it. Known for: patients who are well enough ask to be moved nearer the door."]],"menagerie":[[341,"When the Pens Go Quiet","Ghost Story - When the Pens Go Quiet","Where: the Menagerie, from dusk into the night. Story: every animal in the pens falls silent at once and turns to face the Forest, and stays that way for a long moment before the noise comes back. Rule: when the pens go quiet, walk away in the other direction and do not look where they are looking. Known for: the handlers call it weather sense; the Creature Studies teacher does not call it anything."]],"rooftop":[[345,"Other Climber","Ghost Story - The Other Climber","Where: the Rooftop, at night. Story: someone sits on the far gable in exactly your posture, wearing your dorm's vest, looking out over the grounds as you are. Rule: leave the roof before they turn round, and do not come up again that night. Known for: why students who know the way up never go up alone."]],"sky dormitory":[[207,"Three O'Clock Knock","Ghost Story - The Three O'Clock Knock","Where: a dorm door, at three in the morning, in a dormitory that admits only its own students. Rule: three evenly spaced knocks; count them and go back to sleep. It is never four, and nobody wants to learn what four means. Students argue whether sound can even cross the door wards."]],"swimming pool":[[338,"Night Swimmer","Ghost Story - The Night Swimmer","Where: the Swimming Pool after dark, most often in winter when the rune-warmed water steams. Story: someone swims steady lengths through the steam, the lane rope lifting as they pass, but when the steam clears the water is empty and still. Rule: never swim alone after dark, and do not call out to them. Known for: the Swimming Club claims the fastest lap on record and will not say who swam it."]],"viridian dormitory":[[207,"Three O'Clock Knock","Ghost Story - The Three O'Clock Knock","Where: a dorm door, at three in the morning, in a dormitory that admits only its own students. Rule: three evenly spaced knocks; count them and go back to sleep. It is never four, and nobody wants to learn what four means. Students argue whether sound can even cross the door wards."]]};
function hearLore(S, u, title, where) {
  if (S.$ui.lore.includes(String(u))) return;
  S.$ui.lore.push(String(u)); S.$ui.toasts.push(`Heard${where ? ' at ' + where : ''}: ${title}`);
}
const plKey = s => String(s || '').trim().toLowerCase().replace(/[.!]+$/, '').replace(/\s+/g, ' ');
const plName = s => { const k = plKey(s); return PLACE_NAMES[k] || PLACE_NAMES[k.replace(/^the /, '')] || ''; };
// 1.24.3 (owner): the Lecture Halls, Study Rooms and lockers are on each year's floor (first-years Floor 2, second-years 3, third-years 4).
// Any way of writing one ("Second-year Lecture Halls", "Lecture Halls, Floor 3", "Floor 3 — Study Rooms", "the lockers on the
// third-year floor") becomes "<place> — Floor N" (+ any other detail), so the place is known and the floor is kept.
const YEAR_FLOOR_PLACES = {"Lecture Halls": ["Floor 2", "Floor 3", "Floor 4"], "Study Rooms": ["Floor 2", "Floor 3", "Floor 4"], "Storage and Lockers": ["Floor 2", "Floor 3", "Floor 4"]};
const YF_WORD = { 'Lecture Halls': /\blecture[- ]halls?\b/i, 'Study Rooms': /\bstudy[- ]rooms?\b/i, 'Storage and Lockers': /\blockers?\b|\bstorage\b/i };
function yearFloorLocation(loc) {
  const s = String(loc || ''), f = /\bfloor ([2-4])\b/i.exec(s), y = /\b(first|second|third)[- ]years?\b/i.exec(s);
  if (!f && !y) return '';
  const hits = Object.keys(YEAR_FLOOR_PLACES).map(nm => [nm, YF_WORD[nm] && YF_WORD[nm].exec(s)]).filter(([, m]) => m).sort((a, b) => a[1].index - b[1].index);
  if (!hits.length) return '';
  // another place named first wins ("Fire Dormitory — lockers on the second-year corridor", "Canteen, talking about the first-year halls")
  if (locParts(s).some(x => { const n = plName(x); return n && !YEAR_FLOOR_PLACES[n]; })) return '';
  const nm = hits[0][0], n = f ? +f[1] : ['first', 'second', 'third'].indexOf(y[1].toLowerCase()) + 2;
  if (!YEAR_FLOOR_PLACES[nm].includes('Floor ' + n)) return '';
  const rest = locParts(s).map(x => x.trim()).filter(x => x && !/\bfloor [2-4]\b|\b(first|second|third)[- ]years?\b/i.test(x) && !Object.values(YF_WORD).some(rx => rx.test(x)));
  return [nm, 'Floor ' + n, ...rest].join(' — ');
}
function canonLocation(loc) {
  const yf = yearFloorLocation(loc); if (yf) return yf;
  const segs = locParts(loc).map(x => x.trim()).filter(Boolean);
  if (!segs.length) return String(loc || '');
  let at = -1, nm = '';
  for (let i = segs.length - 1; i >= 0 && at < 0; i--) { const n = plName(segs[i]); if (n && (i === 0 || !PLACE_SHARED.has(n))) { at = i; nm = n; } }
  if (at < 0) { nm = PLACE_ALIAS[plKey(segs[0])] || PLACE_ALIAS[plKey(segs[0]).replace(/^the /, '')] || ''; if (nm) at = 0; }
  if (at < 0) return String(loc);
  return at === 0 && segs[0] === nm ? String(loc) : [nm, ...segs.slice(at + 1)].join(' — ');
}
const onCampus = loc => { const p = placeOf(loc).toLowerCase(); return !p || CAMPUS.some(c => p === c || p.startsWith(c + ' ') || p.startsWith(c + ',')); };
const CAP = { Notices: 10, Letters: 12, Clues: 40, Journal: 30 };
const CLUE_ARCHIVE = 120;   // 1.61.0 (memory audit M1): clues past the cap, for the Mystery panel ($ui.cluearch)
// 1.60.0: Lore_changes subjects -> lore entry uid (tools/common.py lore_names; build_card prints a change in that entry), NPC entries
const LORE = {"names":{"eldrasil":1,"other nations":1,"foreign power":1,"myrdath academy":2,"myrdath":2,"northern site":2,"sealed monster":2,"veyra academy":3,"veyra":3,"archmage's rest":3,"archmage's tomb":3,"southern site":3,"archmage":3,"ashvale academy":4,"ashvale":4,"elixir":4,"eastern site":4,"halvard academy":5,"crack":5,"demon world":5,"western site":5,"breach night":5,"breach":5,"demonic":5,"student council":6,"council president":6,"council vice president":6,"seals & mana":7,"seal":7,"residual mana":7,"sealed site":7,"thinning":9,"seal weakens":9,"seal is weak":9,"hierarchy & teaching staff":10,"dorm head":10,"dorm heads":10,"teaching staff":10,"staff hierarchy":10,"warden":11,"overview":12,"four dorms":12,"magic type":12,"magic types":12,"dorm ladder":12,"dorm wing":12,"dorm wings":12,"dorm room":12,"dorm building":12,"dorm buildings":12,"magic theory":17,"academic structure & rules":18,"academic year":18,"semester":18,"semesters":18,"repeat a year":18,"competitions":19,"dorm competition":19,"academy competition":19,"kingdom competition":19,"world competition":19,"dorm comp":19,"academy comp":19,"kingdom comp":19,"world comp":19,"point system":20,"point balance":20,"points bracelet":20,"monthly payout":20,"money":20,"bracelet":20,"entrance event":21,"entrance feast":21,"club promotion":21,"sorting":21,"star night":22,"starnight":22,"dorm days":23,"dorm day":23,"open house":23,"independence crowning day":24,"crowning day":24,"independence day":24,"academy founder day":25,"founder day":25,"founder's day":25,"founders day":25,"clubs":26,"club block":26,"club membership":26,"found a club":26,"club activities":26,"club president":26,"history":27,"etiquette":28,"creature studies":29,"practical magic":30,"attack class":30,"defense class":30,"healing class":30,"support class":30,"control class":30,"combat class":30,"combat practical":30,"potion crafting":31,"dark magic defense":32,"forbidden magic":32,"forbidden art":32,"forbidden arts":32,"dark magic":32,"dark arts":32,"elemental":33,"elemental magic":33,"elemental affinity":33,"fire magic":33,"water magic":33,"wind magic":33,"earth magic":33,"ice magic":33,"lightning magic":33,"metal magic":33,"sand magic":33,"crystal magic":33,"acid magic":33,"steam magic":33,"wood magic":33,"light magic":33,"salt magic":33,"magnetism":33,"storm magic":33,"sound magic":33,"obsidian":33,"blightfire":33,"salting":33,"weather change magic":33,"weather magic":33,"rot magic":33,"poison magic":33,"mystic":34,"mystic magic":34,"mystic affinity":34,"creation magic":34,"telekinesis":34,"telekinetic":34,"teleportation":34,"teleport":34,"gravity magic":34,"divination":34,"scrying":34,"object reading":34,"astral magic":34,"spatial magic":34,"portal":34,"phasing":34,"time magic":34,"transmutation":34,"enchantment":34,"runecraft":34,"sealing magic":34,"warding magic":34,"golemancy":34,"dispelling":34,"dispel":34,"unmaking":34,"puppetry":34,"wringing":34,"torture magic":34,"soul magic":34,"necromancy":34,"raise dead":34,"spiritual":35,"spiritual magic":35,"spiritual affinity":35,"healing magic":35,"enhancement magic":35,"regeneration":35,"purification":35,"resuscitation":35,"berserk":35,"warcry":35,"willshield":35,"lifesense":35,"pain suppression":35,"burning magic":35,"drawing magic":35,"mind control":35,"slavery magic":35,"effigy":35,"curse magic":35,"occult":36,"occult magic":36,"occult affinity":36,"illusion":36,"illusion magic":36,"invisibility":36,"exorcism":36,"glamour":36,"dreamwalking":36,"curse breaking":36,"spirit binding":36,"guardian spirit":36,"spirit sight":36,"spirit speech":36,"banishing":36,"name binding":36,"shadow magic":36,"talisman":36,"ritual circle":36,"oath magic":36,"demon summoning":36,"summon demon":36,"forbidden charm":36,"pacting":36,"wearing magic":36,"blood magic":36,"seal chamber":42,"warden's office":43,"warden office":43,"consumption ledger":43,"mana ledger":43,"wardens office":43,"arbiter hall":44,"arbiter stone":44,"great hall":44,"assembly hall":44,"ring dining hall":45,"dining hall":45,"portrait hall":46,"founder's statue and park":47,"founder statue":47,"founder's statue":47,"founders statue":47,"founder's park":47,"founders park":47,"park":47,"parkland":47,"picnic":47,"bell tower":48,"first bell":48,"morning bell":48,"eight o'clock":48,"lights out":48,"lecture halls":49,"lecture hall":49,"seminar rooms":50,"seminar room":50,"seminar":50,"potion halls":51,"potion hall":51,"brewing hall":51,"laboratory":51,"combat grounds":52,"combat ground":52,"training ground":52,"training grounds":52,"sparring pavilion":52,"faculty offices":53,"faculty office":53,"teacher's office":53,"staff room":54,"staffroom":54,"workshop":55,"main library":56,"library":56,"reading room":56,"reading rooms":56,"restricted section":57,"forbidden texts":57,"forbidden books":57,"archive":58,"library archive":58,"academy records":58,"study rooms":59,"study room":59,"common rooms":61,"common room":61,"canteen":62,"cafeteria":62,"main kitchen":62,"cooking club":62,"laundry":63,"bathhouse and washrooms":64,"bathhouse":64,"washroom":64,"washrooms":64,"bathroom":64,"storage and lockers":65,"locker":65,"lockers":65,"mall":66,"tea house":66,"bakery":66,"game hall":66,"quillfeather's":66,"pennywhistle curios":66,"barrow & vine":66,"greenwick's":66,"tinker's bench":66,"salaffian oven":66,"tailor's row":66,"club rooms":67,"club room":67,"clubroom":67,"amphitheatre":67,"theatre troupe":67,"student council chamber":68,"council chamber":68,"council room":68,"notice board":69,"noticeboard":69,"bulletin board":69,"student notices":69,"campus notices":69,"lost & found":69,"lost and found":69,"missing item":69,"found item":69,"mail tower":70,"aviary":70,"parcel":70,"message bird":70,"courtyards":71,"courtyard":71,"main courtyard":71,"main courtyards":71,"sports field":72,"soccer":72,"gymnasium":73,"gym":73,"swimming pool":74,"archery range":75,"archery":75,"grassy field and hills":76,"grassy field":76,"hills":76,"forest":77,"woods":77,"boathouse and lake":78,"boathouse":78,"lake":78,"rowing":78,"fishing club":78,"fishing house":78,"fishing dock":78,"fish pond":78,"gardens":79,"gardening club":79,"menagerie":80,"beast handling club":80,"observation tower":81,"divination society":81,"medical centre":82,"medical center":82,"infirmary":82,"healing ward":82,"nurse":82,"nurses":82,"commissary":83,"academy shop":83,"reception and gatehouse":84,"gatehouse":84,"front gate":84,"visiting parlour":84,"visiting hours":84,"groundskeeper's lodge":85,"groundskeeper lodge":85,"groundskeeper":85,"groundskeeping":85,"detention tower":86,"meditation rooms":87,"meditation room":87,"meditation":87,"meditate":87,"dovecote":88,"dove":88,"doves":88,"coop":88,"roost":88,"pigeons":88,"mage hunter":88,"royal inspectorate":89,"inspectorate":89,"inspector":89,"inspectors":89,"cathedral":90,"asmoday":90,"clergy":90,"priest":90,"chapel":90,"noble houses' liaison":91,"liaison":91,"noble houses liaison":91,"nobility":91,"banking house":92,"banker":92,"bank counter":92,"morning choir cult":93,"cultist":93,"cult":93,"morning choir":93,"cultists":93,"cults":93,"lucifer's mark":93,"lucifer morning star, the father of magic":94,"lucifer":94,"morning star":94,"father of magic":94,"warding rite":96,"irene chanare":98,"irene":98,"chanare":98,"library assistants":98,"caspian riwalo":99,"caspian":99,"riwalo":99,"festival committee":99,"etnie":100,"etnera":100,"royhan filanoman":101,"royhan":101,"roy":101,"filanoman":101,"gohn":101,"alchemy circle":101,"lenna greenwind":102,"lenna":102,"greenwind":102,"janna":102,"saffi tamberlane":103,"saffi":103,"saffranelle":103,"tamberlane":103,"running club":103,"kanae quveno":104,"kanae":104,"quveno":104,"niu":104,"idris ainsworth":105,"idris":105,"ainsworth":105,"aiden ruzzo":106,"aiden":106,"ruzzo":106,"card club":106,"caralynn veyturone":107,"caralynn":107,"cara":107,"veyturone":107,"music club":107,"zara minallone":108,"zara":108,"minallone":108,"tailoring club":108,"gavlan haverton":109,"gavlan":109,"haverton":109,"magic duelling club":109,"yvette fallaron":110,"yvette":110,"fallaron":110,"smithing club":110,"krieg valforth":111,"krieg":111,"valforth":111,"milena sagona":112,"milena":112,"sagona":112,"baelin kalvor":113,"baelin":113,"kalvor":113,"headmaster kalvor":113,"headmaster":113,"layla palegleam":114,"layla":114,"palegleam":114,"vallie goredust":115,"vallie":115,"goredust":115,"deathaxe":115,"percival applethorne":116,"percival":116,"percy":116,"applethorne":116,"laetano":116,"soccer club":116,"sophia helfin":117,"sophia":117,"helfin":117,"blood saint":117,"rei kestrane":118,"rei":118,"kestrane":118,"acting warden":118,"halvard warden":118,"kuroo varnell":119,"kuroo":119,"varnell":119,"mimosa linden":120,"mimosa":120,"linden":120,"gareth valkaryn":121,"gareth":121,"valkaryn":121,"board game club":121,"spirit tiers":122,"spirit tier":122,"lesser spirit":122,"basic spirit":122,"greater spirit":122,"spirit lord":122,"spirit lords":122,"lucius vortigern":123,"lucius":123,"vortigern":123,"shub-niggurath":123,"lord of harvest":123,"locust swarm":123,"shub niggurath":123,"trixie confetti":124,"trixie":124,"confetti":124,"vera pulsar":125,"vera":125,"pulsar":125,"tristan aurelle":126,"tristan":126,"aurelle":126,"althair veyne":127,"althair":127,"veyne":127,"vice headmaster":127,"dante kleinn":128,"dante":128,"kleinn":128,"castor moretti":129,"castor":129,"moretti":129,"academy newspaper":129,"ruby bonbon":130,"ruby":130,"bonbon":130,"period change":201,"between classes":201,"corridor rush":201,"skipping class":202,"skip class":202,"cut class":202,"exam week":203,"midterms":203,"exam season":203,"assignments and group work":204,"homework":204,"assignment":204,"group work":204,"third stall":205,"washroom ghost":205,"long corridor":206,"corridor ghost":206,"corridor at night":206,"three o'clock knock":207,"three knocks":207,"three in the morning":207,"crying on the water":208,"lake at night":208,"night student":209,"lecture hall ghost":209,"old uniform":209,"sunfizz":210,"soda":210,"soft drink":210,"sun fizz":210,"lucky roll":211,"mystery roll":211,"mystery bread":211,"filled roll":211,"lucky rolls":211,"ardenne":212,"luxury focus":212,"expensive focus":212,"firetooth":213,"spicy sweets":213,"hot candy":213,"fire tooth":213,"nightwell":214,"vigil":214,"oracle shell":215,"conch":215,"oracle shells":215,"merryhew's":216,"merryhew":216,"joke shop":216,"prank shop":216,"merryhews":216,"snug":217,"private table":217,"dragonchess":218,"chess":218,"dragon chess":218,"mana grid":219,"magic lantern":219,"wall torch":219,"mana lantern":219,"paid work":221,"part-time":221,"take a job":221,"earn points":221,"star cookie":222,"lucky cookie":222,"star cookies":222,"founder's hand":223,"touch the statue":223,"statue before exam":223,"founders hand":223,"sleeping in the library":224,"fell asleep reading":224,"asleep over a book":224,"eating in the forest":225,"leave a bite":225,"share with the forest":225,"taken":226,"taken by name":226,"called your name after dark":226,"taken superstition":226,"name list":229,"magical beast":229,"magical beasts":229,"beast grade":229,"grade i":229,"grade ii":229,"grade iii":229,"grade iv":229,"protected beast":229,"protected beasts":229,"creature studies expedition":230,"expedition":230,"grand vast forest":230,"airships":231,"airship":231,"midterm":232,"midterm exam":232,"club festival":233,"training week":234,"secret fools day":235,"fools day":235,"end of semester exams":236,"final exam":236,"finals":236,"results and dorm ranking":237,"dorm ranking":237,"final ranking":237,"results & dorm ranking":237,"mid-year break":238,"mid year break":238,"sports day":239,"magical and science fair":240,"science fair":240,"magical & science fair":240,"traveling circus":241,"circus":241,"academy showcase":242,"academy bazaar":243,"bazaar":243,"remembrance day":244,"harvest festival":245,"harvest fest":245,"sunreach bay":246,"sunreach":246,"graduation":248,"graduation ceremony":248,"spirit pact":249,"channelling":249,"pact spirit":249,"channelled":249,"florian villeneuve":250,"florian":250,"villeneuve":250,"hades":250,"tea club":250,"elion":250,"house villeneuve":250,"elion villeneuve":251,"excalibur":251,"bellatrix ardenne":252,"bellatrix":252,"combat roles":253,"combat role":253,"attack role":253,"defense role":253,"healing role":253,"support role":253,"control role":253,"forest clearing":254,"elder oak":254,"great oak":254,"giant oak":254,"oak clearing":254,"clearing":254,"middle of the forest":254,"flower field":254,"wildflowers":254,"wild flowers":254,"rooftop":255,"castle roof":255,"roof door":255,"on the roof":255,"headmaster's office":256,"headmasters office":256,"headmaster office":256,"summoned to the headmaster":256,"romantic spots":257,"romantic spot":257,"date spot":257,"on a date":257,"confession":257,"confess":257,"couples":257,"date event":257,"date events":257,"staff quarters":258,"staff quarter":258,"staff house":258,"teachers' quarters":258,"teacher's quarters":258,"fire dormitory":259,"fire dorm":259,"elementalist":259,"elementalists":259,"red vest":259,"fire wing":259,"light dormitory":260,"light dorm":260,"mystics":260,"yellow vest":260,"yellow vests":260,"light wing":260,"sky dormitory":261,"sky dorm":261,"occultist":261,"occultists":261,"blue vest":261,"sky wing":261,"viridian dormitory":262,"viridian":262,"viridian dorm":262,"spiritualist":262,"spiritualists":262,"green vest":262,"viridian wing":262,"old hut":263,"abandoned hut":263,"old cabin":263,"hut":263,"announcement room":264,"announcements":264,"broadcast":264,"morning announcement":264,"on the air":264,"announcement pillars":265,"announcement pillar":265,"rune pillar":265,"rune pillars":265,"broken statue":266,"marble statue":266,"headless statue":266,"mossy statue":266,"pavilion":267,"magic duelling club headquarters":267,"equipment store":267,"training gear":267,"fishing hut":268,"long dock":268,"willow island":269,"willow tree":269,"island":269,"fireflies":269,"willow":269,"devoured kingdom":273,"azathoth":273,"lord of all":273,"primal desert":273,"four who saved the world":274,"king of knights":274,"lady of the lake":274,"empress of the fractured vow":274,"fractured vow":274,"four heroes":274,"first bargain":275,"magic was whole":275,"fractured into four":275,"why four types":275,"holy grail":276,"grail":276,"wish-granting cup":276,"shaping of the world":277,"creation myth":277,"how the world was made":277,"goddess of creation":277,"arslan sultanate":278,"arslan":278,"world bank":278,"sultan":278,"norvaine":279,"yog-sothoth":279,"lord of the cosmos":279,"chosen of the cosmos":279,"archives":281,"sports field and gymnasium":284,"faculty offices and staff room":291,"common rooms and canteen":300,"alyssa edelweiss":322,"alyssa":322,"edelweiss":322,"hastur":322,"king in yellow":322,"drawing club":322,"tilly marsh":323,"tilly":323,"marsh":323,"ottilie":323,"velmora":323,"ezrel marionne":324,"ezrel":324,"marionne":324,"light dorm head":324,"light dormitory head":324,"head of the light dormitory":324,"ottavio bastiani":329,"ottavio":329,"bastiani":329,"loki":329,"sky dorm head":329,"sky dormitory head":329,"head of the sky dormitory":329,"caine strix":330,"caine":330,"strix":330,"liaison butler":330,"butler":330,"bobby becket":331,"bobby":331,"becket":331,"maintenance":331,"velmoran":333,"caelmar":334,"caelmari":334,"city of layers":334,"yozakura":335,"yozakuran":335,"alpha of yozakura":335,"student council election":336,"council election":336,"presidential election":336,"election campaign":336,"thirteenth stroke":337,"extra stroke":337,"one stroke too many":337,"night swimmer":338,"swimmer in the steam":338,"walking lantern":339,"lantern on the ridge":339,"breath on the glass":340,"handprint on the glass":340,"when the pens go quiet":341,"pens go quiet":341,"animals fell silent":341,"faraway laugh":342,"laugh in the trees":342,"laughing in the trees":342,"polite walker":343,"last bed":344,"last curtain":344,"other climber":345,"far gable":345,"applause":346,"empty tiers":346,"spirit path":347,"spirit walk":347,"lesser spirits":347,"first pact":347,"cairns":347,"base camp":361,"wildwood":362,"wildwood (north)":362,"wildwood (west)":362,"wildwood (east)":362,"blightbriar":363,"gloaming":364,"silverstair falls":365,"jade terraces":366,"grand cave network":367,"old heart":368,"wendigo":369,"eldrasil castle":371,"noble ring":372,"crown square":373,"grand cathedral":374,"chancery":375,"rookery":376,"rooks":376,"drowned rat":376,"royal mages":377,"royal mage":377,"parade":377,"promenade deck":378,"airship promenade":378,"airship — common room":379,"airship common room":379,"airship bar":379,"airship stage":379,"cabin deck":380,"bathing stalls":380,"cargo hold":381,"quartermaster":381,"kira brannock":401,"kira":401,"brannock":401,"mirelle lullwyn":402,"mirelle":402,"lullwyn":402,"theodore wrenfield":403,"theodore":403,"wrenfield":403,"theo":403,"ines vauclair":404,"ines":404,"vauclair":404,"bram holloway":405,"bram":405,"holloway":405,"dex harlow":406,"dex":406,"harlow":406,"cassius rhavel":407,"cassius":407,"rhavel":407,"morgana vess":408,"morgana":408,"vess":408,"nocturne":408,"pip althorne":409,"pip":409,"althorne":409,"linus tallyworth":410,"linus":410,"tallyworth":410,"tally":410,"maple fernhollow":411,"maple":411,"fernhollow":411,"sobek":411,"nerys silvarenne":412,"nerys":412,"silvarenne":412,"house silvarenne":412,"hadrian quelloris":413,"hadrian":413,"quelloris":413,"wren marlowe":414,"wren":414,"marlowe":414,"tsubaki hoshikage":415,"tsubaki":415,"hoshikage":415,"youngest royal mage":415,"hester mortlake":416,"hester":416,"mortlake":416,"nurse mortlake":416,"head nurse":416,"anselm graywater":417,"anselm":417,"graywater":417,"magnus tarrant":418,"magnus":418,"tarrant":418,"tarrant index":418,"dorian pryce":419,"dorian":419,"pryce":419,"cedric amor fay":420,"cedric":420,"amor fay":420,"professor fay":420,"anya zeth":421,"anya":421,"zeth":421,"house zeth":421,"kotaro hanamura":422,"kotaro":422,"hanamura":422,"valentin crane":423,"valentin":423,"crane":423,"aurelian solmere":424,"aurelian":424,"solmere":424,"harvest hall hero":424,"william beckett":425,"william":425,"beckett":425,"crow of the ninth dawn":425,"bruno ferrante":426,"bruno":426,"ferrante twins":426,"bianca ferrante":427,"bianca":427,"rigel ardenne":428,"rigel":428,"topaz vasquelle":429,"topaz":429,"vasquelle":429,"faye driftwell":430,"faye":430,"driftwell":430,"skydock":431,"fish market":432,"sea dock":433,"hanabira":434,"coral beach":435,"sunpier":436,"tidehouse aquarium":437,"sunreach crossing":438,"velvet lanes":439,"golden tide":440,"plaza dourada":441,"terraces":442,"skyrail":443,"old fort":444,"lagoon":445,"reef gardens":446,"shell cove":447,"lighthouse":448,"sunset cliffs":449,"glowtide grotto":450,"open sea":451,"high dovecote":452,"royal bank":453,"skyport":454,"gilded arcade":455,"lantern market":456,"spellwright row":457,"old town":458,"skywheel fair":459,"great spire":460,"garden of avalon":461,"grand theatre":462,"royal arena":463,"whitestone hotel":464},"npc":[98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,123,124,125,126,127,128,129,130,250,251,252,322,323,324,329,330,331,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430]};
const LC = { max: 40, perReply: 2 };   // lasting changes on record; new ones a reply may add
const lcKey = s => String(s == null ? '' : s).trim().toLowerCase().replace(/^the\s+/, '').replace(/\s+/g, ' ');   // = common.lore_key
const loreUidOf = s => { const u = ((LORE.names || {})[lcKey(s)]); return u === undefined ? -1 : u; };
// a reply's prose: without its update block (closed or not) and tags
const proseOf = text => String(text || '').replace(/<UpdateVariable>[\s\S]*?(?:<\/UpdateVariable>|$)/gi, ' ').replace(/<[^>]+>/g, ' ');
// Batch 5.2: the Kingdom prize (lore Competitions: 5,000 points per winning member) is avalon.json kingdom.prize (KINGDOM_PRIZE,
// below AV); the trips are TRIPS in shared.js
const DORM_PRIZE = [100, 50];   // 1.33.0: a Dorm Competition role bracket's champion and runner-up
// v1.0.3: Halvard students {id: [lorebook Year, campaign year they arrive]}, injected by gen_engine. Graduation (M11 W4 Sun) sends
// the year's third-years away the next morning (M12 W1 Mon); they go to Campus_State.Graduated (the story may take a name back out).
// ARRIVES: incoming cohorts (data/cohorts.json) -> campaign year they arrive as first-years; before that they are not at Halvard.
const STUDENTS = {"Aiden":[1,1],"Alyssa":[1,1],"Aurelian":[1,3],"Bianca":[1,3],"Bruno":[1,3],"Caralynn":[1,1],"Caspian":[3,1],"Castor":[1,1],"Dante":[2,1],"Etnie":[3,1],"Faye":[1,3],"Florian":[2,1],"Gareth":[3,1],"Hadrian":[1,2],"Idris":[2,1],"Irene":[3,1],"Kanae":[2,1],"Lenna":[2,1],"Linus":[1,2],"Maple":[1,2],"Nerys":[1,2],"Percival":[1,1],"Rigel":[1,3],"Royhan":[3,1],"Ruby":[3,1],"Saffi":[2,1],"Sophia":[3,1],"Tilly":[2,1],"Topaz":[1,3],"Trixie":[1,1],"Tsubaki":[1,2],"Vera":[1,1],"William":[1,3],"Wren":[1,2],"Zara":[1,1]};
const ARRIVES = {"Aurelian":3,"Bianca":3,"Bruno":3,"Faye":3,"Hadrian":2,"Linus":2,"Maple":2,"Nerys":2,"Rigel":3,"Topaz":3,"Tsubaki":2,"William":3,"Wren":2};
const STAYS = {"Etnie":"Etnie did not leave with the graduates: she stays on at Halvard for another third year (her lore says why)"};   // 1.7.4: third-years whose canon keeps them at Halvard (data/cohorts.json "stays"): {id: log line}
const yearOf = (id, Y) => (STUDENTS[id] ? STUDENTS[id][0] + Y - STUDENTS[id][1] : 0);   // their school year in campaign year Y
// Batch 5.3 (F20): seeded campus happenings. Pool from data/happenings.json (injected by tools/gen_engine.py).
// Plan 4.6: never Math.random(). The chat seed is taken once from the creation time of the message whose update first ran the
// engine and then stored in $eng.seed, so every later roll is a pure function of (seed, day): swipes and replays see the same day.
const HAPPENINGS = [{"id":"work_menagerie","text":"A paid-work opening is up on the Notice Board: Menagerie mucking out, 40 points a shift. It will be gone by tomorrow.","where":"Notice Board","from":7,"to":20,"days":"weekday","weight":3},{"id":"work_shelving","text":"The Main Library has posted a shelving shift on the Notice Board, the quiet kind that is rarely advertised twice.","where":"Notice Board","from":7,"to":18,"days":"weekday","weight":2},{"id":"tutoring_offer","text":"A second-year has pinned a tutoring offer to the Notice Board: combat footwork, paid in points or in favours.","where":"Notice Board","from":7,"to":20,"days":"any","weight":2},{"id":"lost_wand","text":"A lost-item note on the Notice Board: a silver-banded focus wand, last seen near the Lecture Halls. Reward offered.","where":"Notice Board","from":7,"to":20,"days":"any","weight":2},{"id":"dove_sweep","text":"Two Doves are walking the Courtyards slowly, watching faces. Students keep finding reasons to be somewhere else.","where":"Courtyards","from":12,"to":16,"days":"weekday","weight":2,"outdoor":true},{"id":"menagerie_loose","text":"Something small has slipped its pen at the Menagerie; handlers are combing the Gardens with nets and treats.","where":"Gardens","from":14,"to":18,"days":"any","weight":2,"outdoor":true},{"id":"lanterns_dim","text":"Month-end draw on the mana grid: the corridor lanterns burn noticeably dimmer tonight, and everyone complains about it like weather.","where":"","from":17,"to":20,"days":"any","weeks":[4],"weight":4},{"id":"canteen_short","text":"The Canteen kitchen is short-handed; the cook is offering an extra paid shift to whoever helps serve lunch.","where":"Canteen","from":10,"to":13,"days":"weekday","weight":2},{"id":"cooking_club","text":"The Cooking Club's ovens have run since dawn; the Canteen smells of honey bread and they are giving away the failures.","where":"Canteen","from":10,"to":15,"days":"any","weight":2},{"id":"duel_chalk","text":"A formal duel challenge is chalked on the board outside the Sparring Pavilion. Nobody has signed to accept it yet.","where":"The Sparring Pavilion","from":8,"to":20,"days":"any","weight":2},{"id":"club_tables","text":"Club recruiters have set up tables in the Courtyards, pressing leaflets on every first-year who slows down.","where":"Courtyards","from":12,"to":17,"days":"any","months":[1,2],"weight":4,"outdoor":true},{"id":"dragonchess","text":"A Dragonchess match in the Mall's game halls has run into its second day; a crowd is betting points on it.","where":"The Mall","from":16,"to":20,"days":"any","weight":2},{"id":"bakery_new","text":"The Mall bakery has a new pastry out and the queue curls out of the door.","where":"The Mall","from":7,"to":11,"days":"any","weight":2},{"id":"mail_sunday","text":"Sunday sorting at the Mail Tower is swamped; the sorting floor is asking anyone free to lend a hand.","where":"Mail Tower","from":9,"to":15,"days":["Sun"],"weight":5},{"id":"parcel_cart","text":"A cart of heavy parcels has come in at the Mail Tower; locker tallies are going up all afternoon.","where":"Mail Tower","from":13,"to":18,"days":"weekday","weight":2},{"id":"boat_capsize","text":"A rowing boat capsized near the willow island; the crew came back soaked and furious, and the boathouse is buzzing.","where":"Boathouse and Lake","from":15,"to":19,"days":"any","weight":1,"outdoor":true},{"id":"clear_dusk","text":"A clear, moonless dusk: the Observation Tower's instruments are already turning on their own, and the Divination Society has claimed the top deck.","where":"Observation Tower","from":17,"to":20,"days":"any","weight":1,"weather":"clear_night"},{"id":"pickup_match","text":"An informal cross-dorm match has started on the Sports Field, and one side is a player short.","where":"Sports Field","from":16,"to":19,"days":"any","weight":2,"outdoor":true},{"id":"workshop_sparks","text":"A misfired enchantment has left sparks hanging in the Workshop air for hours; the forges are shut until it settles.","where":"Workshop","from":10,"to":18,"days":"weekday","weight":1},{"id":"garden_overgrowth","text":"Something in the Gardens grew far too well overnight; the Gardening Club is cutting a path back to the herb beds.","where":"Gardens","from":7,"to":17,"days":"any","weight":2,"outdoor":true},{"id":"council_inspection","text":"The Student Council is inspecting the dorm common rooms this evening: preservation lockers, quiet hours, the kettle rota.","where":"Common Rooms","from":18,"to":20,"days":"weekday","weight":1},{"id":"pillar_notice","text":"The Announcement Pillars glow between periods: a lost-property amnesty at Reception, today only.","where":"Reception and Gatehouse","from":12,"to":16,"days":"weekday","weight":1},{"id":"medical_queue","text":"After today's Practical Magic lessons the Medical Centre has a queue out of the door: sprains, burns and one badly singed eyebrow.","where":"Medical Centre","from":16,"to":18,"days":["Mon","Thu"],"weight":3},{"id":"airship_over","text":"An airship passes low over the grounds on its way to the capital; half the Courtyards stops to watch.","where":"Courtyards","from":10,"to":17,"days":"any","weight":1,"outdoor":true},{"id":"rumour_knock","text":"Rumour in the common rooms: someone swears they counted four knocks at three o'clock last night.","where":"Common Rooms","from":7,"to":10,"days":"any","weight":1},{"id":"rumour_corridor","text":"Two late revisers are telling anyone who will listen that the main corridor ran long last night, after the night burn.","where":"Lecture Halls","from":8,"to":12,"days":"weekday","weight":1},{"id":"fallen_tree","text":"A cracked tree has come down at the Forest's edge; the Groundskeeper's Lodge wants volunteers with strong backs.","where":"Groundskeeper's Lodge","from":8,"to":16,"days":"any","weight":1,"outdoor":true,"after_storm_x3":true},{"id":"study_group","text":"A Magic Theory study group has taken over a Study Room and is selling copies of its notes for points.","where":"Study Rooms","from":16,"to":20,"days":"weekday","weight":2},{"id":"pool_runes","text":"The warming runes on the Swimming Pool rim have failed; the water is ice-cold and the swim clubs are outraged.","where":"Swimming Pool","from":7,"to":18,"days":"any","weight":1},{"id":"inspectorate_clerk","text":"A crown clerk from the Royal Inspectorate was seen carrying ledgers towards the Warden's Office. Nobody knows why.","where":"Courtyards","from":9,"to":15,"days":"weekday","weight":1},{"id":"snow_clearing","text":"Snow came down overnight and buried the paths; the Groundskeeper's Lodge is hiring a snow-clearing crew, 20 to 40 points a shift.","where":"Groundskeeper's Lodge","from":7,"to":14,"days":"any","weight":6,"outdoor":false,"weather":"snow"},{"id":"storm_cleanup","text":"Yesterday's storm left branches and slipped roof slates across the grounds; the Groundskeeper's Lodge is paying a clean-up crew by the shift.","where":"Groundskeeper's Lodge","from":7,"to":16,"days":"any","weight":6,"outdoor":false,"weather":"after_storm"},{"id":"dove_fog","text":"Dense fog lies over the grounds and the Doves have doubled their patrols, stopping anyone they cannot see clearly until it lifts.","where":"","from":6,"to":12,"days":"any","weight":6,"outdoor":false,"weather":"dense_fog"}];
// 1.16.0 ambience (data/ambience.json): categories and their crowd rhythm, the sun table, cue and beat types, the uncanny stories
const AMB = {"uncanny_chance":5,"lore_chance":35,"lore_places":{"bathhouse and washrooms":60,"laundry":60},"pairs":{"rate":0.5,"seen":{"friends":["{a} and {b} were seen together around {place}, deep in conversation","{a} and {b} shared a table at {place}","{a} was walking with {b} near {place}, both laughing"],"rivals":["{a} and {b} were seen trying to outdo each other at {place}","{a} and {b} traded words at {place}, neither giving ground"],"dislike":["{a} was seen turning away from {b} at {place}","{a} left {place} soon after {b} came in"]},"near":{"friends":["{a} and {b} nearby, deep in conversation","{a} and {b} passing together, one teasing the other"],"rivals":["{a} and {b} nearby, plainly competing over something small","{a} and {b} arguing a point nearby, neither giving ground"],"dislike":["{a} nearby, pointedly not looking at {b}","{a} changing direction to avoid {b}"]}},"trace_chance":50,"sun":{"1":[365,1075],"2":[315,1125],"3":[270,1170],"4":[245,1195],"5":[255,1185],"6":[295,1145],"7":[345,1095],"8":[395,1045],"9":[440,1000],"10":[470,970],"11":[460,980],"12":[415,1025]},"cats":{"teaching":{"places":["lecture halls","seminar rooms"],"class":[0,0,4,4,1,4,1,0,0],"sat":[0,0,4,0,0,0,0,0,0],"free":[0,0,0,0,0,0,0,0,0]},"craft":{"places":["potion halls","workshop"],"class":[0,0,1,1,0,4,3,2,0],"free":[0,0,1,2,1,2,2,1,0]},"study":{"places":["main library","study rooms","archive","restricted section"],"class":[0,1,1,1,2,1,3,3,1],"sat":[0,0,1,4,2,2,2,2,1],"free":[0,0,2,3,2,3,3,3,1]},"staff":{"places":["faculty offices","staff room","headmaster's office","staff quarters"],"class":[0,1,2,2,2,2,2,1,0],"free":[0,0,1,1,1,1,1,1,0]},"ceremonial":{"places":["arbiter hall","ring dining hall","portrait hall"],"class":[0,0,0,0,0,0,0,0,0],"free":[0,0,0,0,0,0,0,0,0]},"clubs":{"places":["club rooms","student council chamber","announcement room"],"class":[0,0,0,0,1,0,3,3,0],"sat":[0,0,0,1,1,4,2,2,0],"free":[0,0,1,2,1,2,2,2,0]},"dining":{"places":["canteen"],"class":[0,3,1,1,4,1,2,4,0],"free":[0,1,1,2,4,2,2,4,0]},"dorm_social":{"places":["common rooms","fire dormitory","light dormitory","sky dormitory","viridian dormitory"],"class":[1,2,0,0,1,0,2,3,3],"free":[1,1,2,2,2,2,3,3,3]},"dorm_utility":{"places":["laundry","bathhouse and washrooms","storage and lockers"],"class":[0,3,0,0,1,0,2,3,2],"free":[0,1,2,2,1,2,2,3,2]},"hub":{"places":["main courtyard","courtyards","notice board","mail tower"],"class":[0,2,1,1,4,1,3,2,0],"free":[0,1,2,3,3,3,3,2,0]},"mall":{"places":["mall","nightwell","merryhew's","snug","quillfeather's","pennywhistle curios","barrow & vine","greenwick's","tinker's bench","salaffian oven","tailor's row","commissary","banking house"],"class":[0,0,0,0,2,0,3,3,0],"free":[0,0,2,3,3,4,3,2,0]},"care":{"places":["medical centre"],"class":[0,1,1,1,1,1,1,1,1],"free":[0,1,1,1,1,1,1,1,1]},"stillness":{"places":["meditation rooms"],"class":[0,1,1,1,1,1,1,1,0],"free":[0,1,1,1,1,1,1,1,0]},"spirits":{"places":["spirit path"],"class":[0,1,0,0,1,0,2,2,0],"free":[0,1,1,1,1,1,2,2,0]},"gate":{"places":["reception and gatehouse","groundskeeper's lodge"],"class":[0,1,1,1,1,1,1,1,0],"free":[0,1,1,1,1,1,1,1,0]},"enclave":{"places":["dovecote","cathedral","noble houses' liaison","royal inspectorate"],"class":[0,1,1,1,1,1,1,1,0],"free":[0,1,1,2,1,1,1,1,0]},"site":{"places":["detention tower","warden's office","seal chamber"],"class":[0,0,0,0,0,0,1,0,0],"free":[0,0,0,0,0,0,0,0,0]},"heights":{"places":["bell tower","rooftop","observation tower"],"class":[0,0,0,0,0,0,1,1,1],"free":[0,0,1,1,1,1,1,2,1]},"sport":{"places":["sports field","gymnasium","swimming pool","archery range"],"class":[0,1,0,0,1,0,3,3,0],"free":[0,1,2,3,2,3,3,2,0]},"combat":{"places":["combat grounds","sparring pavilion"],"class":[0,1,0,0,0,3,3,2,0],"free":[0,1,1,2,1,2,2,1,0]},"green":{"places":["gardens","founder's statue and park","menagerie","broken statue"],"class":[0,1,0,0,1,0,2,2,0],"free":[0,1,2,2,2,3,2,2,0]},"lake":{"places":["boathouse and lake","fishing house","willow island"],"class":[0,2,0,0,1,0,2,2,0],"free":[0,2,2,3,2,3,2,2,0]},"hills":{"places":["grassy field and hills","old hut"],"class":[0,0,0,0,0,0,2,2,0],"free":[0,1,2,2,2,3,2,2,0]},"forest":{"places":["forest","forest clearing"],"class":[0,0,0,0,0,1,0,0,0],"free":[0,0,1,1,0,1,1,0,0]}},"cues":[["*","cue","the weather heard from indoors",{"out":false,"wx":["rain","snow","wind","storm"]}],["*","cue","the weather on skin and clothes",{"out":true}],["*","cue","the quality of the light right now",{}],["*","cue","the temperature of the air",{}],["*","cue","the general noise of people",{"min":3}],["*","cue","a small sound that the quiet makes loud",{"max":1}],["teaching","cue","chalk dust and the worn desks of a teaching room",{}],["teaching","cue","the rustle of a full room settling",{"min":3}],["craft","cue","the work being done here, its tools and its mess",{}],["craft","cue","heat and noise from the benches",{"min":3}],["study","cue","the particular hush of this room",{}],["study","cue","lamplight on the tables",{"tb":["evening","night"]}],["study","cue","the tension of people cramming",{"exam":true}],["staff","cue","the formality of the corridor",{}],["ceremonial","cue","the size of the room when it is empty",{"max":0}],["ceremonial","cue","the whole hall's noise under the vault",{"min":3}],["clubs","cue","the clutter of rooms many clubs share",{}],["dining","cue","the din of a full canteen",{"min":3}],["dining","cue","the kitchen heard through the hatch",{"max":1}],["dining","cue","what the kitchen is serving today",{}],["dorm_social","cue","the dorm's warmth and lived-in clutter",{}],["dorm_social","cue","the fire or lamps in the common room",{"tb":["evening","night"]}],["dorm_utility","cue","steam, soap or damp stone",{}],["hub","cue","how full or empty the courtyard is right now",{}],["hub","cue","the season in the courtyard",{}],["mall","cue","the wares on show in the shops",{}],["mall","cue","the bustle between the stalls and shops",{"min":3}],["care","cue","the clean, herb-hung rooms of the place",{}],["stillness","cue","the silence, and the still pool in the courtyard",{}],["stillness","cue","cushions, low light and cool stone",{}],["spirits","cue","what the lesser spirits are doing in the trees",{}],["spirits","cue","the green light under the trees and the stone cairns along the path",{}],["gate","cue","the traffic at the gate",{}],["enclave","cue","the change in the air past the academy's ground",{}],["site","cue","the silence and the cold",{}],["heights","cue","the height and the wind",{}],["heights","cue","the stars",{"tb":["night"],"wx":["clear"]}],["sport","cue","the grass, the floor or the water underfoot",{}],["combat","cue","the scuffed rings and the scorch marks of spent magic",{}],["green","cue","what is growing or blooming this season",{}],["lake","cue","the water's mood right now",{}],["lake","cue","mist on the water",{"tb":["dawn","morning"]}],["hills","cue","the openness and the wind in the grass",{}],["hills","cue","the castle small in the distance",{}],["forest","cue","the light under the trees",{}],["forest","cue","the forest's quiet or its noise",{}]],"beats":[["*","tex","a bell marking the hour or a period",{"far":true,"curfew":true}],["*","tex","voices carrying from somewhere out of sight",{"far":true,"curfew":true}],["*","tex","someone hurrying past on an errand",{}],["*","tex","laughter from a group close by",{"min":2}],["*","tex","an argument kept to a low hiss nearby",{"min":2}],["*","tex","an Announcement Pillar crackling with a notice",{"far":true}],["*","tex","casual magic used for something trivial nearby",{"min":2}],["*","tex","overheard: a live rumour, in someone else's words",{"min":2,"special":"overheard"}],["*","tex","the weather turning",{"far":true,"curfew":true,"special":"weather_turn"}],["*","tex","an event echo",{"special":"event_echo"}],["*","brush","someone mistakes {{user}} for someone else",{"min":2}],["*","brush","someone asks {{user}} for directions or the time",{"min":2}],["*","brush","a stray object ends up at {{user}}'s feet",{}],["*","brush","the wind takes something of {{user}}'s or someone else's",{"out":true,"wx":["wind","storm"]}],["*","tex","a patrol's lantern passing at a distance",{"far":true,"curfew":true,"tb":["night"]}],["teaching","tex","a lecture overheard through a door",{"min":3}],["teaching","tex","a note passed along a bench",{"min":2}],["teaching","tex","chalk or quill scratching in an empty room nearby",{"far":true}],["teaching","brush","someone borrows or returns something of {{user}}'s",{"min":3}],["craft","tex","a small mishap at a bench (a fizz, a crack, a curse)",{"min":2}],["craft","tex","tools and vessels settling and ticking as they cool",{"far":true}],["craft","brush","a spark or splash from someone's work reaches {{user}}",{"min":2}],["study","tex","a stifled laugh and someone shushing it",{"min":2}],["study","tex","books being shelved or carted",{"far":true}],["study","tex","someone asleep over their notes",{"exam":true}],["study","brush","someone asks {{user}} to keep an eye on their things",{"min":2}],["staff","tex","a door opening on a teacher's voice mid-sentence",{}],["staff","tex","staff talking shop behind a door",{"far":true}],["staff","brush","a passing teacher glances at {{user}} and remembers something",{}],["ceremonial","tex","staff preparing the room for the next occasion",{"far":true}],["ceremonial","tex","a table breaking into a toast or a cheer",{"min":3}],["ceremonial","brush","{{user}} is jostled in the crush at the doors",{"min":3}],["clubs","tex","a club rehearsing, arguing or recruiting behind a door",{"min":2}],["clubs","tex","a notice or flyer being pinned up",{}],["clubs","brush","someone tries to recruit {{user}} for something",{"min":2}],["dining","tex","a table celebrating or daring someone",{"min":3}],["dining","tex","someone at a nearby table eating alone",{"min":2}],["dining","brush","a spill or a tipped tray reaches {{user}}",{"min":3}],["dining","brush","someone asks to share {{user}}'s table",{"min":2}],["dorm_social","tex","a game, a card table or a study group in full swing",{"min":2}],["dorm_social","tex","something going on in someone's room upstairs",{"far":true,"curfew":true}],["dorm_social","tex","late whispering on the stairs",{"tb":["night"]}],["dorm_social","brush","a dormmate drags {{user}} into something small",{"min":2}],["dorm_utility","tex","someone's laundry mishap",{}],["dorm_utility","brush","a mix-up with {{user}}'s things",{}],["hub","tex","a crowd gathered around something",{"min":3}],["hub","tex","students flooding out between periods",{"min":3}],["hub","tex","a notice going up on the board",{}],["hub","brush","a flyer, a leaflet or a message pressed into {{user}}'s hand",{"min":3}],["mall","tex","haggling or a small scene at a counter",{"min":2}],["mall","tex","a shopkeeper calling out a deal",{}],["mall","brush","a shopkeeper tries to sell {{user}} something",{"min":1}],["care","tex","someone being patched up nearby",{}],["care","tex","coughing from the beds",{"flu":true}],["care","brush","a volunteer offers {{user}} something (water, a remedy, a seat)",{}],["stillness","tex","someone breathing slowly in the next room",{}],["stillness","tex","a student slipping out, calmer than they came in",{}],["stillness","brush","someone nods {{user}} to a free cushion without a word",{}],["spirits","tex","a knot of pollen-light drifting against the breeze",{"season":["Spring"],"far":true}],["spirits","tex","a leaf-shaped spirit riding a new shoot as it unfurls",{"season":["Spring"],"far":true}],["spirits","tex","three tiny lights playing tag between the cairns",{"season":["Spring"],"far":true}],["spirits","tex","a spirit like a dragonfly of green glass hovering at eye level",{"season":["Summer"],"far":true}],["spirits","tex","warm motes gathering in the one patch of sun",{"season":["Summer"],"far":true}],["spirits","tex","something small drinking from a dew-filled leaf, then gone",{"season":["Summer"],"far":true}],["spirits","tex","leaves stirring in a spiral on a windless path",{"season":["Autumn"],"far":true}],["spirits","tex","a russet spirit shaped like a squirrel, sorting acorns it cannot eat",{"season":["Autumn"],"far":true}],["spirits","tex","a pale light nesting in a hollow stump",{"season":["Autumn"],"far":true}],["spirits","tex","tracks in the snow that stop in the middle of the path",{"season":["Winter"],"far":true}],["spirits","tex","frost ferns growing on a cairn while {{user}} watches",{"season":["Winter"],"far":true}],["spirits","tex","a breath of warm air where a small spirit sleeps under the roots",{"season":["Winter"],"far":true}],["spirits","brush","a lesser spirit settles on {{user}}'s shoulder for a moment, looks them over, and leaves",{"far":true}],["gate","tex","someone signing in or being turned away",{}],["gate","tex","a delivery arriving",{}],["gate","brush","the porter asks {{user}} to pass something on",{}],["enclave","tex","an official about their business",{}],["enclave","tex","a service, a drill or a meeting heard from inside",{"far":true}],["enclave","brush","{{user}} is watched a moment too long",{}],["site","tex","a sound the stone makes on its own",{"far":true}],["site","brush","a feeling of being noticed, with no one there",{}],["heights","tex","the campus below going about its business",{"far":true}],["heights","tex","stargazers setting up",{"tb":["night"],"wx":["clear"]}],["heights","brush","the wind nearly takes something",{"wx":["wind","storm"]}],["sport","tex","a match or a practice going on",{"min":3}],["sport","tex","a team shouting or a coach's whistle",{"min":2}],["sport","brush","a ball or a stray arrow lands near {{user}}",{"min":2}],["sport","brush","someone asks {{user}} to make up the numbers",{"min":2}],["combat","tex","a duel or drill going on in a warded ring",{"min":2}],["combat","tex","the ward lines humming or flickering",{"far":true}],["combat","brush","a stray spark or gust from a ring reaches {{user}}",{"min":2}],["green","tex","a queue of students touching the Founder's Hand",{"exam":true,"tb":["morning"]}],["green","tex","a gardener or handler at work",{}],["green","tex","an animal making itself known",{"far":true}],["green","brush","a creature or a plant takes an interest in {{user}}",{}],["lake","tex","birds or fish on the water",{"far":true}],["lake","tex","rowers, swimmers or anglers out",{"min":2}],["lake","tex","a voice carrying too clearly across the water",{"far":true}],["lake","brush","something washes up or drifts to {{user}}",{}],["hills","tex","people out on the slopes (kites, blankets or sledges by season)",{"min":2}],["hills","tex","the Forest's edge making a sound",{"far":true}],["hills","brush","the wind takes something across the grass",{"wx":["wind","storm"]}],["forest","tex","something moving unseen in the undergrowth",{"far":true}],["forest","tex","tracks in the snow that are not a deer's",{"far":true,"wx":["snow"]}],["forest","tex","an offering left on a stump by someone who ate here",{"far":true}],["forest","brush","a branch, a bramble or a root catches {{user}}",{}]],"uncanny":[{"id":"third_stall","uid":205,"title":"The Third Stall","places":["bathhouse and washrooms"],"from":1200,"to":360,"text":"the Third Stall answers {{user}}'s knock, or its latch moves by itself"},{"id":"long_corridor","uid":206,"title":"The Long Corridor","places":["lecture halls","notice board","club rooms","seminar rooms","storage and lockers"],"from":1200,"to":360,"alone":true,"text":"the corridor runs longer than it should, and the time does not add up"},{"id":"three_knock","uid":207,"title":"The Three O'Clock Knock","places":["fire dormitory","light dormitory","sky dormitory","viridian dormitory","common rooms"],"from":170,"to":190,"awake":true,"text":"three evenly spaced knocks at {{user}}'s door"},{"id":"crying_water","uid":208,"title":"The Crying on the Water","places":["boathouse and lake","fishing house","willow island"],"dark":true,"text":"a woman crying somewhere out on the water, never from the same place twice"},{"id":"night_student","uid":209,"title":"The Night Student","places":["lecture halls"],"curfew":true,"x2":"remembrance","text":"a student in an old-cut uniform, sitting as if waiting for a class"},{"id":"library_sleep","uid":224,"title":"Sleeping in the Library","places":["main library","study rooms"],"asleep":true,"text":"{{user}} wakes in a reading room that is subtly wrong, and nobody else is there"},{"id":"taken","uid":226,"title":"Taken","places":["forest","grassy field and hills","old hut","main courtyard","courtyards"],"dark":true,"out":true,"text":"{{user}}'s own name called in the dark by someone out of sight"},{"id":"thirteenth_stroke","title":"The Thirteenth Stroke","places":[],"out":true,"from":1200,"to":360,"text":"the Bell Tower strikes once more than the hour, with no one in the tower"},{"id":"night_swimmer","title":"The Night Swimmer","places":["swimming pool"],"dark":true,"x2":"winter","text":"someone swimming lengths in the steam, the lane rope moving, and the water empty"},{"id":"walking_lantern","title":"The Walking Lantern","places":["grassy field and hills","old hut"],"dark":true,"text":"a single lantern light crossing the ridge with no one carrying it"},{"id":"breath_glass","title":"Breath on the Glass","places":["gardens"],"from":960,"to":1320,"text":"the greenhouse glass fogs from the inside around a handprint that is not {{user}}'s"},{"id":"pens_quiet","title":"When the Pens Go Quiet","places":["menagerie"],"dusk":true,"text":"every animal in the pens falls silent at once and faces the Forest"},{"id":"faraway_laugh","title":"The Faraway Laugh","places":["founder's statue and park"],"dark":true,"text":"a woman's laugh from the old trees, faint, as if far away"},{"id":"polite_walker","title":"The Polite Walker","places":[],"path":true,"dusk":true,"alone":true,"text":"footsteps behind {{user}} on the long path that stop when {{user}} stops"},{"id":"last_bed","title":"The Last Bed","places":["medical centre"],"from":1260,"to":360,"text":"the curtain round the last bed is drawn and someone breathes behind it; the ward register says the bed is empty"},{"id":"other_climber","title":"The Other Climber","places":["rooftop"],"dark":true,"text":"someone sitting on the far gable in {{user}}'s posture, wearing {{user}}'s dorm vest"},{"id":"applause","title":"The Applause","places":["club rooms"],"from":1080,"to":1380,"text":"applause from the empty upper tiers of the old amphitheatre, and one seat folded down"}]};
const AMB_LEVELS = ['empty', 'quiet', 'some people', 'busy', 'packed'];
// Settings > Campus life > Ambient moments (tune amb_freq): d100 at or under "calm" is a quiet beat. 1.43.0 (audit 3.6): the same
// setting scales the outside areas' small life (street sights, people met, pickpockets and hustlers, the airship's sky, stage and
// hold) by its share of moments against Normal; story beats (Tsubaki lost, the Leviathan, raids, scouts) and the Expedition do not move.
const AMB_CALM = { 1: 70, 2: 55, 3: 40 };
const lifeX = TU => (100 - (AMB_CALM[TU.amb_freq] || AMB_CALM[2])) / (100 - AMB_CALM[2]);
const HAPPEN_RATE = { off: 0, rare: 0.2, normal: 0.4, often: 0.65 };
// hash32, rand01, roll100, d100, rollInt, pickOf and rollTable: shared.js (seeded draws)
const JOURNAL_ARCHIVE = 120;   // the engine's notes ($ui.jnotes)
// 1.64.0 (memory audit M6, from batch 2's numbers): the Journal lines that left the narrator's view ($ui.archive) are kept for the
// panel and for recall; 240 lines are about 8,000 of the owner's replies and about 20 KB a stored floor. Older ones live on as folds.
const ARCHIVE_MAX = 240;
// 1.61.0 (memory audit M2): the engine's routine Journal lines, which leave the window first (stepRecords)
const JOURNAL_LOW = /^(?:\[[^\]]*\]\s*)?(?:Meanwhile: |First visit to )/;
// 1.62.0 (memory audit M3): a pinned line starts with "!" (after its date). The narrator pins rarely; the engine pins its landmarks
// (a mystery solved, a lasting change to the world, a hidden truth uncovered, a new school year, the graduation, a romance, Rank 10).
// A pinned Journal line that leaves the window stays in view in _Kept_from_earlier (KEPT_MAX); in Knows and Known_facts the newest
// PIN_MAX pinned lines of a character stay in view past the cap.
const PINNED = /^(?:\[[^\]]*\]\s*)?!/;
const JOURNAL_LANDMARK = /^(?:Solved: |.+, changed for good: |Uncovered a hidden truth about |Began Year \d+ at Halvard\.|The third-years graduated |Romance began with |Rank 10 with )/;
const KEPT_MAX = 20, PIN_MAX = 5;
// 1.63.0 (memory audit M5, owner-approved "Summaryception mini"): older memory is folded, never dropped. Journal lines that leave the
// window (and pinned lines past KEPT_MAX) wait in $eng.jq; every FOLD.l1 of them become one Chronicle entry (L1, at most FOLD.w1
// words); past FOLD.l1max L1 (or L2) entries the oldest FOLD.l2 become one L2 entry (FOLD.w2); when a campaign year is over, its L1 and L2
// entries become one L3 entry (FOLD.w3). A character's Knows and Known_facts lines that leave the view wait at the end of
// $Knows_old / $Known_old ($Knows_q / $Known_q of them); once FOLD.bond wait and the character is on a full Cast Sheet, they (with the
// list's earlier fold line) become one fold line "[until <date>] …" (FOLD.wb words) that stays first in view. The engine asks for one
// fold at a time through the fold rule card (511, [mvu_update]: the update model writes /Fold in extra-model mode, the narrator in
// one-call mode); a fold not written after FOLD.patience replies with an update block is made plainly by the engine.
const FOLD = { l1: 10, w1: 50, l1max: 12, l2: 4, w2: 70, w3: 100, bond: 5, bondTake: 12, wb: 40, patience: 8, waitMax: 60 };
const FOLDED = /^\[until [^\]]*\]/;
// 1.57.0 (narrator-load audit U3, owner-approved): the Journal the narrator reads is the story's spine (turning points, matters still
// open, the engine's off-screen events). The engine's bookkeeping (rank and reputation changes, marks, proficiency ranks, week
// recaps, perk use, a remedial attended, coin stolen) goes to $ui.jnotes: the player's Journal panel shows it, the narrator does not.
const ENGINE_NOTE = /^(?:\[[^\]]*\]\s*)?(?:Bond with .+ deepened to Rank \d+\.|The bond with .+ broke down to Rank \d+\.|Week recap \(|(?:Academy|Student|Doves) reputation (?:rose|fell) to |.+ reached Rank \d+ \(.+\)\.$|.+ marks: |.+ attended: the .+ F counts as a D\.|\{\{user\}\} used .+ \(from |.+ took \d+ coin from \{\{user\}\} at )/;
// 1.57.0: places a first visit is worth remembering (data/locations.json: an access rule, or the sealed site); the student's own dorm
// is everyday life
const NOTABLE = new Set(["Detention Tower", "Faculty Offices", "Fire Dormitory", "Forest", "Headmaster's Office", "Light Dormitory", "Restricted Section", "Rooftop", "Sky Dormitory", "Spirit Path", "Staff Quarters", "Staff Room", "The Dovecote", "The Noble Houses' Liaison", "The Ring Dining Hall", "The Royal Inspectorate", "The Seal Chamber", "The Warden's Office", "Viridian Dormitory", "Willow Island"]);
const FACTS_VISIBLE = 10;      // 5.4 token budget: the narrator reads each bond's latest 10 Known_facts; older ones go to $Known_old   // $ui.archive: journal lines the narrator no longer reads (UI only)

// ---------- helpers ----------
const pad = x => String(x).padStart(2, '0');
const toAbs = W => {
  const [h, mi] = String(W.Time || '08:00').split(':').map(Number);
  const di = Math.max(0, DAYS.indexOf(W.Day));
  const day = (((W.Year || 1) - 1) * YEAR_DAYS) + ((W.Month - 1) * 28) + ((W.Week - 1) * 7) + di;
  return day * DAY_MIN + (h || 0) * 60 + (mi || 0);
};
const fromAbs = abs => {
  let day = Math.floor(abs / DAY_MIN), min = abs - day * DAY_MIN;
  const Year = Math.floor(day / YEAR_DAYS) + 1; day -= (Year - 1) * YEAR_DAYS;
  const Month = Math.floor(day / 28) + 1; day -= (Month - 1) * 28;
  const Week = Math.floor(day / 7) + 1; day -= (Week - 1) * 7;
  return { Year, Month, Week, Day: DAYS[day], Time: `${pad(Math.floor(min / 60))}:${pad(min % 60)}` };
};
// 1.7.4: from campaign Year 2 every date the engine writes carries its year ("Y2 M1 W1 Mon"), so the age of a line is right across
// years (<now>, Cast Sheet) and the Journal groups by year; Year 1 keeps the plain form. withYear() adds a year to a leading bare date.
const yPre = W => ((W.Year || 1) > 1 ? `Y${W.Year} ` : '');
const stamp = W => `${yPre(W)}M${W.Month} W${W.Week} ${W.Day} ${W.Time}`;
const withYear = (s, Y) => String(s).replace(/^(\[?)(M\d{1,2} W[1-4]\b)/, `$1Y${Y} $2`);
const eventsOn = W => EVENTS.filter(e => e.m === W.Month && e.w === W.Week && e.d.includes(W.Day));
const pctOf = (v, max) => (max > 0 ? (v / max) * 100 : 0);
const num = (v, d = 0) => { const x = Number(v); return Number.isFinite(x) ? x : d; };
// 1.42.0 (audit 1.5): the lines a list gained, counted as a multiset: a line written again ("-3 tea at the Snug" on another
// day, "+40 tutoring (History)" next week) is new even though the same text is already in the list
const newLines = (before, after) => { const n = _.countBy(Array.isArray(before) ? before : []), seen = {};
  return (Array.isArray(after) ? after : []).filter(l => (seen[l] = (seen[l] || 0) + 1) > (n[l] || 0)); };
const dstamp = W => `${yPre(W)}M${W.Month} W${W.Week} ${W.Day}`;
const ydate = W => `Y${W.Year || 1} M${W.Month} W${W.Week} ${W.Day}`;   // 1.72.0: always with its year ($met, $b8)
// Parses a due/until text written by the AI ("M2 W1 Tue 14:00", "Month 3 Week 2", "Fri 18:00", "tomorrow 9am", "M4") into an
// absolute minute, relative to the current world time W. Missing parts: day -> Sunday of that week (or the next such weekday),
// week -> week 4 when only a month is given, time -> 23:59. Returns -1 when nothing date-like is found.
function parseWhen(str, W, absNow) {
  const s = String(str || '');
  const m = s.match(/\b(?:M|Month\s*)(\d{1,2})\b/i), w = s.match(/\b(?:W|Week\s*)([1-4])\b/i);
  const d = s.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:s|[a-z]*day)?\b/i);   // not \"Month\"
  const t = s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || s.match(/\b(\d{1,2}):(\d{2})\b/);
  const rel = s.match(/\b(today|tonight|tomorrow)\b/i);
  // 1.11.1 (bug hunt): parts of the day ("by noon", "Sat morning"), "in two days", "next week" and a year ("Y2 M1 W1 Mon")
  const tw = s.match(/\b(noon|midday|midnight|morning|afternoon|evening)\b/i);
  const inN = s.match(/\bin\s+(a|an|one|two|three|four|five|six|seven|\d{1,2})\s+(days?|weeks?)\b/i), nextWk = /\bnext week\b/i.test(s);
  const y = s.match(/\bY(\d{1,2})\b/);
  if (!m && !w && !d && !t && !rel && !tw && !inN && !nextWk) return -1;
  let hh = 23, mm = 59;
  if (t) { hh = +t[1] % 24; mm = +(t[2] || 0); if (t[3]) { hh = hh % 12 + (/pm/i.test(t[3]) ? 12 : 0); } }
  else if (tw) [hh, mm] = { noon: [12, 0], midday: [12, 0], midnight: [23, 59], morning: [9, 0], afternoon: [15, 0], evening: [19, 0] }[tw[1].toLowerCase()];
  else if (rel && /tonight/i.test(rel[1])) { hh = 21; mm = 0; }
  const dayStart = Math.floor(absNow / DAY_MIN) * DAY_MIN;
  if (inN && !m && !w && !d) {
    const n = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 }[inN[1].toLowerCase()] || +inN[1];
    return dayStart + n * (/^week/i.test(inN[2]) ? 7 : 1) * DAY_MIN + hh * 60 + mm;
  }
  if (nextWk && !m && !w) {                                    // next week: that weekday of it, else by its Sunday
    const mon = dayStart + (7 - DAYS.indexOf(W.Day)) * DAY_MIN;
    return mon + (d ? DAYS.indexOf(d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase()) : 6) * DAY_MIN + hh * 60 + mm;
  }
  if (rel && !m && !w && !d) return dayStart + (/tomorrow/i.test(rel[1]) ? DAY_MIN : 0) + hh * 60 + mm;
  if (!m && !w) {                                              // weekday only: this one or the next one
    if (!d) return dayStart + hh * 60 + mm;
    const want = DAYS.indexOf(d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase()), now = DAYS.indexOf(W.Day);
    let add = (want - now + 7) % 7; const at = dayStart + add * DAY_MIN + hh * 60 + mm;
    return add === 0 && at < absNow - 12 * 60 ? at + 7 * DAY_MIN : at;
  }
  const M = m ? _.clamp(+m[1], 1, 12) : W.Month, Wk = w ? +w[1] : (m ? 4 : W.Week);
  const Dy = d ? d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase() : 'Sun';
  let abs = toAbs({ Year: y ? Math.max(1, +y[1]) : W.Year, Month: M, Week: Wk, Day: Dy, Time: `${pad(hh)}:${pad(mm)}` });
  if (y) return abs;                                           // a written year is taken as it is
  if (m && abs < absNow - 180 * DAY_MIN) abs += YEAR_DAYS * DAY_MIN;   // "M2" written in M11 means next year
  else if (!m && w && abs < absNow - 12 * 60) abs += 28 * DAY_MIN;   // "W1 Mon" written in W4 means next month
  return abs;
}
function whenText(abs, absNow) {
  if (abs < 0) return '';
  if (abs < absNow) return 'overdue';
  const T = fromAbs(abs), dd = Math.floor(abs / DAY_MIN) - Math.floor(absNow / DAY_MIN);
  const tm = T.Time === '23:59' ? '' : ' ' + T.Time;
  if (dd === 0) return 'today' + (tm || ' (by end of day)');
  if (dd === 1) return 'tomorrow' + tm;
  if (dd < 7) return `in ${dd} days (${T.Day}${tm})`;
  return `${T.Year !== fromAbs(absNow).Year ? `Y${T.Year} ` : ''}M${T.Month} W${T.Week} ${T.Day}${tm}`;
}
// 1.53.0 (narrator-load audit U5): a date written without its month and week ("tomorrow 09:00", "Fri 16:00", "in two days") is written
// back once as the absolute date it was anchored to, so no stale "tomorrow" stays in the state. Words that are not part of the date
// stay ("tomorrow after class" -> "M2 W2 Tue after class"); the text is kept as written when the rewrite would not read back the same.
const WHEN_WORDS = [/\b(?:today|tonight|tomorrow)\b/gi, /\bin\s+(?:a|an|one|two|three|four|five|six|seven|\d{1,2})\s+(?:days?|weeks?)\b/gi,
  /\bnext week\b/gi, /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:s|[a-z]*day)?\b/gi, /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, /\b\d{1,2}:\d{2}\b/g,
  /\b(?:noon|midday|midnight|morning|afternoon|evening)\b/gi];
function absWhen(text, abs, W, absNow) {
  const s = String(text || '').trim();
  if (abs < 0 || !s || /\b(?:M|Month\s*)\d{1,2}\b|\b(?:W|Week\s*)[1-4]\b/i.test(s)) return s;
  let rest = WHEN_WORDS.reduce((x, rx) => x.replace(rx, ' '), s).replace(/[\s,]+/g, ' ').trim();
  if (/^(?:(?:at|by|on|before|until|till|around|about|this|the|from|in|of)\b\s*)*$/i.test(rest)) rest = '';
  const T = fromAbs(abs), out = `${T.Year > 1 ? `Y${T.Year} ` : ''}M${T.Month} W${T.Week} ${T.Day}${T.Time === '23:59' ? '' : ' ' + T.Time}${rest ? ' ' + rest : ''}`;
  return parseWhen(out, W, absNow) === abs ? out : s;
}
const capRecord = (obj, max, dropFirst) => {                   // drop the oldest keys (insertion order), preferring dropFirst(v)
  let keys = Object.keys(obj || {}); if (keys.length <= max) return;
  const order = dropFirst ? [...keys.filter(k => dropFirst(obj[k])), ...keys.filter(k => !dropFirst(obj[k]))] : keys;
  for (const k of order.slice(0, keys.length - max)) delete obj[k];
};
// 1.44.0 (audit 3.10, Agenda): everything that waits on a date (Commitments, Hooks, Next plans, Projects, Notices, the letter home)
// shares one date marker and one status. A date is parsed once, when its text is new, and kept: "tomorrow" must not move every turn.
// Status: '' (no date) | waiting | due (from `before` minutes ahead until `grace` minutes after) | overdue; an undated Hook can be stale.
const anchorWhen = (text, prevText, prevAbs, W, absA) => (prevText === text && prevAbs >= 0 ? prevAbs : parseWhen(text, W, absA));
const AGENDA = { days: 14, kinds: { commitment: [30, 0], hook: [30, 180], project: [2 * DAY_MIN, 0], notice: [DAY_MIN, 60], letter: [0, 0] }, stale_days: 14 };
function agendaState(abs, absA, kind) {
  const [before, grace] = AGENDA.kinds[kind] || [30, 0];
  return abs < 0 ? '' : absA < abs - before ? 'waiting' : absA <= abs + grace ? 'due' : 'overdue';
}
// dates the records cannot hold ($abs on Projects and Next plans), kept in $eng.agenda.when { id: [text, abs] } (stepAgenda prunes)
function agendaWhen(c) {
  if (c.agWhen) return c.agWhen;
  const { S, absA } = c, A = S.$eng.agenda = _.isPlainObject(S.$eng.agenda) ? S.$eng.agenda : {};
  const W = A.when = _.isPlainObject(A.when) ? A.when : {};
  return (c.agWhen = (id, text, rec, key) => {
    text = String(text || '').trim(); if (!text) { delete W[id]; return -1; }
    const p = W[id], abs = anchorWhen(text, p && p[0], p ? num(p[1], -1) : -1, S.World, absA);
    if (rec) text = rec[key] = absWhen(text, abs, S.World, absA);   // 1.53.0 (U5)
    W[id] = [text, abs]; return abs;
  });
}

function periodOf(W, evs, S) {
  const [h] = W.Time.split(':').map(Number);
  const tt = timetableFor(W, S);
  const suspended = evs.find(e => e.noclass || e.home || e.lockdown);
  let p;
  if (!tt) p = 'Sunday (no classes)';
  else if (h < 7) p = 'Night';
  else if (h * 60 < P1[0]) p = 'Morning, before classes';
  else if (h * 60 < P1[1]) p = `P1 ${PERIOD_TEXT[0]}: ${tt[0]}`;
  else if (h * 60 < P2[1]) p = `P2 ${PERIOD_TEXT[1]}: ${tt[1]}`;
  else if (h * 60 < P3[0]) p = 'Lunch';
  else if (h * 60 < P3[1]) p = `P3 ${PERIOD_TEXT[2]}: ${tt[2]}`;
  else if (h < 20) p = 'After classes';
  else p = 'Evening';
  if (suspended && /^P\d/.test(p)) p = `Timetable suspended (${suspended.t.split(' (')[0]})`;
  // 1.30.2 (owner playtest): on a day without classes (Entrance Event, breaks, lockdown) nothing is "before" or "after" classes
  else if (suspended && p === 'Morning, before classes') p = 'Morning, no classes today';
  else if (suspended && p === 'After classes') p = 'Afternoon, no classes today';
  return p;
}
function curfewOf(W, evs, S) {
  if (evs.some(e => e.lockdown)) return 'LOCKDOWN (The Thinning): academy sealed, nobody outside, all week';
  if (evs.some(e => e.home)) return 'Break: most students have gone home; campus nearly empty';
  const [h] = W.Time.split(':').map(Number);
  // v1.0.3 (F01): on a trip or an off-grounds day, and not at a campus place, the dorm curfew does not apply
  const Tr = (S && S.Trip) || {};
  // 1.39.0: Halvard's Kingdom Competition team in Avalon keeps the Whitestone Hotel's hours (lore 19: Gavlan Haverton escorts them)
  // 1.40.0: aboard the airship nobody keeps dorm hours; the teachers count heads at boarding and landing
  if (placeOf(W.Location) === AIR.area) return 'Away from campus (aboard the airship): the dorm curfew does not apply; the teachers count heads at boarding and landing';
  // 1.41.0: the Academy Trip keeps the teachers' hours at The Hanabira (lore 247)
  if (placeOf(W.Location) === SR.area) { const [c0, c1] = SR.curfew || [22, 7]; return h >= c0 || h < c1 ? `Hotel curfew (${pad(c0)}:00-${pad(c1)}:00): the teachers' curfew at ${AR.sunreach.PL[SR.hotel].name}; students stay in their rooms` : `Away from campus (Sunreach Bay, the Academy Trip): the dorm curfew does not apply; back at ${AR.sunreach.PL[SR.hotel].name} by ${pad(c0)}:00`; }
  if (placeOf(W.Location) === AV.area && avKingdom(W, S || {})) return h >= 22 || h < 7 ? 'Hotel curfew (22:00-07:00): the team stays in its rooms at the Whitestone Hotel; Gavlan Haverton keeps watch' : h >= 21 ? 'Back at the Whitestone Hotel by 22:00 (free time in the city ended at 21:00)' : 'Away from campus (Avalon, with the team): the dorm curfew does not apply; free time in the city until 21:00, the Whitestone Hotel by 22:00';
  if (!onCampus(W.Location) && (Tr.Active || evs.some(e => e.away))) return `Away from campus${Tr.Active && Tr.Destination ? ` (${Tr.Destination})` : ''}: the dorm curfew does not apply; the teachers in charge set the rules`;
  // v1.0.3 (A#6): a no-curfew event lifts it from its first day's evening to its last day's dawn, not for the whole two days
  const nc = evs.find(e => e.nocurfew);
  if (nc && ((W.Day === nc.d[0] && h >= 12) || (W.Day === nc.d[nc.d.length - 1] && W.Day !== nc.d[0] && h < 7))) return '';
  const start = evs.map(e => curfewHour(e, W.Day)).find(Boolean) || 20;
  return h >= start || h < 7 ? `CURFEW (${start}:00-07:00): students must be in their own dorms` : '';
}

// 1.3.4 (owner): the next thing on today's schedule, for the bracelet ($ui.next): an event's timed item ("09:00 sorting at the
// Arbiter Stone…", "dusk (about 17:00): …"), a class period, curfew. Nothing left today -> null.
function nextUp(W, evs, S) {
  const now = hm(W.Time); if (now == null) return null;
  const items = [], cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  for (const e of evs) for (const part of String(schedOf(e, W.Day) || '').split(/;\s+/)) {
    const p = part.trim(); let m = /^(\d{1,2}):(\d{2})(?:\s*[–-]\s*(\d{1,2}):(\d{2}))?\s+(.+)$/.exec(p);
    if (m) { items.push({ at: +m[1] * 60 + +m[2], what: cap(m[5]), kind: 'event' }); continue; }
    m = /^(.*?)\(about (\d{1,2}):(\d{2})\):?\s*(.*)$/.exec(p);
    if (m) items.push({ at: +m[2] * 60 + +m[3], what: cap((m[4] || m[1]).trim()), kind: 'event' });
  }
  const tt = timetableFor(W, S), stop = evs.some(e => e.noclass || e.home || e.lockdown || e.away);
  if (tt && !stop) PERIODS.forEach(([at], i) => items.push({ at, what: String(tt[i]).replace(/\s*\[[MD]\]/g, ''), kind: /^(Study Hall|Clubs)/.test(tt[i]) ? 'club' : 'class' }));
  const noCurfew = evs.some(e => e.lockdown || e.home || (e.nocurfew && W.Day === e.d[0])) || /^Away/.test(W._Curfew || '');
  if (!noCurfew) items.push({ at: (evs.map(e => curfewHour(e, W.Day)).find(Boolean) || 20) * 60, what: 'Curfew: back to your dorm', kind: 'curfew' });
  const next = items.filter(x => x.at > now).sort((a, b) => a.at - b.at || (a.kind === 'event' ? -1 : b.kind === 'event' ? 1 : 0))[0];
  return next ? { at: `${pad(Math.floor(next.at / 60))}:${pad(next.at % 60)}`, what: next.what, kind: next.kind } : null;
}

// ---- F20 happenings ----
function dayParts(dayNo) { const doy = ((dayNo % YEAR_DAYS) + YEAR_DAYS) % YEAR_DAYS; return { Month: Math.floor(doy / 28) + 1, Week: Math.floor((doy % 28) / 7) + 1, Day: DAYS[doy % 7] }; }
function happeningFits(h, P) {
  const d = h.days || 'any';
  if (d === 'weekday' && !MON_FRI.includes(P.Day)) return false;
  if (d === 'weekend' && MON_FRI.includes(P.Day)) return false;
  if (Array.isArray(d) && !d.includes(P.Day)) return false;
  if (h.months && (P.Month < h.months[0] || P.Month > h.months[1])) return false;
  if (h.weeks && !h.weeks.includes(P.Week)) return false;
  return true;
}
// 1.1.0: weather (wxm = the Weather effects level). Full: outdoor items skip heavy weather, weather-only items need their weather,
// a fallen tree is 3x likelier the day after a storm. Any level but Off: "clear_night" items need a clear night (their text says so).
function wxFits(h, seed, dayNo, wxm) {
  if (wxm === 'off') return !h.weather || h.weather === 'clear_night';
  const D = wxDay(seed, dayNo).blocks, Y = wxDay(seed, dayNo - 1).blocks;
  if (h.weather === 'clear_night') return D[2].sky === 'Clear';
  if (wxm !== 'full') return !h.weather;
  if (h.outdoor && (wxHeavy(D[0]) || wxHeavy(D[1]))) return false;
  if (h.weather === 'snow') return Y[2].snow || D[0].snow;
  if (h.weather === 'after_storm') return Y.some(b => b.rare === 'lightning storm' || b.wind === 'gale');
  if (h.weather === 'dense_fog') return D[0].rare === 'dense fog';
  return !h.weather;
}
function rawHappening(seed, dayNo, rate, exclude, wxm = 'off') {
  const P = dayParts(dayNo), evs = eventsOn(P);
  if (!rate || evs.some(e => e.home || e.lockdown)) return null;       // breaks and the Thinning: nothing
  const stormy = wxm === 'full' && wxDay(seed, dayNo - 1).blocks.some(b => b.sky === 'Storm' || b.wind === 'gale');
  return rollTable(HAPPENINGS, { roll: [seed, dayNo, 'roll'], p: rate * (evs.length ? 0.5 : 1),   // calendar days are busy enough
    skip: h => !(happeningFits(h, P) && !(exclude || []).includes(h.id) && wxFits(h, seed, dayNo, wxm)),
    pick: [seed, dayNo, 'pick'], weight: h => (h.weight || 1) * (stormy && h.after_storm_x3 ? 3 : 1) });
}
// No repeat of the previous two days' happening. 1.16.1 (audit B3): "previous" means what those days actually got, so the year is
// chained from its first day (Month 12 is the holiday, with no happenings, so a year never carries one over) and cached.
const HAPY = new Map();
function happeningOn(seed, dayNo, rate, wxm) {
  const Y = Math.floor(dayNo / YEAR_DAYS), key = `${seed}|${Y}|${rate}|${wxm}`;
  let arr = HAPY.get(key);
  if (!arr) {
    arr = [];
    for (let i = 0; i < YEAR_DAYS; i++) arr.push(rawHappening(seed, Y * YEAR_DAYS + i, rate, arr.slice(-2).filter(Boolean).map(h => h.id), wxm));
    if (HAPY.size > 8) HAPY.clear();
    HAPY.set(key, arr);
  }
  return arr[dayNo - Y * YEAR_DAYS] || null;
}

// ---- 1.1.0 weather (spec §4): seasons, sky per block, wind, rare weather, °C. Pure functions of (seed, day): swipe-safe. ----
// 1.9.4 (playtest Batch 4): the academic year opens in spring. One label per season; 'Autumn' is the internal and displayed name.
// SEASONS (by Month - 1) is in shared.js (data/calendar.json)
const SKY = ['Clear', 'Cloudy', 'Overcast', 'Fog', 'Rain', 'Storm'];
const WX_BASE = { Winter: [25, 20, 25, 10, 18, 2], Spring: [30, 25, 15, 8, 20, 2], Summer: [50, 22, 8, 3, 12, 5], Autumn: [28, 22, 20, 12, 16, 2] };
const WX_BLOCK = [{ Fog: 2, Storm: 0.5 }, { Fog: 0.3, Storm: 1.8 }, {}];   // morning, afternoon, night
const WX_TRANS = { Clear: { Clear: 2, Cloudy: 1.2, Overcast: 0.6, Rain: 0.4, Storm: 0.6 }, Cloudy: { Cloudy: 1.4, Overcast: 1.3 },
  Overcast: { Overcast: 1.5, Rain: 2, Clear: 0.5 }, Fog: { Clear: 1.5, Cloudy: 1.3, Fog: 0.4 }, Rain: { Rain: 1.8, Overcast: 1.5, Storm: 1.3, Clear: 0.4 },
  Storm: { Rain: 2, Overcast: 1.5, Storm: 0.5 } };
const WX_MEAN = [9, 12, 15, 18, 21, 22, 19, 14, 9, 4, 1, 1];   // monthly mean °C (1.9.4: rebaselined for the spring start)
const BLOCKS = ['morning', 'afternoon', 'night'], BLOCK_T = [-2, 4, -4];
const FC_NEAR = { Clear: ['Cloudy'], Cloudy: ['Clear', 'Overcast', 'Fog'], Overcast: ['Cloudy', 'Rain'], Fog: ['Cloudy'], Rain: ['Overcast', 'Storm'], Storm: ['Rain'] };
const FC_TRUE = 75;            // Divination Society forecast: d100 <= 75 -> the true sky (owner: 70-80%)
const tempLabel = t => (t <= 0 ? 'freezing' : t <= 7 ? 'cold' : t <= 14 ? 'cool' : t <= 21 ? 'mild' : t <= 27 ? 'warm' : 'hot');
// night belongs to the day it starts on: 03:00 is the night block of the previous day
const blockOf = abs => { const day = Math.floor(abs / DAY_MIN), h = Math.floor((abs - day * DAY_MIN) / 60); return h < 6 ? [day - 1, 2] : [day, h < 12 ? 0 : h < 18 ? 1 : 2]; };
function wxRollDay(seed, day, prev) {                          // prev = the previous block ({sky, wind}) or null
  const P = dayParts(day), season = SEASONS[P.Month - 1];
  // 1.30.3 (owner): on a special occasion (data/calendar.json "fair": the Entrance Event, festivals, competitions, dorm days,
  // Graduation…) the weather roll is suspended: clear and calm all day and night; the temperature still follows the season
  const fair = eventsOn(P).some(e => e.fair);
  const heat = !fair && season === 'Summer' && d100(seed, day, 'heat') >= 98;   // heatwave: the whole day clear, +8 °C
  const tv = hash32(seed, day, 'tv') % 7 - 3, blocks = [];
  for (let b = 0; b < 3; b++) {
    let sky = 'Clear';
    if (!heat && !fair) {
      const w = SKY.map(k => WX_BASE[season][SKY.indexOf(k)] * (WX_BLOCK[b][k] || 1) * (prev ? (WX_TRANS[prev.sky][k] || 1) : 1));
      let r = rand01(seed, day, b, 'sky') * w.reduce((a, x) => a + x, 0);
      sky = SKY[SKY.length - 1];
      for (let i = 0; i < SKY.length; i++) { r -= w[i]; if (r < 0) { sky = SKY[i]; break; } }
    }
    const prevWet = !!prev && (prev.sky === 'Rain' || prev.sky === 'Storm');
    let temp = WX_MEAN[P.Month - 1] + BLOCK_T[b] + tv + (sky === 'Rain' ? -2 : 0) + (season === 'Summer' && sky === 'Clear' && b === 1 ? 2 : 0) + (heat ? 8 : 0);
    let rain = '', snow = false;
    if (sky === 'Rain') {
      const ri = d100(seed, day, b, 'ri') + (prevWet ? 15 : 0);
      rain = ri <= 45 ? 'light' : ri <= 85 ? 'steady' : 'heavy';
      if (season === 'Winter' && temp <= 3) snow = d100(seed, day, b, 'snow') <= (P.Month === 10 ? 60 : 70) + (b !== 1 ? 15 : 0);
    }
    const th = 93 - (b === 1 ? 5 : 0) - (season === 'Spring' || season === 'Autumn' ? 4 : 0) - (sky === 'Rain' ? 6 : 0) - (prev && prev.wind ? 15 : 0) + (sky === 'Clear' ? 3 : 0);
    const wr = d100(seed, day, b, 'wind');
    let wind = fair ? '' : wr >= 100 ? 'gale' : wr >= th ? 'windy' : '';
    if (sky === 'Storm') wind = wr >= 95 ? 'gale' : 'windy';
    const rr = d100(seed, day, b, 'rare'), warm = season === 'Spring' || season === 'Summer';
    let rare = heat ? 'heatwave' : '';
    if (!rare && sky === 'Storm' && warm && b >= 1 && rr >= 71) rare = 'lightning storm';
    else if (!rare && sky === 'Storm' && warm && b === 1 && rr >= 51) rare = 'hail';
    else if (!rare && snow && wind) rare = 'blizzard';
    else if (!rare && sky === 'Fog' && (season === 'Autumn' || season === 'Winter') && b === 0 && rr >= 80) rare = 'dense fog';
    if (rare === 'blizzard') temp -= 6;
    blocks.push({ sky, rain, snow, wind, rare, temp: Math.round(temp) });
    prev = blocks[b];
  }
  return { season, blocks, fair };
}
const WXC = new Map();
function wxDay(seed, day) {                                    // chain without state: 3 days of warm-up, then the day itself
  const key = seed + '|' + day; if (WXC.has(key)) return WXC.get(key);
  let prev = null;
  for (let d = day - 3; d < day; d++) prev = wxRollDay(seed, d, prev).blocks[2];
  const r = wxRollDay(seed, day, prev);
  // 1.48.0 (audit 2.9): room for a whole year (happeningOn builds 336 days at once) and the days around it, so that build no longer
  // empties the cache it has just filled
  if (WXC.size > 2 * YEAR_DAYS + 64) WXC.clear(); WXC.set(key, r);
  return r;
}
function wxText(bk) {
  const main = bk.rare === 'lightning storm' ? 'lightning storm' : bk.rare === 'hail' ? 'hailstorm' : bk.rare === 'blizzard' ? 'blizzard'
    : bk.rare === 'dense fog' ? 'dense fog (visibility a few metres)' : bk.snow ? `${bk.rain} snow` : bk.sky === 'Rain' ? `${bk.rain} rain` : bk.sky.toLowerCase();
  return [main, bk.rare === 'heatwave' ? 'heatwave' : '', bk.wind && bk.rare !== 'blizzard' ? (bk.wind === 'gale' ? 'gale' : 'windy') : ''].filter(Boolean).join(', ');
}
function wxForecast(seed, day) {                               // the Divination Society's posting for `day` (rare events are never forecast)
  const D = wxDay(seed, day);
  return D.blocks.map((bk, b) => {
    let sky = bk.sky;
    // 1.30.3: a special occasion's clear sky is forecast right
    if (!D.fair && d100(seed, day, b, 'fc') > FC_TRUE) { const nb = FC_NEAR[sky]; sky = nb[hash32(seed, day, b, 'fcn') % nb.length]; }
    const t = bk.temp - (bk.rare === 'heatwave' ? 8 : 0) + (bk.rare === 'blizzard' ? 6 : 0);
    return { sky, text: sky === 'Rain' && D.season === 'Winter' && t <= 3 ? 'snow' : sky.toLowerCase(), label: tempLabel(t) };
  });
}
const wxBad = bk => !!bk && (bk.sky === 'Rain' || bk.sky === 'Storm');                              // rain, snow or storm
const wxHeavy = bk => !!bk && (bk.sky === 'Storm' || bk.rain === 'heavy' || bk.rare === 'blizzard' || bk.rare === 'hail');
// winter flu wave: 1-2 a year in Months 10-11 (Month 12 is the holiday), 5 days each, seeded
const FLU_FROM = 9 * 28;   // Month 10, Week 1
function fluOn(seed, day) {
  const Y = Math.floor(day / YEAR_DAYS), doy = day - Y * YEAR_DAYS;
  if (doy < FLU_FROM || doy >= FLU_FROM + 56) return false;
  for (let k = 0, n = rollInt(1, 2, seed, Y, 'flu'); k < n; k++) { const st = rollInt(FLU_FROM, FLU_FROM + 50, seed, Y, k, 'flus'); if (doy >= st && doy < st + 5) return true; }
  return false;
}
// outdoor places (spec §4.8; generated by gen_engine from data/locations.json) and weather gear from Bag item names
const OUTDOOR = ["archery range", "boathouse and lake", "broken statue", "combat grounds", "courtyards", "fishing house", "forest", "forest clearing", "founder's statue and park", "founders statue and park", "gardens", "grassy field and hills", "menagerie", "observation tower", "rooftop", "spirit path", "sports field", "swimming pool", "willow island"];
// 1.38.0: the Grand Vast Forest is outdoors, except inside the mouth of the Grand Cave Network
const isOutdoor = loc => { const p = placeOf(loc).toLowerCase(); if (p && p === String(EXP.area || '').toLowerCase()) return !/grand cave network/i.test(String(loc));
  for (const A of [AR.avalon, AR.sunreach]) if (p && p === String(A.area || '').toLowerCase()) { const id = areaPlace(A, loc, ''); return !!(id && A.PL[id].out); }   // 1.39.0, 1.41.0
  return !!p && OUTDOOR.some(c => p === c || p.startsWith(c + ' ') || p.startsWith(c + ',')); };
// ---- 1.46.0 (audit 3.1): the outside areas, one module. Every area's data file (data/expedition.json, avalon.json, airship.json,
// sunreach.json) becomes one record with the same parts: places (PL) and pins (PIN), the walking graph (NB, routes, path, min; the one
// search in shared.js, also used by the Map panel), the names and aliases a Location may use (NAME, ALIAS), the place parser
// (areaPlace) and the Location formatter (areaLoc), the climate (areaWx), the seeded hourly life (areaHours, areaTheft, areaStreet)
// and the moves with their fares (areaMove, paid through the ledger). The steps 4c-4f keep only what is the area's own: the
// Expedition's hunt, Avalon's White Line and muster, the airship's flights, Sunreach's bets and sea.
// o: salt (the hourly rolls' seed word, kept from 1.38-1.41 so old chats swipe the same), words (the area's own names: a Location with
// one is in the area; "in" those that also let the short aliases count), arrive (where a bare area name lands), aliasDetail (an alias
// after a place's name stays as a detail of the Location), blocked (a pin that can be reached but not crossed), modes (carriage,
// boat, tour: fare and wording), crowd (a leg the crowds slow, and its note), theft (the pickpocket or hustler's roll words).
const EXP = {"area":"Grand Vast Forest","event":"Creature Studies Expedition","map":"map/grand_vast_forest.webp","places":[{"id":"base_camp","name":"Base Camp","group":"base_camp","x":50,"y":80,"aliases":["base camp","camp","expedition camp","huntsmen's lodge","huntsmens lodge","the lodge","command tent"]},{"id":"wildwood_north","name":"Wildwood (north)","group":"wildwood","x":50,"y":57,"aliases":["wildwood (north)","wildwood north","north wildwood","northern wildwood","the north wildwood"]},{"id":"wildwood_west","name":"Wildwood (west)","group":"wildwood","x":28,"y":76,"aliases":["wildwood (west)","wildwood west","west wildwood","western wildwood","the west wildwood"]},{"id":"wildwood_east","name":"Wildwood (east)","group":"wildwood","x":70,"y":75,"aliases":["wildwood (east)","wildwood east","east wildwood","eastern wildwood","the east wildwood"]},{"id":"blightbriar","name":"Blightbriar","group":"blightbriar","x":18,"y":48,"aliases":["blightbriar","the blightbriar","blight briar"]},{"id":"gloaming","name":"The Gloaming","group":"gloaming","x":48,"y":43,"aliases":["the gloaming","gloaming"]},{"id":"falls","name":"Silverstair Falls","group":"falls","x":83,"y":45,"aliases":["silverstair falls","silverstair","the falls","falls","waterfall","the waterfall"]},{"id":"terraces","name":"Jade Terraces","group":"terraces","x":83,"y":23,"aliases":["jade terraces","the jade terraces","terraces","the terraces","the pools"]},{"id":"cave","name":"Grand Cave Network","group":"cave","x":15,"y":22,"indoor":true,"aliases":["grand cave network","the grand cave network","cave network","cave mouth","the cave mouth","the caves","caves","cave","the cave"]},{"id":"old_heart","name":"The Old Heart","group":"old_heart","x":50,"y":9,"aliases":["the old heart","old heart"]}],"wild_words":["wildwood","the wildwood","forest","the forest","woods","the woods","jungle","rainforest","grand vast forest","trail","the trail"],"legs":[["base_camp","wildwood_west",2,1,""],["base_camp","wildwood_north",2,1,""],["base_camp","wildwood_east",2,1,""],["wildwood_west","wildwood_north",2.5,1,""],["wildwood_north","wildwood_east",2.5,1,""],["wildwood_west","blightbriar",3,1,""],["wildwood_north","gloaming",3.5,1,""],["wildwood_east","falls",4,1,"along the river"],["blightbriar","gloaming",2.5,1.5,"spore"],["blightbriar","cave",5,1.5,"spore"],["gloaming","falls",3.5,1,""],["gloaming","cave",4,1,""],["gloaming","old_heart",5,1,""],["falls","terraces",1.5,1.5,"a climb"],["terraces","old_heart",4,1,""],["cave","old_heart",5,1,""]],"spore_mask":"spore mask|face cloth|face mask|mask","night_beasts":["hush owl","mist wolf","echo bat","displacer cat","ashen lynx"],"wendigo":{"where":"gloaming","edge":"old_heart","line":"The Wendigo (Grade I): a gaunt humanoid about three metres tall, grey-white skin tight over bone, a deer's skull for a head with antlers and a dim light in the sockets, long clawed fingers; the air turns cold, frost forms where it stands, it smells of rot and speaks in voices it has heard. It stalks first and calls in borrowed voices, then tests the intruders and drives them out; it does not follow anyone out of the Gloaming. Every spell of a kind that has already hit it this fight does a fifth less than the one before (100%, 80%, 60%, 40%, then 20%, never less); a new kind starts at full; weapons do not make it adapt, but its hide is Grade I hard. Students cannot beat it: running, hiding and the flare are the sane choices."},"rates":{"target_base":3,"target_step":3,"target_cap":24,"night_mult":0.5,"sign":20,"encounter":10,"encounter_night":15,"wendigo":1,"wendigo_edge":0.3,"walk_pct":8,"search_pct":3,"rain_mult":1.25,"night_walk_mult":1.25,"drag_mult":1.5,"max_rolls":12,"night_from":19,"night_to":6},"hunt":{"day":"Thu","from":"08:00","hours":24,"back_by":"12:00"},"climate":{"label":"rainforest","salt":"f","rare":{"sky":"Storm","at":60,"text":"lightning storm"},"temp":[24,29,23],"sky":[{"Fog":55,"Cloudy":35,"Clear":10},{"Rain":70,"Storm":10,"Cloudy":20},{"Rain":30,"Cloudy":60,"Clear":10}],"rain":{"light":25,"steady":35,"heavy":40}},"groups":{"base_camp":{"IV":["goblin hound"],"III":["dire wolf"],"II":[],"protected":[],"rate":0.2},"wildwood":{"IV":["goblin hound"],"III":["dire wolf","boar","thornstag","owlbear","forest troll"],"II":["ironback boar","dire bear","ogre","chimera"],"protected":[]},"blightbriar":{"IV":["thorn creeper","shriek mushroom"],"III":["spore shambler"],"II":["bloom maw","manticore"],"protected":[]},"gloaming":{"IV":[],"III":["ashen lynx","hush owl","giant spider"],"II":["displacer cat","dread weaver"],"protected":[]},"falls":{"IV":[],"III":["mist wolf","kelpie","torrent eel","harpy"],"II":["griffin","roc","wyvern"],"protected":[]},"terraces":{"IV":["chime toad"],"III":["cockatrice"],"II":["young hydra","gorgon","rime elk"],"protected":["pearl serpent"]},"cave":{"IV":[],"III":["giant centipede","echo bat","gargoyle","lesser drake"],"II":["cave troll","basilisk","giant scorpion","bone drake","cinder wyrm"],"protected":[]},"old_heart":{"IV":[],"III":[],"II":[],"protected":["unicorn","lantern stag","moonhare","white hart","grey pilgrim"]}}};
const AV = {"area":"Avalon","map":"map/avalon.webp","crowning":{"event":"Independence Crowning Day","day":"Tue","arrive":"09:30","parade":"10:00","speech":"11:00","free":"11:30","muster":"15:30","depart":"16:00","crowd_from":"10:00","crowd_to":"13:00"},"kingdom":{"matches":"09:00-18:00","free_until":"21:00","curfew":"22:00","reception":"Sat","prize":5000},"pins":[{"id":"castle","name":"Eldrasil Castle","x":50,"y":31,"locked":true},{"id":"square","name":"Crown Square","x":50,"y":57},{"id":"gate","name":"Great Gate","x":50,"y":83},{"id":"lantern","name":"Lantern Quarter","x":24,"y":56},{"id":"oldtown","name":"Old Town","x":32,"y":23},{"id":"garden","name":"Garden of Avalon","x":67,"y":27},{"id":"arena","name":"Arena Quarter","x":78,"y":56}],"legs":[["square","gate",25],["square","lantern",35],["square","arena",40],["square","oldtown",75],["square","garden",75],["square","castle",45],["gate","lantern",40],["lantern","oldtown",50],["oldtown","garden",50],["garden","arena",45],["arena","gate",35]],"places":[{"id":"eldrasil_castle","name":"Eldrasil Castle","pin":"castle","in":10,"out":false,"locked":true,"aliases":["the castle","royal castle","the palace","the throne room"]},{"id":"noble_ring","name":"Noble Ring","pin":"castle","in":5,"out":true,"locked":true,"aliases":["the noble quarter","the noble district","noble houses"]},{"id":"crown_square","name":"Crown Square","pin":"square","in":0,"out":true,"aliases":["the square","the plaza","the parade stands","the stands","crown avenue","the white line"]},{"id":"grand_cathedral","name":"Grand Cathedral","pin":"square","in":5,"out":false,"aliases":["the cathedral","the grand cathedral"]},{"id":"chancery","name":"The Chancery","pin":"square","in":5,"out":false,"aliases":["chancery","the royal inspectorate","the ministries","the courts"]},{"id":"high_dovecote","name":"High Dovecote","pin":"square","in":5,"out":false,"aliases":["the dovecote","the high dovecote","doves headquarters"]},{"id":"royal_bank","name":"Royal Bank","pin":"square","in":5,"out":false,"aliases":["the bank","the royal bank"]},{"id":"skyport","name":"Skyport","pin":"gate","in":5,"out":true,"aliases":["the skyport","the great gate","the airship dock","the docks","the muster","the landing field"]},{"id":"gilded_arcade","name":"Gilded Arcade","pin":"gate","in":5,"out":false,"aliases":["the arcade","the gilded arcade"]},{"id":"lantern_market","name":"Lantern Market","pin":"lantern","in":5,"out":true,"aliases":["the market","the lantern market","the lantern quarter","the market hall"]},{"id":"spellwright_row","name":"Spellwright Row","pin":"lantern","in":10,"out":true,"aliases":["spellwright","the magic shops"]},{"id":"old_town","name":"Old Town","pin":"oldtown","in":5,"out":true,"aliases":["the old town","the old quarter","the grey quarter"]},{"id":"rookery","name":"The Rookery","pin":"oldtown","in":10,"out":false,"hidden":true,"aliases":["rookery","the tunnels","the underbelly","the black market","the drowned rat","the cellars"]},{"id":"skywheel_fair","name":"Skywheel Fair","pin":"oldtown","in":5,"out":true,"aliases":["the fair","the fairground","the wheel","the skywheel","the carousel"]},{"id":"great_spire","name":"The Great Spire","pin":"oldtown","in":10,"out":false,"aliases":["great spire","the spire","the viewing gallery","the herald spire"]},{"id":"garden_of_avalon","name":"Garden of Avalon","pin":"garden","in":5,"out":true,"aliases":["the garden","the gardens","the statue","the archmage statue","the archmage","the reflecting pool"]},{"id":"grand_theatre","name":"Grand Theatre","pin":"garden","in":10,"out":false,"aliases":["the theatre","the opera","the opera house"]},{"id":"royal_arena","name":"Royal Arena","pin":"arena","in":5,"out":true,"aliases":["the arena","the arena quarter","the stadium","the royal arena"]},{"id":"whitestone_hotel","name":"Whitestone Hotel","pin":"arena","in":5,"out":false,"aliases":["the hotel","whitestone"]}],"rates":{"walk_pct":5,"crowd_mult":1.5,"ride_coin":10,"max_rolls":6,"procession":10,"street":20,"rival":25,"tsubaki":10,"scout":15,"raid":5,"raid_escape":60},"theft":{"where":["lantern_market","crown_square","skyport","old_town","skywheel_fair"],"rate":8,"seen":50,"min":10,"max":25,"cap":300,"once":false,"ev":"pick","who":"a pickpocket","toast":"Pickpocketed","why":"pickpocketed in Avalon"},"where":{"procession":["crown_square","gilded_arcade"],"rival_crowning":["crown_square","skyport","gilded_arcade","lantern_market","spellwright_row","old_town","skywheel_fair","great_spire","garden_of_avalon","grand_theatre","royal_arena","grand_cathedral","royal_bank"],"rival_kingdom":["royal_arena","whitestone_hotel"],"tsubaki":["gilded_arcade","lantern_market","spellwright_row","old_town","skywheel_fair","great_spire","garden_of_avalon","grand_theatre","royal_arena"],"scout":["royal_arena","whitestone_hotel"],"raid":["rookery"]},"street":{"crown_square":["a fire-breather working the holiday crowd by the fountains","a children's choir rehearsing the anthem on the memorial steps"],"skyport":["a merchant airship unloading crates of foreign fruit","porters racing each other with luggage carts"],"gilded_arcade":["a window display of Ardenne's new season drawing a crowd","Merryhew's staff testing a prank on passers-by"],"lantern_market":["a spice seller shouting a price war with the stall opposite","a puppet show for a ring of children"],"spellwright_row":["an enchanter demonstrating a self-sharpening knife","a dealer auctioning a battered old spellbook"],"old_town":["a fortune teller calling out to {{user}} by the colour of their vest","an old man playing a fiddle for coins under a grey arch"],"skywheel_fair":["a strongman offering a prize to anyone who can ring the bell","a couple stuck at the top of the wheel, waving"],"great_spire":["a guide pointing out each academy's direction from the gallery","pigeons scattering round the lift cage"],"garden_of_avalon":["a flower festival on the terraces in deep blue and gold","two scholars arguing loudly about the Archmage's face"],"grand_theatre":["a tenor warming up on the steps before the matinee","ticket touts selling seats for the evening opera"],"royal_arena":["groundskeepers raking the sand and re-chalking the rings","a junior tournament with very loud parents"],"whitestone_hotel":["a porter mixing up two academies' luggage","reporters waiting in the lobby for any team member"]},"procession":["a noble family's carriage with outriders in house colours","a column of the Royal Guard changing posts on the White Line","a minister's carriage with Inspectorate clerks running behind"],"rivals":{"Bellatrix":1,"Bram":1,"Cassius":3,"Dex":2,"Elion":1,"Ines":3,"Kira":2,"Lucius":2,"Mirelle":3,"Morgana":2,"Pip":1,"Theodore":3}};
const AIR = {"area":"Airship","board":"common_room","move_min":2,"bath":{"place":"cabin_deck","words":"bath|bathing|washroom|soak","min":10,"clears":["Soaked","Chilled"]},"rates":{"sky":15,"stage":30,"hold":30,"max_rolls":6},"flights":[{"id":"exp_out","m":2,"w":3,"d":"Wed","from":"07:00","to":"12:00","who":"all","route":"forest","dir":"out","event":"the Creature Studies Expedition","dest":"Grand Vast Forest — Base Camp","lands":"Base Camp, at the Grand Vast Forest's southern edge","bar":false},{"id":"exp_home","m":2,"w":3,"d":"Fri","from":"13:00","to":"18:00","who":"all","route":"forest","dir":"home","event":"the Creature Studies Expedition","dest":"Grassy Field and Hills","lands":"Halvard, at the edge of the grounds","bar":false},{"id":"crown_out","m":4,"w":2,"d":"Tue","from":"07:30","to":"09:30","who":"all","route":"avalon","dir":"out","event":"Independence Crowning Day","dest":"Avalon — Skyport","lands":"the Skyport, Avalon","bar":true},{"id":"crown_home","m":4,"w":2,"d":"Tue","from":"16:00","to":"18:00","who":"all","route":"avalon","dir":"home","event":"Independence Crowning Day","dest":"Grassy Field and Hills","lands":"Halvard, at the edge of the grounds","bar":true},{"id":"kd_out","m":9,"w":4,"d":"Tue","from":"08:00","to":"10:00","who":"kingdom","route":"avalon","dir":"out","event":"the Kingdom Competition (Halvard's team and Gavlan Haverton only)","dest":"Avalon — Skyport","lands":"the Skyport, Avalon","bar":false},{"id":"kd_home","m":9,"w":4,"d":"Sun","from":"16:00","to":"18:00","who":"kingdom","route":"avalon","dir":"home","event":"the Kingdom Competition (Halvard's team and Gavlan Haverton only)","dest":"Grassy Field and Hills","lands":"Halvard, at the edge of the grounds","bar":true},{"id":"trip_out","m":11,"w":2,"d":"Sat","from":"07:00","to":"20:00","who":"all","route":"sunreach","dir":"out","event":"the Academy Trip","dest":"Sunreach Bay — Skydock","lands":"the Skydock, Sunreach Bay","bar":false},{"id":"trip_home","m":11,"w":3,"d":"Thu","from":"08:00","to":"20:00","who":"all","route":"sunreach","dir":"home","event":"the Academy Trip","dest":"Grassy Field and Hills","lands":"Halvard, at the edge of the grounds","bar":false}],"places":[{"id":"promenade_deck","name":"Promenade Deck","aliases":["promenade","the promenade","observation gallery","the observation gallery","observation deck","the bow","the windows","the glass"]},{"id":"common_room","name":"Common Room","aliases":["the common room","lounge","the lounge","canteen","the canteen","canteen counter","the canteen counter","bar","the bar","stage","the stage"]},{"id":"cabin_deck","name":"Cabin Deck","aliases":["cabin","the cabin","cabins","the cabins","our cabin","bunks","the bunks","washrooms","the washrooms","bathing stalls","the bathing stalls","the baths"]},{"id":"cargo_hold","name":"Cargo Hold","aliases":["hold","the hold","cargo","the cargo","luggage","the luggage","luggage racks","the luggage racks","lower deck","the lower deck"]}],"cargo":{"forest_out":"tents, cookfires and camp gear for the Expedition","forest_home":"the Expedition's camp gear, muddier than it left","avalon_out":"the academy's banners and spare uniforms for the day","avalon_home":"the academy's banners, rolled, and whatever the students bought in Avalon","sunreach_out":"the whole academy's luggage for the Trip","sunreach_home":"more luggage than left Halvard, and the crates of what the teachers confiscated"},"views":{"forest_out":["Halvard's grounds and towers falling away behind; farmland and hedges below","the farmland thins into scrub and long empty hills","a green line on the horizon grows into the Grand Vast Forest's canopy, endless, mist rising from it"],"forest_home":["the canopy sliding away under the stern, Base Camp's meadow a pale patch at its edge","long empty hills, then farmland again","Halvard's towers on the horizon, the Bell Tower first"],"avalon_out":["Halvard's grounds falling away behind; towns and roads of the kingdom below","the roads all start bending the same way, towards the capital","Avalon ahead: a round white city on its hill, the castle at its heart and the Herald Spires standing over it"],"avalon_home":["Avalon's white wall shrinking behind, the castle last to go","the kingdom's towns and roads in the afternoon light","Halvard's towers on the horizon, the Bell Tower first"],"sunreach_out":["Halvard falling away; the kingdom's farmland, then its southern towns","the coast, then nothing but sea for hours, a sea that turns bluer the further south it goes","islands, then lights: Sunreach Bay's white beaches by day, its neon side by night"],"sunreach_home":["Sunreach's beaches and lagoons falling behind","open sea for hours, greyer and colder the further north it goes","the coast of Eldrasil, then Halvard's towers in the dark"]},"sky":{"forest":["the canopy breaks for a moment over a river so wide it looks like a lake","a flock of something large lifts out of the trees and keeps pace with the ship for a minute","the ship banks around a column of rain standing on the forest"],"avalon":["another academy's airship draws alongside, its students crowding their own promenade glass","a royal courier ship passes fast and high, gold on blue","the Herald Spires' bells reach the ship before the city does"],"sunreach":["the coast falls behind and there is nothing but sea for hours","a Yozakuran steward walks the promenade ringing a small bell: the line where the warm south begins, and sweets for everyone","flying fish, or something like them, break the water far below"],"home":["Halvard's towers show on the horizon, smaller than anyone remembers","half the ship falls asleep at once","a teacher walks the cabins counting heads early, and loses count"]},"stage":["a Yozakuran steward plays a long-necked lute, slow songs from home","two second-years from another dorm do a duel of insults in rhyme and the room keeps score","a first-year's illusion of a dragon gets away from them and loops the ceiling","a teacher borrows the stage to read out the landing order","the stage is empty and the chalkboard has one name on it: {{user}}'s cabin-mate signed them up"],"hold":["a crate shifts in its straps and something inside knocks back","the quartermaster is asleep on a coil of rope, snoring in time with the engines","two older students come down the ladder, see {{user}}, and go back up without a word","a stowaway cat from the last port watches from the top of the luggage"]};
const SR = {"area":"Sunreach Bay","maps":{"day":"map/sunreach_day.webp","night":"map/sunreach_night.webp"},"night":{"from":"18:00","to":"06:00"},"window":{"m":11,"from":[2,"Sat","20:00"],"to":[3,"Thu","08:00"]},"arrive":"skydock","hotel":"the_hanabira","curfew":[22,7],"schedule":[[2,"Sun","09:00","the teachers' briefing in The Hanabira's garden"],[3,"Wed","19:00","the farewell dinner at The Hanabira, then packing"],[3,"Thu","08:00","check out and board the airship home"]],"pins":[{"id":"skydock","name":"Skydock","x":14,"y":68,"shore":true},{"id":"wharf","name":"Fisherman's Wharf","x":25,"y":50,"shore":true},{"id":"strand","name":"Coral Strand","x":44,"y":44,"shore":true},{"id":"sunpier","name":"Sunpier","x":64,"y":56,"shore":true},{"id":"crossing","name":"Sunreach Crossing","x":51,"y":31},{"id":"casino","name":"Casino Row","x":81,"y":37,"shore":true},{"id":"terraces","name":"Cliffside Terraces","x":60,"y":16},{"id":"lagoon","name":"Turquoise Lagoon","x":84,"y":77,"shore":true},{"id":"cliffs","name":"West Cliffs","x":8,"y":35,"shore":true},{"id":"sea","sea":true,"name":"Open Sea","x":45,"y":87}],"legs":[["skydock","wharf",10],["skydock","strand",15],["skydock","cliffs",30],["wharf","strand",15],["wharf","crossing",15],["strand","sunpier",10],["strand","crossing",10],["sunpier","casino",15],["crossing","casino",15],["crossing","terraces",15],["casino","lagoon",20],["terraces","cliffs",35],["terraces","lagoon",35],["wharf","sea",60,"tour"]],"places":[{"id":"skydock","name":"Skydock","pin":"skydock","in":5,"out":true,"aliases":["the skydock","the airship masts","customs"]},{"id":"fish_market","name":"Fish Market","pin":"wharf","in":5,"out":true,"aliases":["the fish market","the wharf","the night market stalls","the food stalls","the grills"]},{"id":"sea_dock","name":"Sea Dock","pin":"wharf","in":5,"out":true,"aliases":["the sea dock","the docks","the tour boats","the harbour"]},{"id":"the_hanabira","name":"The Hanabira","pin":"strand","in":5,"out":false,"aliases":["hanabira","the hotel","our hotel","the rooftop bath","the lobby"]},{"id":"coral_beach","name":"Coral Beach","pin":"strand","in":5,"out":true,"aliases":["the beach","coral strand","the sand"]},{"id":"sunpier","name":"Sunpier","pin":"sunpier","in":5,"out":true,"aliases":["the pier","the gull run","the carousel"]},{"id":"tidehouse_aquarium","name":"Tidehouse Aquarium","pin":"sunpier","in":5,"out":false,"aliases":["the aquarium","tidehouse"]},{"id":"sunreach_crossing","name":"Sunreach Crossing","pin":"crossing","in":5,"out":true,"aliases":["the crossing","the clock tower","the city centre","downtown"]},{"id":"velvet_lanes","name":"Velvet Lanes","pin":"crossing","in":5,"out":true,"aliases":["the velvet lanes","the lanes","the alleys","the bars"],"off":true},{"id":"golden_tide","name":"The Golden Tide","pin":"casino","in":5,"out":false,"aliases":["golden tide","the casino","the tables"],"off":true},{"id":"plaza_dourada","name":"Plaza Dourada","pin":"casino","in":5,"out":true,"aliases":["the plaza","the colonial square","the mosaic square"]},{"id":"the_terraces","name":"The Terraces","pin":"terraces","in":5,"out":true,"aliases":["cliffside terraces","the terraces","the stilt houses","the hillside town"]},{"id":"skyrail","name":"Skyrail","pin":"terraces","in":5,"out":true,"aliases":["the skyrail","the cable cars","the cable car"]},{"id":"old_fort","name":"Old Fort","pin":"terraces","in":5,"out":true,"aliases":["the old fort","the fort","the summit"]},{"id":"the_lagoon","name":"The Lagoon","pin":"lagoon","in":5,"out":true,"aliases":["turquoise lagoon","the lagoon","the rafts","the beach bar"]},{"id":"reef_gardens","name":"Reef Gardens","pin":"lagoon","in":5,"out":true,"aliases":["the reef","reef gardens","the glass-bottom boat","the coral"]},{"id":"shell_cove","name":"Shell Cove","pin":"lagoon","in":5,"out":true,"aliases":["shell cove","the cove","the pink beach"]},{"id":"the_lighthouse","name":"The Lighthouse","pin":"cliffs","in":5,"out":true,"aliases":["the lighthouse","the cliff road"]},{"id":"sunset_cliffs","name":"Sunset Cliffs","pin":"cliffs","in":5,"out":true,"aliases":["sunset cliffs","the cliffs","the diving ledges"]},{"id":"glowtide_grotto","name":"Glowtide Grotto","pin":"cliffs","in":5,"out":false,"aliases":["the grotto","glowtide","the sea cave","the cave"]},{"id":"open_sea","name":"Open Sea","pin":"sea","in":5,"out":true,"aliases":["the open sea","the tour boat","out at sea"]}],"rates":{"walk_pct":5,"carriage":6,"boat":8,"tour":15,"street":20,"rival":25,"student":20,"sea":50,"leviathan":5,"max_rolls":6,"bet_max":200},"games":{"dice":{"win":45,"pay":2},"cards":{"win":48,"pay":2},"wheel":{"win":8,"pay":10}},"theft":{"where":["fish_market","sunreach_crossing","velvet_lanes","sunpier"],"rate":8,"seen":50,"min":10,"max":25,"cap":300,"once":true,"ev":"hustle","who":"a hustler","toast":"Hustled","why":"hustled in Sunreach Bay"},"street":{"fish_market":[["a cook flips a whole grilled fish in the air and the crowd applauds","two stallholders shout prices at each other in a bidding war"],["a lantern-lit queue for the famous crab-in-chilli stall winds round the block","a cook breathes a puff of fire to sear a tray of prawns"]],"sea_dock":[["a fishing boat comes in with a swordfish longer than the boat","a tour crew calls the next departure with a conch"],["the fleet comes in under its lamps, gulls screaming"]],"coral_beach":[["a beach volleyball match draws a crowd of shouting tourists","a child buries their father to the neck in sand"],["fire dancers spin burning chains to drums","a beach club throws coloured rune-light across the waves"]],"sunpier":[["a stuffed-prize game hands out its biggest prize and the whole pier cheers","the Gull Run stalls at the top for a breathless moment, then drops"],["the pier lights flick on end to end in one long run","a fortune teller calls out to {{user}} by a guess at their name"]],"tidehouse_aquarium":[["the old turtle swims right over the tunnel and everyone ducks"],["the jellyfish tank glows violet and a couple goes very quiet"]],"sunreach_crossing":[["a troupe of street dancers takes over one corner of the crossing","a painter on a rope swing repaints a giant banner"],["the crossing keepers drop their flags and a thousand people cross at once","a busker draws a ring of people with a song from Yozakura"]],"velvet_lanes":[["a shutter goes up and a bleary bartender squints at the daylight"],["a tout tries three languages on {{user}} in one breath","a singing room spills a terrible duet into the alley"]],"golden_tide":[["a gambler who never went to bed counts his last coins on the steps"],["the fountains leap higher than the tower in time to the orchestra"]],"plaza_dourada":[["an old man feeds pigeons on the wave mosaic","the custard tarts come out of the oven and a queue forms at once"],["a gold-lit fountain draws tourists drifting in from the tables"]],"the_terraces":[["a woman lowers a basket on a rope from a stilt house to a stall below","locals slam dominoes on a café table"],["hot-pot steam rises from every landing","the whole hillside lights up layer by layer"]],"skyrail":[["a cable car sways in the wind and everyone inside grabs a strap"],["a lit cabin swings past an open window and the family inside waves"]],"old_fort":[["a goat stares down {{user}} from a cannon"],["shooting stars over the dark summit"]],"the_lagoon":[["a raft tips over and its passengers fall in laughing"],["slow music from the bar on stilts drifts over the black water"]],"reef_gardens":[["a pearl diver surfaces holding up a pearl for the boat to see","a shoal of blue fish turns all at once under the glass"]],"shell_cove":[["a hermit crab drags a too-big shell across the pink sand"]],"the_lighthouse":[["the keeper starts a storm story nobody asked for"],["the beam sweeps over {{user}} and out to sea"]],"sunset_cliffs":[["a local dives from the highest ledge and the crowd holds its breath","the sun touches the sea and the whole crowd goes quiet"]],"glowtide_grotto":[["the boatman sings and the echo comes back in three voices","a hand trailed in the pool leaves a wake of light"]]},"sea":["a pod of dolphins races the bow for a mile","a whale surfaces close enough to hear it breathe, then shows its tail","a shoal of flying fish skims away over the swell","a giant sea turtle drifts past, older than the city","a storm walks along the horizon, never coming closer","a foreign merchant ship passes under full sail and dips its flag","a crew member hooks something huge on a deep-sea line, and it takes the whole line"],"leviathan":"far out, the sea humps up into a back the size of an island, grey and barnacled, rises, rolls, and sinks again; the swell reaches the boat a long minute later, and the crew turns for home without a word","meet":{"rivals":{"Lucius":[["plaza_dourada","tidehouse_aquarium"],["sunreach_crossing"]],"Ines":[["old_fort","the_lighthouse"],["tidehouse_aquarium"]],"Bram":[["tidehouse_aquarium","reef_gardens"],["the_lagoon"]],"Dex":[["sunreach_crossing"],["velvet_lanes","golden_tide"]],"Elion":[["fish_market","the_terraces"],["plaza_dourada"]],"Kira":[["sunset_cliffs","coral_beach"],["sunpier"]],"Mirelle":[["the_lagoon","coral_beach"],["the_lagoon"]],"Theodore":[["fish_market","sunpier"],["plaza_dourada"]],"Bellatrix":[["sunreach_crossing"],["velvet_lanes","golden_tide"]],"Cassius":[["old_fort","skyrail"],["plaza_dourada"]],"Morgana":[["glowtide_grotto","the_lighthouse"],["old_fort","glowtide_grotto"]],"Pip":[["tidehouse_aquarium","shell_cove"],["sunpier"]]},"halvard":{"Irene":[["tidehouse_aquarium","plaza_dourada"],["plaza_dourada","the_hanabira"]],"Caspian":[["plaza_dourada","fish_market"],["sunreach_crossing","plaza_dourada"]],"Etnie":[["coral_beach","sunpier"],["coral_beach","sunreach_crossing"]],"Royhan":[["the_terraces","fish_market"],["the_hanabira"]],"Lenna":[["coral_beach","tidehouse_aquarium"],["fish_market"]],"Saffi":[["coral_beach","sunset_cliffs"],["coral_beach"]],"Kanae":[["sunpier","plaza_dourada"],["tidehouse_aquarium","sunpier"]],"Idris":[["the_terraces","old_fort"],["the_terraces"]],"Aiden":[["sunreach_crossing"],["golden_tide","velvet_lanes"]],"Caralynn":[["coral_beach","sunreach_crossing"],["sunreach_crossing"]],"Zara":[["the_terraces","plaza_dourada"],["the_hanabira"]],"Percival":[["old_fort","the_lighthouse"],["fish_market"]],"Sophia":[["sunset_cliffs","open_sea"],["velvet_lanes"]],"Gareth":[["the_terraces","plaza_dourada"],["sunreach_crossing"]],"Trixie":[["sunpier","sunreach_crossing"],["sunpier","coral_beach"]],"Vera":[["reef_gardens","glowtide_grotto"],["glowtide_grotto"]],"Dante":[["coral_beach","the_lagoon"],["the_hanabira"]],"Castor":[["old_fort","shell_cove"],["old_fort"]],"Ruby":[["sunpier","plaza_dourada"],["coral_beach"]],"Florian":[["golden_tide","coral_beach"],["velvet_lanes","golden_tide"]],"Alyssa":[["the_lighthouse","tidehouse_aquarium"],["the_hanabira"]],"Tilly":[["glowtide_grotto","the_lighthouse"],["glowtide_grotto","old_fort"]],"Linus":[["sunreach_crossing","fish_market"],["fish_market"]],"Maple":[["tidehouse_aquarium","skyrail"],["skyrail"]],"Nerys":[["fish_market","skydock"],["sunpier"]],"Hadrian":[["plaza_dourada","skyrail"],["plaza_dourada"]],"Wren":[["sea_dock","the_lagoon"],["coral_beach"]],"Tsubaki":[["old_fort","sunset_cliffs"],["old_fort"]],"Aurelian":[["coral_beach","sunreach_crossing"],["sunreach_crossing"]],"William":[["the_lighthouse","old_fort"],["skyrail"]],"Bruno":[["sunset_cliffs","fish_market"],["velvet_lanes"]],"Bianca":[["coral_beach","sunreach_crossing"],["coral_beach","velvet_lanes"]],"Rigel":[["fish_market","open_sea"],["fish_market"]],"Topaz":[["coral_beach","sunset_cliffs"],["sunpier"]],"Faye":[["the_lagoon","shell_cove"],["the_lagoon"]]}},"climate":{"label":"warm south","salt":"s","temp":[27,31,26],"sky":[{"Clear":70,"Cloudy":25,"Fog":5},{"Clear":50,"Cloudy":20,"Rain":25,"Storm":5},{"Clear":70,"Cloudy":25,"Rain":5}],"rain":{"light":50,"steady":35,"heavy":15}}};
const CAMPUS_MAP = {"area":"Halvard","places":[{"id":"announcement_room","name":"Announcement Room","pin":"announcement_room"},{"id":"arbiter_hall","name":"The Arbiter Hall","pin":"arbiter_hall"},{"id":"archery_range","name":"Archery Range","pin":"archery_range"},{"id":"archive","name":"Archive","pin":"archive"},{"id":"banking_house","name":"The Banking House","pin":"banking_house"},{"id":"barrow_vine","name":"Barrow & Vine","pin":"barrow_vine"},{"id":"bathhouse_and_washrooms","name":"Bathhouse and Washrooms","pin":"bathhouse_and_washrooms"},{"id":"bell_tower","name":"Bell Tower","pin":"bell_tower"},{"id":"boathouse_and_lake","name":"Boathouse and Lake","pin":"boathouse_and_lake"},{"id":"broken_statue","name":"Broken Statue","pin":"broken_statue"},{"id":"canteen","name":"Canteen","pin":"canteen"},{"id":"cathedral","name":"The Cathedral","pin":"cathedral"},{"id":"club_rooms","name":"Club Rooms","pin":"club_rooms"},{"id":"combat_grounds","name":"Combat Grounds","pin":"combat_grounds"},{"id":"commissary","name":"Commissary","pin":"commissary"},{"id":"common_rooms","name":"Common Rooms","pin":"common_rooms"},{"id":"courtyards","name":"Courtyards","pin":"courtyards"},{"id":"detention_tower","name":"Detention Tower","pin":"detention_tower"},{"id":"dovecote","name":"The Dovecote","pin":"dovecote"},{"id":"faculty_offices","name":"Faculty Offices","pin":"faculty_offices"},{"id":"fire_dormitory","name":"Fire Dormitory","pin":"fire_dormitory"},{"id":"fishing_house","name":"Fishing House","pin":"fishing_house"},{"id":"forest","name":"Forest","pin":"forest"},{"id":"forest_clearing","name":"Forest Clearing","pin":"forest_clearing"},{"id":"founders_statue_and_park","name":"Founder's Statue and Park","pin":"founders_statue_and_park"},{"id":"gardens","name":"Gardens","pin":"gardens"},{"id":"grassy_field_and_hills","name":"Grassy Field and Hills","pin":"grassy_field_and_hills"},{"id":"greenwicks","name":"Greenwick's","pin":"greenwicks"},{"id":"groundskeepers_lodge","name":"Groundskeeper's Lodge","pin":"groundskeepers_lodge"},{"id":"gymnasium","name":"Gymnasium","pin":"gymnasium"},{"id":"headmasters_office","name":"Headmaster's Office","pin":"headmasters_office"},{"id":"laundry","name":"Laundry","pin":"laundry"},{"id":"lecture_halls","name":"Lecture Halls","pin":"lecture_halls","floor":"Floor 2","floors":["Floor 2","Floor 3","Floor 4"]},{"id":"light_dormitory","name":"Light Dormitory","pin":"light_dormitory"},{"id":"mail_tower","name":"Mail Tower","pin":"mail_tower"},{"id":"main_library","name":"Main Library","pin":"main_library"},{"id":"mall","name":"The Mall","pin":"mall"},{"id":"medical_centre","name":"Medical Centre","pin":"medical_centre"},{"id":"meditation_rooms","name":"Meditation Rooms","pin":"meditation_rooms"},{"id":"menagerie","name":"Menagerie","pin":"menagerie"},{"id":"merryhews","name":"Merryhew's","pin":"merryhews"},{"id":"nightwell","name":"Nightwell","pin":"nightwell"},{"id":"noble_houses_liaison","name":"The Noble Houses' Liaison","pin":"noble_houses_liaison"},{"id":"notice_board","name":"Notice Board","pin":"notice_board"},{"id":"observation_tower","name":"Observation Tower","pin":"observation_tower"},{"id":"old_hut","name":"Old Hut","pin":"old_hut"},{"id":"pennywhistle_curios","name":"Pennywhistle Curios","pin":"pennywhistle_curios"},{"id":"portrait_hall","name":"Portrait Hall","pin":"portrait_hall"},{"id":"potion_halls","name":"Potion Halls","pin":"potion_halls"},{"id":"quillfeathers","name":"Quillfeather's","pin":"quillfeathers"},{"id":"reception_and_gatehouse","name":"Reception and Gatehouse","pin":"reception_and_gatehouse"},{"id":"restricted_section","name":"Restricted Section","pin":"restricted_section"},{"id":"ring_dining_hall","name":"The Ring Dining Hall","pin":"ring_dining_hall"},{"id":"rooftop","name":"Rooftop","pin":"rooftop"},{"id":"royal_inspectorate","name":"The Royal Inspectorate","pin":"royal_inspectorate"},{"id":"salaffian_oven","name":"The Salaffian Oven","pin":"salaffian_oven"},{"id":"seal_chamber","name":"The Seal Chamber","pin":"seal_chamber"},{"id":"seminar_rooms","name":"Seminar Rooms","pin":"seminar_rooms"},{"id":"sky_dormitory","name":"Sky Dormitory","pin":"sky_dormitory"},{"id":"snug","name":"The Snug","pin":"snug"},{"id":"sparring_pavilion","name":"The Sparring Pavilion","pin":"sparring_pavilion"},{"id":"spirit_path","name":"Spirit Path","pin":"spirit_path"},{"id":"sports_field","name":"Sports Field","pin":"sports_field"},{"id":"staff_quarters","name":"Staff Quarters","pin":"staff_quarters"},{"id":"staff_room","name":"Staff Room","pin":"staff_room"},{"id":"storage_and_lockers","name":"Storage and Lockers","pin":"storage_and_lockers","floor":"Floor 2","floors":["Floor 2","Floor 3","Floor 4"]},{"id":"student_council_chamber","name":"Student Council Chamber","pin":"student_council_chamber"},{"id":"study_rooms","name":"Study Rooms","pin":"study_rooms","floor":"Floor 2","floors":["Floor 2","Floor 3","Floor 4"]},{"id":"swimming_pool","name":"Swimming Pool","pin":"swimming_pool"},{"id":"tailors_row","name":"Tailor's Row","pin":"tailors_row"},{"id":"tinkers_bench","name":"The Tinker's Bench","pin":"tinkers_bench"},{"id":"viridian_dormitory","name":"Viridian Dormitory","pin":"viridian_dormitory"},{"id":"wardens_office","name":"The Warden's Office","pin":"wardens_office"},{"id":"willow_island","name":"Willow Island","pin":"willow_island"},{"id":"workshop","name":"Workshop","pin":"workshop"}],"pins":[{"id":"announcement_room","name":"Announcement Room"},{"id":"arbiter_hall","name":"The Arbiter Hall"},{"id":"archery_range","name":"Archery Range"},{"id":"archive","name":"Archive"},{"id":"banking_house","name":"The Banking House"},{"id":"barrow_vine","name":"Barrow & Vine"},{"id":"bathhouse_and_washrooms","name":"Bathhouse and Washrooms"},{"id":"bell_tower","name":"Bell Tower"},{"id":"boathouse_and_lake","name":"Boathouse and Lake"},{"id":"broken_statue","name":"Broken Statue"},{"id":"canteen","name":"Canteen"},{"id":"cathedral","name":"The Cathedral"},{"id":"club_rooms","name":"Club Rooms"},{"id":"combat_grounds","name":"Combat Grounds"},{"id":"commissary","name":"Commissary"},{"id":"common_rooms","name":"Common Rooms"},{"id":"courtyards","name":"Courtyards"},{"id":"detention_tower","name":"Detention Tower"},{"id":"dovecote","name":"The Dovecote"},{"id":"faculty_offices","name":"Faculty Offices"},{"id":"fire_dormitory","name":"Fire Dormitory"},{"id":"fishing_house","name":"Fishing House"},{"id":"forest","name":"Forest"},{"id":"forest_clearing","name":"Forest Clearing"},{"id":"founders_statue_and_park","name":"Founder's Statue and Park"},{"id":"gardens","name":"Gardens"},{"id":"grassy_field_and_hills","name":"Grassy Field and Hills"},{"id":"greenwicks","name":"Greenwick's"},{"id":"groundskeepers_lodge","name":"Groundskeeper's Lodge"},{"id":"gymnasium","name":"Gymnasium"},{"id":"headmasters_office","name":"Headmaster's Office"},{"id":"laundry","name":"Laundry"},{"id":"lecture_halls","name":"Lecture Halls"},{"id":"light_dormitory","name":"Light Dormitory"},{"id":"mail_tower","name":"Mail Tower"},{"id":"main_library","name":"Main Library"},{"id":"mall","name":"The Mall"},{"id":"medical_centre","name":"Medical Centre"},{"id":"meditation_rooms","name":"Meditation Rooms"},{"id":"menagerie","name":"Menagerie"},{"id":"merryhews","name":"Merryhew's"},{"id":"nightwell","name":"Nightwell"},{"id":"noble_houses_liaison","name":"The Noble Houses' Liaison"},{"id":"notice_board","name":"Notice Board"},{"id":"observation_tower","name":"Observation Tower"},{"id":"old_hut","name":"Old Hut"},{"id":"pennywhistle_curios","name":"Pennywhistle Curios"},{"id":"portrait_hall","name":"Portrait Hall"},{"id":"potion_halls","name":"Potion Halls"},{"id":"quillfeathers","name":"Quillfeather's"},{"id":"reception_and_gatehouse","name":"Reception and Gatehouse"},{"id":"restricted_section","name":"Restricted Section"},{"id":"ring_dining_hall","name":"The Ring Dining Hall"},{"id":"rooftop","name":"Rooftop"},{"id":"royal_inspectorate","name":"The Royal Inspectorate"},{"id":"salaffian_oven","name":"The Salaffian Oven"},{"id":"seal_chamber","name":"The Seal Chamber"},{"id":"seminar_rooms","name":"Seminar Rooms"},{"id":"sky_dormitory","name":"Sky Dormitory"},{"id":"snug","name":"The Snug"},{"id":"sparring_pavilion","name":"The Sparring Pavilion"},{"id":"spirit_path","name":"Spirit Path"},{"id":"sports_field","name":"Sports Field"},{"id":"staff_quarters","name":"Staff Quarters"},{"id":"staff_room","name":"Staff Room"},{"id":"storage_and_lockers","name":"Storage and Lockers"},{"id":"student_council_chamber","name":"Student Council Chamber"},{"id":"study_rooms","name":"Study Rooms"},{"id":"swimming_pool","name":"Swimming Pool"},{"id":"tailors_row","name":"Tailor's Row"},{"id":"tinkers_bench","name":"The Tinker's Bench"},{"id":"viridian_dormitory","name":"Viridian Dormitory"},{"id":"wardens_office","name":"The Warden's Office"},{"id":"willow_island","name":"Willow Island"},{"id":"workshop","name":"Workshop"}],"legs":[["announcement_room","archive",2],["announcement_room","bell_tower",6],["announcement_room","canteen",1],["announcement_room","club_rooms",1],["announcement_room","detention_tower",1],["announcement_room","faculty_offices",5],["announcement_room","headmasters_office",5],["announcement_room","lecture_halls",2],["announcement_room","main_library",1],["announcement_room","notice_board",1],["announcement_room","potion_halls",4],["announcement_room","restricted_section",2],["announcement_room","rooftop",6],["announcement_room","royal_inspectorate",1],["announcement_room","seal_chamber",2],["announcement_room","seminar_rooms",3],["announcement_room","staff_room",5],["announcement_room","storage_and_lockers",2],["announcement_room","student_council_chamber",1],["announcement_room","study_rooms",2],["announcement_room","wardens_office",1],["announcement_room","workshop",2],["arbiter_hall","courtyards",7],["arbiter_hall","portrait_hall",2],["arbiter_hall","ring_dining_hall",1],["arbiter_hall","staff_quarters",3],["arbiter_hall","viridian_dormitory",4],["archery_range","founders_statue_and_park",7],["archery_range","gardens",4],["archery_range","gymnasium",3],["archery_range","light_dormitory",6],["archery_range","menagerie",4],["archery_range","sports_field",5],["archery_range","staff_quarters",6],["archery_range","swimming_pool",3],["archery_range","viridian_dormitory",6],["archive","bell_tower",7],["archive","canteen",2],["archive","club_rooms",2],["archive","detention_tower",2],["archive","faculty_offices",6],["archive","headmasters_office",6],["archive","lecture_halls",3],["archive","main_library",2],["archive","notice_board",2],["archive","potion_halls",5],["archive","restricted_section",1],["archive","rooftop",7],["archive","royal_inspectorate",2],["archive","seal_chamber",1],["archive","seminar_rooms",4],["archive","staff_room",6],["archive","storage_and_lockers",3],["archive","student_council_chamber",2],["archive","study_rooms",3],["archive","wardens_office",2],["archive","workshop",1],["banking_house","cathedral",6],["banking_house","commissary",3],["banking_house","mall",5],["banking_house","meditation_rooms",4],["banking_house","reception_and_gatehouse",6],["barrow_vine","mall",1],["bathhouse_and_washrooms","fire_dormitory",1],["bathhouse_and_washrooms","light_dormitory",13],["bathhouse_and_washrooms","sky_dormitory",5],["bathhouse_and_washrooms","viridian_dormitory",13],["bell_tower","canteen",6],["bell_tower","club_rooms",6],["bell_tower","detention_tower",6],["bell_tower","faculty_offices",2],["bell_tower","headmasters_office",2],["bell_tower","lecture_halls",5],["bell_tower","main_library",6],["bell_tower","notice_board",6],["bell_tower","portrait_hall",6],["bell_tower","potion_halls",3],["bell_tower","restricted_section",7],["bell_tower","rooftop",1],["bell_tower","royal_inspectorate",6],["bell_tower","seal_chamber",7],["bell_tower","seminar_rooms",4],["bell_tower","staff_room",2],["bell_tower","storage_and_lockers",5],["bell_tower","student_council_chamber",6],["bell_tower","study_rooms",5],["bell_tower","wardens_office",6],["bell_tower","workshop",7],["boathouse_and_lake","fishing_house",3],["boathouse_and_lake","forest",25],["boathouse_and_lake","gardens",20],["boathouse_and_lake","grassy_field_and_hills",15],["boathouse_and_lake","willow_island",10],["broken_statue","cathedral",4],["broken_statue","dovecote",2],["broken_statue","fire_dormitory",4],["broken_statue","meditation_rooms",6],["broken_statue","noble_houses_liaison",4],["broken_statue","sky_dormitory",6],["canteen","club_rooms",1],["canteen","courtyards",5],["canteen","detention_tower",1],["canteen","faculty_offices",5],["canteen","headmasters_office",5],["canteen","lecture_halls",2],["canteen","main_library",1],["canteen","notice_board",1],["canteen","potion_halls",4],["canteen","restricted_section",2],["canteen","rooftop",6],["canteen","royal_inspectorate",1],["canteen","seal_chamber",2],["canteen","seminar_rooms",3],["canteen","staff_room",5],["canteen","storage_and_lockers",2],["canteen","student_council_chamber",1],["canteen","study_rooms",2],["canteen","wardens_office",1],["canteen","workshop",2],["cathedral","commissary",7],["cathedral","dovecote",5],["cathedral","fire_dormitory",6],["cathedral","mall",5],["cathedral","meditation_rooms",3],["cathedral","noble_houses_liaison",4],["cathedral","sky_dormitory",4],["club_rooms","courtyards",5],["club_rooms","detention_tower",1],["club_rooms","faculty_offices",5],["club_rooms","headmasters_office",5],["club_rooms","lecture_halls",2],["club_rooms","main_library",1],["club_rooms","notice_board",1],["club_rooms","potion_halls",4],["club_rooms","restricted_section",2],["club_rooms","rooftop",6],["club_rooms","royal_inspectorate",1],["club_rooms","seal_chamber",2],["club_rooms","seminar_rooms",3],["club_rooms","staff_room",5],["club_rooms","storage_and_lockers",2],["club_rooms","student_council_chamber",1],["club_rooms","study_rooms",2],["club_rooms","wardens_office",1],["club_rooms","workshop",2],["combat_grounds","founders_statue_and_park",7],["combat_grounds","groundskeepers_lodge",5],["combat_grounds","sparring_pavilion",3],["combat_grounds","sports_field",5],["commissary","mail_tower",5],["commissary","mall",3],["commissary","medical_centre",4],["commissary","meditation_rooms",6],["commissary","reception_and_gatehouse",3],["common_rooms","fire_dormitory",1],["common_rooms","light_dormitory",13],["common_rooms","sky_dormitory",5],["common_rooms","viridian_dormitory",13],["courtyards","faculty_offices",5],["courtyards","fire_dormitory",8],["courtyards","founders_statue_and_park",7],["courtyards","grassy_field_and_hills",20],["courtyards","lecture_halls",5],["courtyards","light_dormitory",5],["courtyards","main_library",5],["courtyards","mall",5],["courtyards","medical_centre",6],["courtyards","notice_board",5],["courtyards","reception_and_gatehouse",9],["courtyards","sky_dormitory",4],["courtyards","viridian_dormitory",6],["detention_tower","faculty_offices",5],["detention_tower","headmasters_office",5],["detention_tower","lecture_halls",2],["detention_tower","main_library",1],["detention_tower","notice_board",1],["detention_tower","potion_halls",4],["detention_tower","restricted_section",2],["detention_tower","rooftop",6],["detention_tower","royal_inspectorate",1],["detention_tower","seal_chamber",2],["detention_tower","seminar_rooms",3],["detention_tower","staff_room",5],["detention_tower","storage_and_lockers",2],["detention_tower","student_council_chamber",1],["detention_tower","study_rooms",2],["detention_tower","wardens_office",1],["detention_tower","workshop",2],["dovecote","fire_dormitory",6],["dovecote","meditation_rooms",6],["dovecote","noble_houses_liaison",3],["faculty_offices","headmasters_office",1],["faculty_offices","lecture_halls",4],["faculty_offices","main_library",5],["faculty_offices","notice_board",5],["faculty_offices","potion_halls",2],["faculty_offices","restricted_section",6],["faculty_offices","rooftop",2],["faculty_offices","royal_inspectorate",5],["faculty_offices","seal_chamber",6],["faculty_offices","seminar_rooms",3],["faculty_offices","staff_room",1],["faculty_offices","storage_and_lockers",4],["faculty_offices","student_council_chamber",5],["faculty_offices","study_rooms",4],["faculty_offices","wardens_office",5],["faculty_offices","workshop",6],["fire_dormitory","laundry",1],["fire_dormitory","sky_dormitory",5],["fishing_house","grassy_field_and_hills",14],["forest","forest_clearing",30],["forest","grassy_field_and_hills",15],["forest","old_hut",5],["founders_statue_and_park","groundskeepers_lodge",4],["founders_statue_and_park","light_dormitory",3],["founders_statue_and_park","mail_tower",2],["founders_statue_and_park","medical_centre",3],["founders_statue_and_park","reception_and_gatehouse",6],["founders_statue_and_park","sports_field",9],["founders_statue_and_park","viridian_dormitory",6],["gardens","gymnasium",5],["gardens","light_dormitory",6],["gardens","menagerie",3],["gardens","staff_quarters",3],["gardens","swimming_pool",5],["gardens","viridian_dormitory",4],["grassy_field_and_hills","observation_tower",5],["grassy_field_and_hills","old_hut",10],["greenwicks","mall",1],["groundskeepers_lodge","mail_tower",4],["groundskeepers_lodge","medical_centre",6],["groundskeepers_lodge","reception_and_gatehouse",5],["gymnasium","menagerie",3],["gymnasium","spirit_path",3],["gymnasium","sports_field",3],["gymnasium","swimming_pool",1],["headmasters_office","lecture_halls",4],["headmasters_office","main_library",5],["headmasters_office","notice_board",5],["headmasters_office","potion_halls",2],["headmasters_office","restricted_section",6],["headmasters_office","rooftop",2],["headmasters_office","royal_inspectorate",5],["headmasters_office","seal_chamber",6],["headmasters_office","seminar_rooms",3],["headmasters_office","staff_room",1],["headmasters_office","storage_and_lockers",4],["headmasters_office","student_council_chamber",5],["headmasters_office","study_rooms",4],["headmasters_office","wardens_office",5],["headmasters_office","workshop",6],["laundry","light_dormitory",13],["laundry","sky_dormitory",5],["laundry","viridian_dormitory",13],["lecture_halls","main_library",2],["lecture_halls","notice_board",2],["lecture_halls","potion_halls",3],["lecture_halls","restricted_section",3],["lecture_halls","rooftop",5],["lecture_halls","royal_inspectorate",2],["lecture_halls","seal_chamber",3],["lecture_halls","seminar_rooms",2],["lecture_halls","staff_room",4],["lecture_halls","storage_and_lockers",1],["lecture_halls","student_council_chamber",2],["lecture_halls","study_rooms",1],["lecture_halls","wardens_office",2],["lecture_halls","workshop",3],["light_dormitory","mail_tower",5],["light_dormitory","medical_centre",5],["light_dormitory","viridian_dormitory",3],["mail_tower","mall",6],["mail_tower","medical_centre",2],["mail_tower","reception_and_gatehouse",3],["main_library","notice_board",1],["main_library","potion_halls",4],["main_library","restricted_section",2],["main_library","rooftop",6],["main_library","royal_inspectorate",1],["main_library","seal_chamber",2],["main_library","seminar_rooms",3],["main_library","staff_room",5],["main_library","storage_and_lockers",2],["main_library","student_council_chamber",1],["main_library","study_rooms",2],["main_library","wardens_office",1],["main_library","workshop",2],["mall","medical_centre",4],["mall","meditation_rooms",6],["mall","merryhews",1],["mall","nightwell",1],["mall","pennywhistle_curios",1],["mall","quillfeathers",1],["mall","reception_and_gatehouse",6],["mall","salaffian_oven",1],["mall","sky_dormitory",4],["mall","snug",1],["mall","tailors_row",1],["mall","tinkers_bench",1],["medical_centre","reception_and_gatehouse",4],["meditation_rooms","noble_houses_liaison",3],["menagerie","spirit_path",5],["menagerie","sports_field",6],["menagerie","staff_quarters",6],["menagerie","swimming_pool",3],["notice_board","potion_halls",4],["notice_board","restricted_section",2],["notice_board","rooftop",6],["notice_board","royal_inspectorate",1],["notice_board","seal_chamber",2],["notice_board","seminar_rooms",3],["notice_board","staff_quarters",9],["notice_board","staff_room",5],["notice_board","storage_and_lockers",2],["notice_board","student_council_chamber",1],["notice_board","study_rooms",2],["notice_board","wardens_office",1],["notice_board","workshop",2],["potion_halls","restricted_section",5],["potion_halls","rooftop",3],["potion_halls","royal_inspectorate",4],["potion_halls","seal_chamber",5],["potion_halls","seminar_rooms",2],["potion_halls","staff_room",2],["potion_halls","storage_and_lockers",3],["potion_halls","student_council_chamber",4],["potion_halls","study_rooms",3],["potion_halls","wardens_office",4],["potion_halls","workshop",5],["restricted_section","rooftop",7],["restricted_section","royal_inspectorate",2],["restricted_section","seal_chamber",1],["restricted_section","seminar_rooms",4],["restricted_section","staff_room",6],["restricted_section","storage_and_lockers",3],["restricted_section","student_council_chamber",2],["restricted_section","study_rooms",3],["restricted_section","wardens_office",2],["restricted_section","workshop",1],["rooftop","royal_inspectorate",6],["rooftop","seal_chamber",7],["rooftop","seminar_rooms",4],["rooftop","staff_room",2],["rooftop","storage_and_lockers",5],["rooftop","student_council_chamber",6],["rooftop","study_rooms",5],["rooftop","wardens_office",6],["rooftop","workshop",7],["royal_inspectorate","seal_chamber",2],["royal_inspectorate","seminar_rooms",3],["royal_inspectorate","staff_room",5],["royal_inspectorate","storage_and_lockers",2],["royal_inspectorate","student_council_chamber",1],["royal_inspectorate","study_rooms",2],["royal_inspectorate","wardens_office",1],["royal_inspectorate","workshop",2],["seal_chamber","seminar_rooms",4],["seal_chamber","staff_room",6],["seal_chamber","storage_and_lockers",3],["seal_chamber","student_council_chamber",2],["seal_chamber","study_rooms",3],["seal_chamber","wardens_office",2],["seal_chamber","workshop",1],["seminar_rooms","staff_room",3],["seminar_rooms","storage_and_lockers",2],["seminar_rooms","student_council_chamber",3],["seminar_rooms","study_rooms",2],["seminar_rooms","wardens_office",3],["seminar_rooms","workshop",4],["sparring_pavilion","sports_field",5],["spirit_path","sports_field",5],["spirit_path","swimming_pool",3],["sports_field","swimming_pool",3],["staff_quarters","viridian_dormitory",4],["staff_room","storage_and_lockers",4],["staff_room","student_council_chamber",5],["staff_room","study_rooms",4],["staff_room","wardens_office",5],["staff_room","workshop",6],["storage_and_lockers","student_council_chamber",2],["storage_and_lockers","study_rooms",1],["storage_and_lockers","wardens_office",2],["storage_and_lockers","workshop",3],["student_council_chamber","study_rooms",2],["student_council_chamber","wardens_office",1],["student_council_chamber","workshop",2],["study_rooms","wardens_office",2],["study_rooms","workshop",3],["wardens_office","workshop",2]],"map":[["Castle",["canteen","main_library","club_rooms","student_council_chamber","announcement_room","notice_board","wardens_office","royal_inspectorate","detention_tower","lecture_halls","study_rooms","storage_and_lockers","seminar_rooms","potion_halls","faculty_offices","staff_room","headmasters_office","bell_tower","rooftop","workshop","archive","restricted_section","seal_chamber"]],["Main Courtyard",["courtyards"]],["Fire Dormitory",["fire_dormitory"]],["Sky Dormitory",["sky_dormitory"]],["Viridian Dormitory",["viridian_dormitory"]],["Light Dormitory",["light_dormitory"]],["Arbiter Hall",["arbiter_hall","ring_dining_hall","portrait_hall"]],["Staff Quarters",["staff_quarters"]],["Observation Tower",["observation_tower"]],["Old Hut",["old_hut"]],["Forest Clearing",["forest_clearing"]],["Boathouse and Lake",["boathouse_and_lake"]],["Gardens",["gardens"]],["Menagerie",["menagerie"]],["Archery Range",["archery_range"]],["Gymnasium",["gymnasium","swimming_pool"]],["Sports Field",["sports_field"]],["Combat Grounds",["combat_grounds"]],["The Sparring Pavilion",["sparring_pavilion"]],["Groundskeeper's Lodge",["groundskeepers_lodge"]],["Founder's Park",["founders_statue_and_park"]],["The Mall",["mall","nightwell","merryhews","snug","quillfeathers","pennywhistle_curios","barrow_vine","greenwicks","tinkers_bench","salaffian_oven","tailors_row"]],["Commissary",["commissary"]],["Medical Centre",["medical_centre"]],["Mail Tower",["mail_tower"]],["Gatehouse",["reception_and_gatehouse"]],["Banking House",["banking_house"]],["The Dovecote",["dovecote"]],["The Cathedral",["cathedral"]],["Noble Houses' Liaison",["noble_houses_liaison"]],["Meditation Rooms",["meditation_rooms"]],["Broken Statue",["broken_statue"]],["Fishing House",["fishing_house"]],["Willow Island",["willow_island"]],["Grassy Field and Hills",["grassy_field_and_hills"]],["Forest",["forest"]],["Spirit Path",["spirit_path"]]],"shared":["bathhouse_and_washrooms","common_rooms","laundry"],"dorms":{"Fire":"fire_dormitory","Light":"light_dormitory","Sky":"sky_dormitory","Viridian":"viridian_dormitory"},"rates":{"_note":"1.47.0 (audit batch 5, 3.2): walking on the Halvard grounds. The walking graph is data/locations.json near (the Campus Map's minutes); the engine (AR.campus, stepCampus) charges the time and stamina of a move between two campus places like the outside areas do. walk_pct: stamina an hour on foot (owner decision: 5%, as in Avalon); far_min: only a walk this long or longer costs stamina (short walks inside the grounds cost none); owe_min: minutes the clock may lag behind a walk before <now> says the way is still ahead; walks_listed: the nearest Campus Map pins <now> lists under 'Walks from here' ({{user}}'s own dorm is always listed).","walk_pct":5,"far_min":15,"owe_min":5,"walks_listed":10}};   // 1.47.0 (audit 3.2): the campus as an Area (tools/common.py campus_map, data/campus.json)
function makeArea(key, D, o = {}) {
  const A = { key, D, area: D.area, R: D.rates || {}, PL: Object.fromEntries((D.places || []).map(p => [p.id, p])),
    PIN: Object.fromEntries((D.pins || []).map(p => [p.id, p])), NB: areaNb(D.legs), NAME: {}, ALIAS: {}, RT: {},
    words: [], in: null, arrive: '', aliasDetail: false, modes: {}, ...o };
  if (!A.in) A.in = A.words;
  for (const p of D.places || []) { A.NAME[avKey(p.name)] = p.id; for (const a of p.aliases || []) A.ALIAS[avKey(a)] = p.id; }
  for (const p of D.pins || []) { const k = avKey(p.name); if (!A.NAME[k]) A.NAME[k] = A.ALIAS[k] || D.places.find(x => x.pin === p.id).id; }
  A.routes = from => A.RT[from] || (A.RT[from] = areaRoutes(A.NB, from, A.blocked && (id => A.blocked(A, id))));
  A.path = (a, b) => areaPath(A.routes(a), a, b);
  A.min = (a, b) => areaMin(A.PL, A.routes, a, b);
  return A;
}
const AREA_OLD_UI = [['forest', 'forest'], ['capital', 'avalon'], ['airship', 'airship'], ['sunreach', 'sunreach']], AREA_OLD_ENG = [['exp', 'forest'], ['cap', 'avalon'], ['sr', 'sunreach']];
// the place {{user}} was at in area key before this reply ($ui.area.<key>.at while on), for the parsers' short aliases
const areaWas = (B, key) => { const u = (((B || {}).$ui || {}).area || {})[key]; return (_.isPlainObject(u) && u.on && u.at) || ''; };
const avKey = x => String(x || '').trim().toLowerCase().replace(/[.!]+$/, '').replace(/^the /, '');
const AR = {
  forest: makeArea('forest', EXP, { salt: 'exp', words: [String(EXP.area || '').toLowerCase()], arrive: 'base_camp' }),
  avalon: makeArea('avalon', AV, { salt: 'av', words: ['avalon', 'capital'], in: ['avalon'], arrive: 'skyport', blocked: (A, id) => A.PIN[id].locked,
    modes: { carriage: { fare: num((AV.rates || {}).ride_coin, 10), name: 'hire carriage', line: 'Hire carriage', why: 'hire carriage in Avalon' } },
    crowd: { pin: 'square', note: ' (holiday crowds at Crown Square)' }, theft: ['pick', 'pseen', 'pamt'], street: ['street', 'strt'] }),
  airship: makeArea('airship', AIR, { salt: 'air', words: ['airship'], arrive: AIR.board, aliasDetail: true }),
  sunreach: makeArea('sunreach', SR, { salt: 'sr', words: ['sunreach bay', 'sunreach'], arrive: SR.arrive, aliasDetail: true,
    modes: { carriage: { fare: num((SR.rates || {}).carriage, 6), name: 'carriage', line: 'Horse carriage', why: 'horse carriage, Sunreach Bay' },
      boat: { fare: num((SR.rates || {}).boat, 6), name: 'water taxi', line: 'Water taxi', why: 'water taxi, Sunreach Bay', shore: true },
      tour: { fare: num((SR.rates || {}).tour, 15), name: 'tour boat', line: 'Tour boat', why: 'tour boat, Sunreach Bay' } },
    theft: ['hus', 'hseen', 'hamt'], street: ['st', 'stt'] }),
};
// The place a Location names in area A, or ''. A place's (or pin's) own name always counts; the short aliases ("the market", "the
// bar") only inside the area: a place there before (prev), one of its "in" words in the Location, or aboard. A bare area name keeps
// the place before (on arrival: A.arrive).
function areaPlace(A, loc, prev, aboard) {
  const segs = locParts(loc).map(avKey).filter(Boolean), had = !!(prev && A.PL[prev]);
  const inside = had || !!aboard || segs.some(x => A.in.includes(x));
  for (let i = segs.length - 1; i >= 0; i--) { const id = A.NAME[segs[i]] || (inside && A.ALIAS[segs[i]]); if (id) return id; }
  return segs.some(x => A.words.includes(x)) ? (had ? prev : A.arrive) : '';
}
// "<Area> — <place>" plus any detail the story wrote (an alias stays as a detail after the place's own name where aliasDetail)
function areaLoc(A, loc, id) {
  const segs = locParts(loc).map(x => x.trim()), named = segs.some(x => A.NAME[avKey(x)] === id);
  const extra = segs.filter(x => { const k = avKey(x); return x && !A.NAME[k] && !(A.ALIAS[k] && !(A.aliasDetail && named)) && !A.words.includes(k) && !(A.drop && A.drop.has(k)); });
  return [A.area, A.PL[id].name, ...extra].join(' — ');
}
// 3.7: an area's own weather for a time block (D.climate: sky and rain weights, temperatures, a rare sight; salt keeps the old rolls).
// An area with no climate of its own (Avalon, the airship) has Halvard's sky.
function areaWx(A, seed, day, b) {
  const W = A.D.climate, s = W.salt, pick = (o, salt) => { const ks = Object.keys(o), tot = ks.reduce((a, k) => a + o[k], 0); let r = hash32(seed, day, b, salt) % tot; for (const k of ks) { if (r < o[k]) return k; r -= o[k]; } return ks[0]; };
  const sky = pick(W.sky[b], s + 'sky'), wet = sky === 'Rain' || sky === 'Storm', R = W.rare;
  return { sky, rain: wet ? pick(W.rain, s + 'rain') : '', snow: false, wind: sky === 'Storm' ? 'windy' : '',
    rare: R && sky === R.sky && d100(seed, day, b, s + 'rare') >= R.at ? R.text : '', temp: W.temp[b] + hash32(seed, day, b, s + 'temp') % 3 - 1 };
}
// the weather block at (day, b) where {{user}} is: the area's climate, else Halvard's
const wxWhere = (A, seed, day, b) => (A && A.D.climate ? areaWx(A, seed, day, b) : wxDay(seed, day).blocks[b]);
// once per hour since the last update in area A (at most rates.max_rolls), not asleep: fn(h); fn returning false stops
function areaHours(c, A, ok, fn) {
  const { hasB, toolEdit, elapsed, absA, absB, restedAs } = c;
  if (!(hasB && !toolEdit && elapsed > 0 && ok && restedAs !== 'sleep')) return;
  const h1 = Math.floor(absA / 60);
  for (let h = Math.max(Math.floor(absB / 60) + 1, h1 - num(A.R.max_rolls, 6) + 1); h <= h1; h++) if (fn(h) === false) break;
}
const areaRoll = (c, A, h, at, k) => roll100(c.seed, A.salt, h, at, k);
// a street sight at place `at` (pool), once per update (got): a colour-only line for <now>
function areaStreet(c, A, h, at, pool, got, evs) {
  if (got.has('street') || !(pool || []).length) return;
  const t = rollTable(pool, { roll: [c.seed, A.salt, h, at, A.street[0]], pct: num(A.R.street, 20) * lifeX(c.TU), pick: [c.seed, A.salt, h, at, A.street[1]] });
  if (t !== null) { got.add('street'); evs.push({ k: 'street', t }); }
}
// 3.1: one theft (Avalon's pickpockets, Sunreach's hustlers; D.theft: where, rate, seen, min, max, cap, once, the event and its
// wording): seen through half the time; otherwise a share of the coin {{user}} carries, through the ledger
function areaTheft(c, A, h, at, got, evs) {
  const T = A.D.theft || {}, [kr, ks, ka] = A.theft, { S, seed, notes } = c;
  if (!(T.where || []).includes(at) || (T.once && got.has('theft')) || areaRoll(c, A, h, at, kr) >= num(T.rate, 8) * lifeX(c.TU)) return;
  if (T.once) got.add('theft');
  const caught = areaRoll(c, A, h, at, ks) < num(T.seen, 50), pct = rollInt(num(T.min, 10), num(T.max, 25), seed, A.salt, h, ka);
  const lost = caught ? 0 : Math.min(num(T.cap, 300), Math.round(num(S.Player.Wallet.Coin, 0) * pct / 100));
  if (lost) {
    ledger(c, 'Coin', -lost, T.why);
    notes.push(`${A.area}: ${T.who} took ${lost} coin from {{user}} at ${A.PL[at].name}.`); S.$ui.toasts.push(`${T.toast}: -${lost} coin`);
  }
  evs.push({ k: T.ev, caught, lost, empty: !caught && !lost });
}
// a move inside area A from prev to at: inside one pin a few minutes, between pins the shortest way. want: a mode the narrator asked
// for (carriage, or a boat between two shore pins): half the land minutes, its fare, no stamina. A tour leg (the 4th field of a leg)
// has its own minutes and fare and is the only way across; without the coin the move is refused (returns false). A crowd leg (touching
// A.crowd.pin while crowded) is slower, ride or not. Stamina: rates.walk_pct an hour on foot. X.owe: the minutes the clock still owes.
function areaMove(c, A, X, prev, at, want, crowded, evs) {
  const { S, log, elapsed, V } = c, R = A.R, coinNow = () => num(S.Player.Wallet.Coin, 0);
  const pA = A.PL[prev].pin, pB = A.PL[at].pin, path = pA === pB ? [] : A.path(pA, pB);
  let land = pA === pB ? A.min(prev, at) : 0, crowd = 0, tourM = 0, tours = 0;
  for (let i = 1; i < path.length; i++) {
    const [, lm, tour] = A.NB[path[i - 1]].find(x => x[0] === path[i]);
    if (tour) { tourM += lm; tours++; } else if (crowded && (path[i - 1] === A.crowd.pin || path[i] === A.crowd.pin)) crowd += lm * num(R.crowd_mult, 1.5); else land += lm;
  }
  const Tm = A.modes.tour, fare = tours * (Tm ? Tm.fare : 0);
  if (tours && coinNow() < fare) { log.push(`The ${Tm.name} costs ${Tm.fare} coin and {{user}} has ${coinNow()}: no boat, so World.Location was kept at ${A.PL[prev].name}.`); return false; }
  if (fare) ledger(c, 'Coin', -fare, Tm.why);
  const ends = [path.find(p => !(A.PIN[p] || {}).sea) || pA, [...path].reverse().find(p => !(A.PIN[p] || {}).sea) || pB];
  const kind = !want || pA === pB || !(land + crowd) ? '' : want === 'boat' && A.modes.boat && ends.every(p => A.PIN[p] && A.PIN[p].shore) ? 'boat' : A.modes.carriage ? 'carriage' : '';
  const Md = kind ? A.modes[kind] : null, byRide = !!Md && coinNow() >= Md.fare;
  if (Md && !byRide) log.push(`A ${Md.name} costs ${Md.fare} coin and {{user}} has ${coinNow()}: they walked.`);
  if (byRide) ledger(c, 'Coin', -Md.fare, Md.why);
  const total = Math.round(tourM + crowd + (byRide ? land / 2 : land)), walked = pA === pB ? 0 : crowd + (byRide ? 0 : land), cost = walked / 60 * num(R.walk_pct, 5);
  if (cost) V.Stamina -= cost / 100 * num(V.Stamina_max, 100);
  X.owe = Math.max(0, Math.round(total + num(X.owe, 0) - elapsed));
  const via = path.length > 2 ? ` via ${path.slice(1, -1).map(p => A.PIN[p].name).join(', ')}` : '';
  log.push(`${byRide ? Md.line : tours && !land ? Tm.line : 'Walked'} ${A.PL[prev].name} → ${A.PL[at].name}${via}: ${total} min${byRide ? `, -${Md.fare} coin` : ''}${fare ? `, ${Tm.name} -${fare} coin` : ''}${cost ? `, -${Math.round(cost)}% stamina` : ''}${crowd ? A.crowd.note : ''}${X.owe ? `; ${X.owe} min of the way are still ahead` : ''}.`);
  evs.push({ k: 'walk', m: total, ride: byRide ? kind : '', tour: tours > 0, owe: X.owe });
  return true;
}
// the places of area A seen so far (kept in $ui), and the walks and places nearby for <now> and the Map
const areaSeen = (A, U0) => (Array.isArray((U0 || {}).seen) ? U0.seen.filter(id => A.PL[id]) : []);
function areaNear(A, at, pinOk, placeOk) {
  const pin = A.PL[at].pin, R0 = A.routes(pin);
  return { pin, pinName: A.PIN[pin].name, walks: A.D.pins.filter(p => p.id !== pin && pinOk(p)).map(p => [p.id, p.name, R0[p.id].w]).sort((a, b) => a[2] - b[2]),
    near: A.D.places.filter(p => p.pin === pin && p.id !== at && placeOk(p)).map(p => [p.name, A.min(at, p.id)]) };
}

// ---- the Grand Vast Forest (1.38.0, owner-approved planning/DRAFT_outside_maps.md, part 1): the Creature Studies Expedition's map.
// While the Expedition is on, World.Location is "Grand Vast Forest — <place>" in the forest map's words. stepExpedition charges
// stamina for every walk and counts search hours per place; once per search hour it rolls the assigned target (only where it lives),
// signs that point towards it, other beasts and the Wendigo. The narrator plays only what <now> says.
AR.forest.drop = new Set((EXP.wild_words || []).map(w => w.replace(/^the /, '')));
const expEvent = () => EVENTS.find(e => String(e.t || '').startsWith(EXP.event));
const expOnDay = W => eventsOn(W).some(e => String(e.t || '').startsWith(EXP.event));
// The forest place a Location names, or ''. A bare "Wildwood" keeps the Wildwood pin {{user}} is on, else the nearest one; a bare
// "the forest" or "Grand Vast Forest" keeps the place before (on arrival: Base Camp). Without the area's name or a forest place
// before, a bare "forest" is the campus Forest.
function forestPlace(loc, prev) {
  const F = AR.forest, s = String(loc || ''), segs = locParts(s).map(avKey).filter(Boolean);
  for (let i = segs.length - 1; i >= 0; i--) { const id = F.NAME[segs[i]] || F.ALIAS[segs[i]]; if (id) return id; }
  const named = new RegExp('\\b' + String(EXP.area || '-').toLowerCase() + '\\b').test(s.toLowerCase());
  if (!segs.some(x => F.drop.has(x)) || !(prev || named)) return '';
  if (segs.includes('wildwood')) {
    if (prev && F.PL[prev] && F.PL[prev].group === 'wildwood') return prev;
    const R = F.routes(prev && F.PL[prev] ? prev : 'base_camp');
    return _.minBy(EXP.places.filter(p => p.group === 'wildwood'), p => (R[p.id] || { w: 99 }).w).id;   // a tie: the first listed (north)
  }
  return prev && F.PL[prev] ? prev : 'base_camp';
}
const expNight = abs => { const h = Math.floor((abs % DAY_MIN) / 60), R = EXP.rates || {}; return h >= num(R.night_from, 19) || h < num(R.night_to, 6); };
// ---- Avalon, the capital (1.39.0, owner-approved planning/DRAFT_outside_maps.md, part 2). On Crowning Day and, for Halvard's Kingdom
// Competition team, on its days in the capital, World.Location is "Avalon — <place>" in the city map's words. Pins hold places like
// the campus map. stepCapital charges the move, keeps the White Line closed except to the Kingdom winners, runs the Crowning Day
// muster, and rolls the city's life once per hour: pickpockets, processions, street sights, other academies' students, Tsubaki
// lost, scouts, Rookery raids.
const KINGDOM_PRIZE = AV.kingdom.prize;   // 1.43.0: one source with the Activities panel's Competition text
const avCrown = W => eventsOn(W).some(e => String(e.t || '').startsWith(AV.crowning.event));
const avKingdom = (W, S) => eventsOn(W).some(e => e.kingdom) && ((S && S.Competition) || {}).Tier === 'Kingdom';
const avPass = S => ((S.$eng && S.$eng.prizes) || []).includes(`Kingdom-Y${num(S.World.Year, 1)}`) && avKingdom(S.World, S);
// ---- the airship (1.40.0, owner-approved planning/DRAFT_airship.md): every academy flight. While a flight is in the air
// World.Location is "Airship — <place>" (Promenade Deck, Common Room, Cabin Deck, Cargo Hold): a closed place until it lands.
// Boarding puts {{user}} in the Common Room; a Location that still says the airship after landing becomes the flight's destination.
// stepAirship rolls the sky, the stage and the hold once per hour aboard; <now> gives the view, the landing time and the bar's rule.
// the flight in the air at W ({{user}} on it: the Kingdom flights only for Halvard's team), or null
function airFlight(W, S) {
  const t = hm(W.Time); if (t == null) return null;
  return (AIR.flights || []).find(f => f.m === num(W.Month, 0) && f.w === num(W.Week, 0) && f.d === W.Day && t >= hm(f.from) && t < hm(f.to)
    && (f.who !== 'kingdom' || avKingdom(W, S || {}))) || null;
}
// ---- Sunreach Bay (1.41.0, owner-approved planning/DRAFT_outside_maps.md, part 3), the Academy Trip's city, FP7 area 3. From landing
// (M11 W2 Sat 20:00) to boarding (W3 Thu 08:00) World.Location is "Sunreach Bay — <place>". One city with two faces: from 18:00 to
// 06:00 it is lit by rune-light (the night map, the entries' night lines). stepSunreach charges walks, horse carriages and water
// taxis (and the tour boat to the Open Sea), settles bets at The Golden Tide, and rolls the city once an hour: street sights, hustlers,
// students of the other academies and of Halvard where they would be by their personality (data `meet`), the sea and, once in a
// Trip, the Leviathan far off.
const srNight = abs => { const t = ((abs % DAY_MIN) + DAY_MIN) % DAY_MIN; return t >= hm(SR.night.from) || t < hm(SR.night.to); };
function srWindow(W) {                                           // from the landing to the boarding home
  const Wn = SR.window || {}, Y = num(W.Year, 1), t = toAbs(W);
  if (num(W.Month, 0) !== Wn.m) return false;
  const at = ([w, d, tm]) => toAbs({ Year: Y, Month: Wn.m, Week: w, Day: d, Time: tm });
  return t >= at(Wn.from) && t < at(Wn.to);
}
// ---- the campus (1.47.0, audit 3.2): the Halvard grounds as the first Area. Each Campus Map place is its own node; the legs are the
// Campus Map's walking minutes (data/locations.json near), so the engine and the Map panel walk the same graph. The parser is
// canonLocation (with yearFloorLocation): a Location in the map's words names one place. stepCampus charges a move's minutes (owed
// to the clock while the narration has not spent them) and, on a long walk, stamina; <now> lists the walks from here.
const CR = CAMPUS_MAP.rates || {};
AR.campus = makeArea('campus', CAMPUS_MAP, { salt: 'cp' });
const campusPlace = loc => AR.campus.NAME[avKey(placeOf(canonLocation(loc)))] || '';
// the node a place is walked from: a dorm room every dorm shares (Common Rooms, Laundry, the bathhouse) is in {{user}}'s own dorm
const campusNode = (S, id) => (CAMPUS_MAP.shared.includes(id) && CAMPUS_MAP.dorms[(((S || {}).Player || {}).Profile || {}).Dorm]) || id;
// the floor a Location names on a place with year floors (Lecture Halls, Study Rooms, the lockers), else its own floor; legs reach a
// place's own floor and each floor climbed adds a minute (lore 132), as on the Map panel
const floorNo = f => +((/^Floor (\d)$/.exec(f || '') || [])[1] || 0);
const campusFloor = (loc, id) => { const P = AR.campus.PL[id], m = /\bFloor (\d)\b/.exec(String(loc || '')); return P.floors && m && P.floors.includes('Floor ' + m[1]) ? +m[1] : floorNo(P.floor); };
function campusWalk(S, locA, locB) {
  const A = AR.campus, a = campusPlace(locA), b = campusPlace(locB);
  if (!a || !b) return null;
  const na = campusNode(S, a), nb = campusNode(S, b), fa = campusFloor(locA, a), fb = campusFloor(locB, b), up = id => floorNo(A.PL[id].floor);
  const climb = na === nb ? Math.abs(fa - fb) : (A.PL[a].floors ? Math.abs(fa - up(a)) : 0) + (A.PL[b].floors ? Math.abs(fb - up(b)) : 0);
  return { a, b, na, nb, min: A.min(na, nb) + climb };
}
// 1.47.0 (audit 3.3): the area {{user}} is in, from World.Location as stepTime left it: an outside area's key (aboard the airship,
// Avalon, Sunreach Bay; the Expedition's forest on its days), 'campus' on the Halvard grounds, '' off them
function areaNow(S) {
  const W = (S && S.World) || {}, p = placeOf(W.Location);
  if (p === AIR.area) return 'airship';
  if (p === AV.area) return 'avalon';
  if (p === SR.area) return 'sunreach';
  if (expOnDay(W) && forestPlace(W.Location, '')) return 'forest';
  return onCampus(W.Location) ? 'campus' : '';
}
// 1.42.0 (audit 1.2): {{user}} is away from Halvard: on a story trip (Trip.Active), in an outside area, or off the grounds on a
// calendar "away" day (the Crowning Day evening on campus and the World Competition for anyone not in the national four are not
// away). One test for every system that pauses meanwhile; 1.47.0: the area comes from areaNow.
const awayIn = S => { const a = areaNow(S); return !!((S && S.Trip) || {}).Active || (a !== 'campus' && (a !== '' || eventsOn((S && S.World) || {}).some(e => e.away))); };
// 1.31.0 (data/restore_places.json): the multiplier a restful place gives at one moment, [multiplier, why]. The first rule that fits
// wins; weather conditions never fit with the weather off. dark = outside Practice's daylight hours. wxc caches a time block's weather.
function restMult(R, abs, seed, wxOn, cold, wxc) {
  const W = fromAbs(abs), hr = abs % DAY_MIN, dark = hr < 360 || hr >= (SEASONS[W.Month - 1] === 'Winter' ? 960 : 1080);
  let bk = null;
  if (wxOn) {
    const [d, b] = blockOf(abs), key = d * 3 + b;
    if (!wxc.has(key)) wxc.set(key, wxDay(seed, d).blocks[b]);
    bk = wxc.get(key);
  }
  for (const r of R.rules || []) {
    const f = r.if || {};
    if (f.dark !== undefined && f.dark !== dark) continue;
    if (f.from !== undefined && !(hr >= f.from && hr < f.to)) continue;
    if (f.days && !f.days.includes(W.Day)) continue;
    if (f.weeks && !f.weeks.some(([m, w]) => m === W.Month && w === W.Week)) continue;
    if (f.arrivedCold !== undefined && f.arrivedCold !== cold) continue;
    if ((f.sky || f.snow !== undefined || f.tempMin !== undefined || f.tempMax !== undefined) && !bk) continue;
    if (f.sky && !f.sky.includes(bk.sky)) continue;
    if (f.snow !== undefined && f.snow !== !!bk.snow) continue;
    if (f.tempMin !== undefined && bk.temp < f.tempMin) continue;
    if (f.tempMax !== undefined && bk.temp > f.tempMax) continue;
    return [r.mult, r.why || ''];
  }
  return [R.usual, ''];
}
const GEAR = { umbrella: /umbrella/i, waterproof: /waterproof|oilskin|rain cloak|raincoat/i, warm: /wool(?! and needles)|scarf|winter cloak|mittens/i, sun: /sun hat|straw hat/i };
// 1.9.5 (playtest Batch 5): shop items with an effect (data/shop.json gear / use, by lowercase name); gear also by exact item name,
// and a used charm's timed protection (wxs.buff: { kind: until abs minute })
const SHOP_FX = {"umbrella":{"gear":"umbrella"},"oilskin rain cloak":{"gear":"waterproof"},"wool scarf and mittens":{"gear":"warm"},"lined winter cloak":{"gear":"warm"},"straw sun hat":{"gear":"sun"},"hot spiced tea":{"use":{"clears":["Chilled"]}},"iced fruit cooler":{"use":{"clears":["Overheated"]}},"iced coffee":{"use":{"clears":["Overheated"]}},"hot chocolate with cream":{"use":{"clears":["Chilled"]}},"rain-ward charm":{"use":{"buff":"waterproof","mins":180}},"quick-dry powder":{"use":{"clears":["Soaked"]}},"cooling charm":{"use":{"buff":"sun","mins":240}},"ember pouch":{"use":{"buff":"warm","mins":240}},"elderflower cold syrup":{"use":{"cure":"Head cold"}},"blossom honey cake":{"use":{"stamina":10}},"spiced apple turnover":{"use":{"stamina":10}},"roasted chestnuts":{"use":{"clears":["Chilled"]}},"salted lemon water":{"use":{"clears":["Overheated"],"stamina":10}},"linen summer shirt":{"gear":"sun"},"fleece-lined boots":{"gear":"warm"},"mulled apple cider":{"use":{"clears":["Chilled"],"stamina":5}},"warming draught":{"use":{"clears":["Chilled"],"buff":"warm","mins":240}},"cooling draught":{"use":{"clears":["Overheated"],"buff":"sun","mins":240}},"cold remedy":{"use":{"cure":"Head cold"}},"healing draught":{"use":{"heal":"minor"}},"vigour tonic":{"use":{"stamina":20}},"strong healing draught":{"use":{"heal":"moderate_to_minor"}},"fire flask":{"use":{"fitting":"fire"}},"bottled cold":{"use":{"fitting":"cold"}},"warmth rune":{"use":{"buff":"warm","mins":240}},"rain-ward talisman":{"use":{"buff":"waterproof","mins":180}},"light rune":{"use":{"fitting":"dark"}},"ward talisman":{"use":{"fitting":"curse or hex"}},"enchant warm":{"gear":"warm"},"enchant waterproof":{"gear":"waterproof"},"honey buns":{"use":{"stamina":10}},"butter cookies":{"use":{"stamina":10}},"hearty stew pot":{"use":{"stamina":15}},"knitted scarf":{"gear":"warm"},"knitted winter set":{"gear":"warm"}};
// by lowercase item name: [[price, shop, the shop's place key, seasons or 0 for all year, item name], ...] (1.45.0: place, seasons, name)
const SHOP_PRICE = {"sunfizz":[[8,"Commissary","commissary",0,"Sunfizz"],[8,"The Mall — store","mall",0,"Sunfizz"]],"firetooth (tin)":[[12,"Commissary","commissary",0,"Firetooth (tin)"]],"notebook":[[5,"Commissary","commissary",0,"Notebook"]],"pen nibs and ink":[[6,"Commissary","commissary",0,"Pen nibs and ink"]],"printed class textbook":[[45,"Commissary","commissary",0,"Printed class textbook"]],"satchel":[[70,"Commissary","commissary",0,"Satchel"]],"spare uniform set":[[120,"Commissary","commissary",0,"Spare uniform set"]],"common reagent bundle":[[30,"Commissary","commissary",0,"Common reagent bundle"]],"basic practice focus":[[250,"Commissary","commissary",0,"Basic practice focus"]],"rare reagent":[[350,"Commissary","commissary",0,"Rare reagent"]],"special order":[[null,"Commissary","commissary",0,"Special order"]],"umbrella":[[25,"Commissary","commissary",0,"Umbrella"]],"oilskin rain cloak":[[90,"Commissary","commissary",["Autumn","Winter","Spring"],"Oilskin rain cloak"]],"bakery roll":[[15,"The Mall — bakery","mall",0,"Bakery roll"]],"star cookie":[[8,"The Mall — bakery","mall",0,"Star Cookie"]],"café drink and pastry":[[25,"The Mall — cafés and tea houses","mall",0,"Café drink and pastry"]],"restaurant meal":[[45,"The Mall — restaurants","mall",0,"Restaurant meal"]],"private dining (second floor)":[[150,"The Mall — private dining","mall",0,"Private dining (second floor)"]],"quality focus":[[4000,"The Mall — store","mall",0,"Quality focus"]],"tailoring alteration":[[40,"Tailor's Row","tailor's row",0,"Tailoring alteration"]],"barber":[[20,"The Mall — services","mall",0,"Barber"]],"laundry service (per load)":[[10,"The Mall — services","mall",0,"Laundry service (per load)"]],"practice studio or music room (per hour)":[[15,"The Mall — studios","mall",0,"Practice studio or music room (per hour)"]],"game hall (per hour)":[[10,"The Mall — game halls","mall",0,"Game hall (per hour)"]],"wool scarf and mittens":[[35,"The Mall — store","mall",["Autumn","Winter"],"Wool scarf and mittens"]],"lined winter cloak":[[120,"The Mall — store","mall",["Winter"],"Lined winter cloak"]],"straw sun hat":[[30,"The Mall — store","mall",["Summer"],"Straw sun hat"]],"hot spiced tea":[[12,"The Mall — cafés and tea houses","mall",["Spring","Autumn","Winter"],"Hot spiced tea"]],"iced fruit cooler":[[10,"The Mall — cafés and tea houses","mall",["Summer"],"Iced fruit cooler"]],"the vigil":[[60,"Nightwell","nightwell",0,"The Vigil"]],"house coffee":[[12,"Nightwell","nightwell",0,"House coffee"]],"honey cream coffee":[[16,"Nightwell","nightwell",0,"Honey cream coffee"]],"spiced milk tea":[[14,"Nightwell","nightwell",0,"Spiced milk tea"]],"iced coffee":[[14,"Nightwell","nightwell",["Summer"],"Iced coffee"]],"hot chocolate with cream":[[14,"Nightwell","nightwell",["Autumn","Winter"],"Hot chocolate with cream"]],"late-night pastry":[[10,"Nightwell","nightwell",0,"Late-night pastry"]],"bag of nightwell beans":[[35,"Nightwell","nightwell",0,"Bag of Nightwell beans"]],"the oracle shell":[[40,"Merryhew's","merryhew's",0,"The Oracle Shell"]],"itching charm":[[15,"Merryhew's","merryhew's",0,"Itching charm"]],"voice-changing sweets (bag)":[[12,"Merryhew's","merryhew's",0,"Voice-changing sweets (bag)"]],"illusion vermin (box)":[[25,"Merryhew's","merryhew's",0,"Illusion vermin (box)"]],"screaming box":[[35,"Merryhew's","merryhew's",0,"Screaming box"]],"colour-change hair sweet":[[18,"Merryhew's","merryhew's",0,"Colour-change hair sweet"]],"confetti ambush card":[[10,"Merryhew's","merryhew's",0,"Confetti ambush card"]],"secret fools day kit":[[60,"Merryhew's","merryhew's",0,"Secret Fools Day kit"]],"private booth (per hour)":[[30,"The Snug","snug",0,"Private booth (per hour)"]],"set meal":[[30,"The Snug","snug",0,"Set meal"]],"pot of tea for the booth":[[12,"The Snug","snug",0,"Pot of tea for the booth"]],"stew and fresh bread":[[22,"The Snug","snug",0,"Stew and fresh bread"]],"sweet course":[[14,"The Snug","snug",0,"Sweet course"]],"evening booth (18:00 to curfew)":[[90,"The Snug","snug",0,"Evening booth (18:00 to curfew)"]],"ardenne case":[[1500,"Ardenne (special order)","commissary",0,"Ardenne case"]],"ardenne focus":[[4000,"Ardenne (special order)","commissary",0,"Ardenne focus"]],"ardenne measuring set":[[2200,"Ardenne (special order)","commissary",0,"Ardenne measuring set"]],"ardenne tuning instrument":[[2600,"Ardenne (special order)","commissary",0,"Ardenne tuning instrument"]],"the rose in the tower":[[18,"Quillfeather's","quillfeather's",0,"The Rose in the Tower"]],"seven towers (deluxe edition)":[[30,"Quillfeather's","quillfeather's",0,"Seven Towers (deluxe edition)"]],"nine rivers: field tactics":[[40,"Quillfeather's","quillfeather's",0,"Nine Rivers: Field Tactics"]],"crossed blades: famous duels":[[30,"Quillfeather's","quillfeather's",0,"Crossed Blades: Famous Duels"]],"songs of the oathbound":[[20,"Quillfeather's","quillfeather's",0,"Songs of the Oathbound"]],"songbook of old ballads":[[16,"Quillfeather's","quillfeather's",0,"Songbook of old ballads"]],"lamps out: tales of halvard":[[18,"Quillfeather's","quillfeather's",0,"Lamps Out: Tales of Halvard"]],"the night student: a true account":[[6,"Quillfeather's","quillfeather's",0,"The Night Student: A True Account"]],"the truth behind halvard's ghosts":[[15,"Quillfeather's","quillfeather's",0,"The Truth Behind Halvard's Ghosts"]],"halvard through the centuries":[[60,"Quillfeather's","quillfeather's",0,"Halvard Through the Centuries"]],"anecdotes of the old kingdom":[[35,"Quillfeather's","quillfeather's",0,"Anecdotes of the Old Kingdom"]],"founding of the dovecote (old edition)":[[45,"Quillfeather's","quillfeather's",0,"Founding of the Dovecote (old edition)"]],"what everyone knows about the founding":[[12,"Quillfeather's","quillfeather's",0,"What Everyone Knows About the Founding"]],"commentaries of saint orel (antique)":[[70,"Quillfeather's","quillfeather's",0,"Commentaries of Saint Orel (antique)"]],"the final word on everything":[[12,"Quillfeather's","quillfeather's",0,"The Final Word on Everything"]],"fallen stars: notes on mana resonance":[[120,"Quillfeather's","quillfeather's",0,"Fallen Stars: Notes on Mana Resonance"]],"the noble houses, by precedence":[[50,"Quillfeather's","quillfeather's",0,"The Noble Houses, by Precedence"]],"etiquette manual":[[20,"Quillfeather's","quillfeather's",0,"Etiquette manual"]],"dragonchess problem book":[[25,"Quillfeather's","quillfeather's",0,"Dragonchess problem book"]],"star atlas":[[30,"Quillfeather's","quillfeather's",0,"Star atlas"]],"hand-speech for beginners":[[15,"Quillfeather's","quillfeather's",0,"Hand-Speech for Beginners"]],"picture book for small children":[[8,"Quillfeather's","quillfeather's",0,"Picture book for small children"]],"old competition programmes":[[10,"Quillfeather's","quillfeather's",0,"Old competition programmes"]],"blank leather journal":[[25,"Quillfeather's","quillfeather's",0,"Blank leather journal"]],"pocket memory notebook":[[20,"Quillfeather's","quillfeather's",0,"Pocket memory notebook"]],"leather planner":[[20,"Quillfeather's","quillfeather's",0,"Leather planner"]],"plush animal":[[20,"Pennywhistle Curios","pennywhistle curios",0,"Plush animal"]],"goosedown pillow":[[35,"Pennywhistle Curios","pennywhistle curios",0,"Goosedown pillow"]],"silver hand mirror":[[45,"Pennywhistle Curios","pennywhistle curios",0,"Silver hand mirror"]],"palm crystal ball":[[60,"Pennywhistle Curios","pennywhistle curios",0,"Palm crystal ball"]],"porcelain tea set":[[55,"Pennywhistle Curios","pennywhistle curios",0,"Porcelain tea set"]],"music box":[[30,"Pennywhistle Curios","pennywhistle curios",0,"Music box"]],"prism charm":[[12,"Pennywhistle Curios","pennywhistle curios",0,"Prism charm"]],"black silk ribbons":[[10,"Pennywhistle Curios","pennywhistle curios",0,"Black silk ribbons"]],"travel dragonchess set":[[60,"Pennywhistle Curios","pennywhistle curios",0,"Travel Dragonchess set"]],"sovereigns":[[80,"Pennywhistle Curios","pennywhistle curios",0,"Sovereigns"]],"gilt-edged playing cards":[[12,"Pennywhistle Curios","pennywhistle curios",0,"Gilt-edged playing cards"]],"vanishing-coin illusion kit":[[25,"Pennywhistle Curios","pennywhistle curios",0,"Vanishing-coin illusion kit"]],"juggling set":[[15,"Pennywhistle Curios","pennywhistle curios",0,"Juggling set"]],"rainglass":[[35,"Pennywhistle Curios","pennywhistle curios",0,"Rainglass"]],"everlamp, miniature":[[40,"Pennywhistle Curios","pennywhistle curios",0,"Everlamp, miniature"]],"hearthstone hand-warmer":[[25,"Pennywhistle Curios","pennywhistle curios",0,"Hearthstone hand-warmer"]],"hooded night lamp":[[20,"Pennywhistle Curios","pennywhistle curios",0,"Hooded night lamp"]],"warding amulet":[[25,"Pennywhistle Curios","pennywhistle curios",0,"Warding amulet"]],"wishing coin":[[5,"Pennywhistle Curios","pennywhistle curios",0,"Wishing coin"]],"thank-you card":[[3,"Pennywhistle Curios","pennywhistle curios",0,"Thank-you card"]],"get-well hamper":[[30,"Pennywhistle Curios","pennywhistle curios",0,"Get-well hamper"]],"engraved trophy cup":[[50,"Pennywhistle Curios","pennywhistle curios",0,"Engraved trophy cup"]],"knight's pennon":[[20,"Pennywhistle Curios","pennywhistle curios",0,"Knight's pennon"]],"halvard pennant":[[10,"Pennywhistle Curios","pennywhistle curios",0,"Halvard pennant"]],"royal crest paperweight":[[35,"Pennywhistle Curios","pennywhistle curios",0,"Royal crest paperweight"]],"independence war commemorative medal":[[30,"Pennywhistle Curios","pennywhistle curios",0,"Independence War commemorative medal"]],"carved asmoday charm":[[15,"Pennywhistle Curios","pennywhistle curios",0,"Carved Asmoday charm"]],"festival lantern set":[[18,"Pennywhistle Curios","pennywhistle curios",0,"Festival lantern set"]],"brass handbell":[[8,"Pennywhistle Curios","pennywhistle curios",0,"Brass handbell"]],"wind-up alarm clock":[[15,"Pennywhistle Curios","pennywhistle curios",0,"Wind-up alarm clock"]],"silver-polishing kit":[[20,"Pennywhistle Curios","pennywhistle curios",0,"Silver-polishing kit"]],"walnut desk tidy":[[30,"Pennywhistle Curios","pennywhistle curios",0,"Walnut desk tidy"]],"loaded bone dice":[[12,"Pennywhistle Curios","pennywhistle curios",0,"Loaded bone dice"]],"marked deck":[[12,"Pennywhistle Curios","pennywhistle curios",0,"Marked deck"]],"table wine":[[25,"Barrow & Vine","barrow & vine",0,"Table wine"]],"fine vintage":[[90,"Barrow & Vine","barrow & vine",0,"Fine vintage"]],"orchard cider":[[10,"Barrow & Vine","barrow & vine",0,"Orchard cider"]],"stonebrew ale (jug)":[[18,"Barrow & Vine","barrow & vine",0,"Stonebrew ale (jug)"]],"clan firewine":[[70,"Barrow & Vine","barrow & vine",0,"Clan firewine"]],"blackroot cigars":[[15,"Barrow & Vine","barrow & vine",0,"Blackroot cigars"]],"engraved hip flask":[[40,"Barrow & Vine","barrow & vine",0,"Engraved hip flask"]],"bouquet of stage roses":[[20,"Greenwick's","greenwick's",0,"Bouquet of stage roses"]],"cut flowers":[[12,"Greenwick's","greenwick's",0,"Cut flowers"]],"moonfern in a pot":[[45,"Greenwick's","greenwick's",0,"Moonfern in a pot"]],"oak sapling in a pot":[[20,"Greenwick's","greenwick's",0,"Oak sapling in a pot"]],"seed packets":[[5,"Greenwick's","greenwick's",0,"Seed packets"]],"bag of red apples":[[6,"Greenwick's","greenwick's",0,"Bag of red apples"]],"carrots and fresh greens":[[5,"Greenwick's","greenwick's",0,"Carrots and fresh greens"]],"pigeon feed":[[4,"Greenwick's","greenwick's",0,"Pigeon feed"]],"pruning shears":[[25,"Greenwick's","greenwick's",0,"Pruning shears"]],"precision tool roll":[[50,"The Tinker's Bench","tinker's bench",0,"Precision tool roll"]],"mystery clockwork (sold as seen)":[[15,"The Tinker's Bench","tinker's bench",0,"Mystery clockwork (sold as seen)"]],"brass golem joint set":[[90,"The Tinker's Bench","tinker's bench",0,"Brass golem joint set"]],"glass stirring-rod set":[[15,"The Tinker's Bench","tinker's bench",0,"Glass stirring-rod set"]],"whetstone and blade oil":[[20,"The Tinker's Bench","tinker's bench",0,"Whetstone and blade oil"]],"armour polish kit":[[18,"The Tinker's Bench","tinker's bench",0,"Armour polish kit"]],"duelling gauntlets":[[40,"The Tinker's Bench","tinker's bench",0,"Duelling gauntlets"]],"fishing tackle box":[[30,"The Tinker's Bench","tinker's bench",0,"Fishing tackle box"]],"gut guitar strings":[[12,"The Tinker's Bench","tinker's bench",0,"Gut guitar strings"]],"tuning fork":[[10,"The Tinker's Bench","tinker's bench",0,"Tuning fork"]],"steel-nib fountain pen":[[40,"The Tinker's Bench","tinker's bench",0,"Steel-nib fountain pen"]],"letter paper set":[[8,"The Tinker's Bench","tinker's bench",0,"Letter paper set"]],"sketchbook and charcoal":[[15,"The Tinker's Bench","tinker's bench",0,"Sketchbook and charcoal"]],"carving knife and limewood block":[[20,"The Tinker's Bench","tinker's bench",0,"Carving knife and limewood block"]],"bolt of sky silk":[[40,"The Tinker's Bench","tinker's bench",0,"Bolt of Sky silk"]],"embroidery thread set":[[15,"The Tinker's Bench","tinker's bench",0,"Embroidery thread set"]],"talisman paper stack":[[10,"The Tinker's Bench","tinker's bench",0,"Talisman paper stack"]],"chamois lens cloth":[[5,"The Tinker's Bench","tinker's bench",0,"Chamois lens cloth"]],"pocket thermos":[[25,"The Tinker's Bench","tinker's bench",0,"Pocket thermos"]],"shuttered dark-lantern":[[25,"The Tinker's Bench","tinker's bench",0,"Shuttered dark-lantern"]],"running shoes":[[45,"The Tinker's Bench","tinker's bench",0,"Running shoes"]],"premium beast jerky":[[20,"The Tinker's Bench","tinker's bench",0,"Premium beast jerky"]],"beast muzzle":[[15,"The Tinker's Bench","tinker's bench",0,"Beast muzzle"]],"vigour tonic":[[30,"The Tinker's Bench","tinker's bench",0,"Vigour tonic"]],"salaffian flatbread":[[6,"The Salaffian Oven","salaffian oven",0,"Salaffian flatbread"]],"salaffian spice box":[[25,"The Salaffian Oven","salaffian oven",0,"Salaffian spice box"]],"loud silk waistcoat":[[70,"Tailor's Row","tailor's row",0,"Loud silk waistcoat"]],"formal dress coat":[[150,"Tailor's Row","tailor's row",0,"Formal dress coat"]],"platform boots":[[55,"Tailor's Row","tailor's row",0,"Platform boots"]],"ballroom shoes":[[60,"Tailor's Row","tailor's row",0,"Ballroom shoes"]],"bergamot cologne":[[35,"Tailor's Row","tailor's row",0,"Bergamot cologne"]],"kid-leather gloves":[[30,"Tailor's Row","tailor's row",0,"Kid-leather gloves"]],"honey bun":[[6,"Commissary","commissary",0,"Honey bun"]],"pocket campus map":[[5,"Commissary","commissary",0,"Pocket campus map"]],"smoked river fish":[[6,"Commissary","commissary",0,"Smoked river fish"]],"lavender laundry soap":[[5,"Commissary","commissary",0,"Lavender laundry soap"]],"sweet bun":[[6,"The Mall — bakery","mall",0,"Sweet bun"]],"sweet bamboo tea (tin)":[[14,"The Mall — cafés and tea houses","mall",0,"Sweet bamboo tea (tin)"]],"silvertip tea":[[30,"The Mall — cafés and tea houses","mall",0,"Silvertip tea"]],"rain-ward charm":[[18,"The Tinker's Bench","tinker's bench",["Spring","Autumn"],"Rain-ward charm"]],"quick-dry powder":[[10,"The Tinker's Bench","tinker's bench",["Spring","Autumn","Winter"],"Quick-dry powder"]],"cooling charm":[[20,"The Tinker's Bench","tinker's bench",["Summer"],"Cooling charm"]],"ember pouch":[[15,"The Tinker's Bench","tinker's bench",["Autumn","Winter"],"Ember pouch"]],"knitting wool and needles":[[15,"The Tinker's Bench","tinker's bench",0,"Knitting wool and needles"]],"paint box":[[30,"The Tinker's Bench","tinker's bench",0,"Paint box"]],"elderflower cold syrup":[[15,"Greenwick's","greenwick's",["Spring","Autumn","Winter"],"Elderflower cold syrup"]],"blossom honey cake":[[9,"The Mall — bakery","mall",["Spring"],"Blossom honey cake"]],"spiced apple turnover":[[10,"The Mall — bakery","mall",["Autumn"],"Spiced apple turnover"]],"roasted chestnuts":[[8,"The Mall — cafés and tea houses","mall",["Autumn","Winter"],"Roasted chestnuts"]],"salted lemon water":[[6,"Commissary","commissary",["Summer"],"Salted lemon water"]],"baking and cooking ingredients":[[10,"Commissary","commissary",0,"Baking and cooking ingredients"]],"bar stock and coal":[[20,"Commissary","commissary",0,"Bar stock and coal"]],"linen summer shirt":[[45,"Tailor's Row","tailor's row",["Summer"],"Linen summer shirt"]],"fleece-lined boots":[[70,"Tailor's Row","tailor's row",["Autumn","Winter"],"Fleece-lined boots"]],"mulled apple cider":[[12,"The Snug","snug",["Winter"],"Mulled apple cider"]],"the ninth dawn (latest volume)":[[8,"Quillfeather's","quillfeather's",0,"The Ninth Dawn (latest volume)"]]};
const SHOP_KEY = Object.fromEntries(Object.keys(SHOP_PRICE).map(k => [itemKey(k), k]));
const shopRows = name => SHOP_PRICE[itemBase(name)] || SHOP_PRICE[SHOP_KEY[itemKey(name)]] || [];
const INV_KINDS = ['food', 'drink', 'gear', 'gift', 'book', 'reagent', 'other'];
// 1.42.0 (audit 1.3): one item-name key (itemKey, shared.js) for the Consumables filter, the Qty decrease (H2), gifts and the R2
// reminder: "a Quick-dry powder" is the Bag's "Quick-dry powder"
// the Bag key a reported name means: the exact name first (any case), then the same itemKey, preferring one still held
const bagKeyOf = (I, name) => { const ks = Object.keys(I || {}), lo = String(name || '').trim().toLowerCase(), k = itemKey(name);
  return ks.find(x => x.toLowerCase() === lo) || ks.find(x => itemKey(x) === k && num((I[x] || {}).Qty, 1) > 0) || ks.find(x => itemKey(x) === k) || ''; };
// 1.45.0 (audit 3.5): one ledger for Points and Coin. Every payment the engine makes or takes goes through it: the balance (never
// below 0), one Transactions line, and a record of this reply's engine lines (c.tx), so the "not itemised" and overspend checks
// (stepHidden) read the narrator's own lines and changes only. The list is cut to its last 20 lines once, in stepCommit, after
// every check has compared it with the state before the reply.
function ledger(c, cur, delta, why) {
  const W = c.S.Player.Wallet, d = Math.round(num(delta, 0)), was = num(W[cur], 0);
  W[cur] = Math.max(0, was + d);
  const line = `${d >= 0 ? '+' : '-'}${Math.abs(d)} ${cur === 'Coin' ? 'coin: ' : ''}${why}`;
  W.Transactions = [...(Array.isArray(W.Transactions) ? W.Transactions : []), line];
  (c.tx || (c.tx = [])).push({ cur, delta: W[cur] - was, line });
  return line;
}
// 1.45.0 (audit 3.4): one Bag ledger. Every engine change to an item's Qty (used items, gifts, crafting, sales, purchases, the parcel
// from home, Sunfizz bottles) goes through bagTake / bagGive, keyed by bagKeyOf. The reply's own change to that item counts toward it
// (a Qty the narrator already lowered is not lowered again, one already raised is not raised again), and several engine changes to
// one item in a reply add up (c.bagTx). A new item gets kind and note; the Bag key is returned ('' when nothing was there to take).
function bagMove(c, name, delta, kind, note) {
  const { S, B } = c, I = _.isPlainObject(S.Inventory) ? S.Inventory : (S.Inventory = {});
  let k = bagKeyOf(I, name);
  if (!k) { if (delta <= 0) return ''; k = String(name).trim(); I[k] = { Qty: 0, Kind: kind || 'other', Note: note || '', Plan: '' }; }
  const BI = (c.hasB && B && B.Inventory) || {}, kb = bagKeyOf(BI, k), M = c.bagTx || (c.bagTx = {}), id = k.trim().toLowerCase();
  const r = M[id] || (M[id] = { orig: num(I[k].Qty, 0), take: 0, give: 0, done: 0 });
  if (delta < 0) r.take -= delta; else r.give += delta;
  const own = r.orig - (kb ? num(BI[kb].Qty, 0) : 0);          // what the reply itself did to this item
  const want = r.give - Math.min(r.give, Math.max(0, own)) - (r.take - Math.min(r.take, Math.max(0, -own)));
  I[k].Qty = Math.max(0, num(I[k].Qty, 0) + want - r.done); r.done = want;
  return k;
}
const bagTake = (c, name, n = 1) => bagMove(c, name, -Math.max(0, n));
const bagGive = (c, name, n, kind, note) => bagMove(c, name, Math.max(0, n), kind, note);
const fxOf = name => SHOP_FX[itemBase(name)] || SHOP_FX[itemKey(name)] || null;   // itemBase, itemKey: shared.js
const gearOf = (I, buff, now) => {
  const own = Object.keys(I || {}).filter(k => (I[k] && I[k].Qty) > 0), ks = own.join(' | ');
  return _.mapValues(GEAR, (rx, g) => rx.test(ks) || own.some(k => (fxOf(k) || {}).gear === g || new RegExp(`\\benchanted ${g}\\b`, 'i').test(String(I[k].Note || ''))) || ((buff || {})[g] > now));
};
const EXPO = { soaked: 'Soaked', drenched: 'Soaked', wet: 'Soaked', chilled: 'Chilled', frozen: 'Chilled', frostbitten: 'Chilled' };   // 1.9.4: /Exposure kinds
// 1.75.0: how a condition, fatigue and lost sleep look to others (<now>'s "How {{user}} looks", nowOf)
const LOOK = { cond: { Soaked: 'wet through', Chilled: 'shivering with cold', Overheated: 'flushed and sweating', 'Head cold': 'sniffling with a head cold' },
  fatigue: { Tired: 'tired', Exhausted: 'visibly exhausted', Collapsed: 'collapsed' }, sleep: 'shadows under the eyes from lost sleep' };
const COND = {
  Soaked: 'Wet through: rest and sleep restore half the usual stamina. Dries after an hour indoors.',
  Chilled: 'Cold to the bone: -10 stamina per hour outdoors. Warms up after an hour indoors or a hot drink.',
  Overheated: 'Too hot: -10 stamina per hour outdoors. Cools down after half an hour indoors or a cold drink.',
  'Head cold': 'Stuffy and slow: stamina capped at 80% of max until it passes or the Medical Centre treats it.',
};
// ---- 1.1.0 Features settings (spec §9): which state each feature parks when it is off (data/features.json, injected) ----
const FEATURES = [{"id":"proficiency","control":"toggle","paths":["Player._Proficiency","$eng.prof"]},{"id":"planner","control":"toggle","paths":["Commitments"],"unlock":"planner"},{"id":"notices","control":"toggle","paths":["Notices"],"unlock":"notices"},{"id":"letters","control":"toggle","paths":["Letters"],"unlock":"letters"},{"id":"mystery","control":"toggle","paths":["Clues","Mysteries"],"unlock":"mystery"},{"id":"competition","control":"toggle","paths":["Competition"],"unlock":"competition"},{"id":"projects","control":"toggle","paths":["Projects"],"unlock":"projects"},{"id":"trip","control":"toggle","paths":["Trip"],"unlock":"trip"},{"id":"battle","control":"toggle","paths":["Battle"],"unlock":"battle"},{"id":"inventory","control":"toggle","paths":["Inventory"],"unlock":"inventory"},{"id":"happenings","control":"levels","field":"happenings"},{"id":"npc_routines","control":"toggle"},{"id":"npc_initiative","control":"toggle"},{"id":"weather","control":"levels","field":"wxfx","paths":["Player.Conditions"],"unlock":"conditions"},{"id":"class","control":"toggle"},{"id":"gist","control":"toggle","paths":["_Recent_story","$eng.gist"]},{"id":"hooks","control":"toggle","paths":["Hooks"]},{"id":"gossip","control":"toggle"},{"id":"fortune","control":"toggle"},{"id":"attendance","control":"toggle"},{"id":"recap","control":"toggle"},{"id":"routine_week","control":"toggle"},{"id":"small_scenes","control":"toggle"},{"id":"ambience","control":"levels","field":"ambience"},{"id":"reminders","control":"toggle"},{"id":"study","control":"toggle"},{"id":"say_colors","control":"toggle"}];
const EMPTY = { Commitments: {}, Notices: {}, Letters: {}, Clues: {}, Mysteries: {}, Projects: {}, Inventory: {}, Hooks: {}, 'Player.Conditions': {},
  Competition: { Tier: '', Status: '', Placement: '', Team: [], Results: [] }, Trip: { Active: false, Destination: '', Companions: [], Note: '' },
  Battle: { Active: false, Combatants: {} } };
// parkOff: the feature's state is parked (weather effects: anything but Full); ruleOff: its rules and UI are off (weather: Off only)
const parkOff = (X, f) => { const u = (X && X.$ui) || {}; return f.control === 'levels' ? (f.id === 'weather' ? (u.wxfx || 'full') !== 'full' : (u[f.field] || 'normal') === 'off') : (u.off || []).includes(f.id); };
const isEmptyV = v => v == null || v === '' || v === false || (Array.isArray(v) && !v.length) || (_.isPlainObject(v) && !Object.keys(v).length);
function mergePark(to, from) {                                  // a write into a parked module is kept in the parking, not dropped
  if (_.isPlainObject(to) && _.isPlainObject(from)) {
    for (const [k, v] of Object.entries(from)) if (!isEmptyV(v)) to[k] = Array.isArray(v) && Array.isArray(to[k]) ? [...new Set([...to[k], ...v])] : _.cloneDeep(v);
    return to;
  }
  return isEmptyV(from) ? to : _.cloneDeep(from);
}
const REACH = (m, age) => (age <= 0 ? 'only witnesses' : m.fate === 'fast' && age <= 6 ? 'all over campus' : age <= 2 ? "the source's dorm and club" : age <= 6 ? 'most of campus' : 'old news, everyone knows');
const CAP_HOOKS = 15, CAP_BAG = 40, BOTTLE_BACK = 2;

// v1.0.3 (F14): a save made before a field existed may reach the engine without it (an update the schema never parsed).
// Fill missing containers with their empty shape; existing values are never touched. Arrays are only set when missing.
const SHAPE = {
  Scene: { Present: {} },
  Player: { Profile: { Council: false, Reputation: {} }, Vitals: {}, Injuries: {}, Wallet: { Points: 0, Coin: 0, Transactions: [] }, Academics: { Grades: {}, Exams: {} }, _Proficiency: {}, Conditions: {} },
  Magic: { _Techniques: {}, _Affinity: { Types: [], Dominant: '', Specialties: [], Preset: '' }, Active: {}, Casts: [], Pacts: {} },
  Hidden: { _True_magic: '', Known_by: [], Dove_attention: 0 },
  Bonds: {}, Campus_State: { Entrance_tour: { Year: 0, Guide: '', FirstYears: [] }, Council: { Candidates: { '1': { First: 'Florian', Second: 'Dante' } }, Results: {}, President: 'Irene', VicePresident: 'Caspian', PresidentElect: '', VicePresidentElect: '', Members: ['Irene','Caspian','Florian','Dante'] }, Events: {}, Rumours: [], Location_changes: {}, Lore_changes: {}, NPC_status: {}, New_relations: {}, Secrets_revealed: [], Graduated: [] },
  Commitments: {}, Notices: {}, Letters: {}, Journal: [], Clues: {}, Mysteries: {},
  Competition: { Tier: '', Status: '', Placement: '', Team: [], Results: [] }, Projects: {},
  Trip: { Active: false, Destination: '', Companions: [], Note: '' }, Expedition: { Caught: false }, Avalon: { Ride: false }, Sunreach: { Ride: '', Bet: { Game: '', Stake: 0 } }, Battle: { Active: false, Combatants: {} }, _Log: [],
  Inventory: {}, Hooks: {},   // 1.1.0
  Extras: {},   // 1.6.1
  _Perks: {}, Rep_events: [], Training: [], Practice: [], Purchases: [], Perk_use: [],   // 1.3.0 / 1.27.0
  Exam_events: [], Tutoring: [],   // 1.15.0
};
function fillShape(o, shape) {
  for (const [k, v] of Object.entries(shape)) {
    if (o[k] === undefined || o[k] === null) o[k] = _.cloneDeep(v);
    else if (_.isPlainObject(v) && _.isPlainObject(o[k]) && Object.keys(v).length) fillShape(o[k], v);
  }
}
// 1.16.1 (audit B4): one answer to "is this NPC away?" for bonds, introductions, Rank 5 handovers, the Entrance tour, NPC
// initiative and birthday parties (each had its own list of words). A status is found by the NPC's id, alias or first word.
const AWAY_RX = /away|abroad|absent|missing|dead|confined|hospital|unconscious|expelled|unavailable|left campus|left halvard|out of town/i;
const npcStatusIn = (S, id) => npcStatusOf((S.Campus_State || {}).NPC_status, id, NPC_ALIAS);   // shared.js
const npcAwayIn = (S, id) => ((S.Campus_State || {}).Graduated || []).includes(id) || AWAY_RX.test(npcStatusIn(S, id));
// 1.16.1 (audit B1): Player.Profile.Club in the club list's own words ("Soccer", "soccer club" -> "Soccer Club"; "Theatre" ->
// "Theatre Troupe"), so Saturday club time is counted; a club the list does not know is kept as written
function canonClub(c, S) {
  const s = String(c || '').trim(), k = s.toLowerCase().replace(/^the\s+/, '').replace(/\s+/g, ' ');
  if (!k) return '';
  const F = S ? foundedClub(S) : null;   // 1.75.0: the club {{user}} founds (shared.js)
  if (F && F.name.toLowerCase().replace(/^the\s+/, '').replace(/\s+/g, ' ') === k) return F.name;
  if (/^duel+ing club$/.test(k)) return 'Magic Duelling Club';
  if (/^walking( club)?$/.test(k)) return 'Camping Club';   // 1.76.0: the Walking Club became the Camping Club
  const names = Object.keys(CLASS.clubs || {}), base = x => x.toLowerCase().replace(/\s+club$/, '');
  return names.find(n => n.toLowerCase() === k) || (CLASS.calias || {})[base(k)] || names.find(n => base(n) === base(k)) || s;
}
// 1.75.0 (owner-approved planning/DRAFT_club_sendiri.md): one answer for every club, the founded one included: where it meets (place
// keys), the proficiency its Saturday time trains, its members now (students who moved to the founded club have left their lore club)
const isFounded = (F, name) => !!F && F.founded && name === F.name;
const clubVenues = (S, name) => { const F = foundedClub(S); return isFounded(F, name) ? (F.vkey ? [F.vkey] : []) : (CLASS.clubs || {})[name] || []; };
const clubField = (S, name) => { const F = foundedClub(S), n = String(name || '').toLowerCase(); return isFounded(F, name) ? F.field : PROF.find(k => (CLUB_STATS[k] || []).some(x => n.includes(x.toLowerCase()))) || ''; };
const clubMembersNow = (S, name) => { const F = foundedClub(S); return isFounded(F, name) ? F.members : (CLUB_MEMBERS[name] || []).filter(id => !movedToFounded(F, id)); };
const loreClubOf = id => Object.keys(CLUB_MEMBERS).find(k => CLUB_MEMBERS[k].includes(id)) || '';
const BOND0 = { $gifts: {}, Rank: 0, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '' };
// Source helpers for the approved mood / gifts release, injected by gen_engine.py.
const NPC_MOODS = {"Irene":{"loves":["Clear"],"hates":["Storm"],"clock":"M","exams":1,"trials":0,"reason":"cleans her room every morning, good grades","days":[{"on":"Remembrance Day","fix":"Bad","tone":"rigid","how":"more formal than ever, every rule to the letter; the friends the Doves took to the Dovecote are on her mind and never on her lips."},{"on":"birthday","lean":1,"tone":"formal","how":"a fuss makes her more formal, not less; a letter from home gets the private smile."}]},"Caspian":{"loves":["Clear"],"hates":["Storm"],"clock":"","exams":0,"trials":0,"reason":"outdoor festivals he runs; storms cancel them","days":[{"on":"Remembrance Day","fix":"Bad","tone":"sombre","how":"holds the goddess charm in his hand all day; still smooths every room, and steers every joke away from the breach."},{"on":"Star Night","lean":1,"tone":"busy","how":"he runs it: everywhere at once, happiest with a clipboard and a crowd."},{"on":"Harvest Festival","lean":1,"tone":"busy","how":"he runs it: everywhere at once, happiest with a clipboard and a crowd."}]},"Etnie":{"loves":["Snow"],"hates":["Storm"],"clock":"","exams":0,"trials":0,"reason":"a dog in snow; thunder","days":[{"on":"Remembrance Day","fix":"Bad","tone":"lost","how":"she vanishes for the day and is found asleep near {{user}}'s door; the moon-eyed boy she doted on died on the breach night."},{"on":"birthday","lean":1,"tone":"glowing","how":"an orphan who never had a birthday kept: remembered by {{user}}, she is all tail and no shame about it; forgotten, she says birthdays are for kids."}]},"Royhan":{"loves":["Cool"],"hates":["Hot","Heatwave"],"clock":"M","exams":0,"trials":0,"reason":"farm-raised; steady"},"Sophia":{"loves":["Rain","Storm"],"hates":["Hot","Heatwave"],"clock":"","exams":0,"trials":1,"reason":"rain means water everywhere; battle-hungry","days":[{"on":"Remembrance Day","fix":"Bad","tone":"flat","how":"the one subject that flattens her voice is everywhere today; pity, or being \"handled\", gets a hard look."},{"on":"birthday","lean":1,"tone":"rowdy","how":"wants a brawl or a feast, ideally both; reads her family's bragging letter twice."}]},"Gareth":{"loves":["Clear"],"hates":[],"clock":"M","exams":1,"trials":1,"reason":"winning"},"Ruby":{"loves":["Clear","Mild"],"hates":["Storm"],"clock":"","exams":0,"trials":-1,"reason":"hates fighting of any kind"},"Lenna":{"loves":["Rain"],"hates":["Hot"],"clock":"N","exams":-1,"trials":0,"reason":"naps; mornings are the enemy; courageous","days":[{"on":"Star Night","lean":1,"tone":"hopeful","how":"wants to spend it with someone special, and will not be the one to say so."}]},"Saffi":{"loves":["Clear","Warm"],"hates":["Rain"],"clock":"M","exams":-1,"trials":1,"reason":"a cat and water; can't sit still in class, lives to move"},"Kanae":{"loves":["Clear night"],"hates":["Overcast","Fog"],"clock":"N","exams":1,"trials":0,"reason":"stars from the Observation Tower; top grades","days":[{"on":"Star Night","lean":1,"tone":"radiant","how":"stars from the Observation Tower, and the longest queue on campus is for her readings."},{"on":"birthday","lean":1,"tone":"sweet","how":"sweetness on display all day; she notes exactly who remembered and who did not."}]},"Idris":{"loves":["Clear by day ≥15 °C"],"hates":["Cold","Freezing","Windy","Gale"],"clock":"","exams":0,"trials":0,"reason":"cold-blooded"},"Tilly":{"loves":["Fog","Storm"],"hates":[],"clock":"N","exams":0,"trials":1,"reason":"ghost weather; walks toward danger","days":[{"on":"Remembrance Day","tone":"hushed","how":"the Night Student story resurfaces today; she listens for it and writes it down, quietly."}]},"Dante":{"loves":[],"hates":[],"clock":"M","exams":0,"trials":1,"reason":"order under pressure"},"Florian":{"loves":["Clear"],"hates":["Rain"],"clock":"N","exams":0,"trials":1,"reason":"being looked at, winning","days":[{"on":"birthday","lean":1,"tone":"basking","how":"expects to be the centre of the room and usually is; the only thanks he does not perform is for a gift for Hades."}]},"Aiden":{"loves":["Fog"],"hates":[],"clock":"N","exams":1,"trials":1,"reason":"curfew routes; exam and contest weeks are betting season"},"Caralynn":{"loves":["Clear"],"hates":["Rain","Storm","Windy","Gale"],"clock":"","exams":-1,"trials":1,"reason":"the spotlight; her hair","days":[{"on":"birthday","lean":1,"tone":"on stage","how":"her birthday is a production with an audience; the letter from her father sits unopened again."}]},"Zara":{"loves":["Cold","Snow"],"hates":["Hot","Windy","Gale"],"clock":"","exams":0,"trials":-1,"reason":"sitting by a fire; being stared at"},"Percival":{"loves":["Storm","Gale"],"hates":[],"clock":"M","exams":-1,"trials":1,"reason":"heroic weather; a chance for glory","days":[{"on":"Independence Crowning Day","lean":1,"tone":"grand","how":"names the ruler and the coronation he \"attended\", whether or not Eldrasil ever had them."},{"on":"birthday","lean":1,"tone":"grand","how":"holds court as Grand Commander and demands a feast in the old style."}]},"Trixie":{"loves":["Clear","Snow","Windy"],"hates":["Rain"],"clock":"M","exams":-1,"trials":1,"reason":"outdoor shows; sitting still; excitement","days":[{"on":"Traveling Circus","fix":"Good","tone":"home","how":"her family's circus is here; every waking minute is at the tents."},{"on":"M8 W3","lean":-1,"tone":"homesick","how":"the circus has gone; she writes twice as many letters this week."},{"on":"birthday","lean":1,"tone":"showtime","how":"turns her birthday into a show for everyone; the circus is two days away."}]},"Vera":{"loves":["Storm"],"hates":[],"clock":"N","exams":0,"trials":0,"reason":"lightning; one tiny experiment all night"},"Castor":{"loves":["Fog","Overcast"],"hates":[],"clock":"M","exams":0,"trials":0,"reason":"unnoticed; the Gardens early"},"Alyssa":{"loves":["Clear"],"hates":[],"clock":"M","exams":0,"trials":0,"reason":"quiet mornings","days":[{"on":"birthday","lean":1,"tone":"touched","how":"her notebook tells her who remembered; she writes it down as one true thing."}]},"Linus":{"loves":["Clear"],"hates":[],"clock":"","exams":0,"trials":1,"reason":"brackets and matchups"},"Maple":{"loves":["Clear","Mild"],"hates":["Storm","Gale"],"clock":"M","exams":0,"trials":-1,"reason":"climbing trees; fights, and Sobek near them"},"Nerys":{"loves":["Fog"],"hates":[],"clock":"","exams":0,"trials":0,"reason":"\"nobody there\"; no feelings about the rest","days":[{"on":"birthday","tone":"indifferent","how":"does not mention it and may not know it is today: \"Next.\""}]},"Hadrian":{"loves":["Mild"],"hates":["Rain","Cold"],"clock":"","exams":1,"trials":-1,"reason":"a warm coat, being right; risk","days":[{"on":"Remembrance Day","tone":"oblivious","how":"takes the front seat reserved for families, because nobody was using it yet."},{"on":"birthday","lean":1,"tone":"entitled","how":"expects the day to arrange itself around him."}]},"Wren":{"loves":["Clear"],"hates":["Fog"],"clock":"M","exams":0,"trials":0,"reason":"the dock at dawn; bad light defeats lip-reading"},"Tsubaki":{"loves":["Clear night","Snow"],"hates":["Fog"],"clock":"M","exams":-1,"trials":1,"reason":"open sky; lectures she can't follow; a good opponent","days":[{"on":"Star Night","lean":1,"tone":"keen","how":"her sky magic is at its greatest of the year tonight, and she wants a match more than ever."}]},"Gavlan":{"loves":[],"hates":["Storm"],"clock":"M","exams":0,"trials":1,"reason":"thunder and war nightmares; an old officer under pressure","days":[{"on":"Remembrance Day","lean":-1,"tone":"stern","how":"makes sure the breach never repeats on his watch; his hand goes to his journal more often today."}]},"Yvette":{"loves":[],"hates":["Fog"],"clock":"","exams":0,"trials":-1,"reason":"paranoid","days":[{"on":"Magical & Science Fair","lean":-1,"tone":"harried","how":"she runs the Fair and checks every stand twice, sure something will go wrong."},{"on":"Graduation","tone":"wistful","how":"watches the graduates walk out of the gates for longer than anyone else."}]},"Krieg":{"loves":["Fog"],"hates":[],"clock":"M","exams":0,"trials":1,"reason":"doubled patrols in fog; the Thinning is his element","days":[{"on":"The Thinning","lean":1,"tone":"in his element","how":"doubled patrols, a locked academy, and every rule his to enforce."},{"on":"birthday","tone":"unmarked","how":"files his report as on any other day."}]},"Milena":{"loves":["Clear","Warm"],"hates":["Cold","Snow","Gale"],"clock":"M","exams":0,"trials":0,"reason":"a southerner from Salaffos"},"Baelin":{"loves":["Clear"],"hates":[],"clock":"M","exams":0,"trials":0,"reason":"rest-day mornings at the Elder Oak; enormous patience","days":[{"on":"Remembrance Day","before":1,"lean":-1,"tone":"grave","how":"rereads the condolence letters he keeps, one by one, alone."},{"on":"Remembrance Day","fix":"Bad","tone":"grave","how":"the breach happened on his watch; the tea goes cold untouched."},{"on":"The Thinning","lean":-1,"tone":"watchful","how":"his greatest fear is a second breach; he checks on the seal more than he admits."},{"on":"birthday","tone":"forgetful","how":"forgets it entirely until someone reminds him; then he is delighted, and the tea goes cold."}]},"Layla":{"loves":["Rain"],"hates":[],"clock":"","exams":0,"trials":0,"reason":"archive days and tea","days":[{"on":"Remembrance Day","before":1,"tone":"preoccupied","how":"leads the field visit to the monuments and the plaque of the breach dead; the speech is still unfinished."},{"on":"Remembrance Day","fix":"Bad","tone":"stalled","how":"reaches the line of her speech she cannot get past, and stops; the Night Student story afterwards angers her."},{"on":"birthday","tone":"private","how":"the gloves stay on; her thanks are brief and real."}]},"Vallie":{"loves":["Storm","Snow","Gale"],"hates":[],"clock":"N","exams":0,"trials":1,"reason":"always happy to test her strength","days":[{"on":"Academy Founder Day","lean":-1,"tone":"watched","how":"a Myrdath alumna; on Founder Day the looks follow her, and she meets every one."}]},"Rei":{"loves":["Fog"],"hates":["Heatwave"],"clock":"N","exams":0,"trials":1,"reason":"the Rooftop at hours nobody is awake; zero drama when it matters","days":[{"on":"Remembrance Day","before":7,"lean":-1,"tone":"on edge","how":"Month 10 is coming: she smokes more."},{"on":"Remembrance Day","fix":"Bad","tone":"silent","how":"gives the speech she hates, lights no lantern of her own, and stays until the last one is gone."},{"on":"The Thinning","tone":"focused","how":"the seal is hers this week; zero drama, everywhere and nowhere."},{"on":"birthday","tone":"unmarked","how":"tells no one; a fuss gets a new cigarette and silence."}]},"Kuroo":{"loves":[],"hates":[],"clock":"N","exams":0,"trials":1,"reason":"Card Club evenings; the moment a student finally tries"},"Mimosa":{"loves":["Rain","Overcast"],"hates":["Clear","Hot"],"clock":"N","exams":0,"trials":-1,"reason":"small, dim, enclosed; a room full of eyes","days":[{"on":"Remembrance Day","fix":"Bad","tone":"hidden","how":"she spent the breach night in a Potion Hall cupboard; today her door stays shut and her answers come in writing."},{"on":"birthday","lean":1,"tone":"hopeful","how":"quietly hopes to be admired, and cannot accept a single compliment as earned."}]},"Tristan":{"loves":[],"hates":[],"clock":"","exams":0,"trials":0,"reason":"nothing rattles him"},"Althair":{"loves":["Storm","Gale"],"hates":[],"clock":"","exams":0,"trials":1,"reason":"relentlessly cheerful, never Bad from weather; a good game","days":[{"on":"birthday","lean":1,"tone":"cheerful","how":"turns up to his own birthday in his usual clothes and makes a game of it."}]},"Ezrel":{"loves":[],"hates":[],"clock":"","exams":0,"trials":0,"reason":"always Normal (apathetic)"},"Ottavio":{"loves":["Rain","Fog"],"hates":[],"clock":"M","exams":0,"trials":0,"reason":"the fishing dock at dawn"},"Caine":{"loves":["Overcast"],"hates":[],"clock":"","exams":0,"trials":0,"reason":"silence","days":[{"on":"birthday","tone":"unmarked","how":"silence, as on any other day."}]},"Bobby":{"loves":["Storm"],"hates":[],"clock":"","exams":0,"trials":0,"reason":"storms mean repair jobs","days":[{"on":"Secret Fools Day","lean":1,"tone":"in demand","how":"peak season: props, distractions and elaborate reveals; booked, smug and discreet."},{"on":"Star Night","lean":1,"tone":"in demand","how":"peak season: invitations, surprises and confessions; booked, smug and discreet."}]},"Hester":{"loves":["Storm","Fog","Clear night"],"hates":["Heatwave"],"clock":"N","exams":0,"trials":1,"reason":"night rounds and a good storm for a ghost story; busy ward days","days":[{"on":"Remembrance Day","fix":"Bad","tone":"brittle","how":"she was on the ward that night; any mention of it stops her mid-sentence and she turns to tea."}]},"Anselm":{"loves":["Clear","Mild"],"hates":["Storm"],"clock":"","exams":0,"trials":-1,"reason":"noon sun on a park bench; competition days mean students hurting each other"},"Magnus":{"loves":[],"hates":[],"clock":"N","exams":0,"trials":1,"reason":"a competition is a puzzle he gets to solve"},"Dorian":{"loves":["Clear"],"hates":["Rain"],"clock":"","exams":1,"trials":1,"reason":"exam and competition weeks are his best sales","days":[{"on":"Academy Bazaar","fix":"Good","tone":"in his element","how":"runs the biggest stall at the Bazaar, as he does every year."}]},"Cedric":{"loves":["Overcast","Rain"],"hates":[],"clock":"M","exams":0,"trials":0,"reason":"an early start and a quiet grey morning in the Gardens","days":[{"on":"Remembrance Day","fix":"Bad","tone":"silent","how":"says nothing at all; the rose on his desk is gone for the day."}]},"Anya":{"loves":["Fog","Overcast"],"hates":["Heatwave"],"clock":"","exams":0,"trials":0,"reason":"quiet, grey, still days; dusk by the Lake","days":[{"on":"birthday","tone":"still","how":"her birthday falls on Remembrance Day; she has never minded the quiet, and the smile does not change."}]},"Kotaro":{"loves":["Warm","Clear night"],"hates":["Cold","Freezing"],"clock":"N","exams":-1,"trials":1,"reason":"festival nights; mornings are the enemy","days":[{"on":"Independence Crowning Day","lean":-1,"tone":"rueful","how":"the day he once toasted the wrong person: he laughs it off a little too often, and the flask comes out early."},{"on":"Star Night","lean":1,"tone":"festive","how":"festival nights: \"Ahh, youth.\""},{"on":"Harvest Festival","lean":1,"tone":"festive","how":"festival nights: \"Ahh, youth.\""},{"on":"birthday","lean":1,"tone":"festive","how":"his birthday falls on the circus's opening night: \"Ahh, youth\", and the flask."}]},"Valentin":{"loves":["Clear"],"hates":["Rain"],"clock":"M","exams":1,"trials":1,"reason":"rankings day and an audience","days":[{"on":"Results & Dorm Ranking","lean":1,"tone":"in his element","how":"rankings day, and an audience."},{"on":"Results & Final Ranking","lean":1,"tone":"in his element","how":"rankings day, and an audience."}]},"Aurelian":{"loves":["Clear","Warm"],"hates":[],"clock":"M","exams":0,"trials":1,"reason":"a sunny pitch and a crowd; nothing visibly bothers him","days":[{"on":"Harvest Festival","tone":"bright","how":"the hero of the Harvest Hall fire at a harvest festival: more speeches, more handshakes, a perfect smile; the thirty-one names are on his mind."},{"on":"birthday","lean":1,"tone":"gracious","how":"a perfect speech of thanks; his parents keep the letter he writes them about it."}]},"William":{"loves":["Storm","Fog"],"hates":["Mild"],"clock":"N","exams":0,"trials":1,"reason":"dramatic weather means something is about to happen; filler weather; tournaments are the best arc"},"Bruno":{"loves":["Storm","Hot"],"hates":["Overcast"],"clock":"","exams":-1,"trials":1,"reason":"noise and heat; grey, still days bore him; tests are not fights"},"Bianca":{"loves":["Warm","Clear night"],"hates":["Rain"],"clock":"N","exams":-1,"trials":0,"reason":"parties outdoors and Star Night; rain ruins her hair and her plans","days":[{"on":"Star Night","lean":1,"tone":"festive","how":"an outdoor party under the stars is her idea of a perfect night."}]},"Rigel":{"loves":["Overcast","Cool"],"hates":["Heatwave"],"clock":"M","exams":0,"trials":0,"reason":"fish bite on grey mornings; heat folds his ears"},"Topaz":{"loves":["Clear"],"hates":["Fog"],"clock":"M","exams":1,"trials":1,"reason":"outdoor duels; can't see her rival in fog; every test is a chance to beat {{user}}'s old marks"},"Faye":{"loves":["Mild","Warm","Clear"],"hates":[],"clock":"","exams":0,"trials":0,"reason":"a warm afternoon on the hills is best, but anything is fine","days":[{"on":"The Thinning","tone":"unbothered","how":"the one person the lockdown does not rattle; she waves at the patrols."}]}};
const GIFT_PREFS = {"_note":"Owner-approved 2026-09-27. Exact catalog names and case-insensitive category regexes; contextual unknowns fall back to narrator Gift.","npcs":{"Irene":{"birthday":"M11 W3 Thu","text":{"loved":"Honey bun. Halvard Through the Centuries (leather-bound). Steel-nib fountain pen.","liked":"Halvard pennant. Walnut desk tidy. Tea.","disliked":"Romantic gifts (she is afraid of intimacy). Gaudy jewellery.","hated":"Contraband: prank goods, The Vigil, anything smuggled past curfew."},"items":{"loved":["Honey bun","Halvard Through the Centuries","Steel-nib fountain pen"],"liked":["Halvard pennant","Walnut desk tidy"],"disliked":[],"hated":["The Vigil"]},"patterns":{"liked":"\\btea\\b","disliked":"romantic|gaudy.*jewel","hated":"contraband|prank|smuggl|the vigil"}},"Caspian":{"birthday":"M10 W3 Sat","text":{"loved":"Carved Asmoday charm. Chamois lens cloth (he wears his own thin).","liked":"Festival lantern set. A Snug meal. Gossip, written down.","disliked":"Weapons. Anything that takes a side in a quarrel.","hated":"Anything of Dove issue (a Dove seal, a Dovecote form, manacles)."},"items":{"loved":["Carved Asmoday charm","Chamois lens cloth"],"liked":["Festival lantern set"],"disliked":[],"hated":[]},"patterns":{"liked":"snug.*meal|written.*gossip|gossip.*written","disliked":"weapon|takes? a side|quarrel","hated":"dove.*(?:issue|seal)|dovecote form|manacles"}},"Etnie":{"birthday":"M2 W2 Sat","text":{"loved":"Something {{user}} has worn (the scent). Black silk ribbons. Food, any, in quantity.","liked":"Everything else from {{user}}.","disliked":"—","hated":"A gift that means goodbye or distance (a farewell present, a thank-you card)."},"items":{"loved":["Black silk ribbons"],"liked":[],"disliked":[],"hated":["thank-you card"]},"patterns":{"loved":"(?:user|you|player|giver).*(?:worn|scent)|worn.*(?:user|you|player|giver)|food.*(?:quantity|large)|large.*food","hated":"farewell|goodbye|distance|thank.you card"}},"Royhan":{"birthday":"M5 W1 Sat","text":{"loved":"Rare reagent. Bag of Nightwell beans. Dragonchess problem book.","liked":"Glass stirring-rod set. Plain, filling food.","disliked":"Luxuries (Ardenne goods, private dining): it feels like charity.","hated":"Points or money given outright."},"items":{"loved":["Rare reagent","Bag of Nightwell beans","Dragonchess problem book"],"liked":["Glass stirring-rod set"],"disliked":[],"hated":[]},"patterns":{"liked":"plain.*food|filling.*food","disliked":"luxur|ardenne|private dining","hated":"(?:points|money|cash).*(?:outright|gift)|^(?:points|money|cash)$"}},"Sophia":{"birthday":"M4 W3 Tue","text":{"loved":"Nine Rivers: Field Tactics. Crossed Blades: Famous Duels. Rainglass.","liked":"Hearty meat dishes. Duelling gauntlets.","disliked":"Cute things, flowers, sweets. Fashion and jewellery.","hated":"Get-well hamper, or anything that \"handles\" her. Anything celebrating Gareth."},"items":{"loved":["Nine Rivers: Field Tactics","Crossed Blades: Famous Duels","Rainglass"],"liked":["Duelling gauntlets"],"disliked":[],"hated":["Get-well hamper"]},"patterns":{"liked":"meat|steak","disliked":"cute|plush|flower|sweet|bun|cake|chocolate|fashion|jewel","hated":"handles her|celebrat.*gareth|gareth.*(?:trophy|portrait)"}},"Gareth":{"birthday":"M5 W2 Wed","text":{"loved":"Sovereigns (imported strategy game). Dragonchess problem book.","liked":"Engraved trophy cup. Tea. Books.","disliked":"Consolation gifts; anything second-place (a silver rosette, a runner-up ribbon).","hated":"Anything that shows {{user}} has seen through him (a gift about his battle self)."},"items":{"loved":["Sovereigns","Dragonchess problem book"],"liked":["Engraved trophy cup"],"disliked":[],"hated":[]},"patterns":{"liked":"\\btea\\b|\\bbooks?\\b","disliked":"consolation|second.place|silver rosette|runner.up","hated":"battle self|seen through"}},"Ruby":{"birthday":"M3 W3 Mon","text":{"loved":"Gut guitar strings. Sweets. Songbook of old ballads.","liked":"Almost anything given kindly. Carrots and fresh greens.","disliked":"Weapons and fighting gear.","hated":"A gift that picks a side (a dorm-rivalry badge, a team favour)."},"items":{"loved":["Gut guitar strings","Songbook of old ballads"],"liked":["Carrots and fresh greens"],"disliked":[],"hated":[]},"patterns":{"loved":"sweet|bun|cake|candy|chocolate","liked":"given kindly","disliked":"weapon|fighting gear|duelling gauntlets|blade oil","hated":"dorm.rivalry badge|team favour|picks? a side"}},"Lenna":{"birthday":"M6 W1 Sun","text":{"loved":"The Rose in the Tower (romance novel). Plush animal. Goosedown pillow.","liked":"Good food. Premium beast jerky (for the Menagerie).","disliked":"Wind-up alarm clock. Weapons.","hated":"Anything from the Doves, or about her past."},"items":{"loved":["The Rose in the Tower","Plush animal","Goosedown pillow"],"liked":["Premium beast jerky"],"disliked":["Wind-up alarm clock"],"hated":[]},"patterns":{"liked":"good food|good meal","disliked":"weapon","hated":"\\bdoves?\\b|her past"}},"Saffi":{"birthday":"M6 W3 Thu","text":{"loved":"Running shoes. Smoked river fish.","liked":"After-training snacks. Something for Lenna.","disliked":"Textbooks. Etiquette manual.","hated":"—"},"items":{"loved":["Running shoes","Smoked river fish"],"liked":[],"disliked":["Etiquette manual"],"hated":[]},"patterns":{"liked":"after.training snack|for lenna","disliked":"textbook"}},"Kanae":{"birthday":"M1 W3 Thu","text":{"loved":"Seven Towers (deluxe edition). Palm crystal ball. Porcelain tea set.","liked":"Sweets arranged beautifully. Silver hand mirror. Star atlas.","disliked":"The Oracle Shell (she calls it nonsense in public). Plain, ugly things.","hated":"Anything from or recommended by Caralynn."},"items":{"loved":["Seven Towers","Palm crystal ball","Porcelain tea set"],"liked":["Silver hand mirror","Star atlas"],"disliked":["The Oracle Shell"],"hated":[]},"patterns":{"liked":"sweet.*(?:beautiful|arranged)|beautiful.*sweet","disliked":"plain|ugly","hated":"caralynn"}},"Idris":{"birthday":"M7 W1 Tue","text":{"loved":"Moonfern in a pot. Hearthstone hand-warmer.","liked":"A book to read in the Gardens. Pruning shears. Anything expensive (he can resell it).","disliked":"Cheap sentimental trinkets. Iced drinks.","hated":"Anything from the Doves."},"items":{"loved":["Moonfern in a pot","Hearthstone hand-warmer"],"liked":["Pruning shears"],"disliked":[],"hated":[]},"patterns":{"liked":"book.*gardens|expensive","disliked":"cheap.*trinket|iced.*drink","hated":"\\bdoves?\\b"}},"Tilly":{"birthday":"M10 W2 Thu","text":{"loved":"Lamps Out: Tales of Halvard. The Night Student: A True Account. Shuttered dark-lantern.","liked":"Canteen food. Lavender laundry soap. A fat notebook for \"Halvard Unexplained\".","disliked":"Anything \"for her safety\" (a helmet, a warding charm).","hated":"The Truth Behind Halvard's Ghosts."},"items":{"loved":["Lamps Out: Tales of Halvard","The Night Student: A True Account","Shuttered dark-lantern"],"liked":["Lavender laundry soap"],"disliked":[],"hated":["The Truth Behind Halvard's Ghosts"]},"patterns":{"liked":"canteen.*food|halvard unexplained","disliked":"for her safety|helmet|warding charm"}},"Dante":{"birthday":"M11 W2 Tue","text":{"loved":"Precision tool roll. Something for the younger students he looks after.","liked":"Tea. Shuttered dark-lantern. A Snug meal.","disliked":"Prank goods. Flashy luxuries.","hated":"Anything stolen or bought with a lie."},"items":{"loved":["Precision tool roll"],"liked":["Shuttered dark-lantern"],"disliked":[],"hated":[]},"patterns":{"loved":"for.*younger students","liked":"\\btea\\b|snug.*meal","disliked":"prank|flashy.*luxur","hated":"stolen|bought with a lie"}},"Florian":{"birthday":"M9 W4 Tue","text":{"loved":"Ardenne goods. Premium beast jerky (for Hades). Fine vintage.","liked":"Bergamot cologne. Silver hand mirror.","disliked":"Cheap or homemade things (he is polite about it).","hated":"Pity or consolation gifts. Anything that says third."},"items":{"loved":["Premium beast jerky","Fine vintage"],"liked":["Bergamot cologne","Silver hand mirror"],"disliked":[],"hated":[]},"patterns":{"loved":"ardenne","disliked":"cheap|homemade|handmade","hated":"pity|consolation|\\bthird\\b"}},"Aiden":{"birthday":"M9 W2 Mon","text":{"loved":"Merryhew's goods. Marked deck. Loaded bone dice.","liked":"Things he can sell on. Sweets. Games.","disliked":"Etiquette manual.","hated":"Anything paid for with a welched bet."},"items":{"loved":["Marked deck","Loaded bone dice"],"liked":[],"disliked":["Etiquette manual"],"hated":[]},"patterns":{"loved":"merryhew|prank goods","liked":"resell|sell on|sweet|bun|cake|candy|game","hated":"welched bet"}},"Caralynn":{"birthday":"M8 W3 Mon","text":{"loved":"Ardenne goods. Bouquet of stage roses. A portrait of her.","liked":"Silver hand mirror. Jewellery. Songbook of old ballads.","disliked":"Plain, practical gifts. Anything that compares her to someone.","hated":"Platform boots, or anything about height."},"items":{"loved":["Bouquet of stage roses"],"liked":["Silver hand mirror","Songbook of old ballads"],"disliked":[],"hated":["Platform boots"]},"patterns":{"loved":"ardenne|portrait of (?:her|caralynn)","liked":"jewel","disliked":"plain|practical|compares her","hated":"height"}},"Zara":{"birthday":"M11 W1 Thu","text":{"loved":"Bolt of Sky silk. Embroidery thread set. A library book she mentioned.","liked":"Talisman paper stack. Sketchbook and charcoal. Tea by a fire.","disliked":"Clothes for her to wear. Anything that draws eyes to her.","hated":"Anything from the Doves (they burned her talismans)."},"items":{"loved":["Bolt of Sky silk","Embroidery thread set"],"liked":["Talisman paper stack","Sketchbook and charcoal"],"disliked":[],"hated":[]},"patterns":{"loved":"library book.*mentioned","liked":"tea.*fire","disliked":"clothes.*wear|draws eyes|spotlight","hated":"\\bdoves?\\b"}},"Percival":{"birthday":"M6 W2 Mon","text":{"loved":"A \"wounded relic\": a cracked shell, a broken buckle, an odd rock. Songs of the Oathbound.","liked":"Knight's pennon. Food for sharing. Anything grand.","disliked":"Almost nothing; he makes a story out of everything. Junk counts as loved.","hated":"A cruel prank item."},"items":{"loved":["Songs of the Oathbound"],"liked":["Knight's pennon"],"disliked":[],"hated":[]},"patterns":{"loved":"wounded relic|cracked shell|broken|odd rock|junk|\\brocks?\\b|weeds","liked":"food.*shar|grand","hated":"cruel.*prank"}},"Trixie":{"birthday":"M8 W2 Tue","text":{"loved":"Sweets. Prism charm. Juggling set.","liked":"Surprises. Costume pieces. Premium beast jerky (for the Menagerie).","disliked":"Quiet things (a meditation book, a sleep mask).","hated":"—"},"items":{"loved":["Prism charm","Juggling set"],"liked":["Premium beast jerky"],"disliked":[],"hated":[]},"patterns":{"loved":"sweet|bun|cake|candy|chocolate","liked":"surprise|costume","disliked":"meditation book|sleep mask"}},"Vera":{"birthday":"M3 W2 Wed","text":{"loved":"Rare reagent. Firetooth (tin). Mystery clockwork (sold as seen).","liked":"Precision tool roll. Sweet tea. Common reagents.","disliked":"The Vigil. Decorations with no purpose.","hated":"Something built badly on purpose."},"items":{"loved":["Rare reagent","Firetooth (tin)","Mystery clockwork (sold as seen)"],"liked":["Precision tool roll"],"disliked":["The Vigil"],"hated":[]},"patterns":{"liked":"sweet tea|common reagent","disliked":"decoration.*no purpose","hated":"built badly on purpose"}},"Castor":{"birthday":"M1 W2 Thu","text":{"loved":"Blank leather journal. Steel-nib fountain pen. Pocket thermos (for early Gardens).","liked":"Books. Plain things that do not stand out.","disliked":"Loud or flashy things. A gift in front of people.","hated":"Wishing coin, or anything that asks what he wants."},"items":{"loved":["Blank leather journal","Steel-nib fountain pen","Pocket thermos"],"liked":[],"disliked":[],"hated":["Wishing coin"]},"patterns":{"liked":"\\bbooks?\\b|plain","disliked":"loud|flashy|in front of people","hated":"asks what he wants"}},"Alyssa":{"birthday":"M10 W3 Mon","text":{"loved":"Pocket memory notebook. Letter paper set.","liked":"Sketchbook and charcoal (Drawing Club). Quiet-morning things. A note that reintroduces the giver.","disliked":"An invitation to a crowded party.","hated":"A keepsake \"from last time\" she is meant to remember."},"items":{"loved":["Pocket memory notebook","Letter paper set"],"liked":["Sketchbook and charcoal"],"disliked":[],"hated":[]},"patterns":{"liked":"quiet.morning|reintroduc","disliked":"crowded party","hated":"from last time|meant to remember"}},"Linus":{"birthday":"M6 W4 Mon","text":{"loved":"Old competition programmes. Crossed Blades: Famous Duels.","liked":"Notebooks. A story about Vallie's eyepatch. Tickets to a match.","disliked":"A gift that claims someone is strongest without proof.","hated":"The Noble Houses, by Precedence."},"items":{"loved":["Old competition programmes","Crossed Blades: Famous Duels"],"liked":[],"disliked":[],"hated":["The Noble Houses, by Precedence"]},"patterns":{"liked":"notebook|vallie.*eyepatch|ticket.*match","disliked":"strongest without proof"}},"Maple":{"birthday":"M10 W4 Tue","text":{"loved":"Bag of red apples. Sweet bamboo tea (tin). Everlamp, miniature.","liked":"Seed packets. Something for Sobek. A letter from home.","disliked":"Premium beast jerky and other animal treats (the animals flee her).","hated":"Beast muzzle, or anything calling Sobek a monster."},"items":{"loved":["Bag of red apples","Sweet bamboo tea (tin)","Everlamp, miniature"],"liked":["Seed packets"],"disliked":["Premium beast jerky"],"hated":["Beast muzzle"]},"patterns":{"liked":"for sobek|letter from home","disliked":"animal treat","hated":"sobek.*monster"}},"Nerys":{"birthday":"M4 W1 Thu","text":{"loved":"Whatever this week's hobby needs. Pigeon feed. Free food.","liked":"Carving knife and limewood block. Foraged things. Merryhew's goods.","disliked":"Last week's hobby supplies.","hated":"Etiquette manual."},"items":{"loved":["Pigeon feed"],"liked":["Carving knife and limewood block"],"disliked":[],"hated":["Etiquette manual"]},"patterns":{"loved":"this week.*hobby|free food","liked":"foraged|merryhew","disliked":"last week.*hobby"}},"Hadrian":{"birthday":"M8 W1 Wed","text":{"loved":"Brass golem joint set. Vigour tonic. Warding amulet.","liked":"Lined winter cloak. Anything expensive.","disliked":"A dare or a duel challenge.","hated":"Duelling gauntlets (an invitation to get hurt)."},"items":{"loved":["Brass golem joint set","Vigour tonic","Warding amulet"],"liked":["Lined winter cloak"],"disliked":[],"hated":["Duelling gauntlets"]},"patterns":{"liked":"expensive","disliked":"\\bdare\\b|duel challenge"}},"Wren":{"birthday":"M5 W3 Thu","text":{"loved":"Sweet bun. Letter paper set. Hand-Speech for Beginners (someone learning for her).","liked":"Fishing tackle box. Tuning fork (she feels it hum).","disliked":"Music box (a sound she cannot share).","hated":"Picture book for small children."},"items":{"loved":["Sweet bun","Letter paper set","Hand-Speech for Beginners"],"liked":["Fishing tackle box","Tuning fork"],"disliked":["Music box"],"hated":["Picture book for small children"]},"patterns":{}},"Tsubaki":{"birthday":"M2 W4 Sun","text":{"loved":"Whetstone and blade oil. Pocket campus map (she is always lost). Star atlas.","liked":"Plain food in large amounts. Duelling gauntlets.","disliked":"Decorative gifts she does not understand. Romantic gifts (she takes them literally).","hated":"—"},"items":{"loved":["Whetstone and blade oil","Pocket campus map","Star atlas"],"liked":["Duelling gauntlets"],"disliked":[],"hated":[]},"patterns":{"liked":"plain food.*large|large.*plain food","disliked":"decorative|romantic"}},"Gavlan":{"birthday":"M3 W1 Tue","text":{"loved":"Clan firewine. Blank leather journal.","liked":"History books. Tea.","disliked":"Weapons as presents. Anything romanticising war.","hated":"Independence War commemorative medal."},"items":{"loved":["Clan firewine","Blank leather journal"],"liked":[],"disliked":[],"hated":["Independence War commemorative medal"]},"patterns":{"liked":"history book|\\btea\\b","disliked":"weapon|romantici[sz].*war"}},"Yvette":{"birthday":"M3 W4 Tue","text":{"loved":"Fallen Stars: Notes on Mana Resonance. A fine enchanted piece to study.","liked":"Ordinary coffee. Precision tool roll.","disliked":"The Vigil. Romantic gifts from students.","hated":"Halvard pennant or any Halvard keepsake."},"items":{"loved":["Fallen Stars: Notes on Mana Resonance"],"liked":["Precision tool roll"],"disliked":["The Vigil"],"hated":["Halvard pennant"]},"patterns":{"loved":"fine enchanted","liked":"ordinary coffee","disliked":"romantic.*student","hated":"halvard.*keepsake"}},"Krieg":{"birthday":"M4 W2 Thu","text":{"loved":"Royal crest paperweight.","liked":"Fine vintage. Good manners.","disliked":"Sentimental gifts.","hated":"Orchard cider. Anything enchanted."},"items":{"loved":["Royal crest paperweight"],"liked":["Fine vintage"],"disliked":[],"hated":["Orchard cider"]},"patterns":{"liked":"good manners","disliked":"sentimental","hated":"enchant"}},"Milena":{"birthday":"M7 W2 Fri","text":{"loved":"Salaffian flatbread. Armour polish kit. Travel Dragonchess set.","liked":"Things students made themselves. Warm drinks.","disliked":"—","hated":"Anything tied to forbidden magic (she confiscates it, then asks gently where it came from)."},"items":{"loved":["Salaffian flatbread","Armour polish kit","Travel Dragonchess set"],"liked":[],"disliked":[],"hated":[]},"patterns":{"liked":"handmade|made.*(?:themselves|hand)|warm drink","hated":"forbidden magic"}},"Baelin":{"birthday":"M4 W4 Sun","text":{"loved":"Silvertip tea. Anecdotes of the Old Kingdom. A debt repaid.","liked":"Oak sapling in a pot.","disliked":"Extravagant gifts (waste).","hated":"—"},"items":{"loved":["Silvertip tea","Anecdotes of the Old Kingdom"],"liked":["Oak sapling in a pot"],"disliked":[],"hated":[]},"patterns":{"loved":"debt repaid|repaid debt","disliked":"extravagant"}},"Layla":{"birthday":"M9 W3 Wed","text":{"loved":"Founding of the Dovecote (old edition). Old Archive documents.","liked":"Tea. A good argument, written out. Kid-leather gloves.","disliked":"What Everyone Knows About the Founding.","hated":"The Night Student: A True Account."},"items":{"loved":["Founding of the Dovecote"],"liked":["Kid-leather gloves"],"disliked":["What Everyone Knows About the Founding"],"hated":["The Night Student: A True Account"]},"patterns":{"loved":"old archive document","liked":"\\btea\\b|written.*argument|argument.*written"}},"Vallie":{"birthday":"M3 W3 Sat","text":{"loved":"Blackroot cigars. Stonebrew ale (jug).","liked":"Clan firewine. A good story, written down. Meat.","disliked":"Leather planner.","hated":"Anything stolen."},"items":{"loved":["Blackroot cigars","Stonebrew ale (jug)"],"liked":["Clan firewine"],"disliked":["Leather planner"],"hated":[]},"patterns":{"liked":"story.*written|written.*story|meat","hated":"stolen"}},"Rei":{"birthday":"M7 W4 Mon","text":{"loved":"Blackroot cigars. Whetstone and blade oil.","liked":"Quiet, simple things.","disliked":"Ceremonial gifts, anything that expects a speech.","hated":"Anything about the breach night."},"items":{"loved":["Blackroot cigars","Whetstone and blade oil"],"liked":[],"disliked":[],"hated":[]},"patterns":{"liked":"quiet|simple","disliked":"ceremonial|expects a speech","hated":"breach night"}},"Kuroo":{"birthday":"M1 W4 Tue","text":{"loved":"Gilt-edged playing cards. Ballroom shoes.","liked":"Anything that needles Krieg. Loud silk waistcoat (buttons he can find).","disliked":"Last-minute, half-hearted gifts.","hated":"—"},"items":{"loved":["Gilt-edged playing cards","Ballroom shoes"],"liked":["Loud silk waistcoat"],"disliked":[],"hated":[]},"patterns":{"liked":"needles krieg","disliked":"last.minute|half.hearted"}},"Mimosa":{"birthday":"M2 W1 Mon","text":{"loved":"Hooded night lamp. A written note of praise.","liked":"Rare reagent. Anything about Royhan's work.","disliked":"A gift in front of a crowd.","hated":"Brass handbell."},"items":{"loved":["Hooded night lamp"],"liked":["Rare reagent"],"disliked":[],"hated":["Brass handbell"]},"patterns":{"loved":"written.*praise|note of praise","liked":"royhan.*work","disliked":"in front of a crowd"}},"Tristan":{"birthday":"M10 W1 Fri","text":{"loved":"Fine vintage. Commentaries of Saint Orel (antique).","liked":"Philosophy. Tea.","disliked":"A rushed gift.","hated":"The Final Word on Everything."},"items":{"loved":["Fine vintage","Commentaries of Saint Orel"],"liked":[],"disliked":[],"hated":["The Final Word on Everything"]},"patterns":{"liked":"philosophy|\\btea\\b","disliked":"rushed gift"}},"Althair":{"birthday":"M8 W4 Mon","text":{"loved":"Loud silk waistcoat. Sovereigns.","liked":"Leather planner (really). Anything from someone who dislikes him.","disliked":"—","hated":"Formal dress coat."},"items":{"loved":["Loud silk waistcoat","Sovereigns"],"liked":["Leather planner"],"disliked":[],"hated":["Formal dress coat"]},"patterns":{"liked":"someone who dislikes him"}},"Ezrel":{"birthday":"","text":{"loved":"Brass golem joint set.","liked":"Nothing, pleasantly. Anything he does not dislike is neutral.","disliked":"Anything that wastes time.","hated":"—"},"items":{"loved":["Brass golem joint set"],"liked":[],"disliked":[],"hated":[]},"patterns":{"disliked":"wastes? time"}},"Ottavio":{"birthday":"M8 W1 Sun","text":{"loved":"Fishing tackle box. Salaffian spice box.","liked":"Engraved hip flask. Something for his dorm.","disliked":"Thank-you card.","hated":"—"},"items":{"loved":["Fishing tackle box","Salaffian spice box"],"liked":["Engraved hip flask"],"disliked":["Thank-you card"],"hated":[]},"patterns":{"liked":"for his dorm|for sky dorm"}},"Caine":{"birthday":"M2 W3 Mon","text":{"loved":"Nothing he will admit. Silver-polishing kit (a real smirk, once).","liked":"Silence. Order: Walnut desk tidy, a good clock.","disliked":"Anything noble or crested. Enchanted trinkets.","hated":"—"},"items":{"loved":["Silver-polishing kit"],"liked":["Walnut desk tidy"],"disliked":[],"hated":[]},"patterns":{"liked":"silence|clock","disliked":"noble|crest|enchanted"}},"Bobby":{"birthday":"M9 W1 Thu","text":{"loved":"Vanishing-coin illusion kit. Campus gossip, written down.","liked":"Precision tool roll. Something broken to fix. Gilt-edged playing cards.","disliked":"Cruel prank goods.","hated":"A spoiled surprise."},"items":{"loved":["Vanishing-coin illusion kit"],"liked":["Precision tool roll","Gilt-edged playing cards"],"disliked":[],"hated":[]},"patterns":{"loved":"gossip.*written|written.*gossip","liked":"broken.*fix","disliked":"cruel.*prank","hated":"spoiled surprise"}},"Hester":{"birthday":"M7 W3 Fri","text":{"loved":"Lamps Out: Tales of Halvard. Hooded night lamp.","liked":"A new ghost story, told to her. Strong black tea. Dried foxglove or belladonna.","disliked":"Cheerful get-well cards.","hated":"The Truth Behind Halvard's Ghosts. The Night Student: A True Account."},"items":{"loved":["Lamps Out: Tales of Halvard","Hooded night lamp"],"liked":[],"disliked":[],"hated":["The Truth Behind Halvard's Ghosts","The Night Student: A True Account"]},"patterns":{"liked":"ghost stor|black tea|foxglove|belladonna","disliked":"get-well"}},"Anselm":{"birthday":"M6 W2 Sun","text":{"loved":"Silvertip tea. Travel Dragonchess set.","liked":"A question he cannot answer. Philosophy books. Moss in a pot.","disliked":"Weapons as presents.","hated":"The Final Word on Everything."},"items":{"loved":["Silvertip tea","Travel Dragonchess set"],"liked":[],"disliked":[],"hated":["The Final Word on Everything"]},"patterns":{"liked":"question|philosoph|\\bmoss\\b","disliked":"weapon"}},"Magnus":{"birthday":"M2 W2 Tue","text":{"loved":"Dragonchess problem book. Sovereigns.","liked":"Steel-nib fountain pen. Notebooks. Information nobody else has.","disliked":"Anything left to chance (dice, a lottery ticket).","hated":"Wishing coin, or any lucky charm."},"items":{"loved":["Dragonchess problem book","Sovereigns"],"liked":["Steel-nib fountain pen"],"disliked":[],"hated":["Wishing coin"]},"patterns":{"liked":"notebook|journal|information|secret","disliked":"\\bdice\\b|lottery","hated":"lucky charm|good.luck"}},"Dorian":{"birthday":"M9 W2 Fri","text":{"loved":"Merryhew's goods. Precision tool roll.","liked":"Anything expensive and useful. A good haggle.","disliked":"Anything cheap and flimsy.","hated":"A copy of one of his own designs. Something he sold {{user}}, given back."},"items":{"loved":["Precision tool roll"],"liked":[],"disliked":[],"hated":[]},"patterns":{"loved":"merryhew","liked":"expensive|haggl","disliked":"cheap|flimsy","hated":"cop(y|ied).*design|knock.?off"}},"Cedric":{"birthday":"M12 W4 Sun","text":{"loved":"Old Archive documents. Seed packets.","liked":"Bread still warm. Gardening tools.","disliked":"Anything meant to be kept forever.","hated":"A monument, or any \"timeless\" keepsake."},"items":{"loved":["Seed packets"],"liked":[],"disliked":[],"hated":[]},"patterns":{"loved":"archive document|old document","liked":"bread|garden","disliked":"forever|eternal","hated":"monument|timeless"}},"Anya":{"birthday":"M10 W1 Tue","text":{"loved":"Black silk ribbons. Porcelain tea set.","liked":"A first-hand account of a near-death experience. Mourning customs from another kingdom. Tea.","disliked":"Loud or gaudy things.","hated":"Anything sold as an elixir of long life."},"items":{"loved":["Black silk ribbons","Porcelain tea set"],"liked":[],"disliked":[],"hated":[]},"patterns":{"liked":"near.death|mourning|\\btea\\b","disliked":"gaudy|loud","hated":"elixir|long life|immortal"}},"Kotaro":{"birthday":"M8 W2 Thu","text":{"loved":"Fine vintage. Stonebrew ale (jug). Clan firewine.","liked":"Any drink. Festival food. A song.","disliked":"Anything that needs looking after.","hated":"Anything that tells him to stop drinking (a temperance pamphlet, a hangover cure \"for his own good\")."},"items":{"loved":["Fine vintage","Stonebrew ale (jug)","Clan firewine"],"liked":[],"disliked":[],"hated":[]},"patterns":{"liked":"ale|wine|sake|drink|festival|song","disliked":"plant|pet","hated":"temperance|hangover"}},"Valentin":{"birthday":"M9 W3 Sat","text":{"loved":"Ardenne goods. Rare reagent. A portrait of him.","liked":"Anything that shows off his work. Praise in public.","disliked":"Anything cheap.","hated":"Anything given to everyone (a participation prize, a class-wide keepsake)."},"items":{"loved":["Rare reagent"],"liked":[],"disliked":[],"hated":[]},"patterns":{"loved":"ardenne|portrait","liked":"praise","disliked":"cheap","hated":"participation|everyone"}},"Aurelian":{"birthday":"M7 W1 Sat","text":{"loved":"Halvard pennant, Knight's pennon, Engraved trophy cup.","liked":"Spiced apple turnover, Running shoes.","disliked":"Ember pouch, Festival lantern set, Hearthstone hand-warmer.","hated":""},"items":{"loved":["Halvard pennant","Knight's pennon","Engraved trophy cup"],"liked":["Spiced apple turnover","Running shoes"],"disliked":["Ember pouch","Festival lantern set","Hearthstone hand-warmer"],"hated":[]},"patterns":{"disliked":"ember|lantern|candle|fire"}},"William":{"birthday":"M3 W1 Sat","text":{"loved":"The Ninth Dawn (latest volume), Crossed Blades: Famous Duels, Songs of the Oathbound.","liked":"Prism charm, Wishing coin, Shuttered dark-lantern.","disliked":"The Truth Behind Halvard's Ghosts.","hated":""},"items":{"loved":["The Ninth Dawn (latest volume)","Crossed Blades: Famous Duels","Songs of the Oathbound"],"liked":["Prism charm","Wishing coin","Shuttered dark-lantern"],"disliked":["The Truth Behind Halvard's Ghosts"],"hated":[]},"patterns":{"liked":"shiny|prism|coin|crystal","disliked":"debunk"}},"Bruno":{"birthday":"M4 W1 Sat","text":{"loved":"Duelling gauntlets, Vigour tonic, Restaurant meal.","liked":"Smoked river fish, Firetooth (tin).","disliked":"Books and delicate things.","hated":""},"items":{"loved":["Duelling gauntlets","Vigour tonic","Restaurant meal"],"liked":["Smoked river fish","Firetooth (tin)"],"disliked":[],"hated":[]},"patterns":{"disliked":"book|journal|notebook|manual|porcelain"}},"Bianca":{"birthday":"M4 W1 Sat","text":{"loved":"Silver hand mirror, Bergamot cologne, Black silk ribbons.","liked":"Salaffian flatbread, Sweet course.","disliked":"Etiquette manual, Satchel.","hated":""},"items":{"loved":["Silver hand mirror","Bergamot cologne","Black silk ribbons"],"liked":["Salaffian flatbread","Sweet course"],"disliked":["Etiquette manual","Satchel"],"hated":[]},"patterns":{"liked":"sweet|cake|cookie|bun","disliked":"etiquette"}},"Rigel":{"birthday":"M2 W4 Wed","text":{"loved":"Fishing tackle box, Porcelain tea set, Silvertip tea.","liked":"Blank leather journal, Steel-nib fountain pen.","disliked":"Sunfizz, Wishing coin.","hated":""},"items":{"loved":["Fishing tackle box","Porcelain tea set","Silvertip tea"],"liked":["Blank leather journal","Steel-nib fountain pen"],"disliked":["Sunfizz","Wishing coin"],"hated":[]},"patterns":{"disliked":"sunfizz|wishing coin|lucky roll"}},"Topaz":{"birthday":"M5 W2 Fri","text":{"loved":"Pocket memory notebook, Crossed Blades: Famous Duels, Engraved trophy cup.","liked":"Star Cookie, Honey bun.","disliked":"Picture book for small children, Plush animal.","hated":""},"items":{"loved":["Pocket memory notebook","Crossed Blades: Famous Duels","Engraved trophy cup"],"liked":["Star Cookie","Honey bun"],"disliked":["Picture book for small children","Plush animal"],"hated":[]},"patterns":{"liked":"sweet|cookie|bun|cake","disliked":"child|plush"}},"Faye":{"birthday":"M6 W1 Wed","text":{"loved":"Sweet bamboo tea (tin), Pocket thermos, Goosedown pillow.","liked":"Roasted chestnuts, Cut flowers.","disliked":"Wind-up alarm clock, Leather planner.","hated":""},"items":{"loved":["Sweet bamboo tea (tin)","Pocket thermos","Goosedown pillow"],"liked":["Roasted chestnuts","Cut flowers"],"disliked":["Wind-up alarm clock","Leather planner"],"hated":[]},"patterns":{"liked":"tea","disliked":"clock|planner|schedule"}}},"universal":{"hated":"forbidden(?:.art| magic| text)|unregistered pact token","liked":"sweet|bun|cake|cookie|chocolate|candy|baked|good meal|snug.*meal|handmade|made by hand|drawing|carving|long letter","disliked":"merryhew|prank|junk|rocks?|broken|weeds|tobacco|cigar|raw reagent|common reagent|wine|vintage|cider|\\bale\\b|alcohol|spirits","neutral":"stationery|notebook|pen nib|letter paper|common drink|sunfizz|umbrella|scarf|plain food|cut flowers"},"catalog":{"Sunfizz":"The Mall — store","Firetooth (tin)":"Commissary","Notebook":"Commissary","Pen nibs and ink":"Commissary","Printed class textbook":"Commissary","Satchel":"Commissary","Spare uniform set":"Commissary","Common reagent bundle":"Commissary sweets and baked goods raw reagent","Basic practice focus":"Commissary enchanted","Rare reagent":"Commissary raw reagent","Special order":"Commissary","Umbrella":"Commissary","Oilskin rain cloak":"Commissary","Bakery roll":"The Mall — bakery sweets and baked goods","Star Cookie":"The Mall — bakery sweets and baked goods","Café drink and pastry":"The Mall — cafés and tea houses sweets and baked goods","Restaurant meal":"The Mall — restaurants food good meal","Private dining (second floor)":"The Mall — private dining","Quality focus":"The Mall — store enchanted","Tailoring alteration":"Tailor's Row","Barber":"The Mall — services","Laundry service (per load)":"The Mall — services","Practice studio or music room (per hour)":"The Mall — studios","Game hall (per hour)":"The Mall — game halls","Wool scarf and mittens":"The Mall — store","Lined winter cloak":"The Mall — store","Straw sun hat":"The Mall — store","Hot spiced tea":"The Mall — cafés and tea houses","Iced fruit cooler":"The Mall — cafés and tea houses","The Vigil":"Nightwell","House coffee":"Nightwell","Honey cream coffee":"Nightwell","Spiced milk tea":"Nightwell","Iced coffee":"Nightwell","Hot chocolate with cream":"Nightwell sweets and baked goods","Late-night pastry":"Nightwell sweets and baked goods","Bag of Nightwell beans":"Nightwell","The Oracle Shell":"Merryhew's prank goods","Itching charm":"Merryhew's prank goods","Voice-changing sweets (bag)":"Merryhew's prank goods sweets and baked goods","Illusion vermin (box)":"Merryhew's prank goods","Screaming box":"Merryhew's prank goods","Colour-change hair sweet":"Merryhew's prank goods sweets and baked goods","Confetti ambush card":"Merryhew's prank goods","Secret Fools Day kit":"Merryhew's prank goods","Private booth (per hour)":"The Snug","Set meal":"The Snug food good meal","Pot of tea for the booth":"The Snug","Stew and fresh bread":"The Snug food good meal","Sweet course":"The Snug sweets and baked goods","Evening booth (18:00 to curfew)":"The Snug","Ardenne case":"Ardenne (special order)","Ardenne focus":"Ardenne (special order)","Ardenne measuring set":"Ardenne (special order)","Ardenne tuning instrument":"Ardenne (special order)","The Rose in the Tower":"Quillfeather's book","Seven Towers (deluxe edition)":"Quillfeather's book","Nine Rivers: Field Tactics":"Quillfeather's book","Crossed Blades: Famous Duels":"Quillfeather's book","Songs of the Oathbound":"Quillfeather's book","Songbook of old ballads":"Quillfeather's book","Lamps Out: Tales of Halvard":"Quillfeather's book","The Night Student: A True Account":"Quillfeather's book","The Truth Behind Halvard's Ghosts":"Quillfeather's book","Halvard Through the Centuries":"Quillfeather's book","Anecdotes of the Old Kingdom":"Quillfeather's book","Founding of the Dovecote (old edition)":"Quillfeather's book","What Everyone Knows About the Founding":"Quillfeather's book","Commentaries of Saint Orel (antique)":"Quillfeather's book","The Final Word on Everything":"Quillfeather's book","Fallen Stars: Notes on Mana Resonance":"Quillfeather's book","The Noble Houses, by Precedence":"Quillfeather's book","Etiquette manual":"Quillfeather's book","Dragonchess problem book":"Quillfeather's book","Star atlas":"Quillfeather's book","Hand-Speech for Beginners":"Quillfeather's book","Picture book for small children":"Quillfeather's book","Old competition programmes":"Quillfeather's book","Blank leather journal":"Quillfeather's","Pocket memory notebook":"Quillfeather's","Leather planner":"Quillfeather's","Plush animal":"Pennywhistle Curios","Goosedown pillow":"Pennywhistle Curios","Silver hand mirror":"Pennywhistle Curios","Palm crystal ball":"Pennywhistle Curios","Porcelain tea set":"Pennywhistle Curios","Music box":"Pennywhistle Curios","Prism charm":"Pennywhistle Curios","Black silk ribbons":"Pennywhistle Curios","Travel Dragonchess set":"Pennywhistle Curios","Sovereigns":"Pennywhistle Curios","Gilt-edged playing cards":"Pennywhistle Curios","Vanishing-coin illusion kit":"Pennywhistle Curios","Juggling set":"Pennywhistle Curios","Rainglass":"Pennywhistle Curios enchanted","Everlamp, miniature":"Pennywhistle Curios enchanted","Hearthstone hand-warmer":"Pennywhistle Curios enchanted","Hooded night lamp":"Pennywhistle Curios","Warding amulet":"Pennywhistle Curios enchanted","Wishing coin":"Pennywhistle Curios","Thank-you card":"Pennywhistle Curios","Get-well hamper":"Pennywhistle Curios","Engraved trophy cup":"Pennywhistle Curios","Knight's pennon":"Pennywhistle Curios","Halvard pennant":"Pennywhistle Curios","Royal crest paperweight":"Pennywhistle Curios","Independence War commemorative medal":"Pennywhistle Curios","Carved Asmoday charm":"Pennywhistle Curios","Festival lantern set":"Pennywhistle Curios","Brass handbell":"Pennywhistle Curios","Wind-up alarm clock":"Pennywhistle Curios","Silver-polishing kit":"Pennywhistle Curios","Walnut desk tidy":"Pennywhistle Curios","Loaded bone dice":"Pennywhistle Curios","Marked deck":"Pennywhistle Curios","Table wine":"Barrow & Vine","Fine vintage":"Barrow & Vine","Orchard cider":"Barrow & Vine","Stonebrew ale (jug)":"Barrow & Vine","Clan firewine":"Barrow & Vine","Blackroot cigars":"Barrow & Vine","Engraved hip flask":"Barrow & Vine","Bouquet of stage roses":"Greenwick's","Cut flowers":"Greenwick's","Moonfern in a pot":"Greenwick's","Oak sapling in a pot":"Greenwick's","Seed packets":"Greenwick's","Bag of red apples":"Greenwick's food","Carrots and fresh greens":"Greenwick's food","Pigeon feed":"Greenwick's","Pruning shears":"Greenwick's","Precision tool roll":"The Tinker's Bench sweets and baked goods","Mystery clockwork (sold as seen)":"The Tinker's Bench","Brass golem joint set":"The Tinker's Bench","Glass stirring-rod set":"The Tinker's Bench","Whetstone and blade oil":"The Tinker's Bench","Armour polish kit":"The Tinker's Bench","Duelling gauntlets":"The Tinker's Bench","Fishing tackle box":"The Tinker's Bench food","Gut guitar strings":"The Tinker's Bench","Tuning fork":"The Tinker's Bench","Steel-nib fountain pen":"The Tinker's Bench","Letter paper set":"The Tinker's Bench","Sketchbook and charcoal":"The Tinker's Bench","Carving knife and limewood block":"The Tinker's Bench","Bolt of Sky silk":"The Tinker's Bench","Embroidery thread set":"The Tinker's Bench","Talisman paper stack":"The Tinker's Bench","Chamois lens cloth":"The Tinker's Bench","Pocket thermos":"The Tinker's Bench","Shuttered dark-lantern":"The Tinker's Bench","Running shoes":"The Tinker's Bench","Premium beast jerky":"The Tinker's Bench","Beast muzzle":"The Tinker's Bench","Vigour tonic":"The Tinker's Bench","Salaffian flatbread":"The Salaffian Oven food","Salaffian spice box":"The Salaffian Oven","Loud silk waistcoat":"Tailor's Row","Formal dress coat":"Tailor's Row","Platform boots":"Tailor's Row","Ballroom shoes":"Tailor's Row","Bergamot cologne":"Tailor's Row","Kid-leather gloves":"Tailor's Row","Honey bun":"Commissary sweets and baked goods","Pocket campus map":"Commissary","Smoked river fish":"Commissary food","Lavender laundry soap":"Commissary","Sweet bun":"The Mall — bakery sweets and baked goods","Sweet bamboo tea (tin)":"The Mall — cafés and tea houses sweets and baked goods","Silvertip tea":"The Mall — cafés and tea houses","Rain-ward charm":"The Tinker's Bench","Quick-dry powder":"The Tinker's Bench","Cooling charm":"The Tinker's Bench","Ember pouch":"The Tinker's Bench","Knitting wool and needles":"The Tinker's Bench","Paint box":"The Tinker's Bench","Elderflower cold syrup":"Greenwick's","Blossom honey cake":"The Mall — bakery sweets and baked goods","Spiced apple turnover":"The Mall — bakery sweets and baked goods","Roasted chestnuts":"The Mall — cafés and tea houses food","Salted lemon water":"Commissary","Baking and cooking ingredients":"Commissary","Bar stock and coal":"Commissary","Linen summer shirt":"Tailor's Row","Fleece-lined boots":"Tailor's Row","Mulled apple cider":"The Snug","The Ninth Dawn (latest volume)":"Quillfeather's book"}};
const WIND_CASTING = {"groups":{"fed":[1,0.75],"scattered":[1.5,2],"unaffected":[1,1],"fights":[1.25,1.5]},"subtypes":{"Wind":"fed","Storm":"fed","Mist":"scattered","Smoke":"scattered","Ash":"scattered","Sand":"scattered","Steam":"scattered","Sound":"scattered","Reinforcement":"unaffected","Mending":"unaffected","Phasing":"unaffected","Resizing":"unaffected"},"default":"fights"};
const NPC_DORMS = {"Irene":"Light","Caspian":"Viridian","Etnie":"Viridian","Royhan":"Sky","Lenna":"Fire","Saffi":"Viridian","Kanae":"Light","Idris":"Sky","Aiden":"Light","Caralynn":"Fire","Zara":"Sky","Gavlan":null,"Yvette":null,"Krieg":null,"Milena":null,"Baelin":null,"Layla":null,"Vallie":null,"Percival":"Viridian","Sophia":"Fire","Rei":null,"Kuroo":null,"Mimosa":null,"Gareth":"Fire","Lucius":null,"Trixie":"Fire","Vera":"Viridian","Tristan":null,"Althair":null,"Dante":"Light","Castor":"Viridian","Ruby":"Sky","Florian":"Sky","Elion":null,"Bellatrix":null,"Kira":null,"Mirelle":null,"Theodore":null,"Ines":null,"Bram":null,"Dex":null,"Cassius":null,"Morgana":null,"Pip":null,"Alyssa":"Sky","Tilly":"Fire","Ezrel":null,"Ottavio":null,"Caine":null,"Bobby":null,"Linus":"Viridian","Maple":"Sky","Nerys":"Fire","Hadrian":"Light","Wren":"Fire","Tsubaki":"Light","Hester":null,"Anselm":null,"Magnus":null,"Dorian":null,"Cedric":null,"Anya":null,"Kotaro":null,"Valentin":null,"Aurelian":"Fire","William":"Sky","Bruno":"Fire","Bianca":"Light","Rigel":"Sky","Topaz":"Light","Faye":"Viridian"};
const moodCanon = k => NPC_ALIAS[String(k).toLowerCase()] || k;
const GRX = new Map(), grx = src => GRX.get(src) || GRX.set(src, new RegExp(src, 'i')).get(src);   // 1.16.1 (audit A6): compiled once
const giftNorm = s => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
const npcBirthday = (id, W) => ((GIFT_PREFS.npcs[id] || {}).birthday || '') === `M${W.Month} W${W.Week} ${W.Day}`;
function giftTier(id, item, fallback, note = '') {
  const p = GIFT_PREFS.npcs[id], s = giftNorm(item), order = ['hated', 'loved', 'disliked', 'liked'];
  let tier = '';
  const exact = name => { const n = giftNorm(name); const at = s.indexOf(n); return at >= 0 && !/[a-z0-9]/.test(s[at - 1] || '') && !/[a-z0-9]/.test(s[at + n.length] || ''); };
  const description = s + ' ' + giftNorm(note) + ' ' + Object.entries(GIFT_PREFS.catalog || {}).filter(([name]) => exact(name)).map(([,tags]) => tags).join(' ');
  if (s && p) tier = order.find(k => (p.items[k] || []).some(exact) || p.patterns[k] && grx(p.patterns[k]).test(description)) || '';
  if (s && !tier) tier = [...order, 'neutral'].find(k => GIFT_PREFS.universal[k] && grx(GIFT_PREFS.universal[k]).test(description)) || '';
  if (!tier) tier = [...order, 'neutral'].includes(giftNorm(fallback)) ? giftNorm(fallback) : 'neutral';
  if (id === 'Ezrel' && tier === 'liked') tier = 'neutral';
  // Etnie's own hated gifts are the only exception to her minimum; universal dislikes do not overrule it.
  if (id === 'Etnie' && !((p.items.hated || []).some(exact) || grx(p.patterns.hated).test(s)) && !['liked', 'loved'].includes(tier)) tier = 'liked';
  return tier;
}
function moodOf(id, S, wx, day) {
  const p = NPC_MOODS[id], W = S.World, hour = Number(W.Time.split(':')[0]), block = hour < 6 || hour >= 18 ? 2 : hour < 12 ? 0 : 1;
  if (!p || id === 'Ezrel') return { mood: 'Normal', score: 0, reasons: [], days: [] };
  let score = 0; const reasons = [], add = (v, why) => { if (v) { score += v; reasons.push(why); } };
  const match = k => {
    if (!wx) return false;
    if (k === 'Clear night') return wx.sky === 'Clear' && block === 2;
    if (k === 'Clear by day ≥15 °C') return wx.sky === 'Clear' && block !== 2 && wx.temp >= 15;
    return [wx.sky, tempLabel(wx.temp), wx.wind, wx.rare, wx.snow ? 'Snow' : ''].some(x => String(x || '').toLowerCase() === k.toLowerCase());
  };
  for (const k of p.loves) if (match(k)) add(1, k.toLowerCase());
  for (const k of p.hates) if (match(k)) add(-1, k.toLowerCase());
  if (p.clock === 'M') { if (block === 0) add(1, 'morning person'); if (hour >= 22 || hour < 6) add(-1, 'late for a morning person'); }
  if (p.clock === 'N') { if (block === 2) add(1, 'night owl'); if (hour < 10) add(-1, 'early for a night owl'); }
  const dayEvents = EVENTS.filter(e => e.m === W.Month && e.w === W.Week && e.d.includes(W.Day));
  const exams = dayEvents.some(e => e.mood === 'exam');
  const trials = dayEvents.some(e => e.mood === 'trial');
  if (exams && STUDENTS[id] && !(S.Campus_State.Graduated || []).includes(id)) add(p.exams, 'Exams');
  const cand = ((S.Campus_State.Council || {}).Candidates || {})[String(W.Year)] || {};
  if (trials || W.Month === 10 && W.Week === 3 && DAYS.indexOf(W.Day) < 6 && Object.values(cand).includes(id)) add(p.trials, 'Trials');
  const status = Object.entries(S.Campus_State.NPC_status || {}).filter(([k]) => moodCanon(k) === id).map(([,v]) => v).join(' ');
  if (/sick|ill\b|injur|wound|griev|grief|bereav|mourning|hurt|head cold/i.test(status)) add(-1, 'unwell or grieving');
  const roll = rand01(S.$eng.seed, day, id, 'mood'); add(roll < 0.1 ? -1 : roll >= 0.9 ? 1 : 0, 'how the day feels');
  const days = specialDays(id, S), fix = (days.find(d => d.fix) || {}).fix || '';
  for (const d of days) if (!d.fix) score += d.lean;
  // a fixed day overrides the weather, so its reasons would only contradict it
  return { mood: fix || (score >= 1 ? 'Good' : score <= -1 ? 'Bad' : 'Normal'), score, reasons: fix ? [] : reasons, days };
}
// 1.72.0 (owner-approved planning/DRAFT_hari_istimewa_npc.md): a character's special days. data/npc_moods.json `days`: `on` a
// birthday (data/gift_prefs.json), a calendar event by the start of its title, or a date ("M8 W3", "M8 W3 Mon"); `before: N` = the
// N days before it; `fix` sets the mood (the first one wins), `lean` moves the score; `tone` is their own word for the day. A
// birthday without a row of its own is lean +1, "glad". Halvard's calendar days do not reach someone away. Then the personal dates
// with {{user}}, a year or more later: a surviving Imprint's date (its Feel and Weight say how), the day they met ($met, from Rank 5
// and below Tension 40) and the day the bond reached Rank 8 ($b8). Those are `personal`: the narrator's and the character's only.
const DAY_ON_RX = /^\[?(?:Y(\d+) )?M(\d{1,2}) W([1-4])(?: (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?/;
const dayOn = (on, W, id) => { if (on === 'birthday') return npcBirthday(id, W);
  const m = DAY_ON_RX.exec(on); if (m) return +m[2] === W.Month && +m[3] === W.Week && (!m[4] || m[4] === W.Day);
  return eventsOn(W).some(e => e.t.startsWith(on)); };
const feelOf = f => (['warm', 'sore', 'bittersweet'].includes(String(f || '').trim().toLowerCase()) ? String(f).trim().toLowerCase() : 'bittersweet');
const remembers = id => `${id} remembers what day it is; whether to say so is up to ${id}, in character.`;
function specialDays(id, S) {
  const W = S.World, out = [], rows = [...((NPC_MOODS[id] || {}).days || [])];
  if ((GIFT_PREFS.npcs[id] || {}).birthday && !rows.some(d => d.on === 'birthday')) rows.push({ on: 'birthday', lean: 1, tone: 'glad', how: 'warmer to anyone who remembers it.' });
  const away = AWAY_RX.test(npcStatusIn(S, id)), noon = toAbs({ ...W, Time: '12:00' });
  for (const d of rows) {
    if (away && d.on !== 'birthday') continue;
    const hit = d.before ? _.range(1, d.before + 1).some(k => dayOn(d.on, fromAbs(noon + k * DAY_MIN), id)) : dayOn(d.on, W, id);
    if (hit) out.push({ label: d.on === 'birthday' ? 'Birthday' : d.before ? `Before ${d.on}` : d.on, fix: d.fix || '', lean: d.lean || 0, tone: d.tone, how: d.how, bd: d.on === 'birthday' });
  }
  const b = (S.Bonds || {})[id];
  if (!b) return out;
  const years = s => { const m = DAY_ON_RX.exec(String(s || '')), y = m && +(m[1] || W.Year);
    return m && m[4] && +m[2] === W.Month && +m[3] === W.Week && m[4] === W.Day && y < W.Year ? W.Year - y : 0; };
  const ago = n => (n > 1 ? `${n} years` : 'A year');
  for (const x of b.Imprints || []) {
    const n = years(x.When); if (!n) continue;
    const feel = feelOf(x.Feel), sign = { warm: 1, sore: -1 }[feel] || 0;
    out.push({ label: `${ago(n)} today: ${x.From || x.Belief}`, fix: sign && num(x.Weight, 5) >= 8 ? (sign > 0 ? 'Good' : 'Bad') : '', lean: sign, tone: feel, how: remembers(id), personal: true });
  }
  const met = num(b.Rank, 0) >= 5 && num(b.Tension, 0) < 40 && years(b.$met);
  if (met) out.push({ label: `${ago(met)} since ${id} met {{user}}`, fix: '', lean: 1, tone: 'fond', how: remembers(id), personal: true });
  const b8 = b.$branch && years(b.$b8), rival = b.$branch === 'rival';
  if (b8) out.push({ label: `${ago(b8)} since the bond became ${rival ? 'a sworn rivalry' : b.$branch === 'romance' ? 'a romance' : 'a best friendship'}`,
    fix: '', lean: rival ? -1 : 1, tone: rival ? 'bitter' : 'fond', how: remembers(id), personal: true });
  return out;
}
function windMultiplier(subtype, custom, wind) {
  if (!wind) return 1;
  const k = Object.keys(custom || {}).find(k => k.toLowerCase() === String(subtype || '').toLowerCase());
  // An old custom subtype without wind deliberately uses the default, even if its name matches the catalogue.
  const cat = k ? custom[k].wind || WIND_CASTING.default : WIND_CASTING.subtypes[subtype] || WIND_CASTING.default;
  return (WIND_CASTING.groups[cat] || WIND_CASTING.groups[WIND_CASTING.default])[wind === 'gale' ? 1 : 0];
}
const blocksWind = (active, techniques) => Object.entries(active || {}).some(([name, e]) => {
  const t = techniques[e.Technique] || {};
  return /barrier|shield|ward/i.test(name + ' ' + e.Technique + ' ' + t.Subtype) && /wind|gust/i.test([e.Note, e.Effect, t.Effect, t.Notes].join(' '));
});
function birthdayParty(S) {
  if (S.Player.Profile.Birthday !== `M${S.World.Month} W${S.World.Week} ${S.World.Day}`) return null;
  const absent = id => (ARRIVES[id] || 1) > S.World.Year || npcAwayIn(S, id);   // 1.16.1 (audit B4): the engine's one rule
  const available = Object.entries(S.Bonds).filter(([id,b]) => b.Tension < BR.birthday.tension_below && !absent(id));
  const hosts = available.filter(([,b]) => b.Rank >= BR.birthday.host_rank).sort((a,b) => b[1].Rank - a[1].Rank || b[1].Trust - a[1].Trust || a[0].localeCompare(b[0]));
  if (!hosts.length || awayIn(S)) return null;   // 1.42.0 (audit 1.2): no party at Halvard while {{user}} is away
  const host = hosts[0][0], guests = available.filter(([id,b]) => STUDENTS[id] && b.Rank >= BR.birthday.guest_rank).map(([id]) => id).sort();
  const all = [...new Set([host, ...guests])], dorm = S.Player.Profile.Dorm;
  const where = dorm !== 'Unsorted' && all.every(id => NPC_DORMS[id] === dorm) ? `${dorm} Dormitory Common Room` : 'The Snug (reserved evening booth)';
  const evs = eventsOn(S.World);
  // 1.11.1 (bug hunt): no party is arranged while the students have gone home (Mid-Year Break, Month 12); the story may still hold one
  if (evs.some(e => e.lockdown || e.home)) return null;
  const endHour = evs.some(e => e.home || e.nocurfew && S.World.Day === e.d[0]) ? 24 : evs.map(e => curfewHour(e, S.World.Day)).find(Boolean) || 20;
  return { host, guests, where, from: '18:00', endHour, until: pad(endHour) + ':00' };
}
// Count overlap arithmetically so even long time skips stay bounded, and short updates accumulate complete hours.
const nightMinutes = abs => { const d = Math.floor(abs / 1440), t = abs - d * 1440; return d * 360 + Math.min(360, Math.max(0,t)); };
function updateSleep(S, B, from, to, TU, log) {
  const E = S.$eng, prior = B && B.$eng || E, mode = S.$ui.wxfx;
  E.late = Math.max(0, num(prior.late));
  E.sleep = { awake: 0, run: 0, paid: false, vigilUntil: -1, crash: 0, lastNight: -1, ...(prior.sleep || {}) };
  const r = E.sleep, resting = S.Player.Vitals.Resting === 'sleep', elapsed = Math.max(0,to-from), oldUntil = r.vigilUntil;
  if (mode === 'off') { S.$ui.sleep = null; r.run = 0; r.paid = false; return; }
  const consumed = (S.Consumables || []).filter(x => /^the vigil$/i.test(String(x).trim())).length;
  if (consumed && mode === 'full') { r.vigilUntil = Math.max(to, r.vigilUntil) + 48 * 60; log.push('The Vigil: 48 hours without sleep debt; two full nights will be owed afterwards.'); }
  const expired = r.vigilUntil >= 0 && to >= r.vigilUntil;
  if (expired) { r.crash = 2; r.vigilUntil = -1; r.run = 0; r.paid = false; log.push('The Vigil has worn off: stamina capped at 60% until two full nights of sleep.'); }
  if (elapsed > 0 && resting) {
    r.run += expired ? Math.max(0, to - Math.max(from, oldUntil)) : elapsed;
    if (r.run >= TU.sleep_full * 60 && !r.paid) {
      E.late = 0; r.awake = 0; r.paid = true;
      const night = Math.floor((to - 6 * 60) / 1440);
      if (r.crash && night !== r.lastNight && nightMinutes(to) - nightMinutes(to - r.run) > 0) { r.crash--; r.lastNight = night; }
    }
  } else if (elapsed > 0) {
    r.run = 0; r.paid = false;
    r.awake += Math.max(0, nightMinutes(to) - nightMinutes(Math.min(to, Math.max(from, oldUntil))));
    E.late += Math.floor(r.awake / 60); r.awake %= 60;
  }
  const loss = r.vigilUntil > to ? 0 : r.crash ? TU.sleep_cap : Math.min(TU.sleep_cap, E.late * TU.sleep_hour);
  S.$ui.sleep = { late: E.late, loss, vigil: r.vigilUntil > to, nights: r.crash, flavor: mode === 'flavor' };
  if (mode === 'full' && loss > 0) S.Player.Vitals.Stamina = Math.min(S.Player.Vitals.Stamina, S.Player.Vitals.Stamina_max * (1-loss));
}

const ENGINE_VER = "1.77.0";   // the card version (src/card/card.json, set by tools/gen_engine.py)
const verLt = (a, b) => { const p = v => String(v || '0').split('.').map(x => parseInt(x, 10) || 0), x = p(a), y = p(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0); return false; };   // 1.63.0

// 1.20.0 (audit A5): the engine runs as a list of steps, in the order of the sections they came from. Each step reads what it needs
// from the shared context c (the states, the reply's text and the values earlier steps computed) and adds what later steps use.
function runEngine(S, B, text, seedHint, userText) {   // 1.12.0: userText = the player's message this reply answers (section 8l)
  userText = String(userText || '').replace(SCENE_MARK_RX, '');   // 1.66.0: the scene marker is for VectFox, never the story
  if (!S || !S.World) return;
  const c = { S, B, text, seedHint, userText };
  for (const step of ENGINE_STEPS) step(c);
}

function stepSetup(c) {
  const { S, B } = c;
  fillShape(S, SHAPE);
  const log = [], jnl = [], notes = [];                       // jnl: journal lines the engine adds itself (5.1); notes: its bookkeeping (1.57.0)
  S.$eng = S.$eng || { abs: -1, daily: {} };
  S.$ui = S.$ui || { unlocks: [], discovered: [], toasts: [] };
  for (const k of ['unlocks', 'discovered', 'toasts', 'names', 'archive', 'secrets', 'off', 'rumours_old', 'lore', 'jnotes']) if (!Array.isArray(S.$ui[k])) S.$ui[k] = [];
  if (!_.isPlainObject(S.$ui.parked)) S.$ui.parked = {};
  for (const X of [S.$ui, S.$eng]) if (!_.isPlainObject(X.area)) X.area = {};   // 1.46.0 (audit 3.1): one record per outside area
  if (!['off', 'flavor', 'full'].includes(S.$ui.wxfx)) S.$ui.wxfx = 'full';
  const hasB = !!(B && B.World);
  const fromVer = hasB ? (B.$eng || {}).ver : S.$eng.ver;      // the engine version that wrote the state before this reply
  S.$eng.ver = ENGINE_VER;
  if (hasB) S.$ui.toasts = [];                                  // toasts = what happened in THIS update only
  Object.assign(c, { log, jnl, notes, hasB, fromVer });
}

// 1.20.0 (audit A5): save migrations, run on the first update after the card version changes (and on a new chat's first run).
// Each keeps its own flag or test, so one already done is skipped. The engine reads its own fields from the state before the
// reply (B), so a migration changes a copy of B as well as S: the reply is not read as having made the change.
function stepMigrate(c) {
  const { S, hasB, log } = c;
  if (c.fromVer === ENGINE_VER) return;
  const B = c.B = hasB ? _.cloneDeep(c.B) : c.B, both = hasB ? [S, B] : [S];
  // 1.46.0 (audit batch 4): the outside areas keep their state under one record each, $ui.area.<forest|avalon|airship|sunreach>
  // (was $ui.forest, capital, airship, sunreach) and $eng.area.<forest|avalon|sunreach> (was $eng.exp, cap, sr)
  for (const X of both) {
    const U = X.$ui || (X.$ui = {}), E = X.$eng || (X.$eng = {});
    if (!_.isPlainObject(U.area)) U.area = {};
    if (!_.isPlainObject(E.area)) E.area = {};
    for (const [o, n] of AREA_OLD_UI) { if (U[o] != null && U.area[n] == null) U.area[n] = U[o]; delete U[o]; }
    for (const [o, n] of AREA_OLD_ENG) { if (E[o] != null && E.area[n] == null) E.area[n] = E[o]; delete E[o]; }
  }
  // 1.57.0 (U3): the engine's bookkeeping leaves the narrator's Journal window for the player's notes ($ui.jnotes), in date order
  for (const X of both) {
    const U = X.$ui || (X.$ui = {}), moved = [];
    for (const k of ['Journal', 'archive']) {
      const L = k === 'Journal' ? X.Journal : U.archive;
      if (!Array.isArray(L)) continue;
      const keep = L.filter(l => !(ENGINE_NOTE.test(String(l)) && moved.push(l)));
      if (k === 'Journal') X.Journal = keep; else U.archive = keep;
    }
    if (moved.length) U.jnotes = [...new Set([...(Array.isArray(U.jnotes) ? U.jnotes : []), ...moved])].slice(-JOURNAL_ARCHIVE);
  }
  // 1.60.0: Location_changes became Lore_changes (any fact of the lore, not only places); a change from before keeps its words
  for (const X of both) {
    const CS = X.Campus_State;
    if (!_.isPlainObject(CS)) continue;
    const L = _.isPlainObject(CS.Lore_changes) ? CS.Lore_changes : (CS.Lore_changes = {});
    for (const [k, v] of Object.entries(CS.Location_changes || {})) if (String(v).trim() && !keyIn(L, k)) L[k] = { Now: String(v).trim(), Cause: 'recorded before 1.60.0', Since: '', Replace: false, $uid: loreUidOf(k) };
    CS.Location_changes = {};
  }
  // 1.63.0 (memory audit M5): what an older save already moved out of view waits for a fold (nothing older is lost any more)
  if (verLt(c.fromVer, '1.63.0')) for (const X of both) {
    const E = X.$eng || (X.$eng = {}), inView = new Set([...(X.Journal || []), ...(X._Kept_from_earlier || [])]);
    if (!(Array.isArray(E.jq) && E.jq.length)) E.jq = ((X.$ui || {}).archive || []).filter(l => !inView.has(l));
    for (const bd of Object.values(X.Bonds || {})) if (bd) {
      if (!(num(bd.$Knows_q, 0) > 0)) bd.$Knows_q = Math.min(FOLD.waitMax, (bd.$Knows_old || []).length);
      if (!(num(bd.$Known_q, 0) > 0)) bd.$Known_q = Math.min(FOLD.waitMax, (bd.$Known_old || []).length);
    }
  }
  // 1.62.0 (memory audit M3): the line a keeper of the true magic got is pinned
  for (const X of both) for (const bd of Object.values(X.Bonds || {})) for (const f of ['Knows', '$Knows_old']) if (Array.isArray((bd || {})[f]))
    bd[f] = bd[f].map(l => (/learned .*true magic/i.test(String(l)) && !PINNED.test(String(l)) ? String(l).replace(/^((?:\[[^\]]*\]\s*)?)/, '$1! ') : l));
  // 1.26.0: old chats keep their history. A small class allowance recognises weeks already played;
  // the one-time Studies offer lets the player choose a different starting history.
  if (S.$eng.profv !== 1 && hasB) {
    const weeks = Math.min(14, Math.floor(Math.max(0, num((B.$eng || {}).abs, 0)) / (7 * DAY_MIN)));
    const xp = Math.min(29, weeks * 2);
    for (const X of both) {
      X.Player._Proficiency = Object.fromEntries(PROF.map(k => [k, xp >= 10 ? 1 : 0]));
      X.$eng.prof = { xp: Object.fromEntries(PROF.map(k => [k, xp])), wk: { w: -1 }, days: {}, picked: false };
      X.$eng.profv = 1;
    }
    S.$ui.prof_offer = true;
    log.push('Proficiency was estimated from weeks already played; Studies offers a one-time choice of starting ranks.');
  }
  // 1.30.0: per-subject attendance starts with this release; the term's classes so far count as attended, recorded skips stay
  for (const X of both) {
    const ST = (X.$eng || {}).study;
    if (!_.isPlainObject(ST) || _.isPlainObject(ST.held) || !X.World) continue;
    const W = X.World, prev = [11, 9, 5, 3].find(m => m < W.Month || (m === W.Month && W.Week > 1));
    const start = toAbs({ Year: W.Year, Month: prev || 1, Week: prev ? 2 : 1, Day: 'Mon', Time: '00:00' });
    const weeks = Math.max(0, Math.floor((toAbs(W) - start) / (7 * DAY_MIN))), perWeek = {};
    for (const row of Object.values(CLASS.tt || {})) for (const cell of row || []) if (cell && cell[3] === 'class') perWeek[cell[0]] = num(perWeek[cell[0]], 0) + 1;
    ST.held = Object.fromEntries(SUBJECTS.map(s => [s, Math.max(num((ST.skip || {})[s], 0), weeks * num(perWeek[s], 0))]));
  }
  // 1.31.0 (owner-approved planning/DRAFT_spirit_path.md): "Meditation Rooms / Spirit House" is the Meditation Rooms now
  for (const X of both) {
    const W = X.World || {}, U = X.$ui || {};
    if (/^meditation rooms \/ spirit house\b/i.test(String(W.Location || ''))) W.Location = String(W.Location).replace(/^meditation rooms \/ spirit house/i, 'Meditation Rooms');
    if (Array.isArray(U.discovered)) U.discovered = _.uniq(U.discovered.map(n => n === 'Meditation Rooms / Spirit House' ? 'Meditation Rooms' : n));
  }
  // 1.33.0 (owner-approved planning/DRAFT_classes_and_teachers.md): the Combat subject is Practical Magic (marks, exam lines,
  // attendance counts, the stored results and a pending remedial keep their values under the new name)
  const toPM = o => { if (_.isPlainObject(o) && 'Combat' in o) { if (!('Practical Magic' in o)) o['Practical Magic'] = o.Combat; delete o.Combat; } };
  for (const X of both) {
    const Ac = (X.Player || {}).Academics || {}, ST = (X.$eng || {}).study, Cm = X.Commitments;
    toPM(Ac.Grades);
    for (const k of Object.keys(Ac.Exams || {})) Ac.Exams[k] = String(Ac.Exams[k]).replace(/\bCombat\b/g, 'Practical Magic');
    if (_.isPlainObject(ST)) {
      for (const k of ['skip', 'cap', 'shift', 'stand', 'held']) toPM(ST[k]);
      for (const k of ['res', 'marks']) for (const m of Object.values(ST[k] || {})) toPM(m);
      for (const k of Object.keys(ST.rem || {})) if (k === 'Remedial Combat') { ST.rem['Remedial Practical Magic'] = ST.rem[k]; delete ST.rem[k]; }
    }
    if (_.isPlainObject(Cm) && Cm['Remedial Combat']) {
      Cm['Remedial Practical Magic'] = { ...Cm['Remedial Combat'], Desc: String(Cm['Remedial Combat'].Desc || '').replace(/\bCombat\b/g, 'Practical Magic') };
      delete Cm['Remedial Combat'];
    }
  }
  for (const X of both) {
    const P = X._Perks;
    if (!_.isPlainObject(P)) continue;
    const oldDanteGift = P['Council safety card'];
    if (oldDanteGift) {
      if (!P["Groundskeeper's Lodge key"]) P["Groundskeeper's Lodge key"] = { ...oldDanteGift, Effect: REW.npcs.Dante.gift.text };
      delete P['Council safety card'];
    }
    if (P['Florian (Rank 10)']) P['Florian (Rank 10)'].Effect = REW.npcs.Florian.r10.text;
    if (X.Player.Profile.Club === 'Student Council') { X.Player.Profile.Council = true; X.Player.Profile.Club = ''; }
  }
  // 1.3.0: a pre-1.3.0 save's Public / Dorm meters become Academy / Student XP once
  if (S.$eng.repv !== 1) {
    const RP = S.Player.Profile.Reputation || (S.Player.Profile.Reputation = {});
    const RPB = hasB ? (((B.Player || {}).Profile || {}).Reputation) : null;
    const old = (RPB && (RPB.Public != null || RPB.Dorm != null)) ? RPB : RP, xp0 = (RPB && RPB.$xp) || RP.$xp || {};
    if (REP.reps.every(r => !_.clamp(num(xp0[r], 0), -REP.thresholds[4], REP.thresholds[4])) && (num(old.Public, 0) || num(old.Dorm, 0))) {
      const xp = { ...xp0, Academy: _.clamp(Math.round(num(old.Public, 0) * 1.25), -125, 125), Student: _.clamp(Math.round(num(old.Dorm, 0) * 1.25), -125, 125) };
      RP.$xp = xp;
      if (RPB) RPB.$xp = { ...xp };
      log.push(`Reputation now has three parts (Academy, Student, Doves); the old academy and dorm standing became Academy ${repLevel(xp.Academy)} and Student ${repLevel(xp.Student)}.`);
    }
    S.$eng.repv = 1;
  }
  // 1.2.2: a pre-XP bond's Progress (0-10) becomes XP toward its next rank; 1.3.8: milestones of the ranks already reached count as paid
  const PACE = paceOf(S);
  for (const X of both) {
    for (const b of Object.values(X.Bonds || {})) {
      if (!b || typeof b !== 'object') continue;
      if (S.$eng.bondv !== 2) { const p = num(b.Progress, 0); if (p > 0 && num(b.$xp, 0) === 0) b.$xp = Math.round(Math.min(p, 10) / 10 * needXP(b.Rank, PACE)); }
      if (S.$eng.tenv !== 1) b.$ms = [...new Set([...(b.$ms || []), ...Object.keys(REP.bond_milestone_xp || {}).map(Number).filter(r => r <= b.Rank)])];
    }
  }
  // 1.72.0: a bond from before has no $met (the day they met): its oldest dated line stands in (Recent moments, Defining moments,
  // Knows, Imprints, Known facts), else none; a Rank 8 bond's $b8 is not known and stays empty
  if (verLt(c.fromVer, '1.72.0')) for (const X of both) for (const b of Object.values(X.Bonds || {})) if (b && typeof b === 'object' && !b.$met) {
    const W = X.World || S.World, ds = [...(b.$Recent || []).map(r => r && r.w), ...(b.$Defining || []).map(r => r && r.w), ...(b.Knows || []), ...(b.$Knows_old || []),
      ...(b.Imprints || []).map(x => x && x.When), ...(b.Known_facts || []), ...(b.$Known_old || [])];
    let lo = null;
    for (const s of ds) { const m = DAY_ON_RX.exec(String(s || '')); if (!m || !m[4]) continue;
      const d = { Year: +(m[1] || W.Year || 1), Month: +m[2], Week: +m[3], Day: m[4] }; if (!lo || toAbs(d) < toAbs(lo)) lo = d; }
    b.$met = lo ? ydate(lo) : '';
  }
  // 1.76.0 (owner-approved planning/DRAFT_sebaran_club.md): the Walking Club became the Camping Club
  if (verLt(c.fromVer, '1.76.0')) for (const X of both) { const P = (X.Player || {}).Profile || {}; if (P.Club && canonClub(P.Club) === 'Camping Club') P.Club = 'Camping Club'; }
  // 1.75.0 (owner-approved planning/DRAFT_club_sendiri.md): a club not on record that {{user}} already belongs to was founded in the
  // story: it becomes the founded club (its room and advisor not on record yet); the founding reputation is not paid again
  if (verLt(c.fromVer, '1.75.0')) for (const X of both) {
    const P = (X.Player || {}).Profile || {}, club = canonClub(P.Club), CS = X.Campus_State || (X.Campus_State = {});
    const FC = CS.Founded_club = _.isPlainObject(CS.Founded_club) ? CS.Founded_club : {};
    if (!club || String(FC.Name || '').trim() || Object.keys(CLASS.clubs || {}).includes(club)) continue;
    Object.assign(FC, { Name: club, Status: 'founded', Since: '', Members: Array.isArray(FC.Members) ? FC.Members : [] });
    P.Club = club; S.$eng.founded = true;
    if (X === S) log.push(`The ${club} is now on record as the club {{user}} founded; its room (Founded_club.Venue) and advisor are not on record yet.`);
  }
  S.$eng.bondv = 2;
  S.$eng.tenv = 1;
  S.$ui.bev = {};                                               // obsolete event hints of older saves
}

// ---- 0. read-only fields: only a Student Builder patch (auth = 'builder') may change them ----
function stepGuards(c) {
  const { S, B, text, log, hasB } = c;
  const byBuilder = S.$eng.auth === 'builder';
  if (hasB && !byBuilder) {
    const keep = [['Magic', '_Techniques'], ['Magic', '_Affinity'], ['Hidden', '_True_magic'], ['Player', '_Proficiency'], ['$ui', 'built'], ['$ui', 'file'], ['_Perks']];
    for (const path of keep) {
      const was = _.get(B, path);
      if (was !== undefined && !_.isEqual(_.get(S, path), was)) { _.set(S, path, _.cloneDeep(was)); log.push(`${path.join('.')} is read-only; the change was reverted.`); }
    }
  }
  if (byBuilder) S.$ui.toasts.push('Student file updated');
  S.$eng.auth = '';
  // 1.11.1: a player-tool message (the UI writes /$eng/tool = 1 with every Builder or Settings patch and marks its text)
  const toolEdit = hasB && (num(S.$eng.tool, 0) === 1 || /\(player tool\)/.test(String(text || '')));
  S.$eng.tool = 0;
  // 1.16.1 (audit B1): the club in the club list's words, before attendance (5d) reads it
  {
    const P = S.Player.Profile, raw = String(P.Club || ''), c = canonClub(raw, S);
    if (c === 'Student Council') {
      P.Council = true;
      P.Club = hasB && B.Player.Profile.Club !== 'Student Council' ? B.Player.Profile.Club : '';
    } else P.Club = c;
    const was = hasB ? canonClub(((B.Player || {}).Profile || {}).Club, B) : c, F = foundedClub(S);
    if (c && c !== was && !Object.keys(CLASS.clubs || {}).includes(c) && !isFounded(F, c)) {
      // 1.75.0 (owner-approved planning/DRAFT_club_sendiri.md): a club not on record is one {{user}} founds; they join it once founded
      if (!F || F.name === c) {
        const CS = S.Campus_State, FC = CS.Founded_club = _.isPlainObject(CS.Founded_club) ? CS.Founded_club : {};
        if (!F) FC.Name = c;
        P.Club = hasB ? was : '';
        log.push(`The ${c} is not a club yet: {{user}} is founding it (Campus_State.Founded_club) and joins it once the engine marks it founded.`);
      } else log.push(`Club "${c}" is not a club on record (${Object.keys(CLASS.clubs || {}).join(', ')}, or the ${F.name} {{user}} founds); Saturday club time is only counted for one of them.`);
    }
  }
  let healedMax = false;
  // 1.2.0 (owner playtest: a reload came back with the student's magic empty): the Builder keeps its own record in $ui.file.
  // A built student whose Builder-only fields are all empty gets them back from that record. The Builder always writes both
  // together, so an empty set next to a full record is a lost write, never a choice.
  {
    const F = S.$ui.file, M = S.Magic, A = M._Affinity || {};
    if (S.$ui.built && F && typeof F === 'object' && _.isEmpty(M._Techniques) && !(A.Types || []).length
      && (!_.isEmpty(F.Techniques) || ((F.Affinity || {}).Types || []).length)) {
      M._Techniques = _.cloneDeep(F.Techniques || {}); M._Affinity = _.cloneDeep(F.Affinity || {});
      if (F.Mana_max > 0) { S.Player.Vitals.Mana_max = F.Mana_max; healedMax = true; }
      if (F.True_magic && !S.Hidden._True_magic) S.Hidden._True_magic = F.True_magic;
      log.push('The student file was restored from the Builder record (magic had come back empty).');
    }
  }

  // 1.3.0 training: Mana_max and Stamina_max grow only through training (engine §6b) or the Student Builder. Any other change is
  // reverted; a Builder change (or the self-heal above) moves the starting value the training limits are measured from.
  {
    const V0 = S.Player.Vitals, TS = S.Player.$Training || (S.Player.$Training = {}), TB = hasB ? ((B.Player || {}).$Training || {}) : {};
    for (const [k, t] of Object.entries(TRN.tracks || {})) {
      const cur = num(V0[t.field], 1), prev = hasB ? num(((B.Player || {}).Vitals || {})[t.field], cur) : cur, o = TB[k] || TS[k];
      let base = o && o.base > 0 ? o.base : cur;
      const gain = o ? num(o.gain, 0) : 0;
      if (hasB && cur !== prev) {
        if (byBuilder || healedMax) base = Math.max(1, r2(cur - gain));
        else { V0[t.field] = prev; log.push(`${t.label} (${t.field}) grows only through training or the Student Builder; the change was reverted.`); }
      }
      TS[k] = { base, gain, w: o ? num(o.w, -1) : -1, wg: o ? num(o.wg, 0) : 0 };
    }
    V0.Mana = Math.min(V0.Mana, V0.Mana_max); V0.Stamina = Math.min(V0.Stamina, V0.Stamina_max);
  }
  Object.assign(c, { byBuilder, toolEdit });
  routineStart(c);   // 1.50.0: the routine week's reply
}

// ---- 0b. 1.1.0 Features settings: a feature that is off has its state parked in $ui.parked (hidden from the AI) and is not processed.
// Turning it back on restores it. A write the AI still makes into a parked module is merged into the parking, not dropped.
// On the update that toggles a feature, the "before" copy of its state is aligned, so the toggle is not read as a story change.
function stepFeatures(c) {
  const { S, log, hasB } = c;
  let { B } = c;
  {
    const parked = S.$ui.parked;
    let Bw = B;
    for (const f of FEATURES) {
      if (!f.paths) continue;
      const offA = parkOff(S, f), offB = hasB ? parkOff(B, f) : offA;
      if (offA) {
        const Pk = parked[f.id] || (parked[f.id] = {});
        for (const p of f.paths) {
          const cur = _.get(S, p);
          // 1.42.0 (audit): only what this reply wrote joins the parking; the placeholder the schema fills in (Proficiency zeros)
          // is not a write and must not overwrite the parked values
          const prev = hasB && p in Pk ? _.get(B, p) : undefined, wrote = prev === undefined ? cur : _.isPlainObject(cur) && _.isPlainObject(prev)
            ? _.pickBy(cur, (v, k) => !_.isEqual(v, prev[k])) : _.isEqual(cur, prev) ? undefined : cur;
          Pk[p] = p in Pk ? mergePark(Pk[p], wrote) : _.cloneDeep(cur === undefined ? EMPTY[p] : cur);
          _.set(S, p, _.cloneDeep(EMPTY[p]));
        }
      } else if (parked[f.id]) {
        for (const p of f.paths) if (parked[f.id][p] !== undefined) _.set(S, p, mergePark(_.cloneDeep(parked[f.id][p]), _.get(S, p)));
        delete parked[f.id];
      }
      if (hasB && offA !== offB) { if (Bw === B) Bw = _.cloneDeep(B); for (const p of f.paths) _.set(Bw, p, _.cloneDeep(_.get(S, p))); }
    }
    B = Bw;
  }
  // features whose rules, unlocks and UI are off (weather: level Off; happenings: level off)
  const OFF = new Set(S.$ui.off);
  if (S.$ui.happenings === 'off') OFF.add('happenings');
  if (S.$ui.wxfx === 'off') OFF.add('weather');
  if (S.$ui.ambience === 'off') OFF.add('ambience');
  S.$ui.on = Object.fromEntries(FEATURES.map(f => [f.id, !OFF.has(f.id)]));
  S.$ui.on.wxfull = S.$ui.wxfx === 'full';
  const offUnlock = new Set(FEATURES.filter(f => f.unlock && parkOff(S, f)).map(f => f.unlock));

  // 1.3.4 (owner playtest: Etnie showed up in message 0 of a new chat). The chat's starting state comes from the card's lorebook
  // as SillyTavern holds it ([initvar] entry 500), which is not replaced when the card is imported again. That entry carries the
  // card version in $eng.lore; on the first update of a chat, an older one (or none) means an old lorebook: say so, and drop
  // Etnie's pre-1.3.1 starting bond (she now bonds when they meet).
  const staleDrop = new Set();
  if (hasB && !(B.$eng && B.$eng.abs >= 0) && (B.$eng || {}).lore !== ENGINE_VER) {
    const old = (B.$eng || {}).lore || 'before 1.3.4';
    S.$ui.toasts.push(`Old lorebook (${old}): update the card's lorebook in SillyTavern`);
    log.push(`This chat started from the card's lorebook ${old}, but the card is ${ENGINE_VER}: rules, lore and the starting state are out of date. In SillyTavern, replace the lorebook "Eldrasil — Halvard Academy" with the one inside the card (character panel → More… → Import Card Lore), then start a new chat.`);
    const e = (S.Bonds || {}).Etnie;
    if (!(B.$eng || {}).lore && e && !e.Last_seen && e.Rank === 3 && (e.Milestones || []).length <= 1 && S.World.Month === 1 && S.World.Week === 1) { delete S.Bonds.Etnie; staleDrop.add('Etnie'); }
  }
  S.$eng.lore = ENGINE_VER;
  // 1.12.0 (planning/DRAFT_missed_reports.md): what the narrator reported in this update, kept before the sections below empty the
  // lists; section 8l compares it with the prose and the state to remind the narrator of what it may have left out
  const REPORTED = {
    acts: (Array.isArray(S.Interactions) ? S.Interactions : []).filter(a => a && typeof a === 'object'),
    casts: (Array.isArray(S.Magic && S.Magic.Casts) ? S.Magic.Casts : []).map(c => String((c && c.Technique) || '')),
    used: (Array.isArray(S.Consumables) ? S.Consumables : []).map(itemKey),
    perks: (Array.isArray(S.Perk_use) ? S.Perk_use : []).map(x => String(x).trim().toLowerCase()),
    training: (Array.isArray(S.Training) ? S.Training.length : 0) + (Array.isArray(S.Practice) ? S.Practice.filter(r => r && r.Track).length : 0),
    tutoring: Array.isArray(S.Tutoring) ? S.Tutoring.map(x => x.Subject) : [],
  };
  Object.assign(c, { OFF, offUnlock, staleDrop, REPORTED, B });
}

// ---- 1. time ----
// 1.3.3: an unreadable Day or Time from the AI arrives as '' (schema): keep the previous one rather than guess
function stepTime(c) {
  const { S, B, seedHint, log, jnl, hasB, text } = c;
  for (const [f, d] of [['Day', 'Mon'], ['Time', '08:00']]) {
    if (!S.World[f]) { S.World[f] = (hasB && B.World[f]) || d; if (hasB) log.push(`World.${f} could not be read; it was kept at ${S.World[f]}.`); }
  }
  // 1.38.0: during the Expedition a forest place is written in the forest map's words; elsewhere in the campus map's (1.3.1)
  const fPrev = hasB ? forestPlace(B.World.Location, areaWas(B, 'forest')) : '';
  // 1.40.0: while a flight is in the air {{user}} is aboard, in the airship's words. An outbound flight boards whoever is still
  // elsewhere (the Common Room, where the crew counts heads); a flight home leaves a place in the forest or Avalon to those maps
  // until the story boards. A Location that still says the airship after landing becomes the flight's destination.
  const sFl = airFlight(S.World, S), sPrev = hasB && placeOf(B.World.Location) === AIR.area ? areaPlace(AR.airship, B.World.Location, '', true) : '';
  let sAt = '', sBoard = false;
  if (sFl) {
    sAt = areaPlace(AR.airship, S.World.Location, '', true);
    if (!sAt && !(sFl.dir === 'home' && (forestPlace(S.World.Location, '') || areaPlace(AR.avalon, S.World.Location, '') || /sunreach/i.test(String(S.World.Location))))) {
      sAt = sPrev || AIR.board; sBoard = !sPrev;
      log.push(sBoard ? `The airship for ${sFl.event} is in the air (${sFl.from}-${sFl.to}): {{user}} is aboard; World.Location was set to ${AIR.area} — ${AR.airship.PL[sAt].name}.`
        : `Nobody leaves the airship until it lands (${sFl.to}): World.Location was kept at ${AIR.area} — ${AR.airship.PL[sAt].name}.`);
      S.World.Location = '';
    }
  } else if (sPrev && (placeOf(S.World.Location) === AIR.area || AR.airship.NAME[avKey(S.World.Location)])) {
    const bFl = airFlight(B.World, S);
    if (bFl) { log.push(`The airship has landed (${bFl.to}): World.Location was set to ${bFl.dest}.`); S.World.Location = bFl.dest; }
  }
  const fAt = !sAt && expOnDay(S.World) ? forestPlace(S.World.Location, fPrev) : '';
  // 1.39.0: in Avalon (Crowning Day; the Kingdom Competition days for Halvard's team) a city place is written in the city map's
  // words. Past the White Line (the castle pin) only the Kingdom winners go: anyone else is held at the last place before it.
  const aPrev = hasB ? areaPlace(AR.avalon, B.World.Location, areaWas(B, 'avalon')) : '';
  let aAt = !sAt && !fAt && (avCrown(S.World) || avKingdom(S.World, S)) ? areaPlace(AR.avalon, S.World.Location, aPrev) : '', aHeld = '';
  if (aAt && AR.avalon.PL[aAt].locked && !avPass(S)) { aHeld = aAt; aAt = aPrev && !AR.avalon.PL[aPrev].locked ? aPrev : 'crown_square'; }
  // 1.41.0: Sunreach Bay, from the landing to the boarding home, in the city map's words
  const rPrev = hasB ? areaPlace(AR.sunreach, B.World.Location, areaWas(B, 'sunreach')) : '';
  const rAt = !sAt && !fAt && !aAt && srWindow(S.World) ? areaPlace(AR.sunreach, S.World.Location, rPrev) : '';
  if (sAt) S.World.Location = areaLoc(AR.airship, S.World.Location, sAt);
  else if (fAt) S.World.Location = areaLoc(AR.forest, S.World.Location, fAt);
  else if (aAt) S.World.Location = areaLoc(AR.avalon, aHeld ? '' : S.World.Location, aAt);
  else if (rAt) S.World.Location = areaLoc(AR.sunreach, S.World.Location, rAt);
  else if (!(S.Trip && S.Trip.Active)) S.World.Location = canonLocation(S.World.Location);
  else {
    // 1.42.0 (audit 1.2): a Trip left Active after {{user}} came home (seen off campus during it, now at a campus place on a day
    // with no "away" event) ends here, so it no longer pauses the campus systems
    const cl = canonLocation(S.World.Location);
    if (hasB && num(S.$eng.trip, 0) && plName(placeOf(cl)) && onCampus(cl) && !eventsOn(S.World).some(e => e.away)) {
      S.Trip.Active = false; S.World.Location = cl;
      log.push(`{{user}} is back at ${placeOf(cl)}: Trip.Active was still true, so the engine set it false (set it false on return).`);
    }
  }
  S.$eng.trip = S.Trip && S.Trip.Active ? (num(S.$eng.trip, 0) || (!onCampus(S.World.Location) ? 1 : 0)) : 0;   // seen off campus on this Trip
  const absB = hasB ? (B.$eng && B.$eng.abs >= 0 ? B.$eng.abs : toAbs(B.World)) : toAbs(S.World);
  let absA = toAbs(S.World);
  if (hasB && absA < absB) {
    // v1.0.3 (A#1): a new Day without Week/Month/Year rollover advances by whole weeks. On the same Day, only a clear
    // late-night to early-morning crossing is an implicit midnight rollover; a small backwards typo must not skip a day.
    let dayChanged = S.World.Day !== B.World.Day;
    // 1.42.0 (audit 1.8): a Day one or two days back in the same week, with no time skip in the prose, is a slip ("Mon" for
    // "Tue"), not a week later: the clock is kept, as on the same Day
    const back = (DAYS.indexOf(B.World.Day) - DAYS.indexOf(S.World.Day) + 7) % 7;
    if (dayChanged && back >= 1 && back <= 2 && S.World.Week === B.World.Week && S.World.Month === B.World.Month && (S.World.Year || 1) === (B.World.Year || 1)
      && !MISS_TIME_RX.test(String(text || '').replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(QUOTE_RX, ' '))) {
      log.push(`World.Day went back from ${B.World.Day} to ${S.World.Day} with no time skip in the story: the clock was kept at ${stamp(B.World)}. If the story did mean a week later, write the Week too.`);
      dayChanged = false; absA = absB;
    }
    const overnight = !dayChanged && B.World.Time >= '20:00' && S.World.Time <= '06:00';
    const step = dayChanged ? 7 * DAY_MIN : overnight ? DAY_MIN : 0, limit = dayChanged ? 60 : overnight ? 1 : 0;
    let k = 0;
    while (absA < absB && k < limit) { absA += step; k++; }
    if (absA < absB) { absA = absB; log.push('Time cannot move backwards; the clock was kept.'); }
  }
  // 1.11.1 (bug hunt): a partial calendar rollover. Month or Year changed but the Week was left as it was ("M3 W4 Sun" ->
  // "M4 W4 Mon"): when the next such Day and Time after the previous clock falls in the Month and Year written, that is the day
  // meant, not three weeks later.
  if (hasB && absA - absB > 3 * DAY_MIN && (S.World.Month !== B.World.Month || (S.World.Year || 1) !== (B.World.Year || 1))) {
    const t = hm(S.World.Time), want = DAYS.indexOf(S.World.Day);
    if (t != null && want >= 0) {
      const d0 = Math.floor(absB / DAY_MIN), add = (want - DAYS.indexOf(B.World.Day) + 7) % 7;
      let alt = (d0 + add) * DAY_MIN + t; if (alt <= absB) alt += 7 * DAY_MIN;
      const T = fromAbs(alt);
      if (T.Month === S.World.Month && T.Year === (S.World.Year || 1) && alt < absA) {
        log.push(`World.Week was not reset for the new month: the clock moved to ${stamp(T)} (the next ${S.World.Day}), not ${stamp(fromAbs(absA))}.`);
        absA = alt;
      }
    }
  }
  Object.assign(S.World, fromAbs(absA));
  const elapsed = hasB ? Math.max(0, absA - absB) : 0;
  // a jump of more than three days is shown to the player, so a mistaken date can be swiped away before it is played on
  if (elapsed > 3 * DAY_MIN && !c.routine) {   // 1.50.0: a routine week is a planned jump
    const days = Math.round(elapsed / DAY_MIN);
    S.$ui.toasts.push(`Time jumped ${days} days`);
    log.push(`Time moved ${days} days in one update (to ${stamp(S.World)}). If the story did not mean a time skip, the date was written wrongly: swipe or correct it.`);
  }
  const evs = eventsOn(S.World);
  // 1.2.0: {{user}}'s birthday (Builder, Profile.Birthday "M? W? Day") joins the day's events; lore entry 508 says how it plays out
  const bd = /^M(\d{1,2}) W([1-4]) (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.exec(String(S.Player.Profile.Birthday || '').trim());
  const bday = bd && +bd[1] === S.World.Month && +bd[2] === S.World.Week && bd[3] === S.World.Day;
  // 1.3.1: each event with today's plan (times from its lore entry), so the narrator runs the day on schedule
  S.World._Event_today = [...evs.map(e => (schedOf(e, S.World.Day) ? `${e.t} — ${schedOf(e, S.World.Day)}` : e.t) + (e.entr && (S.World.Year > 1 || num(S.Player.Profile.Year, 1) > 1) ? ` (${ENTR_BACK})` : '')), ...(bday ? [`${S.Player.Profile.Name || 'Your'}'s birthday`] : [])].join(' | ');
  S.World._Period = periodOf(S.World, evs, S);
  S.World._Curfew = curfewOf(S.World, evs, S);
  // F20: today's happening (visible from the day's start until its window closes)
  if (!(S.$eng.seed > 0)) S.$eng.seed = (hash32(String(seedHint || ''), stamp({ ...S.World, Year: 1 }), String(S.Player.Profile.Name || '')) % 2147483646) + 1;
  {
    const rate = HAPPEN_RATE[S.$ui.happenings] ?? HAPPEN_RATE.normal;
    const h = happeningOn(S.$eng.seed, Math.floor(absA / DAY_MIN), rate, S.$ui.wxfx), hr = Math.floor((absA % DAY_MIN) / 60);
    if (h && hr < h.to) {
      const win = `${pad(h.from)}:00–${pad(h.to)}:00`, now = hr >= h.from;
      S.World._Happening = `${now ? 'Now, until ' + pad(h.to) + ':00' : win}${h.where ? ', ' + h.where : ', around campus'}: ${h.text}`;
      S.$ui.hap = { id: h.id, where: h.where || '', from: h.from, to: h.to, text: h.text, now };
      if (hasB && (!B.$ui || !B.$ui.hap || B.$ui.hap.id !== h.id || Math.floor(absB / DAY_MIN) !== Math.floor(absA / DAY_MIN))) S.$ui.toasts.push(`Around campus: ${h.where || 'campus-wide'}`);
    } else { S.World._Happening = ''; S.$ui.hap = null; }
  }
  const dayNo = Math.floor(absA / DAY_MIN);
  const goneNow = id => (S.Campus_State.Graduated || []).includes(id);   // 1.7.6: a graduate's rewards stop working
  const dayNoB = Math.floor(absB / DAY_MIN);
  // FP2: the story records the announced winner; the other nominee is always the incoming Vice President.
  // Keep a recorded result stable across swipes, updates and later school years. Year 1 has the owner's named nominees.
  {
    const C = S.Campus_State.Council, BC = hasB && B.Campus_State && B.Campus_State.Council || {};
    C.Candidates['1'] = { First: 'Florian', Second: 'Dante' };
    const playerName = S.Player.Profile.Name || '{{user}}';
    if (S.World.Year >= 2 && !C.Candidates['2']) C.Candidates['2'] = { First: 'Caralynn', Second: S.Player.Profile.Council ? playerName : 'Percival' };
    if (S.World.Year >= 3 && !C.Candidates['3']) C.Candidates['3'] = { First: 'Hadrian', Second: 'Nerys' };
    for (const [key, pair] of Object.entries(C.Candidates)) {
      const y = Number(key), prev = (BC.Candidates || {})[key];
      if (key === '1') continue;
      if (prev && prev.First && prev.Second) { C.Candidates[key] = prev; continue; }
      const ids = [pair.First, pair.Second].map(x => NPC_ALIAS[String(x).toLowerCase()] || x);
      const eligible = id => id === playerName ? y === 2 && pair.Second === playerName : !!STUDENTS[id] && (STUDENTS[id][1] || 1) <= y && yearOf(id, y) >= 1 && yearOf(id, y) <= 2;
      if (!Number.isInteger(y) || y < 2 || ids[0] === ids[1] || !ids.every(eligible)) {
        delete C.Candidates[key];
        if (pair.First || pair.Second) log.push(`Council candidates for Year ${key} must be two different named students eligible to attend the next year.`);
      } else C.Candidates[key] = { First: ids[0], Second: ids[1] };
    }
    for (const [key, result] of Object.entries(C.Results)) {
      const y = Number(key), prev = (BC.Results || {})[key], pair = C.Candidates[key];
      if (prev && prev.President && prev.VicePresident) { C.Results[key] = prev; continue; }
      const winner = NPC_ALIAS[String(result.President).toLowerCase()] || result.President;
      const other = pair && (winner === pair.First ? pair.Second : winner === pair.Second ? pair.First : '');
      const close = Number.isInteger(y) && y > 0 ? toAbs({ Year: y, Month: 10, Week: 3, Day: 'Sat', Time: '16:00' }) : Infinity;
      if (!other || absA < close) {
        delete C.Results[key];
        if (result.President) log.push(`Council result for Year ${key} waits until Saturday voting closes and must name one of that year's two candidates.`);
      } else {
        C.Results[key] = { President: winner, VicePresident: other };
        if (!prev || !prev.President) jnl.push(`Student Council election: ${winner} was elected President for Year ${y + 1} and named ${other} Vice President.`);
      }
    }
    if (S.World.Year > 1 && !C.Results['1']) {
      C.Results['1'] = { President: 'Florian', VicePresident: 'Dante' };
      log.push('The Year 1 Council election was skipped in this save; Florian is the default President and Dante the Vice President for Year 2.');
    }
    const cur = S.World.Year === 1 ? { President: 'Irene', VicePresident: 'Caspian' } : C.Results[String(S.World.Year - 1)] || {};
    const elect = C.Results[String(S.World.Year)] || {};
    C.President = S.World.Month === 12 ? '' : cur.President || '';
    C.VicePresident = S.World.Month === 12 ? '' : cur.VicePresident || '';
    C.PresidentElect = elect.President || '';
    C.VicePresidentElect = elect.VicePresident || '';
    C.Members = S.World.Month === 12 ? [] : S.World.Year === 1 ? ['Irene','Caspian','Florian','Dante']
      : S.World.Year === 2 ? [C.President, C.VicePresident, 'Caralynn', C.Candidates['2']?.Second]
      : [C.President, C.VicePresident, 'Hadrian', 'Nerys', 'Bianca'];
    if (S.Player.Profile.Council && S.World.Month !== 12) C.Members.push(playerName);
    C.Members = _.uniq(C.Members.filter(Boolean));
  }
  // Entrance tour: a reproducible roster-first assignment, saved once so swipes and scene changes keep the same trio.
  // In Year 1 {{user}} is one of the two first-years; in later years {{user}} is the senior guide.
  if (evs.some(e => e.entr)) {
    const Y = S.World.Year, returning = Y > 1 || num(S.Player.Profile.Year, 1) > 1;
    const required = returning ? 2 : 1;
    const T = S.Campus_State.Entrance_tour, old = hasB && B.Campus_State && B.Campus_State.Entrance_tour;
    if (old && old.Year === Y && old.Guide && (old.FirstYears || []).length === required) {
      S.Campus_State.Entrance_tour = _.cloneDeep(old);
    } else {
      const unavailable = id => npcAwayIn(S, id);
      const students = Object.keys(STUDENTS).filter(id => (STUDENTS[id][1] || 1) <= Y && !unavailable(id));
      const freshmen = students.filter(id => yearOf(id, Y) === 1);
      const seniors = students.filter(id => yearOf(id, Y) >= 2 && yearOf(id, Y) <= 3);
      const ordered = (ids, key) => {
        const here = ids.filter(id => S.Scene.Present[id]);
        const rest = ids.filter(id => !S.Scene.Present[id]).sort();
        const shift = rest.length ? hash32(S.$eng.seed, Y, key) % rest.length : 0;
        return [...here, ...rest.slice(shift), ...rest.slice(0, shift)];
      };
      const proposed = (T.FirstYears || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x);
      const first = [...new Set(proposed.filter(id => freshmen.includes(id)))].slice(0, required);
      for (const id of ordered(freshmen, 'entrance-first-years')) if (first.length < required && !first.includes(id)) first.push(id);
      // Only if roster candidates cannot fill the group may a narrator-created first-year take a remaining place.
      for (const id of proposed) if (first.length < required && !STUDENTS[id] && /\s/.test(id) && !first.includes(id)) first.push(id);
      const requestedGuide = NPC_ALIAS[String(T.Guide || '').toLowerCase()] || T.Guide;
      const guide = returning ? '{{user}}' : seniors.includes(requestedGuide) ? requestedGuide
        : ordered(seniors, 'entrance-guide')[0] || (seniors.length ? '' : requestedGuide || '');
      S.Campus_State.Entrance_tour = { Year: Y, Guide: guide, FirstYears: first };
      if (hasB) log.push(`Entrance tour assigned: ${returning ? '{{user}} guides' : guide + ' guides {{user}} and'} ${first.join(' and ') || 'new first-years yet to be named'}. Keep this trio through 18:00.`);
    }
  }
  if (hasB && dayNo !== dayNoB && evs.some(e => e.ranking) && (S.$ui.off || []).includes('study')) log.push('Results & Dorm Ranking today: update Player.Profile.Dorm_rank when the results are announced.');
  if (hasB && dayNo !== dayNoB && evs.some(e => e.grad)) log.push(`Graduation today: the third-years leave by airship tomorrow morning; the engine then lists them in Campus_State.Graduated.${Object.keys(STAYS).filter(id => yearOf(id, S.World.Year) === 3 && !(S.Campus_State.Graduated || []).includes(id)).map(id => ` ${id} is not graduating (see their lore).`).join('')}`);
  // 1.7.4: {{user}} turns a year older on the first update of their birthday (once per campaign year), unless the story already
  // changed Player.Profile.Age in that update
  if (hasB && bday && dayNo !== dayNoB) {
    const bs = S.$eng.bdays || (S.$eng.bdays = []), k = `Y${S.World.Year}`;
    if (!bs.includes(k)) {
      bs.push(k);
      if (num(S.Player.Profile.Age, 18) === num(B.Player.Profile.Age, 18)) { S.Player.Profile.Age = num(S.Player.Profile.Age, 18) + 1; log.push(`Birthday: {{user}} turns ${S.Player.Profile.Age} today (Player.Profile.Age).`); }
    }
  }
  Object.assign(c, { absB, absA, elapsed, evs, dayNo, goneNow, dayNoB, fAt, fPrev, aAt, aPrev, aHeld, sAt, sPrev, sFl, sBoard, rAt, rPrev });
}

// ---- 1b. 1.1.0 weather (spec §4): season, sky, wind, rare weather and °C for the current block; the Divination Society forecast ----
function stepWeather(c) {
  const { S, log, hasB, absB, absA, dayNo, fAt, aAt, rAt } = c;
  const WXM = S.$ui.wxfx, seed = S.$eng.seed, TU = tuneOf(S);
  // 1.38.0: in the Grand Vast Forest the weather is the rainforest's and its effects apply as on campus; 1.41.0: Sunreach has its own.
  // 1.46.0 (audit 3.7): an area's climate profile (data climate, areaWx); WA is that area for every later weather effect (sleep, toasts).
  // 1.39.0: Avalon has the kingdom's weather of the day (Halvard's), and its effects apply there too
  const WA = fAt ? AR.forest : rAt ? AR.sunreach : null;
  const away = /^Away from campus/.test(S.World._Curfew || '') && !fAt && !aAt && !rAt;
  let wxNow = null;                                            // wxNow: the block whose effects apply (Full, on campus)
  if (WXM === 'off') { S.World._Season = ''; S.World._Weather = ''; S.$ui.wx = null; }
  else {
    const [wd, wb] = blockOf(absA), D = wxDay(seed, wd), bk = WA ? areaWx(WA, seed, wd, wb) : D.blocks[wb];
    const lab = x => ({ ...x, label: tempLabel(x.temp) });
    S.World._Season = D.season;
    S.World._Weather = away ? "Away: local weather is the narrator's call" : WA ? `${_.capitalize(BLOCKS[wb])}, ${WA.area} (${WA.D.climate.label}): ${wxText(bk)}, ${bk.temp} °C (${tempLabel(bk.temp)})`
      : `${_.capitalize(BLOCKS[wb])}, ${D.season.toLowerCase()}${aAt ? ', ' + AV.area : ''}: ${wxText(bk)}, ${bk.temp} °C (${tempLabel(bk.temp)})`;
    const fday = (absA % DAY_MIN) >= 7 * 60 ? dayNo + 1 : dayNo;   // posted daily at 07:00 for the next day
    S.$ui.wx = { mode: WXM, season: D.season, away, forest: !!fAt, block: wb, now: lab(bk), text: wxText(bk), blocks: (WA ? [0, 1, 2].map(b => areaWx(WA, seed, wd, b)) : D.blocks).slice(0, wb + 1).map(lab),
      fc: { day: fday, tomorrow: fday > dayNo, blocks: wxForecast(seed, fday) }, flu: false, sick: [], field: '' };
    if (WXM === 'full' && !away) {
      wxNow = bk;
      if (!WA && fluOn(seed, dayNo)) {                          // a cold is going around: 1-2 seeded students off sick today
        const pool = Object.keys(STUDENTS).filter(id => (STUDENTS[id][1] || 1) <= S.World.Year && yearOf(id, S.World.Year) <= 3 && !(S.Campus_State.Graduated || []).includes(id)).sort();
        const sick = [];
        for (let k = 0, n = rollInt(1, 2, seed, dayNo, 'sickn'); k < n && pool.length; k++) sick.push(pool.splice(rollInt(0, pool.length - 1, seed, dayNo, k, 'sick'), 1)[0]);
        Object.assign(S.$ui.wx, { flu: true, sick });
      }
      if (isOutdoor(S.World.Location)) {                         // outdoor fights: field line for the narrator and the Battle panel
        S.$ui.wx.field = [bk.sky === 'Rain' ? 'wet footing' : '', bk.sky === 'Fog' ? (bk.rare === 'dense fog' ? 'very low visibility' : 'low visibility') : '',
          bk.wind ? 'gusts' : '', bk.temp >= 28 ? 'heat' : ''].filter(Boolean).join(', ');
      }
    }
    if (hasB && bk.rare && !away) {                              // a rare event: toast + log when it begins
      const [bd, bb] = blockOf(absB), b0 = wxWhere(WA, seed, bd, bb);   // 1.42.0: Sunreach too
      if ((bd !== wd || bb !== wb) && b0.rare !== bk.rare) { S.$ui.toasts.push(`Weather: ${bk.rare}`); log.push(`Rare weather: ${wxText(bk)}.`); }
    }
  }

  // 1.48.0 (audit 2.6): the state keeps each mood ({ mood }: the bracelet, gifts); the reasons are only in <now>'s lines (c.moods)
  S.$ui.moods = {};
  const moods = {};
  if (WXM !== 'off') for (const id of Object.keys(NPC_MOODS)) if ((ARRIVES[id] || 1) <= S.World.Year && (S.Bonds[id] || (S.Scene.Present || {})[id])) {
    moods[id] = moodOf(id, S, S.$ui.wx && !S.$ui.wx.away ? S.$ui.wx.now : null, dayNo);
    // 1.72.0: the bracelet and scene card see a calendar day (day, tone) and a birthday's tone (bd: the UI shows it once the birthday
    // is known); the personal dates with {{user}} stay the narrator's
    const sd = moods[id].days.find(d => !d.personal && !d.bd), bd = moods[id].days.find(d => d.bd);
    S.$ui.moods[id] = { mood: moods[id].mood, ...(sd ? { day: sd.label, tone: sd.tone } : {}), ...(bd ? { bd: bd.tone } : {}) };
  }
  S.$ui.party = birthdayParty(S);
  Object.assign(c, { WXM, seed, TU, wxNow, WA, moods });
}

// ---- 2. magic: casts ----
function stepMagic(c) {
  const { S, B, log, hasB, absA, elapsed, TU, wxNow, OFF } = c;
  const V = S.Player.Vitals, M = S.Magic;
  // 1.31.0 (owner-approved planning/DRAFT_spirit_path.md): a first Spirit Pact in play. Outside the Builder a new pact stays only
  // when it is lawful and small: Kind Spirit, Tier Lesser, a student with Occult magic, made at the Spirit Path, one such pact ever.
  // The engine writes its Summon technique with the Builder's lesser-tier costs (hybrid 5 / 0.1 a minute / 3 a use). Else it goes.
  if (hasB && !c.byBuilder && _.isPlainObject(M.Pacts)) {
    const P0 = (B.Magic && B.Magic.Pacts) || {};
    for (const k of Object.keys(M.Pacts).filter(x => !(x in P0))) {
      const P = M.Pacts[k] || {};
      const why = P.Kind !== 'Spirit' ? 'only a lawful Spirit Pact can be made in play'
        : P.Tier !== 'Lesser' ? 'a pact made in play is with a lesser spirit'
        : !((M._Affinity || {}).Types || []).includes('Occult') ? 'only a student with Occult magic can bond a lesser spirit'
        : placeKey(S.World.Location) !== 'spirit path' || placeKey(B.World.Location) !== 'spirit path' ? 'a first pact is made at the Spirit Path'
        : S.$eng.pactPlay ? `{{user}} already made a pact in play (${S.$eng.pactPlay})` : '';
      if (why) { delete M.Pacts[k]; log.push(`Pact with ${k} not recorded: ${why}.`); continue; }
      S.$eng.pactPlay = k;
      const pres = P.Presence === 'terms' ? `${k} lives and acts as the pact's terms say; summoning calls it to your side.` : `${k} is with you only while summoned.`;
      const tech = { Type: 'Occult', Subtype: 'Spirit Pact', Effect: `Summons ${k} (spirit pact, Lesser). ${pres} Each ability ${k} uses while present is a triggered use.`,
        Cannot_do: 'A spirit killed in combat takes an hour to a week to call back.', Cost_mode: 'hybrid', Activation: 5, Upkeep_per_min: 0.1, Trigger: 3,
        Hidden: false, Forbidden: false, Notes: `[pact] ${k}` };
      (M._Techniques || (M._Techniques = {}))['Summon ' + k] = tech;
      if (S.$ui.file && _.isPlainObject(S.$ui.file.Techniques)) S.$ui.file.Techniques['Summon ' + k] = _.cloneDeep(tech);
      log.push(`Spirit Pact with ${k} (a lesser spirit) recorded; "Summon ${k}" is on the Techniques page.`);
      S.$ui.toasts.push(`Spirit Pact: ${k}`);
    }
  }
  const T = M._Techniques || {};
  const BA = (hasB && B.Magic && B.Magic.Active) || {};
  // v1.0.3 (A#3): the AI never sees $ fields, so a whole-record replace drops them; the same effect keeps its start time
  for (const [k, e] of Object.entries(M.Active || {})) {
    const e0 = BA[k];
    if (e0 && e0.Technique === e.Technique && !(e.$started >= 0) && e0.$started >= 0) { e.$started = e0.$started; e.$settled = e0.$settled; }
  }
  const wind = wxNow && isOutdoor(S.World.Location) && !blocksWind(M.Active, T) ? wxNow.wind : '';
  const windCost = (t, amount, name) => {
    const mult = windMultiplier(t.Subtype, M._Affinity.Custom, wind), cost = Math.round(amount * mult * 100) / 100;
    if (wind && amount > 0) log.push(`${name} cost ${cost} (×${mult}, ${wind} outdoors).`);
    return cost;
  };
  if (S.$ui.wx) S.$ui.wx.wind = wind;   // 1.42.0: the Battle panel prices a cast as the engine will
  if (wind && S.$ui.wx.field) S.$ui.wx.field += '; casting: Wind/Storm ×' + (wind === 'gale' ? '0.75' : '1') + ', scattered ×' + (wind === 'gale' ? '2' : '1.5') + ', body/object ×1, others ×' + (wind === 'gale' ? '1.5' : '1.25');
  // 1.9.4 (playtest Batch 4): passive mana regeneration, Mana_max / 360 per elapsed minute awake or asleep (empty to full in six
  // hours). The turn's regeneration is a pool counted once: a cast or activation that needs more than the mana on hand draws on it,
  // sustained upkeep is paid from it minute by minute, and the rest is added after upkeep (section 4).
  const regenRate = V.HP > 0 ? num(V.Mana_max, 0) / (60 * TU.mana_regen) : 0;   // 1.9.9: Settings > Body and magic (default 6 hours)
  let regenLeft = regenRate * elapsed;
  const payMana = cost => { const pool = Math.min(regenLeft, Math.max(0, cost - V.Mana)); regenLeft -= pool; V.Mana -= cost - pool; };
  const activeNow = tq => Object.values(M.Active || {}).some(e => e.Technique === tq);
  const partnerHere = pk => { const P = (M.Pacts || {})[pk] || {}; return P.Presence === 'terms' || !!P.Summoned || activeNow('Summon ' + pk); };
  // 1.12.0 (H6, planning/DRAFT_missed_reports.md): a sustained or hybrid technique reported only in Casts, with no running effect,
  // was started: it becomes an Active entry (Activation in section 3, then upkeep), not a one-off cast. More uses of a hybrid in the
  // same entry are its triggers. A pact's Summon started this way also marks the partner summoned.
  const autoStarted = new Set();
  {
    const keep = [];
    for (const c of M.Casts || []) {
      const t = T[c.Technique];
      if (t && (t.Cost_mode === 'sustained' || t.Cost_mode === 'hybrid') && !activeNow(c.Technique)) {
        const key = c.Technique in M.Active ? c.Technique + ' (started)' : c.Technique;
        M.Active[key] = { Technique: c.Technique, Note: '' }; autoStarted.add(key);
        log.push(`${c.Technique} is ${t.Cost_mode}: it now runs in Magic.Active as "${key}" (activation, then upkeep each minute); remove that entry when {{user}} ends it.`);
        if (t.Cost_mode === 'hybrid' && (c.Times || 1) > 1) keep.push({ Technique: c.Technique, Times: c.Times - 1 });
        const pm = /^\[pact\]\s*(.+)$/.exec(t.Notes || ''), pk = pm && pm[1].trim();
        if (pk && c.Technique === 'Summon ' + pk && (M.Pacts || {})[pk]) M.Pacts[pk].Summoned = true;
      } else keep.push(c);
    }
    M.Casts = keep;
  }
  // 1.12.0 (H5): a summoned pact partner and its Summon effect in Magic.Active follow each other (rule 502 asks for both). Summoned
  // written without the effect starts it; the effect removed, or Summoned turned off, dismisses the partner; an effect started
  // without Summoned sets it. A partner that lives by its terms is not summoned and is left alone.
  for (const [pk, P] of Object.entries(M.Pacts || {})) {
    const tq = 'Summon ' + pk;
    if (!P || P.Presence === 'terms' || !T[tq] || T[tq].Cost_mode === 'per_use') continue;
    const runs = activeNow(tq), ran = Object.values(BA).some(e => e && e.Technique === tq);
    const was = !!((((hasB && B.Magic && B.Magic.Pacts) || {})[pk]) || {}).Summoned;
    if (P.Summoned && !runs) {
      if (ran) { P.Summoned = false; log.push(`${pk} was dismissed (the Summon effect left Magic.Active).`); }
      else {
        const key = pk in M.Active ? tq : pk;
        M.Active[key] = { Technique: tq, Note: '' }; autoStarted.add(key);
        log.push(`${pk} was summoned: "${key}" now runs in Magic.Active (activation, then upkeep each minute).`);
      }
    } else if (!P.Summoned && runs) {
      if (was) {
        for (const [k, e] of Object.entries(M.Active)) if (e && e.Technique === tq) delete M.Active[k];
        log.push(`${pk} was dismissed: its Summon effect ended.`);
      } else P.Summoned = true;
    }
  }
  const profContext = c;
  for (const c of M.Casts || []) {
    const t = T[c.Technique];
    if (!t) { log.push(`Unknown technique "${c.Technique}" was reported; nothing was charged.`); continue; }
    // v1.0.3 (A#4/F05): a sustained effect is cast by its Active entry, which pays the Activation; a Casts entry for it is not a second cast
    if (t.Cost_mode === 'sustained' && activeNow(c.Technique)) { log.push(`${c.Technique} is sustained: its Active entry already paid the activation, so the Casts entry was not charged.`); continue; }
    // 1.3.2: a pact partner's ability ("<partner>: <ability>") works only while the partner is with {{user}} (summoned, or living
    // by its terms); otherwise nothing happened and nothing is charged
    const pm = /^\[pact\]\s*(.+)$/.exec(t.Notes || ''), pk = pm && pm[1].trim();
    if (pk && c.Technique.startsWith(pk + ': ') && !partnerHere(pk)) { log.push(`${c.Technique}: ${pk} is not summoned, so the ability could not be used; nothing was charged.`); continue; }
    // hybrid: while the effect is running, a triggered use costs Trigger; otherwise a cast costs Activation
    const running = Object.values(M.Active || {}).some(e => e.Technique === c.Technique);
    const base = t.Cost_mode === 'hybrid' && t.Trigger > 0 && running ? t.Trigger : (t.Activation || 0);
    const unit = t.Cost_mode === 'per_use' && base > 0 && !OFF.has('proficiency') && profRankOf(hasB ? B : S, 'Arcana') >= MASTERY ? Math.max(0.5, Math.round(base * MASTERY_FX.arcana_cost * 2) / 2) : base;   // 1.30.0: Arcane scholar
    const cost = windCost(t, unit * (c.Times || 1), c.Technique);
    if (cost > V.Mana + regenLeft) { log.push(`${c.Technique} needed ${cost} mana but only ${Math.floor(V.Mana + regenLeft)} was left: the casting strained or failed (mana now 0).`); V.Mana = 0; regenLeft = 0; }
    else { payMana(cost); profContext.profCast = true; }
  }
  M.Casts = [];

  // ---- 3. magic: sustained effects ----
  const endPact = eff => {   // v1.0.3 (F06): the engine ended a pact summon -> the spirit is no longer summoned
    const t = T[eff.Technique], m = t && /^\[pact\]\s*(.+)$/.exec(t.Notes || '');
    if (m && /^Summon /.test(eff.Technique) && M.Pacts && M.Pacts[m[1].trim()]) M.Pacts[m[1].trim()].Summoned = false;
  };
  const settle = (name, eff, until) => {
    const t = T[eff.Technique];
    const rate = t ? windCost(t, t.Upkeep_per_min || 0, name + " upkeep/min") : 0;
    const from = eff.$settled >= 0 ? eff.$settled : until;
    const mins = Math.max(0, until - from);
    if (rate <= 0 || mins <= 0) { eff.$settled = until; return true; }
    const need = rate * mins, regen = Math.min(regenLeft, regenRate * mins);   // 1.9.4: regeneration during these minutes offsets upkeep
    if (need <= V.Mana + regen) { const r = Math.min(regen, need); regenLeft -= r; V.Mana -= need - r; eff.$settled = until; return true; }
    const g = regen / mins, lasted = Math.floor(V.Mana / (rate - g));   // net drain until empty; regeneration after the end stays in the pool
    regenLeft -= g * lasted; V.Mana = 0;
    log.push(`${name} ended at ${fromAbs(from + lasted).Time}: mana ran out.`);
    return false;
  };
  // 1.12.0 (H7): an effect that only changed its name in Magic.Active (same technique) keeps running: no second Activation
  const renamed = new Set(), cont = new Set();
  for (const [name, eff] of Object.entries(M.Active)) {
    if (name in BA || !eff || autoStarted.has(name)) continue;
    const old = Object.keys(BA).find(k => !(k in M.Active) && !renamed.has(k) && BA[k] && BA[k].Technique === eff.Technique && BA[k].$started >= 0);
    if (old) { renamed.add(old); cont.add(name); eff.$started = BA[old].$started; eff.$settled = BA[old].$settled; }
  }
  for (const [name, eff] of Object.entries(BA)) {              // effects the AI ended this turn: settle up to now
    if ((!(name in M.Active) || autoStarted.has(name)) && !renamed.has(name)) settle(name, { ...eff }, absA);
  }
  const startedNow = [];                                         // 1.12.0: techniques started this update (section 8l)
  for (const [name, eff] of Object.entries(M.Active)) {
    const t = T[eff.Technique];
    if ((!(name in BA) && !cont.has(name)) || eff.$started < 0 || autoStarted.has(name)) {   // started this turn
      eff.$started = absA; eff.$settled = absA;
      if (t && t.Cost_mode !== 'per_use' && t.Activation) {
        const activation = windCost(t, t.Activation, name);
        if (activation > V.Mana + regenLeft) { log.push(`${name} could not be sustained: not enough mana to activate.`); endPact(eff); delete M.Active[name]; continue; }
        payMana(activation);
      }
      if (!t) log.push(`Active effect "${name}" names no known technique; no upkeep is charged.`);
      startedNow.push(eff.Technique);
    } else {
      if (name in BA) { eff.$started = BA[name].$started; eff.$settled = BA[name].$settled; }
      if (!settle(name, eff, absA)) { endPact(eff); delete M.Active[name]; continue; }
    }
  }
  Object.assign(c, { V, M, regenLeft, startedNow });
}

// ---- 3b. 1.45.0 (audit 3.4): purchases. The narrator reports what {{user}} buys in /Purchases; the engine settles it before the
// used items are read (4), so a drink bought and drunk in one reply works. A listed item (data/shop.json) costs its listed price at
// a shop that sells it, in season; elsewhere, or for an item not listed, the narrator's Price is a story price. Points on campus,
// coin away from Halvard (awayIn). The payment goes through the ledger and the item into the Bag (bagGive), unless it was Used at
// once (a meal, a service, a drink at the counter): then it is paid, not kept, and an item with a "When used" effect takes effect.
// A purchase that cannot be paid, or has no price, is refused in _Log; nothing is bought.
function stepPurchases(c) {
  const { S, hasB, log } = c;
  const list = Array.isArray(S.Purchases) ? S.Purchases : [];
  S.Purchases = [];
  if (!hasB || c.toolEdit || !list.length) return;
  const here = placeKey(S.World.Location), season = SEASON_OF(S.World.Month), away = awayIn(S), cur = away ? 'Coin' : 'Points';
  for (const p of list) {
    const asked = String(p.Item || '').trim(), qty = Math.max(1, Math.round(num(p.Qty, 1)));
    if (!asked) continue;
    const rows = shopRows(asked), name = rows.length ? rows[0][4] : asked;
    const atShop = rows.filter(x => x[2] === here || placeKey(x[1]) === here), sold = atShop.find(x => !x[3] || x[3].includes(season));
    const story = num(p.Price, -1);
    let price = -1, shop = '', why = '';
    if (!away && sold) { price = sold[0]; shop = sold[1]; }
    else if (!away && atShop.length) why = `${name} is sold here only in ${atShop[0][3].join(' and ')}`;
    else if (story >= 0) { price = Math.round(story); shop = String(p.Shop || '').trim() || placeOf(S.World.Location); }
    else why = rows.length && !away ? `${name} is sold at ${[...new Set(rows.map(x => x[1]))].join(', ')}, not here; give a Price if another seller sells it` : `${name} has no listed price; give its Price`;
    const total = price * qty, have = num(S.Player.Wallet[cur], 0);
    if (!why && total > have) why = `it costs ${total} ${cur === 'Coin' ? 'coin' : 'points'} and {{user}} has ${have}`;
    if (why) { log.push(`Purchase ${name}${qty > 1 ? ' x' + qty : ''} refused: ${why}. Nothing was bought.`); S.$ui.toasts.push(`Not bought: ${name}`); continue; }
    if (total) ledger(c, cur, -total, `${name}${qty > 1 ? ' x' + qty : ''} (${shop}${sold && !away ? '' : ', story price'})`);
    if (p.Used) {
      const fx = fxOf(name);
      if (fx && fx.use && !(S.Consumables || []).some(x => itemKey(x) === itemKey(name))) S.Consumables = [...(S.Consumables || []), name];
      c.boughtUsed = [...(c.boughtUsed || []), itemKey(name)];
    } else {
      const fx = fxOf(name), kind = INV_KINDS.includes(p.Kind) ? p.Kind : fx && fx.gear ? 'gear' : 'other';
      bagGive(c, name, qty, kind, '');
    }
  }
}

// ---- 4. rest & recovery (1.1.0: Soaked halves stamina recovery; sleep quality follows the night's weather, Full only) ----
// 1.12.0 (H1): a night skipped in one update (5 to 24 hours, 4 of them between 00:00 and 06:00) with no Resting written was
// slept, not stayed up: indoors (or on a trip), not in a battle, not under The Vigil. "awake" is a deliberate all-nighter.
function stepRest(c) {
  const { S, B, log, hasB, toolEdit, absB, absA, elapsed, seed, TU, wxNow, V, regenLeft, fAt, rAt, REPORTED } = c;
  if (V.Resting === 'awake') V.Resting = 'none';
  else if (hasB && !toolEdit && V.Resting === 'none' && V.HP > 0 && elapsed >= 300 && elapsed <= DAY_MIN && nightMinutes(absA) - nightMinutes(absB) >= 240
    && !(S.Battle && S.Battle.Active) && (!isOutdoor(S.World.Location) || awayIn(S) || fAt)) {   // 1.38.0: tents in the forest
    const vig = num((((B.$eng || {}).sleep) || {}).vigilUntil, -1) > absB || (S.Consumables || []).some(x => /^the vigil$/i.test(String(x).trim()));
    if (!vig) { V.Resting = 'sleep'; log.push('{{user}} slept through the night (read from the time skip; write Resting "awake" for an all-nighter).'); }
  }
  const restedAs = V.Resting;
  const deadBefore = hasB ? B.Player.Vitals.HP <= 0 : V.HP <= 0;
  const Cn = S.Player.Conditions || (S.Player.Conditions = {});
  if (elapsed > 0 && V.Resting !== 'none') {
    const h = elapsed / 60;
    let stMul = wxNow && Cn.Soaked ? 0.5 : 1;
    if (V.Resting === 'sleep' && wxNow) {
      const [sd, sb] = blockOf(absB), nd = sb === 2 ? sd : Math.floor(absB / DAY_MIN), nb = wxWhere(c.WA, seed, nd, 2);   // the night of the sleep (1.42.0: Sunreach's own)
      stMul *= 1 + (nb.sky === 'Rain' && !nb.snow && nb.rain !== 'heavy' ? 0.1 : 0) - (nb.sky === 'Storm' ? 0.2 : 0) - (nb.temp >= 22 ? 0.1 : 0);
    }
    if (V.Resting === 'sleep') {
      V.Stamina += V.Stamina_max * Math.min(1, h / 6) * stMul;
      if (h >= 6 && V.HP > 0 && !deadBefore && !Object.values(S.Player.Injuries).some(i => i.Severity === 'serious' || i.Severity === 'critical')) V.HP += 5;   // v1.0.3 (F07, D13): no sleeping back from death
    } else {
      V.Stamina += 20 * h * stMul;
    }
  }
  // 1.31.0 (owner-approved planning/DRAFT_restore_places.md): restful places. Resting for the whole elapsed time at one of them
  // (not training, practising, fighting or on a trip) recovers stamina or mana faster; every five minutes take the multiplier of
  // their hour, week and weather. <now> and the map card show the multiplier for where {{user}} is now.
  const RK = placeKey(S.World.Location), RP = RESTFUL[RK], wxOn = c.WXM !== 'off' && !!wxNow, wxc = new Map();
  if (RP && V.Resting === 'rest' && elapsed > 0 && hasB && !toolEdit && placeKey(B.World.Location) === RK && V.HP > 0
    && !(S.Battle && S.Battle.Active) && !awayIn(S) && !(Array.isArray(S.Training) && S.Training.length) && !(Array.isArray(S.Practice) && S.Practice.length)) {
    const C0 = (B.Player || {}).Conditions || {}, cold = !!(C0.Chilled || C0.Soaked);
    let extra = 0;                                                  // minutes of rest beyond the usual, weighted by (multiplier - 1)
    for (let t = absB; t < Math.min(absA, absB + 2 * DAY_MIN); t += 5) extra += (restMult(RP, t, seed, wxOn, cold, wxc)[0] - 1) * Math.min(5, absA - t);
    const add = RP.restores === 'stamina' ? 20 / 60 * extra * (wxNow && Cn.Soaked ? 0.5 : 1) : num(V.Mana_max, 0) / (60 * TU.mana_regen) * extra;
    if (add > 0) { if (RP.restores === 'stamina') V.Stamina += add; else V.Mana += add; log.push(`Restful place (${placeOf(S.World.Location)}): +${Math.round(add)} ${RP.restores} beyond the usual.`); }
    for (const [k, mins] of Object.entries(RP.clears || {})) if (Cn[k] && elapsed >= mins) { delete Cn[k]; S.$ui.toasts.push(`${k}: over`); log.push(`${k} ended: ${mins} minutes at ${placeOf(S.World.Location)}.`); }
  }
  if (RP) { const [mult, why] = restMult(RP, absA, seed, wxOn, !!(Cn.Chilled || Cn.Soaked), wxc); S.$ui.rest = { what: RP.restores, mult, why, usual: RP.usual }; }
  else S.$ui.rest = null;
  V.Mana += regenLeft;                                           // 1.9.4: mana regenerates passively (section 2); resting adds none
  // 1.16.1 (audit B2): a used item takes effect only if {{user}} has it: in the Bag before this reply, added to it in this reply,
  // or bought in this reply (a new Transactions line names it, e.g. a hot drink at a café). Anything else changes nothing.
  if (hasB && Array.isArray(S.Consumables) && S.Consumables.length) {
    const have = new Set([...Object.keys(B.Inventory || {}).filter(k => num((B.Inventory[k] || {}).Qty, 0) > 0), ...Object.keys(S.Inventory || {})].map(itemKey));
    const bought = newLines(((B.Player || {}).Wallet || {}).Transactions, S.Player.Wallet.Transactions).join(' | ').toLowerCase();
    S.Consumables = S.Consumables.filter(c => {
      const k = itemKey(c); if (!k || have.has(k) || bought.includes(k)) return true;
      log.push(`"${String(c).trim()}" was reported used, but {{user}} has none (not in the Bag, not bought in this reply): no effect.`);
      return false;
    });
  }
  updateSleep(S, hasB ? B : null, absB, absA, TU, log);
  const consumed = S.Consumables || [];                         // 1.9.5: item effects are applied with the weather effects (4b)
  S.Consumables = [];
  // 1.12.0 (H2): an item reported used lowers its Qty in the Bag by one per report, unless this update already lowered it.
  // 1.42.0 (audit 1.4): so does a gift (Kind gift or birthday) whose Item {{user}} held in the Bag before this reply
  const IB = (hasB && B.Inventory) || {};
  const gifted = (REPORTED.acts || []).filter(a => /^(gift|birthday)$/i.test(String(a.Kind || '').trim()) && a.Item)
    .map(a => bagKeyOf(IB, a.Item)).filter(k => k && num((IB[k] || {}).Qty, 1) > 0);
  // 1.45.0 (audit 3.4): through the Bag ledger (bagTake), so an item bought in this reply (/Purchases) and used is taken too
  if (hasB && (consumed.length || gifted.length) && _.isPlainObject(S.Inventory)) {
    const usedNow = [...(c.boughtUsed || [])];                 // bought and used at once (3b): never in the Bag
    for (const x of consumed) { const i = usedNow.indexOf(itemKey(x)); if (i >= 0) usedNow.splice(i, 1); else bagTake(c, x, 1); }
    for (const kb of gifted) {
      const k0 = bagKeyOf(S.Inventory, kb), q0 = k0 ? num(S.Inventory[k0].Qty, 0) : 0, k = bagTake(c, kb, 1);
      if (k && num(S.Inventory[k].Qty, 0) < q0) log.push(`${k}: given as a gift, so the Bag holds one less (${S.Inventory[k].Qty} left).`);
    }
  }
  V.Resting = 'none';
  Object.assign(c, { restedAs, Cn, consumed });
}

// ---- 4b. 1.1.0 weather effects (Full, on campus): outdoor exposure -> Soaked / Chilled / Overheated, daily Head cold roll ----
function stepExposure(c) {
  const { S, B, log, hasB, absA, elapsed, dayNo, dayNoB, WXM, seed, TU, wxNow, V, Cn, consumed } = c;
  {
    const xs = _.isPlainObject(S.$eng.wxs) ? S.$eng.wxs : (S.$eng.wxs = {});
    for (const k of ['wet', 'cold', 'hot', 'dry']) if (!(xs[k] >= 0)) xs[k] = 0;
    if (!(xs.exp > -1e9)) xs.exp = -1e9; if (!(xs.hc > -1e9)) xs.hc = -1e9;
    const C0 = (hasB && B.Player && B.Player.Conditions) || {};
    const storyNew = hasB && Object.keys(Cn).some(k => !C0[k] && k !== 'Head cold');   // the story added one (a bucket of water)
    // 1.9.4 (playtest Batch 4): /Exposure reports a direct soaking or freezing (a water or ice hit) as it happens
    const expo = (Array.isArray(S.Exposure) ? S.Exposure : []).map(e => EXPO[(e && e.Kind) || ''] ? { k: EXPO[e.Kind], why: (e.Cause || '').trim() } : null).filter(Boolean);
    S.Exposure = [];
    let hit = false;
    // 1.9.5 (playtest Batch 5): items used this reply (/Consumables) with a shop effect: clear conditions, stamina, timed gear, cold remedy
    const buff = xs.buff = _.isPlainObject(xs.buff) ? _.pickBy(xs.buff, t => t > absA) : {};
    for (const c of consumed) {
      const u = (fxOf(c) || {}).use; if (!u) continue;
      const done = [];
      for (const k of u.clears || []) if (Cn[k]) { delete Cn[k]; done.push(k + ' cleared'); if (k === 'Soaked') xs.wet = 0; if (k === 'Chilled') xs.cold = 0; if (k === 'Overheated') xs.hot = 0; }
      if (u.stamina > 0) { V.Stamina += u.stamina; done.push('+' + u.stamina + ' stamina'); }
      if (u.buff && WXM === 'full') { buff[u.buff] = Math.max(buff[u.buff] || 0, absA + u.mins); done.push(`${u.buff} until ${fromAbs(buff[u.buff]).Time}`); }
      if (u.cure && Cn[u.cure] && xs.hc > dayNo + 1) { xs.hc = dayNo + 1; done.push(u.cure.toLowerCase() + ' ends tomorrow'); }
      if (u.heal) {
        const target = Object.keys(S.Player.Injuries || {}).find(k => String(S.Player.Injuries[k].Severity).toLowerCase() === (u.heal === 'minor' ? 'minor' : 'moderate'));
        if (target) {
          if (u.heal === 'minor') { delete S.Player.Injuries[target]; done.push(`${target} healed`); }
          else { S.Player.Injuries[target].Severity = 'minor'; done.push(`${target} reduced to minor`); }
        }
      }
      if (u.fitting) done.push(`spent as a fitting ${u.fitting} item`);
      if (done.length) { log.push(`${String(c).trim()}: ${done.join(', ')}.`); S.$ui.toasts.push(`${String(c).trim()}: ${done[0]}`); }
    }
    for (const k of Object.keys(C0)) if (!Cn[k]) { if (k === 'Soaked') xs.wet = 0; if (k === 'Chilled') xs.cold = 0; if (k === 'Overheated') xs.hot = 0; if (k === 'Head cold') xs.hc = -1e9; }   // the story removed it
    if (wxNow) {
      const bk = wxNow, gear = gearOf(S.Inventory, buff, absA), since = stamp(S.World);
      const outB = hasB && isOutdoor(B.World.Location), outA = isOutdoor(S.World.Location);
      const o = elapsed > 0 ? (outB && outA ? elapsed : outB || outA ? elapsed / 2 : 0) : 0;
      const add = (k, why) => { if (!Cn[k]) { Cn[k] = { Effect: COND[k], Since: since }; S.$ui.toasts.push(`Condition: ${k}`); log.push(`{{user}} is now ${k} (${why}).`); } };
      // head cold: one roll at the first update of a new day
      if (hasB && dayNo !== dayNoB && !Cn['Head cold']) {
        const p = (xs.exp >= dayNoB ? 0.15 : 0) + (fluOn(seed, dayNo) ? 0.05 : 0) + (pctOf(V.Stamina, V.Stamina_max) < 30 ? 0.05 : 0);
        if (p > 0 && rand01(seed, dayNo, 'hc') < p) { xs.hc = dayNo + rollInt(2, 4, seed, dayNo, 'hcd'); add('Head cold', `for ${xs.hc - dayNo} days`); }
      }
      if (Cn['Head cold'] && xs.hc > -1e9 && dayNo >= xs.hc) { delete Cn['Head cold']; xs.hc = -1e9; S.$ui.toasts.push('Head cold is over'); }
      for (const e of expo) { hit = true; add(e.k, e.why || (e.k === 'Soaked' ? 'a direct soaking' : 'a freezing hit')); }
      const dryProt = gear.waterproof || (gear.umbrella && !bk.wind && bk.sky !== 'Storm');
      xs.wet = o > 0 && wxBad(bk) && !dryProt ? xs.wet + o : 0;
      if (xs.wet >= (wxHeavy(bk) ? 5 : 20)) add('Soaked', gear.umbrella && !gear.waterproof ? 'the wind beat the umbrella' : 'caught out in the ' + (bk.snow ? 'snow' : 'rain'));
      const chillTemp = bk.temp - (bk.wind === 'gale' ? 14 : bk.wind === 'windy' ? 7 : 0);
      xs.cold = o > 0 && chillTemp <= (gear.warm ? -5 : 0) ? xs.cold + o : 0;
      if (xs.cold >= 30 || (Cn.Soaked && o > 0 && chillTemp <= (gear.warm ? 3 : 8))) add('Chilled', `${bk.temp} °C outdoors`);
      // soaked through outdoors at freezing: the chill is immediate (warm gear holds it off until the next minutes outdoors)
      if (Cn.Soaked && !C0.Soaked && outA && chillTemp <= (gear.warm ? -5 : 0)) add('Chilled', `soaked through at ${bk.temp} °C outdoors`);
      xs.hot = o > 0 && bk.temp >= (gear.sun ? 31 : 28) && (bk.sky === 'Clear' || bk.sky === 'Cloudy') ? xs.hot + o : 0;
      if (xs.hot >= 60) add('Overheated', `${bk.temp} °C in the sun`);
      if (o > 0 && (bk.wind === 'gale' || Cn.Chilled || Cn.Overheated)) V.Stamina -= (bk.wind === 'gale' ? TU.gale_stamina : 10) * o / 60;
      xs.dry = outA ? 0 : xs.dry + (outB ? elapsed - o : elapsed);
      if (storyNew || hit) xs.dry = 0;                                  // ...so it lasts its full time from now
      for (const [k, mins] of [['Soaked', 60], ['Chilled', 60], ['Overheated', 30]]) if (Cn[k] && xs.dry >= mins && !(k === 'Chilled' && xs.cold)) { delete Cn[k]; S.$ui.toasts.push(`${k}: over`); }
      if (Cn.Soaked || Cn.Chilled) xs.exp = dayNo;
      if (Cn['Head cold']) V.Stamina = Math.min(V.Stamina, V.Stamina_max * 0.8);
    }
  }
}

// ---- 4c. 1.38.0 (owner-approved planning/DRAFT_outside_maps.md, part 1): the Creature Studies Expedition in the Grand Vast Forest.
// $eng.area.forest (this campaign year's hunt): y, tgt, grade, homes, t (hours spent at each place), hrs (hunt hours searched at each place),
// owe (walking hours the clock has not covered yet), met, caught, carry, res, wen. $ui.area.forest (UI, <now>, the lore gate): on, at,
// seen (places visited, kept across years), hist (each year's result), the target, hours left, walks from here and this update's
// events. The narrator reports a catch with /Expedition/Caught; it counts only after the engine has brought the target in.
function stepExpedition(c) {
  const { S, B, log, jnl, hasB, toolEdit, absA, elapsed, seed, V, restedAs, fAt, fPrev, WXM } = c;
  const R = EXP.rates || {}, Y = num(S.World.Year, 1), U0 = _.isPlainObject(S.$ui.area.forest) ? S.$ui.area.forest : {};
  const F = AR.forest, seen = areaSeen(F, U0), hist = _.isPlainObject(U0.hist) ? _.cloneDeep(U0.hist) : {};
  if (!_.isPlainObject(S.Expedition)) S.Expedition = { Caught: false };
  const ev = expEvent(), onDay = expOnDay(S.World);
  let X = _.isPlainObject(S.$eng.area.forest) && S.$eng.area.forest.y === Y ? S.$eng.area.forest : null;
  if (!ev || (!X && !(onDay && fAt))) { S.$ui.area.forest = { on: false, seen, hist }; S.Expedition.Caught = false; return; }
  if (!X) X = S.$eng.area.forest = { y: Y, tgt: '', grade: '', homes: [], t: {}, hrs: {}, owe: 0, met: 0, caught: 0, carry: 0, res: '', wen: 0 };
  const G = id => EXP.groups[F.PL[id].group] || {};
  const nextDay = DAYS[(DAYS.indexOf(EXP.hunt.day) + 1) % 7];
  const hs = toAbs({ Year: Y, Month: ev.m, Week: ev.w, Day: EXP.hunt.day, Time: EXP.hunt.from }), he = hs + num(EXP.hunt.hours, 24) * 60;
  const back = toAbs({ Year: Y, Month: ev.m, Week: ev.w, Day: nextDay, Time: EXP.hunt.back_by });
  const evs = [];
  // the target: Thursday morning, from Grade III (Years 1-2) or Grade II (Year 3); never from Base Camp or the Old Heart
  if (!X.tgt && absA >= hs && fAt) {
    X.grade = num(S.Player.Profile.Year, 1) >= 3 ? 'II' : 'III';
    const homeOf = b => EXP.places.filter(p => !['base_camp', 'old_heart'].includes(p.id) && (G(p.id)[X.grade] || []).includes(b)).map(p => p.id);
    const pool = _.uniq(EXP.places.flatMap(p => ['base_camp', 'old_heart'].includes(p.id) ? [] : G(p.id)[X.grade] || [])).sort();
    X.tgt = pickOf(pool, seed, Y, 'exp-target'); X.homes = homeOf(X.tgt);
    S.$ui.toasts.push(`Expedition target: ${X.tgt}`);
    log.push(`Creature Studies Expedition: Vallie assigns {{user}}'s group its target, a ${X.tgt} (Grade ${X.grade}). Where it lives is the group's to find out.`);
  }
  // a catch the story reports counts only once the engine has brought the target in
  const Ex = S.Expedition, caughtNow = !!Ex.Caught && !((hasB && B.Expedition) || {}).Caught;
  if (caughtNow && !X.caught) {
    if (X.met && !X.res) { X.caught = 1; X.carry = fAt && fAt !== 'base_camp' ? 1 : 0; X.res = 'caught'; evs.push({ k: 'caught' }); }
    else { Ex.Caught = false; log.push(X.res ? 'The Expedition is already decided; Expedition.Caught was reverted.' : `Expedition.Caught was reverted: the group has not found its ${X.tgt || 'target'} yet. Only <now> brings the target in.`); }
  }
  if (X.caught) Ex.Caught = true;
  // walking and searching: the route's stamina, the hours the clock still owes the walk, then search hours and their rolls
  if (hasB && !toolEdit && elapsed > 0 && fAt && fPrev) {
    const eH = elapsed / 60, wet = WXM !== 'off' && wxBad(areaWx(AR.forest, seed, ...blockOf(absA))), night = expNight(absA);
    const mask = new RegExp(EXP.spore_mask || 'mask', 'i'), masked = Object.keys(S.Inventory || {}).some(k => mask.test(k) && num((S.Inventory[k] || {}).Qty, 1) > 0);
    let search;
    if (fAt !== fPrev) {
      const path = F.path(fPrev, fAt);
      let h = 0, cost = 0;
      for (let i = 1; i < path.length; i++) {
        const [, lh, lm, note] = F.NB[path[i - 1]].find(x => x[0] === path[i]);
        h += lh; cost += lh * num(R.walk_pct, 8) * (note === 'spore' && masked ? 1 : lm);
        if (!seen.includes(path[i - 1])) seen.push(path[i - 1]);
      }
      cost *= (wet ? num(R.rain_mult, 1.25) : 1) * (night ? num(R.night_walk_mult, 1.25) : 1) * (X.carry ? num(R.drag_mult, 1.5) : 1);
      V.Stamina -= cost / 100 * num(V.Stamina_max, 100);
      const avail = eH - h - X.owe; X.owe = Math.max(0, -avail); search = Math.max(0, avail);
      log.push(`Walked ${path.map(id => F.PL[id].name).join(' → ')}: ${h} h on foot, -${Math.round(cost)}% stamina${X.owe ? `; ${r1h(X.owe)} h of the walk are still ahead (searching here starts after that)` : ''}.`);
      evs.push({ k: 'walk', h, cost: Math.round(cost), owe: r1h(X.owe) });
    } else { search = Math.max(0, eH - X.owe); X.owe = Math.max(0, X.owe - eH); }
    if (X.carry && fAt === 'base_camp') X.carry = 0;
    if (restedAs === 'sleep' || restedAs === 'rest' || (S.Battle && S.Battle.Active)) search = 0;
    if (search > 0 && fAt !== 'base_camp') V.Stamina -= search * num(R.search_pct, 3) / 100 * num(V.Stamina_max, 100);
    const t0 = num(X.t[fAt], 0), t1 = t0 + search; X.t[fAt] = Math.round(t1 * 100) / 100;
    const g = G(fAt), beasts = [...(g.IV || []), ...(g.III || []), ...(g.II || [])];
    let rolls = 0, signed = false;
    for (let k = Math.floor(t0) + 1; k <= Math.floor(t1) && rolls < num(R.max_rolls, 12); k++, rolls++) {
      const at = absA - Math.round((t1 - k) * 60), dark = expNight(at), roll = kind => roll100(seed, Y, 'exp', fAt, k, kind);
      if (X.tgt && !X.met && !X.res && at >= hs && at < he) {
        const n = X.hrs[fAt] = num(X.hrs[fAt], 0) + 1;
        if (X.homes.includes(fAt)) {
          const p = Math.min(num(R.target_base, 3) + num(R.target_step, 3) * (n - 1), num(R.target_cap, 24)) * (dark && !(EXP.night_beasts || []).includes(X.tgt) ? num(R.night_mult, 0.5) : 1);
          if (roll('tgt') < p) { X.met = 1; evs.push({ k: 'target', b: X.tgt, n }); continue; }
        } else if (!signed && roll('sign') < num(R.sign, 20)) {
          const home = _.minBy(X.homes, id => (F.routes(fAt)[id] || { w: 99 }).w), path = home ? F.path(fAt, home) : [];
          if (path.length > 1) { signed = true; evs.push({ k: 'sign', b: X.tgt, to: path[1], toName: F.PL[path[1]].name }); }
        }
      }
      const W = EXP.wendigo || {}, wr = fAt === W.where ? num(R.wendigo, 1) : fAt === W.edge ? num(R.wendigo_edge, 0) : 0;
      if (!X.wen && wr && roll('wen') < wr) { X.wen = 1; evs.push({ k: 'wendigo' }); continue; }
      const er = (dark ? num(R.encounter_night, 15) : num(R.encounter, 10)) * num(g.rate, 1), pool = beasts.filter(b => b !== X.tgt);
      if (pool.length && roll('enc') < er) {
        const b = pickOf(pool, seed, Y, 'exp', fAt, k, 'encb');
        evs.push({ k: 'beast', b, g: (g.II || []).includes(b) ? 'II' : (g.III || []).includes(b) ? 'III' : 'IV' });
      }
      if (fAt === 'old_heart' && (g.protected || []).length && roll('prot') < 15) evs.push({ k: 'protected', b: pickOf(g.protected, seed, Y, 'exp', fAt, k, 'protb') });
    }
  }
  if (fAt && !seen.includes(fAt)) seen.push(fAt);
  // the result: a catch is final at once; no catch by the end of the hunt is a failed practical (Creature Studies marked a step down)
  if (X.tgt && !X.res && absA >= he) { X.res = 'failed'; evs.push({ k: 'failed' }); }
  if (X.res && !hist['Y' + Y]) {
    hist['Y' + Y] = { res: X.res, tgt: X.tgt };
    S.Exam_events = [...(Array.isArray(S.Exam_events) ? S.Exam_events : []), { Subject: 'Creature Studies', Shift: X.res === 'caught' ? 1 : -1, Fail: false, Why: `the Creature Studies Expedition (${X.res === 'caught' ? 'brought back' : 'came back without'} the assigned ${X.tgt})` }];
    jnl.push(X.res === 'caught' ? `Creature Studies Expedition: {{user}}'s group brought back its assigned ${X.tgt}.` : `Creature Studies Expedition: {{user}}'s group came back without its assigned ${X.tgt} and failed the practical.`);
    S.$ui.toasts.push(X.res === 'caught' ? `Expedition: ${X.tgt} caught` : 'Expedition: target not found');
  }
  const R0 = fAt ? F.routes(fAt) : {}, left = X.tgt && !X.res ? Math.max(0, Math.round((he - absA) / 6) / 10) : 0;
  S.$ui.area.forest = { on: !!fAt, at: fAt, name: fAt ? F.PL[fAt].name : '', seen, hist, tgt: X.tgt, grade: X.grade, res: X.res, met: X.met, left, hs: absA < hs, back: absA < back,
    here: fAt ? num(X.hrs[fAt], 0) : 0, owe: r1h(X.owe), walks: fAt ? EXP.places.filter(p => p.id !== fAt).map(p => [p.id, p.name, R0[p.id].w]).sort((a, b) => a[2] - b[2]) : [],
    ev: evs, last: hist['Y' + (Y - 1)] || null };
  if (!onDay && !fAt) S.Expedition.Caught = false;
}
const r1h = x => Math.round(num(x, 0) * 10) / 10;

// ---- 4d. 1.39.0 (owner-approved planning/DRAFT_outside_maps.md, part 2): Avalon. $eng.area.avalon: d (the day it holds), owe (walking
// minutes the clock has not covered yet), met (rival students met today), wl (White Line turn-backs today), sc (talent scout day),
// ts (the year Tsubaki was met lost), mm (the year the muster was missed), tsu (when {{user}} met Tsubaki here before she came to
// Halvard). $ui.area.avalon (UI, <now>, the lore gate): on, at, pin, seen (places visited, kept), castle (a Kingdom win shows the castle
// pin), walks to every pin, places nearby, the Crowning Day muster and this update's events.
const avRep = (S, Kind, Why) => { S.Rep_events = [...(Array.isArray(S.Rep_events) ? S.Rep_events : []), { Kind, Why }]; };
function stepCapital(c) {
  const { S, log, jnl, hasB, absA, absB, elapsed, seed, aAt, aPrev, aHeld, dayNo, TU } = c;
  const A = AR.avalon, R = A.R, LX = lifeX(TU), Y = num(S.World.Year, 1), seen = areaSeen(A, S.$ui.area.avalon);
  const castle = (S.$eng.prizes || []).some(p => /^Kingdom-Y\d+$/.test(p));
  if (!_.isPlainObject(S.Avalon)) S.Avalon = { Ride: false };
  const ride = !!S.Avalon.Ride; S.Avalon.Ride = false;
  if (!aAt) {   // the day before a visit: points do not work in Avalon, so <now> reminds the narrator about the Banking House
    const tmr = fromAbs((dayNo + 1) * DAY_MIN + 8 * 60), soon = avCrown(tmr) ? 'Independence Crowning Day' : avKingdom(tmr, S) && !avKingdom(S.World, S) ? 'the Kingdom Competition (the team flies out)' : '';
    S.$ui.area.avalon = { on: false, seen, castle, coin: soon }; if (ride) log.push('Avalon.Ride is only for a hire carriage in Avalon; it was cleared.'); return;
  }
  const X = _.isPlainObject(S.$eng.area.avalon) ? S.$eng.area.avalon : (S.$eng.area.avalon = {});
  if (X.d !== dayNo) Object.assign(X, { d: dayNo, owe: 0, met: [], wl: 0, sc: 0 });
  const crown = avCrown(S.World), kd = !crown && avKingdom(S.World, S), Cr = AV.crowning, evs = [], at = t => dayNo * DAY_MIN + hm(t);
  // the White Line: the Royal Guard turns {{user}} back; a second try the same day is reported (Academy, defied_staff)
  if (aHeld && hasB) {
    X.wl = num(X.wl, 0) + 1; evs.push({ k: 'white', n: X.wl, to: A.PL[aHeld].name });
    log.push(`${A.PL[aHeld].name} is past the White Line, closed to students: the Royal Guard turned {{user}} back${X.wl > 1 ? ' again and reported it to the staff' : ''}. World.Location was kept at ${A.PL[aAt].name}.`);
    if (X.wl === 2) avRep(S, 'defied_staff', 'tried twice to cross the White Line in Avalon');
  }
  // walking, or a hire carriage (Avalon.Ride): half the time, coin, no stamina. On Crowning Day morning the crowds make every leg
  // through Crown Square slower, carriage or not.
  if (hasB && !c.toolEdit && elapsed > 0 && aPrev && A.PL[aPrev] && aPrev !== aAt) areaMove(c, A, X, aPrev, aAt, ride ? 'carriage' : '', crown && absB >= at(Cr.crowd_from) && absB < at(Cr.crowd_to), evs);
  else if (hasB && elapsed > 0) X.owe = Math.max(0, num(X.owe, 0) - elapsed);
  // Tsubaki in Avalon before she comes to Halvard: remembered for when she arrives (stepBonds)
  if ((S.Scene.Present || {}).Tsubaki && Y < (ARRIVES.Tsubaki || 1) && !X.tsu) X.tsu = stamp(S.World);
  // the Crowning Day muster at the Skyport: missing it is a detention's worth of Academy reputation; the airship waits
  let muster = null;
  if (crown) {
    const mAbs = at(Cr.muster), back = A.min(aAt, 'skyport'), split = A.PL[aAt].pin !== A.PL.skyport.pin;
    if (hasB && absA >= mAbs && aAt !== 'skyport' && X.mm !== Y) {
      X.mm = Y; evs.push({ k: 'missed' });
      avRep(S, 'detention', 'missed the Crowning Day muster in Avalon');
      jnl.push('Crowning Day: {{user}} missed the afternoon muster at the Skyport; staff and the Doves had to go looking.');
      S.$ui.toasts.push('Missed the muster');
    }
    muster = { at: Cr.muster, left: Math.max(0, mAbs - absA), back, cab: split ? Math.round(back / 2) : back, missed: X.mm === Y, free: absA >= at(Cr.free) && absA < mAbs };
    muster.warn = muster.left > 0 && muster.left - back <= 30;
  }
  // the city's life, once per hour in Avalon (seeded by the hour and the place, so a swipe sees the same street)
  const Wh = AV.where || {}, inW = k => (Wh[k] || []).includes(aAt), got = new Set();
  areaHours(c, A, aPrev, h => {
    const abs = h * 60, roll = k => areaRoll(c, A, h, aAt, k), pick = (a, k) => pickOf(a, seed, A.salt, h, aAt, k);
    if (crown && (abs < at(Cr.free) || abs >= at(Cr.depart))) return;   // the parade and the speech; then the airship
    areaTheft(c, A, h, aAt, got, evs);
    if (inW('procession') && roll('proc') < num(R.procession, 10) * LX) evs.push({ k: 'procession', t: pick(AV.procession || [''], 'proct') });
    areaStreet(c, A, h, aAt, (AV.street || {})[aAt], got, evs);
    if (crown && X.ts !== Y && inW('tsubaki') && roll('tsu') < num(R.tsubaki, 10)) { X.ts = Y; evs.push({ k: 'tsubaki', first: Y < (ARRIVES.Tsubaki || 1) }); }
    else if ((crown ? inW('rival_crowning') : kd && inW('rival_kingdom')) && roll('riv') < num(R.rival, 25) * LX) {
      const pool = Object.keys(AV.rivals || {}).filter(id => AV.rivals[id] + Y - 1 <= 3 && !(X.met || []).includes(id) && !AWAY_RX.test(npcStatusIn(S, id))).sort();
      if (pool.length) { const id = pick(pool, 'rivp'); X.met = [...(X.met || []), id]; evs.push({ k: 'rival', id }); }
    }
    if (kd && !X.sc && ['Thu', 'Fri', 'Sat'].includes(S.World.Day) && inW('scout') && (S.Competition || {}).Status !== 'eliminated' && roll('scout') < num(R.scout, 15)) { X.sc = 1; evs.push({ k: 'scout' }); }
    if (inW('raid') && roll('raid') < num(R.raid, 5)) {
      const caught = roll('resc') >= num(R.raid_escape, 60); evs.push({ k: 'raid', caught });
      if (caught) { avRep(S, 'detention_tower', 'caught in the Rookery during a City Watch raid in Avalon'); jnl.push('Avalon: {{user}} was caught in the Rookery in a City Watch raid; the staff were sent for.'); S.$ui.toasts.push('Caught in a raid'); return false; }
    }
  });
  for (const id of [aPrev, aAt]) if (id && A.PL[id] && !seen.includes(id)) seen.push(id);
  const pass = avPass(S);
  S.$ui.area.avalon = { on: true, at: aAt, name: A.PL[aAt].name, ...areaNear(A, aAt, p => !p.locked || pass, p => (!p.locked || pass) && (!p.hidden || seen.includes(p.id))),
    seen, castle, pass, crown, kd, owe: num(X.owe, 0), muster, ev: evs };
}

// 1.40.0 (owner-approved planning/DRAFT_airship.md): aboard the airship. A hot bath on the Cabin Deck ends Soaked and Chilled; once
// per hour in the air a moment in the sky (the route's pool, or the way home's), and in the Common Room the stage, in the Cargo Hold
// the hold (seeded by the flight and the hour, so a swipe sees the same flight). Outside a flight: whether one leaves within 90 min.
function stepAirship(c) {
  const { S, log, hasB, toolEdit, elapsed, seed, Cn, sAt, sPrev, sFl, sBoard, TU } = c;
  if (!sAt) {
    const t = hm(S.World.Time), nx = t == null ? null : (AIR.flights || []).find(f => f.m === num(S.World.Month, 0) && f.w === num(S.World.Week, 0) && f.d === S.World.Day
      && hm(f.from) > t && hm(f.from) - t <= 90 && (f.who !== 'kingdom' || avKingdom(S.World, S)));
    S.$ui.area.airship = nx ? { on: false, soon: { event: nx.event, from: nx.from, lands: nx.lands } } : { on: false };
    return;
  }
  const R = AIR.rates || {}, Bt = AIR.bath || {}, fid = `${num(S.World.Year, 1)}-${sFl.id}`, route = sFl.dir === 'home' ? 'home' : sFl.route, evs = [];
  if (hasB && !toolEdit && sAt === Bt.place && sPrev === Bt.place && elapsed >= num(Bt.min, 10) && new RegExp(Bt.words || 'bath', 'i').test(S.World.Location))
    for (const k of Bt.clears || []) if (Cn[k]) { delete Cn[k]; S.$ui.toasts.push(`${k}: over`); log.push(`${k} ended: a hot bath in the airship's bathing stalls.`); }
  const got = new Set();   // 1.46.0 (audit 3.1): the area's hourly loop; the airship's rolls are seeded by the flight, not the place
  areaHours(c, AR.airship, sPrev, h => {
    for (const [k, pool, ok] of [['sky', (AIR.sky || {})[route], true], ['stage', AIR.stage, sAt === 'common_room'], ['hold', AIR.hold, sAt === 'cargo_hold']]) {
      const t = ok && !got.has(k) ? rollTable(pool, { roll: [seed, AR.airship.salt, fid, h, k], pct: num(R[k], 0) * lifeX(TU), pick: [seed, AR.airship.salt, fid, h, k + 't'] }) : null;
      if (t !== null) { got.add(k); evs.push({ k, t }); }
    }
  });
  const t = hm(S.World.Time), a = hm(sFl.from), b = hm(sFl.to), key = `${sFl.route}_${sFl.dir}`;
  S.$ui.area.airship = { on: true, at: sAt, name: AR.airship.PL[sAt].name, event: sFl.event, from: sFl.from, to: sFl.to, lands: sFl.lands, left: Math.max(0, b - t), bar: !!sFl.bar,
    board: sBoard, view: sAt === 'promenade_deck' ? ((AIR.views || {})[key] || [])[Math.min(2, Math.floor((t - a) * 3 / Math.max(1, b - a)))] || '' : '',
    cargo: sAt === 'cargo_hold' ? (AIR.cargo || {})[key] || '' : '', near: AIR.places.filter(p => p.id !== sAt).map(p => p.name), ev: evs };
}

// 1.41.0 (owner-approved planning/DRAFT_outside_maps.md, part 3): Sunreach Bay. Walking (5% stamina an hour), a horse carriage
// ("carriage") or a water taxi ("boat", both ends on the shore): half the time, coin, no stamina; the tour boat to the Open Sea has
// its own minutes and fare. A bet (Sunreach.Bet) counts only at The Golden Tide and the engine settles it. Once an hour (seeded by
// the hour and the place; not asleep): a street sight, a hustler, one student of another academy and one of Halvard who would be
// there by personality (not met today, not in the scene), the sea and once in a Trip the Leviathan far off. Outside: the day before.
function stepSunreach(c) {
  const { S, log, jnl, hasB, absA, elapsed, seed, rPrev, dayNo, TU } = c;
  const A = AR.sunreach, R = A.R, LX = lifeX(TU), Y = num(S.World.Year, 1), seen = areaSeen(A, S.$ui.area.sunreach);
  let at = c.rAt;
  if (!_.isPlainObject(S.Sunreach)) S.Sunreach = { Ride: '', Bet: { Game: '', Stake: 0 } };
  const ride = String(S.Sunreach.Ride || '').toLowerCase(), bet = _.isPlainObject(S.Sunreach.Bet) ? S.Sunreach.Bet : {};
  S.Sunreach.Ride = ''; S.Sunreach.Bet = { Game: '', Stake: 0 };
  const betAsked = !!(String(bet.Game || '').trim() || num(bet.Stake, 0));
  if (!at) {   // the day before the Trip: points do not work abroad (the Banking House)
    const tmr = fromAbs((dayNo + 1) * DAY_MIN + 8 * 60), Wn = SR.window;
    S.$ui.area.sunreach = { on: false, seen, coin: tmr.Month === Wn.m && tmr.Week === Wn.from[0] && tmr.Day === Wn.from[1] ? 'the Academy Trip to Sunreach Bay' : '' };
    if (ride) log.push('Sunreach.Ride is only for a carriage or a water taxi in Sunreach Bay; it was cleared.');
    if (betAsked) log.push('Sunreach.Bet counts only at The Golden Tide in Sunreach Bay; it was cleared.');
    return;
  }
  const X = _.isPlainObject(S.$eng.area.sunreach) ? S.$eng.area.sunreach : (S.$eng.area.sunreach = {});
  if (X.d !== dayNo) Object.assign(X, { d: dayNo, owe: 0, met: [] });
  const evs = [], coinNow = () => num(S.Player.Wallet.Coin, 0);
  // moving: inside a pin a few minutes; between pins the route, on foot or by carriage or water taxi; the Open Sea by tour boat only
  if (hasB && !c.toolEdit && elapsed > 0 && rPrev && A.PL[rPrev] && rPrev !== at) {
    const want = /boat|water|taxi/.test(ride) ? 'boat' : /carriage|cab|horse|coach/.test(ride) ? 'carriage' : '';
    if (!areaMove(c, A, X, rPrev, at, want, false, evs)) { at = rPrev; S.World.Location = areaLoc(A, '', at); }
  } else if (hasB && elapsed > 0) X.owe = Math.max(0, num(X.owe, 0) - elapsed);
  // a bet at The Golden Tide: the engine settles it (never the narrator)
  if (betAsked) {
    const game = String(bet.Game || '').trim().toLowerCase(), G = (SR.games || {})[game], stake = Math.round(num(bet.Stake, 0));
    if (at !== 'golden_tide') log.push('Sunreach.Bet counts only at The Golden Tide; it was cleared.');
    else if (!G) log.push(`Sunreach.Bet: "${bet.Game}" is not a game at The Golden Tide (dice, cards or wheel); no bet.`);
    else if (stake <= 0 || stake > num(R.bet_max, 200)) log.push(`Sunreach.Bet: the house takes 1 to ${num(R.bet_max, 200)} coin a bet; no bet.`);
    else if (stake > coinNow()) log.push(`Sunreach.Bet: {{user}} has ${coinNow()} coin, less than the stake; no bet.`);
    else {
      X.nb = num(X.nb, 0) + 1;
      const win = roll100(seed, 'srbet', absA, X.nb) < G.win, net = win ? stake * (G.pay - 1) : -stake;
      ledger(c, 'Coin', net, `${win ? 'won' : 'lost'} at ${game}, The Golden Tide`);
      evs.push({ k: 'bet', game, stake, win, net });
      S.$ui.toasts.push(`${_.capitalize(game)}: ${win ? 'won' : 'lost'} ${Math.abs(net)} coin`);
    }
  }
  // the city, once an hour
  const present = new Set(Object.keys((S.Scene || {}).Present || {})), PV = presenceNow(S);
  const M = SR.meet || {}, got = new Set();
  areaHours(c, A, rPrev && at === c.rAt, h => {
    const nt = srNight(h * 60) ? 1 : 0, roll = k => areaRoll(c, A, h, at, k), pick = (a, k) => pickOf(a, seed, A.salt, h, at, k);
    areaStreet(c, A, h, at, ((SR.street || {})[at] || [])[nt], got, evs);
    areaTheft(c, A, h, at, got, evs);
    const meetOne = (kind, who, ok) => {
      if (got.has(kind) || roll(kind) >= num(R[kind], 0) * LX) return;
      const pool = Object.keys(who || {}).filter(id => (who[id][nt] || []).includes(at) && ok(id) && !X.met.includes(id) && !present.has(id)).sort();
      if (!pool.length) return;
      const id = pick(pool, kind + 'p'); got.add(kind); X.met = [...X.met, id]; evs.push({ k: kind, id });
    };
    meetOne('rival', M.rivals, id => AV.rivals[id] !== undefined && AV.rivals[id] + Y - 1 <= 3 && !AWAY_RX.test(npcStatusIn(S, id)));
    meetOne('student', M.halvard, id => !!STUDENTS[id] && yearOf(id, Y) <= 3 && !npcOut(PV, S, id));   // 1.47.0 (audit 3.8): whereabouts
    if (at === 'open_sea') {
      if (X.lev !== Y && roll('lev') < num(R.leviathan, 5)) {
        X.lev = Y; got.add('sea'); evs.push({ k: 'leviathan', t: SR.leviathan });
        jnl.push('Sunreach Bay: out on the open sea, {{user}} saw the Leviathan, far off, and the boat turned for home.'); S.$ui.toasts.push('The Leviathan!');
      } else if (!got.has('sea') && roll('sea') < num(R.sea, 50) * LX) { got.add('sea'); evs.push({ k: 'sea', t: pick(SR.sea || [''], 'seat') }); }
    }
  });
  for (const id of [rPrev, at]) if (id && A.PL[id] && !seen.includes(id)) seen.push(id);
  const W = S.World, tnow = hm(W.Time);
  const today = (SR.schedule || []).filter(([w, d, t]) => num(W.Month, 0) === SR.window.m && num(W.Week, 0) === w && W.Day === d && hm(t) >= tnow).map(([, , t, what]) => [t, what]);
  S.$ui.area.sunreach = { on: true, at, name: A.PL[at].name, ...areaNear(A, at, () => true, () => true), night: srNight(absA), seen, owe: num(X.owe, 0), off: !!A.PL[at].off, today, ev: evs, coin: '' };
}

// ---- 4g. 1.47.0 (audit 3.2): the campus as an Area. A move between two campus places since the last update is walked the shortest
// way on the Campus Map: the minutes the clock has not spent yet are owed (shown in <now> until spent, forgiven below rates.owe_min,
// cleared at midnight), and a walk of rates.far_min or more costs rates.walk_pct stamina an hour (data/campus.json). $ui.area.campus:
// where {{user}} is, the walks to the nearest map pins (and {{user}}'s own dorm) and to the places close by, the minutes still owed.
function stepCampus(c) {
  const { S, B, hasB, toolEdit, elapsed, log, V, dayNo } = c;
  const A = AR.campus, E = S.$eng.area, X = E.campus = _.isPlainObject(E.campus) ? E.campus : { d: dayNo, owe: 0 };
  if (X.d !== dayNo) Object.assign(X, { d: dayNo, owe: 0 });
  const at = areaNow(S) === 'campus' && !awayIn(S) ? campusPlace(S.World.Location) : '';
  if (!at) { X.owe = 0; S.$ui.area.campus = { on: false }; return; }
  const was = hasB && !toolEdit && areaNow(B) === 'campus' && !awayIn(B) ? campusPlace(B.World.Location) : '';
  const w = was ? campusWalk(S, B.World.Location, S.World.Location) : null, minOwe = num(CR.owe_min, 5);
  if (w && w.min > 0) {
    const cost = w.min >= num(CR.far_min, 15) ? w.min / 60 * num(CR.walk_pct, 5) : 0;
    if (cost) V.Stamina -= cost / 100 * num(V.Stamina_max, 100);
    X.owe = Math.max(0, Math.round(w.min + num(X.owe, 0) - elapsed));
    if (X.owe < minOwe) X.owe = 0;
    if (cost || X.owe) log.push(`Walked ${A.PL[w.a].name} → ${A.PL[w.b].name}: ${w.min} min on foot${cost ? `, -${Math.round(cost)}% stamina` : ''}${X.owe ? `; ${X.owe} min of the way are still ahead (the clock moved ${Math.round(elapsed)})` : ''}.`);
  } else if (hasB && elapsed > 0) { X.owe = Math.max(0, num(X.owe, 0) - elapsed); if (X.owe < minOwe) X.owe = 0; }
  const node = campusNode(S, at), R0 = A.routes(node), mins = ids => Math.min(...ids.map(id => (R0[id] || { w: 999 }).w));
  const own = CAMPUS_MAP.dorms[(S.Player.Profile || {}).Dorm];
  const pins = CAMPUS_MAP.map.filter(([, ids]) => ids.length && !ids.includes(node)).map(([nm, ids]) => [nm, mins(ids), ids.includes(own)]).sort((a, b) => a[1] - b[1]);
  const nWalks = num(CR.walks_listed, 10), walks = pins.filter((p, i) => i < nWalks || p[2]).map(([nm, m]) => [nm, m]);
  const mine = CAMPUS_MAP.map.find(([, ids]) => ids.includes(node)) || ['', []];
  const near = mine[1].filter(id => id !== node).map(id => [A.PL[id].name, R0[id].w]).sort((a, b) => a[1] - b[1]).slice(0, 5);
  S.$ui.area.campus = { on: true, at, name: A.PL[at].name, pin: mine[0], walks, near, owe: X.owe };
  c.campusOwe = X.owe;
}

// ---- 5. vitals ----
function stepVitals(c) {
  const { S, B, log, hasB, V } = c;
  if (hasB) {
    const dmg = B.Player.Vitals.HP - V.HP;
    if (dmg > 40 && !V.Lethal_flag) { V.HP = B.Player.Vitals.HP - 40; log.push(`HP loss capped at 40 (no lethal flag): HP ${Math.round(V.HP)}.`); }
    if (V.HP <= 0 && B.Player.Vitals.HP > 0) log.push('{{user}} has died.');
  }
  // 1.30.0: Formidable (Prowess Rank 5): once a week, the worst new injury from a fight lands one step lighter
  if (hasB && !c.OFF.has('proficiency') && profRankOf(B, 'Prowess') >= MASTERY && ((B.Battle || {}).Active || (S.Battle || {}).Active)) {
    const P = S.$eng.prof || {}, MS = P.mastery = _.isPlainObject(P.mastery) ? P.mastery : {}, week = Math.floor(Math.floor(toAbs(S.World) / DAY_MIN) / 7);
    const SEV = ['minor', 'moderate', 'serious', 'critical'], I = S.Player.Injuries || {}, BI = B.Player.Injuries || {};
    const k = Object.keys(I).filter(x => !BI[x] && SEV.indexOf(String(I[x].Severity).toLowerCase()) > 0).sort((a, b) => SEV.indexOf(String(I[b].Severity).toLowerCase()) - SEV.indexOf(String(I[a].Severity).toLowerCase()))[0];
    if (k && _.isPlainObject(P) && MS.fight !== week) {
      MS.fight = week;
      const was = String(I[k].Severity).toLowerCase(); I[k].Severity = SEV[SEV.indexOf(was) - 1];
      log.push(`Formidable: ${k} lands one step lighter (${was} -> ${I[k].Severity}); once a week.`);
    }
  }
  V.Lethal_flag = false;
  V.HP = _.clamp(V.HP, 0, V.HP_max); V.Stamina = _.clamp(V.Stamina, 0, V.Stamina_max); V.Mana = _.clamp(V.Mana, 0, V.Mana_max);
  {                                                              // 1.9.4: the display keeps 0.1; the rounding remainder carries to the next turn
    const exact = V.Mana + (V.Mana > 0 && V.Mana < V.Mana_max ? num(S.$eng.mrem, 0) : 0);
    V.Mana = _.clamp(Math.round(exact * 10) / 10, 0, V.Mana_max);
    S.$eng.mrem = V.Mana > 0 && V.Mana < V.Mana_max ? Math.round((exact - V.Mana) * 1e6) / 1e6 : 0;
  }
  const hp = pctOf(V.HP, V.HP_max), st = pctOf(V.Stamina, V.Stamina_max);
  V._Condition = V.HP <= 0 ? 'Dead' : hp <= 30 ? 'Unconscious / Critical' : hp <= 50 ? 'Badly Injured' : hp <= 70 ? 'Hurt' : hp <= 90 ? 'Bruised' : 'Healthy';
  V._Fatigue = V.Stamina <= 0 ? 'Collapsed' : st <= 30 ? 'Exhausted' : st <= 70 ? 'Tired' : 'Fresh';
  S.$ui.training = Object.values(S.Player.Injuries).some(i => /moderate|serious|critical/.test(i.Severity)) ? 'Injured' : /Exhausted|Collapsed/.test(V._Fatigue) ? 'Too tired to train' : '';
  if (hasB && B.Player.Vitals._Condition !== V._Condition) S.$ui.toasts.push(`Condition: ${V._Condition}`);
}

// ---- 5b. 1.3.0 reputation: Academy (staff and the institution), Student (the student body), Doves (the Dovecote). Signed Rep XP
// (engine-owned, in $xp) sets the level -5..+5. The narrator reports what earned or cost reputation in /Rep_events: repeatable
// triggers are capped at REP.weekly_cap a week per reputation, events and losses are not. Bond milestones and high Tension are
// counted by the engine (§6). A pre-1.3.0 save's Public / Dorm meters became Academy / Student XP in stepMigrate.
function stepReputation(c) {
  const { S, B, log, jnl, hasB, dayNo, goneNow, dayNoB, TU, notes } = c;
  const RP = S.Player.Profile.Reputation || (S.Player.Profile.Reputation = {});
  const RPB = hasB ? ((((B.Player || {}).Profile || {}).Reputation) || {}) : null;
  const rx = {};
  for (const r of REP.reps) rx[r] = _.clamp(num(((RPB && RPB.$xp) || RP.$xp || {})[r], 0), -REP.thresholds[4], REP.thresholds[4]);
  delete RP.Public; delete RP.Dorm;
  const weekNo = Math.floor(dayNo / 7), weekNoB = Math.floor(dayNoB / 7);
  const repw = _.isPlainObject(S.$eng.repw) && S.$eng.repw.w === weekNo ? S.$eng.repw : { w: weekNo };
  const repLv = r => repLevel(rx[r]);
  // cap: 'week' (repeatable), 'bond' (only below bond_cap_level), '' (event or loss)
  const repAdd = (r, x, why, cap) => {
    if (!REP.reps.includes(r) || !x) return 0;
    if (cap === 'bond' && !TU.rep_bond) return 0;
    if (cap === 'bond' && x > 0 && TU.rep_bond === 1 && repLv(r) >= REP.bond_cap_level) { log.push(`${r} reputation is already +${repLv(r)}: bond milestones add no more (${why}).`); return 0; }
    if (TU.rep_mult !== 1) x = Math.sign(x) * Math.max(1, Math.round(Math.abs(x) * TU.rep_mult));
    if (cap === 'week' && x > 0 && TU.rep_week > 0) {
      const room = Math.max(0, TU.rep_week - num(repw[r], 0));
      if (x > room) log.push(`${r} reputation: the weekly limit for everyday deeds (+${TU.rep_week}) is reached${room ? `; +${room} of +${x} counted` : ''} (${why}).`);
      x = Math.min(x, room); repw[r] = num(repw[r], 0) + x;
      if (!x) return 0;
    }
    const was = rx[r];
    if (r === 'Academy' && x < 0) S.$eng.wkloss = weekNo;   // 1.10.0: no clean week after this
    rx[r] = _.clamp(was + x, -REP.thresholds[4], REP.thresholds[4]);
    return rx[r] - was;
  };
  // one level up at once (Ruby, Baelin; Kuroo and Milena's tokens only below 0): Rep XP goes to where the next level begins
  const repLevelUp = (r, onlyNegative) => {
    const L = repLv(r);
    if (L >= 5 || (onlyNegative && L >= 0)) return false;
    rx[r] = Math.max(rx[r], repFloor(L + 1)); return true;
  };
  const vouchMonth = `Y${S.World.Year}M${S.World.Month}`, usedVouch = new Set();
  const vouchLedger = S.$eng.vouch = _.isPlainObject(S.$eng.vouch) ? S.$eng.vouch : {};
  const CP = REP.competition || {}, compKinds = new Set(Object.values(CP.pay || {}));
  // 1.53.0 (narrator-load audit U7): a deed whose other side always comes with it (REP.also) brings that side itself, unless reported
  const REV = Array.isArray(S.Rep_events) ? S.Rep_events.filter(e => e && typeof e === 'object') : [], kindOf = e => String(e.Kind || '').trim().toLowerCase();
  for (const [a, b] of Object.entries(REP.also || {})) {
    const extra = REV.filter(e => kindOf(e) === a).length - REV.filter(e => kindOf(e) === b).length;
    REV.filter(e => kindOf(e) === a).slice(0, Math.max(0, extra)).forEach(e => REV.push({ Kind: b, Why: e.Why || '' }));
  }
  for (const e of REV) {
    const kind = String(e.Kind || '').trim().toLowerCase(), deed = (REP.deeds || {})[kind];
    if (compKinds.has(kind)) { log.push(`Reputation deed "${kind}" is paid by the engine from Competition (Tier and Status); it was not counted here.`); continue; }
    if (kind === 'founded_club') { log.push('Reputation deed "founded_club" is paid by the engine when Campus_State.Founded_club is founded; it was not counted here.'); continue; }   // 1.75.0
    if (!deed && kind && !['repeat', 'event'].includes(kind)) { log.push(`Reputation deed "${kind}" is unknown; use a listed Kind or an explicit repeat/event entry.`); continue; }
    const r = deed ? deed[0] : REP.reps.find(x => x.toLowerCase() === String(e.Rep || '').trim().toLowerCase());
    if (!r) { log.push(`Reputation "${e.Rep}" is unknown (use Academy, Student or Doves); nothing was changed.`); continue; }
    let x = deed ? deed[1] : Math.round(num(e.XP, 0));
    if (x < 0 && e.Why) {
      const a = (S.Interactions || []).find(a => {
        const id = NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With, b = S.Bonds[id];
        return a.Kind === 'vouch' && a.Public && String(a.Rep || '').toLowerCase() === r.toLowerCase() && a.Why === e.Why
          && b && b.Rank >= 9 && b.Trust >= trustGate(id, 9) && b.Tension < 70 && S.Scene.Present[id]
          && !goneNow(id) && vouchLedger[id] !== vouchMonth && !usedVouch.has(id);
      });
      if (a) { const id = NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With, saved = Math.min(5, -x); x += saved;
        vouchLedger[id] = vouchMonth; usedVouch.add(id); log.push(`${id} vouched for {{user}} in the ${r} matter (${e.Why}): reputation loss reduced by ${saved} XP.`); }
    }
    if (S.World.Month === 10 && S.World.Week === 3 && S.World.Day === 'Sat' && r === 'Student' && x > 0 && (kind === 'club_time' || (kind !== 'event' && /\bclub\b/i.test(String(e.Why || ''))))) {
      log.push('Saturday club attendance earns no reputation during the Student Council election; the election replaced club time.');
      continue;
    }
    repAdd(r, x, e.Why || kind || 'story', deed ? deed[2] : x > 0 && kind !== 'event' ? 'week' : '');
  }
  S.Rep_events = [];
  // 1.44.0 (audit 3.13): a competition result pays its deed itself, once a year each (REP.competition.pay). A title has a price:
  // the staff expect {{user}} to defend it, and the next elimination at that tier or below costs Academy Rep XP (expect). The
  // team's result at a tier also brings each teammate bond XP once a year (teamBond, given in stepBonds).
  let teamBond = null;
  const Co = S.Competition || {}, Co0 = (hasB && B.Competition) || {};
  if (hasB && Co.Tier && Co.Status && (Co.Status !== Co0.Status || Co.Tier !== Co0.Tier)) {
    const K = S.$eng.comp = _.isPlainObject(S.$eng.comp) ? S.$eng.comp : {}, y = S.World.Year || 1, T = CP.tiers || [];
    K.paid = Array.isArray(K.paid) ? K.paid : [];
    const paidOnce = key => (K.paid.includes(key) ? false : (K.paid = [...K.paid, key].slice(-30), true));
    const kind = (CP.pay || {})[`${Co.Tier}:${Co.Status}`], deed = kind && (REP.deeds || {})[kind];
    if (deed && paidOnce(`${kind}-Y${y}`)) { const got = repAdd(deed[0], deed[1], `${Co.Tier} Competition`, ''); log.push(`${Co.Tier} Competition ${Co.Status}: ${deed[0]} reputation ${got >= 0 ? '+' : ''}${got} Rep XP (${kind}).`); }
    const cost = num((CP.expect || {})[Co.Tier], 0);
    if (Co.Status === 'champion' && cost && (!K.exp || T.indexOf(Co.Tier) >= T.indexOf(K.exp.tier))) {
      K.exp = { tier: Co.Tier, cost };
      log.push(`${Co.Tier} title: the staff now expect {{user}} to defend it; teachers and coaches hold {{user}} to it, and the next elimination at the ${Co.Tier} tier or below costs Academy reputation.`);
    } else if (Co.Status === 'eliminated' && K.exp && T.indexOf(Co.Tier) <= T.indexOf(K.exp.tier)) {
      const got = repAdd('Academy', K.exp.cost, `eliminated after the ${K.exp.tier} title`, '');
      log.push(`Eliminated after the ${K.exp.tier} title: the staff expected more. Academy reputation ${got} Rep XP.`); K.exp = null;
    }
    if (['qualified', 'eliminated', 'champion'].includes(Co.Status) && num(CP.team_xp, 0) > 0 && paidOnce(`team:${Co.Tier}-Y${y}`))
      teamBond = { tier: Co.Tier, xp: num(CP.team_xp, 0), ids: new Set((Co.Team || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x)) };
  }
  const repSync = announce => {
    for (const r of REP.reps) {
      const L = repLevel(rx[r]), L0 = RPB ? num(RPB['_' + r], 0) : L;
      RP['_' + r] = L;
      if (announce && hasB && L !== L0) {
        const t = `${r} reputation ${L > L0 ? 'rose' : 'fell'} to ${L > 0 ? '+' : ''}${L}`;
        S.$ui.toasts.push(t); notes.push(t + '.'); log.push(`${t}: ${repBand(r, L)}`);
        if (_.isPlainObject(S.$eng.wk)) (S.$eng.wk.rep = S.$eng.wk.rep || []).push(`${r} ${L > 0 ? '+' : ''}${L}`);   // 1.10.0 recap
      }
    }
    RP.$xp = { ...rx };
  };
  repSync(false);
  Object.assign(c, { weekNo, weekNoB, repw, repLv, repAdd, repLevelUp, repSync, teamBond });
}

// ---- 5c. 1.9.8 Fortune roll (owner-approved planning/DRAFT_outside_presets.md A1). One seeded d100 per update, shown in <now>
// for the next reply: swipes of that reply re-run from this same state, so they all see the same number (no reroll by swipe).
// The narrator uses it only for an important, uncertain attempt by {{user}} (rule 504), adding these standing modifiers and the
// situation's own (fitting magic, cover, an alert opponent). Bands come from Settings (Gentle by default).
// 1.11.1 (bug hunt): a player-tool edit (Builder, Settings, calendar note) is not a story turn: it keeps the roll, so editing
// a setting and swiping cannot reroll it (the edit is inserted before the last reply since 1.9.1)
function stepFortune(c) {
  const { S, B, hasB, toolEdit, OFF, absA, seed, TU, V, M, repLv } = c;
  S.$eng.turn = hasB ? num((B.$eng || {}).turn, 0) + (toolEdit ? 0 : 1) : num(S.$eng.turn, 0);
  if (OFF.has('fortune')) S.$ui.fortune = null;
  else {
    const band = { 1: [10, 35], 2: [20, 50], 3: [30, 65] }[TU.fortune_band] || [10, 35];
    const mods = [], Cn2 = S.Player.Conditions || {}, sev = Object.values(S.Player.Injuries || {}).map(i => i.Severity);
    for (const [k, x] of [['Chilled', -10], ['Soaked', -5], ['Overheated', -5], ['Head cold', -5]]) if (Cn2[k]) mods.push(`${k} ${x}`);
    if (V._Fatigue === 'Exhausted') mods.push('Exhausted -15'); else if (V._Fatigue === 'Tired') mods.push('Tired -5');
    if (sev.some(x => /serious|critical/.test(x))) mods.push('seriously injured -20'); else if (sev.includes('moderate')) mods.push('injured -10');
    if (S.$ui.sleep && S.$ui.sleep.loss >= 0.2 && !S.$ui.sleep.flavor) mods.push('short on sleep -5');
    for (const [r, who] of [['Academy', 'staff'], ['Student', 'students'], ['Doves', 'Doves']]) { const L = repLv(r); if (L) mods.push(`with ${who} ${L > 0 ? '+' : ''}${L * 5}`); }
    const active = Object.entries(M.Active || {}).map(([k, e]) => e.Technique && e.Technique !== k ? `${k} (${e.Technique})` : k);
    S.$ui.fortune = { roll: d100(seed, 'fortune', S.$eng.turn, absA), fail: band[0], part: band[1], mods, active };
  }

  // 1.16.1 (audit B5): Rank 10 benefits suspended by low Trust, from the Trust before this reply, for the sections before the
  // bonds (exam perks); recomputed after the bonds for the rest
  S.$ui.tsusp = tsuspOf(S, (hasB && B.Bonds) || S.Bonds);
}

// ---- 5d. 1.10.0 (owner-approved planning/DRAFT_batch_fp7_fp11.md, Batch 1): FP7 attendance, FP10 weekly recap, FP12 small scenes ----
function stepSchoolWeek(c) {
  const { S, B, log, jnl, hasB, byBuilder, OFF, REPORTED, absB, absA, elapsed, evs, dayNo, goneNow, dayNoB, seed, TU, V, restedAs, weekNo, weekNoB, repLv, repAdd, notes } = c;
  {
    const Pf = S.Player.Profile, PY = _.clamp(num(Pf.Year, 1), 1, 3), pts = x => num(((x || {}).Wallet || {}).Points, 0);
    let WK = _.isPlainObject(S.$eng.wk) ? S.$eng.wk : null;
    // week rollover: FP7 clean week and FP10 recap for the week that ended, then a fresh tally
    if (!WK || WK.w !== weekNo) {
      if (hasB && WK && WK.w === weekNoB) {
        const parts = [...(WK.ranks || []), ...(WK.rep || []).map(x => 'reputation ' + x)];
        if (!OFF.has('attendance') && num(WK.periods, 0) > 0 && !num(WK.skipped, 0) && S.$eng.wkloss !== weekNoB) {
          repAdd('Academy', 2, 'a clean week', 'week'); parts.push('a clean week');
        }
        if (num(WK.skipped, 0)) parts.push(`skipped ${WK.skipped} class${WK.skipped > 1 ? 'es' : ''}`);
        const net = pts(B.Player) - num(WK.p0, pts(B.Player)) - num(WK.pay, 0);   // monthly payouts excluded
        if (Math.abs(net) >= 300) parts.push(`points ${net > 0 ? '+' : ''}${net.toLocaleString('en')} net`);
        if (!OFF.has('recap') && (parts.length || TU.recap_mode === 2)) {
          const Wd = fromAbs(weekNoB * 7 * DAY_MIN);
          notes.push(`Week recap (M${Wd.Month} W${Wd.Week}): ${parts.length ? parts.join('; ') : 'a quiet week'}.`);
        }
      }
      WK = S.$eng.wk = { w: weekNo, p0: hasB ? pts(B.Player) : pts(S.Player), ranks: [], rep: [], skipped: 0, periods: 0 };
    }
    // FP7: minutes in or away from the room of each class period this update overlapped (the location at the start and the end
    // of the update each count for half). Long skips (over six hours) are assumed to follow the routine.
    S.$ui.absent = null;
    // 1.33.0: today's free periods (a teacher cannot come), for <now> (505)
    {
      const Wt = S.World, row = CLASS.tt && CLASS.tt[Wt.Day];
      const fr = (row || []).map((cell, p) => { if (!cell || cell[3] !== 'class') return null; const t = teacherOf(cell[0], PY, classRole(Pf)), why = freeWhy(Wt, p, cell[0], t); return why ? { p, s: cell[0], t, why } : null; }).filter(Boolean);
      S.$ui.free = fr.length ? fr : null;
    }
    const skippedNow = [];   // 1.15.0: subjects skipped in this update (a mark loses its attendance floor)
    const ATT =_.isPlainObject(S.$eng.att) ? S.$eng.att : (S.$eng.att = {});
    for (const k of ['p', 'c', 'done']) if (!_.isPlainObject(ATT[k])) ATT[k] = {};
    for (const k of Object.keys(ATT.done)) if (+k.split(':')[0] < dayNo - 1) { delete ATT.done[k]; delete ATT.p[k]; delete ATT.c[k]; }
    const inj = Object.values(S.Player.Injuries || {}).some(i => /moderate|serious|critical/.test(i.Severity));
    const pkA = placeKey(S.World.Location), pkB = hasB ? placeKey(B.World.Location) : pkA;
    // 1.11.1 (bug hunt): only a place on the Campus Map other than the class venue counts as away; a name the map does not know
    // ("Classroom", "Seminar Room 4") is the narrator's wording and gets the benefit of the doubt. A place inside a venue counts
    // as the venue (the Sparring Pavilion is in a corner of the Combat Grounds, the Forest Clearing is in the Forest).
    const knownPlace = pk => !!pk && CAMPUS.some(c => c.replace(/^the /, '') === pk);
    const VENUE_PARTS = { 'combat grounds': ['sparring pavilion'], forest: ['forest clearing'] };
    const classVenues = v => [...v, ...v.flatMap(x => VENUE_PARTS[x] || [])];
    const excused = pkA === 'medical centre' || pkB === 'medical centre' || (S.Player.Conditions || {})['Head cold'] || inj
      || awayIn(S) || (S.Battle && S.Battle.Active) || V._Fatigue === 'Collapsed' || Pf.Dorm === 'Unsorted';
    // 1.42.0 (audit 1.7): an update longer than six hours within one day, between two places the map knows, is no routine: a
    // class period whose venue neither end is at was skipped
    const longGap = elapsed > 360 && dayNo === dayNoB && knownPlace(pkA) && knownPlace(pkB);
    if (hasB && elapsed > 0 && (elapsed <= 360 || longGap) && !OFF.has('attendance') && CLASS.tt) {
      for (let d = dayNoB; d <= dayNo; d++) {
        const Wd = fromAbs(d * DAY_MIN), evD = eventsOn(Wd), row = CLASS.tt[Wd.Day];
        if (!row || evD.some(e => e.noclass || e.home || e.lockdown || e.away)) continue;
        PERIODS.forEach(([s0, e0], p) => {
          const ov = Math.min(absA, d * DAY_MIN + e0) - Math.max(absB, d * DAY_MIN + s0);
          if (ov <= 0) return;
          const cell = row[p], key = `${d}:${p}`, elect = Wd.Month === 10 && Wd.Week === 3 && Wd.Day === 'Sat' && p === 2;
          const share = (v, doubt) => ov * ((v.includes(pkB) || (doubt && !knownPlace(pkB)) ? 0.5 : 0) + (v.includes(pkA) || (doubt && !knownPlace(pkA)) ? 0.5 : 0));
          if (cell[3] === 'class' && freeWhy(Wd, p, cell[0], teacherOf(cell[0], PY, classRole(Pf)))) return;   // 1.33.0: a free period
          if (cell[3] === 'class') {
            if (!ATT.done[key] && !(key in ATT.p)) { WK.periods++; ATT.p[key] = 0; }
            if (longGap && classVenues(cell[2]).some(v => v === pkA || v === pkB)) return;   // an end in the room: the routine held
            ATT.p[key] += ov - share(classVenues(cell[2]), true);
            if (!excused && !ATT.done[key] && ATT.p[key] > TU.att_minutes) {
              ATT.done[key] = true; WK.skipped++; skippedNow.push(cell[0]);
              const tch = Object.keys(CLASS.teach || {}).find(id => teaches(id, cell[0], PY, classRole(Pf)) && !goneNow(id));
              repAdd('Academy', -2, `skipped ${cell[0]}`, '');
              S.$ui.absent = { cls: cell[0], teacher: tch || '' };
              log.push(`{{user}} skipped ${cell[0]} (${PERIOD_TEXT[p]}); Academy reputation -2.`);
            }
          } else if (cell[3] === 'study' && Wd.Day === 'Sat' && Pf.Council && !councilRemedial(S.Commitments, Wd)) {
            ATT.c[key] = num(ATT.c[key], 0) + share(['student council chamber']);
          } else if (cell[3] === 'clubs' && Pf.Club && !elect) {
            const v = clubVenues(S, Pf.Club);   // 1.75.0: the founded club's venue too
            ATT.c[key] = num(ATT.c[key], 0) + share(v);
            if (!ATT.done[key] && ATT.c[key] >= 60) { ATT.done[key] = true; repAdd('Student', 1, `Saturday time at the ${Pf.Club}`, 'week'); }
          }
        });
      }
    }
    // FP8: study time toward the next exam week -> preparation tier; FP9: the Results days set the dorm rank
    // 1.15.0 (owner-approved planning/DRAFT_grades_exams.md): the engine marks every subject A-F from the preparation tier, the
    // attendance floor (no skipped class: at least C), skips, the condition on the exam day, training (Combat) and four bond
    // rewards; the story may move a mark one step (/Exam_events). Midterm marks post on the Friday of exam week, finals on
    // Results day. Marks set the dorm rank, Academy/Doves reputation, remedials for an F, and the rewards of an A or B.
    S.$ui.exam = null; S.$ui.ranknews = null; S.$ui.grades = null; S.$ui.posted = null;
    if (!OFF.has('study')) {
      const EXAMS = EXAM_MONTHS, Wn = S.World;
      const nextExam = W => { const m = EXAMS.find(x => W.Month < x || (W.Month === x && W.Week === 1)); return m ? `Y${W.Year}M${m}` : `Y${W.Year + 1}M3`; };
      const key = nextExam(Wn), TIERS = ['unprepared', 'shaky', 'fair', 'solid', 'excellent'];
      const cut = { 1: [2, 6, 12, 20], 2: [4, 10, 18, 28], 3: [6, 15, 25, 40] }[TU.study_tiers] || [4, 10, 18, 28];
      let ST = _.isPlainObject(S.$eng.study) ? S.$eng.study : null;
      if (!ST) ST = S.$eng.study = { key, mins: 0, grace: hasB, hist: {} };   // a save that gains the feature mid-term: floor "fair"
      for (const k of ['hist', 'skip', 'cap', 'shift', 'res', 'marks', 'stand', 'rem', 'held']) if (!_.isPlainObject(ST[k])) ST[k] = {};
      const tierOf = () => { const h = num(ST.mins, 0) / 60; let i = cut.filter(c => h >= c).length; if (ST.grace) i = Math.max(i, 2); return i; };
      const sessOf = k => { const m = /^Y(\d+)M(\d+)$/.exec(String(k || '')); return m ? { Y: +m[1], M: +m[2], fin: +m[2] === 5 || +m[2] === 11 } : null; };
      const labelOf = c => `Y${c.Y} M${c.M} ${c.fin ? 'Finals' : 'Midterm'}`;
      const runOf = k => ({ d: rollInt(0, 3, seed, k, 'run'), h: rollInt(8, 15, seed, k, 'runh') });   // {{user}}'s finals run: Mon-Thu, 08:00-15:00
      const perkOn = (id, which) => { const x = ((REW.npcs || {})[id] || {})[which], p = x && (S._Perks || {})[x.name];
        return !!(p && p.Kind !== 'memento' && !goneNow(id) && !(S.$ui.tsusp || []).includes(x.name)); };
      // the engine owns Player.Academics while the feature is on: a direct write is reverted (the story uses /Exam_events)
      const AB = hasB && B.Player && B.Player.Academics;
      if (AB && !byBuilder && !_.isEqual(S.Player.Academics, AB)) {
        S.Player.Academics = _.cloneDeep(AB);
        log.push('Player.Academics is written by the engine; the change was reverted. Report an exam moment in /Exam_events instead.');
      }
      fillShape(S.Player.Academics, { Grades: {}, Exams: {} });
      // the story's exam moments (for the exams now being prepared or sat)
      for (const e of (Array.isArray(S.Exam_events) ? S.Exam_events : [])) {
        const s = subjectOf(e.Subject);
        if (!s) { log.push(`Exam subject "${e.Subject}" is unknown (use ${SUBJECTS.join(', ')}); nothing changed.`); continue; }
        if (ST.res[ST.key] || ST.marks[ST.key]) { log.push(`The ${s} mark for these exams is already set; the story can no longer move it.`); continue; }
        if (!e.Fail && !e.Shift) continue;
        ST.shift[s] = e.Fail ? { fail: 1, why: e.Why } : { s: Math.sign(e.Shift), why: e.Why };
        log.push(`${s}: ${e.Fail ? 'failed' : e.Shift > 0 ? 'one step up' : 'one step down'} at the next marking (${e.Why || 'the story'}).`);
      }
      // Mimosa's focus draught, taken on an exam day: that day's marks follow the preparation with no penalty
      const draught = ((REW.npcs || {}).Mimosa || {}).gift;
      if (draught && REPORTED.perks.includes(draught.name.toLowerCase()) && perkOn('Mimosa', 'gift')) ST.focus = dayNo;
      // 1.30.0: score = preparation (tier x 25), proficiency (rank x 20) and attendance (% of the subject's classes since the last
      // exams), weighted 50/30/20 for theory and 30/50/20 for practicals, plus the exam-day roll (seeded per subject and exams,
      // shown from exam week). With Proficiency off, preparation stands in for it. The C floor, condition steps, make-up cap and
      // the bond rewards below are unchanged.
      const profOn = !OFF.has('proficiency') && _.isPlainObject(S.$eng.prof);
      const cs0 = sessOf(ST.key), examNow = !!cs0 && Wn.Year === cs0.Y && Wn.Month === cs0.M && Wn.Week === 1;
      const r1 = x => Math.round(x * 10) / 10;
      const markUp = () => {
        const gareth = perkOn('Gareth', 'r10'), t = Math.min(4, tierOf() + (gareth ? 1 : 0)), marks = {}, why = {};
        const prep = t * 25, prepWord = `${TIERS[t]} preparation${gareth ? " (Gareth's tutoring +1 tier)" : ''}`;
        for (const s of SUBJECTS) {
          const sk = num(ST.skip[s], 0), held = num(ST.held[s], 0), c = ST.cap[s] || {}, Wt = GRADE_W[PRACTICAL.includes(s) ? 'practical' : 'theory'];
          const stat = SUBJECT_STAT[s], rank = profOn ? profRankOf(S, stat) : -1, statPts = rank >= 0 ? rank * 20 : prep;
          const att = held ? _.clamp((held - sk) / held, 0, 1) : sk ? 0 : 1;
          const roll = d100(seed, ST.key, 'exam', s), [, day, dayWord] = EXAM_DAY.find(([hi]) => roll <= hi);
          const luck = examNow || ST.cap[s] ? day : 0, score = r1(Wt[0] * prep + Wt[1] * statPts + Wt[2] * att * 100 + luck);
          let m = GRADE_CUT.filter(x => score >= x).length, mod = 0;
          const parts = [`${prepWord} ${r1(Wt[0] * prep)}`, rank >= 0 ? `${stat} Rank ${rank} ${r1(Wt[1] * statPts)}` : '', `attended ${Math.round(att * 100)}% ${r1(Wt[2] * att * 100)}`, luck ? `${dayWord} ${luck > 0 ? '+' : ''}${luck}` : ''];
          const r = [`${parts.filter(Boolean).join(' · ')} = ${score}: ${MARKS[m]}`];
          if (!sk && m < 2) { m = 2; r.push('no class skipped: at least C'); }
          if (c.focus) r.push('focus draught: no penalty');
          else if (c.f === 'Tired') { mod--; r.push('Tired -1'); } else if (c.f === 'Exhausted') { mod -= 2; r.push('Exhausted -2'); }
          m = _.clamp(m + mod, 0, 4);
          if (c.ex) { m = Math.min(m, 2); r.push('make-up exam: at most C'); }
          marks[s] = m; why[s] = r;
        }
        if (perkOn('Alyssa', 'r10')) {
          const p = PRACTICAL.filter(s => marks[s] < 4 && !(ST.cap[s] || {}).ex).sort((a, b) => marks[a] - marks[b])[0];
          if (p) { marks[p]++; why[p].push("Alyssa's Foresight +1"); }
        }
        for (const s of SUBJECTS) {
          const sh = ST.shift[s];
          if (sh && sh.fail) { marks[s] = 0; why[s].push(`failed (${sh.why || 'the story'})`); continue; }
          if (sh && sh.s) { marks[s] = _.clamp(marks[s] + sh.s, 0, 4); why[s].push(`${sh.why || 'the story'} ${sh.s > 0 ? '+1' : '-1'}`); }
          if (s === 'History' && marks[s] < 4 && perkOn('Layla', 'r10')) { marks[s] = 4; why[s].push("Layla's tutoring: A"); }
        }
        return { marks, why };
      };
      // the condition {{user}} sits each exam in: read on the first update after it starts
      const cs = sessOf(ST.key);
      if (cs && hasB) {
        const d0 = Math.floor(toAbs({ Year: cs.Y, Month: cs.M, Week: 1, Day: 'Mon', Time: '00:00' }) / DAY_MIN), run = runOf(ST.key);
        const hurt = Object.values(S.Player.Injuries || {}).some(i => /serious|critical/.test(i.Severity));
        for (const s of SUBJECTS) {
          const sl = cs.fin ? [run.d, run.h * 60, run.h * 60 + 120] : MID_SLOTS[s];
          if (!sl || ST.cap[s]) continue;
          const s0 = (d0 + sl[0]) * DAY_MIN + sl[1], e0 = (d0 + sl[0]) * DAY_MIN + sl[2];
          if (absA <= s0) continue;
          const known = absB < e0 && absA <= e0 + 360;   // the update reaches into the exam (a skip far past it: unknown)
          ST.cap[s] = { f: known ? V._Fatigue : '', ex: known && (pkA === 'medical centre' || V._Fatigue === 'Collapsed' || hurt), focus: ST.focus === d0 + sl[0] };
          if (ST.cap[s].ex) log.push(`${s} exam: {{user}} could not sit it (${pkA === 'medical centre' ? 'in the Medical Centre' : hurt ? 'badly injured' : 'collapsed'}); a make-up follows, marked at most C.`);
        }
      }
      // marks are set at the end of exam week (or when the next exams' count begins)
      const postDays = cs && Wn.Year === cs.Y && Wn.Month === cs.M && Wn.Week === 1 && ['Fri', 'Sat', 'Sun'].includes(Wn.Day);
      const begun = cs && absA >= toAbs({ Year: cs.Y, Month: cs.M, Week: 1, Day: 'Mon', Time: '08:00' });   // never marks exams still to come
      if (begun && hasB && !ST.res[ST.key] && !ST.marks[ST.key] && (ST.key !== key || postDays)) ST.res[ST.key] = markUp().marks;
      if (ST.key !== key) {   // an exam week has passed
        if (!(ST.key in ST.hist)) ST.hist[ST.key] = tierOf();
        Object.assign(ST, { key, mins: 0, grace: false, skip: {}, cap: {}, shift: {}, held: {} });
        delete ST.train;
      }
      for (const s of skippedNow) ST.skip[s] = num(ST.skip[s], 0) + 1;
      // 1.30.0: each class period that ends in this update is held (the subject's attendance counts skips against it)
      if (hasB && elapsed > 0 && elapsed <= 7 * DAY_MIN && CLASS.tt) for (let d = dayNoB; d <= dayNo; d++) {
        const Wd = fromAbs(d * DAY_MIN), row = CLASS.tt[Wd.Day];
        if (!row || eventsOn(Wd).some(e => e.noclass || e.home || e.lockdown || e.away)) continue;
        PERIODS.forEach(([, e0], p) => { const cell = row[p]; if (cell && cell[3] === 'class' && absB < d * DAY_MIN + e0 && absA >= d * DAY_MIN + e0 && !freeWhy(Wd, p, cell[0], teacherOf(cell[0], PY, classRole(Pf)))) ST.held[cell[0]] = num(ST.held[cell[0]], 0) + 1; });
      }
      // minutes: study places outside lessons (Saturday Study Hall counts), halves for the start and end of the update
      if (hasB && elapsed > 0 && elapsed <= 360 && restedAs !== 'sleep') {   // 1.12.0: Resting is reset in section 4; read what it was
        const SP = ['main library', 'study rooms', 'archive'];
        const atStudy = (X, pk) => SP.includes(pk) || (Pf.Council && pk === 'student council chamber' && X.World.Day === 'Sat'
          && hm(X.World.Time) >= P2[0] && hm(X.World.Time) < P2[1] && !councilRemedial(S.Commitments, X.World));
        const f = (atStudy(hasB ? B : S, pkB) ? 0.5 : 0) + (atStudy(S, pkA) ? 0.5 : 0);
        let lesson = 0;
        for (let d = dayNoB; d <= dayNo; d++) {
          const Wd = fromAbs(d * DAY_MIN), row = CLASS.tt && CLASS.tt[Wd.Day];
          if (!row || eventsOn(Wd).some(e => e.noclass || e.home || e.lockdown || e.away)) continue;
          PERIODS.forEach(([s0, e0], p) => { if (row[p][3] === 'class' && !freeWhy(Wd, p, row[p][0], teacherOf(row[p][0], PY, classRole(Pf)))) lesson += Math.max(0, Math.min(absA, d * DAY_MIN + e0) - Math.max(absB, d * DAY_MIN + s0)); });
        }
        ST.mins = num(ST.mins, 0) + Math.max(0, elapsed - lesson) * f;
      }
      for (const a of S.Interactions || []) if (String(a.Kind || '').toLowerCase() === 'study') {
        ST.mins = num(ST.mins, 0) + 60 + (r4Partner(S, a.With, 'study') ? 30 : 0);   // 1.45.0 (audit 3.9): one partner rule
      }
      // posting: midterm marks at once, finals on Results day. Reputation from the average (docs/design/reputation.md figures),
      // and a remedial session for each F (next week's Saturday Study Hall slot, with the subject's teacher)
      const post = sess => {
        const c = sessOf(sess), mk = ST.res[sess], label = labelOf(c), Ac = S.Player.Academics;
        delete ST.res[sess];
        const line = SUBJECTS.map(s => `${s} ${MARKS[mk[s]]}`).join(', ');
        Ac.Exams[label] = line;
        for (const s of SUBJECTS) Ac.Grades[s] = MARKS[mk[s]];
        ST.marks[sess] = mk; ST.stand = { ...mk };
        for (const k of Object.keys(ST.marks).slice(0, -8)) delete ST.marks[k];
        const avg = SUBJECTS.reduce((a, s) => a + mk[s], 0) / SUBJECTS.length, fails = SUBJECTS.filter(s => !mk[s]);
        const up = avg >= 3.5 ? 15 : avg >= 2.5 ? 8 : avg >= 1.5 ? 3 : 0;
        if (up) repAdd('Academy', up, `${label} marks`, '');
        if (fails.length) repAdd('Academy', fails.length >= 2 ? -15 : -8, `failed ${fails.join(', ')} (${label})`, '');
        if (mk['Dark Magic Defense'] === 4) repAdd('Doves', 8, `top Dark Magic Defense mark (${label})`, '');
        const rem = [];
        for (const s of fails) {
          const k = `Remedial ${s}`, t = Object.keys(CLASS.teach || {}).find(id => teaches(id, s, PY, classRole(S.Player.Profile)) && !goneNow(id)) || '';
          const due = stamp(fromAbs(((weekNo + 1) * 7 + 5) * DAY_MIN + 600));
          S.Commitments[k] = { Desc: `Make-up session for the ${s} F (${label}); attending turns it into a D for the dorm ranking`, Due: due, With: t, Where: 'Main Library', Type: 'appointment' };
          ST.rem[k] = sess; rem.push({ s, t, due });
        }
        S.$ui.posted = { label, line, rem };
        notes.push(`${label} marks: ${line}.`);
        S.$ui.toasts.push(`${c.fin ? 'Final' : 'Midterm'} marks posted`);
        log.push(`${label} marks posted: ${line} (average ${avg.toFixed(1)} of 4).`);
        (WK.ranks = WK.ranks || []).push(`${label} marks posted`);
      };
      for (const sess of Object.keys(ST.res)) {
        const c = sessOf(sess);
        if (!c || !_.isPlainObject(ST.res[sess])) { delete ST.res[sess]; continue; }
        if (!c.fin || absA >= toAbs({ Year: c.Y, Month: c.M, Week: 2, Day: 'Fri', Time: '00:00' })) post(sess);
      }
      // FP9: the first update of a Results day
      const rk = `Y${Wn.Year}M${Wn.Month}`;
      if (evs.some(e => e.ranking) && ST.ranked !== rk && Pf.Dorm && Pf.Dorm !== 'Unsorted') {
        ST.ranked = rk;
        // 1.15.0: the semester's marks (midterm once, finals twice; 0-4 like the tiers before); a save without them: the tiers
        const pair = Wn.Month === 5 ? [3, 5] : [9, 11], gpa = m => { const mk = ST.marks[`Y${Wn.Year}M${m}`]; return mk ? SUBJECTS.reduce((a, s) => a + num(mk[s], 0), 0) / SUBJECTS.length : null; };
        const g = pair.map(gpa), ex = pair.map(m => num(ST.hist[`Y${Wn.Year}M${m}`], 2));
        const exScore = g[1] != null ? (g[0] != null ? (g[0] + 2 * g[1]) / 3 : g[1]) : (ex[0] + ex[1]) / 2;
        const exText = g[1] != null ? `marks ${exScore.toFixed(1)} of 4` : `exams ${ex.map(i => TIERS[i]).join(' / ')}`;
        const Co = S.Competition || {}, tier = String(Co.Tier || ''), status = String(Co.Status || '').toLowerCase();
        const comp = /champion/.test(status) ? 2 : /Academy|Kingdom|World/.test(tier) || /qualified|selected/.test(status) ? 1 : 0;
        const aL = repLv('Academy'), acadPts = aL >= 2 ? 1 : aL <= -2 ? -1 : 0;
        const score = exScore + comp + acadPts + rollInt(0, 99, seed, rk, 'rank') / 100 - 0.5;
        const BANDS = [[1, 1], [2, 3], [4, 10], [11, 25], [26, 50], [51, 80]];
        // 1.11.1 (bug hunt): a rank below #80 is in the last band (it used to find no band and jump to #1)
        const bandOf = r => { const i = r >= 1 ? BANDS.findIndex(([, hi]) => r <= hi) : 5; return i < 0 ? 5 : i; }, cur = num(Pf.Dorm_rank, 0), b0 = bandOf(cur);
        const want = score >= 6.5 ? 0 : score >= 5.5 ? 1 : score >= 4.2 ? 2 : score >= 3 ? 3 : score >= 1.8 ? 4 : 5;
        const step = TU.rank_move || 1, b1 = want < b0 ? Math.max(want, b0 - step) : want > b0 ? Math.min(want, b0 + step) : b0;
        const [lo, hi] = BANDS[b1], to = b1 === b0 && cur >= 1 ? cur : rollInt(lo, hi, seed, rk, 'rankpos');
        Pf.Dorm_rank = to;
        if (b1 < b0) repAdd('Academy', 5, 'dorm rank up on Results day', '');
        S.$ui.ranknews = { from: cur, to, dorm: Pf.Dorm };
        log.push(`Results day: dorm rank ${cur ? '#' + cur : 'unranked'} -> #${to} (${exText}, competition +${comp}, Academy ${acadPts >= 0 ? '+' : ''}${acadPts}).`);
        if (_.isPlainObject(S.$eng.wk) && cur !== to) (S.$eng.wk.ranks = S.$eng.wk.ranks || []).push(`dorm rank #${to}`);
      }
      // paid tutoring (lore 221) in a subject whose latest mark is an A: two sessions a week, each also a Notice Board request
      const TW = ST.tw && ST.tw.w === weekNo ? ST.tw : (ST.tw = { w: weekNo, n: 0 });
      c.profTutoring = [];
      for (const t of (Array.isArray(S.Tutoring) ? S.Tutoring : [])) {
        const s = subjectOf(t.Subject);
        if (!s || num(ST.stand[s], -1) < 4) { log.push(`Tutoring ${s || t.Subject}: paid tutoring needs an A in that subject at the latest exams; nothing was paid.`); continue; }
        if (TW.n >= TUTOR_WEEK) { log.push(`Tutoring: ${TUTOR_WEEK} paid sessions already this week; no pay for another.`); continue; }
        TW.n++;
        c.profTutoring.push(s);
        ledger(c, 'Points', TUTOR_PAY, `tutoring (${s}${t.Student ? ', ' + t.Student : ''})`);
        repAdd('Student', 2, `tutoring in ${s}`, 'week');
        S.$ui.toasts.push(`Tutoring +${TUTOR_PAY} points`);
      }
      // the expected marks now (Student file, <now>), exam week, and an A's Fortune bonus
      const nx = sessOf(ST.key), fc = markUp(), run = nx.fin ? runOf(ST.key) : null;
      S.$ui.grades = { label: labelOf(nx), set: !!(ST.res[ST.key] || ST.marks[ST.key]), tier: TIERS[tierOf()], h: Math.round(num(ST.mins, 0) / 60),
        marks: _.mapValues(fc.marks, m => MARKS[m]), why: _.mapValues(fc.why, r => r.join('; ')), run: run ? `${DAYS[run.d]} ${pad(run.h)}:00` : '',
        stand: _.mapValues(ST.stand, m => MARKS[m]) };
      const examWeek = EXAMS.includes(Wn.Month) && Wn.Week === 1 && ['Mon', 'Tue', 'Wed', 'Thu'].includes(Wn.Day) && !evs.some(e => e.home);
      if (examWeek) {
        const di = DAYS.indexOf(Wn.Day), today = SUBJECTS.filter(s => (nx.fin ? run.d === di : (MID_SLOTS[s] || [])[0] === di));
        S.$ui.exam = { tier: TIERS[tierOf()], h: Math.round(num(ST.mins, 0) / 60), run: S.$ui.grades.run, today: today.map(s => ({ s, mark: MARKS[fc.marks[s]], why: fc.why[s].join('; ') })) };
      }
      if (S.$ui.fortune && Array.isArray(S.$ui.fortune.mods)) {
        const fields = new Set();
        for (const s of SUBJECTS) if (num(ST.stand[s], -1) === 4 && !fields.has(SUBJECT_STAT[s])) {
          S.$ui.fortune.mods.push(`top mark in ${s}: ${TOP_FIELD[s]} +10`);
          fields.add(SUBJECT_STAT[s]);
        }
      }
    }
    S.Exam_events = []; S.Tutoring = [];
    if (c.routine) routineSchool(c, !OFF.has('study') && _.isPlainObject(S.$eng.study) ? S.$eng.study : null, WK);   // 1.50.0: the routine week
    // FP12: on a day with nothing on the calendar, at most TU.scene_cap people with {{user}}; one more takes their leave
    S.$ui.leave = null;
    const hr = Math.floor((absA % DAY_MIN) / 60), perNow = /^P[123] /.test(S.World._Period || '');
    const partyOn = S.$ui.party && hr >= 18;
    const present = Object.keys(S.Scene.Present || {});
    if (!OFF.has('small_scenes') && !evs.length && !perNow && !partyOn && !awayIn(S) && !(S.Battle && S.Battle.Active) && present.length > TU.scene_cap) {
      const talked = new Set((S.Interactions || []).map(a => NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With));
      const dormHere = /dormitor|common room/.test(pkA);
      let pool = present.filter(id => !talked.has(id) && !(dormHere && num((S.Bonds[id] || {}).Rank, 0) >= 7));
      if (pool.length) {
        // 1.11.1: invented characters leave first, recorded as Extras or not yet, then unbonded roster people, then the lowest rank
        const rankOf = id => (S.Bonds[id] ? num(S.Bonds[id].Rank, 0) : NPC_IDS.has(NPC_ALIAS[String(id).toLowerCase()] || id) ? -1 : -2);
        pool = _.sortBy(pool, [rankOf, id => hash32(seed, dayNo, 'leave', id)]);
        S.$ui.leave = { id: pool[0], n: present.length, cap: TU.scene_cap };
      }
    }
  }
}

// ---- 6a. names revealed by the story prose (not by the update block); before 6 so a name spoken in this reply counts ----
function stepNamesInProse(c) {
  const { S, text } = c;
  if (text) {
    const prose = String(text).replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
    const names = S.$ui.names;
    // 1.11.1 (bug hunt): a first name that is also a word ("Maple leaves…", "Ruby light…") opening a sentence is no name reveal
    for (const [id, rx] of NAME_RX) if (!names.includes(id) && (ARRIVES[id] || 1) <= S.World.Year && mentionIn(prose, id, rx)) names.push(id);
  }
}

// ---- 1.50.0 (audit/AUDIT_2026-10-03_4_batch_fitur.md, batch 2: audit 4.5): the routine week. The player plans a week in the Planner
// ($ui.plan: study hours, Practice actions with counts, Saturday club) and arms it ("Live this week", a player-tool patch). The engine
// then works out the span (stepRoutine): from now to Sunday 20:00, cut to the evening before the first stopper (a calendar event that
// starts later in the span or a day without classes, a dated Commitment, Project, Hook or Next plan, {{user}}'s birthday), and picks one
// or two moments to play. The next story reply is the routine: the engine sets the clock to the end (routineStart), counts the plan
// through the ordinary rules and weekly limits (classes attended, study time, Practice XP, mana and stamina sessions, paid shifts,
// Saturday club), and gives no bond XP or Trust except for the people in the moments (missed reports, time together). One run per arm.
const RT_END = 20 * 60, RT_MIN = 12 * 60;
const rtKey = a => `${a.loc}|${a.action}`;
const rtAct = k => PRACTICE.find(a => rtKey(a) === k) || null;
// the plan as the engine reads it: study hours 0-20, up to four Practice actions (1-5 a week each; a "subject" action names one)
function planOf(S) {
  const p = _.isPlainObject((S.$ui || {}).plan) ? S.$ui.plan : {};
  const acts = (Array.isArray(p.acts) ? p.acts : []).map(x => ({ a: rtAct(String((x || {}).a || '')), s: SUBJECTS.includes((x || {}).s) ? x.s : '', n: _.clamp(Math.round(num((x || {}).n, 0)), 0, 5) }))
    .filter(x => x.a && x.n > 0 && !x.a.partner && !x.a.materials && !x.a.pact && (x.a.stat !== 'subject' || x.s)).slice(0, 4);
  return { study: _.clamp(Math.round(num(p.study, 0)), 0, 20), acts, club: !!p.club, run: num(p.run, 0) === 1 };
}
// what keeps one planned action from the routine (the place known, the club, the season, the money)
function rtWhy(S, a) {
  if (!(S.$ui.discovered || []).some(n => placeKey(n) === placeKey(a.name))) return `${a.name} is not discovered yet`;
  const club = String(S.Player.Profile.Club || '').toLowerCase();
  if (a.club && !club.includes(a.club.toLowerCase())) return `${a.club} Club only`;
  if (a.clubAny && !a.clubAny.some(n => club.includes(n.toLowerCase()))) return `${a.clubAny.join(' or ')} club only`;
  if (a.seasons && !a.seasons.includes(SEASONS[S.World.Month - 1])) return `${a.seasons.join(' or ')} only`;
  if (a.dorm && S.Player.Profile.Dorm === 'Unsorted') return 'a dorm first';
  return '';
}
// the span from now: { to, stop } or { why }
function routineSpan(c) {
  const { S, absA, OFF } = c;
  if (OFF.has('routine_week')) return { why: 'the routine week is off in Settings' };
  if (awayIn(S)) return { why: '{{user}} is away from Halvard' };
  if (S.Battle && S.Battle.Active) return { why: 'a battle is on' };
  if (S.Player.Profile.Dorm === 'Unsorted') return { why: '{{user}} has not been sorted into a dorm yet' };
  const today = Math.floor(absA / DAY_MIN), todayEv = new Set(eventsOn(S.World).map(e => e.t));
  let end = (today + 6 - DAYS.indexOf(S.World.Day)) * DAY_MIN + RT_END;
  if (end - absA < RT_MIN) end += 7 * DAY_MIN;
  let to = end, stop = 'Sunday evening';
  const cut = (abs, what) => { const at = (Math.floor(abs / DAY_MIN) - 1) * DAY_MIN + RT_END; if (at < to) { to = at; stop = what; } };
  for (let d = today + 1; d * DAY_MIN <= end; d++) {
    const W = fromAbs(d * DAY_MIN), e = eventsOn(W).find(x => x.noclass || x.home || x.away || x.lockdown || !todayEv.has(x.t));
    if (e) { cut(d * DAY_MIN, e.t.split(' (')[0]); break; }
  }
  const bd = /^M(\d{1,2}) W([1-4]) (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.exec(String(S.Player.Profile.Birthday || '').trim());
  for (let d = today + 1; bd && d * DAY_MIN <= end; d++) { const W = fromAbs(d * DAY_MIN); if (+bd[1] === W.Month && +bd[2] === W.Week && bd[3] === W.Day) cut(d * DAY_MIN, "{{user}}'s birthday"); }
  const dated = [...Object.entries(S.Commitments || {}).map(([k, x]) => [num(x.$abs, -1), k]), ...Object.entries(S.Hooks || {}).map(([k, x]) => [num(x.$abs, -1), k]),
    ...Object.entries(((S.$eng.agenda || {}).when) || {}).map(([k, x]) => [num((x || [])[1], -1), k.startsWith('n:') ? `${k.slice(2)}'s plan` : k.slice(2)])];
  for (const [abs, what] of dated) if (abs > absA && abs <= end) cut(abs, `"${what}"`);
  if (to - absA < RT_MIN) return { why: `${stop} is too close (the routine needs at least half a day)` };
  return { to, stop };
}
// one or two moments of the span to play in full: someone {{user}} has a bond with, and a happening
function routineMoments(c, to) {
  const { S, absA, seed, OFF } = c, d0 = Math.floor(absA / DAY_MIN), d1 = Math.floor(to / DAY_MIN), out = [];
  const dayIn = (...k) => rollInt(d0, d1, seed, d0, ...k);   // the shared draw (DECISIONS: one source)
  const PV = presenceNow(S);
  const id = OFF.has('npc_initiative') ? null : rollTable(Object.keys(S.Bonds).sort(), { roll: [seed, d0, 'routine-npc'], p: 0.85, pick: [seed, d0, 'routine-npc-pick'],
    skip: id => { const b = S.Bonds[id]; return !(b.Rank >= 3 && INITIATIVE_STAGES[id] && (ARRIVES[id] || 1) <= S.World.Year && !npcAwayIn(S, id) && !npcOut(PV, S, id)); },
    weight: id => ({ open: 3, normal: 2, guarded: 1, closed: 0.5 })[INITIATIVE_OPENNESS[id] || 'normal'] });
  if (id) {
    const b = S.Bonds[id], band = b.Rank <= 5 ? '3-5' : b.Rank <= 8 ? '6-8' : '9-10';
    out.push({ day: fromAbs(dayIn('npc') * DAY_MIN).Day, who: id, text: `${id} crosses {{user}}'s path. Their Stage at this rank: ${INITIATIVE_STAGES[id][band]}${b.Tension >= 70 ? ' (not friendly at this Tension)' : ''}` });
  }
  if (!OFF.has('happenings')) {
    const rate = HAPPEN_RATE[S.$ui.happenings] ?? HAPPEN_RATE.normal;
    const hs = _.range(d0, d1 + 1).map(d => [d, happeningOn(S.$eng.seed, d, rate, S.$ui.wxfx)]).filter(x => x[1] && x[1].text);
    if (hs.length) { const [d, h] = pickOf(hs, seed, d0, 'routine-hap'); out.push({ day: fromAbs(d * DAY_MIN).Day, who: '', text: `${h.where || 'Around campus'}: ${h.text}` }); }
  }
  return _.sortBy(out, x => DAYS.indexOf(x.day) - DAYS.indexOf(S.World.Day) + (DAYS.indexOf(x.day) < DAYS.indexOf(S.World.Day) ? 7 : 0));
}
// the armed routine's line for <now>
function routineLine(S, R, plan) {
  const what = [plan.study ? `${plan.study} hours of study` : '', ...plan.acts.map(x => `${x.a.action}${x.s ? ` (${x.s})` : ''} at ${x.a.name} x${x.n}`),
    plan.club && S.Player.Profile.Club ? `Saturday club at the ${S.Player.Profile.Club}` : ''].filter(Boolean);
  return `Routine week: in this reply {{user}} lives their planned routine from now until ${R.at} (the engine sets the clock; it stops before ${R.stop}).`
    + ` Classes attended${what.length ? '; ' + what.join('; ') : ''}; meals and sleep as usual. Tell the days as a short montage in a few sentences, and play`
    + (R.moments.length ? ` these moments in full: ${R.moments.map(m => `${m.day}: ${m.text}`).join(' | ')}.` : ' one ordinary moment of your choice in full.')
    + ` Report Interactions only for ${R.moments.some(m => m.who) ? R.moments.filter(m => m.who).map(m => m.who).join(', ') : 'nobody'} (bond progress needs time played together); no Practice or Training (the engine counts the plan).`;
}
// the story reply that runs it: the clock to the end, a night's sleep, reports the plan replaces dropped
function routineStart(c) {
  const { S, B, log, hasB, toolEdit } = c;
  const R = hasB && !toolEdit && planOf(B).run && _.isPlainObject(B.$ui.routine) && num(B.$ui.routine.to, -1) > num((B.$eng || {}).abs, toAbs(B.World)) ? B.$ui.routine : null;
  if (!R) return;
  const plan = planOf(B), days = (R.to - num((B.$eng || {}).abs, toAbs(B.World))) / DAY_MIN, f = Math.min(1, days / 7);
  const n = x => (x > 0 ? Math.max(f >= 0.3 ? 1 : 0, Math.round(x * f)) : 0);
  const keep = new Set((R.moments || []).map(m => m.who).filter(Boolean));
  const acts = (S.Interactions || []).filter(a => keep.has(NPC_ALIAS[String((a && a.With) || '').toLowerCase()] || String((a && a.With) || '')));
  if (acts.length < (S.Interactions || []).length) log.push(`Routine week: interactions with people outside its moments were not counted (no time played together).`);
  if ((S.Practice || []).length || (S.Training || []).length) log.push('Routine week: Practice and Training reports were dropped; the engine counted the plan.');
  S.Interactions = acts; S.Practice = []; S.Training = [];
  const T = fromAbs(R.to);
  if (stamp(S.World) !== stamp(T)) log.push(`Routine week: the clock was set to ${stamp(T)} (the routine's end).`);
  Object.assign(S.World, _.pick(T, ['Year', 'Month', 'Week', 'Day', 'Time']));
  S.Player.Vitals.Resting = 'sleep';
  const acts2 = plan.acts.map(x => ({ ...x, n: n(x.n), why: rtWhy(S, x.a) }));
  for (const x of acts2) if (x.why) log.push(`Routine week: ${x.a.action} at ${x.a.name} left out (${x.why}).`);
  c.routine = { ...R, plan, f, study: n(plan.study) * 60, acts: acts2.filter(x => !x.why && x.n > 0), done: [] };
}
// classes, study time and Saturday club (stepSchoolWeek)
function routineSchool(c, ST, WK) {
  const { S, absB, absA, repAdd, OFF } = c, R = c.routine, Pf = S.Player.Profile, PY = _.clamp(num(Pf.Year, 1), 1, 3);
  let held = 0, sat = false;
  for (let d = Math.floor(absB / DAY_MIN); d <= Math.floor(absA / DAY_MIN); d++) {
    const Wd = fromAbs(d * DAY_MIN), row = CLASS.tt && CLASS.tt[Wd.Day];
    if (!row || eventsOn(Wd).some(e => e.noclass || e.home || e.lockdown || e.away)) continue;
    PERIODS.forEach(([s0, e0], p) => {
      const cell = row[p]; if (!cell || absB >= d * DAY_MIN + e0 || absA < d * DAY_MIN + e0) return;
      if (cell[3] === 'class' && !freeWhy(Wd, p, cell[0], teacherOf(cell[0], PY, classRole(Pf)))) held++;
      if (cell[3] === 'clubs' && Wd.Day === 'Sat' && !(Wd.Month === 10 && Wd.Week === 3)) sat = true;
    });
  }
  if (WK && !OFF.has('attendance')) WK.periods = num(WK.periods, 0) + held;
  if (held) R.done.push(`${held} class${held === 1 ? '' : 'es'} attended`);
  const study = R.study + R.acts.filter(x => x.a.study).reduce((t, x) => t + x.n * 60, 0);
  if (ST && study) { ST.mins = num(ST.mins, 0) + study; R.done.push(`${Math.round(study / 60)} hours of study`); }
  R.studied = study;
  // 1.75.0: only a club live play counts too (one with a meeting place)
  if (R.plan.club && Pf.Club && sat && clubVenues(S, Pf.Club).length) { R.club = true; repAdd('Student', 1, `Saturday time at the ${Pf.Club}`, 'week'); R.done.push(`Saturday at the ${Pf.Club}`); }
}
// Practice XP, paid shifts, mana and stamina sessions, study and club proficiency (stepProficiency, inside its weekly limits)
function routineProf(c, gain, P) {
  const { S } = c, R = c.routine;
  for (const x of R.acts) {
    let did = 0;
    for (let i = 0; i < x.n; i++) {
      if (x.a.paid && num(P.wk.paid, 0) >= 2) break;
      if (x.a.cost && S.Player.Wallet.Points < x.a.cost) break;
      did++;
      if (x.a.cost) ledger(c, 'Points', -x.a.cost, `${x.a.action} (routine)`);
      if (x.a.paid) { P.wk.paid = num(P.wk.paid, 0) + 1; ledger(c, 'Points', x.a.paid, x.a.paidAs || 'paid shift'); }
    }
    const stat = x.a.stat === 'subject' ? SUBJECT_STAT[x.s] : x.a.stat;
    if (did && stat) gain(stat, x.a.xp * did, `routine: ${x.a.action} x${did}`);
    if (did) R.done.push(`${x.a.action} x${did}`);
  }
  if (R.studied >= 120) gain('Knowledge', Math.floor(R.studied / 120), 'study time');
  if (R.club) { const stat = clubField(S, S.Player.Profile.Club || ''); if (stat) gain(stat, 1, 'Saturday club time'); }
}

// ---- 6-. 1.49.0 (audit/AUDIT_2026-10-03_4_batch_fitur.md, batch 1: audit 4.6, 4.10): promises kept and broken. Read before the
// bonds (6) so they land through its ordinary rules (bond XP needs time together, Trust inside its weekly cap, Tension by the NPC's
// category). A favour (Commitment Type "favour", With one NPC) removed before it was overdue was kept: a "help" deed for that NPC,
// and its Item leaves the Bag; one left overdue raises their Tension once (rises are never capped). A study session in /Practice
// with someone present is a study Interaction with them. A group assignment (Project Kind "assignment", With classmates) finished
// (Progress 100) on time is study time like an assignment Commitment; finished late it counts as a skipped class of its subject, and
// when it turns overdue each partner's Tension rises once. Who let the group down is the story's to play, in character.
const isFavour = cm => /^favou?r$/i.test(String((cm && cm.Type) || '').trim());
function stepPromises(c) {
  const { S, B, log, hasB, toolEdit, absA, elapsed, OFF } = c;
  if (!hasB || toolEdit) return;
  const E = S.$eng.promise = _.isPlainObject(S.$eng.promise) ? S.$eng.promise : {};
  const late = new Set(Array.isArray(E.late) ? E.late : []);
  const idOf = x => { const k = String(x || '').trim(); return NPC_ALIAS[k.toLowerCase()] || k; };
  const ids = t => String(t || '').split(/\s*,\s*/).map(idOf).filter(id => id && S.Bonds[id]);
  const here = id => !!((S.Scene.Present || {})[id] || ((B.Scene || {}).Present || {})[id]);
  if (!Array.isArray(S.Interactions)) S.Interactions = [];
  const told = (id, rx) => S.Interactions.some(a => a && idOf(a.With) === id && rx.test(String(a.Kind || '').trim()));
  const add = (id, Kind, Note) => S.Interactions.push({ With: id, By: '', Kind, Gift: '', Item: '', Rep: '', Why: '', Public: false, Invited: false, Note });
  const rise = (id, x, why) => { const b = S.Bonds[id]; b.Tension = _.clamp(num(b.Tension, 0) + x, 0, 100); log.push(`${id}: ${why} (Tension +${x}).`); };
  // favours
  if (!OFF.has('planner')) {
    for (const [k, c0] of Object.entries(B.Commitments || {})) {
      const id = isFavour(c0) && ids(c0.With)[0];
      if (!id) continue;
      const cm = (S.Commitments || {})[k];
      if (cm) {
        if (agendaState(num(cm.$abs, -1), absA, 'commitment') === 'overdue' && !late.has('c:' + k)) {
          late.add('c:' + k); rise(id, num(FAVOURS.ignored_tension, 5), `the favour "${k}" was left undone`);
        }
        continue;
      }
      if (c0._Late || late.has('c:' + k)) continue;               // removed late: the story resolved it; the overdue rise has landed
      const item = String(c0.Item || '').trim();
      if (item && !bagKeyOf((B.Inventory || {}), item)) { log.push(`Favour "${k}" for ${id}: the Bag held no ${item}, so it was not counted as kept.`); continue; }
      if (item) bagTake(c, item, 1);                              // the narrator may have taken it already (bagMove counts that)
      if (!told(id, /^help$/i)) add(id, 'help', `favour kept: ${k}`);
      log.push(`Favour for ${id} kept ("${k}"${item ? `, ${item} handed over` : ''}): it counts as help.`);
    }
  }
  // a study session with someone is time together: a study Interaction for each partner present (once, if not already reported)
  if (elapsed >= 45) for (const r of Array.isArray(S.Practice) ? S.Practice : []) {
    const a = PRACTICE.find(x => x.study && x.action.toLowerCase() === String((r && r.Action) || '').trim().toLowerCase());
    if (a) for (const id of ids(r.With)) if (here(id) && !told(id, /^(study|hangout)$/i)) add(id, 'study', `${a.action} together`);
  }
  // group assignments
  if (!OFF.has('projects')) {
    const W = ((S.$eng.agenda || {}).when) || {}, STd = !OFF.has('study') && _.isPlainObject(S.$eng.study) ? S.$eng.study : null;
    for (const [k, p] of Object.entries(S.Projects || {})) {
      if (!/^assignment$/i.test(String(p.Kind || '').trim())) continue;
      const w = W['p:' + k], abs = w && w[0] === String(p.Due || '').trim() ? num(w[1], -1) : -1;
      const over = agendaState(abs, absA, 'project') === 'overdue', p0 = (B.Projects || {})[k];
      if (num(p.Progress, 0) >= 100 && p0 && num(p0.Progress, 0) < 100) {
        if (!STd) continue;
        if (!over) { STd.mins = num(STd.mins, 0) + ASSIGNMENT_MIN; log.push(`Assignment "${k}" finished on time: +${ASSIGNMENT_MIN} minutes of study.`); }
        else { const s = subjectIn(`${k} ${p.Goal || ''}`); if (s) { STd.skip = _.isPlainObject(STd.skip) ? STd.skip : {}; STd.skip[s] = num(STd.skip[s], 0) + 1; log.push(`Assignment "${k}" was finished late: it counts as a skipped ${s} class for the next marks.`); } }
      } else if (over && num(p.Progress, 0) < 100 && !late.has('p:' + k)) {
        late.add('p:' + k);
        for (const id of ids(p.With)) rise(id, GROUP_LATE_TENSION, `the group assignment "${k}" is overdue`);
      }
    }
  }
  // keep only the marks of records that still exist
  E.late = [...late].filter(x => x.startsWith('c:') ? (S.Commitments || {})[x.slice(2)] : (S.Projects || {})[x.slice(2)]).slice(-40);
}

// ---- 6. bonds ----
function stepBonds(c) {
  const { S, B, log, jnl, hasB, OFF, staleDrop, evs, dayNo, goneNow, dayNoB, WXM, seed, TU, wxNow, V, weekNo, weekNoB, repLv, repAdd, repLevelUp, teamBond, notes } = c;
  const canon = k => NPC_ALIAS[String(k).toLowerCase()] || k;
  // v1.0.3 (F09): when both an alias key and the canonical key exist, the alias record's real changes merge into the canonical one
  // (fields that differ from the empty record; lists are unioned). Engine-owned "_" / "$" fields are never taken from the alias.
  const mergeInto = (to, from, empty) => {
    if (!_.isPlainObject(to) || !_.isPlainObject(from)) return typeof from === 'string' && from ? from : to;
    for (const [f, v] of Object.entries(from)) {
      if (/^[_$]/.test(f)) continue;
      if (Array.isArray(v)) to[f] = [...new Set([...(to[f] || []), ...v])];
      else if (!_.isEqual(v, empty[f])) to[f] = v;
    }
    return to;
  };
  const renameKeys = (obj, empty = {}) => {
    for (const k of Object.keys(obj || {})) {
      const c = canon(k);
      if (c !== k) { obj[c] = c in obj ? mergeInto(obj[c], obj[k], empty) : obj[k]; delete obj[k]; }
    }
  };
  renameKeys(S.Scene.Present, { Note: '' }); renameKeys(S.Bonds, BOND0);
  if (S.Battle && S.Battle.Combatants) renameKeys(S.Battle.Combatants, { HP: 100, Stamina: 100, Status: '' });
  renameKeys(S.Campus_State.NPC_status);
  const BB0 = (hasB && B.Bonds) || {};
  // 1.11.1 (bug hunt): a bond written straight into /Bonds passes the same gates as one started in Scene.Present: invented
  // characters (Extras) and rival academy teams never get a bond, and an incoming first-year has none before their year. Such a
  // record is removed (the "bonds cannot be removed" rule below is for real bonds).
  const noBondWhy = id => (!NPC_IDS.has(id) ? 'is not on the roster (invented characters get an Extras record, not a bond)'
    : NO_BOND.has(id) ? 'is on a rival academy team (no bond system)' : (ARRIVES[id] || 1) > S.World.Year ? `is not at Halvard until Year ${ARRIVES[id]}` : '');
  for (const id of Object.keys(S.Bonds)) {
    const why = noBondWhy(id);
    if (why) { delete S.Bonds[id]; log.push(`Bond record "${id}" was removed: ${id} ${why}.`); }
  }
  const BB = _.omitBy(BB0, (b, id) => !!noBondWhy(id));
  for (const [id, b] of Object.entries(S.Bonds)) {             // v1.0.3 (A#3): older facts survive a whole-record replace
    const o = (BB[id] && BB[id].$Known_old) || [];
    if (o.length && !(b.$Known_old || []).length) b.$Known_old = [...o];
  }
  // 1.3.3 (bug hunt): a bond is never removed by an update (a whole-/Bonds replace used to drop every bond it left out), and a
  // record rewritten whole (its facts and milestones both came back empty) keeps what it knew: facts, milestones, title, and
  // Trust / Tension where the rewrite only carried the defaults.
  {
    const kept = [], mended = [];
    for (const [id, b0] of Object.entries(BB)) if (!(id in S.Bonds) && !staleDrop.has(id)) { S.Bonds[id] = _.cloneDeep(b0); kept.push(id); }
    for (const [id, b] of Object.entries(S.Bonds)) {
      const b0 = BB[id]; if (!b0 || kept.includes(id)) continue;
      if ((b.Known_facts || []).length || (b.Milestones || []).length || !((b0.Known_facts || []).length || (b0.Milestones || []).length)) continue;
      b.Known_facts = [...(b0.Known_facts || [])]; b.Milestones = [...(b0.Milestones || [])];
      if (!b.Title) b.Title = b0.Title || '';
      // 1.17.0 (audit T3): <current_state> no longer shows Mind, Knows and Imprints of absent people, so a rewrite keeps them too
      if (!(b.Knows || []).length && (b0.Knows || []).length) b.Knows = [...b0.Knows];
      if (!(b.Imprints || []).length && (b0.Imprints || []).length) b.Imprints = _.cloneDeep(b0.Imprints);
      if (!b.Mind && b0.Mind) b.Mind = b0.Mind;
      if (!b.Next && b0.Next) b.Next = _.cloneDeep(b0.Next);
      if (num(b.Trust, 50) === 50) b.Trust = num(b0.Trust, 50);
      if (!num(b.Tension, 0)) b.Tension = num(b0.Tension, 0);
      mended.push(id);
    }
    if (kept.length) log.push(`Bond records cannot be removed (${kept.join(', ')}); they were kept. Change a bond's fields instead of replacing /Bonds.`);
    if (mended.length) log.push(`Bond record${mended.length > 1 ? 's' : ''} for ${mended.join(', ')} came back without facts or milestones; what was known was kept.`);
  }
  const seen = `${stamp(S.World)} at ${S.World.Location}`;
  // 1.30.1 (owner playtest: an invented Medical Centre healer was keyed "Mirelle Lullwyn"): the other academies' teams are never at
  // Halvard; their members meet {{user}} at the Kingdom Competition, on a trip or elsewhere off the grounds
  const onGrounds = !!plName(placeOf(S.World.Location)) && !awayIn(S) && !evs.some(e => e.kingdom);   // 1.32.0: calendar "kingdom" marks the travel days too
  for (const id of Object.keys(S.Scene.Present)) if (onGrounds && NO_BOND.has(id)) {
    delete S.Scene.Present[id];
    log.push(`${id} is on a rival academy's team and is never at Halvard (the teams meet at the Kingdom Competition); ${id} was removed from Scene.Present. Someone you invented gets a full name of their own (Extras), never a roster name.`);
  }
  for (const id of Object.keys(S.Scene.Present)) {
    if (NPC_IDS.has(id) && !(id in S.Bonds) && (ARRIVES[id] || 1) > S.World.Year) {   // v1.0.3: incoming cohort, not here yet
      // 1.39.0: Tsubaki, a Royal Mage before she is a student, may be met in Avalon (lore: the Royal Mages on Crowning Day)
      if (!(id === 'Tsubaki' && (((S.$ui || {}).area || {}).avalon || {}).on)) log.push(`${id} is not at Halvard yet (arrives as a first-year in Year ${ARRIVES[id]}); no bond was started. Check who this is.`);
    } else if (NPC_IDS.has(id) && !(id in S.Bonds) && !NO_BOND.has(id)) {   // 1.3.0: rival academy teams have no bond system
      S.Bonds[id] = { Rank: 0, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '', _Event_ready: false, $Known_old: [], $xp: 0, $cool: -1 };
      S.$ui.toasts.push(`New acquaintance: {npc:${id}}`);   // {npc:id}: the bar shows the name only once it is known (D14)
    }
    if (S.Bonds[id]) S.Bonds[id].Last_seen = seen;
  }
  const daily = S.$eng.daily || {};
  // 1.1.0 (Full): +1 to today's cap for a bond that grew "stuck indoors together" in rain/snow/storm, outdoors in fine mild weather,
  // or on a clear Star Night. At most +1 per bond per day.
  const bondWx = !!wxNow && ((!isOutdoor(S.World.Location) && wxBad(wxNow))
    || (isOutdoor(S.World.Location) && (wxNow.sky === 'Clear' || wxNow.sky === 'Cloudy') && wxNow.temp >= 15 && wxNow.temp <= 27)
    || (evs.some(e => /^Star Night/.test(e.t)) && wxDay(seed, S.World.Day === 'Sun' ? dayNo - 1 : dayNo).blocks[2].sky === 'Clear'));
  // 1.2.2: interactions the narrator reported this reply (/Interactions, emptied here); a raised Progress (pre-1.2.2 habit) with no
  // Interactions entry still counts once, as a talk (+1) or a hangout (+2 or more)
  const PACE = paceOf(S), bweek = _.isPlainObject(S.$eng.bweek) ? S.$eng.bweek : {};
  const romRank = Number.isFinite(+S.$ui.romrank) ? +S.$ui.romrank : BR.romance_default;
  const byId = {};
  for (const a of (Array.isArray(S.Interactions) ? S.Interactions : [])) {
    const id = canon(a && a.With); if (id && S.Bonds[id]) (byId[id] = byId[id] || []).push(a);
  }
  // 1.12.0: a genuine encounter or a Rank 5 handover reported one update late still counts for someone present at the end of the
  // previous update (they may have left in the reply that tells it)
  const wasHere = id => hasB && !!(((B.Scene || {}).Present || {})[id]);
  const npcAway = id => npcAwayIn(S, id);   // 1.16.1 (audit B4)
  const introductions = {};
  for (const a of S.Interactions || []) {
    if (a.Kind !== 'introduction') continue;
    const id = canon(a.With), by = canon(a.By), sponsor = S.Bonds[by];
    if (NPC_IDS.has(id) && !NO_BOND.has(id) && !BB[id] && S.Bonds[id] && !introductions[id]
        && (ARRIVES[id] || 1) <= S.World.Year && S.Scene.Present[id] && S.Scene.Present[by]
        && sponsor && sponsor.Rank >= 6 && sponsor.Trust >= trustGate(by, 6) && sponsor.Tension < 70
        && !npcAway(id) && !npcAway(by)) introductions[id] = by;
  }
  S.Interactions = [];
  S.$ui.rank_cues = [];
  // 1.3.0 reputation changes how fast NPCs warm up: extra XP per counted talk or hangout (REP.bond_mod), modifiers add up
  const modBy = (rows, L) => { const hit = rows.find(([at]) => (at > 0 ? L >= at : L <= at)); return hit ? hit[1] : 0; };
  const BM = REP.bond_mod || {};
  const repMod = id => (NPC_GROUP[id] === 'staff' ? modBy(BM.staff || [], repLv('Academy')) : 0) + (NPC_GROUP[id] === 'student' ? modBy(BM.student || [], repLv('Student')) : 0)
    + ((REP.anti_doves || []).includes(id) ? modBy(BM.anti_doves || [], repLv('Doves')) : 0) + ((REP.pro_doves || []).includes(id) ? modBy(BM.pro_doves || [], repLv('Doves')) : 0);
  // 1.15.0 (planning/DRAFT_grades_exams.md): +1 XP per counted talk or hangout with a teacher of a subject {{user}} got an A or B
  // in at the latest exams (once, however many of their subjects)
  const standing = !OFF.has('study') && S.$eng.study && _.isPlainObject(S.$eng.study.stand) ? S.$eng.study.stand : {};
  const PYb = _.clamp(num(S.Player.Profile.Year, 1), 1, 3);
  const examMod = id => (SUBJECTS.some(s => num(standing[s], -1) >= 3 && teaches(id, s, PYb, classRole(S.Player.Profile))) ? 1 : 0);
  // 1.3.0 mask -> truth (Castor, Kanae, Caine): the 8 -> 9 event waits until one of the NPC's secrets has come out in play
  const secretOut = id => [...(S.$ui.secrets || []), ...(S.Campus_State.Secrets_revealed || [])].some(x => String(x).toLowerCase().startsWith(id.toLowerCase() + '.'));
  const held = (id, b) => MASK.has(id) && b.Rank === 8 && !secretOut(id);
  const tenseHold = (id, b) => { const P = tensionProfile(id); return !P.exempt && !P.lock && num(b.Tension, 0) >= num(TE.hold_event_from, 70); };   // 1.3.8
  // 1.4.3; 1.6.8 (owner): the Rank 8 event waits too when this character has no rival branch (C, D)
  const trustHold = (id, b) => (b.Rank + 1 !== 8 || !canRival(id)) && num(b.Trust, 50) < trustGate(id, b.Rank + 1);
  const spreadFrom = [];
  const KR = REW.krieg || {}, weeksNew = hasB ? Math.max(0, Math.min(8, weekNo - weekNoB)) : 0;
  const b0rank = which => (which === 'gift' ? 5 : 10);
  const give = (id, which) => {                                // a Rank 5 gift / Rank 10 benefit, once
    const x = ((REW.npcs || {})[id] || {})[which];
    if (!x || !_.isPlainObject(S._Perks)) return;
    if (goneNow(id)) { log.push(`${id} has graduated: Rank ${b0rank(which)} brings no ${which === 'gift' ? 'gift' : 'Rank 10 benefit'} now.`); return; }   // 1.7.6 (owner)
    if (S._Perks[x.name] || (S.$ui.perks_used || []).some(u => u.startsWith(x.name + ' ('))) return;
    S._Perks[x.name] = { From: id, Kind: which === 'gift' ? 'gift' : 'rank10', Effect: x.text + (x.secret ? ` <narrator_only>${x.secret}</narrator_only>` : ''), Uses: x.uses || 0 };
    S.$ui.toasts.push(which === 'gift' ? `Gift from {npc:${id}}: ${x.name}` : `Rank 10 with {npc:${id}}: new benefit`);
    jnl.push(which === 'gift' ? `${id} gave {{user}} ${x.name}.` : `Rank 10 with ${id}: ${x.text.split(/(?<=\.)\s/)[0]}`);
    if (x.jump) trainJump(c, x.jump, `${x.name} (${id})`);
    if (x.rep_up && repLevelUp(x.rep_up, false)) log.push(`${x.rep_up} reputation rose one level (${id}, Rank 10).`);
  };
  const rankedUp = (id, b) => {
    const R0 = repOfNpc(id), mx = (REP.bond_milestone_xp || {})[String(b.Rank)];
    if (R0 && mx && !(b.$ms || []).includes(b.Rank)) { repAdd(R0, mx, `bond with ${id} reached Rank ${b.Rank}`, 'bond'); b.$ms = [...(b.$ms || []), b.Rank]; }   // 1.3.8: once per rank
    if (b.Rank === 5 && !goneNow(id)) b.$gift_pending = true;
    if (b.Rank === 10) give(id, 'r10');
    const nd = ((REW.npcs || {})[id] || {}).nudge;
    if (b.Rank === 8 && MASK.has(id) && nd && !(b.Known_facts || []).includes(nd.fact)) { b.Known_facts = [...(b.Known_facts || []), nd.fact]; log.push(`${id}: a new lead, "${nd.fact}"`); }
  };
  for (const [id, b] of Object.entries(S.Bonds)) {
    const b0 = BB[id];
    const g = num(b.Progress, 0) - num(b0 && b0.Progress, 0);
    if (hasB && g > 0 && !byId[id]) byId[id] = [{ Kind: g >= 2 ? 'hangout' : 'talk' }];
    // engine-owned fields come from the previous state; a record the AI (re)wrote cannot set them
    let xp = b0 ? num(b0.$xp, 0) : (hasB ? 0 : num(b.$xp, 0));
    b.Progress = 0;
    b._Event_ready = b0 ? !!b0._Event_ready : false;
    b.$cool = b0 ? num(b0.$cool, -1) : num(b.$cool, -1);
    b.$ms = b0 ? [...(b0.$ms || [])] : [...(b.$ms || [])]; b.$tf = b0 ? num(b0.$tf, 0) : num(b.$tf, 0);   // 1.3.8 engine-owned
    b.$tdrop = b0 ? num(b0.$tdrop, -99) : num(b.$tdrop, -99);   // 1.4.3
    b.$tlast = b0 ? num(b0.$tlast, 0) : 0; b.$tbrk = b0 ? num(b0.$tbrk, 0) : 0;   // 1.4.4
    b.$hut = b0 ? String(b0.$hut || '') : String(b.$hut || '');   // 1.31.0 the Old Hut month
    b.$Recent = b0 ? [...(b0.$Recent || [])] : [...(b.$Recent || [])];   // 1.4.4 engine-owned
    b.$Defining = b0 ? [...(b0.$Defining || [])] : [...(b.$Defining || [])];   // 1.6.0 engine-owned
    b.$gifts = _.cloneDeep(b0 ? b0.$gifts || {} : b.$gifts || {});
    b.$gift_pending = b0 ? !!b0.$gift_pending : !!b.$gift_pending;
    b.$branch = b0 ? String(b0.$branch || '') : String(b.$branch || '');   // 1.6.8 engine-owned: friend | romance | rival from Rank 8
    b.$met = b0 ? String(b0.$met || '') : ydate(S.World);   // 1.72.0 engine-owned: the day they met, and the day of Rank 8
    b.$b8 = b0 ? String(b0.$b8 || '') : '';
    if (!b.$branch && b0 && b0.Rank >= 8) b.$branch = b0.Romance ? 'romance' : /rival/i.test(String(b0.Title || '')) ? 'rival' : 'friend';   // saves from before 1.6.8
    b.$Knows_old = b0 ? [...(b0.$Knows_old || [])] : [...(b.$Knows_old || [])]; b.$seen = b0 ? num(b0.$seen, -1) : num(b.$seen, -1); b.$mw = b0 ? num(b0.$mw, -1) : num(b.$mw, -1);
    b.$apart = b0 ? num(b0.$apart, 0) : 0; b.$apartd = b0 ? num(b0.$apartd, -1) : -1;   // 1.73.0 engine-owned (stepBondMemory)
    const acts = [...(byId[id] || [])], rank0 = b0 ? b0.Rank : b.Rank, tw0 = num(b.Tension, 0), trw0 = num(b.Trust, 50);
    let rankTrust = 0;
    // 1.4.3: a new bond starts at the character's own Trust (owner: start by category). 1.6.11 (owner playtest: Trixie met for the
    // first time showed Trust 10, Betrayed): a number the narrator writes on a first meeting is not a deed, so it gives way too
    if (!b0 && hasB) { const s0 = trustProfile(id, S, secretOut).start + (!OFF.has('proficiency') && profRankOf(B, 'Society') >= MASTERY && (CONSUMMATE_GROUPS.includes(NPC_GROUP[id]) || NOBLES.includes(id)) ? MASTERY_FX.society_trust : 0); if (num(b.Trust, 50) !== 50 && num(b.Trust, 50) !== s0) log.push(`${id} is new: Trust starts at ${s0} by their nature (${num(b.Trust, 50)} written; a first meeting is not a deed).`); b.Trust = s0; }
    if (!b0 && hasB && START[id]) {                            // Etnie adopts {{user}} on sight.
      const st = START[id];
      b.Rank = st.Rank; b.$cool = dayNo + coolDays(st.Rank, PACE); xp = 0;
      if (!b.Title && st.Title) b.Title = st.Title;
      if (st.Trust) b.Trust = st.Trust;
      b.Known_facts = [...new Set([...(b.Known_facts || []), ...(st.Known_facts || [])])];
      b.Milestones = [...new Set([...(b.Milestones || []), ...(st.Milestones || [])])];
      S.$ui.toasts.push(`Bond with {npc:${id}} starts at Rank ${st.Rank}`);
      for (const m of st.Milestones || []) jnl.push(m + '.');
    } else if (!b0 && hasB && introductions[id]) {
      b.Rank = 1; b.$cool = dayNo + coolDays(1, PACE); xp = 0;
      b.Milestones = [...new Set([...(b.Milestones || []), `Introduced by ${introductions[id]}`])];
      log.push(`${introductions[id]} introduced {{user}} to ${id}; their bond begins at Rank 1.`);
    } else if (!b0 && hasB && b.Rank > 0) b.Rank = 0;
    if (b0 && b.Rank > b0.Rank) {
      b.Rank = b0.Rank;
      log.push(`Rank change for ${id} reverted: the engine deepens bonds after a real interaction, never by a direct rank write.`);
    }
    const genuine = (S.Scene.Present[id] || wasHere(id)) && !npcAway(id) && V._Fatigue !== 'Collapsed'
      && acts.some(a => /^(talk|hangout|study|gift|help|fight|keep|secret|defend|confide|birthday)$/.test(a.Kind));
    const eligible = b0 && b.Rank === b0.Rank && b.Rank < 10
      && (num(b0.$xp, 0) >= needXP(b0.Rank, PACE) || b0._Event_ready)
      && dayNo >= num(b0.$cool, -1) && !held(id, b) && !tenseHold(id, b) && !trustHold(id, b);
    if (eligible && genuine) {
      b.Rank++; xp = 0; b._Event_ready = false; b.$cool = dayNo + coolDays(b.Rank, PACE);
      // 1.16.1 (audit T4): no generic "grew closer" Milestone: $Recent records the rank, Milestones are the story's own
      notes.push(`Bond with ${id} deepened to Rank ${b.Rank}.`);
      if (_.isPlainObject(S.$eng.wk)) (S.$eng.wk.ranks = S.$eng.wk.ranks || []).push(`${id} reached Rank ${b.Rank}`);   // 1.10.0 recap
      rankedUp(id, b); rankTrust = num(TRU.rank_up, 0);
      S.$ui.rank_cues.push({ id, rank: b.Rank });
    } else if (b0 && b.Rank < b0.Rank) {
      b._Event_ready = false; log.push(`Bond with ${id} fell to Rank ${b.Rank}.`);
    }
    let need = needXP(b.Rank, PACE);
    const xpStart = xp;   // 1.4.4: for the recent history
    // XP: talk and hangout once a day each, gifts and help a few times a week; a loved gift counts more from Rank 3
    let gain = 0, partyGain = 0;
    const birthday = npcBirthday(id, S.World), mood = WXM === 'full' ? (S.$ui.moods[id] || {}).mood : 'Normal';
    const socialMod = (mood === 'Good' ? TU.mood_xp : mood === 'Bad' ? -TU.mood_xp : 0) - (V._Fatigue === 'Exhausted' ? 1 : 0);
    const recoveryMult = birthday ? BR.birthday.recovery_mult : 1;
    const d = daily[id] && daily[id].day === dayNo ? daily[id] : { day: dayNo }, w = bweek[id] && bweek[id].w === weekNo ? bweek[id] : { w: weekNo };
    // 1.3.0 Krieg (model B): Rank 1 from his introduction (the 0 -> 1 event is ready at once); then +weekly_xp every Monday while
    // Doves reputation >= min_doves (with hidden magic, also Dove attention <= max_attention), else Tension +1. Nothing from interactions.
    if (id === KR.id) {
      byId[id] = (byId[id] || []).filter(a => /^(gift|apology|birthday|letdown|offence)$/.test(a.Kind));
      if (b.Rank === 0) xp = need;
      else if (b0 && b.Rank < 10) for (let k = 0; k < weeksNew; k++) {
        if (repLv('Doves') >= KR.min_doves && !(S.Hidden._True_magic && num(S.Hidden.Dove_attention, 0) > KR.max_attention)) gain += KR.weekly_xp;
        else { b.Tension = _.clamp(num(b.Tension, 0) + 1, 0, 100); log.push(`Krieg: no bond progress this week (Doves reputation ${repLv('Doves')}${S.Hidden._True_magic ? ', Dove attention ' + S.Hidden.Dove_attention : ''}); Tension +1.`); }
      }
    }
    // 1.42.0 (audit 1.6): talk, hangout, study, help and gift XP need {{user}} and the NPC together (in the scene now or at the
    // start of this reply); a letter or a word from afar gives none
    const together = !!(S.Scene.Present[id] || wasHere(id)), apart = new Set();
    for (const a of byId[id] || []) {
      const k = String((a && a.Kind) || '').trim().toLowerCase();
      if (V._Fatigue === 'Collapsed') { log.push('Collapsed: no interaction until {{user}} wakes.'); continue; }
      if (!together && /^(talk|hangout|study|help)$/.test(k)) { apart.add(k); continue; }
      if (k === 'rank_gift') {
        if (b.$gift_pending && b.Rank >= 5 && (S.Scene.Present[id] || wasHere(id)) && !npcAway(id)) {
          give(id, 'gift'); b.$gift_pending = false;
        }
      } else if (k === 'birthday_party') {
        const party = S.$ui.party, h = Number(S.World.Time.split(':')[0]);
        const atParty = party && (party.where.startsWith('The Snug') ? /snug/i.test(S.World.Location) : S.World.Location.includes(S.Player.Profile.Dorm) && /common room/i.test(S.World.Location));
        if (party && party.guests.includes(id) && S.Scene.Present[id] && h >= 18 && h < party.endHour && atParty && !d.party) { d.party = 1; partyGain += BR.birthday.party_xp; }
      } else if (k === 'talk' || k === 'hangout' || k === 'study') {
        const socialKind = k === 'study' ? 'hangout' : k;
        if ((d[socialKind] || 0) >= BR.per_day[socialKind]) continue;
        d[socialKind] = (d[socialKind] || 0) + 1;
        const studyBonus = k === 'study' && !!r4Partner(S, id, 'study');   // 1.45.0 (audit 3.9): one partner rule
        const society = OFF.has('proficiency') ? 0 : num(S.Player._Proficiency.Society, 0);
        gain += Math.round(Math.max(0, BR.kind_xp[socialKind] + repMod(id) + examMod(id) + socialMod) * (birthday ? BR.birthday.social_mult : 1) * (studyBonus ? 1.25 : 1) * (society >= 5 ? 1.2 : society >= 4 ? 1.1 : 1));
        if (socialKind === 'hangout' && a.Invited && b.Rank >= 2 && S.Scene.Present[id] && !npcAway(id) && !w.invited) { gain++; w.invited = 1; }
      } else if (k === 'gift') {
        const bagKey = keyIn((B || {}).Inventory, a.Item || '');
        const giftNote = bagKey ? String(B.Inventory[bagKey].Note || '') : '';
        const gk = giftTier(id, a.Item, a.Gift, giftNote), firstBirthday = birthday && !d.birthdayGift;
        if (a.Item) { delete b.$gifts[a.Item]; b.$gifts[a.Item] = gk; capRecord(b.$gifts, BR.gift_log_cap); }
        const tension = gk === 'hated' ? BR.gift_hated_tension : gk === 'disliked' ? BR.gift_disliked_tension : 0;
        b.Tension = _.clamp(num(b.Tension, 0) + tension * (birthday ? BR.birthday.gift_mult : 1), 0, 100);
        log.push(`${id}: ${a.Item || 'gift'} — ${gk}${firstBirthday ? ' (birthday)' : ''}.`);
        if (!together) { apart.add('gift'); continue; }
        if (firstBirthday) d.birthdayGift = 1;
        else if ((w.gift || 0) >= BR.per_week.gift) { log.push(`${id} already had ${BR.per_week.gift} gifts this week: no bond XP for another.`); continue; }
        else w.gift = (w.gift || 0) + 1;
        let x = gk in BR.gift_xp ? BR.gift_xp[gk] : BR.gift_xp.neutral;
        if (gk === 'loved' && b.Rank >= BR.gift_bonus_rank) x = Math.round(x * BR.gift_bonus_mult);
        if (id !== KR.id) gain += x * (firstBirthday ? BR.birthday.gift_mult : 1);
      } else if (k === 'help') {
        if ((w.help || 0) >= BR.per_week.help) continue;
        w.help = (w.help || 0) + 1; gain += BR.kind_xp.help;
      }
    }
    if (apart.size) log.push(`${id} was not in the scene: no bond XP for ${[...apart].join(', ')} (only time together counts).`);
    // 1.1.0 weather bonus, kept: +1 once a day for time together indoors in bad weather, outdoors in fine weather, a clear Star Night
    if (V._Fatigue !== 'Collapsed' && together && bondWx && !d.wx && (byId[id] || []).some(a => /^(talk|hangout|study)$/i.test(String((a && a.Kind) || '').trim()))) { d.wx = 1; gain += BR.weather_xp; }
    // 1.44.0 (audit 3.13): a teammate fought beside {{user}}: bond XP once a year per competition tier (stepReputation's teamBond)
    if (teamBond && teamBond.ids.has(id) && id !== KR.id) { gain += teamBond.xp; log.push(`${id} fought beside {{user}} in the ${teamBond.tier} Competition: +${teamBond.xp} bond XP.`); }
    // ---- 1.4.3 Trust: drops as the narrator wrote them (x the category), rises only from reported deeds (x the category, capped a
    // week) and a rank earned; a quiet week recovers it towards the floor; then the overrides. tr0 (before this reply) decides what
    // Trust does to Tension and apologies below.
    if (V._Fatigue === 'Collapsed') byId[id] = [];
    const RP = trustProfile(id, S, secretOut), RO = RP.o, DH = RP.dh || {};
    const tr0 = b0 ? num(b0.Trust, 50) : num(b.Trust, 50), band0 = trustBand(tr0);
    let tr = num(b.Trust, 50), tdropped = 0, trXP = 0;
    if (b0) {
      if (tr > tr0) { log.push(`${id}'s Trust cannot be raised directly (${tr0} -> ${tr} undone): report the deed as an interaction (keep, secret, defend, confide).`); tr = tr0; }
      // 1.59.0 (narrator-load audit U8, owner): a letdown is reported in words (Kind letdown, Weight, Meant) and the engine draws its
      // size (data/trust.json letdown); every one counts; a drop also written directly is not added twice (the larger counts)
      let wdrop = 0;
      (byId[id] || []).forEach((a, i) => {
        if (String((a && a.Kind) || '').trim().toLowerCase() !== 'letdown') return;
        const wt = String(a.Weight || '').trim().toLowerCase(), meant = String(a.Meant || '').trim().toLowerCase();
        if (meant === 'forced') { log.push(`${id} knows {{user}} had no choice: Trust does not fall.`); return; }
        const r = ((meant === 'no_harm' ? LETDOWN.no_harm : LETDOWN.weights) || {})[wt];
        if (!r) { log.push(`${id}: letdown Weight "${wt}" is unknown (small, broken, secret_told, betrayal); Trust unchanged.`); return; }
        wdrop += rollInt(r[0], r[1], seed, dayNo, S.World.Time, id, i, 'letdown');
      });
      const written = Math.min(tr, tr0 - wdrop); let tback = 0; tr = tr0;
      // 1.4.4 (owner): once they understand {{user}} meant no harm, part of the last drop comes back (by nature, once, within 30 days)
      if ((byId[id] || []).some(a => /^understood$/i.test(String((a && a.Kind) || '').trim())) && RO.lock == null) {
        const back = Math.round(num(b.$tlast, 0) * num(RP.C.understood, 0));
        if (b.$tlast > 0 && dayNo - num(b.$tdrop, -99) <= num(TRU.understood_days, 30) && back > 0) { log.push(`${id} understands now: Trust +${back} (part of the last drop).`); tback = back; }
        else if (b.$tlast > 0) log.push(`${id} understands, but it does not give back what was lost${num(RP.C.understood, 0) ? ' (too long ago)' : ' (not in their nature)'}.`);
        b.$tlast = 0;
      }
      tr += tback;
      if (written < tr0) { tdropped = Math.ceil((tr0 - written) * RP.drop); tr -= tdropped; b.$tdrop = dayNo; b.$tlast = tdropped; }
      const kinds = { ...(TRU.kinds || {}), ...(RO.kind_extra || {}) };
      let add = 0;
      for (const a of byId[id] || []) {
        const k = String((a && a.Kind) || '').trim().toLowerCase();
        if (!(k in kinds) || d['tr_' + k]) continue;               // each kind once a day
        d['tr_' + k] = 1;
        add += kinds[k] * (a.Public && (TRU.public_mult || {})[k] ? TRU.public_mult[k] : 1) * num((RO.kind_mult || {})[k], 1);
      }
      add = Math.round(add * RP.rise);
      if (add > 0) {
        const got = Math.min(add, Math.max(0, num(TRU.weekly_cap, 8) - num(w.tr, 0)));
        if (got > 0) { w.tr = num(w.tr, 0) + got; tr += got; }
        if (got < add) log.push(`${id}: Trust rises at most +${TRU.weekly_cap} a week (+${got} of +${add} counted).`);
      }
      // 1.31.0 (owner-approved planning/DRAFT_location_activities.md): the Old Hut custom, what is said inside stays there. A confidence
      // there (confide or secret) counts a little more: Trust +1, once a month for each person, outside the weekly cap.
      const hutMonth = `${S.World.Year || 1}-${S.World.Month}`;
      if (placeKey(S.World.Location) === 'old hut' && b.$hut !== hutMonth && (byId[id] || []).some(a => /^(confide|secret)$/i.test(String((a && a.Kind) || '').trim()))) {
        b.$hut = hutMonth; tr += 1; log.push(`${id}: a confidence kept in the Old Hut, Trust +1 (once this month).`);
      }
      tr += rankTrust;
      if (weeksNew > 0 && tr < num(TRU.floor, 35) && RP.recover > 0 && dayNo - num(b.$tdrop, -99) >= 7) tr = Math.min(num(TRU.floor, 35), tr + RP.recover * weeksNew);
      if (RO.lock != null) {                                       // Althair: Trust stays put; a betrayal becomes bond XP
        if (tdropped > 0) {
          const cap = num(tensionProfile(id).daily_cap, 10), x = Math.min(Math.ceil(tdropped * num(RO.convert, 0.5)), Math.max(0, cap - num(d.tx, 0)));
          if (x > 0) { d.tx = num(d.tx, 0) + x; trXP = x; log.push(`${id} enjoyed being betrayed: Trust stays ${RO.lock}, bond XP +${x}.`); }
        }
        tr = RO.lock;
      }
      if (RO.floor_hard != null && tr < RO.floor_hard) {           // Etnie: never below 50; the rest of the blow becomes Tension
        const over = RO.floor_hard - tr; tr = RO.floor_hard;
        if (RO.overflow_to_tension) { b.Tension = _.clamp(num(b.Tension, 0) + over, 0, 100); log.push(`${id} cannot stop trusting {{user}}: it hurts instead (Tension +${over}).`); }
      }
      if (RO.floor_hidden != null) tr = Math.max(RO.floor_hidden, tr);   // Kanae while her Plan is hidden
      if (RO.cap != null) tr = Math.min(RO.cap, tr);                     // Caine and mages, until his secret is out
      if (tdropped >= num((TRU.spread || {}).at, 999) && RO.lock == null) spreadFrom.push(id);
    }
    b.Trust = _.clamp(Math.round(tr), 0, 100);
    if (birthday && !d.birthdayRemembered && (byId[id] || []).some(a => /^(gift|birthday)$/.test(a.Kind))) { d.birthdayRemembered = 1; if (RO.lock == null) { b.Trust = _.clamp(b.Trust + BR.birthday.remember_trust, 0, 100); log.push(`${id}: birthday remembered, Trust +${BR.birthday.remember_trust}.`); } }
    gain = Math.round(gain * num(DH.bond_xp_mult, 1));                   // Ottavio and his own Sky students
    // ---- 1.3.8 Tension: Althair's lock, Ezrel's half rises, fights, quiet-day decay, then its effects
    const TP = tensionProfile(id), t0 = b0 ? num(b0.Tension, 0) : num(b.Tension, 0);
    let t = num(b.Tension, 0), tgain = 0;
    // 1.59.0 (narrator-load audit U8, owner): an offence is reported in words (Kind offence, Weight) and the engine draws its size
    // (data/tension.json offence); several add up, never capped; a rise also written directly is not added twice (the larger counts)
    let wrise = 0;
    (byId[id] || []).forEach((a, i) => {
      if (String((a && a.Kind) || '').trim().toLowerCase() !== 'offence') return;
      const wt = String(a.Weight || '').trim().toLowerCase(), r = (OFFENCE.weights || {})[wt];
      if (!r) { log.push(`${id}: offence Weight "${wt}" is unknown (slight, jealous, insult, violence); Tension unchanged.`); return; }
      wrise += rollInt(r[0], r[1], seed, dayNo, S.World.Time, id, i, 'offence');
    });
    if (wrise > 0) { const direct = Math.max(0, tw0 - (b0 ? t0 : 0)); if (wrise > direct) t = _.clamp(t + wrise - direct, 0, 100); }
    if (b0 && t > t0) {
      if (TP.lock) {                                             // Althair: every rise becomes bond XP (/2, rounded up, capped a day)
        const add = Math.min(Math.ceil((t - t0) * (TP.convert || 0.5)), Math.max(0, num(TP.daily_cap, 10) - num(d.tx, 0)));
        if (add > 0) { d.tx = num(d.tx, 0) + add; tgain = add; log.push(`${id} enjoyed that: Tension stays 0, bond XP +${add}.`); }
      } else {
        const small = t - t0 <= num(TRE.small_tension_max, 15);
        const m = (mood === 'Bad' ? TU.mood_tension : 1) * TP.riseMult * num(DH.tension_rise_mult, 1) * (band0 === 'Confidant' && small ? num(TRE.confidant_small_tension_mult, 0.5) : band0 === 'Betrayed' ? num(TRE.betrayed_tension_mult, 1.5) : 1);
        if (m !== 1) t = t0 + Math.ceil((t - t0) * m);   // 1.4.3: Trust and the Dorm Head
      }
    }
    if (TP.lock) t = 0;
    // 1.4.0 (owner): an apology eases Tension by the NPC's category (or override); one a day, and each further one in the same week
    // counts half. Some NPCs take it badly (apology_npc, e.g. Sophia: it raises Tension).
    const apo = (byId[id] || []).find(a => /^apolog/i.test(String((a && a.Kind) || '').trim()));
    if (apo && !TP.lock && !d.apology) {
      const A = (TEN.apology_npc || {})[id] || TP.apology || { private: 0, public: 0 };
      let x = num(apo.Public ? A.public : A.private, 0);
      if (num(w.apo, 0) > 0) x = Math.sign(x) * Math.round(Math.abs(x) * num(TE.apology_repeat_mult, 0.5));
      if (x < 0) x = Math.round(x * num((TRE.apology_mult || {})[band0], 1) * num(DH.apology_mult, 1) * recoveryMult * (mood === 'Good' ? TU.mood_apology : 1));   // 1.4.3: how much they believe it
      d.apology = 1; w.apo = num(w.apo, 0) + 1;
      if (x < 0 && t > 0) { const was = t; t = Math.max(0, t + x); log.push(`${id} accepted the apology${apo.Public ? ' (in public)' : ''}: Tension ${was} -> ${t}.`); }
      else if (x > 0) { const was = t; t = Math.min(100, t + x * (mood === 'Bad' ? TU.mood_tension : 1)); log.push(`The apology made it worse with ${id}: Tension ${was} -> ${t}.`); }
      else if (t > 0) log.push(`An apology changes nothing with ${id}.`);
    }
    if (TP.cat === 'confrontational' && (byId[id] || []).some(a => /^fight$/i.test(String((a && a.Kind) || '').trim())) && !d.fight && t > 0) {
      d.fight = 1; const was = t; t = Math.max(0, t - num(TE.fight_ease, 25) * recoveryMult); log.push(`A fight with ${id} cleared the air: Tension ${was} -> ${t}.`);
    }
    // 1.4.4 (owner): kindness eases Tension by the character's nature (kind_ease: help / keep / defend; Social only a public
    // defence), once a day
    if (!TP.lock && t > 0 && !d.kind) {
      const KE = TP.kind_ease || {};
      const hit = (byId[id] || []).map(a => { const k = String((a && a.Kind) || '').trim().toLowerCase(); return k === 'defend' && a.Public && KE.defend_public != null ? KE.defend_public : KE[k]; }).filter(x => x < 0);
      if (hit.length) { const x = Math.min(...hit) * recoveryMult, was = t; d.kind = 1; t = Math.max(0, t + x); log.push(`${id} took the kindness to heart: Tension ${was} -> ${t}.`); }
    }
    if (b0 && hasB && dayNo > dayNoB && t <= t0 && TP.decay > 0 && t > 0) {   // quiet days (no rise in this update)
      const f = num(b.$tf, 0) + TP.decay * num(DH.tension_decay_mult, 1) * TU.tension_fade * (Math.min(60, dayNo - dayNoB) + (birthday ? recoveryMult - 1 : 0)), whole = Math.floor(f);
      t = Math.max(0, t - whole); b.$tf = r2(f - whole);
    }
    b.Tension = _.clamp(Math.round(t), 0, 100);
    if (Object.keys(d).length > 1) daily[id] = d;
    if (Object.keys(w).length > 1) bweek[id] = w;
    const cross = at => b0 && t0 < at && b.Tension >= at;
    // a public falling-out costs reputation like a bond milestone earns it (staff: Academy, students: Student, Milena: Doves).
    // 1.3.1: high Tension costs tension_xp, maximum Tension another tension_max_xp; Settings can turn it off. Kanae is exempt.
    if (TU.rep_tension && repOfNpc(id) && !TP.exempt) {
      for (const [at, x, what] of [[REP.tension_high, REP.tension_xp, 'high'], [REP.tension_max, REP.tension_max_xp, 'maximum']]) {
        if (at && x && cross(at)) {
          const got = repAdd(repOfNpc(id), x, `${what} tension with ${id}`, '');
          if (got) log.push(`${what === 'high' ? 'High' : 'Maximum'} tension with ${id}: ${repOfNpc(id)} reputation ${got} XP.`);
        }
      }
    }
    if (TU.rep_tension && TP.enemy_rep && cross(TEN.bands[TEN.bands.length - 1][0])) {   // Social: a gossip campaign
      for (const [r, x] of Object.entries(TP.enemy_rep)) { const got = repAdd(r, x, `${id} turned the students against {{user}}`, ''); if (got) log.push(`${id} turned the room against {{user}}: ${r} reputation ${got} XP.`); }
    }
    if (id === (TEN.krieg && KR.id) && cross(TEN.krieg.at)) {   // Krieg at maximum Tension: the Dovecote turns on {{user}}
      if (S.Hidden._True_magic) { S.Hidden.Dove_attention = _.clamp(num(S.Hidden.Dove_attention, 0) + num(TEN.krieg.attention, 10), 0, 100); log.push(`Krieg has made {{user}} his business: Dove attention +${TEN.krieg.attention}.`); }
      const got = repAdd('Doves', TEN.krieg.doves_xp, 'Krieg turned the Dovecote against {{user}}', ''); if (got) log.push(`Krieg turned the Dovecote against {{user}}: Doves reputation ${got} XP.`);
    }
    if (b.Tension < num(TE.rank_drop_rearm, 70)) b.$tbrk = 0;   // 1.4.4: re-armed once it has really cooled
    if (cross(num(TE.rank_drop_at, 100)) && !TP.exempt && !TP.lock && b.Rank > 0 && !b.$tbrk) {   // maximum Tension breaks a rank (once per blow-up)
      b.$tbrk = 1; b.Rank -= 1; xp = 0; b._Event_ready = false; b.$cool = dayNo + coolDays(b.Rank, PACE); need = needXP(b.Rank, PACE);
      S.$ui.toasts.push(`Bond with {npc:${id}} fell to Rank ${b.Rank}`); notes.push(`The bond with ${id} broke down to Rank ${b.Rank}.`);
      log.push(`Maximum Tension with ${id}: the bond fell to Rank ${b.Rank}.`);
    }
    // what Tension does to the bond (everyone the same, but Kanae and Althair): Strained halves XP, Enemy stops it
    if (!TP.exempt && !TP.lock) {
      if (b.Tension >= num(TE.stop_xp_from, 90)) gain = 0;
      else if (b.Tension >= num(TE.strained_from, 40)) gain = Math.round(gain * num(TE.strained_xp_mult, 0.5));
    }
    if (trustBand(b.Trust) === 'Betrayed' && RO.lock == null && !RO.no_gates) gain = Math.round(gain * num(TRE.betrayed_xp_mult, 0.5));   // 1.4.3
    gain += tgain + trXP + partyGain;
    xp = b.Rank >= 10 ? 0 : Math.min(need, xp + gain);          // full XP waits for the next genuine interaction
    b.$xp = xp;
    const ready = b.Rank < 10 && xp >= need && dayNo >= num(b.$cool, -1) && !held(id, b) && !tenseHold(id, b) && !trustHold(id, b);
    b._Event_ready = ready; // legacy save field: readiness only, never a scripted event
    // romance opens at the rank chosen in Settings (default 8); feelings can grow earlier in the story, the flag waits.
    // 1.6.8 (owner): never for a character whose canon has no romance branch (B, D); a romance from an older save stays.
    if (hasB && b.Romance && !(b0 && b0.Romance) && !canRomance(id)) {
      b.Romance = false; log.push(`Romance with ${id} is closed (canon: ${id} does not become a romance); the flag was not set.`);
    } else if (hasB && b.Romance && !(b0 && b0.Romance) && (romRank > 10 || b.Rank < romRank)) {
      b.Romance = false;
      log.push(romRank > 10 ? `Romance flags are off (Settings); ${id}'s was not set.` : `Romance with ${id} opens at Rank ${romRank} (Settings); the flag was not set yet.`);
    } else if (hasB && b.Romance && !(b0 && b0.Romance) && b.Trust < trustGate(id, 8)) {   // 1.4.3
      b.Romance = false; log.push(`Romance with ${id} needs Trust ${trustGate(id, 8)} (now ${b.Trust}); the flag was not set yet.`);
    }
    // 1.6.8: the branch the bond took, recorded once when it reaches Rank 8 (a romance flag accepted later turns it into a romance).
    // 1.6.9 (bug hunt): decided by the Trust the 7->8 event was played on (before this reply's +3 for the rank), so a rivalry the
    // narrator was told to play at Trust 47-49 is not recorded as a best friendship.
    const tr8 = num(b0 && b0.Rank < 8 ? b0.Trust : b.Trust, 50);
    if (hasB && b.Romance && !(b0 && b0.Romance)) { b.$branch = 'romance'; b.$b8 = ydate(S.World); jnl.push(`Romance began with ${id}.`); }   // 1.62.0 (M3): a Journal landmark
    else if (hasB && b.Rank >= 8 && !b.$branch) { b.$branch = b.Romance ? 'romance' : canRival(id) && tr8 < trustGate(id, 8) ? 'rival' : 'friend'; b.$b8 = ydate(S.World); }
    else if (b.Rank < 8 && b.$branch) { b.$branch = ''; b.$b8 = ''; }
    // 1.4.4 (owner): the bond's recent history with {{user}}: when, one sentence (the narrator's Note, else the kinds), the effect.
    // Only what {{user}} did or reported: quiet-day easing and weekly recovery write no row.
    if (hasB) {
      const fx = [], dx = b.Rank < rank0 ? 0 : Math.max(0, num(b.$xp, 0) - xpStart), dT = b.Trust - (b0 ? num(b0.Trust, 50) : b.Trust), dX = b.Tension - (b0 ? num(b0.Tension, 0) : b.Tension);
      if (b0 && b.Rank > rank0) fx.push(`Rank ${rank0} → ${b.Rank}`); else if (b0 && b.Rank < rank0) fx.push(`Rank fell to ${b.Rank}`);
      if (dx > 0) fx.push(`XP +${dx}`); if (trXP + tgain > 0 && !dx) fx.push('enjoyed it');
      const sg = x => (x > 0 ? '+' + x : '−' + Math.abs(x));
      if (dT) fx.push(`Trust ${sg(dT)}`); if (dX) fx.push(`Tension ${sg(dX)}`);
      if (b.Romance && !(b0 && b0.Romance)) fx.push('romance');
      const notes = [...new Set(acts.map(a => String((a && a.Note) || '').trim()).filter(Boolean))];
      const PH = (BR.recent || {}).phrases || {}, kinds = [...new Set(acts.map(a => String((a && a.Kind) || '').trim().toLowerCase()).filter(k => PH[k]))].map(k => PH[k]);
      const said = notes.join(' ') || (kinds.length ? kinds.join(', ').replace(/^./, c => c.toUpperCase()) + '.' : '');
      let pushed = false;   // 1.10.3: a defining moment is only ever this update's own row
      // 1.39.0: Tsubaki remembers {{user}} from Avalon if they met there on Crowning Day before she came to Halvard
      const tsu = id === 'Tsubaki' && !b0 && ((((S.$eng || {}).area || {}).avalon) || {}).tsu;
      if (tsu) b.$Recent.push({ w: tsu, n: 'Met {{user}} in Avalon on Crowning Day, before she came to Halvard: she was lost, and she remembers who helped.', fx: '' });
      if (!b0) b.$Recent.push({ w: stamp(S.World), n: tsu ? `Met again at Halvard, at ${S.World.Location}; she knows {{user}} from Avalon.` : `First met, at ${S.World.Location}.`, fx: b.Rank > 0 ? `Bond starts at Rank ${b.Rank}` : '' });
      else if (acts.length || fx.length && (b.Rank !== rank0 || trw0 !== num(b0.Trust, 50) || tw0 !== num(b0.Tension, 0) || dx > 0)) {
        b.$Recent.push({ w: stamp(S.World), n: said || '(no note)', fx: fx.join(', ') }); pushed = true;
      }
      b.$Recent = b.$Recent.slice(-num((BR.recent || {}).keep, 10));
      // 1.6.0 (P4): defining moments. A big row (a rank changed, Trust moved 15+, Tension rose 20+, romance began) is also kept
      // for good; at most DEFINING_MAX, the smallest leaves first (ties: the older one)
      const big = (b0 && b.Rank !== rank0 ? 3 : 0) + (Math.abs(dT) >= 15 ? Math.abs(dT) / 5 : 0) + (dX >= 20 ? dX / 10 : 0) + (b.Romance && !(b0 && b0.Romance) ? 3 : 0);
      if (b0 && big > 0 && pushed) {
        const r = b.$Recent[b.$Recent.length - 1];
        b.$Defining = [...b.$Defining, { w: r.w, n: r.n, fx: r.fx, s: Math.round(big * 10) / 10 }];
        while (b.$Defining.length > DEFINING_MAX) { let lo = 0; b.$Defining.forEach((x, i) => { if (x.s < b.$Defining[lo].s) lo = i; }); b.$Defining.splice(lo, 1); }
        // 1.74.0: word gets around. A loud moment (Trust moved 15+, Tension rose 20+, a romance began) told by someone who talks
        // about themselves (Trust category open or normal, data/bond_openness.json) reaches their friends (TRU.friends, the
        // betrayal spread's list) WORD_DAYS later as a Knows line (stepBondMemory). A betrayal spreads on its own (spreadFrom).
        const loud = Math.abs(dT) >= 15 || dX >= 20 || (b.Romance && !b0.Romance);
        if (loud && r.n !== '(no note)' && !spreadFrom.includes(id) && ['open', 'normal'].includes((TRU.npcs || {})[id] || 'normal')) {
          const to = ((TRU.friends || {})[id] || []).filter(f => f !== id && !(S.Scene.Present || {})[f]);   // those here saw it
          if (to.length) S.$eng.word = [...(Array.isArray(S.$eng.word) ? S.$eng.word : []), { from: id, n: r.n, due: dayNo + WORD_DAYS, to }].slice(-40);
        }
      }
    }
  }
  Object.assign(c, { canon, BB, daily, PACE, bweek, npcAway, spreadFrom, KR });
}

// ---- 6c. 1.6.0 (Batch C, P4/N4): what each character carries of {{user}}. Knows: dated, the latest KNOWS_VISIBLE (older
// lines move to $Knows_old). Imprints: weight 5+, at most IMPRINT_MAX; over the cap the lightest goes, and the new one must
// outweigh it; a "fixed" character (data/npc_canon.json Change) is never rewritten, only deepened; a "shaped" or "fluid" one keeps
// what the belief replaced (Was). Next (Rank NEXT_RANK+): their own plan when they leave; brought back when they meet {{user}}
// again ("since you last saw them") or, once it lapses unseen, moved into $Recent. Meanwhile: Rank MEANWHILE_RANK+ bonds unseen
// for a week get one Journal line a week about their own life.
// 1.18.0 (I6): a newly confirmed keeper of the true magic also remembers learning it.
// 1.62.0 (memory audit M3): Knows and Known_facts keep their latest `max` lines in view plus the newest PIN_MAX pinned ("!") lines;
// the rest move to the hidden list (oldKey), which keeps the latest 20. 1.63.0 (M5): plus the list's fold line, always first; lines
// that move wait for a fold (qKey counts them at the end of oldKey, which never drops one still waiting).
function capPinned(b, key, oldKey, max) {
  const qKey = key === 'Knows' ? '$Knows_q' : '$Known_q';
  const L0 = (Array.isArray(b[key]) ? b[key] : []).map(String), folds = L0.filter(l => FOLDED.test(l));
  const L = L0.filter(l => !FOLDED.test(l));
  const pins = new Set(L.filter(l => PINNED.test(l)).slice(-PIN_MAX)), plain = L.filter(l => !pins.has(l));
  const over = new Set(plain.slice(0, Math.max(0, plain.length - max)));
  b[key] = [...folds.slice(-1), ...L.filter(l => !over.has(l))];
  const moved = [...folds.slice(0, -1), ...L.filter(l => over.has(l))];
  const old = [...(Array.isArray(b[oldKey]) ? b[oldKey] : []), ...moved];
  b[qKey] = Math.min(FOLD.waitMax, num(b[qKey], 0) + moved.length, old.length);
  b[oldKey] = old.slice(-Math.max(20, b[qKey]));
}
function stepBondMemory(c) {
  const { S, B, log, jnl, hasB, absA, dayNo, weekNo, canon, BB, daily, PACE, bweek, npcAway, spreadFrom } = c;
  if (hasB && S.Hidden._True_magic) {
    const known0 = new Set(((B.Hidden || {}).Known_by || []).map(canon));
    for (const raw of S.Hidden.Known_by || []) {
      const id = canon(raw), b = S.Bonds[id];
      if (id && !known0.has(id) && b) {
        b.Knows = Array.isArray(b.Knows) ? b.Knows : [];
        if (![...b.Knows, ...(b.$Knows_old || [])].some(x => /learned .*true magic/i.test(String(x))))
          b.Knows.push(`! Learned {{user}}'s true magic.`);   // 1.62.0 (M3): pinned
      }
    }
  }
  {
    const presentIds = new Set(Object.keys(S.Scene.Present || {}));
    const wasHere = new Set(Object.keys((hasB && B.Scene && B.Scene.Present) || {}));
    const since = [];
    // 1.74.0: word that has travelled (stepBonds) lands in the friends' Knows, dated below like any new line
    S.$eng.word = (Array.isArray(S.$eng.word) ? S.$eng.word : []).filter(x => {
      if (num(x.due, 0) > dayNo) return true;
      for (const f of x.to || []) { const fb = S.Bonds[f]; if (fb) fb.Knows = [...(Array.isArray(fb.Knows) ? fb.Knows : []), `Heard from ${x.from}: ${x.n}`]; }
      return false;
    });
    for (const [id, b] of Object.entries(S.Bonds)) {
      const b0 = BB[id] || null;
      b.Knows = (Array.isArray(b.Knows) ? b.Knows : []).map(k => String(k).trim()).filter(Boolean);
      const old0 = new Set(b0 ? [...(b0.Knows || []), ...(b0.$Knows_old || [])] : []);
      b.Knows = [...new Set(b.Knows)].map(k => (old0.has(k) ? k : /^\[(Y\d+ )?M\d{1,2} W[1-4]/.test(k) ? (S.World.Year > 1 ? withYear(k, S.World.Year) : k) : `[${dstamp(S.World)}] ${k}`));
      capPinned(b, 'Knows', '$Knows_old', KNOWS_VISIBLE);
      // Imprints
      const I0 = b0 ? (b0.Imprints || []) : [], key = x => String(x.Belief || '').trim().toLowerCase();
      let I = (Array.isArray(b.Imprints) ? b.Imprints : []).filter(x => x && String(x.Belief || '').trim());
      const fresh = I.filter(x => !I0.some(y => key(y) === key(x)));
      for (const x of fresh) {
        if (!x.When) x.When = dstamp(S.World); else if (S.World.Year > 1) x.When = withYear(x.When, S.World.Year);
        if (num(x.Weight, 0) < 5) { I = I.filter(y => y !== x); log.push(`An Imprint for ${id} needs weight 5 or more (an experience that changes who they are); "${x.Belief}" was not kept. Record smaller moments as Known_facts or Knows.`); }
      }
      while (I.length > IMPRINT_MAX) {
        const kept = I.filter(y => !fresh.includes(y)), x = fresh.find(y => I.includes(y));
        if (!x) { I = I.slice(-IMPRINT_MAX); break; }
        let lo = null; for (const y of kept) if (!lo || num(y.Weight, 0) < num(lo.Weight, 0)) lo = y;
        const ch = CHANGE[id] || '';
        if (ch === 'fixed' || !lo || num(x.Weight, 0) <= num(lo.Weight, 0)) {
          I = I.filter(y => y !== x);
          log.push(ch === 'fixed' ? `${id} does not change at the core (fixed): with ${IMPRINT_MAX} Imprints, a new one can only deepen a belief they hold (edit its Weight), not replace one. "${x.Belief}" was not kept.`
            : `${id} already holds ${IMPRINT_MAX} Imprints; "${x.Belief}" (weight ${num(x.Weight, 0)}) does not outweigh the lightest one, so it was not kept.`);
        } else { x.Was = lo.Belief; I = I.filter(y => y !== lo); log.push(`${id}'s Imprint "${lo.Belief}" gave way to "${x.Belief}".`); }
      }
      b.Imprints = I.map(x => ({ Belief: String(x.Belief).trim(), Weight: _.clamp(Math.round(num(x.Weight, 5)), 5, 10), When: String(x.When || ''), From: String(x.From || ''), Was: String(x.Was || ''),
        Feel: feelOf(x.Feel || (I0.find(y => key(y) === key(x)) || {}).Feel) }));   // 1.72.0 (a rewrite without it keeps the old one)
      // Next
      let nx = b.Next && typeof b.Next === 'object' && String(b.Next.What || '').trim() ? { What: String(b.Next.What).trim(), Where: String(b.Next.Where || '').trim(), Until: String(b.Next.Until || '').trim() } : null;
      if (nx && b.Rank < NEXT_RANK) { if (!(b0 && b0.Next)) log.push(`Next plans are kept for bonds of Rank ${NEXT_RANK} or more; ${id}'s was not kept.`); nx = null; }
      const until = agendaWhen(c)('n:' + id, nx ? nx.Until : '', nx, 'Until');   // 1.44.0 (Agenda): parsed once; "tomorrow" no longer moves on
      if (nx && presentIds.has(id) && !wasHere.has(id) && b0 && b0.Next) {
        since.push([id, nx.What + (nx.Where ? ' (' + nx.Where + ')' : ''), nx.Until]); nx = null;
      } else if (nx && until >= 0 && until < absA && !presentIds.has(id)) {
        b.$Recent = [...b.$Recent, { w: String(nx.Until || stamp(S.World)), n: `(Off-screen) ${nx.What}${nx.Where ? ' (' + nx.Where + ')' : ''}.`, fx: '' }].slice(-num((BR.recent || {}).keep, 10)); nx = null;
      }
      b.Next = nx;
      // 1.73.0: time apart. A Rank APART_RANK+ character who comes back into the scene after APART_DAYS+ days unseen carries the
      // gap ($apart days, nowOf's "Apart" line) for the rest of that day's scene; it ends when they leave or the day changes
      if (hasB && presentIds.has(id) && !wasHere.has(id) && b.Rank >= APART_RANK && b.$seen >= 0 && dayNo - b.$seen >= APART_DAYS) { b.$apart = dayNo - b.$seen; b.$apartd = dayNo; }
      else if (!presentIds.has(id) || b.$apartd !== dayNo) { b.$apart = 0; b.$apartd = -1; }
      // Meanwhile
      if (presentIds.has(id)) b.$seen = dayNo;
      const wk = Math.floor(dayNo / 7);
      if (hasB && b.Rank >= MEANWHILE_RANK && !presentIds.has(id) && b.$seen >= 0 && dayNo - b.$seen >= 7 && b.$mw !== wk && !awayIn(S)) {
        b.$mw = wk;
        const what = b.Next ? b.Next.What : (HAUNT[id] ? 'was seen around ' + HAUNT[id].split(/[;,]/)[0].trim() : 'kept to their own business');
        const pair = !b.Next && pairLine(c, [id], 'seen', 'mw:' + id);   // 1.51.0 (audit 4.8): seen with someone {{user}} knows them by
        jnl.push(`Meanwhile: ${pair || `${id} ${b.Next ? 'is busy with ' + what.replace(/^./, c => c.toLowerCase()) : what}`}.`);
      }
    }
    S.$ui.since = since;   // 1.47.0: "May be here" ($ui.maybe) is stepHere's, from whereabouts
  }
  // 1.4.3: word of a betrayal reaches the NPC's friends (their Friends lines), once; then the Rank 10 benefits Trust suspends
  for (const id of spreadFrom) {
    const hit = ((TRU.friends || {})[id] || []).filter(f => S.Bonds[f] && f !== id && ((TRU.overrides || {})[f] || {}).lock == null);
    for (const f of hit) {
      const o = (TRU.overrides || {})[f] || {}, was = S.Bonds[f].Trust; S.Bonds[f].Trust = Math.max(o.floor_hard != null ? o.floor_hard : 0, was + num(TRU.spread.friends, -5)); S.Bonds[f].$tdrop = dayNo;
      if (was !== S.Bonds[f].Trust) S.Bonds[f].$Recent = [...(S.Bonds[f].$Recent || []), { w: stamp(S.World), n: `Heard what {{user}} did to ${id}.`, fx: `Trust −${was - S.Bonds[f].Trust}` }].slice(-num((BR.recent || {}).keep, 10));   // 1.4.4
    }
    if (hit.length) log.push(`Word of what {{user}} did to ${id} reached ${hit.join(', ')}: their Trust ${TRU.spread.friends}.`);
  }
  S.$ui.tsusp = tsuspOf(S, S.Bonds);
  for (const k of Object.keys(bweek)) if (bweek[k].w !== weekNo) delete bweek[k];
  S.$eng.bweek = bweek;
  // Passive readiness and visit access. The relationship changes inside ordinary scenes.
  S.$ui.close = Object.entries(S.Bonds).filter(([id, b]) => b.Rank < 10 && num(b.$xp, 0) >= Math.ceil(needXP(b.Rank, PACE) * num(BR.close_at, 0.8))).map(([id]) => id);
  const visiting = Object.entries(S.Bonds).filter(([id, b]) => b.Rank >= 7 && b.Trust >= 50 && b.Tension < 70 && !npcAway(id));
  const accessDay = !awayIn(S) && !/LOCKDOWN|CURFEW/.test(String(S.World._Curfew || ''));
  S.$ui.rank_access = {
    dorms: accessDay ? [...new Set(visiting.filter(([id]) => NPC_GROUP[id] === 'student' && (S.Scene.Present || {})[id]).map(([id]) => NPC_DORMS[id]).filter(Boolean))] : [],
    staff: accessDay ? visiting.filter(([id]) => NPC_GROUP[id] === 'staff' || id === 'Bobby' || id === 'Milena').map(([id]) => id) : []
  };
  for (const b of Object.values(S.Bonds)) capPinned(b, 'Known_facts', '$Known_old', FACTS_VISIBLE);
  for (const id of Object.keys(daily)) if (daily[id].day !== dayNo) delete daily[id];
  S.$eng.daily = daily;
}

// 1.45.0 (audit 3.9): one practice session, several tracks (proficiency and craft actions, mana, stamina, study). One fitness check
// for a mana or stamina session (Practice actions that train, /Practice Track, the old /Training) and one partner rule for every
// track data/rank4_partners.json lists (mana, stamina, study): a Rank 4+ bonded NPC with Trust 35+ and Tension under 70, in the
// scene and not away. Each track keeps its own weekly limit.
const unfitToTrain = (S, track) => {
  const hurt = Object.values(S.Player.Injuries || {}).some(i => /serious|critical/.test(i.Severity) || track === 'stamina' && i.Severity === 'moderate');
  return hurt ? 'Injured' : /Exhausted|Collapsed/.test(S.Player.Vitals._Fatigue) ? 'Too tired to train' : '';
};
function r4Partner(S, name, track) {
  const id = NPC_ALIAS[String(name || '').trim().toLowerCase()] || String(name || '').trim(), b = (S.Bonds || {})[id];
  const here = Object.keys((S.Scene || {}).Present || {}).some(k => (NPC_ALIAS[k.toLowerCase()] || k) === id);
  return b && here && b.Rank >= 4 && b.Trust >= 35 && b.Tension < 70 && !npcAwayIn(S, id) && (RANK4_PARTNERS[id] || []).includes(track) ? id : '';
}
// Training room left on a track this week and in all (section 6b); a reward jump (section 6) skips the weekly limit only.
function trainRoom(c, k, weekly) {
  const { S, weekNo, TU } = c;
  const T = S.Player.$Training[k]; if (!T) return 0;
  if (T.w !== weekNo) { T.w = weekNo; T.wg = 0; }
  const tot = TU.trn_total > 0 ? T.base * TU.trn_total / 100 - T.gain : Infinity;   // 1.3.1 Settings: 0 = no limit
  return Math.max(0, weekly && TU.trn_week > 0 ? Math.min(T.base * TU.trn_week / 100 - T.wg, tot) : tot);
}
function trainAdd(c, k, amt, weekly) {
  const S = c.S, T = S.Player.$Training[k], f = TRN.tracks[k].field, add = r2(Math.max(0, Math.min(amt, trainRoom(c, k, weekly))));
  if (add > 0) { S.Player.Vitals[f] = r2(S.Player.Vitals[f] + add); T.gain = r2(T.gain + add); if (weekly) T.wg = r2(T.wg + add); }
  return add;
}
function trainJump(c, k, why) {
  const S = c.S, T = S.Player.$Training[k]; if (!T) return;
  const add = trainAdd(c, k, T.base * REW.jump_pct / 100, false);
  c.log.push(add > 0 ? `${TRN.tracks[k].label} +${add} at once (${why}).` : `${TRN.tracks[k].label} is already at its training limit; ${why} adds nothing.`);
  if (add > 0) S.$ui.toasts.push(`${TRN.tracks[k].label} +${add}`);
}

// ---- 6b. 1.3.0 training: Mana pool (Mana_max) and Stamina (Stamina_max). The narrator reports sessions in /Training. One session
// adds TRN.session_pct % of the starting value x (1 + partner bonuses), at most TRN.weekly_pct % a week and TRN.total_pct % in all.
// Partners: an NPC whose Rank 5 gift is a training bonus for that track, in the scene. Jumps (rewards) skip the weekly limit only.
function stepTraining(c) {
  const { S, log, goneNow, TU, V, canon } = c;
  {
    const here = new Set(Object.keys(S.Scene.Present || {}).map(canon));
    // 1.7.0: a Rank 10 benefit can carry the training bonus too (Linus: mana, Tsubaki: stamina); a suspended benefit (low Trust) does not count
    const partners = k => Object.entries(REW.npcs || {}).filter(([id, x]) => here.has(id) && !goneNow(id) && ['gift', 'r10'].some(g => x[g] && x[g].train === k && S._Perks[x[g].name] && S._Perks[x[g].name].Kind !== 'memento' && !(S.$ui.tsusp || []).includes(x[g].name))).map(([id]) => id);
    for (const x of c.sessions || []) {   // 1.45.0 (audit 3.9): gathered by stepProficiency
      const k = /mana/.test(x.Track) ? 'mana' : /stam/.test(x.Track) ? 'stamina' : '';
      if (!k || !S.Player.$Training[k]) { log.push(`Training track "${x.Track}" is unknown (use mana or stamina); nothing was added.`); continue; }
      const unfit = unfitToTrain(S, k);
      if (unfit) { log.push(`Training ${k}: ${unfit}; no gain.`); continue; }
      const fatigueMult = V._Fatigue === 'Tired' ? TU.tired_training : 1;
      const T = S.Player.$Training[k], pr = partners(k), partner = r4Partner(S, x.With, k), r4 = !!partner;
      const mult = 1 + pr.length * REW.train_bonus + (r4 ? 0.25 : 0), lab = TRN.tracks[k].label;
      const add = trainAdd(c, k, T.base * TU.trn_session / 100 * mult * fatigueMult, true), lim = TU.trn_total > 0 ? r2(T.base * TU.trn_total / 100) : 0;
      if (add > 0) log.push(`Training: ${lab} +${add}${fatigueMult < 1 ? ' (Tired: half gain)' : ''}${pr.length || r4 ? ` (with ${[...new Set([...pr, ...(r4 ? [partner] : [])])].join(' and ')}, x${mult})` : ''}; ${r2(T.gain)}${lim ? ` of ${lim}` : ''} trained so far.`);
      else log.push(lim && T.gain >= lim ? `Training: ${lab} has reached its limit (+${TU.trn_total}% of the starting value); training keeps {{user}} in shape but adds no more.` : `Training: ${lab} already gained all it can this week.`);
    }
    S.Training = [];
  }
}

// 1.26–1.27: six broad abilities. Only this step writes ranks and XP. A practice report is
// checked against both ends of the move, the actual elapsed time and the week's limits.
function stepProficiency(c) {
  const { S, B, log, jnl, hasB, byBuilder, OFF, REPORTED, elapsed, absB, absA, dayNo, weekNo, TU, notes } = c;
  // 1.45.0 (audit 3.9): one session report. A /Practice entry with a Track and no Action (or Action "train") is a mana or stamina
  // session; /Training is still read as one. Practice actions that train add theirs below; stepTraining applies them all.
  const sessions = c.sessions = (Array.isArray(S.Training) ? S.Training : []).map(x => ({ Track: x.Track, With: x.Partner || '' }));
  const reports = [];
  for (const r of Array.isArray(S.Practice) ? S.Practice : []) {
    if (r.Track && /^(train|training)?$/i.test(String(r.Action || '').trim())) sessions.push({ Track: r.Track, With: r.With || '' });
    else reports.push(r);
  }
  S.Training = [];
  const sales = Array.isArray(S.Craft_sales) ? S.Craft_sales : [];
  S.Practice = [];
  S.Craft_sales = [];
  S.$ui.practice = [];
  S.$ui.craft = [];
  S.$ui.craft_sale = null;
  S.$ui.mastery = null;
  if (c.routine) for (const x of c.routine.acts) if (x.a.train) for (let i = 0; i < x.n; i++) sessions.push({ Track: x.a.train, With: '' });   // 1.50.0
  if (OFF.has('proficiency')) return;
  const ranks = S.Player._Proficiency || (S.Player._Proficiency = {});
  let P = S.$eng.prof;
  if (!_.isPlainObject(P)) P = S.$eng.prof = { xp: {}, wk: { w: -1 }, days: {}, picked: false };
  S.$eng.profv = 1;
  if (!_.isPlainObject(P.xp)) P.xp = {};
  if (!_.isPlainObject(P.days)) P.days = {};
  for (const k of PROF) {
    const old = hasB ? num((((B.Player || {})._Proficiency || {})[k]), 0) : 0;
    const selected = _.clamp(Math.round(num(ranks[k], 0)), 0, 5);
    if (byBuilder && selected !== old) P.xp[k] = PROF_CUT[selected];
    else if (!Number.isFinite(Number(P.xp[k]))) P.xp[k] = PROF_CUT[old];
    P.xp[k] = _.clamp(Math.round(num(P.xp[k], 0)), 0, 150);
    ranks[k] = PROF_CUT.filter(x => P.xp[k] >= x).length - 1;
  }
  if (byBuilder) { P.picked = true; S.$ui.prof_offer = false; }
  const oldWeek = _.isPlainObject(P.wk) ? P.wk : { w: -1 };
  const gain = (k, amount, why, capped = true) => {
    if (!PROF.includes(k) || amount <= 0) return 0;
    const room = capped ? Math.max(0, TU.prof_pace - num(P.wk[k], 0)) : amount;
    const add = Math.min(amount, room, 150 - P.xp[k]);
    if (add <= 0) return 0;
    P.xp[k] += add;
    if (capped) P.wk[k] = num(P.wk[k], 0) + add;
    const rank = PROF_CUT.filter(x => P.xp[k] >= x).length - 1;
    if (rank > ranks[k]) {
      ranks[k] = rank;
      const line = `${k} reached Rank ${rank} (${PROF_NAMES[k][rank]}).`;
      notes.push(line); S.$ui.toasts.push(rank >= MASTERY ? `Mastery: ${PROF_NAMES[k][MASTERY]}` : `${k}: ${PROF_NAMES[k][rank]} (Rank ${rank})`);
    }
    log.push(`${k} proficiency +${add} (${why}); ${P.xp[k]}/150 XP.`);
    return add;
  };
  if (oldWeek.w !== weekNo) {
    P.wk = { w: weekNo, classes: {}, missed: {}, paid: 0 };
    if (oldWeek.w >= 0 && oldWeek.w === weekNo - 1)
      for (const k of PROF) if (Object.values(oldWeek.classes || {}).some(s => SUBJECT_STAT[s] === k) && !Object.keys(oldWeek.missed || {}).some(s => SUBJECT_STAT[s] === k))
        gain(k, 2, 'all attended classes last week', false);
  }
  // The attendance engine marks a skipped period in att.done. Count classes only after a
  // whole period has elapsed; a short visit to a classroom cannot earn a week's allowance.
  if (hasB && elapsed > 0 && elapsed <= 7 * DAY_MIN) for (let d = Math.floor(absB / DAY_MIN); d <= dayNo; d++) {
    const W = fromAbs(d * DAY_MIN), row = CLASS.tt && CLASS.tt[W.Day];
    if (!row || Math.floor(d / 7) !== weekNo) continue;
    for (const [p, end] of PERIODS.map(([, e], i) => [i, e])) {
      const cell = row[p], key = `${d}:${p}`;
      if (cell && cell[3] === 'class' && absB < d * DAY_MIN + end && absA >= d * DAY_MIN + end) {
        if (((S.$eng.att || {}).done || {})[key]) P.wk.missed[cell[0]] = true;
        else P.wk.classes[cell[0]] = true;
      }
    }
  }
  // Sources already reported or computed elsewhere in the engine.
  if (hasB && !c.toolEdit) {
    const previous = ((B.Player || {}).Academics || {}).Grades || {};
    for (const [s, mark] of Object.entries(S.Player.Academics.Grades || {})) if (mark !== previous[s] && /^(A|B)$/.test(mark)) gain(SUBJECT_STAT[s], mark === 'A' ? 4 : 2, `${s} exam`, false);
    const studied = Math.max(0, num((S.$eng.study || {}).mins, 0) - num(((B.$eng || {}).study || {}).mins, 0));
    if (['main library','study rooms','archive'].includes(placeKey(S.World.Location)) && !c.routine) {   // 1.50.0: routineProf counts it
      P.study = num(P.study, 0) + studied;
      const n = Math.floor(P.study / 120); if (n) { P.study %= 120; gain('Knowledge', n, 'study time'); }
    }
    if ((REPORTED.acts || []).some(a => /^(talk|hangout|gift)$/.test(a.Kind)) && P.days.society !== dayNo) { P.days.society = dayNo; gain('Society', 1, 'social interaction'); }
    if (c.profCast && P.days.arcana !== dayNo) { P.days.arcana = dayNo; gain('Arcana', 1, 'casting'); }
    if (B.Battle && B.Battle.Active && !S.Battle.Active) gain('Prowess', 1, 'battle finished');
    for (const s of c.profTutoring || []) gain(SUBJECT_STAT[s], 1, 'tutoring');
    if (S.World.Day === 'Sat' && num(((S.$eng.att || {}).c || {})[`${dayNo}:2`], 0) >= 60 && P.days.club !== dayNo) {
      P.days.club = dayNo;
      const stat = clubField(S, S.Player.Profile.Club || '');   // 1.75.0: the founded club's Field
      if (stat) gain(stat, 1, 'Saturday club time');
    }
  }
  if (c.routine) routineProf(c, gain, P);   // 1.50.0: the routine week's Practice, shifts, study and club, inside the weekly limits
  const locName = x => placeKey(x.name);
  const here = placeKey(S.World.Location), before = hasB ? placeKey(B.World.Location) : here;
  const inScene = name => Object.keys(S.Scene.Present || {}).some(id => id.toLowerCase() === String(name || '').toLowerCase() || (NPC_ALIAS[String(name || '').toLowerCase()] || '') === id);
  const whyLocked = (a, report) => {
    const hr = hm(S.World.Time) || 0, club = S.Player.Profile.Club || '', withName = report && report.With;
    if (a.afterClass && hr < P3[1]) return 'after lessons';
    if (a.until && hr > a.until) return 'closed for the day';
    if (a.night && (hr < 1080 || hr >= 1440)) return 'night only';
    if (a.daylight && (hr < 360 || hr >= (SEASONS[S.World.Month - 1] === 'Winter' ? 960 : 1080))) return 'daylight only';
    if (a.clear && !OFF.has('weather') && !/clear/i.test(String(S.World._Weather || ''))) return 'clear sky needed';
    if (a.calm && !OFF.has('weather') && /storm|blizzard|gale/i.test(String(S.World._Weather || ''))) return 'not in a storm';   // 1.31.0
    if (a.pact && !Object.values(S.Magic.Pacts || {}).some(p => p && (p.Presence === 'terms' || p.Summoned))) return 'your pact partner with you';   // 1.31.0
    if (a.seasons && !a.seasons.includes(SEASONS[S.World.Month - 1])) return `${a.seasons.join(' or ')} only`;
    if (a.dorm && (S.Player.Profile.Dorm === 'Unsorted' || ['Fire','Light','Sky','Viridian'].some(dm => new RegExp(`\\b${dm}\\b`, 'i').test(S.World.Location) && dm !== S.Player.Profile.Dorm))) return 'your dorm area';
    const partnerId = NPC_ALIAS[String(withName || '').toLowerCase()] || withName;
    const helpingMember = withName && inScene(withName) && clubMembersNow(S, a.club + ' Club').includes(partnerId);
    const kitchenPermission = a.club === 'Cooking' && withName && inScene(withName) && /cook|chef/i.test(withName);
    if (a.club && !club.toLowerCase().includes(a.club.toLowerCase()) && !helpingMember && !kitchenPermission) return `${a.club} Club`;
    if (a.clubAny && !a.clubAny.some(n => club.toLowerCase().includes(n.toLowerCase()))) return `${a.clubAny.join(', ')} club`;
    if (a.partner && (report ? (!withName || !inScene(withName)) : !Object.keys(S.Scene.Present || {}).length)) return 'a partner present';
    if (a.action === 'Spar with a partner' && withName && NPC_DORMS[NPC_ALIAS[withName.toLowerCase()] || withName] !== S.Player.Profile.Dorm && !/Training Week/i.test(S.World._Event_today || '')) return 'a partner from your dorm';
    if (a.cost && S.Player.Wallet.Points < a.cost) return `${a.cost} points`;
    if (a.materials && !Object.keys(S.Inventory || {}).some(n => CRAFT_PORTABLE.has(n.toLowerCase()) && num(S.Inventory[n].Qty, 0) > 0)) return 'materials in Bag';
    if (a.train && unfitToTrain(S, a.train)) return 'fit enough to train';
    return '';
  };
  // 1.29.0: each craft group lists the Practice actions it can be done under (data/crafts.json groups), with an optional extra club
  const craftGroup = recipe => (CRAFTS.groups || {})[recipe.group] || {};
  const craftActs = (recipe, place) => (craftGroup(recipe).actions || []).map(g => [g, PRACTICE.find(x => x.action === g.action && locName(x) === place)]).filter(([, a]) => a);
  const craftItem = (I, name) => keyIn(I, name);   // shared.js
  const craftQty = (I, name) => { const k = craftItem(I, name); return k ? num(I[k].Qty, 0) : 0; };
  const craftExpert = (state, recipe) => (craftGroup(recipe).experts || []).some(n => Object.keys((state.Scene || {}).Present || {}).some(id => id.toLowerCase() === n.toLowerCase()));
  const craftMaterial = (I, recipe) => (recipe.materials || [[]]).find(option => option.every(m => craftQty(I, m.item) >= m.qty));
  const craftTarget = (I, recipe, named) => {
    if (!recipe.target) return '';
    const items = named ? [craftItem(I, named)].filter(Boolean) : Object.keys(I || {});
    return items.find(k => recipe.target === 'repair' ? /\bdamaged\b/i.test(String(I[k].Note || ''))
      : recipe.target === 'mend' ? CRAFT_CLOTHES.test(k) && /\bdamaged\b/i.test(String(I[k].Note || ''))
      : CRAFT_CLOTHES.test(k) && !/enchanted/i.test(String(I[k].Note || ''))) || '';
  };
  const craftReady = (recipe, state, report) => {
    const acts = craftActs(recipe, placeKey(state.World.Location)), club = String(state.Player.Profile.Club || '').toLowerCase();
    if (!acts.length) return { why: 'this craft is not available here' };
    let a = null, locked = '';
    for (const [g, x] of acts) {
      const why = whyLocked(x, report) || (g.club && !club.includes(g.club.toLowerCase()) ? `${g.club} Club` : '');
      if (!why) { a = x; break; }
      locked = locked || why;
    }
    if (!a) return { why: locked };
    if (recipe.tier === 'advanced' && num(state.Player._Proficiency.Craft, 0) < 3 && !craftExpert(state, recipe)) return { why: 'Craft Rank 3 or an expert present' };
    if (recipe.arcana && num(state.Player._Proficiency.Arcana, 0) < recipe.arcana) return { why: `Arcana Rank ${recipe.arcana}` };
    const material = craftMaterial(state.Inventory, recipe);
    if (!material) return { why: 'ingredients in Bag' };
    const target = craftTarget(state.Inventory, recipe, report && report.Subject);
    if (recipe.target && !target) return { why: recipe.target === 'repair' ? 'a damaged item in Bag' : recipe.target === 'mend' ? 'damaged clothing in Bag' : 'ordinary clothing in Bag' };
    return { a, material, target };
  };
  const craftResult = (state, recipe) => {
    const f = ((state.$ui || {}).fortune || {}), roll = num(f.roll, 0) || d100(num((state.$eng || {}).seed, c.seed), 'fortune', num((state.$eng || {}).turn, 0), state === S ? absA : absB), rank = num(state.Player._Proficiency.Craft, 0);
    const grade = ((state.Player.Academics || {}).Grades || {})['Potion Crafting'];
    const skill = Math.min(grade === 'A' ? 20 : 15, rank * 3 + (grade === 'A' ? 10 : 0));
    const Cn = state.Player.Conditions || {}, Vt = state.Player.Vitals, sev = Object.values(state.Player.Injuries || {}).map(i => i.Severity);
    const condition = (Cn.Chilled ? -10 : 0) + (Cn.Soaked ? -5 : 0) + (Cn.Overheated ? -5 : 0) + (Cn['Head cold'] ? -5 : 0)
      + (Vt._Fatigue === 'Exhausted' ? -15 : Vt._Fatigue === 'Tired' ? -5 : 0)
      + (sev.some(x => /serious|critical/.test(x)) ? -20 : sev.includes('moderate') ? -10 : 0)
      + (((state.$ui || {}).sleep || {}).loss >= 0.2 && !((state.$ui || {}).sleep || {}).flavor ? -5 : 0);
    // a masterwork of the generic "craft" Kind takes the best tool of any craft
    const tools = recipe.group ? craftGroup(recipe).tools || [] : Object.values(CRAFTS.groups || {}).flatMap(g => g.tools || []);
    const tool = Math.max(0, ...tools.filter(([n]) => craftQty(state.Inventory, n) > 0).map(([, n]) => n));
    const aid = craftExpert(state, recipe) ? 10 : 0, score = roll + skill + condition + tool + aid, dc = CRAFTS.tiers[recipe.tier];
    const band = score >= dc + 25 ? 'fine' : score >= dc ? 'success' : score >= dc - 15 ? 'weak' : 'failed';
    const master = rank >= MASTERY, result = master && band === 'weak' ? 'success' : band;   // Master's hand: nothing comes out rough
    return { name: recipe.name, group: recipe.group, tier: recipe.tier, roll, score, dc, result, master, mishap: roll <= 3, mods: [skill && `Craft +${skill}`, condition && `conditions ${condition}`, tool && `tool +${tool}`, aid && `expert +${aid}`].filter(Boolean).join(', ') };
  };
  const bagGain = (name, count, kind, note) => {   // 1.45.0 (audit 3.4): the Bag ledger
    const k = bagGive(c, name, count, kind, note);
    if (k) { S.Inventory[k].Kind = kind; S.Inventory[k].Note = note; }
  };
  const takeMaterials = option => { for (const m of option) bagTake(c, m.item, m.qty); };
  const craftMishap = (made, group) => {
    if (!made.mishap || Object.keys(S.Player.Injuries || {}).some(k => !(((B || {}).Player || {}).Injuries || {})[k])) return;
    const [kind, part, effect] = ((CRAFTS.groups || {})[group] || {}).mishap || ['burn', 'hand', 'tender fingers'];
    S.Player.Injuries[`${group || 'Craft'} mishap ${kind}`] = { Severity: 'minor', Body_part: part, Effect: effect, Heals_by: 'treatment' };
    S.Player.Vitals.HP = Math.max(1, S.Player.Vitals.HP - 5);
  };
  // 1.29.0: a masterwork is a finished Project of a craft Kind (data/crafts.json masterwork), judged at the masterwork DC; the story
  // decides what the piece is and does
  const MW = CRAFTS.masterwork || { rank: 4, xp: 3, kinds: {} };
  const mwGroup = pj => { const k = String((pj || {}).Kind || '').toLowerCase(); return Object.prototype.hasOwnProperty.call(MW.kinds, k) ? MW.kinds[k] : null; };
  const mwResult = (state, k) => ({ ...craftResult(state, { name: k, group: mwGroup(state.Projects[k]), tier: 'masterwork' }), group: 'Masterwork' });
  const mwDone = new Set();
  const finishMasterwork = (name, auto) => {
    const k = craftItem((B || {}).Projects, name), group = k ? mwGroup(B.Projects[k]) : null;
    if (!hasB || !k || group === null) { if (!auto) log.push(`Masterwork "${name}": start it as a Project of a craft Kind first; no result.`); return; }
    if (mwDone.has(k.toLowerCase())) return;
    mwDone.add(k.toLowerCase());
    if (num(B.Player._Proficiency.Craft, 0) < MW.rank) { log.push(`${k}: a masterwork needs Craft Rank ${MW.rank}; the finished Project is ordinary work, judged by the story.`); return; }
    const made = (((B.$ui || {}).craft || []).find(x => x.tier === 'masterwork' && x.name.toLowerCase() === k.toLowerCase())) || mwResult(B, k);
    gain('Craft', made.result === 'failed' ? 1 : MW.xp, 'masterwork');
    craftMishap(made, group);
    if (made.result !== 'failed') bagGain(k, 1, ((CRAFTS.groups || {})[group] || {}).bag || 'other',
      made.result === 'weak' ? 'handmade by {{user}}, rough' : `masterwork, handmade by {{user}}${made.result === 'fine' ? ', fine' : ''}`);
    const sk = craftItem(S.Projects, k); if (sk) delete S.Projects[sk];
    jnl.push(made.result === 'failed' ? `The masterwork "${k}" failed.` : `Finished ${made.result === 'weak' ? 'a piece short of a masterwork' : 'a masterwork'}: ${k}${made.result === 'fine' ? ' (fine)' : ''}.`);
    S.$ui.toasts.push(`Masterwork ${k}: ${made.result}`);
    log.push(`Masterwork ${k}: ${made.result}${made.mishap ? ', mishap' : ''}; ${made.result === 'failed' ? 'nothing to show for it' : 'in the Bag'}; the Project is closed.`);
  };
  const done = new Set();
  for (const r of reports) {
    const action = String(r.Action || '').trim().toLowerCase();
    if (action === 'craft' && /^masterwork\b/i.test(String(r.Aim || '').trim())) { finishMasterwork(String(r.Subject || '').trim(), false); continue; }
    const recipe = action === 'craft' && (CRAFTS.recipes || []).find(x => x.name.toLowerCase() === String(r.Aim || '').trim().toLowerCase());
    const a = recipe ? craftReady(recipe, S, r).a || ((craftActs(recipe, here)[0] || [])[1]) : PRACTICE.find(x => x.action.toLowerCase() === action && locName(x) === here);
    const subject = subjectOf(r.Subject), stat = a && (a.stat === 'subject' ? SUBJECT_STAT[subject] : a.stat);
    let why = !a ? 'this action is not available here' : before !== here ? 'start and finish at the practice place' : whyLocked(a, r);
    if (!why && !stat) why = 'name a subject';
    if (!why && (elapsed < 45 || c.toolEdit)) why = 'a session needs at least 45 minutes';
    if (!why && a.study && a.action === 'Study a subject' && elapsed < 60) why = 'one full hour of study';
    if (!why && Math.floor(absB / DAY_MIN) !== dayNo) why = 'finish a session in one day';
    if (!why && CLASS.tt && !((S.World._Event_today || '').match(/no classes/i))) {
      const row = CLASS.tt[S.World.Day] || [];
      if (row.some((cell, p) => cell && cell[3] === 'class' && PERIODS[p] && absB % DAY_MIN < PERIODS[p][1] && absA % DAY_MIN > PERIODS[p][0])) why = 'during a lesson';
    }
    const key = `${dayNo}:${a ? a.loc + ':' + a.action : action}`;
    if (!why && (P.days[key] || done.has(key))) why = 'already practised this action today';
    if (!why && a.paid && P.wk.paid >= 2) why = 'two paid shifts this week';
    if (!why && num(P.wk[stat], 0) >= TU.prof_pace) why = `${stat} is at its weekly limit`;
    let ready;
    if (!why && action === 'craft') {
      if (!recipe) why = 'unknown recipe';
      else {
        ready = craftReady(recipe, B, r);
        if (ready.why) why = ready.why;
      }
    }
    if (why) { log.push(`Practice ${r.Action}: ${why}; no proficiency XP.`); continue; }
    done.add(key); P.days[key] = true;
    const priorCraft = recipe && ((((B || {}).$ui || {}).craft || []).find(x => x.name === recipe.name));
    const made = recipe && (priorCraft || craftResult(B, recipe));
    const xp = recipe ? (made.result === 'failed' ? 1 : a.xp) : a.study && a.action === 'Study a subject' ? Math.min(2, Math.floor(elapsed / 60)) : a.xp;
    gain(stat, xp, a.action);
    if (recipe) {
      takeMaterials(ready.material);
      if (a.cost) ledger(c, 'Points', -a.cost, 'studio practice');
      craftMishap(made, recipe.group);
      if (made.result !== 'failed') {
        const note = `handmade by {{user}}${made.result === 'fine' ? ', fine' : made.result === 'weak' ? ', rough' : ''}`;
        if (recipe.target) {
          const target = craftItem(S.Inventory, ready.target) || ready.target;
          if (!S.Inventory[target]) S.Inventory[target] = _.cloneDeep(B.Inventory[ready.target]);
          if (recipe.target === 'repair' || recipe.target === 'mend') S.Inventory[target].Note = String(S.Inventory[target].Note || '').replace(/\bdamaged\b/ig, '').trim() || note;
          else S.Inventory[target].Note = `${String(S.Inventory[target].Note || '').trim()} enchanted ${recipe.gear}; ${note}`.trim();
        } else bagGain(recipe.name, (recipe.yield || [1, 1, 1])[['fine', 'success', 'weak'].indexOf(made.result)] + (made.master ? 1 : 0), recipe.kind, note);
      }
      log.push(`Craft ${recipe.name}: ${made.result}${made.mishap ? ', mishap' : ''}; ingredients spent${made.result === 'failed' ? ', no item' : ''}.`);
      if (recipe.group === 'Brewing' && recipe.tier === 'advanced') log.push('Advanced brewing may draw a Dove poison-magic inspection; play it if a Dove is present.');
      continue;
    }
    if (a.action === 'Tend the reagent beds') bagGain('Foraged reagent', 1, 'reagent', 'fresh from the Gardens');
    if (a.action === 'Forage' && SEASONS[S.World.Month - 1] !== 'Winter') bagGain('Foraged reagent', (SEASONS[S.World.Month - 1] === 'Summer' ? 1 : 2) * (ranks.Nature >= MASTERY ? MASTERY_FX.nature_forage : 1), 'reagent', 'foraged in the Forest');
    if (a.action === 'Gather clearing blooms') {
      bagGain('Clearing bloom', 1, 'reagent', 'wilts tomorrow');
      const C = S.$eng.craft || (S.$eng.craft = {}); C.blooms = C.blooms || {}; C.blooms['clearing bloom'] = dayNo;
    }
    if (a.train) sessions.push({ Track: a.train, With: r.With || '' });
    if (a.cost) ledger(c, 'Points', -a.cost, 'studio practice');
    if (a.paid) { P.wk.paid++; ledger(c, 'Points', a.paid, a.paidAs || 'paid shift'); }
    if (a.study && !OFF.has('study') && S.$eng.study) {
      const counted = num(S.$eng.study.mins, 0) - num((((B || {}).$eng || {}).study || {}).mins, 0);
      const hour = 60 + (r4Partner(S, r.With, 'study') ? 30 : 0);   // 1.45.0 (audit 3.9): the study partner rule, as for a study Interaction
      if (counted < hour) S.$eng.study.mins = num(S.$eng.study.mins, 0) + hour - Math.max(0, counted);
    }
  }
  if (hasB) for (const k of Object.keys(B.Projects || {})) {
    const sk = craftItem(S.Projects, k);
    if (sk && num(S.Projects[sk].Progress, 0) >= 100 && num(B.Projects[k].Progress, 0) < 100 && mwGroup(B.Projects[k]) !== null) finishMasterwork(k, true);
  }
  for (const sale of sales) {
    const n = Math.min(Math.max(1, Math.floor(num(sale.Qty, 1))), 3 - num(P.wk.sold, 0));
    const name = 'Healing draught', k = craftItem(S.Inventory, name);
    if (String(sale.Item || '').toLowerCase() !== name.toLowerCase() || here !== 'medical centre' || before !== here || !hasB || n <= 0 || !k || craftQty(B.Inventory, name) < n || num(S.Inventory[k].Qty, 0) < n) {
      log.push('Apothecary sale rejected: sell Healing draught at the Medical Centre, up to three doses per week, from the Bag.');
      continue;
    }
    bagTake(c, k, n); P.wk.sold = num(P.wk.sold, 0) + n;
    ledger(c, 'Points', 15 * n, `Apothecary: ${n} Healing draught${n === 1 ? '' : 's'}`);
    c.craftSold = [...(c.craftSold || []), name.toLowerCase()];
    log.push(`Medical Centre apothecary bought ${n} Healing draught${n === 1 ? '' : 's'} for ${15 * n} points (${P.wk.sold}/3 this week).`);
  }
  for (const t of sessions) if (/stam/i.test(t.Track || '') && !unfitToTrain(S, 'stamina')) gain('Prowess', 1, 'stamina training');
  if (hasB && elapsed >= 45 && !c.toolEdit) {
    const event = String(S.World._Event_today || ''), place = here, hour = hm(S.World.Time) || 0, textNow = String(c.text || '');
    const eventXP = (key, stat, xp, attended) => {
      const mark = `event:${S.World.Year}:${key}`;
      if (attended && !P.days[mark]) { P.days[mark] = true; gain(stat, xp, key, false); }
    };
    eventXP('Training Week', 'Prowess', 3, /Training Week/.test(event) && place === 'combat grounds' && hour >= P3[1]);
    eventXP('Creature Studies Expedition', 'Nature', 3, /Creature Studies Expedition/.test(event) && (S.Trip.Active || /forest|expedition/i.test(S.World.Location)));
    eventXP('Warding Rite', 'Arcana', 2, /Warding Rite/.test(event) && place === 'main courtyard' && hour >= 1110);
    eventXP('Star Night', 'Arcana', 2, /Star Night/.test(event) && /grassy field|hill/i.test(place) && hour >= 1200);
    eventXP('Club Festival stand', 'Craft', 2, /Club Festival/.test(event) && place === 'main courtyard' && /stand|stall|booth/i.test(textNow));
    eventXP('Academy Bazaar stand', 'Craft', 2, /Academy Bazaar/.test(event) && place === 'main courtyard' && /stand|stall|booth/i.test(textNow));
    eventXP('Entrance feast', 'Society', 2, /Entrance Event/.test(event) && place === 'ring dining hall' && hour >= 1140);
    eventXP('Founder Day feast', 'Society', 2, /Academy Founder Day/.test(event) && place === 'ring dining hall' && hour >= 1140);
  }
  for (const k of Object.keys(P.days)) if (/^\d+:/.test(k) && +k.split(':')[0] < dayNo - 14) delete P.days[k];
  S.$ui.practice = PRACTICE.filter(a => locName(a) === here).map(a => {
    const stat = a.stat === 'subject' ? '' : a.stat;
    const locked = whyLocked(a, null) || (P.days[`${dayNo}:${a.loc}:${a.action}`] ? 'already practised today' : '')
      || (a.paid && P.wk.paid >= 2 ? 'two paid shifts this week' : '')
      || (stat && num(P.wk[stat], 0) >= TU.prof_pace ? `${stat} is at this week's limit (${P.wk[stat]}/${TU.prof_pace}); class attendance still counts` : '');
    return { action: a.action, stat: a.stat, locked };
  });
  S.$ui.craft = (CRAFTS.recipes || []).filter(recipe => {
    const ready = craftReady(recipe, S, null);
    if (ready.why || num(P.wk.Craft, 0) >= TU.prof_pace) return false;
    const a = ready.a;
    return !P.days[`${dayNo}:${a.loc}:${a.action}`];
  }).map(recipe => craftResult(S, recipe));
  // 1.30.0: mastery perks (Rank 5). Arcana: the Doves take an interest (once; with hidden magic, Dove attention too). Society: the
  // Noble Houses' Liaison writes (once). Knowledge: one real lead a week in the Main Library or the Archive (a new Clue found there
  // uses it). The standing perks are rules in 504 (S.$ui.mastery); Prowess, Society's Trust, Arcana's mana and Craft act elsewhere.
  const MS = P.mastery = _.isPlainObject(P.mastery) ? P.mastery : {};
  if (ranks.Arcana >= MASTERY && !MS.arcana) {
    MS.arcana = true;
    if (c.repAdd) c.repAdd('Doves', 8, 'an arcane scholar the Doves take an interest in', '');
    if (S.Hidden && S.Hidden._True_magic) { S.Hidden.Dove_attention = _.clamp(num(S.Hidden.Dove_attention, 0) + 3, 0, 100); log.push('Arcane scholar: the Doves take an interest; Dove attention +3.'); }
  }
  if (ranks.Society >= MASTERY && !MS.society) {
    MS.society = true;
    if (_.isPlainObject(S.Letters)) S.Letters["Noble Houses' Liaison: an invitation"] = { From: "Noble Houses' Liaison", To: '{{user}}', Gist: "Word of {{user}}'s manners has reached the noble houses: an invitation to the Liaison's next reception.", Date: stamp(S.World), Status: 'waiting' };
    log.push("Consummate: the Noble Houses' Liaison has taken note of {{user}} (a letter).");
  }
  const leadHere = ['main library', 'archive'].includes(here);
  // 1.44.0 (audit 3.12): a Clue the story adds here is the week's lead (Source records); a reply spent here without one files it:
  // on the oldest rumour or story {{user}} pinned and has not had looked up yet, else on the open thread found most recently
  if (hasB && !c.toolEdit && !OFF.has('mystery') && ranks.Knowledge >= MASTERY && leadHere && MS.lead !== weekNo) {
    const fresh = Object.keys(S.Clues || {}).find(k => !(B.Clues || {})[k]);
    if (fresh) { MS.lead = weekNo; S.Clues[fresh].Source = 'records'; log.push(`Encyclopaedic: "${fresh}" is this week's real lead.`); }
    else if (before === here) {
      const lead = recordsLead(S, MS, here === 'archive' ? 'the Archive' : 'the Main Library');
      if (lead) { MS.lead = weekNo; S.Clues[lead.key] = lead.clue; log.push(lead.log); }
    }
  }
  const mastered = PROF.filter(k => ranks[k] >= MASTERY);
  S.$ui.mastery = mastered.length ? { stats: mastered, lead: ranks.Knowledge >= MASTERY && leadHere && MS.lead !== weekNo } : null;
  if (num(ranks.Craft, 0) >= MW.rank) S.$ui.craft.push(...Object.keys(S.Projects || {}).filter(k => mwGroup(S.Projects[k]) !== null && num(S.Projects[k].Progress, 0) < 100).slice(0, 2).map(k => mwResult(S, k)));
  if (here === 'medical centre' && craftQty(S.Inventory, 'Healing draught') > 0)
    S.$ui.craft_sale = { sold: num(P.wk.sold, 0), remaining: Math.max(0, 3 - num(P.wk.sold, 0)) };
  if (S.$ui.fortune && Array.isArray(S.$ui.fortune.mods)) {
    const mods = PROF.filter(k => ranks[k] > 0).map(k => `${k} +${Math.min((SUBJECTS.some(s => SUBJECT_STAT[s] === k && num(((S.$eng.study || {}).stand || {})[s], -1) === 4) ? 10 : 20), ranks[k] * 3)}`);
    if (mods.length) S.$ui.fortune.mods.push('proficiency: ' + mods.join('; '));
  }
}

// 1.44.0 (audit 3.12): Encyclopaedic's weekly real lead, filed by the engine. The narrator says what the record shows (true to the
// lore) and rewrites the Detail; the engine never invents the content.
function recordsLead(S, MS, where) {
  const Cl = S.Clues || {}, done = MS.led = Array.isArray(MS.led) ? MS.led : [];
  const pin = Object.keys(Cl).find(k => /^(rumour|story)$/.test(Cl[k].Source) && !done.includes(k) && (S.Mysteries[Cl[k].Thread] || {}).Status !== 'solved');
  const open = Object.keys(Cl).reverse().map(k => Cl[k].Thread).find(t => (S.Mysteries[t] || {}).Status === 'open' && t !== 'Unsorted clues');
  const on = pin || open; if (!on) return null;
  if (pin) MS.led = [...done, pin].slice(-20);
  const key = `Records: ${on}`.replace(/[./~]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60), about = pin ? `"${pin}"` : on;
  return { key, clue: { Thread: pin ? Cl[pin].Thread : open, Detail: `A record in ${where} bears on ${about}; what it shows comes out next.`, Where: where.replace(/^the /, 'The '), Links: [], Source: 'records' },
    log: `Encyclopaedic: digging in ${where} turned up this week's real lead on ${about} (Clue "${key}"). In the next reply show what the record says, true to the lore, and rewrite that Clue's Detail with it.` };
}

// ---- 6c. 1.3.0 one-use perks spent this reply (/Perk_use). Kuroo's and Milena's Rank 10 favours lift a negative reputation one level.
function stepPerkUse(c) {
  const { S, log, jnl, goneNow, repw, repLv, repLevelUp, repSync, notes } = c;
  for (const key of (Array.isArray(S.Perk_use) ? S.Perk_use : [])) {
    const k = Object.keys(S._Perks || {}).find(x => x === key) || Object.keys(S._Perks || {}).find(x => x.toLowerCase() === String(key).trim().toLowerCase());
    if (!k) { log.push(`Perk "${key}" is not held; nothing was spent.`); continue; }
    const p = S._Perks[k], fx = (((REW.npcs || {})[p.From]) || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {};
    if (p.Kind === 'memento' || goneNow(p.From)) { log.push(`"${k}" came from ${p.From}, who has graduated: it no longer works; nothing was spent.`); continue; }   // 1.7.6
    if (!(p.Uses > 0)) { log.push(`"${k}" is not a one-use perk; nothing to spend.`); continue; }
    if ((S.$ui.tsusp || []).includes(k)) { log.push(`"${k}" is suspended while ${p.From}'s Trust is low; it was kept.`); continue; }   // 1.4.3
    if (fx.rep_token) {
      if (!repLevelUp(fx.rep_token, true)) { log.push(`"${k}" only works while ${fx.rep_token} reputation is below 0 (now ${repLv(fx.rep_token)}); it was kept.`); continue; }
      log.push(`${fx.rep_token} reputation rose one level ("${k}").`);
    }
    p.Uses -= 1;
    if (p.Uses <= 0) { delete S._Perks[k]; S.$ui.perks_used = [...(S.$ui.perks_used || []), `${k} (${p.From}), ${dstamp(S.World)}`].slice(-60); }
    S.$ui.toasts.push(`Used: ${k}`); notes.push(`{{user}} used ${k} (from ${p.From}).`);
  }
  S.Perk_use = [];
  repSync(true);
  S.$eng.repw = repw;
}

// ---- 7. hidden magic ----
function stepHidden(c) {
  const { S, B, log, hasB, toolEdit, dayNo, wxNow, weekNo, weekNoB } = c;
  const Hd = S.Hidden;
  // 1.1.0 (Full): outdoors in fog, heavy rain, a storm or a blizzard the hidden magic is harder to notice: the rise is halved (rounded up)
  if (wxNow && hasB && Hd._True_magic && isOutdoor(S.World.Location) && (wxNow.sky === 'Fog' || wxHeavy(wxNow))) {
    const was = (B.Hidden && B.Hidden.Dove_attention) || 0, rise = Hd.Dove_attention - was;
    if (rise > 0) { Hd.Dove_attention = was + Math.ceil(rise / 2); log.push(`Dove attention rise halved by the weather (outdoors, ${wxText(wxNow)}): +${Math.ceil(rise / 2)} instead of +${rise}.`); }
  }
  // 1.18.0 (I1): the narrator reports witnessed/detected rises; the engine owns quiet-week decay.
  if (hasB) {
    const prior = num((B.Hidden || {}).Dove_attention, 0);
    if (Hd.Dove_attention < prior) { Hd.Dove_attention = prior; log.push('Dove attention falls only after a quiet week; the manual decrease was reverted.'); }
    const raised = Hd.Dove_attention > prior;
    const old = _.isPlainObject(S.$eng.doveweek) ? S.$eng.doveweek : { w: weekNoB, raised: true }; // old saves: do not assume the prior week was quiet
    if (weekNo > num(old.w, weekNoB)) {
      const quiet = Math.max(0, weekNo - num(old.w, weekNoB) - (old.raised ? 1 : 0));
      const drop = Math.min(Hd.Dove_attention, quiet);
      if (drop) { Hd.Dove_attention -= drop; log.push(`Dove attention −${drop} after ${quiet} quiet week${quiet === 1 ? '' : 's'}.`); }
      S.$eng.doveweek = { w: weekNo, raised };
    } else S.$eng.doveweek = { w: weekNo, raised: !!old.raised || raised };
  }
  const stageOf = a => (a < 20 ? 'Unnoticed' : a < 40 ? 'Rumoured' : a < 60 ? 'Watched' : a < 80 ? 'Investigated' : 'Exposed');
  const stg = stageOf(Hd.Dove_attention);
  if (Hd._True_magic && Hd._Stage !== stg) { log.push(`Dove attention is now: ${stg}.`); S.$ui.toasts.push(`Dove attention: ${stg}`); }
  for (const [id, o] of Object.entries(TRU.overrides || {})) {   // 1.4.3: Krieg learns the hidden magic: his Trust is gone
    if (o.zero_at_stage && Hd._True_magic && stg === o.zero_at_stage && S.Bonds[id] && S.Bonds[id].Trust > 0) {
      S.Bonds[id].$Recent = [...(S.Bonds[id].$Recent || []), { w: stamp(S.World), n: 'Learned what {{user}} has been hiding.', fx: `Trust −${S.Bonds[id].Trust}` }].slice(-num((BR.recent || {}).keep, 10));   // 1.4.4
      S.Bonds[id].Trust = 0; S.Bonds[id].$tdrop = dayNo; log.push(`${id} knows what {{user}} hid: Trust 0.`);
    }
  }
  Hd._Stage = stg;

  // 1.12.0 (H3): Points the narrator changed with no Transactions line get one ("not itemised"); a line written later for the same
  // amount replaces it. A new line with no change to Points or Coin changes nothing here: section 8l reminds the narrator.
  // 1.45.0 (audit 3.5): the engine's own payments (ledger, c.tx) are taken out first: only the narrator's lines and changes count.
  let lineNoPay = '';
  const WB = ((hasB && B.Player) || {}).Wallet || {}, WS = S.Player.Wallet, TX = c.tx || [];
  const amt = l => { const m = /^\s*([+−-])\s*([\d,]+)/.exec(String(l)); return m ? (m[1] === '+' ? 1 : -1) * Number(m[2].replace(/,/g, '')) : 0; };
  const isCoin = l => /\bcoins?\b/i.test(l), engBy = cur => TX.filter(x => x.cur === cur).reduce((a, x) => a + x.delta, 0);
  const narr = hasB ? newLines([...(WB.Transactions || []), ...TX.map(x => x.line)], WS.Transactions) : [];   // the narrator's new lines
  if (hasB && !toolEdit) {
    const T0 = new Set(WB.Transactions || []);
    const fresh = narr.filter(l => amt(l) && !isCoin(l));
    const dP = num(WS.Points, 0) - num(WB.Points, 0) - engBy('Points'), dC = num(WS.Coin, 0) - num(WB.Coin, 0) - engBy('Coin');
    if (dP && !fresh.length) WS.Transactions = [...(WS.Transactions || []), `${dP > 0 ? '+' : '-'}${Math.abs(dP)} (not itemised)`];
    else if (!dP && !dC) {
      for (const l of fresh) {
        const ph = WS.Transactions.findIndex(x => T0.has(x) && /\(not itemised\)$/.test(x) && amt(x) === amt(l));
        if (ph >= 0) WS.Transactions.splice(ph, 1); else if (!lineNoPay) lineNoPay = l;
      }
    }
  }
  // 1.11.1 (bug hunt): spending more than {{user}} has. The schema stops Points at 0, which made the missing part free; the
  // reply's new Transactions lines show what was spent, so the narrator is told to settle it in the story.
  // 1.45.0 (audit 3.5): per currency, from the narrator's own lines, against what {{user}} had after the engine's payments
  if (hasB) for (const [cur, word] of [['Points', 'points'], ['Coin', 'coin']]) {
    const P0 = num(WB[cur], 0) + engBy(cur);
    const spent = narr.filter(l => isCoin(l) === (cur === 'Coin')).reduce((a, l) => a - amt(l), 0);
    if (num(WS[cur], 0) === 0 && spent > P0) {
      S.$ui.toasts.push(`Not enough ${word}`);
      log.push(`{{user}} had ${P0} ${word} but this reply spent ${spent}: the ${spent - P0} missing were not paid (${cur} stay 0). Settle it in the story (put something back, owe it${cur === 'Points' ? ', pay in coin' : ''}) and fix Transactions.`);
    }
  }
  Object.assign(c, { Hd, lineNoPay });
}

// ---- 8. monthly payout ----
function stepPayout(c) {
  const { S, B, log, hasB, goneNow, repLv } = c;
  if (hasB) {
    const mi = W => ((W.Year || 1) - 1) * 12 + W.Month;
    const crossed = Math.min(12, mi(S.World) - mi(B.World));
    for (let i = 0; i < crossed; i++) {
      const r = S.Player.Profile.Dorm_rank || 0;
      let pay = S.Player.Profile.Dorm === 'Unsorted' ? 0 : r <= 0 ? 300 : PAYOUT.find(([max]) => r <= max)[1];
      const acad = repLv('Academy');
      if (pay && acad <= -5) pay = Math.floor(pay / 2);          // 1.3.0: academic probation halves the payout
      if (pay) {
        if (_.isPlainObject(S.$eng.wk)) S.$eng.wk.pay = num(S.$eng.wk.pay, 0) + pay;   // 1.10.0: the routine payout is not news in the recap
        ledger(c, 'Points', pay, `monthly payout (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved: academic probation' : ''})`);
        log.push(`Monthly payout: +${pay} points (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved on academic probation' : ''}).`);
      }
      // 1.3.0: Academy +5 bonus, and points from bond rewards (data/bond_rewards.json monthly)
      const extra = [...(acad >= 5 && S.Player.Profile.Dorm !== 'Unsorted' ? [[REP.academy5_monthly, 'honoured student bonus (Academy reputation +5)']] : []),
        ...Object.values(S._Perks || {}).filter(p => p.Kind !== 'memento' && !goneNow(p.From)).map(p => (((REW.npcs || {})[p.From] || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {}).monthly).filter(Boolean).map(m => REW.monthly[m])];
      for (const [pts, why] of extra) {
        if (_.isPlainObject(S.$eng.wk)) S.$eng.wk.pay = num(S.$eng.wk.pay, 0) + pts; ledger(c, 'Points', pts, why); log.push(`Monthly: +${pts} points, ${why}.`);
      }
    }
  }
}

// ---- 8b0. 1.60.0 (before 8b, which writes the Journal): lasting changes to the world's facts,
// Campus_State.Lore_changes { "<subject>": { Now, Cause, Since, Replace } }. The narrator may change any fact of the lore for this campaign, but only as a consequence of the story, never on its own whim:
// a new or rewritten change needs a Cause and must be shown in the reply that records it (its subject, or a name of the subject's
// lore entry, in the prose or in the player's message). At most LC.perReply new ones a reply and LC.max on record; a person's lore
// is added to, never replaced. A refused change goes back to what it was, with the reason in the report. Only the player removes
// one (the Journal's Undo, a player tool); the narrator's removal is put back. Kept changes get Since (the day) and $uid (their
// lore entry, where build_card prints them over the lore; -1: none, <current_state> carries them). Location_changes is read as one.
// 1.75.0: a change with Until (a calendar date) is temporary: $abs is its end, parsed once (anchorWhen), and the engine removes it
// when that day is over (agendaState 'notice'), with a Journal line; until then the Planner shows when it ends.
function stepLoreChanges(c) {
  const { S, B, hasB, log, jnl, toolEdit, absA } = c;
  const CS = S.Campus_State, L = CS.Lore_changes = _.isPlainObject(CS.Lore_changes) ? CS.Lore_changes : {};
  const L0 = (hasB && _.isPlainObject((B.Campus_State || {}).Lore_changes) && B.Campus_State.Lore_changes) || {};
  const rec = v => { const o = _.isPlainObject(v) ? v : { Now: v }; return { Now: String(o.Now || '').trim(), Cause: String(o.Cause || '').trim(), Since: String(o.Since || ''), Replace: o.Replace === true || o.Replace === 'true',
    Until: String(o.Until || '').trim(), $abs: num(o.$abs, -1), $uid: num(o.$uid, -1) }; };
  for (const [k, v] of Object.entries(CS.Location_changes || {})) if (String(v).trim() && !keyIn(L, k)) L[k] = { Now: String(v) };
  CS.Location_changes = {};
  for (const k of Object.keys(L)) {   // a subject written in another case is the change on record
    const k0 = Object.keys(L0).find(x => x !== k && lcKey(x) === lcKey(k));
    if (k0) { L[k0] = L[k]; delete L[k]; }
  }
  const said = proseOf(c.text) + '\n' + String(c.userText || '');
  const shown = k => {
    const uid = loreUidOf(k), names = [lcKey(k), ...(uid >= 0 ? Object.keys(LORE.names).filter(n => LORE.names[n] === uid) : [])];
    return names.some(n => n && new RegExp(`(^|[^\\p{L}\\p{N}])${_.escapeRegExp(n)}($|[^\\p{L}\\p{N}])`, 'iu').test(said));
  };
  const n0 = Object.keys(L0).length;
  let fresh = 0;
  for (const k of Object.keys(L)) {
    const v = rec(L[k]), p = k in L0 ? rec(L0[k]) : null, uid = loreUidOf(k);
    if (p && v.Now === p.Now && v.Replace === p.Replace && v.Until === p.Until) { L[k] = { ...p, $uid: uid }; continue; }   // nothing new: kept as it was
    if ((LORE.npc || []).includes(uid)) v.Replace = false;
    const end = v.Until ? anchorWhen(v.Until, p && p.Until, p ? p.$abs : -1, S.World, absA) : -1;
    const why = !hasB || toolEdit ? ''
      : !v.Now ? 'Now is empty. The story never erases a change; if it undoes one, rewrite its Now'
      : !v.Cause ? 'it has no Cause (what happened in the story, or what {{user}} did, that changed it)'
      : v.Until && end < 0 ? `its Until "${v.Until}" is not a date (write the last day it lasts, such as "M3 W2 Fri", or leave Until out for a lasting change)`
      : v.Until && end < absA ? `its Until "${v.Until}" has already passed`
      : !shown(k) ? `this reply does not show it ("${k}" is not in the scene). Record a lasting change in the reply that shows it happening or its aftermath`
      : !p && n0 + fresh >= LC.max ? `${LC.max} changes are on record; rewrite one that is already there instead`
      : !p && fresh >= LC.perReply ? `at most ${LC.perReply} new changes a reply` : '';
    if (why) { if (p) L[k] = { ...p, $uid: uid }; else delete L[k]; log.push(`Lore change "${k}" was not recorded: ${why}.`); continue; }
    if (!v.Now) { delete L[k]; continue; }
    if (!p) fresh++;
    const Until = v.Until && end >= 0 ? absWhen(v.Until, end, S.World, absA) : '';
    L[k] = { ...v, Until, $abs: Until ? end : -1, Since: hasB || !v.Since ? dstamp(S.World) : v.Since, $uid: uid };
    if (hasB && !toolEdit) { S.$ui.toasts.push(`The world changed: ${k}`); jnl.push(`${k}, changed ${Until ? 'until ' + Until : 'for good'}: ${v.Now}`.slice(0, 220)); }
  }
  if (hasB && !toolEdit) for (const k of Object.keys(L0)) if (!(k in L)) {
    L[k] = { ...rec(L0[k]), $uid: loreUidOf(k) };
    log.push(`Lore change "${k}" stays on record: only the player removes a change. If the story undoes it, rewrite its Now.`);
  }
  if (hasB) for (const k of Object.keys(L)) {   // 1.75.0: a temporary change ends when its last day is over
    const e = num((L[k] || {}).$abs, -1);
    if (e < 0 || agendaState(e, absA, 'notice') !== 'overdue') continue;
    jnl.push(`${k}, as it was again: the change until ${L[k].Until} is over (${L[k].Now})`.slice(0, 220));
    S.$ui.toasts.push(`As it was again: ${k}`); delete L[k];
  }
}

// ---- 8b. Batch 5.1 records: commitments, notices, letters, clues, journal ----
// 1.18.0 (I4): relative Heals_by dates are anchored once, like Commitment.Due.
function stepRecords(c) {
  const { S, B, log, jnl, hasB, toolEdit, OFF, absA, canon, notes } = c;
  {
    const prior = _.isPlainObject(S.$eng.heals) ? S.$eng.heals : {}, next = {};
    for (const [name, injury] of Object.entries(S.Player.Injuries || {})) {
      const by = String((injury || {}).Heals_by || '');
      next[name] = prior[name] && prior[name].text === by ? prior[name] : { text: by, abs: parseWhen(by, S.World, absA) };
      if (injury && by) next[name].text = injury.Heals_by = absWhen(by, next[name].abs, S.World, absA);   // 1.53.0 (U5)
    }
    S.$eng.heals = next;
  }
  const newKeys = (cur, prev) => Object.keys(cur || {}).filter(k => !(prev && k in prev));
  // 1.53.0 (narrator-load audit U7): a remedial session is attended when {{user}} is at its place (Where; the Saturday Study Hall's
  // Main Library when empty) during its first three hours; the engine then removes the Commitment as the narrator would
  if (hasB && !toolEdit && !OFF.has('study') && _.isPlainObject((S.$eng.study || {}).rem)) {
    const here = placeOf(canonLocation(S.World.Location));
    for (const k of Object.keys(S.$eng.study.rem)) {
      const cm = (S.Commitments || {})[k], at = cm ? num(cm.$abs, -1) : -1;
      if (at >= 0 && absA >= at && absA <= at + 180 && here === placeOf(canonLocation(cm.Where || 'Main Library'))) {
        delete S.Commitments[k]; log.push(`${k}: {{user}} was there, so it counts as attended.`);
      }
    }
  }
  // commitments: computed due text, overdue flag (1.44.0: the Agenda (8n) reminds once, when it turns overdue)
  const BC = (hasB && B.Commitments) || {};
  for (const [k, c] of Object.entries(S.Commitments || {})) {
    // v1.0.3 (A#2/F04): parse Due once (new record or new Due text) and keep that target; "tomorrow" must not drift every turn
    const c0 = BC[k];
    const abs = anchorWhen(c.Due, c0 && c0.Due, c0 ? num(c0.$abs, -1) : -1, S.World, absA);
    if (c.Due) c.Due = absWhen(c.Due, abs, S.World, absA);   // 1.53.0 (U5)
    c.$abs = abs; c._When = whenText(abs, absA);
    c._Late = agendaState(abs, absA, 'commitment') === 'overdue';
  }
  // 1.15.0 (planning/DRAFT_grades_exams.md): a commitment removed before it was overdue was done. An assignment done on time is
  // study time; one removed overdue counts as a skipped class of the subject it names. A remedial attended turns its F into a D.
  const STd = !OFF.has('study') && _.isPlainObject(S.$eng.study) ? S.$eng.study : null;
  if (STd && hasB && !toolEdit) for (const [k, c0] of Object.entries(BC)) {
    if (k in (S.Commitments || {}) || !c0) continue;
    const late = !!c0._Late;
    if (_.isPlainObject(STd.rem) && STd.rem[k]) {
      // an appointment is overdue once it starts: removed within three hours of its start, it was attended
      const sess = STd.rem[k], s = k.replace(/^Remedial /, ''), mk = (STd.marks || {})[sess], missed = num(c0.$abs, -1) >= 0 && absA > c0.$abs + 180;
      delete STd.rem[k];
      if (missed || !mk || mk[s] !== 0) { if (missed) log.push(`${k} was missed: the F stands.`); continue; }
      mk[s] = 1;
      if (num((STd.stand || {})[s], -1) === 0) STd.stand[s] = 1;
      const Ac = S.Player.Academics, lab = Object.keys(Ac.Exams || {}).find(x => x.replace(/ (Midterm|Finals)$/, '').replace(' ', '') === sess);
      if (lab) Ac.Exams[lab] = String(Ac.Exams[lab]).replace(`${s} F`, `${s} D (make-up)`);
      if (Ac.Grades && Ac.Grades[s] === 'F') Ac.Grades[s] = 'D';
      notes.push(`${k} attended: the ${s} F counts as a D.`); S.$ui.toasts.push(`${s}: F -> D (make-up)`);
    } else if (/^assignment$/i.test(String(c0.Type || '').trim())) {
      if (!late) { STd.mins = num(STd.mins, 0) + ASSIGNMENT_MIN; log.push(`Assignment "${k}" done on time: +${ASSIGNMENT_MIN} minutes of study.`); }
      else { const s = subjectIn(`${k} ${c0.Desc || ''}`); if (s) { STd.skip = _.isPlainObject(STd.skip) ? STd.skip : {}; STd.skip[s] = num(STd.skip[s], 0) + 1; log.push(`Assignment "${k}" was overdue: it counts as a skipped ${s} class for the next marks.`); } }
    }
  }
  // 1.51.0 (feature batch 3, audit 4.8): a story relation (Campus_State.New_relations) is renewed when the narrator rewrites it or the
  // two are in a scene together; four weeks without that fades its line in Connections, eight hide it ($ui.relold; the record stays)
  {
    const NR = (S.Campus_State || {}).New_relations || {}, R0 = _.isPlainObject(S.$eng.nrel) ? S.$eng.nrel : {}, NR0 = (hasB && (B.Campus_State || {}).New_relations) || {}, R = {};
    const pres = new Set(Object.keys(S.Scene.Present || {})), idOf = x => { const k = String(x || '').trim().toLowerCase(); return NPC_ALIAS[k] || NPC_ALIAS[k.split(' ')[0]] || String(x || '').trim(); };
    for (const [k, v] of Object.entries(NR)) R[k] = !(R0[k] >= 0) || NR0[k] !== v || k.split(/\s*(?:→|->)\s*/).every(x => pres.has(idOf(x))) ? c.dayNo : R0[k];
    S.$eng.nrel = R;
    const old = _.pickBy(_.mapValues(R, d => (c.dayNo - d >= 56 ? 2 : c.dayNo - d >= 28 ? 1 : 0)));
    S.$ui.relold = _.isEmpty(old) ? null : old;
  }
  // notices: stamp, expire, cap
  const BN = (hasB && B.Notices) || {};
  for (const k of newKeys(S.Notices, BN)) { if (!S.Notices[k].Posted) S.Notices[k].Posted = dstamp(S.World); if (hasB) S.$ui.toasts.push(`New notice: ${k}`); }
  for (const [k, nt] of Object.entries(S.Notices || {})) {
    const n0 = BN[k], u = anchorWhen(nt.Until, n0 && n0.Until, n0 ? num(n0.$abs, -1) : -1, S.World, absA);
    if (nt.Until) nt.Until = absWhen(nt.Until, u, S.World, absA);   // 1.53.0 (U5)
    nt.$abs = u;
    if (agendaState(u, absA, 'notice') === 'overdue') delete S.Notices[k];   // an hour after its last day ends
  }
  capRecord(S.Notices, CAP.Notices);
  // letters: stamp, direction, cap (read/sent ones go first)
  const BL = (hasB && B.Letters) || {};
  const me = new Set(['{{user}}', 'you', 'me', 'i', String(S.Player.Profile.Name || '').toLowerCase()].filter(Boolean).map(x => x.toLowerCase()));
  for (const k of newKeys(S.Letters, BL)) {
    const L = S.Letters[k];
    if (!L.Date) L.Date = dstamp(S.World);
    if (me.has(String(L.From).trim().toLowerCase())) L.Status = 'sent';
    else if (L.Status === 'waiting' && hasB) S.$ui.toasts.push(`Letter waiting at the Mail Tower${L.From ? ` (from ${L.From})` : ''}`);
  }
  // 1.31.0 (owner-approved planning/DRAFT_location_activities.md): letters home. One a month counts, sent from the Mail Tower to
  // family or home; the reply arrives HOME.days later with a parcel rolled once (none, a shop item, a little coin), handed over when
  // {{user}} reads it. The narrator writes the letter itself.
  if (!OFF.has('letters') && _.isPlainObject(S.Letters) && hasB && !toolEdit) {
    const H = S.$eng.home = _.isPlainObject(S.$eng.home) ? S.$eng.home : {};
    const month = `${S.World.Year || 1}-${S.World.Month}`, homeRx = new RegExp(`\\b(?:${HOME.to})\\b`, 'i'), seed = c.seed;
    for (const k of newKeys(S.Letters, BL)) {
      const L = S.Letters[k];
      if (L.Status !== 'sent' || !homeRx.test(`${L.To} ${k}`)) continue;
      if (H.month === month) { log.push(`Letter "${k}": one letter home a month gets a reply; this one is on its way, but no parcel will come of it.`); continue; }
      if (placeKey(S.World.Location) !== 'mail tower') { log.push(`Letter "${k}": letters home go from the Mail Tower; no reply is on its way yet.`); continue; }
      const r = d100(seed, 'home', month), R = HOME.roll;
      const parcel = r <= R.none ? null : r <= R.none + R.item ? { item: pickOf(HOME.items, seed, 'homeitem', month) }
        : { coin: rollInt(HOME.coin[0], HOME.coin[1], seed, 'homecoin', month) };
      Object.assign(H, { month, due: absA + HOME.days * DAY_MIN, from: String(L.To || '').trim() || 'home', parcel, key: '', given: false });
      log.push(`Letter home sent: a reply arrives in about ${HOME.days} days.`);
    }
    if (num(H.due, -1) >= 0 && !H.key && absA >= H.due) {
      H.key = `Reply from ${H.from}`.slice(0, 60);
      const with_ = H.parcel ? (H.parcel.item ? `, with a small parcel: ${H.parcel.item[0]}` : `, with ${H.parcel.coin} coin folded inside`) : '';
      S.Letters[H.key] = { From: H.from, To: '{{user}}', Gist: `A reply from home${with_}.`, Date: dstamp(S.World), Status: 'waiting' };
      S.$ui.toasts.push(`Letter waiting at the Mail Tower (from ${H.from})`);
    }
    if (H.key && !H.given && S.Letters[H.key] && S.Letters[H.key].Status !== 'waiting') {
      H.given = true;
      if (H.parcel && H.parcel.item) {
        const [n, kind] = H.parcel.item;
        bagGive(c, n, 1, kind, 'from home');   // 1.45.0 (audit 3.4)
        log.push(`Parcel from home: ${n} (in the Bag).`); S.$ui.toasts.push(`From home: ${n}`);
      }
      if (H.parcel && H.parcel.coin) {
        ledger(c, 'Coin', H.parcel.coin, 'from home');
        log.push(`Parcel from home: ${H.parcel.coin} coin.`); S.$ui.toasts.push(`From home: ${H.parcel.coin} coin`);
      }
    }
  }
  capRecord(S.Letters, CAP.Letters, L => L.Status !== 'waiting');
  // clues and mysteries
  const BCl = (hasB && B.Clues) || {}, BMy = (hasB && B.Mysteries) || {};
  for (const k of newKeys(S.Clues, BCl)) {
    const c = S.Clues[k];
    if (!c.Found) c.Found = dstamp(S.World);
    if (hasB) S.$ui.toasts.push(`New clue: ${k}`);
  }
  for (const c of Object.values(S.Clues || {})) {
    c.Links = [...new Set((c.Links || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
    if (!(c.Thread in S.Mysteries)) S.Mysteries[c.Thread] = { Status: 'open', Summary: '' };
  }
  for (const [k, my] of Object.entries(S.Mysteries || {})) {
    if (my.Status === 'solved' && (!BMy[k] || BMy[k].Status !== 'solved') && hasB) { jnl.push(`Solved: ${k}${my.Summary ? ` (${my.Summary})` : ''}.`); S.$ui.toasts.push(`Mystery solved: ${k}`); }
  }
  // 1.61.0 (memory audit M1): over the cap, clues of a solved or cold mystery leave first (oldest first), never an open one while
  // such a clue is left; a clue that leaves goes to $ui.cluearch (the Mystery panel shows it), never deleted outright
  const C0 = { ...(S.Clues || {}) };
  capRecord(S.Clues, CAP.Clues, cl => ((S.Mysteries || {})[cl.Thread] || {}).Status !== 'open');
  const CA = S.$ui.cluearch = _.isPlainObject(S.$ui.cluearch) ? S.$ui.cluearch : {};
  for (const k of Object.keys(C0)) if (!(k in S.Clues)) { delete CA[k]; CA[k] = C0[k]; }
  for (const k of Object.keys(S.Clues)) delete CA[k];   // the story wrote it again
  capRecord(CA, CLUE_ARCHIVE);
}

// ---- 8c. Batch 5.2: club, competition, projects, trip ----
// 1.75.0 (owner-approved planning/DRAFT_club_sendiri.md): the club {{user}} founds (Campus_State.Founded_club). It takes a teaching
// staff signature from a teacher who answers for no club (on the roster that is nobody today, so the narrator introduces one), five
// members with {{user}} and a room the Council assigns. Then the engine marks it founded, {{user}} joins it and founded_club is paid
// once. A roster student joins only on screen; once the club is founded they have left their lore club (a Lore change says so), the
// Council apart. The "whichever club" students (CLUB_FOUNDING.follow) follow {{user}} by themselves. One founded club a campaign.
const FOUND_MIN = 5;
function stepFounding(c) {
  const { S, B, log, jnl, hasB, toolEdit, text } = c;
  const CS = S.Campus_State, F = CS.Founded_club = _.isPlainObject(CS.Founded_club) ? CS.Founded_club : {};
  const F0 = (hasB && _.isPlainObject((B.Campus_State || {}).Founded_club) && B.Campus_State.Founded_club) || {};
  if (hasB) { F.Status = String(F0.Status || ''); F.Since = String(F0.Since || ''); }   // the engine's fields
  F.Name = String(F.Name || '').trim();
  if (hasB && F.Status === 'founded' && F.Name !== String(F0.Name || '')) { F.Name = String(F0.Name || ''); log.push(`A founded club keeps its name: the ${F.Name}.`); }
  if (!F.Name) {
    if (F0.Name) { jnl.push(`Gave up founding the ${F0.Name}.`); log.push(`The founding of the ${F0.Name} was dropped (Founded_club.Name is empty).`); }
    for (const k of ['Field', 'Venue', 'Advisor', 'Status', 'Since']) F[k] = '';
    F.Members = [];
    return;
  }
  if (!F.Status) F.Status = 'forming';
  const ali = x => NPC_ALIAS[String(x || '').trim().toLowerCase()] || '';
  F.Field = PROF.find(k => k.toLowerCase() === String(F.Field || '').trim().toLowerCase()) || clubField(S, F.Name) || 'Society';
  // the room: a campus place outside the dormitories (the Council assigns whatever is left)
  const v = String(F.Venue || '').trim();
  if (v && v !== String(F0.Venue || '')) {
    const nm = placeOf(canonLocation(v)), pk = nm.toLowerCase().replace(/^the /, '');
    if (CAMPUS.some(x => x.replace(/^the /, '') === pk) && !/dormitor/.test(pk)) F.Venue = nm;
    else { F.Venue = String(F0.Venue || ''); log.push(`Founded_club.Venue "${v}" is not a campus place a club can meet in (a place on the map, outside the dormitories); it was not recorded.`); }
  }
  // the signature: a teacher who answers for no club
  const adv = String(F.Advisor || '').trim(), aid = ali(adv);
  if (adv && (aid || adv) !== String(F0.Advisor || '')) {
    if (aid && !(CLUB_FOUNDING.sign || []).includes(aid)) {
      const has = (CLUB_FOUNDING.staff || {})[aid];
      F.Advisor = String(F0.Advisor || '');
      log.push(`${aid} cannot sign for the ${F.Name}: ${has ? `they already answer for the ${has}, and a teacher signs for one club only` : 'they are not teaching staff'}. Halvard has more teachers than are on record: introduce one as its advisor.`);
    } else F.Advisor = aid || adv;
  }
  // the members: students other than {{user}}
  const prose = proseOf(text), was = new Set(F0.Members || []), follow = CLUB_FOUNDING.follow || [], present = S.Scene.Present || {};
  const away = id => (CS.Graduated || []).includes(id) || (ARRIVES[id] || 1) > S.World.Year;
  const userName = String(S.Player.Profile.Name || '').trim().toLowerCase(), out = [], joined = [];
  for (const raw of Array.isArray(F.Members) ? F.Members : []) {
    const nm = String(raw || '').trim(), id = ali(nm) || nm;
    if (!nm || out.includes(id) || /\{\{user\}\}/i.test(nm) || nm.toLowerCase() === userName) continue;
    if (ali(nm)) {
      if (away(id)) continue;   // graduated members leave, as from any club
      if (!was.has(id) && !follow.includes(id)) {
        const rx = NAME_RX_OF.get(id);
        const why = !(PRESENCE.stu || {})[id] ? 'they are not a Halvard student'
          : hasB && !toolEdit && !present[id] && !(rx && mentionIn(prose, id, rx)) ? 'they are not in this reply (a student joins where the story shows it, and only if they would)' : '';
        if (why) { log.push(`${id} did not join the ${F.Name}: ${why}.`); continue; }
        joined.push(id);
      }
    }
    out.push(id);
  }
  for (const id of follow) if (!out.includes(id) && (PRESENCE.stu || {})[id] && !away(id)) out.push(id);
  F.Members = out.slice(0, 16);
  // an invented advisor or member stays on record
  const X = _.isPlainObject(S.Extras) ? S.Extras : {};
  for (const nm of [F.Advisor, ...F.Members.filter(m => !ali(m))]) { const k = nm && keyIn(X, nm); if (k && X[k] && !X[k].Keep) X[k].Keep = true; }
  const day = dstamp(S.World), E = S.$eng, J = E.fjoin = _.isPlainObject(E.fjoin) ? E.fjoin : {};
  for (const id of joined) J[id] = day;
  if (F.Status === 'forming' && F.Advisor && F.Venue && 1 + F.Members.length >= FOUND_MIN) {
    F.Status = 'founded'; F.Since = day;
    S.Player.Profile.Club = F.Name;
    jnl.push(`Founded the ${F.Name} (${F.Venue}, advisor ${F.Advisor}) with ${F.Members.join(', ')}.`);
    S.$ui.toasts.push(`Club founded: ${F.Name}`);
    if (!E.founded && c.repAdd) {
      E.founded = true;
      const deed = (REP.deeds || {}).founded_club || ['Student', 8, 'event'], got = c.repAdd(deed[0], deed[1], `founded the ${F.Name}`, '');
      log.push(`The ${F.Name} is founded: ${deed[0]} reputation +${got} Rep XP (founded_club).`);
      c.repSync(true);
    }
  } else if (F.Status === 'forming' && hasB && !_.isEqual(F, F0)) {
    const need = [F.Advisor ? '' : 'a teacher to sign', 1 + F.Members.length >= FOUND_MIN ? '' : `${FOUND_MIN - 1 - F.Members.length} more member(s)`, F.Venue ? '' : 'a room from the Student Council'].filter(Boolean);
    if (need.length) log.push(`Founding the ${F.Name}: ${1 + F.Members.length}/${FOUND_MIN} members; still needs ${need.join(', ')}.`);
  }
  // a roster student in the founded club has left their lore club: a Lore change on their entry says so (only the membership lifts it)
  if (F.Status !== 'founded') return;
  const L = CS.Lore_changes = _.isPlainObject(CS.Lore_changes) ? CS.Lore_changes : {};
  const mine = new RegExp(`\\s*(?:Left the [^.]*? for |Joined ){{user}}'s ${_.escapeRegExp(F.Name)} \\([^)]*\\)\\.`);
  const moved = new Set(F.Members.filter(id => ali(id) && !follow.includes(id)));
  for (const id of moved) {
    const old = loreClubOf(id), when = J[id] || F.Since, line = `${old ? `Left the ${old} for ` : 'Joined '}{{user}}'s ${F.Name} (${when}).`;
    const k = Object.keys(L).find(x => lcKey(x) === lcKey(id)), r = k ? L[k] : null;
    if (r && String(r.Now || '').includes(line)) continue;
    const now = `${String((r && r.Now) || '').replace(mine, '').trim()} ${line}`.trim().slice(0, 400);
    L[k || id] = { ...(r || {}), Now: now, Cause: (r && r.Cause) || `recruited by {{user}} into the ${F.Name}`, Since: (r && r.Since) || when, Replace: false, $uid: loreUidOf(id) };
    if (hasB && !toolEdit) { jnl.push(`${id} ${old ? `left the ${old} for` : 'joined'} the ${F.Name}.`); S.$ui.toasts.push(`${id} joined the ${F.Name}`); }
  }
  for (const k of Object.keys(L)) {
    const id = ali(k) || k;
    if (moved.has(id) || !mine.test(String((L[k] || {}).Now || ''))) continue;
    const now = String(L[k].Now).replace(mine, '').trim();
    if (now) L[k] = { ...L[k], Now: now }; else delete L[k];
    if (hasB && !toolEdit) jnl.push(`${id} left the ${F.Name}.`);
  }
}

function stepClubLife(c) {
  const { S, B, log, jnl, hasB } = c;
  stepFounding(c);
  const canonList = a => [...new Set((a || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  if (hasB) {
    const c0 = canonClub(B.Player.Profile.Club, B), c1 = S.Player.Profile.Club || '';
    if (c0 !== c1) jnl.push(c1 ? `Joined the ${c1}.` : `Left the ${c0}.`);
  }
  const Co = S.Competition, Co0 = (hasB && B.Competition) || {};
  Co.Team = canonList(Co.Team);
  if (hasB && Co.Status && (Co.Status !== Co0.Status || Co.Tier !== Co0.Tier)) {
    const what = { entered: 'Entered', qualified: 'Qualified from', eliminated: 'Eliminated from', champion: 'Won', selected: 'Selected for' }[Co.Status];
    jnl.push(`${what} the ${Co.Tier || 'current'} Competition${Co.Placement ? ` (${Co.Placement})` : ''}.`);
    S.$ui.toasts.push(`Competition: ${Co.Status}${Co.Tier ? ` (${Co.Tier})` : ''}`);
    const prize = `Kingdom-Y${S.World.Year}`, paid = S.$eng.prizes || (S.$eng.prizes = []);
    if (Co.Tier === 'Kingdom' && Co.Status === 'champion' && !paid.includes(prize)) {   // v1.0.3 (F08): once per year's competition
      paid.push(prize);
      ledger(c, 'Points', KINGDOM_PRIZE, 'Kingdom Competition prize');
      log.push(`Kingdom Competition won: +${KINGDOM_PRIZE} points paid to each member of the team.`);
    }
  }
  // 1.33.0 (owner-approved planning/DRAFT_classes_and_teachers.md): the Dorm Competition runs in role brackets; the bracket's
  // champion earns 100 points and the runner-up 50 (Placement "1st …" / "2nd …", or Status champion), once per year
  if (hasB && Co.Tier === 'Dorm') {
    const place = num((String(Co.Placement || '').match(/^\s*(\d+)/) || [])[1], 0) || (Co.Status === 'champion' ? 1 : 0);
    const amt = { 1: DORM_PRIZE[0], 2: DORM_PRIZE[1] }[place] || 0, key = `Dorm-Y${S.World.Year}`, paid = S.$eng.prizes || (S.$eng.prizes = []);
    if (amt && !paid.includes(key)) {
      paid.push(key);
      ledger(c, 'Points', amt, `Dorm Competition prize (${place === 1 ? 'bracket champion' : 'runner-up'})`);
      log.push(`Dorm Competition: ${place === 1 ? 'bracket champion' : 'runner-up'}, +${amt} points.`);
    }
  }
  const BP = (hasB && B.Projects) || {};
  for (const [k, pj] of Object.entries(S.Projects || {})) {
    pj.With = canonList(String(pj.With || '').split(/\s*,\s*/).filter(Boolean)).join(', ');
    if (pj.Progress >= 100 && hasB && (!BP[k] || BP[k].Progress < 100)) { jnl.push(`Finished: ${k}.`); S.$ui.toasts.push(`Project complete: ${k}`); }
  }
  const Tr = S.Trip, Tr0 = (hasB && B.Trip) || {};
  Tr.Companions = canonList(Tr.Companions);
  if (hasB && Tr.Active !== !!Tr0.Active) jnl.push(Tr.Active ? `Set off for ${Tr.Destination || 'a trip'}.` : `Back from ${Tr0.Destination || Tr.Destination || 'the trip'}.`);
  Object.assign(c, { canonList });
}

// ---- 8e. v1.0.3 new school year: a new class of first-years (incoming cohorts from data/cohorts.json) ----
// 1.7.4: {{user}} moves up a year with everyone else (the story may hold them back), and last year's competition record is cleared
// (the Journal keeps it): Losing at any tier ends only that year's competitions.
function stepNewYear(c) {
  const { S, B, log, jnl, hasB } = c;
  if (hasB && S.World.Year > (B.World.Year || 1)) {
    const P = S.Player.Profile, y0 = num(B.Player.Profile.Year, 1), dy = S.World.Year - (B.World.Year || 1);
    if (num(P.Year, 1) !== y0) log.push(`A new academic year began (Year ${S.World.Year}); {{user}} is in Year ${P.Year}.`);
    else if (y0 < 3) {
      P.Year = Math.min(3, y0 + dy);
      jnl.push(`Began Year ${P.Year} at Halvard.`);
      log.push(`A new academic year began (Year ${S.World.Year}): {{user}} moved up to Year ${P.Year} (Player.Profile.Year). If the story holds {{user}} back a year, set it back.`);
    } else log.push(`A new academic year began (Year ${S.World.Year}). {{user}} was already a third-year: the card does not play {{user}}'s own graduation, so the story decides what happens now.`);
    const Co = S.Competition;
    if (Co && (Co.Tier || Co.Status || Co.Placement || (Co.Team || []).length || (Co.Results || []).length)) {
      Object.assign(Co, { Tier: '', Status: '', Placement: '', Team: [], Results: [] });
      log.push("A new competitive year: last year's Competition record was cleared (the Journal keeps it).");
    }
  }
  {
    const seen = S.$eng.cohorts || (S.$eng.cohorts = []);
    for (let Y = 2; hasB && Y <= S.World.Year; Y++) {
      if (seen.includes(`Y${Y}`)) continue;
      seen.push(`Y${Y}`);
      const ids = Object.keys(ARRIVES).filter(id => ARRIVES[id] === Y);
      jnl.push(`A new class of first-years arrived at Halvard for the Year ${Y} Entrance Event.`);
      S.$ui.toasts.push('New first-years have arrived at Halvard');
      if (ids.length) log.push(`New first-years this year (now in the NPC roster): ${ids.join(', ')}.`);
    }
  }
}

// ---- 8d. v1.0.3 graduation: the morning after Graduation (M12 W1 Mon 07:00) that year's third-years leave campus ----
function stepGraduation(c) {
  const { S, log, jnl, hasB, absA } = c;
  {
    const done = S.$eng.grads || (S.$eng.grads = []), G = S.Campus_State.Graduated || (S.Campus_State.Graduated = []);
    for (let Y = 1; hasB && Y <= S.World.Year; Y++) {
      if (done.includes(`Y${Y}`) || absA < toAbs({ Year: Y, Month: 12, Week: 1, Day: 'Mon', Time: '07:00' })) continue;
      done.push(`Y${Y}`);
      const left = Object.keys(STUDENTS).filter(id => yearOf(id, Y) === 3 && !G.includes(id) && !STAYS[id]);
      G.push(...left);
      for (const id of Object.keys(STAYS)) if (yearOf(id, Y) === 3 && !G.includes(id)) log.push(`${STAYS[id]}. If the story had them graduate after all, add the name to Campus_State.Graduated.`);
      if (left.length) {
        jnl.push(`The third-years graduated and left Halvard: ${left.join(', ')}.`);
        S.$ui.toasts.push(`Graduates have left campus: ${left.map(id => `{npc:${id}}`).join(', ')}`);
        log.push(`Graduation departures: ${left.join(', ')} left campus (Campus_State.Graduated). If the story keeps one (repeating the year, staying as staff), remove that name.`);
      }
    }
    S.Campus_State.Graduated = [...new Set(G.map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  }
}

// ---- 8d2. 1.7.6 (owner, 2026-09-27): a graduate's rewards stop working. Their Rank 5 gift stays as a keepsake (_Perks Kind
// memento, no effect; a gift with a "grad" text in data/bond_rewards.json keeps what is left in it, without refills), their Rank 10
// benefit ends; Student reputation raised by a Rank 10 stays. The originals wait in $ui.perks_grad: if the story keeps the person
// (their name leaves Campus_State.Graduated), the reward works again. Runs every update, so a chat already past Graduation converts too.
function stepGraduateRewards(c) {
  const { S, log } = c;
  {
    const GR = new Set(S.Campus_State.Graduated || []), PG = _.isPlainObject(S.$ui.perks_grad) ? S.$ui.perks_grad : (S.$ui.perks_grad = {});
    for (const [k, p] of Object.entries(S._Perks || {})) {
      if (!p || p.Kind === 'memento' || !GR.has(p.From)) continue;
      PG[k] = { ...p };
      if (p.Kind === 'gift') {
        const x = (((REW.npcs || {})[p.From]) || {}).gift || {};
        S._Perks[k] = { From: p.From, Kind: 'memento', Effect: x.grad || `A keepsake from ${p.From}, who has graduated; it no longer does what it did.`, Uses: 0 };
        log.push(`${p.From} has graduated: "${k}" is now a keepsake${x.grad ? ' (what is left in it can still be used, without refills)' : ' with no effect'}.`);
      } else {
        delete S._Perks[k];
        log.push(`${p.From} has graduated: their Rank 10 benefit "${k}" has ended.`);
      }
    }
    for (const [k, p] of Object.entries(PG)) {
      if (GR.has(p.From)) continue;
      S._Perks[k] = { ...p }; delete PG[k];
      log.push(`${p.From} is at Halvard again: "${k}" works again.`);
    }
  }
}

// ---- 8e. 1.7.7 (FP1): one optional NPC-initiated contact on some days. The result is latched per day so scene changes,
// swipes and replays do not reroll it. The narrator decides how (or whether) the approved Stage can play; no NPC is moved.
function stepInitiative(c) {
  const { S, OFF, evs, dayNo, seed, TU } = c;
  {
    const I = _.isPlainObject(S.$eng.initiative) ? S.$eng.initiative : (S.$eng.initiative = {});
    if (!_.isPlainObject(I.last)) I.last = {};
    const week = Math.floor(dayNo / 7), off = OFF.has('npc_initiative');
    const IR = { 1: [0.15, 1, 10], 2: [0.35, 2, 7], 3: [0.6, 4, 4] }[TU.init_rate] || [0.35, 2, 7];   // 1.9.9 Settings: daily chance, weekly cap, days per NPC
    if (I.week !== week) { I.week = week; I.count = 0; }
    if (I.day !== dayNo) {
      I.day = dayNo; I.id = ''; I.done = false;
      if (!off && !awayIn(S) && !/LOCKDOWN/.test(S.World._Curfew || '') && I.count < IR[1]
      ) {
        const PV = presenceNow(S);   // 1.47.0 (audit 3.8): whereabouts: not off sick either
        const id = rollTable(Object.keys(S.Bonds).sort(), { roll: [seed, dayNo, 'npc-initiative-roll'], p: IR[0], pick: [seed, dayNo, 'npc-initiative-pick'],
          skip: id => { const b = S.Bonds[id];
            return !(b.Rank >= 3 && INITIATIVE_STAGES[id] && (ARRIVES[id] || 1) <= S.World.Year
              && !npcAwayIn(S, id) && !npcOut(PV, S, id) && !S.Scene.Present[id]   // 1.16.1 (audit B4): only a status that keeps them away
              && dayNo - num(I.last[id], -1000) >= IR[2]); },
          weight: id => ({ open: 3, normal: 2, guarded: 1, closed: 0.5 })[INITIATIVE_OPENNESS[id] || 'normal'] });
        if (id) { I.id = id; I.last[id] = dayNo; I.count++; }
      }
    }
    if (off || awayIn(S) || /LOCKDOWN/.test(S.World._Curfew || '') || (I.id &&
        (!S.Bonds[I.id] || S.Bonds[I.id].Rank < 3 || S.Scene.Present[I.id] || npcAwayIn(S, I.id)))) I.done = true;
    const id = I.done ? '' : I.id;
    if (id && S.Bonds[id] && S.Bonds[id].Rank >= 3) {
      const rank = S.Bonds[id].Rank, band = rank <= 5 ? '3-5' : rank <= 8 ? '6-8' : '9-10';
      S.$ui.initiative = { id, stage: INITIATIVE_STAGES[id][band], strained: S.Bonds[id].Tension >= 70 };
      // FP11: a concrete reason for today, never the same template + filling within this NPC's last 20; latched for the day
      if (!_.isPlainObject(I.used)) I.used = {};
      if (I.askDay !== dayNo || I.askId !== id) {
        const cat = S.Bonds[id].Tension >= 70 ? 'strained' : ((INIT_ASKS.cat || {})[id] || 'social');
        const tpl = ((INIT_ASKS.asks || {})[cat]) || [];
        const gp = ((GIFT_PREFS.npcs || {})[id] || {}).items || {};
        const tomorrow = eventsOn(fromAbs((dayNo + 1) * DAY_MIN));
        const fills = {
          place: [...(OFF.has('npc_routines') ? [] : ((PRESENCE.rt || {})[id] || []).map(r => r[4])), ...String(HAUNT[id] || '').split(/[;,]/).map(x => x.replace(/\(.*?\)/g, '').trim()).filter(Boolean),   // 1.52.0: routines first
            ...(cat === 'authority' ? [] : INIT_ASKS.places || [])].filter((x, i, a) => a.indexOf(x) === i),
          thing: [...(gp.loved || []), ...(gp.liked || [])],
          club: [movedToFounded(foundedClub(S), id) ? foundedClub(S).name : (INIT_ASKS.club || {})[id]].filter(Boolean),   // 1.75.0
          event: [...evs, ...tomorrow].map(e => e.t.split(' (')[0]).filter((x, i, a) => a.indexOf(x) === i),
        };
        const combos = [];
        tpl.forEach((t, ti) => {
          const need = (t.match(/\{(place|thing|club|event)\}/g) || []).map(x => x.slice(1, -1));
          if (!need.length) { combos.push([ti, '', t]); return; }
          const k = need[0];
          for (const v of fills[k]) combos.push([ti, v, t.replace('{' + k + '}', v)]);
        });
        const used = I.used[id] || [], fresh = combos.filter(([ti, v]) => !used.includes(ti + '|' + v)), pool = fresh.length ? fresh : combos;
        const pick = pool.length ? pickOf(pool, seed, dayNo, 'ask', id) : null;
        I.askDay = dayNo; I.askId = id; I.ask = pick ? pick[2] : ''; I.fav = null;
        if (pick) I.used[id] = [...used, pick[0] + '|' + pick[1]].slice(-20);
        // 1.49.0 (audit 4.6): some days the reason is a favour: never while strained, at most one open favour per NPC and
        // FAVOURS.per_week offered a week; {thing} becomes the Commitment's Item, {place} where to be
        if (I.fw !== week) { I.fw = week; I.fn = 0; }
        const open = Object.values(S.Commitments || {}).some(cm => isFavour(cm) && (NPC_ALIAS[String(cm.With || '').trim().toLowerCase()] || String(cm.With || '').trim()) === id);
        const ftpl = cat === 'strained' || OFF.has('planner') || open || num(I.fn, 0) >= num(FAVOURS.per_week, 2) ? [] : (FAVOURS.asks || {})[cat] || [];
        const fcombos = [];
        ftpl.forEach(t => { const k = /\{thing\}/.test(t) ? 'thing' : 'place'; for (const v of fills[k]) fcombos.push([v, t.replace('{' + k + '}', v), k]); });
        if (fcombos.length && d100(seed, dayNo, 'favour', id) <= Math.round(num(FAVOURS.rate, 0.3) * 100)) {
          const [v, txt, k] = pickOf(fcombos, seed, dayNo, 'favour-pick', id);
          I.ask = txt; I.fav = { [k === 'thing' ? 'item' : 'where']: v, days: num(FAVOURS.due_days, 2) }; I.fn = num(I.fn, 0) + 1;
        }
      }
      if (I.ask) S.$ui.initiative.ask = I.ask;
      if (I.fav) S.$ui.initiative.favour = I.fav;
    } else S.$ui.initiative = null;
  }
}

// ---- 8f. 1.1.0 story hooks: narrator-side debts. Due anchored once like Commitments; state waiting | due | overdue | old ----
function stepHooks(c) {
  const { S, B, log, hasB, absA, canonList } = c;
  {
    const BH = (hasB && B.Hooks) || {};
    for (const [k, hk] of Object.entries(S.Hooks || {})) {
      const h0 = BH[k];
      if (h0 && !(hk.$born >= 0) && h0.$born >= 0) hk.$born = h0.$born;             // a whole-record replace keeps the birth time
      if (!(hk.$born >= 0)) hk.$born = absA;
      if (!hk.Planted) hk.Planted = (h0 && h0.Planted) || dstamp(S.World);
      const abs = hk.Due ? anchorWhen(hk.Due, h0 && h0.Due, h0 ? num(h0.$abs, -1) : -1, S.World, absA) : -1;
      if (hk.Due) hk.Due = absWhen(hk.Due, abs, S.World, absA);   // 1.53.0 (U5)
      hk.$abs = abs;
      hk.Who = canonList(String(hk.Who || '').split(/\s*,\s*/).filter(Boolean)).join(', ');
      // 1.44.0 (Agenda): one status set; an undated major hook left two weeks is stale (was "old"); the Agenda (8n) reminds
      hk._State = agendaState(abs, absA, 'hook') || (hk.Weight >= 2 && absA - hk.$born >= AGENDA.stale_days * DAY_MIN ? 'stale' : 'waiting');
    }
    capRecord(S.Hooks, CAP_HOOKS, h => h.Weight === 1);                          // over the cap: Weight-1 hooks go first, oldest first
  }
}

// ---- 8g. 1.1.0 gossip: each rumour's fate and reach by age; fizzled (day 3) and old (day 21) ones leave Campus_State.Rumours ----
function stepGossip(c) {
  const { S, log, OFF, dayNo, seed, TU } = c;
  if (OFF.has('gossip')) S.$ui.gossip = [];
  else {
    const R = _.isPlainObject(S.$eng.rum) ? S.$eng.rum : (S.$eng.rum = {}), live = S.Campus_State.Rumours || [];
    for (const r of Object.keys(R)) if (!live.includes(r)) delete R[r];         // the story removed it: drop its metadata
    const keep = [], gone = [];
    for (const r of live) {
      if (!R[r]) { const d20 = rollInt(1, 20, seed, r, 'rum'); R[r] = { born: dayNo, fate: d20 <= 3 ? 'fizzle' : d20 >= 18 ? 'fast' : 'normal' }; }
      const age = dayNo - R[r].born;
      if ((R[r].fate === 'fizzle' && age >= 3) || age >= TU.gossip_life) { gone.push(r); delete R[r]; } else keep.push(r);   // 1.9.9: lifetime from Settings > Campus life
    }
    if (gone.length) {
      S.Campus_State.Rumours = keep; S.$ui.rumours_old = [...S.$ui.rumours_old, ...gone].slice(-50);
      log.push(`Rumours that have died out (removed; do not bring them back unless something revives them): ${gone.map(r => `\"${r}\"`).join('; ')}.`);
    }
    S.$ui.gossip = keep.map(r => [r, REACH(R[r], dayNo - R[r].born), dayNo - R[r].born]);
  }
}

// ---- 8h. 1.1.0 inventory (the Bag): merge case duplicates, remove at Qty 0, Sunfizz bottles, cap 40 (never gear) ----
// 1.57.0 (narrator-load audit U3): the Entrance tour and first visits to notable places become Journal lines (before stepBag, which
// writes the Journal); stepUi then adds the place to $ui.discovered
function stepVisits(c) {
  const { S } = c, place = placeOf(S.World.Location);
  // 1.57.0 (U3, the owner's VectFox notes: "the group acted as if they had never toured"): the Entrance tour, once over, and a first
  // visit to a notable place are Journal lines with who was there, so the story knows {{user}} has been there; $eng.first keeps the date
  const who = () => Object.keys(S.Scene.Present || {}).filter(id => !/\s/.test(id) || (S.Extras || {})[id]);
  if (place && plName(place) && !S.$ui.discovered.includes(place) && c.hasB && !c.toolEdit && NOTABLE.has(plName(place)) && !new RegExp('^' + (S.Player.Profile.Dorm || '-') + ' Dormitory$').test(plName(place))) {
    const w = who(); S.$eng.first = { ...(S.$eng.first || {}), [plName(place)]: [dstamp(S.World), w] };
    c.jnl.push(`First visit to ${plName(place)}${w.length ? ', with ' + w.join(', ') : ''}.`);
  }
  {
    const T0 = c.hasB && c.B.Campus_State && c.B.Campus_State.Entrance_tour, end = toAbs({ ...S.World, Month: 1, Week: 1, Day: 'Mon', Time: '18:00' });
    if (T0 && T0.Year === (S.World.Year || 1) && (T0.FirstYears || []).length && c.absB < end && c.absA >= end && c.absA - end < DAY_MIN && !c.toolEdit) {
      const fy = T0.FirstYears.join(' and ');
      c.jnl.push(T0.Guide === '{{user}}' ? `Guided the new first-years ${fy} round the grounds on Entrance Day.` : `Toured the grounds on Entrance Day with ${fy}, guided by ${T0.Guide}.`);
    }
  }
}

function stepBag(c) {
  const { S, B, log, jnl, hasB, dayNo } = c;
  {
    const I = S.Inventory || (S.Inventory = {}), BI = (hasB && B.Inventory) || {};
    const blooms = (S.$eng.craft || {}).blooms || {};
    if (hasB) for (const k of Object.keys(I)) if (/^clearing bloom$/i.test(k) && num(blooms[k.toLowerCase()], dayNo) < dayNo) {
      delete I[k]; delete blooms[k.toLowerCase()]; log.push('Clearing bloom wilted overnight.');
    }
    const groups = _.groupBy(Object.keys(I), k => k.trim().toLowerCase());
    for (const ks of Object.values(groups)) {
      const main = ks.find(k => k in BI) || ks[0], rec = { ...I[main] };
      for (const k of ks) if (k !== main) {
        const o = I[k]; rec.Qty += o.Qty;
        if (o.Note && !(k in BI)) rec.Note = o.Note; if (o.Plan && !(k in BI)) rec.Plan = o.Plan;
        if (rec.Kind === 'other' && o.Kind !== 'other') rec.Kind = o.Kind;
        delete I[k];
      }
      if (main.trim() !== main) delete I[main];
      rec.Qty = Math.min(99, rec.Qty); I[main.trim()] = rec;
    }
    const qty = (O, rx) => Object.entries(O || {}).filter(([k]) => rx.test(k.trim())).reduce((a, [, v]) => a + (Number(v && v.Qty) || 0), 0);
    const SF = /^sunfizz$/i, EB = /^empty sunfizz bottles?$/i;
    if (hasB) {
      const returned = qty(BI, EB) - qty(I, EB), drank = qty(BI, SF) - qty(I, SF);
      if (returned > 0 && ['commissary', 'the mall', 'mall'].includes(placeOf(S.World.Location).toLowerCase())) {
        const pts = BOTTLE_BACK * returned;
        ledger(c, 'Points', pts, `returned Sunfizz bottles (${returned})`);
        log.push(`Returned ${returned} Sunfizz bottle${returned > 1 ? 's' : ''}: +${pts} points.`);
      }
      if (drank > 0) {
        const k = Object.keys(I).find(x => EB.test(x.trim()));   // 1.45.0 (audit 3.4): the Bag ledger
        const kk = bagGive(c, k || 'Empty Sunfizz bottle', drank, 'other', 'returnable: 2 points each at the Commissary or the Mall store');
        if (kk) I[kk].Qty = Math.min(99, I[kk].Qty);
      }
    }
    for (const k of Object.keys(I)) if (!(I[k].Qty > 0)) delete I[k];
    const ks = Object.keys(I);
    if (ks.length > CAP_BAG) {
      const order = [...ks.filter(k => /^(other|food)$/.test(I[k].Kind)), ...ks.filter(k => !/^(other|food|gear)$/.test(I[k].Kind))];
      const drop = order.slice(0, ks.length - CAP_BAG);   // 1.42.0 (audit 1.10): never silently
      for (const k of drop) delete I[k];
      if (drop.length) { S.$ui.toasts.push(`Bag full (${CAP_BAG}): left behind ${drop.slice(0, 3).join(', ')}${drop.length > 3 ? ' +' + (drop.length - 3) : ''}`); log.push(`The Bag holds ${CAP_BAG} kinds of item: ${drop.join(', ')} ${drop.length > 1 ? 'were' : 'was'} left behind to make room. If {{user}} still has ${drop.length > 1 ? 'them' : 'it'}, the story should say where (a dorm room, a locker).`); }
    }
  }

  // journal: engine-written turning points; date-stamp the AI's new lines
  if (hasB) {
    // 1.7.5: a student past Year 1 (a chat that starts in Year 2 or 3) was sorted in their first year: the Stone's reading (D9) once
    // the Builder has set the dominant type
    const dm0 = { Elemental: 'Fire', Mystic: 'Light', Spiritual: 'Viridian', Occult: 'Sky' }[((S.Magic || {})._Affinity || {}).Dominant];
    if (S.Player.Profile.Dorm === 'Unsorted' && num(S.Player.Profile.Year, 1) > 1 && dm0) {
      S.Player.Profile.Dorm = dm0;
      log.push(`{{user}} is a Year ${S.Player.Profile.Year} student, so the Arbiter Stone sorted them in their first year: ${dm0} Dormitory (Player.Profile.Dorm).`);
    }
    if (B.Player.Profile.Dorm === 'Unsorted' && S.Player.Profile.Dorm !== 'Unsorted') jnl.unshift(num(S.Player.Profile.Year, 1) > 1 ? `Of the ${S.Player.Profile.Dorm} Dormitory since the first-year sorting.` : `Sorted into the ${S.Player.Profile.Dorm} Dormitory by the Arbiter Stone.`);
    const sec0 = new Set([...((B.Campus_State && B.Campus_State.Secrets_revealed) || []), ...((B.$ui && B.$ui.secrets) || [])]);
    for (const x of S.Campus_State.Secrets_revealed || []) if (!sec0.has(x)) { const [who, ...topic] = String(x).split('.'); jnl.push(`Uncovered a hidden truth about ${who}${topic.length ? ` (${topic.join('.')})` : ''}.`); }
  }
  // v1.0.3 (F13): every revealed secret also goes to a permanent, hidden ledger; unlocks read it, so the AI list may stay short
  for (const x of S.Campus_State.Secrets_revealed || []) if (!S.$ui.secrets.includes(x)) S.$ui.secrets.push(x);
  const J0 = new Set((hasB && B.Journal) || []);
  S.Journal = (S.Journal || []).map(line => (J0.has(line) ? line : /^\[(Y\d+ )?M\d/.test(line) ? (S.World.Year > 1 ? withYear(line, S.World.Year) : line) : `[${dstamp(S.World)}] ${line}`));
  // 1.35.2 (owner playtest): the narrator journaled the sorting in its own words and the engine added its line too. An engine
  // line replaces a narrator line from this reply that says the same thing (ignoring the date, articles and punctuation).
  const jkey = l => String(l).replace(/^\[[^\]]*\]\s*/, '').toLowerCase().replace(/\b(the|a|an)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
  if (jnl.length) {
    const mine = new Set(jnl.map(jkey));
    S.Journal = S.Journal.filter(l => J0.has(l) || !mine.has(jkey(l)));
  }
  for (const line of jnl) S.Journal.push(`[${dstamp(S.World)}] ${JOURNAL_LANDMARK.test(line) ? '! ' : ''}${line}`);
  if (c.notes.length) S.$ui.jnotes = [...(S.$ui.jnotes || []), ...c.notes.map(l => `[${dstamp(S.World)}] ${l}`)].slice(-JOURNAL_ARCHIVE);   // 1.57.0
  // 1.61.0 (memory audit M2; the owner's chat had "Sorted into (the) Fire Dormitory by the Arbiter Stone." twice): a new line that
  // says what an earlier line in the Journal says is dropped, whoever wrote it (the earliest stays, with its date)
  {
    const seen = new Set();
    S.Journal = S.Journal.filter(l => { const k = jkey(l); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  // over the cap, the engine's routine lines from earlier replies (Meanwhile, a first visit) leave before the oldest turning point
  const capped = [];
  if (S.Journal.length > CAP.Journal) {
    const low = S.Journal.filter(l => J0.has(l) && JOURNAL_LOW.test(l)).slice(0, S.Journal.length - CAP.Journal), drop = new Set(low);
    S.Journal = S.Journal.filter(l => !drop.has(l)); capped.push(...low);
  }
  capped.push(...S.Journal.slice(0, Math.max(0, S.Journal.length - CAP.Journal)));
  S.Journal = S.Journal.slice(-CAP.Journal);
  // 1.62.0 (memory audit M3): a pinned line that leaves the window stays in view; past KEPT_MAX the oldest leaves for good
  const K = S._Kept_from_earlier = (S._Kept_from_earlier || []).filter(l => !S.Journal.includes(l));
  for (const l of capped) if (PINNED.test(l) && !K.includes(l)) K.push(l);
  const keptOut = K.splice(0, Math.max(0, K.length - KEPT_MAX));
  // 1.63.0 (M5): they wait for a fold; the archive (UI) keeps them too
  const JQ = S.$eng.jq = Array.isArray(S.$eng.jq) ? S.$eng.jq : [];
  for (const l of capped.filter(l => !PINNED.test(l)).concat(keptOut)) if (!JQ.includes(l)) JQ.push(l);
  // F21 state-as-memory: the narrator reads the last CAP.Journal lines; older ones (and lines the AI removed) move to $ui.archive
  if (hasB) {
    const kept = new Set(S.Journal), arch = S.$ui.archive || (S.$ui.archive = []);
    const have = new Set(arch);
    for (const l of B.Journal || []) if (!kept.has(l) && !have.has(l)) { arch.push(l); have.add(l); }
    S.$ui.archive = arch.slice(-ARCHIVE_MAX);
  }
}

// ---- 8j. 1.6.1 (Batch D, N4): campus events. Updated is stamped when an event's Text changes (a new event, or news about it);
// events with no news for STALE_DAYS are listed in <now> ($ui.stale), so the world moves them on or closes them. A bare string
// (the AI's shorthand, or a save from before 1.6.1) is the Text.
function stepCampusEvents(c) {
  const { S, B, hasB, dayNo } = c;
  {
    const E0 = (hasB && B.Campus_State && B.Campus_State.Events) || {}, stale = [];
    const ev = x => (_.isPlainObject(x) ? x : x == null ? null : { Text: String(x) });
    for (const k of Object.keys(S.Campus_State.Events || {})) {
      const v = ev(S.Campus_State.Events[k]), p = ev(E0[k]), text = String(v.Text || '').trim();
      if (!p || String(p.Text || '').trim() !== text || !(num(p.$d, -1) >= 0)) { v.Updated = dstamp(S.World); v.$d = dayNo; }
      else { v.Updated = p.Updated || dstamp(S.World); v.$d = num(p.$d, dayNo); }
      S.Campus_State.Events[k] = { Text: text, Updated: v.Updated, $d: v.$d };
      if (text && dayNo - v.$d > STALE_DAYS) stale.push([k, v.Updated, v.$d]);
    }
    S.$ui.stale = stale.sort((a, b) => a[2] - b[2]).slice(0, 3).map(([k, u]) => [k, u]);
  }
  // N6: the campus phase today ({ id, from: "M5 W1 Mon", to: "M5 W2 Fri", line }, every year); the line goes into <now>
  {
    const doyOf = w => { const m = /^M(\d{1,2}) W([1-4]) (\w{3})/.exec(String(w || '')); return m && DAYS.includes(m[3]) ? (+m[1] - 1) * 28 + (+m[2] - 1) * 7 + DAYS.indexOf(m[3]) : -1; };
    const d = dayNo % YEAR_DAYS;
    const ph = PHASES.find(p => { const a = doyOf(p.from), z = doyOf(p.to); return a >= 0 && z >= 0 && (a <= z ? d >= a && d <= z : d >= a || d <= z); });
    S.$ui.phase = ph ? { id: ph.id, line: ph.line } : null;
  }
}

// ---- 8k. 1.6.1 (Batch D, N5): characters the narrator invented (Extras). A roster name is never an Extra. A key that differs
// only in case, or a first name that matches exactly one recorded full name, is the same person: it merges into the recorded
// key (in Scene.Present too). Every time one enters Scene.Present it is counted ($eng.xs); from the second appearance <cast>
// asks for their record until it exists. At most EXTRAS_MAX records: the least recently seen leave first (into a hidden
// archive, $ui.xold, which gives the record back if they turn up again), never one the player pinned (Keep) or one present.
function stepExtras(c) {
  const { S, B, log, hasB, absA, dayNo, canon } = c;
  let xHere = [], xNew = [];
  {
    const X = S.Extras = _.isPlainObject(S.Extras) ? S.Extras : {}, X0 = (hasB && _.isPlainObject(B.Extras) && B.Extras) || {};
    const XF = ['Who', 'Looks', 'Manner', 'Calls_user', 'Voice'];
    const first = k => String(k).trim().toLowerCase().split(/\s+/)[0];
    const xMatch = (name, keys) => {
      const l = String(name).trim().toLowerCase(), same = keys.find(k => k !== name && k.toLowerCase() === l);
      if (same) return same;
      if (/\s/.test(l)) return null;
      const f = keys.filter(k => /\s/.test(k.trim()) && first(k) === l);
      return f.length === 1 ? f[0] : null;
    };
    for (const k of Object.keys(X)) {
      if (!_.isPlainObject(X[k])) X[k] = { Who: String(X[k] == null ? '' : X[k]) };
      if (NPC_IDS.has(canon(k))) { delete X[k]; log.push(`${canon(k)} is a roster character (their sheet is in <cast>), not an invented one; the Extras record "${k}" was removed.`); }
    }
    for (const k of Object.keys(X)) {   // same person under two keys: keep the recorded (or the longer) key
      if (!(k in X)) continue;
      const t0 = xMatch(k, Object.keys(X)); if (!t0) continue;
      const keep = t0.length !== k.length ? (t0.length > k.length ? t0 : k) : (t0 in X0 || !(k in X0) ? t0 : k), drop = keep === k ? t0 : k;
      const a = X[keep], z = X[drop], fresh = !(drop in X0);
      for (const f of XF) if (String(z[f] || '').trim() && (fresh || !String(a[f] || '').trim())) a[f] = z[f];
      a.Keep = !!(a.Keep || z.Keep); a.$seen = Math.max(num(a.$seen, -1), num(z.$seen, -1));
      delete X[drop];
    }
    const P = S.Scene.Present;
    for (const id of Object.keys(P)) {
      if (NPC_IDS.has(id)) continue;
      const t0 = xMatch(id, Object.keys(X)); if (!t0 || t0 === id) continue;
      if (!(t0 in P) || !String((P[t0] || {}).Note || '').trim()) P[t0] = P[id];
      delete P[id];
    }
    const ext = Object.keys(P).filter(id => !NPC_IDS.has(id));
    const XO = S.$ui.xold = _.isPlainObject(S.$ui.xold) ? S.$ui.xold : {};
    // 1.61.0 (memory audit M8): past the archive an invented character leaves a short record in $ui.xgone (who they are, how they
    // look and sound, cut short); one who turns up again later comes back from it with the same face and voice
    const XG = S.$ui.xgone = _.isPlainObject(S.$ui.xgone) ? S.$ui.xgone : {};
    for (const id of ext) if (!(id in X)) {
      const o = id in XO ? id : xMatch(id, Object.keys(XO));
      if (o) { X[id] = XO[o]; delete XO[o]; continue; }
      const g = id in XG ? id : xMatch(id, Object.keys(XG));
      if (g) { X[id] = { ...XG[g] }; delete XG[g]; }
    }
    const bp = Object.keys((hasB && B.Scene && B.Scene.Present) || {}).filter(id => !NPC_IDS.has(id));
    const wasL = new Set(bp.map(k => k.trim().toLowerCase())), wasF = new Set(bp.map(first));
    const XS = S.$eng.xs = _.isPlainObject(S.$eng.xs) ? S.$eng.xs : {};
    const xsKey = {};
    for (const id of ext) {
      const l = id.trim().toLowerCase();
      let key = l in XS ? l : xMatch(l, Object.keys(XS));
      if (key && key !== l && /\s/.test(l)) { XS[l] = XS[key]; delete XS[key]; key = l; }   // first name, then the full name: one person
      const r = XS[key || l] || (XS[key || l] = { n: 0, d: dayNo });
      if (!wasL.has(l) && !wasF.has(first(l))) r.n = num(r.n, 0) + 1;
      r.d = dayNo; xsKey[id] = key || l;
      if (id in X) X[id].$seen = absA;
    }
    for (const k of Object.keys(XS).sort((a, b) => num(XS[b].d, 0) - num(XS[a].d, 0)).slice(80)) delete XS[k];
    for (const k of Object.keys(X)) if (num(X[k].$seen, -1) < 0) X[k].$seen = absA;   // written now: seen now
    const out = Object.keys(X).filter(k => !X[k].Keep && !ext.includes(k)).sort((a, b) => num(X[a].$seen, -1) - num(X[b].$seen, -1));
    for (const k of out.slice(0, Math.max(0, Object.keys(X).length - EXTRAS_MAX))) { XO[k] = X[k]; delete X[k]; }
    for (const k of Object.keys(XO).sort((a, b) => num(XO[b].$seen, -1) - num(XO[a].$seen, -1)).slice(EXTRAS_ARCHIVE)) {
      const r = XO[k], cut = (v, n) => { const t = String(v || '').trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; };
      delete XG[k]; XG[k] = _.pickBy({ Who: cut(r.Who, 80), Looks: cut(r.Looks, 80), Voice: cut(r.Voice, 60) }, Boolean);
      delete XO[k];
    }
    capRecord(XG, EXTRAS_GONE);
    xHere = ext.filter(id => id in X && String(X[id].Who || '').trim());
    xNew = ext.filter(id => (id in X && !String(X[id].Who || '').trim()) || (!(id in X) && num((XS[xsKey[id]] || {}).n, 0) >= 2));
  }
  Object.assign(c, { xHere, xNew });
}

// ---- 8i2. 1.63.0 (memory audit M5): folds. The request the rule card showed for this reply is the one the engine left before it
// (B's $ui.fold; Prompt Template renders the entries on the state before the reply in both MVU modes). /Fold answers it; then the
// next request is made. Deterministic: the fold text is in the reply's block, so a replay repeats it.
const chronLine = (a, b, t) => `[${a === b ? a : `${a} – ${b}`}] ${t}`;
const fullDate = (l, Y) => { const m = /^\[([^\]]*)\]/.exec(String(l)); const d = m ? m[1].replace(/^until\s+/, '') : ''; return !d ? '' : /^Y\d/.test(d) ? d : `Y${Y} ${d}`; };
const entryEnds = (e, Y) => { const m = /^\[([^\]]*)\]/.exec(String(e)); if (!m) return ['', '']; const p = m[1].split(' – '); return [fullDate(`[${p[0]}]`, Y), fullDate(`[${p[p.length - 1]}]`, Y)]; };
const yearOfDate = (d, Y) => { const m = /^Y(\d+)/.exec(d || ''); return m ? +m[1] : Y; };
function chronMeta(S) {
  const C = S._Chronicle = Array.isArray(S._Chronicle) ? S._Chronicle : [];
  let M = Array.isArray(S.$eng.chron) ? S.$eng.chron : [];
  if (M.length !== C.length) M = C.map(e => (/^\[Year \d+\]/.test(e) ? { L: 3, y: +/\d+/.exec(e)[0] } : { L: 1, y: yearOfDate(entryEnds(e, S.World.Year || 1)[1], S.World.Year || 1) }));
  return (S.$eng.chron = M);
}
function foldRequest(S) {
  const Y = S.World.Year || 1, C = S._Chronicle || [], M = chronMeta(S), JQ = S.$eng.jq || [];
  const past = M.map((m, i) => [m, i]).filter(([m]) => m.L < 3 && m.y < Y);
  const req = (k, who, label, max, lines, n) => ({ k, who, label, max, lines, n, sig: `${k}|${who}|${lines[0] || ''}` });
  if (past.length) { const y = Math.min(...past.map(([m]) => m.y)), ix = past.filter(([m]) => m.y === y).map(([, i]) => i);
    return req('year', '', `the story of the campaign's Year ${y}, from its Chronicle entries`, FOLD.w3, ix.map(i => C[i]), ix.length); }
  // past FOLD.l1max entries of one level, its oldest FOLD.l2 become one L2 entry (L2 entries fold into L2 again within a year)
  for (const L of [2, 1]) {
    const lv = M.map((m, i) => [m, i]).filter(([m]) => m.L === L);
    if (lv.length > FOLD.l1max) { const ix = lv.slice(0, FOLD.l2).map(([, i]) => i);
      return req('chronicle', '', 'the oldest Chronicle entries, into one', FOLD.w2, ix.map(i => C[i]), ix.length); }
  }
  if (JQ.length >= FOLD.l1) return req('journal', '', 'Journal lines that left the window, into one Chronicle entry', FOLD.w1, JQ.slice(0, FOLD.l1), FOLD.l1);
  for (const id of ((S.$ui || {}).cast || {}).full || []) {
    const b = (S.Bonds || {})[id]; if (!b) continue;
    for (const [key, oldKey, qKey, k, label] of [['Known_facts', '$Known_old', '$Known_q', 'facts', `what {{user}} knows about ${id}`], ['Knows', '$Knows_old', '$Knows_q', 'knows', `what ${id} knows about {{user}}`]]) {
      const q = num(b[qKey], 0), old = b[oldKey] || [];
      if (q < FOLD.bond) continue;
      const wait = old.slice(old.length - q).slice(0, FOLD.bondTake), prev = (b[key] || []).find(l => FOLDED.test(l));
      return req(k, id, label, FOLD.wb, [...(prev ? [`(earlier fold) ${prev}`] : []), ...wait], wait.length);
    }
  }
  return null;
}
const foldText = (t, max) => {
  const w = String(t || '').replace(/^\s*\[[^\]]*\]\s*/, '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  return { text: (w.length > max * 1.5 ? [...w.slice(0, max), '…'] : w).join(' '), cut: w.length > max * 1.5 };
};
const plainFold = R => R.lines.map(l => String(l).replace(/^\(earlier fold\)\s*/, '').replace(/^\[[^\]]*\]\s*/, '').replace(/^!\s*/, '').split(/\s+/).slice(0, 12).join(' ').replace(/[.;,]+$/, '')).join('; ') + '.';
function applyFold(S, R, raw, log) {
  const Y = S.World.Year || 1, { text, cut } = foldText(raw, R.max);
  if (!text) return false;
  if (cut) log.push(`The fold was longer than ${R.max} words and was cut; keep a fold short.`);
  const C = S._Chronicle = Array.isArray(S._Chronicle) ? S._Chronicle : [], M = chronMeta(S);
  if (R.k === 'journal') {
    const JQ = S.$eng.jq || [];
    if (!R.lines.every((l, i) => JQ[i] === l)) return false;
    const a = fullDate(R.lines[0], Y), z = fullDate(R.lines[R.lines.length - 1], Y);
    JQ.splice(0, R.lines.length); C.push(chronLine(a, z, text)); M.push({ L: 1, y: yearOfDate(z, Y) });
    return true;
  }
  if (R.k === 'chronicle' || R.k === 'year') {
    const ix = R.lines.map(l => C.indexOf(l));
    if (ix.some(i => i < 0)) return false;
    const y = M[ix[0]].y, e = R.k === 'year' ? `[Year ${y}] ${text}` : chronLine(entryEnds(R.lines[0], Y)[0], entryEnds(R.lines[R.lines.length - 1], Y)[1], text);
    const at = Math.min(...ix);
    for (const i of [...ix].sort((p, q) => q - p)) { C.splice(i, 1); M.splice(i, 1); }
    C.splice(at, 0, e); M.splice(at, 0, { L: R.k === 'year' ? 3 : 2, y });
    return true;
  }
  const b = (S.Bonds || {})[R.who], key = R.k === 'knows' ? 'Knows' : 'Known_facts', qKey = R.k === 'knows' ? '$Knows_q' : '$Known_q';
  if (!b || num(b[qKey], 0) < R.n) return false;
  const W = S.World;
  b[key] = [`[until ${W.Year > 1 ? `Y${W.Year} ` : 'Y1 '}M${W.Month} W${W.Week}] ${text}`, ...(b[key] || []).filter(l => !FOLDED.test(l))];
  b[qKey] = num(b[qKey], 0) - R.n;
  return true;
}
function stepFold(c) {
  const { S, B, hasB, log, toolEdit } = c;
  const R = hasB && B.$ui && _.isPlainObject(B.$ui.fold) ? B.$ui.fold : null, ans = String(S.Fold || '').trim();
  S.Fold = '';
  if (R && ans) { if (applyFold(S, R, ans, log)) S.$eng.fold = null; }
  else if (R && !toolEdit && /<UpdateVariable/i.test(String(c.text || ''))) {
    const w = S.$eng.fold && S.$eng.fold.sig === R.sig ? num(S.$eng.fold.n, 0) + 1 : 1;
    S.$eng.fold = { sig: R.sig, n: w };
    if (w >= FOLD.patience && applyFold(S, R, plainFold(R), log)) { S.$eng.fold = null; log.push(`The fold the rule card asked for was not written for ${w} replies; the engine folded those lines plainly.`); }
  } else if (!R && ans && hasB) log.push('A /Fold was written with no fold asked for; it was not kept.');
  chronMeta(S);
  S.$ui.fold = foldRequest(S);
}

// ---- 8i3. 1.66.0 (memory audit M11d): the gist of each reply (/Gist, written by the update model in extra-model mode), the bottom
// layer below the Journal: chat → gist → Journal → Chronicle. One entry per reply with an update block ('' when none was written), the
// latest GIST.keep; _Recent_story shows the gists older than the chat the narrator still reads (GIST.window replies ≈ the 24 messages
// of the trim regex), at most GIST.show. A player tool counts as no reply.
const GIST = { words: 20, keep: 40, window: 12, show: 12 };
function stepGist(c) {
  const { S, OFF, toolEdit } = c;
  const raw = String(S.Gist || '').replace(/\s+/g, ' ').trim();
  S.Gist = '';
  const L = S.$eng.gist = Array.isArray(S.$eng.gist) ? S.$eng.gist : [];
  if (OFF.has('gist')) { S._Recent_story = []; return; }
  if (!toolEdit && /<UpdateVariable/i.test(String(c.text || ''))) {
    const w = raw.replace(/^\[[^\]]*\]\s*/, '').split(' ').filter(Boolean);
    L.push(w.length ? `[${dstamp(S.World)} ${S.World.Time}] ${(w.length > GIST.words * 1.5 ? [...w.slice(0, GIST.words), '…'] : w).join(' ')}` : '');
    L.splice(0, Math.max(0, L.length - GIST.keep));
  }
  S._Recent_story = L.slice(0, Math.max(0, L.length - GIST.window)).filter(Boolean).slice(-GIST.show);
}

// ---- 8i. 1.5.1 (Batch B, P1/P6): the cast. Who among the present gets their full canon sheet in the Cast Sheet (509; their
// keyword lore entry stays empty meanwhile): those who spoke in the last reply first, then the highest bond rank, at most
// CAST_FULL; the others get a brief sheet. From the reply's prose: who spoke without being in Scene.Present, who was mentioned.
function stepCast(c) {
  const { S, text, xHere, xNew } = c;
  {
    const prev = _.isPlainObject(S.$ui.cast) ? S.$ui.cast : {};
    const pres = Object.keys(S.Scene.Present || {}).filter(id => NPC_IDS.has(id) && (ARRIVES[id] || 1) <= S.World.Year);
    let spoke = prev.spoke || [], gone = prev.gone || [], ment = prev.ment || [];
    if (text) {
      const prose = String(text).replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
      // 1.37.0: a dialogue-colour tag names its speaker outright
      const tagged = [...String(text).matchAll(/<say\s*:\s*([^:<>"\n]{1,40}?)\s*(?::\s*[a-z]+\s*)?>/gi)].map(m => NPC_ALIAS[m[1].trim().toLowerCase()]).filter(id => id && NPC_IDS.has(id));
      spoke = [...new Set([...speakersIn(prose), ...tagged])]; const said = new Set(spoke);
      gone = spoke.filter(id => !pres.includes(id));
      ment = NAME_RX.filter(([id, rx]) => !pres.includes(id) && !said.has(id) && (ARRIVES[id] || 1) <= S.World.Year && mentionIn(prose, id, rx)).map(([id]) => id).slice(0, 4);
    }
    const rank = id => (S.Bonds[id] ? num(S.Bonds[id].Rank, 0) : -1);
    const order = [...pres].sort((a, b) => (spoke.includes(b) - spoke.includes(a)) || (rank(b) - rank(a)) || (pres.indexOf(a) - pres.indexOf(b)));
    S.$ui.cast = { full: order.slice(0, CAST_FULL), brief: order.slice(CAST_FULL), spoke: spoke.filter(id => pres.includes(id)), gone, ment,
      where: Object.fromEntries(ment.filter(id => HAUNT[id]).map(id => [id, HAUNT[id]])), extras: xHere, xnew: xNew };
    // 1.37.1/1.37.2 (owner: tell A from B at a glance): dialogue colours. Nobody present at the same time shares a colour. Each
    // roster character has a first, second and third colour (data); a recorded Extras character gets three when first present
    // ($ui.sayx). Whoever was already in the scene keeps their colour; a newcomer takes the first of their three nobody present
    // has, then the free colour farthest from those in use. $ui.say holds the colours of the people present now; someone who
    // leaves goes back to their first colour. The unrecorded have none (the shared grey).
    if (SAY.n) {
      const SX = S.$ui.sayx = _.isPlainObject(S.$ui.sayx) ? S.$ui.sayx : {}, was = _.isPlainObject(S.$ui.say) ? S.$ui.say : {}, SY = {};
      const before = [...(prev.full || []), ...(prev.brief || []), ...(prev.extras || [])];
      const here = [...order, ...xHere], keep = here.filter(id => before.includes(id)).concat(here.filter(id => !before.includes(id)));
      const taken = [];
      const gap = i => (taken.length ? Math.min(...taken.map(t => SAY.dist[i][t])) : 99);
      const farthest = (pool, tie) => pool.reduce((b, i) => (gap(i) > gap(b) || (gap(i) === gap(b) && tie(i) < tie(b)) ? i : b));
      for (const k of Object.keys(SX)) if (!(k in (S.Extras || {})) && !(k in (S.$ui.xold || {}))) delete SX[k];   // forgotten records
      for (const id of xHere) if (!Array.isArray(SX[id])) {   // three colours for a new Extras character, the least used by others first
        const xUse = i => Object.values(SX).filter(t => t[0] === i).length;
        const t = [];
        for (let k = 0; k < 3; k++) t.push(farthest([...Array(SAY.n).keys()].filter(i => !t.includes(i) && !taken.includes(i)) , i => xUse(i) * 100 + i));
        SX[id] = t;
      }
      for (const id of keep) {
        const three = SAY.start[id] || SX[id] || [];
        let c = before.includes(id) && id in was ? was[id] : -1;
        if (!(c >= 0 && c < SAY.n) || taken.includes(c)) c = three.find(i => i >= 0 && i < SAY.n && !taken.includes(i)) ?? -1;
        if (c < 0) { const free = [...Array(SAY.n).keys()].filter(i => !taken.includes(i)); if (!free.length) continue; c = farthest(free, i => i); }
        taken.push(c); SY[id] = c;
      }
      S.$ui.say = SY;
    }
  }
}

// ---- 8l. 1.12.0 (planning/DRAFT_missed_reports.md): what the last update may have left out of its report. Reminders for <now>
// only: nothing here changes a number. At most MISS_MAX lines, most important first, and the same hint is not repeated within two
// days ($eng.missed). A player-tool edit keeps the reminders it found.
function stepReminders(c) {
  const { S, B, text, userText, hasB, toolEdit, OFF, REPORTED, absA, elapsed, dayNo, V, M, startedNow, restedAs, canon, KR, Hd, lineNoPay } = c;
  if (hasB && !toolEdit) {
    const seen = _.pickBy(_.isPlainObject(S.$eng.missed) ? S.$eng.missed : {}, d => num(d, -99) >= dayNo - 2);
    const out = [], add = (sig, line) => { if (!(sig in seen) && !out.some(o => o[0] === sig)) out.push([sig, line]); };
    if (!OFF.has('reminders')) {
      // 1.18.0 (I3-I6): evidence-based prompts; none moves a number or invents detection/healing.
      const bag0 = B.Inventory || {}, bag1 = S.Inventory || {};
      const newTx = newLines(((B.Player || {}).Wallet || {}).Transactions, S.Player.Wallet.Transactions).join(' | ').toLowerCase();
      const shopAt = placeKey(S.World.Location);
      let expected = 0; const acquired = [];
      // 1.45.0 (audit 3.4): purchases are settled by the engine (3b); this catches an item put in the Bag at its shop without one
      const shopOf = name => shopRows(name).find(x => x[2] === shopAt || placeKey(x[1]) === shopAt);
      for (const [name, item] of Object.entries(bag1)) {
        const row = shopOf(name), before = keyIn(bag0, name), engine = (c.bagTx || {})[name.trim().toLowerCase()];
        const qty = Math.max(0, num(item && item.Qty, 0) - num(before && bag0[before] && bag0[before].Qty, 0) - (engine ? Math.max(0, engine.done) : 0));
        if (!row || !qty) continue;
        expected += qty * row[0]; acquired.push(name);
      }
      if (expected) {
        const paid = Math.max(0, num(((B.Player || {}).Wallet || {}).Points, 0) - num(S.Player.Wallet.Points, 0) + (c.tx || []).filter(x => x.cur === 'Points').reduce((a, x) => a + x.delta, 0));
        const named = acquired.every(x => newTx.includes(x.toLowerCase()));
        if (paid < expected || !named) add(`shop:${acquired.join('|')}:${dayNo}`, `${acquired.join(', ')} entered the Bag at a shop (listed total ${expected} points) with no purchase reported. If bought, report it in /Purchases/- (the engine pays and fills the Bag); if gifted or found, make that clear in the story.`);
      }
      for (const [name, injury] of Object.entries(S.Player.Injuries || {})) {
        const by = num(((S.$eng.heals || {})[name] || {}).abs, -1);
        if (by >= 0 && by <= absA) add(`heal:${name}:${dayNo}`, `${name}'s Heals_by time has arrived: show recovery or a Medical Centre visit if the story supports it; never heal off-screen.`);
      }
      const dorm = String(S.Player.Profile.Dorm || '').trim().toLowerCase(), where = placeKey(S.World.Location);
      if (/^CURFEW/.test(S.World._Curfew || '') && dorm && dorm !== 'unsorted' && !where.startsWith(dorm) && !awayIn(S))
        add(`curfew:${where}:${dayNo}`, `{{user}} is at ${placeOf(S.World.Location)} after dorm curfew. If someone catches them, report the appropriate reputation deed; being out alone is not proof of detection.`);
      const keepers = new Set((S.Hidden.Known_by || []).map(canon));
      for (const [id, bond] of Object.entries(S.Bonds || {})) {
        const prior = (((B.Bonds || {})[id] || {}).Knows || []);
        if (!keepers.has(id) && (bond.Knows || []).some(x => !prior.includes(x) && /(?:true|hidden|forbidden) magic/i.test(String(x))))
          add(`knows-magic:${id}:${dayNo}`, `${id}'s Knows now mentions {{user}}'s hidden magic. If ${id} truly learned the secret, add ${id} to Hidden.Known_by.`);
      }
      const prose = String(text || '').replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
      const narr = prose.replace(QUOTE_RX, ' '), said = String(userText || ''), low = (said + '\n' + prose).toLowerCase();
      const actsOf = id => REPORTED.acts.filter(a => canon(a.With) === id);
      const bonded = Object.keys(S.Scene.Present || {}).map(canon).filter(id => S.Bonds[id] && id !== KR.id);
      const Tq = M._Techniques || {}, hasWord = (hay, w) => (WORD_RX.get(w) || WORD_RX.set(w, new RegExp('(^|[^a-z])' + _.escapeRegExp(w.toLowerCase()) + '($|[^a-z])')).get(w)).test(hay);
      // R1: HP lost with no injury named (D13)
      const hp0 = num(B.Player.Vitals.HP, 0), inj0 = B.Player.Injuries || {};
      if (V.HP > 0 && V.HP < hp0 && !Object.keys(S.Player.Injuries || {}).some(k => !(k in inj0)))
        add(`hp:${absA}`, `HP fell by ${Math.round(hp0 - V.HP)} with no injury named: add it to Player.Injuries.`);
      // R12: hidden magic used in front of people who do not know, and Dove_attention did not move
      if (Hd._True_magic && num(Hd.Dove_attention, 0) <= num((B.Hidden || {}).Dove_attention, 0)) {
        const hid = [...new Set([...REPORTED.casts, ...startedNow])].filter(k => Tq[k] && (Tq[k].Hidden || /\[true\]/.test(Tq[k].Notes || '')));
        const know = new Set((Hd.Known_by || []).map(x => canon(String(x).trim())));
        const saw = Object.keys(S.Scene.Present || {}).filter(id => !know.has(canon(id)));
        if (hid.length && saw.length) add(`hidden:${hid[0]}:${dayNo}`, `${hid[0]} (hidden magic) was used with ${saw.slice(0, 3).join(', ')} present, but Dove_attention did not rise: raise it if it could have been noticed.`);
      }
      // R2: an item left the Bag with no use or gift reported
      const IB = B.Inventory || {}, IS = S.Inventory || {};
      for (const [k, it] of Object.entries(IB)) {
        const lk = k.toLowerCase(), now = keyIn(IS, lk);
        if (/sunfizz/.test(lk) || num(it && it.Qty, 1) - (now ? num(IS[now].Qty, 1) : 0) <= 0 || REPORTED.used.includes(itemKey(k)) || (c.craftSold || []).includes(lk)) continue;
        if (REPORTED.acts.some(a => /^(gift|rank_gift|birthday)$/.test(a.Kind) && (!a.Item || String(a.Item).toLowerCase().includes(lk) || lk.includes(String(a.Item).toLowerCase())))) continue;
        const usable = !!(fxOf(k) || {}).use;
        if (bonded.length) add(`bag:${lk}:${dayNo}`, `${k} left the Bag while ${bonded.slice(0, 2).join(' and ')} ${bonded.length > 1 ? 'were' : 'was'} here: if {{user}} gave it, report Kind gift with Item "${k}"${usable ? '; if {{user}} used it, insert it into /Consumables/-' : ''}.`);
        else if (usable) add(`bag:${lk}:${dayNo}`, `${k} left the Bag: if {{user}} used it, insert it into /Consumables/- so its effect applies.`);
      }
      if (text || said) {
        // R8: a pending Rank 5 gift or a one-use perk named without its report
        for (const [id, b] of Object.entries(S.Bonds)) {
          const g = (((REW.npcs || {})[id] || {}).gift || {}).name;
          if (b && b.$gift_pending && g && hasWord(low, g) && !actsOf(id).some(a => a.Kind === 'rank_gift'))
            add(`rgift:${id}:${dayNo}`, `${g} was mentioned: if ${id} actually handed it to {{user}}, report Kind rank_gift with ${id}.`);
        }
        for (const [k, p] of Object.entries(S._Perks || {}))
          if (num(p && p.Uses, 0) >= 1 && (B._Perks || {})[k] && hasWord(low, k) && !REPORTED.perks.includes(k.toLowerCase()))
            add(`perk:${k}:${dayNo}`, `${k} was mentioned: if {{user}} spent it, insert "${k}" into /Perk_use/-.`);
        // R5: one of {{user}}'s techniques named, but not charged
        const activeT = new Set(Object.values(M.Active || {}).map(e => e && e.Technique)), usedT = new Set([...REPORTED.casts, ...startedNow]);
        for (const k of Object.keys(Tq)) {
          if (k.length < 5 || usedT.has(k) || activeT.has(k) || !hasWord(low, k)) continue;
          add(`cast:${k}:${absA}`, `${k} appears in the last exchange but was not charged: if {{user}} actually cast it, report it in /Magic/Casts (or Magic.Active if it lasts).`);
        }
      }
      // R11: a costly effect left running for hours (or through sleep)
      for (const [name, e] of Object.entries(M.Active || {})) {
        const t = Tq[e && e.Technique], h = t && e.$started >= 0 ? (absA - e.$started) / 60 : 0;
        if (!(num(t && t.Upkeep_per_min, 0) > 0) || !(h >= 2 || (restedAs === 'sleep' && h >= 1))) continue;
        add(`active:${name}:${dayNo}`, `${name} has been running for ${h >= 10 ? Math.round(h) : Math.round(h * 10) / 10} h${restedAs === 'sleep' ? ', through sleep,' : ''} and costs mana every minute: remove it from Magic.Active if {{user}} ended it.`);
      }
      if (text) {
        // R6: a bonded character spoke, with no interaction reported and no talk counted today
        for (const id of (S.$ui.cast || {}).spoke || []) {
          const dd = (S.$eng.daily || {})[id];
          if (!S.Bonds[id] || id === KR.id || actsOf(id).length || (dd && dd.day === dayNo && dd.talk)) continue;
          add(`talk:${id}:${dayNo}`, `${id} spoke, but no interaction was reported: if it was a real conversation with {{user}}, report Kind talk (or hangout); a passing greeting adds nothing.`);
        }
        // R7: the narration tells of a gift to someone present, with no gift reported
        if (!out.some(o => o[0].startsWith('bag:'))) {
          for (const sent of narr.split(/(?<=[.!?])\s+/)) {
            if (!/\b(gifts?|a present|birthday present|gift-wrapped)\b/i.test(sent) || !/\b(give|gives|gave|given|hand|hands|handed|offer|offers|offered|present|presents|presented|slide|slides|slid|press|presses|pressed)\b/i.test(sent)) continue;
            const to = bonded.find(id => NAME_FORMS[id] && mentionIn(sent, id, formRx(id)));
            if (to && !actsOf(to).some(a => /^(gift|rank_gift|birthday)$/.test(a.Kind))) { add(`gift:${to}:${dayNo}`, `A gift to ${to} may have happened: if {{user}} gave one, report Kind gift with the Item.`); break; }
          }
        }
      }
      // R9: {{user}} said sorry to someone they hurt, with no apology reported
      if (/\b(sorry|apologi[sz]e[sd]?|apologies|forgive me)\b/i.test(said)) {
        const hurt = bonded.filter(id => num(((B.Bonds || {})[id] || {}).Tension, 0) >= 10 && !actsOf(id).some(a => a.Kind === 'apology'));
        if (hurt.length) add(`sorry:${hurt[0]}:${dayNo}`, `{{user}} may have apologised to ${hurt.slice(0, 2).join(' or ')}: if so, report Kind apology (the engine decides how much it eases).`);
      }
      // R13: a Transactions line with no change to Points (H3)
      if (lineNoPay) add(`pts:${absA}`, `Transactions gained "${lineNoPay}" but Points did not change: apply it with a delta on /Player/Wallet/Points if it was actually spent or earned.`);
      if (text) {
        // R3: the narration skips time, the clock hardly moved
        const tm = MISS_TIME_RX.exec(narr);
        if (tm && elapsed < 30 && !c.campusOwe) add(`time:${absA}`, `The narration moves time on ("${tm[0]}") but the clock moved only ${Math.round(elapsed)} min: set World.Time (and Day) to match.`);
        // R4: the narration has {{user}} arrive at a map place that Location does not show
        let arr = '';
        for (const m of narr.matchAll(MISS_ARRIVE_RX)) arr = (m[1] || m[2] || m[3] || '').replace(/\s+(?:of|and|&)$/, '');
        // 1.47.0 (audit 3.2): both read by the campus parser (a shared dorm room is the own dorm's)
        const aid = arr ? campusPlace(arr) : '', nm = aid ? AR.campus.PL[aid].name : '';
        if (nm && !awayIn(S) && campusNode(S, aid) !== campusNode(S, campusPlace(S.World.Location)))
          add(`loc:${placeKey(nm)}:${absA}`, `The narration has {{user}} arriving at ${nm}, but Location is ${placeOf(S.World.Location) || 'unset'}: update it if {{user}} is there now.`);
        // R10: an hour or more at a training place, training words, no training session reported
        if (elapsed >= 50 && !REPORTED.training && MISS_TRAIN_AT.includes(placeKey(S.World.Location)) && !/^P[123] /.test(S.World._Period || '')
          && MISS_TRAIN_RX.test(said + '\n' + narr) && V._Fatigue !== 'Collapsed')
          add(`train:${placeKey(S.World.Location)}:${dayNo}`, `{{user}} may have trained at ${placeOf(S.World.Location)}: if it was a real session of about an hour, report it in /Practice/- with its Track (mana or stamina).`);
      }
    }
    S.$ui.missed = out.slice(0, MISS_MAX).map(o => o[1]);
    for (const [sig] of out.slice(0, MISS_MAX)) seen[sig] = dayNo;
    S.$eng.missed = seen;
  }
}

// ---- 8m. 1.16.0 (owner-approved planning/DRAFT_dynamic_ambience.md): ambience for the next reply. How crowded and how lit the
// place is and one sensory cue type (on a new place or time block); a seeded beat (texture nearby, or a small brush with {{user}});
// rarely, a secret uncanny moment from the place's ghost story. Types, not sentences: the narrator writes the detail each time.
// Seeded and computed once per update, so every swipe of the next reply sees the same result (like the Fortune roll).
function stepAmbience(c) {
  const { S, B, hasB, toolEdit, OFF, absB, absA, elapsed, evs, dayNo, dayNoB, WXM, seed, TU, wxNow, restedAs, weekNo } = c;
  S.$ui.amb = null;
  const AML = OFF.has('ambience') ? 'off' : S.$ui.ambience || 'full';
  if (AML !== 'off' && hasB && !toolEdit && AMB.cats) {
    const AE = _.isPlainObject(S.$eng.amb) ? S.$eng.amb : (S.$eng.amb = {});
    for (const k of ['cue', 'beat', 'unc']) if (!_.isPlainObject(AE[k])) AE[k] = {};
    const pk = placeKey(S.World.Location), pkB = placeKey(B.World.Location), t = absA % DAY_MIN;
    const inPlace = (key, n) => key === n || key.startsWith(n + ' ') || key.startsWith(n + ',');
    const catOf = key => {
      const sub = key.includes(',') ? key.slice(key.indexOf(',') + 1).trim() : '';
      const byName = test => Object.keys(AMB.cats).find(c => AMB.cats[c].places.some(test));
      return (sub && byName(n => sub.includes(n))) || byName(n => inPlace(key, n)) || '';
    };
    const cat = catOf(pk), C0 = AMB.cats[cat] || null;
    const BLOCKS_AT = [...new Set([360, ...PERIODS.flat(), 1080, 1200])];   // dawn, the periods, dusk, late evening
    const blockAt = m => BLOCKS_AT.filter(x => m >= x).length;
    const blk = blockAt(t), blkB = blockAt(absB % DAY_MIN);
    const cur = String(S.World._Curfew || ''), afterCurfew = /CURFEW|LOCKDOWN/.test(cur);
    const out = isOutdoor(S.World.Location) || /courtyard/.test(pk);
    const noClass = evs.some(e => e.noclass || e.home || e.lockdown || e.away);
    const exam = EXAM_MONTHS.includes(S.World.Month) && S.World.Week === 1 && MON_THU.includes(S.World.Day);
    const W0 = WXM !== 'off' && S.$ui.wx && !S.$ui.wx.away ? S.$ui.wx.now : null;
    const wtags = new Set();
    if (W0) {
      if (W0.snow) wtags.add('snow'); else if (W0.sky === 'Rain') wtags.add('rain');
      if (W0.sky === 'Storm') wtags.add('storm'); if (W0.sky === 'Fog') wtags.add('fog'); if (W0.sky === 'Clear') wtags.add('clear');
      if (W0.wind === 'windy' || W0.wind === 'gale') wtags.add('wind'); if (W0.temp >= 26) wtags.add('heat'); if (W0.temp <= 5) wtags.add('cold');
    }
    // crowd: the category's rhythm for this kind of day, then exams, events, weather (Full), breaks, the Thinning and curfew
    let crowd = -1;
    if (C0) {
      crowd = (noClass || S.World.Day === 'Sun' ? C0.free : S.World.Day === 'Sat' ? C0.sat || C0.free : C0.class)[blk];
      const plan = evs.map(e => `${e.t} ${schedOf(e, S.World.Day) || ''}`).join(' ').toLowerCase();
      if (exam && cat === 'study' && blk >= 1) crowd = 4;
      if (blk >= 2 && C0.places.some(n => plan.includes(n))) crowd = Math.max(crowd, 3);
      if (/feast/.test(plan) && pk.startsWith('ring dining hall') && t >= 1140 && t < 1320) crowd = 4;
      if (/arbiter hall/.test(plan) && pk.startsWith('arbiter hall') && t >= 540 && t < 660) crowd = 4;
      if (wxNow && wxBad(wxNow)) crowd = out ? Math.max(0, crowd - 2) : ['hub', 'dining', 'dorm_social', 'study', 'sport', 'clubs', 'mall'].includes(cat) ? Math.min(4, crowd + 1) : crowd;
      if (evs.some(e => e.home)) crowd = ['gate', 'staff', 'care'].includes(cat) ? Math.min(crowd, 1) : 0;
      if (afterCurfew && !['dorm_social', 'dorm_utility'].includes(cat)) crowd = 0;
    }
    // light: sunrise and sunset by the calendar (real-life months, interpolated by week), the sky, indoors or out
    const sx = S.World.Month - 1 + (S.World.Week - 0.5) / 4 - 0.5, s0 = Math.floor(sx), sf = sx - s0;
    const sa = AMB.sun[String(((s0 % 12) + 12) % 12 + 1)], sb = AMB.sun[String((((s0 + 1) % 12) + 12) % 12 + 1)];
    const rise = sa[0] + (sb[0] - sa[0]) * sf, set = sa[1] + (sb[1] - sa[1]) * sf;
    const phase = t < rise - 40 || t > set + 40 ? 'dark' : t < rise ? 'dawn' : t > set ? 'dusk' : 'day';
    const dim = !!W0 && (/Rain|Storm|Fog/.test(W0.sky) || !!W0.snow);
    const light = out ? (phase === 'dark' ? (wtags.has('clear') ? 'dark, starlit' : 'dark') : phase === 'day' ? (dim ? 'grey, overcast' : 'daylight') : phase)
      : phase === 'day' ? (dim ? 'grey daylight through the windows' : 'daylight through the windows') : afterCurfew || t < 420 ? 'lanterns at their night burn' : 'lamps lit';
    const season = SEASONS[S.World.Month - 1];
    const tbs = new Set([phase === 'dawn' ? 'dawn' : '', t >= 300 && t < 720 ? 'morning' : t >= 720 && t < 1020 ? 'day' : t >= 1020 && t < 1200 ? 'evening' : 'night'].filter(Boolean));
    const curfewOut = afterCurfew && !['dorm_social', 'dorm_utility'].includes(cat);
    const flu = !!(S.$ui.wx && S.$ui.wx.flu);
    const fits = (w, beat) => (w.out === undefined || w.out === out) && (!w.tb || w.tb.some(x => tbs.has(x))) && (!w.wx || w.wx.some(x => wtags.has(x)))
      && (!w.season || w.season.includes(season)) && (w.min === undefined || crowd >= w.min) && (w.max === undefined || crowd <= w.max)
      && (!w.exam || exam) && (!w.flu || flu) && (!beat || crowd > 0 || w.far) && (!beat || !curfewOut || w.curfew);
    // one cue type per new place or time block, not the same one at this place within three days
    const fresh = pk !== pkB || blk !== blkB || dayNo !== dayNoB || elapsed > 360;
    // the place's own types come first (7 or 6 times in 10), so the shared ones do not crowd them out
    const placeFirst = (all, tenths, tag) => { const own = all.filter(([x]) => x[0] === cat); return own.length && rollInt(0, 9, seed, tag + 'own', pk, absA) < tenths ? own : all; };
    let cue = '';
    if (C0 && fresh) {
      const hist = (AE.cue[pk] || []).filter(([, d]) => dayNo - d < 3);
      const all = AMB.cues.map((c, i) => [c, i]).filter(([c, i]) => (c[0] === '*' || c[0] === cat) && fits(c[3], false) && !hist.some(([j]) => j === i));
      const pool = placeFirst(all, 7, 'cue');
      if (pool.length) { const [c, i] = pickOf(pool, seed, 'cue', pk, absA); cue = c[2]; hist.push([i, dayNo]); }
      AE.cue[pk] = hist.slice(-12);
      for (const k of Object.keys(AE.cue).slice(0, -40)) delete AE.cue[k];
    }
    // the beat: on a new place, or 30 minutes after the last roll; never in a battle, asleep, in {{user}}'s class or on a tool edit
    const battle = !!(S.Battle && S.Battle.Active);
    const inClass = !noClass && /^P[123] /.test(S.World._Period || '') && ['teaching', 'craft', 'combat'].includes(cat);
    let beat = null, unc = null;
    if (AML === 'full' && C0 && !battle && restedAs !== 'sleep' && !inClass && (pk !== pkB || !(num(AE.last, -1) >= 0) || absA - num(AE.last, -1) >= 30)) {
      AE.last = absA;
      const d = d100(seed, 'amb', S.$eng.turn, absA), calm = AMB_CALM[TU.amb_freq] || AMB_CALM[2];
      let kind = d <= calm ? '' : d > 90 ? 'brush' : 'tex';
      if (kind === 'brush' && ((S.$ui.hap && S.$ui.hap.now) || noClass)) kind = '';   // a happening or an event day holds the attention
      // 1.24.0 (owner playtest): now and then the talk nearby is one of this place's stories {{user}} has not heard yet (once a day;
      // needs people around or company); the Campus Map then shows it
      const untold = kind ? (PLACE_LORE[pk] || []).filter(([u]) => !S.$ui.lore.includes(String(u))) : [];
      if (untold.length && (crowd > 0 || Object.keys(S.Scene.Present || {}).length) && num(AE.lore, -1) !== dayNo
        && d100(seed, 'lore', S.$eng.turn, absA) <= num((AMB.lore_places || {})[pk], num(AMB.lore_chance, 35))) {
        const [u, , title, text] = pickOf(untold, seed, 'lorepick', pk, absA);
        AE.lore = dayNo; hearLore(S, u, title, placeOf(S.World.Location)); beat = { kind: 'lore', text: `${title}. ${text.replace(/[.\s]+$/, '')}` }; kind = '';
      }
      if (kind) {
        const W1 = ((B.$ui || {}).wx || {}).now;
        const gos = S.$ui.gossip || [];
        const tomorrow = eventsOn(fromAbs((dayNo + 1) * DAY_MIN)).filter(e => !evs.some(x => x.t === e.t)), yesterday = eventsOn(fromAbs((dayNo - 1) * DAY_MIN)).filter(e => !evs.some(x => x.t === e.t));
        const special = sp => sp === 'overheard' ? (gos.length ? `overheard: the rumour "${pickOf(gos, seed, 'ovh', absA)[0]}", in someone else's words` : '')
          : sp === 'weather_turn' ? (W0 && W1 && (W0.sky !== W1.sky || W0.rare !== W1.rare) ? `the weather turning: ${S.$ui.wx.text || W0.sky.toLowerCase()}` : '')
          : sp === 'event_echo' ? (tomorrow.length ? `preparations for tomorrow's ${tomorrow[0].t.split(' (')[0]}` : yesterday.length ? `what is left of yesterday's ${yesterday[0].t.split(' (')[0]}` : '') : '';
        // 1.31.0 (owner-approved planning/DRAFT_location_activities.md): under running water the talk carries; at these places a beat
        // is a rumour overheard at the same chance as their lore
        const gosAt = (AMB.lore_places || {})[pk];
        if (gosAt && gos.length && (crowd > 0 || Object.keys(S.Scene.Present || {}).length) && d100(seed, 'gosat', S.$eng.turn, absA) <= gosAt) {
          beat = { kind, text: special('overheard') };
        } else {
          const bh = (AE.beat[cat] || []).filter(([, dd]) => dayNo - dd < 7);
          const pool = placeFirst(AMB.beats.map((b, i) => [b, i]).filter(([b, i]) => (b[0] === '*' || b[0] === cat) && b[1] === kind && fits(b[3], true) && !bh.some(([j]) => j === i) && (!b[3].special || special(b[3].special))), 6, 'beat');
          if (pool.length) {
            const [b, i] = pickOf(pool, seed, 'beat', pk, absA);
            beat = { kind, text: b[3].special ? special(b[3].special) : b[2] }; bh.push([i, dayNo]);
          }
          AE.beat[cat] = bh.slice(-30);
        }
        // 1.51.0 (audit 4.8): a "nearby" moment may be two people {{user}} knows, one of them a regular of this place
        if (kind === 'tex' && crowd > 0 && !curfewOut) {
          const regs = Object.keys(S.Bonds).filter(id => String(HAUNT[id] || '').toLowerCase().split(/[;,]/).some(h => { const k = placeKey(h.replace(/\(.*?\)/g, '').trim()); return k && inPlace(pk, k); })).sort();
          const pl = regs.length ? pairLine(c, regs, 'near', 'amb') : '';
          if (pl) beat = { kind, text: pl, pair: 1 };
        }
      }
    }
    // 1.51.0 (feature batch 3, audit 4.9): arriving at a place a Clue of an open thread names (Clues Where), a trace beat for that
    // thread, once a week per thread; <now> only says the thread touches this place (the engine never invents what is found)
    let trace = null;
    if (!OFF.has('mystery') && !battle && pk !== pkB) {
      const T = _.isPlainObject(AE.trace) ? AE.trace : (AE.trace = {});
      const open = th => { const m = (S.Mysteries || {})[th]; return !m || m.Status === 'open'; };
      const ths = _.uniq(Object.values(S.Clues || {}).filter(cl => cl && String(cl.Where || '').trim() && open(cl.Thread)
        && inPlace(pk, placeKey(canonLocation(cl.Where)))).map(cl => cl.Thread)).filter(th => T[th] !== weekNo).sort();
      if (ths.length && d100(seed, 'trace', S.$eng.turn, absA) <= num(AMB.trace_chance, 50)) { trace = pickOf(ths, seed, 'trace-pick', absA); T[trace] = weekNo; }
      for (const k of Object.keys(T).slice(0, -40)) delete T[k];
    }
    // the uncanny moment: a small seeded chance where and when one of the ghost stories can happen; at most one a week, the
    // same story not within 30 days; doubled in fog and during the Thinning (indoors), and for a story's own season or day
    const U = AE.unc;
    if (!_.isPlainObject(U.last)) U.last = {};
    if (AML === 'full' && !battle && num(U.w, -99) !== weekNo) {
      const thin = evs.some(e => e.lockdown), alone = !Object.keys(S.Scene.Present || {}).length, dark = phase === 'dark' || phase === 'dusk';
      const inWin = (f, to) => (f <= to ? t >= f && t < to : t >= f || t < to);
      const FARK = ['boathouse and lake', 'fishing house', 'willow island', 'grassy field and hills', 'old hut', 'forest', 'forest clearing', 'observation tower'];
      const isFar = k => FARK.some(n => inPlace(k, n)), path = pk !== pkB && (isFar(pk) || isFar(pkB));
      const cands = (AMB.uncanny || []).filter(u => (!u.places.length || u.places.some(n => inPlace(pk, n))) && (!u.out || out) && (!u.dark || dark)
        && (!u.dusk || phase === 'dusk' || phase === 'dark') && (u.from === undefined || inWin(u.from, u.to)) && (!u.curfew || /CURFEW/.test(cur))
        && (!u.alone || alone) && (!u.awake || restedAs !== 'sleep') && (!u.asleep || restedAs === 'sleep' || restedAs === 'rest') && (!u.path || path)
        && !(thin && out) && dayNo - num(U.last[u.id], -99) >= 30);
      if (cands.length) {
        const u = pickOf(cands, seed, 'unc', absA);
        const own = (u.x2 === 'winter' && season === 'Winter') || (u.x2 === 'remembrance' && evs.some(e => /Remembrance/.test(e.t)));
        const ch = num(AMB.uncanny_chance, 5) * (wtags.has('fog') ? 2 : 1) * (thin ? 2 : 1) * (own ? 2 : 1);
        if (d100(seed, 'uncanny', S.$eng.turn, absA) <= ch) { U.w = weekNo; U.last[u.id] = dayNo; unc = { id: u.id, title: u.title, text: u.text }; }
      }
    }
    if (fresh || beat || unc || trace) S.$ui.amb = { place: placeOf(S.World.Location), crowd: crowd >= 0 ? AMB_LEVELS[crowd] : '', light, cue, beat, unc, ...(trace ? { trace } : {}) };
  }
}

// ---- 9. UI bookkeeping ----
// ---- 8n. 1.44.0 (audit 3.10) Agenda. Commitments, Hooks, Next plans, Projects (Due), Notices (Until) and the letter home share one
// date marker (anchorWhen / agendaWhen) and one status (agendaState). This step gives the one reminder when a thing turns due or
// overdue, and builds the one "coming up" feed ($ui.agenda) that the Planner, the Notice Board, the bracelet and <now> read. Item:
// { d: days from today, k: event | commitment | project | notice | lore | letter | birthday | note, t, on: "M3 W2 Mon", to / te: last day
// (name / days from today) of a run of event days, at: "HH:MM" when timed, s: status, w: with whom, h: 1 the Month 12 holiday, r: 1 a results day }. Window:
// yesterday to AGENDA.days ahead, plus anything overdue. Hooks and Next plans are the narrator's: reminded, never in the feed.
function stepAgenda(c) {
  const { S, log, absA, dayNo, OFF } = c;
  const A = S.$eng.agenda = _.isPlainObject(S.$eng.agenda) ? S.$eng.agenda : {}, at = agendaWhen(c);
  const first = !_.isPlainObject(A.st), st0 = first ? {} : A.st, st = {};
  const Y = S.World.Year || 1, dayLabel = n => { const T = fromAbs(n * DAY_MIN); return `${T.Year !== Y ? `Y${T.Year} ` : ''}M${T.Month} W${T.Week} ${T.Day}`; };
  const turned = (id, s) => { st[id] = s; return !first && !!s && st0[id] !== s; };   // the first run after an update only records
  const items = [], cur = {};   // 1.73.0: cur = {{user}}'s dated matters now, for asking after
  const put = (k, t, abs, s, extra) => {
    if (abs < 0) return;
    const n = Math.floor(abs / DAY_MIN), d = n - dayNo, tm = fromAbs(abs).Time;
    if ((d >= -1 && d <= AGENDA.days) || s === 'overdue') items.push({ d, k, t, on: dayLabel(n), ...(tm !== '23:59' ? { at: tm } : {}), ...(s ? { s } : {}), ...extra });
  };
  for (const [k, cm] of Object.entries(S.Commitments || {})) {
    const abs = num(cm.$abs, -1), s = agendaState(abs, absA, 'commitment');
    put('commitment', k, abs, s, cm.With ? { w: cm.With } : {});
    if (abs >= 0) cur['c:' + k] = [k, abs, cm.With];
    if (turned('c:' + k, s) && s === 'overdue') { log.push(`"${k}" is overdue (was due ${cm.Due}${cm.With ? `, with ${cm.With}` : ''}): resolve it in the story, then remove it.`); S.$ui.toasts.push(`Overdue: ${k}`); }
  }
  for (const [k, hk] of Object.entries(S.Hooks || {}))
    if (turned('h:' + k, hk._State) && hk._State === 'due') log.push(`Hook due now: "${k}"${hk.Who ? ` (${hk.Who})` : ''}. Pay it off, break it, or drop it.`);
  for (const [k, pj] of Object.entries(S.Projects || {})) {
    const p = num(pj.Progress, 0), abs = at('p:' + k, p < 100 ? pj.Due : '', p < 100 ? pj : null, 'Due'), s = agendaState(abs, absA, 'project');
    put('project', `${k} due`, abs, s, pj.With ? { w: pj.With } : {});
    if (abs >= 0) cur['p:' + k] = [`${k} (a project)`, abs, pj.With]; else if (p >= 100) cur['p:' + k] = [`${k} (a project)`, -2, pj.With];   // -2: handed in
    if (!turned('p:' + k, s)) continue;
    if (s === 'due') log.push(`Project "${k}" is due ${whenText(abs, absA)} (Progress ${p}%).`);
    if (s === 'overdue') { log.push(`Project "${k}" was due ${pj.Due} and is not finished (Progress ${p}%): hand it in late, ask for more time, or drop it in the story.`); S.$ui.toasts.push(`Overdue: ${k}`); }
  }
  for (const [k, nt] of Object.entries(S.Notices || {})) put('notice', `last day: ${k}`, num(nt.$abs, -1), agendaState(num(nt.$abs, -1), absA, 'notice'));
  for (const [k, lc] of Object.entries((S.Campus_State || {}).Lore_changes || {})) put('lore', `last day changed: ${k}`, num((lc || {}).$abs, -1), '');   // 1.75.0
  const H = S.$eng.home;
  if (!OFF.has('letters') && _.isPlainObject(H) && num(H.due, -1) >= 0 && !H.key) put('letter', `Reply from ${H.from || 'home'} expected`, Math.floor(H.due / DAY_MIN) * DAY_MIN + DAY_MIN - 1, '');
  // {{user}}'s birthday and the player's own calendar notes ($ui.marks "Y1 M3 W2 Thu"; the narrator never reads them)
  const dayOfKey = (y, m, w, dd) => (y - 1) * YEAR_DAYS + (m - 1) * 28 + (w - 1) * 7 + DAYS.indexOf(dd);
  const bd = /^M(\d{1,2}) W([1-4]) (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.exec(String(S.Player.Profile.Birthday || '').trim());
  if (bd) for (const y of [Y, Y + 1]) put('birthday', 'Your birthday', dayOfKey(y, +bd[1], +bd[2], bd[3]) * DAY_MIN + DAY_MIN - 1, '');
  for (const [key, t] of Object.entries(S.$ui.marks || {})) {
    const m = /^Y(\d+) M(\d{1,2}) W([1-4]) (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.exec(key);
    if (m && t) put('note', String(t), dayOfKey(+m[1], +m[2], +m[3], m[4]) * DAY_MIN + DAY_MIN - 1, '');
  }
  // the calendar: each event once, a run of days of one event as one item
  const runs = [];
  for (let d = -1; d <= AGENDA.days; d++) for (const e of eventsOn(fromAbs((dayNo + d) * DAY_MIN))) {
    const last = runs.find(x => x.e.t === e.t && x.to === d - 1);
    if (last) last.to = d; else runs.push({ e, d, to: d });
  }
  for (const { e, d, to } of runs) items.push({ d, k: 'event', t: e.t.replace(/\s*\(Player\.Profile[^)]*\)/, ''), on: dayLabel(dayNo + d),
    ...(to > d ? { to: fromAbs((dayNo + to) * DAY_MIN).Day, te: to } : {}), ...(e.home ? { h: 1 } : {}), ...(e.ranking ? { r: 1 } : {}) });
  const KO = ['event', 'birthday', 'commitment', 'project', 'notice', 'letter', 'note'];
  S.$ui.agenda = _.sortBy(items, [x => x.d, x => x.at || '99', x => KO.indexOf(x.k)]);
  A.st = st;
  askAfter(c, A, cur, dayLabel);
  if (_.isPlainObject(A.when)) for (const id of Object.keys(A.when))
    if ((id.startsWith('n:') && !((S.Bonds || {})[id.slice(2)] || {}).Next) || (id.startsWith('p:') && !(S.Projects || {})[id.slice(2)])) delete A.when[id];
}

// 1.73.0: asking after. A Commitment or Project of {{user}}'s that appears while characters are in the scene is something they
// heard about (A.ask: key -> { t, due, h: who heard, end, a: day each was shown it }). It ends once its time has passed, or when it
// leaves the record on or after its day (a project also when handed in); whoever is in the scene then saw it. Each of the others, at
// Rank ASK_RANK+ and not the one it was with, may ask how it went in the first scene they share with {{user}} within ASK_DAYS: the
// line stays for that day's scene, then is spent. Gone before its day (cancelled, or done early): nobody asks. One line a person.
function askAfter(c, A, cur, dayLabel) {
  const { S, absA, dayNo, OFF, canon } = c;
  const first = !_.isPlainObject(A.ask), AK = A.ask = first ? {} : A.ask;   // the first run (an older save) records, nobody heard
  const PRS = Object.keys(S.Scene.Present || {}).filter(id => S.Bonds[id]);
  for (const [key, [t, due, w]] of Object.entries(cur)) {
    const x = AK[key];
    if (!x) {
      if (due === -2) continue;
      const ws = String(w || '').split(/\s*(?:,|&|\band\b)\s*/).filter(Boolean).map(canon);
      AK[key] = { t, due, h: first ? [] : PRS.filter(id => !ws.includes(id)), end: -1, a: {} };
    } else if (x.end < 0 && due >= 0) x.due = due;
  }
  // 1.74.0: an injury of {{user}}'s (moderate or worse) is news to everyone who was not there; it lasts while it is on record
  const INJ = S.Player.Injuries || {}, inj0 = ((c.B && c.B.Player) || {}).Injuries || {};
  if (c.hasB) for (const [k, v] of Object.entries(INJ)) if (!(k in inj0) && v && v.Severity !== 'minor' && !AK['i:' + k])
    AK['i:' + k] = { t: k, due: absA, h: Object.keys(S.Bonds).filter(id => !PRS.includes(id) && !NO_BOND.has(id)), end: dayNo, a: {}, ev: 1 };
  const asks = {};
  for (const key of Object.keys(AK).sort((a, b) => num(AK[b].end, -1) - num(AK[a].end, -1))) {
    const x = AK[key];
    if (num(x.end, -1) < 0) {
      const gone = !(key in cur) || cur[key][1] === -2;
      if (gone && !(cur[key] && cur[key][1] === -2) && Math.floor(num(x.due, 0) / DAY_MIN) > dayNo) { delete AK[key]; continue; }
      if (!gone && absA < num(x.due, 0)) continue;
      x.end = dayNo; x.h = (x.h || []).filter(id => !PRS.includes(id));   // those there when it happened saw it
    }
    if (dayNo - x.end > ASK_DAYS || (x.ev && !INJ[key.slice(2)])) { delete AK[key]; continue; }
    if (!_.isPlainObject(x.a)) x.a = {};
    if (!OFF.has('npc_initiative')) x.h = x.h.filter(id => {
      const b = S.Bonds[id], here = PRS.includes(id);
      if (!b) return false;
      if (x.a[id] == null) { if (!here || b.Rank < ASK_RANK || asks[id]) return true; x.a[id] = dayNo; }
      else if (!here || x.a[id] !== dayNo) return false;
      const on = dayLabel(Math.floor(num(x.due, 0) / DAY_MIN));
      if (!asks[id]) asks[id] = x.ev ? `Has not seen {{user}} since the injury (${x.t}, ${on}): may notice it or ask, if that is like them.`
        : `Knew about {{user}}'s "${x.t}" (${on}) and has not heard how it went: may ask, if that is like them.`;
      return true;
    });
    if (!x.h.length) delete AK[key];
  }
  S.$ui.asks = asks;
}

// ---- 8g2. 1.50.0 (feature batch 2, audit 4.5), before the Journal is written (8h): the routine week. A player-tool patch with $ui.plan.run arms it: the span and its
// moments ($ui.routine, with <now>'s line); a refusal says why. The story reply after it ran the routine (routineStart, routineSchool,
// routineProf): here its recap goes to the Journal and the plan is disarmed. Any other reply leaves nothing armed.
function stepRoutine(c) {
  const { S, log, jnl, toolEdit } = c, P = _.isPlainObject(S.$ui.plan) ? S.$ui.plan : null, R = c.routine;
  if (R) {
    const from = fromAbs(num((c.B.$eng || {}).abs, toAbs(c.B.World)));
    jnl.push(`Routine week (${stamp(from)} to ${stamp(S.World)}): ${R.done.length ? R.done.join('; ') : 'an ordinary stretch of days'}.`);
    S.$ui.toasts.push('Routine week lived');
  }
  if (!toolEdit || !P || !P.run) { if (P) P.run = 0; S.$ui.routine = null; return; }
  const sp = routineSpan(c);
  if (sp.why) { P.run = 0; S.$ui.routine = { why: sp.why }; S.$ui.toasts.push(`Routine week: ${sp.why}`); return; }
  const plan = planOf(S), moments = routineMoments(c, sp.to);
  const Rt = { to: sp.to, at: stamp(fromAbs(sp.to)), stop: sp.stop, days: r2((sp.to - c.absA) / DAY_MIN), moments };
  Rt.line = routineLine(S, Rt, plan);
  S.$ui.routine = Rt;
  log.push(`Routine week armed: until ${Rt.at} (stops before ${sp.stop}).`);
}

// ---- 8o. 1.47.0 (audit 3.8): whereabouts. "May be here" ($ui.maybe) from the one model in shared.js (whereabouts, presenceAt) that
// the Map panel's Regulars and <now>'s presence lines (who is likely around {{user}}'s place now, what the period holds, the regulars,
// those the weather moved indoors, clubs meeting here, regulars with a status, {{user}}'s class line; stepNow, $ui.now.pres) also use.
const presenceNow = S => presenceView(PRESENCE, S, id => uiOn(S.$ui, id));
// 1.33.0 (owner-approved planning/DRAFT_classes_and_teachers.md): Practical Magic is one class per combat role (all dorms, by year;
// {{user}} attends the class of the first role in Combat_role); a free period ($ui.free) means the class is not held
function classLineAt(PD, V, loc) {
  const place = placeOf(loc), pk = place.toLowerCase().replace(/^the /, ''), c = V.cls;
  const ROLE = classRoleOf(V.PR), TEACH = PD.teach || {}, STU = PD.stu || {}, free = c && c[3] === 'class' ? (V.UI.free || []).find(f => f.p === V.pIdx && f.s === c[0]) : null;
  if (free) return 'Free period: ' + c[0] + ' is not held now (' + (free.t || 'the teacher') + ' ' + free.why + '). {{user}} and their classmates have the hour free; it counts against no one.';
  if (!(c && c[3] === 'class' && c[2].includes(pk))) return '';
  const PY = Math.max(1, Math.min(3, Number(V.PR.Year) || 1)), dorm = V.PR.Dorm || 'Unsorted', PM = c[0] === 'Practical Magic', st = id => npcStatusOf(V.NST, id);
  const tch = Object.keys(TEACH).find(id => TEACH[id].some(x => x[0] === c[0] && (x[1] === PY || x[1] === 0) && (!x[2] || x[2] === (ROLE || 'Attack'))) && !st(id));
  const mates = Object.keys(STU).filter(id => { const w = whereabouts(PD, V, id); return !w.gone && !w.sick && !w.st && STU[id][0] + V.Y - STU[id][1] === PY && (c[1] !== 'D' || dorm === 'Unsorted' || STU[id][2] === dorm); }).slice(0, 8);
  return PM ? 'Your class now: Practical Magic, ' + (ROLE ? 'the ' + ROLE + ' class' : 'the joint assessment (roles not assigned yet: the five role teachers watch the first-years together and assign roles)')
      + ' (Year ' + PY + ', all dorms; sparring partners from their own dorm except in Training Week) — teacher ' + (tch || 'not on record') + '; classmates: students of Year ' + PY + ' in this role, from any dorm'
    : 'Your class now: ' + c[0] + ' [' + c[1] + '] (Year ' + PY + ', ' + (c[1] === 'D' ? (dorm === 'Unsorted' ? 'dorm not yet sorted' : dorm + ' only') : 'all dorms')
    + ') at ' + ((PD.vn || {})[pk] || place) + (pk === 'lecture halls' ? ' — Floor ' + (PY + 1) + ' (the Year ' + PY + ' floor)' : '') + ' — teacher ' + (tch || 'not on record: create one, and keep them the same person every lesson') + '; classmates on record: ' + (mates.join(', ') || 'none');
}
// whereabouts in the engine: an NPC who cannot turn up now (graduated, not arrived, a status that keeps them away, off sick)
const npcOut = (V, S, id) => { const w = whereabouts(PRESENCE, V, id); return !whereFree(w) || AWAY_RX.test(npcStatusIn(S, id)); };
function stepHere(c) {
  const { S, absA, OFF, canon } = c;
  const V = presenceNow(S), here = placeKey(canonLocation(S.World.Location)), present = S.Scene.Present || {};
  // "May be here": a Next plan at this place (Rank 5+ bonds, until it lapses), then an appointment here within the hour (1.18.0 I8)
  const maybe = [];
  for (const [id, b] of Object.entries(S.Bonds || {})) {
    const nx = b && b.Next;
    if (!nx || !nx.Where || present[id] || npcOut(V, S, id) || placeKey(canonLocation(nx.Where)) !== here) continue;
    const until = agendaWhen(c)('n:' + id, nx.Until);
    if (until < 0 || absA <= until) maybe.push([id, nx.What]);
  }
  if (!OFF.has('planner') && !awayIn(S)) for (const [title, x] of Object.entries(S.Commitments || {})) {
    if (!x || !x.With || !x.Where || x.$abs < absA || x.$abs > absA + 60 || placeKey(canonLocation(x.Where)) !== here) continue;
    for (const name of String(x.With).split(/,|\band\b/i).map(y => canon(y.trim())).filter(Boolean))
      if (!present[name] && !npcOut(V, S, name) && !maybe.some(y => y[0] === name)) maybe.push([name, `appointment: ${title}`]);
  }
  S.$ui.maybe = maybe;
}

function stepUi(c) {
  const { S, B, offUnlock, evs, dayNo, M, Hd, text, toolEdit, OFF } = c;
  const place = placeOf(S.World.Location);
  // 1.16.1 (audit B6): only places on the Campus Map, so off-campus names never push a discovered place out of the list (cap 80)
  if (place && plName(place) && !S.$ui.discovered.includes(place)) S.$ui.discovered.push(place);
  // 1.24.0: a story is heard when the narration names it (as a proper name, so "the long corridor" in passing does not count); with
  // Ambience below Full nobody is overheard, so a place's stories come with the first visit
  if (!toolEdit && text) for (const k of Object.keys(PLACE_LORE)) for (const [u, nm, title] of PLACE_LORE[k])
    if (!S.$ui.lore.includes(String(u)) && new RegExp(`(^|[^\\w'])(The )?${_.escapeRegExp(nm)}(?![\\w'])`).test(text)) hearLore(S, u, title, '');
  if ((OFF.has('ambience') || (S.$ui.ambience || 'full') !== 'full') && placeKey(S.World.Location) !== placeKey(((B || {}).World || {}).Location))
    for (const [u, , title] of PLACE_LORE[placeKey(S.World.Location)] || []) hearLore(S, u, title, placeOf(S.World.Location));
  const unlock = k => { if (!offUnlock.has(k) && !S.$ui.unlocks.includes(k)) S.$ui.unlocks.push(k); };   // 1.1.0: a feature that is off does not unlock
  if (S.Battle.Active) unlock('battle');
  if (Hd._True_magic) unlock('hidden');
  if (Object.keys(M.Pacts || {}).length) unlock('pacts');
  if (Object.keys(S.Commitments || {}).length) unlock('planner');
  if (Object.keys(S.Player.Injuries || {}).length) unlock('injuries');
  // 1.44.0: a rumour or a story heard can be pinned as a clue there, so either opens the Mystery Board
  if ((S.Campus_State.Secrets_revealed || []).length || Object.keys(S.Clues || {}).length || (S.Campus_State.Rumours || []).length || S.$ui.lore.length) unlock('mystery');
  if (Object.keys(S.Notices || {}).length || CASTLE.has(place.toLowerCase())) unlock('notices');
  if (Object.keys(S.Letters || {}).length) unlock('letters');
  const doy = dayNo % (YEAR_DAYS);
  if (S.Competition.Status || S.Competition.Tier || doy >= 2 * 28) unlock('competition');   // from Month 3 (Training Week, Dorm Competition)
  if (Object.keys(S.Projects || {}).length) unlock('projects');
  if (Object.keys(S.Inventory || {}).length) unlock('inventory');                 // 1.1.0
  if (Object.keys(S.Player.Conditions || {}).length) unlock('conditions');
  if (S.Trip.Active || TRIPS.some(tp => { const d0 = (tp.m - 1) * 28 + (tp.w - 1) * 7 + DAYS.indexOf(tp.d); return doy >= d0 - 14 && doy <= d0 + 2; })) unlock('trip');
  // 1.3.4: the bracelet's "Next" chip; 1.44.0 (Agenda): an appointment later today comes first when it is sooner
  {
    const nx = nextUp(S.World, evs, S), mine = (S.$ui.agenda || []).find(x => x.d === 0 && x.at && x.k === 'commitment' && x.s !== 'overdue' && x.at > S.World.Time);
    S.$ui.next = mine && (!nx || mine.at < nx.at) ? { at: mine.at, what: mine.t, kind: 'plan' } : nx;
  }
  delete S.$ui.soon;   // 1.32.0's seven-day list is the Agenda feed now ($ui.agenda, stepAgenda)
  S.$ui.toasts = S.$ui.toasts.slice(-10);
}

// ---- 10. commit ----
function stepCommit(c) {
  const { S, B, log, hasB, absA } = c;
  S.$eng.abs = absA;
  if (Array.isArray(S.Player.Wallet.Transactions)) S.Player.Wallet.Transactions = S.Player.Wallet.Transactions.slice(-20);   // 1.45.0 (audit 3.5)
  // 1.7.4: the first update in campaign Year 2 or later dates every line still written in Year 1's plain form ("[M3 W2 Tue]" ->
  // "[Y1 M3 W2 Tue]"); lines of this update already carry their own year (stamp, withYear), so a bare date here is from Year 1.
  if (hasB && (B.World.Year || 1) === 1 && S.World.Year > 1) {
    const y1 = x => (typeof x === 'string' ? withYear(x, 1) : x);
    S.Journal = (S.Journal || []).map(y1);
    S._Kept_from_earlier = (S._Kept_from_earlier || []).map(y1);   // 1.62.0
    if (Array.isArray(S.$eng.jq)) S.$eng.jq = S.$eng.jq.map(y1);       // 1.63.0
    if (Array.isArray(S.$ui.archive)) S.$ui.archive = S.$ui.archive.map(y1);
    if (Array.isArray(S.$ui.jnotes)) S.$ui.jnotes = S.$ui.jnotes.map(y1);   // 1.57.0: the engine's notes are dated like the Journal
    for (const b of Object.values(S.Bonds || {})) {
      b.Last_seen = y1(b.Last_seen);
      for (const f of ['Knows', '$Knows_old']) if (Array.isArray(b[f])) b[f] = b[f].map(y1);
      for (const f of ['$Recent', '$Defining']) if (Array.isArray(b[f])) b[f] = b[f].map(r => (r && typeof r === 'object' ? { ...r, w: y1(r.w) } : r));
      if (Array.isArray(b.Imprints)) b.Imprints = b.Imprints.map(x => (x && typeof x === 'object' ? { ...x, When: y1(x.When) } : x));
    }
    for (const v of Object.values((S.Campus_State || {}).Events || {})) if (v && typeof v === 'object') v.Updated = y1(v.Updated);
  }
  if (log.length) S._Log = [...(S._Log || []), ...log.map(l => `[${stamp(S.World)}] ${l}`)].slice(-12);
}

// ---- 11. 1.48.0 (audit 3.11): <now>'s lines that apply engine rules, made here so the rules live once and are tested in Node: the
// outside area (the place, walks, fares, every engine event), presence and {{user}}'s class (whereabouts, 1.47.0), the campus walks,
// ambience, moods, and for each present character their bond (what they share at this rank and Trust), Trust, Tension, recent
// moments and how they take teasing. The code is <now>'s own (1.47.0 505), run on the state the engine leaves: it reads it through a
// getvar of its own. $ui.now: { area, pres, walk, amb, people, rules }; <now> prints each in its place, the Cast Sheet prints people[id].
const NOW_D = {"BOND":{"share":[[0,"how they look and their public role"],[1,"their name, age, club and where they spend time"],[2,"the magic and skills they use openly"],[3,"likes, dislikes, hobbies and birthday"],[4,"their personality and what shows when they are upset"],[5,"their goals"],[6,"what they think of other people and of the Doves"],[7,"their past and family"]],"real":5,"perks":{"1":"greets {{user}} and can be found at their usual places","2":"may accept a genuine invitation; first accepted invited hangout each week grants one extra bond XP","3":"sometimes seeks {{user}} out; remembers the birthday","4":"may actively help with their listed mana, stamina or study activities; ordinary shared work gets a modest bonus","5":"shares their goal and may ask for help with it","6":"may introduce {{user}} to a new roster NPC, whose bond starts at Rank 1","7":"may escort {{user}} into their dorm, or receive an unscheduled worksite visit if staff","8":"closest bond: best friend, romance or sworn rival, as far as this character and lived story allow","9":"may publicly vouch for {{user}} once per month, softening one related reputation loss by up to 5 XP","10":"would sacrifice for {{user}}"},"off":{"Trixie":2,"Etnie":2,"Percival":2,"Ruby":2,"Bobby":2,"Althair":2,"Layla":2,"Saffi":2,"Vera":2,"Tilly":2,"Dante":2,"Vallie":2,"Caralynn":2,"Aiden":2,"Florian":2,"Linus":2,"Hadrian":2,"Tsubaki":2,"Hester":2,"Dorian":2,"Kotaro":2,"Aurelian":2,"William":2,"Bianca":2,"Rigel":2,"Topaz":2,"Faye":2,"Irene":-1,"Idris":-1,"Zara":-1,"Lenna":-1,"Castor":-1,"Sophia":-1,"Yvette":-1,"Gavlan":-1,"Rei":-1,"Tristan":-1,"Baelin":-1,"Kanae":-1,"Anya":-1,"Krieg":-2,"Ottavio":-2,"Mimosa":-2,"Caine":-2,"Ines":-2},"recent_now":3,"tag":{"Trixie":"open","Etnie":"open","Percival":"open","Ruby":"open","Bobby":"open","Althair":"open","Layla":"open","Saffi":"open","Vera":"open","Tilly":"open","Dante":"open","Vallie":"open","Caralynn":"open","Aiden":"open","Florian":"open","Linus":"open","Hadrian":"open","Tsubaki":"open","Hester":"open","Dorian":"open","Kotaro":"open","Aurelian":"open","William":"open","Bianca":"open","Rigel":"open","Topaz":"open","Faye":"open","Irene":"guarded","Idris":"guarded","Zara":"guarded","Lenna":"guarded","Castor":"guarded","Sophia":"guarded","Yvette":"guarded","Gavlan":"guarded","Rei":"guarded","Tristan":"guarded","Baelin":"guarded","Kanae":"guarded","Anya":"guarded","Krieg":"closed","Ottavio":"closed","Mimosa":"closed","Caine":"closed","Ines":"closed"}},"TRUST":{"bands":[[0,"Betrayed"],[15,"Doubtful"],[35,"Neutral"],[65,"Trusting"],[85,"Confidant"]],"share":{"Betrayed":null,"Doubtful":-1,"Neutral":0,"Trusting":1,"Confidant":2},"early":1,"gates":{"6":35,"7":50,"8":50,"9":65,"10":65},"susp":35,"cats":{"open":{"name":"Open","bands":{"Doubtful":"still friendly on the surface, but checks what {{user}} says against others and no longer shares anything important","Betrayed":"openly hurt and bewildered; tells friends what {{user}} did, because they cannot understand it","Confidant":"tells {{user}} everything, often too much; takes {{user}}'s word over anyone's"},"never":"holding a grudge in secret or plotting against {{user}}"},"normal":{"name":"Normal","bands":{"Doubtful":"polite but careful: keeps plans vague, asks for things in writing, does not lend or cover","Betrayed":"cold and formal; answers only what they must and keeps their distance","Confidant":"relies on {{user}} and says so; asks {{user}}'s opinion before anyone else's"},"never":"pretending nothing happened"},"guarded":{"name":"Guarded","bands":{"Doubtful":"says nothing personal; watches {{user}}'s hands, not {{user}}'s face; tests {{user}} with small things","Betrayed":"closes completely: {{user}} becomes one more person they were right not to trust","Confidant":"lets the guard down only with {{user}}: a rare, quiet honesty that others never see"},"never":"giving a second chance cheaply"},"closed":{"name":"Closed","bands":{"Doubtful":"assumes {{user}} wants something; every kindness is weighed for its price","Betrayed":"files {{user}} as a threat and acts on it, within their position and nature","Confidant":"treats {{user}} as the one exception to a lifelong rule; would deny it if asked"},"never":"saying out loud that they trust {{user}}"}},"npcs":{"Trixie":"open","Etnie":"open","Percival":"open","Ruby":"open","Bobby":"open","Althair":"open","Layla":"open","Saffi":"open","Vera":"open","Tilly":"open","Dante":"open","Vallie":"open","Caralynn":"open","Aiden":"open","Florian":"open","Linus":"open","Hadrian":"open","Tsubaki":"open","Hester":"open","Dorian":"open","Kotaro":"open","Aurelian":"open","William":"open","Bianca":"open","Rigel":"open","Topaz":"open","Faye":"open","Irene":"guarded","Idris":"guarded","Zara":"guarded","Lenna":"guarded","Castor":"guarded","Sophia":"guarded","Yvette":"guarded","Gavlan":"guarded","Rei":"guarded","Tristan":"guarded","Baelin":"guarded","Kanae":"guarded","Anya":"guarded","Krieg":"closed","Ottavio":"closed","Mimosa":"closed","Caine":"closed","Ines":"closed"},"overrides":{"Etnie":{"text":"Etnie cannot stop trusting her \"little sibling\": her Trust never falls below 50 and her perks never wait on it; a betrayal wounds her instead (the engine turns the rest of the drop into Tension).","no_gates":true},"Kanae":{"text":"Kanae's trust feeds on {{user}} pulling away from others for her: when {{user}} turns someone down or distances themselves from a friend for her, report {\"With\": \"Kanae\", \"Kind\": \"choose\"}. While her Plan is hidden she never counts {{user}} as a betrayer.","until_secret":true},"Althair":{"text":"Althair trusts no one and needs no one's trust: his Trust stays 50 and his perks never wait on it; betraying him only entertains him (the engine turns it into bond XP).","no_gates":true},"Caine":{"text":"Caine despises mages, {{user}} included: his Trust cannot pass 64 until his own secret has come out and {{user}} still treats him the same.","until_secret":true},"Topaz":{"text":"Topaz's trust grows when {{user}} takes her seriously: accepting her challenge and giving it their all → report {\"With\": \"Topaz\", \"Kind\": \"challenge\"}. Losing to {{user}} never lowers it; letting her win on purpose, once she notices, is a betrayal."}},"dorm_head":{"Ottavio":{"dorm":"Sky","category":"open","text":"{{user}} is one of Ottavio's Sky students: he forgives them faster, trusts them sooner, and it shows."}}},"SUNREACH":{"carriage":6,"boat":8,"tour":15,"bet_max":200,"names":{"Lucius":["Lucius Vortigern","Myrdath"],"Ines":["Ines Vauclair","Myrdath"],"Bram":["Bram Holloway","Myrdath"],"Dex":["Dex Harlow","Myrdath"],"Elion":["Elion Villeneuve","Ashvale"],"Kira":["Kira Brannock","Ashvale"],"Mirelle":["Mirelle Lullwyn","Ashvale"],"Theodore":["Theodore Wrenfield","Ashvale"],"Bellatrix":["Bellatrix Ardenne","Veyra"],"Cassius":["Cassius Rhavel","Veyra"],"Morgana":["Morgana Vess","Veyra"],"Pip":["Pip Althorne","Veyra"],"Irene":["Irene Chanare","Halvard"],"Caspian":["Caspian Riwalo","Halvard"],"Etnie":["Etnie","Halvard"],"Royhan":["Royhan Filanoman","Halvard"],"Lenna":["Lenna Greenwind","Halvard"],"Saffi":["Saffi Tamberlane","Halvard"],"Kanae":["Kanae Quveno","Halvard"],"Idris":["Idris Ainsworth","Halvard"],"Aiden":["Aiden Ruzzo","Halvard"],"Caralynn":["Caralynn Veyturone","Halvard"],"Zara":["Zara Minallone","Halvard"],"Percival":["Percival Applethorne","Halvard"],"Sophia":["Sophia Helfin","Halvard"],"Gareth":["Gareth Valkaryn","Halvard"],"Trixie":["Trixie Confetti","Halvard"],"Vera":["Vera Pulsar","Halvard"],"Dante":["Dante Kleinn","Halvard"],"Castor":["Castor Moretti","Halvard"],"Ruby":["Ruby Bonbon","Halvard"],"Florian":["Florian Villeneuve","Halvard"],"Alyssa":["Alyssa Edelweiss","Halvard"],"Tilly":["Tilly Marsh","Halvard"],"Linus":["Linus Tallyworth","Halvard"],"Maple":["Maple Fernhollow","Halvard"],"Nerys":["Nerys Silvarenne","Halvard"],"Hadrian":["Hadrian Quelloris","Halvard"],"Wren":["Wren Marlowe","Halvard"],"Tsubaki":["Tsubaki Hoshikage","Halvard"],"Aurelian":["Aurelian Solmere","Halvard"],"William":["William Beckett","Halvard"],"Bruno":["Bruno Ferrante","Halvard"],"Bianca":["Bianca Ferrante","Halvard"],"Rigel":["Rigel Ardenne","Halvard"],"Topaz":["Topaz Vasquelle","Halvard"],"Faye":["Faye Driftwell","Halvard"]}},"TENSION":{"bands":[[0,"Calm"],[20,"Friction"],[40,"Strained"],[70,"Hostile"],[90,"Enemy"]],"categories":{"withdrawn":{"name":"Withdrawn","bands":{"Friction":"quieter than usual around {{user}}; answers short, smiles late","Strained":"avoids {{user}}: leaves when {{user}} arrives, declines invitations politely, confides in someone else","Hostile":"openly hurt: cries or goes silent, asks {{user}} to leave them alone; their friends notice and cool toward {{user}}","Enemy":"cuts {{user}} out entirely (seats, study groups, even routes across campus) and grieves the friendship; does not retaliate"},"never":"revenge, rumours or any harm","eases":"forgives easily: a sincere apology eases it a lot","decay":2,"apology":{"private":-20,"public":-20},"kind_ease":{"help":-5,"keep":-5,"defend":-5},"banter":"light teasing is fine; mockery of what they care about, or rough play, hurts"},"social":{"name":"Social","bands":{"Friction":"barbed compliments and pointed jokes at {{user}}'s expense","Strained":"snubs {{user}} in public; leaves {{user}} out of plans and the good gossip","Hostile":"works the room against {{user}}: rumours, mockery, turning mutual friends","Enemy":"runs a campaign: humiliates {{user}} in front of a crowd and makes sure the story spreads"},"never":"physical violence, or anything that would ruin their own image if it came out","eases":"pride first: a public apology counts, a private one barely","decay":0.5,"enemy_rep":{"Student":-5},"apology":{"private":-5,"public":-15},"kind_ease":{"defend_public":-5},"banter":"enjoys witty banter in private; being mocked in public is an offence"},"confrontational":{"name":"Confrontational","bands":{"Friction":"blunt and challenging: calls {{user}} out, dares {{user}} to prove it","Strained":"picks arguments; demands a spar or a contest to settle it","Hostile":"open rivalry: goes after {{user}} in class, in training, in competitions","Enemy":"a formal challenge or a grudge match in front of witnesses; will not let it rest until it is settled"},"never":"an ambush, secret sabotage, or trying to kill","eases":"words are cheap: a fight settles it (every spar, duel or contest with them, whoever wins; report it as a fight interaction); an apology barely counts","decay":0.34,"apology":{"private":-5,"public":-5},"kind_ease":{},"banter":"loves it, shoves included: people who hit back are the best kind"},"authority":{"name":"Authority","bands":{"Friction":"cooler and more formal with {{user}}; watches for mistakes","Strained":"holds {{user}} strictly to the rules: marks down, refuses favours, catches every lateness","Hostile":"uses the office: detention, reports to the Dorm Head, requests denied, a word with other staff","Enemy":"formal action: a disciplinary hearing, a letter home, pushing for probation"},"never":"anything outside their authority: no personal violence, no lies on the record","eases":"an apology is accepted formally; visible good conduct and hard work count more","decay":1,"apology":{"private":-10,"public":-10},"kind_ease":{"help":-3,"keep":-3,"defend":-3},"banter":"tolerates light teasing from those they trust (Trust 65+); horseplay and mockery are offences"},"dangerous":{"name":"Dangerous","bands":{"Friction":"polite and attentive: remembers {{user}}'s name and asks one question too many","Strained":"watches {{user}}: questions friends, checks {{user}}'s record, leaves small reminders of their reach","Hostile":"moves against {{user}} quietly: leverage, pressure on the people around {{user}}, an investigation opened","Enemy":"strikes with everything their position allows"},"never":"anything that would bring down their own position; no random cruelty","eases":"holds a grudge: an apology changes nothing; only a real service, a bargain, or something they need","decay":0,"apology":{"private":0,"public":0},"kind_ease":{},"banter":"nobody teases them; it is an offence unless they started it"}},"npcs":{"Ruby":"withdrawn","Zara":"withdrawn","Mimosa":"withdrawn","Royhan":"withdrawn","Alyssa":"withdrawn","Vera":"withdrawn","Trixie":"withdrawn","Tilly":"withdrawn","Lenna":"withdrawn","Caralynn":"social","Florian":"social","Aiden":"social","Idris":"social","Bobby":"social","Milena":"social","Sophia":"confrontational","Percival":"confrontational","Saffi":"confrontational","Vallie":"confrontational","Irene":"authority","Caspian":"authority","Baelin":"authority","Yvette":"authority","Gavlan":"authority","Layla":"authority","Kuroo":"authority","Ottavio":"authority","Rei":"authority","Krieg":"dangerous","Caine":"dangerous","Tristan":"dangerous","Castor":"dangerous","Dante":"dangerous","Gareth":"dangerous","Linus":"social","Maple":"withdrawn","Nerys":"social","Hadrian":"social","Wren":"withdrawn","Tsubaki":"confrontational","Hester":"authority","Anselm":"authority","Magnus":"authority","Dorian":"social","Cedric":"authority","Anya":"authority","Kotaro":"withdrawn","Valentin":"dangerous","Aurelian":"social","William":"social","Bruno":"confrontational","Bianca":"social","Rigel":"social","Topaz":"social","Faye":"social"},"peaks":{"Krieg":"a Dovecote examination or an arrest on a pretext","Caine":"every door the Noble Houses control closes to {{user}}, and {{user}} is quietly noted for the Choir","Tristan":"a binding oath or a debt in his registry is called due","Castor":"misfortune follows {{user}}: a curse worked through something taken from them, never traced to him","Dante":"judges {{user}} a wrongdoer: the warmth goes out for good; he gathers proof for the Doves and is merciless once he has it","Gareth":"files it away behind the smile: {{user}}'s standing is sabotaged (a ruined casting, a lost place), never traceable, while he stays warm to {{user}}'s face","Valentin":"{{user}}'s name comes off his board for good, and every door he can close in potion-making closes: suppliers, recommendations, a word in the right ear at court"},"overrides":{"Etnie":{"name":"Devoted","bands":{"Friction":"clingier and anxious, checking {{user}}'s mood every few minutes","Strained":"follows {{user}}'s scent everywhere; jealous of anyone near {{user}}","Hostile":"breaks down: clones appear when she panics; she begs rather than argues","Enemy":"a crisis like the one after the breach: she stops eating and attending class; Kuroo steps in"},"never":"harming {{user}} or leaving {{user}}","eases":"one warm moment with {{user}} eases it a lot","decay":2,"apology":{"private":-25,"public":-25},"kind_ease":{"help":-5,"keep":-5,"defend":-5},"banter":"any attention from {{user}} is a gift, teasing included"},"Kanae":{"name":"Devoted (mask)","exempt":true,"bands":{"Friction":"sweeter than ever, the smile held a beat too long; she blames whoever came between them, never {{user}}","Strained":"clings through kindness: small gifts, and readings that warn {{user}} about the people involved","Hostile":"turns her displeasure on the people around {{user}}: rumours about them, rigged readings, quiet damage to their friendships with {{user}}","Enemy":"her plan to isolate {{user}} moves openly: {{user}}'s other bonds are poisoned one by one while she stays the one who never leaves"},"never":"turning on {{user}}; her affection for {{user}} never lessens","eases":"{{user}}'s attention eases it quickly","decay":2,"apology":{"private":-20,"public":-20},"kind_ease":{"help":-5,"keep":-5,"defend":-5},"banter":"sweet about it, but notes who else {{user}} jokes with"},"Althair":{"name":"Delighted","lock":true,"convert":0.5,"daily_cap":10,"text":"Althair enjoys being disliked: hostility from {{user}} delights him and draws him closer. His Tension stays 0; the engine turns every rise into bond XP. React in character: beaming, curious, friendlier the ruder {{user}} is.","kind_ease":{},"banter":"delighted: the ruder, the better"},"Ezrel":{"name":"Apathetic","rise_mult":0.5,"bands":{"Friction":"does not care, pleasantly","Strained":"does not care, pleasantly; does the minimum for {{user}}","Hostile":"does not care, pleasantly; stops going out of his way for {{user}}","Enemy":"stops helping {{user}} at all, pleasantly and completely"},"never":"drama, raised voices or revenge","eases":"only time; apologies change nothing","decay":1,"apology":{"private":0,"public":0},"kind_ease":{},"banter":"does not notice"},"Rigel":{"name":"Forgiving, for a price","bands":{"Friction":"forgives {{user}} warmly on the spot, then asks, just as warmly, when they will pay the Ardenne price","Strained":"keeps forgiving and keeps reminding; writes the debt in his ledger in front of {{user}} and offers an Oath to settle it","Hostile":"hurt and baffled that a friend will not pay; very polite, stops buying for {{user}}, and writes home about it","Enemy":"strikes {{user}} from the ledger; perfectly courteous in public, and tells Bella, who remembers at the Kingdom Competition"},"never":"taking the price himself, or hurting {{user}} with his own hands","eases":"a kept promise or a sincere Oath eases it a lot; a paid price would end it at once, and nobody pays","decay":1,"apology":{"private":-5,"public":-5},"kind_ease":{"defend_public":-5},"banter":"teasing delights him; he rarely notices it is teasing and answers literally"},"Topaz":{"name":"Rival (clingy)","bands":{"Friction":"challenges {{user}} more often and sulks between challenges; turns up anyway","Strained":"follows {{user}} everywhere \"to study them\"; loudly challenges anyone else who takes their time","Hostile":"a formal written challenge; if {{user}} refuses, she shadows them for days, silent and hurt, and trains until the Medical Centre sends her to bed","Enemy":"announces in front of everyone that {{user}} is no longer her rival, then still appears wherever they are, pretending not to look"},"never":"cheating, sabotage, or truly leaving {{user}}","eases":"{{user}} accepting a challenge, or calling her their rival, eases it a lot","decay":2,"apology":{"private":-20,"public":-25},"kind_ease":{"defend_public":-5},"banter":"teasing is a challenge accepted; she fires straight back, red-eared"}},"apology_npc":{"Sophia":{"private":10,"public":10,"note":"an apology only makes her angrier: she despises cowards; only a fight settles it"}}},"WENDIGO":{"line":"The Wendigo (Grade I): a gaunt humanoid about three metres tall, grey-white skin tight over bone, a deer's skull for a head with antlers and a dim light in the sockets, long clawed fingers; the air turns cold, frost forms where it stands, it smells of rot and speaks in voices it has heard. It stalks first and calls in borrowed voices, then tests the intruders and drives them out; it does not follow anyone out of the Gloaming. Every spell of a kind that has already hit it this fight does a fifth less than the one before (100%, 80%, 60%, 40%, then 20%, never less); a new kind starts at full; weapons do not make it adapt, but its hide is Grade I hard. Students cannot beat it: running, hiding and the flare are the sane choices."},"AVALON":{"fare":10,"rivals":{"Bellatrix":["Bellatrix Ardenne","Veyra",1],"Bram":["Bram Holloway","Myrdath",1],"Cassius":["Cassius Rhavel","Veyra",3],"Dex":["Dex Harlow","Myrdath",2],"Elion":["Elion Villeneuve","Ashvale",1],"Ines":["Ines Vauclair","Myrdath",3],"Kira":["Kira Brannock","Ashvale",2],"Lucius":["Lucius Vortigern","Myrdath",2],"Mirelle":["Mirelle Lullwyn","Ashvale",3],"Morgana":["Morgana Vess","Veyra",2],"Pip":["Pip Althorne","Veyra",1],"Theodore":["Theodore Wrenfield","Ashvale",3]}}};   // tools/common.py now_data: BOND, TRUST, TENSION (bands and texts), WENDIGO, AVALON, SUNREACH
const fxWords = fx => { const s = String(fx || ''), w = []; if (/Rank \d+ → /.test(s)) w.push('grew closer'); else if (/Rank fell/.test(s)) w.push('drifted apart'); if (/Trust −/.test(s)) w.push('trust shaken'); else if (/Trust \+/.test(s)) w.push('trust grew'); if (/Tension \+/.test(s)) w.push('tension rose'); else if (/Tension −/.test(s)) w.push('tension eased'); if (/romance/.test(s)) w.push('romance began'); return w.join(', '); };   // 1.56.0 (U2): a moment's effect in words, never numbers
const ageOf = (w, W) => { const m = /(?:Y(\d+) )?M(\d{1,2}) W([1-4])(?: (Mon|Tue|Wed|Thu|Fri|Sat|Sun))?/.exec(String(w || '')); if (!m || !W || !W.Month) return ''; const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], di = Math.max(0, D.indexOf(W.Day)), Y = Math.max(1, Number(W.Year) || 1), yl = m[1] ? Math.max(1, +m[1]) : Y; const far = n => (n < 2 ? 'over a year ago' : 'over ' + n + ' years ago'); if (!m[4]) { let k = ((Y - 1) * 48 + (W.Month - 1) * 4 + W.Week - 1) - ((yl - 1) * 48 + (+m[2] - 1) * 4 + +m[3] - 1); if (k < 0) { if (m[1]) return ''; k += 48; } if (k >= 48) return far(Math.floor(k / 48)); return k === 0 ? 'this week' : k === 1 ? 'last week' : k < 4 ? k + ' weeks ago' : k < 8 ? 'last month' : Math.floor(k / 4) + ' months ago'; } let d = ((Y - 1) * 336 + (W.Month - 1) * 28 + (W.Week - 1) * 7 + di) - ((yl - 1) * 336 + (+m[2] - 1) * 28 + (+m[3] - 1) * 7 + D.indexOf(m[4])); if (d < 0) { if (m[1]) return ''; d += 336; } if (d >= 336) return far(Math.floor(d / 336)); return d === 0 ? 'earlier today' : d === 1 ? 'yesterday' : d < 7 ? d + ' days ago' : d < 14 ? 'last week' : d < 28 ? Math.floor(d / 7) + ' weeks ago' : d < 56 ? 'last month' : Math.floor(d / 28) + ' months ago'; };
function nowOf(S, moodsFull) {
  const getvar = k => _.get({ stat_data: S }, k);
  const W = getvar('stat_data.World') || {}, PR = getvar('stat_data.Player.Profile') || {};
  const UI = moodsFull ? { ...(getvar('stat_data.$ui') || {}), moods: moodsFull } : getvar('stat_data.$ui') || {};   // the moods with their reasons (stepWeather)
  const on = id => uiOn(UI, id);
  const WX = on('weather') && UI.wx && !UI.wx.away && UI.wx.now ? UI.wx : null;
  const Y = Math.max(1, Number(W.Year) || 1);
  const cur = String(W._Curfew || '');
  const PRES = Object.keys(getvar('stat_data.Scene.Present') || {});
  const aged = w => { const a = ageOf(w, W); return a ? w + ', ' + a : w; };
  const V = presenceNow(S), HERE = { ...presenceAt(PRESENCE, V, W.Location), cls: classLineAt(PRESENCE, V, W.Location) };
  // 1.56.0 (narrator-load audit U2): each present character's lines are one block, printed in their Cast Sheet ("Now with {{user}}"),
  // with band words instead of numbers (the numbers are in <current_state> only); people[id] = [lines]
  const people = {}, put = (id, l) => { if (l) (people[id] = people[id] || []).push(l); };
  if (on('weather')) for (const id of PRES.filter(id => (UI.moods || {})[id])) { const m = UI.moods[id]; put(id, 'Mood: ' + m.mood.toLowerCase() + ((m.reasons || []).length ? ' (' + m.reasons.join(', ') + ')' : '') + '.'
    + (m.days || []).map(d => ` ${d.label} (${d.tone}): ${d.how}`).join('')); }   // 1.72.0: special days
  if (WX && PRES.includes('Idris')) { if (/cold|freezing/.test(WX.now.label)) put('Idris', 'Cold-blooded: sluggish and short-tempered in this cold.'); else if (WX.now.sky === 'Clear' && WX.block !== 2 && WX.now.temp >= 15) put('Idris', 'Cold-blooded and loves the sun: he is soaking it up, livelier than usual.'); }
  // 1.57.0 (U3): at a notable place, whether {{user}} has been here before (and with whom), so a second visit never reads as a first
  const here0 = plName(placeOf(W.Location) || '') || '', fv = ((S.$eng || {}).first || {})[here0];
  const visit = !NOTABLE.has(here0) ? '' : fv ? (fv[0] === dstamp(W) ? 'First visit: {{user}} came to ' + here0 + ' for the first time today' + (fv[1].length ? ', with ' + fv[1].join(', ') : '') + '.' : '{{user}} has been to ' + here0 + ' before (first on ' + fv[0] + (fv[1].length ? ', with ' + fv[1].join(', ') : '') + ').')
    : (UI.discovered || []).includes(here0) ? '{{user}} has been to ' + here0 + ' before.' : '';
  const AREAS = UI.area || {}, WENDIGO = NOW_D.WENDIGO, AVD = NOW_D.AVALON, SRD = NOW_D.SUNREACH;
  const AREA = ['forest', 'avalon', 'airship', 'sunreach'].map(k => AREAS[k] && AREAS[k].on ? Object.assign({ key: k }, AREAS[k]) : null).find(Boolean) || null;
  const SOON = AREAS.airship && !AREAS.airship.on ? AREAS.airship.soon : null;
  const srWho = id => { const r = (SRD.names || {})[id]; return r ? r[0] + ' (' + r[1] + ')' : id; };
  const avRival = id => { const r = (AVD.rivals || {})[id]; return r ? r[0] + ' (' + r[1] + ', Year ' + Math.min(3, r[2] + Y - 1) + ')' : id; };
  // how {{user}} gets about in each area, the minutes the clock still owes, and every engine event's line for the narrator
  const AREA_WALK = {
    forest: ['Walks from here (hours on foot, shortest route): ', '', ' Advance the clock by the whole walk.', 'Still on the road: %s h of the last walk are not on the clock yet; searching here starts after that.'],
    avalon: ['Walks from here (minutes on foot; a hire carriage takes half and costs ' + AVD.fare + ' coin: set Avalon.Ride true in the same update): ', ' In this quarter: ', ' Advance the clock by the whole walk.', 'Still on the way: %s min of the last walk are not on the clock yet.'],
    sunreach: ['Walks from here (minutes on foot; a horse carriage for ' + SRD.carriage + ' coin, or a water taxi for ' + SRD.boat + ' coin between the shore parts, takes half: set Sunreach.Ride "carriage" or "boat" in the same update; the Open Sea only by tour boat from the Sea Dock, ' + SRD.tour + ' coin each way): ', ' Here too: ', '', 'Still on the way: %s min of the last move are not on the clock yet.'],
  };
  const AREA_EV = (A, e) => ({
    target: () => 'The target is here (engine): the ' + e.b + ' shows itself this reply, first as fresh signs, then the beast. Play the encounter in full; the catch is not certain.',
    sign: () => 'Signs (engine): tracks, a kill or droppings of the ' + e.b + ' lead toward ' + e.toName + '. Write them as signs; the beast does not appear.',
    beast: () => 'Encounter (engine): a ' + e.b + ' (Grade ' + e.g + ') crosses the path of the group this reply. Not the target. ' + (e.g === 'II' && A.grade !== 'II' ? 'It is beyond first- and second-years: running, hiding and the flare are sane choices.' : 'Play it in character; it may be avoided.'),
    protected: () => 'Seen (engine): a ' + e.b + ', a protected beast; harming one is a crime the Doves investigate.',
    wendigo: () => 'The Wendigo (engine) is here this reply. ' + WENDIGO.line,
    caught: () => 'Catch recorded (engine): the ' + A.tgt + ' counts.',
    failed: () => 'The hunt is over (engine): the group did not bring back its ' + A.tgt + '; the practical is failed.',
    white: () => 'The White Line (engine): the Royal Guard turns {{user}} back from ' + e.to + (e.n > 1 ? '; a second try, so they report it to the Halvard staff.' : ', politely and firmly.'),
    pick: () => e.caught ? 'Pickpocket (engine): a hand slips into a pocket of {{user}}, and {{user}} catches it this reply; the thief bolts into the crowd.' : e.lost ? 'Pickpocket (engine): ' + e.lost + ' coin gone from the purse of {{user}}; nobody noticed the hand, and {{user}} finds out later.' : 'Pickpocket (engine): a thief tries the pockets of {{user}} and finds nothing worth taking.',
    hustle: () => e.caught ? 'A hustler (engine) tries a trick on {{user}}, and {{user}} sees through it this reply.' : e.lost ? 'A hustler (engine): ' + e.lost + ' coin gone from {{user}}, by a trick or a quick hand; {{user}} finds out later.' : 'A hustler (engine) tries {{user}} and finds nothing worth taking.',
    procession: () => 'Passing by (engine): ' + e.t + '.',
    street: () => 'In the street (engine, colour only): ' + e.t + '.',
    rival: () => A.key === 'avalon' ? 'Another academy (engine): ' + avRival(e.id) + ' crosses the path of the group here. Play them from their lore entry.' : 'Another academy (engine): ' + srWho(e.id) + ' is here on their own Trip and crosses the path of the group. Play them from their lore entry, in character.',
    tsubaki: () => e.first ? 'Tsubaki Hoshikage (engine), the youngest Royal Mage, has lost her ranks after the parade and is lost in the city; the group runs into her here. She is not a Halvard student yet (the Royal Mages entry).' : 'Tsubaki Hoshikage (engine) marched with the Royal Mages and cannot find her way back to the Halvard group; the group runs into her here, lost as ever.',
    scout: () => 'A talent scout (engine) from a noble house or a hunting company asks {{user}} for a word about the matches.',
    raid: () => e.caught ? 'Raid (engine): the City Watch storms the Rookery and catches {{user}}; Halvard staff are sent for.' : 'Raid (engine): the City Watch storms the Rookery; the rooks hear it coming and {{user}} gets out in the rush.',
    sky: () => 'In the sky (engine): ' + e.t + '.', stage: () => 'On the stage (engine): ' + e.t + '.', hold: () => 'In the hold (engine): ' + e.t + '.',
    bet: () => 'The bet (engine): ' + e.stake + ' coin on ' + e.game + ', and {{user}} ' + (e.win ? 'won ' + e.net + ' coin.' : 'lost it.'),
    student: () => 'Halvard (engine): ' + srWho(e.id) + ' is here with their own group and runs into {{user}}. Play them in character.',
    sea: () => 'At sea (engine): ' + e.t + '.',
    leviathan: () => 'THE LEVIATHAN (engine): ' + e.t + '. A sight for a lifetime, seen only from far off; nobody fights it.',
  }[e.k] || (() => ''))();
  const BOND = NOW_D.BOND, TRUST = NOW_D.TRUST, TEN = NOW_D.TENSION;
  const BONDS = getvar('stat_data.Bonds') || {};
  const CLOSE = UI.close || [];   // 1.5.0 (N3a): bonds with XP at 80% or more of the next rank (engine)
  // 1.4.3 Trust shifts what they share (Doubtful -1, Trusting +1, Confidant +2 and the real tiers one rank early; Betrayed: nothing
  // new) and holds back the perks that need it (data/trust.json perk_gates)
  const SECR = [...(UI.secrets || []), ...((getvar('stat_data.Campus_State') || {}).Secrets_revealed || [])].map(x => String(x).toLowerCase());
  const trBand = x => bandOf(TRUST.bands, x);
  const trOver = id => { const o = (TRUST.overrides || {})[id]; return o && !(o.until_secret && SECR.some(x => x.startsWith(id.toLowerCase() + '.'))) ? o : null; };
  PRES.filter(id => BONDS[id] && BOND.share).forEach(id => {
    const r = Math.max(0, Math.min(10, Number(BONDS[id].Rank) || 0)), tr = Math.max(0, Math.min(100, Number(BONDS[id].Trust) || 0)), tb = trBand(tr);
    const sh = (TRUST.share || {})[tb], early = tb === 'Confidant' ? TRUST.early || 0 : 0, o = (BOND.off[id] || 0) + (sh || 0);
    const ok = BOND.share.filter(([t]) => (t < BOND.real ? t <= Math.max(0, r + o) : t <= r + early));
    const next = BOND.share.find(([t]) => !ok.some(x => x[0] === t));
    const og = trOver(id), gated = og && og.no_gates ? [] : Object.entries(TRUST.gates || {}).filter(([g, need]) => +g <= r && +g !== 8 && tr < need && BOND.perks[g]).map(([g, need]) => BOND.perks[g] + ' (needs Trust ' + need + ')');
    const susp = (UI.tsusp || []).filter(k => ((getvar('stat_data._Perks') || {})[k] || {}).From === id);
    const top = ok.length ? ok[ok.length - 1][1] + (ok.length > 1 ? ' and everything before' : '') : '';
    put(id, 'Bond (' + [BOND.tag[id], tb.toLowerCase(), CLOSE.includes(id) && 'close'].filter(Boolean).join(', ') + '): '
      + (sh === null ? 'shares nothing new with {{user}}; keeps to what {{user}} already knows' : 'shares ' + (top || 'nothing personal yet')
      + (next ? '. Not yet: ' + next[1] + ' and beyond' : ''))
      + (r > 0 && BOND.perks[String(r)] ? '. At this rank: ' + BOND.perks[String(r)] : '')
      + (gated.length ? '. Held back by low Trust: ' + gated.join('; ') : '') + (susp.length ? '. Suspended until Trust ' + TRUST.susp + ': ' + susp.join(', ') : '') + '.');
  });
  // 1.4.3 how each present character carries their Trust: a personal rule (always), else only the telling bands
  PRES.filter(id => BONDS[id]).forEach(id => {
    const og = trOver(id), dh = (TRUST.dorm_head || {})[id];
    const mine = dh && PR.Dorm === dh.dorm, cat = mine ? dh.category : (TRUST.npcs || {})[id] || 'normal', C = (TRUST.cats || {})[cat];
    const tr = Math.max(0, Math.min(100, Number(BONDS[id].Trust) || 0)), tb = trBand(tr);
    const parts = [og && og.text, mine && dh.text, C && C.bands[tb] ? '(' + tb.toLowerCase() + '; ' + C.name.toLowerCase() + '): ' + C.bands[tb] + '. Never: ' + C.never + '.' : ''].filter(Boolean);
    if (parts.length) put(id, 'Trust' + (parts[0].startsWith('(') ? ' ' : ': ') + parts.join(' '));
  });
  PRES.filter(id => BONDS[id]).forEach(id => put(id, (() => {
    const o = (TEN.overrides || {})[id], P = o || (TEN.categories || {})[(TEN.npcs || {})[id]];
    if (!P) return '';
    if (o && o.lock) return 'Tension: ' + o.text;
    const t = Math.max(0, Math.min(100, Number(BONDS[id].Tension) || 0));
    if (t < 20) return '';
    const band = bandOf(TEN.bands, t);
    const peak = band === 'Enemy' && (TEN.peaks || {})[id] ? ' (' + TEN.peaks[id] + ')' : '';
    const an = (TEN.apology_npc || {})[id];
    return 'Tension (' + band.toLowerCase() + '): ' + P.bands[band] + peak + '. Never: ' + P.never + '. Eases: ' + (an && an.note ? an.note : P.eases) + '.';
  })()));
  PRES.filter(id => BONDS[id] && (BONDS[id].$Recent || []).length).forEach(id => put(id, 'Recent with {{user}} (newest first): ' + BONDS[id].$Recent.slice(-(BOND.recent_now || 3)).reverse()
    .map(r => { const f = fxWords(r.fx); return '[' + aged(r.w) + '] ' + r.n + (f ? ' (' + f + ')' : ''); }).join(' | ')));
  // 1.73.0: back after time apart (stepBondMemory, $apart) and what they may ask after (stepAgenda, $ui.asks)
  PRES.filter(id => BONDS[id] && Number(BONDS[id].$apart) > 0).forEach(id => { const n = Number(BONDS[id].$apart);
    put(id, 'Apart: last saw {{user}} ' + (n >= 14 ? Math.round(n / 7) + ' weeks' : n + ' days') + ' ago. The time apart is real to them; whether and how it shows is up to them, in character.'); });
  PRES.filter(id => (UI.asks || {})[id]).forEach(id => put(id, UI.asks[id]));
  // 1.74.0: ties. Someone {{user}} is close to (Rank TIES_RANK+ or a romance), seen through this character's own line to them
  // (REL_PAIRS: friends and rivals either way, dislike from them); the strongest two, dislike first
  const TIE_ORDER = ['dislike', 'rivals', 'friends'];
  PRES.filter(id => BONDS[id]).forEach(id => {
    const ties = {};
    for (const e of REL_PAIRS) {
      const y = e[0] === id ? e[1] : e[1] === id && e[2] !== 'dislike' ? e[0] : '';
      if (!y || y === id || !BONDS[y] || !(Number(BONDS[y].Rank) >= TIES_RANK || BONDS[y].Romance)) continue;
      if (!ties[y] || TIE_ORDER.indexOf(e[2]) < TIE_ORDER.indexOf(ties[y])) ties[y] = e[2];
    }
    const top = Object.entries(ties).sort((a, b) => TIE_ORDER.indexOf(a[1]) - TIE_ORDER.indexOf(b[1]) || a[0].localeCompare(b[0])).slice(0, 2);
    if (top.length) put(id, 'Ties: knows {{user}} is close to ' + top.map(([y, t]) => (t === 'dislike' ? y + ', whom they dislike' : t === 'rivals' ? 'their rival ' + y : 'their friend ' + y)).join(', and to ')
      + '. How that colours their view of {{user}} is up to them, in character.');
  });
  // 1.4.4 (owner): how each present character takes teasing and play-fighting (tension category or override: banter)
  PRES.filter(id => BONDS[id]).forEach(id => { const o = (TEN.overrides || {})[id], P = (o && o.banter) ? o : (TEN.categories || {})[(TEN.npcs || {})[id]]; if (P && P.banter) put(id, 'Teasing: ' + P.banter + '.'); });
  // 1.56.0 (U2): the bond cues that were separate <now> lines join the block (the rule never to announce ranks is said once, in 504)
  for (const x of (UI.rank_cues || []).filter(x => x && PRES.includes(x.id))) put(x.id, 'Has grown closer through this ordinary interaction: let one small change in conduct show when it fits.');
  for (const id of PRES.filter(id => BONDS[id] && BONDS[id].Rank >= 4 && RANK4_PARTNERS[id])) put(id, 'Can actively accompany: ' + RANK4_PARTNERS[id].join(', ') + ' (count it only when shared study or training actually happens).');
  for (const id of PRES.filter(id => BONDS[id] && BONDS[id].$gift_pending)) put(id, 'Their unique gift awaits a natural handover in the story. Once actually given, report /Interactions/- {"With":"' + id + '","Kind":"rank_gift"}; do not put it in the Bag beforehand.');
  // 1.75.0: what anyone near {{user}} can see (injuries, weather conditions, tiredness, lost sleep), one line so those present can
  // notice it; never hidden magic, a sustained technique or a pact (not on {{user}}'s body, and not always seen)
  const PV = getvar('stat_data.Player.Vitals') || {};
  const look = [...Object.entries(getvar('stat_data.Player.Injuries') || {}).map(([k, v]) => { const o = v || {}, bp = String(o.Body_part || '').trim();
    return k + ' (' + [o.Severity || 'minor', bp && !k.toLowerCase().includes(bp.toLowerCase()) ? bp : ''].filter(Boolean).join(', ') + ')'; }),
    ...Object.keys(getvar('stat_data.Player.Conditions') || {}).map(k => LOOK.cond[k]), LOOK.fatigue[PV._Fatigue], num((UI.sleep || {}).loss, 0) > 0 ? LOOK.sleep : ''].filter(Boolean);
  const NOW = { people, visit, ...(look.length ? { looks: 'How {{user}} looks (anyone near can see it; let someone present notice when it fits): ' + look.join('; ') + '.' } : {}) };
  let out;
  NOW.area = out = [];
  if (AREA) { const _A = AREA, _k = AREA.key, _M = AREA.muster, _l = AREA.left, _W = AREA_WALK[_k];
  if (_k === 'forest') {
  out.push("Grand Vast Forest (Creature Studies Expedition): {{user}} is at " + (_A.name) + ".");
  if (_A.tgt) {
  out.push("Target: " + (_A.tgt) + " (Grade " + (_A.grade) + ")" + (_A.res === 'caught' ? ', caught: the group has it; bring it back to Base Camp by Friday noon.' : _A.res === 'failed' ? ': the hunt is over and the group never found it; the practical is failed. Back to Base Camp by Friday noon, then home.' : _A.met ? ': it has shown itself; the catch is up to the group (set Expedition.Caught only if they actually catch or kill it).' : '. {{user}} knows its name, not where it lives. ' + _A.left + ' h of the hunt left (until Friday 08:00). Searched here: ' + _A.here + ' h, no sign of it here yet; do not bring it in.'));
  } else if (_A.hs) {
  out.push("Target: none yet; Vallie assigns each group its target at 08:00 on Thursday.");
  }
  } else if (_k === 'avalon') {
  out.push("Avalon" + (_A.crown ? ' (Independence Crowning Day)' : _A.kd ? ' (Kingdom Competition, with Halvard\'s team)' : '') + ": {{user}} is at " + (_A.name) + (_A.pinName !== _A.name ? ' (' + _A.pinName + ')' : '') + ". Bracelet points do not work here: coin only.");
  if (_M) {
  out.push("Crowning Day plan: parade 10:00 on Crown Avenue (the Royal Mages at its head), the King's speech 11:00 at Crown Square, free time in groups of four from 11:30, muster 15:30 at the Skyport, airship home 16:00. " + (_M.missed ? '{{user}} missed the muster: staff and the Doves are out looking for the group; the airship waits for them.' : _M.left > 0 ? 'Muster in ' + _M.left + ' min; the Skyport is ' + _M.back + ' min on foot from here' + (_M.cab !== _M.back ? ' (' + _M.cab + ' by carriage)' : '') + (_M.warn ? '. Time to head back.' : '.') : ''));
  } else if (_A.kd) {
  out.push("Kingdom Competition: matches 09:00-18:00 at the Royal Arena; free time in the city with the team until 21:00 (Lower City and Crown Square); curfew 22:00 at the Whitestone Hotel, Gavlan Haverton on watch." + (_A.pass ? ' The team won: the King receives them at Eldrasil Castle tonight, the only time students pass the White Line.' : ''));
  }
  } else if (_k === 'airship') {
  out.push("Aboard the airship (" + (_A.event) + "): {{user}} is in the " + (_A.name) + ". It lands at " + (_A.lands) + " at " + (_A.to) + " (in " + (_l >= 60 ? Math.floor(_l / 60) + 'h ' + (_l % 60) + 'm' : _l + ' min') + "); nobody leaves the ship before that.");
  out.push("The bar (Common Room): " + (_A.bar ? 'today students may drink (the rest day or a holiday); the stewards check the bracelet' : 'no alcohol for students today (only on the rest day and in the holidays); tea, juice and soda') + ". Meals at the canteen counter are in the fare; drinks and sweets cost coin.");
  if (_A.view) {
  out.push("View from the promenade now: " + (_A.view) + ".");
  }
  if (_A.cargo) {
  out.push("In the hold this flight: " + (_A.cargo) + ".");
  }
  } else {
  out.push("Sunreach Bay (the Academy Trip, " + (_A.night ? 'night: the whole city lit by rune-light until dawn' : 'day') + "): {{user}} is at " + (_A.name) + (_A.pinName !== _A.name ? ' (' + _A.pinName + ')' : '') + ". Bracelet points do not work here; coin only.");
  for (const _t of _A.today || []) {
  out.push("Today at " + (_t[0]) + ": " + (_t[1]) + ".");
  }
  if (_A.off) {
  out.push("Teachers' rule for the Trip: this is the city's night side, out of bounds for Halvard students. A reminder only; nothing follows unless the story brings a teacher.");
  }
  if (_A.at === 'golden_tide') {
  out.push("The tables: dice, cards and the wheel, " + (SRD.bet_max) + " coin at most a bet. When {{user}} bets, set Sunreach.Bet {\"Game\": \"dice\" | \"cards\" | \"wheel\", \"Stake\": coin} in that update and play up to the moment of the throw; the engine settles it and the next <now> says how it went. Never decide a bet yourself.");
  }
  }
  if (_W) {
  out.push((_W[0] + _A.walks.map(w => w[1] + ' ' + w[2]).join(', ') + '.' + (_W[1] && _A.near.length ? _W[1] + _A.near.map(n => n[0] + ' ' + n[1]).join(', ') + '.' : '') + _W[2]));
  if (_A.owe) {
  out.push((_W[3].replace('%s', _A.owe)));
  }
  } else {
  out.push("Aboard: " + ([_A.name].concat(_A.near).join(' · ')) + ", two minutes apart; the galley, the engine room, the bridge and the teachers' forward cabins are crew and staff only (turned back, no harm done). The teachers count heads at boarding and landing.");
  }
  for (const e of _A.ev || []) { const _t = AREA_EV(_A, e); if (!_t) continue;
  out.push((_t));
  }
  if (_A.last) {
  out.push("Last year's Expedition: {{user}}'s group " + (_A.last.res === 'caught' ? 'brought back its ' + _A.last.tgt : 'came back without its ' + _A.last.tgt + ' and failed') + "; people remember.");
  }
  if (_k === 'avalon') {
  out.push("On the hour the seven Herald Spires ring a bell and a few bars of music across the city; at noon, the news.");
  }
  }
  if (SOON) {
  out.push("Airship: the flight for " + (SOON.event) + " leaves at " + (SOON.from) + " for " + (SOON.lands) + "; everyone boards before then.");
  }
  if (AREAS.sunreach && AREAS.sunreach.coin) {
  out.push("Tomorrow: " + (AREAS.sunreach.coin) + ", abroad, where bracelet points do not work. Students change points into coin at the Banking House today (1:1); someone may remind {{user}}.");
  }
  if (AREAS.avalon && AREAS.avalon.coin) {
  out.push("Tomorrow: " + (AREAS.avalon.coin) + " in Avalon, where bracelet points do not work. Students change points into coin at the Banking House today (1:1); someone may remind {{user}}.");
  }
  NOW.pres = out = [];
  if (/CURFEW|LOCKDOWN/.test(cur)) {
  out.push("Presence: after curfew most students are in their own dorms; out are staff, patrols, and students sneaking out (only those whose personality allows it).");
  } else if (!AREA && HERE) {
  if (HERE.pres.length) {
  out.push((HERE.pres.join(' ')));
  }
  out.push("Likely around " + (HERE.place || 'here') + " (habits, not certainty; an established scene overrides): " + (HERE.regs.length ? HERE.regs.map(r => (HERE.why || {})[r] ? r + ' (' + HERE.why[r] + ')' : r).join(', ') : 'no regulars on record'));
  if (HERE.moved.length) {
  out.push("Moved indoors in this weather (Gymnasium, Common Rooms): " + (HERE.moved.join(', ')));
  }
  if (HERE.club) {
  out.push("Club time: " + (HERE.club));
  }
  if (HERE.st.length) {
  out.push("Regulars here with a status on record (it overrides their habits): " + (HERE.st.map(([r, s]) => r + ': ' + s).join('; ')));
  }
  if (HERE.cls) {
  out.push((HERE.cls));
  }
  }
  NOW.walk = out = [];
  const CW = !AREA && AREAS.campus && AREAS.campus.on ? AREAS.campus : null; if (CW) {
  out.push("Walks from here (minutes on foot, the shortest way on the Campus Map): " + (CW.walks.map(w => w[0] + ' ' + w[1]).join(', ')) + "." + (CW.near.length ? ' Close by' + (CW.pin ? ' (' + CW.pin + ')' : '') + ': ' + CW.near.map(n => n[0] + ' ' + n[1]).join(', ') + '.' : '') + " When {{user}} goes somewhere, advance the clock by the walk.");
  if (CW.owe) {
  out.push("Still on the way: " + (CW.owe) + " min of the last walk are not on the clock yet.");
  }
  }
  NOW.amb = out = [];
  const AMB = on('ambience') ? UI.amb : null; if (AMB) {
  if (AMB.crowd || AMB.cue) {
  out.push("Ambience at " + (AMB.place) + ": " + ([AMB.crowd, AMB.light].filter(Boolean).join(', ')) + "." + (AMB.cue ? ' Sensory cue (write your own detail, once): ' + AMB.cue + '.' : ''));
  } if (AMB.beat) {
  out.push((AMB.beat.kind === 'lore' ? "Overheard (weave it into this reply: a line or two of talk from students nearby, or a companion bringing it up; hearsay, never confirmed; {{user}} now knows it)" : AMB.beat.kind === 'brush' ?'Brushes {{user}} (small, harmless, changes nothing; {{user}} may ignore it)' : 'Nearby (optional, one clause, unnamed people; skip it if the scene is intense)') + ": " + (AMB.beat.text) + ".");
  } if (AMB.unc) {
  out.push("Uncanny (narrator only, secret; " + (AMB.unc.title) + "): " + (AMB.unc.text) + ". Never confirm or explain it, leave a mundane reading possible, no harm; everyone reacts in character.");
  } if (AMB.trace) {
  out.push("Trace (the open thread \"" + (AMB.trace) + "\" on {{user}}'s Mystery Board touches this place): if it fits the scene, let {{user}} notice one small sign true to the lore and to the clues already found (a detail, a remark, something out of place). Never a solution and never new canon beyond the lore; skip it if nothing fits.");
  } }
  return NOW;
}
// 1.54.0 (narrator-load audit U1, stage 1; 1.55.0 stage 2: bonds, practice, profile, notices, favours, the Vigil): situational rule cards. 502 keeps a core line per topic (path, data shape, the main ban);
// a topic's full rule (data/rule_cards.json, printed by entry 511 next to <now>) is listed while it applies: by the state, the calendar
// or the place, and fail-open by a word in the last reply or the player's message (a topic that came up gets its rule next turn).
const RULE_CARDS = {"letters":"letters","projects":"projects","competition":"competition","exams":"study","tutoring":"study","trip":"trip","pacts":"","first_pact":"","interactions":"","trust_tension":"","imprints":"","old_hut":"","training":"","practice":"proficiency","dorm":"","combat_role":"","favour":"planner","notices":"notices","vigil":"weather","fold":"","founding":""};   // id -> the feature that must be on ('' = always)
function ruleCards(c) {
  const { S, OFF, absA } = c, W = S.World, M = S.Magic || {};
  const said = String(c.text || '').replace(/<UpdateVariable>[\s\S]*?(?:<\/UpdateVariable>|$)/gi, ' ') + '\n' + String(c.userText || '');
  const ahead = (fn, days) => _.range(0, days + 1).some(d => eventsOn(fromAbs(absA + d * DAY_MIN)).some(fn));
  const pacts = Object.keys(M.Pacts || {}), comp = S.Competition || {}, here = placeOf(canonLocation(W.Location)), PR = (S.Player || {}).Profile || {};
  // 1.55.0 (stage 2): someone {{user}} has a bond with is here
  const bonded = () => Object.keys((S.Scene || {}).Present || {}).some(k => (S.Bonds || {})[NPC_ALIAS[String(k).toLowerCase()] || k]);
  const practising = () => ((S.$ui || {}).practice || []).some(x => x && !x.locked) || /\b(train\w*|practi[cs]\w*|drill\w*|spar\w*|craft\w*|brew\w*|study session)\b/i.test(said);
  const test = {
    letters: () => placeOf(canonLocation(W.Location)) === 'Mail Tower' || Object.values(S.Letters || {}).some(l => /^(waiting|sent)$/.test(String((l || {}).Status)))
      || /\b(letters?|mail|parcels?)\b|\bwrite home\b/i.test(said),
    projects: () => !_.isEmpty(S.Projects) || ((S.$ui || {}).craft || []).length > 0 || /\b(projects?|assignments?|commissions?)\b/i.test(said),
    competition: () => (!!comp.Tier && !/^(eliminated|champion)$/.test(String(comp.Status || ''))) || ahead(e => /Competition/.test(e.t || ''), 7)
      || /\b(competitions?|tournaments?|brackets?)\b/i.test(said),
    exams: () => ahead(e => /exams|Results|Science Fair|Expedition/.test(e.t || ''), 7) || /\b(exams?|midterms?|finals)\b/i.test(said),
    tutoring: () => Object.values(((S.Player || {}).Academics || {}).Grades || {}).some(g => /^A/.test(String(g))) || /\btutor/i.test(said),
    trip: () => !!(S.Trip || {}).Active || awayIn(S) || ahead(e => e.away || e.trip || /\bflies\b/.test(e.t || ''), 1) || /\b(trips?|journey)\b/i.test(said),
    pacts: () => pacts.length > 0 && (pacts.some(k => { const p = M.Pacts[k] || {}; return p.Summoned || p.Presence === 'terms' || (M.Active || {})[k]; })
      || new RegExp('\\b(summon\\w*|pacts?|' + pacts.map(_.escapeRegExp).join('|') + ')\\b', 'i').test(said)),
    first_pact: () => ((M._Affinity || {}).Types || []).includes('Occult') && !S.$eng.pactPlay && (placeKey(W.Location) === 'spirit path' || /\b(spirits?|pacts?)\b/i.test(said)),
    interactions: () => !_.isEmpty((S.Scene || {}).Present) || (((S.$ui || {}).cast || {}).ment || []).length > 0 || /\b(letters?|messages?)\b/i.test(said),
    trust_tension: () => bonded() || /\b(promis\w*|betray\w*|secrets?|lie[ds]?|lying|apolog\w*|insult\w*|punch\w*|humiliat\w*|forgiv\w*)\b/i.test(said),
    imprints: () => bonded(),
    old_hut: () => here === 'Old Hut' || /\bold hut\b/i.test(said),
    training: practising,
    practice: practising,
    dorm: () => !String(PR.Dorm || '').trim() || (W.Month === 1 && W.Week === 1 && W.Day === 'Mon') || /\b(sorting|arbiter stone)\b/i.test(said),
    combat_role: () => !String(PR.Combat_role || '').trim() || /\b(combat role|role class|reassign\w*)\b/i.test(said),
    favour: () => Object.values(S.Commitments || {}).some(x => /^favou?r$/i.test(String((x || {}).Type || '').trim())) || !!(((S.$ui || {}).initiative || {}).favour) || /\bfavou?rs?\b/i.test(said),
    notices: () => here === 'Notice Board' || /\b(notices?|notice board|flyers?)\b/i.test(said),
    fold: () => !!(S.$ui || {}).fold,   // 1.63.0 (memory audit M5)
    founding: () => ((S.Campus_State || {}).Founded_club || {}).Status === 'forming' || /\b(new club|start(ing)? a club|found(ing)? (a|my|our) club)\b/i.test(said),   // 1.75.0
    vigil: () => Object.keys(S.Inventory || {}).some(k => /vigil/i.test(k)) || num(((S.$eng || {}).sleep || {}).vigilUntil, -1) > absA || /\bvigil\b/i.test(said),
  };
  return Object.keys(RULE_CARDS).filter(id => (!RULE_CARDS[id] || !OFF.has(RULE_CARDS[id])) && test[id] && test[id]());
}
// 1.64.0 (memory audit M6): recall by person and place. The Journal lines that left the narrator's view (the archive, without what
// is still in view: the Journal and _Kept_from_earlier) that name someone on a full Cast Sheet (RECALL.who, newest first; their sheet
// prints them) or the place {{user}} is at (RECALL.place; <now> prints them). The Chronicle is printed whole in <current_state>, so
// only the original lines are recalled. Exact names, as the Zep-style half of a hybrid memory; VectFox brings the similar scenes.
const RECALL = { who: 3, place: 2 };
const NAME_RX_OF = new Map(NAME_RX), PLACE_WORDS = new Map();
const placeWords = nm => {
  if (PLACE_WORDS.has(nm)) return PLACE_WORDS.get(nm);
  const lo = nm.toLowerCase().replace(/^the /, ''), own = v => String(v).toLowerCase().replace(/^the /, '') === lo;
  const ws = _.uniq([lo, ...Object.entries({ ...PLACE_NAMES, ...PLACE_ALIAS }).filter(([, v]) => own(v)).map(([k]) => k.replace(/^the /, ''))])
    .filter(w => w.length >= 3).sort((a, b) => b.length - a.length);
  const rx = ws.length ? new RegExp('(^|[^a-z])(' + ws.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![a-z])', 'i') : null;
  PLACE_WORDS.set(nm, rx); return rx;
};
function recallOf(S) {
  const W = S.World, inView = new Set([...(S.Journal || []), ...(S._Kept_from_earlier || [])]);
  const old = (S.$ui.archive || []).filter(l => !inView.has(l) && !/^(?:\[[^\]]*\]\s*)?First visit to /.test(l)).reverse();
  const aged = l => { const m = /^\[([^\]]+)\]\s*/.exec(l), a = m && ageOf(m[1], W); return a ? `[${m[1]}, ${a}] ${l.slice(m[0].length)}` : l; };
  const earlier = {}, used = new Set();
  for (const id of ((S.$ui.cast || {}).full || [])) {
    const rx = NAME_RX_OF.get(id); if (!rx) continue;
    const hit = old.filter(l => mentionIn(l, id, rx)).slice(0, RECALL.who);
    if (hit.length) { earlier[id] = hit.map(aged); hit.forEach(l => used.add(l)); }
  }
  const here = plName(placeOf(W.Location)) || placeOf(W.Location), prx = here && placeWords(here);
  const place = prx ? old.filter(l => !used.has(l) && prx.test(l.replace(/^\[[^\]]*\]\s*/, ''))).slice(0, RECALL.place).map(aged) : [];
  return { earlier, place, placeName: place.length ? here : '' };
}
// 1.65.0 (memory audit M7): what in <current_state> touches this scene, so 501 prints it in full and the rest as one index line.
// ids: the people here (their Cast Sheet prints their own status and secrets), named in the last reply or the player's message, or
// expected ($ui.maybe). x: the Extras here or named. th: the clue threads a clue (name, Detail, Where) or the thread's name ties to
// those people or Extras, the place, the prose, a clue new this reply, or the trace beat. Names from the prose are kept from the last
// reply when an update has none (a player tool).
const wordRx = n => new RegExp(`(^|[^\\p{L}\\p{N}])${_.escapeRegExp(n)}($|[^\\p{L}\\p{N}])`, 'iu');
function focusOf(c, prev) {
  const { S, B, hasB, text, userText } = c;
  const CS = S.$ui.cast || {}, prose = text ? proseOf(text) + '\n' + String(userText || '') : null, P0 = prev || {};
  const xs = Object.keys(S.Extras || {});
  const xn = prose == null ? (P0.xn || []).filter(n => xs.includes(n)) : xs.filter(n => n.length >= 3 && wordRx(n).test(prose));
  const x = _.uniq([...(CS.extras || []).filter(n => xs.includes(n)), ...xn]);
  const ids = _.uniq([...(CS.full || []), ...(CS.brief || []), ...(CS.ment || []), ...(S.$ui.maybe || []).map(m => m[0])]);
  const here = plName(placeOf(S.World.Location)) || placeOf(S.World.Location), prx = here && placeWords(here);
  const tn = prose == null ? (P0.tn || []) : _.uniq(Object.entries(S.Clues || {}).filter(([k, cl]) => cl && [cl.Thread, k].some(n => String(n).length >= 4 && wordRx(String(n)).test(prose))).map(([, cl]) => cl.Thread));
  const C0 = (hasB && B.Clues) || {}, trace = ((S.$ui.amb || {}).trace) || '';
  const ties = (k, cl) => { const t = [k, cl.Detail, cl.Where, cl.Thread, ((S.Mysteries || {})[cl.Thread] || {}).Summary].join(' \n ');
    return ids.some(id => { const rx = NAME_RX_OF.get(id); return rx ? mentionIn(t, id, rx) : wordRx(id).test(t); }) || x.some(n => wordRx(n).test(t))
      || (prx && prx.test(String(cl.Where || '') + ' ' + String(cl.Detail || ''))) || !_.isEqual(C0[k], cl); };
  const th = _.uniq([...tn, ...(trace ? [trace] : []), ...Object.entries(S.Clues || {}).filter(([k, cl]) => cl && ties(k, cl)).map(([, cl]) => cl.Thread)]).sort();
  return { ids, x, th, xn, tn };
}
function stepNow(c) {
  const { S } = c;
  const fprev = (S.$ui.now || {}).focus;
  S.$ui.now = nowOf(S, c.moods);
  S.$ui.now.focus = focusOf(c, fprev);
  S.$ui.now.rules = ruleCards(c);
  // 1.66.0 (M11b): events VectFox recalls from a timeline the story rewound
  { const TL = S.$eng.tl; if (TL && Array.isArray(TL.void) && TL.void.length) S.$ui.now.tl = TL.void.map(v => `t${v.t}${v.t === 1 ? ' (or with no t)' : ''} from message_order ${v.from} on`); }
  { const r = recallOf(S); if (Object.keys(r.earlier).length) S.$ui.now.earlier = r.earlier; if (r.place.length) { S.$ui.now.recall = r.place; S.$ui.now.recallAt = r.placeName; } }
  // 1.48.0 (audit 2.6): what <now> has in its lines is not kept twice: the walks and places nearby of an area (the Map panel walks
  // the same graph itself)
  for (const a of Object.values(S.$ui.area || {})) if (_.isPlainObject(a)) { delete a.walks; delete a.near; }
}

const ENGINE_STEPS = [stepSetup, stepMigrate, stepGuards, stepFeatures, stepTime, stepWeather, stepMagic, stepPurchases, stepRest, stepExposure, stepExpedition, stepCapital, stepAirship, stepSunreach, stepCampus, stepVitals, stepReputation, stepFortune, stepSchoolWeek, stepNamesInProse, stepPromises, stepBonds, stepBondMemory, stepProficiency, stepTraining, stepPerkUse, stepHidden, stepPayout, stepLoreChanges, stepRecords, stepClubLife, stepNewYear, stepGraduation, stepGraduateRewards, stepInitiative, stepHooks, stepGossip, stepRoutine, stepVisits, stepBag, stepCampusEvents, stepExtras, stepCast, stepFold, stepGist, stepReminders, stepAmbience, stepAgenda, stepHere, stepUi, stepCommit, stepNow];

// 1.17.0 (audit T1): the card's trim regex ("State-as-memory", minDepth 24) leaves every older message as "[…]", and each one was
// still sent. SillyTavern emits CHAT_COMPLETION_PROMPT_READY with { chat, dryRun } and sends that same array (public/scripts/openai.js,
// prepareOpenAIMessages; Tavern Helper passes the object through): each run of "[…]" messages becomes one.
const TRIMMED = /^\s*(?:[^\n:]{1,40}:\s*)?\[…\]\s*$/;
function collapseTrimmed(chat) {
  if (!Array.isArray(chat)) return 0;
  let removed = 0;
  for (let i = chat.length - 1; i > 0; i--) {
    const a = chat[i - 1], b = chat[i];
    if (a && b && typeof a.content === 'string' && typeof b.content === 'string' && TRIMMED.test(a.content) && TRIMMED.test(b.content)) {
      a.n = (a.n || 1) + (b.n || 1); chat.splice(i, 1); removed++;
    }
  }
  for (const m of chat) if (m && m.n > 1) { m.content = `[… ${m.n} earlier messages; <current_state> is the story's memory …]`; delete m.n; }
  return removed;
}
if (typeof eventOn === 'function' && typeof tavern_events === 'object' && tavern_events && tavern_events.CHAT_COMPLETION_PROMPT_READY) {
  eventOn(tavern_events.CHAT_COMPLETION_PROMPT_READY, data => { try { collapseTrimmed(data && data.chat); } catch (e) { console.error('[Eldrasil trim]', e); } });
}
// 1.30.1 (owner playtest: two replies of fourteen lost their whole update, and with it the new location): MagVarUpdate reads a
// patch only inside a complete <JSONPatch>…</JSONPatch> (update_variables.ts extractCommands, checked at MagVarUpdate b13b43b),
// so a block without the tags, or without the closing one, was dropped. When MVU found no JSON patch in a reply that has an
// <UpdateVariable> block, the engine reads the list itself (missing tags or brackets, trailing commas) and hands MVU the commands
// its extractJsonPatch would have made, before the zod helper checks them (COMMAND_PARSED runs first).
function recoverPatch(content) {
  const m = /<UpdateVariable>([\s\S]*?)(?:<\/UpdateVariable>|$)/i.exec(String(content || ''));
  if (!m) return null;
  const body = m[1].replace(/<Analysis>[\s\S]*?<\/Analysis>/gi, '').replace(/<\/?json_?patch>/gi, '').replace(/```[a-z]*/gi, '');
  const a = body.search(/[[{]/), z = Math.max(body.lastIndexOf(']'), body.lastIndexOf('}'));
  if (a < 0 || z < a) return null;
  let s = body.slice(a, z + 1).trim();
  if (s[0] === '{') s = '[' + s.replace(/\]\s*$/, '') + ']';
  let ops;
  try { ops = JSON.parse(s.replace(/,\s*([\]}])/g, '$1')); } catch (e) { return { error: String(e.message || e).slice(0, 80) }; }
  if (!Array.isArray(ops)) return { error: 'the block is not a list of operations' };
  return { ops: ops.filter(o => o && typeof o === 'object' && typeof o.op === 'string') };
}
const mvuPath = segs => segs.map(x => `["${String(x).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`).join('');
const mvuPointer = p => mvuPath(String(p || '').replace(/^\//, '').split('/').map(x => x.replace(/~1/g, '/').replace(/~0/g, '~')));
function patchCommands(ops) {
  const out = [];
  for (const op of ops) {
    const path = mvuPointer(op.path ?? op.to), full = JSON.stringify(op), val = JSON.stringify(op.value);
    if (op.op === 'replace') out.push({ type: 'set', full_match: full, args: [path, val], reason: 'json_patch' });
    else if (op.op === 'delta') out.push({ type: 'add', full_match: full, args: [path, val], reason: 'json_patch' });
    else if (op.op === 'insert' || op.op === 'add') {
      const parts = _.toPath(path), last = parts[parts.length - 1];
      out.push({ type: 'insert', full_match: full, args: [mvuPath(parts.slice(0, -1)), /^\d+$/.test(last) ? last : JSON.stringify(last), val], reason: 'json_patch' });
    } else if (op.op === 'remove') out.push({ type: 'delete', full_match: full, args: [path], reason: 'json_patch' });
    else if (op.op === 'move') out.push({ type: 'move', full_match: full, args: [mvuPointer(op.from), path], reason: 'json_patch' });
  }
  return out;
}
// 1.35.1 (owner playtest: Ruby's sweet never reached the Bag): <current_state> hides empty fields, so the narrator guessed
// /Player/Inventory/<item>; the zod schema drops unknown keys under Player, so the item vanished without a warning. A top-level
// list written under Player, World or Scene (or as "Bag") is moved back to the root before the zod helper applies the commands
// (MagVarUpdate update_variables.ts: COMMAND_PARSED listeners run before COMMAND_PARSED_for_zod; json_patch paths are
// ["a"]["b"] bracket paths, which pathFixPass leaves alone).
const ROOT_LISTS = new Set(['Inventory', 'Commitments', 'Notices', 'Letters', 'Competition', 'Projects', 'Trip', 'Journal', 'Clues',
  'Mysteries', 'Battle', 'Hooks', 'Extras', 'Interactions', 'Practice', 'Purchases', 'Craft_sales', 'Rep_events', 'Training', 'Perk_use',
  'Exam_events', 'Tutoring', 'Consumables', 'Exposure']);
function fixStrayPaths(commands) {
  const moved = [];
  const fix = p => {
    if (typeof p !== 'string') return p;
    const parts = _.toPath(p.trim());
    if (parts[0] === 'stat_data') parts.shift();
    let n = 0;
    if (/^(Player|World|Scene)$/.test(parts[0]) && (ROOT_LISTS.has(parts[1]) || parts[1] === 'Bag')) n = 1;
    if (parts[n] !== 'Bag' && !(n && ROOT_LISTS.has(parts[n]))) return p;
    const out = [parts[n] === 'Bag' ? 'Inventory' : parts[n], ...parts.slice(n + 1)];
    moved.push(`${parts.slice(0, n + 1).join('.')} → ${out[0]}`);
    return mvuPath(out);
  };
  for (const c of commands || []) {
    if (!c || c.reason !== 'json_patch' || !Array.isArray(c.args) || !c.args.length) continue;   // MVU path-fixes the others later
    c.args[0] = fix(c.args[0]);
    if (c.type === 'move' && c.args.length > 1) c.args[1] = fix(c.args[1]);
  }
  return [...new Set(moved)];
}
// 1.61.0 (memory audit M9): the floor MVU is processing is the message whose text it parsed (COMMAND_PARSED hands over that
// message's `mes`, MagVarUpdate 438f9ff updateVariables). It is the chat's last message in play, an earlier one while MVU replays
// floors (its restore after a deletion, "Replay floor"). The player's words and the seed hint come from that floor; the newest copy
// of the text wins (a repeated identical message is the latest one).
function floorOf(chat, content) {
  let at = chat.length - 1;
  if (content) for (let i = chat.length - 1; i >= 0; i--) if (chat[i] && String(chat[i].mes || '') === content) { at = i; break; }
  let said = '';
  for (let i = at; i >= 0; i--) { const x = chat[i] || {}; if (x.is_user && !x.is_system && !/\(player tool\)/.test(String(x.mes || ''))) { said = String(x.mes || ''); break; } }
  return { at, said, sent: String((chat[at] || {}).send_date || '') };
}
// The state before this floor normally comes from the floor just before it. MVU takes the newest earlier floor that still holds
// data (getLastValidVariable), so after a branch or a deep deletion it can be a snapshot up to 49 floors back, and every update in
// between is missing. $eng.floor stamps the floor each state was made on.
const SNAP_GAP = 3;
// 1.66.0 (memory audit M11a, M11b): VectFox searches with the raw last messages (DECISIONS §11), so the card appends one short line
// to each player message as it is sent: who is here, the place and the timeline number, "(scene: Irene, Kaito · Courtyards · t2)".
// The display and the story prompt drop it (card regexes), so does the engine (runEngine); VectFox's cleaning pattern turns it into
// a [Timeline: tN] line for its extraction. The timeline is a chat variable (eld_tl { t, top, void }) outside the per-message state,
// so it survives a rollback (and a branch copies it: ST saveChat merges chat_metadata). A player message sent at a floor the chat
// already had (messages were deleted back to it) starts timeline t+1, and VectFox events of the old timeline from that message on
// never happened (<now> says so). Messages Tavern Helper inserts (player tools) emit MESSAGE_SENT with 'extension': not counted.
const TL_VAR = 'eld_tl', TL_VOID = 10;
const SCENE_MARK_RX = /\s*\(scene: [^()\n]*\bt\d+\)\s*$/;
const tlNorm = v => { const o = v && typeof v === 'object' ? v : {};
  return { t: Math.max(1, Math.floor(num(o.t, 1))), top: Math.floor(num(o.top, -1)), void: (Array.isArray(o.void) ? o.void : []).filter(x => x && num(x.t, 0) >= 1 && num(x.from, -1) >= 0).slice(-TL_VOID) }; };
function tlSent(tl, id) {   // a player message at chat index id; true when it starts a new timeline
  const cut = id >= 0 && id <= tl.top;
  if (cut) { tl.void = [...tl.void, { t: tl.t, from: id }].slice(-TL_VOID); tl.t++; }
  tl.top = Math.max(cut ? id : tl.top, id);
  return cut;
}
const sceneMark = (S, t) => {
  const who = Object.keys(((S || {}).Scene || {}).Present || {}).slice(0, 6), pl = placeOf(((S || {}).World || {}).Location);
  return `(scene: ${[who.join(', '), pl].filter(Boolean).concat('t' + t).join(' · ')})`;
};
function snapGap(before, at) {
  const bf = before && before.$eng ? Number(before.$eng.floor) : NaN, k = at - bf;
  if (!(at >= 0) || !(bf >= 0) || !(k > SNAP_GAP)) return null;
  return { log: `The state before this message came from message ${bf}, ${k} messages back (MVU keeps the variables of only some older messages), so the updates in between are missing. To rebuild them: MVU panel → Compatibility → Show legacy features → Replay floor, accepting both suggested floors.`,
    toast: `State came from message ${bf} (${k} back): MVU → Show legacy features → Replay floor` };
}
if (typeof eventOn === 'function' && typeof waitGlobalInitialized === 'function') {
  (async () => {
    await waitGlobalInitialized('Mvu');
    let text = '';   // message being parsed in this update (COMMAND_PARSED fires before VARIABLE_UPDATE_ENDED)
    eventOn(Mvu.events.VARIABLE_UPDATE_STARTED, () => { text = ''; });
    let repaired = '';   // 1.30.1: what the recovery of a malformed block did, for the Log after the engine runs
    eventOn(Mvu.events.VARIABLE_UPDATE_STARTED, () => { repaired = ''; });
    eventOn(Mvu.events.COMMAND_PARSED, (_v, commands, content) => {
      text = content || '';
      if (!Array.isArray(commands)) return;
      if (!commands.some(x => x && x.reason === 'json_patch')) {
        const r = recoverPatch(content);
        if (r && r.ops && r.ops.length) {
          commands.push(...patchCommands(r.ops));
          repaired = `The update block was malformed (a <JSONPatch> tag or bracket was missing); the engine read its ${r.ops.length} changes.`;
        } else if (r && r.error) repaired = `The update block could not be read (${r.error}); nothing in it was applied. Swipe the reply.`;
      }
      const moved = fixStrayPaths(commands);
      if (moved.length) repaired = [repaired, `Wrong path moved to the root (${moved.join(', ')}): these lists are top-level, e.g. /Inventory/<item>.`].filter(Boolean).join(' ');
    });
    // 1.66.0 (M11a, M11b): mark each player message as it is sent (eventMakeFirst: before MVU and VectFox read it; ST awaits
    // MESSAGE_SENT listeners before it generates, and saves the message with the reply)
    const tlGet = () => { try { return tlNorm((getVariables({ type: 'chat' }) || {})[TL_VAR]); } catch (e) { return tlNorm(null); } };
    const tlPut = tl => { try { updateVariablesWith(v => { v[TL_VAR] = tl; return v; }, { type: 'chat' }); } catch (e) { console.warn('[Eldrasil timeline]', e); } };
    const stateBefore = id => { for (let i = id - 1; i >= 0; i--) { try { const v = getVariables({ type: 'message', message_id: i }); if (v && v.stat_data && v.stat_data.World) return v.stat_data; } catch (e) { /* none */ } } return null; };
    if (typeof tavern_events === 'object' && tavern_events) {
      (typeof eventMakeFirst === 'function' ? eventMakeFirst : eventOn)(tavern_events.MESSAGE_SENT, (id, from) => {
        try {
          const m = (SillyTavern.chat || [])[id];
          if (from === 'extension' || !m || !m.is_user || m.is_system) return;
          const tl = tlGet(); tlSent(tl, id); tlPut(tl);
          if (!SCENE_MARK_RX.test(String(m.mes || ''))) m.mes = String(m.mes || '').replace(/\s+$/, '') + '\n' + sceneMark(stateBefore(id), tl.t);
        } catch (e) { console.warn('[Eldrasil scene marker]', e); }
      });
      eventOn(tavern_events.MESSAGE_RECEIVED, (id, from) => { if (from === 'extension') return; const tl = tlGet(); if (id > tl.top) { tl.top = id; tlPut(tl); } });
    }
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, variables_before) => {
      let hint = '', said = '', at = -1;
      // 1.12.0: the player's last visible message (not a hidden player-tool entry), for the reminders of section 8l. 1.61.0: of the
      // floor being processed (floorOf), which is not the chat's last message while MVU replays
      try { const F = floorOf(SillyTavern.chat || [], text); at = F.at; said = F.said; hint = F.sent + '|' + (SillyTavern.getCurrentChatId ? SillyTavern.getCurrentChatId() : ''); } catch (e) { /* seed falls back to world time */ }
      // 1.16.1 (audit B8): the engine edits the state in place. If it fails halfway, the state goes back to what it was before
      // this reply (a half-run engine must not be saved), and the player is told so: swipe, or report the error.
      const before = variables_before && variables_before.stat_data;
      const snap = _.cloneDeep(before && before.World ? before : variables.stat_data);
      try {
        if (variables.stat_data && variables.stat_data.$eng) { const tl = tlGet(); variables.stat_data.$eng.tl = { t: tl.t, void: tl.void }; }
        runEngine(variables.stat_data, before, text, hint, said); text = '';
        const S = variables.stat_data, gap = snapGap(before, at);
        if (at >= 0 && S.$eng) S.$eng.floor = at;
        if (gap) {
          S._Log = [...(Array.isArray(S._Log) ? S._Log : []), gap.log].slice(-12);
          if (S.$ui && Array.isArray(S.$ui.toasts)) S.$ui.toasts.push(gap.toast);
        }
        if (repaired) {
          S._Log = [...(Array.isArray(S._Log) ? S._Log : []), repaired].slice(-12);
          if (/could not be read/.test(repaired) && S.$ui && Array.isArray(S.$ui.toasts)) S.$ui.toasts.push('Update block unreadable: swipe the reply');
          repaired = '';
        }
      }
      catch (e) {
        console.error('[Eldrasil engine]', e);
        text = '';
        const S = variables.stat_data;
        for (const k of Object.keys(S)) delete S[k];
        Object.assign(S, snap);
        const msg = `Engine error (${String((e && e.message) || e).slice(0, 160)}): this update was not applied and the state was kept as it was before the reply. Swipe the reply, or report the error with the browser console.`;
        S._Log = [...(Array.isArray(S._Log) ? S._Log : []), msg].slice(-12);
        if (S.$ui && typeof S.$ui === 'object') S.$ui.toasts = ['Engine error: the update was not applied (see Log)'];
      }
    });
  })();
}
