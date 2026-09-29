# DRAFT — People → Connections: daftar lengkap dan kategori baru

Status: **menunggu konfirmasi pemangkasan kategori** (lihat "Pemangkasan kedua" di akhir), lalu diterapkan di v1.4.1. Catatan dalam Bahasa Indonesia; nama kategori dan teks kartu dalam Bahasa Inggris. Keputusan terbuka ditandai `[?]` di akhir.

## Kenapa banyak yang aneh

Connection antar-NPC dibuat otomatis (`tools/build_relations.py`) dari kalimat lore: setiap kalimat di file NPC A yang menyebut NPC B menjadi garis, dan jenisnya **ditebak dari kata kunci** di kalimat itu. Hasilnya:
- **Salah tebak:** Gavlan → Sophia jadi *romance* karena "...too many young people fall in **love** with war" (maksudnya: Gavlan waspada). Kuroo → Tilly jadi *family* karena menyebut "a miller's **daughter**". Saffi → Lenna jadi *dislike* karena kata "hates" (yang membenci Doves adalah Lenna, padahal mereka sahabat). Sophia → Rei jadi *dislike* karena kata "contempt", padahal Sophia paling menghormati Rei.
- **Terlalu banyak "acquainted":** 197 dari 278 garis tidak mengandung kata kunci apa pun, jadi jatuh ke *acquainted*, walau isinya jelas (mis. trio Sky outcast, Ottavio yang berdiri di gerbang Dovecote demi Idris).
- **Arah tertukar:** kalimat di file A sering menggambarkan perasaan B ("Caralynn is disgusted by that common cheat" ada di file Aiden).

## Usulan

1. **Setiap garis dikurasi manual** (tabel di bawah): jenisnya ditetapkan dari isi kalimat, bukan kata kunci. Disimpan di `data/relations_curated.json`; `build_relations.py` memakai kurasi ini dan **gagal build** kalau ada garis baru dari lore yang belum dikurasi, supaya NPC baru tidak diam-diam kembali ke tebakan.
2. **Acquainted dihapus.** Kalimat yang hanya fakta kecil ("hired after the breach", "barely remembers her", "her Dorm Head") tidak jadi garis.
3. **Kategori garis baru** (hubungan pribadi):

| Kategori | Arti | Contoh |
|---|---|---|
| Friends | teman, sahabat, kelompok dekat | trio Sky outcast; Layla & Yvette; Saffi & Lenna |
| Romance | hubungan romantis nyata | (belum ada di lore; dipakai untuk hubungan yang terbentuk di cerita) |
| Family | keluarga sungguhan | Florian & Elion |
| Rivals | persaingan, termasuk yang bersahabat | Gareth & Sophia; Vallie & Gavlan (adu panco) |
| Mentor | guru–murid, pembimbing, pembina klub | Kuroo → Mimosa; Gavlan → Gareth; Layla → Irene |
| Protective | menjaga, melindungi, peduli | Ottavio → Idris & Alyssa; Caspian → Aiden; Ruby → Alyssa |
| Fond | suka / senang (sering sepihak) | Althair → Ezrel; Kuroo → Percival; Tristan → Percival |
| Respect | hormat, kagum, percaya | Sophia → Rei; Florian → Caspian |
| Partners | kerja sama, bisnis, rekan kerja, satu tim | Aiden & Bobby (pesanan prank); Kuroo & Ottavio ("Boss"); Royhan & Vera |
| Wary | curiga, waspada, mengawasi | Gavlan → Sophia; Krieg → Alyssa (punya berkas); Yvette → Ezrel |
| Opposes | aktif melawan (politik, kekuasaan) | Baelin, Althair, Kuroo, Ottavio, Rei ↔ Krieg |
| Dislike | benci, jijik, tidak tahan | Sophia → Caralynn; Idris → Florian |
| Fear | takut | Irene → Rei & Sophia; Florian → Sophia; Mimosa → Ezrel |
| Uses | memanfaatkan, menjadikan sumber | Krieg → Milena; Castor → Ruby (sumber berita) |

4. **Kelompok (bukan garis antar-orang): Dorm, Club, Faction.** Kalau diaktifkan, muncul titik label kecil (mis. "Sky Dormitory", "Music Club", "Student Council") dengan garis tipis ke anggotanya yang sudah kamu temui, jadi grafik tidak jadi jaring laba-laba. Data diambil otomatis: dorm dari data NPC, club dari data klub (yang sama dengan panel Activities), faction dari daftar kecil yang dikurasi:
   - Student Council (Irene, Caspian), Dovecote (Krieg, Milena), Staff (semua guru dan staf), Cathedral (Tristan), Noble Houses' Liaison (Caine).
   - Faction rahasia (Morning Choir: Castor, Caine) **tidak** ditampilkan sampai rahasianya terbuka di cerita (`Secrets_revealed`).

5. **Tampilan:** chip filter untuk kategori garis (hanya yang ada), lalu chip terpisah untuk Dorm / Club / Faction (mati secara default). Aturan visibilitas tetap: Mentor dan Family bersifat umum (terlihat kalau kedua orang sudah kamu temui), yang lain terbuka di bond Rank 5–6 dengan orang itu, yang rahasia hanya setelah terungkap.

## Ringkasan

- Garis dinilai: 278 (garis milik tim akademi rival tidak ditampilkan di grafik, jadi tidak ikut: 34).
- Sebelum: acquainted 197, rival 16, dislike 15, fear 12, mentor 11, family 9, respect 9, friend 8, romance 1.
- Usulan: drop 42, fond 39, wary 38, friends 38, protective 21, dislike 18, rivals 17, partners 16, respect 14, mentor 12, opposes 10, fear 8, uses 4, family 1.
- Tanda ✎ = jenisnya berubah dari yang sekarang.

## Daftar lengkap per NPC

Satu baris = satu kalimat di file NPC itu yang menyebut orang lain (arahnya: file siapa, bukan selalu perasaan siapa). Kolom *Terlihat* = kapan garis itu terbuka untuk pemain.

### Aiden

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Althair | acquainted | **fond** ✎ | Rank 5 | Vice Headmaster Althair Veyne knows all about the betting book and declines to act on it, because it entertains him. |
| Bobby | acquainted | **partners** ✎ | Rank 5 | Brings Bobby Becket, the maintenance man students call BB, his most ambitious prank commissions; Bobby enjoys the challenge and charges accordingly. |
| Caralynn | dislike | **dislike** | Rank 6 | Caralynn Veyturone is disgusted by "that common cheat". |
| Caspian | friend | **protective** ✎ | Rank 6 | Caspian Riwalo quietly covers for him. |
| Dante | acquainted | **— (dihapus)** | Rank 5 | Dante Kleinn knows about the betting book and has decided, for now, that it harms no one. |
| Ezrel | acquainted | **— (dihapus)** | Rank 5 | Slips out of the Light Dormitory past his Dorm Head Ezrel Marionne's door most nights and has never been stopped; he suspects a trap, and it is not on… |
| Irene | rival | **rivals** ✎ | Rank 6 | Irene Chanare is his nemesis; she is always one step from catching him and never has. |
| Kuroo | acquainted | **fond** ✎ | Rank 6 | Kuroo finds him hilarious and considers him the best student in the Card Club. |
| Sophia | acquainted | **partners** ✎ | Rank 6 | Books every one of Sophia Helfin's duels; she tolerates him because he always pays out on time. |

