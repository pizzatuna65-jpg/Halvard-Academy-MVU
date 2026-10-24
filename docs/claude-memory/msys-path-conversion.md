---
name: msys-path-conversion
description: "Git Bash rewrites env values and args that start with \"/\" (a regex like '/\\$ui/...' arrives mangled); avoid a leading slash or set MSYS_NO_PATHCONV=1"
metadata:
  node_type: memory
  type: reference
  originSessionId: d005064b-1d6a-4328-89a3-517a09f99430
  modified: 2026-10-03T03:01:09.280Z
---

On this Windows machine the Bash tool is Git Bash (MSYS). A value starting with `/`, such as `ENGINE_DIFF_IGNORE='/\$ui/capital/...'`,
is converted as a path: it reached node as `//$ui/capital/d+/...` (backslashes gone), so the regex never matched.

**How to apply:** write such regexes without a leading slash (`capital/ev/[0-9]+/(ride|tour)$`) and/or `export MSYS_NO_PATHCONV=1`
first. Related: [[bash-heredoc-backslashes]].
