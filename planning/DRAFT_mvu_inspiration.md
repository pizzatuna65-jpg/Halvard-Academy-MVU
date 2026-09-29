# DRAFT: Pelajaran dari 4 card MVU kreator lain

Status: **APPROVED oleh owner (2026-09-26)** dengan rekomendasi saya untuk semua `[?]`; urutan dan keputusan final ada di `DRAFT_batch_plan.md` (v2). Belum diterapkan. Tujuan tiap usulan (card atau preset) mengikuti `DRAFT_card_vs_preset.md` §3: N1, N7 dan N8 pindah ke preset. Catatan dalam Bahasa Indonesia; teks yang akan masuk ke card dalam Bahasa Inggris. Keputusan terbuka ditandai `[?]` di akhir.

Sumber: folder `MVU by other creator/`. Keempat PNG saya ekstrak (chunk `ccv3`), lalu saya baca lorebook, regex dan skrip Tavern Helper-nya:

| Card | Nama di card | Genre | Isi |
|---|---|---|---|
| `ArtificRealm_eng-1.01.png` | ArtificRealm創世域 (KritBlade) | fantasi petualangan + harem, EN | 121 entry, 17 regex (UI StatusMenu 211 KB), skema zod |
| `DragonRaja_Cassell_MVU.png` | 龙族 (Dragon Raja) | fanfic sekolah Cassell, ZH | 182 entry, 4 regex, 1 skrip MVU |
| `Teater_Misterius_LotM_V2.63Beta.png` | 诡秘剧场 (Lord of the Mysteries) | fanfic horor Victoria, ZH | 493 entry (banyak toggle), 13 regex (UI 646 KB), tanpa skrip |
| `v4.3.png` | 命定之诗与黄昏之歌 v4.3.3 | fantasi dunia terbuka, ZH | 537 entry (280 geografi, 31 karakter DLC), 11 regex, 7 skrip (semua dimuat dari CDN) |

Catatan: ArtificRealm sudah saya bahas di `DRAFT_consistency.md` (P2–P4, P8, P12–P14). Di sini saya hanya menambahkan bagian yang **belum** dibahas di sana, lalu membahas tiga card lainnya secara lengkap.

---

## Bagian A. Fitur yang layak ditiru, per card

Kolom **Eldrasil** menunjukkan status di v1.4.5:
- **ada**: sudah punya padanannya.
- **sebagian**: ada, tapi versi mereka menambah sesuatu.
- **baru**: belum ada.
- **P#**: sudah diusulkan di `DRAFT_consistency.md`.

### A1. ArtificRealm (tambahan di luar DRAFT_consistency)

| Fitur | Isinya | Eldrasil | Catatan |
|---|---|---|---|
| **World_Advancement_Protocol** | Tiap balasan, narator diam-diam memilih 1–3 event dunia yang masih berjalan, menghitung waktu yang sudah lewat, lalu memajukan statusnya secara objektif. Hasilnya muncul lewat rumor, surat, obrolan NPC. "NEVER pause background events because the player hasn't interacted." | sebagian | Kita punya `Campus_State.Events`, hooks, happenings, rumours. Yang belum ada: event yang **berjalan sendiri seiring waktu** dan tanggal terakhir diperbarui. Lihat N4. |
| **Sudden Crisis: concealment vs perception** | Kalau ancaman lebih tersembunyi daripada persepsi pemain, krisis langsung pecah tanpa peringatan; kalau tidak, ada firasat dulu. | baru | Cocok untuk Doves dan Thinning. Kecil, opsional. |
| **World_Building_Logic** | Empat "Iron Law": dunia tidak berpusat pada pemain; anti-kebetulan ("Passerby A is just Passerby A", "No Quest Spam: give blank time"); dunia berjalan sendiri; **NPC boleh salah** (keputusan tidak sempurna, dari bias dan info terbatas). Lengkap dengan contoh BAD/GOOD. | sebagian | P12 (anti-dramatisasi) belum mencakup **NPC fallibility** dan **contoh BAD/GOOD**. Lihat N7. |
| **Perceivable vs non-perceivable input** | Hanya teks dalam kutip yang didengar karakter. Tindakan bisa dilihat, pikiran tidak pernah. Setiap info yang dipakai NPC harus punya asal yang bisa dilacak. | sebagian | Rule 504 punya cognitive isolation, tapi tidak menyebut **pikiran {{user}} di pesan pemain**. Lihat N8. |
| **Encounter table** | Heroine hanya muncul di region tertentu, dengan syarat level; ada yang muncul sebagai musuh dulu. | ada | Haunts/Regulars kita sudah lebih rinci. Tidak perlu. |
| **Journey** | Perjalanan jauh: silang medan × cuaca × waktu × musim, 1–2 kejadian, ~10% kejadian langka non-hostile. Akhiri di fakta objektif, tanpa saran aksi. | sebagian | Relevan untuk perjalanan ke Capital (Crowning Day) dan hutan. Prioritas rendah. |
| **Hide Far Chat** (regex promptOnly, minDepth 10) | Pesan lama dihapus dari prompt; state jadi ingatan. | ada | Punya kita di minDepth 24 (P11). |

### A2. DragonRaja (龙族, Cassell College)

Card ini **paling mirip Eldrasil**: sekolah sihir, cast kanon besar, pemain sebagai murid baru.

