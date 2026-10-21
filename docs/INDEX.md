# Task index: what to read for a task

Read this file, find the task below, then open **only** the files and symbols it names. Find a symbol with Grep
(`function stepBonds`, `PANELS.map =`, `def apply_dynamic_lore`) and Read about 150 lines from there; never read a whole large
file (the engine template is about 6,000 lines, the UI template 1,800; CHANGELOG, TEST_CHECKLIST, lore). Line numbers drift,
symbol names do not.

Rules that always apply are in `CLAUDE.md`. Established decisions are in `docs/DECISIONS.md`: read only the section for your area.
Build order, generated files and test commands: `docs/BUILD.md`. **Every feature, with its code, data, toggle and tests:
`docs/FEATURES.md`** (grep it; this file keeps the workflows and the maps).

## 1. Tasks

| Task | Read | Then |
|---|---|---|
| A feature idea or recommendation, "does X exist?", or how one feature works | `docs/FEATURES.md`: grep two or three keywords, or read its section; the whole file only to recommend features | build on the system it names (memory `reuse-existing-systems`) |
| Engine bug (a number, a rule, a reminder in `<now>`) | the feature's line in `docs/FEATURES.md`, then §2 engine map → the one step | `gen_engine.py`, the feature's `T:` suites |
| A constant or small rule several runtimes use (class periods, exam months, seasons, trips, dorm colours, class role, Council remedial, Trust/Tension bands, NPC status, place and item keys, seeded draws `rollTable` / `pickOf` / `roll100` / `rollInt`) | `src/scripts/shared.js` (data: `data/calendar.json` `periods`, `exam_months`, `seasons`, `dorm_colors`, events' `trip`); `tools/common.py` `shared_js()`, `fill_data()` (`{@file.path}` in texts) | rebuild; `test_one_source_v1430.cjs`; a refactor: `ENGINE_DIFF` + `tests/snapshot_render.cjs` |
| Engine refactor | §2; `tests/harness.cjs` `diffEngine` | tests with `ENGINE_DIFF=<old engine.js>` must stay identical |
| Save compatibility / field rename | `stepMigrate` (engine), `tests/test_saves.cjs`, `tests/fixtures/make_save.cjs` | a flagged migration in `stepMigrate`, never inside a step |
| State shape (new field) | `src/scripts/schema.js` (§3), the step that writes it, `data/features.json` if switchable | declare every field (Zod strips unknown keys) |
| Make a feature switchable | `data/features.json` (`paths` parked when off, `unlock`), `stepFeatures`, EJS gates `on('id')` in 502/504/505, `ui.template.js` `featureOn` | `tools/feature_cost.py` measures it |
| What the narrator is told (rules) | §4 custom entries: 502 update rules (a core line per topic), 511 rule cards (`data/rule_cards.json`, engine `ruleCards`), 504 narration rules, 505 `<now>` | EJS gates `on('id')`; `gen_mvu_entries.py` |
| `<now>` / Cast Sheet / Price Guide text | `src/worldbook/custom/505.template.ejs` (the rule lines are the engine's `nowOf`, `$ui.now`), the Cast Sheet `509.template.ejs` (head), `509_sheet.template.ejs` (one entry per NPC, uid 600+, `@@if`), `509_tail.template.ejs` (599), `506.template.ejs` | never edit `content/*.txt`; render an entry as ST does with `tests/harness.cjs` `renderEntry` |
| UI panel or bracelet | §5 UI map → the part file or `ui.template.js` symbol | `gen_ui.py`; `tests/preview/` for a visual check |
| Lore not reaching the narrator (keywords, World Index, WI budget) | `merge_lorebooks.py` `KEY_ADDS`, `CORE_FACTS`, `lore_activation`; DECISIONS §9 "Lore activation", §11 World Info facts | `test_lore_activation_v1350.cjs` |
| Lore text (a place, an NPC line, the calendar) | §6 lore pipeline → `tools/merge_lorebooks.py` `rep()` edit or its tables | `python tools/build_all.py --lore` |
| Calendar, events, timetable | `data/calendar.json` (1.81.0: every event has a unique `id` and a `kind`) | engine, UI, lore 131/134 all read it |
| Event frame: event chances (1.81.0) | `data/event_frame.json` (`chances` by event id); engine `stepEventChances`, `chanceMet`, `chanceOpen`, `eventBlocks`; UI `p40:acEvent`; 505 Event line | `gen_engine.py` checks events, places, Fields, actions, deeds; `test_event_frame_v1810.cjs`; `planning/DRAFT_event_frame.md` (releases A2–E) |
| New NPC | `docs/DECISIONS.md` §2 "Bonds", §6 "Tension", "Trust", "Connections"; data files in §7 marked *per NPC* | playbook in `docs/BUILD.md` §4 |
| Incoming first-year cohort | `data/cohorts.json`, `merge_lorebooks.py` `COHORT_*`, `source_original/npc_lore_cohort2_*` or `npc_lore_cohort3_*` as the pattern | playbook in `docs/BUILD.md` §4 |
| New NPC on campus from the start (staff) | `source_original/npc_lore_staff_2026-10-01/` (`lore_staff.md`, `lore_staff_additions.md` with `year: 1`), `merge_lorebooks.py` 1.33.0 block (roster 97, `STAFF_REGULARS`) | playbook "Add an NPC" in `docs/BUILD.md` §4 |
| Shop prices, items, gear effects; event stalls (1.81.0: `ev`, `day`, `from`, `to`) | `data/shop.json`, `tools/common.py` `effect_text` | `gen_mvu_entries.py` (`PG.ev`), `gen_engine.py` (`STALLS`, `stallOpen`), `gen_ui.py` |
| A new outside area | `docs/FEATURES.md` §12 "Outside areas, one module"; one existing area's data file and suite as the pattern | the area's own suite and `test_audit_batch4_v1460.cjs` |
| Look at a map image, or write a prompt for a new map | `Maps/halvard_<season>[_<event>].webp`: local copies of every campus map variant (open one with Read; the style reference for new maps), and approved outside maps (`Maps/grand_vast_forest.webp`, `Maps/avalon.webp`). Prompts and the shared style block ("GAYA UMUM"): `planning/MAP_PROMPTS_outside_maps.txt` | live copies are in the assets repo; portraits are in `image_generation/` (not committed) |
| Preset | `presets/edit_preset.py` (RF 2.2.1.3 Realistic Gemini BOLT from `presets/original/` as it ships, then the D/P/O/E edits: card deviations, pointer fixes, owner's toggles, Eldrasil prompts; the NPC Thoughts block and its regexes, styled by `thoughtsCss` in `ui.template.js`); how RF works and why each deviation: `docs/ECOSYSTEM.md` preset section, `audit/AUDIT_2026-10-14_1_preset_RF2213.md`; card-vs-preset test in `CLAUDE.md` | never edit the output JSON; `build_all.py --preset`; `test_preset.cjs` fails on any difference from upstream outside the list |
| Token cost | `node tests/token_audit.cjs`; the rule entries 501–512 | |
| Character drift in a real chat | `tools/audit_chat.py`, `data/voice_rules.json` | |
| VectFox: what it is, how EventBase works, its settings and the card's extraction prompt | `docs/ECOSYSTEM.md` VectFox (read this instead of VectFox's repository), `src/vectfox/vectfox_eventbase_prompt.txt`, `src/vectfox/vectfox_cleaning_patterns.json` | `test_narrator_batch6_v1570.cjs`, `test_memory_batch1_v1610.cjs` (patterns) |
| Memory in a real chat or a long synthetic one: what each memory list wrote, kept and lost, 501 tokens, state size, file projection; a VectFox export's health | `tools/audit_chat.py --memory` (`memory`, `memory_md`, `projection`) and `--vectfox` (`vectfox`, `djb2`), `tools/replay_chat.cjs --memory`, `tools/memory_lists.cjs` (`LISTS`, `memDiff`, `memEnd`, `tok501`: add a new list or archive here), `tests/stress/memory_soak.cjs` (`BUDGET`, `RATE`: add each new memory invariant); baseline `audit/AUDIT_2026-10-05_2_baseline_memori.md` | `test_memory_tools_v1611.cjs` |
| Narrator mechanics in a real chat | `tools/audit_chat.py --mechanics` (`block_stats`, `DID`, `FIX`), `tools/replay_chat.cjs` (replays the blocks through the current engine); baseline `audit/AUDIT_2026-10-04_2_baseline_mekanik.md` | `test_mechanics_audit_v1531.cjs` |
| MVU update mode: one-call by default (1.69.0), extra-model optional; which entries each model gets, switching, the A/B test | entry tags in `tools/gen_mvu_entries.py` / `merge_lorebooks.py` (D2), 507 `[config_override]`; DECISIONS §9, §11; `docs/PLAYER_GUIDE.md` §8; `tools/audit_chat.py --compare` (`compare_md`, `mechanics_summary`) | `test_narrator_batch7_v1580.cjs`, `qa_static.cjs` |
| Live SillyTavern check to record, or the owner's playtest results | `docs/TEST_CHECKLIST.md` (the campaign quest log): "Where you are", the act the check belongs to | add it to that quest with the release tag; tick or note results; move "Where you are" |
| Release bookkeeping | `CLAUDE.md` "Every release"; the newest `CHANGELOG.md` entry | |
| Open work, ideas, tunables | `planning/FUTURE_PLANS.md` | |
| NPC brainstorm with another AI, or "is this character already in Eldrasil?" | `planning/NPC_ROSTER.md` only (table first, then the close matches' profiles); `planning/NPC_BRAINSTORM_BRIEF.md` for bond formats | roster: `node tools/make_npc_roster.cjs` (build_all `--lore` runs it) |
| External behaviour (ST, MVU, Tavern Helper, VectFox) | `docs/DECISIONS.md` §11 verified facts first | read upstream source for anything new |

## 2. Engine map (`src/scripts/engine.template.js` → generated `engine.js`)

`runEngine(S, B, text, seedHint, userText)` runs `ENGINE_STEPS` in order. Each `step*(c)` destructures what it reads from the shared
context `c` and ends with `Object.assign(c, {...})` for what later steps use. S = state after the reply, B = before. The comment
above each step keeps its old section number (other code and docs still say "section 8l").

| Step (section) | Does | Main data / later readers |
|---|---|---|
| `stepSetup` | shape fill, `log`/`jnl`, `$ui` defaults, `hasB`, `fromVer` | |
| `stepMigrate` | save migrations, once per version change, on S and a copy of B | flags `repv`, `bondv`, `tenv` |
| `stepGuards` (0) | read-only fields, player-tool edits, club name, Builder record restore, Mana_max/Stamina_max revert | `$ui.file` |
| `stepFeatures` (0b) | parks features that are off, `OFF`, `$ui.on`, old-lorebook warning, `REPORTED` | `data/features.json` |
| `stepTime` (1) | clock, rollover (1.42.0: a Day one or two back is a slip), a stale Trip ended, `_Event_today` day plan, birthday, `absA`/`dayNo` | `data/calendar.json` |
| `stepWeather` (1b) | season, sky, wind, °C, forecast; clear on calendar `fair` days (`wxRollDay`) | `wxDay`, `wxForecast`, `data/calendar.json` |
| `stepMagic` (2+3) | casts, mana regen, pacts/summons (a first lesser Spirit Pact in play, 1.31.0), sustained effects, Arcane scholar discount | `data/wind_casting.json` |
| `stepPurchases` (3b) | 1.45.0: `/Purchases`: listed price at a shop that sells it in season, else the narrator's story price; points on campus, coin away; pays through `ledger`, fills the Bag (`bagGive`) or applies an item Used at once; refusals in `_Log` | `data/shop.json` (`SHOP_PRICE`), stepRest's used items |
| `stepRest` (4) | sleep and rest, restful places (`restMult`, `$ui.rest`), sleep debt, used items (`/Consumables`) | `data/restore_places.json` |
| `stepExposure` (4b) | Soaked / Chilled / Overheated, head cold, crafted Consumables healing | |
| `stepExpedition` (4c) | 1.38.0: the Expedition in the Grand Vast Forest: walks (stamina, owed hours), search hours and their seeded rolls (target, signs, beasts, Wendigo), the catch guard, the result (Journal, Creature Studies shift) | `data/expedition.json`, `$eng.area.forest`, `$ui.area.forest` → 505, lore gate, Map |
| `stepCapital` (4d) | 1.39.0: Avalon: walks and hire carriages (stamina, owed minutes, the Crowning Day crowds), the White Line's report, the Crowning Day muster, the hourly seeded city life (pickpockets, processions, street sights, other academies' students, Tsubaki lost, scouts, Rookery raids), the day-before coin reminder | `data/avalon.json`, `$eng.area.avalon`, `$ui.area.avalon` → 505, lore gate, Map |
| `stepAirship` (4e) | 1.40.0: aboard the airship: the bathing stalls end Soaked and Chilled, the hourly seeded sky / stage / hold, the view and the cargo, the landing countdown; outside a flight, whether one leaves within 90 min (`soon`) | `data/airship.json`, `$ui.area.airship` → 505, lore gate, Map |
| `stepSunreach` (4f) | 1.41.0: Sunreach Bay: walks, carriages, water taxis and the tour boat (stamina, owed minutes), bets at The Golden Tide, the hourly seeded city (street sights, hustlers, students of other academies and of Halvard by `meet`, the sea, the Leviathan once a Trip), today's schedule, the day-before coin reminder | `data/sunreach.json`, `$eng.area.sunreach`, `$ui.area.sunreach` → 505, lore gate, Map |
| `stepCampus` (4g) | 1.47.0: the campus as an Area: a move between two campus places walked the shortest way on the Campus Map (floors, the own dorm's shared rooms), owed minutes, stamina on a long walk, the walks from here | `data/campus.json`, `$eng.area.campus`, `$ui.area.campus` → 505 |
| `stepVitals` (5) | 40-HP cap per event unless `Lethal_flag`, death, clamps, mana rounding, Formidable | |
| `stepReputation` (5b) | Rep XP and levels, named deeds; 1.44.0 competition results (deeds, the title's price `$eng.comp`, `teamBond` for stepBonds); exports `repAdd`, `repLv`, `weekNo` | `data/reputation.json` (`competition`) |
| `stepFortune` (5c) | seeded d100, Rank 10 suspension | |
| `stepSchoolWeek` (5d) | attendance (and per-subject classes held; 1.33.0 free periods are not held), today's free periods (`$ui.free`), weekly recap, small scenes, study and exams (mark formula) | `TIMETABLE`, grades, `data/free_periods.json` |
| `stepNamesInProse` (6a) | names revealed by the prose | `NAME_RX` |
| `stepPromises` (6-) | 1.49.0 (feature batch 1): favours kept (a `help` interaction, the Item from the Bag) or overdue (Tension once), a `/Practice` study session with someone present as a `study` interaction, group assignments (Project Kind assignment: study time, skipped class, partners' Tension); before the bonds so they land through its rules | `$eng.promise`; `data/initiative_asks.json` `favours` |
| `stepBonds` (6) | XP, ranks, gates, gifts, rewards, Tension/Trust (1.59.0: `letdown` / `offence` interactions sized from `trust.json` `letdown` and `tension.json` `offence`, `test_narrator_batch8_v1590`), rival teams off Halvard's grounds; exports `canon`, `npcAway`, `PACE` | bond data §7 |
| `stepBondMemory` (6c) | Knows, Imprints, Mind, Next, betrayal spread | |
| `stepProficiency` (6a) | six stats, XP sources, weekly caps, Practice, crafting, masterwork Projects, Apothecary sales, mastery perks (1.44.0: Encyclopaedic's lead, `recordsLead`); 1.81.0: hands `c.profGain` and `c.practiced` to the event chances | `data/practice.json`, `club_stats.json`, `crafts.json` |
| Breaks and Secret Fools Day (1.83.0) | shared.js `breakOf`, `breakStays`, `breakStaysNow` (whereabouts `gone`), `foolsDraw`; engine `breakAwayIn` (in `npcAwayIn`), `homeSpan` / `homeLine` (stepRoutine, routineStart), the sale in `stepPurchases`; `$ui.ev` `stay`, `fools`, `sale` | `data/event_frame.json` `breaks`, `fools`; `data/calendar.json` `sale`; `tools/common.py` (SH.breaks, PD.ct) |
| `stepKingdom` (5a, from `stepContest`) | 1.84.0: the Kingdom Competition's three rounds (`$eng.kc` while {{user}} is on the team, else computed whole from the seed): reports (`kcReports`), Halvard's rooms (`kcPlace`), the ticks (`kcAdvance`: `kcR1Tick`, `kcR2Tick`, `kcFinal`), Placement and Status, the World pick after the week, `$ui.kc` and the `$ui.contest` lines (`kcPublish`); `kcOpen` (stepTime) opens the round grounds | `data/event_frame.json` `kingdom` (→ `PRESENCE.ct.kingdom`, with the rival teams), `data/avalon.json` kc places, `sh:kcTeams` |
| `stepAcademy` / `stepTally` (5a, from `stepContest`) | 1.87.0: the Academy Competition (shared.js `academyQualifiers` → `academyTeams` → `academyContest`; {{user}}'s matches from `Academy R<n>:` Results, off-screen play, Placement and Status, `$ui.contest` lines, the Journal's winner once in `$eng.tally.academy`) and the tally format at Sports Day's and the Showcase's close (`eventTally`, `tallyOf`, `$eng.tally`, `$ui.ev[].tally`); UI `p40:academyBlock` |
| `stepContest` / `stepVote` (5a) | 1.82.0: the Dorm Competition (entry, {{user}}'s bouts from Competition.Results, off-screen bouts, Placement and Status, `$ui.contest` lines for 505, `c.contest` for Fortune) and the Club Festival coin vote (`$eng.vote`, `club_festival_win`); the brackets are shared.js `dormContest` | `data/event_frame.json` `contest` (via `tools/common.py` `contest_data` → `PRESENCE.ct`, `DATA.presence.ct`) |
| `stepHunt` (6a3) | 1.86.0: Founder Day's treasure hunt: the year's chain (shared.js `huntStops`, `D/event_frame.json` `hunt`, places with lore from `tools/common.py` `contest_data`), a clue solved at its place within the hours when the reply speaks of it (Clue + Mystery thread), `founder_hunt` once a campaign, the prize line; `$eng.hunt`, `c.hunt` → `$ui.ev[].hunt` (505, `p40:acEvent`) |
| `stepEventChances` (6a2) | 1.81.0: event chances done this reply (`chanceMet`: place, hours, time there across replies `$eng.chance.$here`, words, Practice, deed, Trip), once a year in `$eng.chance`; the 1.26.0 event XP mark counts as done (`chanceDone`); rewards through `c.profGain` or a Recent moment | `data/event_frame.json` |
| `stepTraining` (6b) | Mana pool / Stamina sessions gathered by `stepProficiency` (`c.sessions`: `/Practice` Track entries, the old `/Training`, Practice actions that train; 1.45.0); `trainRoom`, `trainAdd`, `trainJump`, `unfitToTrain`, `r4Partner` (the one Rank 4 partner rule for mana, stamina, study) are module functions | `data/training.json`, `rank4_partners.json` |
| `stepPerkUse` (6c) | one-use perks | `_Perks` |
| `stepHidden` (7) | Dove attention, hidden magic, Points without Transactions | |
| `stepPayout` (8) | monthly payout | |
| `stepLoreChanges` (8b0) | 1.60.0: lasting changes to the world's facts (`Campus_State.Lore_changes`): kept only with a Cause and only when the reply or the player's message names the subject (`LORE`, `lcKey`, `loreUidOf`, `proseOf`); 2 new a reply, 40 on record; never Replace for a person; the narrator's removal put back; 1.77.0 `Until` ends a change after its last day (`$abs`, agenda kind `lore`); Journal line and toast; Location_changes folded in | `tools/common.py` `lore_names`, gen_engine `LORE_NAMES`, build_card `LORE_OPEN`, 501, 509 sheet `cLore`, Journal `lcHtml` / `data-lcundo`, `test_lore_changes_v1600` |
| `stepRecords` (8b) | Commitments, Notices, Letters (letters home and their parcel, `$eng.home`), Clues, Journal, Heals_by | `data/letters_home.json` |
| `stepClubLife` (8c) | club, competition (Kingdom prize; 1.33.0 Dorm bracket prize), projects, trip; 1.75.0 `stepFounding` (the club {{user}} founds, `CLUB_FOUNDING`) | `data/rule_cards.json` (`founding`) |
| `stepNewYear` (8e) | new campaign year, cohorts | `data/cohorts.json` |
| `stepGraduation` / `stepGraduateRewards` (8d, 8d2) | third-years leave; their rewards end | |
| `stepInitiative` (8e) | optional NPC-initiated contact; 1.49.0 some days a favour (`$ui.initiative.favour`, `FAVOURS`) | `data/initiative_asks.json` (`favours`) → 505 |
| `stepClubWork` (8f) | 1.90.0: club work for the campus: the Academy Newspaper's issue (`$eng.paper`, results from `cwNews`), the club stalls open here, `<now>` lines (`$ui.cw`); the stall test `stallOpen`/`cwCond`, the snow on walks `snowSlow` (in `stepCampus`) | `data/club_work.json`, `data/shop.json` rows with `club` |
| `stepHooks` / `stepGossip` (8f, 8g) | story hooks; rumours | |
| `stepRoutine` (8g2) | 1.50.0 (feature batch 2): the routine week. Arms a player-tool `$ui.plan.run` (`routineSpan`: end Sunday 20:00, stoppers; `routineMoments`; `routineLine` → `$ui.routine`, printed by 505); after the routine reply, its Journal recap. The run itself: `routineStart` (end of `stepGuards`: clock, sleep, reports dropped), `routineSchool` (`stepSchoolWeek`), `routineProf` (`stepProficiency`), training through `c.sessions` | `$ui.plan`, `$ui.routine`; Planner `rpSection` in `30_notebook.js` |
| `stepBag` (8h) | Inventory merge, caps, Sunfizz, clearing bloom wilt | `data/shop.json`, `crafts.json` |
| `stepCampusEvents` / `stepExtras` / `stepCast` (8j, 8k, 8i) | campus events; 1.81.0 today's events → `$ui.ev` (day n of m, now / next from `eventBlocks`, open chances, `stall`); invented characters; who gets a Cast Sheet | `$ui.cast` → 509, `$ui.ev` → 505, 506, bracelet, Event tab |
| `stepReminders` (8l) | "missed report" reminders for `<now>` | `$ui.missed` → 505 |
| `stepAmbience` (8m) | crowd, light, cue, beat (1.24.0: overheard lore, `hearLore`; 1.51.0: a pair moment, `pairLine`), uncanny moment; 1.51.0 the trace beat (`$ui.amb.trace`) at a place an open thread's Clue names | `data/ambience.json`, `PLACE_LORE` |
| `stepAgenda` (8n) | 1.44.0: the Agenda: one status for Commitments, Hooks, Next plans, Projects, Notices and the letter home (`anchorWhen`, `agendaState`, `agendaWhen` = `$eng.agenda.when`; 1.53.0 `absWhen` writes a plain date back as the calendar date), one reminder per change, the coming-up feed `$ui.agenda` | Planner, Notice Board, bracelet, `<now>` "Coming up" / "Due soon" |
| `stepHere` (8o) | 1.47.0: whereabouts: who is likely around {{user}}'s place now (`$ui.here`, the class line) and "May be here" (`$ui.maybe`: Next plans, appointments) from `shared.js` `whereabouts` / `presenceAt` | `data` via `presence_data`; `<now>` |
| `stepUi` (9) | discovered places (+ "Castle"), lore named in the narration (`$ui.lore`), unlocks, Next chip (an appointment from `$ui.agenda` when sooner) | bracelet |
| `stepCommit` (10) | `$eng.abs`, Year 1 date labels, `_Log` | |
| `stepNow` (11) | 1.48.0 (audit 3.11): `<now>`'s rule lines, `nowOf(S, moods)` → `$ui.now` { area, pres, walk, amb, moods, bond, trust, tension, recent, banter, looks (1.77.0, `LOOK`) }; then drops the areas' walks (diet) | `tools/common.py` `now_data`; 505 prints them; `NOW_DIFF` in the harness |

Module helpers above `runEngine`: name matching (`formRx`, `speakersIn`, `mentionIn`), time (`parseWhen`, `whenText`, `periodOf`,
`curfewOf`, `nextUp`), happenings (`happeningOn`), weather (`wxDay`, `wxForecast`, `fluOn`), `canonLocation` (with `yearFloorLocation`), `canonClub`, `gearOf`,
`parkOff`, Tension/Trust profiles. Mood and gifts: `src/scripts/mood_gifts.js` (inlined by `gen_engine.py`). After the steps:
`collapseTrimmed` (the "[…]" prompt hook) and the MVU event handler with the rollback on error.

## 3. State (`src/scripts/schema.js`)

Top-level keys: `World`, `Scene`, `Player`, `Magic`, `Hidden`, `Bonds`, `Campus_State`, `Extras`, `Commitments`, `Notices`, `Letters`,
`Competition`, `Projects`, `Trip`, `Journal`, `Clues`, `Mysteries`, `Battle`, `Inventory`, `Hooks`; the per-reply report lists
(`Interactions`, `Rep_events`, `Training`, `Perk_use`, `Exam_events`, `Tutoring`, `Consumables`, `Exposure`), which the engine empties;
`_Perks`, `_Log` (engine-written, AI-visible); `$ui` (UI state), `$eng` (engine internals). `_` = AI sees, engine writes; `$` = hidden.
The starting state is custom entry 500 (`src/worldbook/custom/content/500.txt`).

## 4. Worldbook custom entries (`src/worldbook/custom/`)

| uid | Entry | Source |
|---|---|---|
| 500 | `[initvar]` starting state (disabled) | `content/500.txt` |
| 501 | `<current_state>` (EJS YAML of the state) | `content/501.txt` |
| 502 | update rules `[mvu_update]` | `content/502.txt` |
| 503 | output format, depth 0 | `content/503.txt` |
| 504 | narration rules `[mvu_plot]` | `content/504.txt` |
| 505 | `<now>`: clock, curfew, presence, reminders | `505.template.ejs` (generated `content/505.txt`); its rule lines from engine `$ui.now` (each present person's block, `$ui.now.people`, is printed by their Cast Sheet since 1.56.0) |
| 509, 600+, 599 | 1.48.0: the Cast Sheet: head, one sheet per NPC (`@@if` on `$ui.cast`), tail | `509.template.ejs`, `509_sheet.template.ejs`, `509_tail.template.ejs` |
| 506 | Price Guide by place | `506.template.ejs` |
| 507 | `[config_override]` for MVU (disabled) | `content/507.txt` |
| 508 | {{user}}'s birthday event | `content/508.txt` |
| 510 | last-mile cast gate, depth 0 | `content/510.txt` |
| 511 | rule cards: the full update rule of a topic while it applies, depth 1 before `<now>` `[mvu_update]` | `511.template.ejs` + `data/rule_cards.json` (generated `content/511.txt`); the list is engine `ruleCards` → `$ui.now.rules` |
| 512 | the student alcohol and tobacco rule (keyword) | `content/512.txt` |

Lore entries below uid 500 are generated (`src/worldbook/content/<uid>.txt`); edit them through §6.

## 5. UI map

| File | Contains |
|---|---|
| `src/scripts/ui.template.js` | constants and Builder data (`TEMPLATES`, `PACT_KINDS`), `latestState`, Builder (`renderBuilder`, `b*` steps, `validate`, `buildOps`, `liftReadonly`), `writeToolMessage`, Student file (`renderProfile`, `p*` tabs, `pSettings`, `featureOn`), `pBag` (crafted effects) and `pWallet` used by the Inventory panel, themes, `ensureLorebook`, `open`/`render` |
| `src/ui/parts/10_people.js` | `PANELS.people`, `PANELS.npc` (dossier), Connections graph |
| `src/ui/parts/20_map.js` | `PANELS.map`: `mapFor` (map variants), `locCard`, `walkFrom`; 1.71.0 `pinShown` / `dormDayToday` (other dorms off the map); 1.46.0 `renderArea` (every outside area's tab, `DATA.areas`) |
| `src/ui/parts/30_notebook.js` | `PANELS.notebook`, shown as **Inventory** (1.32.0): Bag and Wallet (`pBag`, `pWallet` in `ui.template.js`), planner, journal, notices, forecast, letters, mystery (1.44.0: `agendaOf` reads `$ui.agenda`; `heardOf` and the pin-as-clue tool) |
| `src/ui/parts/40_activities.js` | `PANELS.activities`, `PANELS.battle`: clubs, competition, shop, projects, trip |
| `src/ui/parts/50_scene.js` | 1.70.0 scene cards under the newest reply: `sceneThoughts` (the preset's `<npc_thoughts>`), `sceneIdOf`, `sceneCard`, 1.71.0 `sceneActions` (the buttons; `data-eld-fill` → `fillChat`, the gift list), `sceneHTML` (pure, tested), `SCENE_CSS`; in the chat: `sceneTarget`, `sceneRender` / `sceneBoot` (MutationObserver), `sceneClick`; wired at the end of `ui.template.js`; the bracelet hides its strip on `__eldrasilScene`; tests `test_scene_cards_v1700.cjs`, `test_scene_actions_v1710.cjs` |
| `src/ui/statusbar.template.html` | the in-chat bracelet (display regex in `src/regex/index.json`); `/*@@SHOP_RX@@*/` (the Shop chip's places) from `gen_ui.py` |
| `src/scripts/shared.js` | 1.43.0: shared with the engine, 505 and 506 (see §1); injected at `/*@@SHARED@@*/`; 1.47.0 its whereabouts section only in the engine and the panels (`shared_js(presence=False)`) |
| `src/ui/news.shared.js` | 1.25.0 red "new" dots: `newsItems` (what can be new), `newsStore` (chat variable `eld_seen`), `newsPanels`; pasted into the bracelet and `ui.js` by `gen_ui.py`; the panels write it (`newsInit`, `newsMark`, `isNew` in `ui.template.js`) |

`tools/gen_ui.py` joins template + parts + `data/*` into `ui.js` and builds `statusbar.html`. Colours are tokens (1.21.0): the `.ov{…}` block
at the top of the CSS and `:root{…}` in the bracelet; a theme is a set of token values in `tools/make_themes.py` (then `gen_ui.py`).

## 6. Lore pipeline

`source_original/` (owner's v38 + NPC lore passes; canon, never edited) → `tools/merge_lorebooks.py` → `src/worldbook/` (card) and
`dist/lorebook_v39/` (standalone) → `tools/curate_data.py` → `data/npcs.json`, `locations.json`, `relations.json`, `map_pins.json`.
In `merge_lorebooks.py`: `rep(entry, old, new)` (asserting text edits), `apply_lore_edits`, `WORLD_MYTHS`, `NATIONS`, `SEASONAL` and
`PHASES` (lore by season), `GHOST_STORIES`, `COHORT_ROSTER` / `COHORT_REGULARS`, `calendar_timetable_lore`, `roster_ejs`, `lore_activation` (1.35.0: `KEY_ADDS`, `CORE_FACTS`).

## 7. Data files (`data/`)

Hand-written single sources (edit these): `shop.json`, `happenings.json`, `calendar.json`, `event_frame.json` (1.81.0), `features.json`, `tuning.json`,
`ambience.json` (1.31.0: `lore_places`), `restore_places.json` and `letters_home.json` (1.31.0), `free_periods.json` (1.33.0), `mastery.json` and `public_roles.json` (1.43.0), `expedition.json` (1.38.0), `avalon.json` (1.39.0), `airship.json` (1.40.0), `sunreach.json` (1.41.0), `campus.json` (1.47.0: campus walks), `wind_casting.json`, `assets_manifest.json`, `cohorts.json`, `campus_phases.json` (empty until canon waves).
*Per NPC* (a new NPC needs a row): `bond_rewards.json`, `bond_rules.json` (1.89.0 `layers`), `bond_openness.json`, `info_layers.json` (1.89.0, only where a field is public in the lore), `tension.json`, `trust.json`,
`npc_moods.json`, `gift_prefs.json`, `npc_canon.json` (voices, stages, Rank 8 branch), `rank4_partners.json`, `relations_curated.json`,
`voice_rules.json`, `initiative_asks.json`, `npc_routines.json` (1.52.0; rival teams none), `dialogue_colors.json` (1.37.0; new NPCs via `make_dialogue_colors.py`), `field_overrides.json`, `focus_overrides.json`, `thumb_overrides.json`.
Systems: `reputation.json`, `training.json`, `club_stats.json`, `club_work.json` (1.90.0), `practice.json`, `crafts.json`, `factions.json`, `gift_shops.json`.
Generated (never edit): `npcs.json`, `locations.json`, `relations.json`, `map_pins.json` (curate_data), `themes.json` (make_themes),
`feature_cost.json` (feature_cost). Review lists: `_review_sensitive_flags.json`; `uid_remap_npc.json`, `pins_pct.json` are pipeline data.

## 8. Where history lives

`CHANGELOG.md` keeps the newest releases in detail and a one-line index of all. Older details, implemented drafts
(`planning/DRAFT_*.md`), the 2026-09-29 audit and the 1.3.0 design notes are in git: `git log --oneline -- <path>` then
`git show <commit>:<path>` (all of them exist at commit `b62d182`; the finished 2026-10-03 batch plans
`audit/AUDIT_2026-10-03_3_batch_perbaikan.md` and `_4_batch_fitur.md` at `cb55410`). Code comments that cite a draft or a batch
plan point there.
