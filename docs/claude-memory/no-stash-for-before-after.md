---
name: no-stash-for-before-after
description: "Never use git stash to measure \"before\" (token_audit, tests) — the build rewrites tracked dist/ files and stash pop then fails"
metadata:
  node_type: memory
  type: reference
  originSessionId: 91887b11-8d2b-4dc3-a036-d135ca7a1e4a
  modified: 2026-10-04T18:08:26.242Z
---

On 2026-10-05 (1.60.0) I ran `git stash` → `build_card.py` → `token_audit` → `git stash pop` to compare tokens with the last release.
The build rewrote the tracked `dist/Eldrasil_Halvard.json` / `.png`, so `stash pop` aborted and the whole release sat in the stash
until I ran `git checkout -- dist/...` and popped again.

**How to apply:** for a before/after number, use the CHANGELOG's recorded figures, or `git worktree add <scratchpad>/old HEAD` and run
the build there. If a stash is ever needed, `git checkout -- dist/` before popping. Related: [[audit-batch-plan]].
