// ================================================================ 5.2 Activities: Clubs, Competition, Shop, Projects, Trip (F18, F19) + Battle panel
view.act = 'clubs'; view.shop = 'All';
const ACT_TABS = [['clubs', 'Clubs'], ['competition', 'Competition', 'competition', ['competition']], ['shop', 'Shop'], ['projects', 'Projects', 'projects', ['projects']], ['trip', 'Trips', 'trip', ['trip']]];
const ROLES5 = ['Attack', 'Defense', 'Healing', 'Support', 'Control'];
const COMP_TIERS = [
  ['Dorm', 'Dorm Competition', 'Solo, open to the whole dorm, run as a ranking tournament so everyone finishes with a placement. The top 16 of each dorm qualify.'],
  ['Academy', 'Academy Competition', 'Qualifiers from all four dorms form teams of 4 with at least one student from each year, covering the combat roles between them. Knockout; the winning team represents Halvard.'],
  ['Kingdom', 'Kingdom Competition', 'One team per academy, four in all, knockout. Each member of the winning team earns 5,000 points.'],
  ['World', 'World Competition', 'Abroad. A panel picks the national four from the best individuals of the Kingdom Competition, winners and losers alike. Being picked off a losing team is a great honour.'],
];
const clubOf = S => { const c = String(((S.Player || {}).Profile || {}).Club || '').toLowerCase(); return c ? (DATA.clubs || []).find(x => c.includes(x.key.toLowerCase())) : null; };
const eventDay = rx => { const e = CAL.EVENTS.find(x => rx.test(x.t)); return e ? { e, di: dayIdx(e.m, e.w, e.d[0]) } : null; };
const daysTo = (S, di) => di - dayIdx(S.World.Month, S.World.Week, S.World.Day);
const whenLabel = n => n < 0 ? 'past' : relDay(n);
const clubFieldOpen = (id, S) => { const n = npcOf(id); const f = n && n.fl.find(x => x[0].toLowerCase() === 'club'); return !!(f && fieldUnlocked(id, f, S)); };
const hereIs = (S, lid) => !!lid && locIdOf(S.World.Location) === lid;
const aan = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

PANELS.activities = {
  live: true,
  render(S) {
    if (view.arg && ACT_TABS.some(t => t[0] === view.arg)) { view.act = view.arg; view.arg = ''; }
    const tabs = ACT_TABS.filter(t => unlockedTab(S, t) && (t[0] !== 'shop' || shopsHere(S).length));
    if (!tabs.some(t => t[0] === view.act)) view.act = 'clubs';
    const body = ({ clubs: acClubs, competition: acCompetition, shop: acShop, projects: acProjects, trip: acTrip })[view.act](S);
    return `<div class="dlg wide" tabindex="-1"><div class="hd"><h2>Activities</h2>${view.stack.length ? '<button class="btn sm" data-act="back">Back</button>' : ''}<button class="x" data-act="close" aria-label="Close">×</button></div>
      <nav class="nav">${tabs.map(([id, l]) => `<button data-actab="${id}" class="${view.act === id ? 'on' : ''}">${l}</button>`).join('')}</nav><div class="bd">${body}</div></div>`;
  },
  click(b) {
    if (b.dataset.actab) { view.act = b.dataset.actab; render(); ov.querySelector('.bd').scrollTop = 0; return; }
    if (b.dataset.shop) { view.shop = b.dataset.shop; render(); return; }
    if (b.dataset.go) { const l = DATA.locs[b.dataset.go]; if (l) fillChat(goText(l.name)); return; }
    if (b.dataset.fill) fillChat(b.dataset.fill);
  },
};

