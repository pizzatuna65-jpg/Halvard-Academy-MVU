# DRAFT: Pembaruan preset (Realistic Frankenstein 2.2 × Eldrasil) + pelajaran dari Duo Preset V13

Status: **APPROVED oleh owner (2026-09-26)** dengan rekomendasi saya untuk semua `[?]`; urutan dan keputusan final ada di `DRAFT_batch_plan.md` (v2). Belum diterapkan. Asumsi: Batch 0–G di `DRAFT_batch_plan.md` sudah selesai.

Konvensi:
- Catatan dalam Bahasa Indonesia; teks yang masuk ke preset dalam Bahasa Inggris.
- Semua perubahan lewat `presets/edit_preset.py` (sumber tunggal; file preset hasil build tidak diedit tangan).
- Menurut HANDOFF §1 preset adalah wilayah **prosa, perilaku NPC, dan CoT**, jadi semuanya butuh "proceed".

Draf ini **menggantikan Batch E** di rencana batch (Batch E hanya berisi satu langkah Cast check; ternyata preset butuh lebih banyak).

> **Diperbarui oleh `DRAFT_card_vs_preset.md`:** teks U1, U2 dan U10 diganti versi generik (§4 file itu), karena preset tidak boleh menyalin isi aturan card. D1 pindah ke card. N1, N7 dan P12 masuk ke preset ini.

---

## 0. Jawaban singkat

1. **Ya, ada yang perlu diperbarui, dan satu bagian sudah usang sejak sebelum Batch 0.**
   - Langkah CoT BOLT nomor 2 (rencana update state) masih mengajarkan aturan bond **versi 1.0**: `bond Progress +0 / +1 / +2`.
   - Sejak 1.2.2 dan 1.3.8–1.4.4, rule 502 memakai `/Interactions` dengan Kind (talk, hangout, gift, help, fight, apology, keep, secret, defend, confide, understood), Trust, Tension, `Rep_events`, `Training`, `Perk_use`, `Projects`, `Inventory`.
   - Artinya, **setiap balasan**, CoT preset memberi narator aturan yang bertentangan dengan 502. Ini sudah saya cek langsung di file preset hasil build dan di `502.txt`.
2. **Beberapa aturan preset akan bertabrakan dengan kanon suara dari Batch G.** Contohnya:
   - rasio dialog wajib 30–50%
   - "NPC berbicara dalam beberapa kalimat"
   - "semua NPC mudah panik"
   - generator NPC baru yang tidak tahu soal `Extras`
3. **Dari Duo Preset** ada 8 hal yang layak diambil, terutama:
   - kalibrasi karakter untuk Gemini ("persona adalah kecenderungan jangka panjang, bukan pertunjukan tetap")
   - **tes tukar nama**
   - aturan dialog "langsung vs subteks"
   - penanda input terbaru
   - pola **gerbang terakhir di depth 0** (pola ini sebenarnya sudah dipakai preset kita sendiri untuk gaya bahasa, tapi belum untuk karakter)

---

## 1. Keadaan preset sekarang (singkat)

- **Basis:** `Realistic Frankenstein 2.2 — Nuts & Bolts` (89 prompt, 40 regex), diedit oleh `edit_preset.py` saat card ada di sekitar v1.0–1.1.
- **Yang sudah diedit waktu itu:**
  - Tracker bawaan preset dimatikan (Fate & Routine, Internal States, Relationships RPG, dan lain-lain).
  - BOLT langkah 0, 2, 9, 11 disesuaikan ke card.
  - Prompt "🏫 Eldrasil × MVU × VectFox Bridge" ditambahkan.
  - Pop in Graphics disesuaikan ke dunia tanpa layar.
  - Jailbreak AI Studio disesuaikan ke setting akademi.
  - Temperature 1.0 / top_p 0.95.
- **Yang aktif dan relevan untuk karakter:**
  - NPC Voice + Dialogue Output
  - Scene Engine
  - Anti-Omniscient NPCs
  - NPC Instincts + VAD
  - Realistic NPCs
  - General Personality Independence
  - HQ NPC Genesis
  - Hybrid POV
  - Gemini Anti-Therapist
  - Last-Mile Contrast / Vocation gates (depth 0)
  - BOLT CoT (depth 0)

