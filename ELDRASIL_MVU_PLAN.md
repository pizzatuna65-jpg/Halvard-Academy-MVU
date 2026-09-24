# Eldrasil / Halvard — MVU Character Card: Master Plan v1.1

Status: **PLANNING FINAL, pending user "proceed"**. Discussion is in Indonesian; everything inside the card (prompts, UI, variables, builder) is in **English**.
This file is the single source of truth. It supersedes all earlier drafts, including "Eldrasil-MVU-Design-Draft v0.2" from another AI. Where decisions conflict, the latest user decision recorded here wins.

---

## 0. Resume protocol (READ FIRST, both user and Claude)

**Purpose:** work is split into Batches 1–5. You can stop after any batch, or after any checkpoint inside a batch, without losing progress.

**At the end of every checkpoint, Claude MUST:**
1. Save the full project tree as `eldrasil_project_bN_sM.zip` (N = batch, M = sub-step) and present it for download.
2. Update `PROGRESS.md` inside the zip: the last sub-step completed, open issues, and the next step.

**To resume (after credits refill, or in a new chat):**
1. Upload: this `ELDRASIL_MVU_PLAN.md` plus the **latest** `eldrasil_project_*.zip`.
2. Type: `lanjutkan Batch N` (or `lanjutkan dari checkpoint N.M`).
3. Claude reads PLAN and PROGRESS first, verifies the zip, and **does not redo** completed steps.

**Credit-saving tips:**
- **Start each batch in a NEW chat.** Every reply in a long chat re-processes the entire history, so later batches in the same chat cost far more. A new chat needs only this PLAN file and the latest zip.
- The container filesystem is **not permanent**. The downloadable zip is the only safe checkpoint.
- If a batch is cut off mid-way, use the last zip that was presented. At most one sub-step is lost.

---

## 1. Final decisions log

