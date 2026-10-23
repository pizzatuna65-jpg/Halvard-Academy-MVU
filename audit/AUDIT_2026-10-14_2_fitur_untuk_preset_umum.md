# Dari Halvard ke preset umum: fitur yang bisa dibawa dan pelajarannya

Tanggal: 2026-10-14 · Basis: kartu v1.67.2, `docs/DECISIONS.md`, `docs/ECOSYSTEM.md`, audit narator (2026-10-04), audit memori
(2026-10-05), audit preset RF 2.2.1.3 (2026-10-14) · **Laporan ini tidak mengubah apa pun di project Halvard.**

Pertanyaan owner: untuk preset baru yang tidak terkait Halvard, fitur Halvard mana (termasuk yang ada di MVU, seperti Bond) yang
cocok masuk preset, dan pelajaran apa dari project ini yang sebaiknya ikut.

---

## Ringkasan

- **Satu batasan menentukan hampir semua jawaban: preset tidak punya engine.** Preset hanya berisi prompt, regex, dan setelan
  sampling. Bond, Journal, cuaca, kalender, dan suasana di Halvard bekerja karena engine deterministik menghitung, membatasi, dan
  menolak tulisan model. Di preset, sistem yang sama harus ditulis dan dihitung sendiri oleh model. Halvard menghabiskan puluhan
  rilis untuk memindahkan pekerjaan itu *dari* model *ke* engine, karena model salah hitung, menghitung dua kali, dan lupa.
- Jadi fitur Halvard terbagi tiga:
  1. **Aturan menulis dan perilaku NPC** (±20 butir): bisa pindah hampir utuh, karena memang generik. Ini nilai terbesar.
  2. **Sistem ber-state** (Bond, Trust/Tension, Journal, pin, lipatan, mood, suasana): bisa pindah sebagai **versi ringan** yang
     ditulis model, dengan pelajaran desainnya (kata keparahan, bukan angka; asimetri teman/musuh; satu blok state terakhir saja).
     Semua harus toggle dan OFF bila kartu punya tracker sendiri.
  3. **Yang terikat kanon atau engine** (Arbiter Stone, kohort, nilai ujian, crafting, peta, UI, Cast Sheet): tetap di kartu.
- **Pelajaran terpenting** (rincian di §4): satu pekerjaan satu pemilik; CoT menunjuk aturan, tidak menyalinnya; posisi prompt
  (depth 0, role assistant) lebih berpengaruh daripada jumlah kata; untuk Gemini, larangan yang menyebut hal terlarang malah
  memancingnya; contoh adalah sinyal terkuat, jadi contoh yang keliru mengajarkan hal keliru; sampling diuji dulu sebelum prompt
  ditulis ulang; preset dibangun dari skrip generator di atas basis upstream, bukan ditambal tangan.

---

## 1. Batasan medium: apa yang bisa dan tidak bisa dilakukan preset

| Kemampuan | Kartu Halvard | Preset |
|---|---|---|
| Menghitung angka secara pasti (XP, saldo, kalender) | engine (`runEngine`, deterministik) | tidak bisa; model yang menghitung |
| Menolak tulisan model yang salah | engine mengembalikan nilai lama (Rank, `_Techniques`) | tidak bisa; hanya meminta |
| Menyimpan state antar giliran | variabel MVU per pesan | hanya teks yang ditulis model di balasan (pola blok `<details>` Internal States RF) |
| Memunculkan aturan sesuai situasi | rule cards dipilih engine (`data/rule_cards.json`, entri 511) | hanya toggle yang dinyalakan pemain |
| Acak yang bisa diulang (replay-safe) | `roll100` / `pickOf` dari seed | macro ST `{{roll}}`, `{{random}}`, `{{pick}}`; tidak terikat state cerita |
| Lorebook, EJS, `@@if` | ya | tidak; preset tidak membawa lorebook |
| UI, panel, bracelet | Tavern Helper script kartu | regex tampilan saja (skrip Tavern Helper yang terikat preset: **belum diverifikasi**, cek source JS-Slash-Runner sebelum diandalkan) |