### Althair

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Aiden | acquainted | **fond** ✎ | Rank 6 | He knows about Aiden Ruzzo's betting book and declines to act, because it entertains him. |
| Baelin | acquainted | **partners** ✎ | Rank 5 | Baelin Kalvor knows exactly what he is doing and allows it, because Althair handles what Baelin cannot and the academy runs well; Baelin files every f… |
| Bobby | acquainted | **fond** ✎ | Rank 5 | Knows exactly what Bobby Becket does after hours and considers it the healthiest institution on campus. |
| Ezrel | acquainted | **fond** ✎ | Rank 5 | Ezrel Marionne's non-reactions. |
| Irene | acquainted | **fond** ✎ | Rank 6 | He praises Irene Chanare sincerely and she is never comfortable after. |
| Krieg | acquainted | **opposes** ✎ | Rank 6 | Krieg Valforth is untouchable except through official letters to the capital, and Althair writes them. |
| Kuroo | acquainted | **rivals** ✎ | Rank 6 | Kuroo recognizes a fellow manipulator doing it better and is irritated. |
| Rei | acquainted | **fond** ✎ | Rank 5 | Make Rei want something. |

### Alyssa

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Kanae | acquainted | **wary** ✎ | Rank 6 | Kanae Quveno keeps her distance. |
| Milena | acquainted | **protective** ✎ | Rank 6 | Milena Sagona is sent to check on her more than any other student; Alyssa never remembers her, and is always glad to meet her. |
| Ottavio | acquainted | **protective** ✎ | rahasia | Her Dorm Head, Ottavio Bastiani, makes the Dovecote go through him to reach her, and lets only Milena past. |
| Ruby | acquainted | **protective** ✎ | Rank 6 | Ruby Bonbon noticed the pattern before anyone and quietly helps keep the notebook right. |
| Zara | friend | **friends** ✎ | Rank 5 | Zara Minallone, in her dorm and year, reintroduces herself every week without complaint, and Alyssa is the one person who has never once remarked on Z… |

### Baelin

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Althair | acquainted | **partners** ✎ | Rank 5 | Knows exactly what his Vice Headmaster Althair Veyne is doing and allows it, because Althair handles what he cannot and the academy runs well; he file… |
| Etnie | acquainted | **protective** ✎ | Rank 5 | Generous with Etnie (let her repeat a year, since one recovered student is worth more than one expelled). |
| Ezrel | acquainted | **— (dihapus)** | Rank 6 | Inherited Ezrel Marionne with the academy: the Light Dorm Head was already there, unchanged, when Baelin arrived forty years ago. |
| Gavlan | family | **friends** ✎ | public | His great-grandfather fought beside Gavlan Haverton in the War of Independence; family stories of "the old soldier in the woods" are how Baelin knew w… |
| Irene | fear | **protective** ✎ | Rank 6 | Sees a future staff member in Irene Chanare but quietly fears she will break. |
| Krieg | dislike | **opposes** ✎ | Rank 5 | Krieg Valforth, though he will never say so. |
| Kuroo | mentor | **— (dihapus)** | public | Assigned Kuroo to mentor the young Potion Crafting teacher, Mimosa. |
| Milena | acquainted | **partners** ✎ | Rank 6 | Treats Milena Sagona as an unofficial channel for restraining Krieg. |
| Mimosa | mentor | **— (dihapus)** | public | Assigned Kuroo to mentor the young Potion Crafting teacher, Mimosa. |
| Ottavio | acquainted | **— (dihapus)** | Rank 6 | Hired Vallie Goredust and Ottavio Bastiani after the breach. |
| Rei | acquainted | **respect** ✎ | Rank 5 | Keep the crown from replacing Rei with someone easier to control and worse at the job. |
| Tristan | acquainted | **wary** ✎ | Rank 5 | Takes tea with Tristan, the Cathedral steward, and the two quietly measure each other every time. |
| Vallie | acquainted | **— (dihapus)** | Rank 6 | Hired Vallie Goredust and Ottavio Bastiani after the breach. |
| Yvette | acquainted | **partners** ✎ | Rank 5 | Unyielding with Yvette Fallaron: after the breach several teachers resigned, and her Oath is one of the few things holding Halvard's staff together. |

### Bobby

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Aiden | acquainted | **partners** ✎ | Rank 6 | Aiden Ruzzo brings ambitious prank commissions; Bobby enjoys the challenge and charges accordingly. |
| Althair | acquainted | **fond** ✎ | Rank 6 | Althair Veyne knows exactly what he does after hours and considers it the healthiest institution on campus. |
| Ezrel | acquainted | **fond** ✎ | Rank 6 | Ezrel Marionne watches his hands with the full attention he otherwise saves for golems and says flatly where the card went; Bobby counts him as the au… |
| Irene | acquainted | **wary** ✎ | Rank 6 | Irene Chanare is certain he is behind half of Aiden's pranks and has never found proof. |
| Kuroo | acquainted | **rivals** ✎ | Rank 6 | Kuroo Varnell will not play cards against him, and Bobby will not play against Kuroo; each assumes the other cheats. |
| Layla | acquainted | **friends** ✎ | Rank 6 | Layla Palegleam trades gossip with him over Canteen lunches and never asks where his comes from. |
| Tilly | acquainted | **— (dihapus)** | Rank 6 | Tilly Marsh's Halvard Unexplained has a page on BB, filed under "confirmed, mostly". |
| Trixie | acquainted | **fond** ✎ | Rank 6 | Trixie Confetti eagerly volunteers for tricks and keeps suggesting real magical effects, prompting arguments about the point of the exercise. |
| Vera | acquainted | **fond** ✎ | Rank 6 | Vera Pulsar tries to understand his mechanical props, sometimes before he has finished performing. |

### Caine

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Caralynn | acquainted | **dislike** ✎ | Rank 6 | Caralynn Veyturone treats him as furniture. |
| Caspian | dislike | **dislike** | Rank 6 | Caspian Riwalo is the only one who thanks him by name, and the one he hates most. |
| Florian | family | **wary** ✎ | public | Florian Villeneuve's tea he pours in a room where nobody mentions Florian's brother, and he watches Florian notice the silence. |
| Kuroo | acquainted | **wary** ✎ | Rank 5 | Kuroo Varnell, still on good terms with the Liaison's staff, calls him the one servant there who never gossips, and has learned nothing from him since… |

