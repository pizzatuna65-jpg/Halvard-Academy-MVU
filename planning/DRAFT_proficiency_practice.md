# DRAFT — Proficiency (6 stat), Practice, Crafting, titik merah, grade baru, mastery

**Status: APPROVED oleh owner (2026-09-30), semua batch. Belum diterapkan: tunggu owner bilang "mulai batch N".**
Tiap batch = satu rilis. Draft ini dihapus di rilis batch terakhir (sisa yang belum dibuat pindah ke `planning/FUTURE_PLANS.md`);
sampai itu, batch yang sudah diterapkan ditandai **[DONE x.y.z]** di judulnya.

Semua teks di blok `text` adalah teks kartu/UI (English) yang dipakai apa adanya.

## 0. Ringkasan

### Permintaan owner (2026-09-30)
1. Lokasi membuka aksi di Activities (Potion Halls → buat potion, dst.).
2. Titik merah di UI untuk UI baru yang terbuka.
3. Diagram bintang ala Persona di Studies; aksi di lokasi menaikkan kemampuan; grade ≠ proficiency.
4. Kegiatan yang butuh keahlian (brewing, Workshop, rajut, rune, masak, dsb.) memakai roll + modifier keahlian.
5. Keahlian tinggi membantu di luar pelajaran.

### Keputusan yang disetujui
- Proficiency = **6 stat luas** (inspirasi skill D&D/Pathfinder, tapi berperilaku seperti Persona): **Knowledge · Arcana · Craft ·
  Prowess · Society · Nature**, Rank 0–5, tidak pernah turun. **Rank 0 = biasa, bukan jelek** (tanpa penalti; rank hanya menambah). Grade tetap per mata pelajaran dan mengambil nilai dari stat-nya.
- Knowledge = pengetahuan umum (sejarah, sains, angka, geografi, bangsa, bahasa). Arcana = pengetahuan dan kepekaan sihir.
  Semua kerajinan memakai Craft (rune/enchant tingkat tinggi juga butuh Arcana). Musik, tari, teh = Society.
- XP sebagian besar dari laporan yang sudah ada; latihan di tempat lewat `/Practice`; cap 6 XP per stat per minggu.
- Crafting: roll Fortune giliran itu + rank Craft + alat + bantuan vs DC; hasilnya dihitung engine lebih dulu dan tampil di `<now>`.
- Grade baru: persiapan + stat + kehadiran + roll hari ujian (mengubah DECISIONS §3 Grades and exams; disetujui).
- Perk mastery Rank 5 per stat, termasuk Arcana (−10% mana + indra ward, dengan biaya perhatian Doves).
- Masterwork = karya bebas lewat Projects (tanpa resep tetap). Harga jual dan upah seperti tabel di bawah.
- Student Builder: dua pilihan, **Normal** (semua stat mulai Rank 0) atau **Custom** (pemain memilih rank awal tiap stat).
- Saya putuskan sendiri (owner tidak keberatan): titik merah selalu aktif; save lama dapat estimasi XP;
  XP kelas per stat (Arcana tidak dobel); semua angka = tunable setelah playtest.

### Urutan batch

| Batch | Rilis | Isi | Butuh | Menyentuh DECISIONS |
|---|---|---|---|---|
| 1 | 1.25.0 | Titik merah "baru" | — | §6 (browser storage tidak dipakai; token warna baru) |
| 2 | 1.26.0 | 6 stat, XP, hexagon di Studies, modifier Fortune | — | §3 (bidang bonus A pindah ke stat) |
| 3 | 1.27.0 | Tab Practice di Activities + `/Practice` | 2 (1 untuk titik) | §3 Training (sesi di tempat = sesi training biasa), §7 UI |
| 4 | 1.28.0 | Mesin crafting + kerajinan magic (brewing, rune, enchant) + reagent dari alam | 3 | — |
| 5 | 1.29.0 | Kerajinan non-magic (masak, rajut, lukis, ukir, kaligrafi, smithing) + masterwork | 4 | — |
| 6 | 1.30.0 | Grade baru + perk mastery Rank 5 | 2, 4 | **§3 Grades and exams** |

Batch 2 dan 3 boleh digabung jadi satu rilis kalau owner mau.

### Setiap rilis (dari CLAUDE.md)
Save fixture dulu (`node tests/fixtures/make_save.cjs`), bump `character_version`, `python tools/build_all.py`, CHANGELOG, HANDOFF,
TEST_CHECKLIST (live check di bawah tiap batch), INDEX/DECISIONS sesuai kolom "Dokumen", commit. Tes: suite batch itu saja
(owner 2026-09-27); suite penuh hanya di Batch 2 dan 6 (perubahan besar pada state dan nilai).

---

## Batch 1 — Titik merah "baru" (1.25.0) [DONE 1.25.0]

**Tujuan.** Pemain tahu ada UI baru tanpa harus membuka semua panel.

**Yang dapat titik**
- Tab yang baru terbuka (`$ui.unlocks`): Notebook (Planner, Notices, Letters, Mystery), Activities (Competition, Projects, Trips;
  Practice dari Batch 3), Student file (Bag, Hidden, Gifts & perks), Battle.