Konsekuensi praktis:

- **MVU tidak bisa dibawa preset.** MVU butuh `[initvar]`, skema Zod, dan entri bertag di lorebook. Preset yang "memakai MVU"
  sebenarnya paket tiga bagian: preset + lorebook global + skrip. Itu sah, tapi bukan lagi "preset yang bisa dipasang ke kartu apa
  saja", dan bentrok dengan kartu MVU lain (dua skema, dua `<UpdateVariable>`).
- **Tracker di preset selalu bersaing dengan tracker kartu.** Alasan Halvard mematikan Internal States RF (`docs/ECOSYSTEM.md`): blok
  tracker preset harus berada "di akhir setiap balasan", bersaing dengan blok update kartu, menggandakan data, dan memakan ribuan
  token output per balasan. Preset umum harus mengantisipasi kartu yang sudah punya tracker (lihat §2.2, aturan "defer").

---

## 2. Fitur yang cocok masuk preset

### 2.1 Bisa pindah hampir utuh (aturan menulis dan perilaku NPC)

Semua butir ini lolos uji "masih masuk akal di kartu lain?" setelah nama Halvard (`<now>`, `<cast>`, Campus_State, Doves) dibuang.
Sumbernya terutama entri 504 dan tulisan preset Eldrasil 1.5.0–1.37.3.

