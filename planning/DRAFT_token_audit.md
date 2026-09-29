# DRAFT — Audit token dan prompt (2026-09-28, card 1.10.3)

Status: **diterapkan di card 1.11.0 (2026-09-28)**, owner: "semua iya, terapkan". Hasil terukur ada di CHANGELOG 1.11.0 (A8 menghemat lebih sedikit dari perkiraan karena penjelasan bersama tetap perlu ditulis sekali di kepala `<cast>`).
Pertanyaan untuk owner hanya 3, di akhir.

## Cara audit

- Semua entry constant dirender dengan dua state nyata: save fixture 1.10.1 (permainan biasa, 8 bond) dan TEST card Rank 7
  (38 bond, state berat). Cast Sheet diukur dengan 1, 2, 4 dan 5 orang hadir. Preset diukur dari prompt yang aktif.
- Setiap teks dibaca penuh untuk mencari aturan yang diulang, teks yang hanya relevan sebentar tapi dikirim setiap pesan,
  angka engine yang tidak perlu diketahui narator, dan susunan yang aneh.
- Hitungan token ≈ karakter / 3,6 (sama dengan `tests/token_audit.cjs`).

## Angka sekarang (per pesan, sebelum riwayat chat)

| Bagian | Save biasa | State berat (38 bond) |
|---|---|---|
| Aturan card 502 | 7.725 | 7.725 |
| Aturan card 504 | 2.198 | 2.198 |
| `<current_state>` (entry 501) | 2.744 | 3.718 |
| Lore constant (World Index, Map, Roster, Timetable, Calendar) | ~3.950 | ~3.950 |
| `<now>` + output format | ~730 | ~890 |
| **Card always-on** | **~17.300** | **~18.500** |
| Cast Sheet saat ada orang (per orang, lore penuh) | ~2.000 (4 orang ≈ 8.400) | ~2.000 (4 orang ≈ 8.700) |
| Cast gate 510 (saat ada orang) | 245 | 245 |
| Preset (41 prompt aktif) | ~17.500 | ~17.500 |
| **Total dengan 4 NPC hadir** | **~43.500** | **~45.000** |

## Bug yang ditemukan (sudah diperbaiki, 1.10.3)

Engine crash pada update pertama TEST card Rank 7 di kode "defining moments": sebuah bond yang Trust/Tension-nya bergeser besar
tanpa baris riwayat sendiri membuat engine membaca baris riwayat yang tidak ada (atau, bila ada, mencatat baris lama sebagai momen
penting). Sekarang hanya baris milik update itu sendiri yang bisa jadi momen penting. Tes: `tests/test_bughunt_v1103.cjs`.

## Prompt yang aneh / tidak rapi

1. **Lima blok di luar tag 502.** "Mood and rest", "Sleep", "Wind", "Birthday gifts" dan aturan alkohol tertulis **setelah**
   `</variable_update_rules>`. Sebagian besar isinya angka mekanik engine (Good +1 XP, ×1.5, −10% per jam, dst.) yang dihitung
   engine sendiri.
2. **List rusak di 502.** Baris "Exams" (ditambahkan 1.10.1) disisipkan di tengah bagian Reputation, sehingga sub-list
   "Attendance / Academy / Student / Doves" sekarang tampak berada di bawah "Exams".
3. **Aturan Entrance Event di enam tempat, dikirim setiap pesan sepanjang tahun:** 502 (paragraf Entrance + Entrance_tour),
   504 (dua bullet), NPC Roster (paragraf "Entrance morning") dan cast gate 510. Relevan hanya satu hari per tahun.
4. **Aturan waktu/perjalanan ditulis tiga kali:** 502 (baris Time), 504 ("Arrivals take plausible time…" dan "Before setting Time…"),
   ditambah satu lagi di 510.
5. **Koreksi sekali-pakai jadi aturan permanen:** "Magic Duelling Club … never staff or sword fighting" ada di 504 **dan** 510,
   padahal sudah jelas di lore Clubs dan Cast Sheet.
6. **`<now>` mengulang state:** baris pertama (tanggal, jam, periode, lokasi) dan baris "Today:" adalah salinan kata per kata dari
   `World` (`_Event_today` bisa ~140 token di hari event).
7. **Field bond usang tetap dikirim:** `Progress` (selalu 0 sejak XP 1.2.2) dan `_Event_ready` (hanya penanda save lama sejak 1.9.0),
   untuk setiap bond.
8. **Preset: toggle dewasa menyala secara default** di card akademi slice-of-life: "🔞Realism Mode / Jailbreak" (adult mode) dan
   "🔞 NSFW Anti-Slop Register" (~600 token).

## A. Optimasi tanpa mengubah perilaku card (disarankan semua)