---

## 2. Yang perlu diperbarui (U1–U12)

Urutan: dari yang paling penting.

### U1. BOLT langkah 2: aturan bond usang ⚠️ (bug, bukan sekadar peningkatan)

Sekarang: `bond Progress (+0 small talk, +1 meaningful, +2 significant; Rank only when _Event_ready…)`.

Usul: langkah 2 **tidak lagi menyalin aturan**, cukup menunjuk ke 502 (supaya tidak basi lagi setiap kali card berubah), plus daftar field sebagai pengingat:

```
2. State update plan: if <update_format> is present, I list as terse bullets only what this turn changes, following the card's update rules exactly (they outrank anything I remember about them): time and place, Scene.Present, HP and named injuries, Stamina, Casts and effects, points, /Interactions (one per character {{user}} really spent time with, with its Kind and a one-line Note), Trust or Tension only through the deeds the rules name, Rep_events, Training, Perk_use, and any Journal, Commitments, Clues, Letters, Notices, Projects, Inventory or Campus_State entry the scene earns. For bonded characters: Mind only if it changed, Knows for what they newly learned and how, Next when they leave the scene, an Imprint only after a weight-5 experience. Extras: a card for an invented character on their second appearance. The engine computes every "_" field, rank, band and cap; I never do.
```

### U2. BOLT langkah 0: membaca data konsistensi yang baru

Tambahkan setelah daftar `<now>` yang sudah ada:
```
Then <cast>: who is present, their pronouns and how they address {{user}}, any bond marked close, any Next plan that brings someone here, any Extra present, and the campus phase line.
```

### U3. Cast check di CoT (dulu Batch E), digabung dengan langkah 7 BOLT

Langkah 7 sekarang hanya bertanya "Is each NPC staying true to their personality?". Ganti menjadi pemeriksaan yang bisa dikerjakan. Isinya: P9, P13, N9, plus **tes tukar nama** dan **versi kebiasaan** dari Duo (lihat D4):

```
7. Cast check: for each character who will act, from their <cast> sheet: (a) what they know here (Knows; nothing without a source); (b) what pulls them (Mind, Recent, Imprints, their own goal, which is usually not {{user}}); (c) what their personality allows (INVARIANTS, the ceiling, DON'T FLATTEN, Never sounds like); (d) what they show versus what they intend; (e) what they carry. I picture the loudest version of their reaction, then the way this person usually handles it, and write the second. Name-swap test: if another character's name could replace theirs and the line would still work, I rewrite it with something only they would say or do. Then the slop review: <banned_vocabulary> replacements, no meta-commentary, no yes-men (<abolish_yesman_behaviour>).
```

### U4. NPC Voice bertabrakan dengan kanon suara (Batch G)

Tiga aturan yang bisa mendorong NPC keluar dari karakternya:
- **"Dialogue Ratio 30–50%"**: memaksa NPC pendiam (Castor, Kanae, Alyssa) bicara lebih banyak.
- **"NPCs should speak in multiple sentences… no single-word statements… (unless persona appropriate)"**: pengecualiannya lemah.
- **Contoh teriakan CAPS** ("IM GOING TO WRECK YOU!"): bertentangan dengan Invariants seperti "stress shows as tidying, never as shouting".

Usul: tambahkan satu kalimat **prioritas** di awal `<npc_voice>`:
```
A character's <cast> sheet outranks every rule in this tag: their Scene examples, VOICE and Never sounds like decide how they talk. The dialogue ratio is for the scene, not for each character: a quiet character stays quiet, and a composed one never shouts in capitals because a rule here allows it.
```

### U5. Instincts + VAD: "semua NPC mudah panik" bertabrakan dengan ceiling (P8) dan tipe stabilitas (N2)

