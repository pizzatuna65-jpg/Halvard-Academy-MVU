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
Other nations: exist; Sunreach Bay and Velmora are named.
- Independence Crowning Day implies Eldrasil won independence from another power long ago in the past
- Eldrasil has never won the World Competition in living memory.

[Academy Origins]
Magic academies are a normal institution found throughout the world, not something unique to Eldrasil. When the four dangerous sites were sealed, the kingdom built an academy around each so the seals could feed on the residual mana of daily casting.

The decision was practical but controversial. Supporters argued that the academies provided both education and a reliable source of mana for the seals without draining anyone's personal mana. Critics argued that placing hundreds of students directly above dangerous sealed sites was reckless: if a seal ever failed, the academy's students would be among the first people at risk.

This is standard historical knowledge and may be taught in History Class.
```

```
[Halvard Academy]
Region: West. Site: The Crack, a crack in reality leading to the demon world. Site name unknown.
Headmaster: an Elf, head of Halvard for forty years.
Local fear: the Crack itself and whatever might come through it. Rumours about it are the academy's favourite ghost stories, and anything unusual (a strange mark, odd eyes, horns) invites whispers.
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
Law: A Spirit Lord is still a spirit, so a pact with one is a lawful Spirit Pact, not forbidden Pacting.
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
Five roles used in Combat Class, exams and team competitions. A student may fill more than one.
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

Races: Human, Elf, Beastkin (animal ears/tail; the type varies). The player's dorm is set by the Arbiter Stone at the Entrance Event (M1 W1 Mon).

## 2. Calendar and timetable

Year = 12 months × 4 weeks × 7 days (Mon–Sun). Dates are written "M3 W2 Thu". Classes Mon–Sat in three periods: 08:00–10:00, 10:00–12:00, 13:00–16:00; Saturday afternoon is club time (13:00–16:00); curfew 20:00.

Academy calendar (fixed events):

- M1 W1 Mon: Entrance Event (Arbiter Stone sorting)
- M1 W3 Sat,Sun: Star Night (Sat evening to Sun dawn; no 8pm curfew)
- M1 W4 Sat: Spiritual Dorm Day
- M2 W1 Fri,Sat: Warding Rite (Fri dusk to Sat dawn; the whole academy renews the wards)
- M2 W3 Wed,Thu,Fri: Creature Studies Expedition (off-grounds, Grade III country)
- M3 W1 Mon–Thu: Midterm exams
- M3 W2 Fri,Sat: Club Festival
- M3 W3 Mon–Sat: Training Week (cross-dorm sparring allowed; curfew 21:00)
- M3 W4 Sat,Sun: Dorm Competition (solo, top 16 qualify)
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
- **Services:** Commissary, Detention Tower (Floor 1), Groundskeeper's Lodge, Medical Centre, Meditation Rooms / Spirit House, Reception and Gatehouse
- **Sport and Grounds:** Archery Range, Boathouse and Lake, Broken Statue, Fishing House, Forest, Forest Clearing, Gardens, Grassy Field and Hills, Gymnasium, Menagerie, Observation Tower, Old Hut, Sports Field, Swimming Pool, Willow Island
- **Student Life:** Announcement Room (Floor 1), Club Rooms (Floor 1), Courtyards, Mail Tower, Notice Board (Floor 1), Rooftop (Towers & Roof), Student Council Chamber (Floor 1), The Mall
- **The Site:** The Seal Chamber (Undercroft), The Warden's Office (Floor 1)

Club venues: Duelling – Combat Grounds (headquarters: Sparring Pavilion); Soccer, Running – Sports Field (running track around the pitch); Archery – Archery Range; Swimming, Gymnastics, Basketball – Gymnasium; Swimming – Swimming Pool; Walking – Hills; Gardening – Gardens; Beast Handling – Menagerie; Fishing – Fishing House (on the lake shore); Alchemy, Brewing – Potion Halls; Smithing – Workshop; Library Assistants – Main Library; Warding Study – Seminar Rooms; Festival Committee – Council Chamber; Groundskeeping – Groundskeeper's Lodge; Cooking – Canteen's dedicated kitchen section; Medical Centre Volunteers – Medical Centre; Newspaper – Announcement Room; Theatre – Club Rooms for meetings and rehearsals, old indoor amphitheatre for performances; Divination – Observation Tower; Music, Card, Board Game, Tailoring, Drawing, Calligraphy, Tea, Specialized Magic – Club Rooms.

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

Choices change **Trust** (or Tension); the rank always rises once the event has played out.

Existing scripted events: none yet.

## 6. NPC roster (one line each; full lore in the group files)

Columns: id — full name · group · dorm/race · role · club · openness · has secrets · personality (first clause).

