# HANDOFF — Eldrasil / Halvard Academy MVU card project

**Read this file first.** It is the complete context for continuing this project in a fresh session with any AI assistant, from any vendor. It assumes nothing about which assistant or tools you have, only that you can read files and (ideally) run Python 3 and Node.js.

Snapshot: card **v1.7.0**. All planned batches (1–5) are complete, plus post-release compatibility work, a bug-hunt round (v1.0.3), the world-systems release (v1.1.0: `docs/SPEC_v1_1_0_world_systems.md`) and the fixes from the owner's first playtest notes (v1.2.0: Builder, bracelet, shop, calendar, map; v1.2.1: second round; PROGRESS 1.2.0/1.2.1). v1.2.2 replaced the bond meter with an XP system and a bond event framework (docs/BOND_EVENTS.md). v1.3.0 applied the owner's NPC brainstorm (2026-09-25): new lore for 34 NPCs, bond rewards (Rank 5 gifts, Rank 10 benefits, mask → truth, Krieg), three reputations and training (`docs/design/`). v1.3.1 fixed the owner's playtest of 1.3.0 (PROGRESS 1.3.1): Etnie's bond starts when they meet, map location matching, the Connections graph, event day plans with times, club sign-up week, the Forest pin, the max-Tension penalty, Settings for training and reputation, colour themes. v1.3.2: pact partners have several abilities, each its own technique (PROGRESS 1.3.2). v1.3.3: bug hunt with stress tests (`npm run stress`, PROGRESS 1.3.3). v1.3.4: the owner's playtest in ST (old lorebook detection, bracelet theme, map pins, the student's picture, "Next" chip; PROGRESS 1.3.4). v1.3.5: a missing lorebook is explained on the bracelet with a button for Import Card Lore. v1.3.6: the card installs (or, after asking, updates) its own lorebook. v1.3.7: EJS entries wrapped in their own block scope (they are compiled together in ST). v1.3.8: Tension bands, five NPC categories and personal overrides (data/tension.json). v1.4.2: Connections lines are directed (arrows), everyone dislikes Althair one way, your own line takes a kind from rank, trust and tension, a Romance line (yours from Rank 8; Etnie and Kanae one way to you), group-rule lines (Caine and mages; views of the Doves) (PROGRESS 1.4.2). v1.4.3: Trust as a full system like Tension (data/trust.json: bands, perk gates, deeds-only rises, categories from openness, overrides, Ottavio and Sky; PROGRESS 1.4.3). v1.4.4: grey areas (intent over harm, teasing, kindness eases Tension, "understood", one rank per Tension blow-up; PROGRESS 1.4.4). v1.4.5: each bond keeps its latest 10 moments with {{user}} (dossier table; the newest 5 in <now>; PROGRESS 1.4.5). v1.4.6: the card sets no prose style, point of view or length (preset toggles do); preset BOLT step 2 points to the card's rules; `tools/audit_chat.py` measures character drift in exported chats. v1.5.0: rule 504 puts canon over the chat's own prose and lists where world events may come from, bonds near their next rank are marked "close" in <now>, scheduled events adapt to the story (butterfly clause); the preset gains Player Input Authority, Output language and generic character-writing rules (PROGRESS 1.5.0). v1.5.1: the Cast Sheet (custom 509 @D1) gives every NPC in `Scene.Present` their canon lore with automatic invariants, secret status and the lines between the people present (full lore for at most 4: who spoke last, then the highest rank; the rest a brief sheet), and their keyword entry prints nothing meanwhile; a last-mile cast gate (510 @D0) checks voice and knowledge before writing; <now> flags an NPC who spoke without being in Scene.Present and lists who was only mentioned (PROGRESS 1.5.1). v1.6.0: each bond carries the character's side (Mind, Knows, Imprints, Next; engine defining moments, Meanwhile lines) and dated lines show their age in words (PROGRESS 1.6.0); VectFox Summarizer Injection is now recommended OFF. v1.6.1: characters the narrator invents get an Extras record from their second appearance (their card in <cast>; the player can pin one from the cast strip), campus events are dated and <now> asks to move on those with no news for a week, and a campus-phase line exists for the canon waves to fill (PROGRESS 1.6.1). v1.6.2: the preset's reasoning reads the character sheets, runs a cast check per character (name-swap test, the usual reaction over the loudest) and points to the card's world sources and invented-character records without naming any card field (PROGRESS 1.6.2). v1.6.3: the first canon wave (G1, approved by the owner): the 8 key NPCs have voice examples, terms of address, props, a drift warning, a Change type, a Stage per rank band and an Anchor in `data/npc_canon.json`, printed in their Cast Sheet (PROGRESS 1.6.3). v1.6.4: the second wave (G2: Caralynn, Percival, Trixie, Vera, Alyssa), with Stages for every wave from now on; Alyssa's story is somber and bittersweet, and her Rank 10 benefit no longer cures her forgetting (PROGRESS 1.6.4). v1.6.5: the third wave (G3: Lenna, Saffi, Idris, Dante, Florian, Tilly); Dante stays fanatically lawful, so his Rank 5 and Rank 10 rewards no longer bend rules for {{user}} (PROGRESS 1.6.5). v1.6.6: the fourth wave (G4: Caspian, Royhan, Sophia, Gareth, Ruby) (PROGRESS 1.6.6). v1.6.7: the last wave (G5: the staff, Krieg, Milena, Tristan and Bobby), so every bonded NPC has a voice; Yvette's and Layla's Rank 10 texts were fixed to match their lore (PROGRESS 1.6.7). v1.6.8: Rank 8 branches per NPC (A all, B best friend or rival, C best friend or romance, D best friend only), with a Romance or Rival line in the Cast Sheet and a dossier line saying what Rank 8 can open (PROGRESS 1.6.8). v1.6.9: a stress test, bug hunt and compatibility round for the card with the edited preset and VectFox: the Rank 8 branch now follows the Trust the event was played on, a B or D character's sheet says they do not become a romance, the preset's BOLT reasons through all its tasks (0-11) and its prompts point only to tags the model can see, and `docs/TEST_CHECKLIST_v1.6.md` lists what only SillyTavern can show (PROGRESS 1.6.9). v1.6.10: every People → Connections line now points from the person who holds the view (a sentence in one NPC's file often describes another's view of them), and opens with the bond of the person whose file tells it (PROGRESS 1.6.10). v1.6.11: a new bond always starts at the character's own Trust, whatever number the narrator writes on a first meeting, and a club in People → Connections shows someone only once their Club field is open (PROGRESS 1.6.11). v1.7.0: the first incoming cohort (owner-approved `planning/DRAFT_cohort2_npcs.md`): Linus, Maple, Nerys, Hadrian, Wren and Tsubaki arrive as first-years in campaign Year 2, with lore, voice canon, Rank 8 branches, rewards, Connections lines and the lines they add to older NPCs' files, all hidden before Year 2; Nerys has a weekly hobby line in her Cast Sheet; a Rank 10 benefit can carry a training bonus (PROGRESS 1.7.0). Every release now tests that the previous release's save still loads (`tests/test_saves.cjs`, fixtures in `tests/fixtures/saves/`). The approved character-consistency plan (releases 1.5.0 to 1.6.2 and canon waves) is `planning/DRAFT_batch_plan.md` with its four source drafts.

