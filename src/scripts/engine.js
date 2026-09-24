// Eldrasil / Halvard — game engine (Batch 2.3; 3.2: read-only guard, hybrid trigger cost, per-turn toasts). Runs after every MVU update; deterministic and replay-safe:
// everything is computed from (state before, state after) only. Internals live in stat_data.$eng (hidden from the AI).
const NPC_ALIAS = {"irene":"Irene","irene chanare":"Irene","chanare":"Irene","caspian":"Caspian","caspian riwalo":"Caspian","riwalo":"Caspian","etnie":"Etnie","etnera":"Etnie","royhan":"Royhan","royhan filanoman":"Royhan","roy":"Royhan","filanoman":"Royhan","lenna":"Lenna","lenna greenwind":"Lenna","greenwind":"Lenna","saffi":"Saffi","saffi tamberlane":"Saffi","saffranelle":"Saffi","tamberlane":"Saffi","kanae":"Kanae","kanae quveno":"Kanae","quveno":"Kanae","idris":"Idris","idris ainsworth":"Idris","ainsworth":"Idris","aiden":"Aiden","aiden ruzzo":"Aiden","ruzzo":"Aiden","caralynn":"Caralynn","caralynn veyturone":"Caralynn","cara":"Caralynn","veyturone":"Caralynn","zara":"Zara","zara minallone":"Zara","minallone":"Zara","gavlan":"Gavlan","gavlan haverton":"Gavlan","haverton":"Gavlan","yvette":"Yvette","yvette fallaron":"Yvette","fallaron":"Yvette","krieg":"Krieg","krieg valforth":"Krieg","valforth":"Krieg","milena":"Milena","milena sagona":"Milena","sagona":"Milena","baelin":"Baelin","baelin kalvor":"Baelin","kalvor":"Baelin","headmaster kalvor":"Baelin","headmaster":"Baelin","layla":"Layla","layla palegleam":"Layla","palegleam":"Layla","vallie":"Vallie","vallie goredust":"Vallie","goredust":"Vallie","deathaxe":"Vallie","percival":"Percival","percival applethorne":"Percival","percy":"Percival","applethorne":"Percival","sophia":"Sophia","sophia helfin":"Sophia","helfin":"Sophia","rei":"Rei","rei kestrane":"Rei","kestrane":"Rei","acting warden":"Rei","halvard warden":"Rei","kuroo":"Kuroo","kuroo varnell":"Kuroo","varnell":"Kuroo","mimosa":"Mimosa","mimosa linden":"Mimosa","linden":"Mimosa","gareth":"Gareth","gareth valkaryn":"Gareth","valkaryn":"Gareth","lucius":"Lucius","lucius vortigern":"Lucius","vortigern":"Lucius","trixie":"Trixie","trixie confetti":"Trixie","confetti":"Trixie","vera":"Vera","vera pulsar":"Vera","pulsar":"Vera","tristan":"Tristan","tristan aurelle":"Tristan","aurelle":"Tristan","althair":"Althair","althair veyne":"Althair","veyne":"Althair","vice headmaster":"Althair","dante":"Dante","dante kleinn":"Dante","kleinn":"Dante","castor":"Castor","castor moretti":"Castor","moretti":"Castor","ruby":"Ruby","ruby bonbon":"Ruby","bonbon":"Ruby","florian":"Florian","florian villeneuve":"Florian","elion":"Florian","elion villeneuve":"Elion","bellatrix":"Bellatrix","bellatrix ardenne":"Bellatrix","kira":"Kira","kira brannock":"Kira","brannock":"Kira","mirelle":"Mirelle","mirelle lullwyn":"Mirelle","lullwyn":"Mirelle","theodore":"Theodore","theodore wrenfield":"Theodore","wrenfield":"Theodore","theo":"Theodore","ines":"Ines","ines vauclair":"Ines","vauclair":"Ines","bram":"Bram","bram holloway":"Bram","holloway":"Bram","dex":"Dex","dex harlow":"Dex","harlow":"Dex","cassius":"Cassius","cassius rhavel":"Cassius","rhavel":"Cassius","morgana":"Morgana","morgana vess":"Morgana","vess":"Morgana","nocturne":"Morgana","pip":"Pip","pip althorne":"Pip","althorne":"Pip","alyssa":"Alyssa","alyssa edelweiss":"Alyssa","edelweiss":"Alyssa","tilly":"Tilly","tilly marsh":"Tilly","marsh":"Tilly","ottilie":"Tilly","ezrel":"Ezrel","ezrel marionne":"Ezrel","marionne":"Ezrel","ottavio":"Ottavio","ottavio bastiani":"Ottavio","bastiani":"Ottavio","caine":"Caine","caine strix":"Caine","strix":"Caine","liaison butler":"Caine","bobby":"Bobby","bobby becket":"Bobby","bb":"Bobby","becket":"Bobby"};
const NPC_IDS = new Set(Object.values(NPC_ALIAS));
// proper-case name forms (first name, full name, nickname) matched case-sensitively in story prose
const NAME_FORMS = {"Irene":["Irene Chanare","Irene"],"Caspian":["Caspian Riwalo","Caspian"],"Etnie":["Etnie"],"Royhan":["Royhan Filanoman","Royhan"],"Lenna":["Lenna Greenwind","Lenna"],"Saffi":["Saffi Tamberlane","Saffi"],"Kanae":["Kanae Quveno","Kanae"],"Idris":["Idris Ainsworth","Idris"],"Aiden":["Aiden Ruzzo","Aiden"],"Caralynn":["Caralynn Veyturone","Caralynn"],"Zara":["Zara Minallone","Zara"],"Gavlan":["Gavlan Haverton","Gavlan"],"Yvette":["Yvette Fallaron","Yvette"],"Krieg":["Krieg Valforth","Krieg"],"Milena":["Milena Sagona","Milena"],"Baelin":["Baelin Kalvor","Baelin"],"Layla":["Layla Palegleam","Layla"],"Vallie":["Vallie Goredust","Vallie"],"Percival":["Percival Applethorne","Percival"],"Sophia":["Sophia Helfin","Sophia"],"Rei":["Rei Kestrane","Rei"],"Kuroo":["Kuroo Varnell","Kuroo"],"Mimosa":["Mimosa Linden","Mimosa"],"Gareth":["Gareth Valkaryn","Gareth"],"Lucius":["Lucius Vortigern","Lucius"],"Trixie":["Trixie Confetti","Trixie"],"Vera":["Vera Pulsar","Vera"],"Tristan":["Tristan Aurelle","Tristan"],"Althair":["Althair Veyne","Althair"],"Dante":["Dante Kleinn","Dante"],"Castor":["Castor Moretti","Castor"],"Ruby":["Ruby Bonbon","Ruby"],"Florian":["Florian Villeneuve","Florian"],"Elion":["Elion Villeneuve","Elion"],"Bellatrix":["Bellatrix Ardenne","Bellatrix"],"Kira":["Kira Brannock","Kira"],"Mirelle":["Mirelle Lullwyn","Mirelle"],"Theodore":["Theodore Wrenfield","Theodore"],"Ines":["Ines Vauclair","Ines"],"Bram":["Bram Holloway","Bram"],"Dex":["Dex Harlow","Dex"],"Cassius":["Cassius Rhavel","Cassius"],"Morgana":["Morgana Vess","Morgana"],"Pip":["Pip Althorne","Pip"],"Alyssa":["Alyssa Edelweiss","Alyssa"],"Tilly":["Tilly Marsh","Tilly"],"Ezrel":["Ezrel Marionne","Ezrel"],"Ottavio":["Ottavio Bastiani","Ottavio"],"Caine":["Caine Strix","Caine"],"Bobby":["Bobby Becket","Bobby","BB"]};
const NAME_RX = Object.entries(NAME_FORMS).map(([id, forms]) => [id, new RegExp('(^|[^A-Za-z])(' + forms.map(f => f.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z])')]);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_MIN = 1440, YEAR_DAYS = 12 * 4 * 7;
const ALL = DAYS, MON_THU = DAYS.slice(0, 4), MON_FRI = DAYS.slice(0, 5), MON_SAT = DAYS.slice(0, 6);
const EVENTS = [
  { m: 1, w: 1, d: ['Mon'], t: 'Entrance Event (Arbiter Stone sorting)', noclass: 1 },
  { m: 1, w: 3, d: ['Sat', 'Sun'], t: 'Star Night (Sat evening to Sun dawn; no 8pm curfew)', nocurfew: 1 },
  { m: 1, w: 4, d: ['Sat'], t: 'Spiritual Dorm Day' },
  { m: 2, w: 1, d: ['Fri', 'Sat'], t: 'Warding Rite (Fri dusk to Sat dawn; the whole academy renews the wards)' },
  { m: 2, w: 3, d: ['Wed', 'Thu', 'Fri'], t: 'Creature Studies Expedition (off-grounds, Grade III country)', noclass: 1, away: 1 },
  { m: 3, w: 1, d: MON_THU, t: 'Midterm exams', noclass: 1 },
  { m: 3, w: 2, d: ['Fri', 'Sat'], t: 'Club Festival' },
  { m: 3, w: 3, d: MON_SAT, t: 'Training Week (cross-dorm sparring allowed; curfew 21:00)', curfew: 21 },
  { m: 3, w: 4, d: ['Sat', 'Sun'], t: 'Dorm Competition (solo, top 16 qualify)', noclass: 1 },
  { m: 4, w: 1, d: ['Wed'], t: 'Secret Fools Day (prank day, dorm name-draw)' },
  { m: 4, w: 2, d: ['Tue'], t: 'Independence Crowning Day (airship trip to the capital; fireworks on campus at night; curfew 22:00)', noclass: 1, curfew: 22, away: 1 },
  { m: 4, w: 3, d: ['Sat'], t: 'Mystic Dorm Day' },
  { m: 5, w: 1, d: MON_THU, t: 'End of Semester exams', noclass: 1 },
  { m: 5, w: 2, d: ['Fri'], t: 'Results & Dorm Ranking (Player.Profile.Dorm_rank is updated today)', ranking: 1 },
  { m: 5, w: 4, d: ALL, t: 'Mid-Year Break (students go home)', home: 1 },
  { m: 6, w: 1, d: MON_FRI, t: 'Return Week' },
  { m: 6, w: 3, d: ['Sat'], t: 'Sports Day (magic banned outright)' },
  { m: 6, w: 4, d: ['Wed', 'Thu', 'Fri', 'Sat'], t: 'Academy Competition (cross-dorm teams of 4)' },
  { m: 7, w: 2, d: ALL, t: 'Magical & Science Fair week' },
  { m: 7, w: 3, d: ALL, t: 'The Thinning: the seal is at its weakest; academy locked down all week', lockdown: 1 },
  { m: 8, w: 2, d: ['Thu', 'Fri', 'Sat', 'Sun'], t: 'Traveling Circus visits (Thu evening to Sun)' },
  { m: 8, w: 3, d: ['Thu', 'Fri', 'Sat'], t: 'Academy Showcase' },
  { m: 8, w: 4, d: ['Sat'], t: 'Elemental Dorm Day' },
  { m: 9, w: 1, d: MON_THU, t: 'Midterm exams', noclass: 1 },
  { m: 9, w: 2, d: ['Thu', 'Fri', 'Sat'], t: 'Academy Bazaar' },
  { m: 9, w: 3, d: ['Sat'], t: 'Academy Founder Day' },
  { m: 9, w: 4, d: ['Thu', 'Fri', 'Sat', 'Sun'], t: 'Kingdom Competition (four academies, one team each)' },
  { m: 10, w: 1, d: ['Tue'], t: 'Remembrance Day' },
  { m: 10, w: 2, d: ['Sat'], t: 'Occult Dorm Day' },
  { m: 10, w: 4, d: ['Fri', 'Sat', 'Sun'], t: 'Harvest Festival (Fri evening to Sun)' },
  { m: 11, w: 1, d: MON_THU, t: 'End of Semester exams', noclass: 1 },
  { m: 11, w: 2, d: ['Fri'], t: 'Results & Final Ranking (Player.Profile.Dorm_rank is updated today)', ranking: 1 },
  { m: 11, w: 3, d: ['Mon', 'Tue', 'Wed'], t: 'Academy Trip (Sunreach Bay, abroad)', noclass: 1, away: 1 },
  { m: 11, w: 4, d: ['Wed', 'Thu', 'Fri', 'Sat'], t: 'World Competition abroad (the national four)', away: 1 },
  { m: 11, w: 4, d: ['Sun'], t: 'Graduation (everyone attends; third-years leave by airship next morning)', noclass: 1, grad: 1 },
  { m: 12, w: 1, d: ALL, t: 'Kingdom-wide holiday: students go home', home: 1 },
  { m: 12, w: 2, d: ALL, t: 'Kingdom-wide holiday: students go home', home: 1 },
  { m: 12, w: 3, d: ALL, t: 'Kingdom-wide holiday: students go home', home: 1 },
  { m: 12, w: 4, d: ALL, t: 'Kingdom-wide holiday: students go home', home: 1 },
];
const TIMETABLE = {
  Mon: ['Magic Theory [M]', 'History [M]', 'Combat [D] (Combat Grounds)'],
  Tue: ['Dark Magic Defense [D]', 'Magic Theory [D]', 'Potion Crafting [M] (Potion Halls)'],
  Wed: ['Etiquette [M]', 'Dark Magic Defense [M]', 'Creature Studies [M] (Menagerie or Forest)'],
  Thu: ['History [M]', 'Magic Theory [D]', 'Combat [D] (Combat Grounds)'],
  Fri: ['Magic Theory [M]', 'Etiquette [M]', 'Dark Magic Defense practical [D] (Doves; Combat Grounds or warded seminar room)'],
  Sat: ['Etiquette [M]', 'Study Hall (unsupervised, Main Library)', 'Clubs (club venues)'],
};
// monthly payout by dorm rank (lore: 300 bottom band ... 3,000 for rank 1). Bands between are tunable.
const PAYOUT = [[1, 3000], [3, 2000], [10, 1200], [25, 800], [50, 500], [Infinity, 300]];
const DAILY_BOND_CAP = 3;   // before 1.2.2 only (Progress); the XP system reads data/bond_rules.json
// 1.2.2 bond system (owner design): XP per kind of interaction with daily/weekly limits, rising XP per rank scaled by the pace
// setting, a cooldown after each rank, a bond event to rank up (scripted in data/bond_events.json, else the rank's default theme).
const BR = {"_note":"1.2.2 bond system, single source for the engine (tools/gen_engine.py), the UI (tools/gen_ui.py) and the Now entry (tools/gen_mvu_entries.py). Edit here, then rebuild. xp_base[r] = XP from Rank r to Rank r+1 at standard pace; cool_base[r] = days after reaching Rank r before its next bond event can start. pace multiplies both (full rank: fast ~1 month, brisk ~2 months, standard ~1 semester, slow ~1 year of diligent play).","xp_base":[10,20,30,40,50,55,60,65,70,80],"cool_base":[0,1,2,3,3,4,5,6,7,7],"pace":{"fast":0.25,"brisk":0.5,"standard":1,"slow":2.5},"pace_labels":{"fast":"Fast (~1 month)","brisk":"Brisk (~2 months)","standard":"Standard (~1 semester)","slow":"Slow (~1 year)"},"kind_xp":{"talk":2,"hangout":3,"help":5},"per_day":{"talk":1,"hangout":1},"per_week":{"gift":2,"help":1},"gift_xp":{"loved":4,"liked":2,"neutral":1,"disliked":0},"gift_disliked_tension":5,"gift_bonus_rank":3,"gift_bonus_mult":1.5,"weather_xp":1,"romance_default":8,"romance_options":[[0,"Any rank"],[4,"Rank 4"],[6,"Rank 6"],[8,"Rank 8"],[10,"Rank 10"],[11,"Off"]],"openness":{"open":2,"normal":0,"guarded":-1,"closed":-2},"share":[[0,"how they look and their public role"],[1,"their name, age, club and where they spend time"],[2,"the magic and skills they use openly"],[3,"likes, dislikes and hobbies"],[4,"their personality and what shows when they are upset"],[5,"their goals"],[6,"what they think of other people and of the Doves"],[7,"their past and family"]],"share_real_from":5,"perks":{"1":"greets {{user}} and can be found at their usual places","2":"accepts invitations (a meal, study, a walk)","3":"sometimes seeks {{user}} out; remembers the birthday","4":"will spar, study or team up (competition teams included)","5":"shares their goal and may ask for help with it","6":"introduces {{user}} to friends; keeps {{user}}'s secrets","7":"takes real risks for {{user}}: covers, lends points, backs {{user}} up with staff","8":"closest bond: best friend, romance or sworn rival (the rank 8 event decides)","9":"acts for {{user}} unasked; their secret begins to surface","10":"would sacrifice for {{user}}"},"themes":{"0":"A first real conversation: past the small talk, {{user}} learns who they actually are.","1":"They show the magic or the skill they are proud of, or let {{user}} watch them work.","2":"A small moment reveals what they love or can't stand.","3":"{{user}} sees another side of them: a bad day, a crack in the usual face.","4":"They tell {{user}} what they want most, and a way to help appears.","5":"They speak honestly about the people around them, and about the Doves.","6":"They tell {{user}} about their past and their family.","7":"A turning point: the bond becomes best friends, romance or a sworn rivalry, and the event lets {{user}} choose.","8":"They start to let their guard down about what they hide; the story opens a way to the truth (never revealed by rank alone).","9":"The peak of the bond: a moment that proves it, and what they would give up for {{user}}."}};
const BEV = [];
const HAUNT = {"Irene":"Main Library","Caspian":"Council Chamber, Cathedral, The Snug (neutral ground for diplomacy)","Etnie":"Library upper stacks","Royhan":"Potion Halls, Gardens, Library","Lenna":"the far Gardens, Menagerie, Forest","Saffi":"Sports Field, Gymnasium","Kanae":"Observation Tower, still water","Idris":"Gardens (takes occasional work there), the Forest Clearing (the only warm spot i","Aiden":"Workshop stair and Bell Tower (curfew routes), the Rooftop (he phases through th","Caralynn":"Club Rooms (Music Club rehearsals), the Announcement Room (fighting for the afte","Zara":"Library highest shelves (takes shelving work), Workshop","Gavlan":"Combat Grounds, Faculty Offices, his office library","Yvette":"Workshop, warm end of the Lecture Halls","Krieg":"Dovecote, Detention Tower, Forest edge","Milena":"Lecture Halls, Combat Grounds, Dovecote","Baelin":"Headmaster's Office, Faculty Offices, Council Chamber","Layla":"Main Library, Archive","Vallie":"the Menagerie and her converted stables beside it, the Forest and the fields (wh","Percival":"Sports Field, Gymnasium, Canteen","Sophia":"Combat Grounds, Lake, Sports Field","Rei":"Warden's Office, Seal Chamber, Forest edge, Rooftop","Kuroo":"Staff Room, Card Club, the Viridian Dormitory common room","Mimosa":"Potion Halls, Workshop","Gareth":"Combat Grounds, Observation Tower, Library","Trixie":"the Courtyards (performances nobody asked for), Club Rooms and the old indoor am","Vera":"Potion Halls, Workshop, Medical Centre","Tristan":"Cathedral, Meditation Rooms","Althair":"everywhere","Dante":"Forest edge, Dovecote","Castor":"Archive, Notice Board","Ruby":"Music Club, Mall, Main Library","Florian":"the Tea Club room (Club Rooms), the Combat Grounds whenever Gareth has booked a ","Alyssa":"Library Study Rooms, the Mail Tower on letter days, the Rooftop (Zara has shown ","Tilly":"The Archive, the Broken Statue (her current favourite mystery), the Long Corrido","Ezrel":"second-year Lecture Halls, the Club Rooms, the Light Dormitory, the Workshop aft","Ottavio":"the Sky Dormitory common room, the Fishing Club dock, the third-year Lecture Hal","Caine":"the Noble Houses' Liaison, the Mail Tower on the Liaison's errands","Bobby":"Workshop, Canteen during breaks, the old amphitheatre when testing props, and wh"};
// 1.3.0 (owner brainstorm 2026-09-25): bond rewards (Rank 5 gift, Rank 10 benefit, mask -> truth, Krieg), reputation, training.
// Single sources data/bond_rewards.json, reputation.json, training.json; NPC_GROUP: staff | student | other | rival (no bond system).
const REW = {"train_bonus":0.5,"jump_pct":10,"monthly":{"aiden":[200,"silent partner's share of Aiden's betting book"],"tristan":[100,"Asmoday's Mercy stipend (Tristan)"],"mimosa":[150,"royalty on the formula co-authored with Mimosa"]},"mask":["Castor","Kanae","Caine"],"krieg":{"id":"Krieg","weekly_xp":14,"min_doves":1,"max_attention":39,"note":"Rank 1 from his introduction; then +weekly_xp every Monday while Doves reputation >= min_doves (and, with hidden magic, Dove attention <= max_attention: Unnoticed or Rumoured); otherwise no XP and Tension +1. No XP from talks, hangouts or gifts."},"npcs":{"Aiden":{"gift":{"name":"Aiden's patrol-route deck","text":"A deck of Card Club cards with every Dove patrol route and bell timing inked on the backs, one route per card. Carrying it, {{user}} is far harder to catch out after curfew, because Aiden quietly updates the deck whenever the Doves change a route."},"r10":{"name":"Aiden (Rank 10)","text":"Aiden makes {{user}} a silent partner in the betting book, and a share of its takings arrives every month. Once a week he will also phase and shrink anything {{user}} needs into or out of anywhere on campus, no questions asked.","monthly":"aiden"}},"Caralynn":{"gift":{"name":"Caralynn's calling card","text":"A calling card on Veyturone crest paper, \"A friend of House Veyturone\" written in her own hand. Shown at the Noble Houses' Liaison or to any noble student, it gets {{user}} a polite hearing and a seat at tables they would never otherwise reach."},"r10":{"name":"Caralynn (Rank 10)","text":"Caralynn declares {{user}} her equal in front of her whole following: from then on her followers run {{user}}'s errands too, and gossip against {{user}} dies within the week. Once a month she will spend House Veyturone's name on {{user}}'s behalf, with the Liaison, the Inspectorate or a noble with a grudge."}},"Zara":{"gift":{"name":"Zara's talisman jacket","text":"A jacket she designed for {{user}} and, for once, actually finished, with protective talismans sewn into the lining. It stops one hostile spell or curse outright, and Zara rewrites the lining every month so it is always ready again."},"r10":{"name":"Zara (Rank 10)","text":"Zara becomes {{user}}'s talisman-writer: a fresh set of protective, repulsion and exorcism charms every week, free, written for {{user}}'s hand alone. Her exorcist's sense is turned on {{user}} for good, so if anyone ever lays a curse on them, she is the first to know."}},"Percival":{"gift":{"name":"Brotherhood of Laetano badge","text":"A tin badge of the Brotherhood of Laetano, pinned on {{user}} in a full knighting ceremony that makes them a squire sworn to the Brotherhood's dawn drills. Stamina training done with Percival counts for half as much again (×1.5), because he runs every lap as if someone at the far end of the field needs him.","train":"stamina"},"r10":{"name":"Percival (Rank 10)","text":"Sir Percival swears himself as {{user}}'s knight: he joins any team {{user}} forms as its healer and answers {{user}}'s call in any fight. Once per fight he throws himself between {{user}} and a finishing blow, and heals them back to their feet with his own strength."}},"Trixie":{"gift":{"name":"Trixie's flash powder","text":"A pouch of Confetti circus flash powder, the family recipe, which is not magic and cannot be dispelled. Thrown down, it blinds a whole room for a few seconds, and Trixie refills it every time the circus writes."},"r10":{"name":"Trixie (Rank 10)","text":"The Confetti circus adopts {{user}} as honorary family, with free passage, lodging and news from every town it plays. Trixie herself will cause a distraction on request, anywhere and any time, big enough that nobody remembers what {{user}} was doing."}},"Vera":{"gift":{"name":"Vera's Rest token","text":"A Rest token, a brass charm she enchanted with a sliver of her own Rest: pressed once a week, it gives {{user}} a full night's sleep in one hour. She has taken the sleep debt for every use onto herself in advance, and refuses to discuss it."},"r10":{"name":"Vera (Rank 10)","text":"Vera becomes {{user}}'s personal workshop: she repairs, improves or enchants any equipment {{user}} brings, and her upgrades come out better than anything the Mall sells. Once a day she will also Rest {{user}} by hand and take the debt herself."}},"Castor":{"gift":{"name":"Castor's newspaper notebook","text":"A hand-bound notebook; anything {{user}} writes in it and slips under the Academy Newspaper's door is printed in the next issue, anonymously. It is the fastest way on campus to plant a story or kill a rumour, and Castor never asks who wrote it."},"r10":{"name":"Castor (Rank 10)","text":"Castor chooses {{user}} over the Choir, quietly and completely: he warns them before any rite, mark or curse the Choir turns their way, and tells them who at Halvard sings with it. He also lifts any curse on {{user}} at any hour, because he knows exactly how each one was built.","secret":"Every warning is a betrayal his father will eventually notice. He finishes the page about a way out, and it has {{user}} in it."},"nudge":{"text":"Castor lets {{user}} read his private writing, and between the pages is one he never finished, about a boy who sings at dawn in a choir he never chose.","fact":"Castor's unfinished page mentions a 'Morning Choir'."},"gate":"{{user}} has learned, in play, that Castor belongs to the Morning Choir."},"Alyssa":{"gift":{"name":"Alyssa's notebook offer","text":"A standing offer from her notebook: once a week {{user}} can name anyone at Halvard and Alyssa reads them her page on that person. It tells {{user}} where that person tends to be this week and one thing they would be glad to receive, because Alyssa writes down exactly what she has seen and nothing more."},"r10":{"name":"Alyssa (Rank 10)","text":"Once a day Alyssa spends Foresight on {{user}}, telling them what the next five minutes hold before an exam, a duel or a conversation that matters. In any fight they share she calls every attack a heartbeat before it lands, and {{user}}'s page is the first she reads each week, so she never meets them as a stranger."}},"Lenna":{"gift":{"name":"Greenwind seedling","text":"A potted seedling from the Greenwind Forest, the last living thing she brought from home. Any animal near it grows calm, which makes the Menagerie, the Forest and the Creature Studies Expedition far safer for {{user}}."},"r10":{"name":"Lenna (Rank 10)","text":"Lenna brings {{user}} into the Greenwind ways: animals in the Menagerie and the Forest treat {{user}} as one of hers, and her earth rises to shield them anywhere off the paths. She also cooks for {{user}} every rest day, a Greenwind meal that sets them right for the whole week."}},"Saffi":{"gift":{"name":"Running Club whistle","text":"A spare Running Club whistle on a cord: blow it before classes and Saffi turns up within minutes, ready to drag {{user}} round the Sports Field. Stamina training done with her counts for half as much again (×1.5), because she never lets anyone stop at \"tired\".","train":"stamina"},"r10":{"name":"Saffi (Rank 10)","text":"Saffi joins any team {{user}} forms as its front-line fighter, and nobody lays a hand on {{user}} while she is within earshot. Her night senses keep watch for them after dark, and she will sprint anywhere on campus the moment she hears {{user}} call."}},"Kanae":{"gift":{"name":"Quveno silver mirror","text":"A silver hand mirror from the Quveno house, \"so you can always find me\". Once a week, {{user}} can say her name into it and ask one true reading: where someone is, or what is coming.","secret":"It also lets her watch {{user}} through it whenever she likes, and she does."},"r10":{"name":"Kanae (Rank 10)","text":"Seen through and still wanted, Kanae lays the Plan down: the mirror stays, but she only looks through it when {{user}} asks. Once per fight they share, her chains pin one enemy in place for {{user}} before anyone else's magic moves.","secret":"It is the first honest thing she has ever given. Whether she ever tells Dante the truth about Niu is up to the story."},"nudge":{"text":"In an unguarded moment Kanae says the name of a girl who \"should have kept her mouth shut\", then laughs it off.","fact":"Kanae mentioned someone called Niu; Dante Kleinn is said to be re-reading an old Dove case under that name."},"gate":"{{user}} has learned, in play, the truth about the rigged readings, the Plan, or what happened to Niu."},"Idris":{"gift":{"name":"Idris's two vials","text":"Two vials in precise script: an antivenom brewed from his own venom that cures almost any poison, and the venom itself. He calls the second \"for emergencies\" and will not explain further."},"r10":{"name":"Idris (Rank 10)","text":"Idris haggles for {{user}} as if they were family business, and everything {{user}} buys at the Mall and the Commissary costs noticeably less. Mormo watches {{user}}'s back when Idris cannot, draining the stamina of anyone who comes at them in the dark."}},"Dante":{"gift":{"name":"Groundskeeper's Lodge key","text":"A spare key to the Groundskeeper's Lodge, which he says nobody ever checks. It gives {{user}} a safe, warm hideout at the Forest edge after curfew that no patrol looks into."},"r10":{"name":"Dante (Rank 10)","text":"Dante counts {{user}} among the people he protects, with no conditions: anyone who threatens {{user}} finds him there, and nobody has ever beaten him hand to hand. He also looks the other way on any rule {{user}} breaks, and steers Dove attention away from them.","secret":"This is the Doves' own asset lying to the Doves, for the first time in his life."}},"Florian":{"gift":{"name":"Villeneuve Snug token","text":"A Villeneuve silver token for The Snug's largest booth, on Florian's account. Whatever {{user}} orders there is paid for, and anyone {{user}} brings is treated as Florian's guest."},"r10":{"name":"Florian (Rank 10)","text":"Florian joins {{user}}'s team and fights under their call, Hades and all, the first time he has ever followed anyone. Once per fight Hades will Stop anything for {{user}} for two seconds, and the wolf's eyes see through any illusion or invisibility aimed at them."}},"Tilly":{"gift":{"name":"Tilly's map of hidden ways","text":"Her hand-drawn map of Halvard's hidden ways, copied out of Halvard Unexplained: crawlspaces, back stairs and forgotten doors. Following it, {{user}} can cross the campus unseen and reach places nobody else knows exist."},"r10":{"name":"Tilly (Rank 10)","text":"Tilly grows {{user}} a hidden bower in the far Gardens that nobody else can find, full of rare herbs and flowers she replants every week for potions and gifts. She also shows {{user}} the signet ring she wears on a chain under her blouse and promises that a letter under its seal will always be answered, though she will not say by whom.","secret":"The seal is Velmora's royal signet; a letter under it reaches Velmora's crown. Showing it is the closest she has ever come to telling anyone who she is."}},"Irene":{"gift":{"name":"Council pardon","text":"A signed Council pardon, one use, in Irene's careful hand. If {{user}} is caught breaking an academy rule that should send them to the Detention Tower, Irene takes it to the staff herself and it becomes a warning, with no Academy reputation lost: the one exception she has ever made.","uses":1},"r10":{"name":"Irene (Rank 10)","text":"Irene offers {{user}} a seat on the Student Council: Council Chamber access, a vote on student rules, and a say in how festivals and discipline are run. In a fight her barriers answer {{user}} first, and she will stand between {{user}} and the Doves even though they terrify her."}},"Caspian":{"gift":{"name":"Festival Committee badge","text":"A Festival Committee staff badge in his own name. At every festival {{user}} walks into the restricted areas, gets the best stall slot at the Bazaar, and can put an event on the programme."},"r10":{"name":"Caspian (Rank 10)","text":"When they fight side by side, Caspian's hand on {{user}}'s shoulder doubles their magic for a full minute once per fight. As Council Vice President he also speaks for {{user}} to staff, Council and the Liaison, and trouble tends to end there."}},"Etnie":{"gift":{"name":"Etnie's lockpicks","text":"Her old street lockpicks, the only thing she kept from before Halvard. They open any ordinary lock on campus (drawers, cupboards, storerooms), though not a bracelet-warded door."},"r10":{"name":"Etnie (Rank 10)","text":"Etnie leaves one of her clones on {{user}} at all times, and can swap places with it in a heartbeat to take any blow meant for them. Nobody who has hurt {{user}} is ever left alone by Big Sister again, and everyone at Halvard knows it."}},"Royhan":{"gift":{"name":"Royhan's alchemist pouch","text":"An alchemist's pouch of his own: three healing draughts and one bottle of lightning. He refills it whenever {{user}} brings back the empties, and he will not take points for it."},"r10":{"name":"Royhan (Rank 10)","text":"Royhan becomes {{user}}'s alchemist: every week he brews any potion they ask for at cost, including ones the Commissary cannot stock. If his regeneration potion ever works, the first bottle is {{user}}'s."}},"Sophia":{"gift":{"name":"Sophia's tactics book","text":"Her own tactics book, margins full of every trick she has used in the ring, with the brutal morning mana drill she wrote in the back. Mana training done with Sophia counts for half as much again (×1.5), because she learned to push her reserves the hard way and will not let {{user}} learn it any softer.","train":"mana"},"r10":{"name":"Sophia (Rank 10)","text":"Sophia joins {{user}}'s team and fights under {{user}}'s orders, the only person at Halvard she has ever agreed to follow. She also duels anyone who insults {{user}}, publicly and to the end."}},"Gareth":{"gift":{"name":"Gareth's training journal","text":"His private training journal: the mana drills he has run every morning since he was a boy, with an open invitation to run them beside him at the Combat Grounds. Mana training done with Gareth counts for half as much again (×1.5), because nobody at Halvard knows better how to push a mana pool past where it wants to stop.","train":"mana"},"r10":{"name":"Gareth (Rank 10)","text":"Gareth makes {{user}} his one exception to coming first: he tutors them before every exam and joins their team for competitions, burning whole arenas on their behalf.","secret":"He will also quietly ruin anyone who stands in {{user}}'s way, the way he ruined his brother, unless {{user}} tells him not to."}},"Ruby":{"gift":{"name":"Bonbon sweets tin","text":"A tin of Bonbon family sweets that never quite runs out, because her family sends a refill with every letter. Any NPC who is not averse to sweets takes one as a liked gift."},"r10":{"name":"Ruby (Rank 10)","text":"Ruby tells everyone who will listen that {{user}} is her friend, and Halvard has learned to trust Ruby's judgement: {{user}}'s Student reputation rises by one level. It is the only side she has ever picked, and she picked a person, not a side.","rep_up":"Student"}},"Gavlan":{"gift":{"name":"Gavlan's gravity bracers","text":"The gravity-weighted bracers he wore as a young mage, and one week of his dawn drills to break them in. At the end of that week {{user}}'s Mana pool jumps ahead in one go by a tenth of its starting value, weeks of training at once (still within the training limit).","jump":"mana"},"r10":{"name":"Gavlan (Rank 10)","text":"Gavlan names {{user}} the protégé he has been looking for, and teaches them in private what no class does, a technique of his own included. On rest days he takes {{user}} through the Portal to the clan's cottage, where no Dove and no Inspector can reach them."}},"Yvette":{"gift":{"name":"Yvette's warning orb","text":"A small floating orb, the little sibling of her own focus. It warms and hums whenever someone nearby means {{user}} harm, because Yvette has never once felt safe at Halvard and does not want {{user}} to be caught unready."},"r10":{"name":"Yvette (Rank 10)","text":"Yvette opens the Workshop and her research to {{user}}: any enchanted item they find, she identifies, repairs or improves. Her rooms in the Fire Dormitory become the one door {{user}} can knock on at any hour, and her lightning answers for them before anyone else's."}},"Baelin":{"gift":{"name":"Headmaster's card","text":"A card on the Headmaster's paper: \"Bearer may see me without appointment.\" Once, he will hear {{user}}'s case in person and rule on it himself, over any other staff decision.","uses":1},"r10":{"name":"Baelin (Rank 10)","text":"Baelin enters {{user}} in his ledger as a debt he owes, and repays it in the one coin a headmaster has: {{user}}'s Academy reputation rises by one level. His reports to the capital start mentioning {{user}} by name, and the staff notice at once.","rep_up":"Academy"}},"Layla":{"gift":{"name":"Restricted Section permission","text":"A signed permission letter granting {{user}} reading rights in the Restricted Section. It opens the oldest records at Halvard, the ones that answer questions classes will not."},"r10":{"name":"Layla (Rank 10)","text":"Layla shares everything she has pieced together about Halvard's past, and her private tutoring makes History the easiest top mark {{user}} will ever earn. If anyone ever corners {{user}} the way they once cornered Yvette, the gloves come off."}},"Vallie":{"gift":{"name":"Ironback Boar tusk","text":"A carved tusk from the Ironback Boar that took her eye, hung on a cord. Creatures smell a hunter's trophy and back off, which makes the Forest and the Expedition far safer for {{user}}."},"r10":{"name":"Vallie (Rank 10)","text":"Vallie teaches {{user}} the Will of Steel way of taking a hit, sparring and running them until pain stops mattering, and {{user}}'s Stamina jumps ahead in one go by a tenth of its starting value, weeks of training at once (still within the training limit). She also arm-wrestles anyone who says a word against {{user}}, and she has never lost that one.","jump":"stamina"}},"Rei":{"gift":{"name":"Warden's Office key","text":"A plain brass key to the Warden's Office side door. Inside is the one room on campus that the Doves and the Inspectorate cannot enter without the Warden's leave."},"r10":{"name":"Rei (Rank 10)","text":"During the Thinning, {{user}} stands watch with Rei instead of sitting locked in the dorm, and she begins to tell them what she knows about the Crack. In any fight she arrives in smoke, and nothing gets through her to {{user}}."}},"Kuroo":{"gift":{"name":"Kuroo's dance card","text":"His old dance card from his envoy years, filled with notes on every Liaison staffer and which students they are watching. With it, {{user}} knows who the Liaison has an eye on and how to talk their way past them."},"r10":{"name":"Kuroo (Rank 10)","text":"Once, Kuroo spends every favour he has left with the staff on {{user}}: their Academy reputation rises by one level, but only from a negative level (−5 to −4, …, −1 to 0). He will not lift anyone above zero, because that part {{user}} has to earn.","rep_token":"Academy","uses":1}},"Mimosa":{"gift":{"name":"Mimosa's focus draught","text":"A vial of her own perfectly clear brew labelled \"for exams\", a focus draught she invented and has never published. Taken before a test, it lets {{user}} recall everything they studied.","uses":1},"r10":{"name":"Mimosa (Rank 10)","text":"Mimosa co-authors her first published formula with {{user}}: their name goes on it too, with the prestige and the monthly royalty. Any potion {{user}} brews under her eye cannot blow up, because she sees it coming three seconds early.","monthly":"mimosa"}},"Althair":{"gift":{"name":"Signed discipline referral","text":"A blank discipline referral, signed in advance by the Vice Headmaster. Filled in and handed back, it makes one punishment against {{user}} disappear into the files.","uses":1},"r10":{"name":"Althair (Rank 10)","text":"Althair makes {{user}} a player in his game rather than a piece: every month he nudges something their way through the paperwork, such as a better timetable, a bigger club budget or a punishment lost in the files. And when Althair is watching, things simply tend to go {{user}}'s way."}},"Ezrel":{"gift":{"name":"Ezrel's clay golem","text":"A palm-sized clay golem that follows standing orders: carry, fetch, guard a door, repeat a task. It never tires, and it never asks why.","secret":"He can look through it."},"r10":{"name":"Ezrel (Rank 10)","text":"Ezrel builds {{user}} a Mannequin, a golem nobody can tell from {{user}}, that can sit in their seat at class or roll call while they are elsewhere. In a fight it stands beside them with a golem's strength and takes the blade without slowing."}},"Ottavio":{"gift":{"name":"Ottavio's Canteen chit","text":"A Canteen chit on Ottavio's account, stamped with a worn casino mark. {{user}} eats one free meal a day for the rest of the year, because Ottavio knows which students skip meals to save points and has never allowed it."},"r10":{"name":"Ottavio (Rank 10)","text":"Ottavio takes {{user}} into his family, dorm or not: from then on the Dovecote has to go through him to reach them, and he has never handed anyone over. Loki adds {{user}} to his hoard of things he owns, so he turns up in a crisis, and on a lucky coin toss he arrives big."}},"Krieg":{"gift":{"name":"Dovecote pass","text":"A Dovecote pass under his seal: the gate opens to {{user}} at any hour to see Krieg in his office. No other student at Halvard can say that, and what {{user}} learns there, or is seen doing there, is up to them."},"r10":{"name":"Krieg (Rank 10)","text":"Krieg decides {{user}} is the one mage he will not treat as a wolf, and once a month he lets them read one Dovecote file on a person or case of their choosing. He still searches, questions and watches {{user}} like everyone else, because in his eyes that is exactly what makes the file worth showing."}},"Milena":{"gift":{"name":"White Dragonchess knight","text":"A white Dragonchess knight from her father's set. Shown to any Dove, it means Milena vouches for {{user}}, and a search ends at a polite question."},"r10":{"name":"Milena (Rank 10)","text":"Once, Milena takes {{user}}'s file off Krieg's desk and closes it: their Doves reputation rises by one level, but only from a negative level (−5 to −4, …, −1 to 0). Above zero, she says, is something {{user}} has to earn in front of the Doves themselves.","rep_token":"Doves","uses":1}},"Tristan":{"gift":{"name":"Asmoday's Mercy stipend","text":"A small monthly stipend from the Asmoday's Mercy fund, entered in his immaculate ledger as \"a student in need\". The points arrive at the start of every month, and Tristan finds it very funny that nobody has ever audited him.","monthly":"tristan"},"r10":{"name":"Tristan (Rank 10)","text":"Tristan binds any contract {{user}} needs in the Cathedral, and his Oath magic makes it unbreakable for both sides. Once, when it matters most, he will use the registry for someone for the first time in his life, and that someone is {{user}}."}},"Caine":{"gift":{"name":"Liaison guest card","text":"A Liaison guest card in Caine's hand, which puts {{user}} on the list for every Liaison reception, tea and ball. It opens the rooms where noble students and their families talk business.","secret":"He chose {{user}} to be watched."},"r10":{"name":"Caine (Rank 10)","text":"Unmasked and still courteous, Caine takes {{user}}'s name off the Choir's list, the only mercy he has ever shown a mage, and no Mark will ever touch them. He tells {{user}} one true thing each week about the Choir's work at Halvard, and leaves what {{user}} does with it entirely to them.","secret":"He does not stop, and does not ask {{user}} to join. He simply wants one person to see all of it and understand."},"nudge":{"text":"At a Liaison reception {{user}} sees a noble student who lingered after the last one: they have lost an hour they cannot account for, and they rub a \"bruise\" on their left shoulder.","fact":"Students who stay late at the Liaison lose an hour and wake with a mark on the left shoulder; Caine saw them out."},"gate":"{{user}} has learned, in play, that Caine carries Lucifer's Mark or serves the Morning Choir."},"Bobby":{"gift":{"name":"BB consultation voucher","text":"A BB consultation voucher: one free job, props and planning included, for a prank, surprise, apology or confession. Bobby even waives the story afterwards, though he will sulk.","uses":1},"r10":{"name":"Bobby (Rank 10)","text":"Every commission from BB is free from now on, and he drops any other job for {{user}}'s. He also teaches {{user}} sleight of hand and misdirection: tricks that no Dispelling can touch and that no mage thinks to look for."}}}};
const REP = {"reps":["Academy","Student","Doves"],"about":{"Academy":"staff and the institution","Student":"the student body","Doves":"the Dovecote"},"thresholds":[15,35,60,90,125],"weekly_cap":5,"bond_cap_level":3,"bond_milestone_xp":{"5":5,"10":10},"tension_high":70,"tension_xp":-5,"academy5_monthly":300,"anti_doves":["Lenna","Idris","Zara","Gavlan","Yvette","Kuroo","Ottavio"],"pro_doves":["Saffi","Layla","Florian","Mimosa","Vallie","Ruby"],"doves_bond":["Milena"],"effects":{"Academy":[[-5,-5,"Academic probation: a formal hearing before Baelin Kalvor, the monthly points payout halved, and one more serious offence means expulsion proceedings."],[-4,-3,"Staff assume the worst: minor offences earn detention instead of a warning; requests (club signatures, permits, schedule changes) are refused. Staff NPCs warm up more slowly."],[-2,-1,"{{user}} is \"one to watch\": teachers call on them to catch them out, and patrols stop them more often after curfew."],[0,0,"An ordinary student; staff treat {{user}} by the rules."],[1,2,"Teachers give {{user}} the benefit of the doubt: a first minor offence is a warning, and office-hour requests are welcome."],[3,4,"Staff trust {{user}} with responsibility: supervised access to restricted rooms, sign-off to found a club, invitations to staff-run events. Staff NPCs warm up faster."],[5,5,"{{user}}'s portrait hangs in the Portrait Hall among Halvard's honoured students, and the academy adds a monthly points bonus on top of the rank payout. Staff quietly overlook one serious offence per semester."]],"Student":[[-5,-5,"{{user}} is shunned across the academy: nobody sits with them, their belongings go missing, and student NPCs below Rank 3 avoid them entirely."],[-4,-3,"Rooms go quiet when {{user}} walks in; nobody will team up, study together or cover for them. Student NPCs warm up more slowly."],[-2,-1,"Students are cool towards {{user}} and keep them out of the good gossip and the good seats."],[0,0,"{{user}} is one student among hundreds."],[1,2,"People save {{user}} a seat, share notes and gossip, and will cover for them once in a small way."],[3,4,"{{user}} is someone people rally behind: teams are easy to form, and students stand up for them. Student NPCs warm up faster."],[5,5,"{{user}} is Halvard's favourite: students take real risks for them (a false alibi, a shared punishment), and crowds turn out to cheer them at every competition."]],"Doves":[[-5,-5,"{{user}} is taken to the Dovecote for a week of \"examination\", as Idris Ainsworth was; afterwards they are escorted between classes for the rest of the month. Anti-Dove NPCs warm to {{user}}; pro-Dove NPCs keep their distance."],[-4,-3,"Weekly searches of {{user}}'s room and belongings, a patrol that follows them after dark, and Krieg Valforth knows their name. Anti-Dove NPCs (Lenna, Idris, Zara, Gavlan, Yvette, Kuroo, Ottavio) warm to {{user}}; pro-Dove NPCs (Saffi, Layla, Florian, Mimosa, Vallie, Ruby) keep their distance."],[-2,-1,"Doves stop and question {{user}} more often, and any talisman, potion or odd item they carry is inspected."],[0,0,"{{user}} is one mage among hundreds; routine checks only."],[1,2,"Doves greet {{user}} by name, and routine checks end at a polite question."],[3,4,"{{user}} gets the benefit of the doubt: rumours about them are ignored, and Milena Sagona or another Dove will tip them off about coming searches. Anti-Dove NPCs (Lenna, Idris, Zara, Gavlan, Yvette, Kuroo, Ottavio) grow wary of {{user}}."],[5,5,"The Dovecote treats {{user}} as an ally: they are asked to help on cases, their word is trusted against anyone else's, and a recruitment offer waits for them after graduation. Anti-Dove NPCs call {{user}} \"one of the Doves\"."]]},"bond_mod":{"_note":"extra bond XP per counted talk or hangout (never below 0 for one interaction); modifiers add up","staff":[[3,1],[-3,-1]],"student":[[5,2],[3,1],[-3,-1]],"anti_doves":[[3,-1],[-3,1]],"pro_doves":[[-3,-1]]}};
const TRN = {"tracks":{"mana":{"label":"Mana pool","field":"Mana_max"},"stamina":{"label":"Stamina","field":"Stamina_max"}},"session_pct":1,"weekly_pct":2.5,"total_pct":100};
const NPC_GROUP = {"Aiden":"student","Althair":"staff","Alyssa":"student","Baelin":"staff","Bellatrix":"rival","Bobby":"other","Bram":"rival","Caine":"other","Caralynn":"student","Caspian":"student","Cassius":"rival","Castor":"student","Dante":"student","Dex":"rival","Elion":"rival","Etnie":"student","Ezrel":"staff","Florian":"student","Gareth":"student","Gavlan":"staff","Idris":"student","Ines":"rival","Irene":"student","Kanae":"student","Kira":"rival","Krieg":"other","Kuroo":"staff","Layla":"staff","Lenna":"student","Lucius":"rival","Milena":"other","Mimosa":"staff","Mirelle":"rival","Morgana":"rival","Ottavio":"staff","Percival":"student","Pip":"rival","Rei":"staff","Royhan":"student","Ruby":"student","Saffi":"student","Sophia":"student","Theodore":"rival","Tilly":"student","Tristan":"other","Trixie":"student","Vallie":"staff","Vera":"student","Yvette":"staff","Zara":"student"};
const NO_BOND = new Set(Object.keys(NPC_GROUP).filter(id => NPC_GROUP[id] === 'rival'));
const MASK = new Set(REW.mask || []);
const repLevel = x => (x >= 0 ? 1 : -1) * (REP.thresholds || []).filter(t => Math.abs(x) >= t).length;
const repFloor = L => (L === 0 ? 0 : Math.sign(L) * REP.thresholds[Math.abs(L) - 1]);   // the Rep XP at which level L begins
const repBand = (r, L) => ((((REP.effects || {})[r]) || []).find(([a, c]) => L >= a && L <= c) || [0, 0, ''])[2];
const repOfNpc = id => (NPC_GROUP[id] === 'staff' ? 'Academy' : NPC_GROUP[id] === 'student' ? 'Student' : (REP.doves_bond || []).includes(id) ? 'Doves' : '');
const r2 = x => Math.round(x * 100) / 100;   // first line of each NPC's Haunts: where a bond event is likely when no scripted event says
const paceOf = S => ((BR.pace || {})[(S.$ui || {}).bondpace] || 1);
const needXP = (r, m) => (r >= 10 ? 0 : Math.max(3, Math.round(BR.xp_base[r] * m)));
const coolDays = (r, m) => Math.round((BR.cool_base[Math.min(r, 9)] || 0) * m);
const hm = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '').trim()); return m ? +m[1] * 60 + +m[2] : null; };
const normP = x => String(x || '').split(/\s+[—-]\s+/)[0].trim().toLowerCase().replace(/^the\s+/, '');
// a scripted event's conditions (tools/import_bond_events.py): where, time window, days, skies it must not have, prerequisites
function bondEventOk(e, S) {
  const W = S.World, P = S.Player.Profile, now = hm(W.Time);
  if (e.where && e.where.length && !e.where.some(w => normP(w) === normP(W.Location))) return false;
  if (e.time && now != null) { const a = hm(e.time[0]), b = hm(e.time[1]); if (a != null && b != null && !(a <= b ? now >= a && now <= b : now >= a || now <= b)) return false; }
  if (e.days && e.days.length && !e.days.includes(W.Day)) return false;
  const sky = ((S.$ui.wx || {}).now || {}).sky;
  if (e.not_sky && e.not_sky.length && sky && e.not_sky.some(x => x.toLowerCase() === String(sky).toLowerCase())) return false;
  const R = e.requires || {};
  if (R.club && !String(P.Club || '').toLowerCase().includes(String(R.club).toLowerCase())) return false;
  if (R.dorm && P.Dorm !== R.dorm) return false;
  if (R.month_from && (W.Month < R.month_from)) return false;
  if (R.year_from && (W.Year < R.year_from)) return false;
  return true;
}
// Batch 5.1: castle places (the Notice Board is in the Floor 1 entrance hall that every student crosses) and module caps
const CASTLE = new Set(["announcement room", "archive", "bell tower", "canteen", "castle", "club rooms", "detention tower", "faculty offices", "headmaster's office", "lecture halls", "main library", "notice board", "potion halls", "restricted section", "rooftop", "royal inspectorate", "seal chamber", "seminar rooms", "staff room", "storage and lockers", "student council chamber", "study rooms", "the castle", "the royal inspectorate", "the seal chamber", "the warden's office", "warden's office", "workshop"]);
// v1.0.3 (F01): every campus place name (lowercase, with and without a leading "the"); anything else is off the grounds
const CAMPUS = ["announcement room", "arbiter hall", "archery range", "archive", "banking house", "bathhouse and washrooms", "bell tower", "boathouse and lake", "broken statue", "campus", "canteen", "castle", "cathedral", "club rooms", "combat grounds", "commissary", "common rooms", "courtyards", "detention tower", "dovecote", "faculty offices", "fire dormitory", "fishing house", "forest", "forest clearing", "founder's statue and park", "gardens", "grassy field and hills", "groundskeeper's lodge", "gymnasium", "halvard", "halvard academy", "headmaster's office", "laundry", "lecture halls", "light dormitory", "mail tower", "main courtyard", "main library", "mall", "medical centre", "meditation rooms / spirit house", "menagerie", "merryhew's", "nightwell", "noble houses' liaison", "notice board", "observation tower", "old hut", "portrait hall", "potion halls", "reception and gatehouse", "restricted section", "ring dining hall", "rooftop", "royal inspectorate", "seal chamber", "seminar rooms", "sky dormitory", "snug", "sparring pavilion", "sports field", "staff quarters", "staff room", "storage and lockers", "student council chamber", "study rooms", "swimming pool", "the arbiter hall", "the banking house", "the castle", "the cathedral", "the dovecote", "the mall", "the noble houses' liaison", "the ring dining hall", "the royal inspectorate", "the seal chamber", "the snug", "the sparring pavilion", "the warden's office", "viridian dormitory", "warden's office", "willow island", "workshop"];
const placeOf = loc => String(loc || '').split(/\s+[—-]\s+/)[0].trim();
const onCampus = loc => { const p = placeOf(loc).toLowerCase(); return !p || CAMPUS.some(c => p === c || p.startsWith(c + ' ') || p.startsWith(c + ',')); };
const CAP = { Notices: 10, Letters: 12, Clues: 40, Journal: 30 };
// Batch 5.2: trips (first day, for the unlock window) and the Kingdom prize (lore Competitions: 5,000 points per winning member)
const TRIPS = [{ m: 4, w: 2, d: 'Tue', name: 'the capital (Crowning Day)' }, { m: 11, w: 3, d: 'Mon', name: 'Sunreach Bay (Academy Trip)' }];
const KINGDOM_PRIZE = 5000;
// v1.0.3: Halvard students {id: [lorebook Year, campaign year they arrive]}, injected by gen_engine. Graduation (M11 W4 Sun) sends
// the year's third-years away the next morning (M12 W1 Mon); they go to Campus_State.Graduated (the story may take a name back out).
// ARRIVES: incoming cohorts (data/cohorts.json) -> campaign year they arrive as first-years; before that they are not at Halvard.
const STUDENTS = {"Aiden":[1,1],"Alyssa":[1,1],"Caralynn":[1,1],"Caspian":[3,1],"Castor":[1,1],"Dante":[2,1],"Etnie":[3,1],"Florian":[2,1],"Gareth":[3,1],"Idris":[2,1],"Irene":[3,1],"Kanae":[2,1],"Lenna":[2,1],"Percival":[1,1],"Royhan":[3,1],"Ruby":[3,1],"Saffi":[2,1],"Sophia":[3,1],"Tilly":[2,1],"Trixie":[1,1],"Vera":[1,1],"Zara":[1,1]};
const ARRIVES = {};
const yearOf = (id, Y) => (STUDENTS[id] ? STUDENTS[id][0] + Y - STUDENTS[id][1] : 0);   // their school year in campaign year Y
// Batch 5.3 (F20): seeded campus happenings. Pool from data/happenings.json (injected by tools/gen_engine.py).
// Plan 4.6: never Math.random(). The chat seed is taken once from the creation time of the message whose update first ran the
// engine and then stored in $eng.seed, so every later roll is a pure function of (seed, day): swipes and replays see the same day.
const HAPPENINGS = [{"id":"work_menagerie","text":"A paid-work opening is up on the Notice Board: Menagerie mucking out, 40 points a shift. It will be gone by tomorrow.","where":"Notice Board","from":7,"to":20,"days":"weekday","weight":3},{"id":"work_shelving","text":"The Main Library has posted a shelving shift on the Notice Board, the quiet kind that is rarely advertised twice.","where":"Notice Board","from":7,"to":18,"days":"weekday","weight":2},{"id":"tutoring_offer","text":"A second-year has pinned a tutoring offer to the Notice Board: combat footwork, paid in points or in favours.","where":"Notice Board","from":7,"to":20,"days":"any","weight":2},{"id":"lost_wand","text":"A lost-item note on the Notice Board: a silver-banded focus wand, last seen near the Lecture Halls. Reward offered.","where":"Notice Board","from":7,"to":20,"days":"any","weight":2},{"id":"dove_sweep","text":"Two Doves are walking the Courtyards slowly, watching faces. Students keep finding reasons to be somewhere else.","where":"Courtyards","from":12,"to":16,"days":"weekday","weight":2,"outdoor":true},{"id":"menagerie_loose","text":"Something small has slipped its pen at the Menagerie; handlers are combing the Gardens with nets and treats.","where":"Gardens","from":14,"to":18,"days":"any","weight":2,"outdoor":true},{"id":"lanterns_dim","text":"Month-end draw on the mana grid: the corridor lanterns burn noticeably dimmer tonight, and everyone complains about it like weather.","where":"","from":17,"to":20,"days":"any","weeks":[4],"weight":4},{"id":"canteen_short","text":"The Canteen kitchen is short-handed; the cook is offering an extra paid shift to whoever helps serve lunch.","where":"Canteen","from":10,"to":13,"days":"weekday","weight":2},{"id":"cooking_club","text":"The Cooking Club's ovens have run since dawn; the Canteen smells of honey bread and they are giving away the failures.","where":"Canteen","from":10,"to":15,"days":"any","weight":2},{"id":"duel_chalk","text":"A formal duel challenge is chalked on the board outside the Sparring Pavilion. Nobody has signed to accept it yet.","where":"The Sparring Pavilion","from":8,"to":20,"days":"any","weight":2},{"id":"club_tables","text":"Club recruiters have set up tables in the Courtyards, pressing leaflets on every first-year who slows down.","where":"Courtyards","from":12,"to":17,"days":"any","months":[1,2],"weight":4,"outdoor":true},{"id":"dragonchess","text":"A Dragonchess match in the Mall's game halls has run into its second day; a crowd is betting points on it.","where":"The Mall","from":16,"to":20,"days":"any","weight":2},{"id":"bakery_new","text":"The Mall bakery has a new pastry out and the queue curls out of the door.","where":"The Mall","from":7,"to":11,"days":"any","weight":2},{"id":"mail_sunday","text":"Sunday sorting at the Mail Tower is swamped; the sorting floor is asking anyone free to lend a hand.","where":"Mail Tower","from":9,"to":15,"days":["Sun"],"weight":5},{"id":"parcel_cart","text":"A cart of heavy parcels has come in at the Mail Tower; locker tallies are going up all afternoon.","where":"Mail Tower","from":13,"to":18,"days":"weekday","weight":2},{"id":"boat_capsize","text":"A rowing boat capsized near the willow island; the crew came back soaked and furious, and the boathouse is buzzing.","where":"Boathouse and Lake","from":15,"to":19,"days":"any","weight":1,"outdoor":true},{"id":"clear_dusk","text":"A clear, moonless dusk: the Observation Tower's instruments are already turning on their own, and the Divination Society has claimed the top deck.","where":"Observation Tower","from":17,"to":20,"days":"any","weight":1,"weather":"clear_night"},{"id":"pickup_match","text":"An informal cross-dorm match has started on the Sports Field, and one side is a player short.","where":"Sports Field","from":16,"to":19,"days":"any","weight":2,"outdoor":true},{"id":"workshop_sparks","text":"A misfired enchantment has left sparks hanging in the Workshop air for hours; the forges are shut until it settles.","where":"Workshop","from":10,"to":18,"days":"weekday","weight":1},{"id":"garden_overgrowth","text":"Something in the Gardens grew far too well overnight; the Gardening Club is cutting a path back to the herb beds.","where":"Gardens","from":7,"to":17,"days":"any","weight":2,"outdoor":true},{"id":"council_inspection","text":"The Student Council is inspecting the dorm common rooms this evening: preservation lockers, quiet hours, the kettle rota.","where":"Common Rooms","from":18,"to":20,"days":"weekday","weight":1},{"id":"pillar_notice","text":"The Announcement Pillars glow between periods: a lost-property amnesty at Reception, today only.","where":"Reception and Gatehouse","from":12,"to":16,"days":"weekday","weight":1},{"id":"medical_queue","text":"After today's Combat lessons the Medical Centre has a queue out of the door: sprains, burns and one badly singed eyebrow.","where":"Medical Centre","from":16,"to":18,"days":["Mon","Thu"],"weight":3},{"id":"airship_over","text":"An airship passes low over the grounds on its way to the capital; half the Courtyards stops to watch.","where":"Courtyards","from":10,"to":17,"days":"any","weight":1,"outdoor":true},{"id":"rumour_knock","text":"Rumour in the common rooms: someone swears they counted four knocks at three o'clock last night.","where":"Common Rooms","from":7,"to":10,"days":"any","weight":1},{"id":"rumour_corridor","text":"Two late revisers are telling anyone who will listen that the main corridor ran long last night, after the night burn.","where":"Lecture Halls","from":8,"to":12,"days":"weekday","weight":1},{"id":"fallen_tree","text":"A cracked tree has come down at the Forest's edge; the Groundskeeper's Lodge wants volunteers with strong backs.","where":"Groundskeeper's Lodge","from":8,"to":16,"days":"any","weight":1,"outdoor":true,"after_storm_x3":true},{"id":"study_group","text":"A Magic Theory study group has taken over a Study Room and is selling copies of its notes for points.","where":"Study Rooms","from":16,"to":20,"days":"weekday","weight":2},{"id":"pool_runes","text":"The warming runes on the Swimming Pool rim have failed; the water is ice-cold and the swim clubs are outraged.","where":"Swimming Pool","from":7,"to":18,"days":"any","weight":1},{"id":"inspectorate_clerk","text":"A crown clerk from the Royal Inspectorate was seen carrying ledgers towards the Warden's Office. Nobody knows why.","where":"Courtyards","from":9,"to":15,"days":"weekday","weight":1},{"id":"snow_clearing","text":"Snow came down overnight and buried the paths; the Groundskeeper's Lodge is hiring a snow-clearing crew, 20 to 40 points a shift.","where":"Groundskeeper's Lodge","from":7,"to":14,"days":"any","weight":6,"outdoor":false,"weather":"snow"},{"id":"storm_cleanup","text":"Yesterday's storm left branches and slipped roof slates across the grounds; the Groundskeeper's Lodge is paying a clean-up crew by the shift.","where":"Groundskeeper's Lodge","from":7,"to":16,"days":"any","weight":6,"outdoor":false,"weather":"after_storm"},{"id":"dove_fog","text":"Dense fog lies over the grounds and the Doves have doubled their patrols, stopping anyone they cannot see clearly until it lifts.","where":"","from":6,"to":12,"days":"any","weight":6,"outdoor":false,"weather":"dense_fog"}];
const HAPPEN_RATE = { off: 0, rare: 0.2, normal: 0.4, often: 0.65 };
const hash32 = (...parts) => {
  let h = 2166136261;
  for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return h >>> 0;
};
const rand01 = (...parts) => hash32(...parts) / 4294967296;
const JOURNAL_ARCHIVE = 300;
const FACTS_VISIBLE = 10;      // 5.4 token budget: the narrator reads each bond's latest 10 Known_facts; older ones go to $Known_old   // $ui.archive: journal lines the narrator no longer reads (UI only)

