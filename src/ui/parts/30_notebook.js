// ================================================================ 5.1 Notebook: Planner (F14), Notice Board (F15), Letters (F16), Journal + Mystery Board (F17)
// Calendar + timetable come from the engine template (single source), injected by tools/gen_ui.py.
const CAL = /*@@CALENDAR@@*/{ EVENTS: [], TIMETABLE: {} };
view.nb = 'planner'; view.calOff = 0; view.letter = { to: '', body: '' }; view.calSel = ''; view.markText = '';
// [id, label, unlock, features (any on)] — 1.1.0: a tab whose features are all off is hidden (the board also carries the forecast)
const NB_TABS = [['planner', 'Planner'], ['journal', 'Journal'], ['notices', 'Notice Board', 'notices', ['notices', 'weather']], ['letters', 'Letters', 'letters', ['letters']], ['mystery', 'Mystery Board', 'mystery', ['mystery']]];
const dayIdx = (M, W, D) => (M - 1) * 28 + (W - 1) * 7 + Math.max(0, DAYS.indexOf(D));   // day of the year, 0-based
const dayOf = i => { i = ((i % 336) + 336) % 336; return { M: Math.floor(i / 28) + 1, W: Math.floor((i % 28) / 7) + 1, D: DAYS[i % 7] }; };
const eventsOnDay = (M, W, D) => CAL.EVENTS.filter(e => e.m === M && e.w === W && e.d.includes(D));
const shortEv = t => String(t).split(' (')[0].split(':')[0];
const relDay = n => n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n === -1 ? 'Yesterday' : n > 0 ? `In ${n} days` : `${-n} days ago`;
function fillChat(text) {          // D6/D3: the UI never moves the story itself; it drafts the action for the player to edit and send
  const ta = PD.querySelector('#send_textarea');
  if (!ta) { toastr.info(text, 'Copy this into the chat'); return; }
  $('#send_textarea').val(text).trigger('input');
  close(); ta.focus(); try { ta.setSelectionRange(text.length, text.length); } catch (e) { /* ignore */ }
}
function peopleIn(str, S) {        // "Irene and Etnie" / "Irene, Rei" -> avatars for known NPCs, plain text otherwise
  return String(str || '').split(/\s*(?:,|&|\band\b|\/)\s*/).filter(Boolean).map(x => {
    const id = Object.keys(DATA.npcs || {}).find(k => k.toLowerCase() === x.toLowerCase() || DATA.npcs[k].n.toLowerCase() === x.toLowerCase());
    return id ? `<button class="who" data-open="npc:${esc(id)}">${avatar(id, S, 'av xs')}<span>${esc(nameOf(id, S))}</span></button>` : `<span class="who"><span>${esc(x)}</span></span>`;
  }).join('');
}
const unlockedTab = (S, t) => (!t[2] || ((S.$ui || {}).unlocks || []).includes(t[2])) && (!t[3] || t[3].some(f => featureOn(S, f)));

