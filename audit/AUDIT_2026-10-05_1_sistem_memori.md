# Audit Sistem Memori — Eldrasil / Halvard Academy (v1.60.0)

Tanggal: 2026-10-05 · Versi yang diaudit: `src/card/card.json` 1.60.0 (commit `a676fc2`) · Laporan ini tidak mengubah kode.

Pertanyaan owner: audit sistem memori ekosistem kartu + preset + VectFox. Apa yang bisa dikembangkan, apa yang kurang efisien, fitur
apa yang bisa membantu memori, dan apakah perlu alat lain dari luar. Tujuannya: memori yang tetap utuh setelah puluhan ribu pesan.
Nomor di sini (F = temuan, M = usulan) berdiri sendiri, tidak terkait nomor audit sebelumnya.

## Ringkasan

- **Jawaban singkat:** kartu + preset + VectFox **sudah cukup** sebagai tumpukan. Tidak perlu ekstensi memori tambahan. Yang perlu
  dikembangkan ada di dalam kartu (cara melupakan dan cara melipat), sedikit setelan dan kebersihan VectFox, dan dokumentasi substrat
  (MVU + SillyTavern). Memori yang benar-benar "flawless" tidak bisa dijanjikan LLM mana pun. Target yang realistis dan bisa diuji:
  **tidak ada yang hilang diam-diam, yang lama bisa dipanggil lagi secara pasti, dan recall diukur.**
- **Yang sudah kuat dan jangan diganti:**
  - Pembagian kerja: state = fakta keras, Journal = tulang punggung cerita, Cast Sheet = tokoh yang hadir, VectFox = detail adegan
    lama. Ini pola yang sama dengan sistem memori agen terbaik saat ini: memori inti terstruktur ditambah arsip yang dicari.
  - Engine deterministik dan state per pesan membuat memori aman terhadap swipe. Kebanyakan ekstensi memori ST tidak punya ini.
  - Panduan "best SillyTavern memory extensions" (Agustus 2026) menyebut VectFox sebagai pilihan untuk "months-long campaigns with
    thousands of messages".
- **Masalah 1, lupa FIFO.** Journal (30 baris), Knows (15), Known_facts (10), Clues (40) dan arsip Extras (40) membuang yang tertua
  lebih dulu, tanpa melihat penting atau tidak.
  - Yang keluar dari jendela pindah ke arsip yang tidak dibaca narator, lalu terhapus permanen (arsip Journal 120 baris,
    `$Knows_old` 20).
  - Di laju chat owner, 30 baris Journal hanya mencakup ±1–2 ribu pesan terakhir.
  - Satu bug: Clues membuang clue misteri yang **masih terbuka** sebelum clue misteri yang sudah selesai.
- **Masalah 2, tidak ada lipatan bertingkat** antara Journal 30 baris dan VectFox. Untuk "apa yang terjadi bulan lalu", narator
  bergantung pada kemiripan teks VectFox. Ekstensi yang paling dipakai dan riset terbaru sama-sama melipat ringkasan bertingkat.
- **Masalah 3, VectFox di skala besar:**
  - tanggal Year 1 tersimpan tanpa tahun, jadi ambigu selamanya sejak Year 2;
  - query pencarian memuat blok `<UpdateVariable>` mentah;
  - event dari pesan yang dihapus atau diedit tetap tersimpan ("ingatan hantu");
  - event mirip yang berulang bisa memenuhi top-10.
- **Masalah 4, substrat:**
  - MVU menyimpan salinan state penuh di **setiap** lantai (user dan AI). Pembersihan otomatisnya (default: 20 lantai terakhir +
    satu snapshot tiap 50) membatasi pertumbuhan.
  - SillyTavern memuat dan menyimpan **seluruh** file chat setiap kali, dan menyimpan sampai 50 backup per chat. Perkiraan kasar:
    20 ribu pesan ≈ 110–150 MB per file.
  - Setelah branch, atau hapus jauh ke belakang, MVU diam-diam memakai snapshot lama (sampai 49 lantai ke belakang), kecuali pemain
    menekan "Replay floor", tombol yang tersembunyi secara default.
  - Saat replay, engine membaca pesan pemain yang salah.
- **Biaya token memori tumbuh bersama kampanye.** `<current_state>` (501) naik dari ±2–3 ribu token di tahun pertama ke **±10 ribu**
  pada state matang yang diukur. Muatan kartu per giliran ±37,5 ribu.

| # | Usulan | Usaha | Token per giliran | DECISIONS |
|---|--------|-------|-------------------|-----------|
| M1 | Clues: buang clue misteri yang selesai/dingin dulu; yang dibuang masuk arsip UI | K | 0 | – |
| M2 | Journal: buang duplikat lintas balasan; baris mesin (Meanwhile, kunjungan pertama) keluar dari jendela lebih dulu | K | 0 | §8 kecil |
| M3 | Pin: baris bertanda `!` tidak pernah tergusur (Journal = landmark; Knows; Known_facts) | S | +300 s.d. +1.000 di state matang | §8 |
| M4 | Urusan terbuka disimpan di Hooks; Journal hanya titik balik | K | ±0 | §8, **keputusan owner** |
| M5 | Lipat bertingkat: Chronicle dari baris Journal yang keluar, lipatan Knows/Known_facts. Narator yang menulis, atas permintaan kartu aturan | S–B | +500 s.d. +1.100 di state matang; output +40–70 per lipatan (jarang) | §8 baru, **keputusan owner** |
| M6 | Recall pasti per tokoh dan tempat dari arsip (melengkapi VectFox) | S | +100 s.d. +300 saat ada tokoh | – |
| M7 | 501 dipilah menurut relevansi untuk kampanye panjang (Clues, Extras, sebagian Campus_State) | S | −3.000 s.d. −4.000 di state matang | §8 kecil |
| M8 | Extras lama disimpan ringkas (nama + satu baris) daripada dihapus | K | 0 | – |
| M9 | Hook engine membaca pesan pemain dari lantai yang benar saat replay; peringatan bila state datang dari snapshot lama | K | 0 | – |
| M10 | VectFox sisi kartu: tanggal Year 1 bertahun, petunjuk "[Turning point]" dari Journal, setelan koleksi besar, kebersihan rollback | K | 0 | – |
| M11 | Lubang VectFox ditutup dari sisi kartu: penanda adegan di pesan pemain, nomor timeline untuk ingatan hantu, gist per balasan | S | +300 s.d. +400 (gist); penanda ±15 | – |
| M12 | Dokumentasi substrat: cleanup MVU, Replay floor, backup ST, interval snapshot; fakta baru di DECISIONS §11 | K | 0 | §11 |
| M13 | Alat ukur memori (`--memory`, kesehatan ekspor VectFox) + soak test jangka panjang | S | 0 | – |
| M14 | Bab baru tanpa kehilangan memori: state dan koleksi VectFox dibawa ke file chat baru | B | 0 | baru, **keputusan owner** |

