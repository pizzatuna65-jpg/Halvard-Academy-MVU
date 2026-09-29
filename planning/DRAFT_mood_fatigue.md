# DRAFT: NPC mood of the day, fatigue with consequences, sleep debt

Status: **disetujui owner 2026-09-27; diimplementasikan v1.8.0 (2026-09-28).** Permintaan owner (2026-09-27): cuaca, waktu dan status dibuat lebih berefek, dengan engine
sendiri seberat gift engine. Tiga bagian: §1 NPC mood (butuh canon per NPC), §2 fatigue dan injury (aturan engine saja),
§3 sleep debt (aturan engine saja).

Yang sudah ada dan tidak berubah: cuaca 1.1.0 (Soaked/Chilled/Overheated, Head cold, Stamina −10 per jam di luar, kualitas
tidur, bonus bond +1 saat cuaca cocok, regulars pindah ke dalam), `_Condition` dan `_Fatigue` sebagai label, Injuries.
`data/weather_moods.json` (hanya Idris) dilebur ke tabel §1.

---

## 1. NPC mood of the day

Setiap NPC ber-bond punya mood **Good / Normal / Bad**, dihitung ulang tiap blok waktu (pagi 06–12, siang 12–18, malam 18–06).

**Skor** (dijumlah):

| Faktor | Nilai |
|---|---|
| Cuaca sekarang ada di daftar *loves* NPC | +1 |
| Cuaca sekarang ada di daftar *hates* NPC | −1 |
| Jam biologis: morning person di blok pagi / night owl di blok malam | +1 |
| Jam biologis: morning person setelah 22:00 / night owl sebelum 10:00 | −1 |
| Hari **Exams** (murid): ujian Midterm dan End of Semester, hari Results & Ranking. *thrives* +1, *dreads* −1 | ±1 |
| Hari **Trials** (semua): Warding Rite, Creature Studies Expedition, Dorm / Academy / Kingdom / World Competition, the Thinning, election week (hanya kandidat). *thrives* +1, *dreads* −1 | ±1 |
| `NPC_status` menyebut sakit, luka atau berduka | −1 |
| Lemparan harian ter-seed (`$eng.seed` + hari + id, tanpa `Math.random`): 10% −1, 80% 0, 10% +1 | ±1 |

Skor ≥ +1 = **Good**, ≤ −1 = **Bad**, selain itu **Normal**.

### Exams dan Trials

Keduanya adalah **hari bertaruhan tinggi**: hari yang hasilnya menentukan sesuatu (nilai, peringkat, keselamatan, gelar), bukan
hari rekreasi. Bedanya:

- **Exams** = hari yang **menilai otak**: duduk ujian, lalu menunggu hasilnya. Hanya berlaku untuk murid.
- **Trials** = hari yang **menguji nyali**: bertanding, masuk wilayah berbahaya, atau bertahan dalam ancaman nyata. Berlaku untuk
  semua orang di kampus, karena seluruh kampus merasakan tekanannya (staff yang menjaga, murid yang ikut atau menonton).

Nilai per NPC (+ / − / 0) menjawab satu pertanyaan: **tekanan jenis itu membuatnya lebih hidup atau lebih buruk?**
Sophia +: pertarungan membuatnya hidup. Hadrian −: risiko membuatnya panik. Tristan 0: tidak ada yang mengguncangnya.

| Jenis | Hari (kalender engine) | Siapa |
|---|---|---|
| Exams | Midterm exams: M3 W1 dan M9 W1, Mon–Thu | murid |
| Exams | End of Semester exams: M5 W1 dan M11 W1, Mon–Thu | murid |
| Exams | Results & Dorm Ranking: M5 W2 Fri · Results & Final Ranking: M11 W2 Fri | murid |
| Trials | Warding Rite: M2 W1 Fri–Sat (seluruh akademi memperbarui ward) | semua |
| Trials | Creature Studies Expedition: M2 W3 Wed–Fri (keluar kampus, ke wilayah monster) | semua |
| Trials | Dorm Competition: M3 W4 Sat–Sun | semua |
| Trials | Academy Competition: M6 W4 Wed–Sat | semua |
| Trials | The Thinning: M7 W3, seminggu penuh (lockdown total) | semua |
| Trials | Kingdom Competition: M9 W4 Thu–Sun | semua |
| Trials | World Competition: M11 W4 Wed–Sat (di luar negeri; di kampus hanya terasa lewat kabar) | semua |
| Trials | Student Council election week: M10 W3 Mon–Sat | **hanya kandidat** (Florian, Dante) |