**Next task:** the character-consistency plan (`planning/DRAFT_batch_plan.md`, CLAUDE.md): 1.5.1 → 1.6.0 → 1.6.1 → 1.6.2 (all done), then G1 (`planning/DRAFT_voices.md`, 1.6.3) G2 (`planning/DRAFT_voices_G2.md`, 1.6.4) G3 (`planning/DRAFT_voices_G3.md`, 1.6.5) G4 (`planning/DRAFT_voices_G4.md`, 1.6.6) and G5 (`planning/DRAFT_voices_G5.md`, 1.6.7): every canon wave is applied. Then the Rank 8 branches (`planning/DRAFT_rank8_branches.md`, 1.6.8) a bug hunt (1.6.9) and the direction of every Connections line (1.6.10) and the first-meeting Trust fix from the owner's playtest (1.6.11), and cohort 2 (1.7.0; portraits still needed). **Now the owner playtests** (`docs/TEST_CHECKLIST_v1.6.md` first); then `tools/audit_chat.py` on the exported chat is the first MVU baseline.

---

## 0. Starter prompt (for the owner to paste into a new chat)

> Attached is my project zip. Read `HANDOFF.md` first, then `PROGRESS.md`. Confirm the snapshot version and the test status, then do this: **<task>**. Follow the working rules in HANDOFF §2 and deliver a complete updated project zip.

