// ================================================================ 1.70.0 scene cards (owner, mockup "Halvard Scene Cards")
// Under the narration of the newest story reply: one card per person in Scene.Present, with the full portrait, their true
// thoughts (the preset's <npc_thoughts> block of the same reply, matched by name) and the bond meters. The cards live in
// SillyTavern's own message (.mes_text, styled from <head>) and replace the bracelet's portrait strip while this script runs.
// Without the preset's block (another preset, its toggle off) the cards still show, without thoughts. Only the reply that carries
// the bracelet gets cards; older replies keep the folded 🧠 block.
const SCENE_PH = '<Status' + 'PlaceHolderImpl/>';
const SCENE_FULL = 3;   // full cards; anyone else present goes on the "Also here" row (a class can hold a dozen)

// '- **Name**: thought' or '- **Name** (where, doing): thought'; continuation lines belong to the last name
function sceneThoughts(text) {
  const m = String(text || '').match(/<npc_thoughts>([\s\S]*?)<\/npc_thoughts>/i); if (!m) return null;
  const out = []; let cur = null;
  const clean = s => s.replace(/\*\*?|__?/g, '').replace(/^["“]|["”]$/g, '').trim();
  m[1].split('\n').forEach(line => {
    const h = line.match(/^\s*[-*•]\s*\*\*([^*]+?)\*\*\s*(?:\(([^)]*)\))?\s*:?\s*(.*)$/);
    if (h) { cur = { name: h[1].replace(/:\s*$/, '').trim(), where: (h[2] || '').trim(), lines: [] }; if (clean(h[3])) cur.lines.push(clean(h[3])); out.push(cur); }
    else if (cur && clean(line.replace(/^\s*[-*•]\s*/, ''))) cur.lines.push(clean(line.replace(/^\s*[-*•]\s*/, '')));
  });
  return out.filter(t => t.name && t.lines.length);
}
// a thought's name -> an id: the present person first, then the roster (full name, first name)
function sceneIdOf(name, ids) {
  const k = String(name).toLowerCase().trim(), first = k.split(/\s+/)[0];
  const hit = list => list.find(id => { const n = npcOf(id), full = (n ? n.n : id).toLowerCase(); return k === id.toLowerCase() || k === full || full.split(/\s+/)[0] === first; });
  return hit(ids) || hit(Object.keys(DATA.npcs || {})) || '';
}

const scenePic = (id, S, cls) => {
  const n = npcOf(id), label = n ? (knowsName(id, S) ? initials(n.n) : '?') : initials(id);
  const pos = n && n.fc ? `object-position:${n.fc[0]}% ${n.fc[1]}%` : '';
  const src = n && (cls === 'face' ? n.t : n.p || n.t);
  return src ? `<img class="${cls}" src="${esc(imgURL(src))}" alt="" style="${pos}" data-fb="${esc(label)}">` : `<span class="${cls} fb">${esc(label)}</span>`;
};

