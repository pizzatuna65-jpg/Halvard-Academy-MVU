# DRAFT: Bond ranks without rank-up events

Status: **disetujui owner dan diimplementasikan pada v1.9.0.** Revisi atas draft v2 sesuai arahan owner: hapus seluruh sistem event yang diwajibkan setiap kenaikan rank. Tabel manfaat rank menjadi dasar hubungan; narator menulis perubahan kecil di dalam cerita, tanpa adegan seremonial atau pengumuman angka.

Draft ini mengganti keputusan HANDOFF §4 bahwa rank hanya naik lewat bond event. `data/bond_events.json` masih kosong, jadi belum ada adegan scripted yang perlu diselamatkan. Gift unik Rank 5 dan benefit unik Rank 10 di `data/bond_rewards.json` tetap ada; keduanya berbeda dari arahan perilaku umum per rank.

## 1. Cara rank bertambah

- XP, cooldown, bond pace, Trust, Tension, batas Rank 10, dan aturan khusus Etnie/Krieg tetap berlaku. XP penuh menandai hubungan siap naik. Rank bertambah **satu tingkat** saat mereka berikutnya benar-benar berinteraksi di scene yang sama, sesudah cooldown dan gerbang lain terpenuhi. Hanya hadir sebagai latar di kelas tidak cukup. Jika belum bertemu, XP tetap penuh; tidak ada event yang harus ditunggu.
- Trust minimal saat menuju Rank 6 = 35, Rank 7 = 50, Rank 9–10 = 65. Menuju Rank 8: NPC yang memungkinkan rival dapat masuk cabang rival bila Trust <50; yang tidak memungkinkan rival menunggu Trust 50. Tension ≥70 menahan kenaikan, ≥90 menghentikan XP, dan 100 masih dapat menurunkan satu rank. Castor, Kanae, dan Caine tetap menunggu kebenaran yang benar-benar terungkap dalam cerita sebelum 8→9.
- Engine menentukan rank, mencatat Trust +3 dan milestone reputasi yang sudah berlaku, lalu menyerahkan **satu isyarat privat, sekali saja** kepada narator saat NPC itu hadir. Tidak ada `Bond event ready`, petunjuk lokasi/jam event, tombol memicu event, default theme, atau toast kenaikan rank di UI. Dossier masih menampilkan rank dan kemajuan jika pemain sengaja membukanya.
- Isyarat privat tidak memerintah narator memainkan adegan tertentu. Contoh: `Sophia is more at ease with {{user}} now. Show the change through her ordinary conduct when it fits; do not mention ranks or perks.` Jika percakapan sedang tegang atau fokus pada hal lain, narator boleh menunjukkan perubahan itu lewat tindakan biasa di kesempatan berikutnya. Engine tetap memberikan manfaat mekanik ketika syarat nyata terpenuhi.
- Rank 5 tidak boleh memasukkan benda hadiah ke tangan {{user}} sebelum NPC menyerahkannya dalam cerita. Rank boleh naik lebih dulu; engine menandai gift tertunda lalu mencatat `_Perks` ketika pemberian dilaporkan. Benefit Rank 10 yang berupa janji/layanan boleh mulai saat NPC menyatakannya atau melakukannya, tanpa upacara tersendiri.
- Rank 8 tetap mencatat cabang dari hubungan yang telah dibangun: romance hanya jika diizinkan canon, Settings, Trust, dan sudah terjadi dalam cerita; rival hanya bila canon mengizinkan serta hubungan memang mengarah ke sana; selain itu sahabat bila Trust cukup. Tidak ada adegan pilihan cabang yang dipaksakan. Untuk NPC bertopeng, petunjuk konkret Rank 8 tetap menjadi Known_fact, bukan rahasia yang otomatis dibuka.
- Save lama yang punya `_Event_ready` dibaca sebagai "XP sudah siap"; rank berikutnya naik pada interaksi layak berikutnya. `_Event_ready` boleh dimigrasi lalu dihapus dari aturan baru. Tidak ada lompatan beberapa rank dalam satu reply.

## 2. Manfaat pada setiap rank

