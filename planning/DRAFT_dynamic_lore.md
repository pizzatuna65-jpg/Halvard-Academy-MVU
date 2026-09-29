# DRAFT — Lore dinamis: musim, fase kalender, waktu

Status: **DITERAPKAN di card 1.14.0 (2026-09-29)**, owner: "semua saya approve/setuju" (S1–S26, P1–P4, [?1]–[?4]). Catatan
implementasi: P3 memindahkan kalimat antrean pagi ujian dari teks Founder's Park ke baris fase; entry superstition Founder's Hand
(223) tidak diubah. Prompt map diperbarui di `planning/DRAFT_event_maps.md`. Owner (2026-09-29): entry lore dibuat season/time dependent seperti item musiman di Mall;
bukan lore breaking, cukup expand sedikit (contoh owner: "di musim salju jarang ada yang ke abandoned cabin" = Old Hut, lore 263).
Semua baris di bawah **menambah**; tidak ada kalimat canon yang dihapus atau dibalik. Teks card dalam bahasa Inggris.

## 1. Cara kerja (usulan)

- Setiap entry yang dipilih mendapat blok EJS di akhir teksnya (lewat `rep()` di `tools/merge_lorebooks.py`, pola cohort 1.7.0).
  Blok itu hanya mencetak **baris musim yang sedang berjalan**:
  ```
  <%_ { const _M = Number(getvar('stat_data.World.Month')) || 1; const _S = ['Spring','Spring','Spring','Summer','Summer','Summer','Autumn','Autumn','Autumn','Winter','Winter','Winter'][_M - 1]; _%>
  <%_ if (_S === 'Winter') { _%>
  Winter: snow drifts against the door ...
  <%_ } _%>
  <%_ } _%>
  ```
  Satu helper Python (`seasonal(uid, {...})`) menulis blok itu, jadi setiap entry cukup satu baris data.
- Musim diambil dari **bulan kalender** (tabel yang sama dengan engine 1.9.4: M1–3 Spring, M4–6 Summer, M7–9 Autumn, M10–12
  Winter). Jadi tetap jalan walaupun Weather Off (keputusan 1.9.7: dengan Weather Off, M1 tetap terasa spring).
- **Fase kalender** (ujian, libur panjang) memakai pola yang sama dengan `Month` + `Week`.
- **Token:** entry lokasi adalah keyword World Info, jadi baris musim ikut hanya saat entry itu aktif, dan hanya satu dari empat
  baris yang tercetak. Sekitar 20–35 token per entry yang aktif. Tidak ada biaya always-on.
- **Lorebook v39 standalone** (tanpa EJS) mendapat keempat baris sebagai teks biasa (`Seasons: Spring … Winter …`), seperti
  `[from Year N]` pada cohort.
- **UI:** kartu lokasi di Map bisa menampilkan baris musim yang sedang berjalan di bawah "vibe" (opsional, [?4]).
- Test baru: render EJS untuk tiap musim (tepat satu baris tercetak), v39 memuat keempatnya, UI tidak menampilkan kode EJS.

## 2. Baris musim per lokasi

Tanda `—` = tidak ada baris untuk musim itu (entry tetap seperti sekarang). Yang ditulis tebal adalah yang paling terasa.

### Alam dan lapangan

