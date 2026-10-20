# CHANGELOG — Eldrasil / Halvard Academy MVU card

Newest first. Details are kept for about the five newest releases; the one-line index of every release is at the bottom. Older
details: `git show e7e234a:CHANGELOG.md` (1.68.0), `git show 894299a:CHANGELOG.md` (1.67.2), `git show f8e8e25:CHANGELOG.md` (1.67.1), `git show 937ac63:CHANGELOG.md` (1.67.0), `git show 4f15155:CHANGELOG.md` (1.66.0), `git show ad1f2d2:CHANGELOG.md` (1.65.0), `git show d064d34:CHANGELOG.md` (1.64.0), `git show d564675:CHANGELOG.md` (1.63.0), `git show 3382abf:CHANGELOG.md` (1.62.0), `git show 8438331:CHANGELOG.md` (1.61.1), `git show 94b0f06:CHANGELOG.md` (1.61.0), `git show 968fad0:CHANGELOG.md` (1.60.0), `git show 9919e86:CHANGELOG.md` (1.59.0), `git show 039b6b0:CHANGELOG.md` (1.58.0), `git show e3dd53c:CHANGELOG.md` (1.57.0), `git show a676fc2:CHANGELOG.md` (1.55.0, 1.56.0), `git show 102466d:CHANGELOG.md` (1.54.0), `git show 2ffc1a7:CHANGELOG.md` (1.53.0, 1.53.1), `git show e6f833a:CHANGELOG.md` (1.52.2), `git show 80f75c6:CHANGELOG.md` (1.52.0, 1.52.1), `git show f96b93e:CHANGELOG.md` (1.51.0), `git show 74e6e62:CHANGELOG.md` (1.50.0), `git show 4a811c0:CHANGELOG.md` (1.49.0), `git show 533d61b:CHANGELOG.md` (1.48.0), `git show c544d3e:CHANGELOG.md` (1.47.0), `git show 9359ed9:CHANGELOG.md` (1.46.0), `git show a13acc7:CHANGELOG.md` (1.45.0), `git show 95926a8:CHANGELOG.md` (1.44.0), `git show 8cb78b2:CHANGELOG.md` (1.43.0), `git show ee2fbce:CHANGELOG.md` (1.42.0), `git show fc49cdf:CHANGELOG.md` (1.41.0), `git show 7bd6a98:CHANGELOG.md` (1.40.0), `git show 9d4bfa2:CHANGELOG.md` (1.39.0), `git show 2c8c928~1:CHANGELOG.md` (1.38.0), `git show 325dfa2:CHANGELOG.md` (1.37.3), `git show c832a27:CHANGELOG.md` (1.37.2), `git show 3b49f19:CHANGELOG.md` (1.37.1), `git show 0d1de2e:CHANGELOG.md` (1.37.0), `git show 951f674:CHANGELOG.md` (1.35.2 to 1.36.0), `git show 13c8d74:CHANGELOG.md` (1.34.1 to 1.35.1), `git show 48541e2:CHANGELOG.md` (1.30.6 to 1.32.0), `git show 28bd235:CHANGELOG.md` (1.30.5), `git show 2224f00:CHANGELOG.md` (1.30.4), `git show 8f1dfc2:CHANGELOG.md` (1.30.3), `git show 90e8c43:CHANGELOG.md` (1.30.2), `git show b14dcc8:CHANGELOG.md` (1.30.1), `git show eb07f45:CHANGELOG.md` (1.30.0), `git show dd4bdae:CHANGELOG.md` (1.29.0), `git show b4cc575:CHANGELOG.md` (1.28.0), `git show 3262b84:CHANGELOG.md` (1.27.0), `git show 3294385:CHANGELOG.md` (1.25.0), `git show b4b65d2:CHANGELOG.md` (1.24.3), `git show 24b636e:CHANGELOG.md` (1.19.0 to 1.24.2) and `git show b62d182:CHANGELOG.md` (earlier).

## v1.73.0 — Time apart and asking after: NPCs notice the gap and follow up on {{user}}'s plans (2026-10-21)

Owner's request (2026-10-21, points 1 and 2 of the "NPCs that feel alive, cheaply" suggestions): two lines in a present character's
Cast Sheet block ("Now with {{user}}"), each only when it applies. Engine and data only, no new canon. Save fixture v1.72.0.
- **Time apart** (`stepBondMemory`, bond `$apart`/`$apartd`): a Rank 2+ character who comes back into the scene after 7+ days unseen
  (the existing `$seen`) gets "Apart: last saw {{user}} 12 days ago (3 weeks from 14 days). The time apart is real to them; whether and
  how it shows is up to them, in character." It stays for the rest of that day's scene, then is spent.
