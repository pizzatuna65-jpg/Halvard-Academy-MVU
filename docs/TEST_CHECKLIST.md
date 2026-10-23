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
| 10 | M11 | Year's End, Sunreach Bay, the World Competition week, Graduation |
| 11 | Year 2 | the Entrance as a guide, the Year 2 cohort, the Council election |
| 12 | Year 3 | the Year 3 cohort |
| MS | whenever it comes | people and bonds, story events, a long Journal, VectFox |
| SQ | any time | swipes and rewinds, settings, screens, throwaway chats |

## Act 0 — Before the next reply (once)

### Q0.1 Update everything
- [ ] Update the card to 1.72 (`dist/Eldrasil_Halvard.png`) and accept the lorebook update: the popup does not ask for a new chat
      [1.11.1], the bracelet shows no "old lorebook" warning, and the MVU panel shows the card's settings as overriding [basics].
- [ ] MVU → character-card settings shows **Variable update method = Alongside AI output** (one model, one
      request a turn) [1.69].
- [ ] Import `dist/Realistic_Frankenstein_2_2_1_3_Eldrasil.json` (a new preset; the old "Realistic_Frankenstein_2_2_Eldrasil" can be
      deleted), select it and leave its toggles as shipped: Realism Mode and the NSFW register ON, Internal States family, Time and Place
      and Colored Dialogue OFF, Staccato OFF, Embellish ON [1.68]. When SillyTavern asks whether the preset's regexes may run, answer yes;
      then Extensions → Regex shows them ON (they can switch off on a preset change) [1.68].
- [ ] VectFox, as `docs/ECOSYSTEM.md` → VectFox says: the settings table ("For this card"); Text Cleaning in Custom mode with "Strip
      <UpdateVariable> Tags (MVU)" unticked, the old "Eldrasil:" patterns and the catch-alls "Rapikan baris kosong" and "Cadangan: hapus
      semua tag HTML" deleted, `dist/vectfox_cleaning_patterns.json` imported (ten patterns); the extraction prompt
      `dist/vectfox_eventbase_prompt.txt` pasted; then re-vectorize the chat [1.11.3, 1.37, 1.37.3, 1.61, 1.66].
- [ ] The old chat "Halvard Academy - 2026-09-16" is mapped to the same memory: keep it closed while VectFox is on, or unlink it [1.11.3].
- [ ] Browser console (F12) on load: MVU comes from `MagVarUpdate@438f9ff…` and `tavern_resource@276040b…`, with no import error [1.42].

### Q0.2 The first replies on 1.69
*Do:* write on from "yeah we will see".
- [x] Nothing is lost: the Fire Dormitory, 300 points, the bonds with Ruby, Percival, Zara, Tilly and Kanae, the two Journal lines, the
      lemon and honey sweet in the Bag, Tilly's 22:45 meeting in the Planner [1.42].
- [ ] Right after loading no bracelet button has a red dot [1.25].
- [ ] People → Bonds: the Order dropdown and ↑/↓ change the cards; a starred person stays on top in every order, and the star is
      still there after a reload of the chat; Activities → Event and Inventory → Planner show the day plan as a time | what table [1.93].
- [ ] A note written in a dossier's "Your notes" is still there after a reload of the chat, and the card shows 📝 [1.94].
- [ ] The first reply may lack some `<now>` lines (presence, walks, ambience): the engine writes them on its first run. From the second
      reply on they are there [1.47, 1.48].
- [-] (extra-model, 1.67–1.68; replaced by the one-call check below) Each reply: the prose arrives, then the update is appended
      under it and the bracelet refreshes. Exactly one update block, and the prose never carries one of its own [1.67, 1.58].
      ✗ msg 75 (1.67.0): the prose ended with an `<UpdateVariable>` of its own, written as YAML of the state, above the real update.
      The state took only the update model's block (10:13, not 10:15), so nothing broke. 1.67.1 tells the story model in 504 that
      without `<update_format>` it writes no update; check again on the next replies.
      ✗ msg 76 swipe 3 (1.67.1, xiaomi/mimo-v2.5): again a block of its own (JSON). Its reasoning quotes the card description,
      "Every reply ends with the <UpdateVariable> block", which reaches the story request: 1.67.2 makes it conditional. The update
      model wrote Time 08:38 → 08:45 (a recalled VectFox event's time); the engine kept the clock at 10:10. 1.67.2: 503 says the old
      time is World.Time and `<VectFoxMemory>` is the past.
- [x] One request a turn (1.69): no "parsing" notice; each reply ends with exactly one `<UpdateVariable>` block after the story and
      the thoughts block, the bracelet refreshes, and the clock moves on from the state's time [1.69, 1.67.2].
      ✓ new chat 2026-10-20 22:07, msg 4 (Gemini 4 Argon): one request of 33,654 in / 1,388 out, against 27,204 + 17,949 in and
      1,207 + 201 out for the two requests on 1.68 (about −25% input); one block, 07:30 → 08:09, the Gist written.
- [ ] The narrator writes the folds and the gist when `<now>` asks, and the prose never mentions them [1.69, 1.63, 1.66].
- [ ] No "Engine error" line in the Log and no `[Eldrasil engine]` error in the console. If one ever appears: the toast "Engine error",
      the state unchanged, and a swipe works [1.20, 1.16.1].
- [ ] Prompt: the chat older than about 24 messages is one "[… N earlier messages …]" line [1.17, basics]; `<current_state>` is YAML
      without empty fields and holds only this update's `_Log` lines [1.11, 1.16.1]; no `<%` anywhere; `<variable_update_rules>`,
      `<update_format>` and `<rule_cards>` are there (one-call: the narrator writes the update) [1.69].
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
- [ ] `<now>` has "Event: Entrance Event. Now: … Next: 19:00 Entrance Feast …" in place of the Today line, and the narrator keeps to
      the day's plan [1.81].
- [ ] The bracelet's Entrance Event chip opens Activities → Event: the plan, Now / Next, and the chance "Be at the Entrance Feast in
      the Ring Dining Hall" (Open) [1.81].
- [ ] Scene cards: under each new reply, one card per person present (Kanae, Zara): the full portrait, "Now:", their true thoughts,
      the rank medal and XP, Trust, Tension. That reply has no folded 🧠 Thoughts (older replies keep theirs); the bracelet has no small
      portraits. Dossier opens their file. A swipe moves the cards to the new reply; editing a reply hides them until it is saved; on a
      phone the portrait sits beside the stats with the thoughts below [1.70]. On Frost and Parchment the name and the line under it
      stay light on a dark band and read easily [1.88.1].
- [ ] Info layers: an open person (Trixie, Ruby) names their club and shows their magic at once, and Trixie talks about the circus;
      their dossier shows the same. Asked about likes, views of others or the Doves too early, they dodge in their own way. A guarded
      person (Kanae, Irene) keeps even their club back until Rank 1 [1.89].
- [ ] Someone not yet named shows their role, not their name; a passer-by has "Keep in record"; with four or more present, three
      cards and an "also here" row; a thought about someone absent is an "elsewhere" line [1.70].
- [ ] The bracelet has a folded "This reply (n changes)": open it after a reply with Kanae or Zara; it lists their bond XP (and any
      Trust or Tension move), points spent with what for, Bag in and out, new Planner entries and Journal lines, and agrees with the
      People panel and the Wallet. It stays open while the bracelet redraws, is gone when the bracelet is collapsed, and a swipe shows
      the new reply's own changes [1.79].
- [ ] A brass rule sits between the bracelet and the story [1.71].
- [ ] Card actions: no generic buttons; Kanae and Zara get only what their rank and this place open (at Rank 0 usually just Give a
      gift, which lists the Bag with "not tried"). A button only fills the chat box; edit and send, and the engine counts it as usual [1.71].
- [ ] Map: as a Fire student, the Sky, Light and Viridian Dormitory pins are gone; the Fire Dormitory and everything else shows [1.71].
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
- [ ] That clerk's or student's Extras record: Looks is how they look on any ordinary day, not the scene they were met in (soaked, muddy,
      out of breath) [1.78].
- [ ] The first clerk or student the narrator invents takes the name for their gender from `<now>`'s "Next new character" line (no
      Elara, Kael or Voss) and acts on the traits listed there, the bad ones too; at the second appearance the record request lists the
      same traits and the record's Manner carries them; the next line offers new names and a new set [1.96, 1.96.1]. HQ NPC Genesis
      (ON) uses that name and those traits instead of its own five-name draw [1.99.3].
