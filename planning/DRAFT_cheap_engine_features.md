# DRAFT — Fitur engine murah token, mudah dipasang, berdampak nyata (2026-09-28, card 1.9.7)

Status: **dicatat, belum dibangun (2026-09-28).** Owner: "jangan dulu dibuat, pasang di future plan 1,4,5,6": E1, E4, E5, E6 menjadi FP7, FP8, FP9, FP10 di `planning/FUTURE_PLANS.md`. E2 (patroli jam malam), E3 (tidur otomatis) dan E7 (kerja paruh waktu) tidak dipilih; tetap di sini sebagai catatan.

## Prinsip pemilihan

- **Murah token.** Logikanya di engine (0 token). Narator hanya melihat satu baris di `<now>` *saat relevan* (bukan setiap pesan),
  dan kalau bisa aturan lama di 502 malah dipangkas. Patokan saat ini: ~15.2k token always-on di awal, ~20.4k di tengah game.
- **Mudah.** Memakai data yang sudah ada: `TIMETABLE`, `EVENTS`, `_Curfew`, lokasi, `elapsed`, seed harian, reputasi, Journal.
  Tidak ada schema besar baru, tidak ada canon baru (kecuali disebut).
- **Dampak nyata.** Pilihan pemain punya akibat yang *dihitung*, bukan bergantung pada ingatan narator. Playtest menunjukkan
  narator sering lupa hal kecil (kondisi, waktu, Resting); setiap usulan di sini memindahkan satu hal seperti itu ke engine.
- Tetap mengikuti aturan owner: deterministik dan aman untuk swipe, anti-grind, NPC bereaksi sesuai karakter, bisa dimatikan di
  Settings → Features.

## Ringkasan

| # | Usulan | Token | Usaha | Dampak |
|---|---|---|---|---|
| E1 | Absensi kelas dan klub otomatis + "clean week" | −40 di 502; +1 baris hanya saat bolos | kecil | tinggi: bolos punya harga, rajin terbayar |
| E2 | Patroli jam malam (risiko tertangkap, seeded) | +1 baris hanya saat di luar setelah curfew | kecil | tinggi: menyelinap malam jadi taruhan nyata |
| E3 | Tidur otomatis kalau narator lupa `Resting` | 0 | sangat kecil | sedang: stamina dan sleep debt tidak salah diam-diam |
| E4 | Jam belajar → kesiapan ujian | +1 baris hanya di minggu ujian; +25 di 502 | sedang | tinggi: belajar vs sosial jadi pilihan nyata |
| E5 | Dorm rank dihitung engine di hari Results | +1 baris hanya di hari Results | sedang (butuh E4) | tinggi: payout 300–3,000 tidak lagi acak |
| E6 | Rekap mingguan otomatis di Journal | ~30 token per minggu di Journal | kecil | sedang: memori chat panjang dan rasa progres |
| E7 | Kerja paruh waktu terjadwal | +1 baris hanya di hari shift | sedang | sedang: ekonomi untuk dorm rank rendah |

Saran urutan: **Paket 1 = E1 + E2 + E3 + E6** (semua kecil, satu rilis). **Paket 2 = E4 + E5** (saling terkait). **E7** belakangan.

---

## E1. Absensi kelas dan klub otomatis

**Sekarang.** Aturan 502 meminta narator melaporkan "skipped period −2" dan "a clean week +2" (Academy), serta "Saturday club
time +1" (Student). Narator jarang melakukannya, jadi bolos hampir tidak berakibat dan rajin tidak dihargai.

**Usulan.** Engine sudah tahu periode sekarang (`_Period`), jadwal tahun {{user}}, venue kelas, klub {{user}} dan venuenya.
- **Bolos:** selama periode kelas berjalan (tidak ditiadakan event), kalau {{user}} berada di luar venue kelas lebih dari 30 menit
  dari periode itu → periode itu tercatat bolos: Academy −2 (nilai yang sudah ada), satu baris `_Log`, dan satu baris `<now>` di
  balasan berikutnya (guru kelas itu menyadarinya).
- **Alasan sah (tidak dihitung bolos):** di Medical Centre; Head cold atau cedera moderate ke atas; Away/Trip; Battle aktif;
  event yang meniadakan kelas; belum di-sort pada Entrance.