`<vad_emotion>` berbunyi "NPCs are flawed, panic-prone, deceptive, and tactically poor under stress", dan berlaku untuk semua orang. Ganti kalimat itu dengan:
```
- Under stress people get worse in their own way, inside the limits their <cast> sheet sets: a composed character's stress shows in small wrong choices, a reckless one gets more reckless, a timid one freezes. VAD changes delivery, never the core.
```
Tambahkan juga kalibrasi Duo (lihat D2) di bagian ini.

### U6. HQ NPC Genesis vs Extras (N5)

Sekarang Genesis:
- membuat 5 nama lalu memilih yang ke-5
- memilih ras secara acak
- menyatakan "everything defined here is their card"

Dengan N5, **kartu NPC karangan adalah record `Extras`**.

Usul:
- **Penamaan:** "follow the card's naming guide (502) and pick a name that fits Eldrasil; never Elara, Vane, Seraphina". Pola "pilih ke-5 dari 5" dibuang, karena panduan nama card lebih konsisten dengan dunia.
- **Ras:** "from the races and regions the lore has", bukan acak bebas.
- **Kartu:** "on the character's second appearance, write their Extras card; from then on the Extras card is their card and outranks the chat log".

### U7. Scene Engine: dua kalimat usang

- "A character generated during the chat has no card, so what the chat log has established serves as one" → ganti dengan "…their Extras card in <cast> (or, before they have one, what the chat has shown)".
- "Scene end: end with deliberate initiative…" memaksa ada taktik di setiap balasan. Ini bertabrakan dengan pilihan **HOLD** di BOLT langkah 11 dan dengan P12 anti-dramatisasi. Tambahkan dari Duo (D8):
```
On a quiet turn the committed action may be ordinary (picking up a cup, going back to their book). A reply does not have to finish an exchange, settle a relationship or move it forward; holding, stepping back and leaving something unsaid are valid endings. Never end on a summary, a verdict on the relationship, a preview, or a still picture of someone waiting for {{user}}.
```

### U8. Bridge: pembagian tugas yang baru

Perbarui teks `<eldrasil_bridge>`:
- **Tambahkan:**
  - "The card's <cast> sheet is the truth about every present character (lore, INVARIANTS, voice, what they know and feel); it outranks the lorebook entry text and anything earlier in the chat."
  - "Invented characters keep their Extras card."
  - "Off-screen people keep their own lives: their Next plans, the location's regulars, the timetable and the campus phase."
- **Ganti:** "Off-screen people keep their own lives… not because {{user}} wants them there" → pertahankan, lalu tambahkan: "A character who was last somewhere else needs the time to get here (walk times are in the lore); nobody arrives because the scene wants them." (dari "Spatial continuity" Duo, D6)

### U9. Main Prompt `<NPC_intro>`

Aturan intro sekarang: "top-to-bottom sweep" di setiap kemunculan pertama. Untuk NPC roster, **penampilan sudah ada di lore**, jadi model bisa mengarang detail yang bertentangan. Tambahkan:
```
For a character with a lorebook entry or <cast> sheet, the sweep uses only their canon Appearance and CARRIES, adding nothing that contradicts it; a character {{user}} already knows gets no sweep.
```

### U10. BOLT langkah 11 (Plot Momentum): sumber dunia yang baru

Daftar "world-side material comes only from…" ditambah:
- a **Next** plan that is due
- the **campus phase** line
- a **stale Campus_State event** that <now> asks to advance
- a bond marked **close** (N3a)

### U11. Anti-Omniscient: "NPCs treat others as strangers initially"

Tambahkan: "…unless their bond, Knows or lore says they already know them". Tanpa ini, NPC seperti Etnie yang mulai di Rank 3 bisa diperlakukan seolah baru kenal.

### U12. (Opsional) Anti-Therapist: "CAP: one question mark per reply"

Batas satu tanda tanya **per balasan** bisa meratakan karakter yang memang penuh pertanyaan (Tilly, Kanae sebagai peramal, NPC yang sedang menginterogasi) di adegan ramai. Usul: "one question mark per character per reply, unless their <cast> voice is inquisitive". `[?]`: kalau owner merasa masalah terapis Gemini masih sering muncul, biarkan seperti sekarang.

### U13. (Cek saat playtest) Panjang output

