"""The Eldrasil edition of Realistic Frankenstein 2.2.1.3 (the Realistic Gemini BOLT configuration).

1.68.0 (owner-approved audit/AUDIT_2026-10-14_1_preset_RF2213.md, section 5): the base is the creator's tuned Gemini configuration,
used as it ships (127 prompts, prompt order, roles, depths, triggers, toggles, sampling, 59 regexes). This script applies only:
  D  deviations the card needs (the card keeps the only game state, the clock, the weather and the dialogue colours),
  P  three pointer fixes in upstream text,
  O  the owner's toggles,
  E  three Eldrasil prompts (Player Input Authority, Output language, Ordinary Turns) and the NPC Thoughts block.
1.99.3 (bug-hunt audit 2026-10-23, batch 2) adds D12-D17: where upstream and the card give two rules for one thing, the card's rule
wins, in words any card can use; and drops Embellish Mode's fixed opening (owner).
Every text edit asserts its anchor, so an upstream update that moves the text fails here instead of shipping half-applied.
The pre-1.68.0 edit (RF 2.2 + an RF 2.2.1 port, sections 1-16) is in git: git show 4a811c0:presets/edit_preset.py
"""
import json, copy, os, sys
sys.stdout.reconfigure(encoding='utf-8')

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'original', 'Realistic_Frankenstein_2_2_1_3_Realistic_Gemini_BOLT.json')
OUT = os.path.join(os.path.dirname(HERE), 'dist', 'Realistic_Frankenstein_2_2_1_3_Eldrasil.json')   # every download sits in dist/
d = json.load(open(SRC, encoding='utf-8'))
P = {p['identifier']: p for p in d['prompts']}
order = next(po for po in d['prompt_order'] if po['character_id'] == 100001)['order']
log = []

# upstream identifiers of every prompt this script touches
MAIN = 'main'
PHI = 'jailbreak'
README = '27e5541f-4af3-4920-ae49-a91e025425d7'
TIME_PLACE = '019f62e8-892f-7002-8fcf-eea637bd577b'
REALISM = '019f62e8-892f-700c-9795-53ecb3381d7d'
ANTI_PARROT = '019f62e8-892f-700f-93e0-640159f4d52a'
EMBELLISH = '019f62e8-892f-7010-bf59-e7b17fd4476f'
LENGTH = '019f62e8-892f-7012-98b4-8de29f11aa1d'
INSTINCTS = '019f62e8-892f-7016-a021-aa24f58271d6'
COLOR2 = '019f7a10-0000-7c00-9a10-000000000201'
FATE = 'a39a979a-e777-4935-9d24-5d858ef7daa5'
AGENDA = '019f67b4-7381-7000-bcc4-496b2e6ed920'
NOTEBOOK = '019f67ad-c0b1-7000-aca4-0e2480fa02db'
RELATIONSHIPS = '019f62e8-892f-7023-825d-9351eca0347f'
WORLD_SIM = '019f62e8-892f-7024-a40f-b906fceb58d2'
CHEKHOV = '019f62e8-892f-7025-be65-8859e7730ee0'
THOUGHTS = '019f62e8-892f-7026-92ea-34ff510c244b'
STATES = '019f62e8-892f-7027-93ef-159f3d55c410'
BOLT = '634ecfec-1862-4ce0-821e-e31057acadfa'
TURN_DICE = '486813c8-3587-456b-b5aa-84585afb3e89'
STACCATO = '5f285f06-57fe-49f1-9e9b-84c4d6d30d78'
COSMOS = 'c0a8f588-6ef0-4a32-b5ae-880050afe4e6'   # 🌌🚫 Banned Word List: Cosmos Edition
LAST_MILE = '1f782d15-d282-4a85-b087-2db2548752f0'   # 🚪 Last-Mile Gemini Banned Vocab Check
GENESIS = '019f62e8-892f-701e-ba47-40b8c3ddd5e8'   # 🧬 HQ NPC Genesis
PACING = '82632755-5233-56f8-8fa6-3f169510cc4e'   # 🌌⏱️ Pacing: Cosmos Edition
FIDELITY = 'f14c6679-2497-4bee-a00e-4c33f2d6d19d'   # 🎭 Card Fidelity


