# Audit Beban Narator — Eldrasil / Halvard Academy (v1.52.1)

Tanggal: 2026-10-04 · Versi yang diaudit: `src/card/card.json` 1.52.1 (commit `533d61b`) · Laporan ini tidak mengubah kode.

Pertanyaan owner: bagaimana mengurangi beban AI narator dalam menjalankan engine, **tanpa mengubah maksud dan tujuan** fitur. Nomor
di sini (T = temuan, U = usulan) berdiri sendiri, tidak terkait nomor audit 2026-10-03.

## Ringkasan

- Setiap giliran narator membaca **±20–29 ribu token dari kartu** (aturan, state, `<now>`, Cast Sheet, lore konstan), belum termasuk
  preset (±18 ribu) dan riwayat chat. Aturan update (502) saja **±8.600–9.000 token**, selalu tampil penuh, dengan sekitar 180 kalimat
  perintah (±270 di semua entri aturan; hitungan kasar).
- Narator boleh menulis ke sekitar **60 field/daftar**: 11 daftar laporan yang dikosongkan engine tiap giliran, 14 jenis interaksi
  dasar (+5 bersyarat), 48 nama deed reputasi. Di playtest owner, blok `<UpdateVariable>` satu balasan bisa ±40 baris.
- Beban terbesar tidak datang dari banyaknya fitur, tetapi dari empat pola:
  1. **Aturan dibaca walau tidak berlaku.** ±30–40% isi 502 tidak relevan untuk adegan yang sedang dimainkan (Letters, Projects,
     Competition, Trip, ujian, pakta, tempat istirahat, aturan alkohol, dll.).
  2. **Fakta yang sama di 3–4 tempat.** Rank/Trust/Tension tokoh yang hadir tampil tiga kali; info satu tokoh terpecah di ±8 baris
     `<now>`, sheet-nya, dan 501.
  3. **Narator masih menghitung yang sudah dihitung engine.** Rollover kalender, tanggal absolut, aritmetika Points di `<Analysis>`.
     Di playtest owner, narator mengurangi stamina karena Chilled padahal engine juga melakukannya (terhitung dua kali).
  4. **Contoh dan catatan yang mengajarkan hal keliru.** Contoh 503 memakai format Rep_events lama dan menyisipkan record bond utuh.
     Journal (memori panjang narator) terisi baris mekanis seperti "Bond with X deepened to Rank 4".
- Ada satu bug gating: format "pakta pertama dalam permainan" hanya tampil bagi pemain yang **sudah** punya pakta (T6).

| # | Usulan | Hemat per giliran | Menyentuh DECISIONS? |
|---|--------|-------------------|----------------------|
| U1 | Aturan situasional: inti 502 tetap di atas, detail per situasi dipilih engine dan dicetak dekat `<now>` | −2.600 s.d. −3.400 token (29–38% dari 502), prototipe | Tidak |
| U2 | Satu tempat per fakta: blok per tokoh di sheet-nya, angka sekali, aturan ganda dihapus | −400 s.d. −700 (3 tokoh hadir) | §6, cara cetak `$ui.now` (kecil) |
| U3 | State ringkas di 501: teknik, transaksi, bond yang absen, Journal tanpa bookkeeping | −900 s.d. −2.500 (state menengah–berat) | §8, isi jendela Journal |
| U4 | Contoh dan `<Analysis>` di 503 diperbaiki dan dipendekkan | ±−80 token output, perilaku lebih benar | Tidak |
| U5 | Narator menulis bahasa alami, engine menormalkan (tanggal relatif, Day+Time, bond baru otomatis) | kecil, aritmetika hilang | Tidak |
| U6 | Satu daftar "dikerjakan engine" (mencegah hitung ganda) | ±−200, mencegah error | Tidak |
| U7 | Engine mengambil laporan yang pasti (pasangan deed, kehadiran remedial) | kecil | Tidak |
| U8 | Trust/Tension lewat kata keparahan, angka di data (opsional) | ±−400, tanpa angka | Ya, §6 Trust dan Tension |
| U9 | Mode "extra model" MVU: AI cerita tidak membaca aturan update dan tidak menulis blok update | ±−5 s.d. −9 ribu untuk AI cerita | Ya, §9 bila jadi default |
| U10 | Alat ukur kepatuhan narator dari chat ekspor | 0 token | Tidak |

Gabungan U1–U7: kira-kira **−5.000 s.d. −7.000 token per giliran** (±20–30% muatan kartu) tanpa satu fitur pun dimatikan, dan narator
tidak lagi diminta menghitung kalender, tanggal, atau saldo.

## 1. Cara audit

- Dibaca: `CLAUDE.md`, `HANDOFF.md`, `docs/INDEX.md`, seluruh `docs/DECISIONS.md` (usulan menyentuh banyak area), audit 2026-10-03
  bagian 1–2, semua entri yang dibaca narator (`500`–`510`, template `505`, `509`/`509_sheet`/`509_tail`, `506`), preset BOLT, dan
  blok update asli dari playtest owner (`tests/fixtures/playtest_v1301_blocks.json`, 2026-09-30).
- Di engine: `stepTime`, `stepMagic` (pakta), `stepExposure`, `stepReputation`, `stepBonds`, `stepBondMemory`, `stepRecords`,
  `stepExtras`, `stepCast`, `stepReminders`, `nowOf`/`stepNow`, `parseWhen`/`anchorWhen`, lapisan perbaikan patch (`recoverPatch`,
  `fixStrayPaths`), schema daftar laporan, `data/reputation.json`, `data/features.json`, `data/feature_cost.json`.