// ---------- helpers ----------
const pad = x => String(x).padStart(2, '0');
const toAbs = W => {
  const [h, mi] = String(W.Time || '08:00').split(':').map(Number);
  const di = Math.max(0, DAYS.indexOf(W.Day));
  const day = (((W.Year || 1) - 1) * YEAR_DAYS) + ((W.Month - 1) * 28) + ((W.Week - 1) * 7) + di;
  return day * DAY_MIN + (h || 0) * 60 + (mi || 0);
};
const fromAbs = abs => {
  let day = Math.floor(abs / DAY_MIN), min = abs - day * DAY_MIN;
  const Year = Math.floor(day / YEAR_DAYS) + 1; day -= (Year - 1) * YEAR_DAYS;
  const Month = Math.floor(day / 28) + 1; day -= (Month - 1) * 28;
  const Week = Math.floor(day / 7) + 1; day -= (Week - 1) * 7;
  return { Year, Month, Week, Day: DAYS[day], Time: `${pad(Math.floor(min / 60))}:${pad(min % 60)}` };
};
const stamp = W => `M${W.Month} W${W.Week} ${W.Day} ${W.Time}`;
const eventsOn = W => EVENTS.filter(e => e.m === W.Month && e.w === W.Week && e.d.includes(W.Day));
const pctOf = (v, max) => (max > 0 ? (v / max) * 100 : 0);
const num = (v, d = 0) => { const x = Number(v); return Number.isFinite(x) ? x : d; };
const dstamp = W => `M${W.Month} W${W.Week} ${W.Day}`;
// Parses a due/until text written by the AI ("M2 W1 Tue 14:00", "Month 3 Week 2", "Fri 18:00", "tomorrow 9am", "M4") into an
// absolute minute, relative to the current world time W. Missing parts: day -> Sunday of that week (or the next such weekday),
// week -> week 4 when only a month is given, time -> 23:59. Returns -1 when nothing date-like is found.
function parseWhen(str, W, absNow) {
  const s = String(str || '');
  const m = s.match(/\b(?:M|Month\s*)(\d{1,2})\b/i), w = s.match(/\b(?:W|Week\s*)([1-4])\b/i);
  const d = s.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:s|[a-z]*day)?\b/i);   // not \"Month\"
  const t = s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || s.match(/\b(\d{1,2}):(\d{2})\b/);
  const rel = s.match(/\b(today|tonight|tomorrow)\b/i);
  if (!m && !w && !d && !t && !rel) return -1;
  let hh = 23, mm = 59;
  if (t) { hh = +t[1] % 24; mm = +(t[2] || 0); if (t[3]) { hh = hh % 12 + (/pm/i.test(t[3]) ? 12 : 0); } }
  else if (rel && /tonight/i.test(rel[1])) { hh = 21; mm = 0; }
  const dayStart = Math.floor(absNow / DAY_MIN) * DAY_MIN;
  if (rel && !m && !w && !d) return dayStart + (/tomorrow/i.test(rel[1]) ? DAY_MIN : 0) + hh * 60 + mm;
  if (!m && !w) {                                              // weekday only: this one or the next one
    if (!d) return dayStart + hh * 60 + mm;
    const want = DAYS.indexOf(d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase()), now = DAYS.indexOf(W.Day);
    let add = (want - now + 7) % 7; const at = dayStart + add * DAY_MIN + hh * 60 + mm;
    return add === 0 && at < absNow - 12 * 60 ? at + 7 * DAY_MIN : at;
  }
  const M = m ? _.clamp(+m[1], 1, 12) : W.Month, Wk = w ? +w[1] : (m ? 4 : W.Week);
  const Dy = d ? d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase() : 'Sun';
  let abs = toAbs({ Year: W.Year, Month: M, Week: Wk, Day: Dy, Time: `${pad(hh)}:${pad(mm)}` });
  if (m && abs < absNow - 180 * DAY_MIN) abs += YEAR_DAYS * DAY_MIN;   // "M2" written in M11 means next year
  else if (!m && w && abs < absNow - 12 * 60) abs += 28 * DAY_MIN;   // "W1 Mon" written in W4 means next month
  return abs;
}
function whenText(abs, absNow) {
  if (abs < 0) return '';
  if (abs < absNow) return 'overdue';
  const T = fromAbs(abs), dd = Math.floor(abs / DAY_MIN) - Math.floor(absNow / DAY_MIN);
  const tm = T.Time === '23:59' ? '' : ' ' + T.Time;
  if (dd === 0) return 'today' + (tm || ' (by end of day)');
  if (dd === 1) return 'tomorrow' + tm;
  if (dd < 7) return `in ${dd} days (${T.Day}${tm})`;
  return `M${T.Month} W${T.Week} ${T.Day}${tm}`;
}
const capRecord = (obj, max, dropFirst) => {                   // drop the oldest keys (insertion order), preferring dropFirst(v)
  let keys = Object.keys(obj || {}); if (keys.length <= max) return;
  const order = dropFirst ? [...keys.filter(k => dropFirst(obj[k])), ...keys.filter(k => !dropFirst(obj[k]))] : keys;
  for (const k of order.slice(0, keys.length - max)) delete obj[k];
};