// 1.71.0 (owner, mockup v2): actions, each the doorway to a system the engine already runs for THIS person, here, now. A button
// only drafts the action into the chat box (D3/D6: the UI never moves the story); the engine settles it with its own limits, and
// the narrator plays the answer in character. Nothing shows that cannot work now (another dorm's spar, a rank not reached).
function sceneActions(id, S) {
  const n = npcOf(id), b = (S.Bonds || {})[id]; if (!n || !b) return '';
  const W = S.World || {}, P = (S.Player || {}).Profile || {}, staff = n.g === 'Staff';
  const nm = knowsName(id, S) ? id : 'the ' + (n.r || n.d.charAt(0).toLowerCase() + n.d.slice(1));
  const his = n.gn === 'F' ? 'her' : n.gn === 'M' ? 'his' : 'their';
  const btn = (label, small, text, cls) => `<button type="button" class="act${cls ? ' ' + cls : ''}" data-eld-fill="${esc(text)}">${esc(label)}${small ? ` <small>${esc(small)}</small>` : ''}</button>`;
  const out = [];
  // a favour this person asked of {{user}} (Commitment Type "favour", 1.49.0): kept = a help deed
  Object.entries(S.Commitments || {}).filter(([, c]) => c && c.Type === 'favour' && sceneIdOf(c.With || '', [id]) === id)
    .forEach(([k, c]) => out.push(btn(`Do ${nm}'s favour`, `"${k}"${c.Due ? ' · due ' + c.Due : ''}`, `I take care of ${nm}'s favour, "${k}": `)));
  // Practice with a partner at this place (data/practice.json; the engine's live list says what is still open today)
  const here = locIdOf(W.Location), live = (S.$ui || {}).practice || [];
  (DATA.practice || []).filter(a => a.partner && a.loc === here).forEach(a => {
    const l = live.find(x => x.action === a.action); if (!l || l.locked) return;
    if (a.dorm && n.dm !== P.Dorm && !/Training Week/i.test(W._Event_today || '')) return;   // sparring: the same dorm (engine rule)
    const place = DATA.locs[a.loc].name, stat = a.stat === 'subject' ? 'a subject' : a.stat;
    const label = /a partner/.test(a.action) ? a.action.replace('a partner', nm) : `${a.action}, with ${nm}`;
    out.push(btn(label, `${stat} +${a.xp}`, a.stat === 'subject' ? `I ask ${nm} to join me at ${place} for ${a.action.toLowerCase()} on [subject]: ` : `I ask ${nm} to join me at ${place} and ${a.action.toLowerCase().replace('a partner', nm)}: `));
  });
  // Rank 4: this person's own training tracks (data/rank4_partners.json, +25% a session)
  if (b.Rank >= 4) rank4For(id).forEach(t => out.push(t === 'study' ? btn('Study together', '+25%', `I ask ${nm} to study with me: `)
    : btn(`${t === 'mana' ? 'Mana' : 'Stamina'} training`, '+25%', `I ask ${nm} to join me for a ${t} training session: `)));
  if (b.Rank >= 2) out.push(btn(`Invite ${nm}`, '+1 XP, first each week', `I invite ${nm} to `));
  const bag = Object.keys(S.Inventory || {});
  if (bag.length) {
    const G = b.$gifts || {};
    out.push(`<span class="gift"><button type="button" class="act" data-eld-gift="1" aria-haspopup="menu">Give a gift ▾</button><span class="pop" role="menu"><span class="h">From your Bag${Object.keys(G).length ? ` · what you know ${nm} thinks` : ''}</span>${bag.map(item =>
      `<button type="button" role="menuitem" data-eld-fill="${esc(`I give ${nm} the ${item}: `)}">${esc(item)}${(S.Inventory[item] || {}).Qty > 1 ? ` ×${S.Inventory[item].Qty}` : ''}<span class="t ${esc(G[item] || '')}">${esc(G[item] || 'not tried')}</span></button>`).join('')}</span></span>`);
  }
  if (b.Rank >= 5) out.push(btn(`Help with ${his} goal`, 'Rank 5', `I offer to help ${nm} with ${his} goal: `));
  if (b.Rank >= 6) out.push(btn(`Meet ${his} friends`, 'Rank 6', `I ask ${nm} to introduce me to one of ${his} friends: `));
  if (b.Rank >= 7) {
    if (staff) out.push(btn(`Visit ${nm} at work`, 'Rank 7', `I drop by to see ${nm} at work: `));
    else if (n.dm && n.dm !== P.Dorm) out.push(btn(`Visit the ${n.dm} Dormitory`, 'Rank 7', `I ask ${nm} to take me inside the ${n.dm} Dormitory: `));
  }
  // an apology eases Tension (once a day, by the person's category); from Friction up
  if (!TEND.lock.includes(id) && num(b.Tension) >= ((TEND.bands || [])[1] || [20])[0]) out.push(btn('Make amends', `Tension: ${tensionBand(b.Tension)}`, `I apologise to ${nm}: `, 'soft'));
  return out.length ? `<div class="acts">${out.join('')}</div>` : '';
}

