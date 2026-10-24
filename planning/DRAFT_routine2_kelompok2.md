# DRAFT — Routine 2.0, kelompok 2: Year 2 dan Year 3 (rilis 2.2.1)

Dicatat: 2026-10-24. Owner: "setiap selesai proceed langsung sekalian buat tabel untuk ditinjau". Format dan mesin sudah ada sejak 2.2.0
(CHANGELOG 2.2.0, `data/npc_routines.json` `_note`); draft ini hanya isi kelompok 2 dan pelintas di perjalanan.

**Status:** menunggu "proceed" owner. Tes: tidak dijalankan sampai 2.2.4 (owner).

## 1. Kelompok 2: 14 NPC (teks kartu, English)

Year 2: Dante, Florian, Idris, Kanae, Lenna, Saffi, Tilly. Year 3: Caspian, Etnie, Gareth, Irene, Royhan, Ruby, Sophia.

- **Sumber:** Haunts, Club, `clock`, cuaca yang disukai/dibenci, relasi, dan baris lama (semua tetap ada sebagai baris utama).
- **114 baris, dicek dengan skrip:**
  - semua tempat ada;
  - tidak ada yang melewati blok;
  - free minimal 10 di setiap hari, blok dan cuaca;
  - setiap baris pair punya pasangan dengan bobot yang sama.
- **Baris lama yang dulu melewati blok** ditulis ulang per blok: Irene 16:00–19:00, Idris 16:00–18:30 dan Minggu 10:00–13:00,
  Lenna Minggu 10:00–14:00, Caspian Minggu 09:00–11:00.

**Pasangan (dari `relations.json`):**
- Florian dan Gareth: rival; Florian menantang terus dan Gareth selalu menerima. Combat Grounds, hari kerja 16:00–18:00.
- Lenna dan Saffi: sahabat. Sports Field, Sabtu 16:00–18:00.
- Idris dan Royhan: trio "Sky outcasts" yang berkumpul di Gardens (lore Royhan). Minggu 13:00–16:00. Zara tidak ikut, karena satu
  baris pair hanya untuk dua orang.
- Caspian dan Ruby: bertukar catatan. The Snug, Jumat 18:00–19:30.

**Dante**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Gardens / Courtyards / Founder's Statue and Park | Groundskeeping rounds before class | errand | 50 |  |
| Mon-Fri | 12:00–13:00 | Student Council Chamber | Council paperwork over lunch | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Gardens / Grassy Field and Hills / Courtyards | Groundskeeping work | errand | 60 |  |
| Mon-Sun | 18:00–19:30 | Forest | Groundskeeping at the Forest edge at dusk | duty | 70 |  |
| Sun | 13:00–16:00 | The Dovecote | — | habit | 30 |  |
| Sun | 13:00–16:00 | Student Council Chamber | — | habit | 30 |  |

**Florian**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | The Mall | — | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Canteen | holding court | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Combat Grounds | another challenge to Gareth | habit | 25 | bersama Gareth |
| Mon,Tue,Thu | 16:00–18:00 | Club Rooms | Tea Club | habit | 45 |  |
| Wed | 16:00–17:00 | The Noble Houses' Liaison | tea | habit | 60 |  |
| Fri | 16:00–18:00 | The Snug | the largest booth | habit | 60 |  |
| Mon-Fri | 18:00–20:00 | Sky Dormitory | bragging at Loki in the common room | habit | 60 |  |
| Mon-Fri | 18:00–20:00 | The Snug | the largest booth | habit | 25 |  |
| Sat | 16:00–18:00 | The Snug | the largest booth, entertaining | habit | 50 |  |
| Sun | 13:00–16:00 | The Mall | — | habit | 40 | cuaca baik |
| Sun | 13:00–16:00 | The Noble Houses' Liaison | tea | habit | 30 |  |

**Idris**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Gardens | — | habit | 30 |  |
| Mon,Wed,Fri | 16:00–18:00 | Gardens | paid work | duty | 70 |  |
| Tue,Thu | 16:00–18:00 | Notice Board / Commissary / The Mall | looking for quiet paid work and bargains | errand | 50 |  |
| Mon-Fri | 18:00–20:00 | Sky Dormitory | — | habit | 40 |  |
| Sat | 16:00–17:00 | Commissary | — | habit | 70 |  |
| Sun | 10:00–12:00 | Forest Clearing | studying the flowers the Gardening Club could not transplant | habit | 60 |  |
| Sun | 13:00–16:00 | Gardens | the Sky outcasts gathering in the Gardens | habit | 35 | bersama Royhan |

