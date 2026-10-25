---
name: check-github-first
description: "Work also lands on GitHub main from cloud/worktree sessions; git fetch and compare master with origin/main before trusting HANDOFF, card.json or memory"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 280625c6-c8fe-4173-886b-33e490464183
  modified: 2026-10-24T05:34:36.897Z
---

Since 2026-10-24 the owner also works through cloud and worktree sessions that merge `claude/*` branches into GitHub `main` by PR.
The local checkout `D:\Halvard-Academy-MVU-main` does not follow them on its own.

**Why:** 2026-10-24 I read the local HANDOFF (1.99.13, "next: batch 8") and planned on it, while GitHub main already had batch 8 as
2.0.0, 1.99.14 and Black Box (local was 8 commits behind). The owner had to show me the GitHub page and asked why I, and other
sessions, did not know the latest version. The other way round, local-only commits are invisible to cloud sessions.

**How to apply:** at the start of every task run `git fetch origin` and `git status -sb`. If master is behind or has diverged from
`origin/main`, tell the owner in one line and bring it up to date before reading HANDOFF/FUTURE_PLANS as the truth. Pushing still
needs the owner's word; when the owner asks to put something on GitHub, commit it on top of `origin/main` (a worktree) so local-only
commits are not pushed unasked. Related: [[audit-batch-plan]].
