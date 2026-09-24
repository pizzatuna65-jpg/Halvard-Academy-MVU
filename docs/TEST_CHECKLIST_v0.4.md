# Test checklist — Eldrasil v0.4 (Batch 4)

Checklist v0.2 dan v0.3 tetap berlaku. Di bawah ini hanya tambahan untuk Batch 4.

## Setup
1. Import ulang `Eldrasil_Halvard.png` (timpa kartu lama) dan pilih **Import** untuk lorebook bawaan. Mulai chat baru.
2. Pastikan repo aset (`pizzatuna65-jpg/eldrasil-assets`) sudah publik dan berisi `portraits/`, `thumbs/`, `map/`. Kalau belum, panel tetap berfungsi, tapi portret tampil sebagai inisial dan peta sebagai pola garis.

## Cast strip dan dossier (4.1)
- [ ] Setelah bertemu NPC, wajahnya muncul di bracelet di bawah chip. Tahan kursor (atau ketuk) untuk melihat catatannya.
- [ ] Sebelum cerita menyebut namanya, NPC tampil dengan peran publik (misalnya "Student Council President") atau deskripsi fisik, bukan nama. Setelah narator menyebut namanya, namanya muncul di balasan berikutnya.
- [ ] Ketuk wajah NPC untuk membuka dossier. Hanya field sesuai rank yang tampil, dan field yang masih terkunci tercantum di "Still to learn".
- [ ] Etnie (Rank 3) menampilkan Hates, tapi belum menampilkan Personality (Rank 4).

## Bonds (4.2)
- [ ] Tombol **People** → tab Bonds menampilkan semua orang yang sudah ditemui: rank, 10 pip progres, bar trust/tension, dan badge "here now" / "bond event ready".

## Connections (4.3)
- [ ] Tab Connections memuat diagram. Butuh internet (D3 dimuat dari jsDelivr saat tab pertama kali dibuka).
- [ ] Hanya ada garis kamu ke orang yang sudah ditemui, sampai bond seseorang mencapai Rank 5–6. Setelah itu pandangannya tentang orang lain ikut muncul.
- [ ] Ketuk garis untuk membaca catatannya. Ketuk orang untuk membuka dossier-nya.
- [ ] Minta AI mencatat relasi baru di `Campus_State.New_relations`. Relasi itu muncul dengan warna "From the story".

## Peta (4.4)
- [ ] Tombol **Map** membuka peta dengan penanda lokasimu (bercahaya), dan kartu tempatmu sekarang langsung terbuka.
- [ ] Penanda Castle memunculkan tab lantai. Rooftop tidak ada di "Towers & Roof" sampai kamu pernah ke sana.
- [ ] Geser kartu di cluster yang berisi beberapa tempat (misalnya The Mall dengan tokonya).
- [ ] Header kartu berupa potongan peta di sekitar penandanya.
- [ ] "Go here" menutup panel dan mengisi kotak chat dengan "I head to the …". Pesan tidak terkirim otomatis.
- [ ] Minta AI mencatat perubahan di `Campus_State.Location_changes`. Perubahan itu muncul di kartu tempatnya.

## Laporkan kalau
- Portret/peta tidak muncul padahal repo aset sudah publik. Cek URL di console (F12); jsDelivr kadang butuh beberapa menit untuk cache pertama.
- Nama NPC tidak pernah terbuka walaupun sudah disebut di cerita. Salin kalimat narasinya.
- Diagram kosong dengan tulisan "could not be loaded".
