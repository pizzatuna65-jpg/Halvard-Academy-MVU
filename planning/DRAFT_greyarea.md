# DRAFT: Tes use case Trust / Bond / Tension, dan area abu-abu

Status: **APPROVED oleh owner (2026-09-25), semua usulan, diterapkan di card v1.4.4.** Catatan dalam Bahasa Indonesia; teks yang masuk ke card dalam Bahasa Inggris. Keputusan terbuka ditandai `[?]` di akhir.

## Cara tes

Setiap use case dimainkan **lewat engine sungguhan (v1.4.3) selama 4 minggu in-game**: interaksi dilaporkan setiap hari, Trust dan Tension ditulis seperti narator yang mengikuti rule 502, dan setiap bond event yang siap langsung dimainkan. Karena hasilnya sangat bergantung pada cara narator membaca rule, beberapa kasus dijalankan dua kali: **literal** (mengikuti ukuran di 502 apa adanya) dan **longgar** (narator berbaik sangka).

NPC uji mewakili kombinasi kategori (Trust / Tension):
- Ruby: Open / Withdrawn
- Irene: Guarded / Authority
- Sophia: Guarded / Confrontational
- Mimosa: Closed / Withdrawn

Singkatan di tabel: **R** = Rank, **T** = Trust (band), **X** = Tension.

---

## Use case 1: {{user}} genki dan airhead

Ramah, loyal, selalu datang saat janji (`keep` tiap Senin), berusaha membantu (`help` tiap Rabu), tapi rencana yang dipercayakan kepadanya gagal total setiap Jumat, dan dua kali dalam sebulan ia tidak sengaja membocorkan rahasia orang.

Rule 502 sekarang tidak membedakan **niat**. "Rencana gagal" paling dekat dengan "a real promise broken" (Trust −10–15, dan di baris Tension "broken promise +10–15"). "Rahasia bocor" jatuh ke "their secret told −20", yang juga memicu **kabar menyebar** ke teman-teman NPC itu.

| Minggu 4 | Ruby | Irene | Sophia | Mimosa |
|---|---|---|---|---|
| Literal | R3, T8 Betrayed, X22 | R3, T0 Betrayed, **X68** | R3, T0 Betrayed, **X84** | R3, T0 Betrayed, X18 |
| Longgar (gagal −4 tanpa Tension; bocor tetap −20) | R3, T40 Neutral | R3, **T0 Betrayed** | R3, **T0 Betrayed** | R3, T25 Doubtful |

**Penilaian:** terlalu keras. Anak yang tulus dan loyal diperlakukan seperti pengkhianat: band Betrayed ("files {{user}} as a threat", XP dipotong setengah, Tension ×1.5). Bahkan dengan narator yang longgar, dua kebocoran tanpa sengaja cukup untuk membuat NPC Guarded menganggapnya pengkhianat. Yang realistis: ia **disayang tapi tidak dipercaya memegang rahasia atau rencana**. Artinya Trust Doubtful atau Neutral, dan Tension hampir nol.

## Use case 2: banter bercanda (mengejek dan dorong-dorongan seperti teman lama)

Setiap hari hangout sambil saling ledek, dan setiap Sabtu dorong-dorongan.

| Minggu 4 | Ruby | Irene | Sophia | Mimosa |
|---|---|---|---|---|
| Literal (ledekan = slight +4/hari; dorongan = violence +20) | **R0**, X100 | **R0**, X100 | **R0**, X100 | **R0**, X100 |
| Hanya ledekan (+4/hari) | R3, X56 | R2, X82 (event tertahan) | **R1, X100** | R3, X56 |
| Dibaca sebagai persahabatan (tanpa Tension) | R3, X0 | R3, X0 | R3, X0 | R3, X0 |

**Penilaian:** kalau narator membaca rule secara harfiah, bercanda **menghancurkan semua bond**, termasuk dengan Sophia, yang justru paling suka orang yang berani membalas. Rule 502 tidak menyebut candaan yang dinikmati dua pihak. Yang realistis: karakter yang suka bercanda (Sophia, Ruby) tidak tersinggung, sedangkan Irene (Council President) dan Mimosa (pemalu) lama-lama merasa tidak nyaman.

## Use case 3: {{user}} tsundere

Setiap hari satu kalimat ketus (+4) dan setiap Selasa satu hinaan (+12). Tapi ia selalu menepati janji (`keep`), membantu (`help`), dan membela mereka di depan umum (`defend`).

| Minggu 4 | Ruby | Sophia | Etnie | Althair | Kanae | Irene |
|---|---|---|---|---|---|---|
| Sekarang | R2, T98 Confidant, X54 | **R0**, T78, X100 | R4, T100, X44 | R4, T50, X0 (+XP) | R3, T81, X88 | **R0**, T78, X100 |

