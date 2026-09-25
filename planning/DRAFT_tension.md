# DRAFT — Tension: efek dari 0 sampai penuh, per kategori NPC

Status: **APPROVED oleh owner (2026-09-25), diterapkan di card v1.3.8.** Lihat "Keputusan owner" di bawah; bagian lain adalah proposal asli. Catatan dalam Bahasa Indonesia; teks yang masuk ke card (untuk narator) dalam Bahasa Inggris. Keputusan terbuka ada di bagian akhir, ditandai `[?]`.

## Masalah sekarang (v1.3.7)

- Tension 0–100 hanya punya aturan **naik-turun** (502: sindiran +3–5, hinaan +10–15, kekerasan +20–30, damai −5–10) dan dua penalti reputasi (70: −5, 100: −10).
- Tidak ada yang bilang ke narator **bagaimana NPC bersikap** di tiap tingkat, dan Tension **tidak berpengaruh** ke XP bond, bond event, atau apa pun. NPC dengan Tension 95 tetap bisa naik rank.
- Tension tidak pernah turun sendiri.

## Ide inti

Dua lapis:

1. **Tingkat (band) yang sama untuk semua NPC** menentukan *efek mekanis* (dijalankan engine), supaya adil dan bisa ditebak pemain.
2. **Kategori NPC** menentukan *bagaimana* ketegangan itu dimainkan (ditulis ke narator), supaya Krieg dan Ruby tidak bereaksi sama. Beberapa NPC punya **override** pribadi.

---

## Lapis 1 — Band dan efek mekanis (semua NPC)

| Tension | Nama band | Efek engine (usulan) |
|---|---|---|
| 0–19 | Calm | — |
| 20–39 | Friction | — (hanya sikap) |
| 40–69 | Strained | XP dari talk/hangout dipotong setengah |
| 70–89 | Hostile | −5 reputasi (sudah ada); **bond event ditahan** (bar tetap bisa penuh, event baru muncul setelah Tension < 70) |
| 90–100 | Enemy | −10 reputasi di 100 (sudah ada); **XP bond berhenti** sampai Tension < 70 |

- UI: dossier dan People menampilkan nama band di samping bar Tension ("Tension 45 · Strained"), plus hint "This bond will not grow while tension is this high" di 70+.
- Narator: entry Now (505) menulis satu baris untuk tiap NPC yang **hadir** dan Tension-nya ≥ 20, isinya perilaku band itu menurut kategorinya (contoh di bawah). NPC dengan Tension < 20 tidak menambah token.

## Lapis 2 — Kategori (5)

Setiap kategori punya kalimat perilaku untuk band Friction, Strained, Hostile, Enemy, ditambah **batas keras** (apa yang *tidak akan pernah* dilakukan NPC ini, supaya karakternya tidak rusak) dan cara Tension **turun**.

### 1. Withdrawn — menarik diri, terluka
Lembut, pemalu, atau penyayang. Konflik membuat mereka sedih dan menjauh, bukan menyerang.

- **Friction:** "Quieter than usual around {{user}}; answers short, smiles late."
- **Strained:** "Avoids {{user}}: leaves when {{user}} arrives, declines invitations politely, confides in someone else."
- **Hostile:** "Openly hurt: cries or goes silent, asks {{user}} to leave them alone; friends of theirs notice and cool toward {{user}}."
- **Enemy:** "Cuts {{user}} out entirely: changes seats, study groups, even routes across campus. Grieves the friendship; does not retaliate."
- **Batas keras:** never takes revenge, spreads rumours, or causes harm.
- **Turun:** mudah memaafkan. Tension −2 per hari tanpa konflik baru; permintaan maaf yang tulus −10–15.
- **NPC:** Ruby, Zara, Mimosa, Royhan, Alyssa, Vera, Trixie, Tilly, Lenna, Gareth `[?]`, Castor `[?]`, Milena `[?]`

### 2. Social — tajam lewat lidah dan pergaulan
Hidup dari citra dan kerumunan. Membalas lewat gengsi, gosip, dan siapa yang boleh duduk di mana.

- **Friction:** "Barbed compliments and pointed jokes at {{user}}'s expense."
- **Strained:** "Snubs {{user}} in public; leaves {{user}} out of plans and the good gossip."
- **Hostile:** "Works the room against {{user}}: rumours, mockery, turning mutual friends."
- **Enemy:** "Runs a campaign: humiliates {{user}} in front of a crowd and makes sure the story spreads."
- **Batas keras:** never physical violence; nothing that would ruin their own image if it came out.
- **Turun:** gengsi dulu. −1 per 2 hari; permintaan maaf **di depan umum** −15, yang pribadi hanya −5.
- **NPC:** Caralynn, Kanae, Florian, Aiden, Idris, Bobby

