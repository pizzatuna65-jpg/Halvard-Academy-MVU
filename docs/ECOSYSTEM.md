# Eldrasil ecosystem: card + Realistic Frankenstein 2.2 (Gemini) + VectFox

Card v1.0.2 · preset `Realistic_Frankenstein_2_2_Eldrasil.json` · VectFox (checked at commit 3623dc8) · model Gemini 3.8 Flash.

## Who owns what
| Job | Owner | Not done by |
|---|---|---|
| Game state: time, calendar, vitals, mana, money, bonds, secrets, campus changes, journal, commitments, clues | **Card** (MVU + engine) | preset trackers (all OFF) |
| Prose style, POV, NPC voice and behaviour, anti-slop, reasoning (CoT) | **Preset** | card (since 1.4.6 the card sets no prose style, point of view, tense or length) |
| Long-term memory of past scenes | **VectFox** (EventBase) | preset notebook / Chekhov (OFF); card keeps only the recent Journal |
| Lorebook activation | **SillyTavern** (keywords) | VectFox semantic lorebook (do not use on this card) |
| Status display | **Card** bracelet and panels | preset Internal States HTML (OFF) |

## Preset changes (vs the original 2.2 "Nuts & Bolts")
**Turned OFF: overlapping trackers.** Internal States (master), Relationships RPG, GM's Notebook, Internal Agenda, Chekhov's Gun, World Sim, Fate & Routine, Internal Thoughts.
They keep a second game state in a hidden HTML block that must sit "at the absolute end of every response", which competes with the card's `<UpdateVariable>` block, duplicates Bonds, Campus_State, Journal and Clues, and costs thousands of output tokens per reply.

**Turned OFF / ON for Gemini, following the preset's own notes.**
- OFF: Staccato Chop Killswitch, Anti-Briefing Register, Last-Mile Legato Gate, Last-Mile Register Gate. The preset marks these "keep OFF on Gemini".
- ON: Gemini "Don't Speak Like a Therapist", the new AI Studio jailbreak for Gemini 3.8 Flash, and the "Really Did It" fix for Western models.

**New: 🏫 Eldrasil × MVU × VectFox Bridge** (right after the Main Prompt). It establishes that the card state is the only tracker and that recalled memories are the past. It replaces the disabled trackers with state-free guidance: off-screen lives, setups and payoffs recorded as Clues, Commitments or Journal lines, and the setting has no phones. Since v1.1.0 it also asks for metric units in prose (the card gives °C), and "⏰ Time and Place" is locked OFF: the card computes time and weather itself.

**Edited prompts**
- **Main:** removed the `<think>` wrapper, which the author says is only for Mimo via Crof. Random events are now recorded in the card state.
- **BOLT CoT:**
  - Task 0 reads `<current_state>` and `<now>`, and starts reasoning with `Now: M? W? Day HH:MM at <place>`.
  - Task 2 plans the MVU patch instead of Internal States. Since 1.4.6 it points to the card's own update rules instead of copying them (the old copy taught the 1.0 bond rules).
  - Task 9 puts `<UpdateVariable>` last.
  - Task 11 draws world events from the calendar and happenings instead of Fate rolls.
  - The two Gemini-OFF checks are now conditional.
- **Gemini jailbreak:** genre set to "magic academy, slice of life with a mystery, dark where earned". It also respects the card rule that {{user}}'s power level is the player's choice.
- **Pop in Graphics:** letter, notice and page templates replace phone and terminal. The bracelet and stats are never drawn as graphics.
- **Colored Dialogue 2.0:** never colours inside `<UpdateVariable>`.
- **NPC Instincts:** bond records describe history and never force compliance. This replaces "there is no affection meter", which contradicted the card's bond ranks.

**Length (1.4.6):** "📝 Total Output Length" is ON at roughly 3 to 6 paragraphs. The card used to carry this default; it now lives here so players can change it.

**Regex:** "FF5 Delete / Catch - Untagged Thoughts" are OFF. They serve the Time-and-Place header, which is off, and they delete everything before any line starting with `[... Time`. Tested: a player message ending in `[Time skip: two hours later]` reached the model as only that bracket.
ST runs preset regexes before the card's, so the preset's display regexes cannot touch the bracelet.

**Settings:** web search OFF (no search grounding in roleplay). Temperature 1.0 and top-p 0.95, following Google's Gemini 3 guidance; the original 0.7 and 0.8 were tuned for Mimo. Reasoning medium, thoughts shown.

**Size:** always-on preset prompt ~23.6k → ~14.2k tokens, and no tracker block in every reply.

## VectFox settings for this setup
1. **Text Cleaning (Custom):** untick "Strip <UpdateVariable> Tags (MVU)". Add the 5 patterns from `vectfox_cleaning_patterns.json`, in order. They keep the in-world time, drop the update block and the bracelet placeholder, remove colored-dialogue tags (keeping the words), and unwrap in-story graphics (keeping their text).
2. **EventBase:** ON.
3. **Semantic Lorebook:** do not vectorize the card's lorebook.
4. **Ghosting or the card's trim regex:** use one. With Summarizer Injection + Ghosting, disable the card regex "Eldrasil — State-as-memory".
5. **Summarizer Injection:** optional. If used, set a budget of about 4,000 characters, since the card's Journal already covers turning points.

Bonus: the CoT's first reasoning line (`Now: …`) gives VectFox a second source for the in-world time. VectFox reads a message's stored reasoning for dates and places, when the API returns thoughts.

## If you change things later
- The MAX and Micro CoT variants were not adapted; stay on BOLT or ask for them to be converted.
- DnD Simulator and Inventory/Feats need the Internal States block; leave them OFF with this card.
- Turn the Bridge prompt OFF when you use this preset with other cards.
