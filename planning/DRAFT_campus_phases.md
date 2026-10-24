# DRAFT — Fase kampus (roadmap R3, rilis 2.1.1)

Dicatat: 2026-10-24, atas permintaan owner ("lanjutkan draft untuk 2.1.1"). Sumber: `planning/FUTURE_PLANS.md` §0.1 R3, catatan
`data/campus_phases.json` (1.6.1, N6: "lines are new canon … applied only after the owner approves each one").

Tambahan owner (2026-10-24): "di sela-sela, sesuatu yang lebih normal/mundane dari kampus di dunia nyata, misal makanan viral
seminggu" → tren mingguan (§2b).

**Status:** menunggu "proceed" owner. Teks Inggris di §2 adalah usulan kata-kata kartu; yang owner setujui jadi canon.

## 0. Masalahnya, singkat

- Sejak 1.6.1 engine (`stepCampusEvents`) sudah mencetak satu baris "Campus phase: …" di `<now>` saat sebuah fase aktif, tapi
  `data/campus_phases.json` masih kosong, jadi baris itu tidak pernah muncul.
- Narator sekarang tahu event hari ini (baris event 1.81.0) dan rencana bulan ini plus bulan depan (lore 134), tapi tidak tahu
  **suasana di antara event**: minggu belajar sebelum ujian, persiapan festival, menunggu hasil, sesudah Thinning.
- Fase mengisi celah itu: satu kalimat latar tentang apa yang menyibukkan kampus minggu ini. Ini juga jadi konteks untuk B3 (politik
  kampus, 2.5.N) nanti.

## 1. Aturan fase (dari yang sudah ada)

- **Satu fase aktif sekaligus.** Engine memakai `PHASES.find`, jadi fase tidak boleh tumpang-tindih. Validator baru menjaganya (§3).
- **Setiap tahun sama.** Tidak ada syarat tahun, jadi baris tidak boleh menyebut nama NPC (nominee pemilu, anggota tim berganti tiap
  tahun) atau "dua tahun lalu" (breach night).
- **Tidak mengulang data lain:**
  - baris event hari itu (1.81.0) dan rencana bulan di lore 134;
  - mood minggu ujian (`npc_moods.json` `exams`);
  - lockdown Thinning;
  - baris fase per tempat yang sudah ada di `merge_lorebooks.py` `PHASES`: Main Library dan Founder's Park di minggu ujian, Study
    Rooms penuh di minggu 3–4 bulan 2/4/8/10, Mail Tower sebelum libur panjang.

  Fase hanya menulis yang tidak dikatakan semua itu, yaitu hari-hari **sebelum** dan **sesudah** event.
- **Latar, bukan perintah.** Baris ditulis sebagai keadaan ("students are…"), tanpa "the narrator must"; narator memakainya bila cocok.
- **Tidak di hari libur pulang, lockdown, perjalanan** (Mid-Year Break, Month 12, Thinning, Expedition, Crowning Day, Academy Trip,
  World Competition). Daftar di §2 tidak mengenai hari-hari itu; dicek dengan skrip terhadap `data/calendar.json`.
- **Biaya:** ±35–50 token per balasan selama fase aktif (139 dari 308 hari sekolah); di hari lain mungkin tren mingguan (§2b).

## 2. Daftar fase (teks kartu, English)

Format `data/campus_phases.json`: `{ "id", "from", "to", "line" }`, inklusif, setiap tahun.