**Bukan** Exams atau Trials (rekreasi atau upacara): Sports Day, Club Festival, Star Night, Dorm Days, Crowning Day, Academy
Showcase, Academy Bazaar, Founder Day, Harvest Festival, Remembrance Day, Traveling Circus, Academy Trip, Graduation.

Aturan tambahan:
- NPC yang sedang pergi (misalnya ikut World Competition di luar negeri) tetap terkena nilai Trials-nya, tapi mood-nya hanya
  terlihat kalau ia hadir.

**Efek:**

| Mood | Efek |
|---|---|
| Good | Talk dan hangout +1 XP · apology ×1.5 |
| Normal | — |
| Bad | Talk dan hangout −1 XP (minimal 0) · Tension yang {{user}} timbulkan hari itu ×1.5 |

- `<now>` untuk NPC yang hadir: "Sophia: good mood (the rain)". Narrator menulisnya in character. Mood mendorong, tidak
  memaksa: NPC tetap bereaksi sesuai karakternya.
- Pemain melihat mood NPC yang hadir di cast strip bracelet (ikon kecil) **mulai Rank 4**. Di bawah itu hanya narrator yang tahu.
- Kenaikan Tension ×1.5 di mood Bad sesuai prinsip "enemies are easier to make than friends". Di chat saya sempat menyebut ×2;
  ×1.5 lebih aman untuk 44 NPC.
- Krieg: mood hanya mewarnai sikapnya (bond-nya tanpa XP interaksi). **Ezrel selalu Normal** (apatis, canon).

**Cuaca yang dikenali engine**: Clear, Cloudy, Overcast, Fog, Rain, Storm, Snow; suhu Freezing, Cold, Cool, Mild, Warm, Hot;
Heatwave, Blizzard, Hail; angin **Windy**, **Gale** (roll angin terpisah yang sudah ada). Malam cerah = Clear di blok malam.
Satu blok bisa cocok dengan beberapa entri (misalnya Rain + Windy); setiap entri loves/hates yang cocok dihitung.

**Angin di tabel NPC** (tambahan ke kolom Loves/Hates di bawah):

| NPC | Angin | Alasan |
|---|---|---|
| Caralynn | hates Windy, Gale | her hair, on the way to be seen |
| Zara | hates Windy, Gale | talisman papers blow away |
| Idris | hates Windy, Gale | wind chill on a cold-blooded body |
| Milena | hates Gale | a southerner in northern wind |
| Maple | hates Gale | no climbing, no napping up high |
| Trixie | loves Windy | things fly, hair everywhere, a show |
| Percival | loves Gale | heroic weather |
| Vallie | loves Gale | always happy to test her strength [L] |
| Althair | loves Gale | chaos is a good game |

### Tabel per NPC (canon baru; `[L]` = dari lore)

Jam: **M** morning person, **N** night owl, — tidak ada. Exams / Trials: **+** thrives, **−** dreads, 0 biasa, · tidak berlaku
(staff tidak ikut ujian).

