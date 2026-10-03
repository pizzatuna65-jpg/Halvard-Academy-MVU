# Rencana Batch Fitur 4.5–4.10 (dari Audit Bagian 2)

Cara pakai: owner cukup bilang **"kerjakan batch fitur N"**. Claude mengerjakan **hanya** batch itu, dalam satu sesi dan sebagai satu
rilis, lalu mengubah status di tabel di bawah menjadi "selesai (versi X, commit Y)".

Nomor 4.x merujuk ke `AUDIT_2026-10-03_2_saran_fitur_dan_arah.md`. Bila konteks sesi hampir habis sebelum batch selesai, Claude
berhenti di titik yang aman (tes lulus, sudah di-commit), menulis status "sebagian" beserta sisanya, dan batch dilanjutkan dengan
perintah yang sama.

## Status

| Batch | Isi | Dari saran | Ukuran | Bergantung pada | Status |
|-------|-----|-----------|--------|-----------------|--------|
| 1 | Tugas dan proyek kelompok + bantuan dan utang budi | 4.10, 4.6 | sedang | – | belum |
| 2 | Minggu rutin (maju cepat mingguan) | 4.5 | besar | 1 | belum |
| 3 | Dunia hidup antar-NPC + papan misteri yang hidup | 4.8, 4.9 | sedang | – | belum |
| 4 | Jadwal hidup NPC (draft dulu, lalu dibangun) | 4.7 | sedang–besar | – (draft perlu "proceed") | belum |

Urutan yang disarankan: 1 → 2 → 3 → 4. Batch 3 boleh kapan saja. Draft batch 4 boleh ditulis lebih awal supaya owner bisa
membacanya sambil batch lain dikerjakan ("tulis draft batch fitur 4").

Kenapa dibagi begini:
- 4.10 dan 4.6 sama-sama memakai Commitments/Agenda dan initiative, jadi satu rilis.
- 4.5 menyentuh hampir semua step mingguan (absensi, belajar, latihan, gaji, istirahat). Paling berisiko, jadi berdiri sendiri. Ia
  memakai tugas dari batch 1 di rencana minggunya.
- 4.8 dan 4.9 sama-sama beat ambience + tanda di UI (Meanwhile, Connections, Map).
- 4.7 butuh rutinitas per NPC (71 NPC). Itu konten karakter baru, jadi wajib lewat `planning/DRAFT_*.md` dan "proceed" owner.

## Aturan setiap batch (dari CLAUDE.md, selalu berlaku)

1. Sebelum mengubah kode, tulis fixture save rilis sekarang (`node tests/fixtures/make_save.cjs`). `tests/test_saves.cjs` harus tetap lulus.
2. Edit hanya sumber: template, `data/*.json`, dan tools. Field state baru dideklarasikan di `schema.js`. Migrasi save masuk ke `stepMigrate`.
3. **Anggaran mekanik:** hanya subsistem yang sudah ada (Agenda, `whereabouts`, `rollTable`, `ledger`, `bagTake`/`bagGive`, sesi
   latihan, modul Area). Subsistem paralel baru butuh alasan tertulis di CHANGELOG.
4. Setiap fitur mendapat satu suite tes (`tests/test_feature_batchN_v1xx0.cjs`). Cek cepat yang relevan saja; suite penuh hanya di batch 2 (fitur besar).
5. Naikkan versi, `python tools/build_all.py` (`--lore` bila lore berubah), lalu CHANGELOG, HANDOFF, TEST_CHECKLIST (live-only),
   INDEX/DECISIONS bila ada file, step atau keputusan baru. Commit.
6. Aturan narrator masuk ke kartu (502/504/505), bukan preset. Fitur baru yang bisa dimatikan mendapat baris di `data/features.json`.
7. Keputusan yang tertulis "diputuskan" di bawah: kalau owner tidak menjawab, dikerjakan sesuai tulisan.

---

## Batch 1 — Tugas kelompok + bantuan dan utang budi (sedang)

### 4.10 Tugas dan proyek kelompok
Sudah ada: Commitment `Type: "assignment"` (selesai tepat waktu: +45 menit belajar; terlambat: dihitung bolos satu kelas mata
pelajarannya, `stepRecords`), dan `Projects` dengan `With`, `Progress`, `Due` di Agenda. Persiapan ujian adalah satu kolam menit
(`$eng.study.mins`), bukan per mata pelajaran.

Yang ditambah:
- **Proyek kelompok** = Project `Kind: "assignment"` dengan `Subject` dan `With` (rekan sekelas). Mengerjakannya dilaporkan sebagai
  `/Practice` Track `"study"` bersama rekan itu: menit belajar masuk ke kolam persiapan (aturan partner Rank 4 yang sudah ada), dan
  rekan yang hadir mendapat bond XP sebagai interaksi study biasa (batas harian/mingguan tetap; aturan "Bond XP needs time together").
- Selesai tepat waktu: +45 menit belajar seperti assignment biasa, plus +1 XP dengan guru mata pelajaran itu (sama dengan nilai A/B).
- Terlambat karena {{user}}: Tension tiap rekan naik sesuai kategori Tension-nya (tidak dibatasi). Rekan yang malas **tidak**
  ditentukan engine: narator memainkannya sesuai karakter (prinsip NPC in character), dan Tension hanya naik lewat laporan biasa.
- 502: satu aturan singkat (cara mencatat proyek kelompok). Planner menampilkan rekan dan mata pelajaran.

### 4.6 Bantuan dan utang budi
- `data/initiative_asks.json` mendapat blok `favours` per kategori Tension (template generik, bukan canon per tokoh, sama seperti `asks`):
  - barang: `{thing}` dari preferensi hadiah, atau barang toko biasa;
  - kehadiran: `{place}` + waktu (besok atau lusa), dari haunts dan tempat umum.