| Fitur | Isinya | Eldrasil | Catatan |
|---|---|---|---|
| **分阶段设定: perilaku bertahap per NPC** (entry 61, 62, 69, 95, 96) | Entry EJS per NPC utama, 4 tahap menurut Affection (<30 / 30–59 / 60–89 / ≥90). Tiap tahap berisi "behavior guidance" (4–6 baris konkret: apa yang ia ceritakan, cara bercanda, reaksi saat bahaya). **Hanya tahap yang sedang aktif yang dicetak.** | sebagian | Kita punya "what the NPC shares per rank" dan "what the rank allows", tapi **generik untuk semua NPC**. Punya mereka spesifik per karakter. Lihat N3. |
| **变化倾向: bocoran tahap berikut** | "When affection nears the next stage, let one behaviour of the next stage slip out unintentionally, e.g. a bit of real concern hidden in a joke." | baru | Ide paling murah di card ini: satu kalimat rule, engine sudah tahu kapan `_Event_ready` hampir tercapai. Lihat N3a. |
| **关键NPC扮演指南: panduan NPC kunci, selalu aktif** (entry 36) | Untuk 4 NPC utama: posisi inti, kata kunci sifat, cara bicara + tic verbal ("收到。" "明白了。"), perilaku, dorongan inti, **cara ia memperlakukan user**. Ringkas (~500 token per NPC) dan konstan. | sebagian | Setara Invariants P2, tapi tanpa field "how they treat {{user}}". Layak masuk P2. |
| **看法: opini NPC tentang user** (variabel) | Satu kalimat, **wajib diperbarui saat tahap berganti atau ada titik balik**. Init-nya sudah bernada karakter ("嘿嘿，又有新的冤大头师弟可以蹭饭了！"). | P4 | = `Mind` di P4. Mereka menulis nilai awal **dengan suara karakter**; itu layak ditiru untuk seed Etnie. |
| **角色属性叙事化: atribut → prosa** (entry 179) | Angka 1–100 tidak pernah disebut; tiap band punya deskripsi naratif + contoh adegan dari kanon. | sebagian | Pola "angka → band → contoh prosa" bagus untuk Mana/HP dan band power level kita. |
| **动态世界叙事指令: fokus naratif per ancaman** (entry 63) | EJS: `Peace / Tense / Crisis`. Tiap mode mengganti fokus cerita, suasana, sumber plot, dan **apa yang sedang dikerjakan tiap NPC utama** ("Caesar busy with parties; Chu Zihang in the library or dojo"). | sebagian | Kita punya `_Event_today` dan kalender. Yang baru: **NPC berubah kesibukan menurut fase kampus** (minggu ujian, Thinning, libur). Lihat N6. |
| **次要角色索引: indeks nama** (entry 45) | Daftar nama konstan: "use the full name so the profile activates". | ada | NPC Roster uid 97. |
| **Guardian of Character Souls** (entry 37) | "Lu Mingfei's 'loser-ness', Chu Zihang's 'coldness', Caesar's pride must be 100% on-model." Satu kata inti per NPC. | baru (kecil) | Bisa jadi baris pertama Invariants: **satu kata inti** per NPC. |

**Yang tidak ditiru dari DragonRaja:** tahap ≥90 Lu Mingfei berbunyi "unconditionally puts User's safety above his own… would stand against the whole world for User". Ini persis drift "semua NPC jadi pengabdi" yang ingin kita hindari (prinsip: NPC bereaksi sesuai sifat, bond tidak memaksa). Tahap tinggi versi kita harus tetap **dalam batas kepribadian** (P8 ceiling).

### A3. Teater Misterius (诡秘剧场, Lord of the Mysteries)