- Isi baru: lore/rumour yang baru didengar (`$ui.lore`, kartu Map), orang yang baru diketahui namanya (People); dari Batch 2–3:
  rank stat naik (Studies) dan tempat latihan baru (Practice).
- Tidak dapat titik: yang berubah tiap giliran (uang, jam, cuaca, bond XP).

**Dua tingkat** supaya titik tidak nyangkut: tombol bracelet bertitik kalau ada item baru yang belum diperhatikan, hilang saat
panel dibuka; tab/item bertitik sampai item itu sendiri dibuka.

**Penyimpanan** (bukan state game): key yang sudah dilihat (`tab:notebook:letters`, `lore:224`, `npc:Royhan`, `stat:Prowess:3`,
`act:potion_halls:brew`) di **variabel chat Tavern Helper** (`type: 'chat'`, key `eld_seen`). Bukan variabel pesan (tiap klik
jadi pesan tersembunyi), bukan browser storage (DECISIONS §6 hanya untuk tema). Langkah pertama implementasi: **verifikasi** API
chat variable di source JS-Slash-Runner dan bahwa MVU tidak memakai key itu (DECISIONS §11); kalau tidak bisa, simpan di memori
script (titik kembali setelah reload). Save lama: semua yang sudah terbuka ditandai dilihat diam-diam saat pertama jalan.

**Tampilan**: titik bulat kecil di pojok kanan atas tombol/tab, token baru `--notify` di semua tema, tidak berkedip,
`aria-label` + ", new".

```text
Tooltip on a dot: New
```

**File**: `src/ui/statusbar.template.html` (tombol), `src/scripts/ui.template.js` (Student file tabs, fungsi `newKeys`, seen
store), `src/ui/parts/10_people.js`, `20_map.js`, `30_notebook.js`, `40_activities.js` (tab/item), `tools/make_themes.py`
(token), lalu `gen_ui.py`.

**Save lama**: tidak ada perubahan state.

**Tes**: unit `newKeys(S, seen)`; `qa_static` (token ada di semua tema, tidak ada browser storage baru); preview browser.
Live: titik bertahan setelah reload; hilang setelah dibuka; swipe tidak memunculkannya lagi.

**Dokumen**: DECISIONS §6 satu baris ("titik baru: variabel chat Tavern Helper, bukan state game"); §11 fakta yang diverifikasi;
INDEX §5.

---

## Batch 2 — 6 stat + hexagon (1.26.0) [DONE 1.27.0]

**Tujuan.** Kemampuan nyata {{user}} terlihat dan tumbuh dari cara bermain; terpisah dari grade.

### Stat
| Stat | Mata pelajaran | Bidang Fortune (teks kartu) |
|---|---|---|
| Knowledge | History | history, the sciences, numbers, geography, nations and languages, old texts and records, working out a puzzle |
| Arcana | Magic Theory, Dark Magic Defense | analysing, sensing or unpicking magic; curses, wards and magical traps; precise spellwork |
| Craft | Potion Crafting | making, brewing, mending, cooking and handiwork; knowing a potion or poison |
| Prowess | Combat | duels and fights, sport, climbing, running and feats of strength |
| Society | Etiquette | formal dealings with staff, nobles and envoys; manners, rank and protocol; persuading, bargaining, performing, reading a room |
| Nature | Creature Studies | beasts, plants, weather, tracks and the outdoors |

Bidang ini menggantikan `TOP_FIELD` per mata pelajaran; bonus A (+10) yang sudah ada memakai bidang stat mata pelajarannya.

### Rank
Skala **0–5 seperti Persona, bukan D&D**: Rank 0 adalah titik awal setiap siswa, orang biasa yang belum dilatih di Halvard. Tidak
ada penalti di Rank 0; rank hanya menambah. Yang berbeda antar pemain hanya seberapa jauh mereka sudah tumbuh.

| Rank | XP total | Nama untuk AI | Fortune di bidangnya |
|---|---|---|---|
| 0 | 0 | Everyday | 0 |
| 1 | 10 | Trained | +3 |
| 2 | 30 | Capable | +6 |
| 3 | 60 | Skilled | +9 |
| 4 | 100 | Adept | +12 |
| 5 | 150 | Exceptional | +15 |

Rank + bonus A dalam satu bidang maksimal **+20**.

Nama rank per stat (UI saja). Rank 0 sengaja netral ("Everyday …"), supaya tidak terbaca sebagai kekurangan:

| Stat | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Knowledge | Everyday knowledge | Knows the basics | Well read | Learned | Erudite | Encyclopaedic |
| Arcana | Everyday casting | Follows the proofs | Spell-literate | Pattern reader | Ward-wise | Arcane scholar |
| Craft | Everyday hands | Follows the recipe | Steady hand | Skilled hands | Artisan | Master's hand |
| Prowess | Everyday fitness | Holds a stance | Quick on the feet | Seasoned | Duellist | Formidable |
| Society | Everyday manners | Minds the forms | Poised | Gracious | Well connected | Consummate |
| Nature | Everyday outdoors | Knows the signs | Calm hand | Trail-wise | Wild-wise | Kin to the wild |

