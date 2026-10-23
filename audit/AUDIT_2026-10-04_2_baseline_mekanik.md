# Baseline Mekanik Narator — Eldrasil / Halvard Academy (v1.53.1)

Tanggal: 2026-10-04 · Batch 2 dari `audit/AUDIT_2026-10-04_1_beban_narator.md` §6 (U10). Alat: `tools/audit_chat.py --mechanics`
(statistik blok) dan `tools/replay_chat.cjs` (semua blok dijalankan ulang lewat engine **1.53.1**, lalu koreksi engine dihitung).
Laporan ini adalah angka "sebelum diet". Batch 3–8 diukur ulang dengan alat yang sama pada chat baru.

## Data

| Chat (ekspor owner, `Downloads/stardew`) | Aturan saat dimainkan | Blok update | Isi |
|---|---|---|---|
| A: `2026-09-30@03h35m13s428ms` | 1.30.0 | 13 | M1 W1 Mon pagi, keliling kampus di hujan dingin, Entrance |
| B: `2026-10-01@21h01m33s056ms imported` | 1.34.2 | 36 | M1 W1 Mon pagi sampai 10:10, Entrance (versi mentah, bukan "fixed") |

- Chat `2026-09-30@17h51m32s086ms` adalah awal chat B (pesan yang sama), jadi tidak dihitung dua kali.
- Kedua chat hanya mencakup hari pertama. Situasi berat (ujian, kompetisi, surat, proyek, belanja, pakta, bond Rank 4+) belum muncul,
  jadi baseline ini mengukur adegan ringan. Angka untuk adegan berat harus menunggu chat yang lebih panjang.
- Prompt yang dibaca narator saat itu (aturan 1.30–1.34) tidak tersimpan di ekspor. Yang diukur adalah perilaku tulis narator dan
  koreksi engine sekarang terhadap blok itu.

## Hasil (49 blok)

| Ukuran | A (13) | B (36) | Gabungan |
|---|---|---|---|
| operasi per blok | rata-rata 5,4, maks 10 | 3,5, maks 8 | 4,0, maks 10 |
| baris blok | 20,6, maks 47 | 16,6, maks 37 | 17,6, maks 47 |
| ukuran blok (± token, karakter / 3,6) | 279, maks 487 | 216, maks 477 | 233, maks 487 |
| baris `<Analysis>` | 5,3, maks 7 | 5,1, maks 7 | 5,2, maks 7 |
| porsi `<Analysis>` dalam blok | | | **34%** (±79 token per balasan) |
| blok rusak yang diperbaiki engine / tak terbaca | 7 / 0 | 1 / 0 | 8 / 0 |
| daftar yang ditulis di bawah /Player (dipindah engine) | 0 | 2 | 2 |
| reminder "possibly missed" | 1 | 0 | 1 |
| waktu per balasan (menit) | 15,4, maks 35 | ±4, maks 35 | |

**Pekerjaan engine yang dikerjakan narator sendiri** (per balasan):

| Jenis | A | B |
|---|---|---|
| mengurangi stamina karena cuaca (Chilled, hujan, angin) | 7 dari 13 | 0 |
| menyisipkan record bond utuh (`insert /Bonds/<id>` dengan Rank/Trust) | 2 | 2 |
| menghitung di Analysis ("Stamina 50.08 - 5.0 = 45.08") | 1 | 0 |

**Koreksi engine saat replay:** Trust tertulis untuk bond baru diganti (2: Caralynn 45 → 60, Kanae 60 → 40), waktu mundur ditahan (1),
efek Active tanpa teknik yang dikenal (1), tokoh tim rival dikeluarkan dari Scene.Present (1). Tidak ada Rank yang ditulis, tidak ada
nama deed yang tidak dikenal, dan schema tidak membuang satu perubahan pun.

## Bacaan

1. **Stamina cuaca dihitung dua kali** (T5) di 7 dari 13 balasan chat A, yaitu setiap kali {{user}} di luar saat hujan dingin. Ini
   pola, bukan kebetulan. Daftar "dikerjakan engine" di 1.53.0 kini menyebutnya. Ukur ulang di adegan hujan atau dingin.
2. **Record bond utuh** muncul di kedua chat (4 kali), dan setiap kali Trust yang ditulis ditimpa engine. Contoh 503 yang lama
   mengajarkannya. Sejak 1.53.0 contohnya `insert /Bonds/<id>/Known_facts/-`. Target: 0.
3. **Blok rusak** turun dari 7/13 (1.30.0) ke 1/36 (1.34.2) sejak aturan tag dan perbaikan 1.30.1. Recovery engine menyelamatkan
   semuanya.
4. **`<Analysis>` sepertiga dari output update** (5,2 baris). 1.53.0 membatasinya jadi 3 baris. Perkiraan hemat ±30–35 token output
   per balasan. Ukur ulang.
5. Adegan di kedua chat ringan (rata-rata 4 operasi). Manfaat U1–U3 (kartu situasi, satu tempat per fakta, state ringkas) ada di sisi
   **input** dan tidak terlihat di blok. Untuk itu `tests/token_audit.cjs` / render per adegan tetap jadi alat ukurnya.

## Cara mengulang

```
python tools/audit_chat.py "<chat.jsonl>" --mechanics --no-drift --out laporan.md --json laporan.json
```

Tanpa `--no-drift`, laporan drift karakter ikut dibuat. Replay butuh `node` dan `npm install`. Untuk A/B mode extra model (batch 7):
jalankan pada dua chat yang dimainkan dari save yang sama, lalu bandingkan tabel ringkasannya.
