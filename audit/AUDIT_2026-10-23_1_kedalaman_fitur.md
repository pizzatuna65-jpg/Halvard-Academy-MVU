# Audit kedalaman fitur (v1.97.5): bahan rilis 1.98

Tanggal 2026-10-23. Permintaan owner: petakan semua fitur beserta kedalamannya, tandai yang dangkal atau terasa tempelan, usulkan
pendalamannya lewat sistem yang sudah ada, lalu usulkan fitur ringan baru yang belum ada di `planning/FUTURE_PLANS.md`. Ini tahap
1.98.0 di FUTURE_PLANS §0: owner memilih dari daftar §4.

## Ringkasan

Sebagian besar kartu sudah dalam: bond, studi, proficiency, kompetisi, area luar, memori. Yang tipis berkumpul di empat tempat:
sistem yang hanya mencatat lalu menyerahkan semua akibat ke narator, dan event kalender yang belum disentuh event frame.

| # | Fitur | Kedalaman | Masalah inti | Ukuran |
|---|---|---|---|---|
| T1 | Hidden magic, Dove attention | D1 | lima tahap hanya label; tidak ada yang berubah di dunia | S |
| T2 | Battle | D1 | papan skor tanpa step engine; lawan tanpa edge, Combat_role tanpa efek | S |
| T3 | Gossip | D1 | rumor menua tapi tidak pernah sampai ke orang tertentu | K |
| T4 | Mystery Board | D2 catat, D1 akibat | memecahkan thread tidak menghasilkan apa pun; tanpa aksi menyelidiki | K–S |
| T5 | Keanggotaan Student Council | D1 | rapat Sabtu tanpa tugas | K |
| T6 | Perawatan luka | D1 | Medical Centre tidak mengubah `Heals_by` | K |
| T7 | Dorm Days | D1 | empat event setahun yang hanya membuka peta | K (data) |
| T8 | Projects research/club/other | D1 | selesai tanpa akibat | K |
| T9 | Terms pakta | D1 | teks bebas yang tidak dibaca engine | K |

Fitur ringan baru (§3): tujuh alat UI tanpa biaya prompt, antara lain ringkasan "This week", jatah bond harian, dan waktu jalan di
chip Next.

## 0. Cara mengukur

- Sumber: ketujuh belas bagian `docs/FEATURES.md` (sekitar 150 baris fitur), lalu kode tiap fitur: ukuran step engine, data yang
  dibacanya, dan siapa yang memakai hasilnya (step lain, `<now>`, UI).
- Ukuran step dihitung dalam karakter, karena satu baris engine bisa ratusan karakter. Pembanding: `stepBonds` 43.665,
  `stepSchoolWeek` 29.079, `stepProficiency` 26.970, `stepTime` 19.697, `stepAmbience` 14.031, `stepMagic` 12.685. Di ujung bawah:
  `stepGossip` 1.747, `stepHooks` 2.688, bagian hidden magic di `stepHidden` sekitar 2.000 (sisanya cek dompet), dan Battle tanpa
  step sama sekali.
- Dicek silang dengan FUTURE_PLANS §1–§5, audit fitur 2026-10-03 (4.1–4.16), DECISIONS dan memori owner, supaya tidak ada usulan
  ganda atau usulan yang menabrak keputusan.

Skala:

- **D3 (dalam):** engine menghitung, punya data sendiri, hasilnya mengubah sistem lain, dan pemain melihat akibatnya.
- **D2 (cukup):** engine menghitung sebagian atau hanya mengatur waktu; isinya ditulis narator.
- **D1 (tipis):** engine hanya mencatat atau memberi label; semua akibat bergantung pada narator; tidak menyentuh sistem lain.
- **S (sengaja tipis):** tipis karena keputusan owner atau karena wilayahnya milik pemain. Tidak diusulkan untuk diubah.

## 1. Peta kedalaman

Bagian infrastruktur (FEATURES §1 paket dan MVU, §13 entri narator, §14 memori, §16 preset dan VectFox, §17 alat) tidak dinilai
dengan skala ini. Semuanya bekerja sebagai fondasi dan tidak ada yang dangkal; itu bukan wilayah 1.98.

### §2 Student Builder dan Student file