function periodOf(W, evs) {
  const [h] = W.Time.split(':').map(Number);
  const tt = TIMETABLE[W.Day];
  const suspended = evs.find(e => e.noclass || e.home || e.lockdown);
  let p;
  if (!tt) p = 'Sunday (no classes)';
  else if (h < 7) p = 'Night';
  else if (h < 8) p = 'Morning, before classes';
  else if (h < 10) p = `P1 08:00-10:00: ${tt[0]}`;
  else if (h < 12) p = `P2 10:00-12:00: ${tt[1]}`;
  else if (h < 13) p = 'Lunch';
  else if (h < 16) p = `P3 13:00-16:00: ${tt[2]}`;
  else if (h < 20) p = 'After classes';
  else p = 'Evening';
  if (suspended && /^P\d/.test(p)) p = `Timetable suspended (${suspended.t.split(' (')[0]})`;
  return p;
}
function curfewOf(W, evs, S) {
  if (evs.some(e => e.lockdown)) return 'LOCKDOWN (The Thinning): academy sealed, nobody outside, all week';
  if (evs.some(e => e.home)) return 'Break: most students have gone home; campus nearly empty';
  const [h] = W.Time.split(':').map(Number);
  // v1.0.3 (F01): on a trip or an off-grounds day, and not at a campus place, the dorm curfew does not apply
  const Tr = (S && S.Trip) || {};
  if (!onCampus(W.Location) && (Tr.Active || evs.some(e => e.away))) return `Away from campus${Tr.Active && Tr.Destination ? ` (${Tr.Destination})` : ''}: the dorm curfew does not apply; the teachers in charge set the rules`;
  // v1.0.3 (A#6): a no-curfew event lifts it from its first day's evening to its last day's dawn, not for the whole two days
  const nc = evs.find(e => e.nocurfew);
  if (nc && ((W.Day === nc.d[0] && h >= 12) || (W.Day === nc.d[nc.d.length - 1] && W.Day !== nc.d[0] && h < 7))) return '';
  const start = (evs.find(e => e.curfew) || {}).curfew || 20;
  return h >= start || h < 7 ? `CURFEW (${start}:00-07:00): students must be in their own dorms` : '';
}

