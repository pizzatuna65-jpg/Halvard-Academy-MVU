# DRAFT — Entry negara (Nations)

Status: **draft, belum diterapkan.** Arahan owner 2026-09-27. Aturan owner: yang tidak dikomentari owner = disetujui. Ukuran sama dengan entry World Myth (70–90 kata).
Catatan dalam bahasa Indonesia; teks card dalam bahasa Inggris.

## Aturan

- Setting entry disalin dari **Sunreach Bay** (uid 246, entry negara yang sudah ada): keyword, order 80, position 1.
  Comment: `Nation — <nama>`. Sunreach Bay sendiri tidak diubah.
- Format: `[Nama]`, `What`, lalu 2–3 baris khas negara itu, `Status`. Rahasia di `<narrator_only>`.
- uid kosong: 278 (Arslan), 279 (Norvaine), 333 (Velmora), 334 (Caelmar), 335 (Yozakura).

## 1. Nation — Arslan Sultanate (owner: kerajaan uang, "Wall Street" sebagai satu kerajaan, lokasi World Bank)
Keys: `Arslan Sultanate`, `Arslan`, `World Bank`, `the Sultan` (keyword `Arslan` / `Arslan Sultanate` pindah dari mitos
The Devoured Kingdom ke sini; mitos itu tetap memakai `Primal Desert`, `Azathoth`, `Lord of All`, `Devoured Kingdom`).
```
[Arslan Sultanate]
What: a sultanate in the Primal Desert, where the Devoured Kingdom once stood, and the money capital of the world. The desert grows nothing, so the whole country trades: bankers, brokers and moneylenders.
Known for: the World Bank, in its capital, which sets what every nation's coin is worth and lends to every crown, Eldrasil's included.
People: rich, exact, and very polite to anyone who owes them.
Status: the sand still turns up stones of the devoured kingdom. Nobody digs deeper than they have to.
```
Kaitan: mitos 1 (lokasinya Primal Desert). Canon: "the Bank" termasuk kekuatan luar di tanah akademi (WORLD INDEX, Banking
House, uid 92) → usulan mention: Banking House adalah cabang World Bank (lihat bagian Mention).

## 2. Nation — Norvaine, kerajaan utara (owner: makmur, militer terkuat, pact turun-temurun dengan Yog-Sothoth)
Keys: `Norvaine`, `Yog-Sothoth`, `Lord of the Cosmos`, `Chosen of the Cosmos`
```
[Norvaine]
What: the richest kingdom of the north, with the strongest army on the continent. For generations its kings have held a pact with Yog-Sothoth, Lord of the Cosmos, a Spirit Lord; each heir inherits it with the crown.
Export: starglass, a glass that holds the night sky; the finest telescope lenses and scrying crystals in the world.
Star Night: at midnight, over the royal castle, every star becomes an eye and every comet a tentacle.
Price: at that midnight Yog-Sothoth takes one person, the Chosen of the Cosmos, erased from the world's memory with every proof they existed and their soul. The kingdom remembers the rule, never the person.
People: they fear Yog-Sothoth, revere it, and bow to the sky every Star Night.
Status: nobody knows what the kings gained, or why the Chosen are taken.
```
Keputusan owner (2026-09-27): yang diingat hanya aturannya, bukan orangnya; gelarnya **Chosen of the Cosmos** (bukan "Saint",
jadi tidak bersinggungan dengan "the Blood Saint" Sophia); pact turun-temurun; rakyat takut tapi menghormati dan tunduk.
Catatan kanon: pact dengan Spirit Lord sah; mitos 1 ("a lawful pact can still cost everything") jadi cermin kerajaan ini. Star Night
di canon punya hujan meteor tengah malam; di atas kastil kerajaan ini meteor itu menjadi tentakel. Di Halvard tidak terjadi apa-apa.

## 3. Nation — Velmora (kerajaan Tilly; isi buatan Claude, owner cek)
Keys: `Velmora`, `Velmoran`
```
[Velmora]
What: an old kingdom on Eldrasil's northern border: green valleys and walled orchards between Eldrasil and the north. Its court is the most formal on the continent.
Known for: diplomats, dancing masters and etiquette tutors, hired by noble houses everywhere; anyone who wants to sound well-bred copies Velmoran court manners.
Ties: a long, quiet friendship with Eldrasil's crown.
Status: Velmorans abroad are gracious, careful, and never discuss their king.
<narrator_only>Behind the manners, the succession is a blood sport: the king lets his children fight for the crown, and betrayal, coups, assassination and blackmail are all fair. Whoever is left standing is heir.</narrator_only>
```
Yang dijaga dari canon Tilly:
- Tilly lahir di istana Velmora, pandai bahasa, dansa, berkuda, etiket, dan tanpa sadar memakai "court phrasing". Velmora dibuat
  kerajaan istana yang paling formal supaya latar belakangnya cocok.
