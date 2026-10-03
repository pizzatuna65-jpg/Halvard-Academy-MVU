# Rencana Batch Perbaikan (dari Audit Bagian 1)

Cara pakai: owner cukup bilang **"perbaiki batch N"**. Claude mengerjakan **hanya** batch itu, dalam satu sesi dan sebagai satu rilis, lalu mengubah status di tabel di bawah menjadi "selesai (versi X, commit Y)".

Nomor 1.x, 2.x, dan 3.x merujuk ke `AUDIT_2026-10-03_1_bug_efisiensi_integrasi.md`.

Bila konteks sesi hampir habis sebelum batch selesai, Claude berhenti di titik yang aman (tes lulus, sudah di-commit). Status batch ditulis "sebagian" beserta sisanya, dan batch dilanjutkan dengan perintah yang sama. Batch berikutnya tidak dimulai sebelum yang ini selesai.

## Status

| Batch | Isi | Dari item audit | Ukuran | Bergantung pada | Status |
|-------|-----|-----------------|--------|-----------------|--------|
| 1 | Semua bug: hotfix, aturan gameplay, bug kecil dan laten | 1.1–1.10, tabel Rendah | sedang | – | selesai (1.42.0, commit aa624d1) |
| 2 | Satu sumber: `shared.js` + `rollTable` (refactor murni) | 2.2–2.4, 2.8, 3.6 | sedang–besar | 1 | selesai (1.43.0, commit 2c8c928) |
| 3 | Laporan narrator yang diurus engine: ledger, Bag, `/Purchases`, sesi latihan gabungan | 2.5, 3.4, 3.5, 3.9 | sedang | 2 | selesai (1.45.0, commit 93b3ed3) |
| 4 | Modul Area untuk area luar: Sunreach, Avalon, hutan, airship, iklim, renderer UI | 2.1, 3.1, 3.7 | besar | 2, 3 | selesai (1.46.0, commit a10842e) |
| 5 | Kampus sebagai Area + `whereabouts` | 3.2, 3.3, 3.8 | sedang–besar | 4 | selesai (1.47.0, commit a354cc9) |
| 6 | Agenda + jalur informasi + kompetisi | 3.10, 3.12, 3.13 | sedang | 2 | selesai (1.44.0, commit 2759e6d) |
| 7 | `$ui.now`, Cast Sheet per NPC, diet state | 2.6, 2.7, 2.9, 3.11 | besar | 3, 5, 6 | selesai (1.48.0, commit caa1e45) |

Urutan wajib: 1 → 2. Setelah itu, batch 3 dan 6 bebas urutannya, lalu 4 → 5, dan 7 paling akhir.

## Aturan setiap batch (dari CLAUDE.md, selalu berlaku)

1. Sebelum mengubah kode, tulis fixture save rilis sekarang (`node tests/fixtures/make_save.cjs`). `tests/test_saves.cjs` harus tetap lulus.
2. Edit hanya sumber: template, `data/*.json`, dan tools. Jangan mengedit file hasil generate. Migrasi save masuk ke `stepMigrate`.
3. Refactor yang tidak boleh mengubah perilaku dibuktikan dengan `ENGINE_DIFF=<engine.js lama> npm test`. Perubahan perilaku dibuat di commit terpisah dalam batch yang sama.
4. Setiap bug yang diperbaiki mendapat satu tes regresi. Suite penuh dijalankan di akhir setiap batch.
5. Naikkan versi di `src/card/card.json`, jalankan `python tools/build_all.py` (`--lore` bila lore berubah), lalu perbarui CHANGELOG, HANDOFF, TEST_CHECKLIST (bagian live-only), dan INDEX/DECISIONS bila ada file atau keputusan baru. Setelah itu commit.
6. Aturan narrator yang berubah masuk ke kartu (lore 502/504/506), bukan preset.
7. Keputusan owner yang tercantum di sebuah batch: kalau tidak dijawab, dikerjakan sesuai usulan.

---

## Batch 1 — Semua bug (sedang)

Satu rilis berisi tiga commit: hotfix, aturan gameplay, dan bug kecil.