### XP
| Sumber (sudah ada kecuali ditandai) | Stat | XP | Dalam cap? |
|---|---|---|---|
| Semua kelas mata pelajaran stat itu minggu ini dihadiri (izin = hadir) | stat mata pelajaran | +2 per stat per minggu | tidak |
| Nilai diumumkan, nilai terbaik di antara mata pelajaran stat itu | stat mata pelajaran | A +4, B +2 | tidak |
| Waktu belajar di Library / Study Rooms / Archive | Knowledge | +1 per 2 jam | ya |
| `Interactions` talk / hangout / gift | Society | +1 per hari yang ada interaksinya | ya |
| Casting teknik (stepMagic) | Arcana | +1 per hari yang ada casting | ya |
| `/Training` Stamina | Prowess | +1 per sesi | ya |
| Battle selesai | Prowess | +1 | ya |
| Waktu klub hari Sabtu | stat klubnya (tabel di bawah) | +1 | ya |
| `/Tutoring` | stat mata pelajaran | +1 | ya |

Klub → stat (`data/club_stats.json`, baru): Magic Duelling, Soccer, Running, Archery, Swimming, Gymnastics, Basketball, Walking →
Prowess · Beast Handling, Gardening, Fishing, Groundskeeping → Nature · Alchemy, Brewing, Smithing, Tailoring, Cooking, Drawing,
Calligraphy → Craft · Music, Tea, Theatre, Card, Board Game, Festival Committee, Student Council, Medical Centre Volunteers →
Society · Warding Study, Divination, Specialized Magic → Arcana · Library Assistants, Newspaper → Knowledge.

- **Cap**: 6 XP per stat per minggu; Settings "Proficiency pace" Slow 4 / Normal 6 / Fast 9 (`data/tuning.json`).
- Hitungan: fokus = 8 XP/minggu → Rank 5 dalam ±19 minggu (satu semester). Tanpa usaha khusus (kelas + bonus ujian): Rank 1
  ±minggu 5, Rank 2 ±akhir semester pertama, Rank 3 ±pertengahan semester kedua, Rank 4 ±akhir tahun pertama.
- **Society dan bond**: Rank 4 +10%, Rank 5 +20% XP bond dari talk/hangout, di bawah cap harian/mingguan bond; tidak menyentuh
  Tension.

### State dan fitur
- `Player._Proficiency` `{ Knowledge: 2, ... }` (AI melihat, engine menulis, tulisan AI dikembalikan); `$eng.prof`
  `{ xp, wk, days, picked }`.
- Fitur `proficiency` ("Proficiency and practice") di `data/features.json`. Off → XP berhenti, `_Proficiency` diparkir, Fortune
  tanpa modifier rank, grade (Batch 6) menganggap semua Rank 2.
- Engine: step baru `stepProficiency` setelah `stepTraining` (butuh hasil kelas, training, interaksi, casting); modifier Fortune
  ditambahkan ke `$ui.fortune.mods`.

### UI: tab Studies
Urutan: hexagon → tabel stat → Next exams → Grades → Exams.
- **Hexagon**: SVG 6 sumbu, 5 cincin (pusat = Rank 0), poligon = rank + progres ke rank berikutnya; dihitung langsung (tanpa rAF, DECISIONS §6);
  warna lewat token. Label = stat + nama rank; klik → baris tabel.
- **Tabel**: stat, nama rank, bar XP, "this week 4/6", mata pelajaran yang memakainya, bonus Fortune, (Batch 3) where to practise.
- **Student Builder** (langkah Identity), bagian "Starting proficiency" dengan toggle dua pilihan:
  - **Normal** (default): semua stat mulai Rank 0, seperti setiap first-year; semuanya tumbuh di Halvard.
  - **Custom**: pemain memilih rank awal tiap stat (0–5, bebas, tanpa anggaran poin). Untuk karakter dengan masa lalu, returning
    student, atau start di Year 2/3. Rank 5 dari awal langsung membuka perk mastery (Batch 6); itu pilihan pemain.
  - Di bawah toggle ada info singkat bahwa Rank 0 bukan berarti jelek (teks di bawah).
  - Ditulis seperti field Builder lain (`buildOps`); XP awal = ambang rank yang dipilih.