- Cover Tilly: anak penggilingan dari "provinsi utara jauh Eldrasil". Velmora diletakkan di perbatasan utara Eldrasil, jadi logat
  atau kebiasaannya yang bocor masih bisa dijelaskan dengan cover itu.
- "By private arrangement with Eldrasil's crown" (canon) → "a long, quiet friendship with Eldrasil's crown".
- Owner (2026-09-27): citra publik anggun, suksesi sebenarnya berdarah (anak-anak raja diadu; pengkhianatan, kudeta, pembunuhan,
  pemerasan semua sah). Itu rahasia, jadi di `narrator_only`, tanpa menyebut Tilly.
- Efek samping yang perlu owner tahu: karena Velmora terkenal dengan tata krama istananya, NPC yang jeli bisa mencurigai asal Tilly
  dari "court phrasing"-nya. Itu jadi petunjuk yang bisa ditemukan, bukan bocoran; hapus baris "Known for" kalau tidak mau.

## 4. Edit lore Tilly Marsh (owner: ibunya, selir raja, yang mengirimnya ke Halvard)
File: `source_original/npc_lore_2026-09-25/lore_year2.md`. Semua baris ini sudah `<narrator_only>`.

Identity, sebelum:
> Velmora's court is in a quiet succession struggle, and her father sent her abroad under a false name, by private arrangement with Eldrasil's crown, to keep her out of reach until it is settled.

Sesudah:
> Behind Velmora's gracious court, the succession is a blood sport: the king lets his children fight for the crown, and betrayal, coups, assassination and blackmail are all fair. Her mother, the king's concubine, sent her abroad under a false name, by private arrangement with Eldrasil's crown, to keep her out of the contest.

Backstory (true), sebelum:
> She does not know which side of the succession struggle wants her gone, if either. Her letters to "her father the miller" go through a private route Baelin Kalvor arranged that never touches the Liaison, and they are written in cipher.

Sesudah:
> She does not know which of her half-siblings wants her dead; in Velmora, most of them would. Her letters to "her father the miller" go to her mother, through a private route Baelin Kalvor arranged that never touches the Liaison, and they are written in cipher.

Tidak berubah: "Princess Ottilie Seraphine", cincin segel, hanya Baelin yang tahu, "late letter from her 'father'" (nama samaran
ibunya), Baelin "until Velmora calls her home".

## 5. Nation — Caelmar (owner: satu mega city seluas negara, berlapis, seperti hive city Warhammer)
Keys: `Caelmar`, `Caelmari`, `city of layers`
```
[Caelmar]
What: a nation that is a single city in the west, as wide as a kingdom, built hundreds of floors into the sky and dozens deep into the earth, split into hundreds of districts and dozens of layers.
Rule: the king lives on the highest layer, above the clouds; the lower you live, the less you matter.
Below: the deepest layers are slums that never see the sun, where the city's refuse, workshops and outlaws collect.
Export: the continent's workshop. Mana lanterns, rune heaters, pens, locks, anything made by the thousand comes up from the lower layers.
Status: most Caelmari die on the layer they were born on.
```

## 6. Nation — Yozakura (owner: bernuansa Jepang, di selatan, mayoritas Beastkin)
Keys: `Yozakura`, `Yozakuran`, `Alpha of Yozakura`
```
[Yozakura]
What: a kingdom in the south of the continent, mostly Beastkin, known for cherry blossoms and courtesy. Its companies run hotels, restaurants, bathhouses and airship lines all over the world.
Rule: the throne is won, not inherited. A grand tournament crowns the ruler, titled Alpha, who reigns until beaten in the next one.
Known for: a passion for competing in everything, from academy duels to cooking contests; its team is always a favourite at the World Competition. Its smiths forge the katana, the finest blade a mage can hold.
Status: a Yozakuran never refuses a fair challenge.
```
Kaitan canon: katana Tsubaki dan pedang Rei berasal dari sini (edit di bawah); Airships (awak disewa) = perusahaan Yozakura.

## Mention di entry lain (usulan)

