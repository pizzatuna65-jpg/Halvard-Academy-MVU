# DRAFT: kerja club untuk kampus (kontribusi nyata di luar keanggotaan {{user}})

Status: draf, menunggu "proceed" dari owner. Tidak mengubah keputusan DECISIONS yang ada; menambah satu fitur baru (toggle) dan
memakai sistem yang sudah ada: Notice Board (`p30:officialNotices`, pola `forecastCard`), baris toko berjadwal (`stallOpen`,
`D/shop.json` `day`/`from`/`to`), flu (`fluOn`), gossip (`stepGossip`), hasil event (`$eng.tally`, `$eng.vote`, `$ui.contest`),
`<now>` (`nowOf`) dan direktori Activities → Clubs (`p40:acClubs`). Teks berbahasa Inggris di dalam kotak adalah wording kartu.

## 1. Masalah sekarang

Usulan owner (2026-10-22): "club (gk semua tapi yg possible) ada kontribusi nyata diluar apakah user bagian dari club itu. untuk
saat ini hanya divination society yg punya kontribusi nyata (prediksi cuaca) sisanya hanya kumpulan list".

Betul: dari 32 club, hanya Divination Society yang mengubah sesuatu bagi semua orang (`wxForecast`, 75% benar, di Notice Board
07:00). Club olahraga dan panggung ikut menghitung medali Sports Day dan skor Showcase (`stepTally`), tapi itu hasil lomba, bukan
layanan. Sisanya hanya muncul sebagai teks happening (`cooking_club`, `gardening` …) yang tidak berdampak.

## 2. Aturan umum

- **Siapa pun mendapat manfaatnya.** Kerja club berjalan setiap minggu dari seed; {{user}} tidak perlu menjadi anggota.
- **Anggota mendapat peran, bukan hadiah baru.** Kalau {{user}} anggota club itu, `<now>` menulis satu baris pada harinya
  ("{{user}}'s club is …; they can lend a hand"). XP Field tetap dari Saturday club time yang sudah ada (`D/club_stats.json`), jadi
  tidak ada sumber XP baru dan batas mingguan tidak tersentuh.
- **Dihitung, tidak disimpan**, seperti forecast. Satu pengecualian: koran perlu mencatat rumor yang dicetak (`$eng.paper`).
- **Toggle baru** "Club work" (On/Off, bawaan On) di Settings → Features, grup Campus life. Off = semua baris di bawah hilang.
- **Direktori Clubs**: kartu club yang punya kerja mendapat satu baris "For the campus" (teks di §3), supaya daftar club tidak lagi
  sekadar daftar.

## 3. Kerja per club (tujuh club baru, Divination tetap)

Hanya club yang lorenya menyebut layanan untuk kampus dan punya sistem untuk disambungkan.

### 3.1 Academy Newspaper: terbitan Senin

Lore: ruang Newspaper di Club Rooms, Castor Moretti, cerita hantu yang laris, Caralynn memperebutkan slot siaran.

- Senin 07:00, kartu resmi di Notice Board (di samping forecast), dihitung dari data minggu lalu:
  1. **Hasil**: baris hasil event minggu lalu yang sudah dihitung engine (tally Sports Day/Showcase, vote Club Festival, Dorm
     Competition). Tidak ada event, baris ini hilang.
  2. **Headline**: rumor terbaru yang sudah sampai tahap campus di `stepGossip` (`pickOf` di antara yang sama barunya). Tidak ada,
     headline diambil dari agenda minggu ini.
  3. **Minggu ini**: event dan tenggat resmi tujuh hari ke depan (agenda yang sama dengan `officialNotices`).
  4. **Kolom hantu**: satu dari empat judul lore (Long Corridor, Third Stall, Night Student, Taken), bergilir per minggu.
- **Efek nyata**: rumor yang dicetak tidak bisa lagi `fizzle` dan umurnya bertambah 3 hari (`$eng.rum[r]`). Koran menyebarkan
  gosip, termasuk gosip tentang {{user}}; ini sejalan dengan "musuh lebih mudah dibuat daripada teman".
- `<now>` pada hari Senin–Rabu: "This week's Academy Newspaper leads with: …", supaya NPC bisa membicarakannya.

> **Academy Newspaper — Week N** · Results · Front page: … · This week: … · Ghost corner: "The Third Stall, part II"
> *"Printed on the Announcement Room's press. Theories are not news." · Academy Newspaper*

