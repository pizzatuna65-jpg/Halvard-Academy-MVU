# Test checklist — card v0.5 (Batch 5: 5.1 + 5.2 + 5.3)

Import `dist/Eldrasil_Halvard.png`, **accept the embedded lorebook import** (needed for 5.3's MVU config override), start a new chat.

## 5.1 Notebook
- [ ] Planner: now card, commitments sorted by due, "Go here" fills the chat box; overdue commitment shows a red bar chip once.
- [ ] Notice Board tab appears after the first notice or on entering the castle; official postings follow the calendar.
- [ ] Letters: a waiting letter gives a bar chip; "Collect and read" / "Reply" draft into the chat box.
- [ ] Mystery Board appears after the first clue; journal lines are date-stamped.

## 5.2 Activities & Battle
- [ ] Clubs list, "Ask to join"; joining writes a journal line. Competition tab from Month 3.
- [ ] Shop: Buy is disabled when unaffordable; Price Guide entry triggers on "buy"/"price".
- [ ] "In battle" chip opens the Battle panel; Use / Trigger draft actions.

## 5.3 Happenings, memory, config override
- [ ] MVU panel → current card config shows **overriding** with update mode "with AI output". (If it says not active: the card's lorebook is not bound.)
- [ ] Advance a few in-world days: on some days a "Now: <place>" / "<hour>:00 <place>" chip appears; the Planner shows the happening card with Go here.
- [ ] Swipe the reply on a day with a happening: the same happening comes back (seeded, not random).
- [ ] No happening during Mid-Year Break, the Thinning week, or Month 12.
- [ ] Student file → Settings → Off: a hidden note is added, the chip disappears on the next update. Set it back to Normal.
- [ ] After ~24+ messages, check the prompt (Prompt Itemization / console): older messages are sent as `[…]`; `<current_state>` still carries Journal, Bonds, Campus_State.
- [ ] Past 30 journal lines: the oldest move to the archive (faded in Notebook → Journal), and are not in `<current_state>`.
- [ ] `$ui.archive`, `$ui.hap`, `$eng.seed` do not appear in `<current_state>` (the `$` fields must stay hidden from the AI).
