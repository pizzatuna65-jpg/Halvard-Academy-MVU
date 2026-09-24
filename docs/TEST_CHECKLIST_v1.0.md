# Test checklist — card v1.0

Automated before release (all passing for v1.0): every `tests/test_*.cjs` (174 checks), `tests/qa_static.cjs` (built card:
PNG chunks, uids, tags, config override, EJS for all 12 months, regex, script syntax, pinned assets), `tests/preview/smoke_all_panels.py`
(224 panel/tab views, no page errors).

## In SillyTavern (cannot be automated)
- [ ] New chat: MVU logs the variable structure; the bracelet shows under the greeting.
- [ ] MVU panel → current card config shows the override (update mode "with AI output").
- [ ] Builder: register a sample student; the hidden "Student file registered" message appears and the bracelet updates.
- [ ] Three turns: time advances, the patch applies, the update block folds.
- [ ] Swipe and delete a message: variables return to the right state (and the day's happening stays the same on swipe).
- [ ] Mana: a sustained effect across a time skip is charged once.
- [ ] HP: a hit over 40 without the lethal flag is capped; the condition label changes.
- [ ] No module/tab appears before its unlock condition.
- [ ] Prompt itemization: messages at depth ≥ 24 are `[…]`; no `$ui`/`$eng`/`$Known_old` in `<current_state>`.
- [ ] Extra model analysis mode (switch in the MVU panel): `[mvu_update]` entries go to the update model only.
- Batch 5 module checks: `docs/TEST_CHECKLIST_v0.5.md`.