### Caralynn

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Aiden | family | **dislike** ✎ | public | Aiden Ruzzo, whom she considers a common cheat, knows exactly who her father is. |
| Kanae | acquainted | **dislike** ✎ | Rank 6 | Suspects Kanae Quveno's romance readings are fake and says so openly, unaware how dangerous that is. |
| Lenna | acquainted | **dislike** ✎ | Rank 6 | Thinks Lenna Greenwind's popularity is vulgar and undeserved. |
| Ruby | rival | **rivals** ✎ | Rank 5 | Ruby Bonbon plays guitar behind her in the Music Club and is perfectly happy back there, which Caralynn finds infuriating: she cannot provoke her, can… |
| Sophia | dislike | **dislike** | Rank 5 | Sophia Helfin, her own dorm-mate, despises her as a weak self-serving noble and makes a daily target of her. |

### Caspian

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Aiden | friend | **protective** ✎ | Rank 6 | Quietly covers for first-year troublemaker Aiden Ruzzo too. |
| Caine | acquainted | **— (dihapus)** | Rank 5 | Thanks the Liaison's butler, Caine Strix, by name on every visit, as he thanks every servant; Caine bows exactly as deep as protocol requires. |
| Florian | acquainted | **partners** ✎ | Rank 5 | Manages Florian Villeneuve the way he manages a difficult noble parent, and it works. |
| Irene | friend | **partners** ✎ | Rank 6 | Irene Chanare, his President: stiff and too rigid, but he covers for her. |
| Krieg | dislike | **dislike** | Rank 5 | Cruelty dressed up as procedure; Krieg Valforth's methods above all. |
| Ruby | acquainted | **friends** ✎ | Rank 5 | Trades notes with Ruby Bonbon, the third-year everyone tells things to, and has never worked out why she asks nothing in return. |
| Tristan | acquainted | **fond** ✎ | Rank 5 | Tristan, the Cathedral steward, counts him as his most devout student attendee. |

### Castor

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Gareth | rival | **— (dihapus)** | Rank 6 | He can tell you Gareth Valkaryn's competition record, which club Trixie Confetti disrupted this week, what Sophia Helfin said after her last duel. |
| Ruby | acquainted | **uses** ✎ | Rank 6 | Ruby Bonbon is his best source, glad to help, and has never wondered why he asks. |
| Sophia | rival | **— (dihapus)** | Rank 6 | He can tell you Gareth Valkaryn's competition record, which club Trixie Confetti disrupted this week, what Sophia Helfin said after her last duel. |
| Trixie | rival | **— (dihapus)** | Rank 6 | He can tell you Gareth Valkaryn's competition record, which club Trixie Confetti disrupted this week, what Sophia Helfin said after her last duel. |

### Dante

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Aiden | acquainted | **— (dihapus)** | Rank 6 | He knows about Aiden Ruzzo's betting book and lets it go. |
| Idris | acquainted | **wary** ✎ | Rank 6 | He has never let himself think about who burned Idris. |
| Irene | respect | **respect** | Rank 6 | Irene Chanare respects him. |
| Percival | acquainted | **fond** ✎ | Rank 6 | Percival Applethorne is warm to him for no reason. |

### Etnie

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Baelin | acquainted | **protective** ✎ | Rank 7 | Headmaster Baelin Kalvor let her repeat her second year rather than expel her. |
| Caspian | acquainted | **protective** ✎ | Rank 6 | Caspian Riwalo, her dorm-mate, keeps an eye on her the way he keeps an eye on everyone, and she tolerates it because he is nice to {{user}}. |
| Kuroo | acquainted | **mentor** ✎ | Rank 6 | Her Dorm Head, Kuroo Varnell, worked out that {{user}} is the only button she has, and has started pushing it to get her into class. |
| Ruby | acquainted | **— (dihapus)** | Rank 6 | Went to Ruby Bonbon first when she wanted to know everything about {{user}}. |

### Ezrel

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Aiden | acquainted | **— (dihapus)** | Rank 5 | Aiden Ruzzo slips out of the Light Dormitory past his door most nights and has never been stopped; Ezrel has simply never looked. |
| Althair | acquainted | **fond** ✎ | Rank 6 | Althair Veyne adores him and has never once got a real reaction out of him, which Althair considers the best game on campus; Ezrel does not think abou… |
| Baelin | acquainted | **— (dihapus)** | Rank 5 | Baelin Kalvor inherited him with the academy forty years ago and has never once had to manage him, which is not the same as knowing him. |
| Bobby | acquainted | **fond** ✎ | Rank 5 | Watches Bobby Becket's card tricks with the full attention he otherwise saves for golems, and says flatly where the card went. |
| Gavlan | acquainted | **wary** ✎ | Rank 6 | Gavlan Haverton's sense for magic has always told him something about Ezrel is wrong; he puts it down to the golems, always running somewhere, and has… |
| Irene | acquainted | **wary** ✎ | Rank 6 | Irene Chanare once asked him whether he cared about his students; he said no, then helped her carry the exam papers, and she has avoided being alone w… |
| Krieg | acquainted | **wary** ✎ | Rank 6 | With Krieg alone he does not bother performing: courteous, brief, and always a step out of reach. |
| Kuroo | acquainted | **wary** ✎ | Rank 5 | Rei and Kuroo recall him from their own first year looking exactly as he does now. |
| Layla | acquainted | **wary** ✎ | Rank 5 | Layla Palegleam has found his name in every staff roll back to the founding and cannot decide whether his answer was a joke. |
| Mimosa | acquainted | **fear** ✎ | Rank 6 | Rei Kestrane and Mimosa Linden both lived in his dorm as students: Rei watches him the way she watches the Seal Chamber door, and Mimosa still cannot … |
| Rei | acquainted | **wary** ✎ | Rank 5 | Rei and Kuroo recall him from their own first year looking exactly as he does now. |
| Tilly | acquainted | **wary** ✎ | Rank 5 | Tilly Marsh sits in his second-year class with a page on him in her journal. |
| Trixie | acquainted | **fond** ✎ | Rank 6 | Trixie Confetti thinks his flat asides are a comedy bit and is the only student who laughs at them; he lets her boss his golems around the Theatre Tro… |
| Yvette | acquainted | **wary** ✎ | Rank 5 | Yvette Fallaron, Fire Dorm Head, shares Magic Theory with him, taking the first-years while he keeps the second; she sat in his lectures as a student … |

### Florian

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Caine | acquainted | **— (dihapus)** | Rank 5 | Caine Strix, the Liaison's butler, pours his tea on every visit; Florian has never once looked at his face. |
| Caspian | respect | **respect** | Rank 6 | Caspian Riwalo handles him diplomatically and is one of the few people he will actually listen to. |
| Elion | family | **family** | public | His younger brother Elion is at Ashvale and is better than him at everything, without effort and without malice, and Florian cannot manage to hate him… |
| Gareth | respect | **rivals** ✎ | Rank 5 | Beat Gareth Valkaryn in front of everyone. |
| Idris | dislike | **dislike** | Rank 6 | Idris Ainsworth shares his year and his dorm and despises him. |
| Ottavio | acquainted | **— (dihapus)** | Rank 5 | Brags at Loki, Ottavio Bastiani's spirit, across the Sky common room most evenings; Loki usually wins. |
| Sophia | fear | **fear** | Rank 6 | He gives Sophia Helfin a wide berth and will not be drawn on why; she is more than he has any intention of handling. |
| Tilly | acquainted | **respect** ✎ | Rank 5 | Treats Tilly Marsh as an equal without knowing why; she is the one person whose manners make him sit up straighter. |

