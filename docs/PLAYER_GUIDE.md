# Eldrasil: Halvard Academy — Player Guide (card v1.2.2)

You are a first-year at Halvard, one of four magic academies in the Kingdom of Eldrasil. A year of classes, dorm rivalries, clubs, competitions and festivals, with something old and sealed underneath the castle. The card tracks the world for you: the clock and calendar, seasons and weather, your body and mana, money and belongings, relationships, secrets, and what the campus remembers.

## 1. What you need

- **SillyTavern 1.13.5 or newer**, using a **Chat Completion** API.
- **Tavern Helper** (JS-Slash-Runner) **4.8.4 or newer**, with this card's scripts allowed to run.
- **Prompt Template** extension (ST-Prompt-Template, EJS). The calendar, the "now" line and a few date-gated lore entries need it.
- Internet on first load: MVU, the portraits, the map and the connections diagram load from jsDelivr.

## 2. Installing

1. Import `Eldrasil_Halvard.png` as a character.
2. When SillyTavern asks whether to **import the embedded lorebook, say yes.** The card needs its own worldbook bound to it, including a small control entry that tells MVU how to run this card.
3. When Tavern Helper asks whether to allow the card's scripts, allow them (MVU, Schema, Engine, Eldrasil UI).
4. **Do not also enable the standalone Eldrasil lorebooks** (v37/v38/v39) in the same chat. The card already carries the merged, corrected version, and running both duplicates the lore.
5. Start a new chat. In the browser console you should see MVU report that the variable structure was registered.

## 3. Your first session

The greeting carries the **bracelet**, a status bar shown above the text of the latest message. On a fresh chat it offers **Create your student**, which opens the Student Builder. You can also use the **Builder** button under the chat box.

The Builder walks through seven steps: a sample to start from, identity, power, techniques, pacts, hidden magic, and a review. A few choices matter later:

- **Identity** has pronouns (a list, or your own), a **personality**, and an optional **birthday** in the academy calendar. The birthday goes on your calendar and the day plays out as your birthday. **Combat roles** are not chosen here: the Combat teacher assigns yours at your first Combat class, from how you fight.
- **Mana capacity** is a slider (50 to 1,000; type a number for more). It is capacity, not a rank: nobody can read it off you, so a big pool can live a quiet life. Overpowered is allowed; the world reacts to what you show, never by quietly weakening you.
- **Specialties**: the subtype lists are suggestions. Add your own subtype and say whether it is a forbidden art. A technique with a subtype of your own asks the same question.
- **Techniques** start with your specialty for their type as the subtype (change it freely). **Apply technique** folds a finished one into a single line; tap it to edit. They have fixed costs: per use, sustained (upkeep per in-world minute), or hybrid. The engine charges them; the narrator never guesses.
- **Pacts**: first choose what the pact is made with. Only a **spirit** pact is lawful; a pact with a demon, a monster (by bestiary grade), an animal or a person is the forbidden art of Pacting. Choose whether your partner is with you only while summoned or lives as the pact says. Press **Apply pact** and its Summon (and, for the two highest tiers, Channel) technique appears on the Techniques page.
- **Dominant type** is what the Arbiter Stone reads at the Entrance Event. It picks your dorm (Elemental → Fire, Mystic → Light, Spiritual → Viridian, Occult → Sky). The Stone cannot see subtypes, or whether your magic is forbidden.
- **Hidden magic** is optional: your **true magic, filled in like a technique** (it is charged like one), a cover story and how you conceal it. Who finds out is decided in the story. Using it where it can be noticed raises **Dove attention**.

Register, then write your first action. You can reopen the Builder later to amend your file; techniques and affinity can only be changed there. The Builder's entry in the chat is hidden, so the bracelet stays on the last story message and shows your new file there.

## 4. Playing

Write actions in the chat as usual. Each reply ends with a folded "📜 State update" block that you can open to see exactly what changed. The bracelet above the latest reply shows the clock, period, location, points, vitals, and chips for whatever matters right now. Chips can be tapped to open the matching panel.

**Panels** (bracelet buttons, or the buttons under the chat box):

- **Student file**: profile, body (injuries and weather conditions), your **Bag**, wallet, studies, magic, hidden magic (once relevant), the engine log, and **Settings** (features and their token cost).
- **People**: everyone you have met with their bond rank, dossiers that fill in as bonds deepen, and a connections diagram of who knows whom.
- **Map**: the campus with clickable pins. Places you have not found stay hidden until you visit them. Each place card shows the walk from where you are now, access, clubs, regulars and connections; use ‹ › to step through the places at one pin. A regular is listed once you know them well enough to know where they hang out.
- **Notebook**: planner and calendar, journal, notice board, letters, mystery board. Tabs appear once they become relevant. Tap a calendar day to see what is on it and write yourself a note ("ask Gareth to spar"); promises, appointments, project due dates, notices and your birthday land on their day by themselves. Notes are yours; the narrator does not read them.
- **Activities**: clubs, competition, shop, projects, trips. The **Shop** tab appears only at a shop (the Commissary, the Mall and the shops inside it); a "Shop here" chip on the bracelet opens it. Its lists are recommendations, not the whole stock. **Battle** opens from the "In battle" chip.