- **Asking after** (`askAfter`, called by `stepAgenda`; `$eng.agenda.ask`, `$ui.asks`): a Commitment or Project of {{user}}'s that
  appears while characters are in the scene counts as heard by them (not the one it is With). Once its time has passed, or it leaves the
  record on or after its day (a project also when handed in), each of them who was not there may ask in the first scene shared with
  {{user}} within 10 days (Rank 3+): "Knew about {{user}}'s "Duel with Ruby" (M4 W2 Fri) and has not heard how it went: may ask, if
  that is like them." One line a person; spent after that day's scene. Removed before its day (cancelled or done early): nobody asks.
  Settings → Features → NPC initiative switches it off (its description says so now).
- Both are permissions, never orders, like the 1.72 special days. Tunables: `APART_RANK 2`, `APART_DAYS 7`, `ASK_RANK 3`, `ASK_DAYS 10`
  (engine constants).
- **Saves:** no migration; an older save's Agenda is recorded on the first turn without inventing who heard it.
- Tests: new `test_npc_apart_asks_v1730.cjs`; `test_saves`, `test_npc_days_v1720`, the Cast Sheet, initiative, Agenda, memory and
  narrator suites and lint pass.
- **To check live (owner):** `docs/TEST_CHECKLIST.md` Q3.3 [1.73].

## v1.72.0 — Special days: an NPC's own mood on birthdays, canon days and personal dates (2026-10-21)

Owner's request (2026-10-20): a mood of its own for each NPC on their birthday and the dates that matter to them, so moods move with
more than the weather; planning/DRAFT_hari_istimewa_npc.md, approved ("proceed") and deleted. Save fixture v1.71.0.
- **Days in the data** (`data/npc_moods.json` `days`): `on` a birthday, a calendar event (start of its title) or a date; `before: N`;
  `fix` (sets the mood: grief days) or `lean` ±1 (weather still counts); `tone`, the character's own word; `how`, one line for the
  narrator. 35 characters have rows from their lore: Remembrance Day for the breach survivors and staff (Caspian's charm, Etnie at
  {{user}}'s door, Rei's lantern, Cedric's rose, Layla's speech; Baelin the day before, Rei the week before), Star Night, the Circus
  (Trixie, then a homesick week), the Bazaar (Dorian), Crowning Day (Percival, Kotaro), the Thinning (Baelin, Krieg, Rei, Faye), rankings
  day (Valentin) and 21 birthdays of their own (Nerys does not notice, Rei tells no one, Kanae notes who forgot). Every other birthday
  leans +1, "glad". Ezrel stays Normal. Halvard's calendar days do not reach someone away; a birthday does.
- **Personal dates with {{user}}** (owner, 2026-10-20/21), a year or more later: a surviving Imprint's date (the Imprint rule already
  decides what is worth remembering: weight 5+, at most five); its new `Feel` (warm, sore, bittersweet; rule card `imprints`) gives
  the direction and weight 8+ fixes the mood. Also the day they met (`$met`, from Rank 5 and below Tension 40) and the day of Rank 8
  (`$b8`; a sworn rivalry is bitter). The line carries what happened and "remembers what day it is; whether to say so is up to them".
  Only the narrator and the NPC know: not on the planner calendar, not on the bracelet (owner); the player may note a date by hand.
- **Shown:** the Cast Sheet's Mood line (`Mood: bad. Remembrance Day (sombre): …`; a fixed day drops the weather reasons); the bracelet
  mood badge gets a bright ring and the tone in its tooltip on a calendar day; the scene card a tone chip (a birthday's once the dossier
  has opened it). No new numbers: Full mode's effects come only through Good/Normal/Bad.
