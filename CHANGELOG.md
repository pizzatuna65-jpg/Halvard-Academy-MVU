# CHANGELOG — Eldrasil / Halvard Academy MVU card

Newest first. Details are kept for about the five newest releases; the one-line index of every release is at the bottom. Older
details: `git show c544d3e:CHANGELOG.md` (1.47.0), `git show 9359ed9:CHANGELOG.md` (1.46.0), `git show a13acc7:CHANGELOG.md` (1.45.0), `git show 95926a8:CHANGELOG.md` (1.44.0), `git show 8cb78b2:CHANGELOG.md` (1.43.0), `git show ee2fbce:CHANGELOG.md` (1.42.0), `git show fc49cdf:CHANGELOG.md` (1.41.0), `git show 7bd6a98:CHANGELOG.md` (1.40.0), `git show 9d4bfa2:CHANGELOG.md` (1.39.0), `git show 2c8c928~1:CHANGELOG.md` (1.38.0), `git show 325dfa2:CHANGELOG.md` (1.37.3), `git show c832a27:CHANGELOG.md` (1.37.2), `git show 3b49f19:CHANGELOG.md` (1.37.1), `git show 0d1de2e:CHANGELOG.md` (1.37.0), `git show 951f674:CHANGELOG.md` (1.35.2 to 1.36.0), `git show 13c8d74:CHANGELOG.md` (1.34.1 to 1.35.1), `git show 48541e2:CHANGELOG.md` (1.30.6 to 1.32.0), `git show 28bd235:CHANGELOG.md` (1.30.5), `git show 2224f00:CHANGELOG.md` (1.30.4), `git show 8f1dfc2:CHANGELOG.md` (1.30.3), `git show 90e8c43:CHANGELOG.md` (1.30.2), `git show b14dcc8:CHANGELOG.md` (1.30.1), `git show eb07f45:CHANGELOG.md` (1.30.0), `git show dd4bdae:CHANGELOG.md` (1.29.0), `git show b4cc575:CHANGELOG.md` (1.28.0), `git show 3262b84:CHANGELOG.md` (1.27.0), `git show 3294385:CHANGELOG.md` (1.25.0), `git show b4b65d2:CHANGELOG.md` (1.24.3), `git show 24b636e:CHANGELOG.md` (1.19.0 to 1.24.2) and `git show b62d182:CHANGELOG.md` (earlier).

## v1.52.1 — Commitment "Where" is the meeting place (2026-10-04)

From the owner's 1.34.2 chat: Tilly arranged a 22:45 meeting "by the founding plaque in the first-floor corridor" while both sat in
the Arbiter Hall, and the narrator wrote `Where: "The Arbiter Hall"`, the place where the plan was made. Save fixture v1.52.0.
- **Cause: the instruction, not the engine.** The engine and UI already read `Commitments.Where` as the place to be at Due
  (`stepHere`'s "May be here" in the hour before, the Planner's "at …" and "Go here"); 502 only said `"place (optional)"`.
- **502.** Commitments `Where`: "where {{user}} must be at Due", never where the plan was made, a Campus Map place with the exact
  spot after a dash ("Notice Board — by the founding plaque"). Clues `Where` "where it was observed", Projects `Where` "where the
  work is done" (the same ambiguity; the Map pins clues and the Activities panel works projects there).
- **The owner's chat** (a fixed copy, not in the repo): Ruby's misfiled fact about {{user}}'s village removed, her duplicated parting
  at 08:35 removed (Last_seen 08:20), the commitment's Where `Notice Board — by the founding plaque` (the castle's Floor 1 entrance
  hall at the foot of the main stair; the plaque itself is narrator invention).
- **Tests:** `test_saves` (with the new 1.52.0 fixture), `test_tokens_v1110`, `test_audit_b2_v1170`, `test_audit_batch7_v1480`,
  `test_calendar_state_v1190`, `test_memory_v160` pass. The fixed chat loads in 1.52.1 with no story value lost, and Tilly shows as
  "may be here" at the Notice Board at 22:10 (not at the Arbiter Hall).

## v1.52.0 — Feature batch 4: NPC routines (2026-10-04)

