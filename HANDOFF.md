# HANDOFF — Eldrasil / Halvard Academy MVU card

Project context for a fresh session with any assistant. Working rules: `CLAUDE.md` (they apply to any assistant). To find the code
or document a task needs without reading the whole project: `docs/INDEX.md`.

**Snapshot:** card **v1.99.11** (2026-10-23): the bug hunt is under way. Its audit `audit/AUDIT_2026-10-23_2_audit_menyeluruh.md`
(untracked) lists 8 batches in §8, one release each as 1.99.N; batches 1–6 and batch 7 stage 1 are done (1.99.2–1.99.8); 1.99.9 and
1.99.10 were playtest fixes (fields a bond holds back are tagged in the Cast Sheet; the sheet carries the birthday). 1.99.11, from a
playtest: who is at a place is rolled (Features "Who is here", `shared.js presenceAt`), at most three names, and an arrival keeps to the
place until the next roll; `tools/audit_chat.py --mechanics` counts roster NPCs brought in unasked. The enabled preset is 18,556 tokens,
44 under `test_preset`'s budget. Memory: VectFox (option 1) or Summaryception 5.5.4 (option 2), one per chat. Live checks: the campaign
quest log `docs/TEST_CHECKLIST.md` (first Act 0: update the card and the preset, Q0.1; Summaryception: SQ-SC; the cache: SQ-CACHE; who is
here: Act 1 Q1.1).

**Next task:** the bug-hunt audit's batch 8 (K1–K3 code tidy, `ENGINE_DIFF` with no difference) as 1.99.12.
Batch 7 stage 2 (keyword lore at a depth in the chat, a summary line without a counter, history trimmed by blocks) waits for the
owner's OpenRouter numbers after 1.99.8 (SQ-CACHE) and an A/B test with `tools/audit_chat.py`. Then 2.0 polish. The World Competition's
Year 2 host (Caelmar: Area, map, liner) waits in FUTURE_PLANS §1 [YEAR 2]. MS3 stage 2 and the NPC dialogue audit's U1, U3–U5 wait in
`planning/FUTURE_PLANS.md` §2 for a campaign export. Memory batch 8 (chapters) is planned in `planning/DRAFT_bab_baru.md`: build it at
about 20,000 messages, slow saves or a chat file near 100 MB.

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
audit/                     owner-ordered audits (Indonesian, mostly untracked); a bare "kerjakan batch N" = memory audit-batch-plan
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
