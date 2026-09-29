# DRAFT — Ambience dinamis: keramaian, cahaya, isyarat indra, dan beat suasana per kategori (2026-09-29, card 1.15.2)

Status: **DITERAPKAN di card 1.16.0 (2026-09-29).** Owner: "The Faraway Laugh, The Polite Walker, the Last Bed, The Other Climber,
The Applause. ini setuju, buat skrg dan masukan ke entry lorebook beserta semua draft yg sudah disetujui. buat tilly juga aware
dengan hal ini, naikan chance ke 5%", dan "walking lantern gk ada kaitan dengan remembrance day". Kandidat §7.2 lain (One More in
the Count, The Extra Bracelet, The Second Good-Night, Tapping on the Tower Glass, The Late Reflection) tidak dipakai. Perbedaan
dari draft: peluang momen ganjil 5%; aturan 504 diringkas (instruksinya ada di baris `<now>`); isyarat dan beat milik tempat itu
sendiri didahulukan (7 dan 6 dari 10) supaya jenis umum tidak mendominasi. Rincian dan test: CHANGELOG 1.16.0,
`tests/test_ambience_v1160.cjs`.
Asal: owner, "bagaimana dengan fitur dynamic ambience? apakah sudah ditangani engine + preset?", lalu "draft untuk perbaikan
celah, dan menurutmu buat sistem roll engine lalu tiap roll melakukan hal tertentu seperti world sim di preset yg dimatikan? tpi
dibuat khusus perlokasi/cluster lokasi?", lalu "ada secret roll dengan chance kecil yg membuat user engage dengan ghost
story/takhayul".
Jawaban owner atas v1: [?1] "sesuaikan sama real life"; [?2] "kategori bisa tambah lagi?"; [?3] "ya boleh"; [?4] "roll pertemuan
di scrap saja tidak perlu (biarkan sesuka narator atas info yg sudah ada di 1.15.x)"; [?5] "ya". Dan: "draft tabelnya, menurutku
buat ambigu/jenis bukan spesifik agar setelah terulang berkali kali tetap terasa beda beda bukan repetitif".
Jawaban owner atas v2: transit "buang"; Tahap 1 dan 2 "bersamaan"; peluang momen ganjil "pas"; toggle "cukup ikut ambience
full"; dan "buat beberapa ghost story lain untuk cover lokasi dan waktu lain yg cocok untuk ada secret roll ini" (§7).

Keputusan §4 yang disentuh:
- **Card is the only tracker; the preset's Internal States family stays OFF** (World Sim termasuk). Tetap. Roll suasana ada di
  engine: ber-seed, khusus Halvard, dan jauh lebih murah dari World Sim.
- **Card vs preset.** Tabel dan aturan yang menyebut `<now>` masuk card. Satu klausa gaya tulisan masuk preset (E).
- **NPCs react in character.** Tidak ada beat yang menyentuh NPC bernama atau mengubah mood, Trust, Tension, atau angka apa pun.
- **Deterministic / replay-safe.** Roll ber-seed. Seperti Fortune, hasilnya dihitung untuk balasan berikutnya, jadi sama di
  setiap swipe.
- **Roll pertemuan NPC 70/20/10: dibatalkan** (owner). Siapa yang ada di tempat tetap keputusan narator dari "Likely around",
  Haunts, Next, dan info 1.15.x.

---

## 1. Celah yang ditutup
1. **Keramaian:** engine tahu jadwal, tapi tidak pernah bilang tempat itu kosong atau penuh.
2. **Cahaya:** tidak ada terang, senja, lentera, atau gelap yang ikut musim.
3. ***Feel:* statis:** baris yang sama setiap kunjungan.
4. **Adegan santai tipis:** Scene Engine hanya mengizinkan detail yang fungsional.

## 2. Desain

### A1. Keramaian (engine, tanpa roll)
- Lima tingkat: **empty, quiet, some people, busy, packed**.
- Setiap lokasi masuk satu dari **22 kategori** (§3). Setiap kategori punya ritme dasar per blok jam: dini hari, pagi sebelum
  kelas, P1, P2, istirahat siang, P3, sore, malam sebelum curfew, dan setelah curfew. Ritme hari kelas dan akhir pekan dibedakan.
- Pengubah:
  - jam pelajaran: tempat belajar dan tempat santai jadi sepi, ruang kelas penuh;
  - minggu ujian: kategori `study` penuh sampai malam (lore 203);
  - event: lokasi yang disebut rencana hari event penuh, tempat lain turun satu tingkat;
  - cuaca buruk (Full): kategori luar ruangan kosong, kategori dalam ruangan naik satu tingkat;
  - libur pulang (Mid-Year Break, Month 12): semua `empty`, kecuali staf dan kategori `gate`;
  - curfew: kategori dorm saja yang ramai.
