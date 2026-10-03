# DRAFT — Jadwal hidup NPC (batch fitur 4, saran audit 4.7)

Status: menunggu "proceed" owner. Sumber: `audit/AUDIT_2026-10-03_4_batch_fitur.md` batch 4.

## Apa yang dibangun setelah "proceed"

- **Data** `data/npc_routines.json`: tiap NPC 1–3 kebiasaan mingguan `[hari, dari, sampai, tempat, catatan]`. Tempat memakai nama
  Campus Map.
- **Satu model whereabouts** (keputusan 1.47.0): `whereabouts` mengembalikan tempat rutin kalau sekarang masuk jendelanya. Urutan
  prioritas: status/sakit > kelas atau mengajar > Council Sabtu > klub Sabtu > rutinitas > haunts.
- **Map:** daftar Regulars menulis "usually here Thu 16:00–18:00".
- **Dossier:** menampilkan rutinitas hanya kalau field Haunts sudah terbuka (Rank 1).
- **`<now>` dan initiative:** "Likely around" memakai rutinitas. Template `{place}` initiative dan bantuan lebih dulu memakai tempat
  rutin.
- **Hanya "biasanya", bukan kepastian.** Narator boleh menyimpang kalau cerita menuntut.
- **Yang tidak punya rutinitas:**
  - anggota tim akademi rival (tidak pernah di Halvard);
  - NPC yang belum datang (cohort 2/3, gerbang `arrives`) atau sudah lulus.
- `NPC_BRAINSTORM_BRIEF.md`: NPC baru wajib punya 1–3 baris rutinitas.

## Aturan penyusunan (diputuskan)

- **Jendela siswa:** di luar kelas saja. Hari Senin–Jumat ada tiga jendela: sebelum 08:00, makan siang 12:00–13:00, dan
  16:00–20:00. Sabtu: setelah 16:00. Minggu: bebas. Semua sebelum curfew 20:00, kecuali lore jelas menyatakan lain (lihat [?] 1).
- **Staf:** boleh di jam kelas kalau sedang tidak mengajar. Jam mengajar tetap dari data kelas.
- **Label sumber** per baris:
  - **(lore):** tempat dan waktu tertulis di lore;
  - **(lore, jam diturunkan):** tempatnya lore, jamnya saya pilih;
  - **(diturunkan):** tempat dari Haunts atau klub, jamnya saya pilih.
- **Bukan rahasia:** tidak ada rutinitas yang membuka rahasia. Semua tempat sudah ada di field Haunts, Club, atau Role yang bisa
  dibuka pemain.

## Rutinitas (teks Inggris = data yang akan dipakai)

### Year 3 (lulus akhir Year 1)
- **Irene:** Mon–Fri 16:00–19:00 Main Library, Library Assistants shift (diturunkan) · Sat 12:00–12:30 Notice Board, checks it after the Council meeting (lore, jam diturunkan)
- **Caspian:** Mon–Fri 16:00–18:00 Student Council Chamber, Festival Committee work (diturunkan) · Fri 18:00–19:30 The Snug, neutral ground for diplomacy (lore, jam diturunkan) · Sun 09:00–11:00 The Cathedral (diturunkan)
- **Etnie:** Mon–Fri 16:00–18:00 Main Library, upper stacks (diturunkan)
- **Royhan:** Mon–Fri 16:00–18:00 Potion Halls, Alchemy Circle work (diturunkan) · Wed 18:00–19:30 The Dovecote, stays late near the Dovecote for Dragonchess (lore, hari dan jam diturunkan)
- **Sophia:** Mon–Fri 16:00–18:00 Combat Grounds, training until someone makes her stop (diturunkan) · Sun 08:00–10:00 Boathouse and Lake (diturunkan)
- **Gareth:** Mon–Fri 16:00–18:00 Combat Grounds, a booked ring (diturunkan) · Tue, Thu 19:00–20:00 Observation Tower (diturunkan)
- **Ruby:** Mon–Fri 16:00–18:00 Club Rooms, Music Club, at the back with her guitar (diturunkan) · Sat 16:00–18:00 The Mall (diturunkan)

