// ================================================================ 4.4 interactive map (D5–D8, D21)
view.pin = null; view.floor = ''; view.focusLoc = ''; view.card = 0;
const CROP_H = 96, CROP_SCALE = 4;
const normPlace = s => String(s || '').split(/\s+[—-]\s+/)[0].trim().toLowerCase().replace(/^the\s+/, '');
// 1.3.1 (owner playtest): the same reading of World.Location as the engine (canonLocation): short names ("Boathouse", "the
// library") via DATA.palias (tools/common.py place_aliases), and a sub-spot that is itself a place wins ("… — Fishing House").
const plSegs = s => String(s || '').split(/\s+[—–-]\s+|,\s+/).map(x => x.trim().toLowerCase().replace(/[.!]+$/, '').replace(/^the\s+/, '')).filter(Boolean);
const sharedLoc = id => DATA.pins.filter(p => p.cluster.includes(id)).length > 1;
function locIdOf(place) {
  const segs = plSegs(place); if (!segs.length) return '';
  const exact = p => Object.keys(DATA.locs).find(id => normPlace(DATA.locs[id].name) === p) || Object.keys(DATA.locs).find(id => id.replace(/_/g, ' ') === p) || '';
  for (let i = segs.length - 1; i >= 0; i--) { const id = exact(segs[i]); if (id && (i === 0 || !sharedLoc(id))) return id; }
  const a = (DATA.palias || {})[segs[0]];
  return a && DATA.locs[a] ? a : '';
}
// 1.24.0 (owner playtest): some far-grounds places show only once the player has been where they lead from (data/locations.json
// gate: Willow Island and the Fishing House after the boathouse, the Clearing after the Forest, the Observation Tower and the Old
// Hut after the Grassy Field), or at the place itself or another place behind the same gate. The Rooftop keeps D21.
const beenAt = (S, name) => normPlace((S.World || {}).Location) === normPlace(name) || ((S.$ui || {}).discovered || []).some(d => normPlace(d) === normPlace(name));
const gateOpen = (S, g) => beenAt(S, DATA.locs[g].name) || Object.values(DATA.locs).some(l => l.gate === g && beenAt(S, l.name));
const discovered = (S, l) => l.discoverable ? beenAt(S, l.name) : !l.gate || beenAt(S, l.name) || gateOpen(S, l.gate);
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
function cropStyle(pin, S) {
  const px = pin.x / 100, py = pin.y / 100, bx = _.clamp((CROP_SCALE * px - 0.5) / (CROP_SCALE - 1), 0, 1) * 100;
  const by = `clamp(100%, calc(${+(py * 100).toFixed(2)}% + ${+(CROP_H / 2 - CROP_H * py).toFixed(1)}px), 0px)`;
  const file = mapFor(S), layers = [file, ...(file !== DATA.assets.map ? [DATA.assets.map] : [])].map(f => `url('${esc(imgURL(f))}')`).join(',');
  return `background-image:${layers};background-size:${CROP_SCALE * 100}% auto;background-position:${+bx.toFixed(2)}% ${by}`;
}
const goText = name => `I head to the ${String(name).replace(/^the\s+/i, '')}.`;

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
  if (id === cur) return 'You are here';
  const t = cur ? walkFrom(cur, S)[id] : undefined;
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

