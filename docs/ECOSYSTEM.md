# Eldrasil ecosystem: card + Realistic Frankenstein 2.2.1.3 (Gemini) + VectFox or Summaryception

Card v1.68.0 (VectFox section rewritten for 1.57.0, preset section for 1.68.0, Summaryception section for 1.99.1) · preset `Realistic_Frankenstein_2_2_1_3_Eldrasil.json` · VectFox (checked at commit 3623dc8) · Summaryception 5.5.4 · model Gemini 3.8 Flash.

## Who owns what
| Job | Owner | Not done by |
|---|---|---|
| Game state: time, calendar, vitals, mana, money, bonds, secrets, campus changes, journal, commitments, clues | **Card** (MVU + engine) | preset trackers (all OFF) |
| Prose style, POV, NPC voice and behaviour, anti-slop, reasoning (CoT) | **Preset** | card (since 1.4.6 the card sets no prose style, point of view, tense or length) |
| Details of past scenes | **VectFox** (EventBase) or **Summaryception** (one per chat) | preset notebook / Chekhov (OFF) |
| Hard facts (who, bonds, who knows what, promises, items) and the story's spine (Journal) | **Card** state, shown by condition | VectFox (recall depends on the latest messages) |
| Lorebook activation | **SillyTavern** (keywords) | VectFox semantic lorebook (do not use on this card) |
| Status display | **Card** bracelet and panels | preset Internal States HTML (OFF) |

## The preset (1.68.0: the Eldrasil edition of RF 2.2.1.3)

**Base.** `presets/edit_preset.py` loads `presets/original/Realistic_Frankenstein_2_2_1_3_Realistic_Gemini_BOLT.json`, the creator's
tuned configuration for Gemini 3.8 Flash, and keeps it as it ships: every prompt's text, the prompt order, roles, depths, triggers, the
toggles, settings (reasoning medium; Gemini 3.8 ignores temperature and top-p, per Google's model guide) and the 59 regexes. Only the list below differs. The full audit behind
it (every prompt, how RF works, why the old edit felt different) is `audit/AUDIT_2026-10-14_1_preset_RF2213.md`. Before 1.68.0 the edit
sat on RF 2.2 with a partial RF 2.2.1 port and about ninety text replacements (in git: `git show 4a811c0:presets/edit_preset.py`).

**How RF works, in short** (verified in SillyTavern's `openai.js` and `PromptManager.js`):
- The Main Prompt empties about 38 variables every turn; toggles below it fill them and the modules further down paste them in. With
  Smell & Taste Rules OFF (Gemini), no prompt mentions smell except the Scent Killswitch and its gate: for Gemini a sentence that forbids
  a smell still works as a reminder. Cinematic Realism tells Gemini "seen, felt, touched".
- Model-specific editions share one XML tag, so the CoTs and the gates reach whichever edition is ON. Gemini runs the Cosmos editions.
- Each stubborn pattern has a killswitch in the system prompt and a short "Last-Mile" gate at depth 0, after the chat history.
- At depth 0 SillyTavern sends one message per role, assistant first, then user, then system. BOLT is assistant-role, so the model reads
  the plan as its own; the depth-0 system gates, Card Fidelity and the card's entry 510 follow it, and the Post-History Instructions
  (relative, under Chat History) come last.
- Prompts that shape the narrator's reply skip Impersonate (their trigger list); the Impersonation Turn and seven regexes take over then.

**What differs from RF, and why**
- OFF because the card keeps the only game state (DECISIONS §10): Fate & Routine, Internal Agenda, GM's Notebook, Relationships RPG,
  World Sim, Chekhov's Gun, Internal States, and Turn Dice (it prints their dice). Their hidden tracker block would duplicate and
  contradict the card's state, and rule 504 forbids another tracker.
- OFF because the card keeps the clock and the weather: Time and Place, with its two "FF5 Delete / Catch - Untagged Thoughts" regexes,
  which delete everything before any line starting with `[... Time` (tested: a player message ending in `[Time skip: two hours later]`
  reached the model as only that bracket).
- OFF because the card colours dialogue itself (`<say:Name>`, 1.37.0): Colored Dialogue 2.0. Two colour formats in one reply would fight.
- OFF as its own note says for Gemini: the Staccato Chop Killswitch ("MUST stay OFF on Gemini"; the configuration ships it ON while its
  Legato gate is OFF; the owner's preset library calls it a configuration slip and reports chop bans flattening Gemini's prose).
- Ordinary Turns (below) leaves out step 7's "dialogue share 60-75 percent", which contradicts BOLT's 30-50 percent.
- 🧠 Internal Thoughts (owner, 1.37.3) writes its own `<npc_thoughts>` block before the card's update block (upstream's version only
  fills a section of Internal States). Three regexes: fold it on screen, drop it from replies at depth 3+, and (OFF) drop it from every
  reply. A VectFox pattern keeps it out of memory.
- Three sentences no longer ask for an Internal States block: the Main Prompt's random events (the card's state records them), the
  Post-History Instructions (its "ensure internal states" clause is gone), and Plot Momentum in every CoT (with no fate engine a turn is
  AMBIENT unless one of the card's sources of world events falls due).
- Pointer fixes: the CoTs name `<comparative_emphasis_killswitch>` (upstream still wrote the retired `<say_it_straight>`), Realism Mode
  names the Gemini edition's `<abolish_yesman_behaviour>`, the instinct list says [8].
- Where upstream and the card give two rules for one thing, the card's rule wins (1.99.3, D12–D17; each line is worded for any card
  and does nothing when the card is silent): a name, title or place name the card writes is not banned vocabulary (the Cosmos ban
  list and its last-mile gate: "Vice Headmaster", "Velvet Lanes"); the card's first-appearance rule replaces `<NPC_intro>`'s
  head-to-toe sweep; random events and Pacing's WEAVE interruptions come only from the sources the card lists (no "incoming calls");
  HQ NPC Genesis takes the name and traits the card gives (`<now>`'s next new character) and draws only the rest; Card Fidelity lets a
  quirk surface when the moment calls on it, as Scene Engine says, instead of bringing it back in the next reply.
- The owner's toggles: 🧂 Embellish Mode instead of Anti-parrot (the narrator writes {{user}}'s words and actions from what the player
  wrote; 1.99.3, owner: without its rule 2, so a reply no longer always opens with {{user}}) and 📝 Total Output Length ON at roughly
  4 to 7 paragraphs (upstream ships it OFF).
