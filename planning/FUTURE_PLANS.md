# Future plans dan item terbuka

Satu-satunya daftar pekerjaan yang **belum** dikerjakan. Aturan: begitu sesuatu diterapkan, hapus dari file ini (riwayatnya ada di
`CHANGELOG.md` dan git). Canon/desain baru: draft dulu di `planning/DRAFT_<topik>.md`, terapkan setelah owner bilang "proceed", lalu
hapus draft itu di rilis yang sama. Pengecekan live di SillyTavern ada di `docs/TEST_CHECKLIST.md`, bukan di sini.

## 0. Rilis berikutnya (owner, 2026-10-24)

Versi saat ini 2.0.0 (batch 8 bug hunt); rilis berikutnya langsung 2.1.0 (owner, 2026-10-24). Nomor di §0.1 berlaku bila roadmap itu rilis lebih dulu; pekerjaan lain yang rilis lebih dulu mengambil nomor berikutnya dan
roadmap bergeser satu.

| Pekerjaan | Isi | Catatan |
|---|---|---|
| **Sisa bug hunt** | `audit/AUDIT_2026-10-23_2_audit_menyeluruh.md` §8 | Batch 1–6 dan batch 7 tahap 1 selesai (1.99.2–1.99.8), batch 8 selesai di 2.0.0 bersama audit singkat §11. Sisa: batch 7 tahap 2 (lore kata kunci ke kedalaman chat, rangkuman tanpa angka, pangkas per blok), menunggu angka cached tokens OpenRouter sesudah 1.99.8 (SQ-CACHE) dan uji A/B `tools/audit_chat.py`. |

### 0.1 Dunia bergerak (owner, 2026-10-24)

Tujuan: dunia tetap bergerak walau {{user}} tidak ada di adegan. Prinsipnya **engine menghitung, narator hanya menulis prosa**: roll
seeded (`sh:roll100`, `pickOf`, `rollTable`), tidak ada kejadian yang dikarang LLM. Owner memilih R1, R3, M1–M4, B1 (sebagai
Routine 2.0) dan B3; R2 (Meanwhile lebih longgar), R4 (setel toggle lama), B1 versi simulasi agen, B2 (alur pribadi NPC) dan B4
(panggilan model kedua) tidak dipilih. Urutan rilis di bawah mengikuti ketergantungan. Hapus barisnya begitu rilisnya selesai.

| Rilis | Isi | Butuh | Catatan |
|---|---|---|---|
| **2.1.0** | **R1** Feed "Campus now" | kode saja | Kemenangan cepat; Routine 2.0 nanti memperbaikinya otomatis. |
| **2.1.1** | **R3** Isi `data/campus_phases.json` | draft canon | Engine sudah mencetaknya sejak 1.6.1; datanya kosong. Fase jadi konteks B3. |
| **2.2.N** | **B1** Routine 2.0 | draft data per kelompok | 2.2.0 = format + engine + kelompok pertama; 2.2.1 dst. = kelompok berikutnya; terakhir baris "perkembangan". Full suite (fitur besar). |
| **2.3.0** | **M1** kejadian off-screen + **M2** feed memuatnya | draft tabel kejadian | Sesudah B1: kejadian diambil dari baris routine yang benar-benar dijalani NPC. |
| **2.4.0** | **M3** rubrik koran + **M4** akibat yang sampai ke {{user}} | kode | Butuh kejadian M1. M3 sekaligus menyiapkan rubrik yang dipakai B3. |
| **2.5.N** | **B3** Politik kampus | draft langkah faksi | 2.5.0 = lite (Doves + Council); 2.5.1 = asrama, Liaison, Cathedral, Choir (tersembunyi). Full suite. |

