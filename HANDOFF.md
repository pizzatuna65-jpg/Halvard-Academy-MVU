# HANDOFF — Eldrasil / Halvard Academy MVU card

Project context for a fresh session with any assistant. Working rules: `CLAUDE.md` (they apply to any assistant). To find the code
or document a task needs without reading the whole project: `docs/INDEX.md`.

**Snapshot:** card **v1.95.0** (2026-10-22): 1.95.0 letters: every letter posted at the Mail Tower gets a reply on a timer or none,
family and close friends sometimes write first, a letter written elsewhere waits to be posted (`data/letters.json`, `stepMail`).
1.94.0 your own notes on each person (dossier box, 📝 on the card; chat variable
`eld_notes`). 1.93.1: a gold glow on pinned cards. 1.93.0: UI fixes from the owner's notes: event plans as a time | what table (Event tab,
Planner), short points for long explanations, the Bonds order as a dropdown with ascending / descending, pinned people on top (UI
only, chat variable `eld_pins`). 1.92.0: the weekly club client (a non-member student comes to {{user}}'s service club some weeks). 1.91.0: club services (Tailoring and Smithing orders and mending at
the Workshop, the Fishing Club's dawn, the Library Assistants' loan and records; members pay half). 1.90.0: club work for the campus
(the Newspaper, club stalls, snow, the Festival Committee). 1.89.0: info layers per NPC. 1.81.0–1.87.0: the event frame. The memory
audit is done except batch 8. Live checks: the campaign quest log `docs/TEST_CHECKLIST.md` (the owner plays it from the Charles chat,
Y1 M1 W1 Mon 10:13; first Act 0: update the card, Q0.1).

**Next task:** the owner plays the quest log; their reports and chat exports bring the playtest fixes (tick what passed, run
`tools/audit_chat.py` on the export, move "Where you are"). MS3 stage 2 and the NPC dialogue audit's U1, U3–U5 wait in
`planning/FUTURE_PLANS.md` §2 for a campaign export. Batch 8 (chapters) is planned in `planning/DRAFT_bab_baru.md`: build it at about
20,000 messages, slow saves or a chat file near 100 MB.

## 0. Starter prompt (for the owner to paste into a new chat)

> Read your memory files (every file `MEMORY.md` lists), `CLAUDE.md` and `HANDOFF.md`, then use `docs/INDEX.md` to open only
> what the task needs. Do this: **<task>**.

Examples of `<task>`: "fix what my playtest found: <notes>", "bug hunt the engine and UI", "add a new NPC from this lorebook
entry", "update lore entry X", "add feature Y".

## 1. What this is

A **SillyTavern character card** for a slice-of-life magic-academy roleplay: Halvard Academy, Kingdom of Eldrasil, with a mystery
underneath. The player is a first-year student. The card combines:

- **A merged, corrected lorebook**: world, 71 NPCs (6 arrive in campaign Year 2, 7 in Year 3), 75 locations, calendar, rules.
- **MVU (MagVarUpdate) state.** The AI ends every reply with an `<UpdateVariable>` JSONPatch block. A Zod schema validates the state,
  and a deterministic engine script enforces the rules: clock and calendar, weather, HP and injuries, mana, bonds, reputation,
  training, grades, hidden magic, payouts, journal, ambience and more.
- **A UI**: an in-chat "bracelet" status bar (a regex replaces MVU's placeholder) and a Tavern Helper script with panels: Student
  Builder, Student file (with Settings → Features), People (dossiers, relationship graph), Map, Inventory (Bag, Wallet, planner, journal), Activities, Battle.
- **Ecosystem compatibility** with the owner's memory extension (VectFox) and prompt preset (Realistic Frankenstein 2.2.1.3, the
  Realistic Gemini BOLT configuration as it ships plus what the card needs): `docs/ECOSYSTEM.md`.

**Division of labour (do not blur it):**

| Job | Owner |
|---|---|
| Game state and trackers | Card (MVU + engine) only |
| Prose style, POV, length, generic NPC-writing craft, reasoning (CoT) | Preset (as toggles; the card carries none of these) |
| Long-term memory of old scenes | VectFox (EventBase) |
| Lore activation | Characters in `Scene.Present`: the card's Cast Sheet (custom 509). Everything else: SillyTavern keyword World Info |

## 2. Repository map

```
CLAUDE.md, HANDOFF.md      working rules; this snapshot
CHANGELOG.md               newest releases in detail, then a one-line index of every release
docs/INDEX.md              task → files and symbols; engine, UI, state, entries and data maps   (read before opening code)
docs/FEATURES.md           every feature, one line each: what it does, its code, data, toggle and tests (grep it)
docs/DECISIONS.md          established decisions (owner approval needed to change) + verified external facts
docs/BUILD.md              build order, generated vs hand-written files, test commands, playbooks
docs/TEST_CHECKLIST.md     live SillyTavern checks as a campaign quest log (in-game order, "Where you are" at the top)
docs/PLAYER_GUIDE.md, ECOSYSTEM.md, rentry/   player-facing docs
planning/FUTURE_PLANS.md   everything not done yet: owner plans, unchosen ideas, pending decisions, tunables
planning/NPC_BRAINSTORM_BRIEF.md   brief for designing NPCs with another AI (kept by hand)
planning/NPC_ROSTER.md     every NPC in one file: quick table + full profiles (generated; for NPC brainstorms)
planning/DRAFT_*.md        only while a draft awaits approval or is being applied; deleted in the release that applies it
audit/                     owner-ordered audits (Indonesian, mostly untracked); a bare "kerjakan batch N" = memory audit-batch-plan
source_original/           owner's lorebook v38 and NPC lore passes (canon, pipeline input, never edited)
src/                       card sources: worldbook/ (generated lore + hand-written custom/ 500–510), scripts/, ui/, regex/, card/,
                           vectfox/ (the VectFox cleaning patterns and extraction prompt; copied to dist/)
data/                      curated single sources (docs/INDEX.md §7)
tools/, build/             generators and the card assembler (tools/build_all.py runs them in order)
dist/                      the ONE download folder: card, preset, VectFox files; test/ TEST cards; lorebook_v39/ standalone export
presets/                   edit_preset.py and original/ (the edited preset is written to dist/)
tests/                     node suites (index: tests/README.md), save fixtures, stress, browser previews
Maps/                      the season and event map images (live copies are in the assets repo)
```
