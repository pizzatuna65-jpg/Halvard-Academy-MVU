# DRAFT — Year 2: celah canon setelah bug hunt (1.7.4)

Status: **sudah diputuskan owner (2026-09-27)**; yang diterapkan ada di rilis 1.7.4 (PROGRESS 1.7.4). Bug hunt / stress test "apa
yang terjadi ketika user mencapai Year 2". Catatan dalam bahasa Indonesia; teks card dalam bahasa Inggris.

---

## Keputusan owner dan apa yang dilakukan

| # | Topik | Keputusan owner | Di card (1.7.4) |
|---|---|---|---|
| 1 | Etnie (canon: sengaja gagal tahun ketiga agar tetap di samping {{user}}) | **Etnie tetap tinggal** | `data/cohorts.json` `stays`: tidak ikut lulus; roster "repeating"; Cast Sheet "Year 3 student"; story tetap bisa meluluskan dia. Menyentuh HANDOFF §4 "Graduation" (disetujui). |
| 2 | Student Council tanpa President/VP di Year 2 (Irene dan Caspian lulus) | Nanti: **event pemilihan President**, dan **Student Council bisa jadi club pilihan {{user}}** | Belum dibuat; dicatat sebagai rencana (PROGRESS "Next", HANDOFF §8). |
| 3 | Guru {{user}} di Year 2/3 yang belum ada di canon | **Kosong dulu, narator yang membuat** | `<now>`: "teacher not on record: create one, and keep them the same person every lesson" (Extras mencatatnya sejak kemunculan kedua). |
| 4 | Cohort Year 3 kosong | (pertanyaan owner, lihat catatan di bawah) | Tidak ada perubahan. |
| 5 | Tim akademi rival | **Third-year rival ikut lulus**; tim Year 2 tanpa mereka; NPC baru nanti | Role line rival mengikuti tahun kampanye (tahun sekolah, umur); setelah tahun ketiga entry-nya "Now: graduated … no longer on its team"; entry tim menyebut siapa yang sudah lulus dan bahwa akademi mengisi tempatnya (belum ada NPC). |
| 6 | Peringkat asrama (Gareth #1, Sophia #2 lulus) | **Biarkan** | Tidak ada perubahan. |
| 7 | Setelah Year 3 ({{user}} lulus) | **Biarkan kosong dulu** | Engine tidak menaikkan {{user}} melewati Year 3; log bilang story yang menentukan. |

### Catatan untuk no. 4 (cohort Year 3)
`data/cohorts.json` `"3"` hanya berisi **first-year baru** yang datang di Year 3. NPC cohort 2 (Linus, Maple, Nerys, Hadrian, Wren,
Tsubaki) otomatis naik jadi second-year di Year 3; itu sudah jalan (roster, Cast Sheet, dossier). Jadi di Year 3:
- third-year: angkatan {{user}} (Aiden, Trixie, Caralynn, Zara, Percival, Vera, Castor, Alyssa) plus Etnie yang mengulang;
- second-year: cohort 2;
- first-year: **belum ada NPC bernama**. Journal tetap menulis "a new class of first-years arrived", dan narator boleh mengarang
  (Extras). Kalau owner mau adik kelas bernama di Year 3, itu cohort 3 dengan playbook yang sama seperti cohort 2 (HANDOFF §6).

## Yang dibangun tanpa perlu canon baru (1.7.4)
- Tanggal membawa tahunnya dari Year 2 ("Y2 M1 W1 Mon"); baris Year 1 diberi "Y1" saat pergantian tahun.
- {{user}} naik kelas otomatis (story bisa menahan); rekor Competition tahun lalu dihapus (Journal menyimpannya).
- Umur NPC Halvard dan rival mengikuti tahun kampanye; {{user}} bertambah umur di hari ulang tahunnya.
- Entry lulusan diawali "Now: graduated"; "Current trouble" Royhan hanya di Year 1.
- `<now>` menyebut tahun kampanye dan cara membaca lore yang ditulis untuk Year 1; Entrance Event di Year 2 untuk first-year baru.

## Masih terbuka (untuk nanti)
- `[?]` Event pemilihan Student Council President: kapan, siapa kandidatnya, dan aturan Student Council sebagai club.
- `[?]` Anggota baru tim rival untuk Year 2 (dan Year 3).
- `[?]` Cohort 3 (opsional).