**R1. Feed "Campus now" (2.1.0).** Daftar "nama : kegiatan - lokasi" dari `sh:whereabouts` (yang sudah dipakai engine, kartu Map
`p20:locCard` dan Look for, jadi selalu cocok dengan Who is here): `busy` (kelas, klub, mengajar, Study Hall), `rt` (tempat + alasan),
NPC_status, sakit, pulang libur; tanpa routine di jam itu: "around <haunt>". 3 nama di lipatan bracelet, semua di People panel; dipilih
`pickOf` seeded berbobot rank bond (sama di setiap swipe). Hanya NPC yang sudah dikenal (ada bond atau sudah bertemu), supaya NPC yang
belum ditemui tidak bocor. Hanya UI: 0 token prompt, narator tidak menerimanya. Toggle Features baru.
- **Isi ikut kedekatan (owner, 2026-10-24, supaya Look for tidak mati):** lokasi pasti hanya untuk NPC yang field Routine-nya di
  dossier sudah terbuka (info layers 1.89.0); kenalan hanya kegiatan yang terlihat semua orang (kelas, klub, sakit, pulang libur),
  jam bebas "free" tanpa lokasi. Feed = "teman sedang apa", Look for = "aku mau menemui orang ini".
- **Tidak pernah membantah Look for:** lokasi hanya ditulis bila Look for pasti menemukannya: kasus pasti (`busy`, routine, status,
  sakit, libur) apa adanya; regular hanya bila roll Who is here blok ini menaruhnya di sana (Look for memakai tarikan yang sama dengan
  peluang lebih besar); selain itu "somewhere on campus" (menggantikan "around <haunt>"). Orang lewat (passing through) tidak masuk.
  Ikut aturan cuaca `presenceAt`/`lookFor` dan hasil Look for yang ditahan (`V.look`).
- **Meanwhile** (`stepBondMemory`, Rank 7+, mingguan) masih membaca `HAUNT` ("was seen around …"), bukan `whereabouts`: bisa membantah
  feed. Arahkan ke `whereabouts` di rilis ini (dan ke kejadian M1 di 2.3.0).

**R3. Fase kampus (2.1.1).** Isi `phases` (`id`, `from`, `to`, `line`) di `data/campus_phases.json`: apa yang menyibukkan kampus dan
orang pentingnya dalam rentang tahun ini (minggu ujian, persiapan festival, Thinning, pemilu). Engine (`stepCampusEvents`) sudah
menaruh baris fase aktif di `<now>` (±30 token selama aktif). Canon baru: draft dulu.
- Baris fase bukan optional thread (505 tidak menghitungnya, biarkan begitu). Jangan mengulang yang sudah dikatakan baris event
  kalender, `exams` di `npc_moods.json` atau lockdown Thinning: fase hanya untuk yang tidak dikatakan data lain.

**B1. Routine 2.0 (2.2.N).** Pengembangan `data/npc_routines.json`, bukan simulasi agen: engine hanya memilih di antara baris yang
ditulis dari lore dan disetujui owner, jadi tidak bisa keluar karakter.
- Hari penuh per NPC: pagi sebelum kelas, siang, sepulang kelas, malam sebelum jam malam, akhir pekan (sekarang 60 NPC, 120 baris).
  Urutan prioritas lama tetap: status, sakit, kelas, mengajar, Study Hall, klub, pemilu di atas routine; haunts tetap cadangan.
- Pilihan berbobot per blok lewat `rollTable` (baris utama 70 = angka keputusan lama; sisa 30% kini punya isi, bukan "tidak di mana-mana").
- Syarat dari data yang ada: cuaca (`wx`: ke mana NPC pindah saat cuaca mengusirnya dari tempat terbuka, `shared.js` presenceAt/lookFor),
  mood (`mg:moodOf`), minggu ujian dan `clock` (`npc_moods.json`), hari acara (`ev`), dan baris bersama dua NPC dari `REL_PAIRS`
  (pair moment benar-benar di tempat yang sama).
- Perkembangan: baris dengan rentang bulan/tahun kampanye atau syarat `setelah` (event, Secrets_revealed, Lore change).
- Tanpa state baru dan tanpa migrasi: semua roll seeded per hari, jadi "apa yang dilakukan X minggu lalu" dihitung ulang, tidak disimpan.
  Meanwhile bisa memakai hitungan itu ("empat sore di Library minggu ini").