- [ ] Four or more replies later the prompt holds those quotes without `<say…>` tags; a stray `</say>` never shows in the chat [1.42].
- [ ] Prose (preset): Charles's action and words are expanded (Embellish), but over a few replies the openings vary and not every
      reply starts with Charles [1.99.3]; the others answer as themselves and nothing is
      decided for Charles beyond what you wrote; about 4–7 paragraphs; no "not X, but Y" or "It wasn't X. It was Y."; NPCs sound distinct,
      act on what they decide, and a nervous one keeps their stalls; jobs and jargon do not take over idle talk [1.36, 1.52.2].
- [ ] What people carry comes up when the scene uses it: Zara's sketchbook (she hides it) and Kanae's things are not in every reply;
      each sheet in `<cast>` reads "Carries (shown when the scene calls for it):" [1.77.1]. A quirk or habit likewise shows when the
      moment calls on it, not in every reply [1.99.3].
- [ ] A quick greeting keeps the clock or moves it a minute; a real ten-minute talk moves it about ten [1.9.3].
- [ ] Titles and place names stay as the card writes them ("the Vice Headmaster", the Council's Vice President, the
      Velvet Lanes if Sunreach comes up), never swapped for another word; a long talk is broken only by the tour, the calendar, a regular or
      someone present, never a call or an event from nowhere [1.99.3].
- [ ] Prompt: `<latest_input>` (Player Input Authority) calls the closing "(scene: …)" marker game data; the narrator never quotes it
      or answers it as Charles's words [1.99.3].
- [ ] With Kanae and Zara here the Prompt's 502 says "Interactions: … the full rule is in <rule_cards> now" and `<rule_cards>` holds the
      Interactions, Trust/Tension and reputation cards; the update still reports each interaction with a Kind and a Note, a letdown
      or offence with its Weight, and a deed with a listed Kind [1.99.4].
- [ ] `<now>` ends its optional lines with "Optional threads (Likely around, …): use at most one": during a focused talk nobody from
      Likely around or Nearby barges in, and over several replies at most one such thread comes up in each; no two replies in a row
      open with the surroundings [1.99.4].
- [ ] Kanae, Zara and whoever else is here act in their own concrete ways: no "A beat." or "A pause." beats, and not a row of people
      who all smile "quietly" or "say nothing"; Kanae shows displeasure only as a smile held a moment too long [1.99.5].
