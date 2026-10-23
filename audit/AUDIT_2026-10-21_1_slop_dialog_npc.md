# Audit 2026-10-21: dialog dan perilaku NPC yang klise (slop) di ekosistem Eldrasil

Permintaan owner: baca perpustakaan riset preset (`D:/Claude Project/Sillytavern Preset/Perpustakaan`), riset lanjutan di internet dan
Reddit tentang dialog dan perilaku NPC yang klise di SillyTavern, lalu nilai apakah ekosistem (kartu + RF 2.2.1.3 + VectFox) sudah
menyelesaikannya dan apa yang masih bisa diperbaiki. Tidak ada kode yang diubah. File ini tidak di-commit (aturan folder `audit/`).

## 1. Ringkasan

Sebagian besar pola yang dikeluhkan komunitas sudah punya pemilik di ekosistem ini, dan beberapa ditangani lebih kuat daripada di
preset mana pun yang diaudit perpustakaan: suara per NPC ditulis sebagai perilaku (343 adegan contoh untuk 59 NPC, "Never sounds
like", "Don't flatten", tahap per rank), batas pengetahuan dijaga state, dan kejadian dunia diputuskan engine yang deterministik.
Pengukuran di chat kampanye lama memperlihatkan slop tingkat kalimat sudah rendah (negasi kontrastif 0,13 per 1.000 kata, nol nama
stok, nol salinan kalimat contoh). Celah yang tersisa ada di tingkat perilaku, dan dua di antaranya terukur: NPC menyebut barang
bawaannya hampir di setiap balasan (sketchbook Zara di 11 dari 14 balasan, padahal kartunya menulis "a sketchbook she hides"), dan NPC
menutup gilirannya dengan pertanyaan menu "X atau Y?" (10 dari 38 balasan). Celah terbesar justru alat ukur: `audit_chat.py`
mengukur drift tokoh, tetapi belum mengukur slop dialog sama sekali.

Batas data: chat yang cukup panjang untuk diukur dimainkan sekitar card 1.35 dengan preset lama (RF 2.2 + ±90 edit). Chat live di
1.77.0 baru dua balasan. Semua angka di §4 adalah baseline lama, bukan nilai ekosistem sekarang.

## 2. Bahan yang dibaca

**Perpustakaan.** Buku 05 (slop narasi, rubrik 12 kategori), Buku 06 (agensi, desain karakter, NPC dan konflik, tempo), Buku 19
(Realistic Frankenstein 2.2.1.3), Buku 02 §D (profil perilaku Gemini), indeks dan daftar sumber Buku 09. Riset Reddit perpustakaan
berhenti 14 Oktober 2026 (thread sampai r/1x4thq3).

**Riset baru (internet).** Reddit tidak bisa dibuka alat saya: pencarian web dan browser bawaan sama-sama memblokir reddit.com. Yang
bisa dijangkau hanya snapshot mirror (reddit.sentinel-team.org, Februari sampai April 2026). Riset diperluas ke makalah, forum
praktisi, dan ekstensi SillyTavern:

| Sumber | Temuan yang relevan untuk NPC | Keyakinan |
|---|---|---|
| *The Chameleon's Limit* (arXiv 2604.24698) | "Persona collapse": model yang diberi persona rinci (26 atribut) hanya mempertahankan sifat paling stereotip, dan populasi persona menggumpal. Fidelity tinggi tidak menyembuhkannya; fine-tuning persona malah mempersempit. Makalah tidak menguji format prompt | Riset (model terbuka, bukan Gemini) |
| *Attractor States Emerge in Multi-Turn LLM Conversations* (arXiv 2606.30571) | Percakapan panjang mengendap ke pola gaya khas model, lepas dari topik. Diuji pada debat dua model, bukan roleplay | Riset, transfer ke RP adalah inferensi |
| Laporan praktisi, forum OpenAI ("LLM Personas for Arbitrary Scenarios") | Multi-character collapse: tokoh-tokoh berubah menjadi satu asisten dengan nama berbeda. Uji yang berguna: setiap tokoh sampai ke kesimpulan lewat jalan berbeda, walau kesimpulannya sama. "Distributed sycophancy": beberapa tokoh sekaligus menyetujui apa yang ingin didengar user. Tokoh yang terlalu stabil menjadi pemutar ulang kalimat contoh | Sedang (satu orang, uji sendiri) |
| *Measuring AI "Slop" in Text* (arXiv 2509.19163) | Penilaian slop biner bersifat subjektif; metode otomatis yang andal belum ada | Riset |
| EQ-Bench Slop Score (reimplementasi SlopScoreTool) | Skor dari tiga hitungan: laju kata slop (60%), pola kontras "not X, but Y" (25%), trigram slop (15%) | Sedang |
| WH Editor (github.com/Coz-rp/SillyTavern-WH-Editor) | Pemeriksaan berbasis aturan setelah tiap balasan (frasa stok, "not X, but Y", dialog terpotong, gema ucapan user, frasa berulang dari balasan terdekat), lalu model murah menulis ulang hanya baris yang ditandai; tulisan ulang yang menambah isi ditolak; tombol kembali ke versi asli | Sedang (dokumentasi, belum dibaca kodenya) |
| Chat Repetition Refactor (github.com/THEJACKALS) | Memindai rangkaian kata berulang (4, 5, 10+ kata) di balasan karakter; pemindaian tidak mengubah chat; perbaikan hanya pada kemunculan yang dipilih, dengan undo | Sedang (dokumentasi) |
| Slop Guard (github.com/inathael-58) | Daftar larangan per model yang disuntikkan di depth tertentu, plus popup untuk mengganti kemunculan di pesan tersimpan | Lemah untuk tujuan ini (daftar larangan, lihat Buku 05 §2) |
| Snapshot r/SillyTavernAI soal positivity bias | Tidak ada perbaikan tunggal; pengguna menyebut pilihan model, instruksi kartu yang eksplisit, dan preset ramping | Lemah |

Temuan baru ini sejalan dengan perpustakaan. Persona collapse memberi dasar riset untuk Buku 06 §2 ("perilaku, bukan label") dan
Buku 02 §D ("polarisasi karakter", "nuansa kartu diratakan menjadi tipe"). Attractor state menguatkan Buku 05 butir 4: riwayat
adalah guru slop paling kuat.

## 3. Yang sudah diselesaikan ekosistem

| Pola klise NPC (perpustakaan + riset baru) | Pemilik di ekosistem | Status |
|---|---|---|
| Suara diratakan menjadi tipe; persona collapse | Kartu: `data/npc_canon.json` `voice` (adegan contoh sebagai perilaku, "Never sounds like", "Don't flatten" yang menamai stereotip yang harus dihindari, tahap per rank, Anchor, Change type). Preset: Card Fidelity, NPC Voice Cosmos | Kuat. "Don't flatten" Zara ("her shyness into having no opinions… her low self-esteem into constant apologising") persis melawan mekanisme yang dijelaskan makalah persona collapse |
| NPC tahu hal yang tidak mungkin ia tahu | Kartu: Knows, Known_by, field dossier terkunci per rank, `<narrator_only>`, 510 "nothing they could not know". Preset: Anti-Omniscient. Alat: cek `secret` dan `locked` di `audit_chat.py` | Kuat |
| Positivity bias, NPC yang selalu setuju, kepercayaan instan, sycophancy beramai-ramai | Engine: Trust hanya dari perbuatan dengan cap mingguan, Tension tidak pernah di-cap, Moods, Ties. Preset: NPC Instincts ("judgment refuses at least as often as it accepts"), abolish_yesman, Personality Independence | Kuat |
| Eskalasi mendadak, "seluruh kota lewat di depan pintu" | Engine: kejadian berseed, initiative (satu sehari, dua seminggu), Fortune hanya untuk percobaan penting. Preset: Ordinary Turns (langkah 0, 7, 7a) | Kuat; lebih kuat dari pola "roll the dice" Buku 06 §5 karena keacakannya di engine |
| Nama stok (Elara, Kael, Voss, Thorne…) | 71 NPC canon, catatan Extras, HQ NPC Genesis | Terukur nol di dua chat |
| NPC berputar di sekitar user | Preset: Main "not the protagonist", Attentional Salience, Ordinary Turns "small stays small". Kartu: routines, whereabouts | Ada; belum diukur |
| Register terapis, NPC menginterogasi | Preset: uji payoff pertanyaan NPC + cap satu tanda tanya (ON sejak 1.68.0) | Ada; belum diukur di 1.68+ |
| Negasi kontrastif, aforisme penutup, presisi palsu | Preset: pasangan killswitch (depth 4) + gate (depth 0); Scene Engine "handoff, never a quotable line"; Scene Detail | Terukur rendah |
| Drift tokoh di chat panjang | Kartu: 510 "Earlier messages are not a character licence"; audit drift `audit_chat.py` | Kuat |
| Gema ucapan user oleh NPC | Preset: Embellish (pilihan owner) menulis ulang aksi {{user}}; NPC sendiri tidak menggemakan | Terukur nol untuk dialog NPC |

## 4. Pengukuran di chat nyata

Skrip prototipe (offline, tanpa token prompt):
`C:\Users\seora\AppData\Local\Temp\claude\D--Halvard-Academy-MVU-main\3768f639-cea8-4947-a091-10e75e81ba7c\scratchpad\slop_scan.py`.
Baris {{user}} hasil Embellish (paragraf yang dibuka "You") dikeluarkan dari hitungan dialog NPC.

Chat utama: `Eldrasil — Halvard Academy - 2026-10-05@18h46m57s746ms imported.jsonl` (38 balasan, 15.421 kata, rata-rata 405 kata,
satu pagi Entrance Day; tag warna preset lama `<orchid>`, jadi dimainkan sebelum 1.37.0).

| Ukuran | Hasil | Bacaan |
|---|---|---|
| Negasi kontrastif | 2 (0,13 per 1.000 kata) | Rendah; keduanya pemakaian wajar |
| Balasan dengan pertanyaan NPC | 17 (44%); dua tanda tanya atau lebih: 2 (5%) | Cap satu tanda tanya kurang lebih dipatuhi |
| Pertanyaan menu "X, atau Y?" | 10 balasan (26%); 10 dari 17 balasan yang memuat pertanyaan | Pola paling sering; lihat U3 |
| NPC menggemakan kata pemain (4-gram) | 0 | Bersih |
| Salinan 5-gram dari adegan contoh `npc_canon` | 0 | Bersih |
| Nama stok | 0 | Bersih |
| Kosakata stok per 1.000 kata | timber 0,78; ledger 0,45; sisanya ≤ 0,13 | Rendah |
| Isyarat tubuh per 1.000 kata | chuckle 0,32; leans in 0,32; tilts her head 0,26; smirk 0,19 | Rendah; satu templat "she says, tilting her chin toward" muncul 3 kali |
| Barang bawaan per kemunculan NPC | Zara: sketchbook 11 dari 14, collar 9 dari 14. Ruby: mug 12 dari 17, Macha 9 dari 17. Percival: "Squire" 6 dari 13 | Tinggi; lihat U2 |

Contoh pertanyaan menu dari chat: "Are you planning to stay out here in the freeze, or are you going to poke around the cloisters
before the doors open?", "Shall we wander back together, or do you want to take one last look…?", "Do you have a big family waiting
back in your village, or did you leave a whole pack of cousins behind?".

Chat `Halvard Academy - 2026-09-16…` (143 balasan, card jauh lebih lama) memberi angka serupa untuk negasi kontrastif (0,07 per 1.000
kata) dan pertanyaan NPC (37%), tetapi kosakatanya tercampur blok status di dalam prosa, jadi tidak dipakai sebagai baseline.

## 5. Celah dan usulan

Urutan menurut prioritas. Tidak ada yang dibangun sebelum owner setuju.

**U1 (P1). Ukur slop dialog di `audit_chat.py`.** Alat yang sekarang menghitung drift (pronoun, name, present, secret, locked, voice),
belum menghitung satu pun pola di §4. Usulan: mode `--prose` di alat yang sama (bukan alat baru, sesuai aturan memakai sistem yang
ada), per jendela 25 pesan seperti cek drift: pertanyaan NPC dan pertanyaan menu per tokoh, barang bawaan per kemunculan (kata kunci
dari `carries`), salinan adegan contoh, 6-gram yang berulang di tiga balasan atau lebih, negasi kontrastif, kosakata stok dari Buku 05
§1, templat isyarat tubuh. Biaya prompt nol. Alasan: Buku 05 menyarankan sasaran dipilih dari data uji, makalah 2509.19163 menunjukkan
penilai LLM tidak bisa diandalkan untuk slop, dan audit `AUDIT_2026-10-14_2` butir 21 sudah mengusulkan hal yang sama. Kampanye
Charles yang baru dimulai menjadi pengukuran pertama ekosistem 1.68+. Catatan sampingan: kata "ledger" muncul 51 kali di teks prompt
kartu, sebagian besar benda canon (buku besar Brotherhood milik Percival). Kalau U1 menunjukkan "ledger" bocor ke prosa sebagai kiasan,
baris kiasan di `npc_canon.json` adalah tempat memperbaikinya, lewat draf karena itu data canon.

**U2 (P1). Baris "Carries:" terbaca sebagai perintah untuk menampilkan barang di setiap balasan.** Lembar Cast Sheet mencetak
`Carries: …` di baris INVARIANTS setiap balasan, untuk lembar lengkap dan ringkas (`509_sheet.template.ejs`, `cHead`). Gemini membaca
setiap baris kartu sebagai perintah dan memainkannya "di volume maksimal" (Buku 02 §D), dan Buku 06 §2 meminta isi kartu tidak
dibacakan ulang. Akibatnya terlihat di Zara: kartunya menulis "a sketchbook she hides", prosanya menampilkan sketchbook di 11 dari 14
balasan. Usulan: label yang memberi syarat, misalnya `Carries (shown when the scene uses it):`, beberapa token per lembar, tanpa
menyentuh isi canon. Ini kartu, karena menyebut data kartu. Sebagian pengulangan wajar karena 38 balasan itu satu pagi yang
bersambung, jadi ukur ulang dengan U1 sesudahnya. Tidak menyentuh keputusan DECISIONS. **Status: selesai di 1.77.1** (owner: "u2 saja");
U1 dan U3 sampai U5 dicatat di `planning/FUTURE_PLANS.md` §2.

**U3 (P2). Pertanyaan menu di akhir giliran NPC.** Cap satu tanda tanya menghitung tanda tanya, dan NPC Voice Cosmos mengizinkan satu
"or" per kalimat, jadi pertanyaan "X, atau Y?" lolos dua-duanya: contoh "varian lolos" di Buku 05 §2. Mekanismenya kemungkinan aturan
handoff (Scene Engine; rumusan agensi "end with something {{user}} can respond to", Buku 06 §1): cara termudah memenuhinya adalah
menyodorkan dua pilihan. Uji payoff RF 2.2.1.3 (ON sejak 1.68.0) bisa jadi sudah menekan pertanyaan wawancara, jadi ukur dulu dengan
U1. Kalau pola ini masih muncul di sekitar seperempat balasan, tambahkan satu prompt generik Eldrasil sebagai toggle (E4, setara E3
Ordinary Turns), dirumuskan sebagai target positif, misalnya: "An NPC ends their turn on their own want (a demand, an offer, a jab,
a silence), not by handing {{user}} a choice of next moves." Ini preset, karena berlaku untuk kartu apa pun. Menyentuh DECISIONS §9
("Preset = upstream as it ships", daftar penyimpangan tertutup): butuh persetujuan owner.