### Year 2
- **Lenna:** Mon–Fri 16:00–18:00 Menagerie, Beast Handling Club (diturunkan) · Sun 10:00–14:00 Forest Clearing, naps between the Elder Oak's roots (lore, jam diturunkan)
- **Saffi:** Mon–Fri 16:00–18:00 Sports Field, Running Club laps (diturunkan) · Sat 16:00–18:00 Gymnasium (diturunkan)
- **Kanae:** Mon–Fri 19:00–20:00 Observation Tower, Divination Society (diturunkan) · Sun 16:00–18:00 Boathouse and Lake, still water (lore, jam diturunkan)
- **Idris:** Mon, Wed, Fri 16:00–18:30 Gardens, paid work (lore, hari dan jam diturunkan) · Sat 16:00–17:00 Commissary (diturunkan) · Sun 10:00–13:00 Forest Clearing, studying the flowers (lore, jam diturunkan)
- **Dante:** Mon–Sun 18:00–19:30 Forest, Groundskeeping at the Forest edge at dusk (lore, jam diturunkan)
- **Florian:** Mon–Fri 18:00–20:00 Sky Dormitory, bragging at Loki in the common room most evenings (lore) · Wed 16:00–17:00 The Noble Houses' Liaison, tea (lore, hari dan jam diturunkan) · Fri 16:00–18:00 The Snug, the largest booth (diturunkan)
- **Tilly:** Mon–Fri 16:00–18:00 Archive (diturunkan) · Mon–Fri 18:30–19:30 Forest, the Forest edge at dusk (lore, jam diturunkan)

### Year 1 (sejak awal)
- **Aiden:** Mon–Fri 12:00–13:00 Merryhew's (diturunkan) · Sat 18:00–20:00 The Snug, settling bets (lore, jam diturunkan) · Sun–Thu 21:00–23:00 Bell Tower, his curfew route (lore "most nights", jam diturunkan)
- **Caralynn:** Mon–Fri 12:00–13:00 Announcement Room, fighting for the broadcast slot (lore, jam diturunkan) · Mon–Fri 16:00–18:00 Club Rooms, Music Club rehearsal (diturunkan) · Sun 14:00–16:00 Founder's Statue and Park, to be seen (lore, jam diturunkan)
- **Zara:** Mon, Wed, Fri 16:00–18:00 Main Library, shelving work (lore, hari dan jam diturunkan) · Tue, Thu 16:00–18:00 Workshop (diturunkan)
- **Percival:** Mon–Fri 12:00–13:00 Canteen, the worst Lucky Roll fillings in front of an audience (lore, jam diturunkan) · Mon–Fri 16:00–18:00 Sports Field, Soccer Club (diturunkan)
- **Trixie:** Mon–Fri 12:00–13:00 Courtyards, a performance nobody asked for (lore, jam diturunkan) · Mon–Fri 16:00–18:00 Club Rooms, Theatre Troupe (diturunkan) · Sun 14:00–16:00 Menagerie, the animals (lore, jam diturunkan)
- **Vera:** Mon–Fri 16:00–19:00 Workshop (diturunkan)
- **Castor:** Mon–Fri 07:00–07:45 Gardens, early in the morning (lore) · Mon–Fri 16:00–18:00 Archive, newspaper research (diturunkan)
- **Alyssa:** Mon–Fri 16:00–18:00 Study Rooms (diturunkan) · Mon 12:00–13:00 Mail Tower, letter day (lore, hari dan jam diturunkan)

