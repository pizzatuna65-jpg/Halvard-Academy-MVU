# DRAFT — Sihir itu kasual di Halvard

Dicatat: 2026-10-24, atas permintaan owner: "saya ingin Halvard terasa magic academy: menggunakan magic di sana itu lumrah, hampir
setiap saat ada orang yang memakai magic untuk hal mundane maupun penting; skirmish atau battle kecil bisa terjadi di mana pun, dan
arena di Halvard dipakai untuk battle yang serius. Magic itu kasual, bukan sesuatu yang butuh izin atau pengawasan berlebihan."

**Status:** menunggu "proceed" owner. Teks Inggris di §2 adalah usulan kata-kata kartu.

## 0. Yang sudah ada

Sebagian besar sudah canon, dari lorebook owner sendiri (v38 Core, World Index, lore 0 baris 9):

> Casual casting, including ordinary movement magic, is normal and allowed anywhere on campus; students practise in courtyards,
> commons and the Gardens. Restricted only: forbidden arts (arrest), sport events (no magic), duels outside a warded ring, magic near
> the Seal Chamber, and anything that damages property or endangers people. Doves intervene for an actual restriction, harm, or
> established suspicion, not for an ordinary safe spell.

Yang lain yang sudah sesuai:
- Hidden magic: sihir sehari-hari yang aman tidak pernah dihukum (1.9.3). Dove attention hanya naik untuk rahasia Dove (true magic,
  teknik/pakta terlarang), bukan untuk sihir biasa.
- Fortune tidak dipakai untuk "everyday casting" (502).
- Rule card: "a consensual spar is a fight, not violence".

## 1. Yang membuat sihir terasa tidak kasual

1. **Duel di luar ring dilarang.** World Index: "Restricted only: … duels outside a warded ring". Ditambah deed reputasi kartu
   `fight_outside_ward` (Academy −8) dan `serious_fight_outside_ward` (−15). Narator bisa membaca setiap perkelahian kecil di koridor
   sebagai pelanggaran.
2. **"Anything that … endangers people"** terlalu luas: hampir setiap skirmish bisa disebut membahayakan.
3. **Pemisahan asrama.**
   - Combat Grounds (lore 52): "Cross-dorm sparring only during Training Week".
   - Kalender (lore 134, `calendar.json`): Training Week = "the one week cross-dorm sparring is allowed".
   - Baris canon lain sudah menyebut ini "a class rule, not a ban on casting elsewhere", tapi baris Combat Grounds dan kalender tidak
     memuat batasan itu, jadi terbaca sebagai larangan umum.
4. **Ambience hampir tanpa sihir.** Dari 113 tipe beat di `data/ambience.json`, hanya 2 yang menyinggung sihir:
   - "casual magic used for something trivial nearby";
   - "a duel or drill going on in a warded ring".

   Dari 33 happening, tidak satu pun berupa sihir sehari-hari atau skirmish. Ini penyebab terbesar dunia terasa biasa.
5. Tidak ada baris narator yang bilang sihir ada di hampir setiap adegan. World Index menyatakannya boleh, tapi tidak bilang lazim.

## 2. Usulan

### A. World Index (lore 0 baris 9, lewat `merge_lorebooks.py` `rep()`; `source_original/` tidak diubah)

> Magic is everyday at Halvard: people cast for chores, travel, study, showing off and pranks, at any hour and anywhere on campus,
> and nobody asks permission. Quick skirmishes (a hex traded over a seat, a scuffle of spells in a corridor) break out anywhere and
> end as fast; onlookers cheer, duck or ignore them. Serious fights (formal duels, grudges, wagers, anything with real stakes) go to
> the warded rings of the Combat Grounds. Restricted only: forbidden arts (arrest), sport events (no magic), magic near the Seal
> Chamber, and real harm: badly hurting someone, wrecking property, or dragging in people who want no part of it. Staff and Doves step
> in for those, not for ordinary casting or a skirmish that stays a skirmish.

±40 token lebih panjang dari baris lama (World Index selalu masuk prompt).

### B. Pemisahan asrama jadi aturan kelas saja

- **Combat Grounds** (lore 52): "Cross-dorm sparring only during Training Week, with the Magic Duelling Club as the standing exception."
  →
  > In class the dorms spar apart, except in Training Week; outside class anyone may challenge anyone, and the rings are where
  > serious fights are settled. The Magic Duelling Club mixes the dorms all year.
- **Kalender** (lore 134 dan `calendar.json` Training Week `s`): "the one week cross-dorm sparring is allowed" → "the one week the
  dorms spar together in class".
- Sparring Pavilion (lore 267) tetap: "the one place where rival dorms share a bench" itu soal tempat duduk dan gengsi, bukan larangan.

### C. Reputasi (`data/reputation.json`, aturan 502/rule card)

- `fight_outside_ward` (Academy −8): artinya jadi "a fight outside a warded ring that hurt a bystander or broke something". Skirmish
  yang tetap skirmish tidak dilaporkan sebagai deed.
- `serious_fight_outside_ward` (−15): "someone badly hurt outside a ring".
- Kunci deed tidak diganti, jadi save lama tidak perlu migrasi.
- Akibat lain tetap jalan lewat sistem yang ada: HP lewat Battle, dan Tension dengan NPC yang tidak mau diajak bertarung. Prinsip
  "musuh lebih mudah dibuat daripada teman" tetap berlaku.

### D. Ambience: 22 tipe beat sihir baru (`data/ambience.json` `beats`)

