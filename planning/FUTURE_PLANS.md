# Future plans dan item terbuka

Satu-satunya daftar pekerjaan yang **belum** dikerjakan. Aturan: begitu sesuatu diterapkan, hapus dari file ini (riwayatnya ada di
`CHANGELOG.md` dan git). Canon/desain baru: draft dulu di `planning/DRAFT_<topik>.md`, terapkan setelah owner bilang "proceed", lalu
hapus draft itu di rilis yang sama. Pengecekan live di SillyTavern ada di `docs/TEST_CHECKLIST.md`, bukan di sini.

## 0. Jalan ke 2.0 (owner, 2026-10-22)

Tahap terakhir sebelum 2.0, berurutan (1.98 selesai di 1.98.1–1.98.3; 1.99 = Summaryception, selesai di 1.99.1). Hapus barisnya begitu
tahap itu selesai.

| Rilis | Isi | Catatan |
|---|---|---|
| **Bug hunt** | Full audit bug hunt, stress test, dan perbaikannya | Sesudah 1.99 (owner 2026-10-23: 1.99 jadi kompatibilitas Summaryception, selesai di 1.99.1). Full suite, stress test, audit lintas sistem; hasilnya `audit/AUDIT_2026-10-23_2_audit_menyeluruh.md` §8 (8 batch), tiap batch satu rilis 1.99.N (batch 1 = 1.99.2, batch 2 = 1.99.3, batch 3 = 1.99.4, selesai). |
| **2.0.0** | Full polish fitur dan UI | Tanpa fitur baru. |

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

## 3. Sisa audit 2026-09-29 (sengaja ditunda)
- **A8** Cast Sheet 509 (±515 KB EJS): pecah per NPC hanya kalau terbukti ada lag saat prompt dibangun di ST (compile lokal ±7,7 ms).
- **A10** PNG kartu ±8 MB (JSON disematkan dua kali, `chara` + `ccv3`): `chara` ringkas hanya setelah kompatibilitas pembaca v2 dicek.

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
