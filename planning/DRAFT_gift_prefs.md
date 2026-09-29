# DRAFT: Gift preferences per NPC (Stardew-style gift table)

Status: **disetujui owner 2026-09-27** ("sisanya approve"): semua tabel NPC §3, toko dan barang §4, ulang tahun §5 dan
sebarannya, dan usulan draft untuk `[?]` 1–6 di akhir. Ulang tahun di hari Minggu boleh (owner). Diimplementasikan bersama mood/fatigue dalam v1.8.0 (2026-09-28), FP6 selesai. Canon baru: selera hadiah dan ulang tahun tiap NPC, tujuh toko baru di
Mall, aturan alkohol untuk murid.

Keputusan owner (2026-09-27, chat):
- **5 tier**: loved / liked / neutral / disliked / **hated**.
- **Discovery**: teks Loves/Hates di dossier tetap terbuka per rank, **plus gift log** (setiap barang yang pernah diberikan
  tercatat di dossier bersama reaksinya).
- **Ulang tahun** ×2 XP. Tersebar merata di kalender dan tidak jatuh di hari event (beberapa hari sebelum/sesudah boleh).
  Disliked/hated di hari ulang tahun: **Tension ×2**.
- **Ezrel tanpa ulang tahun**, **Krieg tanpa XP dari gift** (hanya reaksi dan Tension): disetujui.
- **Alkohol**: murid boleh membeli dan menerimanya, tapi **hanya boleh diminum di hari libur**.
- **Toko baru di Mall** untuk cerutu, anggur dan barang hadiah. Hadiah dibuat kreatif, tidak terikat katalog lama; setiap
  barang baru punya toko dan harga di §4.

Menyentuh keputusan HANDOFF §4 **Bonds**: tier gift sekarang dinilai narrator. Dengan draft ini engine yang memutuskan kalau
barangnya ada di tabel, dan penilaian narrator jadi cadangan.

---

## 1. Mekanik (engine, card; bukan preset)

**Laporan narrator.** Interaksi gift mendapat field `Item`:
`{"With": "Sophia", "Kind": "gift", "Item": "Nine Rivers: Field Tactics", "Gift": "loved"}`.
`Item` = nama barang atau beberapa kata biasa. `Gift` tetap diisi narrator dan dipakai hanya sebagai cadangan.

**Resolusi tier (deterministik).** Engine mencocokkan `Item` (huruf kecil) dengan kata kunci tiap entri:
1. Tabel NPC itu, urut **hated → loved → disliked → liked**.
2. Tabel universal (§2), urutan sama.
3. Tidak ada yang cocok → tier dari narrator (`Gift`).

Setiap barang katalog (§4) punya kata kunci sendiri, dan entri kategori ("sweets", "anything from the Doves") punya regex.
Draft ini menyetujui **barang dan kategorinya**; regex ditulis saat implementasi.

**Narrator tahu seleranya.** Cast Sheet NPC yang hadir mendapat satu baris: `Gifts: loves <2-3>; hates <1>` (narrator only),
sekitar 25 token per NPC hadir, supaya reaksi yang ditulis cocok dengan hasil engine.

| Tier | XP | Efek lain |
|---|---|---|
| loved | 4 (×1.5 dari Rank 3) | — |
| liked | 2 | — |
| neutral | 1 | — |
| disliked | 0 | Tension +5 |
| hated | 0 | Tension +10 |

- Batas tetap **2 gift per minggu** per NPC.
- **Ulang tahun**: gift pertama di hari itu ×2 XP (setelah bonus loved) dan tidak dihitung ke batas mingguan; Tension dari
  disliked/hated ×2. `<now>` menyebut "today is <Name>'s birthday" untuk NPC yang punya bond.
- **Gift log**: `Bonds.<id>.$gifts` = `{ "<nama barang>": "<tier>" }`, paling banyak 24, yang terlama dibuang. Dossier menampilkan
  bagian **Gifts** dengan chip per tier.
- **Dossier**: field `Birthday` terbuka di share level 3 (lihat §5.3).
- **Krieg**: tanpa XP; disliked/hated tetap menaikkan Tension.
- **Etnie**: gift apa pun dari {{user}} minimal **liked** (kecuali hated miliknya); tetap 2 per minggu.
- **Migrasi save**: `fillShape` menambahkan `$gifts: {}`; save lama termuat tanpa kehilangan data (test wajib).
- Murid akademi rival: tidak punya bond, jadi tidak punya tabel.

**Aturan alkohol (card, English):**
> Students may buy alcohol and receive it as a gift, but may drink it only on the rest day (Sunday) and in the holidays.
> Staff enforce it like curfew: a student caught drinking on a class day loses points and gets a mark on their record.
> Barrow & Vine asks for the bracelet and says so at the counter.

---

## 2. Tabel universal (berlaku kalau tabel NPC tidak menyebut barangnya)