### Datang di Year 2 (cohort 2)
- **Linus:** Mon–Fri 12:00–13:00 Canteen, loudly (lore, jam diturunkan) · Mon–Fri 16:00–18:00 The Sparring Pavilion, the spectator bench (diturunkan)
- **Maple:** Mon–Fri 16:00–18:00 Gardens, Gardening Club (diturunkan) · Sun 10:00–13:00 Forest, up a tree at the edge (lore, jam diturunkan)
- **Nerys:** Mon–Fri 19:00–20:00 Canteen, the kitchen's leftovers at closing (lore, jam diturunkan) · Sun 10:00–12:00 Mail Tower, the pigeons (diturunkan)
- **Hadrian:** Mon–Fri 12:00–12:30 Canteen, the front of every queue (lore, jam diturunkan) · Mon–Fri 16:00–18:00 Club Rooms, Specialized Magic Club (diturunkan)
- **Wren:** Mon–Sun 05:30–07:00 Fishing House, the dock at dawn (lore) · Mon–Fri 18:00–20:00 Fire Dormitory, the common room corner seat (diturunkan)
- **Tsubaki:** Mon–Sun 05:00–07:00 The Sparring Pavilion, before dawn every day (lore) · Mon–Sun 20:00–22:00 Observation Tower, the roof under a clear night sky (lore, jam diturunkan)

### Datang di Year 3 (cohort 3)
- **Aurelian:** Mon–Sun 06:00–07:00 Combat Grounds, at dawn (lore) · Mon–Fri 16:00–18:00 Gymnasium, Basketball Club (diturunkan)
- **William:** Mon–Sun 06:00–07:00 The Sparring Pavilion, training at dawn (lore, tempat diturunkan) · Mon–Fri 18:30–19:30 Rooftop, brooding at dusk (lore, jam diturunkan)
- **Bruno:** Mon–Fri 16:00–18:00 The Sparring Pavilion (diturunkan) · Fri 16:00–17:00 Detention Tower, "on a regular schedule" (lore, hari dan jam diturunkan)
- **Bianca:** Mon–Fri 16:00–18:00 Swimming Pool, Swimming Club (diturunkan)
- **Rigel:** Mon–Sun 05:30–07:00 Boathouse and Lake, fishing alone at dawn (lore) · Mon–Fri 12:00–13:00 Canteen, buying for the whole table (lore, jam diturunkan)
- **Topaz:** Mon–Fri 18:00–19:30 The Sparring Pavilion, practising on her own time (lore, jam diturunkan)
- **Faye:** Mon–Fri 18:00–20:00 Viridian Dormitory, her hammock in the common room (lore, jam diturunkan) · Sun 10:00–14:00 Grassy Field and Hills (diturunkan)

### Staf
- **Baelin:** Sun 07:00–09:00 Forest Clearing, the Elder Oak with Aura on rest-day mornings (lore) · Mon–Fri 13:00–16:00 Headmaster's Office (diturunkan)
- **Althair:** Fri 18:00–20:00 The Snug, where his favours surface (lore, jam diturunkan)
- **Gavlan:** Mon–Fri 16:00–18:00 Faculty Offices (diturunkan) · Sun 10:00–12:00 Workshop, testing counter-spells (lore, jam diturunkan)
- **Yvette:** Mon–Fri 16:00–18:00 Workshop, Smithing Club (diturunkan) · Sun 18:00–21:00 Staff Quarters, rest-day evenings with Layla (lore)
- **Layla:** Mon–Fri 16:00–18:00 Main Library, Library Assistants (diturunkan) · Sun 18:00–21:00 Staff Quarters, rest-day evenings with Yvette (lore)
- **Vallie:** Mon–Fri 16:00–18:00 Menagerie, her stables (diturunkan) · Sun 18:00–21:00 Staff Quarters, holding court in the parlour (lore)
- **Kuroo:** Mon–Fri 16:00–18:00 Staff Room (diturunkan) · Mon–Sun 19:00–20:00 Viridian Dormitory, the common room (diturunkan)
- **Mimosa:** Mon–Fri 16:00–19:00 Potion Halls, answering notes slid under the cupboard (diturunkan)
- **Ezrel:** Mon–Fri 16:00–18:00 Club Rooms, Theatre Troupe (diturunkan) · Mon–Fri 20:00–22:00 Workshop, after hours (lore, jam diturunkan)
- **Ottavio:** Mon–Sun 05:30–07:00 Fishing House, the end of the long dock at dawn (lore) · Mon–Sun 19:00–22:00 Sky Dormitory, the common room, his door open all night (lore, jam diturunkan)
- **Hester:** Mon–Sun 22:00–23:59 Medical Centre, night rounds with her lantern (lore, jam diturunkan) · Mon–Fri 16:00–17:00 Gardens, her herb garden beside the Medical Centre (lore, jam diturunkan)
- **Anselm:** Mon–Fri 16:00–18:00 Meditation Rooms (diturunkan) · Sat 09:00–10:00 Mail Tower, his weekly chess move (lore, hari dan jam diturunkan)
- **Magnus:** Mon–Fri 16:00–18:00 Faculty Offices, scouting reports (diturunkan) · Fri 16:00–17:00 Mail Tower, chess letters (lore, hari dan jam diturunkan)
- **Dorian:** Mon–Fri 12:00–13:00 Courtyards, between classes (lore, jam diturunkan) · Mon–Fri 21:00–23:59 Workshop, crafting late at night (lore)
- **Cedric:** Mon–Sun 07:00–07:30 Canteen, at opening for the first bread (lore) · Mon–Fri 16:00–18:00 Gardens, his row (lore, jam diturunkan) · Sun 10:00–12:00 Archive, the fragile documents (lore, jam diturunkan)
- **Anya:** Mon–Sun 18:00–19:30 Boathouse and Lake, the Lake at dusk (lore) · Sun 10:00–12:00 The Cathedral, the burial registers (lore, jam diturunkan)
- **Kotaro:** Mon–Fri 13:00–15:00 Potion Halls, asleep in the storeroom (lore, jam diturunkan; mengajar Selasa siang tetap menang) · Sun 18:00–22:00 Staff Quarters, the parlour (lore, jam diturunkan)
- **Valentin:** Mon 08:00–08:30 Potion Halls, rewriting the ranking board (lore) · Mon–Fri 12:00–13:00 Canteen, peak hours (lore, jam diturunkan)
- **Bobby:** Mon–Fri 08:00–12:00 Workshop (diturunkan) · Mon–Fri 12:00–13:00 Canteen, his break (lore, jam diturunkan)