For the next session: `<task>` = "fix what my playtest found: <notes>" or any of the examples below.

Other examples of `<task>`: "bug hunt the engine and UI", "add a new NPC from this lorebook entry", "update lore entry X", "add feature Y", "compare your approach to Z with what is here".

---

## 1. What this is

A **SillyTavern character card** for a slice-of-life magic-academy roleplay: Halvard Academy, Kingdom of Eldrasil, with a mystery underneath. The player is a first-year student. The card combines four parts:

- **A merged, corrected lorebook** (259 worldbook entries): world, 56 NPCs (6 arrive in campaign Year 2), 67 locations, calendar, rules.
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
| Prose style, POV, length, generic NPC-writing craft, reasoning (CoT) | Preset (as toggles; the card carries none of these since 1.4.6) |
| Long-term memory of old scenes | VectFox (EventBase) |
| Lore activation | Characters in `Scene.Present`: the card's Cast Sheet (custom 509, since 1.5.1; their keyword entry is empty meanwhile). Everything else: SillyTavern keyword World Info |

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
  audit_chat.py            offline drift audit of an exported chat (.jsonl): pronouns, misspelt names, speakers not in
                           Scene.Present, <narrator_only> words, rank-locked fields, voice rules (data/voice_rules.json)
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
- **Cast Sheet** (1.5.1, owner-approved plan P1, changes "Lore activation → keyword WI" for present NPCs): custom 509 (@D1) is generated by `gen_mvu_entries.py` from `509.template.ejs` plus every NPC's lore text, one EJS section per NPC, so EJS inside lore still renders. The engine picks the sheets (`$ui.cast`: `full` at most 4, `brief`, plus `spoke` / `gone` / `ment` from the reply's prose); `merge_lorebooks.py` wraps every NPC keyword entry so it prints nothing while that NPC has a full sheet. The last-mile gate 510 (@D0) sits before 503, so `<UpdateVariable>` stays last.
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
- **Cohorts** (v1.0.3): a student's school year = lorebook Year + campaign Year − the year they arrived. `data/cohorts.json` lists incoming first-years per campaign year (1.7.0: Year 2 = Linus, Maple, Nerys, Hadrian, Wren, Tsubaki). Until their year an incoming NPC is inactive: its lore entry is empty (EJS gate), it is off the roster (uid 97, now year-aware EJS), not a regular or club member, not in the graph, and the engine starts no bond and records no name reveal. Arrival is journaled at the start of that campaign year. Since 1.7.0 the lines a cohort adds to older NPCs' files, the roster and the Regulars entries are gated the same way (EJS in the card, `[from Year N]` in the v39 export and a year-gated field in the UI data), the Cast Sheet's ties list only people who have arrived, and a sheet shows the school year of the current campaign year.
- **Bonds** (D14, reworked in 1.2.2 by the owner): Rank 0–10. XP comes from the narrator's `/Interactions` (talk, hangout, gift, help) with daily/weekly limits; each rank needs more XP (`data/bond_rules.json`, scaled by the Settings pace). A full bar plus the cooldown sets `_Event_ready`; the rank rises by one only through the bond event (scripted in `data/bond_events.json` via `tools/import_bond_events.py`, else the rank's default theme). Romance opens at a Settings rank (default 8). **Rank 8 branches** (1.6.8, owner): `data/npc_canon.json` `branch` says which of best friend, romance and sworn rival each NPC allows (A all, B best friend or rival, C best friend or romance, D best friend only); romance is refused for B and D whatever the Settings say, the engine records the branch taken in `Bonds.<id>.$branch` at Rank 8 (from the Trust the 7→8 event was played on, 1.6.9), and the Cast Sheet adds that branch's `romance`/`rival` line. What an NPC shares follows rank and `data/bond_openness.json`.
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

