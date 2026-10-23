# Audit 2026-10-21: fitur Megumin Suite yang layak diambil untuk Halvard

Permintaan owner: audit lengkap `D:/Claude Project/Megumin-Suite-Beta-main`, lalu cari fitur yang menarik untuk kartu Halvard. Tidak ada
kode kartu yang diubah. File ini tidak di-commit (aturan folder `audit/`).

## 1. Ringkasan

Megumin Suite (KazumaONIISAN, beta 1.1.0, catatan terbaru 2026-10-18) adalah **ekstensi SillyTavern plus preset**, bukan kartu. Isinya
162 file: preset V7 sampai V11 dan CoT-nya, "Blocks" (World State, Bonds, Character Sheet, CYOA, Dice, Inner Chatter), Author's
Notebook, NPC Bank, Memory Core, Story Director, Banned Phrases, Image Gen (ComfyUI), dan "Chomusuke" (model kedua untuk pekerjaan
latar).

Arah pengembangan Megumin selama tiga bulan terakhir adalah menuju apa yang sudah dimiliki Halvard sejak awal: state disimpan oleh kode
(bukan dibaca ulang model dari blok lama), nilai terkini dikirim sekali, blok lama dibuang dari prompt, swipe membatalkan tepat apa
yang diubah balasan itu. Halvard mendapatkan semua itu dari MVU, engine deterministik, 501/505 dan regex strip. Jadi sebagian besar
fitur besar Megumin **sudah ada** di Halvard, sering dalam bentuk yang lebih kuat (§3).

Yang tersisa adalah lima ide kecil sampai sedang (§2), semuanya dipasang ke sistem yang sudah ada:

| # | Usulan | Dari Megumin | Biaya prompt | Ukuran |
|---|---|---|---|---|
| MS1 | Lipatan "This reply": semua yang diubah engine di balasan ini | "Changed in this reply" di kartu World State | 0 token, 0 byte di save | M |
| MS2 | Dua sampai tiga angka Fortune per balasan, satu per percobaan | Dice: daftar angka yang dipakai berurutan | ±8 token | S |
| MS3 | Cek bahwa Clue baru (dan Hook "detail") benar ada di prosa | Notebook: clue "not found in the reply" | 0 (tahap 1) | S |
| MS4 | Recall arsip Journal dari kata di pesan pemain sendiri | Memory Core: cari dari pertanyaan pemain | 0 biasanya, ±40 saat kena | S–M |
| MS5 | Extras `Looks` ditulis "seperti di hari biasa" | NPC Bank: framing "2pm on an ordinary Tuesday" | 0 | XS |

## 2. Usulan

### MS1. Lipatan "This reply" di bracelet

**Megumin.** Setiap pesan punya strip terlipat "Changed in this reply" (`Aqua · Outfit: blue dress → bath towel`) dengan Revert dan
Restore (`src/features/worldstate/card.js`, dari jurnal per pesan di `src/state/store.js`).

**Halvard sekarang.** Bracelet menampilkan paling banyak 4 toast kejadian dari `$ui.toasts` (`sb:` `news`, `slice(-4)`), dan Student
file → Log menampilkan 12 baris `_Log`. Toast hanya mencatat kejadian (New clue, Rank fell, Not bought). Angka tidak tampil: XP bond per
orang, gerak Trust dan Tension, Points dan Coin per baris, XP reputasi dan proficiency, HP, mana dan stamina, cedera dan kondisi yang
datang atau sembuh, barang masuk dan keluar Bag.

**Usulan.** Di bawah `news`, satu baris terlipat "This reply (n)". Bracelet sudah membaca state per pesan lewat
`getVariables({ type: 'message', message_id })` (`readState`). Ia cukup membaca state pesannya sendiri dan state sebelumnya (pesan
terdekat sebelum `MID` yang punya `stat_data`, termasuk entri player-tool tersembunyi, jadi sama dengan `B` engine), lalu menulis
selisihnya dalam baris pendek per kelompok: People, Money, Body, Studies, Bag, Records. Fungsi selisihnya di `src/scripts/shared.js`
supaya panel bisa memakainya juga.
- Visibilitas mengikuti panel: nama hanya bila `knowsName`, Tension sebagai band seperti di People, Hooks tidak pernah tampil, angka
  Fortune tidak tampil (narator memainkan band tanpa menyebut angka).
