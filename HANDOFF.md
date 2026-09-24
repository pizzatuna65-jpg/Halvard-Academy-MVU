# HANDOFF — Eldrasil / Halvard Academy MVU card project

**Read this file first.** It is the complete context for continuing this project in a fresh session with any AI assistant, from any vendor. It assumes nothing about which assistant or tools you have, only that you can read files and (ideally) run Python 3 and Node.js.

Snapshot: card **v1.3.0**. All planned batches (1–5) are complete, plus post-release compatibility work, a bug-hunt round (v1.0.3), the world-systems release (v1.1.0: `docs/SPEC_v1_1_0_world_systems.md`) and the fixes from the owner's first playtest notes (v1.2.0: Builder, bracelet, shop, calendar, map; v1.2.1: second round; PROGRESS 1.2.0/1.2.1). v1.2.2 replaced the bond meter with an XP system and a bond event framework (docs/BOND_EVENTS.md). v1.3.0 applied the owner's NPC brainstorm (2026-09-25): new lore for 34 NPCs, bond rewards (Rank 5 gifts, Rank 10 benefits, mask → truth, Krieg), three reputations and training (`docs/design/`).

**Next task:** the owner continues the playtest (PROGRESS "Next" lists what 1.2.0 needs checked in ST), then tuning and fixes from what it finds.

---

## 0. Starter prompt (for the owner to paste into a new chat)

> Attached is my project zip. Read `HANDOFF.md` first, then `PROGRESS.md`. Confirm the snapshot version and the test status, then do this: **<task>**. Follow the working rules in HANDOFF §2 and deliver a complete updated project zip.

For the next session: `<task>` = "fix what my playtest found: <notes>" or any of the examples below.

Other examples of `<task>`: "bug hunt the engine and UI", "add a new NPC from this lorebook entry", "update lore entry X", "add feature Y", "compare your approach to Z with what is here".

---

## 1. What this is

A **SillyTavern character card** for a slice-of-life magic-academy roleplay: Halvard Academy, Kingdom of Eldrasil, with a mystery underneath. The player is a first-year student. The card combines four parts:

- **A merged, corrected lorebook** (259 worldbook entries): world, 50 NPCs, 65 locations, calendar, rules.
- **World systems (v1.1.0)**: seasons and weather with real effects, a forecast, class-aware presence, story hooks, gossip, a Bag, and a Features settings panel.
- **MVU (MagVarUpdate) state.** The AI ends every reply with an `<UpdateVariable>` JSONPatch block. A Zod schema validates the state, and a deterministic game engine script enforces rules: clock and calendar, HP and injuries, mana costs, bonds, hidden magic, payouts, journal, and more.
- **A UI**, made of two parts:
  - An in-chat "bracelet" status bar, rendered by a regex that replaces MVU's placeholder.
  - A Tavern Helper script with panels: Student Builder, Student file, People (dossiers, relationship graph), Map, Notebook, Activities, and Battle.
- **Ecosystem compatibility** with the owner's memory extension (VectFox) and prompt preset (Realistic Frankenstein 2.2, edited for Gemini).

**Division of labour (do not blur it):**

| Job | Owner |
|---|---|
| Game state and trackers | Card (MVU + engine) only |
| Prose style, POV, NPC behaviour, reasoning (CoT) | Preset |
| Long-term memory of old scenes | VectFox (EventBase) |
| Lore activation | SillyTavern keyword World Info |

## 2. Working rules (owner preferences and project conventions)

- **Language.** Discuss with the owner in **Indonesian** unless they write otherwise. Everything *inside* the card (prompts, UI text, variable names, builder) is **English**.
- **No pedantry.** Do not nitpick minor things. **Do** flag anything that breaks functionality or contradicts an established decision (§4). Say which decision it contradicts.
- **The UI never moves the story itself (D3/D6).** State changes happen through MVU commands in chat. Buttons such as "Go here" only fill the chat input for the player to edit and send. Player-tool writes (Builder, Settings) go through a hidden user message carrying an MVU patch.
- **Single sources of truth.** Edit the source (template, `data/*.json`, tools), never a generated file (§5).
- **Deliverable per task.** Deliver a complete updated project zip, with `PROGRESS.md` updated (what changed, open issues, next step). Rebuild the card and run the tests before delivering.
- **Verify, don't assume.** External behaviour (MVU, Tavern Helper, SillyTavern, VectFox) has repeatedly been settled by reading upstream source (§7). Do the same for new questions. Mark anything testable only inside SillyTavern as such.
- **Canon.** The owner's lorebook is canon. Invented content (prices, happenings, UI descriptors) must not contradict it. When unsure, check the lore text in `src/worldbook/content/`.

