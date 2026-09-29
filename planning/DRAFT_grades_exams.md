# DRAFT — Nilai dan ujian dengan efek nyata (2026-09-29, card 1.14.4)

Status: **DITERAPKAN di card 1.15.0 (2026-09-29).** Owner: "semua setuju kecuali poin 2"; [?2] dijawab "a dan b" (Fortune +10 di
bidang mata pelajaran dan tutoring berbayar, di atas +1 XP) dan "kalau nilai b dapat +1 xp juga". Perbedaan dari draft ini:
remedial dihitung hadir kalau dihapus paling lambat tiga jam setelah mulai (sebuah janji temu sudah overdue begitu dimulai); kondisi
hari ujian dibaca selama update berakhir paling lambat enam jam setelah ujian selesai. Rincian dan test: CHANGELOG 1.15.0,
`tests/test_grades_v1150.cjs`.
Asal: pertanyaan owner "sistem grades dan exam sekarang buat apa? apakah hanya flavor?", lalu "buat grades/exams ada efek
sungguhan lalu kaitkan dengan fitur study dan fitur lainnya yg bisa terkait".

Keputusan §4 / desain yang disentuh:
- **FP8/FP9 (1.10.1, `DRAFT_batch_fp7_fp11.md`):** dorm rank tidak lagi dihitung dari tingkat kesiapan, tetapi dari **nilai**.
  Nilai itu sendiri tetap bertumpu pada tingkat kesiapan. Batas jam (Settings `study_tiers`) dan band rank tidak berubah.
- **Reputasi (`docs/design/reputation.md`):** event ujian (Academy +15/+8/+3, −8/−15; Doves +8 untuk DMD) sekarang ditulis
  **engine**, bukan dilaporkan narator. Angkanya tetap. Pola ini sama dengan absensi di 1.10.0.
- **Bond rewards (`data/bond_rewards.json`):** teks Gareth R10, Layla R10, draught Mimosa dan Alyssa R10 sudah menyebut ujian.
  Draft ini memberi keempatnya efek angka. Teksnya tidak diubah.
- **Bonds:** XP tetap hanya dari interaksi yang dilaporkan. N3 hanya menambah modifier pada talk/hangout yang dilaporkan.
- **Deterministic / replay-safe:** tetap. Semua nilai dihitung dari state dan seed, tanpa `Math.random`.

---

## 1. Keadaan sekarang (ringkas)

| Bagian | Siapa yang menulis | Efek |
|---|---|---|
| `Player.Academics.Grades` / `Exams` | narator, bebas | **tidak ada** (hanya tampil di Student file dan `<current_state>`) |
| Jam belajar → tingkat kesiapan (FP8) | engine | `<now>` di minggu ujian; narator diminta "within one step" |
| Results day → `Dorm_rank` (FP9) | engine, dari tingkat kesiapan | payout bulanan 300–3000, Academy +5 kalau naik band |
| Event rep ujian | narator via `/Rep_events` | Academy/Doves, sering lupa dilaporkan |

Masalahnya: nilai yang ditulis narator dan dorm rank bisa bertentangan. Nilai per mata pelajaran juga tidak berarti apa-apa.

## 2. Desain

### N1. Nilai per mata pelajaran dihitung engine
- **Skala:** A (top of the year), B (above average), C (passed), D (weak pass), F (failed). Skala ini sesuai dengan kategori
  reputasi yang sudah canon (top / above average / passed / failed).
- **Mata pelajaran:** Magic Theory, History, Etiquette, Potion Crafting, Dark Magic Defense, Combat, Creature Studies
  (dari `TIMETABLE` dan lore 232/236).
- **Dasar (per mata pelajaran):** tingkat kesiapan umum (FP8, tidak berubah): unprepared F, shaky D, fair C, solid B, excellent A.
- **Lantai hadir:** kalau {{user}} tidak pernah bolos mata pelajaran itu sejak ujian terakhir, nilainya minimal **C**.
  "Masuk kelas terus = lulus; belajar = B/A." Ini murah dan tidak grind.
