# Campaign quest log (live SillyTavern checks)

Every check that needs a real SillyTavern session (the narrator API, the card's lorebook, the edited preset, VectFox), laid out as
quests in the order the campaign reaches them. `npm test` covers the engine, schema, lore, UI and old-save loading headless; this log
covers what only a live session can show. Playing the route is also the cross-batch smoke playtest.

**Where you are:** Act 1 · Q1.1. Y1 M1 W1 Mon 10:13, Courtyards (the Divination and Tailoring booths): Charles Chevalier (Fire Dormitory) on the Entrance tour with Kanae
(guide) and Zara; Tilly's ghost hunt is booked for 22:45. The Charles chat last played on 1.35 (74 messages, state written on 1.34.2).

## How to play it

- Do Act 0 once, then play as you like. When a quest's moment comes, do its *Do* line (if it has one) and watch its checks. Nothing
  has to happen on cue: skip what does not suit the story. Most checks come round again, and the Milestones and Side quests wait.
- Tick `[x]` when a check passes. When one fails, add a line under it (`✗ msg 123: what happened`) and play on.
- After a session, send the chat export (and VectFox's EventBase export when a check asks for it) with "fix what my playtest found":
  I tick what passed, run `tools/audit_chat.py` on it and fix what failed.
- `[1.63]` names the release a check comes from (`[1.52.1]` a patch release); search for it to see one release's checks. The old list
  by release: `git show dc2ecad:docs/TEST_CHECKLIST.md`.

**Where to look.** *Prompt*: Prompt Itemization of a reply (the story request); `<now>`, `<current_state>` and `<cast>` are blocks in
it. *Update*: the folded block MVU appends under the reply. *Log*: Student file → Log. *Raw*: the message's Edit box.

## The route

| Act | In the game | What happens |
|---|---|---|
| 0 | before the next reply | update the card, the preset and VectFox |
| 1 | M1 W1 Mon | the rest of Entrance Day: the tour, the club booths, the feast, Tilly's ghost hunt |
| 2 | M1 W1 Tue–Sun | first classes, the Mall, Charles's lightning, the role assessment, the grounds |
| 3 | M1 W2–W4 | a routine week, letters and projects, practice and crafting, Star Night, a Dorm Day |
| 4 | M2 | the Warding Rite, the first airship flight, the Grand Vast Forest |
| 5 | M3 | the Midterm, Training Week, the Dorm Competition |
| 6 | M4 | summer, Charles's birthday, Crowning Day in Avalon |
| 7 | M5–M8 | Results day, autumn, The Thinning |
| 8 | M9 | the Bazaar, Founder Day, Kingdom Competition week |
| 9 | M10 | winter, Remembrance Day |
| 10 | M11 | Sunreach Bay, Graduation |
| 11 | Year 2 | the Entrance as a guide, the Year 2 cohort, the Council election |
| 12 | Year 3 | the Year 3 cohort |
| MS | whenever it comes | people and bonds, story events, a long Journal, VectFox |
| SQ | any time | swipes and rewinds, settings, screens, throwaway chats |

## Act 0 — Before the next reply (once)

### Q0.1 Update everything
- [ ] Update the card to 1.67 (`dist/Eldrasil_Halvard.png`) and accept the lorebook update: the popup does not ask for a new chat
      [1.11.1], the bracelet shows no "old lorebook" warning, and the MVU panel shows the card's settings as overriding [basics].
- [ ] MVU → character-card settings: **Variable update method = Extra-model parsing** [1.67]. Model source and history: PLAYER_GUIDE §8.
- [ ] Import `presets/Realistic_Frankenstein_2_2_1_3_Eldrasil.json` (a new preset; the old "Realistic_Frankenstein_2_2_Eldrasil" can be
      deleted), select it and leave its toggles as shipped: Realism Mode and the NSFW register ON, Internal States family, Time and Place
      and Colored Dialogue OFF, Staccato OFF, Embellish ON [1.68]. When SillyTavern asks whether the preset's regexes may run, answer yes;
      then Extensions → Regex shows them ON (they can switch off on a preset change) [1.68].
- [ ] VectFox, as `docs/ECOSYSTEM.md` → VectFox says: the settings table ("For this card"); Text Cleaning in Custom mode with "Strip
      <UpdateVariable> Tags (MVU)" unticked, the old "Eldrasil:" patterns and the catch-alls "Rapikan baris kosong" and "Cadangan: hapus
      semua tag HTML" deleted, `docs/vectfox_cleaning_patterns.json` imported (ten patterns); the extraction prompt
      `docs/vectfox_eventbase_prompt.txt` pasted; then re-vectorize the chat [1.11.3, 1.37, 1.37.3, 1.61, 1.66].
- [ ] The old chat "Halvard Academy - 2026-09-16" is mapped to the same memory: keep it closed while VectFox is on, or unlink it [1.11.3].
- [ ] Browser console (F12) on load: MVU comes from `MagVarUpdate@438f9ff…` and `tavern_resource@276040b…`, with no import error [1.42].

### Q0.2 The first replies on 1.67
*Do:* write on from "yeah we will see".
- [x] Nothing is lost: the Fire Dormitory, 300 points, the bonds with Ruby, Percival, Zara, Tilly and Kanae, the two Journal lines, the
      lemon and honey sweet in the Bag, Tilly's 22:45 meeting in the Planner [1.42].
- [ ] Right after loading no bracelet button has a red dot [1.25].
- [ ] The first reply may lack some `<now>` lines (presence, walks, ambience): the engine writes them on its first run. From the second
      reply on they are there [1.47, 1.48].
- [ ] Each reply: the prose arrives, then the update is appended under it and the bracelet refreshes. Exactly one update block, and the
      prose never carries one of its own [1.67, 1.58].
      ✗ msg 75 (1.67.0): the prose ended with an `<UpdateVariable>` of its own, written as YAML of the state, above the real update.
      The state took only the update model's block (10:13, not 10:15), so nothing broke. 1.67.1 tells the story model in 504 that
      without `<update_format>` it writes no update; check again on the next replies.
      ✗ msg 76 swipe 3 (1.67.1, xiaomi/mimo-v2.5): again a block of its own (JSON). Its reasoning quotes the card description,
      "Every reply ends with the <UpdateVariable> block", which reaches the story request: 1.67.2 makes it conditional. The update
      model wrote Time 08:38 → 08:45 (a recalled VectFox event's time); the engine kept the clock at 10:10. 1.67.2: 503 says the old
      time is World.Time and `<VectFoxMemory>` is the past.
- [ ] Two requests a turn: the wait and the cost are acceptable. If not: a cheaper update model (PLAYER_GUIDE §8) [1.58].
- [ ] No "Engine error" line in the Log and no `[Eldrasil engine]` error in the console. If one ever appears: the toast "Engine error",
      the state unchanged, and a swipe works [1.20, 1.16.1].
- [ ] Prompt: the chat older than about 24 messages is one "[… N earlier messages …]" line [1.17, basics]; `<current_state>` is YAML
      without empty fields and holds only this update's `_Log` lines [1.11, 1.16.1]; no `<%` anywhere; no `<variable_update_rules>`,
      `<update_format>` or `<rule_cards>` (the update request carries those) [1.67].
- [ ] Prompt, the end: after your message one assistant message holds `<input_authority>` and BOLT; then the system part: the therapist,
      scene-detail, banned-vocabulary, door, contrast, vocation, scent gates, `<card_fidelity>` and the card's `<final_cast_gate>` (only when
      someone is present); the Post-History line is the last text [1.68].
- [ ] The reasoning follows BOLT's tasks 0–11: it lists the prose rules, writes a short dialogue example when feelings run high, and picks
      one of three ways the scene goes, naming the card's source when the world brings something (else AMBIENT) [1.68].
- [x] The folded 🧠 Thoughts block (brass border) sits after the story and before the update: up to three NPCs, bold names, never
      Charles, no secret the story has not revealed. A calm or reserved character (Zara) thinks as calmly as they speak [1.37.3, 1.37.4,
      1.52.2].
- [ ] The bracelet shows Spring beside the date and cool spring temperatures (not −2 °C); the weather chip shows the sky and its tooltip
      the full line; the Map shows the Spring map [1.9.4, 1.14.3].

### Q0.3 The first replies on the 1.68 preset (RF 2.2.1.3)
- [ ] No reply holds an Internal States, FATE & ROUTINE, BONDS or GM's Notebook block, a Time and Place header or a `<gold>`-style colour
      tag; dialogue is in `<say:…>` only; the 🧠 Thoughts block is still folded [1.68].
- [ ] Smells are rare: only food at a meal, a strong source close by or a rite; no "the air carried…" opener, nothing smelled on
      entering a room [1.68].
- [ ] A quiet turn: someone brings up what is on their own mind (Pacing), one ordinary thing changes, nobody is pushed into an event
      that the card's sources do not bring; right after something happened the next replies read as aftermath [1.68].
- [ ] A known person who walks in gets no head-to-toe description again; a stranger gets one at the scale a passer-by would notice [1.68].
- [ ] Impersonate (the ✨ button): only Charles's words and actions, in his own person, with no NPC lines and no thoughts block [1.68].
- [ ] No reply is blocked or refused by Gemini's filter; tell me if one is (Realism Mode and the Post-History line are ON) [1.68].
- [ ] The characters keep their edges: they disagree, misjudge, lie when it suits them [1.68].
- [ ] No error 400 "Requests ending with a model turn" (BOLT and Player Input Authority are assistant-role; the system gates follow
      them in SillyTavern, but OpenRouter's handling of later system messages is undocumented) [1.68].
- [ ] No empty or cut-off replies (Gemini's separate filter); if they come often, try a swipe, then streaming OFF [1.68].
- [ ] An ordinary scene does not drift towards sex or sudden threats (Realism Mode is ON; Gemini leans that way); if it does, turn
      Realism Mode and the NSFW register OFF and note the message [1.68].

## Act 1 — Entrance Day (M1 W1 Mon, from 10:10)

### Q1.1 The tour with Kanae and Zara (until 18:00)
*Do:* follow the tour: the club booths, the Canteen at lunch, the Library, Founder's Park, the lake; late in the afternoon the seniors
show the newcomers their dorm rooms.
- [ ] `<now>` has the "Entrance tour assignment (keep these same people through 18:00)" line and `<campus_rules>` the Entrance lines;
      the same three stay together through several places and a swipe. From Tuesday both are gone [1.9.2, 1.11].
- [ ] A clear sky all day (an event day) and the Notice Board forecast agrees; an ordinary day after it can rain again [1.30.3].
- [ ] Each arrival: an Ambience line in `<now>`; the narration matches its crowd and light and writes its own detail for the cue, not the
      cue's words. A "Nearby" moment is one clause; a "Brushes Charles" moment is small and needs no reaction [1.16].
- [ ] `<now>` has "Likely around …" and "Walks from here (minutes on foot …)" with the nearest pins and the Fire Dormitory; each person
      present has a "Now with Charles" block in their Cast Sheet, in band words without numbers [1.47, 1.48, 1.56].
- [ ] Dialogue colours: Kanae and Zara each speak in their own light colour, the same one in the next reply; the raw message has
      `<say:Kanae>"…"</say>`. A clerk or passing student speaks in the shared grey until their Extras record (second appearance), then in
      a colour of their own. With four or five speakers every colour is clearly different; someone who changed colour on arrival keeps it
      for the scene and is back to their usual one next time [1.37, 1.37.1, 1.37.2].
      msg 75: the raw message has `<say:Kanae>` and `<say:Zara:whisper>` (the whisper style is supported); colours on screen still to see.
- [ ] Four or more replies later the prompt holds those quotes without `<say…>` tags; a stray `</say>` never shows in the chat [1.42].
- [ ] Prose (preset): the reply opens with Charles's action and words expanded (Embellish); the others answer as themselves and nothing is
      decided for Charles beyond what you wrote; about 4–7 paragraphs; no "not X, but Y" or "It wasn't X. It was Y."; NPCs sound distinct,
      act on what they decide, and a nervous one keeps their stalls; jobs and jargon do not take over idle talk [1.36, 1.52.2].
- [ ] A quick greeting keeps the clock or moves it a minute; a real ten-minute talk moves it about ten [1.9.3].
- [ ] A new roster character: short first lines, then they sound like their sheet [1.35.2]. The update starts their bond with
      `insert /Bonds/<name>/Known_facts/-` (no full record, no Trust), real MVU accepts it, and the bond starts at the character's own Trust
      [1.53]. People gets a red dot; opening the panel clears the button's, and the person keeps theirs until opened [1.25].
- [ ] `<cast>` holds exactly the people present, in name order, then their ties and `</cast>`; no other sheet and no line starting with
      `@@`. With nobody present: no `<cast>` and no final cast gate [1.48].
- [ ] An hour or two in a busy place with a story (the Canteen, the Commissary, Founder's Park by day): when the toast "Heard at …" comes,
      someone in the narration talks about it as hearsay, and the Map card lists it [1.24].
- [ ] Map: Founder's Park and the Main Courtyard show no "Connected to" row. Ask where you can walk from Founder's Park: the narrator names
      the Courtyards, Light Dormitory, Archery Range, Sports Field, Mail Tower, Medical Centre, Groundskeeper's Lodge and Combat Grounds
      [1.30.6].

### Q1.2 The club booths (today until 18:00, then Tue–Fri 16:00–18:00)
- [ ] Join a club by a short name in the story ("I join the soccer team"): the Student file shows the full name ("Soccer Club"), and its
      Saturday afternoon adds Student reputation [1.16.1].
- [ ] The Magic Duelling Club duels with spells in warded rings, not padded staffs or swords; Combat Class is practical spellcasting
      [1.9.3].
- [ ] Optional, the Student Council (besides a club): Saturday 10:00–12:00 the bracelet and `<now>` point to the Council Chamber,
      attendance and study time count there, an F remedial comes first, and the afternoon club still meets [1.34].

### Q1.3 The Entrance Feast (19:00, Ring Dining Hall)
- [ ] The Headmaster and Vice Headmaster speak before the food is served [1.15.1].
- [ ] Past 20:00 `<now>` shows no curfew until 22:00, and the hall is not described as empty [1.35.2].

### Q1.4 Tilly's ghost hunt (22:45, the Notice Board by the founding plaque)
- [ ] Before it, the bracelet's Next chip and Inventory → Planner "Coming up" show the meeting; if Charles is late it turns Overdue, with
      one reminder in the Log and one toast [1.44].
- [ ] Out of the dorm after 22:00: `<now>` notes the risk. Nothing happens unless someone sees Charles, and reputation falls only if he is
      caught and that deed is reported [1.18, 1.35.2].
- [ ] Invite a rule-breaker (Aiden) and a rule-keeper (Irene) along: the first may come, the second refuses in character [1.35.2].
- [ ] Slipping past a patrol is settled by the Fortune number in `<now>` without naming it, and a swipe changes only the wording; a
      technique that clearly helps (Voltaic Core's speed) makes it far easier. Walking somewhere or a light spell is never rolled [1.9.8].
- [ ] By the lake or another story's place after dark: when an Uncanny line comes in `<now>`, the narrator plays the ghost story's moment
      without naming or explaining it, Tilly reacts in character, and nothing shows in the UI or the Journal [1.16].
- [ ] Ask Tilly about the Night Swimmer or the Polite Walker: she knows it and has a theory [1.16].

### Q1.5 Back to bed
- [ ] In the dorm, ask to skip to the morning: with no Resting written, the Log says "Charles slept through the night" and stamina is
      restored; an all-nighter instead gets Resting `awake` [1.12].
- [ ] Across midnight the update writes only Day and Time (no Week or Month sums), and the date rolls over correctly [1.53].

## Act 2 — Club week (M1 W1 Tue–Sun)

### Q2.1 Tuesday, the first class day
Dark Magic Defense and Magic Theory with the Fire Dormitory, then Potion Crafting (Potion Halls), mixed.
- [ ] 07:30 the bracelet reads "Morning, before classes" (on Sunday: "Morning, no classes today") [1.30.2].
- [ ] `<now>`'s class line says "until 10:00 / 12:00 / 16:00" and names the first-years' floor (Floor 2); when the narrator writes
      "Classroom" or "Seminar Room 4", no skipped-class toast follows [1.43, 1.24.3, 1.11.1].
- [ ] A teacher keeps their Cast Sheet voice (Hester on the ward, Anselm lecturing, Magnus with acronyms, Dorian selling, Cedric's closing
      line, Anya's morbid question, Kotaro late, Valentin's board) and dislikes Althair in character [1.33]. People shows their portraits
      and thumbnails, faces in frame [1.34.2].
- [ ] Spend an hour of a lesson in the Canteen: the next reply has the teacher react, and the Student file shows Academy −2 [1.10].
- [ ] A free period (the Planner marks it): `<now>` says the class is not held and why, the hour is free, and no absence is recorded [1.33].
- [ ] Map: a place's Regulars show "(teaching … until …)" for a teacher in their period and "(off sick)" on a flu day [1.47].
- [ ] Student file → Studies → Next exams: each subject's sum ("… preparation · <stat> Rank n · attended n% = score: mark") and the hint
      about theory and practicals; attendance 100% except a skip on record [1.30].
- [ ] Optional (costs Academy reputation): one reply from the Boathouse at 07:30 to the Boathouse at 16:30 counts the day's classes as
      skipped [1.42].

### Q2.2 Points to spend (the Mall, the Commissary)
- [ ] At a Mall shop (Quillfeather's) the bracelet shows "Shop here" and Activities → Shop lists its stock. In Months 1–3 the spring rows
      (Blossom honey cake, Rain-ward charm, Quick-dry powder, Elderflower cold syrup, Hot spiced tea) are buyable with a green effect line;
      the Ember pouch, Straw sun hat and Lined winter cloak are greyed "out of season" [1.43, 1.9.5].
- [ ] Buy a bakery roll to eat now and a notebook to keep: two `/Purchases` (the roll with "Used": true), the points fall by the listed
      prices, Transactions get the engine's lines, and only the notebook enters the Bag [1.45].
- [ ] "I buy a tea" at a Mall café: the Price Guide lists that place's stock; at the dorm only canon prices and shops [1.17].
- [ ] In the Commissary, try to buy something it does not sell (or more than the points allow): the Log says the purchase was refused,
      and the narrator plays it as not bought [1.45].
- [ ] Charles drinks a hot spiced tea he never bought: the Log says there is none and nothing changes. Buy one at a café and drink it in
      the same reply: the effect applies [1.16.1].
- [ ] An item taken at a shop without a matching payment: `<now>` reminds the narrator to settle or explain it; a paid purchase needs no
      reminder, and a gift keeps its item [1.18].
- [ ] Someone gives Charles something small (a sweet, a note): it lands in the Bag, and if the update wrote `/Player/Inventory/…` the Log
      says it was moved [1.35.1]. Give a Bag item to someone present: the Bag drops by one [1.42]. Bag items say what they do [1.9.5].

### Q2.3 Lightning on campus
- [ ] Note the mana, cast Lightning Arc, then let about an hour pass without resting: mana rises by about a sixth of the maximum; from
      empty, six in-world hours bring it back to exactly the maximum. The narrator never adds mana for rest or sleep [1.9.4].
- [ ] Write "I cast Lightning Arc" and let the update miss it (or catch a reply that forgot): the next `<now>` says it "appears in the last
      exchange but was not charged". A swipe still builds the reminder from your message, and a Settings edit after it does not quote the
      hidden note [1.12].
- [ ] When a reminder shows, the next update reports it only if it happened, and the narrator does not invent scenes to satisfy it. Note
      any plainly wrong reminder with its text [1.12].
- [ ] Start Voltaic Core and play on for a few hours: `<now>` reminds that it is still running and costs mana every minute [1.12].
- [ ] Around 08:43 at the Boathouse, take Electromagnetic Flight to the Arbiter Hall in under a minute: the narration shows the route, the
      cast is charged once, Charles arrives about 08:44, and nobody calls him late because the walk would take longer [1.9.3].
- [ ] A safe everyday spell in a courtyard, or movement magic near a Dove patrol: the patrol may react, but no arrest or offence follows
      from the casting alone [1.9.3].

### Q2.4 Thursday afternoon, the first Practical Magic class
- [ ] The five role teachers (Gavlan, Anselm, Hester, Magnus, Dorian) assess the class together and the update sets `Combat_role`; with
      two roles, the chosen class comes first [1.33].

### Q2.5 The grounds (any free afternoon)
- [ ] One short reply from the Canteen to the Boathouse: the Log says "Walked … min on foot, … stamina; … still ahead", `<now>` says
      "Still on the way", and once the clock has caught up the line is gone [1.47].
- [ ] The Boathouse to the Fishing House: about three minutes along the shore; the Gardens to the Boathouse: about twenty [1.15.1].
- [ ] The Hills, the Forest, the Forest Clearing: a quarter of an hour, then half an hour on the deer path; the Map gives the far grounds
      20+ minutes from the Main Courtyard [1.15.1].
- [ ] Courtyards → Grassy Field → Observation Tower → Old Hut → Courtyards, opening the Map at each stop: the Observation Tower and Old Hut
      show from the Grassy Field until you are back at the Courtyards; the Boathouse does the same for the Fishing House and Willow Island,
      the Forest for the Clearing [1.30.1, 1.24, 1.24.1].
- [ ] Find the Potion Halls, the Main Library and the Combat Grounds: Practice unlocks with a dot, Here and Elsewhere update, the Go and
      Practise buttons only fill the chat box, and locked actions say why [1.27].
- [ ] Map pin 38 "Spirit Path" sits in the trees right of the Gymnasium's pool; its card and the Meditation Rooms card read as the lore
      [1.31].
- [ ] An hour's rest in the Meditation Rooms or the Bathhouse: `<now>` names the rate, the Map card's Restores row agrees, recovery is
      faster than in the Library, and the narrator adds no bonus of its own [1.31].
- [ ] The same places over a few days: the ambience details differ [1.16].

### Q2.6 An ordinary evening, and a rainy day (any time in M1–M3)
- [ ] More people around Charles on an ordinary day than a scene holds: `<now>` names one who takes their leave, and they go in the next
      reply for a reason that fits them [1.10].
- [ ] Rain: `<now>` says who "Moved indoors"; outdoors while Soaked or Chilled the update takes no stamina for it (the engine does)
      [1.47, 1.53].
- [ ] Use a Rain-ward charm before going out into the rain: the update puts "Rain-ward charm" in `/Consumables/-` and the Bag count drops;
      half an hour in the rain does not soak Charles [1.9.5].

### Q2.7 Saturday and Sunday
- [ ] Saturday afternoon at the club adds Student reputation (Q1.2) [1.16.1].
- [ ] Sunday 07:30: "Morning, no classes today" [1.30.2].
- [ ] On a Sunday (students may drink only on Sundays, in the Mid-Year Break and in Month 12), mention drinking or Barrow & Vine: the
      alcohol rule (entry 512) is in the prompt [1.54].

## Act 3 — The rest of Month 1 (W2–W4)

### Q3.1 Monday, M1 W2
- [ ] Inventory → Journal shows the engine's "Week recap (M1 W1): …", with "a clean week" if no class was skipped [1.10].
- [ ] Practical Magic: `<now>` names Charles's role class and its teacher (for Healing, Hester in the Healing Ward), and the narrator
      writes a mixed-dorm class of that role, not Gavlan's old Combat Class [1.33].

### Q3.2 A routine week
*Do:* Inventory → Planner → Routine week: two activities and some study hours, then "Live this week".
- [ ] A hidden tool message is added, the card shows "Ready: until … (stops before …)" and the chat box is filled. Send it [1.50].
- [ ] The reply tells the days briefly and plays the listed moments; the clock ends at Sunday 20:00 or the evening before the stopper; the
      Journal has "Routine week (…)", the Wallet at most two paid shifts, the Student file the XP [1.50].
- [ ] With a Commitment due in two days the span stops the evening before; armed on the Friday before Star Night it is refused with the
      reason [1.50].

### Q3.3 Letters, projects, appointments, rumours
- [ ] At the Mail Tower, write a letter home: the update records it, a week later a reply waits at the Mail Tower, and any parcel lands in
      the Bag or the Wallet [1.31, 1.54].
- [ ] A Project with a Due date: the day before, the Log reminds once and `<now>` lists it under "Due soon" [1.44].
- [ ] A group assignment (Kind assignment, With a classmate): a group study session with them in `/Practice` gives bond XP; at Progress 100
      the Log says "+45 minutes of study"; left overdue, Tension rises [1.49].
- [ ] A Commitment arranged for "tomorrow 16:00" shows as "M1 W? Day 16:00" in the state on the next turn [1.53].
- [ ] Someone arranges to meet later somewhere else ("the library at eight"): the Commitment's Where is the meeting place, not where you
      talked [1.52.1]. Standing there before the time, `<now>` lists them under "May be here" without making them speak; with an
      `NPC_status` that keeps them away, it does not [1.47, 1.18].
- [ ] Inventory → Mystery Board → Heard around campus: pin a rumour to a thread: a hidden tool message appears, the clue shows "hearsay (a
      rumour)", and the narrator treats it as unconfirmed [1.44].

### Q3.4 Practice and crafting
- [ ] A full Practice session at a valid place: the update reports `/Practice` with Action, Subject, With and Aim, and the XP comes once. A
      short session, one in class hours and a repeat the same day are each refused in the Log [1.27].
- [ ] The Potion Halls with ingredients: Activities → Practice shows recipes whose bands match `Crafting now` in `<now>`. Brew a Warming
      draught: the narrator plays that band, one ingredient goes, the right number of handmade doses arrives; a swipe keeps the band [1.28].
- [ ] A crafted Warming draught while Chilled, a Healing draught with a minor injury: `/Consumables` takes one dose, and the state and the
      story show the effect. A Fire flask or Ward talisman that fits an uncertain attempt: +20, and its single use reported [1.28].
- [ ] A Clearing bloom left in the Bag past the next day wilts. At the Workshop, make a rune and repair or enchant an item; without the
      materials or Arcana Rank 3 no result is offered [1.28].
- [ ] Sell three Healing draughts at the Medical Centre Apothecary: 45 points, three doses gone; a fourth that week is refused [1.28].
- [ ] In the common room with knitting wool and needles: Needlework, Drawing, Woodcarving and Calligraphy recipes are listed. Knit a scarf:
      the band matches `Crafting now`, the Bag gains a Knitted scarf and loses one wool, and on a cold day it holds off Chilled [1.29].
- [ ] Give a handmade piece to someone who likes handmade things: it counts as liked. Try the Canteen kitchen as a non-member, alone and
      with the cook there [1.29].

### Q3.5 Star Night (W3 Sat evening to Sun dawn)
- [ ] A clear, calm day, and no 20:00 curfew that night [1.30.3].
- [ ] From Saturday 20:00 the Map panel and every location card header show the magical-lit map, the pins on their buildings; from Sunday
      06:00 the default map is back [1.13, 1.14.3].

### Q3.6 Spiritual Dorm Day (W4 Sun) and the month's end
- [ ] From the Wednesday before, `<now>` shows "Coming up … W4 Sun: Spiritual Dorm Day", and now and then a student mentions it in passing,
      in character, not everyone [1.32].
- [ ] Sunday night into Monday: the date lands on M2 W1 Mon even if the narrator forgot the Week. If the date ever jumps more than three
      days, the toast "Time jumped N days" appears [1.11.1].

## Act 4 — Month 2

### Q4.1 The Warding Rite (W1 Fri dusk to Sat dawn)
- [ ] At the feast the Headmaster and Vice Headmaster speak before the food [1.15.1].

### Q4.2 The Creature Studies Expedition (W3 Wed–Fri)
The first academy flight (the airship), then the Grand Vast Forest.
- [ ] In the air `World.Location` reads "Airship — …", the Map opens on the Airship tab (four cards, the landing countdown), and the
      bracelet shows no dorm curfew [1.40, 1.46].
- [ ] The Promenade Deck, the Cabin Deck, the Cargo Hold: the narrator uses each entry (the view by the glass, the bathing stalls, the
      grumbling quartermaster) and writes "Airship — <place>". A weekday flight: the bar serves no drinks [1.40].
- [ ] Try to leave before landing, or walk onto the bridge: kept aboard or turned back, no punishment. The narrator plays only the stage,
      hold and sky moments `<now>` lists, and a swipe keeps them [1.40].
- [ ] On arrival: "Grand Vast Forest — Base Camp", the weather line says "(rainforest)", the Map shows the forest with Base Camp and the
      three Wildwood pins (the Halvard tab still the campus), and the forest's lore index (360) is in the prompt [1.38, 1.46].
- [ ] Thursday 08:00: `<now>` names the target but not where it lives, and the narrator does not bring it in while `<now>` says "no sign
      of it here yet". Walking to another place moves the clock by hours and costs stamina; new neighbours appear on the map; a beast card
      never lists beasts [1.38].
- [ ] When `<now>` says "The target is here", the narrator plays the encounter; after a catch the update sets `Expedition.Caught` and the
      Journal records it (a catch written earlier is reverted, with a Log line) [1.38].
- [ ] "Go here" writes "I head to …"; the card arrows step through a pin's places [1.46].
- [ ] Back at Halvard the airship's and the forest's lore and `<now>` blocks are gone, the Map keeps the Grand Vast Forest tab with the
      places found, and a trip still marked active ends when Charles walks to a campus place (Log line) [1.38, 1.40, 1.42].

## Act 5 — Month 3

### Q5.1 Before the Midterm
- [ ] Study in the Main Library in the evenings before it: in exam week `<now>` states the preparation, and the marks fit it [1.10.1].

### Q5.2 Midterm week (W1 Mon–Thu, marks on Friday)
- [ ] The Main Library has Firetooth tins on the tables this week, and not the week after [1.14].
- [ ] Each morning `<now>` lists the day's exams with an expected mark, its reasons and the day's roll; the narrator plays that mark
      without naming it; a swipe gives the same roll; sitting an exam Tired drops it a step [1.15, 1.30].
- [ ] A decisive moment in an exam (holding out against the Dark Magic Defense teacher, or getting caught with a charm): the update adds
      one `/Exam_events` entry (a step, or `Fail` only for cheating) and never writes `Player.Academics` [1.15].
- [ ] Friday: the marks are posted (toast, Journal, Studies) and match the Studies forecast; teachers and classmates react in character
      [1.15, 1.30].
- [ ] With an F: a "Remedial <subject>" Commitment for Saturday 10:00; attend it, and the Commitment goes and Studies shows "D (make-up)"
      [1.15].
- [ ] With an A: tutor a classmate in it: `/Tutoring` (no Points or Rep_events of its own), the points rise by 40, a third session that
      week is not paid, and a risky attempt in that field shows "top mark in …" among the Fortune modifiers [1.15].

### Q5.3 Training Week (W3, curfew 21:00) and the Dorm Competition (W4 Sat–Sun)
- [ ] Charles qualifies with a teammate: Academy reputation +5 Rep XP and the teammate's bond XP +5, with no Rep_events report; a later
      title, then an elimination at or below its tier, costs Academy reputation once [1.44]. If he does not qualify: the Academy
      Competition (M6 W4) gives another chance.

## Act 6 — Month 4

### Q6.1 Summer (W1 Mon)
- [ ] The season beside the date turns Summer (Autumn in M7, Winter in M10); the Map shows the default map (M4–M6); the Straw sun hat is in
      stock and the spring-only rows are greyed [1.9.4, 1.14.3, 1.9.5].

### Q6.2 W2 Monday: Charles's birthday, and the Banking House
- [ ] `<now>` says points do not work in Avalon tomorrow, and someone mentions the Banking House; change points into coin (Wallet) [1.39].

### Q6.3 Crowning Day (W2 Tue): the speeches and the flight
- [ ] 07:00: the Headmaster and Vice Headmaster speak before the airship, and `<now>` says the flight leaves at 07:30 [1.15.2, 1.40].
- [ ] After 07:30: "Airship — Common Room", the Airship tab and no dorm curfew; on this holiday flight the stewards serve drinks [1.40].

### Q6.4 Avalon
- [ ] Landing: "Avalon — Skyport", the bracelet weather says Avalon, the Avalon tab takes over (six pins, no castle pin), and the airship's
      lore and block are gone [1.39, 1.40].
- [ ] The parade has the Royal Mages at its head; the King speaks at Crown Square [1.39].
- [ ] `<now>` names the place, the walks, the fares and the events of the hour [1.46].
- [ ] Walk to the Garden of Avalon: the clock moves by the walk (about 75–80 minutes from the south) and stamina drops a little. A hire
      carriage back (`Avalon.Ride`): about half the time and 10 coin [1.39, 1.46].
- [ ] A street snack: the narrator gives a Price, the coin is paid, and the line says "story price" [1.45].
- [ ] Walk up to Eldrasil Castle: the Royal Guard turns Charles back and the location stays at Crown Square [1.39].
- [ ] The narrator plays only the street events `<now>` lists (a pickpocket, another academy's student, Tsubaki lost) and adds no trouble
      of its own; a swipe keeps them [1.39].
- [ ] Optional (costs reputation): stay out past 15:30: `<now>` says Charles missed the muster, the Journal records it, and Academy
      reputation drops [1.39].
- [ ] The 16:00 flight home lands at the Grassy Field and Hills; at Halvard the Avalon lore and block are gone, and the Map keeps the
      Avalon tab [1.39, 1.40].

### Q6.5 Crowning night
- [ ] After 18:00 the Map shows the fireworks over the lake and the airship beyond the Gymnasium. Ask where the fireworks are and where the
      airship waits: the narration matches [1.14.4].
- [ ] Ask what hangs from the castle towers: deep blue and gold banners [1.13.2].

## Act 7 — Months 5 to 8

### Q7.1 Results & Dorm Ranking (M5 W2 Fri)
- [ ] The final marks are announced stage by stage before the dorm rank, the rank matches the Log line's marks, and the next payout follows
      it [1.15, 1.10.1].
- [ ] At the feast the Headmaster and Vice Headmaster speak before the food [1.15.1].

### Q7.2 Autumn and The Thinning (M7)
- [ ] M7: the Autumn map, and the autumn stock (the Ember pouch) [1.14.3, 1.9.5].
- [ ] The Thinning week (M7 W3) has its own event map [1.14.3].

## Act 8 — Month 9

### Q8.1 The Academy Bazaar (W2 Thu–Sat)
- [ ] Ask what the foreign traders sell: the narrator names the five nations' goods [1.13.1].

### Q8.2 Founder Day (W3 Sat)
- [ ] At the feast the Headmaster and Vice Headmaster speak before the food [1.15.1].

### Q8.3 Kingdom Competition week (W4), Charles not on the team
- [ ] Tuesday to Sunday the classes run as usual, Gavlan is away with the team, and nobody from the rival teams turns up on campus [1.32].

## Act 9 — Month 10 (winter)

### Q9.1 Winter arrives (W1 Mon)
- [ ] The Winter map; the Lined winter cloak and the Ember pouch in stock [1.14.3, 1.9.5].
- [ ] The Old Hut, the Swimming Pool and the Canteen: the snowed-in hut, the steaming pool, the winter menu; each Map card shows its Winter
      line [1.14].
- [ ] The Forest Clearing is still green and in flower [1.13.2].

### Q9.2 Remembrance Day (W1 Tue)
- [ ] In the evening the Headmaster, the Vice Headmaster and Rei speak before the lanterns; Rei is short and plain, and in conversation
      afterwards as blunt as ever, not withdrawn [1.15.2].

### Q9.3 A cold morning (about −2 °C)
- [ ] Outdoors, someone soaks Charles with a water spell: the update has `/Exposure/-` with `"Kind":"soaked"`, the bracelet shows Soaked
      and Chilled at once, and the next reply shows wet clothes and shivering without being told [1.9.4].
- [ ] Again with a wool scarf and mittens: only Soaked at first, Chilled after a few more minutes outside. Indoors: Soaked only, and an
      hour indoors dries it [1.9.4].
- [ ] A swipe of the soaking reply gives the same conditions and the same mana [1.9.4].
- [ ] Hot spiced tea or mulled apple cider at the Mall: the Log or a toast reports the cleared condition, and the shivering stops [1.9.5].

## Act 10 — Month 11

### Q10.1 The Academy Trip: Sunreach Bay (W2 Fri to W3 Thu)
- [ ] Friday: `<now>` says points do not work abroad tomorrow; change some into coin [1.41].
- [ ] Saturday is a full day of flying; at 20:00 the location becomes "Sunreach Bay — Skydock", the Map opens on the Sunreach tab with the
      night map, and the bracelet weather says Sunreach Bay (warm south) [1.41, 1.32].
- [ ] Sunday: the 09:00 briefing is in `<now>`. Walk to the Crossing, then take a carriage (`Sunreach.Ride` "carriage") and a water taxi
      ("boat"): half the time, and the coin. At 18:00 the map, the card and the place entry switch to their night face [1.41, 1.46].
- [ ] A bet at The Golden Tide: the update sets `Sunreach.Bet`, the narrator plays up to the throw, the next `<now>` says how it went, and
      the coin changes by the stake. At Velvet Lanes or the casino `<now>` only reminds that it is out of bounds [1.41].
- [ ] Over a day or two the narrator plays only the students `<now>` names (another academy's, or Halvard's), each in character, and the
      sights; on the Open Sea (the tour boat from the Sea Dock) the sea sights, perhaps once the Leviathan far off [1.41].
- [ ] Settings → Campus life → Ambient moments: on Rare a day here brings fewer street sights and people than on Often [1.43].
- [ ] The Academy Trip entry carries the city index, and a place's own entry joins when it is mentioned; after 22:00 the curfew line is
      the teachers' at The Hanabira [1.41].
- [ ] Thursday 08:00 boarding; back at Halvard the Sunreach lore and block are gone [1.41, 1.32].

### Q10.2 Graduation (W4 Sun)
- [ ] The afternoon in the Main Courtyard and Founder's Park (the Music Club on a small stage by the statue): stalls, the Farewell Pine with
      ribbons, snowmen only if it snowed; the Map shows the winter Graduation map; at dusk the airship moors above the Grassy Field
      [1.14.1, 1.14.2, 1.34.2, 1.14.3].
- [ ] At the feast the Headmaster and Vice Headmaster speak before the food [1.15.1].

## Act 11 — Year 2

### Q11.1 The Entrance as a guide (Y2 M1 W1 Mon)
- [ ] 07:30–08:59: the roster first-years are new to Halvard: no dorm vest, and no first-hand dorm, teacher or classmate stories before
      their own sorting [1.9.2].
- [ ] 09:00: Baelin and Althair speak before the Stone sorting; each sorted first-year gets a vest from a Council member and sits with their
      dorm; Charles watches from the gallery without touching the Stone [1.9.2].
- [ ] 10:00: Charles guides two roster first-years, the same three through several places and a swipe [1.9.2].
- [ ] Linus, Maple, Nerys, Hadrian, Wren and Tsubaki show their portraits and thumbnails [1.9.6].
- [ ] Ask what year Charles is in and when the World Competition is: Year 2, Month 11 Week 4 [1.9.7].
- [ ] The reasoning opens with `Now: Y2 M? W? Day HH:MM at <place>`, and VectFox dates new events "Y2", not mixed with Year 1 [1.11.2,
      1.11.3, 1.61.1].
- [ ] The castle's Floor 3 lists the second-years' Lecture Halls, Study Rooms and lockers; "Go here" puts the narration there among
      second-years; `World.Location` reads "Lecture Halls — Floor 3" and the bracelet and the Map agree; in class time `<now>` gives Floor 3
      [1.24.2, 1.24.3].

### Q11.2 The Council election (Y2 M10 W3), if Charles is on the Council
- [ ] Caralynn runs against Charles (otherwise Percival); record a vote after Saturday 16:00; at the start of Year 3 the winner and the
      losing candidate take President and Vice President [1.34].

## Act 12 — Year 3

- [ ] Aurelian, William, Bruno, Bianca, Rigel, Topaz and Faye appear in the roster, the Cast Sheet, the dossiers and the regulars only after
      they arrive, with portraits and thumbnails; Aurelian's inner truth stays narrator-only; William predicts patterns without revealing
      secrets [1.34, 1.34.2].
- [ ] The Year 3 Council nominees are Hadrian and Nerys; Bianca attends Council and keeps the Swimming Club [1.34].

## Milestones (whenever they come)

### MS1 The first twenty replies
- [ ] The update writes `/Gist` in most replies; after about 15 replies `<current_state>` has `_Recent_story` lines that match what
      happened just before the chat the narrator sees [1.66, 1.67].
      msg 75: `/Gist` written; `_Recent_story` comes after about 15 replies.
- [x] The update's `<Analysis>` stays at about three lines, with no Points sum [1.53].
- [ ] New Journal lines are turning points that say what changed, not scene summaries; a settled matter gets a closing line [1.57].
- [ ] No rank, XP or Trust number appears in the prose [1.56].
- [ ] Names spoken only in the prose still unlock in the dossiers [1.58].
- [ ] The update still writes Mind, Knows, Next and the other fields that start empty, when they are needed [1.11].
- [ ] An update block that misses its `<JSONPatch>` tag (Gemini Flash does it now and then): the place and the time still change and the
      Log says the engine read the malformed block. Broken JSON: a toast asks to swipe. The console shows no MVU error for the recovered
      commands [1.30.1].

### MS2 People and bonds
- [ ] Alyssa or Ottavio: say only "tell me about your spirit": the prompt has the Spirit Tiers entry and the narrator places the spirit in a
      tier; "can you summon it?" adds Spirit Pact; "there's a monster in the forest" adds Magical Beasts [1.35].
- [ ] Royhan at Rank 1+: his dossier has a "Routine" line after Haunts, and the Potion Halls Map card lists him under "Usually here". At the
      Dovecote around 18:30 on a few Wednesdays, `<now>`'s "Likely around" names him on most of them; a swipe gives the same [1.52].
- [ ] A Rank 3+ friend seeks Charles out: the initiative in `<now>` gives a concrete reason that suits them, and the reasons vary over
      several contacts (a shy one leaves a note, a confrontational one wants a challenge) [1.10.2].
- [ ] "The reason is a favour": accept it, and the update adds a Commitment of Type "favour" with With, Due and Item or Where (the Planner
      shows "bring: …"). Do it: the Log says "Favour for X kept", the Item leaves the Bag, and Trust rises. Another left past its Due:
      Tension rises once, and they react in character [1.49].
- [ ] Rank 4: with Weather on, their mood badge sits on the lower right of their bracelet portrait [1.22]. An hour of mana training with
      them: the update reports `/Practice {"Track":"mana","With":…}` (not `/Training`), and the Log shows the gain "with <name>" [1.45].
- [ ] Friends present each keep to what they share and how they carry Trust and Tension (their "Now with Charles" block), and recent
      moments keep continuity [1.56].
- [ ] Rank 7 friends or rivals (as Connections shows them): over a few weeks the Journal gets a "Meanwhile: X and Y …" line now and then,
      and a "Nearby" line in `<now>` sometimes names two people Charles knows; the narrator keeps it light [1.51].
- [ ] A story relation (`Campus_State.New_relations`) left alone for four in-game weeks is pale in Connections; after eight it is gone
      [1.51].
- [ ] A close friend's eleventh new fact: a fold of their older facts comes first in their Known_facts as `[until …]`, and later scenes stay
      consistent with it [1.63].

### MS3 Story events
- [ ] A broken promise, an insult or a betrayal: the update reports `letdown` / `offence` interactions with a Weight, never a Trust or
      Tension number. An accident gets `"Meant": "no_harm"`, a forced act `"Meant": "forced"`, and the character reacts in character
      either way. Teasing both sides enjoy is talk or a hangout, never an offence [1.59]. With a friend present a broken promise still
      brings a Trust drop; alone, a slight to someone Charles knows still counts as Tension [1.55].
- [ ] A death, a betrayal or a sworn bond: the update writes that Journal line with `!`; thirty lines later it is still in
      `<current_state>` under `_Kept_from_earlier`, and the Journal panel shows it with a pin [1.62].
- [ ] A promise or question left open gets a Hook as well as (or instead of) a Journal line, and the Hook goes once it is settled [1.62].
- [ ] A lasting change (a place wrecked in a fight): the update records `Lore_changes` with a Cause in the reply that shows it, the toast
      "The world changed: …" appears, and the Journal has its line. Later the place reads as changed (its lore entry opens with "[Changed
      in this campaign …]"). Journal → Lasting changes → Undo removes it and the next reply follows the lore again; a swipe of the reply
      that made it takes it back too [1.60].
- [ ] Over days of ordinary play the narrator changes no lore on its own; a refused change shows in the Log with its reason [1.60].
- [ ] A letter or a competition that comes up unexpectedly is still recorded [1.54].
- [ ] An injury with a `Heals_by` time: once it passes, `<now>` asks for a recovery scene or a Medical Centre visit, and the injury stays
      until the story treats it [1.18].
- [ ] A named reputation deed (a staff job, being caught after curfew): the update reports its Kind and the Student file shows the engine's
      fixed change; a custom deed still takes its own Rep and XP [1.18].
- [ ] Something risky and uncertain that matters (talking a suspicious Dove out of a search) is settled by the Fortune number; a quiet
      turn stays quiet, with no ambush or twist the story did not set up [1.9.8, 1.11.2].
- [ ] Mysteries: a Clue with a Where in an open thread puts "?" on its Map pin, and the place sheet names the thread; there, `<now>` has a
      "Trace" line once that week and the narrator shows a small sign, not a solution; once solved the "?" goes [1.51]. With several open,
      `<current_state>` shows in full only the thread tied to the scene and the rest as `Clues_not_shown` lines; the narrator adds no
      duplicate clue to an indexed thread, and a new clue lands under the right thread [1.65]. Past 40 clues, the Mystery Board's solved
      threads show "older clues, kept on file" [1.61].
- [ ] Name an absent character whose `NPC_status` is on record: the next `<current_state>` shows that status in full, and the prose
      respects it [1.65].
- [ ] If an update ever reports a hangout with someone who is not there: no bond XP, and the Log says why [1.42]. If the narrator puts a
      rival academy student (Mirelle, Kira, Theodore, Elion…) into a campus scene: the bracelet leaves them out and the Log says why
      [1.30.1].
- [ ] Craft Rank 4: a Project of Kind tailoring or craft under way shows "Masterwork if finished this turn" in `<now>`; finish it in the
      story: a masterwork in the Bag, and the Project closes [1.29].
- [ ] Knowledge Rank 5 (Encyclopaedic): a reply in the Main Library files a "Records: …" clue, and the next reply reveals what the record
      shows [1.44].

### MS4 A long Journal (some in-game months in)
- [ ] Once ten Journal lines have left the window, the update has `/Fold`, and the next `<current_state>` shows a dated `_Chronicle` entry
      that keeps the names and promises of those lines (Journal → The story so far) [1.63].
- [ ] A friend whose old Journal lines have left the window comes into a scene: their Cast Sheet shows "Earlier, from the record" with up
      to three of those lines, and the narrator's callbacks match them [1.64].
- [ ] At a place an old Journal line names, `<now>` shows "Earlier here, from the record", and the prose may nod to it without retelling it
      [1.64].

### MS5 After a session: the export and VectFox
- [ ] Send the chat export (and VectFox's EventBase export now and then): `audit_chat.py --mechanics --memory --vectfox` finds no ghost
      events unless messages were deleted or edited, every Year 1 date carries `Y1`, and the narrator did no engine work (no weather
      stamina, no Trust written) [1.61.1, 1.53.1].
      2026-10-05, the 1.35 chat re-vectorized (74 messages → 24 events): 0 ghost events, every date `Y1`. The engine-work half waits
      for new play.
- [ ] VectFox events: the scene time reads like "Y1 M1 W2 Tue 13:40 t1"; a reply with a Journal line is stored as a turning point of
      importance 6+; fewer events than before, no "walked to …" entries, open threads only for real promises; nothing from the update
      block, the Cast Sheet or the NPC thoughts; swiping a reply twice leaves no duplicates; Builder and Settings notes never become events
      [1.57, 1.61, 1.66].
      2026-10-05 re-vectorize: no travel or location events, no near-duplicates, nothing from the update block, colour tags or
      thoughts; the sorting (Journal line) is importance 7, but the arrival line came out as an ordinary introduction (4). Old messages
      carry no scene marker, so `t1` appears only on new messages.
- [ ] The scene marker: a sent message shows as you wrote it, its raw text ends with `(scene: … · <place> · t1)`, the narrator's prompt does
      not have it, and VectFox's debug query shows it in the search text [1.66].
- [ ] VectFox → Action → debug query with `query` 2, then 1: the event that matters most comes back first; keep the better setting [1.66].
- [ ] When saving feels slow (over about two seconds) or the chat file nears 100 MB, tell me: that starts memory batch 8
      (`planning/DRAFT_bab_baru.md`) [1.19].

## Side quests (any time)

### SQ1 Swipes, edits and rewinds
- [ ] Swipe a reply: the new prose and the bracelet's state replace the rejected one [1.9.1].
- [ ] After a reply, edit the Student file or a Settings row: that reply stays last with its swipe arrow, and the bracelet stays on it.
      Swipe it: the edit survives and the rejected narration's changes do not; play one turn and check again. Delete the swiped reply and
      replay the turn: the same [1.9.1, basics].
- [ ] Then swipe back to an older swipe of that reply and note whether it still shows the Settings change (MVU keeps variables per swipe)
      [1.11.1].
- [ ] Note the Fortune number in `<now>`, change a setting, swipe: the same number [1.11.1].
- [ ] F5 and reopen the chat: red dots already cleared stay cleared, the others remain. Swipe the reply that brought something new: its dot
      goes, and nothing already seen comes back [1.25].
- [ ] An OOC question to the narrator: the clock does not move and the state does not change [1.16.1].
- [ ] Only where you can spare the replies: delete back a few messages and write on. The next scene marker says `t2`, `<now>` has "Rewound
      story: … never happened", and a recalled memory of the deleted scene is not treated as real [1.66].
- [ ] In a throwaway branch (branch from an older message, or delete far back there): if the state came from a far snapshot, the toast
      "State came from message N" appears; MVU → Compatibility → Show legacy features → Replay floor, accepting both floors, rebuilds it
      [1.61].
- [ ] A few replies in one-call mode (MVU → Current character-card settings → Variable update method → Alongside AI output): one request a
      turn works, the narrator writes the folds too and the prose never mentions them; at the Mail Tower, with a Project open or in an
      exam week, the prompt's `<rule_cards>` shows that topic's rule before `<now>`, and with a friend present Interactions and the trust
      scale. Then back to Extra-model parsing [1.67, 1.63, 1.54, 1.55].

### SQ2 Settings and features
- [ ] Planner, Weather and Ambience off and on: the rule text, `<now>` and the panels follow; a feature's data comes back when it is
      switched on again, and the hidden settings note appears in the chat [1.18, 1.23].
- [ ] Weather Off for a reply in Months 1–3: the scene still reads as spring [1.9.7].
- [ ] Report reminders off: no "Possibly missed" block in `<now>` [1.12].
- [ ] NPC routines off: the Map's "Usually here" row goes, and `<now>` lists only the haunts' regulars [1.52].
- [ ] Routine week off: the Planner section goes, and `<now>` has no routine line [1.50].
- [ ] Dialogue colours off: the next reply has no `<say>` tags [1.37].
- [ ] Preset: 🧠 Internal Thoughts OFF: the next reply has no block; ON again: it returns, and the prose never summarises anyone's thoughts.
      With the regex "NPC Thoughts: drop from every reply" ON, the thoughts still show on screen [1.37.3, 1.37.4].
- [ ] Preset: Realism Mode and Freaky Mode OFF: an ordinary scene has no adult vocabulary; Realism Mode ON: intimate scenes as before
      [1.11.2].
- [ ] World Info → "Alert On Overflow" ON, then a turn that names three NPCs and a topic: no "World info budget reached" toast [1.35].

### SQ3 Screens
- [ ] The bracelet in a real message: the brass bezel, the clock, the icons (location pin, chips, charm row); nothing cut off [1.22].
- [ ] Alegreya in the panels and the bracelet, in the chat and in a message iframe; without the fonts a plain fallback that keeps the layout
      [1.21].
- [ ] Settings → Appearance: all five themes; the bracelet follows at once, the choice survives a reload, and tapping a theme picture
      switches at once [1.21, 1.23].
- [ ] Every panel opens without a console error; the season beside the date and the Planner's period headers read right [1.43].
- [ ] Inventory (the bag icon) instead of Notebook, opening on the Bag with Wallet, Planner and Journal beside it; no separate Bag button;
      the Student file has no Bag or Wallet tab; switching tabs keeps the header in place [1.32, 1.21].
- [ ] Student file → Edit student file (top right) reopens the editor; once registered the bracelet shows no Builder [1.9.1].
- [ ] People: portraits, medals and meters, two columns on a wide screen; a card opens the dossier, which keeps the portrait in view while
      scrolling (desktop); without a portrait, a monogram [1.23].
- [ ] Student file → Overview with a persona image and no upload: the persona picture ("Your SillyTavern persona picture"), also in People's
      own circle; switching persona follows it; an upload wins; Remove brings the persona picture back [1.30.5].
- [ ] Map: + / −, Ctrl + wheel and the plain wheel zoom, dragging pans, a tap after a drag does nothing; closed and reopened, the same zoom
      and centre [1.24, 1.24.2].
- [ ] The Planner and the lore show the calendar events and the weekly timetable, with exam and trial moods [1.19].
- [ ] Studies' six-axis chart reads right in a light and a dark theme; Rank 0 reads as neutral [1.27].
- [ ] A light SillyTavern theme: the dialogue colours turn darker and stay readable; on any theme no speaker's colour is dark [1.37.0,
      1.37.2].
- [ ] Phone width: tabs, buttons and toggles are easy to hit and nothing overflows sideways; the bracelet puts points and dorm under the
      glass, the panel buttons in a 3-column grid, and collapsing leaves the glass and the buttons; the zoomed map scrolls with a finger;
      Studies' chart, the recipe rows and the masterwork line fit [1.21, 1.22, 1.24, 1.27, 1.28, 1.29].
- [ ] Only if starting a reply ever feels slow with many people present: time the prompt build (Prompt Template) [1.19, 1.48].

### SQ4 Throwaway chats and test cards (what Charles cannot show)
- [ ] A new chat: the collapsed bracelet with no student still offers "Create your student" and opens the Builder with numbered steps; the
      "Charles Chevalier" template fills every step and Register works without edits; register once with Normal and once with Custom ranks
      (a custom rank changes Fortune in its field); `send_date` is there when the seed is first set; the Map has the castle rooms and the
      Mall shops from the start [1.24, 1.23, 1.30.4, 1.27, basics].
- [ ] An Occult student: at the Spirit Path the first pact is offered and recorded under Magic.Pacts, and "Summon <name>" appears on the
      Techniques page; tried at another place, the engine removes it and says why [1.31, 1.53]. Summon the partner: if the update sets only
      Summoned (or only the Active entry), the engine adds the other half and charges it; dismissed, both halves go [1.12].
- [ ] A student with hidden magic: using it where it could be noticed raises Dove attention, and a quiet week lowers it by one; ordinary
      movement magic draws nothing; when someone truly learns it, Known_by gets them with a dated Knows line [1.18].
- [ ] A Rank 5 proficiency (Builder, Custom): Arcana (a per-use technique costs 10% less, a Doves reputation line, the toast "Mastery:
      Arcane scholar"), Society (the Liaison's letter; a staff member met for the first time starts at Trust +5) or Knowledge (in the Main
      Library one real lead a week); 504's mastery line appears only at Rank 5 [1.30].
- [ ] Optional: `dist/test/Eldrasil_TEST_LoreDepth.png` against the real card over about ten replies: compare the cached input tokens [1.17].
- [ ] Optional: `dist/test/Eldrasil_TEST_Year2.png` tries Year 2 things early (Acts 4, 6 and 11).

## Retired checks

Checks of the old list that no longer apply (their text: `git show dc2ecad:docs/TEST_CHECKLIST.md`):
- Loading saves older than the Charles chat (1.9.3 #5, 1.9.4 #6, 1.9.5 #6, 1.20 #2, 1.27 #2, the second half of 1.31 #1): the campaign chat
  started on 1.30, and `tests/test_saves.cjs` loads every older save.
- 1.9.1 #1 (the Bag button): the Inventory panel replaced it in 1.32 (SQ3).
- 1.9.2 #4, the feast "without the morning's speeches": since 1.15.1 the feast opens with the speeches (Q1.3).
- 1.9.5 #5 (the Mall's "Connected to" list): map cards have no "Connected to" row since 1.30.6.
- 1.11.3 steps 1–4 and "stored text has paragraph breaks": the VectFox setup is ECOSYSTEM's (Q0.1), and EventBase stores extracted events,
  not prose.
- 1.13 #2 (the map before the upload): the maps are uploaded and pinned.
- 1.19 #4 (v2-only card readers): tracked as `planning/FUTURE_PLANS.md` §3 A10.
- 1.58, the A/B comparison: optional since 1.67 made extra-model parsing the default (the owner's choice); its extra-model checks are in
  Q0.2 and MS1.
- The "Year 1 / Year 2 smoke playtest" line: playing this route is that playtest.
- Before this log, 1.16.1–1.19 had checks but no line in the old "Open" list; they are in the route now.

## Adding checks (each release)

Put a new live check into the quest where the campaign first gives the chance to see it, tagged with the release; with no date, into a
Milestone or a Side quest. When the owner reports a session, tick what passed, note what failed under it, and move "Where you are".
Retire a check only when a release removes what it tests, with one line under Retired checks.
