# Draf FP1 — NPC mengambil inisiatif menemui {{user}}

Status: **disetujui owner (2026-09-27)**. Draf ini menindaklanjuti `planning/FUTURE_PLANS.md` FP1 dan diterapkan pada card v1.7.7.

## Tujuan

Bond Rank 3 sudah mengizinkan NPC sesekali mencari {{user}}, tetapi narator saat ini harus mengingatnya sendiri. Engine akan menyediakan satu kesempatan kontak yang konkret pada sebagian hari. Kesempatan itu tidak memindahkan NPC, tidak mengubah `Scene.Present`, dan tidak mewajibkan respons tertentu dari {{user}}.

## Desain yang diusulkan

1. **Kelayakan.** Kandidat harus mempunyai bond Rank 3+, sudah tiba di tahun kampanye ini, belum lulus, dan tidak ada di `Scene.Present`. Abaikan saat `Trip.Active`, lockdown, atau NPC sedang punya `Campus_State.NPC_status` yang menghalangi kontak. NPC dengan Tension 70+ tetap mungkin menghubungi {{user}}, tetapi kontaknya bermusuhan, dingin, atau resmi sesuai kanon; tidak pernah menjadi kunjungan ramah karena mesin. Jika tidak ada kandidat yang masuk akal, tidak ada pemicu.
2. **Frekuensi (rekomendasi).** Satu peluang ter-seed sebesar 35% per hari, maksimum dua hari dalam satu minggu kalender kampanye, maksimum satu NPC per hari, dan NPC yang sama mendapat jeda tujuh hari. Hasil ditetapkan untuk hari itu dalam `$eng`, jadi perubahan scene, refresh, swipe, dan replay tidak mengundi ulang. Jika hari itu tidak cocok untuk ditampilkan, peluang lewat; tidak ada NPC pengganti yang tiba-tiba muncul.
3. **Pemilihan.** Gunakan `$eng.seed` dan nomor hari absolut. Bobot dari `data/bond_openness.json`: open 3, normal 2, guarded 1, closed 0,5. Bobot hanya mengatur seberapa sering seseorang terpilih, bukan sikap atau tindakan mereka. Urutkan ID sebelum undian agar hasil stabil. Status, tahun datang, dan kelulusan selalu mengalahkan undian.
4. **Alasan dan bentuk kontak.** Ambil `voice[id].stages` dari `data/npc_canon.json` pada rentang Rank aktif (0–2, 3–5, 6–8, 9–10). Baris Stage yang sudah disetujui menjadi konteks motivasi; mesin tidak menciptakan alasan per NPC. Narator memilih bentuk yang konsisten dengan Stage, lore, `Next`, tempat, jam, dan hubungan saat ini: datang sendiri, mencari lewat kenalan, meninggalkan pesan, atau kesempatan itu berlalu. Pada Tension 70+, hindari bahasa akrab. NPC yang tertutup atau berotoritas dapat memilih cara tidak langsung; misalnya Caine atau Krieg tidak dipaksa menjadi hangat. `Next` yang menempatkan mereka di tempat lain tidak dihapus atau dilanggar.
5. **Output.** Simpan kesempatan hari ini sebagai data engine tersembunyi di `$ui` dan tampilkan satu baris ringkas di `<now>` hanya selama masih relevan. Usulan teks Inggris di bawah. Tidak dibuat sebagai `Hooks` permanen: pemicu harian kedaluwarsa pada pergantian hari dan tidak menjadi utang cerita. Setelah kontak benar-benar terjadi, narator memasukkan NPC ke `Scene.Present` lewat mekanisme MVU biasa; engine tidak melakukan itu sendiri.
6. **Pengaturan (rekomendasi).** Tambah toggle **NPC initiative** di Student file → Settings → Features, default ON. OFF menghapus baris dari `<now>` dan menghentikan pemilihan berikutnya tanpa menghapus bond atau sejarah. ON lagi menunggu undian hari berikutnya. Toggle ini memengaruhi engine dan card, bukan preset.

### Teks card yang diusulkan (English)

Ketika pemicu ada di `<now>`:

> NPC initiative today: **{name}** may try to reach {{user}}. At this bond rank, their Stage says: **{stage}**. Let the contact take a form that fits their canon, current Trust and Tension, location, time, and existing plans. This is an opening, not an arrival or an obligation; if it cannot fit today, let it pass. Do not move them into Scene.Present until they actually enter the scene.

Jika Tension ≥ 70, tambah: `The approach is not friendly at this Tension.`

## Implementasi setelah disetujui

- Rilis berikutnya: **1.7.7**. Tambah data dan logika pada sumber (`src/scripts/engine.template.js`, `tools/gen_engine.py`, `src/scripts/schema.js`, `src/worldbook/custom/505.template.ejs`, `data/features.json`); rebuild output, jangan edit file hasil build secara langsung.
- Uji determinisme lintas replay dan hari, batas mingguan dan jeda per NPC, kandidat tidak hadir/lulus/belum datang, status dan perjalanan, Tension tinggi, toggle OFF/ON, serta save 1.7.6 melalui `fillShape` dan `$eng.ver` tanpa kehilangan data.
- Jalankan `npm test`, `npm run stress`, `node tests/token_audit.cjs`, build preset dua kali untuk memastikan byte-identical; catat hal yang hanya dapat dicek di SillyTavern pada `PROGRESS.md`.
- Naikkan `character_version`, perbarui `PROGRESS.md` dan `HANDOFF.md`, lalu commit hasil build bila repository Git tersedia. Workspace yang diterima sekarang tidak berisi `.git`, jadi commit memerlukan checkout Git dari owner.

## Keputusan owner [?]

1. Setujui frekuensi **35% per hari, maksimum dua per minggu, jeda tujuh hari per NPC**, atau pilih angka lain?
2. Setujui toggle **NPC initiative** default ON di Features?
3. Setujui Stage kanon yang ada sebagai satu-satunya sumber alasan kontak, tanpa menulis alasan baru per NPC? Jika alasan khusus per NPC diinginkan, perlu draf kanon terpisah sebelum diterapkan.