## 3. Repository map

```
HANDOFF.md                 this file
PROGRESS.md                chronological build log, open items, tunables, things to verify in ST  (read second)
ELDRASIL_MVU_PLAN.md       original master plan: decisions D1–D27, feature list F01–F23, batches (historical)
README.md                  short developer readme
package.json               node test deps (zod@4, lodash, yaml, ejs, d3); `npm test`
build/build_card.py        assembles dist/Eldrasil_Halvard.json (ccv3) + .png (chara + ccv3 chunks)
source_original/           owner's lorebooks v37 and v38 (never modified; v38 is the pipeline input)
  npc_lore_2026-09-25/     owner-approved full NPC entries (brainstorm 2026-09-25); merge_lorebooks.py lays them over v38
tools/
  merge_lorebooks.py       v38 -> src/worldbook (card lore, uid<500) + dist/lorebook_v39 (standalone) + canon fixes D17/D18/D23-25
  curate_data.py           v39 -> data/npcs.json, locations.json, map_pins.json (+ calls build_relations.py -> relations.json)
  gen_engine.py            src/scripts/engine.template.js + data -> engine.js (NPC aliases, castle places, happenings pool)
  gen_mvu_entries.py       custom worldbook entries 500-507 index + generated 505 (Now EJS, from custom/505.template.ejs) and 506 (Price Guide)
  feature_cost.py          (run by gen_mvu_entries) measures each feature's EJS-gated rules -> data/feature_cost.json
  common.py                shared data helpers: club membership, outdoor places (used by gen_engine, gen_mvu_entries, gen_ui)
  gen_ui.py                ui.template.js + src/ui/parts/*.js + data -> ui.js ; statusbar.template.html -> statusbar.html
  process_assets.py        portraits -> WebP (needs the original PNGs; not in the zip)
src/
  worldbook/               index.json + content/<uid>.txt (generated lore)
  worldbook/custom/        hand-written MVU entries uid 500-507 (index generated by gen_mvu_entries.py); 505.template.ejs = source of 505
  scripts/                 schema.js (MVU Zod), engine.template.js, ui.template.js, mvu_loader.js; *.js generated
  ui/                      statusbar.template.html, parts/10_people 20_map 30_notebook 40_activities
  regex/                   index.json (7 card regex scripts; 1.2.1 moves the bracelet above the narration) + uv_fold.html
  card/                    card.json (name, description, first_mes, creator notes, version) + avatar.png
data/                      curated single sources (see §5)
dist/                      BUILT card: Eldrasil_Halvard.png/.json ; lorebook_v39/ standalone export
presets/                   Realistic_Frankenstein_2_2_Eldrasil.json (generated) + edit_preset.py + original/ upload
docs/                      PLAYER_GUIDE, ECOSYSTEM, VECTFOX (+ vectfox_cleaning_patterns.json), TOKEN_AUDIT, TEST_CHECKLIST_*,
                           SPEC_v1_1_0_world_systems.md, BOND_EVENTS.md, npc_brainstorm/ (generated brief + group lore),
                           design/ (approved 1.3.0 designs, Indonesian: bond_rewards, reputation, training)
tests/                     node suites test_*.cjs, qa_static.cjs, run_all.cjs, token_audit.cjs, harness.cjs; preview/ (playwright)
```

## 4. Established decisions (do not break without the owner's approval)

**Framework and state**
- **MVU ZOD schema** (D1): `z.boolean()` (never `z.coerce.boolean()`), clamps via `transform`, defaults via `prefault`, and tolerant coercion.
  - Prefix `_` means AI-visible but engine-written. The engine reverts AI changes to `_Techniques`, `_Affinity` and `_True_magic` unless the Builder authorises them.
  - Prefix `$` means hidden from the AI. Tavern Helper's `{{format_message_variable}}` deep-omits `$` keys (verified).
