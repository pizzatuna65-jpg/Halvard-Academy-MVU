# DRAFT: Trust, dibuat sekompleks dan seberguna Tension

Status: **APPROVED oleh owner (2026-09-25), diterapkan di card v1.4.3.** Semua `[?]` disetujui seperti usulan; lihat "Keputusan owner" di akhir. Catatan dalam Bahasa Indonesia; teks yang masuk ke card (untuk narator dan UI) dalam Bahasa Inggris. Keputusan terbuka ditandai `[?]` dan dikumpulkan di bagian akhir.

## Masalah sekarang (v1.4.2)

- Trust 0–100 (default 50) hanya angka yang diubah narator. Aturannya cuma satu kalimat di rule 502: "trust follows reliability and drops with betrayal … betrayal Trust −15–30".
- **Tidak ada panduan cara naik**, jadi naik-turunnya tergantung selera narator.
- **Tidak ada efek mekanis.** NPC dengan Trust 10 dan Trust 90 sama saja di mata engine: XP, bond event, perk dan hadiah tidak berubah.
- Tidak ada band, kategori NPC, pemulihan, atau baris di `<now>`. Satu-satunya kegunaannya sekarang adalah warna garis kamu di Connections (1.4.2).

## Ide inti: Trust ≠ Rank ≠ Tension

Tiga angka, tiga arti yang berbeda:

| | Artinya | Naik lewat | Turun lewat |
|---|---|---|---|
| **Rank** | seberapa **dekat** | waktu bersama (XP, bond event) | Tension 100 |
| **Tension** | seberapa **panas konflik** sekarang | pelanggaran | waktu, maaf, pertarungan |
| **Trust** | seberapa yakin mereka bahwa {{user}} **bisa diandalkan** | janji ditepati, rahasia dijaga, dibela | janji dilanggar, rahasia bocor, pengkhianatan |

Karena itu kombinasinya bermakna:
- Rank tinggi + Trust rendah = teman dekat yang pernah dikhianati: masih sayang, tapi tidak lagi mau ambil risiko.
- Trust tinggi + Tension tinggi = rival yang saling menghormati: bertengkar terus, tapi tahu {{user}} tidak akan menusuk dari belakang.
- Rank rendah + Trust tinggi = kenalan yang sudah melihat {{user}} menepati janji; mereka membuka diri lebih cepat.

Jadi fungsi Trust: **menentukan apa yang berani NPC berikan** (rahasia, risiko, perk), sedangkan Rank menentukan seberapa dekat.

Sama seperti Tension, ada dua lapis:
1. **Band yang sama untuk semua NPC**: efek mekanis, dijalankan engine.
2. **Kategori NPC**: seberapa mudah mereka percaya dan memaafkan, dan bagaimana ketidakpercayaan itu dimainkan (teks untuk narator). Beberapa NPC punya **override** pribadi.

---

## Lapis 1: Band dan efek mekanis (semua NPC)

| Trust | Band | Efek engine (usulan) |
|---|---|---|
| 0–14 | **Betrayed** | Tidak menceritakan apa pun yang baru (share berhenti). XP bond dipotong setengah. Perk Rank 6+ dan benefit Rank 10 **ditangguhkan**. Tension naik ×1.5. |
| 15–34 | **Doubtful** | Share −1 rank. Perk Rank 6+ ditangguhkan. Bond event ke Rank 7 ke atas **ditahan**. |
| 35–64 | **Neutral** | Tidak ada efek (titik awal kebanyakan NPC). |
| 65–84 | **Trusting** | Share +1 rank. Permintaan maaf meredakan Tension ×1.5. |
| 85–100 | **Confidant** | Share +2 rank, dan hal "nyata" (tujuan, pandangan tentang orang lain, masa lalu) keluar satu rank lebih awal. Kenaikan Tension karena hal kecil (sindiran, ucapan tajam) ×0.5; kekerasan dan pengkhianatan tetap penuh. |

### Syarat Trust untuk perk dan bond event (inti "berguna")

Perk rank sekarang (bond_rules.json) otomatis aktif begitu rank tercapai. Usulan: perk yang **berisiko bagi NPC** butuh Trust.