- Setelah Batch C/D, blok `<UpdateVariable>` lebih panjang (Mind, Knows, Next, Extras), dan CoT bertambah beberapa langkah.
- Setelan sekarang: `openai_max_tokens 15000`, `reasoning_effort medium`.
- Saya **belum memverifikasi** apakah batas ini mencakup token reasoning di endpoint Gemini yang dipakai owner.
- Tindakan: kalau di playtest balasan terpotong sebelum `</UpdateVariable>`, naikkan batasnya. Dicatat di "To verify in ST".

---

## 3. Dari Duo Preset V13: layak ditiru (D1–D8)

Duo Preset berbahasa Mandarin: 262 prompt, 36 regex, dan skrip Tavern Helper (panel melayang + pembanding preset). Arsitekturnya:
- Setiap toggle mengisi variabel lewat `{{setvar}}`.
- Satu template CoT "思考模式" merangkai **pertanyaan `【问题】` dari toggle yang aktif**, sehingga aturan dan langkah CoT-nya selalu sinkron.
- Output diatur oleh "output contract", dengan per-paragraf "Prism" (komentar HTML berisi cek diri) yang dibuang regex dari prompt.

### D1. Gerbang karakter di depth 0 ("Last-Mile Cast Gate"), sekitar 80 token

Preset kita sendiri sudah menjelaskan alasannya di Last-Mile Contrast Gate: "style rules parked above a long chat dilute, and the model starts imitating its own earlier slop from the log". Diagnosis ini **persis sama** dengan penyebab drift karakter di `DRAFT_consistency.md` (model meniru prosanya sendiri). Cast Sheet ada di @D1; gerbang di @D0 adalah pengingat terakhir sebelum menulis:

```
<final_cast_gate>
Silent pre-output check for every character who speaks or acts: pronouns, how they address {{user}}, their voice and DON'T FLATTEN lines from <cast>, and nothing they could not know. Earlier messages in this chat are not a character license: if a character drifted there, write them as their sheet says now, without comment.
</final_cast_gate>
```

### D2. Kalibrasi karakter untuk Gemini (dari 「Gemini / GLM 人物校准」)

Duo menulis ini khusus untuk kecenderungan Gemini. Isinya pas dengan P8 dan N9. Diterjemahkan dan dipadatkan:

```
<character_calibration>
- A persona is a long-term tendency, not a fixed performance. The size of a reaction matches its cause, the pressure built up, the person's habits and the real consequences. Do not turn cool into cruel, protective into controlling, kind into boundless, or rational into feelingless.
- Ordinary help, politeness, closeness and working together keep their ordinary meaning. They are not sacrifice, special attention, hidden feelings or desire. A relationship moves only through what happened in scenes.
- Nobody has to take a stance, decide or change the relationship every turn. Hesitating, leaving things as they are and getting on with their own day are real outcomes.
- Once a mood or a trait has been shown, do not stamp it again with synonyms.
- Calibration restores the right size of reaction. It does not make everyone mild, positive or alike: a big enough cause still gets a strong reaction, in that person's own way.
</character_calibration>
```

### D3. Dialog hidup: langsung vs subteks (dari 「活人对白」 dan 「角色反应可信」)

Drift yang sering muncul di Gemini: **semua karakter jadi tsundere atau "mulut bilang A, hati bilang B"**. Tambahkan ke `<npc_voice>`:
```
- Direct people speak directly. Subtext, denial, a sharp tone or saying the opposite needs a reason in the scene: something they are hiding, protecting or not ready to say. Without one, they answer the plain way their voice allows.
- Gender, age, looks or the relationship never make a character tsundere, flustered or contrary.
- A character may answer part of a question, dodge, refuse or change the subject, always in a way that is theirs.
- In a group, each speaks from what they know and want. They do not take turns voicing the same opinion, and nobody shares a narrator's explaining voice.
```

### D4. Tes tukar nama + versi kebiasaan (dari 「活人感」 dan 「情绪控制」)

