# DRAFT: lapisan info per NPC (rework hadiah info dari rank)

Status: draf, menunggu "proceed" dari owner. Menyentuh keputusan DECISIONS "Trust" (1.4.3, apa yang dibagikan per band) dan
`data/bond_rules.json` `share` (1.2.2: delapan tingkat yang sama untuk semua NPC). Teks berbahasa Inggris di dalam kotak adalah
wording kartu yang diusulkan.

## 1. Masalah sekarang

Usulan owner (2026-10-22): "tergantung openness NPC, ada yg rank 0, rank 1/rank 2 untuk info publik/gk masalah ditanya kaya magic
dsb. untuk info yg lebih deep naik 1 rank, untuk info lebih deep lagi naik 1 rank atau lebih, dan mungkin tiap npc punya rank yg beda
beda untuk letak info yg deep dan lebih deep."

Yang terjadi di playtest: Charles, Rank 0 dengan Trixie, mendapat Goals (Rank 5), pandangan soal Doves (Rank 6) dan Backstory (Rank 7)
dalam tiga balasan. Ada tiga penyebab:

- **Tangga yang sama untuk semua orang.** `curate_data.py` `RANK` memberi rank menurut judul field: Backstory selalu 7, Goals selalu 5.
  Untuk Trixie ini tidak cocok dengan karakternya: sirkus keluarganya praktis publik (lorenya: "Everyone at Halvard knows who Trixie
  is", dan sirkus itu datang ke akademi di Bulan 8), dan goal-nya "completely sincere" ia ceritakan ke siapa pun. Jadi mekaniknya
  memaksa NPC menyembunyikan hal yang tidak akan ia sembunyikan, padahal prinsip desain melarang itu.
- **Dossier dan narrator memakai aturan berbeda.** Openness menggeser tangga narrator (open +2, guarded -1, closed -2, hanya untuk
  tingkat di bawah 5), tetapi dossier mengabaikannya, kecuali Birthday. Akibatnya Trixie "shares magic" ke narrator pada Rank 0,
  sementara field Magic di dossier baru terbuka pada Rank 2.
- **Baris narrator kabur.** `<now>` hanya menulis "Not yet: likes, dislikes, hobbies and birthday and beyond". Goals, Doves dan Backstory
  tidak disebut, padahal lore yang dibaca narrator memuat semuanya dengan judul `Goals:`, `Doves:`, `Backstory:`.

## 2. Desain: tiga lapisan, rank per NPC

Setiap field dossier masuk ke satu lapisan. Rahasia (`field_overrides.json` 99, terbuka hanya lewat `Secrets_revealed`) tidak berubah.

| Lapisan | Isi bawaan (judul field) |
|---|---|
| **Publik** | Role, Teaching, Duties, Work, Appearance, Name, Full name, Nickname, Age, Club, Speech, Haunts, Stigma, Standing, Reputation, Magic, Skills, Weapon, Equipment, Pact, Business, Consultations, Fee, Peak season |
| **Dalam** | Birthday, Loves, Hates, Hobby, Hobbies, Quirk, Inventory, Cupid, Personality, Traits, Emotional tells, Notes, Serious mode, Discretion, Flaw, Competing clients, Goals, Now, Current trouble, Current case |
| **Lebih dalam** | Relations, Doves, Politics, Conflicts, Quietly distrusts, Backstory, Family, Home, History, Trauma |

Rank tiap lapisan mengikuti openness (`data/bond_openness.json`), sesuai kalimat owner: Dalam = Publik + 1, Lebih dalam = Dalam + 1
atau lebih.

| Openness | Publik | Dalam | Lebih dalam | NPC |
|---|---|---|---|---|
| open | 0 | 1 | 2 | 27 (Trixie, Etnie, Ruby, …) |
| normal | 1 | 2 | 4 | yang tidak terdaftar |
| guarded | 2 | 3 | 5 | 13 (Irene, Zara, Kanae, …) |
| closed | 2 | 3 | 6 | 5 (Krieg, Ottavio, Mimosa, Caine, Ines) |

**Per NPC** (`data/info_layers.json`, baru): sebuah NPC boleh punya rank lapisannya sendiri dan boleh memindahkan field ke lapisan lain.
Contoh untuk Trixie:

```json
"Trixie": { "move": { "Backstory": "public", "Goals": "public" } }
```

Saya isi file ini saat membangun rilisnya, dari lore tiap NPC (Personality, Notes, Speech), hanya untuk NPC yang lapisan bawaannya
bertentangan dengan karakternya. Daftar lengkapnya masuk CHANGELOG di bawah "to confirm with the owner", supaya bisa Anda koreksi
satu per satu.

**Tidak ada yang terkunci ulang.** Sebuah field tidak pernah terbuka lebih lambat dari sekarang: rank barunya = yang lebih kecil
antara rank lapisan dan rank lamanya. Save lama tetap melihat semua yang sudah terbuka. (Contoh: Club milik NPC guarded tetap Rank 1,
bukan 2.)

**Trust tetap menggeser apa yang diceritakan ke narrator** (`trust.json` `share`: Doubtful satu lapisan lebih sedikit, Trusting dan
Confidant lebih banyak, Betrayed tidak menceritakan hal baru). Dossier tetap memakai rank saja, supaya tidak terkunci ketika Trust turun.

## 3. Narrator: judul yang ditahan disebut satu per satu

Baris "Bond" di `<now>` (dan Cast Sheet) memakai data yang sama dengan dossier dan menyebut judul lore yang ditahan. Trixie hari ini
(dengan pindahan di atas):

> Bond (open, neutral): tells freely what her lore lists under Role, Appearance, Age, Club, Speech, Haunts, Magic, Backstory, Goals.
> Held back for now, deflected in her own way if asked (pushing adds Tension): Loves, Hates, Birthday, Personality, Emotional tells,
> Notes (from Rank 1); Relations, Doves (from Rank 2).

Kalimat di aturan 504 ("asked for more than they share yet, they deflect in their own way") tetap. Preset tidak disentuh: aturan ini
menyebut Bonds dan lore kartu, jadi tempatnya di kartu.

## 4. Lalu apa hadiah Rank 3 sampai 10?

Info pribadi habis di Rank 2 (open) sampai Rank 6 (closed). Rank yang lebih tinggi tetap berisi:

- perk yang sudah ada (`bond_rules.json` `perks`): Rank 4 latihan bersama +25%, Rank 5 minta bantuan untuk goal-nya, Rank 6
  dikenalkan ke NPC baru, Rank 7 masuk dorm, Rank 8 sahabat/romansa/rival, Rank 9 membela reputasi, Rank 10 berkorban;
- rahasia lewat cerita (field 99 dan `Secrets_revealed`), yang tidak pernah dibuka rank.

Ini mengubah prinsip desain "high ranks open information" (CLAUDE.md): info kini datang lebih awal, dan rank tinggi membuka perk dan
rahasia. Teks perk Rank 5 diubah dari "shares their goal and may ask for help with it" menjadi "may ask for help with their goal",
karena goal kini terbuka lewat lapisan.

## 5. Rencana kode (memakai sistem yang ada)

- `tools/curate_data.py`: `RANK` menjadi `LAYER` (judul ke lapisan); rank field = min(rank lapisan NPC, rank lama).
- `data/bond_rules.json`: `share` (delapan tingkat) diganti `layers` (rank per openness); `share_real_from` dihapus.
- `data/info_layers.json` baru (rank dan pindahan per NPC); `field_overrides.json` (99) tetap.
- `tools/gen_ui.py`: `birthdayOffsets` dihapus (Birthday ikut lapisan Dalam); `fieldUnlocked` tidak berubah.
- `engine.template.js` baris Bond di `<now>` (sekitar 6490): judul yang terbuka dan yang ditahan per NPC dari data yang sama.
- Tes: dossier dan narrator setuju untuk semua NPC; tidak ada field yang terbuka lebih lambat dari 1.88.1; Trixie Rank 0 menahan
  Loves sampai Doves; save 1.88.1 termuat tanpa kehilangan data. Tidak perlu migrasi state (yang berubah hanya data).

## Pertanyaan terbuka

Tidak ada yang menghalangi. Angka di tabel openness (normal 1/2/4, guarded 2/3/5, closed 2/3/6) adalah usulan saya; kalau Anda diam,
angka itu yang dipakai.