// ---------------------------------------------------------------- clubs
function acClubs(S) {
  const mine = clubOf(S), P = S.Player.Profile, fest = eventDay(/^Club Festival/);
  const venueNames = c => c.venues.map(v => (DATA.locs[v] || { name: v }).name);
  const people = (c, withFollowers) => {
    // 1.0.3: graduates have left their clubs; incoming first-years are not members before they arrive
    const ids = [...c.advisors, ...c.members.filter(m => !c.advisors.includes(m)), ...(withFollowers ? c.follows || [] : [])].filter(id => atHalvard(id, S));
    const known = ids.filter(id => clubFieldOpen(id, S) || (withFollowers && (c.follows || []).includes(id)));
    const more = ids.length - known.length;
    return `${known.map(id => `<button class="who" data-open="npc:${esc(id)}">${avatar(id, S, 'av xs')}<span>${esc(nameOf(id, S))}${c.advisors.includes(id) ? ' (advisor)' : (c.follows || []).includes(id) ? ' (followed you in)' : ''}</span></button>`).join('')}${more > 0 ? `<span class="sub">+${more} you have not placed yet</span>` : ''}`;
  };
  const meets = c => `Meets Saturday 13:00–16:00${c.practice ? '; also practises informally after 16:00 on other days' : ''}.${c.sport ? ' Magic is banned during play.' : ''}`;
  let h = '';
  if (mine) {
    const v0 = mine.venues[0];
    h += `<div class="item mine"><div class="row"><span class="t">${esc(mine.name)}</span><span class="pill g">your club</span></div>
      <div class="sub">${esc(venueNames(mine).join(' · '))}</div><div>${esc(meets(mine))}</div><div class="meta">${people(mine, true)}</div>
      <div class="meta">${v0 && !hereIs(S, v0) ? `<button class="btn sm" data-go="${esc(v0)}">Go to the club</button>` : ''}
      <button class="btn sm" data-fill="${esc(`I spend the afternoon at the ${mine.name}: `)}">Club time</button></div></div>`;
  } else if (P.Club) h += `<div class="item mine"><div class="row"><span class="t">${esc(P.Club)}</span><span class="pill g">your club</span></div><div class="sub">A club not in the directory, founded or found in play.</div></div>`;
  else h += `<p class="lead">You have not joined a club. Clubs are the one place the four magic types mix freely, because recruitment happens before dorm loyalty settles.</p>`;
  if (fest) { const n = daysTo(S, fest.di); if (n >= -1 && n <= 21) h += `<div class="warn">Club Festival ${n < 0 ? 'was yesterday' : n === 0 ? 'is today' : `in ${n} days`} (M3 W2, Fri afternoon and Sat): every club runs a stand in the Main Courtyard; one gold coin each to vote for the best stand.</div>`; }
  h += `<h3>Directory</h3><div class="clubs">${(DATA.clubs || []).filter(c => c !== mine).map(c => `<div class="club"><b>${esc(c.name)}</b><div class="sub">${esc(venueNames(c).join(' · '))}${c.sport ? ' · sport, no magic in play' : ''}</div>
    <div class="meta">${people(c, false)}</div>
    <div class="meta">${!P.Club ? `<button class="btn sm" data-fill="${esc(`I go to the ${c.name} at ${venueNames(c)[0]} and ask about joining.`)}">Ask to join</button>` : ''}${c.venues[0] && !hereIs(S, c.venues[0]) ? `<button class="btn sm" data-go="${esc(c.venues[0])}">Go</button>` : ''}</div></div>`).join('')}</div>
    <h3>Found your own</h3><p class="hint">A new club needs a teaching staff signature and five members; one teacher is responsible for it. The Student Council allocates rooms, and a new club gets whatever is left.</p>
    <button class="btn sm" data-fill="I want to found a new club: ">Start a club in the story</button>`;
  return h;
}

