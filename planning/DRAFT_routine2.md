# DRAFT — Routine 2.0 (roadmap B1, rilis 2.2.N)

Dicatat: 2026-10-24, atas permintaan owner ("lanjut draft 2.2.0"). Sumber: `planning/FUTURE_PLANS.md` §0.1 B1 (rencana, catatan cek
tabrakan, model dua lapis yang owner pilih dalam diskusi 2026-10-24).

**Status:** menunggu "proceed" owner. "Proceed" untuk draft ini juga berarti setuju dengan perubahan dua keputusan di §5.

## 0. Tujuan, singkat

- **NPC bergerak di luar {{user}}:** hari penuh per NPC (pagi, makan siang, sepulang kelas, sore sebelum jam malam, akhir pekan),
  dipilih per blok waktu dari baris yang ditulis dari lore. Engine hanya memilih di antara baris itu, jadi NPC tidak keluar karakter.
- **Dunia tetap tidak bisa ditebak:** routine hanya menentukan **di mana** NPC berada; **apakah {{user}} bertemu** dengannya tetap
  di-roll. Tempat sepi tetap sering kosong (owner: "tidak ada 100% ketemu, Halvard luas").
- Tanpa state baru, tanpa migrasi: semua roll seeded per hari dan blok.

## 1. Format data (`data/npc_routines.json` `npcs`)

Baris lama tetap berlaku: `[days, from, to, place, what]`. Baris baru menambah tiga kolom:

`[days, from, to, place, what, kind, weight, cond]`

- **kind:**
  - `duty`: shift, kerja, jabatan, persiapan koran;
  - `habit`: kebiasaan;
  - `errand`: beberapa tempat sekaligus, ditulis `"A|B|C"`, misalnya mengejar kutipan untuk koran.
- **weight:** peluang baris itu dipilih di bloknya. Baris yang aktif di satu blok membentuk satu tabel (`rollTable`); sisa sampai 100
  adalah **free**: tanpa lokasi, ikut roll keramaian seperti sekarang. Baris utama memakai 70 (angka lama owner), baris lain 15–40.
  Validator mewajibkan free minimal 10 di setiap hari, blok dan cuaca.
- **cond** (opsional):
  - `wx`: `fair`, `bad` (hujan, badai, gale) atau `fog`;
  - `pair`: id NPC lain. Baris bersama harus ada di kedua NPC (hari, jam, tempat sama) dan memakai **satu roll bersama**.

  Nanti (2.2.4): `since` / `after` untuk baris perkembangan.
- **Baris lama** (5 kolom) dibaca sebagai `habit` dengan bobot `rate` (70), jadi NPC yang belum digarap tetap berjalan seperti sekarang,
  hanya tunduk pada lapis pertemuan (§2).
- **Satu baris berada di dalam satu blok** (`BLOCKS_AT`: 06, 08, 10, 12, 13, 16, 18, 20). Baris lama yang lebih pendek (07:00–07:45)
  tetap boleh; di luar jendelanya NPC itu free.

## 2. Engine: dua lapis

**Lapis lokasi** (`sh:whereabouts`):
- Urutan prioritas tetap: status, sakit, kelas, mengajar, Study Hall, klub, pemilu, lalu routine, lalu haunts.
- Routine: satu tarikan per NPC per hari dan blok, `roll100(seed, dkey, blok, 'rt', id)` terhadap bobot kumulatif baris yang syaratnya
  cocok. Baris `pair`: tarikan memakai kunci pasangan (id urut), jadi keduanya sama-sama datang atau sama-sama tidak.
- Cuaca: baris `wx` dipilih lebih dulu. Aturan umum pengusir tempat terbuka (`wxOff`) hanya berlaku untuk baris tanpa `wx`.

**Lapis pertemuan** (`sh:presenceAt`):
- **Pasti** hanya satu ruangan yang terjadwal: kelas berjalan, guru mengajar, Study Hall, rapat Council (`busy`, seperti sekarang).
- **NPC yang routine-nya di tempat itu:** ditemui dengan peluang `here.meet`: `duty` 85, `habit` 65, `errand` 30 (di setiap tempatnya).
- **Regular tanpa routine** dan NPC yang **free**: roll keramaian ambience seperti sekarang.
- **Orang lewat 8%:** diambil dari NPC yang free dan yang sedang errand. Orang yang sedang di perjalanan antar-tempat menyusul di
  2.2.1, karena butuh data jalur peta Campus di `presence_data`.