- **Clean week:** saat pergantian minggu, kalau minggu itu tanpa bolos dan tanpa tertangkap setelah curfew (E2) → Academy +2
  (masuk batas mingguan seperti sekarang).
- **Klub Sabtu:** hadir di venue klub ≥ 60 menit di P3 hari Sabtu → Student +1 (masuk batas mingguan).
- Tiga baris laporan itu dihapus dari 502, jadi 502 **lebih pendek** sekitar 40 token.

**Teks card (baris `<now>`, hanya saat terjadi):**
> `{{user}} was absent from <class> (<teacher>) this period; the absence is on record. <teacher> reacts in character when they next meet.`

**Risiko.** Nama lokasi yang tidak cocok (misalnya "Lecture Hall 2F"): engine memakai pencocokan tempat yang sudah ada
(`canonLocation`, alias) dan memberi toleransi 15 menit untuk berpindah. Tes: kelas di Lecture Halls / Combat Grounds /
Potion Halls / Menagerie; alasan sah; swipe.

## E2. Patroli jam malam

**Sekarang.** Setelah curfew, {{user}} bisa keluyuran tanpa risiko kecuali narator memutuskan sendiri. Padahal "menyelinap malam"
adalah inti fantasi sekolah sihir, dan canon sudah punya patroli (Doves, staf, Dorm Head).

**Usulan.** Kalau {{user}} berada di luar dorm sendiri setelah `_Curfew` (bukan event tanpa curfew, bukan Away), engine melempar
dadu seeded setiap 30 menit in-world:
- Peluang dasar sekitar 15% per 30 menit, disesuaikan dengan:
  - tempat: Forest / Restricted Section / dekat Seal Chamber lebih tinggi; halaman dan taman sedang; di dalam kastil lebih rendah;
  - cuaca: hujan lebat atau badai lebih rendah;
  - `Dove_attention`: makin tinggi makin mudah tertangkap;
  - Doves +3 ke atas: lebih rendah (tip-off sesuai efek reputasi yang sudah ada).
- **Tertangkap:** engine mencatat siapa (Dove patrol di luar; Dorm Head atau staf di dalam kastil, dipilih seeded dari roster
  yang ada), Academy −5 (nilai yang sudah ada; Forest/Restricted juga Doves −5 sesuai 502), dan `<now>` meminta narator memainkan
  penangkapan *sekarang*.
- **Belum tertangkap:** satu baris risiko supaya narator bisa membangun ketegangan.
- Tidak ada efek tambahan di luar nilai reputasi yang sudah canon.

**Teks card (`<now>`, hanya setelah curfew di luar dorm):**
> `After curfew outside {{user}}'s dormitory: patrols are out (risk this half hour: <low|moderate|high>). Let footsteps, lanterns and near misses show it.`
> `Caught: <who> finds {{user}} at <place> after curfew. Play the encounter now; <who> reacts in character. Academy reputation −5 is already applied.`

**Risiko.** Harus terasa adil: peluang tampil di baris risiko, dan hanya satu tangkapan per malam.

## E3. Tidur otomatis kalau `Resting` lupa diisi

**Sekarang.** Stamina pulih saat tidur dan sleep debt terhapus hanya kalau narator mengisi `Resting: "sleep"`. Kalau lupa,
{{user}} bangun lelah dan terkena sleep debt palsu. (Mana sudah pasif sejak 1.9.4.)

**Usulan.** Kalau `elapsed` ≥ 3 jam, `Resting` kosong, {{user}} berada di dorm sendiri, dan rentangnya mencakup ≥ 3 jam antara
22:00 dan 08:00 → engine memperlakukannya sebagai tidur dan mencatatnya di `_Log`. Tidak ada teks prompt.

## E4. Jam belajar → kesiapan ujian

**Sekarang.** Nilai ujian dan `Exams` sepenuhnya dikarang narator; belajar tidak berpengaruh.

**Usulan.**
- Engine menghitung **menit belajar** sejak ujian terakhir, dari tiga sumber:
  - waktu di Main Library / Study Rooms di luar jam kelas, dihitung dari `elapsed` dan lokasi;
  - Interactions `study` (+60 menit, dan partner Rank 4 memberi bonus yang sudah ada di `data/rank4_partners.json`);
  - Study Hall Sabtu kalau hadir.