| Fitur | Nilai | Dasar |
|---|---|---|
| Builder 7 langkah, Identity, Power, Techniques | D3 | biaya teknik ditagih engine; angin per subtype; validasi dan restore |
| Pacts | D2 | partner = teknik Summon dengan upkeep; `Terms` tidak dibaca engine (T9) |
| Hidden magic | D3 di Builder, D1 dalam permainan | T1 |
| Edit student file, tab, gambar | D3 | |

### §3 Waktu, kalender, tahun ajaran

| Fitur | Nilai | Dasar |
|---|---|---|
| Clock, Calendar, Event frame, Agenda, Next chip | D3 | |
| Event chances | D2 | ada di 10 event; event lain yang tanpa chance biasanya punya sistem sendiri (ujian, kompetisi, trip, Thinning), kecuali Dorm Days, Circus, Harvest, Remembrance |
| Breaks, Secret Fools Day | D2 | yang tinggal dihitung; pulang dimainkan dalam satu balasan |
| Fair mark, treasure hunt Founder Day | D3 | |
| Family visits | S | satu baris `<now>`; keluarga {{user}} milik pemain |
| Classes and teachers, class presence, attendance | D3 | |
| Weekly recap, small scenes | S | sengaja kecil |
| Sabtu, pemilihan Council | D3 | suara berbobot dorm |
| Keanggotaan Student Council {{user}} | D1 | T5 |
| Entrance Event, tahun baru, transfer, kelulusan | D3/D2 | |
| Curfew | S | DECISIONS §2 Curfew (1.35.2); patroli sudah ada di FP §2 (E2) |
| Dorm Days | D1 | T7 |
| Campus events: campus phases | D1, kerangka kosong | `data/campus_phases.json` `phases: []` sejak 1.6.1 (catatan di akhir §2) |

### §4 Studi, nilai, uang sekolah

Semua D3 (persiapan, rumus nilai, akibat nilai, dorm rank dan payout), kecuali group assignment D2 (waktu belajar dan Tension
partner; isi kerjanya milik narator).

### §5 Tubuh, sihir, kesehatan

| Fitur | Nilai | Dasar |
|---|---|---|
| HP is injury | D2 | luka dicatat dan diingatkan; penyembuhan mekanis hanya lewat Consumable (T6) |
| Mana, teknik, angin | D3 / D2 | |
| First pact | D2 | |
| Rest, sleep, conditions, gear | D3 | |
| Fortune | D3 | |
| Hidden magic dan Dove attention | D1 | T1 |
| Battle tracking | D1 | T2 |

### §6 Cuaca, ambience, happenings

Weather dan ambience D3. Forecast, overheard lore, pair moments, trace beat dan happenings D2: semuanya dihitung engine, tetapi
happenings hanya membaca tempat, jam, hari dan cuaca, tidak membaca keadaan {{user}} (lihat T1 poin 2).

### §7 Uang, toko, barang

Ledger, purchases, shop, event stall (dengan tawar-menawar Bazaar), Price Guide dan Bag D3. Mall shops, letters home dan sumber
penghasilan D2.

### §8 Proficiency, practice, crafting, training

Semua D3; Train anything (1.97.5) D2 karena hanya berlaku untuk satu hadiah.

### §9 Bonds dan kehidupan NPC

Hampir semuanya D3: bond XP dan rank, Trust, Tension, rank perks, Rank 8 branches, the character's side, moods, special days, gifts,
initiative, routines, whereabouts, voice canon, Connections, People panel. D2: birthdays (lupa tanpa biaya adalah keputusan), time
apart, asking after, word gets around, ties, favours. Tidak ada temuan di sini.

### §10 Reputasi

D3: tiga standing, 51 deed, efek per level, `bond_mod`, harga gelar kompetisi.

### §11 Catatan kehidupan kampus

| Fitur | Nilai | Dasar |
|---|---|---|
| Planner, Notice Board | D2 | ditulis narator; engine memberi tanggal, status dan kedaluwarsa |
| Letters, Journal | D3 | |
| Mystery Board | D2 catat, D1 akibat | T4 |
| Clubs, club work, services, klien mingguan, club buatan sendiri | D3 | |
| Dorm, Academy, Kingdom, World Competition, Koschei's Needle | D3 | |
| Tally Sports Day dan Showcase, coin vote Club Festival | D2 | |
| Projects | D2 (craft, fair, assignment), D1 (research, club, other) | T8 |
| Trips | D2 | pembungkus; isinya di modul Area |
| Extras, nama dan sifat orang baru | D3 | |
| Story hooks, campus record | D2 | cukup untuk fungsinya |
| Gossip | D1 | T3 |
| Alkohol dan tembakau | S | |