Usaha: K = kecil, S = sedang, B = besar. Gabungan M3 + M5 + M7 di state matang: input **−1.500 s.d. −3.000 token per giliran**, dan
narator mendapat ingatan jangka panjang yang sekarang tidak ada.

## 1. Cara audit

- **Dibaca:**
  - dokumen: memory files, `CLAUDE.md`, `HANDOFF.md`, `docs/INDEX.md`, DECISIONS §1–2 dan §8–11, ECOSYSTEM bagian VectFox, audit
    2026-10-04 (beban narator) dan baseline mekaniknya;
  - engine: `stepBondMemory`, `stepRecords` (Journal, Clues), `stepLoreChanges`, `stepHooks`, `stepExtras`, `capRecord`, hook MVU di
    akhir engine, `collapseTrimmed`;
  - state dan entri: `schema.js`, 501, `509_sheet.template.ejs`, 511, baris memori di 502/504, dan pembuat preset (Bridge).
- **Sumber luar diverifikasi di kode** (klon di scratchpad sesi, tidak masuk repo):
  - **MagVarUpdate** `beta` `438f9ff`, sama dengan pin kartu dan masih HEAD per 2026-10-05:
    - `src/function/cleanup/*` dan `src/store.ts`: pembersihan otomatis dan default-nya;
    - `src/button.ts`: Replay floor, tombol legacy;
    - `src/function/update_variables.ts`: `updateVariables` selalu memancarkan event; `handleVariablesInMessage` juga berjalan saat
      MESSAGE_SENT;
    - `src/util.ts`: `getLastValidVariable`.
  - **VectFox** `main` `3623dc8`, sama dengan yang dicatat ECOSYSTEM dan masih HEAD:
    - `core/chat-vectorization.js` `buildSearchQuery`;
    - `core/eventbase-workflow.js`: kueri ganda, koleksi arsip, auto-sync;
    - `core/eventbase-retrieval.js`: re-rank dan dedup;
    - `core/eventbase-injection.js`, `core/eventbase-store.js`: fingerprint jendela, marker;
    - `ui/chunk-visualizer.js`: hapus massal.
  - **SillyTavern** `release`: `public/script.js` `saveChat`; `src/endpoints/chats.js` `getChatData` dan backup;
    `default/config.yaml`.
- **Data owner:**
  - chat `2026-10-01@21h01m33s056ms imported.jsonl` (aturan 1.34.2, 74 pesan, M1 W1 Mon);
  - ekspor VectFox `Chat_qdrant_charles_halvard_academy.vectfox(1).json` (97 event, 212 pesan, prompt default VectFox).
- **Diukur:**
  - `tests/stress/sim_year.cjs 336` dan `tests/stress/state_size.cjs 200`;
  - skrip scratchpad untuk **state matang**: 33 bond, 25 di antaranya dekat; semua daftar yang terlihat penuh; arsip tersembunyi
    masih kosong. State ini dirender dengan `tests/harness.cjs` `renderEntry`. Token ≈ karakter / 3,6.
- **Riset:** README ekstensi memori ST (2026) dan makalah memori jangka panjang (Lampiran B).
- **Tidak bisa diukur di Node:** perilaku narator sebenarnya, kecepatan simpan ST di mesin owner, dan kualitas recall VectFox pada
  koleksi besar. Untuk itu ada M13 dan uji live.

## 2. Peta memori sekarang

### 2.1 Lapisan

| Lapisan | Isi | Kapasitas dan cara lupa | Sampai ke narator |
|---|---|---|---|
| Chat verbatim | 24 pesan terakhir (regex trim; sisanya jadi satu "[…]") | 24 pesan ≈ 12 giliran ≈ 1–3 jam dunia di laju owner | selalu |
| State MVU | waktu, tempat, tubuh, uang, barang, bond, Campus_State, Agenda, Clues | per field; beberapa daftar dibatasi (baris di bawah) | 501, `<now>`, sheet, kartu aturan |
| Journal | titik balik, urusan terbuka, kunjungan pertama, Meanwhile | 30 baris FIFO → `$ui.archive` (UI saja) 120 → **dihapus** | selalu (30 baris) |
| Memori tokoh | Mind, Knows, Imprints, `$Defining`, `$Recent`, Known_facts, Milestones, Next | Knows 15 FIFO → `$Knows_old` 20 → dihapus; Known_facts 10 → `$Known_old` 20 → dihapus; Imprints 5 menurut bobot; `$Defining` 5 menurut ukuran | sheet tokoh yang hadir; satu baris untuk yang absen |
| Perubahan dunia | Lore_changes, NPC_status, New_relations, Events, Rumours, Secrets_revealed | Lore_changes 40 (ke-41 ditolak, tidak menggusur); rumor menua; ledger rahasia 500 | 501, entri lore yang bersangkutan, sheet |
| Agenda | Commitments, Hooks (15; bobot 1 keluar dulu; yang basi diingatkan), Notices 10, Letters 12, Projects, Next | menurut tanggal dan status | 501, `<now>` |
| Episodik (VectFox) | event hasil ekstraksi tiap 2 giliran | tidak pernah dihapus otomatis | ±10 event yang paling mirip dengan 2 pesan terakhir |
| Kanon | lorebook | tetap; Lore_changes menimpa | kata kunci; sheet untuk yang hadir |

### 2.2 Yang sudah baik (pola yang layak ditiru)

- **Daftar yang sudah sadar-penting:**
  - Imprints menurut bobot; `$Defining` menurut ukuran;
  - Hooks: bobot 1 keluar dulu, yang basi diingatkan Agenda;
  - Lore_changes: penuh berarti menolak, tidak menggusur;
  - ledger `$ui.secrets` 500;
  - New_relations: rekamannya tetap, hanya tampilannya yang memudar;
  - Extras ↔ `$ui.xold`: kembali bila muncul lagi.

  Journal, Knows, Known_facts dan Clues belum seperti ini.
- **Tanggal:** engine yang menulis semua tanggal. Tanggal relatif dikunci sekali, sheet menampilkan umur ("3 weeks ago"), dan baris
  lama mendapat "Y1" saat Year 2 mulai.
- **Hierarki kebenaran di 504:** state berarti sekarang, memori berarti masa lalu, sheet mengalahkan memori, dan memori tidak
  membuktikan siapa tahu apa.
- **VectFox:**
  - prompt kartu membuang rutinitas;
  - kueri ganda: pesan pemain dan konteks, skor digabung dengan maksimum;
  - re-rank: kemiripan, penting, persist, kebaruan;
  - settle lag untuk swipe; jendela yang gagal dicoba lagi;
  - event disuntikkan kronologis dengan `scene_time`.

### 2.3 Arti "puluhan ribu pesan" untuk kartu ini

