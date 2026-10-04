// ================================================================ 5.1 Notebook: Planner (F14), Notice Board (F15), Letters (F16), Journal + Mystery Board (F17)
// 1.32.0 (owner): shown as "Inventory", with the Bag and the Wallet (moved from the Student file) first; the panel id stays
// "notebook" so links ("notebook:planner") and the red-dot keys keep working.
// Calendar + timetable come from the engine template (single source), injected by tools/gen_ui.py.
const CAL = /*@@CALENDAR@@*/{ EVENTS: [], TIMETABLE: {} };
view.nb = 'bag'; view.pinTh = 'Unsorted clues'; view.calOff = 0; view.letter = { to: '', body: '' }; view.calSel = ''; view.markText = '';
// [id, label, unlock, features (any on)] — 1.1.0: a tab whose features are all off is hidden (the board also carries the forecast)
const NB_TABS = [['bag', 'Bag', '', ['inventory']], ['wallet', 'Wallet'], ['planner', 'Planner'], ['journal', 'Journal'], ['notices', 'Notice Board', 'notices', ['notices', 'weather']], ['letters', 'Letters', 'letters', ['letters']], ['mystery', 'Mystery Board', 'mystery', ['mystery']]];
const dayIdx = (M, W, D) => (M - 1) * 28 + (W - 1) * 7 + Math.max(0, DAYS.indexOf(D));   // day of the year, 0-based
const dayOf = i => { i = ((i % 336) + 336) % 336; return { M: Math.floor(i / 28) + 1, W: Math.floor((i % 28) / 7) + 1, D: DAYS[i % 7] }; };
const eventsOnDay = (M, W, D) => CAL.EVENTS.filter(e => e.m === M && e.w === W && e.d.includes(D));
const shortEv = t => String(t).split(' (')[0].split(':')[0];
const agendaOf = S => (Array.isArray((S.$ui || {}).agenda) ? S.$ui.agenda : []);   // 1.44.0: the engine's Agenda feed (stepAgenda)
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
    if (!tabs.some(t => t[0] === view.nb)) view.nb = tabs[0][0];
    const late = featureOn(S, 'planner') ? Object.values(S.Commitments || {}).filter(c => c._Late).length : 0;
    const mail = featureOn(S, 'letters') ? Object.values(S.Letters || {}).filter(l => l.Status === 'waiting').length : 0;
    const badge = id => (id === 'planner' && late ? `<i class="nbb bad">${late}</i>` : id === 'letters' && mail ? `<i class="nbb">${mail}</i>` : '');
    const body = ({ bag: pBag, wallet: pWallet, planner: nbPlanner, journal: nbJournal, notices: nbNotices, letters: nbLetters, mystery: nbMystery })[view.nb](S);
    return `<div class="dlg wide" tabindex="-1"><div class="hd"><h2>Inventory</h2>${view.stack.length ? '<button class="btn sm" data-act="back">Back</button>' : ''}<button class="x" data-act="close" aria-label="Close">×</button></div>
      <nav class="nav">${tabs.map(([id, l]) => `<button data-nb="${id}" class="${view.nb === id ? 'on' : ''}">${l}${badge(id)}${isNew(`tab:notebook:${id}`, view.nb === id) && view.nb !== id ? newsDot() : ''}</button>`).join('')}</nav><div class="bd">${body}</div></div>`;
  },
  input(el) { if (el.dataset.rp) { rpInput(el); return; } if (el.dataset.lt) view.letter[el.dataset.lt] = el.value; if (el.dataset.mk !== undefined) view.markText = el.value; if (el.dataset.pinth) view.pinTh = el.value; },
  click(b, S) {
    if (b.dataset.nb) { view.nb = b.dataset.nb; render(); ov.querySelector('.bd').scrollTop = 0; return; }
    if (b.dataset.cal) { view.calOff = _.clamp(view.calOff + +b.dataset.cal, 0, 11); render(); return; }
    if (b.dataset.calday) { view.calSel = view.calSel === b.dataset.calday ? '' : b.dataset.calday; view.markText = ((S.$ui || {}).marks || {})[view.calSel] || ''; render(); return; }
    if (/^rp/.test(b.dataset.act || '')) { rpClick(b, S); return; }
    if (b.dataset.act === 'savemark' || b.dataset.act === 'delmark') {
      const key = view.calSel; if (!key) return;
      const marks = Object.assign({}, (S.$ui || {}).marks || {}), text = b.dataset.act === 'delmark' ? '' : view.markText.trim().slice(0, 200);
      if (text) marks[key] = text; else delete marks[key];
      if (_.isEqual(marks, (S.$ui || {}).marks || {})) return;
      commitSetting([{ op: 'replace', path: '/$ui/marks', value: marks }], text ? `🗓️ Calendar note for ${key}: ${text}` : `🗓️ Calendar note for ${key} removed.`);
      return;
    }
    if (b.dataset.pin !== undefined) {   // 1.44.0: pin a heard rumour or story as a clue (a hidden player-tool message, like Settings)
      const x = heardOf(S)[+b.dataset.pin]; if (!x || !x.key) return;
      commitSetting([{ op: 'replace', path: `/Clues/${x.key}`, value: { Thread: view.pinTh || 'Unsorted clues', Detail: x.d, Where: x.w, Links: [], Source: x.src } }], `📌 Pinned as a clue: ${x.key}`);
      return;
    }
    if (b.dataset.lcundo !== undefined) {   // 1.60.0: the player removes a lasting change (a hidden player-tool message, like Settings)
      const L = Object.assign({}, (S.Campus_State || {}).Lore_changes || {}), k = Object.keys(L).filter(x => L[x] && L[x].Now)[+b.dataset.lcundo];
      if (!k) return;
      delete L[k];
      commitSetting([{ op: 'replace', path: '/Campus_State/Lore_changes', value: L }], `↩️ Lasting change undone: ${k}. The lore applies again.`);
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

// ---------------------------------------------------------------- 1.50.0 routine week (feature batch 2, audit 4.5)
// The plan ($ui.plan) is the player's: study hours, up to four Practice actions with a count, Saturday club. "Live this week" saves
// it armed; the engine answers with the span ($ui.routine: until when, what stops it, the moments) or why not, and the chat input is
// filled for the player to send. The engine counts the plan within the weekly limits; nothing here changes the story.
view.plan = null;
const RP_SUBJECTS = Object.values(PROF_SUBJECTS).flatMap(s => s.split(', '));
const rpKey = a => `${a.loc}|${a.action}`;
const rpActs = S => (DATA.practice || []).filter(a => !a.partner && !a.materials && !a.pact && practicePlaces(S).includes(a.loc));
function rpDraft(S) {
  if (!view.plan) {
    const p = (S.$ui || {}).plan || {};
    view.plan = { study: num(p.study, 0), club: !!p.club, acts: (Array.isArray(p.acts) ? p.acts : []).map(x => ({ a: String(x.a || ''), s: String(x.s || ''), n: num(x.n, 1) })).slice(0, 4) };
  }
  return view.plan;
}
function rpInput(el) {
  const p = view.plan; if (!p) return;
  const [k, i] = el.dataset.rp.split(':'), row = p.acts[+i];
  if (k === 'study') p.study = num(el.value, 0);
  else if (k === 'club') p.club = !!el.checked;
  else if (row && k === 'a') { row.a = el.value; row.s = ''; render(); }
  else if (row && k === 's') row.s = el.value;
  else if (row && k === 'n') row.n = num(el.value, 1);
}
const rpOut = p => ({ study: p.study, club: p.club, acts: p.acts.filter(x => x.a && x.n > 0).map(x => ({ a: x.a, ...(x.s ? { s: x.s } : {}), n: x.n })) });
async function rpClick(b, S) {
  const p = rpDraft(S), act = b.dataset.act;
  if (act === 'rpadd') { if (p.acts.length < 4) p.acts.push({ a: '', s: '', n: 1 }); render(); return; }
  if (act === 'rpdel') { p.acts.splice(+b.dataset.i, 1); render(); return; }
  if (act === 'rpsend') { const R = (S.$ui || {}).routine; if (R && R.at) fillChat(`I go about my usual week, as planned, until ${R.at}.`); return; }
  if (act === 'rpcancel') { await commitSetting([{ op: 'replace', path: '/$ui/plan', value: { ...rpOut(p), run: 0 } }], '🗓️ Routine week cancelled.'); return; }
  const missing = p.acts.find(x => x.a && ((DATA.practice || []).find(a => rpKey(a) === x.a) || {}).stat === 'subject' && !x.s);
  if (missing) { toastr.warning('Pick a subject for each study action.', 'Routine week'); return; }
  const run = act === 'rprun' ? 1 : 0;
  await commitSetting([{ op: 'replace', path: '/$ui/plan', value: { ...rpOut(p), run } }], run ? '🗓️ Routine week: living the planned week.' : '🗓️ Routine week plan saved.');
  if (!run) return;
  const st = latestState(), R = st && ((st.data.stat_data || {}).$ui || {}).routine;
  if (R && R.at) fillChat(`I go about my usual week, as planned, until ${R.at}.`);
  else if (R && R.why) toastr.warning(R.why, 'Routine week');
}
function rpSection(S) {
  const p = rpDraft(S), acts = rpActs(S), R = (S.$ui || {}).routine, armed = R && R.at && ((S.$ui || {}).plan || {}).run;
  const opt = (v, cur, label) => `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(label)}</option>`;
  const rows = p.acts.map((x, i) => {
    const a = acts.find(y => rpKey(y) === x.a);
    return `<div class="row rp"><select data-rp="a:${i}"><option value="">Choose an activity…</option>${acts.map(y => opt(rpKey(y), x.a, `${y.action} · ${(DATA.locs[y.loc] || {}).name || y.loc}${y.paid ? ` (+${y.paid} points)` : y.cost ? ` (−${y.cost} points)` : ''}`)).join('')}</select>
      ${a && a.stat === 'subject' ? `<select data-rp="s:${i}"><option value="">Subject…</option>${RP_SUBJECTS.map(s => opt(s, x.s, s)).join('')}</select>` : ''}
      <select data-rp="n:${i}" aria-label="Times this week">${[1, 2, 3, 4, 5].map(n => opt(n, x.n, `${n}×`)).join('')}</select>
      <button class="btn sm del" data-act="rpdel" data-i="${i}" aria-label="Remove">✕</button></div>`;
  }).join('');
  const state = armed ? `<div class="item"><b>Ready: until ${esc(R.at)}</b> <span class="sub">(stops before ${esc(R.stop)})</span><div>Send your message to live it; the narrator plays ${R.moments && R.moments.length ? R.moments.map(m => `${m.day}: ${m.who || 'a campus moment'}`).join(', ') : 'one ordinary moment'}.</div>
      <div class="meta"><button class="btn sm pri" data-act="rpsend">Write the message</button><button class="btn sm" data-act="rpcancel" ${view.busy ? 'disabled' : ''}>Cancel</button></div></div>`
    : R && R.why ? `<div class="sub">Not now: ${esc(R.why)}.</div>` : '';
  return `<h3>Routine week</h3><p class="hint">Plan an ordinary week and live it in one reply: classes attended, your plan counted within the weekly limits, one or two moments played. It runs to Sunday evening, or to the evening before the next event or due date. No bond progress except in the moments played.</p>${state}
    <div class="item"><label class="f">Study hours this week<select data-rp="study">${[0, 2, 4, 6, 8, 10, 14, 20].map(n => opt(n, p.study, n ? `${n} hours` : 'None')).join('')}</select></label>
    ${rows}${p.acts.length < 4 ? `<button class="btn sm" data-act="rpadd">Add an activity</button>` : ''}
    ${(S.Player.Profile || {}).Club ? `<label class="f"><input type="checkbox" data-rp="club" ${p.club ? 'checked' : ''}> Saturday afternoon at the ${esc(S.Player.Profile.Club)}</label>` : ''}
    <div class="meta"><button class="btn sm" data-act="rpsave" ${view.busy ? 'disabled' : ''}>Save plan</button><button class="btn sm pri" data-act="rprun" ${view.busy ? 'disabled' : ''}>Live this week</button></div></div>`;
}

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
    ${W._Event_today ? `<div class="ev">${esc(W._Event_today)}</div>` : ''}${(S.$ui || {}).next ? `<div class="nx">Next: ${esc(S.$ui.next.at)} · ${esc(S.$ui.next.what)}</div>` : ''}${W._Curfew ? `<div class="cf">${esc(W._Curfew)}</div>` : ''}${featureOn(S, 'happenings') ? hapCard(S) : ''}</div>`;
  // commitments
  const C = Object.entries(S.Commitments || {}).sort(([, a], [, b]) => ((a.$abs < 0) - (b.$abs < 0)) || (a.$abs - b.$abs));
  const com = C.length ? C.map(([k, c]) => {
    const lid = c.Where ? locIdOf(c.Where) : '';
    const when = c._Late ? '<span class="pill f">overdue</span>' : c._When ? `<span class="pill${/^today/.test(c._When) ? ' w' : ''}">${esc(c._When)}</span>` : (c.Due ? `<span class="pill">${esc(c.Due)}</span>` : '');
    return `<div class="item cm${c._Late ? ' late' : ''}"><div class="row"><span class="t">${esc(k)}</span>${c.Type ? `<span class="pill">${esc(c.Type)}</span>` : ''}${when}</div>
      ${c.Desc ? `<div>${esc(c.Desc)}</div>` : ''}<div class="meta">${c.With ? peopleIn(c.With, S) : ''}${c.Where ? `<span class="sub">at ${esc(c.Where)}</span>` : ''}
      ${c.Item ? `<span class="sub">bring: ${esc(c.Item)}${Object.keys(S.Inventory || {}).some(k => itemKey(k) === itemKey(c.Item) && num(S.Inventory[k].Qty, 0) > 0) ? ' (in your Bag)' : ' (not in your Bag yet)'}</span>` : ''}
      ${lid && normPlace(S.World.Location) !== normPlace(DATA.locs[lid].name) ? `<button class="btn sm" data-go="${esc(lid)}">Go here</button>` : ''}</div></div>`;
  }).join('') : '<div class="empty">Nothing promised, nothing due. Commitments appear here when you make them in the story.</div>';
  // this week's timetable
  const P = /^P(\d)/.exec(W._Period || ''), per = P ? +P[1] - 1 : -1;
  const pmRole = classRoleOf(S.Player.Profile);   // shared.js
  const rows = DAYS.map(D => {
    const evs = eventsOnDay(W.Month, W.Week, D), stop = evs.find(e => e.noclass || e.home || e.lockdown), tt = CAL.timetableFor({ Month: W.Month, Week: W.Week, Day: D }, S);   // 1.42.0: a Council member's Saturday P2
    const isToday = D === W.Day;
    const cells = !tt ? `<td colspan="3" class="off">No classes</td>` : stop ? `<td colspan="3" class="off ev">${esc(shortEv(stop.t))}</td>`
      : tt.map((c, i) => {
        // 1.33.0: Practical Magic shows {{user}}'s role class; today's free periods (engine $ui.free) are marked
        const free = isToday && ((S.$ui || {}).free || []).find(f => f.p === i);
        const label = /^Practical Magic\b/.test(c) ? `Practical Magic${pmRole ? ` · ${pmRole}` : ''}` : c.replace(/\s*\[(M|D)\]/, '');
        return `<td class="${[isToday && i === per ? 'cur' : '', free ? 'off' : ''].join(' ').trim()}"${free ? ` title="${esc(`${free.t || 'The teacher'} ${free.why}`)}"` : ''}>${esc(label)}${/\[D\]/.test(c) ? ' <span class="dm" title="Taught to each dorm separately">dorm</span>' : ''}${free ? ' <span class="dm">free period</span>' : ''}</td>`;
      }).join('');
    const extra = evs.filter(e => e !== stop).map(e => `<div class="sub ev">${esc(shortEv(e.t))}</div>`).join('');
    return `<tr class="${isToday ? 'today' : ''}"><th>${D}${extra}</th>${cells}</tr>`;
  }).join('');
  const table = `<div class="scroll"><table class="tt"><tr><th></th>${PERIOD_TEXT.map(t => `<th>${t.replace('-', '–')}</th>`).join('')}</tr>${rows}</table></div>`;
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
        ${evs.map(e => `<div class="ev">${esc(e.t.replace(/\s*\(Player\.Profile[^)]*\)/, ''))}</div>${CAL.schedOf(e, sd) ? `<div class="sub" style="margin:2px 0 6px">${esc(CAL.schedOf(e, sd))}</div>` : ''}`).join('')}${its.map(x => `<div><span class="pill">${esc(x.k)}</span> ${esc(x.t)}</div>`).join('')}
        ${!evs.length && !its.length ? '<div class="sub">Nothing on this day yet.</div>' : ''}
        <label class="f" style="margin-top:8px">Your note for this day<textarea data-mk="1" maxlength="200" placeholder="e.g. Ask Gareth to spar">${esc(view.markText)}</textarea></label>
        <div class="meta"><button class="btn sm pri" data-act="savemark" ${view.busy ? 'disabled' : ''}>Save note</button>${cur ? `<button class="btn sm del" data-act="delmark" ${view.busy ? 'disabled' : ''}>Remove note</button>` : ''}
        <span class="sub">Notes are yours: the narrator does not read them. Saving adds a small hidden entry to the chat.</span></div></div>`;
    }
  }
  // coming up (14 days): 1.44.0 the engine's Agenda feed (academy events and your own dated things; the overdue ones are under
  // Commitments), plus the birthdays your dossiers have opened (only the UI knows which)
  const up = agendaOf(S).filter(x => x.d >= 0 || x.te >= 0).map(x => ({ n: x.k === 'event' ? Math.max(0, x.d) : x.d, on: x.on, at: x.at, mine: x.k !== 'event',
    t: `${x.k === 'note' ? '✎ ' : x.k === 'birthday' ? '🎂 ' : ''}${x.t}${x.to ? ` (to ${x.to})` : ''}${x.w ? ` (with ${x.w})` : ''}` }));
  for (let n = 0; n <= 14; n++) {
    const d = dayOf(today + n), y = W.Year + (today + n >= 336 ? 1 : 0);
    for (const x of (mine[markKey(y, d.M, d.W, d.D)] || []).filter(x => x.k === 'birthday' && x.t !== 'Your birthday'))
      up.splice(_.sortedLastIndexBy(up, { n }, 'n'), 0, { n, on: `M${d.M} W${d.W} ${d.D}`, t: `🎂 ${x.t}`, mine: 1 });
  }
  const upH = up.length ? `<ul class="up">${up.map(u => `<li${u.mine ? ' class="mine"' : ''}><span class="rd">${relDay(u.n)}</span><span class="sub">${esc(u.on)}${u.at ? ' ' + u.at : ''}</span> ${esc(u.t)}</li>`).join('')}</ul>` : '<div class="empty">Nothing on the academy calendar in the next two weeks.</div>';
  return `${now}${featureOn(S, 'planner') ? `<h3>Commitments</h3>${com}` : ''}<h3>This week</h3>${table}${featureOn(S, 'routine_week') ? rpSection(S) : ''}<h3>Coming up</h3>${upH}
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
  for (const id of Object.keys(S.Bonds || {})) {
    const n = npcOf(id), f = n && n.fl.find(f => f[0] === 'Birthday');
    if (!arrived(id, S) || !f || !fieldUnlocked(id, f, S)) continue;
    const date = WHEN_RX.exec(f[1]);
    if (date) for (const y of [W.Year, W.Year + 1]) put(markKey(y, +date[1], +date[2], date[3]), 'birthday', (knowsName(id, S) ? id : 'An acquaintance') + "'s birthday");
  }
  for (const [key, t] of Object.entries((S.$ui || {}).marks || {})) if (t) put(key, 'note', t);
  return out;
}

// ---------------------------------------------------------------- journal
function nbJournal(S) {
  // 1.7.4: from campaign Year 2 lines carry their year ("[Y2 M1 W1 Mon]"); a line without one is from Year 1. Groups are year + month.
  const parse = (l, old) => { const m = /^\[(?:Y(\d+) )?M(\d+) W(\d) (\w{3})\]\s*(.*)$/.exec(l); return m ? { Y: +(m[1] || 1), M: +m[2], W: +m[3], D: m[4], t: m[5], old, g: `${+(m[1] || 1)}-${+m[2]}` } : { M: 0, t: l, old, g: '0' }; };
  // 5.3 (F21): archived lines (the narrator no longer reads them) stay in the player's journal, shown faded. 1.57.0 (U3): the engine's
  // notes (rank and reputation changes, marks, recaps; $ui.jnotes) join them in date order, faded too: the narrator reads neither
  const DI = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const key = e => (e.M ? ((e.Y - 1) * 12 + e.M) * 100 + e.W * 10 + (DI[e.D] || 0) : 0);
  const J0 = [...((S.$ui || {}).archive || []).map(l => parse(l, true)), ...(S.Journal || []).map(l => parse(l, false)), ...((S.$ui || {}).jnotes || []).map(l => ({ ...parse(l, true), note: true }))];
  const J = J0.map((e, i) => [e, i]).sort((a, b) => key(a[0]) - key(b[0]) || a[1] - b[1]).map(x => x[0]);
  const groups = _.groupBy([...J].reverse(), 'g'), years = J.some(e => e.Y > 1);
  const months = [...new Set([...J].reverse().map(e => e.g))];
  const tl = J.length ? months.map(g => { const e0 = groups[g][0]; return `<h4>${e0.M ? `${years ? `Year ${e0.Y}, ` : ''}Month ${e0.M}` : 'Undated'}</h4><ol class="jt">${groups[g].map(e => `<li${e.note ? ' class="old" title="Engine note: kept for you; the narrator reads it from the state instead"' : e.old ? ' class="old" title="Archived: the narrator no longer reads this line"' : ''}>${e.W ? `<span class="sub">W${e.W} ${e.D}</span>` : ''}${esc(e.t)}</li>`).join('')}</ol>`; }).join('') : '<div class="empty">Nothing written yet.</div>';
  const CS = S.Campus_State || {}, ev = Object.entries(CS.Events || {}), ru = [...(CS.Rumours || [])].reverse();
  // 1.60.0: lasting changes to the world's facts (Campus_State.Lore_changes) and what caused them; Undo is the player's veto
  const LC = Object.entries(CS.Lore_changes || {}).filter(([, v]) => v && v.Now);
  const lcHtml = LC.length ? `<h3>Lasting changes</h3><p class="sub">Facts of the world that changed in your story; they override the lore from now on. Undo one the story never earned.</p><dl class="kv">${LC.map(([k, v], i) => `<dt>${esc(k)}</dt><dd>${esc(v.Now)}${v.Cause ? `<span class="sub"> · because ${esc(v.Cause)}</span>` : ''}${v.Since ? `<span class="sub"> · ${esc(v.Since)}</span>` : ''} <button class="btn sm" data-lcundo="${i}">Undo</button></dd>`).join('')}</dl>` : '';
  // 1.1.0 (spec §3): how far each rumour has spread; rumours that died out stay, faded
  const gs = featureOn(S, 'gossip') ? Object.fromEntries(((S.$ui || {}).gossip || []).map(g => [g[0], g])) : {}, old = [...((S.$ui || {}).rumours_old || [])].reverse();
  return `<p class="lead">The turning points of your year, written as they happen. The narrator reads the latest 30 lines as the story's spine; scene details come from chat memory. Faded lines are kept for you only: older entries, and the engine's notes (ranks, reputation, marks, recaps).</p>${tl}
    ${lcHtml}<h3>Campus news</h3>${ev.length ? `<dl class="kv">${ev.map(([k, v]) => { const o = v && typeof v === 'object' ? v : { Text: v }; return `<dt>${esc(k)}</dt><dd>${esc(o.Text || '')}${o.Updated ? `<span class="sub"> · ${esc(o.Updated)}</span>` : ''}</dd>`; }).join('')}</dl>` : '<div class="empty">Nothing has changed on campus yet.</div>'}
    ${ru.length || old.length ? `<h3>Rumours</h3><ul class="log">${ru.map(r => `<li>${esc(r)}${gs[r] ? `<span class="reach">${esc(gs[r][1])} · day ${gs[r][2]}</span>` : ''}</li>`).join('')}${old.map(r => `<li class="old" title="Died out">${esc(r)}</li>`).join('')}</ul>` : ''}`;
}

// ---------------------------------------------------------------- notice board
// 1.44.0: the Agenda feed's academy events from yesterday to ten days ahead (the Month 12 holiday is not posted)
function officialNotices(S) {
  return agendaOf(S).filter(x => x.k === 'event' && !x.h && x.d <= 10).map(x => ({ n: x.d, on: x.on, t: x.r ? 'Results and dorm rankings' : shortEv(x.t), x: x.t }));
}
function nbNotices(S) {
  const off = officialNotices(S).map(o => `<div class="note off"><b>${esc(o.t)}</b><div>${esc(o.x)}</div><div class="sub">${esc(`${relDay(o.n)} · ${o.on}`)} · Academy Administration</div></div>`).join('');
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
      <div class="sub">${esc([c.Found, c.Where, CLUE_SRC[c.Source]].filter(Boolean).join(' · '))}</div>${c.Links.length ? `<div class="meta">${c.Links.map(x => linkChip(x, S)).join('')}</div>` : ''}
      ${m.Status === 'open' ? `<button class="btn sm" data-fill="${esc(`I follow up on the clue "${k}": `)}">Follow up</button>` : ''}</div>`).join('')}</div></section>`;
  }).join('');
  const sec = _.groupBy(secretsOf(S), x => String(x).split('.')[0]);
  const truths = Object.entries(sec).map(([who, xs]) => {
    const id = Object.keys(DATA.npcs || {}).find(k => k.toLowerCase() === who.toLowerCase());
    const topics = xs.map(x => String(x).split('.').slice(1).join('.') || 'other');
    return `<div class="truth">${id ? linkChip(id, S) : `<span class="pill">${esc(who)}</span>`}<span>${topics.map(tp => `<span class="pill g">${esc(tp)}</span>`).join('')}</span></div>`;
  }).join('');
  const hh = heardOf(S), open = Object.keys(My).filter(t => My[t].Status === 'open' && t !== 'Unsorted clues');
  if (!['Unsorted clues', ...open].includes(view.pinTh)) view.pinTh = 'Unsorted clues';
  const heardH = hh.length ? `<h3>Heard around campus</h3><details><summary>${hh.length} rumour${hh.length === 1 ? '' : 's'} and stories you can pin</summary><p class="hint">Pin one to a thread to keep it as a clue. It stays hearsay until the story bears it out.</p>
    <label class="f">Pin to<select data-pinth="1">${['Unsorted clues', ...open].map(t => `<option${t === view.pinTh ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
    <ul class="log">${hh.map((x, i) => `<li><span class="pill">${x.src === 'rumour' ? 'rumour' : 'story'}</span> ${esc(x.src === 'rumour' ? x.d : `${x.key}: ${x.d}`)} <button class="btn sm" data-pin="${i}" ${view.busy ? 'disabled' : ''}>Pin as a clue</button></li>`).join('')}</ul></details>` : '';
  return `<p class="lead">What you have noticed, and what it might mean. Clues are pinned by thread; solved threads move to the bottom.</p>
    ${board || '<div class="empty">No clues yet.</div>'}${heardH}${truths ? `<h3>Truths uncovered</h3><p class="hint">Opens the matching part of each person's dossier.</p>${truths}` : ''}`;
}
// 1.44.0 (audit 3.12): what {{user}} has heard and not pinned yet: the rumours going around, and the places' stories ($ui.lore).
// A pinned one is a Clue with Source rumour / story (hearsay); Encyclopaedic later looks it up in the records (engine recordsLead).
const CLUE_SRC = { rumour: 'hearsay (a rumour)', story: 'hearsay (a story)', records: 'from the records' };
const clueKey = t => String(t).replace(/[./~]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
function heardOf(S) {
  const Cl = S.Clues || {}, details = new Set(Object.values(Cl).map(c => c.Detail)), heard = new Set(((S.$ui || {}).lore || []).map(String)), out = [];
  for (const r of ((S.Campus_State || {}).Rumours || [])) out.push({ src: 'rumour', key: clueKey(`Rumour: ${String(r).split(/\s+/).slice(0, 7).join(' ')}`), d: String(r), w: '' });
  for (const l of Object.values(DATA.locs || {})) for (const x of l.lore || []) if (heard.has(String(x.uid)) && !out.some(o => o.uid === x.uid))
    out.push({ src: 'story', uid: x.uid, key: clueKey(x.title), d: String(x.summary || '').replace(/^Story:\s*/, '').slice(0, 220), w: l.name });
  return out.filter(x => !(x.key in Cl) && !details.has(x.d));
}