| # | Decision |
|---|---|
| D1 | Framework: MVU ZOD (MagVarUpdate + `registerMvuSchema`). Modern schema: no `[value,label]` tuples, `z.boolean()` (never `z.coerce.boolean()`), clamping with `transform`, defaults with `prefault`. |
| D2 | Every entry is tagged `[mvu_update]` / `[mvu_plot]` so both update modes are supported ("with AI output" and "extra model analysis"). |
| D3 | Every UI action that changes state is recorded as an MVU command in chat (replay-safe). No direct variable writes from the UI. |
| D4 | Portraits: 50 NPCs (49 + Bobby Becket, added in the user's v38), supplied by the user, **all files match** (verified). Hosting: GitHub public repo + jsDelivr. Base URL configured in **one place**. |
| D5 | Interactive map uses the user's `Halvard_Map.png` (1536×1024, no labels). Clickable pins open clusters; a cluster with several locations uses a **swipe** carousel. |
| D6 | **"Go here" button EXISTS.** Clicking it fills the chat input with a movement action (e.g. *"I head to the Mall."*) so the user can edit and send. Movement happens through chat, never by teleporting variables. |
| D7 | **No location illustrations.** The location card header uses a **map crop around its pin** instead (no extra assets needed). |
| D8 | Location cards are structured: Description / Vibe (from `Feel:`) / Regulars / Connected to / Walk time / Clubs here / Access / Lore & rumours / Campus changes. Curated data, not raw copy-paste. |
| D9 | The **Arbiter Stone reads only the magic TYPE** (Elemental/Mystic/Spiritual/Occult). It cannot see the subtype, or whether the magic is forbidden. **Assumption A1:** for a multi-type student, the Stone reads the **dominant** type only. |
| D10 | Magic is **not limited to one type**. Power presets: Grounded / Gifted / Prodigy / Unbound (OP allowed). The world reacts plausibly; there is no hidden nerfing. |
| D11 | Mana cost modes per technique: Per Use / Sustained / Hybrid (activation + upkeep + triggered). Costs are fixed in the builder, stored read-only (`_` prefix), and **computed by script**, not by the AI. |
| D12 | Hidden magic: true magic vs cover magic, concealment method, a "who knows" list, and a **Dove Attention** meter (Unnoticed → Rumoured → Watched → Investigated → Exposed). |
| D13 | **HP exists, but as injury, not an RPG life bar.** Stamina is added for exertion. Bands are in §4.2. HP 0 = death. |
| D14 | Bonds: Persona-style Rank 0–10 plus within-rank progress. Rank-up requires a milestone scene. Trust and Tension are tracked separately. NPC card info unlocks per rank. `narrator_only` content is **never** unlocked by rank, only by story evidence (`Secrets_revealed`). |
| D15 | Interactive NPC relationship diagram (D3 force graph), with visibility per edge. |
| D16 | Conditional UI: modules appear only when narratively relevant (idea adopted from draft v0.2). |
| D17 | Canon fix: **Crowning Day = airship trip to the capital** (Core 24 wins). The Calendar Month 4 text is corrected inside the card. |
| D18 | Canon fix: **Royhan**. His Dorm Competition qualification becomes date-gated (EJS). Before M3W4 he is "training for his last chance"; after M3W4 the canon outcome applies unless `Campus_State` changes it. |
| D19 | UID collision 254–262 (Core vs NPC) is remapped during the merge. The card embeds its own merged worldbook. **The player must NOT also enable the standalone v37 lorebooks.** |
| D20 | Opening: M1W1 Monday, Entrance Event (the default in the builder). |
| D21 | Rooftop is treated as **undiscovered** on the map until someone shows {{user}} the way (lore: the trick is passed student to student). |
| D22 | Pins confirmed by the user (v1.1, see Appendix A). Pin 31 has been dropped: that building is part of the Noble Houses' Liaison. |
| D23 | **NEW location** (pin 19): a building at the Combat Grounds that serves as equipment storage, rest area, and **Duelling Club HQ**. Working name: "The Sparring Pavilion" (the user may rename it). It is neutral ground shared by the four dorm training areas. |
| D24 | **Detention Tower = one of the castle towers**, not a separate building. It is part of the castle cluster. |
| D25 | **Royal Inspectorate = an office on Castle Floor 1**, not a separate building. It is still a crown office where the Headmaster has no authority. Its Floor 1 location puts it close to the Warden's Office corridor (useful tension over the ledgers). |
| D26 | Pin 32 = Meditation Rooms / Spirit House. Pin 23 = Commissary (open-sided stall, matches Core 83). |
| D27 | The lorebook will be clarified for D23–D25 (list in 1.2). A **standalone export `eldrasil_v39_*.json`** (= the user's v38 + the card-plan edits) is also produced for the user's own archive. |

---

## 2. Requirements for players (goes in README / creator notes)

- SillyTavern 1.13.5+ (MVU minimum is 1.13.4), Chat Completion API.
- **Tavern Helper (酒馆助手 / JS-Slash-Runner)**: MVU needs ≥3.4.17. The "formatted output / tool call" update modes need ≥4.8.4.
- **Prompt Template extension (ST-Prompt-Template, EJS)**, required for calendar, timetable, presence, and date-gated lore.
- MVU is loaded from jsDelivr by the card's script. The player's first load needs internet access.

---

## 3. Project layout (inside `eldrasil_project_*.zip`)

```
PROGRESS.md
build/build_card.py          # assembles card V3 JSON + PNG
src/worldbook/               # one .txt per entry + entries.yaml (keys, position, depth, order, tags)
src/scripts/                 # schema.js, engine_time.js, engine_vitals.js, engine_mana.js, engine_bonds.js, engine_hidden.js, mvu_loader.js
src/regex/                   # *.json regex scripts
src/ui/                      # statusbar.html, builder.html, panels (people, map, diagram, planner...)
data/npcs.json               # curated NPC data (public / rank-gated / secret fields, portrait focus point)
data/locations.json          # curated location cards
data/relations.json          # NPC–NPC edges (type, direction, visibility)
data/map_pins.json           # pin coords (% of map) + cluster membership
assets_hosting/              # optimized WebP ready for GitHub (portraits/, thumbs/, map/)
dist/                        # Eldrasil_Halvard.png (card) + .json
```

---

## 4. System design

### 4.1 Variable schema (stat_data), outline

- **World**: `Month`, `Week`, `Day` (Mon–Sun), `Time` (HH:MM), `Location` (location id). Derived and read-only: `_Period`, `_Curfew`, `_Lockdown`.
- **Scene**: `Present { npc_id: { Note } }`.
- **Player.Profile**: Name, Pronouns, Age, Race (+ beast type), Appearance, Background, Dorm, Dorm_rank, Club, Combat_role, Goal, Reputation { Public, Dorm }.
- **Player.Vitals**: HP / HP_max, Stamina / Stamina_max, Mana / Mana_max. Derived: `_Condition`, `_Fatigue`.
- **Player.Injuries** `{ name: { Severity, Body_part, Effect, Heals_by } }`.
- **Player.Wallet**: Points, Coin, `Transactions` (last 20).
- **Player.Academics**: Grades `{ subject: letter }`, Exams, Attendance notes.
- **Magic**: `_Techniques { id: spec + costs }` (read-only), `Active { effect_id: { technique, started, last_settled } }`, `Casts` (queue consumed by the engine), `Pacts`.
- **Hidden**: `_True_magic`, `Cover_magic`, `Concealment`, `Known_by[]`, `Dove_attention` (0–100).
- **Bonds** `{ npc_id: { Rank, Progress, Trust, Tension, Title, Romance, Known_facts[], Milestones[], Last_seen } }`. Created on first meeting only.
- **Campus_State**: `Events`, `Rumours`, `Location_changes`, `NPC_status`, `New_relations`, `Secrets_revealed`. Overrides the lorebook.
- **Commitments** `{ id: { Desc, Due, With, Type } }`.
- **Notices, Letters, Journal, Clues, Projects, Competition, Trip**: conditional modules.
- **Battle** (transient, only during a fight or competition): `Combatants { id: { HP, Stamina, Status } }`.
- **`$ui`** (hidden from the AI): module unlock flags, discovered map locations.

### 4.2 Vitals: HP and Stamina (D13)

HP bands (derived by script):

| HP | Condition | Consequence |
|---|---|---|
| 100–91 | Healthy | none |
| 90–71 | Bruised | cosmetic; minor pain |
| 70–51 | Hurt | noticeable impairment in demanding actions |
| 50–31 | Badly Injured | big injury; needs the Medical Centre; strenuous action/casting penalised |
| 30–1 | Unconscious / Critical | cannot act; needs stabilising |
| 0 | Dead | — |

- Every damage event must name a concrete injury, recorded in `Injuries`. HP is the gauge; the injury is the real consequence.
- **Single-hit cap**: one event cannot remove more than 40 HP unless it is patched as `lethal: true` with a narrative justification. This prevents instant deaths caused by AI misjudgment.
- Healing follows lore Core 82: the Medical Centre restores minor to mid injuries fully. Anything worse is stabilised and sent to a hospital.
- Stamina 0–100 (Fresh >70 / Tired 31–70 / Exhausted 1–30 / Collapsed 0). Collapsing forces rest; it is not an injury. Short rest recovers stamina fast; sleep restores it fully.
- NPC HP is tracked only inside `Battle` (fights, competitions). The aftermath (lasting injuries) goes to `Campus_State.NPC_status`.

### 4.3 Mana engine

- Default max mana by preset (tunable later): Grounded 100 / Gifted 130 / Prodigy 180 / Unbound custom.
- The AI reports: a cast (`insert /Magic/Casts/-`), the start or end of an effect, and time passing. **The script** charges costs from `_Techniques`.
- Upkeep is settled from `last_settled` to the current world time, and **only** for in-world time (never messages, swipes, or UI refreshes). No double charge on replay.
- At 0 mana a sustained effect ends at the depletion point, with a narrative consequence. Mana never goes negative.
- Recovery: sleep ≥6h restores to full; rest restores a small amount per hour. Passive recovery is blocked while upkeep is running (tunable).
- Pacts follow lore Core 249/122: summoning drains the whole time the spirit is present, plus a cost per ability; Channelling is per use and allowed **only for Greater or Spirit Lord tier**.

### 4.4 Bonds and NPC card unlocks

| Rank | Unlocks |
|---|---|
| 0 | Appearance, dorm/year, public role |
| 1 | Name, club, speech style, haunts |
| 2 | Magic seen in public |
| 3 | Loves / hates |
| 4 | Deeper personality, emotional tells |
| 5–6 | Goals; their views on others (also unlocks diagram edges) |
| 7–8 | Backstory; fears / trauma |
| 9–10 | Final bond scenes |

- Progress points come from meaningful interaction. The script caps them per NPC per day. When the bar is full, the state becomes "Bond Event ready"; rank increases only after a milestone scene. A toast notification appears on every unlock.
- The field mapping is curated per NPC, because field coverage varies (e.g. Backstory exists for 28 NPCs, Trauma for only 1).

### 4.5 Hidden magic

- Builder page: true magic, cover magic, concealment (natural, or a suppression technique that can cost mana upkeep), and who already knows.
- The Arbiter Stone reveals only the dominant type (D9). A forbidden art still belongs to a type, so the Stone shows the type without showing that it is forbidden.
- Dove Attention increases from: public use, detection drills in Dark Magic Defense, inspections, and witnesses. Each threshold injects narrative pressure (rumours, being watched, questioning).
- A cognitive-isolation rule for the AI: NPCs know only the public profile plus what is on the `Known_by` list.

### 4.6 Replay safety

All engines are deterministic. Random elements use the message creation time as the seed, never `Math.random()`. Global state is reinitialised on `VARIABLE_UPDATE_STARTED`.

---

## 5. Feature list

| ID | Feature | Batch |
|---|---|---|
| F01 | Student Builder (identity, background, magic slots, techniques and costs, pacts, hidden magic, presets, review) | 3 |
| F02 | Time/calendar engine + EJS (current month only, timetable "now", curfew, Thinning lockdown, Crowning Day trip) | 2 |
| F03 | Vitals: HP/Stamina bands, injuries, healing | 2 (engine) / 3 (UI) |
| F04 | Mana and magic engine | 2 / 3 |
| F05 | Hidden magic + Dove Attention | 2 / 3 |
| F06 | Points Bracelet economy (monthly payout by dorm rank, transactions, points math line) | 2 / 3 |
| F07 | Academic standing (dorm rank recalculation M5W2/M11W2, grades, exams) | 2 / 5 |
| F08 | Bonds (Persona-style) | 2 / 4 |
| F09 | Scene cast strip + NPC dossier with portraits | 4 |
| F10 | Relationship diagram | 4 |
| F11 | Interactive map + swipe clusters + structured location cards + Go here | 4 |
| F12 | Campus_State living world + Secrets_revealed | 2 |
| F13 | Presence helper (Regulars + time + curfew) | 2 |
| F14 | Planner / Commitments | 5 |
| F15 | Notice Board | 5 |
| F16 | Letters (Mail Tower) | 5 |
| F17 | Journal + Mystery Board (appears after the first clue) | 5 |
| F18 | Clubs, Competitions, Battle panel | 5 |
| F19 | Shop catalogue, Projects/crafting, Trip info | 5 |
| F20 | Seeded random campus events | 5 |
| F21 | State-as-memory (hide far chat, prompt-only regex) | 5 |
| F22 | Bracelet status bar (latest message only) + conditional module unlocks | 3 |
| F23 | Output format, regex set, `[mvu_update]`/`[mvu_plot]` tagging | 2 |

---

## 6. Batches

Size: S = small, M = medium, L = large (relative credit use). **Every sub-step ends with a checkpoint zip.**

### Batch 1: Data foundation (L). No UI yet
- **1.1** Project skeleton, `build_card.py`, `PROGRESS.md`.
- **1.2** Merge Core and NPC lorebooks, remap UID 254–262, apply D17/D18, replace the 12 calendar entries with one EJS-gated entry, tag entries. Lorebook clarifications for D23–D25:
  - New entry "Academy Location - Academic - The Sparring Pavilion" plus a Regulars entry. Update Core 52 (Combat Grounds) and the Campus Map club venue line for Duelling.
  - Core 86 Detention Tower: it is one of the castle towers (which floor it is reached from, its stairs).
  - Core 89 Royal Inspectorate: an office suite on Castle Floor 1 (crown banners, crown authority inside its doors). Remove "standing near the Cathedral and the Dovecote".
  - Core 132 Campus Map: rewrite the "Set apart from the core" paragraph (only the Dovecote, Cathedral, and Noble Houses' Liaison stand together), add the Inspectorate and Detention Tower to the castle floors, and fix the sentence "All but the Detention Tower sit on academy land…".
  - Core 256 Headmaster's Office: reword "inside their walls" to fit an office inside the castle.
  - Export the standalone `eldrasil_v39_Core.json` / `eldrasil_v39_NPC_Detailed.json` (D27).
- **1.3** Assets: convert portraits to WebP (full ~600×877 plus 160px thumbnails), set a face focus point per portrait for circular crops, optimize the map, and export `assets_hosting.zip` for GitHub.
- **1.4** Curated data: `npcs.json`, `locations.json`, `relations.json`, `map_pins.json` (pins confirmed by the user, see Appendix A).
- **User action after Batch 1:** upload `assets_hosting` to GitHub and send the username (or continue with placeholders).

### Batch 2: MVU core, playable in text only (L)
- **2.1** Zod schema + default `[initvar]`.
- **2.2** Prompt entries: variable list (D0), `[mvu_update]` rules, JSONPatch format + emphasis, cognitive isolation, Campus_State override rule, time/period/presence EJS.
- **2.3** Engine scripts: time, vitals, mana, bonds, hidden magic, payout, `COMMAND_PARSED` path fixes.
- **2.4** Regex: fold/hide `<UpdateVariable>`, placeholder handling.
- **2.5** Build card v0.2 + test checklist (the user tests it in ST).

### Batch 3: UI shell + Student Builder (L)
- **3.1** Bracelet status bar + module unlock system.
- **3.2** Student Builder wizard (writes `<initvar>` / patches into chat).
- **3.3** Profile/Status panel (vitals, injuries, wallet, grades, magic, hidden badge).
- **3.4** Build v0.3.

### Batch 4: People & Map (L)
- **4.1** Scene cast strip + NPC dossier (rank-gated).
- **4.2** Bonds panel.
- **4.3** Relationship diagram.
- **4.4** Interactive map, clusters, swipe, map-crop headers, Go here, undiscovered locations.
- **4.5** Build v0.4.

### Batch 5: Conditional modules & polish (M–L)
- **5.1** Planner, Notice Board, Letters, Journal/Mystery Board.
- **5.2** Clubs, Competition + Battle panel, Shop, Projects, Trip.
- **5.3** Random events, state-as-memory regex, MVU card config override.
- **5.4** QA pass, token budget audit, README / player guide, final card v1.0.

---

## 7. Test checklist per build

- New chat: the "variable structure registered" log appears; `stat_data` is initialised at message 0.
- Three turns of play: time advances, the patch is applied, and the fold regex works.
- Swipe and delete a message: the variables return to the correct state.
- Mana: a sustained effect across a time skip is charged exactly once.
- HP: a hit >40 without `lethal` is capped; the band label changes correctly.
- UI: no module appears before its unlock condition.
- The "extra model analysis" mode works (the `[mvu_update]` entries are sent).

---

## 8. Open assumptions & risks

- **A1**: Stone reads the dominant type only (for multi-type students). Correct this if it's wrong.
- **A2**: Mana numbers and recovery rates are initial values, to be tuned after the first playtest.
- **A3**: Card avatar image. Default is a crop of the Halvard map, unless the user supplies a cover image.
- **Risk**: the map and D3 diagram on mobile. Mitigation: load them only when the panel is opened; they are never rendered per message.
- **Risk**: jsDelivr caches `@main`. Use a version tag (`@v1`) once the assets are final.
- **Risk**: token budget. The current constant entries are about 11k characters. Target: keep the total always-on prompt reasonable. This is audited in 5.4.

---

## Appendix A: Map pins (CONFIRMED by user, v1.1; see `halvard_pin_proposal.png`)

Coordinates are percentages of the map (x%, y%). Pins 10, 19, 20, 21, 23, 27, 33, and 34 have been moved so they do not cover buildings. Pin 31 has been dropped.

| Pin | Location | x% | y% |
|---|---|---|---|
| 1 | Castle core (cluster by floor: Undercroft, F1–F5, Rooftop; incl. Royal Inspectorate F1, Detention Tower) | 39.71 | 24.41 |
| 2 | Main Courtyard | 42.32 | 45.9 |
| 3 | Fire Dormitory | 19.53 | 37.11 |
| 4 | Sky Dormitory | 30.6 | 50.78 |
| 5 | Viridian Dormitory | 59.24 | 39.06 |
| 6 | Light Dormitory | 57.29 | 54.69 |
| 7 | Arbiter Hall (blue dome) | 57.29 | 22.46 |
| 8 | Staff Quarters | 67.06 | 26.37 |
| 9 | Observation Tower | 61.2 | 5.86 |
| 10 | Old Hut | 52.08 | 11.23 |
| 11 | Forest Clearing (Elder Oak) | 11.72 | 11.72 |
| 12 | Boathouse | 82.03 | 26.37 |
| 13 | Gardens | 71.61 | 36.13 |
| 14 | Menagerie | 81.38 | 40.04 |
| 15 | Archery Range | 74.22 | 52.73 |
| 16 | Gymnasium + Swimming Pool | 84.64 | 50.78 |
| 17 | Sports Field | 85.29 | 66.41 |
| 18 | Combat Grounds (4 dorm training areas) | 76.82 | 83.98 |
| 19 | The Sparring Pavilion (NEW, D23) | 86.59 | 87.89 |
| 20 | Groundskeeper's Lodge | 61.2 | 86.72 |
| 21 | Founder's Statue and Park | 57.29 | 68.36 |
| 22 | The Mall | 35.16 | 67.38 |
| 23 | Commissary | 37.76 | 81.25 |
| 24 | Medical Centre | 47.53 | 70.31 |
| 25 | Mail Tower | 52.41 | 75.2 |
| 26 | Gatehouse / Reception | 46.88 | 88.38 |
| 27 | Banking House | 29.95 | 86.43 |
| 28 | Dovecote | 7.81 | 58.59 |
| 29 | Cathedral | 21.48 | 64.45 |
| 30 | Noble Houses' Liaison (incl. its small tower) | 10.42 | 69.82 |
| 32 | Meditation Rooms / Spirit House | 18.23 | 79.1 |
| 33 | Broken Statue | 13.35 | 53.22 |
| 34 | Fishing house / dock | 78.12 | 16.11 |
| 35 | Willow island | 94.4 | 12.21 |
| 36 | Grassy Field and Hills | 65.1 | 15.62 |

## Appendix B: Portrait files (verified)

All 49 NPC entries in v37 have exactly one matching file in `images.zip/character/`. Source format is PNG 832×1216 (46 files) and 1037×1516 (3 files), with a consistent anime style, waist-up to full body. The circular crop needs a per-portrait focus point (done in 1.3).
