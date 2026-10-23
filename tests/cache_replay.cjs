// 1.99.8 (bug-hunt audit 2026-10-23 T1): how much of the card's part of the prompt a provider's prefix cache can reuse from one reply to
// the next. For every reply of an exported chat it assembles what SillyTavern puts between the preset's "Lorebook Before" and "Chat
// History" markers: the Lorebook Before entries, the character description, the Lorebook After entries. Entries of one position join
// in ascending order with a newline (world-info.js sorts by order descending and unshifts); constant entries are rendered with the
// state the prompt saw (an @@if that fails drops the entry), keyword entries when the last two messages fire them (lore_replay.cjs).
// It then counts the part that starts the same as the previous reply's (chars / 4) and names the entry where they first differ.
// The preset's prompts above "Lorebook Before" carry no per-turn macro and are cached either way; the chat history below is not counted.
// Usage: node tests/cache_replay.cjs <chat.jsonl> [card.json, default dist/Eldrasil_Halvard.json] [--each]
const { renderEntry } = require('./harness.cjs');
const { fires, loadChat, loadCard, generations } = require('./lore_replay.cjs');

function assemble(card, S, hay, lastUserMessage) {
  const E = card.character_book.entries.filter(e => e.enabled !== false), parts = [];
  for (const pos of [0, 1]) {
    const act = E.filter(e => ((e.extensions || {}).position ?? 1) === pos && ((e.extensions || {}).position !== 4))
      .filter(e => e.constant || ((e.keys || []).length && fires(e, hay)));
    // world-info.js: sort by order descending (stable), then unshift each: ascending order, ties in reverse book order
    const sorted = act.slice().sort((a, b) => b.insertion_order - a.insertion_order).reverse();
    for (const e of sorted) {
      let t; try { t = renderEntry(card, e.id, S, null, { lastUserMessage }); } catch (x) { t = `<render error ${e.id}>`; }
      if (t == null || !String(t).trim()) continue;
      parts.push({ name: e.comment || String(e.id), text: String(t) });
    }
    if (pos === 0) parts.push({ name: 'Char Description', text: card.description || '' });
  }
  return parts;
}
const joined = parts => parts.map(p => p.text).join('\n');
const tok = n => Math.round(n / 4);

if (require.main === module) {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--')), each = process.argv.includes('--each');
  if (!args[0]) { console.log('usage: node tests/cache_replay.cjs <chat.jsonl> [card.json] [--each]'); process.exit(1); }
  const card = loadCard(args[1]);
  let prev = null, n = 0, same = 0, total = 0; const breaks = {};
  for (const g of generations(loadChat(args[0]))) {
    const parts = assemble(card, g.S, g.hay, g.u.mes), text = joined(parts);
    if (prev != null) {
      let k = 0; const L = Math.min(prev.length, text.length); while (k < L && prev[k] === text[k]) k++;
      let at = 0, where = '(end)'; for (const p of parts) { if (k < at + p.text.length + 1) { where = p.name; break; } at += p.text.length + 1; }
      n++; same += k; total += text.length; breaks[where] = (breaks[where] || 0) + 1;
      if (each) console.log(`#${g.i} ${g.S.World ? g.S.World.Time : ''}: ${tok(k)} of ${tok(text.length)} tok as before; first change in ${where}`);
    }
    prev = text;
  }
  console.log(`replies compared ${n}; card part ${tok(total / Math.max(1, n))} tok a reply, of which ${tok(same / Math.max(1, n))} tok start as in the reply before (${Math.round(100 * same / Math.max(1, total))}%)`);
  for (const [w, c] of Object.entries(breaks).sort((a, b) => b[1] - a[1])) console.log(`  first change in ${w}: ${c}`);
}
module.exports = { assemble };
