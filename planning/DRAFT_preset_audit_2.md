# DRAFT — Audit preset ke-2 (Realistic Frankenstein 2.2, edit Eldrasil) — 2026-10-04

Status: **menunggu "proceed" owner.** Belum ada yang diubah di repo. Setelah "proceed", semua perubahan dikerjakan di
`presets/edit_preset.py` (bagian baru, setiap `rep()` meng-assert teks jangkarnya), preset di-build dua kali dan dibandingkan, lalu draft
ini dihapus. Audit sebelumnya (1.11.2) ada di git: `git show b62d182:planning/DRAFT_preset_audit.md`.

## Cara audit

- Semua 33 prompt yang aktif dibaca utuh, dalam urutan yang diterima model.
- Ukuran diukur **persis seperti yang dikirim SillyTavern**: `{{user}}` diganti dulu, baru komentar `{{// }}` dibuang (urutan ini
  dicek di `public/scripts/macros.js` ST: `envMacros` jalan sebelum `postEnvMacros`). `setvar`/`getvar` kosong dan `{{trim}}` tidak
  menyisakan apa pun. Token ≈ karakter / 3,6, sama seperti `tests/token_audit.cjs`.
- Dicari: aturan yang sama di beberapa modul (frasa sama dan makna sama), rujukan ke tag yang tidak ada atau selalu OFF, CoT yang
  menyalin aturan, dan instruksi yang membuat model menulis ulang aturan di reasoning.
- Semua usulan di bawah sudah diprototipe pada salinan preset di scratchpad. Angka "sesudah" adalah hasil ukur, bukan tebakan.
  `test_preset.cjs` dan `test_npc_thoughts_v1373.cjs` dijalankan ke prototipe: semua lolos kecuali satu pin yang memang dipindah (lihat
  "Tes").

## Ringkasan

| | Sekarang | Sesudah | Selisih |
|---|---|---|---|
| Semua prompt aktif | 17.245 | 15.444 | **−1.801 (10%)** |
| Depth 0 (setelah riwayat chat) | 5.447 | 4.435 | **−1.012 (19%)** |

- **Depth 0 diprioritaskan.** Bagian ini dibaca tepat sebelum model menulis dan berubah setiap giliran, jadi tidak pernah ikut
  prefix-cache provider. Setiap token di sini dibayar penuh setiap giliran.
- **Reasoning juga ikut hemat.** BOLT tidak lagi menyuruh model "list the <prose_rules> concisely now", menulis contoh tiap giliran, atau
  menyalin aturan dialog ke reasoning. Itu token output (thinking Gemini) setiap giliran. Besarnya tidak bisa diukur di Node; cek di ST
  dari panjang blok reasoning.
- **Koreksi perkiraan.** Kemarin saya menyebut ±3–5 ribu. Setelah dibaca dan diukur, perubahan berisiko rendah menghasilkan ±1.800.
  Sisanya hanya bisa didapat dengan memangkas isi unik modul upstream yang sudah disetel untuk Gemini. Itu dipisah sebagai Tingkat 2
  (±900–1.000 lagi, belum diambil).
- **Yang tidak berubah:**
  - Semua toggle pilihan owner: 4–7 paragraf, Embellish Mode, Hybrid POV, Internal Thoughts ON, Player Input Authority ON.
  - Toggle dewasa tetap opt-in (dan cek-nya di BOLT tetap ada).
  - Occupational Monomania + Vocation Gate tetap ON (owner, 1.11.2 D1).
  - Anti-Comparative Emphasis dan "Don't Speak Like a Therapist" tidak disentuh isinya.
  - Tidak ada modul yang dimatikan.

### Kenapa preset ini besar

Realistic Frankenstein dibuat untuk kartu apa saja. Setiap modul melawan satu kebiasaan buruk model dan berdiri sendiri, lengkap dengan
penjelasan dan contoh. Akibatnya aturan yang sama muncul di beberapa modul. Contohnya:
- "hovering hands" ada di 4 tempat;
- "suara NPC harus khas" ada di 4 kalimat;
- larangan em-dash ada di 3 tempat.

Selain itu, CoT BOLT menyalin aturan dari modul-modul itu, dan dua gerbang depth 0 menyalin hampir seluruh daftar dari killswitch-nya.

## A. BOLT Chain of Thought (depth 0): 2.511 → 1.812

Prinsipnya sama dengan aturan proyek untuk kartu: CoT **menunjuk** aturan, tidak menyalinnya. Tugas 0, 2, 7 dan 10 tidak berubah (teks
Eldrasil, dikunci tes; VectFox membaca baris "Now:"). Aturan A–D juga tetap.