### Gareth

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Florian | acquainted | **rivals** ✎ | Rank 5 | Florian Villeneuve challenges him constantly; Gareth accepts every time and has never once gloated, which Florian finds worse. |
| Gavlan | mentor | **mentor** | public | Gavlan Haverton considers him the most gifted student he has taught in twenty years. |
| Ruby | rival | **respect** ✎ | Rank 5 | Has asked Ruby Bonbon to join a competition team, very politely, and been refused; he took it gracefully and has not stopped thinking about it. |
| Sophia | rival | **rivals** ✎ | Rank 5 | He has beaten Sophia Helfin in the Fire Dorm Competition final two years running. |

### Gavlan

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Baelin | family | **friends** ✎ | public | Headmaster Baelin Kalvor, an elf and great-grandson of an elven wartime comrade, asked him to teach; he saw a way to atone and quiet the nightmares. |
| Ezrel | acquainted | **wary** ✎ | Rank 5 | His sense for magic has always told him something about Ezrel Marionne is wrong. |
| Gareth | mentor | **mentor** | public | Considers Gareth Valkaryn, whom he taught as a first-year two years ago, the most gifted student he has taught in two decades, and cannot decide wheth… |
| Royhan | acquainted | **friends** ✎ | Rank 5 | Plays quiet Dragonchess with Royhan more than he admits. |
| Sophia | romance | **wary** ✎ | Rank 6 | Wary of Sophia Helfin: he has seen too many young people fall in love with war. |
| Vallie | rival | **rivals** ✎ | Rank 6 | Vallie Goredust is his arm-wrestling rival and drinking partner for his firewine stash; she calls him "Grandpa". |

### Idris

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Dante | acquainted | **wary** ✎ | Rank 5 | Dante Kleinn, a fellow second-year, has never let himself think about who left the burn on Idris's ribs. |
| Florian | acquainted | **dislike** ✎ | Rank 5 | Shares a year and a dorm with Florian Villeneuve and cannot stand him. |
| Krieg | acquainted | **dislike** ✎ | Rank 7 | He came back with the burn on his ribs, left by Krieg Valforth. |
| Ottavio | acquainted | **protective** ✎ | Rank 5 | Ottavio Bastiani, his Dorm Head, stood at the Dovecote gate every day of his week inside, and still walks over whenever the Doves come to "check" on h… |
| Percival | fear | **fond** ✎ | Rank 5 | Percival Applethorne, a cheerful first-year, relentlessly tries to induct him into his Brotherhood as "Sir Idris the Unsmiling" and is the only studen… |
| Royhan | acquainted | **friends** ✎ | Rank 6 | Part of the Sky outcast trio with Royhan and Zara. |
| Ruby | acquainted | **friends** ✎ | Rank 5 | Ruby Bonbon is the warm centre the Sky outcasts orbit, and the only person in the dorm who is friendly to the Doves, which he finds hard to forgive an… |
| Zara | acquainted | **friends** ✎ | Rank 6 | Part of the Sky outcast trio with Royhan and Zara. |

### Irene

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Aiden | rival | **rivals** ✎ | Rank 5 | Aiden Ruzzo is her nemesis; she is certain he breaks curfew and has never once caught him. |
| Althair | acquainted | **wary** ✎ | Rank 5 | Vice Headmaster Althair Veyne praises her work sincerely and she is never comfortable afterwards. |
| Bobby | acquainted | **wary** ✎ | Rank 5 | Is certain the maintenance man Bobby Becket is behind half of Aiden Ruzzo's pranks, and has never found proof. |
| Caspian | dislike | **partners** ✎ | Rank 5 | Caspian Riwalo, her Vice President from the Viridian Dormitory: elected, not chosen by her; his rule-bending grates on her. |
| Dante | respect | **respect** | Rank 5 | Respects Dante Kleinn, a second-year in her dorm, and is quietly relieved that someone else cares about the rules too. |
| Ezrel | acquainted | **wary** ✎ | Rank 5 | Her own Dorm Head, Ezrel Marionne, once told her plainly that he did not care about his students, then helped her carry the exam papers. |
| Lenna | acquainted | **— (dihapus)** | Rank 6 | Has rejected nearly as many suitors as Lenna Greenwind. |
| Rei | fear | **fear** | Rank 6 | Fears the Acting Warden, Rei, almost as much as the Doves. |
| Sophia | fear | **fear** | Rank 6 | Sophia Helfin, a fellow third-year, thrived on the breach night while Irene froze; Irene fears her, and Sophia looks down on her. |
| Tilly | acquainted | **— (dihapus)** | Rank 5 | Keeps finding Library shelves rearranged into Tilly Marsh's "evidence piles". |

### Kanae

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Alyssa | acquainted | **wary** ✎ | Rank 6 | Keeps Alyssa Edelweiss at a polite distance. |
| Caralynn | acquainted | **dislike** ✎ | Rank 5 | Caralynn Veyturone, who calls her readings fake. |
| Dante | acquainted | **— (dihapus)** | Rank 6 | Dante Kleinn is a second-year in her dorm she considers pleasant and dull. |
| Ezrel | acquainted | **— (dihapus)** | Rank 6 | Ezrel Marionne is her Dorm Head. |

### Krieg

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Althair | acquainted | **opposes** ✎ | Rank 5 | When a fight would cost more than it wins (the Warden's office, a Dorm Head, the Vice Headmaster's letters), he smiles, withdraws in perfect order, an… |
| Alyssa | acquainted | **wary** ✎ | Rank 5 | Keeps a file on Alyssa Edelweiss: a first-year with a Spirit Lord is either a future Dove or a future catastrophe. |
| Baelin | acquainted | **opposes** ✎ | Rank 5 | Answers to the crown; outranked on campus by no one, and the Headmaster has no authority over him. |
| Ezrel | respect | **wary** ✎ | Rank 5 | Has had Ezrel Marionne's human-shaped golems inspected for Puppetry more than once and found nothing. |
| Idris | acquainted | **dislike** ✎ | Rank 7 | Held Idris Ainsworth for a week last year and left the burn on his ribs. |
| Milena | acquainted | **uses** ✎ | Rank 6 | Milena Sagona, his second: undermines him, naively tries to befriend mages, but undeniably capable. |
| Ottavio | acquainted | **opposes** ✎ | Rank 5 | Ottavio Bastiani, the Sky Dorm Head, is the one man at Halvard he cannot stare down, and the one who will not be polite to him. |
| Rei | dislike | **opposes** ✎ | Rank 5 | Has no authority over the sealed site and hates Rei, the Acting Warden, for it. |
| Sophia | acquainted | **wary** ✎ | Rank 5 | Wants very much to take Sophia Helfin apart and learn what the breach creature's blood did to her. |