- **Bolos:** 1–2 kali bolos di mata pelajaran itu menghapus lantai; 3 kali atau lebih memberi **−1 langkah**. Engine sudah tahu
  mata pelajaran setiap periode yang dibolos (FP7, `cell[0]`); cukup ditambah hitungan per mata pelajaran di `$eng.study.skip`.
- **Kondisi di hari ujian** (dibaca pada update pertama yang menyentuh jam ujian mata pelajaran itu):
  Tired −1, Exhausted −2. Collapsed, di Medical Centre, atau luka serious/critical menjadi **absen dengan alasan sah**: ujian
  susulan, nilai paling tinggi C.
  - Nightwell's Vigil sudah menahan sleep debt 48 jam (1.8.0), jadi "exam-week staple" di lore kini bekerja secara mekanik,
    termasuk harga yang dibayar sesudahnya.
- **Combat:** paling sedikit 6 sesi `/Training` (mana atau stamina) sejak ujian terakhir memberi +1 langkah. Latihan yang
  ditolak karena lelah atau luka tidak dihitung.
- **Assignment:** Commitment `Type: "assignment"` yang dihapus sebelum `_Late` dihitung selesai dan memberi +45 menit belajar.
  Assignment yang dihapus setelah `_Late` dihitung sebagai satu kali bolos untuk mata pelajaran yang disebut di judul atau Desc.
  Kalau tidak ada mata pelajaran yang disebut, tidak ada efek.
- **Batas:** semua modifier bersama paling jauh ±2 langkah dari dasar (setelah lantai), clamp A..F.