// 1.72.0: a special day's tone beside the mood: a calendar day always, a birthday once the dossier has opened it
function moodDay(id, mood, n, S) {
  const bd = mood.bd && n && n.fl.some(f => f[0] === 'Birthday' && fieldUnlocked(id, f, S));
  return [mood.day ? [mood.tone, mood.day] : null, bd ? [mood.bd, 'birthday'] : null].filter(Boolean)
    .map(([t, d]) => `<span class="chip mood" title="${esc(d)}">${esc(t)} · ${esc(d)}</span>`).join('');
}
function sceneCard(id, v, th, S, hasBlock) {
  const n = npcOf(id), b = (S.Bonds || {})[id], ui = S.$ui || {}, known = !n || knowsName(id, S);
  const sub = !n ? 'Invented character' : known ? (b && b.Title) || publicRole(id, S) || whoLine(id, S) : whoLine(id, S);
  const mood = (ui.wxfx || 'full') !== 'off' && b && b.Rank >= 4 && (ui.moods || {})[id];
  const xr = !n ? ((S.Extras || {})[id] || null) : null, pin = xr && xr.Keep;
  const note = v && v.Note ? `<div class="doing"><b>Now:</b> ${esc(v.Note)}</div>` : '';
  const thought = th ? `<div class="lbl">true thoughts${th.where ? ` <span>· ${esc(th.where)}</span>` : ''}</div><blockquote class="thought">${th.lines.map(l => `<p>${esc(l)}</p>`).join('')}</blockquote>`
    : hasBlock ? '<div class="none">No thoughts shown this turn.</div>' : '';
  const stats = b ? `<div class="top"><span class="medal" title="Rank ${b.Rank} of 10">${b.Rank}</span><span class="rk"><b>Rank ${b.Rank}</b><span>of 10${b.Romance ? ' · romance' : ''}</span></span></div>${bondMeters(id, b, S)}`
    + (mood ? `<div class="chips"><span class="chip mood">${esc(mood.mood)} mood</span>${moodDay(id, mood, n, S)}</div>` : '')
    : `<div class="top"><span class="medal">–</span><span class="rk"><b>${n ? 'Not met yet' : 'Passing through'}</b><span>${n ? 'no bond' : pin ? 'kept in the record' : 'not kept'}</span></span></div>`;
  const act = n ? `<button type="button" class="dos" data-eld-open="npc:${esc(id)}">Dossier</button>`
    : `<button type="button" class="dos" data-eld-keep="${esc(id)}" title="${pin ? 'Let them leave the record of invented characters' : 'Keep them in the record of invented characters'}">${pin ? 'Let go' : 'Keep in record'}</button>`;
  return `<section class="sc" style="--ring:${n ? n.dc : '#4a546c'}" aria-label="${esc(known ? nameOf(id, S, true) : 'Someone you have not met')}">
    <div class="pic">${scenePic(id, S, 'portrait')}<div class="cap"><div class="nm">${esc(n ? (known ? n.n : nameOf(id, S, true)) : id)}</div><div class="rl">${esc(sub)}</div></div></div>
    <div class="th">${note}${thought}${sceneActions(id, S)}</div>
    <div class="st">${stats}${act}</div></section>`;
}