// ---- F20 happenings ----
function dayParts(dayNo) { const doy = ((dayNo % YEAR_DAYS) + YEAR_DAYS) % YEAR_DAYS; return { Month: Math.floor(doy / 28) + 1, Week: Math.floor((doy % 28) / 7) + 1, Day: DAYS[doy % 7] }; }
function happeningFits(h, P) {
  const d = h.days || 'any';
  if (d === 'weekday' && !MON_FRI.includes(P.Day)) return false;
  if (d === 'weekend' && MON_FRI.includes(P.Day)) return false;
  if (Array.isArray(d) && !d.includes(P.Day)) return false;
  if (h.months && (P.Month < h.months[0] || P.Month > h.months[1])) return false;
  if (h.weeks && !h.weeks.includes(P.Week)) return false;
  return true;
}
// 1.1.0: weather (wxm = the Weather effects level). Full: outdoor items skip heavy weather, weather-only items need their weather,
// a fallen tree is 3x likelier the day after a storm. Any level but Off: "clear_night" items need a clear night (their text says so).
function wxFits(h, seed, dayNo, wxm) {
  if (wxm === 'off') return !h.weather || h.weather === 'clear_night';
  const D = wxDay(seed, dayNo).blocks, Y = wxDay(seed, dayNo - 1).blocks;
  if (h.weather === 'clear_night') return D[2].sky === 'Clear';
  if (wxm !== 'full') return !h.weather;
  if (h.outdoor && (wxHeavy(D[0]) || wxHeavy(D[1]))) return false;
  if (h.weather === 'snow') return Y[2].snow || D[0].snow;
  if (h.weather === 'after_storm') return Y.some(b => b.rare === 'lightning storm' || b.wind === 'gale');
  if (h.weather === 'dense_fog') return D[0].rare === 'dense fog';
  return !h.weather;
}
function rawHappening(seed, dayNo, rate, exclude, wxm = 'off') {
  const P = dayParts(dayNo), evs = eventsOn(P);
  if (!rate || evs.some(e => e.home || e.lockdown)) return null;       // breaks and the Thinning: nothing
  if (rand01(seed, dayNo, 'roll') >= rate * (evs.length ? 0.5 : 1)) return null;   // calendar days are busy enough
  const pool = HAPPENINGS.filter(h => happeningFits(h, P) && !(exclude || []).includes(h.id) && wxFits(h, seed, dayNo, wxm));
  const stormy = wxm === 'full' && wxDay(seed, dayNo - 1).blocks.some(b => b.sky === 'Storm' || b.wind === 'gale');
  const wt = h => (h.weight || 1) * (stormy && h.after_storm_x3 ? 3 : 1);
  const total = pool.reduce((a, h) => a + wt(h), 0);
  let r = rand01(seed, dayNo, 'pick') * total;
  for (const h of pool) { r -= wt(h); if (r < 0) return h; }
  return null;
}
function happeningOn(seed, dayNo, rate, wxm) {   // no repeat of the previous two days' happening
  const prev = [1, 2].map(k => rawHappening(seed, dayNo - k, rate, [], wxm)).filter(Boolean).map(h => h.id);
  return rawHappening(seed, dayNo, rate, prev, wxm);
}

// ---- 1.1.0 weather (spec §4): seasons, sky per block, wind, rare weather, °C. Pure functions of (seed, day): swipe-safe. ----
const SEASONS = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];   // by Month-1
const SKY = ['Clear', 'Cloudy', 'Overcast', 'Fog', 'Rain', 'Storm'];
const WX_BASE = { Winter: [25, 20, 25, 10, 18, 2], Spring: [30, 25, 15, 8, 20, 2], Summer: [50, 22, 8, 3, 12, 5], Autumn: [28, 22, 20, 12, 16, 2] };
const WX_BLOCK = [{ Fog: 2, Storm: 0.5 }, { Fog: 0.3, Storm: 1.8 }, {}];   // morning, afternoon, night
const WX_TRANS = { Clear: { Clear: 2, Cloudy: 1.2, Overcast: 0.6, Rain: 0.4, Storm: 0.6 }, Cloudy: { Cloudy: 1.4, Overcast: 1.3 },
  Overcast: { Overcast: 1.5, Rain: 2, Clear: 0.5 }, Fog: { Clear: 1.5, Cloudy: 1.3, Fog: 0.4 }, Rain: { Rain: 1.8, Overcast: 1.5, Storm: 1.3, Clear: 0.4 },
  Storm: { Rain: 2, Overcast: 1.5, Storm: 0.5 } };
