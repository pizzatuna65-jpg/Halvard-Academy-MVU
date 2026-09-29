# DRAFT — Merapikan repository (2026-09-28)

Status: **selesai (2026-09-28).** Owner: "semua proceed"; [?] 1–4 mengikuti saran (v37 dihapus, system_state.txt disimpan, DRAFT tetap di tempat, docs/npc_brainstorm dihapus).

Cara cek: setiap kandidat sudah dicari rujukannya di `tools/`, `build/`, `tests/`, `src/`, `data/`, `presets/`. Yang dirujuk kode
diberi catatan path mana yang harus ikut diubah. Setelah eksekusi: rebuild + `npm test` penuh untuk memastikan tidak ada yang putus.

Ukuran repo sekarang (tanpa `node_modules/`): ~135 MB, dan **~94 MB di antaranya zip lama**.

---

## A. Hapus (tidak dipakai kode, isinya ada di tempat lain)

| # | File / folder | Ukuran | Alasan |
|---|---|---|---|
| A1 | `Eldrasil_Halvard_v1.7.8_project.zip`, `eldrasil_project_v1.9.0.zip`, `eldrasil_project_v1.9.0_playtest_plan.zip`, `eldrasil_project_v1.9.1_batch1.zip`, `eldrasil_project_v1.9.2_batch2.zip`, `eldrasil_project_v1.9.3_batch3.zip` | ~94 MB | Snapshot proyek lama. Semua isinya sudah ada di repo versi terbaru; aturan owner: tidak ada zip kecuali diminta. |
| A2 | `planning/lore_others.md`, `lore_rivals.md`, `lore_staff.md`, `lore_year1.md`, `lore_year2.md`, `lore_year3.md` | 196 KB | Salinan lama dari `source_original/npc_lore_2026-09-25/` (1 identik, 5 beda 2–16 baris; versi `source_original` lebih baru dan itu yang canon + dibaca `merge_lorebooks.py`). |
| A3 | `planning/bond_rewards.md`, `planning/reputation.md`, `planning/training.md` | 45 KB | **Identik byte-per-byte** dengan `docs/design/*.md` (yang dirujuk `data/*.json` dan `make_npc_brief.py`). Ikut ubah: `tests/test_voices_g5_v167.cjs` baris 41 (cek dua salinan identik → cek satu file). |
| A4 | `docs/TEST_CHECKLIST_v0.2.md`, `v0.3`, `v0.4`, `v0.5`, `v1.0`, `v1.0.3`, `v1.1` | 16 KB | Checklist fitur versi awal yang sudah berubah jauh; tes otomatis sekarang mencakupnya. |
| A5 | `docs/TOKEN_AUDIT.md` | 3 KB | Angka token versi 1.1.0, basi. Angka terkini: `node tests/token_audit.cjs`. Tidak dirujuk. |
| A6 | `docs/examples/` | — | Folder kosong. |
| A7 | `tools/__pycache__/` | — | Cache Python (sudah di `.gitignore`). |
| A8 | `tests/preview/render_b4.py`, `render_b5.py`, `render_b53.py`, `make_sample_v110.cjs`, `make_sample_v130.cjs` | ~20 KB | Skrip screenshot sekali-pakai untuk batch lama. **File `sample_*.json` tetap** (dipakai `smoke_all_panels.py` dan dua tes). `render_ui.py`, `render_bar.py`, `preview_v180.cjs`, `mock_th.js` tetap (alat preview umum). |
| A9 | `source_original/eldrasil_v37_Core.json`, `eldrasil_v37_NPC_Detailed.json` | 685 KB | Lorebook v37, sudah digantikan v38; tidak dibaca tool mana pun. `[?]` karena ini lorebook asli owner. |
| A10 | `docs/system_state.txt` | 468 KB | Dump state dari playtest Year 1/2, bukti untuk rencana Batch 1–5 yang sudah selesai. `[?]` |

## B. Gabung

**B1. `PROGRESS.md` → `CHANGELOG.md`.** Isinya memang changelog per versi (167 KB). Rename, lalu:
- Paragraf riwayat versi raksasa di awal `HANDOFF.md` (baris 3–25, ~12 KB, v1.0.3 s/d v1.9.6 dalam satu paragraf) **dipindah ke
  CHANGELOG** (isinya sudah ada di sana; dicek dulu tidak ada yang hilang), dan HANDOFF cukup berisi snapshot singkat: versi saat
  ini, status tes, tugas berikutnya, dan tautan ke CHANGELOG.
- Rujukan "PROGRESS" di `CLAUDE.md`, `README.md`, `HANDOFF.md` diubah ke CHANGELOG. Rujukan lama di dalam DRAFT (catatan historis)
  dibiarkan. Tidak ada kode yang membaca file ini.
