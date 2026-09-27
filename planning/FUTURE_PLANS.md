# Future plans (dicatat, belum dijadwalkan)

Daftar ide yang ras setujui untuk *nanti*, bukan sekarang. Sebelum dikerjakan: draft dulu (canon/desain) lalu approval ras.

## Prioritas (kapan rencana ini mulai terasa oleh {{user}})

Label: **[SEKARANG]** terasa di Year 1 sejak awal, termasuk playtest berikutnya · **[YEAR 1]** terasa nanti tapi masih di Year 1 ·
**[YEAR 2]** baru terasa di campaign Year 2 · **[YEAR 3]** baru terasa di campaign Year 3. "Paling lambat" = tanggal game
ketika tanpa rencana ini ada yang kosong atau salah.

| Rencana | Label | Paling lambat | Alasan |
|---|---|---|---|
| FP1 NPC datang mencari {{user}} | **[SEKARANG]** | tidak ada tenggat (fitur tambahan) | Berlaku untuk bond Rank 3+, dan Etnie sudah Rank 3 sejak bertemu. Tanpa ini tidak ada yang rusak, tapi Stage "seeks {{user}} out" hanya bergantung pada ingatan AI sejak minggu pertama. |
| FP3 Student Council sebagai club | **[SEKARANG]** jika ingin bisa dipilih di Year 1; kalau tidak, **[YEAR 2]** | Year 1 M1 W1 Fri 18:00 (pendaftaran club ditutup), atau Year 2 M1 W1 Fri | Club dipilih di minggu pertama. Kalau masuknya lewat pemilihan (FP2), otomatis ikut FP2 ke Year 2. |
| FP2 Pemilihan Student Council President | **[YEAR 2]** | Year 2 M1 W2 (usulan tanggal) | Di Year 1 Irene masih President. Kekosongan baru muncul setelah Irene dan Caspian lulus (Year 1 M12 W1 Mon). |
| FP4 Anggota baru tim rival | **[YEAR 2]** | Year 2 M9 W4 (Kingdom Competition) | Tim rival baru benar-benar tampil di Kingdom Competition. Sebelum itu entry tim hanya menulis "none on record yet". |
| FP5 Cohort 3 | **[YEAR 3]** | Year 3 M1 W1 Mon (Entrance Event) | Cohort 2 sudah naik sendiri. Yang kosong hanya first-year yang datang di Year 3. |

Aman ditunda: FP2, FP4, FP5 (tidak ada yang terasa di Year 1). Dikerjakan lebih dulu: FP1, dan FP3 hanya kalau Student Council harus
bisa dipilih sejak Year 1.

## FP1. NPC datang mencari {{user}}, dipicu engine [SEKARANG]
- Dicatat: 2026-09-26, oleh ras ("catat point d untuk future plan (belum tentu skrg)").
- Asal: thread perbandingan project, poin D (`/mnt/project-files/comparisons/perbandingan_project_lain.md` §3.D).
  Terinspirasi MVU Game Maker ("partner-initiated actions") dan Multihog DnD ("world runs without you").
- Masalah: Stages di Cast Sheet sudah menulis "seeks {{user}} out" (Rank 3–5), tapi itu bergantung AI ingat; tidak ada pemicu.
- Ide: engine memilih secara ter-seed (`$eng.seed` + hari; tanpa `Math.random`) 0–1 NPC per hari
  (Rank ≥ 3, tidak ada di scene), bobot menurut openness/kategori (NPC withdrawn jarang), lalu menaruh Hook di `<now>`:
  "X is looking for {{user}} today (reason from their Stage)". Murah token.
- Batasan: hormati Tension (≥ 70 = bukan kunjungan ramah) dan kepribadian NPC (mekanik tidak boleh memaksa NPC
  bertindak di luar karakter). Alasan per NPC mengikuti Stage/voice canon di `data/npc_canon.json`.
- Terbuka [?]: berapa sering (per hari/minggu), boleh dimatikan lewat Features settings, apakah alasan kunjungan
  perlu canon baru per NPC (kalau ya: draft per NPC dulu).
- Thread: desain di "Brainstorming Halvard Academy", implementasi di "Lanjutkan progress Halvard Academy".

## FP2. Event pemilihan Student Council President [YEAR 2]
- Dicatat: 2026-09-27, oleh ras (review Year 2: "nanti ada rencana untuk add event student council president election").
- Asal: bug hunt Year 2 (rilis 1.7.4, `planning/DRAFT_year2.md` no. 2). Irene (President) dan Caspian (Vice President) sama-sama
  third-year, jadi keduanya lulus di akhir Year 1; lore uid 6 bilang "elected yearly", tapi kalender belum punya pemilihan.
  Sampai event ini ada, Year 2 tidak punya President/VP di roster.
- Ide: event di kalender (usul: Month 1 Week 2, setelah Entrance Event), baris di kalender uid 134 dan `EVENTS` engine.
- Terbuka [?]: tanggal; kandidat (dari third-year baru: Dante, Kanae, Saffi, Lenna, Florian, Idris, Tilly); apakah {{user}} bisa
  mencalonkan diri atau ikut kampanye; siapa yang menang (canon atau hasil story); pemilihan tiap tahun (Year 3 juga).

## FP3. Student Council sebagai club pilihan {{user}} [SEKARANG] / [YEAR 2]
- Dicatat: 2026-09-27, oleh ras ("student council bisa jadi club pilihan user").
- Ide: Student Council muncul sebagai pilihan club (`Player.Profile.Club`, daftar club di UI/peta), dengan tugasnya dari lore uid 6
  (administrasi club, event, disiplin, mediasi antar asrama).
- Terbuka [?]: cara masuk (daftar di club sign-up week, ditunjuk, atau lewat pemilihan FP2); boleh merangkap club lain;
  efek ke reputasi (Academy/Student) dan ke payout; tempat rapat (Student Council Chamber).

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
