// ================================================================ 4.4 interactive map (D5–D8, D21)
view.pin = null; view.floor = ''; view.focusLoc = ''; view.card = 0;
const CARD_W = 280, CROP_H = 96, CROP_SCALE = 4;
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
const discovered = (S, l) => !l.discoverable || ((S.$ui || {}).discovered || []).some(d => normPlace(d) === normPlace(l.name));
const pinOf = id => DATA.pins.find(p => p.cluster.includes(id) && p.pin === (DATA.locs[id] || {}).pin) || DATA.pins.find(p => p.cluster.includes(id));
function cropStyle(pin) {
  const Iw = CARD_W * CROP_SCALE, Ih = Iw * DATA.assets.size[1] / DATA.assets.size[0];
  const x = _.clamp(CARD_W / 2 - pin.x / 100 * Iw, CARD_W - Iw, 0), y = _.clamp(CROP_H / 2 - pin.y / 100 * Ih, CROP_H - Ih, 0);
  return `background-image:url('${esc(imgURL(DATA.assets.map))}');background-size:${Iw}px ${Math.round(Ih)}px;background-position:${Math.round(x)}px ${Math.round(y)}px`;
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