| NPC | Loves | Hates | Jam | Exams | Trials | Alasan |
|---|---|---|---|---|---|---|
| Irene | Clear | Storm | M | + | 0 | cleans her room every morning, good grades [L] |
| Caspian | Clear | Storm | — | 0 | 0 | outdoor festivals he runs; storms cancel them |
| Etnie | Snow | Storm | — | 0 | 0 | a dog in snow; thunder |
| Royhan | Cool | Hot, Heatwave | M | 0 | 0 | farm-raised; steady |
| Sophia | Rain, Storm | Hot, Heatwave | — | 0 | + | rain means water everywhere; battle-hungry [L] |
| Gareth | Clear | — | M | + | + | winning [L] |
| Ruby | Clear, Mild | Storm | — | 0 | − | hates fighting of any kind [L] |
| Lenna | Rain | Hot | N | − | 0 | naps; mornings are the enemy [L: sleep]; courageous [L] |
| Saffi | Clear, Warm | Rain | M | − | + | a cat and water; can't sit still in class, lives to move [L] |
| Kanae | Clear night | Overcast, Fog | N | + | 0 | stars from the Observation Tower; top grades [L] |
| Idris | Clear by day ≥15 °C | Cold, Freezing | — | 0 | 0 | cold-blooded [L, weather_moods] |
| Tilly | Fog, Storm | — | N | 0 | + | ghost weather; walks toward danger [L] |
| Dante | — | — | M | 0 | + | order under pressure |
| Florian | Clear | Rain | N | 0 | + | being looked at, winning [L] |
| Aiden | Fog | — | N | + | + | curfew routes; exam and contest weeks are betting season |
| Caralynn | Clear | Rain, Storm | — | − | + | the spotlight [L]; her hair |
| Zara | Cold, Snow | Hot | — | 0 | − | sitting by a fire; being stared at [L] |
| Percival | Storm | — | M | − | + | heroic weather; a chance for glory |
| Trixie | Clear, Snow | Rain | M | − | + | outdoor shows; sitting still [L]; excitement [L] |
| Vera | Storm | — | N | 0 | 0 | lightning; one tiny experiment all night [L] |
| Castor | Fog, Overcast | — | M | 0 | 0 | unnoticed; the Gardens early [L] |
| Alyssa | Clear | — | M | 0 | 0 | quiet mornings [L] |
| Linus | Clear | — | — | 0 | + | brackets and matchups [L] |
| Maple | Clear, Mild | Storm | M | 0 | − | climbing trees; fights, and Sobek near them [L] |
| Nerys | Fog | — | — | 0 | 0 | "nobody there" [L]; no feelings about the rest |
| Hadrian | Mild | Rain, Cold | — | + | − | a warm coat, being right; risk [L] |
| Wren | Clear | Fog | M | 0 | 0 | the dock at dawn; bad light defeats lip-reading [L] |
| Tsubaki | Clear night, Snow | Fog | M | − | + | open sky; lectures she can't follow; a good opponent [L] |
| Gavlan | — | Storm | M | · | + | thunder and war nightmares [L]; an old officer under pressure |
| Yvette | — | Fog | — | · | − | paranoid [L] |
| Krieg | Fog | — | M | · | + | doubled patrols in fog; the Thinning is his element |
| Milena | Clear, Warm | Cold, Snow | M | · | 0 | a southerner from Salaffos |
| Baelin | Clear | — | M | · | 0 | rest-day mornings at the Elder Oak [L]; enormous patience [L] |
| Layla | Rain | — | — | · | 0 | archive days and tea |
| Vallie | Storm, Snow | — | N | · | + | always happy to test her strength [L] |
| Rei | Fog | Heatwave | N | · | + | the Rooftop at hours nobody is awake; zero drama when it matters [L] |
| Kuroo | — | — | N | · | + | Card Club evenings; the moment a student finally tries [L] |
| Mimosa | Rain, Overcast | Clear, Hot | N | · | − | small, dim, enclosed; a room full of eyes [L] |
| Tristan | — | — | — | · | 0 | nothing rattles him [L] |
| Althair | Storm | — | — | · | + | relentlessly cheerful, never Bad from weather; a good game [L] |
| Ezrel | — | — | — | · | · | always Normal (apathetic) [L] |
| Ottavio | Rain, Fog | — | M | · | 0 | the fishing dock at dawn [L] |
| Caine | Overcast | — | — | · | 0 | silence [L] |
| Bobby | Storm | — | — | · | 0 | storms mean repair jobs |

### Efek angin tambahan untuk {{user}} (Full, aturan engine)

Yang sudah ada: payung gagal saat berangin, gale memicu happening pohon tumbang, snow + angin = blizzard, field line "gusts".
Tambahan:
- **Wind chill**: saat Windy, suhu dihitung satu label lebih dingin untuk exposure Chilled (Cool terasa Cold); saat Gale, dua label.
- **Gale**: Stamina −15 per jam di luar (bukan −10). Club yang latihan di luar pindah ke dalam, seperti saat hujan (Fishing
  Club juga, kecuali Ottavio: dia tetap di dermaga).

### Angin mengganggu casting (Full, aturan engine; owner 2026-09-27)

Engine sudah memotong mana untuk setiap cast {{user}} (`/Casts`, `Activation`, `Trigger`, `Upkeep_per_min`). Di **luar ruangan**
saat berangin, biayanya dikalikan menurut subtype teknik (`_Techniques.<name>.Subtype`), dari satu tabel (`data/wind_casting.json`):

