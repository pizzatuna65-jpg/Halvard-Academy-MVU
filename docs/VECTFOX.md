# Using VectFox with Eldrasil (card v1.6.0)

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
3. **Summarizer Injection: OFF (since card 1.6.0).** The card now keeps the story's memory itself: the Journal, each bond's recent moments and defining moments, and what each character knows and feels about you (Mind, Knows, Imprints, Next). A VectFox summary would repeat all of it and can contradict it. Keep **EventBase ON**: it is the only source of the details of old scenes. If you still want the summary, keep it to about 3,000 characters.
4. **Injection position (checked in VectFox 3623dc8, `core/eventbase-workflow.js`: EventBase and the summary use one setting, `VectFox_injection_position`).** Keep the default **After Main Prompt**, or **In-Chat @ Depth** at 2 or more. The card puts the Cast Sheet at depth 1 and the cast gate at depth 0 so that canon is the last thing the model reads before writing; recalled old prose injected at depth 0 or 1 would sit closer than canon and bring back the drift the Cast Sheet removes.

## Good to know (VectFox behaviour, not card issues)
- Deleting or editing an older message does not remove events already extracted from it; re-vectorize the chat if you rewrite history. The card's variables are unaffected either way.
- VectFox builds its semantic query from the raw recent messages, update block included; the keyword query uses your own last message. Anchoring your message with story words ("the scorched ledger", "Irene's warning") helps recall.
- The card tells the narrator that recalled memories are the past and `<current_state>` is now, so a recalled "300 points" never overrides the current wallet.
- Since 1.6.0 rule 504 also says that a recalled memory tells what happened, not who knows it: a character knows only what they saw, what their Knows lists or a rumour that reached them; and where a memory describes a character differently from their Cast Sheet, the sheet is right.
- Nothing the character-consistency releases added (Mind, Knows, Next, Extras) appears in the reply's prose: it all sits inside `<UpdateVariable>`, which the cleaning patterns drop, so NPCs' thoughts and secrets never enter VectFox memory. The update block does get longer; if recall gets worse, tell the card's maintainer (the long fields can move to the end of the patch).