- Diukur pada `dist/` build saat ini dengan `tests/harness.cjs` `renderEntry` (entri dirender seperti di ST). Token ≈ karakter / 3,6,
  sama dengan `tests/token_audit.cjs`. Tiga adegan:
  - **A**: save 1.52.0 (M2 W2), di Canteen bersama Irene, Etnie, Kanae (Rank 2–4).
  - **B**: save yang sama, sendirian di asrama.
  - **C**: satu tahun disimulasikan (`tests/stress/sim_year.cjs`, 300 hari, M11), tiga sahabat Rank 10 hadir.
- Skrip ukur ada di scratchpad sesi, tidak ditambahkan ke repo. Angka hemat di §4 berasal dari prototipe teks (paragraf hasil render
  dihapus atau diganti satu baris inti), bukan dari kode yang sudah diubah.
- Mode "extra model" MVU dicek di dokumen panel MVU sendiri (`src/panel/update_method.en.md`, branch `beta`, dibaca 2026-10-04).
- Perilaku model sungguhan tidak bisa diukur di Node. Karena itu ada U10 dan uji live di §6.

## 2. Peta beban

### 2.1 Yang dibaca narator tiap giliran (token, hasil render)

| Entri | Isi | A (3 hadir) | B (sendiri) | C (akhir tahun, 3 hadir) |
|-------|-----|-------------|-------------|--------------------------|
| 502 | aturan update, posisi atas | 8.584 | 8.584 | 8.992 |
| 504 | aturan narasi, posisi atas | 2.666 | 2.666 | 2.728 |
| 503 | format output (depth 0) | 483 | 483 | 483 |
| 501 | `<current_state>` | 1.888 | 1.937 | 3.345 |
| 505 | `<now>` | 1.667 | 493 | 2.057 |
| 509, 600+, 599 | Cast Sheet (±2.000 per sheet penuh) | 6.363 | 0 | 5.681 |
| 510 | gerbang cast | 198 | 0 | 198 |
| 0, 97, 131, 132, 134 | lore konstan: indeks dunia, roster, peta kampus, jadwal, kalender | ±5.700 | ±5.700 | ±5.700 |
| **Total kartu** | | **±27.500** | **±19.900** | **±29.100** |

Belum termasuk preset (±17.900; BOLT CoT 2.523), riwayat chat (≤24 pesan), lore kata kunci, dan Price Guide 506 (±880, hanya saat belanja
dibahas). Dengan 4 tokoh hadir, Cast Sheet saja bisa ±8.000.

### 2.2 Yang ditulis narator

- 11 daftar laporan yang dikosongkan engine (Interactions, Practice, Purchases, Craft_sales, Rep_events, Training, Perk_use,
  Exam_events, Tutoring, Consumables, Exposure) ditambah `Magic/Casts`.
- Tulis langsung ke World, Scene.Present, Vitals, Injuries, Wallet, Profile, Magic.Active/Pacts, Hidden, Bonds (10 field),
  Campus_State (8 field), Extras, Commitments, Notices, Letters, Journal, Clues, Mysteries, Competition, Projects, Trip, Battle,
  Inventory, Hooks, dan tiga field area (`Expedition.Caught`, `Avalon.Ride`, `Sunreach.Ride`/`Bet`).
- Contoh nyata (playtest owner, pesan 24): `<Analysis>` 6 baris, termasuk "Stamina 50.08 − 5.0 = 45.08 (Chilled outdoor penalty)", lalu
  dua `insert /Bonds/<id>` lengkap dengan Rank, Trust, Tension yang semuanya ditimpa engine.

### 2.3 Yang diputuskan atau dihitung narator

| Keputusan | Sekarang diminta dari narator | Yang sudah dikerjakan engine |
|-----------|-------------------------------|------------------------------|
| Kalender | rollover Day → Week → Month → Year (`502.txt:9`) | `stepTime` me-rollover dari Day + Time (`engine.template.js:1270-1303`) |
| Tanggal | `Due`, `Until`, `Heals_by` dalam bentuk "M? W? Day HH:MM" | `parseWhen` (`:327`) menerima "tomorrow 09:00", "Fri 16:00", "tonight", "in two days", "next week"; `anchorWhen` (`:384`) menguncinya sekali |
| Uang | "Points: current X + delta Y = Z" di Analysis (`503.txt:7`) | sejak 1.45.0 belanja, payout, tutoring, penjualan, taruhan dibayar engine |
| Stamina | "physical exertion −5 s.d. −30" (`502.txt:35`) | engine juga mengurangi untuk jalan kaki dan cuaca: 10%/jam di luar saat Chilled, Overheated atau gale (`:1806`) |
| Trust/Tension | memilih angka dari ±10 kasus (`502.txt:114-117`) | engine mengalikan sesuai watak tokoh (`:3075-3146`) |
| Deed | memilih 1 dari 48 nama, kadang dua entri sekaligus | — |

### 2.4 Pembagian kerja per fitur

