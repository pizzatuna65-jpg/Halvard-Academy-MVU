// ================================================================ 4.4 interactive map (D5–D8, D21)
view.pin = null; view.floor = ''; view.focusLoc = ''; view.card = 0;
const CROP_H = 96, CROP_SCALE = 4;
const normPlace = s => placeOf(s).toLowerCase().replace(/^the\s+/, '');   // placeOf: shared.js
// 1.3.1 (owner playtest): the same reading of World.Location as the engine (canonLocation): short names ("Boathouse", "the
// library") via DATA.palias (tools/common.py place_aliases), and a sub-spot that is itself a place wins ("… — Fishing House").
const plSegs = s => locParts(s).map(x => x.trim().toLowerCase().replace(/[.!]+$/, '').replace(/^the\s+/, '')).filter(Boolean);
const sharedLoc = id => DATA.pins.filter(p => p.cluster.includes(id)).length > 1;
// 1.51.0 (feature batch 3, audit 4.9): the places a Clue of an open thread names (Clues Where): loc id -> threads; a solved or cold
// thread marks nothing
function clueLocs(S) {
  const out = {}; if (!featureOn(S, 'mystery')) return out;
  for (const cl of Object.values(S.Clues || {})) {
    const m = cl && (S.Mysteries || {})[cl.Thread]; if (!cl || !String(cl.Where || '').trim() || (m && m.Status !== 'open')) continue;
    const id = locIdOf(cl.Where); if (id && !(out[id] = out[id] || []).includes(cl.Thread)) out[id].push(cl.Thread);
  }
  return out;
}
function locIdOf(place) {
  const segs = plSegs(place); if (!segs.length) return '';
  const exact = p => Object.keys(DATA.locs).find(id => normPlace(DATA.locs[id].name) === p) || Object.keys(DATA.locs).find(id => id.replace(/_/g, ' ') === p) || '';
  for (let i = segs.length - 1; i >= 0; i--) { const id = exact(segs[i]); if (id && (i === 0 || !sharedLoc(id))) return id; }
  const a = (DATA.palias || {})[segs[0]];
  return a && DATA.locs[a] ? a : '';
}
// 1.24.0 (owner playtest): some far-grounds places show only from where they lead from (data/locations.json gate: Willow Island and
// the Fishing House from the boathouse, the Clearing from the Forest, the Observation Tower and the Old Hut from the Grassy Field).
// 1.30.1 (owner playtest): only while {{user}} is in that area (at the gate place or another place behind the same gate); back on
// the main grounds they hide again. The Rooftop keeps D21 (shown once visited).
const beenAt = (S, name) => normPlace((S.World || {}).Location) === normPlace(name) || ((S.$ui || {}).discovered || []).some(d => normPlace(d) === normPlace(name));
const gateOpen = (S, g) => { const cur = locIdOf((S.World || {}).Location); return !!cur && (cur === g || (DATA.locs[cur] || {}).gate === g); };
const discovered = (S, l) => l.discoverable ? beenAt(S, l.name) : !l.gate || gateOpen(S, l.gate);
// 1.71.0 (owner): once {{user}} belongs to a dorm, the other dorms leave the campus map. One shows again on its Dorm Day (the
// calendar's open house) or while {{user}} is inside it (a visit, e.g. escorted by a Rank 7 friend). Unsorted: every dorm shows.
function dormDayToday(S) {
  const W = S.World || {}, e = (CAL.EVENTS || []).find(x => /Dorm Day$/.test(x.t) && x.m === W.Month && x.w === W.Week && (x.d || []).includes(W.Day));
  const m = e && /^(Fire|Light|Sky|Viridian) Dormitory/.exec(e.s || '');
  return m ? DORM_ID[m[1]] : '';
}
function pinShown(p, S) {
  const home = p.cluster[0]; if (!Object.values(DORM_ID).includes(home)) return true;
  const own = DORM_ID[((S.Player || {}).Profile || {}).Dorm];
  return !own || home === own || home === dormDayToday(S) || locIdOf((S.World || {}).Location) === home;
}
// 1.24.0 (owner playtest: labels at the map's edge were cut off): a label near the right or left edge grows inward, near the top below
const labPos = p => (p.x > 82 ? ' r' : p.x < 12 ? ' l' : '') + (p.y < 12 ? ' b' : '');
// 1.24.0 (owner playtest): zoom and its centre, kept in the script while the page is open, so closing and opening the map keeps
// them (not in browser storage: DECISIONS "Colour themes" allows only the theme there)
const ZOOMS = [1, 1.5, 2, 2.5, 3];
const mapView = { z: 1, cx: 0.5, cy: 0.5 };
const pinOf = id => DATA.pins.find(p => p.cluster.includes(id) && p.pin === (DATA.locs[id] || {}).pin) || DATA.pins.find(p => p.cluster.includes(id));
// 1.13.0 (owner): the map follows the calendar. data/assets_manifest.json map_variants, first match wins: an event variant while
// that event is on (optionally only in its hours, e.g. Star Night from Saturday 18:00 to Sunday 06:00), then a season variant,
// then the default map. Every variant has the default's size and layout, so pins and card crops stay where they are. A variant
// that does not load shows the default underneath (card crops) or instead (the big map).
function mapFor(S) {
  const W = (S && S.World) || {}, hr = num(String(W.Time || '').split(':')[0], 0), season = SEASON_OF(W.Month);
  const evs = eventsOnDay(num(W.Month, 1), num(W.Week, 1), W.Day);
  const V = (DATA.assets.variants || []).filter(x => x && x.file);   // 1.13.1: an event map always beats a season map
  const v = V.find(x => x.event && evs.some(e => e.t.startsWith(x.event)) && (!x.hours || (x.hours[W.Day] && hr >= x.hours[W.Day][0] && hr < x.hours[W.Day][1])))
    || V.find(x => !x.event && x.season === season);
  return v ? v.file : DATA.assets.map;
}
// 1.24.0 (owner playtest: a black band at the right of the Willow Island header): the crop follows the card's real width. The map is
// drawn CROP_SCALE times the card's width with the pin in the middle, held inside the image at the edges: across, a percentage
// position does that for any width; down (the header is CROP_H high), p% + (CROP_H/2 - p·CROP_H)px, clamped to the image.
function cropStyle(pin, S, own) {                                // own: another map's file (1.38.0: the forest), no fallback layer
  const px = pin.x / 100, py = pin.y / 100, bx = _.clamp((CROP_SCALE * px - 0.5) / (CROP_SCALE - 1), 0, 1) * 100;
  const by = `clamp(100%, calc(${+(py * 100).toFixed(2)}% + ${+(CROP_H / 2 - CROP_H * py).toFixed(1)}px), 0px)`;
  const file = own || mapFor(S), layers = [file, ...(!own && file !== DATA.assets.map ? [DATA.assets.map] : [])].map(f => `url('${esc(imgURL(f))}')`).join(',');
  return `background-image:${layers};background-size:${CROP_SCALE * 100}% auto;background-position:${+bx.toFixed(2)}% ${by}`;
}
const goText = name => `I head to the ${String(name).replace(/^the\s+/i, '')}.`;
// 1.24.2 (owner): the Lecture Halls, Study Rooms and lockers are on each year's floor (first-years Floor 2, second-years 3, third-years
// 4). A place is on a floor if it is its floor or one of its floors; the player's floor is the one World.Location names ("Floor 3",
// "second-year"), else the one for {{user}}'s school year.
const onFloor = (id, f) => (DATA.locs[id].floors || [DATA.locs[id].floor]).includes(f);
// 1.24.3 (owner: the split must show without opening the description): on a year's floor the place is named for that year
// ("Second-year Lecture Halls"), and the floor tabs say whose floor it is
const YEAR_OF_FLOOR = { 'Floor 2': 1, 'Floor 3': 2, 'Floor 4': 3 };
const nameOn = (id, f) => { const l = DATA.locs[id]; return (l.fnote && l.fnote[f]) || l.name; };
function floorOf(id, S) {
  const l = DATA.locs[id]; if (!l || !l.floors) return (l || {}).floor || '';
  const loc = String((S.World || {}).Location || ''), m = /\bfloor ([2-4])\b/i.exec(loc), y = /\b(first|second|third)[- ]year/i.exec(loc);
  const n = m ? +m[1] : y ? ['first', 'second', 'third'].indexOf(y[1].toLowerCase()) + 2 : _.clamp(num(((S.Player || {}).Profile || {}).Year, 1), 1, 3) + 1;
  return l.floors.includes('Floor ' + n) ? 'Floor ' + n : l.floor;
}