```text
Proficiency (heading hint): What you can actually do, in class and out of it. It grows with the classes you attend, the life
you lead and the practice you put in, and it changes Fortune rolls in its field.
Grades (heading hint): What the last exams recorded, subject by subject. Marks set your dorm rank and payout.
Builder, heading: Starting proficiency
Builder, toggle: Normal · Custom
Builder, Normal: Every stat starts at Rank 0, like every first-year. You grow from here through classes, daily life and practice.
Builder, Custom: Choose where each stat starts, for a student with a past: a returning student, a noble upbringing, a farm
childhood, years of duelling. Higher starts leave less to grow.
Builder, info under the toggle: Rank 0 is not bad. It is where everyone starts: an ordinary person who has not trained that
field at Halvard yet. There is no penalty at Rank 0; ranks only add.
Studies, hover on a Rank 0 stat: Rank 0: ordinary, not bad. Nothing is taken off your rolls; practice adds to them.
Studies, one-time offer on an older save: Set your starting proficiency (Normal keeps what you have; Custom lets you choose).
Toast on a rank-up: Craft: Steady hand (Rank 3)
Journal on a rank-up: Craft reached Rank 3 (Steady hand).
<now> Fortune line, example: proficiency: Craft (making, brewing, mending...) +10; Prowess (duels, sport...) -5
504 (narration): {{user}}'s proficiency (Player._Proficiency, ranks 0-5) sets how capable {{user}} is in each field, in class and
out of it: Rank 0 is an ordinary person (not clumsy, just untrained), Rank 3 is solid, Rank 5 is among the best of the year.
Write attempts to match; a grade is only what the last exam recorded.
```

**File**: `src/scripts/schema.js`, `engine.template.js` (`stepProficiency`, `stepFortune`, `stepBonds` bonus Society,
`stepMigrate`, `TOP_FIELD`), `data/features.json`, `data/tuning.json`, `data/club_stats.json` (baru, lewat `gen_engine.py`),
`src/worldbook/custom/content/501.txt` (bila perlu), `504.txt`, `505.template.ejs`, `ui.template.js` (`pStudies`, Builder,
`buildOps`), `tools/gen_engine.py`, `gen_ui.py`, `gen_mvu_entries.py`.

**Save lama** (`stepMigrate`, sekali): tiap stat 2 XP per minggu yang sudah dimainkan (maks. 29 → paling tinggi Rank 1), lalu
tab Studies menawarkan sekali "Set your starting proficiency" (Normal = biarkan; Custom = pilih rank seperti di Builder) lewat
pesan tersembunyi seperti Settings.

**Tes**: suite baru `test_proficiency_v1260.cjs` (XP kelas, Arcana tidak dobel, tiap sumber, cap, pace, migrasi, clamp,
Fortune + cap +20, bonus bond Society, Builder Normal/Custom); `test_saves.cjs`; suite penuh. Token: `_Proficiency` ±20, baris Fortune 0–50, 504 ±60.
Live: hexagon di tema terang/gelap dan layar sempit; Builder Normal/Custom; tawaran save lama.

**Dokumen**: DECISIONS §3 (entri baru "Proficiency"); INDEX §2 (`stepProficiency`), §3, §7 (`club_stats.json`).

---

## Batch 3 — Tab Practice (1.27.0) [DONE 1.27.0]

**Tujuan.** Tempat yang sudah ditemukan membuka aksi latihan yang menaikkan stat.

**Cara kerja**
- Activities dapat tab **Practice** begitu satu tempat latihan sudah ditemukan (`$ui.discovered`; tanpa state unlock baru).
- Isi: **Here** (aksi di tempat sekarang, tombol) → **Elsewhere** (tempat lain yang ditemukan, tombol Go) → "n more places to find".
  Aksi terkunci tampil dengan alasannya.
- Tombol hanya mengisi input chat (DECISIONS §7).
- Narrator melaporkan `/Practice` `[{ Action, Subject, With, Aim }]`. Engine mengecek tempat (awal atau akhir update), waktu maju
  ≥ 45 menit, bukan jam kelas, sekali per aksi per hari, syarat, cap. Gagal → `_Log`, tanpa XP.
- `<now>` di tempat latihan: satu baris aksi yang tersedia.