| Fitur | Isinya | Eldrasil | Catatan |
|---|---|---|---|
| **自动化系统: simulasi hidup NPC di luar layar** (entry 257) | Tiap balasan, untuk **maks. 3 NPC aktif**: <br>• **Behavior chain** selama tidak bertemu user ("A→B→C") <br>• Status sekarang: aksi / pakaian / lokasi / sedang apa <br>• **Tujuan jangka panjang, "biasanya tidak terkait user"** <br>• **Rencana dekat dengan waktu konkret**, yang **wajib benar-benar terjadi** di balasan berikutnya <br>• **Ingatan kunci**: "event → perubahan dalam diri", hanya ditambah, tidak dihapus | baru | Inti terkuat card ini untuk konsistensi: NPC tetap hidup saat tidak di layar, dan saat bertemu lagi mereka sudah berubah secara masuk akal. Versi mereka memakan banyak output tiap balasan. Versi kita sebaiknya disimpan di state oleh engine. Lihat N4. |
| **日报与传闻: rumor** | Maks. 5, FIFO, satu rumor baru per hari. **Hanya dari hal yang user punya kesempatan dengar.** | ada | Gossip dan reach kita sudah lebih canggih. |
| **合理性审查: audit kewajaran** (entry 248, 5 level) | Anti-"神化" (pendewaan user): NPC tidak memuji, **mengingat nama**, atau melihat "aura istimewa" tanpa sebab. Pertemuan pertama tanpa curiga atau ramah berlebihan. Orang berkuasa tidak memperlakukan user khusus sebelum ada yang terungkap. Kenaikan afeksi butuh sebab (kebaikan kecil ≤2, hidup-mati ≤5). Tanpa keberuntungan gratis. | sebagian | Angka kita sudah diatur engine (XP cap). Yang belum ada: **aturan prosa anti-pujian dan anti-sorotan**. Lihat N7. |
| **叙事权: hak narasi** (bagian dari 248 + 3) | Pemain hanya menarasikan aksinya sendiri. Klaim hasil ("dia pasti setuju"), keputusan NPC, dan kata "pasti/sudah" di input pemain **ditolak sebagai fakta**. | baru | Lihat N1 (versi v4.3 lebih rapi). |
| **防OOC: anti-OOC** (entry 57) | Karakter kanon harus sesuai kepribadian **pada periode waktunya**. NPC mencerminkan norma organisasinya. "Tolak karakter satu dimensi". **Cek objek**: sebelum menulis "membetulkan kacamata" atau "menghunus pedang", periksa apakah ia memang memakai atau membawanya. | sebagian | "Kepribadian per periode" relevan untuk NPC Year 1→3 (lihat N2). **Cek objek** bisa masuk Invariants (N9). |
| **文风指导 §6** | "Keep a character's core personality unchanged by affection changes." "Characters may test, hide from, or use {{user}} out of their own interests." "When a character explains a plan, use dialogue, not narration." | P8 | Sama dengan P8 ceiling. Baris "gunakan dialog untuk pemikiran rumit" menarik untuk voice. |
| **人物关系列表: data NPC di variabel** | Tiap NPC yang pernah muncul: identitas, **kepribadian, penampilan, cara memanggil user**, kemampuan, afeksi 0–200, lokasi, **riwayat event maks. 3** (disertai *pikiran NPC dalam orang pertama*). Wajib dibuat saat pertama muncul; tidak boleh "tidak diketahui". | sebagian | Untuk NPC roster sudah tertutup oleh lore + bonds. Untuk **NPC karangan narator** kita belum punya apa-apa. Lihat N5. |
| **角色提取: ekstraksi karakter** | Perintah pemain "extract X" → narator mengeluarkan profil lengkap NPC karangan (penampilan, dorongan, nilai, **3 contoh kalimat**, rahasia). | baru | Ide bagus untuk N5: jalur manual bagi pemain untuk "membekukan" NPC karangan. |
| **原著时间线 + butterfly effect** | Entry per tanggal kanon, aktif lewat keyword tanggal. "If {{user}} broke the preconditions (someone died early, an item is missing), rationalise the event instead of replaying canon." | sebagian | Kalender dan event EJS kita sudah ada. **Klausa butterfly** belum; berguna untuk event terjadwal (Royhan, Thinning). Lihat N10. |
| **叙事节奏: adegan harian vs adegan luar biasa** | Adegan harian adalah "pelabuhan aman". Jangan menyisipkan firasat atau serangan ke adegan harian murni kecuali memang titik balik. | sebagian | Sejalan dengan happenings "optional texture". Cukup masuk P12/N7. |
| **Log per giliran** (`本周目经历`) | Tiap balasan: nomor, tanggal lengkap, judul 14 huruf, tempat, siapa hadir, ringkasan 100 huruf, relasi antar NPC, tag, info penting (janji + jam). Disembunyikan regex dari tampilan **dan** prompt; kelihatannya dibaca ekstensi ringkasan luar (card ini tidak punya skrip). | ada | Journal + Commitments kita sudah menutup ini. |
| **Reset dunia / NG+** (entry 18) | Mati → dunia kembali ke 1349; pilih satu warisan. | tidak | Bertentangan dengan prinsip "tanpa ending". Lewati. |

### A4. 命定之诗 v4.3

