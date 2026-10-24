# HANDOFF — Eldrasil / Halvard Academy MVU card

Project context for a fresh session with any assistant. Working rules: `CLAUDE.md` (they apply to any assistant). To find the code
or document a task needs without reading the whole project: `docs/INDEX.md`.

**Snapshot:** card **v2.2.2** (2026-10-24): Routine 2.0 for Year 1–3 and the staff (2.2.0: weighted full-day rows, the routine says
where and a meeting roll says whether {{user}} runs into them; 2.2.1: Year 2–3 and people on their way; 2.2.2: the staff and the others). **No
tests have been run since 2.2.0 (owner: every test waits for 2.2.4).** Before it: 2.1.2 casual magic, 2.1.1 campus phases and fads,
2.1.0 Campus now. The enabled preset is 18,516 tokens, 84 under `test_preset`'s budget. Memory: VectFox (option 1) or Summaryception
5.5.4 (option 2), one per chat. Live checks: the campaign quest log `docs/TEST_CHECKLIST.md` (Act 0 Q0.1 first; Q1.1, Q2.1, Q2.5, Q2.7 (2.2.1 too),
Q3.1, Q3.6 carry the 2.1.x and 2.2.0 checks).

**Next task:** 2.2.3 = Routine 2.0 for the later cohorts (FUTURE_PLANS §0.1 B1): its draft table `planning/DRAFT_routine2_kelompok4.md`
awaits the owner's review; then 2.2.4 development rows **and all the tests** (the list of suites to update is in
FUTURE_PLANS B1). Then off-screen events (2.3.0), the newspaper rubric and consequences (2.4.0), campus politics (2.5.N). Batch 7 stage
2 of the bug hunt waits for the owner's OpenRouter numbers (SQ-CACHE). The Black Box rules for the [2.1.0]–[2.2.0] checks are still to
add (its own repository). Caelmar (Year 2 host) waits in FUTURE_PLANS §1 [YEAR 2]; MS3 stage 2 and the dialogue audit's U1, U3–U5 wait
for a campaign export; memory batch 8 (chapters) in `planning/DRAFT_bab_baru.md` at about 20,000 messages.

## 0. Starter prompt (for the owner to paste into a new chat)

> Read your memory files (every file `MEMORY.md` lists), `CLAUDE.md` and `HANDOFF.md`, then use `docs/INDEX.md` to open only
> what the task needs. Do this: **<task>**.

Examples of `<task>`: "fix what my playtest found: <notes>", "bug hunt the engine and UI", "add a new NPC from this lorebook
entry", "update lore entry X", "add feature Y".

## 1. What this is

A **SillyTavern character card** for a slice-of-life magic-academy roleplay: Halvard Academy, Kingdom of Eldrasil, with a mystery
underneath. The player is a first-year student. The card combines:

- **A merged, corrected lorebook**: world, 77 NPCs (6 arrive in campaign Year 2, 7 in Year 3, 6 belong to the World Competition abroad, one of them, Vesna, a possible transfer), 75 locations (plus the outside areas: the Grand Vast Forest, Avalon, Sunreach Bay, Hanakaze), calendar, rules.
- **MVU (MagVarUpdate) state.** The AI ends every reply with an `<UpdateVariable>` JSONPatch block. A Zod schema validates the state,
  and a deterministic engine script enforces the rules: clock and calendar, weather, HP and injuries, mana, bonds, reputation,
  training, grades, hidden magic, payouts, journal, ambience and more.
- **A UI**: an in-chat "bracelet" status bar (a regex replaces MVU's placeholder) and a Tavern Helper script with panels: Student
  Builder, Student file (with Settings → Features), People (dossiers, relationship graph), Map, Inventory (Bag, Wallet, planner, journal), Activities, Battle.
- **Playtest recorder** (optional, its own repository `pizzatuna65-jpg/Eldrasil-BlackBox`): the Eldrasil Black Box extension keeps
  each reply's final prompt, tokens, cache, cost, saves and engine signals, and its quest autopilot judges the quest log's checks
  (rules in its `data/eldrasil_checks.json`; the card carries none). After a session ask the owner for its bundle: tick with
  `python tools/quest_ticks.py <bundle> --write`, judge the listed review checks, read `tools/audit_chat.py <bundle> --blackbox`
  (docs/ECOSYSTEM.md).
- **Ecosystem compatibility** with a memory extension (VectFox, or Summaryception as the second option) and prompt preset (Realistic Frankenstein 2.2.1.3, the
  Realistic Gemini BOLT configuration as it ships plus what the card needs): `docs/ECOSYSTEM.md`.

**Division of labour (do not blur it):**

| Job | Owner |
|---|---|
| Game state and trackers | Card (MVU + engine) only |
| Prose style, POV, length, generic NPC-writing craft, reasoning (CoT) | Preset (as toggles; the card carries none of these) |
| Long-term memory of old scenes | VectFox (EventBase) or Summaryception (one per chat) |
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
audit/                     owner-ordered audits (Indonesian, tracked since 2026-10-24); a bare "kerjakan batch N" = memory audit-batch-plan
source_original/           owner's lorebook v38 and NPC lore passes (canon, pipeline input, never edited)
src/                       card sources: worldbook/ (generated lore + hand-written custom/ 500–510), scripts/, ui/, regex/, card/,
                           vectfox/ and summaryception/ (the memory extensions' prompts and patterns; copied to dist/)
data/                      curated single sources (docs/INDEX.md §7)
tools/, build/             generators and the card assembler (tools/build_all.py runs them in order)
dist/                      the ONE download folder: card, preset, VectFox and Summaryception files; test/ TEST cards; lorebook_v39/ standalone export
presets/                   edit_preset.py and original/ (the edited preset is written to dist/)
tests/                     node suites (index: tests/README.md), save fixtures, stress, browser previews
Maps/                      the season and event map images (live copies are in the assets repo)
```
