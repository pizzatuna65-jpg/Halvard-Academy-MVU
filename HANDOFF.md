# HANDOFF — Eldrasil / Halvard Academy MVU card

Project context for a fresh session with any assistant. Working rules: `CLAUDE.md` (they apply to any assistant). To find the code
or document a task needs without reading the whole project: `docs/INDEX.md`.

**Snapshot:** card **v1.99.14** (2026-10-24): live checks run themselves. The quest log's machine-checkable checks are rules in
`data/live_checks.json` (69, Acts 0–2 and the side quests), carried in the card's `data.extensions.eldrasil_live_checks` (0 tokens)
and judged on every reply by the **Eldrasil Black Box** extension (separate repository `pizzatuna65-jpg/Eldrasil-BlackBox` 1.1.0:
prompt, tokens, cache, cost, saves, engine signals, quest autopilot, playtest bundle). After a session the owner sends the bundle:
tick with `python tools/quest_ticks.py <bundle> --write`, judge the listed review checks from its evidence, read
`tools/audit_chat.py <bundle> --blackbox`. The bug-hunt audit `audit/AUDIT_2026-10-23_2_audit_menyeluruh.md` §8: batches 1–7 stage 1
done (1.99.2–1.99.8); 1.99.9–1.99.13 were owner requests. The enabled preset is 18,516 tokens. Memory: VectFox (option 1) or
Summaryception 5.5.4 (option 2), one per chat. Live checks: `docs/TEST_CHECKLIST.md` (Act 0 Q0.1 first; SQ-BB for the Black Box).

**Next task:** the bug-hunt audit's batch 8 (K1–K3 code tidy, `ENGINE_DIFF` with no difference) as 1.99.15. When "Where you are"
reaches Act 2, give Act 3's checks their rules. Batch 7 stage 2 (keyword lore at a depth in the chat, a summary line without a
counter, history trimmed by blocks) waits for the owner's cache numbers (SQ-CACHE, now from the Black Box) and an A/B test; the
Semi-strict post-processing test (OpenRouter may move system messages into Gemini's system instruction) needs the owner's approval
(DECISIONS §11). Then 2.0 polish. The World Competition's Year 2 host (Caelmar) waits in FUTURE_PLANS §1 [YEAR 2]. MS3 stage 2 and the
NPC dialogue audit's U1, U3–U5 wait in `planning/FUTURE_PLANS.md` §2 for a campaign export (a Black Box bundle serves). Memory batch 8
(chapters) is planned in `planning/DRAFT_bab_baru.md`: build it at about 20,000 messages, slow saves or a chat file near 100 MB (the
Black Box warns at 80 / 100 MB and slow saves).

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
  each reply's final prompt, tokens, cache, cost, saves and engine signals; ask the owner for its bundle with a playtest note and
  read it with `tools/audit_chat.py <bundle> --blackbox` (docs/ECOSYSTEM.md).
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
