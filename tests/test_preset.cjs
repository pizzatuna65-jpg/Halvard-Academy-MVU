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

// ---- 1.6.2 E2: the CoT reads what the card now provides, and still names none of it (U2, U3, U6, U7, U8, U10, D4, D6, V4)
const step = n => (bolt.match(new RegExp('\\n' + n + '\\. [\\s\\S]*?(?=\\n\\n\\d+\\. |\\n\\nI am a GM)')) || [''])[0];
ok(step(0).includes('my first reasoning line is exactly "Now: M? W? Day HH:MM at <place>", copied from <now>.'), 'V4: the "Now:" first line is unchanged, first in step 0');
ok(/If the card provides character sheets for the people present, I read them now\./.test(step(0)), 'U2: step 0 reads the character sheets');
ok(/Cast check and slop review: for each character who will act, from their character sheet or card: \(a\) what they know here[\s\S]*\(e\) what they carry/.test(step(7)), 'U3: step 7 is a runnable cast check');
ok(/the loudest version of their reaction, then the way this person usually handles it/.test(step(7)) && /Name-swap test/.test(step(7)), 'D4: the usual-version and name-swap tests');
ok(/<banned_vocabulary>/.test(step(7)) && /<abolish_yesman_behaviour>/.test(step(7)), 'step 7 keeps the slop review');
ok(/World-side material comes only from the sources the card allows; on most turns the world stays quiet\. Nobody arrives without the time to get there/.test(step(11)), 'U10 + D6: step 11 points to the card\'s sources');
const boltRest = bolt.replace('"Now: M? W? Day HH:MM at <place>", copied from <now>', '');
const FIELD = /Eldrasil|Halvard|<now>|<cast>|<current_state>|Scene\.Present|Bonds|Campus_State|Extras|_Event|_Period|_Curfew|_Happening|_Log|Vitals|Commitments|Mysteries|\b(Irene|Etnie|Aiden|Castor|Zara|Kanae|Rei|Caine)\b/;
ok(!FIELD.test(boltRest), 'BOLT names no card field outside the "Now:" line' + (FIELD.test(boltRest) ? ': ' + boltRest.match(FIELD)[0] : ''));
// every tag the CoT refers to exists in another preset prompt or in the card
const cardText = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data.character_book.entries.map(e => e.content).join('\n');
const others = P.prompts.filter(p => p.identifier !== byName('BOLT Chain of Thought').identifier).map(p => p.content || '').join('\n');
const tags = [...new Set([...bolt.matchAll(/<([A-Za-z_]+)>/g)].map(m => m[1]))].filter(x => !['place', 'details'].includes(x));
const missing = tags.filter(x => !others.includes('<' + x + '>') && !cardText.includes('<' + x + '>') && !cardText.includes('<' + x + ' '));
ok(!missing.length, 'every tag the CoT refers to exists in the preset or the card (' + tags.length + ')' + (missing.length ? ': missing ' + missing.join(', ') : ''));
const gen = C('HQ NPC Genesis');
ok(/if the card gives a naming guide, follow it/.test(gen) && /Banned Names: Elara, Vane, Seraphina/.test(gen) && /If the card keeps a record for invented characters, that record is their card/.test(gen), 'U6: the card\'s naming guide and record first; banned names stay');
ok(/the card's record for invented characters as their card when the card keeps one/.test(C('Scene Engine')), 'U7: the Scene Engine\'s generated-character sentence');
const E2 = [step(0).replace('"Now: M? W? Day HH:MM at <place>", copied from <now>', ''), step(7), step(11), gen].join('\n');
ok(!CARD.test(E2), 'E2 texts are generic' + (CARD.test(E2) ? ': ' + E2.match(CARD)[0] : ''));
const br = C('Eldrasil × MVU × VectFox Bridge');
ok(/The <cast> block is the truth about every present character/.test(br) && /Invented characters keep their Extras card/.test(br) && /their Next plans/.test(br) && /needs the walk time to get here/.test(br), 'U8 + D6: the Bridge divides the work with the card\'s new blocks');
ok(!/_Event_ready|_Period|World\._Happening/.test(br), 'the Bridge copies no field list either');
