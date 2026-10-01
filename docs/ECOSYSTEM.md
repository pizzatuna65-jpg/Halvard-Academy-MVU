# Eldrasil ecosystem: card + Realistic Frankenstein 2.2 (Gemini) + VectFox

Card v1.0.2 (VectFox notes updated through 1.6.0) · preset `Realistic_Frankenstein_2_2_Eldrasil.json` · VectFox (checked at commit 3623dc8) · model Gemini 3.8 Flash.

## Who owns what
| Job | Owner | Not done by |
|---|---|---|
| Game state: time, calendar, vitals, mana, money, bonds, secrets, campus changes, journal, commitments, clues | **Card** (MVU + engine) | preset trackers (all OFF) |
| Prose style, POV, NPC voice and behaviour, anti-slop, reasoning (CoT) | **Preset** | card (since 1.4.6 the card sets no prose style, point of view, tense or length) |
| Long-term memory of past scenes | **VectFox** (EventBase) | preset notebook / Chekhov (OFF); card keeps only the recent Journal |
| Lorebook activation | **SillyTavern** (keywords) | VectFox semantic lorebook (do not use on this card) |
| Status display | **Card** bracelet and panels | preset Internal States HTML (OFF) |

## Preset changes (vs the original 2.2 "Nuts & Bolts")
**Turned OFF: overlapping trackers.** Internal States (master), Relationships RPG, GM's Notebook, Internal Agenda, Chekhov's Gun, World Sim, Fate & Routine.
They keep a second game state in a hidden HTML block that must sit "at the absolute end of every response", which competes with the card's `<UpdateVariable>` block, duplicates Bonds, Campus_State, Journal and Clues, and costs thousands of output tokens per reply.

**Turned OFF / ON for Gemini, following the preset's own notes.**
- OFF: Staccato Chop Killswitch, Anti-Briefing Register, Last-Mile Legato Gate, Last-Mile Register Gate. The preset marks these "keep OFF on Gemini".
- ON: Gemini "Don't Speak Like a Therapist", the new AI Studio jailbreak for Gemini 3.8 Flash, and the "Really Did It" fix for Western models.

**New: 🏫 Eldrasil × MVU × VectFox Bridge** (right after the Main Prompt). It establishes that the card state is the only tracker. It replaces the disabled trackers with state-free guidance: off-screen lives, and setups and payoffs recorded as Clues, Commitments or Journal lines. "⏰ Time and Place" is locked OFF: the card computes time and weather itself. Since 1.11.2 the card says the rest itself (rule 504: recalled memories are the past; World Index: no phones, metric units), so the card works with any preset.

**Back ON (1.37.3, owner): 🧠 Internal Thoughts** as a block of its own, `<npc_thoughts>`, right before `<UpdateVariable>`: up to three NPCs' raw thoughts, never {{user}}'s, never an unrevealed secret. Two preset regexes fold it on screen and drop it from older replies in the prompt; the card draws it in brass; a VectFox pattern keeps it out of memory. Turn it OFF in the preset to hide it.

**Edited prompts**
- **Main:** removed the `<think>` wrapper, which the author says is only for Mimo via Crof. Random events are now recorded in the card state.
- **BOLT CoT:**
  - Task 0 starts reasoning with `Now: M? W? Day HH:MM at <place>`, from campaign Year 2 `Now: Y? M? W? Day HH:MM at <place>` (1.11.2; VectFox reads it), then reads the card's state and, since 1.6.2, the character sheets of the people present.
  - Task 2 plans the MVU patch instead of Internal States. Since 1.4.6 it points to the card's own update rules instead of copying them (the old copy taught the 1.0 bond rules).
  - Task 7 (1.6.2) is a cast check for each character who acts (what they know, what pulls them, what their personality allows, shown versus meant, what they carry), then "the loudest reaction, then how this person usually handles it", a name-swap test, and the slop review.
  - Task 9 puts `<UpdateVariable>` last.
  - Task 10 (Plot Momentum; task 11 before 1.11.2) draws world events only from the sources the card allows (the card lists them; since 1.6.2 the CoT no longer copies the list) and nobody arrives without the time to get there.
  - Since 1.6.2 the CoT names no card field outside the `Now:` line; the Bridge is the one Eldrasil-specific prompt.
  - 1.11.2 (preset audit): no DnD d20 rolls next to the card's Fortune roll, no checks for toggles that stay OFF on Gemini (Staccato, Anti-Briefing, Quant Hardening), and the old task 8 is gone, so the tasks run 0-10.
  - The two Gemini-OFF checks are now conditional.