- Maksimal 3 nama, urutan seeded, ditahan per blok: semua seperti sekarang.

**Look for:** NPC yang routine-nya di tempat itu ditemukan dengan peluang meet + 25, maksimal 90 (`here.look.routine`), memakai tarikan
yang sama dengan lapis pertemuan. Jadi siapa pun yang ditemui Who is here pasti ditemukan Look for, tapi tidak pernah 100% (DECISIONS
"Look for helps, never summons"). NPC yang duty atau habit di tempat lain tetap tidak pernah ditemukan.

**Yang ikut menyesuaikan:**
- **Campus now (2.1.0):** tempat dari baris yang terpilih; errand ditulis "running errands", free "somewhere on campus". Ceknya
  "Look for finds them there every time" berubah jadi "peluang tinggi".
- **Map "Usually here" dan field dossier Routine:** hanya baris utama (bobot 50 ke atas), supaya tetap pendek. Baris lain ditemukan
  pemain lewat bermain.
- **Initiative, Meanwhile, `lookHabit`:** membaca baris utama.
- **Validator** (`tools/common.py` `presence_data`):
  - tempat ada;
  - kind valid;
  - tidak melewati blok;
  - free ≥ 10;
  - `pair` punya pasangan;
  - peringatan bila satu tempat dan blok punya lebih banyak orang pasti daripada target keramaiannya.

## 3. Rencana rilis

| Rilis | Isi |
|---|---|
| **2.2.0** | Format + engine (§1–2) + **kelompok 1: Year 1 angkatan pertama** (9 NPC, §4): murid yang paling sering ditemui kampanye owner (Charles, Year 1). |
| 2.2.1 | Year 2 dan Year 3 (14 NPC) + orang yang sedang di perjalanan sebagai pelintas. |
| 2.2.2 | Staf, Doves, Cathedral, Facilities, Liaison (24 NPC). |
| 2.2.3 | Angkatan Year 2 dan Year 3 yang datang belakangan (13 NPC). |
| 2.2.4 | Baris perkembangan (`since` / `after`: bulan atau tahun kampanye, event, Secrets_revealed). |

Setiap kelompok mendapat draft tabelnya sendiri untuk owner tinjau, seperti §4. 2.2.0 menjalankan full suite (fitur besar).

## 4. Kelompok 1: Year 1 angkatan pertama (teks kartu, English)

Ditulis dari Haunts, Club, `clock` (pagi/malam), cuaca yang disukai/dibenci (`npc_moods.json`), relasi (`relations.json`) dan baris lama
(semua baris lama tetap ada, sebagai baris utama). 68 baris; dicek dengan skrip: semua tempat ada di `locations.json`, tidak ada yang
melewati blok, free ≥ 10 di setiap hari, blok dan cuaca, dan setiap baris pair punya pasangannya. Vesna hanya dipakai setelah transfer
(di Halvard), seperti sekarang.

**Aiden**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Merryhew's | — | habit | 55 |  |
| Mon-Fri | 12:00–13:00 | Canteen | taking bets over lunch | habit | 25 |  |
| Mon-Fri | 16:00–18:00 | Club Rooms | Card Club | habit | 45 |  |
| Mon-Fri | 16:00–18:00 | Notice Board / Common Rooms / Courtyards | collecting on bets | errand | 35 |  |
| Mon-Fri | 18:00–20:00 | Common Rooms | a card game that is never quite friendly | habit | 50 |  |
| Mon-Fri | 18:00–20:00 | Courtyards | wandering in the fog | habit | 30 | kabut |
| Sat | 18:00–20:00 | The Snug | settling bets | habit | 70 |  |
| Sun | 13:00–16:00 | Rooftop | phasing through the roof door | habit | 40 |  |
| Sun | 13:00–16:00 | Merryhew's | — | habit | 30 |  |
| Sun-Thu | 21:00–23:00 | Bell Tower | his curfew route | habit | 70 |  |

