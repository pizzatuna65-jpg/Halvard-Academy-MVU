# DRAFT — Kerangka event dan modul Contest

Dicatat: 2026-10-21, atas permintaan owner ("setiap bulan ada tanggal istimewa ... di tournament ada ui bracket, atau event yang
memiliki tujuan nanti ada ui quest/objective"). Jawaban yang disepakati di chat: satu kerangka event yang dipakai semua event,
ditambah modul per **jenis** event; modul khusus satu event hanya kalau event itu punya keputusan yang tidak ada di event lain.

**Status:** disetujui owner ("proceed", 2026-10-21; diam = setuju untuk §10: pertanyaan 1 = engine, pertanyaan 2 = usulan (a) + (c),
teksnya di §10). **Rilis A1 selesai di 1.81.0, A2 di 1.82.0, B di 1.83.0; Kingdom dan pilihan World (bagian dari C) di 1.84.0.** Berikutnya C (`tally`, Academy/Kingdom/World) sebelum Sports Day M6 W3. Draf ini dihapus setelah rilis E. Dibangun bertahap (§7), tiap rilis siap sebelum event pertamanya di kampanye
Charles (sekarang Y1 M1 W1). Pilihan yang wajar sudah diputuskan di draft ini; yang benar-benar terbuka ada di §10.
Owner 2026-10-21: bagian kompetisi tidak ada masalah; tujuh celah event lain (§4) ditambahkan atas permintaan owner.

## 0. Ringkasnya

1. **Kerangka event** (§2): event di `data/calendar.json` dapat `id` dan `kind`; satu baris event di `<now>`; tab **Event** di
   Activities; **peluang** (chances) opsional per event, terdeteksi dari laporan yang sudah ada, berhadiah lewat sistem yang sudah
   ada; happenings khusus event lewat `data/happenings.json`.
2. **Modul Contest** (§3): bracket yang **dihitung, tidak disimpan** (fungsi murni dari seed, tahun, tier, dorm, role) di
   `shared.js`, dipakai engine dan UI. Format: `knockout`, `heats`, `paired`, `vote` (rilis A2), `tally` (rilis C). Pertama untuk
   Dorm Competition, lalu Academy dan Kingdom Competition.
3. **Event lain** (§4), urut tanggal: stand event sebagai baris toko, undian Fools Day, rencana libur, penilaian Fair, beat Thinning,
   kunjungan keluarga, dan treasure hunt Founder Day (satu-satunya modul khusus satu event).
4. Yang **tidak** dibuat: sistem quest terpisah, log misi wajib, pengingat untuk peluang, atau hasil {{user}} yang dihitung engine.

## 1. Yang sudah ada dan dipakai ulang

Memori `reuse-existing-systems`: setiap bagian di bawah memakai fungsi ini, bukan salinannya.

| Kebutuhan | Sudah ada | Dipakai untuk |
|---|---|---|
| Hari dan jam event | `eventsOn(P)`, `schedOf`, `World._Event_today`, `s` di `calendar.json` | baris event, tab Event |
| Event berikutnya | `p40:eventDay`, `p40:daysTo`, `whenLabel`, `p30:datedItems` | tab Event, unlock |
| Aturan saat berlaku | `ruleCards` (`competition` sudah ada), `WB511` | teks aturan Contest |
| Undian ter-seed | `sh:rollTable`, `sh:pickOf`, `sh:rollInt`, `sh:roll100` | bidang peserta, hasil NPC |
| Hasil kompetisi | `Competition` (Tier, Status, Placement, Team, Results), `stepClubLife`, `DORM_PRIZE`, `KINGDOM_PRIZE`, `REP.competition`, `teamBond` | jalur {{user}}, hadiah (angka tidak berubah) |
| Role tempur {{user}} | `Player.Profile.Combat_role`, `sh:classRoleOf`, `ROLES5` | bracket {{user}} |
| Role tim rival | `npcs.json` `team_role` (Ashvale, Myrdath, Veyra) | Kingdom tier |
| Fortune | `stepFortune` (`mods`) | satu modifier lawan |
| Hadiah | `repAdd` (deed `community_event`, `memorable_performance`, `club_festival_win`, `fair_prize`), proficiency lewat `stepProficiency` / `D/club_stats.json`, Imprint lewat `stepBondMemory` | hadiah peluang |
| Kejadian kecil | `happeningOn`, `happeningFits`, `D/happenings.json` | happenings khusus event |
| XP hadir di event | `eventXP` di `stepProficiency` (8 event, hardcoded: Training Week, Expedition, Warding Rite, Star Night, Club Festival, Bazaar, Entrance feast, Founder Day feast) | **dipindah** jadi peluang (§2.3), XP-nya sama; tidak ada dua sistem |
| Unlock tab | `stepUi` → `$ui.unlocks` (DECISIONS §7 D16) | tab Event |
| Tombol | `p30:fillChat` (tombol hanya menulis draf, DECISIONS §7) | tombol di tab Event dan bracket |
| Selisih balasan | `sh:replyDelta` (dihitung, tidak disimpan) | pola yang sama untuk bracket |

## 2. Kerangka event (lapis 1, semua event)

### 2.1 Data

`data/calendar.json` `events[]` mendapat dua field opsional:

- `id`: kunci stabil, mis. `star_night`, `dorm_comp`, `club_festival`. `eventDay(/^Dorm Competition/)` di UI diganti `eventById('dorm_comp')`;
  regex lama tetap jalan selama migrasi build (`tools/gen_engine.py` memeriksa setiap `id` unik).
- `kind`: `contest` | `showcase` | `festival` | `rite` | `trip` | `exam` | `day` | `holiday`. Pembagian 44 event ada di Lampiran A.
  `kind` hanya memilih apa yang ditampilkan; perilaku event (curfew, `noclass`, `fair`, `trip`) tetap di field yang sekarang.

Data baru di satu file: `data/event_frame.json`:

```json
{
  "chances": { "<event id>": [ { "id": "...", "text": "...", "how": {...}, "reward": {...} } ] },
  "contest": { "formats": {...}, "roles": {...}, "pins": {...}, "tuning": {...} }
}
```

Happenings khusus event **tidak** masuk file ini: `data/happenings.json` item mendapat field opsional `ev: ["star_night"]`. Item
dengan `ev` hanya muncul pada hari event itu (di `happeningFits`); aturan lama "hari kalender peluangnya separuh" tetap untuk item
tanpa `ev`.

### 2.2 Engine

- `stepCampusEvents` mendapat blok ketiga `eventNow(c)` → `$ui.ev`: `{ id, kind, day (hari ke-n dari m), now, next }`, dengan `now`
  dan `next` dipotong dari rencana hari `s` menurut jam (pola `schedOf`). Kosong di luar hari event. Kecil: satu objek, satu event.
- `nowOf` mencetak satu baris event di `<now>` hanya pada hari event (teks §2.6). Baris Contest dan peluang menempel di baris ini,
  jadi biaya token nol di hari biasa.
- Peluang: `stepEventChances(c)` sesudah `stepBonds`, `stepPurchases`, `stepProficiency` (supaya laporan balasan ini sudah dibaca).
  Catatan selesai di `$eng.chance = { "Y1:star_night:meteor": dayNo }`; dibersihkan di `stepNewYear` kecuali tahun berjalan.

### 2.3 Peluang (bukan quest)

Prinsip desain yang dijaga: tanpa ending, anti-grind, NPC bereaksi sesuai karakter. Karena itu:

- **Opsional dan tidak pernah dikejar.** Tidak masuk Agenda, tidak ada pengingat `stepReminders`, tidak ada status "missed" yang
  merugikan. Yang tidak diambil cukup tertulis "Passed" di tab Event setelah event selesai.
- **Paling banyak 3 per event, sekali setahun masing-masing.**
- **Terdeteksi dari laporan yang sudah ada** (`how`):
  - `at`: {{user}} di tempat X dalam jendela jam (`World.Location` lewat `campusPlace`, `World.Time`);
  - `with`: interaksi `talk` / `hangout` / `help` dengan siapa pun selama jendela event (`/Interactions`, dicek di `stepBonds`);
  - `practice`: aksi `/Practice` tertentu (`c.sessions`), dengan syarat opsional (mis. partner dari dorm lain);
  - `buy`: pembelian di event (baris Transactions baru, `sh:newLines`);
  - `deed`: deed reputasi yang dilaporkan (hanya menandai selesai; deed itu sendiri sudah dibayar `stepReputation`).
- **Hadiah lewat sistem yang ada** (`reward`), selalu di dalam batas mingguan sistem itu:
  - `deed`: satu deed dari `data/reputation.json` lewat `repAdd` (tipe `event`, jadi tidak kena batas mingguan, makanya sekali setahun);
  - `prof`: XP satu Field lewat jalur proficiency biasa (kena batas mingguan);
  - `moment` (1.81.0, menggantikan `imprint` yang direncanakan): satu baris Recent moments untuk setiap NPC ber-bond Rank 3+ yang hadir.
    Imprint adalah keyakinan yang ditulis narator (ada batasnya dan karakter "fixed"), jadi engine tidak menulisnya;
  - `scout`: khusus Contest (§3.7): membuka kekuatan dua calon lawan di bracket.
- **Tidak memaksa adegan.** Teks `<now>` untuk peluang menyebutnya pilihan pemain (§2.6). NPC tidak pernah "mengajak" karena peluang;
  ajakan tetap urusan `stepInitiative` dengan alasan in-character.

Delapan baris `eventXP` yang sudah ada pindah ke `event_frame.json` sebagai peluang dengan `reward: prof` dan XP yang sama, kunci
`event:<tahun>:<key>` di `P.days` dibaca sebagai "sudah selesai" supaya save lama tidak membayar dua kali. Dua contoh di bawah
menggantikan baris lama, bukan menambah: Star Night `market` mengambil alih XP Star Night (Arcana 2), Training Week `watch` mengambil
alih XP Training Week (Prowess 3) dan menambah scout.

Contoh untuk event yang paling dekat di kampanye (teks Inggris = teks kartu). Event lain diisi per rilis, setelah owner melihat
contoh ini di permainan.

| Event | id | Teks (EN) | how | reward |
|---|---|---|---|---|
| Star Night | `meteor` | Watch the great meteor shower from the Grassy Field and Hills at midnight | `at` Grassy Field and Hills, Sat 23:30–00:30 | `moment` (who is with {{user}}, Rank 3+) |
| Star Night | `market` | Spend the evening on the Grassy Field and Hills | `at` Grassy Field and Hills, Sat from 20:00, 45 min | `prof` Arcana 2 (was `eventXP` Star Night) |
| Club Festival | `stand` | Help run your club's stand for an hour | `at` Main Courtyard, Fri 13:00–18:00 or Sat 09:00–18:00, 60 min, {{user}} in a club | `prof` 2 in the club's Field (`D/club_stats.json`); was `eventXP` Club Festival stand, Craft 2 for any club |
| Club Festival | `perform` | Win the crowd at an exhibition match or demonstration | `deed` `memorable_performance` | marks done only |
| Training Week | `watch` | Spend an evening at the sparring on the Combat Grounds | `at` Combat Grounds, after the last period, 45 min; up to 3 evenings | first evening `prof` Prowess 3 (was `eventXP` Training Week); every evening `scout` 2 possible opponents |
| Training Week | `spar` | Spar with a student from another dorm | `practice` "Spar with a partner", partner's dorm ≠ {{user}}'s | `prof` Prowess (the practice already pays it; this marks it) |

Warding Rite sengaja tanpa peluang: lore 93 memakainya sebagai celah plot misteri, jadi tetap milik narator.

### 2.4 UI: tab Event

- Activities → tab **Event**, terbuka 7 hari sebelum event sampai hari terakhirnya (`$ui.unlocks`, pola tab Competition).
- Isi: nama dan tanggal; rencana tiap hari dengan jam (`s`); curfew hari itu (`curfewOf`); "Now / Next" saat event
  berjalan; peluang dengan status Open / Done / Passed dan tombol draf (`fillChat`, mis. "I head up to the Hills before midnight");
  untuk `kind: contest`, tombol ke tab Competition.
- Event berikutnya saja; tidak ada daftar tahunan (Planner sudah punya kalender penuh).
- Chip bracelet "today's event" yang sudah ada dibuat membuka tab ini.

### 2.5 Biaya dan toggle

- Peluang: toggle baru `[f:event_chances]` (default on) di `D/features.json`, biaya token diukur `tools/feature_cost.py`.
- Baris event di `<now>`: bagian inti (selalu), karena `_Event_today` sudah ada dan baris ini menggantikan sebagiannya, bukan menambah.
- Contest ikut toggle `[f:competition]` yang sudah ada.

### 2.6 Teks kartu (EN)

Baris event di `<now>` (505), hanya pada hari event:

```
Event: <event name>, day <n> of <m>. Now: <block now>. Next: <time> <block next>.
```

Peluang yang terbuka **saat ini dan di tempat ini** (paling banyak dua), di bawah baris event:

```
Open at this event, the player's choice (never steer the scene toward it): <text>; <text>.
```

## 3. Modul Contest (lapis 2, event `kind: contest`)

### 3.1 Format

Lore 19 memberi lima cara bertanding di Dorm Competition, jadi "bracket" bukan satu bentuk:

| Format | Dipakai | Cara jalan | Laporan {{user}} |
|---|---|---|---|
| `knockout` | Dorm Attack, Dorm Control, Academy, Kingdom | pasangan per babak, pemenang maju, bye ke babak 1 bila jumlah ganjil | `R2: beat Sophia` / `R2: lost to Sophia` |
| `heats` | Dorm Defense, Dorm Healing | grup 5–6 per heat, 2 teratas maju, heat final memberi urutan | `R1: advanced` / `R1: out` |
| `paired` | Dorm Support | dipasangkan acak dengan petarung Attack se-dorm; dinilai dari bout partner | `R1: partner beat X` / `R1: partner lost to X` |
| `tally` | Sports Day, Academy Showcase (rilis C) | skor atau medali per dorm dijumlah di akhir hari | — |
| `vote` | Club Festival koin (rilis A2), Council Election (rilis E) | suara diundi dengan bobot (ukuran club, stand {{user}}: peluang `stand` dan `perform`), diumumkan di penutupan; koinnya simbolis, engine tidak menagihnya; club {{user}} menang → deed `club_festival_win` | — |

`Placement` mengikuti lore: "every entrant finishes with a placement" (urutan babak tersingkir, lalu kekuatan sebagai pemecah seri).

### 3.2 Bidang peserta (dihitung, tidak disimpan)

`sh:contestField(seed, year, tier, dorm, role)` mengembalikan daftar peserta yang sama di engine dan UI (pola DECISIONS §7 "computed,
never stored"; tiap byte state tersalin ke setiap pesan, batch 8):

- Mahasiswa roster di dorm itu dengan role itu (§3.4) yang ada di Halvard tahun ini (`ARRIVES`, `Campus_State.Graduated`, `NPC_status`).
- Sisanya peserta tanpa nama, berlabel `Fire Y2 student` dst., dan mereka **mayoritas**: satu bracket berisi 10–16 orang, roster
  paling banyak 6 (Fire Attack), umumnya 0–3. Peserta tanpa nama adalah karangan narator: nama, rupa, gaya bertarung, kepribadian,
  sebagai mahasiswa Halvard dari dorm dan angkatan itu (owner, 2026-10-21: aneh kalau setiap lawan named NPC). Nama itu tercatat
  lewat baris Results {{user}}; kalau muncul lagi, ia jadi Extra biasa (`stepExtras`, rekaman dari kemunculan kedua).
- Roster di-seed terpisah (unggulan, disebar ke ujung bracket yang berbeda), jadi babak awal {{user}} biasanya melawan peserta tanpa
  nama, dan named NPC lebih sering muncul di babak akhir. Di heats, satu heat paling banyak berisi satu named NPC.
- Ukuran bracket per role per dorm: `rollInt(10, 16, seed, year, dorm, role, 'size')`. Contoh di rule card ("2nd of 12, Defense
  bracket") tetap cocok.
- Kekuatan: `25 + 15 × (tahun − 1) + rollInt(0, 30, …)` ditambah pin (§3.3). {{user}}: `30 + 10 × (tahun − 1) + 10 × rank Prowess`.
- Hasil NPC lawan NPC: `roll100(seed, year, tier, dorm, role, round, match) < 50 + (kekuatan A − kekuatan B)`, dijepit 10–90.
- Undian babak memakai `rollTable` / `pickOf`; tidak ada `hash32 % n` mentah.

### 3.3 Pin canon (`event_frame.json` `contest.pins`)

Hanya yang lore katakan; selebihnya diundi:

- **Gareth** (Fire, Attack): kekuatan +25. Lore 121: mengalahkan Sophia di final dua tahun berturut-turut.
- **Sophia** (Fire, Attack): kekuatan +20. Lore 117: tujuannya mengalahkan Gareth. Final mereka tidak dipaksa; kalau terjadi,
  Gareth biasanya sedikit unggul, tapi undian tahunan bisa membalik.
- **Ruby** (Sky, Healing): kalah di babak pertama setiap tahun, atas kemauannya sendiri (lore 130: "loses early on purpose").
- **Royhan** (Sky, Control): tahun 1 kampanye (tahun ketiganya) lolos di tempat Control ketiga dorm-nya, persis versi "after" lore
  101. Kalau {{user}} mengalahkannya di layar, cerita yang menang (lore 101 sendiri bilang Campus_State menimpa).
- **Dante** (Light, Control): placement dipaku di tengah (lore 128, narrator-only: "deliberately unremarkable").
- **Hadrian**: tanpa golem (lore 413); hanya teks, tidak ada angka.
- **Aiden** (lore 106) menjalankan buku taruhan Dorm Competition: dipakai sebagai warna di baris `<now>` bila Aiden ada di adegan,
  tanpa sistem taruhan baru.

### 3.4 Role mahasiswa roster (usulan, owner cek)

Roster Halvard belum punya role tempur (`team_role` hanya untuk tim rival). Usulan dari baris Magic di lore masing-masing; diam =
setuju, ubah satu baris kalau ada yang salah. Masuk `event_frame.json` `contest.roles`, dicek `gen_engine.py` terhadap `ROLES5`.

| Dorm | Attack | Defense | Healing | Support | Control |
|---|---|---|---|---|---|
| Fire | Gareth, Sophia, Caralynn, Wren, Aurelian (Y3), Bruno (Y3) | Lenna | — | Nerys (Y2) | Trixie, Tilly |
| Light | Tsubaki (Y2), Topaz (Y3) | Irene | — | Kanae, Aiden, Hadrian (Y2) | Dante, Bianca (Y3) |
| Sky | Florian, Idris, William (Y3) | Zara, Maple (Y2) | Ruby | Alyssa | Royhan, Rigel (Y3) |
| Viridian | Etnie, Saffi | Faye (Y3) | Percival, Vera, Castor | Caspian, Linus (Y2) | — |

(Y2/Y3 = datang di tahun kampanye itu.) Castor memakai sihir publiknya (Purification), bukan rahasianya. Kekosongan (Fire dan Light
tanpa Healing, Viridian tanpa Control) cocok dengan lore 19: "no dorm covers every role well"; bracket itu tetap penuh oleh
peserta tanpa nama.

### 3.5 Jalur {{user}}

- Role bracket {{user}} = `sh:classRoleOf(Profile)`; tanpa role tercatat: Attack, dan `<now>` menyebutnya.
- Pada hari Contest, engine menghitung bout berikutnya {{user}} (lawan, babak, jam) dan mencetaknya di `<now>` (§3.8). Narator
  memainkannya dengan Fortune seperti biasa, lalu menulis satu baris Results dengan tata bahasa format itu (§3.1).
- Engine membaca baris itu (`Dorm R2: beat Sophia`, awalan tier ditambahkan engine bila tidak ada), memajukan bracket, dan **mengisi
  `Placement` dan `Status` sendiri** (qualified / eliminated / champion). Narator tidak lagi menghitung tempat.
- Hadiah tidak berubah: `DORM_PRIZE` 100/50, `KINGDOM_PRIZE`, deed `REP.competition`, `teamBond`; kini dibaca dari Placement yang
  diisi engine.
- {{user}} Support: bout partner Attack-nya menjadi bout {{user}}; bracket Attack mengikuti hasil itu, jadi dua bracket tetap
  konsisten. {{user}} Attack: siapa Support yang dipasangkan dengannya disebut di `<now>`.
- Kuota lolos per dorm tetap lore 19: Attack 4, Defense 3, Healing 3, Support 3, Control 3; menang tidak wajib.
- Kingdom tier tetap hanya tim rival yang ada di roster (Ashvale, Myrdath, Veyra); di sana narator tidak mengarang anggota tim baru.
- Bout NPC lain yang dimainkan di layar mengikuti hasil yang sudah dihitung; `<now>` mencetak hasil babak yang baru selesai di
  bracket {{user}} ("Elsewhere in your bracket: …"), jadi narator menulis yang sama.

### 3.6 Fortune

Satu modifier baru di `stepFortune` `mods` saat bout Contest: lawan `stronger` (kekuatan ≥15 di atas {{user}}) −10, `weaker`
(≥15 di bawah) +10, selain itu `even` 0. Label selalu menyebut lawan, jadi tidak ada salah baca siapa yang diunggulkan. Tidak ada modifier lain; sisanya modifier Fortune yang sudah ada (role yang cocok, proficiency).

### 3.7 Scout

Hadiah `scout` (Training Week, §2.3) membuka label kekuatan (`stronger` / `even` / `weaker`) dua calon lawan terdekat di bracket
{{user}}. Disimpan di `$eng.scout = [ids]` (tahun ini saja). Tanpa scout, lawan hanya terlihat kekuatannya saat bout dimulai.

### 3.8 Teks kartu (EN)

Di bawah baris event, hanya pada hari Contest:

```
Contest: <tier> <role> bracket, round <r> of <n>. {{user}}'s next bout: <time>, against <name or label> (<dorm> Y<year>, <stronger|even|weaker> than {{user}}). Paired Support: <name>.
Elsewhere in {{user}}'s bracket: <A> beat <B>; <C> beat <D>.
Report the bout in Competition.Results as "R<r>: beat <name>" or "R<r>: lost to <name>" (heats: "R<r>: advanced" or "R<r>: out"). The engine sets Placement and Status.
```

Bila lawan berikutnya peserta tanpa nama, baris bout memakai labelnya dan baris ini ikut tercetak:

```
<label> is not a roster character: invent them (a name, a look, how they fight, how they carry themselves), a Halvard student of that dorm and year, and use the name you give in the Results line.
```

Rule card `competition` (`data/rule_cards.json`), kalimat kedua diganti:

```
At the Dorm tier {{user}} fights in their role's bracket; the engine draws the bracket, names the next opponent in <now>, and sets Placement and Status from the Results lines. Write one Results line per bout in the form <now> gives. Most entrants are not roster characters: the crowd, the other bouts and any opponent <now> gives only as a label are yours to invent, as students of that dorm and year.
```

Kalimat lain di kartu itu (hadiah, reputasi, bond XP, harga gelar) tetap.

### 3.9 UI: bracket

Tab Competition (`p40:acCompetition`) mendapat blok **Bracket** di atas "The ladder", dari `sh:contestField` yang sama:

- `knockout`: kolom per babak, bout {{user}} disorot, hasil yang belum terjadi kosong (hasil NPC masa depan tidak pernah tampil).
- `heats`: grup per heat dengan siapa yang maju.
- Nama roster membuka dossier (`data-open="npc:<id>"`), label tanpa nama tetap teks; label kekuatan hanya untuk yang sudah di-scout
  atau sedang dihadapi.
- Bracket dorm lain: hanya pemenang dan yang lolos, setelah hari terakhir.

### 3.10 Academy dan Kingdom (rilis C)

- **Academy** (M6 W4 Wed–Sat): 64 yang lolos (16 × 4 dorm) membentuk tim; 16 tim, knockout, satu babak per hari. Tim {{user}} =
  `Competition.Team`. Sebagian besar anggota tim lain juga peserta tanpa nama yang dikarang narator (baris "invent them" yang sama);
  rekaman Extra dari Dorm Competition dipakai lagi kalau orangnya lolos. Tim lain dihitung dari yang lolos dengan syarat lore 19 (setiap angkatan ada, role sebisanya tertutup).
  Pin: Ruby menolak setiap tim (lore 130; dia memang tersingkir awal); Royhan tidak diambil tim mana pun (lore 101) kecuali {{user}}
  merekrutnya, sebuah kail cerita yang sudah ada di lore.
- **Kingdom** (M9 W4): **dibuat di 1.84.0 sebagai tiga fase** (owner, 2026-10-21; DECISIONS "Kingdom Competition in three rounds"); sampai rilis C, tim Halvard tanpa {{user}} = empat mahasiswa roster terkuat (`sh:kcTeams`), rilis C menggantinya dengan pemenang Academy yang dihitung. Tim Halvard (tim {{user}} atau tim pemenang yang dihitung) lawan Ashvale, Myrdath, Veyra (`team_role`
  sudah ada); semifinal Rabu–Kamis, final Jumat/Sabtu sesuai rencana hari. Ini menutup celah sekarang: bila {{user}} tidak ikut,
  siapa wakil Halvard belum terdefinisi.
- **World** (M11 W4): tanpa bracket; national four dipilih panel (lore 19) dari peserta Kingdom terkuat per role, dihitung dan
  ditampilkan setelah Kingdom selesai.

## 4. Event lain: tujuh celah (urut tanggal)

Hasil cek event non-kompetisi (2026-10-21): trip, ujian, Dorm Day, Return Week, Entrance dan Graduation sudah cukup; Warding Rite
sengaja milik narator (lore 93). Tujuh celah di bawah diurutkan menurut kapan kampanye sampai ke sana. Semuanya data atau langkah kecil
di atas kerangka §2, kecuali Founder Day (§4.7), satu-satunya modul khusus satu event.

### 4.1 Stand event (Star Night M1 W3; lalu Fools Day, Circus, Bazaar, Harvest, pasar musim dingin Graduation)

Masalahnya: lore berkali-kali bilang "stalls take points", tapi `data/shop.json` tidak punya barang event, jadi `stepPurchases` selalu
jatuh ke harga cerita dan Price Guide 506 diam.

- `data/shop.json`: item mendapat field opsional `ev` (id event) dan `hours` (mis. `[20, 24]`); `loc` = tempat stand
  (`grassy field and hills`, `main courtyard`). `tools/gen_engine.py` `shop_prices` membawa `ev`; `stepPurchases` menerima baris event
  hanya pada hari event itu, di tempatnya, dalam jamnya (pola cek `season` yang sudah ada).
- Price Guide 506: blok "Event stalls here" saat {{user}} di tempat stand pada hari event; di tempat lain satu baris "Event stalls
  today: <place>".
- Tab Shop (`p40:shopsHere`) terbuka di stand event pada harinya. Ini memperluas DECISIONS §7 "The Shop tab appears only at a shop"
  (1.2.0): stand event dihitung sebagai toko selama event.
- Barang hanya memakai jenis efek yang sudah ada (`use`, `gear` di `SHOP_FX`, atau makanan, minuman dan hadiah biasa), jadi tidak ada
  kode efek baru. Harga sejajar Commissary (Sunfizz 8, Firetooth 12).
- **Merryhew's sale** (Fools Day, lore 235 "biggest sale of the year"): event `fools_day` mendapat `sale: { "shop": "merryhews",
  "pct": 25 }`; `stepPurchases` memotong harga barang Merryhew's 25% pada hari itu.
- **Tawar di Bazaar** (lore 243 "haggling expected"): harga di daftar adalah tawaran pembuka; harga yang dibayar mengikuti angka Fortune
  pertama balasan itu (`$ui.fortune.rolls[0]`, angka yang juga dibaca crafting) menurut `fortune_band`: berhasil ×0,8, sebagian ×0,9,
  gagal ×1,0. Hanya di stand Bazaar.

Daftar Star Night (rilis A1; teks EN = teks kartu):

| Item | Price | Bag kind | Effect |
|---|---|---|---|
| Hot spiced cider | 6 | drink | clears Chilled (a hot drink) |
| Mug of cocoa | 5 | drink | clears Chilled (a hot drink) |
| Roasted chestnuts (paper cone) | 4 | food | none |
| Honey-glazed skewer | 7 | food | none |
| Star chart of the season | 15 | book | none (a gift) |

Daftar event lain ditulis di rilisnya, dari lore masing-masing: Circus (lore 241: games, sideshows, fortune tellers), Bazaar (lore 243:
barang per bangsa, mis. Norvaine starglass lenses, Caelmari rune heaters, Yozakuran tea), Harvest (lore 245: cafés, food stalls,
costumes, carved lanterns), pasar musim dingin Graduation (rencana hari: stalls di Main Courtyard dan Founder's Park). Daftar itu masuk
CHANGELOG rilisnya di bawah "to confirm with the owner".

### 4.2 Secret Fools Day: undian nama (M4 W1)

- Dihitung, tidak disimpan: `sh:foolsDraw(seed, year, dorm)` memberi dua nama untuk {{user}}: siapa yang {{user}} dapat (target) dan
  siapa yang mendapat {{user}} (pengusil). Masing-masing lewat `rollTable`: 70% teman se-dorm dari roster yang ada di Halvard tahun
  ini, 30% teman se-dorm tanpa nama (dikarang narator, seperti peserta Contest).
- {{user}} ikut hanya kalau pemain bilang begitu (lore 235: "participants draw"). Target tampil di tab Event pagi itu (pemain yang
  mengambil kertasnya); pengusil baru tampil setelah hari selesai.
- Deed `famous_prank` dan `caught_pranking` sudah ada; sale Merryhew's dari §4.1. Tidak ada state baru.

Baris `<now>` pada hari itu (EN):

```
Secret Fools Day: if {{user}} drew a name this morning, it was <target>. Whoever drew {{user}}: <name, or a dorm-mate you invent>; keep it hidden until the story shows it. Pranks stay in character: someone who would never prank does something gentle, or nothing at all.
```

### 4.3 Libur: Mid-Year Break (M5 W4) dan bulan 12

Masalahnya: pada event `home` kampus kosong, dan routine week (`routineSpan`) berhenti sebelum hari-hari itu. Bulan 12 jadi 28 hari
balasan biasa tanpa isi.

- Tab Event (`kind: holiday`) dan Planner memberi dua tombol draf: "I'm going home for the break" dan "I'm staying at Halvard for the
  break". Tanpa pilihan, {{user}} dianggap tinggal (default yang wajar: lore 238 bilang tinggal "allowed and common").
- **Pulang**: narator mencatat `Trip` (Active, Destination "home"), Trip yang sudah ada, jadi `awayIn` menghentikan semua yang berhenti
  saat {{user}} pergi. Baru: span `home` di `stepRoutine`, sehingga satu balasan membawa {{user}} sampai malam sebelum hari kembali.
  Satu atau dua momen (`routineMoments`) jadi surat atau adegan yang diingat, lalu satu baris rekap Journal.
- **Tinggal**: kampus versi kerangka (lore 238: kantin jam pendek, separuh mall tutup, staf inti dan Warden). Siapa yang ikut tinggal
  dihitung: `sh:breakStays(seed, year, break)`. Mahasiswa yang asalnya luar negeri atau provinsi jauh (asal di lore, sistem origins
  1.73.0; field persisnya dicek saat build) tinggal; sisanya tinggal dengan peluang 20% per libur. Yang pulang dihitung pergi oleh
  `whereabouts` (pola `npcAway`). Routine week tetap jalan selama {{user}} tinggal, terpotong hanya oleh akhir libur.
- Rumah dan keluarga {{user}} milik pemain. Baris `<now>` saat {{user}} pulang (EN):

```
{{user}} is home for the break. Their home and family are the player's: use what the player has written, ask nothing about them, invent as little as the scene needs.
```

- State: tidak ada yang baru selain Trip yang sudah ada; daftar yang tinggal dihitung.

### 4.4 Magical & Science Fair: penilaian (M7 W2)

Canon yang belum dibuat (lore 240): panel staf memberi skor setiap stand; mahasiswa boleh memakai skor itu sebagai nilai midterm Magic
Theory bulan 9; stand kelompok berbagi satu skor.

- Stand = Project dengan Kind `fair`, Due M7 W2 Sat, dibangun sepanjang minggu seperti Project lain (Progress dari sesi kerja).
- Sabtu, `stepSchoolWeek` menilainya lewat jalur nilai yang sudah ada (`markUp`, `MARKS`): persiapan dari Progress (tingkat per 25),
  rank Arcana, dan undian hari ujian `EXAM_DAY` → nilai A–F. Project belum 100 tetap dipamerkan, nilainya turun satu.
- Nilai A → deed `fair_prize` (sudah ada, Academy 8). Partner di `With` berbagi nilai yang sama.
- Midterm Magic Theory M9: engine memakai nilai Fair bila lebih baik dari ujian tulis (default yang wajar; lore: "may use").
- Tab Studies: "Fair mark: B (replaces the Month 9 Magic Theory midterm if better)".
- Menyentuh DECISIONS §3 "Grades and exams" (1.15.0, 1.30.0): rumus tetap, ditambah satu pengganti dari canon lore 240.

### 4.5 The Thinning: seminggu terkunci (M7 W3)

Yang sudah ada: lockdown (tanpa kelas, curfew mutlak, tanpa happenings, teks periode "LOCKDOWN"). Yang kurang: isi minggu itu.

- `data/ambience.json` `beats`: 8–10 beat dengan syarat `ev: "thinning"` (format beat sudah membawa syarat seperti `far`, `curfew`),
  dari lore 9. `uncanny_chance` ×2 minggu itu (17 cerita hantu sudah ada).
- Beat tidak pernah berupa jebolnya segel atau sebuah Clue: plot tetap milik narator dan lore.
- Contoh beat (EN): "the ward along the outer wall flickers, faint as breath on glass"; "no birdsong anywhere on the grounds"; "something
  knocks inside the wall three times, then never again"; "every lamp in the corridor dims together, then comes back"; "a draught moves
  through a room with every window shut".

### 4.6 Keluarga berkunjung (Academy Showcase M8 W3, Harvest Festival M10 W4)

- Tanpa sistem baru. Rencana hari di `calendar.json` sudah menyebut keluarga datang (dicatat di Gatehouse). Pada hari-hari itu baris
  event menambah satu kalimat (EN):

```
Families are visiting today. {{user}}'s family comes only if the player says so; anyone else's family follows their lore, or stays unnamed.
```

- Lore 242 ("those with nobody coming are careful how they say so") tetap bahan narator, bukan mekanik.

### 4.7 Founder Day: treasure hunt (M9 W3), modul khusus

Lore 25: opsional, sendiri atau berkelompok; semua mendapat petunjuk pertama yang sama; tiap petunjuk yang terpecahkan menuju petunjuk
berikutnya di seluruh kampus; ditulis ulang staf tiap tahun; terkenal sulit, tidak ada yang selesai bertahun-tahun; hadiahnya tidak
pernah diumumkan. Asal-usulnya: warden pendiri menyembunyikan piagam akademi.

- Rantai dihitung: `sh:hunt(seed, year)` → 6 perhentian, diundi dari tempat kampus yang punya lore (`PLACE_LORE`), termasuk tempat jauh
  (Lake, Grassy Field and Hills). Engine hanya tahu tempatnya; narator menulis teka-tekinya dari baris lore tempat itu.
- Main dari 09:30 (sesudah upacara) sampai 18:00. Petunjuk pertama dibagikan di Arbiter Hall. Begitu {{user}} sampai di tempat yang
  benar, engine mencatat petunjuk itu di Mystery Board (Clue, Thread "Founder Day hunt Y<n>", Where = tempat) dan memberi tempat
  berikutnya ke narator di `<now>`. Sulitnya datang dari jarak jalan (`campusWalk`) dan waktu yang dihabiskan narator per teka-teki:
  enam perhentian dalam delapan setengah jam memang mungkin, tapi tidak longgar.
- Kelompok lain ikut berburu (peserta tanpa nama, dikarang narator); staf tidak memberi petunjuk.
- Selesai → hadiah: §10 pertanyaan 2 (diputuskan).
- State: `$eng.hunt = { y, at }` (perhentian yang sudah dicapai). Catatan pemain ada di Mystery Board (batas 40 yang sudah ada).
- Toggle: ikut `[f:event_chances]`.

Baris `<now>` selama perburuan (EN):

```
Founder Day hunt: {{user}} holds clue <n> of 6. Its answer is <place>; write the riddle from that place's lore, and let {{user}} work it out or not. The engine gives the next clue when {{user}} reaches the place.
```

## 5. State dan save

- Baru di state: `$ui.ev` (kecil, hanya hari event), `$eng.chance`, `$eng.scout`, `$eng.hunt`. Bracket, hasil NPC, tim lain, undian
  Fools Day, yang tinggal saat libur, rantai perburuan: dihitung.
- `Competition.Results` tetap StrList(12); awalan tier membuat baris dari beberapa tier bisa hidup berdampingan dalam setahun.
- `stepMigrate`: tidak ada field lama yang diubah. Kunci `event:<tahun>:<key>` milik `eventXP` di `P.days` dibaca sebagai peluang yang
  sudah selesai. Save sebelum rilis A1 memuat tanpa kehilangan data (`tests/test_saves.cjs` dengan fixture rilis 1.80.0, ditulis
  sebelum kode berubah).

## 6. Tes

- `T:event_frame_v1810`: `id` unik dan `kind` sah untuk 44 event; baris event hanya di hari event; peluang terdeteksi dari setiap
  `how`, sekali setahun, hadiah lewat jalur biasa; `eventXP` lama tidak membayar dua kali; item happening `ev` hanya di harinya; tab
  Event terbuka 7 hari sebelumnya; barang stand hanya di hari, tempat dan jamnya; Price Guide menampilkan stand.
- `T:contest_v1820`: bracket sama di engine dan UI untuk seed yang sama (dan di setiap swipe); pin (Ruby tersingkir R1, Royhan Control
  ketiga Sky di Y1, Dante di tengah); Placement dan Status dari Results; hadiah Dorm sekali setahun; Support mengikuti partner;
  modifier Fortune; `vote` Club Festival.
- Per rilis berikutnya satu suite: undian Fools Day dan sale; span `home` dan yang tinggal; nilai Fair dan penggantian midterm; beat
  Thinning hanya minggu itu; rantai perburuan sama di setiap swipe dan Clue tercatat sekali.
- Test yang grep teks rule card `competition` dijalankan ulang (`grep -l "competition" tests/test_*.cjs`).
- Live (quest log, di quest tempat kampanye pertama kali melihatnya): Star Night baris event, stand dan peluang meteor; Club Festival
  vote; Training Week scout; Dorm Competition satu bracket penuh; dan seterusnya per rilis.

## 7. Rilis (urut tenggat di kampanye)

| Rilis | Isi | Harus siap sebelum |
|---|---|---|
| A1 (1.81.0) | Kerangka event §2 (peluang, `eventXP` dipindah), mekanisme stand §4.1 dengan daftar Star Night | Star Night M1 W3 |
| A2 (1.82.0) | Contest §3.1–3.9 untuk Dorm Competition, format `vote` untuk koin Club Festival | Club Festival M3 W2 |
| B (1.83.0) | Fools Day §4.2 dengan sale Merryhew's, libur §4.3 | Fools Day M4 W1 |
| C | Format `tally` (Sports Day, Showcase), Academy §3.10 (Kingdom dan pilihan panel World sudah di 1.84.0; tim Halvard di `sh:kcTeams` lalu diambil dari pemenang Academy yang dihitung) | Sports Day M6 W3 |
| D (1.85.0) | Fair §4.4, Thinning §4.5, stand Circus, kunjungan keluarga §4.6 | Fair M7 W2 |
| E (1.86.0) | Stand dan tawar Bazaar, Founder Day §4.7, `vote` Council Election, stand Harvest dan pasar musim dingin | Bazaar M9 W2 |

Nomor versi menyesuaikan kalau ada rilis lain di sela-selanya (mis. perbaikan dari playtest).

## 8. Keputusan yang disentuh (DECISIONS)

- §5 "Dorm Competition brackets" (1.33.0): angka, kuota, hakim, format tetap. Yang berubah: `Placement` diisi engine dari baris
  Results, bukan ditulis narator. Hadiah tetap dibaca dari Placement.
- §3 "Competition results" (1.44.0): tidak berubah.
- §3 "Grades and exams" (1.15.0, 1.30.0): rumus tetap; nilai Fair boleh menggantikan midterm Magic Theory M9 (canon lore 240).
- §3 "Routine week" (1.50.0): ditambah span `home` untuk libur di rumah.
- §7 "The Shop tab appears only at a shop" (1.2.0): stand event dihitung toko selama event.
- §7 "What a reply changed is computed, not stored" dan "The UI never moves the story itself": diikuti (bracket, undian dan rantai
  dihitung; tombol hanya draf).
- §7 "Modules appear only when relevant" (D16): tab Event lewat `$ui.unlocks`.
- Keputusan baru (satu baris masing-masing, saat rilisnya): "Events: one frame (id, kind, the event line, the Event tab, chances), modules
  per kind"; "Contest brackets are computed from the seed; the narrator reports only {{user}}'s bouts"; "Event stalls are shop rows
  with `ev`"; "{{user}}'s home and family belong to the player".

## 9. Konten yang saya karang (owner cek)

- Tabel role §3.4 (35 mahasiswa).
- Rumus kekuatan dan ukuran bracket (§3.2), angka pin Gareth +25 dan Sophia +20, modifier Fortune ±10.
- Teks dan jendela jam keenam peluang (§2.3). Jamnya dari rencana hari di `calendar.json`; hadiahnya memakai deed dan Field yang
  sudah ada.
- Daftar dan harga stand Star Night (§4.1), sale Merryhew's 25%, faktor tawar Bazaar 0,8 / 0,9 / 1,0.
- Undian Fools Day 70/30 (§4.2); aturan siapa yang tinggal saat libur dan peluang 20% (§4.3).
- Contoh beat Thinning (§4.5); enam perhentian perburuan dan jam mulainya (§4.7).

## 10. Pertanyaan terbuka

Semua sudah diputuskan (diam = setuju, 2026-10-21); tidak ada `[?]` yang tersisa.

1. **Hasil NPC lawan NPC ditentukan engine** (diundi dari kekuatan, sama di setiap swipe). Dibangun di 1.82.0.
2. **Hadiah Founder Day = (a) + (c).** Teks fakta (a) saya tulis di bawah; owner boleh menggantinya kapan saja sebelum rilis E, dan
   kalau tidak ada komentar, teks ini yang dipakai. Fakta ini tidak membuka rahasia segel atau misteri; ia hanya menjelaskan hadiah yang
   tidak pernah diumumkan.
   - (a) Yang menyelesaikan perburuan dibawa malam itu juga ke Archive dan diperlihatkan piagam asli, yang disimpan terkunci dan tidak
     pernah dipamerkan. Di pinggir halaman terakhirnya ada satu baris tulisan tangan warden pendiri. Di bawah piagam ada daftar pendek
     nama-nama yang pernah selesai; nama terakhir di sana sudah puluhan tahun lalu. Nama {{user}} ditambahkan, dan mereka diminta tidak
     menceritakan isi baris itu (boleh menceritakan bahwa mereka selesai).
   - (c) Deed baru `founder_hunt` (Academy +10, event, sekali seumur kampanye) dan Kepala Sekolah menyebut nama {{user}} di feast
     malam itu tanpa menyebut hadiahnya.

   Teks kartu (EN), dicetak `<now>` sekali saat perhentian keenam tercapai:

```
Founder Day hunt finished. Tonight the Headmaster names {{user}} at the feast, and says nothing of the prize. Afterwards {{user}} is taken to the Archive and shown the original charter, kept locked and never displayed: in the margin of its last page is one line in the founding warden's hand, "A school that keeps the seal and loses its students has kept nothing." Beneath the charter is a short roll of those who finished; the last name on it is decades old. {{user}}'s name is added. They are asked not to repeat the line, only that they finished.
```

## Lampiran A. Pembagian 44 event menurut `kind`

| kind | Event |
|---|---|
| `contest` | Dorm Competition, Academy Competition, Kingdom Competition (dan dua hari terbang tim), World Competition, Sports Day, Student Council Election week |
| `showcase` | Club Festival, Magical & Science Fair week, Academy Showcase |
| `festival` | Star Night, Secret Fools Day, Traveling Circus, Academy Bazaar, Academy Founder Day, Harvest Festival, Club sign-up week |
| `rite` | Entrance Event, Warding Rite, The Thinning, Remembrance Day, Graduation |
| `trip` | Creature Studies Expedition, Independence Crowning Day, Academy Trip (dua baris) |
| `exam` | Midterm exams (dua), End of Semester exams (dua), Results & Dorm Ranking, Results & Final Ranking |
| `day` | empat Dorm Day, Return Week, Training Week |
| `holiday` | Mid-Year Break, Kingdom-wide holiday (empat minggu) |

Training Week masuk `day`: kelas biasa dengan curfew 21:00 dan sparring lintas dorm, bukan pertandingan; peluangnya tetap ada.