**Buttons never move the story on their own.** "Go here", "Buy", "Reply" and similar buttons write a suggested action into your chat box. Edit it if you like, then send it. This keeps every change in the chat, so swipes and deletions stay consistent.

## 5. How the world works

- **Time.** Each reply advances the clock. Classes follow the weekly timetable. Curfew is 20:00 (later on some festival days); on a trip or an off-grounds outing the teachers set the rules instead. The Thinning locks the academy down for a week in Month 7. Breaks empty the campus. Month 11 ends with the World Competition abroad (Week 4, Wed–Sat) and Graduation (Week 4, Sunday). The next morning, the first day of the Month 12 holiday, the third-years leave: they stop showing up as regulars and club members, though you keep their bonds and dossiers, and the story can keep one on (repeating a year, staying as staff). Each new school year everyone moves up a year, and a new class of first-years arrives; newcomers written for a later year stay out of the story until their year begins.
- **Body.** HP measures injury, not an RPG life bar. Every loss comes with a named injury, and one blow can take at most 40 HP unless it is truly lethal. Stamina is exertion. Sleep and rest recover you, and nothing heals off-screen.
- **Mana.** Costs come from your technique list. Sustained effects drain mana per in-world minute and end on their own if you run dry.
- **Money.** Points live on the bracelet. A monthly payout depends on your dorm rank, which is recalculated in Months 5 and 11. Coin is real money and the only kind that works off campus.
- **Bonds.** Time together fills a bond's XP bar: a real conversation (once a day), time spent together (once a day), gifts (twice a week; what they love counts more from Rank 3, what they hate raises tension) and real help with what they want (once a week); the weather can add a little. Each rank needs more XP than the last. A full bar opens a **bond event** ("Bond event ready", with where and when they are likely to be); when it plays out, the rank rises, and after a short wait the next bar starts filling. At standard pace a bond takes about a semester of steady attention to max out; **Student file → Settings → Bonds** sets the pace (about a month to about a year) and from which rank a romance can become official (Rank 8 by default). People only tell you as much as the bond allows: open characters share early, guarded ones late; push too soon and they deflect. Names, habits, goals and backstory unlock in the dossier as ranks rise. Secrets only surface through the story.
- **Campus happenings.** Some days bring a small happening: a paid-work posting, a Dove sweep, a loose creature, a duel challenge. It shows as a chip and in the planner. Go if you want; the narrator may weave it in or ignore it. It is seeded, so a swipe shows the same happening for that day. Change the frequency (Off / Rare / Normal / Often) in **Student file → Settings → Features**. Outdoor happenings stay away on days of heavy weather, and some only turn up in their weather (a snow-clearing crew, a storm clean-up, doubled Dove patrols in dense fog).
- **Classes.** During a class period the students are in class, so the library at 09:00 on a Monday is nearly empty; the map shows "(in class until 10:00)" next to students. Go to your own class and the narrator knows which class it is, who teaches it (if the lore names the teacher) and who your classmates are. Saturday afternoon everyone is at their club.
- **Seasons and weather.** Real northern seasons: winter in Months 12, 1 and 2, spring 3–5, summer 6–8, autumn 9–11. The sky is rolled for the morning, afternoon and night, follows on from the previous block, and has wind and the occasional rare event (a lightning storm, hail, a blizzard, dense fog, a heatwave). Temperatures are in °C. The bracelet shows a weather chip; hover it for the full line.
- **The forecast.** Every morning at 07:00 the Divination Society posts tomorrow's skies on the **Notice Board** (Notebook → Notice Board). It is right about three times in four. The bracelet does not show it: you have to check the board.
- **Weather effects** (setting Full, the default): stay out in the rain without cover and you get **Soaked** (rest and sleep restore half the stamina); long in the cold, or soaked in the cold, you get **Chilled**; an hour in the summer sun can leave you **Overheated** (both cost stamina outdoors). An hour indoors (half an hour for heat) clears them, and so do a hot bath, a hot drink, dry clothes or a cold drink in the story. A soaking may turn into a **Head cold** the next day (stamina capped at 80% for two to four days, or until the Medical Centre treats it), more likely during the winter cold that goes round campus. Rain on the roof makes for good sleep, a storm or a hot night for poor sleep. Bonds grow a little faster when you are stuck indoors together in the rain, or out in fine mild weather. Fog and heavy weather hide hidden magic from the Doves a bit better. Outdoor people move indoors in the rain, and outdoor clubs practise in the Gymnasium (the Fishing Club goes out anyway). Weather never costs HP by itself and never changes technique costs.
- **Gear.** Weather gear works from your Bag by name: an **umbrella** keeps you dry unless it is windy; an **oilskin rain cloak** always does; a **wool scarf and mittens** or a **lined winter cloak** keep the cold off; a **straw sun hat** helps in summer heat. The shop sells them in their season; out-of-season items are greyed out.
- **The Bag.** Things you buy, receive or find and keep go into the Bag (Student file → Bag), with a plan if you give one ("a Star Cookie for tonight"). The buttons Use, Give and Drop only draft the action. Sunfizz comes in returnable bottles: return empties at the Commissary or the Mall store for 2 points each.
- **Gossip.** Rumours spread: first only the witnesses know, then the source's dorm and club, then most of campus, then it is old news; some fizzle out after a couple of days, some fly round the campus at once. The Journal shows how far each one has got; rumours that died out stay there, faded.

