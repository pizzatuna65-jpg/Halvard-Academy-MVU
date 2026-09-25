# Rencana penerapan per batch (v2) — konsistensi karakter, card + preset + VectFox

Status: **APPROVED oleh owner (2026-09-26)**, semua draf memakai rekomendasi saya. Belum ada yang diterapkan.

Rencana ini menggabungkan:
- `DRAFT_consistency.md` (P1–P14)
- `DRAFT_mvu_inspiration.md` (N1–N12)
- `DRAFT_preset_update.md` (U1–U13, D1–D8)
- `DRAFT_card_vs_preset.md` (pembagian card/preset)

Rencana ini menggantikan versi pertama. Jika ada selisih dengan draf lain, **file ini yang berlaku**.

Card saat ini: **v1.4.5**. Setiap rilis diakhiri pengiriman standar (HANDOFF §2):
- rebuild
- `npm test`, `npm run stress`, `node tests/token_audit.cjs`
- entri `PROGRESS.md`
- naikkan versi
- `eldrasil_project_<versi>.zip`

Rilis yang menyentuh preset juga menjalankan `python presets/edit_preset.py` dua kali (hasil harus byte-identik).

---

## 0. Semua keputusan (final)

**Pembagian** (`DRAFT_card_vs_preset.md` §1):
- **Card** = dunia, data, kanon tokoh, dan pemeriksaan yang merujuk data card.
- **Preset** = cara menulis dan selera pemain, sebagai toggle.
- Preset CoT **menunjuk** ke aturan card, tidak menyalinnya.

| # | Keputusan |
|---|---|
| P1 | Cast Sheet di card (uid 509, @D1). Teks lore disematkan saat build oleh `gen_mvu_entries.py`. Lore penuh maks. 4 NPC (prioritas: bicara di balasan terakhir, lalu rank tertinggi); sisanya hanya Invariants. HANDOFF §1 diperbarui |
| P4 | `Mind` / `Knows` / `Imprints` hanya untuk narator (tidak tampil di dossier) |
| P6 | Pengingat di `<now>` saja |
| P8 | Dipecah: bagian data di card, bagian kerajinan di preset (kalibrasi D2) |
| P11 | Jendela chat tetap 24 |
| P12, N7 | Preset |
| P14 | Ditunda; hanya jika audit masih menunjukkan drift sifat |
| N1 | Toggle preset "🎮 Player Input Authority", ON di preset Eldrasil |
| N2 | Tiga tipe `fixed / shaped / fluid`; kode motivasi v4.3 dilewati |
| N3 | Mulai 8 NPC (Etnie, Irene, Aiden, Castor, Zara, Kanae, Rei, Caine); band 0–2 / 3–5 / 6–8 / 9–10 |
| N3a | "close" = XP ≥ 80% dari kebutuhan rank |
| N4 | `Next` untuk Rank ≥ 3; "Meanwhile" untuk Rank ≥ 7 ke Journal; `Campus_State.Events` mendapat `Updated` |
| N5 | Extras cap 20, ditulis saat muncul kedua kali, tombol Keep di Cast strip; pola nama diambil dari lore |
| N6 | Fase: Training Week, ujian, Thinning, Break, Star Night |
| N8 | Tidak ada tambahan (preset sudah punya; card sudah punya versi berbasis data) |
| N9 | Format manual P2: `DON'T FLATTEN` + `CARRIES` + `term_used` |
| N11 | Ya; kandidat diambil dulu dari lore dan Emotional tells yang ada |
| N12 | Saat lorebook cohort datang |
| D1 | Gerbang `<cast>` di **card** (@D0) |
| D5 | Ya (penanda input terbaru, ikut toggle N1) |
| U12 | Batas tanda tanya menjadi **per tokoh**, kecuali suara tokoh itu memang penuh pertanyaan |
| Opsional preset | "No fake specificity" dan "organ autonomy": **ya**, masuk Banned constructs |
| Bahasa output | Toggle baru "🌐 Output language", **OFF** (tanpa toggle = mengikuti bahasa card, Inggris) |
| Panjang | "📝 Total Output Length" **ON**, default 3–6 paragraf (menggantikan angka yang dihapus dari card) |

