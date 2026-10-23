// The Eldrasil edition of Realistic Frankenstein 2.2.1.3 (presets/edit_preset.py -> Realistic_Frankenstein_2_2_1_3_Eldrasil.json).
// 1.68.0 (owner-approved audit/AUDIT_2026-10-14_1_preset_RF2213.md §5): upstream's Realistic Gemini BOLT configuration as it ships,
// plus a closed list of deviations. Everything not on that list must stay byte for byte what the creator tuned.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
console.log('Edited preset (Eldrasil edition of RF 2.2.1.3)');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const U = read('presets/original/Realistic_Frankenstein_2_2_1_3_Realistic_Gemini_BOLT.json');
const P = read('dist/Realistic_Frankenstein_2_2_1_3_Eldrasil.json');
const ord = x => x.prompt_order.find(po => po.character_id === 100001).order;
const UO = ord(U), O = ord(P);
const UP = Object.fromEntries(U.prompts.map(p => [p.identifier, p])), PP = Object.fromEntries(P.prompts.map(p => [p.identifier, p]));
const on = id => !!(O.find(o => o.identifier === id) || {}).enabled;
const pos = id => O.findIndex(o => o.identifier === id);
const noNotes = t => String(t || '').replace(/\{\{\/\/[\s\S]*?\}\}/g, '');
const ID = {
  main: 'main', phi: 'jailbreak', readme: '27e5541f-4af3-4920-ae49-a91e025425d7', time: '019f62e8-892f-7002-8fcf-eea637bd577b',
  realism: '019f62e8-892f-700c-9795-53ecb3381d7d', parrot: '019f62e8-892f-700f-93e0-640159f4d52a', embellish: '019f62e8-892f-7010-bf59-e7b17fd4476f',
  length: '019f62e8-892f-7012-98b4-8de29f11aa1d', instincts: '019f62e8-892f-7016-a021-aa24f58271d6', color2: '019f7a10-0000-7c00-9a10-000000000201',
  fate: 'a39a979a-e777-4935-9d24-5d858ef7daa5', agenda: '019f67b4-7381-7000-bcc4-496b2e6ed920', notebook: '019f67ad-c0b1-7000-aca4-0e2480fa02db',
  relations: '019f62e8-892f-7023-825d-9351eca0347f', worldsim: '019f62e8-892f-7024-a40f-b906fceb58d2', chekhov: '019f62e8-892f-7025-be65-8859e7730ee0',
  thoughts: '019f62e8-892f-7026-92ea-34ff510c244b', states: '019f62e8-892f-7027-93ef-159f3d55c410', bolt: '634ecfec-1862-4ce0-821e-e31057acadfa',
  dice: '486813c8-3587-456b-b5aa-84585afb3e89', scent: '87068689-deb5-4798-9cc1-e96aa7f9abaf', scentGate: '5feac112-ad26-4eca-b5c5-1b03263cc915',
  smellRules: 'ffb2498c-2054-4e79-9f72-2ae7c51b60f3', staccato: '5f285f06-57fe-49f1-9e9b-84c4d6d30d78', legato: '1409b26b-b408-4f19-965c-5eb56e37d621', impersonate: '431bb92b-7112-4695-978f-1936f6c7ec90',
  pia: 'eldrasil-input-authority', lang: 'eldrasil-output-language', ordinary: 'eldrasil-ordinary-turns',
  cosmos: 'c0a8f588-6ef0-4a32-b5ae-880050afe4e6', lastMile: '1f782d15-d282-4a85-b087-2db2548752f0', genesis: '019f62e8-892f-701e-ba47-40b8c3ddd5e8',
  pacing: '82632755-5233-56f8-8fa6-3f169510cc4e', fidelity: 'f14c6679-2497-4bee-a00e-4c33f2d6d19d',
};