- [ ] On the tour each walk takes the minutes `<now>` gives under "Walks from here" (the Prompt's Campus Map lists none any more); a
      question about a club's meeting place is answered from the Clubs entry [1.99.5].
- [ ] Someone only talked about (the Headmaster in a speech, Percival mentioned by Zara): in the Prompt their entry starts "Only mentioned,
      not here" and holds no `<narrator_only>`; when Charles's own message names someone ("I go to find Kanae"), her whole lore is
      there and she sounds like herself when she appears; Settings → Features "Short lore for people only mentioned" off brings the
      whole lore back [1.99.6].
- [ ] A new roster character: short first lines with no head-to-toe description, then they sound like their sheet [1.35.2, 1.99.3]. The update starts their bond with
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
- [ ] Activities → Clubs: the Student Council lists only the members Charles has met (Irene, Caspian once met), the rest as "+N you
      have not placed yet", like every other club [1.74].
- [ ] The directory: the Camping Club on the Hills (no Walking Club); no teacher shows as an advisor before Charles knows it (Rank 1 with
      them, a member of their club, or told: then by their class until their name is known), and a teacher's dossier Role line leaves
      out "advises the" until then; the narrator puts Lenna at the Archery Range, not the Menagerie, when the Archery Club meets [1.75, 1.76, 1.88].
- [ ] The directory: the Newspaper, the Divination Society, the Cooking, Brewing and Gardening clubs, the Alchemy Circle, the Medical
      Centre Volunteers, Groundskeeping and the Festival Committee show a "For the campus:" line; Settings → Features → Club work off
      hides it [1.90].
- [ ] Optional, the Student Council (besides a club): Saturday 10:00–12:00 the bracelet and `<now>` point to the Council Chamber,
      attendance and study time count there, an F remedial comes first, and the afternoon club still meets [1.34].

### Q1.3 The Entrance Feast (19:00, Ring Dining Hall)
- [ ] After 45 minutes at the feast (one reply or several) the Log shows "Event chance done: Be at the Entrance Feast …" with Society +2,
      and the Event tab marks it Done; it never comes back this year [1.81].
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
- [ ] Two risky attempts in one reply (slip past the patrol, then get through a locked door): `<now>` lists three Fortune numbers, and
      the reasoning takes the first for the first attempt and the second for the next, never one number for both [1.78].
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
- [ ] A Saturday 06:00–08:00 at the Fishing House: smoked river fish for 4, "Services here", and (not a member) "Fish the pond or the
      lake" is open for the dawn session; on Sunday dawn it is members only again. The Map card's Clubs here row names the services [1.91].

### Q2.6 An ordinary evening, and a rainy day (any time in M1–M3)
- [ ] More people around Charles on an ordinary day than a scene holds: `<now>` names one who takes their leave, and they go in the next
      reply for a reason that fits them [1.10].
- [ ] Rain: `<now>` says who "Moved indoors"; outdoors while Soaked or Chilled the update takes no stamina for it (the engine does)
      [1.47, 1.53].
- [ ] Use a Rain-ward charm before going out into the rain: the update puts "Rain-ward charm" in `/Consumables/-` and the Bag count drops;
      half an hour in the rain does not soak Charles [1.9.5].
- [ ] Soaked (or hurt, or worn out) with someone present: `<now>` has "How Charles looks (anyone near can see it …): wet through"; someone
      may notice it in the narration, nobody has to; once he is dry the words leave the line [1.77].
- [ ] Soaked or Chilled over several replies: each shows it in Charles's body or in what he can do, with a different detail each time
      (not the same "dripping hair, chattering teeth" picture); out of the rain alone with no fight or practice, `<rule_cards>` has no
      Exposure card, and by the lake or in the rain it has one [1.99.4].
- [ ] A storm or a happening that shuts something for a while (a flooded path, a closed room): the update writes a Lore change with
      `"Until"`; the Journal says "changed until …", the Planner lists its last day, the place reads "until …" in its lore, and the
      morning after that day the change is gone with "… as it was again" [1.77].

### Q2.7 Saturday and Sunday
- [ ] Saturday afternoon at the club adds Student reputation (Q1.2) [1.16.1].
- [ ] Sunday 07:30: "Morning, no classes today" [1.30.2].
- [ ] Saturday 15:00–17:00 in the Canteen: `<now>` says whether the Cooking Club's bake worked (honey bread, 3 points, stamina) or went
      wrong (free failures); the bracelet shows "Stalls here" and Activities → Shop lists it. 14:00–18:00 in the Potion Halls: the
      Brewing and Alchemy table (Warming and Cooling draught 12, Cold remedy 15); on Sunday both are gone [1.90].
- [ ] Saturday 13:00–16:00 at the Workshop: "Services here"; `<now>` and the Price Guide list the Tailoring and Smithing services.
      Order a made-to-measure coat with a design: 50 points (25 for a Tailoring member), nothing in the Bag, the Agenda and Activities
      → Clubs → Your orders say "ready to collect at the Workshop" next Saturday; collected then with the design in its Note, and it
      keeps Charles warm. A damaged coat or item in the Bag: Mend 5 / Repair 10, at once [1.91].
- [ ] A weekday 16:00–19:00 at the Main Library: borrow a book (the narrator writes the subject in Note): "Library book: <subject>" in
      the Bag, due back in seven days; studying with it in the dorm counts; kept too long, it is recalled and loans stop for 14 days.
      An Archive records search gives Fortune "Archive records +5" on Charles's next Competition bout day [1.91].
- [ ] In a service club (Tailoring, Smithing, Fishing, Library Assistants), some weeks (about two in five): at the club on its day,
      `<now>` "Club client: <student> comes to the … and <ask>"; the narrator plays them in character (an unmet student is introduced),
      and a job done is recorded as a help Interaction. A week Charles skips it, the Journal says another member took the job [1.92].
- [ ] On a Sunday (students may drink only on Sundays, in the Mid-Year Break and in Month 12), mention drinking or Barrow & Vine: the
      alcohol rule (entry 512) is in the prompt [1.54].

## Act 3 — The rest of Month 1 (W2–W4)

### Q3.1 Monday, M1 W2
- [ ] From 07:00 the Notice Board has the Academy Newspaper (front page: a rumour that is all over campus, or a result; the week ahead;
      a ghost corner); `<now>` Monday to Wednesday says what it leads with, and NPCs may bring it up. A rumour it printed shows "(in the
      Newspaper)" in the Journal's gossip and lasts three days longer [1.90].
- [ ] W2 Thu, Castor's birthday, with Castor present: his Cast Sheet's Mood line ends "Birthday (glad): warmer to anyone who remembers
      it.", and the narrator plays it in his quiet way; on the scene card the "glad · birthday" chip shows only once his dossier has
      opened his birthday [1.72].
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
- [ ] Arrange something with one person while a Rank 3+ friend is in the scene (a duel, a date, an exam to sit), then let its day
      pass without that friend. The next time the friend is with Charles (within 10 days), their Cast Sheet has "Knew about {{user}}'s
      "…" (…) and has not heard how it went: may ask, if that is like them."; the next day it is gone [1.73].
- [ ] A Rank 2+ person Charles has not seen for a week or more walks back in: their Cast Sheet has "Apart: last saw {{user}} N days
      ago…", and the narrator lets it show (or not) in their own way, never as a report [1.73].
- [ ] At the Mail Tower, write a letter home: the update records it, a week later a reply waits at the Mail Tower, and any parcel lands in
      the Bag or the Wallet [1.31, 1.54].