- **Laju waktu dunia:** baseline mekanik mencatat ±4–15 menit dunia per balasan. Tanpa lompatan waktu, 20 ribu pesan (10 ribu
  giliran) ≈ 1,5–6 bulan dunia. Memori kartu ini **padat**: ratusan pesan per hari dunia.
- **Laju tulis narator** di chat owner (1.34.2, 37 balasan): Journal 1, Knows 1, Known_facts 13. Dengan laju itu:
  - 30 baris Journal ≈ 1–2 ribu pesan terakhir;
  - arsip 120 baris ≈ 5–8 ribu pesan sebelumnya; yang lebih tua terhapus;
  - Known_facts satu tokoh dekat bisa penuh dalam beberapa ratus pesan.
- **VectFox:**
  - prompt default VectFox menghasilkan 0,32–0,46 event per pesan (ekspor owner); prompt kartu membuang rutinitas, jadi
    kira-kira 0,2–0,3;
  - 20 ribu pesan ≈ 4–6 ribu event;
  - komentar di sumber VectFox menganggap koleksi per chat "typically O(hundreds to low thousands)", jadi kita berada di ujung atas
    rancangannya.

## 3. Temuan

### F1. Lupa FIFO di daftar yang paling penting (dan satu bug)

- **Journal** (`engine.template.js:4500`, arsip `:4506`, `CAP` `:270`, `JOURNAL_ARCHIVE` `:302`):
  - Urusan terbuka ("When a matter a line opened is settled, close it with a new line", 502) ikut tergusur sebelum ditutup.
  - Baris Meanwhile (`:3409`, satu per minggu untuk tiap bond Rank 7+ yang tak terlihat) dan kunjungan pertama bersaing dengan titik
    balik narator.
  - Duplikat hanya dibuang terhadap baris engine dari balasan yang sama (`jkey`, `:4494`). Chat owner punya "Sorted into (the) Fire
    Dormitory by the Arbiter Stone." dua kali di 3 baris Journal-nya.
- **Knows** (`:3370`):
  - 15 baris terbaru terlihat; sisanya `$Knows_old` (`slice(-20)`), lalu hilang. Tidak ada bobot.
  - Contoh: "Knows {{user}} lied about the night in the Archive" tergusur oleh 15 hal kecil, dan tokoh itu lupa.
  - Penjaga "Learned {{user}}'s true magic." (`:3356`) hanya mencari di Knows + `$Knows_old`. Setelah 35 baris lebih baru, barisnya
    hilang dan baru ditulis lagi bila `Known_by` berubah.
- **Known_facts** (`:3437`): 10 terlihat + 20 tersembunyi. Ini field yang paling sering ditulis narator (13 dari 37 balasan).
- **Clues, bug** (`:4166`): `capRecord(S.Clues, CAP.Clues)` tanpa `dropFirst` membuang clue tertua, termasuk clue misteri yang
  masih `open`. Clue misteri `solved` yang lebih baru tetap tinggal, padahal 501 sudah menyembunyikannya (tidak berguna bagi narator
  tapi tetap memakan slot).
- **Extras** (`:4595`): `$ui.xold` menyimpan 40 menurut terakhir dilihat; sisanya dihapus. Tokoh karangan yang muncul lagi setelah
  lama akan diciptakan ulang dengan rupa dan suara lain.

### F2. Tidak ada konsolidasi bertingkat

- **Celahnya.** Antara jendela Journal dan VectFox tidak ada "kisah sejauh ini".
  - Narator hanya melihat titik balik ±1–2 ribu pesan terakhir. Yang lebih lama muncul hanya bila VectFox memanggilnya karena mirip
    dengan adegan sekarang.
  - Kejadian besar yang tidak sedang dibicarakan ("X keluar dari klub di M2", "{{user}} dan Y bertengkar hebat") bisa tidak terlihat,
    kecuali tercatat sebagai state (NPC_status, Lore_changes, Tension).
- **Ini bukan yang ditolak ECOSYSTEM.** ECOSYSTEM menolak summarizer VectFox karena fakta keras terkikis bila chat mentah diringkas
  berulang-ulang. Melipat baris Journal yang sudah dikurasi adalah hal lain: fakta keras tetap di state, dan baris aslinya tetap di
  arsip.
- **Pola yang sama di luar:**
  - TiMem (ACL 2026 Findings): pohon memori temporal, recall per tingkat; panjang memori yang dipanggil −52% di LoCoMo, dengan
    akurasi lebih tinggi;
  - RAPTOR: pohon ringkasan rekursif;
  - Summaryception: lapis 0 per giliran, lapis 1+ dari lapis di bawahnya;
  - Memory Books: "arcs", ringkasan dari ringkasan.

### F3. VectFox: empat lubang di skala besar

1. **Tanggal Year 1 tanpa tahun.**
   - Pola pembersih 1 menyalin tanggal dari baris Time di `<Analysis>` apa adanya ("M3 W2 Mon 13:40"), dan prompt kartu menyimpannya
     verbatim di `scene_time`.
   - Sejak Year 2 tanggal itu ambigu, dan event yang sudah tersimpan tidak bisa diubah.
   - Perbaikan harus masuk sebelum Year 2. Chat owner masih di M1, jadi seluruh kampanye bisa tertutup.
2. **Query kotor.**
   - `buildSearchQuery` memakai teks **mentah** 2 pesan terakhir: blok `<UpdateVariable>` (Analysis + JSON), tag `<say:…>`, dan
     `<npc_thoughts>` ikut. Pola pembersih hanya berlaku untuk ekstraksi.
   - Kueri kedua (pesan pemain) menolong karena skornya digabung dengan maksimum. Tetapi konteks balasan, tempat nama tokoh dan tempat
     disebut, tercampur noise.
3. **Ingatan hantu.**
   - Event tidak dihapus saat pesan dihapus atau diedit. Jendela yang diedit diekstrak lagi (`fingerprint` hash pesan), jadi muncul
     duplikat.
   - `source_message_hashes` tersimpan, dan `deleteEventByHash` sudah ada, tetapi tidak dipakai untuk pembersihan.
   - Setiap rollback beberapa pesan (pola umum di RP) meninggalkan event dari masa depan yang dibatalkan.
   - Jalan manual ada: chunk visualizer VectFox bisa hapus massal.
4. **Keragaman top-10.**
   - Dedup hanya untuk tipe sama + ≥60% tokoh sama + jarak ≤ `eventbase_dedup_window_gap` (default 10, maks 200 pesan).
   - Adegan berulang dengan teman yang sama (belajar bersama tiap Selasa) bisa memenuhi top-10 di koleksi ribuan event.
   - Tidak ada slot "event terbaru" sebagai jembatan jangka menengah. Rencananya hanya muncul di nama file plan VectFox; tidak ada di
     kode.
   - Tidak ada boost untuk nama tokoh yang sedang hadir. Anchor boost hanya untuk kata kunci di pesan pemain.

