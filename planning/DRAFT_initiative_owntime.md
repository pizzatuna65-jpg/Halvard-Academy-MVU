# DRAFT 2.4.1 — Alasan initiative dari Own time (roadmap M4, tahap 2 dari 3)

Status: menunggu review owner ("proceed" / "approve"). 2.4.0 dibagi tiga tahap (owner, 2026-10-24, hemat usage):
2.4.0 = M3 rubrik koran "Campus life" (selesai); **2.4.1 = M4a alasan initiative** (draft ini); 2.4.2 = M4b NPC cedera di Healing Ward.

## Cara kerja (usulan)

- Titik: `stepInitiative`, saat alasan hari itu dipilih (`I.askDay`). Kalau NPC initiative punya baris Own time 1–2 hari terakhir
  (`sh:ownOf`, sama dengan yang dilihat Cast Sheet) dan item-nya punya teks `ask` di bawah, ada peluang **1 dari 3** (`d100` seeded per
  hari dan NPC) alasannya diambil dari kejadian itu. Selain itu alasan lama dan hari favour tetap jalan seperti biasa.
- Masuk daftar "tidak terulang dalam 20" (`I.used`, kunci `own|<item>`), jadi kejadian yang sama tidak jadi alasan dua kali.
- Tidak pernah saat strained (Tension 70+: alasan strained tetap) dan tidak untuk kategori `authority` bila teksnya terlalu akrab
  (kolom "bukan untuk" di tabel).
- 0 token tambahan: memakai baris initiative yang sudah ada (`$ui.initiative.ask`). Toggle: ikut "Own time" (off = tidak ada).
- Data: field `ask` per item di `data/offscreen.json` (opsional), divalidasi `gen_engine.py` (placeholder sama dengan `text`).

## Teks (English, untuk disetujui)

Mengikuti gaya `initiative_asks.json`: kalimat sesudah nama NPC, present tense, boleh {{user}}, placeholder sama dengan baris Own time.

| Item | `ask` | Bukan untuk |
|---|---|---|
| beat_rival | wants to tell {{user}} how they beat {rival}, in more detail than anyone needs | withdrawn |
| lost_bet_rival | wants {{user}}'s help winning back what they lost to {rival} | authority |
| words_with_rival | wants to talk through what happened with {rival} at {place} | — |
| good_club_day | is still pleased about the last {club} session and wants {{user}} to hear about it | — |
| bad_club_day | wants to get the last {club} session off their chest | — |
| new_spell | wants {{user}} to see the new spell they have been trying | — |
| skirmish | wants to show {{user}} the move that won the skirmish at {place} | authority |
| bought_thing | wants to show {{user}} the {thing} they bought | — |
| bargain_thing | wants to tell {{user}} where they found {thing} going cheap | — |
| letter_home | got a letter from home and wants someone to talk to about it | — |
| marks_bad | wants help with the subject they were marked down in, without saying so | — |
| lost_small | wants a hand looking for the thing they lost | — |
| good_class | wants to tell {{user}} about a class that went better than expected | — (staff) |

Item lain (slept_badly, late_class, told_off, staff_meeting, marking, dll.) tidak punya `ask`: tidak jadi alasan.

## Tes (rencana)

`test_initiative_own_v2410.cjs`: peluang sekitar 1/3 bila ada baris Own time; tidak pernah saat strained atau Own time off; tidak
terulang dalam 20; alasan favour tetap muncul; tidak ada `{` tersisa.

## [?] Keputusan terbuka

1. Peluang 1 dari 3 (FUTURE_PLANS menyarankan "mis. 1 dari 3"): setuju, atau 1 dari 2?
2. Jendela 2 hari (sama dengan `show` Cast Sheet), atau sampai 3 hari?