**Halvard students — Year 1**
- **Aiden** — Aiden Ruzzo · Year 1 · Light/Human · - · Card Club · open · no · A charming prankster and bookie.
- **Caralynn** — Caralynn Veyturone · Year 1 · Fire/Human · - · Music Club, where she is the lead singer · open · no · Self-absorbed, proud, vain, witty, naive, superiority complex, and kind in her own mind.
- **Zara** — Zara Minallone · Year 1 · Sky/Elf · - · Tailoring Club · guarded · yes · Low self-esteem, kind, generous, friendly once safe, awkward, shy.
- **Percival** — Percival Applethorne · Year 1 · Viridian/Human · - · Soccer Club · open · yes · Talkative, sunny, loyal, generous, and a legendary knight in his own head.
- **Trixie** — Trixie Confetti · Year 1 · Fire/Beastkin (fox) · - · Theatre Troupe · open · no · Hyperactive, playful, cheerful, and an airhead who thrives on excitement and rarely takes herself too seriously.
- **Vera** — Vera Pulsar · Year 1 · Viridian/Beastkin (horse) · - · Smithing Club · open · no · Brilliant, eccentric, enthusiastic, a mad scientist who is fundamentally kind.
- **Castor** — Castor Moretti · Year 1 · Viridian/Human · - · Academy Newspaper · guarded · yes · Calm, mature, melancholic.
- **Alyssa** — Alyssa Edelweiss · Year 1 · Sky/Human · - · Drawing Club · normal · yes · Quiet, observant and almost expressionless, but friendly and easy to talk to: she listens properly, answers honestly, and never makes anyone

**Halvard students — Year 2**
- **Lenna** — Lenna Greenwind · Year 2 · Fire/Elf · - · Beast Handling Club · guarded · no · Easygoing, sleepy, dry-humoured, warm, courageous, intelligent.
- **Saffi** — Saffi Tamberlane · Year 2 · Viridian/Beastkin (cat) · - · Running Club · open · no · Excitable, loyal, stubborn, physical, a bit of an airhead.
- **Kanae** — Kanae Quveno · Year 2 · Light/Elf · - · Divination Society · guarded · yes · Sweet, charming, a perfect popular student with top grades.
- **Idris** — Idris Ainsworth · Year 2 · Sky/Beastkin (snake) · - · Gardening Club · guarded · no · Cool, sardonic, sharp-tongued, intelligent, curious underneath.
- **Dante** — Dante Kleinn · Year 2 · Light/Human · - · Groundskeeping · open · yes · Lawful, fatherly, warm, genuinely friendly.
- **Florian** — Florian Villeneuve · Year 2 · Sky/Human · #3 · Tea Club (which he has turned into a room for entertaining women; · open · no · Arrogant, charming, relentlessly aware of the room.
- **Tilly** — Tilly Marsh · Year 2 · Fire/Human · - · Library Assistants (for the Archive access) · open · yes · Bright, curious, earnest, generous, and reckless to the point of real danger.

**Halvard students — Year 3**
- **Irene** — Irene Chanare · Year 3 · Light/Human · Council President · Library Assistants · guarded · no · Collected, strict, by-the-book, professional, affable in public, an "ice queen" to admirers.
- **Caspian** — Caspian Riwalo · Year 3 · Viridian/Elf · Council VP · Festival Committee · normal · no · Affable, witty, professional, polite, loyal, willful.
- **Etnie** — Etnie · Year 3 · Viridian/Beastkin (dog) · {{user}}'s "big sister" · Whichever club {{user}} is in · open · yes · Flirty, playful, bold, physically affectionate, doting on {{user}}, possessive and obsessive over {{user}}, survivor's guilt.
- **Royhan** — Royhan Filanoman · Year 3 · Sky/Beastkin (goat) · alchemist · Alchemy Circle (advised by Mimosa) · normal · no · Quiet, dependable, analytical and kind;
- **Sophia** — Sophia Helfin · Year 3 · Fire/Human · #2, Blood Saint · Duelling Club · guarded · yes · Dominant, vulgar, violent, competitive, battle-hungry, narcissistic, sadistic in a duel.
- **Gareth** — Gareth Valkaryn · Year 3 · Fire/Elf · #1 · Board Game Club, where he has never lost a match · normal · yes · —
- **Ruby** — Ruby Bonbon · Year 3 · Sky/Beastkin (rabbit) · - · Music Club, where she plays guitar and is perfectly happy to stay at the back behind Caralynn Veyturone · open · no · Kind-hearted, benevolent, charismatic, pacifist.