| Rank | Manfaat mekanik (engine) | Perilaku dan pembawaannya (narator) |
|---|---|---|
| 0 | Bond dicatat sejak bertemu; XP mulai bertambah. | Kenalan; identitas yang belum disebut tetap tersembunyi. |
| 1 | Informasi dasar terbuka. Tidak ada bonus angka baru. | Menyapa dan mengenali {{user}} saat berpapasan. |
| 2 | **Rekomendasi — undangan pertama:** hangout pertama dengan NPC itu setiap minggu mendapat +1 bond XP bila {{user}} benar-benar mengajak dan mereka menerima. Hitung sebagai hangout biasa; tidak memberi interaksi tambahan di atas batas harian. | Mereka cukup nyaman untuk menerima ajakan sederhana ketika jadwal dan wataknya cocok; undangan dapat ditolak dengan alasan nyata. |
| 3 | Bonus loved gift ×1,5, peluang NPC mencari {{user}}, dan pengetahuan ulang tahun sesuai keterbukaan/Trust yang sudah ada. | Mereka mulai memulai kontak sesekali dan memperhatikan tanggal penting yang diketahuinya. |
| 4 | **Belajar/latihan bersama:** bila NPC sungguh berpartisipasi, sesi latihan stamina atau mana mendapat multiplier **×1,25**, atau satu sesi belajar bersama memberi hangout bond XP **×1,25** (3 dasar → 4 setelah pembulatan). Pilih efek sesuai kegiatan yang dimainkan, bukan keduanya dalam satu kegiatan. Batas latihan mingguan/lifetime dan batas hangout harian tetap. Bonus ini lebih kecil daripada bonus latihan gift tertentu di Rank 5 (×1,5). | NPC menawarkan drill yang dikuasainya, menemani praktik, atau belajar bersama; tidak semua NPC harus ahli dalam dua jalur latihan. |
| 5 | Gift eksklusif NPC dicatat di `_Perks` saat benar-benar diberikan; milestone reputasi +5 XP yang sudah ada. Tetap dapat diundang ke pesta ulang tahun {{user}}. | Mereka membagi tujuan pribadi dan menyerahkan hadiah lewat tindakan yang sesuai watak, saat ada kesempatan wajar. |
| 6 | **Perkenalan:** bila NPC Rank 6+ sungguh mengenalkan {{user}} kepada NPC lain yang belum punya bond, bond orang baru mulai di **Rank 1**, sekali per orang. Trust awal mengikuti kategori orang baru, bukan otomatis tinggi; tidak ada hadiah/reputasi untuk lompatan ini. | Mereka memasukkan {{user}} ke lingkaran sosialnya, dengan percakapan perkenalan yang sesuai hubungan mereka. |
| 7 | **Akses bersama:** selama NPC murid yang mengundang benar-benar bersama {{user}}, pintu asramanya menerima mereka sebagai tamu. Jika NPC itu staf, {{user}} dapat datang menemuinya tanpa janji atau pemberitahuan lebih dulu di tempat kerja yang wajar. | NPC mengantar melewati pintu, atau staf menerima kunjungan spontan menurut jadwal dan sikapnya; kedekatan terasa lewat keramahan, bukan hak tanpa batas. |
| 8 | Cabang hubungan (sahabat, romance, rival) dicatat sesuai canon, Trust, Settings, dan yang telah terjadi di cerita. Petunjuk bagi NPC bertopeng tetap ada. Tidak ada kekuatan tempur generik. | Hubungan sudah dekat atau tajam dengan caranya sendiri; narator mempertahankan konsekuensi cabang dalam interaksi biasa. |
| 9 | **Rekomendasi — bersaksi untuk {{user}}:** sekali per bulan per NPC, saat mereka benar-benar mengetahui duduk perkara dan bisa menjangkaunya, NPC dapat membela {{user}} terhadap satu tuduhan/kesalahpahaman publik. Engine mengurangi **hingga 5 XP reputasi negatif** dari satu `Rep_events` terkait, hanya bila pembelaan itu dilaporkan bersama kejadian. Tidak menghapus kesalahan nyata atau konsekuensi keselamatan/hukum. | Mereka mengambil inisiatif membela dengan cara yang cocok: staf menyatakan fakta, murid menjadi saksi, sosok berpengaruh memakai reputasinya. Jika tidak tahu atau tak berdaya, mereka tidak tiba-tiba muncul. |
| 10 | Benefit unik NPC dicatat di `_Perks`; milestone reputasi +10 XP yang sudah ada. Efek khusus benefit dijalankan engine jika terstruktur, dan ditangguhkan di bawah Trust 35. | NPC berani berkorban sesuai watak dan benefit uniknya; narator menjalankan efek yang tertulis, bukan pengorbanan generik setiap adegan. |