| # | Entry (uid) | Spring | Summer | Autumn | Winter |
|---|---|---|---|---|---|
| S1 | **Old Hut** (263) | — | — | — | **Hardly anyone climbs to the Old Hut in winter: snow drifts against the door, the path over the Hills disappears, and a secret told there in the cold is one someone went to real trouble for.** |
| S2 | Grassy Field and Hills (76) | Kites go up on every windy afternoon. | Long evenings on blankets until the eight o'clock bell. | The grass turns gold and the wind picks up. | **The slopes become sledding runs, on trays borrowed from the Canteen.** |
| S3 | Forest (77) | Foraging season opens: wild garlic and early greens at the edges. | The canopy closes and the Forest is at its darkest by day. | Mushrooms and nuts; Creature Studies warns about the ones that look alike. | **Dusk comes early, so the patrols turn students back from the treeline by late afternoon; tracks in the snow show what else walks there.** |
| S4 | Forest Clearing (254) | The flower field comes in weeks before anything else on campus. | — | — | (sudah ada sejak 1.13.2: tetap hijau dan berbunga di bawah salju) |
| S5 | **Boathouse and Lake** (78) | Rowing season opens once the water warms. | The lake is at its busiest: rowers, swimmers off the jetty, the Fishing Club at dawn. | Morning mist sits on the water until mid-morning. | **The boats are stored, ice forms along the shallows, and the boathouse lends a boat only on a still, mild day.** [?1] |
| S6 | Willow Island (269) | — | — | — | **The fireflies stay all winter, even over the ice, which Creature Studies cannot explain.** |
| S7 | Fishing House (268) | — | — | — | A stove burns in the hut, and the dawn regulars fish from the end of the dock through the mist. |
| S8 | Gardens (79) | Planting season: seedling rows under glass cloches. | Everything overgrows; the Gardening Club weeds daily. | The harvest comes in for the Harvest Festival. | **The beds sleep under straw and snow; the reagents grow on in the greenhouses, which glow warm through the dark afternoons.** |
| S9 | Menagerie (80) | Young ones are born and the handlers barely sleep. | — | — | The animals grow thick coats, the pens are strawed deep, and the smaller specimens sleep through the cold in heated boxes. |
| S10 | Groundskeeper's Lodge (85) | — | — | Groundskeeping rakes leaves from dawn. | Groundskeeping clears the paths of snow before the seven o'clock bell. |

### Lapangan olahraga

| # | Entry (uid) | Spring | Summer | Autumn | Winter |
|---|---|---|---|---|---|
| S11 | Sports Field (72) | — | — | — | Once the snow settles the field closes; the Soccer and Running Clubs move into the Gymnasium and onto the cleared paths. |
| S12 | **Swimming Pool** (74) | — | Crowded from the last class to the eight o'clock bell. | — | **The rune-warmed water steams in the cold; the Swimming Club trains through it and sprints the few steps to the Gymnasium.** |
| S13 | Gymnasium (73) | — | — | — | In winter it is shared by every club that normally trains outside, and booking slots are fought over. |

### Taman, halaman, atap

| # | Entry (uid) | Spring | Summer | Autumn | Winter |
|---|---|---|---|---|---|
| S14 | Founder's Park (47) | The first warm day fills every lawn. | Busiest of all: picnic blankets from lunch to dusk. | Leaf piles along the paths, and the benches move into the last sun. | **The benches stand empty, snowmen appear on the lawns overnight, and the exam-morning queue to the Founder's Hand stamps a path through the snow.** |
| S15 | Courtyards (71) | — | Students chase the shade around the stone. | — | Swept stone in the middle, snowball fights in the drifts at the edges. |
| S16 | Rooftop (255) | — | Every corner is taken at sunset. | — | The lead roofs ice over and even the couples stay away. |
| S17 | Observation Tower (81) | — | Short nights; the Divination Society waits for midnight. | — | Winter nights are the clearest and the coldest; the Divination Society works in coats and gloves. |

### Asrama dan ruang dalam

