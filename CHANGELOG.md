# CHANGELOG — Eldrasil / Halvard Academy MVU card

Newest first. Details are kept for about the five newest releases; the one-line index of every release is at the bottom. Older
details: `git show 3262b84:CHANGELOG.md` (1.27.0), `git show 3294385:CHANGELOG.md` (1.25.0), `git show b4b65d2:CHANGELOG.md` (1.24.3), `git show 24b636e:CHANGELOG.md` (1.19.0 to 1.24.2) and `git show b62d182:CHANGELOG.md` (earlier).

## v1.30.2 — "No classes today" on a day without classes (2026-09-30)

Owner playtest: the bracelet said "Morning, before classes" at 07:30 on the Entrance Event, which has no classes. On a day whose
timetable is suspended (Entrance Event, breaks, lockdown) the period now reads "Morning, no classes today" and, from 16:00,
"Afternoon, no classes today"; ordinary school days are unchanged (`periodOf`). Save fixture v1.30.1. Tests: `test_playtest_v1301`
(+2 checks), world, attendance, calendar, ambience, saves pass.

## v1.30.1 — Playtest fixes: area gates, rival teams, malformed update blocks (2026-09-30)

Owner playtest of a new chat (Gemini 3.8 Flash), with the exported chat as evidence. Decisions touched: **"Gated places"** (changed
at the owner's request) and a new "Rival academy teams" entry; DECISIONS §11 gains the verified MVU parsing facts.
- **Map gates only in their area** (owner: "from the Grassy Field the Observation Tower and Old Hut unlock; they stay while I am
  there, and lock again at the Courtyards"). Before, a gate opened for good after the first visit. Now the far-grounds places show
  while {{user}} is at the gate place or behind the same gate, and hide back on the main grounds (`gateOpen` in `20_map.js`).
- **Rival academy students are not at Halvard.** In reply 18 the narrator invented a Medical Centre healer and keyed her
  "Mirelle Lullwyn" in `Scene.Present`; the engine took her for Ashvale's Mirelle and loaded her sheet. The engine now removes a
  rival team member from a scene on campus (unless on a trip or at the Kingdom Competition) and tells the narrator to give invented
  people their own names.
- **Location not updating** was two replies whose whole update MVU dropped: reply 4 had no `<JSONPatch>` tags, reply 24 no opening
  `[` and no `</JSONPatch>`. MagVarUpdate reads a patch only inside both tags (verified in its source, b13b43b). The engine now
  listens to `COMMAND_PARSED`: when MVU found no JSON patch in a reply with an `<UpdateVariable>` block, it reads the list itself
  and adds the same commands MVU would have made (checked identical against MVU's own `extractJsonPatch`). The Log says so; a block
  whose JSON cannot be read gets a toast to swipe. 503 now says both tags are required.
- Also seen in the export: floors 1–4 (the Builder entries and reply 4) carry no MVU data; the cause is not established (no
  MVU cleanup snapshot marks). Later floors are intact, and play continued from the Builder's state.
- Save fixture v1.30.0. Cards rebuilt. Tests: new `test_playtest_v1301.cjs` (21 checks, using the two dropped blocks from the chat);
  map gates, people map, saves, tokens, cast sheet, activities, extras, audit and lint pass. Recovery inside SillyTavern is a live
  check (TEST_CHECKLIST).

## v1.30.0 — New mark formula and mastery perks (2026-09-30)

Batch 6, the last of the approved `planning/DRAFT_proficiency_practice.md` (now deleted; its tunables moved to `FUTURE_PLANS.md` §5).
Decisions touched: **DECISIONS §3 "Grades and exams" rewritten** (owner-approved in the draft) and a new "Mastery" entry.
- **Marks:** each subject scores preparation (tier × 25), the proficiency it draws on (rank × 20) and attendance of its classes since
  the last exams, weighted 50/30/20 for theory and 30/50/20 for practicals, plus an exam-day roll seeded per subject and exams
  (−8 to +8, shown from exam week so the narrator and the marks agree). A ≥ 85, B ≥ 70, C ≥ 55, D ≥ 40. Kept: the C floor without a
  skip, Tired/Exhausted steps, make-up cap, the bond rewards, `/Exam_events`. Replaced: "three skips −1" (attendance is in the score)
  and "six training sessions → Combat +1" (training raises Prowess). Studies and `<now>` show the sum ("excellent preparation 50 ·
  Arcana Rank 2 12 · attended 100% 20 = 82: B"). With Proficiency off, preparation stands in for the proficiency part.
- **Attendance per subject:** the engine counts each class period held (`$eng.study.held`); skips already counted against it. Old
  saves (migration in `stepMigrate`): the term's classes so far count as attended, recorded skips stay.
- **Mastery (Rank 5):** routine attempts in the field succeed without a roll (504, only at Rank 5). Knowledge: one real lead a week in
  the Main Library or Archive. Arcana: senses wards, traps and spells; per-use techniques −10% mana; the Doves take an interest (Doves
  +8 once; with hidden magic, Dove attention +3 once). Craft: never rough, +1 dose or piece. Prowess: once a week a fight injury one
  step lighter. Society: staff and nobles met for the first time at Trust +5; a letter from the Noble Houses' Liaison. Nature:
  creatures curious first; foraging doubles. Toast "Mastery: <perk>"; Studies lists each Rank 5 perk, locked or open.
- Player guide: exams and a proficiency paragraph. Features: the Study and exams description.
- Save fixture v1.29.0. Main and three TEST cards rebuilt. Tests: `test_grades_v1150` updated to the new formula (seed 550: a neutral
  exam day at the first midterm), new `test_mastery_v1300.cjs` (29 checks: the draft's table, weights, both Arcana subjects, the
  seeded roll, attendance counting and migration, every perk). **Full suite passes**, lint passes, `sim_year 120` passes.
- To confirm with the owner (invented): the nobles for Consummate (Caspian, Caralynn, Florian, Elion, Nerys) and "staff" = teachers
  plus the Doves, Cathedral, Liaison and facilities staff; the Liaison's letter wording; Formidable changes severity only (HP stays);
  the lead is used when a new Clue is added in the Library or Archive; exam-day words (a bad / off / good / inspired day).

## v1.29.0 — Non-magic crafts and masterwork (2026-09-30)

Batch 5 of the approved proficiency plan. Decisions touched: none changed; DECISIONS "Crafting" gains the masterwork rule.
- **Crafts:** cooking and baking (Cooking Club kitchen in the Canteen, or with the cook's leave), needlework, drawing and painting,
  woodcarving, calligraphy (portable in the dorms, Common Rooms, Courtyards and Gardens; also their clubs) and smithing (Workshop,
  Smithing Club): 20 recipes on the 1.28.0 engine. Food gives stamina, knitted scarves and winter sets are warm weather gear, the rest
  are handmade gifts. `data/crafts.json` now names each craft's Practice actions, tools (Precision tool roll +5 for smithing, the
  pen for calligraphy), experts and mishap injury, and each recipe's yield; brewing yields are unchanged.
- **Ingredients:** Baking and cooking ingredients (Commissary 10), Bar stock and coal (Commissary 20), Knitting wool and needles
  (Tinker's Bench 15), Paint box (Tinker's Bench 30). Knitting wool is not warm gear by its name.
- **Practice:** two new actions: Art studio at the Mall (15 points, used for drawing) and Brewing Club bench at the Workshop (the
  1.28.0 Practice tab showed Workshop brewing to Brewing Club members, but the engine had no action for it). The portable practice now
  opens with any portable craft ingredient in the Bag (a bought wool scarf no longer counts). Practice recipes show their craft.
- **Masterwork:** a Project of a craft Kind (potion, smithing, tailoring, enchantment, cooking, painting, carving, calligraphy or
  craft) at Craft Rank 4 shows "Masterwork if finished this turn: <result>" in `<now>`; when the Project reaches 100 (or the narrator
  reports `Aim: "masterwork"`) the engine judges it at DC 85, adds the piece to the Bag (`masterwork, handmade by {{user}}`, so gift
  preferences read it), awards 3 Craft XP and closes the Project. Rules 502 (Projects Kinds, one sentence) and 504 updated; 506 says
  where handmade work sells.
- Save fixture v1.28.0; no migration. Main and three TEST cards rebuilt. Tests: new `test_crafts_v1290.cjs` (35 checks);
  `test_crafting_v1280`, `test_practice_v1270`, `test_saves`, `test_tokens_v1110`, `test_batch5_shops`, `test_settings_v199`,
  `qa_static`, `test_world_v110` and lint pass.
- To confirm with the owner (invented, all tunable): recipe names and yields (stew pot 4/3/2 servings), sale guides (painting 30–80),
  mishap injuries per craft, masterwork XP 3, the new Mall art studio and Workshop Brewing Club bench actions, and that a masterwork
  Project closes whatever the result (a failed one leaves nothing).

## v1.28.0 — Magical crafting (2026-09-30)

Batch 4 of the approved proficiency plan. `data/crafts.json` defines brewing, runes, repair and enchant recipes, materials, effects and sale guides. The engine shows each available recipe's Fortune-based result in `<now>` and the Practice UI; `/Practice` with `Action: "craft"` uses that result, spends materials, awards Craft XP and puts handmade work in the Bag. Tools, an expert, conditions, rank, the A-grade bonus, mishaps, tiers and weak/failed outcomes are enforced.
- Gardens, Forest and Clearing Practice yield reagents; clearing blooms wilt on the next day. Crafted draughts and talismans use `/Consumables`, including healing an injury and one-use fitting items. The Bag shows their effects and handmade notes, which gift preferences read. Enchanted clothing works as weather gear. The Medical Centre apothecary buys up to three Healing draught doses per week through `/Craft_sales`.
- Craft instructions in rules 502/504 appear only where a recipe is available; Settings' token estimate measures the ordinary cost without those situational lines.
- Save fixture v1.27.0; no migration. Main and three TEST cards rebuilt. Focused crafting tests, Practice tests, save compatibility, `npm run lint` and the full suite pass. Connected SillyTavern checks remain in `docs/TEST_CHECKLIST.md`.

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
- **v1.29.0 (2026-09-30):** Batch 5: non-magic crafts (cooking, needlework, drawing, carving, calligraphy, smithing), four ingredients, masterwork from craft Projects.
- **v1.30.0 (2026-09-30):** Batch 6: marks from preparation, proficiency and attendance plus a seeded exam-day roll; Rank 5 mastery perks.
- **v1.30.1 (2026-09-30):** Playtest fixes: map gates open only in their area; rival academy students kept off Halvard's grounds; malformed update blocks recovered.
- **v1.30.2 (2026-09-30):** The period reads "no classes today" instead of "before classes" on a day without classes.