Kecil, dicatat saja: mode *Summary Only* tidak menyuntikkan `open_threads` (tetap berguna, karena ikut dalam teks yang di-embed untuk
pencarian) dan mencetak `DateTime: -` per event.

### F4. Substrat: MVU dan SillyTavern

- **MVU menyimpan state penuh di setiap lantai, termasuk pesan pemain.** `handleVariablesInMessage` juga berjalan saat MESSAGE_SENT.
  - Di chat owner: 19–23 KB per lantai pada M1 W1. Variabel = 505 dari 823 KB file.
  - Pembersihan otomatis MVU (default **ON**) menyisakan 20 lantai terakhir + lantai kelipatan 50 (`store.ts`; berjalan tiap 5
    lantai).
  - Chat owner menunjukkan pembersihan itu bekerja: lantai 1–49 kosong, lantai 0 dan 50 utuh.
- **SillyTavern memuat dan menyimpan seluruh file chat sekaligus.**
  - `saveChat` mengirim `chat.slice()` utuh; `getChatData` membaca seluruh file.
  - Server menyimpan sampai **50 backup per chat** (`backups.common.numberOfBackups: 50`, throttle 10 detik,
    `maxTotalBackups: -1`).
- **Proyeksi ukuran file** (kasar):
  - teks ±4,7 KB per pesan (chat owner; sudah termasuk salinan di `swipes`, `swipe_info` dan reasoning);
  - state per lantai ±23 KB (M1) → ±56 KB (akhir tahun yang ramping, `sim_year`) → ±210 KB (state matang terukur, arsip tersembunyi
    kosong) → perkiraan ±300 KB bila arsip penuh.

| Pesan | Teks | Snapshot (default 20 + 1/50) | Total kasar | Interval 200 | Tanpa cleanup |
|---|---|---|---|---|---|
| 5.000 | ±23 MB | ±120 × 40 KB ≈ 5 MB | ±28 MB | ±25 MB | ±200 MB |
| 20.000 | ±94 MB | ±420 × 120 KB ≈ 50 MB | ±145 MB | ±110 MB | ±2,4 GB |
| 50.000 | ±235 MB | ±1.020 × 200 KB ≈ 205 MB | ±440 MB | ±290 MB | ±10 GB |

  Setiap pesan menulis ulang file sebesar itu, ditambah sampai 50 salinan backup. Di atas ±20 ribu pesan, **teks** chat sendiri
  sudah jadi batas; setelan MVU hanya membantu sebagian. Jalan keluar yang nyata adalah file bab (M14).
- **Branch dan rollback.**
  - `getLastValidVariable` memakai lantai terbaru yang masih punya data. Setelah branch dari lantai lama, atau setelah menghapus
    sampai lantai lama, state diam-diam datang dari snapshot sampai 49 lantai ke belakang.
  - Pemulihan otomatis hanya berjalan setelah MESSAGE_DELETED, dan hanya bila ada lantai tanpa variabel di 10 lantai terakhir.
  - Tombol "Replay floor" (重演楼层) adalah tombol legacy: baru tampil setelah Compatibility → **Show legacy features** dinyalakan.
- **Ketepatan replay.**
  - MVU me-replay setiap lantai, termasuk pesan pemain, lewat `updateVariables`. Fungsi itu memancarkan event yang didengar engine.
  - Hook engine (`:5489–5493`) mengambil pesan pemain (`said`) dan petunjuk seed dari **ujung chat**, bukan dari lantai yang sedang
    di-replay.
  - Akibatnya `stepLoreChanges`, yang menyimpan perubahan hanya bila balasan **atau pesan pemain** menyebut subjeknya, bisa memutuskan
    lain saat replay. Rule card dan reminder ikut, tapi itu sementara.
  - Kasusnya sempit, tetapi Lore_changes adalah memori dunia jangka panjang.
- **Dokumentasi:** belum ada panduan pemain tentang semua ini (PLAYER_GUIDE, ECOSYSTEM).

### F5. Biaya token memori tumbuh dengan kampanye

- **501 (`<current_state>`):**
  - ±1.900 token (audit 2026-10-04, adegan A) → ±3.300 (adegan C, akhir tahun 1) → **9.975** pada state matang;
  - rinciannya: Bonds 2.378 (3 yang hadir ±620 masing-masing, 30 absen ±18), Campus_State 1.873 (Events 522, Secrets_revealed 379,
    Rumours 314, NPC_status 264, New_relations 244), Clues 1.799 (40), Hooks 928, Journal 669, Commitments 524, Extras 494,
    Mysteries 414.
- **Muatan kartu per giliran pada state matang ±37.500 token:**
  - 501: 9.975; Cast Sheet 3 tokoh penuh: 9.387; 502: 6.142; 504: 3.031; 132: 2.105; 0: 2.069; 511: 1.587; 97: 957; 505: 824;
    sisanya ±1.400;
  - audit 2026-10-04 mencatat ±27.500–29.100 sebelum diet. Diet 1.53–1.59 memotong aturan; yang tumbuh sekarang adalah **memori**.
- **Kenapa ini masalah memori, bukan cuma biaya.** Studi Context Rot (Chroma, 2025) menguji 18 model: semuanya memburuk saat input
  memanjang, bahkan pada tugas pencarian sederhana, dan posisi informasi berpengaruh. Lebih banyak memori yang selalu tampil tidak
  otomatis berarti ingat lebih baik.
- **Obatnya sudah ada di kartu:** memilah menurut relevansi, seperti bond yang absen (1.57.0) dan kartu aturan.

### F6. Jembatan jangka menengah

- 24 pesan verbatim ≈ 1–3 jam dunia.
- Di antara itu dan Journal ada Mind/Knows/`$Recent` (per tokoh), Commitments, dan VectFox. Rutinitas tidak disimpan VectFox.
- Yang jatuh di celah: detail adegan yang bukan tentang tokoh, dari beberapa jam sebelumnya (pakaian, barang dipinjam, suasana).
- Trim 24 adalah angka playtest (FUTURE_PLANS §5): +12 pesan ≈ +8–10 ribu token per giliran. Balasan owner ±700 token setelah blok
  update dibuang, ditambah pesan pemain ±100. Tidak diusulkan sebagai default.

### F7. Preset

- Tidak ada masalah memori di preset:
  - Bridge sudah benar membagi kerja;
  - BOLT Task 0 membaca state dan sheet;
  - Task 7 memeriksa "what they know".
- Aturan memori baru (pin, lipatan) masuk ke kartu, sesuai aturan "card vs preset". Preset tidak perlu diubah.

### F8. Alat luar (hasil scan internet)