| # | Entry (uid) | Spring | Summer | Autumn | Winter |
|---|---|---|---|---|---|
| S18 | **Viridian Dormitory** (262) | The inner oak comes into new leaf. | Deep shade over the meditation stones. | The oak turns gold and leaves drift into the common area. | **Bare branches over the roofline; the meditation stones sit under snow.** |
| S19 | Light Dormitory (260) | — | The dome turns the common area into a greenhouse by afternoon. | — | Snow slides off the warm glass dome, which glows brighter against the early dark. |
| S20 | Fire Dormitory (259) | — | The hearth burns anyway, and the common room is the hottest place on campus. | — | The hearth is the envy of the other three dormitories. |
| S21 | Common Rooms (61) | — | Windows open, and the arguments carry outside. | — | Everyone crowds the heaters and the kettle never cools. |
| S22 | Bathhouse and Washrooms (64) | — | — | — | The most crowded room in each dorm after dinner. |
| S23 | Canteen (62) | Spring greens and new potatoes. | Cold soups, fruit, iced tea. | Stews and roast squash. | Porridge, thick broth and second helpings. |
| S24 | The Mall (66) | — | The Sunfizz counter queue reaches the door. | — | The warmest crowded place on campus; nobody hurries out. |
| S25 | Medical Centre (82) | — | Sunburn and sports injuries. | — | The winter cold that goes round campus fills its ward with head colds. |
| S26 | Meditation Rooms / Spirit House (87) | — | — | — | The bare vines let a little more light in, which somehow makes it worse. |

## 3. Fase kalender (hanya tercetak saat berlaku)

Isi yang sudah ada dipindah ke blok bersyarat supaya narator tidak memakai suasana "minggu ujian" sepanjang tahun. Tidak ada canon
baru; kalimatnya tetap sama.

| # | Entry (uid) | Kapan | Teks (yang sudah ada) |
|---|---|---|---|
| P1 | Main Library (56) | minggu ujian (M3, M5, M9, M11 W1) | "In exam weeks, Firetooth tins and Star Cookies cover the study tables." |
| P2 | Study Rooms (59) | 2 minggu sebelum ujian + minggu ujian | "impossible to reserve before exam weeks" jadi baris aktif: `Every slot is booked; fights over booking slots are at their worst.` |
| P3 | Founder's Statue (47) dan Founder's Hand (223) | pagi hari ujian | "a queue that snakes across the lawn on exam mornings" |
| P4 | Mail Tower (70) | minggu sebelum libur panjang (M5 W3, M11 W4) | baru: `Before the long breaks the sorting floor overflows with parcels going home.` |

## 4. Waktu (jam)

Hampir semua entry sudah punya kalimat malam atau subuh ("After dark nobody lingers", "the dock is busiest at dawn", "At night the
willow glows"). Menurut saya tidak perlu baris jam baru; pola EJS yang sama bisa dipakai nanti kalau ada kebutuhan. [?3]

## 5. Tambahan visual untuk prompt map

Kalau baris di atas disetujui, prompt di `planning/DRAFT_event_maps.md` ditambah supaya map sama dengan lore:
- **Winter:** kolam renang di samping Gymnasium **beruap**; greenhouse di Gardens **bercahaya hangat**; pohon ek di dalam Viridian
  Dormitory **gundul** dan tertutup salju; **manusia salju** di Founder's Park; **jejak luncur dan beberapa figur kecil berseluncur**
  di bukit; perahu ditarik ke darat di samping boathouse; **Old Hut tertutup salju tanpa jejak kaki**; kubah kaca Light Dormitory
  bersih dari salju dan bercahaya; willow di pulau tetap dikelilingi kunang-kunang.
- **Autumn:** pohon ek di dalam Viridian Dormitory **keemasan**; tumpukan daun di Founder's Park; orang memanen di Gardens.
- **Spring:** barisan bibit di bawah sungkup kaca di Gardens; **layang-layang** di atas bukit.
- **Summer (map default):** tidak perlu diubah.

## [?] Keputusan untuk owner

- **[?1]** Danau di musim dingin: perahu dipinjamkan hanya pada hari tenang dan tidak terlalu dingin (Willow Island jadi sulit
  dicapai). Atau cukup "boats stored, ice along the shallows" tanpa membatasi akses?
- **[?2]** Default map = Summer, dan yang dibuat adalah map Spring (dari percakapan sebelumnya). Setuju?
- **[?3]** Baris per jam: tidak dibuat sekarang (lihat §4)?
- **[?4]** Kartu lokasi di Map ikut menampilkan baris musim yang sedang berjalan?
- Setiap baris S1–S26 dan P1–P4 boleh ditolak satu per satu; sebut nomornya.