## 6. Features and token cost

**Student file → Settings → Features** lists every module you can switch off: planner, story notices, letters, mystery board, competition, projects, trips, battle tracking, the Bag, campus happenings (Off / Rare / Normal / Often), weather (Off / Flavor / Full), class-aware presence, story hooks and gossip. Each row shows roughly how many tokens its rules and its current state add to every request, and the footer adds everything up, with what the switched-off features save. The preset and the chat history come on top.

Switching a feature off removes it from the narrator's state and rules and hides its tabs and chips. Nothing is deleted: its state is set aside and comes back when you switch it on again. Weather **Flavor** keeps the sky and temperature but drops the effects; **Off** removes weather entirely. Turning off the four new features (weather, class presence, hooks, gossip) and the Bag brings the prompt back to about the size of v1.0.3.

The **story hooks** are the narrator's private notes on promises and planted details it owes you a payoff for. They never appear in your panels; that is on purpose.

## 7. Memory

To keep long campaigns affordable, the narrator reads only the **latest ~24 messages**; older ones reach it as `[…]`. What it remembers of the rest is the game state: the Journal (latest 30 turning points), the latest 10 known facts per bond, milestones, campus news and rumours, commitments, letters and clues. Older journal lines and facts leave the narrator's view but stay visible to you in the Notebook and dossiers, faded or listed first. That archive is large but not endless: the latest 300 journal lines and 40 older facts per bond. Secrets you have uncovered are kept for good, so a dossier never locks again.

To send more chat, open the Regex extension and raise the **Min Depth** of "Eldrasil — State-as-memory: trim far chat (prompt)", or disable it to send everything.

**Memory extensions.** VectFox works with this card as chat memory. Do not vectorize the card's own lorebook for semantic World Info, and use either VectFox ghosting or the card's trim regex, not both. Settings and ready-made cleaning patterns: `docs/VECTFOX.md` and `docs/vectfox_cleaning_patterns.json`. A compatible Gemini edit of the Realistic Frankenstein 2.2 preset and how the three fit together: `docs/ECOSYSTEM.md`.

## 8. MVU mode

The card asks MVU to update variables **together with the AI's reply**, one request per turn. You can switch to MVU's "extra model analysis" mode in the MVU panel under the current card's config; the card's entries are tagged for both modes. In the tool-call response format, names mentioned only in story prose will not unlock early in dossiers, because the update then arrives without the prose.

## 9. Troubleshooting

- **No bracelet under replies.** Tavern Helper is disabled, or the card's scripts were not allowed. Check Tavern Helper → character scripts.
- **The reply shows a raw `<UpdateVariable>` block, or nothing changes.** MVU did not load (first load needs internet), or the model broke the patch format. Swipe once. Persistent errors appear in the browser console as `[Eldrasil engine]` or MVU messages.
- **`<%` code visible in prompts, or the calendar is wrong.** The Prompt Template (EJS) extension is missing or off.
- **Portraits or map missing.** jsDelivr is blocked or slow on your network. The card still plays; only images are affected.
- **Duplicate lore, contradictions.** A standalone Eldrasil lorebook is enabled alongside the card. Disable it.
- **The MVU panel shows no card override.** The embedded lorebook was not imported or bound. Re-import the card and accept the lorebook prompt, or bind the "Eldrasil — Halvard Academy" world to the character.
- **Time went backwards, a rank reverted, damage was capped.** That is the engine enforcing the rules; the Student file → Log tab says what it did and why.
