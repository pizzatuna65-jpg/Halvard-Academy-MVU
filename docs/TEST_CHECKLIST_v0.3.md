# Test checklist — Eldrasil v0.3 (Batch 3)

Semua tes v0.2 (`TEST_CHECKLIST_v0.2.md`) tetap berlaku. Di bawah ini hanya tambahan untuk Batch 3.

## Setup
1. Import ulang `Eldrasil_Halvard.png` (timpa kartu lama). Pilih **Import** saat ditanya soal lorebook bawaan.
2. Buka Tavern Helper → Scripts → Character scripts. Pastikan empat skrip menyala: **MVU**, **Schema**, **Engine**, dan **Eldrasil UI**.
3. Buka Tavern Helper → Regex (lokal kartu). Pastikan "Eldrasil — Bracelet status bar (display)" aktif.
4. Buat chat baru.

## Status bar (3.1)
- [ ] Di bawah pesan pembuka muncul bracelet: jam "Mon 07:30", "Month 1, Week 1", lokasi, 300 pts, badge "Unsorted", tiga bar vital, chip "Entrance Event", dan kotak "Create your student".
- [ ] Tombol panah (collapse) mengecilkan bar, dan statusnya tetap tersimpan saat reload.
- [ ] Setelah AI membalas, bracelet pindah ke balasan terbaru. Bracelet di pesan lama hilang sendiri.
- [ ] Tampilan di HP: tiga bar vital tetap sejajar dan tidak ada scroll horizontal.

## Student Builder (3.2)
- [ ] Klik "Create your student" (atau tombol **Builder** di bawah kotak input). Panel builder terbuka.
- [ ] Pilih sampel "Secret unmaker", lalu cek semua halaman. Halaman Review tidak menampilkan error merah.
- [ ] Ubah "Cover's type" jadi Elemental. Di Review muncul peringatan kuning soal Arbiter Stone. Kembalikan ke Mystic.
- [ ] Klik **Register student**. Muncul pesan tersembunyi (ikon hantu) "📘 Student file registered…". Blok update-nya terlipat, dan bracelet pindah ke pesan itu dengan mana 180/180.
- [ ] Kirim aksi pertama. AI menyebut sihirmu sesuai cover-nya (Telekinesis), bukan Unmaking. Di Entrance Event, Stone menyortir ke **Light** (Mystic).
- [ ] Buka Builder lagi (mode *amend*), tambahkan satu teknik, lalu **Save changes**. Muncul pesan tersembunyi baru, dan mana tidak terisi ulang.
- [ ] Hapus pesan amend itu. Teknik barunya hilang (state mundur).

## Engine dengan teknik asli
- [ ] Minta AI memakai teknik per-use. Mana turun sebesar biayanya, dan `Casts` kosong lagi.
- [ ] Nyalakan teknik sustained (misalnya Quiet Hands), lalu lompat waktu 1 jam. Upkeep terpotong satu kali saja, termasuk setelah swipe.
- [ ] Sampel Spirit-bound: panggil Ember. `Pacts/Ember/Summoned` = true, dan "Ember" muncul di `Magic.Active` serta sebagai chip di bracelet.
- [ ] Coba suruh AI mengubah `_Techniques` (misalnya "set Frost Lance cost 0"). Perubahannya dikembalikan, dan `_Log` mencatat "read-only".

## Student file (3.3)
- [ ] Tombol **Student file** (di bracelet atau di bawah input) membuka panel dengan tab Overview, Body, Wallet, Studies, Magic, Log. Tab Hidden hanya muncul kalau punya hidden magic.
- [ ] Setelah ada cedera, tab Body menampilkannya. Tab Magic menampilkan efek aktif beserta jam mulainya.

## Laporkan kalau
- Bracelet tidak muncul sama sekali. Cek dulu apakah regex bracelet aktif, dan apakah Tavern Helper > "Render" menyala.
- Tombol di bracelet memunculkan peringatan "Turn on the Eldrasil UI script". Artinya skrip UI mati atau error; lihat console (F12) untuk `[Eldrasil UI]`.
- Register gagal dengan toast merah. Salin pesannya beserta error console.
- Pesan builder yang tersembunyi tampil sebagai teks mentah `<UpdateVariable>`, atau tanpa bracelet.
