---
name: summaryception-reference
description: "Summaryception (memory option 2 since 1.99.1) is written up in docs/ECOSYSTEM.md; the project supports only Lodactio 5.5.4 in Extension/Extension-Summaryception-main; the fork in the owner's SillyTavern is unrelated"
metadata:
  node_type: memory
  type: reference
  originSessionId: ff59a22d-f8c9-4be2-a082-7582c6ff8a86
  modified: 2026-10-23T05:55:02.993Z
---

`docs/ECOSYSTEM.md` → "Summaryception (chat memory, option 2)" is the complete reference, verified against Lodactio's 5.5.4 source (the
copy in `Extension/Extension-Summaryception-main`, untracked), SillyTavern 1.18.0 and MVU 438f9ff: trigger, raw uncleaned input,
one prompt for Layer 0 and promotions, injection fixed at IN_CHAT depth 12 user role, ghosting via `/hide` + `sc_ghosted`, connection
modes (Default switches preset toggles off during the call; Profile passes options as max_tokens; OpenAI Compatible is clean), settings.

**Why:** the owner wants a second memory option beside VectFox (one per chat, never a fork of the extension, only settings and prompts).

**How to apply:** read that section before any Summaryception question; card files live in `src/summaryception/` (copied to `dist/`).
The copy in the owner's SillyTavern (`D:/Game/SillyTavern/.../extensions/Extension-Summaryception`, vadash's fork) has nothing to do
with the project (owner, 2026-10-23, after I listed its settings as an audit finding): never audit, compare or report its settings;
audit and verify only against `Extension/Extension-Summaryception-main`. Related: [[vectfox-reference]], [[one-download-folder]],
[[audit-batch-plan]].
