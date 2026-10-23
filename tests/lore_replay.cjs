// 1.99.6 (bug-hunt audit 2026-10-23 T5): replay an exported chat's keyword lore. For every reply that answered a player message, the
// last two messages are scanned as SillyTavern scans them (the card's prompt regexes first: SillyTavern 1.18.0 public/script.js runs
// getRegexedString with isPrompt on coreChat before chatForWI; keys as DECISIONS §11 "World Info"), each keyword entry that fires is
// rendered with the state the prompt saw and the player's message as lastUserMessage, and its size is counted (chars / 4).
// Usage: node tests/lore_replay.cjs <chat.jsonl> [card.json, default dist/Eldrasil_Halvard.json] [--each]
// 1.99.8: the scan helpers are exported for tests/cache_replay.cjs.
const fs = require('fs'), path = require('path');
const { renderEntry, ROOT } = require('./harness.cjs');
const stateOf = m => { const v = m && m.variables; const s = Array.isArray(v) ? v[m.swipe_id || 0] : v; return s && s.stat_data; };
// the card's prompt-only regexes (and the preset's thought stripper beyond depth 2), as the history reaches the scan
const promptText = (m, depth) => {
  let t = String(m.mes || '').replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/gm, '').replace(/<StatusPlaceHolderImpl\/>/g, '');
  if (m.is_user) t = t.replace(/\s*\(scene: [^()\n]*\bt\d+\)\s*$/g, '');
  if (!m.is_user && depth >= 3) t = t.replace(/\s*<npc_thoughts>[\s\S]*?<\/npc_thoughts>\s*/gi, '');
  return t;
};
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const keyHit = (key, hay, cs) => {
  const rx = /^\/([\s\S]+)\/([gimsuy]*)$/.exec(key);
  if (rx) { try { return new RegExp(rx[1], rx[2]).test(hay); } catch (e) { return false; } }
  const h = cs ? hay : hay.toLowerCase(), k = cs ? key.trim() : key.trim().toLowerCase();
  if (!k) return false;
  return k.split(/\s+/).length > 1 ? h.includes(k) : new RegExp(`(?:^|\\W)(${esc(k)})(?:$|\\W)`).test(h);
};
const fires = (e, hay) => {
  const cs = !!e.case_sensitive, prim = (e.keys || []).some(k => keyHit(k, hay, cs));
  if (!prim) return false;
  const sec = e.secondary_keys || [];
  if (!e.selective || !sec.length) return true;
  const hits = sec.map(k => keyHit(k, hay, cs)), logic = (e.extensions || {}).selectiveLogic || 0;
  return logic === 0 ? hits.some(Boolean) : logic === 1 ? !hits.every(Boolean) : logic === 2 ? !hits.some(Boolean) : hits.every(Boolean);
};
const loadChat = file => fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).slice(1);
const loadCard = file => JSON.parse(fs.readFileSync(file || path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
// every reply that answered a player message: the state its prompt saw and the text the World Info scan read
function generations(lines) {
  const out = [];
  for (let i = 2; i < lines.length; i++) {
    const m = lines[i], u = lines[i - 1], prev = lines[i - 2];
    if (m.is_user || !u.is_user || u.is_system) continue;
    const S = stateOf(u) || stateOf(prev); if (!S) continue;
    out.push({ i, m, u, S, hay: [promptText(u, 0), promptText(prev, 1)].join('\n') });
  }
  return out;
}
module.exports = { stateOf, promptText, keyHit, fires, loadChat, loadCard, generations };

if (require.main === module) {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--')), each = process.argv.includes('--each');
  if (!args[0]) { console.log('usage: node tests/lore_replay.cjs <chat.jsonl> [card.json] [--each]'); process.exit(1); }
  const card = loadCard(args[1]);
  const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/npcs.json'), 'utf8'));
  const NPC_OF = Object.fromEntries(Object.entries(npcs).filter(([, v]) => v.uid_card != null).map(([id, v]) => [v.uid_card, id]));
  const KW = card.character_book.entries.filter(e => e.enabled !== false && !e.constant && (e.keys || []).length);
  const tok = s => Math.round(String(s).trim().length / 4);
  let gens = 0, all = 0, npcTok = 0, maxAll = 0; const byKind = {}, out = [];
  for (const { i, m, u, S, hay } of generations(loadChat(args[0]))) {
    gens++;
    const after = stateOf(m) || {};
    let g = 0; const row = [];
    for (const e of KW) {
      if (!fires(e, hay)) continue;
      const t = tok(renderEntry(card, e.id, S, null, { lastUserMessage: u.mes }));
      g += t;
      const id = NPC_OF[e.id];
      if (id) {
        const full = (((S.$ui || {}).cast || {}).full || []).includes(id), here = id in ((S.Scene || {}).Present || {});
        const named = keyHit(id, promptText(u, 0), false), arrived = !here && id in ((after.Scene || {}).Present || {});
        const kind = full ? 'full sheet (silent)' : here ? 'here, no full sheet' : named ? 'named by the player' : arrived ? 'mentioned, arrives this reply' : 'mentioned only';
        byKind[kind] = byKind[kind] || [0, 0]; byKind[kind][0]++; byKind[kind][1] += t; npcTok += t;
        row.push(`${id} ${t} (${kind})`);
      } else row.push(`${e.comment.replace('[mvu_plot] ', '').slice(0, 30)} ${t}`);
    }
    all += g; maxAll = Math.max(maxAll, g);
    if (each) out.push(`#${i} ${S.World ? S.World.Time : ''}: ${g} tok — ${row.join('; ')}`);
  }
  if (each) console.log(out.join('\n'));
  console.log(`replies ${gens}; keyword lore ${all} tok (average ${gens ? Math.round(all / gens) : 0}, most ${maxAll}); NPC entries ${npcTok} tok`);
  for (const [k, [n, t]] of Object.entries(byKind)) console.log(`  ${k}: ${n} entries, ${t} tok`);
}