PANELS.notebook = {
  get live() { return view.nb !== 'letters'; },   // keep a half-written letter from being wiped by a refresh
  render(S) {
    if (view.arg && NB_TABS.some(t => t[0] === view.arg)) { view.nb = view.arg; view.arg = ''; }
    const tabs = NB_TABS.filter(t => unlockedTab(S, t));
    if (!tabs.some(t => t[0] === view.nb)) view.nb = 'planner';
    const late = featureOn(S, 'planner') ? Object.values(S.Commitments || {}).filter(c => c._Late).length : 0;
    const mail = featureOn(S, 'letters') ? Object.values(S.Letters || {}).filter(l => l.Status === 'waiting').length : 0;
    const badge = id => (id === 'planner' && late ? `<i class="nbb bad">${late}</i>` : id === 'letters' && mail ? `<i class="nbb">${mail}</i>` : '');
    const body = ({ planner: nbPlanner, journal: nbJournal, notices: nbNotices, letters: nbLetters, mystery: nbMystery })[view.nb](S);
    return `<div class="dlg wide" tabindex="-1"><div class="hd"><h2>Notebook</h2>${view.stack.length ? '<button class="btn sm" data-act="back">Back</button>' : ''}<button class="x" data-act="close" aria-label="Close">×</button></div>
      <nav class="nav">${tabs.map(([id, l]) => `<button data-nb="${id}" class="${view.nb === id ? 'on' : ''}">${l}${badge(id)}</button>`).join('')}</nav><div class="bd">${body}</div></div>`;
  },
  input(el) { if (el.dataset.lt) view.letter[el.dataset.lt] = el.value; if (el.dataset.mk !== undefined) view.markText = el.value; },
  click(b, S) {
    if (b.dataset.nb) { view.nb = b.dataset.nb; render(); ov.querySelector('.bd').scrollTop = 0; return; }
    if (b.dataset.cal) { view.calOff = _.clamp(view.calOff + +b.dataset.cal, 0, 11); render(); return; }
    if (b.dataset.calday) { view.calSel = view.calSel === b.dataset.calday ? '' : b.dataset.calday; view.markText = ((S.$ui || {}).marks || {})[view.calSel] || ''; render(); return; }
    if (b.dataset.act === 'savemark' || b.dataset.act === 'delmark') {
      const key = view.calSel; if (!key) return;
      const marks = Object.assign({}, (S.$ui || {}).marks || {}), text = b.dataset.act === 'delmark' ? '' : view.markText.trim().slice(0, 200);
      if (text) marks[key] = text; else delete marks[key];
      if (_.isEqual(marks, (S.$ui || {}).marks || {})) return;
      commitSetting([{ op: 'replace', path: '/$ui/marks', value: marks }], text ? `🗓️ Calendar note for ${key}: ${text}` : `🗓️ Calendar note for ${key} removed.`);
      return;
    }
    if (b.dataset.go) { const l = DATA.locs[b.dataset.go]; if (l) fillChat(goText(l.name)); return; }
    if (b.dataset.fill) { fillChat(b.dataset.fill); return; }
    if (b.dataset.reply !== undefined) {
      view.letter.to = b.dataset.reply; render();
      const ta = ov.querySelector('[data-lt="body"]'); if (ta) { scrollInto(ta, ov.querySelector('.bd'), true); keepPage(() => ta.focus({ preventScroll: true })); } return;
    }
    if (b.dataset.act === 'sendletter') {
      const to = view.letter.to.trim(), body = view.letter.body.trim();
      if (!to) { toastr.warning('Who is the letter for?', 'Letters'); return; }
      const atTower = normPlace(S.World.Location) === 'mail tower';
      const text = `I write a letter to ${to}${atTower ? ' and hand it in on the sorting floor' : ', to send from the Mail Tower'}.${body ? ` It reads: "${body}"` : ''}`;
      view.letter = { to: '', body: '' }; fillChat(text);
    }
  },
};