---

## 1. Peta rilis

```
1.4.6  Hotfix: card description + preset U1 + Total Output Length       (sekarang)
  │
Batch 0  Alat audit drift (baseline)                                     (tools)
  │
1.5.0  Batch A  (card rules)  +  Batch E1 (preset: aturan menulis umum)  (bersamaan)
1.5.1  Batch B  (card: Cast Sheet + gerbang @D0)
1.6.0  Batch C  (card: ingatan NPC) + VectFox V1–V3
1.6.1  Batch D  (card: Extras, dunia bergerak)
1.6.2  Batch E2 (preset: langkah CoT yang membaca data card baru) + VectFox V4
1.6.x  Batch G  (kanon, 5 gelombang; mulai paralel setelah 1.5.1)
nanti  P14 (jika audit menunjukkan drift) · N12 (saat lorebook cohort datang)
```

Kenapa Batch E dipecah:
- **E1:** isinya aturan menulis umum yang tidak butuh data card baru. Dikirim bersama Batch A, supaya manfaat anti-OOC-nya tidak menunggu.
- **E2:** isinya langkah CoT yang membaca Cast Sheet, Extras, dan Next. Jadi baru bisa setelah datanya ada.

| Rilis | Card | Preset | Kanon baru? | Tambahan prompt (perkiraan) |
|---|---|---|---|---|
| 1.4.6 | description | U1, Total Output Length | tidak | card −60, preset +40 |
| 1.5.0 | P8 (card), World sources, N10, N3a | E1 | tidak | card +200, preset +650 |
| 1.5.1 | P1, P2 otomatis, P5, P6, P7, D1 | — | tidak | +1.0–1.5k per NPC hadir, +80 gerbang |
| 1.6.0 | P4, N4 Next + Meanwhile, D6 (card), slot N2, N13 umur waktu | — | tidak | +200–400 per NPC hadir; output narator +50–150; N13 +~3 token per baris bertanggal |
| 1.6.1 | N5, N4 Events, kerangka N6 | — | tidak | +70 selalu, +40 per Extra hadir |
| 1.6.2 | — | E2 | tidak | reasoning +100–250 |
| 1.6.x | P3, P2 manual (N9), N2, N3, N11, baris N6 | — | **ya** | +250–400 per NPC hadir |

---

## Rilis 1.4.6 — Hotfix (tanpa kanon, sekarang)

| Tempat | Perubahan |
|---|---|
| `src/card/card.json` description | Diganti versi bersih (`DRAFT_card_vs_preset.md` §2): tanpa POV, tense, panjang, bahasa, atau "never {{user}}'s words" |
| `edit_preset.py` §3 (BOLT langkah 2) | **U1 generik**: "following the card's own update rules exactly…", tanpa daftar field. Memperbaiki bug aturan bond versi 1.0 yang masih diajarkan setiap balasan |
| `edit_preset.py` §1 | `📝 Total Output Length` ON, teks "roughly 3 to 6 paragraphs"; kata-kata jumlah kata dibuang agar tidak bertabrakan dengan panjang natural Gemini |
| `docs/ECOSYSTEM.md` | Baris "card (its style line now defers to the preset)" diganti "card (no style rules)"; preset changes: + Total Output Length |

**Tes:**
- `qa_static` (description tidak mengandung "paragraph", "point of view", "tense", "{{user}}'s words")
- `tests/test_preset.cjs` (baru; nanti diperluas di E1/E2):
  - BOLT tidak berisi "bond Progress" / "+2 significant"
  - Total Output Length aktif
  - baris pertama reasoning "Now: M? W? Day HH:MM at <place>" **tetap ada** (VectFox memakainya; lihat §VectFox)

