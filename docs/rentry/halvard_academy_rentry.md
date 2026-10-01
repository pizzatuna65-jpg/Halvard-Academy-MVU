-> ![Halvard Academy campus map](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/map/halvard_map.webp) <-

# -> Halvard Academy <-

-> *A school year at a magic academy built on top of a crack in the world.* <-
-> *Classes at nine. Curfew at eight. Don't answer to your name after dark.* <-

-> **[Card (PNG)](DOWNLOAD_LINK_CARD)** · **[Companion preset](DOWNLOAD_LINK_PRESET)** · **[Getting in](#getting-in)** <-

***

[TOC2]

***

## Before the gate opens

Hi. This is **Eldrasil: Halvard Academy**, an MVU card for SillyTavern. You're a first-year at one of the four magic academies of the Kingdom of Eldrasil. Most days are ordinary: lectures and club meetings, the Canteen's mystery bread, rivalries between the dorms, somebody's birthday. Under the castle there's something that's been sealed for a very long time, and two years ago, for one night, it wasn't.

The card is mostly slice-of-life, with a mystery you can dig into or ignore. I've tried to make the campus feel lived in: people have their own goals, habits and bad days, and they don't stop living when you leave the room.

I've also tried to keep the numbers honest. The card tracks time, weather, your body, your money and your relationships, so the AI doesn't have to remember that it's Tuesday or that you're broke. That frees it up to write the people well.

!!! info What you need
    SillyTavern **1.13.5+** on a **Chat Completion** API · **Tavern Helper** (JS-Slash-Runner) **4.8.4+** · the **Prompt Template** (EJS) extension · internet on first load (MVU, portraits and the map load from jsDelivr).
    It's a heavy card. Expect roughly **12k tokens** of card context at the start and closer to **18k** in a busy mid-year. You can switch modules off to shrink that. Full setup is under [Getting in](#getting-in).

***

## The Kingdom, in one breath

Eldrasil sits in the east of the continent. It's a proud kingdom that celebrates its independence every spring and has **never won the World Competition** in living memory. It claims the Archmage, one of the legendary *Four Who Saved the World*, as its own hero.

Long ago the Archmage sealed four dangerous places. Eldrasil later built an academy on top of each one, because seals feed on mana and nothing gives off more leftover mana than a few hundred teenagers casting spells every day. People argued about it at the time and they still do. Supporters called it practical. Critics pointed out that if a seal ever failed, the students would be the first to find out.

| Academy | Region | What sleeps underneath |
|---|---|---|
| **Myrdath** | North | A monster said to threaten the world |
| **Veyra** | South | The Archmage's resting place, full of treasure and spellbooks. Veyra calls itself *the hero's academy* and won't let you forget it |
| **Ashvale** | East | An elixir said to heal any wound or sickness |
| **Halvard** | West | **The Crack**: a crack in reality that leads to the demon world |

You go to Halvard. Obviously.

Past the border are other nations: the **Arslan Sultanate** (money, and the World Bank), **Norvaine** (the strongest army, and one night a year it dreads), **Velmora** (the most formal court on the continent), **Caelmar** (a hive city), **Yozakura** (Beastkin, service companies, and rulers crowned by tournament), and **Sunreach Bay**, where the academy trip goes. People are Human, Elf or Beastkin.

***

## The Night Nobody Talks About

Two years ago, during **The Thinning** (the one week a year when the seal is at its weakest), *something* came through the Crack for a single night.

Several students died. Halvard's Warden resealed the Crack and died doing it. The Warden's apprentice took over the seal that night, and the crown has only ever confirmed her as *Acting* Warden. Nobody has publicly described what came through, and the survivors don't agree on what they saw.

Today's third-years were first-years that night. Some of them don't talk about it. Some of them can't. The Headmaster hired a veteran monster hunter to teach Creature Studies. The crown's mage-police, the **Doves**, questioned the survivors afterwards, and some students haven't forgiven them.

It's a nice school now. The food is good. Every year in Month 7 the academy locks its doors for a week, and for that week you can hear things through the walls.

***

## The Stone Decides

On your first morning you'll put your hand on the **Arbiter Stone** in Arbiter Hall. It's warmer than it should be. It reads your dominant magic type and sorts you into one of four dorms, and you'll live there for three years.

| Dorm | Magic | Vest | The building | Creed | Dorm Head |
|---|---|---|---|---|---|
| %#d9534f%**Fire**%% | Elemental: fire, water, wind, earth, and ice, lightning, metal and the rest | Red | A hearth that burns day and night; the chimney stays warm through winter | *Through the Elements, Victory Is Ours* | Yvette Fallaron |
| %#d4a017%**Light**%% | Mystic: changing the material world, telekinesis, creation, divination, astral | Yellow | A glass dome over the common room that glows after dark | *The Third Eye Lights The Way* | Ezrel Marionne |
| %#3b7dd8%**Sky**%% | Occult: illusions, charms, spirit binding | Blue | Enchanted walls that let you see the grounds from your room | *Together We Are Strong* | Ottavio Bastiani |
| %#3c9a5f%**Viridian**%% | Spiritual: willpower, enhancing yourself, healing | Green | An old oak in the inner court, with meditation stones in its roots | *Know Thyself, Know Victory* | Kuroo Varnell |

!!! note A word about Sky
    Outsiders tend to lump Occult magic in with blood rites and demon summoning, and they can't always tell legal Occult work from forbidden work. The Doves watch Sky more closely than any other dorm, and when something goes wrong, Sky students get suspected first. The creed didn't come from nowhere.

**Magic, briefly.** There are four types with around thirty subtypes each, and most mages specialise in one or two. Casual casting is normal anywhere on campus. The **forbidden arts** get you arrested. The best known is **Pacting**, a bargain with anything that isn't a spirit. A pact with a spirit is lawful, and spirits come in four tiers, from the lesser ones most familiars are, up to Spirit Lords, which most people never meet in their lives. Every pact-holder has heard the story of the king who made a lawful pact and lost his whole kingdom to it.

Within your dorm you'll climb a **rank ladder** that's recalculated twice a year, and your rank sets your **monthly payout** in points: 300 at the bottom, 3,000 at the top. Points live on your bracelet and work like money on campus. Nearly everything has a free version (canteen instead of restaurants, the common-room kettle instead of cafés), so you can always tell who never eats at the Mall.

***

## Other Powers on Campus

Halvard isn't the only authority on its own grounds. Five outside offices have buildings on academy land, and the Headmaster can't give orders inside any of them.

- **The Dovecote.** The crown's hunters of forbidden magic, in blinding white cloaks with the hood always up. Students call the place *the Coop* and the Doves *Pigeons*, and still cross the courtyard in front of it faster than anywhere else. Right now they're following traces of an **unregistered forbidden-magic group** somewhere at Halvard. They don't know its name, its members or what it wants yet.
- **The Royal Inspectorate.** Counting frames and ink. It audits grades, rankings, and how much mana the students actually feed the seal. It blames the breach on the Warden's office, and the Acting Warden refuses to show it her ledgers.
- **The Cathedral of Asmoday.** Stained glass and incense. The clergy teach that the goddess created magic and gave it to mortals. Its steward keeps a register of every oath sworn on academy grounds.
- **The Noble Houses' Liaison.** A small, comfortable manor that tracks promising students well before graduation. If it hasn't noticed you, you probably don't know it exists.
- **The Banking House.** Where family money turns into points. Less dramatic than the others, but useful.

***

## A Year at Halvard

The calendar has 12 months of 4 weeks. Classes run Monday to Saturday, Sunday is rest, and you stay on the grounds all term. Everything below happens on its day, whether or not you're paying attention.

| When | What |
|---|---|
| **M1 W1** | **Entrance Event**: sorting at 09:00, the campus tour, club booths all week, the Entrance Feast in the Ring Dining Hall |
| M1 W3 | **Star Night**: no curfew, a night market, tents on the hills, a meteor shower at midnight. Wishes count |
| M2 W1 | **Warding Rite**: the whole academy renews the wards from dusk to dawn |
| M2 W3 | **Creature Studies Expedition**: off the grounds, into monster country, led by a one-eyed ex-hunter |
| M3 | Midterms, the **Club Festival**, **Training Week** (the one week cross-dorm sparring is allowed), the **Dorm Competition** |
| M4 | **Secret Fools Day** (pranks, dorm name-draw), **Crowning Day** (the whole academy flies to the capital by airship) |
| M5 | Semester exams, **Results & Dorm Ranking**, the Mid-Year Break |
| M6 | **Sports Day** (magic banned outright), the **Academy Competition** |
| **M7 W3** | **The Thinning**: absolute lockdown for the week. Nobody goes outside |
| M8 | The **Traveling Circus**, the **Academy Showcase** |
| M9 | The **Academy Bazaar**, **Founder Day**, the **Kingdom Competition** (one team from each academy) |
| M10 | **Remembrance Day**, the **Student Council election**, the **Harvest Festival** (costumes, haunted corridors, fireworks over the lake) |
| M11 | Final exams, the **Academy Trip** to Sunreach Bay, the **World Competition** abroad, **Graduation** |
| M12 | Winter holiday. The campus empties and the seal gets hungry |

The four dorms also each host a **Dorm Day** during the year, when their building opens to the other three and everyone tries the host dorm's magic, badly, for laughs.

When the year ends, the third-years graduate and leave, and **everyone moves up a year, you included.** In your second year a new batch of first-years arrives, and at their Entrance Event you're one of the seniors showing them around.

***

## Things Students Whisper

None of these are true. Everyone follows them anyway.

- **Taken.** Outdoors after dark, never answer to your own name unless you can see who called. Students walking back near curfew call each other by dorm, by club, or nothing at all.
- **The Three O'Clock Knock.** Three evenly spaced knocks on your dorm door at 3 a.m. Count them and go back to sleep. It's never four, and nobody wants to find out what four means.
- **The Third Stall.** In every washroom block, one stall is always occupied and never answers. Knock twice and something knocks back.
- **The Night Student.** A student in an old-fashioned uniform who sits in the lecture hall after curfew, waiting for a class. The third-years won't tell this one.
- **Star Cookie.** Eat one whole, in one go, before anything that matters. Halves don't count. The bakery sells out by seven on exam mornings and never bakes more.
- **Eating in the Forest.** Leave a bite for the forest first. Creature Studies says it only feeds foxes.

!!! greentext
    >be first-year
    >hear about the Rooftop
    >"there's a trick to the door, someone has to show you"
    >find the locked door off the Bell Tower stair in ten minutes
    >spend the rest of the week failing to open it
    >third-year walks past, does something to the handle
    >"welcome up"

There are also places on the map nobody will explain: a **headless statue** in a grove near the Dovecote, with an inscription worn smooth, and an **Old Hut** on the edge of the Forest where, by long custom, whatever you say inside stays inside.

***

## What the Card Keeps Track Of

Here's what's running underneath while you play. The short version: the AI writes the story, and a small deterministic engine keeps it honest.

### The bracelet

A plain metal bracelet goes on your wrist at Reception, blinks, and settles on **300**. That's your points. In play it's a status bar above each new reply: the clock, the class period, where you are, your points, your vitals, and chips for whatever matters right now (an event today, a shop nearby). Tap a chip and the matching panel opens.

The panels are **Student file**, **People** (dossiers and a draggable connections graph), **Map** (clickable pins; places stay hidden until you find them), **Inventory** (bag, wallet, planner, journal, notice board, letters, a mystery board) and **Activities** (clubs, competitions, the shop, projects, trips, battle).

!!! note The UI never plays for you
    Buttons like *Go here* or *Buy* only write a suggested action into your chat box. You edit it and send it yourself. Every change happens in the chat, so swipes and deletes stay consistent.

### Making your student

Before your first action you fill in your student file in the **Builder**:

- Your **mana capacity** is a slider from 50 to 1,000, and you can type a bigger number. **Overpowered is allowed.** Nobody can read your capacity off you, and the world reacts to what you *show*. It never quietly weakens you.
- Your **techniques** have fixed costs (per use, per minute, or both), and the engine charges them. The narrator never guesses how much mana you have left.
- **Pacts** have partners with their own moves, like a creature in a party. Only a spirit pact is legal. Everything else is up to you.
- **Hidden magic** is optional: a true power, a cover story, and how you hide it. Use it where people can see and the Doves start paying attention.

The Arbiter Stone only reads your *dominant type*. It can't see subtypes, and it can't tell whether your magic is forbidden.

### Bonds

This is the heart of the card. The 44 roster NPCs you meet can have a **bond from Rank 0 to 10**. Real conversation, time together, gifts and genuine help fill an XP bar within daily and weekly limits. Once the bar is full, the next genuine interaction deepens the bond by one rank when cooldown, Trust and Tension allow it. There is no required rank-up event or level announcement in the story. Narrator-created Extras and rival teams have no bond system.

- Rank 2 gives a little extra bond XP for the first invited hangout they accept each week. At Rank 4, active shared mana training, stamina training or study gets a modest bonus where that NPC can help; their dossier shows their categories.
- **Rank 5** can bring that person's **gift**: something you can't buy anywhere, like a map of hidden passages, a pardon, or a training drill book.
- At **Rank 6**, a real introduction by this person starts a new roster NPC at Rank 1. At **Rank 7**, they may escort you into their dorm or, if staff, receive a spontaneous worksite visit. At **Rank 8** the bond becomes something: a best friendship always, and for some people a romance or a sworn rivalry. Not everyone allows all three, and their dossier tells you which ones they do.
- At **Rank 9**, someone who knows the facts may publicly vouch for you once a month, softening one related reputation loss. **Rank 10** brings a **lasting benefit**: a teammate, a monthly share, a favour with the staff.
- A few people wear a mask. Their bond **stalls at Rank 8** until you've found out, in the story, what they're hiding.

Dossiers fill in as bonds deepen. Open people share early and guarded people share late, and if you push too soon they'll deflect. At the pace I'd call standard, one bond takes about a semester to max out. You can speed that up or slow it down in Settings.

!!! warning No routes, no endings
    High ranks unlock information, never an ending. There's no "good end" and no "true route". It's a campus, and it keeps going.

### Tension and Trust

Every bond also has a **Tension** meter and a **Trust** meter.

**Tension** goes up when you insult someone, cheat them or hit them, and it goes down slowly on quiet days or faster with an apology, depending on who you're apologising to. Gentle people forgive quickly. Proud people want it said in public. Fighters would rather settle it in a fight. Some people hold grudges on principle. At high Tension the bond stops growing, and at the top it drops a rank. **Tension rises are never capped.** It's easier to make enemies than friends, the same as in real life.

**Trust** only rises from what you *do*: keeping a secret, standing up for someone, keeping a promise. Talking doesn't raise it. Trust decides what people will tell you and when their relationship can deepen.

### Reputation

You have three standings, from −5 to +5: **Academy** (the staff), **Student** (everyone else) and **Doves**. They pull against each other. Report a classmate and the staff or the Doves will like you more, and the students won't forget. Academy +5 puts your portrait in the Portrait Hall. Academy −5 puts you on probation.

### A campus that keeps moving

- **Time and classes.** Every reply moves the clock forward. During class periods, students are *in class*, so the library at 09:00 on a Monday is empty. On Saturday afternoon everyone is at their club.
- **Weather.** Real northern seasons, in °C. The sky changes through the day, with rare storms, hail, blizzards and fog. Stay out in the rain and you get *Soaked*, which might turn into a head cold. The **Divination Society** posts tomorrow's forecast on the Notice Board every morning, and it's right about three times in four.
- **Gossip.** Rumours spread outward: first the witnesses, then their dorm and club, then the whole campus, then it's old news. Some die out on their own.
- **Happenings.** Some days bring something small: a paid job posting, a Dove sweep, a loose creature, a duel challenge. You can go or not.
- **People come looking for you.** Once a bond reaches Rank 3, that person might seek you out on some days, in whatever way suits them.
- **Your body.** HP measures injury, not a video-game health bar. Every loss has a named injury. One blow can't take more than 40 HP unless it's actually lethal, and nothing heals off-screen.
- **Training.** Drill your mana pool or your stamina. There's a weekly cap and a lifetime cap, and a steady student reaches the cap in about a school year.
- **The Bag.** What you buy, find and keep. Sunfizz bottles are returnable for 2 points each.

Almost all of this can be switched off. **Student file → Settings → Features** lists each module with its token cost. A module you switch off is set aside, not deleted, and comes back when you switch it on again.

***

## The People

Fifty-six named characters, each with their own voice. What's below is what you'd know about them in your first week. The rest you'll have to earn.

### Your seniors (Year 3)

![Irene](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/irene.webp#left){88px:88px}
**Irene Chanare** · *Light · Student Council President*
Runs the Council like a well-kept ledger. Admirers call her the ice queen, the staff call her dependable, and her family writes to her every single week. She cleans her room every morning. She was a first-year on the breach night.

> "Curfew was twenty minutes ago. I'll note it, and you'll thank me for the reminder when it matters."

!;

![Caspian](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/caspian.webp#left){88px:88px}
**Caspian Riwalo** · *Viridian · Elf · Council Vice President*
He runs the festivals and pulls people in from the edges of groups, and he's excellent with a rapier. His magic doubles someone else's power for one minute, with a hand on their shoulder. He's affable right up until Krieg Valforth comes up.

> "Krieg Valforth is within his authority. So, as it happens, am I."

!;

![Etnie](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/etnie.webp#left){88px:88px}
**Etnie** · *Viridian · dog Beastkin · your "big sister"*
She has decided she's your big sister. You don't get a vote. She's the one person whose bond starts at Rank 3 the moment you meet. She'll find you anywhere by scent, feed you off her own plate, and step between you and anyone who gets too close. Watch her when you're not in the room.

> "Hi! I'm the big sister. And you are?"

!;

![Royhan](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/royhan.webp#left){88px:88px}
**Royhan Filanoman** · *Sky · goat Beastkin · alchemist*
Quiet, patient, and the one who notices when his friends haven't eaten. His shirts are mended with his own sewing kit. He won't take charity, but he'll always take work. People whisper that his horns look like something from the Crack.

> "That's kind. No."

!;

![Ruby](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/ruby.webp#left){88px:88px}
**Ruby Bonbon** · *Sky · rabbit Beastkin*
Kind to everyone without calculating it, carries a tin of sweets, and has a small fairy spirit nesting in her hair. She plays guitar at the back of the Music Club and is perfectly happy there. She's in her last year and would like to get through it without ever having to pick a side.

> "How was your week? Really, though."

!;

![Gareth](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/gareth.webp#left){88px:88px}
**Gareth Valkaryn** · *Fire · Elf · Rank #1*
The perfect honour student: soft-spoken, first to help, glasses always on. He's never lost a match at the Board Game Club, and he's beaten Sophia in the Fire Dorm final two years running. In a fight the glasses come off and his fire turns into wings and a crown. His dossier calls all of this his *daily* personality.

> "You're very kind. Sophia made me work for every second of it."

!;

![Sophia](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/sophia.webp#left){88px:88px}
**Sophia Helfin** · *Fire · Rank #2 · "Blood Saint"*
A water mage with frightening affinity, a grin people remember, and a lot of tactics books. She despises cowards and weak nobles, and her dorm-mate Caralynn is both, as far as she's concerned. She keeps her word. She wants Gareth, the World Competition, and a Doves cloak, in that order.

> "THERE you are. Again."

!;

### The middle years (Year 2)

![Florian](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/florian.webp#left){88px:88px}
**Florian Villeneuve** · *Sky · Rank #3 · Council member*
Rich, handsome, a flirt who commits to nobody, and he'll tell you so himself. His pact is with Hades, a huge black wolf covered in eyes that don't blink in sync. He's generous with money and stingy with sincerity, except with anyone who beats him at something.

> "Again. No, I mean it. Again."

!;

![Dante](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/dante.webp#left){88px:88px}
**Dante Kleinn** · *Light · Council member*
Fatherly and warm. He remembers exactly which part of the spell you got stuck on last week. As long as he's touching someone, they can't cast. When he decides you're a criminal, the warmth switches off at once.

> "You knew the rule. Now you'll learn the rest of it."

!;

![Lenna](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/lenna.webp#left){88px:88px}
**Lenna Greenwind** · *Fire · Elf · earth mage*
Sleepy, dry, and fond of naps, romance novels and anything cute. She once missed a class chasing a rabbit. Ask her something personal and suddenly it's nap o'clock. Push a first-year around in front of her and the flagstones under your feet will move.

> "Put him down."

!;

![Saffi](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/saffi.webp#left){88px:88px}
**Saffi Tamberlane** · *Viridian · cat Beastkin*
Grew up with a travelling caravan, fights with spirit claws, and believes exercise fixes everything. She wants to join the Doves for the pay. She is loyal to Lenna to the bone.

> "You know what fixes that? Laps!"

!;

![Kanae](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/kanae.webp#left){88px:88px}
**Kanae Quveno** · *Light · Elf · Divination Society*
Sweet, popular, top grades: the perfect student. She wants to read everyone's fortune before she graduates. If someone flirts with you in front of her, she offers them a free reading.

> "Oh, would you like a reading? It's free. I think you'll find it very interesting."

!;

![Idris](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/idris.webp#left){88px:88px}
**Idris Ainsworth** · *Sky · snake Beastkin*
Sardonic, and the best haggler in the Sky trio. He reads in whatever warm spot he can find, and his pact spirit is a wraith that drains the stamina of anyone it passes through. He spent a week in the Dovecote once and stopped apologising for existing after that.

> "Yes, they're real. Would you like an appraisal as well?"

!;

![Tilly](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/tilly.webp#left){88px:88px}
**Tilly Marsh** · *Fire · wood mage*
She walks toward every strange noise, and flowers open around her when she gets excited. She's baffled by queues and delighted to do her own laundry. She joined the Library Assistants for the Archive access, because she wants to solve every mystery at Halvard before she graduates.

> "Of course." *(She goes anyway.)*

!;

### Your year (Year 1)

![Aiden](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/aiden.webp#left){88px:88px}
**Aiden Ruzzo** · *Light · prankster, bookie*
He can walk through walls and shrink things, and he uses both to break curfew and smuggle goods. He's a gifted liar and cheerful even when he's caught. He has one rule he never breaks: he doesn't cheat friends.

> "Now that is a face I can do business with. Ten percent, and I'm robbing myself."

!;

![Caralynn](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/caralynn.webp#left){88px:88px}
**Caralynn Veyturone** · *Fire · ice mage · lead singer*
Vain and proud, and "everyone's friend" in her own mind. She boasts in the middle of casting. She's also a genuinely, unfairly good singer, and that's the one thing people admire her for that she actually earned.

> "Naturally." *...then, quieter:* "You heard the second verse? That's the hard one."

!;

![Zara](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/zara.webp#left){88px:88px}
**Zara Minallone** · *Sky · Elf · talisman writer*
Very tall for an elf, and always hunched to hide it. She fights with paper charms, designs clothes she won't admit are hers, and lights up when someone asks about stroke order, until she notices everyone listening.

> "...Sorry. It's boring."

!;

![Percival](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/percival.webp#left){88px:88px}
**Percival Applethorne** · *Viridian · healer · legendary knight (in his own head)*
He remembers heroic deeds you both did together, none of which happened, and he'll knight you with a spoon. He heals by touch, and he pays for every wound he closes with his own strength. When you actually get hurt, the stories stop.

> "Remember when we saved the Canteen from the cursed pudding? No? Modest! The Brotherhood needs modest!"

!;

![Trixie](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/trixie.webp#left){88px:88px}
**Trixie Confetti** · *Fire · fox Beastkin · Theatre Troupe*
Light magic, glitter, and no sense of the room. She wants to make everyone happy, she means it completely, and she causes trouble roughly every hour doing it.

> "You have a face like a rained-on tent! No. Nope. Stay right there—"

!;

![Vera](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/vera.webp#left){88px:88px}
**Vera Pulsar** · *Viridian · horse Beastkin · mad scientist*
She cuts her own hair and there's always a burn mark on her somewhere. She can give you a full night's sleep in an hour, and she's the one who ends up tired. She wants to know *why* magic works, not just how to cast it.

> "Wait wait wait, do that again? Slower? No, the same speed, slower changes the— here, hold this."

!;

![Castor](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/castor.webp#left){88px:88px}
**Castor Moretti** · *Viridian · Academy Newspaper*
Quiet, pleasant, and forgotten the moment he leaves the room. He's never tried to change that. Being a student reporter gives him a reason to ask anyone about anything.

> "Honestly? For the library to stay open later." *A perfectly normal answer.*

!;

![Alyssa](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/alyssa.webp#left){88px:88px}
**Alyssa Edelweiss** · *Sky · Drawing Club*
Quiet and observant, with a small leather notebook always in her hand. Her pact is one no first-year should be able to hold, and very little surprises someone who has already seen the next five minutes. Her story is a gentle, sad one.

> "It says here that I like you." *A pause.* "I believe it."

!;

### The staff

![Baelin](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/baelin.webp#left){88px:88px}
**Baelin Kalvor** · *Headmaster · Elf*
He's run Halvard for forty years and knows every student's name. His tea always goes cold before he drinks it. Bring him a complaint and he'll answer with a story about a 300-year-old border treaty, and by the end you'll have your answer without quite knowing when you got it. He keeps favours and debts like entries in a ledger.

!;

![Althair](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/althair.webp#left){88px:88px}
**Althair Veyne** · *Vice Headmaster*
He's in his late twenties, which is absurd for the job. He wears the loudest clothes he owns to every occasion, funerals included. His good cheer is real, and he's happiest when you hate him. Ask him where he grew up and you'll get a different answer every week.

> "Oh, wonderful. Go on. Which part do you dislike most?"

!;

![Rei](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/rei.webp#left){88px:88px}
**Rei Kestrane** · *Acting Warden of the Crack*
She's rarely without a cigarette, wears a coat with a red lining, and is a sword saint who never trained with a sword. She answers to no one, which is exactly why the crown won't confirm her as full Warden. Ask her about the breach night and she'll light a new cigarette from the old one, and that's all you'll get.

> "Go back."

!;

![Gavlan](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/gavlan.webp#left){88px:88px}
**Gavlan Haverton** · *Combat, Year 1 · Elf*
He's 634 years old and still vigorous. He's a gravity mage, and the ground near him never weighs quite what it should. He's harsh and fair, and he keeps a private stash of firewine in his office. Don't ask him about the war.

> "Feet. Again."

!;

![Yvette](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/yvette.webp#left){88px:88px}
**Yvette Fallaron** · *Magic Theory, Year 1 · Fire Dorm Head*
Motherly, a little paranoid, and a lightning mage. Bring her an enchanted trinket and she'll lose three hours to it. There's an Oath she'd like to be released from.

> "That's very sweet. Find someone your own age."

!;

![Layla](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/layla.webp#left){88px:88px}
**Layla Palegleam** · *History, Year 1*
Every answer takes three detours on the way, and it's always exactly right. She's a sand mage and wears gloves she almost never takes off. She hasn't used her magic in anger for twenty years. She'd like to teach the Archmage's lost name properly one day.

!;

![Vallie](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/vallie.webp#left){88px:88px}
**Vallie Goredust** · *Creature Studies, Year 1 · ex-monster hunter*
An ox Beastkin who ducks through every doorway. She has an eyepatch, and a different story about it every time. Her lectures last about four minutes before she marches the class out to the Menagerie. She was hired after the breach.

> "The cocky ones die first. You want to be first?"

!;

![Kuroo](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/kuroo.webp#left){88px:88px}
**Kuroo Varnell** · *Etiquette, Year 1 · Viridian Dorm Head*
A provocation expert who plays the most insufferable noble imaginable in his mock receptions, just to see who keeps their composure. He's kinder than he looks, and he secretly loves dancing. Needling Krieg is his hobby.

!;

![Mimosa](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/mimosa.webp#left){88px:88px}
**Mimosa Linden** · *Potion Crafting, Year 1*
The youngest teacher on staff, and painfully shy. She sometimes teaches from inside a cupboard. Knock on her door and nobody answers, but by morning there'll be a neat four-page answer under it, with an apology for the length.

!;

![Ezrel](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/ezrel.webp#left){88px:88px}
**Ezrel Marionne** · *Magic Theory, Year 2 · Light Dorm Head*
A golem-maker unlike anyone else in the kingdom. He plays the theatrical teacher at full volume with a face that doesn't move. Every staff roll in the Archive, going back to the founding, lists an Ezrel Marionne as Light Dorm Head. Ask him and he'll say that was him.

> "And enter, stage left, our late arrival." *A pause.* "This is the part where you laugh."

!;

![Ottavio](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/ottavio.webp#left){88px:88px}
**Ottavio Bastiani** · *Etiquette, Year 3 · Sky Dorm Head*
Bald, built like a harbour bollard, rarely without his dark glasses. Students are terrified of him for about a week. Then they notice the plate waiting at the seat of whoever has been skipping breakfast. When the Doves come to the Sky Dorm, he's already standing in the doorway.

> "Morning."

!;

### From outside the walls

![Krieg](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/krieg.webp#left){88px:88px}
**Krieg Valforth** · *Commander of the Dovecote*
Courteous, clever, and a bully. His magic cancels other people's spells. The Headmaster has no authority over him. Your bond with him isn't built the usual way: it moves on its own each week, and only while the Doves think well of you.

> "A moment of your time, if you would be so kind."

!;

![Milena](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/milena.webp#left){88px:88px}
**Milena Sagona** · *Senior Dove · Dark Magic Defense*
Krieg's second, and the warmest person in the white cloaks. She believes most people turn to forbidden magic out of fear and loneliness, so she tries to reach them first, usually with warm flatbread. Her pact spirit is a knight in white armour that most spells simply break against.

!;

![Tristan](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/tristan.webp#left){88px:88px}
**Tristan Aurelle** · *Cathedral Steward*
He keeps the register of every oath sworn on academy grounds, and he breaks curses. He jokes during serious business and gets serious during jokes. Ask him a straight question and he'll answer with a better one, and a minute later you'll have decided something you didn't mean to decide.

!;

![Caine](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/caine.webp#left){88px:88px}
**Caine Strix** · *Butler of the Noble Houses' Liaison · owl Beastkin*
A flawless butler who moves without a sound, and whose head turns further than it should. He's exactly as warm as the words require and not one degree warmer. There's one thing he loves: the moment something proud breaks.

> "Young master is kind."

!;

![Bobby](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/bobby.webp#left){88px:88px}
**Bobby "BB" Becket** · *Maintenance · not a mage*
Sawdust, a tool belt, and a deck of cards tucked in with the tools. He remembers every instalment of your drama and asks for updates while he fixes your window. He's working on a stage illusion that can fool a room full of trained mages.

> "So. Did they ever give the scarf back?"

!;

### The rival academies

You can't bond with the other three academies' competition teams. They're there to be beaten, feared, or grudgingly respected.

| | Name | Academy | In one line |
|---|---|---|---|
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/lucius.webp){56px:56px} | **Lucius Vortigern** | Myrdath | Friendly, remembers your name, always smiling, with eyes that have nothing behind them. Rank 1 |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/ines.webp){56px:56px} | **Ines Vauclair** | Myrdath | Captain. Crystal magic, a face that almost never moves, a plan for everything |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/bram.webp){56px:56px} | **Bram Holloway** | Myrdath | A gentle bear who carries small animals out of the way before a fight |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/dex.webp){56px:56px} | **Dex Harlow** | Myrdath | A delinquent healer who's furious about how good he is at it |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/bellatrix.webp){56px:56px} | **Bellatrix Ardenne** | Veyra | Has mastered four subtypes. Laughs while her body is torn apart and rebuilt. Rank 1 |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/cassius.webp){56px:56px} | **Cassius Rhavel** | Veyra | Captain. The ultimate straight man, one twitch away from strangling his own team |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/morgana.webp){56px:56px} | **Morgana Vess** | Veyra | "Nocturne, heiress of the Archmage." Wears an eyepatch over a perfectly healthy eye. Works harder than anyone |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/pip.webp){56px:56px} | **Pip Althorne** | Veyra | A healer and a complete coward, and not the noble kind |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/elion.webp){56px:56px} | **Elion Villeneuve** | Ashvale | Florian's younger brother. Anything he holds becomes an Excalibur. Rank 1 |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/kira.webp){56px:56px} | **Kira Brannock** | Ashvale | A metal mage who's quick to shout and quicker to swing, and fiercely loyal |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/mirelle.webp){56px:56px} | **Mirelle Lullwyn** | Ashvale | Always asleep. When a friend is in real trouble, she's awake and already there |
| ![](https://cdn.jsdelivr.net/gh/pizzatuna65-jpg/eldrasil-assets@4b6a10d6b91bd5feaf1509e7876c13e09f88bc2f/thumbs/theodore.webp){56px:56px} | **Theodore Wrenfield** | Ashvale | Cheerful, formal and fatherly. He heals by *sharing* the wound |

### Arriving next year

In your second year, six new first-years come through the gate. They have voices, stories and portraits already.

- **Linus Tallyworth** · *Viridian.* He can see how much mana you have and writes *the Tally*, a power ranking of everyone at Halvard, staff included. *"Feats, not claims!"*
- **Maple Fernhollow** · *Sky · red panda.* The shortest first-year, and the gentlest. Her pact spirit is a white beast the size of a house.
- **Nerys Silvarenne** · *Fire · Elf.* Completely deadpan. She picks up a new bizarre hobby every week, and has been planning one perfect prank for three years. *"Listening to the moss. It has opinions."*
- **Hadrian Quelloris** · *Light · Elf.* A brilliant golem-maker and a coward, and he'll lecture you on teamwork on his way out the far door.
- **Wren Marlowe** · *Fire.* Deaf and warm, a precise fire mage in the Fishing Club, who'd like to get through one week without writing "sorry".
- **Tsubaki Hoshikage** · *Light · wolf.* A sword genius who leaves stars hanging where her blade passes. She has never once found the Canteen on the first try.

***

## Getting in

1. Import **`Eldrasil_Halvard.png`** as a character.
2. When SillyTavern asks whether to import the **embedded lorebook, say yes.** The card needs it, including a small entry that tells MVU how to run.
3. When Tavern Helper asks, **allow the card's scripts** (MVU, Schema, Engine, Eldrasil UI).
4. **Don't** also enable a standalone Eldrasil lorebook. The card already carries the merged one.
5. Start a new chat. Press **Create your student** on the bracelet (or the **Builder** button under the chat box), fill in your file, register, and write your first action.

!!! note Preset
    The card doesn't set prose style, point of view or length. Your preset does, so bring whichever one you like. A compatible Gemini-tuned edit of **Realistic Frankenstein 2.2** ships alongside the card. With it, you write what your student says and tries, and the world decides whether it works. If your preset has its own trackers (relationship meters, GM notebooks, world sims), switch them off. The card is the only tracker.

!!! note Memory
    The narrator reads about the last 24 messages. The rest is carried by the game state: the journal, facts for each bond, campus news, promises and clues. It works with **VectFox** as chat memory. Just don't vectorise the card's own lorebook.

**If something looks wrong:**
- **No bracelet:** Tavern Helper is off, or the card's scripts weren't allowed.
- **A raw `<UpdateVariable>` block, or nothing changes:** MVU didn't load (first load needs internet) or the model broke the format. Swipe once.
- **Visible `<%` code in the prompt:** the Prompt Template extension is missing or off.
- **Time went backwards, a rank reverted, damage was capped:** that's the engine doing its job. **Student file → Log** says what it did and why.

***

## Advice from a third-year

- The Canteen is free. The Mall isn't. Your first month's 300 points go faster than you'd think.
- Check the **Notice Board** in the morning if you care about the weather. The bracelet won't tell you.
- Curfew is 20:00. The Doves walk the paths, and so do stories about people who answered to their name.
- Club registration closes on the Friday of the first week. Don't dither.
- If someone offers to show you the Rooftop, say yes. It means they've decided you belong.
- Stay away from the corridor that runs cold. You'll know which one.
- Be nice to Bobby. He fixes your window, and he knows everything.

-> *See you at the Entrance Event. Nine o'clock, Arbiter Hall. The Stone is warmer than you'd expect.* <-

***

-> Card v1.7.8 · Made for SillyTavern · Feedback and bug reports: CONTACT_LINK <-