### 3. Confrontational — menantang langsung
Petarung dan orang yang menjunjung kehormatan. Konflik diselesaikan terang-terangan.

- **Friction:** "Blunt and challenging: calls {{user}} out, dares {{user}} to prove it."
- **Strained:** "Picks arguments; demands a spar or a contest to settle it."
- **Hostile:** "Open rivalry: goes after {{user}} in class, in training, in competitions."
- **Enemy:** "A formal challenge or a grudge match in front of witnesses; will not let it rest until it is settled."
- **Batas keras:** fights fair and to the rules (a duel, a match, a contest); never ambushes, sabotages in secret, or tries to kill.
- **Turun:** jarang turun sendiri (−1 per 3 hari), tetapi **pertarungan yang tuntas** (siapa pun yang menang) −20–30. Kalah dengan terhormat pun meredakan.
- **NPC:** Sophia, Percival, Saffi, Vallie, Dante `[?]`

### 4. Authority — memakai aturan
Staf dan pengurus: membalas lewat jabatan, bukan urusan pribadi.

- **Friction:** "Cooler and more formal with {{user}}; watches for mistakes."
- **Strained:** "Holds {{user}} strictly to the rules: marks down, refuses favours, catches every lateness."
- **Hostile:** "Uses the office: detention, reports to the Dorm Head, requests denied, a word with other staff."
- **Enemy:** "Formal action: a disciplinary hearing, a letter home, pushing for probation."
- **Batas keras:** stays inside their authority and the rules; never personal violence, never lies on the record.
- **Turun:** −1 per hari tanpa masalah; perbuatan baik yang **terlihat** (kerja keras, taat aturan) −5.
- **NPC:** Irene, Caspian, Baelin, Yvette, Gavlan, Layla, Kuroo, Ottavio, Rei

### 5. Dangerous — kuasa tanpa banyak rem
Punya kekuatan nyata dan sedikit sungkan. Tension setinggi ini adalah ancaman sungguhan.

- **Friction:** "Polite and attentive: remembers {{user}}'s name and asks one question too many."
- **Strained:** "Watches {{user}}: questions friends, checks {{user}}'s record, leaves small reminders of their reach."
- **Hostile:** "Moves against {{user}} quietly: leverage, pressure on the people around {{user}}, an investigation opened."
- **Enemy:** "Strikes with everything their position allows (Krieg: a Dovecote examination or an arrest on a pretext; Caine: the Noble Houses close their doors; Tristan: a binding oath called due)."
- **Batas keras:** acts through their power and never in a way that would bring down their own position; no random cruelty.
- **Turun:** **tidak turun sendiri.** Hanya lewat cerita: jasa besar, tawar-menawar, atau sesuatu yang mereka butuhkan.
- **NPC:** Krieg, Caine, Tristan
- **Efek engine tambahan (usulan):** saat mencapai 100, kalau {{user}} punya hidden magic, Krieg menambah Dove attention +10 `[?]`.

### Override pribadi (tidak cocok di satu kategori)

- **Etnie:** ketegangan tidak membuatnya pergi; ia makin melekat dan rapuh. Friction: "clingier, anxious". Strained: "follows {{user}}'s scent everywhere, jealous of anyone near". Hostile: "breaks down; clones appear when she panics". Enemy: "a crisis: stops eating and attending, as after the breach; Kuroo steps in". Batas keras: never harms {{user}}, never leaves {{user}}. Turun: satu momen hangat −20.
- **Althair (hard rule, owner 2026-09-25):** senang dibenci, jadi konflik justru mendekatkan. Tension-nya **terkunci di 0**: engine membatalkan setiap kenaikan, lalu mengubahnya jadi **XP bond**. Narator cukup menulis Tension seperti biasa; engine yang mengonversi.
  - Konversi (usulan): XP = kenaikan Tension ÷ 2, dibulatkan ke atas (hinaan +10 → +5 XP, pukulan +25 → +13 XP). Tidak memengaruhi Trust.
  - Batas anti-grind (usulan): paling banyak **+10 XP per hari** dari konversi ini, dan tetap berhenti di bar penuh seperti XP lain (rank tetap naik hanya lewat bond event).
  - Karena Tension selalu 0, tidak ada penalti reputasi dari bond Althair. Kalau menyerangnya terjadi di depan staf atau murid, narator tetap bisa memberi Rep_events biasa (misalnya Academy −) karena itu soal perbuatannya, bukan bond-nya.
  - Teks untuk narator: "Althair enjoys being disliked: hostility from {{user}} delights him and draws him closer. His Tension stays 0; the engine turns every rise into bond XP. React in character: beaming, curious, friendlier the ruder {{user}} is."
  - UI: bar Tension Althair diganti catatan kecil "Hostility only makes him fonder of you" setelah pertama kali ada konversi.
