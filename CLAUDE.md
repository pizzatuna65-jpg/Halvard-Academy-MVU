# CLAUDE.md — Eldrasil / Halvard Academy MVU card

Read in this order before doing anything:
1. `HANDOFF.md`: the current snapshot and next task at the top, then project context, architecture, established decisions §4,
   build and tests §5, playbooks §6.
2. `CHANGELOG.md`: the one-line release index at the top and the newest entries (full history below them).
3. The plan the HANDOFF "Next task" names (a `planning/DRAFT_*.md`), and `docs/TEST_CHECKLIST.md` for what still needs a live
   SillyTavern check. The drafts are written in Indonesian; the English text blocks inside them are the approved wording for the
   card or preset.

## Every release

- Bump `src/card/card.json` `character_version` (the engine picks it up via `tools/gen_engine.py`).
- Before changing code, write the current release's save fixture (`node tests/fixtures/make_save.cjs`); `tests/test_saves.cjs`
  then proves that save still loads without losing data. The owner continues one chat across versions and must never restart.
- Rebuild the outputs (`dist/`, `src/scripts/*.js`, `src/ui/statusbar.html`, `presets/*Eldrasil.json` when the preset changes,
  and the TEST cards) so the owner can download the card and preset straight from the repo. No zip unless the owner asks.
- Add a `CHANGELOG.md` entry at the top of the details (what changed, tests, anything to confirm with the owner), a line in the
  release index, and keep the HANDOFF snapshot and "Next task" current. Live-only checks go into `docs/TEST_CHECKLIST.md`
  (new section at the top of "By release"), never into a new checklist file.
- **Testing (owner, 2026-09-27).** For routine changes run only a quick, relevant check with concise output and low usage. The
  full suite, stress tests and broad bug hunts only for a major feature or when the owner asks.

## Owner's standing rules

- **Language.** Talk to the owner in Indonesian. Everything inside the card, preset and UI is English.
- **Card vs preset.** Test each new rule: "would this line still make sense on another card?"
  - **No** (it names Eldrasil, `<now>`, `<cast>`, Bonds, the engine, lore or a canon character) → it goes in the **card**.
  - **Yes** (how to write: point of view, tense, length, language, prose style, whether the AI writes {{user}}, generic
    NPC-writing craft) → it goes in the **preset**, as a toggle the player can change.
  - The preset's CoT **points to** the card's rules and never copies them. A copy in BOLT step 2 went stale for months.
  - The card must work with any preset: checks that read card data (the `<cast>` gate) live in the card.
- **Draft, then proceed.** New canon or lore goes into a `planning/DRAFT_<topic>.md` first (Indonesian notes, English card
  text, open decisions marked `[?]` at the end). Apply it only after the owner says "proceed" / "approve", then update
  `planning/NPC_BRAINSTORM_BRIEF.md`. Code, UI and engine fixes from playtest notes go in directly (no draft); list any canon
  you had to invent under "to confirm with the owner".
- **Design principles.**
  - The campaign has **no endings** and no routes; high ranks open information, never an ending.
  - Rewards must be useful, not mementos, and neither too conditional nor too broken.
  - Systems are anti-grind: tiered XP, weekly caps, about one semester of play to max.
  - Enemies are easier to make than friends: Tension rises are never capped.
  - NPCs react in character. A mechanic must never force an NPC to act against their personality.
  - High faction reputation carries a cost.
- **Canon.** The owner's lorebook (`source_original/` v38, `source_original/npc_lore_*/`) is canon. Approved designs are recorded
  in `docs/design/` (bond rewards, reputation, training) and the approved `planning/DRAFT_*.md` files. Several drafts are read
  by `tools/merge_lorebooks.py`, `presets/edit_preset.py` and the tests: do not move or rename them.
- **Established decisions** in HANDOFF §4 are not changed without the owner's approval. Say which decision a change touches.
- **Engine.** Deterministic and replay-safe; never `Math.random`. Edit sources (templates, `data/*.json`, tools), never generated
  files (HANDOFF §5 table).
- **Verify, don't assume** about SillyTavern, MVU, Tavern Helper, Prompt Template or VectFox: read their source, as HANDOFF §7
  records.

## Environment

- The owner's machine is Windows: `python3` is not on PATH, use `python` (HANDOFF writes `python3`). Node 18+: `npm install`
  first (zod, lodash, yaml, ejs, d3). Since 1.16.1 the folder is a local git repository (no remote): commit each release.
- Keep text files LF.
- `tools/audit_chat.py` measures character drift in an exported chat (.jsonl).
- Portraits are hosted on jsDelivr, pinned to a commit in `data/assets_manifest.json`; `tools/process_assets.py` needs the
  original PNGs, which are not in this repo. Only needed for new portraits.
