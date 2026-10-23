# Baseline memori — Eldrasil / Halvard Academy (v1.61.1)

Tanggal: 2026-10-05 · Batch 2 dari `audit/AUDIT_2026-10-05_1_sistem_memori.md` §6 (M13). Angka "sebelum" untuk batch 3–8: setiap batch
memori berikutnya mengulang perintah di bawah dan membandingkan.

## Cara mengulang

```
python tools/audit_chat.py "<chat.jsonl>" --memory --no-drift --out laporan.md
python tools/audit_chat.py "<chat.jsonl>" --no-drift --vectfox "<ekspor VectFox>.json" --out vectfox.md
node tests/stress/memory_soak.cjs 3000
node tests/stress/memory_soak.cjs 10000
```

## 1. Soak test (sintetis, 12 bond, laju tulis lebih cepat dari owner kecuali Known_facts)

| Update | State maks | 501 maks (token) | Journal: tulis / keluar / arsip / hilang | Knows | Known_facts | Clues | Extras (dipotong jadi catatan pendek) |
|---|---|---|---|---|---|---|---|
| 3.000 | 131 KB | 4.176 | 245 / 222 / 222 / 102 | 522 / 342 / 342 / 102 | 1.734 / 1.615 / 1.615 / 1.375 | 209 / 168 / 168 / 49 | 167 / 147 / 147 / 0 (85) |
| 10.000 | 148 KB | 5.434 | 796 / 792 / 792 / 672 | 1.713 / 1.533 / 1.533 / 1.293 | 5.772 / 5.655 / 5.655 / 5.415 | 722 / 677 / 677 / 562 | 613 / 593 / 593 / 330 (471) |

- Invarian 1.61.0 bertahan di kedua run: tidak ada clue misteri terbuka yang keluar selama masih ada clue misteri selesai/dingin;
  semua yang keluar dari pandangan narator masuk arsip.
- **Yang hilang untuk selamanya** hanya dari arsip yang penuh (Journal 120, `$Knows_old` 20, `$Known_old` 20, arsip Clues 120,
  catatan pendek Extras 120). Known_facts paling boros: 94% dari yang ditulis akhirnya hilang di 10.000 update. Ini sasaran
  batch 3 (pin) dan batch 4 (lipatan: "tidak ada yang dihapus sebelum dilipat").
- Hooks tetap 15 (batas), yang tertua 11 hari: penuaan Hooks bekerja.
- 501 di soak ini 4–5,4 ribu token dengan 12 bond; state matang di audit (45 bond, Known_facts penuh) ±10 ribu. Anggaran soak:
  state 200 KB, 501 8.000 token (`tests/stress/memory_soak.cjs` `BUDGET`).

## 2. Chat owner (1.34.2, 36 balasan, M1 W1), di-replay dengan engine 1.61.1

| List | Narrator wrote | Left the view | Kept (archive) | Lost for good | Removed by the story | Written per 100 replies |
|---|---|---|---|---|---|---|
| Journal | 1 | 0 | 0 | 0 | 0 | 2.8 |
| Knows | 1 | 0 | 0 | 0 | 0 | 2.8 |
| Known_facts | 13 | 0 | 0 | 0 | 0 | 36.1 |
| Clues | 0 | 0 | 0 | 0 | 0 | 0.0 |
| Extras | 0 | 0 | 0 | 0 | 0 | 0.0 |

Clues of an open mystery that left the view: **0** (should be 0 while a solved or cold one is on record).

| At the end | Value |
|---|---|
| Journal / its archive | 2 / 0 |
| Knows / older (most in one bond) | 1 / 0 |
| Known_facts / older (most in one bond) | 6 / 0 |
| Clues / archived | 0 / 0 |
| Extras / archived / short records | 0 / 0 / 0 |
| Bonds | 5 |

Open Hooks: 0.

`<current_state>` (501): 655 tokens at the start, 992 at the end, 1137 at most.

| msg | 4 | 10 | 16 | 22 | 28 | 34 | 40 | 46 | 52 | 58 | 64 | 70 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tokens | 688 | 735 | 735 | 729 | 751 | 670 | 872 | 885 | 884 | 889 | 906 | 992 |