| Rank | Perk | Syarat Trust (usulan) |
|---|---|---|
| 1–5 | menyapa, menerima ajakan, mencari {{user}}, sparring/tim, berbagi tujuan | tidak ada |
| 6 | memperkenalkan ke teman; **menjaga rahasia {{user}}** | ≥ 35 |
| 7 | **mengambil risiko nyata**: menutupi, meminjamkan poin, membela di depan staf | ≥ 50 |
| 8 | ikatan terdekat (best friend, romance, sworn rival) | ≥ 50 untuk best friend dan romance; sworn rival tanpa syarat `[?]` |
| 9 | bertindak untuk {{user}} tanpa diminta; rahasianya mulai muncul | ≥ 65 |
| 10 | rela berkorban; benefit Rank 10 aktif | ≥ 65; benefit ditangguhkan kalau turun ke Doubtful |

- **Bond event** ke rank itu ditahan kalau Trust di bawah syaratnya (bar tetap bisa penuh, event muncul begitu Trust cukup), sama seperti Tension 70+ menahan event.
- Perk yang sudah didapat **tidak hilang**, hanya ditangguhkan selama Trust di bawah syarat. Rank tidak pernah turun karena Trust (itu tugas Tension).
- Hadiah Rank 5 (gift) tidak terpengaruh, karena itu barang yang sudah diberikan.

### Efek silang dengan Tension (supaya keduanya saling terkait)

- Confidant: hal kecil (+3–5, +10–15) naik setengah. Kekerasan (+20–30) dan pengkhianatan tetap penuh.
- Betrayed: semua kenaikan Tension ×1.5 ("apa pun yang {{user}} lakukan dibaca dengan curiga").
- Permintaan maaf (mekanik 1.4.0): Trusting dan Confidant ×1.5; Doubtful ×0.5; Betrayed tidak meredakan apa pun.

### Garis di Connections (1.4.2)

Ambang `you_line` disamakan dengan band: Doubtful dan Betrayed jadi garis **wary** dari mereka ke kamu; friends butuh Rank 5+ dan Trusting. Band baru juga ditulis saat garis diklik.

---

## Cara Trust naik dan turun

Prinsip owner "lebih mudah membuat musuh daripada teman" dipakai persis seperti di Tension: **kenaikan dibatasi dan lambat, penurunan tidak dibatasi.**

### Naik: engine yang menghitung, narator hanya melaporkan

Narator **tidak lagi menaikkan Trust sendiri**. Ia melaporkan perbuatannya sebagai interaksi, dan engine menambah Trust sesuai kategori NPC:

| Interaksi (baru) | Kapan | Trust (dasar) |
|---|---|---|
| `{"With": "<nama>", "Kind": "keep"}` | {{user}} menepati janji atau datang tepat waktu seperti dijanjikan | +4 |
| `{"With": "<nama>", "Kind": "secret"}` | {{user}} menjaga rahasia mereka ketika ada godaan atau tekanan untuk membocorkannya | +6 |
| `{"With": "<nama>", "Kind": "defend"}` | {{user}} membela mereka di depan orang lain (`"Public": true` kalau di depan banyak orang: ×1.5) | +5 |
| `{"With": "<nama>", "Kind": "confide"}` | {{user}} menceritakan rahasianya sendiri kepada mereka | +3 |
| `help` (sudah ada) | bantuan nyata | +2 |
| bond event (rank naik) | otomatis | +3 |

- **Batas mingguan:** maksimal **+8 Trust per NPC per minggu** dari semua sumber di atas (bond event tidak dihitung). Dari 50 ke 85 (Confidant) butuh paling cepat sekitar 5 minggu untuk NPC Normal; lebih lama untuk Guarded dan Closed. `[?]`
- Satu jenis interaksi per NPC per hari yang dihitung.

### Turun: narator menulis langsung, tanpa batas

Tetap seperti sekarang (narator menurunkan Trust dalam balasan yang sama), dengan tabel ukuran yang lebih jelas di rule 502:

| Perbuatan | Trust |
|---|---|
| terlambat atau lupa hal kecil yang dijanjikan | −3–5 |
| janji penting dilanggar; berbohong dan ketahuan | −10–15 |
| rahasia mereka dibocorkan; mempermalukan mereka dengan hal yang diceritakan secara pribadi | −20 |
| pengkhianatan (melaporkan mereka, berpihak ke musuh mereka, menjual mereka) | −25–40 |