---

## Batch 0 — Alat audit drift (P10)

Sama seperti rencana v1:
- `tools/audit_chat.py` membaca chat `.jsonl`
- yang dicek: kata ganti, alias, dialog di luar `Scene.Present`, bocornya `<narrator_only>`, field terkunci rank
- `tests/test_audit_tool.cjs` dengan chat sintetis

**Butuh dari owner:** 1–2 export chat playtest panjang, bila ada. Di folder Downloads ada `Halvard Academy - 2026-09-16@….jsonl`. Kalau itu chat card versi MVU, saya pakai sebagai baseline; kalau versi lorebook lama, hanya untuk tes alias dan kata ganti.

---

## Rilis 1.5.0 — Batch A (card) + Batch E1 (preset)

### Card

| Item | Tempat | Isi |
|---|---|---|
| P8 (bagian data) | 504 | "Canon over memory: the lorebook and character sheets outrank the chat's own earlier prose. Rank, Trust and Tension change how a character treats {{user}}, never who they are; closeness is not warmth." (Baris Imprint ditambah di 1.6.0) |
| World sources | 504 | Daftar sumber kejadian dunia (`DRAFT_card_vs_preset.md` §3) |
| N10 | event EJS (101, 508, template bond event) | Klausa butterfly |
| N3a | 504 + `505.template.ejs` | Tanda `close` di baris Bond pada `<now>` saat XP ≥ 80%; rule "let one behaviour of the next rank slip out" |

### Preset E1 (`edit_preset.py` bagian baru `# ---- 8. v1.5 writing rules`)

| Item | Target | Isi |
|---|---|---|
| N1 + D5 | prompt baru "🎮 Player Input Authority" + "📨 Latest Input" (depth 0, sebelum BOLT) | `<input_authority>` + `<latest_input>{{lastUserMessage}}</latest_input>`; keduanya satu toggle |
| N7 | `<realistic_bold_characters>` | No spotlight, no echoes (generik) |
| P12 + U7 + D8 | `<scene_engine>` | HOLD, penutup biasa di giliran tenang, tanpa ringkasan atau pratinjau |
| D2 + U5 | `<vad_emotion>` + `<character_calibration>` baru | Kalibrasi Gemini; stres "in their own way", dalam batas yang ditetapkan kartu tokoh |
| D3 + U4 | `<npc_voice>` | Kartu tokoh mengalahkan tag ini; rasio untuk adegan, bukan per tokoh; dialog langsung vs subteks |
| D7 + U11 | `<anti_omniscient_NPCs>` | Tanpa narasi pertanda; "strangers initially unless the card records that they know them" |
| U9 | `<NPC_intro>` di Main Prompt | Tokoh ber-lore memakai penampilan kanon; tokoh yang sudah dikenal tidak di-sweep lagi |
| U12 | `<youre_not_a_therapist>` | Batas tanda tanya per tokoh |
| Opsional | `Banned constructs` | No fake specificity, organ autonomy |
| Bahasa | prompt baru "🌐 Output language" | OFF |

**Tes:**
- `test_rules_v150.cjs` (card)
- `test_preset.cjs` diperluas: prompt baru ada, urutannya benar, toggle-nya benar; setiap `rep()` sudah dijaga `assert`
- `token_audit` untuk card + preset

**Dokumentasi:** `ECOSYSTEM.md` (daftar edit preset), `PLAYER_GUIDE` (toggle Input Authority: matikan untuk mode "sutradara").

---

## Rilis 1.5.1 — Batch B (card: Cast Sheet)