- Kategori bisa ditambah kapan saja. Datanya di `data/ambience.json`, jadi menambah kategori tidak perlu mengubah engine.

### A2. Cahaya (engine; mengikuti dunia nyata)
Satu musim = tiga bulan musim nyata (M1–3 Spring = Maret–Mei, M4–6 Summer = Juni–Agustus, M7–9 Autumn = September–November,
M10–12 Winter = Desember–Februari). Angka dari lintang sekitar 48° LU (Eropa tengah), waktu matahari tanpa daylight saving.
Angka di tabel adalah pertengahan bulan; engine menginterpolasi per minggu.

| Bulan (nyata) | Terbit | Terbenam | | Bulan (nyata) | Terbit | Terbenam |
|---|---|---|---|---|---|---|
| M1 (Mar) | 06:05 | 17:55 | | M7 (Sep) | 05:45 | 18:15 |
| M2 (Apr) | 05:15 | 18:45 | | M8 (Okt) | 06:35 | 17:25 |
| M3 (Mei) | 04:30 | 19:30 | | M9 (Nov) | 07:20 | 16:40 |
| M4 (Jun) | 04:05 | 19:55 | | M10 (Des) | 07:50 | 16:10 |
| M5 (Jul) | 04:15 | 19:45 | | M11 (Jan) | 07:40 | 16:20 |
| M6 (Agu) | 04:55 | 19:05 | | M12 (Feb) | 06:55 | 17:05 |

- Fajar dan senja berlangsung sekitar 40 menit sebelum terbit dan sesudah terbenam.
- **Luar ruangan:** daylight, overcast (mendung, kabut, hujan lebat), dawn, dusk, dark. Malam cerah disebut "starlit".
- **Dalam ruangan:** daylight through the windows, lamps lit (senja sampai curfew), lantern-lit (koridor setelah curfew), dark.
- Konsekuensi yang perlu dicocokkan:
  - rencana hari Warding Rite menulis "dusk (about 17:00)" di M2 W1; angka nyatanya sekitar 18:25, jadi diubah ke "about 18:30";
  - "Long evenings on blankets until the eight o'clock bell" (Hills, musim panas) cocok, karena matahari terbenam sekitar 19:55;
  - senja musim dingin 16:10–16:20 cocok dengan lore Forest ("dusk comes early").

### A3. Isyarat indra (engine, tanpa roll acak)
- Setiap update yang berganti tempat atau blok waktu, engine memilih **satu jenis isyarat** yang cocok dari kategori itu dan
  kumpulan umum.
- Pilihan ber-seed. Jenis yang sama tidak dipakai lagi di lokasi itu selama 3 hari.
- Isinya **jenis, bukan kalimat jadi** (permintaan owner): misalnya "the weather heard from indoors", bukan "rain ticking on the
  tall windows". Engine menambahkan konteks yang ia tahu (cuaca, musim, cahaya), dan narator menulis detailnya sendiri setiap
  kali, jadi hasilnya berbeda-beda walaupun jenisnya berulang.
- *Feel:* di lore tetap menjadi nada dasar tempat itu.

### B. Beat suasana (roll engine, pengganti World Sim yang khusus Halvard)
- **Kapan roll jalan.** Pada update yang pindah lokasi, atau sudah lewat minimal 30 menit in-world sejak beat terakhir.
  Tidak jalan saat Battle aktif, {{user}} tidur, {{user}} sedang di kelasnya sendiri, atau tool edit.
- **Hasil d100** (setting Normal):
  - **1–55 CALM:** tidak ada beat;
  - **56–90 TEXTURE:** sesuatu terjadi di sekitar dan tidak menyentuh adegan; satu klausa, boleh diabaikan kalau adegan intens;
  - **91–100 BRUSH:** hal kecil yang menyentuh {{user}}, boleh fisik ringan (disetujui owner). Tidak pernah melukai, tidak
    pernah mengubah angka, dan tidak memaksa pilihan.
  - Setting Rare / Often mengubah batas CALM ke 70 / 40.
- **Pemilihan beat:** dari tabel kategori ditambah kumpulan umum. Beat yang syaratnya tidak cocok dilewati. Jenis yang sama
  tidak dipakai lagi di kategori itu selama 7 hari. Tempat `empty` hanya mendapat beat bertanda `far` (dari kejauhan).
- **Tiga beat khusus** yang menarik data yang sudah ada:
  - `overheard`: potongan rumor yang sedang beredar (fitur Gossip) terdengar dari orang lain;
  - `weather_turn`: cuaca yang berganti di blok ini (cuaca langka diprioritaskan);
  - `event_echo`: persiapan event besok atau sisa event kemarin, dari kalender.