- Kerja: perubahan kecil di `whereabouts` + validator di `tools/common.py` `presence_data`; fixture `tests/fixtures/presence_*` dan
  odds Look for (`sh:lookFor`) disesuaikan. Konten ±500–700 baris: putaran pertama dibuat otomatis dari venue klub, haunts, `clock`,
  `loves`/`hates` cuaca, asrama dan lantai tahun; owner meninjau per kelompok seperti ronde drafting NPC.
- Menyentuh DECISIONS "NPC routines" (1.52.0: "kebiasaan mingguan ringan", roll 70%): owner sudah memilih Routine 2.0 (2026-10-24);
  angka 70 tetap, "ringan" berubah jadi hari penuh. Perbarui baris DECISIONS itu di rilis 2.2.0.
- **Supaya tidak melemahkan Who is here / Look for (cek 2026-10-24):**
  1. `presenceAt` menganggap routine di tempat itu *pasti*; hari penuh = hampir semua NPC pasti di suatu tempat, jadi roll keramaian
     (target ambience) dan orang lewat 8% nyaris tak terpakai, dan tempat "sepi" bisa penuh. Ini merusak tujuan DECISIONS "Who is
     here is rolled" (1.99.11): datang ke tempat dan tidak bertemu siapa pun, sesuai ambience. Maka:
     - Tabel per blok wajib punya hasil **free** (sebagian dari sisa 30%) yang jatuh ke roll keramaian seperti sekarang.
     - Baris diberi jenis: **duty** (shift, kerja, jabatan, mis. Irene di Library Assistants) tetap pasti; **habit** (santai,
       kebiasaan) ikut roll keramaian dengan bonus (pola Look for), jadi tempat sepi tetap bisa kosong.
     - Validator `presence_data`: peringatan bila satu tempat dan blok punya lebih banyak orang pasti daripada target keramaiannya.
     - Uji: persen kunjungan yang tidak menemukan siapa pun per tingkat keramaian (0–4), sebelum dan sesudah; harus tetap dekat angka
       sekarang (hitungan kasar: keramaian 0 ≈ 80% kosong, termasuk orang lewat 8%).
  2. Look for selalu menemukan NPC di routine-nya; hasil free menjaga ketidakpastiannya. `lookHabit` melaporkan baris utama.
  3. Cuaca: baris `wx` routine dulu, aturan umum pengusir tempat terbuka (`presenceAt` moved, `lookFor` weather) hanya untuk NPC tanpa
     baris `wx`; jangan dihitung dua kali.
  4. Baris bersama `REL_PAIRS`: satu roll bersama untuk kedua NPC (bukan dua roll terpisah), dan beat pair ambience tidak mengulangnya.
  5. Blok routine = batas `BLOCKS_AT` (06:00, batas periode, 18:00, 20:00), supaya orang tidak pindah di tengah blok Who is here.
  6. Cerita hantu `alone` (`stepAmbience` uncanny) butuh tempat tanpa orang (`hereIds`); lebih banyak orang pasti = momen uncanny lebih
     jarang. Ukur sebelum/sesudah (replay seed) dan sesuaikan bila turun jauh.
  - Efek sekali: saat update, posisi NPC di blok yang sedang berjalan bisa berubah (kunci roll baru); tanpa kehilangan data.

**M1 + M2. Kejadian off-screen (2.3.0).** Tiap hari 3–5 NPC di-roll; satu kejadian kecil dari tabel `data/offscreen.json` (latihan,
hasil klub, cekcok dengan rival dari `REL_PAIRS`, surat dari rumah, nilai ujian, beli sesuatu), disaring oleh data NPC (klub, haunts,
`loves`/`hates`) dan oleh baris routine yang dia jalani hari itu (B1). Masuk ke `$Recent` NPC sebagai "(Off-screen) …" (jalur yang
sudah dipakai rencana `Next` yang lewat, `stepBondMemory`), jadi tampil di Cast Sheet saat NPC itu kembali ke adegan (±15 token per
baris, hanya saat hadir). Tidak mengubah bond, Trust, Tension atau reputasi {{user}}; kabar ke teman lewat "Word gets around" yang
sudah ada. M2: feed R1 menampilkan kejadian itu ("Caspian : rapat panitia - Council Chamber (kemarin bertengkar dengan Irene)").
Teks tabel = konten karangan: draft dulu.
- **Cek tabrakan (2026-10-24):** `$Recent` hanya menyimpan 10 momen (3 terbaru ditulis dengan kata) dan isinya momen bersama {{user}};
  3–5 kejadian sehari bisa mendorong keluar momen itu pada NPC yang jarang ditemui. Batasi: paling banyak **satu** baris off-screen di
  `$Recent` per NPC (yang baru menggantikan yang lama). Label beda dari "(Off-screen)" rencana `Next` yang dia ceritakan sendiri.
