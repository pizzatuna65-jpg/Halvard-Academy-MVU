# Audit Eldrasil / Halvard Academy (v1.41.0) — Bagian 1: Bug, Kode Tidak Efisien, Sistem yang Terpisah

Tanggal: 2026-10-03 · Versi yang diaudit: `src/card/card.json` 1.41.0 (commit `d4f01a3`)

## Cara audit

- Sesuai permintaan, dokumentasi (`docs/`, `HANDOFF.md`, `CHANGELOG.md`, `planning/`) dan checklist tidak dibaca, supaya hasilnya tidak bias.
- Yang dibaca langsung adalah kodenya: `src/scripts/engine.template.js` (seluruhnya), `mood_gifts.js`, `schema.js`, `ui.template.js`, `src/ui/parts/*.js`, `statusbar.template.html`, `news.shared.js`, `src/regex/index.json`, entri EJS `<now>` (`src/worldbook/custom/505.template.ejs`), generator yang menyuntikkan data (`tools/gen_engine.py`, `gen_ui.py`, `common.py`), serta `data/*.json` untuk cek silang.
- Bug yang ditandai **[terverifikasi]** sudah saya jalankan lewat engine asli dengan `tests/harness.cjs`. Skripnya ada di scratchpad dan tidak ditambahkan ke repo. Yang lain ditemukan dari pembacaan kode.
- Nomor baris merujuk ke file sumber (template), bukan file hasil generate.

## Ringkasan prioritas

| # | Temuan | Tingkat | Status |
|---|--------|---------|--------|
| 1.1 | Dua regex dialog berisi karakter backspace, sehingga tidak pernah cocok. Tag `<say>` di balasan lama ikut terkirim ke prompt | Tinggi | terverifikasi (juga di `dist/`) |
| 1.2 | `Trip.Active` bergantung pada narrator. Kalau tertinggal "on", normalisasi lokasi dan banyak sistem lain mati. Kalau tidak diset saat Academy Trip, pesta ulang tahun dijadwalkan di kampus | Tinggi | terverifikasi |
| 1.3 | Item consumable yang ditulis dengan kata sandang ("a …") tetap memberi efek tetapi Qty tidak berkurang (bisa dipakai tanpa batas) | Tinggi | terverifikasi |
| 1.4 | Hadiah (`Kind gift`) tidak mengurangi Bag, dan tidak ada reminder untuk kasus ini | Sedang | terverifikasi |
| 1.5 | Baris transaksi yang teksnya sama dengan baris lama memunculkan baris palsu "(not itemised)" | Sedang | terverifikasi |
| 1.6 | Interaksi dengan NPC yang tidak hadir tetap memberi bond XP | Sedang | terverifikasi |
| 1.7 | Bolos seharian dalam satu update lebih dari 6 jam tidak tercatat sebagai bolos | Sedang | terverifikasi |
| 1.8 | Salah tulis hari mundur satu hari membuat jam maju +6 hari | Sedang | terverifikasi |
| 1.9 | MagVarUpdate dan helper zod dimuat dari CDN tanpa pin commit | Sedang (risiko) | dari kode |
| 1.10 | Bag di atas 40 item dipotong diam-diam, tanpa log atau toast | Sedang | terverifikasi |

---

## 1. BUG

### 1.1 [Tinggi] Regex "dialogue colours" berisi karakter backspace dan tidak pernah cocok — [terverifikasi]

