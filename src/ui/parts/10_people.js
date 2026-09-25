// ================================================================ 4.1 dossier · 4.2 bonds · 4.3 connections
// 1.4.1 (owner, DRAFT_connections.md): seven kinds of line, curated by hand (data/relations_curated.json), plus lines formed in the
// story; romance is only ever with {{user}}. Groups (dorm, club, faction) are label nodes, off until switched on.
// 1.4.2 (owner): Romance is your own line (you → them), empty until a bond turns romantic (Settings: Rank 8 by default)
const EDGE = {
  romance: ['#e8739c', 'Romance'], friends: ['#7fc2a8', 'Friends'], softspot: ['#e8b4c8', 'Soft spot'], protective: ['#5b8fd4', 'Protective'], respect: ['#3f9f69', 'Respect'],
  rivals: ['#e0a24a', 'Rivals'], wary: ['#9b7fd1', 'Wary'], dislike: ['#e0645a', 'Dislike'], story: ['#e8d3a8', 'From the story'],
};
const GROUP = { dorm: ['#c9c5bc', 'Dorms'], club: ['#d9b36a', 'Clubs'], faction: ['#8fb3d9', 'Factions'] };
view.ptab = 'bonds'; view.gtypes = new Set(Object.keys(EDGE)); view.ggroups = new Set(); view.gpos = {};
const YEARW = { 1: 'First-year', 2: 'Second-year', 3: 'Third-year' };
const pips = (p, n = 10) => `<span class="pips" aria-label="${fmt(p)} of ${n}">${_.range(n).map(i => `<i class="${i < Math.floor(p) ? 'on' : ''}"></i>`).join('')}</span>`;
// 1.2.2 bond XP (same formula as the engine, data/bond_rules.json)
const BRU = DATA.bond || { xp_base: [], pace: {} };
const bondNeed = (S, r) => (r >= 10 ? 0 : Math.max(3, Math.round(BRU.xp_base[r] * ((BRU.pace || {})[((S && S.$ui) || {}).bondpace] || 1))));
const xpBar = (b, S) => { const need = bondNeed(S, b.Rank), x = Math.min(num(b.$xp), need);
  return b.Rank >= 10 ? '<span class="sub">max rank</span>' : `<span class="xpb" title="${x} / ${need} XP to Rank ${b.Rank + 1}"><i style="width:${need ? x / need * 100 : 0}%"></i></span><span class="sub">${x}/${need} XP</span>`; };
const bondEvt = (id, S) => (((S && S.$ui) || {}).bev || {})[id];
// 1.3.8 Tension bands (data/tension.json); Althair's Tension is locked at 0 (hostility turns into bond XP)
const TEND = DATA.ten || { bands: [[0, '']], effects: {}, exempt: [], lock: [] };
const tensionBand = t => TEND.bands.reduce((a, [f, nm]) => (num(t) >= f ? nm : a), '');
const tensionTxt = (id, b) => (TEND.lock.includes(id) ? 'Hostility only makes him fonder of you' : `Tension ${b.Tension} · ${tensionBand(b.Tension)}`);
// 1.4.3 Trust bands (data/trust.json) and what low Trust holds back
const TRD = DATA.tru || { bands: [[0, '']], gates: {}, nogates: [], lock: {} };
const trustBand = t => TRD.bands.reduce((a, [f, nm]) => (num(t) >= f ? nm : a), '');
const trustTxt = (id, b) => (id in TRD.lock ? 'Trust fixed: he trusts no one, and needs no one\'s' : `Trust ${b.Trust} · ${trustBand(b.Trust)}`);
const heldBack = (id, b) => (TRD.nogates.includes(id) ? [] : Object.entries(TRD.gates).filter(([g, need]) => +g <= b.Rank && +g !== 8 && b.Trust < need && ((DATA.bond || {}).perks || {})[g]).map(([g, need]) => [g, need, DATA.bond.perks[g]]));
const mini = (v, color) => `<span class="mini"><i style="width:${_.clamp(num(v), 0, 100)}%;background:${color}"></i></span>`;
function whoLine(id, S) {
  const n = npcOf(id); if (!n) return '';
  // 1.0.3: the school year moves with the campaign year; graduates are former students
  const y = S ? Math.min(3, yearNow(id, S)) : n.y;
  const g = n.g.startsWith('Year') ? (S && graduated(S).has(id) ? `Former student, ${n.dm} Dormitory` : `${YEARW[y] || 'Student'}, ${n.dm} Dormitory`) : n.g === 'Staff' ? 'Halvard staff' : n.g;
  return g;
}