- [ ] Write a letter to a friend in the dorm (not at the Mail Tower): a "Post it at the Mail Tower" toast and "not posted yet" in Letters;
      at the Tower it goes. Two or three days later a "Reply from …" may wait; reading it, the narrator writes it in the friend's own voice
      and it answers what Charles wrote. The narrator never adds a reply itself [1.95].
- [ ] A month Charles has not written home: some time in Week 3 a letter from home may wait (the family as the player wrote them).
      A Rank 3+ friend Charles has not seen for a week may write unasked; the letter sounds like them (a short note for someone who
      rarely writes) [1.95].
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
- [ ] At the Combat Grounds with a Fire student present: their card has "Spar with <name> · Prowess +2"; a Light/Sky/Viridian
      student has none; after one session today the button is gone. A Rank 4 friend's card shows only their own training tracks [1.71].
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
- [ ] Before it (from W2): the Notice Board's Star Night posting is signed "Festival Committee" and lists the programme (the event's
      chances); the Bazaar, Founder Day, the Harvest Festival and the Club Festival are posted the same way [1.90].
- [ ] On the hills from 20:00 the bracelet shows "Stalls here"; Activities → Shop lists the Star Night market (cider 6, cocoa 5,
      chestnuts 4, skewer 7, star chart 15) and buying one costs exactly that; the Price Guide in the Prompt lists "Event stalls here".
      Away from the hills it says "Event stalls today: … at Grassy Field and Hills"; on Sunday the stalls are gone [1.81].
- [ ] `<now>` names the chances only while they are open there, as "the player's choice"; the narrator does not steer toward
      them. An evening on the hills gives Arcana +2 once; being there when the meteor shower starts (23:30) marks it Done and anyone
      with a Rank 3+ bond who is present keeps "Watched the great meteor shower on Star Night with {{user}}" in their Recent moments [1.81].
- [ ] Caspian, Kanae, Lenna or Bobby present: their Mood line names Star Night with their own tone (busy, radiant, hopeful, in
      demand) and how they take it; their bracelet mood badge has the bright ring, its tooltip the tone [1.72].
- [ ] A clear, calm day, and no 20:00 curfew that night [1.30.3].
- [ ] From Saturday 20:00 the Map panel and every location card header show the magical-lit map, the pins on their buildings; from Sunday
      06:00 the default map is back [1.13, 1.14.3].

### Q3.6 Spiritual Dorm Day (W4 Sun) and the month's end
- [ ] On the day the Viridian Dormitory's pin is back on the map, and gone again on Monday [1.71].
- [ ] From the Wednesday before, `<now>` shows "Coming up … W4 Sun: Spiritual Dorm Day", and now and then a student mentions it in passing,
      in character, not everyone [1.32].
- [ ] Sunday night into Monday: the date lands on M2 W1 Mon even if the narrator forgot the Week. If the date ever jumps more than three
      days, the toast "Time jumped N days" appears [1.11.1].

## Act 4 — Month 2

### Q4.1 The Warding Rite (W1 Fri dusk to Sat dawn)
- [ ] Forty-five minutes in the Main Courtyard from 18:30 gives Arcana +2 once ("Event chance done: Stand with the dorm …"); before
      1.81 this never fired, because the engine writes the Main Courtyard as Courtyards [1.81].
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

### Q5.3a The Club Festival (W2 Fri–Sat)
- [ ] After Saturday 18:00 the Journal says which club won the coin vote and `<now>`'s Event line names it; if it is Charles's club,
      Student reputation rises once without a Rep_events report [1.82].

### Q5.3 Training Week (W3, curfew 21:00) and the Dorm Competition (W4 Sat–Sun)
- [ ] An evening at the sparring on the Combat Grounds: the Log says opponents were scouted, and Activities → Competition shows their
      strength (stronger / even / weaker) in Charles's bracket [1.82].
- [ ] On Saturday `<now>` has "Contest: Dorm Competition, <role> bracket … {{user}}'s next bout: Sat 09:30, against …" and how to
      report it; an unnamed opponent gets a name, a look and a style from the narrator, who writes one Results line per bout [1.82].
- [ ] After each reported bout the next one is named; Placement and Status are set by the engine when Charles's run ends, and the
      Competition tab's bracket matches what the story showed. A bout left unreported is played off-screen at the next round [1.82].
- [ ] Charles qualifies with a teammate: Academy reputation +5 Rep XP and the teammate's bond XP +5, with no Rep_events report; a later
      title, then an elimination at or below its tier, costs Academy reputation once [1.44]. If he does not qualify: the Academy
      Competition (M6 W4) gives another chance.

## Act 6 — Month 4

### Q6.1 Summer (W1 Mon)
- [ ] The season beside the date turns Summer (Autumn in M7, Winter in M10); the Map shows the default map (M4–M6); the Straw sun hat is in
      stock and the spring-only rows are greyed [1.9.4, 1.14.3, 1.9.5].

### Q6.1a Secret Fools Day (W1 Wed)
- [ ] Activities → Event shows the name Charles drew (if he joins in) and, after 20:00, who drew his; `<now>` gives the narrator both and
      asks to keep the prankster hidden until the story shows them; someone who would never prank does something gentle or nothing [1.83].
- [ ] At Merryhew's everything is 25% off: the Shop tab shows the sale price, the Price Guide says so, and a purchase is charged it;
      the next day the price is back [1.83].

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

### Q7.1a The Mid-Year Break (M5 W4)
- [ ] From M5 W3 Activities → Event offers "Go home for the break"; armed, the next reply takes Charles home and back on M5 W4 Sun 18:00
      in one montage, with nothing invented about his family beyond what the player wrote, and a Journal line [1.83].
- [ ] Staying instead: `<now>` and the Event tab name the students who stayed (Etnie, Dante, Lenna, Castor, Tilly and a few more); the
      others are not around (the Map's Regulars, `<now>`'s presence lines), and nobody gone home seeks Charles out [1.83].

### Q7.1b Sports Day and the Academy Competition (M6 W3–W4) [1.87]
- [ ] Sports Day: Activities → Event offers "Enter an event"; after 18:00 the Journal gives the medals by dorm and `<now>` says who
      took the most [1.87].
