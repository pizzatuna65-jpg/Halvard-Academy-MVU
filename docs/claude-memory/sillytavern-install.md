---
name: sillytavern-install
description: "The owner's SillyTavern install is D:/Game/SillyTavern/SillyTavern; read live chats, settings and the installed card there instead of asking for an export"
metadata:
  node_type: memory
  type: reference
  originSessionId: 2ef34e29-6a02-4029-9482-79241df4286b
  modified: 2026-10-06T05:08:37.684Z
---

SillyTavern: `D:/Game/SillyTavern/SillyTavern/data/default-user/` (2026-10-06):
- `chats/Eldrasil — Halvard Academy/` holds the Charles campaign chat (newest `*.jsonl`); each message's `variables[swipe_id].stat_data`
  is the MVU state, `swipe_info[n].extra.reasoning` the model's reasoning (it showed which prompt line caused a bug in 1.67.2).
- `characters/Eldrasil — Halvard Academy.png` (the installed card; `chara`/`ccv3` tEXt chunks), `worlds/Eldrasil — Halvard Academy.json`
  (the installed lorebook), `settings.json` → `extension_settings.mvu_settings` / `vectfox`, `oai_settings` (model, preset).
- Read only: never write there while SillyTavern may be running (it rewrites settings.json from memory).

**How to apply:** when the owner says "cek balasan terakhir" or reports a live problem, read the newest chat there first.
Only the Halvard chats, never another character's: [[only-halvard-chats]]. Related: [[audit-batch-plan]], [[vectfox-reference]].
