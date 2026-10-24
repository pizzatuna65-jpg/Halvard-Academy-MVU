---
name: ui-overhaul-proposal
description: "2026-09-29 UI overhaul \"Brass & Moonglass\" approved and shipped as 1.21.0–1.23.0; awaiting the owner's live SillyTavern check"
metadata:
  node_type: memory
  type: project
  originSessionId: acbe6244-eb6e-4dd0-bfb7-282a3c799259
  modified: 2026-09-29T14:56:55.502Z
---

The owner approved the whole "Brass & Moonglass" report (https://claude.ai/artifact/QjbmYWMLMpxihoq5oU5Dys) on 2026-09-29.
Everything in it is now in code: 1.21.0 tokens, palette and Alegreya; 1.22.0 the bracelet; 1.23.0 the panels. The owner chose
Alegreya over Cinzel, slate-blue neutrals, kept the theme name "Pewter", and asked for staged releases.

**Why:** the design direction is now an established decision (DECISIONS §6 "UI design system"). Future UI work should build on it.
**How to apply:** new UI colours go in the token blocks, and themes go in `tools/make_themes.py` ROLES (the build asserts 4.5:1
contrast). `tests/test_ui_overhaul_v1210.cjs` guards this. The live checks in TEST_CHECKLIST 1.21–1.23 are still open.
See [[no-obvious-open-questions]]. The local preview server config is in `.claude/launch.json` (gitignored).
