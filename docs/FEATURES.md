# Feature index: what the card does and where it lives

One line per feature: what it does, then where its code and data are. Read it before proposing, recommending or building a feature:
most "new" ideas already exist, at least in part (memory `reuse-existing-systems`). Workflows (build, release, lore, NPCs, preset,
tests) and the engine/UI/state maps: `docs/INDEX.md`. Ideas not built yet: `planning/FUTURE_PLANS.md`.

**Reading it cheaply.** `Grep "^## " docs/FEATURES.md` lists the sections; read only the one you need, or grep two or three
keywords of an idea. Read the whole file only to recommend features. **Keep it current:** a release that adds or changes a feature
edits its line here (CLAUDE.md "Every release").

**Notation.** A bare `symbol` is in the engine `src/scripts/engine.template.js` (Grep `function name` / `const NAME`; inner helpers
by name). `ui:` `src/scripts/ui.template.js` · `p10:`–`p50:` `src/ui/parts/10_people.js`, `20_map.js`, `30_notebook.js`,
`40_activities.js`, `50_scene.js` · `sb:` `src/ui/statusbar.template.html` · `mg:` `src/scripts/mood_gifts.js` · `sh:`
`src/scripts/shared.js` · `D/` `data/` · `WB5xx` custom entry in `src/worldbook/custom/` (502 rules, 505 `<now>`, 509 sheet:
INDEX §4) · `lore N` generated lore entry uid · `T:` `tests/test_<name>.cjs` · `[f:id]` Features toggle in `D/features.json` ·
`(1.xx)` release that added it (CHANGELOG index).

## 1. Card package, install, MVU

- **Self-installing lorebook** (1.3.5–1.3.6): installs or, after asking, updates its own worldbook; a missing one is explained on the bracelet with an Import Card Lore button. `ui:ensureLorebook`, `ui:lorebookMissing`.
- **Old-lorebook warning**: the first reply of a new chat warns when ST holds an older lorebook. `stepFeatures`.
- **MVU state**: Zod schema `src/scripts/schema.js` (every field declared; unknown keys are stripped), starting state `WB500` `[initvar]`, MVU and mvu_zod pinned to tested commits (`src/scripts/mvu_loader.js`, the `schema.js` import).
- **Engine pipeline**: `runEngine` runs `ENGINE_STEPS` on every update; deterministic, seeded draws only (`sh:roll100`, `sh:pickOf`, `sh:rollInt`, `sh:rollTable`); save migrations once per version in `stepMigrate`; a failed run rolls back and says so (MVU handler at the end of the engine). T:engine_steps_v1200, T:saves.
- **MVU update mode** (1.69.0): one model per turn by default (`WB507` `更新方式 = 随AI输出`); extra-model parsing optional (entry tags in `tools/gen_mvu_entries.py`, `merge_lorebooks.py`). DECISIONS §9, PLAYER_GUIDE §8. T:narrator_batch7_v1580.
- **Regexes** (`src/regex/index.json`): update block folded, hidden while streaming, stripped from the prompt; status placeholder; bracelet display; far-chat trim; dialogue-colour tags; scene marker hide/strip.
- **TEST cards** (`dist/test/`): every bond at Rank 7; a Year 2 start; lore at depth. `tools/build_test_card*.py`.
- **Downloads**: everything the owner imports is in `dist/` (card, preset, VectFox files). DECISIONS §10.

## 2. Student Builder and Student file