PANELS.people = {
  live: true,
  render(S) {
    const tabs = [['bonds', 'Bonds'], ['graph', 'Connections']];
    const body = view.ptab === 'graph' ? peopleGraphHTML(S) : peopleListHTML(S);
    return `<div class="dlg" tabindex="-1"><div class="hd"><h2>People</h2>${view.stack.length ? '<button class="btn sm" data-act="back">Back</button>' : ''}<button class="x" data-act="close" aria-label="Close">×</button></div>
      <nav class="nav">${tabs.map(([id, l]) => `<button data-ptab="${id}" class="${view.ptab === id ? 'on' : ''}">${l}</button>`).join('')}</nav><div class="bd">${body}</div></div>`;
  },
  click(b, S) {
    if (b.dataset.ptab) { view.ptab = b.dataset.ptab; render(); return; }
    if (b.dataset.gtype) { const t = b.dataset.gtype; view.gtypes.has(t) ? view.gtypes.delete(t) : view.gtypes.add(t); render(); }
    if (b.dataset.ggroup) { const t = b.dataset.ggroup; view.ggroups.has(t) ? view.ggroups.delete(t) : view.ggroups.add(t); render(); }
    if (b.dataset.gunpin) { view.gpos = {}; render(); }
  },
  after(S) { if (view.ptab === 'graph') drawGraph(S); },
};

function peopleListHTML(S) {
  const B = S.Bonds || {}, here = Object.keys((S.Scene || {}).Present || {});
  const ids = Object.keys(B).sort((a, b) => (here.includes(b) - here.includes(a)) || (B[b].Rank - B[a].Rank) || (num(B[b].$xp) - num(B[a].$xp)));
  if (!ids.length) return '<div class="empty">You have not met anyone yet.</div>';
  return `<p class="lead">${ids.length} ${ids.length === 1 ? 'person' : 'people'} you have met. Time together fills the bond bar; a full bar opens the bond event that raises the rank.</p>` + ids.map(id => {
    const b = B[id], n = npcOf(id), ev = bondEvt(id, S);
    const badges = [here.includes(id) ? '<span class="pill g">here now</span>' : '', b._Event_ready ? `<span class="pill w">bond event ready${ev && ev.where ? ': ' + esc(ev.where) : ''}</span>` : ev && ev.in ? `<span class="pill">event in ${ev.in} day${ev.in > 1 ? 's' : ''}</span>` : '', b.Romance ? '<span class="pill r">romance</span>' : ''].join('');
    return `<button class="pr" data-open="npc:${esc(id)}">${avatar(id, S, 'av lg')}<span class="pm">
      <span class="pn">${esc(nameOf(id, S, true))}</span><span class="sub">${esc(b.Title || (n ? n.r || whoLine(id, S) : ''))}</span>
      <span class="pb"><span class="rk">Rank ${b.Rank}</span>${xpBar(b, S)}<span class="sub" title="${esc(trustTxt(id, b))}">Trust</span>${mini(b.Trust, '#3f9f69')}<span class="sub" title="${esc(tensionTxt(id, b))}">${TEND.lock.includes(id) ? 'Tension' : esc(tensionBand(b.Tension))}</span>${mini(b.Tension, '#e0645a')}</span>
      <span>${badges}</span></span></button>`;
  }).join('');
}