| # | Fitur | Sumber di Halvard | Bentuk di preset umum |
|---|---|---|---|
| A1 | **Player Input Authority** | preset, depth 0 sebelum BOLT | pemain hanya menulis {{user}}; yang ia tulis soal tokoh lain atau hasil adalah keinginan yang dijawab dunia sesuai watak. Mengulang `{{lastUserMessage}}` agar model tahu mana input. Toggle: OFF = mode sutradara |
| A2 | **Embellish vs Anti-parrot** | preset 1.36.0 (pilihan owner) | toggle berpasangan: narator boleh/tidak menulis ulang ucapan dan aksi {{user}} |
| A3 | **Hierarki kebenaran** | 504 baris 1–2 | kartu dan lore mengalahkan prosa lama di chat; bila balasan sebelumnya melenceng, kembali ke kanon tanpa komentar |
| A4 | **Memori yang dipanggil adalah masa lalu** | 503/504, DECISIONS §11 (`<VectFoxMemory>` sampai ke model update) | blok memori ekstensi (VectFox, Qvink, Summarize) menceritakan masa lalu, bukan keadaan sekarang, dan tidak membuktikan siapa tahu apa |
| A5 | **Isolasi kognitif** | 504 "Cognitive isolation" | tokoh hanya tahu yang mereka saksikan atau dengar di layar, ditambah pengetahuan di lore mereka. RF punya Anti-Omniscient; tambahkan versi Halvard: "orang yang sudah dikenal bukan orang asing" |
| A6 | **Hanya yang hadir yang bicara** | 504, DECISIONS §2 "Voices off Scene.Present" | tokoh yang tidak ada di adegan boleh disebut, tidak disuarakan; pengecualian: orang asing yang bicara ke kerumunan |
| A7 | **Kemunculan pertama singkat** | 504 | tokoh yang baru masuk tanpa data lengkap: penampilan dan satu-dua baris, tanpa mengarang latar |
| A8 | **Kedatangan butuh rute dan waktu** | 504, BOLT Task 10 | tidak ada yang tiba tanpa sempat berjalan ke sana; tidak ada yang terlambat setelah perjalanan beberapa detik |
| A9 | **Hidup di luar layar** | 504, Bridge | tokoh lain punya kelas, kerja, rivalitas, dan rencana sendiri; mereka muncul lewat jadwal dan kebetulan, bukan karena dipanggil plot |
| A10 | **Hook adalah utang** | 504 "Hooks are debts" | utang cerita tidak diumumkan; dibayar lewat dunia (orang kembali, surat tiba, detail muncul lagi). NPC juga boleh ingkar janji |
| A11 | **Rumor punya jangkauan** | 504 | hanya orang yang sudah terjangkau rumor yang tahu |
| A12 | **Kapan melempar dadu** | 504 "Fortune" | hanya untuk usaha {{user}} yang penting dan benar-benar tidak pasti; tidak untuk tindakan rutin atau pilihan bebas NPC |
| A13 | **Kekuatan {{user}} adalah pilihan pemain** | DECISIONS §2 (D10) | jangan diam-diam dilemahkan; dunia bereaksi wajar (perhatian, rivalitas, curiga) |
| A14 | **Kondisi tubuh terus terasa** | 504 "body matters", Conditions | luka, lelah, basah, kedinginan tampil di setiap balasan tanpa menunggu pemain menyebutnya; tidak ada yang sembuh di luar layar |
| A15 | **Hubungan mengubah cara, bukan watak** | 504, NPC Instincts versi Eldrasil | kedekatan mengubah cara tokoh memperlakukan {{user}}, tidak mengubah siapa dia; riwayat hubungan tidak memaksa tokoh menurut |
| A16 | **Menolak sesuai watak** | 504 "deflect in their own way" | diminta lebih dari yang mau ia bagi, tokoh mengelak dengan caranya sendiri; mendesak terlalu cepat menambah ketegangan |
| A17 | **Perbuatan dinilai dari niat** | DECISIONS §6 Tension, rule 502 | reaksi tokoh mengikuti niat yang terlihat, bukan hanya akibat |
| A18 | **Angka tidak masuk prosa** | 504 | prosa tidak pernah menyebut angka tracker (HP, poin, rank, trust) |
| A19 | **Pikiran NPC sebagai blok terpisah** | DECISIONS §10 (Internal Thoughts, `<npc_thoughts>`) | maks. tiga NPC, tidak pernah {{user}}, tidak membocorkan rahasia; dua regex: lipat di layar, buang dari balasan lama di prompt. Ini memang fitur RF; pelajaran Halvard ada di regex pembuangnya |
| A20 | **Bahasa output dan panjang** | preset 1.5.0, 1.4.6 | toggle "Output language" (OFF = ikut kartu) dan "Total Output Length" sebagai pilihan pemain, tidak ditanam di kartu |

Satu catatan dari audit RF 2.2.1.3 (§4 butir 4): tambahan Eldrasil `<character_calibration>`, "worse in their own way", dan batas
satu tanda tanya per tokoh **membuat tokoh lebih jinak**. Di preset umum, aturan pengekang seperti ini sebaiknya toggle OFF secara
bawaan. Rem untuk tokoh yang memang tenang sudah disediakan Card Fidelity RF.

### 2.2 Bisa pindah sebagai versi ringan (sistem ber-state yang ditulis model)

Syarat umum untuk semua butir di bagian ini:

- **Toggle, OFF bila kartu punya tracker.** Tambahkan satu kalimat "defer" di modul tracker: *"If the character card keeps its own
  state or tracker, do not write this block; the card's tracker wins."* Ini kebalikan dari aturan kartu Halvard ("this card's state is
  the only tracker").
- **Satu blok state, hanya di balasan terakhir.** Pola RF: blok `<details>` di akhir balasan, regex membuangnya dari balasan lama di
  prompt. Model membaca blok terakhir sebagai state, bukan tumpukan blok lama.
- **Cek dulu modul RF yang sudah ada.** RF sudah punya Relationships RPG (BOND, Sparks, Grudge), Internal Agenda, Chekhov's Gun, GM's
  Notebook, Fate & Routine, World Sim. Pelajaran dari memori "reuse existing systems": perbaiki modul itu dengan desain Halvard, jangan
  membuat sistem paralel di sebelahnya.

