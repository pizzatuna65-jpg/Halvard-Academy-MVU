---
name: vectfox-reference
description: "What VectFox (the owner's chat-memory extension) is, how EventBase stores and recalls events, and its settings are written up in docs/ECOSYSTEM.md; read that, never ask the owner for the repo or an export"
metadata:
  node_type: memory
  type: reference
  originSessionId: 96f67434-3792-45b4-bb8a-bb1355834448
  modified: 2026-10-04T13:04:39.961Z
---

`docs/ECOSYSTEM.md` → "VectFox (chat memory)" is the complete reference, verified against VectFox's source (github.com/KritBlade/VectFox,
commit 3623dc8) and the owner's EventBase export (2026-10-04): its role, the EventBase pipeline (cleaning, windows, LLM extraction,
validation, storage format with an example, retrieval and re-rank weights, injection formats), the default prompt's findings on this
card, the full settings table, text cleaning, and the card's own extraction prompt (source `src/vectfox/vectfox_eventbase_prompt.txt`, download copy in `dist/`).

**Why:** the owner asked (2026-10-04) for this so they never have to send the VectFox repository or a memory export again.

**How to apply:** for any VectFox question, read that section first. Re-verify against the repository only when VectFox has updated past
3623dc8 or a detail is not covered, and update the section when you do. Key facts: EventBase stores LLM-extracted events, not prose; only
`{{text}}` / `{{maxCount}}` are filled in its prompt; the card's division of labour is state (hard facts) / Journal (spine) / VectFox
(scene details). Related: [[audit-batch-plan]].
