# DRAFT: Pembagian card vs preset (audit + klasifikasi ulang semua usulan)

Status: **APPROVED oleh owner (2026-09-26)** dengan rekomendasi saya untuk semua `[?]`; urutan dan keputusan final ada di `DRAFT_batch_plan.md` (v2). Belum diterapkan. Berlaku untuk:
- card v1.4.5 yang sekarang
- `DRAFT_consistency.md` (P#)
- `DRAFT_mvu_inspiration.md` (N#)
- `DRAFT_batch_plan.md`
- `DRAFT_preset_update.md` (U#, D#)

Permintaan owner: hal yang biasanya diurus preset (selera pemain: POV, tense, panjang, gaya prosa, dan sejenisnya) **tidak masuk card**, supaya pemain bebas mengaturnya lewat toggle preset.

---

## 1. Aturan pembagian

HANDOFF §1 sebenarnya sudah menetapkan: "Prose style, POV, NPC behaviour, reasoning (CoT) → Preset". Card sekarang melanggar itu di satu tempat (§2). Supaya tidak terulang, ini aturan kerjanya.

**Tes satu kalimat:** *"Kalau baris ini dipindah ke card lain, apakah masih masuk akal?"*
- **Tidak** (menyebut Eldrasil, `<now>`, `<cast>`, Bonds, engine, lore, tokoh kanon) → **card**
- **Ya** (cara menulis, berlaku untuk cerita apa pun) → **preset**

| Card (dunia + data) | Preset (cara menulis + selera) |
|---|---|
| Lore, tokoh kanon, suara kanon tiap tokoh (Scene examples, INVARIANTS, DON'T FLATTEN, Stages, Anchor) | POV, tense, panjang balasan, jumlah paragraf, bahasa output |
| State MVU, engine, format `<UpdateVariable>` | Gaya prosa (Cinematic / Story), warna dialog, kosakata terlarang |
| Aturan dunia: jam, curfew, biaya sihir, tubuh, cuaca, kalender | Boleh/tidaknya AI menulis ucapan dan tindakan {{user}} (anti-parrot, embellish, "mulut pengganti") |
| Kognisi **berbasis data**: `Known_by`, `Knows`, `Secrets_revealed`, jangkauan rumor | Kognisi **umum**: tokoh tidak bisa membaca pikiran, tidak tahu hal yang tidak disaksikan |
| Arti angka card: Rank ≠ kehangatan, Trust/Tension menentukan nada, tahap per rank | Kerajinan menulis tokoh: anti-penjilat, anti-dramatisasi, anti-sorotan, NPC boleh salah, dialog langsung vs subteks, kalibrasi Gemini |
| Dari mana kejadian dunia boleh datang (kalender, happenings, regulars, hooks, Next, fase) | Seberapa sering dunia menyela, HOLD, cara menutup adegan |
| Pemeriksaan yang merujuk data card (gerbang `<cast>`) | Struktur CoT (langkah-langkahnya merujuk "aturan card", tanpa menyalin isinya) |

Dua prinsip tambahan:
- **Card harus tetap berfungsi dengan preset apa pun.** Semua yang dibutuhkan agar sistem card benar (format update, data konsistensi, gerbang `<cast>`) ada di card. Preset Eldrasil hanya memperkuat.
- **Preset tidak menyalin isi aturan card.** Langkah CoT menunjuk ke aturan card ("follow the card's update rules"), bukan mengulang daftar field. Ini pelajaran dari bug U1: salinan di preset basi sejak 1.2.2.

---

## 2. Audit card v1.4.5: yang harus keluar dari card

Yang diperiksa: `src/card/card.json` (description, first_mes, creator_notes, field kosong lainnya), custom entry 500–508 (termasuk `505.template.ejs`), seluruh lore `src/worldbook/content/`, dan `src/regex/index.json`.

| Lokasi | Teks | Keputusan |
|---|---|---|
| `card.json` description | "…never {{user}}'s words, thoughts or choices." | **Keluar.** Menulis atau tidak menulis {{user}} adalah selera (preset punya "Anti-parrot" dan "Embellish Mode"; Duo punya "嘴替"/"防抢话") |
| `card.json` description | "Style: English prose. Point of view, tense and prose style follow the player's preset…; otherwise characters in third person and {{user}} as 'you'…; 3–6 paragraphs unless the preset sets a length" | **Keluar semua.** POV, tense, gaya, panjang, dan bahasa adalah toggle preset |
| `card.json` description | "Let characters drive scenes with their own goals, habits and flaws" | **Keluar** (kerajinan perilaku NPC; preset sudah punya Scene Engine / Realistic NPCs) |
| `card.json` description | "concrete campus detail (bells, corridors, the Canteen at five past noon, points on the bracelet)"; "Consequences are real, and so are small joys." | **Tetap**, dipadatkan jadi deskripsi dunia (tekstur dan nada genre adalah identitas card, bukan selera prosa) |
| `card.json` first_mes | ditulis dengan {{user}} sebagai "you" | **Tetap.** Pembuka harus ditulis dengan suatu POV; POV preset mengambil alih sejak balasan pertama |
| 503 `update_format` | "never mention it in the narration" | Tetap (format MVU) |
| 504 cuaca | "Keep the prose consistent with it" | Tetap (fakta dunia: cuaca kampus sekarang) |
| 504 cognitive isolation | `Known_by`, `<narrator_only>`, dan lain-lain | Tetap (berbasis data) |
| 508 ulang tahun | "Tone: a good day… each character reacts in character" | Tetap (arahan event dunia) |
| Regex State-as-memory (24 pesan) | pemangkasan chat lama | Tetap di card (bagian dari desain ingatan-state; pemain bisa mengubah angkanya) |
| Lore uid < 500 | — | Bersih: tidak ada instruksi POV, paragraf, atau prosa |

**Description baru (usul):**
```
You are the narrator of Eldrasil: a slice-of-life magic-academy story with a mystery underneath, set at Halvard Academy. {{user}} is a first-year student, played by the player; you voice the world and its people.

Halvard is a living campus of bells, corridors, lessons, clubs and points on the bracelet, where everyone has their own goals, habits and flaws (see the lorebook). Consequences are real, and so are small joys.

Every reply ends with the <UpdateVariable> block described in the rules.
```

**Pengganti di preset** (agar tidak ada yang hilang saat pemain memakai preset Eldrasil):
- `📝 Total Output Length` sekarang OFF → **nyalakan** dengan default "3 to 6 paragraphs" (pemain bisa mengubah atau mematikannya). Angka ini yang tadinya ada di card.
- POV: `👀 Hybrid POV` sudah aktif (orang ketiga + {{user}} sebagai "you"), sama dengan fallback card. Tidak ada perubahan.
- Tidak menulis {{user}}: `🦜 Anti-parrot and anti-echo` sudah aktif. Tidak ada perubahan.
- Bahasa: preset RF tidak punya toggle bahasa output. `[?]` Tambah toggle "🌐 Output language" (OFF = mengikuti bahasa card, yaitu Inggris)?

---

## 3. Klasifikasi ulang semua usulan

**Tebal** = tujuannya berubah dibanding draf sebelumnya.

### P# (`DRAFT_consistency.md`)

| # | Isi | Tujuan | Catatan |
|---|---|---|---|
| P1 | Cast Sheet | card | |
| P2 | Invariants (otomatis + manual) | card | |
| P3 | Scene examples | card | Kanon suara per tokoh |
| P4 | Mind / Knows / Imprints / Defining moments | card | |
| P5 | Relasi antar-NPC yang hadir | card | |
| P6 | Deteksi berdialog-tapi-tidak-hadir | card | |
| P7 | Status rahasia | card | |
| P8 | Aturan prioritas kanon | **dipecah** | Card: "the <cast> sheet outranks the chat; Rank, Trust and Tension change how a character treats {{user}}, not who they are; closeness is not warmth; only an Imprint moves the core" (merujuk data). **Preset:** "personality is a ceiling, not a mood; a shy person in love stays shy" (kerajinan umum; sudah ada di kalibrasi D2) |
| P9 | Cast check di CoT | preset | Generik: "for each acting character, check the card's character sheet if it provides one" |
| P10 | Alat audit | offline | |
| P11 | Jendela chat | card (regex) | |
| P12 | Anti-dramatisasi | **preset** | Kerajinan umum. **Kecuali** satu baris data yang tetap di card: dari mana kejadian dunia boleh datang (lihat baris "World sources" di bawah) |
| P13 | Simulasi pikiran | preset | |
| P14 | Trait angka | card | Data per NPC (ditunda) |

### N# (`DRAFT_mvu_inspiration.md`)

| # | Isi | Tujuan | Catatan |
|---|---|---|---|
| N1 | Batas wewenang input pemain | **preset** | Ini **selera gaya bermain**: sebagian pemain ingin "god mode" / pemain sebagai sutradara (Duo punya toggle 上帝模式). Menjadi toggle preset, ON di preset Eldrasil. Card tetap aman karena angkanya dijaga engine (rank, poin, dan Trust dibalikkan kalau tidak sah) |
| N2 | Tipe stabilitas | card | Data kanon |
| N3 | Stages per rank | card | |
| N3a | Bocoran rank berikutnya | card | Merujuk tanda `close` |
| N4 | Next + Meanwhile + Events stale | card | |
| N5 | Extras + panduan nama | card | Nama dunia = fakta dunia |
| N6 | Fase kampus | card | |
| N7 | Anti-sorotan, NPC boleh salah, anti-repetisi | **preset** | Kerajinan umum (RF sudah punya Realistic NPCs dan anti-yesman). Contoh nama tokoh dibuang supaya tetap generik |
| N8 | Pikiran {{user}} tak terdengar; info butuh sumber | **preset** (sebagian besar sudah ada) | RF `<anti_omniscient_NPCs>` sudah memuat "Thought Rule" dan "Evidence Rule". Card tidak perlu tambahan; cognitive isolation berbasis data di 504 sudah cukup |
| N9 | DON'T FLATTEN / CARRIES | card | Kanon per tokoh |
| N10 | Klausa butterfly | card | Arahan event |
| N11 | Jangkar | card | |
| N12 | Cohort sebagai paket | card | |

### U# / D# (`DRAFT_preset_update.md`)

| # | Isi | Tujuan | Catatan |
|---|---|---|---|
| U1 | BOLT langkah 2 | preset | **Teks diganti jadi generik** (§4): tanpa daftar field Eldrasil |
| U2 | BOLT langkah 0 | preset | **Generik**: "read the card's current-state and character-sheet blocks" |
| U3 | Cast check | preset | Generik (P9/P13) + tes tukar nama |
| U4 | NPC Voice tunduk pada kanon suara | preset | Generik: "a character's own card/sheet voice outranks this tag" |
| U5 | VAD dalam batas kepribadian | preset | |
| U6 | HQ NPC Genesis → kartu dari card | preset | Generik: "if the card keeps a record for invented characters, write it there" |
| U7 | Scene end / HOLD | preset | |
| U8 | Bridge | preset | Bridge memang khusus Eldrasil (menyesuaikan preset ke card). Isinya **hanya penyesuaian fitur preset** (mematikan tracker preset, gfx tanpa layar). Fakta dunia seperti "no phones" dan satuan metrik harus **juga ada di card** (lore sudah memuatnya; `°C` ada di 504) |
| U9 | NPC intro memakai penampilan kanon | preset | Generik: "for a character with a card/lore entry…" |
| U10 | Sumber dunia di langkah 11 | **dipecah** | **Card** menyimpan daftarnya ("World sources", di bawah). Preset langkah 11 hanya: "world-side material comes only from the sources the card allows" |
| U11 | "Strangers initially" kecuali ada bond | preset | Generik: "unless the card records that they know them" |
| U12 | Batas tanda tanya | preset | |
| U13 | Panjang output | preset | Setelan |
| D1 | Gerbang `<cast>` di depth 0 | **card** | Merujuk `<cast>`, dan harus berfungsi dengan preset apa pun. Menjadi entry card @D0 (seperti 503). Preset tidak perlu versi sendiri |
| D2 | Kalibrasi karakter Gemini | preset | |
| D3 | Dialog langsung vs subteks | preset | |
| D4 | Tes tukar nama | preset | |
| D5 | Penanda input terbaru | preset | Ikut toggle N1 |
| D6 | Kontinuitas ruang | **dipecah** | Card: "arrivals take the walk time between places (locations); Next says where someone is headed" (data). Preset: "no one teleports into a scene" (generik) |
| D7 | Larangan narasi pertanda | preset | |
| D8 | Kontinuitas panjang | preset | |

### Baris card baru: "World sources" (pengganti bagian data dari P12/U10), 504, sekitar 60 token

```
- Where the world's own events come from: the calendar (_Event_today), World._Happening, the location's regulars, the campus phase, Next plans that fall due, open Commitments, Hooks and Mysteries, stale Campus_State events <now> asks you to advance, and bond events <now> offers. Anything else that happens must follow from what people on-screen do.
```

---

## 4. Teks preset yang diganti jadi generik

Menggantikan teks di `DRAFT_preset_update.md`.

**U1 (BOLT langkah 2):**
```
2. State update plan: if the card asks for a state-update block, I list as terse bullets only what this turn changes, following the card's own update rules exactly (they outrank anything I remember about them). I never compute what the card says its engine computes. No other tracker, status or internal-states block exists in this chat.
```

**U2 (BOLT langkah 0):** baris "Game state (Eldrasil)" tetap (sudah merujuk `<now>`), ditambah:
```
If the card provides character sheets for the people present, I read them now.
```

**U10 (BOLT langkah 11):** kalimat "World-side material comes only from the calendar (_Event_today), World._Happening, …" diganti:
```
World-side material comes only from the sources the card allows; on most turns the world stays quiet.
```

**N1 → toggle preset baru "🎮 Player Input Authority (simulation)"** (ON di preset Eldrasil; matikan untuk mode sutradara):
```
<input_authority>
The player writes only {{user}}: their thoughts, feelings, words and attempted actions. Anything else in the player's message (what another character feels, says or decides, whether an action succeeds, facts about the world) is a wish, not a fact: characters answer from their own nature, and outcomes follow the world's rules. Confident wording adds nothing. An outcome that did not happen is not handed over anyway through a coincidence, a sudden change of heart or a rescue.
</input_authority>
```

**N7 → sisipkan ke `<realistic_bold_characters>`** (generik, tanpa nama tokoh):
```
- No spotlight: strangers do not remember {{user}}'s name, sense something special or single {{user}} out without a reason on-screen. Praise, trust and interest are earned in scenes.
- No echoes: do not reuse a scene beat, joke or line pattern from earlier replies, and never give two characters the same reaction to the same news.
```
("NPC boleh salah" sudah ada di RF: "NPCs are fallible".)

---

## 5. Dampak ke rencana batch

Batch per tujuan:

| Batch | Sebelumnya | Sekarang |
|---|---|---|
| **A (card, 1.5.0)** | P8, P12+N7, N1, N8, N10, N3a | P8 (bagian card), **World sources**, N10, N3a, dan **ganti description** (§2) |
| **B (card)** | P1, P2, P5, P6, P7 | sama + **D1 gerbang `<cast>` @D0** (dipindah dari preset) |
| **C (card)** | P4, N4, slot N2 | sama + **D6 bagian card** (waktu tempuh) |
| **D (card)** | N5, N4 Events, N6 | sama |
| **E (preset, 1.6.2)** | U1–U13, D1–D8 | U1–U13 (teks generik §4), D2–D8, **N1** (toggle), **N7**, **P12**, P9/P13, Total Output Length ON (3–6 paragraf) |
| **G (card)** | kanon per gelombang | sama |

Token card per balasan turun sekitar 350 dibanding rencana Batch A lama (N1, N7, N8 dan P12 pindah ke preset). Preset naik sekitar 250.

**Perbaikan yang bisa dikirim sekarang (1.4.6), tanpa menunggu batch lain:**
- **card:** description baru (§2)
- **preset:** U1 versi generik (bug aturan bond usang) + Total Output Length ON 3–6 paragraf

Keduanya kecil, tidak menyentuh kanon, dan memperbaiki pelanggaran HANDOFF §1 yang sudah ada.

## Keputusan terbuka

1. `[?]` Setuju dengan aturan pembagian (§1) dan description baru (§2)?
2. `[?]` Kirim sekarang sebagai **1.4.6**: description baru + U1 generik + Total Output Length ON?
3. `[?]` N1 menjadi toggle preset (ON di preset Eldrasil), bukan aturan card?
4. `[?]` Tambah toggle "🌐 Output language" di preset?
