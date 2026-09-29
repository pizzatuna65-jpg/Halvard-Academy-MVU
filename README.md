# Eldrasil / Halvard Academy — MVU card (project)

A SillyTavern character card for a slice-of-life magic-academy roleplay with a mystery underneath, built on MVU (MagVarUpdate) state,
a deterministic game engine and an in-chat UI. Current release: **1.14.4** (see `CHANGELOG.md`).

**New session or another AI? Read `CLAUDE.md`, then `HANDOFF.md`.**

## Download
- Card: `dist/Eldrasil_Halvard.png` (it installs its own lorebook on first open). Standalone lorebook: `dist/lorebook_v39/`.
- Preset: `presets/Realistic_Frankenstein_2_2_Eldrasil.json` (Realistic Frankenstein 2.2, edited for this card and Gemini).
- Test cards: `dist/test/` (every bond at Rank 7; a campaign that starts in Year 2).
- Players: `docs/PLAYER_GUIDE.md`. Card + preset + VectFox setup: `docs/ECOSYSTEM.md`.

## Layout
| Path | Contents |
|---|---|
| `CHANGELOG.md` | release history: a one-line index at the top, newest details first |
| `HANDOFF.md`, `CLAUDE.md` | full project context and working rules for the next session |
| `src/` | card sources: `worldbook/` (generated lore uid < 500, hand-written MVU entries in `custom/`), `scripts/` (schema, engine and UI templates → generated `.js`), `ui/` (bracelet), `regex/`, `card/` |
| `data/` | curated single sources: NPCs, locations, shop, happenings, bonds, reputation, asset manifest |
| `tools/`, `build/` | generators and the card assembler |
| `tests/` | node suites (`test_*.cjs`), save fixtures, stress tests, browser previews |
| `presets/` | the edited preset, its generator and the original |
| `source_original/` | the owner's lorebook v38 and NPC lore passes (canon, pipeline input) |
| `planning/` | approved design drafts (Indonesian), future plans, NPC brainstorm brief |
| `docs/` | player guide, ecosystem, live test checklist, designs, public rentry guide, `archive/` (original plan and v1.1.0 spec) |

## Rebuild
Run only the steps whose inputs changed, in this order (on Windows use `python` instead of `python3`):
```
python3 tools/merge_lorebooks.py      # source_original/ changed (then curate_data.py)
python3 tools/curate_data.py          # NPC, location or relation data changed
python3 tools/gen_engine.py
python3 tools/gen_mvu_entries.py
python3 tools/gen_ui.py
python3 build/build_card.py           # always last -> dist/
python3 tools/build_test_card.py 7 && python3 tools/build_test_card_year2.py   # TEST cards
```

## Test
```
npm install && npm test                        # every tests/test_*.cjs + tests/qa_static.cjs
npm run stress                                 # optional fuzz and simulated school year
python3 tests/preview/smoke_all_panels.py      # optional, needs playwright: opens every panel and tab
```
Checks that need a real SillyTavern session: `docs/TEST_CHECKLIST.md`.

## Assets
Portraits, thumbnails and the map are served from `github.com/pizzatuna65-jpg/eldrasil-assets` through jsDelivr, pinned to a commit
(`data/assets_manifest.json` → `base_url`). After changing assets: push, set `base_url` to the new commit, rebuild. Never use `@main`
in a release: jsDelivr caches it for days.

## NPC brainstorming handoff
`python3 tools/make_npc_brief.py` writes `docs/npc_brainstorm/`: a self-contained brief plus the full NPC lore by group, for designing
NPCs with another AI session without the whole project. It is generated on demand and not kept in the repo.