### 3.2 Medical Centre Volunteers: meja obat saat flu

Lore: Medical Centre Volunteers dibina Head Nurse; ambience "a volunteer offers {{user}} something (a remedy, water, a seat)".

- Selama hari flu (`fluOn` true), Medical Centre punya baris toko berjadwal: **Cold remedy**, 0 poin, 07:00–19:00, catatan "one each,
  from the Medical Centre Volunteers". Cold remedy (`D/crafts.json`) sekarang hanya bisa didapat dengan meracik sendiri.
- Kartu resmi di Notice Board selama flu: "Head colds are going round. The Medical Centre Volunteers hand out cold remedies at the
  Medical Centre until 19:00, one each."
- Penjualan Apothecary {{user}} tidak terpengaruh (batasnya ada di `stepProficiency`).

### 3.3 Cooking Club: roti Sabtu

Lore: happening `cooking_club` ("giving away the failures"), Nerys Silvarenne yang masakannya "either wonderful or inedible".

- Sabtu 15:00–17:00, Canteen, baris toko berjadwal. `roll100(seed, hari, 'bake')`:
  - 70%: **Cooking Club honey bread**, 3 poin, `use` stamina +15.
  - 30%: batch gagal, dibagikan gratis, tanpa efek (catatan "free, and you will see why").
- `<now>` Sabtu siang menyebut mana yang terjadi, supaya narasi Canteen cocok.

### 3.4 Brewing Club dan Alchemy Club: meja sisa ramuan

Lore: Potion Halls tempat keduanya; di Club Festival "Alchemy and Smithing sell their work".

- Sabtu 14:00–18:00, Potion Halls: ramuan sederhana dari `D/crafts.json` yang dijual murid, harga = `sale` × 1,5 (dibulatkan).
  Tiga baris yang berputar per minggu (`pickOf` dari ramuan tier simple berjenis drink), jadi isinya berubah tiap Sabtu.
- Barang yang tadinya hanya bisa diracik kini bisa dibeli, tapi lebih mahal dari harga jualnya; {{user}} tetap untung kalau meracik sendiri.

### 3.5 Gardening Club: herba di Greenwick's

Lore: Greenwick's "run with the Gardening Club"; Gardening Club menyiangi setiap hari di musim panas.

- Greenwick's mendapat baris **Foraged reagent**, 12 poin, musim Spring/Summer/Autumn, catatan "cut this week by the Gardening Club".
  Sekarang bahan ini hanya didapat dengan mencari sendiri; Common reagent bundle di Commissary 30 poin.
- Musim dingin barisnya tampil abu-abu (aturan musim toko yang sudah ada).

### 3.6 Groundskeeping: jalan bersalju dibersihkan

Lore: "Groundskeeping clears the paths of snow before the seven o'clock bell"; happening snow-clearing crew.

- Pagi setelah salju turun semalam (`wxDay` hari itu atau malam sebelumnya ada `snow`): jalan kaki di luar ruangan memakan waktu
  +50% sampai 07:00. Setelah 07:00 jalan utama kampus kembali normal; Hills, Forest dan Lake (jalan jauh) tetap +50% sampai sore.
- `<now>` pagi itu: "Snow overnight: Groundskeeping has the main paths clear; the far grounds are still deep."
- Ini satu-satunya kerja yang menambah biaya baru (lihat pertanyaan terbuka).

### 3.7 Festival Committee: program event

Lore: Festival Committee rapat di Council Chamber; menjalankan festival.

- Kartu resmi event yang sudah ada (`officialNotices`, 10 hari sebelum event) untuk event yang punya chances di
  `D/event_frame.json` kini ditandatangani "Festival Committee" dan memuat programnya: apa yang bisa dilakukan, di mana, jam berapa.
  Event lain tetap "Academy Administration".
- Hasilnya informasi nyata, seperti forecast: pemain tahu sebelum hari H apa yang bisa ia ikuti.

### 3.8 Divination Society (sudah ada)

Tidak berubah; hanya mendapat baris "For the campus" di direktori.

## 4. Layanan club: datang ke club untuk barang atau jasa khasnya

Usulan owner (2026-10-22): "smithing, tailoring, fishing, library assistant mungkin bukan secara publik tapi buat agar user tahu kalau
user bisa berkunjung ke club itu untuk dapat barang khas club itu, misal tailoring bisa melakukan custom tailoring daripada beli yg
sudah jadi di mall".

