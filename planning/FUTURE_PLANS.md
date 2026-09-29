# Future plans dan item terbuka

Satu-satunya daftar pekerjaan yang **belum** dikerjakan. Aturan: begitu sesuatu diterapkan, hapus dari file ini (riwayatnya ada di
`CHANGELOG.md` dan git). Canon/desain baru: draft dulu di `planning/DRAFT_<topik>.md`, terapkan setelah owner bilang "proceed", lalu
hapus draft itu di rilis yang sama. Pengecekan live di SillyTavern ada di `docs/TEST_CHECKLIST.md`, bukan di sini.

## 1. Rencana owner (dicatat, belum dijadwalkan)

| Rencana | Label | Paling lambat | Alasan |
|---|---|---|---|
| FP4 Anggota baru tim rival | **[YEAR 2]** | Year 2 M9 W4 (Kingdom Competition) | Tim rival baru benar-benar tampil di Kingdom Competition. Sebelum itu entry tim hanya menulis "none on record yet". |
| FP5 Cohort 3 | **[YEAR 3]** | Year 3 M1 W1 Mon (Entrance Event) | Cohort 2 sudah naik sendiri. Yang kosong hanya first-year yang datang di Year 3. |

### FP4. Anggota baru tim akademi rival dari Year 2 [YEAR 2]
- Dicatat: 2026-09-27, oleh ras ("tim akademi rival yg year 3 ikut lulus jadi nanti year 2 tim baru yg gk pake year 3 dari year
  sebelumnya (new npc tpi itu urusan nanti)").
- Sudah ada (1.7.4): third-year rival lulus di akhir tahun ketiganya; entry tim di Year 2 menyebut siapa yang keluar dan bahwa
  akademi mengisi tempatnya ("none on record yet"). Year 2 kosong: Myrdath (Ines), Veyra (Cassius), Ashvale (Mirelle, Theodore).
  Year 3 kosong lagi: second-year Year 1 (Lucius, Dex, Morgana, Kira).
- Ide: NPC baru per tim (entry lore seperti rival lain, `Role: Student, <academy> Academy. <N> year, age A.`), masuk ke daftar tim
  dengan gerbang tahun kampanye (seperti cohort Halvard). Siapa kapten baru tiap tim.
- Terbuka [?]: berapa NPC per tahun; kapten baru; apakah mereka juga butuh voice canon.

### FP5. Cohort 3: first-year baru saat {{user}} di Year 3 [YEAR 3]
- Dicatat: 2026-09-27, oleh ras ("simpan apa yg saya rencanakan termasuk cohort year 3 (saat user year 3)").
- Catatan: cohort 2 (Linus, Maple, Nerys, Hadrian, Wren, Tsubaki) otomatis naik jadi second-year di Year 3. Yang kosong adalah
  first-year yang **datang** di campaign Year 3 (`data/cohorts.json` `"3": []`); tanpa cohort 3 Journal tetap menulis "a new class
  of first-years arrived", tapi tidak ada NPC bernama.
- Cara: playbook "Add an incoming first-year cohort" (`docs/BUILD.md` §4), seperti cohort 2 di 1.7.0: draft
  `planning/DRAFT_cohort3_npcs.md` (lore, voice canon, Rank 8 branch, rewards, relasi ke NPC lama dan ke cohort 2), lore pass
  `source_original/npc_lore_cohort3_<tanggal>/`, id di `data/cohorts.json` `"3"`, potret.
- Terbuka [?]: berapa NPC; asrama; ikatan ke cohort 2 (adik kelas mereka) dan ke angkatan {{user}} (sekarang third-year).

## 2. Ide yang dicatat tapi tidak dipilih (butuh "proceed" owner kalau mau dibuat)
- **Patroli jam malam** (E2, 2026-09-28): risiko tertangkap yang di-seed saat {{user}} di luar setelah curfew. Sejak 1.18.0 hanya ada
  pengingat curfew, tanpa hukuman otomatis.
- **Kerja paruh waktu terjadwal** (E7, 2026-09-28): shift tetap sebagai sumber uang untuk dorm rank rendah.
- **Kelas minggu pertama yang di-script** (M1 W1 Tue–Sat, 14 sesi; per asrama untuk kelas [D]; PR opsional ke Commitments).
- **Hemat token:** sembunyikan Clues dari thread misteri yang sudah selesai.
- **Gate map lain** (saran 1.24.0; owner 1.24.1 hanya memilih Fishing House, Mall dan kastil dibatalkan): Swimming Pool ← Gymnasium;
  Ring Dining Hall/Portrait Hall ← Arbiter Hall; Sparring Pavilion ← Combat Grounds; Undercroft seperti Rooftop; Broken Statue dan
  Spirit House setelah didengar.

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
- UI: `latestState()` bisa mundur banyak floor bila hanya floor awal yang memegang state (belum diukur di ST).