### Rincian Rank 4

Tabel kategori berikut adalah sumber keputusan untuk seluruh 44 NPC roster yang memiliki bond. Data yang dibaca engine dan UI ada di `data/rank4_partners.json`. Mana berarti latihan mana, stamina berarti latihan stamina, study berarti belajar bersama. `Extras` buatan narator dan anggota tim rival tidak mendapat sistem ini.

| Kategori yang dapat ditemani | Jumlah | NPC |
|---|---:|---|
| Mana + stamina + belajar | 9 | Etnie, Gareth, Lenna, Percival, Gavlan, Yvette, Milena, Baelin, Rei |
| Mana + belajar | 24 | Irene, Caspian, Royhan, Kanae, Idris, Dante, Aiden, Caralynn, Zara, Vera, Castor, Alyssa, Linus, Maple, Nerys, Hadrian, Wren, Layla, Kuroo, Mimosa, Tristan, Althair, Ezrel, Ottavio |
| Mana + stamina | 7 | Sophia, Saffi, Florian, Trixie, Tsubaki, Krieg, Vallie |
| Stamina + belajar | 2 | Tilly, Bobby |
| Hanya belajar | 2 | Ruby, Caine |

- Tambahkan identitas partner pada laporan `/Training`, misalnya `Partner: "Sophia"`; engine memeriksa bond Rank ≥4, NPC hadir dan aktif, serta laporan kegiatan yang masuk akal. Partner yang hanya kebetulan berada di ruangan tidak memberi bonus.
- Satu bonus Rank 4 per sesi, walau banyak NPC hadir. Jika NPC yang sama juga punya gift/benefit latihan, bonus Rank 4 **boleh ditambah** ke bonus khususnya: ×1,25 + 0,5 = ×1,75 untuk satu sesi, sebelum cap mingguan/lifetime. Ini menjaga hadiah Rank 5 tetap lebih kuat dari bantuan umum Rank 4. Jika beberapa bonus khusus dari NPC berbeda ada, aturan penjumlahannya mengikuti sistem sekarang.
- Belajar bersama dilaporkan sebagai satu jenis interaksi `study` dengan partner yang sama. Ia menggunakan jatah `hangout` harian, bukan `talk` tambahan; XP hangout setelah modifier yang berlaku dikalikan ×1,25 lalu dibulatkan sekali. Interaksi studi tidak menaikkan Mana_max/Stamina_max kecuali narator juga melaporkan sesi latihan yang sungguh berbeda.
- Tired, Exhausted, Collapsed, cedera, dan Settings Training yang sudah ada tetap membatasi hasil latihan. Partner yang sakit/absen atau telah lulus tidak memberi bonus latihan otomatis.

### Rincian Rank 6

- Laporan perkenalan harus menunjuk `By` (NPC Rank 6+) dan `With` (orang baru). Keduanya hadir dalam scene, `By` tidak absen/lulus, dan narator menuliskan perkenalan yang benar-benar terjadi. Jika target sudah memiliki bond, tidak ada kenaikan gratis. Tidak bisa digunakan untuk NPC rival-team yang memang tidak punya sistem bond.
- Untuk NPC roster yang baru dikenal, engine langsung membuat bond Rank 1 dan Trust awal menurut openness-nya. Perkenalan itulah alasan cerita bagi mereka untuk mengenal {{user}}; informasi yang normalnya terbuka di Rank 1 menjadi tersedia. Catat siapa yang mengenalkan agar tidak bisa dipakai dua kali.
- NPC `Extras` buatan narator tidak mempunyai bond maupun gift/benefit khusus Rank 5/10 dan bukan target perkenalan Rank 6. Ini keputusan owner.

### Rincian Rank 7

- Asrama lain tetap memiliki pintu bracelet **residents only**. Pengecualian berlaku hanya selama murid yang mengundang hadir dan membawa {{user}} masuk; akses berakhir ketika ia pergi. Common room dan lorong tamu boleh; kamar pribadi perlu undangan terpisah, ruang terlarang tetap terlarang. Curfew, lockdown, dan aturan trip tetap berlaku.
- Akses staf berarti **boleh mengetuk atau langsung menemui staf tanpa membuat janji**, bukan dapat memanggil mereka dari mana pun. Jika mereka sedang mengajar, keluar kampus, tidur, atau tempatnya tertutup, {{user}} menunggu atau kembali lagi. Kantor Warden, area Doves, arsip terlarang, dan kediaman pribadi tidak terbuka kecuali NPC yang bersangkutan memang punya kewenangan dan mengizinkan secara eksplisit.
- Engine menyediakan status akses pada Map/`<now>` dari bond, Scene.Present, jadwal, dan kondisi lokasi. Narator memperlihatkannya melalui gerak biasa: pintu dibukakan, penjaga mengenali tamunya, atau staf menyisihkan waktu saat tersedia. Tidak ada tombol "unlock".