| Domain | Narator menulis | Engine mengerjakan |
|--------|-----------------|--------------------|
| Waktu dan tempat | Time, Day, Location, Ride/Bet/Caught di area | rollover, periode, curfew, event, lokasi kanonik, graf jalan, menit terutang, roll area per jam, naik/turun airship |
| Kehadiran | Scene.Present + Note, kartu Extras saat diminta | pilihan sheet, nama dari prosa, warna dialog, alias, tim rival, gerbang cohort |
| Tubuh | HP + cedera, stamina, Resting, Exposure | batas 40 HP, regen mana, biaya teknik, istirahat, utang tidur, kondisi cuaca |
| Sihir | Casts, Active, Pacts, Dove_attention, Known_by | biaya, upkeep, akhir otomatis, sinkron Summon, validasi pakta pertama, peluruhan Dove |
| Ikatan | Interactions, Known_facts, Mind, Knows, Imprints, Next, Title, Romance, turunnya Trust, naiknya Tension | XP, rank, gerbang, naiknya Trust, skala Tension, maaf, hadiah, ulang tahun, reward, mood, Recent, Defining, Meanwhile |
| Reputasi | Rep_events (nama deed) | XP, batas mingguan, level, deed kompetisi, vouch, absensi |
| Akademik | Exam_events, Tutoring, menghapus remedial | absensi, nilai, pengumuman, remedial, free period, jam belajar |
| Latihan, kerajinan | Practice (Action/Track), Craft_sales | XP, batas, hasil resep, bahan, masterwork |
| Ekonomi | Purchases, Points lain + Transactions, Coin, Inventory, Consumables | ledger, harga, payout, efek barang, Sunfizz |
| Agenda | Commitments, Notices, Letters, Hooks, Projects | tanggal, status, pengingat, feed, surat rumah, favour, tugas kelompok |
| Dunia | Campus_State, Journal, Clues, Mysteries | tanggal, event basi, ambience, happening, initiative, rutinitas, momen pasangan, jejak, gosip |
| Kompetisi, Trip, Battle, Council | field masing-masing | bayaran, reputasi, bond tim, status away, kandidat pemilu |

Pola yang sudah baik dan layak ditiru: **crafting** (engine menghitung hasil resep, narator memainkan hasilnya), **ujian** (engine memberi
nilai yang diharapkan), **area luar** (engine me-roll kejadian per jam), **belanja** (`/Purchases` dibayar engine), **Extras** (engine
meminta kartu hanya di kemunculan kedua). Di sana narator cukup memainkan keputusan engine. Sisa beban ada di bagian yang masih meminta
narator membaca semua aturan sekaligus, atau menghitung sendiri.

## 3. Temuan

**T1. 502 selalu dirender penuh, termasuk bagian yang tidak berlaku.**
- Paragraf terbesar di adegan C (lampiran): Interactions 462, Pacts 376, Judging 321, Tension 289, Trust 278, Projects 274, Time 253,
  Competition 252, Inventory 249, Letters 202, Exams 187, Restful places 186, Mood/sleep/wind 168, Combat_role 138, alkohol 150.
- Banyak yang hanya berlaku di situasi tertentu: Restful places sudah diringkas `<now>` ("Restful place: resting here now restores…"),
  Exams di luar minggu ujian, Combat_role dan Dorm setelah terisi, Letters tanpa surat, Projects tanpa proyek, Competition di luar musim.
- Gating sekarang hanya per fitur (`on('id')`) dan beberapa keadaan (area, bulan, rank tertinggi). Gate yang bergantung lokasi
  (`_U.craft`, `_U.craft_sale`) ada di entri posisi atas, jadi teks bagian atas prompt berubah setiap kali {{user}} masuk atau keluar
  tempat crafting. Ini kurang ramah prefix-cache bila provider memakainya.