- Revert tidak perlu: swipe sudah membatalkan lewat floor MVU.

**Kenapa dihitung di UI, bukan di engine.** Kalau engine menulis `$ui.delta`, 501 memang tidak mencetaknya (501 melewati kunci `$`),
tetapi ±0,5 KB ikut tersimpan di snapshot setiap pesan. Pada 20.000 pesan itu ±10 MB, padahal ukuran file chat adalah alasan batch 8
(`planning/DRAFT_bab_baru.md` §0). Selisih di UI tidak memakan prompt maupun save.

**Manfaat.** Pemain langsung melihat apa yang dihitung engine. Owner bisa mencentang quest log `docs/TEST_CHECKLIST.md` dari chat,
tanpa membuka panel satu per satu.

**Tes.** Suite baru dengan dua state fixture (sebelum dan sesudah) yang memeriksa baris, urutan dan gerbang visibilitas. Keputusan
yang disentuh: tidak ada (§6 UI design system dan §7 tetap berlaku; warna dari token).

### MS2. Beberapa angka Fortune per balasan

**Megumin.** Add-on Dice (`data/addons.js`) memberi model 3 angka per giliran, diambil berurutan satu per percobaan: "if the list runs
out, there are no further rolls this turn". Alasannya: percobaan yang tidak tercakup daftar adalah angka yang dikarang model.

**Halvard sekarang.** `stepFortune` membuat satu `d100(seed, 'fortune', turn, absA)`, 505 mencetak satu angka, dan 504 berkata "Take
the Fortune number in <now>". Dua percobaan berisiko dalam satu balasan (menyelinap, lalu membuka kunci) berbagi satu nasib, atau
narator mengarang angka kedua.

**Usulan.** `$ui.fortune.rolls = [r1, r2, r3]` dengan `r1` = `roll` yang sekarang, sehingga crafting (`stepProficiency`, yang membaca
`f.roll`) dan save lama tidak berubah. 505: "Fortune (important uncertain attempts only; one number per attempt, in order): 37, 82, 14".
504 mendapat satu klausa. Draw tetap lewat seed. Seed Halvard lebih kuat dari angka acak kripto Megumin: angkanya sama di setiap swipe,
jadi pemain tidak bisa me-reroll dengan swipe.

**Biaya dan tes.** ±8 token per giliran selama Fortune menyala. Perluas `tests/test_fortune_v198.cjs`; jalankan suite yang meng-grep
kalimat Fortune di 504/505.

### MS3. Clue dan Hook "detail" dicek terhadap prosa

**Megumin.** `clueInProse` (`src/state/modules/notebook/parse.js`): kata clue yang bukan nama, minimal 4 huruf, dipotong ke 5 huruf
pertama, tanpa kata umum; bila tidak satu pun ada di prosa balasan, clue tetap disimpan tetapi ditandai "not found in the reply".

**Halvard sekarang.** `stepRecords` memberi Clue baru tanggal Found dan toast "New clue". Tidak ada yang memeriksa prosa. Clue yang
hanya ada di state tetap muncul di Mystery Board, dan narator berikutnya menganggapnya sudah ditemukan.

**Data.** Satu-satunya chat kampanye dengan state yang cukup panjang (2026-10-05, 38 balasan AI, 14 dengan state) hanya punya 1 Clue
baru, dan Clue itu buatan engine (lore yang terdengar). Belum ada bukti ke arah mana pun.

**Usulan bertahap.**
1. Tanpa token: tambahkan cek ini ke `tools/audit_chat.py --mechanics`. Prototipe ±60 baris sudah ada di scratchpad sesi ini
   (`phantom_clues.py`) dan bisa digabung dengan U1 (mode `--prose`) yang menunggu di `planning/FUTURE_PLANS.md` §2.
2. Hanya bila ekspor berikutnya menunjukkan clue hantu: engine menandai `_Unseen`, `stepReminders` mengingatkan sekali ("in the records
   but not in the story: show it or remove it"), Mystery Board menampilkannya redup. Clue dengan `Source` `records` (Encyclopaedic, lore
   yang terdengar) dikecualikan.

### MS4. Recall yang mengikuti pesan pemain

