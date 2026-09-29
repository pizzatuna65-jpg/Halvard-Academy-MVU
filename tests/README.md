# Test index by feature

Build first with `python tools/build_all.py`. Run all suites with `npm test`; run syntax and EJS lint with `npm run lint`. After `npm install`, `npm run lint:eslint` checks handwritten JavaScript templates with the lightweight rules in `eslint.config.mjs`. A connected SillyTavern session is still needed for `docs/TEST_CHECKLIST.md`.

| Feature | Main automated checks |
|---|---|
| Calendar, timetable, exam/trial mood, state budget | `test_calendar_state_v1190.cjs`, `test_notebook.cjs`, `test_mood_gifts_v180.cjs`, `test_playtest_v131.cjs` |
| Old chat saves and state schema | `test_saves.cjs`, `test_builder.cjs`, `test_settings_v199.cjs` |
| Attendance, study, grades, weather | `test_batch1_fp7_v1100.cjs`, `test_grades_v1150.cjs`, `test_world_v110.cjs`, `test_ambience_v1160.cjs` |
| Proficiency, Practice and crafting | `test_proficiency_v1260.cjs`, `test_practice_v1270.cjs`, `test_crafting_v1280.cjs` |
| Bonds, Trust, Tension, gifts and perks | `test_bonds_v122.cjs`, `test_trust_v143.cjs`, `test_tension_v138.cjs`, `test_mood_gifts_v180.cjs`, `test_rank_perks_v190.cjs` |
| NPCs, cast, lore and Year 2 | `test_castsheet_v151.cjs`, `test_cohort2_v170.cjs`, `test_year2_v174.cjs`, `test_dynamic_lore_v1140.cjs`, `test_voices_g1_v163.cjs` through `test_voices_g5_v167.cjs` |
| Map, shops and UI panels | `test_ui_overhaul_v1210.cjs` (tokens, themes, fonts), `test_map_gates_v1240.cjs` (gates, lore heard, zoom), `test_people_map.cjs`, `test_mapvariants_v1130.cjs`, `test_batch5_shops.cjs`, `test_notebook.cjs`, `test_news_v1250.cjs` (red "new" dots) |
| Prompt and card package | `test_tokens_v1110.cjs`, `test_preset.cjs`, `qa_static.cjs`, `lint.cjs` |
| Engine integration audit | `test_audit_b1_v1161.cjs`, `test_audit_b2_v1170.cjs`, `test_integrations_v1180.cjs` |
| Engine steps and save migrations | `test_engine_steps_v1200.cjs`, `test_saves.cjs`; any suite with `ENGINE_DIFF=<older engine.js>` compares every engine run with that build |

Stress scenarios live under `tests/stress/`; `sim_year.cjs 336` measures a full campaign year's state size and update time. Browser panel smoke checks live under `tests/preview/`.