- Added, generic (they name no card data): 🎮 Player Input Authority (the player writes only {{user}}; what the message says about others
  or outcomes is a wish; it repeats `{{lastUserMessage}}` and names the engine's "(scene: …)" marker in it as game data; assistant role at depth 0 right above BOLT, so ST joins the two into one
  message; OFF = director play); 🌐 Output language (OFF); 🎲 Ordinary Turns (Fate & Routine's steps 0, 7 and 7a without the tracker:
  quiet turns run on needs and the clock, one thing changes, NPCs may decline the bait, the aftermath of a happening).
- The README prompt (never sent) carries the same list.

**Kept from RF that the old edit had changed or turned off:** the Scene Detail & Evidence lines (a place described through what someone
touches or uses; how NPCs can know things), Pacing Cosmos (Gemini's per-reply motor), Attentional Salience, the Cosmos banned list at depth 0, Realism Mode and the
NSFW register (active only in an NSFW scene), Pop in Graphics, the long Cosmos gates, the full BOLT (rule lists and dialogue examples in
the reasoning), the per-reply question cap, and the 18 display regexes of Internal States (harmless without the block).

**Regexes:** when SillyTavern asks whether the preset's regexes may run, answer yes, and check Extensions → Regex after switching
presets: preset regexes have been reported to switch off on a preset change (the NPC Thoughts fold and trims depend on them).

**Card side (1.68.0):** no ambience cue or beat names a smell any more (`data/ambience.json`; RF's Scent Killswitch allows smells only
for food at a meal, a strong source close by or a rite), and rule 504 says that someone {{user}} already knows is not introduced again.

**Size:** about 18,200 tokens a normal turn as SillyTavern sends them (5,350 at depth 0), against 15,450 for the old edit and about 30,300
for RF as shipped with its trackers; `test_preset` keeps a budget of 18,600. The part above the chat history stays the same from turn to
turn, so providers can cache it. Reasoning is longer than before (BOLT lists the prose rules and writes dialogue examples).

## VectFox (chat memory)

Everything below was checked against VectFox's source at commit 3623dc8 (github.com/KritBlade/VectFox, the GitHub HEAD on
2026-10-04; v3.6.9) and against the owner's own EventBase export (`vectfox_charles_halvard_fixed.json`, 46 events, from before the card
used MVU). It is meant to be complete: a session should not need the repository or an export to understand what VectFox does here.
File names in brackets are VectFox's.

### What VectFox is, and what it does on this card
- **A SillyTavern extension for long-term chat memory.** It stores what happened in a chat in a vector database and, before each
  generation, injects the stored items most related to the current scene. It has several modes (chat chunks, documents, a semantic
  lorebook, a lorebook "reformat"). This card uses one: **EventBase**, memory of the chat as events.
- **Its job here: recalling the details of old scenes** (who said what, what happened, why) once the chat itself has scrolled out
  of the narrator's context (the card's trim regex keeps the latest ~24 messages).
- **What it is not good at, by design:**
  - recall is triggered by similarity to the latest messages, so a fact that matters but is not being talked about may not come back;
  - each extraction call sees only its own window of messages, so it cannot judge what matters to the whole campaign, and cannot
    tell whether an open matter was already opened or closed earlier;
  - its summarizer (off here) compresses again and again, so hard facts wear away in it.
- **So the work is split:**

| What | Kept by | Reaches the narrator |
|---|---|---|
| Hard facts: who people are, bonds, who knows what, promises with a date, items, money, memberships, campus changes | The card's state (MVU + engine) | Always, or by condition (a sheet while someone is present, a rule card when its topic applies) |
| The story's spine: turning points, matters still open, first visits, the Entrance tour, off-screen events | The Journal (30 lines) | Every turn |
| Canon: places, people, history, rules | The lorebook | By keyword, or by the engine for people present |
| Details of old scenes | **VectFox EventBase** | The ~10 events most related to the current scene |

### How EventBase works
1. **Text cleaning** [`core/text-cleaning.js`]: each message is cleaned before extraction. The ticked built-in rules run first, then
   the custom patterns in list order.
