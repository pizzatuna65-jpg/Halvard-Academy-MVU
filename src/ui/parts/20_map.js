// ================================================================ 4.4 interactive map (D5–D8, D21)
view.pin = null; view.floor = ''; view.focusLoc = ''; view.card = 0;
const CARD_W = 280, CROP_H = 96, CROP_SCALE = 4;
const normPlace = s => String(s || '').split(/\s+[—-]\s+/)[0].trim().toLowerCase().replace(/^the\s+/, '');
const PLACE_ALIAS = { 'main courtyard': 'courtyards', 'courtyard': 'courtyards', 'gatehouse': 'reception_and_gatehouse', 'reception': 'reception_and_gatehouse' };
function locIdOf(place) {
  const p = normPlace(place); if (!p) return '';
  if (PLACE_ALIAS[p] && DATA.locs[PLACE_ALIAS[p]]) return PLACE_ALIAS[p];
  return Object.keys(DATA.locs).find(id => normPlace(DATA.locs[id].name) === p) || Object.keys(DATA.locs).find(id => id.replace(/_/g, ' ') === p) || '';
}
const discovered = (S, l) => !l.discoverable || ((S.$ui || {}).discovered || []).some(d => normPlace(d) === normPlace(l.name));
const pinOf = id => DATA.pins.find(p => p.cluster.includes(id) && p.pin === (DATA.locs[id] || {}).pin) || DATA.pins.find(p => p.cluster.includes(id));
function cropStyle(pin) {
  const Iw = CARD_W * CROP_SCALE, Ih = Iw * DATA.assets.size[1] / DATA.assets.size[0];
  const x = _.clamp(CARD_W / 2 - pin.x / 100 * Iw, CARD_W - Iw, 0), y = _.clamp(CROP_H / 2 - pin.y / 100 * Ih, CROP_H - Ih, 0);
  return `background-image:url('${esc(imgURL(DATA.assets.map))}');background-size:${Iw}px ${Math.round(Ih)}px;background-position:${Math.round(x)}px ${Math.round(y)}px`;
}
const goText = name => `I head to the ${String(name).replace(/^the\s+/i, '')}.`;

