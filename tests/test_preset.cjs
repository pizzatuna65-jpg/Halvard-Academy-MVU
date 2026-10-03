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
ok(enabled('Total Output Length') && /roughly 4 to 7 paragraphs/.test(C('Total Output Length')), 'Total Output Length ON at 4-7 paragraphs (owner, 1.36.0)');
// ---- craft edits (every rep() in edit_preset.py asserts its anchor; these check the result landed where the CoT looks)
ok(/No spotlight:[\s\S]*No echoes:/.test(C('Realistic NPCs')), 'N7 no spotlight, no echoes in <realistic_bold_characters>');
ok(/Simulate, do not dramatise/.test(C('Scene Engine')) && /holding, stepping back and leaving something unsaid are valid endings/.test(C('Scene Engine')), 'P12 + D8 in <scene_engine>');
ok(!/NPCs are flawed, panic-prone/.test(C('Instincts + VAD')) && /get worse in their own way, inside the limits their card sets/.test(C('Instincts + VAD')), 'U5: stress in their own way');
ok(/<character_calibration>[\s\S]*Personality is a ceiling, not a mood[\s\S]*<\/character_calibration>/.test(C('Instincts + VAD')), 'D2 calibration (with the P8 ceiling line)');
// 1.36.0: the active <npc_voice> is RF2.2.1's Cosmos (Gemini) edition; the Micro voice is OFF
const voice = byName('NPC Voice + Dialogue Output: Cosmos');
ok(enabled('NPC Voice + Dialogue Output: Cosmos') && !enabled('🎤NPC Voice + Dialogue Output') && /Direct people speak directly/.test(voice.content) && /a style rule in this prompt and the card describe the same thing differently, the card's version/.test(C('Card Fidelity')), 'U4 + D3: the active <npc_voice>; the card outranking style rules lives in <card_fidelity> (1.52.2)');
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
ok(step(0).includes('my first reasoning line is exactly "Now: M? W? Day HH:MM at <place>" (from campaign Year 2: "Now: Y? M? W? Day HH:MM at <place>"), copied from <now>.'), 'V4: the "Now:" first line is unchanged, first in step 0');
ok(/If the card provides character sheets for the people present, I read them now\./.test(step(0)), 'U2: step 0 reads the character sheets');
ok(/Cast check and slop review: for each character who will act, from their character sheet or card: \(a\) what they know here[\s\S]*\(e\) what they carry/.test(step(7)), 'U3: step 7 is a runnable cast check');
ok(/the loudest version of their reaction, then the way this person usually handles it/.test(step(7)) && /Name-swap test/.test(step(7)), 'D4: the usual-version and name-swap tests');
ok(/<banned_vocabulary>/.test(step(7)) && /<abolish_yesman_behaviour>/.test(step(7)), 'step 7 keeps the slop review');
ok(/World-side material comes only from the sources the card allows; on most turns the world stays quiet\. Nobody arrives without the time to get there/.test(step(10)), 'U10 + D6: step 10 (Plot Momentum) points to the card\'s sources');
const boltRest = bolt.replace('"Now: M? W? Day HH:MM at <place>" (from campaign Year 2: "Now: Y? M? W? Day HH:MM at <place>"), copied from <now>', '');
const FIELD = /Eldrasil|Halvard|<now>|<cast>|<current_state>|Scene\.Present|Bonds|Campus_State|Extras|_Event|_Period|_Curfew|_Happening|_Log|Vitals|Commitments|Mysteries|\b(Irene|Etnie|Aiden|Castor|Zara|Kanae|Rei|Caine)\b/;
ok(!FIELD.test(boltRest), 'BOLT names no card field outside the "Now:" line' + (FIELD.test(boltRest) ? ': ' + boltRest.match(FIELD)[0] : ''));
// every tag the CoT refers to exists in another preset prompt or in the card
const cardText = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data.character_book.entries.map(e => e.content).join('\n');
const noNotes = t => String(t || '').replace(/\{\{\/\/[\s\S]*?\}\}/g, '');   // 1.6.9: ST strips {{// }} notes, so a tag named only there does not count
const others = P.prompts.filter(p => p.identifier !== byName('BOLT Chain of Thought').identifier).map(p => noNotes(p.content)).join('\n');
const tags = [...new Set([...bolt.matchAll(/<([A-Za-z_]+)>/g)].map(m => m[1]))].filter(x => !['place', 'details'].includes(x));
const missing = tags.filter(x => !others.includes('<' + x + '>') && !cardText.includes('<' + x + '>') && !cardText.includes('<' + x + ' '));
ok(!missing.length, 'every tag the CoT refers to exists in the preset or the card (' + tags.length + ')' + (missing.length ? ': missing ' + missing.join(', ') : ''));
const gen = C('HQ NPC Genesis');
ok(/if the card gives a naming guide, follow it/.test(gen) && /Banned Names: Elara, Vane, Vance, Seraphina/.test(gen) && /If the card keeps a record for invented characters, that record is their card/.test(gen), 'U6: the card\'s naming guide and record first; banned names stay');
ok(/the card's record for invented characters as their card when the card keeps one/.test(C('Scene Engine')), 'U7: the Scene Engine\'s generated-character sentence');
const E2 = [step(0).replace('"Now: M? W? Day HH:MM at <place>" (from campaign Year 2: "Now: Y? M? W? Day HH:MM at <place>"), copied from <now>', ''), step(7), step(10), gen].join('\n');
ok(!CARD.test(E2), 'E2 texts are generic' + (CARD.test(E2) ? ': ' + E2.match(CARD)[0] : ''));
const br = C('Card State Bridge');
// 1.17.0 (audit P1): the card works with any preset, so the Bridge's Eldrasil rules moved into rule 504; the Bridge is generic
ok(/only game state and the only tracker/.test(br) && !CARD.test(noNotes(br)) && !FIELD.test(noNotes(br)), 'P1: the Bridge is a generic division of labour');
ok(/Off-screen people keep their own lives/.test(cardText) && /never write another tracker/.test(cardText) && /becomes a Clue/.test(cardText), 'P1: rule 504 carries what the Bridge used to say');

// ---- 1.6.9 bug hunt: pointers the model can follow
const lastTask = Math.max(...[...bolt.matchAll(/\n(\d+)\. /g)].map(m => +m[1]));
ok(bolt.includes(`all 0-${lastTask} tasks below`) && bolt.includes(`Never reason beyond the ${lastTask}th Task`), `BOLT's rule C covers every task (0-${lastTask})`);
ok(!/<say_it_straight>/.test(noNotes(bolt)) && /<comparative_emphasis_killswitch>, <break_the_triad>/.test(bolt), 'BOLT step 4 points to the Comparative Emphasis Killswitch');
const onText = P.prompts.filter(p => { const o = order.find(x => x.identifier === p.identifier); return o && o.enabled; }).map(p => noNotes(p.content)).join('\n');
const jbList = (C('NEW AI Studio Jailbreak').match(/follow these directives from the preset: ([^\n]*)/) || ['', ''])[1];
const jbTags = [...jbList.matchAll(/<([a-z_]+)>/g)].map(m => m[1]), jbMiss = jbTags.filter(x => !new RegExp('<' + x + '>[\\s\\S]*</' + x + '>').test(onText));
ok(jbTags.length > 10 && !jbMiss.length, `every directive the jailbreak lists is in an enabled prompt (${jbTags.length})` + (jbMiss.length ? ': missing ' + jbMiss.join(', ') : ''));
ok(!/<avoid_yesman_behaviour>/.test(C('Realism Mode / Jailbreak')) && /<abolish_yesman_behaviour>/.test(C('Realism Mode / Jailbreak')), 'Realism Mode names the real yes-man tag');

// ---- 1.11.2 preset audit (planning/DRAFT_preset_audit.md): contradictions fixed, stale text gone, duplicates merged
const onPrompts = P.prompts.filter(p => { const o = order.find(x => x.identifier === p.identifier); return o && o.enabled; });
const ADULT = /pussy|cock\b|non-con|moan through intimacy|explicit anatomical|# Intimate Scenes/i;
const adultOn = onPrompts.filter(p => ADULT.test(noNotes(p.content))).map(p => p.name);
ok(!adultOn.length, 'A1: no adult lines in always-on prompts (adult content is opt-in)' + (adultOn.length ? ': ' + adultOn.join(', ') : ''));
ok(/# Intimate Scenes[\s\S]*<\/adult_mode>/.test(C('Realism Mode / Jailbreak')), 'A1: the intimacy craft returns with Realism Mode');
const jb = noNotes(C('NEW AI Studio Jailbreak'));
ok(!/first-year|magic academy|Failure is absolute|introduce plot twists|an ambush, a lockdown/.test(jb) && /When the card defines how uncertain attempts resolve, its rule decides/.test(jb), 'A2-A4: the jailbreak names no card data and defers to the card\'s resolution rule');
ok(!/only 1 or 2 key elements/.test(C('Anti-parrot')) && !/You must ban character thoughts,/.test(C('Cinematic Realism')), 'A5-A6: answer the whole input; NPC interiority as <scene_engine> allows');
ok(!/\{\{roll::/.test(bolt) && !/quant_hardening|staccato_chop_killswitch|anti_briefing_register|professional_legality/.test(noNotes(bolt)), 'B2-B3: no DnD rolls and no checks for toggles that stay OFF on Gemini');
ok(!/calls\/evidence/.test(C('Anti-Omniscient')) && /instincts \[8\]/.test(C('Instincts + VAD')), 'B4-B5: no phone calls; eight instincts');
ok(P.extensions.regex_scripts.filter(r => /Menu (Orange|Teal|Purple|Master)|Relationship Bars|GM Notebook Highlights/.test(r.scriptName)).every(r => r.disabled), 'B6: tracker display regexes are off');
ok(!enabled('Attentional Salience') && /Micro-tells/.test(C('Main Prompt')), 'C1: Attentional Salience merged into <do_not_repeat_descriptions>');
ok(!/Anti-Therapy Register|Ban tricolons|depends on four sources/.test(voice.content) && !/Figurative Economy/.test(C('Cinematic Realism')), 'C2-C5: duplicates removed from <npc_voice> and <prose_rules>');
ok(!/Recalled memories|no phones|metric units/i.test(noNotes(br)), 'C7: the Bridge leaves memory and setting facts to the card');
ok(/No phones, computers or recording devices[\s\S]*Units are metric/.test(cardText), 'C7: the card\'s World Index states them');

// ---- 1.36.0: port from RF2.2.1 (Realistic Gemini BOLT configuration), owner-approved
const at0 = frag => { const p = byName(frag); return p.injection_position === 1 && p.injection_depth === 0; };
ok(enabled('Card Fidelity') && at0('Card Fidelity') && /lorebook entry or character sheet that defines them/.test(C('Card Fidelity')), 'Card Fidelity ON at depth 0; a character sheet counts as the card');
ok(enabled('Anti-Comparative Emphasis: Cosmos') && enabled('Last-Mile Contrast Gate: Cosmos') && !enabled('⚖️ Comparative Emphasis Killswitch') && !enabled('Last-Mile Contrast Gate ⚖️'), 'comparative emphasis: the Cosmos pair replaces the regular pair');
ok(enabled('Occupational Monomania Killswitch: Cosmos') && enabled('Last-Mile Vocation Gate: Cosmos') && !enabled('🧰 Occupational Monomania Killswitch') && !enabled('Last-Mile Vocation Gate 🧰'), 'occupational monomania: the Cosmos pair replaces the regular pair');
const se = C('Scene Engine');
ok(/Causality: an event lands before anyone answers it/.test(se) && /Simulate, do not dramatise/.test(se) && /one light touch of the setting/.test(se) && /Stop before any decision or reaction that belongs to \{\{user\}\}/.test(se), 'Scene Engine is the RF2.2.1 rebuild with the Eldrasil edits');
ok(byName('Pacing: Cosmos') && !enabled('Pacing: Cosmos') && !/what fate or someone's agenda brings/.test(C('Pacing: Cosmos')), 'Pacing ships OFF and follows the card\'s sources');
ok(/METHOD \(no menu; derive per line\), applied to every line/.test(voice.content) && !/<nsfw_register>|moan through intimacy/.test(noNotes(voice.content)), 'Cosmos voice: per-line method, no NSFW pointers');
ok(!/30-50%/.test(bolt) && /keeps their stalls, restarts and fragments/.test(bolt) && /without copying the list into this reasoning/.test(bolt), 'BOLT: no dialogue ratio, nervous characters keep their stalls, banned words checked without reciting');
ok(enabled('Last-Mile Gemini Banned Vocab Check') && /upholstery/.test(C('🚫Banned Word List')) && /A hyphen or a suffix does not make it a different word/.test(C('🚫Banned Word List')), 'banned words: scope line, upholstery, depth-0 gate');
ok(enabled("Looks at a Stranger's Scale") && !/touches or uses/.test(C("Looks at a Stranger's Scale")), 'Scene Detail ported without the line that contradicts the ambience touch');
ok(!P.prompts.some(p => /Scent Killswitch|Smell & Taste Rules/.test(p.name)), 'the smell package is not ported (the card\'s ambience cues name smells)');
ok(enabled('More Diverse Door Sounds') && /Group chat with \{\{group\}\}/.test(P.group_nudge_prompt), 'door sounds and the group nudge');
ok(['BOLT Chain of Thought', 'Player Input Authority'].every(f => byName(f).role === 'user'), 'BOLT and Player Input Authority stay user-role (not RF2.2.1\'s assistant role)');
ok(enabled('Embellish Mode') && !enabled('Anti-parrot') && !/only 1 or 2 key elements/.test(C('Embellish Mode')) && /follow <input_authority>/.test(C('Embellish Mode')), 'owner: Embellish Mode instead of Anti-parrot, answering the whole input');
const E3 = ['Card Fidelity', 'Scene Engine', 'Pacing: Cosmos', "Looks at a Stranger's Scale", 'Embellish Mode', 'Anti-Comparative Emphasis: Cosmos', 'Occupational Monomania Killswitch: Cosmos'].map(C).concat(voice.content).map(noNotes).join('\n');
ok(!CARD.test(E3), '1.36.0 texts are generic' + (CARD.test(E3) ? ': ' + E3.match(CARD)[0] : ''));
// ---- 1.52.2 preset audit 2 (tier 1): BOLT points to the rules, short last-mile gates, one home per rule, a size guard
{
  const sent = t => String(t || '').replace(/\{\{user\}\}/gi, 'Aria').replace(/\{\{\/\/[\s\S]*?\}\}/g, '').replace(/\{\{(setvar|getvar)::[^}]*\}\}/g, '').replace(/\{\{trim\}\}/g, '').replace(/\{\{lastUserMessage\}\}/g, '').trim();
  ok(!/colored_dialogue|list them concisely|listing the rules briefly|I must provide a brief example/.test(noNotes(bolt)), 'BOLT: no check for the colour toggle that stays OFF, no rule lists or examples in the reasoning');
  ok(/without listing them/.test(bolt) && /voiced per <npc_voice> and <human_vocal_limits>/.test(bolt), 'BOLT tasks 4 and 5 point to the rules instead of copying them');
  ok(/per <comparative_emphasis_killswitch>/.test(C('Last-Mile Contrast Gate: Cosmos')) && /per <occupational_monomania_killswitch>/.test(C('Last-Mile Vocation Gate: Cosmos')) && sent(C('Last-Mile Contrast Gate: Cosmos')).length < 600, 'the two Cosmos gates are short reminders of their killswitches');
  ok(!/hovering hands/.test(C('Instincts + VAD')) && !/Diction Friction|Anti-Smoothing|Em dashes and ellipses allowed/.test(voice.content) && !/distinct idiolect/.test(C('Scene Engine')) && /Distinct voices:/.test(voice.content), 'one home per rule (commitment, voices, em dashes)');
  const on = new Set(order.filter(o => o.enabled).map(o => o.identifier)), size = Math.round(P.prompts.filter(p => on.has(p.identifier) && p.content && !p.marker).reduce((a, p) => a + sent(p.content).length, 0) / 3.6);
  ok(size <= 15600, `enabled preset prompts stay within budget (${size} tokens as sent, budget 15600)`);
}