- **Ezrel:** apatis. Tension naik setengah dari biasanya; perilakunya tetap datar ("does not care, pleasantly") kecuali di Enemy, di mana ia berhenti membantu {{user}} sama sekali.

---

## Rancangan teknis (ringkas)

- `data/tension.json`: `bands` (batas + efek mekanis), `categories` (5 kategori: teks per band, batas keras, cara turun), `npcs` (id → kategori), `overrides` (Etnie, Althair, Ezrel).
- Engine: potongan dan penghentian XP, bond event ditahan di 70+, **decay harian** per kategori (hanya kalau hari itu tidak ada kenaikan Tension), multiplier Ezrel, efek khusus Krieg.
- Rule 502: tabel naik-turun yang sudah ada tetap; ditambah "how Tension goes down is the character's: see <now>".
- 505 (Now): satu baris per NPC hadir dengan Tension ≥ 20, contoh: `Sophia (Tension 55, strained): picks arguments; demands a spar or a contest to settle it. Never: an ambush or secret sabotage. Eases after a settled fight.`
- UI: nama band di bar Tension; hint bond tertahan.
- Perkiraan token: +20–40 per NPC tegang yang hadir; 0 kalau tidak ada.

## Cek terhadap prinsip desain

- **Tanpa ending:** Enemy bukan "bad route"; hubungan tetap bisa dipulihkan lewat cerita, dan rank tidak dihapus (lihat `[?]` rank turun).
- **Kebebasan:** pemain boleh memusuhi siapa pun; konsekuensinya sesuai karakter NPC, bukan hukuman seragam.
- **Anti-grind:** decay pelan dan permintaan maaf yang punya batas, jadi tidak bisa di-"farm" damai.

## Keputusan terbuka

- `[?]` **Jumlah kategori:** 5 seperti di atas, atau diringkas jadi 3 (Withdrawn, Confrontational, Dangerous; Social digabung ke Confrontational, Authority ke Dangerous)? Saya sarankan 5 karena Ruby vs Caralynn vs Irene memang beda cara marahnya.
- `[?]` **Penempatan yang saya ragukan:** Gareth (honour student dengan topeng?), Castor (mask NPC; Withdrawn di permukaan, Dangerous kalau rahasianya terusik?), Milena (Dove tapi hangat: Withdrawn atau Authority?), Dante (lawful dan kebapakan: Authority walau murid?), Kanae (mask: Social di permukaan).
- `[?]` **Mask NPC (Castor, Kanae, Caine):** kategori berubah setelah rahasia mereka terbuka (mis. Kanae jadi Dangerous)?
- `[?]` **Rank turun:** di Enemy, rank tetap (hanya XP berhenti), atau turun 1 setiap kali mencapai 100?
- `[?]` **Rival (Sophia, jalur "sworn rival" di Rank 8):** untuk kategori Confrontational, apakah potongan XP di Strained dihapus (bertengkar adalah cara mereka dekat)?
- `[?]` **Decay:** angka per kategori di atas oke, atau satu angka untuk semua?
- `[?]` **Krieg +10 Dove attention di Tension 100** (hanya kalau punya hidden magic): setuju?
- `[?]` **Penalti reputasi Social di Enemy:** tambah −5 Student (kampanye gosip) di luar −10 yang sudah ada, atau cukup yang sekarang?
- `[?]` **Althair:** konversi ÷2 dan batas +10 XP per hari oke? Atau konversi penuh (1:1)? Dan apakah konversi ikut aturan "talk/hangout sekali sehari" (jadi hanya satu kali per hari berapa pun jumlah konfliknya)?
- `[?]` **Cek penempatan:** ke-38 NPC ber-bond sudah ditempatkan (Withdrawn 12, Social 6, Confrontational 5, Authority 9, Dangerous 3, override 3). Tim akademi rival tidak punya bond, jadi tidak ikut.


## Keputusan owner (2026-09-25) — final