- `stepInitiative`: sebagian hari initiative membawa permintaan (diputuskan: paling banyak 1 bantuan terbuka per NPC dan 2 per minggu).
  Narator menawarkannya. Bila diterima, narator menulis Commitment `Type: "favour"`, `With`, `Due`, `Where`/`Item`.
- Ditepati (barang diberikan lewat `bagTake`, atau {{user}} hadir di tempat itu bersama NPC sebelum Due): Trust +2 lewat jalur deed
  "help" (tetap di dalam batas +8 per minggu).
- Diabaikan (overdue lewat Agenda): Tension +5 sesuai kategori, tidak dibatasi, satu kali. Ditolak sopan saat ditawarkan: tanpa angka.
- Feature row `favours` (ikut `npc_initiative`).

Tes: tepat waktu, terlambat, rekan absen tanpa XP, bantuan ditepati, bantuan overdue, batas per minggu, save lama.

---

## Batch 2 — Minggu rutin (besar)

- **Rencana minggu di Planner** (`$ui.plan`, ditulis alat pemain dan dijaga `stepGuards`): per hari jam belajar, klub, sesi latihan
  (track mana/stamina/aksi Practice di tempat yang sudah ditemukan), shift berbayar (maks 2, aturan yang sudah ada), tugas dari batch 1,
  istirahat. Kelas selalu dihadiri kecuali ditandai.
- **"Jalani minggu ini"**: tombol menulis pesan pemain; balasan narator berikutnya memajukan waktu sampai akhir rentang. Engine
  menerapkan rutinitas hanya bila `$ui.plan.run` aktif.
- **Engine** (satu fungsi `routineWeek` yang memanggil helper yang sudah ada, bukan step paralel): absensi, menit belajar, sesi latihan
  (`trainAdd`, batas mingguan), XP Practice (batas mingguan), gaji (`ledger`), tidur dan stamina, rekap ke Journal. Peringatan
  "Time jumped N days" dan catatan bolos panjang tidak muncul untuk rentang yang direncanakan.
- **Penghenti** (diputuskan): rentang berhenti sehari sebelum event kalender berjadwal, minggu ujian, Commitment/Hook/Project yang jatuh
  tempo, ulang tahun, trip atau status pergi. Paling lama 7 hari per jalan.
- **Tanpa bond XP dan Trust** selama rentang (keputusan "Missed reports" dan "Bond XP needs time together"). Meanwhile tetap jalan.
- **Narator memainkan 1–2 momen** dari `rollTable` minggu itu (happening, initiative, bantuan) lewat `<now>` (`$ui.now`).
- Feature row `routine_week`. Bila konteks sesi menipis: commit engine dulu, Planner UI menyusul dalam batch yang sama.

Tes: satu minggu penuh, rentang yang dipotong penghenti, semua batas mingguan, `ENGINE_DIFF` untuk balasan tanpa rencana (tidak berubah), suite penuh.

---

## Batch 3 — Dunia antar-NPC + papan misteri (sedang)

### 4.8 Dunia hidup antar-NPC
- Baris Meanwhile (`stepBondMemory`) dan beat ambience mendapat kalimat pasangan dari `relations.json`: rivals/friends ("X dan Y
  terlihat berlatih bersama"), dislike ("X menghindari Y"). Hanya relasi yang sudah terlihat di Connections, hanya bila keduanya bebas
  menurut `whereabouts`. Seed `rollTable`, paling banyak satu per hari.
- Relasi `New_relations` menua (diputuskan): tidak diperbarui 4 minggu → garisnya pudar di Connections; 8 minggu → disembunyikan
  (data tetap ada). Diperbarui bila narator menulis ulang relasi itu atau keduanya hadir bersama di scene.

### 4.9 Papan misteri yang hidup
- `Clues.Where` sudah ada. Tempat dari Clue milik thread yang masih `open` diberi tanda di Map (dan legenda kecil).
- Berkunjung ke tempat bertanda: beat ambience "jejak" (sekali per thread per minggu, seed). `<now>` hanya berkata ada sesuatu di
  sini yang menyentuh thread itu; narator memilih tanda kecil yang setia pada lore. Tidak pernah solusi, dan thread hanya "solved"
  lewat cerita (keputusan "Rumours and stories as Clues": engine tidak mengarang isi).

Tes: kalimat pasangan hanya untuk relasi terlihat, penuaan, tanda Map, beat sekali per minggu, thread solved tanpa tanda.

---

## Batch 4 — Jadwal hidup NPC (sedang–besar, dua langkah)

1. **Draft** `planning/DRAFT_npc_routines.md`: rutinitas mingguan ringan per NPC (hari, jam, tempat), diturunkan dari lore (haunts,
   klub, peran, pekerjaan). Catatan Indonesia, data Inggris, maksimal 1–3 pertanyaan di akhir. Berhenti sampai owner bilang "proceed".
2. **Bangun** setelah "proceed":
   - `data/npc_routines.json`; `presence_data` membawanya; `whereabouts` mengembalikan tempat rutin dalam jendela waktunya (urutan:
     status/sakit > kelas/mengajar > rutinitas > haunts). Tetap satu model whereabouts (keputusan 1.47.0).
   - Map: Regulars menulis "biasanya di sini Kam 15:00–17:00". Dossier menampilkan rutinitas hanya bila field Haunts sudah terbuka.
   - `<now>` presence dan `{place}` initiative/bantuan memakai tempat rutin.
   - Hapus draft, update `NPC_BRAINSTORM_BRIEF.md` (NPC baru butuh rutinitas).

Tes: NPC di tempat rutin pada jamnya, kelas mengalahkan rutinitas, gerbang Haunts, NPC yang belum datang/lulus.