### Tempat dan aksi (`data/practice.json`)
| Tempat | Aksi | Stat | XP | Syarat |
|---|---|---|---|---|
| Potion Halls | Brew a potion | Craft | 2 | Hall asrama sendiri, setelah pelajaran sampai 20:00. Cek crafting dari Batch 4. |
| Potion Halls | Reagent drill | Craft | 1 | — |
| Main Library | Study a subject | stat mata pelajaran | 1/jam, maks. 2 | Tetap menambah persiapan ujian. |
| Study Rooms | Group study | stat mata pelajaran | 2 | Ada partner; tetap interaksi `study`. |
| Archive | Dig through the records | Knowledge | 2 | — |
| Seminar Rooms | Practise wards and counter-curses | Arcana | 2 | Setelah pelajaran, ruang kosong. |
| Observation Tower | Chart the stars | Arcana | 2 | Malam, langit cerah (cuaca). |
| Meditation Rooms / Spirit House | Will-focus meditation | Arcana | 1 | + sesi training Mana pool; tidak sendirian (canon). |
| Club Rooms | Specialized Magic practice | Arcana | 2 | Anggota. |
| Combat Grounds | Drill | Prowess | 1 | Area asrama sendiri; + sesi training Stamina. |
| Combat Grounds | Spar with a partner | Prowess | 2 | Partner asrama sama; lintas asrama di Training Week (canon). |
| Sparring Pavilion | Take a challenge from the board | Prowess | 3 | Anggota Magic Duelling Club. |
| Gymnasium, Sports Field, Archery Range, Swimming Pool | Train | Prowess | 1 | + sesi training Stamina. |
| Gardens | Tend the reagent beds | Nature | 1 | Siang; Gardening Club atau membantu klub. Batch 4: reagent. |
| Menagerie | Help with the animals | Nature | 2 | Siang, diawasi. |
| Menagerie | Muck out the pens (paid) | Nature | 1 | +40 points per shift, maks. 2 seminggu. |
| Forest | Fieldwork: tracks and signs | Nature | 2 | Siang; Winter pulang sore; curfew. |
| Forest | Forage | Nature | 1 | Spring/Autumn. Batch 4: reagent. |
| Forest Clearing | Gather clearing blooms | Nature | 1 | Batch 4: reagent langka, layu besok. |
| Fishing House | Fish the pond or the lake | Nature | 1 | Fishing Club atau ikut anggota. |
| The Mall (studios) | Dance and deportment / Music practice | Society | 2 | Bayar jam studio (15). |
| Common Rooms | Practise forms of address | Society | 1 | Ada partner. |
| Club Rooms | Music, Tea, Theatre practice | Society | 2 | Anggota. |
| Club Rooms | Drawing, Calligraphy, Tailoring practice | Craft | 2 | Anggota. Crafting di Batch 5. |
| Workshop | Runes and talismans / Enchant or repair | Craft | 2 | Crafting di Batch 4. |
| Workshop | Smithing / Tailoring | Craft | 2 | Anggota klub. Crafting di Batch 5. |
| Canteen (Cooking Club kitchen) | Cook or bake | Craft | 2 | Anggota, atau izin juru masak. Crafting di Batch 5. |
| Kamar asrama, Common Rooms, Courtyards, Gardens | Knit or sew, sketch or paint, carve, calligraphy | Craft | 1 | Duduk dan tenang, di luar jam kelas, bahan di Bag. Crafting di Batch 5. |

Acara kalender (sekali, di luar cap, kalau hadir): Training Week Prowess +3 · Creature Studies Expedition Nature +3 · Warding Rite
Arcana +2 · Star Night Arcana +2 · Club Festival / Academy Bazaar (punya stand) Craft +2 · Entrance Event feast / Academy Founder
Day Society +2.

Sebelum Batch 4/5, aksi crafting sudah bisa dipilih dan memberi XP latihan, tapi belum menghasilkan barang.

```text
Practice tab lead: Places where you can put in practice. Each session raises a proficiency, up to a weekly limit.
Here heading: Here
Elsewhere heading: Elsewhere
More to find: {n} more places to find.
Locked reason, examples: Needs: Magic Duelling Club · Needs: Craft Rank 3 · Needs company: students are not to go alone
Hint at the weekly limit: Prowess is at this week's limit (6/6); class attendance still counts.
Button fill, examples:
  I spend the afternoon in my dorm's Potion Hall brewing: 
  I find a free seminar room and practise wards and counter-curses for an hour.
  I ask ___ to spar with me in our training area.
<now> line: Practice here: Spar with a partner (Prowess), Drill (Prowess). Report in /Practice.
502 (update rules): /Practice: when {{user}} spends real time practising or crafting at a place (Practice here in <now>),
report { Action, Subject (for study), With, Aim }. Report the attempt once, whatever the result.
```

**File**: `data/practice.json` (baru), `schema.js` (`Practice` list), `engine.template.js` (`stepProficiency` membaca `/Practice`;
training Stamina/Mana dari aksi), `502.txt`, `505.template.ejs`, `src/ui/parts/40_activities.js` (`ACT_TABS`, `acPractice`),
`ui.template.js` (Studies "where to practise"), `gen_engine.py`, `gen_ui.py`, `gen_mvu_entries.py`.

**Save lama**: tidak ada migrasi (tempat yang sudah ditemukan langsung membuka aksinya; titik merah untuk semuanya sekali, lalu
hilang saat tab dibuka).

**Tes**: `test_practice_v1270.cjs` (tiap syarat: tempat, jam kelas, 45 menit, harian, cap, klub, asrama, Winter, cerah, tidak
sendirian, training ikut tercatat, list kosong setelah engine). Token: 502 ±80, `<now>` ±25 hanya di tempat latihan.
Live: narator melaporkan `/Practice`; tombol mengisi chat; tab di layar sempit.

**Dokumen**: DECISIONS §3 Training (aksi latihan = sesi training biasa), §7 (tab Practice muncul dari tempat yang ditemukan);
INDEX §5, §7.

---

## Batch 4 — Mesin crafting + kerajinan magic (1.28.0)

**Tujuan.** Kegiatan yang butuh keahlian punya hasil nyata, dan hasilnya bergantung pada Craft.

### Rumus (semua kerajinan, juga Batch 5)
Skor = roll Fortune giliran itu (sama di tiap swipe) + rank Craft (0 … +15) + modifier kondisi yang sudah ada + alat terbaik di
Bag + bantuan (ahli di Scene +10). Bonus A Potion Crafting ikut cap +20 bersama rank.

| Tingkat | DC | Syarat |
|---|---|---|
| Simple | 25 | — |
| Standard | 45 | — |
| Advanced | 65 | Craft Rank 3, atau ahli hadir |
| Masterwork | 85 | Craft Rank 4 (Batch 5) |