const WX_MEAN = [2, 3, 7, 11, 15, 19, 21, 21, 17, 12, 7, 3];   // monthly mean °C (owner-approved table)
const BLOCKS = ['morning', 'afternoon', 'night'], BLOCK_T = [-2, 4, -4];
const FC_NEAR = { Clear: ['Cloudy'], Cloudy: ['Clear', 'Overcast', 'Fog'], Overcast: ['Cloudy', 'Rain'], Fog: ['Cloudy'], Rain: ['Overcast', 'Storm'], Storm: ['Rain'] };
const FC_TRUE = 75;            // Divination Society forecast: d100 <= 75 -> the true sky (owner: 70-80%)
const d100 = (...p) => hash32(...p) % 100 + 1;
const tempLabel = t => (t <= 0 ? 'freezing' : t <= 7 ? 'cold' : t <= 14 ? 'cool' : t <= 21 ? 'mild' : t <= 27 ? 'warm' : 'hot');
// night belongs to the day it starts on: 03:00 is the night block of the previous day
const blockOf = abs => { const day = Math.floor(abs / DAY_MIN), h = Math.floor((abs - day * DAY_MIN) / 60); return h < 6 ? [day - 1, 2] : [day, h < 12 ? 0 : h < 18 ? 1 : 2]; };
function wxRollDay(seed, day, prev) {                          // prev = the previous block ({sky, wind}) or null
  const P = dayParts(day), season = SEASONS[P.Month - 1];
  const heat = season === 'Summer' && d100(seed, day, 'heat') >= 98;   // heatwave: the whole day clear, +8 °C
  const tv = hash32(seed, day, 'tv') % 7 - 3, blocks = [];
  for (let b = 0; b < 3; b++) {
    let sky = 'Clear';
    if (!heat) {
      const w = SKY.map(k => WX_BASE[season][SKY.indexOf(k)] * (WX_BLOCK[b][k] || 1) * (prev ? (WX_TRANS[prev.sky][k] || 1) : 1));
      let r = rand01(seed, day, b, 'sky') * w.reduce((a, x) => a + x, 0);
      sky = SKY[SKY.length - 1];
      for (let i = 0; i < SKY.length; i++) { r -= w[i]; if (r < 0) { sky = SKY[i]; break; } }
    }
    const prevWet = !!prev && (prev.sky === 'Rain' || prev.sky === 'Storm');
    let temp = WX_MEAN[P.Month - 1] + BLOCK_T[b] + tv + (sky === 'Rain' ? -2 : 0) + (season === 'Summer' && sky === 'Clear' && b === 1 ? 2 : 0) + (heat ? 8 : 0);
    let rain = '', snow = false;
    if (sky === 'Rain') {
      const ri = d100(seed, day, b, 'ri') + (prevWet ? 15 : 0);
      rain = ri <= 45 ? 'light' : ri <= 85 ? 'steady' : 'heavy';
      if (season === 'Winter' && temp <= 3) snow = d100(seed, day, b, 'snow') <= (P.Month === 12 ? 60 : 70) + (b !== 1 ? 15 : 0);
    }
    const th = 93 - (b === 1 ? 5 : 0) - (season === 'Spring' || season === 'Autumn' ? 4 : 0) - (sky === 'Rain' ? 6 : 0) - (prev && prev.wind ? 15 : 0) + (sky === 'Clear' ? 3 : 0);
    const wr = d100(seed, day, b, 'wind');
    let wind = wr >= 100 ? 'gale' : wr >= th ? 'windy' : '';
    if (sky === 'Storm') wind = wr >= 95 ? 'gale' : 'windy';
    const rr = d100(seed, day, b, 'rare'), warm = season === 'Spring' || season === 'Summer';
    let rare = heat ? 'heatwave' : '';
    if (!rare && sky === 'Storm' && warm && b >= 1 && rr >= 71) rare = 'lightning storm';
    else if (!rare && sky === 'Storm' && warm && b === 1 && rr >= 51) rare = 'hail';
    else if (!rare && snow && wind) rare = 'blizzard';
    else if (!rare && sky === 'Fog' && (season === 'Autumn' || season === 'Winter') && b === 0 && rr >= 80) rare = 'dense fog';
    if (rare === 'blizzard') temp -= 6;
    blocks.push({ sky, rain, snow, wind, rare, temp: Math.round(temp) });
    prev = blocks[b];
  }
  return { season, blocks };
}
const WXC = new Map();
function wxDay(seed, day) {                                    // chain without state: 3 days of warm-up, then the day itself
  const key = seed + '|' + day; if (WXC.has(key)) return WXC.get(key);
  let prev = null;
  for (let d = day - 3; d < day; d++) prev = wxRollDay(seed, d, prev).blocks[2];
  const r = wxRollDay(seed, day, prev);
  if (WXC.size > 400) WXC.clear(); WXC.set(key, r);
  return r;
}
function wxText(bk) {
  const main = bk.rare === 'lightning storm' ? 'lightning storm' : bk.rare === 'hail' ? 'hailstorm' : bk.rare === 'blizzard' ? 'blizzard'
    : bk.rare === 'dense fog' ? 'dense fog (visibility a few metres)' : bk.snow ? `${bk.rain} snow` : bk.sky === 'Rain' ? `${bk.rain} rain` : bk.sky.toLowerCase();
  return [main, bk.rare === 'heatwave' ? 'heatwave' : '', bk.wind && bk.rare !== 'blizzard' ? (bk.wind === 'gale' ? 'gale' : 'windy') : ''].filter(Boolean).join(', ');
}
function wxForecast(seed, day) {                               // the Divination Society's posting for `day` (rare events are never forecast)
  const D = wxDay(seed, day);
  return D.blocks.map((bk, b) => {
    let sky = bk.sky;
    if (d100(seed, day, b, 'fc') > FC_TRUE) { const nb = FC_NEAR[sky]; sky = nb[hash32(seed, day, b, 'fcn') % nb.length]; }
    const t = bk.temp - (bk.rare === 'heatwave' ? 8 : 0) + (bk.rare === 'blizzard' ? 6 : 0);
    return { sky, text: sky === 'Rain' && D.season === 'Winter' && t <= 3 ? 'snow' : sky.toLowerCase(), label: tempLabel(t) };
  });
}
const wxBad = bk => !!bk && (bk.sky === 'Rain' || bk.sky === 'Storm');                              // rain, snow or storm
const wxHeavy = bk => !!bk && (bk.sky === 'Storm' || bk.rain === 'heavy' || bk.rare === 'blizzard' || bk.rare === 'hail');
// winter flu wave: 1-2 a year in Months 1-2 (Month 12 is the holiday), 5 days each, seeded
function fluOn(seed, day) {
  const Y = Math.floor(day / YEAR_DAYS), doy = day - Y * YEAR_DAYS;
  if (doy >= 56) return false;
  for (let k = 0, n = 1 + hash32(seed, Y, 'flu') % 2; k < n; k++) { const st = hash32(seed, Y, k, 'flus') % 51; if (doy >= st && doy < st + 5) return true; }
  return false;
}
// outdoor places (spec §4.8; generated by gen_engine from data/locations.json) and weather gear from Bag item names
const OUTDOOR = ["archery range", "boathouse and lake", "broken statue", "combat grounds", "courtyards", "fishing house", "forest", "forest clearing", "founder's statue and park", "founders statue and park", "gardens", "grassy field and hills", "menagerie", "observation tower", "rooftop", "sports field", "swimming pool", "willow island"];
const isOutdoor = loc => { const p = placeOf(loc).toLowerCase(); return !!p && OUTDOOR.some(c => p === c || p.startsWith(c + ' ') || p.startsWith(c + ',')); };
const GEAR = { umbrella: /umbrella/i, waterproof: /waterproof|oilskin|rain cloak|raincoat/i, warm: /wool|scarf|winter cloak|mittens/i, sun: /sun hat|straw hat/i };
const gearOf = I => { const ks = Object.keys(I || {}).filter(k => (I[k] && I[k].Qty) > 0).join(' | '); return _.mapValues(GEAR, rx => rx.test(ks)); };
const COND = {
  Soaked: 'Wet through: rest and sleep restore half the usual stamina. Dries after an hour indoors.',
  Chilled: 'Cold to the bone: -10 stamina per hour outdoors. Warms up after an hour indoors or a hot drink.',
  Overheated: 'Too hot: -10 stamina per hour outdoors. Cools down after half an hour indoors or a cold drink.',
  'Head cold': 'Stuffy and slow: stamina capped at 80% of max until it passes or the Medical Centre treats it.',
};
// ---- 1.1.0 Features settings (spec §9): which state each feature parks when it is off (data/features.json, injected) ----
const FEATURES = [{"id":"planner","control":"toggle","paths":["Commitments"],"unlock":"planner"},{"id":"notices","control":"toggle","paths":["Notices"],"unlock":"notices"},{"id":"letters","control":"toggle","paths":["Letters"],"unlock":"letters"},{"id":"mystery","control":"toggle","paths":["Clues","Mysteries"],"unlock":"mystery"},{"id":"competition","control":"toggle","paths":["Competition"],"unlock":"competition"},{"id":"projects","control":"toggle","paths":["Projects"],"unlock":"projects"},{"id":"trip","control":"toggle","paths":["Trip"],"unlock":"trip"},{"id":"battle","control":"toggle","paths":["Battle"],"unlock":"battle"},{"id":"inventory","control":"toggle","paths":["Inventory"],"unlock":"inventory"},{"id":"happenings","control":"levels","field":"happenings"},{"id":"weather","control":"levels","field":"wxfx","paths":["Player.Conditions"],"unlock":"conditions"},{"id":"class","control":"toggle"},{"id":"hooks","control":"toggle","paths":["Hooks"]},{"id":"gossip","control":"toggle"}];
const EMPTY = { Commitments: {}, Notices: {}, Letters: {}, Clues: {}, Mysteries: {}, Projects: {}, Inventory: {}, Hooks: {}, 'Player.Conditions': {},
  Competition: { Tier: '', Status: '', Placement: '', Team: [], Results: [] }, Trip: { Active: false, Destination: '', Companions: [], Note: '' },
  Battle: { Active: false, Combatants: {} } };
// parkOff: the feature's state is parked (weather effects: anything but Full); ruleOff: its rules and UI are off (weather: Off only)
const parkOff = (X, f) => { const u = (X && X.$ui) || {}; return f.control === 'levels' ? (f.id === 'weather' ? (u.wxfx || 'full') !== 'full' : (u[f.field] || 'normal') === 'off') : (u.off || []).includes(f.id); };
const isEmptyV = v => v == null || v === '' || v === false || (Array.isArray(v) && !v.length) || (_.isPlainObject(v) && !Object.keys(v).length);
function mergePark(to, from) {                                  // a write into a parked module is kept in the parking, not dropped
  if (_.isPlainObject(to) && _.isPlainObject(from)) {
    for (const [k, v] of Object.entries(from)) if (!isEmptyV(v)) to[k] = Array.isArray(v) && Array.isArray(to[k]) ? [...new Set([...to[k], ...v])] : _.cloneDeep(v);
    return to;
  }
  return isEmptyV(from) ? to : _.cloneDeep(from);
}
const REACH = (m, age) => (age <= 0 ? 'only witnesses' : m.fate === 'fast' && age <= 6 ? 'all over campus' : age <= 2 ? "the source's dorm and club" : age <= 6 ? 'most of campus' : 'old news, everyone knows');
const CAP_HOOKS = 15, CAP_BAG = 40, BOTTLE_BACK = 2;

// v1.0.3 (F14): a save made before a field existed may reach the engine without it (an update the schema never parsed).
// Fill missing containers with their empty shape; existing values are never touched. Arrays are only set when missing.
const SHAPE = {
  Scene: { Present: {} },
  Player: { Profile: { Reputation: {} }, Vitals: {}, Injuries: {}, Wallet: { Points: 0, Coin: 0, Transactions: [] }, Academics: { Grades: {}, Exams: {} }, Conditions: {} },
  Magic: { _Techniques: {}, _Affinity: { Types: [], Dominant: '', Specialties: [], Preset: '' }, Active: {}, Casts: [], Pacts: {} },
  Hidden: { _True_magic: '', Known_by: [], Dove_attention: 0 },
  Bonds: {}, Campus_State: { Events: {}, Rumours: [], Location_changes: {}, NPC_status: {}, New_relations: {}, Secrets_revealed: [], Graduated: [] },
  Commitments: {}, Notices: {}, Letters: {}, Journal: [], Clues: {}, Mysteries: {},
  Competition: { Tier: '', Status: '', Placement: '', Team: [], Results: [] }, Projects: {},
  Trip: { Active: false, Destination: '', Companions: [], Note: '' }, Battle: { Active: false, Combatants: {} }, _Log: [],
  Inventory: {}, Hooks: {},   // 1.1.0
  _Perks: {}, Rep_events: [], Training: [], Perk_use: [],   // 1.3.0
};
function fillShape(o, shape) {
  for (const [k, v] of Object.entries(shape)) {
    if (o[k] === undefined || o[k] === null) o[k] = _.cloneDeep(v);
    else if (_.isPlainObject(v) && _.isPlainObject(o[k]) && Object.keys(v).length) fillShape(o[k], v);
  }
}
const BOND0 = { Rank: 0, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '' };
const ENGINE_VER = '1.3.0';