| Fitur | Isinya | Eldrasil | Catatan |
|---|---|---|---|
| **五维动机模型: kode kepribadian + tipe stabilitas** (entry 15903) | Lima dimensi **motivasi** (bukan tingkat sifat): relasi, ekspresi emosi, pemicu aksi, inti konflik, letak makna. Contoh: `RfEpAcCpPf`. Ditambah **tipe stabilitas**: <br>• **Sk** (固核): pengalaman memperdalam inti, **tidak menulis ulang** <br>• **Sm** (塑核): pengalaman besar dan berkelanjutan **boleh menulis ulang** dimensi terkait, dan jejaknya disimpan <br>• **Sf** (流核): inti ikut bergeser dengan lingkungan atau fase hidup jangka panjang, bukan per adegan <br>Aturannya: "pick the single most natural tension and show it through choices; never explain each letter; NPC lama pakai kanon." | baru | **Tipe stabilitas** adalah temuan terpenting di card ini. Ia menentukan per NPC **seberapa jauh boleh berubah**, dan pas sekali dengan Imprints (P4). Kodenya sendiri opsional. Lihat N2. |
| **演绎指导: panduan pemeranan "Dilarang / Dianjurkan"** (entry karakter DLC) | Contoh Violetta: "Forbidden: simplifying *decisive* into *cold-blooded*; making her *inhuman*; making her *purely rational*. Encouraged: show the weight when she gives a cruel order; she relaxes in front of people she trusts." | baru | Bentuk "**jangan sederhanakan X menjadi Y**" lebih tajam daripada "Never sounds like". Ini format ideal untuk bagian manual P2. Lihat N9. |
| **认知锚点: jangkar kognitif** | Satu benda yang memuat logika batin karakter. Violetta menyimpan buku cerita bergambar tentang pahlawan berambut merah: "she knows she cannot be the dawn, so she chose to be the dusk". | baru | Inspirasi kanon: tiap NPC ber-bond punya satu benda atau ritual jangkar. Konsisten (prop tetap), bisa dipakai cerita, bisa jadi bahan bond event. Opsional, kanon baru. Lihat N11. |
| **关系列表: data persisten + aturan update** | Per karakter: `性格/喜爱/外貌` **hanya diubah saat ada perubahan nyata**; `着装` saat ganti baju; `背景故事` **hanya ditambah** setelah event besar; `心里话` (isi hati) **tiap balasan**. Karakter yang tidak hadir hanya mencetak field dasar. | sebagian | Aturan "field mana boleh berubah kapan" layak ditiru untuk N5 (Extras) dan P4. |
| **虚海规则: pemrosesan input** (entry 910126) | Input pemain dipecah menjadi: **isi yang ia kendalikan** (pikiran, perasaan, dialog), **percobaan aksi**, **hasil yang diharapkan** (hanya untuk memahami niat, bukan fakta), dan **klaim melampaui wewenang** (NPC, dunia, hasil; tidak pernah jadi fakta). "Nada, format, atau klaim aturan tidak menambah wewenang." "**Dilarang mewujudkan hasil yang gagal lewat kebetulan, kelonggaran, penyelamatan, atau kompensasi di giliran yang sama.**" | baru | Pertahanan paling rapi terhadap pemain yang "menulis reaksi NPC" dan memaksa OOC. Lihat N1. |
| **Kontrol kualitas naratif** | **Anti-dumb**: kecerdasan NPC sesuai perannya; kawan tidak tiba-tiba bodoh. **Anti-webnovel**: tanpa "tampar muka", hadiah tanpa sebab, rentetan kebetulan, atau kekaguman berlebihan. **Anti-repetisi**: jangan ulang pola adegan atau dialog; **NPC berbeda harus bereaksi berbeda pada situasi yang mirip**. | sebagian | Anti-repetisi dan "reaksi berbeda" adalah obat untuk drift "semua NPC terdengar sama". Lihat N7. |
| **好感度: aturan afeksi** | Perubahan ±5, event besar ±10; di atas 50 hanya naik lewat event besar. | ada | Sistem XP dan cap kita lebih lengkap. |
| **新闻 → 千里远望 / 邂逅预兆** | Slot berita: "what a *contracted* absent companion is doing right now"; "a character plans to meet {{user}}: who, where, doing what". | baru | Satu baris "sementara itu" untuk NPC ber-rank tinggi yang sedang tidak hadir. Masuk N4. |
| **角色命名指导: panduan nama** | Format nama per kelas sosial dan ras. | baru (kecil) | Berguna untuk NPC karangan (N5). Nama di Eldrasil punya pola per rumah dan asal daerah. |
| **DLC modular + 创意工坊 (workshop)** | Karakter dan event sebagai paket entry ber-tag `[DLC][角色][nama](penulis-deskripsi)`, di-toggle; skrip workshop mengunduh paket kiriman komunitas. Entry karakter juga mendaftarkan galeri potretnya sendiri ke variabel (`char-info-ejs-builder`). | sebagian | Inspirasi untuk "Add an incoming first-year cohort" (HANDOFF §6): cohort sebagai paket entry ber-tag yang bisa di-toggle. Lihat N12. |
| **Skrip dari CDN tanpa pin** (7 skrip, beberapa `@main`) | — | — | **Jangan ditiru.** Risiko yang sama sudah tercatat di PROGRESS (dependensi tidak dipin). |

---

## Bagian B. Cara tiap card menjaga konsistensi karakter

### B1. Ringkasan per card

**ArtificRealm: sistem paling lengkap, penegakannya lemah di aktivasi**
- Kepribadian = "kernel code" (hanya sifat stabil) → Imprints (maks. 5 keyakinan dari pengalaman besar) → Trait/Disposition/Pulse (sifat adalah batas atas dan bawah) → contoh chat bersituasi → simulasi pikiran (3 dorongan, topeng sosial) → anti-dramatisasi → `World_Calc.Events` menimpa lorebook yang basi.
- **Kelemahan:** profil heroine hanya aktif lewat keyword (sticky 0), jadi saat nama tidak disebut, profilnya hilang.
- **Layak ditiru:** hampir semua, dan sebagian besar sudah masuk DRAFT_consistency.

**DragonRaja: bertahap dan sederhana**
- Tiga lapis:
  1. panduan NPC kunci yang selalu aktif (ringkas, dengan tic verbal dan "cara memperlakukan user")
  2. profil lengkap lewat keyword (penampilan, MBTI, kelebihan/kekurangan, **ekspresi per emosi**, 2 contoh dialog, relasi)
  3. **perilaku per tahap afeksi** lewat EJS, hanya tahap aktif, ditambah aturan "bocoran tahap berikut"
- `看法` wajib diperbarui saat tahap berganti.
- **Kelemahan:** hanya 6 NPC yang dilacak; tahap tertinggi melanggar kepribadian (pengabdian tanpa syarat); profil lengkap tetap keyword-only.
- **Layak ditiru:** EJS per tahap (hanya tahap aktif), "bocoran tahap berikut", panduan ringkas yang konstan, nilai awal opini ditulis dengan suara karakter.

**Teater Misterius: menjaga lewat audit dan simulasi dunia**
- Karakter kanon dikunci "kepribadian pada periodenya".
- Audit kewajaran 5 level mencegah NPC menjadi penjilat (anti-pendewaan, anti-sorotan, tiap kenaikan afeksi butuh sebab).
- Data NPC dicatat di variabel, termasuk **cara memanggil user** dan riwayat event dengan **pikiran NPC dalam orang pertama**.
- Simulasi luar layar (rencana konkret yang wajib terjadi; ingatan kunci yang hanya bertambah) membuat NPC tidak membeku saat ditinggal.
- Aturan eksplisit: "core personality does not change with affection".
- **Kelemahan:**
  - output per balasan sangat besar (blok otomasi, 6 opsi aksi, log, tabel pertempuran), jadi rawan format rusak dan boros token
  - ingatan kunci tidak dibatasi
  - banyak entry duplikat dengan toggle manual ("没开的不要开" / jangan dinyalakan yang mati)
