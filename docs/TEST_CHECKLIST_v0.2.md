# Test checklist — Eldrasil v0.2 (Batch 2)

## Setup
1. Pastikan ekstensi **Tavern Helper** (≥4.8.4) dan **Prompt Template** sudah terpasang, lalu import `Eldrasil_Halvard.png`.
2. Saat ST bertanya soal lorebook bawaan kartu, pilih **Import**. Jangan aktifkan lorebook Eldrasil yang standalone.
3. Buka Tavern Helper → Scripts → Character scripts. Pastikan **MVU**, **Schema**, dan **Engine** menyala. Kalau ST bertanya soal izin skrip kartu, pilih izinkan.
4. Buka chat baru. Di console browser (F12) akan muncul log MVU, dan skema terdaftar tanpa error merah.

## Tes dasar
- [ ] Lantai 0: variabel sudah terisi (M1 W1 Mon 07:30, Points 300, bond Etnie Rank 3). Cek lewat Tavern Helper → Variables → message, atau di panel MVU.
- [ ] Kirim 3 pesan. Setiap balasan AI diakhiri blok `<UpdateVariable>` yang tampil terlipat sebagai "📜 State update".
- [ ] Waktu maju tiap giliran. `_Period`, `_Curfew`, dan `_Event_today` terisi (misalnya "Timetable suspended (Entrance Event)").
- [ ] Ajak NPC bicara (misalnya Irene). Dia masuk ke `Scene.Present` dan otomatis muncul di `Bonds`.
- [ ] Swipe balasan terakhir, lalu hapus satu pesan. Variabel ikut mundur ke keadaan yang benar.

## Tes engine
- [ ] Tidur semalam (tulis "I go to sleep"). Stamina dan mana penuh, dan `Resting` kembali ke "none".
- [ ] Buat adegan cedera berat tanpa unsur mematikan. HP turun maksimal 40, dan `_Log` mencatatnya.
- [ ] Coba minta AI menaikkan rank bond tanpa milestone. Rank dikembalikan, dan `_Log` mencatat alasannya.
- [ ] Lompat waktu ke bulan berikutnya. Gaji +300 masuk (setelah {{user}} sudah punya asrama).
- [ ] Mode "额外模型解析" (extra model) di pengaturan MVU. Model kedua mengirim update tanpa error.

## Laporkan kalau
- Muncul error merah di console yang menyebut `[Eldrasil engine]` atau `registerMvuSchema`.
- AI sering lupa blok update. Solusinya bisa berupa entri penegasan format; catat model yang dipakai.
- EJS menampilkan teks `<%` mentah. Artinya ekstensi Prompt Template belum aktif.

Catatan: teknik sihir masih kosong sampai Student Builder (Batch 3), jadi tes cast/upkeep baru bisa dilakukan setelah itu. Engine-nya sendiri sudah diuji dengan data contoh.