// the whole block for one reply: { html, folded } (folded: the reply's thoughts all moved into cards or the "elsewhere" rows)
function sceneHTML(S, text) {
  const P = (S && S.Scene && S.Scene.Present) || {}, ids = Object.keys(P);
  if (!ids.length) return { html: '', folded: false };
  const all = sceneThoughts(text), hasBlock = !!all, byId = {}, away = [];
  (all || []).forEach(t => { const id = sceneIdOf(t.name, ids); if (id && ids.includes(id)) { if (!byId[id]) byId[id] = t; } else away.push([id, t]); });
  const order = ids.filter(id => byId[id]).concat(ids.filter(id => !byId[id]));   // people with thoughts get the full cards
  const full = order.slice(0, SCENE_FULL), rest = order.slice(SCENE_FULL);
  let h = '<div class="hd">On scene</div>' + full.map(id => sceneCard(id, P[id], byId[id], S, hasBlock)).join('');
  if (rest.length) h += `<div class="also"><span class="lbl">also here</span>${rest.map(id => { const n = npcOf(id);
    return `<button type="button" ${n ? `data-eld-open="npc:${esc(id)}"` : `data-eld-keep="${esc(id)}"`} title="${esc((n ? nameOf(id, S, true) : id) + (P[id] && P[id].Note ? ': ' + P[id].Note : ''))}" style="--ring:${n ? n.dc : '#4a546c'}">${scenePic(id, S, 'face')}<span>${esc(n ? (knowsName(id, S) ? id : '?') : id)}</span>${byId[id] ? '<i class="has" title="has thoughts"></i>' : ''}</button>`; }).join('')}</div>`;
  h += away.map(([id, t]) => { const n = npcOf(id), who = n ? (knowsName(id, S) ? n.n : nameOf(id, S, true)) : t.name;
    return `<div class="away" style="--ring:${n ? n.dc : '#4a546c'}">${n ? scenePic(id, S, 'face') : `<span class="face fb">${esc(initials(t.name))}</span>`}<div class="t"><b>${esc(who)}</b> <span>· elsewhere${t.where ? ': ' + esc(t.where) : ''}</span><br><i>${t.lines.map(esc).join(' ')}</i></div></div>`; }).join('');
  return { html: h, folded: hasBlock && all.length > 0 };
}

