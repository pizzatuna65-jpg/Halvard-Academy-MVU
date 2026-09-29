# DRAFT — Audit lorebook card (2026-09-28, card 1.9.6)

Status: **selesai di card 1.9.7 (2026-09-28).** Owner: "semua keputusan iya approve" (Timetable tetap constant). Koreksi: baris "last spring" ada di lore Etnie (uid 100), bukan Irene.

Cakupan: 281 entry di card. 13 entry constant (selalu terkirim): 0 World Index, 97 NPC Roster, 131 Timetable, 132 Campus Map,
134 Calendar, 501 current_state, 502 update rules, 503 output format, 504 campus rules, 505 Now, 508 birthday (hanya di hari H),
509 Cast Sheet (hanya tokoh yang hadir), 510 cast gate. Sisanya keyword (lokasi 64, event 18, brand 8, kelas 7, NPC, mitos, dll.).

Cara cek: isi entry constant dibaca penuh; tanggal di semua entry event dibandingkan dengan kalender engine (`EVENTS`);
aturan 502–510 dicari sisa mekanik yang sudah dihapus (event rank-up 1.9.0, meter Public/Dorm, Progress bond, isi mana saat
tidur); kata musim dicari di seluruh lore setelah tabel musim baru (1.9.4).

## Hasil singkat

- **Rules custom 502–510 bersih.** Tidak ada sisa mekanik lama; mana, `/Exposure`, `/Consumables`, dan Magic Duelling Club sudah terbaru.
- **NPC Roster (97) terbaru.** Sudah sadar tahun kampanye (cohort Year 2 muncul di Year 2, lulusan pindah ke "Graduated"),
  Etnie "repeating" di Year 2 sesuai canon (tahun ketiga lagi), pimpinan Council dinamis, aturan pagi Entrance (Batch 2) ada.
- **Campus Map (132), Timetable (131), Calendar (134)** cocok dengan engine (kalender, jam malam per event, timetable, klub).
- **World Index (0) punya 2 kesalahan nyata** dan beberapa baris lemah (di bawah).

## A. Usang: perbaiki langsung (bukan canon baru; menyelaraskan dengan keputusan yang sudah disetujui)

| # | Entry | Masalah | Usulan |
|---|---|---|---|
| A1 | 0 World Index, "ALWAYS TRUE" | `{{user}} is a first-year at Halvard.` Salah sejak Year 2 (engine menaikkan tahun {{user}}; deskripsi card dan `<now>` sudah benar). Entry ini berlabel "Never contradict this", jadi di Year 2 ia melawan state. | Jadikan EJS: `{{user}} is a Year <Player.Profile.Year> student at Halvard (a first-year when the story began).` |
| A2 | 0 World Index, "EXISTS" | `Competitions: … World M12W4.` Sejak 1.0.3 (disetujui owner) World Competition ada di **M11 W4 Wed–Sat**; M12 murni libur. | `World M11W4 (abroad).` |
| A3 | 18 Academic Structure | `Month 12 is a full holiday … while four students compete abroad in Week 4.` Sama dengan A2. | `Month 12 is a full holiday for the whole kingdom; the World Competition abroad is in Month 11 Week 4, before Graduation.` |
| A4 | `card.json` creator_notes | Masih menulis "MVU card v1.4.6". | Hapus nomor versi dari teks (versi sudah ada di `character_version`). |

Semua diedit di sumbernya: A1–A3 lewat koreksi di `tools/merge_lorebooks.py` (juga ikut ke ekspor standalone `dist/lorebook_v39/`),
A4 di `src/card/card.json`.

## B. Tambahan kecil yang disarankan

| # | Entry | Usulan | Alasan |
|---|---|---|---|
| B1 | 0 World Index | Baris baru: `Seasons: M1-3 spring, M4-6 summer, M7-9 autumn, M10-12 winter.` (~20 token) | Kalau Weather di-Off, `World._Season` kosong dan narator tidak punya info musim sama sekali; tanpa ini ia bisa menebak musim lama (M1 = musim dingin). |
| B2 | 0 World Index | Baris `Combat role.` (menggantung, tanpa isi) → `Combat roles: attack, defense, healing, support, control.` | Isinya sudah canon di entry 19 Competitions. |
| B3 | tests | Tes baru: kalender entry 134 dan tanggal di World Index cocok dengan `EVENTS` engine. | Keduanya ditulis tangan terpisah; A2/A3 lolos sejak 1.0.3 karena tidak ada tes yang membandingkan. |

## C. Redundan dengan engine? (tidak ada yang perlu dihapus)

- **134 Calendar (650 token, constant):** engine hanya memberi acara *hari ini* (`_Event_today`); entry ini memberi bulan ini +
  bulan depan untuk foreshadowing dan obrolan NPC. **Tetap.**
- **131 Timetable (312 token, constant):** engine sudah memberi kelas *saat ini* di `<now>`; entry ini memberi jadwal mingguan
  plus aturan (Creature Studies di Menagerie/Forest, praktik DMD oleh Doves). Bisa diubah jadi keyword (hemat ~312 token/pesan). `[?] 2`
- **20 Point System, 19 Competitions, 12 Dorms, entry Rhythm:** keyword-only, isinya lore (cara dunia bekerja), angkanya cocok
  dengan engine (payout 300–3,000, hadiah Kingdom 5,000). **Tetap.**
- **Entry NPC (keyword):** saat tokoh hadir, Cast Sheet (509) yang dipakai dan entry keyword-nya kosong; entry ini tetap perlu untuk
  tokoh yang hanya disebut. **Tetap.**

## D. Canon yang bergeser karena tabel musim baru (keputusan owner)

Sejak 1.9.4 M10–12 = musim dingin. Entry ini tidak salah secara tanggal, tetapi nuansanya kini janggal:
- **245 Harvest Festival (M10 W4)** jatuh di awal musim dingin (panen biasanya musim gugur).
- **247 Academy Trip ke Sunreach Bay (M11 W3)**: hotel tepi pantai di musim dingin.
- **100 Irene**: "The year she entered with graduated **last spring**", padahal Graduation M11 (musim dingin; di tabel lama pun musim gugur, bukan semi).

## E. Kosmetik (opsional)

- 0 World Index, baris terakhir: `Ring dining hall is feast location restricted only for feast after big academy event never open for regular daily use.`
  → `The Ring Dining Hall opens only for feasts after major academy events, never for daily meals.` (arti sama, bahasa rapi)

## [?] Keputusan owner

1. **A1–A4, B1–B3, E**: terapkan semua? (saran: ya; bukan canon baru)
2. **131 Timetable**: tetap constant (aman, narator selalu tahu jadwal minggu ini) atau jadi keyword (hemat ~312 token/pesan,
   tapi jadwal hanya muncul saat kata "class/timetable/lesson" disebut)? Saran: tetap constant.
3. **D (musim)**, per item:
   - Harvest Festival: biarkan di M10 dan ubah jadi festival akhir panen/awal musim dingin, atau pindah bulan? Saran: biarkan tanggalnya, tambah satu kalimat "the last harvest before winter".
   - Sunreach Bay: biarkan, dengan satu kalimat bahwa Sunreach Bay hangat sepanjang tahun (resor di selatan)? Saran: ya.
   - Irene "last spring" → "last year"? Saran: ya.