| # | Apa | Hemat per pesan (perkiraan) |
|---|---|---|
| A1 | Masukkan kelima blok ke dalam tag 502; buang angka yang dihitung engine, sisakan yang narator perlu lakukan (warna mood, laporan The Vigil, penghalang angin di Note, reaksi hadiah ulang tahun, aturan alkohol) | ~250 |
| A2 | Aturan waktu/perjalanan cukup sekali (502) + satu kalimat pengingat di 510 | ~150 |
| A3 | Semua teks Entrance Event (enam tempat) hanya dikirim di Month 1 Week 1 lewat gate EJS; di luar itu hilang | ~600 (335 hari setahun) |
| A4 | Detail pemilihan Council (502, ~230 token) hanya di Month 9–10; sisanya satu baris "Florian and Dante are Council members; the election is M10 W3" | ~200 |
| A5 | Bagian yang hanya relevan dalam keadaan tertentu dikirim hanya saat keadaannya ada: Pacts (kalau {{user}} punya pact), Hidden (kalau ada magic tersembunyi), `_Perks` (kalau ada perk), jenis interaksi rank tinggi (rank_gift di Rank 5+, introduction 6+, vouch 9+, escort dorm 7+), Graduated (Month 11+ atau Year 2+) | 300–800 (makin besar di awal permainan) |
| A6 | `Bonds.Progress` dan `Bonds._Event_ready` disembunyikan dari narator (jadi field `$` milik engine; save lama tetap terbaca) | 90–420 |
| A7 | `<now>` tidak mengulang state: baris tanggal/jam dan "Today:" diringkas (judul event saja; jadwal lengkap tetap di `World._Event_today`) | 25–200 |
| A8 | Cast Sheet: kalimat baku yang sama untuk setiap NPC (penjelasan `<narrator_only>`, judul contoh suara, definisi "Change") ditulis sekali di kepala `<cast>` | ~90 per orang hadir (≈350 dengan 4) |
| A9 | 504: hapus koreksi sekali-pakai (Magic Duelling Club, sudah di lore dan 510) dan gabungkan dua kalimat "skipping class" yang sama | ~60 |
| A10 | Perbaiki susunan list 502 (Exams dipindah ke akhir bagian Reputation) | 0 (kerapian) |

**Total A:** sekitar **1.600–2.700 token per pesan** di permainan biasa (≈ 9–15% dari card always-on), plus ~350 saat 4 orang hadir.
Tidak ada aturan yang hilang: yang dipangkas adalah salinan, angka yang dihitung engine, dan teks yang tidak relevan saat itu.

## B. Hemat besar, perlu verifikasi teknis dulu

**B1. `<current_state>` tanpa field kosong.** Saat ini setiap bond mencetak `Mind: ""`, `Knows: []`, `Imprints: []`,
`Romance: false`, `Title: ""`, dst. Kalau yang kosong tidak ditampilkan: **−650 token** di save biasa, **−1.900 token** di state berat.
- Ini hanya tampilan: variabel aslinya tetap lengkap, jadi patch MVU ke field itu tetap valid. Aturan 502 sudah menjelaskan setiap field.
- Caranya: entry 501 merender state sendiri lewat EJS (tanpa kunci `$`, tanpa nilai kosong) menggantikan macro
  `{{format_message_variable::stat_data}}`.
- Perlu diverifikasi sebelum dibangun: bahwa Prompt Template merender EJS di entry 501 pada posisi dan waktu yang sama dengan macro
  Tavern Helper (baca source, sesuai aturan "verify, don't assume"), dan bahwa narator tetap menulis field yang tidak terlihat
  (uji di ST).

## C. Preset

- **C1. Toggle dewasa OFF secara default** (Realism Mode / Jailbreak dan NSFW Anti-Slop Register). Pemain tetap bisa
  menyalakannya. **~600 token.** Ini mengubah perilaku default preset. (Female Vocal Acoustics tetap ON: itu perbaikan klise, bukan
  toggle dewasa.)
- Tidak disarankan: menggabungkan prompt preset yang tumpang tindih (NPC Voice, NPC Instincts, Scene Engine, Cinematic Realism,
  Realistic NPCs, Personality Independence, Anti-Omniscient ≈ 6.200 token; pasangan Killswitch + Last-Mile Gate ≈ 1.450 token).
  Potensinya 1.500–2.500 token, tetapi itu menulis ulang prompt Gemini yang sudah disetel penulis preset, dan hasilnya hanya bisa
  dinilai lewat playtest.

## Tidak disarankan

- Mengurangi Cast Sheet penuh dari 4 ke 2 orang, atau membuat Timetable/Campus Map jadi keyword: hemat besar, tetapi mengubah
  konsistensi karakter dan navigasi yang sudah disetujui.

## [?] Keputusan owner

1. **A1–A10** (tanpa mengubah perilaku): terapkan semua? Saran: ya.
2. **B1** (state tanpa field kosong): verifikasi lalu terapkan? Saran: ya.
3. **C1** (toggle dewasa preset OFF secara default): terapkan? Saran: ya.
