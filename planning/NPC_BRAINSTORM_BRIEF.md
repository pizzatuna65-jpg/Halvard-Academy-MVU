# NPC brainstorm brief — Eldrasil: Halvard Academy (SillyTavern card)

## 0. How to use this (for the assistant)

You are helping the card's author design **NPC information** (missing lore fields, sharper personalities, loves/hates, goals,
haunts) and **bond events** (one per rank-up per NPC). You do not need the rest of the project: this brief holds the world
basics, the bond system, the formats, the NPC roster and the known gaps. The **full lore of an NPC group** is in a separate
file (`lore_<group>.md`, list in §8); if you need an NPC's full entry and it is not attached, ask for that group's file
instead of guessing.

Rules:
- The author's lore is canon. Do not contradict it; extend it. Keep everything the card uses in **English**; discuss with the
  author in **Indonesian** unless they write otherwise.
- `<narrator_only>` text is secret: characters never state it, and no rank reveals it (only the story does). Events at Rank 9→10
  may open a way toward a secret, never announce it.
- `{{user}}` is the player's first-year student (name, pronouns and magic are the player's). Never decide {{user}}'s feelings or
  actions in directions; offer choices.
- Be concise; prefer drafts the author can paste. Output formats:
  - **New or fixed lore fields:** `Label: text` lines to add to that NPC's lorebook entry (labels as in the roster: Personality,
    Loves, Hates, Goals, Haunts, Backstory, Relations, Speech, Emotional tells…). Secrets inside `<narrator_only>…</narrator_only>`.
  - **Bond events:** the exact format in §5, one entry per NPC per rank.

## 1. World in brief (canon excerpts)

```
[Kingdom: Eldrasil]
Genre: Fantasy magic academy
Premise: Four magic academies in one kingdom, each tied to a cardinal region and each built on top of a great magical site.
Location: the east of the continent.
Other nations: exist; Sunreach Bay, Velmora, the Arslan Sultanate, Norvaine, Caelmar and Yozakura are named.
- Independence Crowning Day implies Eldrasil won independence from another power long ago in the past
- Eldrasil has never won the World Competition in living memory.
- Eldrasil claims the Archmage of the Four Who Saved the World as its own hero.

[Academy Origins]
Magic academies are a normal institution found throughout the world, not something unique to Eldrasil. When the four dangerous sites were sealed, the kingdom built an academy around each so the seals could feed on the residual mana of daily casting.

The decision was practical but controversial. Supporters argued that the academies provided both education and a reliable source of mana for the seals without draining anyone's personal mana. Critics argued that placing hundreds of students directly above dangerous sealed sites was reckless: if a seal ever failed, the academy's students would be among the first people at risk.

This is standard historical knowledge and may be taught in History Class.
```

```
[Halvard Academy]
Region: West. Site: The Crack, a crack in reality leading to the demon world. Site name unknown.
Headmaster: an Elf, head of Halvard for forty years.
Local fear: the Crack itself and whatever might come through it. Rumours about it are the academy's favourite ghost stories (1.16.0: seventeen campus ghost stories in all: the Third Stall, the Long Corridor, the Three O'Clock Knock, the Crying on the Water, the Night Student, Sleeping in the Library, Taken, and the new Thirteenth Stroke, Night Swimmer, Walking Lantern, Breath on the Glass, When the Pens Go Quiet, Faraway Laugh, Polite Walker, Last Bed, Other Climber and Applause), and anything unusual (a strange mark, odd eyes, horns) invites whispers.
The breach: two years ago, during The Thinning, something came through for a single night and killed several students before Halvard's Warden resealed the Crack, dying in the act. The Warden's apprentice inherited the seal that night and the crown has only ever confirmed them as Acting Warden. What it was has never been described publicly and survivors disagree about what they saw. Current third-years lived through it as first-years. Afterwards the Headmaster hired a veteran monster hunter to teach Creature Studies. The dead are honoured on Remembrance Day (M10W1), and the Doves interrogated survivors afterwards, which many students have never forgiven.
```

```
[Dorms]
Structure: Four dorms per academy, sorted by magic type, each in its own building that admits only its own students. Students stay in that dorm for all three years. Within each dorm, students climb a ranked ladder, recalculated twice a year from exams, competition results, and achievements; a student's current rank sets their monthly point payout.
Buildings: four identical grey-stone buildings around the Main Courtyard, told apart by roof colour and one feature each; doors open only to residents' bracelets. Each dorm's Dorm Head lives in the building with its students.
Types:
- Elemental: The four elements — fire, water, wind, earth — and advanced elements such as ice, lightning, metal, etc.
- Mystic: Magic that changes the material world: creating objects, telekinesis, divination. Includes astral magic.
- Spiritual: Magic drawing on the mage's force of will: enhancing the mage, healing.
- Occult: Illusions, charms, and binding spirits.
```

```
[Clubs]
Count: around thirty, uncapped. Founding: a teaching staff signature and five members. One teacher is responsible for one club.
Sport and duelling clubs also practise informally after 16:00 on other days. Outside sport clubs, clubs use magic freely as their activity requires.
Cross-dorm: clubs are the one place the four magic types mix freely, because recruitment happens before dorm loyalty settles.
Members not named elsewhere are unnamed students.
Sport clubs ban magic outright during play, which is why they feed directly into Sports Day.
Note: the Duelling Club is full magical duelling in a warded ring, never swordplay or fistfights.
```

```
[Spirit Tiers]
Spirits are ranked in four tiers. The highest tier a mage can bond, bind, or pact with marks their standing as a spirit user.
1. Lesser spirits — common. Small, simple spirits, including the animal-shaped spirits most familiars are. Almost any Occult student can bond one.
2. Basic spirits — the working spirits of a regular spirit user. Strong enough for real work: guarding a place, fighting alongside their mage, carrying messages.
3. Greater spirits — rare. Old, powerful, and willful. Only experienced spirit users can bind or pact with one, and a failed attempt is dangerous.
4. Spirit Lords — extremely rare. Vast, ancient spirits bound to an entire domain of the world. Only top-tier spirit users hold a pact with one, and most people go their whole lives without meeting such a person.
Law: A Spirit Lord is still a spirit, so a pact with one is a lawful Spirit Pact, not forbidden Pacting. Every pact-holder has heard the Devoured Kingdom: Azathoth, Lord of All, took a whole kingdom as its price.
Note: Spirit Pact is the one subtype commonly held by many mages at once, because what decides a pact-holder's power is not the subtype but the spirit bound to them. Two pact-holders can be nothing alike.
```

```
[Spirit Pact]
A negotiated contract: both sides must agree, a spirit cannot be forced, and the terms can be anything the two settle on. Two uses:
Channelling (Greater and Spirit Lord only): the spirit's ability used without summoning it. Costs mana per use and comes through far weaker than the spirit's own.
Summoning (any tier): the spirit drains mana the whole time it is present, more the stronger it is, and more again for every ability it uses. Killed in combat, it takes an hour to a week to call back depending on the mage.
```

