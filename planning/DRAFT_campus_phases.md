# DRAFT — Fase kampus (roadmap R3, rilis 2.1.1)

Dicatat: 2026-10-24, atas permintaan owner ("lanjutkan draft untuk 2.1.1"). Sumber: `planning/FUTURE_PLANS.md` §0.1 R3, catatan
`data/campus_phases.json` (1.6.1, N6: "lines are new canon … applied only after the owner approves each one").

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
- **Biaya:** ±35–50 token per balasan selama fase aktif (139 dari 308 hari sekolah); 0 di hari lain.

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

## 3. Perubahan kode (tanpa canon)

- **`data/campus_phases.json`:** diisi dari §2.
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
  - token: baris terpanjang di bawah ±50.
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