// ---------------------------------------------------------------- competition
function acCompetition(S) {
  const Co = S.Competition || {}, P = S.Player.Profile;
  const dates = { Dorm: eventDay(/^Dorm Competition/), Academy: eventDay(/^Academy Competition/), Kingdom: eventDay(/^Kingdom Competition/), World: eventDay(/World Competition/) };
  const idx = COMP_TIERS.findIndex(t => t[0] === Co.Tier);
  const status = Co.Status ? `<div class="item"><div class="row"><span class="t">${esc(Co.Tier ? Co.Tier + ' Competition' : 'Competition')}</span><span class="pill ${Co.Status === 'eliminated' ? 'f' : /champion|selected|qualified/.test(Co.Status) ? 'g' : 'w'}">${esc(Co.Status)}</span></div>
    ${Co.Placement ? `<div>Placement: <b>${esc(Co.Placement)}</b></div>` : ''}${(Co.Results || []).length ? `<ul class="log">${Co.Results.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}</div>`
    : `<p class="lead">You have not entered yet. Losing at any tier ends your competitive year; World selection is the one tier that is chosen, not won.</p>`;
  const ladder = COMP_TIERS.map(([k, name, desc], i) => {
    const d = dates[k], n = d ? daysTo(S, d.di) : null;
    const cls = i === idx ? (Co.Status === 'eliminated' ? 'out' : 'on') : i < idx ? 'done' : '';
    return `<li class="${cls}"><b>${esc(name)}</b>${d ? ` <span class="sub">M${d.e.m} W${d.e.w} ${d.e.d[0]}${n != null ? ` · ${whenLabel(n)}` : ''}</span>` : ''}<div class="sub">${esc(desc)}</div></li>`;
  }).join('');
  // team check (Academy tier and beyond): 4 members, every year level, the five roles covered
  let team = '';
  if (idx >= 1 || (Co.Team || []).length) {
    const mates = (Co.Team || []).slice(0, 3), stOf = npcStatus(S);
    // v1.0.3 (F02): a teammate with a status on record (graduated, injured, expelled…) is not counted until the story confirms them
    const gone = graduated(S), stOf2 = id => (gone.has(id) ? 'graduated, left campus' : stOf(id));
    const flagged = mates.filter(id => stOf2(id)), counted = mates.filter(id => !stOf2(id));
    const roles = new Set(ROLES5.filter(r => new RegExp(r, 'i').test(P.Combat_role || '')));
    counted.forEach(id => { const n = npcOf(id); if (n && n.tr) roles.add(n.tr); });
    const years = new Set([P.Year, ...counted.map(id => Math.min(3, yearNow(id, S))).filter(Boolean)]);   // 1.0.3: this year's level
    team = `<h3>Your team</h3><div class="meta"><span class="who"><span>You${P.Combat_role ? ` (${esc(P.Combat_role)})` : ''}</span></span>${mates.map(id => npcOf(id) ? `<button class="who" data-open="npc:${esc(id)}">${avatar(id, S, 'av xs')}<span>${esc(nameOf(id, S))}${npcOf(id).tr ? ` (${npcOf(id).tr})` : ''}</span></button>` : `<span class="who"><span>${esc(id)}</span></span>`).join('')}</div>
      <div class="meta">${ROLES5.map(r => `<span class="pill ${roles.has(r) ? 'g' : ''}">${roles.has(r) ? '✓' : '·'} ${r}</span>`).join('')}</div>
      <div class="hint">${mates.length + 1}/4 members · years covered: ${[1, 2, 3].map(y => years.has(y) ? `Y${y} ✓` : `Y${y} missing`).join(', ')}. Only your own roles and rival-team roles are on record; check your teammates' roles in the story.${flagged.length ? ` Not counted, status on record: ${flagged.map(id => `${esc(nameOf(id, S))} (${esc(stOf2(id))})`).join('; ')}.` : ''}</div>`;
  }
  // rival academy teams (from Month 9 or at Kingdom tier)
  let rivals = '';
  if (idx >= 2 || S.World.Month >= 9) {
    const g = _.groupBy(Object.keys(DATA.npcs).filter(id => /team$/.test(DATA.npcs[id].g)), id => DATA.npcs[id].g);
    rivals = `<h3>Rival academies</h3>${Object.entries(g).map(([name, ids]) => `<div class="item"><b>${esc(name)}</b><div class="meta">${ids.map(id => `<button class="who" data-open="npc:${esc(id)}">${avatar(id, S, 'av xs')}<span>${esc(nameOf(id, S))}${DATA.npcs[id].tr ? ` · ${DATA.npcs[id].tr}` : ''}</span></button>`).join('')}</div></div>`).join('')}`;
  }
  return `${status}<h3>The ladder</h3><ol class="ladder">${ladder}</ol>${team}${rivals}`;
}