1. **5 kategori.**
2. **Pindah kategori:** Milena → Social; Castor, Dante, Gareth → Dangerous. Penempatan lain disetujui.
3. **Kanae: override pribadi.** Walau Tension maksimal, ia tetap menyukai {{user}}: bond-nya tidak terpotong (XP, bond event, rank), dan ketidaksenangannya diarahkan ke orang-orang di sekitar {{user}}, tidak pernah ke {{user}}.
4. **Rank turun** saat Tension mencapai 100 (−1, minimal 0; bar XP kosong). Tidak berlaku untuk Kanae (dan Althair, yang Tension-nya selalu 0).
5. **Confrontational: setiap pertarungan menurunkan Tension** (sparring, duel, adu kekuatan dengan NPC itu; −25, sekali sehari).
6. **Social di Enemy:** tambah −5 reputasi Student (kampanye gosip), di luar −5/−10 yang sudah ada.
7. **Krieg di Tension 100:** Dove attention +10 (kalau {{user}} punya hidden magic), dan reputasi Doves anjlok drastis (−40 Rep XP sekaligus).
8. **Decay per kategori disetujui.**
9. **Althair:** Tension terkunci di 0; setiap kenaikan jadi XP bond ÷2 (dibulatkan ke atas), maksimal +10 XP per hari.
10. Tidak diputuskan, jadi tetap default: potongan XP di Strained berlaku juga untuk Confrontational; kategori mask NPC tidak berubah setelah rahasia terbuka; Etnie ikut aturan rank turun.
11. **Tanpa batas untuk kenaikan Tension** (owner, 2026-09-25): tidak seperti XP bond, Tension tidak punya batas harian/mingguan; beberapa pelanggaran dalam satu balasan dijumlah. "Lebih mudah membuat musuh daripada teman": yang dibatasi hanya penurunannya (decay pelan, fight sekali sehari, maaf hanya menghapus sebagian). Engine memang tidak pernah membatasi kenaikan; 1.3.9 mempertegasnya di rule 502.

---

## Tambahan: permintaan maaf berbeda per kategori — APPROVED (owner 2026-09-25), diterapkan di v1.4.0

Permintaan owner: ada NPC yang pendendam dan ada yang mudah memaafkan, jadi efek permintaan maaf jangan disamaratakan.

**Sekarang (v1.3.9):** narator sendiri yang menurunkan Tension −5–10 untuk permintaan maaf, sama untuk semua NPC.

**Usulan mekanisme:**
- Narator tidak lagi menurunkan Tension sendiri untuk permintaan maaf; ia melaporkannya sebagai interaksi `{"With": "<nama>", "Kind": "apology"}`, ditambah `"Public": true` kalau permintaan maaf itu disampaikan di depan orang banyak.
- Engine yang menurunkan Tension sesuai kategori NPC.
- Anti-spam: hanya satu permintaan maaf per NPC per hari yang dihitung, dan permintaan maaf berikutnya dalam **minggu yang sama** hanya dihitung setengah ("maaf yang diulang-ulang makin tidak berarti") `[?]`.
- Tidak berlaku kalau Tension sudah 0.
- Penurunan karena cerita besar (menyelamatkan nyawa mereka, jasa besar) tetap boleh ditulis narator langsung.

**Usulan angka:**

| Kategori | Maaf pribadi | Maaf di depan umum | Alasan |
|---|---|---|---|
| Withdrawn | −20 | −20 | mudah memaafkan |
| Social | −5 | −15 | gengsi: yang penting dilihat orang |
| Confrontational | −5 | −5 | kata-kata murah; yang meredakan adalah pertarungan (−25) |
| Authority | −10 | −10 | diterima secara formal; perilaku baik yang terlihat lebih berarti |
| Dangerous | 0 | 0 | pendendam; hanya jasa, tawar-menawar atau sesuatu yang mereka butuhkan (lewat cerita) |
| Etnie | −25 | −25 | satu momen hangat sudah cukup |
| Kanae | −20 | −20 | perhatian {{user}} cepat meredakannya |
| Ezrel | 0 | 0 | tidak peduli; hanya waktu yang meredakan |
| Althair | — | — | Tension-nya selalu 0 |

**Keputusan terbuka:**
- `[?]` Angka di tabel oke?
- `[?]` Permintaan maaf kedua dan seterusnya dalam minggu yang sama dihitung setengah: oke, atau cukup dibatasi sekali sehari?
- `[?]` Apakah ada NPC tertentu yang perlu angka sendiri di luar kategorinya (misalnya Sophia yang menghina orang pengecut: maaf malah menaikkan Tension)?

**Keputusan owner:** (1) angka tabel disetujui; (2) permintaan maaf kedua dan seterusnya dalam minggu yang sama dihitung setengah; (3) ya, ada NPC dengan aturan sendiri: **Sophia** membenci pengecut, jadi permintaan maaf dari {{user}} justru **menaikkan** Tension-nya (+10) dan tidak pernah meredakannya; yang meredakan tetap pertarungan. NPC lain bisa diberi aturan serupa di `data/tension.json` (`apology_npc`).
