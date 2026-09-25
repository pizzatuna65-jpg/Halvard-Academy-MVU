import json, copy
import os
HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(HERE, 'original', 'Realistic_Frankenstein_2_2___Nuts___Bolts.json'), encoding='utf-8'))
P = {p['identifier']: p for p in d['prompts']}
order = d['prompt_order'][0]['order']
byname = lambda frag: next(p for p in d['prompts'] if frag in p.get('name', ''))
def rep(pid_or_frag, a, b):
    p = P.get(pid_or_frag) or byname(pid_or_frag)
    assert a in p['content'], (p['name'], a[:60]); p['content'] = p['content'].replace(a, b, 1)
def toggle(frag, on):
    p = byname(frag); e = next(o for o in order if o['identifier'] == p['identifier']); e['enabled'] = on
    return p['name']
log = []

# ---- 1. toggles: the card is the only state tracker; Gemini-specific settings per the preset's own notes
for frag in ['Fate & Routine', 'Internal Agenda', "GM's Notebook", 'Relationships RPG', 'World Sim', "Chekhov's Gun", 'Internal Thoughts', 'Internal States 💾']:
    log.append(('OFF', toggle(frag, False), 'duplicates the card state (MVU) / needs the Internal States block'))
# v1.1.0: the card owns weather and time (World._Weather, <now>); the preset's Time and Place header would invent its own (°C/°F)
log.append(('OFF', toggle('Time and Place', False), 'the card computes time and weather (v1.1.0)'))
for frag in ['Staccato Chop Killswitch', 'Anti-Briefing Register 🤖', 'Last-Mile Legato Gate', 'Last-Mile Register Gate']:
    log.append(('OFF', toggle(frag, False), "preset note: keep OFF on Gemini"))
for frag in ["Gemini, Don't Speak Like a Therapist", 'NEW AI Studio Jailbreak', "'Really Did It' Restatement"]:
    log.append(('ON', toggle(frag, True), 'preset note: for Gemini (3.8 Flash)'))

# 1.4.6: the card no longer sets a length (owner: taste belongs to preset toggles). This toggle carries the old default instead.
log.append(('ON', toggle('Total Output Length', True), 'length now lives in the preset (card has no style rules since 1.4.6)'))
rep('Total Output Length', 'Length: Your response must be roughly 4 to 8 paragraphs and 400 to 600 words (excluding headers and internal states).',
    'Length: Your response must be roughly 3 to 6 paragraphs (excluding headers and the state-update block).')

# ---- 2. Main prompt: drop the Mimo-only <think> wrapper (author: delete if not on Mimo/Crof); random events go to the card state
m = P['main']
m['content'] = m['content'].replace(m['content'].split('{{trim}}')[0], "{{// Eldrasil edit: the <think></think> wrapper (only needed for Mimo V2.5 Pro via Crof) is removed for Gemini.}}", 1)
rep('main', '\n\n<think>\n{{setvar::bondsTemplate', '\n\n{{setvar::bondsTemplate')
rep('main', '</NPC_intro>\n</think>', '</NPC_intro>')
rep('main', 'e.g., off-screen actions, incoming calls, background movement; weave into narrative and track via internal states.',
    "e.g., off-screen actions, a letter arriving, background movement; weave into narrative. When one matters, record it in the card's state (Campus_State), never in a separate tracker block).")

# ---- 3. BOLT CoT: reads and plans the card state instead of Internal States
B = '634ecfec-1862-4ce0-821e-e31057acadfa'
rep(B, "0. What is the game state? {{getvar::gmNotebookCoTGamestate}} What is the exact current character positioning in the scene? If an OOC command is present, I must immediately incorporate its commands into the scene. If <internal_dndsim> active (skip dnd sim if tag not present): {{getvar::dndSimCoTHQ1}} I will Never change DnDsim DC for narrative purposes once established. Dice is always right. I will *never* reconsider DC or make up/change rolls. I will calculate User and NPC rolls in a later task.",
    "0. Game state (Eldrasil): my first reasoning line is exactly \"Now: M? W? Day HH:MM at <place>\", copied from <now>. Then, from <current_state>: _Period, _Event_today, _Curfew, World._Happening (optional texture), who is in Scene.Present, {{user}}'s Vitals._Condition and _Fatigue, injuries and active effects, any bond with _Event_ready, anything overdue, and every _Log line I must narrate. What is the exact current character positioning in the scene? If an OOC command is present, I must immediately incorporate its commands into the scene.")