def entry(ident):
    return next(o for o in order if o['identifier'] == ident)


def toggle(ident, on, why):
    e = entry(ident)
    assert e['enabled'] != on, (P[ident]['name'], 'already', on)
    e['enabled'] = on
    log.append(('ON' if on else 'OFF', P[ident]['name'], why))


def rep(ident, a, b):
    p = P[ident]
    assert p['content'].count(a) == 1, (p['name'], a[:70])
    p['content'] = p['content'].replace(a, b, 1)


def insert(prompt, enabled, before=None, after=None):
    d['prompts'].append(prompt); P[prompt['identifier']] = prompt
    i = order.index(entry(before or after)) + (0 if before else 1)
    order.insert(i, {'identifier': prompt['identifier'], 'enabled': enabled})
    log.append(('NEW' if enabled else 'NEW (OFF)', prompt['name'], ('before ' if before else 'after ') + P[before or after]['name']))


NARRATOR_TRIGGERS = ['normal', 'continue', 'swipe', 'regenerate', 'quiet']   # upstream's narrator rules: everything but Impersonate

# ---- D1, D2: the card's MVU state is the only tracker (DECISIONS §10). The Internal States family writes a hidden tracker block every
# reply that would duplicate and contradict the card's state (rule 504 forbids any other tracker); the card's engine already does the
# world's events, routines, bonds and story debts. Turn Dice only prints the dice of Fate & Routine and World Sim (its own rule: keep it
# ON whenever either engine is ON).
for ident in (FATE, AGENDA, NOTEBOOK, RELATIONSHIPS, WORLD_SIM, CHEKHOV, STATES):
    toggle(ident, False, 'the card keeps the only game state (DECISIONS §10)')
toggle(TURN_DICE, False, 'its two dice engines are OFF')

# ---- D3: the card keeps the clock and the weather (World.Time, World._Weather, <now>, the bracelet); the header would invent its own.
# Its two "Untagged Thoughts" regexes serve that header and delete everything before a "[... Time" line (1.11.2: a player message
# ending in "[Time skip: two hours later]" reached the model as only that bracket).
toggle(TIME_PLACE, False, 'the card keeps the clock and the weather')
for r in d['extensions']['regex_scripts']:
    if r['scriptName'] in ('FF5 Delete - Untagged Thoughts', 'FF5 Catch - Untagged Thoughts'):
        assert not r['disabled']; r['disabled'] = True
        log.append(('REGEX OFF', r['scriptName'], 'serves the Time and Place header'))

# ---- D4: the card colours dialogue itself (<say:Name>, DECISIONS "Dialogue colours"); two colour formats in one reply would fight.
# Upstream's own note: "Many front-ends colour dialogue themselves — if yours does, leave both off."
toggle(COLOR2, False, 'the card colours dialogue with <say:Name>')

