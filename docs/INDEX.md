# Task index: what to read for a task

Read this file, find the task below, then open **only** the files and symbols it names. Find a symbol with Grep
(`function stepBonds`, `PANELS.map =`, `def apply_dynamic_lore`) and Read about 150 lines from there; never read a whole large
file (engine.template.js 3,100 lines, ui.template.js 1,500, CHANGELOG, TEST_CHECKLIST). Line numbers drift, symbol names do not.

Rules that always apply are in `CLAUDE.md`. Established decisions are in `docs/DECISIONS.md`: read only the section for your area.
Build order, generated files and test commands: `docs/BUILD.md`.

## 1. Tasks

| Task | Read | Then |
|---|---|---|
| Engine bug (a number, a rule, a reminder in `<now>`) | §2 engine map → the one step; its tests (`tests/README.md`) | `gen_engine.py`, the step's suites |
| Engine refactor | §2; `tests/harness.cjs` `diffEngine` | tests with `ENGINE_DIFF=<old engine.js>` must stay identical |
| Save compatibility / field rename | `stepMigrate` (engine), `tests/test_saves.cjs`, `tests/fixtures/make_save.cjs` | a flagged migration in `stepMigrate`, never inside a step |
| State shape (new field) | `src/scripts/schema.js` (§3), the step that writes it, `data/features.json` if switchable | declare every field (Zod strips unknown keys) |
| What the narrator is told (rules) | §4 custom entries: 502 update rules, 504 narration rules, 505 `<now>` | EJS gates `on('id')`; `gen_mvu_entries.py` |
| `<now>` / Cast Sheet / Price Guide text | `src/worldbook/custom/505.template.ejs`, `509.template.ejs`, `506.template.ejs` | never edit `content/505|506|509.txt` |
| UI panel or bracelet | §5 UI map → the part file or `ui.template.js` symbol | `gen_ui.py`; `tests/preview/` for a visual check |
| Red "new" dots | `src/ui/news.shared.js`, `ui.template.js` `newsInit` / `newsMark` / `isNew` | `test_news_v1250.cjs` |
| Lore text (a place, an NPC line, the calendar) | §6 lore pipeline → `tools/merge_lorebooks.py` `rep()` edit or its tables | `python tools/build_all.py --lore` |
| Calendar, events, timetable | `data/calendar.json` | engine, UI, lore 131/134 all read it |
| New NPC | `docs/DECISIONS.md` §2 "Bonds", §6 "Tension", "Trust", "Connections"; data files in §7 marked *per NPC* | playbook in `docs/BUILD.md` §4 |
| Incoming first-year cohort | `data/cohorts.json`, `merge_lorebooks.py` `COHORT_*`, `source_original/npc_lore_cohort2_*` as the pattern | playbook in `docs/BUILD.md` §4 |
| New NPC on campus from the start (staff) | `source_original/npc_lore_staff_2026-10-01/` (`lore_staff.md`, `lore_staff_additions.md` with `year: 1`), `merge_lorebooks.py` 1.33.0 block (roster 97, `STAFF_REGULARS`) | playbook "Add an NPC" in `docs/BUILD.md` §4 |
| Shop prices, items, gear effects | `data/shop.json`, `tools/common.py` `effect_text` | `gen_mvu_entries.py`, `gen_engine.py`, `gen_ui.py` |
| Bond ranks, rewards, gifts, moods | §7 bond data; engine `stepBonds`, `stepBondMemory`, `mood_gifts.js` | |
| Reputation, training, grades | `data/reputation.json`, `training.json`; `stepReputation`, `stepTraining`, `stepSchoolWeek` (`markUp`, `GRADE_W`, `EXAM_DAY`, per-subject `held`) | `test_grades_v1150.cjs`, `test_mastery_v1300.cjs` |
| Classes, teachers, free periods (1.33.0) | `data/free_periods.json`; engine `teacherOf`, `classRole`, `freeWhy`, `$ui.free`; `curate_data.py` `teaches` (roster attributes "History Y2", "Healing class for every year"); 505 class line; lore 10, 30 (Practical Magic), 131 | `test_classes_v1330.cjs` |
| Proficiency and Practice | `data/club_stats.json`, `practice.json`; `stepProficiency`, `pProficiency`, `acPractice` | `test_proficiency_v1260.cjs`, `test_practice_v1270.cjs` |
| Mastery perks (Rank 5) | `MASTERY`, `profRankOf`; `stepProficiency` (`P.mastery`, `$ui.mastery`), `stepMagic` (Arcane scholar), `stepVitals` (Formidable), `stepBonds` (Consummate: `CONSUMMATE_GROUPS`, `NOBLES`), 504 mastery line, `MASTERY_PERKS` in `ui.template.js` | `test_mastery_v1300.cjs` |
| Malformed update blocks | `recoverPatch`, `patchCommands` and the `COMMAND_PARSED` listener at the end of `engine.template.js`; 503 format rule | `test_playtest_v1301.cjs` |
| Map gates (far grounds) | `gateOpen`, `discovered` in `src/ui/parts/20_map.js`; `data/locations.json` `gate` | `test_playtest_v1301.cjs`, `test_map_gates_v1240.cjs` |
| Crafting (magical and non-magic), masterwork | `data/crafts.json` (`groups`: Practice actions, tools, experts, mishaps; `masterwork`); `stepProficiency` craft helpers and `finishMasterwork`, `stepExposure` heal, `stepBag` bloom, `acPractice` recipes | `test_crafting_v1280.cjs`, `test_crafts_v1290.cjs`, `505.template.ejs`, `506.template.ejs` |
| Weather, ambience, happenings | `stepWeather`, `stepExposure`, `stepAmbience`; `data/ambience.json`, `happenings.json`, `wind_casting.json` | |
| Map, pins, map variants, portraits | `data/map_pins.json`, `assets_manifest.json`, `src/ui/parts/20_map.js` (`discovered`, `mapView` zoom, `loreRow`), `tools/curate_data.py` `FAR_LEGS`, `GATES`, `YEAR_FLOORS` | assets are pinned to a commit (DECISIONS "Assets") |
| Features settings (on/off) | `data/features.json`, `stepFeatures`, `ui.template.js` `pSettings`, `featureOn` | `feature_cost.py` measures it |
| Preset | `presets/edit_preset.py` (numbered sections), card-vs-preset test in `CLAUDE.md` | never edit the output JSON; `build_all.py --preset` |
| Token cost | `node tests/token_audit.cjs`; the rule entries 501–510 | |
| Character drift in a real chat | `tools/audit_chat.py`, `data/voice_rules.json` | |
| Live SillyTavern check to record | `docs/TEST_CHECKLIST.md`: its "Open" list and the newest section only | add a section at the top of "By release" |
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
| `stepTime` (1) | clock, rollover, `_Event_today` day plan, birthday, `absA`/`dayNo` | `data/calendar.json` |
| `stepWeather` (1b) | season, sky, wind, °C, forecast; clear on calendar `fair` days (`wxRollDay`) | `wxDay`, `wxForecast`, `data/calendar.json` |
| `stepMagic` (2+3) | casts, mana regen, pacts/summons (a first lesser Spirit Pact in play, 1.31.0), sustained effects, Arcane scholar discount | `data/wind_casting.json` |
| `stepRest` (4) | sleep and rest, restful places (`restMult`, `$ui.rest`), sleep debt, used items (`/Consumables`) | `data/restore_places.json` |
| `stepExposure` (4b) | Soaked / Chilled / Overheated, head cold, crafted Consumables healing | |
| `stepVitals` (5) | 40-HP cap per event unless `Lethal_flag`, death, clamps, mana rounding, Formidable | |
| `stepReputation` (5b) | Rep XP and levels, named deeds; exports `repAdd`, `repLv`, `weekNo` | `data/reputation.json` |
| `stepFortune` (5c) | seeded d100, Rank 10 suspension | |
| `stepSchoolWeek` (5d) | attendance (and per-subject classes held; 1.33.0 free periods are not held), today's free periods (`$ui.free`), weekly recap, small scenes, study and exams (mark formula) | `TIMETABLE`, grades, `data/free_periods.json` |
| `stepNamesInProse` (6a) | names revealed by the prose | `NAME_RX` |
| `stepBonds` (6) | XP, ranks, gates, gifts, rewards, Tension/Trust, rival teams off Halvard's grounds; exports `canon`, `npcAway`, `PACE` | bond data §7 |
| `stepBondMemory` (6c) | Knows, Imprints, Mind, Next, betrayal spread | |
| `stepProficiency` (6a) | six stats, XP sources, weekly caps, Practice, crafting, masterwork Projects, Apothecary sales, mastery perks | `data/practice.json`, `club_stats.json`, `crafts.json` |
| `stepTraining` (6b) | Mana pool / Stamina sessions (`trainRoom`, `trainAdd`, `trainJump` are module functions) | `data/training.json` |
| `stepPerkUse` (6c) | one-use perks | `_Perks` |
| `stepHidden` (7) | Dove attention, hidden magic, Points without Transactions | |
| `stepPayout` (8) | monthly payout | |
| `stepRecords` (8b) | Commitments, Notices, Letters (letters home and their parcel, `$eng.home`), Clues, Journal, Heals_by | `data/letters_home.json` |
| `stepClubLife` (8c) | club, competition (Kingdom prize; 1.33.0 Dorm bracket prize), projects, trip | |
| `stepNewYear` (8e) | new campaign year, cohorts | `data/cohorts.json` |
| `stepGraduation` / `stepGraduateRewards` (8d, 8d2) | third-years leave; their rewards end | |
| `stepInitiative` (8e) | optional NPC-initiated contact | `data/initiative_asks.json` |
| `stepHooks` / `stepGossip` (8f, 8g) | story hooks; rumours | |
| `stepBag` (8h) | Inventory merge, caps, Sunfizz, clearing bloom wilt | `data/shop.json`, `crafts.json` |
| `stepCampusEvents` / `stepExtras` / `stepCast` (8j, 8k, 8i) | campus events; invented characters; who gets a Cast Sheet | `$ui.cast` → 509 |
| `stepReminders` (8l) | "missed report" reminders for `<now>` | `$ui.missed` → 505 |
| `stepAmbience` (8m) | crowd, light, cue, beat (1.24.0: overheard lore, `hearLore`), uncanny moment | `data/ambience.json`, `PLACE_LORE` |
| `stepUi` (9) | discovered places (+ "Castle"), lore named in the narration (`$ui.lore`), unlocks, Next chip, the next seven days' events (`$ui.soon`, 1.32.0) | `<now>` "Coming up" |
| `stepCommit` (10) | `$eng.abs`, Year 1 date labels, `_Log` | |

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
| 505 | `<now>`: clock, curfew, presence, reminders | `505.template.ejs` (generated `content/505.txt`) |
| 506 | Price Guide by place | `506.template.ejs` |
| 507 | `[config_override]` for MVU (disabled) | `content/507.txt` |
| 508 | {{user}}'s birthday event | `content/508.txt` |
| 509 | Cast Sheet of present characters | `509.template.ejs` + NPC lore |
| 510 | last-mile cast gate, depth 0 | `content/510.txt` |