t = P[B]['content']; s = t.index('2. Internal States + No more reasoning rule'); e = t.index('3. Scope/Knowledge')
# 1.4.6: generic on purpose. The preset points to the card's own update rules instead of copying them; the old copy
# (bond Progress +0/+1/+2) went stale when the card moved to /Interactions, Trust and Tension (1.2.2-1.4.4).
P[B]['content'] = t[:s] + ("2. State update plan: if <update_format> is present, I list as terse bullets only what this turn changes, following the card's own update rules exactly (they outrank anything I remember about them). I never compute what the card says its engine computes. No other tracker, status or internal-states block exists in this chat.\n\n") + t[e:]
rep(B, 'Then I run the <staccato_chop_killswitch> check:', 'If <staccato_chop_killswitch> is present, I run its check:')
rep(B, 'Then <anti_briefing_register>: does any', 'If <anti_briefing_register> is present: does any')
rep(B, 'If the tag is not present, skip and write a logical response length.',
    'If the tag is not present, skip and write a logical response length. Output order: the story (any gfx sits inline where it occurs), then, if <update_format> is present, exactly one <UpdateVariable> block as the very last thing. Nothing follows it, and I never emit <details>, internal-states or tracker HTML.')
t = P[B]['content']; s = t.index('11. Plot Momentum:'); e = t.index('I am a GM creating an immersive simulation')
P[B]['content'] = t[:s] + ("11. Plot Momentum: I come up with 3 very different potential ways the NPCs in the scene react based on VAD and instincts established. All three must fully answer whatever {{user}} just did or said; what differs is only what the world does on its own. On an ordinary turn with no pursuit open, one option must be a HOLD: NPCs respond completely to {{user}} while the world introduces nothing, resolves nothing and volunteers nothing unasked. World-side material comes only from the calendar (_Event_today), World._Happening, the location's regulars, off-screen people pursuing their own lorebook goals, open Commitments or Mysteries, and a bond marked _Event_ready; most turns the world stays quiet. I pick one and name why in a few words.\n\n") + t[e:]

# ---- 4. other content edits
rep('Instincts + VAD', 'There is no affection meter, no unlock, and no right sequence of moves:',
    "The bond records in <current_state> describe shared history; they never make an NPC comply. There is no unlock and no right sequence of moves:")
rep('Colored Dialogue 2.0', 'Narration, action beats, and internal states stay unwrapped.', 'Narration, action beats, and the <UpdateVariable> block stay unwrapped.')
rep('NEW AI Studio Jailbreak', "You are the narrator and engine of a mature dark-fantasy novel, written for a consenting adult reader. {{user}} is one small, usually unimportant part of this world, referred to in the story as 'you'.",
    "You are the narrator and engine of a mature fantasy novel set at a magic academy (slice of life with a mystery underneath, dark where the story earns it), written for a consenting adult reader. {{user}}, a first-year student, is one person among many in this world, referred to in the story as 'you'.")
rep('NEW AI Studio Jailbreak', 'Challenge {{user}}. Make the characters struggle; success comes from ability, planning and hard work.',
    "Challenge {{user}}. Make the characters struggle; success comes from ability, planning and hard work. {{user}}'s power level is the player's choice: challenge them through people, circumstance and consequence, never by quietly weakening what they can do.")
