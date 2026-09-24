# Eldrasil / Halvard Academy — MVU card (project)

**New session or another AI? Read `HANDOFF.md` first.**

Source for the SillyTavern character card `dist/Eldrasil_Halvard.png` (v1.2.0). Players: see `docs/PLAYER_GUIDE.md`.
Design and decisions: `ELDRASIL_MVU_PLAN.md`. Build history, open items and tunables: `PROGRESS.md`.

## Layout
- `src/worldbook/` merged lore (generated, uid < 500) and `src/worldbook/custom/` hand-written MVU entries (uid 500+).
- `src/worldbook/custom/505.template.ejs` is the source of the Now entry (505); `tools/common.py` holds shared data helpers (clubs, outdoor places).
- `src/scripts/` Tavern Helper scripts: `schema.js` (MVU ZOD), `engine.template.js` → `engine.js`, `ui.template.js` + `src/ui/parts/` → `ui.js`.
- `src/ui/statusbar.template.html` → `statusbar.html` (the bracelet, rendered by a display regex). `src/regex/` regex scripts.
- `data/` curated single sources: npcs, relations, locations, map pins, shop prices, campus happenings, asset manifest (the one place the asset base URL lives).
- `tools/` generators, `build/build_card.py` assembler, `tests/` node + browser tests, `docs/` checklists and guide, `dist/` outputs.

## Rebuild
```
python3 tools/merge_lorebooks.py      # only when the source lorebooks change (source_original/)
python3 tools/curate_data.py          # only when lore/NPC data changes
python3 tools/gen_engine.py
python3 tools/gen_mvu_entries.py     # also measures feature rule costs (tools/feature_cost.py -> data/feature_cost.json)
python3 tools/gen_ui.py
python3 build/build_card.py
```

## Test
```
npm install && npm test                                               # every tests/test_*.cjs + tests/qa_static.cjs
python3 tests/preview/smoke_all_panels.py                             # needs playwright; opens every panel and tab
```

## Assets
Portraits, thumbnails and the map are served from `github.com/pizzatuna65-jpg/eldrasil-assets` through jsDelivr, pinned to a commit
(`data/assets_manifest.json` → `base_url`). After changing assets: push, then set `base_url` to the new commit (or a tag such as `@v1`)
and rebuild. Never use `@main` in a release: jsDelivr caches it for days.