// ---------------------------------------------------------------- shop
// 1.2.0 (owner): the Shop tab appears only at a shop: the Commissary (with Ardenne's special orders), or the Mall and the
// shops inside it. "The Mall — Nightwell" (or "Nightwell") opens on that shop.
const MALL_SHOPS = ['mall', 'nightwell', 'merryhews', 'snug'];
function shopsHere(S) {
  const here = locIdOf(S.World.Location), group = MALL_SHOPS.includes(here) ? MALL_SHOPS : here === 'commissary' ? ['commissary'] : [];
  return (DATA.shop || []).filter(i => group.includes(i.loc));
}
function shopFocus(S) {             // the shop named in the location ("The Mall — Merryhew's"), if any
  const detail = String(S.World.Location || '').toLowerCase(), here = locIdOf(S.World.Location);
  const sub = MALL_SHOPS.filter(x => x !== 'mall');
  const hit = shopsHere(S).find(i => sub.includes(i.loc) && (i.loc === here || detail.includes(i.shop.replace(/^the /i, '').toLowerCase())));
  return hit ? hit.shop.split(' — ')[0] : '';
}
function acShop(S) {
  const W = S.Player.Wallet, items = shopsHere(S);
  const shops = ['All', ...new Set(items.map(i => i.shop.split(' — ')[0]))];
  if (view.shopAt !== S.World.Location) { view.shopAt = S.World.Location; view.shop = shopFocus(S) || 'All'; }
  if (!shops.includes(view.shop)) view.shop = 'All';
  const list = items.filter(i => view.shop === 'All' || i.shop.split(' — ')[0] === view.shop);
  const bazaar = eventDay(/^Academy Bazaar/), bn = bazaar ? daysTo(S, bazaar.di) : 99;
  const season = SEASON_OF(S.World.Month);   // 1.1.0 (spec §4.9): off-season items are greyed out
  const rows = list.map(i => {
    const at = hereIs(S, i.loc) || (i.loc === 'mall' && locIdOf(S.World.Location) === 'mall'), place = (DATA.locs[i.loc] || { name: i.shop }).name;
    const oos = Array.isArray(i.season) && !i.season.includes(season);
    const afford = !oos && (i.price == null || W.Points >= i.price);
    const thing = /^The /.test(i.item) ? i.item.replace(/^The /, 'the ') : aan(i.item), to = /^the /i.test(place) || /'s$/.test(place) || MALL_SHOPS.includes(i.loc) ? place : 'the ' + place;
    const text = i.price == null ? `I ask at ${to} about a special order: ` : at ? `I buy ${thing} for ${i.price} points.` : `I head to ${to} to buy ${thing} (${i.price} points).`;
    return `<tr${oos ? ' class="oos"' : ''}><td><b>${esc(i.item)}</b>${oos ? ` <span class="pill oos">out of season</span>` : Array.isArray(i.season) ? ` <span class="pill">${esc(i.season.join(', '))}</span>` : ''}${i.note ? `<div class="sub">${esc(i.note)}</div>` : ''}<div class="sub mw">${esc(i.shop)}</div></td><td class="sub">${esc(i.shop)}</td>
      <td class="pz">${i.price == null ? '—' : fmt(i.price)}${i.canon ? '' : '<span class="gp" title="Guide price">*</span>'}</td>
      <td><button class="btn sm" data-fill="${esc(text)}" ${afford ? '' : `disabled title="${oos ? 'Out of season' : 'Not enough points'}"`}>${at ? 'Buy' : 'Go buy'}</button></td></tr>`;
  }).join('');
  return `<div class="bal"><span><b>${fmt(W.Points)}</b> points</span><span><b>${fmt(W.Coin)}</b> coin</span><button class="btn sm" data-fill="I go to the Banking House to exchange points and coin: ">Banking House</button></div>
    <p class="hint">Points pay for everything on campus; coin is real money (1:1 at the Banking House) and the only money that works off campus. A free version of nearly everything exists: the canteen, the common-room kettle, the dorm laundry.</p>
    ${bn >= -2 && bn <= 14 ? `<div class="warn">Academy Bazaar ${bn < 0 ? 'is on now' : bn === 0 ? 'opens today' : `in ${bn} days`} (M9 W2, Thu–Sat): invited traders, prices are whatever they say, haggling expected.</div>` : ''}
    <p class="hint">What is listed is a recommendation, not the whole stock: ask for anything a shop like this would sell.</p>
    <div class="tog" style="margin:10px 0">${shops.map(s => `<button data-shop="${esc(s)}" class="${view.shop === s ? 'on' : ''}">${esc(s)}</button>`).join('')}</div>
    <div class="scroll"><table class="shop"><tr><th>Item</th><th>Where</th><th>Points</th><th></th></tr>${rows}</table></div>
    <p class="hint">* Guide price; the narrator uses the same list. Buying only drafts the action into your message box.</p>`;
}

