---
name: only-halvard-chats
description: "Never read, list or inspect any SillyTavern chat except the Eldrasil — Halvard Academy ones (owner, 2026-10-24)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4be21a9e-ac7f-4ac9-9fcf-4133ae666bd7
  modified: 2026-10-23T18:05:07.407Z
---

In the owner's SillyTavern (`D:/Game/SillyTavern/SillyTavern/data/default-user/chats/`) and their exports, touch only the Halvard chats
(`Eldrasil — Halvard Academy*` folders and files). Never open, grep, list or check the timestamps of any other character's chat.

**Why:** 2026-10-24, while hunting why the prompt cache stayed at 0%, I listed the chat files modified that day across every character
(Mizuki, Nyrissa, The Adventurer Guild...) to find which card had the 18% cache hits. The owner said "jangan baca chat yg gk perlu",
then "ingat untuk tidak pernah baca chat apapun selain halvard". Their other chats are private and not part of this project.

**How to apply:** scope every `find`, `ls`, `grep` or read under `chats/` to the Halvard folder; when evidence from another card would
help, ask the owner for the number instead of looking. Related: [[sillytavern-install]], [[summaryception-reference]].