### Kuroo

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Aiden | acquainted | **fond** ✎ | Rank 5 | Finds Aiden Ruzzo hilarious and considers him the best student in the Card Club. |
| Althair | acquainted | **rivals** ✎ | Rank 5 | Being out-played by Althair Veyne. |
| Baelin | mentor | **— (dihapus)** | public | Assigned by Headmaster Baelin to mentor Mimosa; before she walks into a class, he quietly links with her and absorbs her anxiety, then spends the next… |
| Bobby | acquainted | **rivals** ✎ | Rank 5 | Will not play cards against Bobby Becket, the maintenance man; each assumes the other cheats. |
| Caine | acquainted | **wary** ✎ | Rank 5 | Calls Caine Strix, the Liaison's young owl-Beastkin butler, the one servant there who never gossips; has learned nothing from him since he arrived. |
| Caralynn | acquainted | **mentor** ✎ | Rank 6 | Tames Caralynn Veyturone with flattery. |
| Ezrel | acquainted | **wary** ✎ | Rank 5 | Has never found a single button to push on Ezrel Marionne, who looks exactly as he did when Kuroo was a first-year; it bothers him more than he admits… |
| Krieg | acquainted | **opposes** ✎ | Rank 5 | Needling Krieg Valforth. |
| Mimosa | mentor | **mentor** | public | Get Mimosa Linden standing on her own before his mentorship ends. |
| Ottavio | mentor | **partners** ✎ | public | Calls Ottavio Bastiani, the Sky Dorm Head who teaches third-year Etiquette, "Boss", half as a joke; between them they hold the first and last year of … |
| Percival | acquainted | **fond** ✎ | Rank 6 | Despairs of Percival Applethorne but secretly likes him. |
| Rei | acquainted | **friends** ✎ | Rank 5 | A Halvard alumnus (Viridian Dormitory), same year as Rei. |
| Saffi | acquainted | **— (dihapus)** | Rank 6 | Saffi Tamberlane slept through his class all last year. |
| Sophia | dislike | **dislike** | Rank 6 | Provokes Sophia Helfin on purpose, since she hates nobles. |
| Tilly | family | **wary** ✎ | public | Tilly Marsh's etiquette is court-perfect, which a miller's daughter's should not be; he has noticed, and says nothing, for now. |

### Layla

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Bobby | acquainted | **friends** ✎ | Rank 5 | Campus gossip with Bobby Becket. |
| Ezrel | acquainted | **wary** ✎ | Rank 5 | Has found the name Ezrel Marionne, Light Dorm Head, in every staff roll the Archive holds, back to the founding. |
| Gavlan | acquainted | **respect** ✎ | Rank 5 | Get Gavlan's interview about the war before one of them runs out of time. |
| Irene | mentor | **mentor** | public | Irene Chanare is her most diligent Library Assistant, and Layla taught her how to organize archives. |
| Krieg | acquainted | **dislike** ✎ | Rank 6 | As a historian she is romantic about the order's founding legends; Krieg Valforth disappoints her but hasn't shaken it. |
| Tilly | acquainted | **fond** ✎ | Rank 5 | Tilly Marsh argues her wildest theories in office hours; Layla enjoys it enormously. |
| Vera | acquainted | **fond** ✎ | Rank 5 | Adores Vera Pulsar in class and despairs of her margins, which are full of counter-arguments. |
| Yvette | friend | **friends** ✎ | Rank 5 | In the same year as Yvette Fallaron at Halvard; best friends ever since. |
| Zara | acquainted | **fond** ✎ | Rank 6 | Often notices Zara Minallone on the library's top shelves and quietly leaves books up there for her. |

### Lenna

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Caralynn | dislike | **dislike** | Rank 6 | Caralynn Veyturone quietly despises her popularity. |
| Saffi | respect | **friends** ✎ | Rank 6 | Best friend Saffi Tamberlane, who admires the Doves; it is the one sore spot between them. |
| Tilly | acquainted | **protective** ✎ | Rank 5 | Tilly Marsh, in her year and dorm, keeps getting into danger; Lenna keeps hauling her out, complaining the whole way, and has never once refused. |

### Milena

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Alyssa | respect | **protective** ✎ | Rank 5 | Sent to Alyssa Edelweiss more than any other student. |
| Ezrel | acquainted | **fond** ✎ | Rank 5 | Has inspected Ezrel Marionne's golems for the Dovecote and finds his flat stage directions quietly funny. |
| Idris | acquainted | **dislike** ✎ | Rank 5 | Idris Ainsworth will not stay in a room with her; she has never apologised for the burn, because it was not hers to apologise for, and it bothers her … |
| Krieg | acquainted | **uses** ✎ | Rank 5 | Krieg Valforth's second. |
| Ottavio | acquainted | **friends** ✎ | Rank 5 | Ottavio Bastiani is Salaffian like her; they talk dock dialect when no one is listening. |
| Royhan | family | **friends** ✎ | public | Dragonchess, learned from her father; she secretly plays Royhan Filanoman. |
| Ruby | acquainted | **fond** ✎ | Rank 5 | Ruby Bonbon's warmth moves her. |
| Saffi | acquainted | **fond** ✎ | Rank 5 | Saffi Tamberlane challenges her to spar at every chance; she refuses on duty and is secretly delighted. |
| Sophia | acquainted | **wary** ✎ | Rank 5 | Cannot decide whether Sophia Helfin is victim or threat. |
| Vallie | acquainted | **fond** ✎ | Rank 6 | Vallie Goredust teases her about wanting to spar. |

### Mimosa

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Caspian | acquainted | **— (dihapus)** | Rank 7 | Current third-years (Irene, Caspian, Royhan, Sophia) were in school with her and barely remember her. |
| Ezrel | acquainted | **fear** ✎ | Rank 5 | Ezrel Marionne's gaze. |
| Irene | acquainted | **— (dihapus)** | Rank 7 | Current third-years (Irene, Caspian, Royhan, Sophia) were in school with her and barely remember her. |
| Kuroo | mentor | **mentor** | public | Occasionally tries to socialize by imitating how others talk (Vallie's swearing, Kuroo's smirking lines), and it fails spectacularly. |
| Royhan | acquainted | **fond** ✎ | Rank 5 | Current third-years (Irene, Caspian, Royhan, Sophia) were in school with her and barely remember her. |
| Sophia | acquainted | **— (dihapus)** | Rank 7 | Current third-years (Irene, Caspian, Royhan, Sophia) were in school with her and barely remember her. |
| Vallie | acquainted | **— (dihapus)** | Rank 5 | Occasionally tries to socialize by imitating how others talk (Vallie's swearing, Kuroo's smirking lines), and it fails spectacularly. |