- **Gemini jailbreak:** genre set to "magic academy, slice of life with a mystery, dark where earned". It also respects the card rule that {{user}}'s power level is the player's choice.
- **Pop in Graphics:** letter, notice and page templates replace phone and terminal. The bracelet and stats are never drawn as graphics.
- **Colored Dialogue 2.0:** never colours inside `<UpdateVariable>`. Since 1.37.0 the card colours dialogue itself (`<say:Name>`), so both preset colour toggles stay OFF; VectFox's cleaning patterns drop the `<say>` tags too.
- **NPC Instincts:** bond records describe history and never force compliance. This replaces "there is no affection meter", which contradicted the card's bond ranks.

**Writing rules (1.5.0, character consistency; generic, they name no card data):**
- **🎮 Player Input Authority (simulation) 📨** (new, ON, depth 0 just before BOLT): the player writes only {{user}}; what the message says about other characters or outcomes is a wish the world answers in character. It also repeats the newest player message (`{{lastUserMessage}}`) so the model knows which text is the input. Turn it OFF to play as a director.
- **🌐 Output language** (new, OFF, after Total Output Length): turn ON and name a language to have the story written in it; OFF follows the card (English).
- Realistic NPCs: no spotlight, no echoes. Scene Engine: simulate, do not dramatise; a quiet turn may end on something ordinary (HOLD). NPC Instincts + VAD: stress shows in the character's own way, plus a `<character_calibration>` block (reaction size, personality is a ceiling, ordinary help keeps its ordinary meaning). NPC Voice: a character's own card outranks the tag (the dialogue ratio is per scene), direct speech versus subtext. Anti-Omniscient: known people are not strangers; no foreshadowing narration. Main `<NPC_intro>`: canon appearance only, no sweep for people {{user}} knows. Anti-Therapist: one question mark per character. Anti-Cliché: no fake specificity, no organ autonomy.

**Card data (1.6.2):** HQ NPC Genesis follows the card's naming guide and its record for invented characters (the card's Extras) when there is one; the Scene Engine treats that record as the invented character's card. The Bridge says the `<cast>` block is the truth about the people present, invented characters keep their Extras card, off-screen people follow their Next plans and the campus phase, and arrivals take the walk time.

**Length (1.4.6):** "📝 Total Output Length" is ON at roughly 4 to 7 paragraphs (3 to 6 before 1.36.0). The card used to carry this default; it now lives here so players can change it.

