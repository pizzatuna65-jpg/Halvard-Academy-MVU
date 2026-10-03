# CHANGELOG — Eldrasil / Halvard Academy MVU card

Newest first. Details are kept for about the five newest releases; the one-line index of every release is at the bottom. Older
details: `git show 7bd6a98:CHANGELOG.md` (1.40.0), `git show 9d4bfa2:CHANGELOG.md` (1.39.0), `git show 2c8c928~1:CHANGELOG.md` (1.38.0), `git show 325dfa2:CHANGELOG.md` (1.37.3), `git show c832a27:CHANGELOG.md` (1.37.2), `git show 3b49f19:CHANGELOG.md` (1.37.1), `git show 0d1de2e:CHANGELOG.md` (1.37.0), `git show 951f674:CHANGELOG.md` (1.35.2 to 1.36.0), `git show 13c8d74:CHANGELOG.md` (1.34.1 to 1.35.1), `git show 48541e2:CHANGELOG.md` (1.30.6 to 1.32.0), `git show 28bd235:CHANGELOG.md` (1.30.5), `git show 2224f00:CHANGELOG.md` (1.30.4), `git show 8f1dfc2:CHANGELOG.md` (1.30.3), `git show 90e8c43:CHANGELOG.md` (1.30.2), `git show b14dcc8:CHANGELOG.md` (1.30.1), `git show eb07f45:CHANGELOG.md` (1.30.0), `git show dd4bdae:CHANGELOG.md` (1.29.0), `git show b4cc575:CHANGELOG.md` (1.28.0), `git show 3262b84:CHANGELOG.md` (1.27.0), `git show 3294385:CHANGELOG.md` (1.25.0), `git show b4b65d2:CHANGELOG.md` (1.24.3), `git show 24b636e:CHANGELOG.md` (1.19.0 to 1.24.2) and `git show b62d182:CHANGELOG.md` (earlier).

## v1.45.0 — Audit batch 3: reports the engine settles (ledger, Bag, purchases, practice sessions) (2026-10-03)

`audit/AUDIT_2026-10-03_3_batch_perbaikan.md` batch 3 (audit part 1, items 2.5, 3.4, 3.5, 3.9). Save fixture v1.44.0. Three engine
commits and this release.
- **One ledger (3.5, 2.5).** `ledger(c, 'Points'|'Coin', delta, why)` makes every engine payment (Avalon and Sunreach fares, bets
  and thefts, tutoring, studio practice, paid shifts, the apothecary, the payout and monthly bonuses, the parcel's coin, competition
  prizes, Sunfizz bottles, purchases): the balance (never below 0), one Transactions line, and a record of the reply's engine lines.
  The "not itemised" check and the overspend check now read only the narrator's own lines and changes, so an engine payment in the
  same reply no longer hides a narrator's unlogged change. The overspend check runs per currency (a coin line no longer counts as
  points; spending coin {{user}} lacks is caught too, toast "Not enough coin"). Transactions are cut to 20 lines once, in
  `stepCommit` (was in about 12 places, some never). The parcel's coin line reads "+N coin: from home".
- **One Bag ledger (3.4).** `bagTake` / `bagGive` (keyed by `bagKeyOf`) for used items, gifts, crafting materials and output, the
  apothecary sale, the parcel from home, empty Sunfizz bottles and purchases. A change the narrator already made to that item in the
  reply counts toward it (never taken or given twice), and several engine changes to one item in a reply add up. Behaviour: an item
  put in the Bag and used in the same reply now leaves the Bag (it used to stay); craft materials bought in the same reply are no
  longer lost.