| id | from | to | line |
|---|---|---|---|
| first_weeks | M1 W1 Sat | M1 W2 Sun | The first weeks: first-years still lose their way between buildings, the first homework is landing, and the clubs are settling in the members they signed up. |
| star_night_coming | M1 W3 Mon | M1 W3 Fri | Star Night is on Saturday: students borrow tents and bedrolls, argue over the best spot on the hills, and decide what to wish for at the midnight shower. |
| warding_rite_coming | M2 W1 Mon | M2 W1 Thu | The Warding Rite is on Friday: Mystic students who ward or seal rehearse with the staff, and first-years wonder what casting together with hundreds will feel like. |
| expedition_coming | M2 W2 Mon | M2 W3 Tue | The Creature Studies Expedition goes out on Wednesday of Week 3: kits, boots and field notes are being packed, and the talk is of what lives in Grade III country. |
| midterms_coming_1 | M2 W4 Mon | M2 W4 Sun | Midterms start next Monday: study groups claim every table, notes are copied and swapped, and the clubs and evenings out quietly empty. |
| club_festival_coming | M3 W2 Mon | M3 W2 Thu | The Club Festival opens on Friday: every club is building its stand and planning demonstrations and samples, and canvassing for gold coins it cannot vote for itself. |
| dorm_comp_coming | M3 W4 Mon | M3 W4 Fri | The Dorm Competition is this weekend: the qualifiers are the talk of every dorm, and their dorm-mates cheer them on, scout their rivals and give advice nobody asked for. |
| crowning_day_coming | M4 W1 Thu | M4 W2 Mon | Crowning Day is on Tuesday: students form their groups of four for the capital, plan what to see and buy in Avalon, and remind each other to change points into coin the day before. |
| finals_coming_1 | M4 W4 Mon | M4 W4 Sun | The End of Semester exams start next Monday: the library and study rooms stay full late, tempers are short, and the semester's last free evenings go to revision. |
| results_wait_1 | M5 W2 Mon | M5 W2 Thu | The exams are over and the results and the Dorm Ranking come out on Friday: everyone replays their answers, and the dorms argue about where they will place. |
| break_coming | M5 W3 Mon | M5 W3 Sun | The Mid-Year Break starts next week: most students are writing home and packing trunks; the few staying at Halvard over the break say little about it. |
| sports_day_coming | M6 W2 Mon | M6 W3 Fri | Sports Day is on Saturday of Week 3, with magic banned outright: sign-ups are open, the sport clubs train their favourites, and the strongest mages are teased about running on their own legs. |
| academy_comp_coming | M6 W4 Mon | M6 W4 Tue | The Academy Competition starts on Wednesday: the cross-dorm teams of four drill together, and everyone has a guess which team will go on to represent Halvard. |
| thinning_coming | M7 W1 Mon | M7 W2 Sun | The Thinning comes in Week 3: the staff walk the wards and stock the dorms for a week indoors, the Acting Warden is rarely seen, and those who were here on the breach night go quiet when it comes up. |
| after_thinning | M7 W4 Mon | M7 W4 Sun | The Thinning is over and the doors are open again: students trade what they heard through the windows during the lockdown, and most of it grows in the telling. |
| circus_coming | M8 W1 Mon | M8 W2 Wed | The Traveling Circus arrives on Thursday of Week 2 and the Academy Showcase follows: posters are up, acts rehearse in every free room, and family visits are being planned, and dreaded. |
| midterms_coming_2 | M8 W4 Mon | M8 W4 Sat | Midterms start next Monday: the study groups are back, and anyone who earned a Science Fair score is quietly glad to skip the written Magic Theory paper. |
| bazaar_coming | M9 W2 Mon | M9 W2 Wed | The Academy Bazaar opens on Thursday: students count their savings, trade rumours of what the foreign traders will bring, and swear they will not spend it all. |
| founder_day_coming | M9 W3 Mon | M9 W3 Fri | Founder Day is on Saturday: talk turns to the treasure hunt nobody has finished in years, last year's clues are argued over, and groups quietly form. |
| kingdom_comp_away | M9 W4 Wed | M9 W4 Sat | Halvard's team is at the Kingdom Competition in the capital this week; at Halvard classes go on, and any news from the Royal Arena goes round fast. |
| election_coming | M10 W2 Mon | M10 W2 Sat | The Student Council election is next week: both nominees already sit on the Council, and students are making up their minds before the campaign starts. |
| harvest_coming | M10 W4 Mon | M10 W4 Thu | The Harvest Festival starts on Friday, the last loud thing before the exams: costumes are being sewn, stalls and haunted corridors planned, and nobody mentions the exams the week after. |