Sudah dimasukkan ke U3 (Cast check). Dua pemeriksaan paling murah dan paling efektif untuk konsistensi:
- "Kalau nama tokoh ini ditukar dengan tokoh lain dan kalimatnya tetap masuk akal, tulis ulang."
- "Bayangkan reaksi paling besar, lalu cara orang ini biasanya menanganinya. Tulis yang kedua."

### D5. Penanda input terbaru (dari 「🔒丨User_Input」)

Prompt kecil di dekat CoT:
```
<latest_input>{{lastUserMessage}}</latest_input>
This is the player's newest message and nothing older is part of it. Read it as the card's input rule says: {{user}}'s own words and attempts are real; anything it says about other characters or outcomes is a wish.
```
Gunanya mendukung N1 (batas wewenang input): model tahu persis bagian mana yang "input pemain" untuk dipilah. Biayanya: pesan pemain terkirim dua kali (biasanya pendek).

### D6. Kontinuitas ruang (dari 「平行世界」 dan 「Char主动」)

Duo memakai blok "parallel world" yang dicetak setiap balasan. Kita **tidak** mengambil bloknya, karena N4 `Next` sudah disimpan engine. Yang diambil hanya aturannya: tokoh yang terakhir berada di tempat A butuh waktu, alasan dan jalan untuk sampai di B; kalau tidak bisa, ia tidak muncul (atau hanya lewat surat). Masuk ke Bridge (U8) dan langkah 11 BOLT.

### D7. Larangan narasi pertanda (dari 「反全知」)

Satu baris untuk `<anti_omniscient_NPCs>`, penting untuk misteri dan rahasia `<narrator_only>`:
```
No foreshadowing narration: never "little did they know", "this would matter later", "fate had already…". The narrator knows no more than the viewpoint allows.
```

### D8. Kontinuitas panjang (dari 「防打断（新）」)

Sudah dimasukkan ke U7 (Scene end). Satu balasan tidak wajib menutup percakapan, konflik, atau tahap hubungan; tidak ada ringkasan, pratinjau, atau adegan "menunggu {{user}}".

### Opsional (prioritas rendah)

- **No fake specificity** (「叙事密度」): larang angka palsu ("tiga detik terlalu lama", "73%") yang tidak punya fungsi. Bagus untuk Gemini; sejalan dengan Bridge "never state numbers from the state in prose".
- **Organ autonomy** (「杀器官自主」): subjek tindakan adalah orang, bukan anggota tubuh ("his hand moved on its own"). Bisa masuk Banned constructs.
- **Pola "setiap aturan membawa pertanyaan CoT-nya sendiri"**: tidak perlu memakai mekanisme setvar mereka, karena BOLT kita sudah memakai "if <tag> is present". Cukup pastikan setiap aturan baru di atas punya satu baris di langkah CoT yang sesuai (sudah dilakukan di U1–U3, U10).

---

## 4. Dari Duo: tidak ditiru

| Fitur | Alasan |
|---|---|
| Bingkai persona "三人逆行" (surat untuk tiga penulis + balasan assistant) | Pada dasarnya jailbreak lewat framing. Jailbreak AI Studio kita sudah disesuaikan untuk Gemini; dua jailbreak sekaligus berisiko (catatan preset: "DO NOT TURN ON … ALONGSIDE IT") |
| Prism per paragraf (komentar HTML + draf simulasi sebelum tiap paragraf) | Output membengkak besar, dan berisiko merusak aturan "`<UpdateVariable>` adalah hal terakhir". Gerbang D1 memberi manfaat serupa dengan jauh lebih murah |
| 双子札记 (asisten OOC "co-author" bertanya Q1–Q4 setiap balasan) | Memecah imersi, dan cenderung menggiring cerita (bertabrakan dengan kebebasan pemain dan "UI never moves the story"). Prinsipnya ("usul yang tidak disetujui pemain tidak boleh muncul di cerita") bagus, tapi tidak relevan tanpa modulnya |
| 反固定 (sengaja menyisipkan kejadian acak "tak terduga") | Berlawanan dengan P12 anti-dramatisasi dan HOLD |
| 快捷回复 (10 opsi balasan, termasuk 3 opsi NSFW) | Menggiring pemain |
| 抗空回 / 抗截断 (disclaimer filosofis palsu, soal matematika di akhir output) | Trik anti-sensor dan anti-potong; boros, dan merusak urutan output MVU |
| Regex "5楼外只发送摘要" (di luar 5 pesan, hanya ringkasan yang dikirim) | Kita sudah punya State-as-memory (24) + VectFox |
| Daftar kata terlarang Mandarin, pustaka gaya bahasa, spesialisasi NSFW per bagian tubuh | Tidak relevan untuk prosa Inggris, atau di luar arah card |
| Skrip Tavern Helper dari CDN (panel melayang, pembanding preset) | Kenyamanan saja; risiko dependensi tanpa pin |