### Hotfix
- **1.1 Regex dialog.** Di `src/regex/index.json:145` dan `:161`, ganti `say\b` menjadi `say\\b`. Tambah tes: setiap `findRegex` bebas karakter kontrol, dan kedua regex cocok dengan `<say:Irene>` dan `</say>`.
- **1.3 Consumable.**
  - Pengurangan Qty (`engine.template.js:1540-1547`) memakai normalisasi `ik()` yang sama dengan filter (`:1526`).
  - Reminder R2 (`:4105`) juga memakai `ik()`.
- **1.5 Baris "not itemised" palsu.** `:3404-3417` dan `:3419-3428` membandingkan jumlah kemunculan teks (multiset), bukan himpunan.
- **1.10 Bag dipotong diam-diam.** `:3860-3865` menulis `_Log` dan toast yang menyebut item yang dibuang.
- **1.9 Pin dependensi.** `mvu_loader.js:1` dan `schema.js:1` dikunci ke commit yang sekarang termuat. Catat di DECISIONS §11, dan cek live di TEST_CHECKLIST.

### Aturan gameplay (perubahan perilaku, dicatat di CHANGELOG)
- **1.2 Status "sedang pergi".**
  - Buat `awayNow(c)`: aktif bila area luar sedang aktif, ada event kalender `away`, atau `Trip.Active`.
  - Ganti semua pengecekan `Trip.Active`, termasuk `birthdayParty` di `mood_gifts.js:64` (jam selesai pesta tidak boleh memakai jam malam kampus saat pergi).
  - `Trip.Active` direset otomatis, dengan log, bila pemain sudah di tempat kampus pada hari tanpa event `away`.
- **1.4 Hadiah.** `Kind gift`/`rank_gift` yang menyebut Item dari Bag mengurangi Qty, kecuali update itu sudah menguranginya (logika H2).
- **1.6 XP dari NPC absen.** XP untuk talk, hangout, study, help, dan gift mensyaratkan NPC hadir atau `wasHere`. Interaksi yang ditolak dicatat di log.
- **1.7 Bolos panjang.** Update lebih dari 6 jam yang kedua ujungnya di tempat yang dikenal peta tetapi bukan venue kelas mencatat bolos.
- **1.8 Hari mundur.** Hari yang mundur 1–2 hari tanpa kata lompatan waktu di prosa (`MISS_TIME_RX`) membuat jam dipertahankan dan dicatat di log.
- Perbarui aturan narrator di lore 502: Trip dan Interactions.

### Bug kecil, laten, dan kode mati
- Sleep quality dan toast cuaca langka di Sunreach memakai cuaca area (`engine.template.js:1497`, `:1308`).
- Override Student Council hari Sabtu P2 juga berlaku di UI (`tools/gen_ui.py:167`).
- Dossier membaca `NPC_status` lewat `npcStatus()` (`10_people.js:136-138`).
- Panel Battle memperhitungkan pengali angin, diskon Arcane scholar, dan syarat partner pact hadir (`40_activities.js:236-237`).
- Bonus Fortune proficiency di UI memakai batas yang sama dengan engine (`ui.template.js:1472`).
- `mergePark` tidak lagi menimpa nilai dengan default schema (`engine.template.js:792-798`).
- Batas `$ui.names` dan `$ui.lore` dinaikkan ke 200 (`schema.js:333`, `:336`).
- Hapus variabel mati: `MON_SAT`, `tensionBand`, `normP`, `wxBlk`, `OFF` di `stepTraining`, dan `pips`.

Keputusan owner: apakah surat atau obrolan jarak jauh boleh memberi XP kecil (usulan: tidak), dan apakah bolos lewat lompatan panjang dihukum (usulan: ya).

## Batch 2 — Satu sumber: `shared.js` + `rollTable` (sedang–besar, refactor)

Tidak boleh ada perubahan perilaku kecuali satu commit terakhir yang ditandai.

