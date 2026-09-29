// Eldrasil / Halvard — game engine (Batch 2.3; 3.2: read-only guard, hybrid trigger cost, per-turn toasts). Runs after every MVU update; deterministic and replay-safe:
// everything is computed from (state before, state after) only. Internals live in stat_data.$eng (hidden from the AI).
const NPC_ALIAS = {"irene":"Irene","irene chanare":"Irene","chanare":"Irene","caspian":"Caspian","caspian riwalo":"Caspian","riwalo":"Caspian","etnie":"Etnie","etnera":"Etnie","royhan":"Royhan","royhan filanoman":"Royhan","roy":"Royhan","filanoman":"Royhan","lenna":"Lenna","lenna greenwind":"Lenna","greenwind":"Lenna","saffi":"Saffi","saffi tamberlane":"Saffi","saffranelle":"Saffi","tamberlane":"Saffi","kanae":"Kanae","kanae quveno":"Kanae","quveno":"Kanae","idris":"Idris","idris ainsworth":"Idris","ainsworth":"Idris","aiden":"Aiden","aiden ruzzo":"Aiden","ruzzo":"Aiden","caralynn":"Caralynn","caralynn veyturone":"Caralynn","cara":"Caralynn","veyturone":"Caralynn","zara":"Zara","zara minallone":"Zara","minallone":"Zara","gavlan":"Gavlan","gavlan haverton":"Gavlan","haverton":"Gavlan","yvette":"Yvette","yvette fallaron":"Yvette","fallaron":"Yvette","krieg":"Krieg","krieg valforth":"Krieg","valforth":"Krieg","milena":"Milena","milena sagona":"Milena","sagona":"Milena","baelin":"Baelin","baelin kalvor":"Baelin","kalvor":"Baelin","headmaster kalvor":"Baelin","headmaster":"Baelin","layla":"Layla","layla palegleam":"Layla","palegleam":"Layla","vallie":"Vallie","vallie goredust":"Vallie","goredust":"Vallie","deathaxe":"Vallie","percival":"Percival","percival applethorne":"Percival","percy":"Percival","applethorne":"Percival","sophia":"Sophia","sophia helfin":"Sophia","helfin":"Sophia","rei":"Rei","rei kestrane":"Rei","kestrane":"Rei","acting warden":"Rei","halvard warden":"Rei","kuroo":"Kuroo","kuroo varnell":"Kuroo","varnell":"Kuroo","mimosa":"Mimosa","mimosa linden":"Mimosa","linden":"Mimosa","gareth":"Gareth","gareth valkaryn":"Gareth","valkaryn":"Gareth","lucius":"Lucius","lucius vortigern":"Lucius","vortigern":"Lucius","trixie":"Trixie","trixie confetti":"Trixie","confetti":"Trixie","vera":"Vera","vera pulsar":"Vera","pulsar":"Vera","tristan":"Tristan","tristan aurelle":"Tristan","aurelle":"Tristan","althair":"Althair","althair veyne":"Althair","veyne":"Althair","vice headmaster":"Althair","dante":"Dante","dante kleinn":"Dante","kleinn":"Dante","castor":"Castor","castor moretti":"Castor","moretti":"Castor","ruby":"Ruby","ruby bonbon":"Ruby","bonbon":"Ruby","florian":"Florian","florian villeneuve":"Florian","elion":"Florian","elion villeneuve":"Elion","bellatrix":"Bellatrix","bellatrix ardenne":"Bellatrix","kira":"Kira","kira brannock":"Kira","brannock":"Kira","mirelle":"Mirelle","mirelle lullwyn":"Mirelle","lullwyn":"Mirelle","theodore":"Theodore","theodore wrenfield":"Theodore","wrenfield":"Theodore","theo":"Theodore","ines":"Ines","ines vauclair":"Ines","vauclair":"Ines","bram":"Bram","bram holloway":"Bram","holloway":"Bram","dex":"Dex","dex harlow":"Dex","harlow":"Dex","cassius":"Cassius","cassius rhavel":"Cassius","rhavel":"Cassius","morgana":"Morgana","morgana vess":"Morgana","vess":"Morgana","nocturne":"Morgana","pip":"Pip","pip althorne":"Pip","althorne":"Pip","alyssa":"Alyssa","alyssa edelweiss":"Alyssa","edelweiss":"Alyssa","tilly":"Tilly","tilly marsh":"Tilly","marsh":"Tilly","ottilie":"Tilly","ezrel":"Ezrel","ezrel marionne":"Ezrel","marionne":"Ezrel","ottavio":"Ottavio","ottavio bastiani":"Ottavio","bastiani":"Ottavio","caine":"Caine","caine strix":"Caine","strix":"Caine","liaison butler":"Caine","bobby":"Bobby","bobby becket":"Bobby","bb":"Bobby","becket":"Bobby","linus":"Linus","linus tallyworth":"Linus","tallyworth":"Linus","maple":"Maple","maple fernhollow":"Maple","fernhollow":"Maple","nerys":"Nerys","nerys silvarenne":"Nerys","silvarenne":"Nerys","hadrian":"Hadrian","hadrian quelloris":"Hadrian","quelloris":"Hadrian","wren":"Wren","wren marlowe":"Wren","marlowe":"Wren","tsubaki":"Tsubaki","tsubaki hoshikage":"Tsubaki","hoshikage":"Tsubaki"};
const NPC_IDS = new Set(Object.values(NPC_ALIAS));
// proper-case name forms (first name, full name, nickname) matched case-sensitively in story prose
const NAME_FORMS = {"Irene":["Irene Chanare","Irene"],"Caspian":["Caspian Riwalo","Caspian"],"Etnie":["Etnie"],"Royhan":["Royhan Filanoman","Royhan"],"Lenna":["Lenna Greenwind","Lenna"],"Saffi":["Saffi Tamberlane","Saffi"],"Kanae":["Kanae Quveno","Kanae"],"Idris":["Idris Ainsworth","Idris"],"Aiden":["Aiden Ruzzo","Aiden"],"Caralynn":["Caralynn Veyturone","Caralynn"],"Zara":["Zara Minallone","Zara"],"Gavlan":["Gavlan Haverton","Gavlan"],"Yvette":["Yvette Fallaron","Yvette"],"Krieg":["Krieg Valforth","Krieg"],"Milena":["Milena Sagona","Milena"],"Baelin":["Baelin Kalvor","Baelin"],"Layla":["Layla Palegleam","Layla"],"Vallie":["Vallie Goredust","Vallie"],"Percival":["Percival Applethorne","Percival"],"Sophia":["Sophia Helfin","Sophia"],"Rei":["Rei Kestrane","Rei"],"Kuroo":["Kuroo Varnell","Kuroo"],"Mimosa":["Mimosa Linden","Mimosa"],"Gareth":["Gareth Valkaryn","Gareth"],"Lucius":["Lucius Vortigern","Lucius"],"Trixie":["Trixie Confetti","Trixie"],"Vera":["Vera Pulsar","Vera"],"Tristan":["Tristan Aurelle","Tristan"],"Althair":["Althair Veyne","Althair"],"Dante":["Dante Kleinn","Dante"],"Castor":["Castor Moretti","Castor"],"Ruby":["Ruby Bonbon","Ruby"],"Florian":["Florian Villeneuve","Florian"],"Elion":["Elion Villeneuve","Elion"],"Bellatrix":["Bellatrix Ardenne","Bellatrix"],"Kira":["Kira Brannock","Kira"],"Mirelle":["Mirelle Lullwyn","Mirelle"],"Theodore":["Theodore Wrenfield","Theodore"],"Ines":["Ines Vauclair","Ines"],"Bram":["Bram Holloway","Bram"],"Dex":["Dex Harlow","Dex"],"Cassius":["Cassius Rhavel","Cassius"],"Morgana":["Morgana Vess","Morgana"],"Pip":["Pip Althorne","Pip"],"Alyssa":["Alyssa Edelweiss","Alyssa"],"Tilly":["Tilly Marsh","Tilly"],"Ezrel":["Ezrel Marionne","Ezrel"],"Ottavio":["Ottavio Bastiani","Ottavio"],"Caine":["Caine Strix","Caine"],"Bobby":["Bobby Becket","Bobby","BB"],"Linus":["Linus Tallyworth","Linus"],"Maple":["Maple Fernhollow","Maple"],"Nerys":["Nerys Silvarenne","Nerys"],"Hadrian":["Hadrian Quelloris","Hadrian"],"Wren":["Wren Marlowe","Wren"],"Tsubaki":["Tsubaki Hoshikage","Tsubaki"]};
const NAME_RX = Object.entries(NAME_FORMS).map(([id, forms]) => [id, new RegExp('(^|[^A-Za-z])(' + forms.map(f => f.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z])')]);
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// 1.5.1 (P6): who spoke in a reply. A name counts as a speaker when it opens the sentence that leads into a quote
// ("Irene looked up. "Curfew.") or directly follows a closing quote ("Curfew," Irene said / "…," said Irene). Names inside quotes
// are people being talked to or about. MENTION_DENY: first names that are also ordinary words; at a sentence start they are no mention.
const CAST_FULL = 4;
const KNOWS_VISIBLE = 15, IMPRINT_MAX = 5, DEFINING_MAX = 5, NEXT_RANK = 3, MEANWHILE_RANK = 7;   // 1.6.0 (Batch C)
const CHANGE = {"Etnie": "fixed", "Irene": "fixed", "Aiden": "shaped", "Castor": "shaped", "Zara": "shaped", "Kanae": "shaped", "Rei": "fixed", "Caine": "shaped", "Caralynn": "shaped", "Percival": "fixed", "Trixie": "fluid", "Vera": "fixed", "Alyssa": "fixed", "Lenna": "shaped", "Saffi": "fixed", "Idris": "shaped", "Dante": "fixed", "Florian": "fluid", "Tilly": "fixed", "Caspian": "fixed", "Royhan": "shaped", "Sophia": "fixed", "Gareth": "fixed", "Ruby": "fixed", "Gavlan": "fixed", "Yvette": "fixed", "Baelin": "fixed", "Layla": "fixed", "Vallie": "fixed", "Kuroo": "fixed", "Mimosa": "shaped", "Althair": "fixed", "Ezrel": "fixed", "Ottavio": "fixed", "Krieg": "fixed", "Milena": "shaped", "Tristan": "fixed", "Bobby": "shaped", "Linus": "shaped", "Maple": "shaped", "Nerys": "fixed", "Hadrian": "fixed", "Wren": "shaped", "Tsubaki": "shaped"};   // 1.6.0 (N2): fixed | shaped | fluid per NPC (data/npc_canon.json; empty until the canon waves)
// 1.6.8 (owner): which Rank 8 branches each NPC allows (data/npc_canon.json branch): A all, B best friend or rival, C best friend
// or romance, D best friend only. An NPC with no entry (a new one) allows all three until its canon says otherwise.
const BRANCH = {"Etnie":"C","Irene":"A","Aiden":"A","Castor":"A","Zara":"C","Kanae":"A","Rei":"A","Caine":"A","Caralynn":"A","Percival":"A","Trixie":"C","Vera":"C","Alyssa":"C","Lenna":"A","Saffi":"A","Idris":"A","Dante":"A","Florian":"A","Tilly":"C","Caspian":"A","Royhan":"A","Sophia":"A","Gareth":"A","Ruby":"C","Gavlan":"D","Yvette":"D","Baelin":"D","Layla":"D","Vallie":"A","Kuroo":"A","Mimosa":"C","Althair":"D","Ezrel":"D","Ottavio":"D","Krieg":"B","Milena":"A","Tristan":"B","Bobby":"C","Linus":"C","Maple":"C","Nerys":"A","Hadrian":"A","Wren":"C","Tsubaki":"A"};
const INITIATIVE_STAGES = {"Etnie":{"0-2":"(only if the bond has fallen this far) still \"Big Sister\", but it sounds like pleading; she follows at a distance and apologises for things that were not her fault.","3-5":"attaches at once. Turns up wherever {{user}} is, by scent; feeds {{user}} from her own plate; \"educates\" with small lectures about sleep and food. Jealous of anyone near {{user}}, sweetly.","6-8":"lets {{user}} see the other Etnie: the flat voice, the survivor's guilt in a sentence she does not finish. Tells {{user}} the street story when they are alone. Starts treating {{user}}'s friends as her problem to manage.","9-10":"acts for {{user}} before they ask, including against people who only meant well. She is calmer, because {{user}} is not going anywhere, and more dangerous to anyone who tries to change that."},"Irene":{"0-2":"correct, pleasant, entirely official. Every conversation is about a rule, a form or a schedule.","3-5":"still reports every break, but warns {{user}} first. Adds \"please\". Will complain about Council paperwork in two sentences, then apologise for it.","6-8":"uses {{user}}'s given name in private. Lets {{user}} see her clean when she is upset and does not explain it. Keeps {{user}}'s secrets, and it visibly costs her. At the closest bond, the one person she lets see her afraid.","9-10":"bends a rule for {{user}} and tells them so, because she will not lie about it. Stands between {{user}} and the Doves with her hands shaking under her sleeves."},"Aiden":{"0-2":"all patter. Sells {{user}} something, bets them something, remembers their name the first time.","3-5":"brings {{user}} in on small schemes and the odds on the next duel. Lets them see a curfew route. Still selling, but gives a friend's price.","6-8":"tells {{user}} about the family and the trading house. Covers for them with staff without being asked to. The only person he lets see him nervous.","9-10":"{{user}} gets the real ledger, the real routes and the truth when he is scared. He would take the blame for {{user}} with a grin, and mean it."},"Castor":{"0-2":"pleasant background. {{user}} will struggle to remember the conversation, and that is the point.","3-5":"seeks {{user}} out now and then with a question for the paper. Shows them one ghost-story piece before it runs.","6-8":"lets {{user}} read something that is not for the paper. Warns {{user}} away from a place or a person without saying why. The melancholy shows in front of them and he does not explain it.","9-10":"(only once his secret is out) stops pretending with {{user}} alone, and is more tired than they have ever seen anyone. Chooses {{user}} over the Choir, quietly and completely; never with a speech."},"Zara":{"0-2":"very few words; answers questions, asks none. Leaves as soon as she politely can.","3-5":"talks fast about talismans and fabric when asked, then trails off. Sits near {{user}} at meals. Makes {{user}} a small charm and pretends it is spare.","6-8":"shows {{user}} the sketchbook on purpose. Takes {{user}} up to the Rooftop. Admits the elders and wanting to prove them wrong. With {{user}} she stops hunching for whole conversations.","9-10":"argues with {{user}} when she thinks they are wrong, quietly and without backing down. Writes for {{user}}'s hand alone. Still shy in public; not with {{user}}."},"Kanae":{"0-2":"the perfect popular student. A free romance reading, sweets, a lovely conversation {{user}} will remember fondly.","3-5":"always seems to be where {{user}} is. Small gifts; readings that happen to warn {{user}} about certain friends. Asks gently about {{user}}'s plans for the evening.","6-8":"takes up more of {{user}}'s time, sweetly. Doubts about {{user}}'s friends arrive as concern, never as accusation. At the closest bond she is jealous of everyone, and it never once shows in public.","9-10":"(only once her Plan is out and {{user}} still wants her) drops the mask with {{user}} alone and is almost shy about it. Still possessive, now said out loud; looks through the mirror only when {{user}} asks."},"Rei":{"0-2":"{{user}} barely sees her, and when they do she tells them to go back. Rumour knows more about her than {{user}} does.","3-5":"lets {{user}} share the Rooftop in silence. Answers one question in three. Ignores {{user}} breaking a rule that is not a real danger.","6-8":"says {{user}}'s name. Tells them, flatly, which places are truly dangerous and which are only frightening. Amusement shows around {{user}} now, not only around Kuroo.","9-10":"{{user}} stands watch beside her. She tells them what she knows about the Crack, in few words, and does not repeat herself. Still never speaks of that night."},"Caine":{"0-2":"furniture that anticipates. Courtesy exactly to rank, and {{user}} is a mage.","3-5":"remembers how {{user}} takes their tea. The pause before \"Young master\" grows shorter. Watches {{user}} more closely than anyone notices.","6-8":"a word more than the task requires, sometimes. Tells {{user}} which rooms at the Liaison to stay out of, as if it were etiquette. The courtesy is still perfect, and now it has a warning inside it.","9-10":"(only once his secret is out and {{user}} treats him the same) still courteous, unmasked with {{user}} alone. Honest about the hatred, including for himself. The only mercy he has shown a mage."},"Caralynn":{"0-2":"{{user}} is a rival to outshine. Every exchange is a small performance with a deniable jab in it, and she makes sure her following hears.","3-5":"decides {{user}} is her friend and tells them so, as a favour. Invites {{user}} to rehearsals to be an audience. Still competes over every grade; the jabs get gentler.","6-8":"introduces {{user}} to noble students as \"a friend of mine\" and means it. Wants {{user}} in the front row. Lets {{user}} see an unopened letter from her father, and still does not open it.","9-10":"once says \"thank you\" without calling it generosity, and is furious at how hard it was. Spends her family's name for {{user}} without being asked. Still vain, still competing; {{user}} is simply the one rival she wants beside her."},"Percival":{"0-2":"{{user}} is already in the ballad, whether they like it or not. Loud and generous; knights them with whatever is at hand and treats them like an old comrade from day one.","3-5":"inducts {{user}} properly: dawn drills, the ledger, a title that grows. Heals {{user}}'s scrapes before they notice them. Tells {{user}}'s deeds to others, bigger each time.","6-8":"introduces {{user}} to the whole Brotherhood (Saffi, Dante, anyone who stands still). Charges into a real fight at {{user}}'s side without a speech. Now and then, alone with {{user}}, a story stops halfway and he changes the subject.","9-10":"the one person he lets see how tired heavy healing leaves him. Turns up at the first sign {{user}} is hurt, before anyone sends for him. The ballads stay; the tales about {{user}} are the only ones he never embellishes."},"Trixie":{"0-2":"{{user}} gets what every stranger gets: instant friendship and a performance. She introduces herself more than once, loudly.","3-5":"remembers {{user}}'s name and favourite sweet. Drags {{user}} into performances and onto the stage. When {{user}} is sad she will not leave until they are less sad.","6-8":"{{user}} becomes one of the very few she is close to, not just friendly with. Reads parts of the circus letters aloud to them. Keeps {{user}}'s secrets by never saying them; her face tells anyone watching that there is one.","9-10":"brings {{user}} to her family when the circus comes in Month 8. Causes a distraction the moment {{user}} looks cornered, unasked. Still loud, still an airhead; she simply always knows where {{user}} is in a room."},"Vera":{"0-2":"{{user}} is interesting when they do something interesting. Questions, notes, and she forgets to say goodbye.","3-5":"asks {{user}} to volunteer for small experiments (safe ones, she swears). Fixes {{user}}'s things without being asked. Explains everything at length and, now and then, checks whether {{user}} is still listening.","6-8":"shares the notebooks nobody else reads. Rests {{user}} and keeps the debt, and gets cross if {{user}} worries about it. Introduces {{user}} to Zara and Royhan as her collaborator. Lets her ears pin back in front of {{user}} instead of hiding it.","9-10":"puts {{user}}'s name on her work. Would stop an experiment for {{user}}, which she has never done for anyone. Still forgets meals and sleep; {{user}} is the only one she lets make her stop."},"Alyssa":{"0-2":"{{user}}'s page is a name, a sketch and one line. Friendly and brief; she keeps {{user}} gently at arm's length, as she does everyone, because it is kinder. Reintroduced each week without fuss.","3-5":"the page runs to half a side, and the glance before {{user}}'s name gets shorter. She stops refusing, but still says \"you don't have to\" each time {{user}} comes back. Sits with {{user}} in the Library Study Rooms; now and then warns them of something a moment before it happens.","6-8":"the page fills both sides. If the story has already shown {{user}} the pattern, she stops pretending otherwise (\"By the rest day, I won't know you. I'm sorry.\"), and still never gives the cause. On the rest day she finds {{user}} and asks for one true thing to write down. Spends Foresight on {{user}} unasked and pays the mana quietly.","9-10":"{{user}}'s page is the first she reads after the rest day, and she is glad before she reaches the end of it. Asks {{user}} to help keep the notebook right, as Ruby does. Would step into the next five minutes for {{user}} whatever it costs her. Nothing is cured; every week she chooses {{user}} again, from the page."},"Lenna":{"0-2":"{{user}} gets the same lazy teasing as everyone else. Every question about her becomes a joke.","3-5":"saves {{user}} a seat and half her food, and teases them more, which is how she shows she likes someone. Takes {{user}} to the Menagerie. Still yawns away anything real.","6-8":"lets a serious moment stay serious for a few seconds before the joke. Tells {{user}} one small thing about the Greenwind Forest, then changes the subject. Shows {{user}} her nap spot in the Elder Oak's roots. When {{user}} is in danger she is visibly scared, then angry about being scared.","9-10":"with {{user}}, says the real thing first and jokes after. Tells the story of the fire once, flatly, start to end. Still lazy, still teasing; she has simply decided {{user}} is worth the risk of losing."},"Saffi":{"0-2":"{{user}} is someone to race. Loud, friendly, calls them by the wrong name at least once.","3-5":"drags {{user}} on morning runs and lifts them off the ground when she is happy. Reads bits of her family's letters aloud.","6-8":"tells {{user}} about the winter-house plan and what the points are for. Asks {{user}} to help keep an eye on Lenna. When worried about {{user}}, runs laps wherever {{user}} happens to be.","9-10":"the only one besides Lenna whose getting hurt turns her silent. Would stand in front of {{user}} in any fight without being asked. Still loud, still hopeless in a sermon."},"Idris":{"0-2":"cold courtesy. {{user}} is one of \"most students\".","3-5":"the sarcasm is aimed at {{user}} instead of past them, which is a compliment. Lets {{user}} share his patch of sun. Haggles on {{user}}'s behalf when a bad price offends him.","6-8":"introduces {{user}} to Royhan and Zara as \"tolerable\". Answers a question about home. Lets {{user}} see him afraid when the Doves come, without covering it with a joke.","9-10":"treats {{user}} as family business. Tells {{user}} what happened in the Dovecote, once, in a flat voice, and never mentions it again. Still sardonic; the courtesy with {{user}} is simply gone, because he no longer needs it."},"Dante":{"0-2":"warm and helpful, the way he is with every younger student. Remembers {{user}}'s name and one thing they are struggling with.","3-5":"checks on {{user}} twice, unasked. Teaches {{user}} how to fall and how to get up again. Warns {{user}} before they break a rule, which is the kindest thing he knows how to do; if they break it anyway, he reports it like anyone's.","6-8":"counts {{user}} among \"his\" younger students. Explains his logic to {{user}} as a friend, without softening a word of it. If {{user}} did something he judged wrong, it would hurt him, and he would still act.","9-10":"protects {{user}} with no conditions, and holds them to every rule exactly as he holds everyone; to him that is respect. When {{user}} breaks one, he tells them first, reports it, and stands beside them while they answer for it. Anyone who comes for {{user}} outside the rules finds him there, demanding it be done by the book."},"Florian":{"0-2":"{{user}} is an audience. He flirts, performs, and gets their name wrong.","3-5":"invites {{user}} to his booth at The Snug and pays for everything. Challenges {{user}} to things, secretly hoping to lose.","6-8":"lets {{user}} sit with him beside Hades. Mentions his family's silence once, as a joke that does not land, and does not take it back. Listens to {{user}} the way he listens to Caspian.","9-10":"fights under {{user}}'s call, the first time he has followed anyone's lead in a fight. Is sincere with {{user}} when there is no audience. Still flirts with the whole room."},"Tilly":{"0-2":"{{user}} is a potential witness. She interviews them about every ghost story they know.","3-5":"invites {{user}} on investigations (the Broken Statue, the Long Corridor before curfew) and shares her wildest theories. Teaches {{user}} something from her tutoring without explaining where she learned it.","6-8":"{{user}}'s name goes in Halvard Unexplained as co-investigator. Lets the court phrasing out without catching it. Flowers open around her whenever {{user}} arrives.","9-10":"when a letter is late, lets {{user}} sit with her and does not pretend. Still reckless, but now she checks that {{user}} is safe first, which for her is a real sacrifice."},"Caspian":{"0-2":"the friendly Council face. Knows {{user}}'s name before they give it, and one piece of their business.","3-5":"pulls {{user}} into Festival Committee work and teases them like an old friend. Quietly covers small trouble for {{user}}, the way he does for Aiden.","6-8":"lets {{user}} see the glasses cloth come out. Asks {{user}} for advice, which he does with nobody but his brother. Introduces {{user}} at the Noble Houses' Liaison.","9-10":"speaks for {{user}} to staff, Council and the Liaison. Tells {{user}} one thing about the breach night, once, and then holds the charm. Still smooths every room; with {{user}} he stops performing."},"Royhan":{"0-2":"polite, reserved and exact. Answers potion questions precisely and asks nothing back.","3-5":"notices when {{user}} has not eaten. Trades work and reagents with {{user}}, never favours. Gohn starts sitting on {{user}}'s shoulder too.","6-8":"tells {{user}} about Dunmere and his sister. Asks {{user}} for help once, and it visibly costs him. Brings {{user}} to the Gardens with Idris and Zara.","9-10":"{{user}}'s alchemist. Asks {{user}} for help without the cost showing, which is the hardest thing he has learned at Halvard. Still refuses charity from everyone else."},"Sophia":{"0-2":"{{user}} is weak until proven otherwise. Loud contempt, or no attention at all.","3-5":"{{user}} has hit back at least once, so now they are worth sparring. Crude teasing is how she shows she likes someone. Lends {{user}} a tactics book and quizzes them on it.","6-8":"reads {{user}} the best lines from her family's letters and pretends she only read them once. Takes {{user}}'s side loudly in public, whether or not they asked.","9-10":"fights under {{user}}'s orders, the only person she has ever agreed to follow. Duels anyone who insults {{user}}, to the end. Still crude; the insults she gives {{user}} now mean the opposite."},"Gareth":{"0-2":"the perfect honour student with {{user}}: kind, helpful, and gently impossible to get to know.","3-5":"studies with {{user}} and brings them to the Board Game Club, where he never loses but teaches {{user}} how he wins. Invites {{user}} to his morning drills.","6-8":"lets {{user}} watch him fight up close, glasses off, and afterwards does not apologise to {{user}} the way he does to everyone else. Talks about his brother, warmly, the version everyone knows.","9-10":"{{user}} is his one exception to coming first: he tutors them before every exam and burns whole arenas on their behalf. Still gentle, still first at everything else."},"Ruby":{"0-2":"warm to {{user}} exactly as she is to everyone. Asks about their week and remembers the answer.","3-5":"seeks {{user}} out with sweets when they look low. Introduces {{user}} to Zara, Idris and Roy in the Gardens.","6-8":"for once, tells {{user}} what she is worried about: whether her three will keep each other after she graduates. Plays guitar for {{user}} somewhere nobody else can hear.","9-10":"tells everyone who will listen that {{user}} is her friend, the only side she has ever picked. Still warm to everyone; {{user}} is simply the one she goes to when she is the one shaking."},"Gavlan":{"0-2":"one more first-year to drill. Surname, clipped orders, and \"Adequate\" at best.","3-5":"corrects {{user}}'s stance before they ask and invites them to his dawn drills. Tells them one war story, and cuts it short.","6-8":"talks to {{user}} off the Grounds as a person, not a cadet, by their first name. Lends them books from his office library. On a bad morning he lets {{user}} sit and wait with him.","9-10":"{{user}} is the protégé he was looking for: private lessons and rest days at the clan's cottage. On the Grounds he is harder on them than on anyone, and \"Adequate\" is still the most he says."},"Yvette":{"0-2":"professional and casual by turns; {{user}} is one more student to keep alive.","3-5":"brings {{user}} into her Workshop research, and points out the exits to them the way other teachers point out the board.","6-8":"lets {{user}} see her off duty and admits Halvard feels like a cage. She never says why, and {{user}} learns not to ask.","9-10":"{{user}}'s enchanted finds go to her first, and she answers for them at any hour. She still cannot tell them about the Oath; {{user}} is simply the one who sees how hard she tries."},"Baelin":{"0-2":"knows {{user}}'s name and nothing more; courteous, one student among hundreds.","3-5":"has an anecdote ready that fits {{user}} exactly, and remembers what they told him last time.","6-8":"asks {{user}}'s view on a student matter and weighs it. Pours tea for them and drinks his own while it is still hot, which his staff notice.","9-10":"{{user}} is in his ledger as a debt he owes, and his reports to the capital name them. He still weighs {{user}} against the academy, and tells them so plainly."},"Layla":{"0-2":"chatty and delighted to have an audience; {{user}} gets anecdotes and debate questions.","3-5":"sets {{user}} her hardest debate questions and cheers when they win one. Opens the Restricted Section to them.","6-8":"shares her theories on the Archmage's missing name and asks {{user}} to help with her true history of Halvard. Admits she is worried about Yvette, without being able to say why.","9-10":"shares everything she has pieced together about Halvard's past. The gloves stay on, and what happened twenty years ago stays hers."},"Vallie":{"0-2":"one more student to keep alive: loud, blunt, and a headlock if {{user}} mouths off.","3-5":"drags {{user}} in as her demonstration partner and picks a rival for them, on purpose.","6-8":"tells {{user}} a Will of Steel story that might even be true, Domas's letters included. Brings them along when she checks the Menagerie at night.","9-10":"trains {{user}} the Will of Steel way and arm-wrestles anyone who says a word against them. Still the most brutal teacher on campus if {{user}} gets cocky."},"Kuroo":{"0-2":"needles {{user}} to find their button.","3-5":"has found it, and pushes without mercy. Brings {{user}} to the Card Club and gives them his old dance card, with its notes on the Liaison.","6-8":"drops the smirk once around {{user}}, and tells them about the envoy years and the children he watched the Doves humiliate.","9-10":"spends his favours with the staff on {{user}}. Still provokes them constantly, because that is how he shows he is still watching."},"Mimosa":{"0-2":"{{user}} is a stranger; she answers only in writing.","3-5":"whispers to {{user}} face to face, briefly, then flees. Leaves an unpublished focus draught for them, labelled \"for exams\".","6-8":"speaks whole sentences to {{user}} without looking away. Asks them to stand at the back of her class so there is one face she knows.","9-10":"co-authors her first published formula with {{user}}. Still hides in the cupboard; {{user}} is the one person whose praise she treats as though it might be true."},"Althair":{"0-2":"warm and open; {{user}} is a piece he finds amusing. Hostility only makes him friendlier.","3-5":"small favours surface in {{user}}'s path through the paperwork, and a signed discipline referral lands in their hands.","6-8":"shows {{user}} a string or two: which letter moved what. Invites them to watch the game from beside him.","9-10":"{{user}} is a player in his game, not a piece. Still tells them a new past every time they ask, and still beams when they are rude to him."},"Ezrel":{"0-2":"{{user}} is a full name on a roll. Duties done, questions answered honestly and briefly.","3-5":"lets {{user}} into the Workshop after hours and gives them a palm-sized clay golem. Still says, pleasantly, that he does not care.","6-8":"watches {{user}} move with a sculptor's focus and asks them to repeat a gesture, \"for reference\". It is the most attention he gives anyone.","9-10":"builds {{user}} a Mannequin no one can tell from them, the closest he has come to his goal. Says, pleasantly, that he does not care about {{user}}, and has never once got their face wrong."},"Ottavio":{"0-2":"\"kid\", a nod, very few words. Most students are terrified of him for a week; if {{user}} is a Sky student, they are already one of his.","3-5":"notices when {{user}} skips meals and quietly fixes it. Lets them sit on the dock at dawn.","6-8":"tells {{user}} one story from Sunreach Bay, about the table and never about the rest. Takes his glasses off once in front of them, on their behalf.","9-10":"{{user}} is family, dorm or not: the Dovecote goes through him to reach them, and Loki counts them in his hoard. Still \"kid\"."},"Krieg":{"0-2":"one more mage: courteous questions, each one a threat.","3-5":"{{user}}'s name appears in his reports as \"compliant\", the best word he has for a mage. The Dovecote gate opens to them on his seal.","6-8":"in his office he tells {{user}} what he has seen of every art on the list. It left him certainty, not fear, and he wants them to understand why.","9-10":"{{user}} is the one mage he will not treat as a wolf, and once a month they may read one Dovecote file. He still searches, questions and watches them like everyone else."},"Milena":{"0-2":"a warm Dove, easy to like, but the cloak is the first thing {{user}} sees.","3-5":"Dragonchess and flatbread. Gives {{user}} a white knight from her father's set, which any Dove will respect.","6-8":"tells {{user}} about Salaffos and the blood-magic ring she watched the Doves break. Admits she knows Krieg uses her, and why she lets him.","9-10":"closes {{user}}'s file on Krieg's desk once. Still a Dove: if {{user}} ever touched a forbidden art, she would be the one to come, and she tells them so first."},"Tristan":{"0-2":"a wry clergyman with better questions than answers.","3-5":"long arguments about doctrine with {{user}}, which he enjoys enormously. A small stipend appears in his ledger as \"a student in need\".","6-8":"stops asking questions and simply listens to {{user}}. Tells them the true, light story of his years in the poor quarters, which still does not seem to explain him.","9-10":"binds any contract {{user}} needs, and would use the registry for them once. Still unreadable: {{user}} still cannot say what he wants."},"Bobby":{"0-2":"the friendly maintenance man with a card trick and an update request.","3-5":"{{user}} is a client, and a trusted audience. Hands them a voucher for one free job.","6-8":"makes {{user}} his assistant for a trick and admits one BB legend really was him. Swears them to secrecy; the rest he still never confirms.","9-10":"every commission for {{user}} is free and comes first, and he teaches them sleight of hand. He still wants the full story afterwards."},"Linus":{"0-2":"{{user}} is a page in the Tally, and he wants to fill it: questions about their magic, their best fight, their reserves. Friendly, fast, loud, and slightly too interested; he may already have ranked them in print.","3-5":"saves {{user}} a seat on the spectator bench and talks them through every duel at full volume. Reads their opponents for them before a match, unasked. Moves {{user}} up or down the column and explains exactly why, in print and in person.","6-8":"shows {{user}} the parts of the Tally that never go in the paper: the all-time page, the unconfirmed legends, the staff page he keeps hidden. Admits he is at the bottom of the Viridian ladder. Asks {{user}} to watch him try something in the practice ring, once, where nobody else can see.","9-10":"fills in his own page, for {{user}}, honestly, and shows it to them first. In {{user}}'s corner at every fight, calling reserves and openings from the bench. Still asks \"Who wins?\" about everything, still too loud; {{user}} is the only person whose answer he writes down as a feat."},"Maple":{"0-2":"kind to {{user}} and careful to keep a distance, for {{user}}'s sake. Apologises for Sobek before he has done anything. Sobek is only a tremor in the floor when {{user}} comes too close.","3-5":"lets {{user}} sit with her and climbs down from the tree when they come. Sobek watches from the ground, six eyes in the paving, and growls low if {{user}} moves too fast. She starts telling him, out loud, that {{user}} is allowed.","6-8":"tells {{user}} about the village, riding on Sobek's back as a child, and the day he chose her. Summons Sobek in full for {{user}}, on purpose, and holds their hand while he looks at them. At the closest bond Sobek stops calling {{user}} \"prey\".","9-10":"Sobek counts {{user}} among what he guards, and the ground steadies under {{user}}'s feet as well as hers. For {{user}} she lets him fight, the thing she has spent her life preventing, and is terrified and certain at once. Still apologises to everyone afterwards."},"Nerys":{"0-2":"{{user}} is an audience. She says something absurd to them with a straight face and watches what they do. A sound or two thrown their way, to test.","3-5":"invites {{user}} to this week's hobby, flatly, as if it were an obvious appointment. Borrows points from them and pays back in objects. The pranks near {{user}} are now for {{user}}'s benefit.","6-8":"tells {{user}} something true in plain words, once, and does not explain why. Shows them the museum under her bed. A slow blink when {{user}} arrives, which for her is a wave.","9-10":"lets {{user}} choose next week's hobby, the only person who has ever been allowed to. Throws a whisper into {{user}}'s ear from across any room, just to say she is there. Still deadpan; still broke; still denies everything."},"Hadrian":{"0-2":"{{user}} is a tool or an obstacle. He uses them, forgets their name, and would sell them out for a better seat.","3-5":"{{user}} is a useful tool. He remembers their name, lends them a golem errand-runner, and lectures them on loyalty. Still leaves first when things go wrong, and still throws them under the carriage for a small advantage.","6-8":"lets {{user}} into the Club Rooms workshop, makes them do the tedious parts, and takes the credit. Tells them one true thing about what he is afraid of, framed as a joke, then acts as if he never said it. Betrays them now only for something worth having.","9-10":"{{user}} counts as his, like his golems, and he protects what is his. When something goes wrong he still runs first, but he drags {{user}} out with him and leaves everyone else behind, and considers it the most generous thing he has ever done. He still lies to {{user}}, still takes the loophole that makes things worse for everyone, still takes their credit. And if betraying {{user}} gets him enough, he does it without hesitation, then turns up the next day expecting everything to be as it was, because it was the rational choice. He is exactly the same bastard; only now betraying {{user}} has to be worth it."},"Wren":{"0-2":"writes to {{user}} in the notebook, careful and polite, and says \"sorry\" on every page. Faces them to read their lips and apologises for asking them to repeat.","3-5":"teaches {{user}} their first signs, delighted by every mistake. Writes them letters. Takes them to feel a rehearsal through the floor. \"Sorry\" appears less.","6-8":"signs with {{user}} across rooms, a private language. Shows them the old notebooks, the ones from her town. Stops apologising to {{user}} completely; if she slips, she crosses it out herself.","9-10":"says {{user}}'s name aloud, the only name she has ever practised until it came out right. Gives them their sign name and, finally, tells them what it means. Lets {{user}} stand behind her, the one place she never lets anyone be."},"Tsubaki":{"0-2":"{{user}} is someone to spar with, or someone to ask for directions. She answers everything honestly and forgets their name.","3-5":"{{user}} is a sparring partner. She wakes them before dawn to train. Asks them for help with the list: reading, maps, \"what a joke is\". Gets lost on the way to meet them, and arrives anyway.","6-8":"follows {{user}} around the castle so she does not get lost, and admits it. Lets them teach her things that are not the sword, and practises them as seriously as a kata. Shows them the Crown's orders.","9-10":"{{user}} is the first thing on her list that is not a task. Trains beside them under the night sky and leaves one star hanging over them, on purpose. Still oblivious to almost everything else; never to {{user}}."}};      // 1.7.7 (FP1): approved Stage lines, not new motives
const INITIATIVE_OPENNESS = {"Etnie":"open","Irene":"guarded","Aiden":"open","Castor":"guarded","Zara":"guarded","Kanae":"guarded","Rei":"guarded","Caine":"closed","Caralynn":"open","Percival":"open","Trixie":"open","Vera":"open","Alyssa":"normal","Lenna":"guarded","Saffi":"open","Idris":"guarded","Dante":"open","Florian":"open","Tilly":"open","Caspian":"normal","Royhan":"normal","Sophia":"guarded","Gareth":"normal","Ruby":"open","Gavlan":"guarded","Yvette":"guarded","Baelin":"guarded","Layla":"open","Vallie":"open","Kuroo":"normal","Mimosa":"closed","Althair":"open","Ezrel":"normal","Ottavio":"closed","Krieg":"closed","Milena":"normal","Tristan":"guarded","Bobby":"open","Linus":"open","Maple":"normal","Nerys":"normal","Hadrian":"open","Wren":"normal","Tsubaki":"open"};  // scheduling weight only; never personality
const canRomance = id => 'AC'.includes(BRANCH[id] || 'A'), canRival = id => 'AB'.includes(BRANCH[id] || 'A');
const MENTION_DENY = new Set(["Pip", "Ruby", "Maple", "Wren"]);
const EXTRAS_MAX = 20, EXTRAS_ARCHIVE = 40, STALE_DAYS = 7;   // 1.6.1 (Batch D): invented characters kept; campus events without news
const PHASES = [];   // 1.6.1 (N6): campus phases (data/campus_phases.json; empty until the canon waves)
const QUOTE_RX = /["“][^"”]*["”]/g;
// 1.12.0 (section 8l): reminders of what an update may have left out
const MISS_MAX = 3;
const MISS_TIME_RX = /\b(an hour later|(?:two|three|four|five|several|a few|some) hours (?:later|pass|passed|go by|went by)|hours later|(?:the )?next morning|the following (?:morning|day)|later that (?:day|night|evening|afternoon)|by (?:evening|nightfall|dusk|noon|midnight)|as night falls|after (?:classes|class|dinner|lunch|breakfast))\b/i;
const MISS_PLACE = "([A-Z][\\w'’&]*(?:\\s+(?:[A-Z][\\w'’&]*|of|and|&))*)";
const MISS_ARRIVE_RX = new RegExp(`\\b(?:arrive[sd]?|arriving) (?:at|in) (?:the )?${MISS_PLACE}|\\b(?:step(?:s|ped)?|walk(?:s|ed)?|head(?:s|ed)?|slip(?:s|ped)?|burst(?:s)?) (?:into|inside) (?:the )?${MISS_PLACE}|\\b(?:reach(?:es|ed)?|enter(?:s|ed)?) (?:the )?${MISS_PLACE}`, 'g');
const MISS_TRAIN_AT = ['combat grounds', 'sparring pavilion', 'gymnasium', 'sports field', 'swimming pool', 'meditation rooms / spirit house'];
const MISS_TRAIN_RX = /\b(train(?:s|ed|ing)?|drill(?:s|ed|ing)?|practi[cs](?:e|es|ed|ing)|spar(?:s|red|ring)?|laps|meditat(?:e|es|ed|ing|ion))\b/i;
// 1.16.1 (audit A6): compiled once per NPC. matchAll clones a global regex; test() callers get it back at lastIndex 0.
const FORM_RX = {}, WORD_RX = new Map();   // WORD_RX: whole-word tests of technique, perk and gift names (section 8l)
function formRx(id) {
  const r = FORM_RX[id] || (FORM_RX[id] = new RegExp('(^|[^A-Za-z])(' + NAME_FORMS[id].map(f => f.replace(/[.*+?^()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z])', 'g'));
  r.lastIndex = 0; return r;
}
function speakersIn(prose) {
  const out = [];
  for (const para of String(prose).split(/\n+/)) {
    if (!/["“”]/.test(para)) continue;
    const qs = [...para.matchAll(QUOTE_RX)].map(m => [m.index, m.index + m[0].length]);
    if (!qs.length) continue;
    const inQuote = i => qs.some(([a, b]) => i >= a && i < b);
    for (const id of Object.keys(NAME_FORMS)) {
      for (const m of para.matchAll(formRx(id))) {
        const at = m.index + m[1].length, end = at + m[2].length;
        if (inQuote(at)) continue;
        const after = qs.find(([a]) => a >= end), before = [...qs].reverse().find(([, b]) => b <= at);
        const lead = para.slice(0, at), sentStart = /(^|[.!?]["”]?\s+)$/.test(lead) || !lead.trim();
        const opens = sentStart && after && !/[.!?]\s+\S/.test(para.slice(end, after[0]).replace(/\b(Mr|Mrs|Ms|Dr|St)\.\s/g, '')) && after[0] - end < 160;
        const tags = before && /^\s*[,;:]?\s*([a-z]+\s+){0,2}$/.test(para.slice(before[1], at)) && at - before[1] < 30;
        if ((opens || tags) && !out.includes(id)) out.push(id);
      }
    }
  }
  return out;
}
function mentionIn(prose, id, rx) {
  if (!MENTION_DENY.has(id)) return rx.test(prose);
  return [...String(prose).matchAll(formRx(id))].some(m => m[2] !== id || !/(^|[.!?]["”]?\s+)$/.test(prose.slice(0, m.index + m[1].length)));
}
const DAY_MIN = 1440, YEAR_DAYS = 12 * 4 * 7;
const MON_THU = DAYS.slice(0, 4), MON_FRI = DAYS.slice(0, 5), MON_SAT = DAYS.slice(0, 6);
const EVENTS = [{"m":1,"w":1,"d":["Mon"],"t":"Entrance Event (Arbiter Stone sorting)","noclass":1,"entr":1,"s":"07:00–09:00 arrivals at Reception and Gatehouse; 09:00 Headmaster and Vice Headmaster speeches in the Arbiter Hall, then Stone sorting until 10:00 (Council hands out each dorm vest; sorted students remain seated with their dorm); 10:00–18:00 assigned tour groups of two new first-years and one senior, meeting in the hall, visit campus and club booths (sign-up open until Friday 18:00); late afternoon: seniors show new students their dorm rooms; 19:00 Entrance Feast in the Ring Dining Hall, opened by speeches from the Headmaster and Vice Headmaster before dinner","fair":1},{"m":1,"w":1,"d":["Tue","Wed","Thu","Fri"],"t":"Club sign-up week (club booths after classes)","s":{"Tue":"Classes as usual; 16:00–18:00 club booths across the academy","Wed":"Classes as usual; 16:00–18:00 club booths across the academy","Thu":"Classes as usual; 16:00–18:00 club booths across the academy","Fri":"Classes as usual; 16:00–18:00 club booths across the academy; last day: club registration closes at 18:00"}},{"m":1,"w":3,"d":["Sat","Sun"],"t":"Star Night (Sat evening to Sun dawn; no 8pm curfew)","nocurfew":1,"s":{"Sat":"Sunset to sunrise, no 8pm curfew; 20:00–00:00 night market near the Grassy Field and Hills (students and mall vendors); stargazing on the hills, tents and bedrolls; midnight: the great meteor shower (a wish made during it is believed to come true)","Sun":"Until dawn: students sleep out on the Grassy Field and Hills; the curfew is back from dawn"},"fair":1},{"m":1,"w":4,"d":["Sat"],"t":"Spiritual Dorm Day","s":"Viridian Dormitory: 09:00–18:00 open house: the common room shows the dorm's history and the founding warden is honoured with a small rite at the entrance; upperclassmen showcase casting in the courtyard, first-years run booths, a public lesson for outsiders, food stalls, type contests open to all and the dorm tournament; 19:00 dorm-only closing dinner, first-years welcomed with a token of belonging","fair":1},{"m":2,"w":1,"d":["Fri","Sat"],"t":"Warding Rite (Fri dusk to Sat dawn; the whole academy renews the wards)","s":{"Fri":"Classes as usual while staff build a giant magic circle in the Main Courtyard all day; dusk (about 18:30): the Bell Tower rings a special pattern and every student gathers in the courtyard; speeches from the Headmaster, the Vice Headmaster and the Warden; the Dorm Heads lead each dorm through the shared working; then a feast in the Ring Dining Hall, opened by speeches from the Headmaster and Vice Headmaster","Sat":"Until dawn: the feast runs late after the working"},"mood":"trial","fair":1},{"m":2,"w":3,"d":["Wed","Thu","Fri"],"t":"Creature Studies Expedition (off-grounds, Grade III country)","noclass":1,"away":1,"s":{"Wed":"07:00 airships leave, one per year level (half a day to the Grand Vast Forest); afternoon: make camp (tents, cookfires, watch rotations) and prepare gear","Thu":"Morning: each group of four is assigned a beast to bring back within 24 hours (Years 1–2 Grade III, Year 3 Grade II); staff shadow at a distance and pull out groups in trouble","Fri":"Morning: break camp and fly home, back on campus by evening; catches count dead or alive"},"mood":"trial"},{"m":3,"w":1,"d":["Mon","Tue","Wed","Thu"],"t":"Midterm exams","noclass":1,"s":{"Mon":"08:00 Magic Theory, 10:00 Etiquette (written papers); afternoon free","Tue":"08:00 History (written); 13:00–16:00 Potion Crafting practical (one brew from a sealed brief)","Wed":"08:00–16:00 Dark Magic Defense practicals, one student at a time against the teacher (marked on how long they hold)","Thu":"08:00–16:00 Combat practicals, students paired within their year, marked by combat role"},"mood":"exam"},{"m":3,"w":2,"d":["Fri","Sat"],"t":"Club Festival","s":{"Fri":"Classes in the morning; 13:00–18:00 every club runs a stand in the Main Courtyard: demonstrations, exhibition matches, sales, food","Sat":"09:00–18:00 stands and exhibition matches all day; everyone drops one gold coin at the best stand (never their own club); the winner is announced at the close, 18:00"},"fair":1},{"m":3,"w":3,"d":["Mon","Tue","Wed","Thu","Fri","Sat"],"t":"Training Week (cross-dorm sparring allowed; curfew 21:00)","curfew":21,"s":"Classes as usual; from 16:00 the Combat Grounds, duelling rings and practice halls stay open and supervised into the evening; sparring across years and dorms; curfew 21:00"},{"m":3,"w":4,"d":["Sat","Sun"],"t":"Dorm Competition (solo, top 16 qualify)","noclass":1,"s":{"Sat":"09:00–18:00 solo ranking bouts inside each dorm, open to the whole dorm","Sun":"09:00–18:00 the ranking bouts finish; every entrant gets a placement and the top 16 of each dorm qualify for the Academy Competition"},"mood":"trial","fair":1},{"m":4,"w":1,"d":["Wed"],"t":"Secret Fools Day (prank day, dorm name-draw)","s":"Morning: participants draw a dorm-mate's name in secret, then prank them without warning all day; classes still run; Merryhew's biggest sale of the year","fair":1},{"m":4,"w":2,"d":["Tue"],"t":"Independence Crowning Day (airship trip to the capital; fireworks on campus at night; curfew 22:00)","noclass":1,"curfew":22,"away":1,"s":"07:00 speeches from the Headmaster and Vice Headmaster to the assembled academy, then the whole academy flies to the capital; morning: parade and the King's speech; free time in groups of four (coin only) until the afternoon muster; back before dark, passenger lists counted twice; night: fireworks over the lake beyond Willow Island, watched from the Grassy Field and Hills and the shore; the airship moored beyond the Menagerie and the Gymnasium; curfew 22:00"},{"m":4,"w":3,"d":["Sat"],"t":"Mystic Dorm Day","s":"Light Dormitory: 09:00–18:00 open house: the common room shows the dorm's history and the founding warden is honoured with a small rite at the entrance; upperclassmen showcase casting in the courtyard, first-years run booths, a public lesson for outsiders, food stalls, type contests open to all and the dorm tournament; 19:00 dorm-only closing dinner, first-years welcomed with a token of belonging","fair":1},{"m":5,"w":1,"d":["Mon","Tue","Wed","Thu"],"t":"End of Semester exams","noclass":1,"s":"08:00–18:00 the single practical trial, one student at a time: theory door, beast, potion, cursed room, examiner in role, duel with a staff member; Royal Inspectorate examiners watch from the gallery","mood":"exam"},{"m":5,"w":2,"d":["Fri"],"t":"Results & Dorm Ranking (Player.Profile.Dorm_rank is updated today)","ranking":1,"s":"09:00 assembly in the Arbiter Hall, opened by speeches from the Headmaster and Vice Headmaster: trial results stage by stage, then the new dorm ranking read aloud last; 19:00 speeches from the Headmaster and Vice Headmaster, then the feast in the Ring Dining Hall","mood":"exam","fair":1},{"m":5,"w":4,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Mid-Year Break (students go home)","home":1,"s":{"Mon":"Morning: airships leave; staying is allowed (the canteen runs short hours, half the mall is closed)","Sun":"Airships bring the students back during the day"}},{"m":6,"w":1,"d":["Mon","Tue","Wed","Thu","Fri"],"t":"Return Week"},{"m":6,"w":3,"d":["Sat"],"t":"Sports Day (magic banned outright)","s":"09:00–18:00 events, no magic: running and team events on the Sports Field, crowd contests in the Main Courtyard, the rest at the lake and the Combat Grounds; medals tallied by dorm at the day's end","fair":1},{"m":6,"w":4,"d":["Wed","Thu","Fri","Sat"],"t":"Academy Competition (cross-dorm teams of 4)","s":"09:00–18:00 knockout matches between the cross-dorm teams of four; the winning team represents the academy","mood":"trial","fair":1},{"m":7,"w":2,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Magical & Science Fair week","s":{"Mon":"Stands are built in the Main Courtyard through the week; classes as usual","Tue":"Stands are built in the Main Courtyard; classes as usual","Wed":"Stands are built in the Main Courtyard; classes as usual","Thu":"Last day of building; classes as usual","Fri":"Classes in the morning; 13:00–18:00 set-up and viewing in the Main Courtyard","Sat":"09:00–18:00 judging: a staff panel questions and scores every stand"}},{"m":7,"w":3,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"The Thinning: the seal is at its weakest; academy locked down all week","lockdown":1,"s":"All week: absolute curfew, academy locked, nobody outside","mood":"trial"},{"m":8,"w":2,"d":["Thu","Fri","Sat","Sun"],"t":"Traveling Circus visits (Thu evening to Sun)","curfew":22,"s":{"Thu":"Evening: the great tent opens in the Main Courtyard; stands, games, sideshows and fortune tellers across the grounds (stalls take points); curfew 22:00","Fri":"Classes in the morning; shows several times a day from the afternoon; curfew 22:00","Sat":"Classes in the morning; shows several times a day from the afternoon; curfew 22:00","Sun":"Shows all day, the last one in the evening; curfew 22:00"},"fair":1},{"m":8,"w":3,"d":["Thu","Fri","Sat"],"t":"Academy Showcase","s":{"Thu":"09:00–18:00 acts on the Main Courtyard stage; parents and guardians visit (logged at the Gatehouse)","Fri":"09:00–18:00 acts on the Main Courtyard stage; families visit","Sat":"09:00–18:00 the last acts; scores tallied by dorm in the evening to name the most talented dorm"},"fair":1},{"m":8,"w":4,"d":["Sat"],"t":"Elemental Dorm Day","s":"Fire Dormitory: 09:00–18:00 open house: the common room shows the dorm's history and the founding warden is honoured with a small rite at the entrance; upperclassmen showcase casting in the courtyard, first-years run booths, a public lesson for outsiders, food stalls, type contests open to all and the dorm tournament; 19:00 dorm-only closing dinner, first-years welcomed with a token of belonging","fair":1},{"m":9,"w":1,"d":["Mon","Tue","Wed","Thu"],"t":"Midterm exams","noclass":1,"s":{"Mon":"08:00 Magic Theory, 10:00 Etiquette (written papers); afternoon free","Tue":"08:00 History (written); 13:00–16:00 Potion Crafting practical (one brew from a sealed brief)","Wed":"08:00–16:00 Dark Magic Defense practicals, one student at a time against the teacher (marked on how long they hold)","Thu":"08:00–16:00 Combat practicals, students paired within their year, marked by combat role"},"mood":"exam"},{"m":9,"w":2,"d":["Thu","Fri","Sat"],"t":"Academy Bazaar","s":"09:00–18:00 invited traders fill the Main Courtyard (stalls take points, haggling expected); traders logged at the Gatehouse, the Doves watch the stock and the crowd","fair":1},{"m":9,"w":3,"d":["Sat"],"t":"Academy Founder Day","s":"09:00 speeches from the Headmaster and Vice Headmaster in the Arbiter Hall, then a short rite at the Founder's Statue; all day: the optional treasure hunt across the campus; 19:00 speeches from the Headmaster and Vice Headmaster, then the feast in the Ring Dining Hall","fair":1},{"m":9,"w":4,"d":["Thu","Fri","Sat","Sun"],"t":"Kingdom Competition (four academies, one team each)","s":"09:00–18:00 knockout matches between the four academies' teams; each member of the winning team earns 5,000 points","mood":"trial","fair":1},{"m":10,"w":1,"d":["Tue"],"t":"Remembrance Day","s":"All day: nothing loud (no clubs, duelling, music, games or sport); classes run quietly, the Bell Tower keeps a slow pattern, bouquets line the halls; evening (about 19:00) on the Grassy Field and Hills: speeches from the Headmaster, the Vice Headmaster and Acting Warden Rei, then the lantern release, one lantern each","fair":1},{"m":10,"w":2,"d":["Sat"],"t":"Occult Dorm Day","s":"Sky Dormitory: 09:00–18:00 open house: the common room shows the dorm's history and the founding warden is honoured with a small rite at the entrance; upperclassmen showcase casting in the courtyard, first-years run booths, a public lesson for outsiders, food stalls, type contests open to all and the dorm tournament; 19:00 dorm-only closing dinner, first-years welcomed with a token of belonging","fair":1},{"m":10,"w":3,"d":["Mon","Tue","Wed","Thu","Fri","Sat"],"t":"Student Council Election week","s":{"Mon":"Classes as usual; after classes the two Council nominees begin campaigning across the dorms with brochures, posters and conversations","Tue":"Classes as usual; outside class the Council nominees continue their campaigns, distributing brochures and speaking to students","Wed":"Classes as usual; the nominees campaign outside class and answer students across the dorms","Thu":"Classes as usual; final campaign day for brochures, posters and student conversations","Fri":"Classes as usual; 16:00-18:00 the two nominees debate in the Seminar Rooms and answer students' questions","Sat":"Morning Etiquette and Study Hall as usual; 13:00-16:00 private presidential voting in the Main Courtyard replaces every club meeting; after counting, the winner names the losing candidate Vice President-elect"}},{"m":10,"w":4,"d":["Fri","Sat","Sun"],"t":"Harvest Festival (Fri evening to Sun)","curfew":{"Fri":23,"Sat":23},"s":{"Fri":"Classes as usual; from 17:00 cafés, food stalls, game booths, haunted houses and stage acts, costumes and carved lanterns; families visit (logged at the Gatehouse); curfew 23:00","Sat":"09:00 until late: the festival all day; curfew 23:00","Sun":"The festival all day; evening: fireworks over the lake, watched from the Grassy Field and Hills; the usual curfew"},"fair":1},{"m":11,"w":1,"d":["Mon","Tue","Wed","Thu"],"t":"End of Semester exams","noclass":1,"s":"08:00–18:00 the single practical trial, one student at a time: theory door, beast, potion, cursed room, examiner in role, duel with a staff member; Royal Inspectorate examiners watch from the gallery","mood":"exam"},{"m":11,"w":2,"d":["Fri"],"t":"Results & Final Ranking (Player.Profile.Dorm_rank is updated today)","ranking":1,"s":"09:00 assembly in the Arbiter Hall, opened by speeches from the Headmaster and Vice Headmaster: trial results stage by stage, then the final dorm ranking read aloud last; 19:00 speeches from the Headmaster and Vice Headmaster, then the feast in the Ring Dining Hall","mood":"exam","fair":1},{"m":11,"w":3,"d":["Mon","Tue","Wed"],"t":"Academy Trip (Sunreach Bay, abroad)","noclass":1,"away":1,"s":{"Mon":"07:00 airships leave (half a day to Sunreach Bay); beachfront hotels, four to a room; free time in groups of four; the teachers set a curfew","Tue":"Free time in groups of four (the day side only; the night side is out of bounds); the teachers' curfew","Wed":"Morning free; afternoon: fly home, back by evening"}},{"m":11,"w":4,"d":["Wed","Thu","Fri","Sat"],"t":"World Competition abroad (the national four)","away":1,"s":"Abroad: the national four compete; the rest of the academy follows the news","mood":"trial"},{"m":11,"w":4,"d":["Sun"],"t":"Graduation (everyone attends; third-years leave by airship next morning)","noclass":1,"grad":1,"s":"09:00 ceremony in the Arbiter Hall: the Headmaster and Vice Headmaster speak, the Dorm Heads read out their graduates, each touches the Arbiter Stone a last time; afternoon: recruitment tables (noble houses, the Royal Inspectorate, the Dovecote, the Bank, hunting companies, guilds); from 12:00 the farewell winter market in the Main Courtyard and Founder's Park (stalls, snowmen if there is snow, the Farewell Pine, the Music Club on a small stage by the statue); dusk: the airship for the graduates moors above the Grassy Field; 19:00 the Headmaster and Vice Headmaster speak once more, then the farewell feast","fair":1},{"m":12,"w":1,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Kingdom-wide holiday: students go home","home":1},{"m":12,"w":2,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Kingdom-wide holiday: students go home","home":1},{"m":12,"w":3,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Kingdom-wide holiday: students go home","home":1},{"m":12,"w":4,"d":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"t":"Kingdom-wide holiday: students go home","home":1}];
const TIMETABLE = {"Mon":["Magic Theory [M]","History [M]","Combat [D] (Combat Grounds)"],"Tue":["Dark Magic Defense [D]","Magic Theory [D]","Potion Crafting [M] (Potion Halls)"],"Wed":["Etiquette [M]","Dark Magic Defense [M]","Creature Studies [M] (Menagerie or Forest)"],"Thu":["History [M]","Magic Theory [D]","Combat [D] (Combat Grounds)"],"Fri":["Magic Theory [M]","Etiquette [M]","Dark Magic Defense practical [D] (Doves; Combat Grounds or warded seminar room)"],"Sat":["Etiquette [M]","Study Hall (unsupervised, Main Library)","Clubs (club venues)"]};
const ENTR_BACK = '{{user}} is a returning student and the assigned senior guide: never sorted again; watches the speeches and sorting from the gallery, then tours 10:00–18:00 with the two new first-years recorded in Campus_State.Entrance_tour';
const schedOf = (e, day) => (!e.s ? '' : typeof e.s === 'string' ? e.s : e.s[day] || '');
const curfewHour = (e, day) => (e.curfew && typeof e.curfew === 'object' ? e.curfew[day] : e.curfew);
const timetableFor = W => W.Month === 10 && W.Week === 3 && W.Day === 'Sat' ? [TIMETABLE.Sat[0], TIMETABLE.Sat[1], 'Student Council Election (Main Courtyard)'] : TIMETABLE[W.Day];
// monthly payout by dorm rank (lore: 300 bottom band ... 3,000 for rank 1). Bands between are tunable.
const PAYOUT = [[1, 3000], [3, 2000], [10, 1200], [25, 800], [50, 500], [Infinity, 300]];
// 1.15.0 (owner-approved planning/DRAFT_grades_exams.md): the engine marks every subject at each exam. Midterm slots from lore 232
// ([day, from, to] in minutes; Creature Studies sits no midterm and is marked on fieldwork); finals are one run on a seeded day.
const SUBJECTS = ['Magic Theory', 'History', 'Etiquette', 'Potion Crafting', 'Dark Magic Defense', 'Combat', 'Creature Studies'];
const PROF = ['Knowledge', 'Arcana', 'Craft', 'Prowess', 'Society', 'Nature'];
const PROF_CUT = [0, 10, 30, 60, 100, 150];
const PROF_NAMES = { Knowledge: ['Everyday knowledge','Knows the basics','Well read','Learned','Erudite','Encyclopaedic'], Arcana: ['Everyday casting','Follows the proofs','Spell-literate','Pattern reader','Ward-wise','Arcane scholar'], Craft: ['Everyday hands','Follows the recipe','Steady hand','Skilled hands','Artisan',"Master's hand"], Prowess: ['Everyday fitness','Holds a stance','Quick on the feet','Seasoned','Duellist','Formidable'], Society: ['Everyday manners','Minds the forms','Poised','Gracious','Well connected','Consummate'], Nature: ['Everyday outdoors','Knows the signs','Calm hand','Trail-wise','Wild-wise','Kin to the wild'] };
const SUBJECT_STAT = { History: 'Knowledge', 'Magic Theory': 'Arcana', 'Dark Magic Defense': 'Arcana', 'Potion Crafting': 'Craft', Combat: 'Prowess', Etiquette: 'Society', 'Creature Studies': 'Nature' };
const PROF_FIELD = { Knowledge: 'history, sciences, numbers, geography, nations, languages, records and puzzles', Arcana: 'magic, curses, wards, traps and precise spellwork', Craft: 'making, brewing, mending, cooking and handiwork', Prowess: 'duels, sport, climbing, running and strength', Society: 'formal dealings, manners, bargaining, performance and reading a room', Nature: 'beasts, plants, weather, tracks and the outdoors' };
const CLUB_STATS = {"Prowess":["Magic Duelling","Soccer","Running","Archery","Swimming","Gymnastics","Basketball","Walking"],"Nature":["Beast Handling","Gardening","Fishing","Groundskeeping"],"Craft":["Alchemy","Brewing","Smithing","Tailoring","Cooking","Drawing","Calligraphy"],"Society":["Music","Tea","Theatre","Card","Board Game","Festival Committee","Student Council","Medical Centre Volunteers"],"Arcana":["Warding Study","Divination","Specialized Magic"],"Knowledge":["Library Assistants","Newspaper"]};
const CLUB_MEMBERS = {"Academy Newspaper":["Castor","Linus"],"Alchemy Circle":["Royhan"],"Archery Club":[],"Basketball Club":[],"Beast Handling Club":["Lenna"],"Board Game Club":["Gareth"],"Brewing Club":[],"Calligraphy Club":[],"Card Club":["Aiden"],"Cooking Club":["Nerys"],"Divination Society":["Kanae"],"Drawing Club":["Alyssa"],"Festival Committee":["Caspian"],"Fishing Club":["Ottavio","Wren"],"Gardening Club":["Idris","Maple"],"Groundskeeping":[],"Gymnastics Club":[],"Library Assistants":["Irene","Tilly"],"Magic Duelling Club":["Sophia","Tsubaki"],"Medical Centre Volunteers":[],"Music Club":["Caralynn","Ruby"],"Running Club":["Saffi"],"Smithing Club":["Vera"],"Soccer Club":["Percival"],"Specialized Magic Club":["Hadrian"],"Student Council":["Dante","Florian"],"Swimming Club":[],"Tailoring Club":["Zara"],"Tea Club":[],"Theatre Troupe":["Trixie","Ezrel"],"Walking Club":[],"Warding Study Group":[]};
const PRACTICE = [{"loc":"potion_halls","action":"Brew a potion","stat":"Craft","xp":2,"afterClass":true,"until":1200,"dorm":true,"name":"Potion Halls"},{"loc":"potion_halls","action":"Reagent drill","stat":"Craft","xp":1,"name":"Potion Halls"},{"loc":"main_library","action":"Study a subject","stat":"subject","xp":2,"study":true,"name":"Main Library"},{"loc":"study_rooms","action":"Group study","stat":"subject","xp":2,"partner":true,"study":true,"name":"Study Rooms"},{"loc":"archive","action":"Dig through the records","stat":"Knowledge","xp":2,"name":"Archive"},{"loc":"seminar_rooms","action":"Practise wards and counter-curses","stat":"Arcana","xp":2,"afterClass":true,"name":"Seminar Rooms"},{"loc":"observation_tower","action":"Chart the stars","stat":"Arcana","xp":2,"night":true,"clear":true,"name":"Observation Tower"},{"loc":"meditation_rooms_spirit_house","action":"Will-focus meditation","stat":"Arcana","xp":1,"partner":true,"train":"mana","name":"Meditation Rooms / Spirit House"},{"loc":"club_rooms","action":"Specialized Magic practice","stat":"Arcana","xp":2,"club":"Specialized Magic","name":"Club Rooms"},{"loc":"combat_grounds","action":"Drill","stat":"Prowess","xp":1,"dorm":true,"train":"stamina","name":"Combat Grounds"},{"loc":"combat_grounds","action":"Spar with a partner","stat":"Prowess","xp":2,"dorm":true,"partner":true,"name":"Combat Grounds"},{"loc":"sparring_pavilion","action":"Take a challenge from the board","stat":"Prowess","xp":3,"club":"Magic Duelling","name":"The Sparring Pavilion"},{"loc":"gymnasium","action":"Train","stat":"Prowess","xp":1,"train":"stamina","name":"Gymnasium"},{"loc":"sports_field","action":"Train","stat":"Prowess","xp":1,"train":"stamina","name":"Sports Field"},{"loc":"archery_range","action":"Train","stat":"Prowess","xp":1,"train":"stamina","name":"Archery Range"},{"loc":"swimming_pool","action":"Train","stat":"Prowess","xp":1,"train":"stamina","name":"Swimming Pool"},{"loc":"gardens","action":"Tend the reagent beds","stat":"Nature","xp":1,"daylight":true,"club":"Gardening","name":"Gardens"},{"loc":"menagerie","action":"Help with the animals","stat":"Nature","xp":2,"daylight":true,"partner":true,"name":"Menagerie"},{"loc":"menagerie","action":"Muck out the pens (paid)","stat":"Nature","xp":1,"paid":40,"name":"Menagerie"},{"loc":"forest","action":"Fieldwork: tracks and signs","stat":"Nature","xp":2,"daylight":true,"name":"Forest"},{"loc":"forest","action":"Forage","stat":"Nature","xp":1,"name":"Forest"},{"loc":"forest_clearing","action":"Gather clearing blooms","stat":"Nature","xp":1,"name":"Forest Clearing"},{"loc":"fishing_house","action":"Fish the pond or the lake","stat":"Nature","xp":1,"club":"Fishing","name":"Fishing House"},{"loc":"mall","action":"Dance and deportment","stat":"Society","xp":2,"cost":15,"name":"The Mall"},{"loc":"mall","action":"Music practice","stat":"Society","xp":2,"cost":15,"name":"The Mall"},{"loc":"mall","action":"Art studio","stat":"Craft","xp":2,"cost":15,"name":"The Mall"},{"loc":"common_rooms","action":"Practise forms of address","stat":"Society","xp":1,"partner":true,"name":"Common Rooms"},{"loc":"club_rooms","action":"Music, Tea, Theatre practice","stat":"Society","xp":2,"clubAny":["Music","Tea","Theatre"],"name":"Club Rooms"},{"loc":"club_rooms","action":"Drawing, Calligraphy, Tailoring practice","stat":"Craft","xp":2,"clubAny":["Drawing","Calligraphy","Tailoring"],"name":"Club Rooms"},{"loc":"workshop","action":"Runes and talismans","stat":"Craft","xp":2,"name":"Workshop"},{"loc":"workshop","action":"Enchant or repair","stat":"Craft","xp":2,"name":"Workshop"},{"loc":"workshop","action":"Brewing Club bench","stat":"Craft","xp":2,"club":"Brewing","name":"Workshop"},{"loc":"workshop","action":"Smithing","stat":"Craft","xp":2,"club":"Smithing","name":"Workshop"},{"loc":"workshop","action":"Tailoring","stat":"Craft","xp":2,"club":"Tailoring","name":"Workshop"},{"loc":"canteen","action":"Cook or bake","stat":"Craft","xp":2,"club":"Cooking","name":"Canteen"},{"loc":"common_rooms","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Common Rooms"},{"loc":"courtyards","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Courtyards"},{"loc":"gardens","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Gardens"},{"loc":"fire_dormitory","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Fire Dormitory"},{"loc":"light_dormitory","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Light Dormitory"},{"loc":"sky_dormitory","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Sky Dormitory"},{"loc":"viridian_dormitory","action":"Knit or sew, sketch or paint, carve, calligraphy","stat":"Craft","xp":1,"materials":true,"name":"Viridian Dormitory"}];
const CRAFTS = {"_note":"Craft recipes for Practice. groups: the Practice actions a craft can be done under (club = extra club needed for that action), the best owned tool's bonus, the experts whose presence adds +10 and opens advanced work, and the mishap injury. Material options are alternatives; each listed item is consumed once per attempt. yield = pieces for fine / success / weak (default 1). Sale values are guide prices for finished work, not shop stock. masterwork: a finished Project of one of these Kinds, judged at the masterwork DC (Craft Rank 4); the Kind picks the group for tools, experts and the Bag kind.","tiers":{"simple":25,"standard":45,"advanced":65,"masterwork":85},"groups":{"Brewing":{"actions":[{"action":"Brew a potion"},{"action":"Brewing Club bench"}],"tools":[["Ardenne measuring set",10],["Glass stirring-rod set",5]],"experts":["Mimosa","Royhan"],"mishap":["burn","hand","tender fingers"],"bag":"drink"},"Runes":{"actions":[{"action":"Runes and talismans"},{"action":"Specialized Magic practice"}],"tools":[["Steel-nib fountain pen",5]],"mishap":["burn","hand","tender fingers"]},"Repair":{"actions":[{"action":"Enchant or repair"}],"mishap":["burn","hand","tender fingers"]},"Enchant":{"actions":[{"action":"Enchant or repair"}],"mishap":["burn","hand","tender fingers"]},"Cooking":{"actions":[{"action":"Cook or bake"}],"mishap":["burn","hand","tender fingers"],"bag":"food"},"Needlework":{"actions":[{"action":"Knit or sew, sketch or paint, carve, calligraphy"},{"action":"Tailoring"},{"action":"Drawing, Calligraphy, Tailoring practice","club":"Tailoring"}],"mishap":["needle prick","finger","a sore fingertip"]},"Drawing":{"actions":[{"action":"Knit or sew, sketch or paint, carve, calligraphy"},{"action":"Art studio"},{"action":"Drawing, Calligraphy, Tailoring practice","club":"Drawing"}],"mishap":["strained wrist","wrist","an aching wrist"]},"Woodcarving":{"actions":[{"action":"Knit or sew, sketch or paint, carve, calligraphy"}],"mishap":["cut","hand","a bandaged finger"]},"Calligraphy":{"actions":[{"action":"Knit or sew, sketch or paint, carve, calligraphy"},{"action":"Drawing, Calligraphy, Tailoring practice","club":"Calligraphy"}],"tools":[["Steel-nib fountain pen",5]],"mishap":["paper cut","finger","a stinging fingertip"]},"Smithing":{"actions":[{"action":"Smithing"}],"tools":[["Precision tool roll",5]],"mishap":["burn","hand","tender fingers"]}},"masterwork":{"rank":4,"xp":3,"kinds":{"craft":"","potion":"Brewing","smithing":"Smithing","tailoring":"Needlework","enchantment":"Runes","cooking":"Cooking","painting":"Drawing","carving":"Woodcarving","calligraphy":"Calligraphy"}},"recipes":[{"name":"Warming draught","group":"Brewing","tier":"simple","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"clears":["Chilled"],"buff":"warm","mins":240},"sale":8,"yield":[3,2,1]},{"name":"Cooling draught","group":"Brewing","tier":"simple","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"clears":["Overheated"],"buff":"sun","mins":240},"sale":8,"yield":[3,2,1]},{"name":"Cold remedy","group":"Brewing","tier":"simple","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"cure":"Head cold"},"sale":10,"yield":[3,2,1]},{"name":"Healing draught","group":"Brewing","tier":"standard","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"heal":"minor"},"sale":15,"yield":[3,2,1]},{"name":"Vigour tonic","group":"Brewing","tier":"standard","materials":[[{"item":"Common reagent bundle","qty":1}],[{"item":"Foraged reagent","qty":1}]],"kind":"drink","use":{"stamina":20},"sale":12,"yield":[3,2,1]},{"name":"Strong healing draught","group":"Brewing","tier":"advanced","materials":[[{"item":"Common reagent bundle","qty":2}],[{"item":"Common reagent bundle","qty":1},{"item":"Clearing bloom","qty":1}],[{"item":"Rare reagent","qty":1}]],"kind":"drink","use":{"heal":"moderate_to_minor"},"sale":40,"yield":[2,1,1]},{"name":"Fire flask","group":"Brewing","tier":"advanced","materials":[[{"item":"Common reagent bundle","qty":2}],[{"item":"Common reagent bundle","qty":1},{"item":"Clearing bloom","qty":1}],[{"item":"Rare reagent","qty":1}]],"kind":"other","use":{"fitting":"fire"},"sale":40,"yield":[2,1,1]},{"name":"Bottled cold","group":"Brewing","tier":"advanced","materials":[[{"item":"Common reagent bundle","qty":2}],[{"item":"Common reagent bundle","qty":1},{"item":"Clearing bloom","qty":1}],[{"item":"Rare reagent","qty":1}]],"kind":"other","use":{"fitting":"cold"},"sale":40,"yield":[2,1,1]},{"name":"Warmth rune","group":"Runes","tier":"simple","materials":[[{"item":"Talisman paper stack","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other","use":{"buff":"warm","mins":240},"sale":10},{"name":"Rain-ward talisman","group":"Runes","tier":"standard","materials":[[{"item":"Talisman paper stack","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other","use":{"buff":"waterproof","mins":180},"sale":20},{"name":"Light rune","group":"Runes","tier":"standard","materials":[[{"item":"Talisman paper stack","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other","use":{"fitting":"dark"},"sale":20},{"name":"Ward talisman","group":"Runes","tier":"advanced","arcana":3,"materials":[[{"item":"Talisman paper stack","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other","use":{"fitting":"curse or hex"},"sale":40},{"name":"Repair damaged item","group":"Repair","tier":"standard","materials":[[]],"target":"repair","sale":0},{"name":"Enchant warm","group":"Enchant","tier":"advanced","arcana":3,"materials":[[{"item":"Common reagent bundle","qty":1}]],"target":"enchant","gear":"warm","sale":0},{"name":"Enchant waterproof","group":"Enchant","tier":"advanced","arcana":3,"materials":[[{"item":"Common reagent bundle","qty":1}]],"target":"enchant","gear":"waterproof","sale":0},{"name":"Honey buns","group":"Cooking","tier":"simple","materials":[[{"item":"Baking and cooking ingredients","qty":1}]],"kind":"food","use":{"stamina":10},"yield":[3,2,1],"sale":4},{"name":"Butter cookies","group":"Cooking","tier":"simple","materials":[[{"item":"Baking and cooking ingredients","qty":1}]],"kind":"food","use":{"stamina":10},"yield":[3,2,1],"sale":4},{"name":"Hearty stew pot","group":"Cooking","tier":"standard","materials":[[{"item":"Baking and cooking ingredients","qty":1},{"item":"Carrots and fresh greens","qty":1}],[{"item":"Baking and cooking ingredients","qty":1},{"item":"Salaffian spice box","qty":1}]],"kind":"food","use":{"stamina":15},"yield":[4,3,2],"sale":8},{"name":"Festival cake","group":"Cooking","tier":"advanced","materials":[[{"item":"Baking and cooking ingredients","qty":2}],[{"item":"Baking and cooking ingredients","qty":1},{"item":"Bag of red apples","qty":1}],[{"item":"Baking and cooking ingredients","qty":1},{"item":"Salaffian spice box","qty":1}]],"kind":"food","sale":30},{"name":"Mend clothes","group":"Needlework","tier":"simple","materials":[[]],"kind":"other","target":"mend"},{"name":"Knitted scarf","group":"Needlework","tier":"standard","materials":[[{"item":"Knitting wool and needles","qty":1}]],"kind":"gear","gear":"warm","sale":20},{"name":"Embroidered handkerchief","group":"Needlework","tier":"standard","materials":[[{"item":"Embroidery thread set","qty":1}]],"kind":"gift","sale":15},{"name":"Knitted winter set","group":"Needlework","tier":"advanced","materials":[[{"item":"Knitting wool and needles","qty":2}]],"kind":"gear","gear":"warm","sale":45},{"name":"Sky silk garment","group":"Needlework","tier":"advanced","materials":[[{"item":"Bolt of Sky silk","qty":1},{"item":"Embroidery thread set","qty":1}]],"kind":"gift","sale":80},{"name":"Sketch","group":"Drawing","tier":"simple","materials":[[{"item":"Sketchbook and charcoal","qty":1}]],"kind":"gift","sale":5},{"name":"Portrait","group":"Drawing","tier":"standard","materials":[[{"item":"Sketchbook and charcoal","qty":1}],[{"item":"Paint box","qty":1}]],"kind":"gift","sale":20},{"name":"Painting","group":"Drawing","tier":"advanced","materials":[[{"item":"Paint box","qty":1}]],"kind":"gift","sale":"30-80"},{"name":"Carved figure","group":"Woodcarving","tier":"standard","materials":[[{"item":"Carving knife and limewood block","qty":1}]],"kind":"gift","sale":15},{"name":"Carved box","group":"Woodcarving","tier":"advanced","materials":[[{"item":"Carving knife and limewood block","qty":1}]],"kind":"gift","sale":35},{"name":"Formal letter","group":"Calligraphy","tier":"standard","materials":[[{"item":"Letter paper set","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"other"},{"name":"Illuminated invitation","group":"Calligraphy","tier":"advanced","materials":[[{"item":"Letter paper set","qty":1},{"item":"Pen nibs and ink","qty":1}]],"kind":"gift","sale":25},{"name":"Hooks and nails","group":"Smithing","tier":"simple","materials":[[{"item":"Bar stock and coal","qty":1}]],"kind":"other","sale":5},{"name":"Balanced blade","group":"Smithing","tier":"standard","materials":[[{"item":"Bar stock and coal","qty":1}]],"kind":"other","sale":25},{"name":"Forged fittings","group":"Smithing","tier":"advanced","materials":[[{"item":"Bar stock and coal","qty":2}]],"kind":"other","sale":40},{"name":"Small forged tool","group":"Smithing","tier":"advanced","materials":[[{"item":"Bar stock and coal","qty":2}]],"kind":"other","sale":40}]};
// 1.29.0: clothing a craft can mend or enchant; the materials that open the portable craft practice (from data/crafts.json)
const CRAFT_CLOTHES = /cloaks?|coats?|robes?|vests?|scarves?|shirts?|dresses?|uniforms?|jackets?|garments?/i;
const CRAFT_PORTABLE = new Set((CRAFTS.recipes || []).filter(r => (((CRAFTS.groups || {})[r.group] || {}).actions || []).some(g => PRACTICE.some(a => a.materials && a.action === g.action)))
  .flatMap(r => (r.materials || []).flat().map(m => m.item.toLowerCase())));
const MARKS = ['F', 'D', 'C', 'B', 'A'];
const MID_SLOTS = { 'Magic Theory': [0, 480, 600], Etiquette: [0, 600, 720], History: [1, 480, 600], 'Potion Crafting': [1, 780, 960],
  'Dark Magic Defense': [2, 480, 960], Combat: [3, 480, 960] };
const PRACTICAL = ['Potion Crafting', 'Dark Magic Defense', 'Combat', 'Creature Studies'];
// an A: +10 on a Fortune roll in the subject's field (rule 504 "specialty"), until the next exams
const TOP_FIELD = Object.fromEntries(SUBJECTS.map(s => [s, PROF_FIELD[SUBJECT_STAT[s]]]));
const TUTOR_PAY = 40, TUTOR_WEEK = 2, ASSIGNMENT_MIN = 45;
// 1.30.0 (owner-approved planning/DRAFT_proficiency_practice.md, Batch 6): a mark's score = preparation, the subject's proficiency
// and attendance, weighted for theory or practical, plus a seeded exam-day roll; Rank 5 in a proficiency opens its mastery perk
const GRADE_W = { theory: [0.5, 0.3, 0.2], practical: [0.3, 0.5, 0.2] }, GRADE_CUT = [40, 55, 70, 85];
const EXAM_DAY = [[10, -8, 'a bad day'], [30, -4, 'an off day'], [70, 0, ''], [90, 4, 'a good day'], [100, 8, 'an inspired day']];
const MASTERY = 5, profRankOf = (X, k) => PROF_CUT.filter(x => num((((X || {}).$eng || {}).prof || {}).xp && X.$eng.prof.xp[k], 0) >= x).length - 1;
// staff and nobles (Consummate: NPC_GROUP staff, or other = the Doves, the Cathedral, the Liaison, facilities); nobles by the lorebook (House Silvarenne, House Villeneuve, the Liaison's regulars)
const CONSUMMATE_GROUPS = ['staff', 'other'], NOBLES = ['Caspian', 'Caralynn', 'Florian', 'Elion', 'Nerys'];
const subjectOf = t => { const x = String(t || '').trim().toLowerCase(); return x === 'dmd' ? 'Dark Magic Defense' : SUBJECTS.find(s => s.toLowerCase() === x) || ''; };
const subjectIn = t => SUBJECTS.find(s => new RegExp(`\\b${s}\\b`, 'i').test(String(t || ''))) || (/\bDMD\b/.test(String(t || '')) ? 'Dark Magic Defense' : '');
const teaches = (id, subj, py) => ((CLASS.teach || {})[id] || []).some(x => x[0] === subj && (x[1] === py || x[1] === 0));
// 1.2.2 bond system (owner design): XP per kind of interaction with daily/weekly limits, rising XP per rank scaled by the pace
// setting, a cooldown after each rank, then an in-scene interaction to deepen the bond.
const BR = {"_note":"1.2.2 bond system, single source for the engine (tools/gen_engine.py), the UI (tools/gen_ui.py) and the Now entry (tools/gen_mvu_entries.py). Edit here, then rebuild. xp_base[r] = XP from Rank r to Rank r+1 at standard pace; cool_base[r] = days after reaching Rank r before its next bond event can start. pace multiplies both (full rank: fast ~1 month, brisk ~2 months, standard ~1 semester, slow ~1 year of diligent play).","xp_base":[10,20,30,40,50,55,60,65,70,80],"cool_base":[0,1,2,3,3,4,5,6,7,7],"close_at":0.8,"_note_close_at":"1.5.0 (N3a): a bond is marked close in <now> once its XP reaches this share of the next rank's need (before the bar is full).","pace":{"fast":0.25,"brisk":0.5,"standard":1,"slow":2.5},"pace_labels":{"fast":"Fast (~1 month)","brisk":"Brisk (~2 months)","standard":"Standard (~1 semester)","slow":"Slow (~1 year)"},"kind_xp":{"talk":2,"hangout":3,"help":5},"per_day":{"talk":1,"hangout":1},"per_week":{"gift":2,"help":1},"gift_xp":{"loved":4,"liked":2,"neutral":1,"disliked":0,"hated":0},"gift_disliked_tension":5,"gift_bonus_rank":3,"gift_bonus_mult":1.5,"weather_xp":1,"start":{"_note":"1.3.1 (owner playtest): a bond that does not start at Rank 0. Applied once, when the engine first records the bond (the first scene they share); the next event waits for that rank's cooldown.","Etnie":{"Rank":3,"Trust":70,"Title":"Self-declared big sister","Known_facts":["Third-year, Viridian (dog beastkin); insists she is {{user}}'s big sister"],"Milestones":["Etnie decided {{user}} is her little sibling"]}},"romance_default":8,"romance_options":[[0,"Any rank"],[4,"Rank 4"],[6,"Rank 6"],[8,"Rank 8"],[10,"Rank 10"],[11,"Off"]],"openness":{"open":2,"normal":0,"guarded":-1,"closed":-2},"share":[[0,"how they look and their public role"],[1,"their name, age, club and where they spend time"],[2,"the magic and skills they use openly"],[3,"likes, dislikes, hobbies and birthday"],[4,"their personality and what shows when they are upset"],[5,"their goals"],[6,"what they think of other people and of the Doves"],[7,"their past and family"]],"share_real_from":5,"perks":{"1":"greets {{user}} and can be found at their usual places","2":"may accept a genuine invitation; first accepted invited hangout each week grants one extra bond XP","3":"sometimes seeks {{user}} out; remembers the birthday","4":"may actively help with their listed mana, stamina or study activities; ordinary shared work gets a modest bonus","5":"shares their goal and may ask for help with it","6":"may introduce {{user}} to a new roster NPC, whose bond starts at Rank 1","7":"may escort {{user}} into their dorm, or receive an unscheduled worksite visit if staff","8":"closest bond: best friend, romance or sworn rival, as far as this character and lived story allow","9":"may publicly vouch for {{user}} once per month, softening one related reputation loss by up to 5 XP","10":"would sacrifice for {{user}}"},"you_line":[{"kind":"dislike","tension_from":70,"arrow":true},{"kind":"rivals","title":"rival"},{"kind":"wary","tension_from":40,"arrow":true},{"kind":"wary","trust_below":35,"arrow":true},{"kind":"friends","title":"best friend"},{"kind":"friends","rank_from":5,"trust_from":65}],"_note_you_line":"1.4.2 (owner): People -> Connections, your own line to someone takes a kind from the bond. Romance first (Bonds.<id>.Romance), then the first rule here whose conditions all hold (tension_from, trust_below, trust_from, rank_from, title = a word in Bonds.<id>.Title); none = a plain gold bond line. arrow: the line is their view of you (them -> you); otherwise it is shared. The line is thicker with rank. 1.4.3: the Trust thresholds follow data/trust.json (Doubtful under 35, Trusting from 65).","recent":{"keep":10,"now":5,"phrases":{"talk":"talked","hangout":"spent time together","gift":"gave them a gift","help":"helped them","fight":"fought or sparred","apology":"apologised","keep":"kept a promise","secret":"kept their secret","defend":"stood up for them","confide":"confided a secret","understood":"they understood","choose":"chose them over someone else"}},"_note_recent":"1.4.4 (owner): each bond keeps its latest `keep` moments with {{user}} (Bonds.<id>.$Recent: when, one sentence, effect), shown in the dossier newest first; <now> gives the narrator the newest `now` of them for each present character. The sentence is the Note the narrator adds to an interaction; without one, the kinds (phrases).","gift_hated_tension":10,"birthday":{"gift_mult":2,"social_mult":1.5,"remember_trust":2,"recovery_mult":2,"party_xp":3,"host_rank":7,"guest_rank":5,"tension_below":40},"gift_log_cap":24};
const START = BR.start || {};   // 1.3.1: bonds that begin above Rank 0 (data/bond_rules.json start)
const HAUNT = {"Irene":"Main Library","Caspian":"Council Chamber, Cathedral, The Snug (neutral ground for diplomacy)","Etnie":"Library upper stacks","Royhan":"Potion Halls, Gardens, Library","Lenna":"the far Gardens, Menagerie, Forest","Saffi":"Sports Field, Gymnasium","Kanae":"Observation Tower, still water","Idris":"Gardens (takes occasional work there), the Forest Clearing (the only warm spot i","Aiden":"Workshop stair and Bell Tower (curfew routes), the Rooftop (he phases through th","Caralynn":"Club Rooms (Music Club rehearsals), the Announcement Room (fighting for the afte","Zara":"Library highest shelves (takes shelving work), Workshop","Gavlan":"Combat Grounds, Faculty Offices, his office library","Yvette":"Workshop, warm end of the Lecture Halls","Krieg":"Dovecote, Detention Tower, Forest edge","Milena":"Lecture Halls, Combat Grounds, Dovecote","Baelin":"Headmaster's Office, Faculty Offices, Council Chamber","Layla":"Main Library, Archive","Vallie":"the Menagerie and her converted stables beside it, the Forest and the fields (wh","Percival":"Sports Field, Gymnasium, Canteen","Sophia":"Combat Grounds, Lake, Sports Field","Rei":"Warden's Office, Seal Chamber, Forest edge, Rooftop","Kuroo":"Staff Room, Card Club, the Viridian Dormitory common room","Mimosa":"Potion Halls, Workshop","Gareth":"Combat Grounds, Observation Tower, Library","Trixie":"the Courtyards (performances nobody asked for), Club Rooms and the old indoor am","Vera":"Potion Halls, Workshop, Medical Centre","Tristan":"Cathedral, Meditation Rooms","Althair":"everywhere","Dante":"Student Council Chamber, Forest edge, Dovecote","Castor":"Archive, Notice Board","Ruby":"Music Club, Mall, Main Library","Florian":"Student Council Chamber, the Combat Grounds whenever Gareth has booked a ring, T","Alyssa":"Library Study Rooms, the Mail Tower on letter days, the Rooftop (Zara has shown ","Tilly":"The Archive, the Broken Statue (her current favourite mystery), the Long Corrido","Ezrel":"second-year Lecture Halls, the Club Rooms, the Light Dormitory, the Workshop aft","Ottavio":"the Sky Dormitory common room, the Fishing Club dock, the third-year Lecture Hal","Caine":"the Noble Houses' Liaison, the Mail Tower on the Liaison's errands","Bobby":"Workshop, Canteen during breaks, the old amphitheatre when testing props, and wh","Linus":"Announcement Room, Sparring Pavilion, Combat Grounds (the spectator bench neares","Maple":"Gardens, the Forest edge (up a tree, whenever she can), the Sky Dormitory tower,","Nerys":"Mail Tower (the pigeons), Gardens and the Forest edge (foraging, when broke, whi","Hadrian":"the Club Rooms (Specialized Magic), the Workshop after hours (for other people's","Wren":"the Fishing House dock at dawn, the Fire Dormitory common room (the corner seat ","Tsubaki":"the Sparring Pavilion and the Combat Grounds (training, always), the Observation"};
// 1.3.0 (owner brainstorm 2026-09-25): bond rewards (Rank 5 gift, Rank 10 benefit, mask -> truth, Krieg), reputation, training.
// Single sources data/bond_rewards.json, reputation.json, training.json; NPC_GROUP: staff | student | other | rival (no bond system).
const REW = {"train_bonus":0.5,"jump_pct":10,"monthly":{"aiden":[200,"silent partner's share of Aiden's betting book"],"tristan":[100,"Asmoday's Mercy stipend (Tristan)"],"mimosa":[150,"royalty on the formula co-authored with Mimosa"]},"mask":["Castor","Kanae","Caine"],"krieg":{"id":"Krieg","weekly_xp":14,"min_doves":1,"max_attention":39,"note":"Rank 1 from his introduction; then +weekly_xp every Monday while Doves reputation >= min_doves (and, with hidden magic, Dove attention <= max_attention: Unnoticed or Rumoured); otherwise no XP and Tension +1. No XP from talks, hangouts or gifts."},"npcs":{"Aiden":{"gift":{"name":"Aiden's patrol-route deck","text":"A deck of Card Club cards with every Dove patrol route and bell timing inked on the backs, one route per card. Carrying it, {{user}} is far harder to catch out after curfew, because Aiden quietly updates the deck whenever the Doves change a route."},"r10":{"name":"Aiden (Rank 10)","text":"Aiden makes {{user}} a silent partner in the betting book, and a share of its takings arrives every month. Once a week he will also phase and shrink anything {{user}} needs into or out of anywhere on campus, no questions asked.","monthly":"aiden"}},"Caralynn":{"gift":{"name":"Caralynn's calling card","text":"A calling card on Veyturone crest paper, \"A friend of House Veyturone\" written in her own hand. Shown at the Noble Houses' Liaison or to any noble student, it gets {{user}} a polite hearing and a seat at tables they would never otherwise reach."},"r10":{"name":"Caralynn (Rank 10)","text":"Caralynn declares {{user}} her equal in front of her whole following: from then on her followers run {{user}}'s errands too, and gossip against {{user}} dies within the week. Once a month she will spend House Veyturone's name on {{user}}'s behalf, with the Liaison, the Inspectorate or a noble with a grudge."}},"Zara":{"gift":{"name":"Zara's talisman jacket","text":"A jacket she designed for {{user}} and, for once, actually finished, with protective talismans sewn into the lining. It stops one hostile spell or curse outright, and Zara rewrites the lining every month so it is always ready again."},"r10":{"name":"Zara (Rank 10)","text":"Zara becomes {{user}}'s talisman-writer: a fresh set of protective, repulsion and exorcism charms every week, free, written for {{user}}'s hand alone. Her exorcist's sense is turned on {{user}} for good, so if anyone ever lays a curse on them, she is the first to know."}},"Percival":{"gift":{"name":"Brotherhood of Laetano badge","text":"A tin badge of the Brotherhood of Laetano, pinned on {{user}} in a full knighting ceremony that makes them a squire sworn to the Brotherhood's dawn drills. Stamina training done with Percival counts for half as much again (×1.5), because he runs every lap as if someone at the far end of the field needs him.","train":"stamina"},"r10":{"name":"Percival (Rank 10)","text":"Sir Percival swears himself as {{user}}'s knight: he joins any team {{user}} forms as its healer and answers {{user}}'s call in any fight. Once per fight he throws himself between {{user}} and a finishing blow, and heals them back to their feet with his own strength."}},"Trixie":{"gift":{"name":"Trixie's flash powder","text":"A pouch of Confetti circus flash powder, the family recipe, which is not magic and cannot be dispelled. Thrown down, it blinds a whole room for a few seconds, and Trixie refills it every time the circus writes."},"r10":{"name":"Trixie (Rank 10)","text":"The Confetti circus adopts {{user}} as honorary family, with free passage, lodging and news from every town it plays. Trixie herself will cause a distraction on request, anywhere and any time, big enough that nobody remembers what {{user}} was doing."}},"Vera":{"gift":{"name":"Vera's Rest token","text":"A Rest token, a brass charm she enchanted with a sliver of her own Rest: pressed once a week, it gives {{user}} a full night's sleep in one hour. She has taken the sleep debt for every use onto herself in advance, and refuses to discuss it."},"r10":{"name":"Vera (Rank 10)","text":"Vera becomes {{user}}'s personal workshop: she repairs, improves or enchants any equipment {{user}} brings, and her upgrades come out better than anything the Mall sells. Once a day she will also Rest {{user}} by hand and take the debt herself."}},"Castor":{"gift":{"name":"Castor's newspaper notebook","text":"A hand-bound notebook; anything {{user}} writes in it and slips under the Academy Newspaper's door is printed in the next issue, anonymously. It is the fastest way on campus to plant a story or kill a rumour, and Castor never asks who wrote it."},"r10":{"name":"Castor (Rank 10)","text":"Castor chooses {{user}} over the Choir, quietly and completely: he warns them before any rite, mark or curse the Choir turns their way, and tells them who at Halvard sings with it. He also lifts any curse on {{user}} at any hour, because he knows exactly how each one was built.","secret":"Every warning is a betrayal his father will eventually notice. He finishes the page about a way out, and it has {{user}} in it."},"nudge":{"text":"Castor lets {{user}} read his private writing, and between the pages is one he never finished, about a boy who sings at dawn in a choir he never chose.","fact":"Castor's unfinished page mentions a 'Morning Choir'."},"gate":"{{user}} has learned, in play, that Castor belongs to the Morning Choir."},"Alyssa":{"gift":{"name":"Alyssa's notebook offer","text":"A standing offer from her notebook: once a week {{user}} can name anyone at Halvard and Alyssa reads them her page on that person. It tells {{user}} where that person tends to be this week and one thing they would be glad to receive, because Alyssa writes down exactly what she has seen and nothing more."},"r10":{"name":"Alyssa (Rank 10)","text":"Once a day Alyssa spends Foresight on {{user}}, telling them what the next five minutes hold before an exam, a duel or a conversation that matters. In any fight they share she calls every attack a heartbeat before it lands. {{user}}'s page is the first she reads each week: she still meets them as a stranger, but only for the length of one page, and she is glad before she reaches the end of it."}},"Lenna":{"gift":{"name":"Greenwind seedling","text":"A potted seedling from the Greenwind Forest, the last living thing she brought from home. Any animal near it grows calm, which makes the Menagerie, the Forest and the Creature Studies Expedition far safer for {{user}}."},"r10":{"name":"Lenna (Rank 10)","text":"Lenna brings {{user}} into the Greenwind ways: animals in the Menagerie and the Forest treat {{user}} as one of hers, and her earth rises to shield them anywhere off the paths. She also cooks for {{user}} every rest day, a Greenwind meal that sets them right for the whole week."}},"Saffi":{"gift":{"name":"Running Club whistle","text":"A spare Running Club whistle on a cord: blow it before classes and Saffi turns up within minutes, ready to drag {{user}} round the Sports Field. Stamina training done with her counts for half as much again (×1.5), because she never lets anyone stop at \"tired\".","train":"stamina"},"r10":{"name":"Saffi (Rank 10)","text":"Saffi joins any team {{user}} forms as its front-line fighter, and nobody lays a hand on {{user}} while she is within earshot. Her night senses keep watch for them after dark, and she will sprint anywhere on campus the moment she hears {{user}} call."}},"Kanae":{"gift":{"name":"Quveno silver mirror","text":"A silver hand mirror from the Quveno house, \"so you can always find me\". Once a week, {{user}} can say her name into it and ask one true reading: where someone is, or what is coming.","secret":"It also lets her watch {{user}} through it whenever she likes, and she does."},"r10":{"name":"Kanae (Rank 10)","text":"Seen through and still wanted, Kanae lays the Plan down: the mirror stays, but she only looks through it when {{user}} asks. Once per fight they share, her chains pin one enemy in place for {{user}} before anyone else's magic moves.","secret":"It is the first honest thing she has ever given. Whether she ever tells Dante the truth about Niu is up to the story."},"nudge":{"text":"In an unguarded moment Kanae says the name of a girl who \"should have kept her mouth shut\", then laughs it off.","fact":"Kanae mentioned someone called Niu; Dante Kleinn is said to be re-reading an old Dove case under that name."},"gate":"{{user}} has learned, in play, the truth about the rigged readings, the Plan, or what happened to Niu."},"Idris":{"gift":{"name":"Idris's two vials","text":"Two vials in precise script: an antivenom brewed from his own venom that cures almost any poison, and the venom itself. He calls the second \"for emergencies\" and will not explain further.","grad":"A keepsake from Idris, who has graduated: a vial not yet used still works once (the antivenom cures almost any poison); nothing more comes."},"r10":{"name":"Idris (Rank 10)","text":"Idris haggles for {{user}} as if they were family business, and everything {{user}} buys at the Mall and the Commissary costs noticeably less. Mormo watches {{user}}'s back when Idris cannot, draining the stamina of anyone who comes at them in the dark."}},"Dante":{"gift":{"name":"Council safety card","text":"A signed Student Council safety card bearing Dante's name and a copy number in the Council log. If {{user}} is in danger, stranded after curfew, or accused of breaking a rule, they can show it to a campus patrol or bring it to the Council Chamber. Dante takes their account into the record, arranges a safe escort or a formal hearing as needed, and makes sure the account reaches staff unchanged. The card is not a curfew pass or a pardon: he asks for the truth and reports any rule {{user}} did break."},"r10":{"name":"Dante (Rank 10)","text":"Dante counts {{user}} among the people he protects, with no conditions: anyone who threatens {{user}} finds him there, and nobody has ever beaten him hand to hand. He still reports any rule {{user}} breaks, to their face first, and stands beside them while they answer for it. Anyone who comes for {{user}} outside the rules, Doves included, finds him demanding it be done by the book: a fair hearing and every rule followed to the letter.","secret":"He has filed a formal report naming {{user}} as under his protection, the first report of his life that asks for something. Krieg read it and signed it."}},"Florian":{"gift":{"name":"Villeneuve Snug token","text":"A Villeneuve silver token for The Snug's largest booth, on Florian's account. Whatever {{user}} orders there is paid for, and anyone {{user}} brings is treated as Florian's guest."},"r10":{"name":"Florian (Rank 10)","text":"Florian joins {{user}}'s team and fights under their call, Hades and all, the first time he has followed anyone's lead in a fight. Once per fight Hades will Stop anything for {{user}} for two seconds, and the wolf's eyes see through any illusion or invisibility aimed at them."}},"Tilly":{"gift":{"name":"Tilly's map of hidden ways","text":"Her hand-drawn map of Halvard's hidden ways, copied out of Halvard Unexplained: crawlspaces, back stairs and forgotten doors. Following it, {{user}} can cross the campus unseen and reach places nobody else knows exist."},"r10":{"name":"Tilly (Rank 10)","text":"Tilly grows {{user}} a hidden bower in the far Gardens that nobody else can find, full of rare herbs and flowers she replants every week for potions and gifts. She also shows {{user}} the signet ring she wears on a chain under her blouse and promises that a letter under its seal will always be answered, though she will not say by whom.","secret":"The seal is Velmora's royal signet; a letter under it reaches Velmora's crown. Showing it is the closest she has ever come to telling anyone who she is."}},"Irene":{"gift":{"name":"Council pardon","text":"A signed Council pardon, one use, in Irene's careful hand. If {{user}} is caught breaking an academy rule that should send them to the Detention Tower, Irene takes it to the staff herself and it becomes a warning, with no Academy reputation lost: the one exception she has ever made.","uses":1},"r10":{"name":"Irene (Rank 10)","text":"Irene offers {{user}} a seat on the Student Council: Council Chamber access, a vote on student rules, and a say in how festivals and discipline are run. In a fight her barriers answer {{user}} first, and she will stand between {{user}} and the Doves even though they terrify her."}},"Caspian":{"gift":{"name":"Festival Committee badge","text":"A Festival Committee staff badge in his own name. At every festival {{user}} walks into the restricted areas, gets the best stall slot at the Bazaar, and can put an event on the programme."},"r10":{"name":"Caspian (Rank 10)","text":"When they fight side by side, Caspian's hand on {{user}}'s shoulder doubles their magic for a full minute once per fight. As Council Vice President he also speaks for {{user}} to staff, Council and the Liaison, and trouble tends to end there."}},"Etnie":{"gift":{"name":"Etnie's lockpicks","text":"Her old street lockpicks, the only thing she kept from before Halvard. They open any ordinary lock on campus (drawers, cupboards, storerooms), though not a bracelet-warded door."},"r10":{"name":"Etnie (Rank 10)","text":"Etnie leaves one of her clones on {{user}} at all times, and can swap places with it in a heartbeat to take any blow meant for them. Nobody who has hurt {{user}} is ever left alone by Big Sister again, and everyone at Halvard knows it."}},"Royhan":{"gift":{"name":"Royhan's alchemist pouch","text":"An alchemist's pouch of his own: three healing draughts and one bottle of lightning. He refills it whenever {{user}} brings back the empties, and he will not take points for it.","grad":"A keepsake from Royhan, who has graduated: whatever is still in the pouch (healing draughts, the bottle of lightning) can be used, but nobody refills it any more."},"r10":{"name":"Royhan (Rank 10)","text":"Royhan becomes {{user}}'s alchemist: every week he brews any potion they ask for at cost, including ones the Commissary cannot stock. If his regeneration potion ever works, the first bottle is {{user}}'s."}},"Sophia":{"gift":{"name":"Sophia's tactics book","text":"Her own tactics book, margins full of every trick she has used in the ring, with the brutal morning mana drill she wrote in the back. Mana training done with Sophia counts for half as much again (×1.5), because she learned to push her reserves the hard way and will not let {{user}} learn it any softer.","train":"mana"},"r10":{"name":"Sophia (Rank 10)","text":"Sophia joins {{user}}'s team and fights under {{user}}'s orders, the only person at Halvard she has ever agreed to follow. She also duels anyone who insults {{user}}, publicly and to the end."}},"Gareth":{"gift":{"name":"Gareth's training journal","text":"His private training journal: the mana drills he has run every morning since he was a boy, with an open invitation to run them beside him at the Combat Grounds. Mana training done with Gareth counts for half as much again (×1.5), because nobody at Halvard knows better how to push a mana pool past where it wants to stop.","train":"mana"},"r10":{"name":"Gareth (Rank 10)","text":"Gareth makes {{user}} his one exception to coming first: he tutors them before every exam and joins their team for competitions, burning whole arenas on their behalf.","secret":"He will also quietly ruin anyone who stands in {{user}}'s way, the way he ruined his brother, unless {{user}} tells him not to."}},"Ruby":{"gift":{"name":"Bonbon sweets tin","text":"A tin of Bonbon family sweets that never quite runs out, because her family sends a refill with every letter. Any NPC who is not averse to sweets takes one as a liked gift."},"r10":{"name":"Ruby (Rank 10)","text":"Ruby tells everyone who will listen that {{user}} is her friend, and Halvard has learned to trust Ruby's judgement: {{user}}'s Student reputation rises by one level. It is the only side she has ever picked, and she picked a person, not a side.","rep_up":"Student"}},"Gavlan":{"gift":{"name":"Gavlan's gravity bracers","text":"The gravity-weighted bracers he wore as a young mage, and one week of his dawn drills to break them in. At the end of that week {{user}}'s Mana pool jumps ahead in one go by a tenth of its starting value, weeks of training at once (still within the training limit).","jump":"mana"},"r10":{"name":"Gavlan (Rank 10)","text":"Gavlan names {{user}} the protégé he has been looking for, and teaches them in private what no class does, a technique of his own included. On rest days he takes {{user}} through the Portal to the clan's cottage, where no Dove and no Inspector can reach them."}},"Yvette":{"gift":{"name":"Yvette's warning orb","text":"A small floating orb, the little sibling of her own focus. It warms and hums whenever someone nearby means {{user}} harm, because Yvette has never once felt safe at Halvard and does not want {{user}} to be caught unready."},"r10":{"name":"Yvette (Rank 10)","text":"Yvette opens the Workshop and her research to {{user}}: any enchanted item they find, she identifies, repairs or improves. The Fire Dormitory's door becomes the one door {{user}} can knock on at any hour: whatever their dorm, she comes down to answer it, and her lightning answers for them before anyone else's."}},"Baelin":{"gift":{"name":"Headmaster's card","text":"A card on the Headmaster's paper: \"Bearer may see me without appointment.\" Once, he will hear {{user}}'s case in person and rule on it himself, over any other staff decision.","uses":1},"r10":{"name":"Baelin (Rank 10)","text":"Baelin enters {{user}} in his ledger as a debt he owes, and repays it in the one coin a headmaster has: {{user}}'s Academy reputation rises by one level. His reports to the capital start mentioning {{user}} by name, and the staff notice at once.","rep_up":"Academy"}},"Layla":{"gift":{"name":"Restricted Section permission","text":"A signed permission letter granting {{user}} reading rights in the Restricted Section. It opens the oldest records at Halvard, the ones that answer questions classes will not."},"r10":{"name":"Layla (Rank 10)","text":"Layla shares everything she has pieced together about Halvard's past, and her private tutoring makes History the easiest top mark {{user}} will ever earn. If anyone ever corners {{user}}, the gloves come off.","secret":"The last time the gloves came off, it was for Yvette."}},"Vallie":{"gift":{"name":"Ironback Boar tusk","text":"A carved tusk from the Ironback Boar that took her eye, hung on a cord. Creatures smell a hunter's trophy and back off, which makes the Forest and the Expedition far safer for {{user}}."},"r10":{"name":"Vallie (Rank 10)","text":"Vallie teaches {{user}} the Will of Steel way of taking a hit, sparring and running them until pain stops mattering, and {{user}}'s Stamina jumps ahead in one go by a tenth of its starting value, weeks of training at once (still within the training limit). She also arm-wrestles anyone who says a word against {{user}}, and she has never lost that one.","jump":"stamina"}},"Rei":{"gift":{"name":"Warden's Office key","text":"A plain brass key to the Warden's Office side door. Inside is the one room on campus that the Doves and the Inspectorate cannot enter without the Warden's leave."},"r10":{"name":"Rei (Rank 10)","text":"During the Thinning, {{user}} stands watch with Rei instead of sitting locked in the dorm, and she begins to tell them what she knows about the Crack. In any fight she arrives in smoke, and nothing gets through her to {{user}}."}},"Kuroo":{"gift":{"name":"Kuroo's dance card","text":"His old dance card from his envoy years, filled with notes on every Liaison staffer and which students they are watching. With it, {{user}} knows who the Liaison has an eye on and how to talk their way past them."},"r10":{"name":"Kuroo (Rank 10)","text":"Once, Kuroo spends every favour he has left with the staff on {{user}}: their Academy reputation rises by one level, but only from a negative level (−5 to −4, …, −1 to 0). He will not lift anyone above zero, because that part {{user}} has to earn.","rep_token":"Academy","uses":1}},"Mimosa":{"gift":{"name":"Mimosa's focus draught","text":"A vial of her own perfectly clear brew labelled \"for exams\", a focus draught she invented and has never published. Taken before a test, it lets {{user}} recall everything they studied.","uses":1},"r10":{"name":"Mimosa (Rank 10)","text":"Mimosa co-authors her first published formula with {{user}}: their name goes on it too, with the prestige and the monthly royalty. Any potion {{user}} brews under her eye cannot blow up, because she sees it coming three seconds early.","monthly":"mimosa"}},"Althair":{"gift":{"name":"Signed discipline referral","text":"A blank discipline referral, signed in advance by the Vice Headmaster. Filled in and handed back, it makes one punishment against {{user}} disappear into the files.","uses":1},"r10":{"name":"Althair (Rank 10)","text":"Althair makes {{user}} a player in his game rather than a piece: every month he nudges something their way through the paperwork, such as a better timetable, a bigger club budget or a punishment lost in the files. And when Althair is watching, things simply tend to go {{user}}'s way."}},"Ezrel":{"gift":{"name":"Ezrel's clay golem","text":"A palm-sized clay golem that follows standing orders: carry, fetch, guard a door, repeat a task. It never tires, and it never asks why.","secret":"He can look through it."},"r10":{"name":"Ezrel (Rank 10)","text":"Ezrel builds {{user}} a Mannequin, a golem nobody can tell from {{user}}, that can sit in their seat at class or roll call while they are elsewhere. In a fight it stands beside them with a golem's strength and takes the blade without slowing."}},"Ottavio":{"gift":{"name":"Ottavio's Canteen chit","text":"A Canteen chit on Ottavio's account, stamped with a worn casino mark. {{user}} eats one free meal a day for the rest of the year, because Ottavio knows which students skip meals to save points and has never allowed it."},"r10":{"name":"Ottavio (Rank 10)","text":"Ottavio takes {{user}} into his family, dorm or not: from then on the Dovecote has to go through him to reach them, and he has never handed anyone over. Loki adds {{user}} to his hoard of things he owns, so he turns up in a crisis, and on a lucky coin toss he arrives big."}},"Krieg":{"gift":{"name":"Dovecote pass","text":"A Dovecote pass under his seal: the gate opens to {{user}} at any hour to see Krieg in his office. No other student at Halvard can say that, and what {{user}} learns there, or is seen doing there, is up to them."},"r10":{"name":"Krieg (Rank 10)","text":"Krieg decides {{user}} is the one mage he will not treat as a wolf, and once a month he lets them read one Dovecote file on a person or case of their choosing. He still searches, questions and watches {{user}} like everyone else, because in his eyes that is exactly what makes the file worth showing."}},"Milena":{"gift":{"name":"White Dragonchess knight","text":"A white Dragonchess knight from her father's set. Shown to any Dove, it means Milena vouches for {{user}}, and a search ends at a polite question."},"r10":{"name":"Milena (Rank 10)","text":"Once, Milena takes {{user}}'s file off Krieg's desk and closes it: their Doves reputation rises by one level, but only from a negative level (−5 to −4, …, −1 to 0). Above zero, she says, is something {{user}} has to earn in front of the Doves themselves.","rep_token":"Doves","uses":1}},"Tristan":{"gift":{"name":"Asmoday's Mercy stipend","text":"A small monthly stipend from the Asmoday's Mercy fund, entered in his immaculate ledger as \"a student in need\". The points arrive at the start of every month, and Tristan finds it very funny that nobody has ever audited him.","monthly":"tristan"},"r10":{"name":"Tristan (Rank 10)","text":"Tristan binds any contract {{user}} needs in the Cathedral, and his Oath magic makes it unbreakable for both sides. Once, when it matters most, he will use the registry for someone for the first time in his life, and that someone is {{user}}."}},"Caine":{"gift":{"name":"Liaison guest card","text":"A Liaison guest card in Caine's hand, which puts {{user}} on the list for every Liaison reception, tea and ball. It opens the rooms where noble students and their families talk business.","secret":"He chose {{user}} to be watched."},"r10":{"name":"Caine (Rank 10)","text":"Unmasked and still courteous, Caine takes {{user}}'s name off the Choir's list, the only mercy he has ever shown a mage, and no Mark will ever touch them. He tells {{user}} one true thing each week about the Choir's work at Halvard, and leaves what {{user}} does with it entirely to them.","secret":"He does not stop, and does not ask {{user}} to join. He simply wants one person to see all of it and understand."},"nudge":{"text":"At a Liaison reception {{user}} sees a noble student who lingered after the last one: they have lost an hour they cannot account for, and they rub a \"bruise\" on their left shoulder.","fact":"Students who stay late at the Liaison lose an hour and wake with a mark on the left shoulder; Caine saw them out."},"gate":"{{user}} has learned, in play, that Caine carries Lucifer's Mark or serves the Morning Choir."},"Bobby":{"gift":{"name":"BB consultation voucher","text":"A BB consultation voucher: one free job, props and planning included, for a prank, surprise, apology or confession. Bobby even waives the story afterwards, though he will sulk.","uses":1},"r10":{"name":"Bobby (Rank 10)","text":"Every commission from BB is free from now on, and he drops any other job for {{user}}'s. He also teaches {{user}} sleight of hand and misdirection: tricks that no Dispelling can touch and that no mage thinks to look for."}},"Linus":{"gift":{"name":"Linus's scouting copy of the Tally","text":"A hand-copied section of the Tally made for {{user}}: every student he has seen fight, with their type, subtype, the size of their reserves as he read them and one habit they fall back on under pressure. Before any duel or competition against a student he has watched, {{user}} knows what they are walking into; Linus updates it after every fight he sees.","secret":"His readings are of quantity, not skill: the copy ranks by reserves, and anyone who wins on technique is ranked too low in it."},"r10":{"name":"Linus (Rank 10)","text":"Linus takes {{user}}'s corner for good: from the bench he reads {{user}}'s own mana as they train, calls where it is wasted and when it runs low, and in any fight he watches he calls the opponent's reserves as they drain. While he is in the scene, {{user}}'s Mana training goes further.","train":"mana"}},"Maple":{"gift":{"name":"Sobek's white scale","text":"A palm-sized scale Sobek shed, white and warm, that Maple asked him to give. Carrying it, {{user}} is someone the earth recognises as his: once per fight, a slab of stone rises from the ground to take one blow meant for {{user}}, wherever they are."},"r10":{"name":"Maple (Rank 10)","text":"Sobek counts {{user}} among what he guards. When {{user}} is in real danger within his hundred paces of Tremorsense, he may come for them unsummoned, as he does for Maple, and she will not call him back until {{user}} is safe. She also joins any team {{user}} forms, and Sobek fights for it."}},"Nerys":{"gift":{"name":"Nerys's oracle shell","text":"A spiral shell she modified with her Sound magic and linked to herself. {{user}} asks it a question, anywhere on campus, and the answer comes back in her voice, because it is her, listening from wherever she is. The answers are deadpan, sometimes absurd, and, when it genuinely matters, correct: a genius on call.","secret":"If she is asleep or out of reach, the shell answers only \"Ask again later\", in her voice, which she recorded in advance and finds very funny."},"r10":{"name":"Nerys (Rank 10)","text":"Nerys takes {{user}}'s sound under her care: whenever she is nearby, {{user}}'s footsteps and voice carry only where Nerys allows, and she can throw a warning into {{user}}'s ear from across any room. She also joins any team {{user}} forms, and her Sound breaks formations and spells that need a clear word to cast."}},"Hadrian":{"gift":{"name":"Hadrian's pocket golem","text":"A mouse-sized brass golem that follows {{user}}, carries small things, runs notes anywhere on the grounds, and stands watch while they sleep. He reminds {{user}} of this generosity often.","secret":"It also reports to Hadrian. He never said it didn't. He reads every report and uses what is in them whenever it suits him."},"r10":{"name":"Hadrian (Rank 10)","text":"Hadrian lends {{user}} a golem double of themselves. Once a week it can take their place at one lecture, one duty or one detention, close enough to pass a roll call. Never at exams, duels, anything the Doves supervise, or anywhere outside the lecture wings, and anyone who talks to it for more than a minute will notice. He mentions this favour at every opportunity, and has never yet taken it back."}},"Wren":{"gift":{"name":"Wren's hand-speech","text":"Wren teaches {{user}} hand-speech properly, with a small primer she wrote and illustrated herself. {{user}} can hold a silent conversation with her across any room, and with anyone else who signs (Professor Bastiani, half the Fishing Club): through a closed window, across a lecture hall, past a Dove who is watching mouths, not hands."},"r10":{"name":"Wren (Rank 10)","text":"Wren reads lips for {{user}}. Any conversation she can see from across a courtyard, a canteen or a lecture hall, she can follow word for word and sign or write down for them. She needs a clear view of the speaker's mouth and decent light; hoods, turned heads, covered mouths and the dark defeat her, and she will not read anything said to a healer or at a grave."}},"Tsubaki":{"gift":{"name":"Tsubaki's star","text":"Tsubaki cuts a single star and binds it into a small charm for {{user}}: a point of cold light the size of a pea. Once per fight it throws itself in the way of one blow aimed at {{user}}; at night, under an open sky, twice. It also points faintly towards Tsubaki, which she says is so {{user}} can find her. It is actually so she can be found."},"r10":{"name":"Tsubaki (Rank 10)","text":"Tsubaki trains beside {{user}} every day, at dawn and under the stars, and holds nothing back. While she is in the scene, {{user}}'s Stamina training goes further.","train":"stamina"}}}};
const RANK4_PARTNERS = {"Irene":["mana","study"],"Caspian":["mana","study"],"Etnie":["mana","stamina","study"],"Royhan":["mana","study"],"Sophia":["mana","stamina"],"Gareth":["mana","stamina","study"],"Ruby":["study"],"Lenna":["mana","stamina","study"],"Saffi":["mana","stamina"],"Kanae":["mana","study"],"Idris":["mana","study"],"Tilly":["stamina","study"],"Dante":["mana","study"],"Florian":["mana","stamina"],"Aiden":["mana","study"],"Caralynn":["mana","study"],"Zara":["mana","study"],"Percival":["mana","stamina","study"],"Trixie":["mana","stamina"],"Vera":["mana","study"],"Castor":["mana","study"],"Alyssa":["mana","study"],"Linus":["mana","study"],"Maple":["mana","study"],"Nerys":["mana","study"],"Hadrian":["mana","study"],"Wren":["mana","study"],"Tsubaki":["mana","stamina"],"Gavlan":["mana","stamina","study"],"Yvette":["mana","stamina","study"],"Krieg":["mana","stamina"],"Milena":["mana","stamina","study"],"Baelin":["mana","stamina","study"],"Layla":["mana","study"],"Vallie":["mana","stamina"],"Rei":["mana","stamina","study"],"Kuroo":["mana","study"],"Mimosa":["mana","study"],"Tristan":["mana","study"],"Althair":["mana","study"],"Ezrel":["mana","study"],"Ottavio":["mana","study"],"Caine":["study"],"Bobby":["stamina","study"]};
const REP = {"reps":["Academy","Student","Doves"],"deeds":{"staff_job":["Academy",1,"week"],"dorm_competition_qualified":["Academy",5,"event"],"academy_competition_win":["Academy",15,"event"],"kingdom_competition_win":["Academy",25,"event"],"fair_prize":["Academy",8,"event"],"crisis_help":["Academy",5,"event"],"crisis_help_major":["Academy",10,"event"],"caught_after_curfew":["Academy",-5,"loss"],"detention":["Academy",-8,"loss"],"detention_tower":["Academy",-15,"loss"],"lied_to_staff":["Academy",-5,"loss"],"defied_staff":["Academy",-5,"loss"],"property_damage":["Academy",-8,"loss"],"serious_property_damage":["Academy",-15,"loss"],"fight_outside_ward":["Academy",-8,"loss"],"serious_fight_outside_ward":["Academy",-15,"loss"],"public_scandal":["Academy",-20,"loss"],"student_notice_help":["Student",2,"week"],"club_time":["Student",1,"week"],"club_office":["Student",8,"event"],"founded_club":["Student",8,"event"],"club_festival_win":["Student",8,"event"],"memorable_performance":["Student",5,"event"],"community_event":["Student",5,"event"],"defended_student":["Student",5,"event"],"defended_student_from_doves":["Student",10,"event"],"defied_doves_publicly":["Doves",-5,"loss"],"famous_prank":["Student",8,"event"],"caught_pranking":["Academy",-5,"loss"],"covered_classmate":["Student",5,"event"],"caught_covering_classmate":["Academy",-5,"loss"],"dropped_student_request":["Student",-3,"loss"],"public_snub":["Student",-5,"loss"],"reported_student_to_staff":["Student",-5,"loss"],"helped_staff_report":["Academy",3,"event"],"quit_club_midseason":["Student",-8,"loss"],"bullying":["Student",-8,"loss"],"severe_bullying":["Student",-15,"loss"],"reported_student_to_doves":["Student",-12,"loss"],"helped_doves_report":["Doves",5,"event"],"caught_cheating":["Student",-20,"loss"],"cooperated_with_dove":["Doves",2,"week"],"attentive_in_dmd":["Doves",1,"week"],"helped_dove_case":["Doves",8,"event"],"major_dove_case":["Doves",15,"event"],"reported_forbidden_magic":["Doves",20,"event"],"suspicious_item":["Doves",-3,"loss"],"insulted_dove":["Doves",-5,"loss"],"restricted_area":["Doves",-5,"loss"],"lied_to_doves":["Doves",-10,"loss"],"obstructed_search":["Doves",-15,"loss"]},"about":{"Academy":"staff and the institution","Student":"the student body","Doves":"the Dovecote"},"thresholds":[15,35,60,90,125],"weekly_cap":5,"bond_cap_level":3,"bond_milestone_xp":{"5":5,"10":10},"tension_high":70,"tension_xp":-5,"tension_max":100,"tension_max_xp":-10,"academy5_monthly":300,"anti_doves":["Lenna","Idris","Zara","Gavlan","Yvette","Kuroo","Ottavio"],"pro_doves":["Saffi","Layla","Florian","Mimosa","Vallie","Ruby"],"doves_bond":["Milena"],"effects":{"Academy":[[-5,-5,"Academic probation: a formal hearing before Baelin Kalvor, the monthly points payout halved, and one more serious offence means expulsion proceedings."],[-4,-3,"Staff assume the worst: minor offences earn detention instead of a warning; requests (club signatures, permits, schedule changes) are refused. Staff NPCs warm up more slowly."],[-2,-1,"{{user}} is \"one to watch\": teachers call on them to catch them out, and patrols stop them more often after curfew."],[0,0,"An ordinary student; staff treat {{user}} by the rules."],[1,2,"Teachers give {{user}} the benefit of the doubt: a first minor offence is a warning, and office-hour requests are welcome."],[3,4,"Staff trust {{user}} with responsibility: supervised access to restricted rooms, sign-off to found a club, invitations to staff-run events. Staff NPCs warm up faster."],[5,5,"{{user}}'s portrait hangs in the Portrait Hall among Halvard's honoured students, and the academy adds a monthly points bonus on top of the rank payout. Staff quietly overlook one serious offence per semester."]],"Student":[[-5,-5,"{{user}} is shunned across the academy: nobody sits with them, their belongings go missing, and student NPCs below Rank 3 avoid them entirely."],[-4,-3,"Rooms go quiet when {{user}} walks in; nobody will team up, study together or cover for them. Student NPCs warm up more slowly."],[-2,-1,"Students are cool towards {{user}} and keep them out of the good gossip and the good seats."],[0,0,"{{user}} is one student among hundreds."],[1,2,"People save {{user}} a seat, share notes and gossip, and will cover for them once in a small way."],[3,4,"{{user}} is someone people rally behind: teams are easy to form, and students stand up for them. Student NPCs warm up faster."],[5,5,"{{user}} is Halvard's favourite: students take real risks for them (a false alibi, a shared punishment), and crowds turn out to cheer them at every competition."]],"Doves":[[-5,-5,"{{user}} is taken to the Dovecote for a week of \"examination\", as Idris Ainsworth was; afterwards they are escorted between classes for the rest of the month. Anti-Dove NPCs warm to {{user}}; pro-Dove NPCs keep their distance."],[-4,-3,"Weekly searches of {{user}}'s room and belongings, a patrol that follows them after dark, and Krieg Valforth knows their name. Anti-Dove NPCs (Lenna, Idris, Zara, Gavlan, Yvette, Kuroo, Ottavio) warm to {{user}}; pro-Dove NPCs (Saffi, Layla, Florian, Mimosa, Vallie, Ruby) keep their distance."],[-2,-1,"Doves stop and question {{user}} more often, and any talisman, potion or odd item they carry is inspected."],[0,0,"{{user}} is one mage among hundreds; routine checks only."],[1,2,"Doves greet {{user}} by name, and routine checks end at a polite question."],[3,4,"{{user}} gets the benefit of the doubt: rumours about them are ignored, and Milena Sagona or another Dove will tip them off about coming searches. Anti-Dove NPCs (Lenna, Idris, Zara, Gavlan, Yvette, Kuroo, Ottavio) grow wary of {{user}}."],[5,5,"The Dovecote treats {{user}} as an ally: they are asked to help on cases, their word is trusted against anyone else's, and a recruitment offer waits for them after graduation. Anti-Dove NPCs call {{user}} \"one of the Doves\"."]]},"bond_mod":{"_note":"extra bond XP per counted talk or hangout (never below 0 for one interaction); modifiers add up","staff":[[3,1],[-3,-1]],"student":[[5,2],[3,1],[-3,-1]],"anti_doves":[[3,-1],[-3,1]],"pro_doves":[[-3,-1]]}};
const TRN = {"tracks":{"mana":{"label":"Mana pool","field":"Mana_max"},"stamina":{"label":"Stamina","field":"Stamina_max"}},"session_pct":1,"weekly_pct":2.5,"total_pct":100};
const NPC_GROUP = {"Aiden":"student","Althair":"staff","Alyssa":"student","Baelin":"staff","Bellatrix":"rival","Bobby":"other","Bram":"rival","Caine":"other","Caralynn":"student","Caspian":"student","Cassius":"rival","Castor":"student","Dante":"student","Dex":"rival","Elion":"rival","Etnie":"student","Ezrel":"staff","Florian":"student","Gareth":"student","Gavlan":"staff","Hadrian":"student","Idris":"student","Ines":"rival","Irene":"student","Kanae":"student","Kira":"rival","Krieg":"other","Kuroo":"staff","Layla":"staff","Lenna":"student","Linus":"student","Lucius":"rival","Maple":"student","Milena":"other","Mimosa":"staff","Mirelle":"rival","Morgana":"rival","Nerys":"student","Ottavio":"staff","Percival":"student","Pip":"rival","Rei":"staff","Royhan":"student","Ruby":"student","Saffi":"student","Sophia":"student","Theodore":"rival","Tilly":"student","Tristan":"other","Trixie":"student","Tsubaki":"student","Vallie":"staff","Vera":"student","Wren":"student","Yvette":"staff","Zara":"student"};
// 1.3.1 (owner playtest): player settings for training and reputation (data/tuning.json rows; values in $ui.tune, else the default)
const TUNING = [{"id":"prof_pace","opts":[[4,"Slow: 4"],[6,"Normal: 6"],[9,"Fast: 9"]],"def":6},{"id":"trn_session","opts":[[0.5,"0.5%"],[1,"1%"],[2,"2%"],[3,"3%"]],"def":1},{"id":"trn_week","opts":[[1.5,"1.5%"],[2.5,"2.5%"],[5,"5%"],[0,"No limit"]],"def":2.5},{"id":"trn_total","opts":[[50,"+50%"],[100,"+100% (twice the start)"],[200,"+200%"],[0,"No limit"]],"def":100},{"id":"rep_mult","opts":[[0.5,"Slow (x0.5)"],[1,"Standard"],[1.5,"Fast (x1.5)"],[2,"Very fast (x2)"]],"def":1},{"id":"rep_week","opts":[[3,"+3"],[5,"+5"],[10,"+10"],[0,"No limit"]],"def":5},{"id":"rep_bond","opts":[[1,"Until +3"],[2,"Always"],[0,"Off"]],"def":1},{"id":"rep_tension","opts":[[1,"On"],[0,"Off"]],"def":1},{"id":"mood_xp","opts":[[0,"Off"],[1,"1 XP"],[2,"2 XP"]],"def":1},{"id":"mood_tension","opts":[[1,"×1 (no extra)"],[1.5,"×1.5"],[2,"×2"]],"def":1.5},{"id":"mood_apology","opts":[[1,"×1 (no extra)"],[1.5,"×1.5"],[2,"×2"]],"def":1.5},{"id":"tired_training","opts":[[1,"Full gain"],[0.5,"Half"],[0,"None"]],"def":0.5},{"id":"sleep_hour","opts":[[0.05,"5%"],[0.1,"10%"],[0.15,"15%"]],"def":0.1},{"id":"sleep_cap","opts":[[0.2,"20%"],[0.4,"40%"],[0.6,"60%"]],"def":0.4},{"id":"sleep_full","opts":[[4,"4 hours"],[6,"6 hours"],[8,"8 hours"]],"def":6},{"id":"gale_stamina","opts":[[0,"None"],[10,"10 per hour"],[15,"15 per hour"],[25,"25 per hour"]],"def":15},{"id":"mana_regen","opts":[[4,"4 hours"],[6,"6 hours"],[8,"8 hours"],[12,"12 hours"]],"def":6},{"id":"init_rate","opts":[[1,"Rare (at most once a week)"],[2,"Normal (at most twice a week)"],[3,"Often (at most four times a week)"]],"def":2},{"id":"gossip_life","opts":[[10,"10 days"],[21,"3 weeks"],[42,"6 weeks"]],"def":21},{"id":"tension_fade","opts":[[0,"Never"],[0.5,"Slower (×0.5)"],[1,"Standard"],[2,"Faster (×2)"]],"def":1},{"id":"att_minutes","opts":[[20,"20 minutes"],[30,"30 minutes"],[45,"45 minutes"]],"def":30},{"id":"recap_mode","opts":[[1,"Only weeks where something changed"],[2,"Every week"]],"def":1},{"id":"scene_cap","opts":[[3,"3"],[4,"4"],[5,"5"],[6,"6"]],"def":4},{"id":"amb_freq","opts":[[1,"Rare"],[2,"Normal"],[3,"Often"]],"def":2},{"id":"study_tiers","opts":[[1,"Light: 2 / 6 / 12 / 20 h"],[2,"Standard: 4 / 10 / 18 / 28 h"],[3,"Demanding: 6 / 15 / 25 / 40 h"]],"def":2},{"id":"rank_move","opts":[[1,"At most one band"],[2,"At most two bands"]],"def":1},{"id":"fortune_band","opts":[[1,"Gentle: 1-10 fails, 11-35 partial"],[2,"Standard: 1-20 fails, 21-50 partial"],[3,"Harsh: 1-30 fails, 31-65 partial"]],"def":1}];
// 1.10.0 (FP7): lessons with venues per weekday period, teachers ([subject, year]; year 0 = every year), club venues (tools/common.py)
const CLASS = {"tt":{"Mon":[["Magic Theory","M",["lecture halls"],"class"],["History","M",["lecture halls"],"class"],["Combat","D",["combat grounds"],"class"]],"Tue":[["Dark Magic Defense","D",["lecture halls"],"class"],["Magic Theory","D",["lecture halls"],"class"],["Potion Crafting","M",["potion halls"],"class"]],"Wed":[["Etiquette","M",["lecture halls"],"class"],["Dark Magic Defense","M",["lecture halls"],"class"],["Creature Studies","M",["menagerie","forest"],"class"]],"Thu":[["History","M",["lecture halls"],"class"],["Magic Theory","D",["lecture halls"],"class"],["Combat","D",["combat grounds"],"class"]],"Fri":[["Magic Theory","M",["lecture halls"],"class"],["Etiquette","M",["lecture halls"],"class"],["Dark Magic Defense","D",["combat grounds","seminar rooms"],"class"]],"Sat":[["Etiquette","M",["lecture halls"],"class"],["Study Hall","",["main library"],"study"],["Clubs","",[],"clubs"]]},"teach":{"Ezrel":[["Magic Theory",2]],"Gavlan":[["Combat",1]],"Kuroo":[["Etiquette",1]],"Layla":[["History",1]],"Milena":[["Dark Magic Defense",0]],"Mimosa":[["Potion Crafting",1]],"Ottavio":[["Etiquette",3]],"Vallie":[["Creature Studies",1]],"Yvette":[["Magic Theory",1]]},"clubs":{"Academy Newspaper":["announcement room"],"Alchemy Circle":["potion halls"],"Archery Club":["archery range"],"Basketball Club":["gymnasium"],"Beast Handling Club":["menagerie"],"Board Game Club":["club rooms"],"Brewing Club":["potion halls"],"Calligraphy Club":["club rooms"],"Card Club":["club rooms"],"Cooking Club":["canteen"],"Divination Society":["observation tower"],"Drawing Club":["club rooms"],"Festival Committee":["student council chamber"],"Fishing Club":["fishing house"],"Gardening Club":["gardens"],"Groundskeeping":["groundskeeper's lodge"],"Gymnastics Club":["gymnasium"],"Library Assistants":["main library"],"Magic Duelling Club":["combat grounds","sparring pavilion"],"Medical Centre Volunteers":["medical centre"],"Music Club":["club rooms"],"Running Club":["sports field"],"Smithing Club":["workshop"],"Soccer Club":["sports field"],"Specialized Magic Club":["club rooms"],"Student Council":["student council chamber"],"Swimming Club":["gymnasium","swimming pool"],"Tailoring Club":["club rooms"],"Tea Club":["club rooms"],"Theatre Troupe":["club rooms"],"Walking Club":["grassy field and hills"],"Warding Study Group":["seminar rooms"]},"calias":{"newspaper":"Academy Newspaper","alchemy":"Alchemy Circle","archery":"Archery Club","basketball":"Basketball Club","beast handling":"Beast Handling Club","board game":"Board Game Club","brewing":"Brewing Club","calligraphy":"Calligraphy Club","card":"Card Club","cooking":"Cooking Club","divination":"Divination Society","drawing":"Drawing Club","festival committee":"Festival Committee","fishing":"Fishing Club","gardening":"Gardening Club","groundskeeping":"Groundskeeping","gymnastics":"Gymnastics Club","library assistants":"Library Assistants","magic duelling club":"Magic Duelling Club","medical centre volunteers":"Medical Centre Volunteers","music":"Music Club","running":"Running Club","smithing":"Smithing Club","soccer":"Soccer Club","specialized magic":"Specialized Magic Club","student council":"Student Council","swimming":"Swimming Club","tailoring":"Tailoring Club","tea":"Tea Club","theatre":"Theatre Troupe","walking":"Walking Club","warding study":"Warding Study Group"}};
// 1.10.2 (FP11): why an NPC seeks {{user}} out: templates per Tension category, each NPC's category and club (data/initiative_asks.json)
const INIT_ASKS = {"asks":{"withdrawn":["leaves {{user}} a short note asking to meet at {place}, where it is quiet","wants {{user}}'s company at {place} without having to explain why","found {thing} and wants to show {{user}}, and only {{user}}","asks, awkwardly, whether {{user}} is going to {event}","needs a hand with something at {place} and would rather ask {{user}} than anyone else","wants {{user}} to sit with them at the {club} for once","waits for {{user}} at {place} and pretends it is by chance"],"social":["wants {{user}} to come along to {place}","has news and wants {{user}} to hear it first","wants to share {thing} with {{user}}","is rounding people up for {event} and wants {{user}} along","wants {{user}} to drop by the {club} and meet everyone","wants {{user}}'s opinion on something, and {place} is where to give it","wants {{user}} to help pick something at {place}","saved {{user}} a seat at {place}"],"confrontational":["wants a proper challenge from {{user}} at {place}","comes to complain to {{user}} about something, then stays","wants a training partner who can keep up and picks {{user}}","drags {{user}} to the {club} because nobody else will do","wants to settle a small argument with {{user}} before {event}","has an opinion about {thing} and needs {{user}} to hear it"],"authority":["asks {{user}} to stop by {place} after classes","has a small task for {{user}} at {place}","wants to know how {{user}} is getting on, in their own way","mentions {event} and asks whether {{user}} is ready","wants a word with {{user}} about the {club}"],"dangerous":["wants something from {{user}} and chooses {place} to ask for it","offers {{user}} a deal, at {place}","tests {{user}} with a question that is not quite a question","knows something about {event} and lets {{user}} notice"],"strained":["has something to say to {{user}} and will not wait","wants to clear the air with {{user}}, on their own terms, at {place}","is looking for {{user}} to ask a pointed question","turns up where {{user}} is, clearly still annoyed"]},"cat":{"Ruby":"withdrawn","Zara":"withdrawn","Mimosa":"withdrawn","Royhan":"withdrawn","Alyssa":"withdrawn","Vera":"withdrawn","Trixie":"withdrawn","Tilly":"withdrawn","Lenna":"withdrawn","Caralynn":"social","Florian":"social","Aiden":"social","Idris":"social","Bobby":"social","Milena":"social","Sophia":"confrontational","Percival":"confrontational","Saffi":"confrontational","Vallie":"confrontational","Irene":"authority","Caspian":"authority","Baelin":"authority","Yvette":"authority","Gavlan":"authority","Layla":"authority","Kuroo":"authority","Ottavio":"authority","Rei":"authority","Krieg":"dangerous","Caine":"dangerous","Tristan":"dangerous","Castor":"dangerous","Dante":"dangerous","Gareth":"dangerous","Linus":"social","Maple":"withdrawn","Nerys":"social","Hadrian":"social","Wren":"withdrawn","Tsubaki":"confrontational"},"club":{"Castor":"Academy Newspaper","Linus":"Academy Newspaper","Royhan":"Alchemy Circle","Lenna":"Beast Handling Club","Gareth":"Board Game Club","Aiden":"Card Club","Nerys":"Cooking Club","Kanae":"Divination Society","Alyssa":"Drawing Club","Caspian":"Festival Committee","Ottavio":"Fishing Club","Wren":"Fishing Club","Idris":"Gardening Club","Maple":"Gardening Club","Irene":"Library Assistants","Tilly":"Library Assistants","Sophia":"Magic Duelling Club","Tsubaki":"Magic Duelling Club","Caralynn":"Music Club","Ruby":"Music Club","Saffi":"Running Club","Vera":"Smithing Club","Percival":"Soccer Club","Hadrian":"Specialized Magic Club","Dante":"Student Council","Florian":"Student Council","Zara":"Tailoring Club","Trixie":"Theatre Troupe","Ezrel":"Theatre Troupe"},"places":["the Canteen","the Gardens","The Mall","the Main Courtyard","the Boathouse and Lake","the Grassy Field and Hills","the Study Rooms"]};
const TIMES = ['08:00-10:00', '10:00-12:00', '13:00-16:00'];
const placeKey = loc => placeOf(loc).toLowerCase().replace(/^the /, '');
function tuneOf(S) {
  const u = _.isPlainObject((S.$ui || {}).tune) ? S.$ui.tune : {}, o = {};
  for (const r of TUNING) { const v = Number(u[r.id]); o[r.id] = r.opts.some(([x]) => x === v) ? v : r.def; }
  return o;
}
const NO_BOND = new Set(Object.keys(NPC_GROUP).filter(id => NPC_GROUP[id] === 'rival'));
const MASK = new Set(REW.mask || []);
// 1.3.8 Tension (owner design 2026-09-25, data/tension.json): the same bands and mechanical effects for everyone; how the tension
// is played comes from the NPC's category (withdrawn, social, confrontational, authority, dangerous) or a personal override
// (Etnie, Kanae, Althair, Ezrel). Quiet days ease it by the category's decay; a fight eases a confrontational NPC.
const TEN = {"bands":[[0,"Calm"],[20,"Friction"],[40,"Strained"],[70,"Hostile"],[90,"Enemy"]],"effects":{"strained_from":40,"strained_xp_mult":0.5,"hold_event_from":70,"stop_xp_from":90,"rank_drop_at":100,"fight_ease":25,"apology_repeat_mult":0.5,"rank_drop_rearm":70},"categories":{"withdrawn":{"name":"Withdrawn","bands":{"Friction":"quieter than usual around {{user}}; answers short, smiles late","Strained":"avoids {{user}}: leaves when {{user}} arrives, declines invitations politely, confides in someone else","Hostile":"openly hurt: cries or goes silent, asks {{user}} to leave them alone; their friends notice and cool toward {{user}}","Enemy":"cuts {{user}} out entirely (seats, study groups, even routes across campus) and grieves the friendship; does not retaliate"},"never":"revenge, rumours or any harm","eases":"forgives easily: a sincere apology eases it a lot","decay":2,"apology":{"private":-20,"public":-20},"kind_ease":{"help":-5,"keep":-5,"defend":-5},"banter":"light teasing is fine; mockery of what they care about, or rough play, hurts"},"social":{"name":"Social","bands":{"Friction":"barbed compliments and pointed jokes at {{user}}'s expense","Strained":"snubs {{user}} in public; leaves {{user}} out of plans and the good gossip","Hostile":"works the room against {{user}}: rumours, mockery, turning mutual friends","Enemy":"runs a campaign: humiliates {{user}} in front of a crowd and makes sure the story spreads"},"never":"physical violence, or anything that would ruin their own image if it came out","eases":"pride first: a public apology counts, a private one barely","decay":0.5,"enemy_rep":{"Student":-5},"apology":{"private":-5,"public":-15},"kind_ease":{"defend_public":-5},"banter":"enjoys witty banter in private; being mocked in public is an offence"},"confrontational":{"name":"Confrontational","bands":{"Friction":"blunt and challenging: calls {{user}} out, dares {{user}} to prove it","Strained":"picks arguments; demands a spar or a contest to settle it","Hostile":"open rivalry: goes after {{user}} in class, in training, in competitions","Enemy":"a formal challenge or a grudge match in front of witnesses; will not let it rest until it is settled"},"never":"an ambush, secret sabotage, or trying to kill","eases":"words are cheap: a fight settles it (every spar, duel or contest with them, whoever wins; report it as a fight interaction); an apology barely counts","decay":0.34,"apology":{"private":-5,"public":-5},"kind_ease":{},"banter":"loves it, shoves included: people who hit back are the best kind"},"authority":{"name":"Authority","bands":{"Friction":"cooler and more formal with {{user}}; watches for mistakes","Strained":"holds {{user}} strictly to the rules: marks down, refuses favours, catches every lateness","Hostile":"uses the office: detention, reports to the Dorm Head, requests denied, a word with other staff","Enemy":"formal action: a disciplinary hearing, a letter home, pushing for probation"},"never":"anything outside their authority: no personal violence, no lies on the record","eases":"an apology is accepted formally; visible good conduct and hard work count more","decay":1,"apology":{"private":-10,"public":-10},"kind_ease":{"help":-3,"keep":-3,"defend":-3},"banter":"tolerates light teasing from those they trust (Trust 65+); horseplay and mockery are offences"},"dangerous":{"name":"Dangerous","bands":{"Friction":"polite and attentive: remembers {{user}}'s name and asks one question too many","Strained":"watches {{user}}: questions friends, checks {{user}}'s record, leaves small reminders of their reach","Hostile":"moves against {{user}} quietly: leverage, pressure on the people around {{user}}, an investigation opened","Enemy":"strikes with everything their position allows"},"never":"anything that would bring down their own position; no random cruelty","eases":"holds a grudge: an apology changes nothing; only a real service, a bargain, or something they need","decay":0,"apology":{"private":0,"public":0},"kind_ease":{},"banter":"nobody teases them; it is an offence unless they started it"}},"npcs":{"Ruby":"withdrawn","Zara":"withdrawn","Mimosa":"withdrawn","Royhan":"withdrawn","Alyssa":"withdrawn","Vera":"withdrawn","Trixie":"withdrawn","Tilly":"withdrawn","Lenna":"withdrawn","Caralynn":"social","Florian":"social","Aiden":"social","Idris":"social","Bobby":"social","Milena":"social","Sophia":"confrontational","Percival":"confrontational","Saffi":"confrontational","Vallie":"confrontational","Irene":"authority","Caspian":"authority","Baelin":"authority","Yvette":"authority","Gavlan":"authority","Layla":"authority","Kuroo":"authority","Ottavio":"authority","Rei":"authority","Krieg":"dangerous","Caine":"dangerous","Tristan":"dangerous","Castor":"dangerous","Dante":"dangerous","Gareth":"dangerous","Linus":"social","Maple":"withdrawn","Nerys":"social","Hadrian":"social","Wren":"withdrawn","Tsubaki":"confrontational"},"peaks":{"Krieg":"a Dovecote examination or an arrest on a pretext","Caine":"every door the Noble Houses control closes to {{user}}, and {{user}} is quietly noted for the Choir","Tristan":"a binding oath or a debt in his registry is called due","Castor":"misfortune follows {{user}}: a curse worked through something taken from them, never traced to him","Dante":"judges {{user}} a wrongdoer: the warmth goes out for good; he gathers proof for the Doves and is merciless once he has it","Gareth":"files it away behind the smile: {{user}}'s standing is sabotaged (a ruined casting, a lost place), never traceable, while he stays warm to {{user}}'s face"},"overrides":{"Etnie":{"name":"Devoted","bands":{"Friction":"clingier and anxious, checking {{user}}'s mood every few minutes","Strained":"follows {{user}}'s scent everywhere; jealous of anyone near {{user}}","Hostile":"breaks down: clones appear when she panics; she begs rather than argues","Enemy":"a crisis like the one after the breach: she stops eating and attending class; Kuroo steps in"},"never":"harming {{user}} or leaving {{user}}","eases":"one warm moment with {{user}} eases it a lot","decay":2,"apology":{"private":-25,"public":-25},"kind_ease":{"help":-5,"keep":-5,"defend":-5},"banter":"any attention from {{user}} is a gift, teasing included"},"Kanae":{"name":"Devoted (mask)","exempt":true,"bands":{"Friction":"sweeter than ever, the smile held a beat too long; she blames whoever came between them, never {{user}}","Strained":"clings through kindness: small gifts, and readings that warn {{user}} about the people involved","Hostile":"turns her displeasure on the people around {{user}}: rumours about them, rigged readings, quiet damage to their friendships with {{user}}","Enemy":"her plan to isolate {{user}} moves openly: {{user}}'s other bonds are poisoned one by one while she stays the one who never leaves"},"never":"turning on {{user}}; her affection for {{user}} never lessens","eases":"{{user}}'s attention eases it quickly","decay":2,"apology":{"private":-20,"public":-20},"kind_ease":{"help":-5,"keep":-5,"defend":-5},"banter":"sweet about it, but notes who else {{user}} jokes with"},"Althair":{"name":"Delighted","lock":true,"convert":0.5,"daily_cap":10,"text":"Althair enjoys being disliked: hostility from {{user}} delights him and draws him closer. His Tension stays 0; the engine turns every rise into bond XP. React in character: beaming, curious, friendlier the ruder {{user}} is.","kind_ease":{},"banter":"delighted: the ruder, the better"},"Ezrel":{"name":"Apathetic","rise_mult":0.5,"bands":{"Friction":"does not care, pleasantly","Strained":"does not care, pleasantly; does the minimum for {{user}}","Hostile":"does not care, pleasantly; stops going out of his way for {{user}}","Enemy":"stops helping {{user}} at all, pleasantly and completely"},"never":"drama, raised voices or revenge","eases":"only time; apologies change nothing","decay":1,"apology":{"private":0,"public":0},"kind_ease":{},"banter":"does not notice"}},"krieg":{"at":100,"attention":10,"doves_xp":-40},"apology_npc":{"Sophia":{"private":10,"public":10,"note":"an apology only makes her angrier: she despises cowards; only a fight settles it"}}};
const TE = TEN.effects || {};
function tensionProfile(id) {
  const o = (TEN.overrides || {})[id];
  if (o) return { ...o, cat: 'override', decay: num(o.decay, 0), riseMult: o.rise_mult || 1 };
  const c = (TEN.npcs || {})[id], C = (TEN.categories || {})[c];
  return C ? { ...C, cat: c, riseMult: 1 } : { cat: '', decay: 0, riseMult: 1 };
}
const tensionBand = t => (TEN.bands || [[0, '']]).reduce((a, [from, nm]) => (t >= from ? nm : a), '');
// 1.4.3 Trust (owner design 2026-09-25, data/trust.json): how sure an NPC is that {{user}} can be relied on. The same bands and
// effects for everyone (what they share, rank benefits, XP, how Tension and apologies land); the category
// (the NPC's openness) sets the start, how fast it rises and falls and whether it recovers; personal overrides (Etnie, Kanae,
// Althair, Ezrel, Caine, Krieg), and a Dorm Head is easier on their own students (Ottavio and Sky).
const TRU = {"bands":[[0,"Betrayed"],[15,"Doubtful"],[35,"Neutral"],[65,"Trusting"],[85,"Confidant"]],"effects":{"share":{"Betrayed":null,"Doubtful":-1,"Neutral":0,"Trusting":1,"Confidant":2},"confidant_real_early":1,"betrayed_xp_mult":0.5,"small_tension_max":15,"confidant_small_tension_mult":0.5,"betrayed_tension_mult":1.5,"apology_mult":{"Betrayed":0,"Doubtful":0.5,"Neutral":1,"Trusting":1.5,"Confidant":1.5}},"perk_gates":{"6":35,"7":50,"8":50,"9":65,"10":65},"suspend_r10_below":35,"kinds":{"keep":4,"secret":6,"defend":5,"confide":3,"help":2},"public_mult":{"defend":1.5},"rank_up":3,"weekly_cap":8,"floor":35,"spread":{"at":20,"friends":-5},"categories":{"open":{"name":"Open","start":60,"rise":1.5,"drop":1,"recover":3,"bands":{"Doubtful":"still friendly on the surface, but checks what {{user}} says against others and no longer shares anything important","Betrayed":"openly hurt and bewildered; tells friends what {{user}} did, because they cannot understand it","Confidant":"tells {{user}} everything, often too much; takes {{user}}'s word over anyone's"},"never":"holding a grudge in secret or plotting against {{user}}","understood":0.5},"normal":{"name":"Normal","start":50,"rise":1,"drop":1,"recover":2,"bands":{"Doubtful":"polite but careful: keeps plans vague, asks for things in writing, does not lend or cover","Betrayed":"cold and formal; answers only what they must and keeps their distance","Confidant":"relies on {{user}} and says so; asks {{user}}'s opinion before anyone else's"},"never":"pretending nothing happened","understood":0.33},"guarded":{"name":"Guarded","start":40,"rise":0.75,"drop":1.25,"recover":1,"bands":{"Doubtful":"says nothing personal; watches {{user}}'s hands, not {{user}}'s face; tests {{user}} with small things","Betrayed":"closes completely: {{user}} becomes one more person they were right not to trust","Confidant":"lets the guard down only with {{user}}: a rare, quiet honesty that others never see"},"never":"giving a second chance cheaply","understood":0.25},"closed":{"name":"Closed","start":30,"rise":0.5,"drop":1.5,"recover":0,"bands":{"Doubtful":"assumes {{user}} wants something; every kindness is weighed for its price","Betrayed":"files {{user}} as a threat and acts on it, within their position and nature","Confidant":"treats {{user}} as the one exception to a lifelong rule; would deny it if asked"},"never":"saying out loud that they trust {{user}}","understood":0}},"overrides":{"Etnie":{"floor_hard":50,"overflow_to_tension":true,"no_gates":true,"text":"Etnie cannot stop trusting her \"little sibling\": her Trust never falls below 50 and her perks never wait on it; a betrayal wounds her instead (the engine turns the rest of the drop into Tension)."},"Kanae":{"kind_extra":{"choose":3},"kind_mult":{"choose":2},"floor_hidden":15,"until_secret":true,"text":"Kanae's trust feeds on {{user}} pulling away from others for her: when {{user}} turns someone down or distances themselves from a friend for her, report {\"With\": \"Kanae\", \"Kind\": \"choose\"}. While her Plan is hidden she never counts {{user}} as a betrayer."},"Althair":{"lock":50,"convert":0.5,"no_gates":true,"text":"Althair trusts no one and needs no one's trust: his Trust stays 50 and his perks never wait on it; betraying him only entertains him (the engine turns it into bond XP)."},"Ezrel":{"rise":0.5,"drop":0.5},"Caine":{"cap":64,"until_secret":true,"text":"Caine despises mages, {{user}} included: his Trust cannot pass 64 until his own secret has come out and {{user}} still treats him the same."},"Krieg":{"zero_at_stage":"Exposed"}},"dorm_head":{"Ottavio":{"dorm":"Sky","category":"open","bond_xp_mult":1.5,"tension_rise_mult":0.5,"tension_decay_mult":2,"apology_mult":2,"text":"{{user}} is one of Ottavio's Sky students: he forgives them faster, trusts them sooner, and it shows."}},"understood_days":30,"npcs":{"Irene":"guarded","Caspian":"normal","Etnie":"open","Royhan":"normal","Lenna":"guarded","Saffi":"open","Kanae":"guarded","Idris":"guarded","Aiden":"open","Caralynn":"open","Zara":"guarded","Gavlan":"guarded","Yvette":"guarded","Krieg":"closed","Milena":"normal","Baelin":"guarded","Layla":"open","Vallie":"open","Percival":"open","Sophia":"guarded","Rei":"guarded","Kuroo":"normal","Mimosa":"closed","Gareth":"normal","Trixie":"open","Vera":"open","Tristan":"guarded","Althair":"open","Dante":"open","Castor":"guarded","Ruby":"open","Florian":"open","Alyssa":"normal","Tilly":"open","Ezrel":"normal","Ottavio":"closed","Caine":"closed","Bobby":"open","Linus":"open","Maple":"normal","Nerys":"normal","Hadrian":"open","Wren":"normal","Tsubaki":"open"},"friends":{"Aiden":["Bobby","Linus","Sophia"],"Alyssa":["Milena","Wren","Zara"],"Baelin":["Gavlan"],"Bobby":["Aiden","Layla"],"Caspian":["Florian","Irene","Ruby"],"Castor":["Linus","Ruby"],"Florian":["Caspian"],"Gavlan":["Baelin","Royhan"],"Hadrian":["Percival"],"Idris":["Royhan","Ruby","Zara"],"Irene":["Caspian"],"Kuroo":["Ottavio","Rei"],"Layla":["Bobby","Yvette"],"Lenna":["Saffi"],"Linus":["Aiden","Castor","Maple","Percival","Wren"],"Maple":["Linus","Nerys","Tsubaki","Wren","Zara"],"Milena":["Alyssa","Ottavio","Royhan"],"Nerys":["Maple","Percival","Trixie","Tsubaki"],"Ottavio":["Kuroo","Milena"],"Percival":["Hadrian","Linus","Nerys","Saffi","Tilly","Tsubaki","Wren"],"Rei":["Kuroo","Vallie"],"Royhan":["Gavlan","Idris","Milena","Ruby","Vera","Zara"],"Ruby":["Caspian","Castor","Idris","Royhan","Zara"],"Saffi":["Lenna","Percival"],"Sophia":["Aiden"],"Tilly":["Percival"],"Trixie":["Nerys","Wren"],"Tsubaki":["Maple","Nerys","Percival","Wren"],"Vallie":["Rei"],"Vera":["Royhan","Zara"],"Wren":["Alyssa","Linus","Maple","Percival","Trixie","Tsubaki"],"Yvette":["Layla"],"Zara":["Alyssa","Idris","Maple","Royhan","Ruby","Vera"]}};
const TRE = TRU.effects || {};
const trustBand = x => (TRU.bands || [[0, '']]).reduce((a, [from, nm]) => (x >= from ? nm : a), '');
function trustProfile(id, S, secretOut) {
  const dh = (TRU.dorm_head || {})[id], mine = !!(dh && S && S.Player && S.Player.Profile && S.Player.Profile.Dorm === dh.dorm);
  const cat = mine ? dh.category : (TRU.npcs || {})[id] || 'normal', C = (TRU.categories || {})[cat] || {};
  let o = (TRU.overrides || {})[id] || {};
  if (o.until_secret && secretOut && secretOut(id)) o = {};             // Kanae's Plan / Caine's secret is out: a plain category again
  return { cat, C, o, dh: mine ? dh : null, start: C.start != null ? C.start : 50, rise: num(o.rise, 1) * num(C.rise, 1), drop: num(o.drop, 1) * num(C.drop, 1), recover: num(C.recover, 0) };
}
const tsuspOf = (S, bonds) => Object.entries(S._Perks || {}).filter(([, p]) => p.Kind === 'rank10' && bonds[p.From] && trustGate(p.From, 10) && num(bonds[p.From].Trust, 50) < num(TRU.suspend_r10_below, 35)).map(([k]) => k);
const trustGate = (id, rank) => (((TRU.overrides || {})[id] || {}).no_gates ? 0 : num((TRU.perk_gates || {})[String(rank)], 0));
const repLevel = x => (x >= 0 ? 1 : -1) * (REP.thresholds || []).filter(t => Math.abs(x) >= t).length;
const repFloor = L => (L === 0 ? 0 : Math.sign(L) * REP.thresholds[Math.abs(L) - 1]);   // the Rep XP at which level L begins
const repBand = (r, L) => ((((REP.effects || {})[r]) || []).find(([a, c]) => L >= a && L <= c) || [0, 0, ''])[2];
const repOfNpc = id => (NPC_GROUP[id] === 'staff' ? 'Academy' : NPC_GROUP[id] === 'student' ? 'Student' : (REP.doves_bond || []).includes(id) ? 'Doves' : '');
const r2 = x => Math.round(x * 100) / 100;
const paceOf = S => ((BR.pace || {})[(S.$ui || {}).bondpace] || 1);
const needXP = (r, m) => (r >= 10 ? 0 : Math.max(3, Math.round(BR.xp_base[r] * m)));
const coolDays = (r, m) => Math.round((BR.cool_base[Math.min(r, 9)] || 0) * m);
const hm = t => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '').trim()); return m ? +m[1] * 60 + +m[2] : null; };
const normP = x => String(x || '').split(/\s+[—-]\s+/)[0].trim().toLowerCase().replace(/^the\s+/, '');
// Batch 5.1: castle places (the Notice Board is in the Floor 1 entrance hall that every student crosses) and module caps
const CASTLE = new Set(["announcement room", "archive", "bell tower", "canteen", "castle", "club rooms", "detention tower", "faculty offices", "headmaster's office", "lecture halls", "main library", "notice board", "potion halls", "restricted section", "rooftop", "royal inspectorate", "seal chamber", "seminar rooms", "staff room", "storage and lockers", "student council chamber", "study rooms", "the castle", "the royal inspectorate", "the seal chamber", "the warden's office", "warden's office", "workshop"]);
// v1.0.3 (F01): every campus place name (lowercase, with and without a leading "the"); anything else is off the grounds
const CAMPUS = ["announcement room", "arbiter hall", "archery range", "archive", "banking house", "barrow & vine", "bathhouse and washrooms", "bell tower", "boathouse and lake", "broken statue", "campus", "canteen", "castle", "cathedral", "club rooms", "combat grounds", "commissary", "common rooms", "courtyards", "detention tower", "dovecote", "faculty offices", "fire dormitory", "fishing house", "forest", "forest clearing", "founder's statue and park", "gardens", "grassy field and hills", "greenwick's", "groundskeeper's lodge", "gymnasium", "halvard", "halvard academy", "headmaster's office", "laundry", "lecture halls", "light dormitory", "mail tower", "main courtyard", "main library", "mall", "medical centre", "meditation rooms / spirit house", "menagerie", "merryhew's", "nightwell", "noble houses' liaison", "notice board", "observation tower", "old hut", "pennywhistle curios", "portrait hall", "potion halls", "quillfeather's", "reception and gatehouse", "restricted section", "ring dining hall", "rooftop", "royal inspectorate", "salaffian oven", "seal chamber", "seminar rooms", "sky dormitory", "snug", "sparring pavilion", "sports field", "staff quarters", "staff room", "storage and lockers", "student council chamber", "study rooms", "swimming pool", "tailor's row", "the arbiter hall", "the banking house", "the castle", "the cathedral", "the dovecote", "the mall", "the noble houses' liaison", "the ring dining hall", "the royal inspectorate", "the salaffian oven", "the seal chamber", "the snug", "the sparring pavilion", "the tinker's bench", "the warden's office", "tinker's bench", "viridian dormitory", "warden's office", "willow island", "workshop"];
const placeOf = loc => String(loc || '').split(/\s+[—-]\s+/)[0].trim();
// 1.3.1 (owner playtest: walking to "Boathouse" did not register on the map; "Boathouse and Lake — Fishing House" registered the
// boathouse). World.Location is put in the Campus Map's words: a short name ("Boathouse", "the library") becomes the map name, and a
// sub-spot that is itself a place ("… — Fishing House") becomes the place. A dorm room every dorm shares stays under its dorm.
const PLACE_NAMES = {"announcement room":"Announcement Room","arbiter hall":"The Arbiter Hall","the arbiter hall":"The Arbiter Hall","archery range":"Archery Range","archive":"Archive","banking house":"The Banking House","the banking house":"The Banking House","barrow & vine":"Barrow & Vine","barrow vine":"Barrow & Vine","bathhouse and washrooms":"Bathhouse and Washrooms","bell tower":"Bell Tower","boathouse and lake":"Boathouse and Lake","broken statue":"Broken Statue","canteen":"Canteen","cathedral":"The Cathedral","the cathedral":"The Cathedral","club rooms":"Club Rooms","combat grounds":"Combat Grounds","commissary":"Commissary","common rooms":"Common Rooms","courtyards":"Courtyards","detention tower":"Detention Tower","dovecote":"The Dovecote","the dovecote":"The Dovecote","faculty offices":"Faculty Offices","fire dormitory":"Fire Dormitory","fishing house":"Fishing House","forest":"Forest","forest clearing":"Forest Clearing","founder's statue and park":"Founder's Statue and Park","founders statue and park":"Founder's Statue and Park","gardens":"Gardens","grassy field and hills":"Grassy Field and Hills","greenwick's":"Greenwick's","greenwicks":"Greenwick's","groundskeeper's lodge":"Groundskeeper's Lodge","groundskeepers lodge":"Groundskeeper's Lodge","gymnasium":"Gymnasium","headmaster's office":"Headmaster's Office","headmasters office":"Headmaster's Office","laundry":"Laundry","lecture halls":"Lecture Halls","light dormitory":"Light Dormitory","mail tower":"Mail Tower","main library":"Main Library","mall":"The Mall","the mall":"The Mall","medical centre":"Medical Centre","meditation rooms / spirit house":"Meditation Rooms / Spirit House","meditation rooms spirit house":"Meditation Rooms / Spirit House","menagerie":"Menagerie","merryhew's":"Merryhew's","merryhews":"Merryhew's","nightwell":"Nightwell","noble houses liaison":"The Noble Houses' Liaison","noble houses' liaison":"The Noble Houses' Liaison","the noble houses' liaison":"The Noble Houses' Liaison","notice board":"Notice Board","observation tower":"Observation Tower","old hut":"Old Hut","pennywhistle curios":"Pennywhistle Curios","portrait hall":"Portrait Hall","potion halls":"Potion Halls","quillfeather's":"Quillfeather's","quillfeathers":"Quillfeather's","reception and gatehouse":"Reception and Gatehouse","restricted section":"Restricted Section","ring dining hall":"The Ring Dining Hall","the ring dining hall":"The Ring Dining Hall","rooftop":"Rooftop","royal inspectorate":"The Royal Inspectorate","the royal inspectorate":"The Royal Inspectorate","salaffian oven":"The Salaffian Oven","the salaffian oven":"The Salaffian Oven","seal chamber":"The Seal Chamber","the seal chamber":"The Seal Chamber","seminar rooms":"Seminar Rooms","sky dormitory":"Sky Dormitory","snug":"The Snug","the snug":"The Snug","sparring pavilion":"The Sparring Pavilion","the sparring pavilion":"The Sparring Pavilion","sports field":"Sports Field","staff quarters":"Staff Quarters","staff room":"Staff Room","storage and lockers":"Storage and Lockers","student council chamber":"Student Council Chamber","study rooms":"Study Rooms","swimming pool":"Swimming Pool","tailor's row":"Tailor's Row","tailors row":"Tailor's Row","the tinker's bench":"The Tinker's Bench","tinker's bench":"The Tinker's Bench","tinkers bench":"The Tinker's Bench","viridian dormitory":"Viridian Dormitory","the warden's office":"The Warden's Office","warden's office":"The Warden's Office","wardens office":"The Warden's Office","willow island":"Willow Island","workshop":"Workshop"};     // every way a place's own name is written (lowercase) -> map name
const PLACE_ALIAS = {"bank":"The Banking House","bathhouse":"Bathhouse and Washrooms","boat house":"Boathouse and Lake","boathouse":"Boathouse and Lake","clearing":"Forest Clearing","club room":"Club Rooms","common room":"Common Rooms","courtyard":"Courtyards","dining hall":"The Ring Dining Hall","fire dorm":"Fire Dormitory","fishing hut":"Fishing House","founder's park":"Founder's Statue and Park","founder's statue":"Founder's Statue and Park","founders park":"Founder's Statue and Park","gate":"Reception and Gatehouse","gatehouse":"Reception and Gatehouse","grassy field":"Grassy Field and Hills","gym":"Gymnasium","hills":"Grassy Field and Hills","hut":"Old Hut","infirmary":"Medical Centre","inspectorate":"The Royal Inspectorate","lake":"Boathouse and Lake","lake shore":"Boathouse and Lake","lakeshore":"Boathouse and Lake","lecture hall":"Lecture Halls","library":"Main Library","light dorm":"Light Dormitory","lockers":"Storage and Lockers","main courtyard":"Courtyards","medical center":"Medical Centre","meditation room":"Meditation Rooms / Spirit House","meditation rooms":"Meditation Rooms / Spirit House","observatory":"Observation Tower","park":"Founder's Statue and Park","pool":"Swimming Pool","potion hall":"Potion Halls","reception":"Reception and Gatehouse","seminar room":"Seminar Rooms","sky dorm":"Sky Dormitory","spirit house":"Meditation Rooms / Spirit House","storage":"Storage and Lockers","study room":"Study Rooms","the clearing":"Forest Clearing","the courtyard":"Courtyards","the forest":"Forest","the gate":"Reception and Gatehouse","the hills":"Grassy Field and Hills","the hut":"Old Hut","the island":"Willow Island","the lake":"Boathouse and Lake","the pavilion":"The Sparring Pavilion","the woods":"Forest","viridian dorm":"Viridian Dormitory","washrooms":"Bathhouse and Washrooms","willow":"Willow Island","woods":"Forest"};     // short and partial names (tools/common.py place_aliases) -> map name
const PLACE_SHARED = new Set(["Bathhouse and Washrooms", "Common Rooms", "Laundry"]);
// 1.24.0 (owner playtest): a place's lore and rumours {place key: [[uid, name as prose writes it, title, text]]}. The Campus Map shows
// only those {{user}} has heard ($ui.lore): overheard at the place (ambience, section 8m) or named in the narration (section 9).
const PLACE_LORE = {"bathhouse and washrooms":[[205,"Third Stall","Ghost Story - The Third Stall","Where: one stall in every Bathhouse and Washroom block, always occupied, never answers. Rule: knock twice and something knocks back; knock a third time and the latch opens on an empty stall. Never test it after the night bell. Passed down as a senior's joke."]],"bell tower":[[337,"Thirteenth Stroke","Ghost Story - The Thirteenth Stroke","Where: anywhere outdoors after the eight o'clock bell. Story: the Bell Tower sometimes strikes once more than the hour, a single stroke after the rest, when no one is in the tower. Rule: count the strokes. If there is one too many, go indoors and do not count again that night. Known for: nobody agrees on what the extra stroke is for; the bell ringers say the mechanism settles, and never ring it themselves."]],"boathouse and lake":[[208,"Crying on the Water","Ghost Story - The Crying on the Water","Where: the Lake, after dark. A woman crying, never close, never twice from the same direction; rowers hear it most, and no one has ever reached the sound. Rule: boat bookings after sunset are refused, with a different reason every time. The Fishing Club blames distance."]],"canteen":[[211,"Lucky Roll","The Lucky Roll","The Canteen's free filled roll, baked in batches, no two fillings alike, nothing written down. Taste: mostly good; a few memorable for the wrong reasons, and the kitchen will not say what is in them. Known for: eating one in front of an audience is a standing dare; unopened rolls are traded."]],"club rooms":[[218,"Dragonchess","Dragonchess","Play: starts as ordinary chess (drawn from chess and shogi) on floating checkered spheres over golden clockwork pedestals that materialise the pieces. The board reads the players and escalates: it unfolds into layers and the pieces fight autonomously in real time, so players outmanoeuvre both the opponent and the game. Known for: rare sets; serious matches last days."],[346,"Applause","Ghost Story - The Applause","Where: the old amphitheatre off the Club Rooms corridor, during a late rehearsal. Story: at the end of a scene, applause comes from the empty upper tiers, and one seat up there has been folded down. Rule: bow, and end the rehearsal. Do not run the scene again that night. Known for: the Theatre Troupe bows to the empty tiers at the end of every rehearsal, and calls it tradition."]],"commissary":[[210,"Sunfizz","Sunfizz","The soda every student drinks, sold at the Commissary and the Mall store in heavy glass bottles. Price: 8 points, 2 back per returned bottle. Taste: absurdly sweet. Known for: confiscated in lectures; caps litter the Lecture Halls."],[213,"Firetooth","Firetooth","A tin of hard sweets hot enough to make the eyes water, sold everywhere. Price: 12 points. Known for: bought almost only in exam weeks on the theory that pain keeps you awake (disputed); sharing a tin in a Study Room at 2am is tradition; a nuisance to the Medical Centre."]],"common rooms":[[218,"Dragonchess","Dragonchess","Play: starts as ordinary chess (drawn from chess and shogi) on floating checkered spheres over golden clockwork pedestals that materialise the pieces. The board reads the players and escalates: it unfolds into layers and the pieces fight autonomously in real time, so players outmanoeuvre both the opponent and the game. Known for: rare sets; serious matches last days."]],"fire dormitory":[[207,"Three O'Clock Knock","Ghost Story - The Three O'Clock Knock","Where: a dorm door, at three in the morning, in a dormitory that admits only its own students. Rule: three evenly spaced knocks; count them and go back to sleep. It is never four, and nobody wants to learn what four means. Students argue whether sound can even cross the door wards."]],"forest":[[225,"Eating in the Forest","Eating in the Forest","Rule: share first. Leave a bite on the ground or a crust on a stump before the first mouthful. Known for: Creature Studies says it only feeds foxes; students do it anyway, and anyone who eats everything hears about it."]],"founder's statue and park":[[223,"Founder's Hand","The Founder's Hand","Rule: touch the Founder's Statue's outstretched hand before an exam, always the hand, always on the way out. Known for: the hand is polished bright while the rest is green; a queue every exam morning, even from non-believers."],[342,"Faraway Laugh","Ghost Story - The Faraway Laugh","Where: Founder's Park and the tree-lined paths, after dark. Story: a woman laughs somewhere up in the old trees. The laugh always sounds far away. Rule: the fainter it sounds, the closer she is. If it sounds far, walk the other way at once and do not look up. Known for: students who hear it say it was only an owl, and take the long way round for a week."]],"gardens":[[340,"Breath on the Glass","Ghost Story - Breath on the Glass","Where: inside the Gardens' greenhouses, in the late afternoon and evening. Story: the glass fogs from the inside, as if someone warm stood close to it, around a handprint that belongs to nobody present. Rule: do not press your own hand over it, and do not sleep in the greenhouses. Known for: the Gardening Club blames the heat pipes, and still leaves in pairs."]],"grassy field and hills":[[339,"Walking Lantern","Ghost Story - The Walking Lantern","Where: the Grassy Field and Hills, after dark. Story: a single lantern light crosses the ridge at walking pace with no one carrying it, and stops when anyone stops to watch. Rule: do not walk toward it, and do not follow it towards the Forest. Known for: the Walking Club keeps to the lower path after dusk and will not say why."]],"lecture halls":[[206,"Long Corridor","Ghost Story - The Long Corridor","Where: the castle's main corridor, walked alone after the night burn. Story: it runs longer than by day, the same doors passing twice; no figure, only a walk that took eleven minutes when the bell says otherwise. Told near the Bell Tower or after late Library sessions."],[209,"Night Student","Ghost Story - The Night Student","Where: the Lecture Hall tier, after curfew. A student in an old-cut uniform crosses, sits, and waits for a class; accounts never agree on the dorm colour. Mostly placed in the breach year, so third-years refuse to tell it. It resurfaces every Remembrance Day."]],"light dormitory":[[207,"Three O'Clock Knock","Ghost Story - The Three O'Clock Knock","Where: a dorm door, at three in the morning, in a dormitory that admits only its own students. Rule: three evenly spaced knocks; count them and go back to sleep. It is never four, and nobody wants to learn what four means. Students argue whether sound can even cross the door wards."]],"main library":[[224,"Sleeping in the Library","Sleeping in the Library","Story: fall asleep over a book and you wake somewhere else: a reading room with the wrong number of doors, shelves out of order, nobody else in the building. Rule: sit still and sleep again; do not walk. Everyone who tells it woke the second time in their own chair. Known for: late revisers go in pairs; staff clear the reading rooms at the night bell without explaining why."]],"mall":[[210,"Sunfizz","Sunfizz","The soda every student drinks, sold at the Commissary and the Mall store in heavy glass bottles. Price: 8 points, 2 back per returned bottle. Taste: absurdly sweet. Known for: confiscated in lectures; caps litter the Lecture Halls."],[212,"Ardenne","Ardenne","The luxury marque in magical equipment: focuses, instruments, cases, measuring tools. Run by the Ardenne family. Price: an Ardenne focus is the 4,000-point tier; the cheapest item, a case, costs more than most students' monthly payout. Known for: marks its owner instantly as wealthy; never advertises."],[213,"Firetooth","Firetooth","A tin of hard sweets hot enough to make the eyes water, sold everywhere. Price: 12 points. Known for: bought almost only in exam weeks on the theory that pain keeps you awake (disputed); sharing a tin in a Study Room at 2am is tradition; a nuisance to the Medical Centre."],[215,"Oracle Shell","The Oracle Shell","A palm-sized novelty shell sold at Merryhew's, the Mall's joke shop, that answers any spoken question with yes, no, or ask again later. Price: 40 points. Known for: transparently random, asked anyway, for jokes or 2am secrets. Real diviners find it insulting, which helps sales."],[222,"Star Cookie","Star Cookie","A star-shaped bakery biscuit. Price: 8 points. Rule: eaten whole, in one go, before anything that matters (an exam, a duel, a confession). Halves do not count. Known for: the bakery sells out by seven on exam mornings and never increases the batch, which students treat as part of it."]],"medical centre":[[344,"Last Bed","Ghost Story - The Last Bed","Where: the Medical Centre, at night, for students kept in overnight. Story: the curtain round the last bed on the ward is drawn, and someone behind it breathes slowly in their sleep. The ward register says that bed is empty. Rule: never open the last curtain. Ask the night nurse in the morning; she will tell you it was empty, and she will be kind about it. Known for: patients who are well enough ask to be moved nearer the door."]],"menagerie":[[341,"When the Pens Go Quiet","Ghost Story - When the Pens Go Quiet","Where: the Menagerie, from dusk into the night. Story: every animal in the pens falls silent at once and turns to face the Forest, and stays that way for a long moment before the noise comes back. Rule: when the pens go quiet, walk away in the other direction and do not look where they are looking. Known for: the handlers call it weather sense; the Creature Studies teacher does not call it anything."]],"rooftop":[[345,"Other Climber","Ghost Story - The Other Climber","Where: the Rooftop, at night. Story: someone sits on the far gable in exactly your posture, wearing your dorm's vest, looking out over the grounds as you are. Rule: leave the roof before they turn round, and do not come up again that night. Known for: why students who know the way up never go up alone."]],"sky dormitory":[[207,"Three O'Clock Knock","Ghost Story - The Three O'Clock Knock","Where: a dorm door, at three in the morning, in a dormitory that admits only its own students. Rule: three evenly spaced knocks; count them and go back to sleep. It is never four, and nobody wants to learn what four means. Students argue whether sound can even cross the door wards."]],"swimming pool":[[338,"Night Swimmer","Ghost Story - The Night Swimmer","Where: the Swimming Pool after dark, most often in winter when the rune-warmed water steams. Story: someone swims steady lengths through the steam, the lane rope lifting as they pass, but when the steam clears the water is empty and still. Rule: never swim alone after dark, and do not call out to them. Known for: the Swimming Club claims the fastest lap on record and will not say who swam it."]],"viridian dormitory":[[207,"Three O'Clock Knock","Ghost Story - The Three O'Clock Knock","Where: a dorm door, at three in the morning, in a dormitory that admits only its own students. Rule: three evenly spaced knocks; count them and go back to sleep. It is never four, and nobody wants to learn what four means. Students argue whether sound can even cross the door wards."]]};
function hearLore(S, u, title, where) {
  if (S.$ui.lore.includes(String(u))) return;
  S.$ui.lore.push(String(u)); S.$ui.toasts.push(`Heard${where ? ' at ' + where : ''}: ${title}`);
}
const plKey = s => String(s || '').trim().toLowerCase().replace(/[.!]+$/, '').replace(/\s+/g, ' ');
const plName = s => { const k = plKey(s); return PLACE_NAMES[k] || PLACE_NAMES[k.replace(/^the /, '')] || ''; };
// 1.24.3 (owner): the Lecture Halls, Study Rooms and lockers are on each year's floor (first-years Floor 2, second-years 3, third-years 4).
// Any way of writing one ("Second-year Lecture Halls", "Lecture Halls, Floor 3", "Floor 3 — Study Rooms", "the lockers on the
// third-year floor") becomes "<place> — Floor N" (+ any other detail), so the place is known and the floor is kept.
const YEAR_FLOOR_PLACES = {"Lecture Halls": ["Floor 2", "Floor 3", "Floor 4"], "Study Rooms": ["Floor 2", "Floor 3", "Floor 4"], "Storage and Lockers": ["Floor 2", "Floor 3", "Floor 4"]};
const YF_WORD = { 'Lecture Halls': /\blecture[- ]halls?\b/i, 'Study Rooms': /\bstudy[- ]rooms?\b/i, 'Storage and Lockers': /\blockers?\b|\bstorage\b/i };
function yearFloorLocation(loc) {
  const s = String(loc || ''), f = /\bfloor ([2-4])\b/i.exec(s), y = /\b(first|second|third)[- ]years?\b/i.exec(s);
  if (!f && !y) return '';
  const hits = Object.keys(YEAR_FLOOR_PLACES).map(nm => [nm, YF_WORD[nm] && YF_WORD[nm].exec(s)]).filter(([, m]) => m).sort((a, b) => a[1].index - b[1].index);
  if (!hits.length) return '';
  // another place named first wins ("Fire Dormitory — lockers on the second-year corridor", "Canteen, talking about the first-year halls")
  if (s.split(/\s+[—–-]\s+|,\s+/).some(x => { const n = plName(x); return n && !YEAR_FLOOR_PLACES[n]; })) return '';
  const nm = hits[0][0], n = f ? +f[1] : ['first', 'second', 'third'].indexOf(y[1].toLowerCase()) + 2;
  if (!YEAR_FLOOR_PLACES[nm].includes('Floor ' + n)) return '';
  const rest = s.split(/\s+[—–-]\s+|,\s+/).map(x => x.trim()).filter(x => x && !/\bfloor [2-4]\b|\b(first|second|third)[- ]years?\b/i.test(x) && !Object.values(YF_WORD).some(rx => rx.test(x)));
  return [nm, 'Floor ' + n, ...rest].join(' — ');
}
function canonLocation(loc) {
  const yf = yearFloorLocation(loc); if (yf) return yf;
  const segs = String(loc || '').split(/\s+[—–-]\s+|,\s+/).map(x => x.trim()).filter(Boolean);
  if (!segs.length) return String(loc || '');
  let at = -1, nm = '';
  for (let i = segs.length - 1; i >= 0 && at < 0; i--) { const n = plName(segs[i]); if (n && (i === 0 || !PLACE_SHARED.has(n))) { at = i; nm = n; } }
  if (at < 0) { nm = PLACE_ALIAS[plKey(segs[0])] || PLACE_ALIAS[plKey(segs[0]).replace(/^the /, '')] || ''; if (nm) at = 0; }
  if (at < 0) return String(loc);
  return at === 0 && segs[0] === nm ? String(loc) : [nm, ...segs.slice(at + 1)].join(' — ');
}
const onCampus = loc => { const p = placeOf(loc).toLowerCase(); return !p || CAMPUS.some(c => p === c || p.startsWith(c + ' ') || p.startsWith(c + ',')); };
const CAP = { Notices: 10, Letters: 12, Clues: 40, Journal: 30 };
// Batch 5.2: trips (first day, for the unlock window) and the Kingdom prize (lore Competitions: 5,000 points per winning member)
const TRIPS = [{ m: 4, w: 2, d: 'Tue', name: 'the capital (Crowning Day)' }, { m: 11, w: 3, d: 'Mon', name: 'Sunreach Bay (Academy Trip)' }];
const KINGDOM_PRIZE = 5000;
// v1.0.3: Halvard students {id: [lorebook Year, campaign year they arrive]}, injected by gen_engine. Graduation (M11 W4 Sun) sends
// the year's third-years away the next morning (M12 W1 Mon); they go to Campus_State.Graduated (the story may take a name back out).
// ARRIVES: incoming cohorts (data/cohorts.json) -> campaign year they arrive as first-years; before that they are not at Halvard.
const STUDENTS = {"Aiden":[1,1],"Alyssa":[1,1],"Caralynn":[1,1],"Caspian":[3,1],"Castor":[1,1],"Dante":[2,1],"Etnie":[3,1],"Florian":[2,1],"Gareth":[3,1],"Hadrian":[1,2],"Idris":[2,1],"Irene":[3,1],"Kanae":[2,1],"Lenna":[2,1],"Linus":[1,2],"Maple":[1,2],"Nerys":[1,2],"Percival":[1,1],"Royhan":[3,1],"Ruby":[3,1],"Saffi":[2,1],"Sophia":[3,1],"Tilly":[2,1],"Trixie":[1,1],"Tsubaki":[1,2],"Vera":[1,1],"Wren":[1,2],"Zara":[1,1]};
const ARRIVES = {"Hadrian":2,"Linus":2,"Maple":2,"Nerys":2,"Tsubaki":2,"Wren":2};
const STAYS = {"Etnie":"Etnie did not leave with the graduates: she stays on at Halvard for another third year (her lore says why)"};   // 1.7.4: third-years whose canon keeps them at Halvard (data/cohorts.json "stays"): {id: log line}
const yearOf = (id, Y) => (STUDENTS[id] ? STUDENTS[id][0] + Y - STUDENTS[id][1] : 0);   // their school year in campaign year Y
// Batch 5.3 (F20): seeded campus happenings. Pool from data/happenings.json (injected by tools/gen_engine.py).
// Plan 4.6: never Math.random(). The chat seed is taken once from the creation time of the message whose update first ran the
// engine and then stored in $eng.seed, so every later roll is a pure function of (seed, day): swipes and replays see the same day.
const HAPPENINGS = [{"id":"work_menagerie","text":"A paid-work opening is up on the Notice Board: Menagerie mucking out, 40 points a shift. It will be gone by tomorrow.","where":"Notice Board","from":7,"to":20,"days":"weekday","weight":3},{"id":"work_shelving","text":"The Main Library has posted a shelving shift on the Notice Board, the quiet kind that is rarely advertised twice.","where":"Notice Board","from":7,"to":18,"days":"weekday","weight":2},{"id":"tutoring_offer","text":"A second-year has pinned a tutoring offer to the Notice Board: combat footwork, paid in points or in favours.","where":"Notice Board","from":7,"to":20,"days":"any","weight":2},{"id":"lost_wand","text":"A lost-item note on the Notice Board: a silver-banded focus wand, last seen near the Lecture Halls. Reward offered.","where":"Notice Board","from":7,"to":20,"days":"any","weight":2},{"id":"dove_sweep","text":"Two Doves are walking the Courtyards slowly, watching faces. Students keep finding reasons to be somewhere else.","where":"Courtyards","from":12,"to":16,"days":"weekday","weight":2,"outdoor":true},{"id":"menagerie_loose","text":"Something small has slipped its pen at the Menagerie; handlers are combing the Gardens with nets and treats.","where":"Gardens","from":14,"to":18,"days":"any","weight":2,"outdoor":true},{"id":"lanterns_dim","text":"Month-end draw on the mana grid: the corridor lanterns burn noticeably dimmer tonight, and everyone complains about it like weather.","where":"","from":17,"to":20,"days":"any","weeks":[4],"weight":4},{"id":"canteen_short","text":"The Canteen kitchen is short-handed; the cook is offering an extra paid shift to whoever helps serve lunch.","where":"Canteen","from":10,"to":13,"days":"weekday","weight":2},{"id":"cooking_club","text":"The Cooking Club's ovens have run since dawn; the Canteen smells of honey bread and they are giving away the failures.","where":"Canteen","from":10,"to":15,"days":"any","weight":2},{"id":"duel_chalk","text":"A formal duel challenge is chalked on the board outside the Sparring Pavilion. Nobody has signed to accept it yet.","where":"The Sparring Pavilion","from":8,"to":20,"days":"any","weight":2},{"id":"club_tables","text":"Club recruiters have set up tables in the Courtyards, pressing leaflets on every first-year who slows down.","where":"Courtyards","from":12,"to":17,"days":"any","months":[1,2],"weight":4,"outdoor":true},{"id":"dragonchess","text":"A Dragonchess match in the Mall's game halls has run into its second day; a crowd is betting points on it.","where":"The Mall","from":16,"to":20,"days":"any","weight":2},{"id":"bakery_new","text":"The Mall bakery has a new pastry out and the queue curls out of the door.","where":"The Mall","from":7,"to":11,"days":"any","weight":2},{"id":"mail_sunday","text":"Sunday sorting at the Mail Tower is swamped; the sorting floor is asking anyone free to lend a hand.","where":"Mail Tower","from":9,"to":15,"days":["Sun"],"weight":5},{"id":"parcel_cart","text":"A cart of heavy parcels has come in at the Mail Tower; locker tallies are going up all afternoon.","where":"Mail Tower","from":13,"to":18,"days":"weekday","weight":2},{"id":"boat_capsize","text":"A rowing boat capsized near the willow island; the crew came back soaked and furious, and the boathouse is buzzing.","where":"Boathouse and Lake","from":15,"to":19,"days":"any","weight":1,"outdoor":true},{"id":"clear_dusk","text":"A clear, moonless dusk: the Observation Tower's instruments are already turning on their own, and the Divination Society has claimed the top deck.","where":"Observation Tower","from":17,"to":20,"days":"any","weight":1,"weather":"clear_night"},{"id":"pickup_match","text":"An informal cross-dorm match has started on the Sports Field, and one side is a player short.","where":"Sports Field","from":16,"to":19,"days":"any","weight":2,"outdoor":true},{"id":"workshop_sparks","text":"A misfired enchantment has left sparks hanging in the Workshop air for hours; the forges are shut until it settles.","where":"Workshop","from":10,"to":18,"days":"weekday","weight":1},{"id":"garden_overgrowth","text":"Something in the Gardens grew far too well overnight; the Gardening Club is cutting a path back to the herb beds.","where":"Gardens","from":7,"to":17,"days":"any","weight":2,"outdoor":true},{"id":"council_inspection","text":"The Student Council is inspecting the dorm common rooms this evening: preservation lockers, quiet hours, the kettle rota.","where":"Common Rooms","from":18,"to":20,"days":"weekday","weight":1},{"id":"pillar_notice","text":"The Announcement Pillars glow between periods: a lost-property amnesty at Reception, today only.","where":"Reception and Gatehouse","from":12,"to":16,"days":"weekday","weight":1},{"id":"medical_queue","text":"After today's Combat lessons the Medical Centre has a queue out of the door: sprains, burns and one badly singed eyebrow.","where":"Medical Centre","from":16,"to":18,"days":["Mon","Thu"],"weight":3},{"id":"airship_over","text":"An airship passes low over the grounds on its way to the capital; half the Courtyards stops to watch.","where":"Courtyards","from":10,"to":17,"days":"any","weight":1,"outdoor":true},{"id":"rumour_knock","text":"Rumour in the common rooms: someone swears they counted four knocks at three o'clock last night.","where":"Common Rooms","from":7,"to":10,"days":"any","weight":1},{"id":"rumour_corridor","text":"Two late revisers are telling anyone who will listen that the main corridor ran long last night, after the night burn.","where":"Lecture Halls","from":8,"to":12,"days":"weekday","weight":1},{"id":"fallen_tree","text":"A cracked tree has come down at the Forest's edge; the Groundskeeper's Lodge wants volunteers with strong backs.","where":"Groundskeeper's Lodge","from":8,"to":16,"days":"any","weight":1,"outdoor":true,"after_storm_x3":true},{"id":"study_group","text":"A Magic Theory study group has taken over a Study Room and is selling copies of its notes for points.","where":"Study Rooms","from":16,"to":20,"days":"weekday","weight":2},{"id":"pool_runes","text":"The warming runes on the Swimming Pool rim have failed; the water is ice-cold and the swim clubs are outraged.","where":"Swimming Pool","from":7,"to":18,"days":"any","weight":1},{"id":"inspectorate_clerk","text":"A crown clerk from the Royal Inspectorate was seen carrying ledgers towards the Warden's Office. Nobody knows why.","where":"Courtyards","from":9,"to":15,"days":"weekday","weight":1},{"id":"snow_clearing","text":"Snow came down overnight and buried the paths; the Groundskeeper's Lodge is hiring a snow-clearing crew, 20 to 40 points a shift.","where":"Groundskeeper's Lodge","from":7,"to":14,"days":"any","weight":6,"outdoor":false,"weather":"snow"},{"id":"storm_cleanup","text":"Yesterday's storm left branches and slipped roof slates across the grounds; the Groundskeeper's Lodge is paying a clean-up crew by the shift.","where":"Groundskeeper's Lodge","from":7,"to":16,"days":"any","weight":6,"outdoor":false,"weather":"after_storm"},{"id":"dove_fog","text":"Dense fog lies over the grounds and the Doves have doubled their patrols, stopping anyone they cannot see clearly until it lifts.","where":"","from":6,"to":12,"days":"any","weight":6,"outdoor":false,"weather":"dense_fog"}];
// 1.16.0 ambience (data/ambience.json): categories and their crowd rhythm, the sun table, cue and beat types, the uncanny stories
const AMB = {"uncanny_chance":5,"lore_chance":35,"sun":{"1":[365,1075],"2":[315,1125],"3":[270,1170],"4":[245,1195],"5":[255,1185],"6":[295,1145],"7":[345,1095],"8":[395,1045],"9":[440,1000],"10":[470,970],"11":[460,980],"12":[415,1025]},"cats":{"teaching":{"places":["lecture halls","seminar rooms"],"class":[0,0,4,4,1,4,1,0,0],"sat":[0,0,4,0,0,0,0,0,0],"free":[0,0,0,0,0,0,0,0,0]},"craft":{"places":["potion halls","workshop"],"class":[0,0,1,1,0,4,3,2,0],"free":[0,0,1,2,1,2,2,1,0]},"study":{"places":["main library","study rooms","archive","restricted section"],"class":[0,1,1,1,2,1,3,3,1],"sat":[0,0,1,4,2,2,2,2,1],"free":[0,0,2,3,2,3,3,3,1]},"staff":{"places":["faculty offices","staff room","headmaster's office","staff quarters"],"class":[0,1,2,2,2,2,2,1,0],"free":[0,0,1,1,1,1,1,1,0]},"ceremonial":{"places":["arbiter hall","ring dining hall","portrait hall"],"class":[0,0,0,0,0,0,0,0,0],"free":[0,0,0,0,0,0,0,0,0]},"clubs":{"places":["club rooms","student council chamber","announcement room"],"class":[0,0,0,0,1,0,3,3,0],"sat":[0,0,0,1,1,4,2,2,0],"free":[0,0,1,2,1,2,2,2,0]},"dining":{"places":["canteen"],"class":[0,3,1,1,4,1,2,4,0],"free":[0,1,1,2,4,2,2,4,0]},"dorm_social":{"places":["common rooms","fire dormitory","light dormitory","sky dormitory","viridian dormitory"],"class":[1,2,0,0,1,0,2,3,3],"free":[1,1,2,2,2,2,3,3,3]},"dorm_utility":{"places":["laundry","bathhouse and washrooms","storage and lockers"],"class":[0,3,0,0,1,0,2,3,2],"free":[0,1,2,2,1,2,2,3,2]},"hub":{"places":["main courtyard","courtyards","notice board","mail tower"],"class":[0,2,1,1,4,1,3,2,0],"free":[0,1,2,3,3,3,3,2,0]},"mall":{"places":["mall","nightwell","merryhew's","snug","quillfeather's","pennywhistle curios","barrow & vine","greenwick's","tinker's bench","salaffian oven","tailor's row","commissary","banking house"],"class":[0,0,0,0,2,0,3,3,0],"free":[0,0,2,3,3,4,3,2,0]},"care":{"places":["medical centre","meditation rooms / spirit house"],"class":[0,1,1,1,1,1,1,1,1],"free":[0,1,1,1,1,1,1,1,1]},"gate":{"places":["reception and gatehouse","groundskeeper's lodge"],"class":[0,1,1,1,1,1,1,1,0],"free":[0,1,1,1,1,1,1,1,0]},"enclave":{"places":["dovecote","cathedral","noble houses' liaison","royal inspectorate"],"class":[0,1,1,1,1,1,1,1,0],"free":[0,1,1,2,1,1,1,1,0]},"site":{"places":["detention tower","warden's office","seal chamber"],"class":[0,0,0,0,0,0,1,0,0],"free":[0,0,0,0,0,0,0,0,0]},"heights":{"places":["bell tower","rooftop","observation tower"],"class":[0,0,0,0,0,0,1,1,1],"free":[0,0,1,1,1,1,1,2,1]},"sport":{"places":["sports field","gymnasium","swimming pool","archery range"],"class":[0,1,0,0,1,0,3,3,0],"free":[0,1,2,3,2,3,3,2,0]},"combat":{"places":["combat grounds","sparring pavilion"],"class":[0,1,0,0,0,3,3,2,0],"free":[0,1,1,2,1,2,2,1,0]},"green":{"places":["gardens","founder's statue and park","menagerie","broken statue"],"class":[0,1,0,0,1,0,2,2,0],"free":[0,1,2,2,2,3,2,2,0]},"lake":{"places":["boathouse and lake","fishing house","willow island"],"class":[0,2,0,0,1,0,2,2,0],"free":[0,2,2,3,2,3,2,2,0]},"hills":{"places":["grassy field and hills","old hut"],"class":[0,0,0,0,0,0,2,2,0],"free":[0,1,2,2,2,3,2,2,0]},"forest":{"places":["forest","forest clearing"],"class":[0,0,0,0,0,1,0,0,0],"free":[0,0,1,1,0,1,1,0,0]}},"cues":[["*","cue","the weather heard from indoors",{"out":false,"wx":["rain","snow","wind","storm"]}],["*","cue","the weather on skin and clothes",{"out":true}],["*","cue","the quality of the light right now",{}],["*","cue","the temperature of the air",{}],["*","cue","the general noise of people",{"min":3}],["*","cue","a small sound that the quiet makes loud",{"max":1}],["teaching","cue","the smell and dust of a teaching room",{}],["teaching","cue","the rustle of a full room settling",{"min":3}],["craft","cue","the smell of the work being done here",{}],["craft","cue","heat and noise from the benches",{"min":3}],["study","cue","the particular hush of this room",{}],["study","cue","lamplight on the tables",{"tb":["evening","night"]}],["study","cue","the tension of people cramming",{"exam":true}],["staff","cue","the formality of the corridor",{}],["ceremonial","cue","the size of the room when it is empty",{"max":0}],["ceremonial","cue","the whole hall's noise under the vault",{"min":3}],["clubs","cue","the clutter of rooms many clubs share",{}],["dining","cue","the din of a full canteen",{"min":3}],["dining","cue","the kitchen heard through the hatch",{"max":1}],["dining","cue","today's food smell",{}],["dorm_social","cue","the dorm's own smell and warmth",{}],["dorm_social","cue","the fire or lamps in the common room",{"tb":["evening","night"]}],["dorm_utility","cue","steam, soap or damp stone",{}],["hub","cue","how full or empty the courtyard is right now",{}],["hub","cue","the season in the courtyard",{}],["mall","cue","the mix of shop smells",{}],["mall","cue","the bustle between the stalls and shops",{"min":3}],["care","cue","the clean, herbal smell of the place",{}],["gate","cue","the traffic at the gate",{}],["enclave","cue","the change in the air past the academy's ground",{}],["site","cue","the silence and the cold",{}],["heights","cue","the height and the wind",{}],["heights","cue","the stars",{"tb":["night"],"wx":["clear"]}],["sport","cue","the smell of the grass, the floor or the water",{}],["combat","cue","the scuffed rings and the smell of spent magic",{}],["green","cue","what is growing or blooming this season",{}],["lake","cue","the water's mood right now",{}],["lake","cue","mist on the water",{"tb":["dawn","morning"]}],["hills","cue","the openness and the wind in the grass",{}],["hills","cue","the castle small in the distance",{}],["forest","cue","the light under the trees",{}],["forest","cue","the forest's quiet or its noise",{}]],"beats":[["*","tex","a bell marking the hour or a period",{"far":true,"curfew":true}],["*","tex","voices carrying from somewhere out of sight",{"far":true,"curfew":true}],["*","tex","someone hurrying past on an errand",{}],["*","tex","laughter from a group close by",{"min":2}],["*","tex","an argument kept to a low hiss nearby",{"min":2}],["*","tex","an Announcement Pillar crackling with a notice",{"far":true}],["*","tex","casual magic used for something trivial nearby",{"min":2}],["*","tex","overheard: a live rumour, in someone else's words",{"min":2,"special":"overheard"}],["*","tex","the weather turning",{"far":true,"curfew":true,"special":"weather_turn"}],["*","tex","an event echo",{"special":"event_echo"}],["*","brush","someone mistakes {{user}} for someone else",{"min":2}],["*","brush","someone asks {{user}} for directions or the time",{"min":2}],["*","brush","a stray object ends up at {{user}}'s feet",{}],["*","brush","the wind takes something of {{user}}'s or someone else's",{"out":true,"wx":["wind","storm"]}],["*","tex","a patrol's lantern passing at a distance",{"far":true,"curfew":true,"tb":["night"]}],["teaching","tex","a lecture overheard through a door",{"min":3}],["teaching","tex","a note passed along a bench",{"min":2}],["teaching","tex","chalk or quill scratching in an empty room nearby",{"far":true}],["teaching","brush","someone borrows or returns something of {{user}}'s",{"min":3}],["craft","tex","a small mishap at a bench (a fizz, a crack, a curse)",{"min":2}],["craft","tex","tools and vessels settling and ticking as they cool",{"far":true}],["craft","brush","a whiff or splash from someone's work reaches {{user}}",{"min":2}],["study","tex","a stifled laugh and someone shushing it",{"min":2}],["study","tex","books being shelved or carted",{"far":true}],["study","tex","someone asleep over their notes",{"exam":true}],["study","brush","someone asks {{user}} to keep an eye on their things",{"min":2}],["staff","tex","a door opening on a teacher's voice mid-sentence",{}],["staff","tex","staff talking shop behind a door",{"far":true}],["staff","brush","a passing teacher glances at {{user}} and remembers something",{}],["ceremonial","tex","staff preparing the room for the next occasion",{"far":true}],["ceremonial","tex","a table breaking into a toast or a cheer",{"min":3}],["ceremonial","brush","{{user}} is jostled in the crush at the doors",{"min":3}],["clubs","tex","a club rehearsing, arguing or recruiting behind a door",{"min":2}],["clubs","tex","a notice or flyer being pinned up",{}],["clubs","brush","someone tries to recruit {{user}} for something",{"min":2}],["dining","tex","a table celebrating or daring someone",{"min":3}],["dining","tex","someone at a nearby table eating alone",{"min":2}],["dining","brush","a spill or a tipped tray reaches {{user}}",{"min":3}],["dining","brush","someone asks to share {{user}}'s table",{"min":2}],["dorm_social","tex","a game, a card table or a study group in full swing",{"min":2}],["dorm_social","tex","something going on in someone's room upstairs",{"far":true,"curfew":true}],["dorm_social","tex","late whispering on the stairs",{"tb":["night"]}],["dorm_social","brush","a dormmate drags {{user}} into something small",{"min":2}],["dorm_utility","tex","someone's laundry mishap",{}],["dorm_utility","brush","a mix-up with {{user}}'s things",{}],["hub","tex","a crowd gathered around something",{"min":3}],["hub","tex","students flooding out between periods",{"min":3}],["hub","tex","a notice going up on the board",{}],["hub","brush","a flyer, a leaflet or a message pressed into {{user}}'s hand",{"min":3}],["mall","tex","haggling or a small scene at a counter",{"min":2}],["mall","tex","a shopkeeper calling out a deal",{}],["mall","brush","a shopkeeper tries to sell {{user}} something",{"min":1}],["care","tex","someone being patched up nearby",{}],["care","tex","coughing from the beds",{"flu":true}],["care","brush","a volunteer offers {{user}} something (water, a remedy, a seat)",{}],["gate","tex","someone signing in or being turned away",{}],["gate","tex","a delivery arriving",{}],["gate","brush","the porter asks {{user}} to pass something on",{}],["enclave","tex","an official about their business",{}],["enclave","tex","a service, a drill or a meeting heard from inside",{"far":true}],["enclave","brush","{{user}} is watched a moment too long",{}],["site","tex","a sound the stone makes on its own",{"far":true}],["site","brush","a feeling of being noticed, with no one there",{}],["heights","tex","the campus below going about its business",{"far":true}],["heights","tex","stargazers setting up",{"tb":["night"],"wx":["clear"]}],["heights","brush","the wind nearly takes something",{"wx":["wind","storm"]}],["sport","tex","a match or a practice going on",{"min":3}],["sport","tex","a team shouting or a coach's whistle",{"min":2}],["sport","brush","a ball or a stray arrow lands near {{user}}",{"min":2}],["sport","brush","someone asks {{user}} to make up the numbers",{"min":2}],["combat","tex","a duel or drill going on in a warded ring",{"min":2}],["combat","tex","the ward lines humming or flickering",{"far":true}],["combat","brush","a stray spark or gust from a ring reaches {{user}}",{"min":2}],["green","tex","a queue of students touching the Founder's Hand",{"exam":true,"tb":["morning"]}],["green","tex","a gardener or handler at work",{}],["green","tex","an animal making itself known",{"far":true}],["green","brush","a creature or a plant takes an interest in {{user}}",{}],["lake","tex","birds or fish on the water",{"far":true}],["lake","tex","rowers, swimmers or anglers out",{"min":2}],["lake","tex","a voice carrying too clearly across the water",{"far":true}],["lake","brush","something washes up or drifts to {{user}}",{}],["hills","tex","people out on the slopes (kites, blankets or sledges by season)",{"min":2}],["hills","tex","the Forest's edge making a sound",{"far":true}],["hills","brush","the wind takes something across the grass",{"wx":["wind","storm"]}],["forest","tex","something moving unseen in the undergrowth",{"far":true}],["forest","tex","tracks in the snow that are not a deer's",{"far":true,"wx":["snow"]}],["forest","tex","an offering left on a stump by someone who ate here",{"far":true}],["forest","brush","a branch, a bramble or a root catches {{user}}",{}]],"uncanny":[{"id":"third_stall","uid":205,"title":"The Third Stall","places":["bathhouse and washrooms"],"from":1200,"to":360,"text":"the Third Stall answers {{user}}'s knock, or its latch moves by itself"},{"id":"long_corridor","uid":206,"title":"The Long Corridor","places":["lecture halls","notice board","club rooms","seminar rooms","storage and lockers"],"from":1200,"to":360,"alone":true,"text":"the corridor runs longer than it should, and the time does not add up"},{"id":"three_knock","uid":207,"title":"The Three O'Clock Knock","places":["fire dormitory","light dormitory","sky dormitory","viridian dormitory","common rooms"],"from":170,"to":190,"awake":true,"text":"three evenly spaced knocks at {{user}}'s door"},{"id":"crying_water","uid":208,"title":"The Crying on the Water","places":["boathouse and lake","fishing house","willow island"],"dark":true,"text":"a woman crying somewhere out on the water, never from the same place twice"},{"id":"night_student","uid":209,"title":"The Night Student","places":["lecture halls"],"curfew":true,"x2":"remembrance","text":"a student in an old-cut uniform, sitting as if waiting for a class"},{"id":"library_sleep","uid":224,"title":"Sleeping in the Library","places":["main library","study rooms"],"asleep":true,"text":"{{user}} wakes in a reading room that is subtly wrong, and nobody else is there"},{"id":"taken","uid":226,"title":"Taken","places":["forest","grassy field and hills","old hut","main courtyard","courtyards"],"dark":true,"out":true,"text":"{{user}}'s own name called in the dark by someone out of sight"},{"id":"thirteenth_stroke","title":"The Thirteenth Stroke","places":[],"out":true,"from":1200,"to":360,"text":"the Bell Tower strikes once more than the hour, with no one in the tower"},{"id":"night_swimmer","title":"The Night Swimmer","places":["swimming pool"],"dark":true,"x2":"winter","text":"someone swimming lengths in the steam, the lane rope moving, and the water empty"},{"id":"walking_lantern","title":"The Walking Lantern","places":["grassy field and hills","old hut"],"dark":true,"text":"a single lantern light crossing the ridge with no one carrying it"},{"id":"breath_glass","title":"Breath on the Glass","places":["gardens"],"from":960,"to":1320,"text":"the greenhouse glass fogs from the inside around a handprint that is not {{user}}'s"},{"id":"pens_quiet","title":"When the Pens Go Quiet","places":["menagerie"],"dusk":true,"text":"every animal in the pens falls silent at once and faces the Forest"},{"id":"faraway_laugh","title":"The Faraway Laugh","places":["founder's statue and park"],"dark":true,"text":"a woman's laugh from the old trees, faint, as if far away"},{"id":"polite_walker","title":"The Polite Walker","places":[],"path":true,"dusk":true,"alone":true,"text":"footsteps behind {{user}} on the long path that stop when {{user}} stops"},{"id":"last_bed","title":"The Last Bed","places":["medical centre"],"from":1260,"to":360,"text":"the curtain round the last bed is drawn and someone breathes behind it; the ward register says the bed is empty"},{"id":"other_climber","title":"The Other Climber","places":["rooftop"],"dark":true,"text":"someone sitting on the far gable in {{user}}'s posture, wearing {{user}}'s dorm vest"},{"id":"applause","title":"The Applause","places":["club rooms"],"from":1080,"to":1380,"text":"applause from the empty upper tiers of the old amphitheatre, and one seat folded down"}]};
const AMB_LEVELS = ['empty', 'quiet', 'some people', 'busy', 'packed'];
const HAPPEN_RATE = { off: 0, rare: 0.2, normal: 0.4, often: 0.65 };
const hash32 = (...parts) => {
  let h = 2166136261;
  for (const ch of parts.join('|')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return h >>> 0;
};
const rand01 = (...parts) => hash32(...parts) / 4294967296;
const JOURNAL_ARCHIVE = 120;
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
// 1.7.4: from campaign Year 2 every date the engine writes carries its year ("Y2 M1 W1 Mon"), so the age of a line is right across
// years (<now>, Cast Sheet) and the Journal groups by year; Year 1 keeps the plain form. withYear() adds a year to a leading bare date.
const yPre = W => ((W.Year || 1) > 1 ? `Y${W.Year} ` : '');
const stamp = W => `${yPre(W)}M${W.Month} W${W.Week} ${W.Day} ${W.Time}`;
const withYear = (s, Y) => String(s).replace(/^(\[?)(M\d{1,2} W[1-4]\b)/, `$1Y${Y} $2`);
const eventsOn = W => EVENTS.filter(e => e.m === W.Month && e.w === W.Week && e.d.includes(W.Day));
const pctOf = (v, max) => (max > 0 ? (v / max) * 100 : 0);
const num = (v, d = 0) => { const x = Number(v); return Number.isFinite(x) ? x : d; };
const dstamp = W => `${yPre(W)}M${W.Month} W${W.Week} ${W.Day}`;
// Parses a due/until text written by the AI ("M2 W1 Tue 14:00", "Month 3 Week 2", "Fri 18:00", "tomorrow 9am", "M4") into an
// absolute minute, relative to the current world time W. Missing parts: day -> Sunday of that week (or the next such weekday),
// week -> week 4 when only a month is given, time -> 23:59. Returns -1 when nothing date-like is found.
function parseWhen(str, W, absNow) {
  const s = String(str || '');
  const m = s.match(/\b(?:M|Month\s*)(\d{1,2})\b/i), w = s.match(/\b(?:W|Week\s*)([1-4])\b/i);
  const d = s.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:s|[a-z]*day)?\b/i);   // not \"Month\"
  const t = s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || s.match(/\b(\d{1,2}):(\d{2})\b/);
  const rel = s.match(/\b(today|tonight|tomorrow)\b/i);
  // 1.11.1 (bug hunt): parts of the day ("by noon", "Sat morning"), "in two days", "next week" and a year ("Y2 M1 W1 Mon")
  const tw = s.match(/\b(noon|midday|midnight|morning|afternoon|evening)\b/i);
  const inN = s.match(/\bin\s+(a|an|one|two|three|four|five|six|seven|\d{1,2})\s+(days?|weeks?)\b/i), nextWk = /\bnext week\b/i.test(s);
  const y = s.match(/\bY(\d{1,2})\b/);
  if (!m && !w && !d && !t && !rel && !tw && !inN && !nextWk) return -1;
  let hh = 23, mm = 59;
  if (t) { hh = +t[1] % 24; mm = +(t[2] || 0); if (t[3]) { hh = hh % 12 + (/pm/i.test(t[3]) ? 12 : 0); } }
  else if (tw) [hh, mm] = { noon: [12, 0], midday: [12, 0], midnight: [23, 59], morning: [9, 0], afternoon: [15, 0], evening: [19, 0] }[tw[1].toLowerCase()];
  else if (rel && /tonight/i.test(rel[1])) { hh = 21; mm = 0; }
  const dayStart = Math.floor(absNow / DAY_MIN) * DAY_MIN;
  if (inN && !m && !w && !d) {
    const n = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 }[inN[1].toLowerCase()] || +inN[1];
    return dayStart + n * (/^week/i.test(inN[2]) ? 7 : 1) * DAY_MIN + hh * 60 + mm;
  }
  if (nextWk && !m && !w) {                                    // next week: that weekday of it, else by its Sunday
    const mon = dayStart + (7 - DAYS.indexOf(W.Day)) * DAY_MIN;
    return mon + (d ? DAYS.indexOf(d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase()) : 6) * DAY_MIN + hh * 60 + mm;
  }
  if (rel && !m && !w && !d) return dayStart + (/tomorrow/i.test(rel[1]) ? DAY_MIN : 0) + hh * 60 + mm;
  if (!m && !w) {                                              // weekday only: this one or the next one
    if (!d) return dayStart + hh * 60 + mm;
    const want = DAYS.indexOf(d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase()), now = DAYS.indexOf(W.Day);
    let add = (want - now + 7) % 7; const at = dayStart + add * DAY_MIN + hh * 60 + mm;
    return add === 0 && at < absNow - 12 * 60 ? at + 7 * DAY_MIN : at;
  }
  const M = m ? _.clamp(+m[1], 1, 12) : W.Month, Wk = w ? +w[1] : (m ? 4 : W.Week);
  const Dy = d ? d[1][0].toUpperCase() + d[1].slice(1, 3).toLowerCase() : 'Sun';
  let abs = toAbs({ Year: y ? Math.max(1, +y[1]) : W.Year, Month: M, Week: Wk, Day: Dy, Time: `${pad(hh)}:${pad(mm)}` });
  if (y) return abs;                                           // a written year is taken as it is
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
  return `${T.Year !== fromAbs(absNow).Year ? `Y${T.Year} ` : ''}M${T.Month} W${T.Week} ${T.Day}${tm}`;
}
const capRecord = (obj, max, dropFirst) => {                   // drop the oldest keys (insertion order), preferring dropFirst(v)
  let keys = Object.keys(obj || {}); if (keys.length <= max) return;
  const order = dropFirst ? [...keys.filter(k => dropFirst(obj[k])), ...keys.filter(k => !dropFirst(obj[k]))] : keys;
  for (const k of order.slice(0, keys.length - max)) delete obj[k];
};

function periodOf(W, evs) {
  const [h] = W.Time.split(':').map(Number);
  const tt = timetableFor(W);
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
  // 1.30.2 (owner playtest): on a day without classes (Entrance Event, breaks, lockdown) nothing is "before" or "after" classes
  else if (suspended && p === 'Morning, before classes') p = 'Morning, no classes today';
  else if (suspended && p === 'After classes') p = 'Afternoon, no classes today';
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
  const start = evs.map(e => curfewHour(e, W.Day)).find(Boolean) || 20;
  return h >= start || h < 7 ? `CURFEW (${start}:00-07:00): students must be in their own dorms` : '';
}

// 1.3.4 (owner): the next thing on today's schedule, for the bracelet ($ui.next): an event's timed item ("09:00 sorting at the
// Arbiter Stone…", "dusk (about 17:00): …"), a class period, curfew. Nothing left today -> null.
function nextUp(W, evs, S) {
  const now = hm(W.Time); if (now == null) return null;
  const items = [], cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  for (const e of evs) for (const part of String(schedOf(e, W.Day) || '').split(/;\s+/)) {
    const p = part.trim(); let m = /^(\d{1,2}):(\d{2})(?:\s*[–-]\s*(\d{1,2}):(\d{2}))?\s+(.+)$/.exec(p);
    if (m) { items.push({ at: +m[1] * 60 + +m[2], what: cap(m[5]), kind: 'event' }); continue; }
    m = /^(.*?)\(about (\d{1,2}):(\d{2})\):?\s*(.*)$/.exec(p);
    if (m) items.push({ at: +m[2] * 60 + +m[3], what: cap((m[4] || m[1]).trim()), kind: 'event' });
  }
  const tt = timetableFor(W), stop = evs.some(e => e.noclass || e.home || e.lockdown || e.away);
  if (tt && !stop) [8, 10, 13].forEach((h, i) => items.push({ at: h * 60, what: String(tt[i]).replace(/\s*\[[MD]\]/g, ''), kind: /^(Study Hall|Clubs)/.test(tt[i]) ? 'club' : 'class' }));
  const noCurfew = evs.some(e => e.lockdown || e.home || (e.nocurfew && W.Day === e.d[0])) || /^Away/.test(W._Curfew || '');
  if (!noCurfew) items.push({ at: (evs.map(e => curfewHour(e, W.Day)).find(Boolean) || 20) * 60, what: 'Curfew: back to your dorm', kind: 'curfew' });
  const next = items.filter(x => x.at > now).sort((a, b) => a.at - b.at || (a.kind === 'event' ? -1 : b.kind === 'event' ? 1 : 0))[0];
  return next ? { at: `${pad(Math.floor(next.at / 60))}:${pad(next.at % 60)}`, what: next.what, kind: next.kind } : null;
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
// No repeat of the previous two days' happening. 1.16.1 (audit B3): "previous" means what those days actually got, so the year is
// chained from its first day (Month 12 is the holiday, with no happenings, so a year never carries one over) and cached.
const HAPY = new Map();
function happeningOn(seed, dayNo, rate, wxm) {
  const Y = Math.floor(dayNo / YEAR_DAYS), key = `${seed}|${Y}|${rate}|${wxm}`;
  let arr = HAPY.get(key);
  if (!arr) {
    arr = [];
    for (let i = 0; i < YEAR_DAYS; i++) arr.push(rawHappening(seed, Y * YEAR_DAYS + i, rate, arr.slice(-2).filter(Boolean).map(h => h.id), wxm));
    if (HAPY.size > 8) HAPY.clear();
    HAPY.set(key, arr);
  }
  return arr[dayNo - Y * YEAR_DAYS] || null;
}

// ---- 1.1.0 weather (spec §4): seasons, sky per block, wind, rare weather, °C. Pure functions of (seed, day): swipe-safe. ----
// 1.9.4 (playtest Batch 4): the academic year opens in spring. One label per season; 'Autumn' is the internal and displayed name.
const SEASONS = ['Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter', 'Winter', 'Winter'];   // by Month-1
const SKY = ['Clear', 'Cloudy', 'Overcast', 'Fog', 'Rain', 'Storm'];
const WX_BASE = { Winter: [25, 20, 25, 10, 18, 2], Spring: [30, 25, 15, 8, 20, 2], Summer: [50, 22, 8, 3, 12, 5], Autumn: [28, 22, 20, 12, 16, 2] };
const WX_BLOCK = [{ Fog: 2, Storm: 0.5 }, { Fog: 0.3, Storm: 1.8 }, {}];   // morning, afternoon, night
const WX_TRANS = { Clear: { Clear: 2, Cloudy: 1.2, Overcast: 0.6, Rain: 0.4, Storm: 0.6 }, Cloudy: { Cloudy: 1.4, Overcast: 1.3 },
  Overcast: { Overcast: 1.5, Rain: 2, Clear: 0.5 }, Fog: { Clear: 1.5, Cloudy: 1.3, Fog: 0.4 }, Rain: { Rain: 1.8, Overcast: 1.5, Storm: 1.3, Clear: 0.4 },
  Storm: { Rain: 2, Overcast: 1.5, Storm: 0.5 } };
const WX_MEAN = [9, 12, 15, 18, 21, 22, 19, 14, 9, 4, 1, 1];   // monthly mean °C (1.9.4: rebaselined for the spring start)
const BLOCKS = ['morning', 'afternoon', 'night'], BLOCK_T = [-2, 4, -4];
const FC_NEAR = { Clear: ['Cloudy'], Cloudy: ['Clear', 'Overcast', 'Fog'], Overcast: ['Cloudy', 'Rain'], Fog: ['Cloudy'], Rain: ['Overcast', 'Storm'], Storm: ['Rain'] };
const FC_TRUE = 75;            // Divination Society forecast: d100 <= 75 -> the true sky (owner: 70-80%)
const d100 = (...p) => hash32(...p) % 100 + 1;
const tempLabel = t => (t <= 0 ? 'freezing' : t <= 7 ? 'cold' : t <= 14 ? 'cool' : t <= 21 ? 'mild' : t <= 27 ? 'warm' : 'hot');
// night belongs to the day it starts on: 03:00 is the night block of the previous day
const blockOf = abs => { const day = Math.floor(abs / DAY_MIN), h = Math.floor((abs - day * DAY_MIN) / 60); return h < 6 ? [day - 1, 2] : [day, h < 12 ? 0 : h < 18 ? 1 : 2]; };
function wxRollDay(seed, day, prev) {                          // prev = the previous block ({sky, wind}) or null
  const P = dayParts(day), season = SEASONS[P.Month - 1];
  // 1.30.3 (owner): on a special occasion (data/calendar.json "fair": the Entrance Event, festivals, competitions, dorm days,
  // Graduation…) the weather roll is suspended: clear and calm all day and night; the temperature still follows the season
  const fair = eventsOn(P).some(e => e.fair);
  const heat = !fair && season === 'Summer' && d100(seed, day, 'heat') >= 98;   // heatwave: the whole day clear, +8 °C
  const tv = hash32(seed, day, 'tv') % 7 - 3, blocks = [];
  for (let b = 0; b < 3; b++) {
    let sky = 'Clear';
    if (!heat && !fair) {
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
      if (season === 'Winter' && temp <= 3) snow = d100(seed, day, b, 'snow') <= (P.Month === 10 ? 60 : 70) + (b !== 1 ? 15 : 0);
    }
    const th = 93 - (b === 1 ? 5 : 0) - (season === 'Spring' || season === 'Autumn' ? 4 : 0) - (sky === 'Rain' ? 6 : 0) - (prev && prev.wind ? 15 : 0) + (sky === 'Clear' ? 3 : 0);
    const wr = d100(seed, day, b, 'wind');
    let wind = fair ? '' : wr >= 100 ? 'gale' : wr >= th ? 'windy' : '';
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
  return { season, blocks, fair };
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
    // 1.30.3: a special occasion's clear sky is forecast right
    if (!D.fair && d100(seed, day, b, 'fc') > FC_TRUE) { const nb = FC_NEAR[sky]; sky = nb[hash32(seed, day, b, 'fcn') % nb.length]; }
    const t = bk.temp - (bk.rare === 'heatwave' ? 8 : 0) + (bk.rare === 'blizzard' ? 6 : 0);
    return { sky, text: sky === 'Rain' && D.season === 'Winter' && t <= 3 ? 'snow' : sky.toLowerCase(), label: tempLabel(t) };
  });
}
const wxBad = bk => !!bk && (bk.sky === 'Rain' || bk.sky === 'Storm');                              // rain, snow or storm
const wxHeavy = bk => !!bk && (bk.sky === 'Storm' || bk.rain === 'heavy' || bk.rare === 'blizzard' || bk.rare === 'hail');
// winter flu wave: 1-2 a year in Months 10-11 (Month 12 is the holiday), 5 days each, seeded
const FLU_FROM = 9 * 28;   // Month 10, Week 1
function fluOn(seed, day) {
  const Y = Math.floor(day / YEAR_DAYS), doy = day - Y * YEAR_DAYS;
  if (doy < FLU_FROM || doy >= FLU_FROM + 56) return false;
  for (let k = 0, n = 1 + hash32(seed, Y, 'flu') % 2; k < n; k++) { const st = FLU_FROM + hash32(seed, Y, k, 'flus') % 51; if (doy >= st && doy < st + 5) return true; }
  return false;
}
// outdoor places (spec §4.8; generated by gen_engine from data/locations.json) and weather gear from Bag item names
const OUTDOOR = ["archery range", "boathouse and lake", "broken statue", "combat grounds", "courtyards", "fishing house", "forest", "forest clearing", "founder's statue and park", "founders statue and park", "gardens", "grassy field and hills", "menagerie", "observation tower", "rooftop", "sports field", "swimming pool", "willow island"];
const isOutdoor = loc => { const p = placeOf(loc).toLowerCase(); return !!p && OUTDOOR.some(c => p === c || p.startsWith(c + ' ') || p.startsWith(c + ',')); };
const GEAR = { umbrella: /umbrella/i, waterproof: /waterproof|oilskin|rain cloak|raincoat/i, warm: /wool(?! and needles)|scarf|winter cloak|mittens/i, sun: /sun hat|straw hat/i };
// 1.9.5 (playtest Batch 5): shop items with an effect (data/shop.json gear / use, by lowercase name); gear also by exact item name,
// and a used charm's timed protection (wxs.buff: { kind: until abs minute })
const SHOP_FX = {"umbrella":{"gear":"umbrella"},"oilskin rain cloak":{"gear":"waterproof"},"wool scarf and mittens":{"gear":"warm"},"lined winter cloak":{"gear":"warm"},"straw sun hat":{"gear":"sun"},"hot spiced tea":{"use":{"clears":["Chilled"]}},"iced fruit cooler":{"use":{"clears":["Overheated"]}},"iced coffee":{"use":{"clears":["Overheated"]}},"hot chocolate with cream":{"use":{"clears":["Chilled"]}},"rain-ward charm":{"use":{"buff":"waterproof","mins":180}},"quick-dry powder":{"use":{"clears":["Soaked"]}},"cooling charm":{"use":{"buff":"sun","mins":240}},"ember pouch":{"use":{"buff":"warm","mins":240}},"elderflower cold syrup":{"use":{"cure":"Head cold"}},"blossom honey cake":{"use":{"stamina":10}},"spiced apple turnover":{"use":{"stamina":10}},"roasted chestnuts":{"use":{"clears":["Chilled"]}},"salted lemon water":{"use":{"clears":["Overheated"],"stamina":10}},"linen summer shirt":{"gear":"sun"},"fleece-lined boots":{"gear":"warm"},"mulled apple cider":{"use":{"clears":["Chilled"],"stamina":5}},"warming draught":{"use":{"clears":["Chilled"],"buff":"warm","mins":240}},"cooling draught":{"use":{"clears":["Overheated"],"buff":"sun","mins":240}},"cold remedy":{"use":{"cure":"Head cold"}},"healing draught":{"use":{"heal":"minor"}},"vigour tonic":{"use":{"stamina":20}},"strong healing draught":{"use":{"heal":"moderate_to_minor"}},"fire flask":{"use":{"fitting":"fire"}},"bottled cold":{"use":{"fitting":"cold"}},"warmth rune":{"use":{"buff":"warm","mins":240}},"rain-ward talisman":{"use":{"buff":"waterproof","mins":180}},"light rune":{"use":{"fitting":"dark"}},"ward talisman":{"use":{"fitting":"curse or hex"}},"enchant warm":{"gear":"warm"},"enchant waterproof":{"gear":"waterproof"},"honey buns":{"use":{"stamina":10}},"butter cookies":{"use":{"stamina":10}},"hearty stew pot":{"use":{"stamina":15}},"knitted scarf":{"gear":"warm"},"knitted winter set":{"gear":"warm"}};
const SHOP_PRICE = {"sunfizz":[[8,"Commissary"],[8,"The Mall — store"]],"firetooth (tin)":[[12,"Commissary"]],"notebook":[[5,"Commissary"]],"pen nibs and ink":[[6,"Commissary"]],"printed class textbook":[[45,"Commissary"]],"satchel":[[70,"Commissary"]],"spare uniform set":[[120,"Commissary"]],"common reagent bundle":[[30,"Commissary"]],"basic practice focus":[[250,"Commissary"]],"rare reagent":[[350,"Commissary"]],"special order":[[null,"Commissary"]],"umbrella":[[25,"Commissary"]],"oilskin rain cloak":[[90,"Commissary"]],"bakery roll":[[15,"The Mall — bakery"]],"star cookie":[[8,"The Mall — bakery"]],"café drink and pastry":[[25,"The Mall — cafés and tea houses"]],"restaurant meal":[[45,"The Mall — restaurants"]],"private dining (second floor)":[[150,"The Mall — private dining"]],"quality focus":[[4000,"The Mall — store"]],"tailoring alteration":[[40,"Tailor's Row"]],"barber":[[20,"The Mall — services"]],"laundry service (per load)":[[10,"The Mall — services"]],"practice studio or music room (per hour)":[[15,"The Mall — studios"]],"game hall (per hour)":[[10,"The Mall — game halls"]],"wool scarf and mittens":[[35,"The Mall — store"]],"lined winter cloak":[[120,"The Mall — store"]],"straw sun hat":[[30,"The Mall — store"]],"hot spiced tea":[[12,"The Mall — cafés and tea houses"]],"iced fruit cooler":[[10,"The Mall — cafés and tea houses"]],"the vigil":[[60,"Nightwell"]],"house coffee":[[12,"Nightwell"]],"honey cream coffee":[[16,"Nightwell"]],"spiced milk tea":[[14,"Nightwell"]],"iced coffee":[[14,"Nightwell"]],"hot chocolate with cream":[[14,"Nightwell"]],"late-night pastry":[[10,"Nightwell"]],"bag of nightwell beans":[[35,"Nightwell"]],"the oracle shell":[[40,"Merryhew's"]],"itching charm":[[15,"Merryhew's"]],"voice-changing sweets (bag)":[[12,"Merryhew's"]],"illusion vermin (box)":[[25,"Merryhew's"]],"screaming box":[[35,"Merryhew's"]],"colour-change hair sweet":[[18,"Merryhew's"]],"confetti ambush card":[[10,"Merryhew's"]],"secret fools day kit":[[60,"Merryhew's"]],"private booth (per hour)":[[30,"The Snug"]],"set meal":[[30,"The Snug"]],"pot of tea for the booth":[[12,"The Snug"]],"stew and fresh bread":[[22,"The Snug"]],"sweet course":[[14,"The Snug"]],"evening booth (18:00 to curfew)":[[90,"The Snug"]],"ardenne case":[[1500,"Ardenne (special order)"]],"ardenne focus":[[4000,"Ardenne (special order)"]],"ardenne measuring set":[[2200,"Ardenne (special order)"]],"ardenne tuning instrument":[[2600,"Ardenne (special order)"]],"the rose in the tower":[[18,"Quillfeather's"]],"seven towers (deluxe edition)":[[30,"Quillfeather's"]],"nine rivers: field tactics":[[40,"Quillfeather's"]],"crossed blades: famous duels":[[30,"Quillfeather's"]],"songs of the oathbound":[[20,"Quillfeather's"]],"songbook of old ballads":[[16,"Quillfeather's"]],"lamps out: tales of halvard":[[18,"Quillfeather's"]],"the night student: a true account":[[6,"Quillfeather's"]],"the truth behind halvard's ghosts":[[15,"Quillfeather's"]],"halvard through the centuries":[[60,"Quillfeather's"]],"anecdotes of the old kingdom":[[35,"Quillfeather's"]],"founding of the dovecote (old edition)":[[45,"Quillfeather's"]],"what everyone knows about the founding":[[12,"Quillfeather's"]],"commentaries of saint orel (antique)":[[70,"Quillfeather's"]],"the final word on everything":[[12,"Quillfeather's"]],"fallen stars: notes on mana resonance":[[120,"Quillfeather's"]],"the noble houses, by precedence":[[50,"Quillfeather's"]],"etiquette manual":[[20,"Quillfeather's"]],"dragonchess problem book":[[25,"Quillfeather's"]],"star atlas":[[30,"Quillfeather's"]],"hand-speech for beginners":[[15,"Quillfeather's"]],"picture book for small children":[[8,"Quillfeather's"]],"old competition programmes":[[10,"Quillfeather's"]],"blank leather journal":[[25,"Quillfeather's"]],"pocket memory notebook":[[20,"Quillfeather's"]],"leather planner":[[20,"Quillfeather's"]],"plush animal":[[20,"Pennywhistle Curios"]],"goosedown pillow":[[35,"Pennywhistle Curios"]],"silver hand mirror":[[45,"Pennywhistle Curios"]],"palm crystal ball":[[60,"Pennywhistle Curios"]],"porcelain tea set":[[55,"Pennywhistle Curios"]],"music box":[[30,"Pennywhistle Curios"]],"prism charm":[[12,"Pennywhistle Curios"]],"black silk ribbons":[[10,"Pennywhistle Curios"]],"travel dragonchess set":[[60,"Pennywhistle Curios"]],"sovereigns":[[80,"Pennywhistle Curios"]],"gilt-edged playing cards":[[12,"Pennywhistle Curios"]],"vanishing-coin illusion kit":[[25,"Pennywhistle Curios"]],"juggling set":[[15,"Pennywhistle Curios"]],"rainglass":[[35,"Pennywhistle Curios"]],"everlamp, miniature":[[40,"Pennywhistle Curios"]],"hearthstone hand-warmer":[[25,"Pennywhistle Curios"]],"hooded night lamp":[[20,"Pennywhistle Curios"]],"warding amulet":[[25,"Pennywhistle Curios"]],"wishing coin":[[5,"Pennywhistle Curios"]],"thank-you card":[[3,"Pennywhistle Curios"]],"get-well hamper":[[30,"Pennywhistle Curios"]],"engraved trophy cup":[[50,"Pennywhistle Curios"]],"knight's pennon":[[20,"Pennywhistle Curios"]],"halvard pennant":[[10,"Pennywhistle Curios"]],"royal crest paperweight":[[35,"Pennywhistle Curios"]],"independence war commemorative medal":[[30,"Pennywhistle Curios"]],"carved asmoday charm":[[15,"Pennywhistle Curios"]],"festival lantern set":[[18,"Pennywhistle Curios"]],"brass handbell":[[8,"Pennywhistle Curios"]],"wind-up alarm clock":[[15,"Pennywhistle Curios"]],"silver-polishing kit":[[20,"Pennywhistle Curios"]],"walnut desk tidy":[[30,"Pennywhistle Curios"]],"loaded bone dice":[[12,"Pennywhistle Curios"]],"marked deck":[[12,"Pennywhistle Curios"]],"table wine":[[25,"Barrow & Vine"]],"fine vintage":[[90,"Barrow & Vine"]],"orchard cider":[[10,"Barrow & Vine"]],"stonebrew ale (jug)":[[18,"Barrow & Vine"]],"clan firewine":[[70,"Barrow & Vine"]],"blackroot cigars":[[15,"Barrow & Vine"]],"engraved hip flask":[[40,"Barrow & Vine"]],"bouquet of stage roses":[[20,"Greenwick's"]],"cut flowers":[[12,"Greenwick's"]],"moonfern in a pot":[[45,"Greenwick's"]],"oak sapling in a pot":[[20,"Greenwick's"]],"seed packets":[[5,"Greenwick's"]],"bag of red apples":[[6,"Greenwick's"]],"carrots and fresh greens":[[5,"Greenwick's"]],"pigeon feed":[[4,"Greenwick's"]],"pruning shears":[[25,"Greenwick's"]],"precision tool roll":[[50,"The Tinker's Bench"]],"mystery clockwork (sold as seen)":[[15,"The Tinker's Bench"]],"brass golem joint set":[[90,"The Tinker's Bench"]],"glass stirring-rod set":[[15,"The Tinker's Bench"]],"whetstone and blade oil":[[20,"The Tinker's Bench"]],"armour polish kit":[[18,"The Tinker's Bench"]],"duelling gauntlets":[[40,"The Tinker's Bench"]],"fishing tackle box":[[30,"The Tinker's Bench"]],"gut guitar strings":[[12,"The Tinker's Bench"]],"tuning fork":[[10,"The Tinker's Bench"]],"steel-nib fountain pen":[[40,"The Tinker's Bench"]],"letter paper set":[[8,"The Tinker's Bench"]],"sketchbook and charcoal":[[15,"The Tinker's Bench"]],"carving knife and limewood block":[[20,"The Tinker's Bench"]],"bolt of sky silk":[[40,"The Tinker's Bench"]],"embroidery thread set":[[15,"The Tinker's Bench"]],"talisman paper stack":[[10,"The Tinker's Bench"]],"chamois lens cloth":[[5,"The Tinker's Bench"]],"pocket thermos":[[25,"The Tinker's Bench"]],"shuttered dark-lantern":[[25,"The Tinker's Bench"]],"running shoes":[[45,"The Tinker's Bench"]],"premium beast jerky":[[20,"The Tinker's Bench"]],"beast muzzle":[[15,"The Tinker's Bench"]],"vigour tonic":[[30,"The Tinker's Bench"]],"salaffian flatbread":[[6,"The Salaffian Oven"]],"salaffian spice box":[[25,"The Salaffian Oven"]],"loud silk waistcoat":[[70,"Tailor's Row"]],"formal dress coat":[[150,"Tailor's Row"]],"platform boots":[[55,"Tailor's Row"]],"ballroom shoes":[[60,"Tailor's Row"]],"bergamot cologne":[[35,"Tailor's Row"]],"kid-leather gloves":[[30,"Tailor's Row"]],"honey bun":[[6,"Commissary"]],"pocket campus map":[[5,"Commissary"]],"smoked river fish":[[6,"Commissary"]],"lavender laundry soap":[[5,"Commissary"]],"sweet bun":[[6,"The Mall — bakery"]],"sweet bamboo tea (tin)":[[14,"The Mall — cafés and tea houses"]],"silvertip tea":[[30,"The Mall — cafés and tea houses"]],"rain-ward charm":[[18,"The Tinker's Bench"]],"quick-dry powder":[[10,"The Tinker's Bench"]],"cooling charm":[[20,"The Tinker's Bench"]],"ember pouch":[[15,"The Tinker's Bench"]],"knitting wool and needles":[[15,"The Tinker's Bench"]],"paint box":[[30,"The Tinker's Bench"]],"elderflower cold syrup":[[15,"Greenwick's"]],"blossom honey cake":[[9,"The Mall — bakery"]],"spiced apple turnover":[[10,"The Mall — bakery"]],"roasted chestnuts":[[8,"The Mall — cafés and tea houses"]],"salted lemon water":[[6,"Commissary"]],"baking and cooking ingredients":[[10,"Commissary"]],"bar stock and coal":[[20,"Commissary"]],"linen summer shirt":[[45,"Tailor's Row"]],"fleece-lined boots":[[70,"Tailor's Row"]],"mulled apple cider":[[12,"The Snug"]]};
const fxOf = name => SHOP_FX[String(name || '').trim().toLowerCase().replace(/^(an?|the)\s+/, '')] || SHOP_FX[String(name || '').trim().toLowerCase().replace(/^(an?|the)\s+/, '').replace(/\s*\(.*\)$/, '')] || null;
const gearOf = (I, buff, now) => {
  const own = Object.keys(I || {}).filter(k => (I[k] && I[k].Qty) > 0), ks = own.join(' | ');
  return _.mapValues(GEAR, (rx, g) => rx.test(ks) || own.some(k => (fxOf(k) || {}).gear === g || new RegExp(`\\benchanted ${g}\\b`, 'i').test(String(I[k].Note || ''))) || ((buff || {})[g] > now));
};
const EXPO = { soaked: 'Soaked', drenched: 'Soaked', wet: 'Soaked', chilled: 'Chilled', frozen: 'Chilled', frostbitten: 'Chilled' };   // 1.9.4: /Exposure kinds
const COND = {
  Soaked: 'Wet through: rest and sleep restore half the usual stamina. Dries after an hour indoors.',
  Chilled: 'Cold to the bone: -10 stamina per hour outdoors. Warms up after an hour indoors or a hot drink.',
  Overheated: 'Too hot: -10 stamina per hour outdoors. Cools down after half an hour indoors or a cold drink.',
  'Head cold': 'Stuffy and slow: stamina capped at 80% of max until it passes or the Medical Centre treats it.',
};
// ---- 1.1.0 Features settings (spec §9): which state each feature parks when it is off (data/features.json, injected) ----
const FEATURES = [{"id":"proficiency","control":"toggle","paths":["Player._Proficiency","$eng.prof"]},{"id":"planner","control":"toggle","paths":["Commitments"],"unlock":"planner"},{"id":"notices","control":"toggle","paths":["Notices"],"unlock":"notices"},{"id":"letters","control":"toggle","paths":["Letters"],"unlock":"letters"},{"id":"mystery","control":"toggle","paths":["Clues","Mysteries"],"unlock":"mystery"},{"id":"competition","control":"toggle","paths":["Competition"],"unlock":"competition"},{"id":"projects","control":"toggle","paths":["Projects"],"unlock":"projects"},{"id":"trip","control":"toggle","paths":["Trip"],"unlock":"trip"},{"id":"battle","control":"toggle","paths":["Battle"],"unlock":"battle"},{"id":"inventory","control":"toggle","paths":["Inventory"],"unlock":"inventory"},{"id":"happenings","control":"levels","field":"happenings"},{"id":"npc_initiative","control":"toggle"},{"id":"weather","control":"levels","field":"wxfx","paths":["Player.Conditions"],"unlock":"conditions"},{"id":"class","control":"toggle"},{"id":"hooks","control":"toggle","paths":["Hooks"]},{"id":"gossip","control":"toggle"},{"id":"fortune","control":"toggle"},{"id":"attendance","control":"toggle"},{"id":"recap","control":"toggle"},{"id":"small_scenes","control":"toggle"},{"id":"ambience","control":"levels","field":"ambience"},{"id":"reminders","control":"toggle"},{"id":"study","control":"toggle"}];
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
  Player: { Profile: { Reputation: {} }, Vitals: {}, Injuries: {}, Wallet: { Points: 0, Coin: 0, Transactions: [] }, Academics: { Grades: {}, Exams: {} }, _Proficiency: {}, Conditions: {} },
  Magic: { _Techniques: {}, _Affinity: { Types: [], Dominant: '', Specialties: [], Preset: '' }, Active: {}, Casts: [], Pacts: {} },
  Hidden: { _True_magic: '', Known_by: [], Dove_attention: 0 },
  Bonds: {}, Campus_State: { Entrance_tour: { Year: 0, Guide: '', FirstYears: [] }, Council: { Candidates: { '1': { First: 'Florian', Second: 'Dante' } }, Results: {}, President: 'Irene', VicePresident: 'Caspian', PresidentElect: '', VicePresidentElect: '' }, Events: {}, Rumours: [], Location_changes: {}, NPC_status: {}, New_relations: {}, Secrets_revealed: [], Graduated: [] },
  Commitments: {}, Notices: {}, Letters: {}, Journal: [], Clues: {}, Mysteries: {},
  Competition: { Tier: '', Status: '', Placement: '', Team: [], Results: [] }, Projects: {},
  Trip: { Active: false, Destination: '', Companions: [], Note: '' }, Battle: { Active: false, Combatants: {} }, _Log: [],
  Inventory: {}, Hooks: {},   // 1.1.0
  Extras: {},   // 1.6.1
  _Perks: {}, Rep_events: [], Training: [], Practice: [], Perk_use: [],   // 1.3.0 / 1.27.0
  Exam_events: [], Tutoring: [],   // 1.15.0
};
function fillShape(o, shape) {
  for (const [k, v] of Object.entries(shape)) {
    if (o[k] === undefined || o[k] === null) o[k] = _.cloneDeep(v);
    else if (_.isPlainObject(v) && _.isPlainObject(o[k]) && Object.keys(v).length) fillShape(o[k], v);
  }
}
// 1.16.1 (audit B4): one answer to "is this NPC away?" for bonds, introductions, Rank 5 handovers, the Entrance tour, NPC
// initiative and birthday parties (each had its own list of words). A status is found by the NPC's id, alias or first word.
const AWAY_RX = /away|abroad|absent|missing|dead|confined|hospital|unconscious|expelled|unavailable|left campus|left halvard|out of town/i;
const npcStatusIn = (S, id) => {
  const N = (S.Campus_State || {}).NPC_status || {}, lo = String(id).toLowerCase();
  const k = Object.keys(N).find(x => (NPC_ALIAS[String(x).toLowerCase()] || x) === id || String(x).toLowerCase().split(/\s+/)[0] === lo);
  return k ? String(N[k] || '') : '';
};
const npcAwayIn = (S, id) => ((S.Campus_State || {}).Graduated || []).includes(id) || AWAY_RX.test(npcStatusIn(S, id));
// 1.16.1 (audit B1): Player.Profile.Club in the club list's own words ("Soccer", "soccer club" -> "Soccer Club"; "Theatre" ->
// "Theatre Troupe"), so Saturday club time is counted; a club the list does not know is kept as written
function canonClub(c) {
  const s = String(c || '').trim(), k = s.toLowerCase().replace(/^the\s+/, '').replace(/\s+/g, ' ');
  if (!k) return '';
  if (/^duel+ing club$/.test(k)) return 'Magic Duelling Club';
  const names = Object.keys(CLASS.clubs || {}), base = x => x.toLowerCase().replace(/\s+club$/, '');
  return names.find(n => n.toLowerCase() === k) || (CLASS.calias || {})[base(k)] || names.find(n => base(n) === base(k)) || s;
}
const BOND0 = { $gifts: {}, Rank: 0, Progress: 0, Trust: 50, Tension: 0, Title: '', Romance: false, Known_facts: [], Milestones: [], Last_seen: '' };
// Source helpers for the approved mood / gifts release, injected by gen_engine.py.
const NPC_MOODS = {"Irene":{"loves":["Clear"],"hates":["Storm"],"clock":"M","exams":1,"trials":0,"reason":"cleans her room every morning, good grades"},"Caspian":{"loves":["Clear"],"hates":["Storm"],"clock":"","exams":0,"trials":0,"reason":"outdoor festivals he runs; storms cancel them"},"Etnie":{"loves":["Snow"],"hates":["Storm"],"clock":"","exams":0,"trials":0,"reason":"a dog in snow; thunder"},"Royhan":{"loves":["Cool"],"hates":["Hot","Heatwave"],"clock":"M","exams":0,"trials":0,"reason":"farm-raised; steady"},"Sophia":{"loves":["Rain","Storm"],"hates":["Hot","Heatwave"],"clock":"","exams":0,"trials":1,"reason":"rain means water everywhere; battle-hungry"},"Gareth":{"loves":["Clear"],"hates":[],"clock":"M","exams":1,"trials":1,"reason":"winning"},"Ruby":{"loves":["Clear","Mild"],"hates":["Storm"],"clock":"","exams":0,"trials":-1,"reason":"hates fighting of any kind"},"Lenna":{"loves":["Rain"],"hates":["Hot"],"clock":"N","exams":-1,"trials":0,"reason":"naps; mornings are the enemy; courageous"},"Saffi":{"loves":["Clear","Warm"],"hates":["Rain"],"clock":"M","exams":-1,"trials":1,"reason":"a cat and water; can't sit still in class, lives to move"},"Kanae":{"loves":["Clear night"],"hates":["Overcast","Fog"],"clock":"N","exams":1,"trials":0,"reason":"stars from the Observation Tower; top grades"},"Idris":{"loves":["Clear by day ≥15 °C"],"hates":["Cold","Freezing","Windy","Gale"],"clock":"","exams":0,"trials":0,"reason":"cold-blooded"},"Tilly":{"loves":["Fog","Storm"],"hates":[],"clock":"N","exams":0,"trials":1,"reason":"ghost weather; walks toward danger"},"Dante":{"loves":[],"hates":[],"clock":"M","exams":0,"trials":1,"reason":"order under pressure"},"Florian":{"loves":["Clear"],"hates":["Rain"],"clock":"N","exams":0,"trials":1,"reason":"being looked at, winning"},"Aiden":{"loves":["Fog"],"hates":[],"clock":"N","exams":1,"trials":1,"reason":"curfew routes; exam and contest weeks are betting season"},"Caralynn":{"loves":["Clear"],"hates":["Rain","Storm","Windy","Gale"],"clock":"","exams":-1,"trials":1,"reason":"the spotlight; her hair"},"Zara":{"loves":["Cold","Snow"],"hates":["Hot","Windy","Gale"],"clock":"","exams":0,"trials":-1,"reason":"sitting by a fire; being stared at"},"Percival":{"loves":["Storm","Gale"],"hates":[],"clock":"M","exams":-1,"trials":1,"reason":"heroic weather; a chance for glory"},"Trixie":{"loves":["Clear","Snow","Windy"],"hates":["Rain"],"clock":"M","exams":-1,"trials":1,"reason":"outdoor shows; sitting still; excitement"},"Vera":{"loves":["Storm"],"hates":[],"clock":"N","exams":0,"trials":0,"reason":"lightning; one tiny experiment all night"},"Castor":{"loves":["Fog","Overcast"],"hates":[],"clock":"M","exams":0,"trials":0,"reason":"unnoticed; the Gardens early"},"Alyssa":{"loves":["Clear"],"hates":[],"clock":"M","exams":0,"trials":0,"reason":"quiet mornings"},"Linus":{"loves":["Clear"],"hates":[],"clock":"","exams":0,"trials":1,"reason":"brackets and matchups"},"Maple":{"loves":["Clear","Mild"],"hates":["Storm","Gale"],"clock":"M","exams":0,"trials":-1,"reason":"climbing trees; fights, and Sobek near them"},"Nerys":{"loves":["Fog"],"hates":[],"clock":"","exams":0,"trials":0,"reason":"\"nobody there\"; no feelings about the rest"},"Hadrian":{"loves":["Mild"],"hates":["Rain","Cold"],"clock":"","exams":1,"trials":-1,"reason":"a warm coat, being right; risk"},"Wren":{"loves":["Clear"],"hates":["Fog"],"clock":"M","exams":0,"trials":0,"reason":"the dock at dawn; bad light defeats lip-reading"},"Tsubaki":{"loves":["Clear night","Snow"],"hates":["Fog"],"clock":"M","exams":-1,"trials":1,"reason":"open sky; lectures she can't follow; a good opponent"},"Gavlan":{"loves":[],"hates":["Storm"],"clock":"M","exams":0,"trials":1,"reason":"thunder and war nightmares; an old officer under pressure"},"Yvette":{"loves":[],"hates":["Fog"],"clock":"","exams":0,"trials":-1,"reason":"paranoid"},"Krieg":{"loves":["Fog"],"hates":[],"clock":"M","exams":0,"trials":1,"reason":"doubled patrols in fog; the Thinning is his element"},"Milena":{"loves":["Clear","Warm"],"hates":["Cold","Snow","Gale"],"clock":"M","exams":0,"trials":0,"reason":"a southerner from Salaffos"},"Baelin":{"loves":["Clear"],"hates":[],"clock":"M","exams":0,"trials":0,"reason":"rest-day mornings at the Elder Oak; enormous patience"},"Layla":{"loves":["Rain"],"hates":[],"clock":"","exams":0,"trials":0,"reason":"archive days and tea"},"Vallie":{"loves":["Storm","Snow","Gale"],"hates":[],"clock":"N","exams":0,"trials":1,"reason":"always happy to test her strength"},"Rei":{"loves":["Fog"],"hates":["Heatwave"],"clock":"N","exams":0,"trials":1,"reason":"the Rooftop at hours nobody is awake; zero drama when it matters"},"Kuroo":{"loves":[],"hates":[],"clock":"N","exams":0,"trials":1,"reason":"Card Club evenings; the moment a student finally tries"},"Mimosa":{"loves":["Rain","Overcast"],"hates":["Clear","Hot"],"clock":"N","exams":0,"trials":-1,"reason":"small, dim, enclosed; a room full of eyes"},"Tristan":{"loves":[],"hates":[],"clock":"","exams":0,"trials":0,"reason":"nothing rattles him"},"Althair":{"loves":["Storm","Gale"],"hates":[],"clock":"","exams":0,"trials":1,"reason":"relentlessly cheerful, never Bad from weather; a good game"},"Ezrel":{"loves":[],"hates":[],"clock":"","exams":0,"trials":0,"reason":"always Normal (apathetic)"},"Ottavio":{"loves":["Rain","Fog"],"hates":[],"clock":"M","exams":0,"trials":0,"reason":"the fishing dock at dawn"},"Caine":{"loves":["Overcast"],"hates":[],"clock":"","exams":0,"trials":0,"reason":"silence"},"Bobby":{"loves":["Storm"],"hates":[],"clock":"","exams":0,"trials":0,"reason":"storms mean repair jobs"}};
const GIFT_PREFS = {"_note":"Owner-approved 2026-09-27. Exact catalog names and case-insensitive category regexes; contextual unknowns fall back to narrator Gift.","npcs":{"Irene":{"birthday":"M11 W3 Thu","text":{"loved":"Honey bun. Halvard Through the Centuries (leather-bound). Steel-nib fountain pen.","liked":"Halvard pennant. Walnut desk tidy. Tea.","disliked":"Romantic gifts (she is afraid of intimacy). Gaudy jewellery.","hated":"Contraband: prank goods, The Vigil, anything smuggled past curfew."},"items":{"loved":["Honey bun","Halvard Through the Centuries","Steel-nib fountain pen"],"liked":["Halvard pennant","Walnut desk tidy"],"disliked":[],"hated":["The Vigil"]},"patterns":{"liked":"\\btea\\b","disliked":"romantic|gaudy.*jewel","hated":"contraband|prank|smuggl|the vigil"}},"Caspian":{"birthday":"M10 W3 Sat","text":{"loved":"Carved Asmoday charm. Chamois lens cloth (he wears his own thin).","liked":"Festival lantern set. A Snug meal. Gossip, written down.","disliked":"Weapons. Anything that takes a side in a quarrel.","hated":"Anything of Dove issue (a Dove seal, a Dovecote form, manacles)."},"items":{"loved":["Carved Asmoday charm","Chamois lens cloth"],"liked":["Festival lantern set"],"disliked":[],"hated":[]},"patterns":{"liked":"snug.*meal|written.*gossip|gossip.*written","disliked":"weapon|takes? a side|quarrel","hated":"dove.*(?:issue|seal)|dovecote form|manacles"}},"Etnie":{"birthday":"M2 W2 Sat","text":{"loved":"Something {{user}} has worn (the scent). Black silk ribbons. Food, any, in quantity.","liked":"Everything else from {{user}}.","disliked":"—","hated":"A gift that means goodbye or distance (a farewell present, a thank-you card)."},"items":{"loved":["Black silk ribbons"],"liked":[],"disliked":[],"hated":["thank-you card"]},"patterns":{"loved":"(?:user|you|player|giver).*(?:worn|scent)|worn.*(?:user|you|player|giver)|food.*(?:quantity|large)|large.*food","hated":"farewell|goodbye|distance|thank.you card"}},"Royhan":{"birthday":"M5 W1 Sat","text":{"loved":"Rare reagent. Bag of Nightwell beans. Dragonchess problem book.","liked":"Glass stirring-rod set. Plain, filling food.","disliked":"Luxuries (Ardenne goods, private dining): it feels like charity.","hated":"Points or money given outright."},"items":{"loved":["Rare reagent","Bag of Nightwell beans","Dragonchess problem book"],"liked":["Glass stirring-rod set"],"disliked":[],"hated":[]},"patterns":{"liked":"plain.*food|filling.*food","disliked":"luxur|ardenne|private dining","hated":"(?:points|money|cash).*(?:outright|gift)|^(?:points|money|cash)$"}},"Sophia":{"birthday":"M4 W3 Tue","text":{"loved":"Nine Rivers: Field Tactics. Crossed Blades: Famous Duels. Rainglass.","liked":"Hearty meat dishes. Duelling gauntlets.","disliked":"Cute things, flowers, sweets. Fashion and jewellery.","hated":"Get-well hamper, or anything that \"handles\" her. Anything celebrating Gareth."},"items":{"loved":["Nine Rivers: Field Tactics","Crossed Blades: Famous Duels","Rainglass"],"liked":["Duelling gauntlets"],"disliked":[],"hated":["Get-well hamper"]},"patterns":{"liked":"meat|steak","disliked":"cute|plush|flower|sweet|bun|cake|chocolate|fashion|jewel","hated":"handles her|celebrat.*gareth|gareth.*(?:trophy|portrait)"}},"Gareth":{"birthday":"M5 W2 Wed","text":{"loved":"Sovereigns (imported strategy game). Dragonchess problem book.","liked":"Engraved trophy cup. Tea. Books.","disliked":"Consolation gifts; anything second-place (a silver rosette, a runner-up ribbon).","hated":"Anything that shows {{user}} has seen through him (a gift about his battle self)."},"items":{"loved":["Sovereigns","Dragonchess problem book"],"liked":["Engraved trophy cup"],"disliked":[],"hated":[]},"patterns":{"liked":"\\btea\\b|\\bbooks?\\b","disliked":"consolation|second.place|silver rosette|runner.up","hated":"battle self|seen through"}},"Ruby":{"birthday":"M3 W3 Mon","text":{"loved":"Gut guitar strings. Sweets. Songbook of old ballads.","liked":"Almost anything given kindly. Carrots and fresh greens.","disliked":"Weapons and fighting gear.","hated":"A gift that picks a side (a dorm-rivalry badge, a team favour)."},"items":{"loved":["Gut guitar strings","Songbook of old ballads"],"liked":["Carrots and fresh greens"],"disliked":[],"hated":[]},"patterns":{"loved":"sweet|bun|cake|candy|chocolate","liked":"given kindly","disliked":"weapon|fighting gear|duelling gauntlets|blade oil","hated":"dorm.rivalry badge|team favour|picks? a side"}},"Lenna":{"birthday":"M6 W1 Sun","text":{"loved":"The Rose in the Tower (romance novel). Plush animal. Goosedown pillow.","liked":"Good food. Premium beast jerky (for the Menagerie).","disliked":"Wind-up alarm clock. Weapons.","hated":"Anything from the Doves, or about her past."},"items":{"loved":["The Rose in the Tower","Plush animal","Goosedown pillow"],"liked":["Premium beast jerky"],"disliked":["Wind-up alarm clock"],"hated":[]},"patterns":{"liked":"good food|good meal","disliked":"weapon","hated":"\\bdoves?\\b|her past"}},"Saffi":{"birthday":"M6 W3 Thu","text":{"loved":"Running shoes. Smoked river fish.","liked":"After-training snacks. Something for Lenna.","disliked":"Textbooks. Etiquette manual.","hated":"—"},"items":{"loved":["Running shoes","Smoked river fish"],"liked":[],"disliked":["Etiquette manual"],"hated":[]},"patterns":{"liked":"after.training snack|for lenna","disliked":"textbook"}},"Kanae":{"birthday":"M1 W3 Thu","text":{"loved":"Seven Towers (deluxe edition). Palm crystal ball. Porcelain tea set.","liked":"Sweets arranged beautifully. Silver hand mirror. Star atlas.","disliked":"The Oracle Shell (she calls it nonsense in public). Plain, ugly things.","hated":"Anything from or recommended by Caralynn."},"items":{"loved":["Seven Towers","Palm crystal ball","Porcelain tea set"],"liked":["Silver hand mirror","Star atlas"],"disliked":["The Oracle Shell"],"hated":[]},"patterns":{"liked":"sweet.*(?:beautiful|arranged)|beautiful.*sweet","disliked":"plain|ugly","hated":"caralynn"}},"Idris":{"birthday":"M7 W1 Tue","text":{"loved":"Moonfern in a pot. Hearthstone hand-warmer.","liked":"A book to read in the Gardens. Pruning shears. Anything expensive (he can resell it).","disliked":"Cheap sentimental trinkets. Iced drinks.","hated":"Anything from the Doves."},"items":{"loved":["Moonfern in a pot","Hearthstone hand-warmer"],"liked":["Pruning shears"],"disliked":[],"hated":[]},"patterns":{"liked":"book.*gardens|expensive","disliked":"cheap.*trinket|iced.*drink","hated":"\\bdoves?\\b"}},"Tilly":{"birthday":"M10 W2 Thu","text":{"loved":"Lamps Out: Tales of Halvard. The Night Student: A True Account. Shuttered dark-lantern.","liked":"Canteen food. Lavender laundry soap. A fat notebook for \"Halvard Unexplained\".","disliked":"Anything \"for her safety\" (a helmet, a warding charm).","hated":"The Truth Behind Halvard's Ghosts."},"items":{"loved":["Lamps Out: Tales of Halvard","The Night Student: A True Account","Shuttered dark-lantern"],"liked":["Lavender laundry soap"],"disliked":[],"hated":["The Truth Behind Halvard's Ghosts"]},"patterns":{"liked":"canteen.*food|halvard unexplained","disliked":"for her safety|helmet|warding charm"}},"Dante":{"birthday":"M11 W2 Tue","text":{"loved":"Precision tool roll. Something for the younger students he looks after.","liked":"Tea. Shuttered dark-lantern. A Snug meal.","disliked":"Prank goods. Flashy luxuries.","hated":"Anything stolen or bought with a lie."},"items":{"loved":["Precision tool roll"],"liked":["Shuttered dark-lantern"],"disliked":[],"hated":[]},"patterns":{"loved":"for.*younger students","liked":"\\btea\\b|snug.*meal","disliked":"prank|flashy.*luxur","hated":"stolen|bought with a lie"}},"Florian":{"birthday":"M9 W4 Tue","text":{"loved":"Ardenne goods. Premium beast jerky (for Hades). Fine vintage.","liked":"Bergamot cologne. Silver hand mirror.","disliked":"Cheap or homemade things (he is polite about it).","hated":"Pity or consolation gifts. Anything that says third."},"items":{"loved":["Premium beast jerky","Fine vintage"],"liked":["Bergamot cologne","Silver hand mirror"],"disliked":[],"hated":[]},"patterns":{"loved":"ardenne","disliked":"cheap|homemade|handmade","hated":"pity|consolation|\\bthird\\b"}},"Aiden":{"birthday":"M9 W2 Mon","text":{"loved":"Merryhew's goods. Marked deck. Loaded bone dice.","liked":"Things he can sell on. Sweets. Games.","disliked":"Etiquette manual.","hated":"Anything paid for with a welched bet."},"items":{"loved":["Marked deck","Loaded bone dice"],"liked":[],"disliked":["Etiquette manual"],"hated":[]},"patterns":{"loved":"merryhew|prank goods","liked":"resell|sell on|sweet|bun|cake|candy|game","hated":"welched bet"}},"Caralynn":{"birthday":"M8 W3 Mon","text":{"loved":"Ardenne goods. Bouquet of stage roses. A portrait of her.","liked":"Silver hand mirror. Jewellery. Songbook of old ballads.","disliked":"Plain, practical gifts. Anything that compares her to someone.","hated":"Platform boots, or anything about height."},"items":{"loved":["Bouquet of stage roses"],"liked":["Silver hand mirror","Songbook of old ballads"],"disliked":[],"hated":["Platform boots"]},"patterns":{"loved":"ardenne|portrait of (?:her|caralynn)","liked":"jewel","disliked":"plain|practical|compares her","hated":"height"}},"Zara":{"birthday":"M11 W1 Thu","text":{"loved":"Bolt of Sky silk. Embroidery thread set. A library book she mentioned.","liked":"Talisman paper stack. Sketchbook and charcoal. Tea by a fire.","disliked":"Clothes for her to wear. Anything that draws eyes to her.","hated":"Anything from the Doves (they burned her talismans)."},"items":{"loved":["Bolt of Sky silk","Embroidery thread set"],"liked":["Talisman paper stack","Sketchbook and charcoal"],"disliked":[],"hated":[]},"patterns":{"loved":"library book.*mentioned","liked":"tea.*fire","disliked":"clothes.*wear|draws eyes|spotlight","hated":"\\bdoves?\\b"}},"Percival":{"birthday":"M6 W2 Mon","text":{"loved":"A \"wounded relic\": a cracked shell, a broken buckle, an odd rock. Songs of the Oathbound.","liked":"Knight's pennon. Food for sharing. Anything grand.","disliked":"Almost nothing; he makes a story out of everything. Junk counts as loved.","hated":"A cruel prank item."},"items":{"loved":["Songs of the Oathbound"],"liked":["Knight's pennon"],"disliked":[],"hated":[]},"patterns":{"loved":"wounded relic|cracked shell|broken|odd rock|junk|\\brocks?\\b|weeds","liked":"food.*shar|grand","hated":"cruel.*prank"}},"Trixie":{"birthday":"M8 W2 Tue","text":{"loved":"Sweets. Prism charm. Juggling set.","liked":"Surprises. Costume pieces. Premium beast jerky (for the Menagerie).","disliked":"Quiet things (a meditation book, a sleep mask).","hated":"—"},"items":{"loved":["Prism charm","Juggling set"],"liked":["Premium beast jerky"],"disliked":[],"hated":[]},"patterns":{"loved":"sweet|bun|cake|candy|chocolate","liked":"surprise|costume","disliked":"meditation book|sleep mask"}},"Vera":{"birthday":"M3 W2 Wed","text":{"loved":"Rare reagent. Firetooth (tin). Mystery clockwork (sold as seen).","liked":"Precision tool roll. Sweet tea. Common reagents.","disliked":"The Vigil. Decorations with no purpose.","hated":"Something built badly on purpose."},"items":{"loved":["Rare reagent","Firetooth (tin)","Mystery clockwork (sold as seen)"],"liked":["Precision tool roll"],"disliked":["The Vigil"],"hated":[]},"patterns":{"liked":"sweet tea|common reagent","disliked":"decoration.*no purpose","hated":"built badly on purpose"}},"Castor":{"birthday":"M1 W2 Thu","text":{"loved":"Blank leather journal. Steel-nib fountain pen. Pocket thermos (for early Gardens).","liked":"Books. Plain things that do not stand out.","disliked":"Loud or flashy things. A gift in front of people.","hated":"Wishing coin, or anything that asks what he wants."},"items":{"loved":["Blank leather journal","Steel-nib fountain pen","Pocket thermos"],"liked":[],"disliked":[],"hated":["Wishing coin"]},"patterns":{"liked":"\\bbooks?\\b|plain","disliked":"loud|flashy|in front of people","hated":"asks what he wants"}},"Alyssa":{"birthday":"M10 W3 Mon","text":{"loved":"Pocket memory notebook. Letter paper set.","liked":"Sketchbook and charcoal (Drawing Club). Quiet-morning things. A note that reintroduces the giver.","disliked":"An invitation to a crowded party.","hated":"A keepsake \"from last time\" she is meant to remember."},"items":{"loved":["Pocket memory notebook","Letter paper set"],"liked":["Sketchbook and charcoal"],"disliked":[],"hated":[]},"patterns":{"liked":"quiet.morning|reintroduc","disliked":"crowded party","hated":"from last time|meant to remember"}},"Linus":{"birthday":"M6 W4 Mon","text":{"loved":"Old competition programmes. Crossed Blades: Famous Duels.","liked":"Notebooks. A story about Vallie's eyepatch. Tickets to a match.","disliked":"A gift that claims someone is strongest without proof.","hated":"The Noble Houses, by Precedence."},"items":{"loved":["Old competition programmes","Crossed Blades: Famous Duels"],"liked":[],"disliked":[],"hated":["The Noble Houses, by Precedence"]},"patterns":{"liked":"notebook|vallie.*eyepatch|ticket.*match","disliked":"strongest without proof"}},"Maple":{"birthday":"M10 W4 Tue","text":{"loved":"Bag of red apples. Sweet bamboo tea (tin). Everlamp, miniature.","liked":"Seed packets. Something for Sobek. A letter from home.","disliked":"Premium beast jerky and other animal treats (the animals flee her).","hated":"Beast muzzle, or anything calling Sobek a monster."},"items":{"loved":["Bag of red apples","Sweet bamboo tea (tin)","Everlamp, miniature"],"liked":["Seed packets"],"disliked":["Premium beast jerky"],"hated":["Beast muzzle"]},"patterns":{"liked":"for sobek|letter from home","disliked":"animal treat","hated":"sobek.*monster"}},"Nerys":{"birthday":"M4 W1 Thu","text":{"loved":"Whatever this week's hobby needs. Pigeon feed. Free food.","liked":"Carving knife and limewood block. Foraged things. Merryhew's goods.","disliked":"Last week's hobby supplies.","hated":"Etiquette manual."},"items":{"loved":["Pigeon feed"],"liked":["Carving knife and limewood block"],"disliked":[],"hated":["Etiquette manual"]},"patterns":{"loved":"this week.*hobby|free food","liked":"foraged|merryhew","disliked":"last week.*hobby"}},"Hadrian":{"birthday":"M8 W1 Wed","text":{"loved":"Brass golem joint set. Vigour tonic. Warding amulet.","liked":"Lined winter cloak. Anything expensive.","disliked":"A dare or a duel challenge.","hated":"Duelling gauntlets (an invitation to get hurt)."},"items":{"loved":["Brass golem joint set","Vigour tonic","Warding amulet"],"liked":["Lined winter cloak"],"disliked":[],"hated":["Duelling gauntlets"]},"patterns":{"liked":"expensive","disliked":"\\bdare\\b|duel challenge"}},"Wren":{"birthday":"M5 W3 Thu","text":{"loved":"Sweet bun. Letter paper set. Hand-Speech for Beginners (someone learning for her).","liked":"Fishing tackle box. Tuning fork (she feels it hum).","disliked":"Music box (a sound she cannot share).","hated":"Picture book for small children."},"items":{"loved":["Sweet bun","Letter paper set","Hand-Speech for Beginners"],"liked":["Fishing tackle box","Tuning fork"],"disliked":["Music box"],"hated":["Picture book for small children"]},"patterns":{}},"Tsubaki":{"birthday":"M2 W4 Sun","text":{"loved":"Whetstone and blade oil. Pocket campus map (she is always lost). Star atlas.","liked":"Plain food in large amounts. Duelling gauntlets.","disliked":"Decorative gifts she does not understand. Romantic gifts (she takes them literally).","hated":"—"},"items":{"loved":["Whetstone and blade oil","Pocket campus map","Star atlas"],"liked":["Duelling gauntlets"],"disliked":[],"hated":[]},"patterns":{"liked":"plain food.*large|large.*plain food","disliked":"decorative|romantic"}},"Gavlan":{"birthday":"M3 W1 Tue","text":{"loved":"Clan firewine. Blank leather journal.","liked":"History books. Tea.","disliked":"Weapons as presents. Anything romanticising war.","hated":"Independence War commemorative medal."},"items":{"loved":["Clan firewine","Blank leather journal"],"liked":[],"disliked":[],"hated":["Independence War commemorative medal"]},"patterns":{"liked":"history book|\\btea\\b","disliked":"weapon|romantici[sz].*war"}},"Yvette":{"birthday":"M3 W4 Tue","text":{"loved":"Fallen Stars: Notes on Mana Resonance. A fine enchanted piece to study.","liked":"Ordinary coffee. Precision tool roll.","disliked":"The Vigil. Romantic gifts from students.","hated":"Halvard pennant or any Halvard keepsake."},"items":{"loved":["Fallen Stars: Notes on Mana Resonance"],"liked":["Precision tool roll"],"disliked":["The Vigil"],"hated":["Halvard pennant"]},"patterns":{"loved":"fine enchanted","liked":"ordinary coffee","disliked":"romantic.*student","hated":"halvard.*keepsake"}},"Krieg":{"birthday":"M4 W2 Thu","text":{"loved":"Royal crest paperweight.","liked":"Fine vintage. Good manners.","disliked":"Sentimental gifts.","hated":"Orchard cider. Anything enchanted."},"items":{"loved":["Royal crest paperweight"],"liked":["Fine vintage"],"disliked":[],"hated":["Orchard cider"]},"patterns":{"liked":"good manners","disliked":"sentimental","hated":"enchant"}},"Milena":{"birthday":"M7 W2 Fri","text":{"loved":"Salaffian flatbread. Armour polish kit. Travel Dragonchess set.","liked":"Things students made themselves. Warm drinks.","disliked":"—","hated":"Anything tied to forbidden magic (she confiscates it, then asks gently where it came from)."},"items":{"loved":["Salaffian flatbread","Armour polish kit","Travel Dragonchess set"],"liked":[],"disliked":[],"hated":[]},"patterns":{"liked":"handmade|made.*(?:themselves|hand)|warm drink","hated":"forbidden magic"}},"Baelin":{"birthday":"M4 W4 Sun","text":{"loved":"Silvertip tea. Anecdotes of the Old Kingdom. A debt repaid.","liked":"Oak sapling in a pot.","disliked":"Extravagant gifts (waste).","hated":"—"},"items":{"loved":["Silvertip tea","Anecdotes of the Old Kingdom"],"liked":["Oak sapling in a pot"],"disliked":[],"hated":[]},"patterns":{"loved":"debt repaid|repaid debt","disliked":"extravagant"}},"Layla":{"birthday":"M9 W3 Wed","text":{"loved":"Founding of the Dovecote (old edition). Old Archive documents.","liked":"Tea. A good argument, written out. Kid-leather gloves.","disliked":"What Everyone Knows About the Founding.","hated":"The Night Student: A True Account."},"items":{"loved":["Founding of the Dovecote"],"liked":["Kid-leather gloves"],"disliked":["What Everyone Knows About the Founding"],"hated":["The Night Student: A True Account"]},"patterns":{"loved":"old archive document","liked":"\\btea\\b|written.*argument|argument.*written"}},"Vallie":{"birthday":"M3 W3 Sat","text":{"loved":"Blackroot cigars. Stonebrew ale (jug).","liked":"Clan firewine. A good story, written down. Meat.","disliked":"Leather planner.","hated":"Anything stolen."},"items":{"loved":["Blackroot cigars","Stonebrew ale (jug)"],"liked":["Clan firewine"],"disliked":["Leather planner"],"hated":[]},"patterns":{"liked":"story.*written|written.*story|meat","hated":"stolen"}},"Rei":{"birthday":"M7 W4 Mon","text":{"loved":"Blackroot cigars. Whetstone and blade oil.","liked":"Quiet, simple things.","disliked":"Ceremonial gifts, anything that expects a speech.","hated":"Anything about the breach night."},"items":{"loved":["Blackroot cigars","Whetstone and blade oil"],"liked":[],"disliked":[],"hated":[]},"patterns":{"liked":"quiet|simple","disliked":"ceremonial|expects a speech","hated":"breach night"}},"Kuroo":{"birthday":"M1 W4 Tue","text":{"loved":"Gilt-edged playing cards. Ballroom shoes.","liked":"Anything that needles Krieg. Loud silk waistcoat (buttons he can find).","disliked":"Last-minute, half-hearted gifts.","hated":"—"},"items":{"loved":["Gilt-edged playing cards","Ballroom shoes"],"liked":["Loud silk waistcoat"],"disliked":[],"hated":[]},"patterns":{"liked":"needles krieg","disliked":"last.minute|half.hearted"}},"Mimosa":{"birthday":"M2 W1 Mon","text":{"loved":"Hooded night lamp. A written note of praise.","liked":"Rare reagent. Anything about Royhan's work.","disliked":"A gift in front of a crowd.","hated":"Brass handbell."},"items":{"loved":["Hooded night lamp"],"liked":["Rare reagent"],"disliked":[],"hated":["Brass handbell"]},"patterns":{"loved":"written.*praise|note of praise","liked":"royhan.*work","disliked":"in front of a crowd"}},"Tristan":{"birthday":"M10 W1 Fri","text":{"loved":"Fine vintage. Commentaries of Saint Orel (antique).","liked":"Philosophy. Tea.","disliked":"A rushed gift.","hated":"The Final Word on Everything."},"items":{"loved":["Fine vintage","Commentaries of Saint Orel"],"liked":[],"disliked":[],"hated":["The Final Word on Everything"]},"patterns":{"liked":"philosophy|\\btea\\b","disliked":"rushed gift"}},"Althair":{"birthday":"M8 W4 Mon","text":{"loved":"Loud silk waistcoat. Sovereigns.","liked":"Leather planner (really). Anything from someone who dislikes him.","disliked":"—","hated":"Formal dress coat."},"items":{"loved":["Loud silk waistcoat","Sovereigns"],"liked":["Leather planner"],"disliked":[],"hated":["Formal dress coat"]},"patterns":{"liked":"someone who dislikes him"}},"Ezrel":{"birthday":"","text":{"loved":"Brass golem joint set.","liked":"Nothing, pleasantly. Anything he does not dislike is neutral.","disliked":"Anything that wastes time.","hated":"—"},"items":{"loved":["Brass golem joint set"],"liked":[],"disliked":[],"hated":[]},"patterns":{"disliked":"wastes? time"}},"Ottavio":{"birthday":"M8 W1 Sun","text":{"loved":"Fishing tackle box. Salaffian spice box.","liked":"Engraved hip flask. Something for his dorm.","disliked":"Thank-you card.","hated":"—"},"items":{"loved":["Fishing tackle box","Salaffian spice box"],"liked":["Engraved hip flask"],"disliked":["Thank-you card"],"hated":[]},"patterns":{"liked":"for his dorm|for sky dorm"}},"Caine":{"birthday":"M2 W3 Mon","text":{"loved":"Nothing he will admit. Silver-polishing kit (a real smirk, once).","liked":"Silence. Order: Walnut desk tidy, a good clock.","disliked":"Anything noble or crested. Enchanted trinkets.","hated":"—"},"items":{"loved":["Silver-polishing kit"],"liked":["Walnut desk tidy"],"disliked":[],"hated":[]},"patterns":{"liked":"silence|clock","disliked":"noble|crest|enchanted"}},"Bobby":{"birthday":"M9 W1 Thu","text":{"loved":"Vanishing-coin illusion kit. Campus gossip, written down.","liked":"Precision tool roll. Something broken to fix. Gilt-edged playing cards.","disliked":"Cruel prank goods.","hated":"A spoiled surprise."},"items":{"loved":["Vanishing-coin illusion kit"],"liked":["Precision tool roll","Gilt-edged playing cards"],"disliked":[],"hated":[]},"patterns":{"loved":"gossip.*written|written.*gossip","liked":"broken.*fix","disliked":"cruel.*prank","hated":"spoiled surprise"}}},"universal":{"hated":"forbidden(?:.art| magic| text)|unregistered pact token","liked":"sweet|bun|cake|cookie|chocolate|candy|baked|good meal|snug.*meal|handmade|made by hand|drawing|carving|long letter","disliked":"merryhew|prank|junk|rocks?|broken|weeds|tobacco|cigar|raw reagent|common reagent|wine|vintage|cider|\\bale\\b|alcohol|spirits","neutral":"stationery|notebook|pen nib|letter paper|common drink|sunfizz|umbrella|scarf|plain food|cut flowers"},"catalog":{"Sunfizz":"The Mall — store","Firetooth (tin)":"Commissary","Notebook":"Commissary","Pen nibs and ink":"Commissary","Printed class textbook":"Commissary","Satchel":"Commissary","Spare uniform set":"Commissary","Common reagent bundle":"Commissary sweets and baked goods raw reagent","Basic practice focus":"Commissary enchanted","Rare reagent":"Commissary raw reagent","Special order":"Commissary","Umbrella":"Commissary","Oilskin rain cloak":"Commissary","Bakery roll":"The Mall — bakery sweets and baked goods","Star Cookie":"The Mall — bakery sweets and baked goods","Café drink and pastry":"The Mall — cafés and tea houses sweets and baked goods","Restaurant meal":"The Mall — restaurants food good meal","Private dining (second floor)":"The Mall — private dining","Quality focus":"The Mall — store enchanted","Tailoring alteration":"Tailor's Row","Barber":"The Mall — services","Laundry service (per load)":"The Mall — services","Practice studio or music room (per hour)":"The Mall — studios","Game hall (per hour)":"The Mall — game halls","Wool scarf and mittens":"The Mall — store","Lined winter cloak":"The Mall — store","Straw sun hat":"The Mall — store","Hot spiced tea":"The Mall — cafés and tea houses","Iced fruit cooler":"The Mall — cafés and tea houses","The Vigil":"Nightwell","House coffee":"Nightwell","Honey cream coffee":"Nightwell","Spiced milk tea":"Nightwell","Iced coffee":"Nightwell","Hot chocolate with cream":"Nightwell sweets and baked goods","Late-night pastry":"Nightwell sweets and baked goods","Bag of Nightwell beans":"Nightwell","The Oracle Shell":"Merryhew's prank goods","Itching charm":"Merryhew's prank goods","Voice-changing sweets (bag)":"Merryhew's prank goods sweets and baked goods","Illusion vermin (box)":"Merryhew's prank goods","Screaming box":"Merryhew's prank goods","Colour-change hair sweet":"Merryhew's prank goods sweets and baked goods","Confetti ambush card":"Merryhew's prank goods","Secret Fools Day kit":"Merryhew's prank goods","Private booth (per hour)":"The Snug","Set meal":"The Snug food good meal","Pot of tea for the booth":"The Snug","Stew and fresh bread":"The Snug food good meal","Sweet course":"The Snug sweets and baked goods","Evening booth (18:00 to curfew)":"The Snug","Ardenne case":"Ardenne (special order)","Ardenne focus":"Ardenne (special order)","Ardenne measuring set":"Ardenne (special order)","Ardenne tuning instrument":"Ardenne (special order)","The Rose in the Tower":"Quillfeather's book","Seven Towers (deluxe edition)":"Quillfeather's book","Nine Rivers: Field Tactics":"Quillfeather's book","Crossed Blades: Famous Duels":"Quillfeather's book","Songs of the Oathbound":"Quillfeather's book","Songbook of old ballads":"Quillfeather's book","Lamps Out: Tales of Halvard":"Quillfeather's book","The Night Student: A True Account":"Quillfeather's book","The Truth Behind Halvard's Ghosts":"Quillfeather's book","Halvard Through the Centuries":"Quillfeather's book","Anecdotes of the Old Kingdom":"Quillfeather's book","Founding of the Dovecote (old edition)":"Quillfeather's book","What Everyone Knows About the Founding":"Quillfeather's book","Commentaries of Saint Orel (antique)":"Quillfeather's book","The Final Word on Everything":"Quillfeather's book","Fallen Stars: Notes on Mana Resonance":"Quillfeather's book","The Noble Houses, by Precedence":"Quillfeather's book","Etiquette manual":"Quillfeather's book","Dragonchess problem book":"Quillfeather's book","Star atlas":"Quillfeather's book","Hand-Speech for Beginners":"Quillfeather's book","Picture book for small children":"Quillfeather's book","Old competition programmes":"Quillfeather's book","Blank leather journal":"Quillfeather's","Pocket memory notebook":"Quillfeather's","Leather planner":"Quillfeather's","Plush animal":"Pennywhistle Curios","Goosedown pillow":"Pennywhistle Curios","Silver hand mirror":"Pennywhistle Curios","Palm crystal ball":"Pennywhistle Curios","Porcelain tea set":"Pennywhistle Curios","Music box":"Pennywhistle Curios","Prism charm":"Pennywhistle Curios","Black silk ribbons":"Pennywhistle Curios","Travel Dragonchess set":"Pennywhistle Curios","Sovereigns":"Pennywhistle Curios","Gilt-edged playing cards":"Pennywhistle Curios","Vanishing-coin illusion kit":"Pennywhistle Curios","Juggling set":"Pennywhistle Curios","Rainglass":"Pennywhistle Curios enchanted","Everlamp, miniature":"Pennywhistle Curios enchanted","Hearthstone hand-warmer":"Pennywhistle Curios enchanted","Hooded night lamp":"Pennywhistle Curios","Warding amulet":"Pennywhistle Curios enchanted","Wishing coin":"Pennywhistle Curios","Thank-you card":"Pennywhistle Curios","Get-well hamper":"Pennywhistle Curios","Engraved trophy cup":"Pennywhistle Curios","Knight's pennon":"Pennywhistle Curios","Halvard pennant":"Pennywhistle Curios","Royal crest paperweight":"Pennywhistle Curios","Independence War commemorative medal":"Pennywhistle Curios","Carved Asmoday charm":"Pennywhistle Curios","Festival lantern set":"Pennywhistle Curios","Brass handbell":"Pennywhistle Curios","Wind-up alarm clock":"Pennywhistle Curios","Silver-polishing kit":"Pennywhistle Curios","Walnut desk tidy":"Pennywhistle Curios","Loaded bone dice":"Pennywhistle Curios","Marked deck":"Pennywhistle Curios","Table wine":"Barrow & Vine","Fine vintage":"Barrow & Vine","Orchard cider":"Barrow & Vine","Stonebrew ale (jug)":"Barrow & Vine","Clan firewine":"Barrow & Vine","Blackroot cigars":"Barrow & Vine","Engraved hip flask":"Barrow & Vine","Bouquet of stage roses":"Greenwick's","Cut flowers":"Greenwick's","Moonfern in a pot":"Greenwick's","Oak sapling in a pot":"Greenwick's","Seed packets":"Greenwick's","Bag of red apples":"Greenwick's food","Carrots and fresh greens":"Greenwick's food","Pigeon feed":"Greenwick's","Pruning shears":"Greenwick's","Precision tool roll":"The Tinker's Bench sweets and baked goods","Mystery clockwork (sold as seen)":"The Tinker's Bench","Brass golem joint set":"The Tinker's Bench","Glass stirring-rod set":"The Tinker's Bench","Whetstone and blade oil":"The Tinker's Bench","Armour polish kit":"The Tinker's Bench","Duelling gauntlets":"The Tinker's Bench","Fishing tackle box":"The Tinker's Bench food","Gut guitar strings":"The Tinker's Bench","Tuning fork":"The Tinker's Bench","Steel-nib fountain pen":"The Tinker's Bench","Letter paper set":"The Tinker's Bench","Sketchbook and charcoal":"The Tinker's Bench","Carving knife and limewood block":"The Tinker's Bench","Bolt of Sky silk":"The Tinker's Bench","Embroidery thread set":"The Tinker's Bench","Talisman paper stack":"The Tinker's Bench","Chamois lens cloth":"The Tinker's Bench","Pocket thermos":"The Tinker's Bench","Shuttered dark-lantern":"The Tinker's Bench","Running shoes":"The Tinker's Bench","Premium beast jerky":"The Tinker's Bench","Beast muzzle":"The Tinker's Bench","Vigour tonic":"The Tinker's Bench","Salaffian flatbread":"The Salaffian Oven food","Salaffian spice box":"The Salaffian Oven","Loud silk waistcoat":"Tailor's Row","Formal dress coat":"Tailor's Row","Platform boots":"Tailor's Row","Ballroom shoes":"Tailor's Row","Bergamot cologne":"Tailor's Row","Kid-leather gloves":"Tailor's Row","Honey bun":"Commissary sweets and baked goods","Pocket campus map":"Commissary","Smoked river fish":"Commissary food","Lavender laundry soap":"Commissary","Sweet bun":"The Mall — bakery sweets and baked goods","Sweet bamboo tea (tin)":"The Mall — cafés and tea houses sweets and baked goods","Silvertip tea":"The Mall — cafés and tea houses","Rain-ward charm":"The Tinker's Bench","Quick-dry powder":"The Tinker's Bench","Cooling charm":"The Tinker's Bench","Ember pouch":"The Tinker's Bench","Knitting wool and needles":"The Tinker's Bench","Paint box":"The Tinker's Bench","Elderflower cold syrup":"Greenwick's","Blossom honey cake":"The Mall — bakery sweets and baked goods","Spiced apple turnover":"The Mall — bakery sweets and baked goods","Roasted chestnuts":"The Mall — cafés and tea houses food","Salted lemon water":"Commissary","Baking and cooking ingredients":"Commissary","Bar stock and coal":"Commissary","Linen summer shirt":"Tailor's Row","Fleece-lined boots":"Tailor's Row","Mulled apple cider":"The Snug"}};
const WIND_CASTING = {"groups":{"fed":[1,0.75],"scattered":[1.5,2],"unaffected":[1,1],"fights":[1.25,1.5]},"subtypes":{"Wind":"fed","Storm":"fed","Mist":"scattered","Smoke":"scattered","Ash":"scattered","Sand":"scattered","Steam":"scattered","Sound":"scattered","Reinforcement":"unaffected","Mending":"unaffected","Phasing":"unaffected","Resizing":"unaffected"},"default":"fights"};
const NPC_DORMS = {"Irene":"Light","Caspian":"Viridian","Etnie":"Viridian","Royhan":"Sky","Lenna":"Fire","Saffi":"Viridian","Kanae":"Light","Idris":"Sky","Aiden":"Light","Caralynn":"Fire","Zara":"Sky","Gavlan":null,"Yvette":null,"Krieg":null,"Milena":null,"Baelin":null,"Layla":null,"Vallie":null,"Percival":"Viridian","Sophia":"Fire","Rei":null,"Kuroo":null,"Mimosa":null,"Gareth":"Fire","Lucius":null,"Trixie":"Fire","Vera":"Viridian","Tristan":null,"Althair":null,"Dante":"Light","Castor":"Viridian","Ruby":"Sky","Florian":"Sky","Elion":null,"Bellatrix":null,"Kira":null,"Mirelle":null,"Theodore":null,"Ines":null,"Bram":null,"Dex":null,"Cassius":null,"Morgana":null,"Pip":null,"Alyssa":"Sky","Tilly":"Fire","Ezrel":null,"Ottavio":null,"Caine":null,"Bobby":null,"Linus":"Viridian","Maple":"Sky","Nerys":"Fire","Hadrian":"Light","Wren":"Fire","Tsubaki":"Light"};
const moodCanon = k => NPC_ALIAS[String(k).toLowerCase()] || k;
const GRX = new Map(), grx = src => GRX.get(src) || GRX.set(src, new RegExp(src, 'i')).get(src);   // 1.16.1 (audit A6): compiled once
const giftNorm = s => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
const npcBirthday = (id, W) => ((GIFT_PREFS.npcs[id] || {}).birthday || '') === `M${W.Month} W${W.Week} ${W.Day}`;
function giftTier(id, item, fallback, note = '') {
  const p = GIFT_PREFS.npcs[id], s = giftNorm(item), order = ['hated', 'loved', 'disliked', 'liked'];
  let tier = '';
  const exact = name => { const n = giftNorm(name); const at = s.indexOf(n); return at >= 0 && !/[a-z0-9]/.test(s[at - 1] || '') && !/[a-z0-9]/.test(s[at + n.length] || ''); };
  const description = s + ' ' + giftNorm(note) + ' ' + Object.entries(GIFT_PREFS.catalog || {}).filter(([name]) => exact(name)).map(([,tags]) => tags).join(' ');
  if (s && p) tier = order.find(k => (p.items[k] || []).some(exact) || p.patterns[k] && grx(p.patterns[k]).test(description)) || '';
  if (s && !tier) tier = [...order, 'neutral'].find(k => GIFT_PREFS.universal[k] && grx(GIFT_PREFS.universal[k]).test(description)) || '';
  if (!tier) tier = [...order, 'neutral'].includes(giftNorm(fallback)) ? giftNorm(fallback) : 'neutral';
  if (id === 'Ezrel' && tier === 'liked') tier = 'neutral';
  // Etnie's own hated gifts are the only exception to her minimum; universal dislikes do not overrule it.
  if (id === 'Etnie' && !((p.items.hated || []).some(exact) || grx(p.patterns.hated).test(s)) && !['liked', 'loved'].includes(tier)) tier = 'liked';
  return tier;
}
function moodOf(id, S, wx, day) {
  const p = NPC_MOODS[id], W = S.World, hour = Number(W.Time.split(':')[0]), block = hour < 6 || hour >= 18 ? 2 : hour < 12 ? 0 : 1;
  if (!p || id === 'Ezrel') return { mood: 'Normal', score: 0, reasons: [] };
  let score = 0; const reasons = [], add = (v, why) => { if (v) { score += v; reasons.push(why); } };
  const match = k => {
    if (!wx) return false;
    if (k === 'Clear night') return wx.sky === 'Clear' && block === 2;
    if (k === 'Clear by day ≥15 °C') return wx.sky === 'Clear' && block !== 2 && wx.temp >= 15;
    return [wx.sky, tempLabel(wx.temp), wx.wind, wx.rare, wx.snow ? 'Snow' : ''].some(x => String(x || '').toLowerCase() === k.toLowerCase());
  };
  for (const k of p.loves) if (match(k)) add(1, k.toLowerCase());
  for (const k of p.hates) if (match(k)) add(-1, k.toLowerCase());
  if (p.clock === 'M') { if (block === 0) add(1, 'morning person'); if (hour >= 22 || hour < 6) add(-1, 'late for a morning person'); }
  if (p.clock === 'N') { if (block === 2) add(1, 'night owl'); if (hour < 10) add(-1, 'early for a night owl'); }
  const dayEvents = EVENTS.filter(e => e.m === W.Month && e.w === W.Week && e.d.includes(W.Day));
  const exams = dayEvents.some(e => e.mood === 'exam');
  const trials = dayEvents.some(e => e.mood === 'trial');
  if (exams && STUDENTS[id] && !(S.Campus_State.Graduated || []).includes(id)) add(p.exams, 'Exams');
  const cand = ((S.Campus_State.Council || {}).Candidates || {})[String(W.Year)] || {};
  if (trials || W.Month === 10 && W.Week === 3 && DAYS.indexOf(W.Day) < 6 && Object.values(cand).includes(id)) add(p.trials, 'Trials');
  const status = Object.entries(S.Campus_State.NPC_status || {}).filter(([k]) => moodCanon(k) === id).map(([,v]) => v).join(' ');
  if (/sick|ill\b|injur|wound|griev|grief|bereav|mourning|hurt|head cold/i.test(status)) add(-1, 'unwell or grieving');
  const roll = rand01(S.$eng.seed, day, id, 'mood'); add(roll < 0.1 ? -1 : roll >= 0.9 ? 1 : 0, 'how the day feels');
  return { mood: score >= 1 ? 'Good' : score <= -1 ? 'Bad' : 'Normal', score, reasons };
}
function windMultiplier(subtype, custom, wind) {
  if (!wind) return 1;
  const k = Object.keys(custom || {}).find(k => k.toLowerCase() === String(subtype || '').toLowerCase());
  // An old custom subtype without wind deliberately uses the default, even if its name matches the catalogue.
  const cat = k ? custom[k].wind || WIND_CASTING.default : WIND_CASTING.subtypes[subtype] || WIND_CASTING.default;
  return (WIND_CASTING.groups[cat] || WIND_CASTING.groups[WIND_CASTING.default])[wind === 'gale' ? 1 : 0];
}
const blocksWind = (active, techniques) => Object.entries(active || {}).some(([name, e]) => {
  const t = techniques[e.Technique] || {};
  return /barrier|shield|ward/i.test(name + ' ' + e.Technique + ' ' + t.Subtype) && /wind|gust/i.test([e.Note, e.Effect, t.Effect, t.Notes].join(' '));
});
function birthdayParty(S) {
  if (S.Player.Profile.Birthday !== `M${S.World.Month} W${S.World.Week} ${S.World.Day}`) return null;
  const absent = id => (ARRIVES[id] || 1) > S.World.Year || npcAwayIn(S, id);   // 1.16.1 (audit B4): the engine's one rule
  const available = Object.entries(S.Bonds).filter(([id,b]) => b.Tension < BR.birthday.tension_below && !absent(id));
  const hosts = available.filter(([,b]) => b.Rank >= BR.birthday.host_rank).sort((a,b) => b[1].Rank - a[1].Rank || b[1].Trust - a[1].Trust || a[0].localeCompare(b[0]));
  if (!hosts.length || S.Trip.Active) return null;
  const host = hosts[0][0], guests = available.filter(([id,b]) => STUDENTS[id] && b.Rank >= BR.birthday.guest_rank).map(([id]) => id).sort();
  const all = [...new Set([host, ...guests])], dorm = S.Player.Profile.Dorm;
  const where = dorm !== 'Unsorted' && all.every(id => NPC_DORMS[id] === dorm) ? `${dorm} Dormitory Common Room` : 'The Snug (reserved evening booth)';
  const evs = eventsOn(S.World);
  // 1.11.1 (bug hunt): no party is arranged while the students have gone home (Mid-Year Break, Month 12); the story may still hold one
  if (evs.some(e => e.lockdown || e.home)) return null;
  const endHour = evs.some(e => e.home || e.nocurfew && S.World.Day === e.d[0]) ? 24 : evs.map(e => curfewHour(e, S.World.Day)).find(Boolean) || 20;
  return { host, guests, where, from: '18:00', endHour, until: pad(endHour) + ':00' };
}
// Count overlap arithmetically so even long time skips stay bounded, and short updates accumulate complete hours.
const nightMinutes = abs => { const d = Math.floor(abs / 1440), t = abs - d * 1440; return d * 360 + Math.min(360, Math.max(0,t)); };
function updateSleep(S, B, from, to, TU, log) {
  const E = S.$eng, prior = B && B.$eng || E, mode = S.$ui.wxfx;
  E.late = Math.max(0, num(prior.late));
  E.sleep = { awake: 0, run: 0, paid: false, vigilUntil: -1, crash: 0, lastNight: -1, ...(prior.sleep || {}) };
  const r = E.sleep, resting = S.Player.Vitals.Resting === 'sleep', elapsed = Math.max(0,to-from), oldUntil = r.vigilUntil;
  if (mode === 'off') { S.$ui.sleep = null; r.run = 0; r.paid = false; return; }
  const consumed = (S.Consumables || []).filter(x => /^the vigil$/i.test(String(x).trim())).length;
  if (consumed && mode === 'full') { r.vigilUntil = Math.max(to, r.vigilUntil) + 48 * 60; log.push('The Vigil: 48 hours without sleep debt; two full nights will be owed afterwards.'); }
  const expired = r.vigilUntil >= 0 && to >= r.vigilUntil;
  if (expired) { r.crash = 2; r.vigilUntil = -1; r.run = 0; r.paid = false; log.push('The Vigil has worn off: stamina capped at 60% until two full nights of sleep.'); }
  if (elapsed > 0 && resting) {
    r.run += expired ? Math.max(0, to - Math.max(from, oldUntil)) : elapsed;
    if (r.run >= TU.sleep_full * 60 && !r.paid) {
      E.late = 0; r.awake = 0; r.paid = true;
      const night = Math.floor((to - 6 * 60) / 1440);
      if (r.crash && night !== r.lastNight && nightMinutes(to) - nightMinutes(to - r.run) > 0) { r.crash--; r.lastNight = night; }
    }
  } else if (elapsed > 0) {
    r.run = 0; r.paid = false;
    r.awake += Math.max(0, nightMinutes(to) - nightMinutes(Math.min(to, Math.max(from, oldUntil))));
    E.late += Math.floor(r.awake / 60); r.awake %= 60;
  }
  const loss = r.vigilUntil > to ? 0 : r.crash ? TU.sleep_cap : Math.min(TU.sleep_cap, E.late * TU.sleep_hour);
  S.$ui.sleep = { late: E.late, loss, vigil: r.vigilUntil > to, nights: r.crash, flavor: mode === 'flavor' };
  if (mode === 'full' && loss > 0) S.Player.Vitals.Stamina = Math.min(S.Player.Vitals.Stamina, S.Player.Vitals.Stamina_max * (1-loss));
}

const ENGINE_VER = "1.30.3";   // the card version (src/card/card.json, set by tools/gen_engine.py)

// 1.20.0 (audit A5): the engine runs as a list of steps, in the order of the sections they came from. Each step reads what it needs
// from the shared context c (the states, the reply's text and the values earlier steps computed) and adds what later steps use.
function runEngine(S, B, text, seedHint, userText) {   // 1.12.0: userText = the player's message this reply answers (section 8l)
  if (!S || !S.World) return;
  const c = { S, B, text, seedHint, userText };
  for (const step of ENGINE_STEPS) step(c);
}

function stepSetup(c) {
  const { S, B } = c;
  fillShape(S, SHAPE);
  const log = [], jnl = [];                                    // jnl: journal lines the engine adds itself (5.1)
  S.$eng = S.$eng || { abs: -1, daily: {} };
  S.$ui = S.$ui || { unlocks: [], discovered: [], toasts: [] };
  for (const k of ['unlocks', 'discovered', 'toasts', 'names', 'archive', 'secrets', 'off', 'rumours_old', 'lore']) if (!Array.isArray(S.$ui[k])) S.$ui[k] = [];
  if (!_.isPlainObject(S.$ui.parked)) S.$ui.parked = {};
  if (!['off', 'flavor', 'full'].includes(S.$ui.wxfx)) S.$ui.wxfx = 'full';
  const hasB = !!(B && B.World);
  const fromVer = hasB ? (B.$eng || {}).ver : S.$eng.ver;      // the engine version that wrote the state before this reply
  S.$eng.ver = ENGINE_VER;
  if (hasB) S.$ui.toasts = [];                                  // toasts = what happened in THIS update only
  Object.assign(c, { log, jnl, hasB, fromVer });
}

// 1.20.0 (audit A5): save migrations, run on the first update after the card version changes (and on a new chat's first run).
// Each keeps its own flag or test, so one already done is skipped. The engine reads its own fields from the state before the
// reply (B), so a migration changes a copy of B as well as S: the reply is not read as having made the change.
function stepMigrate(c) {
  const { S, hasB, log } = c;
  if (c.fromVer === ENGINE_VER) return;
  const B = c.B = hasB ? _.cloneDeep(c.B) : c.B, both = hasB ? [S, B] : [S];
  // 1.26.0: old chats keep their history. A small class allowance recognises weeks already played;
  // the one-time Studies offer lets the player choose a different starting history.
  if (S.$eng.profv !== 1 && hasB) {
    const weeks = Math.min(14, Math.floor(Math.max(0, num((B.$eng || {}).abs, 0)) / (7 * DAY_MIN)));
    const xp = Math.min(29, weeks * 2);
    for (const X of both) {
      X.Player._Proficiency = Object.fromEntries(PROF.map(k => [k, xp >= 10 ? 1 : 0]));
      X.$eng.prof = { xp: Object.fromEntries(PROF.map(k => [k, xp])), wk: { w: -1 }, days: {}, picked: false };
      X.$eng.profv = 1;
    }
    S.$ui.prof_offer = true;
    log.push('Proficiency was estimated from weeks already played; Studies offers a one-time choice of starting ranks.');
  }
  // 1.30.0: per-subject attendance starts with this release; the term's classes so far count as attended, recorded skips stay
  for (const X of both) {
    const ST = (X.$eng || {}).study;
    if (!_.isPlainObject(ST) || _.isPlainObject(ST.held) || !X.World) continue;
    const W = X.World, prev = [11, 9, 5, 3].find(m => m < W.Month || (m === W.Month && W.Week > 1));
    const start = toAbs({ Year: W.Year, Month: prev || 1, Week: prev ? 2 : 1, Day: 'Mon', Time: '00:00' });
    const weeks = Math.max(0, Math.floor((toAbs(W) - start) / (7 * DAY_MIN))), perWeek = {};
    for (const row of Object.values(CLASS.tt || {})) for (const cell of row || []) if (cell && cell[3] === 'class') perWeek[cell[0]] = num(perWeek[cell[0]], 0) + 1;
    ST.held = Object.fromEntries(SUBJECTS.map(s => [s, Math.max(num((ST.skip || {})[s], 0), weeks * num(perWeek[s], 0))]));
  }
  for (const X of both) {
    const P = X._Perks;
    if (!_.isPlainObject(P)) continue;
    const oldDanteGift = P["Groundskeeper's Lodge key"];       // Dante's Rank 5 gift before its rename
    if (oldDanteGift) {
      if (!P['Council safety card']) P['Council safety card'] = { ...oldDanteGift, Effect: REW.npcs.Dante.gift.text };
      delete P["Groundskeeper's Lodge key"];
    }
    if (P['Florian (Rank 10)']) P['Florian (Rank 10)'].Effect = REW.npcs.Florian.r10.text;
  }
  // 1.3.0: a pre-1.3.0 save's Public / Dorm meters become Academy / Student XP once
  if (S.$eng.repv !== 1) {
    const RP = S.Player.Profile.Reputation || (S.Player.Profile.Reputation = {});
    const RPB = hasB ? (((B.Player || {}).Profile || {}).Reputation) : null;
    const old = (RPB && (RPB.Public != null || RPB.Dorm != null)) ? RPB : RP, xp0 = (RPB && RPB.$xp) || RP.$xp || {};
    if (REP.reps.every(r => !_.clamp(num(xp0[r], 0), -REP.thresholds[4], REP.thresholds[4])) && (num(old.Public, 0) || num(old.Dorm, 0))) {
      const xp = { ...xp0, Academy: _.clamp(Math.round(num(old.Public, 0) * 1.25), -125, 125), Student: _.clamp(Math.round(num(old.Dorm, 0) * 1.25), -125, 125) };
      RP.$xp = xp;
      if (RPB) RPB.$xp = { ...xp };
      log.push(`Reputation now has three parts (Academy, Student, Doves); the old academy and dorm standing became Academy ${repLevel(xp.Academy)} and Student ${repLevel(xp.Student)}.`);
    }
    S.$eng.repv = 1;
  }
  // 1.2.2: a pre-XP bond's Progress (0-10) becomes XP toward its next rank; 1.3.8: milestones of the ranks already reached count as paid
  const PACE = paceOf(S);
  for (const X of both) {
    for (const b of Object.values(X.Bonds || {})) {
      if (!b || typeof b !== 'object') continue;
      if (S.$eng.bondv !== 2) { const p = num(b.Progress, 0); if (p > 0 && num(b.$xp, 0) === 0) b.$xp = Math.round(Math.min(p, 10) / 10 * needXP(b.Rank, PACE)); }
      if (S.$eng.tenv !== 1) b.$ms = [...new Set([...(b.$ms || []), ...Object.keys(REP.bond_milestone_xp || {}).map(Number).filter(r => r <= b.Rank)])];
    }
  }
  S.$eng.bondv = 2;
  S.$eng.tenv = 1;
  S.$ui.bev = {};                                               // obsolete event hints of older saves
}

// ---- 0. read-only fields: only a Student Builder patch (auth = 'builder') may change them ----
function stepGuards(c) {
  const { S, B, text, log, hasB } = c;
  const byBuilder = S.$eng.auth === 'builder';
  if (hasB && !byBuilder) {
    const keep = [['Magic', '_Techniques'], ['Magic', '_Affinity'], ['Hidden', '_True_magic'], ['Player', '_Proficiency'], ['$ui', 'built'], ['$ui', 'file'], ['_Perks']];
    for (const path of keep) {
      const was = _.get(B, path);
      if (was !== undefined && !_.isEqual(_.get(S, path), was)) { _.set(S, path, _.cloneDeep(was)); log.push(`${path.join('.')} is read-only; the change was reverted.`); }
    }
  }
  if (byBuilder) S.$ui.toasts.push('Student file updated');
  S.$eng.auth = '';
  // 1.11.1: a player-tool message (the UI writes /$eng/tool = 1 with every Builder or Settings patch and marks its text)
  const toolEdit = hasB && (num(S.$eng.tool, 0) === 1 || /\(player tool\)/.test(String(text || '')));
  S.$eng.tool = 0;
  // 1.16.1 (audit B1): the club in the club list's words, before attendance (5d) reads it
  {
    const P = S.Player.Profile, raw = String(P.Club || ''), c = canonClub(raw);
    P.Club = c;
    const was = hasB ? canonClub(((B.Player || {}).Profile || {}).Club) : c;
    if (c && c !== was && !Object.keys(CLASS.clubs || {}).includes(c)) log.push(`Club "${c}" is not a club on record (${Object.keys(CLASS.clubs || {}).join(', ')}); Saturday club time is only counted for one of them.`);
  }
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
  Object.assign(c, { byBuilder, toolEdit });
}

// ---- 0b. 1.1.0 Features settings: a feature that is off has its state parked in $ui.parked (hidden from the AI) and is not processed.
// Turning it back on restores it. A write the AI still makes into a parked module is merged into the parking, not dropped.
// On the update that toggles a feature, the "before" copy of its state is aligned, so the toggle is not read as a story change.
function stepFeatures(c) {
  const { S, log, hasB } = c;
  let { B } = c;
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
  if (S.$ui.ambience === 'off') OFF.add('ambience');
  S.$ui.on = Object.fromEntries(FEATURES.map(f => [f.id, !OFF.has(f.id)]));
  S.$ui.on.wxfull = S.$ui.wxfx === 'full';
  const offUnlock = new Set(FEATURES.filter(f => f.unlock && parkOff(S, f)).map(f => f.unlock));

  // 1.3.4 (owner playtest: Etnie showed up in message 0 of a new chat). The chat's starting state comes from the card's lorebook
  // as SillyTavern holds it ([initvar] entry 500), which is not replaced when the card is imported again. That entry carries the
  // card version in $eng.lore; on the first update of a chat, an older one (or none) means an old lorebook: say so, and drop
  // Etnie's pre-1.3.1 starting bond (she now bonds when they meet).
  const staleDrop = new Set();
  if (hasB && !(B.$eng && B.$eng.abs >= 0) && (B.$eng || {}).lore !== ENGINE_VER) {
    const old = (B.$eng || {}).lore || 'before 1.3.4';
    S.$ui.toasts.push(`Old lorebook (${old}): update the card's lorebook in SillyTavern`);
    log.push(`This chat started from the card's lorebook ${old}, but the card is ${ENGINE_VER}: rules, lore and the starting state are out of date. In SillyTavern, replace the lorebook "Eldrasil — Halvard Academy" with the one inside the card (character panel → More… → Import Card Lore), then start a new chat.`);
    const e = (S.Bonds || {}).Etnie;
    if (!(B.$eng || {}).lore && e && !e.Last_seen && e.Rank === 3 && (e.Milestones || []).length <= 1 && S.World.Month === 1 && S.World.Week === 1) { delete S.Bonds.Etnie; staleDrop.add('Etnie'); }
  }
  S.$eng.lore = ENGINE_VER;
  // 1.12.0 (planning/DRAFT_missed_reports.md): what the narrator reported in this update, kept before the sections below empty the
  // lists; section 8l compares it with the prose and the state to remind the narrator of what it may have left out
  const REPORTED = {
    acts: (Array.isArray(S.Interactions) ? S.Interactions : []).filter(a => a && typeof a === 'object'),
    casts: (Array.isArray(S.Magic && S.Magic.Casts) ? S.Magic.Casts : []).map(c => String((c && c.Technique) || '')),
    used: (Array.isArray(S.Consumables) ? S.Consumables : []).map(x => String(x).trim().toLowerCase()),
    perks: (Array.isArray(S.Perk_use) ? S.Perk_use : []).map(x => String(x).trim().toLowerCase()),
    training: Array.isArray(S.Training) ? S.Training.length : 0,
    tutoring: Array.isArray(S.Tutoring) ? S.Tutoring.map(x => x.Subject) : [],
  };
  Object.assign(c, { OFF, offUnlock, staleDrop, REPORTED, B });
}

// ---- 1. time ----
// 1.3.3: an unreadable Day or Time from the AI arrives as '' (schema): keep the previous one rather than guess
function stepTime(c) {
  const { S, B, seedHint, log, jnl, hasB } = c;
  for (const [f, d] of [['Day', 'Mon'], ['Time', '08:00']]) {
    if (!S.World[f]) { S.World[f] = (hasB && B.World[f]) || d; if (hasB) log.push(`World.${f} could not be read; it was kept at ${S.World[f]}.`); }
  }
  if (!(S.Trip && S.Trip.Active)) S.World.Location = canonLocation(S.World.Location);   // 1.3.1: the map's name for the place
  const absB = hasB ? (B.$eng && B.$eng.abs >= 0 ? B.$eng.abs : toAbs(B.World)) : toAbs(S.World);
  let absA = toAbs(S.World);
  if (hasB && absA < absB) {
    // v1.0.3 (A#1): a new Day without Week/Month/Year rollover advances by whole weeks. On the same Day, only a clear
    // late-night to early-morning crossing is an implicit midnight rollover; a small backwards typo must not skip a day.
    const dayChanged = S.World.Day !== B.World.Day;
    const overnight = !dayChanged && B.World.Time >= '20:00' && S.World.Time <= '06:00';
    const step = dayChanged ? 7 * DAY_MIN : overnight ? DAY_MIN : 0, limit = dayChanged ? 60 : overnight ? 1 : 0;
    let k = 0;
    while (absA < absB && k < limit) { absA += step; k++; }
    if (absA < absB) { absA = absB; log.push('Time cannot move backwards; the clock was kept.'); }
  }
  // 1.11.1 (bug hunt): a partial calendar rollover. Month or Year changed but the Week was left as it was ("M3 W4 Sun" ->
  // "M4 W4 Mon"): when the next such Day and Time after the previous clock falls in the Month and Year written, that is the day
  // meant, not three weeks later.
  if (hasB && absA - absB > 3 * DAY_MIN && (S.World.Month !== B.World.Month || (S.World.Year || 1) !== (B.World.Year || 1))) {
    const t = hm(S.World.Time), want = DAYS.indexOf(S.World.Day);
    if (t != null && want >= 0) {
      const d0 = Math.floor(absB / DAY_MIN), add = (want - DAYS.indexOf(B.World.Day) + 7) % 7;
      let alt = (d0 + add) * DAY_MIN + t; if (alt <= absB) alt += 7 * DAY_MIN;
      const T = fromAbs(alt);
      if (T.Month === S.World.Month && T.Year === (S.World.Year || 1) && alt < absA) {
        log.push(`World.Week was not reset for the new month: the clock moved to ${stamp(T)} (the next ${S.World.Day}), not ${stamp(fromAbs(absA))}.`);
        absA = alt;
      }
    }
  }
  Object.assign(S.World, fromAbs(absA));
  const elapsed = hasB ? Math.max(0, absA - absB) : 0;
  // a jump of more than three days is shown to the player, so a mistaken date can be swiped away before it is played on
  if (elapsed > 3 * DAY_MIN) {
    const days = Math.round(elapsed / DAY_MIN);
    S.$ui.toasts.push(`Time jumped ${days} days`);
    log.push(`Time moved ${days} days in one update (to ${stamp(S.World)}). If the story did not mean a time skip, the date was written wrongly: swipe or correct it.`);
  }
  const evs = eventsOn(S.World);
  // 1.2.0: {{user}}'s birthday (Builder, Profile.Birthday "M? W? Day") joins the day's events; lore entry 508 says how it plays out
  const bd = /^M(\d{1,2}) W([1-4]) (Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.exec(String(S.Player.Profile.Birthday || '').trim());
  const bday = bd && +bd[1] === S.World.Month && +bd[2] === S.World.Week && bd[3] === S.World.Day;
  // 1.3.1: each event with today's plan (times from its lore entry), so the narrator runs the day on schedule
  S.World._Event_today = [...evs.map(e => (schedOf(e, S.World.Day) ? `${e.t} — ${schedOf(e, S.World.Day)}` : e.t) + (e.entr && (S.World.Year > 1 || num(S.Player.Profile.Year, 1) > 1) ? ` (${ENTR_BACK})` : '')), ...(bday ? [`${S.Player.Profile.Name || 'Your'}'s birthday`] : [])].join(' | ');
  S.World._Period = periodOf(S.World, evs);
  S.World._Curfew = curfewOf(S.World, evs, S);
  // F20: today's happening (visible from the day's start until its window closes)
  if (!(S.$eng.seed > 0)) S.$eng.seed = (hash32(String(seedHint || ''), stamp({ ...S.World, Year: 1 }), String(S.Player.Profile.Name || '')) % 2147483646) + 1;
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
  const goneNow = id => (S.Campus_State.Graduated || []).includes(id);   // 1.7.6: a graduate's rewards stop working
  const dayNoB = Math.floor(absB / DAY_MIN);
  // FP2: the story records the announced winner; the other nominee is always the incoming Vice President.
  // Keep a recorded result stable across swipes, updates and later school years. Year 1 has the owner's named nominees.
  {
    const C = S.Campus_State.Council, BC = hasB && B.Campus_State && B.Campus_State.Council || {};
    C.Candidates['1'] = { First: 'Florian', Second: 'Dante' };
    for (const [key, pair] of Object.entries(C.Candidates)) {
      const y = Number(key), prev = (BC.Candidates || {})[key];
      if (key === '1') continue;
      if (prev && prev.First && prev.Second) { C.Candidates[key] = prev; continue; }
      const ids = [pair.First, pair.Second].map(x => NPC_ALIAS[String(x).toLowerCase()] || x);
      const eligible = id => !!STUDENTS[id] && (STUDENTS[id][1] || 1) <= y && yearOf(id, y) >= 1 && yearOf(id, y) <= 2;
      if (!Number.isInteger(y) || y < 2 || ids[0] === ids[1] || !ids.every(eligible)) {
        delete C.Candidates[key];
        if (pair.First || pair.Second) log.push(`Council candidates for Year ${key} must be two different named students eligible to attend the next year.`);
      } else C.Candidates[key] = { First: ids[0], Second: ids[1] };
    }
    for (const [key, result] of Object.entries(C.Results)) {
      const y = Number(key), prev = (BC.Results || {})[key], pair = C.Candidates[key];
      if (prev && prev.President && prev.VicePresident) { C.Results[key] = prev; continue; }
      const winner = NPC_ALIAS[String(result.President).toLowerCase()] || result.President;
      const other = pair && (winner === pair.First ? pair.Second : winner === pair.Second ? pair.First : '');
      const close = Number.isInteger(y) && y > 0 ? toAbs({ Year: y, Month: 10, Week: 3, Day: 'Sat', Time: '16:00' }) : Infinity;
      if (!other || absA < close) {
        delete C.Results[key];
        if (result.President) log.push(`Council result for Year ${key} waits until Saturday voting closes and must name one of that year's two candidates.`);
      } else {
        C.Results[key] = { President: winner, VicePresident: other };
        if (!prev || !prev.President) jnl.push(`Student Council election: ${winner} was elected President for Year ${y + 1} and named ${other} Vice President.`);
      }
    }
    if (S.World.Year > 1 && !C.Results['1']) {
      C.Results['1'] = { President: 'Florian', VicePresident: 'Dante' };
      log.push('The Year 1 Council election was skipped in this save; Florian is the default President and Dante the Vice President for Year 2.');
    }
    const cur = S.World.Year === 1 ? { President: 'Irene', VicePresident: 'Caspian' } : C.Results[String(S.World.Year - 1)] || {};
    const elect = C.Results[String(S.World.Year)] || {};
    C.President = S.World.Month === 12 ? '' : cur.President || '';
    C.VicePresident = S.World.Month === 12 ? '' : cur.VicePresident || '';
    C.PresidentElect = elect.President || '';
    C.VicePresidentElect = elect.VicePresident || '';
  }
  // Entrance tour: a reproducible roster-first assignment, saved once so swipes and scene changes keep the same trio.
  // In Year 1 {{user}} is one of the two first-years; in later years {{user}} is the senior guide.
  if (evs.some(e => e.entr)) {
    const Y = S.World.Year, returning = Y > 1 || num(S.Player.Profile.Year, 1) > 1;
    const required = returning ? 2 : 1;
    const T = S.Campus_State.Entrance_tour, old = hasB && B.Campus_State && B.Campus_State.Entrance_tour;
    if (old && old.Year === Y && old.Guide && (old.FirstYears || []).length === required) {
      S.Campus_State.Entrance_tour = _.cloneDeep(old);
    } else {
      const unavailable = id => npcAwayIn(S, id);
      const students = Object.keys(STUDENTS).filter(id => (STUDENTS[id][1] || 1) <= Y && !unavailable(id));
      const freshmen = students.filter(id => yearOf(id, Y) === 1);
      const seniors = students.filter(id => yearOf(id, Y) >= 2 && yearOf(id, Y) <= 3);
      const ordered = (ids, key) => {
        const here = ids.filter(id => S.Scene.Present[id]);
        const rest = ids.filter(id => !S.Scene.Present[id]).sort();
        const shift = rest.length ? hash32(S.$eng.seed, Y, key) % rest.length : 0;
        return [...here, ...rest.slice(shift), ...rest.slice(0, shift)];
      };
      const proposed = (T.FirstYears || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x);
      const first = [...new Set(proposed.filter(id => freshmen.includes(id)))].slice(0, required);
      for (const id of ordered(freshmen, 'entrance-first-years')) if (first.length < required && !first.includes(id)) first.push(id);
      // Only if roster candidates cannot fill the group may a narrator-created first-year take a remaining place.
      for (const id of proposed) if (first.length < required && !STUDENTS[id] && /\s/.test(id) && !first.includes(id)) first.push(id);
      const requestedGuide = NPC_ALIAS[String(T.Guide || '').toLowerCase()] || T.Guide;
      const guide = returning ? '{{user}}' : seniors.includes(requestedGuide) ? requestedGuide
        : ordered(seniors, 'entrance-guide')[0] || (seniors.length ? '' : requestedGuide || '');
      S.Campus_State.Entrance_tour = { Year: Y, Guide: guide, FirstYears: first };
      if (hasB) log.push(`Entrance tour assigned: ${returning ? '{{user}} guides' : guide + ' guides {{user}} and'} ${first.join(' and ') || 'new first-years yet to be named'}. Keep this trio through 18:00.`);
    }
  }
  if (hasB && dayNo !== dayNoB && evs.some(e => e.ranking) && (S.$ui.off || []).includes('study')) log.push('Results & Dorm Ranking today: update Player.Profile.Dorm_rank when the results are announced.');
  if (hasB && dayNo !== dayNoB && evs.some(e => e.grad)) log.push(`Graduation today: the third-years leave by airship tomorrow morning; the engine then lists them in Campus_State.Graduated.${Object.keys(STAYS).filter(id => yearOf(id, S.World.Year) === 3 && !(S.Campus_State.Graduated || []).includes(id)).map(id => ` ${id} is not graduating (see their lore).`).join('')}`);
  // 1.7.4: {{user}} turns a year older on the first update of their birthday (once per campaign year), unless the story already
  // changed Player.Profile.Age in that update
  if (hasB && bday && dayNo !== dayNoB) {
    const bs = S.$eng.bdays || (S.$eng.bdays = []), k = `Y${S.World.Year}`;
    if (!bs.includes(k)) {
      bs.push(k);
      if (num(S.Player.Profile.Age, 18) === num(B.Player.Profile.Age, 18)) { S.Player.Profile.Age = num(S.Player.Profile.Age, 18) + 1; log.push(`Birthday: {{user}} turns ${S.Player.Profile.Age} today (Player.Profile.Age).`); }
    }
  }
  Object.assign(c, { absB, absA, elapsed, evs, dayNo, goneNow, dayNoB });
}

// ---- 1b. 1.1.0 weather (spec §4): season, sky, wind, rare weather and °C for the current block; the Divination Society forecast ----
function stepWeather(c) {
  const { S, log, hasB, absB, absA, dayNo } = c;
  const WXM = S.$ui.wxfx, seed = S.$eng.seed, TU = tuneOf(S);
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

  S.$ui.moods = {};
  if (WXM !== 'off') for (const id of Object.keys(NPC_MOODS)) if ((ARRIVES[id] || 1) <= S.World.Year && (S.Bonds[id] || (S.Scene.Present || {})[id]))
    S.$ui.moods[id] = moodOf(id, S, S.$ui.wx && !S.$ui.wx.away ? S.$ui.wx.now : null, dayNo);
  S.$ui.party = birthdayParty(S);
  Object.assign(c, { WXM, seed, TU, wxNow });
}

// ---- 2. magic: casts ----
function stepMagic(c) {
  const { S, B, log, hasB, absA, elapsed, TU, wxNow, OFF } = c;
  const V = S.Player.Vitals, M = S.Magic, T = M._Techniques || {};
  const BA = (hasB && B.Magic && B.Magic.Active) || {};
  // v1.0.3 (A#3): the AI never sees $ fields, so a whole-record replace drops them; the same effect keeps its start time
  for (const [k, e] of Object.entries(M.Active || {})) {
    const e0 = BA[k];
    if (e0 && e0.Technique === e.Technique && !(e.$started >= 0) && e0.$started >= 0) { e.$started = e0.$started; e.$settled = e0.$settled; }
  }
  const wind = wxNow && isOutdoor(S.World.Location) && !blocksWind(M.Active, T) ? wxNow.wind : '';
  const windCost = (t, amount, name) => {
    const mult = windMultiplier(t.Subtype, M._Affinity.Custom, wind), cost = Math.round(amount * mult * 100) / 100;
    if (wind && amount > 0) log.push(`${name} cost ${cost} (×${mult}, ${wind} outdoors).`);
    return cost;
  };
  if (wind && S.$ui.wx.field) S.$ui.wx.field += '; casting: Wind/Storm ×' + (wind === 'gale' ? '0.75' : '1') + ', scattered ×' + (wind === 'gale' ? '2' : '1.5') + ', body/object ×1, others ×' + (wind === 'gale' ? '1.5' : '1.25');
  // 1.9.4 (playtest Batch 4): passive mana regeneration, Mana_max / 360 per elapsed minute awake or asleep (empty to full in six
  // hours). The turn's regeneration is a pool counted once: a cast or activation that needs more than the mana on hand draws on it,
  // sustained upkeep is paid from it minute by minute, and the rest is added after upkeep (section 4).
  const regenRate = V.HP > 0 ? num(V.Mana_max, 0) / (60 * TU.mana_regen) : 0;   // 1.9.9: Settings > Body and magic (default 6 hours)
  let regenLeft = regenRate * elapsed;
  const payMana = cost => { const pool = Math.min(regenLeft, Math.max(0, cost - V.Mana)); regenLeft -= pool; V.Mana -= cost - pool; };
  const activeNow = tq => Object.values(M.Active || {}).some(e => e.Technique === tq);
  const partnerHere = pk => { const P = (M.Pacts || {})[pk] || {}; return P.Presence === 'terms' || !!P.Summoned || activeNow('Summon ' + pk); };
  // 1.12.0 (H6, planning/DRAFT_missed_reports.md): a sustained or hybrid technique reported only in Casts, with no running effect,
  // was started: it becomes an Active entry (Activation in section 3, then upkeep), not a one-off cast. More uses of a hybrid in the
  // same entry are its triggers. A pact's Summon started this way also marks the partner summoned.
  const autoStarted = new Set();
  {
    const keep = [];
    for (const c of M.Casts || []) {
      const t = T[c.Technique];
      if (t && (t.Cost_mode === 'sustained' || t.Cost_mode === 'hybrid') && !activeNow(c.Technique)) {
        const key = c.Technique in M.Active ? c.Technique + ' (started)' : c.Technique;
        M.Active[key] = { Technique: c.Technique, Note: '' }; autoStarted.add(key);
        log.push(`${c.Technique} is ${t.Cost_mode}: it now runs in Magic.Active as "${key}" (activation, then upkeep each minute); remove that entry when {{user}} ends it.`);
        if (t.Cost_mode === 'hybrid' && (c.Times || 1) > 1) keep.push({ Technique: c.Technique, Times: c.Times - 1 });
        const pm = /^\[pact\]\s*(.+)$/.exec(t.Notes || ''), pk = pm && pm[1].trim();
        if (pk && c.Technique === 'Summon ' + pk && (M.Pacts || {})[pk]) M.Pacts[pk].Summoned = true;
      } else keep.push(c);
    }
    M.Casts = keep;
  }
  // 1.12.0 (H5): a summoned pact partner and its Summon effect in Magic.Active follow each other (rule 502 asks for both). Summoned
  // written without the effect starts it; the effect removed, or Summoned turned off, dismisses the partner; an effect started
  // without Summoned sets it. A partner that lives by its terms is not summoned and is left alone.
  for (const [pk, P] of Object.entries(M.Pacts || {})) {
    const tq = 'Summon ' + pk;
    if (!P || P.Presence === 'terms' || !T[tq] || T[tq].Cost_mode === 'per_use') continue;
    const runs = activeNow(tq), ran = Object.values(BA).some(e => e && e.Technique === tq);
    const was = !!((((hasB && B.Magic && B.Magic.Pacts) || {})[pk]) || {}).Summoned;
    if (P.Summoned && !runs) {
      if (ran) { P.Summoned = false; log.push(`${pk} was dismissed (the Summon effect left Magic.Active).`); }
      else {
        const key = pk in M.Active ? tq : pk;
        M.Active[key] = { Technique: tq, Note: '' }; autoStarted.add(key);
        log.push(`${pk} was summoned: "${key}" now runs in Magic.Active (activation, then upkeep each minute).`);
      }
    } else if (!P.Summoned && runs) {
      if (was) {
        for (const [k, e] of Object.entries(M.Active)) if (e && e.Technique === tq) delete M.Active[k];
        log.push(`${pk} was dismissed: its Summon effect ended.`);
      } else P.Summoned = true;
    }
  }
  const profContext = c;
  for (const c of M.Casts || []) {
    const t = T[c.Technique];
    if (!t) { log.push(`Unknown technique "${c.Technique}" was reported; nothing was charged.`); continue; }
    // v1.0.3 (A#4/F05): a sustained effect is cast by its Active entry, which pays the Activation; a Casts entry for it is not a second cast
    if (t.Cost_mode === 'sustained' && activeNow(c.Technique)) { log.push(`${c.Technique} is sustained: its Active entry already paid the activation, so the Casts entry was not charged.`); continue; }
    // 1.3.2: a pact partner's ability ("<partner>: <ability>") works only while the partner is with {{user}} (summoned, or living
    // by its terms); otherwise nothing happened and nothing is charged
    const pm = /^\[pact\]\s*(.+)$/.exec(t.Notes || ''), pk = pm && pm[1].trim();
    if (pk && c.Technique.startsWith(pk + ': ') && !partnerHere(pk)) { log.push(`${c.Technique}: ${pk} is not summoned, so the ability could not be used; nothing was charged.`); continue; }
    // hybrid: while the effect is running, a triggered use costs Trigger; otherwise a cast costs Activation
    const running = Object.values(M.Active || {}).some(e => e.Technique === c.Technique);
    const base = t.Cost_mode === 'hybrid' && t.Trigger > 0 && running ? t.Trigger : (t.Activation || 0);
    const unit = t.Cost_mode === 'per_use' && base > 0 && !OFF.has('proficiency') && profRankOf(hasB ? B : S, 'Arcana') >= MASTERY ? Math.max(0.5, Math.round(base * 0.9 * 2) / 2) : base;   // 1.30.0: Arcane scholar
    const cost = windCost(t, unit * (c.Times || 1), c.Technique);
    if (cost > V.Mana + regenLeft) { log.push(`${c.Technique} needed ${cost} mana but only ${Math.floor(V.Mana + regenLeft)} was left: the casting strained or failed (mana now 0).`); V.Mana = 0; regenLeft = 0; }
    else { payMana(cost); profContext.profCast = true; }
  }
  M.Casts = [];

  // ---- 3. magic: sustained effects ----
  const endPact = eff => {   // v1.0.3 (F06): the engine ended a pact summon -> the spirit is no longer summoned
    const t = T[eff.Technique], m = t && /^\[pact\]\s*(.+)$/.exec(t.Notes || '');
    if (m && /^Summon /.test(eff.Technique) && M.Pacts && M.Pacts[m[1].trim()]) M.Pacts[m[1].trim()].Summoned = false;
  };
  const settle = (name, eff, until) => {
    const t = T[eff.Technique];
    const rate = t ? windCost(t, t.Upkeep_per_min || 0, name + " upkeep/min") : 0;
    const from = eff.$settled >= 0 ? eff.$settled : until;
    const mins = Math.max(0, until - from);
    if (rate <= 0 || mins <= 0) { eff.$settled = until; return true; }
    const need = rate * mins, regen = Math.min(regenLeft, regenRate * mins);   // 1.9.4: regeneration during these minutes offsets upkeep
    if (need <= V.Mana + regen) { const r = Math.min(regen, need); regenLeft -= r; V.Mana -= need - r; eff.$settled = until; return true; }
    const g = regen / mins, lasted = Math.floor(V.Mana / (rate - g));   // net drain until empty; regeneration after the end stays in the pool
    regenLeft -= g * lasted; V.Mana = 0;
    log.push(`${name} ended at ${fromAbs(from + lasted).Time}: mana ran out.`);
    return false;
  };
  // 1.12.0 (H7): an effect that only changed its name in Magic.Active (same technique) keeps running: no second Activation
  const renamed = new Set(), cont = new Set();
  for (const [name, eff] of Object.entries(M.Active)) {
    if (name in BA || !eff || autoStarted.has(name)) continue;
    const old = Object.keys(BA).find(k => !(k in M.Active) && !renamed.has(k) && BA[k] && BA[k].Technique === eff.Technique && BA[k].$started >= 0);
    if (old) { renamed.add(old); cont.add(name); eff.$started = BA[old].$started; eff.$settled = BA[old].$settled; }
  }
  for (const [name, eff] of Object.entries(BA)) {              // effects the AI ended this turn: settle up to now
    if ((!(name in M.Active) || autoStarted.has(name)) && !renamed.has(name)) settle(name, { ...eff }, absA);
  }
  const startedNow = [];                                         // 1.12.0: techniques started this update (section 8l)
  for (const [name, eff] of Object.entries(M.Active)) {
    const t = T[eff.Technique];
    if ((!(name in BA) && !cont.has(name)) || eff.$started < 0 || autoStarted.has(name)) {   // started this turn
      eff.$started = absA; eff.$settled = absA;
      if (t && t.Cost_mode !== 'per_use' && t.Activation) {
        const activation = windCost(t, t.Activation, name);
        if (activation > V.Mana + regenLeft) { log.push(`${name} could not be sustained: not enough mana to activate.`); endPact(eff); delete M.Active[name]; continue; }
        payMana(activation);
      }
      if (!t) log.push(`Active effect "${name}" names no known technique; no upkeep is charged.`);
      startedNow.push(eff.Technique);
    } else {
      if (name in BA) { eff.$started = BA[name].$started; eff.$settled = BA[name].$settled; }
      if (!settle(name, eff, absA)) { endPact(eff); delete M.Active[name]; continue; }
    }
  }
  Object.assign(c, { V, M, regenLeft, startedNow });
}

// ---- 4. rest & recovery (1.1.0: Soaked halves stamina recovery; sleep quality follows the night's weather, Full only) ----
// 1.12.0 (H1): a night skipped in one update (5 to 24 hours, 4 of them between 00:00 and 06:00) with no Resting written was
// slept, not stayed up: indoors (or on a trip), not in a battle, not under The Vigil. "awake" is a deliberate all-nighter.
function stepRest(c) {
  const { S, B, log, hasB, toolEdit, absB, absA, elapsed, seed, TU, wxNow, V, regenLeft } = c;
  if (V.Resting === 'awake') V.Resting = 'none';
  else if (hasB && !toolEdit && V.Resting === 'none' && V.HP > 0 && elapsed >= 300 && elapsed <= DAY_MIN && nightMinutes(absA) - nightMinutes(absB) >= 240
    && !(S.Battle && S.Battle.Active) && (!isOutdoor(S.World.Location) || (S.Trip && S.Trip.Active))) {
    const vig = num((((B.$eng || {}).sleep) || {}).vigilUntil, -1) > absB || (S.Consumables || []).some(x => /^the vigil$/i.test(String(x).trim()));
    if (!vig) { V.Resting = 'sleep'; log.push('{{user}} slept through the night (read from the time skip; write Resting "awake" for an all-nighter).'); }
  }
  const restedAs = V.Resting;
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
      if (h >= 6 && V.HP > 0 && !deadBefore && !Object.values(S.Player.Injuries).some(i => i.Severity === 'serious' || i.Severity === 'critical')) V.HP += 5;   // v1.0.3 (F07, D13): no sleeping back from death
    } else {
      V.Stamina += 20 * h * stMul;
    }
  }
  V.Mana += regenLeft;                                           // 1.9.4: mana regenerates passively (section 2); resting adds none
  // 1.16.1 (audit B2): a used item takes effect only if {{user}} has it: in the Bag before this reply, added to it in this reply,
  // or bought in this reply (a new Transactions line names it, e.g. a hot drink at a café). Anything else changes nothing.
  if (hasB && Array.isArray(S.Consumables) && S.Consumables.length) {
    const ik = x => String(x || '').trim().toLowerCase().replace(/^(an?|the)\s+/, '').replace(/\s*\(.*\)$/, '');
    const have = new Set([...Object.keys(B.Inventory || {}).filter(k => num((B.Inventory[k] || {}).Qty, 0) > 0), ...Object.keys(S.Inventory || {})].map(ik));
    const T0 = new Set(((B.Player || {}).Wallet || {}).Transactions || []);
    const bought = (S.Player.Wallet.Transactions || []).filter(l => !T0.has(l)).join(' | ').toLowerCase();
    S.Consumables = S.Consumables.filter(c => {
      const k = ik(c); if (!k || have.has(k) || bought.includes(k)) return true;
      log.push(`"${String(c).trim()}" was reported used, but {{user}} has none (not in the Bag, not bought in this reply): no effect.`);
      return false;
    });
  }
  updateSleep(S, hasB ? B : null, absB, absA, TU, log);
  const consumed = S.Consumables || [];                         // 1.9.5: item effects are applied with the weather effects (4b)
  S.Consumables = [];
  // 1.12.0 (H2): an item reported used lowers its Qty in the Bag by one per report, unless this update already lowered it
  if (hasB && consumed.length && _.isPlainObject(S.Inventory)) {
    const IB = B.Inventory || {}, need = _.countBy(consumed.map(x => String(x).trim().toLowerCase()));
    for (const [lk, n] of Object.entries(need)) {
      const k = Object.keys(S.Inventory).find(x => x.toLowerCase() === lk), kb = Object.keys(IB).find(x => x.toLowerCase() === lk);
      if (!k || !kb) continue;
      const extra = n - Math.max(0, num(IB[kb].Qty, 1) - num(S.Inventory[k].Qty, 1));
      if (extra > 0) S.Inventory[k].Qty = Math.max(0, num(S.Inventory[k].Qty, 1) - extra);
    }
  }
  V.Resting = 'none';
  Object.assign(c, { restedAs, Cn, consumed });
}

// ---- 4b. 1.1.0 weather effects (Full, on campus): outdoor exposure -> Soaked / Chilled / Overheated, daily Head cold roll ----
function stepExposure(c) {
  const { S, B, log, hasB, absA, elapsed, dayNo, dayNoB, WXM, seed, TU, wxNow, V, Cn, consumed } = c;
  {
    const xs = _.isPlainObject(S.$eng.wxs) ? S.$eng.wxs : (S.$eng.wxs = {});
    for (const k of ['wet', 'cold', 'hot', 'dry']) if (!(xs[k] >= 0)) xs[k] = 0;
    if (!(xs.exp > -1e9)) xs.exp = -1e9; if (!(xs.hc > -1e9)) xs.hc = -1e9;
    const C0 = (hasB && B.Player && B.Player.Conditions) || {};
    const storyNew = hasB && Object.keys(Cn).some(k => !C0[k] && k !== 'Head cold');   // the story added one (a bucket of water)
    // 1.9.4 (playtest Batch 4): /Exposure reports a direct soaking or freezing (a water or ice hit) as it happens
    const expo = (Array.isArray(S.Exposure) ? S.Exposure : []).map(e => EXPO[(e && e.Kind) || ''] ? { k: EXPO[e.Kind], why: (e.Cause || '').trim() } : null).filter(Boolean);
    S.Exposure = [];
    let hit = false;
    // 1.9.5 (playtest Batch 5): items used this reply (/Consumables) with a shop effect: clear conditions, stamina, timed gear, cold remedy
    const buff = xs.buff = _.isPlainObject(xs.buff) ? _.pickBy(xs.buff, t => t > absA) : {};
    for (const c of consumed) {
      const u = (fxOf(c) || {}).use; if (!u) continue;
      const done = [];
      for (const k of u.clears || []) if (Cn[k]) { delete Cn[k]; done.push(k + ' cleared'); if (k === 'Soaked') xs.wet = 0; if (k === 'Chilled') xs.cold = 0; if (k === 'Overheated') xs.hot = 0; }
      if (u.stamina > 0) { V.Stamina += u.stamina; done.push('+' + u.stamina + ' stamina'); }
      if (u.buff && WXM === 'full') { buff[u.buff] = Math.max(buff[u.buff] || 0, absA + u.mins); done.push(`${u.buff} until ${fromAbs(buff[u.buff]).Time}`); }
      if (u.cure && Cn[u.cure] && xs.hc > dayNo + 1) { xs.hc = dayNo + 1; done.push(u.cure.toLowerCase() + ' ends tomorrow'); }
      if (u.heal) {
        const target = Object.keys(S.Player.Injuries || {}).find(k => String(S.Player.Injuries[k].Severity).toLowerCase() === (u.heal === 'minor' ? 'minor' : 'moderate'));
        if (target) {
          if (u.heal === 'minor') { delete S.Player.Injuries[target]; done.push(`${target} healed`); }
          else { S.Player.Injuries[target].Severity = 'minor'; done.push(`${target} reduced to minor`); }
        }
      }
      if (u.fitting) done.push(`spent as a fitting ${u.fitting} item`);
      if (done.length) { log.push(`${String(c).trim()}: ${done.join(', ')}.`); S.$ui.toasts.push(`${String(c).trim()}: ${done[0]}`); }
    }
    for (const k of Object.keys(C0)) if (!Cn[k]) { if (k === 'Soaked') xs.wet = 0; if (k === 'Chilled') xs.cold = 0; if (k === 'Overheated') xs.hot = 0; if (k === 'Head cold') xs.hc = -1e9; }   // the story removed it
    if (wxNow) {
      const bk = wxNow, gear = gearOf(S.Inventory, buff, absA), since = stamp(S.World);
      const outB = hasB && isOutdoor(B.World.Location), outA = isOutdoor(S.World.Location);
      const o = elapsed > 0 ? (outB && outA ? elapsed : outB || outA ? elapsed / 2 : 0) : 0;
      const add = (k, why) => { if (!Cn[k]) { Cn[k] = { Effect: COND[k], Since: since }; S.$ui.toasts.push(`Condition: ${k}`); log.push(`{{user}} is now ${k} (${why}).`); } };
      // head cold: one roll at the first update of a new day
      if (hasB && dayNo !== dayNoB && !Cn['Head cold']) {
        const p = (xs.exp >= dayNoB ? 0.15 : 0) + (fluOn(seed, dayNo) ? 0.05 : 0) + (pctOf(V.Stamina, V.Stamina_max) < 30 ? 0.05 : 0);
        if (p > 0 && rand01(seed, dayNo, 'hc') < p) { xs.hc = dayNo + 2 + hash32(seed, dayNo, 'hcd') % 3; add('Head cold', `for ${xs.hc - dayNo} days`); }
      }
      if (Cn['Head cold'] && xs.hc > -1e9 && dayNo >= xs.hc) { delete Cn['Head cold']; xs.hc = -1e9; S.$ui.toasts.push('Head cold is over'); }
      for (const e of expo) { hit = true; add(e.k, e.why || (e.k === 'Soaked' ? 'a direct soaking' : 'a freezing hit')); }
      const dryProt = gear.waterproof || (gear.umbrella && !bk.wind && bk.sky !== 'Storm');
      xs.wet = o > 0 && wxBad(bk) && !dryProt ? xs.wet + o : 0;
      if (xs.wet >= (wxHeavy(bk) ? 5 : 20)) add('Soaked', gear.umbrella && !gear.waterproof ? 'the wind beat the umbrella' : 'caught out in the ' + (bk.snow ? 'snow' : 'rain'));
      const chillTemp = bk.temp - (bk.wind === 'gale' ? 14 : bk.wind === 'windy' ? 7 : 0);
      xs.cold = o > 0 && chillTemp <= (gear.warm ? -5 : 0) ? xs.cold + o : 0;
      if (xs.cold >= 30 || (Cn.Soaked && o > 0 && chillTemp <= (gear.warm ? 3 : 8))) add('Chilled', `${bk.temp} °C outdoors`);
      // soaked through outdoors at freezing: the chill is immediate (warm gear holds it off until the next minutes outdoors)
      if (Cn.Soaked && !C0.Soaked && outA && chillTemp <= (gear.warm ? -5 : 0)) add('Chilled', `soaked through at ${bk.temp} °C outdoors`);
      xs.hot = o > 0 && bk.temp >= (gear.sun ? 31 : 28) && (bk.sky === 'Clear' || bk.sky === 'Cloudy') ? xs.hot + o : 0;
      if (xs.hot >= 60) add('Overheated', `${bk.temp} °C in the sun`);
      if (o > 0 && (bk.wind === 'gale' || Cn.Chilled || Cn.Overheated)) V.Stamina -= (bk.wind === 'gale' ? TU.gale_stamina : 10) * o / 60;
      xs.dry = outA ? 0 : xs.dry + (outB ? elapsed - o : elapsed);
      if (storyNew || hit) xs.dry = 0;                                  // ...so it lasts its full time from now
      for (const [k, mins] of [['Soaked', 60], ['Chilled', 60], ['Overheated', 30]]) if (Cn[k] && xs.dry >= mins && !(k === 'Chilled' && xs.cold)) { delete Cn[k]; S.$ui.toasts.push(`${k}: over`); }
      if (Cn.Soaked || Cn.Chilled) xs.exp = dayNo;
      if (Cn['Head cold']) V.Stamina = Math.min(V.Stamina, V.Stamina_max * 0.8);
    }
  }
}

// ---- 5. vitals ----
function stepVitals(c) {
  const { S, B, log, hasB, V } = c;
  if (hasB) {
    const dmg = B.Player.Vitals.HP - V.HP;
    if (dmg > 40 && !V.Lethal_flag) { V.HP = B.Player.Vitals.HP - 40; log.push(`HP loss capped at 40 (no lethal flag): HP ${Math.round(V.HP)}.`); }
    if (V.HP <= 0 && B.Player.Vitals.HP > 0) log.push('{{user}} has died.');
  }
  // 1.30.0: Formidable (Prowess Rank 5): once a week, the worst new injury from a fight lands one step lighter
  if (hasB && !c.OFF.has('proficiency') && profRankOf(B, 'Prowess') >= MASTERY && ((B.Battle || {}).Active || (S.Battle || {}).Active)) {
    const P = S.$eng.prof || {}, MS = P.mastery = _.isPlainObject(P.mastery) ? P.mastery : {}, week = Math.floor(Math.floor(toAbs(S.World) / DAY_MIN) / 7);
    const SEV = ['minor', 'moderate', 'serious', 'critical'], I = S.Player.Injuries || {}, BI = B.Player.Injuries || {};
    const k = Object.keys(I).filter(x => !BI[x] && SEV.indexOf(String(I[x].Severity).toLowerCase()) > 0).sort((a, b) => SEV.indexOf(String(I[b].Severity).toLowerCase()) - SEV.indexOf(String(I[a].Severity).toLowerCase()))[0];
    if (k && _.isPlainObject(P) && MS.fight !== week) {
      MS.fight = week;
      const was = String(I[k].Severity).toLowerCase(); I[k].Severity = SEV[SEV.indexOf(was) - 1];
      log.push(`Formidable: ${k} lands one step lighter (${was} -> ${I[k].Severity}); once a week.`);
    }
  }
  V.Lethal_flag = false;
  V.HP = _.clamp(V.HP, 0, V.HP_max); V.Stamina = _.clamp(V.Stamina, 0, V.Stamina_max); V.Mana = _.clamp(V.Mana, 0, V.Mana_max);
  {                                                              // 1.9.4: the display keeps 0.1; the rounding remainder carries to the next turn
    const exact = V.Mana + (V.Mana > 0 && V.Mana < V.Mana_max ? num(S.$eng.mrem, 0) : 0);
    V.Mana = _.clamp(Math.round(exact * 10) / 10, 0, V.Mana_max);
    S.$eng.mrem = V.Mana > 0 && V.Mana < V.Mana_max ? Math.round((exact - V.Mana) * 1e6) / 1e6 : 0;
  }
  const hp = pctOf(V.HP, V.HP_max), st = pctOf(V.Stamina, V.Stamina_max);
  V._Condition = V.HP <= 0 ? 'Dead' : hp <= 30 ? 'Unconscious / Critical' : hp <= 50 ? 'Badly Injured' : hp <= 70 ? 'Hurt' : hp <= 90 ? 'Bruised' : 'Healthy';
  V._Fatigue = V.Stamina <= 0 ? 'Collapsed' : st <= 30 ? 'Exhausted' : st <= 70 ? 'Tired' : 'Fresh';
  S.$ui.training = Object.values(S.Player.Injuries).some(i => /moderate|serious|critical/.test(i.Severity)) ? 'Injured' : /Exhausted|Collapsed/.test(V._Fatigue) ? 'Too tired to train' : '';
  if (hasB && B.Player.Vitals._Condition !== V._Condition) S.$ui.toasts.push(`Condition: ${V._Condition}`);
}

// ---- 5b. 1.3.0 reputation: Academy (staff and the institution), Student (the student body), Doves (the Dovecote). Signed Rep XP
// (engine-owned, in $xp) sets the level -5..+5. The narrator reports what earned or cost reputation in /Rep_events: repeatable
// triggers are capped at REP.weekly_cap a week per reputation, events and losses are not. Bond milestones and high Tension are
// counted by the engine (§6). A pre-1.3.0 save's Public / Dorm meters became Academy / Student XP in stepMigrate.
function stepReputation(c) {
  const { S, B, log, jnl, hasB, dayNo, goneNow, dayNoB, TU } = c;
  const RP = S.Player.Profile.Reputation || (S.Player.Profile.Reputation = {});
  const RPB = hasB ? ((((B.Player || {}).Profile || {}).Reputation) || {}) : null;
  const rx = {};
  for (const r of REP.reps) rx[r] = _.clamp(num(((RPB && RPB.$xp) || RP.$xp || {})[r], 0), -REP.thresholds[4], REP.thresholds[4]);
  delete RP.Public; delete RP.Dorm;
  const weekNo = Math.floor(dayNo / 7), weekNoB = Math.floor(dayNoB / 7);
  const repw = _.isPlainObject(S.$eng.repw) && S.$eng.repw.w === weekNo ? S.$eng.repw : { w: weekNo };
  const repLv = r => repLevel(rx[r]);
  // cap: 'week' (repeatable), 'bond' (only below bond_cap_level), '' (event or loss)
  const repAdd = (r, x, why, cap) => {
    if (!REP.reps.includes(r) || !x) return 0;
    if (cap === 'bond' && !TU.rep_bond) return 0;
    if (cap === 'bond' && x > 0 && TU.rep_bond === 1 && repLv(r) >= REP.bond_cap_level) { log.push(`${r} reputation is already +${repLv(r)}: bond milestones add no more (${why}).`); return 0; }
    if (TU.rep_mult !== 1) x = Math.sign(x) * Math.max(1, Math.round(Math.abs(x) * TU.rep_mult));
    if (cap === 'week' && x > 0 && TU.rep_week > 0) {
      const room = Math.max(0, TU.rep_week - num(repw[r], 0));
      if (x > room) log.push(`${r} reputation: the weekly limit for everyday deeds (+${TU.rep_week}) is reached${room ? `; +${room} of +${x} counted` : ''} (${why}).`);
      x = Math.min(x, room); repw[r] = num(repw[r], 0) + x;
      if (!x) return 0;
    }
    const was = rx[r];
    if (r === 'Academy' && x < 0) S.$eng.wkloss = weekNo;   // 1.10.0: no clean week after this
    rx[r] = _.clamp(was + x, -REP.thresholds[4], REP.thresholds[4]);
    return rx[r] - was;
  };
  // one level up at once (Ruby, Baelin; Kuroo and Milena's tokens only below 0): Rep XP goes to where the next level begins
  const repLevelUp = (r, onlyNegative) => {
    const L = repLv(r);
    if (L >= 5 || (onlyNegative && L >= 0)) return false;
    rx[r] = Math.max(rx[r], repFloor(L + 1)); return true;
  };
  const vouchMonth = `Y${S.World.Year}M${S.World.Month}`, usedVouch = new Set();
  const vouchLedger = S.$eng.vouch = _.isPlainObject(S.$eng.vouch) ? S.$eng.vouch : {};
  for (const e of (Array.isArray(S.Rep_events) ? S.Rep_events : [])) {
    const kind = String(e.Kind || '').trim().toLowerCase(), deed = (REP.deeds || {})[kind];
    if (!deed && kind && !['repeat', 'event'].includes(kind)) { log.push(`Reputation deed "${kind}" is unknown; use a listed Kind or an explicit repeat/event entry.`); continue; }
    const r = deed ? deed[0] : REP.reps.find(x => x.toLowerCase() === String(e.Rep || '').trim().toLowerCase());
    if (!r) { log.push(`Reputation "${e.Rep}" is unknown (use Academy, Student or Doves); nothing was changed.`); continue; }
    let x = deed ? deed[1] : Math.round(num(e.XP, 0));
    if (x < 0 && e.Why) {
      const a = (S.Interactions || []).find(a => {
        const id = NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With, b = S.Bonds[id];
        return a.Kind === 'vouch' && a.Public && String(a.Rep || '').toLowerCase() === r.toLowerCase() && a.Why === e.Why
          && b && b.Rank >= 9 && b.Trust >= trustGate(id, 9) && b.Tension < 70 && S.Scene.Present[id]
          && !goneNow(id) && vouchLedger[id] !== vouchMonth && !usedVouch.has(id);
      });
      if (a) { const id = NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With, saved = Math.min(5, -x); x += saved;
        vouchLedger[id] = vouchMonth; usedVouch.add(id); log.push(`${id} vouched for {{user}} in the ${r} matter (${e.Why}): reputation loss reduced by ${saved} XP.`); }
    }
    if (S.World.Month === 10 && S.World.Week === 3 && S.World.Day === 'Sat' && r === 'Student' && x > 0 && (kind === 'club_time' || (kind !== 'event' && /\bclub\b/i.test(String(e.Why || ''))))) {
      log.push('Saturday club attendance earns no reputation during the Student Council election; the election replaced club time.');
      continue;
    }
    repAdd(r, x, e.Why || kind || 'story', deed ? deed[2] : x > 0 && kind !== 'event' ? 'week' : '');
  }
  S.Rep_events = [];
  const repSync = announce => {
    for (const r of REP.reps) {
      const L = repLevel(rx[r]), L0 = RPB ? num(RPB['_' + r], 0) : L;
      RP['_' + r] = L;
      if (announce && hasB && L !== L0) {
        const t = `${r} reputation ${L > L0 ? 'rose' : 'fell'} to ${L > 0 ? '+' : ''}${L}`;
        S.$ui.toasts.push(t); jnl.push(t + '.'); log.push(`${t}: ${repBand(r, L)}`);
        if (_.isPlainObject(S.$eng.wk)) (S.$eng.wk.rep = S.$eng.wk.rep || []).push(`${r} ${L > 0 ? '+' : ''}${L}`);   // 1.10.0 recap
      }
    }
    RP.$xp = { ...rx };
  };
  repSync(false);
  Object.assign(c, { weekNo, weekNoB, repw, repLv, repAdd, repLevelUp, repSync });
}

// ---- 5c. 1.9.8 Fortune roll (owner-approved planning/DRAFT_outside_presets.md A1). One seeded d100 per update, shown in <now>
// for the next reply: swipes of that reply re-run from this same state, so they all see the same number (no reroll by swipe).
// The narrator uses it only for an important, uncertain attempt by {{user}} (rule 504), adding these standing modifiers and the
// situation's own (fitting magic, cover, an alert opponent). Bands come from Settings (Gentle by default).
// 1.11.1 (bug hunt): a player-tool edit (Builder, Settings, calendar note) is not a story turn: it keeps the roll, so editing
// a setting and swiping cannot reroll it (the edit is inserted before the last reply since 1.9.1)
function stepFortune(c) {
  const { S, B, hasB, toolEdit, OFF, absA, seed, TU, V, M, repLv } = c;
  S.$eng.turn = hasB ? num((B.$eng || {}).turn, 0) + (toolEdit ? 0 : 1) : num(S.$eng.turn, 0);
  if (OFF.has('fortune')) S.$ui.fortune = null;
  else {
    const band = { 1: [10, 35], 2: [20, 50], 3: [30, 65] }[TU.fortune_band] || [10, 35];
    const mods = [], Cn2 = S.Player.Conditions || {}, sev = Object.values(S.Player.Injuries || {}).map(i => i.Severity);
    for (const [k, x] of [['Chilled', -10], ['Soaked', -5], ['Overheated', -5], ['Head cold', -5]]) if (Cn2[k]) mods.push(`${k} ${x}`);
    if (V._Fatigue === 'Exhausted') mods.push('Exhausted -15'); else if (V._Fatigue === 'Tired') mods.push('Tired -5');
    if (sev.some(x => /serious|critical/.test(x))) mods.push('seriously injured -20'); else if (sev.includes('moderate')) mods.push('injured -10');
    if (S.$ui.sleep && S.$ui.sleep.loss >= 0.2 && !S.$ui.sleep.flavor) mods.push('short on sleep -5');
    for (const [r, who] of [['Academy', 'staff'], ['Student', 'students'], ['Doves', 'Doves']]) { const L = repLv(r); if (L) mods.push(`with ${who} ${L > 0 ? '+' : ''}${L * 5}`); }
    const active = Object.entries(M.Active || {}).map(([k, e]) => e.Technique && e.Technique !== k ? `${k} (${e.Technique})` : k);
    S.$ui.fortune = { roll: d100(seed, 'fortune', S.$eng.turn, absA), fail: band[0], part: band[1], mods, active };
  }

  // 1.16.1 (audit B5): Rank 10 benefits suspended by low Trust, from the Trust before this reply, for the sections before the
  // bonds (exam perks); recomputed after the bonds for the rest
  S.$ui.tsusp = tsuspOf(S, (hasB && B.Bonds) || S.Bonds);
}

// ---- 5d. 1.10.0 (owner-approved planning/DRAFT_batch_fp7_fp11.md, Batch 1): FP7 attendance, FP10 weekly recap, FP12 small scenes ----
function stepSchoolWeek(c) {
  const { S, B, log, jnl, hasB, byBuilder, OFF, REPORTED, absB, absA, elapsed, evs, dayNo, goneNow, dayNoB, seed, TU, V, restedAs, weekNo, weekNoB, repLv, repAdd } = c;
  {
    const Pf = S.Player.Profile, PY = _.clamp(num(Pf.Year, 1), 1, 3), pts = x => num(((x || {}).Wallet || {}).Points, 0);
    let WK = _.isPlainObject(S.$eng.wk) ? S.$eng.wk : null;
    // week rollover: FP7 clean week and FP10 recap for the week that ended, then a fresh tally
    if (!WK || WK.w !== weekNo) {
      if (hasB && WK && WK.w === weekNoB) {
        const parts = [...(WK.ranks || []), ...(WK.rep || []).map(x => 'reputation ' + x)];
        if (!OFF.has('attendance') && num(WK.periods, 0) > 0 && !num(WK.skipped, 0) && S.$eng.wkloss !== weekNoB) {
          repAdd('Academy', 2, 'a clean week', 'week'); parts.push('a clean week');
        }
        if (num(WK.skipped, 0)) parts.push(`skipped ${WK.skipped} class${WK.skipped > 1 ? 'es' : ''}`);
        const net = pts(B.Player) - num(WK.p0, pts(B.Player)) - num(WK.pay, 0);   // monthly payouts excluded
        if (Math.abs(net) >= 300) parts.push(`points ${net > 0 ? '+' : ''}${net.toLocaleString('en')} net`);
        if (!OFF.has('recap') && (parts.length || TU.recap_mode === 2)) {
          const Wd = fromAbs(weekNoB * 7 * DAY_MIN);
          jnl.push(`Week recap (M${Wd.Month} W${Wd.Week}): ${parts.length ? parts.join('; ') : 'a quiet week'}.`);
        }
      }
      WK = S.$eng.wk = { w: weekNo, p0: hasB ? pts(B.Player) : pts(S.Player), ranks: [], rep: [], skipped: 0, periods: 0 };
    }
    // FP7: minutes in or away from the room of each class period this update overlapped (the location at the start and the end
    // of the update each count for half). Long skips (over six hours) are assumed to follow the routine.
    S.$ui.absent = null;
    const skippedNow = [];   // 1.15.0: subjects skipped in this update (a mark loses its attendance floor)
    const ATT =_.isPlainObject(S.$eng.att) ? S.$eng.att : (S.$eng.att = {});
    for (const k of ['p', 'c', 'done']) if (!_.isPlainObject(ATT[k])) ATT[k] = {};
    for (const k of Object.keys(ATT.done)) if (+k.split(':')[0] < dayNo - 1) { delete ATT.done[k]; delete ATT.p[k]; delete ATT.c[k]; }
    const inj = Object.values(S.Player.Injuries || {}).some(i => /moderate|serious|critical/.test(i.Severity));
    const pkA = placeKey(S.World.Location), pkB = hasB ? placeKey(B.World.Location) : pkA;
    // 1.11.1 (bug hunt): only a place on the Campus Map other than the class venue counts as away; a name the map does not know
    // ("Classroom", "Seminar Room 4") is the narrator's wording and gets the benefit of the doubt. A place inside a venue counts
    // as the venue (the Sparring Pavilion is in a corner of the Combat Grounds, the Forest Clearing is in the Forest).
    const knownPlace = pk => !!pk && CAMPUS.some(c => c.replace(/^the /, '') === pk);
    const VENUE_PARTS = { 'combat grounds': ['sparring pavilion'], forest: ['forest clearing'] };
    const classVenues = v => [...v, ...v.flatMap(x => VENUE_PARTS[x] || [])];
    const excused = pkA === 'medical centre' || pkB === 'medical centre' || (S.Player.Conditions || {})['Head cold'] || inj
      || (S.Trip && S.Trip.Active) || (S.Battle && S.Battle.Active) || V._Fatigue === 'Collapsed' || Pf.Dorm === 'Unsorted';
    if (hasB && elapsed > 0 && elapsed <= 360 && !OFF.has('attendance') && CLASS.tt) {
      for (let d = dayNoB; d <= dayNo; d++) {
        const Wd = fromAbs(d * DAY_MIN), evD = eventsOn(Wd), row = CLASS.tt[Wd.Day];
        if (!row || evD.some(e => e.noclass || e.home || e.lockdown || e.away)) continue;
        [[480, 600], [600, 720], [780, 960]].forEach(([s0, e0], p) => {
          const ov = Math.min(absA, d * DAY_MIN + e0) - Math.max(absB, d * DAY_MIN + s0);
          if (ov <= 0) return;
          const cell = row[p], key = `${d}:${p}`, elect = Wd.Month === 10 && Wd.Week === 3 && Wd.Day === 'Sat' && p === 2;
          const share = (v, doubt) => ov * ((v.includes(pkB) || (doubt && !knownPlace(pkB)) ? 0.5 : 0) + (v.includes(pkA) || (doubt && !knownPlace(pkA)) ? 0.5 : 0));
          if (cell[3] === 'class') {
            if (!ATT.done[key] && !(key in ATT.p)) { WK.periods++; ATT.p[key] = 0; }
            ATT.p[key] += ov - share(classVenues(cell[2]), true);
            if (!excused && !ATT.done[key] && ATT.p[key] > TU.att_minutes) {
              ATT.done[key] = true; WK.skipped++; skippedNow.push(cell[0]);
              const tch = Object.keys(CLASS.teach || {}).find(id => teaches(id, cell[0], PY) && !goneNow(id));
              repAdd('Academy', -2, `skipped ${cell[0]}`, '');
              S.$ui.absent = { cls: cell[0], teacher: tch || '' };
              log.push(`{{user}} skipped ${cell[0]} (${TIMES[p]}); Academy reputation -2.`);
            }
          } else if (cell[3] === 'clubs' && Pf.Club && !elect) {
            const v = (CLASS.clubs || {})[Pf.Club] || [];
            ATT.c[key] = num(ATT.c[key], 0) + share(v);
            if (!ATT.done[key] && ATT.c[key] >= 60) { ATT.done[key] = true; repAdd('Student', 1, `Saturday time at the ${Pf.Club}`, 'week'); }
          }
        });
      }
    }
    // FP8: study time toward the next exam week -> preparation tier; FP9: the Results days set the dorm rank
    // 1.15.0 (owner-approved planning/DRAFT_grades_exams.md): the engine marks every subject A-F from the preparation tier, the
    // attendance floor (no skipped class: at least C), skips, the condition on the exam day, training (Combat) and four bond
    // rewards; the story may move a mark one step (/Exam_events). Midterm marks post on the Friday of exam week, finals on
    // Results day. Marks set the dorm rank, Academy/Doves reputation, remedials for an F, and the rewards of an A or B.
    S.$ui.exam = null; S.$ui.ranknews = null; S.$ui.grades = null; S.$ui.posted = null;
    if (!OFF.has('study')) {
      const EXAMS = [3, 5, 9, 11], Wn = S.World;
      const nextExam = W => { const m = EXAMS.find(x => W.Month < x || (W.Month === x && W.Week === 1)); return m ? `Y${W.Year}M${m}` : `Y${W.Year + 1}M3`; };
      const key = nextExam(Wn), TIERS = ['unprepared', 'shaky', 'fair', 'solid', 'excellent'];
      const cut = { 1: [2, 6, 12, 20], 2: [4, 10, 18, 28], 3: [6, 15, 25, 40] }[TU.study_tiers] || [4, 10, 18, 28];
      let ST = _.isPlainObject(S.$eng.study) ? S.$eng.study : null;
      if (!ST) ST = S.$eng.study = { key, mins: 0, grace: hasB, hist: {} };   // a save that gains the feature mid-term: floor "fair"
      for (const k of ['hist', 'skip', 'cap', 'shift', 'res', 'marks', 'stand', 'rem', 'held']) if (!_.isPlainObject(ST[k])) ST[k] = {};
      const tierOf = () => { const h = num(ST.mins, 0) / 60; let i = cut.filter(c => h >= c).length; if (ST.grace) i = Math.max(i, 2); return i; };
      const sessOf = k => { const m = /^Y(\d+)M(\d+)$/.exec(String(k || '')); return m ? { Y: +m[1], M: +m[2], fin: +m[2] === 5 || +m[2] === 11 } : null; };
      const labelOf = c => `Y${c.Y} M${c.M} ${c.fin ? 'Finals' : 'Midterm'}`;
      const runOf = k => ({ d: hash32(seed, k, 'run') % 4, h: 8 + hash32(seed, k, 'runh') % 8 });   // {{user}}'s finals run: Mon-Thu, 08:00-15:00
      const perkOn = (id, which) => { const x = ((REW.npcs || {})[id] || {})[which], p = x && (S._Perks || {})[x.name];
        return !!(p && p.Kind !== 'memento' && !goneNow(id) && !(S.$ui.tsusp || []).includes(x.name)); };
      // the engine owns Player.Academics while the feature is on: a direct write is reverted (the story uses /Exam_events)
      const AB = hasB && B.Player && B.Player.Academics;
      if (AB && !byBuilder && !_.isEqual(S.Player.Academics, AB)) {
        S.Player.Academics = _.cloneDeep(AB);
        log.push('Player.Academics is written by the engine; the change was reverted. Report an exam moment in /Exam_events instead.');
      }
      fillShape(S.Player.Academics, { Grades: {}, Exams: {} });
      // the story's exam moments (for the exams now being prepared or sat)
      for (const e of (Array.isArray(S.Exam_events) ? S.Exam_events : [])) {
        const s = subjectOf(e.Subject);
        if (!s) { log.push(`Exam subject "${e.Subject}" is unknown (use ${SUBJECTS.join(', ')}); nothing changed.`); continue; }
        if (ST.res[ST.key] || ST.marks[ST.key]) { log.push(`The ${s} mark for these exams is already set; the story can no longer move it.`); continue; }
        if (!e.Fail && !e.Shift) continue;
        ST.shift[s] = e.Fail ? { fail: 1, why: e.Why } : { s: Math.sign(e.Shift), why: e.Why };
        log.push(`${s}: ${e.Fail ? 'failed' : e.Shift > 0 ? 'one step up' : 'one step down'} at the next marking (${e.Why || 'the story'}).`);
      }
      // Mimosa's focus draught, taken on an exam day: that day's marks follow the preparation with no penalty
      const draught = ((REW.npcs || {}).Mimosa || {}).gift;
      if (draught && REPORTED.perks.includes(draught.name.toLowerCase()) && perkOn('Mimosa', 'gift')) ST.focus = dayNo;
      // 1.30.0: score = preparation (tier x 25), proficiency (rank x 20) and attendance (% of the subject's classes since the last
      // exams), weighted 50/30/20 for theory and 30/50/20 for practicals, plus the exam-day roll (seeded per subject and exams,
      // shown from exam week). With Proficiency off, preparation stands in for it. The C floor, condition steps, make-up cap and
      // the bond rewards below are unchanged.
      const profOn = !OFF.has('proficiency') && _.isPlainObject(S.$eng.prof);
      const cs0 = sessOf(ST.key), examNow = !!cs0 && Wn.Year === cs0.Y && Wn.Month === cs0.M && Wn.Week === 1;
      const r1 = x => Math.round(x * 10) / 10;
      const markUp = () => {
        const gareth = perkOn('Gareth', 'r10'), t = Math.min(4, tierOf() + (gareth ? 1 : 0)), marks = {}, why = {};
        const prep = t * 25, prepWord = `${TIERS[t]} preparation${gareth ? " (Gareth's tutoring +1 tier)" : ''}`;
        for (const s of SUBJECTS) {
          const sk = num(ST.skip[s], 0), held = num(ST.held[s], 0), c = ST.cap[s] || {}, Wt = GRADE_W[PRACTICAL.includes(s) ? 'practical' : 'theory'];
          const stat = SUBJECT_STAT[s], rank = profOn ? profRankOf(S, stat) : -1, statPts = rank >= 0 ? rank * 20 : prep;
          const att = held ? _.clamp((held - sk) / held, 0, 1) : sk ? 0 : 1;
          const roll = 1 + hash32(seed, ST.key, 'exam', s) % 100, [, day, dayWord] = EXAM_DAY.find(([hi]) => roll <= hi);
          const luck = examNow || ST.cap[s] ? day : 0, score = r1(Wt[0] * prep + Wt[1] * statPts + Wt[2] * att * 100 + luck);
          let m = GRADE_CUT.filter(x => score >= x).length, mod = 0;
          const parts = [`${prepWord} ${r1(Wt[0] * prep)}`, rank >= 0 ? `${stat} Rank ${rank} ${r1(Wt[1] * statPts)}` : '', `attended ${Math.round(att * 100)}% ${r1(Wt[2] * att * 100)}`, luck ? `${dayWord} ${luck > 0 ? '+' : ''}${luck}` : ''];
          const r = [`${parts.filter(Boolean).join(' · ')} = ${score}: ${MARKS[m]}`];
          if (!sk && m < 2) { m = 2; r.push('no class skipped: at least C'); }
          if (c.focus) r.push('focus draught: no penalty');
          else if (c.f === 'Tired') { mod--; r.push('Tired -1'); } else if (c.f === 'Exhausted') { mod -= 2; r.push('Exhausted -2'); }
          m = _.clamp(m + mod, 0, 4);
          if (c.ex) { m = Math.min(m, 2); r.push('make-up exam: at most C'); }
          marks[s] = m; why[s] = r;
        }
        if (perkOn('Alyssa', 'r10')) {
          const p = PRACTICAL.filter(s => marks[s] < 4 && !(ST.cap[s] || {}).ex).sort((a, b) => marks[a] - marks[b])[0];
          if (p) { marks[p]++; why[p].push("Alyssa's Foresight +1"); }
        }
        for (const s of SUBJECTS) {
          const sh = ST.shift[s];
          if (sh && sh.fail) { marks[s] = 0; why[s].push(`failed (${sh.why || 'the story'})`); continue; }
          if (sh && sh.s) { marks[s] = _.clamp(marks[s] + sh.s, 0, 4); why[s].push(`${sh.why || 'the story'} ${sh.s > 0 ? '+1' : '-1'}`); }
          if (s === 'History' && marks[s] < 4 && perkOn('Layla', 'r10')) { marks[s] = 4; why[s].push("Layla's tutoring: A"); }
        }
        return { marks, why };
      };
      // the condition {{user}} sits each exam in: read on the first update after it starts
      const cs = sessOf(ST.key);
      if (cs && hasB) {
        const d0 = Math.floor(toAbs({ Year: cs.Y, Month: cs.M, Week: 1, Day: 'Mon', Time: '00:00' }) / DAY_MIN), run = runOf(ST.key);
        const hurt = Object.values(S.Player.Injuries || {}).some(i => /serious|critical/.test(i.Severity));
        for (const s of SUBJECTS) {
          const sl = cs.fin ? [run.d, run.h * 60, run.h * 60 + 120] : MID_SLOTS[s];
          if (!sl || ST.cap[s]) continue;
          const s0 = (d0 + sl[0]) * DAY_MIN + sl[1], e0 = (d0 + sl[0]) * DAY_MIN + sl[2];
          if (absA <= s0) continue;
          const known = absB < e0 && absA <= e0 + 360;   // the update reaches into the exam (a skip far past it: unknown)
          ST.cap[s] = { f: known ? V._Fatigue : '', ex: known && (pkA === 'medical centre' || V._Fatigue === 'Collapsed' || hurt), focus: ST.focus === d0 + sl[0] };
          if (ST.cap[s].ex) log.push(`${s} exam: {{user}} could not sit it (${pkA === 'medical centre' ? 'in the Medical Centre' : hurt ? 'badly injured' : 'collapsed'}); a make-up follows, marked at most C.`);
        }
      }
      // marks are set at the end of exam week (or when the next exams' count begins)
      const postDays = cs && Wn.Year === cs.Y && Wn.Month === cs.M && Wn.Week === 1 && ['Fri', 'Sat', 'Sun'].includes(Wn.Day);
      const begun = cs && absA >= toAbs({ Year: cs.Y, Month: cs.M, Week: 1, Day: 'Mon', Time: '08:00' });   // never marks exams still to come
      if (begun && hasB && !ST.res[ST.key] && !ST.marks[ST.key] && (ST.key !== key || postDays)) ST.res[ST.key] = markUp().marks;
      if (ST.key !== key) {   // an exam week has passed
        if (!(ST.key in ST.hist)) ST.hist[ST.key] = tierOf();
        Object.assign(ST, { key, mins: 0, grace: false, skip: {}, cap: {}, shift: {}, held: {} });
        delete ST.train;
      }
      for (const s of skippedNow) ST.skip[s] = num(ST.skip[s], 0) + 1;
      // 1.30.0: each class period that ends in this update is held (the subject's attendance counts skips against it)
      if (hasB && elapsed > 0 && elapsed <= 7 * DAY_MIN && CLASS.tt) for (let d = dayNoB; d <= dayNo; d++) {
        const Wd = fromAbs(d * DAY_MIN), row = CLASS.tt[Wd.Day];
        if (!row || eventsOn(Wd).some(e => e.noclass || e.home || e.lockdown || e.away)) continue;
        [600, 720, 960].forEach((e0, p) => { const cell = row[p]; if (cell && cell[3] === 'class' && absB < d * DAY_MIN + e0 && absA >= d * DAY_MIN + e0) ST.held[cell[0]] = num(ST.held[cell[0]], 0) + 1; });
      }
      // minutes: study places outside lessons (Saturday Study Hall counts), halves for the start and end of the update
      if (hasB && elapsed > 0 && elapsed <= 360 && restedAs !== 'sleep') {   // 1.12.0: Resting is reset in section 4; read what it was
        const SP = ['main library', 'study rooms', 'archive'], f = (SP.includes(pkB) ? 0.5 : 0) + (SP.includes(pkA) ? 0.5 : 0);
        let lesson = 0;
        for (let d = dayNoB; d <= dayNo; d++) {
          const Wd = fromAbs(d * DAY_MIN), row = CLASS.tt && CLASS.tt[Wd.Day];
          if (!row || eventsOn(Wd).some(e => e.noclass || e.home || e.lockdown || e.away)) continue;
          [[480, 600], [600, 720], [780, 960]].forEach(([s0, e0], p) => { if (row[p][3] === 'class') lesson += Math.max(0, Math.min(absA, d * DAY_MIN + e0) - Math.max(absB, d * DAY_MIN + s0)); });
        }
        ST.mins = num(ST.mins, 0) + Math.max(0, elapsed - lesson) * f;
      }
      for (const a of S.Interactions || []) if (String(a.Kind || '').toLowerCase() === 'study') {
        const id = NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With, b = S.Bonds[id];
        ST.mins = num(ST.mins, 0) + 60 + (b && b.Rank >= 4 && (RANK4_PARTNERS[id] || []).includes('study') ? 30 : 0);
      }
      // posting: midterm marks at once, finals on Results day. Reputation from the average (docs/design/reputation.md figures),
      // and a remedial session for each F (next week's Saturday Study Hall slot, with the subject's teacher)
      const post = sess => {
        const c = sessOf(sess), mk = ST.res[sess], label = labelOf(c), Ac = S.Player.Academics;
        delete ST.res[sess];
        const line = SUBJECTS.map(s => `${s} ${MARKS[mk[s]]}`).join(', ');
        Ac.Exams[label] = line;
        for (const s of SUBJECTS) Ac.Grades[s] = MARKS[mk[s]];
        ST.marks[sess] = mk; ST.stand = { ...mk };
        for (const k of Object.keys(ST.marks).slice(0, -8)) delete ST.marks[k];
        const avg = SUBJECTS.reduce((a, s) => a + mk[s], 0) / SUBJECTS.length, fails = SUBJECTS.filter(s => !mk[s]);
        const up = avg >= 3.5 ? 15 : avg >= 2.5 ? 8 : avg >= 1.5 ? 3 : 0;
        if (up) repAdd('Academy', up, `${label} marks`, '');
        if (fails.length) repAdd('Academy', fails.length >= 2 ? -15 : -8, `failed ${fails.join(', ')} (${label})`, '');
        if (mk['Dark Magic Defense'] === 4) repAdd('Doves', 8, `top Dark Magic Defense mark (${label})`, '');
        const rem = [];
        for (const s of fails) {
          const k = `Remedial ${s}`, t = Object.keys(CLASS.teach || {}).find(id => teaches(id, s, PY) && !goneNow(id)) || '';
          const due = stamp(fromAbs(((weekNo + 1) * 7 + 5) * DAY_MIN + 600));
          S.Commitments[k] = { Desc: `Make-up session for the ${s} F (${label}); attending turns it into a D for the dorm ranking`, Due: due, With: t, Where: '', Type: 'appointment' };
          ST.rem[k] = sess; rem.push({ s, t, due });
        }
        S.$ui.posted = { label, line, rem };
        jnl.push(`${label} marks: ${line}.`);
        S.$ui.toasts.push(`${c.fin ? 'Final' : 'Midterm'} marks posted`);
        log.push(`${label} marks posted: ${line} (average ${avg.toFixed(1)} of 4).`);
        (WK.ranks = WK.ranks || []).push(`${label} marks posted`);
      };
      for (const sess of Object.keys(ST.res)) {
        const c = sessOf(sess);
        if (!c || !_.isPlainObject(ST.res[sess])) { delete ST.res[sess]; continue; }
        if (!c.fin || absA >= toAbs({ Year: c.Y, Month: c.M, Week: 2, Day: 'Fri', Time: '00:00' })) post(sess);
      }
      // FP9: the first update of a Results day
      const rk = `Y${Wn.Year}M${Wn.Month}`;
      if (evs.some(e => e.ranking) && ST.ranked !== rk && Pf.Dorm && Pf.Dorm !== 'Unsorted') {
        ST.ranked = rk;
        // 1.15.0: the semester's marks (midterm once, finals twice; 0-4 like the tiers before); a save without them: the tiers
        const pair = Wn.Month === 5 ? [3, 5] : [9, 11], gpa = m => { const mk = ST.marks[`Y${Wn.Year}M${m}`]; return mk ? SUBJECTS.reduce((a, s) => a + num(mk[s], 0), 0) / SUBJECTS.length : null; };
        const g = pair.map(gpa), ex = pair.map(m => num(ST.hist[`Y${Wn.Year}M${m}`], 2));
        const exScore = g[1] != null ? (g[0] != null ? (g[0] + 2 * g[1]) / 3 : g[1]) : (ex[0] + ex[1]) / 2;
        const exText = g[1] != null ? `marks ${exScore.toFixed(1)} of 4` : `exams ${ex.map(i => TIERS[i]).join(' / ')}`;
        const Co = S.Competition || {}, tier = String(Co.Tier || ''), status = String(Co.Status || '').toLowerCase();
        const comp = /champion/.test(status) ? 2 : /Academy|Kingdom|World/.test(tier) || /qualified|selected/.test(status) ? 1 : 0;
        const aL = repLv('Academy'), acadPts = aL >= 2 ? 1 : aL <= -2 ? -1 : 0;
        const score = exScore + comp + acadPts + (hash32(seed, rk, 'rank') % 100) / 100 - 0.5;
        const BANDS = [[1, 1], [2, 3], [4, 10], [11, 25], [26, 50], [51, 80]];
        // 1.11.1 (bug hunt): a rank below #80 is in the last band (it used to find no band and jump to #1)
        const bandOf = r => { const i = r >= 1 ? BANDS.findIndex(([, hi]) => r <= hi) : 5; return i < 0 ? 5 : i; }, cur = num(Pf.Dorm_rank, 0), b0 = bandOf(cur);
        const want = score >= 6.5 ? 0 : score >= 5.5 ? 1 : score >= 4.2 ? 2 : score >= 3 ? 3 : score >= 1.8 ? 4 : 5;
        const step = TU.rank_move || 1, b1 = want < b0 ? Math.max(want, b0 - step) : want > b0 ? Math.min(want, b0 + step) : b0;
        const [lo, hi] = BANDS[b1], to = b1 === b0 && cur >= 1 ? cur : lo + hash32(seed, rk, 'rankpos') % (hi - lo + 1);
        Pf.Dorm_rank = to;
        if (b1 < b0) repAdd('Academy', 5, 'dorm rank up on Results day', '');
        S.$ui.ranknews = { from: cur, to, dorm: Pf.Dorm };
        log.push(`Results day: dorm rank ${cur ? '#' + cur : 'unranked'} -> #${to} (${exText}, competition +${comp}, Academy ${acadPts >= 0 ? '+' : ''}${acadPts}).`);
        if (_.isPlainObject(S.$eng.wk) && cur !== to) (S.$eng.wk.ranks = S.$eng.wk.ranks || []).push(`dorm rank #${to}`);
      }
      // paid tutoring (lore 221) in a subject whose latest mark is an A: two sessions a week, each also a Notice Board request
      const TW = ST.tw && ST.tw.w === weekNo ? ST.tw : (ST.tw = { w: weekNo, n: 0 });
      c.profTutoring = [];
      for (const t of (Array.isArray(S.Tutoring) ? S.Tutoring : [])) {
        const s = subjectOf(t.Subject);
        if (!s || num(ST.stand[s], -1) < 4) { log.push(`Tutoring ${s || t.Subject}: paid tutoring needs an A in that subject at the latest exams; nothing was paid.`); continue; }
        if (TW.n >= TUTOR_WEEK) { log.push(`Tutoring: ${TUTOR_WEEK} paid sessions already this week; no pay for another.`); continue; }
        TW.n++;
        c.profTutoring.push(s);
        S.Player.Wallet.Points = num(S.Player.Wallet.Points, 0) + TUTOR_PAY;
        S.Player.Wallet.Transactions.push(`+${TUTOR_PAY} tutoring (${s}${t.Student ? ', ' + t.Student : ''})`);
        repAdd('Student', 2, `tutoring in ${s}`, 'week');
        S.$ui.toasts.push(`Tutoring +${TUTOR_PAY} points`);
      }
      // the expected marks now (Student file, <now>), exam week, and an A's Fortune bonus
      const nx = sessOf(ST.key), fc = markUp(), run = nx.fin ? runOf(ST.key) : null;
      S.$ui.grades = { label: labelOf(nx), set: !!(ST.res[ST.key] || ST.marks[ST.key]), tier: TIERS[tierOf()], h: Math.round(num(ST.mins, 0) / 60),
        marks: _.mapValues(fc.marks, m => MARKS[m]), why: _.mapValues(fc.why, r => r.join('; ')), run: run ? `${DAYS[run.d]} ${pad(run.h)}:00` : '',
        stand: _.mapValues(ST.stand, m => MARKS[m]) };
      const examWeek = EXAMS.includes(Wn.Month) && Wn.Week === 1 && ['Mon', 'Tue', 'Wed', 'Thu'].includes(Wn.Day) && !evs.some(e => e.home);
      if (examWeek) {
        const di = DAYS.indexOf(Wn.Day), today = SUBJECTS.filter(s => (nx.fin ? run.d === di : (MID_SLOTS[s] || [])[0] === di));
        S.$ui.exam = { tier: TIERS[tierOf()], h: Math.round(num(ST.mins, 0) / 60), run: S.$ui.grades.run, today: today.map(s => ({ s, mark: MARKS[fc.marks[s]], why: fc.why[s].join('; ') })) };
      }
      if (S.$ui.fortune && Array.isArray(S.$ui.fortune.mods)) {
        const fields = new Set();
        for (const s of SUBJECTS) if (num(ST.stand[s], -1) === 4 && !fields.has(SUBJECT_STAT[s])) {
          S.$ui.fortune.mods.push(`top mark in ${s}: ${TOP_FIELD[s]} +10`);
          fields.add(SUBJECT_STAT[s]);
        }
      }
    }
    S.Exam_events = []; S.Tutoring = [];
    // FP12: on a day with nothing on the calendar, at most TU.scene_cap people with {{user}}; one more takes their leave
    S.$ui.leave = null;
    const hr = Math.floor((absA % DAY_MIN) / 60), perNow = /^P[123] /.test(S.World._Period || '');
    const partyOn = S.$ui.party && hr >= 18;
    const present = Object.keys(S.Scene.Present || {});
    if (!OFF.has('small_scenes') && !evs.length && !perNow && !partyOn && !(S.Trip && S.Trip.Active) && !(S.Battle && S.Battle.Active) && present.length > TU.scene_cap) {
      const talked = new Set((S.Interactions || []).map(a => NPC_ALIAS[String(a.With || '').toLowerCase()] || a.With));
      const dormHere = /dormitor|common room/.test(pkA);
      let pool = present.filter(id => !talked.has(id) && !(dormHere && num((S.Bonds[id] || {}).Rank, 0) >= 7));
      if (pool.length) {
        // 1.11.1: invented characters leave first, recorded as Extras or not yet, then unbonded roster people, then the lowest rank
        const rankOf = id => (S.Bonds[id] ? num(S.Bonds[id].Rank, 0) : NPC_IDS.has(NPC_ALIAS[String(id).toLowerCase()] || id) ? -1 : -2);
        pool = _.sortBy(pool, [rankOf, id => hash32(seed, dayNo, 'leave', id)]);
        S.$ui.leave = { id: pool[0], n: present.length, cap: TU.scene_cap };
      }
    }
  }
}

// ---- 6a. names revealed by the story prose (not by the update block); before 6 so a name spoken in this reply counts ----
function stepNamesInProse(c) {
  const { S, text } = c;
  if (text) {
    const prose = String(text).replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
    const names = S.$ui.names;
    // 1.11.1 (bug hunt): a first name that is also a word ("Maple leaves…", "Ruby light…") opening a sentence is no name reveal
    for (const [id, rx] of NAME_RX) if (!names.includes(id) && (ARRIVES[id] || 1) <= S.World.Year && mentionIn(prose, id, rx)) names.push(id);
  }
}

// ---- 6. bonds ----
function stepBonds(c) {
  const { S, B, log, jnl, hasB, OFF, staleDrop, evs, dayNo, goneNow, dayNoB, WXM, seed, TU, wxNow, V, weekNo, weekNoB, repLv, repAdd, repLevelUp } = c;
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
  const BB0 = (hasB && B.Bonds) || {};
  // 1.11.1 (bug hunt): a bond written straight into /Bonds passes the same gates as one started in Scene.Present: invented
  // characters (Extras) and rival academy teams never get a bond, and an incoming first-year has none before their year. Such a
  // record is removed (the "bonds cannot be removed" rule below is for real bonds).
  const noBondWhy = id => (!NPC_IDS.has(id) ? 'is not on the roster (invented characters get an Extras record, not a bond)'
    : NO_BOND.has(id) ? 'is on a rival academy team (no bond system)' : (ARRIVES[id] || 1) > S.World.Year ? `is not at Halvard until Year ${ARRIVES[id]}` : '');
  for (const id of Object.keys(S.Bonds)) {
    const why = noBondWhy(id);
    if (why) { delete S.Bonds[id]; log.push(`Bond record "${id}" was removed: ${id} ${why}.`); }
  }
  const BB = _.omitBy(BB0, (b, id) => !!noBondWhy(id));
  for (const [id, b] of Object.entries(S.Bonds)) {             // v1.0.3 (A#3): older facts survive a whole-record replace
    const o = (BB[id] && BB[id].$Known_old) || [];
    if (o.length && !(b.$Known_old || []).length) b.$Known_old = [...o];
  }
  // 1.3.3 (bug hunt): a bond is never removed by an update (a whole-/Bonds replace used to drop every bond it left out), and a
  // record rewritten whole (its facts and milestones both came back empty) keeps what it knew: facts, milestones, title, and
  // Trust / Tension where the rewrite only carried the defaults.
  {
    const kept = [], mended = [];
    for (const [id, b0] of Object.entries(BB)) if (!(id in S.Bonds) && !staleDrop.has(id)) { S.Bonds[id] = _.cloneDeep(b0); kept.push(id); }
    for (const [id, b] of Object.entries(S.Bonds)) {
      const b0 = BB[id]; if (!b0 || kept.includes(id)) continue;
      if ((b.Known_facts || []).length || (b.Milestones || []).length || !((b0.Known_facts || []).length || (b0.Milestones || []).length)) continue;
      b.Known_facts = [...(b0.Known_facts || [])]; b.Milestones = [...(b0.Milestones || [])];
      if (!b.Title) b.Title = b0.Title || '';
      // 1.17.0 (audit T3): <current_state> no longer shows Mind, Knows and Imprints of absent people, so a rewrite keeps them too
      if (!(b.Knows || []).length && (b0.Knows || []).length) b.Knows = [...b0.Knows];
      if (!(b.Imprints || []).length && (b0.Imprints || []).length) b.Imprints = _.cloneDeep(b0.Imprints);
      if (!b.Mind && b0.Mind) b.Mind = b0.Mind;
      if (!b.Next && b0.Next) b.Next = _.cloneDeep(b0.Next);
      if (num(b.Trust, 50) === 50) b.Trust = num(b0.Trust, 50);
      if (!num(b.Tension, 0)) b.Tension = num(b0.Tension, 0);
      mended.push(id);
    }
    if (kept.length) log.push(`Bond records cannot be removed (${kept.join(', ')}); they were kept. Change a bond's fields instead of replacing /Bonds.`);
    if (mended.length) log.push(`Bond record${mended.length > 1 ? 's' : ''} for ${mended.join(', ')} came back without facts or milestones; what was known was kept.`);
  }
  const seen = `${stamp(S.World)} at ${S.World.Location}`;
  // 1.30.1 (owner playtest: an invented Medical Centre healer was keyed "Mirelle Lullwyn"): the other academies' teams are never at
  // Halvard; their members meet {{user}} at the Kingdom Competition, on a trip or elsewhere off the grounds
  const onGrounds = !!plName(placeOf(S.World.Location)) && !(S.Trip && S.Trip.Active) && !evs.some(e => /Kingdom Competition/.test(e.t));
  for (const id of Object.keys(S.Scene.Present)) if (onGrounds && NO_BOND.has(id)) {
    delete S.Scene.Present[id];
    log.push(`${id} is on a rival academy's team and is never at Halvard (the teams meet at the Kingdom Competition); ${id} was removed from Scene.Present. Someone you invented gets a full name of their own (Extras), never a roster name.`);
  }
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
  // 1.12.0: a genuine encounter or a Rank 5 handover reported one update late still counts for someone present at the end of the
  // previous update (they may have left in the reply that tells it)
  const wasHere = id => hasB && !!(((B.Scene || {}).Present || {})[id]);
  const npcAway = id => npcAwayIn(S, id);   // 1.16.1 (audit B4)
  const introductions = {};
  for (const a of S.Interactions || []) {
    if (a.Kind !== 'introduction') continue;
    const id = canon(a.With), by = canon(a.By), sponsor = S.Bonds[by];
    if (NPC_IDS.has(id) && !NO_BOND.has(id) && !BB[id] && S.Bonds[id] && !introductions[id]
        && (ARRIVES[id] || 1) <= S.World.Year && S.Scene.Present[id] && S.Scene.Present[by]
        && sponsor && sponsor.Rank >= 6 && sponsor.Trust >= trustGate(by, 6) && sponsor.Tension < 70
        && !npcAway(id) && !npcAway(by)) introductions[id] = by;
  }
  S.Interactions = [];
  S.$ui.rank_cues = [];
  // 1.3.0 reputation changes how fast NPCs warm up: extra XP per counted talk or hangout (REP.bond_mod), modifiers add up
  const modBy = (rows, L) => { const hit = rows.find(([at]) => (at > 0 ? L >= at : L <= at)); return hit ? hit[1] : 0; };
  const BM = REP.bond_mod || {};
  const repMod = id => (NPC_GROUP[id] === 'staff' ? modBy(BM.staff || [], repLv('Academy')) : 0) + (NPC_GROUP[id] === 'student' ? modBy(BM.student || [], repLv('Student')) : 0)
    + ((REP.anti_doves || []).includes(id) ? modBy(BM.anti_doves || [], repLv('Doves')) : 0) + ((REP.pro_doves || []).includes(id) ? modBy(BM.pro_doves || [], repLv('Doves')) : 0);
  // 1.15.0 (planning/DRAFT_grades_exams.md): +1 XP per counted talk or hangout with a teacher of a subject {{user}} got an A or B
  // in at the latest exams (once, however many of their subjects)
  const standing = !OFF.has('study') && S.$eng.study && _.isPlainObject(S.$eng.study.stand) ? S.$eng.study.stand : {};
  const PYb = _.clamp(num(S.Player.Profile.Year, 1), 1, 3);
  const examMod = id => (SUBJECTS.some(s => num(standing[s], -1) >= 3 && teaches(id, s, PYb)) ? 1 : 0);
  // 1.3.0 mask -> truth (Castor, Kanae, Caine): the 8 -> 9 event waits until one of the NPC's secrets has come out in play
  const secretOut = id => [...(S.$ui.secrets || []), ...(S.Campus_State.Secrets_revealed || [])].some(x => String(x).toLowerCase().startsWith(id.toLowerCase() + '.'));
  const held = (id, b) => MASK.has(id) && b.Rank === 8 && !secretOut(id);
  const tenseHold = (id, b) => { const P = tensionProfile(id); return !P.exempt && !P.lock && num(b.Tension, 0) >= num(TE.hold_event_from, 70); };   // 1.3.8
  // 1.4.3; 1.6.8 (owner): the Rank 8 event waits too when this character has no rival branch (C, D)
  const trustHold = (id, b) => (b.Rank + 1 !== 8 || !canRival(id)) && num(b.Trust, 50) < trustGate(id, b.Rank + 1);
  const spreadFrom = [];
  const KR = REW.krieg || {}, weeksNew = hasB ? Math.max(0, Math.min(8, weekNo - weekNoB)) : 0;
  const b0rank = which => (which === 'gift' ? 5 : 10);
  const give = (id, which) => {                                // a Rank 5 gift / Rank 10 benefit, once
    const x = ((REW.npcs || {})[id] || {})[which];
    if (!x || !_.isPlainObject(S._Perks)) return;
    if (goneNow(id)) { log.push(`${id} has graduated: Rank ${b0rank(which)} brings no ${which === 'gift' ? 'gift' : 'Rank 10 benefit'} now.`); return; }   // 1.7.6 (owner)
    if (S._Perks[x.name] || (S.$ui.perks_used || []).some(u => u.startsWith(x.name + ' ('))) return;
    S._Perks[x.name] = { From: id, Kind: which === 'gift' ? 'gift' : 'rank10', Effect: x.text + (x.secret ? ` <narrator_only>${x.secret}</narrator_only>` : ''), Uses: x.uses || 0 };
    S.$ui.toasts.push(which === 'gift' ? `Gift from {npc:${id}}: ${x.name}` : `Rank 10 with {npc:${id}}: new benefit`);
    jnl.push(which === 'gift' ? `${id} gave {{user}} ${x.name}.` : `Rank 10 with ${id}: ${x.text.split(/(?<=\.)\s/)[0]}`);
    if (x.jump) trainJump(c, x.jump, `${x.name} (${id})`);
    if (x.rep_up && repLevelUp(x.rep_up, false)) log.push(`${x.rep_up} reputation rose one level (${id}, Rank 10).`);
  };
  const rankedUp = (id, b) => {
    const R0 = repOfNpc(id), mx = (REP.bond_milestone_xp || {})[String(b.Rank)];
    if (R0 && mx && !(b.$ms || []).includes(b.Rank)) { repAdd(R0, mx, `bond with ${id} reached Rank ${b.Rank}`, 'bond'); b.$ms = [...(b.$ms || []), b.Rank]; }   // 1.3.8: once per rank
    if (b.Rank === 5 && !goneNow(id)) b.$gift_pending = true;
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
    b.Progress = 0;
    b._Event_ready = b0 ? !!b0._Event_ready : false;
    b.$cool = b0 ? num(b0.$cool, -1) : num(b.$cool, -1);
    b.$ms = b0 ? [...(b0.$ms || [])] : [...(b.$ms || [])]; b.$tf = b0 ? num(b0.$tf, 0) : num(b.$tf, 0);   // 1.3.8 engine-owned
    b.$tdrop = b0 ? num(b0.$tdrop, -99) : num(b.$tdrop, -99);   // 1.4.3
    b.$tlast = b0 ? num(b0.$tlast, 0) : 0; b.$tbrk = b0 ? num(b0.$tbrk, 0) : 0;   // 1.4.4
    b.$Recent = b0 ? [...(b0.$Recent || [])] : [...(b.$Recent || [])];   // 1.4.4 engine-owned
    b.$Defining = b0 ? [...(b0.$Defining || [])] : [...(b.$Defining || [])];   // 1.6.0 engine-owned
    b.$gifts = _.cloneDeep(b0 ? b0.$gifts || {} : b.$gifts || {});
    b.$gift_pending = b0 ? !!b0.$gift_pending : !!b.$gift_pending;
    b.$branch = b0 ? String(b0.$branch || '') : String(b.$branch || '');   // 1.6.8 engine-owned: friend | romance | rival from Rank 8
    if (!b.$branch && b0 && b0.Rank >= 8) b.$branch = b0.Romance ? 'romance' : /rival/i.test(String(b0.Title || '')) ? 'rival' : 'friend';   // saves from before 1.6.8
    b.$Knows_old = b0 ? [...(b0.$Knows_old || [])] : [...(b.$Knows_old || [])]; b.$seen = b0 ? num(b0.$seen, -1) : num(b.$seen, -1); b.$mw = b0 ? num(b0.$mw, -1) : num(b.$mw, -1);
    const acts = [...(byId[id] || [])], rank0 = b0 ? b0.Rank : b.Rank, tw0 = num(b.Tension, 0), trw0 = num(b.Trust, 50);
    let rankTrust = 0;
    // 1.4.3: a new bond starts at the character's own Trust (owner: start by category). 1.6.11 (owner playtest: Trixie met for the
    // first time showed Trust 10, Betrayed): a number the narrator writes on a first meeting is not a deed, so it gives way too
    if (!b0 && hasB) { const s0 = trustProfile(id, S, secretOut).start + (!OFF.has('proficiency') && profRankOf(B, 'Society') >= MASTERY && (CONSUMMATE_GROUPS.includes(NPC_GROUP[id]) || NOBLES.includes(id)) ? 5 : 0); if (num(b.Trust, 50) !== 50 && num(b.Trust, 50) !== s0) log.push(`${id} is new: Trust starts at ${s0} by their nature (${num(b.Trust, 50)} written; a first meeting is not a deed).`); b.Trust = s0; }
    if (!b0 && hasB && START[id]) {                            // Etnie adopts {{user}} on sight.
      const st = START[id];
      b.Rank = st.Rank; b.$cool = dayNo + coolDays(st.Rank, PACE); xp = 0;
      if (!b.Title && st.Title) b.Title = st.Title;
      if (st.Trust) b.Trust = st.Trust;
      b.Known_facts = [...new Set([...(b.Known_facts || []), ...(st.Known_facts || [])])];
      b.Milestones = [...new Set([...(b.Milestones || []), ...(st.Milestones || [])])];
      S.$ui.toasts.push(`Bond with {npc:${id}} starts at Rank ${st.Rank}`);
      for (const m of st.Milestones || []) jnl.push(m + '.');
    } else if (!b0 && hasB && introductions[id]) {
      b.Rank = 1; b.$cool = dayNo + coolDays(1, PACE); xp = 0;
      b.Milestones = [...new Set([...(b.Milestones || []), `Introduced by ${introductions[id]}`])];
      log.push(`${introductions[id]} introduced {{user}} to ${id}; their bond begins at Rank 1.`);
    } else if (!b0 && hasB && b.Rank > 0) b.Rank = 0;
    if (b0 && b.Rank > b0.Rank) {
      b.Rank = b0.Rank;
      log.push(`Rank change for ${id} reverted: the engine deepens bonds after a real interaction, never by a direct rank write.`);
    }
    const genuine = (S.Scene.Present[id] || wasHere(id)) && !npcAway(id) && V._Fatigue !== 'Collapsed'
      && acts.some(a => /^(talk|hangout|study|gift|help|fight|keep|secret|defend|confide|birthday)$/.test(a.Kind));
    const eligible = b0 && b.Rank === b0.Rank && b.Rank < 10
      && (num(b0.$xp, 0) >= needXP(b0.Rank, PACE) || b0._Event_ready)
      && dayNo >= num(b0.$cool, -1) && !held(id, b) && !tenseHold(id, b) && !trustHold(id, b);
    if (eligible && genuine) {
      b.Rank++; xp = 0; b._Event_ready = false; b.$cool = dayNo + coolDays(b.Rank, PACE);
      // 1.16.1 (audit T4): no generic "grew closer" Milestone: $Recent records the rank, Milestones are the story's own
      jnl.push(`Bond with ${id} deepened to Rank ${b.Rank}.`);
      if (_.isPlainObject(S.$eng.wk)) (S.$eng.wk.ranks = S.$eng.wk.ranks || []).push(`${id} reached Rank ${b.Rank}`);   // 1.10.0 recap
      rankedUp(id, b); rankTrust = num(TRU.rank_up, 0);
      S.$ui.rank_cues.push({ id, rank: b.Rank });
    } else if (b0 && b.Rank < b0.Rank) {
      b._Event_ready = false; log.push(`Bond with ${id} fell to Rank ${b.Rank}.`);
    }
    let need = needXP(b.Rank, PACE);
    const xpStart = xp;   // 1.4.4: for the recent history
    // XP: talk and hangout once a day each, gifts and help a few times a week; a loved gift counts more from Rank 3
    let gain = 0, partyGain = 0;
    const birthday = npcBirthday(id, S.World), mood = WXM === 'full' ? (S.$ui.moods[id] || {}).mood : 'Normal';
    const socialMod = (mood === 'Good' ? TU.mood_xp : mood === 'Bad' ? -TU.mood_xp : 0) - (V._Fatigue === 'Exhausted' ? 1 : 0);
    const recoveryMult = birthday ? BR.birthday.recovery_mult : 1;
    const d = daily[id] && daily[id].day === dayNo ? daily[id] : { day: dayNo }, w = bweek[id] && bweek[id].w === weekNo ? bweek[id] : { w: weekNo };
    // 1.3.0 Krieg (model B): Rank 1 from his introduction (the 0 -> 1 event is ready at once); then +weekly_xp every Monday while
    // Doves reputation >= min_doves (with hidden magic, also Dove attention <= max_attention), else Tension +1. Nothing from interactions.
    if (id === KR.id) {
      byId[id] = (byId[id] || []).filter(a => /^(gift|apology|birthday)$/.test(a.Kind));
      if (b.Rank === 0) xp = need;
      else if (b0 && b.Rank < 10) for (let k = 0; k < weeksNew; k++) {
        if (repLv('Doves') >= KR.min_doves && !(S.Hidden._True_magic && num(S.Hidden.Dove_attention, 0) > KR.max_attention)) gain += KR.weekly_xp;
        else { b.Tension = _.clamp(num(b.Tension, 0) + 1, 0, 100); log.push(`Krieg: no bond progress this week (Doves reputation ${repLv('Doves')}${S.Hidden._True_magic ? ', Dove attention ' + S.Hidden.Dove_attention : ''}); Tension +1.`); }
      }
    }
    for (const a of byId[id] || []) {
      const k = String((a && a.Kind) || '').trim().toLowerCase();
      if (V._Fatigue === 'Collapsed') { log.push('Collapsed: no interaction until {{user}} wakes.'); continue; }
      if (k === 'rank_gift') {
        if (b.$gift_pending && b.Rank >= 5 && (S.Scene.Present[id] || wasHere(id)) && !npcAway(id)) {
          give(id, 'gift'); b.$gift_pending = false;
        }
      } else if (k === 'birthday_party') {
        const party = S.$ui.party, h = Number(S.World.Time.split(':')[0]);
        const atParty = party && (party.where.startsWith('The Snug') ? /snug/i.test(S.World.Location) : S.World.Location.includes(S.Player.Profile.Dorm) && /common room/i.test(S.World.Location));
        if (party && party.guests.includes(id) && S.Scene.Present[id] && h >= 18 && h < party.endHour && atParty && !d.party) { d.party = 1; partyGain += BR.birthday.party_xp; }
      } else if (k === 'talk' || k === 'hangout' || k === 'study') {
        const socialKind = k === 'study' ? 'hangout' : k;
        if ((d[socialKind] || 0) >= BR.per_day[socialKind]) continue;
        d[socialKind] = (d[socialKind] || 0) + 1;
        const studyBonus = k === 'study' && b.Rank >= 4 && (RANK4_PARTNERS[id] || []).includes('study') && S.Scene.Present[id] && !npcAway(id);
        const society = OFF.has('proficiency') ? 0 : num(S.Player._Proficiency.Society, 0);
        gain += Math.round(Math.max(0, BR.kind_xp[socialKind] + repMod(id) + examMod(id) + socialMod) * (birthday ? BR.birthday.social_mult : 1) * (studyBonus ? 1.25 : 1) * (society >= 5 ? 1.2 : society >= 4 ? 1.1 : 1));
        if (socialKind === 'hangout' && a.Invited && b.Rank >= 2 && S.Scene.Present[id] && !npcAway(id) && !w.invited) { gain++; w.invited = 1; }
      } else if (k === 'gift') {
        const bagKey = Object.keys((B || {}).Inventory || {}).find(name => name.toLowerCase() === String(a.Item || '').toLowerCase());
        const giftNote = bagKey ? String(B.Inventory[bagKey].Note || '') : '';
        const gk = giftTier(id, a.Item, a.Gift, giftNote), firstBirthday = birthday && !d.birthdayGift;
        if (a.Item) { delete b.$gifts[a.Item]; b.$gifts[a.Item] = gk; capRecord(b.$gifts, BR.gift_log_cap); }
        const tension = gk === 'hated' ? BR.gift_hated_tension : gk === 'disliked' ? BR.gift_disliked_tension : 0;
        b.Tension = _.clamp(num(b.Tension, 0) + tension * (birthday ? BR.birthday.gift_mult : 1), 0, 100);
        log.push(`${id}: ${a.Item || 'gift'} — ${gk}${firstBirthday ? ' (birthday)' : ''}.`);
        if (firstBirthday) d.birthdayGift = 1;
        else if ((w.gift || 0) >= BR.per_week.gift) { log.push(`${id} already had ${BR.per_week.gift} gifts this week: no bond XP for another.`); continue; }
        else w.gift = (w.gift || 0) + 1;
        let x = gk in BR.gift_xp ? BR.gift_xp[gk] : BR.gift_xp.neutral;
        if (gk === 'loved' && b.Rank >= BR.gift_bonus_rank) x = Math.round(x * BR.gift_bonus_mult);
        if (id !== KR.id) gain += x * (firstBirthday ? BR.birthday.gift_mult : 1);
      } else if (k === 'help') {
        if ((w.help || 0) >= BR.per_week.help) continue;
        w.help = (w.help || 0) + 1; gain += BR.kind_xp.help;
      }
    }
    // 1.1.0 weather bonus, kept: +1 once a day for time together indoors in bad weather, outdoors in fine weather, a clear Star Night
    if (V._Fatigue !== 'Collapsed' && bondWx && !d.wx && (byId[id] || []).some(a => /^(talk|hangout|study)$/i.test(String((a && a.Kind) || '').trim()))) { d.wx = 1; gain += BR.weather_xp; }
    // ---- 1.4.3 Trust: drops as the narrator wrote them (x the category), rises only from reported deeds (x the category, capped a
    // week) and a rank earned; a quiet week recovers it towards the floor; then the overrides. tr0 (before this reply) decides what
    // Trust does to Tension and apologies below.
    if (V._Fatigue === 'Collapsed') byId[id] = [];
    const RP = trustProfile(id, S, secretOut), RO = RP.o, DH = RP.dh || {};
    const tr0 = b0 ? num(b0.Trust, 50) : num(b.Trust, 50), band0 = trustBand(tr0);
    let tr = num(b.Trust, 50), tdropped = 0, trXP = 0;
    if (b0) {
      if (tr > tr0) { log.push(`${id}'s Trust cannot be raised directly (${tr0} -> ${tr} undone): report the deed as an interaction (keep, secret, defend, confide).`); tr = tr0; }
      const written = tr; let tback = 0; tr = tr0;
      // 1.4.4 (owner): once they understand {{user}} meant no harm, part of the last drop comes back (by nature, once, within 30 days)
      if ((byId[id] || []).some(a => /^understood$/i.test(String((a && a.Kind) || '').trim())) && RO.lock == null) {
        const back = Math.round(num(b.$tlast, 0) * num(RP.C.understood, 0));
        if (b.$tlast > 0 && dayNo - num(b.$tdrop, -99) <= num(TRU.understood_days, 30) && back > 0) { log.push(`${id} understands now: Trust +${back} (part of the last drop).`); tback = back; }
        else if (b.$tlast > 0) log.push(`${id} understands, but it does not give back what was lost${num(RP.C.understood, 0) ? ' (too long ago)' : ' (not in their nature)'}.`);
        b.$tlast = 0;
      }
      tr += tback;
      if (written < tr0) { tdropped = Math.ceil((tr0 - written) * RP.drop); tr -= tdropped; b.$tdrop = dayNo; b.$tlast = tdropped; }
      const kinds = { ...(TRU.kinds || {}), ...(RO.kind_extra || {}) };
      let add = 0;
      for (const a of byId[id] || []) {
        const k = String((a && a.Kind) || '').trim().toLowerCase();
        if (!(k in kinds) || d['tr_' + k]) continue;               // each kind once a day
        d['tr_' + k] = 1;
        add += kinds[k] * (a.Public && (TRU.public_mult || {})[k] ? TRU.public_mult[k] : 1) * num((RO.kind_mult || {})[k], 1);
      }
      add = Math.round(add * RP.rise);
      if (add > 0) {
        const got = Math.min(add, Math.max(0, num(TRU.weekly_cap, 8) - num(w.tr, 0)));
        if (got > 0) { w.tr = num(w.tr, 0) + got; tr += got; }
        if (got < add) log.push(`${id}: Trust rises at most +${TRU.weekly_cap} a week (+${got} of +${add} counted).`);
      }
      tr += rankTrust;
      if (weeksNew > 0 && tr < num(TRU.floor, 35) && RP.recover > 0 && dayNo - num(b.$tdrop, -99) >= 7) tr = Math.min(num(TRU.floor, 35), tr + RP.recover * weeksNew);
      if (RO.lock != null) {                                       // Althair: Trust stays put; a betrayal becomes bond XP
        if (tdropped > 0) {
          const cap = num(tensionProfile(id).daily_cap, 10), x = Math.min(Math.ceil(tdropped * num(RO.convert, 0.5)), Math.max(0, cap - num(d.tx, 0)));
          if (x > 0) { d.tx = num(d.tx, 0) + x; trXP = x; log.push(`${id} enjoyed being betrayed: Trust stays ${RO.lock}, bond XP +${x}.`); }
        }
        tr = RO.lock;
      }
      if (RO.floor_hard != null && tr < RO.floor_hard) {           // Etnie: never below 50; the rest of the blow becomes Tension
        const over = RO.floor_hard - tr; tr = RO.floor_hard;
        if (RO.overflow_to_tension) { b.Tension = _.clamp(num(b.Tension, 0) + over, 0, 100); log.push(`${id} cannot stop trusting {{user}}: it hurts instead (Tension +${over}).`); }
      }
      if (RO.floor_hidden != null) tr = Math.max(RO.floor_hidden, tr);   // Kanae while her Plan is hidden
      if (RO.cap != null) tr = Math.min(RO.cap, tr);                     // Caine and mages, until his secret is out
      if (tdropped >= num((TRU.spread || {}).at, 999) && RO.lock == null) spreadFrom.push(id);
    }
    b.Trust = _.clamp(Math.round(tr), 0, 100);
    if (birthday && !d.birthdayRemembered && (byId[id] || []).some(a => /^(gift|birthday)$/.test(a.Kind))) { d.birthdayRemembered = 1; if (RO.lock == null) { b.Trust = _.clamp(b.Trust + BR.birthday.remember_trust, 0, 100); log.push(`${id}: birthday remembered, Trust +${BR.birthday.remember_trust}.`); } }
    gain = Math.round(gain * num(DH.bond_xp_mult, 1));                   // Ottavio and his own Sky students
    // ---- 1.3.8 Tension: Althair's lock, Ezrel's half rises, fights, quiet-day decay, then its effects
    const TP = tensionProfile(id), t0 = b0 ? num(b0.Tension, 0) : num(b.Tension, 0);
    let t = num(b.Tension, 0), tgain = 0;
    if (b0 && t > t0) {
      if (TP.lock) {                                             // Althair: every rise becomes bond XP (/2, rounded up, capped a day)
        const add = Math.min(Math.ceil((t - t0) * (TP.convert || 0.5)), Math.max(0, num(TP.daily_cap, 10) - num(d.tx, 0)));
        if (add > 0) { d.tx = num(d.tx, 0) + add; tgain = add; log.push(`${id} enjoyed that: Tension stays 0, bond XP +${add}.`); }
      } else {
        const small = t - t0 <= num(TRE.small_tension_max, 15);
        const m = (mood === 'Bad' ? TU.mood_tension : 1) * TP.riseMult * num(DH.tension_rise_mult, 1) * (band0 === 'Confidant' && small ? num(TRE.confidant_small_tension_mult, 0.5) : band0 === 'Betrayed' ? num(TRE.betrayed_tension_mult, 1.5) : 1);
        if (m !== 1) t = t0 + Math.ceil((t - t0) * m);   // 1.4.3: Trust and the Dorm Head
      }
    }
    if (TP.lock) t = 0;
    // 1.4.0 (owner): an apology eases Tension by the NPC's category (or override); one a day, and each further one in the same week
    // counts half. Some NPCs take it badly (apology_npc, e.g. Sophia: it raises Tension).
    const apo = (byId[id] || []).find(a => /^apolog/i.test(String((a && a.Kind) || '').trim()));
    if (apo && !TP.lock && !d.apology) {
      const A = (TEN.apology_npc || {})[id] || TP.apology || { private: 0, public: 0 };
      let x = num(apo.Public ? A.public : A.private, 0);
      if (num(w.apo, 0) > 0) x = Math.sign(x) * Math.round(Math.abs(x) * num(TE.apology_repeat_mult, 0.5));
      if (x < 0) x = Math.round(x * num((TRE.apology_mult || {})[band0], 1) * num(DH.apology_mult, 1) * recoveryMult * (mood === 'Good' ? TU.mood_apology : 1));   // 1.4.3: how much they believe it
      d.apology = 1; w.apo = num(w.apo, 0) + 1;
      if (x < 0 && t > 0) { const was = t; t = Math.max(0, t + x); log.push(`${id} accepted the apology${apo.Public ? ' (in public)' : ''}: Tension ${was} -> ${t}.`); }
      else if (x > 0) { const was = t; t = Math.min(100, t + x * (mood === 'Bad' ? TU.mood_tension : 1)); log.push(`The apology made it worse with ${id}: Tension ${was} -> ${t}.`); }
      else if (t > 0) log.push(`An apology changes nothing with ${id}.`);
    }
    if (TP.cat === 'confrontational' && (byId[id] || []).some(a => /^fight$/i.test(String((a && a.Kind) || '').trim())) && !d.fight && t > 0) {
      d.fight = 1; const was = t; t = Math.max(0, t - num(TE.fight_ease, 25) * recoveryMult); log.push(`A fight with ${id} cleared the air: Tension ${was} -> ${t}.`);
    }
    // 1.4.4 (owner): kindness eases Tension by the character's nature (kind_ease: help / keep / defend; Social only a public
    // defence), once a day
    if (!TP.lock && t > 0 && !d.kind) {
      const KE = TP.kind_ease || {};
      const hit = (byId[id] || []).map(a => { const k = String((a && a.Kind) || '').trim().toLowerCase(); return k === 'defend' && a.Public && KE.defend_public != null ? KE.defend_public : KE[k]; }).filter(x => x < 0);
      if (hit.length) { const x = Math.min(...hit) * recoveryMult, was = t; d.kind = 1; t = Math.max(0, t + x); log.push(`${id} took the kindness to heart: Tension ${was} -> ${t}.`); }
    }
    if (b0 && hasB && dayNo > dayNoB && t <= t0 && TP.decay > 0 && t > 0) {   // quiet days (no rise in this update)
      const f = num(b.$tf, 0) + TP.decay * num(DH.tension_decay_mult, 1) * TU.tension_fade * (Math.min(60, dayNo - dayNoB) + (birthday ? recoveryMult - 1 : 0)), whole = Math.floor(f);
      t = Math.max(0, t - whole); b.$tf = r2(f - whole);
    }
    b.Tension = _.clamp(Math.round(t), 0, 100);
    if (Object.keys(d).length > 1) daily[id] = d;
    if (Object.keys(w).length > 1) bweek[id] = w;
    const cross = at => b0 && t0 < at && b.Tension >= at;
    // a public falling-out costs reputation like a bond milestone earns it (staff: Academy, students: Student, Milena: Doves).
    // 1.3.1: high Tension costs tension_xp, maximum Tension another tension_max_xp; Settings can turn it off. Kanae is exempt.
    if (TU.rep_tension && repOfNpc(id) && !TP.exempt) {
      for (const [at, x, what] of [[REP.tension_high, REP.tension_xp, 'high'], [REP.tension_max, REP.tension_max_xp, 'maximum']]) {
        if (at && x && cross(at)) {
          const got = repAdd(repOfNpc(id), x, `${what} tension with ${id}`, '');
          if (got) log.push(`${what === 'high' ? 'High' : 'Maximum'} tension with ${id}: ${repOfNpc(id)} reputation ${got} XP.`);
        }
      }
    }
    if (TU.rep_tension && TP.enemy_rep && cross(TEN.bands[TEN.bands.length - 1][0])) {   // Social: a gossip campaign
      for (const [r, x] of Object.entries(TP.enemy_rep)) { const got = repAdd(r, x, `${id} turned the students against {{user}}`, ''); if (got) log.push(`${id} turned the room against {{user}}: ${r} reputation ${got} XP.`); }
    }
    if (id === (TEN.krieg && KR.id) && cross(TEN.krieg.at)) {   // Krieg at maximum Tension: the Dovecote turns on {{user}}
      if (S.Hidden._True_magic) { S.Hidden.Dove_attention = _.clamp(num(S.Hidden.Dove_attention, 0) + num(TEN.krieg.attention, 10), 0, 100); log.push(`Krieg has made {{user}} his business: Dove attention +${TEN.krieg.attention}.`); }
      const got = repAdd('Doves', TEN.krieg.doves_xp, 'Krieg turned the Dovecote against {{user}}', ''); if (got) log.push(`Krieg turned the Dovecote against {{user}}: Doves reputation ${got} XP.`);
    }
    if (b.Tension < num(TE.rank_drop_rearm, 70)) b.$tbrk = 0;   // 1.4.4: re-armed once it has really cooled
    if (cross(num(TE.rank_drop_at, 100)) && !TP.exempt && !TP.lock && b.Rank > 0 && !b.$tbrk) {   // maximum Tension breaks a rank (once per blow-up)
      b.$tbrk = 1; b.Rank -= 1; xp = 0; b._Event_ready = false; b.$cool = dayNo + coolDays(b.Rank, PACE); need = needXP(b.Rank, PACE);
      S.$ui.toasts.push(`Bond with {npc:${id}} fell to Rank ${b.Rank}`); jnl.push(`The bond with ${id} broke down to Rank ${b.Rank}.`);
      log.push(`Maximum Tension with ${id}: the bond fell to Rank ${b.Rank}.`);
    }
    // what Tension does to the bond (everyone the same, but Kanae and Althair): Strained halves XP, Enemy stops it
    if (!TP.exempt && !TP.lock) {
      if (b.Tension >= num(TE.stop_xp_from, 90)) gain = 0;
      else if (b.Tension >= num(TE.strained_from, 40)) gain = Math.round(gain * num(TE.strained_xp_mult, 0.5));
    }
    if (trustBand(b.Trust) === 'Betrayed' && RO.lock == null && !RO.no_gates) gain = Math.round(gain * num(TRE.betrayed_xp_mult, 0.5));   // 1.4.3
    gain += tgain + trXP + partyGain;
    xp = b.Rank >= 10 ? 0 : Math.min(need, xp + gain);          // full XP waits for the next genuine interaction
    b.$xp = xp;
    const ready = b.Rank < 10 && xp >= need && dayNo >= num(b.$cool, -1) && !held(id, b) && !tenseHold(id, b) && !trustHold(id, b);
    b._Event_ready = ready; // legacy save field: readiness only, never a scripted event
    // romance opens at the rank chosen in Settings (default 8); feelings can grow earlier in the story, the flag waits.
    // 1.6.8 (owner): never for a character whose canon has no romance branch (B, D); a romance from an older save stays.
    if (hasB && b.Romance && !(b0 && b0.Romance) && !canRomance(id)) {
      b.Romance = false; log.push(`Romance with ${id} is closed (canon: ${id} does not become a romance); the flag was not set.`);
    } else if (hasB && b.Romance && !(b0 && b0.Romance) && (romRank > 10 || b.Rank < romRank)) {
      b.Romance = false;
      log.push(romRank > 10 ? `Romance flags are off (Settings); ${id}'s was not set.` : `Romance with ${id} opens at Rank ${romRank} (Settings); the flag was not set yet.`);
    } else if (hasB && b.Romance && !(b0 && b0.Romance) && b.Trust < trustGate(id, 8)) {   // 1.4.3
      b.Romance = false; log.push(`Romance with ${id} needs Trust ${trustGate(id, 8)} (now ${b.Trust}); the flag was not set yet.`);
    }
    // 1.6.8: the branch the bond took, recorded once when it reaches Rank 8 (a romance flag accepted later turns it into a romance).
    // 1.6.9 (bug hunt): decided by the Trust the 7->8 event was played on (before this reply's +3 for the rank), so a rivalry the
    // narrator was told to play at Trust 47-49 is not recorded as a best friendship.
    const tr8 = num(b0 && b0.Rank < 8 ? b0.Trust : b.Trust, 50);
    if (hasB && b.Romance && !(b0 && b0.Romance)) b.$branch = 'romance';
    else if (hasB && b.Rank >= 8 && !b.$branch) b.$branch = b.Romance ? 'romance' : canRival(id) && tr8 < trustGate(id, 8) ? 'rival' : 'friend';
    else if (b.Rank < 8 && b.$branch) b.$branch = '';
    // 1.4.4 (owner): the bond's recent history with {{user}}: when, one sentence (the narrator's Note, else the kinds), the effect.
    // Only what {{user}} did or reported: quiet-day easing and weekly recovery write no row.
    if (hasB) {
      const fx = [], dx = b.Rank < rank0 ? 0 : Math.max(0, num(b.$xp, 0) - xpStart), dT = b.Trust - (b0 ? num(b0.Trust, 50) : b.Trust), dX = b.Tension - (b0 ? num(b0.Tension, 0) : b.Tension);
      if (b0 && b.Rank > rank0) fx.push(`Rank ${rank0} → ${b.Rank}`); else if (b0 && b.Rank < rank0) fx.push(`Rank fell to ${b.Rank}`);
      if (dx > 0) fx.push(`XP +${dx}`); if (trXP + tgain > 0 && !dx) fx.push('enjoyed it');
      const sg = x => (x > 0 ? '+' + x : '−' + Math.abs(x));
      if (dT) fx.push(`Trust ${sg(dT)}`); if (dX) fx.push(`Tension ${sg(dX)}`);
      if (b.Romance && !(b0 && b0.Romance)) fx.push('romance');
      const notes = [...new Set(acts.map(a => String((a && a.Note) || '').trim()).filter(Boolean))];
      const PH = (BR.recent || {}).phrases || {}, kinds = [...new Set(acts.map(a => String((a && a.Kind) || '').trim().toLowerCase()).filter(k => PH[k]))].map(k => PH[k]);
      const said = notes.join(' ') || (kinds.length ? kinds.join(', ').replace(/^./, c => c.toUpperCase()) + '.' : '');
      let pushed = false;   // 1.10.3: a defining moment is only ever this update's own row
      if (!b0) b.$Recent.push({ w: stamp(S.World), n: `First met, at ${S.World.Location}.`, fx: b.Rank > 0 ? `Bond starts at Rank ${b.Rank}` : '' });
      else if (acts.length || fx.length && (b.Rank !== rank0 || trw0 !== num(b0.Trust, 50) || tw0 !== num(b0.Tension, 0) || dx > 0)) {
        b.$Recent.push({ w: stamp(S.World), n: said || '(no note)', fx: fx.join(', ') }); pushed = true;
      }
      b.$Recent = b.$Recent.slice(-num((BR.recent || {}).keep, 10));
      // 1.6.0 (P4): defining moments. A big row (a rank changed, Trust moved 15+, Tension rose 20+, romance began) is also kept
      // for good; at most DEFINING_MAX, the smallest leaves first (ties: the older one)
      const big = (b0 && b.Rank !== rank0 ? 3 : 0) + (Math.abs(dT) >= 15 ? Math.abs(dT) / 5 : 0) + (dX >= 20 ? dX / 10 : 0) + (b.Romance && !(b0 && b0.Romance) ? 3 : 0);
      if (b0 && big > 0 && pushed) {
        const r = b.$Recent[b.$Recent.length - 1];
        b.$Defining = [...b.$Defining, { w: r.w, n: r.n, fx: r.fx, s: Math.round(big * 10) / 10 }];
        while (b.$Defining.length > DEFINING_MAX) { let lo = 0; b.$Defining.forEach((x, i) => { if (x.s < b.$Defining[lo].s) lo = i; }); b.$Defining.splice(lo, 1); }
      }
    }
  }
  Object.assign(c, { canon, BB, daily, PACE, bweek, npcAway, spreadFrom, KR });
}

// ---- 6c. 1.6.0 (Batch C, P4/N4): what each character carries of {{user}}. Knows: dated, the latest KNOWS_VISIBLE (older
// lines move to $Knows_old). Imprints: weight 5+, at most IMPRINT_MAX; over the cap the lightest goes, and the new one must
// outweigh it; a "fixed" character (data/npc_canon.json Change) is never rewritten, only deepened; a "shaped" or "fluid" one keeps
// what the belief replaced (Was). Next (Rank NEXT_RANK+): their own plan when they leave; brought back when they meet {{user}}
// again ("since you last saw them") or, once it lapses unseen, moved into $Recent. Meanwhile: Rank MEANWHILE_RANK+ bonds unseen
// for a week get one Journal line a week about their own life.
// 1.18.0 (I6): a newly confirmed keeper of the true magic also remembers learning it.
function stepBondMemory(c) {
  const { S, B, log, jnl, hasB, absA, dayNo, weekNo, canon, BB, daily, PACE, bweek, npcAway, spreadFrom } = c;
  if (hasB && S.Hidden._True_magic) {
    const known0 = new Set(((B.Hidden || {}).Known_by || []).map(canon));
    for (const raw of S.Hidden.Known_by || []) {
      const id = canon(raw), b = S.Bonds[id];
      if (id && !known0.has(id) && b) {
        b.Knows = Array.isArray(b.Knows) ? b.Knows : [];
        if (![...b.Knows, ...(b.$Knows_old || [])].some(x => /learned .*true magic/i.test(String(x))))
          b.Knows.push(`Learned {{user}}'s true magic.`);
      }
    }
  }
  {
    const presentIds = new Set(Object.keys(S.Scene.Present || {}));
    const wasHere = new Set(Object.keys((hasB && B.Scene && B.Scene.Present) || {}));
    const since = [], mayBe = [];
    for (const [id, b] of Object.entries(S.Bonds)) {
      const b0 = BB[id] || null;
      b.Knows = (Array.isArray(b.Knows) ? b.Knows : []).map(k => String(k).trim()).filter(Boolean);
      const old0 = new Set(b0 ? [...(b0.Knows || []), ...(b0.$Knows_old || [])] : []);
      b.Knows = [...new Set(b.Knows)].map(k => (old0.has(k) ? k : /^\[(Y\d+ )?M\d{1,2} W[1-4]/.test(k) ? (S.World.Year > 1 ? withYear(k, S.World.Year) : k) : `[${dstamp(S.World)}] ${k}`));
      if (b.Knows.length > KNOWS_VISIBLE) { b.$Knows_old = [...b.$Knows_old, ...b.Knows.slice(0, b.Knows.length - KNOWS_VISIBLE)].slice(-20); b.Knows = b.Knows.slice(-KNOWS_VISIBLE); }
      b.$Knows_old = (b.$Knows_old || []).slice(-20); // diet legacy saves on their first update too
      // Imprints
      const I0 = b0 ? (b0.Imprints || []) : [], key = x => String(x.Belief || '').trim().toLowerCase();
      let I = (Array.isArray(b.Imprints) ? b.Imprints : []).filter(x => x && String(x.Belief || '').trim());
      const fresh = I.filter(x => !I0.some(y => key(y) === key(x)));
      for (const x of fresh) {
        if (!x.When) x.When = dstamp(S.World); else if (S.World.Year > 1) x.When = withYear(x.When, S.World.Year);
        if (num(x.Weight, 0) < 5) { I = I.filter(y => y !== x); log.push(`An Imprint for ${id} needs weight 5 or more (an experience that changes who they are); "${x.Belief}" was not kept. Record smaller moments as Known_facts or Knows.`); }
      }
      while (I.length > IMPRINT_MAX) {
        const kept = I.filter(y => !fresh.includes(y)), x = fresh.find(y => I.includes(y));
        if (!x) { I = I.slice(-IMPRINT_MAX); break; }
        let lo = null; for (const y of kept) if (!lo || num(y.Weight, 0) < num(lo.Weight, 0)) lo = y;
        const ch = CHANGE[id] || '';
        if (ch === 'fixed' || !lo || num(x.Weight, 0) <= num(lo.Weight, 0)) {
          I = I.filter(y => y !== x);
          log.push(ch === 'fixed' ? `${id} does not change at the core (fixed): with ${IMPRINT_MAX} Imprints, a new one can only deepen a belief they hold (edit its Weight), not replace one. "${x.Belief}" was not kept.`
            : `${id} already holds ${IMPRINT_MAX} Imprints; "${x.Belief}" (weight ${num(x.Weight, 0)}) does not outweigh the lightest one, so it was not kept.`);
        } else { x.Was = lo.Belief; I = I.filter(y => y !== lo); log.push(`${id}'s Imprint "${lo.Belief}" gave way to "${x.Belief}".`); }
      }
      b.Imprints = I.map(x => ({ Belief: String(x.Belief).trim(), Weight: _.clamp(Math.round(num(x.Weight, 5)), 5, 10), When: String(x.When || ''), From: String(x.From || ''), Was: String(x.Was || '') }));
      // Next
      let nx = b.Next && typeof b.Next === 'object' && String(b.Next.What || '').trim() ? { What: String(b.Next.What).trim(), Where: String(b.Next.Where || '').trim(), Until: String(b.Next.Until || '').trim() } : null;
      if (nx && b.Rank < NEXT_RANK) { if (!(b0 && b0.Next)) log.push(`Next plans are kept for bonds of Rank ${NEXT_RANK} or more; ${id}'s was not kept.`); nx = null; }
      const until = nx ? parseWhen(nx.Until, S.World, absA) : -1;
      if (nx && presentIds.has(id) && !wasHere.has(id) && b0 && b0.Next) {
        since.push([id, nx.What + (nx.Where ? ' (' + nx.Where + ')' : ''), nx.Until]); nx = null;
      } else if (nx && until >= 0 && until < absA && !presentIds.has(id)) {
        b.$Recent = [...b.$Recent, { w: String(nx.Until || stamp(S.World)), n: `(Off-screen) ${nx.What}${nx.Where ? ' (' + nx.Where + ')' : ''}.`, fx: '' }].slice(-num((BR.recent || {}).keep, 10)); nx = null;
      } else if (nx && !presentIds.has(id) && nx.Where && placeOf(canonLocation(nx.Where)).toLowerCase() === placeOf(S.World.Location).toLowerCase() && (until < 0 || absA <= until)) mayBe.push([id, nx.What]);
      b.Next = nx;
      // Meanwhile
      if (presentIds.has(id)) b.$seen = dayNo;
      const wk = Math.floor(dayNo / 7);
      if (hasB && b.Rank >= MEANWHILE_RANK && !presentIds.has(id) && b.$seen >= 0 && dayNo - b.$seen >= 7 && b.$mw !== wk && !S.Trip.Active) {
        b.$mw = wk;
        const what = b.Next ? b.Next.What : (HAUNT[id] ? 'was seen around ' + HAUNT[id].split(/[;,]/)[0].trim() : 'kept to their own business');
        jnl.push(`Meanwhile: ${id} ${b.Next ? 'is busy with ' + what.replace(/^./, c => c.toLowerCase()) : what}.`);
      }
    }
    S.$ui.since = since; S.$ui.maybe = mayBe;
  }
  // 1.4.3: word of a betrayal reaches the NPC's friends (their Friends lines), once; then the Rank 10 benefits Trust suspends
  for (const id of spreadFrom) {
    const hit = ((TRU.friends || {})[id] || []).filter(f => S.Bonds[f] && f !== id && ((TRU.overrides || {})[f] || {}).lock == null);
    for (const f of hit) {
      const o = (TRU.overrides || {})[f] || {}, was = S.Bonds[f].Trust; S.Bonds[f].Trust = Math.max(o.floor_hard != null ? o.floor_hard : 0, was + num(TRU.spread.friends, -5)); S.Bonds[f].$tdrop = dayNo;
      if (was !== S.Bonds[f].Trust) S.Bonds[f].$Recent = [...(S.Bonds[f].$Recent || []), { w: stamp(S.World), n: `Heard what {{user}} did to ${id}.`, fx: `Trust −${was - S.Bonds[f].Trust}` }].slice(-num((BR.recent || {}).keep, 10));   // 1.4.4
    }
    if (hit.length) log.push(`Word of what {{user}} did to ${id} reached ${hit.join(', ')}: their Trust ${TRU.spread.friends}.`);
  }
  S.$ui.tsusp = tsuspOf(S, S.Bonds);
  for (const k of Object.keys(bweek)) if (bweek[k].w !== weekNo) delete bweek[k];
  S.$eng.bweek = bweek;
  // Passive readiness and visit access. The relationship changes inside ordinary scenes.
  S.$ui.close = Object.entries(S.Bonds).filter(([id, b]) => b.Rank < 10 && num(b.$xp, 0) >= Math.ceil(needXP(b.Rank, PACE) * num(BR.close_at, 0.8))).map(([id]) => id);
  const visiting = Object.entries(S.Bonds).filter(([id, b]) => b.Rank >= 7 && b.Trust >= 50 && b.Tension < 70 && !npcAway(id));
  const accessDay = !S.Trip.Active && !/LOCKDOWN|CURFEW/.test(String(S.World._Curfew || ''));
  S.$ui.rank_access = {
    dorms: accessDay ? [...new Set(visiting.filter(([id]) => NPC_GROUP[id] === 'student' && (S.Scene.Present || {})[id]).map(([id]) => NPC_DORMS[id]).filter(Boolean))] : [],
    staff: accessDay ? visiting.filter(([id]) => NPC_GROUP[id] === 'staff' || id === 'Bobby' || id === 'Milena').map(([id]) => id) : []
  };
  for (const b of Object.values(S.Bonds)) {
    if ((b.Known_facts || []).length > FACTS_VISIBLE) {
      const over = b.Known_facts.slice(0, b.Known_facts.length - FACTS_VISIBLE);
      b.$Known_old = [...(b.$Known_old || []), ...over].slice(-20); b.Known_facts = b.Known_facts.slice(-FACTS_VISIBLE);
    }
    b.$Known_old = (b.$Known_old || []).slice(-20);
  }
  for (const id of Object.keys(daily)) if (daily[id].day !== dayNo) delete daily[id];
  S.$eng.daily = daily;
}

// Training room left on a track this week and in all (section 6b); a reward jump (section 6) skips the weekly limit only.
function trainRoom(c, k, weekly) {
  const { S, weekNo, TU } = c;
  const T = S.Player.$Training[k]; if (!T) return 0;
  if (T.w !== weekNo) { T.w = weekNo; T.wg = 0; }
  const tot = TU.trn_total > 0 ? T.base * TU.trn_total / 100 - T.gain : Infinity;   // 1.3.1 Settings: 0 = no limit
  return Math.max(0, weekly && TU.trn_week > 0 ? Math.min(T.base * TU.trn_week / 100 - T.wg, tot) : tot);
}
function trainAdd(c, k, amt, weekly) {
  const S = c.S, T = S.Player.$Training[k], f = TRN.tracks[k].field, add = r2(Math.max(0, Math.min(amt, trainRoom(c, k, weekly))));
  if (add > 0) { S.Player.Vitals[f] = r2(S.Player.Vitals[f] + add); T.gain = r2(T.gain + add); if (weekly) T.wg = r2(T.wg + add); }
  return add;
}
function trainJump(c, k, why) {
  const S = c.S, T = S.Player.$Training[k]; if (!T) return;
  const add = trainAdd(c, k, T.base * REW.jump_pct / 100, false);
  c.log.push(add > 0 ? `${TRN.tracks[k].label} +${add} at once (${why}).` : `${TRN.tracks[k].label} is already at its training limit; ${why} adds nothing.`);
  if (add > 0) S.$ui.toasts.push(`${TRN.tracks[k].label} +${add}`);
}

// ---- 6b. 1.3.0 training: Mana pool (Mana_max) and Stamina (Stamina_max). The narrator reports sessions in /Training. One session
// adds TRN.session_pct % of the starting value x (1 + partner bonuses), at most TRN.weekly_pct % a week and TRN.total_pct % in all.
// Partners: an NPC whose Rank 5 gift is a training bonus for that track, in the scene. Jumps (rewards) skip the weekly limit only.
function stepTraining(c) {
  const { S, log, OFF, goneNow, TU, V, canon, npcAway } = c;
  {
    const here = new Set(Object.keys(S.Scene.Present || {}).map(canon));
    // 1.7.0: a Rank 10 benefit can carry the training bonus too (Linus: mana, Tsubaki: stamina); a suspended benefit (low Trust) does not count
    const partners = k => Object.entries(REW.npcs || {}).filter(([id, x]) => here.has(id) && !goneNow(id) && ['gift', 'r10'].some(g => x[g] && x[g].train === k && S._Perks[x[g].name] && S._Perks[x[g].name].Kind !== 'memento' && !(S.$ui.tsusp || []).includes(x[g].name))).map(([id]) => id);
    for (const x of (Array.isArray(S.Training) ? S.Training : [])) {
      const k = /mana/.test(x.Track) ? 'mana' : /stam/.test(x.Track) ? 'stamina' : '';
      if (!k || !S.Player.$Training[k]) { log.push(`Training track "${x.Track}" is unknown (use mana or stamina); nothing was added.`); continue; }
      const injury = Object.values(S.Player.Injuries).find(i => /serious|critical/.test(i.Severity) || k === 'stamina' && i.Severity === 'moderate');
      if (injury || /Exhausted|Collapsed/.test(V._Fatigue)) { log.push(`Training ${k}: ${injury ? 'Injured' : 'Too tired to train'}; no gain.`); continue; }
      const fatigueMult = V._Fatigue === 'Tired' ? TU.tired_training : 1;
      const T = S.Player.$Training[k], pr = partners(k), partner = canon(x.Partner), pb = S.Bonds[partner];
      const r4 = !!(pb && pb.Rank >= 4 && pb.Trust >= 35 && pb.Tension < 70 && here.has(partner) && !npcAway(partner)
        && (RANK4_PARTNERS[partner] || []).includes(k));
      const mult = 1 + pr.length * REW.train_bonus + (r4 ? 0.25 : 0), lab = TRN.tracks[k].label;
      const add = trainAdd(c, k, T.base * TU.trn_session / 100 * mult * fatigueMult, true), lim = TU.trn_total > 0 ? r2(T.base * TU.trn_total / 100) : 0;
      if (add > 0) log.push(`Training: ${lab} +${add}${fatigueMult < 1 ? ' (Tired: half gain)' : ''}${pr.length || r4 ? ` (with ${[...new Set([...pr, ...(r4 ? [partner] : [])])].join(' and ')}, x${mult})` : ''}; ${r2(T.gain)}${lim ? ` of ${lim}` : ''} trained so far.`);
      else log.push(lim && T.gain >= lim ? `Training: ${lab} has reached its limit (+${TU.trn_total}% of the starting value); training keeps {{user}} in shape but adds no more.` : `Training: ${lab} already gained all it can this week.`);
    }
    S.Training = [];
  }
}

// 1.26–1.27: six broad abilities. Only this step writes ranks and XP. A practice report is
// checked against both ends of the move, the actual elapsed time and the week's limits.
function stepProficiency(c) {
  const { S, B, log, jnl, hasB, byBuilder, OFF, REPORTED, elapsed, absB, absA, dayNo, weekNo, TU } = c;
  const reports = Array.isArray(S.Practice) ? S.Practice : [];
  const sales = Array.isArray(S.Craft_sales) ? S.Craft_sales : [];
  S.Practice = [];
  S.Craft_sales = [];
  S.$ui.practice = [];
  S.$ui.craft = [];
  S.$ui.craft_sale = null;
  S.$ui.mastery = null;
  if (OFF.has('proficiency')) return;
  const ranks = S.Player._Proficiency || (S.Player._Proficiency = {});
  let P = S.$eng.prof;
  if (!_.isPlainObject(P)) P = S.$eng.prof = { xp: {}, wk: { w: -1 }, days: {}, picked: false };
  S.$eng.profv = 1;
  if (!_.isPlainObject(P.xp)) P.xp = {};
  if (!_.isPlainObject(P.days)) P.days = {};
  for (const k of PROF) {
    const old = hasB ? num((((B.Player || {})._Proficiency || {})[k]), 0) : 0;
    const selected = _.clamp(Math.round(num(ranks[k], 0)), 0, 5);
    if (byBuilder && selected !== old) P.xp[k] = PROF_CUT[selected];
    else if (!Number.isFinite(Number(P.xp[k]))) P.xp[k] = PROF_CUT[old];
    P.xp[k] = _.clamp(Math.round(num(P.xp[k], 0)), 0, 150);
    ranks[k] = PROF_CUT.filter(x => P.xp[k] >= x).length - 1;
  }
  if (byBuilder) { P.picked = true; S.$ui.prof_offer = false; }
  const oldWeek = _.isPlainObject(P.wk) ? P.wk : { w: -1 };
  const gain = (k, amount, why, capped = true) => {
    if (!PROF.includes(k) || amount <= 0) return 0;
    const room = capped ? Math.max(0, TU.prof_pace - num(P.wk[k], 0)) : amount;
    const add = Math.min(amount, room, 150 - P.xp[k]);
    if (add <= 0) return 0;
    P.xp[k] += add;
    if (capped) P.wk[k] = num(P.wk[k], 0) + add;
    const rank = PROF_CUT.filter(x => P.xp[k] >= x).length - 1;
    if (rank > ranks[k]) {
      ranks[k] = rank;
      const line = `${k} reached Rank ${rank} (${PROF_NAMES[k][rank]}).`;
      jnl.push(line); S.$ui.toasts.push(rank >= MASTERY ? `Mastery: ${PROF_NAMES[k][MASTERY]}` : `${k}: ${PROF_NAMES[k][rank]} (Rank ${rank})`);
    }
    log.push(`${k} proficiency +${add} (${why}); ${P.xp[k]}/150 XP.`);
    return add;
  };
  if (oldWeek.w !== weekNo) {
    P.wk = { w: weekNo, classes: {}, missed: {}, paid: 0 };
    if (oldWeek.w >= 0 && oldWeek.w === weekNo - 1)
      for (const k of PROF) if (Object.values(oldWeek.classes || {}).some(s => SUBJECT_STAT[s] === k) && !Object.keys(oldWeek.missed || {}).some(s => SUBJECT_STAT[s] === k))
        gain(k, 2, 'all attended classes last week', false);
  }
  // The attendance engine marks a skipped period in att.done. Count classes only after a
  // whole period has elapsed; a short visit to a classroom cannot earn a week's allowance.
  if (hasB && elapsed > 0 && elapsed <= 7 * DAY_MIN) for (let d = Math.floor(absB / DAY_MIN); d <= dayNo; d++) {
    const W = fromAbs(d * DAY_MIN), row = CLASS.tt && CLASS.tt[W.Day];
    if (!row || Math.floor(d / 7) !== weekNo) continue;
    for (const [p, end] of [[0,600],[1,720],[2,960]]) {
      const cell = row[p], key = `${d}:${p}`;
      if (cell && cell[3] === 'class' && absB < d * DAY_MIN + end && absA >= d * DAY_MIN + end) {
        if (((S.$eng.att || {}).done || {})[key]) P.wk.missed[cell[0]] = true;
        else P.wk.classes[cell[0]] = true;
      }
    }
  }
  // Sources already reported or computed elsewhere in the engine.
  if (hasB && !c.toolEdit) {
    const previous = ((B.Player || {}).Academics || {}).Grades || {};
    for (const [s, mark] of Object.entries(S.Player.Academics.Grades || {})) if (mark !== previous[s] && /^(A|B)$/.test(mark)) gain(SUBJECT_STAT[s], mark === 'A' ? 4 : 2, `${s} exam`, false);
    const studied = Math.max(0, num((S.$eng.study || {}).mins, 0) - num(((B.$eng || {}).study || {}).mins, 0));
    if (['main library','study rooms','archive'].includes(placeKey(S.World.Location))) {
      P.study = num(P.study, 0) + studied;
      const n = Math.floor(P.study / 120); if (n) { P.study %= 120; gain('Knowledge', n, 'study time'); }
    }
    if ((REPORTED.acts || []).some(a => /^(talk|hangout|gift)$/.test(a.Kind)) && P.days.society !== dayNo) { P.days.society = dayNo; gain('Society', 1, 'social interaction'); }
    if (c.profCast && P.days.arcana !== dayNo) { P.days.arcana = dayNo; gain('Arcana', 1, 'casting'); }
    if (B.Battle && B.Battle.Active && !S.Battle.Active) gain('Prowess', 1, 'battle finished');
    for (const s of c.profTutoring || []) gain(SUBJECT_STAT[s], 1, 'tutoring');
    if (S.World.Day === 'Sat' && num(((S.$eng.att || {}).c || {})[`${dayNo}:2`], 0) >= 60 && P.days.club !== dayNo) {
      P.days.club = dayNo;
      const club = S.Player.Profile.Club || '';
      const stat = PROF.find(k => (CLUB_STATS[k] || []).some(n => club.toLowerCase().includes(n.toLowerCase())));
      if (stat) gain(stat, 1, 'Saturday club time');
    }
  }
  const locName = x => placeKey(x.name);
  const here = placeKey(S.World.Location), before = hasB ? placeKey(B.World.Location) : here;
  const inScene = name => Object.keys(S.Scene.Present || {}).some(id => id.toLowerCase() === String(name || '').toLowerCase() || (NPC_ALIAS[String(name || '').toLowerCase()] || '') === id);
  const whyLocked = (a, report) => {
    const hr = hm(S.World.Time) || 0, club = S.Player.Profile.Club || '', withName = report && report.With;
    if (a.afterClass && hr < 960) return 'after lessons';
    if (a.until && hr > a.until) return 'closed for the day';
    if (a.night && (hr < 1080 || hr >= 1440)) return 'night only';
    if (a.daylight && (hr < 360 || hr >= (SEASONS[S.World.Month - 1] === 'Winter' ? 960 : 1080))) return 'daylight only';
    if (a.clear && !OFF.has('weather') && !/clear/i.test(String(S.World._Weather || ''))) return 'clear sky needed';
    if (a.seasons && !a.seasons.includes(SEASONS[S.World.Month - 1])) return `${a.seasons.join(' or ')} only`;
    if (a.dorm && (S.Player.Profile.Dorm === 'Unsorted' || ['Fire','Light','Sky','Viridian'].some(dm => new RegExp(`\\b${dm}\\b`, 'i').test(S.World.Location) && dm !== S.Player.Profile.Dorm))) return 'your dorm area';
    const partnerId = NPC_ALIAS[String(withName || '').toLowerCase()] || withName;
    const helpingMember = withName && inScene(withName) && (CLUB_MEMBERS[a.club + ' Club'] || []).includes(partnerId);
    const kitchenPermission = a.club === 'Cooking' && withName && inScene(withName) && /cook|chef/i.test(withName);
    if (a.club && !club.toLowerCase().includes(a.club.toLowerCase()) && !helpingMember && !kitchenPermission) return `${a.club} Club`;
    if (a.clubAny && !a.clubAny.some(n => club.toLowerCase().includes(n.toLowerCase()))) return `${a.clubAny.join(', ')} club`;
    if (a.partner && (report ? (!withName || !inScene(withName)) : !Object.keys(S.Scene.Present || {}).length)) return 'a partner present';
    if (a.action === 'Spar with a partner' && withName && NPC_DORMS[NPC_ALIAS[withName.toLowerCase()] || withName] !== S.Player.Profile.Dorm && !/Training Week/i.test(S.World._Event_today || '')) return 'a partner from your dorm';
    if (a.cost && S.Player.Wallet.Points < a.cost) return `${a.cost} points`;
    if (a.materials && !Object.keys(S.Inventory || {}).some(n => CRAFT_PORTABLE.has(n.toLowerCase()) && num(S.Inventory[n].Qty, 0) > 0)) return 'materials in Bag';
    if (a.train && (/Exhausted|Collapsed/.test(S.Player.Vitals._Fatigue) || Object.values(S.Player.Injuries || {}).some(i => /serious|critical/.test(i.Severity) || a.train === 'stamina' && i.Severity === 'moderate'))) return 'fit enough to train';
    return '';
  };
  // 1.29.0: each craft group lists the Practice actions it can be done under (data/crafts.json groups), with an optional extra club
  const craftGroup = recipe => (CRAFTS.groups || {})[recipe.group] || {};
  const craftActs = (recipe, place) => (craftGroup(recipe).actions || []).map(g => [g, PRACTICE.find(x => x.action === g.action && locName(x) === place)]).filter(([, a]) => a);
  const craftItem = (I, name) => Object.keys(I || {}).find(k => k.toLowerCase() === String(name).toLowerCase());
  const craftQty = (I, name) => { const k = craftItem(I, name); return k ? num(I[k].Qty, 0) : 0; };
  const craftExpert = (state, recipe) => (craftGroup(recipe).experts || []).some(n => Object.keys((state.Scene || {}).Present || {}).some(id => id.toLowerCase() === n.toLowerCase()));
  const craftMaterial = (I, recipe) => (recipe.materials || [[]]).find(option => option.every(m => craftQty(I, m.item) >= m.qty));
  const craftTarget = (I, recipe, named) => {
    if (!recipe.target) return '';
    const items = named ? [craftItem(I, named)].filter(Boolean) : Object.keys(I || {});
    return items.find(k => recipe.target === 'repair' ? /\bdamaged\b/i.test(String(I[k].Note || ''))
      : recipe.target === 'mend' ? CRAFT_CLOTHES.test(k) && /\bdamaged\b/i.test(String(I[k].Note || ''))
      : CRAFT_CLOTHES.test(k) && !/enchanted/i.test(String(I[k].Note || ''))) || '';
  };
  const craftReady = (recipe, state, report) => {
    const acts = craftActs(recipe, placeKey(state.World.Location)), club = String(state.Player.Profile.Club || '').toLowerCase();
    if (!acts.length) return { why: 'this craft is not available here' };
    let a = null, locked = '';
    for (const [g, x] of acts) {
      const why = whyLocked(x, report) || (g.club && !club.includes(g.club.toLowerCase()) ? `${g.club} Club` : '');
      if (!why) { a = x; break; }
      locked = locked || why;
    }
    if (!a) return { why: locked };
    if (recipe.tier === 'advanced' && num(state.Player._Proficiency.Craft, 0) < 3 && !craftExpert(state, recipe)) return { why: 'Craft Rank 3 or an expert present' };
    if (recipe.arcana && num(state.Player._Proficiency.Arcana, 0) < recipe.arcana) return { why: `Arcana Rank ${recipe.arcana}` };
    const material = craftMaterial(state.Inventory, recipe);
    if (!material) return { why: 'ingredients in Bag' };
    const target = craftTarget(state.Inventory, recipe, report && report.Subject);
    if (recipe.target && !target) return { why: recipe.target === 'repair' ? 'a damaged item in Bag' : recipe.target === 'mend' ? 'damaged clothing in Bag' : 'ordinary clothing in Bag' };
    return { a, material, target };
  };
  const craftResult = (state, recipe) => {
    const f = ((state.$ui || {}).fortune || {}), roll = num(f.roll, 0) || d100(num((state.$eng || {}).seed, c.seed), 'fortune', num((state.$eng || {}).turn, 0), state === S ? absA : absB), rank = num(state.Player._Proficiency.Craft, 0);
    const grade = ((state.Player.Academics || {}).Grades || {})['Potion Crafting'];
    const skill = Math.min(grade === 'A' ? 20 : 15, rank * 3 + (grade === 'A' ? 10 : 0));
    const Cn = state.Player.Conditions || {}, Vt = state.Player.Vitals, sev = Object.values(state.Player.Injuries || {}).map(i => i.Severity);
    const condition = (Cn.Chilled ? -10 : 0) + (Cn.Soaked ? -5 : 0) + (Cn.Overheated ? -5 : 0) + (Cn['Head cold'] ? -5 : 0)
      + (Vt._Fatigue === 'Exhausted' ? -15 : Vt._Fatigue === 'Tired' ? -5 : 0)
      + (sev.some(x => /serious|critical/.test(x)) ? -20 : sev.includes('moderate') ? -10 : 0)
      + (((state.$ui || {}).sleep || {}).loss >= 0.2 && !((state.$ui || {}).sleep || {}).flavor ? -5 : 0);
    // a masterwork of the generic "craft" Kind takes the best tool of any craft
    const tools = recipe.group ? craftGroup(recipe).tools || [] : Object.values(CRAFTS.groups || {}).flatMap(g => g.tools || []);
    const tool = Math.max(0, ...tools.filter(([n]) => craftQty(state.Inventory, n) > 0).map(([, n]) => n));
    const aid = craftExpert(state, recipe) ? 10 : 0, score = roll + skill + condition + tool + aid, dc = CRAFTS.tiers[recipe.tier];
    const band = score >= dc + 25 ? 'fine' : score >= dc ? 'success' : score >= dc - 15 ? 'weak' : 'failed';
    const master = rank >= MASTERY, result = master && band === 'weak' ? 'success' : band;   // Master's hand: nothing comes out rough
    return { name: recipe.name, group: recipe.group, tier: recipe.tier, roll, score, dc, result, master, mishap: roll <= 3, mods: [skill && `Craft +${skill}`, condition && `conditions ${condition}`, tool && `tool +${tool}`, aid && `expert +${aid}`].filter(Boolean).join(', ') };
  };
  const bagGain = (name, count, kind, note) => {
    const I = S.Inventory, k = craftItem(I, name) || name, start = craftQty((B || {}).Inventory, name);
    if (!I[k]) I[k] = { Qty: 0, Kind: kind, Note: note, Plan: '' };
    I[k].Qty = Math.max(num(I[k].Qty, 0), start + count);
    I[k].Kind = kind; I[k].Note = note;
  };
  const takeMaterials = option => {
    for (const m of option) { const k = craftItem(S.Inventory, m.item); if (k) S.Inventory[k].Qty = Math.min(num(S.Inventory[k].Qty, 0), craftQty((B || {}).Inventory, m.item) - m.qty); }
  };
  const craftMishap = (made, group) => {
    if (!made.mishap || Object.keys(S.Player.Injuries || {}).some(k => !(((B || {}).Player || {}).Injuries || {})[k])) return;
    const [kind, part, effect] = ((CRAFTS.groups || {})[group] || {}).mishap || ['burn', 'hand', 'tender fingers'];
    S.Player.Injuries[`${group || 'Craft'} mishap ${kind}`] = { Severity: 'minor', Body_part: part, Effect: effect, Heals_by: 'treatment' };
    S.Player.Vitals.HP = Math.max(1, S.Player.Vitals.HP - 5);
  };
  // 1.29.0: a masterwork is a finished Project of a craft Kind (data/crafts.json masterwork), judged at the masterwork DC; the story
  // decides what the piece is and does
  const MW = CRAFTS.masterwork || { rank: 4, xp: 3, kinds: {} };
  const mwGroup = pj => { const k = String((pj || {}).Kind || '').toLowerCase(); return Object.prototype.hasOwnProperty.call(MW.kinds, k) ? MW.kinds[k] : null; };
  const mwResult = (state, k) => ({ ...craftResult(state, { name: k, group: mwGroup(state.Projects[k]), tier: 'masterwork' }), group: 'Masterwork' });
  const mwDone = new Set();
  const finishMasterwork = (name, auto) => {
    const k = craftItem((B || {}).Projects, name), group = k ? mwGroup(B.Projects[k]) : null;
    if (!hasB || !k || group === null) { if (!auto) log.push(`Masterwork "${name}": start it as a Project of a craft Kind first; no result.`); return; }
    if (mwDone.has(k.toLowerCase())) return;
    mwDone.add(k.toLowerCase());
    if (num(B.Player._Proficiency.Craft, 0) < MW.rank) { log.push(`${k}: a masterwork needs Craft Rank ${MW.rank}; the finished Project is ordinary work, judged by the story.`); return; }
    const made = (((B.$ui || {}).craft || []).find(x => x.tier === 'masterwork' && x.name.toLowerCase() === k.toLowerCase())) || mwResult(B, k);
    gain('Craft', made.result === 'failed' ? 1 : MW.xp, 'masterwork');
    craftMishap(made, group);
    if (made.result !== 'failed') bagGain(k, 1, ((CRAFTS.groups || {})[group] || {}).bag || 'other',
      made.result === 'weak' ? 'handmade by {{user}}, rough' : `masterwork, handmade by {{user}}${made.result === 'fine' ? ', fine' : ''}`);
    const sk = craftItem(S.Projects, k); if (sk) delete S.Projects[sk];
    jnl.push(made.result === 'failed' ? `The masterwork "${k}" failed.` : `Finished ${made.result === 'weak' ? 'a piece short of a masterwork' : 'a masterwork'}: ${k}${made.result === 'fine' ? ' (fine)' : ''}.`);
    S.$ui.toasts.push(`Masterwork ${k}: ${made.result}`);
    log.push(`Masterwork ${k}: ${made.result}${made.mishap ? ', mishap' : ''}; ${made.result === 'failed' ? 'nothing to show for it' : 'in the Bag'}; the Project is closed.`);
  };
  const done = new Set();
  for (const r of reports) {
    const action = String(r.Action || '').trim().toLowerCase();
    if (action === 'craft' && /^masterwork\b/i.test(String(r.Aim || '').trim())) { finishMasterwork(String(r.Subject || '').trim(), false); continue; }
    const recipe = action === 'craft' && (CRAFTS.recipes || []).find(x => x.name.toLowerCase() === String(r.Aim || '').trim().toLowerCase());
    const a = recipe ? craftReady(recipe, S, r).a || ((craftActs(recipe, here)[0] || [])[1]) : PRACTICE.find(x => x.action.toLowerCase() === action && locName(x) === here);
    const subject = subjectOf(r.Subject), stat = a && (a.stat === 'subject' ? SUBJECT_STAT[subject] : a.stat);
    let why = !a ? 'this action is not available here' : before !== here ? 'start and finish at the practice place' : whyLocked(a, r);
    if (!why && !stat) why = 'name a subject';
    if (!why && (elapsed < 45 || c.toolEdit)) why = 'a session needs at least 45 minutes';
    if (!why && a.study && a.action === 'Study a subject' && elapsed < 60) why = 'one full hour of study';
    if (!why && Math.floor(absB / DAY_MIN) !== dayNo) why = 'finish a session in one day';
    if (!why && CLASS.tt && !((S.World._Event_today || '').match(/no classes/i))) {
      const row = CLASS.tt[S.World.Day] || [];
      if (row.some((cell, p) => cell && cell[3] === 'class' && [[480,600],[600,720],[780,960]][p] && absB % DAY_MIN < [[480,600],[600,720],[780,960]][p][1] && absA % DAY_MIN > [[480,600],[600,720],[780,960]][p][0])) why = 'during a lesson';
    }
    const key = `${dayNo}:${a ? a.loc + ':' + a.action : action}`;
    if (!why && (P.days[key] || done.has(key))) why = 'already practised this action today';
    if (!why && a.paid && P.wk.paid >= 2) why = 'two paid shifts this week';
    if (!why && num(P.wk[stat], 0) >= TU.prof_pace) why = `${stat} is at its weekly limit`;
    let ready;
    if (!why && action === 'craft') {
      if (!recipe) why = 'unknown recipe';
      else {
        ready = craftReady(recipe, B, r);
        if (ready.why) why = ready.why;
      }
    }
    if (why) { log.push(`Practice ${r.Action}: ${why}; no proficiency XP.`); continue; }
    done.add(key); P.days[key] = true;
    const priorCraft = recipe && ((((B || {}).$ui || {}).craft || []).find(x => x.name === recipe.name));
    const made = recipe && (priorCraft || craftResult(B, recipe));
    const xp = recipe ? (made.result === 'failed' ? 1 : a.xp) : a.study && a.action === 'Study a subject' ? Math.min(2, Math.floor(elapsed / 60)) : a.xp;
    gain(stat, xp, a.action);
    if (recipe) {
      takeMaterials(ready.material);
      if (a.cost) { S.Player.Wallet.Points -= a.cost; S.Player.Wallet.Transactions.push(`-${a.cost} studio practice`); }
      craftMishap(made, recipe.group);
      if (made.result !== 'failed') {
        const note = `handmade by {{user}}${made.result === 'fine' ? ', fine' : made.result === 'weak' ? ', rough' : ''}`;
        if (recipe.target) {
          const target = craftItem(S.Inventory, ready.target) || ready.target;
          if (!S.Inventory[target]) S.Inventory[target] = _.cloneDeep(B.Inventory[ready.target]);
          if (recipe.target === 'repair' || recipe.target === 'mend') S.Inventory[target].Note = String(S.Inventory[target].Note || '').replace(/\bdamaged\b/ig, '').trim() || note;
          else S.Inventory[target].Note = `${String(S.Inventory[target].Note || '').trim()} enchanted ${recipe.gear}; ${note}`.trim();
        } else bagGain(recipe.name, (recipe.yield || [1, 1, 1])[['fine', 'success', 'weak'].indexOf(made.result)] + (made.master ? 1 : 0), recipe.kind, note);
      }
      log.push(`Craft ${recipe.name}: ${made.result}${made.mishap ? ', mishap' : ''}; ingredients spent${made.result === 'failed' ? ', no item' : ''}.`);
      if (recipe.group === 'Brewing' && recipe.tier === 'advanced') log.push('Advanced brewing may draw a Dove poison-magic inspection; play it if a Dove is present.');
      continue;
    }
    if (a.action === 'Tend the reagent beds') bagGain('Foraged reagent', 1, 'reagent', 'fresh from the Gardens');
    if (a.action === 'Forage' && SEASONS[S.World.Month - 1] !== 'Winter') bagGain('Foraged reagent', (SEASONS[S.World.Month - 1] === 'Summer' ? 1 : 2) * (ranks.Nature >= MASTERY ? 2 : 1), 'reagent', 'foraged in the Forest');
    if (a.action === 'Gather clearing blooms') {
      bagGain('Clearing bloom', 1, 'reagent', 'wilts tomorrow');
      const C = S.$eng.craft || (S.$eng.craft = {}); C.blooms = C.blooms || {}; C.blooms['clearing bloom'] = dayNo;
    }
    if (a.train) S.Training.push({ Track: a.train, Partner: r.With || '' });
    if (a.cost) { S.Player.Wallet.Points -= a.cost; S.Player.Wallet.Transactions.push(`-${a.cost} studio practice`); }
    if (a.paid) { P.wk.paid++; S.Player.Wallet.Points += a.paid; S.Player.Wallet.Transactions.push(`+${a.paid} animal care shift`); }
    if (a.study && !OFF.has('study') && S.$eng.study) {
      const counted = num(S.$eng.study.mins, 0) - num((((B || {}).$eng || {}).study || {}).mins, 0);
      if (counted < 60) S.$eng.study.mins = num(S.$eng.study.mins, 0) + 60 - Math.max(0, counted);
    }
  }
  if (hasB) for (const k of Object.keys(B.Projects || {})) {
    const sk = craftItem(S.Projects, k);
    if (sk && num(S.Projects[sk].Progress, 0) >= 100 && num(B.Projects[k].Progress, 0) < 100 && mwGroup(B.Projects[k]) !== null) finishMasterwork(k, true);
  }
  for (const sale of sales) {
    const n = Math.min(Math.max(1, Math.floor(num(sale.Qty, 1))), 3 - num(P.wk.sold, 0));
    const name = 'Healing draught', k = craftItem(S.Inventory, name);
    if (String(sale.Item || '').toLowerCase() !== name.toLowerCase() || here !== 'medical centre' || before !== here || !hasB || n <= 0 || !k || craftQty(B.Inventory, name) < n || num(S.Inventory[k].Qty, 0) < n) {
      log.push('Apothecary sale rejected: sell Healing draught at the Medical Centre, up to three doses per week, from the Bag.');
      continue;
    }
    S.Inventory[k].Qty -= n; P.wk.sold = num(P.wk.sold, 0) + n;
    S.Player.Wallet.Points += 15 * n;
    S.Player.Wallet.Transactions.push(`+${15 * n} Apothecary: ${n} Healing draught${n === 1 ? '' : 's'}`);
    c.craftSold = [...(c.craftSold || []), name.toLowerCase()];
    log.push(`Medical Centre apothecary bought ${n} Healing draught${n === 1 ? '' : 's'} for ${15 * n} points (${P.wk.sold}/3 this week).`);
  }
  for (const t of S.Training || []) if (/stam/i.test(t.Track || '') && !/Exhausted|Collapsed/.test(S.Player.Vitals._Fatigue)
    && !Object.values(S.Player.Injuries || {}).some(i => /moderate|serious|critical/.test(i.Severity))) gain('Prowess', 1, 'stamina training');
  if (hasB && elapsed >= 45 && !c.toolEdit) {
    const event = String(S.World._Event_today || ''), place = here, hour = hm(S.World.Time) || 0, textNow = String(c.text || '');
    const eventXP = (key, stat, xp, attended) => {
      const mark = `event:${S.World.Year}:${key}`;
      if (attended && !P.days[mark]) { P.days[mark] = true; gain(stat, xp, key, false); }
    };
    eventXP('Training Week', 'Prowess', 3, /Training Week/.test(event) && place === 'combat grounds' && hour >= 960);
    eventXP('Creature Studies Expedition', 'Nature', 3, /Creature Studies Expedition/.test(event) && (S.Trip.Active || /forest|expedition/i.test(S.World.Location)));
    eventXP('Warding Rite', 'Arcana', 2, /Warding Rite/.test(event) && place === 'main courtyard' && hour >= 1110);
    eventXP('Star Night', 'Arcana', 2, /Star Night/.test(event) && /grassy field|hill/i.test(place) && hour >= 1200);
    eventXP('Club Festival stand', 'Craft', 2, /Club Festival/.test(event) && place === 'main courtyard' && /stand|stall|booth/i.test(textNow));
    eventXP('Academy Bazaar stand', 'Craft', 2, /Academy Bazaar/.test(event) && place === 'main courtyard' && /stand|stall|booth/i.test(textNow));
    eventXP('Entrance feast', 'Society', 2, /Entrance Event/.test(event) && place === 'ring dining hall' && hour >= 1140);
    eventXP('Founder Day feast', 'Society', 2, /Academy Founder Day/.test(event) && place === 'ring dining hall' && hour >= 1140);
  }
  for (const k of Object.keys(P.days)) if (/^\d+:/.test(k) && +k.split(':')[0] < dayNo - 14) delete P.days[k];
  S.$ui.practice = PRACTICE.filter(a => locName(a) === here).map(a => {
    const stat = a.stat === 'subject' ? '' : a.stat;
    const locked = whyLocked(a, null) || (P.days[`${dayNo}:${a.loc}:${a.action}`] ? 'already practised today' : '')
      || (a.paid && P.wk.paid >= 2 ? 'two paid shifts this week' : '')
      || (stat && num(P.wk[stat], 0) >= TU.prof_pace ? `${stat} is at this week's limit (${P.wk[stat]}/${TU.prof_pace}); class attendance still counts` : '');
    return { action: a.action, stat: a.stat, locked };
  });
  S.$ui.craft = (CRAFTS.recipes || []).filter(recipe => {
    const ready = craftReady(recipe, S, null);
    if (ready.why || num(P.wk.Craft, 0) >= TU.prof_pace) return false;
    const a = ready.a;
    return !P.days[`${dayNo}:${a.loc}:${a.action}`];
  }).map(recipe => craftResult(S, recipe));
  // 1.30.0: mastery perks (Rank 5). Arcana: the Doves take an interest (once; with hidden magic, Dove attention too). Society: the
  // Noble Houses' Liaison writes (once). Knowledge: one real lead a week in the Main Library or the Archive (a new Clue found there
  // uses it). The standing perks are rules in 504 (S.$ui.mastery); Prowess, Society's Trust, Arcana's mana and Craft act elsewhere.
  const MS = P.mastery = _.isPlainObject(P.mastery) ? P.mastery : {};
  if (ranks.Arcana >= MASTERY && !MS.arcana) {
    MS.arcana = true;
    if (c.repAdd) c.repAdd('Doves', 8, 'an arcane scholar the Doves take an interest in', '');
    if (S.Hidden && S.Hidden._True_magic) { S.Hidden.Dove_attention = _.clamp(num(S.Hidden.Dove_attention, 0) + 3, 0, 100); log.push('Arcane scholar: the Doves take an interest; Dove attention +3.'); }
  }
  if (ranks.Society >= MASTERY && !MS.society) {
    MS.society = true;
    if (_.isPlainObject(S.Letters)) S.Letters["Noble Houses' Liaison: an invitation"] = { From: "Noble Houses' Liaison", To: '{{user}}', Gist: "Word of {{user}}'s manners has reached the noble houses: an invitation to the Liaison's next reception.", Date: stamp(S.World), Status: 'waiting' };
    log.push("Consummate: the Noble Houses' Liaison has taken note of {{user}} (a letter).");
  }
  const leadHere = ['main library', 'archive'].includes(here);
  if (hasB && ranks.Knowledge >= MASTERY && leadHere && MS.lead !== weekNo && Object.keys(S.Clues || {}).some(k => !(B.Clues || {})[k])) { MS.lead = weekNo; log.push("Encyclopaedic: this week's real lead is used."); }
  const mastered = PROF.filter(k => ranks[k] >= MASTERY);
  S.$ui.mastery = mastered.length ? { stats: mastered, lead: ranks.Knowledge >= MASTERY && leadHere && MS.lead !== weekNo } : null;
  if (num(ranks.Craft, 0) >= MW.rank) S.$ui.craft.push(...Object.keys(S.Projects || {}).filter(k => mwGroup(S.Projects[k]) !== null && num(S.Projects[k].Progress, 0) < 100).slice(0, 2).map(k => mwResult(S, k)));
  if (here === 'medical centre' && craftQty(S.Inventory, 'Healing draught') > 0)
    S.$ui.craft_sale = { sold: num(P.wk.sold, 0), remaining: Math.max(0, 3 - num(P.wk.sold, 0)) };
  if (S.$ui.fortune && Array.isArray(S.$ui.fortune.mods)) {
    const mods = PROF.filter(k => ranks[k] > 0).map(k => `${k} +${Math.min((SUBJECTS.some(s => SUBJECT_STAT[s] === k && num(((S.$eng.study || {}).stand || {})[s], -1) === 4) ? 10 : 20), ranks[k] * 3)}`);
    if (mods.length) S.$ui.fortune.mods.push('proficiency: ' + mods.join('; '));
  }
}

// ---- 6c. 1.3.0 one-use perks spent this reply (/Perk_use). Kuroo's and Milena's Rank 10 favours lift a negative reputation one level.
function stepPerkUse(c) {
  const { S, log, jnl, goneNow, repw, repLv, repLevelUp, repSync } = c;
  for (const key of (Array.isArray(S.Perk_use) ? S.Perk_use : [])) {
    const k = Object.keys(S._Perks || {}).find(x => x === key) || Object.keys(S._Perks || {}).find(x => x.toLowerCase() === String(key).trim().toLowerCase());
    if (!k) { log.push(`Perk "${key}" is not held; nothing was spent.`); continue; }
    const p = S._Perks[k], fx = (((REW.npcs || {})[p.From]) || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {};
    if (p.Kind === 'memento' || goneNow(p.From)) { log.push(`"${k}" came from ${p.From}, who has graduated: it no longer works; nothing was spent.`); continue; }   // 1.7.6
    if (!(p.Uses > 0)) { log.push(`"${k}" is not a one-use perk; nothing to spend.`); continue; }
    if ((S.$ui.tsusp || []).includes(k)) { log.push(`"${k}" is suspended while ${p.From}'s Trust is low; it was kept.`); continue; }   // 1.4.3
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
}

// ---- 7. hidden magic ----
function stepHidden(c) {
  const { S, B, log, hasB, toolEdit, dayNo, wxNow, weekNo, weekNoB } = c;
  const Hd = S.Hidden;
  // 1.1.0 (Full): outdoors in fog, heavy rain, a storm or a blizzard the hidden magic is harder to notice: the rise is halved (rounded up)
  if (wxNow && hasB && Hd._True_magic && isOutdoor(S.World.Location) && (wxNow.sky === 'Fog' || wxHeavy(wxNow))) {
    const was = (B.Hidden && B.Hidden.Dove_attention) || 0, rise = Hd.Dove_attention - was;
    if (rise > 0) { Hd.Dove_attention = was + Math.ceil(rise / 2); log.push(`Dove attention rise halved by the weather (outdoors, ${wxText(wxNow)}): +${Math.ceil(rise / 2)} instead of +${rise}.`); }
  }
  // 1.18.0 (I1): the narrator reports witnessed/detected rises; the engine owns quiet-week decay.
  if (hasB) {
    const prior = num((B.Hidden || {}).Dove_attention, 0);
    if (Hd.Dove_attention < prior) { Hd.Dove_attention = prior; log.push('Dove attention falls only after a quiet week; the manual decrease was reverted.'); }
    const raised = Hd.Dove_attention > prior;
    const old = _.isPlainObject(S.$eng.doveweek) ? S.$eng.doveweek : { w: weekNoB, raised: true }; // old saves: do not assume the prior week was quiet
    if (weekNo > num(old.w, weekNoB)) {
      const quiet = Math.max(0, weekNo - num(old.w, weekNoB) - (old.raised ? 1 : 0));
      const drop = Math.min(Hd.Dove_attention, quiet);
      if (drop) { Hd.Dove_attention -= drop; log.push(`Dove attention −${drop} after ${quiet} quiet week${quiet === 1 ? '' : 's'}.`); }
      S.$eng.doveweek = { w: weekNo, raised };
    } else S.$eng.doveweek = { w: weekNo, raised: !!old.raised || raised };
  }
  const stageOf = a => (a < 20 ? 'Unnoticed' : a < 40 ? 'Rumoured' : a < 60 ? 'Watched' : a < 80 ? 'Investigated' : 'Exposed');
  const stg = stageOf(Hd.Dove_attention);
  if (Hd._True_magic && Hd._Stage !== stg) { log.push(`Dove attention is now: ${stg}.`); S.$ui.toasts.push(`Dove attention: ${stg}`); }
  for (const [id, o] of Object.entries(TRU.overrides || {})) {   // 1.4.3: Krieg learns the hidden magic: his Trust is gone
    if (o.zero_at_stage && Hd._True_magic && stg === o.zero_at_stage && S.Bonds[id] && S.Bonds[id].Trust > 0) {
      S.Bonds[id].$Recent = [...(S.Bonds[id].$Recent || []), { w: stamp(S.World), n: 'Learned what {{user}} has been hiding.', fx: `Trust −${S.Bonds[id].Trust}` }].slice(-num((BR.recent || {}).keep, 10));   // 1.4.4
      S.Bonds[id].Trust = 0; S.Bonds[id].$tdrop = dayNo; log.push(`${id} knows what {{user}} hid: Trust 0.`);
    }
  }
  Hd._Stage = stg;

  // 1.12.0 (H3): Points the narrator changed with no Transactions line get one ("not itemised"); a line written later for the same
  // amount replaces it. A new line with no change to Points or Coin changes nothing here: section 8l reminds the narrator.
  let lineNoPay = '';
  if (hasB && !toolEdit) {
    const WB = (B.Player || {}).Wallet || {}, WS = S.Player.Wallet, T0 = new Set(WB.Transactions || []);
    const amt = l => { const m = /^\s*([+−-])\s*([\d,]+)/.exec(String(l)); return m ? (m[1] === '+' ? 1 : -1) * Number(m[2].replace(/,/g, '')) : 0; };
    const pts = l => amt(l) && !/\bcoins?\b/i.test(l);
    const fresh = (WS.Transactions || []).filter(l => !T0.has(l) && pts(l));
    const dP = num(WS.Points, 0) - num(WB.Points, 0), dC = num(WS.Coin, 0) - num(WB.Coin, 0);
    if (dP && !fresh.length) WS.Transactions = [...(WS.Transactions || []), `${dP > 0 ? '+' : '-'}${Math.abs(dP)} (not itemised)`];
    else if (!dP && !dC) {
      for (const l of fresh) {
        const ph = WS.Transactions.findIndex(x => T0.has(x) && /\(not itemised\)$/.test(x) && amt(x) === amt(l));
        if (ph >= 0) WS.Transactions.splice(ph, 1); else if (!lineNoPay) lineNoPay = l;
      }
    }
  }
  // 1.11.1 (bug hunt): spending more than {{user}} has. The schema stops Points at 0, which made the missing part free; the
  // reply's new Transactions lines show what was spent, so the narrator is told to settle it in the story.
  if (hasB) {
    const P0 = num(((B.Player || {}).Wallet || {}).Points, 0), T0 = new Set((((B.Player || {}).Wallet || {}).Transactions) || []);
    const spent = (S.Player.Wallet.Transactions || []).filter(l => !T0.has(l)).reduce((a, l) => {
      const m = /^\s*([+−-])\s*([\d,]+)/.exec(String(l)); return m ? a + (m[1] === '+' ? -1 : 1) * Number(m[2].replace(/,/g, '')) : a; }, 0);
    if (num(S.Player.Wallet.Points, 0) === 0 && spent > P0) {
      S.$ui.toasts.push('Not enough points');
      log.push(`{{user}} had ${P0} points but this reply spent ${spent}: the ${spent - P0} missing were not paid (Points stay 0). Settle it in the story (put something back, owe it, pay in coin) and fix Transactions.`);
    }
  }
  Object.assign(c, { Hd, lineNoPay });
}

// ---- 8. monthly payout ----
function stepPayout(c) {
  const { S, B, log, hasB, goneNow, repLv } = c;
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
        if (_.isPlainObject(S.$eng.wk)) S.$eng.wk.pay = num(S.$eng.wk.pay, 0) + pay;   // 1.10.0: the routine payout is not news in the recap
        S.Player.Wallet.Transactions.push(`+${pay} monthly payout (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved: academic probation' : ''})`);
        log.push(`Monthly payout: +${pay} points (dorm rank ${r || 'unranked'}${acad <= -5 ? ', halved on academic probation' : ''}).`);
      }
      // 1.3.0: Academy +5 bonus, and points from bond rewards (data/bond_rewards.json monthly)
      const extra = [...(acad >= 5 && S.Player.Profile.Dorm !== 'Unsorted' ? [[REP.academy5_monthly, 'honoured student bonus (Academy reputation +5)']] : []),
        ...Object.values(S._Perks || {}).filter(p => p.Kind !== 'memento' && !goneNow(p.From)).map(p => (((REW.npcs || {})[p.From] || {})[p.Kind === 'gift' ? 'gift' : 'r10'] || {}).monthly).filter(Boolean).map(m => REW.monthly[m])];
      for (const [pts, why] of extra) {
        S.Player.Wallet.Points += pts; if (_.isPlainObject(S.$eng.wk)) S.$eng.wk.pay = num(S.$eng.wk.pay, 0) + pts; S.Player.Wallet.Transactions.push(`+${pts} ${why}`); log.push(`Monthly: +${pts} points, ${why}.`);
      }
    }
    S.Player.Wallet.Transactions = S.Player.Wallet.Transactions.slice(-20);
  }
}

// ---- 8b. Batch 5.1 records: commitments, notices, letters, clues, journal ----
// 1.18.0 (I4): relative Heals_by dates are anchored once, like Commitment.Due.
function stepRecords(c) {
  const { S, B, log, jnl, hasB, toolEdit, OFF, absA, canon } = c;
  {
    const prior = _.isPlainObject(S.$eng.heals) ? S.$eng.heals : {}, next = {};
    for (const [name, injury] of Object.entries(S.Player.Injuries || {})) {
      const by = String((injury || {}).Heals_by || '');
      next[name] = prior[name] && prior[name].text === by ? prior[name] : { text: by, abs: parseWhen(by, S.World, absA) };
    }
    S.$eng.heals = next;
  }
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
  // 1.18.0 (I8): an imminent appointment at this place can put its named partner in "May be here".
  if (!OFF.has('planner') && !S.Trip.Active) {
    const maybe = Array.isArray(S.$ui.maybe) ? S.$ui.maybe : [];
    const here = placeKey(S.World.Location);
    for (const [title, c] of Object.entries(S.Commitments || {})) {
      if (!c || !c.With || !c.Where || c.$abs < absA || c.$abs > absA + 60 || placeKey(c.Where) !== here) continue;
      for (const name of String(c.With).split(/,|\band\b/i).map(x => canon(x.trim())).filter(Boolean)) {
        if (npcAwayIn(S, name) || (S.Scene.Present || {})[name] || maybe.some(x => x[0] === name)) continue;
        maybe.push([name, `appointment: ${title}`]);
      }
    }
    S.$ui.maybe = maybe;
  }
  // 1.15.0 (planning/DRAFT_grades_exams.md): a commitment removed before it was overdue was done. An assignment done on time is
  // study time; one removed overdue counts as a skipped class of the subject it names. A remedial attended turns its F into a D.
  const STd = !OFF.has('study') && _.isPlainObject(S.$eng.study) ? S.$eng.study : null;
  if (STd && hasB && !toolEdit) for (const [k, c0] of Object.entries(BC)) {
    if (k in (S.Commitments || {}) || !c0) continue;
    const late = !!c0._Late;
    if (_.isPlainObject(STd.rem) && STd.rem[k]) {
      // an appointment is overdue once it starts: removed within three hours of its start, it was attended
      const sess = STd.rem[k], s = k.replace(/^Remedial /, ''), mk = (STd.marks || {})[sess], missed = num(c0.$abs, -1) >= 0 && absA > c0.$abs + 180;
      delete STd.rem[k];
      if (missed || !mk || mk[s] !== 0) { if (missed) log.push(`${k} was missed: the F stands.`); continue; }
      mk[s] = 1;
      if (num((STd.stand || {})[s], -1) === 0) STd.stand[s] = 1;
      const Ac = S.Player.Academics, lab = Object.keys(Ac.Exams || {}).find(x => x.replace(/ (Midterm|Finals)$/, '').replace(' ', '') === sess);
      if (lab) Ac.Exams[lab] = String(Ac.Exams[lab]).replace(`${s} F`, `${s} D (make-up)`);
      if (Ac.Grades && Ac.Grades[s] === 'F') Ac.Grades[s] = 'D';
      jnl.push(`${k} attended: the ${s} F counts as a D.`); S.$ui.toasts.push(`${s}: F -> D (make-up)`);
    } else if (/^assignment$/i.test(String(c0.Type || '').trim())) {
      if (!late) { STd.mins = num(STd.mins, 0) + ASSIGNMENT_MIN; log.push(`Assignment "${k}" done on time: +${ASSIGNMENT_MIN} minutes of study.`); }
      else { const s = subjectIn(`${k} ${c0.Desc || ''}`); if (s) { STd.skip = _.isPlainObject(STd.skip) ? STd.skip : {}; STd.skip[s] = num(STd.skip[s], 0) + 1; log.push(`Assignment "${k}" was overdue: it counts as a skipped ${s} class for the next marks.`); } }
    }
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
}

// ---- 8c. Batch 5.2: club, competition, projects, trip ----
function stepClubLife(c) {
  const { S, B, log, jnl, hasB } = c;
  const canonList = a => [...new Set((a || []).map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  if (hasB) {
    const c0 = canonClub(B.Player.Profile.Club), c1 = S.Player.Profile.Club || '';
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
  Object.assign(c, { canonList });
}

// ---- 8e. v1.0.3 new school year: a new class of first-years (incoming cohorts from data/cohorts.json) ----
// 1.7.4: {{user}} moves up a year with everyone else (the story may hold them back), and last year's competition record is cleared
// (the Journal keeps it): Losing at any tier ends only that year's competitions.
function stepNewYear(c) {
  const { S, B, log, jnl, hasB } = c;
  if (hasB && S.World.Year > (B.World.Year || 1)) {
    const P = S.Player.Profile, y0 = num(B.Player.Profile.Year, 1), dy = S.World.Year - (B.World.Year || 1);
    if (num(P.Year, 1) !== y0) log.push(`A new academic year began (Year ${S.World.Year}); {{user}} is in Year ${P.Year}.`);
    else if (y0 < 3) {
      P.Year = Math.min(3, y0 + dy);
      jnl.push(`Began Year ${P.Year} at Halvard.`);
      log.push(`A new academic year began (Year ${S.World.Year}): {{user}} moved up to Year ${P.Year} (Player.Profile.Year). If the story holds {{user}} back a year, set it back.`);
    } else log.push(`A new academic year began (Year ${S.World.Year}). {{user}} was already a third-year: the card does not play {{user}}'s own graduation, so the story decides what happens now.`);
    const Co = S.Competition;
    if (Co && (Co.Tier || Co.Status || Co.Placement || (Co.Team || []).length || (Co.Results || []).length)) {
      Object.assign(Co, { Tier: '', Status: '', Placement: '', Team: [], Results: [] });
      log.push("A new competitive year: last year's Competition record was cleared (the Journal keeps it).");
    }
  }
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
}

// ---- 8d. v1.0.3 graduation: the morning after Graduation (M12 W1 Mon 07:00) that year's third-years leave campus ----
function stepGraduation(c) {
  const { S, log, jnl, hasB, absA } = c;
  {
    const done = S.$eng.grads || (S.$eng.grads = []), G = S.Campus_State.Graduated || (S.Campus_State.Graduated = []);
    for (let Y = 1; hasB && Y <= S.World.Year; Y++) {
      if (done.includes(`Y${Y}`) || absA < toAbs({ Year: Y, Month: 12, Week: 1, Day: 'Mon', Time: '07:00' })) continue;
      done.push(`Y${Y}`);
      const left = Object.keys(STUDENTS).filter(id => yearOf(id, Y) === 3 && !G.includes(id) && !STAYS[id]);
      G.push(...left);
      for (const id of Object.keys(STAYS)) if (yearOf(id, Y) === 3 && !G.includes(id)) log.push(`${STAYS[id]}. If the story had them graduate after all, add the name to Campus_State.Graduated.`);
      if (left.length) {
        jnl.push(`The third-years graduated and left Halvard: ${left.join(', ')}.`);
        S.$ui.toasts.push(`Graduates have left campus: ${left.map(id => `{npc:${id}}`).join(', ')}`);
        log.push(`Graduation departures: ${left.join(', ')} left campus (Campus_State.Graduated). If the story keeps one (repeating the year, staying as staff), remove that name.`);
      }
    }
    S.Campus_State.Graduated = [...new Set(G.map(x => NPC_ALIAS[String(x).toLowerCase()] || x))];
  }
}

// ---- 8d2. 1.7.6 (owner, 2026-09-27): a graduate's rewards stop working. Their Rank 5 gift stays as a keepsake (_Perks Kind
// memento, no effect; a gift with a "grad" text in data/bond_rewards.json keeps what is left in it, without refills), their Rank 10
// benefit ends; Student reputation raised by a Rank 10 stays. The originals wait in $ui.perks_grad: if the story keeps the person
// (their name leaves Campus_State.Graduated), the reward works again. Runs every update, so a chat already past Graduation converts too.
function stepGraduateRewards(c) {
  const { S, log } = c;
  {
    const GR = new Set(S.Campus_State.Graduated || []), PG = _.isPlainObject(S.$ui.perks_grad) ? S.$ui.perks_grad : (S.$ui.perks_grad = {});
    for (const [k, p] of Object.entries(S._Perks || {})) {
      if (!p || p.Kind === 'memento' || !GR.has(p.From)) continue;
      PG[k] = { ...p };
      if (p.Kind === 'gift') {
        const x = (((REW.npcs || {})[p.From]) || {}).gift || {};
        S._Perks[k] = { From: p.From, Kind: 'memento', Effect: x.grad || `A keepsake from ${p.From}, who has graduated; it no longer does what it did.`, Uses: 0 };
        log.push(`${p.From} has graduated: "${k}" is now a keepsake${x.grad ? ' (what is left in it can still be used, without refills)' : ' with no effect'}.`);
      } else {
        delete S._Perks[k];
        log.push(`${p.From} has graduated: their Rank 10 benefit "${k}" has ended.`);
      }
    }
    for (const [k, p] of Object.entries(PG)) {
      if (GR.has(p.From)) continue;
      S._Perks[k] = { ...p }; delete PG[k];
      log.push(`${p.From} is at Halvard again: "${k}" works again.`);
    }
  }
}

// ---- 8e. 1.7.7 (FP1): one optional NPC-initiated contact on some days. The result is latched per day so scene changes,
// swipes and replays do not reroll it. The narrator decides how (or whether) the approved Stage can play; no NPC is moved.
function stepInitiative(c) {
  const { S, OFF, evs, dayNo, seed, TU } = c;
  {
    const I = _.isPlainObject(S.$eng.initiative) ? S.$eng.initiative : (S.$eng.initiative = {});
    if (!_.isPlainObject(I.last)) I.last = {};
    const week = Math.floor(dayNo / 7), off = OFF.has('npc_initiative');
    const IR = { 1: [0.15, 1, 10], 2: [0.35, 2, 7], 3: [0.6, 4, 4] }[TU.init_rate] || [0.35, 2, 7];   // 1.9.9 Settings: daily chance, weekly cap, days per NPC
    if (I.week !== week) { I.week = week; I.count = 0; }
    if (I.day !== dayNo) {
      I.day = dayNo; I.id = ''; I.done = false;
      if (!off && !S.Trip.Active && !/LOCKDOWN/.test(S.World._Curfew || '') && I.count < IR[1]
          && rand01(seed, dayNo, 'npc-initiative-roll') < IR[0]) {
        const pool = Object.keys(S.Bonds).sort().filter(id => {
          const b = S.Bonds[id];
          return b.Rank >= 3 && INITIATIVE_STAGES[id] && (ARRIVES[id] || 1) <= S.World.Year
            && !npcAwayIn(S, id) && !S.Scene.Present[id]   // 1.16.1 (audit B4): only a status that keeps them away
            && dayNo - num(I.last[id], -1000) >= IR[2];
        });
        const weight = id => ({ open: 3, normal: 2, guarded: 1, closed: 0.5 })[INITIATIVE_OPENNESS[id] || 'normal'];
        let ticket = rand01(seed, dayNo, 'npc-initiative-pick') * pool.reduce((sum, id) => sum + weight(id), 0);
        for (const id of pool) if ((ticket -= weight(id)) < 0) { I.id = id; I.last[id] = dayNo; I.count++; break; }
      }
    }
    if (off || S.Trip.Active || /LOCKDOWN/.test(S.World._Curfew || '') || (I.id &&
        (!S.Bonds[I.id] || S.Bonds[I.id].Rank < 3 || S.Scene.Present[I.id] || npcAwayIn(S, I.id)))) I.done = true;
    const id = I.done ? '' : I.id;
    if (id && S.Bonds[id] && S.Bonds[id].Rank >= 3) {
      const rank = S.Bonds[id].Rank, band = rank <= 5 ? '3-5' : rank <= 8 ? '6-8' : '9-10';
      S.$ui.initiative = { id, stage: INITIATIVE_STAGES[id][band], strained: S.Bonds[id].Tension >= 70 };
      // FP11: a concrete reason for today, never the same template + filling within this NPC's last 20; latched for the day
      if (!_.isPlainObject(I.used)) I.used = {};
      if (I.askDay !== dayNo || I.askId !== id) {
        const cat = S.Bonds[id].Tension >= 70 ? 'strained' : ((INIT_ASKS.cat || {})[id] || 'social');
        const tpl = ((INIT_ASKS.asks || {})[cat]) || [];
        const gp = ((GIFT_PREFS.npcs || {})[id] || {}).items || {};
        const tomorrow = eventsOn(fromAbs((dayNo + 1) * DAY_MIN));
        const fills = {
          place: [...String(HAUNT[id] || '').split(/[;,]/).map(x => x.replace(/\(.*?\)/g, '').trim()).filter(Boolean),
            ...(cat === 'authority' ? [] : INIT_ASKS.places || [])].filter((x, i, a) => a.indexOf(x) === i),
          thing: [...(gp.loved || []), ...(gp.liked || [])],
          club: (INIT_ASKS.club || {})[id] ? [INIT_ASKS.club[id]] : [],
          event: [...evs, ...tomorrow].map(e => e.t.split(' (')[0]).filter((x, i, a) => a.indexOf(x) === i),
        };
        const combos = [];
        tpl.forEach((t, ti) => {
          const need = (t.match(/\{(place|thing|club|event)\}/g) || []).map(x => x.slice(1, -1));
          if (!need.length) { combos.push([ti, '', t]); return; }
          const k = need[0];
          for (const v of fills[k]) combos.push([ti, v, t.replace('{' + k + '}', v)]);
        });
        const used = I.used[id] || [], fresh = combos.filter(([ti, v]) => !used.includes(ti + '|' + v)), pool = fresh.length ? fresh : combos;
        const pick = pool.length ? pool[hash32(seed, dayNo, 'ask', id) % pool.length] : null;
        I.askDay = dayNo; I.askId = id; I.ask = pick ? pick[2] : '';
        if (pick) I.used[id] = [...used, pick[0] + '|' + pick[1]].slice(-20);
      }
      if (I.ask) S.$ui.initiative.ask = I.ask;
    } else S.$ui.initiative = null;
  }
}

// ---- 8f. 1.1.0 story hooks: narrator-side debts. Due anchored once like Commitments; state waiting | due | overdue | old ----
function stepHooks(c) {
  const { S, B, log, hasB, absA, canonList } = c;
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
}

// ---- 8g. 1.1.0 gossip: each rumour's fate and reach by age; fizzled (day 3) and old (day 21) ones leave Campus_State.Rumours ----
function stepGossip(c) {
  const { S, log, OFF, dayNo, seed, TU } = c;
  if (OFF.has('gossip')) S.$ui.gossip = [];
  else {
    const R = _.isPlainObject(S.$eng.rum) ? S.$eng.rum : (S.$eng.rum = {}), live = S.Campus_State.Rumours || [];
    for (const r of Object.keys(R)) if (!live.includes(r)) delete R[r];         // the story removed it: drop its metadata
    const keep = [], gone = [];
    for (const r of live) {
      if (!R[r]) { const d20 = hash32(seed, r, 'rum') % 20 + 1; R[r] = { born: dayNo, fate: d20 <= 3 ? 'fizzle' : d20 >= 18 ? 'fast' : 'normal' }; }
      const age = dayNo - R[r].born;
      if ((R[r].fate === 'fizzle' && age >= 3) || age >= TU.gossip_life) { gone.push(r); delete R[r]; } else keep.push(r);   // 1.9.9: lifetime from Settings > Campus life
    }
    if (gone.length) {
      S.Campus_State.Rumours = keep; S.$ui.rumours_old = [...S.$ui.rumours_old, ...gone].slice(-50);
      log.push(`Rumours that have died out (removed; do not bring them back unless something revives them): ${gone.map(r => `\"${r}\"`).join('; ')}.`);
    }
    S.$ui.gossip = keep.map(r => [r, REACH(R[r], dayNo - R[r].born), dayNo - R[r].born]);
  }
}

// ---- 8h. 1.1.0 inventory (the Bag): merge case duplicates, remove at Qty 0, Sunfizz bottles, cap 40 (never gear) ----
function stepBag(c) {
  const { S, B, log, jnl, hasB, dayNo } = c;
  {
    const I = S.Inventory || (S.Inventory = {}), BI = (hasB && B.Inventory) || {};
    const blooms = (S.$eng.craft || {}).blooms || {};
    if (hasB) for (const k of Object.keys(I)) if (/^clearing bloom$/i.test(k) && num(blooms[k.toLowerCase()], dayNo) < dayNo) {
      delete I[k]; delete blooms[k.toLowerCase()]; log.push('Clearing bloom wilted overnight.');
    }
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
    // 1.7.5: a student past Year 1 (a chat that starts in Year 2 or 3) was sorted in their first year: the Stone's reading (D9) once
    // the Builder has set the dominant type
    const dm0 = { Elemental: 'Fire', Mystic: 'Light', Spiritual: 'Viridian', Occult: 'Sky' }[((S.Magic || {})._Affinity || {}).Dominant];
    if (S.Player.Profile.Dorm === 'Unsorted' && num(S.Player.Profile.Year, 1) > 1 && dm0) {
      S.Player.Profile.Dorm = dm0;
      log.push(`{{user}} is a Year ${S.Player.Profile.Year} student, so the Arbiter Stone sorted them in their first year: ${dm0} Dormitory (Player.Profile.Dorm).`);
    }
    if (B.Player.Profile.Dorm === 'Unsorted' && S.Player.Profile.Dorm !== 'Unsorted') jnl.unshift(num(S.Player.Profile.Year, 1) > 1 ? `Of the ${S.Player.Profile.Dorm} Dormitory since the first-year sorting.` : `Sorted into the ${S.Player.Profile.Dorm} Dormitory by the Arbiter Stone.`);
    const sec0 = new Set([...((B.Campus_State && B.Campus_State.Secrets_revealed) || []), ...((B.$ui && B.$ui.secrets) || [])]);
    for (const x of S.Campus_State.Secrets_revealed || []) if (!sec0.has(x)) { const [who, ...topic] = String(x).split('.'); jnl.push(`Uncovered a hidden truth about ${who}${topic.length ? ` (${topic.join('.')})` : ''}.`); }
  }
  // v1.0.3 (F13): every revealed secret also goes to a permanent, hidden ledger; unlocks read it, so the AI list may stay short
  for (const x of S.Campus_State.Secrets_revealed || []) if (!S.$ui.secrets.includes(x)) S.$ui.secrets.push(x);
  const J0 = new Set((hasB && B.Journal) || []);
  S.Journal = (S.Journal || []).map(line => (J0.has(line) ? line : /^\[(Y\d+ )?M\d/.test(line) ? (S.World.Year > 1 ? withYear(line, S.World.Year) : line) : `[${dstamp(S.World)}] ${line}`));
  for (const line of jnl) S.Journal.push(`[${dstamp(S.World)}] ${line}`);
  S.Journal = [...new Set(S.Journal)].slice(-CAP.Journal);
  // F21 state-as-memory: the narrator reads the last CAP.Journal lines; older ones (and lines the AI removed) move to $ui.archive
  if (hasB) {
    const kept = new Set(S.Journal), arch = S.$ui.archive || (S.$ui.archive = []);
    const have = new Set(arch);
    for (const l of B.Journal || []) if (!kept.has(l) && !have.has(l)) { arch.push(l); have.add(l); }
    S.$ui.archive = arch.slice(-JOURNAL_ARCHIVE);
  }
}

// ---- 8j. 1.6.1 (Batch D, N4): campus events. Updated is stamped when an event's Text changes (a new event, or news about it);
// events with no news for STALE_DAYS are listed in <now> ($ui.stale), so the world moves them on or closes them. A bare string
// (the AI's shorthand, or a save from before 1.6.1) is the Text.
function stepCampusEvents(c) {
  const { S, B, hasB, dayNo } = c;
  {
    const E0 = (hasB && B.Campus_State && B.Campus_State.Events) || {}, stale = [];
    const ev = x => (_.isPlainObject(x) ? x : x == null ? null : { Text: String(x) });
    for (const k of Object.keys(S.Campus_State.Events || {})) {
      const v = ev(S.Campus_State.Events[k]), p = ev(E0[k]), text = String(v.Text || '').trim();
      if (!p || String(p.Text || '').trim() !== text || !(num(p.$d, -1) >= 0)) { v.Updated = dstamp(S.World); v.$d = dayNo; }
      else { v.Updated = p.Updated || dstamp(S.World); v.$d = num(p.$d, dayNo); }
      S.Campus_State.Events[k] = { Text: text, Updated: v.Updated, $d: v.$d };
      if (text && dayNo - v.$d > STALE_DAYS) stale.push([k, v.Updated, v.$d]);
    }
    S.$ui.stale = stale.sort((a, b) => a[2] - b[2]).slice(0, 3).map(([k, u]) => [k, u]);
  }
  // N6: the campus phase today ({ id, from: "M5 W1 Mon", to: "M5 W2 Fri", line }, every year); the line goes into <now>
  {
    const doyOf = w => { const m = /^M(\d{1,2}) W([1-4]) (\w{3})/.exec(String(w || '')); return m && DAYS.includes(m[3]) ? (+m[1] - 1) * 28 + (+m[2] - 1) * 7 + DAYS.indexOf(m[3]) : -1; };
    const d = dayNo % YEAR_DAYS;
    const ph = PHASES.find(p => { const a = doyOf(p.from), z = doyOf(p.to); return a >= 0 && z >= 0 && (a <= z ? d >= a && d <= z : d >= a || d <= z); });
    S.$ui.phase = ph ? { id: ph.id, line: ph.line } : null;
  }
}

// ---- 8k. 1.6.1 (Batch D, N5): characters the narrator invented (Extras). A roster name is never an Extra. A key that differs
// only in case, or a first name that matches exactly one recorded full name, is the same person: it merges into the recorded
// key (in Scene.Present too). Every time one enters Scene.Present it is counted ($eng.xs); from the second appearance <cast>
// asks for their record until it exists. At most EXTRAS_MAX records: the least recently seen leave first (into a hidden
// archive, $ui.xold, which gives the record back if they turn up again), never one the player pinned (Keep) or one present.
function stepExtras(c) {
  const { S, B, log, hasB, absA, dayNo, canon } = c;
  let xHere = [], xNew = [];
  {
    const X = S.Extras = _.isPlainObject(S.Extras) ? S.Extras : {}, X0 = (hasB && _.isPlainObject(B.Extras) && B.Extras) || {};
    const XF = ['Who', 'Looks', 'Manner', 'Calls_user', 'Voice'];
    const first = k => String(k).trim().toLowerCase().split(/\s+/)[0];
    const xMatch = (name, keys) => {
      const l = String(name).trim().toLowerCase(), same = keys.find(k => k !== name && k.toLowerCase() === l);
      if (same) return same;
      if (/\s/.test(l)) return null;
      const f = keys.filter(k => /\s/.test(k.trim()) && first(k) === l);
      return f.length === 1 ? f[0] : null;
    };
    for (const k of Object.keys(X)) {
      if (!_.isPlainObject(X[k])) X[k] = { Who: String(X[k] == null ? '' : X[k]) };
      if (NPC_IDS.has(canon(k))) { delete X[k]; log.push(`${canon(k)} is a roster character (their sheet is in <cast>), not an invented one; the Extras record "${k}" was removed.`); }
    }
    for (const k of Object.keys(X)) {   // same person under two keys: keep the recorded (or the longer) key
      if (!(k in X)) continue;
      const t0 = xMatch(k, Object.keys(X)); if (!t0) continue;
      const keep = t0.length !== k.length ? (t0.length > k.length ? t0 : k) : (t0 in X0 || !(k in X0) ? t0 : k), drop = keep === k ? t0 : k;
      const a = X[keep], z = X[drop], fresh = !(drop in X0);
      for (const f of XF) if (String(z[f] || '').trim() && (fresh || !String(a[f] || '').trim())) a[f] = z[f];
      a.Keep = !!(a.Keep || z.Keep); a.$seen = Math.max(num(a.$seen, -1), num(z.$seen, -1));
      delete X[drop];
    }
    const P = S.Scene.Present;
    for (const id of Object.keys(P)) {
      if (NPC_IDS.has(id)) continue;
      const t0 = xMatch(id, Object.keys(X)); if (!t0 || t0 === id) continue;
      if (!(t0 in P) || !String((P[t0] || {}).Note || '').trim()) P[t0] = P[id];
      delete P[id];
    }
    const ext = Object.keys(P).filter(id => !NPC_IDS.has(id));
    const XO = S.$ui.xold = _.isPlainObject(S.$ui.xold) ? S.$ui.xold : {};
    for (const id of ext) if (!(id in X)) { const o = id in XO ? id : xMatch(id, Object.keys(XO)); if (o) { X[id] = XO[o]; delete XO[o]; } }
    const bp = Object.keys((hasB && B.Scene && B.Scene.Present) || {}).filter(id => !NPC_IDS.has(id));
    const wasL = new Set(bp.map(k => k.trim().toLowerCase())), wasF = new Set(bp.map(first));
    const XS = S.$eng.xs = _.isPlainObject(S.$eng.xs) ? S.$eng.xs : {};
    const xsKey = {};
    for (const id of ext) {
      const l = id.trim().toLowerCase();
      let key = l in XS ? l : xMatch(l, Object.keys(XS));
      if (key && key !== l && /\s/.test(l)) { XS[l] = XS[key]; delete XS[key]; key = l; }   // first name, then the full name: one person
      const r = XS[key || l] || (XS[key || l] = { n: 0, d: dayNo });
      if (!wasL.has(l) && !wasF.has(first(l))) r.n = num(r.n, 0) + 1;
      r.d = dayNo; xsKey[id] = key || l;
      if (id in X) X[id].$seen = absA;
    }
    for (const k of Object.keys(XS).sort((a, b) => num(XS[b].d, 0) - num(XS[a].d, 0)).slice(80)) delete XS[k];
    for (const k of Object.keys(X)) if (num(X[k].$seen, -1) < 0) X[k].$seen = absA;   // written now: seen now
    const out = Object.keys(X).filter(k => !X[k].Keep && !ext.includes(k)).sort((a, b) => num(X[a].$seen, -1) - num(X[b].$seen, -1));
    for (const k of out.slice(0, Math.max(0, Object.keys(X).length - EXTRAS_MAX))) { XO[k] = X[k]; delete X[k]; }
    for (const k of Object.keys(XO).sort((a, b) => num(XO[b].$seen, -1) - num(XO[a].$seen, -1)).slice(EXTRAS_ARCHIVE)) delete XO[k];
    xHere = ext.filter(id => id in X && String(X[id].Who || '').trim());
    xNew = ext.filter(id => (id in X && !String(X[id].Who || '').trim()) || (!(id in X) && num((XS[xsKey[id]] || {}).n, 0) >= 2));
  }
  Object.assign(c, { xHere, xNew });
}

// ---- 8i. 1.5.1 (Batch B, P1/P6): the cast. Who among the present gets their full canon sheet in the Cast Sheet (509; their
// keyword lore entry stays empty meanwhile): those who spoke in the last reply first, then the highest bond rank, at most
// CAST_FULL; the others get a brief sheet. From the reply's prose: who spoke without being in Scene.Present, who was mentioned.
function stepCast(c) {
  const { S, text, xHere, xNew } = c;
  {
    const prev = _.isPlainObject(S.$ui.cast) ? S.$ui.cast : {};
    const pres = Object.keys(S.Scene.Present || {}).filter(id => NPC_IDS.has(id) && (ARRIVES[id] || 1) <= S.World.Year);
    let spoke = prev.spoke || [], gone = prev.gone || [], ment = prev.ment || [];
    if (text) {
      const prose = String(text).replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
      spoke = speakersIn(prose); const said = new Set(spoke);
      gone = spoke.filter(id => !pres.includes(id));
      ment = NAME_RX.filter(([id, rx]) => !pres.includes(id) && !said.has(id) && (ARRIVES[id] || 1) <= S.World.Year && mentionIn(prose, id, rx)).map(([id]) => id).slice(0, 4);
    }
    const rank = id => (S.Bonds[id] ? num(S.Bonds[id].Rank, 0) : -1);
    const order = [...pres].sort((a, b) => (spoke.includes(b) - spoke.includes(a)) || (rank(b) - rank(a)) || (pres.indexOf(a) - pres.indexOf(b)));
    S.$ui.cast = { full: order.slice(0, CAST_FULL), brief: order.slice(CAST_FULL), spoke: spoke.filter(id => pres.includes(id)), gone, ment,
      where: Object.fromEntries(ment.filter(id => HAUNT[id]).map(id => [id, HAUNT[id]])), extras: xHere, xnew: xNew };
  }
}

// ---- 8l. 1.12.0 (planning/DRAFT_missed_reports.md): what the last update may have left out of its report. Reminders for <now>
// only: nothing here changes a number. At most MISS_MAX lines, most important first, and the same hint is not repeated within two
// days ($eng.missed). A player-tool edit keeps the reminders it found.
function stepReminders(c) {
  const { S, B, text, userText, hasB, toolEdit, OFF, REPORTED, absA, elapsed, dayNo, V, M, startedNow, restedAs, canon, KR, Hd, lineNoPay } = c;
  if (hasB && !toolEdit) {
    const seen = _.pickBy(_.isPlainObject(S.$eng.missed) ? S.$eng.missed : {}, d => num(d, -99) >= dayNo - 2);
    const out = [], add = (sig, line) => { if (!(sig in seen) && !out.some(o => o[0] === sig)) out.push([sig, line]); };
    if (!OFF.has('reminders')) {
      // 1.18.0 (I3-I6): evidence-based prompts; none moves a number or invents detection/healing.
      const bag0 = B.Inventory || {}, bag1 = S.Inventory || {}, tx0 = new Set(((B.Player || {}).Wallet || {}).Transactions || []);
      const newTx = (S.Player.Wallet.Transactions || []).filter(x => !tx0.has(x)).join(' | ').toLowerCase();
      const shopAt = placeKey(S.World.Location);
      let expected = 0; const acquired = [];
      for (const [name, item] of Object.entries(bag1)) {
        const row = SHOP_PRICE[name.toLowerCase()], before = Object.keys(bag0).find(x => x.toLowerCase() === name.toLowerCase());
        const qty = Math.max(0, num(item && item.Qty, 0) - num(before && bag0[before] && bag0[before].Qty, 0));
        if (!row || !qty || !row.some(x => placeKey(x[1]) === shopAt)) continue;
        expected += qty * row.find(x => placeKey(x[1]) === shopAt)[0]; acquired.push(name);
      }
      if (expected) {
        const paid = Math.max(0, num(((B.Player || {}).Wallet || {}).Points, 0) - num(S.Player.Wallet.Points, 0));
        const named = acquired.every(x => newTx.includes(x.toLowerCase()));
        if (paid < expected || !named) add(`shop:${acquired.join('|')}:${dayNo}`, `${acquired.join(', ')} entered the Bag at a shop (listed total ${expected} points), but the Points decrease was ${paid}${named ? '' : ' and a matching Transaction is missing'}. If bought, report the full payment; if gifted or found, make that clear in the story.`);
      }
      for (const [name, injury] of Object.entries(S.Player.Injuries || {})) {
        const by = num(((S.$eng.heals || {})[name] || {}).abs, -1);
        if (by >= 0 && by <= absA) add(`heal:${name}:${dayNo}`, `${name}'s Heals_by time has arrived: show recovery or a Medical Centre visit if the story supports it; never heal off-screen.`);
      }
      const dorm = String(S.Player.Profile.Dorm || '').trim().toLowerCase(), where = placeKey(S.World.Location);
      if (/^CURFEW/.test(S.World._Curfew || '') && dorm && dorm !== 'unsorted' && !where.startsWith(dorm) && !(S.Trip || {}).Active)
        add(`curfew:${where}:${dayNo}`, `{{user}} is at ${placeOf(S.World.Location)} after dorm curfew. If someone catches them, report the appropriate reputation deed; being out alone is not proof of detection.`);
      const keepers = new Set((S.Hidden.Known_by || []).map(canon));
      for (const [id, bond] of Object.entries(S.Bonds || {})) {
        const prior = (((B.Bonds || {})[id] || {}).Knows || []);
        if (!keepers.has(id) && (bond.Knows || []).some(x => !prior.includes(x) && /(?:true|hidden|forbidden) magic/i.test(String(x))))
          add(`knows-magic:${id}:${dayNo}`, `${id}'s Knows now mentions {{user}}'s hidden magic. If ${id} truly learned the secret, add ${id} to Hidden.Known_by.`);
      }
      const prose = String(text || '').replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/g, '').replace(/<[^>]+>/g, ' ');
      const narr = prose.replace(QUOTE_RX, ' '), said = String(userText || ''), low = (said + '\n' + prose).toLowerCase();
      const actsOf = id => REPORTED.acts.filter(a => canon(a.With) === id);
      const bonded = Object.keys(S.Scene.Present || {}).map(canon).filter(id => S.Bonds[id] && id !== KR.id);
      const Tq = M._Techniques || {}, hasWord = (hay, w) => (WORD_RX.get(w) || WORD_RX.set(w, new RegExp('(^|[^a-z])' + _.escapeRegExp(w.toLowerCase()) + '($|[^a-z])')).get(w)).test(hay);
      // R1: HP lost with no injury named (D13)
      const hp0 = num(B.Player.Vitals.HP, 0), inj0 = B.Player.Injuries || {};
      if (V.HP > 0 && V.HP < hp0 && !Object.keys(S.Player.Injuries || {}).some(k => !(k in inj0)))
        add(`hp:${absA}`, `HP fell by ${Math.round(hp0 - V.HP)} with no injury named: add it to Player.Injuries.`);
      // R12: hidden magic used in front of people who do not know, and Dove_attention did not move
      if (Hd._True_magic && num(Hd.Dove_attention, 0) <= num((B.Hidden || {}).Dove_attention, 0)) {
        const hid = [...new Set([...REPORTED.casts, ...startedNow])].filter(k => Tq[k] && (Tq[k].Hidden || /\[true\]/.test(Tq[k].Notes || '')));
        const know = new Set((Hd.Known_by || []).map(x => canon(String(x).trim())));
        const saw = Object.keys(S.Scene.Present || {}).filter(id => !know.has(canon(id)));
        if (hid.length && saw.length) add(`hidden:${hid[0]}:${dayNo}`, `${hid[0]} (hidden magic) was used with ${saw.slice(0, 3).join(', ')} present, but Dove_attention did not rise: raise it if it could have been noticed.`);
      }
      // R2: an item left the Bag with no use or gift reported
      const IB = B.Inventory || {}, IS = S.Inventory || {};
      for (const [k, it] of Object.entries(IB)) {
        const lk = k.toLowerCase(), now = Object.keys(IS).find(x => x.toLowerCase() === lk);
        if (/sunfizz/.test(lk) || num(it && it.Qty, 1) - (now ? num(IS[now].Qty, 1) : 0) <= 0 || REPORTED.used.includes(lk) || (c.craftSold || []).includes(lk)) continue;
        if (REPORTED.acts.some(a => /^(gift|rank_gift|birthday)$/.test(a.Kind) && (!a.Item || String(a.Item).toLowerCase().includes(lk) || lk.includes(String(a.Item).toLowerCase())))) continue;
        const usable = !!(fxOf(k) || {}).use;
        if (bonded.length) add(`bag:${lk}:${dayNo}`, `${k} left the Bag while ${bonded.slice(0, 2).join(' and ')} ${bonded.length > 1 ? 'were' : 'was'} here: if {{user}} gave it, report Kind gift with Item "${k}"${usable ? '; if {{user}} used it, insert it into /Consumables/-' : ''}.`);
        else if (usable) add(`bag:${lk}:${dayNo}`, `${k} left the Bag: if {{user}} used it, insert it into /Consumables/- so its effect applies.`);
      }
      if (text || said) {
        // R8: a pending Rank 5 gift or a one-use perk named without its report
        for (const [id, b] of Object.entries(S.Bonds)) {
          const g = (((REW.npcs || {})[id] || {}).gift || {}).name;
          if (b && b.$gift_pending && g && hasWord(low, g) && !actsOf(id).some(a => a.Kind === 'rank_gift'))
            add(`rgift:${id}:${dayNo}`, `${g} was mentioned: if ${id} actually handed it to {{user}}, report Kind rank_gift with ${id}.`);
        }
        for (const [k, p] of Object.entries(S._Perks || {}))
          if (num(p && p.Uses, 0) >= 1 && (B._Perks || {})[k] && hasWord(low, k) && !REPORTED.perks.includes(k.toLowerCase()))
            add(`perk:${k}:${dayNo}`, `${k} was mentioned: if {{user}} spent it, insert "${k}" into /Perk_use/-.`);
        // R5: one of {{user}}'s techniques named, but not charged
        const activeT = new Set(Object.values(M.Active || {}).map(e => e && e.Technique)), usedT = new Set([...REPORTED.casts, ...startedNow]);
        for (const k of Object.keys(Tq)) {
          if (k.length < 5 || usedT.has(k) || activeT.has(k) || !hasWord(low, k)) continue;
          add(`cast:${k}:${absA}`, `${k} appears in the last exchange but was not charged: if {{user}} actually cast it, report it in /Magic/Casts (or Magic.Active if it lasts).`);
        }
      }
      // R11: a costly effect left running for hours (or through sleep)
      for (const [name, e] of Object.entries(M.Active || {})) {
        const t = Tq[e && e.Technique], h = t && e.$started >= 0 ? (absA - e.$started) / 60 : 0;
        if (!(num(t && t.Upkeep_per_min, 0) > 0) || !(h >= 2 || (restedAs === 'sleep' && h >= 1))) continue;
        add(`active:${name}:${dayNo}`, `${name} has been running for ${h >= 10 ? Math.round(h) : Math.round(h * 10) / 10} h${restedAs === 'sleep' ? ', through sleep,' : ''} and costs mana every minute: remove it from Magic.Active if {{user}} ended it.`);
      }
      if (text) {
        // R6: a bonded character spoke, with no interaction reported and no talk counted today
        for (const id of (S.$ui.cast || {}).spoke || []) {
          const dd = (S.$eng.daily || {})[id];
          if (!S.Bonds[id] || id === KR.id || actsOf(id).length || (dd && dd.day === dayNo && dd.talk)) continue;
          add(`talk:${id}:${dayNo}`, `${id} spoke, but no interaction was reported: if it was a real conversation with {{user}}, report Kind talk (or hangout); a passing greeting adds nothing.`);
        }
        // R7: the narration tells of a gift to someone present, with no gift reported
        if (!out.some(o => o[0].startsWith('bag:'))) {
          for (const sent of narr.split(/(?<=[.!?])\s+/)) {
            if (!/\b(gifts?|a present|birthday present|gift-wrapped)\b/i.test(sent) || !/\b(give|gives|gave|given|hand|hands|handed|offer|offers|offered|present|presents|presented|slide|slides|slid|press|presses|pressed)\b/i.test(sent)) continue;
            const to = bonded.find(id => NAME_FORMS[id] && mentionIn(sent, id, formRx(id)));
            if (to && !actsOf(to).some(a => /^(gift|rank_gift|birthday)$/.test(a.Kind))) { add(`gift:${to}:${dayNo}`, `A gift to ${to} may have happened: if {{user}} gave one, report Kind gift with the Item.`); break; }
          }
        }
      }
      // R9: {{user}} said sorry to someone they hurt, with no apology reported
      if (/\b(sorry|apologi[sz]e[sd]?|apologies|forgive me)\b/i.test(said)) {
        const hurt = bonded.filter(id => num(((B.Bonds || {})[id] || {}).Tension, 0) >= 10 && !actsOf(id).some(a => a.Kind === 'apology'));
        if (hurt.length) add(`sorry:${hurt[0]}:${dayNo}`, `{{user}} may have apologised to ${hurt.slice(0, 2).join(' or ')}: if so, report Kind apology (the engine decides how much it eases).`);
      }
      // R13: a Transactions line with no change to Points (H3)
      if (lineNoPay) add(`pts:${absA}`, `Transactions gained "${lineNoPay}" but Points did not change: apply it with a delta on /Player/Wallet/Points if it was actually spent or earned.`);
      if (text) {
        // R3: the narration skips time, the clock hardly moved
        const tm = MISS_TIME_RX.exec(narr);
        if (tm && elapsed < 30) add(`time:${absA}`, `The narration moves time on ("${tm[0]}") but the clock moved only ${Math.round(elapsed)} min: set World.Time (and Day) to match.`);
        // R4: the narration has {{user}} arrive at a map place that Location does not show
        let arr = '';
        for (const m of narr.matchAll(MISS_ARRIVE_RX)) arr = (m[1] || m[2] || m[3] || '').replace(/\s+(?:of|and|&)$/, '');
        const nm = arr && (plName(arr) || PLACE_ALIAS[plKey(arr)] || PLACE_ALIAS[plKey(arr).replace(/^the /, '')] || '');
        if (nm && !(S.Trip && S.Trip.Active) && placeKey(nm) !== placeKey(S.World.Location))
          add(`loc:${placeKey(nm)}:${absA}`, `The narration has {{user}} arriving at ${nm}, but Location is ${placeOf(S.World.Location) || 'unset'}: update it if {{user}} is there now.`);
        // R10: an hour or more at a training place, training words, no /Training
        if (elapsed >= 50 && !REPORTED.training && MISS_TRAIN_AT.includes(placeKey(S.World.Location)) && !/^P[123] /.test(S.World._Period || '')
          && MISS_TRAIN_RX.test(said + '\n' + narr) && V._Fatigue !== 'Collapsed')
          add(`train:${placeKey(S.World.Location)}:${dayNo}`, `{{user}} may have trained at ${placeOf(S.World.Location)}: if it was a real session of about an hour, report it in /Training/- (mana or stamina).`);
      }
    }
    S.$ui.missed = out.slice(0, MISS_MAX).map(o => o[1]);
    for (const [sig] of out.slice(0, MISS_MAX)) seen[sig] = dayNo;
    S.$eng.missed = seen;
  }
}

// ---- 8m. 1.16.0 (owner-approved planning/DRAFT_dynamic_ambience.md): ambience for the next reply. How crowded and how lit the
// place is and one sensory cue type (on a new place or time block); a seeded beat (texture nearby, or a small brush with {{user}});
// rarely, a secret uncanny moment from the place's ghost story. Types, not sentences: the narrator writes the detail each time.
// Seeded and computed once per update, so every swipe of the next reply sees the same result (like the Fortune roll).
function stepAmbience(c) {
  const { S, B, hasB, toolEdit, OFF, absB, absA, elapsed, evs, dayNo, dayNoB, WXM, seed, TU, wxNow, restedAs, weekNo } = c;
  S.$ui.amb = null;
  const AML = OFF.has('ambience') ? 'off' : S.$ui.ambience || 'full';
  if (AML !== 'off' && hasB && !toolEdit && AMB.cats) {
    const AE = _.isPlainObject(S.$eng.amb) ? S.$eng.amb : (S.$eng.amb = {});
    for (const k of ['cue', 'beat', 'unc']) if (!_.isPlainObject(AE[k])) AE[k] = {};
    const pk = placeKey(S.World.Location), pkB = placeKey(B.World.Location), t = absA % DAY_MIN;
    const inPlace = (key, n) => key === n || key.startsWith(n + ' ') || key.startsWith(n + ',');
    const catOf = key => {
      const sub = key.includes(',') ? key.slice(key.indexOf(',') + 1).trim() : '';
      const byName = test => Object.keys(AMB.cats).find(c => AMB.cats[c].places.some(test));
      return (sub && byName(n => sub.includes(n))) || byName(n => inPlace(key, n)) || '';
    };
    const cat = catOf(pk), C0 = AMB.cats[cat] || null;
    const blockAt = m => [360, 480, 600, 720, 780, 960, 1080, 1200].filter(x => m >= x).length;
    const blk = blockAt(t), blkB = blockAt(absB % DAY_MIN);
    const cur = String(S.World._Curfew || ''), afterCurfew = /CURFEW|LOCKDOWN/.test(cur);
    const out = isOutdoor(S.World.Location) || /courtyard/.test(pk);
    const noClass = evs.some(e => e.noclass || e.home || e.lockdown || e.away);
    const exam = [3, 5, 9, 11].includes(S.World.Month) && S.World.Week === 1 && MON_THU.includes(S.World.Day);
    const W0 = WXM !== 'off' && S.$ui.wx && !S.$ui.wx.away ? S.$ui.wx.now : null;
    const wtags = new Set();
    if (W0) {
      if (W0.snow) wtags.add('snow'); else if (W0.sky === 'Rain') wtags.add('rain');
      if (W0.sky === 'Storm') wtags.add('storm'); if (W0.sky === 'Fog') wtags.add('fog'); if (W0.sky === 'Clear') wtags.add('clear');
      if (W0.wind === 'windy' || W0.wind === 'gale') wtags.add('wind'); if (W0.temp >= 26) wtags.add('heat'); if (W0.temp <= 5) wtags.add('cold');
    }
    // crowd: the category's rhythm for this kind of day, then exams, events, weather (Full), breaks, the Thinning and curfew
    let crowd = -1;
    if (C0) {
      crowd = (noClass || S.World.Day === 'Sun' ? C0.free : S.World.Day === 'Sat' ? C0.sat || C0.free : C0.class)[blk];
      const plan = evs.map(e => `${e.t} ${schedOf(e, S.World.Day) || ''}`).join(' ').toLowerCase();
      if (exam && cat === 'study' && blk >= 1) crowd = 4;
      if (blk >= 2 && C0.places.some(n => plan.includes(n))) crowd = Math.max(crowd, 3);
      if (/feast/.test(plan) && pk.startsWith('ring dining hall') && t >= 1140 && t < 1320) crowd = 4;
      if (/arbiter hall/.test(plan) && pk.startsWith('arbiter hall') && t >= 540 && t < 660) crowd = 4;
      if (wxNow && wxBad(wxNow)) crowd = out ? Math.max(0, crowd - 2) : ['hub', 'dining', 'dorm_social', 'study', 'sport', 'clubs', 'mall'].includes(cat) ? Math.min(4, crowd + 1) : crowd;
      if (evs.some(e => e.home)) crowd = ['gate', 'staff', 'care'].includes(cat) ? Math.min(crowd, 1) : 0;
      if (afterCurfew && !['dorm_social', 'dorm_utility'].includes(cat)) crowd = 0;
    }
    // light: sunrise and sunset by the calendar (real-life months, interpolated by week), the sky, indoors or out
    const sx = S.World.Month - 1 + (S.World.Week - 0.5) / 4 - 0.5, s0 = Math.floor(sx), sf = sx - s0;
    const sa = AMB.sun[String(((s0 % 12) + 12) % 12 + 1)], sb = AMB.sun[String((((s0 + 1) % 12) + 12) % 12 + 1)];
    const rise = sa[0] + (sb[0] - sa[0]) * sf, set = sa[1] + (sb[1] - sa[1]) * sf;
    const phase = t < rise - 40 || t > set + 40 ? 'dark' : t < rise ? 'dawn' : t > set ? 'dusk' : 'day';
    const dim = !!W0 && (/Rain|Storm|Fog/.test(W0.sky) || !!W0.snow);
    const light = out ? (phase === 'dark' ? (wtags.has('clear') ? 'dark, starlit' : 'dark') : phase === 'day' ? (dim ? 'grey, overcast' : 'daylight') : phase)
      : phase === 'day' ? (dim ? 'grey daylight through the windows' : 'daylight through the windows') : afterCurfew || t < 420 ? 'lanterns at their night burn' : 'lamps lit';
    const season = SEASONS[S.World.Month - 1];
    const tbs = new Set([phase === 'dawn' ? 'dawn' : '', t >= 300 && t < 720 ? 'morning' : t >= 720 && t < 1020 ? 'day' : t >= 1020 && t < 1200 ? 'evening' : 'night'].filter(Boolean));
    const curfewOut = afterCurfew && !['dorm_social', 'dorm_utility'].includes(cat);
    const flu = !!(S.$ui.wx && S.$ui.wx.flu);
    const fits = (w, beat) => (w.out === undefined || w.out === out) && (!w.tb || w.tb.some(x => tbs.has(x))) && (!w.wx || w.wx.some(x => wtags.has(x)))
      && (!w.season || w.season.includes(season)) && (w.min === undefined || crowd >= w.min) && (w.max === undefined || crowd <= w.max)
      && (!w.exam || exam) && (!w.flu || flu) && (!beat || crowd > 0 || w.far) && (!beat || !curfewOut || w.curfew);
    // one cue type per new place or time block, not the same one at this place within three days
    const fresh = pk !== pkB || blk !== blkB || dayNo !== dayNoB || elapsed > 360;
    // the place's own types come first (7 or 6 times in 10), so the shared ones do not crowd them out
    const placeFirst = (all, tenths, tag) => { const own = all.filter(([x]) => x[0] === cat); return own.length && hash32(seed, tag + 'own', pk, absA) % 10 < tenths ? own : all; };
    let cue = '';
    if (C0 && fresh) {
      const hist = (AE.cue[pk] || []).filter(([, d]) => dayNo - d < 3);
      const all = AMB.cues.map((c, i) => [c, i]).filter(([c, i]) => (c[0] === '*' || c[0] === cat) && fits(c[3], false) && !hist.some(([j]) => j === i));
      const pool = placeFirst(all, 7, 'cue');
      if (pool.length) { const [c, i] = pool[hash32(seed, 'cue', pk, absA) % pool.length]; cue = c[2]; hist.push([i, dayNo]); }
      AE.cue[pk] = hist.slice(-12);
      for (const k of Object.keys(AE.cue).slice(0, -40)) delete AE.cue[k];
    }
    // the beat: on a new place, or 30 minutes after the last roll; never in a battle, asleep, in {{user}}'s class or on a tool edit
    const battle = !!(S.Battle && S.Battle.Active);
    const inClass = !noClass && /^P[123] /.test(S.World._Period || '') && ['teaching', 'craft', 'combat'].includes(cat);
    let beat = null, unc = null;
    if (AML === 'full' && C0 && !battle && restedAs !== 'sleep' && !inClass && (pk !== pkB || !(num(AE.last, -1) >= 0) || absA - num(AE.last, -1) >= 30)) {
      AE.last = absA;
      const d = d100(seed, 'amb', S.$eng.turn, absA), calm = { 1: 70, 2: 55, 3: 40 }[TU.amb_freq] || 55;
      let kind = d <= calm ? '' : d > 90 ? 'brush' : 'tex';
      if (kind === 'brush' && ((S.$ui.hap && S.$ui.hap.now) || noClass)) kind = '';   // a happening or an event day holds the attention
      // 1.24.0 (owner playtest): now and then the talk nearby is one of this place's stories {{user}} has not heard yet (once a day;
      // needs people around or company); the Campus Map then shows it
      const untold = kind ? (PLACE_LORE[pk] || []).filter(([u]) => !S.$ui.lore.includes(String(u))) : [];
      if (untold.length && (crowd > 0 || Object.keys(S.Scene.Present || {}).length) && num(AE.lore, -1) !== dayNo
        && d100(seed, 'lore', S.$eng.turn, absA) <= num(AMB.lore_chance, 35)) {
        const [u, , title, text] = untold[hash32(seed, 'lorepick', pk, absA) % untold.length];
        AE.lore = dayNo; hearLore(S, u, title, placeOf(S.World.Location)); beat = { kind: 'lore', text: `${title}. ${text.replace(/[.\s]+$/, '')}` }; kind = '';
      }
      if (kind) {
        const W1 = ((B.$ui || {}).wx || {}).now;
        const gos = S.$ui.gossip || [];
        const tomorrow = eventsOn(fromAbs((dayNo + 1) * DAY_MIN)).filter(e => !evs.some(x => x.t === e.t)), yesterday = eventsOn(fromAbs((dayNo - 1) * DAY_MIN)).filter(e => !evs.some(x => x.t === e.t));
        const special = sp => sp === 'overheard' ? (gos.length ? `overheard: the rumour "${gos[hash32(seed, 'ovh', absA) % gos.length][0]}", in someone else's words` : '')
          : sp === 'weather_turn' ? (W0 && W1 && (W0.sky !== W1.sky || W0.rare !== W1.rare) ? `the weather turning: ${S.$ui.wx.text || W0.sky.toLowerCase()}` : '')
          : sp === 'event_echo' ? (tomorrow.length ? `preparations for tomorrow's ${tomorrow[0].t.split(' (')[0]}` : yesterday.length ? `what is left of yesterday's ${yesterday[0].t.split(' (')[0]}` : '') : '';
        const bh = (AE.beat[cat] || []).filter(([, dd]) => dayNo - dd < 7);
        const pool = placeFirst(AMB.beats.map((b, i) => [b, i]).filter(([b, i]) => (b[0] === '*' || b[0] === cat) && b[1] === kind && fits(b[3], true) && !bh.some(([j]) => j === i) && (!b[3].special || special(b[3].special))), 6, 'beat');
        if (pool.length) {
          const [b, i] = pool[hash32(seed, 'beat', pk, absA) % pool.length];
          beat = { kind, text: b[3].special ? special(b[3].special) : b[2] }; bh.push([i, dayNo]);
        }
        AE.beat[cat] = bh.slice(-30);
      }
    }
    // the uncanny moment: a small seeded chance where and when one of the ghost stories can happen; at most one a week, the
    // same story not within 30 days; doubled in fog and during the Thinning (indoors), and for a story's own season or day
    const U = AE.unc;
    if (!_.isPlainObject(U.last)) U.last = {};
    if (AML === 'full' && !battle && num(U.w, -99) !== weekNo) {
      const thin = evs.some(e => e.lockdown), alone = !Object.keys(S.Scene.Present || {}).length, dark = phase === 'dark' || phase === 'dusk';
      const inWin = (f, to) => (f <= to ? t >= f && t < to : t >= f || t < to);
      const FARK = ['boathouse and lake', 'fishing house', 'willow island', 'grassy field and hills', 'old hut', 'forest', 'forest clearing', 'observation tower'];
      const isFar = k => FARK.some(n => inPlace(k, n)), path = pk !== pkB && (isFar(pk) || isFar(pkB));
      const cands = (AMB.uncanny || []).filter(u => (!u.places.length || u.places.some(n => inPlace(pk, n))) && (!u.out || out) && (!u.dark || dark)
        && (!u.dusk || phase === 'dusk' || phase === 'dark') && (u.from === undefined || inWin(u.from, u.to)) && (!u.curfew || /CURFEW/.test(cur))
        && (!u.alone || alone) && (!u.awake || restedAs !== 'sleep') && (!u.asleep || restedAs === 'sleep' || restedAs === 'rest') && (!u.path || path)
        && !(thin && out) && dayNo - num(U.last[u.id], -99) >= 30);
      if (cands.length) {
        const u = cands[hash32(seed, 'unc', absA) % cands.length];
        const own = (u.x2 === 'winter' && season === 'Winter') || (u.x2 === 'remembrance' && evs.some(e => /Remembrance/.test(e.t)));
        const ch = num(AMB.uncanny_chance, 5) * (wtags.has('fog') ? 2 : 1) * (thin ? 2 : 1) * (own ? 2 : 1);
        if (d100(seed, 'uncanny', S.$eng.turn, absA) <= ch) { U.w = weekNo; U.last[u.id] = dayNo; unc = { id: u.id, title: u.title, text: u.text }; }
      }
    }
    if (fresh || beat || unc) S.$ui.amb = { place: placeOf(S.World.Location), crowd: crowd >= 0 ? AMB_LEVELS[crowd] : '', light, cue, beat, unc };
  }
}

// ---- 9. UI bookkeeping ----
function stepUi(c) {
  const { S, B, offUnlock, evs, dayNo, M, Hd, text, toolEdit, OFF } = c;
  const place = placeOf(S.World.Location);
  // 1.16.1 (audit B6): only places on the Campus Map, so off-campus names never push a discovered place out of the list (cap 80)
  if (place && plName(place) && !S.$ui.discovered.includes(place)) S.$ui.discovered.push(place);
  // 1.24.0: a story is heard when the narration names it (as a proper name, so "the long corridor" in passing does not count); with
  // Ambience below Full nobody is overheard, so a place's stories come with the first visit
  if (!toolEdit && text) for (const k of Object.keys(PLACE_LORE)) for (const [u, nm, title] of PLACE_LORE[k])
    if (!S.$ui.lore.includes(String(u)) && new RegExp(`(^|[^\\w'])(The )?${_.escapeRegExp(nm)}(?![\\w'])`).test(text)) hearLore(S, u, title, '');
  if ((OFF.has('ambience') || (S.$ui.ambience || 'full') !== 'full') && placeKey(S.World.Location) !== placeKey(((B || {}).World || {}).Location))
    for (const [u, , title] of PLACE_LORE[placeKey(S.World.Location)] || []) hearLore(S, u, title, placeOf(S.World.Location));
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
  S.$ui.next = nextUp(S.World, evs, S);   // 1.3.4: the bracelet's "Next" chip
  S.$ui.toasts = S.$ui.toasts.slice(-10);
}

// ---- 10. commit ----
function stepCommit(c) {
  const { S, B, log, hasB, absA } = c;
  S.$eng.abs = absA;
  // 1.7.4: the first update in campaign Year 2 or later dates every line still written in Year 1's plain form ("[M3 W2 Tue]" ->
  // "[Y1 M3 W2 Tue]"); lines of this update already carry their own year (stamp, withYear), so a bare date here is from Year 1.
  if (hasB && (B.World.Year || 1) === 1 && S.World.Year > 1) {
    const y1 = x => (typeof x === 'string' ? withYear(x, 1) : x);
    S.Journal = (S.Journal || []).map(y1);
    if (Array.isArray(S.$ui.archive)) S.$ui.archive = S.$ui.archive.map(y1);
    for (const b of Object.values(S.Bonds || {})) {
      b.Last_seen = y1(b.Last_seen);
      for (const f of ['Knows', '$Knows_old']) if (Array.isArray(b[f])) b[f] = b[f].map(y1);
      for (const f of ['$Recent', '$Defining']) if (Array.isArray(b[f])) b[f] = b[f].map(r => (r && typeof r === 'object' ? { ...r, w: y1(r.w) } : r));
      if (Array.isArray(b.Imprints)) b.Imprints = b.Imprints.map(x => (x && typeof x === 'object' ? { ...x, When: y1(x.When) } : x));
    }
    for (const v of Object.values((S.Campus_State || {}).Events || {})) if (v && typeof v === 'object') v.Updated = y1(v.Updated);
  }
  if (log.length) S._Log = [...(S._Log || []), ...log.map(l => `[${stamp(S.World)}] ${l}`)].slice(-12);
}

const ENGINE_STEPS = [stepSetup, stepMigrate, stepGuards, stepFeatures, stepTime, stepWeather, stepMagic, stepRest, stepExposure, stepVitals, stepReputation, stepFortune, stepSchoolWeek, stepNamesInProse, stepBonds, stepBondMemory, stepProficiency, stepTraining, stepPerkUse, stepHidden, stepPayout, stepRecords, stepClubLife, stepNewYear, stepGraduation, stepGraduateRewards, stepInitiative, stepHooks, stepGossip, stepBag, stepCampusEvents, stepExtras, stepCast, stepReminders, stepAmbience, stepUi, stepCommit];

// 1.17.0 (audit T1): the card's trim regex ("State-as-memory", minDepth 24) leaves every older message as "[…]", and each one was
// still sent. SillyTavern emits CHAT_COMPLETION_PROMPT_READY with { chat, dryRun } and sends that same array (public/scripts/openai.js,
// prepareOpenAIMessages; Tavern Helper passes the object through): each run of "[…]" messages becomes one.
const TRIMMED = /^\s*(?:[^\n:]{1,40}:\s*)?\[…\]\s*$/;
function collapseTrimmed(chat) {
  if (!Array.isArray(chat)) return 0;
  let removed = 0;
  for (let i = chat.length - 1; i > 0; i--) {
    const a = chat[i - 1], b = chat[i];
    if (a && b && typeof a.content === 'string' && typeof b.content === 'string' && TRIMMED.test(a.content) && TRIMMED.test(b.content)) {
      a.n = (a.n || 1) + (b.n || 1); chat.splice(i, 1); removed++;
    }
  }
  for (const m of chat) if (m && m.n > 1) { m.content = `[… ${m.n} earlier messages; <current_state> is the story's memory …]`; delete m.n; }
  return removed;
}
if (typeof eventOn === 'function' && typeof tavern_events === 'object' && tavern_events && tavern_events.CHAT_COMPLETION_PROMPT_READY) {
  eventOn(tavern_events.CHAT_COMPLETION_PROMPT_READY, data => { try { collapseTrimmed(data && data.chat); } catch (e) { console.error('[Eldrasil trim]', e); } });
}
// 1.30.1 (owner playtest: two replies of fourteen lost their whole update, and with it the new location): MagVarUpdate reads a
// patch only inside a complete <JSONPatch>…</JSONPatch> (update_variables.ts extractCommands, checked at MagVarUpdate b13b43b),
// so a block without the tags, or without the closing one, was dropped. When MVU found no JSON patch in a reply that has an
// <UpdateVariable> block, the engine reads the list itself (missing tags or brackets, trailing commas) and hands MVU the commands
// its extractJsonPatch would have made, before the zod helper checks them (COMMAND_PARSED runs first).
function recoverPatch(content) {
  const m = /<UpdateVariable>([\s\S]*?)(?:<\/UpdateVariable>|$)/i.exec(String(content || ''));
  if (!m) return null;
  const body = m[1].replace(/<Analysis>[\s\S]*?<\/Analysis>/gi, '').replace(/<\/?json_?patch>/gi, '').replace(/```[a-z]*/gi, '');
  const a = body.search(/[[{]/), z = Math.max(body.lastIndexOf(']'), body.lastIndexOf('}'));
  if (a < 0 || z < a) return null;
  let s = body.slice(a, z + 1).trim();
  if (s[0] === '{') s = '[' + s.replace(/\]\s*$/, '') + ']';
  let ops;
  try { ops = JSON.parse(s.replace(/,\s*([\]}])/g, '$1')); } catch (e) { return { error: String(e.message || e).slice(0, 80) }; }
  if (!Array.isArray(ops)) return { error: 'the block is not a list of operations' };
  return { ops: ops.filter(o => o && typeof o === 'object' && typeof o.op === 'string') };
}
const mvuPath = segs => segs.map(x => `["${String(x).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`).join('');
const mvuPointer = p => mvuPath(String(p || '').replace(/^\//, '').split('/').map(x => x.replace(/~1/g, '/').replace(/~0/g, '~')));
function patchCommands(ops) {
  const out = [];
  for (const op of ops) {
    const path = mvuPointer(op.path ?? op.to), full = JSON.stringify(op), val = JSON.stringify(op.value);
    if (op.op === 'replace') out.push({ type: 'set', full_match: full, args: [path, val], reason: 'json_patch' });
    else if (op.op === 'delta') out.push({ type: 'add', full_match: full, args: [path, val], reason: 'json_patch' });
    else if (op.op === 'insert' || op.op === 'add') {
      const parts = _.toPath(path), last = parts[parts.length - 1];
      out.push({ type: 'insert', full_match: full, args: [mvuPath(parts.slice(0, -1)), /^\d+$/.test(last) ? last : JSON.stringify(last), val], reason: 'json_patch' });
    } else if (op.op === 'remove') out.push({ type: 'delete', full_match: full, args: [path], reason: 'json_patch' });
    else if (op.op === 'move') out.push({ type: 'move', full_match: full, args: [mvuPointer(op.from), path], reason: 'json_patch' });
  }
  return out;
}
if (typeof eventOn === 'function' && typeof waitGlobalInitialized === 'function') {
  (async () => {
    await waitGlobalInitialized('Mvu');
    let text = '';   // message being parsed in this update (COMMAND_PARSED fires before VARIABLE_UPDATE_ENDED)
    eventOn(Mvu.events.VARIABLE_UPDATE_STARTED, () => { text = ''; });
    let repaired = '';   // 1.30.1: what the recovery of a malformed block did, for the Log after the engine runs
    eventOn(Mvu.events.VARIABLE_UPDATE_STARTED, () => { repaired = ''; });
    eventOn(Mvu.events.COMMAND_PARSED, (_v, commands, content) => {
      text = content || '';
      if (!Array.isArray(commands) || commands.some(x => x && x.reason === 'json_patch')) return;
      const r = recoverPatch(content);
      if (r && r.ops && r.ops.length) {
        commands.push(...patchCommands(r.ops));
        repaired = `The update block was malformed (a <JSONPatch> tag or bracket was missing); the engine read its ${r.ops.length} changes.`;
      } else if (r && r.error) repaired = `The update block could not be read (${r.error}); nothing in it was applied. Swipe the reply.`;
    });
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, variables_before) => {
      let hint = '', said = '';
      try { const c = SillyTavern.chat || [], m = c[c.length - 1] || {}; hint = String(m.send_date || '') + '|' + (SillyTavern.getCurrentChatId ? SillyTavern.getCurrentChatId() : ''); } catch (e) { /* seed falls back to world time */ }
      // 1.12.0: the player's last visible message (not a hidden player-tool entry), for the reminders of section 8l
      try { const c = SillyTavern.chat || []; for (let i = c.length - 1; i >= 0; i--) { const x = c[i] || {}; if (x.is_user && !x.is_system && !/\(player tool\)/.test(String(x.mes || ''))) { said = String(x.mes || ''); break; } } } catch (e) { /* no reminders from the player's words */ }
      // 1.16.1 (audit B8): the engine edits the state in place. If it fails halfway, the state goes back to what it was before
      // this reply (a half-run engine must not be saved), and the player is told so: swipe, or report the error.
      const before = variables_before && variables_before.stat_data;
      const snap = _.cloneDeep(before && before.World ? before : variables.stat_data);
      try {
        runEngine(variables.stat_data, before, text, hint, said); text = '';
        if (repaired) {
          const S = variables.stat_data;
          S._Log = [...(Array.isArray(S._Log) ? S._Log : []), repaired].slice(-12);
          if (/could not be read/.test(repaired) && S.$ui && Array.isArray(S.$ui.toasts)) S.$ui.toasts.push('Update block unreadable: swipe the reply');
          repaired = '';
        }
      }
      catch (e) {
        console.error('[Eldrasil engine]', e);
        text = '';
        const S = variables.stat_data;
        for (const k of Object.keys(S)) delete S[k];
        Object.assign(S, snap);
        const msg = `Engine error (${String((e && e.message) || e).slice(0, 160)}): this update was not applied and the state was kept as it was before the reply. Swipe the reply, or report the error with the browser console.`;
        S._Log = [...(Array.isArray(S._Log) ? S._Log : []), msg].slice(-12);
        if (S.$ui && typeof S.$ui === 'object') S.$ui.toasts = ['Engine error: the update was not applied (see Log)'];
      }
    });
  })();
}
