# DRAFT — Inspirasi dari 2 preset luar (2026-09-28, card 1.9.7)

Status: **A1 dibangun di card 1.9.8 (2026-09-28)** dengan arahan owner: hanya untuk hal penting, longgar (Gentle default), modifier situasi termasuk magic yang cocok (invisibility). **A3 dicatat sebagai FP11** di `planning/FUTURE_PLANS.md`. A2, A4, A5 dan B1–B3 belum diputuskan.

Sumber: `outside_reference/Pura's Director Preset 16.0 (SillyTavern).json` (77 prompt, 26 regex) dan
`outside_reference/Izumi 0914 (English).json` (227 prompt, 32 regex, satu script Tavern Helper "Izumi Floating Window" ~600 KB).
Semua prompt, regex, dan fungsi utama script dibaca. Pembanding: preset Eldrasil (Realistic Frankenstein 2.2 edit, 41 prompt aktif)
dan card (502–510, engine).

## Gambaran kedua preset

- **Pura (Director 16.0).** Preset "co-director" yang ringan (~1,300 token main prompt). Isinya: main prompt yang rapi
  (continuation, causality, turn end), daftar anti-slop, randomiser scene (`{{random}}`), dan banyak tracker berbasis tag + regex
  (relationship, secrets, events, reputation, off-screen, world detail, achievements, CYOA dengan d100, level-up).
  **Hampir semua tracker-nya sudah dimiliki Eldrasil dalam bentuk yang lebih kuat** (engine + state MVU, bukan teks yang ditulis
  ulang AI tiap balasan).
- **Izumi 0914.** Preset persona ("Izumi Konata", penulis yang menjadi pasangan user), sebagian besar gaya tulisan
  berbahasa Mandarin, CoT berbahasa Mandarin/Jepang, dan jailbreak. Script-nya adalah **pengelola toggle preset**
  (simpan/pulihkan set toggle, snapshot sesi, quick slot), plus fitur **Advice** dan **Sanitizer**, dan generator ide
  interaksi ("Wordflow").
  - **Advice** memindahkan input pemain ke dalam giliran assistant sebagai `<advice>`, dan **Sanitizer** menyamarkan kata dengan
    zero-width space / zhuyin. Keduanya teknik mengakali filter konten model. **Tidak diusulkan.** Prompt "Anti-Truncation" Izumi
    juga berupa disclaimer jailbreak; tidak diusulkan.

## A. Usulan untuk card / engine (spesifik Eldrasil)

| # | Usulan | Asal inspirasi | Token | Usaha | Dampak |
|---|---|---|---|---|---|
| A1 | **Fortune roll**: d100 dari engine, tetap sama saat swipe | Pura "CYOA with Skill Checks", BOLT `{{roll::1d20}}` | ~25/pesan + ~50 di 504 | kecil | tinggi |
| A2 | **Usulan nama** untuk tokoh karangan narator, dari pool nama per asal | Pura "Name Randomiser + Banned Names" | ~20, hanya saat ada orang di scene | kecil (+ canon nama) | sedang |
| A3 | **Alasan inisiatif NPC yang bervariasi** (tempat × kegiatan × permintaan) | Izumi "Wordflow" | 0 tambahan (baris yang sama) | sedang | sedang |
| A4 | **Laporan slop** di `tools/audit_chat.py` | Pura "Grounded Prose Rules", Izumi "Kill Nonexistent Accomplice" | 0 (alat offline) | kecil | sedang (data untuk menyetel preset) |
| A5 | **Rekap satu baris** untuk pesan lama yang dipangkas | Izumi "Keep Only Progress (after message 11)" | ~25 output/balasan + prompt | sedang | rendah–sedang |

### A1. Fortune roll (disarankan paling dulu)

**Sekarang.** Narator memutuskan sendiri apakah aksi {{user}} yang tidak pasti berhasil (menyelinap, meyakinkan Dove, spell sulit).
BOLT punya `{{roll::1d20}}`, tetapi hanya untuk DnD Simulator yang OFF di card ini. Dan `{{roll}}` SillyTavern berubah setiap swipe,
jadi pemain bisa swipe sampai berhasil.

