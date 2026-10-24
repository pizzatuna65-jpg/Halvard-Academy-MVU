# Build, test, generated files and playbooks

## 1. Build and test

Requirements: Python 3.10+ (PIL only for `process_assets.py`), Node 18+ (tested on 22), optionally Playwright + Chromium for UI previews.
`node_modules/` and the original portrait PNGs are not in the repo: run `npm install` first. On the owner's Windows machine use `python`
(not `python3`). Keep text files LF.

```bash
npm install                          # zod@4, lodash, yaml, ejs, d3
python tools/build_all.py             # the whole rebuild below in its order (+ --lore / --themes / --preset / --no-test-cards), then node --check
# rebuild (run only the steps whose inputs you changed; order matters)
python tools/merge_lorebooks.py      # lore changed in source_original/  (then re-run curate_data.py)
python tools/curate_data.py         # NPC / location / relation data changed
python tools/gen_engine.py          # engine.template.js, npcs, locations or happenings changed
python tools/gen_mvu_entries.py     # custom entries, locations regulars or shop prices changed
python tools/make_themes.py         # 1.3.1: only when the colour themes change (-> data/themes.json)
python tools/gen_ui.py              # ui.template.js, ui/parts, statusbar.template.html or data changed
python build/build_card.py          # always last -> dist/
python tools/build_test_card.py 7   # optional: dist/test/ TEST card, every bond at Rank 7 (own lorebook name)
python tools/build_test_card_year2.py   # optional (1.7.5): dist/test/ TEST card that starts in campaign Year 2 with varied Year 1 bonds
npm run stress                       # optional (~30 s): fuzz, Builder fuzz, a simulated school year (tests/stress/)
npm test                             # every suite + static QA on the built card (79 suites at v1.20.0)
python tests/preview/smoke_all_panels.py   # optional: opens every panel/tab headless; expects "errors: none"
node tests/token_audit.cjs           # optional: always-on prompt size, before/after a rules change
npm run lint                         # syntax of every script + compile of every EJS entry
ENGINE_DIFF=<old engine.js> npm test # optional: every engine run compared with an older build (refactors)
node tests/snapshot_render.cjs states s.json; node tests/snapshot_render.cjs render s.json a.json   # 1.43.0: every panel, the bracelet
node tests/snapshot_render.cjs diff a.json b.json   # and every EJS entry rendered from fixed states, before vs after a UI/EJS refactor
python presets/edit_preset.py       # regenerates the edited preset from presets/original/ (deterministic; run twice, compare)
node tests/fixtures/make_save.cjs    # BEFORE changing anything in a release: writes the current release's save fixture
node tests/fixtures/make_save_yearend.cjs   # 1.7.4: the same save played to the end of Year 1 (after make_save.cjs)
python tools/audit_chat.py chat.jsonl --out report.md   # optional: character-drift report for an exported chat
python tools/audit_chat.py chat.jsonl --mechanics --no-drift --out report.md   # 1.53.1: how the narrator handled the engine (replays every block)
python tools/audit_chat.py chat.jsonl --memory --no-drift [--vectfox export.json] --out report.md   # 1.61.1: memory kept and lost, VectFox health
python tools/audit_chat.py bundle.json.gz --blackbox --no-drift --out report.md   # Eldrasil Black Box bundle: tokens, cache, cost, prompt parts, saves, engine lines per reply
node tests/stress/memory_soak.cjs 3000   # 1.61.1: memory invariants and budget on a long synthetic chat
```

## 2. Generated files

**Generated files. Never edit them by hand.** Edit the source on the right instead.