- [ ] Academy Competition Wednesday: if Charles qualified, Competition is Academy, entered, Team names his three teammates, and `<now>`
      names the first match and how to report it; each day the next match; the Competition tab draws the bracket. If he did not, `<now>`
      brings the news a round at a time and the Journal names the winners on Saturday [1.87].

### Q7.2 Autumn and The Thinning (M7)
- [ ] M7: the Autumn map, and the autumn stock (the Ember pouch) [1.14.3, 1.9.5].
- [ ] Fair week (M7 W2): without a stand `<now>` says how to record one; building one, the narrator keeps it as a Project with Kind
      "fair" and raises its Progress; Saturday after 18:00 the Journal has the panel's mark, `<now>` says it, and the Studies tab shows
      "Fair mark" (in M8–M9 W1 the Magic Theory forecast uses it when it is better) [1.85].
- [ ] The Thinning week (M7 W3) has its own event map [1.14.3]; indoors its own beats come up (the ward flickering on the outer wall, no
      birdsong, knocking in the wall), never a breach or a Clue [1.85].

### Q7.3 The Circus and the Showcase (M8 W2–W3)
- [ ] Circus Thursday after 18:00 in the Courtyards: the bracelet's "Stalls here" chip, the Price Guide's Circus stalls with their hours,
      and a candied apple costs 5 points; at 15:00 the stalls are not open yet [1.85].
- [ ] Showcase days: `<now>` says families are visiting; Charles's family comes only if the player says so [1.85].
- [ ] Saturday after 19:00 the Journal names the most talented dorm by points [1.87].

## Act 8 — Month 9

### Q8.1 The Academy Bazaar (W2 Thu–Sat)
- [ ] Ask what the foreign traders sell: the narrator names the five nations' goods [1.13.1].
- [ ] In the Courtyards the Price Guide lists the Bazaar traders' stalls and the haggling rule; buying one thing, the narrator plays the
      haggling to the Fortune number and the Wallet is charged 80%, 90% or the full price to match [1.86].

### Q8.2 Founder Day (W3 Sat)
- [ ] At the feast the Headmaster and Vice Headmaster speak before the food [1.15.1].
- [ ] No class counts as skipped on Founder Day morning [1.86].
- [ ] From 09:30 `<now>` offers the hunt as optional; joining, the narrator writes a riddle that leads to the place `<now>` names; arriving
      there and speaking of the clue puts "Founder Day hunt Y1: clue 1" on the Mystery Board and `<now>` gives the next place; the
      Event tab counts the clues [1.86].

### Q8.3 Kingdom Competition week (W4), Charles not on the team
- [ ] Tuesday to Sunday the classes run as usual, Gavlan is away with the team, and nobody from the rival teams turns up on campus [1.32].
- [ ] Wednesday morning `<now>` says today is round one in the Kingsmeadow and names Halvard's team; that evening (and Thursday, Saturday)
  it brings the news of the round just over, and Activities → Competition shows the four teams, who went out and, on Saturday night,
  the national four. Nothing is told before it has happened [1.84].

### Side quest S8.3a Kingdom Competition with Charles on the team (any year Charles reaches the Kingdom tier) [1.84]
- [ ] Wednesday: the Kingsmeadow opens ("Avalon — Long Meadow" and the other places), `<now>` gives signs of a Kingsbloom, "Kingdom R1:
  found a Kingsbloom" makes the team carry one, and a rival team that comes for it shows as a "Now:" line before anything is decided.
- [ ] Sunset: the judges take one bloom a team; one team goes out; the news line names it.
- [ ] Thursday in the Undercroft: a room's beast is named in `<now>`; after "Room <n> beast down" and 15 minutes alone the room is
  Halvard's on the sigil board (Competition tab); another team inside stops the count; Competition.Rooms places the teammates.
- [ ] Saturday: the final against the right team; "Kingdom R3: won" pays 5,000 points, and the next Monday Charles is World, selected,
  if the panel picked them.

## Act 9 — Month 10 (winter)

### Q9.1 Winter arrives (W1 Mon)
- [ ] The Winter map; the Lined winter cloak and the Ember pouch in stock [1.14.3, 1.9.5].
- [ ] The Old Hut, the Swimming Pool and the Canteen: the snowed-in hut, the steaming pool, the winter menu; each Map card shows its Winter
      line [1.14].
- [ ] The Forest Clearing is still green and in flower [1.13.2].
- [ ] The first morning after snow: before 07:00 `<now>` says every path is deep and walks take half again as long; after 07:00
      Groundskeeping has the main paths clear and only the Hills, Forest and Lake stay slow until 15:00 [1.90].
- [ ] A flu day (some days in M10–M11, students off sick): the Notice Board's "Head colds are going round"; at the Medical Centre until
      19:00 a free Cold remedy ("Stalls here") that ends a head cold [1.90].

