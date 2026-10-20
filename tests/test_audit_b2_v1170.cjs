// 1.17.0 (planning/AUDIT_2026-09-29.md, Batch 2): "[…]" runs collapse in the prompt, the Price Guide by place, a lighter Bonds
// block in <current_state>, the Bridge's rules in the card, the Main Prompt's random events, gfx and coloured dialogue opt-in, the
// lore-at-depth TEST card.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data.character_book.entries;
const entry = id => card.find(x => x.id === id);
const render = (id, S) => renderEntry({ character_book: { entries: card } }, id, S);   // 1.48.0: the Cast Sheet is a group
const tok = s => Math.round(s.length / 3.6);

console.log('T1 "[…]" runs');
{
  const E = new Function(rd('src/scripts/engine.js') + '\nreturn { collapseTrimmed };')();
  const chat = [{ role: 'system', content: 'rules' }, ...Array.from({ length: 500 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: '[…]' })),
    { role: 'user', content: 'recent' }, { role: 'assistant', content: '[…]' }, { role: 'user', content: 'now' }];
  const removed = E.collapseTrimmed(chat);
  ok(removed === 499 && chat.length === 5 && /\[… 500 earlier messages/.test(chat[1].content) && chat[3].content === '[…]', 'a run of 500 becomes one line with its count; a single one stays');
  ok(!chat.some(m => 'n' in m), 'no helper field reaches the API');
  ok(/tavern_events\.CHAT_COMPLETION_PROMPT_READY/.test(rd('src/scripts/engine.js')), 'the engine script hooks the prompt');
}

console.log('T2 Price Guide by place');
{
  const e = entry(506), x = e.extensions;
  ok(!e.keys.includes('cost') && !e.keys.includes('order') && x.match_whole_words === true && x.scan_depth === 2, 'no "cost" / "order" keys; whole words; the last two messages');
  const old = 13499;   // 1.16.0: the whole list, every time
  const tink = render(506, { World: { Month: 8, Location: "The Tinker's Bench" } }), dorm = render(506, { World: { Month: 8, Location: 'Fire Dormitory — common room' } });
  const mall = render(506, { World: { Month: 2, Location: 'The Mall — bakery' } }), qf = render(506, { World: { Month: 2, Location: "Quillfeather's" } });
  ok(/- Ember pouch: 15 pts/.test(tink) && !/- Sunfizz:/.test(tink) && /Canon prices/.test(tink), 'at a shop: its stock in season, plus the canon prices');
  ok(!/\n- /.test(dorm) && /Other shops: .*Commissary/.test(dorm), 'away from shops: canon prices and one line per shop');
  ok(/- Bakery roll: 15 pts/.test(mall) && !/Quillfeather's;/.test(mall) && /Quillfeather's;/.test(qf), 'The Mall lists its own counters; a Mall shop lists its own stock');
  ok(!/- Ember pouch/.test(render(506, { World: { Month: 5, Location: "The Tinker's Bench" } })), 'out-of-season stock is left out');
  console.log(`    tokens: at a shop ~${tok(tink)}, away ~${tok(dorm)}, at The Mall ~${tok(mall)} (1.16.0: ~${tok('x'.repeat(old))})`);
  ok(tok(dorm) < 1200 && tok(tink) < 1800 && tok(mall) < 1800, 'much smaller than the whole list');
}

console.log('T3 a lighter Bonds block');
{
  let S = initState({ etnie: true });
  S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'here' } } }]);
  S = applyPatch(S, [{ op: 'insert', path: '/Bonds/Irene/Mind', value: 'Watching the new student.' }, { op: 'insert', path: '/Bonds/Irene/Knows/-', value: 'saw {{user}} arrive late' },
    { op: 'insert', path: '/Bonds/Etnie/Mind', value: 'Proud of her little sibling.' }, { op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: 'f2' }, { op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: 'f3' }, { op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: 'f4' }]);
  const cs = render(501, S);
  const bo = cs.slice(cs.indexOf('\nBonds:'), cs.indexOf('\nCampus_State')), etnie = bo.slice(bo.indexOf('  Etnie:'), bo.indexOf('  Irene:')), irene = bo.slice(bo.indexOf('  Irene:'));
  ok(!/Mind|Knows|f2/.test(etnie) && /Etnie: "?Rank 3; Trust \d+/.test(etnie), 'someone not here: one line of standing and plans (1.57.0; their facts only when mentioned or coming)');
  ok(!/Mind:|Knows:/.test(irene) && /Watching the new student/.test(render(509, S)), 'someone here: Mind and Knows only in <cast>');
  const re = applyPatch(S, [{ op: 'replace', path: '/Bonds/Etnie', value: { Rank: 3, Trust: 70, Title: 'Big sister' } }]);
  ok(re.Bonds.Etnie.Mind === 'Proud of her little sibling.' && re.Bonds.Etnie.Known_facts.length >= 4, 'a whole-record rewrite keeps Mind and the facts it could not see');
}

console.log('P1, P2 preset and card (1.68.0: RF 2.2.1.3 base)');
{
  const P = JSON.parse(rd('dist/Realistic_Frankenstein_2_2_1_3_Eldrasil.json')), order = P.prompt_order[0].order;
  const C = frag => P.prompts.find(p => (p.name || '').includes(frag));
  const on = frag => order.find(o => o.identifier === C(frag).identifier).enabled;
  ok(/Off-screen people keep their own lives/.test(entry(504).content), 'P1: rule 504 has the living-world lines');
  ok(/when the card keeps its own game state, that state records them and no separate tracker block is written/.test(C('Main Prompt').content) && !/track via internal states|Campus_State/.test(C('Main Prompt').content), 'P2: random events are recorded by the card\'s state, never a tracker block');
  ok(on('Pop in Graphics') && !on('Colored Dialogue 2.0'), '1.68.0: inline graphics ON as upstream ships them; the card colours dialogue itself');
}

console.log('T6 lore at depth (TEST card)');
{
  const t = JSON.parse(rd('dist/test/Eldrasil_TEST_LoreDepth.json')).data;
  const kw = t.character_book.entries.filter(e => e.id < 500 && !e.constant && e.enabled);
  ok(t.character_book.name !== 'Eldrasil — Halvard Academy' && kw.length > 200 && kw.every(e => e.extensions.position === 4 && e.extensions.depth === 2), 'every keyword entry at depth 2, under its own lorebook name');
  ok(card.filter(e => e.id < 500 && !e.constant).every(e => e.extensions.position !== 4), 'the real card is unchanged');
}
