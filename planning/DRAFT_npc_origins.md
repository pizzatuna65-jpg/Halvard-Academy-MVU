# DRAFT — Asal negara untuk NPC (Nations 1.7.2)

Status: **draft, belum diterapkan.** Arahan owner 2026-09-27. Aturan owner: yang tidak dikomentari owner = disetujui.
Catatan dalam bahasa Indonesia; teks card dalam bahasa Inggris.

Batasan canon: murid adalah anak Eldrasil (Idris: "sent to Halvard at 18, as every gifted child is"). Jadi untuk murid, yang
datang dari negara lain adalah **keluarganya**, dan murid itu sendiri lahir di Eldrasil.

## 1. Idris Ainsworth — keluarga imigran dari Arslan Sultanate (owner)
File: `source_original/npc_lore_2026-09-25/lore_year2.md`.

Sebelum:
> Backstory: Son of well-off fur traders in the dry south, meant to inherit the business until he was sent to Halvard at 18, as every gifted child is.

Sesudah:
> Backstory: Son of well-off fur traders in the dry south; his parents came from the Arslan Sultanate before he was born and settled there, and the family still haggles the Arslan way. He was meant to inherit the business until he was sent to Halvard at 18, as every gifted child is.

Cocok dengan canon: "Loves: A good bargain", "the Sky trio's ... most confident haggler", Beastkin ular (gurun), selatan yang kering.

## 2. Vera Pulsar — keluarga pernah membuka toko di Caelmar sebelum menetap di Eldrasil (owner)
File: `source_original/npc_lore_2026-09-25/lore_year1.md`.

Sebelum:
> Backstory: Youngest of three in a family of clockmakers and instrument-makers in a mid-sized town, and the only mage among them.

Sesudah:
> Backstory: Youngest of three in a family of clockmakers and instrument-makers. The family came to Caelmar as immigrants and kept a shop on one of its middle layers, where her older siblings were born, before settling in a mid-sized town in Eldrasil; Vera was born there, the only mage among them.

Tambahan kecil: di Relations Vera sudah ada Bobby ("tries to understand his mechanical props"). Satu baris di lore Bobby:
> Vera Pulsar's family kept a shop in Caelmar; the two of them can argue about Caelmari clockwork for an hour.

## 3. Bobby Becket — dari lapisan bawah Caelmar (usulan Claude sebelumnya)
File: `source_original/npc_lore_2026-09-25/lore_others.md`.

Sebelum:
> Backstory: Grew up helping in his family's repair shop and learned his first card tricks from a travelling performer who lodged with them. Took the Halvard maintenance post in his early twenties.

Sesudah:
> Backstory: Grew up helping in his family's repair shop on one of Caelmar's lower layers, and learned his first card tricks from a travelling performer who lodged with them. One of the few Caelmari who ever leave their layer, he took the Halvard maintenance post in his early twenties.

## 4. Althair Veyne — cerita masa lalunya kini memakai seluruh benua (usulan Claude sebelumnya)
File: `source_original/npc_lore_2026-09-25/lore_staff.md`. Canon "never settle his backstory" tetap; baris baru sesudahnya:
> His stories now borrow the whole continent: one week he grew up on Caelmar's top layer, the next he was a clerk at the World Bank, the week after he nearly won the Alpha tournament in Yozakura.

## Implementasi setelah approve

Edit baris di file lore owner, rebuild dari `merge_lorebooks.py` onward, rilis **1.7.3** (tidak ada perubahan state; save 1.7.2
tetap load), tes: keempat baris ada, Idris dan Vera tetap lahir di Eldrasil.