**Penilaian:**
- Trust naik tinggi (benar: perbuatannya bisa diandalkan). Althair makin senang (benar), Etnie tetap lengket (benar), dan bond Kanae tidak terpengaruh (sesuai override).
- Tapi Sophia dan Irene **jatuh ke Rank 0**, padahal {{user}} membela mereka setiap minggu. Penyebabnya: **perbuatan baik sama sekali tidak meredakan Tension.** Hanya maaf, waktu dan pertarungan yang bisa. Teks kategori Authority bahkan sudah bilang "visible good conduct and hard work count more", tapi engine tidak pernah menerapkannya.

---

## Masalah yang ditemukan

1. **(Bug engine) Rank bisa turun berulang kali.** Setiap kali Tension menyentuh 100, rank turun 1. Karena Tension turun ke 99 lewat decay lalu naik lagi keesokan harinya, rank terus jatuh setiap hari (Sophia: Rank 2 → 0 dalam seminggu, Use case 2 dan 3). Maksud desainnya satu kali per "ledakan".
2. **Niat tidak dibedakan.** Ceroboh tanpa niat jahat dihukum sama seperti pengkhianatan, termasuk kabar menyebar.
3. **Candaan yang dinikmati dua pihak dihitung sebagai pelanggaran.** Tidak ada aturan soal ini, dan tidak ada perbedaan per karakter.
4. **Kebaikan tidak meredakan Tension.** Ini bertentangan dengan teks "eases" milik kategori itu sendiri.
5. **Trust tidak bisa diperbaiki lewat penjelasan atau maaf.** Setelah salah paham diluruskan, satu-satunya jalan naik adalah perbuatan baru (maksimal +8 per minggu). Ini wajar untuk pengkhianatan sungguhan, tapi terlalu kaku untuk salah paham.

## Area abu-abu lain (hasil sekarang dan usulan)

| # | Situasi | Hasil sekarang (rule 502 literal) | Usulan |
|---|---|---|---|
| 4 | Melaporkan rahasia berbahaya teman ke guru **demi keselamatannya** | Betrayal −25–40 (×1.25 untuk Guarded), kabar menyebar ke teman-temannya | Tetap pengkhianatan di mata mereka (ukuran penuh). Setelah mereka **mengerti** alasannya dalam cerita, sebagian bisa pulih (usulan E3). |
| 5 | Bohong untuk melindungi mereka, atau demi pesta kejutan, lalu ketahuan | "A lie found out" −10–15 | Kalau mereka mengerti alasannya: −0–3. |
| 6 | Menjaga rahasia mereka tapi **mereka tidak tahu** | Narator bisa melapor `secret`, jadi Trust naik | Perbuatan hanya dihitung saat karakter itu **menyaksikan atau belakangan tahu**. |
| 7 | Dipaksa (ancaman Krieg) atau dikendalikan (charm Althair, mind control) lalu merugikan mereka | Betrayal penuh | Kalau mereka tahu {{user}} tidak punya pilihan: Trust tidak turun; Tension boleh naik kalau mereka terluka. |
| 8 | Sparring atas persetujuan bersama, tapi mereka cedera | Bisa dibaca "violence +20–30" | Laporkan sebagai `fight`, tanpa Tension; Tension hanya kalau {{user}} curang atau terus menyerang setelah mereka menyerah. |
| 9 | Berpihak ke teman A dalam pertengkaran kecil dengan teman B | B bisa dibaca "siding with their enemy −25–40" | Pertengkaran antar-teman bukan "musuh": maksimal −3–5 atau Tension +3–5. |
| 10 | Janji ganda, harus memilih salah satu | Yang ditinggal: broken promise −10–15 | Kalau dikabari sebelumnya: −3–5; kalau tidak: −10–15. |
| 11 | Menggoda orang lain di depan pasangan romance | Tidak diatur | Tension pasangan +5–10 (cemburu), sesuai karakter. Kanae sudah punya override sendiri. |
| 12 | Tsundere dengan NPC yang sudah "membaca" dirinya | Confidant sudah memotong setengah kenaikan kecil (engine) | Ditambah: dari Trust 65, kalimat ketus yang jelas-jelas sayang = 0 Tension (narator). |
| 13 | Gagal meski sudah berusaha keras (bukan janji yang diabaikan) | "Promise broken" −10–15, Tension +10–15 | −0–3, tanpa Tension, kecuali kegagalan itu merugikan mereka secara nyata. |

---

## Usulan perubahan

### Engine

- **E1. Rank turun hanya sekali per ledakan.** Setelah rank turun karena Tension 100, rank tidak bisa turun lagi sampai Tension sempat turun di bawah 70.
- **E2. Kebaikan meredakan Tension, sesuai kategori** (sekali sehari, hanya kalau Tension > 0), lewat `help`, `keep` dan `defend` yang dilaporkan:

  | Kategori / override | Reda |
  |---|---|
  | Withdrawn | −5 |
  | Social | −5, hanya `defend` di depan umum |
  | Authority | −3 ("visible good conduct") |
  | Confrontational | 0 (yang meredakan tetap pertarungan) |
  | Dangerous | 0 (hanya lewat cerita) |
  | Etnie, Kanae | −5 |
  | Ezrel | 0 |

  Dengan E2, pada Use case 3 Ruby turun ke X9, Etnie X3, Kanae X33 dan Irene X81 (bukan 100).