**Megumin.** Catatan rilis 2026-08-18: Memory Core dulu mencari dengan "pesan pemain + balasan terakhir". Balasan ±2.000 karakter,
pertanyaan ±200, jadi pertanyaan pemain hanya ±1/8 teks pencarian dan yang terambil adalah ingatan tentang adegan yang baru ditulis.
Sesudah diperbaiki: cari dari pesan pemain, dan hasilnya disiapkan sebelum prompt dibangun (dulu datang satu giliran terlambat).

**Halvard sekarang.** `recallOf` mengembalikan baris arsip yang menyebut orang dengan lembar penuh (3) dan tempatnya (2). Daftar `ment`
di Cast Sheet dan `focusOf` diambil dari prosa balasan terakhir dan pesan pemain sebelumnya. Engine berjalan sesudah balasan, jadi pesan
pemain yang **baru** hanya sampai ke kartu lewat keyword lore ST dan VectFox. Contoh: pemain menulis "I ask Etnie what happened with Zara
at the festival" saat Zara tidak hadir; baris Journal lama tentang Zara tidak ikut.

**Usulan.** Di 505, saat render: cocokkan pesan pemain terbaru dengan `$ui.archive` untuk nama roster yang tidak hadir, Extras dan
tempat; cetak paling banyak 2 baris "Earlier (named in your message)", format sama dengan `recall`.

**Harus diverifikasi dulu** (DECISIONS §11): cara entri EJS Prompt Template membaca pesan pemain terbaru saat render. Bila tidak bisa,
usulan ini gugur. Catatan VectFox: temuan Megumin menguatkan saran yang sudah ada di `docs/ECOSYSTEM.md` ("Query messages: try 1");
itu bukan fitur baru.

### MS5. Extras `Looks` untuk hari biasa

**Megumin.** `src/features/npc/fields.js`: field yang bertahan ditulis "as it would still be true at 2pm on an ordinary Tuesday".
Catatan rilisnya menjelaskan pelajarannya: larangan yang menyebut jawaban salah ("never the current scene, e.g. your bed") justru
membuat jawaban itu lebih sering muncul; framing yang membuat adegan sekarang secara struktur salah lebih berhasil.

**Halvard sekarang.** 502: `"Looks": "what anyone notices first"`. Record ditulis di kemunculan kedua, sering di tengah adegan (basah
kuyup, berbaju pesta, berdarah), padahal record bertahan lebih lama dari adegan: `$ui.xold` dan `$ui.xgone` membawa wajah yang sama saat
tokoh itu kembali.

**Usulan.** `"Looks": "what anyone would notice about them on an ordinary day"`. Hanya kata-kata; cek suite yang meng-grep 502. Data
belum ada (chat 2026-10-05 tidak punya Extras).

## 3. Sudah ada di Halvard

| Fitur Megumin | Padanan di Halvard |
|---|---|
| World State dan Bonds disimpan ekstensi; swipe, edit dan hapus membatalkan tepat yang diubah | State MVU per pesan; engine deterministik |
| Current Info: nilai terkini sekali; Bonds hanya untuk yang relevan | 501 (bond yang absen satu baris), Cast Sheet penuh untuk 4 yang hadir, `focusOf` |
| Hide old blocks from the AI | Regex "UpdateVariable: strip from prompt" |
| Tokoh kembali dengan rupa terakhir; nama pendek = nama lengkap | `stepExtras` (`xMatch`, `$ui.xold`, `$ui.xgone`) |
| Dice "jujur": angka dari ekstensi, ditulis sebelum cerita | Fortune berseed di `<now>` sebelum narator menulis, sama di setiap swipe |
| Thinking Cap: aturan diulang sebagai hal terakhir yang dibaca | 503 dan 510 di depth 0 |
| Immersive HTML (surat, papan, layar sebagai HTML) | RF "Pop in Graphics" di preset |
| Cache Friendly preset | Entri dinamis di depth 0–1; bagian di atas riwayat stabil (`docs/ECOSYSTEM.md`, Size) |
| Forgiving readers, popup saat jawaban model rusak | `recoverPatch`, toast "Update block unreadable", rollback engine |
| Timers, seeds, threads, Story Tracker | Agenda, Commitments, Hooks, Mysteries |
| Memory Core (ringkasan dan vault) | Folds/Chronicle, Pins, Recall, VectFox EventBase |
| Present bar, popup semua bond | Strip potret bracelet, People panel dengan lima urutan |
| CYOA sebagai tombol | Tombol hanya membuat draf (DECISIONS §7); aksi scene card |
| Dialogue Colors | `<say:Name>`, 12 warna tanpa bentrok di satu adegan |
| Token counter, sakelar fitur | Settings → Features dengan biaya token; state diparkir |
| Branch memangkas NPC dan memori masa depan | Floor MVU; timeline VectFox (`eld_tl`) |

