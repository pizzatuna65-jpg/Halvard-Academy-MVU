# DRAFT — Map musim dan event (prompt img2img)

Status: **SELESAI (1.14.3): ke-13 map sudah dibuat owner (Qwen), diunggah ke repo assets (commit e64b4b1) dan terpasang di
`map_variants`. Map Independence Day sudah diperbaiki owner (1.14.4); lore 24 mengikuti map-nya: kembang api di atas
danau, airship di belakang Menagerie dan Gymnasium. Prompt 6 di bawah adalah versi lama.** Riwayat: prompt siap dipakai (diperbarui untuk 1.14.0: default = Summer, map Spring baru, visual lore musim); tambahan lore
visual [?1]–[?7] DISETUJUI dan diterapkan di card 1.13.2** (owner, 2026-09-29: "agree
semua point 3"; warna kerajaan Eldrasil = biru tua dan emas). Tinggal membuat gambarnya.
Mekanisme map sudah ada sejak 1.13.0 (`map_variants` di `data/assets_manifest.json`); map event selalu menang atas map musim (1.13.1).
Sumber lore: entry event 9, 22, 24, 96, 233, 239, 241, 243, 245, lokasi 42, 76, 77, 78, 254, dan `planning/DRAFT_nations.md`.

## 1. Urutan kerja

**Map default = Summer** (owner 2026-09-29, [?2] di `DRAFT_dynamic_lore.md`: daun penuh dan rumput lebat cocok dengan M4–6,
18–22 °C). Buat 3 map musim dulu dari map default (Spring, Autumn, Winter), lalu setiap map event dibuat **dari map musimnya**.
Model: **Qwen** (owner). Qwen mengeluarkan 1500×1000; resize ke 1536×1024 tanpa crop (rasio sama).

| # | Map | Input gambar | Musim (bulan) | Kapan tampil |
|---|---|---|---|---|
| 1 | Spring | map default | M1–3 | seluruh musim |
| 2 | Autumn | map default | M7–9 | seluruh musim |
| 3 | Winter | map default | M10–12 | seluruh musim |
| – | Summer | = map default (tidak dibuat) | M4–6 | seluruh musim |
| – | Star Night | (sudah jadi; map malam, musimnya hampir tak terlihat) | M1 W3 | Sab 18:00 – Min 06:00 |
| 4 | Warding Rite | **Spring** | M2 W1 | Jum 17:00 – Sab 06:00 |
| 5 | Club Festival | **Spring** | M3 W2 | Jum 12:00 – Sab 24:00 |
| 6 | Crowning Day, malam kembang api | map default (Summer) | M4 W2 | Sel 18:00 – 24:00 |
| 7 | Sports Day | map default (Summer) | M6 W3 | Sab seharian |
| 8 | The Thinning | **Autumn** | M7 W3 | seminggu penuh |
| 9 | Traveling Circus | **Autumn** | M8 W2 | Kam 17:00 – Min 24:00 |
| 10 | Academy Bazaar | **Autumn** | M9 W2 | Kam – Sab seharian |
| 11 | Harvest Festival | **Winter** | M10 W4 | Jum 17:00 – Min 24:00 |
| 12 | Graduation (pasar perpisahan musim dingin) | **Winter** | M11 W4 | Min 12:00 – 24:00 |

Catatan:
- Harvest Festival jatuh di M10, yang di kalender engine sudah Winter (lore: "the last harvest is in and winter is setting in, so
  the stalls run on braziers"). Salju tipis pertama cocok dengan lore dan membuat lentera lebih menonjol.
- Setelah tiap gambar jadi, kirim ke saya. Saya akan mengecek dengan pin (seperti Star Night: 36 pin harus jatuh di bangunannya)
  sebelum gambar diunggah. Model gambar sering sedikit menggeser bangunan, dan pin yang meleset merusak map.
- Ukuran wajib 1536×1024 (3:2). Kalau model mengeluarkan ukuran lain, resize ke 1536×1024 **tanpa crop**.

## 2. Kalimat pembuka (tempel di awal SETIAP prompt)

```
Edit this image. It is the campus map of a fantasy magic academy, used in a game with clickable pins on every building, so the
layout must not change at all. Keep exactly: the camera angle, framing, zoom and scale; every building, tower, dome, roof, wall,
gate, bridge, path, fence, field, pond, lake shoreline, island and tree cluster in the same position, shape and size. Do not
add, remove, move, merge or resize any building or path. Do not add text, labels, letters, numbers, logos, signatures, borders
or a frame. Keep the same painterly isometric fantasy-map style, colour richness and level of detail. Output a 3:2 landscape
image the same size as the input. Only change what is described below, and make that change clearly visible at a glance.
```

## 3. Prompt per map

### 1. Spring (input: map default)
```
Change the season to early spring (Months 1 to 3, cool, about 9 to 15 °C). Soft, fresh morning light with a thin mist in the
low ground and over the lake. Many broadleaf trees are only just coming into leaf: pale lime-green young leaves, some branches
still half bare. The flowering trees across campus are in full blossom: masses of pale pink and white cherry and plum blossom,
with petals drifting onto the paths and lawns. Grass fresh and light green, dotted with small spring flowers (crocus,
daffodils). The forest clearing with the great oak in the upper left is the first place in full flower. In the gardens with
the glass greenhouses on the right, neat rows of seedlings under small glass cloches. Two or three kites fly over the grassy
hills at the top. The great oak inside the green-roofed dormitory's courtyard is in pale new leaf. Evergreens in the forest
unchanged. A few puddles on the paths from spring rain. The lake calm and pale blue-grey under a soft sky.
```

### 2. Autumn (input: map default)
```
Change the season to autumn (Months 7 to 9, cooling from mild to cool). Soft low afternoon sunlight with long warm shadows.
Broadleaf trees across campus and at the forest edges turn orange, red, amber and gold; evergreens stay dark green. Scattered
fallen leaves on lawns and along the paths, some drifting in the courtyards. Grass slightly faded toward gold. The willow on
the island in the lake turns golden yellow. The great oak inside the green-roofed dormitory's courtyard turns bright gold. The
lake a deeper, darker blue reflecting the warm trees, with morning mist lying on the water. A light haze in the distance.
Garden beds past their bloom, with late flowers and pumpkins in the vegetable plots and a few tiny figures harvesting. Piles of
raked leaves along the paths of the park with the statue.
```

### 3. Winter (input: map default)
```
Change the season to winter (Months 10 to 12, around freezing, snow). A fresh layer of snow on every roof, tower top, wall top,
lawn, field and hill; evergreens dusted with snow; bare broadleaf trees. Main paths and the central courtyard are cleared, so
they read as darker stone lines through the snow. The lake is dark grey-blue with thin ice and snow along its shores. Soft,
cool overcast daylight with a pale sky tone. Warm yellow light glows in many windows and thin chimney smoke rises from the
dormitories and staff buildings. Keep the forest clearing in the upper left green with its colourful flowers around the great
oak, untouched by the snow, as if the old tree keeps it warm. The outdoor swimming pool beside the gymnasium steams in the cold.
The glass greenhouses in the gardens glow warm from inside. The great oak inside the green-roofed dormitory's courtyard is bare,
its branches lined with snow. The teal glass dome of the dormitory to the right of the courtyard stays clear of snow and glows softly. A few snowmen
stand on the lawns of the park with the statue. Sled tracks and a few tiny sledding figures on the grassy hills at the top. The
small timber hut on the far slope of the hills is half buried in snow with no footprints leading to it. Rowing boats pulled up
on the shore beside the boathouse, under covers. The willow island in the lake still glows with fireflies.
```
(Clearing yang tetap hijau = lore 1.13.2. Kolam beruap, greenhouse, ek Viridian, manusia salju, seluncur, Old Hut, perahu,
kunang-kunang = lore musim 1.14.0, `planning/DRAFT_dynamic_lore.md`.)

### 4. Warding Rite (input: SPRING map)
```
Make it dusk on the night of the Warding Rite, the yearly renewal of the academy's protective wards. Deep violet and orange
dusk sky light, the campus in blue shadow. In the large circular central courtyard in front of the castle, a giant glowing
magic circle fills the paving: concentric rings of pale gold and white runes, bright and crisp. Hundreds of tiny student
figures stand around and inside the circle in four blocks by dormitory colour (red, yellow, blue, green vests), all facing
the centre, with thin threads of light rising from them into the circle. From the circle, streams of light flow into the
castle's foundations. A faint, translucent shell of pale-gold rune light rises from the academy's outer wall and arches over
the whole campus like a thin glass dome, brightest at the wall. Windows are lit. No fireworks.
```
(Kubah ward yang terlihat = [?2].)

### 5. Club Festival (input: SPRING map)
```
Make it a bright spring festival day: the Club Festival. The large circular central courtyard in front of the castle is ringed
and filled with dozens of small colourful club stands with striped awnings, banners and pennant flags, crowded with tiny
student figures. Strings of bunting cross the courtyard. In one part of the courtyard a small roped-off ring holds an exhibition
duel with two tiny figures and a watching crowd; elsewhere a stand with smithing sparks, a stand with bubbling alchemy bottles,
and a pen with a few tame magical creatures on show. Thin smoke drifts from food stalls. Flower beds in spring bloom, soft
cheerful daylight. A few extra stands and small crowds spill onto the lawns and paths next to the courtyard.
```

### 6. Crowning Day night fireworks (input: map default = Summer)
```
Make it a warm summer night: the evening of Independence Crowning Day. Deep blue night lighting over the campus, warm yellow
light in the windows. Above the grassy hills at the top of the image, behind the castle, a big fireworks display bursts in the
sky in gold, white, red and blue, lighting the hills and the castle towers from above with coloured glow. Crowds of tiny
student figures sit and stand on the grassy hills watching the fireworks. Festive royal banners in deep blue and gold hang from the castle towers.
A large airship with glowing cabin windows is moored in the air above the edge of the grassy field. The rest of the campus is
quiet and softly lit.
```
(Banner kerajaan di menara dan airship yang parkir = [?3].)

### 7. Sports Day (input: map default = Summer)
```
Make it a bright, sunny summer day: Sports Day, with no magic anywhere (no glowing spells or magical light effects at all).
The large sports field on the right has white running lanes marked on it, runners mid-race, small spectator stands packed
with tiny figures, and a small three-step medal podium. Banners in the four dormitory colours (red, yellow, blue, green) fly
around the field and along the main paths. In the central courtyard a tug-of-war between two teams with a crowd around them.
On the lake, a rowing race: a line of small boats with oars, spectators on the shore and the boathouse docks. At the fenced
combat grounds at the bottom right, wrestling and staff-fighting bouts with small crowds. Cheerful, busy, sunlit.
```

### 8. The Thinning (input: AUTUMN map)
```
Make it the Thinning, a week-long lockdown when the academy's ancient seal is at its weakest. The whole campus is empty: not
a single person on any path, courtyard, field or dock; no boats on the lake. Every window shuttered or dimly lit with a cold,
unnaturally steady pale light. Heavy low grey fog pools in the courtyards, between buildings and over the lake. The sky is a
heavy overcast grey, the autumn colours drained and desaturated. Along the academy's outer wall, a faint strained shimmer of
pale ward light, flickering unevenly. No birds anywhere. Eerie, silent, watchful. Do not show any monsters, cracks, portals or
creatures.
```
(Tidak ada burung dan ward yang berkedip = [?4]. Retakan segel sengaja tidak digambar.)

### 9. Traveling Circus (input: AUTUMN map)
```
Make it the week the Traveling Circus visits: the whole campus turned carnival, late afternoon golden light with warm autumn
colours. A great striped circus big top (crimson and cream stripes, gold pennants on its poles) stands in the middle of the
large circular central courtyard, taking up most of it. Smaller tents, game booths, food carts and fortune-teller wagons with
curved roofs are scattered across the lawns and along the paths around it. A line of painted circus caravan wagons is parked
along the inside of the wall near the main gatehouse at the bottom. Strings of small warm lights run between the tents. Crowds
of tiny figures everywhere. A little sparkle of stage magic above the big top.
```
(Warna tenda merah-krem = [?5].)

### 10. Academy Bazaar (input: AUTUMN map)
```
Make it a busy autumn day: the Academy Bazaar, when invited traders from the capital, the provinces and abroad fill the large
circular central courtyard. The courtyard is packed with trader stalls and canopies in many colours, crowded with tiny figures.
Among them, distinct foreign sections: stalls with cherry-blossom-pink awnings and paper lanterns (Yozakura); a stall of dark
glass lenses and crystals that glitter with tiny stars (Norvaine starglass); stacks of brass mana lanterns glowing in crates
(Caelmar); green-and-ivory silk canopies with jars of fruit preserves and fine clothes (Velmora); a desert-gold tent with money
tables and scales (the Arslan Sultanate). A queue of merchant wagons waits at the main gatehouse at the bottom. Soft autumn
daylight, warm leaves on the trees around the courtyard.
```
(Warna tiap negara = [?6].)

### 11. Harvest Festival (input: WINTER map)
```
Make it dusk during the Harvest Festival, the biggest festival of the year, with the first light snow of winter on the
ground. Glowing carved lanterns line every single path across the campus, orange and warm against the snow. The large
circular central courtyard is full of food stalls, small cafés and game booths with glowing iron braziers and rising smoke.
Crowds of tiny figures in costumes: monsters, ghosts, beasts and masks. A small outdoor stage with an act on it. Some older
castle windows glow eerie green where haunted houses are set up. A line of visitors' carriages near the main gatehouse. Deep
blue dusk sky, warm windows, lantern light everywhere.
```
(Jendela hijau haunted house = [?7].)

### 12. Graduation (input: WINTER map)
```
Make it late afternoon into dusk on Graduation day in early winter: a warm, festive farewell. Snow on the ground and a few
flakes falling. The large circular central courtyard in front of the castle is a winter market for the day: rows of small
wooden stalls with snow-dusted roofs, hung with evergreen garlands and warm strings of lanterns, steam rising from hot cider
and roasted-chestnut stalls, crowds of tiny figures including families in winter coats. In the very centre of the courtyard
stands one tall evergreen pine hung with hundreds of coloured ribbons and small warm lights. At the edges of the courtyard four
snowmen, each wearing a scarf in one dormitory colour (red, yellow, blue, green). The market spills into the park around the
bronze statue below and to the right of the courtyard: more lantern-lit stalls between its paths, several more snowmen on the
snowy lawns, and a small wooden music stage beside the statue with tiny musicians playing and a crowd gathered in front of it.
Every path between the courtyard and the park is busy with people. A large airship with glowing cabin windows
rides at anchor in the air above the grassy hills at the top, lit like a lantern. Warm light in every castle window, a deep
blue dusk sky. No fireworks.
```
(Semua isi = lore Graduation 1.14.1–1.14.2: pasar perpisahan di halaman utama dan Founder's Park, Farewell Pine, manusia salju,
panggung Music Club dekat patung, airship wisudawan.)

## 4. Tambahan lore visual yang diusulkan

Setiap tambahan yang disetujui dimasukkan ke entry event atau lokasinya (satu kalimat lewat `merge_lorebooks.py`), supaya
narator menggambarkan hal yang sama dengan map. Yang tidak disetujui cukup dihapus dari prompt.

- **[?1] Winter:** clearing Elder Oak tetap hijau dan berbunga di bawah salju (lore 254: akar oak menarik mana tanah dan bunganya
  tidak tumbuh di tempat lain). Teks card (Forest Clearing): `In winter the clearing stays green and in flower while snow lies
  everywhere around it.`
- **[?2] Warding Rite:** saat ritual, ward terlihat sebagai kubah tipis cahaya rune emas pucat dari tembok luar sampai subuh.
  Teks card (entry 96): `- From dusk to dawn the renewed wards are visible: a thin shell of pale-gold rune light rising from the outer wall over the grounds.`
- **[?3] Crowning Day:** banner kerajaan di menara kastil sepanjang hari, dan airship sewaan (kru Yozakura, lore 231) parkir di
  atas Grassy Field malam itu. Teks card (entry 24): `The royal banners fly from the castle towers all day; that night the hired airship rides at anchor above the Grassy Field.`
  Warna kerajaan Eldrasil: biru tua dan emas (disetujui; juga di entry Kingdom — Eldrasil).
- **[?4] The Thinning:** ward di tembok luar berkedip lemah dan tidak ada burung sepanjang minggu itu. Teks card (entry 9):
  `- The wards along the outer wall flicker faintly all week, and the birds leave the grounds until it is over.`
- **[?5] Traveling Circus:** big top bergaris merah tua dan krem dengan panji emas; kereta karavan dicat parkir di dalam tembok dekat
  Gatehouse. Teks card (entry 241): `Its great tent is striped crimson and cream, and its painted wagons park inside the wall by the Gatehouse.`
- **[?6] Academy Bazaar:** warna tiap bagian negara: Yozakura pink sakura dan lentera kertas, Norvaine kaca gelap berbintang,
  Caelmar lentera kuningan, Velmora kanopi hijau-gading, Arslan tenda emas gurun. Teks card (entry 243, menambah baris From abroad
  yang sudah ada): `Each nation's traders keep to their colours: Yozakuran blossom pink and paper lanterns, Velmoran green and ivory, Arslan desert gold.`
- **[?7] Harvest Festival:** jendela koridor tua yang menjadi haunted house menyala hijau aneh. Teks card (entry 245):
  `The older corridors turned haunted houses glow a sickly green from outside.`

## 5. Baris `map_variants` (ditambahkan setelah gambar diunggah)

```json
{"id": "warding_rite", "file": "map/halvard_map_warding_rite.webp", "event": "Warding Rite", "hours": {"Fri": [17, 24], "Sat": [0, 6]}},
{"id": "club_festival", "file": "map/halvard_map_club_festival.webp", "event": "Club Festival", "hours": {"Fri": [12, 24], "Sat": [0, 24]}},
{"id": "crowning_night", "file": "map/halvard_map_crowning_night.webp", "event": "Independence Crowning Day", "hours": {"Tue": [18, 24]}},
{"id": "sports_day", "file": "map/halvard_map_sports_day.webp", "event": "Sports Day"},
{"id": "thinning", "file": "map/halvard_map_thinning.webp", "event": "The Thinning"},
{"id": "circus", "file": "map/halvard_map_circus.webp", "event": "Traveling Circus", "hours": {"Thu": [17, 24], "Fri": [0, 24], "Sat": [0, 24], "Sun": [0, 24]}},
{"id": "bazaar", "file": "map/halvard_map_bazaar.webp", "event": "Academy Bazaar"},
{"id": "harvest", "file": "map/halvard_map_harvest.webp", "event": "Harvest Festival", "hours": {"Fri": [17, 24], "Sat": [0, 24], "Sun": [0, 24]}},
{"id": "graduation", "file": "map/halvard_map_graduation.webp", "event": "Graduation", "hours": {"Sun": [12, 24]}},
{"id": "spring", "file": "map/halvard_map_spring.webp", "season": "Spring"},
{"id": "autumn", "file": "map/halvard_map_autumn.webp", "season": "Autumn"},
{"id": "winter", "file": "map/halvard_map_winter.webp", "season": "Winter"}
```
Simpan hasil gambar di folder `Maps/` dengan nama file di atas. Setelah diunggah ke repo assets (folder `map/`) dan `base_url`
dipin ke commit itu, saya tambahkan baris-baris ini dan rebuild.