| # | Fitur Halvard | Yang layak dibawa (desainnya) | Yang tidak bisa dibawa |
|---|---|---|---|
| B1 | **Bond Rank 0–10** | rank sebagai pita kata (stranger, acquaintance, friend, close, …) yang membuka *apa yang dibagikan*, bukan hadiah; naik lewat adegan, bukan pernyataan; "high ranks open information, never an ending" | XP harian/mingguan, cap, cooldown, gate Trust: semua butuh aritmetika yang pasti |
| B2 | **Trust dan Tension terpisah** | dua sumbu: percaya (bisa dibagi rahasia) dan ketegangan (sakit hati sekarang). **Kenaikan Tension tidak pernah dibatasi, Trust naik pelan** ("musuh lebih mudah dibuat daripada teman"). Laporan pakai **kata keparahan** (slight / insult / betrayal), bukan angka (DECISIONS §6, 1.59.0) | ukuran acak per kata dari data dan multiplier kategori |
| B3 | **Kategori watak untuk reaksi** | tiap tokoh punya cara menanggapi konflik: withdrawn, social, confrontational, authority, dangerous (`data/tension.json`); cara menerima maaf berbeda per tokoh | tabel per NPC (itu data kartu) |
| B4 | **Mood harian** | mood Good/Normal/Bad mewarnai reaksi tanpa mengganti watak; bisa ditarik dari dadu giliran (`{{roll}}` di depth 0, pola Turn Dice RF yang ramah cache) | mood dari cuaca, sirkadian, kesehatan |
| B5 | **Journal sebagai tulang punggung** | hanya titik balik, urusan yang masih terbuka (ditutup oleh baris berikutnya), dan kunjungan pertama; **tanpa catatan pembukuan** ("rank naik ke 4"). Audit narator T3: seperempat sampai sepertiga Journal Halvard dulu terisi baris mekanis | jendela 30 baris, arsip, recall per nama |
| B6 | **Pin `!`** | baris yang diawali `!` tidak pernah dibuang saat ringkasan | daftar `_Kept_from_earlier` yang dikelola engine |
| B7 | **Lipatan bertingkat** ("Summaryception mini") | baris lama diringkas jadi satu baris bertanggal, ringkasan lama diringkas lagi; yang diringkas adalah catatan terkurasi, **bukan** chat mentah | jaminan "tidak ada yang hilang sebelum dilipat" |
| B8 | **Suasana sebagai *jenis*** | cue suasana adalah tipe ("a sound from the next room"), model menulis detailnya sendiri, sekali, tidak pernah sama dua kali; orang yang muncul di suasana tidak bernama dan tidak mengubah apa pun | tabel ritme keramaian per tempat dan jam |
| B9 | **Kejadian kecil harian** | "tekstur opsional: pakai bila {{user}} dekat atau cocok, jangan menyeret cerita ke sana" | seed per hari |
| B10 | **Waktu ditulis model, tapi tanpa aritmetika** | model menulis hari dan jam saja; tidak menghitung rollover kalender atau tanggal relatif. Audit narator T5: narator Halvard menghitung ulang stamina cuaca yang sudah dihitung engine (dobel). Di preset tanpa engine, minta seminimal mungkin | kalender, cuaca deterministik, prakiraan |

**Peringatan.** Setiap butir B menambah token output per balasan dan bisa drift: satu balasan yang lupa menulis blok menghapus state.
Rekomendasi: B1–B3 dan B5–B6 sebagai satu toggle "Light relationships + story spine", sisanya toggle sendiri. Semua OFF untuk kartu
MVU.

### 2.3 Tetap di kartu (jangan dibawa)

- Semua yang menyebut kanon: Arbiter Stone, dorm, kohort, Council, kalender akademi, kompetisi, Doves, tempat, NPC dan tabel per NPC
  (hadiah, ulang tahun, partner Rank 4, openness).
