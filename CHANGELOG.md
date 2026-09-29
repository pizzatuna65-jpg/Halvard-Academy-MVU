# CHANGELOG — Eldrasil / Halvard Academy MVU card

Newest first. Details are kept for about the five newest releases; the one-line index of every release is at the bottom. Older
details: `git show b62d182:CHANGELOG.md`.

## v1.28.0 — Magical crafting (2026-09-30)

Batch 4 of the approved proficiency plan. `data/crafts.json` defines brewing, runes, repair and enchant recipes, materials, effects and sale guides. The engine shows each available recipe's Fortune-based result in `<now>` and the Practice UI; `/Practice` with `Action: "craft"` uses that result, spends materials, awards Craft XP and puts handmade work in the Bag. Tools, an expert, conditions, rank, the A-grade bonus, mishaps, tiers and weak/failed outcomes are enforced.
- Gardens, Forest and Clearing Practice yield reagents; clearing blooms wilt on the next day. Crafted draughts and talismans use `/Consumables`, including healing an injury and one-use fitting items. The Bag shows their effects and handmade notes, which gift preferences read. Enchanted clothing works as weather gear. The Medical Centre apothecary buys up to three Healing draught doses per week through `/Craft_sales`.
- Craft instructions in rules 502/504 appear only where a recipe is available; Settings' token estimate measures the ordinary cost without those situational lines.
- Save fixture v1.27.0; no migration. Main and three TEST cards rebuilt. Focused crafting tests, Practice tests, save compatibility, `npm run lint` and the full suite pass. Connected SillyTavern checks remain in `docs/TEST_CHECKLIST.md`.

## v1.27.0 — Proficiency and Practice (2026-09-30)

Batches 2 and 3 of the owner-approved `planning/DRAFT_proficiency_practice.md` in one release.
- Six engine-owned proficiency ranks with XP from classes, exams, study, interaction, casting, stamina training, battle, club time and tutoring. Repeatable XP has a per-stat weekly pace setting (4/6/9); rank and A-grade Fortune bonuses share a +20 ceiling. Society Rank 4/5 adds 10%/20% bond XP from talk or hangout.
- Student Builder offers Normal or Custom starting ranks. Studies shows a six-axis chart, XP, weekly progress and practice places. Old saves receive a small estimate and a one-time starting-rank choice; the 1.25.0 save fixture is retained.
- Activities gains Practice after the first training place is discovered. `/Practice` checks action, both endpoints' location, elapsed time, class hours, daily repeat, partner, club, weather, season, dorm and weekly cap. It can count as ordinary mana/stamina training, study or a paid animal-care shift. `<now>` lists available actions at the current place.
- Build: main card and three TEST cards regenerated. New focused tests cover migration, read-only ranks, XP sources, place/time/partner rejection and report clearing. Full suite and live SillyTavern checks are recorded separately.

## v1.25.0 — Red "new" dots (2026-09-30)

Owner: "a red dot in the UI to show that a new UI has unlocked". Batch 1 of the owner-approved `planning/DRAFT_proficiency_practice.md`
(6 batches: dots, proficiency stats, Practice, crafting, non-magic crafts, grades and mastery). Decisions touched: none changed;
DECISIONS §6 gains one line (where "seen" is kept) and §11 one verified fact.
- **Dots:** a small red dot on a bracelet button (Student file, Bag, People, Map, Notebook) whose panel holds something new; on the
  tab that is new (Notice Board, Letters, Mystery Board, Competition, Projects, Trips, Bag, Hidden, Gifts & perks); on a person just
  met (People, until the dossier is opened); on a Map marker whose place has a story heard but not read (the card opens its lore
  with a dot, then it counts as read). A button's dot goes when its panel is opened; a tab's or a person's when it is opened.
  Things that change every turn (points, time, weather, bond XP) never get a dot. Colour: new token `--notify` in every theme;
  map markers keep fixed colours (DECISIONS "Themes never touch the map").
- **Where "seen" lives:** Tavern Helper's chat variables (`chat_metadata.variables.eld_seen`, saved with the chat), not the message
  variables (no hidden message per click, nothing on swipes) and not the browser (DECISIONS §6). The panels write it; the bracelet
  only reads it (`eldrasil:news` tells it to redraw). Verified in JS-Slash-Runner `src/function/variables.ts` (chat =
  `chat_metadata.variables`, `saveMetadataDebounced`) and MagVarUpdate `update_variables.ts` (writes only its own keys there).
  On an older chat everything already open counts as seen on the first run, so no flood of dots.
- **Code:** `src/ui/news.shared.js` (new; pasted into the bracelet and the panels by `gen_ui.py`), `ui.template.js` (store, open,
  render), People, Map, Notebook and Activities parts, the bracelet buttons, `make_themes.py` (`notify`).
- Tests: `test_news_v1250.cjs` (26 checks: first run, panel vs tab vs item, swipe back, feature off, lore on the map, the bracelet
  never writes); `test_saves`, `test_activities_b5`, `test_notebook`, `test_builder`, `test_settings_v199`, `qa_static`, lint pass.
  Browser preview: dots on the bracelet buttons and the Notebook tabs, a person's dot, the marker and lore dot on the Map. Save
  fixture `save_1.24.3.json` added.

## v1.24.3 — Year floors named plainly; year-floor locations in the engine (2026-09-29)