- **Layak ditiru:** ide simulasi luar layar (tapi disimpan engine, bukan dicetak tiap balasan), aturan anti-sorotan, cara memanggil user sebagai field, cek objek, klausa butterfly.

**命定之诗 v4.3: menjaga lewat model kepribadian dan batas wewenang**
- Kode motivasi lima dimensi plus **tipe stabilitas** (seberapa jauh karakter boleh berubah).
- Entry karakter punya "内在逻辑" (kontradiksi inti: sisi keputusan vs sisi perasaan vs sumber tekanan), **panduan pemeranan Dilarang/Dianjurkan**, dan jangkar kognitif.
- Data persisten dengan aturan update per field (penampilan dan kepribadian hanya saat berubah nyata; latar hanya ditambah).
- Pemrosesan input yang membatasi wewenang pemain.
- Anti-repetisi ("NPC berbeda bereaksi berbeda").
- **Kelemahan:** pipeline pembuatan NPC sangat berat (stat, skill, item dihitung di thinking); deskripsi penampilan eksplisit; bergantung pada 7 skrip CDN.
- **Layak ditiru:** tipe stabilitas, format "jangan sederhanakan X menjadi Y", jangkar kognitif, aturan update per field, pemrosesan input.

### B2. Matriks teknik konsistensi

| Teknik | AR | DR | LotM | v4.3 | Eldrasil sekarang | Usulan |
|---|:-:|:-:|:-:|:-:|---|---|
| Lore NPC selalu ada saat hadir (bukan keyword) | – | sebagian (panduan konstan) | – | – (keyword) | keyword | P1 |
| Kepribadian inti terpisah dari sikap ke user | ✔ | – | ✔ | ✔ | sebagian (kategori Tension/Trust) | P8 |
| **Seberapa jauh boleh berubah (per NPC)** | Imprint (sama untuk semua) | – | – | **✔ Sk/Sm/Sf** | – | **N2** + P4 |
| Perilaku berbeda per tahap kedekatan | band sifat | **✔ per NPC, EJS** | – | ambang 90 per NPC | generik per rank | **N3** |
| Bocoran perilaku tahap berikut | – | **✔** | – | – | – | **N3a** |
| Contoh suara bersituasi | ✔ | 2 contoh | 3 kalimat (ekstraksi) | – | – | P3 |
| Anti-pola / cara AI biasanya salah | – | – | – | **✔ Dilarang/Dianjurkan** | – | **N9** (format P2) |
| Cara memanggil user sebagai data | ✔ | – | **✔ field** | – | – | P2 |
| Ekspresi per emosi | – | ✔ | – | – | ✔ Emotional tells | — |
| Isi hati / opini NPC di state | – | ✔ 看法 | ✔ riwayat + pikiran | ✔ 心里话 | – | P4 |
| Hidup NPC di luar layar | World events | fokus per ancaman | **✔ rencana + ingatan** | ✔ "sementara itu" | Regulars (jadwal tetap) | **N4** |
| NPC karangan narator tetap konsisten | ✔ (Familiar) | – | ✔ | ✔ | – (hanya catatan Scene 12 kata) | **N5** |
| Batas wewenang input pemain | – | – | ✔ | **✔ paling rapi** | – | **N1** |
| Anti-penjilat / anti-sorotan | ✔ | – | **✔** | ✔ | sebagian (power level) | **N7** |
| NPC boleh salah; anti-repetisi | ✔ | – | – | ✔ | – | **N7** |
| Cek objek dan prop | – | – | ✔ | – | – | **N9** |
| Pikiran pemain tak terdengar; nama harus diperkenalkan | ✔ | – | ✔ | ✔ | sebagian | **N8** |
| Kanon per periode (Year 1 ≠ Year 3) | – | – | ✔ | – | – | N2 (catatan) |
| Dunia di state menimpa lore basi | ✔ | – | – | – | ✔ Campus_State | — |

---

## Bagian C. Usulan baru untuk Eldrasil

Penomoran **N#**, agar tidak bentrok dengan P1–P14 di `DRAFT_consistency.md`. Semua sudah saya cek terhadap empat prinsip (tanpa ending, reward berguna, anti-grind, NPC bereaksi sesuai sifat). Urutannya dari **biaya terendah / manfaat terbesar**.

### N1. Batas wewenang input pemain (dari v4.3 dan LotM) — rule 504, ~110 token

Masalah yang dicegah: pemain menulis `"Irene smiles and agrees to skip the report"`, lalu narator menerimanya. Itulah jalan tercepat NPC menjadi OOC.

```
- The player writes only {{user}}: their thoughts, feelings, words and attempted actions. Anything else in the player's message (what a character feels, says or decides, whether an action succeeds, facts about the world) is a wish, not a fact: characters answer from their own nature, and outcomes follow the rules and the state. Confident wording ("of course she agrees") adds nothing. An outcome that did not happen is not handed over anyway through a coincidence, a sudden change of heart or a rescue.
```

Catatan: ini **tidak** mengurangi kebebasan pemain. {{user}} tetap bisa mencoba apa saja; hanya hasilnya yang diputuskan dunia. Sejalan dengan rule "power level is the player's choice", karena kekuatan {{user}} tetap tidak disentuh.

### N2. Tipe stabilitas per NPC (dari v4.3) — satu field per NPC + satu kalimat di P8

Field baru di `npcs.json`, **ditentukan owner**: `Change: fixed | shaped | fluid`.

| Tipe | Arti (card text) | Contoh kandidat (hanya tebakan, perlu owner) |
|---|---|---|
| `fixed` | "Experience deepens who they are; it never rewrites them." | Etnie, Dante, Irene |
| `shaped` | "A major, repeated experience can change one part of them for good; the old self still shows under stress." | Castor, Zara, Caine |
| `fluid` | "They change with their surroundings over months (a new year, a new circle), never within one scene." | Trixie, Florian |