| Tugas | Masalah sekarang | Perubahan |
|---|---|---|
| 1 | Tiga pertanyaan soal "hovering hands" yang sudah ada di `<realistic_bold_characters>` dan `<card_fidelity>`, plus "I must provide a brief example" setiap giliran | menunjuk ke modulnya; contoh di reasoning dihapus |
| 3 | Menyalin isi `<sensory_salience>` | menunjuk |
| 4 | "What are the <prose_rules>? I will list them concisely now." (daftar aturan ditulis ulang di reasoning tiap giliran) | "apply … without listing them" |
| 5 | ±420 token menyalin `<npc_voice>`: legato, satu "and/or" per kalimat, CAPS, contoh dialog saat emosi tinggi | menunjuk ke `<npc_voice>`/`<human_vocal_limits>`; yang unik dipertahankan (bunyi non-leksikal, tokoh gugup tetap gagap) |
| 6 | "listing the rules briefly"; "NPC anti-repeat rule" adalah nama yang tidak ada di mana pun | menunjuk ke "No echoes" di `<realistic_bold_characters>` |
| 8 | Cek `<colored_dialogue>`: toggle itu selalu OFF bersama kartu ini (DECISIONS §9, 1.37.0) | dihapus; cek `<gfx_protocol>` (opt-in) tetap |
| 9 | ±110 token untuk dua mode dewasa yang opt-in | satu kalimat, perilaku sama |
| penutup | mengulang aturan B ("never draft full prose…") | satu kalimat |

Teks baru (tugas 0, 2, 7, 10 dan aturan A–D tidak berubah):

```
1. Strict neutrality: as a neutral model I let {{user}}'s actions succeed or fail, and treat {{user}} and NPCs equally within the simulation. Each NPC chases their own goal, true to their card and current VAD, and carries out what they decide per <realistic_bold_characters>, unless their card makes hesitation part of who they are. If the card gives a roll for uncertain attempts, I use it only as the card's rule says.
Mode check first: if <freaky_supremacy> is present, taste-independence, agency friction and <instinct_autonomy_gate> are SUSPENDED — NPC wants align eagerly with {{user}}'s, instinct overrides judgment, and I skip the derivation. Otherwise a taste the card leaves blank is derived per <abolish_yesman_behaviour>, never from {{user}}, and kept for the whole chat; for any instinct firing this turn I name what the NPC's own judgment does with it per <instinct_autonomy_gate>, and nothing happens merely because {{user}} repeated a move that worked earlier.

3. Scope/Knowledge: NPCs act only on this scene's physical reality and on what they could know, per <anti_omniscient_NPCs> (anti-bridging, smell, sound, thought and evidence rules). A smell I was about to write must pass <sensory_salience>; if not, I cut it and give the space to action or want.

4. Prose style: I apply <prose_rules>, <syntax_flow> and <do_not_repeat_descriptions> to this scene without listing them: nothing repeated or semantically re-skinned from the last 4 messages, generic patterns outcompeted with lived-in detail, any "not X, it's Y" flip or reflexive triad flattened into one direct line, filler "genuinely/truly" cut (<comparative_emphasis_killswitch>, <break_the_triad>, <resolution_competition>, <emission_limits>, <filler_intensifier>).

5. Natural dialogue: for each NPC who speaks, what they want and feel this instant (<vad_emotion>, active <npc_instincts>), voiced per <npc_voice> and <human_vocal_limits> in their own idiolect, with expressive punctuation and non-lexical sounds (ugh, mmph, shhh) when logical; a character whose card or first message makes nerves part of who they are keeps their stalls, restarts and fragments. Skip if emotions are ordinary.

6. User boundaries: I apply the correct <POV> and <user_autonomy>, and reuse no beat, joke or reaction from earlier replies (No echoes, <realistic_bold_characters>). If <realist_gemini> is present, I follow its instructions to a tee.

8. Formatting: if <gfx_protocol> is present, is it appropriate for this scene? I note the length range in <formatting_constraints> (if the tag is not present, a logical length; close enough is fine). Output order: the story (any gfx sits inline where it occurs), then, if <internal_npcthoughts> is present, its one <npc_thoughts> block, then, if <update_format> is present, exactly one <UpdateVariable> block as the very last thing. Nothing follows it, and I never emit <details>, internal-states or tracker HTML.

9. Modes: if <freaky_supremacy> is present (Freaky Mode), its <adult_mode> rules apply to every scene; otherwise, if <adult_mode> is present (Realism Mode), I apply it where the scene calls for it. Neither repeats descriptions from the last 4 turns. Skip if neither is present.

I am a GM running an immersive simulation, not a helpful assistant: bold choices matter more than perfection. Concise task notes only, then I close the reasoning and write the final response immediately.
```