- **Lokasi:** `src/regex/index.json:145` ("stray tags (display)") dan `:161` ("strip tags from older replies (prompt)"). Bug yang sama ikut terbawa ke kartu jadi: `dist/Eldrasil_Halvard.json` → `regex_scripts[8]` dan `[9]`.
- **Penyebab:** di JSON tertulis `"/<\\/?say\b[^<>\n]{0,60}>/gi"`. Di JSON, `\b` adalah escape untuk karakter backspace (U+0008), bukan word boundary. Regex yang dihasilkan mencari `say` diikuti karakter backspace, jadi tidak pernah cocok. Entri lain di file yang sama sudah benar memakai `\\s`.
- **Bukti:** dicek dengan Node. Kedua regex berisi char code 8, dan `test('<say:Irene>')` maupun `test('</say>')` sama-sama `false`.
- **Dampak:**
  - (a) Prompt: tag `<say:Nama>…</say>` di semua balasan pada kedalaman 4–24 tidak dihapus. Perkiraan kasar ~8 token per baris dialog × ~10 baris × ~20 pesan ≈ ±1.500–2.000 token terbuang per generate. Model juga terus melihat tag mentah di riwayat.
  - (b) Tampilan: tag yatim (misalnya kutipan pakai tanda kutip tunggal, sehingga regex utama tidak menangkapnya) tidak dibersihkan.
- **Perbaikan:** ganti `\b` menjadi `\\b` di dua entri itu, lalu rebuild. Tambahkan tes yang mem-parse setiap `findRegex` dan menolak karakter kontrol.

### 1.2 [Tinggi] Dua sumber kebenaran untuk "sedang bepergian": `Trip.Active` (narrator) vs jadwal engine — [terverifikasi]

- **Lokasi:** keputusan yang bergantung pada `S.Trip.Active`:
  - `engine.template.js:1122` (normalisasi lokasi kampus dilewati)
  - `:1486`, `:1512` (tidur dan tempat istirahat)
  - `:2130` (absensi dimaafkan)
  - `:2383` (small scenes)
  - `:2924` (Meanwhile)
  - `:2947` (akses kunjungan dorm/staf)
  - `:3486` ("May be here")
  - `:3730` / `:3743` (NPC initiative)
  - `:4165` (reminder lokasi)
  - `mood_gifts.js:64` (pesta ulang tahun)

  Padahal engine sudah tahu sendiri kapan pemain jauh dari kampus: flag kalender `away` / `kingdom`, jendela penerbangan (`airFlight`), dan jendela area (`expOnDay`, `avCrown` / `avKingdom`, `srWindow`).
- **Bukti:**
  - `Trip.Active` tertinggal `true` di kampus: `World.Location = "library"` tetap "library" dan tidak dinormalisasi jadi "Main Library". Peta tidak menemukan pemain, absensi selalu dimaafkan, NPC initiative mati, baris Meanwhile berhenti.
  - Academy Trip tanpa `Trip.Active` (pemain di "Sunreach Bay — Coral Beach", ulang tahun M11 W2 Sun, Etnie Rank 7): engine menjadwalkan `party = {where: "The Snug (reserved evening booth)", 18:00–20:00}`, yaitu pesta di kampus saat pemain di luar negeri. Jam selesainya juga memakai jam malam kampus.
- **Dampak:** satu flag yang lupa diubah narrator diam-diam mematikan atau merusak ±10 sistem. Tidak ada reminder atau auto-reset.
- **Perbaikan:** turunkan status `away` dari engine (area aktif, penerbangan, atau kalender `away`/`home`) dan pakai itu di semua pengecekan di atas. `Trip.Active` cukup untuk trip buatan cerita. Tambahkan reset otomatis atau reminder bila `Trip.Active` masih `true` sementara lokasi sudah tempat kampus di hari tanpa event `away`.

### 1.3 [Tinggi] Consumable: normalisasi nama tidak konsisten, item bisa dipakai tanpa batas — [terverifikasi]

- **Lokasi:**
  - Filter "punya item ini?" memakai `ik()` yang membuang kata sandang dan kurung: `engine.template.js:1526-1531`.
  - Efek item memakai `fxOf()` yang juga membuangnya: `:772`, `:1568-1584`.
  - Pengurangan Qty (H2) hanya mencocokkan `toLowerCase()` persis: `:1540-1547`.
