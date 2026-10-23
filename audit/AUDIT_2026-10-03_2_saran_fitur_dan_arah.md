# Audit Eldrasil / Halvard Academy (v1.41.0) — Bagian 2: Saran Fitur & Arah Project

Tanggal: 2026-10-03 (diperbarui) · Pasangan dari `AUDIT_2026-10-03_1_bug_efisiensi_integrasi.md`. Nomor 1.x, 2.x, dan 3.x di bawah merujuk ke laporan itu.

## Asumsi dasar

Seluruh isi Bagian 1 dianggap **sudah dikerjakan**. Artinya project sudah punya:

| Fondasi | Dari |
|---------|------|
| Semua bug 1.1–1.10 dan daftar "Rendah dan laten" sudah diperbaiki, termasuk MVU dan `mvu_zod` yang sudah di-pin | 1.x |
| `shared.js`: konstanta kalender dan periode, band Trust/Tension, `classRole`, status NPC, pemisah lokasi, dan normalisasi nama item, dipakai bersama oleh engine, UI, bracelet, dan EJS | 2.2–2.4 |
| **Modul Area** generik berbasis data. Kampus, hutan, Avalon, airship, dan Sunreach semuanya memakai modul ini, lengkap dengan waktu tempuh, moda perjalanan, profil iklim, dan jam malam | 3.1, 3.2, 3.7 |
| `awayNow()` dari engine sebagai satu-satunya sumber status "sedang pergi" | 3.3 |
| **Ledger** Points/Coin dan helper Bag (`bagTake`/`bagGive`), serta belanja yang diselesaikan engine lewat `/Purchases` | 3.4, 3.5 |
| `rollTable` untuk semua roll ber-seed, dengan satu sumber pengaturan frekuensi | 3.6 |
| `whereabouts(id, waktu)`, yaitu satu model lokasi NPC | 3.8 |
| Satu laporan **sesi latihan** dengan beberapa track (gabungan Training dan Practice) | 3.9 |
| Model **Agenda** untuk Commitments, Hooks, Next, Projects, dan Notices, termasuk satu feed "yang akan datang" | 3.10 |
| `$ui.now` buatan engine, dengan EJS `<now>` yang hanya menampilkannya; Cast Sheet dipecah per NPC; state per pesan sudah dirampingkan | 2.6, 2.7, 3.11 |
| Jalur rumor/lore ke Clue, dan hasil kompetisi yang terhubung ke reputasi dan bond | 3.12, 3.13 |

Karena itu, saran di bawah tidak lagi membahas perbaikan. Fokusnya fitur yang **menjadi murah** berkat fondasi baru.

Catatan:
- Saran ini disusun dari kode, tanpa membaca `docs/DECISIONS.md`. Saran yang menyentuh keputusan yang sudah ditetapkan tetap perlu persetujuan owner.
- Saran yang menyangkut canon (ditandai **[canon]**) harus lewat `planning/DRAFT_*.md` dulu.
- Setiap saran sudah dicek terhadap prinsip `CLAUDE.md`: tanpa ending, reward berguna, anti-grind, lebih mudah membuat musuh daripada teman, NPC in character, dan reputasi faksi tinggi punya harga.

Ukuran usaha: **K** = kecil (≤1 rilis kecil), **S** = sedang, **B** = besar (beberapa rilis).

---

## 4. SARAN FITUR

### A. Fitur yang tinggal "dipasang" di atas fondasi

**4.1 Area baru cukup berupa data (K per area, [canon])**

Karena modul Area sudah generik, area baru hanya butuh JSON (pins, legs, iklim, tabel roll) dan lore. Kandidat:
- **World Competition** di luar negeri. Tier ini sekarang hanya berupa status.
- **Kota terdekat** untuk hari libur. Hari Minggu bisa diisi keluar kampus dengan izin, tanpa event besar.
- **Rute Expedition yang berbeda di Year 2/3.** Tidak perlu peta baru, cukup dengan bobot tabel lain.

Usulannya: setiap area baru wajib lolos tes "tanpa kode baru". Kalau ternyata butuh kode, itu tanda modul Area perlu diperluas, bukan disalin.

**4.2 "Cari seseorang" (K)**

`whereabouts` sudah ada, tinggal ditampilkan:
- Dossier dan People mendapat baris "Kemungkinan sekarang: …" dengan tombol "Go here" dan perkiraan waktu jalan (dari modul Area).
- Gerbang pengetahuan tetap berlaku: tanpa field Haunts yang terbuka, yang tampil hanya "tidak tahu".

**4.3 Hadiah yang terasa (K)**

