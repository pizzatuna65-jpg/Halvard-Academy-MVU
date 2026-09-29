# DRAFT — Batch penerapan FP7–FP12 (2026-09-28, card 1.9.8)

Status: **selesai.** Batch 1 = v1.10.0, Batch 2 = v1.10.1, Batch 3 = v1.10.2 (2026-09-28); setting lengkap fitur lama di v1.9.9. Keputusan di akhir file mengikuti saran (owner).
yang terkait harus ada sebelum batch itu mulai.

Sumber rencana: `planning/FUTURE_PLANS.md` FP7 (absensi), FP8 (jam belajar → kesiapan ujian), FP9 (dorm rank dari engine),
FP10 (rekap mingguan), FP11 (alasan inisiatif NPC bervariasi), FP12 (batas 4 NPC di scene pada hari biasa; ditambahkan owner 2026-09-28). Semua fitur di bawah deterministik dan aman untuk swipe, punya
toggle di Settings → Features, dan menyertakan tes bahwa save rilis sebelumnya tetap dimuat (`make_save.cjs` sebelum mulai).

## Urutan dan alasannya

| Batch | Rilis | Isi | Kenapa urutan ini |
|---|---|---|---|
| **1** | 1.10.0 | FP7 absensi + FP10 rekap mingguan + FP12 batas 4 NPC | Terasa sejak hari pertama; FP10 memakai angka FP7 (bolos, clean week), jadi dibangun bersama. FP12 kecil dan berdiri sendiri. |
| **2** | 1.10.1 | FP8 kesiapan ujian + FP9 dorm rank | FP9 butuh skor FP8. Pencatatan jam belajar harus jalan **sebelum** Midterm pertama (Y1 M3 W1). |
| **3** | 1.10.2 | FP11 alasan inisiatif bervariasi | Berdiri sendiri; memperbaiki fitur yang sudah ada (FP1). |

Perkiraan token always-on: Batch 1 **−40** (tiga baris laporan dihapus dari 502), Batch 2 sekitar **+25** (satu aturan;
baris `<now>` hanya di minggu ujian dan hari Results), Batch 3 **0**. Baris `<now>` lain (termasuk pamit FP12, ~40 token) hanya muncul saat kejadiannya ada.

---

## Batch 1 (1.10.0): absensi otomatis + rekap mingguan + batas 4 NPC

### FP7 Absensi
- **Venue kelas di engine.** Sekarang pemetaan kelas → tempat hanya ada di `<now>` (505: `TT`, `VN`, `CLUBV`, dibuat
  `gen_mvu_entries.py`). Pindahkan pembuatannya ke `tools/common.py` sebagai satu sumber, lalu `gen_engine.py` menyuntikkan
  `CLASS_VENUES` dan `CLUB_VENUES` ke engine. 505 tetap memakai data yang sama.
- **Pencatatan.** Bagian engine baru setelah reputasi (5b), memakai `periodOf` / `timetableFor` yang sudah ada:
  - Selama periode kelas tahun {{user}} (tidak ditiadakan event, bukan Study Hall), menit di luar venue dihitung dari `elapsed` dan
    lokasi sebelum/sesudah. Lebih dari 30 menit dalam satu periode = **bolos** (satu kali per periode): Academy −2 lewat `repAdd`
    (bukan batas mingguan, karena ini kerugian), `_Log`, dan `$ui.absent` untuk `<now>` balasan berikutnya.
  - Toleransi 15 menit perpindahan. **Alasan sah:** Medical Centre, Head cold, cedera moderate ke atas, `Trip.Active`, Battle
    aktif, event `noclass`/`away`, belum di-sort, dan kondisi Collapsed.
  - **Klub Sabtu:** di venue klub {{user}} ≥ 60 menit pada P3 Sabtu → Student +1 (batas mingguan; tetap tidak dihitung saat election Saturday, sesuai aturan yang sudah ada).
  - **Clean week:** saat pergantian minggu, tanpa bolos dan tanpa kerugian Academy tercatat minggu itu (misalnya tertangkap setelah
    curfew, yang dilaporkan narator) → Academy +2 (batas mingguan).
  - State: `$eng.att = { w, periods: {kunci periode: menit di luar}, skipped: [...], lossAcad }`; schema baru.