// 1.2.0 / 1.2.1 (owner): walking time from where the player is now. The legs and their minutes come from tools/curate_data.py
// (locs[id].near: map distance, lore times on forest and boat legs, castle stairs); this is the shortest path over them.
// A room every dorm has (Common Rooms, Laundry, Bathhouse) counts as the player's own dorm.
const DORM_ID = { Fire: 'fire_dormitory', Light: 'light_dormitory', Sky: 'sky_dormitory', Viridian: 'viridian_dormitory' };
let _walkMemo = { key: '', dist: null };
function walkFrom(from, S) {
  const own = DORM_ID[((S.Player || {}).Profile || {}).Dorm];
  if (own && DATA.pins.filter(p => p.cluster.includes(from)).length > 1) from = own;
  if (_walkMemo.key === from) return _walkMemo.dist;
  const dist = { [from]: 0 }, done = new Set();
  for (;;) {
    let u = null; for (const k in dist) if (!done.has(k) && (u === null || dist[k] < dist[u])) u = k;
    if (u === null) break; done.add(u);
    for (const [v, w] of (DATA.locs[u] || {}).near || []) {
      if (!DATA.locs[v]) continue;
      const nd = dist[u] + w; if (!(v in dist) || nd < dist[v]) dist[v] = nd;
    }
  }
  _walkMemo = { key: from, dist }; return dist;
}
function walkText(id, cur, S) {
  const l = DATA.locs[id];
  if (id === cur && (!l.floors || !view.floor || view.floor === floorOf(cur, S))) return 'You are here';
  // 1.24.2: the legs reach a place's first floor; each floor above adds a minute (lore 132: "each floor climbed adds about a minute")
  const up = f => (f && /^Floor \d$/.test(f) ? +f.slice(-1) : 0);
  const extra = l.floors && l.floors.includes(view.floor) ? Math.abs(up(view.floor) - (id === cur ? up(floorOf(cur, S)) : up(l.floor))) : 0;
  const t0 = id === cur ? 0 : cur ? walkFrom(cur, S)[id] : undefined, t = t0 == null ? t0 : t0 + extra;
  if (t === 0) return 'Right here';
  if (t != null) return `${t <= 2 ? 'A minute or two' : `About ${t} min`} from here (${DATA.locs[cur].name})`;
  return l.walk_min == null ? 'Unknown' : l.walk_min === 0 ? 'At the Main Courtyard' : `About ${Math.max(l.walk_min, 2)} min from the Main Courtyard`;
}
// 1.2.0 (owner): a regular is listed only once you have met them and their dossier's Haunts entry is unlocked (Rank 1 unless the
// dossier says otherwise); someone without a Haunts entry shows from Rank 1.
function hauntKnown(id, S) {
  const n = npcOf(id), b = ((S && S.Bonds) || {})[id]; if (!n || !b) return false;
  const f = (n.fl || []).find(x => x[0].toLowerCase() === 'haunts');
  return f ? fieldUnlocked(id, f, S) : b.Rank >= 1;
}

