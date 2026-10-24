---
name: preset-rebuild-rf2213
description: Since 1.68.0 the Eldrasil preset is RF 2.2.1.3 (Realistic Gemini BOLT) as it ships plus a closed deviation list; never patch upstream text for taste
metadata:
  node_type: memory
  type: project
  originSessionId: 3e1fdb23-9010-494d-985b-8a4baf1d079b
  modified: 2026-10-20T14:34:04.916Z
---

On 2026-10-14 the owner felt the Eldrasil preset "feels different" from the original Realistic Frankenstein and asked for a
sentence-by-sentence audit of RF 2.2.1.3, then a rebuild if patching would be endless. The audit is
`audit/AUDIT_2026-10-14_1_preset_RF2213.md` (untracked); the owner said "proceed" without answering Q1–Q3, so the recommendations were
built (silence = approval, [[no-obvious-open-questions]]): Realism Mode + NSFW register ON, RF's Gemini smell path + no smell-naming
ambience cues, sampling 0.7 / 0.8. Released as 1.68.0.

**Why:** the old edit (RF 2.2 + ~90 replacements, "one rule one home") removed the creator's deliberate redundancy and Gemini tuning.
The owner wants RF's own feel; DECISIONS §9 now says "Preset = upstream as it ships".

**How to apply:** preset work goes in `presets/edit_preset.py` as a deviation with a reason (card need, pointer fix, owner toggle, generic
Eldrasil prompt); `tests/test_preset.cjs` fails on any other difference from upstream. Never add craft rules into upstream modules; a
new rule is its own toggle. New upstream release: BUILD.md "Preset work" playbook. The owner's own RF reference play uses RF 2.2.1.x
Gemini configs (reasoning max in their Multi-POV and NPC POV copies). Gemini 3.8 ignores temperature/top-p (Google), so never blame or
tune sampling. The owner's preset research library is `D:/Claude Project/Sillytavern Preset/Perpustakaan` (books 01–24, audits of 15
presets incl. RF and Worldhopper): read its relevant books before any preset decision. Related: [[audit-batch-plan]], [[sillytavern-install]].
