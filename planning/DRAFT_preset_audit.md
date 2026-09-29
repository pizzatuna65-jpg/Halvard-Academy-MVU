# DRAFT — Audit preset (Realistic Frankenstein 2.2, edit Eldrasil) — 2026-09-28

Status: **diterapkan di v1.11.2** (owner: "proceed"; A, B, C semua; D1 tidak diambil, Occupational Monomania + Vocation Gate tetap ON). Hasil: preset 16.883 → 15.877 token per pesan. Teks di bawah adalah usulan aslinya. Setelah owner bilang "proceed", semua perubahan dikerjakan di
`presets/edit_preset.py` (bukan di JSON hasil). Setiap `rep()` meng-assert teks jangkarnya, lalu preset di-build dua kali dan
dibandingkan.

Yang diperiksa: 91 prompt (**36 aktif, ~16.800 token** per pesan; **~4.600 di antaranya di depth 0**, setelah riwayat chat),
37 regex preset, dan setelan sampler. Metode:
- membaca isi semua prompt yang aktif;
- mencari tag yang dirujuk tapi tidak ada;
- mencari macro dan variabel yang mati;
- menghitung tumpang tindih kalimat (6 kata beruntun) antar-prompt dan dengan aturan kartu (501–510, World Index);
- mencari kata dewasa, modern, DnD, dan khusus Eldrasil di prompt yang selalu aktif.

## Ringkasan

| Kelompok | Temuan | Hemat (token/pesan) |
|---|---|---|
| A. Bertentangan dengan kartu atau keputusan owner | 6 | ~240 (A1 pindah ke toggle dewasa; A2–A6 perbaikan isi) |
| B. Usang (menunjuk toggle yang OFF, format lama, dunia modern) | 6 | ~290 (semua di depth 0) |
| C. Redundan (aturan yang sama dua kali) | 7 | ~560 |
| D. Opsional (selera owner) | 1 | ~900 |
| **Total tanpa D** | | **~1.100 (~6,5%)** |

Yang **sudah baik** dan tidak perlu diubah:
- Pembagian kartu ↔ preset rapi: CoT hanya menunjuk aturan kartu, dan hanya Bridge yang menyebut Eldrasil.
- Semua pelacak Internal States OFF.
- Regex GFX dan "thoughts" membersihkan prompt.
- Setelan Gemini masuk akal (temp 1.0, top_p 0.95, web search off). `repetition_penalty` dan logit bias memang diabaikan
  Gemini, jadi tidak berbahaya.

## A. Bertentangan dengan kartu atau keputusan owner