**Dasar canon tiap baris** (supaya bisa dicek):
- Star Night: tenda dan bedroll di Grassy Field and Hills, meteor shower tengah malam, harapan (lore 22).
- Warding Rite: Mystic dengan Warding/Sealing jadi jangkar, semua murid ikut, pertama kali bagi first-year (lore 96).
- Expedition: off-grounds, Grade III country (kalender).
- Club Festival: tiap klub punya stand; satu koin emas per orang; tidak boleh memilih klub sendiri (lore 233).
- Dorm Competition: 16 qualifier per asrama per role (kalender); Training Week sudah mengintai lawan (engine).
- Crowning Day: grup empat orang, tukar poin ke koin sehari sebelumnya, Avalon (lore 24).
- Results dan Dorm Ranking: M5 W2 Fri (kalender).
- Murid yang tinggal saat libur (1.83.0; lore lima orang, tanpa rumah untuk pulang): "say little about it" tanpa nama.
- Sports Day: sihir dilarang total, klub olahraga menyumbang favorit, event terbuka untuk siapa saja (lore 239).
- Academy Competition: tim lintas asrama berempat; pemenang mewakili Halvard (kalender, 1.87.0).
- Thinning: segel terlemah, lockdown seminggu; breach night (World Index, umum); Acting Warden (lore 11, 118).
- Showcase: keluarga diundang, "those with nobody coming are careful how they say so" (lore 242); Circus M8 W2 Thu (lore).
- Science Fair: nilai stand boleh menggantikan ujian tulis Magic Theory midterm Month 9 (lore 240).
- Bazaar: pedagang luar negeri, "a year's savings can vanish in an afternoon" (lore 243).
- Founder Day: perburuan harta yang tidak selesai bertahun-tahun, petunjuk ditulis ulang tiap tahun (lore 25).
- Kingdom Competition: hanya tim yang berangkat; di Halvard kelas berjalan (kalender `kingdom_fly_out`).
- Pemilu: kedua nominee sudah anggota Council sejak awal tahun; kampanye mulai W3 Mon (lore 336).
- Harvest Festival: "the last loud thing before exams", kostum, rumah hantu di koridor lama (lore 245).

## 2b. Tren mingguan (yang biasa, dari kehidupan kampus nyata)

Lapisan kedua, untuk **hari-hari tanpa fase kalender** (169 dari 308 hari sekolah): makanan yang tiba-tiba viral, permainan yang
sedang demam, mode kecil, kebiasaan yang menular lalu hilang lagi.

- **Cara pilih:** satu tren per minggu kampanye (Senin–Minggu), peluang 60% per minggu (`trend_rate`). Pilihannya seeded dari seed chat
  dan nomor minggu, jadi swipe memberi hasil sama, tapi tiap chat dan tiap tahun berbeda: pemain tidak bisa menebak minggu depan.
- **Variasi:** tren yang sama tidak kembali dalam 8 minggu (`trend_gap`, dirantai dari awal tahun seperti happenings, murni dari seed).
- **Syarat:** musim (`season`, mis. iced coffee hanya Summer); tidak di hari berfase kalender, di luar kampus, saat libur pulang atau
  lockdown.
- **Di `<now>`:** label sendiri, `Campus fad this week: <line> (background; people take to it or scoff, each in character)`. Akhiran itu
  menjaga prinsip "NPC bereaksi sesuai karakter": tidak ada yang dipaksa ikut tren.
- **Biaya:** ±40–50 token per balasan di hari bertren (sekitar 100 hari setahun dengan 60%).
- **Hanya teks.** Barang tidak habis terjual dan harga tidak berubah. Kalau nanti mau berdampak (mis. habis sebelum siang), itu
  pekerjaan B3/M3.