- **Teks card.**
  - 502: hapus "a clean week (no skipped class, no curfew break) +2", "skipped period −2", "Saturday club time +1" dari daftar repeat/loss (engine yang menghitung). Tambah satu kalimat: "Attendance is counted by the engine; never report it."
  - `<now>` (hanya saat terjadi): `{{user}} was absent from <class> (<teacher>) this period; the absence is on record. <teacher> reacts in character when they next meet.`
- **Settings → Features:** "Attendance" (default ON). OFF = kembali ke laporan narator (baris 502 lama muncul lagi lewat gate EJS).

### FP10 Rekap mingguan
- Saat pergantian minggu (hari 7k), engine menulis satu baris Journal **hanya kalau ada perubahan penting** (usulan; `[?] 4`):
  rank bond naik/turun, level reputasi berubah, bolos, pengeluaran/pemasukan besar (misalnya ≥ 300 poin), rank dorm berubah (setelah Batch 2).
  Contoh: `M2 W3: Etnie reached Rank 4; Academy +1 level; skipped 1 class; 450 points earned, 120 spent.`
- Data sudah ada: `Wallet.Transactions`, catatan rank, `repSync`, `$eng.att` (FP7).
- **Settings → Features:** "Weekly recap" (default ON).

### FP12 Batas 4 NPC di scene pada hari biasa
- **Kapan:** hari tanpa acara kalender (`World._Event_today` kosong) dan tidak sedang dalam pengecualian (`[?] 7`).
- **Hitungan:** semua nama di `Scene.Present` (NPC roster dan Extras; kerumunan tanpa nama tidak dihitung, `[?] 9`).
- **Lebih dari batas (default 4):** engine memilih satu yang pamit, deterministik:
  1. yang tidak ada di Interactions balasan terakhir (tidak sedang diajak bicara);
  2. Rank terendah (Extras dan tanpa bond dulu);
  3. yang punya tempat lain saat ini (kelas atau klub tahunnya, regulars di tempat lain, Next plan yang jatuh tempo);
  4. seri dipecah dengan seed harian.
  Tidak pernah tuan rumah kunjungan dorm (Rank 7) dan tidak pernah tokoh yang sedang berinteraksi dengan {{user}}.
- **Engine tidak menghapus sendiri:** `<now>` meminta narator memainkan pamitnya lalu menghapus tokoh itu dari `Scene.Present`
  (supaya pamitnya terlihat di cerita). Kalau narator lupa, baris yang sama muncul lagi di balasan berikutnya.
- **Teks card (`<now>`, hanya saat terjadi):** `More than four people are with {{user}} on an ordinary day: <Name> takes their leave in this reply for a reason that fits them, then leaves Scene.Present.`
- **Settings:** batas 3 / 4 / 5 / 6 (default 4). **Features:** "Small scenes on ordinary days" (default ON).
- **Cocok dengan yang sudah ada:** Cast Sheet sudah memberi lore penuh untuk paling banyak 4 orang, jadi dengan batas 4 setiap tokoh
  di scene hari biasa mendapat lore penuh.

### Tes Batch 1
Kelas di Lecture Halls / Combat Grounds / Potion Halls / Menagerie; tepat 30 dan 31 menit di luar; toleransi 15 menit; setiap
alasan sah; periode yang ditiadakan event; Study Hall tidak dihitung; klub Sabtu; election Saturday; clean week dengan dan tanpa
kerugian Academy; swipe/replay; Features OFF memulihkan teks lama; rekap hanya saat ada perubahan; FP12: 5 NPC di hari biasa → tepat satu diminta pamit, urutan prioritas, tokoh yang diajak bicara dan tuan rumah Rank 7 tidak pernah dipilih, hari event tidak dibatasi, pengecualian `[?] 7`, batas dari Settings, toggle OFF; save 1.9.8 dimuat.