`audit/AUDIT_2026-10-03_4_batch_fitur.md` batch 4 (audit part 2, suggestion 4.7), from the owner-approved
`planning/DRAFT_npc_routines.md` (now deleted). Save fixture v1.51.0. No new subsystem: the routines are data in the one whereabouts
model (DECISIONS 1.47.0) and the day's chance is the shared `roll100`.
- **Data.** `data/npc_routines.json`: 118 light weekly habits for the 59 NPCs who live at Halvard (1–3 each: days, from, to, a Campus
  Map place, what they do), as approved, including the lore's dawn habits before curfew ends. Rival academy teams have none.
- **Whereabouts.** `tools/common.py` `presence_data` carries them (`rt`, `rate`); `shared.js` `whereabouts` gives an NPC's routine
  (`rt`) when no status, sickness, class, teaching, Study Hall, club or the election keeps them and the day's
  `roll100(seed, day, 'routine', id, row) < rate` (owner: 70, so it is truly "usually"; swipe-safe). `presenceAt`: a regular away on
  a routine elsewhere is not "Likely around"; someone whose routine is here is, with what they do ("Royhan (stays late near the
  Dovecote for Dragonchess)").
- **Uses.** `<now>`'s presence line; initiative and favour `{place}` reach for routine places first; the Map card's new row "Usually
  here" (people whose Haunts you know) and a regular's note "usually at X now"; the dossier's new "Routine" field, right after Haunts
  and opened with it (built in `gen_ui.py`, the existing field gate).
- **Features row `npc_routines`.** Off: NPCs keep to their haunts only, exactly as 1.51.0. The older presence and `<now>` snapshot
  suites (`test_audit_batch5_v1470`, `test_audit_batch7_v1480`) now run with it off and stay identical; `test_bughunt_v103` F02 moved
  to 14:00, after Caspian's Sunday-morning routine.
- **Also** (between 1.51.0 and this release): the routine week's moment day uses the shared `rollInt` instead of a raw hash (same
  draw); BUILD's "Add a feature" playbook now starts by checking for an existing system to connect to (owner, 2026-10-04).