- **Student Builder** (7 steps: Start, Identity, Power, Techniques, Pacts, Hidden magic, Review): `ui:renderBuilder`, `ui:bStart`…`ui:bReview`, `ui:validate`, `ui:buildOps`; sample students `ui:TEMPLATES` (incl. "Charles Chevalier", 1.30.4). T:builder.
- **Identity**: pronouns (list or own), personality, optional birthday on the academy calendar (the day plays as {{user}}'s birthday: `WB508`, `stepTime`).
- **Power**: mana capacity slider 50–1,000+ (not a rank; nobody can read it); specialties with own subtypes and a forbidden flag; Dominant type → dorm by the Arbiter Stone (DECISIONS §2).
- **Techniques**: fixed costs per use / sustained (upkeep per minute) / hybrid, charged by the engine; "In the wind" behaviour for custom magic (`D/wind_casting.json`). `ui:techForm`, `ui:techErrors`, `ui:costLine`.
- **Pacts** (1.3.2): spirit (lawful) or forbidden kinds (demon, monster by grade, animal, person); with {{user}} only while summoned or living by the terms; abilities with strength tiers → a Summon technique, one technique per ability, Channel at the two top tiers. `ui:bPacts`, `ui:pactTechs`, `ui:PACT_KINDS`. T:pacts_v132.
- **Hidden magic**: true magic filled in like a technique, cover story, concealment (§5 Dove attention). `ui:bHidden`.
- **Edit student file** later through hidden player-tool messages; read-only fields, Builder record restore, Mana_max/Stamina_max revert. `ui:writeToolMessage`, `ui:liftReadonly`, `ui:diffOps`, `stepGuards`. DECISIONS §2 "Player tools".
- **Student file tabs**: Overview (reputation and what it means, picture), Body (injuries, conditions, training), Studies (expected marks, proficiency hexagon, mastery perks), Magic, Hidden, Gifts & perks, Log (`_Log`), Settings (§15). `ui:renderProfile`, `ui:pOverview`, `ui:pBody`, `ui:pStudies`, `ui:pProficiency`, `ui:pMagic`, `ui:pHidden`, `ui:pPerks`, `ui:pLog`.
- **Picture**: upload saved in ST user images (`ui:uploadPortrait`); the persona image when none is uploaded (`ui:personaFile`, 1.30.5).

## 3. Time, calendar, school year

- **Clock** follows what happens (dialogue and travel); a Day one or two back is a slip, not a new day; time-jump toast. `stepTime`, `parseWhen`, `whenText`. T:batch3_time_magic.
- **Calendar**: 12 months × 4 weeks, 44 events, each with a day plan and times; `World._Event_today`; engine, UI and lore 131/134 all read `D/calendar.json` (`events`, `months`, `timetable`, `seasons`, `periods`, `exam_months`). Calendar view `p30:nbPlanner`, `p30:datedItems`. T:calendar_v1320, T:calendar_state_v1190.
- **Timetable and periods**: `sh:PERIODS`, `periodOf`, `TIMETABLE`; "no classes today" (1.30.2).
- **Curfew** 20:00 with festival exceptions; the Thinning lockdown (M7), breaks; a school rule with consequences only when caught (1.35.2); feast nights move it. `curfewOf`. DECISIONS §2 "Curfew".
- **Away from Halvard** (1.42.0, 1.47.0): `areaNow` (the area {{user}} is in) and `awayIn` (Trip, an outside area, off the grounds on an "away" day; every pause uses it); a stale Trip ends in `stepTime` (`$eng.trip`); 502 Trip rule. T:audit_batch1_v1420.
- **Next chip**: the next class, plan item or curfew. `nextUp`, `stepUi`; `sb:` chip "Next".
- **Agenda** (1.44.0): one status, reminder and coming-up feed for Commitments, Hooks, Next plans, Projects, Notices and the letter home; `<now>` "Coming up" / "Due soon"; chips Overdue / Due today. `stepAgenda` (`anchorWhen`, `agendaState`, `agendaWhen` = `$eng.agenda.when`, `absWhen`) → `$ui.agenda`; `p30:agendaOf`. T:batch6_v1440.
- **Classes and teachers** (1.33.0): Practical Magic by combat role (assigned at the first class), a teacher per subject and year (`tools/curate_data.py` `teaches`: roster lines "History Y2"), free periods when a teacher cannot come. `D/free_periods.json`; `teacherOf`, `classRole`, `freeWhy` → `$ui.free`, `sh:classRoleOf`; 505 class line; lore 10, 30, 131. T:classes_v1330.
- **Class-aware presence** [f:class]: students are in class during lessons; `<now>` names {{user}}'s class, teacher, classmates and floor. `classLineAt`, `stepHere`.
- **Attendance** [f:attendance] (1.10.0): a skipped class −2 Academy and the teacher reacts; a clean week +2; Saturday club time +1 Student; excused cases; classes held per subject. `stepSchoolWeek`. T:batch1_fp7_v1100.
- **Weekly recap** [f:recap]: one Journal line at the end of a week. `stepSchoolWeek`.
- **Small scenes** [f:small_scenes]: at most four people with {{user}} on an ordinary day. `stepSchoolWeek` (tuning `scene_cap`).
- **Saturdays**: Study Hall in the morning, clubs in the afternoon; Student Council meets 10:00–12:00 in the Chamber; Council election week M10 W3 with Saturday voting and a Year 2 handover (1.7.8, 1.34.0); the Council placed like a club (1.74.0). `stepTime`, `Campus_State.Council`, `p40:acClubs`. T:council_v178, T:cohort3_v1340.
- **Entrance Event**: speeches, Stone sorting, vest handover, seating, the two-newcomer/one-senior tour (`Campus_State.Entrance_tour`), club booths through week 1; from Year 2 {{user}} guides two first-years (1.7.5, 1.9.2). `stepTime`, `ENTR_BACK`, `stepVisits`. T:batch2_entrance, T:year2start_v175.
- **Dorm Days** on Sundays, Final Ranking Monday, longer Academy Trip, Kingdom Competition in the capital (1.32.0): calendar data.
- **New school year** (1.7.4): everyone moves up a year and ages; last year's competition record cleared; a new cohort arrives (Year 2: 6, Year 3: 7; `D/cohorts.json`), hidden before their year. `stepNewYear`. T:year2_v174, T:cohort2_v170, T:cohort3_v1340.
- **Graduation** (1.7.4, 1.7.6, 1.14.1): third-years leave the morning after M11 W4 Sunday (winter farewell market); their rewards end; the story can keep one on. `stepGraduation`, `stepGraduateRewards`, `Campus_State.Graduated`. T:gradperks_v176.
- **Year labels**: Year 1 dates get "Y1" at the rollover; the Journal groups by year from Year 2. `stepCommit`.

## 4. Studies, grades, school money

- **Study and exams** [f:study] (1.10.1, 1.15.0, 1.30.0): preparation from the Library, Study Rooms, Archive, study sessions, Study Hall and assignments on time; marks A–F from preparation, proficiency and attendance plus a seeded exam-day roll; midterms on the Friday of exam week, finals on Results day; Studies tab shows the expected mark. `stepSchoolWeek` (`markUp`, `GRADE_W`, `EXAM_DAY`, `MARKS`, per-subject `held`). T:grades_v1150, T:mastery_v1300.
- **What marks do**: an A pays for tutoring (`TUTOR_PAY`, two sessions a week) and +10 Fortune in its field; A/B warms the teacher; an F brings a Saturday remedial (attending turns it into a D; `sh:councilRemedial`; remedial by presence at the top of `stepRecords`); marks set dorm rank and Academy standing.
- **Dorm rank and payout**: rank recalculated from marks in M5 and M11 (one band a day); monthly Points payout by rank; Academy +5 monthly bonus; Academy −5 probation. `stepSchoolWeek`, `stepPayout` (`PAYOUT`).
- **Group assignments** (1.49.0): a Project of Kind assignment gives study time and a study interaction per partner; overdue raises partners' Tension. `stepPromises` (`GROUP_LATE_TENSION`). T:feature_batch1_v1490.

## 5. Body, magic, health

- **HP is injury**: every loss has a named injury; one blow ≤40 HP unless `Lethal_flag`; death; clamps; nothing heals off-screen; Heals_by reminder. `stepVitals`, `stepRecords`.
- **Mana and techniques**: passive regen Mana_max/360 a minute; costs from the technique list; sustained effects drain per minute and end when dry; a summoned partner costs upkeep; the engine keeps start and end in step. `stepMagic`. T:batch4_seasons_mana.
- **First pact** (1.31.0, 1.53.0): a first lesser Spirit Pact in play; the first-pact rule reaches Occult students (`_pact1`, `$eng.pactPlay`); rule cards `pacts`, `first_pact`. T:narrator_batch1_v1530.
- **Wind and casting**: strong wind feeds, scatters or ignores magic by subtype; a wind-blocking barrier shelters casting. `mg:windMultiplier`, `D/wind_casting.json`.
- **Rest and sleep**: sleep and rest recover; a skipped night counts as sleep; restful places multiply rest (`D/restore_places.json`, `restMult` → `$ui.rest`, 1.31.0); sleep debt from staying up midnight–06:00 and The Vigil (48 h) in `mg:updateSleep`; tired training gives half, exhausted stops. `stepRest`.
- **Conditions** (weather Full): Soaked, Chilled, Overheated, Head cold (more in the flu months); cleared by an hour indoors, a hot bath or drink, dry clothes; `/Exposure` sets one at once; crafted Consumables heal. `stepExposure`, `fluOn`, `COND`, `EXPO`. T:world_v110.
- **Gear and used items**: weather gear works from the Bag by name (umbrella, oilskin, scarf and mittens, winter cloak, sun hat); `/Consumables` apply effects (clear conditions, stamina, timed protection, cold remedy). `gearOf`, `GEAR`, `SHOP_FX`, `stepRest`; wording `tools/common.py` `effect_text`. T:batch5_shops.
- **Fortune roll** [f:fortune] (1.9.8): a seeded d100 per reply, the same on every swipe, for important uncertain attempts; modifiers for state, situation, fitting magic, proficiency rank and an A in the field; Rank 10 suspension. `stepFortune`; tuning `fortune_band`. T:fortune_v198.
- **Hidden magic and Dove attention**: use where it can be noticed raises attention; a quiet week −1; fog hides it better; stages on the bracelet ("Doves: …"); safe everyday casting never triggers punishment (1.9.3); Points without Transactions checked (H3). `stepHidden`, `ui:pHidden`. Separate from Doves reputation.
- **Battle tracking** [f:battle]: opponents' HP, stamina and status; the "In battle" chip opens the Battle panel. `Battle.Combatants`, `p40:PANELS.battle`.

## 6. Weather, ambience, happenings

- **Weather** [f:weather Off/Flavor/Full]: seasons (spring M1–3 … winter M10–12), sky rolled for morning/afternoon/night with transitions, wind, °C, rare events (lightning storm, hail, blizzard, dense fog, heatwave); calm on calendar `fair` days. `stepWeather`, `wxRollDay`, `wxDay`, `wxText`, `WX_BASE`. T:batch4_seasons_mana.
- **Forecast**: the Divination Society posts tomorrow on the Notice Board at 07:00, right about 3 in 4 (`FC_TRUE`). `wxForecast`, `p30:forecastCard`.
- **Weather in other systems**: bond XP indoors in the rain or in fine weather (`D/bond_rules.json` `weather_xp`), sleep quality, outdoor people and clubs move indoors, fog hides hidden magic, gale and wind chill cost stamina.
- **Ambience** [f:ambience Off/Texture/Full] (1.16.0): how crowded and lit a place is (sun by month), one sensory cue on arrival or a new hour (never a smell, 1.68.0), small seeded beats, very rarely one of 17 ghost stories. `stepAmbience`; `D/ambience.json` (`cats`, `cues`, `beats`, `uncanny`, `sun`). T:ambience_v1160.
- **Overheard lore** (1.24.0): a beat lets {{user}} overhear a place's lore or rumour; the Map shows lore only once heard (or named in the narration, `stepUi` → `$ui.lore`). `hearLore`, `PLACE_LORE`, `D/ambience.json` `lore_places`. T:map_gates_v1240.
- **Pair moments** (1.51.0): two NPCs seen together according to their visible relation (Meanwhile line, ambience beat); story relations fade from Connections. `pairLine`, `D/ambience.json` `pairs`. T:feature_batch3_v1510.
- **Trace beats and "?" pins** (1.51.0): a beat at a place an open thread's Clue names; "?" on the map. `stepAmbience` (`$ui.amb.trace`), `p20:clueLocs`.
- **Campus happenings** [f:happenings Off/Rare/Normal/Often]: 33 seeded small happenings (paid work, Dove sweep, loose creature, duel chalk, snow clearing, storm clean-up…), weather-aware, never twice in two days, shown as a chip and in the planner. `happeningOn`, `happeningFits`, `wxFits`, `D/happenings.json`, `p30:hapCard`. T:happenings_b5.

## 7. Money, shop, items

- **Points and Coin, one ledger** (1.45.0): every engine payment through `ledger` (`c.tx` → Transactions, cut to 20 in `stepCommit`); Points on campus, Coin away; Banking House exchange the day before a trip; overspend check in `stepHidden`. Wallet `ui:pWallet`. T:audit_batch3_v1450.
- **Purchases** (1.45.0): `/Purchases` settled by the engine: listed price at a shop that sells it in season, else the story price; refusals in `_Log`; 502 Buying rule, 503 example. `stepPurchases` (`SHOP_PRICE`, `shopRows`).
- **Shop**: 188 items with seasons and structured effects (`gear`, `use`); Shop tab only at a shop and a "Shop here" chip; out-of-season items greyed out; prices and effects feed `gen_mvu_entries.py`, `gen_engine.py`, `gen_ui.py`. `D/shop.json`, `p40:acShop`, `p40:shopsHere`. T:batch5_shops.
- **Mall shops**: seven gift shops share the Mall pin (`D/gift_shops.json`; lore via `tools/curate_data.py`, `merge_lorebooks.py`).
- **Price Guide** `WB506` (`506.template.ejs`): the shop {{user}} is at in full, canon prices, one line per other shop.
- **Bag** [f:inventory]: food, drinks, gear, gifts, books, reagents, other; a cap; a plan per item; Use/Give/Drop only draft; Sunfizz bottles return for 2 points. `stepBag`, `bagMove` (`bagTake`, `bagGive`, `c.bagTx`); `ui:pBag`. T:audit_batch1_v1420.
- **Item names** (1.42.0): `itemKey`, `bagKeyOf` (Consumables filter, the gift Bag decrease in `stepRest`, reminder R2), `newLines` (multiset diff of Transactions lines). T:audit_batch1_v1420.
- **Stray paths** (1.35.1): items written under /Player/Inventory or /Bag move to the Bag. `fixStrayPaths`. T:stray_paths_v1351.
- **Letters home** (1.31.0): a reply with a parcel (item or coin). `stepRecords` (`$eng.home`), `D/letters_home.json`.
- **Earning**: paid-work happenings, Apothecary sales (capped, `stepProficiency`), tutoring pay, monthly payout, Rank 10 / monthly bond rewards.

## 8. Proficiency, practice, crafting, training

- **Proficiency** [f:proficiency] (1.26.0–1.27.0): Knowledge, Arcana, Craft, Prowess, Society, Nature, Rank 0–5; XP from classes, exams, daily life and clubs (`D/club_stats.json`), weekly cap; each rank adds to Fortune in its field. `stepProficiency` (`PROF`, `PROF_CUT`, `SUBJECT_STAT`), `ui:pProficiency`. T:proficiency_v1260.
- **Practice** (1.27.0, 1.45.0): Activities → Practice at found places; one validated `/Practice` report with tracks (`/Training` an alias) gathered into `c.sessions`. `D/practice.json`, `p40:acPractice`. T:practice_v1270.
- **Crafting** (1.28.0–1.29.0): magical (Brewing, Runes, Repair, Enchant; Fortune-based) and non-magic (Cooking, Needlework, Drawing, Woodcarving, Calligraphy, Smithing); 35 recipes with a result preview; tools, experts, reagents and foraging; mishaps; a craft Project at Craft Rank 4 becomes a masterwork. `D/crafts.json` (`groups`, `masterwork`), `stepProficiency` (`finishMasterwork`), `stepBag` (bloom wilt), `stepExposure` (healing), recipes in `p40:acPractice`, 505, 506. T:crafting_v1280, T:crafts_v1290.
- **Mastery perks** (Rank 5, 1.30.0): Arcane scholar (mana discount, `stepMagic`), Formidable (`stepVitals`), Consummate (`stepBonds`: `CONSUMMATE_GROUPS`, `NOBLES`), Encyclopaedic's filed lead (`recordsLead`), and the rest. `D/mastery.json`, `MASTERY`, `profRankOf`, `ui:MASTERY_PERKS`; 504 mastery line. T:mastery_v1300.
- **Training**: mana pool or stamina sessions; weekly cap and a lifetime cap of twice the start; partner gifts count extra. `stepTraining` (`trainRoom`, `trainAdd`, `trainJump`, `unfitToTrain`), `D/training.json`; Settings → Training.
- **Rank 4 partners**: shared mana/stamina training or study by NPC category; one rule for all three. `D/rank4_partners.json`, `r4Partner`. T:rank_perks_v190.
- **Routine week** [f:routine_week] (1.50.0): plan a week in the Planner (`$ui.plan.run`) and live it in one reply to Sunday 20:00 or the evening before the next event, counted within the weekly limits, one or two moments played, then a Journal recap. `stepRoutine`, `routineSpan`, `routineMoments`, `routineLine` → `$ui.routine`, `routineStart` (end of `stepGuards`), `routineSchool`, `routineProf`; `p30:rpSection`. T:feature_batch2_v1500.

## 9. Bonds and NPC life

- **Bond XP and ranks** (1.2.2, 1.9.0): ranks 1–10; XP from time together, gifts, help within daily/weekly limits; cooldown; pace fast/brisk/standard/slow; the rank rises on the next genuine encounter (no rank-up scene); "close" marker. `D/bond_rules.json`, `stepBonds`, `PACE`. T:bonds_v122.
- **Starting a bond**: at the NPC's own Trust whatever the narrator writes (1.6.11); from a fact (1.53.0); per-NPC starts (Etnie, Topaz). T:newbond_v1611.
- **Interactions report**: `/Interactions` kinds talk, hangout, help, study, letdown, offence; XP only when together (1.42.0). `stepBonds`.
- **Trust** (1.4.3): bands, deeds-only rises, weekly cap, categories from openness, perk gates, overrides; drops by severity word `letdown` (1.59.0). `D/trust.json`, `trustProfile`, `TRU`, `LETDOWN`. T:trust_v143, T:narrator_batch8_v1590.
- **Tension** (1.3.8, 1.4.4): bands (40 half XP, 70 pause and reputation cost, 90 stop, 100 rank drop), five categories with their own way of showing it, apologies by category, quiet days fade it, never capped; rises by severity word `offence` (1.59.0); grey areas (intent over harm, teasing). `D/tension.json`, `tensionProfile`, `TEN`, `OFFENCE`. T:tension_v138, T:apology_v140, T:greyarea_v144.
- **Rank perks** (1.9.0): R2 +1 XP for the first accepted invitation a week; R4 shared training/study; R5 unique gift after the handover; R6 introduces a roster NPC (bond at Rank 1); R7 accompanied dorm or staff visit; R9 public vouch (one reputation loss −5 a month); R10 unique benefit (one-use counters). `D/bond_rewards.json`, `stepBonds`, `stepPerkUse`, `stepReputation`. T:rank_perks_v190, T:rewards_v130.
- **Special rewards**: monthly rewards (Aiden, Tristan, Mimosa, Rigel), mask → truth (Rank 8 waits for the secret), Krieg's weekly rule while the Doves think well of {{user}}, training-bonus rewards. `D/bond_rewards.json` (`monthly`, `mask`, `krieg`, `train_bonus`), `MASK`.
- **Rank 8 branches** (1.6.8): A all, B friend or rival, C friend or romance, D friend only; earliest romance rank in Settings → Bonds (default 8); one-way romances (Etnie, Kanae). `D/npc_canon.json` `branch`, `BRANCH`. T:rank8_v168.
- **The character's side** (1.6.0): Mind, Knows, Imprints, Next, defining moments, Meanwhile lines; Recent moments (10 kept, newest 3 in words); dated lines show their age in words. `stepBondMemory`, `KNOWS_VISIBLE`, `FACTS_VISIBLE`. T:memory_v160, T:recent_v145.
- **Betrayal spread, Known_by ↔ Knows** (1.18.0). `stepBonds`, `stepBondMemory`.
- **Moods** (1.8.0, 1.19.0): Good/Normal/Bad from character, loved/hated weather, `clock` (morning or night person), exam and trial weeks, health; mood badge from Rank 4; mood changes talks, apologies, conflict (weather Full). `D/npc_moods.json` (`loves`, `hates`, `clock`, `exams`, `trials`), `mg:moodOf`, `stepWeather` → `$ui.moods`. T:mood_gifts_v180.
- **Special days** (1.72.0): an NPC's own mood on their birthday, canon calendar days and personal dates with {{user}} a year on (Imprints, the day they met, Rank 8). `D/npc_moods.json` `days`, `_days` (checked in `gen_engine.py`); `mg:specialDays`, `mg:dayOn`, `mg:feelOf`; `$ui.moods[id]` `day`/`tone`/`bd`; `nowOf` Mood line; bond `$met`, `$b8` (`ydate`); Imprint `Feel` (rule card `imprints`); bracelet `.md.sd`; `p50:moodDay`. T:npc_days_v1720.
- **Gifts** (1.8.0): five reactions from per-NPC and universal preferences; gift XP and weekly limit; the first birthday gift double; disliked/hated double Tension that day; the dossier remembers what was tried; a gift leaves the Bag. `D/gift_prefs.json`, `mg:giftTier`, `stepBonds`. T:mood_gifts_v180.
- **Birthdays**: shown in dossiers and on the calendar once known; remembering builds Trust, forgetting costs nothing; close friends throw {{user}}'s party. `mg:birthdayParty`, `p30:nbPlanner`.
- **Time apart** (1.73.0): a character back after a week or more carries the gap. `APART_RANK`, `APART_DAYS`, bond `$apart` / `$apartd` in `stepBondMemory` (from `$seen`); printed in the Cast Sheet block by `nowOf`. T:npc_apart_asks_v1730.
- **Asking after** (1.73.0, 1.74.0): one who heard of {{user}}'s plan, or of an injury, asks how it went once its day has passed. `askAfter` (from `stepAgenda`: `$eng.agenda.ask`; injury keys `i:`), `ASK_RANK`, `ASK_DAYS` → `$ui.asks`. T:npc_apart_asks_v1730, T:word_ties_v1740.
- **Word gets around** (1.74.0): a defining moment reaches the teller's friends' Knows as "Heard from …". `WORD_DAYS`, `$eng.word` (queued in `stepBonds`, delivered in `stepBondMemory`; `TRU.friends`, `TRU.npcs`). T:word_ties_v1740.
- **Ties** (1.74.0): a present character sees {{user}}'s close bonds through their own relations (dislike, rival, friend). `TIES_RANK`, `REL_PAIRS`, the Ties line in `nowOf`. T:word_ties_v1740.
- **NPC initiative** [f:npc_initiative] (1.7.7, 1.10.2): from Rank 3 an NPC may seek {{user}} out on seeded days (one a day, two a week, seven days apart), with a concrete in-character reason that does not repeat within 20; some days a favour (1.49.0, `$ui.initiative.favour`). `stepInitiative` (`INIT_ASKS`, `FAVOURS`), `D/initiative_asks.json`. T:initiative_v177.
- **Favours and promises** (1.49.0): Commitment Type "favour": kept = a help interaction (the Item from the Bag), ignored = Tension once; a `/Practice` study session with someone present is a study interaction. `stepPromises` (`$eng.promise`). T:feature_batch1_v1490.
- **NPC routines** [f:npc_routines] (1.52.0): weekly habits (a place at a time of day) on about 70% of days by the shared roll; Map "Usually here", dossier Routine field (`gen_ui.py`), initiative places. `D/npc_routines.json`, `tools/common.py` `presence_data` (`rt`, `rate`), `sh:whereabouts`, `sh:presenceAt` (`why`). T:feature_batch4_v1520.
- **Whereabouts** (1.47.0): one model for who is likely around ({{user}}'s place now `$ui.here` with the class line, "May be here" `$ui.maybe` from Next plans and appointments), haunts, Map Regulars (`p20:locCard`), initiative and the areas; reminders R3/R4. `stepHere`, `npcOut`, `sh:presenceView`, `sh:uiOn`, `tools/common.py` `presence_data`; fixtures `tests/fixtures/presence_*`. T:audit_batch5_v1470.
- **Voice canon** (1.6.3–1.6.7): voice examples, terms of address, props, drift warning, Change type, Stage per rank band, Anchor for every bonded NPC; Nerys's weekly hobby line. `D/npc_canon.json` (`voice`, `change`, `weekly`), printed in the Cast Sheet; drift in real chats `tools/audit_chat.py` with `D/voice_rules.json`. T:voices_g1_v163 … T:voices_g5_v167.
- **Connections graph** (1.4.1–1.6.10): directed lines from the person who holds the view; factions; {{user}}'s line by rank, Trust and Tension; Romance lines; everyone dislikes Althair; group rules (Caine and mages, views of the Doves); a club shown once its field is open; drag and zoom. `D/relations_curated.json`, `D/factions.json`, `tools/build_relations.py`, `p10:graphModel`, `p10:drawGraph`. T:connections_v141, T:connections_v142, T:connections_v1610.
- **People panel**: bond cards with rank medals and meters; five sort orders (1.74.0: `p10:PSORT`, `p10:peopleGroup`, `p10:peopleListHTML`, `view.psort`); dossiers whose fields open with rank and openness (`D/bond_openness.json`, `D/field_overrides.json`), Tension band, Rank 8 line, benefits. `p10:PANELS.people`, `p10:PANELS.npc`. T:people_map.
- **Who has no bond**: rival academy teams and narrator Extras; rival students kept off Halvard's grounds (1.30.1). `NO_BOND`, `npcAway`.

## 10. Reputation

- **Three standings** Academy / Student / Doves, −5 to +5: XP and levels, 51 named deeds, weekly cap on everyday conduct, one side's gain can cost another (`also`: reporting a classmate), bond milestones (Rank 5/10) and Tension costs (70/100) by group, level effects on how people treat {{user}}, high/low standing changes bond speed (`bond_mod`), Academy +5 Portrait Hall and monthly bonus, −5 probation. `D/reputation.json`, `stepReputation` (`repAdd`, `repLv`), `ui:repRow`; Settings → Reputation.
- **Competition results** (1.44.0): deeds, the title's price (`$eng.comp`), team bond XP. `D/reputation.json` `competition`, `stepReputation` (`teamBond`).

## 11. Campus-life records

- **Planner** [f:planner]: Commitments (promises, appointments, deadlines; Where is the meeting place) with due times and overdue reminders; calendar notes the narrator never reads. `stepRecords`, `stepAgenda`, `p30:nbPlanner`.
- **Notice Board** [f:notices]: story notices plus official postings and the forecast. `p30:nbNotices`, `p30:officialNotices`.
- **Letters** [f:letters]: Mail Tower letters in and out, waiting reminders, letters home. `stepRecords`, `p30:nbLetters`.
- **Mystery Board** [f:mystery]: Clues (40 read, archive 120) and Mysteries; rumours and stories pinned as Clues (1.44.0). `stepRecords` (`capRecord`, `CLUE_ARCHIVE` → `$ui.cluearch`), `p30:nbMystery`, `p30:heardOf`.
- **Journal**: the story's spine (engine bookkeeping in `$ui.jnotes`), "The story so far" (folds), Lasting changes with Undo. `p30:nbJournal`. Memory side: §14.
- **Clubs**: directory with advisors (1.75.0: a teacher's Role "advises the X"), sign-up week (booths until Friday 18:00), Saturday club time, membership. `p40:acClubs`, `p40:clubsNow`, `CLUB_MEMBERS`, `canonClub`, `clubVenues`, `clubField`, `clubMembersNow`, `stepClubLife`, `tools/common.py` `load_clubs`.
- **A club {{user}} founds** (1.75.0): `Campus_State.Founded_club`; a signature from a teacher with no club (an introduced one), five members with {{user}}, a room; founded_club paid once; a roster student who joins leaves their lore club (Lore change), Etnie and Topaz follow; one a campaign; then a club in every system (attendance, Field XP, presence, map, graph, dossier). `stepFounding`, `CLUB_FOUNDING`, `sh:foundedClub`, `sh:movedToFounded`, `p40:founding`, rule card `founding`. T:founded_club_v1750, T:audit_b1_v1161.
- **Competition** [f:competition]: Dorm (role brackets and prize, 1.33.0), Academy, Kingdom (team, prize, Avalon), World (abroad, M11 W4). `stepClubLife` (`DORM_PRIZE`, `KINGDOM_PRIZE`), `p40:acCompetition`.
- **Projects** [f:projects]: brewing, crafting, research and group work over several sittings; masterworks. `p40:acProjects`, `stepProficiency`.
- **Trips** [f:trip]: Crowning Day and the Academy Trip (who travels, where). `stepTime`, `airFlight`, `p40:acTrip`.
- **Campus events** (1.6.1): dated; `<now>` asks to move on after a week without news; a campus-phase line for canon waves (`D/campus_phases.json`, empty). `stepCampusEvents`, `Campus_State.Events`.
- **Extras** (1.6.1, 1.61.0): an invented character gets a record from the second appearance (20 kept, keep-pin from the cast strip), a colour, then a short record once forgotten (`$ui.xold` → `$ui.xgone`, `EXTRAS_GONE`). `stepExtras` (`EXTRAS_MAX`), `ui:toggleKeep`; the Extras request in 505. T:extras_v161.
- **Story hooks** [f:hooks]: the narrator's private payoff notes (15); open matters go here (1.62.0). `stepHooks` (`CAP_HOOKS`).
- **Gossip** [f:gossip]: rumours spread from witnesses to dorm and club to campus, then fade or fizzle; the Journal shows how far. `stepGossip`, `p30:nbJournal`.
- **Campus record**: NPC_status, New_relations, Secrets_revealed (kept for good, so a dossier never relocks). `Campus_State`, `focusOf`.
- **Alcohol and tobacco**: students only on Sundays, Mid-Year Break and Month 12 (the airship bar too). `WB512` (keyword).

## 12. Places, map, outside areas

- **Map panel**: pins (`D/map_pins.json`, generated), ‹ › through a pin's places, zoom kept (`p20:mapView`), mouse-wheel zoom; place cards with the walk from here, access, clubs, Regulars, connections, this season's line, lore once heard. `p20:PANELS.map`, `p20:locCard`, `p20:walkFrom`, `p20:zoomMap`, `p20:loreRow`; far legs, gates and year floors from `tools/curate_data.py` (`FAR_LEGS`, `GATES`, `YEAR_FLOORS`). T:people_map.
- **Discovery and gates**: places hidden until visited; far-ground gates (Willow Island and Fishing House behind the Boathouse, Clearing, Observation Tower, Old Hut), open only in their area. `stepUi`, `p20:gateOpen`, `p20:discovered`, `D/locations.json` `gate`. T:map_gates_v1240, T:playtest_v1301.
- **Map by calendar** (1.13.0–1.14.4): 13 maps (seasons, ten events); an event map beats a season map; images pinned to an assets commit (DECISIONS "Assets"); local copies and prompts in `Maps/`, `planning/MAP_PROMPTS_outside_maps.txt`. `p20:mapFor`, `D/assets_manifest.json`. T:mapvariants_v1130.
- **Year floors**: Lecture Halls, Study Rooms, Lockers per year's floor, written "<place> — Floor N". `yearFloorLocation`, `YEAR_FLOOR_PLACES`.
- **Other dorms off the map** except on their Dorm Day or when inside (1.71.0). `p20:pinShown`, `p20:dormDayToday`.
- **Places by season** (1.14.0): 26 places carry a line for the current season; exam-week and pre-break lines only while they apply. `merge_lorebooks.py` `SEASONAL`, `PHASES`. T:dynamic_lore_v1140.
- **Campus walks** (1.47.0): a move walked the shortest way on the Campus Map graph (from `D/locations.json` `near`; floors, own dorm's shared rooms), owed minutes, stamina on a long walk, "Walks from here". `stepCampus`, `campusPlace`, `campusNode`, `campusWalk`, `AR`, `D/campus.json`, `tools/common.py` `campus_map`. T:audit_batch5_v1470.
- **First visits** (1.57.0): first visits to notable places and the Entrance tour remembered. `stepVisits` (`NOTABLE` from `D/locations.json`, `$eng.first`), `nowOf` `visit`. T:narrator_batch6_v1570.
- **Location activities** (1.31.0): Meditation Rooms, the Spirit Path, activities around the grounds (`D/practice.json`, `D/restore_places.json`).
- **Outside areas, one module** (1.46.0): `makeArea` records in `AR` (one per data file: places, pins, routes, aliases, salt, modes, theft words); `areaPlace`, `areaLoc`, `areaWx` / `wxWhere` (data `climate`), `areaHours`, `areaStreet`, `areaTheft`, `areaMove` (walk, carriage, water taxi, tour boat; fares through `ledger`), `areaSeen`, `areaNear`; `sh:areaNb`, `sh:areaRoutes`, `sh:areaPath`, `sh:areaMin` (shared with the Map); state `$ui.area.<key>`, `$eng.area.<key>`; `gen_ui.py` `DATA['areas']`; Map tab `p20:renderArea`; one 505 block (`AREA`, `AREA_WALK`, `AREA_EV`). T:audit_batch4_v1460.
- **Grand Vast Forest** (1.38.0): the Creature Studies Expedition: engine-rolled hunt (target, signs, beasts, the Wendigo), walks in hours, forest weather, catch guard, a result people remember. `D/expedition.json`, `stepExpedition`, `forestPlace`; `merge_lorebooks.py` `grand_vast_forest` (lore 360, 361–369; 229, 230); 502 forest rule. T:expedition_v1380.
- **Avalon** (1.39.0): Crowning Day and the Kingdom Competition: walks and carriages, crowds, the White Line (`stepTime`), the muster, the hotel curfew (`curfewOf`), pickpockets, processions, other academies' students, Tsubaki lost (her memory in `stepBonds`), scouts, Rookery raids, the day-before coin reminder. `D/avalon.json`, `stepCapital`, `avPass`; lore 370–377, 452–464; 502 Avalon rule. T:avalon_v1390.
- **The airship** (1.40.0): every academy flight: four places aboard, boarding, kept aboard and landing (`stepTime`), the seeded sky / stage / hold, bathing stalls end Soaked and Chilled, the bar rule, the aboard line in `curfewOf`. `D/airship.json`, `stepAirship`, `airFlight`; lore 465, 378–381. T:airship_v1400.
- **Sunreach Bay** (1.41.0): the Academy Trip's city by day and night (two maps), carriages, water taxis, the tour boat, bets at The Golden Tide, who is met where (`meet`), the sea and the Leviathan, the hotel curfew, its climate. `D/sunreach.json`, `stepSunreach`, `srWindow`; lore 247, 431–451. T:sunreach_v1410.

## 13. What the narrator is given

- **Entries**: `WB501` `<current_state>`, `WB502` update rules (a core line per topic, the "engine does these" list), `WB503` output format (example, a 3-line Analysis), `WB504` narration rules, `WB505` `<now>`, `WB506` Price Guide, `WB507` MVU config, `WB508` birthday, `WB509`/600+/599 Cast Sheet, `WB510` last-mile cast gate, `WB511` rule cards, `WB512` alcohol. Sources and gates: INDEX §4.
- **`<now>` from the engine** (1.48.0): clock, curfew, presence, walks, ambience, moods, reminders, Coming up. `nowOf` → `$ui.now`, `505.template.ejs`. T:audit_batch7_v1480.
- **Cast Sheet** (1.5.1, 1.48.0, 1.56.0): full canon lore for up to four present (who spoke last, then rank), a brief sheet for the rest, invariants, secret status, lines between those present, a "Now with {{user}}" block; their keyword entries stay silent; flags a speaker not in `Scene.Present`. `stepCast` → `$ui.cast`, `509*.template.ejs`. T:castsheet_v151, T:narrator_batch5_v1560.
- **Rule cards** (1.54.0–1.55.0): 20 full rules shown only while they apply (letters, projects, competition, exams, tutoring, trip, pacts, first pact, interactions, Trust/Tension, imprints, Old Hut, training, practice, dorm, combat role, favour, notices, the Vigil, fold). `D/rule_cards.json`, `ruleCards` → `$ui.now.rules`, `WB511`. T:narrator_batch3_v1540, T:narrator_batch4_v1550.
- **Report reminders** [f:reminders] (1.12.0): what the narrator forgot is derived or reminded once, never punished. `stepReminders` (`MISS_MAX`) → `$ui.missed`. T:reports_v1120.
- **Repairs**: malformed update blocks recovered (`recoverPatch`, `patchCommands`, the `COMMAND_PARSED` listener; 503 format rule); plain dates written back as calendar dates (`absWhen`); deed pairs settled by the engine (`D/reputation.json` `also`); names revealed by the prose (`stepNamesInProse`). T:playtest_v1301, T:narrator_batch1_v1530.
- **Lore activation** (1.35.0): plain words fire lore, World Index CORE FACTS, card entries ignore the WI budget. `merge_lorebooks.py` `lore_activation` (`KEY_ADDS`, `CORE_FACTS`). T:lore_activation_v1350.
- **Lore by year**: World Index follows {{user}}'s year; NPCs of a later cohort stay hidden; teachers not on record are the narrator's. `merge_lorebooks.py` `roster_ejs`. T:lore_audit_v197.
- **Lore changes** (1.60.0): the narrator may change a fact of the lore for this campaign, kept only with a Cause and only when the reply or the player names the subject (`LORE`, `lcKey`, `loreUidOf`, `proseOf`); printed over every entry with that name (`build/build_card.py` `LORE_OPEN`, `tools/common.py` `lore_names`); 501 `Lore_changed_in_entries`, sheet `cLore`; Journal Lasting changes and Undo (`p30:lcHtml`), Map card. `stepLoreChanges`; harness `loreOf`. T:lore_changes_v1600.
- **World content**: 71 NPCs, 75 locations, five World Myths, five nations, 17 ghost stories, Bazaar traders from the nations. `merge_lorebooks.py` `WORLD_MYTHS`, `NATIONS`, `GHOST_STORIES`. T:worldmyth_v171, T:nations_v172, T:origins_v173.
- **Dialogue colours** [f:say_colors] (1.37.0): `<say:Name>` tags; 12 light colours with two spares each so nobody present shares one; Extras' three colours; {{user}}'s colour; the rule in 504 / 510. `D/dialogue_colors.json` (new NPCs filled by `tools/make_dialogue_colors.py`), `ui:sayCss`, `ui:sayStyle`, the `<say>` regexes, the colour step at the end of `stepCast` (`$ui.say`, `$ui.sayx`). T:say_colors_v1370.
- **Story gist** [f:gist] (1.66.0): one line per reply in `_Recent_story`. `stepGist` (`GIST`, `$eng.gist`); 502 Gist line (`on('gist')`).

## 14. Memory over long campaigns

- **State as memory**: the narrator reads about the latest 24 messages; older ones arrive as one "[…]" line (trim regex, `collapseTrimmed`). DECISIONS §8.
- **Journal window**: 30 lines read (`CAP`); repeats dropped (`jkey`), routine lines leave first (`JOURNAL_LOW`); engine bookkeeping in `$ui.jnotes` (`ENGINE_NOTE`, `c.notes`); archive 240 for the player (`ARCHIVE_MAX`); compact 501 (absent bonds, techniques, Transactions, records that are over). `stepRecords`; 502 Journal rule. T:memory_batch1_v1610, T:narrator_batch6_v1570.
- **Pins** (1.62.0): a `!` line never leaves view (Journal → `_Kept_from_earlier`, 20; five per character in Knows / Known_facts; engine landmarks pinned, the true-magic line). `PINNED`, `JOURNAL_LANDMARK`, `KEPT_MAX`, `PIN_MAX`, `capPinned`, `stepRecords` (`c.jCapped`); 502 Journal and Knows lines (`on('hooks')`). T:memory_batch3_v1620.
- **Folds** (1.63.0): Journal → Chronicle L1–L3 (`_Chronicle`), one fold line per character, written through the `fold` rule card (`/Fold`); plain fold after 8 replies; nothing dropped before it is folded. `stepFold`, `foldRequest`, `applyFold`, `plainFold`, `chronMeta`, `FOLD`, `FOLDED`, `$eng.jq`, `capPinned` (`$Knows_q`, `$Known_q`), queue migration (`verLt`); `$ui.fold`, `$eng.chron` in `schema.js`; "The story so far" in `p30:nbJournal`. T:memory_batch4_v1630.
- **Recall** (1.64.0): older lines naming someone on a full sheet (3) or the place (2) come back. `recallOf` (`RECALL`, `placeWords`, `NAME_RX_OF`) → `$ui.now.earlier` / `recall` / `recallAt`; printed by sheet `cMem` and 505. T:memory_batch5_v1640.
- **Relevance** (1.65.0): `<current_state>` prints clues, Extras, NPC_status, New_relations, Secrets_revealed in full only when they touch the scene, the rest as `…_not_shown` index lines. `focusOf` (`wordRx`) → `$ui.now.focus`; sheet `cStat` / `cTail`. T:memory_batch6_v1650.
- **Snapshots**: the MVU floor being replayed is read, a far snapshot warned of. `floorOf`, `snapGap`, `$eng.floor`. T:memory_batch1_v1610.
- **VectFox side** (1.66.0): a hidden scene marker on player messages (who, place, timeline); timeline numbers (`eld_tl`) void rewound memories (505 "Rewound story"). `SCENE_MARK_RX`, `sceneMark`, `tlNorm`, `tlSent`, `TL_VAR`, the `MESSAGE_SENT` / `MESSAGE_RECEIVED` listeners above the MVU hook (`runEngine` drops the marker; `$ui.now.tl`); pattern 0 of `src/vectfox/vectfox_cleaning_patterns.json`. T:memory_batch7_v1660.
- **Planned**: chapters (a new chat file without losing memory), `planning/DRAFT_bab_baru.md`.

## 15. UI shell

- **Bracelet** (latest message only; 1.22.0): clock, period, location, points, vitals, dorm gem; chips for weather, conditions, today's event, Next, training, sleep debt, curfew/lockdown/break/away, injuries, active effects, summons, Doves stage, battle, Overdue, Due today, commitments, letters waiting, happening, Shop here; portrait strip with mood badges and the Extras keep-pin; panel buttons. `sb:`; display regex. T:ui_overhaul_v1210.
- **Panels**: Student file, People, Map, Inventory (Bag, Wallet, Planner, Journal, Notice Board, Letters, Mystery Board; `p30:NB_TABS`), Activities (Clubs, Practice, Competition, Shop, Projects, Trips), Battle; tabs appear only when relevant (`stepUi` unlocks).
- **Buttons only draft**: they write a suggested action into the chat box. `p30:fillChat`. DECISIONS §7.
- **Scene cards** (1.70.0–1.71.0): under the newest reply: portrait, true thoughts (preset `<npc_thoughts>`), bond meters; actions draft practice, Rank 4 tracks, invitations, gifts from the Bag (with reactions already seen, `$gifts`), favours, Rank 5–7 perks, amends. `p50:sceneCard`, `p50:sceneActions`, `p50:sceneHTML`. T:scene_cards_v1700, T:scene_actions_v1710.
- **"New" dots** (1.25.0): buttons, tabs, people just met, map markers; seen state in chat variable `eld_seen`. `src/ui/news.shared.js` (`newsItems`, `newsStore`), `ui:newsInit`, `ui:newsMark`, `ui:isNew`. T:news_v1250.
- **Themes** (1.21.0): Pewter, Midnight, Rosewood, Parchment, Frost; colour tokens, AA contrast. `tools/make_themes.py`, `ui:setTheme`. T:ui_overhaul_v1210.
- **Settings**: Appearance; Features (every module on/off with its token cost, `tools/feature_cost.py` → `D/feature_cost.json`; switched-off state is parked, not deleted, by `stepFeatures`); tuning groups Bonds, Proficiency, Training, Reputation, Mood and rest, Body and magic, Campus life, Studies and dorm rank, Fortune (`D/tuning.json`). `ui:pSettings`, `ui:featureOn`. T:settings_v199.

## 16. Preset and VectFox

- **Preset** (1.68.0): Realistic Frankenstein 2.2.1.3 (Realistic Gemini BOLT) as it ships plus a closed deviation list D1–D11 and E1 Player Input Authority, E2 Output language, E3 Ordinary Turns; NPC Thoughts block (D5, styled by `ui:thoughtsCss`). `presets/edit_preset.py`; docs/ECOSYSTEM.md. T:preset, T:npc_thoughts_v1373.
- **VectFox**: the card's cleaning patterns and EventBase extraction prompt (`src/vectfox/`, copied to `dist/`); settings and how EventBase works in docs/ECOSYSTEM.md. T:vectfox_v1113.

## 17. Developer tools

- **Build**: `tools/build_all.py` (`--lore`, `--preset`, `--themes`); `tools/gen_engine.py`, `gen_ui.py`, `gen_mvu_entries.py`; `build/build_card.py`. docs/BUILD.md.
- **Tests**: `npm test` (`tests/run_all.cjs`, `qa_static.cjs`, `lint.cjs`); save fixtures (`tests/fixtures/make_save.cjs`, T:saves); `ENGINE_DIFF` and `tests/harness.cjs` (`renderEntry`, `diffEngine`); `tests/snapshot_render.cjs`; `tests/stress/` (`sim_year.cjs`, `memory_soak.cjs`); `tests/preview/`.
- **Measuring**: `tests/token_audit.cjs`; `tools/audit_chat.py` (drift; `--mechanics`, `--memory`, `--vectfox`, `--compare`); `tools/replay_chat.cjs`; `tools/memory_lists.cjs`.
- **Content**: `tools/make_npc_roster.cjs` → `planning/NPC_ROSTER.md`; `tools/make_dialogue_colors.py`; `tools/process_assets.py` (portraits; needs the original PNGs); `tools/curate_data.py`; `tools/build_relations.py`.
