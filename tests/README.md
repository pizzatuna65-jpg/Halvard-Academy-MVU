# Tests

Build first with `python tools/build_all.py`. `npm test` runs every suite and static QA (`tests/run_all.cjs`); `npm run lint` checks
syntax and EJS; after `npm install`, `npm run lint:eslint` checks the hand-written JavaScript templates (`eslint.config.mjs`). Checks
that need a connected SillyTavern session: `docs/TEST_CHECKLIST.md`.

- **Which suite covers a feature:** the `T:` names on its line in `docs/FEATURES.md`. Suites are named `test_<topic>_v<release>.cjs`;
  that release's line in the CHANGELOG index says what it added. Every suite that checks some text: `grep -l "<text>" tests/test_*.cjs`
  (rule wording in 502 is checked by several).
- **One suite:** `node tests/test_<name>.cjs`. For a routine change run only the relevant suites (CLAUDE.md "Testing").
- **Saves:** `node tests/fixtures/make_save.cjs` writes the release's fixture before code changes; `test_saves.cjs` loads every fixture
  in `tests/fixtures/saves/`.
- **Refactors:** `ENGINE_DIFF=<old engine.js> npm test` compares every engine run with that build (`harness.cjs` `diffEngine`);
  `snapshot_render.cjs` for rendered entries. A version bump re-runs `stepMigrate`: diff against a copy of the old engine with its
  `ENGINE_VER` set to the new version.
- **Harness:** `tests/harness.cjs` runs the engine and renders an entry as ST does (`renderEntry`; `loreOf` = an entry without the
  lore-change overlay).
- **Stress:** `npm run stress` (`tests/stress/run_stress.cjs` runs `fuzz.cjs`, `fuzz_builder.cjs` and `sim_year.cjs`, a campaign
  year's state size and update time, each even when one fails, and reports every exit code); `node tests/stress/memory_soak.cjs 3000` (memory invariants and budget).
- **Browser previews:** `tests/preview/` (`smoke_all_panels.py`, `render_ui.py`, `render_bar.py` with sample states).
- **Token cost:** `node tests/token_audit.cjs`.
