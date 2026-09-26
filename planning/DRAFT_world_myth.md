# DRAFT — Kategori baru: World Myth

Status: **draft, belum diterapkan.** Owner menulis sendiri 5 mitos; draft ini mengumpulkan versi Inggrisnya satu per satu.
Diterapkan ke card hanya setelah kelima mitos lengkap dan owner approve. (Lima usulan awal dari Claude ditarik.)
Catatan dalam bahasa Indonesia; teks card dalam bahasa Inggris.

## Aturan kategori

- **Ghost Story / Superstition** = folklore murid Halvard (skala kampus). **World Myth** = mitos dunia/kerajaan, dibawa murid dari
  rumah; bukan sejarah yang diajarkan History Class sebagai fakta.
- Format sama dengan Superstition/Ghost Story: `[Judul]`, `Story`, `Told`, `Status`. Panjang 45–60 kata.
- **Mitos sudah sangat tua: nama dan wujud setiap tokoh tidak diketahui** (owner, 2026-09-26). Teks tidak memberi nama, rupa,
  atau gender tokoh mana pun; tiap entry menyebutnya di `Status`.
- Setting entry disalin dari Superstition (order 65, position 0, keyword biasa). Comment: `World Myth - <judul>`.

## Mitos

### 1. World Myth - The Devoured Kingdom (owner)
Asli owner: Ribuan tahun lalu ada satu kerajaan yang rajanya melakukan pact dengan Spirit Lord, Lord of All, Azathoth. Detail pact
tidak ada yang tahu pasti, tapi bayaran Azathoth adalah melahap seluruh kerajaan raja itu hingga tempat itu kini menjadi Primal
Desert, lokasi Arslan Sultanate sekarang.

Keys: `Azathoth`, `Lord of All`, `Primal Desert`, `Arslan Sultanate`, `Arslan`, `Devoured Kingdom`
```
[The Devoured Kingdom]
Story: thousands of years ago, a king made a pact with Azathoth, Lord of All, a Spirit Lord. Nobody knows what the king asked for. Azathoth's price was the king's entire kingdom, devoured to the last stone. What remains is the Primal Desert, where the Arslan Sultanate stands today.
Told: across the world, as the oldest warning about pacts with Spirit Lords.
Status: nobody knows the terms of the pact, the king's name, or the name of the kingdom.
```

### 2. World Myth - The Four Who Saved the World (owner)
Asli owner: 4 legendary figure that once saved the world long time ago: the King of Knights from the north, the Archmage from the
east, the Lady of the Lake from the south, the Empress of the Fractured Vow from the west.

Keys: `King of Knights`, `Lady of the Lake`, `Empress of the Fractured Vow`, `Fractured Vow`, `four heroes`, `Four Who Saved the World`
```
[The Four Who Saved the World]
Story: long ago, when the world nearly ended, four heroes saved it: the King of Knights from the north, the Archmage from the east, the Lady of the Lake from the south, and the Empress of the Fractured Vow from the west.
Told: across the continent. Every land tells its own hero as the one who mattered most; Eldrasil, in the east, tells the Archmage.
Status: their names and faces are lost. No two versions agree on what the world was saved from.
```
Catatan kanon (owner, 2026-09-26): arah mata angin = arah **benua**; Eldrasil ada di timur benua, jadi "the Archmage from the east"
= tokoh Eldrasil. Ini **Archmage yang sama** dengan canon (pemasang keempat segel, makam di Veyra). Cocok dengan canon "nama
Archmage hilang dari semua catatan"; teks tidak memberi nama atau gender.

### 3. (menunggu owner)

### 4. (menunggu owner)

### 5. (menunggu owner)

## Implementasi setelah kelima mitos di-approve

1. `tools/merge_lorebooks.py`: 5 entry baru di `C` (uid **273–277**, masih kosong), `template_from(C[222], ...)`, assert uid belum dipakai.
2. WORLD INDEX (entry 0), bagian EXISTS, satu baris sesudah Superstitions: `World myths, not history: ...` (daftar kelima judul).
3. Entry Kingdom — Eldrasil (uid 1): "Other nations: exist; Sunreach Bay and Velmora are named." → tambah Arslan Sultanate, dan
   fakta baru owner: Eldrasil terletak di timur benua (juga satu kata di WORLD INDEX: "Kingdom: Eldrasil, in the east of the continent.").
4. Rebuild dari `merge_lorebooks.py` onward, rilis **1.7.1** (tidak ada perubahan state; tes save 1.7.0 tetap load).

## Keputusan terbuka

- [?] Judul "The Devoured Kingdom" dan kalimat `Told` / `Status` di mitos 1 buatan Claude (owner tidak memberi judul). Ganti kalau mau.
- [?] Mitos 2: judul, `Told` dan `Status` buatan Claude (termasuk "tidak ada yang sepakat dunia diselamatkan dari apa").
- [x] Mitos 2: Archmage yang sama dengan canon; arah = arah benua, Eldrasil di timur benua (owner).
- [x] Nama dan wujud tokoh di semua mitos tidak diketahui; kerajaan di mitos 1 juga tanpa nama (owner).
- [?] Opsional: sihir Elion Villeneuve bernama "Excalibur". Boleh dikaitkan ke King of Knights / Lady of the Lake, atau dibiarkan.
- [x] Keyword `Arslan` / `Arslan Sultanate`: owner akan membuat entry negara (draft terpisah, ukuran sama dengan entry ini). Begitu
  Arslan Sultanate punya entry sendiri, keyword `Arslan` pindah ke sana; mitos ini hanya memakai `Primal Desert`, `Azathoth`,
  `Lord of All`, `Devoured Kingdom`.