**T2. Fakta yang sama di beberapa tempat.**
- Rank/Trust/Tension tokoh hadir: 501 `Bonds.<id>`, INVARIANTS di sheet ("Bond with {{user}}: Rank 3, Trust 49 (neutral), Tension 0
  (calm)"), dan `<now>` ("Bond: Irene (Rank 3, guarded, Trust 49 neutral)").
- Info satu tokoh di `<now>` terpecah menjadi mood, Bond, Trust, Tension, Recent, Teasing, Rank-4 accompany, gift pending: 19 baris =
  1.287 dari 2.057 token `<now>` di adegan C. Narator harus menyatukannya dengan sheet tokoh yang sama di entri lain.
- Kalimat yang diulang: "Mood colours their manner; keep them in character." per tokoh (`engine.template.js:4979`); "asked about it,
  deflects in character (pushing too soon adds Tension)" per tokoh; larangan menyebut rank/XP/perk di 502, 504 (`:35`), dan `<now>`
  (rank cue, Rank 4); rapat Council Sabtu di 502 (`:65`, `:135`) dan 504 (`:15`); "Rank, Trust and Tension change how a character
  treats {{user}}, never who they are" di 504 (`:4`) dan 509 (`509.template.ejs:20`); instruksi `/Purchases`, `/Consumables`,
  `/Craft_sales` di 502 dan 506 (`506.template.ejs:18`); nama tempat area di 502, indeks lore area, dan "Walks from here".
- Rumours tampil di 501 (`Campus_State.Rumours`) dan di `<now>` ("Rumours going around", dengan jangkauannya).
- "Journal dates" di `<now>` tidak di-dedupe: "M2 W2 Sun = earlier today; M2 W2 Sun = earlier today" (`505.template.ejs:45`).

**T3. Angka engine masuk ke teks narator.**
- `$Recent` dan `$Defining` dicetak dengan `fx` ("Rank 2 → 3, XP +6, Trust +3") di `<now>` (`engine.template.js:5055`) dan di sheet
  (`509_sheet.template.ejs:45`). Aturan 504 melarang menyebut angka, tapi narator tetap membacanya.
- Journal berisi baris engine seperti "Bond with X deepened to Rank N" (`:3002`), "Week recap … reached Rank 10" (`:2291`), "Academy
  reputation fell to −4" (`:2235`), dan rank proficiency (`:3475`). Di adegan A 10 dari 30 baris Journal, di adegan C 8 dari 30, adalah
  catatan mekanis. Jadi seperempat sampai sepertiga jendela 30 baris yang menjadi memori panjang cerita (DECISIONS §8) terpakai untuk
  hal yang sudah tercatat di tempat lain (Bonds, Profile, `<now>`).

**T4. 501 memuat data milik engine.**
- `_Techniques` ditulis lengkap dalam YAML (Type, Subtype, Effect, Cannot_do, Cost_mode, Activation, Upkeep_per_min, Trigger, Notes):
  583 token untuk 5 teknik di adegan C.
- Transactions sampai 20 baris (di adegan C 11 baris, 154 token; tiga baris terakhir cukup, 52 token).
- `Entrance_tour` dan `Council.Candidates` tampil sepanjang tahun.
- Nilai default 0 lolos filter (`Sunreach.Bet.Stake: 0`), karena `_E` di `501.txt:5` menganggap 0 tidak kosong.
- Bond tokoh yang tidak hadir ditulis YAML multi-baris (Rank, Trust, Tension, Last_seen, 3 fakta, 3 milestone).

**T5. Narator diminta menghitung yang sudah dihitung engine.**
- Kalender: lihat §2.3.
- Tanggal: lihat §2.3. Satu-satunya kekurangan engine: teks relatif ("tomorrow") tidak ditulis ulang setelah dikunci, sehingga 501
  bisa menampilkan "tomorrow" yang sudah basi. Mungkin karena itulah 502 meminta bentuk absolut.
- Stamina karena cuaca tidak disebut di aturan Stamina. Di playtest owner narator menambahkan sendiri "Chilled outdoor penalty" −5,
  dan engine juga menguranginya (`:1806`). Hasilnya terhitung dua kali.
- Bond baru: engine sudah membuat record bond sendiri saat tokoh roster masuk Scene.Present (`:2879`) dan menimpa Trust ke nilai awal
  wataknya. Tetapi contoh 503 (`:15`) mengajarkan `insert /Bonds/Irene` dengan `"Rank": 0`, dan di playtest narator menulis Trust 50/45
  serta Tension 10 yang kemudian ditimpa. Terverifikasi di harness: `insert /Bonds/Irene/Known_facts/-` saat Irene pertama kali hadir
  tetap diterima, dan bond terbentuk dengan Trust awalnya (40) serta fakta itu.

**T6. Bug gating: aturan pakta pertama tersembunyi dari pemain yang membutuhkannya.**
- Seluruh poin Pacts di 502, termasuk "A first pact in play: … Kind "Spirit", Tier "Lesser", Presence "summoned" …", dibungkus
  `if (_pacts)` (`502.txt:4`, `:91`). Artinya hanya tampil bila `Magic.Pacts` sudah berisi.
- Pemain Occult tanpa pakta Builder tidak pernah melihat format itu, padahal lore Spirit Path (347) mengundang pakta pertama dan engine
  (`stepMagic`, `:1484-1503`) menolak pakta dengan Kind atau Tier yang salah.
- Terverifikasi: render 502 untuk siswa Occult tanpa pakta, termasuk saat berada di Spirit Path, tidak memuat aturan itu. Bug ini ada
  sejak 1.31.0.

**T7. Contoh 503 bertentangan dengan 502.**
- Contoh `Rep_events` memakai format lama `{"Rep":"Student","XP":2,"Kind":"repeat"}` (`503.txt:17`), padahal 502 (`:66`) meminta deed
  bernama dan menyisakan format lama hanya untuk deed yang tidak ada di daftar. Bagi model, contoh adalah sinyal terkuat.
- Contoh bond (`503.txt:15`) mengajarkan menulis Rank.

**T8. Laporan dua sisi untuk deed yang pasangannya tetap.**
- 502 meminta dua entri untuk `reported_student_to_staff` + `helped_staff_report` dan `reported_student_to_doves` +
  `helped_doves_report`. Pasangan ini selalu bersama, jadi bisa ditambahkan engine dari data. `data/reputation.json` `deeds` belum punya
  field pasangan.

**T9. Kehadiran remedial bergantung pada narator menghapus Commitment tepat waktu.**
- Aturannya: dihapus dalam 3 jam sejak mulai berarti hadir (`stepRecords`, `:3933-3944`).
- Engine sudah tahu tempat dan jam remedial serta lokasi {{user}}. Kalau narator lupa menghapus, F tetap F walaupun {{user}} hadir di
  cerita.

**T10. Sisa kecil.**
- Gate kosong `on('class')` di `504.txt:51`.
- Aturan dunia (alkohol, `502.txt:193`) dan aturan narasi ("Mood, sleep and wind", `:191`) berada di entri aturan update.
- Permintaan kartu Extras ("Seen before, with no Extras record yet… Add their record in this reply's update",
  `509_tail.template.ejs:25`) adalah tugas update yang ditaruh di entri bertag `[mvu_plot]` (relevan untuk U9).

**T11. Pengecekan live tertinggal.**
- `docs/TEST_CHECKLIST.md` "Open" berisi pengecekan dari 1.30.0 sampai 1.52.1. Hampir semua perubahan aturan narator sejak 1.30 belum
  dicek terhadap model sungguhan; satu-satunya bukti perilaku model di repo adalah dua blok dari playtest 2026-09-30.
- Untuk diet aturan, angka sebelum dan sesudah di chat nyata diperlukan (U10).

## 4. Usulan

Prinsip:
1. Engine memutuskan, narator memainkan, seperti yang sudah terbukti di crafting, ujian, area, dan belanja.
2. Setiap aturan dikatakan sekali, di tempat ia dipakai.
3. Narator menulis apa yang terjadi dengan bahasa alami; engine menormalkan.
4. Tidak ada fitur yang dimatikan atau dilemahkan, dan tidak ada angka keseimbangan yang berubah.

### A. Yang dibaca narator

**U1. Aturan situasional: inti tetap dan kartu situasi.** Usaha S (dua rilis). Tidak mengubah keputusan.
- **Apa yang berubah.** 502 dipecah menjadi dua bagian:
  - **Inti stabil** di posisi atas. Tiap bagian satu atau dua baris: path, bentuk data, larangan utama.
  - **Kartu situasi** di depth 1 (dekat `<now>`). `stepNow` menulis daftar kartu yang berlaku, misalnya `$ui.now.rules = ['letters',
    'projects', 'exam', 'first_pact', …]`, lalu satu entri baru mencetak teksnya dari satu sumber (mis. `data/rule_cards.json`, dengan
    `{@file.path}` lewat `fill_data()`).
- **Pemicu kartu** memakai data yang sudah dimiliki engine:

  | Kartu | Tampil bila |
  |-------|-------------|
  | Letters | di Mail Tower, ada surat waiting/sent, atau surat rumah bulan ini |
  | Projects | ada Project, atau di tempat kerja/crafting |
  | Competition | musim kompetisi (`calendar.json`) atau `Competition.Tier` terisi |
  | Trip | hari "away"/trip atau `Trip.Active` |
  | Exams | minggu ujian, Results day, Science Fair, Expedition |
  | Tutoring | ada nilai A |
  | Dorm / Combat_role | sebelum terisi, atau di hari sortir/penilaian |
  | Pakta pertama | siswa Occult, `$eng.pactPlay` kosong, di Spirit Path (sekaligus memperbaiki T6) |
  | Trust/Tension/Judging lengkap | ada tokoh ber-bond di Scene.Present; kalau sendirian, ringkasan dua baris |

  Ada juga yang cukup dihapus atau dipindah:
  - Restful places dihapus, karena sudah ada di baris `<now>`.
  - Aturan alkohol pindah ke entri lore kata kunci (alcohol, wine, ale, beer, drink, tobacco, smoke, bar, Barrow & Vine), seperti 506
    sekarang, ditambah satu baris di World Index CORE FACTS.
- **Hemat (prototipe pada teks render):** A −2.727 token (32%); C −2.589 (29%); C sendirian −3.415 (38%). Kalau Interactions juga
  diringkas saat tidak ada siapa pun, hematnya bertambah ±400.
- **Mengapa maksud fitur tetap:**
  - Setiap aturan masih ada dan muncul tepat ketika dipakai.
  - Inti selalu menyebut path dan bentuk datanya, jadi kejadian tak terduga (perkelahian mendadak, surat datang) tetap bisa dilaporkan.
  - Gate dibuat "fail-open": kalau ragu, kartu ditampilkan.
  - Reminder (`stepReminders`) tetap menangkap laporan yang terlewat.
- **Bonus:** bagian atas prompt jadi statis karena gate lokasi pindah ke depth, dan aturan yang relevan duduk dekat titik generasi.
- **Risiko:** kartu dihitung dari state akhir balasan sebelumnya. Situasi yang baru dimulai di tengah balasan hanya mendapat baris
  inti untuk satu giliran. Topik yang biasanya dimulai lewat obrolan (belanja, alkohol) memakai pemicu kata kunci seperti 506.
- **Sejalan dengan** §6 ("`<now>`'s rule lines are the engine's") dan §1 One source. Tes di Node: render per adegan (seperti suite
  `test_feature_batch*`), periksa kartu yang benar muncul.

**U2. Satu tempat per fakta.** Usaha K–S. Mengubah §6: "505 prints them" menjadi "505 dan sheet mencetaknya" (sumbernya tetap engine).
- **Blok per tokoh.** Baris per tokoh dari `nowOf` dicetak sebagai satu blok "Now with {{user}}" di sheet tokoh itu (sheet penuh
  maupun ringkas), tidak tersebar di `<now>`.
- **Angka sekali.** Rank/Trust/Tension hanya di 501, satu baris per bond. Sheet dan blok tokoh memakai kata band (neutral, calm,
  trusting) tanpa angka. Dengan begitu AI update di U9 tetap melihat angkanya di 501.
- **Kalimat umum sekali saja:** ekor mood; "deflects in character…"; larangan menyebut rank/XP/perk (satu kalimat di 504); rapat
  Council (satu tempat); instruksi pembelian (di 502 saja, 506 cukup daftar harga); nama tempat area (cukup indeks lore dan "Walks
  from here").
- **Recent dan Defining.** `Recent` dari 5 menjadi 3 entri. `fx` diganti kata ("grew closer", "trust shaken", "tension rose",
  "romance began") atau dihapus; `Defining moments` diperlakukan sama. Daftar share yang kumulatif cukup menyebut tingkat tertinggi
  ditambah "and everything before". Journal dates di-dedupe.
- **Hemat** di adegan C: ±−400 s.d. −700. Rinciannya: baris per tokoh 1.287 → ±800, Recent 308 → 200, ekor mood 71 → 42, angka di
  Defining ±100.

**U3. State ringkas di 501.** Usaha S (EJS 501, sedikit engine untuk Journal, migrasi baris lama di `stepMigrate`). Mengubah §8: jumlah
jendela Journal tetap 30 baris, tetapi isinya cerita saja (perlu OK owner). Bagian lain sejalan dengan §1 (501 memang "omits $ keys,
empty values").
- **Teknik satu baris**, misalnya `Glamour Veil (Occult/Glamour; lasting, 4 + 0.1/min): A light illusion over your own face and
  clothes. Cannot: fools the eye only.` Biaya tetap ditulis ringkas agar narator bisa menilai "mana tipis", dan penanda
  hidden/forbidden tetap ada. Untuk 5 teknik: 583 → ±300 token; makin besar kit, makin besar hematnya.
- **Transactions:** tiga baris terakhir (154 → 52); sisanya di UI.
- **Bond yang tidak hadir:** satu baris per bond (Rank, Trust, Tension bila di atas 0, Title, Next). Fakta hanya untuk tokoh yang
  disebut di balasan terakhir (`$ui.cast.ment`) atau yang mungkin datang (`$ui.maybe`). Di adegan C: 360 → ±100. Di save dengan 20–30
  bond, hematnya ±800–2.000.
- **Sembunyikan yang sudah lewat:**
  - `Entrance_tour` setelah hari Entrance; `Council.Candidates` di luar bulan pemilu.
  - Nilai default 0.
  - Clues dari thread yang sudah solved. Ide ini sudah tercatat di `planning/FUTURE_PLANS.md` §2 "Hemat token".
  - Rumours di 501 bila `<now>` sudah mencetaknya.
- **Journal:** baris catatan mekanis disimpan di daftar UI, tidak di 30 baris yang dibaca narator:
  - keluar: rank naik/turun, level reputasi, rank proficiency, week recap;
  - tetap: baris engine yang bercerita (Meanwhile, hasil Expedition, pemilu, kelulusan, misteri terpecahkan, masuk klub).

  Hasilnya, 30 baris memori benar-benar berisi cerita.
- **Hemat:** ±−900 di adegan C, sampai ±−2.500 di state berat.

### B. Yang ditulis narator

**U4. Contoh dan `<Analysis>` di 503.** Usaha K. Tidak mengubah keputusan.
- **Contoh:**
  - `Rep_events` diganti deed bernama (`{"Kind": "student_notice_help", "Why": "…"}`).
  - `insert /Bonds/Irene {Rank…}` diganti `insert /Bonds/Irene/Known_facts/-`.
  - Tambah satu contoh tanggal relatif.
- **Analysis** dari ≤8 baris menjadi ≤3 baris: "Time/Location", "Present", dan "Reports: …" (daftar periksa jenis laporan yang dipakai
  giliran ini). Baris "Points: current X + delta Y = Z" dan "Vitals" dihapus supaya narator tidak menghitung ulang pekerjaan engine.
- Analysis tetap dipertahankan untuk preset tanpa CoT, karena kartu harus jalan dengan preset apa pun.
- **Hemat:** ±60–100 token output per giliran. Yang lebih penting: contohnya kini mengajarkan format yang benar.

**U5. Tulis dengan bahasa alami, engine yang menormalkan.** Usaha K. Tidak mengubah keputusan (§4 Agenda "parsed once" tetap).
- **Kalender.** Ganti aturan rollover dengan: "Write Day and Time; the engine turns weeks, months and years (write the full date only
  for a skip of more than a week)." Analysis cukup "Day HH:MM → Day HH:MM".
- **Tanggal.** `Due`, `Until`, dan `Heals_by` boleh ditulis "tomorrow 09:00", "Fri 16:00", atau "in two days". Engine sudah
  menguncinya. Yang baru: engine juga menulis ulang teks itu sekali ke bentuk absolut, supaya tidak ada "tomorrow" yang basi.
- **Bond baru.** "A bond starts by itself when a roster character is in Scene.Present; add facts with insert
  /Bonds/<name>/Known_facts/-; never insert a whole bond record." Perlu dicek live: harness meniru MVU yang membuat container yang
  belum ada.
- **Lokasi.** Aturan Location bisa dipendekkan, karena `canonLocation` sudah memetakan nama pendek ke nama di peta.

**U6. Satu daftar "dikerjakan engine".** Usaha K. Tidak mengubah keputusan.
- Kalimat "never"/"do not" yang tersebar di 502 (±40) diganti satu blok di inti:
  - "The engine does these; never write them: mana for techniques and regen; stamina from walks, weather and conditions; rest and
    sleep recovery; conditions from weather; payouts, prices, purchases, sales and tutoring pay; bond XP, rank rises and Trust rises;
    quiet-day Tension easing; marks, attendance and reputation levels; Dove attention decay."
- Blok ini juga menambahkan yang belum tertulis, yaitu stamina karena cuaca (T5). Itu mencegah hitung ganda seperti di playtest.
- **Hemat:** ±150–250 token. Manfaat utamanya: mencegah error.

**U7. Engine mengambil laporan yang sudah pasti.** Usaha K. Tidak mengubah keputusan (§3 Grades: remedial yang dihadiri tetap dihitung
D).
- **Pasangan deed.** Tambah field `also` di `data/reputation.json` (`reported_student_to_staff` → `helped_staff_report`;
  `reported_student_to_doves` → `helped_doves_report`), lalu engine menambahkan sisi kedua sendiri. Pasangan bersyarat tetap penilaian
  narator: prank/cover-up yang tertangkap, atau pembelaan yang membuat Doves marah.
- **Remedial.** Engine menandai hadir bila {{user}} berada di tempat remedial pada jamnya, lalu menghapus Commitment itu. Narator tetap
  boleh menghapusnya sendiri.

### C. Yang diputuskan narator (perlu keputusan owner)

**U8. Kata keparahan untuk Trust dan Tension (opsional).** Usaha S. Mengubah DECISIONS §6 Trust ("the narrator writes drops") dan
Tension (rule 502 judges deeds).
- **Sekarang:** narator menulis angka langsung ke `/Bonds/<id>/Trust` (turun) dan `/Tension` (naik). Angkanya dipilih dari rentang di
  `502.txt:114-117` (±890 token aturan), lalu engine mengalikannya sesuai watak tokoh.
- **Usulan:** laporkan lewat `/Interactions` dengan jenis dan bobot, misalnya:
  - `{"With": "Irene", "Kind": "offence", "Weight": "slight|insult|violence"}`
  - `{"With": "Irene", "Kind": "letdown", "Weight": "small|broken|secret_told|betrayal"}`
  - `"Meant": "no_harm"` untuk kecerobohan tanpa niat jahat.
- **Cara kerja:** rentang angka pindah ke data (`data/trust.json`, `data/tension.json`). Engine memilih nilainya (tengah rentang atau
  `rollInt` ber-seed), lalu menerapkan pengali watak seperti sekarang. Tulisan angka langsung tetap diterima, jadi kompatibel.
- **Maksud tetap:** narator tetap menilai niat dan bobot, kenaikan Tension tetap tanpa batas, dan watak tetap menentukan. Yang hilang
  hanya angka yang harus dipilih, serta jebakan "never raise Trust yourself".
- **Hemat:** ±400 token aturan. Semua efek sosial jadi lewat satu saluran (Interactions).

### D. Opsi arsitektur

**U9. Mode "extra model" MVU.** Persiapan kartu: usaha K, aman untuk mode sekarang. Mengubah §9 (`507` `更新方式 = 随AI输出`) hanya bila
dijadikan default; tanpa itu, pemain sudah bisa mencobanya di panel MVU.
- **Fakta terverifikasi.** Menurut dokumen panel MVU, di mode "Extra-model parsing" satu AI menulis cerita, lalu AI kedua membaca cerita
  itu dan mengubah variabel. Entri `[mvu_plot]` hanya dikirim ke AI cerita, `[mvu_update]` hanya ke AI update, dan entri tanpa tag ke
  keduanya. DECISIONS §11 mencatat bahwa di mode ini update ditempel ke pesan dengan prosa tetap ada, jadi fitur berbasis prosa (nama,
  pembicara, reminder) tetap jalan. Kartu sudah diberi tag untuk dua mode (D2; `docs/PLAYER_GUIDE.md` §8).
- **Dampak:**
  - AI cerita tidak lagi membaca 502 dan 503 (±9 ribu token, ±5 ribu setelah U1) dan tidak menulis blok update.
  - Langkah 2 BOLT otomatis terlewati, karena berbunyi "if <update_format> is present".
  - AI update bekerja dengan perhatian penuh pada aturan, dan bisa memakai model yang lebih murah atau cepat.
- **Harga:** dua panggilan per giliran (latensi dan biaya), dan AI update hanya tahu apa yang tertulis di balasan.
- **Belum diverifikasi, cek dulu:** apa saja yang dikirim ke panggilan update (riwayat berapa pesan, ikut preset atau tidak;
  `filter_prompts.ts`, `extra_model_preset.ts`). Cek terhadap commit MVU yang di-pin (`438f9ff`), bukan `beta`.
- **Persiapan kartu (audit tag):**
  - 506 Price Guide bertag `[mvu_plot]`, padahal AI update butuh nama barang yang tepat untuk `/Purchases`. Jadikan tanpa tag.
  - Permintaan kartu Extras (T10) dipindah dari 599 ke `<now>` (tanpa tag) atau ke 502.
  - 501 dan 505 sudah tanpa tag.

### E. Alat ukur

**U10. Laporan kepatuhan narator dari chat ekspor.** Usaha K. Tidak mengubah keputusan.
- Tambah bagian "mechanics" di `tools/audit_chat.py`. Per balasan:
  - jumlah op dan panjang blok update;
  - blok rusak yang diperbaiki engine;
  - koreksi di `_Log`: rank/Trust dikembalikan, deed tidak dikenal, path salah, waktu mundur;
  - reminder yang muncul (`$ui.missed`) dan lompatan waktu.
- Hasilnya baseline sebelum diet dan bukti sesudahnya.
- 0 token prompt.

## 5. Yang sengaja tidak diusulkan

- **Bond XP atau Trust dari prosa** tanpa laporan Interactions: bertentangan dengan §2 "Missed reports" (bond XP dan Trust hanya dari
  interaksi yang dilaporkan; reminder tidak pernah mengubah angka).
- **Memotong lore kanon atau voice di Cast Sheet.** Kesetiaan karakter adalah inti kartu; yang dipangkas hanya duplikasi dan angka.
  Batas sheet penuh `CAST_FULL` = 4 bisa jadi angka setelan nanti bila playtest menunjukkan perlu, tapi tidak diusulkan sekarang.
- **Preset "Lean" atau mematikan fitur secara default:** bertentangan dengan §4 "No Lean preset button".
- **Memindahkan aturan kartu ke preset:** melanggar aturan "Card vs preset" di `CLAUDE.md`.
- **Plafon Tension**, menghapus penilaian niat, atau angka keseimbangan baru.
- **Memendekkan riwayat chat** (trim 24): bukan beban engine, dan sudah tercatat sebagai angka playtest di `FUTURE_PLANS` §5.

## 6. Urutan pengerjaan yang disarankan

"kerjakan batch N" untuk file ini artinya: kerjakan hanya batch N sebagai satu rilis (aturan rilis `CLAUDE.md`), lalu isi kolom Status.
Setiap batch memakai fixture save, `ENGINE_DIFF` untuk bagian engine yang tidak boleh berubah, `tests/snapshot_render.cjs` untuk
entri, dan pengecekan live di `docs/TEST_CHECKLIST.md`.

| Batch | Isi | Bergantung pada | Keputusan owner | Status |
|-------|-----|-----------------|-----------------|--------|
| 1 | Perbaikan cepat: T6 (pakta pertama), U4 (contoh dan Analysis 503), U5 (kalender, tanggal relatif dan normalisasinya, bond baru, lokasi), U6 (daftar dikerjakan engine), U7 (pasangan deed, remedial), T10, dedupe Journal dates | – | tidak | selesai (1.53.0) |
| 2 | U10 alat ukur, lalu baseline dari chat playtest owner | – | tidak | selesai (1.53.1; baseline: `AUDIT_2026-10-04_2_baseline_mekanik.md`) |
| 3 | U1 tahap 1: mekanisme kartu situasi + kartu terbesar (Projects, Competition, Letters, Exams/Tutoring, Pacts, Trip) + alkohol ke lore | 1 | tidak | selesai (1.54.0) |
| 4 | U1 tahap 2: kartu lainnya (Trust/Tension lengkap atau ringkas, Practice/Training, Dorm/Combat_role, Vigil, Notices, favour, Romance, Imprints, Old Hut) + pemadatan teks inti 502/504 | 3 | tidak | selesai (1.55.0) |
| 5 | U2 satu tempat per fakta | 3 | §6 (cara cetak) | belum |
| 6 | U3 state ringkas + Journal tanpa catatan mekanis | – | §8 (isi jendela Journal) | belum |
| 7 | U9 persiapan tag + uji live mode extra model (A/B, diukur dengan U10) | 1, 2 | §9 bila jadi default | belum |
| 8 | U8 kata keparahan Trust/Tension | 1 | §6 Trust/Tension | belum |

## 7. Keputusan owner yang dibutuhkan

1. **U3 (Journal):** baris catatan mekanis keluar dari 30 baris yang dibaca narator (tetap tampil di UI)? Saran: ya.
2. **U8:** Trust/Tension lewat kata keparahan, angkanya di data? Saran: ya, tapi setelah batch 1–6 dan baseline U10, supaya efeknya
   terukur.
3. **U9:** setelah uji live, jadikan mode extra model mode yang direkomendasikan? Saran: putuskan dari hasil uji.

Usulan lainnya mengikuti aturan "diam = setuju".

## Lampiran: biaya per paragraf 502 (adegan C) dan kapan relevan

| Paragraf (`502.txt`) | Token | Relevan kapan |
|----------------------|-------|---------------|
| Interactions (`:107`) | 462 | ada tokoh hadir |
| Pacts (`:92`) | 376 | punya pakta (summon); pakta pertama: Occult di Spirit Path |
| Judging a deed (`:116`) | 321 | ada tokoh ber-bond, atau mereka mengetahui sesuatu |
| Tension (`:117`) | 289 | sama |
| Trust (`:114`) | 278 | sama |
| Projects (`:173`) | 274 | ada Project, atau di tempat kerja |
| Time (`:9`) | 253 | selalu (bisa dipendekkan, U5) |
| Competition (`:169`) | 252 | musim kompetisi atau Competition terisi |
| Inventory (`:184`) | 249 | selalu (bagian Sunfizz/Consumables saat relevan) |
| Letters (`:158`) | 202 | Mail Tower atau ada surat |
| Exams (`:77`) | 187 | minggu ujian, Results, momen penentu |
| Restful places (`:48`) | 186 | sudah ada di `<now>` |
| Location (`:11`) | 170 | selalu (bisa dipendekkan, U5) |
| Mood, sleep and wind (`:191`) | 168 | The Vigil di Bag atau aktif |
| Rank (`:111`) | 164 | ada tokoh hadir |
| Practice (`:38`) | 155 | ada aksi Practice di tempat ini |
| Commitments (`:149`) | 152 | selalu |
| Alcohol (`:193`) | 150 | topik minum/rokok (kata kunci) |
| Combat_role (`:63`) | 138 | sebelum terisi atau hari penilaian |
