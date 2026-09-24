# Token budget audit (updated for card v1.1.0)

## v1.1.0
Measured with `node tests/token_audit.cjs` on the built card (same method as below).

| | v1.0.3 | v1.1.0, all features on | v1.1.0, the new features off* | v1.1.0, every feature off |
|---|---|---|---|---|
| Start of game | ~7,780 | ~8,310 | ~7,800 | ~6,970 |
| Busy mid-year | ~12,540 | ~13,190 | | |

\* weather Off, class presence, hooks, gossip and the Bag off.

Where the +530 comes from (start of game): 502 update rules +275 (Bag ~90, hooks ~100, conditions and Dove cover ~75, gates tightened),
504 campus rules +190 (weather ~50, conditions/field ~35, classes ~35, hooks ~45, gossip ~15), 505 Now +40 (forecast line; class line in a
class period), 501 state +30 (`_Season`, `_Weather`, empty Bag/Hooks/Conditions). Live state on top: ~7 tokens per Bag item, ~20 per hook,
~15 per rumour line in `<now>`.

The spec's budget ("+30 to +60 always-on") cannot be met together with the rules the spec itself asks for (the Bag rule alone is ~70).
The Features panel is the answer: every new feature can be switched off, and with them off the cost is back at v1.0.3 level. The rule costs
per feature are measured at build time (`tools/feature_cost.py` → `data/feature_cost.json`) and checked against a re-render in
`tests/test_world_v110.cjs` (within 10%).

---

## v1.0 (Batch 5.4)

Measured with `tests/token_audit.cjs` (≈3.6 characters per token; `<current_state>` rendered as Tavern Helper's
`{{format_message_variable}}` does: YAML, every `$` key omitted, verified in TH's source).

## Always-on prompt
| Part | Start of game | Busy mid-year |
|---|---|---|
| 501 `<current_state>` | ~600 | ~5,300 |
| 502 Update Rules `[mvu_update]` | ~2,600 | ~2,600 |
| 132 Campus Map | ~1,370 | ~1,370 |
| 0 World Index | ~830 | ~830 |
| 97 NPC Roster | ~710 | ~710 |
| 504 Campus Rules | ~620 | ~620 |
| 503 Output Format `[mvu_update]` | ~370 | ~370 |
| 131 Timetable, 134 Calendar, 505 Now | ~470 | ~470 |
| **Total** | **~7,600** | **~12,400** |

Plus the card description (~180) and keyword-triggered lore (NPCs, places) as the scene calls for it.
Chat history is bounded by the state-as-memory regex (latest ~24 messages).

## What grows, and the caps
- **Bonds** dominate `<current_state>` in a long game (~90 tokens per bare bond, ~15 per fact).
  Fix in 5.4: the narrator sees each bond's **latest 10 Known_facts**; older facts move to a hidden `$Known_old` (dossier still shows them).
  Late-game ceiling (30 bonds, 10 deep): **~9,100 → ~5,600 tokens**.
- **Journal**: 30 lines visible (~1,000); older lines go to the hidden `$ui.archive`.
- **Clues**: capped at 40 (~1,700 at most). Left as is; a candidate if late games feel heavy (hide clues of solved threads).
- **Campus_State**: Rumours 15, Secrets 80; Events / Location_changes / NPC_status are uncapped records that the AI is told to summarise in place.

## Not trimmed, on purpose
502 is long, but it is the only place the AI learns the patch paths; in "extra model analysis" mode it goes to the update model only.
The Campus Map, World Index and Roster are the narrator's orientation and are kept constant.