- Hubungan dengan P4 Imprints: untuk `fixed`, Imprint hanya boleh **memperdalam** keyakinan yang sudah ada; untuk `shaped`, Imprint boleh **menggantikan** satu keyakinan (engine menyimpan yang lama sebagai "was: …"); untuk `fluid`, Imprint juga boleh lahir dari perubahan lingkungan jangka panjang (naik kelas, pindah klub), bukan hanya dari {{user}}.
- Kanon per periode (dari LotM): NPC `fluid` boleh mendapat baris kecil "Year 2 self / Year 3 self" di lore kalau owner mau. Opsional.

### N3. Perilaku per rank, spesifik per NPC (dari DragonRaja) — kanon baru, bertahap

Sekarang "what the rank allows" berlaku sama untuk semua NPC. Usulnya: field lore `Stages:` untuk NPC kunci, 4 band yang **mengikuti rank kita**: 0–2, 3–5, 6–8, 9–10. Isinya 3–4 baris konkret per band. **Hanya band aktif yang dicetak** (EJS di Cast Sheet P1, atau di `<now>` bila P1 belum disetujui).

- Band tinggi **wajib tetap dalam batas kepribadian** (P8). Tidak ada "unconditional devotion".
- Tidak mengubah reward atau event. Ini hanya arahan cara bermain peran.
- Mulai dari 6–8 NPC yang paling sering muncul; sisanya tetap memakai aturan generik.

Contoh bentuk (Irene, **bukan kanon, hanya bentuk**):
```
STAGE (Rank 3-5): Uses {{user}}'s surname, but now adds "please". Reminds {{user}} of rules before, not after. Will vent about Council paperwork in two sentences, then apologise for it. Still reports curfew breaks, but tells {{user}} first.
```

### N3a. Bocoran tahap berikut (dari DragonRaja) — rule 504, ~45 token, tanpa kanon baru

```
- When <now> shows a bond close to its next rank, let one small behaviour of the next rank slip out now and then, unplanned and quickly covered: warmth arrives before it is admitted.
```

Engine sudah punya progres rank (`_Event_ready` pada XP 10), jadi `<now>` cukup menambah tanda "close" di baris Bond saat XP ≥ 8. Sangat murah, dan membuat kenaikan rank terasa tumbuh, bukan melompat.

### N4. Hidup NPC di luar layar (dari LotM, v4.3, ArtificRealm) — field baru + engine, tanpa blok output tiap balasan

Masalah yang dicegah: NPC "membeku" saat tidak hadir, lalu muncul lagi persis seperti terakhir kali, atau muncul tanpa sebab.

Versi LotM mencetak blok besar tiap balasan. Versi kita **disimpan di state dan dibaca engine**:
- `Bonds.<NPC>.Next`: satu baris yang ditulis narator **saat NPC meninggalkan adegan**, berisi rencana dekatnya plus waktu konkret. Contoh: `{"What": "Council budget meeting, then the library", "Until": "M2 W1 Tue 18:00"}`.
- **Engine:**
  - Saat waktu itu tiba dan {{user}} berada di tempat yang sama, `<now>` menyebut NPC itu sebagai "may be here".
  - Saat {{user}} bertemu lagi, `<now>` mencetak "since you last saw them: <Next>" sekali, supaya narator bisa memberi jejak ("she smells of old paper").
  - Kalau `Next` sudah lewat tanpa pertemuan, engine memindahkannya ke `$Recent` NPC itu.
- **Hanya untuk NPC ber-bond Rank ≥ 3** (supaya murah), maks. 1 baris per NPC.
- Ditambah baris **"Meanwhile"** di Journal/Notice untuk NPC Rank ≥ 7 yang lama tidak bertemu (dari 千里远望 v4.3). Contoh: "Rei was seen at the Boathouse at dawn again." Hanya kalau masuk akal {{user}} mendengarnya (aturan gossip reach).

Rule 502, sekitar 60 token:
```
Bonds.<name>.Next: when a bonded character leaves the scene, write what they will do next and until when ("Council budget, then the library", "M2 W1 Tue 18:00"). Their own life, not {{user}}'s: most plans have nothing to do with {{user}}. Keep it; the engine brings it back.
```

Terkait: event dunia yang berjalan sendiri (World_Advancement AR) bisa memakai pola yang sama untuk `Campus_State.Events`, yaitu field `Updated`. Engine menandai event yang lebih dari 7 hari tidak disentuh, dan `<now>` meminta narator memajukannya lewat rumor atau surat. `[?]`

### N5. Kartu NPC karangan (Extras) (dari v4.3 关系列表, LotM 人物关系列表 + 角色提取) — record baru

Masalah yang dicegah: penjaga toko, senior tanpa nama, atau murid karangan narator yang muncul lagi tetapi dengan penampilan, nama panggilan, atau sifat berbeda. Sekarang mereka hanya punya catatan Scene 12 kata.