State (`stat_data`): 7,871 bytes at the start, 20,110 at the end, 20,110 at most; MVU stores about 20 KB per floor that keeps variables (×1.0 for its display and delta copies). Text: about 4.8 KB per message (swipes and reasoning included).

| Messages | Text | Kept floors (MVU default: latest 20 + every 50th) | Total | Without MVU cleanup |
|---|---|---|---|---|
| 5,000 | 24 MB | 2 MB | 26 MB | 125 MB |
| 20,000 | 96 MB | 8 MB | 104 MB | 500 MB |
| 50,000 | 240 MB | 21 MB | 260 MB | 1,250 MB |

The projection uses the state as it is now; a longer campaign has a bigger state, so read it as a lower bound.

- Laju tulis owner per 100 balasan: Journal 2,8, Knows 2,8, Known_facts 36,1. Belum ada yang keluar dari jendela mana pun.
- Proyeksi file: teks chat sendiri yang paling besar (±4,8 KB per pesan). Dengan cleanup MVU default, 20.000 pesan ≈ 104 MB
  dengan state M1; state yang matang (±150–200 KB) menambah ±60–90 MB. Tanpa cleanup: ratusan MB sampai GB.

## 3. Ekspor VectFox owner (chat lama sebelum MVU, prompt default VectFox)

97 events.

| Check | Value |
|---|---|
| Ghost events (a source message deleted or edited) | 0 |
| Dates without a campaign year / without a date | 0 / 0 |
| Windows with events / events per window (avg, max) | 59 / 1.64, 2 |
| Importance (count per value) | 3: 22, 4: 37, 5: 20, 6: 12, 7: 5, 8: 1 |
| Importance 6+ (turning points) | 18 |
| should_persist true | 97 |
| Near-duplicate pairs (same type, same people, half the words) | 0 |
| Types (most common) | dialogue_significant 15, location_change 13, side_quest_update 10, travel 8, other 8, revelation 8, discovery 8, promise_or_oath 6 |

- Tidak ada event hantu: hash VectFox (`_djb2` atas "nama:pesan", 3623dc8) cocok dengan setiap pesan sumber di chat.
- Tanggal ekspor ini berformat lama ("Month 1, Week 1, …, Year 342"), jadi dihitung bertahun. Ekspor dari chat 1.61.0 ke atas
  semestinya `Y1 …` (pola pembersih baru).
- Prompt default VectFox: semua event `should_persist` true dan 21 dari 97 bertipe travel/location_change; prompt kartu (1.57.0)
  menurunkan keduanya. Event importance 6+ di ekspor berikutnya menunjukkan apakah baris `[Turning point]` (1.61.0) bekerja.

## 4. Sesudah batch 3–4 (v1.63.0), soak 10.000 update

| | Batch 2 (1.61.1) | Batch 4 (1.63.0) |
|---|---|---|
| Hilang sebelum dilipat: Journal / Knows / Known_facts | 672 / 1.293 / 5.415 | **0 / 0 / 0** (dilipat: 800 / 1.678 / 7.113) |
| State maks | 148 KB | 163 KB |
| 501 maks | 5.434 token | 7.401 token (Chronicle 22 entri: L2 11, L1 11; 20 baris pin) |

Soak menulis Journal ±3× lebih cepat dari owner dan menjawab 80% permintaan lipatan (sisanya lipatan polos dari engine).

## 5. Sesudah batch 5–6 (v1.65.0)

| | 1.63.0 / 1.64.0 | 1.65.0 |
|---|---|---|
| 501 state matang (40 clue di 6 thread, 20 Extras, 15 NPC_status, 14 New_relations, 30 rahasia, 2 tokoh hadir) | 6.451 token | **4.173** (−35%) |
| Soak 10.000 update: 501 maks | 7.401 | 6.978 (soak tidak menulis status, relasi, rahasia) |
| Soak 10.000 update: state maks | 163 KB (1.63.0) | 172 KB (arsip Journal 240, batch 5) |