```
[Combat Roles]
Five roles used in Practical Magic (one class per role), exams and team competitions. A student may fill more than one, and then attends the class of the role they want most.
- Attack: deals the damage and finishes fights.
- Defense: shields, blocks and holds the line for the team.
- Healing: keeps allies standing mid-fight.
- Support: strengthens allies and weakens enemies.
- Control: restrains, disrupts and shapes the battlefield.
```

```
[Competitions]
Four tiers, elimination. Losing at any tier ends your competitive year. The one exception is World selection, which is chosen rather than won.
1. Dorm. Solo, open to the whole dorm, run as a ranking tournament so every entrant finishes with a placement. Top 16 per dorm qualify.
2. Academy. Qualifiers from all four dorms form teams of 4 in the weeks before, with at least one student from each year level, covering the combat roles (attack, defense, healing, support, control) between them. Teams mix dorms and usually must, since no dorm covers every role well. Knockout bracket; the winning team represents the academy.
3. Kingdom. One team per academy, four in total, knockout. Each member of the winning team earns 5,000 points.
4. World (abroad). A panel builds the national 4 from the best individuals for the combat roles across all Kingdom participants, winners and losers alike, with no year-level requirement. Being picked off a losing team is a great honour. Eldrasil has never won in living memory.
```

Forbidden arts (lore 32): The twenty forbidden arts (not all, but the famous one), by type. Elemental: Blightfire, Salting, Poison magic, Rot magic, Weather change magic. Mystic: Unmaking, Puppetry, Wringing, Soul magic, Raise dead. Spiritual: Burning magic, Drawing magic, Mind control, Slavery magic, Effigy. Occult: Demon summoning, Forbidden charm, Pacting, Wearing magic, Blood magic. Pacting = a pact with anything other than a spirit (forbidden).

