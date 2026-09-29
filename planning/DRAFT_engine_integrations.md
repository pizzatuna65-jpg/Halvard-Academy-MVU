# Audit Batch 3 — engine integrations (approved 2026-09-29)

Owner approved the audit findings and requested "lanjutkan batch 3". This records the implementation choices for v1.18.0.

- Dove attention loses one point per fully quiet week. A reported rise marks that week as active. The engine does not infer a witnessed crime merely from a cast and a nearby person; the narrator reports detection and its rise.
- Reputation deeds use a named `Kind` mapped to a fixed reputation and XP in `data/reputation.json`. Existing `repeat` and `event` reports with explicit XP continue to work for old saves and unforeseen deeds. A kind that matches the table ignores a supplied XP or Rep, so the engine owns the number. Separate kinds record the two sides of a deed when needed.
- A newly acquired shop item triggers a reminder if its listed point price is not covered by the matching Points decrease and transaction. Gifts and found items remain possible; the engine never removes an item or changes Points based on the reminder.
- Injury `Heals_by` produces a due reminder after the target time. It never heals off-screen.
- Curfew outside the student's dorm produces a conditional reminder, not an automatic reputation penalty. Detection remains a story fact.
- A newly named witness in `Hidden.Known_by` gets a dated Knows line in an existing bond. The engine does not create a bond for an unknown person. The reverse direction stays a reminder, because a Knows line about magic is not always a full revelation.
- A due Commitment's `With` can appear in `$ui.maybe` when `Where` matches the current scene. This is a possibility, not forced Scene.Present.
- `$ui.on` records the current feature switches once per update; EJS and UI use it with a fallback for pre-update states.

Live check: use a connected SillyTavern session to confirm conditional reminders and story reactions. Automated tests verify state and rendered rules, not the model's prose.