Lore entries below uid 500 are generated (`src/worldbook/content/<uid>.txt`); edit them through §6.

## 5. UI map

| File | Contains |
|---|---|
| `src/scripts/ui.template.js` | constants and Builder data (`TEMPLATES`, `PACT_KINDS`), `latestState`, Builder (`renderBuilder`, `b*` steps, `validate`, `buildOps`, `liftReadonly`), `writeToolMessage`, Student file (`renderProfile`, `p*` tabs, `pSettings`, `featureOn`), `pBag` (crafted effects) and `pWallet` used by the Inventory panel, themes, `ensureLorebook`, `open`/`render` |
| `src/ui/parts/10_people.js` | `PANELS.people`, `PANELS.npc` (dossier), Connections graph |
| `src/ui/parts/20_map.js` | `PANELS.map`: `mapFor` (map variants), `locCard`, `walkFrom` |
| `src/ui/parts/30_notebook.js` | `PANELS.notebook`, shown as **Inventory** (1.32.0): Bag and Wallet (`pBag`, `pWallet` in `ui.template.js`), planner, journal, notices, forecast, letters, mystery |
| `src/ui/parts/40_activities.js` | `PANELS.activities`, `PANELS.battle`: clubs, competition, shop, projects, trip |
| `src/ui/statusbar.template.html` | the in-chat bracelet (display regex in `src/regex/index.json`) |
| `src/ui/news.shared.js` | 1.25.0 red "new" dots: `newsItems` (what can be new), `newsStore` (chat variable `eld_seen`), `newsPanels`; pasted into the bracelet and `ui.js` by `gen_ui.py`; the panels write it (`newsInit`, `newsMark`, `isNew` in `ui.template.js`) |

