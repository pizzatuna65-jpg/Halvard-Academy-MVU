# DRAFT — Bab baru tanpa kehilangan memori (memory audit M14, batch 8)

Dicatat: 2026-10-05, atas permintaan owner ("rencanakan saja sekarang agar nanti ketika saya capai 20.000 pesan kamu tahu apa yang
perlu dilakukan"). Sumber: `audit/AUDIT_2026-10-05_1_sistem_memori.md` F4 (substrat) dan M14; angka dari
`audit/AUDIT_2026-10-05_2_baseline_memori.md`.

**Status:** rencana disetujui untuk dikerjakan **nanti**. Keputusan owner untuk M14 sudah ada: rencanakan sekarang, bangun saat
pemicu di §1 tercapai. Saat itu "kerjakan batch 8" = kerjakan draft ini sebagai satu rilis (aturan rilis `CLAUDE.md`), lalu hapus
draft ini. Semua pilihan di bawah sudah diputuskan (diam = setuju). Tidak ada `[?]` yang tersisa.

## 0. Masalahnya, singkat

- SillyTavern memuat dan menyimpan **seluruh** file chat di setiap pesan, plus sampai 50 backup per chat.
- Proyeksi: 20.000 pesan ≈ 100–145 MB (teks ±4,7 KB per pesan + snapshot MVU). Di atas itu, teks chat sendiri yang jadi batas;
  setelan MVU hanya membantu sedikit.
- Jalan keluarnya: cerita pindah ke **file chat baru** (bab), dan memorinya tetap bersambung:
  - state penuh dibawa;
  - Chronicle, Journal, arsip, bond dan seed ikut di state;
  - VectFox bab lama dicari sebagai arsip;
  - adegan terakhir dibawa lewat pesan jembatan.

## 1. Pemicu (kapan dikerjakan)

Mana yang lebih dulu:
- chat mencapai **±20.000 pesan** (owner, 2026-10-05);
- menyimpan terasa lambat (**> ±2 detik** per pesan);
- file chat **> ±100 MB** (folder `data/<user>/chats/<karakter>/` di server ST).

Cara memastikan angka saat owner bertanya:
- minta ekspor chat (.jsonl);
- jalankan `python tools/audit_chat.py "<chat.jsonl>" --memory --no-drift`, yang memberi ukuran state, KB per pesan dan proyeksi
  file;
- bandingkan dengan baseline.

Pemicu ini tidak dibuat otomatis sekarang. Bagian 4.1 menambahkan pengingat di UI saat batch 8 dibangun.

## 2. Bentuk akhirnya (yang dilihat owner)

1. **Student file → Chapters → "Start a new chapter".** Dialog menjelaskan apa yang dibawa, lalu meminta konfirmasi.
2. Kartu membuat chat baru untuk karakter yang sama.
3. Pesan pertama chat baru berisi **jembatan**: adegan terakhir dari bab lama, terlipat di layar.
4. State bab lama ditulis ke pesan pertama itu. Panel, bracelet dan engine langsung melanjutkan: jam, tempat, uang, bond, Journal,
   Chronicle, misteri, semuanya.
5. Toast terakhir memberi dua langkah VectFox (§6). Owner lalu menulis pesan berikutnya seperti biasa.
6. Chat lama tetap ada sebagai arsip (dibaca saja).
   - Jangan dilanjutkan, dan jangan di-branch untuk melanjutkan cerita: dua timeline bisa bercampur di VectFox.
   - Daftarnya ada di Student file → Chapters.

## 3. Apa yang dibawa

| Bagian | Dibawa? | Catatan |
|---|---|---|
| `stat_data` lantai terakhir (semua field, `$ui`, `$eng`) | ya, utuh | termasuk `_Chronicle`, `_Kept_from_earlier`, Journal, `$ui.archive` 240, `$eng.jq`, `$Knows_old` / `$Known_old`, ledger rahasia, `$eng.seed` (undian deterministik bersambung) |
| `$eng.floor` | direset ke 0 | nomor lantai mulai lagi; `snapGap` tidak salah alarm |
| `$eng.tool` dan field per-balasan (Interactions, `/Fold`, dll.) | dikosongkan | seperti setelah engine berjalan |
| Teks 24 pesan terakhir (jendela verbatim narator) | ya, sebagai **jembatan** (§5) | prosa saja |
| Pesan lain bab lama | tidak | tetap di file lama; VectFox mencarinya sebagai arsip |
| Koleksi VectFox | tidak disalin | dikunci sebagai arsip ke chat baru (§6) |
| Catatan bab | baru | `$ui.chapters` (§4.2) |

Satu fungsi murni, `chapterCarry(S, info)` di `src/scripts/shared.js`, membuat state bawaan. UI dan tes Node memakai fungsi yang
sama. Satu sumber, tanpa salinan logika di dua tempat (pakai sistem yang sudah ada).

## 4. Perubahan di kartu

### 4.1 UI (`ui.template.js`, Student file)

- Bagian baru **Chapters** di Student file:
  - nomor bab sekarang, jumlah pesan di chat ini, perkiraan ukuran (`JSON.stringify(chat).length`, dibulatkan);
  - daftar bab lama (nama file, rentang tanggal dunia, jumlah pesan);
  - tombol "Start a new chapter".
- **Pengingat**, sekali per ambang: toast pada 15.000 dan 20.000 pesan, atau bila ukurannya > 80 MB.
- **Alur tombol:**
  1. konfirmasi (teks di §8);
  2. `SillyTavern.saveChat()`;
  3. baca state lantai terakhir lewat `getVariables` (cara yang sudah dipakai `latestState()`);
  4. susun jembatan (§5) dan `chapterCarry`;
  5. simpan keduanya di penyimpanan lintas-chat (§7, butir 3);
  6. buat chat baru (§7, butir 1);
  7. di chat baru, setelah MVU selesai menginisialisasi lantai 0: ganti teks lantai 0 dengan jembatan (`setChatMessages`), tulis
     state dengan `Mvu.replaceMvuData(carry, { type: 'message', message_id: 0 })` (pola `writeToolMessage`), lalu simpan;
  8. hapus data sementara; toast VectFox.
- **Alur cadangan**, bila chat baru tidak bisa dibuat dari skrip (§7, butir 1):
  - tombol menjadi "Prepare a new chapter": langkah 1–5, lalu toast "Now start a new chat (☰ → Start new chat)";
  - skrip di chat baru yang hanya berisi greeting mendeteksi bab yang menunggu dan menawarkan "Continue chapter N here?";
  - jawaban ya menjalankan langkah 7–8.
- **Penjaga:**
  - tombol mati selama generasi berjalan;
  - data sementara kedaluwarsa setelah 1 jam;
  - jalur cadangan menolak chat yang sudah punya pesan pemain;
  - bila langkah 7 gagal, chat baru dibiarkan berisi greeting dan data sementara tetap ada, jadi bisa dicoba lagi.

### 4.2 State dan engine

- `schema.js`: `$ui.chapters` = daftar `{ n, file, from, to, msgs }`, paling banyak 50, ditulis UI. Bab sekarang = panjang daftar + 1.
- Engine, di update pertama sesudah bawaan:
  - satu catatan di `$ui.jnotes`: "Chapter N began (the story continues from <file>)." Ini pembukuan, bukan baris Journal narator;
  - tidak ada aturan baru untuk narator.
- Tidak perlu `stepMigrate`: field baru punya default kosong.
- Lipatan, pin, recall dan relevansi tidak berubah: semuanya ada di state, jadi ikut terbawa.

### 4.3 Regex dan VectFox

- Jembatan dibungkus `<chapter_bridge>…</chapter_bridge>`.
- Regex kartu (display, `markdownOnly`): blok itu jadi `<details>` terlipat "Previously (chapter N−1)".
- Prompt tetap mengirim isinya utuh, karena narator butuh adegan terakhir.
- `src/vectfox/vectfox_cleaning_patterns.json`: satu pola yang membuang `<chapter_bridge>[\s\S]*?</chapter_bridge>` sebelum ekstraksi.
  Tanpa pola itu, VectFox mengekstrak adegan yang sama dua kali (sekali di bab lama, sekali di jembatan).

## 5. Jembatan

- **Isi:** prosa dari 24 pesan terakhir bab lama, yaitu pesan yang memang masih dilihat narator (trim regex, minDepth 24).
  - Dibuang dari tiap pesan: blok `<UpdateVariable>`, `<npc_thoughts>`, dan pesan tersembunyi (player tool).
  - Pesan pemain diberi label `{{user}}:`, balasan narator diberi label nama karakter.
- **Batas:** ±8.000 token; yang tertua dibuang lebih dulu. Ini kurang-lebih setara dengan jendela verbatim yang dilihat narator di
  bab lama, jadi giliran pertama bab baru tidak terasa putus.
- **Memudar seperti biasa:** sesudah 24 pesan baru, jembatan sendiri menjadi "[…]" karena trim regex.
- **Teks kartu (English):**

```
<chapter_bridge>
[Previously, the end of chapter {N-1}. The story continues from this exact moment; <current_state> holds everything else.]
{{user}}: …
{char}: …
</chapter_bridge>
```

## 6. VectFox

- Koleksi bab lama **dikunci sebagai arsip** untuk chat baru. VectFox 3623dc8 mencari koleksi arsip secara paralel
  (`_gatherArchiveEventCollections`) dan mengurutkan hasilnya per percakapan.
- Event lama membawa `scene_time` dengan tahun kampanye (pola 1.61.0), jadi urutan waktunya tetap benar lintas bab.
- Koleksi baru: satu per bab ("one chat, one collection", `docs/ECOSYSTEM.md`).
- Langkah persis di UI VectFox ditulis ke PLAYER_GUIDE dan ECOSYSTEM saat batch 8 dibangun, setelah dicek di sumber VectFox versi
  saat itu (§7, butir 5).
- Kartu tidak menyentuh VectFox secara langsung. Toast hanya memberi langkahnya.

## 7. Yang wajib diverifikasi saat implementasi

Upstream akan berubah sebelum pemicu tercapai, jadi semua butir ini dicek di sumber versi saat itu (aturan `CLAUDE.md`
"Verify, don't assume"). Hasilnya dicatat di DECISIONS §11. Sampai dicek, setiap butir hanyalah dugaan, bukan fakta:

1. **Membuat chat baru dari skrip.** Kandidat: perintah slash ST untuk chat baru lewat `triggerSlash` (Tavern Helper), atau fungsi
   ST `doNewChat`, yang dipakai tombol "Start new chat".
   - Bila tidak ada jalan yang aman, pakai alur cadangan §4.1.
   - Cek di: ST `public/scripts/slash-commands.js`, `public/script.js`; Tavern Helper `function/slash.ts`.
2. **Inisialisasi MVU di chat baru.** Kapan `[initvar]` menulis lantai 0, event mana yang menandai selesainya, dan apakah
   `Mvu.replaceMvuData` di lantai 0 sesudahnya bertahan (tidak ditimpa inisialisasi ulang).
   - Cek di: MagVarUpdate `function/initialize*`, `update_variables.ts`.
3. **Penyimpanan lintas-chat untuk data sementara.**
   - Kandidat: variabel `script` atau `character` Tavern Helper, atau `extension_settings`.
   - Jangan `localStorage`: per peramban, dan state bisa ±200 KB.
   - Cek di: Tavern Helper `function/variables.ts`.
4. **Nama file chat sekarang.** Kandidat: `SillyTavern.getCurrentChatId()`. Juga cek apakah skrip kartu tetap hidup, atau dimuat
   ulang, saat chat berganti (`CHAT_CHANGED`).
5. **VectFox:** cara mengunci koleksi lama sebagai arsip ke chat baru, dan apakah pola pembersih kustom berlaku untuk pesan 0.
6. **Pesan 0 yang diganti teksnya.** Apakah MVU mem-parse ulang pesan itu (tidak boleh menimpa state bawaan) dan apakah VectFox
   memprosesnya (pola §4.3 harus membuangnya).

## 8. Teks UI (English)

- **Chapters section intro:** "A long chat makes SillyTavern slow: it saves the whole file on every message. A new chapter moves
  the story to a fresh chat file and carries everything the game remembers: the state, the Journal and its Chronicle, bonds,
  mysteries and the last scene. The old chat stays as an archive."
- **Confirm dialog:** "Start chapter {N}? The story continues in a new chat from this exact moment. Everything in the game state
  comes along; the last {K} messages come along as a 'Previously' block. Keep the old chat as an archive and do not continue it.
  VectFox: afterwards, lock this chat's collection as an archive to the new chat (two steps, shown next)."
- **Reminder toast:** "This chat has {n} messages (about {mb} MB). When saving gets slow, start a new chapter: Student file →
  Chapters."
- **After toast:** "Chapter {N} started. VectFox: open its settings, lock the collection of '{oldFile}' as an archive for this
  chat, then vectorize this chat as usual."

## 9. Tes

- Baru, `tests/test_chapter_v1xx0.cjs`:
  - `chapterCarry` hanya mengubah `$eng.floor`, `$eng.tool`, field per-balasan dan `$ui.chapters`;
  - schema round-trip;
  - **kesetaraan:** update berikutnya pada state asli dan pada state bawaan (dengan blok yang sama) memberi state yang sama, kecuali
    field bab;
  - susunan jembatan: urutan, label, yang dibuang, batas token;
  - render 501/505/509 di state bawaan sama dengan state asli.
- `tests/stress/memory_soak.cjs`: bawa ke bab baru di update 5.000. Invarian: `memDiff` nol pada saat itu, dan tidak ada yang hilang
  sesudahnya.
- `qa_static.cjs`: regex jembatan ada, dan pola VectFox ada di `vectfox_cleaning_patterns.json`.
- UI: preview browser untuk bagian Chapters (`tests/preview/`).
- Cek live (TEST_CHECKLIST):
  - bab baru lewat tombol (atau alur cadangan);
  - giliran pertama melanjutkan adegan;
  - bracelet dan panel sama;
  - recall VectFox dari bab lama muncul;
  - swipe pada balasan pertama bab baru;
  - Replay floor di bab baru tidak mundur melewati lantai 0.

## 10. Rilis dan dokumen

- Aturan rilis biasa: save fixture dulu, versi, build, CHANGELOG, HANDOFF, TEST_CHECKLIST, commit.
- Dokumen yang diubah:
  - `docs/INDEX.md`: baris "Chapters";
  - `docs/DECISIONS.md`: §8, satu baris "Chapters: a new chat file carries the whole state and the last scene; the old chat is an
    archive", dan §11, fakta yang diverifikasi di §7;
  - `docs/PLAYER_GUIDE.md` §7: subbagian "Long campaigns → New chapter";
  - `docs/ECOSYSTEM.md` VectFox: arsip lintas bab.
- Status batch 8 di audit diisi. Draft ini dihapus. Baris pointer di `planning/FUTURE_PLANS.md` dihapus.

## 11. Risiko yang sudah dipikirkan

- **Bab dimulai di tengah adegan:** boleh. Jembatan membawa adegan itu. UI menyarankan (tidak mewajibkan) mulai di jeda alami:
  tidur, hari baru.
- **Owner melanjutkan chat lama karena tidak sengaja:**
  - state bab lama ikut berjalan sendiri, dan timeline bercabang;
  - Chapters menandai chat lama "archived" (dari `$ui.chapters` di bab baru) dan bracelet chat lama menampilkan peringatan.
- **Ukuran state sendiri (±200 KB) tidak ikut mengecil.** Tidak masalah: yang besar adalah teks dan banyaknya snapshot, bukan satu
  state.
- **MVU extra-model:** tidak ada yang berubah. Model update hanya melihat 2 pesan terakhir, dan jembatan tidak pernah termasuk di
  situ setelah giliran pertama.
