---
name: reuse-existing-systems
description: "Before building a feature, check it is really new and wire it into the existing system; never build a parallel one (owner, 2026-10-04)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 37b74117-c21e-4b92-b473-6eba1fdff114
  modified: 2026-10-20T18:20:51.065Z
---

When implementing a feature, first check whether it, or a system it should use, already exists. Build only what is new, and
connect it to the existing system instead of making a separate one that should have been connected.

**Why:** in the NPC routines draft (feature batch 4), the owner asked for a 70% "usually" roll. I wrote it as a new
`hash32(seed, day, npc, row)` check. Seeded draws already exist in `src/scripts/shared.js` (`roll100`, `pickOf`, `rollInt`,
`rollTable`, since 1.43.0), and DECISIONS requires every seeded chance to go through them. The owner had to point it out ("the roll
system already exists, it is not a new feature"). The 2026-10-03 audit's whole program was removing exactly such duplicate systems.

**How to apply:**
- Since 2026-10-21 `docs/FEATURES.md` lists every feature with its code: grep it (or read it whole when recommending features)
  before any idea, draft or code; then `shared.js` and DECISIONS for helpers: draws, the Agenda, `whereabouts`, the Area module,
  `ledger` / `bagTake`, practice sessions, `$ui.now`.
- In drafts, name the existing function that will do the work.
- No raw `hash32(...) % n` in engine code: use `rollInt` / `pickOf` / `roll100`.
- Feature suggestions too: 2026-10-21 I proposed "exam-season mood" and "morning/night person" for NPCs; both already existed
  (`npc_moods.json` `clock`, `exams`, `trials`; `mood_gifts.js` `moodOf`) and the owner caught it. Before listing an idea, read the
  data file's fields and the function that consumes them, not only grep the engine for a keyword.
- Same day, again: I proposed "NPC birthdays on the Planner calendar" (F3); `30_notebook.js` had shown every dossier-opened birthday
  since 1.44. Grep `src/ui/parts/*.js` and `ui.template.js` too, not only the engine, before calling a UI idea new.
- Related: [[audit-batch-plan]], [[no-obvious-open-questions]].