- **Every enabled entry is tagged `[mvu_update]` or `[mvu_plot]`** (D2). The only untagged enabled entries are uids 0, 20, 97, 131, 132, 134, 501 and 505; the disabled control entries 500 (`[initvar]`) and 507 (`[config_override]`) are untagged by design.
- **Engine is deterministic and replay-safe** (4.6). It is a pure function `runEngine(after, before, text, seedHint)`.
  - Never use `Math.random`.
  - Happenings are seeded by `$eng.seed`, which is set once from the creation time of the first processed message.

**Rules the engine and prompts enforce**
- **The Arbiter Stone reads only `Magic._Affinity.Dominant`** (D9 / A1). Elemental→Fire, Mystic→Light, Spiritual→Viridian, Occult→Sky.
- **Power level is the player's choice** (D10). Never quietly nerf it. Since 1.2.0 there are no presets: the Builder sets `Mana_max` with a slider, and mana is private capacity (504), not a title.
- **Technique costs are fixed** in the Builder and charged by the engine (D11).
- **HP is injury, not a life bar** (D13). One event removes at most 40 HP unless `Lethal_flag` is set. HP 0 means death. Every HP loss names an injury.
- **Builder scope** (1.2.0, owner): Combat_role is assigned by the Combat teacher at the first Combat class (rule 502), not chosen in the Builder. Known_by is left to the story. The true magic is a hidden technique (Notes `[true]`). Pacts carry a Kind; only Spirit is lawful (anything else is the forbidden art of Pacting). The Builder keeps `$ui.file`; the engine restores the Builder-only fields from it when they come back empty.
- **Player-tool entries are hidden and carry no status placeholder** (1.2.0): Tavern Helper never renders iframes in hidden messages, so the bracelet stays on the last story message and reads the newest state.
- **Player tools and `_` paths** (v1.0.3): the MVU zod helper drops every command whose path has a `_` segment, for everyone. The Builder therefore writes `/Magic` and `/Hidden` whole (`liftReadonly`), and the engine's read-only guard decides. Never send a `_` path from a player tool.
- **Calendar change** (v1.0.3, owner decision): the World Competition is M11 W4 Wed–Sat (abroad, the national four) and Graduation is M11 W4 Sun, so a third-year picked for the World Competition competes before graduating. Month 12 is holiday only. Edited in `merge_lorebooks.py` (calendar months 11/12 and lore 248) and in the engine's `EVENTS`.
- **Graduation** (v1.0.3): on M12 W1 Mon 07:00 (the morning after Graduation, first day of the holiday) the engine moves that year's Halvard third-years into `Campus_State.Graduated`. They stop being regulars and club members; their bonds and dossiers stay. The story may remove a name, and the engine never re-adds it.
- **Cohorts** (v1.0.3): a student's school year = lorebook Year + campaign Year − the year they arrived. `data/cohorts.json` lists incoming first-years per campaign year (empty until the owner sends the new-first-years lorebook). Until their year an incoming NPC is inactive: its lore entry is empty (EJS gate), it is off the roster (uid 97, now year-aware EJS), not a regular or club member, not in the graph, and the engine starts no bond and records no name reveal. Arrival is journaled at the start of that campaign year.
- **Bonds** (D14, reworked in 1.2.2 by the owner): Rank 0–10. XP comes from the narrator's `/Interactions` (talk, hangout, gift, help) with daily/weekly limits; each rank needs more XP (`data/bond_rules.json`, scaled by the Settings pace). A full bar plus the cooldown sets `_Event_ready`; the rank rises by one only through the bond event (scripted in `data/bond_events.json` via `tools/import_bond_events.py`, else the rank's default theme). Romance opens at a Settings rank (default 8). What an NPC shares follows rank and `data/bond_openness.json`.
  - Dossier info unlocks by rank.
  - `<narrator_only>` lore is never unlocked by rank, only through `Campus_State.Secrets_revealed`.
  - A qualified label (`Magic (public)`, `Personality (daily)`) unlocks at its field's rank; the dossier drops "(public)" / "(surface)". Trauma (Rank 8) is optional and only shows where it exists.