| Generated | Source |
|---|---|
| `src/scripts/engine.js` | `engine.template.js` + `shared.js` + `data/*` |
| `src/scripts/ui.js` | `ui.template.js` + `shared.js` + `src/ui/parts/*` |
| `src/ui/statusbar.html` | `statusbar.template.html` + `shared.js` |
| `src/worldbook/*` | `tools/merge_lorebooks.py` |
| `src/worldbook/custom/index.json`, `content/505.txt`, `content/506.txt`, `content/509.txt`, `content/599.txt`, `content/600.txt`… | `tools/gen_mvu_entries.py` (505 from `custom/505.template.ejs`; the Cast Sheet (1.48.0): 509 head from `509.template.ejs`, one sheet per NPC 600+ from `509_sheet.template.ejs` + NPC lore, 599 tail from `509_tail.template.ejs`) |
| `data/feature_cost.json` | `tools/feature_cost.py` (run by `gen_mvu_entries.py`) |
| `data/npcs.json`, `locations.json`, `relations.json`, `map_pins.json` | `curate_data.py` |
| `dist/*` | the build. `dist/` is the one download folder: the card (`Eldrasil_Halvard.png`/`.json`), the preset and the VectFox files; TEST cards in `dist/test/`, the standalone lorebook in `dist/lorebook_v39/` |
| `dist/vectfox_cleaning_patterns.json`, `dist/vectfox_eventbase_prompt.txt` | copied by `build_card.py` from `src/vectfox/` (hand-written; edit them there) |
| `data/themes.json` | `tools/make_themes.py` (1.3.1) |
| `planning/NPC_ROSTER.md` | `tools/make_npc_roster.cjs` (1.32.0; run by `build_all.py --lore`) |
| `dist/Realistic_Frankenstein_2_2_1_3_Eldrasil.json` | `presets/edit_preset.py` (from `presets/original/Realistic_Frankenstein_2_2_1_3_Realistic_Gemini_BOLT.json`) |

## 3. Hand-written single sources