Hasil: ≥ DC+25 **fine** · ≥ DC **success** · ≥ DC−15 **weak** ("rough") · di bawahnya **failed** (bahan hilang, tetap +1 XP).
Roll alami ≤ 3: **mishap** sesuai kerajinan (cedera minor, ditulis narator).

**Narator dan engine sepakat**: engine menghitung hasil tiap tingkat dari roll giliran berikutnya dan menaruhnya di `<now>`, hanya
untuk kerajinan yang bisa dilakukan saat itu (tempat, bahan, klub, rank). Saat `/Practice` melaporkan `Action: "craft"`,
`Aim: <resep>`, engine memakai hasil yang sama (dari state sebelum balasan), mengurangi bahan, dan menambah hasil ke Bag.

- Hasil masuk Bag dengan Note `handmade by {{user}}` (+ "fine" / "rough"); `data/gift_prefs.json` sudah membaca `handmade`,
  `drawing`, `carving`, jadi hadiah buatan sendiri langsung bekerja.
- Efek pakai: mekanisme `use` / `gear` toko yang sudah ada; satu efek baru `heal`.

### Brewing
Tempat: Potion Halls (asrama sendiri), Workshop (anggota Brewing Club). Alat: Glass stirring-rod set +5, Ardenne measuring set +10.
Ahli: Mimosa, Royhan. Bahan: Common reagent bundle (30), reagent forage, Rare reagent (350), clearing bloom (layu besok).
Basic/standard: 1 bundle atau 1 forage; advanced: 2 bundle, atau 1 bundle + 1 clearing bloom.

| Tingkat | Resep | Efek (`/Consumables`) | Dosis fine / success / weak | Jual |
|---|---|---|---|---|
| Simple | Warming draught | clears Chilled + warm 240 menit | 3 / 2 / 1 | 8 |
| Simple | Cooling draught | clears Overheated + sun 240 menit | 3 / 2 / 1 | 8 |
| Simple | Cold remedy | cure Head cold | 3 / 2 / 1 | 10 |
| Standard | Healing draught | `heal`: satu cedera minor sembuh | 3 / 2 / 1 | 15 |
| Standard | Vigour tonic | stamina +20 | 3 / 2 / 1 | 12 |
| Advanced | Strong healing draught | `heal`: cedera moderate jadi minor | 2 / 1 / 1 | 40 |
| Advanced | Fire flask, Bottled cold | fitting item +20 di Fortune (aturan 504 yang ada) | 2 / 1 / 1 | 40 |

Doves memeriksa racikan siswa untuk poison magic (canon); brew advanced boleh memicu pemeriksaan itu. Apothecary Medical Centre
membeli healing draught, maks. 3 seminggu.

### Runes and talismans
Tempat: Workshop, Club Rooms (Specialized Magic). Advanced butuh juga **Arcana Rank 3**. Bahan: Talisman paper stack (10), Pen nibs
and ink. Alat: Steel-nib fountain pen +5.

| Tingkat | Resep | Efek |
|---|---|---|
| Simple | Warmth rune | buff warm 240 menit |
| Standard | Rain-ward talisman | buff waterproof 180 menit |
| Standard | Light rune | fitting item di tempat gelap |
| Advanced | Ward talisman | fitting item +20 melawan kutukan dan hex, sekali pakai |

### Enchant or repair
Tempat: Workshop. Enchant butuh **Arcana Rank 3**. Standard: repair a damaged item (Note "damaged" hilang). Advanced: pakaian biasa
jadi gear `warm` atau `waterproof` (Note "enchanted"); bahan: 1 Common reagent bundle.

### Reagent dari alam (aksi Batch 3 mulai memberi bahan)
Gardens: 1 reagent per sesi · Forest forage: 1–2 menurut musim (Spring/Autumn 2, Summer 1, Winter tidak) · Forest Clearing:
1 clearing bloom (layu besok). Bag `Kind: reagent` (sudah ada).

```text
<now> line, example: Crafting now: Brewing: simple fine · standard success · advanced weak · masterwork fails (Craft Rank 3, tired -5).
504: When {{user}} crafts, play the result <now> gives for that craft and tier; never override it.
Bag note, examples: handmade by {{user}}, fine · handmade by {{user}}, rough · wilts tomorrow
```

**File**: `data/crafts.json` (baru), `data/shop.json` (`heal`), `tools/common.py` (`effect_text` untuk `heal`), `engine.template.js`
(crafting di `stepProficiency`, `heal` di pemakaian Consumables, clearing bloom layu di `stepBag`), `504.txt`, `505.template.ejs`,
`506.template.ejs` (harga jual), `40_activities.js` (resep di Practice), `gen_*`.

**Save lama**: tidak ada migrasi.

**Tes**: `test_crafting_v1280.cjs` (DC dan band, `<now>` = hasil engine, syarat Arcana, alat terbaik saja, bantuan, bahan kurang,
mishap, bloom layu, `heal`, Note cocok dengan regex gift_prefs, `<now>` hanya kerajinan yang bisa dilakukan). Token ±15 per
kerajinan yang bisa dilakukan, 0 di tempat lain. Live: narator memainkan hasil dari `<now>`; potion muncul di Bag; pemakaian.