- **E3. Trust bisa pulih sebagian setelah salah paham diluruskan.** Jenis interaksi baru `{"Kind": "understood"}`: karakter itu akhirnya mengerti bahwa {{user}} tidak berniat jahat (dipaksa, demi keselamatannya, salah paham). Engine mengembalikan sebagian dari penurunan Trust terakhir dalam 30 hari:
  - Open: 50%
  - Normal: 33%
  - Guarded: 25%
  - Closed: 0%

  Hanya sekali per penurunan. Kabar yang sudah menyebar tidak ikut pulih. `[?]`

### Rule 502 (narator), teks card

Ditambahkan ke paragraf Trust / Tension, sekitar +150 token (selalu aktif):

> Judge a deed by what the character believes {{user}} meant, not by the harm alone. Carelessness without malice (a real try that fails, a secret that slips out by accident) is small: Trust −3 for a failure, −8–10 for a slipped secret, and Tension only if it truly cost them something. Teasing, mock insults and play-fighting that both sides enjoy are not offences: report them as talk or hangout; whether a character enjoys them is theirs (<now>). Only count what the character saw or later learns of. If they know {{user}} had no choice (forced, charmed, protecting them), Trust does not fall; report "understood" when a misunderstood act is finally understood. A quarrel between friends is not siding with an enemy. A consensual spar is a fight, not violence, unless {{user}} fought dirty or kept going after they yielded.

### `<now>`: cara karakter menerima candaan (per kategori, satu baris untuk NPC yang hadir)

| Kategori / override | Teks (English) |
|---|---|
| Withdrawn | "light teasing is fine; mockery of what they care about, or rough play, hurts" |
| Social | "enjoys witty banter in private; being mocked in public is an offence" |
| Confrontational | "loves it, shoves included: people who hit back are the best kind" |
| Authority | "tolerates light teasing from those they trust (Trust 65+); horseplay and mockery are offences" |
| Dangerous | "nobody teases them; it is an offence unless they started it" |
| Etnie | "any attention from {{user}} is a gift, teasing included" |
| Althair | "delighted: the ruder, the better" |
| Ezrel | "does not notice" |
| Kanae | "sweet about it, but notes who else {{user}} jokes with" |

Dengan usulan ini (simulasi):
- **Airhead** (1c): Ruby berakhir Trusting, Irene dan Sophia Doubtful (tidak mau memegang rahasianya atau mengambil risiko), Mimosa Doubtful, **Tension 0 semua**, dan Rank 3 dengan semua. Inilah "disayang tapi tidak dipercaya".
- **Banter** (2d): Ruby dan Sophia Rank 3 tanpa Tension. Irene X82 (event tertahan) dan Mimosa X56, karena mereka memang tidak suka didorong-dorong setiap hari.

## Cek terhadap prinsip desain

- **NPC tetap sesuai karakter:** penerimaan candaan dan cara reda mengikuti kategori; Sophia tidak lagi membenci orang yang bercanda dengannya.
- **Lebih mudah membuat musuh:** pengkhianatan yang disengaja tetap penuh dan tetap menyebar; E3 hanya memulihkan sebagian, sekali, dan tidak berlaku untuk Closed.
- **Kebebasan:** gaya roleplay (airhead, tsundere, suka bercanda) menghasilkan konsekuensi yang masuk akal, bukan hukuman seragam.

## Keputusan terbuka

1. `[?]` **E1** (rank turun sekali per ledakan, reset di bawah 70): saya anggap bug, jadi sebaiknya langsung diperbaiki. Setuju?
2. `[?]` **E2** angka reda per kategori.
3. `[?]` **E3** jenis interaksi `understood` dan persentasenya, atau tidak perlu (Trust hanya pulih lewat perbuatan baru)?
4. `[?]` Teks rule 502 di atas (+150 token selalu aktif): oke, atau diringkas?
5. `[?]` Baris "cara menerima candaan" per kategori di `<now>` (+15–25 token per NPC yang hadir): oke? Ada NPC yang perlu teks sendiri (misalnya Percival, Saffi, Aiden)?
6. `[?]` Area abu-abu #4–#13: ada yang kamu ingin berbeda?

## Keputusan owner (2026-09-25)

Semua `[?]` disetujui seperti usulan: E1, E2 (angka di tabel), E3 (`understood`, 50/33/25/0%, 30 hari), teks rule 502, baris "Teasing" di `<now>`, dan penanganan area abu-abu #4–#13. Tidak ada NPC yang diberi teks candaan sendiri selain override yang sudah ada (Etnie, Kanae, Althair, Ezrel).