- **Bukti:** Bag berisi `Quick-dry powder ×2` dengan kondisi Soaked, lalu `/Consumables` diisi `"a Quick-dry powder"`. Hasilnya Soaked hilang tetapi Qty tetap 2. Dengan nama polos, Qty menjadi 1. Reminder R2 (`:4105`) juga tidak muncul karena Qty memang tidak berubah.
- **Perbaikan:** satu fungsi normalisasi nama item untuk filter, efek, pengurangan, dan reminder (lihat 2.4 dan 3.4).

### 1.4 [Sedang] Hadiah tidak mengurangi Bag — [terverifikasi]

- **Lokasi:** `engine.template.js:2650-2663` (gift dinilai, XP dihitung, tetapi `S.Inventory` tidak disentuh). Reminder R2 `:4101-4110` hanya menangkap kasus sebaliknya: item hilang dari Bag tanpa laporan gift.
- **Bukti:** `Honey cake ×1` diberikan ke Irene (`Kind gift`, `Item "Honey cake"`). Bag masih ×1 dan `$ui.missed` kosong.
- **Dampak:** item jadi ganda (sudah diberikan tetapi masih dibawa). Ini tidak konsisten dengan Consumables yang dikurangi otomatis.
- **Perbaikan:** terapkan logika H2 ("kurangi kecuali update ini sudah menguranginya") juga untuk `Kind gift` / `rank_gift` yang menyebut Item dari Bag.

### 1.5 [Sedang] Deteksi "not itemised" salah saat teks transaksi berulang — [terverifikasi]

- **Lokasi:**
  - `engine.template.js:3404-3417`: baris baru dihitung dengan `!T0.has(l)`, yaitu teks yang belum pernah ada di daftar lama.
  - `:3419-3428`: pemeriksaan "uang tidak cukup" memakai cara yang sama.
- **Bukti:** dua giliran berbeda masing-masing `-3 Points` dengan baris `"-3 tea at the Snug"`. Giliran kedua menambahkan `"-3 (not itemised)"`, sehingga ledger terlihat 9 poin terpakai padahal hanya 6.
- **Dampak:** baris engine sendiri tanpa tanggal juga kena, misalnya `+40 tutoring (History)` (`:2355`), `+15 Apothecary…` (`:3284`), paid shift (`:3265`), dan studio (`:3242`, `:3264`). Tutoring di mata pelajaran yang sama minggu depan akan memicu baris palsu.
- **Perbaikan:** bandingkan jumlah kemunculan (multiset), bukan himpunan. Atau beri cap waktu di setiap baris engine. Lebih baik lagi: satu helper ledger (3.5).

### 1.6 [Sedang] Bond XP dari NPC yang tidak hadir — [terverifikasi]

- **Lokasi:** `engine.template.js:2631-2667`. XP untuk talk, hangout, study, help, dan gift tidak memeriksa `Scene.Present`. Hanya kenaikan rank (`genuine`, `:2598`) yang memeriksanya.
- **Bukti:** Irene tidak hadir, lalu narrator melaporkan `Kind hangout` dengan Irene. XP naik dari 0 menjadi 4.
- **Dampak:** salah lapor narrator (atau surat dan obrolan "jarak jauh") tetap mengisi bar bond. Ini bertentangan dengan prinsip anti-grind dan "Enemies are easier to make than friends".
- **Perbaikan:** syaratkan hadir (atau `wasHere`) untuk XP sosial. Kalau surat memang boleh, buat kind terpisah (mis. `letter`) dengan nilai kecil dan batasnya sendiri.

### 1.7 [Sedang] Celah absensi: update panjang lebih dari 6 jam tidak dihitung bolos — [terverifikasi]