# ---- D5 (owner, 1.37.3): Internal Thoughts as a block of its own. Upstream it only fills a template inside the Internal States block
# (OFF here), so ON alone it had nowhere to go. It keeps no state and names no card data. The prompt keeps upstream's place and triggers.
assert 'thoughtsTemplate' in P[THOUGHTS]['content']
P[THOUGHTS]['content'] = """{{// ELDRASIL EDITION. ON: after the story, a folded 🧠 Thoughts block shows what up to three NPCs are thinking right now. It keeps no state and never writes {{user}}'s thoughts; the story itself still keeps thoughts unspoken. OFF: no block. The preset's regexes fold it on screen and drop it from older replies in the prompt. If characters start to drift, also enable the regex "NPC Thoughts: drop from every reply": you still see the thoughts, and the AI never reads them back. Upstream's version only fills a section of the Internal States block, which stays OFF with a card that keeps its own state.}}{{trim}}

<internal_npcthoughts>
After the narrative, write one thoughts block in exactly this form, in the story's language:
<npc_thoughts>
- **Name**: thought
- **Name** (where they are, what they are doing): thought
</npc_thoughts>
1. Who: up to 3 NPCs, present ones first. An absent NPC appears only when they matter to what is happening, at the place and task the card's records or the story already give them; the block never moves anyone or invents a meeting. Never {{user}}: their thoughts belong to the player.
2. Voice: 1 to 3 short lines each, in the moment, but only as raw as that character is: a thought is never more emotional or dramatic than their card makes them. True to their card, their mood and, when the card keeps one, its record of how they see {{user}}.
3. Knowledge: only what that character knows. A thought never spells out a secret the story still keeps from {{user}}; such a thing shows only as the character would feel it (unease, a topic they steer away from).
4. Consistency: the thoughts match the narrative and drive what each NPC does next.
5. Place: outside the narrative, so the prose never quotes or summarises it; right before the card's state-update block when there is one, and the update block stays last. Never write this instruction's tag name in the reply.
</internal_npcthoughts>"""
log.append(('EDIT', P[THOUGHTS]['name'], 'its own <npc_thoughts> block (owner 1.37.3)'))
d['extensions']['regex_scripts'] += [
    {'id': 'eldrasil-npc-thoughts-fold', 'scriptName': 'Eldrasil edit - NPC Thoughts: fold (display)',
     'findRegex': r'/<npc_thoughts>\s*([\s\S]*?)\s*<\/npc_thoughts>/gi',
     'replaceString': '<details data-npc-thoughts="1" style="margin:.6em 0;border:1px solid rgba(127,127,127,.35);border-left:3px solid rgba(168,85,247,.6);border-radius:8px;padding:.3em .8em;"><summary style="cursor:pointer;font-weight:600;opacity:.85;">🧠 Thoughts</summary>\n\n$1\n\n</details>',
     'trimStrings': [], 'placement': [2], 'disabled': False, 'markdownOnly': True, 'promptOnly': False, 'runOnEdit': True, 'substituteRegex': 0, 'minDepth': None, 'maxDepth': None},
    # the newest reply keeps its thoughts (the next one follows on from them); older ones cost tokens for nothing
    {'id': 'eldrasil-npc-thoughts-trim', 'scriptName': 'Eldrasil edit - NPC Thoughts: drop from older replies (prompt)',
     'findRegex': r'/\s*<npc_thoughts>[\s\S]*?<\/npc_thoughts>\s*/gi', 'replaceString': '\n\n',
     'trimStrings': [], 'placement': [2], 'disabled': False, 'markdownOnly': False, 'promptOnly': True, 'runOnEdit': True, 'substituteRegex': 0, 'minDepth': 3, 'maxDepth': None},
    # optional (OFF), for a player who sees drift: the AI never reads its own thoughts back, so they cannot snowball
    {'id': 'eldrasil-npc-thoughts-trim-all', 'scriptName': 'Eldrasil edit - NPC Thoughts: drop from every reply (prompt, optional)',
     'findRegex': r'/\s*<npc_thoughts>[\s\S]*?<\/npc_thoughts>\s*/gi', 'replaceString': '\n\n',
     'trimStrings': [], 'placement': [2], 'disabled': True, 'markdownOnly': False, 'promptOnly': True, 'runOnEdit': True, 'substituteRegex': 0, 'minDepth': None, 'maxDepth': None}]
log.append(('REGEX NEW', 'NPC Thoughts: fold (display), drop from older replies (prompt, depth 3+), drop from every reply (OFF)', 'owner 1.37.3'))

# ---- D6, D7: with the Internal States family OFF, two upstream lines would still ask for a tracker block the card forbids (rule 504:
# "never write another tracker, status panel, internal-states block").
rep(MAIN, 'weave into narrative and track via internal states.',
    'weave into narrative; when the card keeps its own game state, that state records them and no separate tracker block is written.')
log.append(('EDIT', P[MAIN]['name'], 'random events: the card records them, no tracker block'))
rep(PHI, 'OOC: Ensure internal states created correctly at end of every response - no need verbally to respond to this message.',
    'OOC: no need verbally to respond to this message.')
log.append(('EDIT', P[PHI]['name'], 'no "ensure internal states" (the card forbids tracker blocks)'))