// 1.2.0 (owner): walking time from where the player is now, not from the Main Courtyard. Shortest path over the campus
// connections. An edge to or from the Main Courtyard takes the lore's time (Campus Map "Walking times"); any other edge takes the
// larger of the map distance (≈0.15 min per map unit) and the difference of the two places' lore times; rooms of one building
// are a minute apart (plus one per floor), and every castle room reaches every other by the stairs.
const FLOOR_N = f => { const m = /Floor (\d)/.exec(f || ''); return m ? +m[1] : f === 'Undercroft' ? 0 : f ? 6 : 0; };
function pinXY(id, S) {
  const l = DATA.locs[id]; if (!l) return null;
  let p = DATA.pins.find(x => x.pin === l.pin);
  const own = S && S.Player && ({ Fire: 3, Sky: 4, Viridian: 5, Light: 6 })[S.Player.Profile.Dorm];   // shared dorm rooms: your own dorm
  if (own && DATA.pins.some(x => x.pin === own && x.cluster.includes(id))) p = DATA.pins.find(x => x.pin === own);
  return p ? [p.x * 1.5, p.y] : null;
}
function edgeMin(a, b, S) {
  const A = DATA.locs[a], B = DATA.locs[b];
  if (a === 'courtyards' || b === 'courtyards') return Math.max(1, num((a === 'courtyards' ? B : A).walk_min, 5));
  const pa = pinXY(a, S), pb = pinXY(b, S);
  const d = pa && pb ? Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) : 20;
  if (A.pin === B.pin) return Math.max(1 + Math.abs(FLOOR_N(A.floor) - FLOOR_N(B.floor)), Math.abs(num(A.walk_min, 0) - num(B.walk_min, 0)));
  return Math.max(1, Math.round(d * 0.15), Math.abs(num(A.walk_min, 0) - num(B.walk_min, 0)));
}
let _walkMemo = { key: '', dist: null };
function walkFrom(from, S) {
  const key = from + '|' + ((S.Player || {}).Profile || {}).Dorm;
  if (_walkMemo.key === key) return _walkMemo.dist;
  const dist = { [from]: 0 }, done = new Set();
  for (;;) {
    let u = null; for (const k in dist) if (!done.has(k) && (u === null || dist[k] < dist[u])) u = k;
    if (u === null) break; done.add(u);
    const inside = DATA.locs[u] && DATA.locs[u].floor ? DATA.pins.filter(p => p.tabs && p.cluster.includes(u)).flatMap(p => p.cluster) : [];   // castle: stairs, not the courtyard
    for (const v of new Set([...((DATA.locs[u] || {}).connections || []), ...inside])) {
      if (v === u) continue;
      if (!DATA.locs[v]) continue;
      const nd = dist[u] + edgeMin(u, v, S); if (!(v in dist) || nd < dist[v]) dist[v] = nd;
    }
  }
  _walkMemo = { key, dist }; return dist;
}
function walkText(id, cur, S) {
  const l = DATA.locs[id];
  if (id === cur) return 'You are here';
  const t = cur ? walkFrom(cur, S)[id] : undefined;
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
        + (sel || here ? `<span class="plab${here ? ' here' : ''}" style="left:${p.x}%;top:${p.y}%">${esc(p.label)}</span>` : '');
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
      <div class="bd"><div class="mapwrap"><div><div class="map"><img src="${esc(imgURL(DATA.assets.map))}" alt="Map of Halvard Academy" data-fb="" data-fbclass="mapfb">${pinHTML}</div>
      <div class="sub" style="margin:6px 0 10px">You are at ${esc(S.World.Location)}.</div></div><div class="sheet">${sheet}</div></div></div></div>`;
  },
  click(b, S) {
    if (b.dataset.pin) { view.pin = +b.dataset.pin; view.floor = ''; render(); return; }
    if (b.dataset.card) { view.card += +b.dataset.card; render(); return; }
    if (b.dataset.floor) { view.floor = b.dataset.floor; render(); return; }
    if (b.dataset.loc) { const p = pinOf(b.dataset.loc); if (p) { view.pin = p.pin; view.floor = DATA.locs[b.dataset.loc].floor || ''; view.focusLoc = b.dataset.loc; render(); } return; }
    if (b.dataset.go) fillChat(goText(DATA.locs[b.dataset.go].name));   // shared helper (30_notebook.js)
  },
};

function classHint(S) {
  const m = /^P([123]) /.exec((S.World || {})._Period || ''); if (!m || !featureOn(S, 'class')) return '';
  const i = +m[1] - 1, until = ['10:00', '12:00', '16:00'][i], cell = (CAL.TIMETABLE[S.World.Day] || [])[i] || '';
  return /^Study Hall/.test(cell) ? `Study Hall until ${until}` : /^Clubs/.test(cell) ? `at their club until ${until}` : `in class until ${until}`;
}
function locCard(id, S, cur, P) {
  const l = DATA.locs[id], here = id === cur;
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
    ['Walk', esc(walkText(id, cur, S))], ['Access', esc(l.access || 'Open to students')],
    ['Clubs here', esc(l.clubs.map(c => c.replace(/\s*\(.*\)$/, '')).join(', ') || 'None')],
    ['Regulars', regs || '<span class="sub">Nobody you know yet</span>'], ['Connected to', conns || '—'],
  ];
  return `<article class="lc${here ? ' here' : ''}" data-loccard="${esc(id)}"><div class="crop" style="${cropStyle(P)}"><b>${esc(l.name)}</b>${here ? '<span class="you">You are here</span>' : ''}</div>
    <div class="in">${l.vibe ? `<p class="vibe">${esc(l.vibe)}</p>` : ''}
    <details><summary>Description</summary><p>${esc(l.description)}</p></details>
    <dl class="kv sm">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
    ${l.lore.length ? `<details><summary>Lore and rumours (${l.lore.length})</summary>${l.lore.map(x => `<p><b>${esc(x.title)}</b>: ${esc(x.summary)}</p>`).join('')}</details>` : ''}
    ${change.length ? `<div class="warn">Changed: ${change.map(esc).join('; ')}</div>` : ''}
    <button class="btn ${here ? '' : 'pri'} go" data-go="${esc(id)}" ${here ? 'disabled' : ''}>${here ? 'You are here' : 'Go here'}</button></div></article>`;
}