// ---- 1.46.0 (audit 2.1): the outside areas' tabs, one renderer (DATA.areas from tools/gen_ui.py, engine $ui.area). The Grand Vast Forest
// (1.38.0), Avalon (1.39.0) and Sunreach Bay (1.41.0, a day and a night image) are maps: pins that hold places (in the forest each
// place is its own pin), one card at a time; a tab once {{user}} has been there, opened by itself while {{user}} is in the area. The
// airship (1.40.0) has no map image: a tab only during a flight, its four places as cards. Walks come from the same search the engine
// uses (shared.js areaRoutes / areaMin). The forest shows only the places visited and their neighbours; Avalon's castle pin only after a
// Kingdom win, the Rookery only once visited. 1.97.3: Hanakaze (the World Competition in Year 1): the Alpha's Residence never, the
// Warrens once visited, the match grounds only on their days.
const AZ = k => (DATA.areas || {})[k] || { pins: [], places: [], legs: [], modes: {} };
const azPlace = (k, id) => AZ(k).places.find(p => p.id === id), azPin = (k, id) => AZ(k).pins.find(p => p.id === id);
const AZ_NB = {}, AZ_RT = {};
const azRoutes = (k, from) => { const key = k + ':' + from; if (!AZ_RT[key]) AZ_RT[key] = areaRoutes(AZ_NB[k] || (AZ_NB[k] = areaNb(AZ(k).legs)), from, id => !!(azPin(k, id) || {}).locked); return AZ_RT[key]; };
const azPL = k => AZ(k).byId || (AZ(k).byId = Object.fromEntries(AZ(k).places.map(p => [p.id, p])));
const azMin = (k, a, b) => areaMin(azPL(k), from => azRoutes(k, from), a, b);
const azNight = (k, S) => { const N = AZ(k).night; if (!N) return false; const t = hmMin((S.World || {}).Time); return t != null && (t >= hmMin(N.from) || t < hmMin(N.to)); };
const azMap = (k, S) => AZ(k).maps ? AZ(k).maps[azNight(k, S) ? 'night' : 'day'] : AZ(k).map;
// the pins shown: the forest's places visited and their neighbours; elsewhere every pin, a locked one only with the castle open
function azPins(k, S, A) {
  if (AZ(k).reveal !== 'near') return AZ(k).pins.filter(p => (!p.locked || A.castle) && (!p.kc || (A.kc || []).includes(p.kc)));   // 1.84.0: a Kingdom round's ground only while open
  const seen = (A.seen || []).filter(id => azPin(k, id)), known = new Set(seen);
  for (const id of seen) for (const [a, b] of AZ(k).legs) { if (a === id) known.add(b); if (b === id) known.add(a); }
  return AZ(k).pins.filter(p => known.has(p.id));
}
const azPlaceOk = (k, A, p) => (!p.locked || A.castle) && (!p.kc || (A.kc || []).includes(p.kc)) && (!p.hidden || (A.seen || []).includes(p.id));
// how far a place is from {{user}} (or, outside the area, from where the area's visits start), and how
function azWalk(k, id, A) {
  const Z = AZ(k), from = A.on && A.at ? A.at : Z.arrive, p = azPlace(k, id), f = azPlace(k, from), M = Z.modes || {};
  if (A.on && A.at === id) return 'You are here';
  const w = azMin(k, from, id), whence = A.on && A.at ? `from here (${f.name})` : `from ${f.go}`;
  if (Z.unit === 'h') return `About ${w} h on foot ${whence}`;
  if (M.tour && (azPin(k, p.pin).sea || azPin(k, f.pin).sea)) return `About ${w} min, by tour boat from ${M.tour.from} (${M.tour.fare} coin)`;
  if (M.team && (p.kc || f.kc)) return `About ${w} min, by team carriage from ${M.team.from}, on match days only`;   // 1.97.3: Hanakaze's match grounds
  const split = f.pin !== p.pin && M.carriage;
  return `About ${w} min on foot${split ? ` (${Math.round(w / 2)} by ${M.carriage.name}, ${M.carriage.fare} coin)` : ''} ${whence}`;
}
function azCard(k, id, S, A, night) {
  const Z = AZ(k), p = azPlace(k, id), here = A.on && A.at === id;
  const rows = [['Walk', esc(azWalk(k, id, A))]];
  if (Z.paths) {   // the forest: the paths from this place, the ones not taken yet only counted
    const known = new Set(azPins(k, S, A).map(x => x.id)), nb = Z.legs.filter(l => l[0] === id || l[1] === id).map(l => [l[0] === id ? l[1] : l[0], l[2]]);
    const nbKnown = nb.filter(([v]) => known.has(v)), more = nb.length - nbKnown.length;
    rows.push(['Paths', esc(nbKnown.map(([v, h]) => `${azPlace(k, v).name} ${h} h`).join(', ') + (more ? `${nbKnown.length ? '; ' : ''}${more} path${more > 1 ? 's' : ''} you have not taken yet` : '') || 'None known')]);
  }
  const vibe = night && p.vibe_night ? p.vibe_night : p.vibe;
  return `<article class="lc${here ? ' here' : ''}"><div class="crop" style="${cropStyle(azPin(k, p.pin), S, azMap(k, S))}"><b>${esc(p.name)}</b>${here ? '<span class="you">You are here</span>' : ''}</div>
    <div class="in">${vibe ? `<p class="vibe">${esc(vibe)}</p>` : ''}
    <details><summary>Description</summary><p>${esc(p.desc || '')}</p>${night && p.desc_night ? `<p>${esc(p.desc_night)}</p>` : ''}</details>
    <dl class="kv sm">${rows.map(([a, v]) => `<dt>${a}</dt><dd>${v}</dd>`).join('')}</dl>
    <button class="btn ${here ? '' : 'pri'} go" data-ago="${esc(k + ':' + id)}" ${here || !A.on ? 'disabled' : ''}>${here ? 'You are here' : A.on ? 'Go here' : esc(Z.offGo)}</button></div></article>`;
}
// what the line under the map says while {{user}} is in the area
const AZ_WHERE = {
  forest: A => A.tgt ? ` Target: ${A.tgt}${A.res === 'caught' ? ' (caught)' : A.res === 'failed' ? ' (not found)' : ''}.` : '',
  avalon: A => A.muster && !A.muster.missed && A.muster.left > 0 ? ` Muster at the Skyport at ${A.muster.at}: ${A.muster.left} min left, ${A.muster.back} min on foot from here.` : '',
  sunreach: (A, night) => ` ${night ? 'Night: the city is lit until dawn.' : 'Day.'}`,
  hanakaze: A => (A.today || []).length ? ` Next today: ${A.today[0][0]}, ${A.today[0][1]}.` : '',
};
function renderArea(k, S, tabs) {
  const Z = AZ(k), A = ((S.$ui || {}).area || {})[k] || {}, close = `${view.stack.length ? '<button class="btn sm" data-act="back">Back</button>' : ''}<button class="x" data-act="close" aria-label="Close">×</button>`;
  if (Z.kind === 'cards') {   // the airship: no map, the places aboard two minutes apart
    const l = num(A.left, 0), cards = Z.places.map(p => {
      const here = A.at === p.id;
      return `<article class="lc${here ? ' here' : ''}"><div class="in"><h3>${esc(p.name)}${here ? ' <span class="you">You are here</span>' : ''}</h3><p class="vibe">${esc(p.vibe)}</p>
      <details><summary>Description</summary><p>${esc(p.desc)}</p></details>
      <button class="btn ${here ? '' : 'pri'} go" data-ago="${esc(k + ':' + p.id)}" ${here ? 'disabled' : ''}>${here ? 'You are here' : 'Go here (2 min)'}</button></div></article>`;
    }).join('');
    const where = `${esc(A.event || '')}: lands at ${esc(A.lands || '')} at ${esc(A.to || '')} (${l >= 60 ? `${Math.floor(l / 60)}h ${l % 60}m` : `${l} min`} left).${A.view ? ` Outside: ${esc(A.view)}.` : ''}`;
    return `<div class="dlg wide" tabindex="-1"><div class="hd"><h2>${esc(Z.area)}</h2>${close}</div>
    <div class="bd">${tabs}<div class="sub" style="margin:6px 0 10px">${where}</div><div class="car air">${cards}</div></div></div>`;
  }
  const night = azNight(k, S), map = azMap(k, S), pins = azPins(k, S, A), curPin = A.on && A.at ? (azPlace(k, A.at) || {}).pin : '';
  const VA = view.area || (view.area = {}), V = VA[k] || (VA[k] = { pin: '', card: 0, cardPin: '' });
  if (!V.pin || !pins.some(p => p.id === V.pin)) V.pin = curPin || Z.start;
  const pinHTML = pins.map(p => {
    const here = curPin === p.id, sel = V.pin === p.id;
    return `<button class="pin${here ? ' here' : ''}${sel ? ' sel' : ''}" data-apin="${esc(k + ':' + p.id)}" style="left:${p.x}%;top:${p.y}%" aria-label="${esc(p.name)}${here ? ' (you are here)' : ''}" title="${esc(p.name)}"></button>`
      + (sel || here ? `<span class="plab${here ? ' here' : ''}${labPos(p)}" style="left:${p.x}%;top:${p.y}%">${esc(p.name)}</span>` : '');
  }).join('');
  const P = azPin(k, V.pin), ids = P ? Z.places.filter(x => x.pin === P.id && azPlaceOk(k, A, x)).map(x => x.id) : [];
  if (V.cardPin !== V.pin) V.card = Math.max(0, ids.indexOf(A.at));
  V.cardPin = V.pin; V.card = _.clamp(V.card || 0, 0, Math.max(0, ids.length - 1));
  const arrows = ids.length > 1 ? `<div class="cnav"><button class="btn sm" data-acard="${esc(k)}:-1" aria-label="Previous place" ${V.card ? '' : 'disabled'}>‹</button>
    <span class="sub">${V.card + 1} / ${ids.length} · ${esc(azPlace(k, ids[V.card]).name)}</span><button class="btn sm" data-acard="${esc(k)}:1" aria-label="Next place" ${V.card < ids.length - 1 ? '' : 'disabled'}>›</button></div>` : '';
  const sheet = P ? `<h3>${esc(P.name)}</h3>${arrows}<div class="car">${ids.length ? azCard(k, ids[V.card], S, A, night) : ''}</div>` : '';
  const where = A.on ? `You are at ${esc(S.World.Location)}.${esc((AZ_WHERE[k] || (() => ''))(A, night))}` : esc(Z.offText);
  return `<div class="dlg wide" tabindex="-1"><div class="hd"><h2>${esc(Z.area)}</h2>${close}</div>
    <div class="bd">${tabs}<div class="mapwrap"><div><div class="mapbox"><div class="mapview${mapView.z > 1 ? ' zin' : ''}"><div class="map" style="width:${mapView.z * 100}%"><img src="${esc(imgURL(map))}" alt="Map of ${Z.reveal === 'near' ? 'the ' : ''}${esc(Z.area)}${night ? ' at night' : ''}" draggable="false">${pinHTML}</div></div>
    <div class="zoom"><button data-zoom="1" aria-label="Zoom in" title="Zoom in (or the mouse wheel)" ${mapView.z >= ZOOMS[ZOOMS.length - 1] ? 'disabled' : ''}>+</button><button data-zoom="-1" aria-label="Zoom out" title="Zoom out" ${mapView.z <= 1 ? 'disabled' : ''}>−</button></div></div>
    <div class="sub" style="margin:6px 0 10px">${where}</div></div><div class="sheet">${sheet}</div></div></div></div>`;
}