---

## 5. Implementasi

Semua di `presets/edit_preset.py`, bagian baru `# ---- 8. v1.6 consistency (DRAFT_preset_update.md)`, memakai `rep()` dan `toggle()` yang sudah ada. Setiap `rep()` punya `assert`, jadi build gagal kalau teks aslinya berubah.

| # | Cara | Target |
|---|---|---|
| U1, U2, U3, U10 | `rep` pada BOLT (id `634ecfec…`) | langkah 0, 2, 7, 11 |
| U4, D3 | `rep` pada `<npc_voice>` (versi Micro yang aktif) | awal + akhir tag |
| U5, D2 | `rep` pada `<vad_emotion>` + sisip `<character_calibration>` | NPC Instincts + VAD |
| U6 | `rep` pada `<npc_creation>` | HQ NPC Genesis |
| U7, D8 | `rep` pada `<scene_engine>` | Scene Engine |
| U8, D6 | tulis ulang konten bridge | Bridge (sudah dibuat oleh script) |
| U9 | `rep` pada `<NPC_intro>` | Main Prompt |
| U11, D7 | `rep` pada `<anti_omniscient_NPCs>` | Anti-Omniscient |
| U12 | `rep` pada `<youre_not_a_therapist>` | opsional |
| D1 | prompt baru "🚪 Last-Mile Cast Gate", system, depth 0, setelah Last-Mile Vocation Gate | baru |
| D5 | prompt baru "📨 Latest Input", system, depth 0, tepat sebelum BOLT | baru |

**Tes:**
- `python presets/edit_preset.py` deterministik (jalankan dua kali, hasilnya byte-identik).
- `tests/test_preset_v162.cjs` (baru):
  - BOLT tidak lagi berisi "bond Progress" / "+2 significant"
  - kedua prompt baru ada, aktif, dan urutannya benar
  - semua tag yang dirujuk CoT (`<cast>`, `<final_cast_gate>`, `<latest_input>`) memang ada di preset atau card
- Tambah bagian preset di `token_audit.cjs`.

**Perkiraan tambahan:**
- prompt tetap: sekitar +650 token (gerbang ~80, kalibrasi ~220, voice ~180, sisanya tambahan kecil)
- input terbaru: +panjang pesan pemain
- reasoning: +100–250 per balasan (Cast check lebih panjang daripada langkah 7 lama)

**Pengiriman:** preset versi Eldrasil 1.6.2, `PROGRESS.md`, zip. Masuk "To verify in ST":
- `{{lastUserMessage}}` terisi di endpoint Gemini
- balasan tidak terpotong (U13)
- gerbang D0 tidak menggeser `<UpdateVariable>` dari posisi terakhir

---

## 6. Keputusan terbuka

1. `[?]` **Proceed** pembaruan preset ini (menggantikan Batch E)?
2. `[?]` **U1 dikerjakan sekarang** sebagai perbaikan terpisah? Ini bug yang sudah ada di v1.4.5, tidak perlu menunggu Batch 0–G. Saran saya: ya, sebagai patch kecil 1.4.6.
3. `[?]` **U12:** batas tanda tanya diubah menjadi per karakter, atau tetap satu per balasan?
4. `[?]` **D5:** kirim input terbaru dua kali (sedikit token) demi N1, atau cukup mengandalkan rule card?
5. `[?]` Ambil juga yang opsional (**no fake specificity**, **organ autonomy**)?