2. **Windows** [`core/eventbase-workflow.js`]: auto-sync takes the chat in windows of N turns (1 turn = the player's message and the
   reply, `eventbase_autosync_window_turns`). It holds back the latest turn until a newer one replaces it (`eventbase_autosync_settle_lag`),
   so swipes leave nothing stale. Hidden (system) messages are skipped. A manual "Vectorize" uses its own window size in messages
   (`eventbase_window_size`) and an optional overlap.
3. **Extraction** [`core/eventbase-extractor.js`]: one LLM call per window, through VectFox's own provider settings (`chat_provider`,
   `chat_model`). The call goes straight to the API, not through SillyTavern's generation, so no card script, lore or MVU parsing
   runs for it. The prompt is the custom **Extraction Prompt** (`eventbase_custom_prompt`), or VectFox's default when it is empty.
   VectFox fills only `{{text}}` (the excerpt) and `{{maxCount}}` (`eventbase_max_events_per_window`) [`buildExtractionPrompt`]; SillyTavern
   macros such as `{{user}}` are not filled. It prepends a detected-language line. The excerpt is "Speaker: text" per message, and a
   message's stored reasoning, when the API returned any, is added as a block marked "CONTEXT ONLY" (dates and places, never events).
4. **Validation** [`core/eventbase-schema.js`]: an unknown `event_type` becomes `other`; `importance` is clamped to 1-10 (5 if missing);
   `should_persist` is true only when the model wrote exactly `true`; concepts are merged into keywords. Events below
   `eventbase_min_importance_store` (default 3) are dropped before storing.
5. **Storage** [`core/eventbase-store.js`]: each event is embedded as this text [`buildEmbedText`] and stored (Qdrant here) with its
   fields as metadata:
   ```
   [promise_or_oath] Trixie raced Charles through the rain to the Fire Wing porch and won. Charles owes her glazed sugar braids …
   SCENE_TIME: M1 W1 Mon 13:05
   CAUSE: Trixie challenged Charles to a race to the dorm, loser buys breakfast.
   RESULT: Charles owes Trixie pastries.
   CHARS: Charles, Trixie
   LOCS: Main Courtyard, Fire Wing
   ITEMS: glazed sugar braids
   KEYS: race, bet, rain, pastries, sugar braids, Mall bakery, breakfast, porch
   THREADS: Charles owes Trixie glazed sugar braids, agreed M1 W1 Mon
   ```
   Factions are kept as metadata but left out of the embedded text. Other metadata: `importance`, `should_persist`, `concepts`,
   `source_window_start` / `end` (message indexes), `timeline_sort_key`, `event_id`, `chat_uuid`.