Sama seperti rencana v1 (uid 509 @D1: Invariants otomatis, lore kanon lengkap, status rahasia, relasi antar-NPC; entry keyword kosong saat NPC hadir; deteksi P6), dengan dua tambahan:
- **D1 gerbang `<cast>`**: entry card baru @D0 (sekitar 80 token), aktif hanya bila `Scene.Present` tidak kosong.
- **HANDOFF §1** diperbarui: "Lore of NPCs in `Scene.Present` → card Cast Sheet (509); everything else → keyword WI".

**Tes:** `test_castsheet_v151.cjs` (1, 4, 8 NPC hadir; cohort belum datang; rahasia terbuka; keyword kosong; deteksi P6 dengan deny-list; gerbang hanya muncul saat ada yang hadir).

**Perlu verifikasi di ST:** Prompt Template merender 509 berukuran besar (juga di mode extra-model).

---

## Rilis 1.6.0 — Batch C (card: ingatan NPC) + VectFox V1–V3

Sama seperti rencana v1: `Mind`, `Knows`, `Imprints` (aturan timpa per tipe N2), `$Defining`, `Next` + "since you last saw them" + "Meanwhile"; slot `Change` di `field_overrides.json`; migrasi save lama. Tambahan:
- **D6 (card), 504:** "Arrivals take the walk time between places; a character whose Next or last scene put them elsewhere needs the time and a reason to be here."
- **P8 (card), 504:** tambah "Only an Imprint changes who a character is."
- **N13 umur waktu (disetujui owner 2026-09-26, dari SP·数据库 "时间约束词"):** engine menghitung umur relatif setiap entri bertanggal yang tampil di `<now>` dan Cast Sheet:
  - Journal
  - `$Recent`
  - `$Defining`
  - `Knows`
  - "since you last saw them"
  - Pita umurnya: "earlier today", "yesterday", "N days ago", "last week", "N weeks ago", "last month", "N months ago", "last year".
  - Rule 504, sekitar 25 token: "When a character or the narration refers to a past event, use the age <now> gives it; never guess how long ago something was."
  - Tes: pita di batas hari, minggu, bulan, dan tahun kalender kampus (12 bulan × 4 minggu); tanggal yang tidak terbaca → tanpa umur.
- **VectFox V1–V3** (lihat §VectFox).

**Tes:** `test_memory_v160.cjs` + `sim_year` + `fuzz`.

---

## Rilis 1.6.1 — Batch D (card: Extras, dunia bergerak)

Sama seperti rencana v1: N5 Extras (cap 20, muncul kedua kali, Keep lewat pesan tersembunyi dengan patch, alias-merge); `Campus_State.Events.Updated` + penanda "stale"; `data/campus_phases.json` (kosong sampai Batch G).

Catatan schema: `Events` berubah dari string menjadi objek `{Text, Updated}`. `fillShape` membungkus string lama otomatis (pola yang sama dengan Rec lain).

---

## Rilis 1.6.2 — Batch E2 (preset: CoT membaca data card baru) + VectFox V4

| Item | Target | Isi (generik, menunjuk ke card) |
|---|---|---|
| U2 | BOLT langkah 0 | "If the card provides character sheets for the people present, I read them now." Baris pertama "Now: …" **tidak diubah** |
| U3 (P9 + P13 + D4) | BOLT langkah 7 | Cast check: tahu apa, apa yang mendorongnya, apa yang diizinkan kepribadiannya, yang ditunjukkan vs dimaksud, apa yang dibawa; versi terbesar lalu versi kebiasaan; tes tukar nama; slop review |
| U6 | HQ NPC Genesis | "If the card keeps a record for invented characters, that record is their card; follow the card's naming guide"; nama terlarang tetap |
| U10 + D6 | BOLT langkah 11 + Bridge | "World-side material comes only from the sources the card allows"; "no one arrives without the time to get there" |
| U8 | Bridge | Pembagian tugas baru (Cast Sheet, Extras, Next); fakta dunia tetap di card |
| U13 | setelan | Cek pemotongan balasan di playtest; naikkan `openai_max_tokens` bila `</UpdateVariable>` terpotong |