- File baru `src/scripts/shared.js`. Generator (`gen_engine.py`, `gen_ui.py`, `gen_mvu_entries.py`) menyuntikkannya ke engine, UI, bracelet, dan EJS 505. Isinya:
  - konstanta periode kelas, bulan ujian, musim, trip, dan warna dorm (dari `calendar.json` / `npcs.json`)
  - `classRole`, `councilRemedial`, band Trust/Tension, `npcStatus`, `splitLoc`/`placeOf`/`placeKey` (selalu dengan en dash), dan `itemKey`
  - `rollTable(pool, seedParts, {weights, cooldown, noRepeat, rate})`
- Semua salinan yang terdaftar di 2.2–2.4 diganti dengan isi `shared.js`.
- 2.8: teks `TRIP_INFO`, `COMP_TIERS`, jadwal Crowning/Kingdom, "Friday noon" di EJS, regex toko bracelet, `practiceNames`, dan tag hadiah toko dibuat dari data (tambah field di JSON bila perlu).
- 3.6: happenings, ambience, initiative, kehidupan kota Avalon dan Sunreach, airship, Expedition, gosip, flu, head cold, free period, dan paket dari rumah memakai `rollTable`. Seed dan urutan roll dipertahankan supaya swipe di chat lama tetap sama.
- Tes "satu sumber": gagal bila literal tabel musim atau jam periode muncul di luar `shared.js`.
- Bukti: `ENGINE_DIFF` identik, dan teks UI dan EJS dibandingkan sebelum dan sesudah.
- Commit terakhir (perubahan perilaku kecil): pengaturan frekuensi "Campus life" juga berlaku untuk roll area luar.

## Batch 3 — Laporan narrator yang diurus engine (sedang)

Satu kali pembaruan aturan narrator (lore 502/504/506) untuk semua perubahan di batch ini.

- **3.5 Ledger.** Helper `ledger(S, 'Points'|'Coin', delta, why)` menangani batas 20 baris dan teks unik. Semua penulisan yang terdaftar di 2.5 dipindah ke helper. Deteksi "not itemised" dan "uang tidak cukup" membaca catatan helper.
- **3.4 Bag.** Helper `bagTake`/`bagGive` dipakai consumables, gift, craft, penjualan apotek, paket dari rumah, dan Sunfizz.
- **`/Purchases`.**
  - Schema baru `[{Item, Qty, Shop, Price?}]`.
  - Engine mengecek harga (`SHOP_PRICE`), musim, lokasi toko, dan saldo. Item tanpa harga di daftar memakai `Price` dari narrator, dicatat sebagai harga cerita.
  - Reminder "shop:" diganti log penolakan.
- **3.9 Sesi latihan gabungan.**
  - Satu laporan `/Practice` dengan track (proficiency, mana, stamina, craft). `/Training` tetap diterima sebagai alias.
  - Satu pengecekan cedera dan kelelahan, dan satu aturan partner.
  - Batas mingguan setiap track tidak berubah. Migrasi tidak diperlukan.

Keputusan owner: penggabungan aturan partner (usulan: bonus partner Rank 4 berlaku untuk semua track di `rank4_partners.json`). Bila `/Purchases` bentrok dengan keputusan Price Guide di DECISIONS, owner cukup konfirmasi.

## Batch 4 — Modul Area untuk area luar (besar)

Batch terbesar. Kalau sesi tidak cukup, titik berhenti yang aman adalah setelah Sunreach dan Avalon selesai.

- **3.1:** kerangka `Area` di engine berisi parser tempat, formatter lokasi, satu Dijkstra, moda perjalanan (walk/ride/boat/tour), biaya lewat `ledger`, roll per jam lewat `rollTable`, jendela waktu, dan `$ui.area[id]`.
- Migrasi berurutan, masing-masing dibuktikan dengan `ENGINE_DIFF` atau daftar perbedaan yang dijelaskan:
  1. Sunreach dan Avalon. Pickpocket dan hustler menjadi satu mekanik "pencurian".
  2. Hutan (Expedition).
  3. Airship.