Record `Extras` (maks. 20; yang paling lama tidak muncul keluar dulu, kecuali `Keep: true`):
```json
"Extras": {"Marta Bellweather": {"Who": "Commissary clerk, 50s, Human", "Looks": "grey bun, ink-stained cuffs, half-moon glasses", "Manner": "brisk, counts twice, softens for first-years", "Calls_user": "dear", "Voice": "\"Sign here, dear. No, the other here.\"", "Keep": false}}
```
- **Aturan update (dari v4.3):** `Who/Looks/Manner/Calls_user/Voice` hanya ditulis sekali, saat karakter karangan **muncul kedua kalinya** (bukan pertama, supaya figuran sekali lewat tidak mengisi state). Setelah itu hanya diubah kalau ada perubahan nyata di cerita.
- Engine mencetak kartu Extras yang ada di `Scene.Present` ke `<now>`, sekitar 40 token per orang.
- **Jalur manual (dari 角色提取 LotM):** tombol "Keep" di dossier atau Cast strip. Pemain bisa membekukan NPC karangan yang ia sukai, supaya tidak pernah keluar dari daftar.
- **Panduan nama (dari v4.3):** satu baris di 502 tentang pola nama Eldrasil (per asal daerah dan ras), supaya nama karangan terasa satu dunia. Owner perlu memberi pola, atau saya ambil dari lore yang ada `[?]`.
- Sesuai prinsip "UI tidak menggerakkan cerita": Extras hanya catatan, bukan bond, tanpa XP dan reward.

### N6. Kesibukan NPC per fase kampus (dari DragonRaja 动态世界叙事指令) — kanon kecil

Kalender kita sudah tahu fasenya: minggu biasa, Training Week, ujian, Thinning, Break, Star Night. Usulnya: untuk tiap fase, 1 baris fokus naratif + **apa yang sedang menyita NPC kunci**, dicetak di `<now>` saat fase aktif. Contoh (**hanya bentuk, bukan kanon**):
```
Exam fortnight: the campus is quiet and short-tempered. Irene sleeps in the Council room; Aiden runs a betting book on the results; Tilly is never out of the Archive.
```
- Kanon baru yang ringan (owner menyetujui per fase).
- Menjaga konsistensi dengan cara lain: NPC punya hidup yang ikut kalender, bukan hanya jadwal harian.

### N7. Anti-sorotan, NPC boleh salah, anti-repetisi (dari LotM 合理性审查, AR World_Building_Logic, v4.3 kontrol kualitas) — perluasan P12, ~90 token

Tambahan untuk teks P12:
```
- No spotlight: strangers do not remember {{user}}'s name, sense something special or single {{user}} out without a reason on-screen; a first meeting is ordinary. Praise, trust and interest are earned in scenes.
- People are fallible: they misjudge, act on half the facts, get proud, scared or petty, and live with the results. Allies do not suddenly turn clever or foolish to suit the plot.
- No echoes: do not reuse a scene beat, joke or line pattern from earlier replies, and never give two characters the same reaction; the same news lands differently on Aiden, Irene and Zara.
```
Baris terakhir menyebut nama NPC kita sebagai contoh, mengikuti gaya contoh BAD/GOOD ArtificRealm. Contoh nama membuat model lebih patuh.

### N8. Input yang bisa dan tidak bisa ditangkap karakter (dari AR, LotM) — perluasan cognitive isolation 504, ~50 token

```
Characters hear only what {{user}} says aloud and see only what {{user}} does; {{user}}'s thoughts in the player's message never reach them. Nobody knows a name, a secret or a motive without a source on-screen (told, seen, overheard, read, reasoned from what they saw).
```

### N9. Format bagian manual P2: "Don't flatten" + prop tetap (dari v4.3 演绎指导, LotM 防OOC)

Bagian manual P2 ("2–3 hal yang paling sering salah ditulis AI") sebaiknya memakai format v4.3. Contoh di bawah **hanya bentuk, bukan kanon** (ledger dan pena saya karang):
```
DON'T FLATTEN: her strictness into coldness (it is care with a rulebook); her composure into having no feelings; her rivalry with Aiden into hatred.
CARRIES: Council ledger, silver pen; never wears jewellery on duty.
```
- `DON'T FLATTEN` memberi nama drift yang spesifik, dan lebih kuat daripada daftar "Never".
- `CARRIES` (dari cek objek LotM): prop tetap, supaya narator tidak menulis "Irene membetulkan kacamatanya" kalau Irene tidak berkacamata.
  - Sebagian bisa diambil otomatis dari lore Appearance/Equipment.
  - Langkah cast check (P9) menambah: "check they own what they handle".

### N10. Klausa butterfly untuk event terjadwal (dari LotM 原著时间线) — ~40 token di entry event EJS

```
If the story has already changed what this event depends on (someone is hurt, away, told, or the place is closed), adapt the event to the story as it is now; never replay it as if nothing happened.
```
Berguna untuk Royhan (M3W4), Crowning Day, Thinning, dan bond event yang sudah ditulis owner.

### N11. (Opsional, kanon baru) Jangkar per NPC (dari v4.3 认知锚点)

Satu benda atau ritual per NPC ber-bond yang memuat logika batinnya, ditulis owner. Contoh bentuk (**bukan kanon**): Castor dan notebook yang ia buka di Gardens tanpa pernah menulis.
- **Untuk konsistensi:** prop dan kebiasaan yang selalu sama.
- **Untuk cerita:** jangkar bisa jadi bahan bond event di rank tinggi, atau sesuatu yang bisa rusak atau hilang (Tension).
- **Dengan prinsip reward:** jangkar **bukan** reward dan tidak bisa diberikan ke {{user}}, jadi tidak bentrok dengan "useful, not memento".
- Sebagian NPC sudah punya bahannya di Emotional tells (Castor, Rei dengan mantelnya). Jadi ini lebih ke **memberi label** daripada menulis baru.

### N12. (Infrastruktur) Cohort sebagai paket entry (dari v4.3 DLC)