- `data/shop.json` (prices; canon prices are locked; 1.9.5: `gear` / `use` item effects, worded by `tools/common.py` `effect_text()`)
- `data/crafts.json` (1.28.0 magical recipes, material alternatives, crafted effects and sale guides)
- `data/bond_rewards.json`, `data/reputation.json`, `data/training.json` (1.3.0), `data/bond_rules.json` (1.3.1: `start`), `data/bond_openness.json`, `data/tuning.json` (1.3.1 Settings rows)
- `source_original/npc_lore_2026-09-25/` (NPC entries that replace v38's; edit lore there or add a newer pass the same way); `source_original/npc_lore_staff_2026-10-01/` (1.33.0: the new teachers and the lines they add to older NPCs)
- `data/happenings.json` (seeded campus events; `where` must be a real location name; 1.81.0: `ev` = only on that event's days)
- `data/event_frame.json` (1.81.0: event chances by calendar event id; `gen_engine.py` checks every event, place, Field, Practice action and deed)
- `data/field_overrides.json`, `focus_overrides.json`, `thumb_overrides.json`, `assets_manifest.json`
- `data/features.json` (Features settings rows, parked paths, unlocks), `data/npc_moods.json` (44 mood profiles), `data/wind_casting.json` (subtype costs), `data/gift_prefs.json` (tastes and birthdays), `data/gift_shops.json` (Mall shop lore), `data/free_periods.json` (1.33.0: teacher absence chance and reasons)
- `src/worldbook/custom/505.template.ejs` (the Now entry)
- `src/scripts/shared.js` (1.43.0): the constants and small rules the engine, the panels, the bracelet, 505 and 506 share (class
  periods, exam months, seasons, trips, dorm colours from `data/calendar.json`; class role, Council remedial, bands, NPC status,
  place and item keys, the seeded draws). Generators inject it at `/*@@SHARED@@*/` (`tools/common.py` `shared_js()`). A text that
  names a time or number from the data writes `{@file.path}` (`fill_data()`: `:n`, `:day`, `:nextday`, `:clock`, `:pctoff`, `:times`).
  `tests/test_one_source_v1430.cjs` fails if a shared table is copied back.
- `data/mastery.json` (1.43.0: Rank 5 perks, texts and numbers), `data/public_roles.json` (1.43.0: Rank-0 public roles)
- custom entries `500–504`, `507`, `508` (the birthday event, 1.2.0) and `510` (the last-mile cast gate, 1.5.1)
- `src/regex/index.json`
- `src/card/card.json`

## 4. Playbooks

- **Bug hunt.**
  1. Run `npm test`, `npm run stress` and the smoke test. `tests/harness.cjs` applies commands one by one like the MVU zod helper (a command whose result fails the schema is dropped).
  2. Read `engine.template.js` step by step (`docs/INDEX.md` §2).
  3. Write a failing check in a `tests/test_*.cjs` suite (use `harness.cjs`: `initState`, `applyPatch`, `ok`), then fix it.
  4. Areas worth probing:
     - `parseWhen` edge cases
     - year rollover (Month 12 → next year)
     - alias merging of NPC keys
     - Builder amend diffs
     - UI rendering with missing or odd state
     - the unlock conditions
- **Update lore.**
  1. Preferred: the owner provides a new lorebook version. Put it in `source_original/`, point `merge_lorebooks.py` at it, and re-apply the card edits. Its `rep()` asserts show exactly which edits no longer apply.
  2. Then rebuild from `curate_data.py` onward.
  3. For a one-off fix, edit the lore through `merge_lorebooks.py` (a `rep()` edit), not in `src/worldbook/content/`.
  4. Keep `<narrator_only>` secrets out of UI data; `curate_data.py` already strips them.
- **Add an incoming first-year cohort** (the owner's new-first-years lorebook).
  1. Bring the NPC entries in as a lore pass `source_original/npc_lore_cohort<N>_<date>/` (1.7.0 pattern): `lore_cohort<N>.md` with
     the new entries (heading, `uid:`, `keys:`, fenced entry) and `lore_cohort<N>_additions.md` with the lines they add to older NPCs
     (heading, `year:`, fenced lines; `<narrator_only>` for secret ones). `merge_lorebooks.py` reads every `npc_lore_cohort*` folder.
     Portraits and thumbnails as for any NPC (the UI
     shows initials until then).
  2. List them in `COHORT_ROSTER` and their Regulars in `COHORT_REGULARS` (merge_lorebooks.py); the roster's Year 1 line gains them.
  3. Add their ids (first names) to `data/cohorts.json` under the campaign year they arrive (`"2"` or `"3"`). `merge_lorebooks.py` and `curate_data.py` assert that every listed id has an entry.
  4. If a location's Regulars lore text names them, check the wording still works before they arrive (the UI and the Now entry already filter them; plain lore text does not).
  5. Rebuild from `merge_lorebooks.py` onward. `tests/test_bughunt_v103.cjs` already covers the mechanism with a fake NPC.
- **Add a folklore or nation entry** (World Myth, Superstition, Ghost Story, Brand; 1.7.1 pattern; nations: `NATIONS`, `template_from(C[246])`, 1.7.2). Add it to `WORLD_MYTHS` in
  `merge_lorebooks.py` (or a list like it): a free uid, `template_from(C[222])` for the Superstition settings, keys and the text.
  Mention it with one `rep()` line in the entries that should know it exists (WORLD INDEX, the places and classes where it comes
  up), as the brands are mentioned in the Mall and the Main Library. Keep Lucifer and other secrets inside `<narrator_only>`.
- **Add a system topic entry** (magic, world, academy rules; 1.35.0): give it the plain words a player would say as keys (regex keys
  `/\bwords?\b/i` for plurals) in `KEY_ADDS`, and a one-line summary in `CORE_FACTS` (both in `merge_lorebooks.py`); add its uid to
  `TOPICS` and a player sentence to `MUST` in `tests/test_lore_activation_v1350.cjs`.
- **Add an NPC.**
  1. Add the lore entry via the lorebook pipeline. On campus from the start: a lore pass like `source_original/npc_lore_staff_2026-10-01/` (1.33.0: `lore_staff.md` with uid and keys, `lore_staff_additions.md` with `year: 1` lines that join the older NPC's Relations line), the roster line in `merge_lorebooks.py` (uid 97) and the Regulars (`STAFF_REGULARS`). Every bonded NPC needs a row in each *per NPC* data file (`docs/INDEX.md` §7) and a curated type for every relation line (`build_relations.py` fails otherwise); the count tests (mood/gift, Rank 4, Tension, Rank 8 branches) name the total.
  2. Add the portrait and thumbnail to the assets repo, then update the manifest and the pinned commit.
  3. Add focus and thumbnail overrides if the face crop is off.
  4. Rebuild; the engine alias map and UI data regenerate.
  5. Check that `gen_engine.py`'s DENY list doesn't swallow a new name.
- **Add a feature.**
  0. First check it is really new and which existing system it plugs into (`docs/FEATURES.md`, `src/scripts/shared.js`, DECISIONS):
     seeded draws, the Agenda, whereabouts, the Area module, `ledger` / `bagTake`, practice sessions, `$ui.now`. Never build a parallel
     system next to one that exists (owner, 2026-10-04).
  1. Decide the state shape in `schema.js`. Unknown keys are stripped by Zod, so declare every field.
  2. Put engine logic in `engine.template.js`: a new `step*(c)` function in `ENGINE_STEPS`, or a block in the step it belongs to.
  3. Put AI rules in `502` (update rules, `[mvu_update]`) or `504` (narration rules, `[mvu_plot]`).
  4. Put UI in `src/ui/parts/` and add an unlock in `stepUi` (9) if the feature is conditional.
  5. Add tests, give the feature its line in `docs/FEATURES.md` (with the `T:` suite) and update `docs/PLAYER_GUIDE.md`.
  6. Check the token cost with `token_audit.cjs`.
  7. If it should be switchable: add a row to `data/features.json` (paths it parks, its unlock), gate its rules with `<%_ if (on('id')) { _%>` in 502/504/505, hide its UI with `featureOn(S, 'id')`. `feature_cost.py` measures it on the next build.
  8. A rule needed only in some situations (1.54.0): keep one core line in 502 and put the full rule in `data/rule_cards.json` (its
     `feature`), with its trigger in engine `ruleCards` (state, calendar, place, a word in the reply); entry 511 prints it.
- **Change prices or happenings.** Edit `data/shop.json` or `data/happenings.json`, then run `gen_mvu_entries.py`, `gen_engine.py`, `gen_ui.py`, and the build.
- **Preset work.** Edit `presets/edit_preset.py`, not the output JSON. Every replacement asserts that its anchor text still exists. Read the preset's in-prompt `{{// }}` notes, which contain the author's per-model guidance.
  Since 1.68.0 the script keeps the upstream configuration as it ships and applies a closed list of deviations; `tests/test_preset.cjs`
  fails if any other prompt, toggle, setting or regex differs from upstream. **A new upstream release:** put its Gemini configuration in
  `presets/original/` under an ASCII name, point `SRC` at it, read every changed prompt, re-check each deviation's reason, then build.
- **Measure character drift.** Export the chat from SillyTavern (.jsonl) and run `python tools/audit_chat.py <chat> --out report.md`.
  The report lists findings per NPC per 25 messages and the message where each NPC first drifted. Every check is a heuristic:
  read the lines it points to. The Scene.Present and rank checks need an MVU chat (state in the message variables or patches).
- **Measure the narrator's mechanics** (1.53.1, U10). `python tools/audit_chat.py <chat> --mechanics --no-drift --out report.md`: block
  size, Analysis lines, engine work the narrator did itself, and what the current engine corrects when `tools/replay_chat.cjs` replays
  every block (needs node). Baseline before the narrator diet: `audit/AUDIT_2026-10-04_2_baseline_mekanik.md`.
  Add an NPC's "never" patterns to `data/voice_rules.json` once their voice canon is approved.
- **Measure memory** (1.61.1, memory audit M13). `python tools/audit_chat.py <chat> --memory --no-drift [--vectfox <export.json>]`:
  per memory list what the narrator wrote, what left its view, what was kept and what was lost for good, 501 tokens, the state and
  file size; with a VectFox export, ghost events and dates without a year. `node tests/stress/memory_soak.cjs [N]` checks the memory
  invariants over N synthetic updates. A memory batch adds its list or archive to `tools/memory_lists.cjs` `LISTS` and its invariant
  to the soak. Baseline: `audit/AUDIT_2026-10-05_2_baseline_memori.md`.
- **Compare with another AI.** Give both the same zip and the same task. Useful yardsticks:
  - `npm test` still passes
  - no decision in `docs/DECISIONS.md` is broken
  - generated files are regenerated, not hand-edited
  - the token audit delta
  - `CHANGELOG.md` is updated