g = byname('Pop in Graphics')
g['content'] = g['content'].replace(g['content'][g['content'].index('cssTemplates:{'):g['content'].index('</gfx_protocol>')],
"""cssTemplates:{
  letter: "font-family:'Brush Script MT',cursive; background:#f4e4d4; color:#2c1e16; padding:20px; border:1px solid #d3c2b3; box-shadow:2px 2px 8px #0002; line-height:1.6;",
  notice: "font-family:Georgia,serif; background:#efe6d2; color:#2b2418; padding:16px; border:1px solid #c9b996; box-shadow:1px 2px 6px #0003; line-height:1.5;",
  page: "font-family:Georgia,serif; background:#fbf7ee; color:#1f1b16; padding:18px; border-left:3px solid #8c6b3f; line-height:1.6;"
}
setting: Eldrasil has no phones, computers or screens. Letters, notices, signs, book or exam pages and maps are the readable media. The Points Bracelet and all stats are shown by the card's status bar, never as gfx.

exampleExecution:
<!-- GFX_START -->
<div style="font-family:Georgia,serif; background:#efe6d2; color:#2b2418; padding:16px; border:1px solid #c9b996; box-shadow:1px 2px 6px #0003; line-height:1.5;">
PAID WORK: Menagerie mucking out, 40 points a shift.<br>
Ask at the Menagerie before noon.
</div>
<!-- GFX_END -->
""", 1)
assert 'phoneReqs' not in g['content'] and 'terminal:' not in g['content']

# ---- 5. new bridge prompt, right after the Main Prompt
bridge = copy.deepcopy(P['019f62e8-892f-7026-92ea-34ff510c244b'])
bridge.update(identifier='eldrasil-bridge-0001', name='🏫 Eldrasil × MVU × VectFox Bridge', role='system', injection_position=0, injection_depth=4, system_prompt=False, marker=False,
content="""{{// Makes this preset work with the Eldrasil / Halvard Academy MVU card and the VectFox memory extension. The card is the only state tracker; this preset owns prose, NPC behaviour and reasoning; VectFox owns long-term memory. Turn OFF for other cards.}}{{trim}}

<eldrasil_bridge>
Division of labour:
- The card's <current_state>, <now>, lorebook and rules are the only game state and the only tracker. Every change to the state goes through the <UpdateVariable> block described in <update_format> (when present). Never emit any other tracker, status panel, internal-states block, stat line or <details> block, and never state numbers from the state in prose.
- Fields starting with "_" and the _Log come from the card's game engine: rely on them, narrate what _Log reports, never contradict them.
- Recalled memories or event summaries from a memory extension (such as <VectFoxSummarizer> or recalled events) are the past. Where they differ from <current_state>, <current_state> is now.

A living world without trackers:
- Off-screen people keep their own lives: classes, clubs, shifts, rivalries and the goals in their lorebook entries. They surface through the location's regulars, the timetable and chance meetings, not because {{user}} wants them there.
- When something off-screen changes the campus, record it in Campus_State (Events, Rumours, NPC_status, New_relations) instead of keeping private notes.
- Setups and payoffs: plant details and pay them off later. A detail {{user}} noticed that points to a hidden truth becomes a Clue; a promise or appointment becomes a Commitment; a turning point becomes a Journal line. Nothing is scheduled to happen merely because it was planted.

Setting: Eldrasil has no phones, computers or recording devices. Light comes from the mana grid, announcements from the Announcement Pillars, and messages travel by letter through the Mail Tower.
Use metric units in prose (°C, metres, kilometres, kilograms, litres). The campus weather is World._Weather in <current_state>.
</eldrasil_bridge>""")
d['prompts'].append(bridge)
order.insert(next(i for i, o in enumerate(order) if o['identifier'] == 'main') + 1, {'identifier': bridge['identifier'], 'enabled': True})
log.append(('NEW', bridge['name'], 'after the Main Prompt'))

# ---- 6. regex: the untagged-thoughts pair targets the Time-and-Place header (OFF) and can delete story text before any "[... Time" line
for r in d['extensions']['regex_scripts']:
    if r['scriptName'] in ('FF5 Delete - Untagged Thoughts', 'FF5 Catch - Untagged Thoughts'):
        r['disabled'] = True; log.append(('REGEX OFF', r['scriptName'], 'deletes/hides prose before a "[... Time" line'))