Owner: "make it clear without the description that the Lecture Halls etc. are split by year"; "check attendance and anything that
reads the Lecture Halls location for errors when the location changes". Decisions touched: DECISIONS "World.Location is written in
the Campus Map's words" (one sentence added for year floors).
- **Map:** on Floors 2–4 the cards are named for the year ("First-year Lecture Halls", "Second-year Study Rooms", "Third-year
  Lockers") in the header and beside the arrows; a line under the header says "Floor 3 · for Year 2 students · your year"; the
  floor tabs read "Floor 3 Year 2".
- **Check (probe of attendance, map, ambience, discovery with nine wordings for a second-year in P1 Magic Theory):** no wrong skip
  in any case (a name the map does not know, like "Lecture Hall 3B", keeps the benefit of the doubt). But the 1.24.2 "Go here" wording
  could come back as "Second-year Lecture Halls", which the engine did not know: no "You are here" on the map, not recorded as
  visited, no ambience crowd; "Floor 3 — Lecture Halls" lost its floor.
- **Fix:** `canonLocation` (`yearFloorLocation`) writes any year-floor wording as "<place> — Floor N" ("Second-year Lecture Halls",
  "Lecture Halls, Floor 3", "Floor 4 — Study Rooms", "the lockers on the third-year floor"); a text that names another place first
  keeps it ("Fire Dormitory — lockers on the second-year corridor"). The update rules (502) show the form; `<now>`'s class line says
  the floor ("at Lecture Halls — Floor 3 (the Year 2 floor)").
- Tests: `test_map_gates_v1240.cjs` gains the naming, canonLocation and attendance checks; `test_world_v110` reads the new class
  line. `npm test`: 81 suites pass; lint passes. Browser preview checked. Save fixture `save_1.24.2.json` added.

## v1.24.2 — Year floors in the castle, wheel zoom (2026-09-29)

Owner: "lecture, study, storage room on Floors 3 and 4 too; Floor 2 is for first-years, a second-year has no place"; "zoom with the
scroll". Decisions touched: none (lore 49 and 132 already put each year's Lecture Halls on its own floor).
- **Year floors:** the Lecture Halls, Study Rooms and Storage and Lockers are on Floors 2, 3 and 4 (`locations.json` `floors` and
  `floor_notes`, from `curate_data.py` `YEAR_FLOORS`). Each floor's card names whose they are ("Floor 3: The second-year Lecture
  Halls."); "Go here" says the floor ("I head to the second-year Lecture Halls on Floor 3."); Walk adds a minute per floor climbed.
  At one of them the Map opens on the floor World.Location names ("Floor 3", "second-year"), else on {{user}}'s year floor.
- **Lore:** the Campus Map entry (132) now says the second- and third-year Lecture Hall floors have their own Study Rooms (lockers
  were already on every Lecture Hall floor).
- **Wheel zoom:** the mouse wheel zooms the map without Ctrl, one step per gesture, toward the pointer; at 100% scrolling down still
  scrolls the panel.
- Tests: `test_map_gates_v1240.cjs` gains the year-floor and wheel checks. `npm test`: 81 suites pass; lint passes. Browser
  preview: a second-year at the Lecture Halls sees Floor 3 "You are here"; the wheel zooms in and out. Save fixture `save_1.24.1.json`.
- To confirm with the owner: Study Rooms on Floors 3 and 4 are new canon (lore 132), added on the owner's request.

## v1.24.1 — Map gates: far grounds only (2026-09-29)

Owner, on the 1.24.0 suggestions: the Fishing House yes; the Mall and castle gates scrapped "so a new player is not confused about
what is there and what it is for". Decisions touched: DECISIONS §7 "Gated places" (updated).
- The Fishing House shows on the Map after the Boathouse (like Willow Island).
- The Mall's shops and the castle's halls show from the start again; the castle entrance card and the engine's "Castle" entry in
  `$ui.discovered` are gone (an old save that holds "Castle" is unaffected).
- The other suggested gates were not chosen (moved to FUTURE_PLANS §2).
- Tests: `test_map_gates_v1240.cjs` checks the new gate set; map, ambience, save and static suites pass. Save fixture
  `save_1.24.0.json` added.

## v1.24.0 — Map: gates, zoom, lore heard in the story (2026-09-29)

Owner playtest notes (five points). Decisions touched: none changed; new standing lines in DECISIONS §7 (gated places, lore heard).
- **Zoom:** + and − buttons on the map (100% to 300%), Ctrl + wheel or a trackpad pinch, drag with the mouse to pan (touch scrolls).
  The zoom and its centre stay when the map is closed and opened again (kept in the script while the page is open; not in browser
  storage, which DECISIONS "Colour themes" keeps for the theme).
- **Cut-off labels:** a pin label near the right or left edge grows inward, near the top it sits below the pin (Willow Island,
  Observation Tower). The black band at the right of a card header is gone: the header crop now follows the card's real width
  (it assumed 280px). The thin scrollbar line at 100% zoom is gone too.
- **Gated places** (UI only, `locations.json` `gate` from `curate_data.py` `GATES`): Willow Island shows after the Boathouse, the
  Forest Clearing after the Forest, the Observation Tower and the Old Hut after the Grassy Field and Hills, the Mall's shops after
  the Mall (or any shop), the castle's halls after the castle. Before that the Castle pin shows an entrance card ("Go here" fills
  "I head into the Castle."); the engine records "Castle" in `$ui.discovered` when World.Location names the castle. The Rooftop
  keeps D21. Old saves: every place already visited opens its gate.
- **Lore and rumours are heard, not given:** the Map lists only the stories in the new `$ui.lore` (uids); the rest are counted
  ("2 more you have not heard yet"), and a place text's "Home of the X story" sentence waits too. A story is heard (toast
  "Heard at <place>: <title>") when (a) a non-calm ambience beat at its place turns into talk of it (`data/ambience.json`
  `lore_chance` 35%, once a day, needs a crowd or company; `<now>` asks the narrator to weave it in as hearsay, with the entry's
  text), or (b) the narration names it as a proper name ("Sunfizz", "the Faraway Laugh"; "the long corridor" in passing does not
  count), or (c) with Ambience below Full, on the first visit. Old saves start with nothing heard.
- **"Create your student"** stays on the collapsed bracelet.
- Tests: new `test_map_gates_v1240.cjs` (gates, castle entrance, lore heard, labels, zoom, bracelet); `test_people_map` and
  `test_mapvariants_v1130` read the new crop style and the castle gate. `npm test`: 81 suites pass. Browser preview: zoom kept
  after closing, labels inside, full-width crops, castle card at phone width. Save fixture `save_1.23.0.json` added.
- To confirm with the owner: the castle entrance card's line ("The old heart of Halvard: classrooms, the library, the canteen and
  the offices, floor above floor.") is new UI text.