| Entry (uid) | Negara | Kalimat |
|---|---|---|
| 00 WORLD INDEX (0) | semua | Baris "Sunreach Bay: ..." diperluas: `Nations: Sunreach Bay (resort, Trip destination), the Arslan Sultanate (money; the World Bank), Norvaine (the strongest army; Yog-Sothoth), Velmora (the most formal court), Caelmar (a hive city), Yozakura (Beastkin, service companies, rulers crowned by tournament).` |
| Kingdom — Eldrasil (1) | semua | Daftar negara: `Sunreach Bay, Velmora, the Arslan Sultanate, Norvaine, Caelmar and Yozakura are named.` |
| Banking House (92) | Arslan | `A branch of the World Bank of the Arslan Sultanate; its clerks answer to the Sultanate, not the academy.` (menjelaskan kenapa Bank termasuk kekuatan luar) |
| Event — Star Night (22) | Utara | `Far to the north, the same midnight is the one Norvaine dreads: the night Yog-Sothoth takes its Chosen.` |
| Competitions (19), World tier | semua | `Nations at the World Competition include Yozakura, Norvaine and Caelmar, the usual favourites, the Arslan Sultanate, Velmora and Sunreach Bay.` |
| Airships (231) | Yozakura | `Most airship lines on the continent are Yozakuran companies, and so are their crews.` |
| Tsubaki Hoshikage (lore cohort 2) | Yozakura | Equipment: "a curved single-edged blade from far across the sea" → "a katana forged in Yozakura, far to the south" |
| Rei Kestrane (lore staff) | Yozakura | Weapon: "A long single-edged sword." → "A long single-edged katana forged in Yozakura." |
| Observation Tower (81) | Norvaine | `Its great telescope has a Norvaine starglass lens, the Divination Society's pride.` |
| Kanae Quveno (lore_year2.md) | Norvaine | Baris baru: `Her crystal ball is Norvaine starglass, and nobody else is allowed to touch it.` |
| Magitech - Mana Grid (219) | Caelmar | `Most lanterns and wall torches are Caelmari-made, bought by the thousand.` |
| Commissary (83) | Caelmar | `Its cheap stationery and everyday kit are Caelmari-made.` |
| Classes - Etiquette (28) | Velmora | `Etiquette follows Velmoran court manners, the continent's standard.` |
| The Mall (66) | Yozakura | `Its busiest tea house is a Yozakuran chain.` |
| Sunreach Bay (246) | Yozakura | `Half its hotels are Yozakuran.` |
| Event - Graduation (248) | Arslan | "the Bank" → "the World Bank (Arslan Sultanate)" di daftar meja rekrutmen |
| Noble Houses' Liaison (91) | Velmora | `Its protocol follows Velmoran court manners.` |
| Workshop (55) | Caelmar | `Its lathes and tool racks are Caelmari-made.` |
| Classes - Combat (30) | Norvaine | `Its drills borrow from Norvaine's army, the strongest on the continent.` |
| World Myth - The Devoured Kingdom (273) | Arslan | keyword `Arslan`, `Arslan Sultanate` dihapus dari sini (pindah ke entry negara). |

## Keputusan (owner, 2026-09-27)

- Setiap negara punya mention di beberapa entry (owner): Arslan 4 (WORLD INDEX, Kingdom, Banking House, Graduation), Velmora 5
  (+ Etiquette, Liaison, Tilly), Norvaine 7 (+ Star Night, Observation Tower, Kanae, Combat), Caelmar 5 (+ Mana Grid, Commissary,
  Workshop), Yozakura 8 (+ Airships, Tsubaki, Rei, Mall, Sunreach Bay), Sunreach Bay (entry sendiri, Academy Trip). Semua negara
  juga di WORLD INDEX, Kingdom — Eldrasil dan World Competition (Competitions, tier World).

- Caelmar = hive city; Shiranui diganti Yozakura (selatan, Jepang, Beastkin, perusahaan jasa, raja Alpha dari turnamen);
  favorit World Competition lebih dari satu (owner: seperti Piala Dunia): Yozakura, Norvaine, Caelmar.
- Keunggulan ekspor tiap negara (owner): Arslan = World Bank, Velmora = etiket istana (dan Tilly), Yozakura = katana dan jasa,
  Norvaine = starglass, Caelmar = barang buatan massal (magitech sehari-hari).
- Nama kerajaan utara: Norvaine. Tidak dikaitkan ke King of Knights. Tabel mention disetujui. Velmora: isi Claude disetujui,
  ditambah suksesi berdarah (rahasia) dan ibu Tilly, selir raja.
