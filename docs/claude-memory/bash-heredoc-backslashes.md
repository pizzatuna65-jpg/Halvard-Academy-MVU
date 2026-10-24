---
name: bash-heredoc-backslashes
description: On this machine the Bash tool collapses doubled backslashes inside heredocs; write Python edit scripts with the Write tool
metadata:
  node_type: memory
  type: reference
  originSessionId: 7da2430f-f7fa-409e-9ba4-93311195d076
  modified: 2026-10-02T22:45:52.467Z
---

In this project's Bash tool (Windows Git Bash), a quoted heredoc (`python - <<'PYEOF'`) still reached Python with `\\` collapsed to
`\`. An assert-based replace of JS text containing `\\b` or `\'` then failed to match, or would have written the wrong escape.

**How to apply:** for scripted edits of JS/EJS/regex text with backslashes, write the Python script with the Write tool into the
scratchpad and run it (`python <file>`). Plain text without backslashes is fine in a heredoc. Related: [[audit-batch-plan]].
