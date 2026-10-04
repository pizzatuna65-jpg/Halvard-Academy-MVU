# CHANGELOG — Eldrasil / Halvard Academy MVU card

Newest first. Details are kept for about the five newest releases; the one-line index of every release is at the bottom. Older
details: `git show 80f75c6:CHANGELOG.md` (1.52.0, 1.52.1), `git show f96b93e:CHANGELOG.md` (1.51.0), `git show 74e6e62:CHANGELOG.md` (1.50.0), `git show 4a811c0:CHANGELOG.md` (1.49.0), `git show 533d61b:CHANGELOG.md` (1.48.0), `git show c544d3e:CHANGELOG.md` (1.47.0), `git show 9359ed9:CHANGELOG.md` (1.46.0), `git show a13acc7:CHANGELOG.md` (1.45.0), `git show 95926a8:CHANGELOG.md` (1.44.0), `git show 8cb78b2:CHANGELOG.md` (1.43.0), `git show ee2fbce:CHANGELOG.md` (1.42.0), `git show fc49cdf:CHANGELOG.md` (1.41.0), `git show 7bd6a98:CHANGELOG.md` (1.40.0), `git show 9d4bfa2:CHANGELOG.md` (1.39.0), `git show 2c8c928~1:CHANGELOG.md` (1.38.0), `git show 325dfa2:CHANGELOG.md` (1.37.3), `git show c832a27:CHANGELOG.md` (1.37.2), `git show 3b49f19:CHANGELOG.md` (1.37.1), `git show 0d1de2e:CHANGELOG.md` (1.37.0), `git show 951f674:CHANGELOG.md` (1.35.2 to 1.36.0), `git show 13c8d74:CHANGELOG.md` (1.34.1 to 1.35.1), `git show 48541e2:CHANGELOG.md` (1.30.6 to 1.32.0), `git show 28bd235:CHANGELOG.md` (1.30.5), `git show 2224f00:CHANGELOG.md` (1.30.4), `git show 8f1dfc2:CHANGELOG.md` (1.30.3), `git show 90e8c43:CHANGELOG.md` (1.30.2), `git show b14dcc8:CHANGELOG.md` (1.30.1), `git show eb07f45:CHANGELOG.md` (1.30.0), `git show dd4bdae:CHANGELOG.md` (1.29.0), `git show b4cc575:CHANGELOG.md` (1.28.0), `git show 3262b84:CHANGELOG.md` (1.27.0), `git show 3294385:CHANGELOG.md` (1.25.0), `git show b4b65d2:CHANGELOG.md` (1.24.3), `git show 24b636e:CHANGELOG.md` (1.19.0 to 1.24.2) and `git show b62d182:CHANGELOG.md` (earlier).

## v1.56.0 — Narrator-load batch 5: one place per fact (2026-10-04)

Batch 5 of `audit/AUDIT_2026-10-04_1_beban_narator.md` §6 (U2). The owner approved the two changes to decisions on 2026-10-04.
Save fixture v1.55.0.
- **One block per person (DECISIONS §6, changed with approval).** The engine still makes each present character's lines (mood, bond,
  Trust, Tension, recent moments, teasing, rank cue, Rank 4 company, gift). They are now one list, `$ui.now.people[id]`, printed in
  that character's Cast Sheet as "Now with {{user}}". They were ±8 separate `<now>` lines per person. `<now>` prints a block only for
  someone present without a sheet. The decision now reads "505 and the Cast Sheet print them".
- **Numbers once.** Rank, Trust and Tension numbers appear only in `<current_state>`. The sheet's invariants and the block use band
  words ("Bond with {{user}}: neutral trust, calm tension"), and "Stage with {{user}}" no longer carries the rank. The bands and their
  effects (DECISIONS §6 Trust/Tension) are unchanged.
- **Recent: 3 moments, effects in words (`bond_rules.json` `recent.now`, the 1.4.4 owner value, 5 → 3).** "Rank 2 → 3, XP +6,
  Trust +3" now reads "grew closer, trust grew" (`fxWords`, shared through `AGE_JS`). Defining moments read the same way. The dossier
  keeps 10 moments with their numbers.