**Teaching staff and dorm heads**
- **Gavlan** — Gavlan Haverton · Staff · -/Elf · Combat Y1 · - · guarded · no · Harsh but fair, kind, stern, protective, a mentor.
- **Yvette** — Yvette Fallaron · Staff · -/Human · Magic Theory Y1, Fire Dorm Head · - · guarded · no · Kind, stern, motherly, hard-working, cautious, paranoid.
- **Baelin** — Baelin Kalvor · Staff · -/Elf · Headmaster · - · guarded · yes · Soft-spoken, dry humour, enormous patience, never raises his voice.
- **Layla** — Layla Palegleam · Staff · -/Human · History Y1 · - · open · yes · Warm, chatty, easily sidetracked;
- **Vallie** — Vallie Goredust · Staff · -/Beastkin (ox) · Creature Studies Y1, ex-monster hunter, leads the Expedition · - · open · no · Jovial, blunt, crass, passionate, genuine, loyal, always happy to test her strength.
- **Rei** — Rei Kestrane · Staff · -/Human · Acting Warden, the old Warden's apprentice · - · guarded · yes · Effortlessly cool, nonchalant, stoic, bold, self-assured.
- **Kuroo** — Kuroo Varnell · Staff · -/Human · Etiquette Y1, Viridian Dorm Head · - · normal · no · Laid-back yet scheming, a "provocation expert".
- **Mimosa** — Mimosa Linden · Staff · -/Human · Potion Crafting Y1 · - · closed · no · Extremely introverted, with severe social anxiety;
- **Althair** — Althair Veyne · Staff · -/Human · Vice Headmaster · - · open · yes · Relentlessly cheerful, friendly, and open, no matter what is happening.
- **Ezrel** — Ezrel Marionne · Staff · -/Human · Magic Theory Y2, Light Dorm Head · Theatre Troupe · normal · yes · Apathetic, and makes no secret of it.
- **Ottavio** — Ottavio Bastiani · Staff · -/Human · Etiquette Y3, Sky Dorm Head, spirit Loki · Fishing Club · closed · yes · Hard-boiled and intimidating.

**Doves, Cathedral, Liaison and facilities**
- **Krieg** — Krieg Valforth · Doves · -/Human · Dovecote Commander · - · closed · yes · Cordial, cunning, inquisitive, competent, violent, a bully, zealous about the Doves and the crown.
- **Milena** — Milena Sagona · Doves · -/Human · Senior Dove, Krieg's second, Dark Magic Defense teacher for every year · - · normal · yes · Warm, kind, deeply empathetic and easy to like, genuinely fond of the students she is sworn to watch.
- **Tristan** — Tristan Aurelle · Cathedral · -/Human · Cathedral Steward, oath registry · - · guarded · yes · Whimsical on the surface, with a calm, detached, deeply calculating mind underneath.
- **Caine** — Caine Strix · Liaison · -/Beastkin (owl) · butler of the Noble Houses' Liaison · - · closed · yes · The perfect butler: efficient, silent, cold, anticipating every need, never a hair or a word out of place.
- **Bobby** — Bobby Becket · Facilities · -/Human · mischievous, non-mage maintenance worker · - · open · no · Friendly, mischievous, inquisitive and openly fond of gossip and card tricks.

**Rival academy teams (Myrdath, Veyra, Ashvale)**
- **Lucius** — Lucius Vortigern · Myrdath team · -/Human · friendly, Rank 1 · - · normal · yes · Friendly, easy to talk to, helpful, pleasant company.
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
- **Etnie:** her past is now an ordinary `Backstory` field, so it unlocks at Rank 7 like everyone else's; only the plan to
  fail her third year stays in `<narrator_only>`.
- **Rival academy teams (Myrdath, Veyra, Ashvale):** kept minimal by design. They appear only in specific events and have
  **no bond system**, so no bond events and no Loves/Hates/Goals/Haunts are needed for them.

## 8. Group lore files (attach only what the discussion needs)

- `lore_year1.md` — Halvard students — Year 1: Aiden, Caralynn, Zara, Percival, Trixie, Vera, Castor, Alyssa (~8,700 tokens)
- `lore_year2.md` — Halvard students — Year 2: Lenna, Saffi, Kanae, Idris, Dante, Florian, Tilly (~7,300 tokens)
- `lore_year3.md` — Halvard students — Year 3: Irene, Caspian, Etnie, Royhan, Sophia, Gareth, Ruby (~7,600 tokens)
- `lore_staff.md` — Teaching staff and dorm heads: Gavlan, Yvette, Baelin, Layla, Vallie, Rei, Kuroo, Mimosa, Althair, Ezrel, Ottavio (~13,600 tokens)
- `lore_others.md` — Doves, Cathedral, Liaison and facilities: Krieg, Milena, Tristan, Caine, Bobby (~6,300 tokens)
- `lore_rivals.md` — Rival academy teams (Myrdath, Veyra, Ashvale): Lucius, Elion, Bellatrix, Kira, Mirelle, Theodore, Ines, Bram, Dex, Cassius, Morgana, Pip (~5,400 tokens)
- `bond_rewards.md` — Rank 5 gift and Rank 10 benefit for every bonded NPC, plus the mask → truth and Krieg bond models
- `reputation.md` — Academy / Student / Doves reputation: levels, Rep XP triggers, effects per level
- `training.md` — Mana pool and Stamina training: capped gains (at most 2× the starting value in total, about one academic year to max), partner bonuses

This brief: ~8,000 tokens.
