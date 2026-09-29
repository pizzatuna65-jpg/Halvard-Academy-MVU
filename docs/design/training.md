# Fitur latihan (Mana pool & Stamina)

Status: **FINAL** (keputusan author 2026-09-25).

## Aturan inti

- {{user}} bisa berlatih untuk menaikkan **Mana pool** atau **Stamina**. Keduanya jalur terpisah dengan batas masing-masing.
- **Batas total:** latihan menaikkan paling banyak **2× nilai awal {{user}}** (kenaikan maksimal = +100% dari nilai awal).
  Batas ini berlaku seumur campaign, bukan per semester.
- **Tempo:** pemain yang niat grind butuh sekitar **satu tahun akademik** (M1–M11) untuk mencapai batas itu.
- Partner dan item bond membuat latihan **lebih efektif**, tapi tidak menaikkan batas (lihat `bond_rewards.md`):

**Partner latihan** (gift Rank 5): satu laki-laki dan satu perempuan per jalur, supaya pemain bisa memilih. Bonus hanya
berlaku kalau partner itu hadir di scene.

| Partner | Jalur | Bonus |
|---|---|---|
| Saffi (peluit Running Club) | Stamina | ×1.5 |
| Percival (lencana Brotherhood, dawn drills) | Stamina | ×1.5 |
| Sophia (buku taktik, latihan mana pagi) | Mana pool | ×1.5 |
| Gareth (jurnal latihan mana) | Mana pool | ×1.5 |

**Lompatan sekali** (+10% nilai awal, di luar batas mingguan, tetap di dalam batas total 2×):

| Sumber | Jalur |
|---|---|
| Vallie (Rank 10) | Stamina |
| Gavlan (gift Rank 5, bracer + seminggu latihan pagi) | Mana pool |

- Bonus **dijumlahkan, bukan dikalikan** (berlatih bersama dua partner = ×2.0).

## Angka implementasi

Semua angka dihitung sebagai **persen dari nilai awal {{user}}**, jadi berlaku untuk nilai awal berapa pun.

| Aturan | Nilai | Contoh nilai awal 100 |
|---|---|---|
| Satu sesi latihan | +1% dari nilai awal × bonus aktif | +1 (Saffi: +1.5) |
| Batas mingguan per jalur (setelah bonus) | +2.5% dari nilai awal | +2.5 per minggu |
| Batas total per jalur | +100% dari nilai awal | maksimal 200 |
| Waktu minimal untuk mencapai batas total | ~40 minggu | kira-kira M10 W4 tahun 1 |

- **Satu tahun akademik = 44 minggu** (M1–M11; M12 libur). Dengan batas 2.5% per minggu, batas total tercapai paling cepat
  sekitar minggu ke-40. Pemain yang melewatkan beberapa minggu masih bisa menyusul sampai akhir tahun, tapi tidak lebih cepat.
- **Bonus mempercepat, bukan menaikkan batas:** tanpa partner butuh 3 sesi seminggu untuk mencapai batas mingguan; dengan
  satu partner (×1.5) cukup 2 sesi. Waktu yang tersisa bisa dipakai untuk hal lain.
- **Lompatan Vallie dan Gavlan:** tidak terkena batas mingguan, tapi **tetap di dalam** batas total 2×. Kalau nilainya sudah
  dekat batas, lompatannya hanya sampai batas.
- **Setelah mencapai batas total**, latihan tetap bisa dimainkan sebagai cerita (menjaga kondisi, sparring), tapi tidak
  menambah angka.