function runEngine(S, B, text, seedHint) {
  if (!S || !S.World) return;
  fillShape(S, SHAPE);
  const log = [], jnl = [];                                    // jnl: journal lines the engine adds itself (5.1)
  S.$eng = S.$eng || { abs: -1, daily: {} };
  S.$ui = S.$ui || { unlocks: [], discovered: [], toasts: [] };
  for (const k of ['unlocks', 'discovered', 'toasts', 'names', 'archive', 'secrets', 'off', 'rumours_old']) if (!Array.isArray(S.$ui[k])) S.$ui[k] = [];
  if (!_.isPlainObject(S.$ui.parked)) S.$ui.parked = {};
  if (!['off', 'flavor', 'full'].includes(S.$ui.wxfx)) S.$ui.wxfx = 'full';
  S.$eng.ver = ENGINE_VER;
  const hasB = !!(B && B.World);
  if (hasB) S.$ui.toasts = [];                                  // toasts = what happened in THIS update only

  // ---- 0. read-only fields: only a Student Builder patch (auth = 'builder') may change them ----
  const byBuilder = S.$eng.auth === 'builder';
  if (hasB && !byBuilder) {
    const keep = [['Magic', '_Techniques'], ['Magic', '_Affinity'], ['Hidden', '_True_magic'], ['$ui', 'built'], ['$ui', 'file'], ['_Perks']];
    for (const path of keep) {
      const was = _.get(B, path);
      if (was !== undefined && !_.isEqual(_.get(S, path), was)) { _.set(S, path, _.cloneDeep(was)); log.push(`${path.join('.')} is read-only; the change was reverted.`); }
    }
  }
  if (byBuilder) S.$ui.toasts.push('Student file updated');
  S.$eng.auth = '';
  let healedMax = false;
  // 1.2.0 (owner playtest: a reload came back with the student's magic empty): the Builder keeps its own record in $ui.file.
  // A built student whose Builder-only fields are all empty gets them back from that record. The Builder always writes both
  // together, so an empty set next to a full record is a lost write, never a choice.
  {
    const F = S.$ui.file, M = S.Magic, A = M._Affinity || {};
    if (S.$ui.built && F && typeof F === 'object' && _.isEmpty(M._Techniques) && !(A.Types || []).length
      && (!_.isEmpty(F.Techniques) || ((F.Affinity || {}).Types || []).length)) {
      M._Techniques = _.cloneDeep(F.Techniques || {}); M._Affinity = _.cloneDeep(F.Affinity || {});
      if (F.Mana_max > 0) { S.Player.Vitals.Mana_max = F.Mana_max; healedMax = true; }
      if (F.True_magic && !S.Hidden._True_magic) S.Hidden._True_magic = F.True_magic;
      log.push('The student file was restored from the Builder record (magic had come back empty).');
    }
  }

  // 1.3.0 training: Mana_max and Stamina_max grow only through training (engine §6b) or the Student Builder. Any other change is
  // reverted; a Builder change (or the self-heal above) moves the starting value the training limits are measured from.
  {
    const V0 = S.Player.Vitals, TS = S.Player.$Training || (S.Player.$Training = {}), TB = hasB ? ((B.Player || {}).$Training || {}) : {};
    for (const [k, t] of Object.entries(TRN.tracks || {})) {
      const cur = num(V0[t.field], 1), prev = hasB ? num(((B.Player || {}).Vitals || {})[t.field], cur) : cur, o = TB[k] || TS[k];
      let base = o && o.base > 0 ? o.base : cur;
      const gain = o ? num(o.gain, 0) : 0;
      if (hasB && cur !== prev) {
        if (byBuilder || healedMax) base = Math.max(1, r2(cur - gain));
        else { V0[t.field] = prev; log.push(`${t.label} (${t.field}) grows only through training or the Student Builder; the change was reverted.`); }
      }
      TS[k] = { base, gain, w: o ? num(o.w, -1) : -1, wg: o ? num(o.wg, 0) : 0 };
    }
    V0.Mana = Math.min(V0.Mana, V0.Mana_max); V0.Stamina = Math.min(V0.Stamina, V0.Stamina_max);
  }

  // ---- 0b. 1.1.0 Features settings: a feature that is off has its state parked in $ui.parked (hidden from the AI) and is not processed.
  // Turning it back on restores it. A write the AI still makes into a parked module is merged into the parking, not dropped.
  // On the update that toggles a feature, the "before" copy of its state is aligned, so the toggle is not read as a story change.
  {
    const parked = S.$ui.parked;
    let Bw = B;
    for (const f of FEATURES) {
      if (!f.paths) continue;
      const offA = parkOff(S, f), offB = hasB ? parkOff(B, f) : offA;
      if (offA) {
        const Pk = parked[f.id] || (parked[f.id] = {});
        for (const p of f.paths) {
          const cur = _.get(S, p);
          Pk[p] = p in Pk ? mergePark(Pk[p], cur) : _.cloneDeep(cur === undefined ? EMPTY[p] : cur);
          _.set(S, p, _.cloneDeep(EMPTY[p]));
        }
      } else if (parked[f.id]) {
        for (const p of f.paths) if (parked[f.id][p] !== undefined) _.set(S, p, mergePark(_.cloneDeep(parked[f.id][p]), _.get(S, p)));
        delete parked[f.id];
      }
      if (hasB && offA !== offB) { if (Bw === B) Bw = _.cloneDeep(B); for (const p of f.paths) _.set(Bw, p, _.cloneDeep(_.get(S, p))); }
    }
    B = Bw;
  }
  // features whose rules, unlocks and UI are off (weather: level Off; happenings: level off)
  const OFF = new Set(S.$ui.off);
  if (S.$ui.happenings === 'off') OFF.add('happenings');
  if (S.$ui.wxfx === 'off') OFF.add('weather');
  const offUnlock = new Set(FEATURES.filter(f => f.unlock && parkOff(S, f)).map(f => f.unlock));

  // ---- 1. time ----
  const absB = hasB ? (B.$eng && B.$eng.abs >= 0 ? B.$eng.abs : toAbs(B.World)) : toAbs(S.World);
  let absA = toAbs(S.World);
  if (hasB && absA < absB) {
    // v1.0.3 (A#1): the AI wrote a new Day but forgot to roll Week/Month/Year -> keep its Day and Time and move forward by whole
    // weeks (up to a bit over a year); only the clock passed midnight with the same Day -> +1 day
    const dayChanged = S.World.Day !== B.World.Day;
    const step = dayChanged ? 7 * DAY_MIN : DAY_MIN, limit = dayChanged ? 60 : 1;
    let k = 0;
    while (absA < absB && k < limit) { absA += step; k++; }
    if (absA < absB) { absA = absB; log.push('Time cannot move backwards; the clock was kept.'); }
  }
  Object.assign(S.World, fromAbs(absA));
  const elapsed = hasB ? Math.max(0, absA - absB) : 0;
  const evs = eventsOn(S.World);
  // 1.2.0: {{user}}'s birthday (Builder, Profile.Birthday "M? W? Day") joins the day's events; lore entry 508 says how it plays out
  const bd = /^M(\d{1,2}) W([1-4]) (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.exec(String(S.Player.Profile.Birthday || '').trim());
  const bday = bd && +bd[1] === S.World.Month && +bd[2] === S.World.Week && bd[3] === S.World.Day;
  S.World._Event_today = [...evs.map(e => e.t), ...(bday ? [`${S.Player.Profile.Name || 'Your'}'s birthday`] : [])].join('; ');
  S.World._Period = periodOf(S.World, evs);
  S.World._Curfew = curfewOf(S.World, evs, S);
  // F20: today's happening (visible from the day's start until its window closes)
  if (!(S.$eng.seed > 0)) S.$eng.seed = (hash32(String(seedHint || ''), stamp(S.World), String(S.Player.Profile.Name || '')) % 2147483646) + 1;
  {
    const rate = HAPPEN_RATE[S.$ui.happenings] ?? HAPPEN_RATE.normal;
    const h = happeningOn(S.$eng.seed, Math.floor(absA / DAY_MIN), rate, S.$ui.wxfx), hr = Math.floor((absA % DAY_MIN) / 60);
    if (h && hr < h.to) {
      const win = `${pad(h.from)}:00–${pad(h.to)}:00`, now = hr >= h.from;
      S.World._Happening = `${now ? 'Now, until ' + pad(h.to) + ':00' : win}${h.where ? ', ' + h.where : ', around campus'}: ${h.text}`;
      S.$ui.hap = { id: h.id, where: h.where || '', from: h.from, to: h.to, text: h.text, now };
      if (hasB && (!B.$ui || !B.$ui.hap || B.$ui.hap.id !== h.id || Math.floor(absB / DAY_MIN) !== Math.floor(absA / DAY_MIN))) S.$ui.toasts.push(`Around campus: ${h.where || 'campus-wide'}`);
    } else { S.World._Happening = ''; S.$ui.hap = null; }
  }
  const dayNo = Math.floor(absA / DAY_MIN);
  const dayNoB = Math.floor(absB / DAY_MIN);
  if (hasB && dayNo !== dayNoB && evs.some(e => e.ranking)) log.push('Results & Dorm Ranking today: update Player.Profile.Dorm_rank when the results are announced.');
  if (hasB && dayNo !== dayNoB && evs.some(e => e.grad)) log.push('Graduation today: the third-years leave by airship tomorrow morning; the engine then lists them in Campus_State.Graduated.');
  if (hasB && S.World.Year > (B.World.Year || 1)) log.push(`A new academic year began (Year ${S.World.Year}): update Player.Profile.Year if {{user}} moved up.`);

  // ---- 1b. 1.1.0 weather (spec §4): season, sky, wind, rare weather and °C for the current block; the Divination Society forecast ----
  const WXM = S.$ui.wxfx, seed = S.$eng.seed;
  const away = /^Away from campus/.test(S.World._Curfew || '');
  let wxNow = null, wxBlk = null;                              // wxNow: the block whose effects apply (Full, on campus)
  if (WXM === 'off') { S.World._Season = ''; S.World._Weather = ''; S.$ui.wx = null; }
  else {
    const [wd, wb] = blockOf(absA), D = wxDay(seed, wd), bk = D.blocks[wb];
    const lab = x => ({ ...x, label: tempLabel(x.temp) });
    wxBlk = bk;
    S.World._Season = D.season;
    S.World._Weather = away ? "Away: local weather is the narrator's call" : `${_.capitalize(BLOCKS[wb])}, ${D.season.toLowerCase()}: ${wxText(bk)}, ${bk.temp} °C (${tempLabel(bk.temp)})`;
    const fday = (absA % DAY_MIN) >= 7 * 60 ? dayNo + 1 : dayNo;   // posted daily at 07:00 for the next day
    S.$ui.wx = { mode: WXM, season: D.season, away, block: wb, now: lab(bk), text: wxText(bk), blocks: D.blocks.slice(0, wb + 1).map(lab),
      fc: { day: fday, tomorrow: fday > dayNo, blocks: wxForecast(seed, fday) }, flu: false, sick: [], field: '' };
    if (WXM === 'full' && !away) {
      wxNow = bk;
      if (fluOn(seed, dayNo)) {                                  // a cold is going around: 1-2 seeded students off sick today
        const pool = Object.keys(STUDENTS).filter(id => (STUDENTS[id][1] || 1) <= S.World.Year && yearOf(id, S.World.Year) <= 3 && !(S.Campus_State.Graduated || []).includes(id)).sort();
        const sick = [];
        for (let k = 0, n = 1 + hash32(seed, dayNo, 'sickn') % 2; k < n && pool.length; k++) sick.push(pool.splice(hash32(seed, dayNo, k, 'sick') % pool.length, 1)[0]);
        Object.assign(S.$ui.wx, { flu: true, sick });
      }
      if (isOutdoor(S.World.Location)) {                         // outdoor fights: field line for the narrator and the Battle panel
        S.$ui.wx.field = [bk.sky === 'Rain' ? 'wet footing' : '', bk.sky === 'Fog' ? (bk.rare === 'dense fog' ? 'very low visibility' : 'low visibility') : '',
          bk.wind ? 'gusts' : '', bk.temp >= 28 ? 'heat' : ''].filter(Boolean).join(', ');
      }
    }
    if (hasB && bk.rare && !away) {                              // a rare event: toast + log when it begins
      const [bd, bb] = blockOf(absB), b0 = wxDay(seed, bd).blocks[bb];
      if ((bd !== wd || bb !== wb) && b0.rare !== bk.rare) { S.$ui.toasts.push(`Weather: ${bk.rare}`); log.push(`Rare weather: ${wxText(bk)}.`); }
    }
  }

  // ---- 2. magic: casts ----
  const V = S.Player.Vitals, M = S.Magic, T = M._Techniques || {};
  const BA = (hasB && B.Magic && B.Magic.Active) || {};
  // v1.0.3 (A#3): the AI never sees $ fields, so a whole-record replace drops them; the same effect keeps its start time
  for (const [k, e] of Object.entries(M.Active || {})) {
    const e0 = BA[k];
    if (e0 && e0.Technique === e.Technique && !(e.$started >= 0) && e0.$started >= 0) { e.$started = e0.$started; e.$settled = e0.$settled; }
  }
  const activeNow = tq => Object.values(M.Active || {}).some(e => e.Technique === tq);
  for (const c of M.Casts || []) {
    const t = T[c.Technique];
    if (!t) { log.push(`Unknown technique "${c.Technique}" was reported; nothing was charged.`); continue; }
    // v1.0.3 (A#4/F05): a sustained effect is cast by its Active entry, which pays the Activation; a Casts entry for it is not a second cast
    if (t.Cost_mode === 'sustained' && activeNow(c.Technique)) { log.push(`${c.Technique} is sustained: its Active entry already paid the activation, so the Casts entry was not charged.`); continue; }
    // hybrid: while the effect is running, a triggered use costs Trigger; otherwise a cast costs Activation
    const running = Object.values(M.Active || {}).some(e => e.Technique === c.Technique);
    const unit = t.Cost_mode === 'hybrid' && t.Trigger > 0 && running ? t.Trigger : (t.Activation || 0);
    const cost = unit * (c.Times || 1);
    if (cost > V.Mana) { log.push(`${c.Technique} needed ${cost} mana but only ${Math.floor(V.Mana)} was left: the casting strained or failed (mana now 0).`); V.Mana = 0; }
    else V.Mana -= cost;
  }
  M.Casts = [];

  // ---- 3. magic: sustained effects ----
  let upkeepRunning = false;
  const endPact = eff => {   // v1.0.3 (F06): the engine ended a pact summon -> the spirit is no longer summoned
    const t = T[eff.Technique], m = t && /^\[pact\]\s*(.+)$/.exec(t.Notes || '');
    if (m && /^Summon /.test(eff.Technique) && M.Pacts && M.Pacts[m[1].trim()]) M.Pacts[m[1].trim()].Summoned = false;
  };
  const settle = (name, eff, until) => {
    const t = T[eff.Technique];
    const rate = t ? (t.Upkeep_per_min || 0) : 0;
    const from = eff.$settled >= 0 ? eff.$settled : until;
    const mins = Math.max(0, until - from);
    if (rate <= 0 || mins <= 0) { eff.$settled = until; return true; }
    const need = rate * mins;
    if (need <= V.Mana) { V.Mana -= need; eff.$settled = until; return true; }
    const lasted = Math.floor(V.Mana / rate); V.Mana = 0;
    log.push(`${name} ended at ${fromAbs(from + lasted).Time}: mana ran out.`);
    return false;
  };
  for (const [name, eff] of Object.entries(BA)) {              // effects the AI ended this turn: settle up to now
    if (!(name in M.Active)) settle(name, { ...eff }, absA);
  }
  for (const [name, eff] of Object.entries(M.Active)) {
    const t = T[eff.Technique];
    if (!(name in BA) || eff.$started < 0) {                    // started this turn
      eff.$started = absA; eff.$settled = absA;
      if (t && t.Cost_mode !== 'per_use' && t.Activation) {
        if (t.Activation > V.Mana) { log.push(`${name} could not be sustained: not enough mana to activate.`); endPact(eff); delete M.Active[name]; continue; }
        V.Mana -= t.Activation;
      }
      if (!t) log.push(`Active effect "${name}" names no known technique; no upkeep is charged.`);
    } else {
      eff.$started = BA[name].$started; eff.$settled = BA[name].$settled;
      if (!settle(name, eff, absA)) { endPact(eff); delete M.Active[name]; continue; }
    }
    if (t && t.Upkeep_per_min > 0) upkeepRunning = true;
  }

  // ---- 4. rest & recovery (1.1.0: Soaked halves stamina recovery; sleep quality follows the night's weather, Full only) ----
  const deadBefore = hasB ? B.Player.Vitals.HP <= 0 : V.HP <= 0;
  const Cn = S.Player.Conditions || (S.Player.Conditions = {});
  if (elapsed > 0 && V.Resting !== 'none') {
    const h = elapsed / 60;
    let stMul = wxNow && Cn.Soaked ? 0.5 : 1;
    if (V.Resting === 'sleep' && wxNow) {
      const [sd, sb] = blockOf(absB), nb = wxDay(seed, sb === 2 ? sd : Math.floor(absB / DAY_MIN)).blocks[2];   // the night of the sleep
      stMul *= 1 + (nb.sky === 'Rain' && !nb.snow && nb.rain !== 'heavy' ? 0.1 : 0) - (nb.sky === 'Storm' ? 0.2 : 0) - (nb.temp >= 22 ? 0.1 : 0);
    }
    if (V.Resting === 'sleep') {
      V.Stamina += V.Stamina_max * Math.min(1, h / 6) * stMul;
      if (!upkeepRunning) V.Mana += h >= 6 ? V.Mana_max : V.Mana_max * (h / 6) * 0.8;
      if (h >= 6 && V.HP > 0 && !deadBefore && !Object.values(S.Player.Injuries).some(i => i.Severity === 'serious' || i.Severity === 'critical')) V.HP += 5;   // v1.0.3 (F07, D13): no sleeping back from death
    } else {
      V.Stamina += 20 * h * stMul;
      if (!upkeepRunning) V.Mana += 5 * h;
    }
  }
  V.Resting = 'none';

  // ---- 4b. 1.1.0 weather effects (Full, on campus): outdoor exposure -> Soaked / Chilled / Overheated, daily Head cold roll ----
  {
    const xs = _.isPlainObject(S.$eng.wxs) ? S.$eng.wxs : (S.$eng.wxs = {});
    for (const k of ['wet', 'cold', 'hot', 'dry']) if (!(xs[k] >= 0)) xs[k] = 0;
    if (!(xs.exp > -1e9)) xs.exp = -1e9; if (!(xs.hc > -1e9)) xs.hc = -1e9;
    const C0 = (hasB && B.Player && B.Player.Conditions) || {};
    const storyNew = hasB && Object.keys(Cn).some(k => !C0[k] && k !== 'Head cold');   // the story added one (a bucket of water)
    for (const k of Object.keys(C0)) if (!Cn[k]) { if (k === 'Soaked') xs.wet = 0; if (k === 'Chilled') xs.cold = 0; if (k === 'Overheated') xs.hot = 0; if (k === 'Head cold') xs.hc = -1e9; }   // the story removed it
    if (wxNow) {
      const bk = wxNow, gear = gearOf(S.Inventory), since = stamp(S.World);
      const outB = hasB && isOutdoor(B.World.Location), outA = isOutdoor(S.World.Location);
      const o = elapsed > 0 ? (outB && outA ? elapsed : outB || outA ? elapsed / 2 : 0) : 0;
      const add = (k, why) => { if (!Cn[k]) { Cn[k] = { Effect: COND[k], Since: since }; S.$ui.toasts.push(`Condition: ${k}`); log.push(`{{user}} is now ${k} (${why}).`); } };
      // head cold: one roll at the first update of a new day
      if (hasB && dayNo !== dayNoB && !Cn['Head cold']) {
        const p = (xs.exp >= dayNoB ? 0.15 : 0) + (fluOn(seed, dayNo) ? 0.05 : 0) + (pctOf(V.Stamina, V.Stamina_max) < 30 ? 0.05 : 0);
        if (p > 0 && rand01(seed, dayNo, 'hc') < p) { xs.hc = dayNo + 2 + hash32(seed, dayNo, 'hcd') % 3; add('Head cold', `for ${xs.hc - dayNo} days`); }
      }
      if (Cn['Head cold'] && xs.hc > -1e9 && dayNo >= xs.hc) { delete Cn['Head cold']; xs.hc = -1e9; S.$ui.toasts.push('Head cold is over'); }
      const dryProt = gear.waterproof || (gear.umbrella && !bk.wind && bk.sky !== 'Storm');
      xs.wet = o > 0 && wxBad(bk) && !dryProt ? xs.wet + o : 0;
      if (xs.wet >= (wxHeavy(bk) ? 5 : 20)) add('Soaked', gear.umbrella && !gear.waterproof ? 'the wind beat the umbrella' : 'caught out in the ' + (bk.snow ? 'snow' : 'rain'));
      xs.cold = o > 0 && bk.temp <= (gear.warm ? -5 : 0) ? xs.cold + o : 0;
      if (xs.cold >= 30 || (Cn.Soaked && o > 0 && bk.temp <= (gear.warm ? 3 : 8))) add('Chilled', `${bk.temp} °C outdoors`);
      xs.hot = o > 0 && bk.temp >= (gear.sun ? 31 : 28) && (bk.sky === 'Clear' || bk.sky === 'Cloudy') ? xs.hot + o : 0;
      if (xs.hot >= 60) add('Overheated', `${bk.temp} °C in the sun`);
      for (const k of ['Chilled', 'Overheated']) if (Cn[k] && o > 0) V.Stamina -= 10 * o / 60;
      xs.dry = outA ? 0 : xs.dry + (outB ? elapsed - o : elapsed);
      if (storyNew) xs.dry = 0;                                  // ...so it lasts its full time from now
      for (const [k, mins] of [['Soaked', 60], ['Chilled', 60], ['Overheated', 30]]) if (Cn[k] && xs.dry >= mins && !(k === 'Chilled' && xs.cold)) { delete Cn[k]; S.$ui.toasts.push(`${k}: over`); }
      if (Cn.Soaked || Cn.Chilled) xs.exp = dayNo;
      if (Cn['Head cold']) V.Stamina = Math.min(V.Stamina, V.Stamina_max * 0.8);
    }
  }

  // ---- 5. vitals ----
  if (hasB) {
    const dmg = B.Player.Vitals.HP - V.HP;
    if (dmg > 40 && !V.Lethal_flag) { V.HP = B.Player.Vitals.HP - 40; log.push(`HP loss capped at 40 (no lethal flag): HP ${Math.round(V.HP)}.`); }
    if (V.HP <= 0 && B.Player.Vitals.HP > 0) log.push('{{user}} has died.');
  }
  V.Lethal_flag = false;
  V.HP = _.clamp(V.HP, 0, V.HP_max); V.Stamina = _.clamp(V.Stamina, 0, V.Stamina_max); V.Mana = _.clamp(Math.round(V.Mana * 10) / 10, 0, V.Mana_max);
  const hp = pctOf(V.HP, V.HP_max), st = pctOf(V.Stamina, V.Stamina_max);
  V._Condition = V.HP <= 0 ? 'Dead' : hp <= 30 ? 'Unconscious / Critical' : hp <= 50 ? 'Badly Injured' : hp <= 70 ? 'Hurt' : hp <= 90 ? 'Bruised' : 'Healthy';
  V._Fatigue = V.Stamina <= 0 ? 'Collapsed' : st <= 30 ? 'Exhausted' : st <= 70 ? 'Tired' : 'Fresh';
  if (hasB && B.Player.Vitals._Condition !== V._Condition) S.$ui.toasts.push(`Condition: ${V._Condition}`);

  // ---- 5b. 1.3.0 reputation: Academy (staff and the institution), Student (the student body), Doves (the Dovecote). Signed Rep XP
  // (engine-owned, in $xp) sets the level -5..+5. The narrator reports what earned or cost reputation in /Rep_events: repeatable
  // triggers are capped at REP.weekly_cap a week per reputation, events and losses are not. Bond milestones and high Tension are
  // counted by the engine (§6). A pre-1.3.0 save's Public / Dorm meters become Academy / Student XP once.
  const RP = S.Player.Profile.Reputation || (S.Player.Profile.Reputation = {});
  const RPB = hasB ? ((((B.Player || {}).Profile || {}).Reputation) || {}) : null;
  const rx = {};
  for (const r of REP.reps) rx[r] = _.clamp(num(((RPB && RPB.$xp) || RP.$xp || {})[r], 0), -REP.thresholds[4], REP.thresholds[4]);
  if (S.$eng.repv !== 1) {
    const old = (RPB && (RPB.Public != null || RPB.Dorm != null)) ? RPB : RP;
    if (REP.reps.every(r => !rx[r]) && (num(old.Public, 0) || num(old.Dorm, 0))) {
      rx.Academy = _.clamp(Math.round(num(old.Public, 0) * 1.25), -125, 125); rx.Student = _.clamp(Math.round(num(old.Dorm, 0) * 1.25), -125, 125);
      log.push(`Reputation now has three parts (Academy, Student, Doves); the old academy and dorm standing became Academy ${repLevel(rx.Academy)} and Student ${repLevel(rx.Student)}.`);
    }
    S.$eng.repv = 1;
  }
  delete RP.Public; delete RP.Dorm;
  const weekNo = Math.floor(dayNo / 7), weekNoB = Math.floor(dayNoB / 7);
  const repw = _.isPlainObject(S.$eng.repw) && S.$eng.repw.w === weekNo ? S.$eng.repw : { w: weekNo };
  const repLv = r => repLevel(rx[r]);
  // cap: 'week' (repeatable), 'bond' (only below bond_cap_level), '' (event or loss)
  const repAdd = (r, x, why, cap) => {
    if (!REP.reps.includes(r) || !x) return 0;
    if (cap === 'bond' && x > 0 && repLv(r) >= REP.bond_cap_level) { log.push(`${r} reputation is already +${repLv(r)}: bond milestones add no more (${why}).`); return 0; }
    if (cap === 'week' && x > 0) {
      const room = Math.max(0, REP.weekly_cap - num(repw[r], 0));
      if (x > room) log.push(`${r} reputation: the weekly limit for everyday deeds (+${REP.weekly_cap}) is reached${room ? `; +${room} of +${x} counted` : ''} (${why}).`);
      x = Math.min(x, room); repw[r] = num(repw[r], 0) + x;
      if (!x) return 0;
    }
    const was = rx[r];
    rx[r] = _.clamp(was + x, -REP.thresholds[4], REP.thresholds[4]);
    return rx[r] - was;
  };
  // one level up at once (Ruby, Baelin; Kuroo and Milena's tokens only below 0): Rep XP goes to where the next level begins
  const repLevelUp = (r, onlyNegative) => {
    const L = repLv(r);
    if (L >= 5 || (onlyNegative && L >= 0)) return false;
    rx[r] = Math.max(rx[r], repFloor(L + 1)); return true;
  };
  for (const e of (Array.isArray(S.Rep_events) ? S.Rep_events : [])) {
    const r = REP.reps.find(x => x.toLowerCase() === String(e.Rep || '').trim().toLowerCase());
    if (!r) { log.push(`Reputation "${e.Rep}" is unknown (use Academy, Student or Doves); nothing was changed.`); continue; }
    const x = Math.round(num(e.XP, 0)), kind = String(e.Kind || '').toLowerCase();
    repAdd(r, x, e.Why || kind || 'story', x > 0 && kind !== 'event' ? 'week' : '');
  }
  S.Rep_events = [];
  const repSync = announce => {
    for (const r of REP.reps) {
      const L = repLevel(rx[r]), L0 = RPB ? num(RPB['_' + r], 0) : L;
      RP['_' + r] = L;
      if (announce && hasB && L !== L0) {
        const t = `${r} reputation ${L > L0 ? 'rose' : 'fell'} to ${L > 0 ? '+' : ''}${L}`;
        S.$ui.toasts.push(t); jnl.push(t + '.'); log.push(`${t}: ${repBand(r, L)}`);
      }
    }
    RP.$xp = { ...rx };
  };
  repSync(false);

  // ---- 6a. names revealed by the story prose (not by the update block); before 6 so a name spoken in this reply counts ----
  if (text) {
    const prose = String(text).replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
    const names = S.$ui.names;
    for (const [id, rx] of NAME_RX) if (!names.includes(id) && (ARRIVES[id] || 1) <= S.World.Year && rx.test(prose)) names.push(id);
  }

  // ---- 6. bonds ----
  const canon = k => NPC_ALIAS[String(k).toLowerCase()] || k;
  // v1.0.3 (F09): when both an alias key and the canonical key exist, the alias record's real changes merge into the canonical one
  // (fields that differ from the empty record; lists are unioned). Engine-owned "_" / "$" fields are never taken from the alias.
  const mergeInto = (to, from, empty) => {
    if (!_.isPlainObject(to) || !_.isPlainObject(from)) return typeof from === 'string' && from ? from : to;
    for (const [f, v] of Object.entries(from)) {
      if (/^[_$]/.test(f)) continue;
      if (Array.isArray(v)) to[f] = [...new Set([...(to[f] || []), ...v])];
      else if (!_.isEqual(v, empty[f])) to[f] = v;
    }
    return to;
  };
  const renameKeys = (obj, empty = {}) => {
    for (const k of Object.keys(obj || {})) {
      const c = canon(k);
      if (c !== k) { obj[c] = c in obj ? mergeInto(obj[c], obj[k], empty) : obj[k]; delete obj[k]; }
    }
  };
  renameKeys(S.Scene.Present, { Note: '' }); renameKeys(S.Bonds, BOND0);
  if (S.Battle && S.Battle.Combatants) renameKeys(S.Battle.Combatants, { HP: 100, Stamina: 100, Status: '' });
  renameKeys(S.Campus_State.NPC_status);
  const BB = (hasB && B.Bonds) || {};
  for (const [id, b] of Object.entries(S.Bonds)) {             // v1.0.3 (A#3): older facts survive a whole-record replace
    const o = (BB[id] && BB[id].$Known_old) || [];
    if (o.length && !(b.$Known_old || []).length) b.$Known_old = [...o];
  }
  const seen = `${stamp(S.World)} at ${S.World.Location}`;
  for (const id of Object.keys(S.Scene.Present)) {
    if (NPC_IDS.has(id) && !(id in S.Bonds) && (ARRIVES[id] || 1) > S.World.Year) {   // v1.0.3: incoming cohort, not here yet
      log.push(`${id} is not at Halvard yet (arrives as a first-year in Year ${ARRIVES[id]}); no bond was started. Check who this is.`);
    } else if (NPC_IDS.has(id) && !(id in S.Bonds) && !NO_BOND.has(id)) {   // 1.3.0: rival academy teams have no bond system
      S.Bonds[id] = { Rank: 0, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '', _Event_ready: false, $Known_old: [], $xp: 0, $cool: -1 };
      S.$ui.toasts.push(`New acquaintance: {npc:${id}}`);   // {npc:id}: the bar shows the name only once it is known (D14)
    }
    if (S.Bonds[id]) S.Bonds[id].Last_seen = seen;
  }
  const daily = S.$eng.daily || {};
  // 1.1.0 (Full): +1 to today's cap for a bond that grew "stuck indoors together" in rain/snow/storm, outdoors in fine mild weather,
  // or on a clear Star Night. At most +1 per bond per day.
  const bondWx = !!wxNow && ((!isOutdoor(S.World.Location) && wxBad(wxNow))
    || (isOutdoor(S.World.Location) && (wxNow.sky === 'Clear' || wxNow.sky === 'Cloudy') && wxNow.temp >= 15 && wxNow.temp <= 27)
    || (evs.some(e => /^Star Night/.test(e.t)) && wxDay(seed, S.World.Day === 'Sun' ? dayNo - 1 : dayNo).blocks[2].sky === 'Clear'));
  // 1.2.2: interactions the narrator reported this reply (/Interactions, emptied here); a raised Progress (pre-1.2.2 habit) with no
  // Interactions entry still counts once, as a talk (+1) or a hangout (+2 or more)
  const PACE = paceOf(S), bweek = _.isPlainObject(S.$eng.bweek) ? S.$eng.bweek : {};
  const romRank = Number.isFinite(+S.$ui.romrank) ? +S.$ui.romrank : BR.romance_default;
  const byId = {};
  for (const a of (Array.isArray(S.Interactions) ? S.Interactions : [])) {
    const id = canon(a && a.With); if (id && S.Bonds[id]) (byId[id] = byId[id] || []).push(a);
  }
  S.Interactions = [];
  const migrate = S.$eng.bondv !== 2, fresh = [];
  // 1.3.0 reputation changes how fast NPCs warm up: extra XP per counted talk or hangout (REP.bond_mod), modifiers add up
  const modBy = (rows, L) => { const hit = rows.find(([at]) => (at > 0 ? L >= at : L <= at)); return hit ? hit[1] : 0; };
  const BM = REP.bond_mod || {};
  const repMod = id => (NPC_GROUP[id] === 'staff' ? modBy(BM.staff || [], repLv('Academy')) : 0) + (NPC_GROUP[id] === 'student' ? modBy(BM.student || [], repLv('Student')) : 0)
    + ((REP.anti_doves || []).includes(id) ? modBy(BM.anti_doves || [], repLv('Doves')) : 0) + ((REP.pro_doves || []).includes(id) ? modBy(BM.pro_doves || [], repLv('Doves')) : 0);
  // 1.3.0 mask -> truth (Castor, Kanae, Caine): the 8 -> 9 event waits until one of the NPC's secrets has come out in play
  const secretOut = id => [...(S.$ui.secrets || []), ...(S.Campus_State.Secrets_revealed || [])].some(x => String(x).toLowerCase().startsWith(id.toLowerCase() + '.'));
  const held = (id, b) => MASK.has(id) && b.Rank === 8 && !secretOut(id);
  const KR = REW.krieg || {}, weeksNew = hasB ? Math.max(0, Math.min(8, weekNo - weekNoB)) : 0;
  const give = (id, which) => {                                // a Rank 5 gift / Rank 10 benefit, once
    const x = ((REW.npcs || {})[id] || {})[which];
    if (!x || !_.isPlainObject(S._Perks)) return;
    if (S._Perks[x.name] || (S.$ui.perks_used || []).some(u => u.startsWith(x.name + ' ('))) return;
    S._Perks[x.name] = { From: id, Kind: which === 'gift' ? 'gift' : 'rank10', Effect: x.text + (x.secret ? ` <narrator_only>${x.secret}</narrator_only>` : ''), Uses: x.uses || 0 };
    S.$ui.toasts.push(which === 'gift' ? `Gift from {npc:${id}}: ${x.name}` : `Rank 10 with {npc:${id}}: new benefit`);
    jnl.push(which === 'gift' ? `${id} gave {{user}} ${x.name}.` : `Rank 10 with ${id}: ${x.text.split(/(?<=\.)\s/)[0]}`);
    if (x.jump) trainJump(x.jump, `${x.name} (${id})`);
    if (x.rep_up && repLevelUp(x.rep_up, false)) log.push(`${x.rep_up} reputation rose one level (${id}, Rank 10).`);
  };
  const rankedUp = (id, b) => {
    const R0 = repOfNpc(id), mx = (REP.bond_milestone_xp || {})[String(b.Rank)];
    if (R0 && mx) repAdd(R0, mx, `bond with ${id} reached Rank ${b.Rank}`, 'bond');
    if (b.Rank === 5) give(id, 'gift');
    if (b.Rank === 10) give(id, 'r10');
    const nd = ((REW.npcs || {})[id] || {}).nudge;
    if (b.Rank === 8 && MASK.has(id) && nd && !(b.Known_facts || []).includes(nd.fact)) { b.Known_facts = [...(b.Known_facts || []), nd.fact]; log.push(`${id}: a new lead, "${nd.fact}"`); }
  };
  for (const [id, b] of Object.entries(S.Bonds)) {
    const b0 = BB[id];
    const g = num(b.Progress, 0) - num(b0 && b0.Progress, 0);
    if (hasB && g > 0 && !byId[id]) byId[id] = [{ Kind: g >= 2 ? 'hangout' : 'talk' }];
    // engine-owned fields come from the previous state; a record the AI (re)wrote cannot set them
    let xp = b0 ? num(b0.$xp, 0) : (hasB ? 0 : num(b.$xp, 0));
    if (migrate) { const p = num(b0 ? b0.Progress : b.Progress, 0); if (p > 0 && xp === 0) xp = Math.round(Math.min(p, 10) / 10 * needXP(b.Rank, PACE)); }
    b.Progress = 0;
    b._Event_ready = b0 ? !!b0._Event_ready : false;
    b.$cool = b0 ? num(b0.$cool, -1) : num(b.$cool, -1);
    if (!b0 && hasB && b.Rank > 0) b.Rank = 0;                // a new acquaintance starts at Rank 0
    if (b0 && b.Rank > b0.Rank) {
      if (b0._Event_ready && b.Rank === b0.Rank + 1) {
        xp = 0; b._Event_ready = false; b.$cool = dayNo + coolDays(b.Rank, PACE);
        S.$ui.toasts.push(`Bond with {npc:${id}} reached Rank ${b.Rank}: new profile info unlocked`);
        jnl.push(`Bond with ${id} deepened to Rank ${b.Rank}.`);
        rankedUp(id, b);
      } else {
        log.push(`Rank change for ${id} reverted: a rank rises by 1 only through the bond event, once the bond is ready.`);
        b.Rank = b0.Rank;
      }
    } else if (b0 && b.Rank < b0.Rank) {
      b._Event_ready = false; log.push(`Bond with ${id} fell to Rank ${b.Rank}.`);
    }
    if (b0 && num(b0.Tension, 0) < REP.tension_high && num(b.Tension, 0) >= REP.tension_high && repOfNpc(id) && repOfNpc(id) !== 'Doves') {
      repAdd(repOfNpc(id), REP.tension_xp, `high tension with ${id}`, '');   // a public falling-out (staff: Academy, students: Student)
    }
    const need = needXP(b.Rank, PACE);
    // XP: talk and hangout once a day each, gifts and help a few times a week; a loved gift counts more from Rank 3
    let gain = 0;
    const d = daily[id] && daily[id].day === dayNo ? daily[id] : { day: dayNo }, w = bweek[id] && bweek[id].w === weekNo ? bweek[id] : { w: weekNo };
    // 1.3.0 Krieg (model B): Rank 1 from his introduction (the 0 -> 1 event is ready at once); then +weekly_xp every Monday while
    // Doves reputation >= min_doves (with hidden magic, also Dove attention <= max_attention), else Tension +1. Nothing from interactions.
    if (id === KR.id) {
      byId[id] = [];
      if (b.Rank === 0) xp = need;
      else if (b0 && b.Rank < 10) for (let k = 0; k < weeksNew; k++) {
        if (repLv('Doves') >= KR.min_doves && !(S.Hidden._True_magic && num(S.Hidden.Dove_attention, 0) > KR.max_attention)) gain += KR.weekly_xp;
        else { b.Tension = _.clamp(num(b.Tension, 0) + 1, 0, 100); log.push(`Krieg: no bond progress this week (Doves reputation ${repLv('Doves')}${S.Hidden._True_magic ? ', Dove attention ' + S.Hidden.Dove_attention : ''}); Tension +1.`); }
      }
    }
    for (const a of byId[id] || []) {
      const k = String((a && a.Kind) || '').trim().toLowerCase();
      if (k === 'talk' || k === 'hangout') {
        if ((d[k] || 0) >= BR.per_day[k]) continue;
        d[k] = (d[k] || 0) + 1; gain += Math.max(0, BR.kind_xp[k] + repMod(id));
      } else if (k === 'gift') {
        if ((w.gift || 0) >= BR.per_week.gift) { log.push(`${id} already had ${BR.per_week.gift} gifts this week: no bond XP for another.`); continue; }
        w.gift = (w.gift || 0) + 1;
        const gk = String((a && a.Gift) || 'neutral').trim().toLowerCase();
        let x = gk in BR.gift_xp ? BR.gift_xp[gk] : BR.gift_xp.neutral;
        if (gk === 'loved' && b.Rank >= BR.gift_bonus_rank) x = Math.round(x * BR.gift_bonus_mult);
        if (gk === 'disliked') b.Tension = _.clamp(num(b.Tension, 0) + BR.gift_disliked_tension, 0, 100);
        gain += x;
      } else if (k === 'help') {
        if ((w.help || 0) >= BR.per_week.help) continue;
        w.help = (w.help || 0) + 1; gain += BR.kind_xp.help;
      }
    }
    // 1.1.0 weather bonus, kept: +1 once a day for time together indoors in bad weather, outdoors in fine weather, a clear Star Night
    if (bondWx && !d.wx && (byId[id] || []).some(a => /^(talk|hangout)$/i.test(String((a && a.Kind) || '').trim()))) { d.wx = 1; gain += BR.weather_xp; }
    if (Object.keys(d).length > 1) daily[id] = d;
    if (Object.keys(w).length > 1) bweek[id] = w;
    xp = b.Rank >= 10 ? 0 : Math.min(need, xp + gain);          // the bar stops when full, until the event
    b.$xp = xp;
    const ready = b.Rank < 10 && xp >= need && dayNo >= num(b.$cool, -1) && !held(id, b);
    if (ready && !b._Event_ready) { b._Event_ready = true; fresh.push(id); }
    else if (!ready) b._Event_ready = false;
    // romance opens at the rank chosen in Settings (default 8); feelings can grow earlier in the story, the flag waits
    if (hasB && b.Romance && !(b0 && b0.Romance) && (romRank > 10 || b.Rank < romRank)) {
      b.Romance = false;
      log.push(romRank > 10 ? `Romance flags are off (Settings); ${id}'s was not set.` : `Romance with ${id} opens at Rank ${romRank} (Settings); the flag was not set yet.`);
    }
  }
  S.$eng.bondv = 2;
  for (const k of Object.keys(bweek)) if (bweek[k].w !== weekNo) delete bweek[k];
  S.$eng.bweek = bweek;
  // what the UI and the Now entry show: bonds whose bar is full (event ready now, or after the cooldown)
  const bev = {}, present = new Set(Object.keys(S.Scene.Present || {}));
  for (const [id, b] of Object.entries(S.Bonds)) {
    if (b.Rank >= 10 || num(b.$xp, 0) < needXP(b.Rank, PACE)) continue;
    const e = BEV.find(x => x.npc === id && x.rank === b.Rank) || null;
    if (held(id, b)) { bev[id] = { r: b.Rank, ready: false, in: 0, held: 1, where: '', when: '', now: false, s: 0, dir: '' }; continue; }
    const now = !!b._Event_ready && present.has(id) && (!e || bondEventOk(e, S));
    const RW = (REW.npcs || {})[id] || {}, rw = b.Rank === 4 ? RW.gift : b.Rank === 9 ? RW.r10 : null;
    const extra = [rw ? `${b.Rank === 4 ? 'This event gives {{user}} ' + id + "'s gift" : 'This event gives {{user}} ' + id + "'s Rank 10 benefit"} (${rw.name}): ${rw.text}${rw.secret ? ' (Narrator only: ' + rw.secret + ')' : ''} The engine records it when the rank rises.` : '',
      b.Rank === 7 && MASK.has(id) && RW.nudge ? `This event carries a nudge: ${RW.nudge.text} The engine adds the Fact "${RW.nudge.fact}" when the rank rises.` : ''].filter(Boolean).join('\n');
    bev[id] = { r: b.Rank, ready: !!b._Event_ready, in: Math.max(0, num(b.$cool, -1) - dayNo),
      where: e && e.where && e.where.length ? e.where.join(' or ') : (HAUNT[id] || ''),
      when: e ? [e.days && e.days.length ? e.days.join('/') : '', e.time ? e.time.join('–') : ''].filter(Boolean).join(', ') : '',
      now, s: e ? 1 : 0, dir: now ? [(e ? e.text : (BR.themes || {})[String(b.Rank)] || ''), extra].filter(Boolean).join('\n') : '' };
  }
  S.$ui.bev = bev;
  for (const id of fresh) {
    const v = bev[id] || {};
    log.push(`Bond with ${id} is ready for its Rank ${S.Bonds[id].Rank + 1} event${v.where ? ` (likely at ${v.where}${v.when ? ', ' + v.when : ''})` : ''}.`);
    S.$ui.toasts.push(`Bond event ready: {npc:${id}}${v.where ? ` (${v.where}${v.when ? ', ' + v.when : ''})` : ''}`);
  }
  for (const b of Object.values(S.Bonds)) {
    if ((b.Known_facts || []).length > FACTS_VISIBLE) {
      const over = b.Known_facts.slice(0, b.Known_facts.length - FACTS_VISIBLE);
      b.$Known_old = [...(b.$Known_old || []), ...over].slice(-40); b.Known_facts = b.Known_facts.slice(-FACTS_VISIBLE);
    }
  }
  for (const id of Object.keys(daily)) if (daily[id].day !== dayNo) delete daily[id];
  S.$eng.daily = daily;

  // ---- 6b. 1.3.0 training: Mana pool (Mana_max) and Stamina (Stamina_max). The narrator reports sessions in /Training. One session
  // adds TRN.session_pct % of the starting value x (1 + partner bonuses), at most TRN.weekly_pct % a week and TRN.total_pct % in all.
  // Partners: an NPC whose Rank 5 gift is a training bonus for that track, in the scene. Jumps (rewards) skip the weekly limit only.
  function trainRoom(k, weekly) {
    const T = S.Player.$Training[k]; if (!T) return 0;
    if (T.w !== weekNo) { T.w = weekNo; T.wg = 0; }
    const tot = T.base * TRN.total_pct / 100 - T.gain;
    return Math.max(0, weekly ? Math.min(T.base * TRN.weekly_pct / 100 - T.wg, tot) : tot);
  }
  function trainAdd(k, amt, weekly) {
    const T = S.Player.$Training[k], f = TRN.tracks[k].field, add = r2(Math.max(0, Math.min(amt, trainRoom(k, weekly))));
    if (add > 0) { S.Player.Vitals[f] = r2(S.Player.Vitals[f] + add); T.gain = r2(T.gain + add); if (weekly) T.wg = r2(T.wg + add); }
    return add;
  }
  function trainJump(k, why) {
    const T = S.Player.$Training[k]; if (!T) return;
    const add = trainAdd(k, T.base * REW.jump_pct / 100, false);
    log.push(add > 0 ? `${TRN.tracks[k].label} +${add} at once (${why}).` : `${TRN.tracks[k].label} is already at its training limit; ${why} adds nothing.`);
    if (add > 0) S.$ui.toasts.push(`${TRN.tracks[k].label} +${add}`);
  }
  {
    const here = new Set(Object.keys(S.Scene.Present || {}).map(canon));
    const partners = k => Object.entries(REW.npcs || {}).filter(([id, x]) => x.gift && x.gift.train === k && S._Perks[x.gift.name] && here.has(id)).map(([id]) => id);
    for (const x of (Array.isArray(S.Training) ? S.Training : [])) {
      const k = /mana/.test(x.Track) ? 'mana' : /stam/.test(x.Track) ? 'stamina' : '';
      if (!k || !S.Player.$Training[k]) { log.push(`Training track "${x.Track}" is unknown (use mana or stamina); nothing was added.`); continue; }
      const T = S.Player.$Training[k], pr = partners(k), mult = 1 + pr.length * REW.train_bonus, lab = TRN.tracks[k].label;
      const add = trainAdd(k, T.base * TRN.session_pct / 100 * mult, true);
      if (add > 0) log.push(`Training: ${lab} +${add}${pr.length ? ` (with ${pr.join(' and ')}, x${mult})` : ''}; ${r2(T.gain)} of ${r2(T.base * TRN.total_pct / 100)} trained so far.`);
      else log.push(T.gain >= T.base * TRN.total_pct / 100 ? `Training: ${lab} has reached its limit (twice the starting value); training keeps {{user}} in shape but adds no more.` : `Training: ${lab} already gained all it can this week.`);
    }
    S.Training = [];
  }
  // ---- 6c. 1.3.0 one-use perks spent this reply (/Perk_use). Kuroo's and Milena's Rank 10 favours lift a negative reputation one level.
  for (const key of (Array.isArray(S.Perk_use) ? S.Perk_use : [])) {
    const k = Object.keys(S._Perks || {}).find(x => x === key) || Object.keys(S._Perks || {}).find(x => x.toLowerCase() === String(key).trim().toLowerCase());
    if (!k) { log.push(`Perk "${key}" is not held; nothing was spent.`); continue; }
    const p = S._Perks[k], fx = (((REW.npcs || {})[p.From]) || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {};
    if (!(p.Uses > 0)) { log.push(`"${k}" is not a one-use perk; nothing to spend.`); continue; }
    if (fx.rep_token) {
      if (!repLevelUp(fx.rep_token, true)) { log.push(`"${k}" only works while ${fx.rep_token} reputation is below 0 (now ${repLv(fx.rep_token)}); it was kept.`); continue; }
      log.push(`${fx.rep_token} reputation rose one level ("${k}").`);
    }
    p.Uses -= 1;
    if (p.Uses <= 0) { delete S._Perks[k]; S.$ui.perks_used = [...(S.$ui.perks_used || []), `${k} (${p.From}), ${dstamp(S.World)}`].slice(-60); }
    S.$ui.toasts.push(`Used: ${k}`); jnl.push(`{{user}} used ${k} (from ${p.From}).`);
  }
  S.Perk_use = [];
  repSync(true);
  S.$eng.repw = repw;

  // ---- 7. hidden magic ----
  const Hd = S.Hidden;
  // 1.1.0 (Full): outdoors in fog, heavy rain, a storm or a blizzard the hidden magic is harder to notice: the rise is halved (rounded up)
  if (wxNow && hasB && Hd._True_magic && isOutdoor(S.World.Location) && (wxNow.sky === 'Fog' || wxHeavy(wxNow))) {
    const was = (B.Hidden && B.Hidden.Dove_attention) || 0, rise = Hd.Dove_attention - was;
    if (rise > 0) { Hd.Dove_attention = was + Math.ceil(rise / 2); log.push(`Dove attention rise halved by the weather (outdoors, ${wxText(wxNow)}): +${Math.ceil(rise / 2)} instead of +${rise}.`); }
  }
  const stageOf = a => (a < 20 ? 'Unnoticed' : a < 40 ? 'Rumoured' : a < 60 ? 'Watched' : a < 80 ? 'Investigated' : 'Exposed');
  const stg = stageOf(Hd.Dove_attention);
  if (Hd._True_magic && Hd._Stage !== stg) { log.push(`Dove attention is now: ${stg}.`); S.$ui.toasts.push(`Dove attention: ${stg}`); }
  Hd._Stage = stg;

  // ---- 8. monthly payout ----
  if (hasB) {
    const mi = W => ((W.Year || 1) - 1) * 12 + W.Month;
    const crossed = Math.min(12, mi(S.World) - mi(B.World));
    for (let i = 0; i < crossed; i++) {
      const r = S.Player.Profile.Dorm_rank || 0;
      let pay = S.Player.Profile.Dorm === 'Unsorted' ? 0 : r <= 0 ? 300 : PAYOUT.find(([max]) => r <= max)[1];
      const acad = repLv('Academy');
      if (pay && acad <= -5) pay = Math.floor(pay / 2);          // 1.3.0: academic probation halves the payout
      if (pay) {
        S.Player.Wallet.Points += pay;
        S.Player.Wallet.Transactions.push(`+${pay} monthly payout (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved: academic probation' : ''})`);
        log.push(`Monthly payout: +${pay} points (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved on academic probation' : ''}).`);
      }
      // 1.3.0: Academy +5 bonus, and points from bond rewards (data/bond_rewards.json monthly)
      const extra = [...(acad >= 5 && S.Player.Profile.Dorm !== 'Unsorted' ? [[REP.academy5_monthly, 'honoured student bonus (Academy reputation +5)']] : []),
        ...Object.values(S._Perks || {}).map(p => (((REW.npcs || {})[p.From] || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {}).monthly).filter(Boolean).map(m => REW.monthly[m])];
      for (const [pts, why] of extra) {
        S.Player.Wallet.Points += pts; S.Player.Wallet.Transactions.push(`+${pts} ${why}`); log.push(`Monthly: +${pts} points, ${why}.`);
      }
    }
    S.Player.Wallet.Transactions = S.Player.Wallet.Transactions.slice(-20);
  }

  // ---- 8b. Batch 5.1 records: commitments, notices, letters, clues, journal ----
  const newKeys = (cur, prev) => Object.keys(cur || {}).filter(k => !(prev && k in prev));
  // commitments: computed due text, overdue flag (logged once, when it turns overdue)
  const BC = (hasB && B.Commitments) || {};
  for (const [k, c] of Object.entries(S.Commitments || {})) {
    // v1.0.3 (A#2/F04): parse Due once (new record or new Due text) and keep that target; "tomorrow" must not drift every turn
    const c0 = BC[k];
    const abs = c0 && c0.Due === c.Due && c0.$abs >= 0 ? c0.$abs : parseWhen(c.Due, S.World, absA);
    c.$abs = abs; c._When = whenText(abs, absA);
    const late = abs >= 0 && abs < absA;
    if (late && !(BC[k] && BC[k]._Late)) { log.push(`"${k}" is overdue (was due ${c.Due}${c.With ? `, with ${c.With}` : ''}): resolve it in the story, then remove it.`); S.$ui.toasts.push(`Overdue: ${k}`); }
    c._Late = late;
  }
  // notices: stamp, expire, cap
  const BN = (hasB && B.Notices) || {};
  for (const k of newKeys(S.Notices, BN)) { if (!S.Notices[k].Posted) S.Notices[k].Posted = dstamp(S.World); if (hasB) S.$ui.toasts.push(`New notice: ${k}`); }
  for (const [k, nt] of Object.entries(S.Notices || {})) {
    const n0 = BN[k], u = n0 && n0.Until === nt.Until && n0.$abs >= 0 ? n0.$abs : parseWhen(nt.Until, S.World, absA);
    nt.$abs = u;
    if (u >= 0 && u < absA - 60) delete S.Notices[k];
  }
  capRecord(S.Notices, CAP.Notices);
  // letters: stamp, direction, cap (read/sent ones go first)
  const BL = (hasB && B.Letters) || {};
  const me = new Set(['{{user}}', 'you', 'me', 'i', String(S.Player.Profile.Name || '').toLowerCase()].filter(Boolean).map(x => x.toLowerCase()));
  for (const k of newKeys(S.Letters, BL)) {
    const L = S.Letters[k];
    if (!L.Date) L.Date = dstamp(S.World);
    if (me.has(String(L.From).trim().toLowerCase())) L.Status = 'sent';
    else if (L.Status === 'waiting' && hasB) S.$ui.toasts.push(`Letter waiting at the Mail Tower${L.From ? ` (from ${L.From})` : ''}`);
  }
  capRecord(S.Letters, CAP.Letters, L => L.Status !== 'waiting');
  // clues and mysteries
  const BCl = (hasB && B.Clues) || {}, BMy = (hasB && B.Mysteries) || {};
  for (const k of newKeys(S.Clues, BCl)) {
    const c = S.Clues[k];
    if (!c.Found) c.Found = dstamp(S.World);
    if (hasB) S.$ui.toasts.push(`New clue: ${k}`);
  }
  for (const c of Object.values(S.Clues || {})) {
    c.Links = [...new Set((c.Links || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
    if (!(c.Thread in S.Mysteries)) S.Mysteries[c.Thread] = { Status: 'open', Summary: '' };
  }
  for (const [k, my] of Object.entries(S.Mysteries || {})) {
    if (my.Status === 'solved' && (!BMy[k] || BMy[k].Status !== 'solved') && hasB) { jnl.push(`Solved: ${k}${my.Summary ? ` (${my.Summary})` : ''}.`); S.$ui.toasts.push(`Mystery solved: ${k}`); }
  }
  capRecord(S.Clues, CAP.Clues);
  // ---- 8c. Batch 5.2: club, competition, projects, trip ----
  const canonList = a => [...new Set((a || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  if (hasB) {
    const c0 = B.Player.Profile.Club || '', c1 = S.Player.Profile.Club || '';
    if (c0 !== c1) jnl.push(c1 ? `Joined the ${c1}.` : `Left the ${c0}.`);
  }
  const Co = S.Competition, Co0 = (hasB && B.Competition) || {};
  Co.Team = canonList(Co.Team);
  if (hasB && Co.Status && (Co.Status !== Co0.Status || Co.Tier !== Co0.Tier)) {
    const what = { entered: 'Entered', qualified: 'Qualified from', eliminated: 'Eliminated from', champion: 'Won', selected: 'Selected for' }[Co.Status];
    jnl.push(`${what} the ${Co.Tier || 'current'} Competition${Co.Placement ? ` (${Co.Placement})` : ''}.`);
    S.$ui.toasts.push(`Competition: ${Co.Status}${Co.Tier ? ` (${Co.Tier})` : ''}`);
    const prize = `Kingdom-Y${S.World.Year}`, paid = S.$eng.prizes || (S.$eng.prizes = []);
    if (Co.Tier === 'Kingdom' && Co.Status === 'champion' && !paid.includes(prize)) {   // v1.0.3 (F08): once per year's competition
      paid.push(prize);
      S.Player.Wallet.Points += KINGDOM_PRIZE;
      S.Player.Wallet.Transactions = [...S.Player.Wallet.Transactions, `+${KINGDOM_PRIZE} Kingdom Competition prize`].slice(-20);
      log.push(`Kingdom Competition won: +${KINGDOM_PRIZE} points paid to each member of the team.`);
    }
  }
  const BP = (hasB && B.Projects) || {};
  for (const [k, pj] of Object.entries(S.Projects || {})) {
    pj.With = canonList(String(pj.With || '').split(/\s*,\s*/).filter(Boolean)).join(', ');
    if (pj.Progress >= 100 && hasB && (!BP[k] || BP[k].Progress < 100)) { jnl.push(`Finished: ${k}.`); S.$ui.toasts.push(`Project complete: ${k}`); }
  }
  const Tr = S.Trip, Tr0 = (hasB && B.Trip) || {};
  Tr.Companions = canonList(Tr.Companions);
  if (hasB && Tr.Active !== !!Tr0.Active) jnl.push(Tr.Active ? `Set off for ${Tr.Destination || 'a trip'}.` : `Back from ${Tr0.Destination || Tr.Destination || 'the trip'}.`);

  // ---- 8e. v1.0.3 new school year: a new class of first-years (incoming cohorts from data/cohorts.json) ----
  {
    const seen = S.$eng.cohorts || (S.$eng.cohorts = []);
    for (let Y = 2; hasB && Y <= S.World.Year; Y++) {
      if (seen.includes(`Y${Y}`)) continue;
      seen.push(`Y${Y}`);
      const ids = Object.keys(ARRIVES).filter(id => ARRIVES[id] === Y);
      jnl.push(`A new class of first-years arrived at Halvard for the Year ${Y} Entrance Event.`);
      S.$ui.toasts.push('New first-years have arrived at Halvard');
      if (ids.length) log.push(`New first-years this year (now in the NPC roster): ${ids.join(', ')}.`);
    }
  }
  // ---- 8d. v1.0.3 graduation: the morning after Graduation (M12 W1 Mon 07:00) that year's third-years leave campus ----
  {
    const done = S.$eng.grads || (S.$eng.grads = []), G = S.Campus_State.Graduated || (S.Campus_State.Graduated = []);
    for (let Y = 1; hasB && Y <= S.World.Year; Y++) {
      if (done.includes(`Y${Y}`) || absA < toAbs({ Year: Y, Month: 12, Week: 1, Day: 'Mon', Time: '07:00' })) continue;
      done.push(`Y${Y}`);
      const left = Object.keys(STUDENTS).filter(id => yearOf(id, Y) === 3 && !G.includes(id));
      G.push(...left);
      if (left.length) {
        jnl.push(`The third-years graduated and left Halvard: ${left.join(', ')}.`);
        S.$ui.toasts.push(`Graduates have left campus: ${left.map(id => `{npc:${id}}`).join(', ')}`);
        log.push(`Graduation departures: ${left.join(', ')} left campus (Campus_State.Graduated). If the story keeps one (repeating the year, staying as staff), remove that name.`);
      }
    }
    S.Campus_State.Graduated = [...new Set(G.map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  }

  // ---- 8f. 1.1.0 story hooks: narrator-side debts. Due anchored once like Commitments; state waiting | due | overdue | old ----
  {
    const BH = (hasB && B.Hooks) || {};
    for (const [k, hk] of Object.entries(S.Hooks || {})) {
      const h0 = BH[k];
      if (h0 && !(hk.$born >= 0) && h0.$born >= 0) hk.$born = h0.$born;             // a whole-record replace keeps the birth time
      if (!(hk.$born >= 0)) hk.$born = absA;
      if (!hk.Planted) hk.Planted = (h0 && h0.Planted) || dstamp(S.World);
      const abs = hk.Due ? (h0 && h0.Due === hk.Due && h0.$abs >= 0 ? h0.$abs : parseWhen(hk.Due, S.World, absA)) : -1;
      hk.$abs = abs;
      hk.Who = canonList(String(hk.Who || '').split(/\s*,\s*/).filter(Boolean)).join(', ');
      const st = abs >= 0 ? (absA < abs - 30 ? 'waiting' : absA <= abs + 180 ? 'due' : 'overdue')
        : (hk.Weight >= 2 && absA - hk.$born >= 14 * DAY_MIN ? 'old' : 'waiting');
      if (st === 'due' && (!h0 || h0._State !== 'due')) log.push(`Hook due now: \"${k}\"${hk.Who ? ` (${hk.Who})` : ''}. Pay it off, break it, or drop it.`);
      hk._State = st;
    }
    capRecord(S.Hooks, CAP_HOOKS, h => h.Weight === 1);                          // over the cap: Weight-1 hooks go first, oldest first
  }
  // ---- 8g. 1.1.0 gossip: each rumour's fate and reach by age; fizzled (day 3) and old (day 21) ones leave Campus_State.Rumours ----
  if (OFF.has('gossip')) S.$ui.gossip = [];
  else {
    const R = _.isPlainObject(S.$eng.rum) ? S.$eng.rum : (S.$eng.rum = {}), live = S.Campus_State.Rumours || [];
    for (const r of Object.keys(R)) if (!live.includes(r)) delete R[r];         // the story removed it: drop its metadata
    const keep = [], gone = [];
    for (const r of live) {
      if (!R[r]) { const d20 = hash32(seed, r, 'rum') % 20 + 1; R[r] = { born: dayNo, fate: d20 <= 3 ? 'fizzle' : d20 >= 18 ? 'fast' : 'normal' }; }
      const age = dayNo - R[r].born;
      if ((R[r].fate === 'fizzle' && age >= 3) || age >= 21) { gone.push(r); delete R[r]; } else keep.push(r);
    }
    if (gone.length) {
      S.Campus_State.Rumours = keep; S.$ui.rumours_old = [...S.$ui.rumours_old, ...gone].slice(-50);
      log.push(`Rumours that have died out (removed; do not bring them back unless something revives them): ${gone.map(r => `\"${r}\"`).join('; ')}.`);
    }
    S.$ui.gossip = keep.map(r => [r, REACH(R[r], dayNo - R[r].born), dayNo - R[r].born]);
  }
  // ---- 8h. 1.1.0 inventory (the Bag): merge case duplicates, remove at Qty 0, Sunfizz bottles, cap 40 (never gear) ----
  {
    const I = S.Inventory || (S.Inventory = {}), BI = (hasB && B.Inventory) || {};
    const groups = _.groupBy(Object.keys(I), k => k.trim().toLowerCase());
    for (const ks of Object.values(groups)) {
      const main = ks.find(k => k in BI) || ks[0], rec = { ...I[main] };
      for (const k of ks) if (k !== main) {
        const o = I[k]; rec.Qty += o.Qty;
        if (o.Note && !(k in BI)) rec.Note = o.Note; if (o.Plan && !(k in BI)) rec.Plan = o.Plan;
        if (rec.Kind === 'other' && o.Kind !== 'other') rec.Kind = o.Kind;
        delete I[k];
      }
      if (main.trim() !== main) delete I[main];
      rec.Qty = Math.min(99, rec.Qty); I[main.trim()] = rec;
    }
    const qty = (O, rx) => Object.entries(O || {}).filter(([k]) => rx.test(k.trim())).reduce((a, [, v]) => a + (Number(v && v.Qty) || 0), 0);
    const SF = /^sunfizz$/i, EB = /^empty sunfizz bottles?$/i;
    if (hasB) {
      const returned = qty(BI, EB) - qty(I, EB), drank = qty(BI, SF) - qty(I, SF);
      if (returned > 0 && ['commissary', 'the mall', 'mall'].includes(placeOf(S.World.Location).toLowerCase())) {
        const pts = BOTTLE_BACK * returned;
        S.Player.Wallet.Points += pts;
        S.Player.Wallet.Transactions = [...S.Player.Wallet.Transactions, `+${pts} returned Sunfizz bottles (${returned})`].slice(-20);
        log.push(`Returned ${returned} Sunfizz bottle${returned > 1 ? 's' : ''}: +${pts} points.`);
      }
      if (drank > 0) {
        const k = Object.keys(I).find(x => EB.test(x.trim()));
        if (k) I[k].Qty = Math.min(99, Math.max(0, I[k].Qty) + drank);
        else I['Empty Sunfizz bottle'] = { Qty: drank, Kind: 'other', Note: 'returnable: 2 points each at the Commissary or the Mall store', Plan: '' };
      }
    }
    for (const k of Object.keys(I)) if (!(I[k].Qty > 0)) delete I[k];
    const ks = Object.keys(I);
    if (ks.length > CAP_BAG) {
      const order = [...ks.filter(k => /^(other|food)$/.test(I[k].Kind)), ...ks.filter(k => !/^(other|food|gear)$/.test(I[k].Kind))];
      for (const k of order.slice(0, ks.length - CAP_BAG)) delete I[k];
    }
  }

  // journal: engine-written turning points; date-stamp the AI's new lines
  if (hasB) {
    if (B.Player.Profile.Dorm === 'Unsorted' && S.Player.Profile.Dorm !== 'Unsorted') jnl.unshift(`Sorted into the ${S.Player.Profile.Dorm} Dormitory by the Arbiter Stone.`);
    const sec0 = new Set([...((B.Campus_State && B.Campus_State.Secrets_revealed) || []), ...((B.$ui && B.$ui.secrets) || [])]);
    for (const x of S.Campus_State.Secrets_revealed || []) if (!sec0.has(x)) { const [who, ...topic] = String(x).split('.'); jnl.push(`Uncovered a hidden truth about ${who}${topic.length ? ` (${topic.join('.')})` : ''}.`); }
  }
  // v1.0.3 (F13): every revealed secret also goes to a permanent, hidden ledger; unlocks read it, so the AI list may stay short
  for (const x of S.Campus_State.Secrets_revealed || []) if (!S.$ui.secrets.includes(x)) S.$ui.secrets.push(x);
  const J0 = new Set((hasB && B.Journal) || []);
  S.Journal = (S.Journal || []).map(line => (J0.has(line) || /^\[M\d/.test(line) ? line : `[${dstamp(S.World)}] ${line}`));
  for (const line of jnl) S.Journal.push(`[${dstamp(S.World)}] ${line}`);
  S.Journal = [...new Set(S.Journal)].slice(-CAP.Journal);
  // F21 state-as-memory: the narrator reads the last CAP.Journal lines; older ones (and lines the AI removed) move to $ui.archive
  if (hasB) {
    const kept = new Set(S.Journal), arch = S.$ui.archive || (S.$ui.archive = []);
    const have = new Set(arch);
    for (const l of B.Journal || []) if (!kept.has(l) && !have.has(l)) { arch.push(l); have.add(l); }
    S.$ui.archive = arch.slice(-JOURNAL_ARCHIVE);
  }

  // ---- 9. UI bookkeeping ----
  const place = placeOf(S.World.Location);
  if (place && !S.$ui.discovered.includes(place)) S.$ui.discovered.push(place);
  const unlock = k => { if (!offUnlock.has(k) && !S.$ui.unlocks.includes(k)) S.$ui.unlocks.push(k); };   // 1.1.0: a feature that is off does not unlock
  if (S.Battle.Active) unlock('battle');
  if (Hd._True_magic) unlock('hidden');
  if (Object.keys(M.Pacts || {}).length) unlock('pacts');
  if (Object.keys(S.Commitments || {}).length) unlock('planner');
  if (Object.keys(S.Player.Injuries || {}).length) unlock('injuries');
  if ((S.Campus_State.Secrets_revealed || []).length || Object.keys(S.Clues || {}).length) unlock('mystery');
  if (Object.keys(S.Notices || {}).length || CASTLE.has(place.toLowerCase())) unlock('notices');
  if (Object.keys(S.Letters || {}).length) unlock('letters');
  const doy = dayNo % (YEAR_DAYS);
  if (S.Competition.Status || S.Competition.Tier || doy >= 2 * 28) unlock('competition');   // from Month 3 (Training Week, Dorm Competition)
  if (Object.keys(S.Projects || {}).length) unlock('projects');
  if (Object.keys(S.Inventory || {}).length) unlock('inventory');                 // 1.1.0
  if (Object.keys(S.Player.Conditions || {}).length) unlock('conditions');
  if (S.Trip.Active || TRIPS.some(tp => { const d0 = (tp.m - 1) * 28 + (tp.w - 1) * 7 + DAYS.indexOf(tp.d); return doy >= d0 - 14 && doy <= d0 + 2; })) unlock('trip');
  S.$ui.toasts = S.$ui.toasts.slice(-10);

  // ---- 10. commit ----
  S.$eng.abs = absA;
  if (log.length) S._Log = [...(S._Log || []), ...log.map(l => `[${stamp(S.World)}] ${l}`)].slice(-12);
}

if (typeof eventOn === 'function' && typeof waitGlobalInitialized === 'function') {
  (async () => {
    await waitGlobalInitialized('Mvu');
    let text = '';   // message being parsed in this update (COMMAND_PARSED fires before VARIABLE_UPDATE_ENDED)
    eventOn(Mvu.events.VARIABLE_UPDATE_STARTED, () => { text = ''; });
    eventOn(Mvu.events.COMMAND_PARSED, (_v, _c, content) => { text = content || ''; });
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, variables_before) => {
      let hint = '';
      try { const c = SillyTavern.chat || [], m = c[c.length - 1] || {}; hint = String(m.send_date || '') + '|' + (SillyTavern.getCurrentChatId ? SillyTavern.getCurrentChatId() : ''); } catch (e) { /* seed falls back to world time */ }
      try { runEngine(variables.stat_data, variables_before && variables_before.stat_data, text, hint); text = ''; }
      catch (e) { console.error('[Eldrasil engine]', e); }
    });
  })();
}