### §12 Tempat, peta, area luar

Map, campus walks, dan area luar (Grand Vast Forest, Avalon, airship, Sunreach Bay, Hanakaze) D3. Discovery dan gates, peta per
kalender, tempat per musim, first visits, location activities dan year floors D2.

### §15 UI

D3: bracelet, "This reply", panel, scene card, titik "new", tema, Settings. Panel Battle ikut T2.

## 2. Temuan: fitur dangkal dan cara mendalaminya

Urutan menurut dampak bagi permainan. Semua usulan memakai fungsi yang sudah ada; yang baru hanya data atau beberapa baris kode.

### T1. Hidden magic: Dove attention hanya angka dan label

**Sekarang.** `stepHidden`: attention naik hanya dari laporan narator (502: +3 sampai +10 bila mungkin terlihat, +15 sampai +25
bila disaksikan), turun 1 tiap minggu sepi, dan kenaikannya dipotong separuh di luar ruangan saat kabut atau hujan lebat. `stageOf`
memberi lima tahap: Unnoticed, Rumoured, Watched, Investigated, Exposed. Tahap itu hanya dipakai di tiga tempat: toast dan log saat
berganti, satu baris `<now>` ("Dove attention: Watched (45/100)"), dan override Krieg (Trust jadi 0 pada tahap tertentu).

**Kenapa dangkal.** Hidden magic adalah satu dari tujuh langkah Builder dan jadi inti identitas karakter, tetapi tahap Watched
sampai Exposed tidak mengubah apa pun di dunia. Narator tidak diberi tahu arti tiap tahap. Happening `dove_sweep` muncul dengan bobot
yang sama di tahap apa pun. Engine sudah tahu teknik mana yang `Hidden` (stepMagic menagih biayanya, panel Battle memberi pil
"hidden"), tetapi informasi itu tidak dipakai.

**Usulan.**
1. Arti tahap di `<now>`: satu baris per tahap tentang apa yang dilakukan Dovecote sekarang, dari blok data kecil (pola `effects`
   per level di `data/reputation.json`). Tercetak hanya bila `_True_magic` ada, jadi sekitar 30 token dan hanya bagi pemain dengan
   hidden magic.
2. Happening mengikuti tahap: `dove_sweep` mendapat `stage_weight` di `data/happenings.json`, dan `happeningOn` mengalikan bobotnya
   mulai Watched.
3. Investigated: sekali saat tahap ini tercapai, engine memasang Commitment "Interview at the Dovecote" lewat Agenda (`anchorWhen`,
   dua sampai tiga hari ke depan). Hadir, berbohong atau mangkir dimainkan narator dan dilaporkan lewat deed yang sudah ada
   (`cooperated_with_dove`, `lied_to_doves` −10, `obstructed_search` −15).
4. Pengingat, bukan kenaikan otomatis: bila stepMagic menagih teknik `Hidden` saat ada orang di `Scene.Present` atau tempatnya ramai
   (crowd dari stepAmbience), `stepReminders` meminta narator sekali menilai apakah itu terlihat.

**Keputusan yang tersentuh:** tidak ada yang diubah. Aturan 1.18.0 (I1, narator yang melaporkan kenaikan, engine yang menurunkan)
tetap utuh karena poin 4 hanya pengingat. Poin 1 dan 3 menambah teks kartu baru: saya tulis teks Inggrisnya saat batch dikerjakan,
owner boleh menggantinya. Tahap hanya memberi konteks; NPC tetap bereaksi sesuai karakter.

### T2. Battle: papan skor tanpa mekanik