- **Tests:** `tests/test_feature_batch4_v1520.cjs` (13 checks: the 70% hold, days outside the routine, the switch, class and
  teaching first, arrivals, a teacher's routine, the dossier field and its rank, the Map row, initiative places). Full suite passes.
  UI checked in a local preview (the Map card's "Usually here", the dossier's Routine field).

## v1.51.0 — Feature batch 3: NPCs seen together, story relations that fade, the living mystery board (2026-10-04)

`audit/AUDIT_2026-10-03_4_batch_fitur.md` batch 3 (audit part 2, suggestions 4.8 and 4.9). Save fixture v1.50.0.
- **Pair moments (4.8).** Two NPCs seen together the way Connections shows them to {{user}}: a friends, rivals or dislike line of
  `data/relations.json` that {{user}} can see there (both met, the teller's rank, or a revealed relationship secret), both free by
  whereabouts and neither in the scene; at most one a day (`$eng.pair`), 50% when one fits. A Meanwhile Journal line (Rank 7+ bond
  unseen for a week, no Next plan) may be one ("Meanwhile: Cedric and Layla shared a table at the Lecture Halls."); a "nearby"
  ambience beat at a place one of them haunts may be one ("Kotaro and Mimosa passing together, one teasing the other"). Templates in
  `data/ambience.json` `pairs` (public behaviour only); the engine's relation list is `REL_PAIRS` (`gen_engine.py`).
- **Story relations fade (4.8).** A `Campus_State.New_relations` line is renewed when the narrator rewrites it or the two share a
  scene (`$eng.nrel`); four weeks without that, its Connections line fades; eight, it is no longer drawn (`$ui.relold`). The record stays.
- **Traces (4.9).** The Map marks a pin "?" when a Clue of a thread that is not solved or cold names one of its places (`Clues.Where`),
  with a hint under the map and the threads in the place sheet. Arriving at such a place may bring a trace beat (`data/ambience.json`
  `trace_chance` 50%, once per thread per week): `<now>` names the thread and asks for one small sign true to the lore and the clues
  found, never a solution and never new canon (DECISIONS "Rumours and stories as Clues": the engine invents no content).
- **Tests:** `tests/test_feature_batch3_v1510.cjs` (14 checks); `test_audit_batch7_v1480` also skips the two recorded `<now>` whose
  beat became a pair moment (marked `pair: 1`). Full suite passes. UI checked in a local preview (the "?" pin, the hint, the sheet line).
- **To confirm with the owner:** the pair templates and rates (50%, one a day), the 4 / 8 week fade, the 50% trace chance.

## v1.50.0 — Feature batch 2: the routine week (2026-10-03)

`audit/AUDIT_2026-10-03_4_batch_fitur.md` batch 2 (audit part 2, suggestion 4.5). Save fixture v1.49.0. No parallel subsystem: the
plan is counted by the steps that already count those things, inside their weekly limits.
- **Plan (Planner, "Routine week").** Study hours (0–20), up to four Practice actions at discovered places with a count (1–5; a
  study action names its subject; partner, material and pact actions are left out), Saturday club. "Save plan" or "Live this week"
  write `$ui.plan` through a hidden player-tool message (like Settings). Decided: a weekly plan, not one per day; classes are always
  attended.
- **Arming (`stepRoutine`, before the Journal is written).** On "Live this week" the engine works out the span: from now to Sunday
  20:00, cut to 20:00 the evening before the first stopper (a calendar event that starts later in the span or a day without classes,
  a dated Commitment, Project, Hook or Next plan, {{user}}'s birthday); at least half a day, else refused with the reason (also away
  from Halvard, in battle, unsorted, the feature off). It picks the moments to play: someone with a Rank 3+ bond (as initiative
  picks, their Stage line) and one of the span's happenings. `$ui.routine.line` goes into `<now>`: the span, the plan, the moments,
  and that only the people in the moments get Interactions. The UI then fills the chat input; the player sends it.
- **The routine reply (`routineStart` in `stepGuards`, `routineSchool` in `stepSchoolWeek`, `routineProf` in `stepProficiency`).**
  The clock goes to the span's end whatever the narrator wrote; nights are slept; no "time jumped" warning. Classes held count as
  attended (the clean-week bonus can be earned); study hours and study actions go into exam preparation and Knowledge; each Practice
  action gives its XP inside the weekly pace, paid shifts at most two a week (`ledger`), costs are paid, mana and stamina actions are
  training sessions (`stepTraining`, weekly cap); Saturday club counts. The narrator's own Practice and Training reports are dropped,
  and Interactions with people outside the moments are not counted (missed reports; bond XP needs time together). A Journal line
  recaps the week; the plan is disarmed after one run. A plan scaled to a shorter span (days / 7).
- **Rules, data, UI.** `data/features.json` row `routine_week`; schema `$ui.plan`, `$ui.routine`; 505 prints the line; Planner section
  (wraps on a phone).
- **Proof and tests.** `ENGINE_DIFF` against 1.49.0 over the whole suite: every engine run identical except the routine suite
  itself (ignoring only the new `$ui.on.routine_week`). `tests/test_feature_batch2_v1500.cjs` (25 checks: arming, `<now>`, the run,
  weekly limits, stoppers, refusals, no plan). Full suite passes. UI checked in a local preview (render, add / change / remove rows).
- **To confirm with the owner:** the 12-hour minimum span, the 20:00 end, the moment picks (85% a bond moment, one happening).

## v1.49.0 — Feature batch 1: favours and group assignments (2026-10-03)

`audit/AUDIT_2026-10-03_4_batch_fitur.md` batch 1 (audit part 2, suggestions 4.6 and 4.10). Save fixture v1.48.0. Built only on what
exists: Commitments and the Agenda, initiative, the `help` / `study` interactions, the Bag ledger and the study pool.
- **Favours (4.6).** Some initiative days the reason is a favour (`data/initiative_asks.json` `favours`: two generic templates per Tension
  category, 30% of initiative days, at most two offered a week, never at Tension 70+, never while that NPC has an open favour). `<now>`
  says how to record one the player accepts: a Commitment `Type "favour"`, `With` the NPC, Due within two days, and `Item` (something
  they love or like) or `Where` (one of their haunts). New engine step `stepPromises`, run just before `stepBonds`: a favour removed
  before it was overdue was kept and counts as a `help` interaction (bond XP only with time together, Trust +2 inside the weekly cap,
  never twice when the narrator also reports it); its `Item` leaves the Bag (`bagTake`; without it in the Bag the favour does not count).
  Left overdue: the NPC's Tension +5 once, through the ordinary rise rules (category, mood, Trust band). A polite refusal owes nothing.
- **Group assignments (4.10).** A Project `Kind "assignment"` `With` classmates: Progress 100 on time is +45 minutes of study (as an
  assignment Commitment); finished late it counts as a skipped class of the subject its name or Goal names; when it turns overdue each
  partner's Tension +3 once. Who let the group down is the story's to play, in character. A study session in `/Practice` (Study a
  subject, Group study) with someone present is now a `study` interaction with them, once (time together, so bond XP and the Rank 4
  study partner bonus). Not built: the batch plan's "+1 XP with the subject's teacher", because bond XP needs time together.
- **Rules and UI.** 502: the favour Type and `Item`, and how to hand in an assignment (Progress 100, then remove it). 505: the favour
  line under NPC initiative. Planner: a favour shows what to bring and whether it is in the Bag. Schema: `Commitments.Item`,
  `$eng.promise` (overdue rises already paid).
- **Tests:** `tests/test_feature_batch1_v1490.cjs` (24 checks); `test_audit_batch7_v1480` skips the one recorded `<now>` that is now a
  favour day; `test_batch3_fp11_v1102` accepts favour reasons. Full suite passes.
- **To confirm with the owner:** the favour templates and numbers (30%, two a week, Tension +5 / +3) are maintainer-written defaults.

## v1.48.0 — Audit batch 7: `$ui.now`, the Cast Sheet per NPC, the state diet (2026-10-03)

`audit/AUDIT_2026-10-03_3_batch_perbaikan.md` batch 7, the last (audit part 1, items 2.6, 2.7, 2.9, 3.11). Save fixture v1.47.0. Four
commits, each proven before the next.
- **The Cast Sheet, one entry per NPC (2.7).** The 679 KB template is now a head (509: `<cast>` and the shared header), one sheet per
  NPC (uid 600+, each with the helpers and only its own NPC's data; sources `509_sheet.template.ejs`) and a tail (599: ties, Extras,
  `</cast>`), all @D1 with orders 300-390 so they join in the same order before `<now>`. Each sheet opens with `@@if <the NPC is in
  $ui.cast>`. Verified in the sources: ST-Prompt-Template evaluates `@@if` on `WORLDINFO_ENTRIES_LOADED` and drops a failing entry
  before the scan (`handler.ts` `applyDecorators`, `worldinfo.ts` `isConditionFiltedEntry`), so a generate compiles only the sheets of
  the people present; SillyTavern strips any leading `@@` line from the content (`world-info.js` `parseDecorators`) and joins one
  depth's entries with "\n" in ascending order (`script.js`, `world-info.js`). `build_card.py` keeps decorator lines before the block
  scope. The gate 510 is unchanged.
- **`<now>`'s rule lines from the engine (3.11).** The new last step `stepNow` writes `$ui.now`: the outside area block, presence and the
  class line (1.47.0's `$ui.here` is folded in), the campus walks, ambience, moods, and each present character's bond, Trust, Tension,
  recent moments and teasing. The code is `<now>`'s own, moved verbatim into `nowOf(S)` (with its own `getvar`); `<now>` prints each
  list in its place and no longer holds those rules or their data (`tools/common.py` `now_data`, `AGE_JS`; the engine template now also
  goes through `fill_data`).
- **State diet (2.6).** `$ui.moods` keeps `{ mood }` (the reasons are only in `<now>`'s mood lines); an area's walks and places nearby
  leave `$ui.area` (they are `<now>`'s lines; the Map walks the shared graph itself). Kept on purpose: `$ui.file` (the Builder record,
  DECISIONS §2), `grades.why` (only the engine can compute it), `$ui.craft` (only at a craft place; its roll and modifiers are the
  record), `practice` (tiny). Measured with the new `tests/stress/state_size.cjs` (200 messages of ordinary play, 45 bonds):

  | | stat_data, last message | average | summed over the chat |
  |---|---|---|---|
  | 1.47.0 | 42.4 KB | 35.4 KB | 7,083 KB |
  | `$ui.now` alone | 44.6 KB | 37.0 KB | 7,399 KB |
  | 1.48.0 (with the diet) | 43.1 KB | 35.4 KB | 7,072 KB |
- **Small items (2.9).** The weather cache holds two years of days, so building a year's happenings no longer empties it; the red-dot
  record `eld_seen` drops a proficiency's older rank keys and keeps at most 800 keys; the default theme passes the panels' HTML through
  untouched.
- **Proof.** `<cast>`: 240 scenarios byte-identical between 1.47.0's one template and the per-NPC entries (hashes in
  `tests/fixtures/cast_1470.json`). `<now>`: the new harness option `NOW_DIFF=<older card>` renders `<now>` of both releases on every
  engine run of the whole suite: 8,200 renders identical (with `ENGINE_DIFF` identical apart from `$ui.now` / `$ui.here`); 112 update
  chains (campus, forest, Avalon, airship, Sunreach) kept as hashes in `tests/fixtures/now_1470.json`; still identical after the diet.
- **Tests:** `tests/test_audit_batch7_v1480.cjs`; `harness.cjs` `renderEntry` renders an entry as ST does (the Cast Sheet as a group;
  17 suites use it); suites that read moved text or the trimmed fields read the engine and `$ui.now`. Full suite.
- **To confirm with the owner:** nothing new. Not removed although the audit listed them: `$ui.file`, `grades.why`, `$ui.craft` (above).
- **Live checks:** `docs/TEST_CHECKLIST.md` 1.48.0 (compare the prompt in SillyTavern: `<cast>` and `<now>`). The first reply after
  updating has `<now>` without the area, presence, walk, ambience, mood and bond lines (the engine writes `$ui.now` on its first run).

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
- **v1.30.3 (2026-09-30):** Special-occasion days (calendar `fair`) are clear and calm; the temperature keeps the season.
- **v1.30.4 (2026-09-30):** Student Builder template "Charles Chevalier", the owner's playtest student.
- **v1.30.5 (2026-09-30):** With no picture uploaded, the Student file shows the SillyTavern persona's image.
- **v1.30.6 (2026-09-30):** "Connected to" follows the map picture; the map cards no longer show it.
- **v1.31.0 (2026-09-30):** Meditation Rooms and the new Spirit Path; restful places; new activities around the grounds; letters home.
- **v1.31.1 (2026-09-30):** Florian is a regular at the Spirit Path.
- **v1.32.0 (2026-09-30):** Dorm Days on Sundays, Final Ranking Monday, a longer Academy Trip, the Kingdom Competition in the capital; "Coming up" in `<now>`; the Inventory panel.
- **v1.33.0 (2026-10-01):** Classes and teachers: Practical Magic by combat role, eight new teachers, free periods, Dorm Competition role brackets.
- **v1.34.0 (2026-10-01):** Seven Year 3 first-years, Saturday Student Council and elections, Dante's Lodge gift restored.
- **v1.34.1 (2026-10-01):** Anselm is a sheep Beastkin; Kotaro is lean and always looks drunk; portrait prompts.
- **v1.34.2 (2026-10-01):** Fifteen new portrait and thumbnail pairs, all NPCs pictured; assets pinned to f42990c.
- **v1.35.0 (2026-10-02):** Lore fires on plain words (spirit, pact, demon, beast...); World Index CORE FACTS; card entries ignore the WI budget.
- **v1.35.1 (2026-10-02):** Items written to /Player/Inventory (or /Bag) are moved to the Bag instead of vanishing.
- **v1.35.2 (2026-10-02):** Curfew is a school rule (consequences only when caught); feast nights move it; short first appearances; journal dedupe.
- **v1.36.0 (2026-10-02):** Preset: RF2.2.1 port (Card Fidelity, Gemini killswitches and voice, new Scene Engine); 4-7 paragraphs; Embellish Mode.
- **v1.37.0 (2026-10-02):** Dialogue colours: `<say:Name>` tags, colours from the card (roster data, Extras hue), a shared grey for the unnamed.
- **v1.37.1 (2026-10-02):** Dialogue colours: 12 colours that differ by kind, and nobody present in one scene shares one (sticky moves).
- **v1.37.2 (2026-10-02):** Dialogue colours: light colours only; every character has a first, second and third colour.
- **v1.37.3 (2026-10-02):** Preset: Internal Thoughts back ON as its own `<npc_thoughts>` block (folded, trimmed from older replies, kept out of VectFox).
- **v1.37.4 (2026-10-02):** NPC Thoughts: only as raw as the character is; optional regex so the AI never reads thoughts back.
- **v1.38.0 (2026-10-02):** The Grand Vast Forest: the Expedition's own map, engine-rolled hunt (target, signs, beasts, the Wendigo), walking stamina, forest weather, map tab.
- **v1.39.0 (2026-10-02):** Avalon, the capital: its own map (pins holding places), walks and hire carriages, the White Line, the Crowning Day muster, the city's seeded life (pickpockets, other academies' students, Tsubaki lost, Rookery raids), map tab.
- **v1.40.0 (2026-10-02):** The airship: four places aboard (Promenade Deck, Common Room with a bar and a stage, Cabin Deck, Cargo Hold) during every academy flight, boarding and landing, the seeded sky / stage / hold, an Airship map tab.
- **v1.41.0 (2026-10-03):** Sunreach Bay, the Academy Trip's city: one city by day and by night (two maps), ten pins, carriages, water taxis and the tour boat, bets at The Golden Tide, students of every academy met where their personality takes them, the sea and the Leviathan; index entries for every outside area (FP7 done).
- **v1.42.0 (2026-10-03):** Audit batch 1: every bug from the audit (dialogue-colour regexes, item names, Transactions, one "away" test, gifts leave the Bag, XP only together, long-update truancy, day slips, UI fixes, pinned MVU).
- **v1.43.0 (2026-10-03):** Audit batch 2: one source (`shared.js` for the constants, rules and seeded draws every runtime shares; texts read their times and numbers from data); Ambient moments paces the outside areas.
- **v1.44.0 (2026-10-03):** Audit batch 6: the Agenda (one date marker, status, reminder and coming-up feed `$ui.agenda`), rumours and stories pinned as Clues and Encyclopaedic's filed lead, competition results that pay reputation (with a price) and team bond XP.
- **v1.45.0 (2026-10-03):** Audit batch 3: one ledger for Points and Coin, one Bag ledger, `/Purchases` settled by the engine (price, place, season, money), one practice session report with tracks (`/Training` an alias) and one Rank 4 partner rule.
- **v1.46.0 (2026-10-03):** Audit batch 4: the outside areas as one module (one graph shared with the Map panel, `makeArea` records, one parser, formatter, move, hourly loop and theft, climate profiles as data, `$ui.area` / `$eng.area`, one Map renderer and one `<now>` block).
- **v1.47.0 (2026-10-03):** Audit batch 5: the campus as an Area (walks, owed minutes and stamina on the Campus Map graph, "Walks from here"), `areaNow`, and one whereabouts model (`$ui.here` for `<now>`, the Map's Regulars, "May be here", initiative and the areas).
- **v1.48.0 (2026-10-03):** Audit batch 7, the last: the Cast Sheet as one entry per NPC (`@@if`), `<now>`'s rule lines from the engine (`$ui.now`), the state diet (moods, area walks), the weather cache, `eld_seen` and the default theme.
- **v1.49.0 (2026-10-03):** Feature batch 1: favours asked through NPC initiative (Commitment Type "favour": kept = help, ignored = Tension) and group assignments (study time, a study interaction for each partner, Tension when overdue).
- **v1.50.0 (2026-10-03):** Feature batch 2: the routine week (a weekly plan in the Planner, lived in one reply to Sunday evening or the evening before the next event or due date; counted within the weekly limits; one or two moments played).
- **v1.51.0 (2026-10-04):** Feature batch 3: NPC pair moments from visible relations (Meanwhile, ambience), story relations that fade from Connections, "?" pins and trace beats for open mystery threads.
- **v1.52.0 (2026-10-04):** Feature batch 4: NPC weekly routines in the one whereabouts model (70% a day by the shared roll; `<now>`, Map "Usually here", the dossier's Routine field, initiative places), switchable in Features.
- **v1.52.1 (2026-10-04):** 502: a Commitment's Where is the meeting place, not where it was arranged (Clues and Projects Where clarified too).
