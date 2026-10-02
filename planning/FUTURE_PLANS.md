# Future plans dan item terbuka

Satu-satunya daftar pekerjaan yang **belum** dikerjakan. Aturan: begitu sesuatu diterapkan, hapus dari file ini (riwayatnya ada di
`CHANGELOG.md` dan git). Canon/desain baru: draft dulu di `planning/DRAFT_<topik>.md`, terapkan setelah owner bilang "proceed", lalu
hapus draft itu di rilis yang sama. Pengecekan live di SillyTavern ada di `docs/TEST_CHECKLIST.md`, bukan di sini.

## 1. Rencana owner (dicatat, belum dijadwalkan)

| Rencana | Label | Paling lambat | Alasan |
|---|---|---|---|
| FP4 Anggota baru tim rival | **[YEAR 2]** | Year 2 M9 W4 (Kingdom Competition) | Tim rival baru benar-benar tampil di Kingdom Competition. Sebelum itu entry tim hanya menulis "none on record yet". |
| FP7 Peta luar kampus (Grup D) | **[DRAFT]** | Area 3 Y1 M11 W2 (Trip) | Area 1 selesai di 1.38.0, area 2 di 1.39.0. Per area: draft, prompt peta, data, engine, UI, rilis. |

### FP4. Anggota baru tim akademi rival dari Year 2 [YEAR 2]
- Dicatat: 2026-09-27, oleh ras ("tim akademi rival yg year 3 ikut lulus jadi nanti year 2 tim baru yg gk pake year 3 dari year
  sebelumnya (new npc tpi itu urusan nanti)").
- Sudah ada (1.7.4): third-year rival lulus di akhir tahun ketiganya; entry tim di Year 2 menyebut siapa yang keluar dan bahwa
  akademi mengisi tempatnya ("none on record yet"). Year 2 kosong: Myrdath (Ines), Veyra (Cassius), Ashvale (Mirelle, Theodore).
  Year 3 kosong lagi: second-year Year 1 (Lucius, Dex, Morgana, Kira).
- Ide: NPC baru per tim (entry lore seperti rival lain, `Role: Student, <academy> Academy. <N> year, age A.`), masuk ke daftar tim
  dengan gerbang tahun kampanye (seperti cohort Halvard). Siapa kapten baru tiap tim.
- Terbuka [?]: berapa NPC per tahun; kapten baru; apakah mereka juga butuh voice canon.

### FP7. Peta luar kampus (Grup D) [DRAFT]
- Dicatat: 2026-09-30, oleh ras (poin 12, plus detail poin 4 dan 13). Dipecah per area: 2026-10-02 (owner).
- Tiga peta di luar kampus, masing-masing dengan lokasi sendiri, dan pemilih peta (Campus / area) di UI yang aktif saat {{user}} di
  luar kampus. Draft area berikutnya: `planning/DRAFT_outside_maps.md` (area 1 dan 2 sudah diterapkan dan dihapus; file dibuat lagi untuk area 3). Prompt gambar dan blok gaya:
  `planning/MAP_PROMPTS_outside_maps.txt`.
- **Urutan area** (mengikuti kalender): 1. Grand Vast Forest (Expedition M2 W3); 2. ibukota (Crowning Day M4 W2, juga Kingdom
  Competition M9 W4: arena, hotel); 3. Sunreach Bay (Academy Trip M11 W2–W3: sisi siang/malam, kasino terlarang, jadwal Trip
  Minggu–Rabu yang masih umum).
- **Setiap area melewati enam langkah ini, berurutan. Area berikutnya baru dimulai setelah rilis area sebelumnya.**
  1. **Draft** (aku tulis, owner approve): tempat dan tetangganya, jam jalan dan tabel jarak dari mana pun ke mana pun, lore tiap
     tempat (English), aturan narator, dan sistem khusus area itu. Selesai saat owner bilang "proceed".
  2. **Prompt peta** (aku tulis, owner membuat gambar): prompt ChatGPT image 1536×1024 dengan gaya peta Halvard dan posisi tiap
     tempat dalam persen. Owner membuat gambarnya, upload PNG asli ke repo `eldrasil-assets`, lalu aku konversi
     (`tools/process_assets.py`) dan pin `base_url` di `data/assets_manifest.json` ke commit baru (tidak pernah `@main`).
  3. **Data**: lore lewat pipeline (`merge_lorebooks.py` → `curate_data.py`), entry area aktif hanya saat acaranya (gate EJS
     kalender, nol token di luar itu); data area di `data/<area>.json` (tempat, tetangga, jam, angka); pin dari gambar (persen).
  4. **Engine**: `activeMap(S)` (dari kalender dan `Trip`); `World.Location` ditulis "<area> — <tempat>"; jarak dari tempat sekarang
     di `<now>`; sistem khusus area; state baru lewat `stepMigrate`. Area 1 juga membangun bagian yang dipakai ulang area 2 dan 3.
  5. **UI**: pemilih peta di `src/ui/parts/20_map.js`; kartu tempat; titik terkunci yang terbuka saat tempat tetangganya didatangi;
     `mapFor` (varian musim/event) tetap khusus kampus; warna peta tidak ikut tema.
  6. **Rilis**: save fixture dulu, tes area itu (dan bahwa kampus tidak berubah), bump versi, `build_all.py --lore`, CHANGELOG,
     HANDOFF, INDEX/DECISIONS, TEST_CHECKLIST (cek live), commit. Bagian draft area itu dihapus; area terakhir menghapus file draft
     dan FP7.
- **Status:**
  - Area 1 Grand Vast Forest: **selesai, v1.38.0** (`data/expedition.json`). Bagian engine yang dipakai ulang area 2 dan 3:
    `forestPlace`/`stepExpedition` (pola lokasi, jalan dan stamina), `renderForest` (tab peta), gate lore `$ui.<area>.on`.
  - Area 2 Avalon, ibukota: **selesai, v1.39.0** (`data/avalon.json`). Peta kota seperti peta kampus (pin berisi lokasi, semua pin
    umum terbuka, pin terkunci tidak tampil, lokasi tersembunyi tampil setelah dikunjungi); `stepCapital` (jalan, kereta, White Line,
    muster, kocokan kehidupan kota per jam); `renderCapital`. Area 3 bisa memakai pola kota ini untuk sisi siang/malam Sunreach.
  - Area 3 Sunreach Bay: belum.

## 2. Ide yang dicatat tapi tidak dipilih (butuh "proceed" owner kalau mau dibuat)
- **Patroli jam malam** (E2, 2026-09-28): risiko tertangkap yang di-seed saat {{user}} di luar setelah curfew. Sejak 1.18.0 hanya ada
  pengingat curfew, tanpa hukuman otomatis.
- **Kerja paruh waktu terjadwal** (E7, 2026-09-28): shift tetap sebagai sumber uang untuk dorm rank rendah.
- **Kelas minggu pertama yang di-script** (M1 W1 Tue–Sat, 14 sesi; per asrama untuk kelas [D]; PR opsional ke Commitments).
- **Hemat token:** sembunyikan Clues dari thread misteri yang sudah selesai.
- **Gate map lain** (saran 1.24.0; owner 1.24.1 hanya memilih Fishing House, Mall dan kastil dibatalkan): Swimming Pool ← Gymnasium;
  Ring Dining Hall/Portrait Hall ← Arbiter Hall; Sparring Pavilion ← Combat Grounds; Undercroft seperti Rooftop; Broken Statue
  setelah didengar.

- **Bonus shift bell-keeper** (sisa DRAFT_location_activities 1.31.0): draft menjanjikan "event minggu depan muncul lebih awal",
  tapi Notebook sudah menampilkan kalender 14 hari dan kalender penuh; kalau mau, ganti dengan info lain (mis. happening besok).
- **Portrait Hall, Broken Statue, sumpah di Cathedral** (activity yang owner scrap 2026-09-30): tetap tanpa activity.

## 3. Sisa audit 2026-09-29 (sengaja ditunda)
- **A8** Cast Sheet 509 (±515 KB EJS): pecah per NPC hanya kalau terbukti ada lag saat prompt dibangun di ST (compile lokal ±7,7 ms).
- **A10** PNG kartu ±8 MB (JSON disematkan dua kali, `chara` + `ccv3`): `chara` ringkas hanya setelah kompatibilitas pembaca v2 dicek.

## 4. Keputusan yang masih menunggu owner
- Pin dependensi MVU / mvu_zod ke commit yang sudah dites (`schema.js` dan `mvu_loader.js` memuat default branch; F12 menunjukkan
  perubahan helper bisa diam-diam mengubah perilaku). Perlu pasangan commit yang dites di ST dulu.
- Siklus hidup {{user}} setelah Year 3 (lulus / dikeluarkan / mengulang). Sejak 1.7.4 Year naik otomatis; payout tetap jalan. Owner:
  "biarkan dulu".
- Siswa yang ditahan cerita (dihapus dari `Campus_State.Graduated`) tidak lulus otomatis di tahun berikutnya (roster: "repeating").
- Review spoiler: `data/field_overrides.json` dan `data/_review_sensitive_flags.json` (tertunda sejak Batch 1).
- Preset: varian MAX dan Micro CoT belum diadaptasi (hanya BOLT).

## 5. Angka yang bisa disetel setelah playtest
- Cuaca dan kondisi: bobot cuaca dan rare event, `FC_TRUE` 75, ambang kondisi (20/5/30/60 menit, 0/8/28 °C), peluang Head cold,
  gelombang flu, pengali tidur, jendela hook (−30 menit / +3 jam) dan umur "old" (14 hari), umur rumor (3 / 21), Bag 40, hooks 15.
- Sistem: ambang/cap reputasi dan bonus Academy +5, Tension tinggi 70, Krieg +14, persen training (sebagian bisa diubah pemain di
  Settings, `data/tuning.json`), payout, cap bond harian, pemulihan tidur/istirahat, cap 40 HP, kenaikan Dove attention.
- Memori: `HAPPEN_RATE`, kedalaman trim 24, jendela Journal 30, `FACTS_VISIBLE` 10, cap Clues 40.
- Proficiency dan crafting (draft proficiency 1.25–1.30): ambang XP (10/30/60/100/150), cap mingguan 6 dan pace, XP per sumber,
  modifier Fortune per rank dan cap +20, DC dan band crafting, dosis dan yield, harga jual, upah menagerie, bobot grade 50/30/20 dan
  30/50/20, roll hari ujian (±4/±8), batas A/B/C/D, bonus bond Society, XP masterwork 3, daftar bangsawan untuk Consummate.
- Lokasi (1.31.0): pengali tempat pemulihan dan aturannya (`data/restore_places.json`), paket surat ke rumah (50/30/20, 10–30
  coin, `data/letters_home.json`), upah bell-keeper 30, gosip 60% (`ambience.json` `lore_places`), Trust Old Hut +1 per bulan.
- Expedition (1.38.0, `data/expedition.json` `rates`, `weather`): peluang target 3% + 3%/jam (maks 24%), malam ×0.5, jejak 20%,
  encounter 10%/15%, Wendigo 1%, jalan 8%/jam, mencari 3%/jam, pengali spora/panjat/menyeret 1.5, hujan/malam 1.25, cuaca hutan
  (24–29 °C, hujan sore 70%), glimpse beast dilindungi 15%/jam di Old Heart, jam-jam jalan antar tempat.
- Avalon (1.39.0, `data/avalon.json` `rates`, `crowning`, `legs`): jalan 5%/jam, keramaian ×1.5 (10:00–13:00), kereta 10 coin,
  copet 8% (50% ketahuan, 10–25% koin, maks 300), prosesi 10%, atraksi 20%, siswa akademi lain 25%, Tsubaki 10%, pencari bakat
  15%, razia Rookery 5% (lolos 60%), jam Crowning Day (09:30, 10:00, 11:00, 11:30–15:30, 16:00), menit jalan antar pin.
- UI: `latestState()` bisa mundur banyak floor bila hanya floor awal yang memegang state (belum diukur di ST).
