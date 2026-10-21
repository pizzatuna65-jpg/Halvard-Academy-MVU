# HANDOFF — Eldrasil / Halvard Academy MVU card

Project context for a fresh session with any assistant. Working rules: `CLAUDE.md` (they apply to any assistant). To find the code
or document a task needs without reading the whole project: `docs/INDEX.md`.

**Snapshot:** card **v1.84.0** (2026-10-21): the Kingdom Competition in three rounds (the owner's design, DECISIONS "Kingdom
Competition in three rounds"): the Kingsmeadow hunt for three Kingsblooms, the Undercroft's ten rooms, the final; the other teams
played by the engine from the seed, the World panel's pick from every competitor's record. 1.83.0: release B of
`planning/DRAFT_event_frame.md`: breaks (who stays, going home in one reply) and Secret Fools Day's draw with Merryhew's sale. 1.82.0: release A2: the Dorm Competition's brackets drawn
from the seed ({{user}}'s bouts in `<now>`, Placement and Status by the engine, Training Week scout, the bracket on the Competition
tab) and the Club Festival coin vote. 1.81.0: the event frame, release A1: every calendar event has an
id and a kind, `<now>` gets one Event line per event today (now, next), Activities → Event, event chances (the old event XP moved
there) and the Star Night market stalls. 1.80.0: `<now>` brings back older record lines named in the player's own new message, and
`audit_chat.py --mechanics` lists Clues and planted details the story never showed (Megumin Suite audit batch 3: MS4, MS3 stage 1).
1.79.0: the bracelet's "This reply" fold (batch 2). 1.78.0: `<now>` gives three Fortune numbers, one per
attempt in order, and an Extras record's Looks describe an ordinary day (batch 1: MS2, MS5). 1.77.1: a Cast Sheet's Carries line says the things come up
when the scene calls for them. 1.77.0: a Lore change may last a while (Until), and `<now>` says how {{user}} looks. 1.76.0: the roster
spread over more clubs (Camping Club). 1.75.0: a club {{user}} founds is a club like any other. 1.74.0: word gets around, ties; 1.73.0:
time apart; 1.72.0: special days; 1.70.0/1.71.0: scene cards; 1.69.0: one model per turn; 1.68.0: the preset is Realistic Frankenstein
2.2.1.3 as it ships. The memory audit is done except batch 8. Live checks: the campaign quest log `docs/TEST_CHECKLIST.md` (the owner
plays it from the Charles chat, Y1 M1 W1 Mon 10:13; first Act 0: update the card, Q0.1).

**Next task:** `planning/DRAFT_event_frame.md` release C (`tally` for Sports Day and the Showcase; the Academy tier, whose computed
winner then becomes Halvard's Kingdom team in `sh:kcTeams`) before the campaign reaches M6 W3; then D–E by their dates (§7); the draft has no open question left. Meanwhile the owner plays
the quest log; their reports and chat exports bring the playtest fixes (tick what passed, run
`tools/audit_chat.py` on the export, move "Where you are"). The Megumin Suite audit (`audit/AUDIT_2026-10-21_2_megumin_suite.md`
§6): all three batches are in (1.78.0–1.80.0); MS3 stage 2 waits in `planning/FUTURE_PLANS.md` §2 until an
export shows Clues the story never showed. Batch 8
(chapters) is planned in `planning/DRAFT_bab_baru.md`: build it at about 20,000 messages, slow saves or a chat file near 100 MB. The
NPC dialogue audit: U1 and U3–U5 wait in `planning/FUTURE_PLANS.md` §2; the first campaign export on 1.77.1+ is their baseline.

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
