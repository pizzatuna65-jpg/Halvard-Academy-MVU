# Playtest follow-up — execution batches (2026-09-28)

Status: all five batches implemented (Batch 4 in card v1.9.4, Batch 5 in v1.9.5); the full automated suite passes. The live SillyTavern checks for Batches 1–5 and the Year 1 / Year 2 smoke playtest remain open. Source of observed behavior: `docs/system_state.txt` and the owner's Year 1 / Year 2 playtest notes. Work in the source templates/data, regenerate derived files, and test each batch before starting the next. The numbered batches are an execution order, not a new in-story event system.

## Findings that determine the scope

- `docs/system_state.txt` records the player at Boathouse and Lake at 08:43. The narration describes a magic-assisted crossing in seconds yet declares 09:00 at Arbiter Hall. `src/worldbook/custom/content/502.txt` currently budgets 5–15 minutes for a short conversation, and rule 504 says arrivals take map walking time without exempting faster travel. This requires narration guidance and tests; the map's walking estimates need not dictate magical travel.
- Entrance sources currently place the Headmaster and Vice Headmaster speeches at the 19:00 feast; the tour has three *other* newcomers and one senior. The Year 2 event repeats a four-newcomer group. These are explicit source rules to change, not isolated narrator mistakes.
- The world index already permits ordinary campus magic, and the Duelling Club entry already specifies spell duels in a warded ring. The playtest's Dove arrest threat and staff-based club description contradict canon. Strengthen the high-priority narration/cast checks and remove ambiguous naming. Do not make ordinary fast movement or safe practice a crime.
- `Soaked` and `Chilled` already exist, but automatic soaking comes from rain/snow exposure. A direct water-magic hit currently depends on a condition patch from the narrator; absent that patch, the engine has no reliable event input. Cold follow-through needs both an explicit state update and prose consequences.
- `data/shop.json` has 171 items, only eight seasonal. `tools/curate_data.py` creates the new Mall shop locations but connects only Nightwell, Merryhew's and The Snug to the Mall.
- The bracelet had a Builder button after the student was built, while Student file had a small `Amend` button and Bag was nested under its tabs. The card listens for `MESSAGE_SWIPED`. In v1.9.1, a card-side swipe blocker was found: Builder/Settings tool messages appended as a hidden final user message, disqualifying the preceding narrator reply from SillyTavern's last-message swipe control. Local Swipes setting is enabled; whether the owner's missing arrows also occur after an ordinary reply remains unconfirmed.
- Current mana recovery runs during `Resting` only. This plan interprets “0 to full in six hours” as passive recovery of `Mana_max / 360` per elapsed minute, including ordinary waking time, with spell costs/upkeep still charged. Confirm through playtest; avoid stacking the old sleep refill on top of the new recovery.

## Batch 1 — Unblock playtesting and clarify navigation

**Scope.** Reproduce the failed swipe in SillyTavern with the same card, preset and extensions; inspect the host's swipe control and any errors, then fix the responsible card hook/overlay or document an exact host setting if the card is not responsible. Verify swipe, delete and replay still restore MVU state. In the bracelet, show Builder only until the file is registered, add a direct **Bag** button when inventory is available, and make the Student file header button read **Edit student file** (or equivalent explicit wording) with a visible location in the file UI.

**Likely sources.** `src/ui/statusbar.template.html`, `src/scripts/ui.template.js`, associated UI tests and `docs/PLAYER_GUIDE.md`. Do not remove the existing edit path.

**Done when.** A finished student sees Student file and Bag but no Builder on the main bracelet; editing is discoverable inside Student file; the last narrator reply can be swiped and replaced without stale state, in a real SillyTavern check. If the swipe failure is host-side, record the reproducible cause and resolution rather than claiming a card fix.

## Batch 2 — Entrance ceremony, cohorts and tour assignment

**Scope.** At 09:00, the Headmaster and Vice Headmaster address the incoming class **before** the Arbiter Stone sorting. After each first-year is sorted, a Student Council member gives them their dorm vest; they sit with their dorm and remain for the rest of sorting. At 10:00 they meet their assigned guide; no open-ended free period is offered between sorting and tour. Each tour group is **two first-years and one senior**: in Year 1 the player plus one first-year roster peer and a roster senior; in Year 2+ the returning player is the guide for two roster first-years. The room visit still occurs late afternoon; the 19:00 feast no longer carries those speeches by default.

**Roster rule.** Select available first-years from the cohort for the current campaign year before inventing one; prefer canon seniors as guides. If all suitable roster students are already assigned, absent or unavailable in the scene, a narrator-created student remains possible. Before their own sorting, roster first-years are newcomers with no first-hand knowledge of dorm membership, common rooms, teachers' habits or classmates unless a documented prior relationship actually supports it. Roster entries can show their eventual dorm to the engine/narrator while their dialogue and clothing remain unsorted until their turn. This applies to the Year 1 starting cohort and the six Year 2 arrivals, without making last year's first-years newcomers again.