- **Lokasi:** `engine.template.js:2131` (`elapsed <= 360`). `ST.held` tetap bertambah (`:2264-2268`), jadi persentase hadir malah tetap 100%.
- **Bukti:** pemain di Boathouse 07:30 lalu satu update ke 16:30 di Boathouse: skipped 0 dan Academy XP 0. Hari yang sama dalam tiga update: skipped 3 dan Academy XP −6.
- **Perbaikan:** kalau kedua ujung update berada di tempat yang dikenal peta dan bukan venue kelas, catat bolos untuk periode yang dilewati. Aturan "ikut rutinitas" cukup untuk lokasi yang tidak dikenal atau untuk lompatan multi-hari.

### 1.8 [Sedang] Hari ditulis mundur satu hari membuat jam maju sekitar 6 hari — [terverifikasi]

- **Lokasi:** `engine.template.js:1125-1134`. Kalau `Day` berubah tanpa rollover minggu atau bulan, engine menambah kelipatan 7 hari.
- **Bukti:** Tue 09:00 lalu narrator menulis `Day "Mon"` 10:00. Hasilnya M1 **W3** Mon 10:00, dengan toast "Time jumped 6 days".
- **Dampak:** salah ketik kecil memicu enam hari sekaligus: Tension mereda, Dove attention turun, flu, Meanwhile, initiative, rekap minggu, dan skip study. Toast memang muncul, tetapi narrator biasanya lanjut saja.
- **Perbaikan:** untuk mundur 1–2 hari tanpa kata lompatan waktu di prosa (`MISS_TIME_RX` sudah ada), pertahankan jam lama dan beri log, seperti kasus hari yang sama.

### 1.9 [Sedang, risiko] Dependensi inti dimuat tanpa pin versi

- **Lokasi:**
  - `src/scripts/mvu_loader.js:1`: `testingcf.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate/artifact/bundle.js` (branch default).
  - `src/scripts/schema.js:1`: `…/StageDog/tavern_resource/dist/util/mvu_zod.js`.
- **Masalah:** engine bergantung pada detail internal MVU, misalnya urutan event `COMMAND_PARSED` vs `COMMAND_PARSED_for_zod`, format `json_patch`, `extractCommands`, dan aturan readonly `_`. Komentar engine bahkan mencatat verifikasi di commit tertentu (`engine.template.js:4403-4407`, `:4437-4441`). Perubahan upstream bisa merusak semua pemain sekaligus tanpa ada update kartu. Potret dan d3 sudah di-pin, tetapi dua file inti ini belum.
- **Perbaikan:** pin ke commit hash (`@<sha>`) dan catat versi yang sudah diverifikasi.

### 1.10 [Sedang] Bag dipotong diam-diam di atas 40 item — [terverifikasi]

- **Lokasi:** `engine.template.js:3860-3865`.
- **Bukti:** 45 item menjadi 40. Tidak ada log, toast, maupun reminder.
- **Perbaikan:** tulis ke `_Log` dan toast item mana yang dibuang. Pertimbangkan menolak item baru alih-alih menghapus item lama.

### Rendah dan laten (singkat)

| Lokasi | Masalah |
|--------|---------|
| `engine.template.js:1497`, `:1308` | Kualitas tidur dan toast cuaca langka memakai cuaca kampus saat di Sunreach. Hanya cabang hutan (`fAt`) yang ditangani, `rAt` tidak. |
| `tools/gen_ui.py:167` → `30_notebook.js:96`, `20_map.js:382` | `timetableFor` di UI tidak punya override "Student Council" hari Sabtu P2 seperti engine (`engine.template.js:71-77`). Planner menampilkan "Study Hall" untuk anggota Council. |
| `src/ui/parts/10_people.js:136-138` | Dossier mencari `NPC_status` hanya dengan key persis. Engine (`:827`), UI lain (`ui.template.js:1685`), dan EJS (`505:16`) juga menerima kata pertama dari nama lengkap. Status dengan key nama lengkap tidak tampil di dossier. |
| `40_activities.js:236-237` | Panel Battle menilai "cukup mana" tanpa pengali angin, diskon Arcane scholar, dan syarat partner pact hadir. |
| `ui.template.js:1472` vs `engine.template.js:3341` | UI menulis "Fortune +rank×3", padahal engine membatasi bonus di +10 bila mata pelajaran itu sudah dapat A. |
| `engine.template.js:1035-1041` + `:792-798` | Saat fitur Proficiency dimatikan, `Player._Proficiency` yang diparkir tertimpa nol oleh default schema (`mergePark` menganggap 0 bukan kosong). Sekarang tertolong karena rank dihitung ulang dari XP, tetapi snapshot parkirnya sudah rusak (laten). |
| `schema.js:336` | `$ui.names: StrList(80)`, sementara roster sudah 71 NPC. Setelah cohort berikutnya melewati 80, nama yang paling awal terungkap akan hilang lagi dari UI. `$ui.lore: StrList(60)` vs 30 entri saat ini: aman untuk sekarang. |
| `engine.template.js` | Variabel mati: `MON_SAT` (64), `tensionBand` (173), `normP` (199), `wxBlk` (1282), `OFF` di `stepTraining` (2987). UI: `pips` (`10_people.js:24`). |