- Meanwhile (Rank 7+, mingguan) mengambil kejadian M1 bila ada, supaya Journal dan Cast Sheet tidak bercerita dua versi.
- Tabel disaring menurut kepribadian (NPC bertindak sesuai karakter) dan tidak menyentuh rahasia (Morning Choir, `<narrator_only>`).

**M3 + M4. Akibat kejadian (2.4.0).** M3: rubrik "Around campus" di koran Senin (`cwNews`, `p30:paperCard`) dari kejadian M1 dan
gosip minggu itu; Notice Board/UI saja. M4: kejadian M1 jadi pintu masuk: alasan NPC initiative (`stepInitiative`, `INIT_ASKS`) boleh
diambil dari kejadiannya ("ingin cerita soal duel kemarin"); NPC yang cedera di happening (misalnya duel chalk) muncul di Healing Ward
(`restore_places.json` `medical_centre`); 0 token tambahan karena memakai jalur lama.
- **Cek tabrakan (2026-10-24):** nama "Around campus" sudah dipakai happenings (toast "Around campus: …", `<now>` "Around campus
  today", planner): beri rubrik nama lain (mis. "Campus life"). Koran Senin sudah memuat rumor kampus terbaru dan memperpanjang umurnya
  (`keep`); rubrik tidak boleh memperpanjang rumor lain, kalau tidak "Rumours going around" membanjir.
- M4 initiative: alasan dari kejadian ikut daftar "tidak terulang dalam 20" dan hanya sebagian alasan (mis. 1 dari 3), supaya alasan
  lama dan hari favour tetap muncul. NPC cedera = keadaan di atas routine (seperti sakit/status), supaya routine, feed dan Look for
  menunjuk ke Healing Ward.

**B3. Politik kampus (2.5.N).** Faksi dari `data/factions.json` bergerak sekali seminggu (Minggu malam, titik `stepSchoolWeek`;
routine week dan lompatan waktu tetap dihitung per minggu): tiap faksi memilih satu langkah dari `data/politics.json` dengan
`rollTable`, berbobot keadaan (kalender, fase R3, gosip `stepGossip`, insiden, Dove watch, reputasi {{user}}).
- Ukuran baru di `Campus_State` (perlu migrasi `stepMigrate`): Council = dukungan murid + agenda aktif; Doves = kewaspadaan 0–5;
  tiap asrama = semangat 0–100 (hanya warna: Dorm Ranking canon tetap dari nilai, lore 237); Liaison (Caine) = pengaruh.
- Dampak lewat sistem lama, tiap dampak wajib punya pengumuman yang bisa dibaca: Notice Board (`p30:officialNotices`), koran Senin
  (rubrik M3), bobot happenings (Dove sweep), penegakan jam malam (`curfewOf`), harga stall klub, mood asrama (`mg:moodOf`), pair
  moments rival asrama. `<now>` hanya satu baris (±20–40 token) saat langkah faksi menyentuh tempat atau hari itu.
- {{user}} ikut bermain: petisi Council (1.98.3) jadi usulan aturan, suara pemilu mewarnai agenda pemenang (hasil pemilu tetap dari
  mekanisme 1.86.0), dekat dengan Doves bisa meredam atau memanaskan razia. Reputasi faksi tinggi ada harganya (prinsip desain).
- Langkah Council disaring sesuai siapa yang menjabat (NPC bertindak sesuai karakter). The Morning Choir tidak pernah tampil sebagai
  faksi: langkahnya hanya muncul sebagai kejadian aneh dan trace beat sampai rahasianya ada di `Secrets_revealed`.
- 2.5.0 lite: Doves + Council, dampak hanya lewat Notice Board, koran dan bobot happenings. 2.5.1: asrama, Liaison, Cathedral, Choir,
  harga, jam malam dan mood.
- **Cek tabrakan (2026-10-24):**
  1. **Happenings** dihitung murni dari seed, dirantai setahun dari hari pertama dan di-cache (`happeningOn`, `HAPY`), dan planner
     menampilkan happening yang akan datang. Bobot dari keadaan faksi akan mengubah hari lain secara mundur dan membuat ramalan
     planner berubah. Dampak harus lewat jalur terpisah (misalnya sweep tambahan yang di-roll sendiri pada minggu itu), bukan bobot di
     `rawHappening`. Jangan juga mencuri bobot dari happening kerja berbayar (sumber uang).
  2. **Tiga ukuran Dove:** Dove attention (pribadi, hidden magic), reputasi Doves, dan kewaspadaan kampus yang baru. Tetapkan satu
     aturan: kewaspadaan tidak menaikkan attention langsung dan tidak menurunkan reputasi Doves (aturan mingguan Krieg dan Mastery
     Arcana bergantung padanya); paling jauh mengubah peluang razia/sweep.
  3. **Jam malam:** mengubah `curfewOf` ikut menggeser chip Next, Agenda, blok "malam sebelum jam malam" B1 dan jendela XP pesta ulang
     tahun (18:00 sampai jam malam). Lebih aman memperketat penegakan (peluang tertangkap) daripada memajukan jamnya.
  4. **Mood asrama** lewat `mg:moodOf`: satu asrama Bad seminggu menekan obrolan, maaf dan hadiah untuk seperempat roster. Batasi
     (mis. paling jauh satu langkah, hanya hari tertentu).
  5. Petisi Council (1.98.3) tetap memberi Interaction bantuan dan `student_notice_help`; hasil pemilu tetap dari mekanisme 1.86.0.
  6. Baris `<now>` B3 dan M4: tentukan apakah masuk daftar optional thread (505 `OPT`, satu per balasan); kalau masuk, ia bersaing
     dengan happening, Here now, rumor dan initiative.

## 1. Rencana owner (dicatat, belum dijadwalkan)

| Rencana | Label | Paling lambat | Alasan |
|---|---|---|---|
| Bab baru (memory audit M14, batch 8): pindah ke file chat baru tanpa kehilangan memori | **[±20.000 PESAN]** | saat chat ±20.000 pesan, simpan > ±2 detik, atau file > ±100 MB | Rencana lengkap, sudah diputuskan: `planning/DRAFT_bab_baru.md`. "Kerjakan batch 8" = kerjakan draft itu. |
| World Competition Year 2: Caelmar sebagai tuan rumah | **[YEAR 2]** | Year 2 M11 W3 (World Competition) | Sisa `DRAFT_world_competition.md` (dihapus 1.97.5). Year 1 punya Area Hanakaze dan liner Yozakura; Year 2 (Caelmar) belum punya Area, peta, maupun penerbangan (`airship.json` `who: world` hanya `y: 1`), jadi national four Year 2 "di luar negeri" tanpa kota. Perlu: Area Caelmar (pola `data/hanakaze.json`), petanya (`planning/MAP_PROMPTS_outside_maps.txt`), liner, venue `event_frame.json` `world.venues.2`. Kesempatan ulang skenario Vesna di Year 2 sudah jalan tanpa Area. Year 3 memakai Avalon yang sudah ada. |
| FP4 Anggota baru tim rival | **[YEAR 2]** | Year 2 M9 W4 (Kingdom Competition) | Tim rival baru benar-benar tampil di Kingdom Competition. Sebelum itu entry tim hanya menulis "none on record yet". Sejak 1.84.0 tempat anggota yang lulus diisi peserta karangan narator dengan role yang sama (`sh:kcTeams`); FP4 menggantinya dengan anggota yang dirancang. |

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
- **Sisa audit dialog NPC 2026-10-21** (`audit/AUDIT_2026-10-21_1_slop_dialog_npc.md`; owner memilih U2 saja, selesai di 1.77.1): U1 mode
  `--prose` di `tools/audit_chat.py` (pertanyaan menu dan barang bawaan per NPC, salinan adegan contoh, 6-gram berulang, negasi
  kontrastif; 0 token prompt; prototipe `audit/slop_scan_prototype_2026-10-21.py`); U3 toggle preset E4 untuk pertanyaan menu "X, atau Y?" di akhir giliran NPC,
  hanya bila ekspor 1.77.1 masih menunjukkannya (menyentuh DECISIONS §9); U4 `never_sounds` juga di lembar ringkas (NPC kelima dan
  seterusnya); U5 alat perbaikan pengulangan di riwayat (Chat Repetition Refactor, WH Editor), setelah kodenya dicek terhadap MVU.
- **Megumin audit MS3 tahap 2** (`audit/AUDIT_2026-10-21_2_megumin_suite.md`; tahap 1 di 1.80.0): hanya bila laporan
  `audit_chat.py --mechanics` dari ekspor kampanye mencantumkan beberapa "Records not in the story": engine menandai Clue itu `_Unseen`,
  `stepReminders` mengingatkan sekali, Mystery Board menampilkannya redup; Clue `Source` `records` dikecualikan.
- **Pratinjau siapa yang ada di tempat tujuan** (sisa 1.99.11): sekarang orang di tempat yang baru dicapai muncul mulai balasan berikutnya.
  Alternatifnya, 505 membaca tujuan dari `lastUserMessage` dan menghitung roll tempat itu sebelum balasan; perlu data presence dan
  `crowdAt` di 505 dengan hasil yang persis sama dengan engine (blok waktu setelah berjalan, cuaca), atau engine menyimpan roll per tempat
  (ukuran state per pesan). Hanya kalau playtest menunjukkan jeda satu balasan terasa janggal.
- **Club buatan sendiri, lanjutan** (sisa DRAFT_club_sendiri §6, 1.75.0): aksi Practice khusus di ruang club-nya (sekarang hanya Saturday
  club time yang memberi XP Field); status club olahraga (larangan sihir, bracket Sports Day); anggaran club.
- **Kerja club, lanjutan** (sisa DRAFT_kerja_club §5, 1.90.0–1.92.0): Beast Handling menangkap makhluk lepas (happening `loose
  creature` yang menunggu ditangkap), Warding Study memperbaiki rune hangat kolam yang rusak; keduanya butuh sistem dulu. Club hobi
  (Tea, Card, Board Game, Drawing, Calligraphy, Specialized Magic, Camping) tidak punya layanan di lore.
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

Sisa saran audit fitur 2026-10-03 (4.5–4.10 sudah dibuat di 1.49–1.52; 4.16 ada di §4):
- **Area baru cukup dari data** (4.1): World Competition di luar negeri, kota terdekat untuk hari Minggu, variasi Expedition Year 2/3
  (bobot tabel lain). Syarat: tanpa kode baru di modul Area; kalau butuh kode, modulnya yang diperluas.
- **"Cari seseorang"** (4.2): baris "Kemungkinan sekarang" plus Go here dan waktu jalan di dossier/People dari `whereabouts` (Map sudah
  punya "Usually here"); gerbang Haunts tetap berlaku.
- **Petunjuk hadiah di Shop** (sisa 4.3): tandai item yang diketahui disukai NPC dekat. Daftar hadiah di scene card sudah menampilkan
  reaksi yang pernah terlihat (1.71.0).
- **Tawar-menawar dan pasar musiman** (4.4): Fortune roll di Bazaar, Avalon, Sunreach; stok musiman dan penjual keliling dari
  `rollTable`; harga hasil tawar dibatasi.
- **Kompetisi lanjutan** (4.11): persiapan tim lewat sesi latihan bersama, scouting lawan, ekspektasi staf naik setelah juara.
- **Alat UI tanpa biaya prompt** (4.12–4.15): panel kesehatan save (versi, ukuran state, error terakhir, telemetri revert dan
  reminder), ringkasan "Sebelumnya…" saat membuka chat lama, ekspor/impor Student file, validator dan pratinjau data area dan tabel roll.

- **Audit preset ke-2, tingkat 2** (owner 2026-10-04: setelah uji live tingkat 1 di 1.52.2): memangkas isi unik modul upstream,
  ±900–1.000 token: Don't Speak Like a Therapist (padatkan daftar gerakan dan REDIRECT, ±200), Monomania (tiga contoh perbaikan dan
  paragraf penutup, ±150), NPC Voice (contoh CAPS dan "grape soda", ±120), Anti-Sycophancy (padatkan prosedur, ±100), Human Vocal
  Limits, HQ NPC Genesis dan paragraf "Scene end" Scene Engine (±300). Risiko: gaya Gemini bisa bergeser; port RF berikutnya lebih
  repot. Detail: `git show bdcc889:planning/DRAFT_preset_audit_2.md` (dihapus di 1.52.2).

