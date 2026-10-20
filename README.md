# Eldrasil / Halvard Academy — MVU card (project)

A SillyTavern character card for a slice-of-life magic-academy roleplay with a mystery underneath, built on MVU (MagVarUpdate) state,
a deterministic game engine and an in-chat UI. Current release: **1.34.0** (see `CHANGELOG.md`).

**New session or another AI? Read `CLAUDE.md`, then `HANDOFF.md`, then `docs/INDEX.md`.**

## Download
Everything to import sits in `dist/`.
- Card: `dist/Eldrasil_Halvard.png` (it installs its own lorebook on first open). Standalone lorebook: `dist/lorebook_v39/`.
- Preset: `dist/Realistic_Frankenstein_2_2_1_3_Eldrasil.json` (Realistic Frankenstein 2.2.1.3, Realistic Gemini BOLT, as it ships plus
  what this card needs).
- VectFox: `dist/vectfox_cleaning_patterns.json` (Text Cleaning → Import) and `dist/vectfox_eventbase_prompt.txt` (EventBase →
  Extraction Prompt).
- Test cards: `dist/test/` (every bond at Rank 7; a campaign that starts in Year 2).
- Players: `docs/PLAYER_GUIDE.md`. Card + preset + VectFox setup: `docs/ECOSYSTEM.md`.

## Layout
| Path | Contents |
|---|---|
| `CLAUDE.md`, `HANDOFF.md` | working rules and the current snapshot for the next session |
| `docs/INDEX.md` | which files and symbols a task needs (read before opening code) |
| `docs/DECISIONS.md`, `docs/BUILD.md` | established decisions; build order, generated files, tests, playbooks |
| `CHANGELOG.md` | newest releases in detail, then a one-line index of every release |
| `src/` | card sources: `worldbook/` (generated lore uid < 500, hand-written MVU entries in `custom/`), `scripts/` (schema, engine and UI templates → generated `.js`), `ui/` (bracelet), `regex/`, `card/` |
| `data/` | curated single sources: NPCs, locations, calendar, shop, happenings, bonds, reputation, asset manifest |
| `tools/`, `build/` | generators and the card assembler (`tools/build_all.py`) |
| `tests/` | node suites (`test_*.cjs`, index in `tests/README.md`), save fixtures, stress tests, browser previews |
| `presets/` | the preset generator and the original (the edited preset is written to `dist/`) |
| `source_original/` | the owner's lorebook v38 and NPC lore passes (canon, pipeline input) |
| `planning/` | `FUTURE_PLANS.md` (open work), the NPC brainstorm brief, drafts awaiting approval |
| `docs/` | player guide, ecosystem, live test checklist, public rentry guide |

## Build and test
```
npm install
python tools/build_all.py        # the whole rebuild in order (+ --lore, --preset, --themes)
npm test                         # every suite + static QA
```
Details, single steps and optional checks: `docs/BUILD.md`. Checks that need a real SillyTavern session: `docs/TEST_CHECKLIST.md`.

## Assets
Portraits, thumbnails and the map are served from `github.com/pizzatuna65-jpg/eldrasil-assets` through jsDelivr, pinned to a commit
(`data/assets_manifest.json` → `base_url`). After changing assets: push, set `base_url` to the new commit, rebuild. Never use `@main`
in a release: jsDelivr caches it for days.

## NPC brainstorming handoff
`python tools/make_npc_brief.py` writes `docs/npc_brainstorm/`: a self-contained brief plus the full NPC lore by group, for designing
NPCs with another AI session without the whole project. It is generated on demand and not kept in the repo.
