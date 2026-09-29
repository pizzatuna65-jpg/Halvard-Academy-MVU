# HANDOFF — Eldrasil / Halvard Academy MVU card project

**Read this file first.** It is the complete context for continuing this project in a fresh session with any AI assistant, from any vendor. It assumes nothing about which assistant or tools you have, only that you can read files and (ideally) run Python 3 and Node.js.

Snapshot: card **v1.16.1** (2026-09-29). 1.16.1 is Batch 1 of `planning/AUDIT_2026-09-29.md` (owner approved every finding; five batches, stop after each until the owner says "lanjutkan batch N"): club names, used items need the item, happenings, one "away" rule, engine rollback on error, `_Log` in `<current_state>`, OOC, `tools/build_all.py`, and the folder is now a local git repository. 1.16.0 1.16.0 applies `planning/DRAFT_dynamic_ambience.md`: crowd, light and a sensory cue type per place and hour, seeded ambient beats, a secret uncanny roll over 17 ghost stories (ten new), Features Ambience Off / Texture / Full. `npm test` passes (73 suites + static QA, 2,392 checks). 1.15.2: 1.15.2 adds the speeches at Remembrance Day (Headmaster, Vice Headmaster, Acting Warden Rei, who dislikes ceremonial speeches but gives one as a duty) and on the Crowning Day morning. 1.15.1: every formal event opens and closes with the Headmaster's and Vice Headmaster's speeches (every feast begins with them), and the far grounds (Lake, Grassy Field and Hills, Forest) are far (Gardens to the boathouse 20 minutes, the Fishing House 3 minutes from the boathouse, the Forest Clearing 30 minutes into the Forest). Card 1.15.0 applies `planning/DRAFT_grades_exams.md`: the engine marks every subject A–F at each exam, and the marks drive the dorm rank, exam reputation, remedials, tutoring pay, teacher XP and Fortune. `npm test` passes (72 suites + static QA, 2,330 checks), `npm run stress` is clean. All 13 season and event maps are live (assets commit 1ece91e). 1.13.0 makes the map follow the calendar (`map_variants` in `data/assets_manifest.json`;
the Star Night map waits for its upload to the assets repo); 1.13.1 names the five nations at the Academy Bazaar and adds the
img2img prompts for the season and event maps (`planning/DRAFT_event_maps.md`); 1.13.2 makes their visual lore canon (owner-approved;
Eldrasil's royal colours are deep blue and gold); 1.14.0 gives 26 places a line per season and prints exam-week and pre-break lines
only while they apply (`planning/DRAFT_dynamic_lore.md`); the default map counts as Summer; 1.14.1–1.14.2 give Graduation a winter farewell
market (Main Courtyard and Founder's Park) and a map prompt. At 1.12.0 `npm test` passed (68 suites + static QA, 2,194 checks) and
`npm run stress` was clean.
1.12.0 applies `planning/DRAFT_missed_reports.md`: the engine derives what the narrator often forgets to report (sleep from a
skipped night, the Bag after a used item, unlogged Points, summons and sustained effects kept in step) and `<now>` reminds it once of
the rest (engine section 8l); the documentation drift (stale checklist links, old figures) is fixed. The release history is in
`CHANGELOG.md` (a one-line-per-release index at the top, details below it). Live SillyTavern checks: `docs/TEST_CHECKLIST.md`.

**Next task:** audit **Batch 2** (tokens and preset: T1 the "[…]" messages, T2 Price Guide by place, T3 a lighter Bonds block in `<current_state>`, T8, P1 the Bridge's card rules into 504, P2 the Main Prompt's random events, T6 as an experiment) when the owner says "lanjutkan batch 2"; then Batch 3 (integrations), 4 (data architecture), 5 (engine refactor), as listed in the audit's section 11. Live checks: `docs/TEST_CHECKLIST.md` (v1.16.1 first, then v1.16.0 and older).

---

## 0. Starter prompt (for the owner to paste into a new chat)

> Read `CLAUDE.md`, then `HANDOFF.md`, then the top of `CHANGELOG.md`. Confirm the snapshot version and the test status, then do this: **<task>**. Follow the working rules in HANDOFF §2.

For the next session: `<task>` = "fix what my playtest found: <notes>" or any of the examples below.

Other examples of `<task>`: "bug hunt the engine and UI", "add a new NPC from this lorebook entry", "update lore entry X", "add feature Y", "compare your approach to Z with what is here".

---

## 1. What this is

A **SillyTavern character card** for a slice-of-life magic-academy roleplay: Halvard Academy, Kingdom of Eldrasil, with a mystery underneath. The player is a first-year student. The card combines four parts:

- **A merged, corrected lorebook** (269 worldbook entries): world, 56 NPCs (6 arrive in campaign Year 2), 67 locations, calendar, rules.
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

- **Testing (owner update 2026-09-27).** For routine changes, run only a quick, relevant check with concise output and low usage. Do not run the full test suite, stress tests, broad bug hunts or repeated verification unless adding a major feature or the owner explicitly requests them. This overrides the older per-release test instructions elsewhere in this file and `CLAUDE.md`.

- **Language.** Discuss with the owner in **Indonesian** unless they write otherwise. Everything *inside* the card (prompts, UI text, variable names, builder) is **English**.
- **No pedantry.** Do not nitpick minor things. **Do** flag anything that breaks functionality or contradicts an established decision (§4). Say which decision it contradicts.
- **The UI never moves the story itself (D3/D6).** State changes happen through MVU commands in chat. Buttons such as "Go here" only fill the chat input for the player to edit and send. Player-tool writes (Builder, Settings) go through a hidden user message carrying an MVU patch.
- **Single sources of truth.** Edit the source (template, `data/*.json`, tools), never a generated file (§5).
- **Deliverable per task.** Updated sources and rebuilt outputs (`dist/`, generated scripts, preset) in the repository, a `CHANGELOG.md` entry (what changed, tests, open issues, next step) and a current HANDOFF snapshot. No zip unless the owner asks.
- **Verify, don't assume.** External behaviour (MVU, Tavern Helper, SillyTavern, VectFox) has repeatedly been settled by reading upstream source (§7). Do the same for new questions. Mark anything testable only inside SillyTavern as such.
- **Canon.** The owner's lorebook is canon. Invented content (prices, happenings, UI descriptors) must not contradict it. When unsure, check the lore text in `src/worldbook/content/`.

## 3. Repository map

```
HANDOFF.md                 this file
CHANGELOG.md               release history (index at the top, newest details first), open items, tunables  (read second)
CLAUDE.md                  instructions for AI sessions (read first)
README.md                  short readme: downloads, layout, build and test
package.json               node test deps (zod@4, lodash, yaml, ejs, d3); `npm test`
build/build_card.py        assembles dist/Eldrasil_Halvard.json (ccv3) + .png (chara + ccv3 chunks)
source_original/           owner's lorebook v38 (never modified; the pipeline input)
  npc_lore_2026-09-25/     owner-approved full NPC entries (brainstorm 2026-09-25); merge_lorebooks.py lays them over v38
tools/
  merge_lorebooks.py       v38 -> src/worldbook (card lore, uid<500) + dist/lorebook_v39 (standalone) + canon fixes D17/D18/D23-25
  curate_data.py           v39 -> data/npcs.json, locations.json, map_pins.json (+ calls build_relations.py -> relations.json)
  gen_engine.py            src/scripts/engine.template.js + mood_gifts.js + data -> engine.js (NPC aliases, castle places, happenings pool)
  gen_mvu_entries.py       custom worldbook entries 500-507 index + generated 505 (Now EJS, from custom/505.template.ejs) and 506 (Price Guide)
  feature_cost.py          (run by gen_mvu_entries) measures each feature's EJS-gated rules -> data/feature_cost.json
  common.py                shared data helpers: club membership, outdoor places (used by gen_engine, gen_mvu_entries, gen_ui)
  gen_ui.py                ui.template.js + src/ui/parts/*.js + data -> ui.js ; statusbar.template.html -> statusbar.html
  process_assets.py        portraits -> WebP (needs the original PNGs; not in the repo)
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
docs/                      PLAYER_GUIDE, ECOSYSTEM (card + preset + VectFox; vectfox_cleaning_patterns.json), TEST_CHECKLIST
                           (every live SillyTavern check), system_state.txt (Year 1/2 playtest state, evidence for the 1.9.x batches),
                           design/ (approved 1.3.0 designs, Indonesian: bond_rewards, reputation, training), rentry/ (public guide),
                           archive/ (original master plan ELDRASIL_MVU_PLAN.md, SPEC_v1_1_0_world_systems.md)
planning/                  DRAFT_*.md (approved designs; several are read by tools and tests, keep them in place), FUTURE_PLANS.md,
                           NPC_BRAINSTORM_BRIEF.md (kept by hand; `tools/make_npc_brief.py` writes a fresh export to docs/npc_brainstorm/ on demand)
tests/                     node suites test_*.cjs, qa_static.cjs, run_all.cjs, token_audit.cjs, harness.cjs; preview/ (playwright)
```

## 4. Established decisions (do not break without the owner's approval)

**Framework and state**
- **MVU ZOD schema** (D1): `z.boolean()` (never `z.coerce.boolean()`), clamps via `transform`, defaults via `prefault`, and tolerant coercion.
  - Prefix `_` means AI-visible but engine-written. The engine reverts AI changes to `_Techniques`, `_Affinity` and `_True_magic` unless the Builder authorises them.
  - Prefix `$` means hidden from the AI. Since 1.11.0 entry 501 renders `<current_state>` itself (EJS, `getvar('stat_data')`): it omits `$` keys, empty values and the retired `Bonds.*.Progress` / `_Event_ready`, as YAML. Before that, Tavern Helper's `{{format_message_variable}}` did the `$` omission (verified).
- **Cast Sheet** (1.5.1, owner-approved plan P1, changes "Lore activation → keyword WI" for present NPCs): custom 509 (@D1) is generated by `gen_mvu_entries.py` from `509.template.ejs` plus every NPC's lore text, one EJS section per NPC, so EJS inside lore still renders. The engine picks the sheets (`$ui.cast`: `full` at most 4, `brief`, plus `spoke` / `gone` / `ment` from the reply's prose); `merge_lorebooks.py` wraps every NPC keyword entry so it prints nothing while that NPC has a full sheet. The last-mile gate 510 (@D0) sits before 503, so `<UpdateVariable>` stays last.
- **Every enabled entry is tagged `[mvu_update]` or `[mvu_plot]`** (D2). The only untagged enabled entries are uids 0, 20, 97, 131, 132, 134, 501 and 505; the disabled control entries 500 (`[initvar]`) and 507 (`[config_override]`) are untagged by design.
- **Engine is deterministic and replay-safe** (4.6). It is a pure function `runEngine(after, before, text, seedHint, userText)` (1.12.0: `userText` is the player's last visible message, read by the hook from `SillyTavern.chat`).
  - Never use `Math.random`.
  - Happenings are seeded by `$eng.seed`, which is set once from the creation time of the first processed message.

**Rules the engine and prompts enforce**
- **The Arbiter Stone reads only `Magic._Affinity.Dominant`** (D9 / A1). Elemental→Fire, Mystic→Light, Spiritual→Viridian, Occult→Sky.
- **Power level is the player's choice** (D10). Never quietly nerf it. Since 1.2.0 there are no presets: the Builder sets `Mana_max` with a slider, and mana is private capacity (504), not a title.
- **Technique costs are fixed** in the Builder and charged by the engine (D11).
- **Missed reports** (1.12.0, owner-approved `planning/DRAFT_missed_reports.md`): what can be derived is derived (a skipped night is sleep unless Resting is `awake`; `/Consumables` lowers the Bag, and since 1.16.1 works only for an item in the Bag or bought in that reply; unlogged Points get a "not itemised" line; a pact's `Summoned` and its Summon effect follow each other; a sustained or hybrid technique in `Casts` only becomes an Active effect; a renamed effect keeps running). The rest is only reminded in `<now>` (engine section 8l, `$ui.missed`, at most three, not repeated within two days, Features row `reminders`): a reminder never changes a number, and bond XP and Trust still come only from reported interactions.
- **HP is injury, not a life bar** (D13). One event removes at most 40 HP unless `Lethal_flag` is set. HP 0 means death. Every HP loss names an injury.
- **Builder scope** (1.2.0, owner): Combat_role is assigned by the Combat teacher at the first Combat class (rule 502), not chosen in the Builder. Known_by is left to the story. The true magic is a hidden technique (Notes `[true]`). Pacts carry a Kind; only Spirit is lawful (anything else is the forbidden art of Pacting). The Builder keeps `$ui.file`; the engine restores the Builder-only fields from it when they come back empty.
- **Player-tool entries are hidden and carry no status placeholder** (1.2.0): Tavern Helper never renders iframes in hidden messages, so the bracelet stays on the last story message and reads the newest state.
- **Player tools and `_` paths** (v1.0.3): the MVU zod helper drops every command whose path has a `_` segment, for everyone. The Builder therefore writes `/Magic` and `/Hidden` whole (`liftReadonly`), and the engine's read-only guard decides. Never send a `_` path from a player tool.
- **Calendar change** (v1.0.3, owner decision): the World Competition is M11 W4 Wed–Sat (abroad, the national four) and Graduation is M11 W4 Sun, so a third-year picked for the World Competition competes before graduating. Month 12 is holiday only. Edited in `merge_lorebooks.py` (calendar months 11/12 and lore 248) and in the engine's `EVENTS`.
- **Graduation** (v1.0.3): on M12 W1 Mon 07:00 (the morning after Graduation, first day of the holiday) the engine moves that year's Halvard third-years into `Campus_State.Graduated`. They stop being regulars and club members; their bonds and dossiers stay. The story may remove a name, and the engine never re-adds it. 1.7.4 (owner, 2026-09-27: "Etnie tetap tinggal"): a third-year listed in `data/cohorts.json` `stays` (Etnie, whose canon goal is to fail her third year on purpose) is not sent away; the story can still graduate her. A graduate's own entry opens "Now: graduated".
- **Cohorts** (v1.0.3): a student's school year = lorebook Year + campaign Year − the year they arrived. `data/cohorts.json` lists incoming first-years per campaign year (1.7.0: Year 2 = Linus, Maple, Nerys, Hadrian, Wren, Tsubaki). Until their year an incoming NPC is inactive: its lore entry is empty (EJS gate), it is off the roster (uid 97, now year-aware EJS), not a regular or club member, not in the graph, and the engine starts no bond and records no name reveal. Arrival is journaled at the start of that campaign year. Since 1.7.0 the lines a cohort adds to older NPCs' files, the roster and the Regulars entries are gated the same way (EJS in the card, `[from Year N]` in the v39 export and a year-gated field in the UI data), the Cast Sheet's ties list only people who have arrived, and a sheet shows the school year of the current campaign year. 1.7.4: at a new campaign year the engine moves `Player.Profile.Year` up (unless the narrator changed it in that update; the story can set it back; nothing is modelled after Year 3, owner: leave it for now) and clears last year's `Competition`; ages in Halvard NPCs' lore add the campaign years since Year 1 (a cohort: since it arrived); from Year 2 every date the engine writes carries its year ("Y2 M1 W1 Mon"), the first update in Year 2 dates Year 1's lines "Y1", and a line without a year is read as from the last 12 months. Rival academy students (Role "Student, <academy> Academy. <N> year") move up the same way and graduate after their third year: their entry says so and their team entry names who left (owner, 1.7.4; new members come later). A class with no teacher on record is the narrator's to create (owner, 1.7.4).
- **Bonds** (owner, v1.9.0): Rank 0–10. XP comes from reported interactions with existing daily/weekly limits. A full bar, cooldown, Trust/Tension gates and the next genuine encounter with that present NPC advance one rank automatically; direct narrator Rank writes are reverted. Rank 8 branches remain canon-bound and recorded from the relationship at that point. `data/rank4_partners.json` is the authoritative per-NPC table for shared mana training, stamina training and study. Rank 2, 4, 6, 7 and 9 benefits follow `planning/DRAFT_rank_perks.md`; Rank 5 unique gifts need a reported handover. `Extras` and rival teams never receive a bond.
  - **Gifts and birthdays (1.8.0):** the engine resolves `Item` through the per-NPC table (hated, loved, disliked, liked), then universal rules; narrator `Gift` is only a fallback for unknown/contextual items. Five tiers, two XP-bearing gifts per week, with the first birthday gift doubled and exempt. Negative birthday gifts double Tension even after the XP cap. Keep the latest 24 item/tier discoveries in engine-owned `$gifts`, including across whole-bond rewrites. Krieg gets no gift XP. Birthday knowledge follows openness-adjusted Rank 3 or an explicit learned fact. Greeting/gift grants +2 Trust once, birthday social XP is ×1.5 and recovery ×2. Parties need an available Rank 7 organiser, invite student friends at Rank 5 and Tension <40, and grant +3 XP only for reported attendance between 18:00 and the actual curfew.
  - **Mood and weather (1.8.0):** deterministic Good/Normal/Bad from canon weather, circadian rhythm, events, health and a seeded daily roll; Ezrel stays Normal. Full applies social/apology/Tension modifiers; Flavor narrates only, Off parks effects. Mood icons open at Rank 4. Tired halves training, Exhausted/Collapsed stop it; moderate injury blocks stamina training and serious/critical injury blocks all training. Awake 00:00–06:00 accrues sleep debt, cleared by six consecutive hours asleep; The Vigil suppresses it for 48 hours then needs two full nights to recover. Wind alters outdoor cast/trigger/upkeep costs by subtype (custom Builder choice), with shelter from a wind-blocking barrier. See the approved draft and tests for edge cases.
  - Dossier info unlocks by rank.
  - `<narrator_only>` lore is never unlocked by rank, only through `Campus_State.Secrets_revealed`.
  - A qualified label (`Magic (public)`, `Personality (daily)`) unlocks at its field's rank; the dossier drops "(public)" / "(surface)". Trauma (Rank 8) is optional and only shows where it exists.

**Bond rewards, reputation, training (v1.3.0, owner brainstorm 2026-09-25; `docs/design/`, data in `data/bond_rewards.json`, `reputation.json`, `training.json`)**
- **Rewards** (current v1.9.0): Rank 5 marks the gift pending, then `_Perks` receives it only when the NPC gives it in the story and `rank_gift` is reported. Rank 10 records that NPC's unique benefit. Graduates' existing gifts become mementos and Rank 10 benefits end; an absent graduate gives no new reward. One-use rewards are spent through `/Perk_use`. High ranks open information, never endings.
- **Mask → truth** (Castor, Kanae, Caine): advancement to Rank 8 adds a nudge Fact; advancement to Rank 9 waits until one secret is in `Secrets_revealed`. No scripted event is needed.
- **Krieg**: the 0→1 introduction is ready at once; then +14 XP every Monday while Doves reputation ≥ +1 (with hidden magic also Dove attention ≤ 39), else Tension +1; nothing from interactions.
- **Reputation** replaces Public/Dorm (Dorm is scrapped): Academy, Student, Doves, −5..+5 from signed Rep XP (thresholds 15/35/60/90/125, clamp ±125). The narrator reports `/Rep_events`; repeatables capped +5/week per reputation, events and losses uncapped, bond milestones (engine) only below +3. Levels modify bond XP per talk/hangout (staff, students, anti-/pro-Dove NPCs). Academy +5 adds a monthly bonus, −5 halves the payout. Doves reputation is not Dove attention.
- **Grades and exams** (1.15.0, owner-approved `planning/DRAFT_grades_exams.md`): the engine owns `Player.Academics` while Study and exams is on. Marks A–F per subject from the preparation tier, an attendance floor (no skip: at least C), skips, the exam-day condition, training (Combat) and four bond rewards (Gareth, Layla, Mimosa, Alyssa), then the story's `/Exam_events` (one step, or `Fail`). Midterms post on the exam week's Friday, finals on Results day. Dorm rank = (midterm + 2 × finals) / 3; exam reputation is engine-written; F → a remedial Commitment (attended: counts as D); A/B → +1 XP with that subject's teacher; A → Fortune +10 in its field and paid tutoring (`/Tutoring`, 40 points, two a week).
- **Training**: Mana pool and Stamina, reported in `/Training`; one session +1% of the starting value × (1 + 0.5 per partner in the scene), weekly cap 2.5%, lifetime cap 2× the starting value; jumps (Gavlan gift, Vallie Rank 10) +10% outside the weekly cap. `Mana_max` / `Stamina_max` change only through training or the Builder (other changes are reverted; a Builder change moves the starting value).

**World systems (v1.1.0, owner decisions in the spec)**
- **Weather** is a pure function of (`$eng.seed`, day): northern seasons, sky per morning / afternoon / night, wind, rare weather, °C, metric everywhere (the card's World Index states metric units since 1.11.2; before that the preset's Bridge asked for metric prose; "Time and Place" stays OFF). Weather **never** changes technique costs (D11; weather attunement was rejected) and never removes HP by itself (D13).
- **Weather effects setting** Off / Flavor / Full (`$ui.wxfx`, default Full). Flavor = weather shown, no effects. Away from campus there is no campus weather.
- **Forecast**: the Divination Society (never a member's name) posts tomorrow's skies at 07:00 on the Notice Board, ~75% right (`FC_TRUE`), rare events never forecast; only the Notice Board and `<now>` show it.
- **Conditions** (`Player.Conditions`) come from the weather; the engine adds and clears them, the story may remove one.
- **The Bag** (`Inventory`): Plan is free text, no reminders; gear works by item name; Sunfizz bottles return for 2 points (canon) at the Commissary or The Mall. Qty 0 removes an item (schema 0–99, see CHANGELOG).
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
- **Colour themes** are palette only (`data/themes.json`, generated by `tools/make_themes.py`) and per browser (storage key `eld.theme`): the one allowed use of browser storage in a script (qa_static checks it). Never store game state there. The bracelet also keeps its collapsed state (`eld.bar.collapsed`) and, per tab, which toasts it already showed (recorded in 1.11.1; qa_static checks the bracelet too).
- **UI code that animates** must not rely on the script iframe's `requestAnimationFrame` (Tavern Helper runs scripts in a hidden iframe, where it never fires); use SillyTavern's window (`PD.defaultView`) or compute at once (see the Connections graph).
- Every panel except the Builder shows `{{user}}` in lore text as the student's first name.
- **One version number** (1.3.4): `src/card/card.json` `character_version`. gen_engine.py puts it in ENGINE_VER and build_card.py in the [initvar] entry (`$eng.lore`), so a chat started from an old lorebook in SillyTavern is detected on its first update. Importing a card again does **not** replace its lorebook in ST (ST offers it once per character file), so since 1.3.6 the UI script installs a missing lorebook itself and asks before updating an older one (`ensureLorebook`, SillyTavern.getContext() world-info calls).
- **EJS entries share one scope in ST**: the Prompt Template extension compiles entries that land together as one template, so build_card.py wraps every EJS entry in `<%_ { _%> … <%_ } _%>`. Test EJS by rendering the entries together, not only one by one.
- **Themes never touch the map**: pins, labels and map crops keep fixed colours (`/*keep*/` after a colour opts out of re-colouring). The bracelet finds its CSS by id (Tavern Helper puts its own `<style>` first in message iframes).
- **The student's picture** is a SillyTavern user image (`/api/images/upload`); the chat keeps only its path (`$ui.portrait`). Never put image data in the variables (every message stores them).
- **Connections** (1.4.1, owner): every NPC->NPC line type is curated by hand in `data/relations_curated.json` (seven kinds: friends, softspot, protective, respect, rivals, wary, dislike); never go back to keyword guessing. Since 1.6.10 (owner: lines in one NPC's entry often describe another NPC's view) the direction is curated too: key `A>B` = a sentence in A's file mentioning B, value `type` (A → B), `<type` (B → A) or a list of both, optional `/N` = which of its sentences are that line's notes; the line opens with the bond of A, whose file tells it (`rank:N@A` in the UI data). New lore that mentions another NPC needs a curated entry (the build fails otherwise). Dorm / club / faction are group label nodes (`data/factions.json`), not lines between people. Dragged nodes stay where they are dropped.
- **Tension** (1.3.8, owner): the same bands and effects for everyone (40 XP halved, 70 rank progression paused, 90 no XP, 100 rank −1); how an NPC plays it comes from its category in `data/tension.json` (withdrawn, social, confrontational, authority, dangerous) or a personal override (Etnie, Kanae exempt, Althair locked at 0 with XP conversion, Ezrel half rises). Rises are never capped (owner: easier to make enemies than friends); only easing is limited. Apologies (1.4.0) are reported by the narrator and eased by the engine per category (`apology`), per NPC where it differs (`apology_npc`: Sophia takes it as weakness). Every bonded NPC must have one (gen_engine.py asserts it). A new NPC needs a category. Since 1.4.4 maximum Tension breaks one rank per blow-up (re-armed below 70), kindness eases it (`kind_ease`), and each category / override says how the character takes teasing (`banter`, shown in <now>); rule 502 judges deeds by intent.
- **Trust** (1.4.3, owner): `data/trust.json`. Bands Betrayed / Doubtful / Neutral / Trusting / Confidant with the same effects for everyone (what they share, XP, how Tension and apologies land); rank progression and benefits need Trust (Rank 6: 35, Rank 7: 50, Rank 9–10: 65; progression to Rank 8 never waits for A and B NPCs, but under 50 it can only end in a sworn rivalry and romance is refused; C and D NPCs, who have no rival branch, wait for Trust 50 (1.6.8, owner); a Rank 10 benefit is suspended under 35). Rises only from reported deeds (keep, secret, defend, confide, help; capped +8 a week) and +3 per rank earned; the narrator writes drops (uncapped; 20+ spreads −5 to the NPC's Friends lines). The category is the NPC's openness (`data/bond_openness.json`), so a new NPC needs only an openness tag. A new bond starts at its category's Trust (open 60, normal 50, guarded 40, closed 30), whatever the narrator writes on the first meeting (1.6.11). Overrides: Etnie, Kanae, Althair, Ezrel, Caine, Krieg; `dorm_head`: Ottavio is easier on Sky students (bond, Tension and Trust).
- **Pact abilities** (1.3.2, owner): a pact partner has a list of abilities like a creature's moves; each is its own technique `<partner>: <ability>` with its own cost, and Summon only pays for the partner being there (a pact without abilities keeps the old hybrid Summon). The engine charges an ability only while the partner is here.

**Map and UI**
- **Map** (D5/D7/D8): pins use percent coordinates from `data/map_pins.json`. Card headers are crops of the map, with no illustrations. Location cards are structured.
- **Modules appear only when relevant** (D16), via `$ui.unlocks`. The Shop tab appears only at a shop (1.2.0).
- **Walking times follow the map** (1.2.1, owner) **on the castle grounds only** (1.15.1, owner: the map draws the far grounds too close). The Lake (Boathouse, Fishing House, Willow Island), the Grassy Field and Hills (Observation Tower, Old Hut) and the Forest (Clearing) are reached only by `FAR_LEGS` in `curate_data.py` (Gardens–boathouse 20, Courtyard–Hills 20, boathouse–Fishing House 3, Forest–Clearing 30, ...); the Campus Map walking line states the computed times (`tests/test_far_grounds_v1151.cjs` checks it). `curate_data.py` computes legs (map distance 0.22 min per unit, lore times on forest and boat legs, castle stairs) into `locations.json` `near`; the Campus Map lore line states the same numbers. The bracelet shows above the narration (display regex).
- **Map cards** (1.2.0, owner): every card has Walk (from where the player is), Access, Clubs here, Regulars (only NPCs met whose Haunts entry is unlocked), Connected to; one card at a time with arrows. Club venues follow the owner's map (Running at the Sports Field, Archery at the Archery Range, Swimming/Gymnastics/Basketball at the Gymnasium, Divination at the Observation Tower); the Fishing House and Willow Island are their own places.
- **The status bar shows only on the latest message** (F22).

**Assets and memory**
- **Ambience** (1.16.0, owner-approved `planning/DRAFT_dynamic_ambience.md`): engine section 8m from `data/ambience.json` (categories and crowd rhythms, the sun table, cue and beat *types*, the uncanny stories). The preset's World Sim stays OFF. Beats use unnamed people only and change no number; the uncanny moment is narrator-only and never confirmed. Add a ghost story in `merge_lorebooks.py` `GHOST_STORIES` and its row in `ambience.json` `uncanny`.
- **Lore by season** (1.14.0, owner-approved `planning/DRAFT_dynamic_lore.md`): season lines live in `merge_lorebooks.py` `SEASONAL` (card: EJS by calendar month, one line prints; v39: all four as "In <season>: ..." lines, which `curate_data.py` lifts into `locations.json` `seasons` for the Map cards); phase lines in `PHASES`. Add a place's season line there, never in the generated entries. The default map is the Summer map.
- **Map by calendar** (1.13.0, owner): `map_variants` in `data/assets_manifest.json`, first match wins: an event map while the event is on (optionally in its hours), then a season map, then the default. Every variant is 1536×1024 with the default's layout (pins and card crops are percent positions on it); a variant that fails to load shows the default. UI only: no state, no rule.
- **Assets** live in `github.com/pizzatuna65-jpg/eldrasil-assets`, served via jsDelivr. They are **pinned to commit 1ece91e** (1.14.4: the season and event maps with the fixed Independence Day map; e64b4b1 and 172dc4a before), and `base_url` exists in one place only: `data/assets_manifest.json`. Never ship `@main`.
- **State-as-memory**: the narrator reads the latest ~24 messages (card regex, promptOnly, minDepth 24).
  - The Journal keeps the latest 30 lines for the AI. Older lines move to `$ui.archive`.
  - Bonds show the latest 10 `Known_facts` to the AI. Older facts move to `$Known_old`.
  - The UI shows everything.
  - 1.6.0: Knows keeps 15 lines per bond (older in `$Knows_old`), Imprints 5, `$Defining` 5. Mind, Knows and Imprints are the narrator's; the dossier never shows them.
  - 1.6.1: Extras keeps 20 invented characters (least recently seen leave into `$ui.xold`, 40, and come back if they return; Keep is the player's). `Campus_State.Events` are `{Text, Updated}`; the engine owns Updated.

**Card configuration**
- **MVU card config override** is uid 507 `[config_override]`, a disabled entry: `更新方式 = 随AI输出` (update with the AI reply) and `兼容性.更新到聊天变量 = false`.
  - Reason: in tool-call mode, updates arrive without prose, which breaks name reveals from story text.
- **Story style is owned by the preset.** The card sets no prose style, point of view or length.

**Ecosystem**
- **The card is the only tracker.** The preset's Internal States family stays OFF: Bonds/Relationships RPG, GM Notebook, Agenda, Chekhov, World Sim, Fate & Routine, Thoughts.
- Do **not** vectorize the card's lorebook for VectFox Semantic World Info. It injects raw text, so EJS stays unrendered, MVU filtering is bypassed, and lore is duplicated.
- Use **either** VectFox ghosting **or** the card's trim regex, not both.

## 5. Build, test, and generated files

Requirements: Python 3.10+ (PIL only for `process_assets.py`), Node 18+ (tested on 22), and optionally Playwright + Chromium for UI previews.
On the owner's Windows machine `python3` is not on PATH: run the commands below with `python`.

```bash
npm install                          # zod@4, lodash, yaml, ejs, d3
python3 tools/build_all.py            # 1.16.1: the whole rebuild below in its order (+ --lore / --themes / --preset), then node --check
# rebuild (run only the steps whose inputs you changed; order matters)
python3 tools/merge_lorebooks.py     # lore changed in source_original/  (then re-run curate_data.py)
python3 tools/curate_data.py         # NPC / location / relation data changed
python3 tools/gen_engine.py          # engine.template.js, npcs, locations or happenings changed
python3 tools/gen_mvu_entries.py     # custom entries, locations regulars or shop prices changed
python3 tools/make_themes.py         # 1.3.1: only when the colour themes change (-> data/themes.json)
python3 tools/gen_ui.py              # ui.template.js, ui/parts, statusbar.template.html or data changed
python3 build/build_card.py          # always last -> dist/
python3 tools/build_test_card.py 7   # optional: dist/test/ TEST card, every bond at Rank 7 (own lorebook name)
python3 tools/build_test_card_year2.py   # optional (1.7.5): dist/test/ TEST card that starts in campaign Year 2 with varied Year 1 bonds
npm run stress                       # optional (~30 s): fuzz, Builder fuzz, a simulated school year (tests/stress/)
npm test                             # 68 suites + static QA on the built card (2,194 checks at v1.12.0)
python3 tests/preview/smoke_all_panels.py   # optional: opens every panel/tab headless (2,569 views at v1.11.0); expects "errors: none"
node tests/token_audit.cjs           # optional: always-on prompt size (~13.9k tokens at start, ~17.9k heavy mid-game at v1.12.0)
python3 presets/edit_preset.py       # regenerates the edited preset from presets/original/ (deterministic; run twice, compare)
node tests/fixtures/make_save.cjs    # BEFORE changing anything in a release: writes the current release's save fixture
node tests/fixtures/make_save_yearend.cjs   # 1.7.4: the same save played to the end of Year 1 (after make_save.cjs)
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
- `data/shop.json` (prices; canon prices are locked; 1.9.5: `gear` / `use` item effects, worded by `tools/common.py` `effect_text()`)
- `data/bond_rewards.json`, `data/reputation.json`, `data/training.json` (1.3.0; from `docs/design/`), `data/bond_rules.json` (1.3.1: `start`), `data/bond_openness.json`, `data/tuning.json` (1.3.1 Settings rows)
- `source_original/npc_lore_2026-09-25/` (NPC entries that replace v38's; edit lore there or add a newer pass the same way)
- `data/happenings.json` (seeded campus events; `where` must be a real location name)
- `data/field_overrides.json`, `focus_overrides.json`, `thumb_overrides.json`, `assets_manifest.json`
- `data/features.json` (Features settings rows, parked paths, unlocks), `data/npc_moods.json` (44 mood profiles), `data/wind_casting.json` (subtype costs), `data/gift_prefs.json` (tastes and birthdays), `data/gift_shops.json` (Mall shop lore)
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
- **Add a folklore or nation entry** (World Myth, Superstition, Ghost Story, Brand; 1.7.1 pattern; nations: `NATIONS`, `template_from(C[246])`, 1.7.2). Add it to `WORLD_MYTHS` in
  `merge_lorebooks.py` (or a list like it): a free uid, `template_from(C[222])` for the Superstition settings, keys and the text.
  Mention it with one `rep()` line in the entries that should know it exists (WORLD INDEX, the places and classes where it comes
  up), as the brands are mentioned in the Mall and the Main Library. Keep Lucifer and other secrets inside `<narrator_only>`.
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
  - `CHANGELOG.md` is updated

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

## 8. Open items (also in CHANGELOG.md)

**Owner-side**
- **Playtest in SillyTavern** with `docs/TEST_CHECKLIST.md`: the open v1.9.1–v1.13.0 checks and the Year 1 / Year 2 smoke playtest first.
- The 13 season and event maps are live (1.14.3–1.14.4); every map passed the pin check.
- Review `data/field_overrides.json` and `data/_review_sensitive_flags.json` for possible spoilers. This has been pending since Batch 1.

**Only verifiable inside ST**
- The trim regex's minDepth behaviour.
- `[config_override]` being picked up.
- `send_date` being available when the seed is set.
- The display regex `maxDepth` on hidden messages.

**Tunables after playtest** (v1.1.0 adds the weather and condition numbers listed in CHANGELOG)
- Payout bands, bond XP table and pace (data/bond_rules.json), rest/sleep recovery, the 40-HP cap, Dove attention increments.
- Happening rates, trim depth (24), Journal window (30), `FACTS_VISIBLE` (10), Clues cap (40).

**Not adapted yet**
- The preset's MAX and Micro CoT variants; only BOLT was adapted.
- The preset's DnD Simulator and Inventory need Internal States and must stay OFF with this card.

**v1.1.0 to confirm with the owner** (details in CHANGELOG 1.1.0)
- Deviations: Inventory Qty 0–99; the lore-based outdoor list; the Notice Board tab stays while story notices are off (it carries the forecast); clear_dusk needs a clear night.
- Token budget: +530 always-on with everything on (the spec's +30–60 was not reachable with its own rules); back to v1.0.3 size with the new features off.
- Only verifiable in ST: EJS rendering of the gated 502/504 (and in extra-model mode).

**Design decisions pending (from the v1.0.3 bug hunt)**
- Pin the MVU / mvu_zod dependencies to tested commits.
- 1.12.0 defaults to confirm: Dove attention and Transactions-only lines are reminded, not changed (draft H4, H3 b); the sleep
  reading covers one night only (a skip of more than a day keeps the old sleep-debt behaviour).
- Player lifecycle (graduated / expelled / repeating). Since 1.7.4 {{user}} moves up a year automatically; after Year 3 stays open (owner: leave it for now).
- Future plans: `planning/FUTURE_PLANS.md` (open: FP4 new rival team members, FP5 cohort 3; finished plans are removed from the file).
- Year 2 (`planning/DRAFT_year2.md`, owner 2026-09-27): planned later: a Student Council President election event, and the Council as a club {{user}} can join; new NPCs for the rival teams' Year 2 line-ups. Left as they are: teachers not on record (the narrator creates them), dorm ranks, after Year 3. Cohort year labels: the roster, the UI and (1.7.0) the Cast Sheet are year-aware; the dossier's lore text itself still says what the lorebook says.
- A save-migration protocol for future versions (`$eng.ver` now records the engine version).

**Possible later token saving**
- Hide clues of solved threads from the AI.

## 9. Environment notes for the next session

- `node_modules/` and the original portrait PNGs are **not** in the repo. Run `npm install`. Portraits are already hosted; `process_assets.py` is only needed for new portraits.
- The archived plan's "resume protocol" was written for an earlier workflow; this HANDOFF supersedes it, and `CHANGELOG.md` is the log.
- On the owner's Windows machine `python3` is not on PATH: use `python` for the commands in §5.