| Alat | Cara kerja (README) | Kecocokan dengan kartu ini |
|---|---|---|
| Qvink Memory (MessageSummarize) | ringkasan per pesan; memori pendek bergulir + jangka panjang yang di-pin (ikon otak); ringkasan menempel pada pesannya | satu panggilan LLM per pesan; README tidak menyebut pengecualian regex/tag, jadi blok update ikut diringkas; memori ketiga di samping state dan VectFox |
| Summaryception | lapis ringkasan rekursif (L0 per giliran, L1+ dari L0); pesan yang sudah diringkas di-`/hide`; verbatim ±22 ribu token | ghosting bentrok dengan regex trim kartu (DECISIONS §10: pakai salah satu); menggandakan Journal |
| Memory Books (STMB) | adegan → entri lorebook (kata kunci / vektor), "arcs" (ringkasan dari ringkasan), Side Prompts (tracker), rollback | lorebook tidak per pesan, jadi tidak aman terhadap swipe/rollback; Side Prompts = tracker kedua (§10) |
| OpenVault | event + saksi (POV), refleksi, knowledge graph + komunitas Louvain, pencarian hibrida, disimpan di metadata chat | memori episodik kedua di samping VectFox; refleksi menggandakan Imprints/Mind |
| Smart Memory | 5 tingkat; status epistemik per tokoh (knows/suspects/believes/unaware/hiding), ledger status, story arcs, supersession (`[retired]`), pemeriksa kontinuitas; model memori terpisah tiap 3 pesan | ledger dan arcs menggandakan MVU (tracker kedua); edit/hapus tidak memperbarui memorinya |
| Layered memory (124135417) | tabel status + ringkasan episode/bab yang "dibekukan" + ekstraksi tertunda yang dicek ke teks sumber | tabel status = tracker kedua |
| CharMemory, MemPalace, Memory Loom | memori markdown di Data Bank / RAG + graf / memori "berkembang" (README tidak dibaca; dari daftar 2026) | kategori yang sama: penyimpanan dan pencarian kedua |
| Bawaan ST: Summarize, Vector Storage | ringkasan bergulir / vektor chat | alasan ECOSYSTEM masih berlaku |

- **Kesimpulan:** semua alat ini akan menjadi tracker kedua atau memori episodik kedua. Akibatnya dua sumber kebenaran yang bisa
  bertentangan, token ganda, dan panggilan LLM tambahan.
- **Yang layak diambil adalah idenya:**
  - lipatan bertingkat (Summaryception, STMB arcs, TiMem) → M5;
  - pin jangka panjang (Qvink) → M3;
  - supersession dan pemeriksa kontinuitas (Smart Memory, Zep) → M11b, M13;
  - recall berbasis entitas (OpenVault, Zep) → M6.

## 4. Usulan

### A. Berhenti lupa diam-diam (engine, deterministik)

**M1. Clues.** `capRecord(S.Clues, CAP.Clues, c => status(c.Thread) !== 'open')`: clue misteri yang selesai atau dingin keluar
lebih dulu. Yang keluar disimpan di arsip UI (panel Mystery) dan tidak dihapus. Uji: tidak ada clue misteri terbuka yang dibuang
selama masih ada clue misteri selesai.

**M2. Kebersihan Journal.**
- Duplikat dibuang menurut `jkey` di seluruh jendela, bukan hanya terhadap balasan yang sama.
- Saat lebih dari 30 baris, baris mesin berprioritas rendah (Meanwhile, kunjungan pertama) keluar lebih dulu daripada baris
  narator.
- Isi Journal tidak berubah, hanya urutan keluarnya. Ini menyentuh DECISIONS §8 sedikit.

**M3. Pin `!` (tidak pernah tergusur).**
- **Journal:**
  - Baris yang diawali `!` dari narator, atau baris mesin jenis landmark, tetap tampil setelah keluar dari jendela 30, sebagai
    "Kept from earlier". Landmark mesin: misteri terpecahkan, perubahan dunia permanen, datang/lulus, romansa dimulai.
  - Maksimal 20. Bila lebih, yang tertua ikut lipatan berikutnya (M5).
- **Knows dan Known_facts:** baris `!` (maksimal 5 per daftar per bond) tetap terlihat walau melewati batas. Baris "Learned
  {{user}}'s true magic." otomatis di-pin.
- **Beban narator:** satu karakter, dipakai jarang. Satu kalimat di 502 untuk Journal dan satu untuk Knows.

**M4. Urusan terbuka ke Hooks** (keputusan owner).
- Baris Journal di 502 berubah dari "close it with a new line" menjadi: a matter that stays open also goes in Hooks; remove the
  Hook when it is settled.
- Hooks sudah menua, ditandai basi oleh Agenda, diingatkan sekali, dan tersembunyi dari pemain. Journal jadi murni titik balik.
- Bila fitur Hooks dimatikan pemain, perilaku Journal yang sekarang tetap berlaku.

**M8. Extras.** Di atas 40 di `$ui.xold`, simpan "nisan": nama + satu baris (Role/Look/Voice terpendek), bukan hapus. Tokoh karangan
yang kembali tetap punya wajah dan suara yang sama.

### B. Konsolidasi bertingkat

**M5. Lipatan.** Satu mekanisme untuk Journal dan memori tokoh. Narator yang menulis, engine yang menentukan kapan dan apa.
- **Journal → Chronicle:**
  - Pemicu: 10 baris tanpa pin keluar dari jendela sejak lipatan terakhir.
  - Kartu aturan `fold` (511, `[mvu_update]`) mencetak baris-baris **persisnya**, lalu meminta satu entri ≤ 50 kata: siapa, apa,
    apa yang berubah; nama, utang, kematian dan rahasia tetap ada.
  - Engine memberi rentang tanggal, mengecek panjang, menyimpan aslinya di arsip (UI), dan mencetak Chronicle di 501 di atas
    Journal.
  - Lebih dari 12 entri: 4 yang tertua dilipat lagi menjadi satu, ≤ 70 kata, dengan kartu yang sama.
- **Knows dan Known_facts:**
  - Baris yang keluar dari daftar terlihat menunggu di `$Knows_old` / `$Known_old`.
  - Bila ≥ 5 menunggu dan tokoh itu sedang di sheet penuh, kartu yang sama meminta satu baris lipatan ("[until Y1 M3] …"). Baris
    itu menjadi baris terlihat yang paling tua.
  - Tidak ada yang dihapus sebelum dilipat.
- **Biaya:**
  - output +40–70 token per lipatan, jarang: kira-kira tiap 10 baris Journal, atau tiap beberapa lusin baris Knows per tokoh;
  - input +500–1.100 pada state matang.