- **Mail Tower dan Morning Choir** (sisa `DRAFT_surat.md` §9, kanon): keeper Mail Tower adalah ayah Castor, anggota Choir, dan Castor
  memakai Mail Tower sebagai sumber berita kampus (lore 129). Ide: Choir diam-diam membaca surat {{user}}, jadi petunjuk Mystery Board.
  Butuh keputusan kanon owner.

- **Sisa audit fitur dangkal 2026-10-23** (`audit/AUDIT_2026-10-23_1_kedalaman_fitur.md`; owner memilih batch 2, 4, 5, selesai di
  1.98.1–1.98.3; draft-nya tidak pernah di-commit dan dihapus di 1.98.3, jadi rancangan yang tidak dipilih diringkas di sini): **T7 Dorm Days** (event chances public lesson, type contest, booth, dorm
  tournament dan makan malam penutup lewat kondisi chance baru `dorm`/`year`; beat ambience `ev`; pemenang tournament diundi `ctStr`
  dan `rollTable`; opsional chance Circus, Harvest, Remembrance); **T2 Battle** (edge Fortune lawan roster lewat `ctStr`/`contestUser`
  → `c.contest`, kartu aturan `battle` sebagai panduan Combat_role tanpa angka, pengingat akibat pertarungan, angka Fortune di panel);
  **F1–F7** alat UI tanpa biaya prompt (lipatan "This week" dari `sh:replyDelta`, jatah bond harian/mingguan dari `$eng.daily`/`bweek`,
  waktu jalan di chip Next, tanda bentrok jadwal di Planner, progres penjelajahan di Map, kotak cari Journal, Clue di dossier).