**U4 (P3). Lembar ringkas di adegan ramai kehilangan pengaman suara.** `CAST_FULL = 4`: NPC kelima dan seterusnya mendapat lembar
ringkas tanpa "Never sounds like", "Don't flatten" dan adegan contoh. Riset (persona collapse, laporan multi-character collapse, Buku
06 §2 kartu multi-karakter) menunjuk adegan ramai sebagai tempat suara paling mudah melebur. Celahnya sempit karena NPC yang bicara di
balasan sebelumnya naik ke lembar lengkap, jadi yang terdampak hanya baris pertama NPC yang baru bicara di keramaian. Usulan: cetak
`never_sounds` (sekitar 25 token) di lembar ringkas juga; biayanya hanya muncul saat lima NPC atau lebih hadir. Kartu; tidak menyentuh
keputusan.

**U5 (P3). Memperbaiki pengulangan di riwayat.** Ekosistem sudah mencegah (510, larangan ulang deskripsi RF, trim regex), tetapi belum
punya cara memperbaiki frasa yang sudah tertanam di pesan lama, padahal mengubah satu baris sudah cukup memutus pola (Buku 02 §D).
Pilihan murah: laporan U1 mendaftar 6-gram berulang beserta nomor pesannya, owner menyunting satu kemunculan. Pilihan ekstensi: mode
pindai Chat Repetition Refactor (tanpa model) atau WH Editor. Keduanya belum diperiksa terhadap MVU: menyunting pesan yang membawa
`<UpdateVariable>` bisa memicu MVU membaca ulang blok atau merusaknya. Sesuai CLAUDE.md ("verify, don't assume"), baca kode sumbernya
dulu sebelum menyarankan pemasangan.

