# Test checklist — card v1.1.0 (world systems)

Automated (all passing): `npm test` = 9 suites + static QA, 392 checks, including `tests/test_world_v110.cjs` (110 checks: weather
distribution and continuity, forecast accuracy, the Bag, conditions and gear, sleep, bond cap, Dove cover, class presence, hooks, gossip,
feature parking and token estimates, weather-aware happenings, UI). `tests/preview/smoke_all_panels.py`: 492 views (now also every
Notebook and Activities tab, plus the new `sample_v110.json`), no page errors. Token audit: ~8.3k start / ~13.2k mid-game.

## In SillyTavern (cannot be automated) — most important first
- [ ] **EJS in the rule entries.** 502 and 504 are now EJS (feature gates). With the Prompt Template extension on, the prompt
      (Itemization / prompt inspector) shows plain rules, no `<%`. Turn Letters off in Settings → Features: the Letters rules are gone
      from the prompt on the next request.
- [ ] **Extra-model mode only:** if you switch MVU to "extra model analysis", check that the update request also gets 502 rendered
      (no `<%`). Not needed with the card's default mode (update with the AI reply).
- [ ] Settings → Features: switching a feature off adds a hidden note and the setting sticks after a swipe of the next reply;
      switching it back on restores its contents (e.g. a waiting letter).
- [ ] The bracelet shows a weather chip with °C; hovering shows the full line. On the Academy Trip it disappears (Away).
- [ ] Walk outside in the rain for half an hour: the "Soaked" chip appears; an hour indoors later it goes away.
- [ ] Buy an umbrella in the story; the narrator adds it to the Bag (Student file → Bag). Buy and drink a Sunfizz, then return the
      bottle at the Commissary: +2 points in the wallet.
- [ ] Monday 09:00 in the Main Library: the narrator does not seat Etnie or Irene there (they are in class). Go to the Lecture Halls:
      the narrator treats it as your Magic Theory class with Yvette.
- [ ] Notice Board: the Divination Society forecast card. Compare it with the next day's weather a few times (right ~3 in 4).
- [ ] The preset: the Bridge prompt says to use metric units; "⏰ Time and Place" is OFF.
- Earlier checklists still apply: `TEST_CHECKLIST_v1.0.3.md` first, then `v1.0`, `v0.5`.