- **Kingdom Competition di kampus** (sisa `DRAFT_kingdom_competition.md` §7, 1.84.0 membuat baris berita saja): peluang event selama
  minggu Kingdom untuk {{user}} yang tidak ikut tim (berita siang di announcement pillar, buku taruhan Aiden, broadsheet keluarga Linus
  lore 410) lewat `data/event_frame.json` `chances` `kingdom_comp`.

## 3. Sisa audit (sengaja ditunda)
- **K1 sisa** (audit 2026-10-23, 2.0.0 memecah `stepBonds` dan `councilYear`): `stepProficiency` (±375 baris), `stepSchoolWeek` (±349),
  `nowOf` (±258), `stepHidden` (±198). Pecah saat fungsinya disentuh berikutnya, dibuktikan dengan `ENGINE_DIFF` (jangan refactor tanpa
  alasan fungsional).
- **A8** (audit 2026-09-29) Cast Sheet 509 (±515 KB EJS): pecah per NPC hanya kalau terbukti ada lag saat prompt dibangun di ST (compile lokal ±7,7 ms).
- **A10** (audit 2026-09-29) PNG kartu ±8 MB (JSON disematkan dua kali, `chara` + `ccv3`): `chara` ringkas hanya setelah kompatibilitas pembaca v2 dicek.

