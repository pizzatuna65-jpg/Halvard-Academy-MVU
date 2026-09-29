# CHANGELOG — Eldrasil / Halvard Academy MVU card
Original plan: `docs/archive/ELDRASIL_MVU_PLAN.md` (v1.1). Renamed from PROGRESS.md on 2026-09-28.

## Release index (short)

One line per release, oldest first (moved from HANDOFF on 2026-09-28). Details: the entries below,
newest first; releases before 1.8.0 are the numbered items under "BATCH 4 COMPLETE" and "BATCH 5 COMPLETE".

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


## v1.16.1 — Audit Batch 1: bug fixes and build (2026-09-29)

Owner: "saya setuju dengan semua audit mu, bagi menjadi batch" (all findings of `planning/AUDIT_2026-09-29.md` approved; five
batches, stopping after each). Batch 1 = the quick fixes. Decisions touched: none reversed. The "Missed reports" decision (§4) gains
one rule: a used item works only if {{user}} has it.
- **Git** (A1): the folder is a local git repository (baseline commit `946d1e9` = 1.16.0 before any change; `.arena/` is in it too).
  Commit each release; nothing is pushed.
- **`tools/build_all.py`** (A2): the build in its fixed order (gen_engine → gen_mvu_entries → gen_ui → build_card → TEST cards),
  optional `--lore`, `--themes`, `--preset`, `--no-test-cards`, then `node --check` on every generated script. UTF-8 output on Windows.
- **Club names** (B1): `canonClub` (engine, module level) matches `Player.Profile.Club` to the club list without case, with or without
  "Club", and by each club's short lore name (`CLASS.calias`, from `tools/common.py` `load_clubs`: "Theatre" → Theatre Troupe). It
  runs before attendance (5d), so "Soccer" now earns Saturday club time; an unknown club is kept as written and logged once. Rule 502
  asks for the full club name.
- **Used items** (B2): an item in `/Consumables` takes effect only if it was in the Bag before the reply, was added to it in the reply,
  or was bought in the reply (a new Transactions line names it: a hot drink at a café). Otherwise `_Log` says so and nothing changes
  (The Vigil too). Rule 502 says so.
- **Happenings** (B3): "no repeat of the previous two days" now uses what those days actually got: each campaign year is chained from
  its first day (Month 12 has no happenings, so nothing carries over) and cached. Measured over 5 seeds × 2 years: 17 repeats of
  1,595 before, 0 after. (The audit's figure of 51 counted "the last two happenings", not the last two days; corrected there.)
- **One "away" rule** (B4): `npcAwayIn(S, id)` (graduated, or a status with away / abroad / absent / missing / dead / confined /
  hospital / unconscious / expelled / unavailable / left campus / out of town) is used by bonds, introductions, Rank 5 handovers, the
  Entrance tour, NPC initiative and birthday parties. NPC initiative no longer stops for any status at all ("back from the capital").
- **Rank 10 suspension** (B5): `$ui.tsusp` is computed before the exam perks read it (from the Trust before the reply), then again
  after the bonds.
- **Discovered places** (B6): only Campus Map places enter `$ui.discovered`, so off-campus names never push the Rooftop out of the cap.
- **UI dates** (B7): the Student file's Active-effects start time shows the year from Year 2. (The audit's planner finding was wrong:
  the Notebook has its own year-aware date keys.)
- **Engine errors** (B8): the MVU hook snapshots the state; if the engine throws, the state goes back to the one before the reply,
  `_Log` names the error and the bracelet toasts "Engine error: the update was not applied". Before, a half-run engine was saved.
- **Tokens**: no generic "Grew closer through ordinary time together" Milestone on a rank-up (T4; `$Recent` records the rank);
  `<current_state>` (501) shows only the `_Log` lines of the latest update (T7; rule 504 says "in the last update").
- **OOC** (P3): rule 503: an out-of-character answer has no update block and never moves time.
- **Code** (A6, A7): name, whole-word and gift regexes compiled once; `DAILY_BOND_CAP` and a commented-out line removed; misplaced
  comments in the schema and the UI fixed.
- Tests: new `tests/test_audit_b1_v1161.cjs` (20 checks). `test_batch5_shops` and `test_mood_gifts_v180` now put the used items in
  the Bag; `test_saves` treats `$ui.amb` as per-update (it is the next reply's ambience). Run: the new suite and 40 related suites
  pass (not the full run, per the owner's testing rule). Token audit: 14,470 start / 18,661 heavy (the heavy state's `_Log` lines are
  all from one update, so T7 shows its saving only in play).
- Save fixture `save_1.16.0.json` written before the changes; `test_saves` loads it.
- To confirm with the owner: nothing (no canon invented).
- Next: Batch 2 (tokens and preset), when the owner says "lanjutkan batch 2".

## v1.16.0 — Ambience and ghost stories (2026-09-29)

Owner-approved `planning/DRAFT_dynamic_ambience.md` (v1–v4 answers recorded there; "buat skrg dan masukan ke entry lorebook beserta
semua draft yg sudah disetujui. buat tilly juga aware dengan hal ini, naikan chance ke 5%"; "walking lantern gk ada kaitan dengan
remembrance day"). Decisions touched: none reversed. The preset's World Sim stays OFF (the card remains the only tracker); the
engine does a Halvard-specific, seeded version instead. The NPC encounter roll the owner asked about earlier was dropped (owner).
- **Engine 8m** (`data/ambience.json`, injected by `gen_engine.py`, which checks every place name). For the next reply, like the
  Fortune roll (the same on every swipe):
  - **Crowd** (empty, quiet, some people, busy, packed): 22 categories with a rhythm per time block for class days, Saturdays and
    free days; exam week fills the Library; a place named in today's event plan is busy (the Arbiter Hall packed for the morning
    assembly, the Ring Dining Hall at a feast); bad weather (Full) empties the outdoors and fills the indoors; breaks empty the
    campus; after curfew only the dorms are alive.
  - **Light**: sunrise and sunset by real-life months at about 48° N (M1 = March), interpolated by week, 40 minutes of dawn and
    dusk; outdoors daylight, overcast, dawn, dusk, dark (starlit when clear); indoors daylight through the windows, lamps lit,
    lanterns at their night burn after curfew.
  - **Cue**: one sensory cue *type* on a new place or time block (owner: types, not sentences, so repeats still read differently),
    not the same type at that place within three days; the place's own types come first.
  - **Beat** (Full): on a new place or 30 minutes after the last roll, d100: calm 55 (Settings "Ambient moments": Rare 70, Often
    40), texture 56–90, brush 91–100 (small, may touch {{user}} lightly, never harms, changes nothing; a happening or an event day
    turns it calm). Unnamed people only; not in a battle, asleep, in {{user}}'s class or on a tool edit; a type not again in that
    category within seven days. Three types draw on live data: a rumour overheard (Gossip), the weather turning, an event echo.
  - **Uncanny** (Full, secret): where and when one of the 17 ghost stories can happen, 5% per update (doubled in fog, during the
    Thinning indoors, for the Night Swimmer in winter and the Night Student on Remembrance Day), at most one a week, the same story
    not within 30 days. Only a narrator-only line in `<now>`: unexplained, deniable, no harm, everyone reacts in character.
- **Ghost stories** (`merge_lorebooks.py` `GHOST_STORIES`, uid 337–346): the Thirteenth Stroke, the Night Swimmer, the Walking
  Lantern, Breath on the Glass, When the Pens Go Quiet, the Faraway Laugh, the Polite Walker, the Last Bed, the Other Climber, the
  Applause. Each place's entry says "Home of the ... story" (the Polite Walker in the Campus Map's far-grounds line), the World
  Index lists them, the Map cards link them (`curate_data.py`). Tilly's file: Halvard Unexplained has a page for every one of them.
- **Card and preset.** `<now>`: "Ambience at <place>: <crowd>, <light>. Sensory cue (write your own detail, once): <type>." and
  the Nearby / Brushes {{user}} / Uncanny lines. Rule 504: one short Ambience rule (54 tokens, measured). Features: Ambience Off /
  Texture / Full (default Full); Settings → Campus life: Ambient moments. Preset (`edit_preset.py`): the Scene Engine allows one
  light touch of the setting on a quiet turn. Warding Rite's day plan: dusk about 18:30 (was 17:00; the chip "Next" follows it).
- Tests: new `tests/test_ambience_v1160.cjs` (29 checks); `test_playtest_v134` reads 18:30. Full `npm test` (73 suites + static
  QA, 2,392 checks), `npm run stress` and the token audit pass: ~14.4k at the start, ~18.6k heavy (1.15.0: 14.0k / 18.2k; about
  200 of the rise is 1.15.1's far-grounds and speech lore). `save_1.15.2.json` added. Card, preset, both lorebook exports and both
  TEST cards rebuilt.
- Approved by the owner afterwards ("semua setuju", 2026-09-29): the crowd rhythms per category; the conditions of each old ghost story (the Third Stall
  and the Long Corridor after 20:00, the Three O'Clock Knock 02:50–03:10 while awake, Taken near the Forest, the Hills, the Old Hut
  and the courtyard after dark); the other new stories' hours (Breath on the Glass 16:00–22:00, the Last Bed 21:00–06:00, the
  Applause 18:00–23:00).

## v1.15.2 — Speeches at Remembrance Day and the Crowning Day morning (2026-09-29)

Owner, on the 1.15.1 questions: "semua setuju kecuali Remembrance Day itu ada speechnya sebelum lepas lentera ... speech headmaster,
vice headmaster dan warden) perjalanan crowning day juga ada speech headmaster dan vice headmaster di pagi hari sebelum naik
airship"; asked, the owner chose Rei speaking too (v38 said the Acting Warden "is not asked to speak"); "rei tetap tidak suka speak
tpi dia tahu ini kewajiban warden"; "speech/pidato bukan bicara biasa takutnya ai narator malah buat dia pendiam/introvert".
The other 1.15.1 choices are approved (Observation Tower and Old Hut on the Hills, the far-grounds legs, Forest to Clearing 30).
- Remembrance Day (lore 244, engine day plan): on the Grassy Field and Hills, Headmaster Baelin, Vice Headmaster Althair and Acting
  Warden Rei speak, then the lantern release. "The Acting Warden attends and is not asked to speak" is gone.
- Rei's file: "Has no patience for ceremonial speeches (formal addresses only: she is not shy, and in conversation she stays as blunt
  and self-assured as ever), and still gives one at Remembrance Day ... because it is the Warden's duty: short and plain, no ceremony,
  then she steps back." (was "Attends Remembrance Day and is never asked to speak"). Her Cast Sheet carries it.
- Independence Crowning Day (lore 24, engine day plan): the Headmaster and Vice Headmaster speak to the assembled academy at 07:00,
  then everyone boards the airship.
- Tests: `test_far_grounds_v1151.cjs` gains 4 checks (18); full `npm test` passes. `save_1.15.1.json` added. Both lorebook exports,
  card and both TEST cards rebuilt.

## v1.15.1 — Speeches at formal events; the far grounds are far (2026-09-29)

Owner, three notes: (1) "sebelum feast ada speech dari headmaster dan vice headmaster. ini jadi pola setiap awal event formal dan
setiap akhir event formal/setiap feast"; (2) the Fishing House is three minutes' walk from the boathouse, and the narrator wrote them
as neighbours; other entries may be ambiguous in the same way; (3) "lake, fields&hills, forest itu luas dan jauh", e.g. the
boathouse to the Gardens is 20 minutes, not 4, and the Forest to the Forest Clearing is far too. Owner-stated canon, applied directly
(as in 1.14.4). Decision touched: "Walking times follow the map" (1.2.1) now holds on the castle grounds only.
- **Speeches** (`merge_lorebooks.py` `formal_and_far_grounds`, engine day plans). World Index: every formal academy event opens with
  speeches from Headmaster Baelin and Vice Headmaster Althair, they speak again at its close, and every feast begins with their
  speeches. Entrance Feast: they speak again before dinner (the v38 text said so; 1.9.2 had changed it to "already spoken before
  sorting"). Warding Rite, Founder Day and Graduation feasts, and both Results days (assembly and feast), name the speeches;
  Graduation's morning ceremony has both speakers. The Month 1 calendar line: "19:00 speeches and feast".
- **Far grounds** (`curate_data.py` `FAR` / `FAR_LEGS`). The Lake (Boathouse, Fishing House, Willow Island), the Grassy Field and
  Hills (Observation Tower on the nearer crest, Old Hut on the far slope) and the Forest (Clearing) lose every map-distance shortcut
  and keep only their own paths: Courtyard–Hills 20, Gardens–boathouse 20, Hills–lake shore 15, Hills–Fishing House 14, Hills–Forest
  15, Hills–Observation Tower 5, Hills–Old Hut 10, Old Hut–Forest 5, boathouse–Fishing House 3, boathouse–Willow Island 10 (boat),
  boathouse–Forest 25, Forest–Clearing 30. From the Main Courtyard: Hills 20, Observation Tower 25, Boathouse and Lake 30, Old Hut 30,
  Fishing House 33, Forest treeline 35, Willow Island 40, Forest Clearing 65 (were 10, 13, 14, 15, 14, 28, 24, 43). The castle
  grounds are unchanged.
- **Lore wording.** Campus Map: the walking line gives these times under "The far grounds", the movement rule says four-or-five-minute
  hops hold on the castle grounds and explains the far grounds ("nothing out there is next door to anything else"). Grassy Field and
  Hills, Forest, Boathouse and Lake, Observation Tower, Forest Clearing and Fishing House state their walks. Same ambiguity fixed
  elsewhere: the Medical Centre (4 minutes) and the Commissary (3) were "beside the Mall", the Sparring Pavilion (3) "beside the
  rings".
- Tests: new `tests/test_far_grounds_v1151.cjs` (14 checks, including that every time in the walking line matches the computed
  path); full `npm test` passes. `save_1.15.0.json` added. Both lorebook exports, card and both TEST cards rebuilt.
- To confirm with the owner (my choices): the Observation Tower and the Old Hut count as part of the Hills (25 and 30 minutes out);
  the legs inside the far grounds (Hills to the lake 15, to the Forest 15; boathouse to the Forest 25); Forest to Clearing 30 minutes;
  Remembrance Day, Dorm Days (a dorm-only dinner) and the Crowning Day trip are not treated as formal events with the Headmaster's
  speeches.

## v1.15.0 — Grades and exams with real effects (2026-09-29)

Owner: "buat grades/exams ada efek sungguhan lalu kaitkan dengan fitur study dan fitur lainnya yg bisa terkait"; draft
`planning/DRAFT_grades_exams.md` approved ("semua setuju kecuali poin 2"; for [?2]: "a dan b", and a B also gives the teacher +1 XP).
Decisions touched (§4 / approved designs): FP9's dorm rank now reads marks instead of preparation tiers; the exam reputation events
of `docs/design/reputation.md` are written by the engine (same figures); the exam lines of four bond rewards get numbers (texts
unchanged). Bond XP still comes only from reported interactions.
- **Marks (engine 5d).** Seven subjects, A–F. Base = the FP8 preparation tier (Gareth Rank 10: one tier up). No skipped class of
  that subject since the last exams: at least C; 3+ skips: −1. Condition when the exam starts (lore 232 slots; finals: a seeded run
  day and hour, Mon–Thu 08:00–15:00, shown in `<now>` and the Student file): Tired −1, Exhausted −2; Collapsed, the Medical Centre
  or a serious injury = a make-up, at most C. Six training sessions since the last exams: Combat +1. Modifiers together at most ±2.
  Then Alyssa Rank 10 (+1 on the lowest practical subject), the story's `/Exam_events` (one step, or `Fail`), Layla Rank 10 (History
  at least A). Mimosa's focus draught taken on the exam day (`/Perk_use`) cancels that day's penalties. Creature Studies' midterm
  mark is fieldwork (no exam-day condition).
- **Posting.** Midterm marks on the Friday of exam week (or when the next count begins), finals on Results day before the ranking.
  `Player.Academics.Exams["Y1 M3 Midterm"]` holds the line, `Grades` the latest mark per subject; Journal, toast, `<now>`
  ("Marks posted ..."), weekly recap. The engine owns `Player.Academics` while the feature is on (a direct write is reverted).
- **Effects.** Dorm rank: (midterm + 2 × finals) / 3 on 0–4 (a save without marks keeps the tiers). Academy: average ≥ 3.5 +15,
  ≥ 2.5 +8, ≥ 1.5 +3; one F −8, two or more −15; Doves +8 for a DMD A (rule 502 no longer lists these for the narrator). An F adds
  the Commitment "Remedial <subject>" with the teacher, next week's Saturday 10:00 (Study Hall slot); removed within three hours of
  its start it was attended and the F counts as a D. An A or B: +1 XP per counted talk/hangout with that subject's teacher (once per
  teacher). An A: `top mark in <subject>: <field> +10` in the Fortune modifiers, and paid tutoring (`/Tutoring`, 40 points a session,
  two a week, each a Notice Board request, Student +2 within the weekly cap).
- **Links.** Commitments `Type: "assignment"` removed before they are overdue add 45 study minutes; removed overdue, they count as a
  skipped class of the subject they name. Attendance off: the floor always applies.
- **UI / card.** Student file → Studies: next exams with the expected mark and its reasons per subject, the rewards in one line.
  Rule 502: new Exams and Tutoring rules (study feature cost 233 tokens, measured). `<now>`: exam week gives today's exams with
  their expected marks. Schema: `Exam_events`, `Tutoring`, `$ui.grades`, `$ui.posted`. Features: the Study and exams text.
- Tests: new `tests/test_grades_v1150.cjs` (38 checks); `test_batch2_fp8_v1101` and `test_tokens_v1110` follow the new rule text.
  Full `npm test` (72 suites + static QA, 2,330 checks), `npm run stress` and the token audit (~14.0k start, ~18.2k heavy) pass.
  `save_1.14.4.json` added. Card and both TEST cards rebuilt.
- To confirm with the owner (defaults I chose): the remedial slot (Saturday 10:00) and its three-hour window; the finals run hours;
  six training sessions for Combat; +45 minutes per assignment; the reputation cut-offs from the average; Alyssa's +1 goes to the
  lowest practical subject; the draught cancels penalties rather than raising the mark.

## v1.14.4 — Crowning night lore follows its map (2026-09-29)

Owner: "independence day mapnya sudah diperbaiki, untuk kembang api dan airship edit lore agar sesuai map".
- The fixed map (`Maps/halvard_summer_independence day.webp`, the same file at assets commit `1ece91e`, the repo's HEAD per
  `git ls-remote`; jsDelivr lists 56 portraits, 56 thumbnails and 15 maps there): all 36 pins sit on their buildings, the Boathouse
  and Lake (12) and Fishing House (34) included. `base_url` pinned to `1ece91e` (manifest, `process_assets.py` default, map test).
- Lore 24 (Independence Crowning Day), as the map shows it: "fireworks over the lake, bursting beyond Willow Island and doubled in
  the water, watched from the Grassy Field and Hills and the shore"; the hired airship "rides at anchor at the edge of the grounds,
  beyond the Menagerie and the Gymnasium" (it was over the Grassy Field and Hills in both lines). The Harvest Festival already closes
  with fireworks over the lake, so the two festivals now agree. Graduation's airship (above the Grassy Field) matches its own map and
  is unchanged.
- Engine day plan for Crowning Day: the fireworks over the lake and the airship's mooring, the same words.
- Tests: quick run of `test_mapvariants_v1130`, `test_lore_audit_v197`, `test_lorebook_v136`, `test_saves`, `qa_static`,
  `test_dynamic_lore_v1140`, `test_people_map`: all pass. `save_1.14.3.json` added. Both lorebook exports, card and both TEST cards
  rebuilt.

## v1.14.3 — The season and event maps are live (2026-09-29)

Owner: "ke 14 map sudah ada di https://github.com/pizzatuna65-jpg/eldrasil-assets/tree/main/map" (the same 14 files are in `Maps/`;
`halvard_summer.webp` is byte-identical to the default `halvard_map.webp`, so the default stays the Summer map).
- `data/assets_manifest.json`: `base_url` pinned to `e64b4b1` (the repo's HEAD; jsDelivr lists 56 portraits, 56 thumbnails and the
  15 map files there, and serves the map files with HTTP 200). `map_variants` now holds 13 rows: Star Night (the new
  `halvard_spring_starnight.webp` replaces the magical-lit test map), Warding Rite, Club Festival, Crowning night, Sports Day, The
  Thinning, Traveling Circus, Academy Bazaar, Harvest Festival, Graduation, and the Spring, Autumn and Winter maps, with the hours of
  `planning/DRAFT_event_maps.md`. File names with spaces are written with `%20`.
- Pin check (all 36 pins drawn over every map): 12 of 13 match the default layout. **Independence Day** is shifted along the lake
  shore: the Boathouse and Lake (12) and Fishing House (34) pins sit on the water about 60 px above their buildings; the rest of that
  map fits. It shows 6 hours a year (M4 W2 Tue 18:00–24:00), so it is used as is. Two lore differences in that map: the fireworks
  burst over the lake rather than over the Grassy Field and Hills, and the airship is moored on the right (by the Gymnasium), not above
  the Grassy Field (lore 24).
- `tools/process_assets.py` rebuilt the whole manifest with the old 1.9.6 commit; it now keeps `base_url`, `map_variants` and their
  note and rebuilds only the NPC entries and the map size.
- Tests: `test_mapvariants_v1130.cjs` rewritten for the full set (37 checks: every row names a real event or season and has no
  spaces, Star Night and Crowning hours, Graduation afternoon vs morning, The Thinning week, seasons, summer on the default, crops and
  fallback); quick run of it, `test_people_map`, `test_saves`, `qa_static`, `test_dynamic_lore_v1140`: all pass. `save_1.14.2.json`
  added. Card and both TEST cards rebuilt.
- To confirm with the owner: regenerate the Independence Day map (lake shore, fireworks over the Hills, airship above the Grassy
  Field) or keep it.

## v1.14.2 — Founder's Park joins the Graduation market (2026-09-29)

Owner: "buat park juga seramai itu, ada stall, boneka salju, panggung musik kecil dsb".
- Lore 248: the market "spills down into Founder's Park, the one winter day its lawns are full": more stalls between the paths,
  snowmen built by anyone with cold hands, and a small wooden stage by the statue where the Music Club (lore 264: it already plays
  live for the campus) plays through the afternoon and graduates are pulled up to sing. "The one winter day" keeps the park's
  winter season line (empty benches) true for every other day.
- Engine day plan for Graduation: the market is in the Main Courtyard and Founder's Park, with the Music Club's stage.
- `planning/DRAFT_event_maps.md` map 12: the park around the statue with lantern-lit stalls, snowmen and the music stage.
- Tests: quick run of `test_lore_audit_v197`, `test_lorebook_v136`, `test_saves`, `qa_static`, `test_gradperks_v176`,
  `test_dynamic_lore_v1140`: all pass. `save_1.14.1.json` added. Both lorebook exports, card and both TEST cards rebuilt.

## v1.14.1 — Graduation's winter farewell (2026-09-29)

Owner: "add graduation event ke map, dan sekalian edit agar graduation event ada vibes winter chrismast vibenya dengan stall,
boneka salju dsb". This world has no Christmas, so the feel is carried by what it has, and nothing is named after it.
- Lore 248 (Graduation, via `merge_lorebooks.py`): a new "Farewell market" paragraph: from noon the Main Courtyard is a winter
  market (clubs and dorm floors sell hot cider, roasted chestnuts, sweets and small farewell gifts under evergreen garlands and
  lanterns; families browse between the ceremony and the recruitment tables); if there is snow, each dorm builds a snowman in its
  colours (the weather is seeded, so the lore does not promise snow); the Farewell Pine at the centre, where underclassmen tie a
  ribbon with a wish for each graduate they will miss. The graduates' airship arrives at dusk and rides at anchor above the Grassy
  Field overnight. Canon invented here: all of it (owner's request); the morning ceremony, the tables and the feast are unchanged.
- The engine's day plan for Graduation (EVENTS `s`, shown in `_Event_today` and the calendar) names the market and the airship.
- `planning/DRAFT_event_maps.md`: map 12, Graduation over the Winter map, Sunday 12:00–24:00, and its `map_variants` row.
- Tests: quick run of `test_lore_audit_v197`, `test_lorebook_v136`, `test_saves`, `qa_static`, `test_nations_v172`,
  `test_gradperks_v176`, `test_year2_v174`, `test_mapvariants_v1130`, `test_dynamic_lore_v1140`: all pass. `save_1.14.0.json` added.
  Both lorebook exports, card and both TEST cards rebuilt.

## v1.14.0 — Lore by season and calendar phase (2026-09-29)

Owner: season- and time-dependent lore like the Mall's seasonal items, "gk perlu lore breaking cukup expand sedikit" (example: few
go to the Old Hut in winter), then "semua saya approve/setuju" for `planning/DRAFT_dynamic_lore.md` (S1–S26, P1–P4, [?1]–[?4]).
Nothing canon was removed or reversed; every line adds.
- `tools/merge_lorebooks.py` `SEASONAL` + `apply_dynamic_lore`: 26 location entries end with an EJS block that prints only the
  current season's line ("In winter: ..."), by calendar month (the engine's 1.9.4 table, so Weather Off does not matter). Old Hut,
  Grassy Field and Hills, Forest, Forest Clearing, Boathouse and Lake ([?1]: in winter a boat only on a still, mild day), Willow
  Island, Fishing House, Gardens (greenhouses), Menagerie, Groundskeeper's Lodge, Sports Field, Swimming Pool, Gymnasium, Founder's
  Park, Courtyards, Rooftop, Observation Tower, the Viridian, Light and Fire dormitories, Common Rooms, Bathhouse, Canteen (a menu
  per season), The Mall, Medical Centre, Spirit House. Keyword entries, so no always-on cost; one line (about 20–35 tokens) prints
  while an entry is active.
- Phases (`PHASES`): the Library's exam-week tables and a full Study Rooms line (two weeks before exams and exam week), the
  Founder's Hand queue on exam mornings (moved out of the park's always-on text; the superstition entry 223 is unchanged), the Mail
  Tower's parcels in the week before a long break (new).
- The v39 export keeps all four season lines as plain text and the old exam wording; `tools/curate_data.py` lifts the season lines
  into `data/locations.json` `seasons` (the description and vibe stay clean) and `gen_ui.py` passes them on; each Map location card
  shows the current season's line under its vibe ([?4]).
- No per-hour lines ([?3]): the entries already tell their night and dawn.
- `planning/DRAFT_event_maps.md` ([?2]): the default map is Summer; a Spring prompt replaces the Summer one; Warding Rite and Club
  Festival are drawn over the Spring map, Crowning night and Sports Day over the default; the Winter, Autumn and Spring prompts show
  the new season lore (steaming pool, glowing greenhouses, the Viridian oak, snowmen, sledding, the snowed-in Old Hut, boats under
  covers, fireflies on the willow; the gold oak, raked leaves and harvest; seedlings under cloches, kites); every prompt now asks
  for a change "clearly visible at a glance"; the owner will use Qwen (1500×1000, resized to 1536×1024).
- Tests: new `tests/test_dynamic_lore_v1140.cjs` (18 checks: each entry prints only its season's line in every month, the phases,
  v39, locations.json, the Map card). Full `npm test`: 70 suites + static QA, 2,245 checks, all pass. `save_1.13.2.json` added.
  Both lorebook exports, card and both TEST cards rebuilt.

## v1.13.2 — Visual lore for the event maps (2026-09-29)

Owner: "agree semua point 3" (all seven visual lore additions of `planning/DRAFT_event_maps.md` §4, and the proposed royal colours).
One line each through `merge_lorebooks.py`, so the narrator describes what the maps show:
- Forest Clearing (254): in winter the clearing stays green and in flower while snow lies everywhere around it.
- Warding Rite (96): from dusk to dawn the renewed wards are visible, a thin shell of pale-gold rune light over the grounds.
- Independence Crowning Day (24): deep blue and gold royal banners on the castle towers all day; that night the hired airship rides
  at anchor above the Grassy Field. Kingdom — Eldrasil (1): the royal colours are deep blue and gold (new canon).