Bedanya dengan §3: hasil kerja di §3 datang sendiri ke semua orang, sedangkan layanan hanya didapat kalau {{user}} datang ke tempat
club pada jamnya. Keanggotaan tidak diperlukan.

### 4.1 Cara kerjanya (sistem yang ada)

- **Daftar layanan** ada di `data/club_work.json` (`services`): club, tempat, jam, harga, lama pengerjaan dan resep `D/crafts.json`
  yang menjadi dasarnya. Efek barang (warm, sun, stamina, heal) diambil dari resep itu, jadi tidak ada efek baru.
- **Pesan dan bayar** lewat `/Purchases` seperti di toko (`stepPurchases`, harga dari daftar layanan). Untuk barang pesanan, desain
  yang ditulis {{user}} (bahan, warna, potongan, ukiran) ikut masuk ke `Note` barang di Bag.
- **Pesanan** dicatat di `$eng.orders` (barang, desain, hari jadi, tempat ambil). Agenda menampilkan "Ready to collect at the
  Workshop" pada harinya; saat {{user}} datang ke tempat itu setelah barangnya jadi, engine memasukkannya ke Bag (`bagMove`).
- **Hasil kerja murid**: `roll100(seed, pesanan)` 15% "fine work" (tertulis di `Note`), 10% "uneven" (efeknya tetap jalan), sisanya biasa.
- **Anggota club** membayar setengah harga untuk layanan club-nya sendiri.

### 4.2 Supaya {{user}} tahu

- **Direktori Clubs**: kartu club mendapat bagian "Services" berisi jam, daftar dan harga.
- **Kartu tempat di Map**: baris "Club services: Tailoring Club, Saturday club time".
- **Chip "Services here"** di bracelet saat {{user}} berada di tempatnya pada jam layanan (seperti chip "Stalls here").
- **Price Guide (506)**: layanan club di tempat itu ikut terdaftar, jadi narrator memakai harga yang benar.
- **Kunjungan pertama**: saat {{user}} pertama kali masuk tempatnya pada jam layanan, `<now>` menulis satu baris, misalnya
  "The Tailoring Club takes orders here on Saturday afternoons: mending, alterations, made-to-measure."

### 4.3 Tailoring Club (Workshop, Saturday club time)

Tailor's Row di Mall menjual barang jadi (Formal dress coat 150, Fleece-lined boots 70, Tailoring alteration 40). Tailoring Club lebih
murah dan dibuat sesuai desain {{user}}, tapi harus menunggu.

| Layanan | Harga | Selesai | Dasar resep / efek |
|---|---|---|---|
| Mend damaged clothing | 5 | ditunggu, 30 menit | Mend clothes (menghapus `damaged`) |
| Alteration | 15 | ditunggu, 1 jam | mengganti `Note` pakaian di Bag |
| Made-to-measure, everyday | 30 | Sabtu depan | tanpa efek, bisa jadi hadiah |
| Made-to-measure, warm (coat, cloak, knitted set) | 50 | Sabtu depan | gear warm |
| Made-to-measure, summer | 40 | Sabtu depan | gear sun |
| Made-to-measure, formal (silk) | 90 | dua Sabtu lagi | kelas hadiah (Sky silk garment) |

### 4.4 Smithing Club (Workshop, Saturday club time)

Lore: Workshop "equipment repair"; Vera Pulsar, anggota paling gigih.

| Layanan | Harga | Selesai | Dasar resep |
|---|---|---|---|
| Repair a damaged item | 10 | sore itu juga | Repair damaged item |
| Hooks and nails | 8 | Sabtu depan | Hooks and nails |
| Balanced blade (ukiran sesuai pesanan) | 40 | Sabtu depan | Balanced blade |
| Small forged tool / forged fittings | 60 | Sabtu depan | Small forged tool, Forged fittings |

### 4.5 Fishing Club (Fishing House, Sabtu dan Minggu 06:00–08:00)

Lore: Fishing Club di dermaga saat fajar; Ottavio membinanya; ikan untuk dapur Canteen.

- **Smoked river fish**, 4 poin (Commissary 6). Ini item yang sudah ada dan disukai sebagian NPC.
- **Tamu di dermaga**: pinjam joran gratis dan ikut sesi fajar. Non-anggota boleh latihan "Fish the pond or the lake" di sana
  (sekarang hanya untuk anggota, `D/practice.json` `club`), satu kali seminggu. Nature XP tetap kena batas mingguan.