## v1.23.0 — UI overhaul 3: panels (2026-09-29)

Owner-approved report "Brass & Moonglass", stage 3 (the last). Decisions touched: none beyond 1.21.0 (same data, same actions).
- **People:** the bonds list is a grid of cards (two columns on a wide panel): portrait with a dorm ring and a moonglass dot for
  "here now", the rank as a brass medal, XP, Trust and Tension as three labelled meters.
- **Dossier:** the portrait sits in a mat and stays in view while the file scrolls; the dorm shows as a gem; the bond box leads with
  the rank medal ("Rank N of 10"); the character's fields are label/value rows in the story serif (no stack of capital headings);
  a missing portrait is a monogram on the dorm colour.
- **Student file > Settings:** each theme is a small picture of the bracelet in that theme (drawn with `keep` colours so the current
  theme leaves it alone); an on/off feature is a switch (`role="switch"`, it sends the other value), a feature with levels keeps
  its choices; token estimates read "About N tokens of rules, M of state".
- **Builder:** numbered steps (done in brass, one with an error in red): the only tabs that are a real sequence.
- **Activities:** the club directory is a dense two-column list with dividers instead of twenty identical boxes. **Journal:** lines
  ruled like a notebook page. Map, Notebook boards, Battle and the rest follow the 1.21.0 tokens.
- Tests: `test_ui_overhaul_v1210.cjs` gains the panel checks; `test_people_map`, `test_bonds_v122` and `test_year2_v174` read the new
  markup (`<dt>` fields, "XP" meter). A browser smoke run opened 405 panel and tab views over every sample state with no errors, at
  desktop and phone width. `npm test`: 80 suites pass; lint passes. Save fixture `save_1.22.0.json` added.

## v1.22.0 — UI overhaul 2: the bracelet (2026-09-29)

Owner-approved report "Brass & Moonglass", stage 2. Decisions touched: none (same data, same buttons, same stored keys).
- **The bracelet is an object:** a brushed pewter band with a brass edge and the dorm colour inlaid along the top; the glass face
  sits in a brass bezel and is the one bold element (the day in small capitals beside a large clock, then the period and place).
- **Points and dorm:** the balance is a brass figure labelled "points"; the dorm is a gem in the dorm colour beside its name.
- **Vitals** are thicker vials with a light sheen; the maximum is quieter than the current value.
- **Chips** have three tiers (moonglass for events and magic, amber for warnings, red for danger) and a 26px minimum height.
- **Who is here** and **the latest news** share one row (`.low`); portraits have a ring in the dorm colour with a gap, and the mood
  (Rank 4+) is a small Font Awesome badge on the portrait instead of a Unicode glyph after the name.
- **Panel buttons** are one joined row of charms; on a phone (≤540px) they become a 3-column grid with 40px targets, and the points
  and crest move under the glass.
- Tests: `test_ui_overhaul_v1210.cjs` gains the bracelet checks; run with the bracelet suites (`test_batch1_swipe`,
  `test_batch4_seasons_mana`, `test_extras_v161`, `test_playtest_v131`, `test_playtest_v134`), `test_saves`, `qa_static`: all pass.
  Save fixture `save_1.21.0.json` added.

## v1.21.0 — UI overhaul 1: tokens and foundation (2026-09-29)

Owner: audit the look and overhaul it without changing how the card works; the report ("Brass & Moonglass", artifact
QjbmYWMLMpxihoq5oU5Dys) was approved in full: Alegreya instead of Cinzel, slate-blue neutrals, the default theme keeps the name
Pewter, three staged releases (1.21 foundation, 1.22 bracelet, 1.23 panels and themes). Decision touched: §6 "Colour themes"
(mechanism unchanged, the values of all five themes change).
- **Colour tokens.** Every panel colour is a CSS variable in one block (`.ov{…}` in `ui.template.js` CSS), every bracelet colour in
  `:root{…}` of `statusbar.template.html`, with the same names and values (284 literals, 105 distinct, became about 40 tokens).
  `tools/make_themes.py` now lists each token's default value (`ROLES`) and each theme's value; `recolor()` is unchanged.
  Paper notes, vital bars, dorm colours and the map are not themed (`/*keep*/`). The build fails if a theme's text colour falls
  below 4.5:1 on a panel surface (WCAG AA); the old faint text was 3.97:1.
- **Palette.** Neutrals take the slate blue of the castle spires on the map; brass is for what you can press, moonglass only for
  magic and time. Vital colours a little brighter (Health `#d9625a`, Stamina `#dcae4a`, Mana `#6f9de6`).
- **Type.** Alegreya Sans for the interface, Alegreya (serif) for text written in the story (dossier fields, journal lines, letters,
  place descriptions), Alegreya SC only for panel nameplates, ranks and place names. Six sizes (12, 13.5, 15, 17, 21, 30 px) instead
  of fifteen; no upper-case labels.
- **Frame.** The panel is anchored to the top of the screen (switching tabs no longer moves the header); tabs are underlined in
  brass; buttons, inputs and toggles have larger touch targets on touch screens.
- Tests: new `test_ui_overhaul_v1210.cjs` (no colour outside the token blocks, both blocks agree, themes map token values only,
  theme ids unchanged, fonts, top anchoring, the selectors other code uses); the recolor checks in `test_playtest_v131.cjs` and
  `test_playtest_v134.cjs` use the new values. Run: those three, `test_saves`, `test_people_map`, `test_notebook`,
  `test_batch5_shops`, `test_settings_v199`, `qa_static`: all pass. Save fixture `save_1.20.0.json` added.
- To confirm with the owner: nothing new in canon.

## Documentation overhaul (2026-09-29, card stays 1.20.0)

Owner: tidy the project files and docs, drop what is no longer relevant, and add an index so a session reads only what a task needs.
- New `docs/INDEX.md` (task → files and symbols; engine step, state, entry, UI and data maps), `docs/DECISIONS.md` (the established
  decisions and verified external facts, formerly HANDOFF §4 and §7), `docs/BUILD.md` (build, generated files, tests, playbooks,
  formerly HANDOFF §5, §6 and §9). `HANDOFF.md` is now a short snapshot and repository map; `CLAUDE.md` gives the new reading order
  and the rule that an applied draft is deleted and a finished plan leaves `planning/FUTURE_PLANS.md`.