PANELS.map = {
  live: true,
  render(S) {
    // 1.38.0-1.41.0: a tab for each outside area once {{user}} has been there (the airship only during a flight), opened by itself while
    // {{user}} is in it; 1.46.0: one renderer (renderArea)
    const AS = (S.$ui || {}).area || {}, has = k => AZ(k).kind === 'cards' ? !!(AS[k] || {}).on : !!((AS[k] || {}).seen || []).length;
    const maps = [['campus', 'Halvard'], ...['forest', 'avalon', 'sunreach', 'hanakaze', 'airship'].filter(has).map(k => [k, AZ(k).area])];
    const want = view.map || ['airship', 'forest', 'avalon', 'sunreach', 'hanakaze'].find(k => (AS[k] || {}).on) || 'campus', which = maps.some(m => m[0] === want) ? want : 'campus';
    const tabs = maps.length > 1 ? `<div class="tog maps">${maps.map(([k, n]) => `<button data-map="${k}" class="${which === k ? 'on' : ''}">${esc(n)}</button>`).join('')}</div>` : '';
    if (which !== 'campus') return renderArea(which, S, tabs);
    const cur = locIdOf(S.World.Location);
    // a room every dorm shares (Common Rooms, Laundry, Bathhouse) is the player's own dorm's pin
    let curPin = cur ? pinOf(cur) : null;
    if (curPin && !pinShown(curPin, S)) curPin = DATA.pins.find(p => p.cluster[0] === DORM_ID[S.Player.Profile.Dorm]) || null;
    if ((view.pin == null || !DATA.pins.some(p => p.pin === view.pin && pinShown(p, S))) && curPin) view.pin = curPin.pin;
    const pins = DATA.pins.filter(p => pinShown(p, S) && p.cluster.some(id => DATA.locs[id] && discovered(S, DATA.locs[id])));
    const CL = clueLocs(S);
    const pinHTML = pins.map(p => {
      const here = curPin && curPin.pin === p.pin, sel = view.pin === p.pin;
      // 1.25.0: a red dot on a marker whose places hold a story heard but not read yet
      const fresh = p.cluster.some(id => DATA.locs[id] && discovered(S, DATA.locs[id]) && DATA.locs[id].lore.some(x => isNew(`lore:${x.uid}`)));
      const clue = p.cluster.some(id => CL[id] && DATA.locs[id] && discovered(S, DATA.locs[id]));
      return `<button class="pin${here ? ' here' : ''}${sel ? ' sel' : ''}${fresh ? ' new' : ''}${clue ? ' clue' : ''}" data-pin="${p.pin}" style="left:${p.x}%;top:${p.y}%" aria-label="${esc(p.label)}${here ? ' (you are here)' : ''}${clue ? ' (an open mystery thread)' : ''}" title="${esc(p.label)}"></button>`
        + (sel || here ? `<span class="plab${here ? ' here' : ''}${labPos(p)}" style="left:${p.x}%;top:${p.y}%">${esc(p.label)}</span>` : '');
    }).join('');
    let sheet = '<p class="hint">Tap a marker to see what is there.</p>';
    const P = DATA.pins.find(p => p.pin === view.pin && pinShown(p, S));
    if (P) {
      let ids = P.cluster.filter(id => DATA.locs[id] && discovered(S, DATA.locs[id]));
      let tabs = '';
      if (P.tabs) {
        const floors = P.tabs.filter(f => ids.some(id => onFloor(id, f)));
        if (!floors.includes(view.floor)) view.floor = (cur && P.cluster.includes(cur) && floorOf(cur, S)) || floors[1] || floors[0];
        tabs = `<div class="tog fl">${floors.map(f => `<button data-floor="${esc(f)}" class="${view.floor === f ? 'on' : ''}">${esc(f)}${YEAR_OF_FLOOR[f] ? ` <small>Year ${YEAR_OF_FLOOR[f]}</small>` : ''}</button>`).join('')}</div>`;
        ids = ids.filter(id => onFloor(id, view.floor));
      }
      // 1.2.0 (owner): one card at a time with arrow buttons instead of a sideways scroll
      if (view.focusLoc && ids.includes(view.focusLoc)) view.card = ids.indexOf(view.focusLoc);
      else if (view.cardPin !== P.pin + '|' + view.floor) view.card = Math.max(0, ids.indexOf(cur));
      view.focusLoc = ''; view.cardPin = P.pin + '|' + view.floor; view.card = _.clamp(view.card, 0, Math.max(0, ids.length - 1));
      const arrows = ids.length > 1 ? `<div class="cnav"><button class="btn sm" data-card="-1" aria-label="Previous place" ${view.card ? '' : 'disabled'}>‹</button>
        <span class="sub">${view.card + 1} / ${ids.length} · ${esc(nameOn(ids[view.card], view.floor))}</span><button class="btn sm" data-card="1" aria-label="Next place" ${view.card < ids.length - 1 ? '' : 'disabled'}>›</button></div>` : '';
      const th = ids.filter(id => CL[id]).map(id => `${DATA.locs[id].name}: ${CL[id].join(', ')}`);
      sheet = `<h3>${esc(P.label)}</h3>${tabs}${arrows}${th.length ? `<div class="sub"><span class="clueh">?</span> Open on your Mystery Board: ${esc(th.join('; '))}</div>` : ''}<div class="car">${ids.length ? locCard(ids[view.card], S, cur, P) : '<div class="empty">Nothing here you know of yet.</div>'}</div>`;
    }
    return `<div class="dlg wide" tabindex="-1"><div class="hd"><h2>Halvard</h2>${view.stack.length ? '<button class="btn sm" data-act="back">Back</button>' : ''}<button class="x" data-act="close" aria-label="Close">×</button></div>
      <div class="bd">${tabs}<div class="mapwrap"><div><div class="mapbox"><div class="mapview${mapView.z > 1 ? ' zin' : ''}"><div class="map" style="width:${mapView.z * 100}%"><img src="${esc(imgURL(mapFor(S)))}" alt="Map of Halvard Academy" draggable="false" data-fb="" data-fbclass="mapfb"${mapFor(S) !== DATA.assets.map ? ` data-alt="${esc(imgURL(DATA.assets.map))}"` : ''}>${pinHTML}</div></div>
      <div class="zoom"><button data-zoom="1" aria-label="Zoom in" title="Zoom in (or the mouse wheel)" ${mapView.z >= ZOOMS[ZOOMS.length - 1] ? 'disabled' : ''}>+</button><button data-zoom="-1" aria-label="Zoom out" title="Zoom out" ${mapView.z <= 1 ? 'disabled' : ''}>−</button></div></div>
      <div class="sub" style="margin:6px 0 10px">You are at ${esc(S.World.Location)}.${Object.keys(CL).length ? ' <span class="clueh">?</span> marks a place tied to an open thread on your Mystery Board.' : ''}</div></div><div class="sheet">${sheet}</div></div></div></div>`;
  },
  // 1.24.0: the zoomed map keeps its centre (mapView) through re-renders; drag with the mouse to pan; on touch the view scrolls by
  // itself. 1.24.2 (owner): the mouse wheel zooms (toward the pointer, one step at a time); at 100% scrolling down scrolls the panel
  after() {
    const vw = ov.querySelector('.mapview'); if (!vw) return;
    const place = () => { vw.scrollLeft = mapView.cx * vw.scrollWidth - vw.clientWidth / 2; vw.scrollTop = mapView.cy * vw.scrollHeight - vw.clientHeight / 2; };
    place(); const img = vw.querySelector('img'); if (img && !img.complete) img.addEventListener('load', place, { once: true });
    vw.addEventListener('scroll', () => {
      if (!vw.scrollWidth || mapView.z === 1) return;
      mapView.cx = (vw.scrollLeft + vw.clientWidth / 2) / vw.scrollWidth; mapView.cy = (vw.scrollTop + vw.clientHeight / 2) / vw.scrollHeight;
    }, { passive: true });
    vw.addEventListener('wheel', e => {
      const step = e.deltaY < 0 ? 1 : e.deltaY > 0 ? -1 : 0;
      if (!step || (step < 0 && mapView.z <= 1)) return;
      e.preventDefault();
      if (Date.now() - (zoomMap.at || 0) < 180) return;   // a trackpad sends many small events for one gesture
      const r = vw.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
      zoomMap(step, { fx: (vw.scrollLeft + ox) / vw.scrollWidth, fy: (vw.scrollTop + oy) / vw.scrollHeight, rx: ox / vw.clientWidth, ry: oy / vw.clientHeight });
    }, { passive: false });
    let drag = null;
    vw.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0 && mapView.z > 1) drag = { x: e.clientX, y: e.clientY, l: vw.scrollLeft, t: vw.scrollTop, moved: false }; });
    vw.addEventListener('pointermove', e => {
      if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true; vw.classList.add('drag'); vw.scrollLeft = drag.l - dx; vw.scrollTop = drag.t - dy;
    });
    // a drag that moved is not a click on the pin under the mouse
    vw.addEventListener('pointerup', () => { if (drag && drag.moved) { vw.classList.remove('drag'); vw.addEventListener('click', ev => ev.stopPropagation(), { capture: true, once: true }); } drag = null; });
    vw.addEventListener('pointerleave', () => { if (drag) vw.classList.remove('drag'); drag = null; });
  },
  click(b, S) {
    if (b.dataset.zoom) { zoomMap(+b.dataset.zoom); return; }
    if (b.dataset.map) { view.map = b.dataset.map; mapView.z = 1; mapView.cx = 0.5; mapView.cy = 0.5; render(); return; }
    if (b.dataset.apin) { const [k, id] = b.dataset.apin.split(':'), VA = view.area || (view.area = {}); VA[k] = { pin: id, card: 0, cardPin: '' }; render(); return; }   // 1.46.0: an area's pin
    if (b.dataset.acard) { const [k, d] = b.dataset.acard.split(':'), V = (view.area || {})[k]; if (V) { V.card = (V.card || 0) + +d; render(); } return; }
    if (b.dataset.ago) { const [k, id] = b.dataset.ago.split(':'), p = azPlace(k, id); if (p) fillChat(`I head to ${p.go}.`); return; }
    if (b.dataset.pin) { view.pin = +b.dataset.pin; view.floor = ''; render(); return; }
    if (b.dataset.card) { view.card += +b.dataset.card; render(); return; }
    if (b.dataset.floor) { view.floor = b.dataset.floor; render(); return; }
    if (b.dataset.loc) { const p = pinOf(b.dataset.loc); if (p) { view.pin = p.pin; view.floor = DATA.locs[b.dataset.loc].floor || ''; view.focusLoc = b.dataset.loc; render(); } return; }
    if (b.dataset.go) {   // fillChat: shared helper (30_notebook.js); 1.24.2: a place on each year's floor says which floor
      const l = DATA.locs[b.dataset.go], fl = b.dataset.gofl;
      fillChat(fl && l.fnote ? `I head to the ${l.fnote[fl].replace(/^\w/, ch => ch.toLowerCase())} on ${fl}.` : goText(l.name));
    }
  },
};