**Sekarang.** Schema `Battle`: `Active` dan `Combatants` {HP, Stamina (0–999, bawaan 100), Status}. Tidak ada step engine. Engine
memakai `Battle.Active` hanya sebagai penjaga (tidak bisa istirahat, routine week dan pulang saat break tertahan, small scenes tidak
dihitung, kelas yang terlewat dimaafkan) dan memberi Prowess +1 saat pertarungan selesai (`stepProficiency`). Panel Battle
(`p40:PANELS.battle`) menampilkan bar lawan dan harga teknik.

**Kenapa dangkal.** Di kompetisi, tiap peserta punya kekuatan per tahun kampanye (`sh:ctStr`, {{user}} lewat `sh:contestUser`) dan
selisihnya menjadi edge Fortune (`ctEdge` → `c.contest` → `stepFortune`). Di luar kompetisi, duel dengan Lucius sama dengan duel
melawan first-year mana pun: tanpa edge, HP lawan 100 untuk semua orang, dan Combat_role (lima role yang ditetapkan guru di kelas
pertama) tidak berpengaruh.

**Usulan.**
1. Edge lawan: selama `Battle.Active`, lawan yang murid roster dihitung dengan `ctStr` melawan `contestUser`, lalu `ctEdge` →
   `c.contest`, persis seperti satu bout. Lawan World Competition memakai kekuatan yang dipakai `wcS`. Staf dan Extras tanpa edge.
   Tanpa data baru.
2. Kartu aturan `battle` di `data/rule_cards.json`, tampil hanya saat `Battle.Active`: apa arti Combat_role {{user}} dalam
   pertarungan, dan bahwa tiap aksi penting memakai angka Fortune berikutnya.
3. Akibat: saat `Active` menjadi false, `stepReminders` mengingatkan sekali bila lawan roster berakhir di HP 30 atau kurang tanpa
   `NPC_status`, atau bila lawan yang punya bond tidak dilaporkan sebagai Interaction `fight`.
4. Panel menampilkan tiga angka Fortune balasan ini (`$ui.fortune.rolls`) dan edge lawan. UI saja; bisa dirilis terpisah.

**Tidak dobel dengan** FP §2 "Kompetisi lanjutan (4.11)", yang mengurus persiapan tim dan scouting kompetisi. **Keputusan yang
tersentuh:** DECISIONS §2 "HP is injury" (D13) tetap; Fortune tetap tiga angka per balasan.

### T3. Gossip: rumor menua tapi tidak sampai ke siapa pun

**Sekarang.** `stepGossip` (1.747 karakter): tiap rumor, berupa string di `Campus_State.Rumours`, mendapat nasib seeded (fizzle,
normal, fast). Jangkauannya dihitung dari umur saja (`REACH`: saksi, lalu dorm dan club sumbernya, sebagian besar kampus, berita
lama), lalu mati di hari ke-3 atau ke-21. Pemakainya: `<now>` (lima terakhir), beat ambience "overheard", dan Newspaper yang
memperpanjang umur rumor.

**Kenapa dangkal.** Aturan 504 berbunyi "only people a rumour has reached know it", tetapi jangkauan hanya berupa frasa, jadi narator
harus menebak siapa yang sudah mendengar. Rumor tentang {{user}} tidak pernah menjadi pengetahuan teman-temannya, padahal jalur
penyebarannya sudah ada: "Word gets around" (`$eng.word`, `WORD_DAYS`, Knows "Heard from …") dan "Asking after" (`askAfter`,
`$ui.asks`).

**Usulan.**
1. Rumor yang menyebut nama {{user}} dan sudah mencapai "most of campus": teman Rank 3+ bertanya sekali saat bertemu, lewat jalur
   `askAfter` (satu baris `<now>` hanya saat orang itu hadir).
2. Rumor yang menyebut NPC ber-bond: saat mencapai "most of campus", teman NPC itu (`TRU.friends`, sumber yang dipakai Word gets
   around) mendapat Knows "Heard: …" lewat antrean `$eng.word`, sekali, dalam batas Knows yang ada.
3. Tanpa field baru di schema: nama dibaca dari teks rumor dengan pencocok nama yang sudah ada (`mentionIn`).

**Keputusan yang tersentuh:** tidak ada.

### T4. Mystery Board: dicatat rapi, dipecahkan tanpa hasil

