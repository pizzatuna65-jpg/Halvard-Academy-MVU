# Test checklist — card v1.0.3 (bug-hunt fixes)

Automated (all passing): `npm test` = 8 suites + static QA, 282 checks, including `tests/test_bughunt_v103.cjs` (85 checks, one block
per bug-hunt item); `tests/preview/smoke_all_panels.py` (224 views, no page errors). Token audit ~7.8k start / ~12.5k mid-game.

## In SillyTavern (cannot be automated) — most important first
- [ ] **Builder with the real MVU zod helper (F12).** Register a sample student: the Student file shows its techniques and dominant
      type (v1.0.2 silently lost them). Then amend a technique cost and save: the new cost is shown. If MVU drops part of the patch,
      the Builder must now say "MVU did not apply: …" instead of "saved".
- [ ] AI tries to edit `_Techniques` in a reply: nothing changes (the helper drops `_` paths; the engine reverts whole-`/Magic` writes).
- [ ] Time skip from Sunday to Monday without the AI touching Week: the bracelet shows the next week, not the same Sunday.
- [ ] A commitment due "tomorrow 9am": next day it reads "today 09:00", later "overdue".
- [ ] A new NPC appears unnamed: the bracelet toast shows a descriptor, not the name, until the story names them.
- [ ] Sunreach Bay trip at night: the bracelet chip says "Away", not "Curfew".
- [ ] World Competition M11 W4 Wed–Sat, Graduation M11 W4 Sun (Calendar entry and bracelet agree). On M12 W1 Mon the Journal records the departures; the Map card for the Student Council Chamber no longer
      lists Irene / Caspian; removing a name from `Campus_State.Graduated` in the story keeps that student.
- [ ] New campaign year (Year 2, M1 W1): the NPC roster in the prompt (itemization) shows everyone one year up and the graduates on their own line; the Journal notes the new first-years.
- Earlier checklists still apply: `TEST_CHECKLIST_v1.0.md`, `TEST_CHECKLIST_v0.5.md`.