- Tombol "Give…" di Bag menampilkan reaksi yang sudah pernah terlihat (`$gifts`) dan preferensi yang sudah terungkap di dossier.
- Saat belanja (`/Purchases`), UI menandai item yang diketahui disukai NPC dengan bond tinggi.
- Hanya UI.

**4.4 Tawar-menawar dan pasar musiman (K–S)**

- Ledger dan `/Purchases` sudah ada, jadi Academy Bazaar dan pasar di Avalon/Sunreach bisa memakai Fortune roll untuk tawar-menawar.
- Ada juga stok musiman dan penjual keliling yang muncul dari `rollTable`.
- Prinsip: harga hasil tawar dibatasi supaya tidak bisa dieksploitasi.

### B. Gameplay baru dari gabungan sistem

**4.5 Minggu rutin / maju cepat mingguan (S)**

- Pemain mengisi rencana minggu di Planner (Agenda): jam belajar, klub, sesi latihan, shift kerja.
- Satu aksi "jalani minggu ini" membuat engine menghitung rutinitas: absensi, menit belajar, sesi latihan dalam batas mingguan, gaji, dan rekap.
- Narrator hanya memainkan 1–2 momen penting, yang dipilih dari `rollTable` minggu itu dan initiative.
- Anti-grind tetap aman karena semua batas mingguan berlaku. Usaha turun dari B ke S karena Agenda, sesi latihan, dan aturan lompatan waktu sudah ada.

**4.6 Bantuan dan utang budi (K–S)**

- NPC initiative membawa permintaan, dan menerimanya membuat entri Agenda.
  - Ditepati: Trust naik kecil (dalam batas mingguan).
  - Diabaikan: Tension naik tanpa batas.
- Permintaan bisa berupa barang (memakai `bagTake`) atau kehadiran di suatu tempat dan waktu (memakai modul Area dan Agenda).

**4.7 Jadwal hidup NPC yang terlihat (S)**

- Dengan `whereabouts`, NPC bisa punya "rutinitas mingguan" ringan dari data: latihan klub, shift kerja, kebiasaan malam.
- Pemain bisa "kebetulan" bertemu dengan sengaja, misalnya datang ke Archery Range Kamis sore untuk ketemu X.
- Ini mengganti sebagian keacakan initiative dengan keteraturan yang bisa dipelajari, dan cocok dengan dossier yang membuka Haunts per rank.

**4.8 Dunia hidup antar-NPC (S)**

- Baris Meanwhile dan beat ambience memakai `whereabouts` dan `relations.json`: "X dan Y terlihat berlatih bersama" untuk rivals/friends, atau "X menghindari Y" untuk dislike.
- Hanya relasi yang sudah terlihat pemain.
- Relasi "story" (`New_relations`) bisa menua: kalau tidak diperbarui dalam beberapa minggu, relasi itu memudar dari peta Connections.

**4.9 Papan misteri yang hidup (S)**

- Jalur rumor ke Clue sudah ada. Langkah berikutnya: Clue punya tautan ke tempat, sehingga di peta, tempat yang terkait thread terbuka diberi tanda.
- Mengunjungi tempat itu memberi beat ambience "jejak" dari `rollTable` (sekali per thread per minggu).
- Prinsip: membuka informasi, bukan ending atau solusi otomatis. Thread hanya ditandai "solved" oleh cerita.

**4.10 Tugas dan proyek kelompok (K–S)**

- Assignment adalah entri Agenda dengan `Kind "assignment"`. Progress-nya menambah persiapan ujian mata pelajaran itu.
- Proyek kelompok dengan rekan sekelas memberi bond XP lewat sesi latihan bersama (track "study").
- Rekan yang malas (sesuai kepribadian NPC) bisa menambah Tension.

**4.11 Kompetisi lanjutan (S)**

- Hasil kompetisi sudah terhubung. Berikutnya: persiapan tim memakai sesi latihan bersama rekan tim, dan scouting lawan memakai lore akademi rival yang terbuka per pertemuan di area luar.
- Harga reputasi tinggi: ekspektasi staf naik, dan kekalahan berikutnya memotong reputasi lebih besar.

### C. Alat untuk pemain dan owner (UI saja, tanpa biaya prompt)

**4.12 Panel "Kesehatan save" (K)**

Isinya: versi lorebook/kartu/MVU, ukuran state per pesan, error engine terakhir, dan telemetri (berapa kali tulisan narrator di-revert dan reminder muncul, per jenis). Setelah refactor besar, panel ini juga menjadi alat utama untuk memantau regresi di playtest.

**4.13 "Sebelumnya…" saat membuka chat lama (K)**

Ringkasan dari Journal, `$Recent` bond terdekat, dan feed Agenda terdekat. Hanya UI.