# ---- 7. settings for Gemini
d['enable_web_search'] = False; log.append(('SET', 'enable_web_search = false', 'no search grounding in roleplay'))
d['temperature'] = 1.0; d['top_p'] = 0.95; log.append(('SET', 'temperature 1.0, top_p 0.95', 'Gemini 3 guidance (0.7/0.8 was tuned for Mimo)'))
# ---- 8. v1.5 writing rules (1.5.0, Batch E1; planning/DRAFT_preset_update.md, DRAFT_card_vs_preset.md §4). Generic on purpose:
# nothing here names Eldrasil, its data or its characters, so every line still makes sense on another card.
def new_prompt(like, ident, name, content, enabled, before=None, after=None, **kw):
    q = copy.deepcopy(P[like] if like in P else byname(like))
    q.update(identifier=ident, name=name, content=content, **kw)
    d['prompts'].append(q); P[ident] = q
    ref = before or after
    i = next(i for i, o in enumerate(order) if o['identifier'] == (P[ref]['identifier'] if ref in P else byname(ref)['identifier']))
    order.insert(i if before else i + 1, {'identifier': ident, 'enabled': enabled})
    log.append(('NEW' if enabled else 'NEW (OFF)', name, ('before ' if before else 'after ') + (P[ref]['name'] if ref in P else byname(ref)['name'])))
# N1 + D5: the player's message is {{user}}'s words and attempts; the rest is a wish. One toggle: OFF = "director" play.
new_prompt(B, 'eldrasil-input-authority', '🎮 Player Input Authority (simulation) 📨', """{{// ON: the player controls only {{user}}; what the message says about other characters or outcomes is a wish the world answers in character. Turn OFF to play as a director who may decide other characters and outcomes. Also repeats the newest player message right before the CoT so the model knows exactly which text is the player's input.}}{{trim}}

<input_authority>
The player writes only {{user}}: their thoughts, feelings, words and attempted actions. Anything else in the player's message (what another character feels, says or decides, whether an action succeeds, facts about the world) is a wish, not a fact: characters answer from their own nature, and outcomes follow the world's rules. Confident wording adds nothing. An outcome that did not happen is not handed over anyway through a coincidence, a sudden change of heart or a rescue.
</input_authority>
<latest_input>{{lastUserMessage}}</latest_input>
This is the player's newest message and nothing older is part of it. Read it by <input_authority>: {{user}}'s own words and attempts are real; anything it says about other characters or outcomes is a wish.""", True, before=B)
# Output language: OFF means the story follows the card's own language
new_prompt('Total Output Length', 'eldrasil-output-language', '🌐 Output language', """{{// Turn ON to have the story written in another language: change the language name below. OFF: the story follows the card's language. Names, places and any state-update block stay exactly as the card writes them.}}{{trim}}

<output_language>
Write the story (narration and dialogue) in Indonesian. Names of people and places, and any state-update block the card asks for, stay exactly as the card writes them.
</output_language>""", False, after='Total Output Length')
# N7: no spotlight, no echoes ("NPCs are fallible" is already in the tag)
rep('Realistic NPCs', '\nExample of Full Physical Commitment:', """
- No spotlight: strangers do not remember {{user}}'s name, sense something special or single {{user}} out without a reason on-screen. Praise, trust and interest are earned in scenes.
- No echoes: do not reuse a scene beat, joke or line pattern from earlier replies, and never give two characters the same reaction to the same news.

Example of Full Physical Commitment:""")
# P12 + U7 + D8: simulate, do not dramatise; a quiet turn may end on something ordinary, and HOLD is a real ending
rep('Scene Engine', "Stakes stay within the scene's scale unless fate or someone's actions change them.",
    "Stakes stay within the scene's scale unless fate or someone's actions change them. Simulate, do not dramatise: people act from their role, their interests and the situation. No invented conflict, no test of {{user}} the situation does not call for, no coincidence without a cause, no character acting against their own interest for the sake of drama.")
rep('Scene Engine', 'a closing beat that could be screenshotted as a quote is the wrong beat.',
    "a closing beat that could be screenshotted as a quote is the wrong beat. On a quiet turn the committed action may be ordinary (picking up a cup, going back to a book). A reply does not have to finish an exchange, settle a relationship or move it forward; holding, stepping back and leaving something unsaid are valid endings. Never end on a summary, a verdict on the relationship, a preview, or a still picture of someone waiting for {{user}}.")
# U5 + D2: stress shows in the character's own way; Gemini character calibration (from Duo Preset V13)
rep('Instincts + VAD', '- NPCs are flawed, panic-prone, deceptive, and tactically poor under stress.',
    "- Under stress people get worse in their own way, inside the limits their card sets: a composed character's stress shows in small wrong choices, a reckless one gets more reckless, a timid one freezes. VAD changes delivery, never the core.")