### Doves, Warden, Cathedral, Liaison
- **Krieg:** Mon–Sun 08:00–12:00 The Dovecote (diturunkan) · Mon–Sun 20:00–22:00 Forest, the Forest edge after curfew (lore, jam diturunkan)
- **Milena:** Mon–Fri 16:00–18:00 Combat Grounds (diturunkan) · Wed 18:00–19:30 The Dovecote (diturunkan)
- **Rei:** Mon–Sun 08:00–12:00 The Seal Chamber, maintaining the seal (lore, jam diturunkan) · Mon–Sun 19:00–21:00 The Warden's Office, the mana ledgers (lore, jam diturunkan)
- **Tristan:** Mon–Sun 06:00–07:00 Meditation Rooms (diturunkan) · Mon–Sat 17:00–19:00 The Cathedral, confessions (lore, jam diturunkan) · Sun 09:00–11:00 The Cathedral, the service (diturunkan)
- **Caine:** Mon–Fri 09:00–10:00 Mail Tower, the Liaison's errands (lore, jam diturunkan)

## Pertanyaan

1. **[?] Kebiasaan subuh sebelum curfew selesai (07:00).** Lore menulis beberapa siswa sudah di luar asrama saat subuh:
   - Tsubaki di Sparring Pavilion sebelum subuh setiap hari;
   - Wren di dermaga Fishing House saat subuh;
   - Rigel memancing saat subuh;
   - Aurelian di Combat Grounds saat subuh;
   - William berlatih saat subuh.

   Usulan saya: ikuti lore (05:00–07:00), dan narator memperlakukannya sebagai kebiasaan yang dibiarkan staf, sama seperti Ottavio
   yang menjawab salam Wren di dermaga. Alternatifnya, semua digeser ke mulai 07:00.
2. **[?] Rutinitas yang jamnya saya pilih.** Lebih dari separuh baris berlabel "(diturunkan)", karena lore hanya menyebut tempat.
   Usulan saya: semuanya dipakai, karena tempatnya canon dan hanya "biasanya". Alternatifnya, hanya baris "(lore)" yang dipakai,
   sehingga NPC lain tetap memakai haunts saja.