- **Said once:**
  - the mood tail ("Mood colours their manner…") is no longer repeated per person;
  - "deflects in character (pushing too soon adds Tension)" is said once, in 504;
  - the ban on announcing ranks or perks is said once, in 504 (it left 502);
  - "never who they are" is only in 504 (the Cast Sheet head explains the block instead);
  - the shared tiers read "the highest tier and everything before";
  - 506 lists prices, and how to report a purchase is 502's;
  - the area place names are no longer listed in 502 (the lore index and "Walks from here" name them).
  The rule cards that pointed to `<now>` for these lines now point to the Cast Sheet.
- **Fix (DECISIONS §1 D2):** entry 512 (the alcohol rule, 1.54.0) was untagged and is now `[mvu_plot]`.
- **Measured** with three bonded characters at the Canteen (1.55.0 engine and card against 1.56.0): `<now>` 1,696 → 631, Cast Sheet
  6,223 → 6,874, 506 881 → 774, 502/504 about level; **−524 tokens a turn** (the audit expected −400 to −700).
- **Tests:** new `test_narrator_batch5_v1560`. The Cast Sheet record was renewed (`tests/fixtures/cast_1560.json`; 1.47.0's record
  proved the 1.48.0 split, and this text changed on purpose). Older suites that read the per-person `<now>` lines or the rank in the
  stage line now read the person's block (apology, bonds, castsheet, greyarea, memory, recent, rules, tension, trust, world, the five
  voice suites, cohort2: its sheet budget went from 3.6k to 3.8k with the block, batch5_shops, audit_batch7). `test_saves` (new 1.55.0
  fixture) passes.
- **To check live** (TEST_CHECKLIST 1.56.0): characters still keep to what they share and how they carry Trust and Tension with the
  numbers gone from their sheets; nobody mentions a rank or a number in prose.

## v1.55.0 — Narrator-load batch 4: the remaining rule cards and a tighter 502 core (2026-10-04)

Batch 4 of `audit/AUDIT_2026-10-04_1_beban_narator.md` §6 (U1 stage 2). Save fixture v1.54.0.
- **Eleven more cards** in `data/rule_cards.json`, moved verbatim from 502, each with its trigger in engine `ruleCards`:
  - Interactions: anyone here, someone mentioned, or a letter or message;
  - Trust/Judging/Tension and Imprints: someone {{user}} has a bond with is here; Trust/Tension also on words such as a broken
    promise, betrayal, a secret, a lie or an apology;
  - the Old Hut custom: at the Old Hut;
  - Training and Practice: a practice place listed in `<now>`, or training talk;
  - the Arbiter Stone's dorm rule: not sorted yet, or Entrance morning;
  - Combat_role: empty;
  - favours: one pending, or offered today;
  - Notices: at the Notice Board;
  - the Vigil's effect: in the Bag or active.
- **502 keeps a core line for each.** Interactions keeps its rank add-ons (Rank 5 gift, introduction, vouch) in 502 behind their
  rank gates. When nobody {{user}} knows is here, Trust and Tension are summed up in two lines.
- **Tighter core:**
  - the restful-place list is gone (one clause stays; `<now>` gives the rate where {{user}} is);
  - the Council meeting time is said once, in 504 (502 had it twice);
  - the Romance line stays in the core, because it is about 40 tokens and depends on the player's setting.
- **Measured** on 502 + 511 against 1.53.1 (before the cards): alone **−2,460 to −2,620 tokens per turn** (about 30% of 502); with a
  bonded character here −1,130 (the bond cards are 1,330 tokens).
- **Tests:** new `test_narrator_batch4_v1550`. Nine older suites that read 502's text now also read the cards (`test_apology_v140`,
  `test_greyarea_v144`, `test_newbond_v1611`, `test_playtest_v137`, `test_recent_v145`, `test_tension_v138`, `test_trust_v143`,
  `test_narrator_batch3_v1540`; `test_split_v146` led to the Note wording in the Interactions core). Every suite that reads 502 passes,
  and so does `test_saves` (new 1.54.0 fixture).
- **To check live** (TEST_CHECKLIST 1.55.0): with a friend present the trust scale and Interactions rules show and Trust drops are
  still written; alone, a Tension rise is still reported from the core line.

## v1.54.0 — Narrator-load batch 3: situational rule cards, stage 1 (2026-10-04)