- HANDOFF §8 "Open items (also in PROGRESS.md)" tetap di HANDOFF.

**B2. Checklist ST → satu `docs/TEST_CHECKLIST.md`.** Gabung `v1.6`, `v1.8`, `v1.9.1`–`v1.9.5` (7 file) menjadi satu file:
bagian "Belum dicek" di atas (v1.9.x, playtest Year 1/2 dari rencana batch), lalu per versi. Checklist baru berikutnya ditambahkan ke
file ini, bukan file baru. Rujukan diubah di HANDOFF/CHANGELOG/README.

**B3. `docs/VECTFOX.md` + `docs/ECOSYSTEM.md` → `docs/ECOSYSTEM.md`.** VECTFOX.md (5 KB) adalah satu bagian dari ekosistem
card + preset + VectFox; jadikan satu bagian di ECOSYSTEM.md. `docs/vectfox_cleaning_patterns.json` tetap (file impor).
Ikut ubah: teks `src/card/card.json` (menyebut `docs/VECTFOX.md`), `docs/PLAYER_GUIDE.md`, lalu rebuild card.

**B4. Dokumen desain historis → `docs/archive/`.** Pindahkan `ELDRASIL_MVU_PLAN.md` (rencana awal v1.1) dan
`docs/archive/SPEC_v1_1_0_world_systems.md` ke `docs/archive/`. Keduanya hanya catatan sejarah (SPEC hanya disebut di komentar
`test_world_v110.cjs`; komentarnya diperbarui). Root repo jadi hanya berisi README, CLAUDE, HANDOFF, CHANGELOG.

**B5. `README.md` diperbarui** (masih menulis "Current release 1.8.0"): versi saat ini, cara unduh card/preset dari `dist/`
dan `presets/`, struktur folder baru (setelah A/B), perintah build dan tes. Ringkas; detail tetap di HANDOFF.

**B6. `CLAUDE.md` dirapikan.** Bagian "The task (handed over 2026-09-26)" dan instruksi tes per rilis sudah historis (catatan
owner 2026-09-27 sudah menggantikannya). Sisakan: urutan baca (HANDOFF → CHANGELOG → rencana aktif), aturan owner, environment.
Perbarui juga: `python3` → di Windows ini `python`; "commit" → repo lokal ini bukan git.

## C. Tetap (sengaja tidak disentuh)

`src/`, `data/`, `tools/` (termasuk `animeface.xml` untuk `process_assets.py`), `build/`, `tests/` (selain A8), `dist/`
(card, TEST cards, `lorebook_v39/` yang dibaca 4 tes dan diimpor owner), `presets/` (termasuk `original/`),
`source_original/` v38 + `npc_lore_*`, `docs/PLAYER_GUIDE.md`, `docs/design/`, `docs/rentry/`, `planning/FUTURE_PLANS.md`,
`package.json`, `.gitattributes`, `.gitignore`.

**`planning/DRAFT_*.md` (28 file) tetap di tempat** kecuali owner memilih opsi di `[?] 3`: 15 tes, `merge_lorebooks.py` dan
`edit_preset.py` membaca teks yang disetujui langsung dari draft-draft ini.

## Perkiraan hasil

- Ukuran: ~135 MB → ~40 MB (kebanyakan dari zip; sisanya `dist/` 31 MB yang memang harus ada).
- Root: 9 file + 6 zip → 4 file markdown + `package.json`.
- `docs/`: 21 file lepas → PLAYER_GUIDE, ECOSYSTEM, TEST_CHECKLIST, vectfox_cleaning_patterns + folder design/, rentry/, npc_brainstorm/, archive/.
- `planning/`: 39 → 29 file.

## [?] Keputusan untuk owner

1. **A9: lorebook v37** (`source_original/eldrasil_v37_*.json`): hapus, atau simpan sebagai arsip? Saran: hapus (v38 sudah menggantikannya).
2. **A10: `docs/system_state.txt`**: hapus, atau simpan sampai checklist ST Batch 1–5 selesai? Saran: simpan sampai playtest selesai.
3. **Draft yang sudah disetujui**: biarkan 28 DRAFT di `planning/` (aman, tidak ada perubahan kode), atau pindahkan ke
   `planning/approved/` dan ubah path di 2 tool + 15 tes supaya `planning/` hanya berisi rencana aktif? Saran: biarkan dulu.
4. **`docs/npc_brainstorm/`** (hasil generate `make_npc_brief.py`, 7 file) vs `planning/NPC_BRAINSTORM_BRIEF.md` (dirawat tangan,
   isinya beda): simpan keduanya, atau hapus hasil generate dan buat ulang hanya saat dibutuhkan? Saran: hapus hasil generate
   (bisa dibuat ulang kapan saja dengan satu perintah).