Format yang ada: `[kategori, "tex", tipe, syarat]`. Isinya tipe, bukan kalimat jadi; narator menulis detailnya. Tanpa bau, tanpa nama.
Tipe sihir mengikuti World Index: Elemental (elemen), Mystic (mengubah dunia materi: penciptaan, telekinesis, ramalan, ward),
Spiritual (kehendak sendiri: penguatan, penyembuhan), Occult (ilusi, charm, roh).

| kategori | syarat | tipe |
|---|---|---|
| * | min 2 | someone floating a bag, a tray or a stack of books along beside them instead of carrying it |
| * | min 2 | a quick trade of spells between two students over something petty, over in seconds; onlookers cheer or step around it |
| * | min 1 | someone using a spell for an everyday chore: drying, mending, lighting, cooling, sweeping |
| * | min 2 | a first-year's spell misfiring in a small, harmless and embarrassing way |
| * | out | someone taking a quick bound through the air with movement magic |
| * | min 2 | an Elemental student warming hands, a bench or a drink with a palm of fire, or chilling one with frost |
| dining | min 2 | cutlery, cups or plates moving on their own at a table nearby |
| dining | min 3 | a small prank spell going off at a crowded table, and the laughter after |
| study | | a conjured light hanging over a page; notes turning their own pages |
| study | | someone practising a charm under their breath, again and again |
| dorm_social | min 2 | an illusion shown off to friends: a tiny dragon, a fake spider, a face pulled out of smoke |
| dorm_social | min 2 | a familiar or a lesser spirit curled up with its student |
| green | | a familiar or lesser spirit trailing its student along the path |
| hills | out | someone practising a spell into the open air where nothing can break |
| hub | min 3 | a ring of students around two others mid-skirmish, egging them on |
| hub | min 2 | someone showing off a flashy spell for nobody in particular |
| combat | min 2 | a challenge being settled in a warded ring, with spectators and someone taking bets |
| combat | min 1 | a healer patching someone up at the ringside |
| craft | min 1 | a tool, a pot or a ladle held, stirred or heated by a spell while hands do something else |
| clubs | min 2 | a club's spell demonstration flaring through an open door |
| care | min 1 | a healing glow closing a scrape |
| mall | | a shop sign, a display or a door moving by a spell |

### E. Dua happening baru (`data/happenings.json`)

- `impromptu_duel` (Courtyards, 12–18, hari apa saja, bobot 3): "Two students settle an argument with spells in the Courtyards; a
  crowd forms, someone takes bets, and it is over before any staff arrive."
- `ring_grudge` (Combat Grounds, 16–20, bobot 2): "A grudge match is chalked up for the warded rings this evening; half the campus
  plans to watch."

Duel chalk di Sparring Pavilion yang sudah ada tetap. Dove sweep juga tetap: Doves sedang melacak kelompok sihir terlarang (canon),
dan yang mereka awasi adalah wajah, bukan sihir.

### F. Satu baris narator (504, kartu karena menyebut Halvard)

Owner (2026-10-24): "setiap saat mungkin terlalu literal, pokoknya terasa magic academy". Jadi baris ini tidak meminta sihir di setiap
adegan, hanya membuatnya biasa:

> Magic is part of ordinary life at Halvard: let it turn up naturally, as people use it for chores, jokes and showing off, without
> making every scene about it; a quick skirmish needs no permission, and staff step in only for real harm.

±40 token.

## 3. Keputusan yang tersentuh

- **Canon owner v38** (World Index, lore 52, kalender): kata-katanya berubah lewat `merge_lorebooks.py`. `source_original/` tidak diubah.
- **DECISIONS §6 "Three standings"** (deed bernama): arti `fight_outside_ward` menyempit, angkanya tetap.
- Tetap sama: prinsip "NPC bereaksi sesuai karakter" (NPC yang benci keributan tetap menghindar atau melapor), hidden magic, Doves,
  sport events tanpa sihir, Seal Chamber.

## 4. Biaya, tes, cek live

- **Token:** +40 (World Index, selalu masuk prompt) +40 (504). Beat dan happening memakai jalur yang sudah ada:
  satu beat paling banyak per balasan, jadi tidak ada token tambahan per beat.
- **Tes:**
  - beat baru valid untuk kategori dan syarat (validator `gen_engine.py` yang sudah ada);
  - replay: persentase balasan dengan beat sihir sebelum dan sesudah (target kasar: beat sihir di sekitar satu dari lima balasan yang punya beat, bukan di setiap balasan);
  - `test_saves`;
  - lore 0, 52 dan 134 mencetak kata-kata baru;
  - rule card mendefinisikan `fight_outside_ward` yang baru.
- **Cek live:** `docs/TEST_CHECKLIST.md` Act 1 Q1.1 (tur kampus: sihir terlihat di sekitar), Act 2 (skirmish di Courtyards tanpa
  hukuman; Academy turun hanya bila ada yang terluka atau rusak).

## 5. Pertanyaan terbuka

- [?] 1. **"Arena di Halvard":** kartu tidak punya bangunan bernama Arena. Yang ada Combat Grounds (empat area latihan dengan warded
  rings) dan Sparring Pavilion; Royal Arena ada di Avalon. Draft ini memakai warded rings di Combat Grounds sebagai "arena" untuk
  battle serius. Kalau yang kamu maksud bangunan arena tersendiri di Halvard, itu tempat baru (canon dan peta), dan perlu draft
  sendiri.