// ---- the base is upstream as it ships
ok(Object.keys(U).filter(k => !['prompts', 'prompt_order', 'extensions'].includes(k)).every(k => JSON.stringify(U[k]) === JSON.stringify(P[k])), 'every setting is upstream\'s (sampling 0.7 / 0.8, reasoning medium, group nudge)');
ok(P.temperature === 0.7 && P.top_p === 0.8, 'sampling values as shipped (Gemini 3.8 ignores them; nothing to tune here)');
const EDITED = [ID.main, ID.phi, ID.readme, ID.realism, ID.length, ID.instincts, ID.thoughts,   // + the CoTs below (pointer and Plot Momentum lines)
  ID.cosmos, ID.lastMile, ID.genesis, ID.pacing, ID.fidelity, ID.embellish];   // 1.99.3 (bug-hunt audit batch 2)
const COTS = U.prompts.filter(p => /impact tier and open pursuit, not by interest/.test(p.content || '')).map(p => p.identifier);
const changed = Object.keys(UP).filter(id => JSON.stringify(UP[id]) !== JSON.stringify(PP[id]));
ok(changed.every(id => EDITED.includes(id) || COTS.includes(id)) && COTS.includes(ID.bolt), 'only the listed prompts differ from upstream' + (changed.filter(id => !EDITED.includes(id) && !COTS.includes(id)).length ? ': ' + changed.filter(id => !EDITED.includes(id) && !COTS.includes(id)).map(id => UP[id].name).join(', ') : ''));
ok(changed.every(id => ['role', 'injection_position', 'injection_depth', 'injection_order', 'injection_trigger', 'name'].every(k => JSON.stringify(UP[id][k]) === JSON.stringify(PP[id][k]))), 'no edited prompt changes role, position, depth, order, trigger or name');
const added = P.prompts.filter(p => !UP[p.identifier]).map(p => p.identifier).sort();
ok(JSON.stringify(added) === JSON.stringify([ID.pia, ID.lang, ID.ordinary].sort()), 'three Eldrasil prompts are added, nothing else');
ok(JSON.stringify(O.map(o => o.identifier).filter(id => UP[id])) === JSON.stringify(UO.map(o => o.identifier)), 'upstream\'s prompt order is kept');
const flips = UO.filter(o => on(o.identifier) !== o.enabled).map(o => o.identifier).sort();
const FLIPS = [ID.fate, ID.agenda, ID.notebook, ID.relations, ID.worldsim, ID.chekhov, ID.states, ID.dice, ID.time, ID.color2, ID.staccato, ID.parrot, ID.embellish, ID.length].sort();
ok(JSON.stringify(flips) === JSON.stringify(FLIPS), 'toggles differ from upstream only where the card or the owner needs it' + (JSON.stringify(flips) !== JSON.stringify(FLIPS) ? ': ' + flips.map(id => UP[id].name).join(', ') : ''));

// ---- D1-D4: the card is the only tracker and keeps the clock, the weather and the dialogue colours
ok([ID.fate, ID.agenda, ID.notebook, ID.relations, ID.worldsim, ID.chekhov, ID.states, ID.dice, ID.time, ID.color2].every(id => !on(id)), 'Internal States family, Turn Dice, Time and Place, Colored Dialogue OFF');
const onText = P.prompts.filter(p => on(p.identifier)).map(p => noNotes(p.content)).join('\n');
ok(!/track via internal states|Ensure internal states created|<internal_states_module>/.test(onText), 'no enabled prompt asks for an Internal States block');
ok(/that state records them and no separate tracker block is written/.test(PP.main.content), 'D6: the Main Prompt\'s random events are the card state\'s');
ok(/OOC: no need verbally to respond to this message\. Do directly respond to all OOCs before this response\./.test(PP.jailbreak.content) && on(ID.phi) && PP.jailbreak.injection_position === 0, 'D7: Post-History ON as upstream (relative, under Chat History), no internal-states line');
ok(COTS.length >= 5 && COTS.every(id => /With no fate engine in this chat, a turn is AMBIENT unless something the card lists as a source of world events falls due in this scene/.test(PP[id].content)), 'D8: Plot Momentum in every CoT follows the card\'s sources when no fate engine runs');
const RX = P.extensions.regex_scripts, URX = U.extensions.regex_scripts;
ok(RX.length === URX.length + 3 && URX.every((r, i) => JSON.stringify(r) === JSON.stringify(RX[i]) || /Untagged Thoughts/.test(r.scriptName)), 'upstream regexes kept as they ship, three Eldrasil regexes appended');
ok(RX.filter(r => /Untagged Thoughts/.test(r.scriptName)).every(r => r.disabled) && RX.filter(r => /^RF2\.2\.1 — Impersonation/.test(r.scriptName)).length === 7, 'the Untagged Thoughts pair is OFF (it serves the header); the seven Impersonation regexes stay');