6. **Retrieval** [`core/eventbase-retrieval.js`], before each generation:
   - the search text is the raw text of the last `query` messages (default 2: the player's message and the last reply, update block
     included); the keyword query is the player's last message;
   - hybrid search: vector similarity plus keyword (BM25) matching;
   - events under `eventbase_retrieval_min_importance` are dropped;
   - each event is re-ranked: 0.55 similarity + 0.20 importance/10 + 0.15 if `should_persist` + 0.10 recency (half-life 20% of the
     chat's length, at least 40 messages), plus `eventbase_anchor_boost` (0.20) when one of its keywords appears in the player's message;
   - near-duplicates closer than `eventbase_dedup_window_gap` messages (default 10) are dropped; events from the last
     `deduplication_depth` messages ("Skip Already-Visible Events") are dropped because the chat still shows them;
   - the best `eventbase_retrieval_top_k` (default 10) are kept.
7. **Injection** [`core/eventbase-injection.js`]: the events are written in one of three formats (`eventbase_injection_format`):
   *DenseText* (every field, keywords included), *JSONArray*, or *Summary Only* (summary and time). An optional `rag_context` line
   comes first, the whole is wrapped in `<VectFoxMemory>` (`rag_xml_tag`) and placed by `position` / `depth`.

### What VectFox's default prompt did on this card
From the owner's export (46 events over messages 0-145, all on M1 W1 Mon), with VectFox's default extraction prompt:
- one event for almost every window, whatever happened in it: 16 of 46 (35%) were `travel` or `location_change` ("walked to …");
- importance mostly 4-5 (a walk scored 4, Etnie declaring herself {{user}}'s "big sister" scored 5; only two events reached 7-8), and
  every event `should_persist: true`, so the importance and persist parts of the ranking separated almost nothing;
- 39 open threads, each written once and never carried or closed, mostly speculative ("Will the rain mentioned by Zara arrive
  soon?"); the one real debt (pastries owed to Trixie) was stored twice, with different terms, because the race fell across two windows;
- about 930 characters (~250 tokens) per event, so ten recalled events cost ~2,500 tokens a turn in DenseText.

The card's extraction prompt below addresses each of these.

### Settings
Settings keys are in brackets, for searching the VectFox panel or its settings file.

| Setting | VectFox default | For this card | Why |
|---|---|---|---|
| EventBase | – | **ON** | The only source of the details of old scenes |
| Extraction Prompt (`eventbase_custom_prompt`) | empty (VectFox's own) | **the card's prompt** (below; also `dist/vectfox_eventbase_prompt.txt`) | Built for this card. VectFox's reset button brings its own prompt back: after a VectFox update that asks you to reset, paste the card's again |
| Extraction model (`chat_model`) | – | the owner's choice | The prompt is long and asks for strict JSON: use a model that follows it (the owner found Gemini 3.1 Flash Lite accurate; Gemini 3.5+ needs a current VectFox). Check with the debug query below |
| Don't think during extraction (`should_disable_thinking`) | ON | ON | Extraction needs no reasoning; cheaper and faster |
| Extraction temperature (`eventbase_temperature`) | 0.2 | 0.2 | |
| Minimum importance to store (`eventbase_min_importance_store`) | 3 | **3** | The card's prompt scores routine 1-2, so it is never stored |
| Events per window (`eventbase_max_events_per_window`) | 3 | 3 | Few events that hold every key point recall best |
| Auto-sync window (`eventbase_autosync_window_turns`) | 1 turn | **2 turns** | A moment split across two windows is stored twice less often, and extraction costs about half; the card's replies are long, so 2 turns is still a small window |
| Vectorize window (`eventbase_window_size`) | 2 messages | **4 messages** when re-vectorizing | The same span as auto-sync |
| Window overlap (`eventbase_window_overlap`) | 0 | 0 | Overlap stores more duplicates |
| Settle lag (`eventbase_autosync_settle_lag`) | ON | ON | Swipes leave no stale events |
| Retrieval top-k (`eventbase_retrieval_top_k`) | 10 | 10 | With routine gone, 10 holds what matters. 1.66.0: raise it to 12-15 only if the debug query shows the right event at places 11-15 |
| Duplicate window (`eventbase_dedup_window_gap`) | 10 | **40** (1.66.0) | A large collection holds the same kind of scene with the same people many times; a wider window keeps them from filling the top-k |
| Minimum importance to recall (`eventbase_retrieval_min_importance`) | 1 | 1 | Everything stored is already 3+ |
| Skip Already-Visible Events (`deduplication_depth`) | 0 | **20** | The card keeps the latest ~24 messages in the chat; recalling them again only costs tokens |
| Query messages (`query`) | 2 | 2 | The player's message (with the card's scene marker, 1.66.0) and the last reply. Try **1** with the debug query: the search is then only your message and the marker (who is here, the place), clean of the update block, at the price of the last reply's prose |
| Injection format (`eventbase_injection_format`) | DenseText | **Summary Only** | DenseText also sends 8-15 keywords per event; the card's summaries already say who, why and what changed |
| Injection position / depth (`position`, `depth`) | in prompt, 2 | **After Main Prompt**, or **In-Chat @ Depth** 2 or more, never 0-1 | The card puts the Cast Sheet at depth 1 and the cast gate at depth 0 so canon is read last; recalled memory there would sit closer than canon and bring back drift |
| Re-rank weights (`eventbase_rerank_w_*`) | 0.55 / 0.20 / 0.15 / 0.10 | unchanged | With the card's prompt, importance and persist finally mean something |
| RAG context line (`rag_context`) | empty | optional: "Past events recalled from chat memory: the past, not now." | Backs up rule 504 (below) |
| Summarizer Injection (`summarizer_injection_enabled`) | OFF | **OFF** | The card keeps the summary itself (Journal, bonds, Knows); a VectFox summary repeats it, can contradict it, and wears hard facts away by compressing again and again. If you still want it, keep it to about 3,000 characters |
| Ghosting (`eventbase_ghost_enabled`) | OFF | **OFF** | Ghosting works only with Summarizer Injection ON [`core/summarizer-injection.js`]; the card's regex "Eldrasil — State-as-memory: trim far chat (prompt)" does the trimming. If you ever turn on both Summarizer Injection and Ghosting, disable that card regex |
| Semantic World Info (`enabled_world_info`) | OFF | **OFF** | See "Avoid" below |
| Agentic retrieval (`agentic_retrieval_enabled`) | OFF | OFF | A planner LLM call and up to six searches per turn; turn it on only if the debug query shows recall missing (1.66.0: worth a trial past about 2,000 events) |
| Embedding model and backend | – | keep yours (the owner's export: `qwen/qwen3-embedding-8b` through OpenRouter, Qdrant) | Changing the embedding model means re-vectorizing the chat |
| Collections | – | one chat, one collection | A collection locked to one chat must not also be listed for another (an older copy of the chat): opening that one mixes its events in |

**Setting it up:** update VectFox → paste the card's prompt into EventBase → Extraction Prompt → set the table above → import the text
cleaning patterns (below) → re-vectorize the chat → test with Action → debug query: type what you would write next in the story and
"Run All Pipelines"; the event that matters most should come back with the highest score (F12 console shows the scores).

**Where each setting is** (VectFox 3623dc8, `ui/ui-manager.js`): SillyTavern's Extensions panel → the drawer **"VectFox - Advanced
RAG"**, whose tabs are Action, Core, EventBase, ChunkBase, AutoSync, WorldInfo, RAG and AgentMode. The panel's labels differ from the
keys:
- **Action:** Vectorize Content (re-vectorize; its dialog holds **Window Size** and Parallel Windows), Debug Query, **Text Cleaning**
  (the pattern manager with Import).
- **Core:** Turn off model thinking; Retrieval: **Query Depth** (`query`), **Injection Position** / Injection Depth, **Skip
  Already-Visible Events** (`deduplication_depth`), **Dedup Window Gap** (`eventbase_dedup_window_gap`).
- **EventBase:** the extraction prompt, Min Importance to Store, Retrieve Top-K, **Injection Format** (Summary Only).
- **AutoSync:** Auto-sync window, **Summarizer Injection**, **Ghost vectorized messages**.
- **WorldInfo:** Semantic World Info. **RAG:** Global Context Prompt (`rag_context`). **AgentMode:** Enable AgentMode.

### Text cleaning
VectFox runs the ticked built-ins first and the custom patterns after them, in list order, so:
- untick **Strip <UpdateVariable> Tags (MVU)**: otherwise the update block, the only place the in-world date appears in the text,
  is gone before the card's patterns see it;
- delete any older custom pattern that would touch the block first, such as a catch-all "strip every HTML tag" (`<\/?[a-z][^>]*>`),
  and never replace `\n{3,}` with nothing (that glues paragraphs together; VectFox already turns 3+ newlines into one blank line);
- import `dist/vectfox_cleaning_patterns.json` (Text Cleaning → Import; all ten pass VectFox's import check and are appended in order).
  After a card update that changes the file, delete the card's old "Eldrasil:" patterns first, then import it again.

Each reply then reaches extraction as its prose plus one line such as `[In-world time: Y2 M1 W2 Wed 13:40, at Courtyards]`, which the
card's prompt reads into `scene_time`, and, when the narrator wrote a Journal line in that reply, a line `[Turning point: …]`. The
patterns:
0. (1.66.0) turn the card's scene marker at the end of each player message, `(scene: Irene, Kaito · Courtyards · t2)`, into a line
   `[Timeline: t2]`; the card's prompt adds the timeline number to `scene_time` ("Y1 M3 W2 Mon 13:40 t2");
1. (1.61.0) copy the Journal line the narrator wrote in the update block (`/Journal/-`) into a `[Turning point: …]` line before the
   block; the card's prompt stores it as one event of importance 6+ that persists, so VectFox's idea of what matters follows the
   story's spine;
2. turn the update block's `<Analysis>` Time line into the time line (the year from Year 2, a place written without an arrow, time and
   place on two lines, "->" arrows; this is why 503 keeps the full date in the Time line);
3. (1.61.0) give a Year 1 date its year (`Y1 M1 W2 …`): the narrator writes the year only from Year 2, and a stored event cannot be
   changed later, so without it every Year 1 date would be ambiguous once Year 2 starts (504 reads a recalled date without a year
   as Year 1, for events stored before 1.61.0);
4. drop any update block left;
5. drop the `<StatusPlaceHolderImpl/>` tag;
6. drop the card's dialogue-colour tags (`<say:Name>`), keeping the words;
7. drop the preset's Colored Dialogue tags, keeping the words;
8. drop NPC thoughts (`<npc_thoughts>`, the preset's Internal Thoughts);
9. unwrap in-story graphics (Pop in Graphics), keeping their text.

**The scene marker and the timeline (1.66.0).** VectFox searches with the raw text of the last messages, update block included, and
its keyword query is your last message (DECISIONS §11). So when you send a message the card appends one short line to it: who is
here, the place and the timeline number. You do not see it (a display regex hides it) and the narrator does not (a prompt regex drops
it); VectFox's search and keyword boost do, so recall leans toward the people and the place of the scene. The timeline number grows
when you delete messages and write on from an earlier point (a rollback or a branch); `<now>` then tells the narrator that recalled
memories of the old timeline from that point on never happened, so a rewound scene stops coming back as memory. Editing an old
message is not caught: clean those events by hand (Good to know, below).

So Mind, Knows, Next and Extras (inside the update block) and NPC thoughts never enter VectFox memory. `tests/test_vectfox_v1113.cjs`
checks the patterns. Since 1.68.0 the preset's CoT is upstream's and names no card block, so the update block's Time line is the date's only source in
the text (the model's own reasoning, when the API returns it, may still mention the clock).

### The card's extraction prompt
Paste this whole block into VectFox → EventBase → Extraction Prompt (the same text is in `dist/vectfox_eventbase_prompt.txt`;
`tests/test_narrator_batch6_v1570.cjs` checks that both are the same and that the prompt keeps VectFox's schema, event types and
placeholders).

````text
You are the event archivist for "Eldrasil — Halvard Academy", a long slice-of-life roleplay at a magic academy where the player's character is a student. Extract the story events from the excerpt below that will still matter later in the campaign.

=========================
WHAT THIS ARCHIVE IS FOR
=========================
The card already keeps, outside this archive: the clock and the place, money and purchases, ranks, XP and other numbers, each character's bond with the player's character, the timetable and classes, the weather, dated promises (the Planner) and a short Journal of the story's turning points.
This archive holds what those do not: the DETAILS of what happened between people and in the world, so a later scene can recall them. Store what was said, done, learned, revealed, promised or changed, and why.

=========================
ABSOLUTE RULES (DO NOT BREAK)
=========================
1. LANGUAGE: every string field is in English. Proper nouns keep their exact form from the excerpt; never translate or respell names.

2. EVENT COUNT: at most {{maxCount}} events. Return only events that actually happened; never invent, never pad, never record the same event twice under different wording.

3. WHAT TO EXTRACT:
   Extract when the excerpt changes what someone knows, feels, owes, plans or believes, or shows the world:
   - a real conversation that reveals something about a character (a fear, a goal, a past, an opinion, a secret);
   - a relationship moving (closer, colder, a quarrel, an apology, a rivalry, a romance);
   - a promise, a debt, a bet, a threat or a favour asked or agreed, with its concrete terms (who, what, when);
   - lore or world information learned (places, history, magic, rules, who runs what);
   - a discovery or clue about a hidden truth;
   - a fight, an injury, a punishment, a success or failure that has consequences;
   - a character met for the first time (who they are, how they came across).
   Return [] when the excerpt holds only routine: walking between places, buying or eating ordinary food, an ordinary class period, small talk that reveals nothing, the weather, or an out-of-character note. A meeting that repeats with the same people (the weekly study session, the usual lunch table) is routine too, unless something new is said, learned or changed in it.

   SEXUAL / INTIMATE SCENES: never extract the encounter itself. Extract only a consequence that would still stand without the scene (a promise, a confession, a revelation, a stated change in the relationship); otherwise return [].

4. LINES THAT ARE NOT STORY:
   - A line "[In-world time: <date>, at <place>]" is the card's clock. Copy its date and time into scene_time exactly as written (the date starts with the campaign year, Y1, Y2 or Y3), and its place into locations. It is never an event.
   - A line "[Timeline: tN]" is the story's timeline number (the story was rewound and replayed when it grows). Add " tN" at the end of the scene_time of every event in the excerpt (e.g. "Y1 M3 W2 Mon 13:40 t2"). It is never an event.
   - A line "[Turning point: <text>]" is the narrator's own note that the excerpt holds a turning point of the story. Extract that turning point as one event, importance 6 or more and should_persist true, with its details from the story text; never record it twice. The player's character appears in that line as a placeholder in double braces: use their name from the story text instead.
   - A block marked "[REASONING — CONTEXT ONLY, for date/time/location; NOT a source of events]" is the author's private planning. Use it only for scene_time and locations when the story text does not give them. Never extract an event from it, never copy its text, and treat anything found only there as not having happened.
   - The speaker label of the narrator's messages is the card's name, not a character: never list "Eldrasil" or "Halvard Academy" in characters.
   - Numbers from the game (points, ranks, XP, HP, Trust, Tension) are not events; never put them in summary, cause or result.

=========================
OUTPUT SCHEMA
=========================
Return ONLY a valid JSON array. No prose, no markdown, no code fences.

Each event object has these fields:
- event_type: one of [main_quest_update, side_quest_update, combat, travel, discovery, dialogue_significant, relationship_change, character_introduction, character_state_change, item_acquired, item_lost, faction_change, location_change, revelation, promise_or_oath, betrayal, death, other]
- importance: integer 1-10, judged against the WHOLE campaign (school years), not this scene. Most events are 3-6; reserve 7+ for what will still shape the story weeks later.
    travel / location_change: 1-2 (moving about; usually do not extract at all), 3-4 (arriving somewhere that opens new story: the Expedition forest, Avalon, Sunreach Bay, a sealed or forbidden place)
    dialogue_significant: 3-4 (a character opens up a little), 5-6 (a real confession, confrontation or defining talk)
    relationship_change: 4-6 (a step closer or colder, a quarrel, an apology), 7-9 (a lasting turn: a sworn rival, a romance, a friendship broken or sealed)
    character_introduction: 3-4 (a new person met), 5-6 (someone central to a mystery or to the player's character's life)
    promise_or_oath / side_quest_update: 3-5 (a bet, a favour, a small promise), 6-8 (an oath or a promise with serious stakes)
    discovery / revelation: 3-5 (lore or a small clue), 6-8 (a hidden truth about a character, the academy, the seal or forbidden magic), 9-10 (a truth that reframes the story)
    character_state_change: 3-5 (an injury, a punishment, a new club, a dorm or role assignment), 6-8 (a lasting change: a pact, magic exposed, an expulsion)
    combat: 2-4 (a spar or a minor fight), 5-7 (a fight with real consequences or a named rival), 8-10 (a life-changing fight)
    faction_change: 5-8 (standing with the staff, the students, the Council or the Doves visibly shifts)
    item_acquired / item_lost: 1-2 (ordinary), 4-6 (a unique gift, a keepsake, a plot-relevant object)
    betrayal: 6-10; death: 6-10; main_quest_update: 5-10; other: 1-5.
- should_persist: false for anything that leaves no lasting trace (moving about, a passing joke, a routine moment); true otherwise.
- summary: 2-4 sentences: WHO did WHAT, the key detail (exact terms, names, places), why, and what changed. Write it so it makes sense on its own months later.
- cause: why it happened (may be "").
- result: what is different now (may be "").
- characters: the names as the text writes them (no titles added; never the card's name).
- locations: place names as written, including the "at <place>" of the clock line.
- factions: dorms, clubs, the Student Council, the Doves and other groups involved.
- DateTime: null (the academy calendar is not a real calendar).
- scene_time: the clock line's date and time verbatim, then the timeline number when the excerpt has one (e.g. "Y1 M1 W2 Wed 13:40 t1", "Y2 M3 W1 Mon 09:10 t2"); "" if there is no clock line.
- items: objects that matter to the event.
- concepts: 1-3 abstract themes the event is about (trust, rivalry, belonging, secrecy, duty, the cost of power). Never a name, a place, an object or an action.
- keywords: 6-10 distinctive search terms a later scene might use (rare nouns, names of things, key actions). No generic filler.
- open_threads: only matters stated in the excerpt that remain open: a promise or debt with its terms ("Charles owes Trixie glazed sugar braids, agreed Y1 M1 W1 Mon"), a question a character asked and left unanswered, a threat, a planned meeting. Never speculative "Will X ...?" questions about how things might turn out. [] when there are none.

=========================
VALID OUTPUT EXAMPLES
=========================
Routine only (walking to the Canteen and ordering lunch):
[]

One event:
[{"event_type":"promise_or_oath","importance":4,"summary":"Trixie raced Charles through the rain to the Fire Wing porch and won. By the bet they made, Charles owes her glazed sugar braids from the Mall bakery tomorrow morning; she insists the deal is binding.","cause":"Trixie challenged Charles to a race to the dorm, loser buys breakfast.","result":"Charles owes Trixie pastries.","characters":["Charles","Trixie"],"locations":["Main Courtyard","Fire Wing"],"factions":["Fire Dormitory"],"DateTime":null,"scene_time":"Y1 M1 W1 Mon 13:05","items":["glazed sugar braids"],"concepts":["rivalry","play"],"keywords":["race","bet","rain","pastries","sugar braids","Mall bakery","breakfast","porch"],"open_threads":["Charles owes Trixie glazed sugar braids, agreed Y1 M1 W1 Mon"],"should_persist":true}]

=========================
EXCERPT
=========================
{{text}}

=========================
Return ONLY the JSON array now. Begin your reply with [ and end it with ].
````

### Works as is
- **No interference with MVU, Tavern Helper or EJS**: extraction and planner calls go straight to the API.
- **Hidden messages are skipped**: the Student Builder and Settings notes (hidden system messages) are never stored.
- **Swipes are safe**: auto-sync holds back the latest turn, and it reads each message after MVU has finished with it.

### Avoid: Semantic Lorebook on this card's lorebook
Do **not** vectorize the "Eldrasil — Halvard Academy" lorebook for VectFox's Semantic World Info. VectFox injects matched entries' raw
text through its own prompt slot, outside SillyTavern's World Info pipeline:
- EJS entries could arrive as template code instead of rendered text (the calendar, the "Now" line, the Cast Sheet);
- in MVU's extra-model mode, the `[mvu_update]` rules would reach the story model, bypassing MVU's filtering;
- entries already triggered by keywords would be sent twice.

### Good to know
- **The update model sees recalled memory too.** In MVU's extra-model mode the update request is built by Tavern Helper, which
  adds VectFox's `<VectFoxMemory>` block whatever its injection position (DECISIONS §11). The card's 503 tells the update model
  that block is the past (1.67.2). A large Retrieve Top-K makes that block, and the update request, bigger: keep it at 10.
- **Rewriting history leaves "ghost memories".** VectFox never removes an event when the message it came from is deleted or edited
  [`core/eventbase-store.js`: events keep `source_message_hashes` and `deleteEventByHash` exists, but nothing calls it on a deletion
  or an edit]; an edited window is extracted again, so the old and new versions both stay. After you delete or rewrite older messages
  (a rollback of a few turns included):
  - open the chunk visualizer, sort by `message_order`, and bulk-delete the events from the first message that changed onwards; or
  - re-vectorize the chat from that message.

  After a **branch**: re-vectorize the branch, or lock the parent's collection to the parent and delete the branch's events after the
  branch point. The card's variables are unaffected either way (MVU keeps them per message).
- The keyword query is your own last message: anchoring it with story words ("the scorched ledger", "Irene's warning") helps recall.
- Rule 504 tells the narrator that recalled memories are the past and `<current_state>` is now (a recalled "300 points" never
  overrides the wallet), that a memory tells what happened, not who knows it, and that a character's Cast Sheet outranks a memory's
  description of them.

## Summaryception (chat memory, option 2)

Since 1.99.1 the card works with **Summaryception 5.5.4** (github.com/Lodactio/Extension-Summaryception) as the second memory option.
Use **either** VectFox **or** Summaryception in a chat, not both; the card also plays with neither. Checked against its source
(`index.js`, `connectionutil.js`, `settings.html`, v5.5.4), SillyTavern 1.18.0 (8172dcd0e), MagVarUpdate 438f9ff and ST-Prompt-Template.
Forks share its module name and settings key but differ (vadash's 24.x has its own prompts, injection position and "apply regex
scripts"); only 5.5.4 is supported. File names in brackets are Summaryception's.

### What it does
| Job | VectFox | Summaryception |
|---|---|---|
| The past outside the chat | the ~10 stored events most similar to the scene, in full detail | a running record of the whole story, oldest first, short, every turn |

- **Trigger** [`onMessageReceived`, `maybeSummarizeTurns`]: 500 ms after a reply arrives, when more replies than *Verbatim Turns* are not
  yet summarised, it summarises the oldest *Turns per Batch* (3) of them with the player's messages in between, so 8–10 replies stay
  word for word at Verbatim 10.
- **Input** [`buildPassageFromRange`]: each message's raw `mes` as `Player: …` / `Assistant: …`. Nothing is cleaned (Strip Patterns
  clean only the output) and SillyTavern's regexes do not apply, so the update block (Mind, Knows, Extras), `<npc_thoughts>`, `<say:Name>`
  tags and the scene marker arrive as written. The card's prompt says what to read in them and what to ignore.
- **Prompt** [`callSummarizer`]: one user prompt does two jobs, a new line from chat (Layer 0) and one line from 3 older lines (a
  promotion). `{{player_name}}`, `{{context_str}}` (every stored line, deepest layer first) and `{{story_txt}}` are each replaced once;
  SillyTavern macros are filled only in Default connection mode. The system prompt is a separate field.
- **Layers** [`maybePromoteLayer`]: 20 lines a layer (the README says 30; the code 20), 3 lines merge into 1, the first line of a new layer
  moves without a call, 5 layers: about 7,000 replies before the last layer grows on.
- **Injection** [`updateInjection`]: `setExtensionPrompt('summaryception', …, IN_CHAT, depth 12, no WI scan, user role)`. Position, depth
  and role are constants in the code (`TUNING`), not settings; only the template is. With 16–21 messages in view the block sits among the
  older ones, so the card's template says everything in it is older than every chat message and is not the player's message. In MVU's
  extra-model mode Tavern Helper adds it to the update request too (DECISIONS §11); 503 names it as the past.
- **Ghosting** [`ghostMessagesUpTo`]: `/hide a-b` makes summarised messages `is_system` and marks them `extra.sc_ghosted`; you can still
  read them. *Disable Ghosting* only skips the `/hide`: the messages then still reach the narrator, whatever its hint says.
- **Storage**: per chat in `chatMetadata.summaryception` (`layers`, `summarizedUpTo`, `ghostedIndices`), by message index. It trims
  itself only when a chat opens (`repairIfBranched`, when `summarizedUpTo` is past the chat's end).

### Settings
| Setting | Value | Why |
|---|---|---|
| Enable Summaryception | ON | |
| Pause Summarization, Disable Ghosting | OFF | Ghosting is how it takes old messages out of the prompt. |
| Verbatim Turns | **10** (at most 11) | The card's trim regex sends only the latest 24 messages; above 11 replies, some reach neither the chat nor the record. The card warns when it is higher. |
| Turns per Batch / Snippets per Layer / per Promotion / Max Layers | 3 / 20 / 3 / 5 | |
| Prompt Preset | Custom, then **Import** `dist/summaryception_prompt.txt` | Only the user prompt can be imported. |
| Summarizer System Prompt | paste `dist/summaryception_system_prompt.txt` | |
| Injection Template | paste `dist/summaryception_injection_template.txt` | wraps the record in `<story_before_chat>` |
| Strip Patterns, Max Response Tokens | as shipped, 0 | |
| Connection Source | **OpenAI Compatible**: your provider (OpenRouter: `https://openrouter.ai/api/v1`), a fast, cheap model | Calls the endpoint directly and touches nothing in SillyTavern. The key is stored in Summaryception's settings in plain text. |

- **Default** works, but for the length of each call (5–30 s) it switches every preset toggle OFF and back [`disableAllPromptToggles`]: a
  message you send meanwhile is built with the preset off (no Main Prompt, no Chat History). Wait for the "Summary saved" toast. It also
  runs SillyTavern's generation events, so Prompt Template renders the request as EJS and the card's trim collapse runs (harmless).
- **Connection Profile**: avoid. 5.5.4 calls `sendRequest(profileId, messages, {ignoreInstruct: true})`, and in SillyTavern 1.18 the third
  argument is `maxTokens`, so `max_tokens` goes out as an object.

Each record line starts with its in-world date and place (`[Y1 M1 W2 Tue 09:10, Main Library]`), from the update block's Time line, and
keeps what the card's state does not: who did or said what and why, what was learned or revealed, promises and debts, conflicts,
first meetings, open matters. About 65 tokens a line: ~1,300 tokens for the first 60 replies, ~6,700 once four layers are full
(~2,400 replies), at most ~8,500 near 7,000 replies; VectFox costs ~2,500 a turn. A summary call reads ~6,000–10,000 tokens every 3 replies.

### What the card does for it (1.99.1)
- `floorOf` reads a player message Summaryception hid (`sc_ghosted`) as the player's words, because MVU's Replay floor and restore
  replay hidden floors too: a replay gets the same result as the first run.
- Two warnings (`scChecks`, read-only): Verbatim Turns above 11 when a chat opens; and, after a deletion, a record that reaches past the
  chat's end ("open another chat and come back": otherwise the next replies at those indexes are hidden without being summarised).
- 503 names `<story_before_chat>` with `<VectFoxMemory>` as the past; 504 already speaks of "summaries of past events".
- Nothing VectFox uses changed; the scene marker stays (Summaryception reads it raw for who and where).

### Switching mid-campaign
- **VectFox → Summaryception:** turn VectFox off for the chat; if its ghosting hid messages, unhide them (Summaryception skips messages
  someone else hid). Open the chat: *Process Entire Backlog* (one call per 3 replies; it can be stopped and resumed) or *Skip Backlog*
  (the Journal and Chronicle then carry the old story).
- **Summaryception → VectFox:** `/sc-clear` first (it unhides everything; VectFox skips hidden messages).
- After editing an old, already summarised message: Snippet Browser → regenerate that line.

## If you change things later
- The MAX and Micro CoT variants were not adapted; stay on BOLT or ask for them to be converted.
- DnD Simulator and Inventory/Feats need the Internal States block; leave them OFF with this card.
- Turn the Bridge prompt OFF when you use this preset with other cards.