### Ottavio

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Alyssa | acquainted | **protective** ✎ | Rank 6 | When the Dovecote wants Alyssa Edelweiss it goes through him, and Milena is the only Dove he lets past. |
| Baelin | acquainted | **respect** ✎ | Rank 5 | Came back two years ago, after the breach, when the old Sky Dorm Head resigned and Baelin Kalvor went looking for someone who would stand in front of … |
| Florian | acquainted | **— (dihapus)** | Rank 6 | Loki and Florian Villeneuve brag at each other across the common room most evenings; Loki usually wins. |
| Idris | acquainted | **protective** ✎ | Rank 6 | Idris Ainsworth was held in the Dovecote for a week last year; Ottavio stood at its gate every day of that week until Idris walked out, and he still w… |
| Krieg | acquainted | **opposes** ✎ | Rank 6 | Krieg Valforth is the one man at Halvard Ottavio will not be polite to, and the one man Krieg cannot stare down. |
| Kuroo | mentor | **partners** ✎ | public | Kuroo Varnell teaches first-year Etiquette and calls him "Boss", half as a joke; between them they hold the first and last year of the subject and tra… |
| Milena | respect | **friends** ✎ | Rank 6 | Milena Sagona is Salaffian like him; they talk in dock dialect when no one is listening, and he likes her and does not trust the cloak. |
| Percival | family | **— (dihapus)** | public | Percival Applethorne has identified Loki as the dragon he wrestled in the family orchards, and Loki has not recovered from the accusation. |
| Ruby | acquainted | **protective** ✎ | Rank 6 | Ruby Bonbon's warmth toward the Doves baffles him, and he protects it anyway. |

### Percival

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Dante | acquainted | **fond** ✎ | Rank 5 | Is warm to Dante Kleinn for no particular reason, and has named him "Sir Dante the Steadfast", which Dante does not know how to handle. |
| Idris | acquainted | **fond** ✎ | Rank 6 | Relentlessly tries to induct Idris Ainsworth into the Brotherhood as "Sir Idris the Unsmiling". |
| Ottavio | family | **— (dihapus)** | public | Has identified Loki, the Sky Dorm Head's little green dragon spirit, as the dragon he wrestled in the family orchards; Loki has not recovered from the… |
| Saffi | acquainted | **friends** ✎ | Rank 6 | Knighted Saffi Tamberlane "Dame Saffi the Unstoppable" with a baguette; she accepted on the spot. |
| Tilly | acquainted | **friends** ✎ | Rank 5 | Tilly Marsh tells him ghost stories; he remembers encountering every one of them personally. |
| Tristan | acquainted | **fond** ✎ | Rank 5 | Tristan, the Cathedral steward, has given up waking him during sermons and finds the whole thing delightful. |

### Rei

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Althair | acquainted | **— (dihapus)** | Rank 5 | The only person immune to Vice Headmaster Althair Veyne, because she wants nothing from him. |
| Baelin | acquainted | **— (dihapus)** | Rank 5 | Headmaster Baelin Kalvor has long since stopped trying to control her. |
| Ezrel | acquainted | **wary** ✎ | Rank 5 | Ezrel Marionne was her Dorm Head in the Light Dormitory and looks exactly as he did in her first year. |
| Irene | fear | **fear** | Rank 6 | Irene Chanare fears her. |
| Krieg | dislike | **opposes** ✎ | Rank 6 | Krieg Valforth has no authority over the site and hates her; she doesn't care about him at all. |
| Kuroo | acquainted | **friends** ✎ | Rank 5 | A Halvard alumna (Light Dormitory), same year as Kuroo. |
| Sophia | respect | **respect** | Rank 6 | Sophia Helfin fought beside the old Warden that night and respects Rei above everyone at Halvard; Rei has never mentioned that night to her. |
| Vallie | acquainted | **fond** ✎ | Rank 6 | Accepts only Blackroot cigars from Vallie Goredust, never her drinks. |

### Royhan

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Idris | acquainted | **friends** ✎ | Rank 5 | Looks out for Idris and Zara, the other Sky outcasts; the three gather in the Gardens. |
| Milena | dislike | **friends** ✎ | Rank 5 | Dragonchess (secretly plays against Senior Dove Milena Sagona). |
| Mimosa | mentor | **mentor** | public | Alchemy Circle (advised by Mimosa). |
| Ruby | acquainted | **friends** ✎ | Rank 5 | Ruby Bonbon, a fellow third-year in Sky, is the reason he, Idris, and Zara found each other. |
| Vera | acquainted | **partners** ✎ | Rank 5 | Trades notes and reagents with Vera Pulsar, a first-year who brews to see what happens rather than to heal anyone. |
| Zara | acquainted | **friends** ✎ | Rank 5 | Looks out for Idris and Zara, the other Sky outcasts; the three gather in the Gardens. |

### Ruby

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Alyssa | acquainted | **protective** ✎ | Rank 5 | Noticed before anyone that Alyssa Edelweiss forgets people, and quietly helps her keep her notebook right. |
| Caralynn | acquainted | **rivals** ✎ | Rank 5 | Music Club, where she plays guitar and is perfectly happy to stay at the back behind Caralynn Veyturone. |
| Caspian | acquainted | **friends** ✎ | Rank 5 | Caspian Riwalo trades notes with her and cannot see why she asks nothing back. |
| Castor | acquainted | **uses** ✎ | Rank 6 | Castor Moretti interviews her often for the paper and she has never wondered why. |
| Etnie | acquainted | **— (dihapus)** | Rank 6 | Etnie came to her first to ask about {{user}}. |
| Gareth | acquainted | **respect** ✎ | Rank 6 | Sophia Helfin and Gareth Valkaryn both ask her onto a team every year and are refused. |
| Idris | acquainted | **friends** ✎ | Rank 5 | See Zara, Idris and Royhan settled enough to keep each other after she graduates. |
| Ottavio | acquainted | **protective** ✎ | Rank 5 | Her Dorm Head, Ottavio Bastiani, is baffled by her warmth toward the Doves and protects it anyway. |
| Royhan | acquainted | **friends** ✎ | Rank 5 | See Zara, Idris and Royhan settled enough to keep each other after she graduates. |
| Sophia | acquainted | **respect** ✎ | Rank 6 | Sophia Helfin and Gareth Valkaryn both ask her onto a team every year and are refused. |
| Zara | acquainted | **friends** ✎ | Rank 5 | See Zara, Idris and Royhan settled enough to keep each other after she graduates. |

### Saffi

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Lenna | dislike | **friends** ✎ | Rank 5 | Lenna. |
| Milena | acquainted | **rivals** ✎ | Rank 6 | Challenges Milena Sagona to spar whenever she gets the chance. |
| Percival | acquainted | **friends** ✎ | Rank 6 | Percival Applethorne knighted her "Dame Saffi the Unstoppable" with a baguette; she accepted on the spot and is quite proud of it. |