Setiap barang yang disebut ada di `data/shop.json` dengan nama yang sama (Salaffian flatbread, Honey cream coffee, Iced coffee,
Blossom honey cake, Spiced apple turnover, Roasted chestnuts, Hot chocolate with cream, Iced fruit cooler, Sunfizz dan pengembalian
botol 2 poin, Cooking Club honey bread dan bake Sabtu, Gilt-edged playing cards, Vanishing-coin illusion kit, Plush animal, Black silk
ribbons, Colour-change hair sweet, game halls). Dragonchess adalah papan catur hidup (World Index); slot siaran sore Announcement Room
ada di lore 107. Tidak ada nama NPC dan tidak ada bau (aturan preset 1.68.0).

| id | musim | line |
|---|---|---|
| salaffian_craze | semua | Everyone wants Salaffian flatbread: the queue at The Salaffian Oven runs out of the door at lunch, and anyone who has not tried one yet is told they must. |
| honey_cream_coffee | semua | Nightwell's honey cream coffee is the drink of the moment: cups appear in every classroom, and the line before first period has become a place to be seen. |
| iced_coffee | Summer | In the heat everyone carries a Nightwell iced coffee, and being seen without one has somehow become a statement. |
| blossom_cake | Spring | The bakery's Blossom honey cake sells out before noon every day, and students trade tips on when the next tray comes out. |
| apple_turnovers | Autumn | The bakery's spiced apple turnovers are the autumn obsession: people time their walk past the Mall to catch them hot. |
| roasted_chestnuts | Autumn, Winter | Roasted chestnuts are the thing: a paper cone in every cold hand, and a running argument over which café roasts them best. |
| hot_chocolate | Autumn, Winter | Nightwell's hot chocolate with cream is everywhere; study groups have started meeting there just for it. |
| fruit_coolers | Summer | Iced fruit coolers are the summer fix; the cafés have started naming flavours after the dorms, and every dorm insists its own is best. |
| sunfizz_bottles | semua | The Sunfizz bottle hunt is on: students collect empties for the two-point return, and a few corridors have quietly become someone's territory. |
| lucky_honey_bread | semua | A rumour says the Cooking Club's honey bread brings luck before a test: the Saturday bake sells out, and the club pretends not to be pleased. |
| dragonchess_fever | semua | Dragonchess fever: the living boards are never free, unofficial ladders are chalked up in the common rooms, and losing streaks are taken personally. |
| card_game | semua | A new card game played with gilt-edged cards has swept the dorms; everyone claims to know the real rules, and nobody agrees what they are. |
| juggling | semua | Juggling has caught on: balls and beanbags fly in the courtyards between classes, with the occasional apology when one lands where it should not. |
| coin_trick | semua | Everyone is learning a vanishing-coin trick done by hand alone, and anyone caught using magic to cheat at it is not forgiven. |
| broadcast_song | semua | A song from the afternoon broadcast is stuck in everyone's head: someone hums it in every corridor, and the Announcement Room is begged to stop playing it, or to play it again. |
| satchel_plush | semua | Small plush animals from Pennywhistle Curios have started hanging from satchels, and whose plush is whose has become a small map of who is close to whom. |
| black_ribbons | semua | Black silk ribbons are the fashion, tied on wrists and satchels, and the Etiquette teachers have opinions about what counts as uniform. |
| hair_sweet_dare | semua | Merryhew's colour-change hair sweets are the dare of the week: every class has someone with alarming hair, and the game is to keep a straight face. |
| kind_notes | semua | Anonymous kind notes keep appearing on the Notice Board, one for someone new each morning; everyone wants to know who writes them, and who is next. |
| morning_runs | Spring, Summer | Early-morning running has become a thing: before breakfast the paths round the lake fill with students who will have given up by next week. |
| hourglass_study | semua | A study method is going round: an hourglass on the table, work until the sand runs out, then a short break; hourglasses have gone missing from every lab. |
| game_halls | semua | The Mall's game halls have a new favourite game, free hours vanish there, and waiting in the queue to play is half the fun. |

## 3. Perubahan kode (tanpa canon)