**Selesai bila:** bolos satu periode menurunkan Academy tepat sekali dan guru bereaksi di balasan berikutnya; minggu rajin memberi
+2; tidak ada hukuman untuk alasan sah; rekap muncul hanya di minggu yang berarti; di hari biasa scene tidak lebih dari 4 NPC dan yang pamit masuk akal.

---

## Batch 2 (1.10.1): kesiapan ujian + dorm rank

### FP8 Jam belajar → kesiapan ujian
- **Menit belajar** sejak ujian terakhir, disimpan di `$eng.study = { exam: 'Y1M3', mins }`:
  - waktu di Main Library / Study Rooms / Archive di luar periode kelas (dari `elapsed` dan lokasi, sama seperti FP7);
  - Interactions `study` +60 menit (dan +30 lagi kalau partner Rank 4 menurut `data/rank4_partners.json`);
  - Study Hall Sabtu kalau hadir (FP7 tahu kehadirannya).
- **Tingkat:** `unprepared | shaky | fair | solid | excellent` dengan batas jam di `data/tuning.json` (usulan 0/4/10/18/28; `[?] 1`).
- **Save lama / pasang di tengah semester:** jam belajar mulai 0 saat fitur pertama kali jalan; ujian pertama sesudahnya
  memakai paling rendah "fair" supaya pemain tidak dihukum karena fitur baru.
- **Teks card.**
  - `<now>` (hanya minggu ujian): `Exam week. {{user}}'s preparation: <tier> (<h> hours studied since the last exams). Results follow it within one step.`
  - 502 (~25 token): hasil ujian mengikuti kesiapan ±1 langkah (bakat dan keadaan boleh menggeser satu langkah; Fortune roll 1.9.8
    boleh dipakai untuk momen ujian yang benar-benar menentukan); Rep_events ujian dilaporkan seperti biasa.
- **Settings → Features:** "Study and exams" (default ON).

### FP9 Dorm rank dari engine
- **Hari Results** (event `ranking: 1`, M5 W2 dan M11 W2): engine menghitung skor dan menulis `Player.Profile.Dorm_rank`.
  Log lama "update Player.Profile.Dorm_rank when the results are announced" diganti.
- **Skor** (tabel di `data/tuning.json`): tingkat kesiapan ujian semester itu (FP8) + placement Dorm Competition (`Competition`,
  kalau ikut) + level Academy + sedikit variasi seeded.