- Beberapa pelanggaran dalam satu balasan dijumlah, tanpa batas harian.
- Engine mengalikan penurunan sesuai kategori (lihat di bawah).
- **Kabar menyebar** `[?]`: pengkhianatan (−20 atau lebih) dalam satu kali membuat **teman-teman NPC itu** (garis Friends di Connections) kehilangan −5 Trust, sekali. Inilah "biaya" sosialnya.

### Pemulihan pelan

- Trust **di bawah 35** perlahan pulih ke 35 kalau seminggu tidak ada pelanggaran baru, sesuai kategori (lihat di bawah). Di atas 35 tidak ada pemulihan otomatis: harus diperoleh.
- Trust **tidak pernah turun sendiri** karena tidak bertemu (itu urusan Rank dan XP).

---

## Lapis 2: Kategori Trust (4), memakai data openness yang sudah ada

`data/bond_openness.json` sudah membagi NPC menurut seberapa mudah mereka bicara tentang diri sendiri (open, normal, guarded, closed), dan itu disusun dari Personality di lorebook. Usulan: kategori Trust memakai pembagian yang sama, supaya tidak ada daftar kedua yang bisa bertentangan.

| Kategori | Trust awal | Naik | Turun | Pulih (di bawah 35) | NPC (bond) |
|---|---|---|---|---|---|
| **Open** | 60 | ×1.5 | ×1 | +3/minggu | Trixie, Etnie, Percival, Ruby, Bobby, Althair, Layla, Saffi, Vera, Tilly, Dante, Vallie, Caralynn, Aiden, Florian |
| **Normal** | 50 | ×1 | ×1 | +2/minggu | Alyssa, Caspian, Ezrel, Gareth, Kuroo, Milena, Royhan |
| **Guarded** | 40 | ×0.75 | ×1.25 | +1/minggu | Irene, Idris, Zara, Lenna, Castor, Sophia, Yvette, Gavlan, Rei, Tristan, Baelin, Kanae |
| **Closed** | 30 | ×0.5 | ×1.5 | tidak pulih sendiri | Krieg, Ottavio, Mimosa, Caine |

- Trust awal hanya untuk bond **baru**; save yang sudah berjalan tidak diubah.
- Closed mulai di 30 (Doubtful): mereka memang tidak percaya siapa pun di awal, jadi perk Rank 6+ butuh usaha nyata.

### Teks per band untuk narator

Hanya band yang ekstrem yang ditulis di `<now>` (supaya hemat token): Betrayed, Doubtful, Confidant.

**Open**
- Doubtful: "Still friendly on the surface, but checks what {{user}} says against others and no longer shares anything important."
- Betrayed: "Openly hurt and bewildered; tells friends what {{user}} did, because they cannot understand it."
- Confidant: "Tells {{user}} everything, often too much; takes {{user}}'s word over anyone's."
- Never: holds a grudge in secret or plots against {{user}}.

**Normal**
- Doubtful: "Polite but careful: keeps plans vague, asks for things in writing, does not lend or cover."
- Betrayed: "Cold and formal; answers only what they must and keeps their distance."
- Confidant: "Relies on {{user}} and says so; asks {{user}}'s opinion before anyone else's."
- Never: pretends nothing happened.

**Guarded**
- Doubtful: "Says nothing personal; watches {{user}}'s hands, not {{user}}'s face; tests {{user}} with small things."
- Betrayed: "Closes completely: {{user}} becomes one more person they were right not to trust."
- Confidant: "Lets the guard down only with {{user}}; a rare, quiet honesty that others never see."
- Never: gives a second chance cheaply.

**Closed**
- Doubtful: "Assumes {{user}} wants something; every kindness is weighed for its price."
- Betrayed: "Files {{user}} as a threat and acts accordingly, within their position and nature."
- Confidant: "Treats {{user}} as the one exception to a lifelong rule; would deny it if asked."
- Never: says out loud that they trust {{user}}.

Contoh baris di `<now>`: `Irene (Trust 22, doubtful; guarded): says nothing personal; watches {{user}}'s hands, not {{user}}'s face; tests {{user}} with small things. Will not keep {{user}}'s secrets or take risks for them yet.`

---

## Override pribadi (usulan, semua `[?]`)