PANELS.map = {
  live: true,
  render(S) {
    const cur = locIdOf(S.World.Location), curPin = cur ? pinOf(cur) : null;
    if (view.pin == null && curPin) view.pin = curPin.pin;
    const pins = DATA.pins.filter(p => p.cluster.some(id => DATA.locs[id] && discovered(S, DATA.locs[id])));
    const pinHTML = pins.map(p => {
      const here = curPin && curPin.pin === p.pin, sel = view.pin === p.pin;
      return `<button class="pin${here ? ' here' : ''}${sel ? ' sel' : ''}" data-pin="${p.pin}" style="left:${p.x}%;top:${p.y}%" aria-label="${esc(p.label)}${here ? ' (you are here)' : ''}" title="${esc(p.label)}"></button>`
        + (sel || here ? `<span class="plab${here ? ' here' : ''}${labPos(p)}" style="left:${p.x}%;top:${p.y}%">${esc(p.label)}</span>` : '');
    }).join('');
    let sheet = '<p class="hint">Tap a marker to see what is there.</p>';
    const P = DATA.pins.find(p => p.pin === view.pin);
    if (P) {
      let ids = P.cluster.filter(id => DATA.locs[id] && discovered(S, DATA.locs[id]));
      let tabs = '';
      if (P.tabs) {
        const floors = P.tabs.filter(f => ids.some(id => DATA.locs[id].floor === f));
        if (!floors.includes(view.floor)) view.floor = (cur && P.cluster.includes(cur) && DATA.locs[cur].floor) || floors[1] || floors[0];
        tabs = `<div class="tog fl">${floors.map(f => `<button data-floor="${esc(f)}" class="${view.floor === f ? 'on' : ''}">${esc(f)}</button>`).join('')}</div>`;
        ids = ids.filter(id => DATA.locs[id].floor === view.floor);
      }
      // 1.2.0 (owner): one card at a time with arrow buttons instead of a sideways scroll
      if (view.focusLoc && ids.includes(view.focusLoc)) view.card = ids.indexOf(view.focusLoc);
      else if (view.cardPin !== P.pin + '|' + view.floor) view.card = Math.max(0, ids.indexOf(cur));
      view.focusLoc = ''; view.cardPin = P.pin + '|' + view.floor; view.card = _.clamp(view.card, 0, Math.max(0, ids.length - 1));
      const arrows = ids.length > 1 ? `<div class="cnav"><button class="btn sm" data-card="-1" aria-label="Previous place" ${view.card ? '' : 'disabled'}>‹</button>
        <span class="sub">${view.card + 1} / ${ids.length} · ${esc(DATA.locs[ids[view.card]].name)}</span><button class="btn sm" data-card="1" aria-label="Next place" ${view.card < ids.length - 1 ? '' : 'disabled'}>›</button></div>` : '';
      sheet = `<h3>${esc(P.label)}</h3>${tabs}${arrows}<div class="car">${ids.length ? locCard(ids[view.card], S, cur, P) : '<div class="empty">Nothing here you know of yet.</div>'}</div>`;
    }
    return `<div class="dlg wide" tabindex="-1"><div class="hd"><h2>Halvard</h2>${view.stack.length ? '<button class="btn sm" data-act="back">Back</button>' : ''}<button class="x" data-act="close" aria-label="Close">×</button></div>
      <div class="bd"><div class="mapwrap"><div><div class="mapbox"><div class="mapview${mapView.z > 1 ? ' zin' : ''}"><div class="map" style="width:${mapView.z * 100}%"><img src="${esc(imgURL(mapFor(S)))}" alt="Map of Halvard Academy" draggable="false" data-fb="" data-fbclass="mapfb"${mapFor(S) !== DATA.assets.map ? ` data-alt="${esc(imgURL(DATA.assets.map))}"` : ''}>${pinHTML}</div></div>
      <div class="zoom"><button data-zoom="1" aria-label="Zoom in" title="Zoom in (or Ctrl + wheel)" ${mapView.z >= ZOOMS[ZOOMS.length - 1] ? 'disabled' : ''}>+</button><button data-zoom="-1" aria-label="Zoom out" title="Zoom out" ${mapView.z <= 1 ? 'disabled' : ''}>−</button></div></div>
      <div class="sub" style="margin:6px 0 10px">You are at ${esc(S.World.Location)}.</div></div><div class="sheet">${sheet}</div></div></div></div>`;
  },
  // 1.24.0: the zoomed map keeps its centre (mapView) through re-renders; drag with the mouse to pan, Ctrl + wheel (or a trackpad
  // pinch) to zoom; on touch the view scrolls by itself
  after() {
    const vw = ov.querySelector('.mapview'); if (!vw) return;
    const place = () => { vw.scrollLeft = mapView.cx * vw.scrollWidth - vw.clientWidth / 2; vw.scrollTop = mapView.cy * vw.scrollHeight - vw.clientHeight / 2; };
    place(); const img = vw.querySelector('img'); if (img && !img.complete) img.addEventListener('load', place, { once: true });
    vw.addEventListener('scroll', () => {
      if (!vw.scrollWidth || mapView.z === 1) return;
      mapView.cx = (vw.scrollLeft + vw.clientWidth / 2) / vw.scrollWidth; mapView.cy = (vw.scrollTop + vw.clientHeight / 2) / vw.scrollHeight;
    }, { passive: true });
    vw.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); zoomMap(e.deltaY < 0 ? 1 : -1); }, { passive: false });
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
    if (b.dataset.pin) { view.pin = +b.dataset.pin; view.floor = ''; render(); return; }
    if (b.dataset.card) { view.card += +b.dataset.card; render(); return; }
    if (b.dataset.floor) { view.floor = b.dataset.floor; render(); return; }
    if (b.dataset.loc) { const p = pinOf(b.dataset.loc); if (p) { view.pin = p.pin; view.floor = DATA.locs[b.dataset.loc].floor || ''; view.focusLoc = b.dataset.loc; render(); } return; }
    if (b.dataset.go) fillChat(goText(DATA.locs[b.dataset.go].name));   // shared helper (30_notebook.js)
  },
};