## 4. Keputusan yang masih menunggu owner
- Siklus hidup {{user}} setelah Year 3 (lulus / dikeluarkan / mengulang). Sejak 1.7.4 Year naik otomatis; payout tetap jalan. Owner:
  "biarkan dulu".
- Siswa yang ditahan cerita (dihapus dari `Campus_State.Graduated`) tidak lulus otomatis di tahun berikutnya (roster: "repeating").
- Review spoiler: `data/field_overrides.json` dan `data/_review_sensitive_flags.json` (tertunda sejak Batch 1).
- Preset: varian MAX CoT belum diadaptasi (hanya BOLT). Micro CoT tidak perlu: sejak 1.52.2 BOLT (±1.810 token) sudah tidak lebih berat dari Micro (±1.840).

## 5. Angka yang bisa disetel setelah playtest
- Cuaca dan kondisi: bobot cuaca dan rare event, `FC_TRUE` 75, ambang kondisi (20/5/30/60 menit, 0/8/28 °C), peluang Head cold,
  gelombang flu, pengali tidur, jendela hook (−30 menit / +3 jam) dan umur "old" (14 hari), umur rumor (3 / 21), Bag 40, hooks 15.
- Sistem: ambang/cap reputasi dan bonus Academy +5, Tension tinggi 70, Krieg +14, persen training (sebagian bisa diubah pemain di
  Settings, `data/tuning.json`), payout, cap bond harian, pemulihan tidur/istirahat, cap 40 HP, kenaikan Dove attention, jeda bertemu (Rank 2, 7 hari) dan
  tanya kabar (Rank 3, jendela 10 hari; 1.73.0), kabar ke teman (2 hari) dan ikatan (Rank 6; 1.74.0).