- **`/Purchases` (3.4).** New report list `[{Item, Qty, Shop, Price?, Used?, Kind?}]`, settled by the new step `stepPurchases` (3b,
  before used items are read). A Price Guide item costs its listed price at a shop that sells it (`SHOP_PRICE` rows now carry the
  shop's place, seasons and the item name), in season; out of season there it is refused. Elsewhere, or for an unlisted item, the
  narrator's `Price` is a story price (the line says so); without one the purchase is refused. Points on campus, coin away
  (`awayIn`). Not enough money: refused, nothing paid. `Used: true` (a meal, a drink at the counter, a service) pays without filling
  the Bag, and an item with a "When used" effect takes effect. Refusals are `_Log` lines with a toast. The shop reminder stays only
  for an item put in the Bag at its shop with no purchase reported, and now points to `/Purchases`.
- **One practice session (3.9).** `/Practice {"Track":"mana|stamina","With":…}` is a training session; `/Training` is still read
  as one (old habit, old swipes). `stepProficiency` gathers every session (also those of Practice actions that train), `stepTraining`
  applies them. One fitness check (`unfitToTrain`) and one Rank 4 partner rule (`r4Partner`) for mana, stamina and study (owner
  decision, proposal adopted: the bonus for every track in `rank4_partners.json`). Behaviour: the study partner bonus (+30 study
  minutes, +25% bond XP) now also needs Trust 35+, Tension under 70, the partner present and not away; a "Study a subject" Practice
  with such a partner counts 90 minutes. Weekly limits are unchanged; no migration.
- **Rules.** 502: Training reports in `/Practice`, the new Buying rule, Points for other income or costs, coin purchases off campus,
  Inventory and Consumables lines; 503: the example patch buys through `/Purchases`; 506: buying through `/Purchases`.
- **Tests:** `tests/test_audit_batch3_v1450.cjs` (27 checks: the ledger and the cut, narrator vs engine lines, coin overspend, the Bag
  ledger, purchases at and away from a shop, story price, refusals, Used, seasons, the session tracks, the partner rule, the fitness
  check). `ENGINE_DIFF` against 1.44.0 after the ledger commit: identical except the used-item case above. Full suite and stress
  (the fuzz notice "bond rank jumped (Topaz)" also appears on 1.44.0).
- **To confirm with the owner:** none beyond the partner rule above (adopted as proposed). `/Purchases` touches no DECISIONS entry.
- **Live checks:** `docs/TEST_CHECKLIST.md` 1.45.0.

## v1.44.0 — Audit batch 6: Agenda, information, competition results (2026-10-03)

`audit/AUDIT_2026-10-03_3_batch_perbaikan.md` batch 6 (audit part 1, items 3.10, 3.12, 3.13). Save fixture v1.43.0. Two commits.
- **Agenda (3.10).** Commitments, Hooks, Next plans, Projects (`Due`), Notices (`Until`) and the letter home share one date marker
  (`anchorWhen`, `agendaWhen`: a date is parsed once, when its text is new) and one status (`agendaState`: waiting / due / overdue;
  an undated major Hook left two weeks is `stale`, was "old"). New step `stepAgenda` (8n) gives the one reminder when a thing turns
  due or overdue and builds one coming-up feed, `$ui.agenda` (yesterday to 14 days ahead, plus anything overdue), which the Planner
  ("Coming up"), the Notice Board (official postings), the bracelet (Next chip, Overdue / Due today chips) and `<now>` ("Coming up",
  "Due soon") all read. `$ui.soon` (1.32.0) is gone. State fields are unchanged; Projects' and Next plans' anchored dates live in
  `$eng.agenda`.
- **Behaviour.** A Next plan's `Until` ("tomorrow evening") used to be parsed again every turn, so it never passed; now it is
  anchored and the plan happens off-screen when it does. Projects get reminders: due from the start of the day before (once), and
  overdue (once, with a toast). An appointment later today takes the bracelet's Next chip when it comes before the next class. The
  Notice Board no longer posts the Academy Trip twice (its two weeks are one run of days).
- **Information (3.12).** The Mystery Board lists what {{user}} has heard and not pinned (the rumours going around, the places'
  stories in `$ui.lore`) and pins one as a Clue to a chosen thread (a hidden player-tool message). A Clue has a new field `Source`:
  `rumour` / `story` (hearsay, unconfirmed), `records`, or empty. A heard rumour or story now opens the Mystery Board. Encyclopaedic
  (Knowledge Rank 5): a Clue the story adds in the Main Library or the Archive is the week's lead (`Source` records); a reply spent
  there without one, the engine files the lead itself (`recordsLead`) on the oldest pinned hearsay not yet looked up, else on the
  open thread found most recently, and tells the narrator to reveal what the record shows (true to the lore) and rewrite its Detail.
- **Competition (3.13).** `data/reputation.json` `competition`: a result pays its deed itself, once a year each (Dorm qualified or
  bracket champion +5, Academy title +15, Kingdom title +25 Academy Rep XP, the approved deed values); the narrator no longer reports
  those kinds (a report is not counted, with a log). A title's price (owner decision, proposal adopted): the staff expect a defence,
  and the next elimination at that tier or below costs Academy −5 after an Academy title, −10 after a Kingdom title (losing at a
  higher tier costs nothing). Teammates (`Competition.Team`) gain 5 bond XP once a year per tier when the team's result at it comes in.
- **Rules.** 502: the Competition, Clues and reputation-kind lines; 504: the Encyclopaedic line. Settings token estimates: Mystery
  Board 152 → 198, Competition up by the new sentence.
- **Tests:** `tests/test_batch6_v1440.cjs` (agenda states, anchored Next plans, reminders and the feed, the letter home and notes,
  pinning, Encyclopaedic, competition reputation, its price and team XP); `test_calendar_v1320` and `test_world_v110` read the
  feed and `stale`; `test_saves` treats `$ui.soon` as derived. Full suite. `tests/snapshot_render.cjs` before/after: only the
  Planner, Notice Board, Mystery Board, Settings estimates and the 502/505 texts differ, as intended.
- **To confirm with the owner:** the competition numbers above (−5 / −10, 5 bond XP) follow the batch's proposal.
- **Live checks:** `docs/TEST_CHECKLIST.md` 1.44.0.

## v1.43.0 — Audit batch 2: one source (`shared.js`, `rollTable`, texts from data) (2026-10-03)

`audit/AUDIT_2026-10-03_3_batch_perbaikan.md` batch 2 (audit part 1, items 2.2–2.4, 2.8, 3.6). Save fixture v1.42.0. A refactor in
five commits, then one marked behaviour commit.
- **`src/scripts/shared.js`**, injected into the engine, the panels, the bracelet, `<now>` (505) and the Price Guide (506) at their
  `/*@@SHARED@@*/` (`tools/common.py` `shared_js()`): class periods, exam months, seasons, trips and dorm colours (now
  `data/calendar.json` `periods`, `exam_months`, `seasons`, `dorm_colors`, and a `trip` field on the two trip events); the class
  role, the Council remedial, Trust/Tension bands, NPC status, `placeOf` / `placeKey` / `locParts`, `itemKey` / `keyIn`; and the
  seeded draws `hash32`, `rand01`, `roll100`, `d100`, `rollInt`, `pickOf`, `rollTable`. Every copy in the engine, the panels, the
  bracelet and the EJS entries was replaced (2.2–2.4).
- **Seeded draws** (3.6): happenings, NPC initiative, the airship's sky / stage / hold, Avalon and Sunreach city life, Expedition
  encounters, gossip fate, flu, head cold, free periods, the parcel from home, exam and rank rolls and the ambience picks draw through
  them, with their seeds and order kept (old chats swipe to the same results).
- **Texts from data** (2.8): the Trip and Competition texts, the Crowning Day, Kingdom and Expedition lines in `<now>` write their times
  and the prize as `{@file.path}` (`fill_data()`); the Kingdom prize, the Rank 5 perks (`data/mastery.json`), the public roles
  (`data/public_roles.json`), shop gift tags (`shop.json` `gift_tags`), the practice places for the red dots and the bracelet's
  shop chip come from data.
- **Proof.** `ENGINE_DIFF` against 1.42.0 identical over the full suite, a 380-day year and the fuzz run (6,068 engine runs) for
  every refactor commit. New `tests/snapshot_render.cjs` renders every panel tab, the bracelet and every EJS entry from 17 fixed
  states (3,638 renders): identical, except (1) the Price Guide's order of equal canon prices, now sorted by name (a Python set
  had made it change between builds) and (2) the Settings token estimate of the Price Guide (5,559 → 5,534: its template code got
  shorter; the shared code, never sent, is left out of the count).