**Dokumen**: DECISIONS §3 entri "Crafting" (rumus, hasil dari `<now>`); INDEX §7 (`crafts.json`).

---

## Batch 5 — Kerajinan non-magic + masterwork (1.29.0)

**Tujuan.** Keahlian di luar sihir (masak, rajut, lukis, dll.) memakai mesin yang sama.

| Kerajinan | Tempat | Bahan | Alat | Resep |
|---|---|---|---|---|
| Cooking and baking | dapur Cooking Club di Canteen (anggota, atau izin juru masak) | **baru** Baking and cooking ingredients (Commissary 10); Bag of red apples, Carrots and fresh greens, Salaffian spice box | — | Simple: honey buns / cookies (stamina +10) · Standard: a hearty stew pot (stamina +15, bisa dibagi) · Advanced: a festival cake |
| Needlework | portable; Tailoring Club (Club Rooms, Workshop) | **baru** Knitting wool and needles (Tinker's Bench 15); Embroidery thread set; Bolt of Sky silk | — | Simple: mend clothes · Standard: knitted scarf (gear `warm`), embroidered handkerchief · Advanced: knitted winter set (gear `warm`), a garment of Sky silk |
| Drawing and painting | portable; Drawing Club, art studio Mall | Sketchbook and charcoal; **baru** Paint box (Tinker's Bench 30) | — | Simple: a sketch · Standard: a portrait · Advanced: a painting (jual di Club Festival / Academy Bazaar, 30–80) |
| Woodcarving | portable | Carving knife and limewood block | — | Standard: a carved figure · Advanced: a carved box |
| Calligraphy | portable; Calligraphy Club | Letter paper set, Pen nibs and ink | Steel-nib fountain pen +5 | Standard: a formal letter (Letters) · Advanced: an illuminated invitation |
| Smithing | Workshop (Smithing Club) | **baru** Bar stock and coal (Commissary 20) | Precision tool roll +5 | Simple: hooks and nails · Standard: a sharpened and balanced blade · Advanced: forged fittings or a small tool |

Semua hasil tanpa efek pakai adalah barang/hadiah (Note `handmade`). Musik, tari, teh = Society (latihan saja).

### Masterwork (DC 85, Craft Rank 4)
Tanpa resep tetap: karya bebas lewat **Projects** (Kind `craft`; canon Potion Crafting "brewing to recipe, then independent
formulation"). Saat Project selesai, narator melaporkan crafting tingkat masterwork; engine menilai band-nya seperti biasa,
cerita menentukan barang dan efeknya, Note `masterwork by {{user}}`.

```text
Practice, masterwork hint: A masterwork has no recipe: start it as a Project, and when it is finished the result is judged like any other piece.
```

**File**: `data/crafts.json`, `data/shop.json` (4 bahan baru), `engine.template.js` (masterwork dari Projects), `502.txt` (satu
kalimat Projects), `506.template.ejs`, `40_activities.js`, `gen_*`.

**Save lama**: tidak ada migrasi.

**Tes**: tambahan di `test_crafting` (tiap resep punya bahan yang dijual, kerajinan portable di tempat yang benar, masterwork dari
Project selesai, gear hasil rajutan bekerja untuk cuaca). Live: satu kerajinan portable dan satu hadiah buatan sendiri.

**Dokumen**: INDEX §7 (bahan baru di `shop.json`).

---

## Batch 6 — Grade baru + perk mastery (1.30.0)

**Tujuan.** Grade mencerminkan persiapan, kemampuan dan kehadiran; kemampuan tertinggi membuka perk di luar kelas.

### Rumus grade (mengganti rumus di DECISIONS §3, disetujui)
Skor per mata pelajaran (0–100):
- **Persiapan**: tier jam belajar seperti sekarang → 0 / 25 / 50 / 75 / 100 (Gareth tetap +1 tier).
- **Stat**: rank stat mata pelajaran × 20 (MT dan DMD → Arcana, History → Knowledge, Etiquette → Society, Potion → Craft, Combat →
  Prowess, Creature Studies → Nature).
- **Kehadiran**: persen kelas mata pelajaran itu yang dihadiri sejak ujian sebelumnya (izin = hadir; belum ada kelas = 100).
- Bobot: **teori** (Magic Theory, History, Etiquette) 50 / 30 / 20; **praktik** (Potion Crafting, DMD, Combat, Creature Studies)
  30 / 50 / 20.
- **Roll hari ujian** (seeded per mata pelajaran per ujian): 1–10 −8 · 11–30 −4 · 31–70 0 · 71–90 +4 · 91–100 +8.
- A ≥ 85, B ≥ 70, C ≥ 55, D ≥ 40, F < 40.

Tetap: lantai C tanpa skip, Tired −1 / Exhausted −2 langkah, make-up maks. C, focus draught Mimosa, Alyssa +1 praktik, Layla
History A, `/Exam_events`, dorm rank dan reputasi dari nilai. Diganti: "skip ≥ 3 −1" (kehadiran ada di skor) dan "6 training →
Combat +1" (training menaikkan Prowess).

| Contoh | Teori | Praktik |
|---|---|---|
| First-year, fair, Rank 0, hadir penuh | 45 → **C** (lantai) | 35 → **C** (lantai) |
| Rajin: excellent, Rank 2, hadir penuh | 82 **B** | 70 **B** |
| Jago tapi malas: unprepared, Rank 4, hadir penuh | 44 → **C** (lantai) | 60 **C** |
| Fokus Craft: solid, Rank 5, hadir penuh | — | 92 **A** |
| Suka bolos: fair, Rank 2, hadir 60% | 49 **D** | 47 **D** |

### Perk mastery (Rank 5)
Umum: di Rank 5, percobaan rutin di bidangnya tidak perlu roll (langsung berhasil); percobaan sulit tetap +15. Ditambah:

| Stat | Perk (teks UI) | Mekanisme |
|---|---|---|
| Knowledge | Encyclopaedic: once a week, digging through the Archive or the Library turns up one real lead. | `<now>`: izin satu Clue nyata |
| Arcana | Arcane scholar: you sense a ward, a trap or a spell at work before you step into it, and per-use techniques cost 10% less mana. The Doves take an interest. | `<now>`; stepMagic (bulat 0,5, min. 0,5); Doves rep +8 sekali; dengan hidden magic Dove attention +3 sekali |
| Craft | Master's hand: every successful piece comes out one better (one extra dose or piece), nothing you make comes out rough, and no tier needs supervision. | crafting |
| Prowess | Formidable: once a week, an injury from a fight lands one step lighter. | stepVitals |
| Society | Consummate: staff and nobles you meet for the first time start at Trust +5. The Noble Houses' Liaison takes note of you. | Trust awal; satu Letter/Hook dari Liaison |
| Nature | Kin to the wild: an ordinary creature's first reaction to you is curiosity, not fear or attack, and foraging brings back double. | `<now>`/504; forage |

```text
Why line, example (a practical): solid preparation 22.5 · Craft Rank 4 40 · attended 100% 20 · a good day +4 = 86.5: A
Next exams hint: Your mark = preparation, the proficiency the subject draws on, and attendance (theory leans on preparation,
practicals on proficiency), plus how the day goes. Attending every class of a subject still guarantees at least a C.
Perk row, locked: Rank 5: Arcane scholar (locked)
Toast on reaching Rank 5: Mastery: Arcane scholar
```

**File**: `engine.template.js` (`stepSchoolWeek` `markUp` dan kehadiran per mata pelajaran, `stepMagic`, `stepVitals`,
`stepBonds` Trust awal, perk di `stepProficiency`), `504.txt`, `505.template.ejs`, `ui.template.js` (`pStudies` Why dan perk),
`data/features.json` (deskripsi Study and exams), `gen_*`.

**Save lama**: kehadiran per mata pelajaran mulai dihitung dari rilis ini (ujian pertama setelah update: kelas sebelum rilis
dianggap hadir kecuali skip yang sudah tercatat di `ST.skip`).

**Tes**: `test_grades_v1150.cjs` diperbarui ke rumus baru + `test_mastery_v1300.cjs` (contoh tabel, lantai C, bobot, Arcana untuk
dua mata pelajaran, roll seeded sama di tiap swipe, perk sekali per minggu, biaya Doves); suite penuh. Live: satu ujian penuh
(midterm) dan satu perk Rank 5 (pakai save uji).

**Dokumen**: DECISIONS §3 "Grades and exams" ditulis ulang + entri "Mastery"; INDEX §2; draft ini dihapus, tunable ke
`FUTURE_PLANS.md` §5.

---

## Canon yang saya karang (sudah disetujui owner, 2026-09-30)
- Potion Hall terbuka untuk siswa setelah pelajaran sampai 20:00; brew advanced butuh pengawasan di bawah Craft Rank 3.
- Studio Mall untuk latihan dansa/etiket; Common Rooms untuk latihan tata sapaan.
- Spirit House untuk latihan Arcana dan training Mana pool ("will-focus training").
- Apothecary Medical Centre membeli healing draught buatan siswa (maks. 3 seminggu).
- Dapur Cooking Club boleh dipakai non-anggota dengan izin juru masak; kerajinan portable di kamar asrama, Common Rooms, Courtyards,
  Gardens.
- Bahan baru: Baking and cooking ingredients (Commissary 10), Knitting wool and needles (Tinker's Bench 15), Paint box (Tinker's
  Bench 30), Bar stock and coal (Commissary 20).
- Nama rank, nama/efek resep, harga jual (potion 8–40, lukisan 30–80), mucking out 40 per shift (2 seminggu), klub → stat.

## Tunable setelah playtest (ke FUTURE_PLANS §5 saat draft dihapus)
Ambang XP (10/30/60/100/150), cap 6 dan pace, XP per sumber, modifier Fortune per rank dan cap +20, DC dan band crafting, dosis, harga
jual, upah, bobot grade dan roll ujian, bonus bond Society.