Batch 3 of `audit/AUDIT_2026-10-04_1_beban_narator.md` §6 (U1 stage 1). Save fixture v1.53.1.
- 502 keeps one core line per topic (path, data shape, main ban). The full rules of Letters, Projects, Competition, Exams, Tutoring,
  Trip, Pacts and the first pact are moved verbatim to `data/rule_cards.json`. The engine (`ruleCards`, `$ui.now.rules`) lists a card
  while its topic applies: from the state, the calendar (7 days ahead), the place, or a word in the last reply or the player's message.
  The new entry 511 (`[mvu_update]`, depth 1, before `<now>`) prints the listed cards. If the engine has made no list yet, it prints
  every card.
- The alcohol rule is now keyword entry 512, plus one CORE FACTS line in the World Index.
- Measured on 502 + 511: −860 tokens per turn in an ordinary scene (save, one card), −800 on a new chat.
- Features cost (`feature_cost.py`) counts only the always-on core line; the else-branch of a gate now counts against its feature.
- Fixed tests that 1.53.0 had broken without notice (`test_newbond_v1611`, `test_trust_v143`, `test_tokens_v1110`: rule wording).
- **Tests:** new `test_narrator_batch3_v1540` (24 checks). `test_feature_batch1_v1490`, `test_grades_v1150`, `test_narrator_batch1_v1530`,
  `test_world_v110` and `test_saves` were updated or pass, along with every suite that reads 502.
- **To check live:** a card shows when its topic comes up (Mail Tower, a Project, exam week); a letter that arrives unexpectedly is
  still recorded from the core line.

## v1.53.1 — Narrator-load batch 2: the mechanics audit and its baseline (2026-10-04)

Batch 2 of `audit/AUDIT_2026-10-04_1_beban_narator.md` §6 (U10). Tools only: the card's rules, engine and UI are unchanged (the version
is bumped by the release rule). Save fixture v1.53.0.
- **`tools/audit_chat.py --mechanics`** (with `--no-drift` to skip the character-drift checks). It reports per reply with an update
  block: operations, lines, about-tokens, Analysis lines, and engine work the narrator did itself. That covers a Rank, XP or bond record
  written, sums in the Analysis, stamina taken for the weather, the calendar turned by hand, a legacy reputation entry, a "_" or "$"
  path, and Points changed next to a purchase.
