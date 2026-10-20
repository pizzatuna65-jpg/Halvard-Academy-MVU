// 1.4.6 (owner): the card holds world, data and canon only; taste (point of view, tense, length, prose style, whether the
// AI writes {{user}}) belongs to preset toggles. The preset points to the card's own update rules instead of copying them.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
console.log('Card vs preset split 1.4.6');

// ---- card: no taste rules in any prompt text the card sends
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const TASTE = /\bparagraphs?\b|point of view|\bPOV\b|\btense\b|third person|second person|first person|word count|\bprose style\b|\{\{user\}\}'s (words|thoughts|choices)/i;
const cardText = [card.description, card.personality, card.scenario, card.system_prompt, card.post_history_instructions, card.mes_example]
  .filter(Boolean).join('\n');
ok(!TASTE.test(cardText), 'card description sets no point of view, tense, length, prose style or {{user}} limits');
ok(/<UpdateVariable>/.test(card.description), 'card description still asks for the state-update block');
const rules = card.character_book.entries.filter(e => /\[mvu_(update|plot)\]|Now —|Current State/.test(e.comment));
// Data-format wording is card business, not story prose: the Interactions Note is stored history, written in the past tense.
// 1.7.0: "the first person who sat next to her" (Maple's lore) is a phrase, not a point of view.
const DATA_FORMAT = [/one short sentence of what happened between them, in the past tense/g, /\bthe first person who\b/g];
const leaks = rules.filter(e => TASTE.test(DATA_FORMAT.reduce((t, rx) => t.replace(rx, ''), e.content))).map(e => e.id);
ok(!leaks.length, 'no card rule entry sets taste' + (leaks.length ? ': ' + leaks.join(',') : ''));

// ---- preset: generated from edit_preset.py, deterministic facts about it
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'presets/Realistic_Frankenstein_2_2_1_3_Eldrasil.json'), 'utf8'));
const byName = frag => P.prompts.find(p => (p.name || '').includes(frag));
const enabled = frag => { const p = byName(frag); const o = P.prompt_order[0].order.find(x => x.identifier === p.identifier); return !!(o && o.enabled); };
const bolt = byName('BOLT Chain of Thought').content;
ok(!/bond Progress|\+2 significant/.test(bolt), 'BOLT step 2 no longer teaches the 1.0 bond rules');
ok(!/<UpdateVariable>|<now>|<current_state>/.test(bolt.replace(/\{\{\/\/[\s\S]*?\}\}/g, '')), '1.68.0: BOLT is upstream\'s and names no card block (the card\'s own rules say how the state is updated)');
ok(enabled('Total Output Length') && /roughly 4 to 7 paragraphs/.test(byName('Total Output Length').content), 'Total Output Length is ON at 4-7 paragraphs (the length moved here from the card; 4-7 since 1.36.0)');
ok(enabled('Hybrid POV') && enabled('Embellish Mode') && !enabled('Anti-parrot'), 'point of view and whether the AI writes {{user}} are preset toggles (1.36.0, owner: Embellish Mode)');