**Bond rewards, reputation, training (v1.3.0, owner brainstorm 2026-09-25; `docs/design/`, data in `data/bond_rewards.json`, `reputation.json`, `training.json`)**
- **Rewards**: Rank 1–4 events are pure story; the 4→5 event gives the NPC's gift, the 9→10 event their Rank 10 benefit. The engine appends the reward to that event's directions and records it in `_Perks` (AI-visible, read-only) when the rank rises; one-use perks are spent through `/Perk_use`. **No endings of any kind**: high ranks open information, never a route. Rival academy teams have **no bond system** (the engine starts no bond for them).
- **Mask → truth** (Castor, Kanae, Caine): the 7→8 event adds a nudge Fact; the 8→9 event opens only once one of the NPC's secrets is in `Secrets_revealed`, else the bond stays at Rank 8. Rank 10 has one (truth) version.
- **Krieg**: the 0→1 introduction is ready at once; then +14 XP every Monday while Doves reputation ≥ +1 (with hidden magic also Dove attention ≤ 39), else Tension +1; nothing from interactions.
- **Reputation** replaces Public/Dorm (Dorm is scrapped): Academy, Student, Doves, −5..+5 from signed Rep XP (thresholds 15/35/60/90/125, clamp ±125). The narrator reports `/Rep_events`; repeatables capped +5/week per reputation, events and losses uncapped, bond milestones (engine) only below +3. Levels modify bond XP per talk/hangout (staff, students, anti-/pro-Dove NPCs). Academy +5 adds a monthly bonus, −5 halves the payout. Doves reputation is not Dove attention.
- **Training**: Mana pool and Stamina, reported in `/Training`; one session +1% of the starting value × (1 + 0.5 per partner in the scene), weekly cap 2.5%, lifetime cap 2× the starting value; jumps (Gavlan gift, Vallie Rank 10) +10% outside the weekly cap. `Mana_max` / `Stamina_max` change only through training or the Builder (other changes are reverted; a Builder change moves the starting value).