- **Pita** sama dengan payout (#1 / ≤3 / ≤10 / ≤25 / ≤50 / sisanya); rank bergerak **paling jauh satu pita** dari rank lama,
  naik maupun turun (usulan: boleh turun, `[?] 2`). Rank awal yang kosong/0 mulai dari pita terbawah.
- `<now>` di hari Results: `Announce: {{user}} is now #n in <dorm> (was #m).` Payout bulan berikutnya otomatis mengikuti.
- **Settings → Features:** ikut toggle "Study and exams"; OFF = narator memilih seperti sekarang.

### Tes Batch 2
Akumulasi menit (lokasi, study, partner Rank 4, Study Hall); tiap batas tingkat; reset setelah ujian; grace "fair" untuk save
lama; skor dan pergerakan satu pita (naik, turun, tetap); rank awal 0; payout mengikuti rank baru; toggle OFF; swipe/replay;
save 1.10.0 dimuat.

**Selesai bila:** pemain yang belajar ~20 jam antar ujian melihat "solid" dan naik pita dengan ujian dan kompetisi yang baik;
pemain yang tidak belajar bisa turun satu pita; narator tidak lagi memilih angka rank.

---

## Batch 3 (1.10.2): alasan inisiatif NPC bervariasi (FP11)

- **Bahan dari data yang sudah ada:**
  - tempat: regulars NPC (`data/locations.json`);
  - kegiatan: klub NPC (`load_clubs`), barang dan hal yang disukai (`data/gift_prefs.json` liked/loved), event kalender hari
    itu atau besok;
  - jenis permintaan per kategori NPC (`data/tension.json` categories: withdrawn, social, confrontational, authority, dangerous),
    dibatasi Rank dan Tension (Tension ≥ 70 tetap bukan kunjungan ramah, seperti FP1).
- **Pemilihan:** seeded per hari (latch FP1 yang sudah ada); kombinasi yang sudah dipakai disimpan per NPC
  (`$eng.initiative.used`, dibatasi 20 terakhir) supaya tidak berulang. Stage NPC tetap jadi kerangka; kombinasi hanya mengisi
  "untuk apa".
- **Teks:** baris `<now>` inisiatif yang sama, hanya alasannya yang lebih spesifik, misalnya `Saffi wants {{user}} to try the new blossom cakes at the Mall bakery with her.`
- **Data baru kecil:** `data/initiative_asks.json`: 3–5 templat permintaan per kategori (bahasa Inggris, generik; bukan canon per NPC).
  `[?] 3`

### Tes Batch 3
Setiap kategori menghasilkan permintaan yang sesuai (withdrawn tidak "mengajak pesta"); tidak ada kombinasi berulang dalam 20
kemunculan; Tension ≥ 70 tidak menghasilkan ajakan ramah; latch harian dan swipe; save 1.10.1 dimuat.

**Selesai bila:** 20 inisiatif berturut-turut dari satu NPC punya alasan yang berbeda dan tetap sesuai karakternya.

---

## Keputusan (semua mengikuti saran, owner 2026-09-28)

FP8 batas jam 0/4/10/18/28; FP9 rank boleh turun satu pita; FP11 templat permintaan ditulis sendiri (generik per kategori), owner cek di rilisnya; FP10 rekap hanya minggu dengan perubahan penting; FP7 alasan sah sesuai daftar; semua toggle baru default ON; FP12 tidak berlaku saat kelas, klub, pesta dan Battle (kumpul yang diundang {{user}} tetap dibatasi), tanpa batas di hari event, Extras ikut dihitung dan kerumunan tanpa nama tidak.

## Daftar pertanyaan semula
 (sebelum batch terkait)

1. **FP8 batas jam** per tingkat antar ujian: 0 / 4 / 10 / 18 / 28 jam? (Batch 2)
2. **FP9 rank boleh turun** satu pita? Saran: ya. (Batch 2)
3. **FP11 templat permintaan:** saya tulis sendiri 3–5 per kategori NPC (generik, bukan canon per NPC), atau owner ingin menyetujui
   daftarnya dulu? Saran: saya tulis, owner cek di rilisnya. (Batch 3)
4. **FP10 frekuensi:** hanya minggu dengan perubahan penting (saran), atau setiap minggu? (Batch 1)
5. **FP7 alasan sah:** daftar di atas cukup, atau ada tambahan (misalnya tugas dari staf, dipanggil ke Headmaster's Office)? (Batch 1)
6. **Default toggle:** semua fitur baru ON secara default (saran), atau OFF sampai dicoba? (semua batch)
7. **FP12 pengecualian di hari biasa:** batas **tidak** berlaku saat kelas (teman sekelas di ruang kelas), pertemuan klub, pesta
   ulang tahun, Battle, dan acara yang {{user}} sendiri kumpulkan (mengundang beberapa orang sekaligus)? Saran: kelas, klub, pesta
   dan Battle dikecualikan; kumpul yang diundang {{user}} tetap dibatasi 4. (Batch 1)
8. **FP12 bagaimana di hari event** (festival, feast, kompetisi): tanpa batas sama sekali (saran), atau batas lebih longgar? (Batch 1)
9. **FP12 Extras** (tokoh karangan narator yang sudah tercatat) ikut dihitung? Saran: ya; kerumunan tanpa nama tidak. (Batch 1)
