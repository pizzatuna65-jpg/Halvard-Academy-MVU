// The edited preset (presets/edit_preset.py -> Realistic_Frankenstein_2_2_Eldrasil.json), checked release by release.
// Rule of the split (planning/DRAFT_card_vs_preset.md): the preset carries only generic writing craft and points to the card's
// rules; it never copies card data. 1.5.0: Batch E1 writing rules and the two new toggles.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
console.log('Edited preset (Eldrasil)');
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'presets/Realistic_Frankenstein_2_2_Eldrasil.json'), 'utf8'));
const order = P.prompt_order[0].order;
const byName = frag => P.prompts.find(p => (p.name || '').includes(frag));
const pos = frag => order.findIndex(o => o.identifier === byName(frag).identifier);
const enabled = frag => { const p = byName(frag); const o = order.find(x => x.identifier === p.identifier); return !!(o && o.enabled); };
const C = frag => byName(frag).content;

// ---- carried over from 1.4.6
const bolt = C('BOLT Chain of Thought');
ok(bolt.includes('my first reasoning line is exactly "Now: M? W? Day HH:MM at <place>"'), 'BOLT keeps the "Now:" first line (VectFox reads dates from reasoning)');
ok(!/bond Progress|\+2 significant/.test(bolt), 'BOLT does not teach old bond rules');

// ---- 1.5.0 E1: Player Input Authority (N1 + D5), one toggle, depth 0, right before BOLT
const IA = byName('Player Input Authority');
ok(IA && enabled('Player Input Authority'), 'Player Input Authority exists and is ON');
ok(IA.injection_position === 1 && IA.injection_depth === 0 && pos('Player Input Authority') === pos('BOLT Chain of Thought') - 1, 'it sits at depth 0 right before BOLT');
ok(/<input_authority>[\s\S]*is a wish, not a fact[\s\S]*<\/input_authority>/.test(IA.content) && /<latest_input>\{\{lastUserMessage\}\}<\/latest_input>/.test(IA.content), 'input authority and the latest-input marker are one toggle');
// ---- Output language: OFF, next to Total Output Length
ok(byName('Output language') && !enabled('Output language') && pos('Output language') === pos('Total Output Length') + 1, 'Output language exists, OFF, after Total Output Length');
ok(enabled('Total Output Length') && /roughly 3 to 6 paragraphs/.test(C('Total Output Length')), 'Total Output Length ON at 3-6 paragraphs');
// ---- craft edits (every rep() in edit_preset.py asserts its anchor; these check the result landed where the CoT looks)
ok(/No spotlight:[\s\S]*No echoes:/.test(C('Realistic NPCs')), 'N7 no spotlight, no echoes in <realistic_bold_characters>');
ok(/Simulate, do not dramatise/.test(C('Scene Engine')) && /holding, stepping back and leaving something unsaid are valid endings/.test(C('Scene Engine')), 'P12 + D8 in <scene_engine>');
ok(!/NPCs are flawed, panic-prone/.test(C('Instincts + VAD')) && /get worse in their own way, inside the limits their card sets/.test(C('Instincts + VAD')), 'U5: stress in their own way');
ok(/<character_calibration>[\s\S]*Personality is a ceiling, not a mood[\s\S]*<\/character_calibration>/.test(C('Instincts + VAD')), 'D2 calibration (with the P8 ceiling line)');
const voice = P.prompts.find(p => p.identifier === '019f62e8-892f-7017-ae2e-44fbc7d29de7');
ok(enabled('NPC Voice + Dialogue Output') && /outranks every rule in this tag/.test(voice.content) && /Direct people speak directly/.test(voice.content), 'U4 + D3 in the active <npc_voice>');
ok(/unless the card records that they already know them/.test(C('Anti-Omniscient')) && /No foreshadowing narration/.test(C('Anti-Omniscient')), 'U11 + D7 in <anti_omniscient_NPCs>');
ok(/canon: for a character with a lorebook entry or character sheet/.test(C('Main Prompt')), 'U9 in <NPC_intro>');
ok(/one question mark per character per reply/.test(C("Don't Speak Like a Therapist")), 'U12: question cap per character');
ok(/No fake specificity/.test(C('Anti-Cliché Moves')) && /never "his hand moved on its own"/.test(C('Anti-Cliché Moves')), 'optional: fake specificity and organ autonomy banned');

// ---- generic: the E1 texts name no card data (Eldrasil, its fields or characters)
const E1 = [IA.content, C('Output language'), C('Realistic NPCs'), C('Scene Engine'), C('Instincts + VAD'), voice.content, C('Anti-Omniscient'), C("Don't Speak Like a Therapist")].join('\n');
const CARD = /Eldrasil|Halvard|<now>|<cast>|Scene\.Present|Bonds|Campus_State|_Event|\b(Irene|Etnie|Aiden|Castor|Zara|Kanae|Rei|Caine)\b/;
ok(!CARD.test(E1), 'E1 texts are generic (no card data or character names)' + (CARD.test(E1) ? ': ' + E1.match(CARD)[0] : ''));