- Di minggu ujian (M3W1, M5W1, M9W1, M11W1), `<now>` memberi **kesiapan**: `unprepared | shaky | fair | solid | excellent`.
  Batas tiap tingkat ada di `data/tuning.json` (misalnya 0/4/10/18/28 jam), jadi anti-grind: tingkat tertinggi butuh kerja nyata.
- Aturan narator (satu baris, ~25 token): hasil ujian mengikuti tingkat kesiapan ±1 langkah (bakat dan keadaan boleh menggeser
  satu langkah); laporkan Rep_events ujian seperti biasa.
- Settings → Features: "Study" bisa dimatikan.

**Teks card (`<now>`, hanya minggu ujian):**
> `Exam week. {{user}}'s preparation: <tier> (<h> hours studied since the last exams). Results follow it within one step.`

## E5. Dorm rank dihitung engine

**Sekarang.** Di hari Results (M5W2, M11W2), narator yang memilih angka `Dorm_rank`, padahal angka itu menentukan payout bulanan
300–3,000.

**Usulan (butuh E4).**
- Skor = tingkat kesiapan ujian + hasil Dorm Competition (placement) + level Academy + prestasi yang sudah tercatat (hadiah Fair
  atau Showcase) + sedikit variasi seeded.
- Skor dipetakan ke rank dengan pita yang sudah dipakai payout (1 / ≤3 / ≤10 / ≤25 / ≤50 / sisanya), jadi rank baru hanya
  bergerak dalam pita yang masuk akal dari rank lama.
- Engine menulis `Dorm_rank`; narator hanya mengumumkan (`<now>`: "Announce: {{user}} is now #n in <dorm> (was #m)").

**Risiko.** Ini keputusan keseimbangan ekonomi: tabel skor di `data/tuning.json` supaya mudah disetel sesudah playtest.

## E6. Rekap mingguan di Journal

**Usulan.** Saat pergantian minggu, engine menulis **satu** baris Journal dari data yang sudah ada. Contoh:
`M2 W3: Etnie reached Rank 4; Academy +2 (clean week); 450 points earned, 120 spent; skipped 1 class.`

**Dampak.** Chat panjang tetap ingat arah minggu-minggu lalu (Journal sudah dikirim ke narator), dan pemain melihat progresnya.

**Token.** Kira-kira +30 token per minggu. Catatan: Journal dibatasi 30 baris, jadi rekap ikut memakai slot. Alternatif: rekap
hanya ditulis kalau ada perubahan penting (rank, reputasi, bolos).

## E7. Kerja paruh waktu terjadwal

**Sekarang.** Paid work (20–40 poin per shift) hanya dari narasi; tidak ada jadwal, jadi mudah terlupa atau tidak terbayar.

**Usulan.**
- Saat {{user}} menerima pekerjaan (Notice atau percakapan), narator menambah satu **Job**: tempat, hari, jam, upah (seperti
  Commitment).
- Engine membayar otomatis kalau {{user}} berada di tempat itu selama shift, dengan batas 3 shift per minggu (anti-grind).
- Mangkir: Academy −1; dua kali mangkir → dipecat (satu baris `<now>`).
- Butuh satu field kecil baru di schema (`Jobs`) dan satu baris aturan di 502.

---

## [?] Keputusan owner

1. **Paket mana yang dibangun?** Saran: Paket 1 (E1, E2, E3, E6) dulu, lalu Paket 2 (E4, E5); E7 nanti.
2. **E2: siapa yang berpatroli?** Saran: di luar gedung Doves; di dalam kastil staf yang sedang bertugas (Dorm Head, Kuroo,
   Ottavio…); di Forest bisa siapa saja dari keduanya. Atau hanya Doves di semua tempat?
3. **E2: peluang dasar** sekitar 15% per 30 menit (sekitar 1 dari 3 menyelinap satu jam tertangkap). Terlalu keras atau lunak?
4. **E4: batas jam belajar** per tingkat (0/4/10/18/28 jam antar ujian): setuju sebagai titik awal?
5. **E5: rank boleh turun?** Saran: ya, bisa turun satu pita kalau ujian dan kompetisi buruk (reputasi punya harga, begitu juga malas).
6. **E6: rekap setiap minggu atau hanya minggu dengan perubahan penting?** Saran: hanya kalau ada perubahan penting.