**A1. Konten dewasa masih ada di prompt yang selalu aktif** (bertentangan dengan keputusan token audit C1, 1.11.0: "adult
content is opt-in"). Toggle dewasa sudah OFF, tapi potongan ini tetap terkirim setiap pesan:
- HQ NPC Genesis → seluruh `<baseline_anatomy>` (daftar anatomi eksplisit, ~119 token). Tidak ada prompt lain yang
  membacanya, jadi fungsinya hanya memancing kosakata.
- NPC Voice → "Ensure NPCs talk or moan through intimacy: "unnhhh, mmmm, YES!"".
- Realistic NPCs → "…or engage in forced interactions/non-con."
- Main Prompt → sweep NPC baru "body: … explicit anatomical shapes".
- Jailbreak → bagian "# Intimate Scenes".

Usul: pindahkan ke toggle dewasa (Realism Mode / Freaky Mode) supaya tetap jalan saat pemain menyalakannya. Kalau tidak
dipindah, cukup hapus dari prompt yang selalu aktif.
- Main: "body: build, skin tone, posture, explicit anatomical shapes" → `body: build, skin tone, posture`
- Realistic NPCs: "…may lie, confront, disagree, or engage in forced interactions/non-con." → `…may lie, confront or disagree.`

**A2. Jailbreak menyebut "{{user}}, a first-year student".** Ini salah sejak Year 2 (kartu sudah memperbaikinya di World
Index 1.9.7) dan melanggar aturan kartu-vs-preset (kalimat itu tidak masuk akal di kartu lain). Usul:
> You are the narrator and engine of a mature novel in the world the card sets up (dark where the story earns it), written
> for a consenting adult reader. {{user}} is one person among many in this world, referred to in the story as 'you'.

**A3. Jailbreak "Failure is absolute. Partial success stays partial. Clean wins are rare and earned."** Ini bertentangan
dengan Fortune roll kartu (1.9.8). Di sana band Gentle memberi hasil bersih di 36+, dan kegagalan "costs something
proportionate, never a dead end". Usul (generik, tanpa menyebut kartu):
> - When the card defines how uncertain attempts resolve, its rule decides. Otherwise failure is real, partial success stays
>   partial, and a clean win is earned.

**A4. Jailbreak mendorong kejutan: "introduce plot twists" dan "let it collide with the current scene as an immediate
consequence: an ambush, a lockdown, an interception, an ultimatum".** Ini bertentangan dengan BOLT tugas 11 (HOLD; "on most
turns the world stays quiet") dan aturan kartu 504 tentang sumber peristiwa dunia. Usul:
> - Antagonists act on their appetites once the story has earned it: a threat the story has already established may collide
>   with the scene. Nothing is introduced only to raise the stakes.
> - Balance combat, social interaction, exploration and adventure. Everyone has motivations, goals and reasons of their own.

**A5. Anti-parrot: "NPCs must react organically to only 1 or 2 key elements of {{user}}'s input".** Ini bertentangan dengan
BOLT tugas 11 dan Player Input Authority ("All three must fully answer whatever {{user}} just did or said"). Usul:
> - Flow: Avoid sequential, point-by-point replies. NPCs answer what a person would answer in {{user}}'s input, in one natural
>   response, not item by item.

**A6. Cinematic Realism "You must ban character thoughts"** bertentangan dengan Scene Engine ("brief NPC internal beats are
welcome when they change that character's next move"). Usul:
> You must ban summaries of characters' thoughts and meta-commentary in narrative; brief NPC interiority only as <scene_engine>
> allows, and never {{user}}'s.

## B. Usang

**B1. Tanggal di baris pertama CoT tanpa tahun.** BOLT tugas 0 meminta `"Now: M? W? Day HH:MM at <place>", copied from <now>`.
Tapi sejak 1.7.4 `<now>` berbunyi "Year 2, Month 1, Week 1, Mon 10:00 | … | at …" dan tanggal engine memakai "Y2 M1 W1 Mon".
Akibatnya, dari Year 2 VectFox (yang membaca baris ini) menerima tanggal tanpa tahun, sehingga kejadian Year 1 dan Year 2 bisa
tercampur. Usul: `"Now: Y? M? W? Day HH:MM at <place>" (the year only from Year 2, as the card dates it)`.
`[cek live]`: pastikan VectFox tetap membaca tanggal dengan awalan "Y2".

**B2. Lemparan dadu DnD di BOLT tugas 1** ("DND Rolls … User rolls: {{roll::1d20}} | NPC rolls: {{roll::1d20}}", ~74 token,
depth 0). DnD Simulator wajib OFF bersama kartu (HANDOFF §8), tapi macro-nya tetap melempar dua d20 baru setiap giliran, tepat
di sebelah Fortune roll kartu. Model melihat dua sistem angka yang bersaing. Hapus.

**B3. Cek untuk toggle yang harus tetap OFF di Gemini**, semuanya teks bersyarat di depth 0:
- tugas 5: staccato / anti-briefing (~130 token);
- tugas 6: `<roleplay_isnt_reality>`, `<Prefill>`, `<professional_legality>` (~39; hanya `<realist_gemini>` yang ada);
- tugas 8: `<quant_hardening>` (~44).

Hapus. Cek Realism Mode / Freaky Mode (tugas 1 dan 10) **dipertahankan**, karena itu toggle opt-in pemain.

**B4. Anti-Omniscient: "explicit transfer (calls/evidence)".** Dunia ini tidak punya telepon. Ganti dengan
`(being told, a letter, evidence)`.

**B5. NPC Instincts: "core biological instincts [7]"**, padahal daftarnya 8. Ganti `[7]` menjadi `[8]`.

**B6. Regex tampilan untuk pelacak yang OFF.** 15 regex masih ON: Menu Orange/Teal/Purple/Master, Relationship Bars,
GM Notebook Highlights, bond card gaps, `[T]` notes, register ripeness, dan lain-lain. Semuanya tidak menghemat token, tapi
berjalan di setiap pesan dan beberapa (Highlights, Stack Bullets, `<ul>`) bisa menyentuh narasi berformat daftar. Matikan
yang hanya melayani Internal States. Tetap ON: GFX Unfence/Stripper, Hapuppy thoughts, Summary Auto-Close, lima regex warna
dialog SillyTavern, dan Context Saver.

## C. Redundan

| # | Aturan yang dobel | Usul | Hemat |
|---|---|---|---|
| C1 | Main `<do_not_repeat_descriptions>` ≈ `<attentional_salience>` ("last 4 msgs", "user habituated to own traits") | Satu baris unik Attentional Salience (micro-tells → macro action) dipindah ke `<do_not_repeat_descriptions>`, toggle Attentional Salience OFF, daftar direktif jailbreak diperbarui. Nama tag lama dipertahankan karena dibaca oleh 3 CoT dan jailbreak | ~110 |
| C2 | NPC Voice "Attitude: … four sources …" ≈ Scene Engine "Behaviour has four sources" (11 runs 6-kata sama) | Hapus dari NPC Voice; cukup kalimat "NPCs never have unearned aggression …" | ~139 |
| C3 | NPC Voice "Anti-Therapy Register" ≈ prompt Gemini "Don't Speak Like a Therapist" (lebih lengkap) | Hapus baris di NPC Voice | ~64 |
| C4 | Cinematic "Figurative Economy" ≈ `<emission_limits>` Metaphor/Saturation | Hapus dari Cinematic | ~86 |
| C5 | Larangan em-dash/elipsis di narasi ada 3 kali (Cinematic, `<banned_constructs>`, NPC Voice); tricolon 2 kali (NPC Voice, `<break_the_triad>`) | Pertahankan di `<banned_constructs>` dan `<break_the_triad>`; hapus salinannya | ~45 |
| C6 | "Sound blocked by walls" di Main `world.physics.audio` dan di `<anti_omniscient_NPCs>` | Hapus kalimat di Anti-Omniscient (Main lebih rinci) | ~20 |
| C7 | Bridge "Recalled memories … <current_state> is now" sudah ada kata per kata di kartu 504 (11 runs sama). Bridge "Setting: no phones …" dan "metric units" adalah fakta dunia | Hapus kalimat memori dari Bridge (kartu yang memegangnya). Satu baris "no phones, computers or recording devices; metric units" pindah ke World Index kartu (`merge_lorebooks.py`), lalu hapus dari Bridge | ~100 |

## D. Opsional (selera)

**D1. Occupational Monomania Killswitch + Last-Mile Vocation Gate** (~896 token; 160 di depth 0). Keduanya dibuat untuk
Kimi K3 (catatan preset), dan contohnya bernada dewasa ("Between kisses…"). Di Halvard pekerjaan memang muncul (guru, staf
Mall, Bobby), jadi keduanya tidak salah. Hanya saja, di Gemini masalah ini belum pernah terlihat di playtest.

## Pertanyaan untuk owner

1. `[?]` **D1**: matikan Occupational Monomania + Vocation Gate (hemat ~900 token per pesan), atau biarkan ON?

Keputusan yang saya ambil sendiri (default, bisa diubah):
- **A1**: dipindah ke toggle dewasa, tidak dihapus.
- **B1**: tahun ditambahkan hanya mulai Year 2, supaya Year 1 tetap sama persis bagi VectFox.
- **B6**: regex pelacak dimatikan (disabled), tidak dihapus.

## Setelah diterapkan

- Rilis preset berikutnya: build preset dua kali (identik), `test_preset.cjs` diperbarui untuk teks baru, dan
  `token_audit.cjs` diukur sebelum dan sesudah.
- `docs/ECOSYSTEM.md` diperbarui: masih tertulis "always-on preset ~14.2k"; sekarang ~16.8k, dan sesudah audit ini ~15.7k
  (atau ~14.8k dengan D1).
- `docs/TEST_CHECKLIST.md`: satu cek live untuk B1 (VectFox membaca "Now: Y2 …").