- **Bentuknya "Summaryception mini"** (owner, 2026-10-05):

  | Lapis | Isi | Kapan dibuat | Panjang | Batas |
  |---|---|---|---|---|
  | L0 | Journal | AI menulis titik balik | ≤25 kata per baris | 30 baris |
  | L1 | lipatan 10 baris L0 yang keluar dari jendela | tiap 10 baris keluar | ≤50 kata | 12 entri |
  | L2 | lipatan 4 entri L1 tertua | saat L1 lebih dari 12 | ≤70 kata | 12 entri |
  | L3 | satu entri per tahun kampanye | saat tahun berganti | ≤100 kata | – |

  Yang dilipat adalah baris Journal yang sudah dikurasi, bukan chat mentah. Lipatan disimpan di state per pesan, tanpa `/hide`.
- **Siapa yang menulis** (owner, 2026-10-05: pindah ke mode extra-model):
  - Kartu `fold` bertag `[mvu_update]`. Di mode extra-model, **AI update** yang menulis lipatan; AI cerita tidak pernah melihat
    kartunya. Di mode satu panggilan, narator yang menulis.
  - Kartu itu membawa baris yang harus dilipat, jadi AI update tidak butuh riwayat chat (default MVU: 2 pesan).
  - Lipatan ada di blok update pesan itu, jadi replay MVU mengulangnya persis.
  - Tidak ada panggilan LLM terpisah dari engine. Engine tetap deterministik.
- **Kenapa bukan engine:** engine tidak bisa meringkas prosa. Ini setara dengan "sleep-time consolidation" Letta, dalam bentuk yang
  deterministik dan aman terhadap swipe.
- **Keputusan owner:** disetujui 2026-10-05 (bentuk dan penulis di atas). Masuk DECISIONS §8 saat batch 4.

### C. Recall yang pasti (melengkapi VectFox)

**M6. Recall per entitas.**
- Untuk tiap tokoh di sheet penuh: sampai 3 baris dari arsip Journal dan Chronicle yang menyebut namanya, terbaru dulu, sebagai
  "Earlier with {{user}} (from the record)".
- Untuk tempat sekarang: sampai 2 baris di `<now>`.
- Pencocokan nama memakai helper yang sudah ada (`formRx`, `mentionIn`).
- Hasilnya hibrida, seperti Zep: entitas pasti dari state, kemiripan dari VectFox.
- Butuh keputusan retensi arsip (perbesar batas vs ukuran snapshot). Putuskan dari angka M13.

**M7. 501 menurut relevansi** (perluasan U3 1.57.0).
- **Clues:** misteri terbuka yang relevan (tokoh hadir, tempat, disebut) tampil rinci; selebihnya satu baris indeks per thread
  ("The scorched ledger: 7 clues on record").
- **Extras:** yang hadir atau disebut tampil penuh; sisanya nama saja.
- **NPC_status dan New_relations:** penuh untuk yang hadir, disebut, atau mungkin datang; sisanya indeks satu baris.
- **Secrets_revealed:** jumlahnya saja. Rahasia milik tokoh yang hadir sudah dicetak di sheet-nya.
- **Target:** 501 matang ±10 ribu → ±6–7 ribu token. Tidak ada yang hilang dari pandangan; yang dipadatkan tetap punya baris indeks.

### D. Integritas replay

**M9. Hook engine.**
- Hook mencari lantai yang sedang diproses: `content` dari COMMAND_PARSED dicocokkan ke `SillyTavern.chat` dari belakang. Dari
  situ:
  - `said` = pesan pemain sebelum (atau pada) lantai itu;
  - petunjuk seed = `send_date` lantai itu;
  - `$eng.floor` dicap.
- Bila state "sebelum" (B) berasal dari lantai yang jauh di belakang: `_Log` dan toast "State came from message N (K back): MVU →
  Compatibility → Show legacy features → Replay floor".
- Bisa diuji di Node dengan chat tiruan.

### E. VectFox

**M10. Sisi kartu** (tanpa mengubah VectFox):
- **a. Tahun di tanggal Year 1.**
  - Pola baru setelah pola 1: `\[In-world time: (?=M\d)` → `[In-world time: Y1 `.
  - Satu baris di 504 untuk event yang sudah terlanjur tersimpan: a recalled date without a year is from Year 1.
- **b. Petunjuk titik balik.**
  - Pola baru sebelum pola 1 menyalin `value` dari insert `/Journal/-` di balasan itu menjadi baris `[Turning point: …]`, sebelum
    bloknya dibuang.
  - Prompt kartu: baris itu catatan narator sendiri; ekstrak sebagai satu event, importance ≥ 6, `should_persist` true.
  - Hasilnya, penilaian penting VectFox selaras dengan tulang punggung cerita.
- **c. Setelan koleksi besar** (uji dengan debug query):
  - `eventbase_dedup_window_gap` 10 → 40;
  - top-k 10 → 12–15 hanya bila event yang benar muncul di peringkat 11–15;
  - agentic retrieval sebagai percobaan setelah ±2.000 event.
- **d. Kebersihan di ECOSYSTEM:**
  - Setelah menghapus atau menulis ulang pesan lama: chunk visualizer → urutkan menurut `message_order` → hapus massal event sejak
    pesan pertama yang berubah. Atau vectorize ulang dari titik itu.
  - Branch: vectorize ulang branch itu, atau kunci koleksi induk lalu hapus event setelah titik branch.

**M11. Lubang VectFox ditutup dari sisi kartu** (owner, 2026-10-05: tanpa meminta apa pun ke pembuat VectFox). VectFox tidak
diubah; kartu mengatur apa yang VectFox baca.

- **a. Penanda adegan di pesan pemain** (menutup lubang query kotor dan tidak adanya boost entitas).
  - Saat pesan pemain dikirim, hook kartu menambahkan satu baris pendek di akhir pesan itu, misalnya
    `(scene: Irene, Kaito · Courtyards · t2)`: siapa yang hadir (`Scene.Present`), tempat, dan nomor timeline (b).
  - Kenapa bisa: ST menunggu listener MESSAGE_SENT sebelum generate (`sendMessageAsUser`: `await eventSource.emit(MESSAGE_SENT)`).
    Interceptor VectFox menerima objek pesan yang sama. VectFox memakai pesan pemain sebagai kueri vektor kedua, dan kata kuncinya
    untuk anchor boost (`eventbase-workflow.js` `keywordQuery`).
  - Hasilnya, kueri pemain bersih dan berisi nama tokoh serta tempat. Skor dua kueri digabung dengan maksimum, jadi kueri kotor
    dari blok update kalah. Event yang menyebut tokoh yang hadir mendapat anchor boost.
  - Penanda disembunyikan dari tampilan (regex display), dibuang dari prompt cerita (regex prompt), dibuang dari `said` engine, dan
    diubah pola pembersih VectFox menjadi baris timeline. Satu-satunya tempat ia masih terlihat: `{{lastUserMessage}}` di Player
    Input Authority preset. Itu aman, dan malah informatif.
  - Opsi untuk diuji dengan debug query: `query` 2 → 1. Kueri jadi hanya pesan pemain + penanda, jadi bersih sepenuhnya, dengan
    harga kehilangan konteks prosa balasan terakhir.