| Tier | Barang |
|---|---|
| Liked | Sweets and baked goods. A good meal {{user}} pays for. Something {{user}} made by hand (a drawing, a carving, a long letter). |
| Neutral | Everyday things: stationery, common drinks, umbrella, scarf, plain food, cut flowers. |
| Disliked | Merryhew's prank goods given as a present. Junk: rocks, broken things, weeds. Tobacco. Raw reagents. Alcohol, for anyone who does not drink. |
| Hated | Anything tied to forbidden magic (an unregistered pact token, a forbidden-art text): dangerous just to hold. |

Beberapa NPC membalik aturan ini (Percival suka rongsokan, Nerys suka barang pungutan, Rei/Vallie suka tembakau,
Vera/Royhan/Mimosa suka reagen, Aiden/Nerys suka barang prank).

---

## 3. Per NPC

Urutan: Loved / Liked / Disliked / Hated. `[L]` = langsung dari Loves/Hates lore; nama barang *miring* ada di katalog §4.

### Year 3

**Irene** · 🎂 **M11 W3 Thu** (the week before she graduates from the place she calls home)
- Loved: *Honey bun* [L]. *Halvard Through the Centuries* (leather-bound). *Steel-nib fountain pen*.
- Liked: *Halvard pennant*. *Walnut desk tidy*. Tea.
- Disliked: Romantic gifts (she is afraid of intimacy). Gaudy jewellery.
- Hated: Contraband: prank goods, *The Vigil*, anything smuggled past curfew [L: rule-breaking].