**Tes:** `test_preset.cjs` final (semua tag yang dirujuk CoT ada di preset atau card; tidak ada nama field Eldrasil di BOLT kecuali baris "Now:" dan `<now>` di langkah 0).

---

## Batch G — Kanon, 5 gelombang (mulai setelah 1.5.1)

Sama seperti rencana v1: `DRAFT_voices.md` per gelombang (G1: 8 NPC kunci dengan Stages; G2 Year 1; G3 Year 2; G4 Year 3; G5 Staff dan lainnya; baris fase N6).

Field per NPC: Scene examples + Never sounds like, `term_used`, `DON'T FLATTEN` + `CARRIES`, `Change`, Stages (G1), Anchor. (Owner 2026-09-25: Stages juga untuk G2, "tetap beri stages".)

Setiap gelombang disetujui owner per NPC sebelum diterapkan (kanon tetap lewat alur draf, walaupun rencana ini sudah disetujui). `NPC_BRAINSTORM_BRIEF.md` diperbarui dengan field baru setelah G1.

---

## VectFox — apa yang berubah

Jawaban singkat: **setelan inti tidak berubah.** Pola pembersihan teks tetap 5 pola yang sama, dan tidak ada rilis yang menambah tag baru ke teks balasan: semua data baru (Mind, Knows, Next, Extras) ada di dalam `<UpdateVariable>`, dan pola 1–2 sudah membuangnya.

Hasilnya malah bagus: isi kepala NPC dan rahasia tidak pernah masuk ke memori VectFox. Semantic Lorebook tetap **jangan** dipakai, apalagi dengan entry EJS baru (509 dan gerbang @D0).

Ada 3 penyesuaian dan 2 hal yang perlu dicek:

| # | Kapan | Apa | Kenapa |
|---|---|---|---|
| V1 | 1.6.0 (card, 504 baris Memory) | Tambah: "Recalled memories say what happened, not who knows it: a character knows only what they witnessed, what their Knows lists, or a rumour that reached them. Where a recalled memory describes a character differently from their <cast> sheet, the sheet is right." | VectFox menyuntikkan kejadian lama ke prompt narator. Tanpa kalimat ini, narator bisa membuat NPC "tahu" kejadian yang hanya diingat VectFox (melanggar cognitive isolation), atau meniru deskripsi tokoh yang sudah drift dari kejadian lama |
| V2 | 1.6.0 (docs) | **Summarizer Injection: saran diubah dari "opsional, 4.000 karakter" menjadi "OFF"** (atau maks. sekitar 3.000 bila owner tetap mau) | Setelah Batch C, card sudah memegang Journal, `$Recent`, `$Defining`, `Mind`, dan "Meanwhile". Ringkasan VectFox jadi hampir sepenuhnya dobel, dan bisa bertabrakan dengan versi card. EventBase (pencarian kejadian lama) tetap ON: itu satu-satunya sumber detail adegan lama |
| V3 | 1.6.0 (cek di ST) | **Posisi injeksi EventBase harus lebih jauh dari titik menulis** daripada Cast Sheet (@D1) dan gerbang (@D0) | Kalau memori lama disuntikkan di depth 0–1, prosa lama kembali menjadi yang paling dekat dengan titik menulis, yaitu sumber drift yang ingin kita hilangkan. Saya belum memverifikasi pilihan posisi di VectFox; dicek di source VectFox saat 1.6.0, lalu ditulis di `VECTFOX.md` |
| V4 | 1.6.2 (cek) | Baris pertama reasoning "Now: M? W? Day HH:MM at <place>" tetap sama | `ECOSYSTEM.md` mencatat VectFox membaca reasoning untuk tanggal dan tempat. E2 menambah langkah CoT; baris itu tidak boleh bergeser atau berubah format. Dijaga oleh `test_preset.cjs` |
| V5 | playtest | Pantau kualitas recall | VectFox membangun query semantiknya dari pesan mentah, **termasuk** blok update. Blok update jadi lebih panjang setelah Batch C/D (nama NPC, Knows). Bisa membantu (nama lebih banyak) atau mengganggu (noise). Kalau recall memburuk, opsinya: memindahkan field panjang ke akhir patch atau memendekkan Knows. Diputuskan setelah ada data |