### Sophia

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Aiden | acquainted | **partners** ✎ | Rank 6 | Aiden Ruzzo books her duels and pays on time. |
| Caralynn | dislike | **dislike** | Rank 5 | Despises weak nobles who serve only themselves (Caralynn Veyturone, her own dorm-mate, is a daily target). |
| Florian | acquainted | **fear** ✎ | Rank 5 | Florian Villeneuve avoids her and is transparently relieved she has never noticed. |
| Gareth | rival | **rivals** ✎ | Rank 5 | Losing to Gareth Valkaryn, and his graciousness afterwards even more. |
| Gavlan | acquainted | **wary** ✎ | Rank 6 | Milena Sagona cannot decide if she is victim or threat; Gavlan Haverton is wary. |
| Irene | fear | **fear** | Rank 6 | Irene Chanare froze on the breach night while she thrived, and fears her. |
| Krieg | acquainted | **wary** ✎ | Rank 6 | The irony: Krieg Valforth wants to take her apart and learn what the blood did to her. |
| Milena | acquainted | **wary** ✎ | Rank 6 | Milena Sagona cannot decide if she is victim or threat; Gavlan Haverton is wary. |
| Rei | dislike | **respect** ✎ | Rank 5 | She considers Rei the only person at Halvard worth respecting. |
| Ruby | acquainted | **respect** ✎ | Rank 6 | Asks Ruby Bonbon onto her team every year and is refused every year, kindly, and there is no way to threaten someone who wants nothing. |
| Vallie | rival | **rivals** ✎ | Rank 5 | Vallie Goredust adores her as a natural rival. |

### Tilly

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Alyssa | acquainted | **— (dihapus)** | Rank 6 | She is convinced Alyssa Edelweiss is under a curse, and has filed her under "unexplained". |
| Bobby | acquainted | **— (dihapus)** | Rank 5 | Halvard Unexplained has a page on BB, the maintenance man behind half the campus legends, filed under "confirmed, mostly". |
| Castor | acquainted | **— (dihapus)** | Rank 6 | Castor Moretti refuses to print her theories in the Academy Newspaper, every week. |
| Ezrel | acquainted | **wary** ✎ | Rank 5 | Halvard Unexplained has a page on her Magic Theory teacher, Ezrel Marionne, whose name is in every staff roll back to the founding and who has not age… |
| Irene | acquainted | **— (dihapus)** | Rank 6 | Irene Chanare, in the Library Assistants with her, is exasperated to keep finding shelved books rearranged into "evidence piles". |
| Layla | acquainted | **fond** ✎ | Rank 6 | Layla Palegleam lets her argue her wildest theories in office hours and enjoys every minute. |
| Lenna | acquainted | **protective** ✎ | Rank 6 | Lenna Greenwind shares her year and dorm and keeps having to haul her out of trouble; Lenna complains about it constantly and never once refuses. |
| Percival | acquainted | **friends** ✎ | Rank 6 | Percival Applethorne is her favourite audience: every ghost story she tells, he remembers personally encountering, which she writes down as corroborat… |

### Tristan

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Baelin | acquainted | **wary** ✎ | Rank 6 | He and Headmaster Baelin Kalvor take tea together and quietly measure each other every time. |
| Caspian | acquainted | **fond** ✎ | Rank 6 | Caspian Riwalo is his most devout student attendee. |
| Percival | acquainted | **fond** ✎ | Rank 6 | Percival Applethorne is the clergy's favourite student and sleeps through every sermon; Tristan finds this delightful and has stopped waking him. |
| Yvette | acquainted | **wary** ✎ | Rank 6 | He holds Yvette Fallaron's Oath in his registry and knows its terms exactly; the Oath forbids her from discussing it, and he has never brought it up, … |

### Trixie

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Bobby | acquainted | **fond** ✎ | Rank 5 | Volunteers for every one of Bobby Becket's card tricks and keeps suggesting real fire effects, which starts the same argument about the point of the e… |
| Ezrel | acquainted | **fond** ✎ | Rank 5 | Thinks Ezrel Marionne's flat asides are a comedy bit and is the only student who laughs at them; bosses his stage golems around at Theatre Troupe rehe… |

### Vallie

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Baelin | acquainted | **respect** ✎ | Rank 5 | After the breach, Headmaster Baelin decided Halvard's students needed a teacher who had actually killed monsters, not one who read about them. |
| Gavlan | rival | **rivals** ✎ | Rank 5 | Beat Gavlan at arm-wrestling once before he dies of old age, which at this rate will be never. |
| Idris | acquainted | **protective** ✎ | Rank 6 | A horned, marked Beastkin nobody dares whisper about, she is a quiet role model to Royhan and Idris, and flattens anyone who mocks Royhan's horns in f… |
| Krieg | fear | **opposes** ✎ | Rank 6 | Not afraid of Krieg Valforth, and he is wary of her for it. |
| Lenna | rival | **mentor** ✎ | Rank 6 | Used Saffi Tamberlane as a demonstration opponent all last year and still drags her in when she can, is delighted by Lenna Greenwind's hidden strength… |
| Milena | acquainted | **fond** ✎ | Rank 6 | She knows Milena Sagona wants to spar and teases her about it. |
| Rei | acquainted | **friends** ✎ | Rank 6 | Once tried to take Rei drinking and failed; Rei accepts only her Blackroot cigars. |
| Royhan | rival | **protective** ✎ | Rank 5 | Get Royhan Filanoman onto a competition team, even if she has to headlock a captain. |
| Saffi | rival | **mentor** ✎ | Rank 6 | Used Saffi Tamberlane as a demonstration opponent all last year and still drags her in when she can, is delighted by Lenna Greenwind's hidden strength… |
| Sophia | rival | **rivals** ✎ | Rank 5 | Used Saffi Tamberlane as a demonstration opponent all last year and still drags her in when she can, is delighted by Lenna Greenwind's hidden strength… |

### Vera

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Bobby | acquainted | **fond** ✎ | Rank 5 | Tries to take apart Bobby Becket's mechanical props, sometimes before he has finished performing with them. |
| Ezrel | acquainted | **— (dihapus)** | Rank 5 | Asked Ezrel Marionne one question about his golems; he answered it exactly, then walked away in the middle of her second. |
| Layla | acquainted | **fond** ✎ | Rank 6 | Layla Palegleam adores her in class and despairs of her margins, which are full of counter-arguments. |
| Royhan | acquainted | **partners** ✎ | Rank 5 | Trades notes and reagents with Royhan Filanoman, though he brews to heal and she brews to see what happens. |
| Yvette | acquainted | **mentor** ✎ | Rank 5 | Yvette Fallaron, the club's advisor, is the only teacher who has never told her to stop asking questions. |
| Zara | friend | **friends** ✎ | Rank 6 | Lab partner and unlikely friend of Zara Minallone, whose talismans are stored spells written down, exactly the sort of thing Vera wants to understand. |

### Yvette

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Baelin | acquainted | **partners** ✎ | Rank 5 | Convince Headmaster Baelin Kalvor to release her from the Oath early. |
| Caralynn | fear | **— (dihapus)** | Rank 6 | In her own Fire Dormitory: Gareth Valkaryn and Sophia Helfin are the top two, and she dreads the Fire dorm final every year; Caralynn Veyturone tops t… |
| Ezrel | acquainted | **wary** ✎ | Rank 5 | Shares Magic Theory with Ezrel Marionne and has not trusted him since she sat in his lectures. |
| Gareth | fear | **— (dihapus)** | Rank 6 | In her own Fire Dormitory: Gareth Valkaryn and Sophia Helfin are the top two, and she dreads the Fire dorm final every year; Caralynn Veyturone tops t… |
| Layla | friend | **friends** ✎ | Rank 5 | Long theory discussions with her friend Layla Palegleam, the History teacher. |
| Sophia | fear | **— (dihapus)** | Rank 6 | In her own Fire Dormitory: Gareth Valkaryn and Sophia Helfin are the top two, and she dreads the Fire dorm final every year; Caralynn Veyturone tops t… |
| Tilly | fear | **protective** ✎ | Rank 6 | In her own Fire Dormitory: Gareth Valkaryn and Sophia Helfin are the top two, and she dreads the Fire dorm final every year; Caralynn Veyturone tops t… |
| Tristan | acquainted | **wary** ✎ | Rank 5 | Tristan Aurelle holds that Oath in his registry and is unfailingly kind to her. |
| Vera | acquainted | **mentor** ✎ | Rank 5 | Vera Pulsar is the only student who out-questions her. |