---

## 2. KODE TIDAK EFISIEN

### 2.1 Algoritma rute (Dijkstra) disalin 7 kali

- **Engine:** `expRoutes` (`:579`), `avRoutes` (`:638`), `srRoutes` (`:705`), ditambah tiga rekonstruksi path (`expPath`, `avPinPath`, `srPinPath`).
- **UI:** `walkFrom`, `forestWalks`, `capWalks`, `srWalks` (`20_map.js:72`, `:116`, `:161`, `:211`).
- UI menghitung ulang rute yang sudah dihitung engine dan disimpan di `$ui.forest.walks`, `$ui.capital.walks`, dan `$ui.sunreach.walks`.
- Versinya sudah mulai berbeda. Contoh: kartu Sunreach di UI menghitung "by carriage" sebagai setengah dari total menit termasuk menit tour boat (`20_map.js:224`), sedangkan engine hanya membagi dua menit darat (`engine.template.js:1885`).
- **Usulan:** satu modul graf bersama yang disuntikkan ke engine dan UI.

### 2.2 Konstanta waktu dan kalender ditulis ulang di banyak tempat

- **Jam periode kelas:** `[[480,600],[600,720],[780,960]]` ada di `:2135` dan `:2279`, `[600,720,960]` di `:2267`, `[[0,600],[1,720],[2,960]]` di `:3066`, ditulis inline tiga kali di `:3220`, lalu ada lagi `TIMES` (`:153`), `MID_SLOTS` (`:113`), jam `periodOf` (`:367-373`), `[8,10,13]` di `nextUp` (`:412`), `until` di EJS (`505:36`), `classHint` (`20_map.js:382`), dan header tabel Planner.
- **Bulan ujian:** `EXAMS = [3,5,9,11]` di `:2168`, dan `[3,5,9,11]` lagi di ambience `:4203`.
- **`TRIPS`** di `:250` menyalin tanggal kalender.
- **Tabel musim** ada 3 salinan: `engine:472`, `ui.template.js:1660`, `statusbar.template.html:212`.
- **Warna dorm** ada 3 salinan: bracelet, `DORM_COLOR` di UI, dan `dorm_color` di `npcs.json`.
- Kalau `calendar.json` diubah (misalnya jam pelajaran), sebagian kode ikut berubah dan sebagian tidak.

### 2.3 Logika aturan yang sama di tiga runtime (engine, UI, EJS)

- `classRole` / `ROLE` / `pmRole`: `engine:131`, `505:68`, `30_notebook.js:94`.
- `councilRemedial`: `engine:70`, `505:32`.
- Status NPC: `npcStatusIn` (`engine:827`), `npcStatus` (`ui:1685`), `stOf` (`505:16`), dan pencocokan di dossier (`10_people.js:137`). Aturannya sudah berbeda (lihat tabel Rendah).
- Band Trust dan Tension ada 3 salinan: engine, `10_people.js:33/37`, dan EJS `505:123/156`.
- Pemisah lokasi `split(/\s+[—–-]\s+|,\s+/)` ditulis sekitar 15 kali, dan sebagian varian tidak menyertakan en dash, yaitu `placeOf` (`:204`) dan `normPlace` di UI. Ini berisiko membuat pembacaan lokasi tidak konsisten.