**Sekarang.** Clues (40 dibaca, arsip 120), thread Mysteries (open, solved, cold), trace beat dan pin "?" (1.51.0), rumor yang dipin
pemain, dan lead mingguan Encyclopaedic (hanya Knowledge Rank 5, `recordsLead`). Saat thread menjadi solved: satu baris Journal dan
toast (`stepRecords`), tidak lebih.

**Kenapa dangkal.** Kampanye ini punya misteri di bawah permukaannya, tetapi memecahkan thread tidak memberi apa pun. Di bawah
Knowledge 5 tidak ada cara mekanis untuk menyelidiki: pin "?" di peta menunjuk tempat yang tidak punya aksi.

**Usulan.** Prinsip audit 4.9 tetap: thread hanya ditandai solved oleh cerita, dan engine tidak pernah mengarang isi petunjuk.
1. Aksi Practice "Investigate" di `data/practice.json`, hanya di tempat yang disebut Clue dari thread terbuka (sumber yang sama dengan
   `p20:clueLocs`): XP Knowledge, atau Nature di luar ruangan. Bila angka Fortune pertama balasan itu clean, engine memasang lead
   dengan pola `recordsLead` dan narator mengisinya dari lore, paling sering sekali per thread per dua minggu. Encyclopaedic tetap
   lebih kuat karena lead-nya pasti setiap minggu.
2. Hadiah saat solved: XP Knowledge +2 (dalam cap mingguan) dan satu Recent moment untuk tiap orang di `Links` yang hadir. Deed
   reputasi tetap dilaporkan narator bila pemecahannya terjadi di depan umum.

**Terkait:** MS3 tahap 2 di FP §2 (Clue `_Unseen`) nanti bisa memakai panel yang sama; keduanya tidak saling menunggu.

### T5. Keanggotaan Student Council: rapat Sabtu tanpa tugas

**Sekarang.** `Player.Profile.Council` mengganti Study Hall Sabtu 10:00–12:00 dengan rapat di Chamber (`timetableFor`), Chamber
dihitung sebagai tempat belajar, nama {{user}} masuk `Members`, dan {{user}} bisa dicalonkan di Year 2. Pemilihannya sendiri dalam.

**Kenapa dangkal.** Sejak 1.90–1.92 club bekerja untuk kampus (Newspaper, stall, layanan, klien mingguan). Dewan Siswa, yang dalam
lore memimpin murid, tidak memberi {{user}} satu tugas pun.

**Usulan.** Pakai ulang pola klien mingguan `cwClient`: sekali seminggu ada peluang seorang murid membawa petisi ke rapat Sabtu
(anggaran club, izin acara, keluhan jam malam dorm, sengketa ruang), dengan ask yang diisi dari data murid itu seperti klien club
(`D/club_work.json` `client`, tidak mengulang 20 terakhir). Bila ditangani: Interaction help dengan murid itu dan deed mingguan yang
sudah ada, `student_notice_help` (Student +2, cap mingguan). Satu baris `<now>` hanya saat {{user}} ada di rapat.

**Keputusan yang tersentuh:** DECISIONS §2 "Student Council" (1.34.0) tidak berubah; usulan ini hanya mengisi rapatnya.

### T6. Luka: dicatat dan diingatkan, tetapi berobat tidak berpengaruh

**Sekarang.** Tiap luka punya nama, tingkat, dan `Heals_by` yang ditulis narator; engine menambatkan tanggalnya (`absWhen`) dan
mengingatkan saat waktunya tiba (`stepReminders`). Penyembuhan mekanis hanya lewat Consumable berlabel `heal` (Healing draught
buatan sendiri, beberapa barang toko) di `stepExposure`. Ward Medical Centre hanya mempercepat pemulihan stamina (×1,75,
`data/restore_places.json`).

**Kenapa dangkal.** Datang ke Medical Centre dengan tangan patah tidak mengubah `Heals_by`. Pemain tidak punya alasan mekanis untuk
berobat, padahal aturan "nothing heals off-screen" justru membuat perawatan di layar layak dihargai.

**Usulan.** Blok `treat` di baris Medical Centre `data/restore_places.json`: berada di sana 30 menit atau lebih saat terluka (waktu
lintas balasan, pola `$eng.chance.$here` milik event chances) memajukan `Heals_by` menurut tingkat, sekali per luka: minor sembuh hari
itu, moderate sisa waktunya dipotong separuh, severe maju dua hari. Engine menulis catatan Journal; narator memainkan perawatannya.