**World systems (v1.1.0, owner decisions in the spec)**
- **Weather** is a pure function of (`$eng.seed`, day): northern seasons, sky per morning / afternoon / night, wind, rare weather, °C, metric everywhere (the preset's Bridge asks for metric prose; "Time and Place" stays OFF). Weather **never** changes technique costs (D11; weather attunement was rejected) and never removes HP by itself (D13).
- **Weather effects setting** Off / Flavor / Full (`$ui.wxfx`, default Full). Flavor = weather shown, no effects. Away from campus there is no campus weather.
- **Forecast**: the Divination Society (never a member's name) posts tomorrow's skies at 07:00 on the Notice Board, ~75% right (`FC_TRUE`), rare events never forecast; only the Notice Board and `<now>` show it.
- **Conditions** (`Player.Conditions`) come from the weather; the engine adds and clears them, the story may remove one.
- **The Bag** (`Inventory`): Plan is free text, no reminders; gear works by item name; Sunfizz bottles return for 2 points (canon) at the Commissary or The Mall. Qty 0 removes an item (schema 0–99, see PROGRESS).
- **Story hooks** (`Hooks`) are narrator notes and never appear in the player's UI.
- **Features settings**: a feature that is off is **parked** in `$ui.parked`, never deleted; its rules are EJS-gated (`on('id')`) in 502/504/505, its tabs/chips hide, it does not unlock. Rows and parked paths live in `data/features.json`. No "Lean" preset button. Core (clock, body, magic, wallet, profile, Bonds, Journal, Campus_State, 503, always-on lore) and hidden magic have no toggle.
- **Outdoor places**: the spec rule (Sport and Grounds + Courtyards + Rooftop) with lore corrections in `tools/common.py` (Gymnasium and Old Hut indoor; Founder's Statue and Park and Combat Grounds outdoor).

**Canon fixes**
- D17: Crowning Day is an airship trip to the capital.
- D18: Royhan's qualification is date-gated by EJS.
- D23: the Sparring Pavilion (pin 19) is a new location.
- D24: the Detention Tower is part of the castle.
- D25: the Royal Inspectorate is on castle Floor 1.
- D21: the Rooftop stays undiscovered until someone shows the player the way.

**Map and UI**
- **Map** (D5/D7/D8): pins use percent coordinates from `data/map_pins.json`. Card headers are crops of the map, with no illustrations. Location cards are structured.
- **Modules appear only when relevant** (D16), via `$ui.unlocks`. The Shop tab appears only at a shop (1.2.0).
- **Walking times follow the map** (1.2.1, owner): `curate_data.py` computes legs (map distance 0.22 min per unit, lore times on forest and boat legs, castle stairs) into `locations.json` `near`; the Campus Map lore line states the same numbers. The bracelet shows above the narration (display regex).
- **Map cards** (1.2.0, owner): every card has Walk (from where the player is), Access, Clubs here, Regulars (only NPCs met whose Haunts entry is unlocked), Connected to; one card at a time with arrows. Club venues follow the owner's map (Running at the Sports Field, Archery at the Archery Range, Swimming/Gymnastics/Basketball at the Gymnasium, Divination at the Observation Tower); the Fishing House and Willow Island are their own places.
- **The status bar shows only on the latest message** (F22).

**Assets and memory**
- **Assets** live in `github.com/pizzatuna65-jpg/eldrasil-assets`, served via jsDelivr. They are **pinned to commit 4b6a10d**, and `base_url` exists in one place only: `data/assets_manifest.json`. Never ship `@main`.
- **State-as-memory**: the narrator reads the latest ~24 messages (card regex, promptOnly, minDepth 24).
  - The Journal keeps the latest 30 lines for the AI. Older lines move to `$ui.archive`.
  - Bonds show the latest 10 `Known_facts` to the AI. Older facts move to `$Known_old`.
  - The UI shows everything.

**Card configuration**
- **MVU card config override** is uid 507 `[config_override]`, a disabled entry: `更新方式 = 随AI输出` (update with the AI reply) and `兼容性.更新到聊天变量 = false`.
  - Reason: in tool-call mode, updates arrive without prose, which breaks name reveals from story text.
- **Story style is owned by the preset.** The card's own default is: others in third person, the player as "you", 3–6 paragraphs.

**Ecosystem**
- **The card is the only tracker.** The preset's Internal States family stays OFF: Bonds/Relationships RPG, GM Notebook, Agenda, Chekhov, World Sim, Fate & Routine, Thoughts.
- Do **not** vectorize the card's lorebook for VectFox Semantic World Info. It injects raw text, so EJS stays unrendered, MVU filtering is bypassed, and lore is duplicated.
- Use **either** VectFox ghosting **or** the card's trim regex, not both.

## 5. Build, test, and generated files

Requirements: Python 3.10+ (PIL only for `process_assets.py`), Node 18+ (tested on 22), and optionally Playwright + Chromium for UI previews.

```bash
npm install                          # zod@4, lodash, yaml, ejs, d3
# rebuild (run only the steps whose inputs you changed; order matters)
python3 tools/merge_lorebooks.py     # lore changed in source_original/  (then re-run curate_data.py)
python3 tools/curate_data.py         # NPC / location / relation data changed
python3 tools/gen_engine.py          # engine.template.js, npcs, locations or happenings changed
python3 tools/gen_mvu_entries.py     # custom entries, locations regulars or shop prices changed
python3 tools/gen_ui.py              # ui.template.js, ui/parts, statusbar.template.html or data changed
python3 build/build_card.py          # always last -> dist/
npm test                             # 11 suites + static QA on the built card (512 checks at v1.3.0)
python3 tests/preview/smoke_all_panels.py   # optional: opens every panel/tab headless (482 views at v1.2.0); expects "errors: none"
node tests/token_audit.cjs           # optional: always-on prompt size (~9.9k tokens at start, ~14.7k mid-year at v1.3.0)
python3 presets/edit_preset.py       # regenerates the edited preset from presets/original/ (byte-identical today)
```

**Generated files. Never edit them by hand.** Edit the source on the right instead.

| Generated | Source |
|---|---|
| `src/scripts/engine.js` | `engine.template.js` + `data/*` |
| `src/scripts/ui.js` | `ui.template.js` + `src/ui/parts/*` |
| `src/ui/statusbar.html` | `statusbar.template.html` |
| `src/worldbook/*` | `tools/merge_lorebooks.py` |
| `src/worldbook/custom/index.json`, `content/505.txt`, `content/506.txt` | `tools/gen_mvu_entries.py` (505 from `custom/505.template.ejs`) |
| `data/feature_cost.json` | `tools/feature_cost.py` (run by `gen_mvu_entries.py`) |
| `data/npcs.json`, `locations.json`, `relations.json`, `map_pins.json` | `curate_data.py` |
| `dist/*` | the build |
| `presets/Realistic_Frankenstein_2_2_Eldrasil.json` | `edit_preset.py` |

**Hand-written single sources:**
- `data/shop.json` (prices; canon prices are locked)
- `data/bond_rewards.json`, `data/reputation.json`, `data/training.json` (1.3.0; from `docs/design/`), `data/bond_rules.json`, `data/bond_openness.json`
- `source_original/npc_lore_2026-09-25/` (NPC entries that replace v38's; edit lore there or add a newer pass the same way)
- `data/happenings.json` (seeded campus events; `where` must be a real location name)
- `data/field_overrides.json`, `focus_overrides.json`, `thumb_overrides.json`, `assets_manifest.json`
- `data/features.json` (Features settings rows, parked paths, unlocks), `data/weather_moods.json` (canon NPC weather moods only)
- `src/worldbook/custom/505.template.ejs` (the Now entry)
- custom entries `500–504`, `507` and `508` (the birthday event, 1.2.0)
- `src/regex/index.json`
- `src/card/card.json`

## 6. Playbooks for common tasks

- **Bug hunt.**
  1. Run `npm test` and the smoke test.
  2. Read `engine.template.js` section by section; its sections are numbered 0–10.
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
  1. Bring the NPC entries in through the lorebook pipeline, like any NPC (entry comment `NPC — Full Name`), with portraits and thumbnails.
  2. List them under `Year 1:` in the NPC Roster entry (uid 97), in the roster's attribute format.
  3. Add their ids (first names) to `data/cohorts.json` under the campaign year they arrive (`"2"` or `"3"`). `merge_lorebooks.py` and `curate_data.py` assert that every listed id has an entry.
  4. If a location's Regulars lore text names them, check the wording still works before they arrive (the UI and the Now entry already filter them; plain lore text does not).
  5. Rebuild from `merge_lorebooks.py` onward. `tests/test_bughunt_v103.cjs` already covers the mechanism with a fake NPC.
- **Add an NPC.**
  1. Add the lore entry via the lorebook pipeline.
  2. Add the portrait and thumbnail to the assets repo, then update the manifest and the pinned commit.
  3. Add focus and thumbnail overrides if the face crop is off.
  4. Rebuild; the engine alias map and UI data regenerate.
  5. Check that `gen_engine.py`'s DENY list doesn't swallow a new name.
- **Add a feature.**
  1. Decide the state shape in `schema.js`. Unknown keys are stripped by Zod, so declare every field.
  2. Put engine logic in `engine.template.js`.
  3. Put AI rules in `502` (update rules, `[mvu_update]`) or `504` (narration rules, `[mvu_plot]`).
  4. Put UI in `src/ui/parts/` and add an unlock in engine section 9 if the feature is conditional.
  5. Add tests and update `PLAYER_GUIDE.md`.
  6. Check the token cost with `token_audit.cjs`.
  7. If it should be switchable: add a row to `data/features.json` (paths it parks, its unlock), gate its rules with `<%_ if (on('id')) { _%>` in 502/504/505, hide its UI with `featureOn(S, 'id')`. `feature_cost.py` measures it on the next build.
- **Change prices or happenings.** Edit `data/shop.json` or `data/happenings.json`, then run `gen_mvu_entries.py`, `gen_engine.py`, `gen_ui.py`, and the build.
- **Preset work.** Edit `presets/edit_preset.py`, not the output JSON. Every replacement asserts that its anchor text still exists. Read the preset's in-prompt `{{// }}` notes, which contain the author's per-model guidance.
- **Compare with another AI.** Give both the same zip and the same task. Useful yardsticks:
  - `npm test` still passes
  - no decision in §4 is broken
  - generated files are regenerated, not hand-edited
  - the token audit delta
  - `PROGRESS.md` is updated

## 7. Externally verified facts (and where they came from)

| Fact | Source checked |
|---|---|
| `{{format_message_variable}}` deep-omits every `$` key and renders YAML | Tavern Helper (JS-Slash-Runner) `src/function/macro_like.ts` (`omitDeepBy`) + CHANGELOG |
| Tavern Helper never renders message iframes (the bracelet) in hidden (`is_system`) messages; `getVariables({type:'message'})` with `latest` skips hidden messages, an explicit id does not | JS-Slash-Runner `src/store/iframe_runtimes/message.ts`, `src/function/variables.ts` (checked for 1.2.0) |
| The MVU zod helper (`registerMvuSchema`) drops any command whose path has a segment starting with `_` (`isReadonlyPath`), with no player-tool exception | StageDog tavern_resource `util/mvu_zod.ts` (checked for v1.0.3) |
| `Mvu.parseMessage` → `updateVariables` → emits `VARIABLE_UPDATE_ENDED` (engine sees Builder/Settings patches) | MagVarUpdate `src/function/global/index.ts`, `update_variables.ts` |
| Card config override = a **disabled** worldbook entry with comment `[config_override]` containing JSON; needs the card lorebook bound; MVU ≥ 2026-08-08 | MagVarUpdate `override_plan.md`, `src/function/character_override/schema.ts`, CHANGELOG |
| MVU's unversioned jsDelivr URL resolves to its default branch `beta` | MagVarUpdate repo (default branch) |
| In extra-model mode MVU appends the update to the message (prose kept); tool-call mode passes only the patch | MagVarUpdate `on_message_received.ts`, `function_call.ts` |
| SillyTavern regex order: global → **preset** → scoped (card). Preset display regexes run before the card's bracelet regex | SillyTavern `public/scripts/extensions/regex/engine.js` (`SCRIPT_TYPES`) |
| VectFox: extraction/planner call the backend directly (no ST generation); skips `is_system` messages; holds back the latest turn; default cleaning strips `<UpdateVariable>`; custom patterns run after built-ins; semantic lorebook injects raw content via its own extension prompt; mines dates from message text and `extra.reasoning` | VectFox commit 3623dc8: `core/llm-provider-call.js`, `chat-vectorization.js`, `eventbase-workflow.js`, `text-cleaning.js`, `world-info-integration.js`, `eventbase-extractor.js` |

## 8. Open items (also in PROGRESS.md)

**Owner-side**
- **Playtest in SillyTavern** using `docs/TEST_CHECKLIST_v1.0.3.md` first (Builder vs the real helper), then `docs/TEST_CHECKLIST_v1.0.md` and `docs/TEST_CHECKLIST_v0.5.md`. Nothing has been tested inside ST yet; all testing so far is headless.
- Review `data/field_overrides.json` and `data/_review_sensitive_flags.json` for possible spoilers. This has been pending since Batch 1.

**Only verifiable inside ST**
- The trim regex's minDepth behaviour.
- `[config_override]` being picked up.
- `send_date` being available when the seed is set.
- The display regex `maxDepth` on hidden messages.

**Tunables after playtest** (v1.1.0 adds the weather and condition numbers listed in PROGRESS)
- Payout bands, bond XP table and pace (data/bond_rules.json), rest/sleep recovery, the 40-HP cap, Dove attention increments.
- Happening rates, trim depth (24), Journal window (30), `FACTS_VISIBLE` (10), Clues cap (40).

**Not adapted yet**
- The preset's MAX and Micro CoT variants; only BOLT was adapted.
- The preset's DnD Simulator and Inventory need Internal States and must stay OFF with this card.

**v1.1.0 to confirm with the owner** (details in PROGRESS 1.1.0)
- Deviations: Inventory Qty 0–99; the lore-based outdoor list; the Notice Board tab stays while story notices are off (it carries the forecast); clear_dusk needs a clear night.
- Token budget: +530 always-on with everything on (the spec's +30–60 was not reachable with its own rules); back to v1.0.3 size with the new features off.
- Only verifiable in ST: EJS rendering of the gated 502/504 (and in extra-model mode).

**Design decisions pending (from the v1.0.3 bug hunt)**
- Pin the MVU / mvu_zod dependencies to tested commits.
- Player lifecycle (graduated / expelled / repeating) and cohort year labels for NPCs.
- A save-migration protocol for future versions (`$eng.ver` now records the engine version).

**Possible later token saving**
- Hide clues of solved threads from the AI.

## 9. Environment notes for the next session

- `node_modules/` and the original portrait PNGs are **not** in the zip. Run `npm install`. Portraits are already hosted; `process_assets.py` is only needed for new portraits.
- The plan file's "resume protocol" was written for an earlier workflow. This HANDOFF supersedes it: one zip carries everything, and `PROGRESS.md` is the log.
- Checkpoint naming used so far: `eldrasil_project_<version or batch>.zip`, with the project in a single top-level folder.