### Q9.2 Remembrance Day (W1 Tue)
- [ ] The day before, Baelin present: "Before Remembrance Day (grave): rereads the condolence letters…"; from M9 W4, Rei: "on edge" [1.72].
- [ ] On the day, Caspian, Etnie, Rei, Irene, Cedric or Layla present: Mood bad on a fine day too, each with their own tone and canon
      (the charm in Caspian's hand, Etnie asleep near Charles's door, no rose on Cedric's desk); Hadrian (Year 2+) oblivious [1.72].
- [ ] In the evening the Headmaster, the Vice Headmaster and Rei speak before the lanterns; Rei is short and plain, and in conversation
      afterwards as blunt as ever, not withdrawn [1.15.2].

### Q9.3 A cold morning (about −2 °C)
- [ ] Outdoors, someone soaks Charles with a water spell: the update has `/Exposure/-` with `"Kind":"soaked"`, the bracelet shows Soaked
      and Chilled at once, and the next reply shows both without being told, in its own words [1.9.4, 1.99.4].
- [ ] Again with a wool scarf and mittens: only Soaked at first, Chilled after a few more minutes outside. Indoors: Soaked only, and an
      hour indoors dries it [1.9.4].
- [ ] A swipe of the soaking reply gives the same conditions and the same mana [1.9.4].
- [ ] Hot spiced tea or mulled apple cider at the Mall: the Log or a toast reports the cleared condition, and the shivering stops [1.9.5].

### Q9.4 The Council election and the Harvest Festival (W3 Sat, W4 Fri–Sun)
- [ ] Saturday after 16:00 the Journal names the President-elect (Florian or Dante, counted by the engine) and `<now>` lists the incoming
      leaders; the narrator announces that result, not another [1.86].
- [ ] Harvest Friday from 17:00 in the Courtyards: the Harvest Festival stalls in the Price Guide and the Shop tab [1.86].

## Act 10 — Month 11

### Q10.0 Year's End and Results (W1 Fri–Sat)
- [ ] W1 Fri: the bracelet and `<now>` say "Year's End (no classes until Graduation)"; the period reads "Timetable suspended"; no class
      line in `<now>`, and the Planner shows no classes for the rest of the month [1.97.1].
- [ ] W1 Sat: Results & Final Ranking (09:00 assembly, 19:00 feast), no Study Hall or clubs; the dorm rank updates today [1.97.1].

### Q10.1 The Academy Trip: Sunreach Bay (W1 Sun to W2 Sat)
- [ ] W1 Sun: `<now>` says points do not work abroad tomorrow; change some into coin [1.41, 1.97.1].
- [ ] W2 Mon is a full day of flying; at 20:00 the location becomes "Sunreach Bay — Skydock", the Map opens on the Sunreach tab with the
      night map, and the bracelet weather says Sunreach Bay (warm south) [1.41, 1.32].
- [ ] Tuesday: the 09:00 briefing is in `<now>`. Walk to the Crossing, then take a carriage (`Sunreach.Ride` "carriage") and a water taxi
      ("boat"): half the time, and the coin. At 18:00 the map, the card and the place entry switch to their night face [1.41, 1.46].
- [ ] A bet at The Golden Tide: the update sets `Sunreach.Bet`, the narrator plays up to the throw, the next `<now>` says how it went, and
      the coin changes by the stake. At Velvet Lanes or the casino `<now>` only reminds that it is out of bounds [1.41].
- [ ] Over a day or two the narrator plays only the students `<now>` names (another academy's, or Halvard's), each in character, and the
      sights; on the Open Sea (the tour boat from the Sea Dock) the sea sights, perhaps once the Leviathan far off [1.41].
- [ ] Settings → Campus life → Ambient moments: on Rare a day here brings fewer street sights and people than on Often [1.43].
- [ ] The Academy Trip entry carries the city index, and a place's own entry joins when it is mentioned; after 22:00 the curfew line is
      the teachers' at The Hanabira [1.41].
- [ ] Friday 19:00 the farewell dinner; Saturday 08:00 boarding; back at Halvard the Sunreach lore and block are gone [1.41, 1.32, 1.97.1].

### Q10.1b The World Competition week (W3 Mon to W4 Mon)
- [ ] At Halvard (not in the national four): each day's Event line names that day's phase abroad; no classes all week; the Notebook
      calendar shows W3 Mon to W4 Mon as the World Competition and W4 Tue–Sat as Year's End [1.97.1].
- [ ] At Halvard: from 20:00 each evening `<now>` and the Competition tab carry the day's results from the Announcement Pillars (the draw
      Monday night); Sunday the Grand Final is shown live in Arbiter Hall; Monday's Academy Newspaper prints the champions [1.97.4].
- [ ] After the Kingdom Competition the Competition tab shows the national four and why the panel chose them ("How the four fight
      together"); if Charles is picked, `Competition.Team` names the other three [1.97.4].

### Q10.1c Hanakaze (only if Charles is in the national four, Year 1)
- [ ] W2 Sun: `<now>` reminds that points do not work abroad tomorrow (the World Competition in Hanakaze) [1.97.3].
- [ ] W3 Mon 07:00 aboard the Yozakuran liner (the airship tab); at 13:00 the location becomes "Hanakaze — Hanakaze Skyport", the Map
      opens on the Hanakaze tab (the snowy map with the Eternal Sakura), and the bracelet weather says Hanakaze (snowy winter) [1.97.3].
- [ ] Walk to the Thousand Lantern Inn and around the city: `<now>` lists the walks, the 19:00 opening banquet in the Hall of Victors,
      and the inn's hours (back by 22:00); the HANAKAZE INDEX entry is on, a place's own entry joins when it is mentioned [1.97.3].
- [ ] Try the Alpha's Residence: the guards turn Charles back and the location stays at the Hall of Victors; the Bamboo Sea and Old
      Castle Shiroyama open only on the day Eldrasil plays there, by team carriage from the inn [1.97.3, 1.97.4].
- [ ] Monday 19:00 the banquet draws the groups; on Eldrasil's Phase 1 day `<now>` gives Charles his teleport spot, the barrier and the
      report forms; a rival who finds him waits for the story; report `World P1: broke <name>'s crystal` and see the count drop [1.97.4].
- [ ] If Eldrasil goes through: the Siege lines (side, score, round), `World P2: won round <n>` moves the score; the Grand Final Sunday
      14:00; Placement and Status are set by the engine; as champions the replica appears in the Bag, Academy and Student rise a level,
      and 10,000 points arrive only on landing home [1.97.4].
- [ ] At the Challenge Crossing someone may challenge Charles to a contest; at the inn or around the city members of another nation's four
      cross his path, played from their team entry; the Warrens appear on the Map only after a visit [1.97.3].
- [ ] W4 Mon 12:00 the liner home; back at Halvard by 18:00 and the Hanakaze lore and block are gone [1.97.3].
- [ ] The phase lines (teleport, barrier, report forms, Siege, Grand Final) now reach the narrator in `<now>` (1.97.4 built them but
      `<now>` printed only the Kingdom's and Dorm's) [1.97.5].

### Side quest SQ-V Koschei's Needle (Year 1, else Year 2; only if Charles is in the national four) [1.97.5]
- [ ] The draw puts Norvaine in Eldrasil's group; on the Phase 1 day Charles lands a few steps from Vesna: she asks about school life
      instead of fighting, then "Vesna. Duty." through her collar pin, the somber face, and a promise to come back for him last.
- [ ] Through the week she comes looking for Charles (the inn, the banquets, a free day, Saturday); her bond climbs fast (People: the
      bar fills in a day or two) and deepens at the next meeting without the usual wait.
- [ ] At Rank 3 `<now>` gives her beat: she tells, cheerfully, of the front, the body bag, and the egg that keeps her soul; the next
      reply's Known_facts on her dossier holds it, and the beat stops.
- [ ] Each phase Eldrasil's four wins adds to her bar; if Eldrasil beats Norvaine in the Grand Final she sits on the sand and laughs,
      and her bar is full.
- [ ] Sunday evening (after the final), with her at Rank 4: `<now>` opens the confront with Colonel Kazimir Zorin (the player's choice:
      persuade, outwit, force through the Shrouds, the stun pistol, the Tishina cuff); "Koschei's Needle" in the Bag: Journal "Vesna
      deserted Norvaine", a toast, Campus_State.Transfers; the Needle's lore stays on while it is in the Bag.
- [ ] Skip the confront: at the boarding the Journal says she flew home with Norvaine; in Year 2's World Competition it opens again.
- [ ] After the transfer: Month 12 she is on the near-empty campus; the Year 2 Entrance Event sorts her into Charles's dorm (every
      colour on the Stone); she is in his school year and club, at the Gardens, the Menagerie, the Commissary, the Common Rooms and
      the Grassy Field; her dossier shows her Halvard life (Club, Haunts, Routine), not the Norvaine Role; she loses her first Dorm
      Competition bout; her Rank 10 makes any training with her go further.