**Caspian** · 🎂 **M10 W3 Sat** (the week before the Harvest Festival he runs)
- Loved: *Carved Asmoday charm*. *Chamois lens cloth* (he wears his own thin).
- Liked: *Festival lantern set*. A Snug meal. Gossip, written down.
- Disliked: Weapons. Anything that takes a side in a quarrel.
- Hated: Anything of Dove issue (a Dove seal, a Dovecote form, manacles) [L: Krieg's methods].

**Etnie** · 🎂 **M2 W2 Sat** · *minimal liked for anything from {{user}}*
- Loved: Something {{user}} has worn (the scent) [L]. *Black silk ribbons* [L]. Food, any, in quantity [L].
- Liked: Everything else from {{user}}.
- Disliked: —
- Hated: A gift that means goodbye or distance (a farewell present, a *thank-you card*).

**Royhan** · 🎂 **M5 W1 Sat** (the day after exams end)
- Loved: *Rare reagent*. *Bag of Nightwell beans* [L]. *Dragonchess problem book* [L].
- Liked: *Glass stirring-rod set*. Plain, filling food.
- Disliked: Luxuries (Ardenne goods, private dining): it feels like charity [L].
- Hated: Points or money given outright.

**Sophia** · 🎂 **M4 W3 Tue** (spring rains)
- Loved: *Nine Rivers: Field Tactics* [L]. *Crossed Blades: Famous Duels*. *Rainglass* [L: rain].
- Liked: Hearty meat dishes. *Duelling gauntlets*.
- Disliked: Cute things, flowers, sweets. Fashion and jewellery.
- Hated: *Get-well hamper*, or anything that "handles" her [L]. Anything celebrating Gareth [L].

**Gareth** · 🎂 **M5 W2 Wed** (two days before Results)
- Loved: *Sovereigns* (imported strategy game) [L]. *Dragonchess problem book* [L].
- Liked: *Engraved trophy cup* [L: being admired]. Tea. Books.
- Disliked: Consolation gifts; anything second-place (a silver rosette, a runner-up ribbon) [L].
- Hated: Anything that shows {{user}} has seen through him (a gift about his battle self) [L].

**Ruby** · 🎂 **M3 W3 Mon** (after the Club Festival)
- Loved: *Gut guitar strings* [L]. Sweets [L]. *Songbook of old ballads*.
- Liked: Almost anything given kindly. *Carrots and fresh greens*.
- Disliked: Weapons and fighting gear [L].
- Hated: A gift that picks a side (a dorm-rivalry badge, a team favour) [L].

### Year 2

**Lenna** · 🎂 **M6 W1 Sun** (she sleeps through it)
- Loved: *The Rose in the Tower* (romance novel) [L]. *Plush animal* [L]. *Goosedown pillow* [L: sleep].
- Liked: Good food [L]. *Premium beast jerky* (for the Menagerie).
- Disliked: *Wind-up alarm clock*. Weapons.
- Hated: Anything from the Doves, or about her past [L].

**Saffi** · 🎂 **M6 W3 Thu** (two days before Sports Day)
- Loved: *Running shoes* [L]. *Smoked river fish*.
- Liked: After-training snacks. Something for Lenna [L].
- Disliked: Textbooks [L]. *Etiquette manual* [L].
- Hated: —

**Kanae** · 🎂 **M1 W3 Thu** (two days before Star Night)
- Loved: *Seven Towers* (deluxe edition) [L]. *Palm crystal ball* [L]. *Porcelain tea set* [L].
- Liked: Sweets arranged beautifully [L]. *Silver hand mirror*. *Star atlas*.
- Disliked: *The Oracle Shell* (she calls it nonsense in public). Plain, ugly things.
- Hated: Anything from or recommended by Caralynn [L].

**Idris** · 🎂 **M7 W1 Tue** (high summer; he likes warmth)
- Loved: *Moonfern in a pot* [L]. *Hearthstone hand-warmer* [L: cold].
- Liked: A book to read in the Gardens [L]. *Pruning shears*. Anything expensive (he can resell it) [L].
- Disliked: Cheap sentimental trinkets. Iced drinks.
- Hated: Anything from the Doves [L].

**Tilly** · 🎂 **M10 W2 Thu** (two days before Occult Dorm Day)
- Loved: *Lamps Out: Tales of Halvard* [L]. *The Night Student: A True Account*. *Shuttered dark-lantern*.
- Liked: Canteen food [L]. *Lavender laundry soap* [L]. A fat notebook for "Halvard Unexplained".
- Disliked: Anything "for her safety" (a helmet, a warding charm) [L].
- Hated: *The Truth Behind Halvard's Ghosts* [L: "it's just a story"].

**Dante** · 🎂 **M11 W2 Tue**
- Loved: *Precision tool roll* [L: things that work]. Something for the younger students he looks after [L].
- Liked: Tea. *Shuttered dark-lantern*. A Snug meal.
- Disliked: Prank goods. Flashy luxuries.
- Hated: Anything stolen or bought with a lie [L].

**Florian** · 🎂 **M9 W4 Tue** (two days before the Kingdom Competition)
- Loved: Ardenne goods [L]. *Premium beast jerky* (for Hades) [L]. *Fine vintage*.
- Liked: *Bergamot cologne* [L: being looked at]. *Silver hand mirror*.
- Disliked: Cheap or homemade things (he is polite about it).
- Hated: Pity or consolation gifts [L]. Anything that says third [L].

### Year 1

**Aiden** · 🎂 **M9 W2 Mon** (the week of the Bazaar)
- Loved: Merryhew's goods [L]. *Marked deck*. *Loaded bone dice*.
- Liked: Things he can sell on. Sweets. Games.
- Disliked: *Etiquette manual* [L: rules without reasons].
- Hated: Anything paid for with a welched bet [L].

**Caralynn** · 🎂 **M8 W3 Mon** (the week of the Academy Showcase)
- Loved: Ardenne goods [L]. *Bouquet of stage roses* [L: spotlight]. A portrait of her.
- Liked: *Silver hand mirror*. Jewellery. *Songbook of old ballads*.
- Disliked: Plain, practical gifts. Anything that compares her to someone [L].
- Hated: *Platform boots*, or anything about height [L].

**Zara** · 🎂 **M11 W1 Thu**
- Loved: *Bolt of Sky silk* [L: designing]. *Embroidery thread set*. A library book she mentioned [L].
- Liked: *Talisman paper stack*. *Sketchbook and charcoal*. Tea by a fire [L].
- Disliked: Clothes for her to wear [L]. Anything that draws eyes to her [L].
- Hated: Anything from the Doves (they burned her talismans) [L].

**Percival** · 🎂 **M6 W2 Mon**
- Loved: A "wounded relic": a cracked shell, a broken buckle, an odd rock [L]. *Songs of the Oathbound* [L].
- Liked: *Knight's pennon*. Food for sharing [L]. Anything grand.
- Disliked: Almost nothing; he makes a story out of everything. Junk counts as loved.
- Hated: A cruel prank item [L: people who hurt the weak].

**Trixie** · 🎂 **M8 W2 Tue** (two days before the circus arrives)
- Loved: Sweets [L]. *Prism charm* [L: shiny]. *Juggling set*.
- Liked: Surprises [L]. Costume pieces. *Premium beast jerky* (for the Menagerie) [L].
- Disliked: Quiet things (a meditation book, a sleep mask) [L].
- Hated: —

**Vera** · 🎂 **M3 W2 Wed**
- Loved: *Rare reagent* [L]. *Firetooth (tin)* [L]. *Mystery clockwork (sold as seen)* [L: taking things apart].
- Liked: *Precision tool roll*. Sweet tea [L]. Common reagents.
- Disliked: *The Vigil* [L]. Decorations with no purpose.
- Hated: Something built badly on purpose [L: wasted materials].

**Castor** · 🎂 **M1 W2 Thu** (nobody remembers it)
- Loved: *Blank leather journal* [L: writing]. *Steel-nib fountain pen*. *Pocket thermos* (for early Gardens) [L].
- Liked: Books. Plain things that do not stand out.
- Disliked: Loud or flashy things. A gift in front of people [L].
- Hated: *Wishing coin*, or anything that asks what he wants [L].

**Alyssa** · 🎂 **M10 W3 Mon**
- Loved: *Pocket memory notebook* [L]. *Letter paper set* [L].
- Liked: *Sketchbook and charcoal* (Drawing Club). Quiet-morning things. A note that reintroduces the giver [L].
- Disliked: An invitation to a crowded party [L].
- Hated: A keepsake "from last time" she is meant to remember [L].

**Linus** · 🎂 **M6 W4 Mon** (two days before the Academy Competition)
- Loved: *Old competition programmes* [L]. *Crossed Blades: Famous Duels* [L].
- Liked: Notebooks. A story about Vallie's eyepatch [L]. Tickets to a match.
- Disliked: A gift that claims someone is strongest without proof.
- Hated: *The Noble Houses, by Precedence* [L: ranking by birth].

**Maple** · 🎂 **M10 W4 Tue** (the week of the Harvest Festival)
- Loved: *Bag of red apples* [L]. *Sweet bamboo tea (tin)* [L]. *Everlamp, miniature* [L: Halvard's enchantments].
- Liked: *Seed packets*. Something for Sobek. A letter from home [L].
- Disliked: *Premium beast jerky* and other animal treats (the animals flee her) [L].
- Hated: *Beast muzzle*, or anything calling Sobek a monster [L].

**Nerys** · 🎂 **M4 W1 Thu** (the day after Secret Fools Day)
- Loved: Whatever this week's hobby needs [L]. *Pigeon feed* [L]. Free food [L].
- Liked: *Carving knife and limewood block*. Foraged things. Merryhew's goods.
- Disliked: Last week's hobby supplies [L].
- Hated: *Etiquette manual* [L: act like a Silvarenne].

**Hadrian** · 🎂 **M8 W1 Wed**
- Loved: *Brass golem joint set* [L]. *Vigour tonic* [L]. *Warding amulet* [L].
- Liked: *Lined winter cloak* [L]. Anything expensive.
- Disliked: A dare or a duel challenge [L: risk].
- Hated: *Duelling gauntlets* (an invitation to get hurt) [L].

**Wren** · 🎂 **M5 W3 Thu**
- Loved: *Sweet bun* [L]. *Letter paper set* [L]. *Hand-Speech for Beginners* (someone learning for her) [L].
- Liked: *Fishing tackle box*. *Tuning fork* (she feels it hum).
- Disliked: *Music box* (a sound she cannot share).
- Hated: *Picture book for small children* [L: deaf is not stupid].

**Tsubaki** · 🎂 **M2 W4 Sun** (clear winter sky)
- Loved: *Whetstone and blade oil* [L]. *Pocket campus map* (she is always lost). *Star atlas* [L].
- Liked: Plain food in large amounts [L]. *Duelling gauntlets*.
- Disliked: Decorative gifts she does not understand. Romantic gifts (she takes them literally).
- Hated: —

### Staff and others

**Gavlan** · 🎂 **M3 W1 Tue**
- Loved: *Clan firewine* [L]. *Blank leather journal* [L: writing].
- Liked: History books. Tea.
- Disliked: Weapons as presents. Anything romanticising war [L].
- Hated: *Independence War commemorative medal* [L: medals].

**Yvette** · 🎂 **M3 W4 Tue**
- Loved: *Fallen Stars: Notes on Mana Resonance* [L]. A fine enchanted piece to study [L].
- Liked: Ordinary coffee [L]. *Precision tool roll*.
- Disliked: *The Vigil* [L]. Romantic gifts from students.
- Hated: *Halvard pennant* or any Halvard keepsake [L: it is a prison].

**Krieg** · 🎂 **M4 W2 Thu** (two days after Crowning Day) · *no XP; reaction and Tension only*
- Loved: *Royal crest paperweight* [L].
- Liked: *Fine vintage*. Good manners.
- Disliked: Sentimental gifts.
- Hated: *Orchard cider* [L]. Anything enchanted [L: mages].

**Milena** · 🎂 **M7 W2 Fri**
- Loved: *Salaffian flatbread* [L]. *Armour polish kit* [L]. *Travel Dragonchess set* [L].
- Liked: Things students made themselves [L]. Warm drinks.
- Disliked: —
- Hated: Anything tied to forbidden magic [L] (she confiscates it, then asks gently where it came from).

**Baelin** · 🎂 **M4 W4 Sun** (a rest-day morning)
- Loved: *Silvertip tea* [L]. *Anecdotes of the Old Kingdom* [L]. A debt repaid [L].
- Liked: *Oak sapling in a pot* [L].
- Disliked: Extravagant gifts (waste) [L].
- Hated: —

**Layla** · 🎂 **M9 W3 Wed** (three days before Founder Day)
- Loved: *Founding of the Dovecote* (old edition) [L]. Old Archive documents [L].
- Liked: Tea [L]. A good argument, written out [L]. *Kid-leather gloves*.
- Disliked: *What Everyone Knows About the Founding* [L].
- Hated: *The Night Student: A True Account* [L].

**Vallie** · 🎂 **M3 W3 Sat**
- Loved: *Blackroot cigars* [L]. *Stonebrew ale (jug)* [L].
- Liked: *Clan firewine*. A good story, written down [L]. Meat.
- Disliked: *Leather planner* [L: paperwork].
- Hated: Anything stolen [L: thieves].

**Rei** · 🎂 **M7 W4 Mon** (the week after the Thinning)
- Loved: *Blackroot cigars* [L]. *Whetstone and blade oil* [L: her sword].
- Liked: Quiet, simple things.
- Disliked: Ceremonial gifts, anything that expects a speech [L].
- Hated: Anything about the breach night [L].

**Kuroo** · 🎂 **M1 W4 Tue**
- Loved: *Gilt-edged playing cards* [L]. *Ballroom shoes* [L: dancing].
- Liked: Anything that needles Krieg [L]. *Loud silk waistcoat* (buttons he can find).
- Disliked: Last-minute, half-hearted gifts [L].
- Hated: —

**Mimosa** · 🎂 **M2 W1 Mon**
- Loved: *Hooded night lamp* [L: small dark spaces]. A written note of praise [L].
- Liked: *Rare reagent*. Anything about Royhan's work [L].
- Disliked: A gift in front of a crowd [L].
- Hated: *Brass handbell* [L: a door handle tried from outside].

**Tristan** · 🎂 **M10 W1 Fri**
- Loved: *Fine vintage* [L]. *Commentaries of Saint Orel* (antique) [L].
- Liked: Philosophy. Tea.
- Disliked: A rushed gift [L].
- Hated: *The Final Word on Everything* [L: certainty].

**Althair** · 🎂 **M8 W4 Mon**
- Loved: *Loud silk waistcoat* [L]. *Sovereigns* [L: a good game].
- Liked: *Leather planner* (really) [L]. Anything from someone who dislikes him [L].
- Disliked: —
- Hated: *Formal dress coat* [L].

**Ezrel** · 🎂 **none** ("not mine to tell"; he has been here since the founding)
- Loved: *Brass golem joint set* [L].
- Liked: Nothing, pleasantly. Anything he does not dislike is neutral.
- Disliked: Anything that wastes time [L].
- Hated: —

**Ottavio** · 🎂 **M8 W1 Sun** (dawn on the dock)
- Loved: *Fishing tackle box* [L]. *Salaffian spice box* [L].
- Liked: *Engraved hip flask*. Something for his dorm [L].
- Disliked: *Thank-you card* [L: being thanked].
- Hated: —

**Caine** · 🎂 **M2 W3 Mon**
- Loved: Nothing he will admit. *Silver-polishing kit* (a real smirk, once).
- Liked: Silence [L]. Order: *Walnut desk tidy*, a good clock.
- Disliked: Anything noble or crested [L]. Enchanted trinkets [L].
- Hated: —

**Bobby** · 🎂 **M9 W1 Thu**
- Loved: *Vanishing-coin illusion kit* [L]. Campus gossip, written down [L].
- Liked: *Precision tool roll*. Something broken to fix [L]. *Gilt-edged playing cards*.
- Disliked: Cruel prank goods [L].
- Hated: A spoiled surprise [L].

---

## 4. Toko dan barang baru

**Toko baru di The Mall** (English card text; harga panduan, canon false):

- **Quillfeather's**: a narrow bookseller with a ladder on rails; new books at the front, second-hand at the back.
- **Pennywhistle Curios**: gifts, games and trinkets; the window changes with every festival.
- **Barrow & Vine**: wine, ale, spirits and tobacco. Asks for the bracelet, and reminds students they may drink only on the rest day and in the holidays.
- **Greenwick's**: flowers, pot plants, seeds and fruit, run with the Gardening Club.
- **The Tinker's Bench**: tools, craft and hobby supplies, fishing tackle and beast-care goods.
- **The Salaffian Oven**: a food stall with flatbread straight from the oven and southern spices.
- **Tailor's Row**: clothes, shoes and cologne (moves the existing "Tailoring alteration" here).

| Shop | Item | Pts | Note |
|---|---|---|---|
| Quillfeather's | The Rose in the Tower | 18 | romance novel, twelve volumes and counting |
| Quillfeather's | Seven Towers (deluxe edition) | 30 | seven princesses, seven rescues, gilt edges |
| Quillfeather's | Nine Rivers: Field Tactics | 40 | the standard tactics treatise |
| Quillfeather's | Crossed Blades: Famous Duels | 30 | |
| Quillfeather's | Songs of the Oathbound | 20 | heroic ballads |
| Quillfeather's | Songbook of old ballads | 16 | with guitar chords |
| Quillfeather's | Lamps Out: Tales of Halvard | 18 | campus ghost stories |
| Quillfeather's | The Night Student: A True Account | 6 | cheap pamphlet, sells every autumn |
| Quillfeather's | The Truth Behind Halvard's Ghosts | 15 | debunks every story |
| Quillfeather's | Halvard Through the Centuries | 60 | leather-bound |
| Quillfeather's | Anecdotes of the Old Kingdom | 35 | |
| Quillfeather's | Founding of the Dovecote (old edition) | 45 | second-hand shelf |
| Quillfeather's | What Everyone Knows About the Founding | 12 | popular history |
| Quillfeather's | Commentaries of Saint Orel (antique) | 70 | doctrine |
| Quillfeather's | The Final Word on Everything | 12 | a book with every answer |
| Quillfeather's | Fallen Stars: Notes on Mana Resonance | 120 | rare magic theory |
| Quillfeather's | The Noble Houses, by Precedence | 50 | peerage register |
| Quillfeather's | Etiquette manual | 20 | |
| Quillfeather's | Dragonchess problem book | 25 | |
| Quillfeather's | Star atlas | 30 | |
| Quillfeather's | Hand-Speech for Beginners | 15 | the kingdom's sign language |
| Quillfeather's | Picture book for small children | 8 | |
| Quillfeather's | Old competition programmes | 10 | bundle, second-hand |
| Quillfeather's | Blank leather journal | 25 | |
| Quillfeather's | Pocket memory notebook | 20 | ribbon marker, pocket-sized |
| Quillfeather's | Leather planner | 20 | |
| Pennywhistle Curios | Plush animal | 20 | |
| Pennywhistle Curios | Goosedown pillow | 35 | |
| Pennywhistle Curios | Silver hand mirror | 45 | |
| Pennywhistle Curios | Palm crystal ball | 60 | |
| Pennywhistle Curios | Porcelain tea set | 55 | |
| Pennywhistle Curios | Music box | 30 | |
| Pennywhistle Curios | Prism charm | 12 | throws rainbows |
| Pennywhistle Curios | Black silk ribbons | 10 | |
| Pennywhistle Curios | Travel Dragonchess set | 60 | |
| Pennywhistle Curios | Sovereigns | 80 | imported strategy game |
| Pennywhistle Curios | Gilt-edged playing cards | 12 | |
| Pennywhistle Curios | Vanishing-coin illusion kit | 25 | no magic involved |
| Pennywhistle Curios | Juggling set | 15 | |
| Pennywhistle Curios | Rainglass | 35 | a sealed globe of storm rain that never settles |
| Pennywhistle Curios | Everlamp, miniature | 40 | lights itself at dusk |
| Pennywhistle Curios | Hearthstone hand-warmer | 25 | stays warm all day |
| Pennywhistle Curios | Hooded night lamp | 20 | a lamp you can sit inside the light of |
| Pennywhistle Curios | Warding amulet | 25 | |
| Pennywhistle Curios | Wishing coin | 5 | |
| Pennywhistle Curios | Thank-you card | 3 | |
| Pennywhistle Curios | Get-well hamper | 30 | |
| Pennywhistle Curios | Engraved trophy cup | 50 | |
| Pennywhistle Curios | Knight's pennon | 20 | |
| Pennywhistle Curios | Halvard pennant | 10 | |
| Pennywhistle Curios | Royal crest paperweight | 35 | |
| Pennywhistle Curios | Independence War commemorative medal | 30 | sold for Crowning Day |
| Pennywhistle Curios | Carved Asmoday charm | 15 | |
| Pennywhistle Curios | Festival lantern set | 18 | |
| Pennywhistle Curios | Brass handbell | 8 | |
| Pennywhistle Curios | Wind-up alarm clock | 15 | |
| Pennywhistle Curios | Silver-polishing kit | 20 | |
| Pennywhistle Curios | Walnut desk tidy | 30 | |
| Pennywhistle Curios | Loaded bone dice | 12 | "novelty dice" |
| Pennywhistle Curios | Marked deck | 12 | "novelty cards" |
| Barrow & Vine | Table wine | 25 | |
| Barrow & Vine | Fine vintage | 90 | |
| Barrow & Vine | Orchard cider | 10 | |
| Barrow & Vine | Stonebrew ale (jug) | 18 | |
| Barrow & Vine | Clan firewine | 70 | from the eastern Beastkin clans; small stock |
| Barrow & Vine | Blackroot cigars | 15 | tin of five, cheap and strong |
| Barrow & Vine | Engraved hip flask | 40 | |
| Greenwick's | Bouquet of stage roses | 20 | |
| Greenwick's | Cut flowers | 12 | |
| Greenwick's | Moonfern in a pot | 45 | glows faintly at night |
| Greenwick's | Oak sapling in a pot | 20 | |
| Greenwick's | Seed packets | 5 | |
| Greenwick's | Bag of red apples | 6 | |
| Greenwick's | Carrots and fresh greens | 5 | |
| Greenwick's | Pigeon feed | 4 | |
| Greenwick's | Pruning shears | 25 | |
| The Tinker's Bench | Precision tool roll | 50 | |
| The Tinker's Bench | Mystery clockwork (sold as seen) | 15 | nobody knows what it did |
| The Tinker's Bench | Brass golem joint set | 90 | |
| The Tinker's Bench | Glass stirring-rod set | 15 | |
| The Tinker's Bench | Whetstone and blade oil | 20 | |
| The Tinker's Bench | Armour polish kit | 18 | |
| The Tinker's Bench | Duelling gauntlets | 40 | |
| The Tinker's Bench | Fishing tackle box | 30 | |
| The Tinker's Bench | Gut guitar strings | 12 | |
| The Tinker's Bench | Tuning fork | 10 | |
| The Tinker's Bench | Steel-nib fountain pen | 40 | |
| The Tinker's Bench | Letter paper set | 8 | |
| The Tinker's Bench | Sketchbook and charcoal | 15 | |
| The Tinker's Bench | Carving knife and limewood block | 20 | |
| The Tinker's Bench | Bolt of Sky silk | 40 | |
| The Tinker's Bench | Embroidery thread set | 15 | |
| The Tinker's Bench | Talisman paper stack | 10 | |
| The Tinker's Bench | Chamois lens cloth | 5 | |
| The Tinker's Bench | Pocket thermos | 25 | |
| The Tinker's Bench | Shuttered dark-lantern | 25 | |
| The Tinker's Bench | Running shoes | 45 | |
| The Tinker's Bench | Premium beast jerky | 20 | |
| The Tinker's Bench | Beast muzzle | 15 | Beast Handling supply |
| The Tinker's Bench | Vigour tonic | 30 | |
| The Salaffian Oven | Salaffian flatbread | 6 | |
| The Salaffian Oven | Salaffian spice box | 25 | |
| Tailor's Row | Loud silk waistcoat | 70 | |
| Tailor's Row | Formal dress coat | 150 | |
| Tailor's Row | Platform boots | 55 | |
| Tailor's Row | Ballroom shoes | 60 | |
| Tailor's Row | Bergamot cologne | 35 | |
| Tailor's Row | Kid-leather gloves | 30 | |

**Tambahan di toko lama:**

| Shop | Item | Pts | Note |
|---|---|---|---|
| Commissary | Honey bun | 6 | already in Irene's lore |
| Commissary | Pocket campus map | 5 | |
| Commissary | Smoked river fish | 6 | |
| Commissary | Lavender laundry soap | 5 | |
| The Mall — bakery | Sweet bun | 6 | |
| The Mall — cafés and tea houses | Sweet bamboo tea (tin) | 14 | |
| The Mall — cafés and tea houses | Silvertip tea | 30 | |

Toko-toko baru ini perlu pin peta dan entri lokasi baru (`locations.json`, `map_pins.json`). Semuanya berada di dalam gedung
The Mall, jadi tidak perlu pin terpisah kecuali owner mau.

---

## 5. Ulang tahun sebagai event (owner, 2026-09-27)

Dasar yang sudah ada: `Player.Profile.Birthday` (Builder), entri lore 508 `[{{user}}'s Birthday]`, dan perk Rank 3
"remembers the birthday". Entri 508 sekarang bilang "a good day, not a surprise-party script"; baris itu diganti oleh §5.1
(**menyentuh desain 1.2.0 entri 508**, bukan keputusan HANDOFF §4).

### 5.1 Ulang tahun {{user}}

Usulan batas rank (mengikuti perk yang sudah ada):

| Bond dengan {{user}} | Yang dilakukan NPC |
|---|---|
| Rank 3+ | Tahu tanggalnya, mengucapkan selamat, memberi hadiah kecil sesuai karakternya |
| Rank 5+ | Hadiah yang dipilih untuk {{user}}, **diundang ke pesta kejutan** |
| Rank 7+ | Bisa jadi **penyelenggara** pesta |

- **Syarat pesta**: minimal satu NPC Rank 7+ yang bisa hadir (bukan graduate, tidak pergi, Tension di bawah 40).
  Tanpa itu tidak ada pesta, hanya ucapan dan hadiah.
- **Penyelenggara** (deterministik): rank tertinggi, lalu Trust tertinggi, lalu urutan nama. Pestanya mengikuti karakternya
  (Etnie berlebihan, Castor makan malam tenang, Sophia menjadikannya duel persahabatan, Althair mengundang semua orang yang
  membencinya).
- **Tamu**: murid dengan bond Rank 5+ dan Tension di bawah 40. Staff mengucapkan dan memberi hadiah, tapi tidak datang ke pesta
  murid (kecuali in character mampir sebentar, misalnya Vallie). Graduate mengirim surat lewat Mail Tower.
- **Kejutan**: sejak pagi `<now>` memberi narrator (narrator only) nama penyelenggara dan tamu, dengan pesan: jaga rahasianya,
  boleh ada petunjuk kecil dan alasan palsu untuk membawa {{user}} ke tempatnya. Pesta **18:00 sampai curfew**.
- **Tempat**: pintu dorm hanya terbuka untuk penghuninya, jadi tempatnya harus bisa dimasuki semua tamu: Common Room kalau
  semua tamu satu dorm dengan {{user}}; kalau tidak, evening booth di The Snug (dipesan penyelenggara berhari-hari sebelumnya)
  atau ruang klub penyelenggara.
- **Efek**: setiap tamu yang datang = satu hangout dengan {{user}} (+3 XP, di luar batas harian). Tidak ada efek lain; hadiah
  untuk {{user}} masuk Bag seperti sekarang.

### 5.2 Ulang tahun NPC

Usulan manfaat di hari ulang tahun NPC (moderat, supaya tidak jadi hari grinding):

| Hal | Efek | Catatan |
|---|---|---|
| Gift | ×2 XP, tidak dihitung ke batas mingguan | sudah disetujui |
| Talk / hangout | ×1.5 XP | suasana hatinya baik |
| **Trust** | +2 sekali kalau {{user}} ingat (mengucapkan atau memberi hadiah) | mengingat = tindakan, jadi cocok dengan aturan "Trust hanya dari tindakan" |
| **Tension** | apology dan pemulihan ×2 hari itu | **kenaikan Tension tidak dikurangi**: prinsip "musuh lebih mudah dibuat daripada teman". Sebaliknya disliked/hated sudah ×2 |

- `<now>` selalu memberi tahu narrator ulang tahun NPC yang hadir (teman-temannya merayakan, in character), walaupun {{user}}
  belum tahu tanggalnya.

### 5.3 Kapan ulang tahun NPC muncul di kalender

Usulan: **sama dengan ulang tahun {{user}}, Rank 3.** Simetris: di Rank 3 mereka ingat ulang tahunmu, dan kamu tahu ulang tahun
mereka.
- Field `Birthday` masuk ke share level 3 (bersama Loves/Hates), bukan level 1 seperti di §1. Keterbukaan tetap berlaku:
  NPC open dari Rank 1, guarded dari Rank 4, closed dari Rank 5.
- Kalender Notebook memberi tanda 🎂 begitu field-nya terbuka. Cerita juga bisa membukanya lebih awal (seseorang memberi tahu
  {{user}}), lewat Fact seperti biasa.

---

## [?] Keputusan terbuka

Semua di bawah ini **disetujui owner 2026-09-27 sesuai usulan draft** (1: tanpa penalti; 2: ya; 3: selalu di Cast Sheet;
4: sama dengan alkohol; 5: Minggu + Mid-Year Break + Month 12, tanpa malam festival; 6: bagian The Mall, tanpa pin sendiri).

1. `[?]` **Hadiah yang sama berulang.** Stardew tidak menghukum. Usulan: tidak ada penalti, karena batas 2 per minggu sudah cukup.
2. `[?]` **Hated universal = barang sihir terlarang.** Setuju? Untuk Doves (Krieg, Milena, Dante) barangnya disita, lalu
   {{user}} ditanyai.
3. `[?]` **Baris "Gifts:" di Cast Sheet** (sekitar 25 token per NPC hadir). Atau hanya muncul kalau {{user}} membawa hadiah?
4. `[?]` **Tembakau untuk murid**: aturannya sama dengan alkohol (hanya di hari libur)?
5. `[?]` **"Hari libur"** = rest day (Minggu) + Mid-Year Break + Month 12. Termasuk malam festival (Star Night, Harvest
   Festival)?
6. `[?]` **Pin peta**: toko baru cukup jadi bagian The Mall, atau masing-masing punya pin sendiri?

Diputuskan owner (2026-09-27): batas rank ulang tahun {{user}} **3 / 5 / 7** (§5.1) pas; **lupa ulang tahun NPC tanpa penalti**
("it can be tedious with that many npc"); manfaat ulang tahun NPC di §5.2 pas (kenaikan Tension tidak dikurangi).

### Sebaran ulang tahun (43 NPC, Ezrel tidak punya)

Minggu yang dihindari: M1 W1 (kedatangan), M5 W4 (Mid-Year Break, murid pulang), M7 W3 (the Thinning), M11 W3 Mon–Wed
(Academy Trip), M11 W4 (World Competition, Graduation), M12 (libur). Tidak ada ulang tahun yang jatuh tepat di hari event.

| Bulan | Jumlah | NPC |
|---|---|---|
| M1 | 3 | Castor W2 Thu, Kanae W3 Thu, Kuroo W4 Tue |
| M2 | 4 | Mimosa W1 Mon, Etnie W2 Sat, Caine W3 Mon, Tsubaki W4 Sun |
| M3 | 5 | Gavlan W1 Tue, Vera W2 Wed, Ruby W3 Mon, Vallie W3 Sat, Yvette W4 Tue |
| M4 | 4 | Nerys W1 Thu, Krieg W2 Thu, Sophia W3 Tue, Baelin W4 Sun |
| M5 | 3 | Royhan W1 Sat, Gareth W2 Wed, Wren W3 Thu |
| M6 | 4 | Lenna W1 Sun, Percival W2 Mon, Saffi W3 Thu, Linus W4 Mon |
| M7 | 3 | Idris W1 Tue, Milena W2 Fri, Rei W4 Mon |
| M8 | 5 | Hadrian W1 Wed, Ottavio W1 Sun, Trixie W2 Tue, Caralynn W3 Mon, Althair W4 Mon |
| M9 | 4 | Bobby W1 Thu, Aiden W2 Mon, Layla W3 Wed, Florian W4 Tue |
| M10 | 5 | Tristan W1 Fri, Tilly W2 Thu, Alyssa W3 Mon, Caspian W3 Sat, Maple W4 Tue |
| M11 | 3 | Zara W1 Thu, Dante W2 Tue, Irene W3 Thu |
