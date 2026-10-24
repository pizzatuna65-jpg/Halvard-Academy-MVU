# DRAFT — Routine 2.0, kelompok 3: staf dan lainnya (rilis 2.2.2)

Dicatat: 2026-10-24, langsung sesudah rilis 2.2.1 (owner: "setiap selesai proceed langsung sekalian buat tabel untuk ditinjau").
Format dan mesin sudah ada (2.2.0, 2.2.1); draft ini isi kelompok 3.

**Status:** menunggu "proceed" owner. Tes: tidak dijalankan sampai 2.2.4 (owner).

## 1. Ringkas

- **24 NPC:**
  - 19 staf;
  - Doves (Krieg, Milena);
  - Cathedral (Tristan);
  - Facilities (Bobby);
  - Liaison (Caine).
- **143 baris**, termasuk satu baris Royhan yang diubah (lihat pasangan).
- **Sumber:** Role, Haunts, Club, `clock`, cuaca, relasi, dan baris lama (semua tetap ada; yang dulu melewati blok ditulis per blok).
- **Dicek dengan skrip:**
  - semua tempat ada;
  - tidak ada yang melewati blok;
  - free minimal 10 pada setiap menit yang aktif, untuk setiap hari dan cuaca;
  - pasangan cocok.
- **Guru yang sedang mengajar tetap `busy`** (jadwal pelajaran, seperti sekarang). Baris di jam pelajaran (Faculty Offices,
  Headmaster's Office) hanya berlaku pada periode yang tidak mereka ajar.

**Pasangan:**
- **Layla dan Yvette:** sahabat sejak satu angkatan di Halvard (lore). Staff Quarters, Minggu 18:00–21:00 (baris lama keduanya).
- **Royhan dan Milena:** Dragonchess di Dovecote, Rabu 18:00–19:30 (lore Royhan). Baris Royhan dari kelompok 2 (70, sendiri) menjadi
  baris pair 60, sama dengan baris Milena.

**Catatan isi:**
- **Anya** tidak diberi baris Tea Club. Lore Florian: guru yang menandatangani klub itu tidak pernah datang.
- **Anselm** tidak pernah di Sparring Pavilion atau Combat Grounds di luar kelas (lore), jadi barisnya Meditation Rooms, Founder's
  Park, dan rak filsafat di Main Library.
- **Hester:**
  - Medical Centre sepanjang hari sebagai duty;
  - kebun herbal di sebelahnya (`Gardens`) 16:00–17:00;
  - ronde malam dengan lenteranya (baris lama).
- **Rei:** ronde larut di Rooftop dan tepi Forest (errand). Lore: ia tahu murid memakai pintu atap dan tidak pernah melaporkannya.
- **Krieg:** patroli tepi Forest sesudah jam malam sebagai duty (baris lama).
- **Bobby:** errand perbaikan di gedung mana pun yang perlu, termasuk asrama; istirahat di Canteen (baris lama).
- **Gareth dan Magnus:** di Board Game Club pada jam yang sama (Senin, Rabu, Jumat 18:00–20:00), masing-masing dengan roll sendiri.
- **Kotaro dan Vallie:** di parlour Staff Quarters pada Minggu malam, juga masing-masing dengan roll sendiri.

## 2. Tabel: staf (teks kartu, English)

**Althair**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 08:00–10:00 | Faculty Offices | — | habit | 40 |  |
| Mon-Fri | 10:00–12:00 | Faculty Offices | — | habit | 40 |  |
| Mon-Fri | 12:00–13:00 | Canteen | cheerful, and everywhere | habit | 30 |  |
| Mon-Fri | 12:00–13:00 | Student Council Chamber | a favour called in | habit | 25 |  |
| Mon-Fri | 16:00–18:00 | Faculty Offices / Student Council Chamber / Courtyards | everywhere at once | errand | 50 |  |
| Mon-Thu | 18:00–20:00 | Staff Quarters | — | habit | 40 |  |
| Fri | 18:00–20:00 | The Snug | where his favours surface | habit | 70 |  |
| Sun | 13:00–16:00 | Courtyards | out in the storm, delighted | habit | 50 | hujan/badai |

**Anselm**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Meditation Rooms | — | habit | 50 |  |
| Mon-Fri | 12:00–13:00 | Main Library | the philosophy shelves | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Meditation Rooms | — | habit | 60 |  |
| Mon-Fri | 16:00–18:00 | Founder's Statue and Park | — | habit | 25 | cuaca baik |
| Sat | 09:00–10:00 | Mail Tower | his weekly chess move | habit | 70 |  |
| Sun | 13:00–16:00 | Founder's Statue and Park | — | habit | 50 | cuaca baik |
| Sun | 13:00–16:00 | Main Library | the philosophy shelves | habit | 30 |  |

**Anya**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen / Courtyards | with a question for whoever she finds | errand | 50 |  |
| Mon-Fri | 16:00–18:00 | Lecture Halls | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Medical Centre | the quiet end of the ward | habit | 25 |  |
| Mon-Sun | 18:00–19:30 | Boathouse and Lake | the Lake at dusk | habit | 70 |  |
| Sun | 10:00–12:00 | The Cathedral | the burial registers | habit | 70 |  |
| Sun | 13:00–16:00 | Courtyards | — | habit | 30 |  |

**Baelin**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Sun | 07:00–08:00 | Forest Clearing | the Elder Oak with Aura on rest-day mornings | habit | 70 |  |
| Sun | 08:00–09:00 | Forest Clearing | the Elder Oak with Aura on rest-day mornings | habit | 70 |  |
| Mon-Fri | 08:00–10:00 | Headmaster's Office | — | habit | 60 |  |
| Mon-Fri | 10:00–12:00 | Headmaster's Office | — | habit | 60 |  |
| Mon-Fri | 13:00–16:00 | Headmaster's Office | — | habit | 70 |  |
| Mon-Fri | 16:00–18:00 | Headmaster's Office | — | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Faculty Offices | — | habit | 30 |  |

**Cedric**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 07:00–07:30 | Canteen | at opening for the first bread | habit | 70 |  |
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Gardens | his row | habit | 70 |  |
| Sun | 10:00–12:00 | Archive | the fragile documents | habit | 70 |  |
| Sun | 13:00–16:00 | Gardens | his row | habit | 50 |  |

**Dorian**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Courtyards | between classes | habit | 70 | cuaca baik |
| Mon-Fri | 12:00–13:00 | Lecture Halls | selling his enchanted goods in the corridors | habit | 50 | hujan/badai |
| Mon-Fri | 16:00–18:00 | Club Rooms | Calligraphy Club | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | The Mall | selling his own enchanted goods | habit | 30 |  |
| Mon-Fri | 21:00–23:59 | Workshop | crafting late at night | habit | 70 |  |
| Sat | 13:00–16:00 | The Mall | — | habit | 50 |  |
| Sun | 13:00–16:00 | Courtyards | selling to anyone who will stand still | habit | 40 | cuaca baik |

**Ezrel**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 16:00–18:00 | Club Rooms | Theatre Troupe | habit | 70 |  |
| Mon-Fri | 18:00–20:00 | Light Dormitory | — | habit | 60 |  |
| Mon-Fri | 20:00–22:00 | Workshop | after hours | habit | 70 |  |
| Sun | 13:00–16:00 | Light Dormitory | — | habit | 40 |  |

**Gavlan**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Combat Grounds | checking the rings before class | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Faculty Offices | — | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Combat Grounds | the Magic Duelling Club | habit | 30 |  |
| Mon-Fri | 18:00–20:00 | Study Rooms | — | habit | 30 |  |
| Sun | 10:00–12:00 | Workshop | testing counter-spells | habit | 70 |  |

**Hester**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 08:00–10:00 | Medical Centre | — | duty | 70 |  |
| Mon-Fri | 10:00–12:00 | Medical Centre | — | duty | 70 |  |
| Mon-Fri | 12:00–13:00 | Medical Centre | — | duty | 60 |  |
| Mon-Fri | 16:00–17:00 | Gardens | her herb garden beside the Medical Centre | habit | 70 |  |
| Mon-Fri | 17:00–18:00 | Medical Centre | — | duty | 60 |  |
| Sat-Sun | 13:00–16:00 | Medical Centre | — | duty | 60 |  |
| Mon-Sun | 22:00–23:59 | Medical Centre | night rounds with her lantern | duty | 70 |  |

**Kotaro**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Canteen | — | habit | 60 |  |
| Mon-Fri | 13:00–15:00 | Potion Halls | asleep in the storeroom | habit | 70 |  |
| Mon-Fri | 16:00–18:00 | Potion Halls | the Brewing Club | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Canteen | — | habit | 20 |  |
| Sun | 18:00–20:00 | Staff Quarters | the parlour | habit | 70 |  |
| Sun | 20:00–22:00 | Staff Quarters | the parlour | habit | 70 |  |

**Kuroo**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Staff Room | — | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Staff Room | — | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Club Rooms | the Card Club | habit | 30 |  |
| Mon-Sun | 19:00–20:00 | Viridian Dormitory | the common room | habit | 70 |  |
| Sun | 13:00–16:00 | Viridian Dormitory | the common room | habit | 40 |  |

**Layla**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Archive | — | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Main Library | Library Assistants | habit | 70 |  |
| Sun | 13:00–16:00 | Main Library | — | habit | 40 |  |
| Sun | 18:00–20:00 | Staff Quarters | rest-day evenings with Yvette | habit | 70 | bersama Yvette |
| Sun | 20:00–21:00 | Staff Quarters | rest-day evenings with Yvette | habit | 70 | bersama Yvette |

**Magnus**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 16:00–18:00 | Faculty Offices | scouting reports | habit | 60 |  |
| Fri | 16:00–17:00 | Mail Tower | chess letters | habit | 30 |  |
| Mon,Wed,Fri | 18:00–20:00 | Club Rooms | the Board Game Club | habit | 40 |  |
| Mon-Fri | 18:00–20:00 | Staff Room | — | habit | 30 |  |
| Sun | 13:00–16:00 | Main Library | the reference section | habit | 40 |  |

**Mimosa**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 16:00–18:00 | Potion Halls | answering notes slid under the cupboard | habit | 70 |  |
| Mon-Fri | 18:00–19:00 | Potion Halls | answering notes slid under the cupboard | habit | 60 |  |
| Mon-Fri | 21:00–23:00 | Workshop | late, alone | habit | 40 |  |
| Sun | 13:00–16:00 | Workshop | — | habit | 40 |  |

**Ottavio**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 05:30–06:00 | Fishing House | the end of the long dock at dawn | habit | 70 |  |
| Mon-Sun | 06:00–07:00 | Fishing House | the end of the long dock at dawn | habit | 70 |  |
| Mon-Fri | 16:00–18:00 | Fishing House | the Fishing Club | habit | 40 |  |
| Sat | 13:00–16:00 | Fishing House | — | habit | 50 |  |
| Mon-Sun | 19:00–20:00 | Sky Dormitory | the common room, his door open all night | habit | 70 |  |
| Mon-Sun | 20:00–22:00 | Sky Dormitory | the common room, his door open all night | habit | 70 |  |

**Rei**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 08:00–10:00 | The Seal Chamber | maintaining the seal | duty | 70 |  |
| Mon-Sun | 10:00–12:00 | The Seal Chamber | maintaining the seal | duty | 70 |  |
| Mon-Fri | 16:00–18:00 | The Warden's Office | — | habit | 50 |  |
| Mon-Sun | 19:00–20:00 | The Warden's Office | the mana ledgers | duty | 70 |  |
| Mon-Sun | 20:00–21:00 | The Warden's Office | the mana ledgers | duty | 70 |  |
| Mon-Sun | 22:00–23:59 | Rooftop / Forest | a late round | errand | 40 |  |

**Valentin**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon | 08:00–08:30 | Potion Halls | rewriting the ranking board | habit | 70 |  |
| Mon-Fri | 12:00–13:00 | Canteen | peak hours | habit | 70 |  |
| Mon-Fri | 16:00–18:00 | Potion Halls | his private laboratory | habit | 50 |  |
| Mon-Fri | 16:00–18:00 | Courtyards | wherever there is an audience | habit | 20 | cuaca baik |
| Sun | 18:00–20:00 | Club Rooms | looking over Monday's paper | habit | 30 |  |

**Vallie**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 06:00–08:00 | Menagerie | the feeding round | duty | 50 |  |
| Mon-Fri | 16:00–18:00 | Menagerie | her stables | habit | 60 |  |
| Mon-Fri | 16:00–18:00 | Combat Grounds | when Sophia Helfin wants a fight | habit | 15 |  |
| Sat | 13:00–16:00 | Forest | dragging someone along to see something | habit | 30 |  |
| Sun | 18:00–20:00 | Staff Quarters | holding court in the parlour | habit | 70 |  |
| Sun | 20:00–21:00 | Staff Quarters | holding court in the parlour | habit | 70 |  |

**Yvette**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Lecture Halls | the warm end | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | Workshop | Smithing Club | habit | 70 |  |
| Mon-Fri | 18:00–20:00 | Fire Dormitory | — | habit | 50 |  |
| Sun | 18:00–20:00 | Staff Quarters | rest-day evenings with Layla | habit | 70 | bersama Layla |
| Sun | 20:00–21:00 | Staff Quarters | rest-day evenings with Layla | habit | 70 | bersama Layla |

## 3. Tabel: Doves, Cathedral, Facilities, Liaison

**Krieg**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 08:00–10:00 | The Dovecote | — | duty | 70 |  |
| Mon-Sun | 10:00–12:00 | The Dovecote | — | duty | 70 |  |
| Mon-Fri | 13:00–16:00 | Detention Tower | — | habit | 40 |  |
| Mon-Fri | 16:00–18:00 | The Dovecote | — | duty | 50 |  |
| Mon-Sun | 20:00–22:00 | Forest | the Forest edge after curfew | duty | 70 |  |

**Milena**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 12:00–13:00 | Lecture Halls | — | habit | 30 |  |
| Mon-Fri | 12:00–13:00 | The Dovecote | — | habit | 30 |  |
| Mon-Fri | 16:00–18:00 | Combat Grounds | — | habit | 60 |  |
| Wed | 18:00–19:30 | The Dovecote | Dragonchess with Royhan | habit | 60 | bersama Royhan |
| Sun | 13:00–16:00 | The Dovecote | — | habit | 40 |  |

**Tristan**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Sun | 06:00–07:00 | Meditation Rooms | — | habit | 70 |  |
| Mon-Fri | 12:00–13:00 | The Cathedral | — | habit | 50 |  |
| Mon-Sat | 17:00–18:00 | The Cathedral | confessions | duty | 70 |  |
| Mon-Sat | 18:00–19:00 | The Cathedral | confessions | duty | 70 |  |
| Sun | 09:00–10:00 | The Cathedral | the service | duty | 70 |  |
| Sun | 10:00–11:00 | The Cathedral | the service | duty | 70 |  |

**Bobby**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 08:00–10:00 | Workshop | — | habit | 40 |  |
| Mon-Fri | 08:00–10:00 | Lecture Halls / Courtyards / Common Rooms / Canteen | whichever building needs repairs | errand | 40 |  |
| Mon-Fri | 10:00–12:00 | Workshop | — | habit | 40 |  |
| Mon-Fri | 10:00–12:00 | Lecture Halls / Courtyards / Common Rooms / Canteen | whichever building needs repairs | errand | 40 |  |
| Mon-Fri | 12:00–13:00 | Canteen | his break | habit | 70 |  |
| Mon-Fri | 13:00–16:00 | Lecture Halls / Club Rooms / Sky Dormitory / Fire Dormitory / Light Dormitory / Viridian Dormitory | whichever building needs repairs | errand | 60 |  |

**Caine**

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 09:00–10:00 | Mail Tower | the Liaison's errands | duty | 70 |  |
| Mon-Sun | 10:00–12:00 | The Noble Houses' Liaison | running the household | duty | 70 |  |
| Mon-Sun | 12:00–13:00 | The Noble Houses' Liaison | serving the guests | duty | 60 |  |
| Mon-Sun | 13:00–16:00 | The Noble Houses' Liaison | running the household | duty | 70 |  |
| Mon-Sun | 16:00–18:00 | The Noble Houses' Liaison | serving the guests | duty | 70 |  |

**Royhan** (kelompok 2, satu baris berubah): `Wed 18:00–19:30 The Dovecote — Dragonchess with Milena — habit 60 — bersama Milena`
(sebelumnya: "stays late near the Dovecote for Dragonchess", 70, sendiri).

## 4. Kode (tanpa canon)

- **Validator `presence_data`:** sekarang hanya menjumlahkan baris yang aktif pada menit yang sama, jadi baris yang berurutan dalam
  satu blok (Hester 16:00–17:00 lalu 17:00–18:00) tidak dihitung bertumpuk. Sudah diubah bersama draft ini; data yang ada tetap lolos.
- **Cek live** (`docs/TEST_CHECKLIST.md`):
  - Act 2: Hester di Medical Centre siang hari;
  - Krieg di tepi Forest sesudah jam malam;
  - Rei kadang di Rooftop larut malam;
  - Layla dan Yvette berdua di Staff Quarters hari Minggu.