- [ ] While the Needle is in the Bag, `<now>` has "Dove watch" with "Dove secrets: Koschei's Needle (in the Bag; known to Vesna)";
      a rumour about something brought back from Hanakaze appears once the meter reaches Rumoured [1.98.1].

### Q10.2 Graduation (W4 Sun)
- [ ] From 12:00 in the Courtyards the farewell winter market's stalls are open (a knitted dorm scarf, cocoa) [1.86].
- [ ] The afternoon in the Main Courtyard and Founder's Park (the Music Club on a small stage by the statue): stalls, the Farewell Pine with
      ribbons, snowmen only if it snowed; the Map shows the winter Graduation map; at dusk the airship moors above the Grassy Field
      [1.14.1, 1.14.2, 1.34.2, 1.14.3].
- [ ] At the feast the Headmaster and Vice Headmaster speak before the food [1.15.1].

## Act 11 — Year 2

### Q11.0 Personal dates (any day of Year 2)
- [ ] On the date of a Year 1 Imprint (an experience that changed someone), with them present: their Mood line says "A year today:
      <what happened> (warm/sore/bittersweet)" and that they remember; whether they say so fits them. The planner and the bracelet show
      nothing of it (owner: the narrator's and theirs only) [1.72].
- [ ] A Rank 5+ friend on the day Charles met them a year before: "A year since <name> met {{user}} (fond)" [1.72].

### Q11.1 The Entrance as a guide (Y2 M1 W1 Mon)
- [ ] 07:30–08:59: the roster first-years are new to Halvard: no dorm vest, and no first-hand dorm, teacher or classmate stories before
      their own sorting [1.9.2].
- [ ] 09:00: Baelin and Althair speak before the Stone sorting; each sorted first-year gets a vest from a Council member and sits with their
      dorm; Charles watches from the gallery without touching the Stone [1.9.2].
- [ ] 10:00: Charles guides two roster first-years, the same three through several places and a swipe [1.9.2].
- [ ] Linus, Maple, Nerys, Hadrian, Wren and Tsubaki show their portraits and thumbnails [1.9.6].
- [ ] Ask what year Charles is in and when the World Competition is: Year 2, Month 11 Week 3 Monday to Week 4 Monday [1.9.7, 1.97.1].
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

- [ ] A loud moment with someone who talks about themselves (a big quarrel, a rescue, a romance begins): two days later a friend of
      theirs has "Heard from <name>: …" in their Knows, and the narrator lets it show when they meet Charles; with Irene it stays
      with her [1.74].
- [ ] Once Charles is Rank 6+ with someone, a person who dislikes them or is their rival gets "Ties: knows {{user}} is close to …" in
      their Cast Sheet, and reacts in their own way (no forced Tension) [1.74].
- [ ] Charles hurt (moderate or worse): the first time a Rank 3+ friend who was not there meets him within 10 days, their Cast Sheet has
      "Has not seen {{user}} since the injury (…)"; once it heals the line is gone [1.74].
- [ ] Once someone has an Imprint (an experience that changed them), their Cast Sheet opens with "Changed by experience: their Imprints
      (below) are true now", and where the Imprint and their lore Personality differ they act on the Imprint [1.99.4].

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
- [ ] Found a club: say {{user}} wants to start one. Activities → Clubs shows the founding checklist; a canon teacher asked to sign turns it
      down (the Log says why) and the narrator brings in a new teacher; a student joins only in a scene; with five members and a room the
      club is founded (+8 Student, a Journal line), {{user}} is in it, a recruited student's dossier shows the new club, and on Saturday
      afternoon `<now>` has the club meeting in its room [1.75].

### MS4 A long Journal (some in-game months in)
- [ ] Once ten Journal lines have left the window, the update has `/Fold`, and the next `<current_state>` shows a dated `_Chronicle` entry
      that keeps the names and promises of those lines (Journal → The story so far) [1.63].
- [ ] A friend whose old Journal lines have left the window comes into a scene: their Cast Sheet shows "Earlier, from the record" with up
      to three of those lines, and the narrator's callbacks match them [1.64].
- [ ] At a place an old Journal line names, `<now>` shows "Earlier here, from the record", and the prose may nod to it without retelling it
      [1.64].
- [ ] Ask someone about a friend who is not here, or about a place, whose old lines have left the Journal ("Did Zara ever come back to
      the Boathouse?"): that same reply's `<now>` has "Earlier, from the record (named in the player's message: …)" with up to two dated
      lines, and the answer agrees with them. A Builder or Settings change right before a swipe brings no such line [1.80].

### MS5 After a session: the export and VectFox
- [ ] Send the chat export (and VectFox's EventBase export now and then): `audit_chat.py --mechanics --memory --vectfox` finds no ghost
      events unless messages were deleted or edited, every Year 1 date carries `Y1`, and the narrator did no engine work (no weather
      stamina, no Trust written) [1.61.1, 1.53.1]. The mechanics report's "Records not in the story" is empty, or lists only Clues and
      planted details the prose really never showed (if it lists several, tell me: MS3 stage 2 makes the engine flag them) [1.80].
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

### SQ-SC Summaryception instead of VectFox [1.99.1]
*Do:* in a copy of the chat (a branch), turn VectFox off and set up Summaryception 5.5.4 as `docs/ECOSYSTEM.md` → Summaryception says
(your SillyTavern has vadash's fork 24.29.0; these checks are for 5.5.4). Process the backlog, then play a few replies.
- [ ] The connection: OpenAI Compatible reaches your provider from the browser (no CORS error); Connection Profile fails, as the code
      suggests (one try is enough) [1.99.1].
- [ ] Snippet Browser after the first three batches: each line starts with `[Y1 M? W? Day HH:MM, place]`; no numbers, ranks, Mind,
      Knows or `<npc_thoughts>` content; names, not "you" [1.99.1].
- [ ] *Prompt*: the `<story_before_chat>` block sits among the older chat messages (depth 12); the narrator treats it as the past and
      never as the player's message, and the clock comes from `<current_state>` [1.99.1].
- [ ] Verbatim Turns set to 25, then open the chat: the card's Summaryception warning appears; back to 10 [1.99.1].
- [ ] Turn VectFox's master switch on with its collection still locked to this chat, then open the chat: the card warns once that
      both memories are on; reopening the chat in the same session shows it no more; with VectFox off again, no warning [1.99.7].
- [ ] Delete back past what it summarised (`/sc-status` shows the index): the card's warning appears; open another chat and come back:
      Summaryception's "Branch detected" toast trims its record [1.99.1].

### SQ-W The world beyond Halvard [1.97.2]
- [ ] Ask in History Class (or a teacher) about the demons and the Crack: the Gates and the demons' rule over Eldrasil are history,
      the Crack is a sealed Gate, the Demon Kingdom lies beyond Norvaine; the First Bargain and the Four stay legend [1.97.2].
- [ ] Ask Gavlan about the World Competition: he coaches the four abroad and picks for how they fight together, after Gareth's fire
      and Lucius's swarm ate each other before Year 1 [1.97.2].
- [ ] Name a World ace in talk (Hibiki, Lucrezia, Kamran, Cyprien): the narrator knows them by reputation, and none of them turns up
      at Halvard [1.97.2].

### SQ-D Dove watch (whenever Charles keeps something from the Doves) [1.98.1]
- [ ] Charles breaks a rule the Doves would act on and gets away with it (a forbidden place, a forbidden item, a lie to a Dove): the
      update adds it under /Hidden/Secrets with What, Proof and Known_by; Student file → Hidden lists it with its knowers [1.98.1].
- [ ] A rise to Rumoured: one rumour that names nobody joins the Gossip list; Watched: on some days `<now>` posts a Dove near one of
      Charles's places, and the narrator shows the white cloak without making it an event [1.98.1].
- [ ] Investigated: a "Dovecote interview" Commitment two days on at 16:00; at the Dovecote `<now>` gives the Fortune result and the
      narrator plays exactly that; the next reply's Log shows the change and the summons is gone. Missing it: +10, and Milena comes to
      find him the next day ("Signor") [1.98.1].
- [ ] With a physical secret (the Needle, or a Proof that names a Bag item): a room search on a later night, told when he is next in
      his dorm; found means the Doves come for it in the story, where Charles can answer it, and /Dove_found records what they took [1.98.1].
- [ ] A hidden or forbidden technique used with people around: one reminder in `<now>` asking the narrator to judge whether it was
      noticed; the number only moves if the update reports it [1.98.1].
- [ ] Settings → Features → Dove watch off: only the meter and its stage line remain [1.98.1].

### SQ-M Rumours, investigations and projects [1.98.2]
- [ ] A rumour about Charles reaches most of campus (about three days): a friend who was not there, met later, may ask about it or
      tease him, once; a rumour about a friend reaches that friend's friends (their dossier's Knows: "Heard from campus talk") [1.98.2].
- [ ] At a place where an open thread's clue was seen, `<now>` offers "Investigate here"; half an hour spent looking gives Knowledge
      (Nature outdoors) +1, and some days a lead Clue the narrator fills from the lore [1.98.2].
- [ ] A thread set solved: Knowledge +2, and a friend named on its clues who is there gets the moment in their dossier [1.98.2].
- [ ] A research Project finished: its subject's proficiency +2; a club Project: the club's Field +2 and a line in Monday's
      Academy Newspaper [1.98.2].

### SQ-H The Healing Ward and the Council petition [1.98.3]
- [ ] Charles hurt: a stay in the Medical Centre (30 minutes for a minor injury, an hour for a moderate one, two for a serious one)
      treats it once: the Body tab's Heals_by moves nearer or the minor injury is gone; the Journal says so [1.98.3].
- [ ] Charles on the Council (Year 2, or if he joins): on some Saturdays `<now>` brings a student with a petition to the 10:00
      meeting; take it up and the update has a help Interaction and student_notice_help; skip it and the Journal says another member
      took it up [1.98.3].

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
- [ ] In one-call mode (the default since 1.69): at the Mail Tower, with a Project open or in an exam week, the prompt's `<rule_cards>`
      shows that topic's rule before `<now>`, and with a friend present Interactions and the trust scale [1.69, 1.54, 1.55].

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

- [ ] People → Bonds → Order: Closest, Not seen lately ("seen N days ago", whoever is here last), Name, Dorm and Year (in groups) [1.74].

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
- 1.58, the A/B comparison: optional; since 1.69 the owner plays one-call (extra-model parsing was the default in 1.67–1.68).
- The "Year 1 / Year 2 smoke playtest" line: playing this route is that playtest.
- Before this log, 1.16.1–1.19 had checks but no line in the old "Open" list; they are in the route now.

## Adding checks (each release)

Put a new live check into the quest where the campaign first gives the chance to see it, tagged with the release; with no date, into a
Milestone or a Side quest. When the owner reports a session, tick what passed, note what failed under it, and move "Where you are".
Retire a check only when a release removes what it tests, with one line under Retired checks.