**1.3.1 (owner playtest of 1.3.0)**
- **Etnie** is not bonded at the start; `data/bond_rules.json` `start` gives her bond Rank 3 (Trust 70, title, fact, milestone) the first time the engine records it. Any other bond starts at Rank 0.
- **World.Location is written in the Campus Map's words** by the engine (`canonLocation`, §1): short names and parts of "X and Y" names (`tools/common.py place_aliases`) become the map name; a sub-spot that is its own place wins, except a dorm room every dorm shares. Trips and off-campus text are left alone. The UI map reads locations the same way.
- **Events carry a day plan with times** (`s` in the engine's EVENTS, one per day where the lore differs); `_Event_today` = "<event> — <plan>", events joined by " | ". Club sign-up week M1 W1 Tue–Fri 16:00–18:00, registration closes Friday 18:00 (lore 21 edited).
- **Settings** for training and reputation live in `$ui.tune` (rows in `data/tuning.json`, defaults asserted equal to training.json / reputation.json). Tension 70 costs −5 and Tension 100 another −10 of the matching reputation (Milena → Doves included).
- **Colour themes** are palette only (`data/themes.json`, generated by `tools/make_themes.py`) and per browser (storage key `eld.theme`): the one allowed use of browser storage in a script (qa_static checks it). Never store game state there.
- **UI code that animates** must not rely on the script iframe's `requestAnimationFrame` (Tavern Helper runs scripts in a hidden iframe, where it never fires); use SillyTavern's window (`PD.defaultView`) or compute at once (see the Connections graph).
- Every panel except the Builder shows `{{user}}` in lore text as the student's first name.
- **One version number** (1.3.4): `src/card/card.json` `character_version`. gen_engine.py puts it in ENGINE_VER and build_card.py in the [initvar] entry (`$eng.lore`), so a chat started from an old lorebook in SillyTavern is detected on its first update. Importing a card again does **not** replace its lorebook in ST (ST offers it once per character file), so since 1.3.6 the UI script installs a missing lorebook itself and asks before updating an older one (`ensureLorebook`, SillyTavern.getContext() world-info calls).
- **EJS entries share one scope in ST**: the Prompt Template extension compiles entries that land together as one template, so build_card.py wraps every EJS entry in `<%_ { _%> … <%_ } _%>`. Test EJS by rendering the entries together, not only one by one.
- **Themes never touch the map**: pins, labels and map crops keep fixed colours (`/*keep*/` after a colour opts out of re-colouring). The bracelet finds its CSS by id (Tavern Helper puts its own `<style>` first in message iframes).
- **The student's picture** is a SillyTavern user image (`/api/images/upload`); the chat keeps only its path (`$ui.portrait`). Never put image data in the variables (every message stores them).
- **Connections** (1.4.1, owner): every NPC->NPC line type is curated by hand in `data/relations_curated.json` (seven kinds: friends, softspot, protective, respect, rivals, wary, dislike); never go back to keyword guessing. Since 1.6.10 (owner: lines in one NPC's entry often describe another NPC's view) the direction is curated too: key `A>B` = a sentence in A's file mentioning B, value `type` (A → B), `<type` (B → A) or a list of both, optional `/N` = which of its sentences are that line's notes; the line opens with the bond of A, whose file tells it (`rank:N@A` in the UI data). New lore that mentions another NPC needs a curated entry (the build fails otherwise). Dorm / club / faction are group label nodes (`data/factions.json`), not lines between people. Dragged nodes stay where they are dropped.
- **Tension** (1.3.8, owner): the same bands and effects for everyone (40 XP halved, 70 no bond event, 90 no XP, 100 rank −1); how an NPC plays it comes from its category in `data/tension.json` (withdrawn, social, confrontational, authority, dangerous) or a personal override (Etnie, Kanae exempt, Althair locked at 0 with XP conversion, Ezrel half rises). Rises are never capped (owner: easier to make enemies than friends); only easing is limited. Apologies (1.4.0) are reported by the narrator and eased by the engine per category (`apology`), per NPC where it differs (`apology_npc`: Sophia takes it as weakness). Every bonded NPC must have one (gen_engine.py asserts it). A new NPC needs a category. Since 1.4.4 maximum Tension breaks one rank per blow-up (re-armed below 70), kindness eases it (`kind_ease`), and each category / override says how the character takes teasing (`banter`, shown in <now>); rule 502 judges deeds by intent.
- **Trust** (1.4.3, owner): `data/trust.json`. Bands Betrayed / Doubtful / Neutral / Trusting / Confidant with the same effects for everyone (what they share, XP, how Tension and apologies land); perks and bond events need Trust (Rank 6: 35, Rank 7: 50, Rank 9–10: 65; the Rank 8 event never waits for A and B NPCs, but under 50 it can only end in a sworn rivalry and romance is refused; C and D NPCs, who have no rival branch, wait for Trust 50 (1.6.8, owner); a Rank 10 benefit is suspended under 35). Rises only from reported deeds (keep, secret, defend, confide, help; capped +8 a week) and +3 per rank earned; the narrator writes drops (uncapped; 20+ spreads −5 to the NPC's Friends lines). The category is the NPC's openness (`data/bond_openness.json`), so a new NPC needs only an openness tag. A new bond starts at its category's Trust (open 60, normal 50, guarded 40, closed 30), whatever the narrator writes on the first meeting (1.6.11). Overrides: Etnie, Kanae, Althair, Ezrel, Caine, Krieg; `dorm_head`: Ottavio is easier on Sky students (bond, Tension and Trust).
- **Pact abilities** (1.3.2, owner): a pact partner has a list of abilities like a creature's moves; each is its own technique `<partner>: <ability>` with its own cost, and Summon only pays for the partner being there (a pact without abilities keeps the old hybrid Summon). The engine charges an ability only while the partner is here.

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
  - 1.6.0: Knows keeps 15 lines per bond (older in `$Knows_old`), Imprints 5, `$Defining` 5. Mind, Knows and Imprints are the narrator's; the dossier never shows them.
  - 1.6.1: Extras keeps 20 invented characters (least recently seen leave into `$ui.xold`, 40, and come back if they return; Keep is the player's). `Campus_State.Events` are `{Text, Updated}`; the engine owns Updated.

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
python3 tools/make_themes.py         # 1.3.1: only when the colour themes change (-> data/themes.json)
python3 tools/gen_ui.py              # ui.template.js, ui/parts, statusbar.template.html or data changed
python3 build/build_card.py          # always last -> dist/
python3 tools/build_test_card.py 7   # optional: dist/test/ TEST card, every bond at Rank 7 (own lorebook name)
npm run stress                       # optional (~30 s): fuzz, Builder fuzz, a simulated school year (tests/stress/)
npm test                             # 42 suites + static QA on the built card (1239 checks at v1.7.0)
python3 tests/preview/smoke_all_panels.py   # optional: opens every panel/tab headless (482 views at v1.2.0); expects "errors: none"
node tests/token_audit.cjs           # optional: always-on prompt size (~9.9k tokens at start, ~14.7k mid-year at v1.3.0)
python3 presets/edit_preset.py       # regenerates the edited preset from presets/original/ (deterministic; run twice, compare)
node tests/fixtures/make_save.cjs    # BEFORE changing anything in a release: writes the current release's save fixture
python3 tools/audit_chat.py chat.jsonl --out report.md   # optional: character-drift report for an exported chat
```

**Generated files. Never edit them by hand.** Edit the source on the right instead.

| Generated | Source |
|---|---|
| `src/scripts/engine.js` | `engine.template.js` + `data/*` |
| `src/scripts/ui.js` | `ui.template.js` + `src/ui/parts/*` |
| `src/ui/statusbar.html` | `statusbar.template.html` |
| `src/worldbook/*` | `tools/merge_lorebooks.py` |
| `src/worldbook/custom/index.json`, `content/505.txt`, `content/506.txt`, `content/509.txt` | `tools/gen_mvu_entries.py` (505 from `custom/505.template.ejs`, 509 from `custom/509.template.ejs` + NPC lore) |
| `data/feature_cost.json` | `tools/feature_cost.py` (run by `gen_mvu_entries.py`) |
| `data/npcs.json`, `locations.json`, `relations.json`, `map_pins.json` | `curate_data.py` |
| `dist/*` | the build |
| `data/themes.json` | `tools/make_themes.py` (1.3.1) |
| `presets/Realistic_Frankenstein_2_2_Eldrasil.json` | `edit_preset.py` |

**Hand-written single sources:**
- `data/shop.json` (prices; canon prices are locked)
- `data/bond_rewards.json`, `data/reputation.json`, `data/training.json` (1.3.0; from `docs/design/`), `data/bond_rules.json` (1.3.1: `start`), `data/bond_openness.json`, `data/tuning.json` (1.3.1 Settings rows)
- `source_original/npc_lore_2026-09-25/` (NPC entries that replace v38's; edit lore there or add a newer pass the same way)
- `data/happenings.json` (seeded campus events; `where` must be a real location name)
- `data/field_overrides.json`, `focus_overrides.json`, `thumb_overrides.json`, `assets_manifest.json`
- `data/features.json` (Features settings rows, parked paths, unlocks), `data/weather_moods.json` (canon NPC weather moods only)
- `src/worldbook/custom/505.template.ejs` (the Now entry)
- custom entries `500–504`, `507`, `508` (the birthday event, 1.2.0) and `510` (the last-mile cast gate, 1.5.1)
- `src/regex/index.json`
- `src/card/card.json`

## 6. Playbooks for common tasks

- **Bug hunt.**
  1. Run `npm test`, `npm run stress` and the smoke test. `tests/harness.cjs` applies commands one by one like the MVU zod helper (a command whose result fails the schema is dropped).
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
  1. Bring the NPC entries in as a lore pass `source_original/npc_lore_cohort<N>_<date>/` (1.7.0 pattern): `lore_cohort<N>.md` with
     the new entries (heading, `uid:`, `keys:`, fenced entry) and `lore_cohort<N>_additions.md` with the lines they add to older NPCs
     (heading, `year:`, fenced lines; `<narrator_only>` for secret ones). `merge_lorebooks.py` reads every `npc_lore_cohort*` folder.
     Portraits and thumbnails as for any NPC (the UI
     shows initials until then).
  2. List them in `COHORT_ROSTER` and their Regulars in `COHORT_REGULARS` (merge_lorebooks.py); the roster's Year 1 line gains them.
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
- **Measure character drift.** Export the chat from SillyTavern (.jsonl) and run `python3 tools/audit_chat.py <chat> --out report.md`.
  The report lists findings per NPC per 25 messages and the message where each NPC first drifted. Every check is a heuristic:
  read the lines it points to. The Scene.Present and rank checks need an MVU chat (state in the message variables or patches).
  Add an NPC's "never" patterns to `data/voice_rules.json` once their voice canon is approved.
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
| The MVU zod helper applies commands one by one, `safeParse`s the result after each, and drops only a failing command (warning toast), keeping the previous value; it wraps a root ZodObject in `z.looseObject` | StageDog tavern_resource `util/mvu_zod.ts` (checked for v1.3.3) |
| `Mvu.parseMessage` → `updateVariables` → emits `VARIABLE_UPDATE_ENDED` (engine sees Builder/Settings patches) | MagVarUpdate `src/function/global/index.ts`, `update_variables.ts` |
| Card config override = a **disabled** worldbook entry with comment `[config_override]` containing JSON; needs the card lorebook bound; MVU ≥ 2026-08-08 | MagVarUpdate `override_plan.md`, `src/function/character_override/schema.ts`, CHANGELOG |
| MVU's unversioned jsDelivr URL resolves to its default branch `beta` | MagVarUpdate repo (default branch) |
| In extra-model mode MVU appends the update to the message (prose kept); tool-call mode passes only the patch | MagVarUpdate `on_message_received.ts`, `function_call.ts` |
| SillyTavern regex order: global → **preset** → scoped (card). Preset display regexes run before the card's bracelet regex | SillyTavern `public/scripts/extensions/regex/engine.js` (`SCRIPT_TYPES`) |
| Chat completion, per depth: one block per role, in the final prompt assistant, then user, then system last; World Info @D entries join their role's block after the preset's prompts of order 100. So at depth 0 the card's 510 and 503 are the last text, after the preset's BOLT and Player Input Authority (user role) | SillyTavern `public/scripts/openai.js` `populationInjectionPrompts` (release branch, checked for 1.6.9) |
| `{{lastUserMessage}}` skips hidden (`is_system`) messages | SillyTavern `public/scripts/macros.js` `getLastUserMessage` (checked for 1.6.9) |
| VectFox: extraction/planner call the backend directly (no ST generation); skips `is_system` messages; holds back the latest turn; default cleaning strips `<UpdateVariable>`; custom patterns run after built-ins; semantic lorebook injects raw content via its own extension prompt; mines dates from message text and `extra.reasoning` | VectFox commit 3623dc8: `core/llm-provider-call.js`, `chat-vectorization.js`, `eventbase-workflow.js`, `text-cleaning.js`, `world-info-integration.js`, `eventbase-extractor.js` |

## 8. Open items (also in PROGRESS.md)

**Owner-side**
- **Playtest in SillyTavern** with `docs/TEST_CHECKLIST_v1.6.md` (card + preset + VectFox, 1.6.9), then `docs/TEST_CHECKLIST_v1.0.3.md` (Builder vs the real helper), then `docs/TEST_CHECKLIST_v1.0.md` and `docs/TEST_CHECKLIST_v0.5.md`. Nothing has been tested inside ST yet; all testing so far is headless.
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
- Player lifecycle (graduated / expelled / repeating). Cohort year labels: the roster, the UI and (1.7.0) the Cast Sheet are year-aware; the dossier's lore text itself still says what the lorebook says.
- A save-migration protocol for future versions (`$eng.ver` now records the engine version).

**Possible later token saving**
- Hide clues of solved threads from the AI.

## 9. Environment notes for the next session

- `node_modules/` and the original portrait PNGs are **not** in the zip. Run `npm install`. Portraits are already hosted; `process_assets.py` is only needed for new portraits.
- The plan file's "resume protocol" was written for an earlier workflow. This HANDOFF supersedes it: one zip carries everything, and `PROGRESS.md` is the log.
- Checkpoint naming used so far: `eldrasil_project_<version or batch>.zip`, with the project in a single top-level folder.
