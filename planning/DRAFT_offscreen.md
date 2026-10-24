# DRAFT — Kejadian off-screen (roadmap M1 + M2, rilis 2.3.0)

Dicatat: 2026-10-24, langsung sesudah rilis 2.2.4 (owner: "setiap selesai proceed langsung sekalian buat tabel untuk ditinjau").
Rencana asal: `planning/FUTURE_PLANS.md` §0.1 M1 + M2, termasuk catatan cek tabrakannya.

**Status:** menunggu "proceed" owner.

## 0. Tujuan, singkat

NPC punya hari mereka sendiri, dan kadang ada sesuatu yang terjadi: latihan tambahan, cekcok dengan rival, surat dari rumah, nilai
tugas, membeli sesuatu. Saat NPC itu muncul lagi di adegan, narator tahu (Cast Sheet), dan pemain bisa melihatnya di Campus now.
Engine yang memilih kejadiannya dari tabel; narator tidak mengarang kejadian.

## 1. Aturan

- **Kapan:** sekali per hari kampanye, saat hari berganti. Engine mengundi kejadian **kemarin** (seeded per chat dan hari). Kalau
  waktu melompat beberapa hari, hanya hari terakhir yang diundi.
- **Siapa:**
  - 3–5 NPC per hari (`count` [3, 5]), dipilih dari NPC yang punya bond dengan {{user}};
  - tidak sedang tidak ada di Halvard (lulus, belum datang, pulang libur);
  - tidak bersama {{user}} hampir seharian kemarin;
  - tidak mendapat kejadian dalam 5 hari terakhir (`gap`).
- **Apa:** satu baris dari tabel (§2), disaring oleh:
  - kategori Tension NPC itu (`tension.json`: withdrawn, social, confrontational, authority, dangerous), untuk kejadian yang menyangkut
    konflik, supaya NPC bertindak sesuai karakter;
  - data yang dibutuhkan baris itu: `{club}` (klubnya), `{rival}` / `{friend}` (relasi rivals / friends yang dilihat Connections),
    `{thing}` (yang ia suka, `gift_prefs.json`), `{place}` (tempat dari baris routine yang ia jalani kemarin, else haunt-nya);
  - siapa dia: murid (`student`), staf (`staff`), atau keduanya;
  - "surat dari rumah" tidak untuk yang tidak punya rumah untuk dipulangi (`breaks.stay`: Etnie, Dante, Lenna, Castor, Tilly, Vesna);
  - template yang sama tidak terulang untuk NPC itu dalam 10 kejadiannya yang terakhir (dihitung ulang dari seed, tanpa state).
- **Ke mana:**
  - Satu baris di `$Recent` NPC itu, dengan label **"(Own time)"**. Beda dari "(Off-screen)", yang dipakai untuk rencana `Next` yang
    ia ceritakan sendiri.
  - **Paling banyak satu** baris "(Own time)" per NPC: yang baru menggantikan yang lama, supaya momen bersama {{user}} (10 disimpan,
    3 terbaru ditulis) tidak terdorong keluar.
  - Tampil di Cast Sheet saat NPC itu hadir (±15 token per baris, hanya saat hadir), dengan umur dalam kata ("yesterday", "3 days ago").
- **Yang tidak berubah:** bond, Trust, Tension, reputasi. Kabar ke teman memakai "Word gets around" yang sudah ada, hanya untuk
  momen bersama {{user}}; kejadian off-screen tidak menyebar sendiri.
- **Tidak menyentuh rahasia:**
  - tanpa `<narrator_only>`, tanpa Morning Choir;
  - tanpa nama NPC lain selain `{rival}` / `{friend}` dari relasi yang terlihat;
  - tanpa {{user}}.
- **M2, Campus now:** untuk NPC yang dekat (Rank 3+), kejadian 2 hari terakhir ditambahkan dalam kurung, misalnya
  "Gareth : a booked ring - Combat Grounds (yesterday: had words with Florian)". Hanya UI.
- **Meanwhile (Rank 7+, mingguan):** memakai kejadian "(Own time)" terakhir kalau ada, supaya Journal dan Cast Sheet tidak bercerita
  dua versi.
- **Toggle Features baru `offscreen`** ("Own time"): bisa dimatikan.
- **Biaya:** 0 token saat NPC tidak hadir; ±15 token per NPC hadir yang punya kejadian.

## 2. Tabel kejadian (teks kartu, English)

Ditulis sesudah nama NPC, bentuk lampau, satu kalimat pendek. Kolom "untuk": `all` = semua kategori Tension, atau daftar kategorinya.