// ---------------------------------------------------------------- projects
function acProjects(S) {
  const Pj = Object.entries(S.Projects || {}).sort(([, a], [, b]) => (a.Progress >= 100) - (b.Progress >= 100));
  if (!Pj.length) return '<div class="empty">No projects yet. Brewing, crafting, research and group assignments appear here once they start in the story.</div>';
  return `<p class="lead">Work that takes more than one sitting. Progress only moves when you actually spend time on it in the story.</p>` + Pj.map(([k, p]) => {
    const done = p.Progress >= 100, lid = p.Where ? locIdOf(p.Where) : '';
    return `<div class="item${done ? ' done' : ''}"><div class="row"><span class="t">${esc(k)}</span><span class="pill">${esc(p.Kind)}</span>${done ? '<span class="pill g">done</span>' : p.Due ? `<span class="pill w">due ${esc(p.Due)}</span>` : ''}</div>
      ${p.Goal ? `<div>${esc(p.Goal)}</div>` : ''}<div class="bar"><i style="width:${p.Progress}%;background:${done ? '#3f9f69' : '#b39062'}"></i></div><div class="sub">${p.Progress}%${p.Needs && !done ? ` · still needs: ${esc(p.Needs)}` : ''}</div>
      <div class="meta">${p.With ? peopleIn(p.With, S) : ''}${p.Where ? `<span class="sub">at ${esc(p.Where)}</span>` : ''}
      ${!done ? `<button class="btn sm" data-fill="${esc(`I spend time working on ${k}${p.Where && !hereIs(S, lid) ? ` at ${p.Where}` : ''}: `)}">Work on it</button>` : ''}
      ${lid && !hereIs(S, lid) && !done ? `<button class="btn sm" data-go="${esc(lid)}">Go</button>` : ''}</div></div>`;
  }).join('');
}

// ---------------------------------------------------------------- trips
const TRIP_INFO = [
  { rx: /^Independence Crowning Day/, name: 'Independence Crowning Day: the capital', lines: [
    'Morning: the whole academy flies to the capital by airship.', 'Parade and the King\'s speech, then free time until the afternoon muster: markets, food, sights.',
    'Groups of four only. Uniform all day; the Doves travel along and staff count heads constantly.', 'Points do not work in the capital: carry coin.',
    'Back before dark, passenger lists counted twice. Fireworks over the hills at night; curfew moves to 22:00.'] },
  { rx: /^Academy Trip/, name: 'Academy Trip: Sunreach Bay', lines: [
    'Month 11 Week 3, Monday to Wednesday; all three years. Half a day by airship.', 'Beachfront hotels, four to a room; teachers in the same hotels set a curfew.',
    'Leave the hotel only in groups of four. The day side is allowed; the night side is out of bounds, which some students ignore every year.',
    'Points do not work abroad and Sunreach is expensive: this is what a year of saving is for.'] },
];
function acTrip(S) {
  const T = S.Trip || {}, W = S.Player.Wallet;
  let h = T.Active ? `<div class="item mine"><div class="row"><span class="t">Travelling: ${esc(T.Destination || 'on a trip')}</span><span class="pill g">now</span></div>
    ${T.Companions.length ? `<div class="meta"><span class="sub">Your group</span>${T.Companions.map(id => npcOf(id) ? `<button class="who" data-open="npc:${esc(id)}">${avatar(id, S, 'av xs')}<span>${esc(nameOf(id, S))}</span></button>` : `<span class="who"><span>${esc(id)}</span></span>`).join('')}</div>` : ''}
    ${T.Note ? `<div class="sub">${esc(T.Note)}</div>` : ''}</div>` : '';
  h += `<div class="bal"><span><b>${fmt(W.Coin)}</b> coin to spend off campus</span><button class="btn sm" data-fill="I go to the Banking House to change points into coin for the trip: ">Change points to coin</button></div>`;
  h += TRIP_INFO.map(ti => {
    const d = eventDay(ti.rx), n = d ? daysTo(S, d.di) : null;
    return `<div class="item"><div class="row"><span class="t">${esc(ti.name)}</span>${d ? `<span class="pill${n >= 0 && n <= 14 ? ' w' : ''}">M${d.e.m} W${d.e.w} ${d.e.d[0]} · ${whenLabel(n)}</span>` : ''}</div><ul class="log">${ti.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>`;
  }).join('');
  return h;
}