**RF2.2.1 port (1.36.0):** 🎭 Card Fidelity (ON, depth 0); the Gemini (Cosmos) comparative-emphasis and occupational-monomania killswitches with their gates replace the regular pairs; the Cosmos NPC Voice replaces the Micro voice (a per-line method, no 30-50% ratio); the rebuilt Scene Engine; a banned-vocabulary gate, door sounds and "Looks at a Stranger's Scale" (ON); Pacing (OFF). 🧂 Embellish Mode is ON instead of Anti-parrot (owner): the narrator writes {{user}}'s words and actions from the player's message. Not used: assistant-role CoTs and the smell package (the card's ambience cues name smells).

**Regex:** "FF5 Delete / Catch - Untagged Thoughts" are OFF. They serve the Time-and-Place header, which is off, and they delete everything before any line starting with `[... Time`. Tested: a player message ending in `[Time skip: two hours later]` reached the model as only that bracket.
ST runs preset regexes before the card's, so the preset's display regexes cannot touch the bracelet.

**Settings:** web search OFF (no search grounding in roleplay). Temperature 1.0 and top-p 0.95, following Google's Gemini 3 guidance; the original 0.7 and 0.8 were tuned for Mimo. Reasoning medium, thoughts shown.

**Size:** always-on preset prompt ~23.6k (original) → ~15.9k tokens (1.11.2; it had grown to ~16.9k with the 1.5–1.6 writing rules), and no tracker block in every reply.

**1.11.2 preset audit:** adult lines left in always-on prompts moved to the adult toggles or were removed (adult content is opt-in); the jailbreak no longer names the card's setting or {{user}}'s year, defers to the card's own resolution rule and invents no stakes; duplicate rules merged (Attentional Salience into `<do_not_repeat_descriptions>`, OFF); 18 display regexes that only styled the OFF trackers are disabled. Occupational Monomania and its Vocation Gate stay ON.

## VectFox (chat memory)
Checked against VectFox 3.6.9, commit 3623dc8 (2026-09-21), reading its source; the owner's own settings were re-checked for card 1.11.3. **Compatible**, with one setting to avoid and a few to adjust.

### Works as is
- **No interference with MVU, Tavern Helper or EJS.** VectFox's extraction and planner calls go straight to the backend API, not through SillyTavern's generation, so they trigger no card scripts, lore or MVU parsing.
- **Hidden messages are skipped.** The Student Builder and Settings notes (hidden system messages) are never stored as memories.
- **Swipes are safe.** Auto-sync holds back the latest turn until a newer one supersedes it, so re-rolls leave no stale events, and it reads each message after MVU has finished with it.

### Avoid: Semantic Lorebook on this card's lorebook
Do **not** vectorize the "Eldrasil — Halvard Academy" lorebook for VectFox's Semantic World Info. VectFox injects matched entries' raw text through its own prompt slot, outside SillyTavern's World Info pipeline:
- EJS entries could arrive as template code instead of rendered text (the calendar, the "Now" line, the Cast Sheet).
- In MVU's extra-model mode, the `[mvu_update]` rules would reach the story model, bypassing MVU's filtering.
- Entries already triggered by keywords would be sent twice.

The card's lore is designed around keywords and a few constant entries; let SillyTavern handle it. Use VectFox for **chat memory (EventBase)**.

### Settings
1. **Text Cleaning (Custom): keep the in-world time.** VectFox runs the ticked built-ins first and the custom patterns after them, in list order (`core/text-cleaning.js`), so:
   - untick **Strip <UpdateVariable> Tags (MVU)**: otherwise the block, the only place the in-world date appears in the text, is gone before any custom pattern sees it;
   - delete any older custom pattern that would touch the block first, such as a catch-all "strip every HTML tag" (`<\/?[a-z][^>]*>`), and never replace `
{3,}` with nothing (that glues paragraphs together; VectFox already turns 3+ newlines into one blank line);
   - import `vectfox_cleaning_patterns.json` (Text Cleaning → Import; all seven pass VectFox's import check and are appended in order).

   Each reply is then stored as its prose plus one line such as `[In-world time: Y2 M1 W2 Wed 13:40, at Courtyards]`: the patterns drop the update block and the `<StatusPlaceHolderImpl/>` tag, remove colored-dialogue tags (keeping the words), drop NPC thoughts and unwrap in-story graphics (keeping their text). Since 1.11.3 the time pattern also reads the year (Year 2+), a place written without an arrow ("Courtyards (unchanged)"), time and place on two lines, and "->" arrows; `tests/test_vectfox_v1113.cjs` checks them.
2. **EventBase: ON.** It is the only source of the details of old scenes.
3. **Summarizer Injection: OFF** (since card 1.6.0). The card keeps the story's memory itself: the Journal, each bond's recent and defining moments, and what each character knows and feels about you (Mind, Knows, Imprints, Next). A VectFox summary would repeat it and can contradict it. If you still want it, keep it to about 3,000 characters.
4. **Ghosting or the card's trim regex: use one.** Ghosting works only while Summarizer Injection is ON too (`core/summarizer-injection.js`); with Summarizer Injection OFF (recommended) the Ghosting switch does nothing, and the card's regex "Eldrasil — State-as-memory: trim far chat (prompt)" does the trimming. With Summarizer Injection + Ghosting on, disable that card regex (Ghosting only removes messages already stored in memory; the card's regex trims by depth regardless).
5. **Injection position:** keep **After Main Prompt**, or **In-Chat @ Depth** 2 or more, never 0–1 (EventBase and the summary share the settings `position` and `depth`, used by `core/eventbase-workflow.js`). The card puts the Cast Sheet at depth 1 and the cast gate at depth 0 so canon is the last thing the model reads; recalled prose at depth 0 or 1 would sit closer than canon and bring back drift.

6. **Retrieval size and cost:** EventBase retrieval top-k defaults to 10 events a turn; each event costs prompt tokens every turn, so keep it near 10–15. Agentic retrieval (off by default) adds a planner LLM call and up to its maximum queries per turn through the chat provider: more recall, more cost and delay.
7. **One chat, one collection.** A collection locked to one chat should not also be listed for another (an older copy of the chat): opening that one mixes its events in.

Bonus: the CoT's first reasoning line (`Now: …`) gives VectFox a second source for the in-world time; VectFox reads a message's stored reasoning for dates and places when the API returns thoughts.

### Good to know
- Deleting or editing an older message does not remove events already extracted from it; re-vectorize the chat if you rewrite history. The card's variables are unaffected either way.
- VectFox builds its semantic query from the raw recent messages; the keyword query uses your own last message. Anchoring your message with story words ("the scorched ledger", "Irene's warning") helps recall.
- The card tells the narrator that recalled memories are the past and `<current_state>` is now, so a recalled "300 points" never overrides the current wallet. Rule 504 adds that a memory tells what happened, not who knows it, and that a character's Cast Sheet outranks a memory's description of them.
- Mind, Knows, Next and Extras sit inside `<UpdateVariable>`, which the cleaning patterns drop, so NPCs' thoughts and secrets never enter VectFox memory. If recall gets worse as the update block grows, the long fields can move to the end of the patch.

## If you change things later
- The MAX and Micro CoT variants were not adapted; stay on BOLT or ask for them to be converted.
- DnD Simulator and Inventory/Feats need the Internal States block; leave them OFF with this card.
- Turn the Bridge prompt OFF when you use this preset with other cards.