## 6. Yang tidak disarankan

- **Daftar larangan frasa NPC yang panjang** di kartu atau preset. Priming dan varian yang lolos (Buku 05 §2); RF sudah membawa daftar
  larangannya sendiri.
- **Penulis ulang otomatis untuk setiap balasan** (WH Editor dengan rewrite aktif, Recast) sebelum U5 diverifikasi. Biayanya panggilan
  model tambahan, dan perpustakaan mencatat auditor terpisah tetap tidak menangkap semuanya.
- **Penilai LLM sebagai alat ukur.** Makalah 2509.19163: penilaian slop subjektif. Hitungan berbasis aturan (U1) plus mata owner lebih
  murah dan bisa diulang.
- **Mengubah teks modul RF** untuk pola-pola ini. DECISIONS §9: perubahan masuk sebagai penyimpangan bernomor dengan alasan, atau
  toggle baru (U3).

## 7. Sumber

Perpustakaan: Buku 02 §D, 05, 06, 19, 09 (`D:/Claude Project/Sillytavern Preset/Perpustakaan`).

Internet:
- https://arxiv.org/html/2604.24698 (The Chameleon's Limit: persona collapse)
- https://arxiv.org/abs/2606.30571 (Attractor States Emerge in Multi-Turn LLM Conversations)
- https://arxiv.org/abs/2509.19163 (Measuring AI "Slop" in Text)
- https://arxiv.org/abs/2603.19313 (Memory-Driven Role-Playing)
- https://community.openai.com/t/llm-personas-for-arbitrary-scenarios-practical-observations-on-persona-drift-multi-character-collapse-non-scripted-behavior-and-sycophancy/1401026
- https://github.com/Coz-rp/SillyTavern-WH-Editor
- https://github.com/THEJACKALS/SillyTavern-ChatRepetitionRefactor
- https://github.com/inathael-58/SillyTavern-Slop-Guard
- https://pkg.go.dev/github.com/lemon07r/SlopScoreTool
- https://github.com/SillyTavern/SillyTavern/issues/3014 (AntiSlop sampler, di luar cakupan ST)
- https://reddit.sentinel-team.org/posts/1stnwwn/snapshots/2026-04-23T21%3A48%3A09.29112Z (snapshot r/SillyTavernAI)

Data proyek: `data/npc_canon.json`, `data/voice_rules.json`, `src/worldbook/custom/509_sheet.template.ejs`, `src/worldbook/custom/content/510.txt`,
`src/scripts/engine.template.js` (`CAST_FULL`, `stepCast`), `tools/audit_chat.py`, `dist/Realistic_Frankenstein_2_2_1_3_Eldrasil.json`, chat ekspor
owner di `C:/Users/seora/Downloads/stardew` dan chat live di instalasi SillyTavern.