### Alasan rekomendasi Rank 2 dan 9

- Rank 2 menambah nilai kecil pada hubungan yang baru tumbuh dan memperkuat perilaku "menerima ajakan" yang sudah ada. Ia tidak memberi pelacakan lokasi NPC secara real time atau memindahkan mereka ke scene.
- Rank 9 terasa jauh lebih penting: seseorang bersedia memakai kredibilitasnya untuk {{user}}. Efeknya dapat dihitung engine, membutuhkan bukti sosial dan kehadiran yang masuk akal, serta tidak mengambil alih gift/benefit khusus Rank 10. Ini menggantikan usulan lama "Last stand" yang dapat membuat NPC tiba-tiba menyelamatkan HP dari lokasi yang tidak mungkin.

## 3. Menyatu dalam cerita

- **Tidak ada bahasa level dalam prosa.** Narator tidak menyebut rank, XP, multiplier, perk baru, atau "hubungan naik" kepada {{user}}. `<now>` cukup memberi fakta hubungan kini dan satu contoh sikap yang mungkin tampak. Layar People boleh tetap menunjukkan angka untuk pemain yang ingin memeriksanya.
- **Tunjukkan tindakan, bukan hadiah abstrak.** Rank 4 terjadi saat dua orang benar-benar berlatih/belajar; Rank 6 lewat perkenalan yang terdengar dan terlihat; Rank 7 lewat pintu yang dibukakan atau staf yang menerima kunjungan; Rank 9 lewat kesaksian yang orang lain dengar. Tidak ada adegan wajib pada detik rank naik: manfaat baru terlihat saat kesempatan alami muncul.
- **Karakter dan konteks menang atas tabel.** NPC yang membenci {{user}}, sedang sakit, tidak berada di sana, atau dibatasi kewenangan tidak membantu hanya karena rank tinggi. Trust dan Tension menentukan kesediaan; untuk bonus angka, engine memverifikasi kondisi nyata yang dilaporkan. Rank adalah kedalaman hubungan, bukan kendali {{user}} atas NPC.
- **Contoh:** Setelah beberapa pekan latihan, Sophia berkata singkat, "Kakimu terlalu terbuka," lalu mengambil posisi di sebelah {{user}} dan memperbaiki gerakannya. Engine menghitung sesi latihan dengan partner Rank 4; cerita tidak mengumumkan bahwa ×1,25 baru terbuka.

## 4. Implementasi

- Hapus kerangka event per rank: `data/bond_events.json`, importernya, default `themes`, prompt `Bond event available`, chip/toast `Bond event ready`, syarat narator menaikkan `Rank` lewat adegan scripted, serta dokumen panduan event yang tidak lagi benar. Perbarui sumber template, generator, tests, HANDOFF dan panduan pemain saat draft disetujui. Jangan mengubah output terbangun langsung.
- Pertahankan sumber reward per NPC, pengaturan pace, data openness, Trust/Tension, cabang Rank 8, mask-to-truth, reputasi, hadiah, dan riwayat bond. Pastikan save lama bermigrasi tanpa kehilangan Rank, Trust, Tension, XP, hadiah, branch, facts, dan milestones.
- Tambahkan laporan interaksi yang spesifik untuk `study`, `introduction`, dan `vouch` serta identitas partner training; masing-masing mendapat validasi scene dan cap. Tidak ada konten scripted 500+ NPC×rank yang perlu ditulis.

## Keputusan owner

1. `Extras` buatan narator tidak memakai sistem bond ini.
2. Manfaat Rank 2 (+1 XP hangout yang diundang dan diterima pertama per minggu) dan Rank 9 (pembelaan publik hingga 5 XP reputasi negatif sekali per bulan) disetujui.
3. Rank 4 memakai tabel kategori per NPC di atas, termasuk NPC dengan satu, dua, atau tiga kegiatan yang dapat ditemani.