// ---------------------------------------------------------------- dossier
PANELS.npc = {
  live: true,
  render(S) {
    const id = view.arg, n = npcOf(id), b = (S.Bonds || {})[id], rank = b ? b.Rank : 0;
    const title = n ? nameOf(id, S, true) : id;
    const port = n ? `<img class="por" src="${esc(imgURL(n.p))}" alt="" style="object-position:${n.fc[0]}% ${n.fc[1]}%" data-fb="${esc(knowsName(id, S) ? initials(n.n) : '?')}" data-fbclass="por fb">` : `<span class="por fb">${esc(initials(id))}</span>`;
    let h = `<div class="dos">${port}<div><p class="name">${esc(title)}</p><div class="sub" style="margin:2px 0 8px">${esc([n && knowsName(id, S) && n.r, whoLine(id, S), graduated(S).has(id) && 'Graduated; has left campus'].filter(Boolean).join('. '))}</div>`;
    if (b) {
      const ev = bondEvt(id, S), who = esc(knowsName(id, S) ? id : 'them');
      h += `<div class="bond"><div class="l"><span class="rk">Rank ${b.Rank}</span>${xpBar(b, S)}</div>
        ${b.Title ? `<div style="margin:4px 0">${esc(b.Title)}${b.Romance ? ' <span class="pill r">romance</span>' : ''}</div>` : ''}
        <div class="tt"><span class="sub">${esc(trustTxt(id, b))}</span>${id in TRD.lock ? '' : mini(b.Trust, '#3f9f69')}<span class="sub">${esc(tensionTxt(id, b))}</span>${TEND.lock.includes(id) ? '' : mini(b.Tension, '#e0645a')}</div>
        ${!TEND.exempt.includes(id) && !TEND.lock.includes(id) && b.Tension >= num((TEND.effects || {}).strained_from, 40) ? `<div class="warn">${b.Tension >= num(TEND.effects.stop_xp_from, 90) ? 'This bond cannot grow until the tension eases.' : b.Tension >= num(TEND.effects.hold_event_from, 70) ? 'Too much tension: time together counts for half, and no bond event until it eases below 70.' : 'Tension: time together counts for half until it eases below 40.'}</div>` : ''}
        ${(() => { const hb = heldBack(id, b), bt = trustBand(b.Trust) === 'Betrayed' && !TRD.nogates.includes(id) && !(id in TRD.lock);   // 1.4.3
          return hb.length || bt ? `<div class="warn">${bt ? 'Betrayed: time together counts for half, and they share nothing new. ' : ''}${hb.length ? 'Held back until they trust you more: ' + hb.map(([g, need, p]) => `${esc(youText(p, S))} (Rank ${g}, Trust ${need})`).join('; ') + '.' : ''}</div>` : ''; })()}
        ${b._Event_ready ? `<div class="warn">Bond event ready: find ${who}${ev && ev.where ? ` (likely ${esc(ev.where)}${ev.when ? ', ' + esc(ev.when) : ''})` : ''} and spend time together; Rank ${b.Rank + 1} comes from that scene.</div>`
          : ev && ev.held ? `<div class="hint">${ev.why === 'tension' ? 'The next bond event waits until the tension eases.' : ev.why === 'trust' ? `The next bond event waits until ${who} trusts you more (Trust ${ev.need}).` : 'This bond has gone as far as it can for now.'}</div>`
          : ev ? `<div class="hint">The bar is full. The next bond event can start in ${ev.in} day${ev.in === 1 ? '' : 's'}.</div>` : b.Rank < 10 ? '<div class="hint">Talk, spend time together, give gifts they like, help with what they want: each fills the bar (a talk and a hangout count once a day, gifts twice a week).</div>' : ''}
        ${b.Last_seen ? `<div class="sub">Last seen ${esc(b.Last_seen)}</div>` : ''}</div>`;
    } else h += '<div class="sub">You have not met yet.</div>';
    h += '</div></div>';
    // 1.4.4 (owner): recent moments with you, newest first (engine: Bonds.<id>.$Recent; the narrator reads the same rows in <now>)
    const rec = b ? [...(b.$Recent || [])].reverse() : [];
    if (rec.length) h += `<h3>Recent with you</h3><div class="rtw"><table class="rt"><tr><th>When</th><th>What happened</th><th>Effect</th></tr>${rec.map(r => `<tr><td class="w">${esc(r.w)}</td><td>${esc(youText(r.n, S))}</td><td class="fx">${(r.fx || '').split(', ').filter(Boolean).map(x => `<span class="${/[+→]|romance|enjoyed|starts/.test(x) && !/Tension \+/.test(x) ? 'up' : /Tension −/.test(x) ? 'up' : 'dn'}">${esc(x)}</span>`).join('') || '<span class="sub">—</span>'}</td></tr>`).join('')}</table></div>`;
    if (n) {
      const open = n.fl.filter(f => fieldUnlocked(id, f, S) && !(/^(full )?name$/i.test(f[0]) && !knowsName(id, S)));
      h += open.map(f => `<h3>${esc(f[0])}${f[2] >= 99 ? ' <span class="pill f">uncovered</span>' : ''}</h3><p class="fv">${esc(f[1])}</p>`).join('');
      const locked = _.groupBy(n.fl.filter(f => f[2] < 99 && !fieldUnlocked(id, f, S)), f => f[2]);
      const lk = Object.keys(locked).sort((a, c) => a - c);
      if (lk.length) h += `<h3>Still to learn</h3>${lk.map(r => `<div class="lock">Rank ${r}: ${esc(_.uniq(locked[r].map(f => f[0])).join(', '))}</div>`).join('')}`;
      const views = DATA.rel.filter(e => e[0] === id && e[4] !== 'public' && arrived(e[1], S) && edgeVisible(e, S));
      const pill = t => `<span class="pill" style="border-color:${EDGE[t][0]};color:${EDGE[t][0]}">${EDGE[t][1]}</span>`;
      // 1.4.2: group-rule lines (e[6]) are one row per group: "Mages (43)" rather than 43 rows
      const groups = _.groupBy(views.filter(e => e[6]), e => e[6][0] + '|' + e[2]);
      if (views.length) h += `<h3>How they see others</h3>${views.filter(e => !e[6]).map(e => `<div class="vw"><button class="lnk" data-open="npc:${esc(e[1])}">${esc(nameOf(e[1], S))}</button> ${pill(e[2])}<div class="sub">${esc(e[5][0])}</div></div>`).join('')}` +
        Object.values(groups).map(G => `<div class="vw"><b>${esc(G[0][6][1])}</b> <span class="sub">(${G.length} ${G.length > 1 ? 'people' : 'person'})</span> ${pill(G[0][2])}<div class="sub">${esc(G[0][5][0])}</div></div>`).join('');
    }
    const sec = revealed(S, id);
    if (sec.length) h += `<h3>Secrets uncovered</h3><div>${sec.map(t => `<span class="pill f">${esc(t)}</span>`).join('')}</div>`;
    const facts = b ? [...(b.$Known_old || []), ...(b.Known_facts || [])] : [];   // 5.4: older facts are kept in $Known_old
    if (facts.length) h += `<h3>What you know</h3><ul class="log">${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`;
    if (b && b.Milestones.length) h += `<h3>Milestones</h3><ul class="log">${b.Milestones.map(f => `<li>${esc(f)}</li>`).join('')}</ul>`;
    const st = ((S.Campus_State || {}).NPC_status || {});
    const stKey = Object.keys(st).find(k => k.toLowerCase() === id.toLowerCase());
    if (stKey) h += `<div class="warn">Now: ${esc(st[stKey])}</div>`;
    return `<div class="dlg" tabindex="-1" style="--dc:${n ? n.dc : '#9aa3ad'}"><div class="hd"><h2>Dossier</h2>${view.stack.length ? '<button class="btn sm" data-act="back">Back</button>' : ''}<button class="x" data-act="close" aria-label="Close">×</button></div><div class="bd">${h}</div></div>`;
  },
  click() {},
};