| id | untuk | siapa | butuh | teks |
|---|---|---|---|---|
| extra_practice | all | all | place | put in an extra hour of practice at {place} |
| good_club_day | all | student | club | had a good day at the {club} |
| bad_club_day | social, confrontational, withdrawn | student | club | had a bad session at the {club} and is still annoyed about it |
| words_with_rival | confrontational, social, dangerous | all | rival | had words with {rival} at {place} |
| lost_bet_rival | social, confrontational | student | rival | lost a small bet to {rival} |
| beat_rival | confrontational, social, dangerous | all | rival | beat {rival} at something small and has not stopped mentioning it |
| avoided_rival | withdrawn, authority | all | rival | kept out of {rival}'s way all day |
| evening_friend | all | all | friend | spent the evening with {friend} |
| helped_friend | social, withdrawn, authority | all | friend | helped {friend} with an assignment |
| letter_home | all | student | home | got a letter from home |
| parcel_home | social, withdrawn | student | home | got a parcel from home |
| marks_good | all | student | | got a marked assignment back and was pleased |
| marks_bad | all | student | | got a marked assignment back and is not talking about it |
| bought_thing | all | all | thing | bought {thing} and is pleased with it |
| bargain_thing | social, withdrawn | all | thing | found {thing} cheaper than expected at the Mall |
| lost_small | all | all | | lost something small and spent an hour looking for it |
| slept_badly | all | all | | slept badly |
| late_class | social, confrontational, dangerous | student | | turned up late to a class |
| told_off | confrontational, social, dangerous | student | | was told off by a teacher for something minor |
| new_spell | all | student | | tried a new spell and it mostly worked |
| skirmish | confrontational, dangerous | student | place | got into a quick skirmish at {place} and walked away grinning |
| watched_duel | all | student | | watched a duel at the Combat Grounds |
| asleep_library | withdrawn, social | student | | fell asleep in the Main Library |
| longer_place | all | all | place | spent longer than planned at {place} |
| quiet_day | all | all | | had a quiet day |
| staff_meeting | authority, social | staff | | sat through a long staff meeting |
| marking | all | staff | | marked a stack of papers late into the night |
| minor_problem | authority | staff | place | dealt with a minor problem at {place} |
| good_class | all | staff | | had a class that went better than expected |
| loved_weather | all | all | wx | made the most of the {wx} |

**Catatan isi:**
- **`skirmish`** mengikuti 2.1.2 (sihir kasual): skirmish kecil tanpa izin. Hanya untuk kategori confrontational / dangerous.
- **`loved_weather`** hanya kalau cuaca kemarin termasuk yang ia suka (`npc_moods.json` `loves`), dan hanya dengan Weather effects
  Full.
- **"Staff"** = grup Staff, Doves, Cathedral, Facilities, Liaison.
  - `marking` dan `good_class` hanya untuk yang mengajar (`teach`).
  - `staff_meeting` tidak untuk Doves, Tristan dan Caine (bukan staf akademi).

## 3. Kode (ringkas)

- **Data:** `data/offscreen.json`: `count`, `gap`, `items` (id, `for`, `who`, `needs`, `text`).
- **Engine:** `stepOffscreen` sesudah `stepBondMemory`: undi kemarin, isi template, tulis/ganti satu baris `$Recent` "(Own time)".
  `$eng.offday` = hari terakhir yang diproses (state engine, tanpa migrasi). `stepBondMemory` Meanwhile membaca baris itu.
- **Tanpa state baru di story:** cukup baris `$Recent` yang sudah ada.
- **Cast Sheet:** baris `$Recent` yang sudah ada (sheet `cRecent`), labelnya ditampilkan apa adanya.
- **Campus now:** `campusFeed` menambahkan "(yesterday: …)" untuk yang dekat.
- **Tes:**
  - undian seeded (swipe sama);
  - 3–5 per hari;
  - jeda 5 hari;
  - filter kategori dan data;
  - tidak ada surat untuk yang tidak punya rumah;
  - satu baris "(Own time)" per NPC;
  - momen bersama {{user}} tetap;
  - Campus now dan Meanwhile;
  - toggle off;
  - `test_saves`;
  - quick check relevan (aturan testing biasa).

## 4. Keputusan yang tersentuh

- Tidak ada keputusan di DECISIONS yang berubah. Baris baru di DECISIONS: "Own time: the engine draws small off-screen happenings from
  data; one line per NPC in Recent; no bond, Trust, Tension or reputation change".
- Prinsip "NPC bereaksi sesuai karakter": kejadian konflik disaring kategori Tension; sisanya netral.

## 5. Pertanyaan terbuka

- [?] 1. **Label "(Own time)"** untuk baris di Recent dan Cast Sheet. Alternatif: "(On their own)". Diam = "(Own time)".