**Likely sources.** `src/worldbook/content/21.txt`, roster/cohort lore and cast guidance, `src/scripts/engine.template.js` event strings and schedule, Year 2 starter fixtures, `tests/test_year2start_v175.cjs` and entrance tests. Decide whether a stable tour-party state field is needed so swipes and scene changes preserve the assigned trio.

**Done when.** Year 1 and Year 2 playtests keep the same trio through the tour; no pre-sort first-year claims resident experience; Council vest handover and seating occur in order; the bracelet/event plan and lore agree. No scripted bond-rank event is introduced.

## Batch 3 — Time, movement and magic canon

**Scope.** Replace the fixed 5–15-minute short-conversation budget with elapsed time based on actual dialogue/actions: a greeting or short exchange can take seconds to about a minute, sustained discussion can take several minutes, and a time skip requires an explicit wait, journey or lengthy activity. Map values remain **walking** estimates. A player-described speed technique can shorten travel consistently with its stated effect, actual path and mana cost; avoid an unexplained arrival at a later clock time. A narrator should give realistic lateness only if the remaining travel/activity actually takes that long.

Reinforce the world-index permission for casual campus magic at the narration gate. Dove intervention requires a genuine restricted act, harm, or established suspicion; ordinary movement magic does not qualify. Rename the club **Magic Duelling Club** in active lore, calendar, roster, UI, data and player guide; retain legacy `Duelling Club` as a migration/alias for existing saves. Its practice remains spell duelling inside warded rings. Remove the Norvaine-army sentence from **Combat Class** source so that class does not imply sword drills; leave Norvaine's nation lore intact.

**Likely sources.** Rules 502/504/510, world index and club/class lore, `tools/merge_lorebooks.py`, club identifiers and save compatibility code. Review the roster/cast samples for pre-sort assumptions and club descriptions while doing the rename.

**Done when.** Regression scenarios distinguish a 30-second exchange, a ten-minute conversation, ordinary walking and a high-speed technique; time never runs backward or jumps without cause. Casual casting is not treated as forbidden, and every current club mention describes magical duelling. An old save with the former club name continues to load.

## Batch 4 — Seasons, exposure and mana

**Scope.** Change the calendar to M1–3 **Spring**, M4–6 **Summer**, M7–9 **Autumn/Fall** (keep one canonical internal label and display spelling), M10–12 **Winter**. Rebaseline deterministic monthly temperatures, weather chances, snow and season-bound events/stock so M1 no longer starts at −2 °C by default. Put season next to Month/Week on the main bracelet and place the current temperature there; keep weather detail accessible when Weather is enabled.

Provide a structured way for the narrator to report a direct soaking event from a water hit, and have the engine turn it into `Soaked` immediately. At −2 °C outdoors, soaking should also trigger or rapidly trigger `Chilled`, respecting protective gear, shelter, drying and weather mode. Narration must reflect wet clothes, shivering and impairment while conditions persist, without waiting for the player to remind it. Add passive mana regeneration at `Mana_max / 360` per elapsed minute; cap at maximum, account for actual spell upkeep/costs once, and remove or rebalance the old rest/sleep-only refill to avoid duplicate recovery.

**Likely sources.** `src/scripts/engine.template.js`, weather and condition rules, state schema, `src/scripts/ui.template.js` season helper, `src/ui/statusbar.template.html`, `data/shop.json` seasonal labels, fixtures and weather/magic tests.

**Done when.** Month boundaries show the approved seasons and plausible weather; a water hit in subzero outdoor conditions updates both relevant states and the next narration shows the effect; from empty mana with no expenditure, 360 elapsed minutes restore exactly the current maximum, regardless of whether the player stayed awake or slept. Swiping/replaying yields the same result.

## Batch 5 — Seasonal shops and Mall connections

**Scope.** Expand seasonal inventory in several Mall/Commissary shops across all four seasons. Give each new seasonal item a concrete existing or newly defined effect tied to its season (for example rain protection, cold protection or chill relief, heat relief, outdoor stamina or safe travel), and show that effect in the Bag/shop description. Avoid catalog filler with only a seasonal label; balance prices and consumption/gear duration against existing items. Reassess the eight current seasonal items for the new season mapping and fill gaps in Spring and Summer. Connect every Mall subshop to The Mall in `tools/curate_data.py`, with reciprocal routes and walking estimates; regenerate `data/locations.json` and map UI data.

**Likely sources.** `data/shop.json`, `data/gift_shops.json`, `tools/curate_data.py`, item/gear/consumable engine rules, shop UI, generated lore/data and shop/map tests.

**Done when.** Each season offers several useful, discoverable choices; out-of-season stock is unavailable as intended; purchased items deliver the stated mechanical benefit; every Mall shop card shows a valid `Connected to: The Mall` link, and the Mall links back. Existing saves and gift tastes remain valid.

## Cross-batch acceptance

After each batch: regenerate the card and TEST cards from source, run the relevant tests and save migration checks, then do its focused SillyTavern scene. After Batch 5: run the full automated suite and a Year 1 / Year 2 smoke playtest covering sorting, first-year dialogue, speed travel, spell duelling, a winter water hit, mana recovery, Bag/shop links and swipe. Record remaining narrator-only variability as observed examples, not as a claim that deterministic tests guarantee prose.