**Usulan.** Engine melempar d100 seeded (seed chat + menit in-world + nomor giliran) di akhir setiap update dan menyimpannya di
`$ui`. `<now>` pada balasan berikutnya menampilkannya. Karena dihitung dari state sebelum balasan, **semua swipe mendapat angka
yang sama**: hasil aksi tidak bisa di-reroll, hanya prosanya. Engine juga menuliskan modifier yang sudah diketahuinya dari state:
Chilled −10, Exhausted −15, cedera moderate+ −10, spell di specialty +10, Overheated −10.

**Teks card:**
- `<now>`: `Fortune for this reply: 37 (modifiers now: Chilled −10).`
- 504: `Use Fortune only for a genuinely uncertain attempt by {{user}} or a contest (never for ordinary actions): add the modifiers, then 1–30 fails with a consequence, 31–70 succeeds at a cost or partly, 71–100 succeeds cleanly. Narrate the outcome, never the number.`

**Risiko.** Batas 30/70 menentukan rasa sulitnya permainan; dibuat bisa diatur di Settings (`data/tuning.json`).

### A2. Usulan nama untuk tokoh karangan

**Sekarang.** 502 punya pola nama roster, dan preset punya daftar larangan pendek (Elara, Vane, Seraphina). Model tetap cenderung
memakai nama "AI" yang sama (Kael, Lyra, Silas, Voss…).

**Usulan.** Daftar nama kecil di data (Human continental, Elf, Beastkin, plus asal negara: Arslan, Norvaine, Velmora, Caelmar,
Yozakura). Engine memilih tiga nama seeded per hari yang belum dipakai roster atau Extras. Nama itu tampil di cast gate (510),
yang hanya muncul saat ada orang di scene.
- Teks: `If a new person needs a name now, take one of: Oren Vask, Maribel Thorley, Hana Kurose.`
- **Butuh canon baru:** pola nama per negara belum ada di lore. Daftar nama akan didraf terpisah untuk disetujui.

### A3. Alasan inisiatif NPC yang bervariasi

**Sekarang.** FP1 (v1.7.7) memilih NPC Rank 3+ yang mencari {{user}}, dengan alasan dari Stage-nya. Dalam permainan panjang,
alasannya cenderung berulang.

**Usulan (gaya Wordflow, tetapi seeded).** Engine menyusun alasan dari data yang sudah ada: tempat (regulars NPC) × kegiatan
(klub, hobi, barang yang disukai dari `gift_prefs.json`) × jenis permintaan (ajak, minta tolong, tawarkan, curhat sesuai Rank).
Kombinasi yang sudah dipakai dicatat supaya tidak berulang. Contoh: `Saffi wants {{user}} to try the new blossom cakes at the Mall bakery with her.`
Token sama dengan baris inisiatif sekarang.

### A4. Laporan slop di audit chat

**Usulan.** `tools/audit_chat.py` menghitung frasa klise yang sering muncul (daftar gabungan Pura dan preset Eldrasil: "a beat",
"ozone", "knuckles whitening", "jaw working", "ledger" untuk non-akuntan, "something shifted", "not X but Y", dst.) per 25 pesan
di chat yang diekspor. Hasilnya menunjukkan larangan mana yang benar-benar perlu ditambahkan ke preset, alih-alih menambah
daftar panjang secara buta (Pura sendiri mengingatkan daftar larangan panjang bisa berbalik efek di model kecil).

### A5. Rekap satu baris untuk pesan lama

**Sekarang.** Regex "State-as-memory: trim far chat" membuang pesan di luar ~24 terakhir; Journal (30 baris) dan VectFox yang
menutup celahnya.

**Usulan.** Narator menulis satu baris `<recap>` tersembunyi di setiap balasan. Untuk pesan yang dipangkas, regex menyisakan
baris itu saja (teknik Izumi). **Biaya** sekitar 25 token output per balasan, ditambah prompt untuk pesan-pesan lama. Karena
Journal dan VectFox sudah ada, prioritasnya rendah.