### N2. Jadwal posting (mengikuti lore)
- **Midterm (M3, M9):** nilai per mata pelajaran diposting pada update pertama hari **Jumat minggu ujian** (lore 232: "Marks
  post at week's end").
  - Creature Studies tidak punya ujian midterm; nilainya dari fieldwork (dasar + absensi). Di semester 1, hasil Expedition M2W3
    boleh digeser narator lewat N3.
  - M9: kalau {{user}} memenangkan hadiah Science Fair, narator boleh menggeser Magic Theory +1 lewat N3 (lore: "may be replaced
    by a Fair score").
- **Finals (M5, M11):** satu trial, jadi satu hari ujian untuk {{user}}. Engine memilih hari run {{user}} (Senin–Kamis) secara
  deterministik dari seed, dan `<now>` menyebutnya sejak awal minggu ujian. Nilai per tahap (enam tahap = tujuh mata pelajaran;
  Etiquette dan History berbagi satu tahap) dihitung saat itu, lalu **diumumkan di Results day** (lore 237: "stage by stage"),
  bersamaan dengan dorm rank.
- Nilai ditulis ke `Player.Academics.Exams["Y1 M3 Midterm"] = {"Magic Theory": "B", ...}`.
  `Player.Academics.Grades` menjadi **nilai terakhir per mata pelajaran**, yang dibaca narator dan guru.
- Journal: satu baris per posting ("Midterm marks: A Magic Theory, C History, ..."). Bracelet: satu toast.

### N3. Peran narator
- Narator tetap memainkan ujiannya. `<now>` pada hari ujian memberi **nilai yang diharapkan** dan alasannya, misalnya
  "Expected: B (solid preparation; Tired −1)".
- Cerita boleh menggeser **±1** per mata pelajaran per ujian lewat `/Exam_events`. Contohnya momen penting dengan Fortune, bakat,
  tahan lama melawan guru DMD, atau hadiah Science Fair.
- `"Fail": true` hanya untuk ketahuan menyontek, walk-out, atau bolos ujian tanpa alasan. Menyontek yang ketahuan juga tetap
  kena event Student −20 yang sudah ada.
- Narator tidak menulis `Grades` / `Exams` lagi selama fitur `study` ON (engine me-revert tulisan langsung, sama seperti
  `_Affinity`). Kalau fitur OFF, perilaku sekarang tetap (narator menulis bebas).

### N4. Efek nilai
1. **Dorm rank (FP9):** skor ujian = (rata-rata midterm × 1 + rata-rata finals × 2) / 3 pada skala 0–4 (F=0 .. A=4).
   Rentangnya sama dengan skor tier sekarang, jadi ambang band, bonus Competition, Academy dan noise ber-seed tidak berubah.
   Save tanpa nilai midterm (fitur baru di tengah semester) memakai finals saja.
2. **Reputasi otomatis** (angka dari desain yang sudah disetujui), sekali per posting:
   - Academy: rata-rata ≥ 3.5 → +15; ≥ 2.5 → +8; ≥ 1.5 → +3.
   - Setiap F: satu F −8, dua atau lebih −15 (dijumlahkan dengan bagian positif).
   - Doves: DMD A → +8.
   - Baris-baris ini dihapus dari daftar `Rep_events` narator saat `on('study')` (pola EJS yang sama dengan absensi).
3. **Nilai A → guru mata pelajaran itu:** talk/hangout yang dilaporkan dengan guru tersebut (dari `CLASS.teach`, tahun {{user}})
   dapat **+1 XP** sampai ujian berikutnya. Guru memperlakukan {{user}} sebagai murid kuat: dipanggil untuk demonstrasi, jam
   konsultasi diterima. Ini perilaku, bukan kewajiban; guru tetap bersikap sesuai karakternya.
4. **Nilai F → remedial:** engine menambah Commitment
   `Remedial <Subject>` (`Type: "appointment"`, `With: <guru>`, `Due`: Sabtu minggu berikutnya 10:00, di slot Study Hall).
   - Datang (Commitment dihapus sebelum `_Late`): F menjadi **D** untuk dorm rank. Rep −8 tetap, karena kegagalannya sudah
     terjadi.
   - Tidak datang: narator menyelesaikannya di cerita seperti Commitment `_Late` biasa (rule yang sudah ada).
5. **Nilai terbaru di `<current_state>`** membuat NPC bisa bereaksi sesuai karakter. Dua contoh: Florian yang kesal karena
   {{user}} mengungguli dia di Magic Theory (sudah canon, lore 107), dan Aiden yang takut dikeluarkan. Tidak ada aturan yang
   memaksa reaksi tertentu.

### N5. Kaitan dengan fitur lain
| Fitur | Kaitan |
|---|---|
| Absensi (FP7) | lantai C per mata pelajaran; bolos memberi −1 (N1) |
| Study (FP8) | tetap menjadi dasar nilai; Rank 4 study partner tetap +30 menit |
| Mood / fatigue / sleep debt (1.8.0) | Tired/Exhausted di hari ujian; Vigil menjadi strategi yang sah |
| Luka dan Medical Centre | absen dengan alasan sah, ujian susulan maks. C |
| Training (1.3.0) | ≥ 6 sesi → Combat +1 |
| Commitments `assignment` | selesai tepat waktu +45 menit belajar; terlambat = satu kali bolos |
| Fortune (1.9.8) | momen penting ujian; narator menggeser ±1 lewat N3 |
| Reputasi Academy/Doves | otomatis (N4.2); probation (Academy −5) tetap memotong payout setengah |
| Competition | tetap bonus dorm rank (tidak berubah) |
| **Gareth R10** "tutors them before every exam" | kesiapan +1 tingkat untuk setiap ujian (maks. excellent) |
| **Layla R10** "History the easiest top mark" | History minimal **A** (kecuali `Fail`) |
| **Mimosa's focus draught** (1 use, `/Perk_use`) | "recall everything they studied": pada hari itu nilai = tingkat kesiapan; minus Tired/Exhausted dan bolos diabaikan |
| **Alyssa R10** Foresight "before an exam" | sekali per ujian, satu mata pelajaran praktik +1 |
| Hadrian R10 golem | "Never at exams" (sudah canon): tidak ada efek |
| Takhayul (Star Cookie, tangan Founder, Firetooth) | tetap flavor; lore sendiri menyebutnya "disputed" |

### N6. UI dan `<now>`
- Student file → Academics: tabel per ujian (kolom = mata pelajaran), baris "Current standing", dan rincian nilai yang diharapkan
  sebelum ujian (dasar, lantai, modifier). Pemain bisa melihat apa yang harus diperbaiki.
- `<now>` di minggu ujian: hari run finals {{user}}, nilai yang diharapkan untuk ujian hari ini.
- Weekly recap: "midterm marks posted", "remedial attended".

### N7. Settings dan save
- Semua ini berada di bawah toggle Features **"Study and exams"** yang sudah ada. OFF = perilaku sekarang.
- Tidak ada baris tuning baru. `study_tiers` dan `rank_move` tetap.
- **Save owner:** entri `Grades`/`Exams` lama tulisan narator **tidak dihapus**. Engine menambahkan key baru ("Y1 M3 Midterm").
  `Grades` per mata pelajaran ditimpa hanya saat engine memposting nilai mata pelajaran itu. Save yang sedang di tengah semester
  mendapat lantai C untuk mata pelajaran yang belum tercatat bolosnya (seperti grace "fair" di FP8).
- `tests/test_saves.cjs` harus membuktikan save 1.14.4 tetap termuat tanpa kehilangan data.

## 3. Teks card (English, yang disetujui masuk ke card)

**502, pengganti baris `- Exams:` (hanya saat `on('study')`):**
```
- Exams: the engine marks every subject (A top of the year, B above average, C passed, D weak pass, F failed) from {{user}}'s preparation, attendance, condition on the day and training, and posts them (midterms on the Friday of exam week, finals on Results day). In exam week <now> gives the expected mark; play the exam to it. The story may shift one subject by one step: insert {"Subject": "<subject>", "Shift": 1 or -1, "Why": "..."} into /Exam_events. Use {"Subject": "<subject>", "Fail": true, "Why": "..."} only for cheating caught, walking out or skipping the exam. Never write Player.Academics yourself.
- Player.Academics.Grades is {{user}}'s latest mark per subject: teachers and classmates know it and react in character.
```

**505 `<now>` (minggu ujian):**
```
Exam week. {{user}}'s preparation: <tier> (<h> hours studied since the last exams). <Finals: {{user}}'s run is <Day> at <HH:MM>.> Today: <Subject> expected <mark> (<reasons>).
```

**505 `<now>` (hari posting / Results day):**
```
Marks posted: <Subject> <mark>, ... <Remedial <Subject> with <teacher> on <Due>.>
```

## 4. Test (kecil, relevan)
- Nilai dasar per tingkat; lantai C; bolos 1–2 / 3+; Tired/Exhausted; absen sah → susulan maks. C; batas ±2.
- `/Exam_events` Shift ±1 dan Fail; tulisan langsung ke `Player.Academics` di-revert saat ON dan dibiarkan saat OFF.
- Posting midterm hari Jumat; finals di Results day; hari run finals sama di setiap replay.
- Dorm rank memakai bobot 1:2; save tanpa midterm memakai finals saja.
- Rep otomatis sekali per posting (tidak ganda saat swipe/replay).
- Gareth, Layla, Mimosa (sekali pakai), Alyssa.
- Remedial Commitment dibuat dan dihapus tepat waktu → F dihitung D.
- Save fixture 1.14.4 termuat; entri narator lama tetap ada.

## 5. Keputusan terbuka

- **[?1] Lantai C karena rajin hadir.** Menurut saya ini membuat nilai terasa adil tanpa grind. Tapi rajin hadir saja sudah
  menjamin lulus. Setuju, atau lantai D saja?
- **[?2] Guru mata pelajaran dengan nilai A:** +1 XP per talk/hangout sampai ujian berikutnya. Cukup berguna, atau mau hadiah
  lain (misalnya akses ruang praktik di luar jam kelas untuk Potion Crafting)? Opsi kedua berarti canon baru.
- **[?3] Remedial untuk F** (Sabtu pagi di slot Study Hall, F → D kalau datang). Ini canon baru, karena lore tidak menyebut remedial.
  Setuju?
- **[?4] Efek angka untuk empat bond reward** (Gareth +1 tingkat, Layla History ≥ A, Mimosa mengabaikan minus, Alyssa +1 satu
  praktik). Teks reward tidak berubah, hanya ditafsirkan. Setuju dengan tafsiran ini?
- **[?5] Hari run finals** dipilih engine (deterministik) dan diumumkan di `<now>`. Lore hanya menyebut "one student at a time
  (hence four days)". Setuju?