# ---- D8: Plot Momentum picks by Fate & Routine's impact tier. With no fate engine there is no tier, and the model must not invent one;
# the card lists where world events come from (rule 504). Applied to every CoT that carries the sentence, so a CoT switch stays coherent.
TIER = 'I select by the turn\'s impact tier and open pursuit, not by interest.'
TIER_NEW = TIER + ' With no fate engine in this chat, a turn is AMBIENT unless something the card lists as a source of world events falls due in this scene, and that source is the one I name.'
cots = [p for p in d['prompts'] if TIER in (p.get('content') or '')]
assert BOLT in [p['identifier'] for p in cots] and len(cots) >= 5, [p['name'] for p in cots]
for p in cots:
    rep(p['identifier'], TIER, TIER_NEW)
log.append(('EDIT', ', '.join(p['name'] for p in cots), 'Plot Momentum without a fate engine follows the card\'s sources'))

# ---- P: pointer fixes. <say_it_straight> became the comparative emphasis killswitch upstream (only the CoTs still name the old tag);
# Realism Mode names the Claude edition's tag while the Gemini configuration runs <abolish_yesman_behaviour>; the instinct list has 8.
STALE = '(<say_it_straight>, <break_the_triad>,'
stale = [p for p in d['prompts'] if STALE in (p.get('content') or '')]
assert BOLT in [p['identifier'] for p in stale], [p['name'] for p in stale]
for p in stale:
    rep(p['identifier'], STALE, '(<comparative_emphasis_killswitch>, <break_the_triad>,')
log.append(('FIX', ', '.join(p['name'] for p in stale), '<say_it_straight> -> <comparative_emphasis_killswitch>'))
rep(REALISM, '<avoid_yesman_behaviour>', '<abolish_yesman_behaviour>')
rep(INSTINCTS, 'All NPCs possess these core biological instincts [7]:', 'All NPCs possess these core biological instincts [8]:')
log.append(('FIX', P[REALISM]['name'] + ', ' + P[INSTINCTS]['name'], 'the active yes-man tag; eight instincts'))

# ---- D11: the Staccato Chop Killswitch ships ON in the Gemini configuration, against its own note ("MUST stay OFF on Gemini": it makes
# Gemini ignore the other anti-slop prompts) and with its Legato gate OFF ("keep this toggle OFF for Gemma and Gemini"). The owner's
# preset library agrees (Buku 02 §D: chop bans flatten Gemini's prose though Gemini rarely chops; Buku 19 §5: likely a configuration
# slip; Worldhopper gives Gemini no legato gate). BOLT's own staccato check stays, as upstream wrote it.
toggle(STACCATO, False, 'its own note: MUST stay OFF on Gemini (and its gate is OFF)')

# ---- O: the owner's toggles (1.36.0): Embellish Mode instead of Anti-parrot, and longer replies (4 to 7 paragraphs).
toggle(ANTI_PARROT, False, 'owner: Embellish Mode instead')
toggle(EMBELLISH, True, 'owner: the narrator writes {{user}} from what the player wrote')
toggle(LENGTH, True, 'owner: 4 to 7 paragraphs')
rep(LENGTH, 'Length: Your response must be roughly 4 to 8 paragraphs and 400 to 600 words (excluding headers and internal states).',
    'Length: Your response must be roughly 4 to 7 paragraphs (excluding headers, the thoughts block and the state-update block).')
# 1.99.3 (owner 2026-10-23, audit R2): Embellish stays ON and Anti-parrot OFF, but its rule 2 made every reply open the same way, with
# {{user}}'s own words echoed first (the repeating reply shape players report on Gemini Argon). Only that rule goes; NPCs becomes rule 2.
rep(EMBELLISH, "2. Flow: Always begin your response with {{user}}'s stylized actions and dialogue first.\n3. NPCs:", '2. NPCs:')
log.append(('EDIT', P[EMBELLISH]['name'], 'owner: no fixed opening with {{user}} (R2)'))