## B. Usulan untuk preset Eldrasil (generik, sebagai toggle atau baris kecil)

| # | Usulan | Asal | Token |
|---|---|---|---|
| B1 | Daftar nama terlarang diperluas di HQ NPC Genesis | Pura (57 nama) | ~80 |
| B2 | Beberapa larangan klise yang belum ada di preset | Pura "Grounded Prose Rules" | ~50 |
| B3 | Toggle **Grounded Complication** (default OFF) | Pura | 0 saat OFF, ~200 saat ON |

- **B1.** Tambahkan daftar Pura ke larangan yang ada, **kecuali "Kira"** (Kira Brannock adalah NPC canon Eldrasil; hanya nama ini yang
  bertabrakan dengan roster). Karena preset generik, ini berlaku untuk tokoh karangan di card mana pun.
- **B2.** Yang belum dicakup preset Eldrasil: metafora akuntansi untuk non-akuntan ("files it away"), buku jari memutih, dialogue beat
  ala sitkom, perumpamaan yang tidak spesifik pada tokoh. ("A beat", "ozone", "sandalwood", "ledger", "jaw" sudah ada.)
- **B3.** Satu komplikasi realistis per balasan (rintangan praktis, gesekan sosial, informasi timpang, gangguan, konsekuensi lama
  datang), acak dengan `{{random}}`. OFF secara default, karena card sudah punya happenings, inisiatif NPC dan hooks; berguna
  untuk pemain yang merasa scene terlalu mulus.

## C. Tidak diusulkan (dan alasannya)

| Fitur | Alasan |
|---|---|
| Izumi Advice, Sanitizer, "Anti-Truncation" disclaimer, jailbreak | Teknik mengakali filter konten model. |
| Izumi persona (penulis-kekasih "Master"), Tucao, Danmaku, gaya bahasa Mandarin/Jepang | Tidak sesuai card berbahasa Inggris dan pembagian card vs preset. |
| Pura tracker Time/Scene/Status/Item/Secrets/Pending Events/Reputation/Relationship/NPC sheets/Parallel/World Detail | Sudah ada di Eldrasil sebagai state engine (lebih andal daripada teks yang ditulis ulang AI): clock, bracelet, Conditions, Inventory, Clues, Commitments, Rep, Bonds + Cast Sheet, Meanwhile/Next, Hooks. |
| Pura Achievements | Hanya kenang-kenangan; bertentangan dengan prinsip owner "reward harus berguna, bukan memento". |
| Pura Level-Up / Persona Stats | Eldrasil punya training yang anti-grind; level bebas dari AI melanggar prinsip itu. |
| Pura Diegetic Stats | Bertentangan dengan canon (saldo dan status bracelet bersifat pribadi). |
| Pura Direction Menu / Izumi Option Bar | Preset Eldrasil sudah punya "Fat Man's Narrative Drive" (plot branches, OFF) dan opsi HOLD di BOLT. |
| Pura Friction / Nightmare Difficulty, NSFW/Gooner/Dead Dove | Friction sudah dicakup Tension dan NPC Instincts; sisanya di luar nada card. |
| Izumi pengelola toggle (plans, snapshot, quick slot) | Alat UI untuk mengelola preset, bukan fitur campaign; berat (~600 KB) untuk manfaat kecil di card ini. |

## [?] Keputusan owner

1. **A1 Fortune roll:** bangun? Saran: ya, paling dulu. Batas 30/70 bisa diubah di Settings; swipe tidak mengubah angka (saran: tetap begitu).
2. **A2 usulan nama:** bangun? Kalau ya, saya draf daftar nama per ras dan negara dulu (canon baru) untuk disetujui.
3. **A3 alasan inisiatif bervariasi:** bangun, atau catat di future plans?
4. **A4 laporan slop:** bangun (alat offline, tidak menyentuh card)?
5. **A5 rekap baris:** lewati (saran), atau catat di future plans?
6. **B1–B3 di preset:** terapkan B1 dan B2 (saran: ya); B3 sebagai toggle OFF (saran: ya)?
