# DRAFT — Year 2: celah canon setelah bug hunt 1.7.1

Status: **menunggu keputusan owner.** Hasil bug hunt / stress test "apa yang terjadi ketika user mencapai Year 2" (2026-09-27).
Perbaikan kode, UI dan engine sudah masuk di rilis 1.7.1 (PROGRESS 1.7.1). File ini hanya berisi hal yang **butuh canon baru** atau
**menyentuh keputusan yang sudah ditetapkan**; tidak ada yang di bawah ini ditulis ke lore sebelum owner bilang "approve".
Catatan dalam bahasa Indonesia; teks yang nanti masuk card dalam bahasa Inggris. Keputusan terbuka ditandai `[?]` dan dikumpulkan di akhir.

---

## 1. Sudah diterapkan di 1.7.1, perlu dikonfirmasi

### 1a. Etnie tidak ikut lulus (menyentuh HANDOFF §4 "Graduation", v1.0.3)
Canon Etnie (`<narrator_only>Goals (true)`): *"Fail her third year on purpose, so she can stay at Halvard beside {{user}}."*
Sampai 1.7.0 engine otomatis meluluskan semua third-year pada M12 W1 Mon, termasuk Etnie, jadi mekanik memaksa dia bertindak
berlawanan dengan karakternya (melanggar prinsip owner "a mechanic must never force an NPC to act against their personality").
1.7.1: `data/cohorts.json` → `stays: {"Etnie": ...}`. Engine tidak mengirim Etnie pergi; log (yang juga dilihat pemain) hanya
bilang dia tinggal untuk tahun ketiga lagi "(her lore says why)", tanpa membuka rahasianya. Di Year 2 roster menulis dia
"repeating", Cast Sheet "Year 3 student". Story tetap bisa meluluskan dia (tambahkan nama ke `Campus_State.Graduated`).
- `[?]` Setuju Etnie default-nya tinggal? Kalau tidak, cukup hapus baris `stays` di `data/cohorts.json`, lalu rebuild.
- `[?]` Apakah Baelin mengizinkan dia mengulang tahun ketiga (dia sudah pernah mengulang tahun kedua)? Kalau perlu, satu kalimat
  canon untuk entry Etnie, contoh: *"From Year 2: repeating her third year; Baelin allowed it once more, on the condition that she
  attends class."* (hanya contoh; belum ditulis).

### 1b. {{user}} naik kelas otomatis (menyentuh "Design decisions pending: Player lifecycle", HANDOFF §8)
Sampai 1.7.0 engine hanya menulis log "update Player.Profile.Year if {{user}} moved up". Kalau narator lupa, `<now>` memberi
{{user}} teman sekelas dan guru first-year (Linus, Maple, … di kelas yang sama). 1.7.1: pada tahun kampanye baru engine
menaikkan `Player.Profile.Year` (+ Journal "Began Year 2 at Halvard."), kecuali narator sudah mengubahnya di update yang sama;
story bisa menahan {{user}} (set balik), engine tidak menaikkan lagi. Third-year tidak dinaikkan.
- `[?]` Setuju? Kelulusan {{user}} sendiri (akhir Year 3) masih belum dimodelkan: `[?]` apa yang terjadi di Year 4?

### 1c. Umur ikut tahun kampanye
Umur di lore (`Age: 20`, `Age 39`) sekarang = umur di Year 1 (cohort 2: di Year 2) + tahun yang sudah lewat, di entry, Cast Sheet
dan dossier. Tim akademi rival **tidak** ikut menua (lihat 2c). {{user}} bertambah umur di hari ulang tahunnya.
- `[?]` Setuju umur NPC naik per tahun kampanye (bukan per ulang tahun; NPC tidak punya tanggal lahir)?

---

## 2. Celah canon yang muncul di Year 2 (belum ada isinya)

### 2a. Student Council tanpa pimpinan
Irene (President) dan Caspian (Vice President) sama-sama third-year, jadi keduanya lulus di akhir Year 1. Lore uid 6: "elected yearly".
Di Year 2 roster tidak punya President/VP, dan tidak ada event pemilihan di kalender.
- `[?]` Siapa President dan VP di Year 2 (dan Year 3)? Kandidat alami dari second-year Year 1 (sekarang third-year): Dante (lawful,
  Light), Kanae, Saffi, Lenna, Florian, Idris, Tilly.