// ---------------------------------------------------------------- planner
function hapCard(S) {               // 5.3 (F20): today's seeded happening; optional, the player decides whether to go
  const h = (S.$ui || {}).hap; if (!h || !h.text) return '';
  const lid = h.where ? locIdOf(h.where) : '';
  const here = lid && normPlace(S.World.Location) === normPlace(DATA.locs[lid].name);
  return `<div class="hap"><span class="pill${h.now ? ' w' : ''}">${h.now ? `now, until ${h.to}:00` : `${h.from}:00–${h.to}:00`}</span> <b>${esc(h.where || 'Around campus')}</b><div>${esc(h.text)}</div>
    ${lid && !here ? `<button class="btn sm" data-go="${esc(lid)}">Go here</button>` : ''}</div>`;
}
function nbPlanner(S) {
  const W = S.World, today = dayIdx(W.Month, W.Week, W.Day);
  const now = `<div class="now"><b>${esc(`${W.Day} ${W.Time}`)}</b> <span class="sub">Month ${W.Month}, Week ${W.Week}</span><div>${esc(W._Period || 'Free time')}</div>
    ${W._Weather && featureOn(S, 'weather') ? `<div class="sub">${esc(wxIcon((S.$ui || {}).wx))} ${esc(W._Weather)}</div>` : ''}
    ${W._Event_today ? `<div class="ev">${esc(W._Event_today)}</div>` : ''}${W._Curfew ? `<div class="cf">${esc(W._Curfew)}</div>` : ''}${featureOn(S, 'happenings') ? hapCard(S) : ''}</div>`;
  // commitments
  const C = Object.entries(S.Commitments || {}).sort(([, a], [, b]) => ((a.$abs < 0) - (b.$abs < 0)) || (a.$abs - b.$abs));
  const com = C.length ? C.map(([k, c]) => {
    const lid = c.Where ? locIdOf(c.Where) : '';
    const when = c._Late ? '<span class="pill f">overdue</span>' : c._When ? `<span class="pill${/^today/.test(c._When) ? ' w' : ''}">${esc(c._When)}</span>` : (c.Due ? `<span class="pill">${esc(c.Due)}</span>` : '');
    return `<div class="item cm${c._Late ? ' late' : ''}"><div class="row"><span class="t">${esc(k)}</span>${c.Type ? `<span class="pill">${esc(c.Type)}</span>` : ''}${when}</div>
      ${c.Desc ? `<div>${esc(c.Desc)}</div>` : ''}<div class="meta">${c.With ? peopleIn(c.With, S) : ''}${c.Where ? `<span class="sub">at ${esc(c.Where)}</span>` : ''}
      ${lid && normPlace(S.World.Location) !== normPlace(DATA.locs[lid].name) ? `<button class="btn sm" data-go="${esc(lid)}">Go here</button>` : ''}</div></div>`;
  }).join('') : '<div class="empty">Nothing promised, nothing due. Commitments appear here when you make them in the story.</div>';
  // this week's timetable
  const P = /^P(\d)/.exec(W._Period || ''), per = P ? +P[1] - 1 : -1;
  const rows = DAYS.map(D => {
    const evs = eventsOnDay(W.Month, W.Week, D), stop = evs.find(e => e.noclass || e.home || e.lockdown), tt = CAL.TIMETABLE[D];
    const isToday = D === W.Day;
    const cells = !tt ? `<td colspan="3" class="off">No classes</td>` : stop ? `<td colspan="3" class="off ev">${esc(shortEv(stop.t))}</td>`
      : tt.map((c, i) => `<td class="${isToday && i === per ? 'cur' : ''}">${esc(c.replace(/\s*\[(M|D)\]/, ''))}${/\[D\]/.test(c) ? ' <span class="dm" title="Taught to each dorm separately">dorm</span>' : ''}</td>`).join('');
    const extra = evs.filter(e => e !== stop).map(e => `<div class="sub ev">${esc(shortEv(e.t))}</div>`).join('');
    return `<tr class="${isToday ? 'today' : ''}"><th>${D}${extra}</th>${cells}</tr>`;
  }).join('');
  const table = `<div class="scroll"><table class="tt"><tr><th></th><th>08:00–10:00</th><th>10:00–12:00</th><th>13:00–16:00</th></tr>${rows}</table></div>`;
  // month calendar (1.2.0: interactive; every dated thing in the state lands on its day, and the player can write notes)
  const mo = ((W.Month - 1 + view.calOff) % 12) + 1, yr = W.Year + Math.floor((W.Month - 1 + view.calOff) / 12);
  const mine = datedItems(S);
  const grid = _.range(4).map(w => DAYS.map(D => {
    const di = dayIdx(mo, w + 1, D), key = markKey(yr, mo, w + 1, D), evs = eventsOnDay(mo, w + 1, D), its = mine[key] || [];
    const cls = [di === today && view.calOff === 0 ? 'today' : '', evs.length || its.length ? 'has' : '', view.calOff === 0 && di < today ? 'past' : '', view.calSel === key ? 'sel' : ''].join(' ');
    const note = its.find(x => x.k === 'note'), bd = its.some(x => x.k === 'birthday'), n = its.filter(x => x.k !== 'note' && x.k !== 'birthday').length;
    return `<button class="cd ${cls}" data-calday="${esc(key)}" title="${esc([...evs.map(e => e.t), ...its.map(x => x.t)].join('\n'))}"><span class="dn">${D.slice(0, 2)}${bd ? ' 🎂' : ''}</span>${evs.slice(0, 2).map(e => `<span class="ce">${esc(shortEv(e.t))}</span>`).join('')}${n ? `<span class="cc">● ${n}</span>` : ''}${note ? `<span class="cn">✎ ${esc(note.t)}</span>` : ''}</button>`;
  }).join('')).map((r, w) => `<div class="wk"><span class="wl">W${w + 1}</span>${r}</div>`).join('');
  let detail = '';
  if (view.calSel) {
    const [, sy, sm, sw, sd] = /^Y(\d+) M(\d+) W(\d) (\w{3})$/.exec(view.calSel) || [];
    if (sm) {
      const evs = eventsOnDay(+sm, +sw, sd), its = (mine[view.calSel] || []).filter(x => x.k !== 'note'), cur = ((S.$ui || {}).marks || {})[view.calSel] || '';
      detail = `<div class="item calday"><div class="row"><span class="t">${esc(`Year ${sy}, Month ${sm}, Week ${sw}, ${sd}`)}</span><button class="btn sm" data-calday="${esc(view.calSel)}">Close</button></div>
        ${evs.map(e => `<div class="ev">${esc(e.t)}</div>`).join('')}${its.map(x => `<div><span class="pill">${esc(x.k)}</span> ${esc(x.t)}</div>`).join('')}
        ${!evs.length && !its.length ? '<div class="sub">Nothing on this day yet.</div>' : ''}
        <label class="f" style="margin-top:8px">Your note for this day<textarea data-mk="1" maxlength="200" placeholder="e.g. Ask Gareth to spar">${esc(view.markText)}</textarea></label>
        <div class="meta"><button class="btn sm pri" data-act="savemark" ${view.busy ? 'disabled' : ''}>Save note</button>${cur ? `<button class="btn sm del" data-act="delmark" ${view.busy ? 'disabled' : ''}>Remove note</button>` : ''}
        <span class="sub">Notes are yours: the narrator does not read them. Saving adds a small hidden entry to the chat.</span></div></div>`;
    }
  }
  // coming up (14 days): academy events plus your own dated things
  const up = [];
  for (let n = 0; n < 15; n++) {
    const d = dayOf(today + n), y = W.Year + (today + n >= 336 ? 1 : 0);
    for (const e of eventsOnDay(d.M, d.W, d.D)) if (!up.some(u => u.e === e)) up.push({ n, d, e, t: e.t });
    for (const x of mine[markKey(y, d.M, d.W, d.D)] || []) up.push({ n, d, t: `${x.k === 'note' ? '✎ ' : x.k === 'birthday' ? '🎂 ' : ''}${x.t}`, mine: 1 });
  }
  const upH = up.length ? `<ul class="up">${up.map(u => `<li${u.mine ? ' class="mine"' : ''}><span class="rd">${relDay(u.n)}</span><span class="sub">M${u.d.M} W${u.d.W} ${u.d.D}</span> ${esc(u.t)}</li>`).join('')}</ul>` : '<div class="empty">Nothing on the academy calendar in the next two weeks.</div>';
  return `${now}${featureOn(S, 'planner') ? `<h3>Commitments</h3>${com}` : ''}<h3>This week</h3>${table}<h3>Coming up</h3>${upH}
    <h3 class="calh">Calendar: Month ${mo}${view.calOff ? '' : ' (now)'}<span><button class="btn sm" data-cal="-1" ${view.calOff ? '' : 'disabled'} aria-label="Previous month">‹</button><button class="btn sm" data-cal="1" ${view.calOff >= 11 ? 'disabled' : ''} aria-label="Next month">›</button></span></h3><p class="hint">Tap a day to see what is on it and write yourself a note.</p><div class="cal">${grid}</div>${detail}`;
}