- **Etnie:** ia tidak bisa berhenti percaya pada "adiknya". Trust-nya tidak pernah turun di bawah 50; setiap penurunan Trust yang terpotong karena batas itu diubah jadi **Tension** (terluka, bukan curiga). Perk-nya tidak pernah ditangguhkan.
- **Kanae:** Trust-nya tampil normal, tetapi dari sisi Plan ia justru **naik ×2 ketika {{user}} menjauh dari orang lain demi dia** (menolak ajakan orang lain, bertengkar dengan teman), dan tidak pernah turun ke Betrayed selama Plan masih berjalan. Setelah Plan terungkap, ia menjadi Guarded biasa.
- **Althair:** tidak percaya siapa pun, dan tidak membutuhkannya: Trust-nya terkunci di 50, dan perk-nya tidak butuh Trust. Pengkhianatan terhadapnya jadi bond XP, seperti Tension-nya. Hiburan tetap hiburan.
- **Ezrel:** apatis; perubahan Trust setengah dari biasa, ke dua arah.
- **Caine:** membenci mage. Kalau {{user}} mage (hampir selalu), Trust-nya **dibatasi di 64** (tidak pernah Trusting) sampai rahasia Caine terungkap dan {{user}} tetap bersikap sama padanya.
- **Krieg:** kalau {{user}} punya hidden magic dan Krieg mengetahuinya, Trust langsung jatuh ke 0 (engine), dan itu memicu model Krieg B yang sudah ada.

---

## Rancangan teknis (ringkas)

- `data/trust.json` (baru, single source seperti `tension.json`): `bands` (batas, nama, efek), `perk_gates` (rank → Trust minimum), `kinds` (interaksi dan Trust dasarnya), `weekly_cap`, `categories` (awal, pengali naik/turun, pemulihan, teks per band, "never"), `overrides`, dan `spread` (efek "kabar menyebar").
- Kategori diambil dari `bond_openness.json`, tidak ada daftar NPC kedua.
- **Engine:**
  - interaksi `keep`, `secret`, `defend`, `confide`: Trust naik sesuai kategori dan batas mingguan
  - penurunan dari narator dikalikan kategori
  - pemulihan mingguan di bawah 35
  - syarat perk dan penahanan bond event
  - potongan XP di Betrayed
  - efek silang dengan Tension dan permintaan maaf
  - override Etnie, Althair, Ezrel, Caine, Krieg
- **Rule 502:** tabel penurunan baru; "never raise Trust yourself: report the deed as an interaction"; jenis interaksi baru di baris Interactions.
- **505 (`<now>`):** satu baris per NPC hadir dengan band Betrayed, Doubtful atau Confidant; ditambah perk yang ditangguhkan ("will not keep {{user}}'s secrets yet").
- **UI:**
  - nama band di bar Trust ("Trust 72 · Trusting")
  - di dossier, perk yang ditangguhkan diberi tanda dan syaratnya ("Needs Trust 50")
  - bond event yang tertahan diberi hint seperti Tension
  - ambang garis Connections disamakan dengan band
- **Perkiraan token:** +25–40 per NPC hadir di band ekstrem; 0 kalau semua Neutral atau Trusting.
- **Tes:** suite baru seperti `test_tension_v138.cjs`, plus stress test setahun (`sim_year`) untuk memastikan Trust tidak bisa di-farm.

## Cek terhadap prinsip desain

- **Tanpa ending:** Betrayed bisa dipulihkan (pemulihan ke 35, lalu diperoleh kembali); rank tidak pernah turun karena Trust.
- **Kebebasan:** pemain boleh mengkhianati siapa pun; akibatnya sesuai karakter NPC (Open terluka dan bercerita, Closed menganggapnya ancaman).
- **Berguna, bukan memento:** Trust membuka perk yang paling berharga (menjaga rahasia, mengambil risiko, benefit Rank 10), mempercepat informasi, dan meredam Tension.
- **Anti-grind:** batas +8 per minggu, satu jenis interaksi per hari, pengali kategori.
- **Mudah membuat musuh:** penurunan tanpa batas, pengkhianatan menyebar ke teman.
- **NPC tetap sesuai karakter:** kategori dan override, dan setiap kategori punya "Never".

---

## Keputusan terbuka