**4.14 Ekspor/impor Student file (K)**

Simpan dan muat JSON siswa untuk mulai chat baru (atau tes Year 2) dengan siswa yang sama. Template pribadi owner bisa dipindah ke file bila owner mau. Keputusan tetap di owner.

**4.15 Alat authoring konten untuk owner (S)**

Karena area, tabel roll, dan rutinitas NPC sekarang berupa data, sebuah validator dan pratinjau kecil akan sangat mempercepat penulisan konten:
- skema JSON plus tes otomatis "setiap area atau tabel valid"
- halaman pratinjau di `tests/preview` yang menampilkan peta area, rute, dan contoh hasil roll per seed

### D. Arah desain jangka panjang ([canon], perlu draft)

**4.16 Setelah Year 3**

Engine tidak memainkan kelulusan `{{user}}` (`engine.template.js:3649`), dan kampanye tidak punya ending. "Year 4+" perlu ditentukan, misalnya asisten atau senior mentor, riset di Archive, magang Royal Mage, atau staf. Dengan Area dan Agenda, mode ini bisa dibangun sebagian besar dari data.

**Tidak disarankan** (bertentangan dengan prinsip): ending atau rute, plafon untuk kenaikan Tension, reward kenang-kenangan tanpa guna, dan XP tanpa batas mingguan.

---

## 5. SARAN LANGKAH / ARAH PROJECT KE DEPAN

### Titik awal

- Program konsolidasi Bagian 1 adalah perubahan terbesar sejak awal project: hampir semua subsistem disentuh.
- Begitu selesai, risiko utamanya bukan lagi duplikasi, tetapi **regresi tersembunyi dan save lama**. Jadi langkah pertama sesudahnya adalah stabilisasi, bukan fitur.

### Tahap A — Stabilisasi setelah refactor (1 rilis)

1. **Uji migrasi save:** semua fixture save (1.15 sampai versi terakhir) dimuat oleh engine baru tanpa kehilangan data. Ini perlu perhatian khusus untuk:
   - `$ui` yang dirampingkan
   - `$eng` area lama (`exp`, `cap`, `sr`) yang pindah ke format Area
   - `Trip.Active` lama
   - Training dan Practice yang digabung
2. **Playtest live di SillyTavern** untuk hal yang tidak bisa dites di Node: `<now>` dari `$ui.now`, Cast Sheet per entri, MVU yang di-pin, dan regex.
3. **Baseline angka**, untuk dibandingkan ke depan: token always-on, ukuran state per pesan, waktu engine per update, dan ukuran `engine.js`/`ui.js`.

### Tahap B — Fitur murah dan berdampak (2–3 rilis kecil)

Urutan yang disarankan: 4.12 → 4.3 → 4.2 → 4.13 → 4.14 → 4.6 → 4.10. Semuanya ukuran K atau K–S, hampir tanpa biaya prompt, dan langsung terasa oleh pemain.

### Tahap C — Gameplay inti baru (2–4 rilis)

- 4.5 (minggu rutin) lebih dulu, karena paling mengubah tempo bermain.
- Lalu 4.7 → 4.8 → 4.9 → 4.4 → 4.11.
- Tiap fitur boleh ditulis sebagai rilis sendiri, tetapi **hanya dengan subsistem yang sudah ada** (aturan "anggaran mekanik": subsistem paralel baru butuh alasan tertulis).

### Tahap D — Konten

- 4.15 dikerjakan lebih dulu, supaya penulisan konten cepat dan aman.
- Lalu area baru (4.1), dimulai dari World Competition.
- Gelombang canon dan cohort berikutnya.
- Draft "setelah Year 3" (4.16).
- Dari titik ini, sebagian besar rilis seharusnya berupa **data dan lore**, bukan kode. Itulah hasil investasi konsolidasi.

### Kebiasaan proses yang disarankan

- **Ukur setiap rilis** (satu baris di changelog): token always-on, ukuran state per pesan, waktu engine per update, dan ukuran file. Bandingkan dengan baseline Tahap A.
- **Kebijakan dependensi:** semua URL CDN di-pin, dengan daftar versi yang sudah diverifikasi dan checklist kecil saat menaikkannya.
- **Prioritas dari data:** telemetri gesekan narrator (panel 4.12 dan `tools/audit_chat.py`) menentukan perbaikan berikutnya.
- **Jaga satu sumber:** tes yang gagal bila muncul konstanta kalender, tabel musim, atau Dijkstra baru di luar `shared.js` dan modul Area. Ini mencegah duplikasi tumbuh lagi.
- **Rilis kecil:** satu fitur atau satu area per rilis, dengan fixture save sebelum setiap rilis (aturan yang sudah ada).
