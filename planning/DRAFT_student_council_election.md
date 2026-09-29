# Draf FP2 — Student Council Election

Status: **diterapkan pada card v1.7.8 (2026-09-27).** Month 10 Week 3 adalah election week Senin–Sabtu: kampanye Senin–Kamis, debat Jumat setelah kelas di Seminar Rooms, dan pemilihan Sabtu di Main Courtyard menggantikan club block. Florian vs Dante untuk President; pemenang memilih kandidat yang kalah sebagai VP. Florian/Dante ber-club Student Council saja sejak hari pertama (bukan Tea Club/Groundskeeping).

## Tujuan dan kandidat

Pemilihan di akhir Year 1 memilih penerus Irene Chanare dan Caspian Riwalo **untuk Year 2**. Irene dan Caspian tetap President dan Vice President aktif sampai kelulusan Year 1 Month 11 Week 4 Sunday. Gelar `-elect` hanya menunjukkan penerus; tidak memberi wewenang jabatan sebelum Year 2 Month 1 Week 1.

**Florian Villeneuve (Sky) dan Dante Kleinn (Light)** adalah NPC second-year pada Year 1. `Club` mereka **Student Council saja** sejak awal kampanye, dengan pertemuan club biasa pada Saturday 13:00–16:00 di Student Council Chamber. **Pengecualian M10 W3 Sat:** seluruh club block diganti pemilihan di Main Courtyard, termasuk pertemuan Council; pertemuan normal kembali pada Sabtu berikutnya. Florian bukan anggota Tea Club; Dante bukan anggota Groundskeeping. Keanggotaan ini tidak memberi mereka jabatan President/VP pada Year 1; Irene dan Caspian tetap pemimpin. Florian mengejar panggung dan pengaruh, tetap arogan serta hemat ketulusan. Dante menekankan aturan dan keselamatan siswa, tanpa melunakkan sikapnya terhadap orang yang ia anggap melanggar. Afiliasi Dove milik Dante tetap rahasia dari siswa.

Student Council mempunyai President, Vice President, dan anggota dari empat asrama. **Tidak ada lore yang membatasi jumlah anggota atau kursi keanggotaan.** Entry Chamber uid 68 menyebut enam kursi fisik di ruangan kecil; itu deskripsi perabot, bukan batas keanggotaan ataupun hak suara. Florian dan Dante adalah anggota Council Year 1 tanpa jabatan President/VP; hak suara internal Council tidak perlu ditetapkan untuk draf election ini. Cara {{user}} bergabung masih bagian FP3. Irene tetap punya hubungan dengan Library Assistants dan Caspian dengan Festival Committee; jabatan Council mereka sudah ada dan tidak perlu memindahkan club lama tanpa keputusan owner.

Kedua anggota Council tersebut **bersaing untuk President**; pemenang menjadi President-elect dan **memilih kandidat yang kalah sebagai Vice President-elect** setelah hasil diumumkan. Pilihan VP adalah keputusan President, bukan hasil surat suara terpisah. Lore Irene saat ini menyebut Caspian terpilih dan bukan dipilih oleh Irene; baris tersebut bertentangan dengan aturan baru dan harus disesuaikan saat implementasi. Tidak perlu menetapkan bahwa Caspian juga pernah kalah dalam pemilihan; cukup tulis bahwa Irene mengangkatnya sesuai aturan yang baru. Suara {{user}} adalah satu suara, bukan penentu hasil otomatis. Jika nanti {{user}} boleh mencalonkan diri, desain dua kandidat dan pilihan VP harus ditinjau ulang; ini berkaitan dengan FP3.

## Usulan entry event (English; mengikuti format event lain)

```text
[Student Council Election]
When: Month 10 Week 3, Monday through Saturday. The week chooses next year's Student Council President and Vice President.
Campaign, Monday–Thursday: Classes run as usual. The two named nominees, serving Council members since the start of the school year, campaign outside class: conversations across the dorms, brochures, posters, and public promises. The sitting President and Vice President oversee the process; campaigning does not transfer their authority.
Year 1 nominees: Florian Villeneuve of Sky Dormitory and Dante Kleinn of Light Dormitory, both second-years and serving Council members. Florian promises visible results and stronger club support; Dante promises consistent rules and safer students. Neither abandons his established character to win votes.
Debate, Friday: Classes run as usual. After the last class, 16:00–18:00, Florian and Dante debate in the Seminar Rooms before students. Irene and Caspian oversee the debate; both nominees answer questions in their own voices.
Voting, Saturday: Morning Etiquette and Study Hall run as usual. The 13:00–16:00 club block is replaced academy-wide by the election in the Main Courtyard; no club holds its ordinary meeting that afternoon. Each student casts one private vote for President. The candidate with more votes becomes President-elect.
Results, Saturday: After voting closes and ballots are counted, the result is announced in the Main Courtyard. The President-elect then names the losing candidate Vice President-elect. The result follows the campaign and the votes; {{user}}'s ballot is one vote, not an automatic deciding vote.
Handover: Irene Chanare remains President and Caspian Riwalo remains Vice President through Graduation in Month 11 Week 4. The incoming President and chosen Vice President take office at the start of Month 1 Week 1 of the following school year.
Later years: The election recurs in Month 10 Week 3. Use eligible, already named students who will still attend next year; do not invent anonymous opponents or let graduates run.
```