**Keputusan yang tersentuh:** DECISIONS §2 "HP is injury" (D13) tetap, karena penyembuhannya terjadi di layar.

### T7. Dorm Days: empat event setahun yang hanya membuka peta

**Sekarang.** `dorm_day_spiritual` (M1 W4), `dorm_day_mystic` (M4 W3), `dorm_day_elemental` (M8 W4), `dorm_day_occult` (M10 W2).
Rencana hari di `data/calendar.json` kaya: open house, ritus untuk warden pendiri, pertunjukan sihir di courtyard, booth first-year,
public lesson untuk orang luar, type contest terbuka untuk semua, dorm tournament, makan malam penutup dengan token untuk
first-year. Mekaniknya hanya dua: cuaca tenang (`fair`) dan peta menampilkan dorm tuan rumah (`p20:dormDayToday`).

**Kenapa dangkal.** Event dengan bobot serupa punya event chances (10 event), tally (Sports Day, Showcase) atau beat `ev`
(Thinning: 9 beat). Dorm Days tidak punya satu pun dari ketiganya.

**Usulan (hampir seluruhnya data).**
1. `data/event_frame.json` `chances` untuk tiap Dorm Day: public lesson (XP Arcana atau Knowledge, di dorm tuan rumah selama open
   house), type contest (Prowess, dengan angka Fortune), menjaga booth di dorm sendiri (Society), makan malam penutup bagi first-year
   dorm tuan rumah (Recent moment).
2. Beat `ev` di `data/ambience.json`, tiga atau empat per dorm, diambil dari rencana hari yang sudah kanon.
3. Dorm tournament lewat format `tally` (`eventTally`); hasilnya di `<now>` dan di Newspaper hari Senin (`cwNews`).

**Pola yang sama, prioritas lebih rendah:** Circus dan Harvest baru punya stall; Remembrance baru punya cerita hantu ganda.
**Perlu dicek saat dikerjakan:** validator chance di `gen_engine.py` (tempat, Field, aksi) harus menerima dorm tuan rumah yang
berganti per event.

### T8. Projects jenis research, club dan other: selesai tanpa akibat

**Sekarang.** Kind craft (masterwork pada Craft Rank 4), fair (nilai Fair) dan assignment (waktu belajar, Tension partner bila
telat) punya akibat. Research, club dan other hanya mendapat baris Journal "Finished" dan toast (`stepClubLife`).

**Usulan.**
1. Research selesai: XP proficiency menurut mata pelajaran yang disebut Goal (`SUBJECT_STAT`, Knowledge bila tidak ada), dan bila nama
   atau Goal-nya menyebut thread Mystery terbuka, satu lead dengan pola `recordsLead`.
2. Club selesai: XP Field club (`clubField`) seperti Saturday club time, dan satu baris untuk Newspaper Senin (`cwNews`).

### T9. Pakta: Terms tidak pernah dibaca

**Sekarang.** Partner pakta adalah teknik Summon dengan upkeep; Presence `terms` membuatnya selalu hadir. `Terms` adalah teks bebas
dari Builder yang tidak dipakai engine. Pakta terlarang (demon, monster, animal, person) tidak pernah menyentuh Dove attention.

**Usulan.**
1. Terms yang menyebut waktu ("every full moon", "each Sunday") menjadi item Agenda lewat `anchorWhen`, sehingga `<now>` mengingatkan
   pada harinya.
2. Memanggil partner pakta terlarang di depan orang memakai pengingat yang sama dengan T1 poin 4.

Paling masuk akal dikerjakan bersama T1.

### Catatan: kerangka tanpa isi

`data/campus_phases.json` kosong sejak 1.6.1. Kodenya sudah siap mencetak baris fase kampus ke `<now>`, tetapi isinya kanon baru
yang dulu direncanakan untuk "canon wave" dan tidak pernah dijadwalkan. Bila owner ingin, satu draft berisi beberapa fase sudah
cukup; bila tidak, biarkan kosong.

## 3. Fitur ringan baru (tidak ada di FUTURE_PLANS)