// 1.2.0: dated things from the state, by day key "Y1 M3 W2 Thu": commitments (promises, appointments), projects with a due
// date, notices' last day, the birthday, and the player's own notes ($ui.marks)
const markKey = (Y, M, W, D) => `Y${Y} M${M} W${W} ${D}`;
const WHEN_RX = /M(\d{1,2})\s*W([1-4])\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/;
function datedItems(S) {
  const W = S.World, out = {}, today = dayIdx(W.Month, W.Week, W.Day);
  const put = (key, k, t) => (out[key] = out[key] || []).push({ k, t });
  const fromAbs = abs => { const day = Math.floor(abs / 1440), Y = Math.floor(day / 336) + 1, d = dayOf(day % 336); return markKey(Y, d.M, d.W, d.D); };
  const fromText = s => { const m = WHEN_RX.exec(String(s || '')); if (!m) return ''; const di = dayIdx(+m[1], +m[2], m[3]); return markKey(W.Year + (di < today - 14 ? 1 : 0), +m[1], +m[2], m[3]); };
  if (featureOn(S, 'planner')) for (const [k, c] of Object.entries(S.Commitments || {})) { const key = c.$abs >= 0 ? fromAbs(c.$abs) : fromText(c.Due); if (key) put(key, c.Type || 'due', `${k}${c.With ? ` (with ${c.With})` : ''}`); }
  if (featureOn(S, 'projects')) for (const [k, p] of Object.entries(S.Projects || {})) { const key = p.Progress < 100 && fromText(p.Due); if (key) put(key, 'project', `${k} due`); }
  if (featureOn(S, 'notices')) for (const [k, n] of Object.entries(S.Notices || {})) { const key = n.$abs >= 0 ? fromAbs(n.$abs) : fromText(n.Until); if (key) put(key, 'notice', `last day: ${k}`); }
  const b = WHEN_RX.exec(String(((S.Player || {}).Profile || {}).Birthday || ''));
  if (b) for (const y of [W.Year, W.Year + 1]) put(markKey(y, +b[1], +b[2], b[3]), 'birthday', 'Your birthday');
  for (const [key, t] of Object.entries((S.$ui || {}).marks || {})) if (t) put(key, 'note', t);
  return out;
}