Untuk "Add an incoming first-year cohort" (HANDOFF §6): setiap cohort baru menjadi grup entry ber-tag `[cohort:Y2]` dengan uid blok sendiri, dan pipeline `merge_lorebooks.py` + `curate_data.py` membaca per paket. Keuntungannya: owner bisa mengirim lorebook cohort sebagai satu file, dan pemain bisa mematikan cohort tertentu. Ini hanya ide arsitektur; detailnya dibahas saat owner mengirim lorebook cohort `[?]`.

---

## Bagian D. Yang tidak saya sarankan ditiru

| Fitur | Card | Alasan |
|---|---|---|
| Blok otomasi, log, dan tabel **dicetak tiap balasan** | LotM | Output besar, rawan format rusak. Ide yang sama lebih murah kalau engine menyimpannya di state (N4). |
| 6 opsi aksi dengan kategori acak di tiap balasan | LotM | Mengarahkan pemain dan menambah token. Eldrasil memegang kebebasan pemain; lebih baik tanpa opsi. |
| Reset dunia / NG+ dan warisan周目 | LotM | Bertentangan dengan "no endings". |
| Tahap afeksi tertinggi = pengabdian tanpa syarat | DragonRaja | Melanggar P8 ceiling dan prinsip "NPC bereaksi sesuai sifat". |
| Ingatan kunci yang hanya bertambah tanpa batas | LotM | Membengkak. Kita pakai cap + Defining moments (P4). |
| Pipeline pembuatan NPC dengan hitungan stat di thinking | v4.3 | Terlalu berat untuk slice-of-life sekolah. N5 cukup sebagai kartu naratif. |
| Skrip dari CDN tanpa pin versi | v4.3, DR | Risiko perubahan diam-diam (sudah tercatat di PROGRESS). |
| Darkness mode / deskripsi tubuh eksplisit | AR, v4.3 | Di luar arah card. |
| Puluhan entry toggle duplikat (4 level audit, 3 pilihan sudut pandang) | LotM | Membingungkan pemain. Setelan kita sudah lewat Settings (`$ui`). |
| Trait angka penuh per NPC | AR | Sudah dibahas di P14: tunda. |

---

## Bagian E. Urutan penerapan yang saya sarankan

Digabung dengan urutan di `DRAFT_consistency.md`:
1. **N1 + N8 + N7** (rule 504, sekitar 250 token, tanpa kanon baru). Dampak langsung pada OOC karena input pemain dan penjilatan. Bisa ikut paket P8 + P12.
2. **N3a** (satu kalimat + tanda "close" di `<now>`).
3. **N10** (klausa butterfly di entry event).
4. **N5 Extras** (schema + engine + UI kecil). Menutup celah NPC karangan yang tidak ditangani P1–P14.
5. **N4 Next** (schema + engine). Paling baik dikerjakan bersama P4 (Mind/Knows), karena sama-sama field bond baru.
6. **N2 tipe stabilitas + N9 format P2** saat owner menulis bagian manual P2 dan P3.
7. **N3 Stages + N6 fase kampus + N11 jangkar**: kanon baru, per kelompok NPC, lewat draf terpisah.
8. **N12** saat lorebook cohort datang.

## Perkiraan token (per balasan, di luar P1–P14)

| Item | Selalu | Kondisional |
|---|---|---|
| N1 + N7 + N8 (rule) | ~250 | — |
| N3a | ~45 | +5 per bond "close" |
| N4 | ~60 (rule 502) | ~20 per NPC dengan `Next` yang relevan |
| N5 | ~70 (rule 502) | ~40 per Extra yang hadir |
| N6 | — | ~60 saat fase aktif |
| N3 Stages | — | ~70 per NPC kunci yang hadir |

---

## Keputusan terbuka

1. `[?]` **N1 batas wewenang input:** setuju teksnya? Ini aturan tentang pemain, jadi saya ingin kepastian bahwa nadanya tidak terasa membatasi.
2. `[?]` **N2 tipe stabilitas:** pakai tiga tipe (`fixed / shaped / fluid`)? Kalau ya, owner yang menentukan per NPC, atau saya drafkan dulu untuk 38 NPC di `DRAFT_voices.md`? Kode motivasi lima huruf v4.3: dilewati (saran saya) atau ikut?
3. `[?]` **N3 Stages:** mulai dari NPC mana (usul: Etnie, Irene, Aiden, Castor, Zara, Kanae, Rei, Caine)? Band 0–2 / 3–5 / 6–8 / 9–10 oke?
4. `[?]` **N3a:** ambang "close" = XP ≥ 8 dari 10?
5. `[?]` **N4 Next:** hanya Rank ≥ 3? Baris "Meanwhile" untuk Rank ≥ 7 masuk Journal atau Notice Board? Terapkan juga `Updated` untuk `Campus_State.Events`?
6. `[?]` **N5 Extras:** cap 20 dan tulis saat muncul kedua kali, oke? Tampilkan di UI (tab di People, atau di Cast strip saja)? Pola nama untuk NPC karangan: owner yang memberi, atau saya ambil dari lore?
7. `[?]` **N6 fase kampus:** fase mana saja? Saya drafkan baris NPC per fase untuk disetujui?
8. `[?]` **N7:** contoh nama (Aiden, Irene, Zara) di baris anti-repetisi, oke?
9. `[?]` **N9:** ganti bagian manual P2 menjadi format `DON'T FLATTEN` + `CARRIES`?
10. `[?]` **N11 jangkar:** mau dipakai? Kalau ya, saya kumpulkan kandidat dari Emotional tells dan lore yang sudah ada dulu, supaya sebagian besar bukan kanon baru.
11. `[?]` **N12 cohort sebagai paket:** dibahas sekarang atau saat lorebook cohort datang?