`tools/gen_ui.py` joins template + parts + `data/*` into `ui.js` and builds `statusbar.html`. Colours are tokens (1.21.0): the `.ov{…}` block
at the top of the CSS and `:root{…}` in the bracelet; a theme is a set of token values in `tools/make_themes.py` (then `gen_ui.py`).

## 6. Lore pipeline

`source_original/` (owner's v38 + NPC lore passes; canon, never edited) → `tools/merge_lorebooks.py` → `src/worldbook/` (card) and
`dist/lorebook_v39/` (standalone) → `tools/curate_data.py` → `data/npcs.json`, `locations.json`, `relations.json`, `map_pins.json`.
In `merge_lorebooks.py`: `rep(entry, old, new)` (asserting text edits), `apply_lore_edits`, `WORLD_MYTHS`, `NATIONS`, `SEASONAL` and
`PHASES` (lore by season), `GHOST_STORIES`, `COHORT_ROSTER` / `COHORT_REGULARS`, `calendar_timetable_lore`, `roster_ejs`.

## 7. Data files (`data/`)

Hand-written single sources (edit these): `shop.json`, `happenings.json`, `calendar.json`, `features.json`, `tuning.json`,
`ambience.json` (1.31.0: `lore_places`), `restore_places.json` and `letters_home.json` (1.31.0), `free_periods.json` (1.33.0), `wind_casting.json`, `assets_manifest.json`, `cohorts.json`, `campus_phases.json` (empty until canon waves).
*Per NPC* (a new NPC needs a row): `bond_rewards.json`, `bond_rules.json`, `bond_openness.json`, `tension.json`, `trust.json`,
`npc_moods.json`, `gift_prefs.json`, `npc_canon.json` (voices, stages, Rank 8 branch), `rank4_partners.json`, `relations_curated.json`,
`voice_rules.json`, `initiative_asks.json`, `field_overrides.json`, `focus_overrides.json`, `thumb_overrides.json`.
Systems: `reputation.json`, `training.json`, `club_stats.json`, `practice.json`, `crafts.json`, `factions.json`, `gift_shops.json`.
Generated (never edit): `npcs.json`, `locations.json`, `relations.json`, `map_pins.json` (curate_data), `themes.json` (make_themes),
`feature_cost.json` (feature_cost). Review lists: `_review_sensitive_flags.json`; `uid_remap_npc.json`, `pins_pct.json` are pipeline data.

## 8. Where history lives

`CHANGELOG.md` keeps the newest releases in detail and a one-line index of all. Older details, implemented drafts
(`planning/DRAFT_*.md`), the 2026-09-29 audit and the 1.3.0 design notes are in git: `git log --oneline -- <path>` then
`git show <commit>:<path>` (all of them exist at commit `b62d182`). Code comments that cite a draft point there.