// ---------------------------------------------------------------- journal
function nbJournal(S) {
  const parse = (l, old) => { const m = /^\[M(\d+) W(\d) (\w{3})\]\s*(.*)$/.exec(l); return m ? { M: +m[1], W: +m[2], D: m[3], t: m[4], old } : { M: 0, t: l, old }; };
  // 5.3 (F21): archived lines (the narrator no longer reads them) stay in the player's journal, shown faded
  const J = [...((S.$ui || {}).archive || []).map(l => parse(l, true)), ...(S.Journal || []).map(l => parse(l, false))];
  const groups = _.groupBy([...J].reverse(), 'M');
  const months = [...new Set([...J].reverse().map(e => e.M))];
  const tl = J.length ? months.map(M => `<h4>${M ? `Month ${M}` : 'Undated'}</h4><ol class="jt">${groups[M].map(e => `<li${e.old ? ' class="old" title="Archived: the narrator no longer reads this line"' : ''}>${e.W ? `<span class="sub">W${e.W} ${e.D}</span>` : ''}${esc(e.t)}</li>`).join('')}</ol>`).join('') : '<div class="empty">Nothing written yet.</div>';
  const CS = S.Campus_State || {}, ev = Object.entries(CS.Events || {}), ru = [...(CS.Rumours || [])].reverse();
  // 1.1.0 (spec §3): how far each rumour has spread; rumours that died out stay, faded
  const gs = featureOn(S, 'gossip') ? Object.fromEntries(((S.$ui || {}).gossip || []).map(g => [g[0], g])) : {}, old = [...((S.$ui || {}).rumours_old || [])].reverse();
  return `<p class="lead">The turning points of your year, written as they happen. The narrator reads the latest 30 lines as the story's memory; older chat is trimmed from its context. Faded lines are archived: kept for you, no longer read by the narrator.</p>${tl}
    <h3>Campus news</h3>${ev.length ? `<dl class="kv">${ev.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : '<div class="empty">Nothing has changed on campus yet.</div>'}
    ${ru.length || old.length ? `<h3>Rumours</h3><ul class="log">${ru.map(r => `<li>${esc(r)}${gs[r] ? `<span class="reach">${esc(gs[r][1])} · day ${gs[r][2]}</span>` : ''}</li>`).join('')}${old.map(r => `<li class="old" title="Died out">${esc(r)}</li>`).join('')}</ul>` : ''}`;
}

// ---------------------------------------------------------------- notice board
function officialNotices(S) {
  const W = S.World, today = dayIdx(W.Month, W.Week, W.Day), out = [];
  for (let n = -1; n <= 10; n++) {
    const d = dayOf(today + n);
    for (const e of eventsOnDay(d.M, d.W, d.D)) {
      if (out.some(o => o.e === e) || e.home) continue;
      out.push({ e, n, d, t: e.ranking ? 'Results and dorm rankings' : shortEv(e.t), x: e.t.replace(/\s*\(Player\.Profile[^)]*\)/, '') });
    }
  }
  return out;
}
function nbNotices(S) {
  const off = officialNotices(S).map(o => `<div class="note off"><b>${esc(o.t)}</b><div>${esc(o.x)}</div><div class="sub">${esc(`${relDay(o.n)} · M${o.d.M} W${o.d.W} ${o.d.D}`)} · Academy Administration</div></div>`).join('');
  const N = featureOn(S, 'notices') ? Object.entries(S.Notices || {}).reverse() : [];
  const own = N.map(([k, v], i) => `<div class="note" style="--r:${[-1.2, .8, -.5, 1.1, -.9][i % 5]}deg"><b>${esc(k)}</b><div>${esc(v.Text)}</div>
    <div class="sub">${esc([v.By && `Posted by ${v.By}`, v.Posted, v.Until && `until ${v.Until}`].filter(Boolean).join(' · '))}</div>
    <button class="btn sm" data-fill="${esc(`About the notice "${k}" on the board: `)}">Act on it</button></div>`).join('');
  const fc = forecastCard(S);
  return `<p class="lead">The long wall of boards in the castle's Floor 1 entrance hall. Official postings go up ahead of every event; the rest is what students pin up, and it rarely stays long.</p>
    <h3>Official</h3>${off || fc ? `<div class="board">${fc}${off}</div>` : '<div class="empty">No official postings this fortnight.</div>'}
    ${featureOn(S, 'notices') ? `<h3>Pinned by students and staff</h3>${own ? `<div class="board">${own}</div>` : '<div class="empty">Nothing you have noticed yet. Paid work, club recruitment and lost items appear here once you have seen them.</div>'}` : ''}`;
}
// 1.1.0 (spec §4.7): the Divination Society posts tomorrow's skies at 07:00 (about 75% right; the bracelet and Planner do not show it)
function forecastCard(S) {
  const wx = (S.$ui || {}).wx; if (!featureOn(S, 'weather') || !wx || !wx.fc) return '';
  const B = ['Morning', 'Afternoon', 'Night'];
  return `<div class="note off fc"><b>Divination Society — ${wx.fc.tomorrow ? "tomorrow's" : "today's"} skies</b>
    <div class="fcb">${wx.fc.blocks.map((b, i) => `<span>${B[i]}</span><span>${esc(b.text)}, ${esc(b.label)}</span>`).join('')}</div>
    <div class="dis">The Society accepts no responsibility for umbrellas.</div><div class="sub">Posted ${wx.fc.tomorrow ? 'this morning' : 'yesterday'} at 07:00 · Divination Society</div></div>`;
}

// ---------------------------------------------------------------- letters
function nbLetters(S) {
  const L = Object.entries(S.Letters || {}).reverse();
  const atTower = normPlace(S.World.Location) === 'mail tower';
  const card = ([k, l]) => {
    const out = l.Status === 'sent', who = out ? l.To : l.From;
    const act = l.Status === 'waiting'
      ? `<button class="btn sm pri" data-fill="${esc(atTower ? `I collect the letter${l.From ? ` from ${l.From}` : ''} from my locker and read it.` : `I head to the Mail Tower to collect my letter${l.From ? ` from ${l.From}` : ''}.`)}">${atTower ? 'Collect and read' : 'Go and collect'}</button>`
      : l.Status === 'read' ? `<button class="btn sm" data-reply="${esc(l.From)}">Reply</button>` : '';
    const st = { waiting: '<span class="pill w">waiting at the Mail Tower</span>', read: '<span class="pill">read</span>', replied: '<span class="pill g">answered</span>', sent: '<span class="pill">sent</span>' }[l.Status];
    return `<div class="item letter ${l.Status}"><div class="row"><span class="t">${esc(k)}</span>${st}</div>
      <div class="meta"><span class="sub">${out ? 'To' : 'From'}</span>${peopleIn(who, S) || '<span class="sub">unknown</span>'}<span class="sub">${esc(l.Date)}</span></div>
      ${l.Status === 'waiting' ? '<div class="sub">Sealed. Collect it to learn what it says.</div>' : `<div class="gist">${esc(l.Gist)}</div>`}${act ? `<div style="margin-top:8px">${act}</div>` : ''}</div>`;
  };
  const inb = L.filter(([, l]) => l.Status !== 'sent'), sent = L.filter(([, l]) => l.Status === 'sent');
  const known = Object.keys(S.Bonds || {}).filter(id => knowsName(id, S)).map(id => (npcOf(id) || { n: id }).n);
  return `<p class="lead">Birds carry letters in and out of the Mail Tower; the sorting floor keeps them in numbered lockers until you collect them. A letter takes at least a day each way.</p>
    <h3>Received</h3>${inb.length ? inb.map(card).join('') : '<div class="empty">No letters yet.</div>'}
    ${sent.length ? `<h3>Sent</h3>${sent.map(card).join('')}` : ''}
    <h3>Write a letter</h3><div class="grid"><label class="f">To<input data-lt="to" list="eld-to" value="${esc(view.letter.to)}" placeholder="Someone at home, a friend…"></label>
    <datalist id="eld-to">${['My family', ...known].map(n => `<option value="${esc(n)}">`).join('')}</datalist><div></div>
    <label class="f full">What you want to say (optional)<textarea data-lt="body" placeholder="The narrator writes the letter out in the story.">${esc(view.letter.body)}</textarea></label></div>
    <div style="margin-top:10px"><button class="btn pri" data-act="sendletter">Draft it in the chat</button><div class="hint">This only fills in your message box. Edit it, then send it to play the scene.</div></div>`;
}

// ---------------------------------------------------------------- mystery board
function linkChip(x, S) {
  const id = Object.keys(DATA.npcs || {}).find(k => k.toLowerCase() === String(x).toLowerCase());
  if (id) return `<button class="who" data-open="npc:${esc(id)}">${avatar(id, S, 'av xs')}<span>${esc(nameOf(id, S))}</span></button>`;
  const lid = locIdOf(x);
  return `<span class="pill">${esc(lid ? DATA.locs[lid].name : x)}</span>`;
}
function nbMystery(S) {
  const Cl = Object.entries(S.Clues || {}), My = S.Mysteries || {};
  const order = { open: 0, cold: 1, solved: 2 };
  const threads = Object.keys(My).filter(t => Cl.some(([, c]) => c.Thread === t) || My[t].Summary).sort((a, b) => order[My[a].Status] - order[My[b].Status]);
  const board = threads.map(t => {
    const m = My[t], cs = Cl.filter(([, c]) => c.Thread === t);
    return `<section class="thread ${m.Status}"><div class="row"><span class="t">${esc(t)}</span><span class="pill ${m.Status === 'open' ? 'w' : m.Status === 'solved' ? 'g' : ''}">${m.Status}</span></div>
      <p class="sum">${esc(m.Summary || 'Nothing pieced together yet.')}</p><div class="clues">${cs.map(([k, c], i) => `<div class="clue" style="--r:${[-1, .7, -.4, 1][i % 4]}deg"><b>${esc(k)}</b><div>${esc(c.Detail)}</div>
      <div class="sub">${esc([c.Found, c.Where].filter(Boolean).join(' · '))}</div>${c.Links.length ? `<div class="meta">${c.Links.map(x => linkChip(x, S)).join('')}</div>` : ''}
      ${m.Status === 'open' ? `<button class="btn sm" data-fill="${esc(`I follow up on the clue "${k}": `)}">Follow up</button>` : ''}</div>`).join('')}</div></section>`;
  }).join('');
  const sec = _.groupBy(secretsOf(S), x => String(x).split('.')[0]);
  const truths = Object.entries(sec).map(([who, xs]) => {
    const id = Object.keys(DATA.npcs || {}).find(k => k.toLowerCase() === who.toLowerCase());
    const topics = xs.map(x => String(x).split('.').slice(1).join('.') || 'other');
    return `<div class="truth">${id ? linkChip(id, S) : `<span class="pill">${esc(who)}</span>`}<span>${topics.map(tp => `<span class="pill g">${esc(tp)}</span>`).join('')}</span></div>`;
  }).join('');
  return `<p class="lead">What you have noticed, and what it might mean. Clues are pinned by thread; solved threads move to the bottom.</p>
    ${board || '<div class="empty">No clues yet.</div>'}${truths ? `<h3>Truths uncovered</h3><p class="hint">Opens the matching part of each person's dossier.</p>${truths}` : ''}`;
}