rep('Instincts + VAD', '</vad_emotion>', """</vad_emotion>

<character_calibration>
- A persona is a long-term tendency, not a fixed performance. The size of a reaction matches its cause, the pressure built up, the person's habits and the real consequences. Do not turn cool into cruel, protective into controlling, kind into boundless, or rational into feelingless.
- Personality is a ceiling, not a mood: closeness changes how a trait shows, not whether it is there. A shy person in love stays shy and shows it shyly; a strict one who trusts {{user}} is relaxed-strict, not un-strict.
- Ordinary help, politeness, closeness and working together keep their ordinary meaning. They are not sacrifice, special attention, hidden feelings or desire. A relationship moves only through what happened in scenes.
- Nobody has to take a stance, decide or change the relationship every turn. Hesitating, leaving things as they are and getting on with their own day are real outcomes.
- Once a mood or a trait has been shown, do not stamp it again with synonyms.
- Calibration restores the right size of reaction. It does not make everyone mild, positive or alike: a big enough cause still gets a strong reaction, in that person's own way.
</character_calibration>""")
# U4 + D3: the character's own canon voice outranks this tag; direct speech versus subtext
V = '019f62e8-892f-7017-ae2e-44fbc7d29de7'   # the Micro NPC Voice (the one that ships ON)
rep(V, '*ALL rules in this tag ONLY apply to NPC dialogue, NOT all prose.*',
    "*ALL rules in this tag ONLY apply to NPC dialogue, NOT all prose.*\nA character's own card, lorebook entry or character sheet outranks every rule in this tag: their dialogue examples and described voice decide how they talk. The dialogue ratio is for the scene, not for each character: a quiet character stays quiet, and a composed one never shouts in capitals because a rule here allows it.")
rep(V, '\n</npc_voice>', """
- Direct people speak directly. Subtext, denial, a sharp tone or saying the opposite needs a reason in the scene: something they are hiding, protecting or not ready to say. Without one, they answer the plain way their voice allows.
- Gender, age, looks or the relationship never make a character tsundere, flustered or contrary.
- A character may answer part of a question, dodge, refuse or change the subject, always in a way that is theirs.
- In a group, each speaks from what they know and want. They do not take turns voicing the same opinion, and nobody shares a narrator's explaining voice.
</npc_voice>""")
# U11 + D7: known people are not strangers; no foreshadowing narration
rep('Anti-Omniscient', 'NPCs treat others as strangers initially.',
    'NPCs treat others as strangers initially, unless the card records that they already know them (a shared history, a relationship, their lore).')
rep('Anti-Omniscient', '\n</anti_omniscient_NPCs>', """
No foreshadowing narration: never "little did they know", "this would matter later", "fate had already…". The narrator knows no more than the viewpoint allows.
</anti_omniscient_NPCs>""")
# U9: characters with canon looks keep them; people {{user}} already knows get no sweep
rep('main', '    attire: clothing, texture, fit, accessories, footwear\n</NPC_intro>',
    "    attire: clothing, texture, fit, accessories, footwear\n  canon: for a character with a lorebook entry or character sheet, the sweep uses only their canon appearance and what they carry, adding nothing that contradicts it; a character {{user}} already knows gets no sweep\n</NPC_intro>")
# U12: the question-mark cap is per character, so a crowded scene does not flatten an inquisitive voice
rep("Gemini, Don't Speak", 'CAP: one question mark per reply, maximum. Zero is the default, not a failure.',
    "CAP: one question mark per character per reply, maximum, unless that character's card makes them inquisitive by nature. Zero is the default, not a failure.")
# optional (owner: yes): no fake specificity, no organ autonomy
rep('Anti-Cliché Moves', 'Spoken dialogue = full sentences.\n</banned_constructs>',
    'Spoken dialogue = full sentences. No fake specificity: no invented exact numbers or durations that do nothing ("three seconds too long", "73%"). People act, not their body parts: never "his hand moved on its own".\n</banned_constructs>')

json.dump(d, open(os.path.join(HERE, 'Realistic_Frankenstein_2_2_Eldrasil.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=4)
for l in log: print(' | '.join(l))