### Zara

| Ke | Sekarang | Usulan | Terlihat | Kalimat di lore |
|---|---|---|---|---|
| Alyssa | acquainted | **friends** ✎ | Rank 5 | Alyssa Edelweiss, in her dorm and year, forgets her every week; Zara reintroduces herself each time without complaint, and has shown her the way up to… |
| Idris | acquainted | **friends** ✎ | Rank 5 | Has started trailing after Royhan and Idris, the other Sky outcasts, in the Gardens. |
| Royhan | acquainted | **friends** ✎ | Rank 5 | Has started trailing after Royhan and Idris, the other Sky outcasts, in the Gardens. |
| Ruby | acquainted | **friends** ✎ | Rank 5 | Ruby Bonbon, a third-year in her dorm, greeted her in her first week and never stopped. |
| Vera | friend | **friends** ✎ | Rank 5 | Vera Pulsar, a first-year in Viridian, has taken her on as a lab partner and become an unlikely friend: Vera asks blunt, fascinated questions about he… |

## Keputusan terbuka

- `[?]` Daftar kategori garis (14) terlalu banyak? Kandidat digabung: Fond ke Friends, Opposes ke Dislike, Partners ke Friends.
- `[?]` Setiap baris di tabel: coret atau tulis ulang yang menurutmu salah. Yang tidak disebut dianggap setuju.
- `[?]` Dorm / Club / Faction sebagai titik label: setuju? Atau lebih suka warnanya saja (misalnya lingkaran berwarna di belakang anggota satu dorm)?
- `[?]` Daftar faction di atas sudah lengkap? (Misalnya perlu "Sky outcasts" sebagai kelompok, atau cukup garis Friends?)
- `[?]` Tim akademi rival: tetap tidak tampil sama sekali (tidak punya bond), atau muncul sebagai kelompok "Rival academies" saat kompetisi?

## Keputusan owner (2026-09-25) — final

- Kandidat digabung: **Fond → Friends, Opposes → Dislike, Partners → Friends.** Kategori garis final (11): Friends, Romance, Family, Rivals, Mentor, Protective, Respect, Wary, Dislike, Fear, Uses.
- Semua baris tabel disetujui seperti diusulkan (dengan penggabungan di atas).
- Dorm / Club / Faction sebagai titik label; daftar faction seperti di atas (tanpa kelompok "Sky outcasts": garis Friends sudah cukup); tim akademi rival tetap tidak tampil.
- Tambahan: node yang di-drag **tetap di tempat dilepas** (tidak memantul kembali); posisi diingat selama panel terbuka.

## Pemangkasan kedua (owner, 2026-09-25): kategori masih terlalu banyak — usulan, menunggu "proceed"

Owner: romance hanya untuk hubungan dengan {{user}} (bukan antar-NPC), family tidak perlu karena hanya ada satu garis. Usulan **6 kategori**:

| Kategori | Isi (dari 11 kategori sebelumnya) | Garis |
|---|---|---|
| **Friends** | friends (termasuk fond, partners) | 93 |
| **Protective** | protective + mentor (membimbing, melindungi, menjaga) | 33 |
| **Respect** | respect (hormat tanpa harus akrab: Sophia → Rei) | 14 |
| **Rivals** | rivals | 17 |
| **Wary** | wary + fear + uses (curiga, takut, memanfaatkan: hubungan yang "tidak nyaman") | 50 |
| **Dislike** | dislike (termasuk opposes) | 28 |

- Romance dan Family dihapus dari garis antar-NPC. Satu-satunya garis family (Florian → Elion, adiknya di tim akademi rival) tidak pernah tampil karena tim rival tidak punya bond, jadi dibuang.
- Hubungan yang terbentuk di cerita (Campus_State.New_relations) tetap tampil sebagai garis **Story**.
- Total garis tampil: 235 (77 dibuang).
- `[?]` Kalau masih terlalu banyak: Respect bisa digabung ke Protective (jadi 5), atau Rivals ke Dislike.

### Revisi (owner): Friends terlalu banyak garis, dibagi dua — 7 kategori

| Kategori | Isi | Garis |
|---|---|---|
| **Friends** | persahabatan nyata dan timbal balik (trio Sky outcast, Layla & Yvette, Saffi & Lenna, Kuroo & Rei) | 38 |
| **Friendly** | suka / terhibur / akur, sering sepihak, plus rekan kerja dan kerja sama (Althair → Ezrel, Kuroo → Percival, Aiden & Bobby, Kuroo & Ottavio) | 55 |
| Protective | melindungi + mentor | 33 |
| Respect | hormat | 14 |
| Rivals | persaingan | 17 |
| Wary | curiga + takut + memanfaatkan | 50 |
| Dislike | benci / melawan | 28 |

Pembagian mengikuti kurasi awal: yang dulu *friends* tetap Friends; yang dulu *fond* dan *partners* menjadi Friendly. Friendly berwarna lebih pudar dan bisa dimatikan sendiri lewat chip.

### Revisi 2 (owner): "Friends" dan "Friendly" terlalu mirip — ganti jadi Friends dan Soft spot

| Kategori | Isi | Garis |
|---|---|---|
| **Friends** | akrab dan timbal balik: sahabat, teman dekat, dan yang bekerja bersama dengan baik (trio Sky outcast; Layla & Yvette; Kuroo & Ottavio "Boss"; Royhan & Vera tukar catatan; Aiden & Bobby pesanan prank; Caspian & Irene di Council) | 49 |
| **Soft spot** | rasa suka yang sering **sepihak**: terhibur, sayang, senang melihatnya, tanpa harus akrab (Althair → Ezrel; Kuroo → Percival; Tristan → Percival; Layla → Vera; Milena → Ruby) | 39 |
| Protective | melindungi + mentor | 33 |
| Respect | hormat | 17 |
| Rivals | persaingan | 17 |
| Wary | curiga + takut + memanfaatkan | 52 |
| Dislike | benci / melawan | 28 |

Garis "partners" dari kurasi awal dibagikan ke yang paling pas: kerja sama yang hangat → Friends; Baelin ↔ Althair ("setiap bantuan dicatat sebagai utang") → Wary; Baelin → Milena (saluran untuk menahan Krieg) dan Baelin ↔ Yvette (soal Oath) → Respect.