Ketujuhnya hanya UI, tanpa biaya prompt, dan sudah saya cek tidak ada di kode (`src/ui/parts/*.js`, `ui.template.js`, bracelet)
maupun di FUTURE_PLANS dan audit fitur 2026-10-03.

| # | Fitur | Melengkapi | Cara kerja (sistem yang dipakai) |
|---|---|---|---|
| F1 | **This week**: lipatan di bawah "This reply" yang menunjukkan selisih state dari pesan pertama minggu ini sampai sekarang (bond, proficiency, reputasi, uang, Bag) | "This reply" (1.79.0), weekly recap, cap mingguan anti-grind | `sh:replyDelta(A, B)` sudah menerima dua state apa pun; `stateAt` di bracelet mencari pesan pertama dengan `World.Week` yang sama |
| F2 | **Jatah bond** di dossier dan scene card: "Today: talk done, hangout open · This week: gifts 1/2, help 0/1 · Next rank from M3 W2" | `per_day` / `per_week` di `bond_rules.json` (talk 1, hangout 1 sehari; gift 2, help 1 seminggu), cooldown rank | UI membaca `$eng.daily`, `$eng.bweek` dan `$cool` yang sudah ada di state |
| F3 | **Waktu jalan di chip Next**: "Next 10:00 · Potion Crafting · 12 min walk", menyala bila waktu tersisa lebih pendek dari waktu jalan | Attendance (kelas bolos −2 Academy), campus walks, Next chip | graf Campus Map lewat `sh:areaMin`, yang juga dipakai `p20:walkFrom` |
| F4 | **Tanda bentrok di Planner**: Commitment yang jatuh di jam kelas, setelah curfew, atau saat event seharian diberi label "during Potion Crafting" | Planner, Attendance, Curfew, Agenda | jadwal yang sudah ada di UI (`TIMETABLE`, `schedHTML`) dan jam curfew per event |
| F5 | **Progres penjelajahan di Map**: "Found N of M places", daftar gerbang yang masih tertutup, dan tempat terdekat yang belum dikunjungi | Discovery dan gates, first visits, overheard lore | `p20:discovered`, `gateOpen`, `$ui.discovered`, `walkFrom` |
| F6 | **Kotak cari di Journal**: satu kata atau nama menyaring Journal, arsip 240 baris, Chronicle dan arsip Clue | memori kampanye panjang (§14); owner memainkan satu chat lintas versi | `p30:nbJournal`, `$ui.cluearch`; penyaringan di UI |
| F7 | **Clues di dossier**: daftar Clue yang `Links`-nya menyebut orang itu, dengan tombol ke Mystery Board | Mystery Board, People, T4 | `Clues[].Links` sudah dikanonkan ke id NPC oleh `stepRecords` |

## 4. Usulan batch (owner memilih)

Tiap batch satu rilis 1.98.N, mengikuti pola 1.97 dan 1.99.

| Batch | Isi | Bergantung pada | Kerja | Token prompt | Status |
|---|---|---|---|---|---|
| 1 | T7 Dorm Days (pola yang sama untuk Circus dan Harvest bila mau) | – | data, sedikit validator | hanya pada hari event | belum |
| 2 | T1 Hidden magic + T9 Pakta | – | engine, data, teks Inggris tahap | ±30, hanya dengan hidden magic | belum |
| 3 | T2 Battle | – | engine, kartu aturan, panel | kartu hanya saat Battle aktif | belum |
| 4 | T3 Gossip + T4 Mystery + T8 Projects | – | engine, data `practice.json` | satu baris saat orangnya hadir | belum |
| 5 | T5 Council + T6 Medical Centre | – | engine, data | satu baris saat rapat | belum |
| 6 | F1–F7 | – | UI saja | 0 | belum |

Urutan bebas; tidak ada batch yang menunggu batch lain. Untuk biaya paling kecil dan dampak paling terasa, saya mulai dari batch 1
dan batch 6.

## 5. Pertanyaan

1. [?] T2 poin 2: apakah Combat_role boleh punya efek mekanis dalam pertarungan bebas (misalnya role Healing boleh merawat satu luka
   ringan di tengah duel), atau cukup menjadi panduan bagi narator? Jawabannya menentukan apakah kartu `battle` hanya berisi teks atau
   juga mengubah angka. Tanpa jawaban, saya buat versi panduan saja.
