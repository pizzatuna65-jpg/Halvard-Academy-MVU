# DRAFT — Routine 2.0, tahap akhir: baris perkembangan dan semua tes (rilis 2.2.4)

Dicatat: 2026-10-24, langsung sesudah rilis 2.2.3 (owner: "setiap selesai proceed langsung sekalian buat tabel untuk ditinjau").
Rencana asal: FUTURE_PLANS §0.1 B1 "2.2.4".

**Status:** menunggu "proceed" owner. Ini juga rilis tempat **semua tes** dijalankan (owner: "lakukan nanti di akhir di 2.2.4").

## 1. Syarat baru (kode)

Hanya syarat yang punya isi dari lore:

- **`ev`:** baris hanya berlaku di hari event kalender itu (id `calendar.json`). Diambil lebih dulu dari baris biasa; total tetap
  maksimal 90.
- **`exam`:** hari ujian (W1 Senin–Kamis bulan ujian) dan 7 hari sebelumnya. Juga diambil lebih dulu.
- **`since`:** sejak tahun kampanye (`"Y3"`); `until` sama polanya.

Yang **tidak** dibuat, karena tidak ada isi dari lore:
- `mood`: mood sudah mengubah cara NPC bicara, dan lore tidak menyebut kebiasaan yang berubah karena mood.
- `after` (Secrets_revealed, Lore change).

Keduanya dicatat di FUTURE_PLANS kalau nanti ada kebutuhan.

Validator: baris `ev` dan `exam` dicek sendiri (≤ 90); pair harus punya syarat yang sama persis di kedua NPC, supaya keduanya selalu
diundi bersama.

## 2. Baris perkembangan (teks kartu, English)

### 2a. Trixie dan sirkus (`ev: circus`, Month 8 W2 Kamis sore sampai Minggu)

Lore Trixie: "In Month 8, wherever the circus has pitched its tents, every waking minute". Lore sirkus: tenda besar di Main Courtyard.

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Thu-Sun | 18:00–20:00 | Courtyards | the circus tent, every waking minute | habit | 80 | hari event: circus |
| Fri-Sun | 12:00–13:00 | Courtyards | the circus tent, every waking minute | habit | 80 | hari event: circus |
| Fri-Sun | 16:00–18:00 | Courtyards | the circus tent, every waking minute | habit | 80 | hari event: circus |
| Sat-Sun | 13:00–16:00 | Courtyards | the circus tent, every waking minute | habit | 80 | hari event: circus |
| Sun | 10:00–12:00 | Courtyards | the circus tent, every waking minute | habit | 80 | hari event: circus |

Kelas dan klub tetap menang (`busy`), seperti biasa.

### 2b. Minggu ujian (`exam`)

Hanya NPC yang memang rajin menurut lore-nya, supaya NPC bertindak sesuai karakter (Bruno, Sophia, Trixie, Percival, Aiden tidak):
Alyssa, Zara, Castor, Vera, Idris, Royhan, Hadrian, Maple, Wren. Masing-masing mendapat tiga baris yang sama:

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 16:00–18:00 | Main Library / Study Rooms | revising for the exams | errand | 40 | minggu ujian dan seminggu sebelumnya |
| Mon-Fri | 18:00–20:00 | Main Library / Study Rooms | revising for the exams | errand | 40 | minggu ujian dan seminggu sebelumnya |
| Sun | 13:00–16:00 | Main Library / Study Rooms | revising for the exams | errand | 40 | minggu ujian dan seminggu sebelumnya |

Dua baris staf dari lore:

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Mon-Fri | 16:00–18:00 | Main Library / Study Rooms / Courtyards | watching exam-week students for signs of exhaustion | errand | 40 | minggu ujian dan seminggu sebelumnya (Baelin) |
| Mon-Fri | 18:00–20:00 | Nightwell | steering exam-week students to ordinary coffee over Nightwell's Vigil | habit | 30 | minggu ujian dan seminggu sebelumnya (Yvette) |

### 2c. Pasangan lintas angkatan (`since`)

Lore Faye: "Tsubaki Hoshikage gets lost on the Hills every week; Faye finds her and walks her back". Faye baru datang di Year 3, jadi
baris ini berlaku sejak Year 3.

| hari | jam | tempat | kegiatan (English) | jenis | bobot | syarat |
|---|---|---|---|---|---|---|
| Sun | 13:00–16:00 | Grassy Field and Hills | walking Tsubaki back from the Hills, again | habit | 20 | cuaca baik, bersama Tsubaki, sejak Year 3 (Faye) |
| Sun | 13:00–16:00 | Grassy Field and Hills | being walked back from the Hills by Faye, again | habit | 20 | cuaca baik, bersama Faye, sejak Year 3 (Tsubaki) |

Faye Minggu 13:00–14:00 jadi 70 + 20 = 90; Tsubaki Minggu 13:00–16:00 jadi 50 + 20 = 70.

**Tidak dibuat:**
- Tsubaki dan Bruno, Linus dan William, Rigel dan Wren: bobot atau tempatnya tidak muat tanpa memotong baris yang sudah disetujui.
- Ruby dan Caralynn (Music Club): Ruby lulus sesudah Year 1, dan sesudah itu latihan Caralynn akan turun tanpa baris pengganti.

## 3. Peringatan keramaian (validator, kode)

Saat build, untuk setiap tempat dan blok: jumlah perkiraan orang yang ditemui dari routine (bobot × peluang bertemu) dibandingkan
dengan target keramaian ambience. Kalau jauh di atas target, build mencetak peringatan (bukan gagal), supaya tempat sepi tetap sepi.

## 4. Semua tes (owner)

**Suite baru `test_routine2_v2224.cjs`:**
- tarikan per blok seeded (swipe sama), bobot dan free ≥ 10;
- `wx` (termasuk baris yang tetap di luar saat badai), `pair` (keduanya datang bersama; dilewati saat pasangannya lulus, sakit
  atau punya status), `ev`, `exam`, `since`;
- baris lama dipotong per blok;
- lapis pertemuan: tidak pernah 100% di tempat luas, pasti di kelas, Study Hall dan Council;
- Look for mengikuti Who is here, maksimal 90%;
- pelintas di perjalanan (20%, 15 menit pertama, dari ruang kelas);
- Campus now (errand, free, on the way);
- persen kunjungan kosong per keramaian 0–4 dibanding 2.1.2 (target keramaian 0 tetap sekitar 80% kosong);
- momen uncanny `alone` tidak turun jauh;
- Map "Usually here" dan dossier Routine hanya baris utama.

**Suite lama yang diperbarui** (routine tidak lagi pasti, roll per blok):
- `test_presence_roll_v19911`;
- `test_look_for_v19912`;
- `test_campus_now_v2100` ("Look for finds them there every time" jadi "peluang tinggi");
- `test_feature_batch4_v1520`;
- `tests/fixtures/presence_*`;
- suite lain yang membaca Who is here, Map, dossier atau Meanwhile, sejauh full suite menunjukkannya.

**Lalu:**
- `npm test` (semua suite);
- `npm run stress`;
- eslint;
- `test_saves` (fixture 2.1.2 sampai 2.2.3).

Setiap kegagalan saya laporkan: sebabnya, dan apakah itu cacat (diperbaiki) atau tes yang memang harus mengikuti perilaku baru
(disesuaikan, dengan alasan).
