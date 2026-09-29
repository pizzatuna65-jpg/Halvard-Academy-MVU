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
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'presets/Realistic_Frankenstein_2_2_Eldrasil.json'), 'utf8'));
const byName = frag => P.prompts.find(p => (p.name || '').includes(frag));
const enabled = frag => { const p = byName(frag); const o = P.prompt_order[0].order.find(x => x.identifier === p.identifier); return !!(o && o.enabled); };
const bolt = byName('BOLT Chain of Thought').content;
ok(!/bond Progress|\+2 significant/.test(bolt), 'BOLT step 2 no longer teaches the 1.0 bond rules');
ok(/following the card's own update rules exactly/.test(bolt), "BOLT step 2 points to the card's update rules");
ok(bolt.includes('my first reasoning line is exactly "Now: M? W? Day HH:MM at <place>"'), 'BOLT keeps the "Now:" first line (VectFox reads dates from reasoning)');
ok(enabled('Total Output Length') && /roughly 3 to 6 paragraphs/.test(byName('Total Output Length').content), 'Total Output Length is ON at 3-6 paragraphs (the length moved here from the card)');
ok(enabled('Hybrid POV') && enabled('Anti-parrot'), 'point of view and not writing {{user}} are preset toggles (ON)');