| Kelompok subtype | Windy | Gale | Kenapa |
|---|---|---|---|
| **Wind, Storm** | ×1 | ×0.75 | the wind feeds them |
| **Mist, Smoke, Ash, Sand, Steam, Sound** | ×1.5 | ×2 | what they make is torn away, or drowned out |
| **Reinforcement, Mending, Phasing, Resizing** | ×1 | ×1 | worked on the body or the object itself |
| **Semua subtype lain** (Fire termasuk) | ×1.25 | ×1.5 | holding the weave steady against the wind |

- **Subtype buatan pemain** (Builder "Your own subtype", `Magic._Affinity.Custom`): form-nya mendapat satu pilihan baru
  **"In the wind"**: *Fed by it* (baris Wind/Storm) / *Scattered by it* (baris Mist/Smoke) / *Unaffected, works on a body or an
  object* (baris Reinforcement) / *Fights it* (baris lainnya, default). Disimpan sebagai `wind` di entri Custom.
  Urutan engine: entri Custom → tabel katalog → baris lainnya. Save lama tanpa `wind` memakai baris lainnya, dan pemain bisa
  mengubahnya di Builder kapan saja.
- Berlaku untuk Activation, Trigger dan Upkeep. Log menulis alasannya: "Mist Veil cost 30 (×1.5, windy outdoors)."
- Di dalam ruangan tidak berlaku. Barrier yang menahan angin (dilaporkan sebagai Active) membuat cast di baliknya dihitung
  seperti di dalam ruangan.
- `<now>` untuk narrator saat berangin di luar: "Outdoor casting fights the wind: mist and smoke scatter, sound carries away,
  fire runs downwind, aimed spells drift." NPC mengikuti hal yang sama in-story (engine hanya menghitung mana {{user}}).
- Field line "gusts" di Battle panel yang sudah ada menyebut pengali biaya.

---

## 2. Fatigue and injuries with consequences

Aturan engine (tanpa canon). Engine sudah menghitung `_Fatigue` dari Stamina dan menyimpan Injuries; sekarang keduanya berefek:

| Status {{user}} | Training | Bond |
|---|---|---|
| Fresh (Stamina > 70%) | normal | normal |
| Tired (31–70%) | hasil ×0.5 | normal |
| Exhausted (≤ 30%) | tidak ada hasil | talk dan hangout −1 XP ("poor company") |
| Collapsed (0) | tidak ada hasil | tidak bisa berinteraksi sampai bangun |
| Injury moderate | tidak bisa training Stamina | — |
| Injury serious / critical | tidak bisa training sama sekali | — |

- Engine mencatat di log kenapa sesi training tidak menghasilkan apa-apa, dan bracelet menampilkan "Too tired to train" / "Injured".
- `<now>`: "{{user}} is exhausted: the narrator shows it (slow, short answers)".

---

## 3. Sleep debt

- Setiap jam penuh {{user}} terjaga antara 00:00 dan 06:00 (tidak `Resting: sleep`) = **1 jam utang tidur** (`$eng.late`).
- Setelah bangun, Stamina maksimal hari itu **−10% per jam utang** (paling banyak −40%). Utang lunas setelah satu kali tidur
  minimal 6 jam. Kalau Head cold juga aktif, yang dipakai batas yang paling rendah.
- **The Vigil** (Nightwell): tidak ada utang selama 48 jam; setelah habis, langsung −40% sampai dua malam tidur penuh. Ini
  "paid for afterwards" di katalog shop, sekarang dijalankan engine.
- Malam tanpa curfew (Star Night, Harvest Festival) tetap dihitung: harganya memang itu.
- Night owl (§1) yang menemani {{user}} begadang ada di mood Good, jadi begadang bersama mereka tetap ada untungnya.
- Bracelet: "Sleep debt: −20% stamina". Migrasi save: `$eng.late = 0`.

---

## Implementasi (satu rilis)

- Data: `data/npc_moods.json` (tabel §1, menggantikan `weather_moods.json`), angka di `data/tuning.json`.
- Engine: skor mood per blok, efek XP/apology/Tension, gerbang training dari `_Fatigue` dan Injuries, `$eng.late`, batas Stamina.
- Card: baris mood di `<now>` untuk NPC hadir, baris fatigue.
- UI: ikon mood di cast strip (Rank 4+), chip sleep debt dan "too tired to train".
- Test: skor mood (cuaca, jam, Exams, Trials, status, seed), efek XP dan Tension, training ditolak saat Exhausted/Injured, utang tidur
  dan Vigil, migrasi save lama.
- Features setting: mood dan sleep debt ikut Weather effects (Off / Flavor / Full). Di Flavor hanya baris narrator, tanpa efek angka.
