# DRAFT — Kategori baru: World Myth

Status: **menunggu approve owner.** Permintaan owner (2026-09-26): "add kategori entry baru namanya world myth, gk ush terlalu detail,
lengthnya sama seperti kategori brand, takhayul, ghost story dsb". Isinya canon baru, jadi lewat draft dulu (aturan "Draft, then proceed").
Catatan dalam bahasa Indonesia; teks card dalam bahasa Inggris.

## Bedanya dengan kategori yang sudah ada

- **Ghost Story / Superstition** = folklore murid Halvard (skala kampus).
- **World Myth** = mitos rakyat se-Eldrasil (skala kerajaan/dunia): cerita yang dibawa murid dari rumah, diajarkan Cathedral, atau
  jadi dongeng anak. Bukan sejarah: History Class tidak mengajarkannya sebagai fakta.
- Tidak ada yang membuka rahasia plot. Lucifer tidak disebut (namanya tidak dikenal di luar cult). Misteri resmi (nama Archmage yang
  hilang, kenapa makam dan elixir disegel) tetap misteri: mitos hanya jawaban rakyat yang tidak dikonfirmasi.
- Archmage ditulis **they** (canon: gender dan nama Archmage tidak diketahui).

## Entry (teks card)

Format sama dengan Superstition/Ghost Story: judul, `Story`, `Told`, `Status`. Panjang 45–60 kata, sama dengan kategori lain.
Setting entry disalin dari Superstition (order 65, position 0, keyword biasa).

### 1. World Myth - The Gift of Asmoday
Keys: `Gift of Asmoday`, `Asmoday's gift`, `creation myth`, `by her spark`
```
[The Gift of Asmoday]
Story: Asmoday shaped the world in silence, then set a spark of her own making in every newborn so mortals could shape things too. Mana is that spark.
Told: by the Cathedral and every Asmoday's Mercy house; the version most of Eldrasil grows up with.
Status: faith, not History Class. "By her spark" is an old blessing muttered before a hard casting.
```
Catatan: ini versi publik yang memang sudah canon (Cathedral mengajarkan Asmoday menciptakan sihir). Ironi dengan rahasia Lucifer
("every mage's mana is his light") sengaja, tapi tidak membocorkan apa pun.

### 2. World Myth - The Sleeping Archmage
Keys: `Sleeping Archmage`, `Archmage sleeps`, `Archmage is sleeping`, `Archmage will wake`
```
[The Sleeping Archmage]
Story: the Archmage never died. They lay down among their books beneath Veyra to sleep, and will wake the day all four seals fail, to lay them again.
Told: a bedtime story across Eldrasil, meant to comfort.
Status: History Class says tomb, not bed. Veyra students are tired of being asked whether the Archmage snores.
```
Catatan: cocok dengan Morgana Vess (Nocturne, "the tomb beneath Veyra calls to her in dreams") tanpa mengubah apa pun di entry-nya.

### 3. World Myth - The Monster's Dreams
Keys: `Monster's dreams`, `Myrdath dream`, `shared nightmare`
```
[The Monster's Dreams]
Story: the thing sealed under Myrdath cannot move, so it dreams, and its dreams drift south with the winter wind.
Told: in the north. Two people waking from the same nightmare on the same night call it "a Myrdath dream".
Status: nobody has proved it or disproved it. Northern students say it louder in winter.
```

### 4. World Myth - The King Who Could Not Die
Keys: `King Who Could Not Die`, `why the Elixir is sealed`, `Elixir myth`
```
[The King Who Could Not Die]
Story: a king once drank from the Elixir. His wounds closed and his sickness left him, and then he could not die, and he begged the Archmage to seal the rest away.
Told: a cautionary tale for greedy children, mostly in the east.
Status: a folk answer to why a cure was sealed at all. History Class does not know the real one.
```
Catatan: canon "kenapa elixir disegel" tetap terbuka; ini hanya cerita rakyat.

### 5. World Myth - The Falling Stars
Keys: `falling star`, `falling stars`, `shooting star`, `Star Night wish`
```
[The Falling Stars]
Story: every star that falls on Star Night is a mage who died that year, spending the last of their spark on a stranger's wish.
Told: across Eldrasil; it is why a Star Night wish is believed to come true.
Status: since the breach, Halvard students make their Star Night wishes in silence.
```
Catatan: menjelaskan kepercayaan yang sudah ada di entry Star Night ("A wish made during it is believed to come true") dan
menyambung ke breach dan Remembrance Day tanpa menambah fakta baru.

## Implementasi setelah approve

1. `tools/merge_lorebooks.py`: tambah 5 entry baru di `C` (uid **273–277**, masih kosong), `template_from(C[222], ...)` dengan
   `comment="World Myth - <judul>"`, keys dan content di atas; assert uid belum dipakai (pola yang sama dengan Fishing House).
2. WORLD INDEX (entry 0), bagian EXISTS, satu baris sesudah Superstitions:
   `World myths, folk belief across Eldrasil, not history: the Gift of Asmoday (creation), the Sleeping Archmage, the Monster's Dreams (Myrdath), the King Who Could Not Die (the Elixir), the Falling Stars (Star Night wishes).`
3. Opsional: tautkan di panel lokasi (`curate_data.py` LORE): Cathedral → 273, Grassy Field and Hills → 277.
4. Rebuild dari `merge_lorebooks.py` onward, rilis **1.7.1** (bump `character_version`, PROGRESS, save lama tetap load; tidak ada
   perubahan state jadi tidak ada migrasi), lalu tambahkan ke `NPC_BRAINSTORM_BRIEF.md`.

## Keputusan terbuka

- [?] Lima mitos ini cukup, atau ada yang mau diganti/ditambah? (Ghost Story ada 5, Superstition 5, Brand 8.)
- [?] Mitos tentang nama Archmage yang hilang **sengaja tidak dibuat**: terlalu dekat dengan misteri plot (Lucifer menyebut Archmage
  "the thief" dan tidak pernah menyebut namanya). Tambahkan hanya kalau owner mau.
- [?] Tautan ke panel lokasi (langkah 3): ya atau tidak.
