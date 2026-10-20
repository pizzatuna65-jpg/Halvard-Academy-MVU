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

function sceneCard(id, v, th, S, hasBlock) {
  const n = npcOf(id), b = (S.Bonds || {})[id], ui = S.$ui || {}, known = !n || knowsName(id, S);
  const sub = !n ? 'Invented character' : known ? (b && b.Title) || publicRole(id, S) || whoLine(id, S) : whoLine(id, S);
  const mood = (ui.wxfx || 'full') !== 'off' && b && b.Rank >= 4 && (ui.moods || {})[id];
  const xr = !n ? ((S.Extras || {})[id] || null) : null, pin = xr && xr.Keep;
  const note = v && v.Note ? `<div class="doing"><b>Now:</b> ${esc(v.Note)}</div>` : '';
  const thought = th ? `<div class="lbl">true thoughts${th.where ? ` <span>· ${esc(th.where)}</span>` : ''}</div><blockquote class="thought">${th.lines.map(l => `<p>${esc(l)}</p>`).join('')}</blockquote>`
    : hasBlock ? '<div class="none">No thoughts shown this turn.</div>' : '';
  const stats = b ? `<div class="top"><span class="medal" title="Rank ${b.Rank} of 10">${b.Rank}</span><span class="rk"><b>Rank ${b.Rank}</b><span>of 10${b.Romance ? ' · romance' : ''}</span></span></div>${bondMeters(id, b, S)}`
    + (mood ? `<div class="chips"><span class="chip mood">${esc(mood.mood)} mood</span></div>` : '')
    : `<div class="top"><span class="medal">–</span><span class="rk"><b>${n ? 'Not met yet' : 'Passing through'}</b><span>${n ? 'no bond' : pin ? 'kept in the record' : 'not kept'}</span></span></div>`;
  const act = n ? `<button type="button" class="dos" data-eld-open="npc:${esc(id)}">Dossier</button>`
    : `<button type="button" class="dos" data-eld-keep="${esc(id)}" title="${pin ? 'Let them leave the record of invented characters' : 'Keep them in the record of invented characters'}">${pin ? 'Let go' : 'Keep in record'}</button>`;
  return `<section class="sc" style="--ring:${n ? n.dc : '#4a546c'}" aria-label="${esc(known ? nameOf(id, S, true) : 'Someone you have not met')}">
    <div class="pic">${scenePic(id, S, 'portrait')}<div class="cap"><div class="nm">${esc(n ? (known ? n.n : nameOf(id, S, true)) : id)}</div><div class="rl">${esc(sub)}</div></div></div>
    <div class="th">${note}${thought}</div>
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
  --moon:#a3e6db;--ink:#ece7db;--ink2:#c3beb2;--ink3:#aaa69b;--head:#f3e8cf;--good:#8fd0b4;
  --f-ui:"Alegreya Sans",system-ui,sans-serif;--f-text:"Alegreya",Georgia,serif;--f-sc:"Alegreya SC","Alegreya",Georgia,serif;
  container-type:inline-size;display:flex;flex-direction:column;gap:10px;margin:14px 0 8px;font-family:var(--f-ui);font-size:15px;line-height:1.45;color:var(--ink);text-align:left}
.eld-scene *{box-sizing:border-box}
.eld-scene .hd{display:flex;align-items:center;gap:10px;font-family:var(--f-sc);font-size:13px;letter-spacing:.1em;color:var(--brass);text-transform:lowercase}
.eld-scene .hd::before,.eld-scene .hd::after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,var(--brass-lo),transparent)}
.eld-scene .sc{--ring:#4a546c;display:grid;grid-template-columns:minmax(140px,190px) minmax(0,1fr) 205px;grid-template-areas:"pic th st";
  background:linear-gradient(180deg,color-mix(in srgb,var(--ring) 9%,var(--sheet)),var(--sheet) 55%);border:1px solid var(--rule);border-radius:14px;overflow:hidden}
.eld-scene .pic{grid-area:pic;position:relative;aspect-ratio:2/3;max-width:100%;background:var(--well);box-shadow:inset -1px 0 0 var(--rule)}
.eld-scene .pic .portrait{display:block;width:100%;height:100%;margin:0;border:0;border-radius:0;max-width:none;object-fit:cover;object-position:50% 20%}
.eld-scene .pic .portrait.fb{display:grid;place-items:center;font-family:var(--f-text);font-size:56px;color:var(--rule2);background:radial-gradient(circle at 50% 38%,#2a2f3b,var(--well) 70%)}
.eld-scene .pic::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ring) 55%,transparent);pointer-events:none}
.eld-scene .cap{position:absolute;left:0;right:0;bottom:0;padding:34px 12px 10px;background:linear-gradient(180deg,transparent,rgba(10,13,20,.92) 60%)}
.eld-scene .nm{font-family:var(--f-text);font-weight:700;font-size:19px;line-height:1.15;color:var(--head)}
.eld-scene .rl{font-size:12.5px;color:var(--ink2);line-height:1.3;margin-top:2px}
.eld-scene .th{grid-area:th;padding:16px 20px;display:flex;flex-direction:column;gap:10px;min-width:0}
.eld-scene .lbl{font-family:var(--f-sc);font-size:12.5px;letter-spacing:.09em;color:var(--brass);text-transform:lowercase}
.eld-scene .lbl span{letter-spacing:0;text-transform:none;font-family:var(--f-ui);color:var(--ink3)}
.eld-scene .doing{font-size:13.5px;color:var(--ink3);font-style:italic}
.eld-scene .doing b{font-style:normal;color:var(--ink2);font-weight:500}
.eld-scene .thought{margin:0;padding:2px 0 2px 16px;border:0;border-left:2px solid color-mix(in srgb,var(--ring) 70%,var(--brass-lo));background:none;
  font-family:var(--f-text);font-style:italic;font-size:16.5px;line-height:1.6;color:var(--ink);display:flex;flex-direction:column;gap:6px}
.eld-scene .thought p{margin:0}
.eld-scene .none{color:var(--ink3);font-style:italic;font-size:14px}
.eld-scene .st{grid-area:st;padding:16px 16px 14px;border-left:1px solid var(--rule);display:flex;flex-direction:column;gap:11px;background:rgba(16,20,29,.35)}
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
  const b = e.target.closest && e.target.closest('.eld-scene button'); if (!b) return;
  if (b.dataset.eldOpen) open(b.dataset.eldOpen);
  else if (b.dataset.eldKeep) toggleKeep(b.dataset.eldKeep);
}
function sceneImgError(e) {   // a portrait that fails to load becomes the initials (error does not bubble: capture)
  const img = e.target; if (!img || img.tagName !== 'IMG' || !img.dataset.fb || !img.closest('.eld-scene')) return;
  const sp = PD.createElement('span'); sp.className = img.className + ' fb'; sp.textContent = img.dataset.fb; img.replaceWith(sp);
}