- Semua yang bergantung engine atau lorebook: Cast Sheet dan gerbang `@@if`, rule cards, Lore_changes, Agenda, crafting, nilai ujian,
  proficiency, area luar, warna dialog per tokoh (penugasan warna unik butuh state; regex tidak bisa melakukan hash nama), UI.
- Prompt ekstraksi VectFox milik kartu. Versi generiknya lebih tepat dibagikan sebagai **file pendamping** preset ("setelan VectFox
  yang disarankan"), karena itu setelan ekstensi, bukan bagian preset.

---

## 3. Bentuk modul yang disarankan untuk preset baru

Urutan relatif (pola RF: penyetel variabel di bawah Main, pembacanya di bawahnya):

| Posisi | Modul | Status bawaan |
|---|---|---|
| system, atas | Main (genre-netral; mengosongkan variabel tiap giliran) | ON |
| system | World Rules: A3–A18 dalam satu modul pendek | ON |
| system | Card Fidelity (kartu menang atas gaya) | ON |
| system | NPC Voice, Scene Detail, killswitch slop (dari basis RF sesuai model) | ON per model |
| system | Light relationships + story spine (B1–B3, B5–B7) | OFF |
| system | Ambience types + daily texture (B8–B9) | OFF |
| system | Character restraint (kalibrasi Eldrasil) | OFF |
| system | Output language, Total Output Length | OFF / ON |
| depth 0, user | Player Input Authority | ON |
| depth 0, assistant | CoT (BOLT) yang **menunjuk** modul | ON |
| depth 0, system | Turn Dice (mood, kejadian), gerbang last-mile pasangan killswitch | ON |
| regex | lipat `<npc_thoughts>` dan blok state; buang dari balasan lama di prompt; Impersonate cleanup | ON |

Contoh teks (bahasa kartu dan preset tetap Inggris), untuk modul World Rules:

```
<world_rules>
- The character card and its lore outrank the chat's own earlier prose. If an earlier reply drifted, return to canon now without comment.
- Recalled memories (any memory block an extension inserts) are the past, not the present, and do not prove who knows what.
- Characters know only what they witnessed or were told on-screen, plus their own lore. People {{user}} already knows are not strangers.
- Only characters in the scene speak or act. Others can be mentioned, not voiced.
- Nobody arrives without the time and a route to get here.
- Off-screen people keep their own lives and plans; they turn up through routine and chance, not because the plot needs them.
- Story debts are never announced; the world pays them off.
- Closeness changes how a character treats {{user}}, never who they are. Asked for more than they would share yet, they deflect in their own way.
- Never state tracker numbers in the prose.
</world_rules>
```

---

## 4. Pelajaran dari project ini

### 4.1 Arsitektur

1. **Satu pekerjaan, satu pemilik.** Tabel "Who owns what" (`docs/ECOSYSTEM.md`) mencegah dua tracker, dua memori, dan dua sumber
   kebenaran. Preset umum perlu tabelnya sendiri: apa yang dipegang preset, apa yang diserahkan ke kartu, apa yang diserahkan ke
   ekstensi memori. Hasil scan alat memori di audit 2026-10-05 (§F8): hampir semua ekstensi memori menjadi tracker kedua. Preset
   cukup memberi aturan cara membaca memori (A4), bukan sistem memori baru.
2. **Uji kartu vs preset dipakai terbalik.** Preset baru tidak boleh memuat satu pun nama kartu, tag kartu, atau field state. Buat
   tes otomatis yang mencari kata terlarang di semua prompt (Halvard: audit RF §4 butir 9 menemukan `<now>`, Eldrasil,
   `<current_state>` bocor ke preset).
3. **Kartu harus jalan dengan preset apa pun, preset harus jalan dengan kartu apa pun.** Kalimat "defer" (§2.2) adalah versi preset
   dari prinsip ini.
4. **Fitur yang dimatikan diparkir, bukan dihapus** (DECISIONS §4 "Features settings"). Di preset: toggle dan variabel; isi modul
   tetap utuh agar pemain bisa menyalakannya lagi.

### 4.2 Menulis prompt

5. **CoT menunjuk aturan, tidak menyalinnya.** Salinan aturan bond di BOLT step 2 basi berbulan-bulan dan mengajarkan aturan 1.0
   (CLAUDE.md). CoT cukup berkata "check the NPC Voice module", bukan menuliskan ulang modulnya.
6. **Tetapi pengulangan yang disengaja itu bobot.** Audit RF §2.10 dan §4 butir 5: "satu aturan, satu rumah" yang diterapkan terlalu
   keras membuang redundansi yang sengaja dipasang RF, dan Gemini yang patuh harfiah kehilangan bobot. Aturan kompromi: satu
   **sumber** teks per aturan, ditambah pasangan killswitch + gerbang last-mile di depth 0 untuk pola yang paling bandel. Salinan
   tidak sengaja dilarang; penguatan sengaja dicatat.
7. **Contoh adalah sinyal terkuat.** Audit narator T7: contoh 503 memakai format lama dan model mengikuti contoh, bukan aturannya.
   Untuk Gemini, RF tidak memberi contoh sama sekali karena Gemini menyalinnya kata per kata.
8. **Pink Elephant.** Untuk Gemini, larangan yang menyebut hal terlarang tetap menjadi pengingat. RF membuang semua kalimat soal bau
   di jalur Gemini; Halvard mengirim lebih dari sepuluh kalimat bau per giliran dan baunya muncul terus (audit RF §4 butir 6).
   Tulis aturan sebagai apa yang harus dilakukan.
9. **Gemini mengisi setiap saluran yang disebut.** Sebut "cahaya, suara, suhu" dan setiap adegan akan berisi cahaya, suara, suhu.
   Gambarkan tempat lewat benda yang dipakai atau disentuh (Scene Detail RF).
10. **Minta kata, bukan angka.** Trust/Tension lewat kata keparahan (1.59.0) membuat model berhenti mengarang angka. Di preset tanpa
    engine ini lebih penting lagi.
11. **Jangan minta model menghitung yang sudah dihitung pihak lain.** Kasus stamina "Chilled" terhitung dua kali (audit narator T5).
    Preset umum tidak boleh menyuruh model menghitung kalender, saldo, atau cuaca bila kartu mungkin sudah melakukannya.

### 4.3 Posisi dan mekanika SillyTavern

12. **Posisi lebih kuat daripada kata.** Di depth 0, urutan blok akhirnya assistant → user → system (diverifikasi di `openai.js`,
    DECISIONS §11). Teks terakhir sebelum model menulis paling dipatuhi. CoT ber-role assistant dibaca model sebagai ucapannya sendiri
    (audit RF §2.1).
13. **Aturan yang diparkir di atas chat panjang melemah.** Begitu satu pola lolos ke log, model meniru log-nya sendiri. Itu alasan
    gerbang last-mile berisi "Earlier messages in this chat are not a style license".
14. **Toggle yang benar-benar mati butuh variabel.** Pola setvar/getvar RF: Main mengosongkan variabel tiap giliran, penyetel mengisi,
    pembaca menempel. Penyetel harus di atas pembacanya.
15. **Regex diuji dengan pesan pemain.** Regex FF5 menghapus semua teks sebelum baris `[... Time`; pesan pemain yang berakhir dengan
    `[Time skip: two hours later]` sampai ke model hanya sebagai kurung itu (ECOSYSTEM, "Regex"). Regex preset berjalan sebelum regex
    kartu.
16. **Budget World Info dihitung sebelum render.** Fakta seperti ini hanya didapat dengan membaca source ST, bukan menebak
    (CLAUDE.md "Verify, don't assume"). Untuk preset baru: catat setiap fakta perilaku ST beserta file dan commit yang dicek.

### 4.4 Sampling dan cara membangun

17. **Uji sampling sebelum menulis ulang prompt.** Penyebab nomor satu preset Eldrasil "terasa beda" adalah suhu 1.0 / 0.95 vs 0.7 / 0.8
    (audit RF §4 butir 1), bukan teks. Tetapkan sampling per model target dulu.
18. **Bangun dari skrip, di atas basis upstream.** Preset Eldrasil berbasis RF 2.2 + ±90 penggantian teks; perbaikan upstream 2.2.1
    tidak pernah bisa masuk. Rencana rebuild menyusutkannya jadi beberapa perubahan kecil. Untuk preset baru: `edit_preset.py` yang
    membaca preset upstream asli, menerapkan daftar penyimpangan bernomor, dan menulis hasilnya. Upstream baru = jalankan ulang.
19. **Daftar penyimpangan yang disengaja.** Setiap perbedaan dari basis ditulis dengan alasannya (pola audit RF §5.3). Tanpa itu,
    setahun kemudian tidak ada yang tahu mana perbaikan dan mana kecelakaan.
20. **Anggaran token sebagai tes.** `test_preset` Halvard menjaga budget 15.600 token. Ukur seperti yang dikirim ST (setelah `{{user}}`
    diganti dan catatan `{{// }}` dibuang), bukan hitungan mentah file.
21. **Ukur di chat sungguhan.** `tools/audit_chat.py` mengukur drift tokoh dari ekspor chat. Pola yang sama berguna untuk preset:
    hitung frekuensi kata slop, em dash, tanda tanya per tokoh, panjang balasan, sebelum dan sesudah perubahan.
22. **Cek live dicatat sebagai daftar.** Perilaku model hanya terbukti di SillyTavern. Halvard memakai quest log; preset cukup daftar
    cek per rilis (adegan uji tetap: giliran sepi, konflik, adegan ramai, Impersonate).

### 4.5 Prinsip desain yang tetap berlaku

23. **NPC bereaksi sesuai watak; mekanik tidak pernah memaksa tokoh melawan kepribadiannya.**
24. **Musuh lebih mudah dibuat daripada teman.**
25. **Hadiah berguna, bukan kenang-kenangan; tidak terlalu bersyarat, tidak terlalu kuat.** Relevan bila tracker hubungan di preset
    memberi "perk".
26. **Tidak ada ending.** Kedekatan membuka informasi, bukan akhir cerita.
27. **Pemain memilih gaya main.** Mode sutradara vs simulasi, Embellish vs Anti-parrot, panjang, bahasa: semuanya toggle pemain.

---

## 5. Urutan kerja yang disarankan

1. Pilih model target dan basis (RF 2.2.1.3 sesuai model, atau dari nol). Tetapkan sampling.
2. Tulis skrip generator + daftar penyimpangan + tes kata terlarang (nama kartu) + budget token.
3. Masukkan modul World Rules (§2.1) dan Player Input Authority. Uji di dua kartu yang berbeda jauh (satu kartu sederhana, satu kartu
   MVU) agar kalimat "defer" dan Card Fidelity terbukti.
4. Baru setelah itu, tracker ringan (§2.2) sebagai toggle OFF, dengan regex pembuang blok lama.
5. Ukur dengan ekspor chat sebelum dan sesudah.

---

## 6. Keputusan owner

- **Q1. Model target:** Gemini saja (ikut jalur Cosmos RF, tanpa contoh, tanpa kata bau) atau multi-model dengan edisi per model?
  Saranku: satu model dulu, karena jalur Gemini dan Claude berbeda jauh.
- **Q2. Tracker hubungan di preset:** dibawa sebagai toggle OFF (§2.2) atau tidak sama sekali, sehingga preset murni aturan menulis?
  Saranku: dibawa, tapi dibangun di atas Relationships RPG RF, bukan modul baru.
