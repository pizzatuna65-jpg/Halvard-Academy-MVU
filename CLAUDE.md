# CLAUDE.md — Eldrasil / Halvard Academy MVU card

Read in this order before doing anything:
1. `HANDOFF.md` (project context, architecture, established decisions §4, build and tests §5, playbooks §6)
2. `PROGRESS.md` (chronological log; the latest entries are 1.4.6 and Batch 0)
3. `planning/DRAFT_batch_plan.md` (**the approved plan and the source of truth for what to build next**)
4. Its source drafts, when a batch refers to an item by number: `planning/DRAFT_consistency.md` (P1–P14),
   `planning/DRAFT_mvu_inspiration.md` (N1–N13), `planning/DRAFT_preset_update.md` (U1–U13, D1–D8),
   `planning/DRAFT_card_vs_preset.md` (which items go to the card and which to the preset, plus the generic preset texts).
   The drafts are written in Indonesian; the English text blocks inside them are the approved wording for the card or preset.

## The task (handed over 2026-09-26)

The owner approved the whole character-consistency plan. Build it, in this order, without stopping for playtests:
**1.5.0 → 1.5.1 → 1.6.0 → 1.6.1 → 1.6.2**, then write the G1 canon draft and stop.

- The owner playtests **once, at the end** (after G1 is approved and applied). Between releases, verify headless only:
  `npm test`, `npm run stress`, `node tests/token_audit.cjs`, and the preset build run twice (byte-identical).
- Anything that can only be checked inside SillyTavern goes into PROGRESS "To verify in ST". Do not guess about it.
- **Batch G is new canon** (voice examples, Stages, anchors, stability type per NPC). Write `planning/DRAFT_voices.md` for the
  8 key NPCs of G1 and **stop**. Canon is applied only after the owner approves it NPC by NPC. Never write canon into the lore
  without that approval.
- Every release: bump `src/card/card.json` `character_version` (the engine picks it up via `tools/gen_engine.py`), add a
  PROGRESS entry (what changed, tests, anything to confirm with the owner), keep HANDOFF current, and commit with the message
  `Release <version>: <summary>`. Commit the built outputs too (`dist/`, `src/scripts/*.js`, `presets/*Eldrasil.json`) so the
  owner can download the card and preset straight from the repo. No zip unless the owner asks.
- Every release must include a test that a save from the previous release still loads without losing data (`fillShape`,
  `$eng.ver`). The owner continues one chat across versions and must never have to restart.

## Owner's standing rules (from earlier sessions; follow them)

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
- **Canon.** The owner's lorebook (`source_original/`, `source_original/npc_lore_2026-09-25/`) is canon. Planning notes in
  `planning/lore_*.md`, `bond_rewards.md`, `reputation.md`, `training.md` record approved designs.
- **Established decisions** in HANDOFF §4 are not changed without the owner's approval. Say which decision a change touches.
  The approved plan already covers one: Batch B changes "Lore activation → keyword WI" for NPCs in `Scene.Present`
  (update HANDOFF §1 when you do it).
- **Engine.** Deterministic and replay-safe; never `Math.random`. Edit sources (templates, `data/*.json`, tools), never generated
  files (HANDOFF §5 table).
- **Verify, don't assume** about SillyTavern, MVU, Tavern Helper, Prompt Template or VectFox: read their source, as HANDOFF §7
  records.

## Environment

- Linux in the cloud: `python3` works (HANDOFF uses it). Node 18+: `npm install` first (zod, lodash, yaml, ejs, d3).
- Keep text files LF.
- `tools/audit_chat.py` measures character drift in an exported chat. There is no MVU chat to baseline yet; the owner's first
  playtest after G1 provides it.
- Portraits are hosted on jsDelivr (`data/assets_manifest.json`); `tools/process_assets.py` needs the original PNGs, which are
  not in this repo. Only needed for new portraits.