// ---------------------------------------------------------------- connections graph (D3, loaded on demand)
function graphModel(S) {
  const B = S.Bonds || {}, met = Object.keys(B);
  // 1.4.2 (owner): lines are directed, From → To (how From sees To); both sides alike make one line with no arrow
  const links = new Map();
  const add = (a, c, type, note, src) => {
    const k = a + '>' + c;
    const L = links.get(k) || { source: a, target: c, types: new Set(), notes: [] };
    L.types.add(type); if (note && L.notes.length < 4) L.notes.push({ src, note }); links.set(k, L);
  };
  // 1.3.7 (owner): a public line (family, teacher) shows only between people you have both met; someone you have not met appears
  // only through what a bond has told you (their views on others, Rank 5–6)
  // 1.4.2: a group-rule line (e[6]: Caine and mages, views of the Doves) is drawn only to people you have met
  const shown = e => met.includes(e[0]) && arrived(e[1], S) && edgeVisible(e, S) && ((e[4] !== 'public' && !e[6]) || met.includes(e[1]));
  for (const e of DATA.rel) if (shown(e)) for (const t of e[3]) if (view.gtypes.has(t)) add(e[0], e[1], t, e[5][0], e[0]);   // 1.0.3: no incoming students yet
  if (view.gtypes.has('story')) for (const [k, v] of Object.entries((S.Campus_State || {}).New_relations || {})) {
    const [a, c] = k.split(/\s*(?:→|->)\s*/).map(x => (x || '').trim());
    const ida = Object.keys(DATA.npcs).find(i => i.toLowerCase() === (a || '').toLowerCase().split(' ')[0]) || a;
    const idc = Object.keys(DATA.npcs).find(i => i.toLowerCase() === (c || '').toLowerCase().split(' ')[0]) || c;
    if (ida && idc) add(ida, idc, 'story', v, 'story');
  }
  const ids = new Set(met);
  for (const L of links.values()) { ids.add(L.source); ids.add(L.target); }
  const nodes = [{ id: '__you', you: true }, ...[...ids].map(id => ({ id, met: met.includes(id) }))];
  const key = s => [...s].sort().join();
  const out = [];
  for (const L of links.values()) {
    const R = links.get(L.target + '>' + L.source);
    if (R && key(R.types) === key(L.types)) {            // mutual: one plain line, both sides' notes
      if (L.source > L.target) continue;
      L.notes = [...L.notes, ...R.notes.filter(x => !L.notes.some(y => y.note === x.note))].slice(0, 6); L.both = true;
    } else { L.arrow = true; L.bend = !!R; }              // one-way: an arrow at To; two different views bow apart
    out.push({ ...L, types: [...L.types], type: [...L.types].sort((x, y) => Object.keys(EDGE).indexOf(x) - Object.keys(EDGE).indexOf(y))[0] });
  }
  // 1.4.2 (owner): your line to each person takes a kind from the bond (romance, then data/bond_rules.json you_line: Tension,
  // Trust, Rank, Title); a kind switched off falls back to the plain gold bond line
  for (const id of met) {
    const [kind, arrow] = youKind(B[id]), type = kind !== 'bond' && view.gtypes.has(kind) ? kind : 'bond', them = type !== 'bond' && arrow;
    out.push({ source: them ? id : '__you', target: them ? '__you' : id, type, types: [type], arrow: them, mine: true, rank: B[id].Rank, trust: B[id].Trust, tension: B[id].Tension, title: B[id].Title, notes: [] });
  }
  // 1.4.2 (owner): someone who loves you one way (Etnie, Kanae) gets a Romance arrow to you once it is out, until you start a
  // romance with them yourself (then your own line says it)
  if (view.gtypes.has('romance')) for (const id of oneWayLove(S)) out.push({ source: id, target: '__you', type: 'romance', types: ['romance'], arrow: true, bend: true, notes: [{ src: id, note: DATA.rom1[id].note }] });
  // 1.4.1: groups as label nodes joined to their members you have met (and to you, for your own dorm and club)
  for (const [gid, name, members, you] of groupsOf(S)) {
    const who = members.filter(m => met.includes(m));
    if (!who.length && !you) continue;
    nodes.push({ id: 'grp:' + gid, grp: gid.split(':')[0], label: name });
    for (const m of who) out.push({ source: 'grp:' + gid, target: m, type: 'group', grp: gid.split(':')[0], notes: [] });
    if (you) out.push({ source: 'grp:' + gid, target: '__you', type: 'group', grp: gid.split(':')[0], notes: [] });
  }
  return { nodes, links: out };
}
// 1.4.2: [kind, arrow] of your line to someone: romance, else the first you_line rule that holds, else a plain bond
function youKind(b) {
  if (b.Romance) return ['romance', false];
  const r = ((DATA.bond || {}).you_line || []).find(r => (r.tension_from == null || num(b.Tension) >= r.tension_from) && (r.trust_below == null || num(b.Trust) < r.trust_below) &&
    (r.trust_from == null || num(b.Trust) >= r.trust_from) && (r.rank_from == null || num(b.Rank) >= r.rank_from) && (!r.title || new RegExp('\\b' + r.title + '\\b', 'i').test(b.Title || '')));
  return r ? [r.kind, !!r.arrow] : ['bond', false];
}
// 1.4.2: who loves you one way and you know it (data/relations_curated.json romance_one_way): a field that says so is unlocked, or
// one of their secrets on it is revealed; not once your own bond with them is a romance
function oneWayLove(S) {
  const B = S.Bonds || {};
  return Object.entries(DATA.rom1 || {}).filter(([id, R]) => B[id] && !B[id].Romance && (
    (R.field && (npcOf(id) || { fl: [] }).fl.some(f => f[0] === R.field && fieldUnlocked(id, f, S))) ||
    (R.secret && revealed(S, id).some(t => new RegExp(R.secret, 'i').test(t))))).map(([id]) => id);
}
// [id, label, member ids, includes you] for the groups switched on: dorms (students by dorm, Dorm Heads), clubs (members and
// advisors, data/clubs), factions (data/factions.json; a secret faction shows a member only once their secret is out)
function groupsOf(S) {
  const out = [], P = (S.Player || {}).Profile || {};
  if (view.ggroups.has('dorm')) for (const dm of ['Fire', 'Light', 'Sky', 'Viridian']) {
    const m = Object.keys(DATA.npcs).filter(id => (DATA.npcs[id].dm === dm && /^Year/.test(DATA.npcs[id].g)) || (DATA.dormhead || {})[id] === dm);
    out.push(['dorm:' + dm, dm + ' Dormitory', m, P.Dorm === dm]);
  }
  if (view.ggroups.has('club')) for (const c of DATA.clubs || []) {
    const mine = !!P.Club && (String(P.Club).toLowerCase().includes(String(c.key).toLowerCase()) || String(P.Club).toLowerCase() === String(c.name).toLowerCase());
    out.push(['club:' + c.key, c.name, [...(c.members || []), ...(c.advisors || [])], mine]);
  }
  if (view.ggroups.has('faction')) for (const f of DATA.factions || []) {
    const m = f.secret && f.secret.length ? f.members.filter(id => revealed(S, id).some(t => f.secret.includes(String(t).toLowerCase()))) : f.members;
    out.push(['faction:' + f.id, f.name, m, false]);
  }
  return out;
}
function peopleGraphHTML(S) {
  const present = new Set();
  const met = Object.keys(S.Bonds || {});
  for (const e of DATA.rel) if (met.includes(e[0]) && edgeVisible(e, S) && ((e[4] !== 'public' && !e[6]) || met.includes(e[1]))) e[3].forEach(t => present.add(t));
  if (Object.keys((S.Campus_State || {}).New_relations || {}).length) present.add('story');
  const known = present.size;
  for (const id of met) { const k = youKind(S.Bonds[id])[0]; if (k !== 'bond') present.add(k); }   // 1.4.2: your own lines
  // 1.4.2: Romance is always listed; empty until a bond turns romantic (at the rank set in Settings)
  const rr = num((S.$ui || {}).romrank, (DATA.bond || {}).romance_default || 8), roms = met.filter(id => S.Bonds[id].Romance).length + oneWayLove(S).length;
  present.add('romance');
  const romTip = roms ? `${roms} romance${roms > 1 ? 's' : ''}` : rr > 10 ? 'Romance is off (Settings)' : `Empty for now: a romance can begin ${rr ? 'at bond Rank ' + rr : 'at any rank'}`;
  const chips = Object.entries(EDGE).filter(([k]) => present.has(k)).map(([k, [c, l]]) => `<button data-gtype="${k}" class="${view.gtypes.has(k) ? 'on' : ''}" style="--c:${c}" aria-pressed="${view.gtypes.has(k)}"${k === 'romance' ? ` title="${esc(romTip)}"` : ''}>${l}${k === 'romance' && !roms ? ' <span class="sub">(none yet)</span>' : ''}</button>`).join('');
  const groups = Object.entries(GROUP).map(([k, [c, l]]) => `<button data-ggroup="${k}" class="${view.ggroups.has(k) ? 'on' : ''}" style="--c:${c}" aria-pressed="${view.ggroups.has(k)}">${l}</button>`).join('');
  return `<p class="lead">Everyone you have met, around you (your line to each of them is gold, thicker with rank, and takes a colour when it means more: friends, rivals, wary or dislike when their Tension or distrust runs high, pink for a romance). The lines between them appear as you learn them: teachers and mentors once you have met both, and how someone sees the people around them (including people you have not met) at bond Rank 5–6. An arrow shows a one-way view: A → B is how A sees B; a line with no arrow is shared by both.</p>
    <div class="tog gt">${chips}</div>${known ? '' : '<div class="empty">No connections learned yet. Deepen a bond to Rank 5 to learn how someone sees the people around them.</div>'}
    <div class="tog gt" style="margin-top:6px"><span class="sub" style="align-self:center">Groups:</span>${groups}${Object.keys(view.gpos || {}).length ? '<button data-gunpin="1" style="--c:#8e8a82">Reset layout</button>' : ''}</div>
    <div class="graph"><svg class="g" role="img" aria-label="Connections diagram"></svg><div class="gload">Loading the diagram…</div></div>
    <div class="ginfo sub">Tap a line to read what you know about it; tap a person to open their dossier. Drag someone to place them (they stay where you drop them; double-click to let go); pinch or scroll to zoom.</div>`;
}
async function loadD3() {
  if (window.d3) return window.d3;
  if (!loadD3.p) loadD3.p = import('https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm');
  return loadD3.p;
}
async function drawGraph(S) {
  const svgEl = ov.querySelector('svg.g'); if (!svgEl) return;
  let d3;
  try { d3 = await loadD3(); } catch (e) { const l = ov.querySelector('.gload'); if (l) l.textContent = 'The diagram library could not be loaded (needs internet).'; return; }
  if (!svgEl.isConnected) return;
  const ld = ov.querySelector('.gload'); if (ld) ld.remove();
  const W = svgEl.clientWidth || 600, H = svgEl.clientHeight || 450;
  const { nodes, links } = graphModel(S);
  const svg = d3.select(svgEl).attr('viewBox', [-W / 2, -H / 2, W, H]);
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.4, 3]).on('zoom', ev => g.attr('transform', ev.transform))).on('dblclick.zoom', null);   // 1.3.1: no animated zoom (see below)
  const info = ov.querySelector('.ginfo');
  // 1.4.2: one arrowhead per line colour, drawn at the To end of a one-way line
  const defs = svg.append('defs');
  for (const [k, [c]] of Object.entries(EDGE)) defs.append('marker').attr('id', 'eg-arw-' + k).attr('viewBox', '0 -5 10 10').attr('refX', 10).attr('refY', 0)
    .attr('markerWidth', 10).attr('markerHeight', 10).attr('markerUnits', 'userSpaceOnUse').attr('orient', 'auto')
    .append('path').attr('d', 'M0,-4.5L10,0L0,4.5Z').attr('fill', c);
  const lk = g.append('g').selectAll('path').data(links).join('path').attr('fill', 'none')
    .attr('stroke', d => d.type === 'bond' ? themed('#b39062') : d.type === 'group' ? GROUP[d.grp][0] : EDGE[d.type][0])
    .attr('stroke-width', d => d.type === 'bond' ? 1.5 + d.rank * 0.45 : d.mine ? 2.2 + d.rank * 0.45 : d.type === 'romance' ? 2.2 : d.type === 'group' ? 1 : d.type === 'softspot' ? 1.6 : 2.2)
    .attr('stroke-dasharray', d => d.type === 'group' ? '2 4' : d.type === 'softspot' && !d.mine ? '6 3' : null)
    .attr('stroke-opacity', d => d.type === 'bond' ? 0.55 : d.mine || d.type === 'romance' ? 0.85 : d.type === 'group' ? 0.55 : d.type === 'softspot' ? 0.6 : 0.85)
    .attr('marker-end', d => (d.arrow ? `url(#eg-arw-${d.type})` : null)).style('cursor', 'pointer')
    .on('click', (ev, d) => {
      if (!info) return;
      const a = d.source.id || d.source, c = d.target.id || d.target;
      if (d.mine) {   // 1.4.2: your own line, with why it has its kind
        const who = a === '__you' ? c : a, why = d.type === 'bond' ? '' : d.type === 'romance' ? 'romance' : `${EDGE[d.type][1].toLowerCase()}${d.arrow ? ' (how they see you)' : ''}`;
        info.innerHTML = `<b>${d.arrow ? esc(nameOf(who, S)) + ' → You' : 'You and ' + esc(nameOf(who, S))}</b>: ${why ? why + '. ' : ''}Rank ${d.rank}, ${esc(trustTxt(who, { Trust: d.trust }).toLowerCase())}, ${esc(tensionTxt(who, { Tension: d.tension }))}${d.title ? `, "${esc(d.title)}"` : ''}.`; return;
      }
      if (d.type === 'group') { const gn = (d.source.label || ''), who = c === '__you' ? 'You' : nameOf(c, S); info.innerHTML = `<b>${esc(who)}</b>: ${esc(gn)}.`; return; }
      info.innerHTML = `<b>${esc(nameOf(a, S))} ${d.both ? 'and' : '→'} ${c === '__you' ? 'You' : esc(nameOf(c, S))}</b>: ${d.types.map(t => EDGE[t][1].toLowerCase()).join(', ')}${d.both ? ' (both ways)' : ' (one way)'}` +
        d.notes.map(x => `<div style="margin-top:4px">${x.src === 'story' ? '' : `<span class="sub">${esc(nameOf(x.src, S))}'s side:</span> `}${esc(x.note)}</div>`).join('');
    });
  const all = g.append('g').selectAll('g').data(nodes).join('g').style('cursor', 'pointer');
  const gp = all.filter(d => d.grp);   // 1.4.1 group label nodes
  gp.append('rect').attr('rx', 9).attr('height', 18).attr('y', -9).attr('x', d => -(d.label.length * 3.4 + 10)).attr('width', d => d.label.length * 6.8 + 20)
    .attr('fill', themed('#1d2126')).attr('stroke', d => GROUP[d.grp][0]).attr('stroke-width', 1.2);
  gp.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('font-size', 11).attr('fill', d => GROUP[d.grp][0]).text(d => d.label);
  const nd = all.filter(d => !d.grp);
  nd.append('circle').attr('r', d => d.you ? 20 : 17).attr('fill', themed('#1d2126'))
    .attr('stroke', d => d.you ? themed('#b9eadf') : (npcOf(d.id) ? npcOf(d.id).dc : themed('#6f737b'))).attr('stroke-width', d => d.met || d.you ? 2.5 : 1.5)
    .attr('stroke-dasharray', d => d.met || d.you ? null : '3 2');
  nd.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('fill', themed('#cfcbc2')).attr('font-size', 11)
    .text(d => d.you ? 'You' : initials(knowsName(d.id, S) ? (npcOf(d.id) || { n: d.id }).n : '?'));
  const mine = portraitURL(S);   // 1.3.7: the student's picture in your own circle
  nd.filter(d => (d.you && mine) || (!d.you && npcOf(d.id))).append('image').attr('href', d => (d.you ? mine : imgURL(npcOf(d.id).t))).attr('preserveAspectRatio', 'xMidYMid slice').attr('x', -15).attr('y', -15).attr('width', 30).attr('height', 30)
    .style('clip-path', 'circle(50%)').on('error', function () { this.remove(); });
  nd.append('text').attr('text-anchor', 'middle').attr('y', 32).attr('fill', themed('#e6e3dc')).attr('font-size', 12)
    .attr('paint-order', 'stroke').attr('stroke', themed('#1d2126')).attr('stroke-width', 3)
    .text(d => d.you ? (S.Player.Profile.Name || '') : knowsName(d.id, S) ? d.id : (npcOf(d.id) ? '?' : d.id));
  nd.append('title').text(d => d.you ? 'You' : nameOf(d.id, S, true));
  nd.on('click', (ev, d) => { if (!d.you && !ev.defaultPrevented) open('npc:' + d.id); });
  gp.on('click', (ev, d) => { if (info && !ev.defaultPrevented) info.innerHTML = `<b>${esc(d.label)}</b>: ${esc(links.filter(l => l.type === 'group' && (l.source.id || l.source) === d.id).map(l => ((l.target.id || l.target) === '__you' ? 'You' : nameOf(l.target.id || l.target, S))).join(', '))}.`; });
  // 1.3.1 (owner playtest: every dot sat in the middle, stacked). This script runs in Tavern Helper's hidden iframe, where the
  // browser never fires requestAnimationFrame, so d3's own timer never ticked and no node moved from (0, 0). The layout is now
  // computed at once, and dragging steps the simulation with SillyTavern's page frames.
  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.rank != null ? 120 - d.rank * 5 : d.type === 'group' ? 70 : 80).strength(d => (d.type === 'group' ? 0.25 : d.type === 'softspot' ? 0.3 : 0.6)))
    .force('charge', d3.forceManyBody().strength(-260)).force('collide', d3.forceCollide(d => (d.grp ? d.label.length * 3.4 + 14 : 30)))
    .force('x', d3.forceX().strength(d => (d.grp ? 0 : 0.1))).force('y', d3.forceY().strength(d => (d.grp ? 0 : 0.1)))
    // 1.4.1: group labels sit on a ring at the edge, pulled towards their members, never on top of you
    .force('ring', d3.forceRadial(Math.min(W, H) / 2 - 40).strength(d => (d.grp ? 0.9 : 0))).stop();
  const you = nodes[0]; you.fx = 0; you.fy = 0;
  // 1.4.1 (owner: dragged people bounced back like rubber): someone you drop stays there (fx/fy kept, remembered in view.gpos for
  // this panel), double-click lets them go again
  for (const n of nodes) { const p = (view.gpos || {})[n.id]; if (p && !n.you) { n.x = n.fx = p.x; n.y = n.fy = p.y; } }
  // 1.4.2: a one-way line stops at the edge of the circle it points at, so the arrowhead shows; two different views of the
  // same pair bow to either side
  const rad = d => (d.you ? 20 : d.grp ? 0 : 17);
  const pathOf = d => {
    const s = d.source, t = d.target; let x2 = t.x, y2 = t.y;
    const dx = x2 - s.x, dy = y2 - s.y, cx = (s.x + x2) / 2 - (d.bend ? dy * 0.18 : 0), cy = (s.y + y2) / 2 + (d.bend ? dx * 0.18 : 0);
    if (d.arrow) { const l = Math.hypot(x2 - cx, y2 - cy) || 1, r = rad(t) + 2; x2 -= (x2 - cx) / l * r; y2 -= (y2 - cy) / l * r; }
    return d.bend ? `M${s.x},${s.y}Q${cx},${cy} ${x2},${y2}` : `M${s.x},${s.y}L${x2},${y2}`;
  };
  const draw = () => {
    lk.attr('d', pathOf);
    all.attr('transform', d => `translate(${d.x},${d.y})`);   // people and group labels
  };
  for (let i = 0; i < 300; i++) sim.tick();
  draw();
  const PW = PD.defaultView || window, RAF = f => (PW.requestAnimationFrame ? PW.requestAnimationFrame(f) : setTimeout(f, 16));
  let running = false, dragging = false;
  const step = () => {
    if (!svgEl.isConnected) { running = false; return; }
    sim.tick(); draw();
    if (dragging || sim.alpha() > sim.alphaMin()) RAF(step); else running = false;
  };
  const kick = () => { if (!running) { running = true; RAF(step); } };
  all.call(d3.drag().on('start', (ev, d) => { dragging = true; sim.alpha(Math.max(sim.alpha(), 0.1)).alphaTarget(0.05); d.fx = d.x; d.fy = d.y; kick(); })
    .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
    .on('end', (ev, d) => { dragging = false; sim.alphaTarget(0); if (!d.you) (view.gpos = view.gpos || {})[d.id] = { x: d.fx, y: d.fy }; else { d.fx = 0; d.fy = 0; } }));
  all.on('dblclick', (ev, d) => { if (d.you) return; d.fx = null; d.fy = null; delete (view.gpos || {})[d.id]; sim.alpha(0.3); kick(); });
}
