// ================================================================ 4.1 dossier · 4.2 bonds · 4.3 connections
const EDGE = {
  family: ['#c79a5a', 'Family'], romance: ['#e07aa0', 'Romance'], rival: ['#e0645a', 'Rivals'], fear: ['#9b7fd1', 'Fear'],
  dislike: ['#d07a4f', 'Dislike'], mentor: ['#5b8fd4', 'Mentor'], respect: ['#3f9f69', 'Respect'], friend: ['#7fc2a8', 'Friends'],
  knows: ['#7a7f88', 'Acquainted'], story: ['#e8d3a8', 'From the story'],
};
view.ptab = 'bonds'; view.gtypes = new Set(Object.keys(EDGE).filter(k => k !== 'knows'));
const YEARW = { 1: 'First-year', 2: 'Second-year', 3: 'Third-year' };
const pips = (p, n = 10) => `<span class="pips" aria-label="${fmt(p)} of ${n}">${_.range(n).map(i => `<i class="${i < Math.floor(p) ? 'on' : ''}"></i>`).join('')}</span>`;
// 1.2.2 bond XP (same formula as the engine, data/bond_rules.json)
const BRU = DATA.bond || { xp_base: [], pace: {} };
const bondNeed = (S, r) => (r >= 10 ? 0 : Math.max(3, Math.round(BRU.xp_base[r] * ((BRU.pace || {})[((S && S.$ui) || {}).bondpace] || 1))));
const xpBar = (b, S) => { const need = bondNeed(S, b.Rank), x = Math.min(num(b.$xp), need);
  return b.Rank >= 10 ? '<span class="sub">max rank</span>' : `<span class="xpb" title="${x} / ${need} XP to Rank ${b.Rank + 1}"><i style="width:${need ? x / need * 100 : 0}%"></i></span><span class="sub">${x}/${need} XP</span>`; };