- **Saves:** `stepMigrate` gives each bond a `$met` from its oldest dated line; `$b8` starts empty.
- Tests: new `test_npc_days_v1720.cjs`; `test_saves`, `test_mood_gifts_v180`, the Cast Sheet, memory, Trust/Tension, narrator rule-card
  and UI suites and lint pass (`test_ui_overhaul_v1210` now accepts the badge's extra class). Browser check: the Remembrance Day bracelet.
- **To confirm with the owner:** the 21 birthday lines and a few calendar-day lines are mine, drawn from each character's canon (the
  draft's §6); Anya's birthday falls on Remembrance Day and Kotaro's on the Circus's opening night, used as they are.
- **To check live (owner):** `docs/TEST_CHECKLIST.md` Q3.1, Q3.5, Q9.2, Q11.0 [1.72].

## v1.71.0 — Scene card actions; the other dorms leave the map; a rule under the bracelet (2026-10-20)

Owner's requests, from mockup v2 of "Halvard Scene Cards" (the owner dropped its "Rank N next" line and "Spend real time" button).
Save fixture v1.70.0.
- **Actions on the scene cards** (`sceneActions` in `src/ui/parts/50_scene.js`), at the foot of the middle column. Each button is a
  system the engine already runs for that person, shown only when it can work now: a partner Practice action open at this place today
  (`data/practice.json`, `$ui.practice`; "Spar with Sophia" only within the dorm, except in Training Week); the person's own Rank 4
  tracks (`rank4_partners.json`, +25%); Rank 2 Invite; Give a gift (a list of the Bag, each item with the reaction {{user}} has already
  seen, from `$gifts`, else "not tried"); Rank 5 Help with his/her goal; Rank 6 Meet his/her friends; Rank 7 Visit the X Dormitory
  (another dorm) or Visit X at work (staff); an open favour (Commitment `favour`); Make amends from Friction. A button only drafts the
  action into the chat box (`fillChat`, DECISIONS §7 D3/D6). An unnamed person is "the <role or descriptor>" in the draft; Extras get
  none. `DATA.npcs[id].gn` (gender, from `data/npcs.json`) gives his/her.
- **Map** (`pinShown`, `dormDayToday` in `20_map.js`): once {{user}} has a dorm, the other dorms' pins leave the campus map; one shows
  again on its Dorm Day (the calendar's open house) or while {{user}} is inside it. Unsorted: all four show.
- **Bracelet**: a brass rule under it, between the bracelet and the story (hidden with a stale bracelet).
- Not built: a gifts-left-this-week count (the week number lives only in the engine) and a birthday highlight; the engine still applies
  both limits and the birthday bonus.
- Tests: new `test_scene_actions_v1710.cjs`; `test_scene_cards_v1700`, `test_map_gates_v1240`, `test_playtest_v1301`, the UI and
  bracelet suites, `test_saves` and lint pass. Browser check in a mock chat: the three cards' buttons and the open gift list.
- **To check live (owner):** `docs/TEST_CHECKLIST.md` Q1.1, Q3.4, Q3.6 [1.71].

## v1.70.0 — Scene cards: the people present, under the reply (2026-10-20)

Owner's request, built from the approved mockup "Halvard Scene Cards": the bracelet's portraits were too small; the people present
now get a full portrait under the narration, their true thoughts beside it and their stats beside that. Save fixture v1.69.0.
- **Scene cards** (`src/ui/parts/50_scene.js`): under the narration of the newest reply, one card per person in `Scene.Present`: the
  full portrait (`portraits/`, not the thumbnail) with name and role; "Now:" (their Present note) and their true thoughts; the rank
  medal, the people card's XP, Trust and Tension meters (now `bondMeters` in `10_people.js`, shared by both) and the mood chip at
  Rank 4+; Dossier. Someone not yet named stays nameless (role or descriptor, as everywhere); an invented character gets "Keep in
  record" (the strip's pin). Three full cards, people with thoughts first; anyone else present goes on an "also here" row. A thought
  about someone absent shows as an "elsewhere" row.
- **True thoughts** come from the preset's `<npc_thoughts>` block of the same reply, matched by name. That reply's folded 🧠 block is
  hidden; older replies keep theirs. Without the block (the toggle off, another preset) the cards show without thoughts.
- **How.** The Eldrasil UI script writes the cards into SillyTavern's own message, before the thoughts block and the 📜 state update,
  styled from `<head>` and re-coloured by the theme. It puts them back when SillyTavern or Tavern Helper rewrites the message
  (SillyTavern's `updateMessageBlock` and Tavern Helper's macro rendering both replace `.mes_text`; checked in the installed source) and
  shows none while the reply is being edited. One click listener on the document opens the dossier or keeps an Extra.
- **Bracelet.** Its portrait strip steps aside while the UI script runs (`__eldrasilScene`); without the script it shows as before.
- Tests: new `test_scene_cards_v1700.cjs` (the block's two forms, name matching, hidden names, Extras, the crowd row, no block, the
  bracelet flag, the theme); `test_ui_overhaul_v1210`, `test_news_v1250`, `test_say_colors_v1370`, `test_extras_v161`, the bracelet
  suites, `snapshot_render`, `test_saves` and lint pass. Browser check in a mock chat at 900 px and 375 px: three cards, the fold
  hidden, no console error, no sideways scroll.
- **To check live (owner):** `docs/TEST_CHECKLIST.md` Q1.1 [1.70].

## v1.69.0 — One model per turn: back to one-call MVU mode (2026-10-20)

Owner's request: call one model only, no extra model in MVU. Save fixture v1.68.0.
- **The card's `[config_override]` (507) sets `更新方式 = 随AI输出`** (Alongside AI output): one request a turn; the narrator writes
  the story, then the `<UpdateVariable>` block (folds and gists included). Checked at the pinned MVU 438f9ff: in this mode
  `filterEntries` returns at once, so every entry, `[mvu_update]` rules included, reaches the narrator. The card description, 504
  and the preset's BOLT already ask for the block exactly when `<update_format>` is in the prompt, which it now always is (503).
- Extra-model parsing stays supported: MVU → Current character-card settings → Variable update method (PLAYER_GUIDE §8).
- Creator notes, DECISIONS §9, PLAYER_GUIDE §8, INDEX and the quest log (Q0.1, Q0.2) name the new default.
- Tests: `qa_static`, `test_narrator_batch7_v1580` (507 value, creator notes) and `test_saves` pass.
- **To check live (owner):** `docs/TEST_CHECKLIST.md` Q0.1 (the mode) and Q0.2 (one block per reply, folds and gists by the narrator).

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
- **v1.52.2 (2026-10-04):** Preset audit 2, tier 1: BOLT points to the rules instead of restating them, short Cosmos last-mile gates, one home per rule, Internal Thoughts tightened (17,245 → 15,444 tokens as sent; depth 0 −19%); `token_audit` counts the preset as ST sends it.
- **v1.53.0 (2026-10-04):** Narrator-load batch 1: the first-pact rule reaches Occult students (T6), a correct 503 example and a 3-line Analysis, plain dates written back as calendar dates, one "the engine does these" list, deed pairs and the remedial taken by the engine, the Extras request in `<now>`.
- **v1.53.1 (2026-10-04):** Narrator-load batch 2: `audit_chat.py --mechanics` and `replay_chat.cjs` (how the narrator handled the engine, replayed through the current engine); baseline from the owner's chats (Analysis 34% of the block, weather stamina in 7 of 13 rainy replies).
- **v1.54.0 (2026-10-04):** Narrator-load batch 3: situational rule cards (entry 511, `data/rule_cards.json`, engine `ruleCards`) for Letters, Projects, Competition, Exams, Tutoring, Trip, Pacts and the first pact; alcohol rule as keyword entry 512 (−800 tokens per turn in ordinary scenes).
- **v1.55.0 (2026-10-04):** Narrator-load batch 4: eleven more rule cards (Interactions, Trust/Tension, Imprints, Old Hut, Training, Practice, Dorm, Combat_role, favours, Notices, the Vigil) and a tighter 502 core (−2,500 tokens per turn alone against 1.53.1).
- **v1.56.0 (2026-10-04):** Narrator-load batch 5: one place per fact (each present character's engine lines are one "Now with {{user}}" block in their Cast Sheet, band words instead of numbers, Recent 3 in words, rules said once); entry 512 tagged `[mvu_plot]` (−524 tokens a turn with three present).
- **v1.57.0 (2026-10-04):** Narrator-load batch 6: the Journal as the story's spine (engine bookkeeping to `$ui.jnotes`), first visits and the Entrance tour remembered, a compact `<current_state>` (−577 tokens with 8 bonds), the card's own VectFox EventBase prompt.
- **v1.58.0 (2026-10-04):** Narrator-load batch 7: ready for MVU's extra-model mode (506 untagged, no update rule points at `<cast>`, MVU 438f9ff verified), `audit_chat.py --compare` for the A/B test; one-call mode stays the default.
- **v1.59.0 (2026-10-04):** Narrator-load batch 8: Trust drops and Tension rises reported by severity word (`letdown`, `offence`), sized by the engine from `trust.json` / `tension.json` with the old card's ranges (DECISIONS §6, owner-approved).
- **v1.60.0 (2026-10-05):** Lore changes: the narrator may change any fact of the lore for this campaign (`Campus_State.Lore_changes`), kept by the engine only with a Cause and only when the reply shows it; printed over every lore entry with that name; Journal Undo; Location_changes folded in.
- **v1.61.0 (2026-10-05):** Memory batch 1: open mysteries' clues outlive solved ones and leave into an archive, Journal repeats dropped and routine lines leave first, short records for forgotten Extras, the MVU hook reads the floor being replayed (and warns of a far snapshot), VectFox dates with the year and turning points, long-chat guidance.
- **v1.61.1 (2026-10-05):** Memory batch 2: `audit_chat.py --memory` (what each memory list kept and lost, 501 tokens, state size and file projection) and `--vectfox` (ghost events, dates without a year, near-duplicates), `tools/memory_lists.cjs`, `tests/stress/memory_soak.cjs`, the memory baseline.
- **v1.62.0 (2026-10-05):** Memory batch 3: pinned (`!`) lines never leave the narrator's view (Journal → `_Kept_from_earlier`, 20; Knows / Known_facts: five per character; engine landmarks pinned), open matters go in Hooks (M4).
- **v1.63.0 (2026-10-05):** Memory batch 4: folds ("Summaryception mini"): Journal lines → Chronicle L1/L2/L3 (`_Chronicle`), Knows / Known_facts → one fold line per character, written by the update model through the `fold` rule card (`/Fold`), plain fold after 8 replies; nothing dropped before it is folded.
- **v1.64.0 (2026-10-05):** Memory batch 5: recall by person and place (older Journal lines that name someone on a full sheet, 3, or the place, 2), archive 240 lines.
- **v1.65.0 (2026-10-05):** Memory batch 6: `<current_state>` by relevance (`$ui.now.focus`; clue threads, Extras, NPC_status, New_relations, Secrets_revealed in full only when they touch the scene, the rest `…_not_shown` index lines; −35% of 501 on a mature state).
- **v1.66.0 (2026-10-05):** Memory batch 7: VectFox from the card's side: a hidden scene marker on player messages (who, place, timeline) for VectFox's query, timeline numbers that void rewound memories, repeated meetings as routine, the reply gist (`_Recent_story`), VectFox settings for large collections.
- **v1.67.0 (2026-10-05):** Memory batch 9: the card plays in MVU's extra-model mode by default (507 `更新方式 = 额外模型解析`); one-call mode stays available (PLAYER_GUIDE §8).
- **v1.67.1 (2026-10-05):** Playtest fix: in extra-model mode the story model writes no `<UpdateVariable>` of its own (504).
- **v1.67.2 (2026-10-06):** Playtest fix: the card description asks for an update block only with `<update_format>`; 503 takes the old time from the state and treats `<VectFoxMemory>` as the past.
- **v1.68.0 (2026-10-20):** The preset is rebuilt on Realistic Frankenstein 2.2.1.3 (Realistic Gemini BOLT) as it ships, with a closed list of card deviations, the owner's toggles and three Eldrasil prompts (Player Input Authority, Output language, Ordinary Turns); no ambience cue names a smell.
- **v1.69.0 (2026-10-20):** Back to one-call MVU mode (507 `更新方式 = 随AI输出`): one model per turn writes the story and the update; extra-model parsing stays optional.
- **v1.70.0 (2026-10-20):** Scene cards under the newest reply: full portrait, true thoughts (from the preset's `<npc_thoughts>` block) and bond meters for each person present; the bracelet's portrait strip steps aside.
- **v1.71.0 (2026-10-20):** Scene card actions (practice partners, Rank 4 tracks, invitations, gifts from the Bag, favours, Rank 5–7 perks, amends; drafts only); the other dorms leave the campus map except on their Dorm Day or inside; a brass rule under the bracelet.
- **v1.72.0 (2026-10-21):** Special days: each NPC's own mood on their birthday, canon calendar days (Remembrance Day, Star Night, the Circus…) and personal dates with {{user}} a year on (Imprints, the day they met, Rank 8), the last known only to the narrator and the NPC.
- **v1.73.0 (2026-10-21):** Time apart and asking after: a character back after a week or more carries the gap; one who heard of {{user}}'s plan may ask how it went once its day has passed.