- **b. Nomor timeline** (menutup ingatan hantu dari rollback dan branch).
  - Variabel chat `eld_tl` = `{t, top, void}` hidup di luar state per pesan, jadi selamat dari rollback, dan ikut tersalin saat
    branch.
  - Hook mengenali rollback: pesan baru (atau generate ulang) berada di lantai ≤ lantai tertinggi yang pernah ada. Hook lalu
    mencatat `void` (t lama, mulai lantai itu) dan menaikkan `t`.
  - Nomor `t` ikut di penanda (a). Pola pembersih membawanya ke baris waktu, dan prompt ekstraksi menyalinnya ke `scene_time`
    ("Y1 M3 W2 Mon 13:40 t2"). Event yang disuntik VectFox sudah memuat `scene_time` dan `message_order`.
  - `<now>` mencetak void (maksimal 10): "Recalled memories marked t1 with message_order 4812 or later never happened (the story
    was rewound there)."
  - Lapisan murah tambahan di 504: a recalled memory dated after now never happened.
  - Yang tidak tertutup: edit pesan lama menghasilkan dua versi event dengan nomor yang sama. Ini jarang; bersihkan manual (M10d).
- **c. Keragaman top-10.**
  - Prompt ekstraksi kartu: pertemuan rutin yang berulang dengan orang yang sama adalah rutinitas, kecuali ada yang baru dikatakan
    atau berubah. Event serupa berkurang sejak awal.
  - Ditambah setelan `eventbase_dedup_window_gap` (M10c).
- **d. Jembatan jangka menengah: gist per balasan** (pengganti slot "event terbaru").
  - AI update menulis satu baris ≤ 20 kata per balasan: apa yang terjadi, siapa, di mana.
  - Engine menyimpan 40 gist terakhir beserta nomor lantainya. `<current_state>` hanya mencetak gist yang sudah keluar dari jendela
    24 pesan, maksimal 12 baris (±300–400 token).
  - Ini lapis paling bawah "Summaryception mini": chat verbatim → gist → Journal → Chronicle.
  - Di mode extra-model, AI cerita tidak terbebani; AI update menulis +20–30 token per balasan. Bisa dimatikan lewat Features.
- **Harus diverifikasi saat batch** (di sumber, bukan asumsi):
  - listener async Tavern Helper ditunggu `eventSource.emit` ST;
  - `mes` yang diubah di MESSAGE_SENT ikut tersimpan;
  - `chat_metadata.variables` tersalin saat branch;
  - VectFox tidak menyimpan cache kueri pemain sebelum MESSAGE_SENT selesai.

### F. Substrat dan operasional

**M12. Dokumentasi.**
- **PLAYER_GUIDE, bagian chat panjang:**
  - cleanup otomatis MVU tetap ON; jangan pernah dimatikan untuk kartu ini;
  - interval snapshot 50 → 100–200 untuk chat panjang. Harganya: pemulihan setelah hapus jauh me-replay lebih banyak lantai, ±15 ms
    engine per lantai di Node;
  - "Replay floor" setelah branch atau hapus jauh ke belakang;
  - backup ST: `backups.common.numberOfBackups` 50 → 10–20 untuk chat panjang; awasi disk.
- **DECISIONS §11** mendapat fakta terverifikasi baru: default cleanup dan pemulihan MVU, event `updateVariables` di lantai pemain,
  `saveChat` ST menyimpan seluruh file, backup, query VectFox, ingatan hantu, dan koleksi arsip.

**M14. Bab baru tanpa kehilangan memori** (nanti; keputusan owner).
- Aksi "New chapter":
  - chat baru dibuat;
  - state terakhir dibawa ke variabel MVU pesan pertama;
  - Chronicle dan Journal membawa cerita;
  - koleksi VectFox lama dikunci sebagai koleksi arsip. VectFox sudah mencari koleksi arsip secara paralel
    (`_gatherArchiveEventCollections`) dan mengurutkannya per percakapan.
- Setiap file tetap beberapa ribu pesan, tetapi memorinya bersambung.
- Butuh cek live di ST: initvar MVU di chat baru, dan greeting.
- Pemicu: simpan > ±2 detik atau file > ±100 MB.

### G. Alat ukur

**M13. Laporan memori.**
- `tools/audit_chat.py --memory`, atau alat Node di samping `replay_chat.cjs`. Replay satu chat dan laporkan:
  - baris yang keluar per daftar (Journal, Knows, Known_facts, Clues, Extras), pin dan lipatan;
  - umur Hooks yang terbuka;
  - token 501 sepanjang waktu;
  - ukuran snapshot dan proyeksi file.
- Dengan ekspor VectFox, laporkan juga:
  - event hantu (hash sumber tidak ada di chat);
  - tanggal tanpa tahun;
  - duplikat;
  - event per jendela, sebaran importance dan tipe.
- `tests/stress/memory_soak.cjs`: ribuan update sintetis dengan tulisan memori narator di laju owner. Invarian yang diuji:
  - tidak ada clue misteri terbuka yang dibuang;
  - pin tetap;
  - tidak ada yang dihapus sebelum dilipat;
  - 501 dan state di dalam anggaran.

## 5. Yang sengaja tidak diusulkan

- **Ekstensi memori kedua** (tabel F8): tracker kedua (§10), ghosting bentrok dengan regex trim (§10), token dan panggilan LLM ganda,
  dan dua memori yang bisa bertentangan.
- **Summarizer Injection VectFox:** alasan ECOSYSTEM tetap berlaku. M5 melipat baris yang sudah dikurasi, bukan chat mentah.
- **Graf pengetahuan antar-NPC** (saksi per event, siapa tahu apa antar tokoh): melipatgandakan tulisan narator. Yang penting bagi
  kartu ini berpusat pada {{user}}, dan sudah tertutup oleh Knows, Secrets, jangkauan rumor, serta ringkasan VectFox yang menyebut
  siapa yang ada.
- **Menulis memori ke lorebook** (gaya STMB): tidak per pesan, jadi tidak aman terhadap swipe dan rollback, dan perubahan dunia sudah
  lewat state (DECISIONS §2, Lore changes).
- **Menaikkan trim 24 sebagai default:** angka playtest; biayanya di F6.
- **Memindahkan arsip tersembunyi** (`$Knows_old`, `$ui.archive`, `jnotes`, ledger) dari `stat_data` ke variabel chat sekarang:
  ukur dulu (M13). Cleanup MVU sudah membatasi pertumbuhan, dan pemindahan menyentuh semantik swipe.

## 6. Urutan pengerjaan yang disarankan

"kerjakan batch N" untuk file ini artinya: kerjakan hanya batch N sebagai satu rilis (aturan rilis `CLAUDE.md`), lalu isi kolom
Status. Setiap batch memakai fixture save; `stepMigrate` mengisi struktur baru dari state lama (pin, Chronicle, arsip Clues), jadi
chat owner tidak perlu diulang.