// at: the point under the pointer (fraction of the map, fx/fy) stays under it (fraction of the view, rx/ry)
function zoomMap(step, at) {
  const i = ZOOMS.indexOf(mapView.z), z = ZOOMS[_.clamp((i < 0 ? 0 : i) + step, 0, ZOOMS.length - 1)];
  if (z === mapView.z) return;
  zoomMap.at = Date.now();
  if (at) { mapView.cx = at.fx + (0.5 - at.rx) / z; mapView.cy = at.fy + (0.5 - at.ry) / z; }
  mapView.z = z; if (z === 1) { mapView.cx = 0.5; mapView.cy = 0.5; }
  render();
}
// 1.14.0 (planning/DRAFT_dynamic_lore.md [?4]): the place in the current season (data/locations.json seasons, by calendar month)
const seasonLine = (l, S) => { const k = SEASON_OF(((S || {}).World || {}).Month), t = (l.seasons || {})[k]; return t ? `<p class="sub season"><b>${esc(k)}:</b> ${esc(t)}</p>` : ''; };
// 1.24.0 (owner playtest): lore and rumours are heard in the story ($ui.lore: overheard, or named in the narration), not given by the map
const heardSet = S => new Set(((S.$ui || {}).lore || []).map(String));
// the place text names its story ("Home of the Faraway Laugh story."): that sentence waits until the story is heard
const untoldOut = (l, S) => { const heard = heardSet(S), untold = l.lore.filter(x => !heard.has(String(x.uid))).map(x => x.title.replace(/^.* - /, '').replace(/^The /, '').toLowerCase());
  return String(l.description || '').replace(/(\s*)Home of the ([^.;]+?) (?:ghost )?story(\.|;\s*([a-z]))/g,
    (m, sp, nm, end, next) => !untold.includes(nm.trim().toLowerCase()) ? m : next ? sp + next.toUpperCase() : '').trim(); };