**Kanae**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Boathouse and Lake | still water | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Light Dormitory | — | habit | 30 |  |
| Mon-Fri | 19:00–20:00 | Observation Tower | Divination Society | habit | 70 | cuaca baik |
| Sun | 13:00–16:00 | Observation Tower | — | habit | 30 |  |
| Sun | 16:00–18:00 | Boathouse and Lake | still water | habit | 70 |  |

**Lenna**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Menagerie | visiting the animals | habit | 35 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 35 |  |
| Mon-Fri | 16:00–18:00 | Archery Range | Archery Club practice | habit | 70 |  |
| Mon-Fri | 18:00–20:00 | Gardens | the far Gardens | habit | 40 |  |
| Mon-Fri | 18:00–20:00 | Gardens | out in the rain on purpose | habit | 40 | hujan/badai |
| Sat | 16:00–18:00 | Sports Field | watching Saffi run laps and heckling from the grass | habit | 30 | bersama Saffi |
| Sun | 10:00–12:00 | Forest Clearing | naps between the Elder Oak's roots | habit | 70 |  |
| Sun | 13:00–16:00 | Menagerie | — | habit | 30 |  |

**Saffi**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Sports Field | an early run | habit | 50 | cuaca baik |
| Mon-Fri | 06:00–08:00 | Gymnasium | an early run, indoors | habit | 40 | hujan/badai |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Sports Field | Running Club laps | habit | 70 | cuaca baik |
| Mon-Fri | 16:00–18:00 | Gymnasium | Running Club laps, indoors | habit | 60 | hujan/badai |
| Sat | 16:00–18:00 | Sports Field | laps, with Lenna heckling from the grass | habit | 30 | bersama Lenna |
| Sat | 16:00–18:00 | Gymnasium | — | habit | 50 |  |
| Sun | 08:00–10:00 | The Cathedral | bored senseless by the sermon | habit | 40 |  |
| Sun | 13:00–16:00 | Sports Field | — | habit | 40 | cuaca baik |

**Tilly**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Archive | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Archive | — | habit | 55 |  |
| Mon-Fri | 16:00–18:00 | Broken Statue | her current favourite mystery | habit | 25 |  |
| Mon-Fri | 18:30–19:30 | Forest | the Forest edge at dusk | habit | 55 |  |
| Mon-Fri | 18:30–19:30 | Broken Statue | her current favourite mystery | habit | 20 |  |
| Sat | 16:00–18:00 | Broken Statue | — | habit | 40 |  |
| Sun | 13:00–16:00 | Archive | — | habit | 40 |  |
| Sun | 13:00–16:00 | Broken Statue | — | habit | 30 |  |

**Caspian**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Student Council Chamber | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Student Council Chamber | Festival Committee work | duty | 70 |  |
| Mon-Thu | 18:00–20:00 | Viridian Dormitory | — | habit | 40 |  |
| Mon-Thu | 18:00–20:00 | Combat Grounds | a guest at the Magic Duelling Club | habit | 20 |  |
| Fri | 18:00–19:30 | The Snug | trading notes with Ruby | habit | 30 | bersama Ruby |
| Fri | 18:00–19:30 | The Snug | neutral ground for diplomacy | habit | 40 |  |
| Sun | 09:00–10:00 | The Cathedral | — | habit | 70 |  |
| Sun | 10:00–11:00 | The Cathedral | — | habit | 70 |  |
| Sun | 13:00–16:00 | Student Council Chamber | festival planning | habit | 40 |  |

**Etnie**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Main Library | upper stacks | habit | 70 |  |
| Mon-Fri | 18:00–20:00 | Viridian Dormitory | — | habit | 40 |  |
| Mon-Fri | 18:00–20:00 | Main Library | upper stacks | habit | 30 |  |
| Sun | 13:00–16:00 | Gardens | — | habit | 40 |  |
| Sun | 13:00–16:00 | Main Library | upper stacks | habit | 30 |  |

**Gareth**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Combat Grounds | morning drills | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Main Library | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Combat Grounds | another challenge from Florian, accepted | habit | 25 | bersama Florian |
| Mon-Fri | 16:00–18:00 | Combat Grounds | a booked ring | habit | 45 |  |
| Mon,Wed,Fri | 18:00–20:00 | Club Rooms | Board Game Club | habit | 50 |  |
| Tue,Thu | 19:00–20:00 | Observation Tower | — | habit | 70 |  |
| Sun | 13:00–16:00 | Common Rooms | Dragonchess, as training in patience | habit | 40 |  |