## B. Dua gerbang depth 0 menjadi pengingat pendek

Killswitch-nya tetap ON dan utuh di bagian atas prompt. Gerbangnya hanya menyalin daftarnya (32 runtun 5-kata sama antara Contrast Gate
dan killswitch-nya). Fungsi gerbang dipertahankan: pengingat di posisi paling akhir, untuk baris pertama sampai terakhir, narasi dan
dialog.

| Gerbang | Sekarang | Sesudah |
|---|---|---|
| Last-Mile Contrast Gate (Cosmos) | 282 | 121 |
| Last-Mile Vocation Gate (Cosmos) | 250 | 161 |

```
<final_contrast_gate>
Silent pre-output check, first line to last, in narration and dialogue alike: no line defines, explains or forecasts something by negating or shrinking a rival version of it ("not X, but Y", "It wasn't X. It was Y.", "X will not simply Y"). Delete the negated half and state the true one directly, per <comparative_emphasis_killswitch>. Earlier messages in this chat are not a style license.
</final_contrast_gate>
```

```
<final_vocation_gate>
Silent pre-output check: is anyone's job supplying material the scene did not ask for (trade talk filling an idle turn, the trade's vocabulary used on something outside it, jargon where the people present would say the everyday word, an absent person introduced by a colourful habit)? If nothing on the premises, in the dialogue or pressing this turn called for it, cut it per <occupational_monomania_killswitch> and give the space to what this person wants, feels or is avoiding. Earlier messages in this chat are not a style licence.
</final_vocation_gate>
```

Yang pindah sepenuhnya ke killswitch (tetap ada di sana): pengecualian "memperbaiki detail yang salah", aturan stake lunak dari pesan
pemain, dan daftar lengkap bentuk-bentuknya. Kalau di uji live pola "not X but Y" atau obrolan pekerjaan terlihat naik, gerbang lama
dikembalikan.

## C. Satu aturan, satu rumah

Setiap aturan tetap ada, hanya di satu modul. Angka per baris adalah perkiraan; total per modul di bagian E adalah hasil ukur prototipe.

| Aturan | Muncul di | Tetap di | Dihapus dari | Hemat |
|---|---|---|---|---|
| NPC melaksanakan keputusannya sepenuhnya ("hovering hands") | Realistic NPCs, Card Fidelity, instinct gate, BOLT 1 | Realistic NPCs (+ pengecualian tokoh cemas di Card Fidelity) | instinct gate ("Whatever the NPC does settle on… no half-started reach."), BOLT 1 | ±35 (+ BOLT) |
| Kartu mengalahkan aturan gaya | NPC Voice (kalimat pembuka), Card Fidelity (depth 0) | Card Fidelity | NPC Voice: "A character's own card… outranks every rule in this tag… never shouts in capitals because a rule here allows it." | ±60 |
| Suara NPC khas dan stabil | NPC Voice (Cadence & Dialect, Diction Friction, Anti-Smoothing), Scene Engine (idiolect) | NPC Voice, satu baris (teks di bawah) | tiga bullet lama; kalimat idiolect di Scene Engine | ±95 |
| Em-dash dan elipsis | Cinematic, `<banned_constructs>`, NPC Voice | `<banned_constructs>` | Cinematic, NPC Voice ("Em dashes and ellipses allowed…") | ±40 |
| Aturan narasi di tag yang khusus dialog | NPC Voice "De-prioritise action sets in narration… mouth opening, closing, opening again" | daftar kata terlarang (frasa itu sudah ada di sana) | NPC Voice (tag ini sendiri berbunyi "ONLY apply to NPC dialogue, NOT all prose") | ±75 |
| Baris ini menyalin METHOD | NPC Voice "Attitude: Each line pursues what the speaker wants…" | METHOD | baris Attitude itu | ±35 |
| Alur paragraf dan variasi kalimat | Cinematic (dua paragraf alur, "Rotate sentence structures", "repetitive pronoun-verb"), `<syntax_flow>` | `<syntax_flow>` (lebih konkret, ada angkanya) | Cinematic diganti satu baris: "Paragraph flow follows <syntax_flow>; never verbless fragments or telegraphic prose." | ±150 |
| Negasi sebagai deskripsi (apophasis) | Cinematic (blok + contoh, "only narrate what does happen…"), `<banned_constructs>` | `<banned_constructs>` | Cinematic | ±60 |
| Micro-expression jadi aksi makro | Cinematic, `<do_not_repeat_descriptions>` | `<do_not_repeat_descriptions>` | Cinematic | ±15 |
| Mood/sifat tidak dicap ulang dengan sinonim | `<character_calibration>`, `<do_not_repeat_descriptions>` ("semantic re-skins") | `<do_not_repeat_descriptions>` | calibration (satu kalimat) | ±15 |
| Istilah teknis/militer | Anti-Omniscient ("Avoid military/clinical tone."), Monomania, Cinematic | Monomania + baris istilah tubuh di Cinematic | Anti-Omniscient (salah tempat) | ±8 |
| Jangan menulis draf di reasoning | Main Prompt, BOLT B, penutup BOLT | BOLT B | Main Prompt, penutup BOLT | ±35 |
| Kekuatan, keterikatan, kerentanan lewat perilaku; motif bertentangan dan agenda pribadi | Jailbreak, Scene Engine (hampir kata per kata) | Scene Engine | Jailbreak (sisa: "Pressure forces choices.") | ±60 |

