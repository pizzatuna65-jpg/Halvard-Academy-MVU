# DRAFT — Routine 2.0, kelompok 4: angkatan yang datang belakangan (rilis 2.2.3)

Dicatat: 2026-10-24, langsung sesudah rilis 2.2.2 (owner: "setiap selesai proceed langsung sekalian buat tabel untuk ditinjau").

**Status:** menunggu "proceed" owner. Tes: tidak dijalankan sampai 2.2.4 (owner).

## 1. Ringkas

- **13 NPC, 88 baris:**
  - angkatan yang datang di Year 2: Hadrian, Linus, Maple, Nerys, Tsubaki, Wren;
  - angkatan yang datang di Year 3: Aurelian, Bianca, Bruno, Faye, Rigel, Topaz, William.
- Mereka hanya terlihat sejak tahun kedatangannya, seperti sekarang (whereabouts "not at Halvard yet").
- **Sumber:** Haunts, Club, `clock`, cuaca, relasi, dan baris lama (semua tetap ada; yang dulu melewati blok ditulis per blok).
- **Dicek dengan skrip:**
  - semua tempat ada;
  - tidak ada yang melewati blok;
  - free minimal 10 pada setiap menit yang aktif;
  - pasangan cocok.

**Pasangan, hanya di dalam satu angkatan** (NPC dari angkatan berbeda baru sama-sama ada sejak tahun tertentu):
- Bianca dan Bruno (kembar): "the twins at the loudest table" di Canteen, makan siang hari kerja.
- Aurelian dan Bruno (sahabat): Fire Dormitory, sore hari kerja; Aurelian berpidato di atas meja, Bruno bersorak.
- Nerys dan Maple (sahabat): mencari bahan makanan di Gardens, Minggu siang.

**Catatan isi:**
- **Bruno:** jadwal Detention Tower "on a regular schedule" (lore) tetap ada, setiap Jumat 16:00–17:00.
- **Tsubaki:** Sparring Pavilion sebelum subuh dan atap Observation Tower malam hari (baris lama; atap sesudah jam malam, seperti dulu).
  Di jam makan siang kadang di koridor yang tidak ia maksud (lore: selalu tersesat).
- **Topaz:** lore-nya bilang ia ada "di mana pun {{user}} berada, kebetulan". Routine tidak bisa mengikuti {{user}}; yang ada di
  sini hanya kebiasaannya sendiri. Bagian "mengikuti" tetap urusan narator lewat lore-nya.
- **William:** di hari badai ia merenung di Rooftop "even more dramatically" (lore: menyukai badai).
- **Pasangan yang menyeberang angkatan, tidak dipakai:** Faye menemukan Tsubaki yang tersesat di Hills; Rigel dan Wren memancing di
  pantai subuh yang sama. Bisa dipakai di 2.2.4 bersama syarat `since`.

## 2. Tabel: angkatan Year 2 (teks kartu, English)

**Hadrian**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–12:30 | Canteen | the front of every queue | habit | 70 |  |
| Mon-Fri | 16:00–18:00 | Club Rooms | Specialized Magic Club, most weeks the only member present | habit | 70 |  |
| Mon-Fri | 18:00–20:00 | Light Dormitory | — | habit | 50 |  |
| Mon-Fri | 20:00–22:00 | Workshop | after hours, for other people's materials | habit | 30 |  |
| Sun | 13:00–16:00 | Light Dormitory | — | habit | 40 |  |

**Linus**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | loudly | habit | 60 |  |
| Mon-Fri | 12:00–13:00 | Announcement Room | — | habit | 20 |  |
| Mon-Fri | 16:00–18:00 | The Sparring Pavilion | the spectator bench | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Archive | old competition results for the Tally | habit | 25 |  |
| Sat | 16:00–18:00 | Combat Grounds | the spectator bench nearest the ring | habit | 40 |  |
| Sun | 18:00–20:00 | Club Rooms | the Tally for Monday's paper | duty | 50 |  |