1. `[?]` **Nama dan batas band:** Betrayed 0–14, Doubtful 15–34, Neutral 35–64, Trusting 65–84, Confidant 85–100. Oke?
2. `[?]` **Syarat perk:** Rank 6 ≥ 35, Rank 7 ≥ 50, Rank 8 ≥ 50 (best friend/romance), Rank 9–10 ≥ 65. Terlalu ketat atau terlalu longgar?
3. `[?]` **Sworn rival di Rank 8** tanpa syarat Trust (rival tidak perlu percaya)?
4. `[?]` **Kategori dari openness:** pakai pembagian open/normal/guarded/closed yang sudah ada, atau buat pembagian Trust sendiri?
5. `[?]` **Trust awal per kategori** (60/50/40/30), hanya untuk bond baru?
6. `[?]` **Jenis interaksi baru** (`keep`, `secret`, `defend`, `confide`) dan angkanya. Ada yang kurang, misalnya "meminjamkan sesuatu dan mengembalikannya"?
7. `[?]` **Batas mingguan +8 Trust per NPC.**
8. `[?]` **Kabar menyebar:** pengkhianatan −20 atau lebih membuat teman-teman NPC itu −5 Trust. Setuju? Hanya teman, atau juga dorm-mate?
9. `[?]` **Efek silang dengan Tension:** Confidant meredam hal kecil ×0.5, Betrayed memperbesar ×1.5, maaf dipengaruhi Trust.
10. `[?]` **Betrayed memotong XP setengah** (sama seperti Strained di Tension), atau cukup share berhenti dan perk ditangguhkan?
11. `[?]` **Override:** Etnie (lantai 50, sisanya jadi Tension), Kanae (naik ×2 saat {{user}} menjauh dari orang lain), Althair (terkunci 50, pengkhianatan jadi XP), Ezrel (×0.5), Caine (maksimal 64 selama {{user}} mage), Krieg (0 kalau hidden magic ketahuan). Mana yang disetujui atau diubah?
12. `[?]` **Janji lewat Hooks:** rule 502 sudah punya Hooks `Kind: "promise"` untuk janji NPC. Perlu diperluas ke janji {{user}} supaya engine bisa mendeteksi janji yang lewat Due tanpa ditepati (Trust −5 otomatis)? Lebih akurat, tapi menambah beban narator.

---

## Keputusan owner (2026-09-25): final

1. **Semua usulan disetujui** apa adanya (band, syarat perk, sworn rival tanpa syarat, kategori dari openness, Trust awal, jenis interaksi, batas +8 per minggu, kabar menyebar ke garis Friends, efek silang dengan Tension, Betrayed memotong XP, semua override). Poin 12 (janji lewat Hooks) tidak diterapkan: tidak ada perubahan pada Hooks.
2. **Tambahan owner: Ottavio.** Kalau {{user}} anggota Sky Dormitory (dorm yang ia pimpin), bond, Tension dan Trust dengan Ottavio semuanya lebih mudah:
   - bond XP ×1.5
   - Tension naik ×0.5, reda harian ×2, permintaan maaf ×2
   - Trust memakai kategori Open (awal 60, naik ×1.5, pulih +3 per minggu) dan bukan Closed
   - Canon pendukung: ia berdiri di gerbang Dovecote setiap hari selama Idris, murid Sky, ditahan di sana.
   - Diterapkan sebagai `dorm_head` di `data/trust.json`, jadi Dorm Head lain bisa diberi aturan yang sama nanti.
3. **Detail penerapan yang saya tentukan** (tolong cek):
   - Kanae: jenis interaksi `choose` ({{user}} memilih dia dan menjauh dari orang lain, +3 ×2) hanya diberitahukan ke narator lewat `<now>` saat Kanae hadir. Setelah rahasianya (Plan atau apa pun tentang Kanae) terungkap, ia menjadi Guarded biasa.
   - Krieg: Trust jatuh ke 0 saat Dove attention mencapai tahap **Exposed** (80+) dan {{user}} punya hidden magic.
   - Caine: batas 64 terangkat begitu salah satu rahasia Caine terungkap.
   - Narator yang mencoba menaikkan Trust langsung dibatalkan engine, termasuk saat membuat bond baru (Trust awal selalu dari kategori; kesan pertama yang lebih buruk tetap dipakai).