## Usulan teks perubahan lore utama (English)

Ini adalah baris baru/pengganti untuk ditinjau, bukan seluruh entry NPC. Detail penampilan, magic, backstory, secret, dan hubungan lain yang sudah ada tetap dipertahankan.

**Council uid 6 — ganti seluruh entry pendek saat ini:**

```text
The Student Council meets as a club on Saturdays, 13:00–16:00, in the Student Council Chamber. It has a President, a Vice President, and members from each of the four dorms; its membership has no fixed cap. Together they handle club administration, events, student discipline, cross-dorm mediation, and the work of speaking for students to staff.
The President is elected each year in Month 10 Week 3: campaigning runs Monday through Thursday, the nominees debate after Friday classes in the Seminar Rooms, and voting in the Main Courtyard replaces Saturday's club block. After the result, the President-elect names the losing candidate as Vice President-elect. The serving President and Vice President keep their authority through Graduation; their successors take office at the start of the next academic year. Council membership alone grants neither disciplinary immunity nor executive authority.
```

**Florian uid 250 — tambah baris dan perluas Club/Haunts:**

```text
Student Council: A member since the first day of the school year. He handles public-facing club requests and wants everyone to see the results. Caspian can get him to listen; Irene still has the final word. Membership has not made him humble or sincere on demand.
Club: Student Council.
Haunts: Student Council Chamber, the Combat Grounds whenever Gareth has booked a ring, The Snug's largest booth, the Mall, the Sky Dormitory common room, the Noble Houses' Liaison for tea.
```

**Dante uid 128 — tambah baris dan perluas Club/Haunts:**

```text
Student Council: A member since the first day of the school year. He handles complaints that involve rules or younger students and records what happened even when he likes the student involved. Council safety rounds give him an official reason to be at the Forest edge at dusk. The Council does not know his connection to the Doves.
Club: Student Council.
Haunts: Student Council Chamber, Forest edge, Dovecote. He still finds the Taken superstition useful for keeping students in near curfew.
```

**Irene uid 98 / Caspian uid 99 — ubah hanya baris yang berbenturan:**

```text
Irene Relations: Caspian Riwalo, her Vice President from the Viridian Dormitory: she named him after her election under Council rules; his rule-bending still grates on her. [Keep the rest of the existing Relations line.]
Irene Club: Library Assistants. [Unchanged.]
Caspian Club: Festival Committee. [Unchanged.]
```

Saat hasil pemilihan Year 1 sudah tercatat, entry Florian/Dante menampilkan `President-elect` dan `Vice President-elect` menurut hasil, lalu `President` dan `Vice President` sejak Year 2. Teks Year 1 Irene/Caspian tetap menyebut jabatan mereka yang aktif; setelah lulus, baris yang menyebut jabatan menjadi sejarah. Roster dan UI mengambil status yang sama, tanpa menebak pemenang dari urutan nama.

## Peta perubahan entry dan data setelah persetujuan