### 2.4 Lima cara menormalisasi nama item

`ik()` (`:1526`), `fxOf()` (`:772`), `craftItem()` (`:3123`), `giftNorm` (`mood_gifts.js:8`), dan group key di `stepBag` (`:3832`). Inilah akar bug 1.3.

### 2.5 Penulisan Transactions tersebar di sekitar 12 tempat dengan batas yang berbeda

- Sebagian memakai `.slice(-20)` (`:1737`, `:1867`, `:3610`, `:3851`).
- Sebagian `push` saja (`:2355`, `:3242`, `:3264-3265`, `:3284`, `:3447`, `:3569`).
- Batas baru diterapkan di `stepPayout` (`:3457`), dan itu pun hanya bila `hasB`. Inilah akar bug 1.5.

### 2.6 State per pesan membengkak oleh data turunan UI

MVU menyimpan `stat_data` utuh di setiap pesan. Beberapa field `$ui` adalah hasil hitungan yang bisa dihitung ulang oleh UI atau EJS:
- `moods` beserta array `reasons` per NPC (~2,5 KB di fixture 1.16)
- `file` (~2 KB, salinan `_Techniques`)
- `craft` (hasil `craftResult` lengkap per resep)
- `grades.why`
- `practice`
- `walks` / `near` milik tiga area

Semuanya ikut tersimpan di setiap pesan, sehingga file chat tumbuh lebih cepat dari perlu. **Usulan:** simpan hanya yang dibaca narrator, lalu biarkan UI menghitung sisanya dari `DATA`.

### 2.7 Cast Sheet (509) adalah template EJS 679 KB

`src/worldbook/custom/content/509.txt` memuat lore lengkap 71 NPC sebagai cabang `if`. Seluruh template di-compile dan dievaluasi setiap generate, padahal yang dipakai hanya 4–8 NPC. (Perlu dicek di SillyTavern apakah Prompt Template meng-cache hasil compile.) **Usulan:** pecah menjadi satu entri per NPC yang di-gate oleh `$ui.cast`.

### 2.8 Teks UI dan EJS yang menyalin data

Kalau data berubah, teks-teks ini diam-diam jadi salah:
- `TRIP_INFO` dan `COMP_TIERS` (`40_activities.js:8-13`, `:194-207`).
- Jadwal Crowning Day dan Kingdom yang ditulis langsung di EJS (`505:227`, `:229`), serta "by Friday noon" (`505:205`), padahal sumbernya ada di `expedition.json` `back_by`.
- `PUBLIC_ROLE` di `gen_ui.py`.
- `MASTERY_PERKS` di UI.
- Regex toko di bracelet (`statusbar.template.html:265`) vs `DATA.mallShops`.
- `practiceNames` di `news.shared.js:19` vs `data/practice.json`: tempat latihan baru tidak akan mendapat titik merah.
- Tag kategori hadiah untuk item toko ditebak dengan regex di `gen_engine.py:22-33`, padahal seharusnya berupa field di `shop.json`.

### 2.9 Lain-lain (kecil)

- `happeningOn` membangun 336 hari sekaligus. Saat itu `wxDay` dipanggil ratusan kali, sementara cache `WXC` dikosongkan pada 400 entri, sehingga cache terbuang di update pertama setiap tahun (`:457-468`, `:526-534`).
- UI merender ulang seluruh `innerHTML` dan menjalankan `themed()` (regex) atas seluruh HTML di setiap render (`ui.template.js:916-935`).
- Variabel chat `eld_seen` (red dots) tumbuh tanpa pernah dipangkas.