const SCENE_CSS = `
.eld-scene{--sheet:#1c2230;--well:#10141d;--card:#242b3b;--rule:#353e52;--rule2:#4a546c;--brass:#c9a364;--brass-hi:#ecd49f;--brass-lo:#7d5f34;
  --moon:#a3e6db;--ink:#ece7db;--ink2:#c3beb2;--ink3:#aaa69b;--head:#f3e8cf;--good:#8fd0b4;--warn:#f0bd78;--rom:#f2b6cb;
  --f-ui:"Alegreya Sans",system-ui,sans-serif;--f-text:"Alegreya",Georgia,serif;--f-sc:"Alegreya SC","Alegreya",Georgia,serif;
  container-type:inline-size;display:flex;flex-direction:column;gap:10px;margin:14px 0 8px;font-family:var(--f-ui);font-size:15px;line-height:1.45;color:var(--ink);text-align:left}
.eld-scene *{box-sizing:border-box}
.eld-scene .hd{display:flex;align-items:center;gap:10px;font-family:var(--f-sc);font-size:13px;letter-spacing:.1em;color:var(--brass);text-transform:lowercase}
.eld-scene .hd::before,.eld-scene .hd::after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,var(--brass-lo),transparent)}
.eld-scene .sc{--ring:#4a546c;display:grid;grid-template-columns:minmax(140px,190px) minmax(0,1fr) 205px;grid-template-areas:"pic th st";
  background:linear-gradient(180deg,color-mix(in srgb,var(--ring) 9%,var(--sheet)),var(--sheet) 55%);border:1px solid var(--rule);border-radius:14px}
.eld-scene .pic{grid-area:pic;position:relative;aspect-ratio:2/3;max-width:100%;background:var(--well);box-shadow:inset -1px 0 0 var(--rule);border-radius:13px 0 0 13px;overflow:hidden}
.eld-scene .pic .portrait{display:block;width:100%;height:100%;margin:0;border:0;border-radius:0;max-width:none;object-fit:cover;object-position:50% 20%}
.eld-scene .pic .portrait.fb{display:grid;place-items:center;font-family:var(--f-text);font-size:56px;color:var(--rule2);background:radial-gradient(circle at 50% 38%,#2a2f3b,var(--well) 70%)}
.eld-scene .pic::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ring) 55%,transparent);pointer-events:none}
/* 1.88.0 (owner: unreadable on Frost and Parchment): the caption sits on the portrait, not the panel, so a theme leaves its colours alone */
.eld-scene .cap{position:absolute;left:0;right:0;bottom:0;padding:34px 12px 10px;background:linear-gradient(180deg,transparent,rgba(10,13,20,.92)/*keep*/ 60%)}
.eld-scene .nm{font-family:var(--f-text);font-weight:700;font-size:19px;line-height:1.15;color:#f3e8cf/*keep*/;text-shadow:0 1px 3px rgba(0,0,0,.7)/*keep*/}
.eld-scene .rl{font-size:12.5px;color:#c3beb2/*keep*/;line-height:1.3;margin-top:2px}
.eld-scene .th{grid-area:th;padding:16px 20px;display:flex;flex-direction:column;gap:10px;min-width:0}
.eld-scene .lbl{font-family:var(--f-sc);font-size:12.5px;letter-spacing:.09em;color:var(--brass);text-transform:lowercase}
.eld-scene .lbl span{letter-spacing:0;text-transform:none;font-family:var(--f-ui);color:var(--ink3)}
.eld-scene .doing{font-size:13.5px;color:var(--ink3);font-style:italic}
.eld-scene .doing b{font-style:normal;color:var(--ink2);font-weight:500}
.eld-scene .thought{margin:0;padding:2px 0 2px 16px;border:0;border-left:2px solid color-mix(in srgb,var(--ring) 70%,var(--brass-lo));background:none;
  font-family:var(--f-text);font-style:italic;font-size:16.5px;line-height:1.6;color:var(--ink);display:flex;flex-direction:column;gap:6px}
.eld-scene .thought p{margin:0}
.eld-scene .none{color:var(--ink3);font-style:italic;font-size:14px}
.eld-scene .st{grid-area:st;padding:16px 16px 14px;border-left:1px solid var(--rule);display:flex;flex-direction:column;gap:11px;background:rgba(16,20,29,.35);border-radius:0 13px 13px 0}
.eld-scene .top{display:flex;align-items:center;gap:10px}
.eld-scene .medal{width:44px;height:44px;flex:none;border-radius:50%;display:grid;place-items:center;font-family:var(--f-text);font-weight:700;font-size:20px;line-height:1;color:var(--brass-hi);font-variant-numeric:lining-nums;
  background:radial-gradient(circle at 35% 28%,color-mix(in srgb,var(--brass) 30%,var(--card)) 0%,var(--card) 70%);box-shadow:inset 0 0 0 1.5px var(--brass),inset 0 0 0 4px var(--card),inset 0 0 0 5px var(--brass-lo)}
.eld-scene .rk{display:flex;flex-direction:column;line-height:1.2}
.eld-scene .rk b{font-family:var(--f-sc);font-size:14px;letter-spacing:.03em;color:var(--brass-hi);font-variant-numeric:lining-nums}
.eld-scene .rk span{font-size:12px;color:var(--ink3)}
.eld-scene .m{display:block;min-width:0}
.eld-scene .ml{display:flex;justify-content:space-between;gap:6px;font-size:12.5px;color:var(--ink3)}
.eld-scene .ml b{color:var(--ink2);font-weight:500;font-variant-numeric:lining-nums tabular-nums;white-space:nowrap}
.eld-scene .mini{display:block;height:6px;margin-top:4px;border-radius:99px;background:rgba(0,0,0,.36);overflow:hidden}
.eld-scene .mini i{display:block;height:100%}
.eld-scene .mini.xp i{background:var(--brass)}
.eld-scene .chips{display:flex;flex-wrap:wrap;gap:6px}
.eld-scene .chip{font-size:12px;border:1px solid color-mix(in srgb,var(--brass) 55%,transparent);border-radius:99px;padding:1px 9px;color:var(--brass-hi)}
.eld-scene button{font:inherit;cursor:pointer}
.eld-scene .dos{margin-top:auto;align-self:flex-start;font-size:13px;color:var(--brass-hi);background:transparent;border:1px solid var(--brass-lo);border-radius:8px;padding:4px 12px}
.eld-scene .dos:hover{background:color-mix(in srgb,var(--brass) 12%,transparent)}
.eld-scene button:focus-visible{outline:2px solid var(--moon);outline-offset:2px}
.eld-scene .acts{margin-top:auto;display:flex;flex-wrap:wrap;gap:6px;padding-top:12px;border-top:1px solid rgba(53,62,82,.7)}
.eld-scene .act{display:inline-flex;align-items:baseline;gap:6px;font-size:13.5px;line-height:1.3;color:var(--brass-hi);background:color-mix(in srgb,var(--brass) 6%,transparent);
  border:1px solid var(--brass-lo);border-radius:8px;padding:4px 11px;text-align:left}
.eld-scene .act small{font-size:11.5px;color:var(--ink3)}
.eld-scene .act:hover{background:color-mix(in srgb,var(--brass) 14%,transparent)}
.eld-scene .act.soft{color:var(--warn);border-color:color-mix(in srgb,var(--warn) 50%,transparent);background:transparent}
.eld-scene .gift{position:relative;display:inline-block}
.eld-scene .pop{display:none;position:absolute;left:0;bottom:calc(100% + 6px);z-index:5;width:270px;max-width:75vw;max-height:260px;overflow-y:auto;background:var(--card);
  border:1px solid var(--brass-lo);border-radius:10px;padding:6px;box-shadow:0 14px 30px rgba(0,0,0,.45)}
.eld-scene .gift.open .pop{display:block}
.eld-scene .pop .h{display:block;font-size:12px;color:var(--ink3);padding:4px 8px 6px;border-bottom:1px solid var(--rule)}
.eld-scene .pop button{display:flex;width:100%;justify-content:space-between;align-items:center;gap:8px;font-size:13.5px;color:var(--ink);background:none;border:0;border-radius:6px;padding:6px 8px;text-align:left}
.eld-scene .pop button:hover{background:rgba(255,255,255,.05)}
.eld-scene .pop .t{font-size:11.5px;border-radius:99px;padding:0 7px;border:1px solid var(--rule2);color:var(--ink3);white-space:nowrap}
.eld-scene .pop .t.loved{color:var(--rom);border-color:var(--rom)}.eld-scene .pop .t.liked{color:var(--good);border-color:var(--good)}
.eld-scene .pop .t.disliked,.eld-scene .pop .t.hated{color:var(--warn);border-color:var(--warn)}
.eld-scene .face{width:38px;height:38px;flex:none;border-radius:50%;margin:0;border:0;max-width:none;object-fit:cover;object-position:50% 25%;background:var(--well);
  box-shadow:0 0 0 2px var(--sheet),0 0 0 3.5px var(--ring,var(--rule2));display:grid;place-items:center;font-weight:700;font-size:13px;color:var(--ink2)}
.eld-scene .also{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:8px 12px;border:1px solid var(--rule);border-radius:12px;background:rgba(28,34,48,.7)}
.eld-scene .also button{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;width:52px;background:none;border:0;padding:0;color:var(--ink2);font-size:12px}
.eld-scene .also button span{max-width:52px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.eld-scene .also .has{position:absolute;right:4px;top:0;width:9px;height:9px;border-radius:50%;background:var(--brass);box-shadow:0 0 0 2px var(--sheet)}
.eld-scene .away{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--rule);border-radius:12px;padding:10px 14px;background:rgba(28,34,48,.7)}
.eld-scene .away .t{min-width:0;font-size:14px;color:var(--ink2)}
.eld-scene .away b{color:var(--head)}
.eld-scene .away i{font-family:var(--f-text);font-size:15.5px;color:var(--ink)}
@container (max-width:620px){
  .eld-scene .sc{grid-template-columns:118px minmax(0,1fr);grid-template-areas:"pic st" "th th"}
  .eld-scene .st{border-left:0;background:transparent;padding:12px 12px 10px;gap:9px}
  .eld-scene .th{border-top:1px solid var(--rule);padding:12px 14px}
  .eld-scene .pic{border-radius:13px 0 0 0}
  .eld-scene .cap{padding:24px 8px 7px}.eld-scene .nm{font-size:15px}.eld-scene .rl{display:none}
  .eld-scene .thought{font-size:15.5px}
  .eld-scene .dos{margin-top:2px}
}
.mes_text.eld-scene-on details[data-npc-thoughts]{display:none}`;

