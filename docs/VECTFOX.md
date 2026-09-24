# Using VectFox with Eldrasil (card v1.0.2)

Checked against VectFox commit 3623dc8 (2026-09-21), reading its source. Short answer: **compatible**, with one setting to avoid and a few to adjust.

## Works as is
- **No interference with MVU, Tavern Helper or EJS.** VectFox's extraction and planner calls go straight to the backend API, not through SillyTavern's generation, so they trigger no card scripts, lore or MVU parsing.
- **Hidden messages are skipped.** The Student Builder and Settings notes (hidden system messages) are never stored as memories.
- **Swipes are safe.** Auto-sync holds back the latest turn until a newer one supersedes it, so re-rolls leave no stale events, and it reads each message after MVU has finished with it.
- **The update block is stripped** by VectFox's default cleaning ("Strip <UpdateVariable> Tags (MVU)").

## Avoid: Semantic Lorebook on this card's lorebook
Do **not** vectorize the "Eldrasil — Halvard Academy" lorebook for VectFox's Semantic World Info. VectFox injects matched entries' raw text through its own prompt slot, outside SillyTavern's World Info pipeline:
- EJS entries could arrive as template code instead of rendered text (the calendar, the "Now" line, Royhan's date-gated qualification).
- In MVU's extra-model mode, the `[mvu_update]` rules would reach the story model, bypassing MVU's filtering.
- Entries already triggered by keywords would be sent twice.

The card's lore is designed around keywords and a few constant entries; let SillyTavern handle it. Use VectFox for **chat memory (EventBase)**.

## Adjust
1. **Keep the in-world time in memories (recommended).** By default the whole update block is stripped, including the only place the in-world date appears, so recalled events carry no Halvard date. In VectFox → Text Cleaning (Custom mode):
   untick **Strip <UpdateVariable> Tags (MVU)**, then add the patterns from `vectfox_cleaning_patterns.json` in that order (5 since v1.0.2; the last two handle the Realistic Frankenstein preset's colored dialogue and in-story graphics). Each reply is then stored as its prose plus one line such as `[In-world time: M1 W2 Wed 13:40, at Courtyards]`. The third pattern also removes the leftover `<StatusPlaceHolderImpl/>` tag.
2. **Ghosting vs the card's trim.** Both reduce old chat in the prompt. Use one:
   - With VectFox **Summarizer Injection + Ghosting** on, disable the card's regex "Eldrasil — State-as-memory: trim far chat (prompt)". Ghosting only removes messages already stored in memory; the card's regex trims by depth regardless.
   - Without ghosting, keep the card's regex.
3. **Summarizer Injection is optional.** It overlaps with the card's Journal, which already holds dated turning points in `<current_state>`. If you use it, a lower character budget (around 4,000 instead of 10,000) avoids paying for the same history twice.

## Good to know (VectFox behaviour, not card issues)
- Deleting or editing an older message does not remove events already extracted from it; re-vectorize the chat if you rewrite history. The card's variables are unaffected either way.
- VectFox builds its semantic query from the raw recent messages, update block included; the keyword query uses your own last message. Anchoring your message with story words ("the scorched ledger", "Irene's warning") helps recall.
- The card tells the narrator that recalled memories are the past and `<current_state>` is now, so a recalled "300 points" never overrides the current wallet.