# ---- D12-D17 (1.99.3, bug-hunt audit audit/AUDIT_2026-10-23_2_audit_menyeluruh.md §3.2 and §9, batch 2): where upstream and a card
# that sets its own rule give two orders for one thing, the card's rule wins. Each line is worded for any card and changes nothing
# when the card is silent.
# D12 (P1): the ban list covers its words "in every form ... as any part of a hyphenated or compound word", so the narrator was told to
# replace a card's titles and place names (this card: Vice Headmaster and Vice President in 31 lore entries, the Velvet Lanes, the
# Furnace room, "the asset" as one character's way of speaking). A name is not vocabulary; the list itself stays upstream's.
rep(COSMOS, 'A hyphen or a suffix does not make it a different word.',
    'A hyphen or a suffix does not make it a different word.\n\nNames are not vocabulary: a name, title or place name that the character card or a lorebook entry writes (a title such as Vice President, a place such as the Velvet Room) is written exactly as given, every time. The list governs only the words the narration and dialogue choose for themselves.')
rep(LAST_MILE, 'is swapped for its plain replacement before writing.',
    'is swapped for its plain replacement before writing; a name, title or place name the card or a lorebook writes is not a planned word and stays exactly as written.')
log.append(('EDIT', P[COSMOS]['name'] + ', ' + P[LAST_MILE]['name'], 'D12: names, titles and places the card writes are not banned vocabulary'))
# D13 (P2): <NPC_intro> sweeps a new NPC head to toe; this card keeps a roster newcomer's first appearance short and never re-introduces
# someone {{user}} knows (rule 504). The sweep stays for the NPCs the card gives no such rule for.
rep(MAIN, 'trigger: first appearance of an NPC in the simulation',
    "trigger: first appearance of an NPC in the simulation\n  card rule first: when the character card or a lorebook entry sets how a character's first appearance is written (kept short, or no sweep for someone {{user}} already knows), that rule replaces this sweep; the sweep is for an NPC it sets no such rule for")
log.append(('EDIT', P[MAIN]['name'], "D13: the card's first-appearance rule replaces the NPC intro sweep"))
# D14 (P3): random events may be anything ("incoming calls" in a world without phones); this card lists where the world's events come
# from and says everything else follows from what people on screen do (rule 504). D6 already changed the sentence's tail.
rep(MAIN, 'e.g., off-screen actions, incoming calls, background movement;',
    "e.g., off-screen actions, background movement; when the card lists where the world's events come from, they come only from those sources;")
log.append(('EDIT', P[MAIN]['name'], "D14: random events come only from the card's sources"))
# D15 (P4): HQ NPC Genesis draws five names and its own temperament, and its profile "outweighs any other inference"; this card's <now>
# already gives the next new character's name and traits (data/name_pool.json). Two naming authorities: the card's goes first.
rep(GENESIS, 'Naming: Generate 5 setting-appropriate',
    "Card first: when the character card or a lorebook entry already gives a new character's name or traits (a name to use next, a list of traits), use exactly those and generate only what it leaves open.\nNaming: Generate 5 setting-appropriate")
log.append(('EDIT', P[GENESIS]['name'], 'D15: a name and traits the card gives come first'))
# D16 (R3, the preset half; the card half is batch 3): WEAVE lets fate or anyone's agenda break into a long talk; with the card's
# sources (D14) an interruption comes from those or from someone on screen, so the world does not crowd {{user}} out of a scene.
rep(PACING, "a long conversation gets interrupted by what fate or someone's agenda brings.",
    "a long conversation gets interrupted by what fate or someone's agenda brings. When the card lists where the world's events come from, an interruption comes only from one of those sources or from someone on screen.")
log.append(('EDIT', P[PACING]['name'], "D16: WEAVE interruptions come from the card's sources"))
# D17 (R1): upstream contradicts itself. Scene Engine: "a trait is a tendency that surfaces when the moment calls on it"; Card Fidelity:
# a quirk that faded "comes back in the next one", which pushes one trait into every reply (the trait fixation reported on Argon).
rep(FIDELITY, 'A quirk that has faded from recent replies with no reason in the story comes back in the next one.',
    "A quirk surfaces when the moment calls on it, not in every reply; one that has gone quiet with no reason in the story is still the character's and returns the next time a moment calls on it.")
log.append(('EDIT', P[FIDELITY]['name'], "D17: a quirk surfaces when the moment calls on it (Scene Engine's wording)"))