function zoomMap(step) {
  const i = ZOOMS.indexOf(mapView.z), z = ZOOMS[_.clamp((i < 0 ? 0 : i) + step, 0, ZOOMS.length - 1)];
  if (z === mapView.z) return;
  mapView.z = z; if (z === 1) { mapView.cx = 0.5; mapView.cy = 0.5; }
  render();
}
function classHint(S) {
  const m = /^P([123]) /.exec((S.World || {})._Period || ''); if (!m || !featureOn(S, 'class')) return '';
  const i = +m[1] - 1, until = ['10:00', '12:00', '16:00'][i], cell = (CAL.timetableFor(S.World) || [])[i] || '';
  return /^Study Hall/.test(cell) ? `Study Hall until ${until}` : /^Clubs/.test(cell) ? `at their club until ${until}` : `in class until ${until}`;
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
  return `<details><summary>Lore and rumours (${known.length}/${l.lore.length})</summary>${known.map(x => `<p><b>${esc(x.title)}</b>: ${esc(x.summary)}</p>`).join('')}${more}</details>`;
}
function locCard(id, S, cur, P) {
  const l = DATA.locs[id], here = id === cur;
  const ra = (S.$ui || {}).rank_access || {};
  const dorm = /^(Fire|Light|Sky|Viridian) Dormitory$/.exec(l.name);
  const escorted = dorm && (ra.dorms || []).includes(dorm[1]) && !(S.Trip || {}).Active && !/LOCKDOWN|CURFEW/.test((S.World || {})._Curfew || '');
  const visitStaff = (ra.staff || []).filter(n => (l.regulars || []).includes(n));
  const accessText = escorted ? `A trusted resident here can escort you into the common areas. ${l.access || ''}` : visitStaff.length ? `You may visit ${visitStaff.join(', ')} here without an appointment if available. ${l.access || ''}` : l.access || 'Open to students';
  const change = Object.entries((S.Campus_State || {}).Location_changes || {}).filter(([k]) => normPlace(k) === normPlace(l.name)).map(([, v]) => v);
  const B = S.Bonds || {};
  const stOf = npcStatus(S);   // v1.0.3 (F02): Campus_State.NPC_status beats the lorebook's habits
  // 1.0.3: graduates and not-yet-arrived students are not regulars
  const busy = classHint(S);   // 1.1.0 (spec §1): students are in class / Study Hall / at their clubs during the periods
  const regs = l.regulars.filter(r => atHalvard(r, S) && hauntKnown(r, S)).map(r => (npcOf(r) ? (B[r] ? `<button class="lnk" data-open="npc:${esc(r)}">${esc(nameOf(r, S))}</button>` : esc(nameOf(r, S))) : esc(r))
    + (stOf(r) ? ` <span class="sub">(${esc(stOf(r))})</span>` : busy && /^Year/.test((npcOf(r) || {}).g || '') ? ` <span class="sub">(${busy})</span>` : '')).join(', ');
  const conns = l.connections.filter(c => DATA.locs[c] && discovered(S, DATA.locs[c])).map(c => `<button class="lnk" data-loc="${esc(c)}">${esc(DATA.locs[c].name)}</button>`).join(', ');
  // 1.2.0 (owner): every card has the same rows, in the same order
  const rows = [
    ['Walk', esc(walkText(id, cur, S))], ['Access', esc(accessText)],
    ['Clubs here', esc(l.clubs.map(c => c.replace(/\s*\(.*\)$/, '')).join(', ') || 'None')],
    ['Regulars', regs || '<span class="sub">Nobody you know yet</span>'], ['Connected to', conns || '—'],
  ];
  return `<article class="lc${here ? ' here' : ''}" data-loccard="${esc(id)}"><div class="crop" style="${cropStyle(P, S)}"><b>${esc(l.name)}</b>${here ? '<span class="you">You are here</span>' : ''}</div>
    <div class="in">${l.vibe ? `<p class="vibe">${esc(l.vibe)}</p>` : ''}${seasonLine(l, S)}
    <details><summary>Description</summary><p>${esc(untoldOut(l, S))}</p></details>
    <dl class="kv sm">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
    ${l.lore.length ? loreRow(l, S) : ''}
    ${change.length ? `<div class="warn">Changed: ${change.map(esc).join('; ')}</div>` : ''}
    <button class="btn ${here ? '' : 'pri'} go" data-go="${esc(id)}" ${here ? 'disabled' : ''}>${here ? 'You are here' : 'Go here'}</button></div></article>`;
}