const bondEvt = (id, S) => (((S && S.$ui) || {}).bev || {})[id];
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
      <span class="pb"><span class="rk">Rank ${b.Rank}</span>${xpBar(b, S)}<span class="sub">Trust</span>${mini(b.Trust, '#3f9f69')}<span class="sub">Tension</span>${mini(b.Tension, '#e0645a')}</span>
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
        <div class="tt"><span class="sub">Trust ${b.Trust}</span>${mini(b.Trust, '#3f9f69')}<span class="sub">Tension ${b.Tension}</span>${mini(b.Tension, '#e0645a')}</div>
        ${b._Event_ready ? `<div class="warn">Bond event ready: find ${who}${ev && ev.where ? ` (likely ${esc(ev.where)}${ev.when ? ', ' + esc(ev.when) : ''})` : ''} and spend time together; Rank ${b.Rank + 1} comes from that scene.</div>`
          : ev && ev.held ? '<div class="hint">This bond has gone as far as it can for now.</div>'
          : ev ? `<div class="hint">The bar is full. The next bond event can start in ${ev.in} day${ev.in === 1 ? '' : 's'}.</div>` : b.Rank < 10 ? '<div class="hint">Talk, spend time together, give gifts they like, help with what they want: each fills the bar (a talk and a hangout count once a day, gifts twice a week).</div>' : ''}
        ${b.Last_seen ? `<div class="sub">Last seen ${esc(b.Last_seen)}</div>` : ''}</div>`;
    } else h += '<div class="sub">You have not met yet.</div>';
    h += '</div></div>';
    if (n) {
      const open = n.fl.filter(f => fieldUnlocked(id, f, S) && !(/^(full )?name$/i.test(f[0]) && !knowsName(id, S)));
      h += open.map(f => `<h3>${esc(f[0])}${f[2] >= 99 ? ' <span class="pill f">uncovered</span>' : ''}</h3><p class="fv">${esc(f[1])}</p>`).join('');
      const locked = _.groupBy(n.fl.filter(f => f[2] < 99 && !fieldUnlocked(id, f, S)), f => f[2]);
      const lk = Object.keys(locked).sort((a, c) => a - c);
      if (lk.length) h += `<h3>Still to learn</h3>${lk.map(r => `<div class="lock">Rank ${r}: ${esc(_.uniq(locked[r].map(f => f[0])).join(', '))}</div>`).join('')}`;
      const views = DATA.rel.filter(e => e[0] === id && e[4] !== 'public' && arrived(e[1], S) && edgeVisible(e, S));
      if (views.length) h += `<h3>How they see others</h3>${views.map(e => `<div class="vw"><button class="lnk" data-open="npc:${esc(e[1])}">${esc(nameOf(e[1], S))}</button> <span class="pill" style="border-color:${EDGE[e[2]][0]};color:${EDGE[e[2]][0]}">${EDGE[e[2]][1]}</span><div class="sub">${esc(e[5][0])}</div></div>`).join('')}`;
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
  const links = new Map();
  const add = (a, c, type, note, src) => {
    const k = [a, c].sort().join('|');
    const L = links.get(k) || { source: a, target: c, types: new Set(), notes: [] };
    L.types.add(type); if (note && L.notes.length < 4) L.notes.push({ src, note }); links.set(k, L);
  };
  for (const e of DATA.rel) if (met.includes(e[0]) && arrived(e[1], S) && edgeVisible(e, S)) for (const t of e[3]) if (view.gtypes.has(t)) add(e[0], e[1], t, e[5][0], e[0]);   // 1.0.3: no incoming students yet
  if (view.gtypes.has('story')) for (const [k, v] of Object.entries((S.Campus_State || {}).New_relations || {})) {
    const [a, c] = k.split(/\s*(?:→|->)\s*/).map(x => (x || '').trim());
    const ida = Object.keys(DATA.npcs).find(i => i.toLowerCase() === (a || '').toLowerCase().split(' ')[0]) || a;
    const idc = Object.keys(DATA.npcs).find(i => i.toLowerCase() === (c || '').toLowerCase().split(' ')[0]) || c;
    if (ida && idc) add(ida, idc, 'story', v, 'story');
  }
  const ids = new Set(met);
  for (const L of links.values()) { ids.add(L.source); ids.add(L.target); }
  const nodes = [{ id: '__you', you: true }, ...[...ids].map(id => ({ id, met: met.includes(id) }))];
  const out = [...links.values()].map(L => ({ ...L, types: [...L.types], type: [...L.types].sort((x, y) => Object.keys(EDGE).indexOf(x) - Object.keys(EDGE).indexOf(y))[0] }));
  for (const id of met) out.push({ source: '__you', target: id, type: 'bond', rank: B[id].Rank, trust: B[id].Trust, tension: B[id].Tension, notes: [] });
  return { nodes, links: out };
}
function peopleGraphHTML(S) {
  const present = new Set();
  for (const e of DATA.rel) if (Object.keys(S.Bonds || {}).includes(e[0]) && edgeVisible(e, S)) e[3].forEach(t => present.add(t));
  if (Object.keys((S.Campus_State || {}).New_relations || {}).length) present.add('story');
  const chips = Object.entries(EDGE).filter(([k]) => present.has(k)).map(([k, [c, l]]) => `<button data-gtype="${k}" class="${view.gtypes.has(k) ? 'on' : ''}" style="--c:${c}" aria-pressed="${view.gtypes.has(k)}">${l}</button>`).join('');
  return `<p class="lead">Who you know, and what you have learned about how they relate to each other. Their views on others open up at bond Rank 5–6; family and teachers are common knowledge.</p>
    ${chips ? `<div class="tog gt">${chips}</div>` : '<div class="empty">No connections learned yet. Deepen a bond to Rank 5 to learn how someone sees the people around them.</div>'}
    <div class="graph"><svg class="g" role="img" aria-label="Connections diagram"></svg><div class="gload">Loading the diagram…</div></div>
    <div class="ginfo sub">Tap a line to read what you know about it; tap a person to open their dossier. Drag to rearrange, pinch or scroll to zoom.</div>`;
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
  svg.call(d3.zoom().scaleExtent([0.4, 3]).on('zoom', ev => g.attr('transform', ev.transform)));
  const info = ov.querySelector('.ginfo');
  const lk = g.append('g').selectAll('line').data(links).join('line')
    .attr('stroke', d => d.type === 'bond' ? '#b39062' : EDGE[d.type][0])
    .attr('stroke-width', d => d.type === 'bond' ? 1.5 + d.rank * 0.45 : 2.2)
    .attr('stroke-dasharray', d => d.type === 'knows' ? '4 4' : null)
    .attr('stroke-opacity', d => d.type === 'bond' ? 0.55 : 0.85).style('cursor', 'pointer')
    .on('click', (ev, d) => {
      if (!info) return;
      const a = d.source.id || d.source, c = d.target.id || d.target;
      if (d.type === 'bond') { info.innerHTML = `<b>You and ${esc(nameOf(c, S))}</b>: Rank ${d.rank}, trust ${d.trust}, tension ${d.tension}.`; return; }
      info.innerHTML = `<b>${esc(nameOf(a, S))} and ${esc(nameOf(c, S))}</b>: ${d.types.map(t => EDGE[t][1].toLowerCase()).join(', ')}` +
        d.notes.map(x => `<div style="margin-top:4px">${x.src === 'story' ? '' : `<span class="sub">${esc(nameOf(x.src, S))}'s side:</span> `}${esc(x.note)}</div>`).join('');
    });
  const nd = g.append('g').selectAll('g').data(nodes).join('g').style('cursor', 'pointer');
  nd.append('circle').attr('r', d => d.you ? 20 : 17).attr('fill', '#1d2126')
    .attr('stroke', d => d.you ? '#b9eadf' : (npcOf(d.id) ? npcOf(d.id).dc : '#6f737b')).attr('stroke-width', d => d.met || d.you ? 2.5 : 1.5)
    .attr('stroke-dasharray', d => d.met || d.you ? null : '3 2');
  nd.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('fill', '#cfcbc2').attr('font-size', 11)
    .text(d => d.you ? 'You' : initials(knowsName(d.id, S) ? (npcOf(d.id) || { n: d.id }).n : '?'));
  nd.filter(d => !d.you && npcOf(d.id)).append('image').attr('href', d => imgURL(npcOf(d.id).t)).attr('x', -15).attr('y', -15).attr('width', 30).attr('height', 30)
    .style('clip-path', 'circle(50%)').on('error', function () { this.remove(); });
  nd.append('text').attr('text-anchor', 'middle').attr('y', 32).attr('fill', '#e6e3dc').attr('font-size', 12)
    .attr('paint-order', 'stroke').attr('stroke', '#1d2126').attr('stroke-width', 3)
    .text(d => d.you ? (S.Player.Profile.Name || '') : knowsName(d.id, S) ? d.id : (npcOf(d.id) ? '?' : d.id));
  nd.append('title').text(d => d.you ? 'You' : nameOf(d.id, S, true));
  nd.on('click', (ev, d) => { if (!d.you && !ev.defaultPrevented) open('npc:' + d.id); });
  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.type === 'bond' ? 120 - d.rank * 5 : 80))
    .force('charge', d3.forceManyBody().strength(-260)).force('collide', d3.forceCollide(30)).force('x', d3.forceX()).force('y', d3.forceY());
  const you = nodes[0]; you.fx = 0; you.fy = 0;
  nd.call(d3.drag().on('start', (ev, d) => { if (!ev.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
    .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; }).on('end', (ev, d) => { if (!ev.active) sim.alphaTarget(0); if (!d.you) { d.fx = null; d.fy = null; } }));
  sim.on('tick', () => {
    lk.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    nd.attr('transform', d => `translate(${d.x},${d.y})`);
  });
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { sim.stop(); for (let i = 0; i < 300; i++) sim.tick(); sim.on('tick')(); }
}
