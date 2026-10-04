# Test index by feature

Build first with `python tools/build_all.py`. Run all suites with `npm test`; run syntax and EJS lint with `npm run lint`. After `npm install`, `npm run lint:eslint` checks handwritten JavaScript templates with the lightweight rules in `eslint.config.mjs`. A connected SillyTavern session is still needed for `docs/TEST_CHECKLIST.md`.

| Feature | Main automated checks |
|---|---|
| Calendar, timetable, exam/trial mood, state budget | `test_calendar_state_v1190.cjs`, `test_calendar_v1320.cjs` (1.32.0 dates, Coming up), `test_classes_v1330.cjs` (1.33.0 Practical Magic by role, teachers per subject and year, free periods, Dorm bracket prize, Combat save migration), `test_notebook.cjs` (Inventory panel), `test_mood_gifts_v180.cjs`, `test_playtest_v131.cjs` |
| Old chat saves and state schema | `test_saves.cjs`, `test_builder.cjs`, `test_settings_v199.cjs` |
| Attendance, study, grades, weather | `test_batch1_fp7_v1100.cjs`, `test_grades_v1150.cjs`, `test_mastery_v1300.cjs` (mark formula, mastery perks), `test_world_v110.cjs`, `test_ambience_v1160.cjs` |
| Proficiency, Practice and crafting | `test_proficiency_v1260.cjs`, `test_practice_v1270.cjs`, `test_crafting_v1280.cjs`, `test_crafts_v1290.cjs` |
| Bonds, Trust, Tension, gifts and perks | `test_bonds_v122.cjs`, `test_trust_v143.cjs`, `test_tension_v138.cjs`, `test_mood_gifts_v180.cjs`, `test_rank_perks_v190.cjs` |
| NPCs, cast, lore and incoming years | `test_castsheet_v151.cjs`, `test_cohort2_v170.cjs`, `test_cohort3_v1340.cjs` (Year 3 arrival, Council membership and election), `test_year2_v174.cjs`, `test_dynamic_lore_v1140.cjs`, `test_voices_g1_v163.cjs` through `test_voices_g5_v167.cjs` |
| Map, shops and UI panels | `test_ui_overhaul_v1210.cjs` (tokens, themes, fonts), `test_map_gates_v1240.cjs` (gates, lore heard, zoom), `test_playtest_v1301.cjs` (area gates, rival teams, malformed update blocks), `test_stray_paths_v1351.cjs` (/Player/Inventory moved to the root), `test_playtest_v1352.cjs` (feast-night curfew, journal dedupe, new-chat proficiency), `test_people_map.cjs`, `test_mapvariants_v1130.cjs`, `test_batch5_shops.cjs`, `test_notebook.cjs`, `test_news_v1250.cjs` (red "new" dots) |
| Prompt and card package | `test_tokens_v1110.cjs`, `test_preset.cjs`, `test_npc_thoughts_v1373.cjs` (preset NPC Thoughts block), `qa_static.cjs`, `lint.cjs` |
| Grand Vast Forest / Expedition (1.38.0) | `test_expedition_v1380.cjs` (routes, place names, walking and owed hours, the seeded hunt, the catch guard, the result, `<now>`, lore gate, UI data) |
| Avalon, the capital (1.39.0) | `test_avalon_v1390.cjs` (routes, names and aliases, walks, crowds, carriages, the White Line, the hourly city rolls, the muster, Tsubaki in Year 1, the Kingdom team, the day-before reminder, lore gate, `<now>`, 502, UI data) |
| The airship (1.40.0) | `test_airship_v1400.cjs` (flights and who flies, boarding, kept aboard, landing at the destination, the bathing stalls, the seeded sky / stage / hold, the bar's rule, lore gate, `<now>`, 502, the Airship tab) |
| Sunreach Bay (1.41.0) | `test_sunreach_v1410.cjs` (routes and names, the window, landing, the teachers' curfew, walks, carriages, water taxis, the tour boat, bets, who is met where by personality, the sea and the Leviathan, the index pattern for Sunreach, the forest, Avalon and the airship, `<now>`, 502, the day/night map tab) |
| Engine integration audit | `test_audit_b1_v1161.cjs`, `test_audit_b2_v1170.cjs`, `test_integrations_v1180.cjs` |
| Memory: nothing forgotten silently (1.61.0) | `test_memory_batch1_v1610.cjs` (open clues kept and the clue archive, Journal repeats and routine lines first, Extras' short records, the floor MVU replays, VectFox's year and turning points) |
| Narrator load (1.53.0) | `test_narrator_batch1_v1530.cjs` (first-pact gate, 503 example and Analysis, the 502 engine list, plain dates written back, a bond from a fact, deed pairs, the remedial by presence, the Extras request in `<now>`, Journal dates once) |
| Journal spine, first visits, compact state, VectFox prompt (1.57.0) | `test_narrator_batch6_v1570.cjs` |
| One place per fact (1.56.0) | `test_narrator_batch5_v1560.cjs` (the Now block in the Cast Sheet, numbers once, Recent in words, rules said once, 512 tagged) |
| Rule cards (1.54.0, 1.55.0) | `test_narrator_batch4_v1550.cjs` (stage-2 cards, the tighter core); `test_narrator_batch3_v1540.cjs` (core lines in 502, each card's trigger, Features, fail-open, entries 511 / 512) |
| Narrator mechanics tool (1.53.1) | `test_mechanics_audit_v1531.cjs` (`audit_chat.py --mechanics` and the replay on a made-up chat) |
| Engine steps and save migrations | `test_engine_steps_v1200.cjs`, `test_saves.cjs`; any suite with `ENGINE_DIFF=<older engine.js>` compares every engine run with that build |

Stress scenarios live under `tests/stress/`; `sim_year.cjs 336` measures a full campaign year's state size and update time. Browser panel smoke checks live under `tests/preview/`.