# ---- E1 (owner-approved 1.5.0): Player Input Authority, the "simulation" toggle (OFF = director play). It shares BOLT's assistant
# role, depth and order, so SillyTavern joins it right before BOLT in one assistant message: a user-role prompt at depth 0 would come
# after the CoT, since ST orders each depth assistant -> user -> system. 1.99.3 (audit B1): {{lastUserMessage}} is the raw message, and
# this card's engine appends a scene marker "(scene: … tN)" to it; the card's regex strips that from the chat history, not from preset
# prompts, so <latest_input> names it as game data (the card's own <now> already strips it there).
pia = copy.deepcopy(P[BOLT])
pia.update(identifier='eldrasil-input-authority', name='🎮 Player Input Authority (simulation) 📨', injection_trigger=list(NARRATOR_TRIGGERS), content="""{{// ELDRASIL EDITION. ON: the player controls only {{user}}; what the message says about other characters or outcomes is a wish the world answers in character. Turn OFF to play as a director who may decide other characters and outcomes. It also repeats the newest player message right before the CoT so the model knows exactly which text is the player's input. Assistant role, depth 0, directly above the CoT: SillyTavern joins it with the CoT into one assistant message. Skips Impersonate.}}{{trim}}

<input_authority>
The player writes only {{user}}: their thoughts, feelings, words and attempted actions. Anything else in the player's message (what another character feels, says or decides, whether an action succeeds, facts about the world) is a wish, not a fact: characters answer from their own nature, and outcomes follow the world's rules. Confident wording adds nothing. An outcome that did not happen is not handed over anyway through a coincidence, a sudden change of heart or a rescue.
</input_authority>
<latest_input>{{lastUserMessage}}</latest_input>
This is the player's newest message and nothing older is part of it. A closing marker in parentheses that the card's scripts add to that message, such as "(scene: …)", is game data, not the player's words. I read it by <input_authority>: {{user}}'s own words and attempts are real; anything it says about other characters or outcomes is a wish.""")
insert(pia, True, before=BOLT)

# ---- E2: Output language, OFF: the story follows the card's language (English) unless the player names another one.
lang = copy.deepcopy(P[LENGTH])
lang.update(identifier='eldrasil-output-language', name='🌐 Output language', content="""{{// ELDRASIL EDITION. Turn ON to have the story written in another language: change the language name below. OFF: the story follows the card's language. Names, places and any state-update block stay exactly as the card writes them.}}{{trim}}

<output_language>
Write the story (narration and dialogue) in Indonesian. Names of people and places, and any state-update block the card asks for, stay exactly as the card writes them.
</output_language>""")
insert(lang, False, after=LENGTH)