**Maple**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Combat Grounds | the far end, alone, practising | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Gardens | Gardening Club | habit | 70 |  |
| Mon-Fri | 18:00–20:00 | Sky Dormitory | the tower | habit | 50 |  |
| Sun | 10:00–12:00 | Forest | up a tree at the edge | habit | 70 | cuaca baik |
| Sun | 12:00–13:00 | Forest | up a tree at the edge | habit | 50 | cuaca baik |
| Sun | 13:00–16:00 | Gardens | foraging with Nerys | habit | 30 | bersama Nerys |

**Nerys**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Gardens / Forest | foraging, broke as always | errand | 40 |  |
| Mon-Fri | 16:00–18:00 | Canteen | the Cooking Club in the kitchen | habit | 30 |  |
| Mon-Fri | 19:00–20:00 | Canteen | the kitchen's leftovers at closing | habit | 70 |  |
| Sun | 10:00–12:00 | Mail Tower | the pigeons | habit | 70 |  |
| Sun | 13:00–16:00 | Gardens | foraging with Maple | habit | 30 | bersama Maple |
| Sun | 13:00–16:00 | Founder's Statue and Park | this week's hobby | habit | 30 |  |

**Tsubaki**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 05:00–06:00 | The Sparring Pavilion | before dawn every day | habit | 70 |  |
| Mon-Sun | 06:00–07:00 | The Sparring Pavilion | before dawn every day | habit | 70 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Lecture Halls | a corridor she did not mean to be in | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Combat Grounds | training | habit | 60 |  |
| Mon-Fri | 16:00–18:00 | The Sparring Pavilion | training | habit | 25 |  |
| Mon-Sun | 20:00–22:00 | Observation Tower | the roof under a clear night sky | habit | 70 | cuaca baik |
| Sun | 13:00–16:00 | Grassy Field and Hills | under an open sky, and lost again | habit | 50 | cuaca baik |

**Wren**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 05:30–06:00 | Fishing House | the dock at dawn | habit | 70 |  |
| Mon-Sun | 06:00–07:00 | Fishing House | the dock at dawn | habit | 70 |  |
| Mon-Fri | 12:00–13:00 | Canteen | the quietest table | habit | 60 |  |
| Mon-Fri | 16:00–18:00 | Club Rooms | on the floor during Music Club rehearsal, feeling it | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Main Library | — | habit | 30 |  |
| Mon-Fri | 18:00–20:00 | Fire Dormitory | the common room corner seat | habit | 70 |  |
| Sun | 13:00–16:00 | Main Library | — | habit | 40 |  |

## 3. Tabel: angkatan Year 3 (teks kartu, English)

**Aurelian**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 06:00–07:00 | Combat Grounds | at dawn | habit | 70 |  |
| Mon-Fri | 12:00–13:00 | Canteen | shaking hands on the way to his seat | habit | 50 |  |
| Mon-Fri | 12:00–13:00 | Announcement Room | whenever anyone lets him near it | habit | 20 |  |
| Mon-Fri | 16:00–18:00 | Gymnasium | Basketball Club | habit | 70 |  |
| Mon-Fri | 18:00–20:00 | Fire Dormitory | on a table mid-speech, Bruno cheering | habit | 30 | bersama Bruno |
| Mon-Fri | 18:00–20:00 | Fire Dormitory | on a table, mid-speech | habit | 30 |  |
| Sun | 13:00–16:00 | Gymnasium | — | habit | 40 |  |

**Bianca**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | the twins at the loudest table | habit | 30 | bersama Bruno |
| Mon-Fri | 12:00–13:00 | Courtyards | — | habit | 30 | cuaca baik |
| Mon-Fri | 16:00–18:00 | Swimming Pool | Swimming Club | habit | 70 |  |
| Mon-Fri | 18:00–20:00 | Light Dormitory | the glass dome | habit | 40 |  |
| Mon-Fri | 18:00–20:00 | Club Rooms | the corridor, where the crowd is | habit | 25 |  |
| Sun | 13:00–16:00 | Courtyards | wherever the biggest crowd is | habit | 40 | cuaca baik |
| Sun | 13:00–16:00 | Student Council Chamber | — | habit | 20 |  |