Ghosting vs trim regex: tidak berubah (jendela tetap 24; pakai salah satu, seperti sekarang).

### Alternatif yang dievaluasi: SP·数据库 (AlbusKen/shujuku, v9.2.5, dicek 2026-09-26 di commit 599e358) — **tidak dipakai**

Ini adalah "database" tabel yang diisi oleh panggilan AI terpisah setiap N pesan, lalu diekspor menjadi entry lorebook. Delapan tabel bawaannya: state global, info protagonis, tokoh penting, skill, inventaris, quest/event, kronik per giliran, dan opsi. Sebelum setiap generasi, ada panggilan "剧情推进" yang memilih kode kejadian lama untuk dipanggil kembali.

Tujuh dari delapan tabel menduplikasi state MVU card. Masalahnya sama dengan tracker preset yang dulu kita matikan: ada dua sumber kebenaran, dan biaya API bertambah. Tabel kroniknya bersaing dengan VectFox EventBase untuk tugas yang sama.

Satu ide diambil: **N13 umur waktu**, disetujui, masuk 1.6.0 (lihat Batch C).

**Dokumen yang diperbarui:** `docs/VECTFOX.md` (V1–V3, versi card, Summarizer OFF) dan `docs/ECOSYSTEM.md` (tabel "Who owns what": NPC canon, voice, and memory-of-the-NPC → card; writing craft → preset; memory of past scenes → VectFox; setelan VectFox butir 5).

---

## Urutan kerja (diperbarui 2026-09-26: playtest satu kali di akhir)

Keputusan owner: selesaikan semua batch dulu. Kalau hasil playtest menunjukkan ada yang salah, perbaikannya menjadi batch baru. **Tidak ada playtest di antara batch**; semua pemeriksaan di antara batch dilakukan headless (tes, stress, `sim_year`, `token_audit`).

1. ✅ **1.4.6** hotfix (selesai 2026-09-26; `eldrasil_project_1.4.6.zip`).
2. ✅ **Batch 0** (selesai 2026-09-26). Dua chat playtest lama berasal dari card non-MVU: 0 temuan setelah penyetelan.
3. **1.5.0** (A + E1)
4. **1.5.1** (B)
5. **1.6.0** (C + VectFox V1–V3 + N13 umur waktu)
6. **1.6.1** (D)
7. **1.6.2** (E2)
8. **G1:** `planning/DRAFT_voices.md` untuk 8 NPC kunci. Berhenti di sini dan tunggu review owner (kanon).
9. Setelah G1 disetujui dan diterapkan (1.6.3): **satu playtest** oleh owner (dari checkpoint setelah Entrance Event), lalu `tools/audit_chat.py` pada export-nya. Temuan playtest menjadi batch perbaikan.
10. Gelombang G2–G5 sesuai persetujuan owner.

**Save lintas versi:** setiap rilis wajib punya tes bahwa save dari rilis sebelumnya termuat tanpa kehilangan data (`fillShape`, `$eng.ver`). Dengan begitu owner bisa melanjutkan satu chat lintas versi tanpa mulai ulang.

**Pengiriman di cloud (GitHub):** setiap rilis dikirim sebagai commit pada branch kerja, dengan pesan "Release <versi>: …", plus entri `PROGRESS.md` dan kenaikan versi. Zip hanya dibuat bila owner meminta. File hasil build (`dist/`, `src/scripts/engine.js`, dan lainnya) ikut di-commit, supaya owner bisa langsung mengunduh card dan preset.