// ---- D5: NPC Thoughts (owner 1.37.3) keeps upstream's place and triggers
ok(on(ID.thoughts) && /<npc_thoughts>/.test(PP[ID.thoughts].content) && !/thoughtsTemplate/.test(PP[ID.thoughts].content) && !PP[ID.thoughts].injection_trigger.includes('impersonate'), 'Internal Thoughts writes its own block and skips Impersonate');

// ---- P: pointer fixes
const bolt = PP[ID.bolt].content;
ok(PP[ID.bolt].role === 'assistant' && PP[ID.bolt].injection_depth === 0 && on(ID.bolt), 'BOLT is upstream\'s assistant-role CoT at depth 0');
ok(!/<say_it_straight>/.test(P.prompts.filter(p => p.role === 'assistant').map(p => noNotes(p.content)).join('\n')) && /\(<comparative_emphasis_killswitch>, <break_the_triad>,/.test(bolt), 'P: the CoTs point to <comparative_emphasis_killswitch>');
ok(/<abolish_yesman_behaviour>/.test(PP[ID.realism].content) && /instincts \[8\]:/.test(PP[ID.instincts].content), 'P: Realism Mode names the active yes-man tag; eight instincts');
const cardText = read('dist/Eldrasil_Halvard.json').data.character_book.entries.map(e => e.content).join('\n');
const presetText = P.prompts.map(p => noNotes(p.content)).join('\n');
const UPSTREAM_JB = ['realist_gemini', 'roleplay_isnt_reality', 'Prefill', 'professional_legality'];   // RF 2.2's jailbreak tags, named only "if present"
const tags = [...new Set([...noNotes(bolt).matchAll(/<([A-Za-z_]+)>/g)].map(m => m[1]))];
const missing = tags.filter(x => !UPSTREAM_JB.includes(x) && !presetText.replace(noNotes(bolt), '').includes('<' + x + '>') && !cardText.includes('<' + x + '>') && !cardText.includes('<' + x + ' '));
ok(!missing.length, `every tag BOLT names exists in the preset or the card, apart from RF 2.2's conditional jailbreak tags (${tags.length})` + (missing.length ? ': missing ' + missing.join(', ') : ''));

// ---- O: the owner's toggles
// 1.99.3 (owner 2026-10-23, audit R2): upstream's text without rule 2 ("Always begin your response with {{user}}'s ..."), NPCs renumbered
const EMB_RULE2 = "2. Flow: Always begin your response with {{user}}'s stylized actions and dialogue first.\n3. NPCs:";
ok(on(ID.embellish) && !on(ID.parrot) && UP[ID.embellish].content.includes(EMB_RULE2) && PP[ID.embellish].content === UP[ID.embellish].content.replace(EMB_RULE2, '2. NPCs:'),
  'owner: Embellish Mode instead of Anti-parrot, upstream\'s text without the fixed opening (R2)');
ok(on(ID.length) && /roughly 4 to 7 paragraphs \(excluding headers, the thoughts block and the state-update block\)/.test(PP[ID.length].content), 'owner: Total Output Length ON at 4-7 paragraphs');

// ---- E: the three Eldrasil prompts
const pia = PP[ID.pia];
ok(on(ID.pia) && pia.role === 'assistant' && pia.injection_position === 1 && pia.injection_depth === 0 && pia.injection_order === PP[ID.bolt].injection_order && pos(ID.pia) === pos(ID.bolt) - 1,
  'E1: Player Input Authority shares BOLT\'s role, depth and order, right above it (ST joins them into one assistant message)');
ok(/<input_authority>[\s\S]*is a wish, not a fact[\s\S]*<\/input_authority>/.test(pia.content) && /<latest_input>\{\{lastUserMessage\}\}<\/latest_input>/.test(pia.content) && !pia.injection_trigger.includes('impersonate'), 'E1: input authority and the latest input in one toggle; it skips Impersonate');
ok(!on(ID.lang) && pos(ID.lang) === pos(ID.length) + 1, 'E2: Output language OFF, after Total Output Length');
const ot = PP[ID.ordinary];
ok(on(ID.ordinary) && pos(ID.ordinary) === pos(ID.fate) + 1 && !ot.injection_trigger.includes('impersonate') && ot.injection_position === 0, 'E3: Ordinary Turns ON, right after the OFF Fate & Routine, skips Impersonate');
const otText = noNotes(ot.content), fateText = UP[ID.fate].content;
const SAME = ['Small stays small.', 'Exactly one thing must change:', 'NPCs may decline to engage.', 'NPC-to-NPC exchanges that exclude {{user}} are encouraged.', 'This is where the relationship writing lives.', 'It governs only what the world does on its own.'];
ok(SAME.every(s => otText.includes(s) && fateText.includes(s)) && !/\bq\b|Residue|World register|impact roll|FATE & ROUTINE|Bullet/.test(otText), 'E3: upstream\'s steps 0, 7 and 7a, without the tracker');
ok(!/60-75 percent/.test(otText) && /30-50%/.test(bolt), 'E3: no 60-75% dialogue share next to BOLT\'s 30-50% (one number, no contradiction)');
ok(!on(ID.staccato) && !on(ID.legato) && /MUST stay OFF on Gemini/.test(PP[ID.staccato].content), 'D11: Staccato Chop Killswitch OFF as its own note says for Gemini; its Legato gate stays OFF');
const CARD = /Eldrasil|Halvard|<now>|<cast>|<current_state>|Scene\.Present|Bonds|Campus_State|_Event|Extras|\b(Irene|Etnie|Aiden|Castor|Zara|Kanae|Rei|Caine)\b/;
const E = [pia.content, PP[ID.lang].content, ot.content, PP[ID.thoughts].content].map(noNotes).join('\n');
ok(!CARD.test(E), 'the Eldrasil prompts are generic (no card data or character names)' + (CARD.test(E) ? ': ' + E.match(CARD)[0] : ''));
ok(/ELDRASIL EDITION/.test(PP[ID.readme].content) && !on(ID.readme), 'the README (never sent) lists what this edition changes');

// ---- 1.99.3 (bug-hunt audit 2026-10-23, batch 2): where upstream and the card give two rules for one thing, the card's rule wins,
// in words that make sense on any card
const lines = t => noNotes(t).split('\n');
const addedOf = id => lines(PP[id].content).filter(l => !lines(UP[id].content).includes(l)).join('\n');
const caseOne = t => (t.match(/Case 1:[^\n]*/) || [''])[0];
ok(caseOne(PP[ID.cosmos].content) === caseOne(UP[ID.cosmos].content) && /Names are not vocabulary: a name, title or place name that the character card or a lorebook entry writes[^\n]*is written exactly as given/.test(PP[ID.cosmos].content)
  && /a name, title or place name the card or a lorebook writes is not a planned word/.test(PP[ID.lastMile].content), 'P1: the banned list is upstream\'s, and names, titles and places the card writes are exempt (list and last-mile gate)');
ok(/trigger: first appearance of an NPC in the simulation\n  card rule first: when the character card or a lorebook entry sets how a character's first appearance is written/.test(PP.main.content)
  && /explicit anatomical shapes/.test(PP.main.content), 'P2: the card\'s first-appearance rule replaces the sweep; the sweep stays for NPCs it says nothing about');
ok(!/incoming calls/.test(PP.main.content) && /when the card lists where the world's events come from, they come only from those sources/.test(PP.main.content), 'P3: random events come only from the card\'s sources, no "incoming calls"');
ok(/Card first: when the character card or a lorebook entry already gives a new character's name or traits/.test(PP[ID.genesis].content) && /select the 5th/.test(PP[ID.genesis].content), 'P4: HQ NPC Genesis uses the name and traits the card gives, and draws only what it leaves open');
ok(/a long conversation gets interrupted by what fate or someone's agenda brings\. When the card lists where the world's events come from, an interruption comes only from one of those sources or from someone on screen\./.test(PP[ID.pacing].content), 'R3: a WEAVE interruption comes from the card\'s sources');
ok(!/comes back in the next one/.test(PP[ID.fidelity].content) && /A quirk surfaces when the moment calls on it, not in every reply/.test(PP[ID.fidelity].content), 'R1: Card Fidelity says what Scene Engine says (a quirk surfaces when the moment calls on it)');
ok(/A closing marker in parentheses that the card's scripts add to that message, such as "\(scene: …\)", is game data, not the player's words\./.test(pia.content), 'B1: Player Input Authority reads a scene marker in <latest_input> as game data');
const DEV = [ID.cosmos, ID.lastMile, ID.main, ID.genesis, ID.pacing, ID.fidelity, ID.embellish].map(addedOf).join('\n');
ok(DEV.length > 400 && !CARD.test(DEV), 'every line these deviations add is generic (no card data or character names)' + (CARD.test(DEV) ? ': ' + DEV.match(CARD)[0] : ''));

// ---- Gemini's smell path (upstream's design: no smell talk anywhere but the killswitch and its gate)
ok(on(ID.scent) && on(ID.scentGate) && !on(ID.smellRules), 'Scent Killswitch and its depth-0 gate ON, Smell & Taste Rules OFF');
const sent = t => String(t || '').replace(/\{\{user\}\}/gi, 'Aria').replace(/\{\{\/\/[\s\S]*?\}\}/g, '').replace(/\{\{(setvar|getvar)::[^}]*\}\}/g, '').replace(/\{\{trim\}\}/g, '').replace(/\{\{lastUserMessage\}\}/g, '').trim();
const smelly = P.prompts.filter(p => on(p.identifier) && ![ID.scent, ID.scentGate].includes(p.identifier) && /\bsmell|\bscent/i.test(sent(p.content))).map(p => p.name);
ok(!smelly.length, 'no other enabled prompt names smell' + (smelly.length ? ': ' + smelly.join(', ') : ''));
ok(/what can be seen, felt, touched \(observable details only\)/.test(sent(P.prompts.find(p => /Cinematic Realism/.test(p.name)).content)), 'Cinematic Realism gives Gemini "seen, felt, touched"');

// ---- Impersonate: upstream's path
ok(on(ID.impersonate) && JSON.stringify(PP[ID.impersonate].injection_trigger) === '["impersonate"]', 'Impersonation Turn ON, fires only on Impersonate');

// ---- size: as SillyTavern sends it ({{user}} replaced, notes removed, empty macros send nothing)
{
  const size = Math.round(P.prompts.filter(p => on(p.identifier) && p.content && !p.marker && p.identifier !== ID.impersonate).reduce((a, p) => a + sent(p.content).length, 0) / 3.6);
  ok(size <= 18600, `enabled preset prompts stay within budget (${size} tokens a normal turn, budget 18600; RF as shipped ±30,300 with its trackers)`);
}