### 4.6 Library Assistants (Main Library, Senin–Jumat 16:00–19:00 dan Saturday club time)

Lore: Library Assistants bukan jabatan berbayar; Irene Chanare; dibina guru History tahun pertama; akses ke Archive.

- **Pinjam buku pelajaran**: gratis, satu buku sekaligus, 7 hari. Item di Bag: "Library book: <Subject>". Selama dipinjam, belajar
  mata pelajaran itu di tempat tenang di luar tempat belajar (kamar asrama, common room) dihitung setengah dari laju tempat belajar.
  Telat kembali: buku ditarik, tidak bisa pinjam 14 hari, dan pengingat muncul di Agenda.
- **Cari catatan Archive**: gratis, selesai besoknya. Para Assistant mencarikan bracket dan peringkat asrama tahun-tahun lalu
  (catatan publik di Archive, sesuai lore). Efeknya Fortune +5 di bout {{user}} pada Competition berikutnya, satu kali per event.

### 4.7 Klien mingguan: NPC datang minta layanan (kalau {{user}} anggota)

Usulan owner (2026-10-22): "sekali seminggu randomize kalau user salah satu dari club yg menyediakan service maka ada npc yg di
randomize akan ke club itu untuk minta service, dibuat chance bukan pasti terjadi sekali seminggu".

Polanya sama dengan NPC initiative (`stepInitiative`): satu undian per minggu lewat `rollTable` (`roll` untuk peluang, `pick` dan
`weight` untuk memilih NPC, `skip` untuk yang tidak bisa datang). Bedanya, klien boleh NPC yang belum dikenal {{user}} (Rank 0).
Ini cara baru bertemu orang.

- **Kapan**: sekali seminggu, peluang **40%**, hanya kalau {{user}} anggota salah satu club layanan (Tailoring, Smithing, Fishing,
  Library Assistants). Anggota dua club layanan tetap paling banyak satu klien seminggu, dan club-nya dipilih dengan `pickOf`.
  Hari dan jamnya diambil dari jam layanan club itu (`rollInt` di antara hari layanannya). Tidak terjadi saat libur, saat {{user}}
  pergi, atau saat lockdown (penjagaan sama dengan initiative).
- **Siapa**: murid roster yang sudah datang tahun itu (`ARRIVES`), ada di kampus (`npcOut`, `npcAwayIn`), bukan anggota club itu
  (`clubMembersNow`), dan Tension dengan {{user}} di bawah 70. Bobot: 1, +1 kalau sudah kenal {{user}} (Rank 1+), +2 kalau datanya
  cocok dengan layanan (`match` di `club_work.json`: field Weapon/Equipment untuk Smithing, haunt atau kesukaan di danau dan ikan
  untuk Fishing, Knowledge/ujian untuk Library, pakaian atau event formal untuk Tailoring).
- **Permintaannya**: templat per club di `club_work.json` (`asks`), diisi dari data NPC seperti FP11: `{thing}` dari `gift_prefs`,
  `{event}` dari kalender, `{weapon}` dari field Weapon, `{subject}` dari mata pelajaran tahunnya. Kombinasi templat dan isi yang sama
  tidak diulang untuk NPC yang sama dalam 20 pemakaian terakhir (mekanisme `used` yang sudah ada). Narrator memerankan NPC sesuai
  karakternya; templat hanya alasan datang, bukan cara bicara.
- **Kalau {{user}} ada di tempat** pada jamnya: `<now>` menulis
  "Club client: <NPC> comes to the <venue> wanting <ask>. {{user}} can take the job or leave it to another member."
  {{user}} mengerjakannya lewat Practice craft yang sudah ada (resep layanan itu, Fortune menentukan hasilnya). Pekerjaan yang selesai
  dihitung sebagai **satu help interaction** dengan NPC itu (jalur bond yang sama dengan favour yang ditepati), ditambah Craft XP dari
  Practice (batas mingguan tetap berlaku). Bayaran layanan masuk ke club, bukan ke {{user}}.
- **Hasil kerja**: sukses biasa, NPC puas. Hasil fine, NPC terkesan dan mungkin bercerita ke orang lain (narrator yang menentukan).
  Hasil weak atau mishap tidak menambah Tension otomatis; NPC bereaksi sesuai karakternya.
