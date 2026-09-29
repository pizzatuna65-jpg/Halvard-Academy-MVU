# DRAFT — Asal negara untuk NPC (Nations 1.7.2)

**DITERAPKAN di rilis 1.7.3 (2026-09-27)**, atas "Approve" owner; keduanya pindah ke Eldrasil di usia 12 (owner).

Status sebelumnya: **draft, belum diterapkan.** Arahan owner 2026-09-27. Aturan owner: yang tidak dikomentari owner = disetujui.
Catatan dalam bahasa Indonesia; teks card dalam bahasa Inggris.

Canon Idris "sent to Halvard at 18, as every gifted child is" hanya berarti setiap anak berbakat yang tinggal di Eldrasil dikirim
ke akademi. Lahir atau tumbuh di negara lain tidak masalah, asal keluarganya sudah menetap di Eldrasil sebelum anak itu 18 tahun.
Bobby dan Althair dibatalkan (owner, 2026-09-27).

## 1. Idris Ainsworth — keluarga imigran dari Arslan Sultanate (owner)
File: `source_original/npc_lore_2026-09-25/lore_year2.md`.

Sebelum:
> Backstory: Son of well-off fur traders in the dry south, meant to inherit the business until he was sent to Halvard at 18, as every gifted child is.

Sesudah:
> Backstory: Born in the Arslan Sultanate to a family of fur traders, who moved to Eldrasil when he was twelve and settled in the dry south, where they did well; the family still haggles the Arslan way. He was meant to inherit the business until he was sent to Halvard at 18, as every gifted child is.

Cocok dengan canon: "Loves: A good bargain", "the Sky trio's ... most confident haggler", Beastkin ular (gurun), selatan yang kering.

## 2. Vera Pulsar — keluarga pernah membuka toko di Caelmar sebelum menetap di Eldrasil (owner)
File: `source_original/npc_lore_2026-09-25/lore_year1.md`.

Sebelum:
> Backstory: Youngest of three in a family of clockmakers and instrument-makers in a mid-sized town, and the only mage among them.

Sesudah:
> Backstory: Youngest of three in a family of clockmakers and instrument-makers, and the only mage among them. The family came to Caelmar as immigrants and kept a shop on one of its middle layers, where Vera was born, before settling in a mid-sized town in Eldrasil when she was twelve.


## Implementasi setelah approve

Edit baris di file lore owner, rebuild dari `merge_lorebooks.py` onward, rilis **1.7.3** (tidak ada perubahan state; save 1.7.2
tetap load), tes: kedua baris ada, dan keluarga Idris dan Vera menetap di Eldrasil sebelum mereka 18.