// ---- in SillyTavern's chat: the reply that carries the bracelet (the newest visible story reply with MVU's placeholder)
function sceneTarget() {
  try {
    const last = getLastMessageId();
    for (let i = last; i >= Math.max(0, last - 12); i--) {
      const m = (getChatMessages(i) || [])[0];
      if (m && !m.is_hidden && m.role !== 'user' && String(m.message || '').includes(SCENE_PH)) return { id: i, text: String(m.message || '') };
    }
  } catch (e) { /* no chat */ }
  return null;
}
function sceneStyle() {
  ensureFonts();
  let el = PD.getElementById('eldrasil-scene-css'); if (!el) { el = PD.createElement('style'); el.id = 'eldrasil-scene-css'; PD.head.appendChild(el); }
  const css = themed(SCENE_CSS); if (el.textContent !== css) el.textContent = css;
}
let sceneObs = null;
function sceneClear(keep) {
  PD.querySelectorAll('#chat .eld-scene').forEach(x => { if (x !== keep) x.remove(); });
  PD.querySelectorAll('#chat .mes_text.eld-scene-on').forEach(x => { if (!keep || !x.contains(keep)) x.classList.remove('eld-scene-on'); });
}
function sceneRender() {
  try {
    const t = sceneTarget(), st = latestState(), S = st && st.data && st.data.stat_data;
    const mt = t && PD.querySelector(`#chat > .mes[mesid="${t.id}"] .mes_text`);
    // while the reply is being edited its .mes_text holds the edit box: no cards until the edit is saved
    const out = mt && S && !mt.querySelector('textarea') ? sceneHTML(S, t.text) : { html: '' };
    if (sceneObs) { sceneObs.disconnect(); sceneObs = null; }
    if (!out.html) { sceneClear(null); return; }
    sceneStyle();
    let box = mt.querySelector(':scope > .eld-scene');
    if (!box) { box = PD.createElement('div'); box.className = 'eld-scene'; }
    const sig = String(hash32(out.html));
    if (box.dataset.sig !== sig) { box.innerHTML = out.html; box.dataset.sig = sig; }
    // under the narration: before the thoughts block or the state update, else at the end
    const at = mt.querySelector(':scope > details[data-npc-thoughts], :scope > details.eld-uv') || null;
    if (box.parentNode !== mt || (at ? box.nextElementSibling !== at : mt.lastElementChild !== box)) mt.insertBefore(box, at);
    sceneClear(box);
    mt.classList.toggle('eld-scene-on', out.folded);
    // SillyTavern and Tavern Helper rewrite .mes_text (an update, macros): put the cards back when they go
    sceneObs = new MutationObserver(() => { if (!box.isConnected || box.parentNode !== mt) sceneBoot(); });
    sceneObs.observe(mt, { childList: true });
  } catch (e) { console.warn('[Eldrasil] scene cards', e); }
}
const sceneBoot = _.debounce(sceneRender, 250);
// one listener on SillyTavern's document: the cards are rebuilt often, so nothing is bound to them
function sceneClick(e) {
  const b = e.target.closest && e.target.closest('.eld-scene button');
  PD.querySelectorAll('.eld-scene .gift.open').forEach(g => { if (!b || !g.contains(b)) g.classList.remove('open'); });   // any click closes an open gift list
  if (!b) return;
  if (b.dataset.eldGift) { b.parentNode.classList.toggle('open'); return; }
  if (b.dataset.eldFill) { b.closest('.gift') && b.closest('.gift').classList.remove('open'); fillChat(b.dataset.eldFill); return; }
  if (b.dataset.eldOpen) open(b.dataset.eldOpen);
  else if (b.dataset.eldKeep) toggleKeep(b.dataset.eldKeep);
}
function sceneImgError(e) {   // a portrait that fails to load becomes the initials (error does not bubble: capture)
  const img = e.target; if (!img || img.tagName !== 'IMG' || !img.dataset.fb || !img.closest('.eld-scene')) return;
  const sp = PD.createElement('span'); sp.className = img.className + ' fb'; sp.textContent = img.dataset.fb; img.replaceWith(sp);
}