Baris pengganti di NPC Voice:

```
- Distinct voices: every NPC keeps a stable idiolect, the register, dialect, slang and vocabulary of their origin, class, age, work, hobbies and subculture, with accents, idioms and quirks never smoothed into a neutral voice, so no two NPCs in a scene sound interchangeable; a specialist metaphor appears only when it fits that speaker and that moment.
```

## D. Internal Thoughts: teks kita sendiri, aturan sama (489 → 363)

Bukan teks upstream (dibuat di 1.37.3), jadi aman dipadatkan. Frasa yang dikunci tes tetap ada ("Never {{user}}", "only as raw as that
character is", "never more emotional or dramatic than their card", "never spells out a secret", "the update block stays last").

```
<internal_npcthoughts>
After the narrative, write one thoughts block in exactly this form, in the story's language:
<npc_thoughts>
- **Name**: thought
- **Name** (where they are, what they are doing): thought
</npc_thoughts>
1. Who: up to 3 NPCs, present ones first. An absent NPC appears only when they matter to what is happening, at the place and task the card's records or the story already give them; the block never moves anyone or invents a meeting. Never {{user}}: their thoughts belong to the player.
2. Voice: 1 to 3 short lines each, in the moment, but only as raw as that character is: a thought is never more emotional or dramatic than their card makes them. True to their card, their mood and, when the card keeps one, its record of how they see {{user}}.
3. Knowledge: only what that character knows. A thought never spells out a secret the story still keeps from {{user}}; such a thing shows only as the character would feel it (unease, a topic they steer away from).
4. Consistency: the thoughts match the narrative and drive what each NPC does next.
5. Place: outside the narrative, so the prose never quotes or summarises it; right before the card's state-update block when there is one, and the update block stays last. Never write this instruction's tag name in the reply.
</internal_npcthoughts>
```

## E. Ukuran per modul (hasil prototipe)

| Modul | Sekarang | Sesudah | Selisih |
|---|---|---|---|
| BOLT Chain of Thought (depth 0) | 2.511 | 1.812 | −699 |
| NPC Voice + Dialogue Output: Cosmos | 1.649 | 1.365 | −284 |
| Cinematic Realism | 686 | 467 | −219 |
| Last-Mile Contrast Gate: Cosmos (depth 0) | 282 | 121 | −161 |
| Internal Thoughts | 489 | 363 | −126 |
| Last-Mile Vocation Gate: Cosmos (depth 0) | 250 | 161 | −89 |
| AI Studio Jailbreak (depth 0) | 714 | 651 | −63 |
| Scene Engine | 1.498 | 1.439 | −59 |
| NPC Instincts + VAD | 1.455 | 1.397 | −58 |
| Main Prompt | 705 | 670 | −35 |
| Anti-Omniscient NPCs | 361 | 353 | −8 |
| 22 modul lain | 6.645 | 6.645 | 0 |
| **Total** | **17.245** | **15.444** | **−1.801** |

## F. Perbaikan alat ukur

`tests/token_audit.cjs` membuang komentar `{{// }}` **sebelum** mengganti `{{user}}`. Komentar yang berisi `{{user}}` (contohnya catatan
pembuka NPC Instincts) terpotong di `}}` milik `{{user}}`, dan sisanya ikut terhitung. Akibatnya angka preset yang dilaporkan selama ini
(17.877) ±630 token lebih tinggi dari yang benar-benar dikirim (17.245). ST sendiri mengganti `{{user}}` dulu, jadi di ST tidak ada yang
bocor. Usul: samakan urutannya dengan ST (ganti macro dulu, baru buang komentar), dan tambahkan cek batas ukuran preset di tes supaya
tidak diam-diam tumbuh lagi (menurut cara hitung lama: 15,9k di 1.11.2, 17,9k sekarang).

## Tidak diusulkan (dan alasannya)

- **Mematikan Occupational Monomania + Vocation Gate:** owner sudah memutuskan tetap ON (1.11.2 D1). Yang dipendekkan hanya gerbangnya.
- **Mengubah isi Anti-Comparative Emphasis atau Don't Speak Like a Therapist:** keduanya melawan kebiasaan Gemini yang paling kuat.
- **Mengadaptasi Micro CoT** (tercatat di `FUTURE_PLANS` §4): Micro CoT di upstream 1.842 token. Setelah diet ini BOLT 1.812, jadi
  Micro tidak lebih ringan lagi. Item itu bisa ditutup.
- **Menghapus salinan pesan pemain di Player Input Authority** (`{{lastUserMessage}}`): keputusan sengaja di 1.5.0, supaya model tahu
  teks mana yang input di antara instruksi depth 0.
- **Accurate Anthro Vocalisations tetap OFF:** catatan upstream menyarankan ON untuk cast beastfolk, tetapi menambah token, dan lore tidak
  menulis Beastkin bersuara hewan (growl di lore milik roh Sobek).
- **Memindahkan aturan preset ke kartu, atau sebaliknya:** melanggar aturan "Card vs preset". Modul generik yang mirip aturan kartu
  (Anti-Omniscient, Card Fidelity) tetap, karena preset harus jalan di kartu lain dan kartu harus jalan dengan preset lain.

## Tingkat 2 (opsional, belum diambil): ±900–1.000 token lagi

Ini memangkas isi unik modul upstream yang disetel untuk Gemini. Hematnya nyata, tapi gaya bisa bergeser dan port RF berikutnya jadi
lebih repot.

| Kandidat | Hemat (perkiraan) | Risiko |
|---|---|---|
| Don't Speak Like a Therapist (depth 0): padatkan daftar gerakan dan paragraf REDIRECT | ±200 | kebiasaan "terapis" Gemini bisa kembali |
| Monomania: buang tiga contoh perbaikan dan paragraf penutup | ±150 | contoh mengajarkan cara memperbaiki |
| NPC Voice: contoh CAPS dan contoh "grape soda" | ±120 | contoh membantu model meniru bentuk |
| Anti-Sycophancy: padatkan prosedurnya (diprototipe: ±100) | ±100 | derivasi selera tidak lagi ditulis eksplisit |
| Human Vocal Limits, HQ NPC Genesis, paragraf "Scene end" di Scene Engine | ±300 | kecil per modul |

Saran: nilai setelah Tingkat 1 diuji live.

## Cara menerapkan dan verifikasi

- `presets/edit_preset.py`: bagian baru "16. audit preset ke-2" berisi `rep()` untuk setiap perubahan di atas. Tugas BOLT dirakit dari
  teks yang ada, seperti bagian 3.
- **Tes:**
  - Satu pin di `test_preset.cjs` ("U4 + D3 in the active <npc_voice>", yang memeriksa kalimat "outranks every rule in this tag") pindah
    ke Card Fidelity, yang sudah dikunci di tes yang sama.
  - Tambahan cek: tidak ada `<colored_dialogue>` dan "list them concisely" di BOLT; kedua gerbang menyebut tag killswitch-nya; batas
    ukuran preset.
  - `test_npc_thoughts_v1373.cjs` lolos tanpa perubahan.
- Rilis kartu biasa: fixture save, naik versi, `python tools/build_all.py --preset`, changelog, handoff, commit. `docs/ECOSYSTEM.md`
  memperbarui angka ukuran preset.
- **Cek live** (masuk `docs/TEST_CHECKLIST.md`):
  1. Blok reasoning lebih pendek dan tetap diawali "Now:".
  2. Pola "not X but Y" dan obrolan pekerjaan tidak naik dengan gerbang pendek.
  3. NPC tetap bersuara khas dan tetap melaksanakan keputusannya.
  4. Blok `<npc_thoughts>` tetap muncul sebelum `<UpdateVariable>`.

## Pertanyaan untuk owner

1. `[?]` Tingkat 2: kerjakan sekarang bersama Tingkat 1, atau setelah uji live? (Default bila tidak dijawab: setelah uji live.)