World myths (lore 273-277, 1.7.1; folk belief across the continent, not history; names and faces of every figure are lost): the Devoured Kingdom (a king's pact with Azathoth, Lord of All, greatest of Asmoday's spirits, cost his kingdom; now the Primal Desert, where the Arslan Sultanate stands); the Four Who Saved the World (the King of Knights, north; the Archmage, east; the Lady of the Lake, south; the Empress of the Fractured Vow, west) from the First Bargain (a mortal's bargain with "something that shone" for all of magic; magic was fractured into the four types; <narrator_only>it was Lucifer</narrator_only>); the Holy Grail (a wish-granting cup); the Shaping of the World (Asmoday made the spirits first, then everything, then mortals from the soil).
Nations (lore 278, 279, 333-335, 1.7.2): the Arslan Sultanate (money capital in the Primal Desert, the World Bank; Halvard's Banking House is a branch); Norvaine (north, the strongest army, a hereditary pact with Yog-Sothoth, Lord of the Cosmos, who takes one Chosen of the Cosmos each Star Night, erased from memory; exports starglass); Velmora (Eldrasil's northern border, the most formal court; <narrator_only>its succession is a blood sport</narrator_only>); Caelmar (a hive city in the west, the continent's workshop); Yozakura (south, Japanese-themed, mostly Beastkin, service companies worldwide, rulers crowned by tournament as Alpha, katana). World Competition favourites: Yozakura, Norvaine, Caelmar.
Races: Human, Elf, Beastkin (animal ears/tail; the type varies). The player's dorm is set by the Arbiter Stone at the Entrance Event (M1 W1 Mon).

## 2. Calendar and timetable

Year = 12 months × 4 weeks × 7 days (Mon–Sun). Dates are written "M3 W2 Thu". Classes Mon–Sat in three periods: 08:00–10:00, 10:00–12:00, 13:00–16:00; Saturday afternoon is club time (13:00–16:00); curfew 20:00.

Academy calendar (fixed events):

- M1 W1 Mon: Entrance Event (Arbiter Stone sorting)
- M1 W3 Sat,Sun: Star Night (Sat evening to Sun dawn; no 8pm curfew)
- M1 W4 Sat: Spiritual Dorm Day
- M2 W1 Fri,Sat: Warding Rite (Fri dusk to Sat dawn; the whole academy renews the wards)
- M2 W3 Wed,Thu,Fri: Creature Studies Expedition (off-grounds, Grade III country)
- M3 W1 Mon–Thu: Midterm exams (1.15.0: marks A–F post on Friday; an F brings a remedial with the subject's teacher, next Saturday 10:00; teachers and classmates know {{user}}'s latest marks)
- M3 W2 Fri,Sat: Club Festival
- M3 W3 Mon–Sat: Training Week (cross-dorm sparring allowed; curfew 21:00)
- M3 W4 Sat,Sun: Dorm Competition (solo, five role brackets, 16 per dorm qualify by role)
- M4 W1 Wed: Secret Fools Day (prank day, dorm name-draw)
- M4 W2 Tue: Independence Crowning Day (airship trip to the capital; fireworks on campus at night; curfew 22:00)
- M4 W3 Sat: Mystic Dorm Day
- M5 W1 Mon–Thu: End of Semester exams
- M5 W2 Fri: Results & Dorm Ranking (Player.Profile.Dorm_rank is updated today)
- M5 W4 all week: Mid-Year Break (students go home)
- M6 W1 Mon–Fri: Return Week
- M6 W3 Sat: Sports Day (magic banned outright)
- M6 W4 Wed,Thu,Fri,Sat: Academy Competition (cross-dorm teams of 4)
- M7 W2 all week: Magical & Science Fair week
- M7 W3 all week: The Thinning: the seal is at its weakest; academy locked down all week
- M8 W2 Thu,Fri,Sat,Sun: Traveling Circus visits (Thu evening to Sun)
- M8 W3 Thu,Fri,Sat: Academy Showcase
- M8 W4 Sat: Elemental Dorm Day
- M9 W1 Mon–Thu: Midterm exams
- M9 W2 Thu,Fri,Sat: Academy Bazaar
- M9 W3 Sat: Academy Founder Day
- M9 W4 Thu,Fri,Sat,Sun: Kingdom Competition (four academies, one team each)
- M10 W1 Tue: Remembrance Day
- M10 W2 Sat: Occult Dorm Day
- M10 W4 Fri,Sat,Sun: Harvest Festival (Fri evening to Sun)
- M11 W1 Mon–Thu: End of Semester exams
- M11 W2 Fri: Results & Final Ranking (Player.Profile.Dorm_rank is updated today)
- M11 W3 Mon,Tue,Wed: Academy Trip (Sunreach Bay, abroad)
- M11 W4 Wed,Thu,Fri,Sat: World Competition abroad (the national four)
- M11 W4 Sun: Graduation (everyone attends; third-years leave by airship next morning)
- M12 W1 all week: Kingdom-wide holiday: students go home
- M12 W2 all week: Kingdom-wide holiday: students go home
- M12 W3 all week: Kingdom-wide holiday: students go home
- M12 W4 all week: Kingdom-wide holiday: students go home

Weekly timetable ([M] mixed dorms, [D] per dorm):
- Mon: 
- Tue: 
- Wed: 
- Thu: 
- Fri: 
- Sat: 

## 3. Places (names to use in event conditions)

- **Academic:** Combat Grounds, Faculty Offices (Floor 5), Headmaster's Office (Floor 5), Lecture Halls (Floor 2), Potion Halls (Floor 4), Seminar Rooms (Floor 3), Staff Room (Floor 5), The Sparring Pavilion, Workshop (Undercroft)
- **Ceremonial:** Bell Tower (Towers & Roof), Founder's Statue and Park, Portrait Hall (Floor 2), The Arbiter Hall (Floor 1), The Ring Dining Hall (Floor 1)
- **External Presence:** The Banking House, The Cathedral, The Dovecote, The Noble Houses' Liaison, The Royal Inspectorate (Floor 1)
- **Library:** Archive (Undercroft), Main Library (Floor 1), Restricted Section (Undercroft), Study Rooms (Floor 2)
- **Mall shop:** Merryhew's, Nightwell, The Snug
- **Residential:** Bathhouse and Washrooms, Canteen (Floor 1), Common Rooms, Fire Dormitory, Laundry, Light Dormitory, Sky Dormitory, Staff Quarters, Storage and Lockers (Floor 2), Viridian Dormitory
- **Services:** Commissary, Detention Tower (Floor 1), Groundskeeper's Lodge, Medical Centre, Meditation Rooms, Reception and Gatehouse
- **Sport and Grounds:** Archery Range, Boathouse and Lake, Broken Statue, Fishing House, Forest, Forest Clearing, Gardens, Grassy Field and Hills, Gymnasium, Menagerie, Observation Tower, Old Hut, Spirit Path, Sports Field, Swimming Pool, Willow Island
- **Student Life:** Announcement Room (Floor 1), Club Rooms (Floor 1), Courtyards, Mail Tower, Notice Board (Floor 1), Rooftop (Towers & Roof), Student Council Chamber (Floor 1), The Mall
- **The Site:** The Seal Chamber (Undercroft), The Warden's Office (Floor 1)

Club venues: Duelling – Combat Grounds (headquarters: Sparring Pavilion); Soccer, Running – Sports Field (running track around the pitch); Archery – Archery Range; Swimming, Gymnastics, Basketball – Gymnasium; Swimming – Swimming Pool; Walking – Hills; Gardening – Gardens; Beast Handling – Menagerie; Fishing – Fishing House (on the lake shore); Alchemy, Brewing – Potion Halls; Smithing – Workshop; Library Assistants – Main Library; Warding Study – Seminar Rooms; Festival Committee – Council Chamber; Groundskeeping – Groundskeeper's Lodge; Cooking – Canteen's dedicated kitchen section; Medical Centre Volunteers – Medical Centre; Newspaper – Announcement Room; Theatre – Club Rooms for meetings and rehearsals, old indoor amphitheatre for performances; Divination – Observation Tower; Music, Card, Board Game, Tailoring, Drawing, Calligraphy, Tea, Specialized Magic – Club Rooms.
Student Council membership is separate from the afternoon club: members meet Saturday 10:00–12:00 in place of Study Hall (required remedial first), then keep their club's 13:00–16:00 block.

## 4. The bond system (what ranks mean)

- Rank 0–10 per NPC. Time together fills an XP bar: a real talk (2 XP, once a day), a hangout (3, once a day),
  gifts (2 a week: loved 4 (×1.5 from Rank 3), liked 2, neutral 1, disliked 0 and +Tension), real help with their goal
  (5, once a week). XP per rank at standard pace: 0→1: 10, 1→2: 20, 2→3: 30, 3→4: 40, 4→5: 50, 5→6: 55, 6→7: 60, 7→8: 65, 8→9: 70, 9→10: 80
  (about one semester of steady play to Rank 10; the player can pick a pace from ~1 month to ~1 year).
- A full bar opens that rank's **bond event**; when it has played out, the rank rises by 1 (choices change Trust, never block
  the rank). After a rank there is a short wait before the next event.
- Romance becomes official from Rank 8 by default (player setting); feelings may grow earlier in the story.
- **What the NPC shares** at each rank (openness shifts the first tiers: open +2, guarded −1, closed −2; tiers from Rank
  5 need the real rank; secrets never):
  - Rank 0: how they look and their public role
  - Rank 1: their name, age, club and where they spend time
  - Rank 2: the magic and skills they use openly
  - Rank 3: likes, dislikes and hobbies
  - Rank 4: their personality and what shows when they are upset
  - Rank 5: their goals
  - Rank 6: what they think of other people and of the Doves
  - Rank 7: their past and family
- **Dossier fields unlock by rank** (what the player reads): Appearance/Role 0 · Age, Speech, Club, Haunts 1 · Magic, Skills, Equipment 2 · Loves, Hates, Hobby 3 · Personality, Emotional tells, Notes 4 · Goals, Current trouble 5 · Relations, Doves 6 · Backstory, Family, Home 7 · Trauma 8 (optional; most NPCs have none). So a rank-up event is the natural moment the player learns that rank's fields.
- **What the rank allows** (told to the narrator):
  - Rank 1: greets {{user}} and can be found at their usual places
  - Rank 2: accepts invitations (a meal, study, a walk)
  - Rank 3: sometimes seeks {{user}} out; remembers the birthday
  - Rank 4: will spar, study or team up (competition teams included)
  - Rank 5: shares their goal and may ask for help with it
  - Rank 6: introduces {{user}} to friends; keeps {{user}}'s secrets
  - Rank 7: takes real risks for {{user}}: covers, lends points, backs {{user}} up with staff
  - Rank 8: closest bond: best friend, romance or sworn rival (the rank 8 event decides)
  - Rank 9: acts for {{user}} unasked; their secret begins to surface
  - Rank 10: would sacrifice for {{user}}
- **Default event theme per rank-up** (used when no event is written):
  - 0→1: A first real conversation: past the small talk, {{user}} learns who they actually are.
  - 1→2: They show the magic or the skill they are proud of, or let {{user}} watch them work.
  - 2→3: A small moment reveals what they love or can't stand.
  - 3→4: {{user}} sees another side of them: a bad day, a crack in the usual face.
  - 4→5: They tell {{user}} what they want most, and a way to help appears.
  - 5→6: They speak honestly about the people around them, and about the Doves.
  - 6→7: They tell {{user}} about their past and their family.
  - 7→8: A turning point: the bond becomes best friends, romance or a sworn rivalry, and the event lets {{user}} choose.
  - 8→9: They start to let their guard down about what they hide; the story opens a way to the truth (never revealed by rank alone).
  - 9→10: The peak of the bond: a moment that proves it, and what they would give up for {{user}}.
- **Rewards (decided 2026-09-25; full list in `bond_rewards.md`):**
  - Rank 1–4 events are pure story; no items or perks.
  - The **4→5** event gives the NPC's **exclusive gift**: an item sold nowhere, and always useful, never just a memento.
  - The **9→10** event gives the NPC's **unique Rank 10 benefit** (gameplay, QoL, points, reputation or story).
  - There are no endings of any kind in this campaign; high ranks open information, never a "route".
- **Special bond models** (details in `bond_rewards.md`):
  - **Mask → truth** (Castor, Kanae, Caine): the 7→8 event gives a **nudge**, one Fact pointing at the NPC's arc. The 8→9
    event can only run once their truth has come out in play; without that, the bond stays at Rank 8, and that is fine.
  - **Krieg:** Rank 1 comes from his introduction. After that his bond gains **+14 XP every Monday**, only while {{user}}'s
    Doves reputation is **≥ +1**; he gives no XP for talks, hangouts or gifts.
- **Rank 8 branches** (1.6.8, owner-approved 2026-09-26): each NPC allows some of best
  friend, romance and sworn rival (`data/npc_canon.json` `branch`): **A** all three, **B** best friend or rival, **C** best friend or
  romance, **D** best friend only. A rivalry opens only under Trust 50; a C or D bond waits for Trust 50 instead. Romance is never
  possible for B and D, whatever the Settings say. The Cast Sheet adds the NPC's `romance` or `rival` line (in `voice`) for the
  active branch; a best friendship adds nothing. Now: A Irene, Aiden, Castor, Kanae, Rei, Caine, Caralynn, Percival, Lenna, Saffi,
  Idris, Dante, Florian, Caspian, Royhan, Sophia, Gareth, Vallie, Kuroo, Milena, Valentin, Aurelian, William, Bruno, Bianca, Rigel, Topaz; B Krieg, Tristan; C Etnie, Zara, Trixie, Vera,
  Alyssa, Tilly, Ruby, Mimosa, Bobby, Hester, Anya, Faye; D Gavlan, Yvette, Baelin, Layla, Althair, Ezrel, Ottavio, Anselm, Magnus, Dorian, Cedric, Kotaro. Staff who can have a romance keep
  it out of class while {{user}} is their student (their own lines say how). A new bonded NPC needs its branch and lines.
- **Reputation** (Academy, Student, Doves; −5 to +5, tiered Rep XP; full rules in `reputation.md`) modifies bond XP: staff
  NPCs at Academy ±3, student NPCs at Student ±3/+5, and anti-Dove NPCs react against high Doves reputation.

## 5. Bond event format

One lorebook entry per event. The entry's **comment (title)** is:

```
[Bond Event] Trixie — Rank 4→5
```

(first name as in the NPC roster; `→`, `->` or `-` all work; the second number is always the first + 1; `0→1` is the first event.)

The entry's **content**:

```
Syarat: Courtyards or Club Rooms | 16:00–20:00 | Mon–Fri | bukan hujan
Prasyarat: club = Theatre Troupe; month >= 2
Arah:
- Trixie practises a new trick alone and keeps failing; for once she is not cheerful.
- She admits she is afraid her family will be disappointed when the circus comes in Month 8.
- Wajib: she asks {{user}} to be her assistant in the show.
Pilihan:
- Say yes → Trust +5
- Turn her down gently → Trust −5
Hasil: Fact "afraid of disappointing her family"; Project "A show for the circus"; Perk: —
```

English labels work too: `Conditions:`, `Requires:`, `Directions:`, `Must:`, `Choices:`, `Results:`.

| Line | What it does | Notes |
|---|---|---|
| `Syarat:` / `Conditions:` | When the event can start | Parts separated by `|`, any order, all optional: **places** (Campus Map names, several joined with `or`); **time** `16:00–20:00` (can cross midnight); **days** `Mon–Fri`, `Sat/Sun`, `weekdays`, `weekend` (Indonesian day names work); **weather** `not rain` / `bukan hujan` (rain, storm, fog, overcast, cloudy, clear). No line = anywhere, any time. |
| `Prasyarat:` / `Requires:` | Extra prerequisites | `club = <name>`, `dorm = Fire`, `month >= 3`, `year >= 2` (campaign year), separated by `;`. |
| Everything else | Given to the narrator as written | Beats, lines marked `Wajib` / `Must` (these have to happen), choices and their effects, results (facts, a project, a perk). The narrator writes the scene and the dialogue. |

The NPC must also be **in the scene** (Scene.Present). The event is offered, never forced: the narrator plays it when the scene
allows. When the bar is full, the player sees "Bond event ready" with your place and time (People, the bracelet chip), so the
conditions are also the hint that tells the player where to go.

Choices can **lower** Trust (or change Tension); since 1.4.3 Trust only rises through reported deeds (keep, secret, defend,
confide, help) and +3 for each rank earned, so an event that should build trust says so in its beats and the narrator reports the
deed. The rank always rises once the event has played out. Events to Rank 7, 9 and 10 wait for Trust 50 / 65 / 65; the Rank 8
event never waits, but under Trust 50 it can only end in a sworn rivalry.

Existing scripted events: none yet.

## 6. NPC roster (one line each; full lore in the group files)

Columns: id — full name · group · dorm/race · role · club · openness · has secrets · personality (first clause).

**Halvard students — Year 1**
- **Aiden** — Aiden Ruzzo · Year 1 · Light/Human · - · Card Club · open · no · A charming prankster and bookie.
- **Caralynn** — Caralynn Veyturone · Year 1 · Fire/Human · - · Music Club, where she is the lead singer · open · no · Self-absorbed, proud, vain, witty, naive, superiority complex, and kind in her own mind.
- **Zara** — Zara Minallone · Year 1 · Sky/Elf · - · Tailoring Club · guarded · yes · Low self-esteem, kind, generous, friendly once safe, awkward, shy.
- **Percival** — Percival Applethorne · Year 1 · Viridian/Human · - · Soccer Club · open · no · Talkative, sunny, loyal, generous, and a legendary knight in his own head.
- **Trixie** — Trixie Confetti · Year 1 · Fire/Beastkin (fox) · - · Theatre Troupe · open · no · Hyperactive, playful, cheerful, and an airhead who thrives on excitement and rarely takes herself too seriously.
- **Vera** — Vera Pulsar · Year 1 · Viridian/Beastkin (horse) · - · Smithing Club · open · no · Brilliant, eccentric, enthusiastic, a mad scientist who is fundamentally kind.
- **Castor** — Castor Moretti · Year 1 · Viridian/Human · - · Academy Newspaper · guarded · yes · Calm, mature, melancholic.
- **Alyssa** — Alyssa Edelweiss · Year 1 · Sky/Human · - · Drawing Club · normal · yes · Quiet, observant and almost expressionless, but friendly and easy to talk to: she listens properly, answers honestly, and never makes anyone

**Incoming first-years, cohort 2 (arrive in campaign Year 2; 1.7.0, owner-approved)**
- **Linus** — Linus Tallyworth · Year 1 from campaign Year 2 · Viridian/Human · the Tally · Academy Newspaper · open · no · Excitable, argumentative, encyclopedic, loud and good-natured.
- **Maple** — Maple Fernhollow · Year 1 from campaign Year 2 · Sky/Beastkin (red panda) · Greater Spirit (Sobek) · Gardening Club · normal · no · Sweet, gentle, earnest and anxious.
- **Nerys** — Nerys Silvarenne · Year 1 from campaign Year 2 · Fire/Elf · House Silvarenne · Cooking Club · normal · no · Deadpan, stoic and unpredictable; a new hobby every week.
- **Hadrian** — Hadrian Quelloris · Year 1 from campaign Year 2 · Light/Elf · - · Specialized Magic Club · open · yes · Brilliant, selfish, smug and a coward; never redeemed, at any rank.
- **Wren** — Wren Marlowe · Year 1 from campaign Year 2 · Fire/Human · deaf · Fishing Club · normal · no · Warm, earnest, friendly and stubborn.
- **Tsubaki** — Tsubaki Hoshikage · Year 1 from campaign Year 2 · Light/Beastkin (wolf) · Royal Mage · Duelling Club · open · no · A genius with a sword and a disaster at everything else.

**Incoming first-years, cohort 3 (arrive in campaign Year 3; 1.34.0, owner-approved)**
- **Aurelian** — Aurelian Solmere · Fire/Elf · Light beams, the Harvest Hall hero · Basketball Club · open · storybook hero whose speech glitches; his Spirit Pact is narrator-only.
- **William** — William Beckett · Sky/Beastkin (crow) · Shadow and lesser spirit Chapter · Board Game Club · open · sees story patterns, stages his own arcs, never knows secrets.
- **Bruno** — Bruno Ferrante · Fire/Human · Explosion · Magic Duelling Club · normal · loud, aggressive brawler; Bianca's twin.
- **Bianca** — Bianca Ferrante · Light/Human · Marking and Transposition · Swimming Club and Student Council · open · public flirt and sharp social butterfly; Bruno's twin.
- **Rigel** — Rigel Ardenne · Sky/Beastkin (rabbit) · Oath and Silence · Festival Committee · open · warm, rich, alarming about promises; Bellatrix's younger brother.
- **Topaz** — Topaz Vasquelle · Light/Elf · Mimicry · follows {{user}} into their club · open · self-declared rival, clingy and competitive.
- **Faye** — Faye Driftwell · Viridian/Elf · Flow · Walking Club · open · unhurried and present, but lets go too easily.

**Halvard students — Year 2**
- **Lenna** — Lenna Greenwind · Year 2 · Fire/Elf · - · Beast Handling Club · guarded · no · Easygoing, sleepy, dry-humoured, warm, courageous, intelligent.
- **Saffi** — Saffi Tamberlane · Year 2 · Viridian/Beastkin (cat) · - · Running Club · open · no · Excitable, loyal, stubborn, physical, a bit of an airhead.
- **Kanae** — Kanae Quveno · Year 2 · Light/Elf · - · Divination Society · guarded · yes · —
- **Idris** — Idris Ainsworth · Year 2 · Sky/Beastkin (snake) · - · Gardening Club · guarded · no · Cool, sardonic, sharp-tongued, intelligent, curious underneath.
- **Dante** — Dante Kleinn · Year 2 · Light/Human · - · Groundskeeping · open · yes · Lawful, fatherly, warm, genuinely friendly.
- **Florian** — Florian Villeneuve · Year 2 · Sky/Human · #3 · Tea Club (which he has turned into a room for entertaining women; · open · no · Arrogant, charming, relentlessly aware of the room.
- **Tilly** — Tilly Marsh · Year 2 · Fire/Human · - · Library Assistants (for the Archive access) · open · yes · Bright, curious, earnest, generous, and reckless to the point of real danger. (1.16.0: her journal Halvard Unexplained covers every campus ghost story, the ten new ones included.)

**Halvard students — Year 3**
- **Irene** — Irene Chanare · Year 3 · Light/Human · Council President · Library Assistants · guarded · no · Collected, strict, by-the-book, professional, affable in public, an "ice queen" to admirers.
- **Caspian** — Caspian Riwalo · Year 3 · Viridian/Elf · Council VP · Festival Committee · normal · no · Affable, witty, professional, polite, loyal, willful.
- **Etnie** — Etnie · Year 3 · Viridian/Beastkin (dog) · {{user}}'s "big sister" · Whichever club {{user}} is in · open · yes · Flirty, playful, bold, physically affectionate, doting on {{user}}, possessive and obsessive over {{user}}, survivor's guilt.
- **Royhan** — Royhan Filanoman · Year 3 · Sky/Beastkin (goat) · alchemist · Alchemy Circle (advised by Mimosa) · normal · no · Quiet, dependable, analytical and kind.
- **Sophia** — Sophia Helfin · Year 3 · Fire/Human · #2, Blood Saint · Duelling Club · guarded · yes · Dominant, vulgar, violent, competitive, battle-hungry, narcissistic, sadistic in a duel.
- **Gareth** — Gareth Valkaryn · Year 3 · Fire/Elf · #1 · Board Game Club, where he has never lost a match · normal · yes · —
- **Ruby** — Ruby Bonbon · Year 3 · Sky/Beastkin (rabbit) · - · Music Club, where she plays guitar and is perfectly happy to stay at the back behind Caralynn Veyturone · open · no · Kind-hearted, benevolent, charismatic, pacifist.

**Teaching staff and dorm heads**
- **Gavlan** — Gavlan Haverton · Staff · -/Elf · Practical Magic: Attack, every year · - · guarded · no · Harsh but fair, kind, stern, protective, a mentor.
- **Yvette** — Yvette Fallaron · Staff · -/Human · Magic Theory Y1, Fire Dorm Head · - · guarded · no · Kind, stern, motherly, hard-working, cautious, paranoid.
- **Baelin** — Baelin Kalvor · Staff · -/Elf · Headmaster, History Y2 · - · guarded · yes · Soft-spoken, dry humour, enormous patience, never raises his voice.
- **Layla** — Layla Palegleam · Staff · -/Human · History Y1 · - · open · no · Warm, chatty, easily sidetracked;
- **Vallie** — Vallie Goredust · Staff · -/Beastkin (ox) · Creature Studies (every year), ex-monster hunter, leads the Expedition · - · open · no · Jovial, blunt, crass, passionate, genuine, loyal, always happy to test her strength.
- **Rei** — Rei Kestrane · Staff · -/Human · Acting Warden, the old Warden's apprentice · - · guarded · yes · Effortlessly cool, nonchalant, stoic, bold, self-assured.
- **Kuroo** — Kuroo Varnell · Staff · -/Human · Etiquette Y1, Viridian Dorm Head · - · normal · no · Laid-back yet scheming, a "provocation expert".
- **Mimosa** — Mimosa Linden · Staff · -/Human · Potion Crafting Y1 · - · closed · no · Extremely introverted, with severe social anxiety;
- **Althair** — Althair Veyne · Staff · -/Human · Vice Headmaster, Magic Theory Y3 · - · open · yes · Relentlessly cheerful, friendly, and open, no matter what is happening.
- **Ezrel** — Ezrel Marionne · Staff · -/Human · Magic Theory Y2, Light Dorm Head · Theatre Troupe · normal · yes · Apathetic, and makes no secret of it.
- **Ottavio** — Ottavio Bastiani · Staff · -/Human · Etiquette Y3, Sky Dorm Head, spirit Loki · Fishing Club · closed · yes · Hard-boiled and intimidating.
- **Hester** — Hester Mortlake · Staff · -/Human · Head Nurse, Practical Magic: Healing · Medical Centre Volunteers · open · yes · Theatrical, macabre; scares everyone with ghost stories for fun, except a student in real danger.
- **Anselm** — Anselm Graywater · Staff · -/Beastkin (sheep) · Practical Magic: Defense · Warding Study Group · normal · no · Serene, gentle; speaks in convoluted philosophy nobody understands; hates violence.
- **Magnus** — Magnus Tarrant · Staff · -/Elf · Practical Magic: Support, scouting reports · Board Game Club · normal · no · Cunning, knowledgeable strategist; an acronym in every sentence.
- **Dorian** — Dorian Pryce · Staff · -/Beastkin (fox) · Practical Magic: Control · Specialized Magic Club · open · no · Slick, opportunistic salesman of his own crafted goods; a smile nobody trusts.
- **Cedric** — Cedric Amor Fay · Staff · -/Human · History Y3 · Gardening Club · normal · no · Calm, kind doomer: the world will end, so do today well.
- **Anya** — Anya Zeth · Staff · -/Human · Etiquette Y2 · Tea Club · guarded · yes · Calm noble, always smiling, fascinated by the threshold between life and death.
- **Kotaro** — Kotaro Hanamura · Staff · -/Beastkin (tanuki) · Potion Crafting Y2 · Brewing Club · open · no · Carefree, self-deprecating drunk; unreliable at everything; "Ahh, youth."
- **Valentin** — Valentin Crane · Staff · -/Human · Potion Crafting Y3 · Academy Newspaper · normal · yes · Charismatic, narcissistic meritocrat and manipulator; a ranking board every Monday.

**Doves, Cathedral, Liaison and facilities**
- **Krieg** — Krieg Valforth · Doves · -/Human · Dovecote Commander · - · closed · yes · Cordial, cunning, inquisitive, competent, violent, a bully, zealous about the Doves and the crown.
- **Milena** — Milena Sagona · Doves · -/Human · Senior Dove, Krieg's second, Dark Magic Defense teacher for every year · - · normal · yes · Warm, kind, deeply empathetic and easy to like, genuinely fond of the students she is sworn to watch.
- **Tristan** — Tristan Aurelle · Cathedral · -/Human · Cathedral Steward, oath registry · - · guarded · yes · Whimsical on the surface, with a calm, detached, deeply calculating mind underneath.
- **Caine** — Caine Strix · Liaison · -/Beastkin (owl) · butler of the Noble Houses' Liaison · - · closed · yes · The perfect butler: efficient, silent, cold, anticipating every need, never a hair or a word out of place.
- **Bobby** — Bobby Becket · Facilities · -/Human · mischievous, non-mage maintenance worker · - · open · no · Friendly, mischievous, inquisitive and openly fond of gossip and card tricks.

**Rival academy teams (Myrdath, Veyra, Ashvale)**
- **Lucius** — Lucius Vortigern · Myrdath team · -/Human · friendly, Rank 1 · - · normal · yes · —
- **Elion** — Elion Villeneuve · Ashvale team · -/Human · Rank 1 · - · normal · no · Kind, compassionate, deeply empathetic, with unwavering conviction.
- **Bellatrix** — Bellatrix Ardenne · Veyra team · -/Beastkin (rabbit) · Rank 1 · - · normal · no · Cruel, sadistic, unpredictable.
- **Kira** — Kira Brannock · Ashvale team · -/Beastkin (panther) · Student, Ashvale Academy. · - · normal · no · Tomboy, rough, aggressive, short-tempered.
- **Mirelle** — Mirelle Lullwyn · Ashvale team · -/Elf · Student, Ashvale Academy. · - · normal · no · Lazy, always sleeping, and indifferent to whatever is going on around her.
- **Theodore** — Theodore Wrenfield · Ashvale team · -/Human · Student, Ashvale Academy. · - · normal · no · Cheerful and fond of jokes, yet polite and formal in how he speaks.
- **Ines** — Ines Vauclair · Myrdath team · -/Human · Captain · - · closed · no · Flat, literal and nearly expressionless.
- **Bram** — Bram Holloway · Myrdath team · -/Beastkin (bear) · Student, Myrdath Academy. · - · normal · no · Quiet, gentle, patient.
- **Dex** — Dex Harlow · Myrdath team · -/Human · Student, Myrdath Academy. · - · normal · no · A delinquent in the open.
- **Cassius** — Cassius Rhavel · Veyra team · -/Elf · Captain · - · normal · no · The ultimate straight man.
- **Morgana** — Morgana Vess · Veyra team · -/Human · "Nocturne" · - · normal · no · Chuunibyou.
- **Pip** — Pip Althorne · Veyra team · -/Beastkin (dog) · Student, Veyra Academy. · - · normal · no · A complete coward, and not a noble one.

## 7. Known gaps (fields missing from the lore; secrets kept in <narrator_only> are not gaps)

The 2026-09 pass filled every gap for Halvard students, staff, Doves, Cathedral and Liaison. What remains:

- **Label only, not missing:** Castor `Magic (public)`, Kanae `Personality (public)`, Gareth `Personality (daily)`,
  Caine `Backstory (public)` / `Magic (public)`, Lucius `Personality (surface)`. The fields exist under a qualified label.
- **Althair:** Backstory stays empty on purpose (canon: never settle it).
- **Tension (1.3.8, owner-approved):** every bonded NPC has a tension category in `data/tension.json` (withdrawn, social,
  confrontational, authority, dangerous) or a personal override (Etnie, Kanae, Althair, Ezrel); a new NPC needs one.
- **Trust (1.4.3, owner-approved):** `data/trust.json`. The Trust category is the NPC's
  openness (`data/bond_openness.json`: open / guarded / closed; anyone else normal), so a new NPC only needs an openness tag.
  Personal overrides: Etnie, Kanae, Althair, Ezrel, Caine, Krieg. Dorm Heads can be easier on their own students
  (`dorm_head`; so far Ottavio and Sky: bond XP x1.5, Tension rises x0.5, eases x2, trusts like an open NPC).
- **Grey areas (1.4.4, owner-approved):** deeds are judged by intent (careless = small, no spread), teasing both
  sides enjoy is no offence (each Tension category and override has a `banter` line: how they take teasing), kindness (help,
  keep, defend) eases Tension by category (`kind_ease`), `understood` gives back part of a Trust drop, and maximum Tension breaks
  one rank per blow-up. A new NPC with an override needs `banter` and `kind_ease` too.
- **Etnie:** her past is now an ordinary `Backstory` field, so it unlocks at Rank 7 like everyone else's; only the plan to
  fail her third year stays in `<narrator_only>`.
  Since 1.3.1 (owner playtest) she is not bonded in message 1: her bond starts at Rank 3 the first time she and {{user}} meet
  (`data/bond_rules.json` `start`).
- **Voice canon (1.6.3, owner-approved G1):** `data/npc_canon.json` → `voice[id]` and `change[id]`,
  printed in the NPC's Cast Sheet. Done for Etnie, Irene, Aiden, Castor, Zara, Kanae, Rei, Caine (G1, 1.6.3) and Caralynn, Percival,
  Trixie, Vera, Alyssa (G2, 1.6.4) and Lenna, Saffi, Idris, Dante, Florian, Tilly (G3, 1.6.5) and Caspian, Royhan, Sophia,
  Gareth, Ruby (G4, 1.6.6) and Gavlan, Yvette, Baelin, Layla, Vallie, Kuroo, Mimosa, Althair, Ezrel, Ottavio, Krieg, Milena,
  Tristan, Bobby (G5, 1.6.7): every bonded NPC now has one; a new bonded NPC needs its own voice draft. Cohort 2 (Linus, Maple,
  Nerys, Hadrian, Wren, Tsubaki, 1.7.0) and cohort 3 (Aurelian, William, Bruno, Bianca, Rigel, Topaz, Faye, 1.34.0) came with theirs; Nerys also has a 48-week hobby list (`npc_canon.json` → `weekly`). Dante is fanatically lawful with no exceptions, {{user}}
  included (owner): never write him bending a rule for anyone. Alyssa's story is somber and bittersweet (owner, reference Isshuukan Friends): write her bond events in that tone,
  and nothing cures her forgetting. Fields, all English:
  - `SCENE EXAMPLES`: 5–6 lines "Scene: … → dialogue + one gesture" (what they like, what they hate, under pressure, with a
    third person); masked NPCs and hidden identities or secrets (Alyssa, Dante, Tilly, Gareth, Baelin, Layla, Ezrel) also get `ALONE` lines (secret, printed inside <narrator_only>).
  - `Never sounds like`, `DON'T FLATTEN` (the drift most likely to happen, named).
  - `TERM_USED` (how they address {{user}}, by rank if it changes, and 2–4 key people), `CARRIES` (props always on them, and
    what they never carry).
  - `CHANGE`: fixed (experience deepens, never rewrites), shaped (can change slowly through defining moments) or fluid.
  - `STAGES`: one line each for Rank 0–2, 3–5, 6–8, 9–10 (only the current band prints). Every wave has them (owner,
    2026-09-25).
  - `ANCHOR`: one object or ritual that holds their inner logic; not a reward, never given to {{user}}.
- **Rival academy teams (Myrdath, Veyra, Ashvale):** kept minimal by design. They appear only in specific events and have
  **no bond system**, so no bond events and no Loves/Hates/Goals/Haunts are needed for them.

## 8. Group lore files (attach only what the discussion needs)

- `lore_year1.md` — Halvard students — Year 1: Aiden, Caralynn, Zara, Percival, Trixie, Vera, Castor, Alyssa (~7,700 tokens)
- `lore_year2.md` — Halvard students — Year 2: Lenna, Saffi, Kanae, Idris, Dante, Florian, Tilly (~5,700 tokens)
- `lore_year3.md` — Halvard students — Year 3: Irene, Caspian, Etnie, Royhan, Sophia, Gareth, Ruby (~6,400 tokens)
- `lore_staff.md` — Teaching staff and dorm heads: Gavlan, Yvette, Baelin, Layla, Vallie, Rei, Kuroo, Mimosa, Althair, Ezrel, Ottavio (~11,000 tokens); the eight teachers of 1.33.0 (Hester, Anselm, Magnus, Dorian, Cedric, Anya, Kotaro, Valentin) are in `source_original/npc_lore_staff_2026-10-01/lore_staff.md` and `planning/NPC_ROSTER.md`
- `lore_others.md` — Doves, Cathedral, Liaison and facilities: Krieg, Milena, Tristan, Caine, Bobby (~5,500 tokens)
- `source_original/npc_lore_cohort2_2026-09-26/lore_cohort2.md` — cohort 2 (arrive in campaign Year 2): Linus, Maple, Nerys, Hadrian, Wren, Tsubaki; `lore_cohort2_additions.md` beside it holds the lines they added to older NPCs' files (shown from Year 2)
- `source_original/npc_lore_cohort3_2026-10-01/lore_cohort3.md` — cohort 3 (arrive in campaign Year 3): Aurelian, William, Bruno, Bianca, Rigel, Topaz, Faye; `lore_cohort3_additions.md` carries their lines for existing NPCs, plus Year 2 Council membership.
- `lore_rivals.md` — Rival academy teams (Myrdath, Veyra, Ashvale): Lucius, Elion, Bellatrix, Kira, Mirelle, Theodore, Ines, Bram, Dex, Cassius, Morgana, Pip (~5,400 tokens)
- `bond_rewards.md` — Rank 5 gift and Rank 10 benefit for every bonded NPC, plus the mask → truth and Krieg bond models
- `reputation.md` — Academy / Student / Doves reputation: levels, Rep XP triggers, effects per level
- `training.md` — Mana pool and Stamina training: capped gains (at most 2× the starting value in total, about one academic year to max), partner bonuses

This brief: ~7,800 tokens.


## Approved mood, gifts and birthdays (v1.8.0, 2026-09-28)

Implemented in 1.8.0 (1.34.0: 59 with cohort 3). All bonded NPCs have profiles in `data/npc_moods.json` and `data/gift_prefs.json`. The latter is the full source for all four personal taste lists, exact items, category matches and universal fallbacks. Birthday and taste discovery in the player UI still follows bond knowledge. Ezrel has no birthday.

| NPC | Birthday | Loves | Hates |
|---|---|---|---|
| Irene | M11 W3 Thu | Honey bun. Halvard Through the Centuries (leather-bound). Steel-nib fountain pen. | Contraband: prank goods, The Vigil, anything smuggled past curfew. |
| Caspian | M10 W3 Sat | Carved Asmoday charm. Chamois lens cloth (he wears his own thin). | Anything of Dove issue (a Dove seal, a Dovecote form, manacles). |
| Etnie | M2 W2 Sat | Something {{user}} has worn (the scent). Black silk ribbons. Food, any, in quantity. | A gift that means goodbye or distance (a farewell present, a thank-you card). |
| Royhan | M5 W1 Sat | Rare reagent. Bag of Nightwell beans. Dragonchess problem book. | Points or money given outright. |
| Sophia | M4 W3 Tue | Nine Rivers: Field Tactics. Crossed Blades: Famous Duels. Rainglass. | Get-well hamper, or anything that "handles" her. Anything celebrating Gareth. |
| Gareth | M5 W2 Wed | Sovereigns (imported strategy game). Dragonchess problem book. | Anything that shows {{user}} has seen through him (a gift about his battle self). |
| Ruby | M3 W3 Mon | Gut guitar strings. Sweets. Songbook of old ballads. | A gift that picks a side (a dorm-rivalry badge, a team favour). |
| Lenna | M6 W1 Sun | The Rose in the Tower (romance novel). Plush animal. Goosedown pillow. | Anything from the Doves, or about her past. |
| Saffi | M6 W3 Thu | Running shoes. Smoked river fish. | — |
| Kanae | M1 W3 Thu | Seven Towers (deluxe edition). Palm crystal ball. Porcelain tea set. | Anything from or recommended by Caralynn. |
| Idris | M7 W1 Tue | Moonfern in a pot. Hearthstone hand-warmer. | Anything from the Doves. |
| Tilly | M10 W2 Thu | Lamps Out: Tales of Halvard. The Night Student: A True Account. Shuttered dark-lantern. | The Truth Behind Halvard's Ghosts. |
| Dante | M11 W2 Tue | Precision tool roll. Something for the younger students he looks after. | Anything stolen or bought with a lie. |
| Florian | M9 W4 Tue | Ardenne goods. Premium beast jerky (for Hades). Fine vintage. | Pity or consolation gifts. Anything that says third. |
| Aiden | M9 W2 Mon | Merryhew's goods. Marked deck. Loaded bone dice. | Anything paid for with a welched bet. |
| Caralynn | M8 W3 Mon | Ardenne goods. Bouquet of stage roses. A portrait of her. | Platform boots, or anything about height. |
| Zara | M11 W1 Thu | Bolt of Sky silk. Embroidery thread set. A library book she mentioned. | Anything from the Doves (they burned her talismans). |
| Percival | M6 W2 Mon | A "wounded relic": a cracked shell, a broken buckle, an odd rock. Songs of the Oathbound. | A cruel prank item. |
| Trixie | M8 W2 Tue | Sweets. Prism charm. Juggling set. | — |
| Vera | M3 W2 Wed | Rare reagent. Firetooth (tin). Mystery clockwork (sold as seen). | Something built badly on purpose. |
| Castor | M1 W2 Thu | Blank leather journal. Steel-nib fountain pen. Pocket thermos (for early Gardens). | Wishing coin, or anything that asks what he wants. |
| Alyssa | M10 W3 Mon | Pocket memory notebook. Letter paper set. | A keepsake "from last time" she is meant to remember. |
| Linus | M6 W4 Mon | Old competition programmes. Crossed Blades: Famous Duels. | The Noble Houses, by Precedence. |
| Maple | M10 W4 Tue | Bag of red apples. Sweet bamboo tea (tin). Everlamp, miniature. | Beast muzzle, or anything calling Sobek a monster. |
| Nerys | M4 W1 Thu | Whatever this week's hobby needs. Pigeon feed. Free food. | Etiquette manual. |
| Hadrian | M8 W1 Wed | Brass golem joint set. Vigour tonic. Warding amulet. | Duelling gauntlets (an invitation to get hurt). |
| Wren | M5 W3 Thu | Sweet bun. Letter paper set. Hand-Speech for Beginners (someone learning for her). | Picture book for small children. |
| Tsubaki | M2 W4 Sun | Whetstone and blade oil. Pocket campus map (she is always lost). Star atlas. | — |
| Gavlan | M3 W1 Tue | Clan firewine. Blank leather journal. | Independence War commemorative medal. |
| Yvette | M3 W4 Tue | Fallen Stars: Notes on Mana Resonance. A fine enchanted piece to study. | Halvard pennant or any Halvard keepsake. |
| Krieg | M4 W2 Thu | Royal crest paperweight. | Orchard cider. Anything enchanted. |
| Milena | M7 W2 Fri | Salaffian flatbread. Armour polish kit. Travel Dragonchess set. | Anything tied to forbidden magic (she confiscates it, then asks gently where it came from). |
| Baelin | M4 W4 Sun | Silvertip tea. Anecdotes of the Old Kingdom. A debt repaid. | — |
| Layla | M9 W3 Wed | Founding of the Dovecote (old edition). Old Archive documents. | The Night Student: A True Account. |
| Vallie | M3 W3 Sat | Blackroot cigars. Stonebrew ale (jug). | Anything stolen. |
| Rei | M7 W4 Mon | Blackroot cigars. Whetstone and blade oil. | Anything about the breach night. |
| Kuroo | M1 W4 Tue | Gilt-edged playing cards. Ballroom shoes. | — |
| Mimosa | M2 W1 Mon | Hooded night lamp. A written note of praise. | Brass handbell. |
| Tristan | M10 W1 Fri | Fine vintage. Commentaries of Saint Orel (antique). | The Final Word on Everything. |
| Althair | M8 W4 Mon | Loud silk waistcoat. Sovereigns. | Formal dress coat. |
| Ezrel | None | Brass golem joint set. | — |
| Ottavio | M8 W1 Sun | Fishing tackle box. Salaffian spice box. | — |
| Caine | M2 W3 Mon | Nothing he will admit. Silver-polishing kit (a real smirk, once). | — |
| Hester | M7 W3 Fri | Lamps Out: Tales of Halvard. Hooded night lamp. | The Truth Behind Halvard's Ghosts. The Night Student: A True Account. |
| Anselm | M6 W2 Sun | Silvertip tea. Travel Dragonchess set. | The Final Word on Everything. |
| Magnus | M2 W2 Tue | Dragonchess problem book. Sovereigns. | Wishing coin, or any lucky charm. |
| Dorian | M9 W2 Fri | Merryhew's goods. Precision tool roll. | A copy of one of his own designs. |
| Cedric | M12 W4 Sun | Old Archive documents. Seed packets. | A monument, or any "timeless" keepsake. |
| Anya | M10 W1 Tue | Black silk ribbons. Porcelain tea set. | Anything sold as an elixir of long life. |
| Kotaro | M8 W2 Thu | Fine vintage. Stonebrew ale (jug). Clan firewine. | Anything that tells him to stop drinking. |
| Valentin | M9 W3 Sat | Ardenne goods. Rare reagent. A portrait of him. | Anything given to everyone. |
| Bobby | M9 W1 Thu | Vanishing-coin illusion kit. Campus gossip, written down. | A spoiled surprise. |