- `planning/FUTURE_PLANS.md` is the one list of open work (FP4, FP5, ideas not chosen, audit A8/A10, decisions waiting on the owner,
  tunables); the stale open-items lists of HANDOFF §8 and this file were checked and merged into it or dropped when done.
- This file keeps the details of the five newest releases, then the release index. Older details, every implemented
  `planning/DRAFT_*.md`, the audit, `docs/design/`, `docs/archive/`, the bug-hunt and playtest-state notes are in git at `b62d182`.
- `make_npc_brief.py` and the NPC brief point to `data/bond_rewards.json`, `reputation.json`, `training.json` instead of the 1.3.0
  design notes; `test_voices_g5_v167.cjs` no longer reads the design note (the data check stays).
- Fix: `tools/make_npc_brief.py` had failed since 1.19.0 (it parsed `EVENTS` / `TIMETABLE` out of the engine); it now reads
  `data/calendar.json`. Checked: lint, static QA, `test_voices_g5_v167.cjs`, the brief generator.

## v1.20.0 — Audit Batch 5: engine steps and migrations (2026-09-29)

Owner: "lanjutkan batch 5" (the previous attempt was interrupted before it wrote anything; this release redoes it from 1.19.0).
Decisions touched: none. §4 "Engine is deterministic and replay-safe" gains how the engine is organised (below).
- **A5 steps:** `runEngine` (≈2,300 lines) is now a loop over `ENGINE_STEPS`: `stepSetup`, `stepMigrate` and 34 section functions
  (`stepGuards` … `stepCommit`, one per former section, in the same order; the two magic sections are one `stepMagic` because they
  share the mana regeneration pool). Each step reads what it needs from the shared context `c` and adds what later steps use.
  The split was generated from a scope analysis of the old function (espree + eslint-scope), so every shared variable is passed
  explicitly. The training helpers (`trainRoom`, `trainAdd`, `trainJump`) are module functions taking `c`, as Rank rewards (section 6)
  used them before training (6b) declared them.