- **`tools/replay_chat.cjs`** replays every block through the current engine, from the first state the chat stored, or else the card's
  starting state. It reads blocks the way MVU does, with the engine's recovery for malformed ones, the stray-path fix, and "_" paths
  dropped. It returns what the engine corrected: blocks repaired or unreadable, lists moved from /Player, changes the schema dropped,
  `_Log` corrections (time, a new bond's Trust, reverted writes, unknown names, refused reports), reminders, and the minutes each reply
  moved. It costs 0 prompt tokens.
- **Baseline** (`audit/AUDIT_2026-10-04_2_baseline_mekanik.md`, untracked like the audit). The owner's raw chats 2026-09-30 (rules 1.30.0)
  and 2026-10-01 (1.34.2) give 49 blocks, all on day 1:
  - blocks average 4.0 operations, 17.6 lines and ±233 tokens (max 487);
  - `<Analysis>` averages 5.2 lines and is **34%** of the block (±79 tokens);
  - stamina was taken for the weather in **7 of 13** replies of the rainy chat (T5);
  - a whole bond record was inserted 4 times, and the engine replaced the written Trust each time;
  - the engine repaired 8 malformed blocks (7 of 13 under 1.30.0, 1 of 36 under 1.34.2) and moved 2 lists from /Player.
  1.53.0 targets the first four, so measure again on a new chat.
- **Tests:** new `test_mechanics_audit_v1531` (a made-up chat: sizes, the engine-work flags, a repaired block, a stray path, a reverted
  Rank, a replaced Trust). `test_audit_tool` and `test_saves` (new 1.53.0 fixture) pass.
- **To check live:** nothing. Play on 1.53.x, export the chat, and run the tool again for the after numbers.

## v1.53.0 — Narrator-load batch 1: quick fixes (2026-10-04)

Batch 1 of `audit/AUDIT_2026-10-04_1_beban_narator.md` §6 (T6, U4, U5, U6, U7, T10, Journal dates). No feature was switched off and no
balance number changed. Save fixture v1.52.2.
- **T6, the first pact (bug since 1.31.0).** The "first pact in play" rule now shows to a student with Occult magic who has not made a
  pact in play yet (`$eng.pactPlay`), pact or no pact. Before, it showed only to players who already had a pact. The summon and
  dismiss rules still show only when `Magic.Pacts` has an entry.
- **U4, 503.** The example uses a named deed (`student_notice_help`) instead of the legacy form, adds a fact to a bond
  (`/Bonds/Irene/Known_facts/-`) instead of inserting a whole record with Rank, and writes a Commitment with a plain date ("tomorrow
  16:00"). `<Analysis>` has at most 3 lines: Time | Location, Present, Reports. The "Points: current + delta" line and the Vitals line
  are gone: the engine does the sums. The Time line keeps its full date, because VectFox's cleaning pattern reads it for EventBase's
  in-world time (`docs/ECOSYSTEM.md`, `test_vectfox_v1113`).
- **U5, plain words, engine-made dates.** 502 asks only for the new Day and Time; the engine turns the week, month and year (Week
  and Month only for a skip of more than a week). Due, Until and Heals_by may be written plainly. New: after the engine pins such a
  date (as it has since 1.44.0), it writes it back once as the calendar date (`absWhen`: "tomorrow after class" becomes "M2 W2 Tue
  after class"). This covers Commitments, Notices, Hooks, Next plans, Projects and injuries, so no stale "tomorrow" stays in the state.
  The text is kept as written if the rewrite would not read back to the same minute. Bonds: a record starts by itself when a roster
  character is first in Scene.Present; 502 says to add to it field by field, never to insert a whole record. Location: short names are
  fine (the engine matches them to the map).
- **U6, one engine list.** One line in 502 lists what the engine does and the narrator never writes: technique mana and regeneration;
  stamina from walks, weather and conditions (missing before, T5: the playtest's double Chilled penalty); rest and restful places;
  weather conditions; Mana_max / Stamina_max; proficiency and craft results; payouts, purchases, sales, tutoring pay; bond XP, Rank and
  Trust rises; quiet-day Tension easing; marks, attendance, reputation levels; Dove decay; the calendar. Each item is gated by its
  feature. About twelve scattered "never add it yourself" clauses are gone.
- **U7, reports the engine can take.** `data/reputation.json` `also`: a report to staff brings `helped_staff_report`, a report to the
  Doves `helped_doves_report`. The engine adds the second side unless it was reported too, so it is counted once either way. A remedial
  is attended when {{user}} is at its place (Where; new remedials carry "Main Library", the Saturday Study Hall's place, which is also
  the fallback for older ones) within three hours of its start. The engine removes the Commitment, and the F counts as a D as before.
  The narrator may still remove it.
- **T10.** The empty `on('class')` gate in 504 is gone. The narration half of 502's "Mood, sleep and wind" (moods colour without
  replacing personality, a collapsed {{user}} cannot interact, NPC magic follows the weather) moved to 504's weather lines. The request
  for an Extras record ("Seen before, with no Extras record yet…") moved from the Cast Sheet tail, tagged `[mvu_plot]`, to `<now>`,
  which has no tag, so an update model in extra-model mode sees it too (U9 preparation).
- **Journal dates** in `<now>` name each date once.
- **Not in this batch:** alcohol moves to keyword lore in batch 3 (situational rule cards). 502 is about the same size as before (the
  engine list replaces the scattered clauses). The token savings are U1–U3, batches 3–6.
- **Tests:** new `test_narrator_batch1_v1530` (24 checks). `test_extras_v161` (request now in `<now>`) and `test_audit_batch7_v1480`
  (a Journal with a repeated date reads shorter by design) were updated. `test_saves` (new 1.52.2 fixture), `test_grades_v1150`,
  `test_pacts_v132`, `test_vectfox_v1113`, `test_playtest_v1301`, the audit and feature batch suites and every suite touching dates,
  deeds, Extras or bond facts pass.
- **To check live** (TEST_CHECKLIST 1.53.0): the narrator writes only Day and Time across midnight; a plain Due is shown as a date
  next turn; `insert /Bonds/<name>/Known_facts/-` on a first meeting is accepted by real MVU (the harness copies MVU creating the
  missing container); Analysis stays at 3 lines and no stamina is taken for Chilled; an Occult student is offered the first pact at
  the Spirit Path.
- **To confirm with the owner:** the remedial's place. The lore names no room for make-up sessions, so the engine uses the Main
  Library (the Saturday Study Hall slot the session replaces). A narrator who plays it elsewhere still removes it by hand.

## v1.52.2 — Preset audit 2, tier 1: one home per rule, a lighter CoT (2026-10-04)

Owner-approved `planning/DRAFT_preset_audit_2.md` (tier 1; deleted, `git show bdcc889:planning/DRAFT_preset_audit_2.md`). Preset only: the card's rules, engine and UI are
unchanged. Save fixture v1.52.1. Measured as SillyTavern sends it ({{user}} replaced before `{{// }}` notes are removed, macros.js),
the enabled preset prompts went from **17,245 to 15,444 tokens (−1,801, 10%)**, the depth-0 block after the chat from **5,447 to
4,435 (−1,012, 19%)**. No toggle changed: owner's 4–7 paragraphs, Embellish, Hybrid POV, Internal Thoughts and Player Input
Authority stay; adult toggles stay opt-in; Monomania and its gate stay ON (1.11.2 D1); Anti-Comparative and Anti-Therapist untouched.
- **BOLT CoT (2,511 → 1,812).** It points to the rules instead of restating them: task 1 no longer writes an example each turn,
  task 4 applies `<prose_rules>` "without listing them" (it used to have the model list them in its reasoning every turn), task 5
  points to `<npc_voice>` and `<human_vocal_limits>` instead of copying ±420 tokens of them, task 6's "NPC anti-repeat rule" (a name
  nothing defines) is now "No echoes", task 8 drops the `<colored_dialogue>` check (that toggle stays OFF with this card, 1.37.0),
  task 9 says the two opt-in adult modes in one sentence. Tasks 0, 2, 7, 10 and rules A–D are unchanged.
- **Cosmos last-mile gates** (Contrast 282 → 121, Vocation 250 → 161): short reminders at depth 0; their killswitches keep every
  form, exception and example.
- **One rule, one home:** full commitment ("hovering hands") in `<realistic_bold_characters>` (dropped from the instinct gate and
  BOLT); the card outranking style rules in `<card_fidelity>` (dropped from `<npc_voice>`); distinct voices as one `<npc_voice>` line
  (three bullets and `<scene_engine>`'s idiolect sentence); em dashes in `<banned_constructs>`; narration flow in `<syntax_flow>`,
  negation-as-description in `<banned_constructs>`, micro-tells in `<do_not_repeat_descriptions>` (all dropped from Cinematic
  Realism); `<npc_voice>` loses a narration rule that sat in its dialogue-only tag and a line repeating METHOD; jargon in Monomania
  (dropped from Anti-Omniscient); "never draft in reasoning" in BOLT rule B (dropped from Main); two craft lines of the jailbreak that
  `<scene_engine>` states word for word.
- **Internal Thoughts (489 → 363):** our own 1.37.3 text, the same five rules in fewer words.
- **Measuring.** `tests/token_audit.cjs` stripped `{{// }}` notes before replacing `{{user}}`, so a note holding `{{user}}` left a
  fragment in the count: the preset was reported ±630 tokens too large (17,877). It now follows ST's order.
- **Tests:** `test_preset` (one pin moved to Card Fidelity; new: no rule lists or colour check in BOLT, short gates pointing to their
  killswitches, one home per rule, a size budget of 15,600), `test_npc_thoughts_v1373`, `test_saves` (new 1.52.1 fixture), `qa_static`,
  `test_tokens_v1110` pass; the preset builds identically twice.
- **To check live** (TEST_CHECKLIST 1.52.2): shorter reasoning still opening with "Now:"; "not X but Y" and trade talk not rising
  with the short gates; voices still distinct and NPCs still committing; the thoughts block still before `<UpdateVariable>`.
- **Next (FUTURE_PLANS):** tier 2 (±900–1,000 more, trims unique upstream text) after the live check.

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
