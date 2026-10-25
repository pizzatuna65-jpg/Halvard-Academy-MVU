---
name: audit-batch-plan
description: "\"kerjakan/perbaiki batch N\" = do exactly batch N of the newest audit batch list as one release; 1.98 (shallow features) done 1.98.1–1.98.3; 1.99 became Summaryception (1.99.1); next list = the bug-hunt audit after it; memory batch 8 (chapters) still planned"
metadata:
  node_type: memory
  type: project
  originSessionId: 3e99ac4f-6274-4d99-9fb3-9de01e461f91
  modified: 2026-10-24T05:34:36.805Z
---

The owner triggers audit work with one phrase: "kerjakan batch N" / "perbaiki batch N" = do only batch N of the newest audit's batch
list as one release (CLAUDE.md release rules), after its "Bergantung pada" batches, then set its Status row to "selesai (versi,
commit)". Owner decisions inside a batch follow silence = approval ([[no-obvious-open-questions]]).

**Why:** one phrase, one batch, nothing else.

**How to apply (state 2026-10-21):**
- Every batch of every audit (2026-10-03 fixes and features, 2026-10-04 narrator load, 2026-10-05 memory) is done (history: CHANGELOG
  index 1.42.0–1.67.0). Only **memory batch 8** (M14, chapters: a new chat file without losing memory) remains, planned in
  `planning/DRAFT_bab_baru.md`. Build it when the owner says "kerjakan batch 8" or mentions about 20,000 messages, slow saves or a chat
  file near 100 MB: verify the draft's §7 items against upstream source first, build it as one release, delete the draft.
- **Newest batch list (2026-10-21):** `audit/AUDIT_2026-10-21_2_megumin_suite.md` §6, all done: 1.78.0 (MS2 Fortune numbers, MS5 Extras
  Looks), 1.79.0 (MS1 bracelet "This reply", computed never stored: DECISIONS §7), 1.80.0 (MS4 recall from `lastUserMessage` in 505,
  MS3 stage 1 in `audit_chat.py --mechanics`). MS3 stage 2 waits in FUTURE_PLANS §2 for export evidence. A bare "kerjakan batch 8"
  means memory batch 8.
- **Version numbering (owner, 2026-10-24):** bug-hunt batch 8 shipped as 2.0.0 (GitHub main, PR #16; 1.99.14 quest autopilot after
  it). The polish-only release is scrapped: never mention it again. The next release, whatever it is, is 2.1.0. The "world in motion"
  roadmap (FUTURE_PLANS §0.1, on GitHub main since 47e4fab) numbers 2.1.0–2.5.N assume it ships first; other work shipped earlier
  takes the next number and the roadmap moves up one. The only bug-hunt work left is batch 7 stage 2. A bare "kerjakan batch 8" now
  means memory batch 8 (chapters). Always check GitHub first: [[check-github-first]].
- **1.98 is done (2026-10-23):** from `audit/AUDIT_2026-10-23_1_kedalaman_fitur.md` the owner picked batches 2, 4, 5 only, released in
  order as 1.98.1 (Dove watch), 1.98.2 (gossip, Investigate, projects), 1.98.3 (Council petitions, Healing Ward); the draft is deleted
  (never committed) and the unpicked batches (Dorm Days, Battle, UI tools F1–F7) are summarised in FUTURE_PLANS §2. A bare "kerjakan
  batch N" now waits for the bug-hunt audit, or means memory batch 8 with chapters in view.
- **The bug-hunt audit exists (2026-10-23):** `audit/AUDIT_2026-10-23_2_audit_menyeluruh.md`, batch list in §8 (8 batches: B3 prose
  helper first, preset deviations P1–P4, rule-card token cuts, slop draft, brief lore, extensions, cache experiment, code tidy). A bare
  "kerjakan batch N" now means its batch N (memory batch 8 only with chapters / ±20,000 messages in view). Its measuring scripts are
  `audit/audit_2026-10-23_tok.cjs` and `audit/audit_2026-10-23_slop_scan.py`. Release numbering (decided 2026-10-23): one release per
  batch as 1.99.N in the order shipped; batch 1 (B3 `proseOf`, K4, B2) = 1.99.2, batch 2 (preset D12-D17, Embellish rule 2 gone) = 1.99.3, batch 3 (502 `_card` step-aside, reputation/extras/exposure
  cards; The Vigil, forbidden gifts and Battle stay core lines per DECISIONS §6) = 1.99.4, batch 4 (style pass from a draft:
  `merge_lorebooks.py` STYLE_PASS, the preset's banned words out of card text, T4 Campus Map) = 1.99.5, batch 5 (T5: mentioned-only NPCs get the public part of their lore, toggle mention_brief; `tests/lore_replay.cjs`
  replays a chat's keyword lore) = 1.99.6, batch 6 (E2 canon VectFox example, E4 `vfActive` both-memories warning, E1 note) = 1.99.7, done; batch 7 stage 1 (keyword lore behind the constants, build_card `cache_layout`, `tests/cache_replay.cjs` 0% -> 80-89%) = 1.99.8; playtest fix (held fields tagged in the Cast Sheet) = 1.99.9; birthday line in the Cast Sheet = 1.99.10; presence roll "Who is here" (playtest) = 1.99.11; Look for (owner request) = 1.99.12; thoughts only for NPCs in the scene + Practice tab renamed Action (owner) = 1.99.13; next: batch 8 (K1-K3) = the next release (2.1.0 if first); batch 7 stage 2 (lore at a depth, numberless summary, block trim) waits for the owner's OpenRouter numbers after 1.99.8 and an A/B test; the preset
  is 44 tokens under `test_preset`'s 18,600 budget, so the next preset addition needs a cut or a new budget. `npm run stress` = `tests/stress/run_stress.cjs`.
- When the owner picks a subset of batches, number the releases in order (1.98.1, .2, .3), not by batch number.
- The cast record `tests/fixtures/cast_1560.json` must be renewed whenever Cast Sheet text changes on purpose (1.77.1 forgot; 1.78.0
  fixed it): prove every differing scenario differs only by the intended text, then rewrite the record. The scenarios run the CURRENT engine
  (it embeds npc_canon), so render the old side in a `git worktree add <scratch>/old HEAD` with NODE_PATH at the main node_modules
  and check old render + approved replacements == new render (1.99.5: this caught a field label, Gavlan's "Quietly distrusts:", that
  the info layers read; lore `Label:` names are not style text).
- Since 1.69.0 the card plays in one-call MVU mode ("cukup 1 model"): design update work for one-call first (every entry, `[mvu_update]`
  included, reaches the narrator); keep extra-model parsing working as an option.
- Since 2026-10-24 the owner wants `audit/` committed (it goes to GitHub): commit new audit files with their release. Stage only src tests docs tools dist presets data planning-files-you-changed
  CHANGELOG HANDOFF: `git add -A planning` once committed the owner's own uncommitted deletion.
- After changing rule wording, run every suite that greps it (`grep -l "502" tests/test_*.cjs`); 1.53.0 broke three unnoticed.
- The schema's StrList cap trims a list per command before the engine sees it: give a list headroom so the engine chooses what leaves.
- Owner chat exports: `C:/Users/seora/Downloads/stardew` (use the raw "imported" file, not "fixed"). GitHub's API rate-limits anonymous
  calls: fetch raw.githubusercontent.com files by path. Verified upstream commits are in DECISIONS §11.
