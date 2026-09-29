# DRAFT — Laporan narator yang terlewat (2026-09-29, card 1.11.3)

Status: **DITERAPKAN di card 1.12.0 (2026-09-29)**, owner: "perbaiki hal itu beserta missed report". Perbedaan dari draft ini:
H4 dan H3 (b) dijadikan pengingat saja (R12, R13) karena [?1]/[?2] belum dijawab (default paling aman, tidak mengubah angka);
H1 dibatasi satu malam (5–24 jam); ditambah H5–H7 dan R11 untuk sihir sustained dan summon (lihat CHANGELOG 1.12.0); Tahap 0
dilewati. Rincian dan test: CHANGELOG 1.12.0, `tests/test_reports_v1120.cjs`.
Asal: diskusi kelemahan proyek, mitigasi poin 4 ("hitung sendiri, jangan minta dilaporkan") dan poin 5 ("engine membaca prosa,
hasilnya hanya pengingat di `<now>`"). Tidak ada canon atau lore baru; semua perubahan ada di engine, schema, rule 502, `<now>` (505)
dan Features.

Keputusan §4 yang disentuh (tidak ada yang dibalik):
- **Engine deterministic and replay-safe:** tetap. Pengingat dihitung dari teks balasan dan pesan pemain, sama di setiap replay.
- **Bonds / Trust:** XP dan Trust tetap hanya dari laporan narator. Poin 5 hanya mengingatkan dan tidak pernah menambah angka.
- **Sleep (1.8.0):** "six consecutive hours asleep" tetap. Yang berubah hanya sumber "asleep" (H1).
- **D3/D6 (UI tidak menggerakkan cerita):** tidak disentuh. Tidak ada tombol baru.

---

## 0. Hasil audit: semua jalur yang bergantung pada laporan narator

Engine hanya melihat patch dan teks balasan. Salah catat sudah dijaga dengan baik (clamp, revert, gate). Yang masih lemah adalah
**lupa catat**. Tabel ini memuat setiap jalur laporan di rule 502, akibatnya kalau narator lupa, dan usulan draft ini.

| Jalur | Kalau narator lupa | Sekarang | Usulan |
|---|---|---|---|
| `World.Time` maju | Jam beku: regen mana, absensi, jam belajar, cuaca dan sleep debt ikut berhenti | Waktu mundur dijaga; waktu yang tidak maju tidak terdeteksi | **R3** isyarat waktu di prosa |
| `World.Location` | Absensi dan cuaca salah tempat | Nama tempat dinormalkan (`canonLocation`) | **R4** kalimat "arrives at <tempat>" |
| `Scene.Present` | Cast Sheet salah; bond, rank-up dan gift gagal gate | Sudah ada pengingat "spoke but not in Scene.Present" | tetap (ini contoh pola poin 5) |
| `Vitals.Resting: sleep` | Lompat malam tanpa `sleep` = begadang 6 jam: sleep debt penuh, stamina tidak pulih | Tidak terdeteksi | **H1** engine menganggap tidur |
| HP turun + `Injuries` | HP hilang tanpa luka bernama (melanggar D13) | Tidak terdeteksi | **R1** cek state |
| `Magic.Casts` / `Active` | Mana tidak terpakai | Tidak terdeteksi | **R5** nama teknik di prosa / pesan pemain |
| `Consumables` + Qty di Bag | Efek item tidak jalan, atau item dipakai tapi tetap di Bag | Narator harus menulis keduanya | **H2** Qty turun otomatis; **R2** item keluar dari Bag |
| `Wallet.Points` + `Transactions` | Uang berubah tanpa catatan, atau catatan tanpa uang berubah | Hanya cek belanja melebihi saldo (1.11.1) | **H3** rekonsiliasi |
| `Interactions` talk / hangout | XP hilang; rank-up tertunda (butuh interaksi "genuine") | Tidak terdeteksi | **R6** NPC bicara tanpa interaksi |
| `Interactions` gift | XP, Trust ulang tahun dan catatan selera hilang | Tidak terdeteksi | **R2** (dari Bag) + **R7** kata "gives / hands" |
| `rank_gift` / `Perk_use` | Hadiah Rank 5 tidak tercatat; perk sekali pakai tidak habis | Tidak terdeteksi | **R8** nama hadiah/perk di prosa |
| `Interactions` apology | Tension tidak mereda | Tidak terdeteksi | **R9** "sorry" di pesan pemain |
| `Training` | Mana_max/Stamina_max tidak naik | Tidak terdeteksi | **R10** tempat latihan + waktu + kata latihan |
| `Hidden.Dove_attention` | Sihir tersembunyi dipakai di depan orang tanpa risiko | Tidak terdeteksi | **H4 [?]** batas bawah |
| Trust/Tension turun, Rep_events, deed (keep, secret, defend, confide, help), Known_facts, Knows, Mind, Journal, Secrets_revealed | Hilang | Tidak terdeteksi | **Tidak diusulkan** (lihat §3) |

Yang **sudah** dihitung engine sendiri (tidak perlu disentuh): _Period, _Curfew dan event hari itu, regen mana, biaya teknik dari
Casts/Active, upkeep, kondisi cuaca di luar ruangan, sleep debt (dari Resting), absensi, menit belajar, dorm rank, payout, rank-up,
kenaikan Trust, peredaan Tension, Extras, nama yang terungkap, Cast Sheet, kelulusan, cohort.

---

## 1. Poin 4: engine menghitung sendiri

### H1. Tidur dari lompatan waktu semalam (nilai terbesar)

Masalah: narator sering langsung menulis "22:30 → 07:00 hari berikutnya" tanpa `Resting: "sleep"`. `updateSleep` lalu menghitung
{{user}} begadang semalam (00:00–06:00 = 6 jam utang tidur, stamina dibatasi) dan stamina tidak pulih. Pemain dihukum karena
narator lupa.

Aturan baru (engine §4, sebelum `updateSleep`): jika `Resting` = `none`, lalu:
- waktu yang berlalu ≥ 5 jam **dan** minimal 4 jam di antaranya jatuh di 00:00–06:00,
- {{user}} tidak dalam Battle, The Vigil tidak aktif, dan Location di akhir tidak outdoor (kecuali Trip aktif),

maka update itu diperlakukan sebagai `sleep`. Log: `Slept through the night (assumed from the time skip).`

Pengaman: nilai baru `Resting: "awake"` untuk begadang yang disengaja (jaga malam, belajar semalaman). Engine memperlakukannya
sebagai `none` dan tidak menebak tidur. Save lama aman karena enum memakai `.catch`.

Teks 502 (ganti kalimat Resting):
> - Resting: set "rest" or "sleep" when {{user}} rested or slept during the elapsed time; the engine applies stamina recovery and resets it. A night skipped in one update counts as sleep; set "awake" only when {{user}} deliberately stayed up through it.

### H2. Consumables menurunkan Qty di Bag

Masalah: rule meminta narator menulis dua hal untuk satu tindakan: `/Consumables/-` **dan** menurunkan Qty. Yang satu sering lupa.

Aturan baru (engine §4b): untuk setiap entry Consumables yang ada di Inventory, kalau Qty-nya tidak turun di update ini, engine
menurunkannya 1 (dihapus di 0). Kalau item tidak ada di Bag (dibeli lalu langsung diminum di kafe), tidak ada yang berubah.

Teks 502: bagian The Vigil `insert "The Vigil" into /Consumables/- and reduce its Inventory Qty` menjadi
`insert "The Vigil" into /Consumables/- (the engine lowers its Qty)`. Kalimat Inventory ditambah: `Reporting a used item in
/Consumables lowers its Qty by one; do not lower it again.`

### H3. Rekonsiliasi Points dan Transactions

Diproses sebelum cek saldo 1.11.1 dan sebelum payout bulanan. Yang dihitung hanya baris Transactions baru dari narator yang
berangka dan tidak menyebut "coin".
- **(a)** Points berubah, tidak ada baris baru → engine menambah baris `−15 (not itemised)`. Hanya pembukuan; uang tidak berubah.
- **(b) [?2]** Ada baris baru, tapi Points dan Coin tidak berubah → engine menerapkan jumlahnya ke Points. Kalau di update sebelumnya
  ada baris `(not itemised)` dengan jumlah yang sama, baris narator **menggantikannya** dan tidak menagih dua kali.
- **(c)** Keduanya berubah tapi jumlahnya beda → tidak diubah, hanya dicatat di `_Log`.

### H4 [?1]. Batas bawah Dove attention

Masalah: teknik tersembunyi dipakai di depan orang yang tidak tahu rahasianya, tapi narator tidak menaikkan Dove_attention.

Aturan: teknik dengan `Hidden: true` (atau true magic) dipakai lewat Casts atau Active baru, ada orang di Scene.Present yang tidak
ada di Known_by, dan Dove_attention tidak naik di update itu → +3 (angka terendah di rule 502). Kabut dan cuaca berat tetap
membaginya dua. Ini mengubah keseimbangan sihir tersembunyi, jadi owner yang memutuskan.

### Yang sengaja **tidak** dihitung otomatis
- **Talk dari dialog.** NPC yang bicara belum tentu mengobrol sungguhan dengan {{user}} ("Passing greetings add nothing").
  Menghitungnya otomatis bertentangan dengan prinsip anti-grind. Cukup pengingat (R6).
- **Training dari lokasi.** Berada di arena bukan berarti berlatih ("Being in the room alone is not participation"). Pengingat (R10).
- **Location dari prosa.** Menyebut tempat belum tentu berada di sana. Pengingat (R4).
- **Deed, Trust/Tension turun, Rep_events.** Semuanya butuh penilaian niat (rule "Judging a deed"), dan itu bagian narator.

---

## 2. Poin 5: pengingat dari prosa dan state

### Mekanisme umum
- Section engine baru **8l** (setelah Cast §8i, jadi bisa memakai `spoke` dan daftar hadir). Hasilnya `S.$ui.missed` = paling banyak
  **3** baris, urut prioritas R1 > R2 > R8 > R5 > R6 > R7 > R9 > R3 > R4 > R10.
- **Hanya pengingat.** Tidak ada angka yang berubah. Narator melaporkan di balasan berikutnya kalau memang terjadi; kalau tidak,
  pengingat diabaikan.
- Petunjuk yang sama (jenis + nama + hari) tidak diulang dalam 2 hari (`$eng.missed`), supaya narator tidak dikejar terus.
- Deteksi nama memakai `mentionIn` / `MENTION_DENY` yang sudah ada, jadi "Maple leaves…" tidak dihitung sebagai nama.
- **Pesan pemain** ikut dibaca (R5, R9). Hook mengambil pesan user terakhir yang tidak tersembunyi sebelum balasan dari
  `SillyTavern.chat` dan melewatkan pesan player-tool, lalu memberikannya ke `runEngine` sebagai parameter (engine tetap pure).
  **Cek live:** saat swipe dan setelah edit lewat Builder/Settings, pesan yang terbaca harus tetap pesan pemain.
- **Laporan susulan:** interaksi yang dilaporkan di update berikutnya juga berlaku untuk NPC yang hadir di update sebelumnya
  (hanya satu update), supaya gate "Scene.Present" di rank_gift dan rank-up tidak menggagalkannya kalau NPC sudah pergi.
- Toggle baru di Settings → Features: **Report reminders** (default ON). Biaya: 0 token kalau tidak ada yang muncul.

Blok `<now>` (English, 505):
> Possibly missed in the last update. Report it in this reply's update only if it truly happened; otherwise ignore it:
> - {{user}}'s Ember pouch left the Bag while Etnie was here: if it was a gift, report it; if it was used, report it in /Consumables.

### Daftar pengingat

| # | Sumber | Terpicu kalau | Baris `<now>` (English) |
|---|---|---|---|
| R1 | state | HP turun (bukan karena engine) dan tidak ada Injuries baru | `HP fell by N with no injury named: add it to Player.Injuries.` |
| R2 | state | Qty item di Bag turun atau item hilang, tanpa Consumables dan tanpa gift | Ada NPC hadir: `<item> left the Bag while <NPC> was here: if it was a gift, report it; if it was used, report it in /Consumables.` Tidak ada NPC dan item punya efek "When used": hanya bagian Consumables. |
| R3 | prosa | Frasa waktu ("an hour later", "hours later", "the next morning", "by evening", "after class", "that night"), tapi jam maju < 30 menit | `The prose moved time ("an hour later") but the clock moved N min: set World.Time to match.` |
| R4 | prosa | "arrives at / reaches / steps into / walks into / enters" + nama tempat di Campus Map, tapi Location tidak ke sana | `The prose has {{user}} arriving at <place>, but Location is <loc>: update it if {{user}} is there.` |
| R5 | pesan pemain / prosa | Nama teknik {{user}} (key `_Techniques`, minimal 5 huruf) muncul, tanpa Casts atau Active baru, dan tidak sedang aktif | `<technique> appears in the last exchange but was not charged: if {{user}} actually cast it, report it in /Magic/Casts.` |
| R6 | prosa | NPC dengan bond yang hadir bicara (`speakersIn`), tidak ada interaksi untuknya, dan hari itu belum ada talk | `<NPC> spoke with no interaction reported: if it was a real conversation with {{user}}, report talk (or hangout).` |
| R7 | prosa | Kata memberi ("gives / hands / offers / presents … gift / present", "a gift for") dan nama NPC hadir di kalimat yang sama, tanpa gift | `A gift to <NPC> may have happened: if so, report Kind gift with Item.` |
| R8 | prosa | Nama hadiah Rank 5 yang tertunda (`$gift_pending`), atau key perk sekali pakai, muncul tanpa rank_gift / Perk_use | `<gift> was mentioned: if <NPC> actually handed it over, report rank_gift.` / `<perk> was mentioned: if {{user}} spent it, insert it into /Perk_use.` |
| R9 | pesan pemain | "sorry / apologise / apologize / forgive me" dan NPC hadir dengan Tension ≥ 10, tanpa apology | `{{user}} may have apologised to <NPC>: if so, report Kind apology (the engine decides how much it eases).` |
| R10 | state + prosa | Waktu ≥ 50 menit di tempat latihan (daftar venue diambil dari data training/kelas Combat) dan prosa punya "train / drill / practice / spar", tanpa Training | `{{user}} may have trained at <place>: if it was a real session, report it in /Training.` |

R1 dan R2 hanya membaca state, jadi hampir tidak pernah salah. R3–R10 bisa salah, tapi karena hanya pengingat, akibatnya paling
buruk narator mengabaikannya.

Teks 502 (satu kalimat, di atas "Interactions"):
> When <now> lists something possibly missed, report it in this update only if it truly happened in the story.

---

## 3. Yang tetap jadi kelemahan

Trust/Tension yang turun karena perbuatan, Rep_events, deed (keep, secret, defend, confide, help), Known_facts, Knows, Mind,
Imprints, Journal dan Secrets_revealed tidak bisa dideteksi dengan andal dari teks. Semuanya butuh penilaian. Mitigasinya tetap:
model narator yang kuat, pemain menyebut kejadian dengan jelas, dan audit offline (§4).

---

## 4. Tahap 0 (disarankan sebelum implementasi): ukur dulu

`tools/audit_reports.cjs <chat.jsonl>`: menjalankan fungsi deteksi yang **sama** dari engine (diekspor, bukan disalin ke Python)
pada chat yang diekspor. Hasilnya jumlah dan contoh per jenis (R1–R10), untuk melihat mana yang benar-benar sering terlewat dan mana
yang banyak salah deteksi. Pola yang terlalu berisik dibuang sebelum rilis.
- Deteksi prosa (R3–R9) cukup dari teks pesan.
- R1, R2 dan R10 butuh variabel per pesan. **Cek dulu** apakah `.jsonl` SillyTavern menyimpan variabel MVU per pesan; kalau tidak,
  tahap 0 hanya mengukur deteksi prosa.

---

## 5. Implementasi (setelah approve)

- Tulis save fixture 1.11.3 dulu (`node tests/fixtures/make_save.cjs`).
- `src/scripts/engine.template.js`: H1 (§4), H2 (§4b), H3 (sebelum cek saldo 1.11.1), H4 kalau disetujui (§7), section 8l,
  parameter `userText` dan hook-nya.
- `src/scripts/schema.js`: `Resting` + `awake`; `$ui.missed`, `$eng.missed`.
- `src/worldbook/custom/content/502.txt`: teks H1, H2, satu kalimat pengingat. `505.template.ejs`: blok `<now>`.
- `data/features.json`: feature `reminders`; biaya diukur ulang oleh `feature_cost.py`.
- Test baru `tests/test_reports_v1120.cjs`: setiap H dan R terpicu dan tidak terpicu (termasuk "Maple leaves", all-nighter dengan
  `awake`, gift yang dilaporkan terlambat, tidak ada tagihan ganda di H3b), replay dan swipe menghasilkan pengingat yang sama.
- Rebuild dist, TEST cards, CHANGELOG, HANDOFF, `docs/TEST_CHECKLIST.md` (cek live pesan pemain saat swipe, dan apakah narator
  mengikuti pengingat tanpa melapor berlebihan).

Perkiraan token: 502 bertambah bersih sekitar +20. `<now>` 0 kalau tidak ada yang muncul, sekitar 25 + 20 per baris kalau muncul.

## 6. Default yang diambil sendiri

- Pengingat tidak pernah mengubah angka; paling banyak 3 per update; petunjuk yang sama tidak diulang dalam 2 hari.
- Report reminders default ON.
- R6 hanya untuk NPC yang sudah punya bond (bond baru tetap dibuat dari Scene.Present seperti sekarang).
- Laporan susulan diterima satu update untuk NPC yang hadir di update sebelumnya.
- H1 hanya berlaku untuk malam (00:00–06:00), tidak untuk tidur siang.

## [?] Keputusan untuk owner

- **[?1] H4 batas bawah Dove attention:** terapkan (+3 kalau teknik tersembunyi dipakai di depan orang yang tidak tahu, dan narator
  tidak menaikkannya), atau biarkan sepenuhnya di tangan narator?
- **[?2] H3 bagian (b):** engine boleh menagih Points dari baris Transactions yang ditulis narator tanpa mengubah Points? Atau cukup
  pengingat saja?
- **[?3] Urutan kerja:** Tahap 0 (ukur di chat yang sudah ada) dulu, baru rilis 1.12.0? Atau langsung rilis semuanya?