**Alyssa**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Gardens | sketching before class | habit | 45 | cuaca baik |
| Mon | 12:00–13:00 | Mail Tower | letter day | habit | 70 |  |
| Tue-Fri | 12:00–13:00 | Canteen | lunch with her sketchbook open | habit | 55 |  |
| Mon-Fri | 16:00–18:00 | Study Rooms | — | habit | 55 |  |
| Mon-Fri | 16:00–18:00 | Club Rooms | Drawing Club | habit | 30 |  |
| Mon-Fri | 18:00–20:00 | Common Rooms | drawing whoever sits still | habit | 45 |  |
| Sun | 13:00–16:00 | Rooftop | sketching the grounds with Zara | habit | 40 | cuaca baik, bersama Zara |
| Sun | 13:00–16:00 | Gardens | sketching | habit | 30 | cuaca baik |

**Caralynn**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Announcement Room | fighting for the broadcast slot | habit | 70 |  |
| Mon-Fri | 16:00–18:00 | Club Rooms | Music Club rehearsal | duty | 70 |  |
| Mon-Fri | 18:00–20:00 | The Mall | the Ardenne counter | habit | 40 |  |
| Mon-Fri | 18:00–20:00 | Portrait Hall | admiring the spot her portrait will hang | habit | 25 |  |
| Sun | 13:00–16:00 | Founder's Statue and Park | to be seen | habit | 60 | cuaca baik |
| Sun | 13:00–16:00 | Fire Dormitory | sulking about the weather | habit | 60 | hujan/badai |
| Sun | 13:00–16:00 | The Mall | the Ardenne counter | habit | 25 |  |

**Castor**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 07:00–07:45 | Gardens | early in the morning | habit | 70 |  |
| Mon-Fri | 12:00–13:00 | Canteen / Courtyards / Notice Board | chasing a quote for the paper | errand | 55 |  |
| Mon-Fri | 16:00–18:00 | Archive | newspaper research | habit | 60 |  |
| Mon-Fri | 16:00–18:00 | Canteen / Courtyards / Notice Board | chasing a quote for the paper | errand | 25 |  |
| Sat | 16:00–18:00 | Archive | newspaper research | habit | 40 |  |
| Sun | 18:00–20:00 | Club Rooms | putting Monday's paper to bed | duty | 75 |  |

**Percival**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Sports Field | a run before breakfast | habit | 50 |  |
| Mon-Fri | 12:00–13:00 | Canteen | the worst Lucky Roll fillings in front of an audience | habit | 70 |  |
| Mon-Fri | 16:00–18:00 | Sports Field | Soccer Club | habit | 70 | cuaca baik |
| Mon-Fri | 16:00–18:00 | Sports Field | playing on in the storm while everyone else runs in | habit | 45 | hujan/badai |
| Mon-Fri | 16:00–18:00 | Gymnasium | Soccer Club, moved indoors | habit | 35 | hujan/badai |
| Mon-Fri | 18:00–20:00 | Gymnasium | — | habit | 30 |  |
| Mon-Fri | 18:00–20:00 | Canteen | seconds | habit | 30 |  |
| Sun | 13:00–16:00 | Sports Field | a pickup game with anyone who turns up | habit | 60 |  |

**Trixie**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Courtyards | a performance nobody asked for | habit | 70 | cuaca baik |
| Mon-Fri | 12:00–13:00 | Common Rooms | an indoor performance nobody asked for | habit | 60 | hujan/badai |
| Mon-Fri | 16:00–18:00 | Club Rooms | Theatre Troupe | habit | 70 |  |
| Mon-Fri | 18:00–20:00 | Fire Dormitory | the common room's loudest corner | habit | 45 |  |
| Mon-Fri | 18:00–20:00 | Notice Board | putting up posters | habit | 20 |  |
| Sun | 13:00–16:00 | Menagerie | the animals | habit | 60 |  |
| Sun | 13:00–16:00 | The Mall | new sweets | habit | 25 |  |

**Vera**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Commissary | a Firetooth tin and straight back to work | habit | 35 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 35 |  |
| Mon,Wed,Fri | 16:00–18:00 | Workshop | — | habit | 70 |  |
| Tue,Thu | 16:00–18:00 | Workshop | lab partners with Zara | habit | 70 | bersama Zara |
| Mon-Fri | 18:00–20:00 | Workshop | still at the bench | habit | 50 |  |
| Mon-Fri | 18:00–20:00 | Potion Halls | — | habit | 20 |  |
| Sun | 13:00–16:00 | Workshop | — | habit | 50 |  |
| Sun | 13:00–16:00 | Medical Centre | — | habit | 20 |  |