| Sumber | Perubahan yang direncanakan |
|---|---|
| Lore Student Council uid 6 | Tegaskan President dipilih tahunan, VP diangkat President, dua pemimpin lama berwenang sampai kelulusan, dan anggota dari empat asrama tanpa batas jumlah. Rapikan tata bahasa entry lama; jangan menambah aturan hak suara yang belum ada. |
| NPC uid 128 Dante dan uid 250 Florian | Ganti `Club:` masing-masing menjadi **Student Council saja** sejak Year 1 Month 1 Week 1; hapus klaim Florian menjalankan Tea Club dan klaim Dante anggota Groundskeeping. Tambah tugas Council, Chamber sebagai haunt, serta motivasi mencalonkan diri. Jaga secret Dove Dante dan kepribadian Florian. |
| NPC uid 98 Irene dan uid 99 Caspian | Pertahankan seluruh Year 1 sebagai pejabat aktif; ganti baris "Caspian elected, not chosen by Irene" karena kini VP diangkat President. `Club:` pribadi mereka tetap Library Assistants/Festival Committee; jabatan Council adalah tanggung jawab terpisah. Setelah kelulusan, entry tetap berbicara tentang masa jabatan sebagai sejarah. |
| Roster uid 97, Chamber uid 68, Regulars uid 287/290/313, peta uid 132 | Roster mengenali Florian/Dante sebagai anggota Council. Deskripsi enam kursi **fisik** Chamber boleh tetap, tanpa dijadikan batas anggota. Regulars menghapus Florian dari Club Rooms dan Dante dari Groundskeeper's Lodge, lalu menambah keduanya ke Chamber. Peta menaruh Student Council di Chamber. Jangan tulis label President/VP statis untuk Year 2 karena pemenangnya belum ditetapkan. |
| Entrance Event uid 21 dan kalender uid 134 | Booth Council hanya ditambahkan bila FP3 mengizinkan player mendaftar di minggu pertama. Kalender mencatat seluruh M10 W3 Mon–Sat: kampanye Senin–Kamis, debat Jumat setelah kelas di Seminar Rooms, dan pemilihan Sabtu di Main Courtyard menggantikan club block. |
| `data/locations.json`, `data/factions.json`, `tools/common.py` | Chamber mendapat club Student Council dan dua regular baru; faction Council mendapat Florian/Dante; helper menamai club **Student Council** (bukan "Student Council Club"). Tea Club dan Groundskeeping masih ada sebagai club, tetapi tanpa Florian/Dante sebagai anggota. |
| `data/npcs.json`, `data/npc_canon.json`, UI, `<now>` | Data NPC hasil kurasi mengikuti lore; voice scene Florian di Tea Club pindah ke Chamber; prop kunci Lodge dan sarung tangan Groundskeeping Dante diganti dengan kartu serta berkas Council. Activities/Connections menampilkan Florian/Dante di Council pada Sabtu biasa; M10 W3 mereka berada di pemilihan Courtyard. Label jabatan di dossier/roster/Now mengikuti hasil pemilihan dan tahun. |

Sumber yang diedit saat implementasi adalah lore canon di `source_original/npc_lore_2026-09-25/` dan pipeline `tools/merge_lorebooks.py`, serta data/template terkait. `src/worldbook/content/`, `data/npcs.json`, `data/locations.json`, script hasil generator, dan `dist/` dibangun ulang; jangan disunting manual.

### Reward Rank 5 / Rank 10

| NPC | Rank 5 | Rank 10 |
|---|---|---|
| Florian | **Tetap:** token The Snug adalah hadiah pribadi dari kekayaannya, tidak bergantung pada Tea Club. | Efek tempur Hades tetap. Perjelas "the first time he has followed anyone" menjadi **"the first time he has followed anyone's lead in a fight"** agar perannya di bawah Irene/Caspian sejak Year 1 tidak bertabrakan. |
| Dante | **Ganti:** kunci Groundskeeper's Lodge tidak lagi masuk akal ketika ia bukan anggota Groundskeeping. Usulan hadiah **Council safety card** yang menjamin laporannya dicatat, bantuan pengawalan saat bahaya, dan proses resmi; bukan izin melanggar jam malam. | **Tetap:** ia melindungi {{user}} dan tetap melaporkan pelanggaran mereka; jabatan Council tidak memberinya wewenang menghapus aturan. |
| Irene | **Tetap:** Council pardon sekali pakai. | Jika FP3 membuat {{user}} bisa bergabung dengan Council, teks tawaran kursi Council saat ini perlu ditinjau agar hadiah tetap berguna bagi {{user}} yang sudah menjadi anggota. Hak suara atau hierarki anggota belum ditetapkan oleh draf ini; perlindungan barrier dan sikapnya terhadap Doves tetap. |
| Caspian | **Tetap:** badge Festival Committee. | Efek Amplification dan advokasi Council tetap selama ia menjabat. Aturan reward lulusan yang ada sudah menghentikannya setelah ia meninggalkan Halvard. |

Keanggotaan Council sejak hari pertama **bukan** reward bond Florian/Dante. Jangan memberi akses, kekebalan disiplin, atau kuasa politik kepada {{user}} hanya karena Rank 5/10 dengan mereka. `data/bond_events.json` saat ini tidak memiliki event tertulis, sehingga tidak ada event Rank 5/10 khusus yang perlu diganti. Bila teks `data/bond_rewards.json` diubah, `_Perks` yang sudah diperoleh dalam save lama menyimpan salinan teks lama; engine perlu migrasi kecil untuk nama perk terkait.

**Usulan teks pengganti Rank 5 Dante (English):**

```text
Name: Council safety card
Effect: A signed Student Council safety card bearing Dante's name and a copy number in the Council log. If {{user}} is in danger, stranded after curfew, or accused of breaking a rule, they can show it to a campus patrol or bring it to the Council Chamber. Dante takes their account into the record, arranges a safe escort or a formal hearing as the case requires, and makes sure the account reaches staff unchanged. The card is not a curfew pass or a pardon: he asks for the truth and reports any rule {{user}} did break.
```