- `[?]` Kapan pemilihannya? Usul: Month 1 Week 2 (setelah Entrance Event), satu baris di kalender (uid 134) dan EVENTS engine.

### 2b. Guru {{user}} di Year 2 dan Year 3
Aturan roster: tiap guru mengajar satu mata pelajaran untuk satu angkatan saja. Yang diketahui untuk Year 2: Magic Theory Y2 = Ezrel;
Year 3: Etiquette Y3 = Ottavio. Tidak diketahui: Etiquette Y2, History Y2-3, Combat Y2-3, Creature Studies Y2-3, Potion Crafting Y2-3,
Magic Theory Y3. Akibatnya di Year 2 `<now>` menulis "teacher not on record" untuk hampir semua kelas {{user}}.
- `[?]` Tulis guru-guru ini (NPC baru, atau cukup nama + satu baris sifat), atau biarkan narator mengarang (jadi Extras)?

### 2c. Tim akademi rival
Kapten Myrdath dan Veyra, serta anggota third-year Ashvale, lulus di akhir Year 1 menurut logika yang sama, tapi lore mereka tetap
("Third year, age 20", "captain of …") dan Kingdom Competition Year 2 akan memakai tim yang sama.
- `[?]` Tim rival di Year 2: anggota third-year diganti siapa? Atau cukup satu kalimat: "their third-years graduated; the academy
  fields a new team" dan narator mengisi?

### 2d. Peringkat asrama
Roster: Gareth #1 dan Sophia #2 (Fire), Florian #3. Gareth dan Sophia lulus. `[?]` Siapa di puncak di Year 2? (Florian naik?)

### 2e. Tidak ada first-year baru di Year 3
`data/cohorts.json` `"3": []`. Di Year 3 journal tetap menulis "a new class of first-years arrived", tapi tak ada NPC bernama; cohort 2
menjadi satu-satunya adik kelas yang punya lore. `[?]` Rencana cohort 3?

### 2f. Kalimat lore yang hanya benar di Year 1
Contoh: Royhan "This year is his last chance" (1.7.1: bagian "Current trouble" sekarang hanya tampil di Year 1), Ruby "Get through her
last year", Caralynn "Top of the first-year Fire ranking", Alyssa "A first-year with a Spirit Lord pact", Vera "a first-year",
"Age: 18, {{user}}'s year", dll. 1.7.1 menambahkan satu baris di `<now>` (hanya dari Year 2): lore menyebut first-/second-/third-year
dan "this year" menurut tahun NPC diperkenalkan; tahun sekolah sekarang ada di roster; umur di lore sudah terbaru; lulusan sudah pergi.
Entry lulusan sendiri kini diawali "Now: graduated; has left Halvard". Cukup untuk narator; kalau owner mau, NPC tertentu bisa dapat
varian Year 2 per kalimat seperti gerbang tanggal Royhan (D18). `[?]` Perlu varian khusus untuk NPC tertentu?

### 2g. Lain-lain
- Potret cohort 2 masih belum ada (PNG owner → `tools/process_assets.py` → manifest).
- Klub: anggota klub yang lulus sudah tidak muncul (UI dan `<now>` menyaringnya). Tidak ada ketua klub di lore yang lulus selain Council.

---

## Keputusan terbuka
1. `[?]` Etnie default tinggal di Year 2 (1a)? Dan izin Baelin untuk mengulang lagi?
2. `[?]` {{user}} naik kelas otomatis (1b)? Apa yang terjadi setelah Year 3?
3. `[?]` Umur NPC naik per tahun kampanye (1c)?
4. `[?]` Pimpinan Student Council Year 2/3 dan waktu pemilihan (2a).
5. `[?]` Guru Year 2/3 (2b).
6. `[?]` Tim akademi rival Year 2 (2c).
7. `[?]` Peringkat asrama Year 2 (2d).
8. `[?]` Cohort Year 3 (2e).
9. `[?]` Varian lore Year 2 untuk NPC tertentu (2f).