**Vesna**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 07:00–07:40 | Menagerie | saying good morning to every animal by name | habit | 70 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 50 |  |
| Mon-Fri | 12:00–13:00 | Commissary | the sweets shelf | habit | 25 |  |
| Mon-Sun | 18:30–19:30 | Grassy Field and Hills | watching the sky | habit | 70 | cuaca baik |
| Mon-Sun | 18:30–19:30 | Common Rooms | — | habit | 50 | hujan/badai |
| Sun | 13:00–16:00 | Gardens | — | habit | 40 |  |
| Sun | 13:00–16:00 | Menagerie | — | habit | 30 |  |

**Zara**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 45 |  |
| Mon-Fri | 12:00–13:00 | Club Rooms | Tailoring Club | habit | 30 |  |
| Mon,Wed,Fri | 16:00–18:00 | Main Library | shelving work | duty | 70 |  |
| Tue,Thu | 16:00–18:00 | Workshop | lab partners with Vera | habit | 70 | bersama Vera |
| Mon-Fri | 18:00–20:00 | Sky Dormitory | making talisman charms for the Founder's Hand queue | habit | 45 |  |
| Sun | 13:00–16:00 | Rooftop | showing Alyssa the way up again | habit | 40 | cuaca baik, bersama Alyssa |
| Sun | 13:00–16:00 | Main Library | — | habit | 30 |  |

Catatan isi:
- **Aiden:** rute curfew di Bell Tower (21:00–23:00, sudah ada sejak 1.52.0) tetap. Menyukai kabut: baris kabut di Courtyards.
- **Caralynn:** membenci hujan, badai dan angin; hari Minggu yang buruk dia di asrama.
- **Castor:** Academy Newspaper terbit Senin (club work 1.90.0), jadi Minggu sore ada duty "putting Monday's paper to bed".
- **Percival:** menyukai badai (`loves Storm, Gale`), jadi saat hujan sebagian main terus di lapangan.
- **Pasangan:** Zara dan Vera (partner lab, `relations.json`) di Workshop Selasa dan Kamis; Alyssa dan Zara di Rooftop hari Minggu
  (Zara menunjukkan jalan ke atas, lore Alyssa).
- Event khusus (sirkus Month 8 untuk Trixie) menunggu 2.2.4, karena tempat sirkus tidak ditentukan di lore.

## 5. Keputusan yang berubah (butuh persetujuan; "proceed" = setuju)

- **DECISIONS "NPC routines" (1.52.0):** "light weekly habits" menjadi jadwal hari penuh berbobot. Angka 70 tetap sebagai bobot baris
  utama.
- **DECISIONS "Who is here is rolled" (1.99.11):** routine di tempat itu tidak lagi pasti. Routine menentukan lokasi; pertemuan tetap
  di-roll (duty 85, habit 65, errand 30). Pasti hanya untuk satu ruangan yang terjadwal.
- Tetap: "Look for helps, never summons", "Campus now … knowing is not meeting", prioritas status/kelas/klub, NPC bertindak sesuai
  karakter.

## 6. Tes dan cek live

- **Tes baru `test_routine2_v2200.cjs`:**
  - tarikan per blok seeded (swipe sama);
  - bobot dan free;
  - baris `wx` dan `pair` (keduanya datang bersama);
  - baris lama tetap terbaca;
  - lapis pertemuan: tidak pernah 100% di tempat luas, pasti di kelas dan Study Hall;
  - Look for tetap mengikuti Who is here dan tidak pernah 100%;
  - Campus now: errand dan free;
  - persen kunjungan kosong per keramaian 0–4, sebelum dan sesudah, tetap dekat angka sekarang (target: keramaian 0 tetap sekitar 80%
    kosong);
  - momen uncanny `alone` tidak turun jauh.
- **Fixture dan tes yang disesuaikan:**
  - `tests/fixtures/presence_*`;
  - `test_presence_roll_v19911`, `test_look_for_v19912`, `test_campus_now_v2100`.
- **Cek live** (`docs/TEST_CHECKLIST.md`):
  - Act 2: Trixie tampil di Courtyards siang hari sebagian besar hari kerja, tapi tidak setiap kali; di hari hujan di Common Rooms;
  - Zara dan Vera muncul berdua di Workshop Selasa/Kamis;
  - Look for kadang meleset walau Campus now menunjukkan tempatnya.