**Asumsi semua batch (owner, 2026-10-05):** owner akan bermain di mode extra-model MVU. Setiap batch dirancang dan diuji untuk mode
itu dan tetap jalan di mode satu panggilan:
- yang ditulis AI ada di kartu `[mvu_update]` dan berdiri sendiri, tanpa bergantung pada riwayat chat (AI update default hanya
  melihat 2 pesan) atau pada `<cast>`;
- yang hanya dibaca AI cerita bertag `[mvu_plot]` atau tanpa tag (D2), dicek `qa_static.cjs`.

Default kartu (507 `更新方式`) tetap satu panggilan sampai batch terakhir (9).

| Batch | Isi | Bergantung pada | Keputusan owner | Status |
|-------|-----|-----------------|-----------------|--------|
| 1 | Perbaikan cepat: M1, M2, M8, M9, M10a, M10b, M10d, M12 | – | tidak (§8 kecil di M2) | selesai (1.61.0) |
| 2 | Alat ukur: M13 (laporan memori + soak test) dan baseline | – | tidak | selesai (1.61.1) |
| 3 | Pin: M3, dan M4 bila owner setuju | 1 | §8; M4 ya/tidak | selesai (1.62.0; M4 dibangun, diam = setuju) |
| 4 | Lipatan bertingkat: M5 | 2, 3 | §8 baru (disetujui 2026-10-05) | selesai (1.63.0) |
| 5 | Recall per entitas: M6; retensi arsip diputuskan dari angka batch 2 | 4 | tidak | selesai (1.64.0; arsip 240) |
| 6 | 501 menurut relevansi: M7 | 2 | §8 kecil | selesai (1.65.0; 501 matang −35%) |
| 7 | VectFox dari sisi kartu: M11 (penanda adegan, nomor timeline, gist) dan setelan M10c (uji debug query owner) | 1, 2 | tidak | selesai (1.66.0) |
| 8 | Bab baru: M14, saat angka menunjukkan perlu | 4 | sudah (owner 2026-10-05: rencanakan sekarang, bangun saat ±20.000 pesan) | direncanakan: `planning/DRAFT_bab_baru.md` |
| 9 | Pindah ke extra-model: default 507 `更新方式` → extra-model, DECISIONS §9 dicatat, PLAYER_GUIDE §8 dibalik (cara kembali ke satu panggilan) | 1–7 (8 tidak wajib) | §9 sudah (owner 2026-10-05) | selesai (1.67.0) |

## 7. Keputusan owner yang dibutuhkan

1. **M4:** urusan terbuka disimpan di Hooks, dan Journal hanya mencatat titik balik? Saran: ya.
2. **M5:** diputuskan 2026-10-05. Bentuk "Summaryception mini" (L0–L3), ditulis AI update di mode extra-model lewat kartu
   `[mvu_update]`.
   - Owner akan bermain di mode extra-model. Default kartu (507 `更新方式`) dan DECISIONS §9 diganti di batch 9, setelah batch
     lainnya.
3. **M14:** bab baru dibuat nanti, saat simpan mulai lambat. Belum perlu diputuskan sekarang.

Usulan lainnya mengikuti aturan "diam = setuju".

## Lampiran A. Angka

- **State per lantai:**
  - chat owner M1 W1: 19–23 KB (Bonds 8 KB, `$ui` 6 KB);
  - `state_size 200`: 43 KB (45 bond);
  - `sim_year 336`: 56 KB (10 teman, tanpa tulisan memori narator), 14,2 ms per update;
  - state matang: 207 KB (Bonds 158 KB; satu bond dekat 5,8 KB: Knows 2,2 KB, Imprints 1,0, Milestones 1,0, Known_facts 0,9,
    Mind 0,4).
- **Laju narator** (chat owner, 37 balasan): Journal 1, Knows 1, Known_facts 13.
- **Ekspor VectFox owner** (prompt default):
  - 97 event / 212 pesan; ±908 karakter per event; importance 3–5 untuk 79 event;
  - semua `should_persist` true; 80 `open_threads`;
  - 21 dari 97 event bertipe `travel` / `location_change`.
- **501 dan muatan kartu per giliran:** F5.

## Lampiran B. Sumber luar

Ekstensi:
- Ringkasan 2026: [Best SillyTavern Memory Extensions (tavernsprite, 2026-08-24)](https://tavernsprite.com/blog/best-sillytavern-memory-extensions/)
- [Qvink Memory / MessageSummarize](https://github.com/qvink/SillyTavern-MessageSummarize) ·
  [Summaryception](https://github.com/vadash/Extension-Summaryception) ·
  [Memory Books](https://github.com/aikohanasaki/SillyTavern-MemoryBooks) ·
  [OpenVault](https://github.com/vadash/openvault) · [Smart Memory](https://github.com/senjinthedragon/Smart-Memory) ·
  [Layered memory](https://github.com/124135417/sillytavern-layered-memory) ·
  [MemPalace](https://github.com/ShinRalexis/Silly-Tavern-MemPalace-Extension) · [Memory Loom](https://github.com/ExtensionMuncher/MemoryLoom)

Riset, dan apa yang diambil kartu:

| Sumber | Inti | Untuk kartu ini |
|---|---|---|
| [Generative Agents (Park dkk., 2023)](https://arxiv.org/abs/2304.03442) | recall = kebaruan + penting + relevan; refleksi | re-rank VectFox sudah begini; Imprints/Mind = refleksi |
| [MemGPT (2023)](https://arxiv.org/abs/2310.08560), [Letta sleep-time](https://www.letta.com/research/) | memori inti yang diedit model + arsip; konsolidasi di waktu luang | state MVU = memori inti; M5 = konsolidasi |
| [Mem0 (2025)](https://arxiv.org/abs/2504.19413), [Zep/Graphiti (2025)](https://arxiv.org/abs/2501.13956) | update/hapus memori yang usang; validitas temporal | state kartu sudah begini untuk fakta keras; untuk VectFox lewat nomor timeline (M11b) |
| [RAPTOR (2024)](https://arxiv.org/abs/2401.18059), [TiMem (2026)](https://arxiv.org/abs/2601.02845) | pohon ringkasan; hierarki temporal | M5 |
| [LongMemEval (2024)](https://arxiv.org/abs/2410.10813), [MemOps (2026)](https://arxiv.org/abs/2607.12893) | yang paling sulit: pembaruan pengetahuan, penalaran waktu, urutan | tanggal di mana-mana (M10a), lipatan bertanggal (M5), alat ukur (M13) |
| [Context Rot (Chroma, 2025)](https://www.trychroma.com/research/context-rot), [Lost in the Middle (2023)](https://arxiv.org/abs/2307.03172) | input panjang dan posisi menurunkan mutu | M7; posisi VectFox sudah benar (ECOSYSTEM) |