- Kingdom Competition (1.84.0, `data/event_frame.json` `kingdom`): peluang menemukan 25, tanda 40, menyergap 25, taktik (hunt 1,5; sneak
  mundur 60; hold 20), kekuatan beast IV/III/II 30/55/80, gagal melawan beast mematahkan segel 40%, tambahan rival +10 dan Rank 1 +15.
  Hasil 100 seed: juara Halvard 27, Ashvale 29, Myrdath 32, Veyra 12; ronde dua selesai sebelum 18:00 di 51.
- Siapa yang ada (1.99.11, `data/npc_routines.json` `here`): target regular per keramaian 0,15 / 0,5 / 0,9 / 1,4 / 2,0, cap 60%, orang
  lewat 8%, maksimal 3 nama; rutinitas 70% (`rate`) yang membuat jam 16:00–18:00 di Club Rooms, Main Library dan Combat Grounds selalu
  ramai. Ukur dulu dengan `audit_chat.py --mechanics` (dibawa masuk tanpa diminta) pada ekspor kampanye.
- Memori: `HAPPEN_RATE`, kedalaman trim 24, jendela Journal 30, `FACTS_VISIBLE` 10, cap Clues 40.
- Proficiency dan crafting (draft proficiency 1.25–1.30): ambang XP (10/30/60/100/150), cap mingguan 6 dan pace, XP per sumber,
  modifier Fortune per rank dan cap +20, DC dan band crafting, dosis dan yield, harga jual, upah menagerie, bobot grade 50/30/20 dan
  30/50/20, roll hari ujian (±4/±8), batas A/B/C/D, bonus bond Society, XP masterwork 3, daftar bangsawan untuk Consummate.
- Lokasi (1.31.0): pengali tempat pemulihan dan aturannya (`data/restore_places.json`), paket surat ke rumah (50/30/20, 10–30
  coin, `data/letters.json` `home`), upah bell-keeper 30, gosip 60% (`ambience.json` `lore_places`), Trust Old Hut +1 per bulan.
- Surat (1.95.0, `data/letters.json`): balasan kampus 2–3 hari (90 − Tension × 0,6, minimal 25), jauh 5–8 (70%), lain 3–5 (80%);
  keluarga duluan minggu 3, 60%; teman duluan 35% per minggu, Rank 3, Tension < 50, tak bertemu 7 hari (3 saat pergi), jeda 28 hari.
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