- **`data/campus_phases.json`:** `phases` diisi dari §2; baru `trends` (§2b, `{ id, season, line }`), `trend_rate` 60, `trend_gap` 8.
- **Engine:** `trendOn(seed, week)` di samping `happeningOn`, dirantai per tahun dan di-cache, tanpa state baru dan tanpa migrasi.
  `$ui.phase` = fase kalender, kalau tidak ada maka tren minggu itu (`kind: 'trend'`); 505 memberi label yang berbeda.
- **Engine `stepCampusEvents`:** tidak ada fase saat {{user}} jauh dari kampus (`awayIn`: Avalon, Sunreach, Hanakaze, Expedition,
  tim Kingdom) atau di hari libur pulang. Sekarang baris fase tercetak di mana saja, jadi "at Halvard classes go on" bisa sampai ke
  narator saat {{user}} sendiri di Avalon bersama tim.
- **`tools/gen_engine.py`:** validator baru. Gagal build bila:
  - `from`/`to` bukan format `M<n> W<n> <Day>`;
  - dua fase tumpang-tindih;
  - sebuah fase mengenai hari `home`, `lockdown` atau `away` di kalender;
  - baris menyebut nama NPC roster;
  - baris lebih dari 45 kata.
- **UI (lihat [?] 1):** baris fase yang sama ditampilkan di Inventory → Notice Board sebagai "On campus: …" (UI saja, 0 token).

## 4. Tes dan cek live

- Tes baru `tests/test_campus_phases_v2111.cjs`:
  - tiap fase tercetak di `<now>` dari `from` sampai `to`, dan tidak sehari sebelum atau sesudahnya;
  - satu fase per hari;
  - tidak ada fase di Avalon (Crowning Day), di Sunreach dan di Month 12;
  - validator menolak contoh yang tumpang-tindih;
  - token: baris terpanjang di bawah ±50;
  - tren: hanya di hari tanpa fase, sama di setiap swipe, tidak terulang dalam 8 minggu, musimnya benar, sekitar 60% minggu bertren
    di 20 seed.
- Cek live di `docs/TEST_CHECKLIST.md`, di quest tempat kampanye owner pertama kali melihatnya: Act 2 Q2.7 (M1 W1 Sat, "first
  weeks") dan Act 3 Q3.5 (Star Night minggu itu). Aturan Black Box ikut bila repositorinya terpasang.

## 5. Keputusan yang tersentuh

- Tidak ada keputusan di `docs/DECISIONS.md` yang berubah. "Lore by season" (baris fase per tempat di `PHASES`) tetap; fase kampus
  hanya baris kampus, dan §1 menjaga agar keduanya tidak bercerita dua kali.
- Isi §2 adalah canon baru (kata-kata karangan dari lore yang ada). Kalau disetujui, DECISIONS mendapat satu baris: "Campus phases:
  one background line in `<now>` between events, every year, no names, none away from campus."

## 6. Pertanyaan terbuka

- [?] 1. **Tampil ke pemain?** Fase sekarang hanya untuk narator. Usulan saya: tampilkan juga di Notice Board ("On campus: …"), supaya
  pemain melihat suasana yang sama dengan yang dibaca narator. Diam = ya.
- [?] 2. **Dua baris yang paling banyak karangan**, cek apakah cocok dengan bayanganmu:
  - `kingdom_comp_away`: bagaimana kabar dari Royal Arena sampai ke Halvard tidak ditentukan di lore. Baris ini hanya bilang kabarnya
    cepat menyebar.
  - `after_thinning`: murid saling cerita apa yang mereka dengar dari jendela saat lockdown. Ini mengikuti lore geraman di bawah
    plinth (lore 266), tanpa memastikan apa pun.
- [?] 3. **Daftar tren (§2b):** buang yang tidak cocok, atau tambahkan ide sendiri. Kalau diam, saya pakai 22 tren itu dengan peluang 60%
  per minggu. Angka peluangnya masuk §5 FUTURE_PLANS supaya bisa disetel setelah playtest.