- **Batas.** Hanya orang tanpa nama. Happening harian atau event yang sedang berjalan mengubah BRUSH jadi CALM supaya tidak
  berebut perhatian. Setelah curfew, beat di luar dorm hanya memakai patroli, suara, atau alam.

### B2. Momen ganjil (roll rahasia, peluang kecil)
Permintaan owner: "secret roll dengan chance kecil yg membuat user engage dengan ghost story/takhayul".
- **Roll kedua, terpisah dari B,** dan hanya jalan kalau tempat dan waktunya cocok dengan salah satu cerita di tabel di bawah
  (syarat dari "Where" di lore masing-masing).
- **Peluang [?4]:** 3% per update yang memenuhi syarat.
  - Naik dua kali lipat saat kabut dan selama The Thinning (lore 9: "a week of hearing things through the walls").
  - Night Student naik dua kali lipat di Remembrance Day (lore 209: "It resurfaces every Remembrance Day").
  - Paling banyak satu momen ganjil per minggu in-world, dan cerita yang sama tidak terulang dalam 30 hari.
- **Ikut Ambience Full** (owner): tidak punya toggle sendiri.
- **Rahasia.** Tidak tampil di UI, bracelet, Journal, atau toast. Hanya satu baris narator di `<now>`, ditandai narrator-only.
- **Selalu ambigu.** Narator tidak pernah mengonfirmasi atau menjelaskan bahwa itu gaib; selalu ada tafsiran biasa yang masih
  mungkin. NPC yang ikut mengalaminya bereaksi sesuai karakternya (yang skeptis mencari penjelasan, seperti Fishing Club yang
  "blames distance").
- **Aman.** Tidak ada luka, tidak ada angka yang berubah, dan tidak membuka rahasia misteri (`<narrator_only>`, Clues,
  Mysteries). {{user}} memutuskan sendiri mau menyelidiki, lari, atau menertawakannya.
- **Tidak memaksa NPC.** Momen ini tidak membuat NPC takut atau percaya kalau itu bukan sifatnya.

| Cerita (lore) | Syarat | Jenis momen (English, untuk `<now>`) |
|---|---|---|
| The Third Stall (205) | Bathhouse and Washrooms, setelah lonceng malam | the Third Stall answers {{user}}'s knock, or its latch moves by itself |
| The Long Corridor (206) | koridor utama kastil, sendirian, setelah pembakaran lampu malam | the corridor runs longer than it should; the time does not add up |
| The Three O'Clock Knock (207) | kamar dorm {{user}}, 02:50–03:10, {{user}} terjaga | three evenly spaced knocks at {{user}}'s door |
| The Crying on the Water (208) | Lake atau Fishing House, setelah gelap | a woman crying somewhere out on the water, never from the same place twice |
| The Night Student (209) | Lecture Halls, setelah curfew | a student in an old-cut uniform, sitting as if waiting for a class |
| Sleeping in the Library (224) | {{user}} tertidur di Main Library atau Study Rooms | {{user}} wakes in a reading room that is subtly wrong, and nobody else is there |
| Taken (226) | di luar ruangan setelah gelap, dekat Forest atau Bell Tower | {{user}}'s own name called in the dark by someone out of sight |
| *cerita baru* | lihat §7 | lihat §7 |