## 4. Tidak diambil, dengan keputusan yang disentuh

- **Chomusuke sebagai bawaan** (model kedua untuk pekerjaan latar): DECISIONS §9, satu model per giliran sejak 1.69.0; parsing model
  tambahan sudah tersedia sebagai opsi lewat MVU.
- **Dadu acak sungguhan** (`crypto.getRandomValues`): CLAUDE.md, engine deterministik dan replay-safe. Angka acak baru di setiap swipe
  membuka reroll lewat swipe.
- **Dice: Everyone** (NPC ikut melempar): prinsip "NPC bereaksi sesuai karakter; mekanik tidak boleh memaksa NPC"; 504 sudah melarang
  Fortune untuk pilihan bebas NPC.
- **Story Director** (perencana alur): prinsip tanpa ending dan tanpa rute; 504 membatasi asal kejadian dunia.
- **Author's Notebook** (narator mengarang kebenaran tersembunyi): aturan Canon (lorebook owner adalah canon; isi karangan tidak boleh
  bertentangan). Hooks `Kind: secret` sudah menampung utang cerita narator. Aturannya "When {{user}} goes where a truth is kept, they
  find it" juga bertentangan dengan prinsip "rank tinggi membuka informasi" (field dossier dan rahasia terbuka per rank).
- **Banned Phrases dinamis**: Perpustakaan Buku 05 §2 dan audit slop 2026-10-21 menilai daftar larangan lemah.
- **Preset V10/V11, Story Config, Thinking Cap, Enhanced Dialogue, gaya tulis, model guide**: wilayah preset; DECISIONS §9 "Preset =
  upstream as it ships" dengan daftar deviasi tertutup. Kalau owner mau, V11 bisa menjadi buku baru di Perpustakaan preset.
- **Image Gen V2**: kartu tidak membuat gambar; potret adalah aset tetap (DECISIONS "Assets").
- **Editor Bonds dan Sheet manual**: DECISIONS §2 "Player tools", pemain hanya mengubah Student file; bond milik engine.

## 5. Pengukuran yang dijalankan

- **Regex (pelajaran "lag 600 ms" Megumin, 2026-08-28).** Diuji dengan balasan ±20 KB dan kasus terburuk buatan. 12 regex kartu: paling
  lambat 0,09 ms di balasan wajar (1,4 ms di kasus buatan dengan 400 tag terbuka). 62 regex preset: paling lambat 0,21 ms. Tidak perlu
  tindakan.
- **Clue hantu.** Lihat MS3: data belum cukup.
- **Kode dari teks AI** (perbaikan keamanan NPC Bank Megumin). Cek sekilas UI: teks tulisan narator selalu lewat `esc()`; dua
  interpolasi yang tampak mentah ternyata ada di dalam `esc(...)` luar. Tidak ada temuan.

## 6. Batch pengerjaan

Owner (2026-10-21): bagi MS1–MS5 menjadi 3 batch; "kerjakan batch N" = satu batch, satu rilis.

| Batch | Isi | Bergantung pada | Status |
|---|---|---|---|
| 1 | **MS2 + MS5**: beberapa angka Fortune, Extras `Looks` untuk hari biasa (engine + teks kartu) | – | selesai (1.78.0, 5ae3b8e) |
| 2 | **MS1**: lipatan "This reply" di bracelet (UI saja) | – | selesai (1.79.0, 920e32b) |
| 3 | **MS3 tahap 1 + MS4**: cek clue di `tools/audit_chat.py --mechanics`; recall dari pesan pemain di 505, setelah cara EJS membaca pesan pemain diverifikasi (gugur bila tidak bisa). MS3 tahap 2 hanya bila ekspor menunjukkan clue hantu | – | selesai (1.80.0, 0e4d4ea; tahap 2 MS3 di FUTURE_PLANS §2) |