function loreRow(l, S) {
  const heard = heardSet(S), known = l.lore.filter(x => heard.has(String(x.uid))), rest = l.lore.length - known.length;
  const more = rest ? `<p class="sub">${known.length ? `${rest} more you have not heard yet.` : 'You have not heard any stories about this place yet.'} People talk; spend time here.</p>` : '';
  const fresh = known.filter(x => isNew(`lore:${x.uid}`, true)).map(x => x.uid);   // 1.25.0: on screen now, so seen after this render
  return `<details${fresh.length ? ' open' : ''}><summary>Lore and rumours (${known.length}/${l.lore.length})${fresh.length ? newsDot() : ''}</summary>${known.map(x => `<p><b>${esc(x.title)}</b>${fresh.includes(x.uid) ? newsDot() : ''}: ${esc(x.summary)}</p>`).join('')}${more}</details>`;
}
function locCard(id, S, cur, P) {
  const l = DATA.locs[id], fl = l.floors && l.floors.includes(view.floor) ? view.floor : '', here = id === cur && (!fl || fl === floorOf(cur, S));
  const ra = (S.$ui || {}).rank_access || {};
  const dorm = /^(Fire|Light|Sky|Viridian) Dormitory$/.exec(l.name);
  const escorted = dorm && (ra.dorms || []).includes(dorm[1]) && !(S.Trip || {}).Active && !/LOCKDOWN|CURFEW/.test((S.World || {})._Curfew || '');
  const visitStaff = (ra.staff || []).filter(n => (l.regulars || []).includes(n));
  const accessText = escorted ? `A trusted resident here can escort you into the common areas. ${l.access || ''}` : visitStaff.length ? `You may visit ${visitStaff.join(', ')} here without an appointment if available. ${l.access || ''}` : l.access || 'Open to students';
  const change = Object.entries((S.Campus_State || {}).Lore_changes || {}).filter(([k, v]) => v && v.Now && normPlace(k) === normPlace(l.name)).map(([, v]) => v.Now);   // 1.60.0
  const B = S.Bonds || {};
  // 1.0.3: graduates and not-yet-arrived students are not regulars. 1.47.0 (audit 3.8): each regular's note is the engine's
  // whereabouts (shared.js): a status on record (Campus_State.NPC_status), off sick, or busy elsewhere this period (a student in class,
  // at Study Hall, voting or at their club; a teacher teaching), the same model <now> uses
  const V = presenceView(DATA.presence, S, f => featureOn(S, f)), pk = placeKey(l.name);
  const note = r => { const w = whereabouts(DATA.presence, V, r); return w.st || (w.sick ? 'off sick' : w.busy && !w.busy[1].includes(pk) ? w.busy[0] : w.rt && w.rt[3] !== pk ? 'usually at ' + w.rt[4] + ' now' : ''); };
  const regIds = id === 'student_council_chamber' ? (((S.Campus_State || {}).Council || {}).Members || []) : l.regulars;
  const regs = regIds.filter(r => atHalvard(r, S) && hauntKnown(r, S)).map(r => (npcOf(r) ? (B[r] ? `<button class="lnk" data-open="npc:${esc(r)}">${esc(nameOf(r, S))}</button>` : esc(nameOf(r, S))) : esc(r))
    + (note(r) ? ` <span class="sub">(${esc(note(r))})</span>` : '')).join(', ');
  // 1.2.0 (owner): every card has the same rows, in the same order. 1.30.6 (owner): no "Connected to" row; the map shows the
  // neighbours, and the AI reads them in the Campus Map lore
  const cwSvcText = (S, id) => { const sv = featureOn(S, 'clubwork') ? (DATA.shop || []).filter(i => i.club && i.loc === id && (i.svc || i.days)) : [];
    return sv.length ? ' · services: ' + esc([...new Set(sv.map(i => `${i.shop} (${cwHours(i)})`))].join('; ')) : ''; };
  const rows = [
    ['Walk', esc(walkText(id, cur, S))], ['Access', esc(accessText)],
    ['Clubs here', esc([...l.clubs.map(c => c.replace(/\s*\(.*\)$/, '')), ...clubsNow(S).filter(c => c.founded && c.venues.includes(id)).map(c => c.name)].join(', ') || 'None') + cwSvcText(S, id)],   // 1.75.0: the founded club; 1.91.0: club services (same rows on every card)
    ['Regulars', regs || '<span class="sub">Nobody you know yet</span>'],
  ];
  // 1.52.0 (feature batch 4): the weekly routines here of people whose Haunts you know (data/npc_routines.json, "usually")
  const usual = Object.entries(DATA.presence.rt || {}).flatMap(([r, rows]) => rows.filter(x => x[3] === pk && atHalvard(r, S) && hauntKnown(r, S))
    .map(x => `${B[r] ? `<button class="lnk" data-open="npc:${esc(r)}">${esc(nameOf(r, S))}</button>` : esc(nameOf(r, S))} <span class="sub">(usually ${esc(x[6])}${x[5] ? ', ' + esc(x[5]) : ''})</span>`));
  if (usual.length && featureOn(S, 'npc_routines')) rows.push(['Usually here', usual.join(', ')]);
  // 1.31.0 (owner-approved planning/DRAFT_restore_places.md): a restful place says what resting there restores; where {{user}} is,
  // with the rate the engine set for now
  const rf = (DATA.restful || {})[id], rn = here && (S.$ui || {}).rest;
  if (rf) rows.push(['Restores', rn ? esc(`${_.capitalize(rf.what)} ×${rn.mult} while resting now${rn.why ? ` (${rn.why}; usually ×${rf.usual})` : ''}`) : esc(rf.sum.replace(/ x(\d)/g, ' ×$1'))]);
  return `<article class="lc${here ? ' here' : ''}" data-loccard="${esc(id)}"><div class="crop" style="${cropStyle(P, S)}"><b>${esc(fl ? nameOn(id, fl) : l.name)}</b>${here ? '<span class="you">You are here</span>' : ''}</div>
    <div class="in">${fl ? `<p class="yrfl"><b>${esc(fl)}</b> · for Year ${YEAR_OF_FLOOR[fl]} students${YEAR_OF_FLOOR[fl] === _.clamp(num(((S.Player || {}).Profile || {}).Year, 1), 1, 3) ? ' · <span class="mine">your year</span>' : ''}</p>` : ''}${l.vibe ? `<p class="vibe">${esc(l.vibe)}</p>` : ''}${seasonLine(l, S)}
    <details><summary>Description</summary><p>${esc(untoldOut(l, S))}</p></details>
    <dl class="kv sm">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
    ${l.lore.length ? loreRow(l, S) : ''}
    ${change.length ? `<div class="warn">Changed: ${change.map(esc).join('; ')}</div>` : ''}
    <button class="btn ${here ? '' : 'pri'} go" data-go="${esc(id)}"${fl ? ` data-gofl="${esc(fl)}"` : ''} ${here ? 'disabled' : ''}>${here ? 'You are here' : 'Go here'}</button></div></article>`;
}