---

## 3. SISTEM YANG SEHARUSNYA TERHUBUNG TETAPI DIBUAT TERPISAH

### 3.1 Empat "mesin area luar" yang hampir identik

Hutan (1.38), Avalon (1.39), Airship (1.40), dan Sunreach (1.41) masing-masing punya:
- parser tempat (`forestPlace` / `avPlace` / `airPlace` / `srPlace`)
- formatter lokasi (`forestLoc` / `avLoc` / `airLoc` / `srLoc`)
- Dijkstra sendiri
- biaya jalan, kereta, atau perahu
- roll per jam yang di-seed
- pencurian koin: pickpocket Avalon (`pick_min`/`pick_max`/`pick_cap`) dan hustler Sunreach (`hustle_min`/…) secara struktur identik
- pertemuan siswa akademi lain (Sunreach bahkan memakai `AV.rivals`)
- helper koin `spend` dan `pay`
- blok `$ui` sendiri
- tab UI dengan HTML hampir sama (`renderForest` / `renderCapital` / `renderSunreach`)
- blok EJS sendiri

Setiap area baru menambah ±200–400 baris yang mengulang pola yang sama.

**Usulan:** satu modul **Area** berbasis data. Isinya: places, pins, legs, moda (walk/ride/boat/tour), jendela waktu (kalender/penerbangan), profil iklim, jam malam, dan tabel roll. Area kelima, misalnya World Competition di luar negeri, cukup berupa JSON.

### 3.2 Kampus punya graf jalan tetapi engine tidak memakainya

`locations.json` `near` (menit antar-tempat) hanya dipakai UI (`walkFrom`). Di area luar, engine sudah:
- menagih waktu dan stamina perjalanan
- memberi daftar "Walks from here" di `<now>`
- mencatat sisa perjalanan (`owe`)

Di kampus, tidak ada satu pun dari ketiganya. Akibatnya narrator sering melompatkan lokasi tanpa waktu yang masuk akal. Itu sebabnya reminder R3 dan R4 diperlukan.

**Usulan:** kampus diperlakukan sebagai Area pertama di modul 3.1.

### 3.3 "Sedang pergi" punya dua sumber

`Trip.Active` (narrator) vs jendela yang sudah diketahui engine. Lihat bug 1.2.

**Usulan:** satu fungsi `awayNow()` di engine yang dipakai semua sistem.

### 3.4 Satu "buku besar" untuk Bag

Saat ini setiap jalur mengurus item dengan caranya sendiri:

| Jalur | Siapa yang mengubah Bag |
|-------|-------------------------|
| Consumables | engine mengurangi Qty |
| Gift | narrator mengurangi Qty, engine tidak (bug 1.4) |
| Bahan craft | engine (`takeMaterials`) |
| Penjualan apotek | engine |
| Paket dari rumah | engine menambah |
| Botol Sunfizz | engine |
| Belanja | narrator mengubah, engine hanya mengingatkan (`:4057-4071`), padahal engine sudah tahu harganya (`SHOP_PRICE`) |

**Usulan:** helper `bagTake` / `bagGive` dengan satu normalisasi nama. Belanja dijadikan laporan `/Purchases` yang diselesaikan engine, seperti `Sunreach.Bet` dan `Avalon.Ride`.

### 3.5 Satu ledger untuk Points dan Coin

Satu helper `ledger(S, currency, delta, why)` menangani batas 20 baris, teks unik, dan pencatatan delta. Dengan itu, deteksi "not itemised" dan "uang tidak cukup" bisa memakai catatan helper, bukan perbandingan teks. Ini sekaligus menutup bug 1.5.

### 3.6 Sekitar 12 sistem "roll acak ber-seed" yang ditulis masing-masing

Happenings, beat dan uncanny ambience, NPC initiative, kehidupan kota Avalon dan Sunreach, sky/stage/hold di airship, encounter Expedition, nasib gosip, flu, head cold, free period, dan paket dari rumah.