- **Kalau {{user}} tidak datang**: anggota lain yang mengerjakannya. Journal mencatat "<NPC> came to the Tailoring Club for <ask>;
  <member> took the job." Tidak ada hukuman; NPC itu hanya tercatat pernah datang.
- **Rekaman**: `$eng.client` = `{ week, club, id, day, ask, done }`, diganti tiap minggu. `$ui.clubwork.client` untuk `<now>`.

## 5. Club yang tetap tanpa kerja (dan alasannya)

- **Olahraga dan panggung** (Magic Duelling, Soccer, Running, Archery, Swimming, Gymnastics, Basketball, Music, Theatre): sudah
  berkontribusi lewat tally Sports Day/Showcase dan Competition.
- **Student Council**: sudah punya pemilu, vote dan rapat Sabtu.
- **Beast Handling, Warding Study**: lorenya menyebut layanan (menangkap makhluk lepas, rune hangat kolam yang rusak), tapi belum ada
  sistem untuk disambungkan. Masuk `FUTURE_PLANS.md` sebagai ide.
- **Tea, Card, Board Game, Drawing, Calligraphy, Specialized Magic, Camping**: club hobi; tidak ada layanan di lore.

## 6. Rencana kode (memakai sistem yang ada)

- `data/club_work.json` baru: per club, baris direktori, jenis kerja dan angkanya (jam, harga, persen bake, +50% salju, +3 hari rumor);
  `services` (§4) per club.
- Layanan (§4): `stepPurchases` membaca daftar layanan; `$eng.orders` dan pengambilannya di `stepBag`/`bagMove`; Agenda "Ready to
  collect"; buku pinjaman dibaca di hitungan menit belajar (`SP` di bagian study); gerbang `club` latihan memancing dibuka untuk
  sesi tamu; Fortune +5 sebagai modifier situasi; chip "Services here", Price Guide 506, kartu Map dan direktori.
- Klien mingguan (§4.7): di `stepClubWork`, `rollTable` dengan `skip`/`weight` seperti `stepInitiative`; templat `asks` dan
  pengisian `{thing}`/`{event}` memakai ulang kode FP11 (`INIT_ASKS`, `I.used`); help interaction lewat jalur favour (`stepPromises`).
  Tes tambahan: peluang mendekati 40% dalam 200 minggu, tidak pernah dua klien seminggu, bukan anggota club, Tension 70+ dilewati.
- `data/shop.json`: baris berjadwal tanpa `ev` (`club`, `day`, `from`, `to`, opsional `when: "flu"`); `stallOpen` menerima `club`
  dan syarat `flu`. Meja ramuan dibangkitkan `tools/gen_engine.py` dari `D/crafts.json`.
- `engine.template.js`: `stepGossip` membaca `$eng.paper`; langkah kecil `stepClubWork` (setelah `stepGossip`) memilih rumor koran
  Senin, bake Sabtu dan menulis `$ui.clubwork` untuk Notice Board dan `<now>`; biaya jalan salju di hitungan jalan kaki kampus.
- `30_notebook.js`: kartu Newspaper dan Volunteers di samping `forecastCard`; tanda tangan Festival Committee di `officialNotices`.
- `40_activities.js` `acClubs`: baris "For the campus".
- `data/features.json`: toggle `clubwork`. `docs/FEATURES.md`, `INDEX.md` diperbarui.
- Tes: tiap kerja muncul pada harinya dan hilang dengan toggle Off; rumor yang dicetak tidak fizzle; hasil deterministik untuk seed
  yang sama; save 1.88.1 termuat. Tidak perlu migrasi (`$eng.paper` boleh kosong).

## Pertanyaan terbuka

1. **Salju (§3.6)** menambah biaya jalan yang sekarang tidak ada, supaya kerja Groundskeeping terasa. Kalau Anda tidak mau biaya
   baru, Groundskeeping cukup jadi baris `<now>` dan direktori. Kalau Anda diam, +50% yang dipakai.

Hal lain sudah saya putuskan: harga (bake 3, ramuan `sale` × 1,5, herba 12, obat flu gratis, tabel §4), koran juga mencetak rumor
tentang {{user}}, anggota membayar setengah harga untuk layanan club-nya sendiri, klien mingguan 40% dan tanpa bayaran untuk {{user}}, toggle bawaan On (layanan §4 ikut toggle yang sama).
