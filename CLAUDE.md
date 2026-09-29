# CLAUDE.md — Eldrasil / Halvard Academy MVU card

## Read only what the task needs

1. `HANDOFF.md` (short): snapshot, next task, what the project is, repository map.
2. `docs/INDEX.md`: find the task, then open **only** the files and symbols it names. Grep for the symbol and read about 150 lines
   around it; never read a whole large file (the engine, the UI template, CHANGELOG, TEST_CHECKLIST, lore content).
3. Only when the task touches them: the matching section of `docs/DECISIONS.md`, `docs/BUILD.md` (build, generated files,
   playbooks), the newest `CHANGELOG.md` entry, the "Open" list of `docs/TEST_CHECKLIST.md`, `planning/FUTURE_PLANS.md`.

Drafts (`planning/DRAFT_*.md`) are written in Indonesian; the English text blocks inside them are the approved wording.

## Every release

- Before changing code, write the current release's save fixture (`node tests/fixtures/make_save.cjs`); `tests/test_saves.cjs`
  then proves that save still loads without losing data. The owner continues one chat across versions and must never restart.
- Bump `src/card/card.json` `character_version` (the engine picks it up via `tools/gen_engine.py`).
- Rebuild the outputs with `python tools/build_all.py` (`--preset` when the preset changes, `--lore` when lore changes) so the
  owner can download the card and preset straight from the repo. No zip unless the owner asks.
- `CHANGELOG.md`: a new entry at the top (what changed, tests, anything to confirm with the owner) and one line in the release
  index at the bottom. Keep details for about the five newest releases; older details leave the file (git keeps them).
- `HANDOFF.md`: replace the snapshot and "Next task" (a few lines, no history). Live-only checks go into
  `docs/TEST_CHECKLIST.md` (new section at the top of "By release", plus a line in its "Open" list).
- Keep the docs current, not historical: a new engine step, file or data file gets its row in `docs/INDEX.md`; a new standing
  decision gets one or two lines in `docs/DECISIONS.md`; a draft applied in this release is **deleted** and anything it left open
  moves to `planning/FUTURE_PLANS.md`; a plan that is done is removed from `FUTURE_PLANS.md`.
- Commit the release (local git, no remote).
- **Testing (owner, 2026-09-27).** For routine changes run only a quick, relevant check with concise output and low usage. The
  full suite, stress tests and broad bug hunts only for a major feature or when the owner asks.

## Owner's standing rules

- **Language.** Talk to the owner in Indonesian. Everything inside the card, preset and UI is English.
- **No pedantry.** Do not nitpick minor things; do flag anything that breaks functionality or contradicts an established decision,
  and name the decision.
- **Card vs preset.** Test each new rule: "would this line still make sense on another card?"
  - **No** (it names Eldrasil, `<now>`, `<cast>`, Bonds, the engine, lore or a canon character) → it goes in the **card**.
  - **Yes** (how to write: point of view, tense, length, language, prose style, whether the AI writes {{user}}, generic
    NPC-writing craft) → it goes in the **preset**, as a toggle the player can change.
  - The preset's CoT **points to** the card's rules and never copies them. A copy in BOLT step 2 went stale for months.
  - The card must work with any preset: checks that read card data (the `<cast>` gate) live in the card.
- **Draft, then proceed.** New canon or lore goes into a `planning/DRAFT_<topic>.md` first (Indonesian notes, English card text,
  open decisions marked `[?]` at the end). Apply it only after the owner says "proceed" / "approve", update
  `planning/NPC_BRAINSTORM_BRIEF.md` when NPCs change, then delete the draft. Code, UI and engine fixes from playtest notes go in
  directly (no draft); list any canon you had to invent under "to confirm with the owner".
- **Design principles.**
  - The campaign has **no endings** and no routes; high ranks open information, never an ending.
  - Rewards must be useful, not mementos, and neither too conditional nor too broken.
  - Systems are anti-grind: tiered XP, weekly caps, about one semester of play to max.
  - Enemies are easier to make than friends: Tension rises are never capped.
  - NPCs react in character. A mechanic must never force an NPC to act against their personality.
  - High faction reputation carries a cost.
- **Canon.** The owner's lorebook (`source_original/` v38, `source_original/npc_lore_*/`) is canon. Approved designs live in the
  data (`data/*.json`), the generated lore and `docs/DECISIONS.md`. Invented content (prices, happenings, UI descriptors) must not
  contradict canon; when unsure, check the lore text in `src/worldbook/content/`.
- **Established decisions** (`docs/DECISIONS.md`) are not changed without the owner's approval. Say which decision a change touches.
- **Engine.** Deterministic and replay-safe; never `Math.random`. Edit sources (templates, `data/*.json`, tools), never generated
  files (`docs/BUILD.md` §2). Save migrations go in `stepMigrate`. Prove a refactor with `ENGINE_DIFF=<old engine.js> npm test`.
- **Verify, don't assume** about SillyTavern, MVU, Tavern Helper, Prompt Template or VectFox: read their source, as
  `docs/DECISIONS.md` §11 records. Mark anything testable only inside SillyTavern as such.

## Environment

- The owner's machine is Windows: `python3` is not on PATH, use `python`. Node 18+: `npm install` first (zod, lodash, yaml, ejs,
  d3, eslint). The folder is a local git repository (no remote): commit each release. Deleted drafts and older changelog details
  are recoverable from git (`git show b62d182:<path>`).
- Keep text files LF.
- `tools/audit_chat.py` measures character drift in an exported chat (.jsonl).
- Portraits are hosted on jsDelivr, pinned to a commit in `data/assets_manifest.json`; `tools/process_assets.py` needs the
  original PNGs, which are not in this repo. Only needed for new portraits.