- Masing-masing punya pool, bobot, cooldown, dan aturan "tidak mengulang" sendiri.
- Hanya happenings, ambience, dan initiative yang tunduk pada Settings frekuensi. Roll di area luar tidak.

**Usulan:** satu utilitas `rollTable(table, seedParts, {cooldown, noRepeat, rate})` dan satu sumber pengaturan frekuensi.

### 3.7 Cuaca per area

`forestWx` dan `srWx` identik kecuali nilai salt. Efek cuaca seperti tidur dan toast tidak tahu sedang di area mana (bug kecil Sunreach di atas).

**Usulan:** profil iklim per Area dengan satu pipeline efek.

### 3.8 Enam model "di mana NPC X sekarang"

1. EJS `<now>`: regulars dan kehadiran kelas (`505:11-82`)
2. Engine: `maybe` dari rencana Next dan janji temu
3. Kartu peta: Regulars dan `classHint`
4. Pool NPC initiative
5. Tabel `meet` Sunreach
6. Daftar sakit flu

Ditambah `NPC_status`, `Graduated`, dan `ARRIVES`. Semua menjawab pertanyaan yang sama dengan aturan berbeda.

**Usulan:** satu `whereabouts(id, waktu)` di engine. Hasilnya ditulis ke `$ui` dan dipakai oleh EJS, peta, dan initiative.

### 3.9 Training vs Practice

Keduanya laporan "sesi latihan":
- Laporannya terpisah (`/Training` dan `/Practice`).
- Batas mingguannya terpisah.
- Bonus partnernya terpisah (Rank 4 partner vs `With`).
- Pengecekan cedera dan kelelahan ditulis dua kali (`:2995-2996` dan `:3117`).
- Aksi Practice "train" malah mendorong entri ke `S.Training` (`:3263`).

**Usulan:** satu laporan sesi dengan beberapa "track".

### 3.10 Lima sistem "hal yang menunggu tanggal"

Commitments, Hooks, Next (rencana NPC), Campus Events (`stale`), Projects (`Due`), dan Notices (`Until`). Semuanya sudah memakai `parseWhen`, tetapi status, reminder, dan daftar UI-nya berbeda.

Daftar "yang akan datang" bahkan ada empat versi:
- Planner, 14 hari (`30_notebook.js:133`)
- Notice Board, 10 hari (`:187`)
- `$ui.soon` engine, 7 hari (`:4346-4357`)
- `next` di bracelet

**Usulan:** satu model Agenda.

### 3.11 `<now>` menghitung ulang aturan engine saat prompt dibuat

Baris bond, trust, tension, kelas, dan kehadiran dihitung di EJS (`505:22-82`, `:112-170`) dari data mentah. Akibatnya aturan engine terduplikasi, dan bagian ini hanya bisa dites di dalam SillyTavern.

**Usulan:** engine menulis ringkasan `$ui.now`, dan EJS tinggal menampilkannya. Hasilnya satu sumber aturan yang bisa dites di Node.

### 3.12 Sistem informasi yang tidak saling menyambung

Rumours, lore tempat yang "terdengar", beat "overheard", Clues dan Mysteries, `Secrets_revealed`, serta `Knows` / `Known_facts`.

Contoh nyata: perk Mastery Knowledge (Encyclopaedic) hanya menulis log "this week's real lead is used" (`:3334`) dan tidak membuat apa pun di Mystery Board.

**Usulan:** jalur dari rumor atau lore ke Clue (lihat Bagian 2).

### 3.13 Hasil kompetisi tidak menyentuh sistem lain

Menang Kingdom hanya membayar poin (`:3607-3612`) dan membuka kastil di Avalon. Reputasi dan bond dengan rekan tim bergantung pada narrator melapor manual, padahal engine sudah tahu tim (`Competition.Team`) dan hasilnya.