- `$eng.exp`/`cap`/`sr` dan `$ui.forest`/`capital`/`sunreach`/`airship` dari save lama dimigrasi di `stepMigrate`.
- **3.7:** profil iklim per area. `forestWx` dan `srWx` jadi data; efek cuaca, tidur, dan toast membaca iklim area.
- **2.1 sisi UI:** satu renderer tab peta untuk semua area, memakai rute yang sudah dihitung engine. Satu blok EJS untuk area luar.
- Live check di SillyTavern: tab peta keempat area.

## Batch 5 — Kampus sebagai Area + `whereabouts` (sedang–besar)

- **3.2:** graf `locations.json` `near` dipakai engine:
  - "Walks from here" di `<now>` kampus
  - sisa perjalanan (`owe`) bila lokasi berpindah terlalu cepat
  - stamina kecil untuk perjalanan jauh
- `canonLocation` / `yearFloorLocation` menjadi parser area kampus. Reminder R3/R4 disesuaikan.
- **3.3:** `awayNow()` dari Batch 1 diturunkan dari Area aktif.
- **3.8:** `whereabouts(id, waktu)` dari haunts, jadwal kelas dan klub, rencana Next, janji temu, `NPC_status`, `Graduated`/`ARRIVES`, flu, dan tabel `meet` area. Hasilnya ditulis ke `$ui.here`, dan dipakai oleh kehadiran di EJS 505 (menggantikan `505:11-82`), Regulars di kartu peta, pool initiative, dan pertemuan di area luar.
- Bukti: daftar "Likely around" untuk sejumlah skenario fixture dibandingkan sebelum dan sesudah.

Keputusan owner: stamina untuk perjalanan jauh di kampus (usulan: 5% per jam jalan, sama dengan Avalon).

## Batch 6 — Agenda + informasi + kompetisi (sedang)

- **3.10 Agenda.** Satu penanda tanggal (`$abs`), status (waiting/due/overdue/stale/done), dan reminder untuk Commitments, Hooks, Next, Projects (`Due`), Notices (`Until`), dan surat dari rumah. Field di state tetap sama.
- Satu feed "yang akan datang" (`$ui.soon`) dipakai Planner, Notice Board, bracelet `next`, dan `<now>`.
- **3.12 Informasi.** Rumor dan lore yang sudah terdengar bisa dicatat sebagai Clue lewat player tool. Perk Encyclopaedic membuat satu Clue nyata per minggu (`engine.template.js:3334`).
- **3.13 Kompetisi.** Hasil kompetisi menjadi deed reputasi otomatis beserta "harga"-nya. Rekan tim (`Competition.Team`) mendapat bond XP "bertarung bersama" sekali per tier.
- Aturan narrator di lore 502 diperbarui.

Keputusan owner: angka reputasi kompetisi dan bentuk harga reputasi tinggi (usulan: ekspektasi staf naik; kekalahan berikutnya memotong Academy lebih besar).

## Batch 7 — `$ui.now`, Cast Sheet, diet state (besar)

- **3.11:** engine menulis `$ui.now`: baris kelas dan kehadiran, bond/trust/tension per orang yang hadir, area, dan ambience. EJS 505 hanya menampilkannya.
- **2.7:** Cast Sheet 509 dipecah per NPC (satu entri per NPC, di-gate oleh `$ui.cast`). Verifikasi dulu cara Prompt Template mengevaluasi banyak entri EJS. Gate 510 tetap bekerja.
- Bukti: teks `<now>` dan `<cast>` identik sebelum dan sesudah untuk sejumlah skenario fixture, dengan pembanding EJS di tes. Live check: bandingkan prompt di SillyTavern.
- **2.6:** field `$ui` yang hanya dipakai UI dihitung ulang di UI, tidak disimpan per pesan: `moods.reasons`, salinan `file`, `craft` lengkap, `grades.why`, `practice`, `walks`/`near`. Ukur `stat_data` per pesan dan file chat setelah 200 pesan, sebelum dan sesudah, lalu catat di CHANGELOG.
- **2.9:**
  - cache cuaca tidak dikosongkan saat membangun happenings tahunan
  - `eld_seen` dipangkas
  - `themed()` dilewati bila tema default

Titik berhenti yang aman bila sesi tidak cukup: setelah `$ui.now` dan Cast Sheet selesai. Diet state boleh menyusul.
