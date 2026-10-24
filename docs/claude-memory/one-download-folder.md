---
name: one-download-folder
description: "Every file the owner imports into SillyTavern (card, preset, VectFox cleaning patterns + extraction prompt) lives in dist/; sources stay in presets/ and src/vectfox/"
metadata:
  node_type: memory
  type: feedback
  originSessionId: ac750f9f-d494-4b9e-8bc9-1e99f0d353f7
  modified: 2026-10-20T14:45:54.419Z
---

Since 2026-10-20 (commit 4f15155) `dist/` is the one download folder: `Eldrasil_Halvard.png`/`.json`,
`Realistic_Frankenstein_2_2_1_3_Eldrasil.json` (written there by `presets/edit_preset.py`), `vectfox_cleaning_patterns.json` and
`vectfox_eventbase_prompt.txt` (hand-written in `src/vectfox/`, copied to `dist/` by `build/build_card.py`). TEST cards stay in
`dist/test/`, the standalone lorebook in `dist/lorebook_v39/`. Recorded in DECISIONS §10.

**Why:** the owner asked for the preset, the VectFox prompt/text cleaning and the card in one folder, so a download never means
hunting through `presets/` and `docs/`.

**How to apply:** any new player-facing output (a new preset, a VectFox file, a regex to import) is written to `dist/`; edit its source
(`presets/edit_preset.py`, `src/vectfox/`), never the `dist/` copy. When telling the owner what to import, give `dist/` paths.
Related: [[preset-rebuild-rf2213]], [[vectfox-reference]].