**Irene**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Main Library | first in when the library opens | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Student Council Chamber | Council business over lunch | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Main Library | Library Assistants shift | duty | 70 |  |
| Mon-Fri | 18:00–19:00 | Main Library | Library Assistants shift | duty | 70 |  |
| Sat | 12:00–12:30 | Notice Board | checks it after the Council meeting | habit | 70 |  |
| Sun | 13:00–16:00 | Student Council Chamber | — | habit | 40 |  |
| Sun | 13:00–16:00 | Main Library | — | habit | 30 |  |

**Royhan**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Gardens | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Potion Halls | Alchemy Circle work | habit | 70 |  |
| Mon,Tue,Thu,Fri | 18:00–20:00 | Main Library | — | habit | 40 |  |
| Wed | 18:00–19:30 | The Dovecote | stays late near the Dovecote for Dragonchess | habit | 70 |  |
| Sun | 13:00–16:00 | Gardens | the Sky outcasts gathering in the Gardens | habit | 35 | bersama Idris |
| Sun | 13:00–16:00 | Potion Halls | — | habit | 30 |  |

**Ruby**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Nightwell | — | habit | 35 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 35 |  |
| Mon-Fri | 16:00–18:00 | Club Rooms | Music Club, at the back with her guitar | habit | 70 |  |
| Mon-Thu | 18:00–20:00 | Sky Dormitory | — | habit | 40 |  |
| Mon-Thu | 18:00–20:00 | Main Library | — | habit | 30 |  |
| Fri | 18:00–19:30 | The Snug | trading notes with Caspian | habit | 30 | bersama Caspian |
| Fri | 18:00–20:00 | Nightwell | hearing the earliest gossip | habit | 30 |  |
| Sat | 16:00–18:00 | The Mall | — | habit | 70 |  |
| Sun | 13:00–16:00 | Nightwell | — | habit | 40 |  |

**Sophia**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Combat Grounds | — | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Combat Grounds | training until someone makes her stop | habit | 70 | cuaca baik |
| Mon-Fri | 16:00–18:00 | Combat Grounds | training on in the storm, delighted | habit | 60 | hujan/badai |
| Mon-Fri | 18:00–20:00 | Fire Dormitory | — | habit | 40 |  |
| Mon-Fri | 18:00–20:00 | Medical Centre | patched up after someone finally made her stop | habit | 20 |  |
| Sun | 08:00–10:00 | Boathouse and Lake | — | habit | 70 |  |
| Sun | 13:00–16:00 | Combat Grounds | — | habit | 40 |  |
| Sun | 13:00–16:00 | Sports Field | — | habit | 30 |  |

**Catatan isi:**
- **Saffi** "bored senseless by Cathedral sermons" (lore), jadi Minggu pagi ada di Cathedral. Caspian juga ada di sana (baris lama).
- **Etnie:** lore-nya menyebut melacak {{user}} lewat bau di Gardens. Baris di sini hanya "Gardens" tanpa bau (aturan preset).
- **Dante:** Groundskeeping pagi dan sore sebagai errand (beberapa tempat); di tepi Forest saat senja sebagai duty (baris lama).
- **Tunggu kelompok berikutnya:**
  - Royhan dengan Milena (Dragonchess di Dovecote, Rabu) menunggu 2.2.2 (staf);
  - Ruby dengan Caralynn (Music Club) bisa dijadikan pair nanti, karena baris Caralynn sudah ada di kelompok 1.

## 2. Pelintas di perjalanan (kode, tanpa canon)

- **Siapa:** NPC yang di blok sebelumnya punya routine di tempat A dan di blok ini di tempat B (A ≠ B).
- **Kapan:** selama 15 menit pertama blok (`here.transit.mins`).
- **Di mana:** di setiap tempat yang dilalui jalan terpendek A → B di peta Campus. Jalannya dari pin ke pin (`areaRoutes`, data
  `campus_map` di `presence_data`).
- **Peluang:** 20% (`here.transit.pct`), paling banyak satu orang per tempat, tag "on the way to <B>".
- **Look for:** menemukan mereka dengan peluang yang sama (tarikan yang sama). Sesudah 15 menit mereka sudah sampai di B.
- **Tetap:** maksimal 3 nama di Who is here, urutan seeded, ditahan per blok.

## 3. Angka dan cek live

- **Angka baru** (masuk FUTURE_PLANS §5): `here.transit` 15 menit, 20%.
- **Cek live** (`docs/TEST_CHECKLIST.md`, quest tempat kampanye owner bertemu mereka; Act 1–2):
  - Florian dan Gareth berdua di Combat Grounds sesekali sepulang kelas;
  - Irene di Main Library sampai 19:00 (tidak selalu bertemu);
  - di awal blok (mis. 16:05 di Courtyards) kadang ada orang "on the way to" tempat routine-nya.