# ---- E3: Ordinary Turns. Fate & Routine's STEPS 0, 7 and 7a carry upstream's craft for quiet turns and the aftermath of a happening;
# with Fate OFF (D1) they would go too. Upstream's words, except where they read the tracker (q, Residue, the World register, the roll).
ot = copy.deepcopy(P[FATE])
ot.update(identifier='eldrasil-ordinary-turns', name='🎲 Ordinary Turns (Fate & Routine steps 0, 7, 7a, no tracker)', content="""{{// ELDRASIL EDITION. STEPS 0, 7 and 7a of 🎲 Fate & Routine Engine, word for word except where they read its tracker (q, the Residue list, the World register, the impact roll) and without step 7's 60-75 percent dialogue share, which contradicts BOLT's 30-50 percent. Fate & Routine stays OFF with a card that keeps its own game state, because it writes a FATE & ROUTINE block every reply; these ordinary-turn rules keep no state, so they work with any card. Turn this OFF if you turn Fate & Routine ON.}}{{trim}}

<ordinary_turns>
{{user}} is never gated. Whatever {{user}} said or did is answered fully and consequentially this turn, with no exception. Nothing here governs how completely characters respond to {{user}}. It governs only what the world does on its own.

When no pursuit is open, or the turn is AMBIENT (nothing from the world lands on the scene), the scene runs on needs and the clock.
- Small stays small. A small event gets no weight, no foreshadowing, no second mention. No ominous closing line, no "something felt off", no NPC glancing meaningfully at anything.
- Drive NPCs from drifting needs — fed, rested, sociable, comfortable, occupied — plus what this hour would normally have them doing. A man six hours on his feet who has not eaten behaves differently from one who just opened.
- An NPC may not perform their occupation as a visible loop (filing, inventorying, wiping down, tallying) more than once in any three turns. Occupation is a setting, not an activity.
- Exactly one thing must change: posture or position, who holds the floor, the topic, the state of an object, temperature or light, or an unfinished physical task. Change without escalation.
- Encouraged: talking about nothing, answering a different question than the one asked, losing a thread, repeating oneself the way people do, a joke that does not land, silence held too long, being absorbed in something mundane and answering distractedly.
- NPCs may decline to engage. Not taking emotional bait is a complete response.
- NPC-to-NPC exchanges that exclude {{user}} are encouraged.
- What ordinary life has accumulated is ordinary material now.
- NPCs know the world's news and rumours at their own level of access and treat them as old news, not as exposition. They have opinions about them, usually wrong ones, and they repeat what they heard rather than what is true. They also know what {{user}} has done that reached them, and they mention it the way people mention things — sideways, incompletely, and at the wrong moment.
- In the two or three replies after something happened, this is the settle window. Write it as ordinary life resuming — the conversation after the thing, when nobody is solving anything.

The return: in those replies the ordinary turn is specifically the return to normal after whatever just happened. Nobody solves anything. What happened is present only as aftermath: a mess to clear, a thing to put back, a subject being circled or avoided, a body that is tired now.
This is where the relationship writing lives. It is not filler and it is not a gap between events.
Do not open a new pursuit during these turns unless the world forces one or {{user}} chooses one.
</ordinary_turns>""")
insert(ot, True, after=FATE)

# ---- D10: a note above upstream's README (never sent) so the Prompt Manager shows what this edition changes
rep(README, '{{//Thank you for downloading', """{{//ELDRASIL EDITION (built by presets/edit_preset.py, card 1.68.0). This is the Realistic Gemini BOLT configuration as it ships, except:
- OFF because the card keeps the only game state: Fate & Routine, Internal Agenda, GM's Notebook, Relationships RPG, World Sim, Chekhov's Gun, Internal States, and Turn Dice (it prints their dice). Turn them back ON only with a card that keeps no state of its own.
- OFF because the card keeps the clock and weather and colours dialogue itself: Time and Place (with its two Untagged Thoughts regexes) and Colored Dialogue 2.0.
- OFF as its own note says for Gemini: the Staccato Chop Killswitch (the configuration ships it ON; its Legato gate is OFF).
- Gemini 3.8 ignores temperature, top-p and top-k (Google's model guide), so the sampling values in this file change nothing.
- Internal Thoughts writes its own folded <npc_thoughts> block, with three regexes of its own.
- Three sentences point to the card's state instead of Internal States: the Main Prompt's random events, the Post-History Instructions and Plot Momentum in the CoTs (no fate engine, so the card's sources decide).
- Pointer fixes: <comparative_emphasis_killswitch> in the CoTs, <abolish_yesman_behaviour> in Realism Mode, eight instincts.
- Where upstream and the card give two rules for one thing, the card's rule wins: names, titles and places the card writes are not banned vocabulary (Banned Word List: Cosmos Edition and its last-mile gate); the card's first-appearance rule replaces the NPC intro sweep; random events and Pacing's WEAVE interruptions come only from the sources the card lists (no "incoming calls"); HQ NPC Genesis uses a name and traits the card gives; Card Fidelity lets a quirk surface when the moment calls on it, as Scene Engine says, instead of in the next reply.
- The owner's toggles: Embellish Mode instead of Anti-parrot, without its rule to open every reply with {{user}}; Total Output Length ON at 4 to 7 paragraphs.
- Added: Player Input Authority (assistant role, right above BOLT; it reads the card's scene marker as game data), Output language (OFF) and Ordinary Turns (Fate & Routine steps 0, 7 and 7a without the tracker).}}{{trim}}

{{//Thank you for downloading""")

json.dump(d, open(OUT, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=4)
for l in log:
    print(' | '.join(l))