- **Behaviour (marked commit):** Settings > Campus life > Ambient moments now also paces the outside areas' small life (Avalon and
  Sunreach street sights, people met, pickpockets and hustlers; the airship's sky, stage and hold): Rare ×0.67, Normal ×1, Often
  ×1.33. Story beats (Tsubaki lost, the Leviathan, raids, scouts) and the Expedition keep their rates. `placeOf` splits at an en
  dash too ("Canteen – kitchen"). Found on the way: the bracelet's "Shop here" chip knew only the Mall's first four shops; it now
  shows at every shop the Shop tab knows (Quillfeather's, Tinker's Bench and the rest).
- **Tests:** `test_one_source_v1430.cjs` (a shared table copied back into a template fails), `test_audit_batch2_v1430.cjs` (the
  behaviour commit); `test_batch4_seasons_mana` reads the season table from `shared.js`. Full suite.
- **Live checks:** `docs/TEST_CHECKLIST.md` 1.43.0 (the bracelet, `<now>` and the Price Guide run `shared.js` inside SillyTavern).

## v1.42.0 — Audit batch 1: every bug from the 2026-10-03 audit (2026-10-03)

`audit/AUDIT_2026-10-03_3_batch_perbaikan.md` batch 1 (audit part 1, items 1.1–1.10 and the "Rendah" table). Save fixture v1.41.0.
Three commits: hotfix, gameplay rules, small bugs. Tests: `tests/test_audit_batch1_v1420.cjs` (one check per bug); full suite.
- **Hotfix.** The dialogue-colour regexes "stray tags" and "strip tags from older replies" held a JSON `` (a backspace) and
  never matched: `<say:…>` tags now leave old replies in the prompt and stray tags leave the display. One item-name key (`itemKey`,
  `bagKeyOf`) for the Consumables filter, the Qty decrease and the R2 reminder ("a Quick-dry powder" now lowers the Bag). New
  Transactions lines are counted as a multiset (`newLines`), so the same line on another day ("-3 tea at the Snug", "+40 tutoring
  (History)") no longer adds a false "(not itemised)". A Bag over 40 kinds names what it left behind (toast and log). The MVU bundle
  and `mvu_zod.js` are pinned to commits (`438f9ff`, `276040b`; byte-identical to what loaded on 2026-10-03).
- **Gameplay rules** (behaviour changes):
  - One "away" test (`awayIn`): Trip.Active, an outside area (airship, the Expedition's forest, Avalon, Sunreach), or off the
    grounds on a calendar "away" day. It replaces every `Trip.Active` check (rest, attendance, small scenes, Meanwhile, visits,
    the planner's "may be here", initiative, curfew and arrival reminders, the birthday party). A Trip left Active ends by itself,
    with a log line, once {{user}} was off campus during it and is back at a campus place on a day with no "away" event.
  - A gift (Kind gift or birthday) whose Item was in the Bag lowers its Qty, unless the reply already did (as H2). Kind
    rank_gift is the NPC's Rank 5 handover to {{user}}, so it never lowers the Bag.
  - Talk, hangout, study, help and gift XP (and the weather bonus) need the NPC in the scene now or at the reply's start; the log
    says when an interaction gave nothing. A gift from afar still records the NPC's taste. Owner decision as proposed: letters and
    messages from afar give no XP.
  - An update over six hours within one day, between two places the map knows, counts the class periods whose venue neither end
    is at as skipped. Owner decision as proposed: yes. Unknown places and jumps into another day still follow the routine.
  - A Day written one or two days back in the same week, with no time-skip words in the prose, keeps the clock (with a log line)
    instead of jumping six days ahead.
  - Narrator rules (502): Trip (the engine knows the outside maps, ends a stale Trip) and Interactions (only with the NPC there).
- **Small bugs.** Sleep quality and the rare-weather toast read Sunreach's own weather. The UI timetable gives a Council member
  Saturday P2 at the Student Council, as the engine. The dossier finds an NPC_status keyed by full name. The Battle panel prices a
  cast as the engine does (wind ×, Arcane scholar, a pact partner who must be here; `$ui.wx.wind`). The Proficiency panel's Fortune
  bonus shows the engine's +10 cap. A parked feature's values are no longer overwritten by schema defaults (`mergePark` gets only
  what the reply wrote). `$ui.names` and `$ui.lore` hold 200. Dead code removed (`MON_SAT`, `tensionBand`, `normP`, `wxBlk`, an
  unused `OFF`, `pips`).
- **Older tests updated** to the new rules: `test_batch1_fp7_v1100` (long same-day update), `test_tension_v138` and
  `test_world_v110` (XP with the NPC present).
- **Live checks:** `docs/TEST_CHECKLIST.md` 1.42.0 (the dialogue-colour regexes in SillyTavern, the pinned MVU loading).

## v1.41.0 — Sunreach Bay: the Academy Trip's city, day and night; area indexes (2026-10-03)

FP7 area 3, the last outside map (owner-approved `planning/DRAFT_outside_maps.md`, part 3, after three rounds of owner notes; both
map images are the owner's, from `planning/MAP_PROMPTS_outside_maps.txt` part 3). Save fixture v1.40.0.
- **The city.** Sunreach Bay is one city around a turquoise bay with two faces: a seaside paradise by day, and from 18:00 to 06:00
  the same streets lit by rune-light (glowing glass signs, painted banners under rune lamps, lanterns; no electricity, no screens).
  Ten pins, 21 places (`data/sunreach.json`, the single source): Skydock; Fisherman's Wharf (Fish Market, Sea Dock); Coral Strand
  (The Hanabira, Halvard's Yozakuran hotel; Coral Beach); Sunpier (the pier, Tidehouse Aquarium); Sunreach Crossing (the Crossing,
  Velvet Lanes); Casino Row (The Golden Tide, Plaza Dourada); Cliffside Terraces (The Terraces, Skyrail, Old Fort); Turquoise
  Lagoon (The Lagoon, Reef Gardens, Shell Cove); West Cliffs (The Lighthouse, Sunset Cliffs, Glowtide Grotto, a sea cave opening
  into a glowing cavern with a pool); Open Sea.
- **Two maps.** `map/sunreach_day.webp` and `map/sunreach_night.webp` (same composition, same pins); the Map panel's Sunreach tab and
  its place cards switch to the night map and the places' night faces at 18:00. Assets pinned to commit `4620b2c` (`505dd35` plus
  the two maps, verified identical); local copies in `Maps/`.
- **Engine** (`srPlace`, `srLoc`, `srWindow` in `stepTime`; `stepSunreach` after `stepAirship`). From the landing (M11 W2 Sat 20:00,
  the airship now lands at "Sunreach Bay — Skydock") to the boarding home (W3 Thu 08:00) `World.Location` is "Sunreach Bay — <place>";
  short aliases ("the beach", "the casino") count only there. Walks 10–35 minutes between parts (5% stamina an hour); a horse carriage
  (6 coin) anywhere on land or a water taxi (8 coin) between two shore parts takes half the time, without stamina (`Sunreach.Ride`
  "carriage" or "boat"); the Open Sea only by tour boat from the Sea Dock (60 min, 15 coin; without the coin {{user}} stays ashore).
  The teachers' curfew at The Hanabira (22:00–07:00) replaces the dorm curfew; the night side (The Golden Tide, Velvet Lanes) gets a
  `<now>` reminder only, never a roll or a penalty (owner). Bets at The Golden Tide (`Sunreach.Bet` {Game, Stake}): dice 45% for 2×,
  cards 48% for 2×, the wheel 8% for 10×, 1–200 coin, settled by the engine (swipe-safe), never by the narrator. Once an hour (seeded,
  not asleep): a street sight (day or night pool), a hustler (8%), a student of Myrdath, Ashvale or Veyra (25%) and one of Halvard
  (20%) who would be at that place by personality at that hour (`meet`: day and night places per NPC; still at school, not met today,
  not in the scene); at sea a sight (50%) and once in a Trip the Leviathan, far off (5%, a Journal line; never a fight). Sunreach has
  its own warm weather (26–31 °C). The day before, `<now>` reminds that points do not work abroad.
- **Index pattern** (owner): each outside area now works like the campus (the constant Campus Map, keyword places). Sunreach's index
  lives in the Academy Trip entry (247: the Trip itself, now with the hotel, the 22:00 curfew, the schedule and the other academies;
  constant from M11 W1 to the Trip's end, the index only in Sunreach); its 21 places are keyword entries (431–451) in the campus
  location format (`[Name]`, `Feel:`, and `At night:` / `Feel at night:` only after dark), with no rules for {{user}} in them. Retrofit:
  the Grand Vast Forest index (360, one line per place) with keyword places (361–369); the Avalon index (370, one line per place)
  with one keyword entry per place (371–375, 452–464; the Rookery and the Royal Mages stay their own); an airship mini index (465)
  with keyword places (378–381).
- **Narrator and UI.** `<now>`: a Sunreach block (where, day or night, the walks and rides, today's schedule, the night-side
  reminder, the rule at the tables, everything the engine rolled; campus regulars and happenings are left out). 502: the location
  format, the ride and bet flags. Calendar and the Activities trip card: the Hanabira, the Sunday 09:00 briefing, the Wednesday 19:00
  farewell dinner, Thursday 08:00 boarding.
- Tests: new `test_sunreach_v1410.cjs` (46 checks); `test_airship_v1400.cjs`, `test_avalon_v1390.cjs` (the index pattern),
  `test_world_v110.cjs` (Sunreach's own weather), `test_mapvariants_v1130.cjs` (the new commit); full `npm test` passes; stress passes
  (the old Topaz fuzz note).
- To confirm with the owner (invented while applying): the place names (The Hanabira, Tidehouse Aquarium, the Gull Run, Sunreach
  Crossing, Velvet Lanes, The Golden Tide, Plaza Dourada, Skyrail, Glowtide Grotto and the rest); The Golden Tide as Ottavio's old
  house (narrator-only); the other academies in Sunreach the same weeks; the schedule (Sunday 09:00 briefing, Wednesday 19:00 farewell
  dinner, curfew 22:00); the prices (carriage 6, water taxi 8, tour boat 15, bets up to 200); who may be met where (the table in the
  data, by personality).

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
