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
P[B]['content'] = t[:s] + ("2. State update plan: if <update_format> is present, I list as terse bullets only what this turn changes for the <UpdateVariable> patch: minutes passed and the new time, location, Scene.Present, any HP loss with its named injury (at most 40 unless truly lethal), Stamina, technique uses for /Magic/Casts and effects started or ended, points spent or earned, bond Progress (+0 small talk, +1 meaningful, +2 significant; Rank only when _Event_ready and this turn holds the milestone scene), Known_facts, and any Journal, Commitments, Clues, Letters, Notices or Campus_State entry the scene earns. The engine computes costs, payouts, bands, caps and every \"_\" field; I never do. No other tracker, status or internal-states block exists in this chat.\n\n") + t[e:]
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
json.dump(d, open(os.path.join(HERE, 'Realistic_Frankenstein_2_2_Eldrasil.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=4)
for l in log: print(' | '.join(l))
