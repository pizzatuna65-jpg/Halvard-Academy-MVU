# Future plans (dicatat, belum dijadwalkan)

Daftar ide yang ras setujui untuk *nanti*, bukan sekarang. Sebelum dikerjakan: draft dulu (canon/desain) lalu approval ras.
Rencana yang sudah diterapkan dihapus dari file ini (riwayatnya ada di `CHANGELOG.md`): FP1 NPC initiative (v1.7.7),
FP2 pemilihan Student Council (v1.7.8), FP3 Student Council sebagai club pilihan {{user}} (ada di direktori club sejak v1.7.8), FP7 absensi, FP10 rekap mingguan dan FP12 batas NPC (v1.10.0), FP8 kesiapan ujian dan FP9 dorm rank (v1.10.1), FP11 alasan inisiatif (v1.10.2),
FP6 gift, ulang tahun, dan pesta (v1.8.0).

## Prioritas (kapan rencana ini mulai terasa oleh {{user}})

Label: **[SEKARANG]** terasa di Year 1 sejak awal, termasuk playtest berikutnya · **[YEAR 1]** terasa nanti tapi masih di Year 1 ·
**[YEAR 2]** baru terasa di campaign Year 2 · **[YEAR 3]** baru terasa di campaign Year 3. "Paling lambat" = tanggal game
ketika tanpa rencana ini ada yang kosong atau salah.

| Rencana | Label | Paling lambat | Alasan |
|---|---|---|---|
| FP4 Anggota baru tim rival | **[YEAR 2]** | Year 2 M9 W4 (Kingdom Competition) | Tim rival baru benar-benar tampil di Kingdom Competition. Sebelum itu entry tim hanya menulis "none on record yet". |
| FP5 Cohort 3 | **[YEAR 3]** | Year 3 M1 W1 Mon (Entrance Event) | Cohort 2 sudah naik sendiri. Yang kosong hanya first-year yang datang di Year 3. |

FP4 dan FP5 aman ditunda karena baru terasa pada tahun kampanye berikutnya. FP7–FP12 sudah diterapkan (v1.10.0–v1.10.2, `planning/DRAFT_batch_fp7_fp11.md`); urutan yang disarankan di sana:
FP7 + FP10 dalam satu rilis, lalu FP8 + FP9 bersama.

## FP4. Anggota baru tim akademi rival dari Year 2 [YEAR 2]
- Dicatat: 2026-09-27, oleh ras ("tim akademi rival yg year 3 ikut lulus jadi nanti year 2 tim baru yg gk pake year 3 dari year
  sebelumnya (new npc tpi itu urusan nanti)").
- Sudah ada (1.7.4): third-year rival lulus di akhir tahun ketiganya; entry tim di Year 2 menyebut siapa yang keluar dan bahwa
  akademi mengisi tempatnya ("none on record yet"). Year 2 kosong: Myrdath (Ines), Veyra (Cassius), Ashvale (Mirelle, Theodore).
  Year 3 kosong lagi: second-year Year 1 (Lucius, Dex, Morgana, Kira).
- Ide: NPC baru per tim (entry lore seperti rival lain, `Role: Student, <academy> Academy. <N> year, age A.`), masuk ke daftar tim
  dengan gerbang tahun kampanye (seperti cohort Halvard). Siapa kapten baru tiap tim.
- Terbuka [?]: berapa NPC per tahun; kapten baru; apakah mereka juga butuh voice canon.

## FP5. Cohort 3: first-year baru saat {{user}} di Year 3 [YEAR 3]
- Dicatat: 2026-09-27, oleh ras ("simpan apa yg saya rencanakan termasuk cohort year 3 (saat user year 3)").
- Catatan: cohort 2 (Linus, Maple, Nerys, Hadrian, Wren, Tsubaki) otomatis naik jadi second-year di Year 3. Yang kosong adalah
  first-year yang **datang** di campaign Year 3 (`data/cohorts.json` `"3": []`); tanpa cohort 3 Journal tetap menulis "a new class
  of first-years arrived", tapi tidak ada NPC bernama.
- Cara: playbook "Add an incoming first-year cohort" (HANDOFF §6), seperti cohort 2 di 1.7.0: draft `planning/DRAFT_cohort3_npcs.md`
  (lore, voice canon, Rank 8 branch, rewards, relasi ke NPC lama dan ke cohort 2), lore pass
  `source_original/npc_lore_cohort3_<tanggal>/`, id di `data/cohorts.json` `"3"`, potret.
- Terbuka [?]: berapa NPC; asrama; ikatan ke cohort 2 (adik kelas mereka) dan ke angkatan {{user}} (sekarang third-year).