- The Thinning (9): the wards along the outer wall flicker faintly all week, and the birds leave the grounds until it is over.
- Traveling Circus (241): the great tent is striped crimson and cream; the painted wagons park inside the wall by the Gatehouse.
- Academy Bazaar (243): each nation's traders keep to their colours (Yozakuran blossom pink and paper lanterns, Velmoran green and
  ivory, Arslan desert gold).
- Harvest Festival (245): the older corridors turned haunted houses glow a sickly green from outside.
- The draft's Crowning prompt now names the banner colours. Tests: quick run of `test_saves`, `qa_static`, `test_nations_v172`,
  `test_lorebook_v136`, `test_lore_audit_v197`, `test_mapvariants_v1130`, `test_worldmyth_v171`, `test_tokens_v1110`: all pass.
  `save_1.13.1.json` added. Both lorebook exports, card and both TEST cards rebuilt.

## v1.13.1 — Bazaar nations, event maps before season maps (2026-09-29)

Owner: the maps to make (4 seasons with the default as Spring; Star Night done; Warding Rite, Club Festival, Crowning Day night
fireworks, Sports Day, The Thinning, Traveling Circus, Academy Bazaar, Harvest Festival), img2img prompts from the lore with each
event drawn over its season's map, visual lore additions welcome but to be shown first, and "ubah sedikit entry event bazaar untuk
mention kingdom kingdom luar".
- Lore 243 (Academy Bazaar, via `merge_lorebooks.py`): a new line "From abroad" names the five nations of the approved
  `planning/DRAFT_nations.md` with their approved trades (Yozakuran tea, sweets and a katana; Norvaine starglass; Caelmari mana
  lanterns, rune heaters and locks; Velmoran orchard preserves and court fashion; Arslan brokers changing every crown's coin).
  Canon invented here: only the goods' wording (blossom sweets, orchard preserves), from each nation's approved description.
- `mapFor` picks an event map before any season map, whatever the order in `map_variants` (a season row listed first used to win).
- `planning/DRAFT_event_maps.md`: the working order (3 season maps from the default, each event over its season: Warding Rite and
  Club Festival over Spring, Crowning night and Sports Day over Summer, The Thinning, Circus and Bazaar over Autumn, Harvest
  Festival over Winter since M10 is Winter), a shared opening that locks the layout, one prompt per map, the planned `map_variants`
  rows with hours, and seven visual lore additions [?1]–[?7] waiting for the owner (the prompts already use them; drop a line if
  one is refused). The Thinning prompt draws no crack, portal or creature (lore 42 keeps what the seal holds out of sight).
- Tests: `test_mapvariants_v1130.cjs` now lists a season row before the event (15 checks); quick run of it, `test_people_map`,
  `test_saves`, `qa_static`, `test_nations_v172`, `test_lorebook_v136`, `test_lore_audit_v197`: all pass. `save_1.13.0.json` added.
  Both lorebook exports, card and both TEST cards rebuilt.
- Next: the owner makes the maps; each one comes back for a pin check (as Star Night) before upload.

## v1.13.0 — Map by calendar (2026-09-29)

Owner: "engine cek tanggal dan ketika tanggal itu terpenuhi map diubah … map 4 season + 1 event premier di tiap bulan", with a Star
Night map in `Maps/halvard_map_magical_lit.webp` (1536×1024, the default's size). UI only: no state, no rule, no token cost; D3/D6
untouched (the map changes nothing in the story).
- `data/assets_manifest.json` `map_variants` (read by `tools/gen_ui.py`): the first match wins: an event variant while that event is
  on (`event` = the start of its calendar title; optional `hours` per day, [from, to) in whole hours), then a season variant
  (`season`: Spring, Summer, Autumn, Winter, the calendar months as in 1.9.4, so Weather Off does not matter), then the default map.
  First entry: Star Night, M1 W3 Saturday 18:00 to Sunday 06:00 (its day plan: sunset to dawn).
- `20_map.js` `mapFor(S)` picks the image for the map panel and every location card crop. A card crop layers the variant over the
  default (a variant that does not load leaves the default visible); the big map tries the variant and falls back to the default
  (`data-alt`), then to the placeholder.
- Checked: the Star Night map has the default's layout; all 36 pins of `data/map_pins.json`, drawn over it, land on their buildings.
- Recommended event maps (owner to choose; in the chat of 2026-09-29): Star Night (M1), Warding Rite (M2), Crowning Day night
  fireworks (M4), The Thinning (M7), Traveling Circus (M8), Harvest Festival (M10); optional Club Festival (M3), Sports Day or the
  Academy Competition (M6), Academy Bazaar (M9), Graduation (M11). No event map for M5 and M12 (exams and breaks; the season map).
- **Owner step:** upload `Maps/halvard_map_magical_lit.webp` to the assets repo as `map/halvard_map_magical_lit.webp`, then set
  `base_url` in `data/assets_manifest.json` to that commit and rebuild (`gen_ui.py`, `build_card.py`). Until then the default map
  shows on Star Night. Each new map: same size and layout, a `map_variants` row, the same upload.
- Tests: new `tests/test_mapvariants_v1130.cjs` (15 checks); quick run of it, `test_people_map`, `test_saves`, `qa_static`,
  `test_reports_v1120`: all pass. `save_1.12.0.json` added. Card and both TEST cards rebuilt.

## v1.12.0 — Missed reports, sustained magic, documentation in step (2026-09-29)

Owner: "perbaiki hal itu beserta missed report dan juga poin 8" (fix the sustained-magic gaps, apply the missed-reports draft and
the documentation drift). Draft: `planning/DRAFT_missed_reports.md` (applied with the defaults below). Established decisions
touched, none reversed: the engine stays deterministic (the reminders read the reply and the player's message, the same on every
replay); bond XP and Trust still come only from reported interactions; D11 (fixed technique costs) is now charged in the cases that
used to slip through.
- **The engine derives** (point 4 of the discussion):
  - H1: a night skipped in one update (5 to 24 hours, at least 4 of them 00:00–06:00) with no Resting written counts as sleep, when
    indoors or on a trip, not in a battle and not under The Vigil. New Resting value `awake` for a deliberate all-nighter.
  - H2: an item reported in `/Consumables` loses one from the Bag unless the update already lowered it.
  - H3: Points changed with no Transactions line get a `-15 (not itemised)` line; a line written later for the same amount
    replaces it without a second charge.
  - H5: a pact partner's `Summoned` and its Summon effect in `Magic.Active` follow each other: Summoned without the effect starts
    it (Activation, then upkeep); the effect removed, or Summoned turned off, dismisses the partner. Partners that live by their
    terms are left alone. Before, Summoned alone let the partner and its abilities stay for free.
  - H6: a sustained or hybrid technique reported only in `Casts` (not running) becomes an Active effect and pays upkeep; before,
    it paid its Activation once and ran for free. Further uses of a hybrid in the same entry are triggers.
  - H7: an Active effect that only changed its name (same technique, same update) keeps running without a second Activation.
  - The study timer no longer counts a sleep in a study place (it read Resting after section 4 had reset it).
  - A genuine encounter (rank-up) and a Rank 5 handover reported in the update where the character left still count (they were
    present at the end of the previous update).
- **Reminders** (point 5; engine section 8l, `$ui.missed`, `<now>` "Possibly missed in the last update"): at most three per update,
  the most important first, never repeated within two days, never changing a number. R1 HP lost with no injury named; R12 hidden
  magic used before someone who does not know while Dove attention did not rise; R2 an item left the Bag with no use or gift
  reported; R8 a pending Rank 5 gift or a one-use perk named; R5 a technique named (the player's message or the reply) but not
  charged; R11 a costly effect running for 2+ hours or through sleep; R6 a bonded character spoke with no interaction and no talk
  counted today; R7 the narration tells of a gift; R9 the player said sorry to someone with Tension 10+; R13 a Transactions line
  with no Points change; R3 the narration skips time ("an hour later", outside dialogue) while the clock moved under 30 minutes;
  R4 the narration has {{user}} arrive at a map place that Location does not show; R10 an hour of drills at a training place with
  no /Training. New Features row **Report reminders** (ON). The engine reads the player's last visible message (not a hidden
  player-tool entry) from `SillyTavern.chat`: `runEngine(after, before, text, seedHint, userText)`.
- Rule 502: Resting (`awake`), Points (not itemised), sustained effects (Casts-only starts; end an effect before any time skip),
  pacts (kept in step), Consumables (the engine lowers Qty), and one line on reminders (Features-gated). About +140 tokens always-on;
  the `<now>` block costs nothing when empty, about 30 + 35 per line when it shows.
- **Documentation (point 8):** the release index and the 1.9.x entries pointed at `docs/TEST_CHECKLIST_v*.md` files that the
  2026-09-28 cleanup merged into `docs/TEST_CHECKLIST.md` (or removed, v0.2–v1.1): every reference now names the merged file and
  section. HANDOFF §5 figures (suites, checks, token audit, smoke views) are current; the Windows `python` note is in §5 too;
  PLAYER_GUIDE lists every Features row (fortune, attendance, recap, small scenes, study and reminders were missing); README shows
  the current release.
- Tests: new `tests/test_reports_v1120.cjs` (44 checks); `test_engine_b3` expects the hybrid cast to keep the wall running (upkeep
  2.5 over the next 5 minutes); `tests/stress/fuzz_builder.cjs` counts the Summon Activation that H5 now charges. `save_1.11.3.json`
  added. Full `npm test`: 68 suites + static QA, 2,194 checks, all pass. `npm run stress`: no problems. Card, both TEST cards rebuilt.
- To confirm with the owner (defaults taken; see the draft): H4 became a reminder (R12) instead of a +3 floor on Dove attention, and
  H3 (b) became a reminder (R13) instead of charging Points from a line; both change no number. H1 is limited to one night (a skip
  of more than a day keeps the old behaviour). The draft's Tahap 0 (measuring an exported chat first) was skipped.
- Next: the live checks in `docs/TEST_CHECKLIST.md` (v1.12.0 first: reading the player's message on swipe and after a player-tool
  edit; whether the narrator follows reminders without over-reporting).

## v1.11.3 — VectFox settings check (2026-09-28)

Owner: "check the VectFox settings" (then "ya"). Read the owner's VectFox settings in the local SillyTavern (`settings.json`,
`extension_settings.vectfox`; secrets untouched) against VectFox 3.6.9 source, commit 3623dc8 (the version audited before).
- Found in the owner's settings (to change in the VectFox panel, not in this repo): the built-in "Strip <UpdateVariable> Tags"
  is ON and built-ins run before custom patterns, so the in-world date never reached memory; the Eldrasil patterns were not
  installed; a custom pattern replaced `
{3,}` with nothing (glues paragraphs) and a catch-all tag stripper ran before any
  Eldrasil pattern could read the block; retrieval top-k 30 (default 10); Ghosting ON but inert (it needs Summarizer Injection);
  agentic retrieval ON (an extra LLM call per turn); debug logging verbose; an older chat mapped to the same collection.
  Fine: EventBase ON, Semantic World Info OFF, Summarizer Injection OFF, injection in-chat at depth 2.
- `docs/vectfox_cleaning_patterns.json`: the time pattern used to work only for the exact 503 example; it now keeps the date and
  place when the place is unchanged (no arrow), with a year ("Y2 M1 W2 Wed 13:40"), on two lines, or with "->". All five
  patterns pass VectFox's import check (≤300 characters, no ReDoS motif).
- Rule 503: the Analysis time is "M? W? Day HH:MM" (from campaign Year 2: "Y? M? W? Day HH:MM"), as the card dates things since
  1.7.4 and the preset's "Now:" line since 1.11.2, so Year 1 and Year 2 memories are not mixed.
- `docs/ECOSYSTEM.md` VectFox settings: the order of built-ins and custom patterns and what to delete, import instead of typing,
  Ghosting needs Summarizer Injection, the real setting names (`position`, `depth`), retrieval size and agentic cost, one chat
  per collection.
- Tests: new `tests/test_vectfox_v1113.cjs` (8 checks); `save_1.11.2.json` added; full `npm test` passed. Card and both TEST cards
  rebuilt.
- To do in SillyTavern (owner): see `docs/TEST_CHECKLIST.md` v1.11.3.

## v1.11.2 — Preset audit (2026-09-28)

Owner-approved `planning/DRAFT_preset_audit.md` ("fix what contradicts, remove or update what is stale, merge or remove what is
redundant"); D1 (Occupational Monomania + Vocation Gate) was not taken, both stay ON. All edits live in `presets/edit_preset.py`
section 11; the preset was built twice, byte-identical.
- Contradictions: the adult lines left in always-on prompts are gone (the `<baseline_anatomy>` list, "moan through intimacy",
  "non-con", "explicit anatomical shapes"); the jailbreak's "Intimate Scenes" moved into Realism Mode, so it returns when the player
  turns that on (1.11.0 C1: adult content is opt-in). The jailbreak no longer says "a magic academy" or "{{user}}, a first-year
  student", lets the card's own resolution rule decide (the Fortune roll) instead of "Failure is absolute", and invents no stakes
  (no "plot twists", no "ambush, lockdown" from reports). Anti-parrot answers the whole input (not "1 or 2 key elements");
  Cinematic Realism bans summaries of thoughts but lets NPC interiority follow the Scene Engine.
- Stale: BOLT no longer rolls two DnD d20s every turn (the DnD Simulator stays OFF; a card roll is used by the card's rule); the
  checks for Staccato, Anti-Briefing, Quant Hardening and three tags no prompt has are gone, and so is task 8, so the tasks run
  0-10 (Plot Momentum is task 10). The "Now:" first line gains the year from campaign Year 2 ("Now: Y2 M1 W1 Mon …"), as the card
  dates things since 1.7.4. "calls" → being told, a letter; eight instincts, not "[7]". 18 display regexes that only styled the OFF
  tracker blocks are disabled.
- Redundant: Attentional Salience merged into `<do_not_repeat_descriptions>` (toggle OFF, removed from the jailbreak list);
  `<npc_voice>` drops its copies of the four behaviour sources (points to `<scene_engine>`), the therapist register and the
  tricolon ban; Cinematic Realism drops Figurative Economy (`<emission_limits>`); the sound rule points to `<system_state>`. The
  Bridge drops the recalled-memories sentence (rule 504 says it word for word) and the setting line: the card's World Index now
  says "No phones, computers or recording devices … Units are metric" (`tools/merge_lorebooks.py`, +43 tokens of lore).
- Size (tests/token_audit.cjs): preset 16,883 → 15,877 tokens per message (depth 0, after the chat history: −358); card +43.
- Tests: `test_preset.cjs` +11 checks (and the new Now line / task numbers); `save_1.11.1.json` added; full `npm test` passed.
  Card, v39 export and both TEST cards rebuilt. `docs/ECOSYSTEM.md` updated (size, Bridge, CoT tasks).
- Live check: `docs/TEST_CHECKLIST.md` v1.11.2 (VectFox reads the "Now: Y2 …" line; the story still reads the same).

## v1.11.1 — Bug hunt fixes (2026-09-28)

Owner: "proceed, all fixes in 1.11.1" for `docs/BUGHUNT_2026-09-28.md` (full bug hunt, stress test and card check of 1.11.0).
- Results day (FP9): a dorm rank below #80 found no band and jumped to #1; it is now in the last band and keeps its number.
- Bonds (§4 Bonds, Cohorts): a bond written straight into `/Bonds` for an invented character, a rival academy team member or an
  incoming first-year before their year is removed with a log (it used to be kept for good and earn XP). Roster NPCs are unchanged.
- Attendance (FP7): only a Campus Map place other than the class venue counts as away. A name the map does not know
  ("Classroom", "Seminar Room 4") gets the benefit of the doubt; the Sparring Pavilion counts as the Combat Grounds and the Forest
  Clearing as the Forest (both lie inside them in the lore). Being in the Canteen or the dorm is still a skipped class.
- Time: when Month or Year changes but the Week was left as it was ("M3 W4 Sun" → "M4 W4 Mon"), the clock moves to the next
  such day in the month written (M4 W1 Mon), not three weeks on. Any jump of more than three days shows a "Time jumped N days"
  toast and a log line, so a wrong date can be swiped away.
- Fortune roll (1.9.8): a player-tool patch (Builder, Settings) writes `/$eng/tool` and says "(player tool)"; the engine does not
  count it as a story turn, so editing a setting and swiping keeps the same roll. New schema field `$eng.tool`.
- Smaller: a first name that is also a word opening a sentence ("Maple leaves…", "Ruby light…", "Pip-pip") no longer reveals
  that NPC's name; spending more than {{user}} has gives a "Not enough points" toast and a log for the narrator (Points still
  stop at 0); small scenes send an invented character away first even before it has an Extras record; no birthday party is
  arranged for {{user}} while students are home (Mid-Year Break, Month 12); `parseWhen` understands noon / morning /
  afternoon / evening / midnight, "in two days", "in a week", "next week", "Tue next week" and a written year ("Y2 M1 W1 Mon"),
  and far dates show their year; the lorebook update popup no longer says to start a new chat.
- Tests: new `tests/test_bughunt_v1111.cjs` (42 checks); `qa_static` checks the bracelet's browser storage (colour theme,
  collapsed state, per-tab toast de-duplication: display only); `run_all` shows assert-based suites as such. `save_1.11.0.json`
  added; full `npm test` and `npm run stress` passed. Card and both TEST cards rebuilt.
- Decisions touched: none changed. Bonds/Cohorts and the Fortune design are now enforced where they leaked. Recorded: the bracelet
  keeps two display preferences and toast de-duplication in browser storage besides the colour theme (never game state).
- Live checks: `docs/TEST_CHECKLIST.md` v1.11.1 (first: swiping back to an older swipe after a tool edit).

## v1.11.0 — Token audit optimizations (2026-09-28)

Owner-approved `planning/DRAFT_token_audit.md` (A1–A10, B1, C1). No rule was dropped: copies, engine arithmetic and text that did not apply at the moment were removed.
- Measured per message: card always-on 17,323 → 14,779 tokens in an ordinary save (−15%), 18,475 → 15,005 with 38 bonds (−19%); cast gate 245 → 169 on ordinary days; Cast Sheet with four people 8,396 → 8,217; preset 17,486 → 16,883. With four NPCs present the whole prompt before chat history goes from ~43,500 to ~40,000.
- 502: the five blocks after `</variable_update_rules>` are inside it, without engine numbers (moods, The Vigil, wind barrier, birthdays, alcohol). Situational rules appear only when they apply: Entrance Event and Entrance_tour (M1 W1 Mon), full Council election rules (Months 9–10; one line otherwise), Pacts (with a pact), Hidden (with hidden magic), `_Perks` (with a perk), rank_gift / introduction / vouch / Rank 7 escort (once a bond reaches that rank), Graduated (Month 11 or Year 2+). Exams moved after the reputation list it had split.
- 504: one travel/lateness bullet (the Time rule is in 502), one class-period sentence, the duelling-club correction removed (lore and cast gate keep it), Entrance bullets only on Entrance day. 510 and the NPC Roster's Entrance paragraph are gated the same way.
- `<now>`: "Today:" names the events; their plan stays in `World._Event_today`.
- `<current_state>` (entry 501) is rendered by EJS instead of the Tavern Helper macro: the same YAML without `$` keys, empty values, `Bonds.*.Progress` (always 0 since 1.2.2) or `_Event_ready` (legacy since 1.9.0); the variables themselves are unchanged and the narrator is told empty fields still exist. It reads the same message variables as `<now>` (`getvar`).
- Cast Sheet: the shared explanations (`<narrator_only>`, voice examples, Change types) are said once in the `<cast>` header, only for what the people present need; each sheet keeps "Voice examples:", "Change: <type>" and its secret status.
- Preset: "🔞Realism Mode / Jailbreak" and "🔞 NSFW Anti-Slop Register" are off by default (adult content is opt-in); "Female Vocal Acoustics" stays on (a cliché fix, not an adult toggle). Built twice, byte-identical.
- `tools/feature_cost.py` measures entry 501 without its EJS code. New `tests/test_tokens_v1110.cjs` (25 checks); nine older suites updated to the new wording; `save_1.10.3.json` added; full `npm test` passed; card, TEST cards and preset rebuilt.

## v1.10.3 — Bug fix from the token audit (2026-09-28)

- A bond whose Trust moved 15+ or Tension rose 20+ in an update without a history row of its own (engine-side changes; the TEST card's first update) crashed the engine in the defining-moments code when the bond had no history yet, or would have stored an older row as "defining". A defining moment is now only ever that update's own row. Found while measuring prompt size on the TEST Rank 7 card.
- New `tests/test_bughunt_v1103.cjs` (4 checks) runs the first update of both TEST cards; `save_1.10.2.json` added; full `npm test` passed; card and TEST cards rebuilt.

## v1.10.2 — Batch 3: varied NPC initiative reasons (2026-09-28)

Owner-approved `planning/DRAFT_batch_fp7_fp11.md` Batch 3 (FP11).
- When an NPC seeks {{user}} out (FP1), `<now>` now adds a concrete reason for the day after their Stage, e.g. "Today's reason: Saffi wants {{user}} to come along to the Gardens." It comes from new `data/initiative_asks.json`: generic templates per Tension category (withdrawn, social, confrontational, authority, dangerous; "strained" at Tension 70+), filled from the NPC's haunts, club, loved or liked things, today's or tomorrow's calendar event, and a few common student spots (not for staff). No template + filling repeats within the NPC's last 20 reasons; the choice is seeded and latched for the day (swipe-safe). The templates are the maintainer's, not canon for any one character; check them in play.
- `tests/stress/fuzz_builder.cjs` cast check now casts without letting time pass: since 1.9.4 passive mana regeneration made the old check report false "charged less" cases (stress was not run for 1.9.4). `npm run stress` is clean again.
- New `tests/test_batch3_fp11_v1102.cjs` (9 checks); `save_1.10.1.json` added; full `npm test` and `npm run stress` passed; card and TEST cards rebuilt.

## v1.10.1 — Batch 2: study time, exam preparation, dorm rank (2026-09-28)

Owner-approved `planning/DRAFT_batch_fp7_fp11.md` Batch 2 (FP8, FP9).
- FP8: the engine counts study minutes toward the next exam week (M3, M5, M9, M11 W1): time in the Main Library, Study Rooms or Archive outside lessons (Saturday Study Hall counts; halves for the start and end of an update; not while sleeping), +60 per reported study session (+30 more with a Rank 4 study partner). In exam week `<now>` states the preparation (unprepared / shaky / fair / solid / excellent; Standard cuts 4 / 10 / 18 / 28 hours) and rule 502 asks for results within one step of it. The tier of each exam is kept; a save that gains the feature mid-term gets at least "fair" for its first exams.
- FP9: at the first update of a Results day (M5 W2 Fri, M11 W2 Fri) the engine sets `Player.Profile.Dorm_rank` from the semester's two exam tiers, the competition record (qualified +1, champion +2), Academy standing (±1 at ±2) and a small seeded variation, moving at most one payout band (#1 / top 3 / 10 / 25 / 50 / the rest) up or down; a band up also gives Academy +5 (rule 502 no longer asks the narrator for it). `<now>` gives the announcement; the weekly recap mentions a new rank. With the feature off the narrator sets the rank as before.
- Settings → Studies and dorm rank: preparation hours Light / Standard / Demanding, rank change one or two bands. Features: Study and exams (ON; rules ~56 tokens).
- New `tests/test_batch2_fp8_v1101.cjs` (22 checks); `save_1.10.0.json` added; full `npm test` passed; card and TEST cards rebuilt.

## v1.10.0 — Batch 1: attendance, weekly recap, small scenes (2026-09-28)

Owner-approved `planning/DRAFT_batch_fp7_fp11.md` Batch 1 (FP7, FP10, FP12; every open decision as suggested).
- FP7 Attendance: the engine counts minutes away from the room of each class period of {{user}}'s year (location at the start and end of an update each count half; updates longer than six hours are assumed to follow the routine). More than the Settings threshold (default 30 minutes) in one period = one skipped class: Academy −2, `_Log`, and `<now>` tells the narrator the teacher reacts in character. Excused: Medical Centre, head cold, moderate+ injury, trips, battles, Collapsed, unsorted. An hour at {{user}}'s club venue during Saturday club time = Student +1 (weekly cap). A week with lessons, no skipped class and no Academy loss = Academy +2 at the week's end. Rule 502 no longer asks the narrator to report these (the old lines return when the feature is off).
- FP10 Weekly recap: at the first update of a new week the Journal gets one line for the week that ended (ranks reached, reputation levels, a clean week, skipped classes, a net point change of 300+; monthly payouts excluded); only notable weeks by default, every week in Settings.
- FP12 Small scenes: on a day with nothing on the calendar, outside class periods, parties, trips and battles, more than the Settings cap (default 4) of people in `Scene.Present` makes the engine pick one to take their leave (not someone {{user}} just interacted with, not a Rank 7 host in a dormitory; invented characters first, then unbonded, then the lowest rank; seeded ties); `<now>` asks the narrator to play the goodbye.
- Settings → Campus life: absence threshold 20/30/45 min, weekly recap mode, scene cap 3/4/5/6. Features: Attendance, Weekly recap, Small scenes on ordinary days (all ON). Always-on cost: Attendance ~11 tokens; the others only when they fire.
- The class timetable with venues, teachers and club venues now come from `tools/common.py` `class_data()` for both the Now entry (unchanged output) and the engine. `tools/feature_cost.py` also counts inline `on('x') ? … : …` text, so Settings shows true costs.
- New `tests/test_batch1_fp7_v1100.cjs` (29 checks); `save_1.9.9.json` added; full `npm test` passed; card and TEST cards rebuilt.

## v1.9.9 — Complete Settings (2026-09-28)

Owner: "make complete settings for the features; some settings are incomplete".
- Mood and rest: its eight rows offered a single value each; they now offer real choices (mood XP 0/1/2; bad-mood tension and good-mood apology ×1/×1.5/×2; training while Tired full/half/none; sleep debt per hour 5/10/15%; maximum sleep penalty 20/40/60%; full sleep 4/6/8 hours; gale exposure 0/10/15/25 stamina per hour). Defaults unchanged.
- New group Body and magic: mana recovery from empty 4/6/8/12 hours (default 6; rule 502 states the chosen time).
- New group Campus life: NPC initiative frequency (Rare: at most once a week, 10 days per NPC; Normal: the old 35% daily chance, twice a week, 7 days; Often: at most four a week, 4 days), rumour lifetime 10 days / 3 weeks / 6 weeks (default 3 weeks, as before), and how fast tension fades on quiet days (never / ×0.5 / standard / ×2).
- New `tests/test_settings_v199.cjs` (12 checks) asserts every Settings row has at least two options and that each new row changes the engine. `save_1.9.8.json` added; full `npm test` passed; card and TEST cards rebuilt.
- Settings for FP7–FP12 come with their batches (`planning/DRAFT_batch_fp7_fp11.md`).

## v1.9.8 — Fortune roll (2026-09-28)

Owner-approved A1 of `planning/DRAFT_outside_presets.md` (inspired by Pura's CYOA skill checks): "for important things only, gentle, with modifiers for the situation, e.g. ordinary sneaking vs a character with invisibility magic".
- Each update the engine rolls one seeded d100 for the next reply (`$ui.fortune`, seeded by the chat seed, a new turn counter `$eng.turn` and the in-world minute). Every swipe of that reply reads the same state, so the outcome cannot be rerolled by swiping; only the prose changes.
- `<now>` shows the number, the bands and the standing modifiers the engine knows: Chilled −10, Soaked/Overheated/Head cold −5, Tired −5, Exhausted −15, injured −10 / seriously −20, short on sleep −5, reputation ±5 per level with staff, students or Doves, plus the names of active magic.
- Rule 504: only an important, genuinely uncertain attempt by {{user}} rolls (never routine acts, everyday casting or an NPC's free choice). Situational modifiers: fitting magic, pact ability or item +20 to +40 (invisibility while sneaking past people who cannot sense it +40, or no roll at all if they cannot notice); partial fit or specialty +10 to +20; cover/darkness/preparation +10; alert, skilled or magic-sensing opposition −10 to −30. The number is never narrated; a failure costs something proportionate, never a dead end.
- Settings → Fortune roll: Gentle (default: 1–10 fails, 11–35 partial or costly, 36+ clean), Standard (20/50), Harsh (30/65). Settings → Features can turn it off (no roll, no rule, no `<now>` line). Cost when on: about 200 tokens (rule ~150, `<now>` ~50).
- A3 (varied NPC initiative reasons) is recorded as FP11 in `planning/FUTURE_PLANS.md`.
- New `tests/test_fortune_v198.cjs` (13 checks); `save_1.9.7.json` added; full `npm test` passed; card and TEST cards rebuilt.

## v1.9.7 — Lorebook audit (2026-09-28)

Owner-approved `planning/DRAFT_lore_audit.md`. The rules (502–510), NPC Roster, Campus Map, Timetable and Calendar were already current; no entry is redundant with the engine.
- World Index: {{user}}'s year now follows `Player.Profile.Year` (card EJS; the standalone v39 export says they move up a year each campaign year). It used to state "a first-year" under "Never contradict this", which contradicted Year 2+ play.
- World Competition is M11 W4 in the World Index and Academic Structure too (the calendar and engine have had it there since 1.0.3).
- World Index gains the season table (M1-3 spring … M10-12 winter; useful when Weather is off), the five combat roles instead of a dangling "Combat role.", and a clean Ring Dining Hall line.
- Season notes: the Harvest Festival is the last harvest as winter sets in; Sunreach Bay is a southern resort warm all year; Etnie's original cohort "graduated last year" (was "last spring"; the audit draft wrongly named Irene). Creator notes no longer carry a stale version.
- Edits live in `tools/merge_lorebooks.py`. New `tests/test_lore_audit_v197.cjs` (13 checks) compares the Calendar entry and the World Index dates with the engine's `EVENTS` both ways, so such drift fails the suite from now on. `save_1.9.6.json` added; full `npm test` passed; card, TEST cards and v39 export rebuilt.

## Repository cleanup (2026-09-28, card stays 1.9.6)

Owner-approved `planning/DRAFT_repo_cleanup.md`. No card behaviour changed; the card text now points to `docs/ECOSYSTEM.md` for VectFox.
- Removed: six old project zips (~94 MB), `planning/lore_*.md` (stale copies of `source_original/npc_lore_2026-09-25/`), the
  `planning/` copies of `bond_rewards.md`, `reputation.md`, `training.md` (identical to `docs/design/`), checklists v0.2–v1.1,
  `docs/TOKEN_AUDIT.md`, the empty `docs/examples/`, `tools/__pycache__/`, five one-off preview scripts, lorebook v37, and the
  generated `docs/npc_brainstorm/` (re-create it with `tools/make_npc_brief.py`; now in `.gitignore`).
- Merged: `PROGRESS.md` is now `CHANGELOG.md`, with HANDOFF's version summaries as a one-line release index at its top; the
  HANDOFF top is a short snapshot. Checklists v1.6–v1.9.5 are one `docs/TEST_CHECKLIST.md` (open checks first). `docs/VECTFOX.md`
  is the VectFox section of `docs/ECOSYSTEM.md`.
- Moved: `ELDRASIL_MVU_PLAN.md` and `docs/SPEC_v1_1_0_world_systems.md` to `docs/archive/`.
- Rewritten: `README.md` (was at 1.8.0) and `CLAUDE.md` (the finished 2026-09-26 task removed; per-release steps, Windows `python`).
- Kept on purpose: `docs/system_state.txt` until the live Batch 1–5 checks are done; the approved `planning/DRAFT_*.md` in place
  (tools and tests read them).
- `test_voices_g5_v167` checks the one remaining design copy. Card and TEST cards rebuilt; full `npm test` passed.

## v1.9.6 — Year 2 cohort portraits (2026-09-28)

- Linus, Maple, Nerys, Hadrian, Wren and Tsubaki now have portraits and thumbnails from the assets repo (the owner uploaded them in the same WebP format: 600×877 portrait, 192×192 thumb). `data/assets_manifest.json` lists them and `base_url` is pinned to assets commit `172dc4a` (the old files are unchanged there); all 112 portrait/thumb URLs answer 200. Face focus points are in `data/focus_overrides.json` (Nerys, Hadrian and Maple from the animeface detector, Linus, Wren and Tsubaki set by eye); the uploaded thumbnails are used as they are.
- Regenerated NPC data, UI, bracelet, main card and both TEST cards. `test_cohort2_v170` now checks the portraits instead of the initials fallback; relevant suites, saves (with `save_1.9.5.json`) and static QA pass.

## v1.9.5 — Playtest follow-up, Batch 5 (2026-09-28)

- Seasonal stock with real effects. Shop items can carry `gear` (umbrella, waterproof, warm, sun: worn from the Bag, now by exact item name as well as the old name patterns) or `use` (reported in `/Consumables`: clears conditions, +stamina, timed protection, cold remedy). The engine applies them (`SHOP_FX`; timed protection in `$eng.wxs.buff`); `tools/common.py` `effect_text()` words each effect once for the shop row, the Bag and the Price Guide.
- The eight existing seasonal items now have their stated effects (Hot spiced tea is also sold in Spring). Twelve new guide-price items across the Tinker's Bench, Greenwick's, Tailor's Row, Commissary, The Snug and the Mall bakery/cafés: Rain-ward charm (18, 3 h waterproof), Quick-dry powder (10, clears Soaked), Cooling charm (20, 4 h shade), Ember pouch (15, 4 h warm), Elderflower cold syrup (15, a head cold ends by the next day), Blossom honey cake (9, +10 stamina), Spiced apple turnover (10, +10), Roasted chestnuts (8, clears Chilled), Salted lemon water (6, clears Overheated, +10), Linen summer shirt (45, shade), Fleece-lined boots (70, warm), Mulled apple cider (12, clears Chilled, +5). Stock per season: Spring 6, Summer 6, Autumn 11, Winter 11, each from at least three shops. Existing names (and gift tastes) are unchanged.
- Rule 502 and the Price Guide tell the narrator to report a used "When used" item in `/Consumables/-`.
- Every Mall shop (all ten) now links to The Mall and back, a one-minute walk inside the Mall (`tools/curate_data.py`; locations and map data regenerated).
- Fixed a 1.9.4 bug: a misplaced comment in the UI's season helper made every seasonal item show "out of season".
- Tests: new `tests/test_batch5_shops.cjs` (36 checks); `save_1.9.4.json` added; full `npm test` passed. Main card and both TEST cards rebuilt. Live checks: `docs/TEST_CHECKLIST.md` (v1.9.5), then the Year 1 / Year 2 smoke playtest from the batch plan.
- To confirm with the owner: the twelve new items, their prices and effects are my proposals (guide prices, canon false).

## v1.9.4 — Playtest follow-up, Batch 4 (2026-09-28)

- Seasons now follow the academic year: M1–3 Spring, M4–6 Summer, M7–9 Autumn (one label, "Autumn"), M10–12 Winter, in the engine, Activities shop and bracelet. Monthly mean temperatures were rebaselined (9, 12, 15, 18, 21, 22, 19, 14, 9, 4, 1, 1 °C): Month 1 mornings average about 7 °C instead of −2 °C, winter mornings and nights reach freezing, snow falls only in M10–12, and the flu wave moved to Months 10–11. Existing weather and forecasts are recomputed from the new table; no story data changes.
- The bracelet's date line reads `Month n, Week n · Season · <temp> °C`; the weather chip now shows the sky and keeps the full weather line in its tooltip.
- New `/Exposure` event list: the narrator reports a direct soaking (`"soaked"`) or freezing hit (`"chilled"`) in the same reply, and the engine sets the condition at once (Weather effects Full only). Soaked outdoors at a wind-chilled 0 °C or below also chills immediately; warm gear delays it to the next minutes outdoors; shelter prevents it; drying rules are unchanged. A Soaked condition written directly outdoors behaves the same. `<now>` lists active conditions with their visible signs every reply until cleared, and rule 504 says to show them without a reminder.
- Passive mana regeneration: Mana_max / 360 per elapsed minute, awake or asleep, so an empty pool is full after six hours. The old sleep/rest mana refill is removed. The turn's regeneration is counted once: casts and activations can draw on it, sustained upkeep is offset minute by minute (an effect costing more than regeneration still empties the pool and ends), no regeneration after death. The 0.1 display rounding carries over in `$eng.mrem`, so short turns lose nothing.
- Tests: new `tests/test_batch4_seasons_mana.cjs` (38 checks); older mana expectations updated to include regeneration; `test_saves` treats weather-derived `$ui.moods`/`$ui.wx` as recomputed. `save_1.9.3.json` added; full `npm test` passed. Main card and both TEST cards rebuilt. Live checks: `docs/TEST_CHECKLIST.md` (v1.9.4).
- To confirm with the owner: with Winter in M10–12, the Harvest Festival (M10 W4), finals, graduation and the Sunreach Bay beach trip (M11 W3) now fall in early winter; the temperature table above is my baseline for the approved season order.
- Next: Batch 5 seasonal shops and Mall connections.

## v1.9.3 — Playtest follow-up, Batch 3 (2026-09-28)

- Narrator rules, the campus map and the edited preset now base elapsed time on actual dialogue and movement. A seconds-long exchange may remain in the same displayed minute; ordinary map times are walking estimates, and a described speed technique can shorten travel according to its effect, path and mana cost. The engine no longer turns a small backwards clock typo into an unexplained next-day jump; a clear late-night to early-morning crossing still rolls over.
- World index, campus rules and final cast gate reiterate that safe everyday casting, including movement magic, is permitted. Dove intervention requires an actual restriction, harm or established suspicion.
- Renamed the club **Magic Duelling Club** in both lorebook exports, roster, calendar, cast, locations, UI data and guide. Its practice is warded spell duelling; pavilion gear and Tsubaki's blade magic now make that distinction explicit. Existing `Duelling Club` saves migrate to the new profile name without a false join/leave entry, and Activities and People accept the alias before migration. Combat Class now describes spellcasting drills and no longer invokes Norvaine's army; nation lore remains intact.
- Regenerated the edited preset, both lorebook exports, card, UI/engine and both TEST cards. Full `npm test` passed, including 11 new Batch 3 checks and old-save regression. Connected SillyTavern narration remains to verify with `docs/TEST_CHECKLIST.md` (v1.9.3).
- Next: Batch 4 seasons, direct soaking/cold and six-hour passive mana regeneration; Batch 5 seasonal shops and Mall connections.

## v1.9.2 — Playtest follow-up, Batch 2 (2026-09-28)

- Entrance Event now begins at 09:00 with Baelin's and Althair's speeches, then Stone sorting. A Student Council member gives each sorted first-year their dorm vest; they sit with their dorm until sorting ends at 10:00. The assigned tour meets in the Arbiter Hall immediately afterward. The 19:00 feast no longer repeats the speeches.
- Tour groups are exactly two first-years plus one senior. In Year 1 the player is a first-year; from Year 2 onward they are the guide for two arrivals and do not sort again. `Campus_State.Entrance_tour` stores the roster-first assignment, selected deterministically and kept stable across scene changes and swipes. An invented student can fill a place only when suitable roster candidates are unavailable.
- Roster, Cast Sheet, `<now>`, campus/update rules and final cast gate now distinguish the current cohort's eventual dorm from what newcomers know or wear before their own sorting. Year 1 and Year 2 incoming students have no first-hand Halvard resident experience unless a documented earlier relationship supports it.
- Regenerated both lorebook exports, the engine, MVU entries, UI, main card and both TEST cards. New Batch 2 regression checks and relevant Year 1/Year 2, save migration and static QA checks passed. Live narrator behavior in connected SillyTavern remains to verify with `docs/TEST_CHECKLIST.md` (v1.9.2).
- Next: Batch 3 time, movement and magic canon after the live entrance smoke check.

## v1.9.1 — Playtest follow-up, Batch 1 (2026-09-28)

- Hid the main bracelet's Builder button once a student is registered; added a direct Bag button when inventory is unlocked and enabled. Student file now has a prominent **Edit student file** button in its header and an Overview hint pointing to it.
- Fixed a card-side cause of missing swipe arrows: Builder/Settings and other player-tool edits had appended a hidden user message after the narrator reply. When a final narrator reply has a prior state, the edit now inserts its hidden message immediately before that reply, preserving the reply as the final swipeable message. The hidden floor holds the edit applied to the pre-reply state; the current reply keeps its edited state. A greeting without a prior floor uses the existing append path.
- Regenerated the engine, MVU entries, UI, main card and both TEST cards. Focused tests passed: Batch 1 swipe/state/navigation, Builder, prior-save migration, UI/playtest checks and card static QA. Live swipe verification in the owner's connected SillyTavern session is still open: the local Swipes option is enabled, but the available session has no narrator API connection. If arrows are absent on an ordinary AI reply with no trailing hidden tool message, the host/preset path still needs inspection.
- Next: run `docs/TEST_CHECKLIST.md` (v1.9.1) in a connected session, then Batch 2 entrance/cohort work.

## Playtest follow-up — batched plan (2026-09-28)

- Reviewed the owner's Year 1 and Year 2 findings against `docs/system_state.txt` and the current lore, engine, UI and data. Drafted five execution batches in `planning/DRAFT_playtest_batches_2026-09-28.md`: swipe/navigation; entrance/cohorts; time and magic canon; seasons/exposure/mana; seasonal shops/Mall links.
- Confirmed source-level causes for the old entrance order and tour size, fixed 5–15-minute short-conversation guidance, rest-only mana recovery, eight seasonal products among 171, and missing Mall links for seven new shops. Casual magic and spell-only duelling are already canon but were contradicted by the narrator. Swipe failure remains to be reproduced in SillyTavern.
- Batch 1 implementation is recorded above; Batches 2–5 follow the scoped plan.

## v1.9.0 — Owner-approved rank benefits without scripted events (2026-09-28)

- Implemented `planning/DRAFT_rank_perks.md`. A full XP bar, expired cooldown and Trust/Tension gates advance one rank on the next genuine present interaction. Direct narrator rank writes are reverted; an old save's `_Event_ready` is accepted as readiness. No scripted rank-up event, location/time hint, prompt, toast or bracelet badge remains. A single private cue asks the narrator to show deepening through ordinary conduct.
- Rank 2: +1 bond XP for the first accepted player-invited hangout per NPC/week. Rank 4: active shared mana training, stamina training or study gets ×1.25, with the allowed activities listed for each of 44 bonded NPCs in `data/rank4_partners.json`; existing Rank 5 training gifts remain stronger. Rank 5 gifts enter `_Perks` only when their actual handover is reported. Rank 6 introductions start a new roster NPC at Rank 1. Rank 7 offers escorted dorm access and unscheduled staff worksite visits. Rank 9 allows one public vouch per NPC/month to soften one matching reputation loss by up to 5 XP. Rank 10 unique benefits remain.
- Narrator-created Extras and rival teams remain outside the bond system. Rule 502, rule 504, `<now>`, People and Map follow the new behavior. The old event importer, event data and event-writing guide were retired. Updated player guide, HANDOFF, this design draft, save fixture and historical tests.
- Verification: full generator/build pipeline, all automated test suites including new `tests/test_rank_perks_v190.cjs`, and prior-save migration. SillyTavern playtest remains useful for checking the prose feels natural, escorted door behavior, and worksite visits; these depend on the live narrator and venue.

## v1.8.0 — Approved mood and gift drafts (2026-09-28)

- Implemented both owner-approved drafts: 44 deterministic NPC mood profiles; weather, time-of-day, health and event inputs; Full / Flavor / Off behavior; Rank 4 mood icons; fatigue/injury training gates and social penalties.
- Sleep debt tracks waking hours from midnight to 06:00, six-hour recovery and capped stamina. The Vigil grants 48-hour immunity followed by two recovery nights. Head cold and sleep caps use the lower cap. Flavor narrates without stamina penalties; Off does not accrue debt.
- Outdoor wind affects casting, triggers and upkeep by magic subtype, including custom Builder settings and wind-blocking barriers; gale exposure, wind chill and indoor club relocation follow the draft.
- Five gift tiers from item/category data for all 44 NPCs, universal fallback, Etnie/Ezrel/Krieg exceptions, two weekly gifts and the last 24 discovered tastes in dossiers. Catalog provenance identifies prank goods, books, food, reagents and magical goods even when the item name omits its category.
- Added 43 birthdays, openness/fact-gated dossier and calendar discovery, birthday gifts/Trust/social/recovery modifiers, and a deterministic evening party invitation. Attendance grants XP only when reported; parties honor festival curfews and absence/lockdown/trip gates. Known graduates retain birthday reminders.
- Added seven Mall shops on the shared map pin and expanded the catalog to 171 items. Alcohol/tobacco consumption rules use Sundays, Mid-Year Break and Month 12. Cast Sheets include gift tastes; the birthday narration rule supports the approved party.
- Sources: `data/npc_moods.json`, `gift_prefs.json`, `gift_shops.json`, `wind_casting.json`, engine helper `src/scripts/mood_gifts.js`, schema, generators, source templates and UI parts. Replaced the old weather-only mood table. Rebuilt main PNG/JSON and both TEST cards at version 1.8.0.
- Validation: all 52 suites passed (`npm test`, 1,769 checks), including 248 feature checks and 136 save checks. Added a focused graduate-birthday regression after that run; reran the feature, world and static checks against the final build. Preserved a pre-change `save_1.7.8.json` fixture; old saves keep bond ranks and Trust and receive safe defaults. Updated historical test fixtures to isolate weather effects where those tests concern unrelated systems.
- Browser preview: checked bracelet, gift dossier, custom wind Builder controls, calendar and the new Mall shop filters/catalog using a local mock host. Actual SillyTavern import, persistence and narrator behavior remain manual checks in `docs/TEST_CHECKLIST.md` (v1.8.0). No stress run or project zip requested.

## Completed
- 1.1 Project skeleton, build/build_card.py (ccv3+v2 PNG assembler), card stub.
- 1.2 tools/merge_lorebooks.py -> src/worldbook (250 entries). NPC uid 254-262 remapped to 401-409 (data/uid_remap_npc.json).
  Calendar 134-145 -> single EJS entry uid 134 (reads stat_data.World.Month; shows current + next month). Crowning Day = capital trip (D17).
  Royhan (101) EJS date gate on M3W4 (D18). Lore edits D23-D25: new uid 267 Sparring Pavilion, NPC uid 331 Regulars, edits to 52, 86, 89, 132, 256.
  Tagging: all lore '[mvu_plot]'; untagged (both models): 0 World Index, 132 Campus Map, 134 Calendar, 131 Timetable, 20 Point System, 97 NPC Roster.
  Standalone export: dist/lorebook_v38/ (no EJS; calendar kept as 12 manual entries with M4 fix; Royhan as plain conditional text).

- 1.3 tools/process_assets.py -> assets_hosting/ (portraits 600px WebP, 192px face thumbs, map WebP), data/assets_manifest.json
  (NPC id = first name, unique; base_url placeholder USERNAME), data/focus_overrides.json (face centre per NPC, visually verified), src/card/avatar.png (map crop).
  Hosting bundle delivered separately as eldrasil_assets_hosting.zip (not inside project zip).

- 1.4 tools/curate_data.py -> data/npcs.json (49; roster/team attrs, fields with unlock rank, has_secret flag, no narrator_only text),
  data/relations.json (289 NPC->NPC edges, heuristic type + visibility; refine in 4.3), data/locations.json (65 incl. Sparring Pavilion
  + Mall shops Nightwell/Merryhew's/The Snug; description/vibe/regulars/connections/walk/clubs/access/lore/floor/pin),
  data/map_pins.json (35 pins, % coords, clusters, castle floor tabs). data/field_overrides.json = story-only fields (rank 99).

- 1.3b Thumbnail re-crop for 13 NPCs (user feedback): data/thumb_overrides.json = explicit square crop [cx, cy, side].

- 1.R Rebase on the user's lorebook v38 (Canteen main kitchen + Cooking Club, Gatehouse visiting parlour, Club Rooms amphitheatre + Theatre,
  Campus Map updates, NEW NPC Bobby Becket uid 331 + relations/regulars). The whole pipeline was re-run: merge -> assets -> curate -> build.
  Card-plan edits re-applied cleanly. Sparring Pavilion Regulars moved from uid 331 -> 332 (collision with Bobby).
  Standalone export is now dist/lorebook_v39/ (= user v38 + card edits). Card worldbook 251 entries, 50 NPCs, 306 edges.
  Bobby portrait processed (focus + thumb verified). Roster parser: 'Facilities' group + nickname before ';' (BB).

## BATCH 1 COMPLETE

- 2.1 src/scripts/mvu_loader.js + schema.js (MVU ZOD; robust coercion: string->object wrap for records, 'true'/'false' strings,
  clamps, enums with catch). Tested in node (tools-free harness in PROGRESS notes). Custom MVU entries now live in
  src/worldbook/custom/ (index.json + content/), uid >= 500, untouched by merge_lorebooks.py. uid 500 = [initvar] (disabled):
  M1 W1 Mon 07:30 at Reception and Gatehouse, Unsorted, 300 points, Etnie bond seeded (Rank 3, Trust 70). Age default 18 (lore: first-years are 18).
  Asset base_url set: https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@main/

- 2.2 Custom entries (src/worldbook/custom, index generated by tools/gen_mvu_entries.py):
  501 Current State (untagged, @D1) | 502 [mvu_update] Update Rules (after char) | 503 [mvu_update] Output Format (@D0, order 900)
  | 504 [mvu_plot] Campus Rules (Campus_State override, cognitive isolation, clock/body/magic/bond/_Log rules) | 505 Now EJS (@D1: clock,
  period, event, curfew, regulars-at-location presence helper, Dove attention). EJS for 505/134/101 rendered OK in node+ejs.

- 2.3 src/scripts/engine.template.js -> engine.js (tools/gen_engine.py injects NPC alias map, 161 aliases, deny-list for spirits/brands/
  shared surnames). One VARIABLE_UPDATE_ENDED handler, pure function runEngine(after, before): time normalise (no backwards; rolls day),
  calendar events (hand-coded from Calendar) -> _Event_today, timetable -> _Period, curfew (20:00, 21:00 Training Week, none Star Night,
  LOCKDOWN Thinning, Break), casts charged from _Techniques, sustained upkeep per in-world minute with depletion end-time, rest/sleep
  recovery, 40-HP single-event cap (Lethal_flag), _Condition/_Fatigue bands (% of max), alias-merge of Scene/Bonds keys, auto-bond on
  first meeting, daily progress cap 3, _Event_ready at 10, rank +1 only when ready, Dove stage, monthly payout per month crossed
  (bands 1:3000, <=3:2000, <=10:1200, <=25:800, <=50:500, else/unranked 300; Unsorted 0), $ui.discovered/unlocks/toasts, _Log (12).
  Scenario-tested in node (see test run in chat).
- 2.4 src/regex/index.json: fold UpdateVariable (display), strip it from prompt, hide unfinished block while streaming, strip status placeholder from prompt.
- 2.5 Card text (description = narrator brief; first_mes = Gatehouse arrival M1W1 Mon 07:30), creator notes, build v0.2 (257 entries,
  3 scripts, 4 regex). the v0.2 checklist (removed in the 2026-09-28 cleanup).

## BATCH 2 COMPLETE (card v0.2 is text-playable; needs user playtest)

- 3.1 Bracelet status bar: src/ui/statusbar.html (Tavern Helper message iframe; regex 'Bracelet status bar (display)' replaces
  <StatusPlaceHolderImpl/>, which MVU appends to every AI reply; first_mes now carries it too). Shows only on the latest message
  that has a bar (older bars hide themselves); regex maxDepth 2 as a cost cap. Conditional chips = module unlock system
  ($ui.unlocks from engine + live conditions). Buttons emit 'eldrasil:open' (profile|builder) for the UI script (3.2/3.3).
  build_card.py: 'wrap: html' wraps a regex replace file in an html code block and rejects $1 / {{ / <USER> sequences.
  Fold/strip regexes now also run on user messages (placement [1,2]) because the Builder writes through a user message.
  Engine: read-only guard (Magic._Techniques, Magic._Affinity, Hidden._True_magic, $ui.built revert unless $eng.auth=='builder'),
  per-update toasts, hybrid Trigger cost (D11). Schema: _Techniques.Trigger/Forbidden, Magic._Affinity, Pacts tier 'Basic'
  (lore Core 122 has 4 tiers; B2 schema missed it) + Terms, $ui.built, $eng.auth.
  tests/: harness.cjs (node: schema+engine+patch), test_engine_b3.cjs, preview/ (playwright screenshots with a TH mock).
  Run: NODE_PATH=<dir with zod@4 lodash yaml> node tests/test_engine_b3.cjs

- 3.2 Student Builder: src/scripts/ui.template.js -> ui.js (tools/gen_ui.py injects subtypes parsed from lore 33-36 and the
  50-NPC list). Character script 'Eldrasil UI' with TH buttons 'Student file' / 'Builder'; panels in a shadow-DOM overlay on the
  tavern page (listens to 'eldrasil:open' from the bar). Wizard: Start (4 samples: Frost duelist, Field medic, Spirit-bound,
  Secret unmaker) / Identity / Power (preset -> mana 100/130/180/custom, types, dominant, specialties, Stone reading) /
  Techniques (scale presets Minor/Standard/Major/Signature, per_use|sustained|hybrid, live cost line, forbidden detection) /
  Pacts (tier costs; generates 'Summon <spirit>' hybrid + 'Channel <spirit>' for Greater/Spirit Lord, Notes '[pact]') /
  Hidden (truth, cover + cover type, concealment, who knows) / Review (warnings, patch preview).
  Commit: Mvu.parseMessage(text, latest vars) first (aborts on failure), then createChatMessages(hidden user msg) +
  replaceMvuData on that floor. Patch = only changed fields + /$ui/built + /$eng/auth. Re-opening = amend (diff patch, mana not
  refilled, Summoned state kept). Cover stored as 'Cover (Type)'.
- 3.3 Student file panel (same script): Overview (identity, reputation bars), Body (vitals, injuries), Wallet, Studies,
  Magic (affinity, active effects with start time, technique cards, pacts), Hidden (only when unlocked; Dove stage track), Log.
- 502 rules: Stone reads _Affinity.Dominant only; Builder-owned fields; hybrid trigger = Casts while Active; summoning = Summoned
  + Active 'Summon <spirit>'.
- tests/test_builder.cjs (32 checks: every sample registers, round-trips with zero spurious ops, amend works, warnings fire).
  tests/preview/render_ui.py screenshots every panel.

- 3.4 Build v0.3 (257 entries, 4 scripts, 5 regex); creator notes updated; the v0.3 checklist (removed in the 2026-09-28 cleanup).

## BATCH 3 COMPLETE (card v0.3; needs user playtest in ST)

- 4.1 Cast strip (bar, from Scene.Present; statusbar.html generated from statusbar.template.html with CAST thumbs/descriptors) +
  NPC dossier (portrait w/ focus point, bond block, fields by unlock rank, 'Still to learn', rank-99 fields only via
  Secrets_revealed '<Id>.<topic>', their views on others, Known_facts, Milestones, NPC_status). Name gating (D14 + evidence):
  name shows at Rank 1, OR once named in story prose ($ui.names, engine via COMMAND_PARSED), OR once a learned connection
  names them; otherwise curated public role (gen_ui PUBLIC_ROLE) or rank-0 descriptor.
- 4.2 People → Bonds list (rank, 10 pips, trust/tension, here now / event ready / romance).
- 4.3 People → Connections: D3 v7 force graph, lazy-loaded from jsDelivr; edges visible if public / rank:N with FROM /
  rank:99 via '<From>.relationship'; Campus_State.New_relations as 'From the story'; type filter chips ('Acquainted' off).
  tools/build_relations.py (curate_data.py now delegates to it): longest-match aliases, deny-list, names before keys.
- 4.4 Map: pins (% coords), current-location pulse, clusters → swipe carousel, castle floor tabs, map-crop card headers (D7),
  structured cards (D8) incl. Location_changes, connections jump, undiscovered places hidden until visited (D21), Go here fills
  #send_textarea (D6). Side-by-side on desktop, stacked on mobile.
- 4.5 Build v0.4 (257 entries, 4 scripts, 5 regex; UI script buttons Student file / People / Map / Builder).
  the v0.4 checklist (removed in the 2026-09-28 cleanup). Tests: test_engine_b3 (16), test_builder (32), test_people_map (29).

## BATCH 4 COMPLETE (card v0.4; needs user playtest in ST)

- 5.1 Notebook panel (src/ui/parts/30_notebook.js; bar button + TH script button 'Notebook'; tabs appear per unlock):
  Planner (now card, commitments sorted by due with _When/overdue/With avatars/Where → Go here, this week's timetable with suspended
  days, 14-day 'coming up', 4x7 month calendar with event + due markers, month paging) | Journal (month timeline + Campus_State
  Events/Rumours) | Notice Board (official postings computed from the calendar ±10 days + story notices as pinned paper, 'Act on it')
  | Letters (waiting = sealed + 'Go and collect'/'Collect and read', read → Reply, composer drafts the action into the chat box)
  | Mystery Board (threads open→cold→solved, clue cards with people/place links, 'Follow up', Truths uncovered from Secrets_revealed).
  Schema: Commitments.Where/_When/_Late/$abs; Notices, Letters, Journal (30), Clues (Links), Mysteries. initvar seeds a Journal line.
  Engine 8b: parseWhen() ('M2 W1 Tue 14:00', 'Month 3 Week 2', 'Fri', 'tomorrow 4pm', 'M4'); overdue logged once + toast;
  notices dated/expired/capped 10; letters dated, outgoing forced 'sent', waiting toast, cap 12 (read first); clues dated, links →
  NPC ids, thread auto-created; journal: AI lines dated, engine adds sorting / bond rank-ups / secrets / solved mysteries; cap 30.
  Unlocks: notices (first notice OR entering any castle place: CASTLE list injected by gen_engine from locations pin 1), letters, mystery (+clues).
  502 rules for all new modules; 505 Now EJS adds 'Due soon' + waiting mail. Calendar/timetable = single source (gen_ui extracts
  EVENTS/TIMETABLE from engine.template.js). Shared fillChat() (map Go here uses it). Panels may define input(el).
  Bar: chips are clickable (Overdue / Due today / commitments → planner, Letter waiting → letters), Notebook button.
  Tests: test_modules_b5 (29), test_notebook (17); preview tests/preview/render_b5.py. Card built as 0.5-b5.1.

- 5.2 Activities hub (src/ui/parts/40_activities.js; bar + TH button 'Activities') and Battle panel (bar chip 'In battle' opens it):
  Clubs (27 clubs from locations + NPC Club fields via gen_ui; your club card with Go/Club time; Etnie 'followed you in' (her Club
  field = whichever club {{user}} joins); members shown only when their Club field is unlocked (Rank 1), others counted; Ask to join;
  Club Festival reminder; found-your-own note) | Competition (status card, 4-tier ladder with dates from the calendar, team check:
  4 members / each year / 5 roles, rival academy teams from Month 9 or Kingdom tier) | Shop (data/shop.json = single source for UI
  and custom lore uid 506 '[mvu_plot] Price Guide' (keyword-triggered); canon prices locked, others marked * guide; Go buy/Buy drafts
  into the chat, disabled when unaffordable; Bazaar notice; Banking House) | Projects (progress bars, Needs/Where/Due/With, Work on it)
  | Trips (Crowning Day capital + Sunreach Bay info from lore 24/247, countdown, travelling card with group, coin budget).
  Battle: opponents (HP/stamina/status, name-gated), your vitals, active effects with 'end', techniques with current cost,
  Use / Trigger (hybrid running) / 'active' (sustained running), hidden-technique warning.
  Schema: Wallet.Coin (Plan 4.1; was missing since B2), Competition {Tier, Status (case-insensitive enums), Placement, Team, Results},
  Projects, Trip {Active, Destination, Companions, Note}. initvar updated.
  Engine 8c: club join/leave journaled; competition status → journal + toast; Kingdom champion pays 5,000 once (engine, not AI);
  project completion (100) → journal + toast; trip depart/return journaled; Team/Companions/With/Battle.Combatants keys → NPC ids.
  Unlocks: competition (from Month 3 or when set), projects, trip (14 days before a trip start to 2 days after, or Trip.Active).
  FIX: Crowning Day curfew 22:00 (lore 24) was missing from the engine event.
  502 rules: Coin, Club, Competition, Projects, Trip, Price Guide. Student file Wallet shows coin.
  Tests: test_activities_b5 (26). All suites pass. Card built as 0.5-b5.2 (258 entries).

- 5.3 Random campus happenings (F20): data/happenings.json (30 lore-grounded, NPC-free items; single source, gen_engine injects
  and asserts every 'where' is a real location). Engine: chat seed taken once from the creation time of the message whose update
  first ran the engine (+ chat id), stored in $eng.seed; each day's pick = pure hash(seed, day) (no Math.random, swipe/replay-safe).
  None during breaks / Thinning; half chance on calendar days; no repeat of the previous 2 days; conditions days/months/weeks.
  World._Happening (AI-visible, read-only: engine recomputes) + $ui.hap (UI). Shown from the day's start until its window closes;
  one toast per day. Rate by $ui.happenings off/rare/normal/often (0/.2/.4/.65).
  UI: bar chip (bullhorn, opens planner), Planner now card (Go here), Student file > Settings tab (frequency via commitSetting():
  hidden user message + MVU patch, same path as the Builder, D3). 505 Now EJS adds the happening line; 504 rule: optional texture.
  State-as-memory (F21): regex 'State-as-memory: trim far chat (prompt)' (promptOnly, minDepth 24) sends older messages as '[…]'.
  Journal lines leaving the 30-line window (or removed by the AI) move to $ui.archive (300), shown faded in Notebook > Journal.
  502 Journal rule: lines must stand alone (long memory); 504 Memory rule: <current_state> beats the model's impression of the past.
  MVU card config override: custom uid 507 '[config_override]' (disabled; MVU scans it): 更新方式=随AI输出, 兼容性.更新到聊天变量=false
  (format checked against MagVarUpdate source, feature since MVU 2026-08-08; needs the card lorebook bound). Reason for pinning the
  mode: tool-call extra-model updates carry no prose, which breaks D14 name reveals. Flip it by deleting the 更新方式 line.
  Schema: World._Happening, $ui.happenings/hap/archive, $eng.seed. Harness: 'remove' on arrays now splices (as MVU does).
  Tests: test_happenings_b5 (23). All suites pass (activities 26, builder 32, engine 16, happenings 23, modules 29, notebook 17,
  people_map 28). Preview: tests/preview/render_b53.py + sample_b53.json. Card built as 0.5-b5.3 (259 entries, 4 scripts, 6 regex).
  the v0.5 checklist (removed in the 2026-09-28 cleanup) covers all of Batch 5.

- 5.4 QA + release.
  QA from upstream source (no longer open): TH's {{format_message_variable}} deep-omits every '$' key (macro_like.ts omitDeepBy), so
  $ui/$eng/$abs/$started/$Known_old never reach the AI; Mvu.parseMessage -> updateVariables emits VARIABLE_UPDATE_ENDED, so the Engine
  sees Builder/Settings patches. Dependency URLs checked (mvu_zod.js on StageDog/tavern_resource; MVU bundle on its default branch 'beta').
  tests/qa_static.cjs (23 checks on the BUILT card), tests/preview/smoke_all_panels.py (224 views, 0 page errors).
  Token audit (docs/TOKEN_AUDIT.md, tests/token_audit.cjs): always-on ~7.6k tokens at start, ~12.4k busy mid-year; Bonds dominate.
  Fix: FACTS_VISIBLE 10 per bond, overflow to hidden Bonds.<id>.$Known_old (40), dossier shows both; 502 told not to re-add.
  Late-game Bonds ceiling ~9.1k -> ~5.6k tokens.
  Assets pinned: base_url @4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f (the repo had no v1 tag; a commit SHA is just as immutable on
  jsDelivr; all 101 files verified present at that commit).
  docs/PLAYER_GUIDE.md, README.md (project), the v1.0 checklist (removed in the 2026-09-28 cleanup), creator notes rewritten. Card built as 1.0.

- 1.0.1 VectFox compatibility (user's memory extension; source checked at commit 3623dc8). Compatible: extractor/planner call the
  backend directly (no ST generation -> no MVU/TH/EJS side effects), is_system (Builder/Settings) messages skipped, latest turn held
  back (swipe-safe), default cleaning strips <UpdateVariable>. Avoid: Semantic Lorebook on this card's lorebook (raw content via its
  own extension prompt: EJS unrendered, [mvu_update] bypasses MVU filtering, duplicates keyword lore). Card changes: 503 Analysis Time
  line now carries full stamps "M? W? Day HH:MM" (lets a VectFox custom pattern keep the in-world time); 504 rule: recalled memories
  are the past, <current_state> is now. docs/VECTFOX.md + docs/vectfox_cleaning_patterns.json (3 patterns, verified by replaying
  VectFox's cleanText order). Player guide updated. Ghosting vs our trim regex: use one. Card 1.0.1.

- 1.0.2 Ecosystem with the user's preset Realistic Frankenstein 2.2 "Nuts & Bolts" on Gemini 3.8 Flash (presets/, generated by
  presets/edit_preset.py from the original upload; docs/ECOSYSTEM.md). Preset: its Internal States trackers (master + Bonds, GM Notebook,
  Agenda, Chekhov, World Sim, Fate & Routine, Thoughts) OFF (second state tracker, 'must be at the absolute end' vs <UpdateVariable>);
  Gemini notes applied (4 OFF, 3 ON); new Bridge prompt; Main/BOLT CoT/JB/Graphics/Colored Dialogue/Instincts edited; regex 'Untagged
  Thoughts' pair OFF (verified: deletes a player's text before '[Time skip…]'); web search OFF; temp 1.0 / top_p 0.95. ST regex order
  checked in ST source (global -> preset -> scoped), so preset display regexes cannot reach the bracelet. Preset always-on ~23.6k ->
  ~14.2k tokens. Card: description style line defers POV/length to the preset (the old 'third person' line contradicted the 2nd-person
  first_mes). VectFox patterns now 5 (colored-dialogue tags, GFX unwrap). Card 1.0.2.

- Handoff package: HANDOFF.md (model-neutral full context, rules, decisions, playbooks, verified facts), package.json + tests/run_all.cjs
  (`npm install && npm test`, 197 checks), builds are deterministic (gen_mvu_entries iterated a set; now sorted; verified under two PYTHONHASHSEEDs), all hardcoded environment paths removed (previews write to <tmp>/eldrasil_preview),
  presets/original/ holds the owner's preset upload and presets/edit_preset.py reproduces the edited preset byte-identically.

- 1.0.3 Bug-hunt fixes (two external reports on v1.0.2: model A #1-#6, model B F01-F14) + graduation departures. Every item has a
  failing-first check in tests/test_bughunt_v103.cjs (70 checks). Harness: applyPatch(..., { mvu: true }) emulates the MVU zod helper
  (drops any command whose path has a "_" segment), { text } passes story prose to the engine.
  Engine: time rollover keeps the AI's Day and moves by whole weeks when Week/Month/Year were not rolled (A#1; 502 states the rollover);
  Due / Notices.Until parsed once and anchored ($abs, Notices.$abs new), week-without-month rolls to next month (A#2/F04); $started/
  $settled and Bonds.$Known_old restored after a whole-record replace (A#3); a Casts entry for a sustained technique that is Active is not
  charged, hybrid Casts in the start turn are triggers (A#4/F05; 502: the Active entry is the cast); toasts carry {npc:id} tokens and
  prose names are read before bonds are created (A#5, D14); Star Night lifts curfew Sat 12:00 to Sun 07:00 only (A#6); "Away from campus"
  instead of the dorm curfew on a trip / off-grounds day when not at a campus place (F01; CAMPUS list injected by gen_engine; events
  flagged away); Graduation suspends classes (F03); an engine-ended summon clears Pacts.<spirit>.Summoned (F06); sleep never raises HP from
  0 (F07, D13); Kingdom prize once per campaign year ($eng.prizes) (F08); alias + canonical keys merge instead of dropping the alias
  (F09; also NPC_status keys canonicalised); World Competition is its own M12 W4 Thu-Sun event (F11); permanent secrets ledger
  $ui.secrets, unlocks read it (F13); fillShape() gives older saves the missing containers (F14); $eng.ver = engine version.
  Graduation departures (owner request): the morning after Graduation (M11 W4 Sun 07:00, per campaign year, once) the engine puts that
  year's Halvard students with lorebook Year + campaign Year - 1 = 3 into Campus_State.Graduated (new, AI-visible), journals it and
  toasts it. Graduates are removed from regulars (Now EJS 505, map cards), club member lists and the team check; the dossier says
  "Graduated; has left campus". Bonds/dossiers are kept. The story may remove a name (repeat year, staff); the engine never re-adds it.
  STUDENTS map (group "Year N") injected by gen_engine; rival academy teams and staff are excluded.
  UI: Builder patch lifts "_" paths to /Magic or /Hidden (liftReadonly) because the helper drops them (F12, verified in StageDog
  tavern_resource util/mvu_zod.ts isReadonlyPath; v1.0.2 registered students without techniques); builderMismatch() refuses to report
  "saved" when something did not land; pLog hides unknown names; NPC_status shown next to regulars and excludes teammates from the team
  check (F02); Notebook truths read the ledger. Bracelet: name tokens resolved, gated "Bond event ready" chip, "Away" chip.
  Lore: Royhan's D18 gate has a third state for the Dorm Competition weekend; "qualified" only from Month 4 (F10, merge_lorebooks.py).
  Not changed: model A's NAME_RX note is a false positive (the escape works; checked with "Mr. X (Jr)"); a Casts entry in the turn a
  hybrid effect ends still costs Activation (existing test_engine_b3 behaviour).
  npm test 267 checks at that point (8 suites + static QA), smoke 224 views / 0 errors, token audit ~7.8k start / ~12.5k mid-game (+~130).
  the v1.0.3 checklist (removed in the 2026-09-28 cleanup), PLAYER_GUIDE (memory limits worded honestly, Away, graduation). Card 1.0.3.

- 1.0.3 (same release, owner requests after the bug-hunt round)
  Calendar: World Competition moved to M11 W4 Wed-Sat (Graduation's old slot), Graduation to M11 W4 Sun, Month 12 holiday only. Reason:
  a third-year picked for the World Competition (e.g. Gareth) had already graduated. Lore edits in merge_lorebooks.py (C[144], C[145],
  C[248]; standalone v39 too), engine EVENTS (World Competition flagged away), departures now M12 W1 Mon 07:00.
  Incoming cohorts (feature ready, no data yet): data/cohorts.json {campaign year: [ids]}; curate_data sets npcs[*].arrives; incoming
  NPC entries EJS-gated on World.Year (v39: a plain note); NPC Roster uid 97 is now year-aware EJS (renders identically in Year 1: moves
  everyone up per campaign year, adds cohorts on arrival, puts Campus_State.Graduated on its own line, marks kept-back students
  "repeating"); engine STUDENTS {id: [year, arrives]} + ARRIVES, graduation by current school year, no bond / name reveal before arrival
  (logged), arrival journaled + toast + narrator log once per campaign year ($eng.cohorts); Now 505 and UI (map regulars, clubs, graph,
  dossier views, Builder "who knows", team-check years, dossier year label via yearNow) respect arrival and graduation.
  Tests: test_bughunt_v103 85 checks (Gareth scenario; fake incoming NPC injected into engine, UI and roster). npm test 282 checks.

- 1.1.0 World systems (docs/archive/SPEC_v1_1_0_world_systems.md, approved by the owner). Tests first: tests/test_world_v110.cjs (110 checks).
  Weather (engine 1b): northern seasons; sky per block (morning 06-12, afternoon 12-18, night 18-06, the night belongs to the day it
  starts) from base x block x transition weights, chained without state over 3 warm-up days (simulated: the night shown yesterday and
  the one today's chain starts from differ on 0.4% of days); rain intensity, snow (never above 3 °C), a separate wind roll, rare weather
  (lightning storm, hail, blizzard, dense fog, heatwave; ~2 blocks a month, spring lowest); °C table; World._Season / _Weather; $ui.wx
  for the UI and 505. Divination Society forecast (posted 07:00, ~75.9% right over a year, rare events never forecast) on the Notice
  Board card and in <now>. Weather effects setting Off / Flavor / Full ($ui.wxfx, default Full). Away from campus: no campus weather.
  Effects (Full, engine 4b/6/7): outdoor minutes from before/after location; gear from Bag item names; Soaked / Chilled / Overheated
  with exposure counters ($eng.wxs), cleared after 60/60/30 min indoors or by the story; stamina -10 per outdoor hour; Head cold daily
  roll (15% after Soaked/Chilled, +5% flu wave, +5% low stamina; 2-4 days; stamina cap 80%); flu waves 1-2 per year in M1-M2 with 1-2
  seeded students off sick; sleep quality (rain +10%, storm -20%, hot night -10%); bond daily cap +1 (indoors in rain/snow/storm,
  outdoors in fine 15-27 °C, clear Star Night; max +1); Dove attention rise halved outdoors in fog or heavy weather; outdoor battle
  field line; outdoor regulars move indoors in rain; all-outdoor clubs practise indoors (Fishing excepted); canon weather mood for Idris
  (data/weather_moods.json). Happenings: outdoor items skip heavy-weather days; new weather-only items (snow clearing, storm clean-up,
  doubled Dove patrols in dense fog); fallen tree x3 after a storm or gale.
  Class-aware presence (505): curate_data parses the roster's teaching posts into npcs[].teaches (unknown posts stay unknown); the Now
  entry carries students, teachers, the timetable with venues (parsed from the engine TIMETABLE) and club venues; students leave
  "likely around" in P1-P3; Study Hall; Saturday club time; "Your class now" line with teacher and up to 8 classmates (cohort formula,
  dorm filter for [D]); the map shows "(in class until HH:MM)".
  Story hooks (engine 8f; Hooks record, hidden from the UI), gossip (engine 8g; $eng.rum fate + reach; dead rumours to
  $ui.rumours_old; Journal shows reach), the Bag (engine 8h; Inventory record; case merge, Qty 0 removes, cap 40 never dropping gear,
  Sunfizz empties and the canon 2-point return at the Commissary / The Mall; Student file > Bag tab with Use / Give / Drop drafts).
  Features settings (engine 0b; data/features.json single source): a feature that is off is parked in $ui.parked (not deleted),
  a write the AI still makes into it is merged into the parking, restoring runs the catch-up rules once (the toggle update aligns the
  "before" copy, so parking/restoring is not read as a story event), unlocks and chips follow; 502/504/505 gate each feature's rules
  with EJS (on('id')); tools/feature_cost.py measures each gate at build time (data/feature_cost.json, checked against a re-render
  within 10%); Student file > Settings > Features shows rules + live state per feature, a Core line, the total and the savings.
  Seasonal shop items (data/shop.json season field; greyed out of season; 506 lists the season). Preset Bridge: metric units line;
  "Time and Place" locked OFF. Custom entry 505 now has its own source src/worldbook/custom/505.template.ejs; tools/common.py shares
  club data and the outdoor list (gen_ui uses it; club data verified identical).
  Deviations from the spec (flag to the owner): Inventory Qty is 0-99 in the schema, not 1-99 (with 1-99 a delta to 0 is clamped
  back to 1 and nothing is ever removed); outdoor list follows the lore where the category rule does not: Gymnasium (lore 73, indoor
  training) and Old Hut (lore 263, shelter from rain) count as indoors, Founder's Statue and Park and Combat Grounds as outdoors; the
  Notice Board tab stays visible while story notices are off, because it carries the forecast (only the pinned section hides);
  the happening clear_dusk now needs a clear night (its text states the sky). Token budget: the spec's +30-60 always-on cannot hold
  with the rules it asks for; measured +530 at the start with everything on, back to v1.0.3 size with the new features off
  (docs/TOKEN_AUDIT.md). A condition the story adds while {{user}} is indoors lasts its full hour (found while building the sample).
  npm test 392 checks (9 suites + static QA), smoke 492 views / 0 errors, token audit ~8.3k start / ~13.2k mid-game. Card 1.1.0.
  the v1.1 checklist (removed in the 2026-09-28 cleanup), PLAYER_GUIDE (weather, conditions, gear, Bag, forecast, gossip, Features), TOKEN_AUDIT, ECOSYSTEM.

- 1.2.0 Owner playtest fixes (the owner's first-session UI notes; card 1.2.0).
  Bugs: (1) ArrowLeft/ArrowRight in a Builder field swiped the chat and closed the Builder: SillyTavern's document key handlers see the
  shadow host, not our input; the overlay now stops key events. (2) Opening Techniques pushed SillyTavern's page up (scrollIntoView and
  focus scroll overflow:hidden ancestors): scrolling is now done on our own boxes only and the page scroll is restored (keepPage).
  (3) After Register/Save the bracelet vanished: Tavern Helper never renders iframes in hidden (is_system) messages (verified in
  JS-Slash-Runner src/store/iframe_runtimes/message.ts), and the hidden entry carried the placeholder, so the old bracelet went stale.
  Player-tool entries (Builder, Settings, calendar notes) no longer carry the placeholder; the bracelet reads the newest state from the
  last message at or after its own, and ignores placeholders in hidden entries (old chats). (4) "After a refresh the Builder asked for
  power and techniques again": the exact cause could not be reproduced outside ST. Defences: the entry is created with its variables
  (createChatMessages data), written again through MVU and saved at once (SillyTavern.saveChat) instead of on a debounce; the Builder
  keeps a record of what it wrote in $ui.file, and the engine (§0) and the Builder restore the Builder-only fields from it when a built
  student comes back with them all empty (logged in _Log). $ui.file is read-only for the AI.
  Builder: pronouns are a list (+ Other); Personality under Appearance; optional Birthday (M? W? Day) -> Profile.Birthday, the engine adds
  "<Name>'s birthday" to _Event_today on the day and custom entry 508 (EJS, only on the day, written in the event-entry format) says how
  it plays out. Combat roles removed from the Builder: rule 502 has the Combat teacher assign Combat_role at the first Combat class.
  Power presets removed (D10 kept: still the player's choice): a mana slider 50-1000 plus an exact box up to 9999; 504 says Mana_max is
  private capacity. Specialties: the lists are suggestions; custom subtypes with a forbidden yes/no (Magic._Affinity.Custom); a
  technique with an unknown subtype asks too. Pacts: kind first (Spirit lawful; Demon Lesser..Demon Lord, Monster Grade IV..I,
  Animal, Human = forbidden Pacting, lore 36), presence (only while summoned / as the pact says), Apply pact -> its Summon/Channel
  techniques show on the Techniques page; an unapplied pact blocks registering. Magic.Pacts gains Kind and Presence. Hidden magic:
  no "who already knows" (Known_by is left to the story); the true magic is filled in like a technique and saved as a hidden
  technique (Notes "[true]"); _True_magic becomes its one-line summary. Older saves: the free-text true magic becomes the
  description of a "True magic" technique to finish on the next amend.
  Shop: the tab appears only at the Commissary or the Mall and its shops (Nightwell, Merryhew's, The Snug), opening on the shop named in
  the location; a "Shop here" chip on the bracelet. More stock for Nightwell, Merryhew's, The Snug and Ardenne (guide prices, canon
  prices untouched); every list says it is a recommendation. The Oracle Shell is sold at Merryhew's (lore 215 edited).
  Clubs: members already appear under a club once their dossier Club entry unlocks (Rank 1); venues now follow the map (below).
  Calendar: days are buttons; a day shows its events, dated state items (commitments, project due dates, notices' last day, the
  birthday) and a note editor. Notes live in $ui.marks (hidden from the narrator), written like Settings (hidden entry).
  Map (owner decisions, lore edited in merge_lorebooks.py): Soccer and Running Club at the Sports Field (running track round the pitch);
  Archery Club at the Archery Range; Swimming, Gymnastics and Basketball clubs at the Gymnasium (Swimming also at the pool); the
  Divination Society at the Observation Tower. New places with their own entries and pins: Fishing House (uid 268, pin 34, Fishing Club
  venue) and Willow Island (uid 269, pin 35); lore 78 shortened to point at them. Location cards all show Walk, Access, Clubs here,
  Regulars, Connected to. Walk is the shortest path from where you are (lore times on courtyard edges, map distance otherwise, stairs
  inside the castle). Regulars show only NPCs you have met whose Haunts entry is unlocked (Rank 1 without one). One card at a time
  with ‹ › buttons. The Rooftop stays hidden until discovered (D21, unchanged).
  npm test 428 checks, smoke 482 views / 0 errors, token audit ~8.6k start / ~13.5k mid-game (+~300: rules 502/504, Campus Map lines).

- 1.2.1 Owner playtest, round 2 (card 1.2.1). The bracelet shows above the narration: display regex "Bracelet above the narration"
  moves the placeholder to the top before the bracelet regex renders it. Walking times follow the map (owner: from the Gatehouse
  the Mall is 6 min, the Main Courtyard farther): curate_data.py builds legs (lore connections + straight walks between nearby
  open-air places and buildings within 30 map units, x scaled 1.5; 0.22 min per unit; forest, Old Hut and boat legs keep their lore
  times; castle stairs 1 + floors) into locations.json `near`; walk_min is the shortest path from the Main Courtyard; the UI runs
  the shortest path from where the player stands (shared dorm rooms count as the player's dorm). Audit: no pair's path exceeds its
  straight line by 5 min or more. The Campus Map "Walking times" line (lore 132) is rewritten with the same numbers (e.g. Gatehouse 9,
  Fire Dormitory 8, Sports Field 15, Forest Clearing 43). Techniques: Apply technique folds a finished technique into one line
  (UI only; loaded techniques start folded); a new technique, a type change and the true magic start with the student's specialty
  for that type (the subtype list shows the student's specialties first; free text still allowed).
  npm test 434 checks, smoke 482 views / 0 errors.

- 1.2.2 Bond system revamp (owner design; replaces D14's Progress 0-10, daily cap 3, ready at 10). Single source
  data/bond_rules.json (engine, UI and Now entry). The narrator reports /Interactions [{With, Kind: talk|hangout|gift|help,
  Gift: loved|liked|neutral|disliked}]; the engine awards XP (talk 2 and hangout 3 once a day each, gifts 2 a week with loved x1.5
  from Rank 3 and disliked +5 Tension, help 5 once a week, weather +1 once a day) into Bonds.<id>.$xp (hidden from the AI), capped at
  the rank's need (xp_base 10..80 x pace: fast 0.25, brisk 0.5, standard 1, slow 2.5; Settings → Bonds). A full bar and the
  cooldown ($cool, cool_base days x pace) set _Event_ready; Rank still rises by 1 only while ready (else reverted); the bar empties.
  Events: data/bond_events.json (empty; tools/import_bond_events.py reads the owner's [Bond Event] lorebook, docs/BOND_EVENTS.md,
  example docs/examples/bond_events_example.txt); the engine checks place/time/days/weather/prerequisites and writes $ui.bev
  (ready, where/when for the hint, now, directions); without a scripted event the rank's default theme is used whenever the NPC is
  present. Now entry: per present NPC what they share at their rank (data/bond_openness.json draft: open +2 / guarded -1 /
  closed -2 on the first tiers; goals, views and past need the real rank; secrets never) and what the rank allows (perks); the
  event block with directions. Romance: Settings (default Rank 8, any, off); the engine reverts an early flag. Migration: a
  pre-1.2.2 save converts Progress to XP once ($eng.bondv); a Progress the AI still raises counts once as talk/hangout.
  UI: XP bars (People, dossier), event hints, Settings → Bonds; bracelet chip "Bond event: <name> (<where>)".
  Also: the Fishing House counts as the Fishing Club's rain-proof place in the Now entry.
  npm test 470 checks (11 suites), smoke 482 views / 0 errors, token audit ~8.9k start / ~13.8k mid-game (+~300: rules, bond lines).

- 1.3.0 Owner NPC brainstorm applied (handoff 2026-09-25, all approved by the owner; designs kept in docs/design/).
  Lore: source_original/npc_lore_2026-09-25/ holds the approved full entries; merge_lorebooks.py lays them over v38 (34 NPCs changed:
  Emotional tells for all 38 bonded NPCs, missing Loves/Hates/Goals/Backstory/Haunts filled, Etnie's backstory now a normal field,
  Castor's father keeps the Mail Tower, Rei's coat, Vallie Goal -> Goals, Tristan "What he wants" -> Goals). Royhan's EJS date gate
  is re-applied as before. Verified: every card entry equals the approved text. curate_data.py reads qualified labels ("Magic
  (public)" at Magic's rank; the dossier drops "(public)"/"(surface)", keeps "(daily)"/"(in battle)"); Trauma stays optional (Irene
  only). Roster parse bug fixed at the source: Rei's roster tags swallowed "Dorm Heads: ..." (UI data and the brief). The brief
  generator (tools/make_npc_brief.py) now writes the approved brief (rewards, special models, reputation, known gaps).
  Bond rewards (data/bond_rewards.json, parsed from the approved list): the 4->5 event gives the gift, 9->10 the Rank 10 benefit;
  the engine adds the reward (and its narrator-only side) to that event's directions and records it in _Perks (AI-visible,
  read-only) on the rank-up. Engine effects: training partners x1.5 (Saffi, Percival: Stamina; Sophia, Gareth: Mana pool), jumps
  +10% (Gavlan gift: Mana pool; Vallie Rank 10: Stamina), reputation +1 level (Ruby: Student, Baelin: Academy), one-use tokens that
  lift a negative level toward 0 (Kuroo: Academy, Milena: Doves), monthly points (Aiden, Tristan, Mimosa), one-use perks spent via
  /Perk_use (Irene, Althair, Baelin, Mimosa, Bobby gifts). The rest is narrator-played (their Effect text in _Perks).
  Mask -> truth (Castor, Kanae, Caine): 7->8 adds the nudge Fact; at Rank 8 the event is held until a "<Name>.<topic>" secret is in
  Secrets_revealed (UI: "This bond has gone as far as it can for now."). Krieg: introduction ready at once; +14 XP each Monday
  while Doves >= +1 (with hidden magic also Dove attention <= 39), else Tension +1; nothing from interactions. Rival teams: no bonds.
  Reputation (data/reputation.json): Profile.Reputation {_Academy, _Student, _Doves} (levels, engine) + $xp (signed Rep XP);
  /Rep_events {Rep, XP, Kind: repeat|event, Why}; repeat capped +5/week per reputation ($eng.repw), events and losses uncapped;
  bond milestones Rank 5/10 (+5/+10: staff -> Academy, students -> Student, Milena -> Doves) only below +3; high Tension (70)
  with a staff member or student -5; bond XP modifiers per talk/hangout; Academy +5 monthly bonus, Academy -5 halves the payout;
  level changes toasted, journaled and logged with their effect; <now> lists non-zero levels with what they mean. Migration: old
  Public/Dorm become Academy/Student XP once (x1.25, $eng.repv).
  Training (data/training.json): /Training {Track}; +1% of the starting value per session x (1 + 0.5 per partner in the scene),
  weekly 2.5%, lifetime 2x (Player.$Training per track: base, gain, week). Mana_max / Stamina_max: other writes reverted; a Builder
  change (or the 1.2.0 self-heal) moves the base.
  Rules: 502 (Training, Reputation triggers and values, _Perks / Perk_use), 504 (rewards are real, no endings), 503 example.
  UI: Overview reputation bars with what the level means; Body shows training progress; new tab Gifts & perks (secrets stripped,
  {{user}} as the student's name, one-use counts, used list); dossier hint for a held bond.
  Tests: tests/test_rewards_v130.cjs (42 checks). npm test 512 checks (12 suites), smoke 550 views / 0 errors (new sample
  tests/preview/sample_v130.json from make_sample_v130.cjs), token audit ~9.9k start / ~14.7k mid-game (+~920, mostly the
  reputation trigger list in 502).
  To confirm with the owner (numbers or mappings the brainstorm did not give): monthly amounts Aiden 200, Tristan 100, Mimosa 150,
  Academy +5 bonus 300 points; "high Tension" = 70; pro-Dove NPCs "keep their distance" = -1 XP per talk/hangout at Doves <= -3;
  Krieg's "suspicion low" = Dove attention <= 39 (Unnoticed / Rumoured); the mask gate opens on any revealed secret of that NPC;
  Public/Dorm migration x1.25. Token cost +~920 always-on: reputation could become a Features toggle if that is too much.

- 1.3.1 Owner playtest of card 1.3.0 (10 notes), all applied.
  (1) Etnie is no longer bonded in message 1: initvar 500 has Bonds {}. data/bond_rules.json `start` gives a bond its own start;
  the engine applies it once, when it first records the bond (the first scene they share, or a record the narrator writes): Etnie
  Rank 3, Trust 70, Title "Self-declared big sister", her fact and milestone (journaled), the Rank 3 cooldown before her next event.
  (2) {{user}} in lore text: the dossier printed raw NPC fields ({{user}}) next to state text MVU had already substituted (persona
  name). Every panel but the Builder now shows the student's first name (userName: Profile.Name, else the ST persona, else "you").
  (3) Map "you are here": "Boathouse" matched no place (the map name is "Boathouse and Lake"), and "Boathouse and Lake — Fishing House"
  matched the boathouse. The engine now writes World.Location in the Campus Map's words (canonLocation, §1): a short or partial name
  becomes the map name (tools/common.py place_aliases: parts of "X and Y" names plus common short names), a sub-spot that is its
  own place wins (a dorm room every dorm shares stays under its dorm), off-campus text and trips are left alone. The UI map reads
  locations the same way. Discovery, regulars, the Now entry, weather (outdoor) and bond-event places all see the map name.
  (4) Connections graph: every dot sat in the middle. Cause (reproduced in a browser): Tavern Helper runs the UI script in a hidden
  iframe, where requestAnimationFrame never fires, so d3's simulation timer never ticked and no node left (0, 0). The layout is now
  computed at once (300 ticks) and dragging steps the simulation with SillyTavern's own page frames; no animated double-click zoom.
  The lead text says which lines open when (NPC views on others at Rank 5–6, family/teachers public; unchanged design).
  (5) Event day plans: every EVENTS entry carries `s` (one plan or one per day) from its lore entry, with times; _Event_today is
  "<event> — <today's plan>", events separated by " | " (the bracelet chip still shows the short name); the calendar day view shows
  the plan. Lore 21 (Entrance Event) and the Month 1 calendar line carry the times (merge_lorebooks.py). Curfews from the lore that
  the engine missed: Traveling Circus 22:00, Harvest Festival Fri/Sat 23:00 (curfew per day).
  (6) Club sign-up: new event M1 W1 Tue–Fri "Club sign-up week": booths 16:00–18:00 after classes, Monday 10:00–18:00 (Entrance
  Event), registration closes Friday 18:00 (was 17:00 on sorting day; lore 21 edited).
  (7) Colour themes, palette only: data/themes.json (from tools/make_themes.py: role -> colour per theme; "a:r,g,b" = rgba only;
  "r,g,b*k" scales alpha): Pewter (default), Midnight, Rosewood, Parchment (light), Frost (light). Student file → Settings →
  Appearance; kept per browser (storage key "eld.theme"), no chat entry; the panels re-colour their CSS and HTML, the bracelet
  re-colours its CSS and follows changes live (storage event). qa_static allows browser storage for that one key only.
  (8) Map: the Forest has its own pin 37 (10.0%, 27.5%: the trees below the Forest Clearing, near the Fire Dormitory); pin 11 is the
  Forest Clearing alone. Walking times unchanged (forest legs keep their lore times).
  (9) Tension penalty mirrors the bond milestones: Tension 70 costs -5 (as before) and Tension 100 (maximum) another -10
  (data/reputation.json tension_max / tension_max_xp); staff -> Academy, students -> Student and now also Milena -> Doves.
  (10) Settings for the 1.3.0 systems (data/tuning.json, $ui.tune, written like every setting): Training (gain per session, weekly
  limit, lifetime limit; each with "No limit"), Reputation (pace x0.5–x2, weekly cap for everyday deeds incl. none, bond milestones
  until +3 / always / off, tension penalty on/off). Defaults are today's numbers (gen_engine.py asserts them against training.json
  and reputation.json). Rule 502 no longer states "+5 a week".
  Tests: tests/test_playtest_v131.cjs (52 checks); harness initState({ etnie: true }) meets Etnie first for older suites; the bond
  importer test runs `python` on Windows. npm test 564 checks (13 suites). Token audit ~10.0k start / ~14.6k mid-game (the Entrance
  Event plan at the start; event days add their plan, ~40–100 tokens).
  Windows build note: Python writes CRLF there. gen_ui.py and make_themes.py now write LF; the other generators' output was
  normalised after the build (sed 's/\r$//'), so the zip has LF throughout as before.
  To confirm with the owner: invented clock times where the lore gives none (Dorm Days 09:00–18:00 and 19:00 dinner, Warding Rite
  dusk ~17:00, exams 08:00, assemblies 09:00, feasts 19:00, competition days 09:00–18:00, Remembrance lanterns ~19:00); the theme
  palettes; Milena now counts for the Doves tension penalty.

- 1.3.2 Owner: pact partners have several abilities, like a creature's moves (the owner also approved the 1.3.1 invented clock
  times and Milena's Doves tension penalty). Builder → Pacts: each pact has an Abilities list (name, what it does / cannot do,
  per use or lasting, strength Light x0.5 / Standard x1 / Heavy x2 / Ultimate x3.5 of the tier's base trigger cost, or a custom
  cost); usual count per tier 2 / 3 / 4 / 6 (MOVE_CAP, a warning only). Each ability is its own technique "<partner>: <ability>"
  (Occult, the pact's subtype, Notes "[pact] <partner>"); with abilities listed, Summon is sustained (it only pays for the partner
  being there) and Channel names the abilities it can borrow. A pact without abilities (older saves) keeps Summon hybrid with the
  one generic trigger cost; the Builder nudges to list them. Loading reads the abilities back from the techniques (strength
  recognised when the cost matches). The Techniques page lists pact techniques grouped per partner. Engine §2: an ability cast is
  charged only while the partner is here (Summoned, Active "Summon <partner>", or Presence "terms"); otherwise it is logged and
  not charged. Rule 502 (Pacts) updated. The spirit template's Ember has three abilities (Flame Lash, Scent of Danger, Hearth Glow).
  Tests: tests/test_pacts_v132.cjs (27 checks); test_builder expects the sustained Summon. npm test 591 checks (14 suites).
  To confirm with the owner: the strength multipliers and the usual ability counts per tier.

- 1.3.3 Bug hunt with new stress tests (tests/stress/, `npm run stress`, ~30 s): fuzz.cjs (random narrator updates, sensible
  and broken, through schema + engine; invariants after every step; every panel, the Builder round trip and every EJS entry
  rendered on the states), fuzz_builder.cjs (random Builder drafts with odd names, pacts with abilities, hidden magic: save,
  load, save again, cast everything), sim_year.cjs (a diligent player for a year: bonds, events, training, reputation, pact
  abilities; state growth). Also a browser pass: 60 fuzzed states through the bracelet, 20 through every panel in a hidden
  script iframe (no errors, no "undefined"/"NaN", the graph never stacks).
  Verified upstream first (StageDog tavern_resource util/mvu_zod.ts): MVU applies commands one by one and drops only a command
  whose result fails the schema (with a toast), keeping the previous value. tests/harness.cjs now does the same
  (applyPatch.dropped); numbers that are not numbers stay a schema failure (a default would reset e.g. Dove attention).
  Fixed:
  - World.Time / Day typos: "7:5", "9.30", "7pm", "noon", "tuesday" are read; an unreadable or impossible value ("later",
    "25:61", "Funday") keeps the previous clock (logged). Before, it became 08:00 / Monday, which moved the story a day or a week.
  - Bonds could be lost: a whole-/Bonds replace dropped every bond it left out (Etnie's Rank 3 included), and a record rewritten
    whole lost its facts, milestones, title and trust. The engine keeps removed bonds and mends such a record (logged).
  - Builder amend after training rounded a fractional Mana_max (102.5 -> 103, and moved the training base): manaOf keeps 2 decimals.
  - null in a text field became the text "null"; it is now '' (or the field's default).
  - A student name with "$&" broke {{user}} replacement in the panels (string replacement patterns).
  - Changing a pact's kind now rescales the costs of abilities that have a strength (tier changes already did).
  Checked, no bug: weekly/lifetime training limits (a steady student reaches +100% after ~45 weeks), monthly perk points and the
  Academy +5 bonus (once a month each), rewards given once, Journal/archive/_Log caps, year rollover and a forgotten Year, big
  time jumps (one payout per month), 6000+ fuzzed updates at ~1–4 ms each.
  Observation for the owner (not changed): _Perks is AI-visible and grows to ~6 KB (~1,600 tokens) once many bonds reach Rank 5/10;
  the Rank 10 texts could be shortened for the narrator if the prompt gets tight.
  Tests: tests/test_bughunt_v133.cjs (12 checks). npm test 603 checks (15 suites).

- 1.3.4 Owner playtest in ST (8 notes).
  (1) Etnie in People at message 0: the card was right (Bonds {}), but SillyTavern still held the old lorebook; importing a card
  again does not replace its lorebook. Fix for the owner: character panel → More… → Import Card Lore (it asks to overwrite the
  lorebook of the same name; checked in SillyTavern world-info.js importEmbeddedWorldInfo), then a new chat. Detection: the
  [initvar] entry now carries the card version ($eng.lore, filled in by build_card.py from card.json); on a chat's first update
  an older or missing one gives a toast and a _Log line with those steps, and a pre-1.3.1 starting Etnie (Rank 3, never seen,
  M1 W1) is dropped. ENGINE_VER now comes from card.json too (gen_engine.py): one version number to bump.
  (2) The bracelet kept Pewter: Tavern Helper puts its own <style> first in every message iframe (checked: JS-Slash-Runner
  src/panel/render/iframe.ts createSrcContent), so the first <style> was never ours. The bracelet's CSS has an id now.
  (3–5) Map pins: the themes re-coloured them too (Rosewood: "you are here" close to the brass pins; Parchment: the picked
  pin; Frost: both). Pins, labels and card crops sit on the map picture, so their colours are fixed in every theme: brass pins,
  the picked one cream with a dark ring, "you are here" mint with a white ring and a pulse. A colour followed by /*keep*/ is
  never re-coloured (panels and bracelet).
  (6) The student's picture: Student file → Overview has a picture frame with Upload / Change / Remove. The image is scaled to
  640 px (JPEG 0.88) and saved as a SillyTavern user image (POST /api/images/upload with the request headers, the same call as
  SillyTavern's saveBase64AsFile; checked in utils.js and src/endpoints/images.js), folder "Eldrasil"; the chat keeps only the
  path in $ui.portrait (hidden from the narrator), written like every setting. Only testable in ST: the upload itself.
  (7) Calendar clicks scrolled to the top: every re-render replaced the panel. A re-render of the same panel now keeps the
  scroll position; opening another panel still starts at the top.
  (8) "Next" on the bracelet (and in Notebook → Planner's now box): the engine writes $ui.next = the next thing today from the
  event plans (a timed item, or "dusk (about 17:00)"), the class periods (not on no-class, away or break days; Saturday clubs)
  and curfew (none on lockdown, breaks, trips, Star Night). E.g. Entrance Event at 08:00 → "Next 09:00 · Sorting at the Arbiter
  Stone in the Arbiter Hall"; an ordinary Tuesday 07:00 → "Next 08:00 · Dark Magic Defense".
  Tests: tests/test_playtest_v134.cjs (25 checks). npm test 628 checks (16 suites); npm run stress clean. Browser check: map pins
  in Frost, the bracelet re-colouring with a Tavern Helper style in front, the picture frame, the upload up to the request
  (1600x2000 PNG -> 512x640 JPEG, 4 KB), calendar scroll kept.

- 1.3.5 Owner: a card imported without its lorebook attached showed "Syncing the bracelet…" forever (no [initvar], so MVU had no
  state). The bracelet keeps looking for a minute; after 4 s without state it says why (Tavern Helper getCharWorldbookNames /
  getWorldbookNames: no primary lorebook, or one that no longer exists) and offers "Import the card's lorebook", which runs
  SillyTavern's own More… → Import Card Lore (selects #import_character_info in #char-management-dropdown; checked in ST
  script.js: importEmbeddedWorldInfo asks before overwriting and links the lorebook); then a new chat. With the lorebook
  attached but still no state, it points at MagVarUpdate / Tavern Helper. The panels warn when a chat of this character opens
  without the lorebook, and when opened without state. Browser check: the hint, the button firing the ST menu. npm test 631 checks.

- 1.3.6 Owner: the lorebook should attach by itself, like other cards. Cause (checked in SillyTavern world-info.js
  checkEmbeddedWorld): ST offers a card's embedded lorebook only once per character file (accountStorage "AlertWI_<avatar>"),
  and not at all when power_user.world_import_dialog is off; a card imported again, or whose lorebook was deleted, is left
  without it. The card now installs its own lorebook, the way More… → Import Card Lore does (importEmbeddedWorldInfo), through
  SillyTavern.getContext(): convertCharacterBook + saveWorldInfo + updateWorldInfoList, and writeExtensionField 'world' if the
  character is not linked. Missing: installed at once with a toast; a chat without state is loaded again (reloadCurrentChat), so
  MVU initialises it from the new lorebook (MVU initCheck runs on chat load and tracks initialized_lorebooks; checked in
  MagVarUpdate src/function/initvar). Older (its [initvar] carries an older or no version): a popup asks "Update the Eldrasil
  lorebook?" (it replaces the lorebook and any edits to it); "Not now" leaves it. Checked once per chat; other characters are
  never touched. Only verifiable in ST: the real calls. Tests: tests/test_lorebook_v136.cjs (10 checks, a mock of the context
  with the card's real book). npm test 641 checks.

- 1.3.7 Owner playtest in ST.
  EJS error on every send ("redeclaration of const _U … while compiling ejs"): the Prompt Template extension compiles lorebook
  entries that land in the same place as one template, and 502 and 504 both declared _U / _OFF / on at the top level (505 too:
  on). The updates still landed, but the rules around the error did not render. build_card.py now wraps every EJS entry in its
  own block (<%_ { _%> … <%_ } _%>), so an entry's consts never meet another's. Tests render all EJS entries as one template (and
  the same entry twice); the unwrapped 502+504 reproduce the error. Every earlier test rendered entries one at a time.
  Tension did not move after a punch and an insult: Trust / Tension are the narrator's to write (the engine only counts high and
  maximum Tension against reputation), and the rules it reads were partly broken by the error above. Rule 502 now gives sizes: a
  slight +3–5, an insult or broken promise +10–15, violence +20–30, betrayal Trust −15–30, amends −5–10.
  Connections: someone never met (Ottavio, through Percival's public family line) appeared at Rank 0. A public line (family,
  teacher) now shows only between two people you have met; someone you have not met appears only through a bond's views at Rank
  5–6. Your own circle shows the student's picture when one was uploaded.
  Theme on load: the choice is remembered per browser (the last one picked in Settings → Appearance); no change.
  Tests: tests/test_playtest_v137.cjs (7 checks). npm test 648 checks; stress clean.

- 1.3.8 Tension from 0 to 100 (owner design, planning/DRAFT_tension.md, approved 2026-09-25). data/tension.json is the
  single source (engine, Now entry, UI). Bands for everyone: Calm 0, Friction 20, Strained 40 (talk/hangout/gift/help XP
  halved), Hostile 70 (no bond event; −5 reputation as before), Enemy 90 (no bond XP; −10 reputation at 100 as before), and at
  100 the bond loses a rank (bar emptied, toast, journal). How it is played comes from five categories, each with texts per
  band, a hard limit ("never") and how it eases: Withdrawn (Ruby, Zara, Mimosa, Royhan, Alyssa, Vera, Trixie, Tilly, Lenna;
  decay 2/day), Social (Caralynn, Florian, Aiden, Idris, Bobby, Milena; 0.5/day; at Enemy a gossip campaign costs Student −5
  more), Confrontational (Sophia, Percival, Saffi, Vallie; 1 per 3 days; a fight with them eases 25, once a day: new
  Interactions Kind "fight"), Authority (Irene, Caspian, Baelin, Yvette, Gavlan, Layla, Kuroo, Ottavio, Rei; 1/day), Dangerous
  (Krieg, Caine, Tristan, Castor, Dante, Gareth; no decay; each has a peak line). Overrides: Etnie (devoted, never leaves),
  Kanae (her affection never lessens: no XP cut, no event hold, no rank loss, no reputation cost; her displeasure goes to the
  people around {{user}}), Althair (Tension locked at 0; every rise becomes bond XP /2 rounded up, at most +10 a day), Ezrel
  (rises count half). Krieg at 100: Dove attention +10 with hidden magic, Doves reputation −40 Rep XP. Decay only on quiet
  days (no rise in that update), fractions carried in $tf. The Now entry adds one line per present NPC at Tension ≥ 20 (and
  Althair's note): band, behaviour, peak, never, how it eases; nothing when all is calm. Rule 502: Kind "fight" and what the
  engine does at 40/70/90/100. UI: band name next to Tension (People, dossier), a warning of what it does to the bond, the
  held-event hint, Althair's "Hostility only makes him fonder of you". Also: reputation milestones are paid once per rank ($ms;
  older saves count ranks already reached as paid), and the tension reputation check now runs after gifts and Krieg move
  Tension (a disliked gift crossing 70 never counted before). Tests: tests/test_tension_v138.cjs (28 checks); npm test 675.

- 1.3.9 Owner: Tension has no limit like bond XP ("trust takes time; it is always easier to make enemies than friends"). The engine
  never capped rises (only 0–100); rule 502 now says the sizes are not limits, offences in one reply add up, one bad day can make
  an enemy, and mending is slower than harm. Only easing is limited (decay, one fight a day). Test added (npm test 676).

- 1.4.0 Apologies by the NPC's nature (owner, DRAFT_tension.md addendum approved 2026-09-25). The narrator no longer lowers
  Tension for an apology; it reports Interactions Kind "apology" ("Public": true in front of others) and the engine applies the
  category's value (data/tension.json apology {private, public}): Withdrawn −20, Social −5 / public −15, Confrontational −5 (a fight
  is −25), Authority −10, Dangerous 0 (grudge); Etnie −25, Kanae −20, Ezrel 0; Althair has nothing to ease. apology_npc: Sophia
  +10 (she despises cowards; only a fight settles it). One apology a day per NPC; each further one in the same week counts half.
  The Now entry's "Eases" says how an apology lands for each present tense NPC; rule 502 tells the narrator to report, not
  lower. Tests: tests/test_apology_v140.cjs (10 checks). npm test 686 checks.

- 1.4.0 test card (owner): tools/build_test_card.py [rank] builds dist/test/Eldrasil_TEST_Rank7.png from the built card: renamed
  "Eldrasil — TEST Rank 7" with its own lorebook name (so the card's own lorebook install never touches the real one), every
  bonded NPC (38) at Rank 7 in its starting state, a note in the first message. Checked: 38 bonds at 7 after the first update, no
  old-lorebook warning, no reputation paid for the skipped milestones, Connections 39 people / 57 lines, readable in the browser.

- 1.4.1 People → Connections rebuilt (owner, planning/DRAFT_connections.md, approved 2026-09-25). The line types were
  guessed from keywords in the lore sentences (Gavlan → Sophia "romance" from "fall in love with war"; 197 of 278 lines fell to
  "acquainted"). Every line is now curated by hand in data/relations_curated.json (key "From>To"; 'drop' = a passing fact, 77) in
  seven kinds: Friends 49 (mutual, incl. working well together), Soft spot 39 (one-sided fondness, drawn dashed and fainter),
  Protective 33 (incl. mentors), Respect 17, Rivals 17, Wary 52 (suspicion, fear, being used), Dislike 28 (incl. active
  opposition); no acquainted, romance (only ever with {user}) or family lines; story lines (New_relations) stay. Public = the
  12 official teacher / mentor ties (shown once both are met); the rest open at bond Rank 5-6. build_relations.py fails on a line
  the lore gains that is not curated. Groups (off by default; chips "Dorms", "Clubs", "Factions"): label nodes on a ring at the
  edge, dashed lines to the members you have met (and to you for your own dorm and club): dorms by student dorm plus Dorm Heads
  (public tags), clubs from the club data (members and advisors), factions from data/factions.json (Student Council, Dovecote,
  Halvard staff, Cathedral, Noble Houses' Liaison; the Morning Choir shows a member only once their secret on cult / choir / mark
  / identity is revealed). Dragging (owner: "bounced back like rubber"): a dropped person stays where dropped (fx/fy kept,
  remembered in view.gpos while the panel lives), double-click lets go, "Reset layout" clears; others barely move while dragging.
  Browser-checked with the Rank 7 test card (39 people): drag stays, labels on the ring. Tests: tests/test_connections_v141.cjs
  (14 checks); test_people_map / test_playtest_v137 moved to the new kinds. npm test 699 checks.
- 1.4.2 People → Connections, owner requests (2026-09-25):
  - Directed lines. A line is From → To (how From sees To) with an arrowhead in the line colour at To, stopping at the edge
    of To's circle. When both sides hold the same view it is one plain line with no arrow; two different views of one pair
    are two arrows that bow apart. Tapping a line says "A → B … (one way)" or "A and B … (both ways)". Lines are SVG paths now.
  - Althair: everyone at Halvard dislikes him, one way; he dislikes no one (relations_curated.json `disliked_by_all`;
    build_relations.py asserts it). Existing lines to him became dislike (lore notes kept); people with no lore line get the
    curated note, opening at bond Rank 5. Althair>Krieg (was dislike) is dropped. Rival-academy teams are left out, and so
    are Baelin (stays wary) and Ezrel (stays soft spot): owner, `except` in disliked_by_all.
  - Romance (new chip, always listed, "(none yet)" and a tooltip with the rank from Settings while empty): your own line to
    someone turns pink and thicker once Bonds.<id>.Romance is set (Rank 8 by default). Etnie and Kanae love {{user}} one way:
    a pink arrow runs from them to you once it is out (Etnie: her Loves field, known from Rank 3; Kanae: a Secrets_revealed
    topic matching plan/love/goal/feeling/obsess/reading/true), until you start a romance with them (then the shared line
    replaces it). Config: relations_curated.json `romance_one_way`.
  - Group-rule lines (relations_curated.json `group_rules`): a view of a whole group becomes one-way lines to every member,
    opening at the rank of the field that states it. Caine's Hates ("Mages", Rank 3) → dislike to all 43 mages (everyone
    but Bobby); the Doves field (Rank 6) → "Hates…" = dislike, "Admires…" = respect to the Dovecote (Krieg, Milena);
    Neutral = nothing. A hand-curated line between the same two people wins (Vallie, Layla, Caspian keep disliking Krieg;
    Caine keeps his wary Kuroo and Florian). Rule lines are drawn only to people you have met, never teach a name, and the
    dossier lists them as one row ("Mages (43 people)").
  - Your own line to each person takes a kind from the bond (data/bond_rules.json `you_line`, first rule that holds):
    Romance flag → romance (shared); Tension 70+ → dislike, them → you; Title with "rival" → rivals (shared); Tension 40+
    or Trust under 30 → wary, them → you; Title "best friend", or Rank 5+ with Trust 70+ → friends (shared); else the plain
    gold bond line. Thickness still follows rank; tapping the line says why (rank, trust, Tension band, title). A kind whose
    chip is off falls back to the gold line; your lines bring their chips even with no NPC line of that kind.
  - Browser preview caught a bug before shipping: the arrow to you has no rank, which gave the layout NaN (Etnie and Kanae
    vanished); fixed. Tests: tests/test_connections_v142.cjs (33 checks); test_connections_v141 moved to the new data.
    npm test 732 checks. TEST card (dist/test, Rank 7) rebuilt at 1.4.2.
  - To confirm with the owner: the invented notes (Althair "Does not like Vice Headmaster Althair Veyne, which only
    entertains him."; Etnie "Loves you above everything, and is wholly convinced she is your big sister."; Kanae "Loves you,
    and has planned for a long time to keep you for herself."); Etnie's arrow shows from the start (her Loves field is Rank 3, which is where her bond starts); Caine also hates nobles
    (not drawn: there is no noble marker in the data yet); the you_line thresholds (70 / 40 Tension, Trust 30 / 70, Rank 5).
- 1.4.3 Trust as a full system (owner design, planning/DRAFT_trust.md, approved 2026-09-25 in full, plus Ottavio).
  Single source data/trust.json (engine via gen_engine.py, Now via gen_mvu_entries.py, UI via gen_ui.py).
  - Bands, the same effects for everyone: Betrayed 0–14 (shares nothing new, bond XP halved, Tension rises x1.5, apologies do
    nothing), Doubtful 15–34 (shares one tier less, apologies x0.5), Neutral 35–64, Trusting 65–84 (shares one tier more,
    apologies x1.5), Confidant 85–100 (two tiers more and the real tiers one rank early; small Tension rises, up to +15 in a
    reply, count half; apologies x1.5).
  - Perk gates (perk_gates): Rank 6 perks need Trust 35, Rank 7 50, Rank 9–10 65; the bond event to that rank waits
    (bev why 'trust', need), like Tension 70+. The Rank 8 event never waits, but under 50 its directions say it can only end in a
    sworn rivalry, and the Romance flag is refused under 50. A Rank 10 benefit is suspended under 35 ($ui.tsusp; Perk_use
    refuses it; the Perks panel says so). Rank never falls through Trust.
  - Rises only from reported deeds: new interaction kinds keep +4, secret +6, defend +5 (x1.5 with "Public"), confide +3, and
    help +2; x the category's rise; each kind once a day; at most +8 a week per NPC. A rank earned adds +3 (outside the cap).
    The narrator can no longer raise Trust (the engine undoes it and says why); drops are written directly with the sizes in
    rule 502 (−3–5, −10–15, −20, −25–40), x the category's drop, never capped. A drop of 20+ in one reply costs every Friends
    line of that NPC −5 Trust. Below 35, a week without a new drop recovers the category's amount.
  - Categories = openness (data/bond_openness.json; others normal): Open start 60, rise x1.5, drop x1, recover +3/week;
    Normal 50, x1, x1, +2; Guarded 40, x0.75, x1.25, +1; Closed 30, x0.5, x1.5, none. Start applies to new bonds only.
  - Overrides: Etnie (never below 50; the rest of a drop becomes Tension; no gates), Kanae (kind "choose" +3 x2; never below 15;
    both only while none of her secrets is out), Althair (Trust fixed at 50, a betrayal becomes bond XP /2 within his daily
    cap; no gates), Ezrel (x0.5 both ways), Caine (at most 64 until one of his secrets is out), Krieg (Trust 0 when the hidden
    magic reaches Exposed).
  - Owner addition: Ottavio and his Sky students (dorm_head): bond XP x1.5, Tension rises x0.5, eases x2, apologies x2, and
    Trust as an Open NPC (start 60).
  - Narrator: rule 502 (new Trust paragraph, interaction kinds); <now> Bond lines carry "Trust n band", the tiers it shifts,
    "Held back by low Trust: …" and suspended benefits; new "Trust:" lines for present characters in a telling band (Betrayed,
    Doubtful, Confidant) or with a personal rule; the bond-event close no longer invites raising Trust.
  - UI: band next to Trust (dossier, bonds list tooltip, Connections line info); dossier warnings (Betrayed; perks held back
    with rank and Trust needed); held-event hint; Althair "Trust fixed". you_line thresholds follow the bands (wary under 35,
    friends from 65).
  - Schema: Bonds.$tdrop (day of the last drop), $ui.tsusp. Tests: tests/test_trust_v143.cjs (38 checks); five older checks
    moved to the new rules (apology x Trust, Now bond line format, alias merge uses a drop, Etnie's written Trust gives way to
    her start, the Castor 8 -> 9 test sets Trust 70). npm test 773 checks; npm run stress passes; browser-checked dossier.
  - To confirm with the owner: Kanae's "choose" kind is told to the narrator only in <now> while she is present; Krieg's
    trigger is the Exposed stage (80+); Caine's cap lifts on any of his secrets; hooks-based promise tracking (draft point 12)
    was not built.
- 1.4.4 Grey areas (owner, planning/DRAFT_greyarea.md, approved 2026-09-25 in full). The owner's use cases (a genki
  airhead who fails every plan and lets secrets slip, playful banter with shoves, a tsundere) were played through the engine
  for four in-game weeks: read literally, rule 502 turned a harmless airhead into a betrayer for everyone (Betrayed, Tension up to
  84), banter sent every bond to Rank 0, and a tsundere who helps and defends still lost Sophia and Irene to Rank 0.
  - E1 (bug): maximum Tension broke a rank every time it touched 100 again (decay to 99, then +4 the next day: Rank 2 -> 0 in a
    week). Now one rank per blow-up: Bonds.$tbrk, re-armed once Tension falls below effects.rank_drop_rearm (70).
  - E2: kindness eases Tension by nature (tension.json kind_ease, once a day, only when Tension > 0): help / keep / defend
    withdrawn −5, authority −3, social −5 only for a public defence, confrontational and dangerous 0; Etnie and Kanae −5, Althair
    and Ezrel 0.
  - E3: interaction "understood" (they finally understand {{user}} meant well) gives back the category's share of the last
    Trust drop within 30 days (open 50%, normal 33%, guarded 25%, closed 0), once per drop (Bonds.$tlast); spread Trust does not
    come back.
  - Rule 502: new "Judging a deed" paragraph (intent over harm; careless failure −3, a slipped secret −8–10 and so no spread;
    teasing both enjoy and harsh words from a trusted friend are no offence; only what they saw or learn counts; forced or
    charmed = no Trust drop; a protective lie −0–3; quarrels between friends −3–5 at most; a consensual spar is a fight;
    clashing promises −3–5 with warning; flirting in front of a partner +5–10 Tension); "understood" in the Interactions kinds.
  - <now>: one "Teasing (how each present character takes it)" line from the tension categories / overrides (banter).
  - Re-run with the new rules: the airhead ends at Rank 3 with everyone, Tension 0, trusted by the open (Ruby Trusting) and not
    with secrets by the guarded (Doubtful); banter no longer hurts Ruby or Sophia, while Irene and Mimosa, who dislike daily
    shoving, still strain; the tsundere loses Sophia one rank at most, Irene stays under 100, Ruby eases to 10.
  - Tests: tests/test_greyarea_v144.cjs (14 checks). npm test 787 checks; stress passes; always-on prompt ~11.1k tokens at the
    start (token_audit). TEST card rebuilt.
- 1.4.5 Recent history per bond (owner): the dossier has a "Recent with you" table (When, What happened, Effect), the latest 10
  moments with {{user}}, newest on top; the narrator reads the same rows for each present character in <now> ("Recent with
  {{user}}: <name> (newest first): [when] sentence (effect) | …", the newest 5, data/bond_rules.json recent.now) to keep
  characters consistent.
  - Engine: Bonds.<id>.$Recent (engine-owned, a $ field, so not in <current_state>; kept 10, recent.keep). A row is written when
    the narrator reported an interaction with that character, or wrote a Trust / Tension / Rank change, or XP was gained; its
    effect is what this reply really did (Rank r → r+1 or fell, XP +n, Trust ±n, Tension ±n, romance). Quiet-day easing and
    weekly recovery alone write no row. The first meeting is a row ("First met, at <place>."; Etnie: "Bond starts at Rank 3"),
    and so are the spread of a betrayal ("Heard what {{user}} did to X.") and Krieg learning the hidden magic.
  - Sentence: the interaction's new "Note" (schema, up to 200 characters; rule 502 asks for one short past-tense sentence on
    every interaction, and a {"Kind": "other", "Note"} entry when a deed changes Trust or Tension and no other kind fits); without
    a Note, the kinds in words (recent.phrases: "Talked, kept a promise."); a change with neither: "(no note)".
  - UI: table.rt (effects green when good, red when bad), fits a phone width without scrolling (checked at 340px).
  - Tests: tests/test_recent_v145.cjs (14 checks). npm test 801 checks; stress passes; always-on prompt ~11.2k tokens at start
    (the rows cost only in <now>, about 25 tokens each, 5 per present character).
  - To confirm with the owner: <now> gives the narrator the newest 5 rows (not 10) per present character, to save tokens when a
    class is present; the dossier keeps 10. Change recent.now in data/bond_rules.json to 10 if wanted.

- 1.4.6 Card vs preset split (owner, 2026-09-26; planning/DRAFT_card_vs_preset.md, approved with the whole
  character-consistency plan in planning/DRAFT_batch_plan.md v2). Taste belongs to preset toggles, the card keeps world,
  data and canon only (HANDOFF §1 already said so; the card description broke it).
  - Card: the description no longer sets language, point of view, tense, length or "never {{user}}'s words"; it keeps the world,
    the genre and the <UpdateVariable> duty (783 -> 497 characters, ~60 tokens less). Creator notes: version and one preset line.
  - Preset (edit_preset.py): BOLT step 2 was still teaching the 1.0 bond rules (bond Progress +0/+1/+2) on every reply, against
    rule 502 since 1.2.2. It now points to the card's own update rules instead of copying them. "Total Output Length" is ON at
    roughly 3 to 6 paragraphs (the default the card used to carry). The "Now:" first reasoning line is unchanged (VectFox reads it).
  - Tests: tests/test_split_v146.cjs (8 checks): no taste in the card description or rule entries (data-format wording such as
    the past-tense Interactions Note is allowed), BOLT has no stale bond rules and keeps "Now:", length and POV are preset toggles.
  - Docs: ECOSYSTEM (who owns what, preset changes), HANDOFF snapshot and division table.
- Batch 0 (plan v2): tools/audit_chat.py, an offline drift audit for exported chats; nothing goes into the card.
  - Checks: pronouns (only self-referring forms such as "X shook his head", "X ... herself", ", he said"), misspelt names (one letter
    from a first name or surname, not a word the chat also writes in lower case), speakers not in Scene.Present, three or more
    words found only in one NPC's <narrator_only> lore (skipped once that NPC has a Secrets_revealed entry), two or more words from
    a dossier field the bond rank has not opened, and "never" voice patterns (data/voice_rules.json, empty until the canon waves).
    State is read from the message variables (MVU) or, failing that, from the <UpdateVariable> patches in the text.
  - Report: counts per check, a per-NPC table per 25-message window with the first finding, and every finding with a snippet.
  - Baseline: the owner's two exported playtest chats (Downloads, 2026-09-16; the old non-MVU lorebook card, 285 and 215
    messages) give 0 findings after tuning. A first version flagged 66, almost all "he" in Etnie's thoughts meaning {{user}}.
    Those chats have no MVU state, so the present and locked checks could not run on them; the first MVU playtest
    chat of 1.5.0 is the real baseline.
  - Tests: tests/test_audit_tool.cjs (13 checks, a synthetic chat with one planted error per check; skipped without Python 3).
    npm test 822 checks; stress passes.

- 1.5.0 Batch A (card rules) + Batch E1 (preset writing rules), planning/DRAFT_batch_plan.md v2. No new canon.
  - Card 504: "Canon over memory" (P8, card part: the lorebook and character sheets outrank the chat's earlier prose; Rank, Trust
    and Tension change how a character treats {{user}}, never who they are; closeness is not warmth) and "Where the world's own
    events come from" (World sources: calendar, happenings, regulars, Commitments, Hooks, Mysteries, bond events; features that
    are off drop out). The list grows with Next, Events and the campus phase in 1.6.0/1.6.1, when those exist.
  - N3a: the engine lists bonds whose XP reached 80% of the next rank's need (data/bond_rules.json close_at) in $ui.close; <now>
    marks them ", close" on the Bond line and rule 504 lets one small behaviour of the next rank slip out.
  - N10 butterfly clause ("adapt it to the story as it is now; never replay it as if nothing happened") on Royhan's Dorm
    Competition weekend (101, via merge_lorebooks.py), the birthday (508) and every bond event in <now>.
  - Preset (edit_preset.py section 8, generic, no card data): new "🎮 Player Input Authority (simulation) 📨" (N1 + D5, ON,
    depth 0 before BOLT; <input_authority> + <latest_input>{{lastUserMessage}}), new "🌐 Output language" (OFF). Edits: N7 no
    spotlight / no echoes; P12 + D8 simulate, do not dramatise, HOLD endings; U5 + D2 stress in their own way and
    <character_calibration> (with "personality is a ceiling"); U4 + D3 a character's card outranks <npc_voice>, direct speech vs
    subtext; U11 + D7 known people are not strangers, no foreshadowing; U9 canon looks in <NPC_intro>; U12 one question mark per
    character; banned constructs: fake specificity, organ autonomy. Preset build run twice: byte-identical.
  - Saves: tests/fixtures/make_save.cjs writes a ~6-week save with the current build; save_1.4.6.json was made on the 1.4.6 code.
    tests/test_saves.cjs loads every fixture: no key lost, story values unchanged after a no-op update, $eng.ver updated, play
    continues. Each release adds the previous release's save.
  - Tests: test_rules_v150.cjs (14), test_preset.cjs (17), test_saves.cjs (6). npm test 859 checks; stress passes. token_audit:
    card always-on ~11.4k at start (+~200), preset enabled prompts ~17.2k (+~1.4k; the audit now reports the preset). TEST card
    rebuilt.
  - To verify in ST: {{lastUserMessage}} is filled on the Gemini endpoint; the new depth-0 prompt does not push <UpdateVariable>
    from the end of the reply.
  - To confirm with the owner: the World sources line lists only sources that exist in 1.5.0 (the draft's Next, campus phase and
    stale events come with the releases that add them). The preset grew more than the draft's +650 estimate (~+1.4k), mostly
    the calibration block, the voice rules and the repeated player message.

- 1.5.1 Batch B: the Cast Sheet (P1, P2 automatic part, P5, P6, P7, D1). No new canon. Changes the established "Lore activation →
  keyword WI" for NPCs in Scene.Present (approved in the plan; HANDOFF §1 and §4 updated).
  - Custom 509 "Cast Sheet" (@D1, order 498, just above <now>): for every NPC in Scene.Present, INVARIANTS (pronouns from gender,
    first and full name and nickname, year / dorm / public role, bond Rank with Trust and Tension bands, the Never lines of their
    Trust and Tension categories, up to 4 key ties from relations.json), a Status line from Campus_State.NPC_status, then their
    whole canon lore (including <narrator_only>) and a Secrets line: never stated, hints only, and which topics {{user}} has
    uncovered (Secrets_revealed). After the sheets, every curated line between two people present, both ways.
  - Full lore for at most 4 (engine CAST_FULL): who spoke in the last reply first, then the highest bond rank; the others get a
    brief sheet (invariants only) and keep their keyword entry. Every NPC keyword entry is wrapped (merge_lorebooks.py) so it
    prints nothing while that NPC has a full sheet: the lore is never sent twice.
  - Engine $ui.cast {full, brief, spoke, gone, ment, where}: speakers from the reply's prose (a name that opens the sentence
    leading into a quote, or that directly follows a closing quote; names inside quotes are addressees), mentions (MENTION_DENY:
    "Pip" and "Ruby" at a sentence start are ordinary words). An update without prose (player tools) keeps the last reading.
  - <now> (505): "X spoke in the last reply but is not in Scene.Present: add them if they are still here; otherwise they are gone
    and stay silent", and "Mentioned, not here (they may not speak or act on-screen): X (pronouns; usually: haunt)".
  - Custom 510 "Last-mile cast gate" (@D0, order 899, before 503 so <UpdateVariable> stays last), only when someone is present.
  - Size: ~1.2k tokens with one NPC present, ~5.4k with four, ~6.3k with eight (4 full + 4 brief); nothing when alone. The card
    JSON grows by ~260 KB (509 holds every NPC's lore as EJS sections).
  - Tests: test_castsheet_v151.cjs (21 checks: 1, 4+4 and 8 present, speaker-first order, brief sheets keep their keyword
    entry, secrets none / one uncovered, P6 speaker and mention, deny list, invented names get no sheet, all EJS entries render
    together, positions); test_saves loads the 1.4.6 and 1.5.0 saves. npm test 890 checks; stress passes. TEST card rebuilt.
  - Not automatic yet: how each NPC addresses {{user}} (term_used) and DON'T FLATTEN / CARRIES; they come with the G1 canon.
    Incoming cohorts are never in the cast before they arrive (engine check), untestable with the empty cohorts.json.
  - To verify in ST: the Prompt Template extension renders the large 509 entry (~260 KB of EJS) without a noticeable delay,
    also in MVU's extra-model mode; getvar('stat_data.$ui.cast') inside the NPC keyword entries.

- 1.6.0 Batch C: what each character carries of {{user}} (P4, N4 Next + Meanwhile, D6, N13, VectFox V1-V3). No new canon.
  - Bonds gain narrator fields (in <current_state>, never in the player's dossier): Mind (how they feel about {{user}} now),
    Knows (what they know about {{user}} and how; the engine dates each line and keeps 15, older ones in $Knows_old), Imprints
    (a belief formed by a weight 5-10 experience; at most 5; over the cap the lightest goes only if the new one outweighs it, and
    keeps what it replaced as Was; a "fixed" character is never rewritten), Next ({What, Where, Until}, Rank 3+).
  - Engine: $Defining (a rank change, Trust ±15+, Tension +20+ or romance is kept for good, at most 5, smallest leaves first;
    shown in the Cast Sheet and the dossier). Next: "Since you last saw X" once in <now> when they meet {{user}} again; a plan
    that lapses unseen becomes an "(Off-screen)" row in $Recent; "May be here by their own plans" when {{user}} is where the plan
    put them. Meanwhile: a Rank 7+ bond unseen for 7 days gets one Journal line a week about their own life (their Next, else
    their haunt).
  - N2 slot: data/npc_canon.json "change" (fixed | shaped | fluid), empty until the canon waves; the Cast Sheet prints the type's
    sentence. (The plan named field_overrides.json; that file holds rank numbers only, so the slot got its own file.)
  - N13 ages: <now> recent rows and the Cast Sheet's Knows, Imprints and defining moments carry their age in words ("yesterday",
    "3 days ago", "last week", "2 months ago"); <now> adds the age of the newest Journal dates; rule 504 says to use those ages.
  - Cast Sheet: full sheets add Mind, Knows, Imprints, defining moments and Change; brief sheets add Mind and Imprints.
  - Rules: 502 explains Mind, Knows, Imprints, Next. 504: "Only an Imprint changes who a character is"; arrivals take the walk
    time (D6); Next plans in the world sources; V1 (a recalled memory says what happened, not who knows it; the sheet beats it).
  - VectFox (checked at 3623dc8, core/eventbase-workflow.js): EventBase and the summary share one injection setting; keep After
    Main Prompt (default) or in-chat depth 2+, never 0-1 (V3). Summarizer Injection now recommended OFF (V2). docs/VECTFOX.md,
    docs/ECOSYSTEM.md.
  - Tests: test_memory_v160.cjs (29 checks, incl. a "fixed" character through a patched engine and the age bands at day, week,
    month and year edges); test_recent_v145 accepts the age in the row; saves 1.4.6, 1.5.0, 1.5.1 load. npm test 924 checks;
    stress passes. TEST card rebuilt.
  - To confirm with the owner: Meanwhile lines use the character's haunt when they have no Next ("was seen around Main Library"),
    which is generic; ages are within one campus year (an item from exactly a year ago reads as "earlier today").

- 1.6.1 Batch D: invented characters stay the same person (N5 Extras), the campus moves on (N4 Events), campus phases (N6
  framework). No new canon.
  - Extras (top-level record, in <current_state>): {"<Full Name>": {Who, Looks, Manner, Calls_user, Voice, Keep}}. The engine
    counts each time an invented character enters Scene.Present ($eng.xs); from the second appearance the Cast Sheet asks for
    their record until it exists, then shows it as their card whenever they are present. A first name or a different case is
    the same person (merged into the recorded key, in Scene.Present too); a roster name is refused. At most 20 records: the
    least recently seen leave first into a hidden archive ($ui.xold, 40), which gives the record back if they turn up again;
    a kept or present one never leaves. The gate (510) fires with only invented characters present.
  - Keep: in the bracelet's cast strip, tapping an invented character pins them (a thumbtack before the name) or lets them go,
    through a hidden player-tool message like Settings. Pinning someone with no record creates it; <cast> then asks the narrator
    to describe them (the "extract this character" path).
  - Naming guide in 502, from the roster's own patterns (Human: English or continental family names; Elf: flowing given names,
    soft or nature-made family names; Beastkin: playful or striking family names); no roster name reused.
  - Campus_State.Events are now {Text, Updated}. A bare string (the AI's shorthand, and every event in an older save) becomes
    the Text; the engine dates each change and, when an event has had no news for over 7 days, <now> asks for it to move on
    (talk, rumour, notice, letter) or be removed. The notebook's Campus news shows the date.
  - N6: data/campus_phases.json ({id, from, to, line}, every year) and a "Campus phase:" line in <now>. Empty: the phase lines
    are canon and come with the canon waves after the owner approves them.
  - World sources (504) now include the campus phase and the campus events <now> asks to advance.
  - Size: 502 +~280 tokens (the plan estimated ~70; most of it is the example record and the naming guide), 505 +~40 only while
    something is stale or a phase runs, ~40 tokens per invented character present.
  - Tests: test_extras_v161.cjs (37 checks: first and second appearance, merge by first name and by case, roster names refused,
    cap and archive, Keep and pin-without-record, 502 rules, Events stamping, stale and re-dated, the notebook, a 1.6.0 save's
    string event, phases through a patched engine); save 1.6.0 added (saves 1.4.6 to 1.6.0 load). npm test 966 checks; stress
    passes. Preset unchanged (built twice, byte-identical). TEST card rebuilt.
  - To confirm with the owner: the naming guide is my reading of the roster (the lore has no naming rules); the stale-event
    window (7 days) and the Extras cap (20) are the plan's numbers.
  - To verify in ST: the cast-strip pin writes the hidden tool message (like Settings) and the thumbtack shows after it.

- 1.6.2 Batch E2 (preset): the reasoning reads what the card now provides, without naming it. Card unchanged apart from the
  version. No new canon.
  - BOLT step 0 (U2, V4): the "Now: M? W? Day HH:MM at <place>" first line is unchanged (VectFox reads it); the list of card
    fields after it is now generic ("the card's current state: the time of day and today's events, curfew, who is present…"),
    plus "If the card provides character sheets for the people present, I read them now."
  - Step 7 (U3 + D4): a cast check per character who acts, from their sheet or card (what they know and from where, what pulls
    them, what their personality allows, shown versus meant, what they carry); the loudest reaction, then how this person
    usually handles it; the name-swap test; then the old slop review.
  - Step 11 (U10 + D6): world-side material only from the sources the card allows (504 lists them); nobody arrives without the
    time to get there.
  - HQ NPC Genesis (U6): the card's naming guide first (else the old five-names rule); race and origin from the setting; the
    card's record for invented characters is their card. Banned names stay. Scene Engine (U7): the same for the "generated
    character" sentence.
  - Bridge (U8 + D6): the <cast> block is the truth about the people present and outranks their lorebook text and the chat;
    invented characters keep their Extras card; off-screen people follow their Next plans and the campus phase; arrivals take
    the walk time.
  - Size: enabled preset prompts ~17.2k → ~17.5k tokens.
  - Tests: test_preset.cjs +13 (step texts, "Now:" line first and unchanged, no card field anywhere in BOLT outside that line,
    every tag the CoT refers to exists in the preset or the card, Genesis, Scene Engine, Bridge); save 1.6.1 added (saves 1.4.6
    to 1.6.1 load). npm test 984 checks; stress passes; preset built twice, byte-identical. TEST card rebuilt.
  - Decision touched (to confirm with the owner): the plan kept step 0's "Game state (Eldrasil)" line, and its final test asks
    for no card field names in BOLT outside the "Now:" line. I kept the "Now:" line exactly and made the rest of step 0
    generic, like steps 2, 7 and 11, so the CoT copies no card field list that could go stale.
  - To verify in ST (U13): replies are not cut off before </UpdateVariable> (openai_max_tokens is 15000); the reasoning still
    opens with the "Now:" line.

- 1.6.3 Batch G, wave G1 (canon, approved by the owner on 2026-09-25 as drafted: "approve draft 1"): the voice, stages and
  anchor of the 8 key NPCs (Etnie, Irene, Aiden, Castor, Zara, Kanae, Rei, Caine) in their Cast Sheet.
  - Data: `data/npc_canon.json` gains `voice[id]` (scenes, alone, never_sounds, term_used, dont_flatten, carries, stages for the
    bands 0-2 / 3-5 / 6-8 / 9-10, anchor), copied from the draft's English blocks; `change` is filled for the 8 (fixed: Etnie,
    Irene, Rei; shaped: Aiden, Castor, Zara, Kanae, Caine). Kept out of the lore text on purpose: the player dossier reads the
    lore fields, and source_original stays the owner's.
  - Cast Sheet (509): every sheet adds "How they address people" and "Carries" to the invariants line and the Stage line for the
    current rank (only that band). A full sheet also prints the scene examples ("examples of the voice in situations, not lines
    to repeat"), the alone lines inside <narrator_only>, Never sounds like, Don't flatten and the Anchor.
  - Engine: a fixed NPC (Etnie, Irene, Rei) now refuses Imprint replacement (the 1.6.0 rule, now with data).
  - Size: one G1 NPC present with a full sheet is 1.5k-2.2k tokens (Irene 1586, Aiden 1541, Zara 1618, Rei 1708, Etnie 1811,
    Castor 1894, Kanae 2071, Caine 2181), about +400-900 over 1.6.2. The plan estimated +250-400 per NPC. The four largest together
    are about 8k. If the playtest shows the context is tight, the scene examples are the first thing to trim (brief
    sheets already skip them).
  - Tests: test_voices_g1_v163.cjs (17 checks: data complete for the 8, every band present, the right band per rank, full vs
    brief sheet, alone lines inside <narrator_only>, fixed NPC refuses replacement); test_memory_v160's replacement checks moved
    from Irene (now fixed) to Caspian; save 1.6.2 added (saves 1.4.6 to 1.6.2 load). npm test 1005 checks; stress passes;
    token_audit passes; preset built twice, byte-identical (unchanged). TEST card rebuilt.
  - To verify in ST: the 8 NPCs sound like their scene examples without repeating them word for word; the Stage line changes
    after a rank-up.

- 1.6.4 Batch G, wave G2 (canon, approved by the owner on 2026-09-26: "approve f2 dan perubahan entry", typed straight into the
  working session): the voice of the Year 1 NPCs not in G1 (Caralynn, Percival, Trixie, Vera, Alyssa), from
  planning/DRAFT_voices_G2.md.
  - Owner decisions on the way: every wave gets Stages ("tetap beri stages", then "ya" for G3 to G5), and Alyssa's story is
    somber, depressing and bittersweet, with Isshuukan Friends as the reference.
  - Data: `data/npc_canon.json` `voice` and `change` for the five (Caralynn shaped, Percival fixed, Trixie fluid, Vera fixed,
    Alyssa fixed). Alyssa is the first unmasked NPC with alone scenes (narrator-only).
  - Alyssa's whole entry was checked against the new tone. Her Rank 10 benefit (`data/bond_rewards.json`, canon since 1.3.0) no
    longer cures the forgetting: "she still meets them as a stranger, but only for the length of one page, and she is glad
    before she reaches the end of it" (same mechanics). Her Don't flatten says shared moments are hers only as her page records
    them. She admits the weekly pattern at Rank 6-8 only once the story has shown it to {{user}} (secrets never open by rank).
    Her lore needed no change.
  - Size: one G2 NPC present with a full sheet is 1.6k-2.3k tokens (Trixie 1591, Caralynn 1667, Vera 1709, Percival 2272,
    Alyssa 2317).
  - Tests: test_voices_g2_v164.cjs (18 checks); test_voices_g1_v163 now checks the G1 part of the data only; save 1.6.3 added
    (saves 1.4.6 to 1.6.3 load). npm test 1028 checks; stress passes; token_audit passes; preset built twice, byte-identical
    (unchanged). TEST card rebuilt.
  - To verify in ST: Alyssa reads somber and quiet, not melodramatic, and does not "remember" shared moments after the rest day.

- 1.6.5 Batch G, wave G3 (canon, approved by the owner on 2026-09-26: "approve g3, sekalian draft next", typed straight into the
  working session): the voice of the Year 2 NPCs not in G1 (Lenna, Saffi, Idris, Dante, Florian, Tilly), from
  planning/DRAFT_voices_G3.md, with Stages.
  - Data: `data/npc_canon.json` `voice` and `change` (Lenna shaped, Saffi fixed, Idris shaped, Dante fixed, Florian fluid, Tilly
    fixed). Dante (works for the Doves) and Tilly (Velmora's princess) hide an identity, so they get narrator-only alone scenes,
    like Alyssa.
  - Owner decision: Dante stays fanatically lawful with no exceptions, {{user}} included. His Rank 5 gift and Rank 10 benefit
    (`data/bond_rewards.json`, canon since 1.3.0) changed with approval: the Lodge key is a logged, rule-sanctioned refuge after
    curfew (not a hideout no patrol checks); at Rank 10 he still reports any rule {{user}} breaks, to their face first, stands
    beside them while they answer for it, and demands that anyone coming for {{user}} outside the rules (Doves included) does it by
    the book. The secret side is now a formal report naming {{user}} under his protection. Text only; no engine effect changed.
  - Saffi's Rank 9-10 stage says "the only one besides Lenna" instead of "the second person, after Lenna" (same meaning; the old
    phrase tripped the card-vs-preset taste check in test_split_v146).
  - Size: one G3 NPC present with a full sheet is 1.2k-2.3k tokens (Saffi 1204, Lenna 1323, Idris 1557, Florian 1703, Dante 2136,
    Tilly 2296).
  - Tests: test_voices_g3_v165.cjs (18 checks); test_voices_g2_v164 checks the G2 part of the data only; save 1.6.4 added (saves
    1.4.6 to 1.6.4 load). npm test 1050 checks; stress passes; token_audit passes; preset built twice, byte-identical (unchanged).
    TEST card rebuilt.
  - To confirm with the owner: invented details marked [?] in the draft were approved with it (for example Sister Ann of the
    orphanage, and Krieg signing Dante's report).

- 1.6.6 Batch G, wave G4 (canon, approved by the owner on 2026-09-26: "approve, draft g5", typed straight into the working
  session): the voice of the Year 3 NPCs not in G1 (Caspian, Royhan, Sophia, Gareth, Ruby), from planning/DRAFT_voices_G4.md,
  with Stages.
  - Data: `data/npc_canon.json` `voice` and `change` (Caspian fixed, Royhan shaped, Sophia fixed, Gareth fixed, Ruby fixed).
    Gareth hides his ambition and his brother's sabotage, so his alone scenes are narrator-only; no stage line names what only
    his <narrator_only> lore knows. Sophia's Don't flatten keeps her water magic off living bodies (the Blood line). No reward
    text changed.
  - Size: one G4 NPC present with a full sheet is 1.7k-1.9k tokens (Caspian 1670, Royhan 1744, Gareth 1761, Ruby 1775, Sophia
    1923).
  - Tests: test_voices_g4_v166.cjs (15 checks). Caspian is now fixed, so test_memory_v160 shows Imprint replacement on Royhan
    (shaped) and test_voices_g1_v163 uses Lucius (a rival with no bond) as the NPC without voice lines; test_voices_g3_v165 checks
    the G3 part of the data only. Save 1.6.5 added (saves 1.4.6 to 1.6.5 load). npm test 1070 checks; stress passes; token_audit
    passes; preset built twice, byte-identical (unchanged). TEST card rebuilt.

- 1.6.7 Batch G, wave G5, the last wave (canon, approved by the owner on 2026-09-26: "approve", typed straight into the working
  session, covering every [?] in the draft and the two Rank 10 text changes): the voice of the staff and the others (Gavlan,
  Yvette, Baelin, Layla, Vallie, Kuroo, Mimosa, Althair, Ezrel, Ottavio, Krieg, Milena, Tristan, Bobby), from
  planning/DRAFT_voices_G5.md, with Stages. Every bonded NPC now has a voice.
  - Data: `data/npc_canon.json` `voice` and `change` (Mimosa, Milena and Bobby shaped; the other eleven fixed). Baelin (Tilly,
    and why he never asks Aura to fight), Layla (the gloves) and Ezrel (what he is) have narrator-only alone scenes; no public line
    names those secrets. Althair's and Ezrel's stages follow their Tension and Trust overrides, and Krieg's bond model is unchanged.
  - Rewards (`data/bond_rewards.json` and both design copies): Yvette's Rank 10 no longer sends {{user}} to her rooms inside the
    Fire Dormitory, which admits only its own: whatever their dorm, she comes down to answer its door. Layla's Rank 10 said "the
    way they once cornered Yvette", which is her <narrator_only> lore; the public text now ends "If anyone ever corners {{user}},
    the gloves come off.", and the Yvette line moved to the secret side. Effects unchanged.
  - Size: one G5 NPC present with a full sheet is 1.5k-2.7k tokens (Krieg 1471 the smallest, Ezrel 2663 the largest).
  - Tests: test_voices_g5_v167.cjs (22 checks); test_voices_g4_v166 no longer expects exactly 24 voices. Save 1.6.6 added (saves
    1.4.6 to 1.6.6 load). npm test 1097 checks; stress passes; token_audit passes; preset built twice, byte-identical
    (unchanged). TEST card rebuilt.
  - To confirm with the owner: nothing new beyond the draft's [?] list, approved with it. The G4 draft called Krieg's title
    "Commander" invented; it is in Milena's lore ("Yes, Commander."), and Caspian's line needed no change.

- 1.6.8 Rank 8 branches per NPC (canon and rules approved by the owner on 2026-09-26 in the Brainstorming thread: categories,
  then "approve, buat draft implementasi semua npc" for the lines, then "ya" to hand it over; planning/DRAFT_rank8_branches.md).
  - Rules: each NPC allows some of best friend, romance and sworn rival: A all (20), B best friend or rival (Krieg, Tristan),
    C best friend or romance (9), D best friend only (7). A rivalry opens only under the Rank 8 Trust gate (50); a C or D bond
    waits for it (touches the HANDOFF §4 Trust decision "the Rank 8 event never waits", now true only for A and B; approved).
    Romance is refused for B and D whatever the Settings say (touches §4 Bonds: romance no longer open to every NPC; approved).
    Althair and Etnie have no Trust gates, so they are never held.
  - Data: `data/npc_canon.json` `branch`, and `voice.<id>.romance` / `.rival` (the approved lines); Florian's Don't flatten
    gains the approved exception ("a romance with {{user}} is the one exception, and he will not call it one"). bond_rules
    themes 7 and perks 8 say "as far as this character allows"; trust.json notes the hold.
  - Engine: BRANCH from npc_canon.json (an NPC with no entry allows all three); the 7->8 direction in <now> says which branches
    are open (rivalry only; best friendship or romance; best friendship only, noting romance closed in Settings); the branch
    taken is recorded once at Rank 8 in `Bonds.<id>.$branch` (friend / romance / rival; a romance flag accepted later makes it
    romance; cleared if the rank falls below 8). Saves from before 1.6.8: a bond already at Rank 8+ gets its branch from Romance
    or a "rival" Title, and nothing else changes (a romance with an NPC that is now D stays).
  - Cast Sheet: "Romance with {{user}}: …" or "Sworn rival of {{user}}: …" after the Stage line (full and brief sheets).
  - UI: the dossier says at Rank 6-7 what Rank 8 can open, and whether the event waits for Trust 50.
  - Tests: test_rank8_v168.cjs (26 checks: data, holds, directions, romance refused for B/D, $branch, Cast Sheet lines, dossier,
    older saves); test_trust_v143 now shows the never-held rivalry on Irene (A) and Ruby (C) waiting. Saves 1.6.7 and
    1.6.7_rank8 (Kanae romance and Irene sworn rival at Rank 8) added. npm test 1134 checks; stress passes; token_audit passes;
    preset built twice, byte-identical (unchanged). TEST card rebuilt.
  - To confirm with the owner: nothing beyond the approved drafts. The TEST card still sets every bond to Rank 7, so each 7->8
    event shows its branch direction.

- 1.7.0 Cohort 2: six new first-years who arrive in campaign Year 2 (owner, 2026-09-26: "implementasi draft cohort year 2 ke
  character card", draft `planning/DRAFT_cohort2_npcs.md`, approved in the Brainstorming thread; the owner's instruction to apply it
  is taken as approval of A6, the relation network, which the draft still marked as waiting). HANDOFF §4 "Cohorts" is used as
  designed; no established decision changed.
  - NPCs: Linus Tallyworth (Viridian, open, social, shaped, branch C, Rank 10 = Mana training partner), Maple Fernhollow (Sky,
    red panda Beastkin, Greater Spirit Sobek, normal, withdrawn, shaped, C), Nerys Silvarenne (Fire, Elf, normal, social, fixed, A,
    a new hobby every week), Hadrian Quelloris (Light, Elf, open, social, fixed, A, secret: afraid of dying), Wren Marlowe (Fire,
    deaf, normal, withdrawn, shaped, C), Tsubaki Hoshikage (Light, wolf Beastkin, Royal Mage, open, confrontational, shaped, A,
    Rank 10 = Stamina training partner). Voice canon (scenes, never sounds, terms, don't flatten, carries, Stages, anchor, Rank 8
    lines) in `data/npc_canon.json`; Rank 5 gifts and Rank 10 benefits in `data/bond_rewards.json` (and both bond_rewards.md copies).
  - Pipeline: a new lore pass `source_original/npc_lore_cohort2_2026-09-26/` (lore_cohort2.md: the six entries, uid 410-415 with
    keys; lore_cohort2_additions.md: the lines they add to 24 older NPCs' files). `merge_lorebooks.py` adds the entries, appends the
    lines behind an EJS campaign-year gate (card) or a `[from Year 2]` marker (v39 export), and adds the six to the roster's Year 1
    line and to 18 Regulars entries (gated the same way). `curate_data.py` turns the marked lines into a Relations field with
    `year: 2`; `build_relations.py` makes lines from it only with someone of that cohort (an aside like "with Sophia graduated"
    never reaches an older line). 107 new curated Connections lines. Secret lines (Krieg > Maple, Krieg > Tsubaki, Dante >
    Hadrian) are `<narrator_only>` and make no Connections line.
  - Before Year 2 nothing of them shows: their entries are empty, the added lines and Regulars names are hidden, the roster skips
    them, the engine starts no bond (as before), the Cast Sheet's Key ties list only people who have arrived, and the dossier and
    People → Connections hide the added fields and lines (`fieldUnlocked`, `edgeVisible`), not even as locked rows.
  - Cast Sheet: the school year on the sheet now follows the campaign year ("Year 2 student" for Aiden in Year 2; graduates show
    as former students). Before, every sheet printed the lorebook year; with a cohort in Year 1 alongside them that was wrong.
  - Nerys's weekly hobby (`npc_canon.json` → `weekly`): her sheet prints "This week's hobby: …" from the 48-week list, index
    (Month-1)*4 + (Week-1). The 26 calendar weeks stay put; the 22 free weeks shift 7 slots each campaign year after Year 2 and say
    "revival season"; from Rank 9 "(unless {{user}} chose one; then theirs)". Not in <now>.
  - Engine: a Rank 10 benefit can carry the training-partner bonus (x1.5 while present), not only a Rank 5 gift; a Rank 10
    benefit suspended for low Trust gives none. "Sobek", "Royal Mage" and "youngest Royal Mage" are not names (alias deny-lists);
    Maple and Wren at a sentence start are not mentions (maple, wren).
  - UI: an NPC without a portrait shows initials (avatar, dossier, graph, bracelet cast strip) instead of requesting a missing image.
  - Canon filled in (small, to confirm with the owner): Maple's lore gets the line "Club: Gardening Club." (the draft names the club
    in A1 and section 8 but not in her entry); regulars from each NPC's Haunts (Linus: Announcement Room, Sparring Pavilion,
    Combat Grounds, Archive, Canteen; Maple: Gardens, Forest, Sky Dormitory, Combat Grounds; Nerys: Mail Tower, Gardens, Forest,
    Founder's Park, Canteen; Hadrian: Club Rooms, Workshop, Light Dormitory, Canteen; Wren: Fishing dock, Fire Dormitory, Club
    Rooms, Main Library, Canteen; Tsubaki: Combat Grounds, Sparring Pavilion, Observation Tower, Grassy Field and Hills).
    Connections kinds for the A6 pairs the tables leave open, e.g. Nerys > Linus = Linus's wary view, Hadrian > Tsubaki = her wary view.
  - To confirm with the owner: Hadrian's full Cast Sheet is ~3.45k tokens (the others 2.7-3.0k; earlier waves stayed under ~3.2k),
    because his approved lore is long; not cut. Portraits: none yet (PNG needed, then `tools/process_assets.py` and the manifest).
  - Tests: test_cohort2_v170.cjs (39 checks: Year 1 vs Year 2 for entries, added lines, roster, Regulars, sheet, dossier, lines;
    the hobby list and its yearly shift; the Rank 10 training bonus; sizes; the 1.6.11 save). test_bughunt_v103 (fake cohort next to
    the real one), test_rank8_v168 (A 23, C 12), test_tension_v138 (44 bonded), test_split_v146 ("the first person who" in Maple's
    lore is not a point-of-view rule) updated for the new data. Save 1.6.11 added. npm test 1239 checks (42 suites + static QA);
    stress passes; smoke 550 views, no errors; token_audit unchanged in Year 1 (~12.3k start, ~17.6k heavy); preset built twice,
    byte-identical (unchanged).
  - To verify in ST: a chat in campaign Year 2 (set World.Year or play through Graduation) with one of the six present: their
    keyword entry, their Cast Sheet with the hobby line (Nerys), an older NPC's entry with the new lines; and in Year 1 that none of
    it appears.
- 1.7.8 FP2 — Student Council election (owner direction, 2026-09-27). Month 10 Week 3 is election week: campaigns and brochures Monday–Thursday, Friday 16:00–18:00 debate in the Seminar Rooms, Saturday 13:00–16:00 presidential vote in the Main Courtyard instead of all clubs. Morning Saturday classes continue.
  - Florian and Dante have Student Council as their sole club from Year 1 day one; regulars, faction, roster, club directory and lore were updated. Irene and Caspian lead through Graduation. The recorded winner becomes President-elect, chooses the losing candidate as Vice President-elect, and they take office at Year 2 M1 W1. The engine retains a result once recorded; an unplayed Year 1 election defaults to Florian/Dante at the Year 2 rollover. Later elections require two eligible named candidates entered in state before a result. No Council membership cap exists; six physical Chamber chairs are not a limit.
  - Dante's Rank 5 Lodge key became a Council safety card (existing saves migrate the gift); Florian's Rank 10 wording now limits “first followed” to combat. Calendar, day plan, `<now>`, roster, People roles, Activities and map timetable follow the election day override. Source lore and generated card rebuilt as v1.7.8.
  - Verification kept brief by owner request: generator/build pipeline completed and `tests/test_council_v178.cjs` passed seven focused checks. No full suite or stress test run. To verify in SillyTavern: election week narration, result entry, and Year 2 role display.
- 1.7.7 FP1 — NPC initiative (owner-approved `planning/DRAFT_fp1_npc_initiative.md`, 2026-09-27). No established HANDOFF §4 decision changed and no new NPC canon was written.
  - Engine selects a Rank 3+ bonded NPC who is absent from the scene, on a seeded 35% daily opportunity, at most once a day and twice per campaign week, with a seven-day cooldown per NPC. Open / normal / guarded / closed scheduling weights are 3 / 2 / 1 / 0.5; they do not change personality. The selected ID is latched in `$eng.initiative` for the day, so a refresh, swipe or scene update does not reroll it. A present, graduated, not-yet-arrived or status-blocked NPC is ineligible; trips and lockdown suppress the feature. Contact is consumed once the NPC enters the scene or the feature is turned off.
  - `<now>` receives one optional line with that NPC's already-approved Stage for the current rank band. High Tension (70+) adds a clear warning that the approach is not friendly. The engine never moves `Scene.Present` or obliges {{user}} to meet the NPC. A Features toggle, default ON, switches the line off and waits until the next day after being turned back on.
  - Sources: `data/features.json`, `data/npc_canon.json` Stage and `data/bond_openness.json`; engine and EJS templates, schema and UI. Generated card, both TEST cards and preset rebuilt. Save 1.7.6 fixture added before implementation; `fillShape` and `$eng.ver` retain earlier saves.
  - Tests: `test_initiative_v177.cjs` covers the seeded choice, Stage, scene consumption, Tension, toggle, status, trip, weekly and NPC cooldowns, higher rank, graduation and incoming cohort, Settings UI, and migration. `npm test` (1509 checks, 49 suites + static QA), `npm run stress`, `node tests/token_audit.cjs` pass; preset build twice is byte-identical. The first preset build needed UTF-8 console encoding on Windows; with `PYTHONIOENCODING=utf-8` both builds passed.
  - To verify in ST: after meeting Etnie, advance days until her initiative appears; check it is only an opening, not an automatic scene arrival; check a high-Tension bond's tone and the Settings toggle. The printed Stage line should not override the NPC's present circumstances or plans.
- 1.7.6 A graduate's rewards stop working (owner, 2026-09-27: "harusnya perk sudah tidak efektif dan hadiah rank 5 hanya sebatas
  memento"; decisions: a. reputation from a Rank 10 stays up, b. a gift with contents keeps what is left without refills, c. every
  other gift is a keepsake). Touches HANDOFF §4 "Rewards" and the design principle "rewards must be useful, not mementos": an
  owner-approved exception for graduates. Before, the engine ignored graduation for rewards: a graduate's perks stayed in _Perks
  (and rule 502 told the narrator to honour them), a training bonus worked when a graduate visited, Irene's pardon could still be
  spent, a monthly payment (Aiden's, after Year 3) kept coming, and a graduate's bond event still gave a new reward.
  - Engine (8d2, every update, so a chat already past Graduation converts too): a graduate's Rank 5 gift becomes a keepsake
    (_Perks Kind `memento`, no effect; data/bond_rewards.json `grad` for Royhan's pouch and Idris's vials: what is left can be used,
    nothing is refilled); their Rank 10 benefit ends; the originals wait in `$ui.perks_grad` and come back if the story keeps the
    person (their name leaves Campus_State.Graduated). A graduate gives no training bonus, a one-use perk from them is refused and
    kept, a monthly payment from them stops, and their 4->5 or 9->10 event raises the rank but gives no reward (the event's
    directions say so). Reputation already raised by a Rank 10 (Ruby) stays. Etnie stays on, so hers keep working.
  - Rule 502 (_Perks) and 504 say a memento is a graduate's keepsake with no effect beyond its text. Student file → Gifts & perks:
    "Keepsakes from graduates" and "Ended" sections.
  - Tests: test_gradperks_v176.cjs (18 checks). Saves 1.7.5 and 1.7.5_yearend added. npm test 1481 checks (48 suites + static QA);
    stress passes; smoke 550 views, no errors; token_audit ~12.5k start, ~17.8k heavy (+~60, the rule lines); preset built twice,
    byte-identical (unchanged). Both TEST cards rebuilt (the Year 2 card's Gareth gift turns into a keepsake on its first update).
  - To verify in ST: in Year 2, Student file → Gifts & perks shows a graduate's gift under Keepsakes; the narrator does not use an
    ended Rank 10 benefit.
- 1.7.5 The Entrance Event as a senior, and a TEST card that starts in Year 2 (owner, 2026-09-27: "edit entry entrance event agar
  menjelaskan bahwa di year 2/3 user sebagai senior yg mengajak new student tour"; "buat character card test yg memulai campaign
  sebagai year 2 dengan bond bervariasi (bond hasil year 1 biarkan new student masih kosong)"). No established decision changed.
  - Entrance Event (lore 21, via merge_lorebooks.py): from {{user}}'s Year 2 an EJS section says {{user}} is a returning student,
    never sorted again, and one of the seniors: watches the 09:00 sorting from the gallery, takes a group of four new first-years
    round the campus 10:00-18:00, shows them their rooms if they are in {{user}}'s dorm, eats at the feast with their own year.
    The v39 export carries the same as a plain line. The engine's day plan (`_Event_today`) says the same in short, from campaign
    Year 2 or when {{user}} is past Year 1.
  - Engine: a student past Year 1 who is still Unsorted (a chat that starts in Year 2 or 3) gets the dorm the Arbiter Stone reads
    from their dominant type (D9) as soon as the Builder sets it; the Journal says "Of the <dorm> Dormitory since the first-year
    sorting". A first-year is still sorted by the story.
  - TEST card `dist/test/Eldrasil_TEST_Year2` (tools/build_test_card_year2.py, own lorebook name): starts at Year 2 M1 W1 Mon 07:30,
    the Entrance Event, {{user}} a 19-year-old second-year with 1,450 points; 19 bonds from Year 1 at Ranks 1-6 with varied Trust
    (30-85) and Tension (0-55), one Year 1 fact and milestone each, three of them now graduates (Gareth, Irene, Royhan, Ruby's
    bonds stay); Rank 5 gifts already given (Etnie, Saffi, Gareth); Journal lines dated Y1; no bond with the new first-years or a
    rival team. The engine sends Year 1's third-years away on the first update (Etnie stays) and journals the new first-years. Its
    first message: {{user}} comes back through the gatehouse and is handed a senior guide's slip for the tour.
  - Canon filled in for the TEST card only (not in the lore): each bond's one fact and Year 1 milestone, written from their lore
    (e.g. Caralynn outshone in Magic Theory, Trixie's circus, Gavlan assigning the combat role).
  - Tests: test_year2start_v175.cjs (22 checks: lore 21 and the day plan in Year 1/2/3, the v39 line; the TEST card's name, start,
    ranks, Trust/Tension spread, no cohort-2 or rival bonds, gifts, Journal; Builder then dorm; graduation and arrivals on the first
    update; a new first-year met at Rank 0; Etnie's sheet; the 1.7.4 save). test_year2_v174 follows the new day-plan words. Save
    1.7.4 added. npm test 1453 checks (47 suites + static QA); stress passes; smoke 550 views, no errors; token_audit unchanged in
    Year 1; preset built twice, byte-identical (unchanged). Both TEST cards rebuilt.
  - To verify in ST: import the Year 2 TEST card, register in the Builder, and play the Entrance Event: the dorm is set, Etnie is
    still there, the tour group is new first-years (Linus, Maple, ... are strangers).
- 1.7.4 Year 2 bug hunt and stress test (owner, 2026-09-27: "bug hunt dan stress test apa yg terjadi ketika user mencapai year 2":
  arriving and graduating NPCs, ages, dynamic features, the Entrance Event, entries written for Year 1), merged with 1.7.1-1.7.3
  from the other session (World Myth, nations, NPC origins; owner: "gabungkan sesi ini dan sesi claude lain untuk membentuk
  1.7.4"). The bug hunt was first built as a 1.7.1 on its own branch; it is renumbered 1.7.4 here and no 1.7.1-1.7.3 content
  changed in the merge. Owner decisions on `planning/DRAFT_year2.md` (2026-09-27): Etnie stays; a Student Council President
  election event and the Council as a club {{user}} can join are planned for later; teachers not on record are the narrator's to
  create; rival academy third-years graduate too (new team members are for later); dorm ranks and after Year 3 are left as they
  are. Touches HANDOFF §4 "Graduation" (Etnie, owner-approved) and the pending "Player lifecycle" decision (§8).
  - Found and fixed:
    - Dates had no year: in Year 2 a Year 1 line dated "M1 W1 Mon" read "earlier today" in <now>'s Journal dates and the Cast Sheet
      (Knows, Imprints, defining moments), and the Notebook's Journal merged Year 1's and Year 2's "Month 1". From campaign Year 2
      every date the engine writes carries its year ("Y2 M1 W1 Mon"; Year 1 keeps the plain form, so nothing changes before Year 2);
      a date the narrator writes in Year 2 without one gets it; the first update in Year 2 dates Year 1's lines "Y1" (Journal,
      archive, Knows, Imprints, Recent, defining moments, Last seen, campus events). ageOf reads the year ("over a year ago"); the
      Journal groups by year and month from Year 2. The chat seed keeps the old form.
    - {{user}} stayed a Year 1 student unless the narrator acted on a log line, so <now> gave them first-year classmates (cohort 2)
      and first-year teachers. The engine now moves Player.Profile.Year up at a new campaign year (Journal "Began Year 2 at
      Halvard."), unless the narrator changed it in that update; the story can set it back; a third-year is not moved.
    - Last year's Competition record (e.g. "eliminated, Academy", a team of graduates) stayed all of Year 2, so the narrator read
      {{user}}'s competitive year as over. It is cleared at the new year; the Journal keeps it.
    - Etnie graduated automatically, against her canon (narrator_only goal: fail her third year on purpose to stay beside {{user}}).
      `data/cohorts.json` `stays` keeps her: not sent away at M12 W1 Mon, a log line that does not give the secret away (the player
      sees the log), "not graduating" on Graduation day; roster "repeating", Cast Sheet "Year 3 student". The story can still
      graduate her. Owner: "Etnie tetap tinggal".
    - Ages never moved: every "Age: N" / "Age N" in a Halvard NPC's lore (students, staff) now adds the campaign years since Year 1
      (a cohort: since its arrival year), in the entry, the Cast Sheet and the dossier.
      {{user}} turns a year older on their birthday (once per year; not if the story already wrote the new age).
    - A graduate's own keyword entry said nothing about graduating (only the roster and the Cast Sheet did): it now opens with
      "Now: graduated; has left Halvard (a visit or a letter is still possible)". Royhan's "This year is his last chance" trouble
      showed again in Year 2 (Month-only date gate): it is Year 1 only now.
    - <now> never named the campaign year: from Year 2 its first line starts "Year 2, " and one line says how to read lore written
      for Year 1 (first-/second-/third-year and "this year" as of the year a character was introduced; school year now in the
      roster; ages already current; graduates have left).
    - The Entrance Event day plan in Year 2 still read as {{user}}'s own arrival: from Year 2 `_Event_today` adds that {{user}} is a
      returning student, never sorted again; arrivals, sorting, tour and dorm rooms are for the new first-years.
    - Rival academy teams never changed: their third-years (Ines, Cassius, Mirelle, Theodore) stayed on the Kingdom Competition
      teams in Year 2. Each rival student's Role line now follows the campaign year (school year, age); after their third year the
      entry opens "Now: graduated from <academy> at the end of campaign Year N; no longer on its team", and each team entry says
      from Year 2 who has graduated and that the academy fields new members (none on record yet; owner: new NPCs later).
    - A class with no teacher on record (most of {{user}}'s Year 2/3 subjects) said only "teacher not on record"; <now> now asks the
      narrator to create one and keep them the same person every lesson (the Extras record keeps them from their second scene).
    - The card description said "{{user}} is a first-year student": now "a student (a first-year when the story begins;
      Player.Profile.Year says which year now)".
  - Checked and fine: graduation of the Year 1 third-years at M12 W1 Mon (and of the Year 1 second-years at the end of Year 2),
    also after a time skip; the six cohort-2 first-years arrive at the first update of Year 2 (roster, entries, added lines,
    Regulars, sheets, Connections); graduates leave Regulars, club lists and the flu pool; happenings name no graduate; weekly and
    daily caps, bond cooldowns, Meanwhile, stale events and Extras use absolute days (no Year 1/Year 2 collision); monthly payout
    across the year boundary; notices and commitments dated "M1" written in Month 12; Nerys's hobby shift; every entry renders
    in Year 2 and Year 3.
  - Left as they are (owner): the Student Council has no President or VP in Year 2 until the planned election event; dorm top
    ranks (Gareth #1, Sophia #2) graduate; nothing after Year 3; no new first-years in Year 3 (cohort 2 moves up to second year by
    itself; `data/cohorts.json` "3" lists only new arrivals); Year-1-only phrases in lore beyond the <now> note.
  - Tests: test_year2_v174.cjs (48 checks: the 1.7.3 save made at the end of Year 1, `save_1.7.3_yearend.json` from the new
    tests/fixtures/make_save_yearend.cjs on the 1.7.3 code, plays into Year 2 without losing data; dates, ages, Etnie, {{user}}'s
    year, competition, birthday, Entrance Event, <now>, Cast Sheet, dossier, Journal, rival teams, the teacher line, every entry in
    Years 2 and 3). test_bughunt_v103 (Etnie is no longer in the graduating list; the roster shows her repeating) and
    test_cohort2_v170 (version read from card.json) updated. Saves 1.7.3 and 1.7.3_yearend (1.7.3 code), 1.7.0_yearend added.
    npm test 1430 checks (46 suites + static QA); stress passes (the 380-day run ends in Year 2); smoke 550 views, no errors;
    token_audit in Year 1 as 1.7.3 plus the teacher words (~12.4k start, ~17.8k heavy; <now> +~60 tokens only from Year 2); preset
    built twice, byte-identical (unchanged). TEST card rebuilt.
  - To confirm with the owner: {{user}} moving up a year by themselves and NPC ages moving each campaign year (both built; the owner
    did not object in the Year 2 review).
  - To verify in ST: in campaign Year 2, <now> starts "Year 2, " with the campaign-year line; the Journal in Notebook shows
    "Year 2, Month 1" above "Year 1, Month 12"; a graduate mentioned by name prints "Now: graduated" in their entry; a rival team
    named in Year 2 prints who has graduated.
- 1.7.3 NPC origins in the new nations (owner, 2026-09-27, draft `planning/DRAFT_npc_origins.md`, approved: "Approve"; both
  moved to Eldrasil at twelve). No established decision changed.
  - Idris Ainsworth: born in the Arslan Sultanate; the fur-trading family settled in Eldrasil's dry south when he was twelve and
    still haggles the Arslan way. Vera Pulsar: born in Caelmar, where the immigrant family of clockmakers kept a shop on a middle
    layer, before they settled in a mid-sized Eldrasil town when she was twelve. Both still go to Halvard at 18 like every gifted
    child in Eldrasil.
  - Tests: test_origins_v173.cjs (4 checks: both backstories, the UI data, the 1.7.2 save). Save 1.7.2 added. npm test 1367 checks
    (45 suites + static QA); stress passes; token_audit unchanged; preset unchanged. TEST card rebuilt.
- 1.7.2 Nations: five nations of the continent, each with its own trade, woven into the lore (owner, 2026-09-27, draft
  `planning/DRAFT_nations.md`, approved: "approve"; the owner's rule for drafts: anything the owner does not comment on is approved).
  No established decision changed.
  - Entries (uid 278, 279, 333-335; Sunreach Bay's settings: keyword, order 80, position 1): the Arslan Sultanate (the money capital
    in the Primal Desert; the World Bank), Norvaine (the north: the strongest army, a hereditary pact with Yog-Sothoth, Lord of the
    Cosmos; each Star Night it takes one Chosen of the Cosmos, erased from memory, and only the rule is remembered; exports
    starglass), Velmora (Eldrasil's northern border, the most formal court; its bloody succession is narrator_only), Caelmar (a
    single hive city in the west, layered from the king above the clouds to the slums below; the continent's workshop), Yozakura
    (the south, Japanese-themed, mostly Beastkin; service companies worldwide, rulers crowned by tournament as Alpha, katana).
    The `Arslan` keywords moved from the Devoured Kingdom myth to the Arslan entry.
  - Woven in: WORLD INDEX (a Nations line), Kingdom — Eldrasil (named nations), Competitions (the nations at the World Competition;
    favourites Yozakura, Norvaine and Caelmar), Star Night, Etiquette, Combat Class, Workshop, the Mall, Observation Tower,
    Commissary, Noble Houses' Liaison, Banking House (a World Bank branch), Mana Grid, Airships (Yozakuran lines and crews), Sunreach
    Bay, Graduation ("the World Bank" at the recruitment tables). Every nation appears in 6-9 other entries.
  - NPC lore: Tilly (narrator_only: Velmora's succession is a blood sport; her mother, the king's concubine, sent her, and her
    letters go to her mother), Tsubaki (katana forged in Yozakura), Rei (katana forged in Yozakura), Kanae (a Norvaine starglass
    crystal ball).
  - Small wording choice: the Etiquette line says its lessons on noble conduct follow Velmoran manners (the class is marked on
    judgement, not politeness, so the whole class does not).
  - Sizes: 71-109 words, Norvaine 137 (it carries the most approved canon; kept as approved).
  - Tests: test_nations_v172.cjs (57 checks: the entries, settings, trades, Norvaine and Yozakura rules, Velmora's secret, every
    mention and how many entries each nation is woven into, the four NPC files, the v39 export, the 1.7.1 save). test_worldmyth_v171
    follows the longer nations list and reads the version from card.json. Save 1.7.1 added. npm test 1358 checks (44 suites + static
    QA); stress passes; token_audit ~12.4k start (+59, the WORLD INDEX Nations line), ~17.8k heavy; preset unchanged. TEST card rebuilt.
  - To verify in ST: naming a nation in chat brings its entry; Tilly's scenes keep her secret.
- 1.7.1 World Myth: a new lore category, five continent-wide myths (owner, 2026-09-26/27: "add kategori entry baru namanya
  world myth ... lengthnya sama seperti kategori brand, takhayul, ghost story", myths 1-2 written by the owner, 3-5 from the
  owner's direction; draft `planning/DRAFT_world_myth.md`, approved 2026-09-27: "Approve"). No established decision changed.
  - Entries (uid 273-277, the Superstition entries' settings: keyword, order 65, position 0): The Devoured Kingdom (a king's pact
    with Azathoth, Lord of All; the Primal Desert, now the Arslan Sultanate), The Four Who Saved the World (the King of Knights,
    the Archmage, the Lady of the Lake, the Empress of the Fractured Vow), The First Bargain (a mortal's bargain with "something that
    shone", Lucifer in narrator_only; magic fractured into four types), The Holy Grail, The Shaping of the World (Asmoday: spirits
    first, mortals from the soil). Format Story / Told / Lesson / Status, 72-92 words (Brand ~40-60; the owner added the Lesson line).
    Names, faces and gender of every figure are unknown (owner). The myths point at each other, with the First Bargain as the hub.
  - Mentions, as the brands are mentioned: WORLD INDEX (Eldrasil "in the east of the continent", a World myths line), Kingdom —
    Eldrasil (location, the Arslan Sultanate among the named nations, Eldrasil claims the Archmage), Veyra, Magic Theory, History,
    Dark Magic Defense, Main Library, the Cathedral, Spirit Tiers; secret lines in The Morning Choir and Lucifer; one line each in the
    files of Layla, Percival, Tilly, Morgana and Elion (`source_original/npc_lore_2026-09-25/`). Alyssa and Lucius (Spirit Lord
    pacts) get no line on purpose, so nobody shuns them. All edits in `merge_lorebooks.py` (`WORLD_MYTHS`, `add_world_myths`), so the
    card and the v39 export agree.
  - New canon (all in the approved draft): Eldrasil lies in the east of the continent; Azathoth, Lord of All, the greatest of
    Asmoday's spirits; the Arslan Sultanate stands in the Primal Desert; the Archmage sealed Lucifer (narrator_only; Lucifer's
    "the thief" already implied it); the Morning Choir keeps the First Bargain as scripture; Elion named his magic after the King of
    Knights' sword.
  - Tests: test_worldmyth_v171.cjs (52 checks: the five entries, their settings and size, Lucifer unnamed outside narrator_only, the
    Archmage without name or gender, the links, every mention, Tilly's line apart from her secret, no line for Alyssa and Lucius,
    public location text, the v39 export, the 1.7.0 save). test_cohort2_v170 now reads the version from card.json. Save 1.7.0 added.
    npm test 1296 checks (43 suites + static QA); stress passes; token_audit ~12.4k start (+68 always-on, the WORLD INDEX line),
    ~17.7k heavy; preset built twice, byte-identical (unchanged). TEST card rebuilt.
  - To confirm with the owner: the Holy Grail has no narrator_only line, so the narrator treats it as a legend (the owner did not
    say whether it is real). Myth 5 says "mortals" rather than "human", so Elves and Beastkin come from the soil too.
  - Next (owner): nation entries in their own draft, the same size; `Arslan` / `Arslan Sultanate` move from the Devoured Kingdom to
    the Arslan entry then. A Velmora entry must not touch Tilly's secret.
  - To verify in ST: naming a myth in chat (e.g. "the Holy Grail") brings its entry; the Cathedral and the Main Library mention
    them when those entries fire.
- 1.6.11 A new bond starts at the character's own Trust, and clubs in Connections wait for Rank 1 (owner playtest, 2026-09-26, thread "Stress test dan bug hunt": "ini
  message 2, saya bertemu trixie untuk pertama kali, kenapa status trustnya 10, dan betrayed?"). No canon changed. Restores the
  approved 1.4.3 design (HANDOFF §4 Trust: new bonds start by category), which the engine did not enforce.
  - Cause: when the narrator inserts a new bond with a Trust number, the engine kept it if it was below the character's start
    (`Math.min(written, start)`). The output format's own example inserted a bond with "Trust": 45 and "Tension": 10, so the model
    writes a number on first meetings; Trixie got 10, which is the Betrayed band (bond XP halved, shares nothing new).
  - Fixed (engine): a new bond's Trust is always the character's start (open 60, normal 50, guarded 40, closed 30; Etnie's own
    start stays); a number written on the first meeting gives way, with a log line saying why. Drops on an existing bond are
    unchanged (written with the deed, as rule 502 says).
  - Fixed (narrator): the 503 example inserts a bond without Trust or Tension; rule 502's Trust line says a new record starts at
    the character's own Trust, so leave it out when inserting one.
  - Every character was affected the same way (any first meeting where the narrator wrote a Trust below the character's start);
    the fix is in the engine, so it covers all of them.
  - Fixed (UI, owner: "setelah bertemu trixie saya bertemu ottavio, rank 0, tpi sudah unlock connection people yg beri tahu dia
    di club apa, padahal itu unlock rank 1"): the club groups in People → Connections listed every member and advisor you had
    met, at any rank. Now someone shows in a club once their Club field is open (Rank 1 for all 24 who have one), the same rule
    the club list in Activities already used (`clubFieldOpen`); an advisor with no Club field of their own is not placed, as in Activities.
  - In the owner's chat: after updating the card (and its lorebook), swipe the reply where Trixie first appeared; the engine
    reruns from the state before it and she starts at 60.
  - Tests: test_newbond_v1611.cjs (12 checks, with the 1.6.10 save); test_connections_v141 club check moved to Rank 1. npm test 1195 checks; stress passes; smoke 550 views, no
    errors; preset built twice, byte-identical (unchanged). token_audit: start ~12.3k (+19, the rule line); the heavy figure
    reads ~17.6k only because its test state inserts 38 bonds at once with a Trust written, one log line each (in play, one
    line on a first meeting where the narrator writes a number).
- 1.6.10 Direction of every People → Connections line (owner, 2026-09-26, thread "Stress test dan bug hunt": "di entry etnie ada
  'Her Dorm Head, Kuroo Varnell, … has started pushing it' harusnya ini di entry kuroo … Kuroo and Mimosa: protective (both ways)
  … jelas ini harusnya satu arah kuroo ke mimosa … Gareth and Gavlan … kedua entry ngejelasin gavlan"). No lore text changed.
  Touches HANDOFF §4 Connections (1.4.1 curated types): the direction is now curated as well.
  - Cause: `tools/build_relations.py` drew every line from the NPC whose file holds the sentence, so "Kuroo pushes Etnie" in
    Etnie's file became Etnie → Kuroo, and two files describing the same view (Gavlan's of Gareth) became "both ways".
  - Fixed (data): all 312 curated keys re-read, sentence by sentence, for who holds the view; 75 changed. 57 keep their type and
    turn round (Kuroo → Etnie, Kuroo → Mimosa, Gavlan → Gareth, Caspian → Aiden, Caralynn → Aiden, Gavlan → Ezrel, Irene → Rei …).
    Where the old type only made sense the old way round, the turned line takes the kind the sentence states: Althair → Aiden and
    Althair → Bobby soft spot (he is amused; he dislikes no one), Ruby → Castor friends (glad to help; the old "wary" both ways
    fitted neither), Ezrel → Irene soft spot, Mimosa → Royhan soft spot (her favourite member), Caspian → Tristan respect,
    Baelin → Yvette and Tristan → Yvette soft spot (they sympathise, are kind), Caralynn → Caine dislike ("treats him as
    furniture"). Some sentences state both sides and now give two lines: Ottavio dislikes Krieg / Krieg is wary of Ottavio (was
    dislike both ways), Idris dislikes Milena / Milena has a soft spot for Idris (was Milena dislikes Idris), Vallie dislikes
    Krieg / Krieg is wary of Vallie, Sophia dislikes Irene (looks down on her), Alyssa → Milena friends. Ezrel no longer has a
    line to Althair ("Ezrel does not think about Althair at all"); he still does not dislike him (1.4.2). Where a sentence's first
    note was the other person's side, the line keeps only its own sentence (Kuroo → Mimosa no longer shows Mimosa's imitation
    habit as Kuroo's side; Sophia → Vallie, Vallie ↔ Krieg, Milena ↔ Idris, Alyssa → Milena). Dropped lines stay dropped.
  - Build: a curated value is one line or a list: `type` = A → B, `<type` = B → A, `/N` = the line's own sentences. A turned line
    keeps the file that tells it (`via`): it opens at that person's bond rank, as before, so what a bond tells you is unchanged; a
    person you have not met still appears through it and is named. The dossier's "How they see others" and the Cast Sheet's ties
    and "lines between the people present" follow the new direction (one row per person).
  - Tests: test_connections_v1610.cjs (13 checks: the owner's three examples, the notes, the via rank, the Cast Sheet, the 1.6.9
    save); test_connections_v141/v142 updated (Gavlan → Gareth is one arrow now; Ottavio/Krieg is the two-views example).
    Save 1.6.9 added. npm test 1177 checks; stress passes; token_audit unchanged (~12.3k start, ~17.2k heavy); smoke 550 views,
    no errors; preset built twice, byte-identical (unchanged).
  - To confirm with the owner: the kinds picked for turned lines above. Optional: move the sentences to the NPC they describe
    (the lore text itself); the lines are already right without that.
- 1.6.9 Stress test, bug hunt and compatibility round (card + edited preset + VectFox), asked by the owner on 2026-09-26 in the
  thread "Stress test dan bug hunt". No canon changed; no HANDOFF §4 decision changed.
  - Checked, no problem found: npm test, npm run stress, the fuzz on seeds 2-9 (30 runs x 200 steps each, 48,000 updates), the
    browser smoke test (550 views), a full rebuild (the committed outputs matched their sources), the preset built twice
    (byte-identical, unchanged). SillyTavern source (`openai.js` populationInjectionPrompts): at depth 0 the user-role prompts
    (the preset's Player Input Authority and BOLT) come before the system-role ones, and the card's 510 and 503 join the system
    block after the preset's system prompts, so `<update_format>` stays last. `macros.js`: {{lastUserMessage}} skips hidden
    messages, so Builder and Settings notes are never read as the player's input. The preset's own regexes (thought hiding,
    dialogue colours, GFX) never touch `<UpdateVariable>`; the engine strips tags before it looks for speakers, so coloured
    dialogue does not hide who spoke. The VectFox cleaning patterns still fit the 503 Analysis lines.
  - Fixed (engine): the Rank 8 branch was decided on the Trust after the rank-up's +3, so an A or B bond at Trust 47-49 was told
    to play a sworn rivalry and then recorded as a best friendship (no rival line in the Cast Sheet). It now uses the Trust the
    7->8 event was played on.
  - Fixed (Cast Sheet): a B or D character (no romance branch) says so on their sheet from Rank 6 ("Not a romance: … does not
    become {{user}}'s romance. If {{user}} tries, they react as themselves."), so the prose does not write a romance the engine
    refuses to record. A romance kept from an older save gets no such line.
  - Fixed (UI): with romance set to open at Rank 10 in Settings, the dossier's Rank 8 line said romance was open at Rank 8; it
    now says "romance (from Rank 10 in Settings)".
  - Fixed (preset, owner: "cek bug di preset juga"; `presets/edit_preset.py` section 10): BOLT's rule C said "all 0-10 tasks ...
    Never reason beyond the 10th Task" while rule A and the list run to task 11, which holds the world-stays-quiet and walk-time
    checks the card relies on (1.6.2 U10 + D6); now 0-11. BOLT step 4 pointed to <say_it_straight>, which upstream replaced with
    <comparative_emphasis_killswitch> (only a {{// }} note, stripped before sending, still named it). The AI Studio Jailbreak told
    the model to follow <anti_briefing_register> and <final_register_gate>, whose prompts this edit keeps OFF on Gemini; they are
    out of its list. Realism Mode named <avoid_yesman_behaviour> (upstream typo) for <abolish_yesman_behaviour>. Checked and
    fine: every other tag an enabled prompt names exists or is conditional ("if <x> is present"), the macros ({{setvar}} blanks,
    {{roll}}, {{lastUserMessage}}), the Gemini settings, the display regexes against the card's own.
  - Docs: `docs/TEST_CHECKLIST.md` (v1.6.11) (what only SillyTavern can show for card + preset + VectFox); PLAYER_GUIDE Bonds names
    the Rank 8 branches.
  - Tests: test_bughunt_v169.cjs (16 checks); test_preset.cjs +4 (BOLT task range, step 4 tag, the jailbreak's directive list,
    the yes-man tag) and its tag check now ignores {{// }} notes. Save 1.6.8 added (saves 1.4.6 to 1.6.8 load). npm test 1159
    checks; stress passes; token_audit passes (unchanged); preset built twice, byte-identical. TEST card rebuilt.
  - Confirmed by the owner (2026-09-26, "ya" in the thread): the wording of the "Not a romance" line (card rule text, not
    canon: it states the approved B/D category).

## BATCH 5 COMPLETE — card v1.0 released (needs user playtest in ST)

## Next
- FP1 and FP2 are complete in 1.7.7 and 1.7.8. Next: owner playtest and drift audit on an exported chat; FP3–FP5 remain in `planning/FUTURE_PLANS.md` for later.
- 1.7.3: Idris (Arslan) and Vera (Caelmar) have origins in the new nations.
- 1.7.2: nations are in (Arslan, Norvaine, Velmora, Caelmar, Yozakura).
- 1.7.1: World Myth category is in; next the owner's nation entries (own draft, same size).
- 1.7.0: cohort 2 (six first-years from campaign Year 2) is in; they need portraits (owner's PNGs).
- Future plans (owner, not scheduled): planning/FUTURE_PLANS.md (FP1-FP5, cohort 3 included).
- 1.7.4: Year 2 bug hunt done and merged with 1.7.1-1.7.3. Planned later (owner): a Student Council President election event,
  the Student Council as a club {{user}} can join, new members for the rival teams from Year 2.
- Character-consistency plan (planning/DRAFT_batch_plan.md v2): 1.5.0 to 1.6.7 done (G1 in 1.6.3, G2 in 1.6.4, G3 in 1.6.5,
  G4 in 1.6.6, G5 in 1.6.7; every bonded NPC has a voice), plus the Rank 8 branches in 1.6.8 and the 1.6.9 bug hunt. NOW: the owner playtests (`docs/TEST_CHECKLIST.md` (v1.6.11) first); then run tools/audit_chat.py on the exported
  chat for the first MVU baseline.
- Playtest v1.3.2 in ST: a pact with abilities (Builder → Pacts, Techniques page), summon it and have it use an ability
  (charged once, not charged when not summoned).
- Playtest v1.3.1 in ST: meet Etnie (Rank 3 on the spot), Etnie's dossier (no "{{user}}"), walk to the Boathouse and the Fishing
  House (map pin, "You are here"), People → Connections (spread out, draggable), Student file → Settings (Appearance themes: panels
  and bracelet change at once and after a reload; Training / Reputation rows), the Entrance Event day plan and the club booths.
- Playtest v1.3.0 in ST: the narrator writing /Rep_events, /Training and /Perk_use; a 4->5 event with its gift; the Student file
  (reputation, Body training, Gifts & perks); Krieg on a Monday; a Rank 8 mask bond before and after its secret comes out.
- Still missing (owner, known): the [Bond Event] lorebook (no event is written yet); a Doves: field for Zara, Alyssa and Tilly.
- Playtest v1.2.0 in ST: the Builder end to end (arrow keys, Techniques page, Register then reload, amend), the bracelet after a
  Builder save, calendar notes, the Shop at the Mall / Commissary, the birthday day.
- Playtest v1.1.0 in ST with the v1.1 checklist (removed in the 2026-09-28 cleanup) (EJS in 502/504 first), together with v1.0.3's checklist.
- Playtest in ST with the v1.0.3 checklist (removed in the 2026-09-28 cleanup) FIRST (the Builder vs the real MVU zod helper, F12), then v1.0 + v0.5.
  Then tune (see Tunables) and fix what the playtest finds.

## Planned (owner decisions, not built yet; the owner sends the event lorebooks after the feature exists)
- DONE in 1.2.2: bond XP system and the bond event framework. Waiting on the owner: the [Bond Event] lorebook, a review of
  data/bond_openness.json (draft), and the NPC gaps listed in the 1.2.2 chat (missing Personality / Goals / Haunts…).
- Perks the engine could enforce later (now told to the narrator only): team-up gate at Rank 4, introductions at Rank 6,
  Dove attention cover at Rank 6, favours at Rank 7.
- Scripted first-week classes (M1 W1 Tue-Sat, 14 sessions; per dorm for [D] classes; optional homework into Commitments).

## To verify in ST (could not be tested outside ST)
- 1.7.7: NPC initiative line in the real `<now>` after a Rank 3+ acquaintance, with no forced arrival; toggling Features → NPC initiative OFF hides it, and ON resumes the next day; high Tension is not portrayed as a friendly visit.
- 1.7.4: in campaign Year 2, <now> opens "Year 2, " with the campaign-year line; Notebook → Journal groups "Year 2, Month 1" above
  "Year 1, Month 12"; a graduate's keyword entry opens "Now: graduated"; the Entrance Event is played as a returning student.
- 1.7.2: naming a nation in chat brings its entry; Tilly's scenes keep the Velmora secret.
- 1.7.1: naming a World Myth in chat brings its entry; the Cathedral and Main Library entries carry their myth line.
- 1.7.0: in campaign Year 2, one of the six first-years present (keyword entry, Cast Sheet, Nerys's hobby line) and an older
  NPC's entry with the added lines (EJS year gate); in Year 1 none of it appears.
- 1.6.9: `docs/TEST_CHECKLIST.md` (v1.6.11) (card + preset + VectFox together): the depth-0 order in the real prompt, VectFox's
  stored events, a sworn rivalry at Trust 47-49, the "Not a romance" line on a B or D character's sheet.
- 1.6.8: a 7->8 event offers only the branches the NPC allows (a C character with low Trust waits; a B or D character never
  becomes a romance); after it, the Romance or Sworn rival line shows in the Cast Sheet and the NPC plays it.
- 1.6.4: Alyssa reads somber and quiet, not melodramatic; after the rest day she knows shared moments only from her notebook.
- 1.6.3: the 8 G1 NPCs sound like their scene examples without copying them; the Stage line follows a rank-up.
- 1.6.2 (U13): replies are not cut off before </UpdateVariable> (preset openai_max_tokens 15000); reasoning opens with "Now:".
- 1.6.1: tapping an invented character in the cast strip pins them (hidden tool message; thumbtack after the re-render).
- 1.5.1: the Cast Sheet (509, ~260 KB of EJS) renders without a noticeable delay, also in extra-model mode; NPC keyword entries
  read getvar('stat_data.$ui.cast') and go quiet while the NPC has a full sheet.
- 1.5.0: the preset's {{lastUserMessage}} is filled on the Gemini endpoint; the depth-0 Player Input Authority prompt does not
  move <UpdateVariable> from the end of the reply.
- 1.1.0: the Prompt Template extension renders EJS in 502 / 504 (now gated per feature), also in MVU's extra-model mode if used.
- 5.3: promptOnly regex minDepth trims the far chat as expected; [config_override] is picked up (MVU panel shows 'overriding');
  SillyTavern.chat[last].send_date is available to the Engine script when the seed is first set (fallback: world time + name).
- Display regex maxDepth=2 is honoured for markdown. (1.2.0: settled: hidden messages never render the bar, so tool entries carry none.)
- 1.2.0: after a Builder save and a page reload the student file is intact (and whether $ui.file ever has to restore it: check _Log).

## Tunables to review after playtest
- 1.1.0: weather weights and rare-event rolls, FC_TRUE 75, condition thresholds (20/5/30/60 min, 0/8/28 °C) and clear times,
  Head cold odds, flu waves, sleep multipliers, bond +1 conditions, hook due window (-30 min / +3 h) and "old" age (14 days),
  rumour days (3 / 21), Bag cap 40, hooks cap 15.
- 1.3.0: reputation thresholds / weekly cap / bond cap, monthly perk amounts and the Academy +5 bonus, high Tension 70, Krieg +14,
  training percentages (data/reputation.json, bond_rewards.json, training.json).
- 1.3.1: the player can now change training and most reputation numbers in Settings (data/tuning.json options); max-Tension -10;
  Etnie's start (bond_rules.json start); event clock times (engine EVENTS `s`); theme palettes (tools/make_themes.py).
- Payout bands, bond daily cap (3), sleep/rest recovery rates, 40-HP cap, Dove attention increments (in 502 rules).
- 5.3/5.4: happening rates (HAPPEN_RATE), trim depth 24 (regex minDepth), Journal window 30, FACTS_VISIBLE 10, Clues cap 40.

## User actions pending (not blocking Batch 2)
- DONE: assets repo holds all 101 files; base_url pinned to commit 4b6a10d (5.4). Optional: tag it v1 and switch base_url to @v1.
- Review data/field_overrides.json (story-only NPC fields: Lucius pact, Alyssa pact/backstory/goals/notes, Milena's case, Tilly's goal)
  and data/_review_sensitive_flags.json (possible spoilers written outside <narrator_only>).

## Notes / open issues
- Dependencies are unpinned: schema.js imports StageDog mvu_zod.js and mvu_loader.js the MVU bundle from default branches. F12 showed a
  helper change can silently alter behaviour. Pinning needs a tested pair of commits (owner decision; test in ST first).
- Player lifecycle is only partly modelled: since 1.7.4 the engine moves Player.Profile.Year up at a new campaign year (the story
  can hold {{user}} back); there is no graduated/expelled state for {{user}} after Year 3. Payouts continue regardless.
- A student the story keeps back (removed from Campus_State.Graduated) does not graduate automatically in a later year (shown as
  "repeating" in the roster); the story handles them.
- Cohort 2 (Year 2) done in 1.7.0; a Year 3 cohort would follow the same playbook (HANDOFF §6). Their portraits are still missing.
- Location Regulars lore text: since 1.7.0 a cohort's names are added behind the same campaign-year gate (merge_lorebooks.py COHORT_REGULARS).
- No save-migration protocol yet beyond fillShape() and $eng.ver (bug hunt B §8.9: ID renames, field renames, downgrades need one).
- UI latestState() may walk back through many floors when only an early floor holds state (bug hunt B §8.2); not measured in ST.