**Bruno**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | the twins at the loudest table | habit | 30 | bersama Bianca |
| Mon-Fri | 12:00–13:00 | Canteen | seconds, then thirds | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | The Sparring Pavilion | challenging anyone who walks in | habit | 60 |  |
| Fri | 16:00–17:00 | Detention Tower | "on a regular schedule" | habit | 30 |  |
| Mon-Fri | 18:00–20:00 | Fire Dormitory | cheering Aurelian on | habit | 30 | bersama Aurelian |
| Mon-Fri | 18:00–20:00 | Fire Dormitory | the loudest chair by the hearth | habit | 40 |  |
| Sun | 13:00–16:00 | Combat Grounds | — | habit | 40 |  |

**Faye**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Menagerie | where the animals come to her | habit | 30 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Meditation Rooms | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Grassy Field and Hills | — | habit | 30 | cuaca baik |
| Mon-Fri | 18:00–20:00 | Viridian Dormitory | her hammock in the common room | habit | 70 |  |
| Sun | 10:00–12:00 | Grassy Field and Hills | — | habit | 70 |  |
| Sun | 12:00–13:00 | Grassy Field and Hills | — | habit | 50 |  |
| Sun | 13:00–14:00 | Grassy Field and Hills | — | habit | 70 |  |

**Rigel**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 05:30–06:00 | Boathouse and Lake | fishing alone at dawn | habit | 70 |  |
| Mon-Sun | 06:00–07:00 | Boathouse and Lake | fishing alone at dawn | habit | 70 |  |
| Mon-Fri | 12:00–13:00 | Canteen | buying for the whole table | habit | 70 |  |
| Mon-Fri | 16:00–18:00 | Student Council Chamber | Festival Committee meetings | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | The Mall | the Ardenne counter | habit | 20 |  |
| Sat | 17:00–18:00 | The Cathedral | registering an oath with Tristan | habit | 30 |  |
| Sun | 13:00–16:00 | Sky Dormitory | — | habit | 40 |  |

**Topaz**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | two tables away, with a clear view | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Combat Grounds | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Light Dormitory | — | habit | 30 |  |
| Mon-Fri | 18:00–19:30 | The Sparring Pavilion | practising on her own time | habit | 70 |  |
| Sun | 13:00–16:00 | Common Rooms | — | habit | 40 |  |

**William**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 06:00–07:00 | The Sparring Pavilion | training at dawn | habit | 70 |  |
| Mon-Fri | 16:00–18:00 | The Sparring Pavilion | whenever there might be a fight | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Main Library | — | habit | 30 |  |
| Mon,Wed,Fri | 18:00–20:00 | Club Rooms | the Board Game Club, narrating the stakes aloud | habit | 25 |  |
| Mon-Fri | 18:30–19:30 | Rooftop | brooding at dusk, dramatically | habit | 50 | cuaca baik |
| Mon-Fri | 18:30–19:30 | Rooftop | brooding in the storm, even more dramatically | habit | 60 | hujan/badai |
| Sun | 13:00–16:00 | Sky Dormitory | — | habit | 40 |  |
| Sun | 13:00–16:00 | The Mall | first in line at Quillfeather's on a new-volume day | habit | 30 |  |

## 4. Kode (tanpa canon): baris pasangan saat pasangannya tidak ada

- **Ditemukan saat menyusun draft:** murid Year 3 (Caspian, Etnie, Gareth, Irene, Royhan, Ruby, Sophia) lulus di akhir tahun pertama
  kampanye. Sesudah itu, baris pair seperti Florian "another challenge to Gareth" dan Idris "the Sky outcasts … with Royhan" tetap bisa
  terpilih walau pasangannya sudah pergi. Ini cacat di kode 2.2.1.
- **Perbaikan:** `rtPick` melewati baris pair yang pasangannya tidak ada (lulus, belum datang, pulang libur, sakit, atau punya
  `NPC_status`); bobotnya menjadi free.
