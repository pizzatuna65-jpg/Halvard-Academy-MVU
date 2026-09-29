# SillyTavern test checklists

`npm test` covers the engine, schema, lore, UI and old-save loading headless. The checks below need a real SillyTavern session
(connected narrator API, the card's current lorebook, the edited preset). Newest release first; add each new release's checks as a
new section at the top of **By release**, not as a new file.

## Open

- The playtest follow-up releases v1.9.1–v1.9.5 have not yet been checked in a connected session (sections below).
- After them, the Year 1 / Year 2 smoke playtest from `planning/DRAFT_playtest_batches_2026-09-28.md` (cross-batch acceptance):
  sorting, first-year dialogue, speed travel, spell duelling, a winter water hit, mana recovery, Bag/shop links and swipe.
  Record narrator-only variability as observed examples.
- v1.16.0 (ambience): the four checks in its section below.
- v1.15.2 (Remembrance Day, Crowning Day): on Remembrance Day evening the Headmaster, Vice Headmaster and Rei speak before the lanterns (Rei short and plain, and in conversation afterwards as blunt as ever, not withdrawn); on Crowning Day the two speak at 07:00 before the airship.
- v1.15.1 (speeches, far grounds): the three checks in its section below.
- v1.15.0 (grades and exams): the five checks in its section below, first whether the narrator plays each exam to the expected mark in `<now>`.
- v1.14.1–1.14.2 (Graduation): on Graduation afternoon (M11 W4 Sun) walk through the Main Courtyard and Founder's Park (the Music Club on a small stage by the statue): stalls, the Farewell Pine with ribbons, snowmen only if it snowed; at dusk the airship moors above the Grassy Field.
- v1.14.0 (lore by season): in a winter month (M10–12) go to the Old Hut, the Swimming Pool and the Canteen; the narration shows the snowed-in hut, the steaming pool and the winter menu, and the Map card of each shows its Winter line. In an exam week the Main Library has Firetooth tins on the tables; the week after it does not.
- v1.13.2 (visual lore): on Crowning Day night ask what hangs from the castle towers (deep blue and gold banners, the airship above the Grassy Field); in winter visit the Forest Clearing (still green and in flower).
- v1.13.1 (Bazaar): at the Academy Bazaar (M9 W2 Thu–Sat) ask what the foreign traders sell; the answer names the five nations' goods.
- v1.14.4 (Crowning night): on Crowning Day after 18:00 the Map shows the fireworks over the lake and the airship beyond the Gymnasium; ask where the fireworks are and where the airship waits, and the narration matches.
- v1.14.3 (maps live): the Map panel shows the Spring map in M1–3, the default in M4–6, Autumn in M7–9, Winter in M10–12, and each event's map in its hours (Star Night, Graduation afternoon, The Thinning week); location card headers follow.
- v1.13.0 (map by calendar): the two checks in its section below.
- v1.12.0 (missed reports): the six checks in its section below, first the player's message on a swipe.
- v1.11.3 (VectFox settings): the six steps in its section below.
- v1.11.2 (preset audit): the four checks in its section below.
- v1.11.1 (bug hunt fixes): the five checks in its section below, first the swipe-after-a-tool-edit check.
- v1.11.0 (token audit): Prompt Itemization shows `<current_state>` as YAML without empty fields; the narrator still writes Mind,
  Knows, Next and other fields that were empty when needed. On Entrance day the Entrance rules appear; on other days they are gone.
  The preset's adult toggles are off after importing it.
- v1.10.2 (Batch 3): when a friend seeks {{user}} out, `<now>` gives a concrete reason; over several contacts the reasons vary and
  suit the character (a shy one leaves a note, a confrontational one wants a challenge).
- v1.10.1 (Batch 2): study in the Main Library in the evenings before a Midterm; in exam week `<now>` states the preparation and the
  narrator's results should fit it. On a Results day the assembly announces the new dorm rank; the next payout follows it.
- v1.10.0 (Batch 1): on an ordinary class day, spend an hour of a lesson in the Canteen: the next reply has the teacher react,
  and Student file shows Academy −2. Attend a full week: at the next Monday the Journal has a recap with "a clean week".
  On an ordinary evening with five people around {{user}}, one takes their leave naturally in the next reply.
- v1.9.8 (Fortune roll): try something risky and uncertain that matters (sneak past a patrol after curfew; talk a suspicious Dove
  out of a search). The narrator should resolve it with the Fortune number in `<now>` without naming it. Swipe: the outcome stays
  the same, only the wording changes. Try the same sneak with an invisibility technique active: it should succeed far more easily.
  Ordinary actions (walking to class, a light spell) must never be rolled.
- v1.9.7 (lorebook audit): in a Year 2 chat, ask the narrator what year {{user}} is in and when the World Competition is; expect
  the current year and Month 11 Week 4. With Weather Off, a Month 1 scene should read as spring, not winter.
- v1.9.6 (Year 2 cohort portraits): open People and a Year 2 chat; Linus, Maple, Nerys, Hadrian, Wren and Tsubaki show their
  portraits and thumbnails.

## By release

### v1.17.0 — audit Batch 2

1. In a chat over 30 messages, Prompt Inspector shows one "[… N earlier messages …]" line instead of many "[…]".
2. Say "I buy a tea" at a Mall café: the Price Guide lists that place's stock; at the dorm it lists only canon prices and shops.
3. Compare cached input tokens (provider usage) between the real card and `dist/test/Eldrasil_TEST_LoreDepth.png` over ~10 replies.

### v1.16.1 — audit Batch 1

1. Join a club with a short name in the story ("I join the soccer team"): Student file shows the club as "Soccer Club", and the next
   Saturday afternoon there adds Student reputation.
2. Say {{user}} drinks a hot spiced tea that is not in the Bag and was not bought: `_Log` says there is none, nothing changes. Buy
   one at a café and drink it in the same reply: the effect applies.
3. An OOC question to the narrator: the answer has no `<UpdateVariable>` block and the clock does not move.
4. `<current_state>` in the prompt (Prompt Inspector) shows only this update's `_Log` lines.
5. (Only if an engine error ever appears) the bracelet toasts "Engine error" and the state is unchanged; swiping works.

### v1.16.0 — ambience and ghost stories

1. Walk through a class day (Canteen at lunch, the Library during a lesson, the Sports Field after classes, the Common Room in
   the evening): each arrival shows an Ambience line in `<now>`, and the narration matches its crowd and light and writes its own
   detail for the cue, not the cue's words.
2. Over a few days in the same places the details differ; a "Nearby" moment is one clause and a "Brushes {{user}}" moment is small
   and needs no reaction.
3. Stay out after dark near the lake (or another story's place) for a while: when an Uncanny line appears, the narrator plays the
   ghost story's moment without naming or explaining it, and a companion reacts in character. Nothing shows in the UI or Journal.
4. Ask Tilly about one of the new stories (the Night Swimmer, the Polite Walker): she knows it and has a theory.

### v1.15.1 — speeches and the far grounds

1. At a feast (Entrance Feast, Warding Rite, Results day, Founder Day or Graduation) the Headmaster and Vice Headmaster speak before
   the food is served; a formal event's morning ceremony opens with them too.
2. Walk from the boathouse to the Fishing House: about three minutes along the shore, not next door. From the Gardens to the
   boathouse: about twenty minutes.
3. Go from the Hills into the Forest and on to the Forest Clearing: the narration takes the time (a quarter of an hour, then half an
   hour on the deer path), and the Map panel gives the far grounds 20+ minutes from the Main Courtyard.

### v1.15.0 — grades and exams

1. Play a Midterm week (M3 W1). Each morning `<now>` lists today's exams with an expected mark and its reasons; the narrator plays
   the exam to that mark without naming it. Arrive Tired at one exam: its expected mark drops one step.
2. In one exam, do something decisive (hold out long against the Dark Magic Defense teacher, or get caught with a charm): the
   narrator inserts one `/Exam_events` entry (a step, or `Fail` only for cheating). It must not write `Player.Academics` itself.
3. On the Friday of exam week: the marks are posted (toast, Journal, Student file → Studies) and the narrator lets teachers and
   classmates react in character. With an F, a "Remedial <subject>" Commitment appears for next Saturday 10:00; attend it and the
   narrator removes it: the Studies line shows "D (make-up)".
4. With an A in a subject: tutor a classmate in it. The narrator inserts `/Tutoring` (no Points or Rep_events of its own) and
   Points rise by 40; a third session in the same week is not paid. A risky attempt in that subject's field shows
   "top mark in ..." among the Fortune modifiers.
5. On Results day (M5 W2 Fri) the finals are announced stage by stage before the dorm rank; the rank matches the log line's marks.

### v1.13.0 — map by calendar

1. Set the chat to M1 W3 Sat 20:00 (or play to Star Night): the Map panel and every location card header show the magical-lit map;
   the pins sit on their buildings. At Sunday 06:00 or later the default map is back.
2. Before the upload (or with a wrong `base_url`), the same evening shows the default map, not a broken image.

### v1.12.0 — missed reports and sustained magic

Play a few ordinary turns with the edited preset (Report reminders ON, the default):
1. **The player's message on a swipe.** Write "I cast <one of your techniques>" but leave it out of the narrator's update on purpose
   (or find a reply that forgot it). The next prompt's `<now>` (Prompt Itemization) lists "<technique> appears in the last exchange
   but was not charged". Swipe that reply: the reminder is still built from your message, not from an older one. Then make a
   Builder or Settings edit and continue: the reminders stay and do not quote the hidden player-tool entry.
2. **Following reminders.** When `<now>` shows a reminder, the next update reports it only if it happened (a talk, a gift, an
   injury name) and ignores it otherwise; the narrator does not start inventing interactions to satisfy it. Note any reminder
   that is plainly wrong (a false arrival, a time phrase that was a memory) with its text.
3. **A skipped night.** At 22:30 in the dorm, ask to skip to the morning. If the narrator writes no Resting, `_Log` says
   "{{user}} slept through the night" and stamina is restored; ask for an all-nighter instead and it should write Resting `awake`.
4. **Summon in step.** Summon a pact partner; if the narrator only sets Summoned (or only adds the Active entry), the engine adds
   the other half and charges the activation (`_Log`). Dismiss it: both halves go.
5. **A sustained effect left on.** Start an aura or shield and keep playing for a few hours of story time: `<now>` reminds that it
   is still running and costs mana every minute.
6. **Report reminders off** (Student file → Settings → Features): no "Possibly missed" block in `<now>`.

### v1.11.3 — VectFox settings

In the VectFox panel (Text Cleaning, Custom), then keep playing the same chat:

1. Untick the built-in **Strip <UpdateVariable> Tags (MVU)**.
2. Delete the custom patterns "Rapikan baris kosong" (it glues paragraphs) and "Cadangan: hapus semua tag HTML" (it runs before
   the Eldrasil patterns and removes the block they read). The Eldrasil patterns already remove the tags that matter.
3. Import `docs/vectfox_cleaning_patterns.json`. Five patterns land at the end of the list.
4. Optional: EventBase retrieval top-k 30 → about 15; debug logging off; Ghosting off (it does nothing without Summarizer
   Injection); check whether agentic retrieval is worth its extra call per turn.
5. After a few replies, a new EventBase event shows a scene time from the stored line `[In-world time: … , at …]` (in Year 2
   with "Y2"), and stored text has normal paragraph breaks.
6. The chat "Halvard Academy - 2026-09-16" is mapped to the same memory collection as the current chat: do not open it with
   VectFox on, or unlink it.

### v1.11.2 — preset audit

Import the rebuilt preset `presets/Realistic_Frankenstein_2_2_Eldrasil.json` and keep playing the same chat.

1. In a Year 2 chat, the reasoning's first line reads "Now: Y2 M? W? Day HH:MM at <place>", and VectFox EventBase still picks up
   the date (a new event is dated in Year 2, not mixed with Year 1).
2. The reasoning has tasks 0-10 and no "User rolls / NPC rolls" line.
3. With Realism Mode and Freaky Mode OFF, an ordinary scene has no adult vocabulary; with Realism Mode ON, intimate scenes are
   written as before.
4. A quiet turn stays quiet (no sudden ambush or twist the story did not set up), and an important attempt follows the card's
   Fortune roll bands.

### v1.11.1 — bug hunt fixes

Use the v1.11.1 card and its lorebook in the chat you are already playing (no restart). The engine fixes are covered by
`tests/test_bughunt_v1111.cjs`; these need SillyTavern.

1. Swipe after a tool edit: get a narrator reply, swipe it once or twice, then change any Settings row. Swipe back to an
   **older** existing swipe of that reply. Does it still show the Settings change (and, after a first registration, the
   student file)? MVU keeps variables per swipe and only the current swipe is updated, so an older swipe may lack the edit;
   note what happens.
2. Fortune: note the Fortune number in `<now>` (Prompt Itemization), change a setting, swipe the last reply: the number is
   the same.
3. Time jump: if the narrator ever moves the date by more than three days, a "Time jumped N days" toast appears; at a month's
   end (Week 4 Sunday → Monday) the date lands on Week 1 even when the narrator forgot to reset the Week.
4. During a class, when the narrator writes a place such as "Classroom" or "Seminar Room 4", no skipped-class toast or
   Academy −2 follows.
5. Updating the lorebook from the card: the popup no longer tells you to start a new chat, and the running chat plays on.

### v1.9.5 — seasonal shops and the Mall

Use the v1.9.5 card and its matching lorebook and edited preset in a connected SillyTavern chat with Weather effects on **Full**. The local engine, UI, save and shop tests already pass.

1. At The Mall in Month 1–3, open Activities → Shop. Seasonal rows (Blossom honey cake, Rain-ward charm, Quick-dry powder, Elderflower cold syrup, Hot spiced tea) are buyable and show a green effect line; Ember pouch, Straw sun hat and Lined winter cloak are greyed "out of season". Repeat in Month 4–6 and Month 10–11 to see the Summer and Winter stock.
2. Buy a Rain-ward charm, then use it before walking out into rain. The narrator's patch should insert `"Rain-ward charm"` into `/Consumables/-` and lower its Bag Qty. Half an hour outdoors in the rain should not make {{user}} Soaked.
3. On a Month 10–11 morning, get Soaked and Chilled outdoors, then drink Hot spiced tea or Mulled apple cider at The Mall. The _Log/toast reports the cleared condition, and the narration drops the shivering.
4. Open the Bag with a charm, syrup or Fleece-lined boots in it. Each item shows what it does.
5. Map → The Mall: its card lists all ten shops under Connected to; each shop's card (Quillfeather's, Tailor's Row, Tinker's Bench…) shows Connected to: The Mall and about a one-minute walk from it.
6. Resume a v1.9.4 chat: nothing is lost, and seasonal items are no longer all greyed out.

If a check fails, keep the chat export with the preceding state, user message, reply and resulting `<UpdateVariable>` patch.

### v1.9.4 — seasons, soaking and mana

Use the v1.9.4 card and its matching lorebook and edited preset in a connected SillyTavern chat with Weather effects on **Full**. These checks exercise the narrator and the bracelet; the local engine, save and weather tests already pass.

1. Continue a Month 1 save. The bracelet's date line reads `Month 1, Week n · Spring · <temp> °C`; the weather chip shows the sky (for example `cloudy`) and its tooltip the full weather line. Morning temperatures should be cool spring values, not −2 °C. Jump or play into Month 4, 7 and 10: the season changes to Summer, Autumn and Winter on the first day of each.
2. On a Month 10–11 morning around −2 °C, outdoors (Sports Field, Courtyards), let an NPC hit {{user}} with a water spell that soaks through. The narrator's patch should include `/Exposure/-` with `"Kind":"soaked"`. After the reply the bracelet shows **Soaked** and **Chilled** at once, and the next reply shows wet clothes and shivering without the player mentioning it.
3. Repeat the hit while carrying a wool scarf and mittens: only Soaked at first, Chilled after a few more minutes outdoors. Repeat indoors: Soaked only; an hour indoors dries it.
4. Note {{user}}'s mana, spend some on a technique, then let about an hour pass without resting: mana rises by about one sixth of the maximum. From an empty pool, six in-world hours (awake or asleep) bring it back to exactly the maximum and no higher. The narrator should not add mana for rest or sleep.
5. Swipe a reply that contained the water hit or a long wait. The regenerated swipe from the same prior state should show the same conditions and the same mana.
6. Resume a v1.9.3 chat. Nothing is lost; the only visible change is the new season table and weather.

If a check fails, keep the chat export with the preceding state, user message, reply and resulting `<UpdateVariable>` patch.

### v1.9.3 — time and magic

Use the v1.9.3 card and its matching lorebook and edited preset in a connected SillyTavern chat. These checks exercise the narrator; the local engine and save tests already pass.

1. At an ordinary campus location, exchange a quick greeting. The clock may stay in the same minute or move about one minute. Continue a real ten-minute discussion; the clock should then move by about ten minutes, with no automatic five-to-fifteen-minute jump per short reply.
2. At Boathouse and Lake around 08:43, describe using a registered high-speed movement technique to reach the Arbiter Hall in under a minute. The narrator should show the real route/effect, record the cast and its mana cost once, and arrive near 08:43–08:44. It should not call the player late solely because the map's walking route takes longer.
3. Cast a safe everyday spell in a courtyard or use a safe movement spell near a Dove patrol. The patrol may react naturally, but no arrest or offence follows from the casting alone. Test a genuinely restricted act separately if desired; it should still draw a response.
4. Ask about or visit the **Magic Duelling Club**. Club bouts should be spell duels in warded rings. Gavlan, Sophia and Tsubaki may have personal weapons or training habits, but the club should not become a padded-staff or sword-fighting club. Combat Class should be described as practical spellcasting.
5. Resume a v1.9.2 save whose profile Club is `Duelling Club`. Activities and People should still identify the membership, and after the next state update the profile should say `Magic Duelling Club` without a new join/leave Journal entry.

If a narration check fails, keep the chat export with the preceding state, user message, reply and resulting `<UpdateVariable>` patch. That distinguishes a prompt failure from an engine or stale-lorebook issue.

### v1.9.2 — entrance ceremony and tour groups (Batch 2)

Use a connected narrator API. Test Year 1 with the main card and Year 2 with `dist/test/Eldrasil_TEST_Year2.png`, each in a fresh test chat with its current lorebook. Read `Campus_State.Entrance_tour` in the state if the prose differs from the assignment.

1. At 07:30–08:59, meet a roster first-year. They should be new to Halvard: no dorm vest or first-hand common-room, teacher-habit or classmate stories before their own sorting. Their eventual dorm in the roster is for narrator continuity. A documented older acquaintance may share only what they already knew.
2. At 09:00 in the Arbiter Hall, Baelin and Althair speak before the Stone sorting. Each sorted first-year receives a vest from a Student Council member and sits with their dorm. After the player is sorted in Year 1, they remain there until sorting ends at 10:00; the narration should not offer a free interval outside the hall.
3. At 10:00, meet the assigned group inside the hall. Year 1: the player, one roster first-year and one roster senior guide. Year 2: the player guides two roster first-years and watches sorting from the gallery without touching the Stone again. Follow the same named trio through several tour locations and a swipe/replay; it should not change.
4. In late afternoon, visit rooms when appropriate. At 19:00 the Entrance Feast begins without repeating the morning's Headmaster/Vice Headmaster speeches.

If a required roster student is genuinely absent, record that in `Campus_State.NPC_status` before assignment; only an unfilled place may use a narrator-created student. Record any prose drift with the exact message and state.

### v1.9.1 — swipe and navigation (Batch 1)

Use a connected narrator API and the v1.9.1 card in a new test chat, or update the card/lorebook in a copy of an existing chat. Enable SillyTavern's **Swipes** user setting.

1. Register a student. The main bracelet should show **Student file** and, once inventory is available, **Bag**. It should no longer show **Builder**. **Student file** should show **Edit student file** in the top-right corner; the button should reopen the editor. **Bag** should open Student file on its Bag tab.
2. Generate a narrator reply. Check that the swipe arrow appears on that last reply. Swipe once and confirm that the new prose and bracelet state replace the rejected reply's state.
3. From a narrator reply, amend the Student file or change one Settings option. The same narrator reply should remain last and show a swipe arrow. Swipe it: the edit should survive, while any rejected narration changes should not. Continue one turn and check the state again.
4. Delete the swiped reply and replay the turn. Check the edit and story state once more.

If the arrow is absent immediately after an ordinary reply *before* opening any card tool, capture the chat's last-message role/hidden status and inspect SillyTavern's Swipes setting, generation preset and browser console. The batch's code fix addresses the confirmed hidden-tool-message case; an ordinary-reply failure needs its own reproduction.

### v1.8.0 — moods, gifts, birthdays, weather effects

Automated engine, schema, lore and UI tests pass. Browser previews use a mock host; these checks require a real SillyTavern session.

- Import the updated PNG and update its linked lorebook. Open an existing 1.7.8 chat: previous bonds, inventory and Builder choices should remain.
- Give a known gift and an unfamiliar item. Check the reaction and discovered tier in the dossier, then swipe/reload and confirm the log follows the saved message.
- At an NPC birthday, check the calendar knowledge gate, first-gift bonus and remembered-birthday Trust. Try the player birthday with qualifying friends and play the party; XP should require actual attendance.
- Compare weather Full / Flavor / Off, Rank 4 mood icons, overnight waking/sleeping and The Vigil recovery. Check training while tired, exhausted and injured.
- Set a custom magic subtype's wind behavior in the Builder. Confirm outdoor casts and sustained effects use it, and a wind-blocking barrier shelters them.
- Open each Mall shop from the shared map pin and its location. Buy/Give should draft the intended action, then update the Bag only through the narrated turn.
- Check the narrator follows Cast Sheet tastes and mood cues without revealing locked dates, preferences or secrets. Check the bracelet at narrow mobile width.

### v1.6.11 — the edited preset and VectFox

Automated (all passing at 1.6.9): `npm test` = 39 suites + static QA, 1159 checks (every save from 1.4.6 to 1.6.8 loads);
`npm run stress` plus the fuzz on seeds 2-9 (48,000 random updates, no problems); `tests/preview/smoke_all_panels.py` 550 views,
no errors; token audit ~12.3k start / ~17.2k heavy mid-game; the preset built twice, byte-identical. Checked in upstream source:
SillyTavern puts depth-0 prompts of the system role after the user-role ones (`openai.js` `populationInjectionPrompts`), so the
card's cast gate (510) and `<update_format>` (503) are still the last thing the model reads after the preset's Player Input
Authority and BOLT; `{{lastUserMessage}}` skips hidden messages, so a Builder or Settings note is never taken for the player's input.

Everything below can only be checked inside SillyTavern. Most important first.

#### Setup (once)
- [ ] Import `dist/Eldrasil_Halvard.png`. The card offers to install (or update) its lorebook: accept. The bracelet shows no
      "old lorebook" warning, and the MVU panel shows the card config as overriding.
- [ ] Import `presets/Realistic_Frankenstein_2_2_Eldrasil.json` and select it. Leave its toggles as shipped: BOLT ON (MAX and
      Micro CoT OFF), Player Input Authority ON, "⏰ Time and Place" OFF, every Internal States toggle OFF (Relationships RPG,
      GM's Notebook, Internal Agenda, Chekhov's Gun, World Sim, Fate & Routine, Internal Thoughts, DnD Simulator, Inventory).
- [ ] VectFox (`docs/ECOSYSTEM.md`, VectFox section): Text Cleaning in Custom mode, "Strip <UpdateVariable> Tags (MVU)" unticked, the five
      patterns of `docs/vectfox_cleaning_patterns.json` added in that order; Semantic World Info OFF for the card's lorebook;
      Summarizer Injection OFF; EventBase ON; injection position "After Main Prompt" (or In-Chat at depth 2 or more); Ghosting OFF
      while the card's trim regex is on.

#### Preset + card
- [ ] Open the prompt of a reply (Prompt Itemization or the prompt inspector). At the bottom: your message, then the preset's
      `<input_authority>` and BOLT, then one system block that ends with the cast gate (only when someone is present) and
      `<update_format>`. No `<%` anywhere (EJS rendered).
- [ ] The reasoning opens with `Now: M? W? Day HH:MM at <place>` and runs through BOLT task 11 (three options, one a HOLD);
      the reply ends with a complete `</UpdateVariable>` and the bracelet sits above the narration.
- [ ] Coloured dialogue (Colored Dialogue 2.0) shows in colour, and the update block is folded. With two people talking in the
      same reply, the next reply's prompt gives full sheets to those who spoke (the colour tags do not hide the speakers).
- [ ] With four or more people present: the `<cast>` block has at most four full sheets, the rest brief; their keyword entries
      print nothing; the request goes out without a noticeable delay (the Cast Sheet is the largest EJS entry). Note the prompt
      size: about 9k tokens for the Cast Sheet with four full and four brief sheets.
- [ ] Save something in Student file → Settings, then write a story message: the reply answers your story message (the hidden
      Settings note is not read as your input).

#### VectFox + card
- [ ] After a few replies, open VectFox's stored events: each is the prose without colour tags or graphics, plus one line
      `[In-world time: M? W? Day HH:MM, at <place>]`. No `<UpdateVariable>`, no `<StatusPlaceHolderImpl/>`, and nothing from
      the Cast Sheet (Mind, Knows, Next).
- [ ] Swipe the latest reply twice: no duplicate events for it. Builder and Settings notes never appear as events.
- [ ] Recall an old scene ("remember the library flood?"): the narrator uses the memory but keeps the current wallet, clock and
      each character's Cast Sheet over what the memory says.

#### Card 1.6.9 fixes (use `dist/test/Eldrasil_TEST_Rank7.png`, every bond at Rank 7)
- [ ] Irene with Trust 47-49 (lower it in the story): the bond event's direction says it can only become a sworn rivalry;
      after the event the Cast Sheet shows "Sworn rival of {{user}}: …" (before 1.6.9 it recorded a best friendship here).
- [ ] Gavlan or Krieg present: their sheet says "Not a romance: … does not become {{user}}'s romance". Flirt with them: they
      answer in character, and the Romance flag stays off.
- [ ] Settings → romance from Rank 10: Ruby's dossier says "romance (from Rank 10 in Settings)".

#### Continuing a chat across versions
- [ ] Open a chat started on 1.6.8 after importing 1.6.9: the card asks to update its lorebook; after that the next reply keeps
      every bond, rank, Trust, perk and Journal line (check Student file and People).

#### Card 1.6.10: Connections direction
- [ ] People → Connections with Kuroo, Etnie and Mimosa met: arrows from Kuroo to Etnie and from Kuroo to Mimosa (protective,
      one way); Gavlan and Gareth: one arrow from Gavlan. Click a line: each "X's side" note describes X's own view or doing.

#### Card 1.6.11: first meetings
- [ ] Meet someone new (Trixie in the Courtyards): their dossier shows Trust at their start (Trixie 60, Neutral), never Betrayed.
- [ ] People → Connections, Groups: Club on: someone you met at Rank 0 is not in a club yet; at Rank 1 they join their club's label.