// ---------------------------------------------------------------- battle panel (opens from the "In battle" chip)
const isRunning = (t, M) => Object.values(M.Active || {}).some(e => e.Technique === t);
PANELS.battle = {
  live: true,
  render(S) {
    const Bt = S.Battle || {}, V = S.Player.Vitals, M = S.Magic, T = M._Techniques || {}, H = S.Hidden || {};
    const field = featureOn(S, 'battle') && (S.$ui || {}).wxfx === 'full' && ((S.$ui || {}).wx || {}).field;   // 1.1.0: outdoor field line
    const foes = Object.entries(Bt.Combatants || {});
    const fb = (label, cur, max, color) => { const mx = Math.max(max, cur, 1); return `<div class="fbar"><span>${label}</span><div class="bar"><i style="width:${_.clamp(cur / mx * 100, 0, 100)}%;background:${color}"></i></div><b>${fmt(cur)}</b></div>`; };
    const foeH = foes.length ? foes.map(([id, c]) => `<div class="foe">${npcOf(id) ? avatar(id, S, 'av') : `<span class="av fb">${esc(initials(id))}</span>`}<div class="pm"><span class="pn">${esc(nameOf(id, S))}</span>
      ${fb('HP', c.HP, 100, '#c4504a')}${fb('Stamina', c.Stamina, 100, '#d39b37')}${c.Status ? `<div class="sub">${esc(c.Status)}</div>` : ''}</div></div>`).join('') : '<div class="empty">No opponents tracked.</div>';
    const upkeep = Object.values(M.Active || {}).reduce((a, e) => a + num((T[e.Technique] || {}).Upkeep_per_min), 0);
    const act = Object.entries(M.Active || {}).map(([k, e]) => `<span class="pill g">${esc(k)} · ${fmt((T[e.Technique] || {}).Upkeep_per_min || 0)}/min<button class="lnk" data-fill="${esc(`I let ${k} fade. `)}" style="margin-left:6px">end</button></span>`).join('');
    const techs = Object.entries(T).map(([k, t]) => {
      const running = isRunning(k, M);
      const cost = t.Cost_mode === 'hybrid' && running && t.Trigger ? t.Trigger : t.Activation;
      const can = cost <= V.Mana;
      const warn = H._True_magic && t.Hidden ? ' <span class="pill h" title="Using it here may be noticed">hidden</span>' : '';
      return `<div class="tq${can ? '' : ' no'}"><div><b>${esc(k)}</b>${warn}<div class="sub">${esc(MODES[t.Cost_mode])}: ${fmt(cost)} mana${t.Cost_mode !== 'per_use' && !running ? ` + ${fmt(t.Upkeep_per_min)}/min` : ''}${running ? ' (running)' : ''}</div></div>
        ${running && t.Cost_mode === 'sustained' ? '<span class="pill g">active</span>'
          : `<button class="btn sm" data-fill="${esc(running ? `I trigger ${k}: ` : `I use ${k}: `)}" ${can ? '' : 'disabled title="Not enough mana"'}>${running ? 'Trigger' : 'Use'}</button>`}</div>`;
    }).join('');
    return `<div class="dlg" tabindex="-1"><div class="hd"><h2>${Bt.Active ? 'Battle' : 'No fight in progress'}</h2><button class="x" data-act="close" aria-label="Close">×</button></div><div class="bd">
      ${featureOn(S, 'battle') ? '' : '<p class="hint">Battle tracking is off (Student file → Settings → Features); opponents are not tracked.</p>'}
      ${field ? `<div class="fieldl">Field: ${esc(field)}</div>` : ''}<h3>Opponents</h3>${foeH}
      <h3>You</h3>${vbar('Health', V.HP, V.HP_max, '#c4504a', V._Condition)}${vbar('Stamina', V.Stamina, V.Stamina_max, '#d39b37', V._Fatigue)}${vbar('Mana', V.Mana, V.Mana_max, '#5b8fd4', upkeep ? `Upkeep −${fmt(upkeep)}/min` : '')}
      ${act ? `<div class="meta">${act}</div>` : ''}
      <h3>Techniques</h3>${techs || '<div class="empty">No techniques. Add them in the Student Builder.</div>'}
      <p class="hint">Buttons only draft your action into the message box; the engine charges mana when the narrator reports the cast.</p></div></div>`;
  },
  click(b) { if (b.dataset.fill) fillChat(b.dataset.fill); },
};