Takhayul berbentuk ritual (Star Cookie 222, Founder's Hand 223, Eating in the Forest 225) tidak masuk tabel ini, karena tidak
punya "penampakan". Ketiganya muncul sebagai beat biasa (antrean di tangan Founder pagi hari ujian, remah roti di tunggul
pohon). Jenis beat itu ada di tabel `green` dan `forest` (§3).

Contoh baris `<now>` (narrator only):
```
Uncanny (narrator only; secret, never confirm or explain it, leave a mundane reading possible, no harm): three evenly spaced knocks at {{user}}'s door.
```

### C. Baris `<now>`
Muncul saat tempat atau blok waktu berganti, atau saat ada beat. Contoh hasil engine:
```
Ambience here: busy, lamps lit, heavy rain outside. Sensory cue (your own detail): the weather heard from indoors.
Nearby (optional, one clause, unnamed people): laughter from a group close by.
```

### D. Settings dan biaya token
- Features: **Ambience** dengan tingkat **Off / Texture (A1–A3) / Full (A + B)**, default Full.
- Settings: **frekuensi beat** Rare / Normal / Often.
- Biaya:
  - aturan 504 sekitar 60 token selama fitur menyala;
  - baris `<now>` sekitar 25 token saat berganti tempat atau waktu, dan sekitar 15 token lagi saat ada beat;
  - tabel di engine tidak masuk prompt.
  World Sim sekitar 940 token setiap pesan.

### E. Preset (disetujui owner: [?5] "ya")
Satu klausa di Scene Engine (`presets/edit_preset.py`), setelah kalimat "Environment is active reality: ...":
```
On a quiet turn, one light touch of the setting (its light, sound, weather or the people around) is welcome even when it changes nothing; keep it to one clause and never the same touch twice in a row.
```

## 3. Tabel (English; jenis, bukan kalimat jadi)

Format: `cue` = isyarat indra (A3), `tex` = TEXTURE, `brush` = BRUSH. Kolom syarat: blok jam (dawn, morning, day, evening,
night), cuaca (rain, snow, wind, fog, storm, heat, cold, clear), musim, keramaian (min–max), `far` = dari kejauhan (satu-satunya
yang boleh di tempat empty), `curfew` = boleh setelah curfew.

### 3.0 Umum (dipakai di semua kategori yang cocok)
```
cue   | indoor, any weather   | the weather heard from indoors
cue   | outdoor, any weather  | the weather on skin and clothes
cue   | any                   | the quality of the light right now
cue   | any                   | the temperature of the air
cue   | any, busy+            | the general noise of people
cue   | any, quiet-           | a small sound that the quiet makes loud
tex   | any, far              | a bell marking the hour or a period
tex   | any, far              | voices carrying from somewhere out of sight
tex   | any                   | someone hurrying past on an errand
tex   | any, some+            | laughter from a group close by
tex   | any, some+            | an argument kept to a low hiss nearby
tex   | any                   | an Announcement Pillar crackling with a notice
tex   | any, some+            | casual magic used for something trivial nearby
tex   | any                   | overheard (a live rumour, from the Gossip feature)
tex   | any                   | weather_turn (the weather changing this block)
tex   | any                   | event_echo (tomorrow's event being prepared, or yesterday's leftovers)
brush | any, some+            | someone mistakes {{user}} for someone else
brush | any, some+            | someone asks {{user}} for directions or the time
brush | any                   | a stray object ends up at {{user}}'s feet
brush | outdoor, wind         | the wind takes something of {{user}}'s or someone else's
```

### 3.1 Kategori dan lokasinya
| Kategori | Lokasi | Ritme keramaian (catatan) |
|---|---|---|
| teaching | Lecture Halls, Seminar Rooms | penuh saat P1–P3, kosong malam |
| craft | Potion Halls, Workshop | penuh saat P3 praktik, klub sore |
| study | Main Library, Study Rooms, Archive, Restricted Section | ramai malam, penuh di minggu ujian; Restricted selalu sepi |
| staff | Faculty Offices, Staff Room, Headmaster's Office, Staff Quarters | sepi, ramai antar-periode |
| ceremonial | Arbiter Hall, Ring Dining Hall, Portrait Hall | kosong kecuali event dan feast |
| clubs | Club Rooms, Student Council Chamber, Announcement Room | ramai sore dan Sabtu siang |
| dining | Canteen | penuh jam makan, sepi di antaranya |
| dorm_social | Common Rooms, keempat dorm | ramai malam, satu-satunya yang hidup setelah curfew |
| dorm_utility | Laundry, Bathhouse and Washrooms, Storage and Lockers | ramai pagi dan malam |
| hub | Main Courtyard, Notice Board, Mail Tower | membanjir antar-periode, ramai siang |
| mall | The Mall dan tokonya, Commissary, Banking House | ramai sore dan akhir pekan |
| care | Medical Centre, Meditation Rooms / Spirit House | sepi; Medical Centre ramai di minggu ujian dan musim flu |
| gate | Reception and Gatehouse, Groundskeeper's Lodge | ramai saat hari kunjungan keluarga dan kedatangan |
| enclave | Dovecote, Cathedral, Noble Houses' Liaison, Royal Inspectorate | tenang dan resmi |
| site | Detention Tower, Warden's Office, Seal Chamber | kosong, sunyi |
| heights | Bell Tower, Rooftop, Observation Tower | kosong; Observation Tower ramai malam cerah |
| sport | Sports Field, Gymnasium, Swimming Pool, Archery Range | ramai sore dan akhir pekan |
| combat | Combat Grounds, Sparring Pavilion | penuh saat Combat class, klub sore |
| green | Gardens, Founder's Park, Menagerie, Broken Statue | sepi, ramai sore cerah |
| lake | Boathouse and Lake, Fishing House, Willow Island | sepi; subuh ramai klub pancing, siang musim panas ramai |
| hills | Grassy Field and Hills, Old Hut | sepi; ramai sore cerah dan saat event |
| forest | Forest, Forest Clearing | hampir selalu kosong |

### 3.2 Beat per kategori
```
teaching
cue   | any                 | the smell and dust of a teaching room
cue   | busy+               | the rustle of a full room settling
tex   | busy+               | a lecture overheard through a door
tex   | some+               | a note passed along a bench
tex   | any, far            | chalk or quill scratching in an empty room nearby
brush | busy+               | someone borrows or returns something of {{user}}'s

craft
cue   | any                 | the smell of the work being done here
cue   | busy+               | heat and noise from the benches
tex   | some+               | a small mishap at a bench (a fizz, a crack, a curse)
tex   | any                 | the tools and vessels settling and ticking as they cool
brush | some+               | a whiff or splash from someone's work reaches {{user}}

study
cue   | any                 | the particular hush of this room
cue   | evening, night      | lamplight on the tables
cue   | exam week           | the tension of people cramming
tex   | some+               | a stifled laugh and someone shushing it
tex   | any                 | books being shelved or carted
tex   | exam week           | someone asleep over their notes
brush | some+               | someone asks {{user}} to keep an eye on their things

staff
cue   | any                 | the formality of the corridor
tex   | any                 | a door opening on a teacher's voice mid-sentence
tex   | any, far            | staff talking shop behind a door
brush | any                 | a passing teacher glances at {{user}} and remembers something

ceremonial
cue   | empty               | the size of the room when it is empty
cue   | busy+               | the whole hall's noise under the vault
tex   | any                 | staff preparing the room for the next occasion
tex   | busy+               | a table breaking into a toast or a cheer
brush | busy+               | {{user}} is jostled in the crush at the doors

clubs
cue   | any                 | the clutter of a room many clubs share
tex   | some+               | a club rehearsing, arguing or recruiting behind a door
tex   | any                 | a notice or flyer being pinned up
brush | some+               | someone tries to recruit {{user}} for something

dining
cue   | busy+               | the din of a full canteen
cue   | quiet-              | the kitchen heard through the hatch
cue   | any                 | today's food smell
tex   | busy+               | a table celebrating or daring someone
tex   | some+               | someone at a nearby table eating alone
brush | busy+               | a spill or a tipped tray reaches {{user}}
brush | some+               | someone asks to share {{user}}'s table

dorm_social
cue   | any                 | the dorm's own smell and warmth
cue   | evening, night      | the fire or lamps in the common room
tex   | some+               | a game, a card table or a study group in full swing
tex   | any                 | something going on in someone's room upstairs
tex   | curfew              | late whispering on the stairs
brush | some+               | a dormmate drags {{user}} into something small

dorm_utility
cue   | any                 | steam, soap or damp stone
tex   | any                 | someone's laundry mishap
brush | any                 | a mix-up with {{user}}'s things

hub
cue   | any                 | how full or empty the courtyard is right now
cue   | outdoor             | the season in the courtyard
tex   | busy+               | a crowd gathered around something
tex   | busy+               | students flooding out between periods
tex   | any                 | a notice going up on the board
brush | busy+               | a flyer, a leaflet or a message pressed into {{user}}'s hand

mall
cue   | any                 | the mix of shop smells
cue   | busy+               | the bustle between the stalls and shops
tex   | some+               | haggling or a small scene at a counter
tex   | any                 | a shopkeeper calling out a deal
brush | some+               | a shopkeeper tries to sell {{user}} something

care
cue   | any                 | the clean, herbal smell of the place
tex   | any                 | someone being patched up nearby
tex   | flu                 | coughing from the beds
brush | any                 | a volunteer offers {{user}} something (water, a remedy, a seat)

gate
cue   | any                 | the traffic at the gate
tex   | any                 | someone signing in or being turned away
tex   | any                 | a delivery arriving
brush | any                 | the porter asks {{user}} to pass something on

enclave
cue   | any                 | the change in air past the academy's ground
tex   | any                 | an official about their business
tex   | any, far            | a service, a drill or a meeting heard from inside
brush | any                 | {{user}} is watched a moment too long

site
cue   | any                 | the silence and the cold
tex   | any, far            | a sound the stone makes on its own
brush | any                 | a feeling of being noticed, with no one there

heights
cue   | any                 | the height and the wind
cue   | clear, night        | the stars
tex   | any, far            | the campus below going about its business
tex   | night, clear        | stargazers setting up
brush | wind                | the wind nearly takes something

sport
cue   | any                 | the smell of the grass, the floor or the water
tex   | busy+               | a match or a practice going on
tex   | some+               | a team shouting or a coach's whistle
brush | some+               | a ball, a shuttle or an arrow's stray lands near {{user}}
brush | some+               | someone asks {{user}} to make up the numbers

combat
cue   | any                 | the scuffed rings and the smell of spent magic
tex   | some+               | a duel or drill going on in a warded ring
tex   | any                 | the ward lines humming or flickering
brush | some+               | a stray spark or gust from a ring reaches {{user}}

green
cue   | any                 | what is growing or blooming this season
tex   | exam week, morning  | a queue of students touching the Founder's Hand (Founder's Park)
tex   | any                 | a gardener or handler at work
tex   | any                 | an animal making itself known
brush | any                 | a creature or plant takes an interest in {{user}}

lake
cue   | any                 | the water's mood right now
cue   | dawn, morning       | mist on the water
tex   | any                 | birds or fish on the water
tex   | some+               | rowers, swimmers or anglers out
tex   | any, far            | a voice carrying too clearly across the water
brush | any                 | something washes up or drifts to {{user}}

hills
cue   | any                 | the openness and the wind in the grass
cue   | any                 | the castle small in the distance
tex   | some+               | people out on the slopes (kites, blankets, sledges by season)
tex   | any, far            | the Forest's edge making a sound
brush | wind                | the wind takes something across the grass

forest
cue   | any                 | the light under the trees
cue   | any                 | the forest's quiet or its noise
tex   | any                 | something moving unseen in the undergrowth
tex   | snow                | tracks that are not a deer's
tex   | any                 | an offering left on a stump by someone who ate here (Eating in the Forest)
brush | any                 | a branch, a bramble or a root catches {{user}}
```

## 4. Tahapan
Owner: kedua tahap **dalam satu rilis**.
1. **Tahap 1:** A1–A3 (keramaian, cahaya, isyarat), baris Ambience di `<now>`, aturan 504, Features Off/Texture, penyesuaian
   rencana hari Warding Rite, klausa preset (E).
2. **Tahap 2:** B (beat) dan B2 (momen ganjil), Features Full, Settings frekuensi.

## 5. Test
- Keramaian: Lecture Halls penuh saat P1 dan kosong jam 20:00; Library penuh di minggu ujian; Sports Field kosong saat badai
  (Full); kampus kosong saat Mid-Year Break; lokasi event penuh; setelah curfew hanya dorm yang hidup.
- Cahaya: terbit dan terbenam sesuai tabel (interpolasi per minggu); senja M10 sekitar 16:10; di dalam ruangan malam hari
  "lamps lit"; rencana hari Warding Rite menyebut "about 18:30".
- Isyarat dan beat: jenis yang sama tidak berulang dalam 3 dan 7 hari; syarat dipatuhi (`far` di tempat kosong, `curfew`);
  hasil sama di setiap swipe; tidak jalan saat Battle, tidur, kelas, atau tool edit; BRUSH jadi CALM saat ada happening atau
  event; `overheard` memakai rumor yang sedang beredar; Features Off / Texture / Full; frekuensi Rare / Normal / Often.
- Momen ganjil: hanya saat syarat cerita cocok; peluang naik saat kabut, The Thinning, dan Remembrance Day (Night Student);
  batas seminggu dan 30 hari; tidak tampil di UI, Journal, atau toast; tidak mengubah angka.
- Biaya token diukur dengan `token_audit.cjs`; save lama termuat.

## 6. Keputusan (terjawab)
- [?1] `transit` dibuang. [?2] Taken pindah ke momen ganjil. [?3] Tahap 1 dan 2 dalam satu rilis. [?4] 3% per update yang
  memenuhi syarat, paling banyak sekali seminggu, cerita sama tidak terulang dalam 30 hari. [?5] Tanpa toggle sendiri; ikut
  Ambience Full.

## 7. Ghost story baru (canon baru)
Aturan untuk semua cerita baru:
- Ambigu dan tetap bisa dijelaskan secara biasa; tidak ada yang mengonfirmasi hal gaib.
- Tidak **menyentuh misteri**. Broken Statue (punya rahasia sendiri), Portrait Hall dan Warden lama, Arbiter Stone, Restricted
  Section, the Site, dan Forest Clearing (tempat yang tenang dan terang) sengaja tidak dipakai.
- Kecuali Taken yang sudah ada, tidak ada yang dikaitkan dengan the Crack atau malam breach.
- Setiap cerita mendapat satu baris "Home of the ... story" di entry lokasinya, kata kunci sendiri, dan satu baris di tabel
  momen ganjil (B2). uid ditentukan saat implementasi.

### 7.1 Disetujui owner (v3)
Owner: "yg saya setuju: The Thirteenth Stroke, The Night Swimmer, The Walking Lantern, Breath on the Glass, When the Pens Go
Quiet." Ditolak: The Empty Feast, The Folded Uniform, The Undeliverable Letter, The Uncharted Star, The Empty Ring, The Listening
Hut.

| Cerita | Lokasi dan waktu | Momen ganjil (English, untuk `<now>`) |
|---|---|---|
| The Thirteenth Stroke | di luar ruangan setelah lonceng jam delapan (Main Courtyard, halaman dorm dan kastil) | the Bell Tower strikes once more than the hour, with no one in the tower |
| The Night Swimmer | Swimming Pool setelah gelap (paling sering musim dingin, saat airnya beruap) | someone swimming lengths in the steam; the lane rope moves; the water is empty |
| The Walking Lantern | Grassy Field and Hills, setelah gelap | a single lantern light crossing the ridge with no one carrying it |
| Breath on the Glass | Gardens, di dalam greenhouse, sore dan malam | the glass fogs from the inside around a handprint that is not {{user}}'s |
| When the Pens Go Quiet | Menagerie, senja dan malam | every animal falls silent at once and faces the Forest |

```
[The Thirteenth Stroke]
Where: anywhere outdoors after the eight o'clock bell.
Story: the Bell Tower sometimes strikes once more than the hour, a single stroke after the rest, when no one is in the tower.
Rule: count the strokes. If there is one too many, go indoors and do not count again that night.
Known for: nobody agrees on what the extra stroke is for; the bell ringers say the mechanism settles, and never ring it themselves.

[The Night Swimmer]
Where: the Swimming Pool after dark, most often in winter when the rune-warmed water steams.
Story: someone swims steady lengths through the steam, the lane rope lifting as they pass, but when the steam clears the water is empty and still.
Rule: never swim alone after dark, and do not call out to them.
Known for: the Swimming Club claims the fastest lap on record and will not say who swam it.

[The Walking Lantern]
Where: the Grassy Field and Hills, after dark.
Story: a single lantern light crosses the ridge at walking pace with no one carrying it, and stops when anyone stops to watch.
Rule: do not walk toward it, and do not follow it towards the Forest.
Known for: the Walking Club keeps to the lower path after dusk and will not say why.

[Breath on the Glass]
Where: inside the Gardens' greenhouses, in the late afternoon and evening.
Story: the glass fogs from the inside, as if someone warm stood close to it, around a handprint that belongs to nobody present.
Rule: do not press your own hand over it, and do not sleep in the greenhouses.
Known for: the Gardening Club blames the heat pipes, and still leaves in pairs.

[When the Pens Go Quiet]
Where: the Menagerie, from dusk into the night.
Story: every animal in the pens falls silent at once and turns to face the Forest, and stays that way for a long moment before the noise comes back.
Rule: when the pens go quiet, walk away in the other direction and do not look where they are looking.
Known for: the handlers call it weather sense; the Creature Studies teacher does not call it anything.
```

### 7.2 Kandidat baru (v4, untuk dipilih)
Owner: "cari inspirasi dari film horor, horor story yg biasa di share reddit, urban legend, horor story kampus indo/luar".
Kolom "Inspirasi" hanya catatan untuk owner; tidak masuk card.

| Cerita | Inspirasi | Lokasi dan waktu | Momen ganjil (English, untuk `<now>`) |
|---|---|---|---|
| The Faraway Laugh | kuntilanak: tawa perempuan di pohon, "kalau terdengar jauh, dia dekat" | Founder's Park dan jalan berpohon, setelah gelap | a woman's laugh from the old trees, faint, as if far away |
| The Polite Walker | Betobeto-san (Jepang); langkah kaki "ikut" di jalan pulang (cerita KKN dan kampus Indo) | jalan panjang ke area jauh (Gardens–Lake, Courtyard–Hills), senja dan malam | footsteps behind {{user}} that stop when {{user}} stops |
| One More in the Count | "ada yang ikut" dan absen dengan satu nama lebih (kampus Indo); hitori kakurenbo (Jepang); orang tambahan di foto | Gymnasium setelah gelap, atau rombongan mana saja yang berhitung di luar setelah gelap | a head count comes out one more than the people there |
| The Extra Bracelet | tanda tangan tambahan di daftar hadir kelas malam (kampus Indo) | Seminar Rooms, sesi atau kelompok belajar di sore dan malam hari | the room's attendance rune counts one more bracelet than there are people |
| The Last Bed | horor rumah sakit ("pasien di ranjang terakhir"; suster malam, Indo dan Barat) | Medical Centre, malam, saat {{user}} dirawat di sana | the curtain round the last bed is drawn, and someone breathes behind it; the ward register says it is empty |
| The Second Good-Night | siaran radio setelah stasiun tutup, numbers station, creepypasta "emergency broadcast" | di dekat Announcement Pillar, setelah salam malam terakhir | a Pillar gives a second good-night in a voice nobody on the Newspaper recognises |
| Tapping on the Tower Glass | cerita Reddit "ketukan di jendela lantai tiga"; Salem's Lot | Potion Halls (Floor 4) atau Study Rooms, larut sore dan malam | tapping on the outside of a high window, four floors up |
| The Late Reflection | refleksi yang telat bergerak (Reddit, cermin Jepang) | Common Rooms, malam, di kaca jendela yang gelap | {{user}}'s reflection in the dark window moves a moment late |
| The Other Climber | doppelgänger (legenda Eropa; film Us) | Rooftop, malam | someone sits on the far gable in {{user}}'s posture, wearing {{user}}'s dorm vest |
| The Applause | hantu teater dan auditorium (Phantom of the Opera; auditorium kampus Indo) | amfiteater tua di ujung koridor Club Rooms, saat latihan malam | applause from the empty upper tiers, and one seat folded down |

**Teks lore kandidat (English):**
```
[The Faraway Laugh]
Where: Founder's Park and the tree-lined paths, after dark.
Story: a woman laughs somewhere up in the old trees. The laugh always sounds far away.
Rule: the fainter it sounds, the closer she is. If it sounds far, walk the other way at once and do not look up.
Known for: students who hear it say it was only an owl, and take the long way round for a week.

[The Polite Walker]
Where: the long paths out to the far grounds (the Gardens to the lake, the courtyard to the Hills), at dusk and after dark.
Story: footsteps fall in behind whoever walks alone, matching their pace, stopping when they stop. Turning round shows an empty path.
Rule: step off the path and say "after you". The steps go on past, and the path is yours again.
Known for: seniors teach first-years the words on their first walk to the lake, and laugh while they do it.

[One More in the Count]
Where: the Gymnasium after dark, or any group counting heads outdoors at night.
Story: count the people present and the count comes out one more than there are. Count again and it is right.
Rule: never count a third time, and never ask who the extra one was.
Known for: the reason group-work leaders at Halvard count by pairs, never one by one.

[The Extra Bracelet]
Where: the Seminar Rooms, during evening study groups.
Story: the room's attendance rune reads the bracelets present and counts one more than there are students in the room.
Rule: do not look for the extra one, and do not stay in that room after the others leave.
Known for: the Warding Study Group blames an old rune; the rune has been replaced twice.

[The Last Bed]
Where: the Medical Centre, at night, for students kept in overnight.
Story: the curtain round the last bed on the ward is drawn, and someone behind it breathes slowly in their sleep. The ward register says that bed is empty.
Rule: never open the last curtain. Ask the night nurse in the morning; she will tell you it was empty, and she will be kind about it.
Known for: patients who are well enough ask to be moved nearer the door.

[The Second Good-Night]
Where: within earshot of an Announcement Pillar, after the last evening greeting.
Story: after the Newspaper's good-night, a Pillar crackles once more and a second voice says good night to the academy, calm and friendly. Nobody on the Newspaper recognises it, and the Announcement Room was locked.
Rule: do not answer it and do not repeat what it says.
Known for: the Newspaper's duty roster ends with "lock the room, do not wait to listen".

[Tapping on the Tower Glass]
Where: the high windows of the Potion Halls and the Study Rooms, in the late evening.
Story: someone taps on the outside of the glass, patiently, four floors above the ground.
Rule: do not open the window to look, and do not tap back.
Known for: the Alchemy Circle blames birds; nobody has seen a bird there after dark.

[The Late Reflection]
Where: the Common Rooms at night, in the dark windows.
Story: your reflection in the black glass moves a moment after you do.
Rule: do not wave at it, and draw the curtain before you sleep.
Known for: every dorm has one window it keeps curtained, and each says it is for the draught.

[The Other Climber]
Where: the Rooftop, at night.
Story: someone sits on the far gable in exactly your posture, wearing your dorm's vest, looking out over the grounds as you are.
Rule: leave the roof before they turn round, and do not come up again that night.
Known for: why students who know the way up never go up alone.

[The Applause]
Where: the old amphitheatre off the Club Rooms corridor, during a late rehearsal.
Story: at the end of a scene, applause comes from the empty upper tiers, and one seat up there has been folded down.
Rule: bow, and end the rehearsal. Do not run the scene again that night.
Known for: the Theatre Troupe bows to the empty tiers at the end of every rehearsal, and calls it tradition.
```

**Keputusan terbuka:**
- **[?6] Pilih kandidat 7.2** yang masuk (boleh semua, sebagian, atau minta yang lain).
- **[?7] The Walking Lantern** tetap tidak dikaitkan dengan malam Remembrance Day (default, karena itu hari duka kampus).