- **A5 migrations:** Dante's renamed gift, Florian's Rank 10 text, pre-1.3.0 reputation meters (`repv`), pre-1.2.2 bond Progress
  (`bondv`), pre-1.3.8 paid milestones (`tenv`) and obsolete event hints (`$ui.bev`) moved into `stepMigrate`. It runs only on the
  first update after the card version changes (or a new chat's first run), on S and on a copy of the before-state, so the engine
  does not read a migration as a change the reply made. Each migration still keeps its own flag.
- **Fix found on the way:** the Dante/Florian migration ran on S only, so the read-only guard on `_Perks` put the old gift back and
  logged "_Perks is read-only; the change was reverted." on every update of a save that had the old key. Migrating the before-state
  too fixes this.
- **Proof of no change:** `tests/harness.cjs` gains `ENGINE_DIFF=<older engine.js>`: every engine run also runs the older build on a
  copy and stops at the first difference in the state after, the state before or the error. Against the 1.19.0 engine (same
  version string): all 78 suites, fuzz (2 × 4,545 runs), Builder fuzz (601) and the 380-day simulation (1,523) were identical; the only
  difference is the Dante fix. Three older suites that simulated an old save by resetting a flag now also give that save an old
  `$eng.ver`, as a real old save has. About 9.3 ms per update (was about 10).
- Tests: new `tests/test_engine_steps_v1200.cjs` (step list and order, migration once per version, Dante fix, the caller's
  before-state untouched). Save fixture `save_1.19.0.json` was written before edits. `npm test` (79 suites), `npm run lint` and
  ESLint pass. Main card and the three TEST cards rebuilt; the preset is unchanged. Live check: `docs/TEST_CHECKLIST.md` v1.20.0.
- Next: the audit is complete (all five batches). Remaining audit items stay open by design: A8 (split Cast Sheet only with evidence
  of lag), A10 (compact PNG only after compatibility checks).

## v1.19.0 — Audit Batch 4: calendar and state size (2026-09-29)

Owner: "lanjutkan batch 4". No canon or established design decision changed.
- **A3/I7:** `data/calendar.json` supplies 41 events, the weekly timetable and current-month lore to the engine, UI, lore 131/134 and class generator. Exam/trial mood dates read event tags. Election-candidate mood remains conditional on candidacy.
- **A4:** the Journal UI archive retains 120 rather than 300 lines; each bond's `$Known_old` and `$Knows_old` retains 20 rather than 40. Mood state is saved for present or bonded NPCs. The 336-day stress scenario fell from 46,872 to 38,645 bytes per state (−17.5%; archive 10,394→3,980 bytes; moods 2,586→773 bytes). No exported real chat was available for measurement; live check added.
- **A9:** `tests/README.md` maps features to tests. `npm run lint` checks handwritten/generated JavaScript syntax and compiles 118 EJS entries; `eslint.config.mjs` and `npm run lint:eslint` add lightweight template rules after installing the declared ESLint dependency.
- **A8:** Cast Sheet 509 is 515,599 bytes; local EJS compile average was 7.70 ms over 100 runs after the final build. Prompt construction time in SillyTavern is unmeasured; the sheet was not split without evidence of user-visible lag.
- **A10:** the card PNG is about 8.2 MB, with full v2 `chara` and v3 `ccv3` metadata. SillyTavern's parser prefers `ccv3`, but v2-only readers need `chara`; the optional compact fallback was deferred pending compatibility checks.
- Save fixture `save_1.18.0.json` was written before edits. Main and three TEST cards rebuilt. `npm test`, `npm run lint`, `test_calendar_state_v1190.cjs`, `test_saves.cjs` and the 336-day stress scenario pass. Live checks are in `docs/TEST_CHECKLIST.md`.
- Next: Batch 5 refactor, only when the owner says "lanjutkan batch 5".

## Release index (one line per release, oldest first)

- All planned batches (1–5) are complete, plus post-release compatibility work, a bug-hunt round (v1.0.3), the world-systems release (v1.1.0: `docs/archive/SPEC_v1_1_0_world_systems.md`) and the fixes from the owner's first playtest notes (v1.2.0: Builder, bracelet, shop, calendar, map; v1.2.1: second round; CHANGELOG 1.2.0/1.2.1).
- **v1.2.2** replaced the bond meter with an XP system; its former event framework was removed in v1.9.0.
- **v1.3.0** applied the owner's NPC brainstorm (2026-09-25): new lore for 34 NPCs, bond rewards (Rank 5 gifts, Rank 10 benefits, mask → truth, Krieg), three reputations and training (`docs/design/`).
- **v1.3.1** fixed the owner's playtest of 1.3.0 (CHANGELOG 1.3.1): Etnie's bond starts when they meet, map location matching, the Connections graph, event day plans with times, club sign-up week, the Forest pin, the max-Tension penalty, Settings for training and reputation, colour themes.
- **v1.3.2**: pact partners have several abilities, each its own technique (CHANGELOG 1.3.2).
- **v1.3.3**: bug hunt with stress tests (`npm run stress`, CHANGELOG 1.3.3).
- **v1.3.4**: the owner's playtest in ST (old lorebook detection, bracelet theme, map pins, the student's picture, "Next" chip; CHANGELOG 1.3.4).
- **v1.3.5**: a missing lorebook is explained on the bracelet with a button for Import Card Lore.
- **v1.3.6**: the card installs (or, after asking, updates) its own lorebook.
- **v1.3.7**: EJS entries wrapped in their own block scope (they are compiled together in ST).
- **v1.3.8**: Tension bands, five NPC categories and personal overrides (data/tension.json).
- **v1.4.2**: Connections lines are directed (arrows), everyone dislikes Althair one way, your own line takes a kind from rank, trust and tension, a Romance line (yours from Rank 8; Etnie and Kanae one way to you), group-rule lines (Caine and mages; views of the Doves) (CHANGELOG 1.4.2).
- **v1.4.3**: Trust as a full system like Tension (data/trust.json: bands, perk gates, deeds-only rises, categories from openness, overrides, Ottavio and Sky; CHANGELOG 1.4.3).
- **v1.4.4**: grey areas (intent over harm, teasing, kindness eases Tension, "understood", one rank per Tension blow-up; CHANGELOG 1.4.4).
- **v1.4.5**: each bond keeps its latest 10 moments with {{user}} (dossier table; the newest 5 in <now>; CHANGELOG 1.4.5).
- **v1.4.6**: the card sets no prose style, point of view or length (preset toggles do); preset BOLT step 2 points to the card's rules; `tools/audit_chat.py` measures character drift in exported chats.
- **v1.5.0**: rule 504 puts canon over the chat's own prose and lists where world events may come from, bonds near their next rank are marked "close" in <now>, scheduled events adapt to the story (butterfly clause); the preset gains Player Input Authority, Output language and generic character-writing rules (CHANGELOG 1.5.0).
- **v1.5.1**: the Cast Sheet (custom 509 @D1) gives every NPC in `Scene.Present` their canon lore with automatic invariants, secret status and the lines between the people present (full lore for at most 4: who spoke last, then the highest rank; the rest a brief sheet), and their keyword entry prints nothing meanwhile; a last-mile cast gate (510 @D0) checks voice and knowledge before writing; <now> flags an NPC who spoke without being in Scene.Present and lists who was only mentioned (CHANGELOG 1.5.1).
- **v1.6.0**: each bond carries the character's side (Mind, Knows, Imprints, Next; engine defining moments, Meanwhile lines) and dated lines show their age in words (CHANGELOG 1.6.0); VectFox Summarizer Injection is now recommended OFF.
- **v1.6.1**: characters the narrator invents get an Extras record from their second appearance (their card in <cast>; the player can pin one from the cast strip), campus events are dated and <now> asks to move on those with no news for a week, and a campus-phase line exists for the canon waves to fill (CHANGELOG 1.6.1).
- **v1.6.2**: the preset's reasoning reads the character sheets, runs a cast check per character (name-swap test, the usual reaction over the loudest) and points to the card's world sources and invented-character records without naming any card field (CHANGELOG 1.6.2).
- **v1.6.3**: the first canon wave (G1, approved by the owner): the 8 key NPCs have voice examples, terms of address, props, a drift warning, a Change type, a Stage per rank band and an Anchor in `data/npc_canon.json`, printed in their Cast Sheet (CHANGELOG 1.6.3).
- **v1.6.4**: the second wave (G2: Caralynn, Percival, Trixie, Vera, Alyssa), with Stages for every wave from now on; Alyssa's story is somber and bittersweet, and her Rank 10 benefit no longer cures her forgetting (CHANGELOG 1.6.4).
- **v1.6.5**: the third wave (G3: Lenna, Saffi, Idris, Dante, Florian, Tilly); Dante stays fanatically lawful, so his Rank 5 and Rank 10 rewards no longer bend rules for {{user}} (CHANGELOG 1.6.5).
- **v1.6.6**: the fourth wave (G4: Caspian, Royhan, Sophia, Gareth, Ruby) (CHANGELOG 1.6.6).
- **v1.6.7**: the last wave (G5: the staff, Krieg, Milena, Tristan and Bobby), so every bonded NPC has a voice; Yvette's and Layla's Rank 10 texts were fixed to match their lore (CHANGELOG 1.6.7).
- **v1.6.8**: Rank 8 branches per NPC (A all, B best friend or rival, C best friend or romance, D best friend only), with a Romance or Rival line in the Cast Sheet and a dossier line saying what Rank 8 can open (CHANGELOG 1.6.8).
- **v1.6.9**: a stress test, bug hunt and compatibility round for the card with the edited preset and VectFox: the Rank 8 branch now follows the Trust the event was played on, a B or D character's sheet says they do not become a romance, the preset's BOLT reasons through all its tasks (0-11) and its prompts point only to tags the model can see, and `docs/TEST_CHECKLIST.md` (v1.6.11) lists what only SillyTavern can show (CHANGELOG 1.6.9).
- **v1.6.10**: every People → Connections line now points from the person who holds the view (a sentence in one NPC's file often describes another's view of them), and opens with the bond of the person whose file tells it (CHANGELOG 1.6.10).
- **v1.6.11**: a new bond always starts at the character's own Trust, whatever number the narrator writes on a first meeting, and a club in People → Connections shows someone only once their Club field is open (CHANGELOG 1.6.11).
- **v1.7.0**: the first incoming cohort (owner-approved `planning/DRAFT_cohort2_npcs.md`): Linus, Maple, Nerys, Hadrian, Wren and Tsubaki arrive as first-years in campaign Year 2, with lore, voice canon, Rank 8 branches, rewards, Connections lines and the lines they add to older NPCs' files, all hidden before Year 2; Nerys has a weekly hobby line in her Cast Sheet; a Rank 10 benefit can carry a training bonus (CHANGELOG 1.7.0).
- **v1.7.1**: a World Myth lore category (owner-approved `planning/DRAFT_world_myth.md`): five continent-wide myths (uid 273-277) linked to each other and mentioned in the entries and NPC files that should know them; Eldrasil lies in the east of the continent (CHANGELOG 1.7.1).
- **v1.7.2**: five nations (the Arslan Sultanate, Norvaine, Velmora, Caelmar, Yozakura; owner-approved `planning/DRAFT_nations.md`), each with its own trade and woven into the lore; Tilly's secret now includes Velmora's bloody succession (CHANGELOG 1.7.2).
- **v1.7.3**: Idris was born in the Arslan Sultanate and Vera in Caelmar; both moved to Eldrasil at twelve (CHANGELOG 1.7.3).
- **v1.7.4**: the Year 2 bug hunt, merged with 1.7.1-1.7.3: dates carry their year from Year 2 (Year 1's lines are dated "Y1" at the rollover), {{user}} moves up a year, last year's competition record is cleared, Etnie stays on past her third year (owner-confirmed), ages follow the campaign year, a graduate's entry says they left, rival academy third-years graduate too (their teams' new members come later), <now> names the campaign year, the Entrance Event is for the new first-years, teachers not on record are the narrator's to create; open Year 2 canon waits in `planning/DRAFT_year2.md` (CHANGELOG 1.7.4).
- **v1.7.5**: from {{user}}'s second year the Entrance Event makes them a senior who guides four new first-years; a student past Year 1 who starts Unsorted gets the Stone's dorm once the Builder sets it; a second TEST card starts the campaign in Year 2 with varied Year 1 bonds (`dist/test/Eldrasil_TEST_Year2`, CHANGELOG 1.7.5).
- **v1.7.6**: a graduate's rewards stop working: their Rank 5 gift is a keepsake, their Rank 10 benefit ends (CHANGELOG 1.7.6).
- **v1.7.7**: FP1 adds seeded opportunities for Rank 3+ NPCs to seek {{user}} out, using their approved Stage, with a Features toggle (CHANGELOG 1.7.7).
- **v1.7.8**: FP2 adds the Month 10 Week 3 Student Council election week, Florian and Dante as Council members, Saturday voting in the Main Courtyard instead of clubs, and a recorded Year 2 leadership handover (CHANGELOG 1.7.8). Every release now tests that the previous release's save still loads (`tests/test_saves.cjs`, fixtures in `tests/fixtures/saves/`). The approved character-consistency plan (releases 1.5.0 to 1.6.2 and canon waves) is `planning/DRAFT_batch_plan.md` with its four source drafts.
- **v1.8.0 (2026-09-28):** Both approved drafts, `planning/DRAFT_mood_fatigue.md` and `planning/DRAFT_gift_prefs.md`, are implemented: 44 NPC mood and gift profiles, fatigue/injury training gates, sleep debt and The Vigil, wind-sensitive casting, 43 birthdays, birthday parties, seven Mall shops, and discovery UI. See the v1.8.0 release entry in CHANGELOG and `docs/TEST_CHECKLIST.md` (v1.8.0).
- **v1.9.0 (2026-09-28):** Owner-approved `planning/DRAFT_rank_perks.md`: rank now rises automatically on the next genuine interaction after full XP, cooldown and gates; no rank-up event framework, narrator prompt or bracelet badge. Rank 2 accepted invitation bonus, Rank 4 per-NPC shared training/study table (`data/rank4_partners.json`), Rank 5 gift only after actual handover, Rank 6 roster introduction at Rank 1, Rank 7 accompanied dorm/spontaneous staff visit, Rank 9 public vouch against one matching reputation loss, Rank 10 unique benefit retained. Extras and rival teams remain outside bonds. People and Map show relevant benefits; <now> asks the narrator to weave them into ordinary conduct. Old `_Event_ready` saves are honored as readiness. See 1.9.0.
- **v1.9.1 (2026-09-28):** Playtest Batch 1: fixed a card-side swipe blocker by inserting hidden player-tool edits before the final narrator reply when a pre-reply MVU state exists, leaving the reply last and preserving pre-swipe and current state separately. Main bracelet Builder hides after registration; Bag opens directly when unlocked; Student file exposes a clear Edit student file button. Main and TEST cards rebuilt. Focused tests pass; live swipe with a connected narrator API remains to verify. See 1.9.1 and `docs/TEST_CHECKLIST.md` (v1.9.1).
- **v1.9.2 (2026-09-28):** Playtest Batch 2: entrance speeches precede sorting; Council hands over a dorm vest after each first-year sorts; sorted students remain seated until 10:00, when an assigned two-first-year/one-senior trio tours together. The Year 2+ player guides two arriving first-years and never sorts again. `Campus_State.Entrance_tour` stores a deterministic roster-first trio that persists through scene changes and swipes. Roster, Cast Sheet, <now>, and narrator rules treat each current-cohort first-year as a newcomer until their own Stone turn. Both lorebook exports and all cards rebuilt; focused entrance, Year 1/Year 2, save and static checks pass. Live narrator check remains open (`docs/TEST_CHECKLIST.md` (v1.9.2)). See 1.9.2.
- **v1.9.3 (2026-09-28):** Playtest Batch 3: elapsed time follows actual dialogue and travel, with map figures explicitly for walking and faster magic allowed when its effect/path/mana support it. Small backwards clock errors no longer jump to the next day. Safe everyday casting cannot alone trigger Dove punishment. The Magic Duelling Club name and warded spell practice are consistent across active lore, roster, UI and data; old `Duelling Club` saves migrate without a false journal entry. Combat Class no longer borrows Norvaine army framing. Main card and both TEST cards rebuilt; full `npm test` passed. Connected narration check remains open (`docs/TEST_CHECKLIST.md` (v1.9.3)). See 1.9.3.
- **v1.9.4 (2026-09-28):** Playtest Batch 4: M1–3 Spring, M4–6 Summer, M7–9 Autumn, M10–12 Winter with rebaselined temperatures, snow and flu months; bracelet shows season and °C beside Month/Week. `/Exposure` reports a direct soaking or freezing hit and the engine sets Soaked/Chilled at once (subzero outdoors chills immediately); `<now>` keeps active conditions in the narration. Mana regenerates passively at Mana_max / 360 per minute; the rest/sleep refill is gone and upkeep is offset once. Full `npm test` passed. Live check: `docs/TEST_CHECKLIST.md` (v1.9.4). See 1.9.4.
- **v1.9.5 (2026-09-28):** Playtest Batch 5: shop items carry structured effects (`gear` worn from the Bag; `use` reported in `/Consumables`: clear conditions, stamina, timed protection, cold remedy), applied by the engine and worded once by `tools/common.py` `effect_text()` for the shop, Bag and Price Guide. Twelve new seasonal items; each season has at least six useful choices across three or more shops. All ten Mall shops link to The Mall and back. Fixed the 1.9.4 UI season helper. Full `npm test` passed. Live check: `docs/TEST_CHECKLIST.md` (v1.9.5). See 1.9.5.
- **v1.9.6 (2026-09-28):** The six Year 2 first-years have hosted portraits and thumbnails; assets pinned to commit 172dc4a. See 1.9.6.
- Repository cleanup (2026-09-28, no card change): see the entry below.
- **v1.9.7 (2026-09-28):** Lorebook audit: World Index follows {{user}}'s year, World Competition M11 W4 everywhere, season line, season-fitting notes; a test keeps calendar lore and engine in step.
- **v1.9.8 (2026-09-28):** Fortune roll: a seeded d100 per reply, the same on every swipe, for important uncertain attempts only; gentle by default, with state and situational modifiers (fitting magic such as invisibility counts heavily).
- **v1.9.9 (2026-09-28):** Complete Settings: Mood and rest rows get real choices; new Body and magic (mana recovery time) and Campus life (NPC initiative frequency, rumour lifetime, tension fading) groups.
- **v1.10.0 (2026-09-28):** Batch 1: automatic attendance (skipped classes, clean weeks, Saturday club time), a weekly Journal recap, and at most four people in a scene on ordinary days.
- **v1.10.1 (2026-09-28):** Batch 2: study time sets exam preparation; the engine sets the dorm rank on Results days (at most one band per day).
- **v1.10.2 (2026-09-28):** Batch 3: each NPC initiative comes with a concrete, in-character reason that does not repeat within 20 uses.
- **v1.10.3 (2026-09-28):** Bug fix: the engine no longer crashes (or mislabels a defining moment) when a bond changes a lot without a history row of its own.
- **v1.11.0 (2026-09-28):** Token audit: ~2,500–3,500 fewer tokens per message (situational rules only when they apply, no duplicate rules, the state without empty fields, adult preset toggles opt-in).
- **v1.11.1 (2026-09-28):** Bug hunt fixes (`docs/BUGHUNT_2026-09-28.md`): dorm rank past #80, bonds written straight into /Bonds, attendance wording, partial month rollover and time-jump toast, Fortune roll kept across Settings edits, and smaller fixes.
- **v1.11.2 (2026-09-28):** Preset audit: contradictions with the card fixed, stale text (DnD rolls, checks for OFF toggles, phone calls) removed, duplicate rules merged; the preset is ~1,000 tokens smaller per message.
- **v1.11.3 (2026-09-28):** VectFox check: the cleaning pattern keeps the in-world date in every form the narrator writes it (Year 2 included), rule 503 asks for the year from Year 2, and the VectFox guide matches the owner's settings and VectFox's source.
- **v1.12.0 (2026-09-29):** Missed reports (`planning/DRAFT_missed_reports.md`): the engine derives what the narrator often forgets (sleep from a skipped night, the Bag after a used item, an unlogged Points change, summons and sustained effects kept in step) and `<now>` reminds it once of the rest (an unnamed injury, an item that left the Bag, an uncharged spell, an uncounted talk, a skipped hour, and more); documentation brought back in step.
- **v1.13.0 (2026-09-29):** The map follows the calendar: an event map while the event is on (Star Night first, the owner's magical-lit map), then a season map, then the default; card crops follow it.
- **v1.13.1 (2026-09-29):** The Academy Bazaar's traders from abroad come from the five nations, each with its approved trade; an event map always beats a season map; the img2img prompts for 3 season maps and 8 event maps are in `planning/DRAFT_event_maps.md`.
- **v1.13.2 (2026-09-29):** The event maps' visual lore is canon (owner-approved [?1]–[?7]): the Elder Oak clearing stays green in winter, visible wards on the Warding Rite night, deep blue and gold royal banners and a moored airship on Crowning night, flickering wards and no birds in the Thinning, the circus's crimson-and-cream tent, the Bazaar nations' colours, the green-lit haunted corridors.
- **v1.14.0 (2026-09-29):** Lore follows the calendar: 26 places carry a line for the current season (the Old Hut snowed in, sledding on the Hills, the steaming pool, the Viridian oak through the year), exam-week and pre-break lines print only while they apply, the Map's location cards show the season's line; the map prompts use the default map as Summer.
- **v1.14.1 (2026-09-29):** Graduation gains a winter farewell: a market of stalls in the Main Courtyard, dorm snowmen when it snows, the Farewell Pine hung with ribbons for the graduates, and their airship moored above the Grassy Field; a Graduation map prompt joins the event maps.
- **v1.14.2 (2026-09-29):** The Graduation market spills into Founder's Park: more stalls, snowmen and a small stage by the statue where the Music Club plays; the Graduation map prompt shows it.
- **v1.14.3 (2026-09-29):** All 13 maps are live: Spring, Autumn and Winter plus ten event maps, pinned to assets commit e64b4b1; `process_assets.py` no longer overwrites the pinned commit or the map list.
- **v1.14.4 (2026-09-29):** The fixed Independence Day map is live (assets commit 1ece91e); the Crowning night lore follows it: fireworks over the lake beyond Willow Island, the airship beyond the Menagerie and the Gymnasium.
- **v1.15.0 (2026-09-29):** Grades and exams with real effects (`planning/DRAFT_grades_exams.md`): the engine marks every subject A–F at each exam (preparation, attendance floor, skips, condition on the day, training, four bond rewards, story shifts); marks set the dorm rank and exam reputation, an A pays for tutoring and adds +10 to Fortune in its field, an A or B warms its teacher, an F brings a remedial.
- **v1.15.1 (2026-09-29):** Formal events open and close with the Headmaster's and Vice Headmaster's speeches, and every feast begins with them; the far grounds (Lake, Grassy Field and Hills, Forest) are as far as the owner describes, not as close as the map draws them, and no lore calls separate buildings "beside" each other any more.
- **v1.15.2 (2026-09-29):** Remembrance Day opens with speeches from the Headmaster, the Vice Headmaster and Acting Warden Rei before the lantern release (Rei dislikes ceremonial speeches but gives one as the Warden's duty), and Crowning Day with the Headmaster's and Vice Headmaster's speeches before the airship.
- **v1.16.0 (2026-09-29):** Ambience: how crowded and how lit each place is (the sun follows real-life seasons), a sensory cue type, small seeded moments around {{user}} and, rarely, a secret moment from one of 17 ghost stories (ten new; Tilly knows them all); Features Off / Texture / Full.
- **v1.16.1 (2026-09-29):** Audit Batch 1 (`planning/AUDIT_2026-09-29.md`): club names are matched loosely so Saturday club time counts, a used item needs the item, happenings never repeat within two days, one rule for "this NPC is away", the engine rolls back a failed update and says so, `<current_state>` shows only the latest `_Log` lines, an OOC answer has no update block, `tools/build_all.py`, a local git repository.
- **v1.17.0 (2026-09-29):** Audit Batch 2 (tokens and preset): each run of "[…]" messages is sent as one line, the Price Guide lists only the shop {{user}} is at (plus canon prices and one line per other shop), `<current_state>` shows absent people's bonds briefly, the preset Bridge's Eldrasil rules live in rule 504, random events only from the card's sources, inline graphics and coloured dialogue opt-in, a lore-at-depth TEST card for cache testing.
- **v1.18.0 (2026-09-29):** Audit Batch 3: quiet-week Dove attention, named reputation deeds, shop price and injury/curfew reminders, Known_by ↔ Knows, commitments in May be here, and one engine feature gate map.
- **v1.19.0 (2026-09-29):** Audit Batch 4: shared calendar and timetable data, event-tagged exam/trial moods, smaller per-message state, test index and lint. PNG and Cast Sheet performance measured without compatibility-risk changes.
- **v1.20.0 (2026-09-29):** Audit Batch 5 (the last): the engine runs as a list of steps with save migrations in one place, run once per version change; behaviour unchanged (proven against 1.19.0), except Dante's renamed gift now sticks on pre-1.3.x saves.
- **v1.21.0 (2026-09-29):** UI overhaul 1 (foundation): one set of colour tokens for panels and bracelet, a slate-blue and brass palette, the Alegreya family instead of Cinzel, six text sizes, panels anchored to the top, AA contrast in every theme.
- **v1.22.0 (2026-09-29):** UI overhaul 2 (the bracelet): pewter band, brass bezel around the glass clock, dorm gem and crest, vials, three chip tiers, mood badges on portraits, a joined row of panel buttons (a 3-column grid on phones).
- **v1.23.0 (2026-09-29):** UI overhaul 3 (panels): People cards with rank medals and meters, the Dossier as a file beside a matted portrait, theme pictures and feature switches in Settings, numbered Builder steps, a dense club directory.
- **v1.24.0 (2026-09-29):** Map: zoom kept between openings, labels and header crops no longer cut off, places behind gates (Willow Island, Clearing, Observation Tower, Old Hut, Mall shops, castle halls), lore and rumours shown only once heard (overheard via ambience or named in the narration), "Create your student" on the collapsed bracelet.
- **v1.24.1 (2026-09-29):** Map gates on the far grounds only: the Fishing House joins Willow Island behind the Boathouse; Mall shops and castle halls visible from the start again.
- **v1.24.2 (2026-09-29):** Lecture Halls, Study Rooms and lockers on each year's floor (2, 3, 4) on the Map and in the Campus Map lore; the mouse wheel zooms the map.
- **v1.24.3 (2026-09-29):** Year floors named plainly on the Map (First-/Second-/Third-year Lecture Halls, Study Rooms, Lockers); the engine writes every year-floor wording as "<place> — Floor N", and `<now>` names the class floor.
- **v1.25.0 (2026-09-30):** Red "new" dots on the bracelet buttons, panel tabs, people just met and Map markers with a story heard; "seen" kept in Tavern Helper's chat variables.
- **v1.27.0 (2026-09-30):** Batches 2–3: six proficiency stats and Studies hexagon, weekly XP and Fortune bonuses, location-based Practice with validated `/Practice` reports.
- **v1.28.0 (2026-09-30):** Batch 4: Fortune-based magical crafting, handmade Bag items and effects, foraged reagents, repair/enchant, and capped Apothecary sales.
