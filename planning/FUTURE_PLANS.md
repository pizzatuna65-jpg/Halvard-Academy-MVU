# Future plans dan item terbuka

Satu-satunya daftar pekerjaan yang **belum** dikerjakan. Aturan: begitu sesuatu diterapkan, hapus dari file ini (riwayatnya ada di
`CHANGELOG.md` dan git). Canon/desain baru: draft dulu di `planning/DRAFT_<topik>.md`, terapkan setelah owner bilang "proceed", lalu
hapus draft itu di rilis yang sama. Pengecekan live di SillyTavern ada di `docs/TEST_CHECKLIST.md`, bukan di sini.

## 1. Rencana owner (dicatat, belum dijadwalkan)

| Rencana | Label | Paling lambat | Alasan |
|---|---|---|---|
| FP4 Anggota baru tim rival | **[YEAR 2]** | Year 2 M9 W4 (Kingdom Competition) | Tim rival baru benar-benar tampil di Kingdom Competition. Sebelum itu entry tim hanya menulis "none on record yet". |

### FP4. Anggota baru tim akademi rival dari Year 2 [YEAR 2]
- Dicatat: 2026-09-27, oleh ras ("tim akademi rival yg year 3 ikut lulus jadi nanti year 2 tim baru yg gk pake year 3 dari year
  sebelumnya (new npc tpi itu urusan nanti)").
- Sudah ada (1.7.4): third-year rival lulus di akhir tahun ketiganya; entry tim di Year 2 menyebut siapa yang keluar dan bahwa
  akademi mengisi tempatnya ("none on record yet"). Year 2 kosong: Myrdath (Ines), Veyra (Cassius), Ashvale (Mirelle, Theodore).
  Year 3 kosong lagi: second-year Year 1 (Lucius, Dex, Morgana, Kira).
- Ide: NPC baru per tim (entry lore seperti rival lain, `Role: Student, <academy> Academy. <N> year, age A.`), masuk ke daftar tim
  dengan gerbang tahun kampanye (seperti cohort Halvard). Siapa kapten baru tiap tim.
- Terbuka [?]: berapa NPC per tahun; kapten baru; apakah mereka juga butuh voice canon.

## 2. Ide yang dicatat tapi tidak dipilih (butuh "proceed" owner kalau mau dibuat)
- **Patroli jam malam** (E2, 2026-09-28): risiko tertangkap yang di-seed saat {{user}} di luar setelah curfew. Sejak 1.18.0 hanya ada
  pengingat curfew, tanpa hukuman otomatis.
- **Kerja paruh waktu terjadwal** (E7, 2026-09-28): shift tetap sebagai sumber uang untuk dorm rank rendah.
- **Kelas minggu pertama yang di-script** (M1 W1 Tue–Sat, 14 sesi; per asrama untuk kelas [D]; PR opsional ke Commitments).
- **Gate map lain** (saran 1.24.0; owner 1.24.1 hanya memilih Fishing House, Mall dan kastil dibatalkan): Swimming Pool ← Gymnasium;
  Ring Dining Hall/Portrait Hall ← Arbiter Hall; Sparring Pavilion ← Combat Grounds; Undercroft seperti Rooftop; Broken Statue
  setelah didengar.

- **Bonus shift bell-keeper** (sisa DRAFT_location_activities 1.31.0): draft menjanjikan "event minggu depan muncul lebih awal",
  tapi Notebook sudah menampilkan kalender 14 hari dan kalender penuh; kalau mau, ganti dengan info lain (mis. happening besok).
- **Portrait Hall, Broken Statue, sumpah di Cathedral** (activity yang owner scrap 2026-09-30): tetap tanpa activity.

- **Audit preset ke-2, tingkat 2** (owner 2026-10-04: setelah uji live tingkat 1 di 1.52.2): memangkas isi unik modul upstream,
  ±900–1.000 token: Don't Speak Like a Therapist (padatkan daftar gerakan dan REDIRECT, ±200), Monomania (tiga contoh perbaikan dan
  paragraf penutup, ±150), NPC Voice (contoh CAPS dan "grape soda", ±120), Anti-Sycophancy (padatkan prosedur, ±100), Human Vocal
  Limits, HQ NPC Genesis dan paragraf "Scene end" Scene Engine (±300). Risiko: gaya Gemini bisa bergeser; port RF berikutnya lebih
  repot. Detail: `git show bdcc889:planning/DRAFT_preset_audit_2.md` (dihapus di 1.52.2).

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
- Preset: varian MAX CoT belum diadaptasi (hanya BOLT). Micro CoT tidak perlu: sejak 1.52.2 BOLT (±1.810 token) sudah tidak lebih berat dari Micro (±1.840).

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
- Airship (1.40.0, `data/airship.json`): jam terbang tiap acara, momen langit 15%/jam, panggung 30%/jam, hold 30%/jam, mandi 10 menit,
  pindah tempat 2 menit, `soon` 90 menit sebelum berangkat. Mid-Year Break dan World Competition belum jadi penerbangan.
- Sunreach Bay (1.41.0, `data/sunreach.json` `rates`, `games`, `meet`, `weather`): jalan 5%/jam, kereta 6, water taxi 8, kapal tur 15
  koin, taruhan dadu 45%/kartu 48%/roda 8% (maks 200), atraksi 20%, penipu 8%, siswa akademi lain 25%, siswa Halvard 20%, laut 50%,
  Leviathan 5% (sekali per Trip), curfew 22:00–07:00, cuaca 26–31 °C, menit jalan antar pin, tabel siapa di mana.
- UI: `latestState()` bisa mundur banyak floor bila hanya floor awal yang memegang state (belum diukur di ST).