Rank 10 Dante tetap jauh lebih personal: ia sendiri berdiri melindungi {{user}}, termasuk ketika Doves melampaui aturan. Reward Rank 5 baru tidak membuka rahasia afiliasi Dove-nya.

### Engine, state, dan UI

1. Tambah **election week M10 W3 Mon–Sat** ke `EVENTS` pada `src/scripts/engine.template.js`; kalender UI mengambil sumber yang sama. Fase kampanye Senin–Kamis berjalan di luar kelas, debat Jumat 16:00–18:00 di Seminar Rooms, pemilihan Sabtu 13:00–16:00 di Main Courtyard, lalu hasil setelah penghitungan. Event hanya mengumumkan penerus, tidak memberi jabatan aktif otomatis saat pemungutan suara dimulai.
2. Tambah state Council yang tampak oleh narator (misalnya `Campus_State.Council`: pejabat aktif, kandidat, hasil per tahun, President-elect, VP-elect) di `src/scripts/schema.js`, plus bentuk awal dan pengisian save lama di engine. Year 1 dimulai dengan Irene/Caspian aktif dan Florian/Dante anggota. State boleh merekam hasil setelah diumumkan; jangan mengundi ulang pada refresh, swipe, atau load save.
3. Narator melaporkan **siapa yang menang** setelah pemungutan suara. Engine memvalidasi bahwa pemenang adalah Florian atau Dante untuk pemilihan Year 1, mencatat hasil tepat sekali, dan menetapkan kandidat lain sebagai VP-elect sesuai keputusan owner. Satu suara {{user}} tidak langsung menentukan seluruh hasil. Jika event dilewati, hasil bawaan perlu diputuskan sebelum implementasi agar Year 2 tidak kosong.
4. Irene/Caspian tetap pejabat aktif sampai Graduation Year 1 M11 W4 Sun. Month 12 adalah libur tanpa Council aktif di kampus. Pada Year 2 M1 W1, engine mengaktifkan pasangan penerus yang tercatat; siapa pun pemenangnya harus terbaca sama di `<now>`, lore kondisional, roster, dossier, dan Connections. Lulusan tidak muncul sebagai anggota aktif.
5. UI `tools/gen_ui.py`, `src/ui/parts/10_people.js`, `src/ui/parts/40_activities.js`, dan `src/worldbook/custom/505.template.ejs` membutuhkan tampilan status dinamis. Florian dan Dante masing-masing hanya punya satu `Club`: Student Council. `Player.Profile.Club` yang tunggal tidak diubah sampai aturan FP3 untuk {{user}} diputuskan. Tidak perlu menambahkan batas anggota atau sistem kursi untuk FP2.
6. Council memakai jadwal club **Saturday 13:00–16:00** yang sudah ada pada pekan biasa. `tools/common.py` diberi nama khusus `Student Council`, `data/locations.json` menempatkannya di Chamber, dan `Club:` Florian/Dante diganti. **M10 W3 Sat adalah pengecualian untuk semua club:** kegiatan club 13:00–16:00 ditimpa event pemilihan di Main Courtyard, bukan sekadar Council tidak hadir. Attendance/reward club tidak boleh diberikan untuk slot itu. Saturday morning tetap mengikuti jadwal kelas biasa.
7. Pemilihan tahun berikutnya memakai kerangka yang sama, tetapi perlu kandidat bernama dari roster tahun itu. Florian dan Dante tidak boleh dicalonkan lagi setelah mereka lulus pada akhir Year 2. Tidak perlu mensimulasikan ribuan surat suara atau membuat NPC kandidat anonim.

Saat implementasi, cukup pemeriksaan singkat yang relevan: fase kalender M10 W3 Mon–Sat, debat di Seminar Rooms, seluruh club block M10 W3 Sat terganti pemilihan di Courtyard tanpa attendance/reward club, hasil hanya tersimpan sekali, pergantian Year 1→2, konsistensi dua kemungkinan pemenang, dan save lama. Tidak ada rangkaian stress test untuk draf ini.

## Keputusan implementasi

- Rank 5 Dante diganti menjadi **Council safety card**; perk dari save lama dimigrasi.
- FP3 (cara {{user}} mendaftar ke Student Council) tetap rencana terpisah. Perubahan ini menempatkan Florian dan Dante sebagai anggota sejak awal tanpa menambahkan booth pendaftaran untuk {{user}}.
- Jika Year 1 dilewati tanpa hasil pemilihan, hasil bawaan pada Year 2 adalah Florian sebagai President dan Dante sebagai Vice President. Hasil yang dimainkan dan dicatat setelah pemungutan suara mengungguli bawaan tersebut.
- Debat memakai Seminar Rooms sesuai nama lokasi canon.
