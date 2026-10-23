# Audit menyeluruh 2026-10-23: bug, slop, token, preset, ekstensi memori (card 1.99.1)

Audit ini dibuat tanpa membaca `docs/`, `HANDOFF.md`, `CHANGELOG.md` atau audit lama, supaya penilaiannya tidak ikut arah dokumen. Yang
dibaca langsung: sumber engine, UI, schema, entri lorebook (lore dan EJS), data, preset hasil build, berkas VectFox dan Summaryception
milik card, sumber Summaryception yang didukung project (`Extension/Extension-Summaryception-main`, Lodactio 5.5.4), sumber
SillyTavern di instalasi owner (hanya dibaca), dan chat owner (hanya dibaca) sebagai sampel teks nyata.

Koreksi dari owner selama audit: Summaryception yang terpasang di SillyTavern owner adalah fork lain dan tidak ada kaitannya dengan
project. Semua temuan Summaryception di bawah diuji terhadap salinan `Extension/Extension-Summaryception-main`.

Cara pakai: setiap temuan punya ID (B = bug, P = preset dengan card, E = ekstensi memori, T = token, S = slop, K = kerapian kode,
O = operasional). Rencana kerja ada di §8 sebagai daftar batch; addendum diskusi Reddit (R1–R7) ada di §9; "kerjakan batch N" berarti satu batch, satu rilis, mengikuti aturan
rilis di `CLAUDE.md`. Status tiap batch diisi di tabel §8.

## 1. Ringkasan

| Tujuan owner | Keadaan sekarang | Temuan utama |
|---|---|---|
| 1. Bebas bug | 164 suite lulus, lint dan eslint bersih, simulasi setahun dan fuzz Builder lulus. Dua bug nyata ditemukan lewat pembacaan kode. | B3, B1, B2 |
| 2. Bebas slop | Card bersih dari nama stok dan kosakata AI paling umum, tetapi teks NPC punya tik berulang dan contoh suara memuat pola yang justru dilarang preset. | S1–S7 |
| 3. Engine dan fitur saling terhubung, tanpa redundansi | 31 fitur di Settings terhubung ke engine, EJS dan UI; tidak ada fungsi mati. Redundansi ada di teks aturan prompt (aturan yang sama muncul 2 sampai 3 kali). | T2, T4, K3 |
| 4. Preset berjalan dan terhubung dengan card | Empat konflik langsung antara preset dan aturan card, satu di antaranya membuat nama kanon tidak boleh ditulis. | P1–P5 |
| 5. Kedua opsi ekstensi lancar | VectFox dan Summaryception terintegrasi benar; satu biaya token dan satu contoh non-kanon. Belum ada peringatan bila keduanya aktif bersamaan. | E1–E4 |
| 6. Kode efisien dan rapi | Engine 16,2 ms per update; kode disiplin. Beberapa fungsi sangat panjang dan data kanon masih tertanam di kode. | K1–K6 |
| 7. Biaya token tidak bocor | Sekitar 45–60 ribu token input per giliran. Ada 3–6 ribu token per giliran yang bisa dipangkas tanpa menurunkan mutu, dan potensi diskon cache yang belum dimanfaatkan. | T1–T8 |

Lima hal yang paling layak dikerjakan dulu:

1. **B3**: lima tempat di engine membaca balasan narator sebagai prosa tanpa membuang blok `<UpdateVariable>` yang tidak tertutup
   (atau tanpa membuangnya sama sekali). Nama NPC di dalam JSON bisa "terungkap" di UI, catatan Hooks yang rahasia bisa membuka lore
   tempat, dan pengingat "possibly missed" bisa salah.
2. **P1**: daftar kata terlarang preset (aktif) melarang `vice`, `velvet`, `furnace`, `slick`, `asset`, `a beat`, `a pause` dalam segala
   bentuk, termasuk bagian kata majemuk. Nama kanon "Vice Headmaster", "Vice President", "Velvet Lanes" dan "the Furnace room" ikut kena.
3. **P2 sampai P4**: preset meminta deskripsi penampilan penuh saat NPC pertama muncul, "random events" bebas, dan membuat nama NPC
   baru sendiri; card meminta kebalikannya untuk ketiganya.
4. **T1 sampai T4**: susunan prompt memecah cache setiap giliran, dan sekitar 1,5–3 ribu token aturan dikirim padahal situasinya tidak
   terjadi.
5. **S1 sampai S5**: contoh suara NPC dan pesan pembuka memuat pola slop (fragmen tiga kata, kontras "X; Y tidak", "A beat."), yang
   ditiru narator karena berada di prompt.

## 2. Metode dan bukti

| Pemeriksaan | Hasil |
|---|---|
| `npm test` (164 suite + QA statis) | Semua lulus |
| `npm run lint`, `npm run lint:eslint` | Lulus (6 berkas JS, 477 entri EJS) |
| `tests/stress/fuzz.cjs 30 150 1` (4.500 update) | Satu laporan: "bond rank jumped undefined -> 2 (Topaz)". Penyebabnya invariant test yang usang (B2), bukan engine. |
| `fuzz_builder.cjs 300` | 300 draf, tidak ada masalah |
| `sim_year.cjs 380` (1.520 update) | 16,2 ms per update; state 77 KB setelah setahun ($ui 27 KB, $eng 20 KB, Bonds 18 KB) |
| Kunci `$eng`/`$ui` yang dipakai engine dan UI dibanding schema (zod membuang kunci yang tidak dideklarasikan) | Semua terdeklarasi; satu-satunya kunci ekstra (`$ui.soon`) hanya dihapus |
| Fungsi atau konstanta tingkat atas yang tidak pernah dipakai (engine, shared.js, UI) | Tidak ada |
| `Math.random`, `Date.now` di engine | Tidak ada (deterministik). `Date.now` hanya di UI peta untuk debounce zoom. |
| Escaping HTML di UI | Nilai dari state melewati `esc()`; tidak ditemukan celah |
| Render semua entri konstan dari build (`dist/`), save fixture 1.98.3 | Sepi (sendiri, malam): ±16,9 ribu token. Ramai (3 NPC di Canteen): ±25,1 ribu token. Skrip: lihat §10. |
| Aktivasi lore kata kunci, diputar ulang dari chat owner (39 generasi, scan depth 2) | Rata-rata 7,4 entri, ±3,6 ribu token, maksimum ±8,9 ribu |
| Preset hasil build, prompt yang aktif | ±17,9 ribu token |
| Render EJS seluruh entri konstan (1,69 juta karakter sumber) | 27–95 ms di Node; bukan masalah |
| Pemindaian slop (kosakata dan pola dari riset §7) atas card, 392 entri lore, 91 entri EJS, berkas prompt ekstensi | Lihat §3.5 |
| Verifikasi di sumber SillyTavern | `getLastUserMessage()` mengembalikan `mes` mentah (`public/scripts/macros/definitions/chat-macros.js:108`); `CHAT_COMPLETION_PROMPT_READY` mengirim array `chat` yang sama dengan yang dikirim ke API (`public/scripts/openai.js:1609`) |
| Verifikasi di sumber Summaryception 5.5.4 | Lihat §3.3 |

Perkiraan token input per giliran (chars/4):

| Bagian | Token |
|---|---|
| Prompt preset yang aktif | ±17,9 ribu |
| Entri konstan card | ±16,9 ribu (sepi) sampai ±25,1 ribu (3 NPC hadir) |
| Lore kata kunci | ±3,6 ribu rata-rata, sampai ±8,9 ribu |
| Riwayat chat (24 pesan, blok update dibuang regex) | ±8–10 ribu |
| Injeksi memori (VectFox atau Summaryception) | bergantung pengaturan |
| **Total** | **±45–60 ribu** |

## 3. Temuan

### 3.1 Bug

| ID | Bobot | Lokasi | Temuan | Perbaikan |
|---|---|---|---|---|
| B3 | Sedang | `src/scripts/engine.template.js:1563, 4065, 7151, 7238, 7686` | Prosa balasan diambil dengan lima cara berbeda. Empat tempat membuang `<UpdateVariable>…</UpdateVariable>` hanya jika blok itu ditutup dan peka huruf besar (`/g`, bukan `/gi`); `stepUi` (7686) tidak membuang apa pun. Padahal `recoverPatch` (8132) ada justru karena blok tak tertutup terjadi (catatan 1.30.1: 2 dari 14 balasan). Akibatnya: (a) `stepNamesInProse` (4065) memasukkan nama yang hanya ada di path JSON atau baris `<Analysis>` ke `$ui.names`, jadi nama yang belum dikenal pemain muncul di UI (D14: nama terungkap hanya lewat cerita); (b) `stepCast` (7151) menghitung nama di JSON sebagai "disebut" (`ment`), sehingga fakta tokoh absen ikut masuk prompt berikutnya; (c) `stepReminders` (7238) bisa membuat pengingat palsu; (d) `stepUi` (7686) menandai lore tempat sebagai "terdengar" bila namanya muncul di catatan Hooks, Journal atau Analysis, padahal Hooks tersembunyi dari pemain. Blok `<npc_thoughts>` preset juga terbaca sebagai prosa sehingga tokoh absen yang hanya ada di pikiran NPC dihitung "disebut". | Satu helper saja: perluas `proseOf` (301) agar juga membuang `<npc_thoughts>…</npc_thoughts>`, lalu pakai di kelima tempat (untuk 1563 tetap buang kutipan sesudahnya). Test: balasan dengan blok tak tertutup yang memuat `/Bonds/<NPC yang belum dikenal>/…` tidak menambah `$ui.names`, tidak menambah `ment`, tidak membuka lore. Buktikan refactor lain tidak berubah dengan `ENGINE_DIFF`. |
| B1 | Rendah | `presets/edit_preset.py` (E1, prompt "Player Input Authority") | Prompt preset menyisipkan `<latest_input>{{lastUserMessage}}</latest_input>`. Makro itu mengembalikan `mes` mentah, sedangkan engine menempelkan penanda `(scene: Irene, Kanae · Canteen · t2)` ke pesan pemain saat dikirim (engine 8278). Regex card membuang penanda itu dari riwayat, tetapi regex tidak berlaku untuk isi prompt preset, jadi narator tetap membacanya di `<latest_input>`. Entri 505 card sendiri sudah membuangnya (505 baris 209), preset belum. | Di teks E1 tambahkan satu kalimat: baris penutup "(scene: … tN)" adalah penanda permainan, bukan kata-kata pemain. Atau buang `<latest_input>`; pesan pemain sudah menjadi pesan user terakhir di riwayat. Pilihan pertama mempertahankan maksud RF. |
| B2 | Rendah (test) | `tests/stress/fuzz.cjs:78`, `package.json` script `stress` | Invariant "rank jumped" hanya mengecualikan Etnie (Rank 3), padahal `data/bond_rules.json` `start` juga memberi Topaz Rank 2. Fuzz gagal palsu, dan karena `npm run stress` dirangkai dengan `&&`, `fuzz_builder` dan `sim_year` tidak pernah jalan setelahnya. | Baca `start` dari `data/bond_rules.json` di invariant; rangkai script dengan `;` atau jalankan tiap bagian dan laporkan semua kode keluar. |

### 3.2 Preset dengan card

Semua butir di bagian ini menyentuh keputusan "preset = upstream sebagaimana dirilis" (DECISIONS §9, memori `preset-rebuild-rf2213`).
Perubahan dikerjakan sebagai deviasi di `presets/edit_preset.py` dengan alasan tertulis, dan rumusannya dibuat umum agar tetap masuk akal
di card lain (aturan "card vs preset" di `CLAUDE.md`).

| ID | Bobot | Lokasi | Temuan | Arah perbaikan |
|---|---|---|---|---|
| P1 | Tinggi | Prompt preset "🌌🚫 Banned Word List: Cosmos Edition" (aktif) dan "Last-Mile Gemini Banned Vocab Check" | Daftar melarang `vice`, `velvet`, `furnace`, `slick`, `asset`, `a beat`, `a pause` "in every form ... as any part of a hyphenated or compound word". Di card: "Vice Headmaster" dan "Vice President" (51 kemunculan di 31 entri lore, ditambah salinannya di Cast Sheet; ada di NPC ROSTER dan WORLD INDEX yang selalu dikirim), tempat "Velvet Lanes" di Sunreach (lore 247, 439), "the Furnace room" di Undercroft (lore 370, 467), "slick" di baris roster Dorian dan lore Aiden, "the asset" sebagai cara bicara pengawas Vesna (lore 390). Narator diperintah mengganti kata itu, jadi gelar dan nama kanon berisiko berubah. | Deviasi umum: nama diri, gelar dan nama tempat yang ditulis card atau lorebook adalah nama, bukan kosakata, dan ditulis apa adanya. Untuk kata biasa yang bukan nama (`slick` di roster, `a pause`, `a beat` di contoh suara) perbaiki teks card (S2, S3). |
| P2 | Sedang | Main Prompt, `<NPC_intro>` | Preset: saat NPC pertama muncul, "top-to-bottom sweep" dari rambut sampai alas kaki, termasuk "explicit anatomical shapes". Card 504: tokoh roster yang baru bergabung "keep that first appearance short (how they look, a line or two)", dan tokoh yang sudah dikenal "no appearance sweep". Dua perintah bertentangan setiap kali ada tokoh baru. | Deviasi umum: bila card memberi aturan kemunculan pertama, aturan card yang berlaku; sweep hanya untuk NPC yang tidak didefinisikan card. |
| P3 | Sedang | Main Prompt, `random events: True (... off-screen actions, incoming calls ...)` | Card 504 membatasi sumber kejadian dunia (kalender, `_Happening`, regulars, fase kampus, Commitments, Hooks, Mysteries, Next plans) dan menyatakan "anything else ... must follow from what people on-screen do". WORLD INDEX: tidak ada ponsel. Deviasi D6 baru mengubah ekor kalimat soal tracker, bukan izinnya. | Deviasi: bila card menyebut sumber kejadian dunia, kejadian acak hanya datang dari sumber itu. Contoh "incoming calls" dibuang. |
| P4 | Sedang | Prompt "🧬 HQ NPC Genesis" (aktif, ±490 token) | Preset: buat 5 nama, pilih yang ke-5, ras acak, temperamen sendiri, dan menyatakan profil itu "outweighs any other inference". Card: `<now>` memberi nama dan sifat tokoh baru berikutnya dari `data/name_pool.json` ("Next new character: ... named Wilmot Hollis ..."), dan 502 punya aturan penamaan Extras. Dua otoritas penamaan. | Deviasi umum: bila card sudah memberi nama dan sifat tokoh baru, pakai itu; buat sendiri hanya bila card diam. Opsi lain untuk owner: matikan HQ NPC Genesis (hemat ±490 token, card sudah menangani tokoh baru). |
| P5 | Info | Pengaturan preset | Prompt aktif ±17,9 ribu token. BOLT CoT ±2,4 ribu token ditambah `reasoning_effort: medium`, jadi model berpikir dua kali (CoT di prompt dan reasoning bawaan). Internal Thoughts aktif (±440 token input ditambah blok output setiap balasan). | Keputusan owner. Untuk penghematan: uji A/B BOLT dengan reasoning `low`, atau reasoning `medium` tanpa BOLT. |
| P6 | Rendah | Daftar kata terlarang dan gate kontras preset | Riset (§7) dan Buku 05 owner: daftar larangan yang menyebut frasa justru memancing frasa itu (efek "pink elephant"), dan sasaran sedikit lebih efektif. Preset mengikuti upstream (keputusan §9). | Bukan perubahan sekarang. Bila ingin diuji, jadikan toggle owner dan ukur dengan `tools/audit_chat.py`. |

### 3.3 Ekstensi memori (VectFox dan Summaryception)

Yang sudah benar (diverifikasi di sumber, tidak perlu diperiksa ulang): Summaryception 5.5.4 memanggil `generateRaw` (tanpa lorebook dan
tanpa preset) di mode Default; injeksi `IN_CHAT` depth 12 peran user; pesan yang diringkas disembunyikan dengan `/hide` dan ditandai
`extra.sc_ghosted`; pesan alat pemain (Builder, Settings) dibuat `is_hidden` sehingga dilewati; `repairIfBranched` hanya jalan saat chat
dibuka, sesuai peringatan "stale" di engine; batas `verbatimTurns` 11 di `scChecks` cocok dengan bawaan Summaryception (10) dan jendela
24 pesan card. Pola pembersih VectFox membuang blok update, tag `<say>`, `<npc_thoughts>`, placeholder status, dan mengubah penanda scene
menjadi `[Timeline: tN]`.

| ID | Bobot | Lokasi | Temuan | Arah perbaikan |
|---|---|---|---|---|
| E1 | Sedang (biaya) | `Extension-Summaryception-main/index.js` `buildPassageFromRange` | Summaryception menyusun passage dari `m.mes` mentah tanpa regex. Setiap balasan membawa blok `<UpdateVariable>` sekitar 800 karakter, ±27% dari balasan rata-rata di chat owner (3.320 karakter). Bagian itu dikirim ke setiap panggilan peringkas tanpa guna. Prompt card sudah menyuruh model membaca baris `<Analysis>` pertama dan nilai `/Journal/-` saja. | Card tidak bisa mengubah input Summaryception tanpa fork. Pilihan: terima biayanya dan catat di panduan; atau ringkas isi `<Analysis>` supaya baris waktu dan tempat cukup untuk peringkas. Jangan memindahkan blok update keluar dari `mes` (MVU membacanya ulang saat replay). |
| E2 | Rendah | `src/vectfox/vectfox_eventbase_prompt.txt`, contoh keluaran | Contoh memakai "Fire Wing porch". Tempat itu tidak ada di lore; kanonnya "Fire Dormitory". Contoh di prompt ekstraksi cenderung ditiru. | Ganti dengan tempat kanon (misalnya "Fire Dormitory steps"). |
| E3 | Info | Summaryception | Tidak ada masalah fungsional. Cara kerja peringkas, injeksi, ghosting dan percabangan cocok dengan asumsi engine (`floorOf`, `scChecks`). | Tidak ada. |
| E4 | Rendah | engine, hook `CHAT_CHANGED` | Card menganjurkan satu ekstensi memori per chat, tetapi tidak memeriksa bila VectFox dan Summaryception aktif bersamaan (dua injeksi memori, biaya ganda, bisa saling bertentangan). | Tambahkan peringatan sekali per chat di samping `scChecks`. Kunci pengaturan VectFox harus diverifikasi di sumber VectFox dulu (`CLAUDE.md`: jangan berasumsi). |

### 3.4 Token

| ID | Perkiraan hemat | Lokasi | Temuan | Arah perbaikan |
|---|---|---|---|---|
| T1 | Berpotensi besar, perlu diukur | Susunan prompt; engine `collapseTrimmed` (8112) | Penyedia seperti Gemini lewat OpenRouter memberi potongan harga untuk awalan prompt yang sama dengan permintaan sebelumnya. Dua hal mengubah awalan setiap giliran: (a) lore kata kunci berada di posisi before/after char (posisi 0 dan 1), di depan riwayat chat, dan isinya berganti tiap giliran; (b) jendela riwayat bergeser satu pasang pesan tiap giliran, dan pesan rangkuman `[… N earlier messages; …]` memuat angka N yang naik tiap giliran. Jadi setelah prompt preset dan entri konstan, hampir tidak ada yang bisa di-cache. | Ukur dulu: lihat kolom cached tokens di Activity OpenRouter untuk beberapa giliran. Bila cache memang aktif: buat teks rangkuman tanpa angka; geser jendela per blok (misalnya pangkas per 8 pesan, bukan per 1); uji memindahkan lore kata kunci ke kedalaman di dalam chat. Butir terakhir mengubah letak informasi bagi model, jadi diuji A/B dengan `tools/audit_chat.py`. |
| T2 | 0,3–0,6 ribu saat ada orang hadir | 502 dan 511 | Baris inti 502 untuk Interactions, Trust dan Tension ditulis lagi lengkap di kartu aturan 511 setiap kali ada tokoh hadir (daftar Kind, skala letdown dan offence muncul dua kali di prompt yang sama). | Di 502, sembunyikan baris inti bila kartunya sedang dirender (kondisi yang sama dengan 511). |
| T3 | ±1,0–1,5 ribu pada giliran biasa | 502 (±5,8 ribu token, selalu) | Bagian situasional selalu dikirim: Competition, Trip, Battle, Extras (penamaan dan record), Founded_club, Exposure, Sleep and wind, daftar Kind reputasi yang panjang, Forbidden-magic gifts. Pola kartu aturan 511 sudah ada untuk kasus seperti ini. | Pindahkan ke kartu aturan dengan pemicu dari state (contoh: Extras saat `<now>` meminta record, Competition saat kompetisi berjalan). Mode satu panggilan (sejak 1.69.0) mensyaratkan kartu muncul sebelum situasinya, jadi pemicu harus dari state, bukan dari kata di balasan. |
| T4 | ±0,8–1,1 ribu | lore 132 "02 Campus Map" (konstan, ±1,9 ribu) | Paragraf estimasi jalan kaki dari Main Courtyard, paragraf Movement yang panjang dan daftar tempat klub mengulang informasi yang sudah dihitung engine (`<now>` "Walks from here", "Close by") dan data klub. | Sisakan peta ketetanggaan dan aturan inti; pindahkan estimasi dan daftar klub ke entri kata kunci atau buang. Ini teks lore, jadi lewat draf (lihat §8 batch 4). |
| T5 | 1–3 ribu pada giliran yang menyebut tokoh absen | Lore NPC (77 entri, 1–2 ribu token per entri) | Lore NPC penuh (termasuk bagian `<narrator_only>`) masuk prompt hanya karena namanya disebut dalam 2 pesan terakhir, walau tokohnya tidak hadir dan tidak boleh disuarakan (504). Gerbang anti-duplikat dengan Cast Sheet sudah ada dan bekerja. | Varian ringkas untuk tokoh yang hanya disebut: identitas, peran, relasi dengan {{user}}, tanpa contoh suara. Engine sudah punya konsep `$ui.cast.brief`. |
| T6 | ±150 | WORLD INDEX, 504, 510 | "Sihir biasa yang aman itu legal" ditulis tiga kali (WORLD INDEX, 504, 510); kalimat Magic Duelling Club di 510. | Satu tempat. |
| T7 | Kecil | `<now>` dan `<current_state>` | "Due soon: Herbology essay (OVERDUE)" di `<now>` dan `_When: overdue` di Commitments. | Biarkan, atau pilih satu. |
| T8 | Info | Regex "State-as-memory" dan `collapseTrimmed` | Dengan VectFox dan konteks 1–2 juta, SillyTavern tetap mentokenisasi setiap pesan lama yang sudah jadi `[…]` sebelum engine merapatkannya. Ini beban CPU, bukan token terkirim. | Tidak perlu tindakan kecuali chat sangat panjang terasa lambat. |

### 3.5 Slop

Prinsip dari riset (§7): pola yang ada di prompt ditiru model. Perbaikan yang efektif adalah membersihkan teks card sendiri, bukan
menambah daftar larangan. Satu kontras atau satu fragmen tidak masalah; yang jadi masalah adalah kepadatan dan pola yang sama di banyak
tokoh, karena suara NPC jadi seragam. Card bersih dari nama stok (Elara, Kael, Vance dan lainnya tidak ada di roster maupun
`data/name_pool.json`) dan dari kosakata AI paling umum (delve, tapestry, testament, ozone tidak ditemukan).

Sumber teks yang harus diedit: `src/card/card.json` (pesan pembuka), `data/npc_canon.json` (contoh suara, Stage, Don't flatten),
`source_original/npc_lore_*/` dan `tools/merge_lorebooks.py` (teks lore NPC dan tempat), `src/worldbook/custom/content/504.txt`
(aturan). Cast Sheet (600–676) dibangkitkan dari sumber itu.

| ID | Bobot | Lokasi | Temuan | Arah perbaikan |
|---|---|---|---|---|
| S1 | Sedang | `card.first_mes` | "checks it twice against a ledger older than he is" (kosakata akuntan plus hiperbola klise), "It warms, blinks, and settles on a number" (tripel), "Somewhere above, the Bell Tower clears its throat." (pembuka "Somewhere" plus personifikasi). Pesan pembuka adalah contoh gaya terkuat untuk narator. | Tulis ulang ketiga kalimat dengan detail yang hanya cocok untuk Halvard. |
| S2 | Sedang | Contoh suara di `data/npc_canon.json` | Saffi: `"They're not all like that, Len." A beat.` dan Hadrian: `"Yes." A beat. "And?"` ("a beat" dilarang preset). Irene: "Calm, pleasant, final." (fragmen tiga kata). Etnie: "The smile stays; the eyes do not." (kontras). Kanae: "smiles and says nothing, for now" (dua kali, juga di Relations), "held a moment too long" (tiga kali dalam satu sheet). | Ganti dengan tindakan konkret yang khas tokohnya. |
| S3 | Sedang | Lore NPC (77 entri) | Tik berulang di lore (angka lore saja; Cast Sheet menyalin dan menambah): "quietly" 40 kali di 32 entri (26 dari 77 NPC), "unhurried" 14, "a little too" 10, "says nothing" 7, "smirk" 7, "a moment/beat too long" 5, "a pause" 4, "half-lidded" 3, pola teaser ", for now" 3. Di Cast Sheet angkanya lebih tinggi ("quietly" 52, "a pause" 14, "smirk" 16) karena teks contoh suara dan Stage. | Satu putaran gaya: setiap tik dipertahankan paling banyak di satu atau dua tokoh yang memang khas, sisanya diganti tindakan spesifik. Isi dan fakta tidak berubah. |
| S4 | Rendah | Lore NPC | Kontras yang dilarang gate preset ada di teks deskriptif tokoh: "makes him more agreeable, not less" (Castor), "a system to her, not a gift", "she thinks he is a child, not an asset" (Milena), "was not a hero. He was" (lore 424), "not fear but", "not a pose but". Kontras klarifikasi faktual di aturan dan lore dunia ("history, not myth") tidak termasuk. | Ubah ke pernyataan langsung pada bagian kepribadian, tanda emosi dan contoh suara. |
| S5 | Sedang | 30 dari 112 baris "Feel:" lore tempat | Baris "Feel:" memuat aroma (flower-scent, woodsmoke, sweet rot, cigarette smoke, salt wind, stale smoke, sweet pastry, musk). Preset menyalakan Scent Killswitch, dan ambience card sudah sengaja dibuat tanpa aroma (`data/ambience.json`: 0 sebutan; memori `preset-rebuild-rf2213`). Lore tempat jadi satu-satunya sumber yang masih mengajarkan aroma. | Ganti aroma dengan yang terlihat, terdengar atau tersentuh; pertahankan hanya bila sesuai pengecualian preset (makanan pada acaranya, sumber kuat yang dekat, ritual). |
| S6 | Rendah | 504, baris Player.Conditions | Aturan memberi gambar jadi: "Soaked is wet, heavy, clinging clothes and dripping hair; Chilled is shivering, chattering teeth, numb fingers and clumsy hands". Gambar yang sama akan muncul setiap kali kondisi itu aktif. | Rumuskan sebagai kategori ("tunjukkan di tubuh dan di apa yang bisa dilakukan {{user}}, detail baru setiap kali"), seperti aturan Ambience di baris berikutnya. |
| S7 | Info | `data/npcs.json` | Empat nama berawal V (Vallie, Vera, Vesna, Valentin). Buku 05 mencatat "semua nama Slavia berawalan V" sebagai tanda AI, tetapi hanya Vesna yang berlatar Slavia dan ia rancangan owner. | Tidak ada tindakan. Untuk tokoh baru dari Norvaine, hindari awalan V. |

### 3.6 Kerapian kode dan redundansi

| ID | Bobot | Lokasi | Temuan | Arah perbaikan |
|---|---|---|---|---|
| K1 | Sedang | engine | Fungsi sangat panjang: `stepBonds` 501 baris, `stepProficiency` 356, `stepSchoolWeek` 349, `nowOf` 258, `stepTime` 233, `stepHidden` 198. | Pecah saat berikutnya disentuh (misalnya `stepBonds` menjadi penamaan ulang dan penjagaan record, XP harian, kenaikan rank, Trust dan Tension), dibuktikan dengan `ENGINE_DIFF`. Jangan refactor tanpa alasan fungsional. |
| K2 | Rendah | engine | Data kanon tertanam di kode: kandidat Council tahun 1–3 dan anggota "Bianca" (`stepTime` 1623–1678), `NOBLES` (152), "Milena", "Milena Sagona", "Sir Krieg Valforth" di Dove watch (5586–5685), teks `ENTR_BACK` (70). | Pindahkan ke `data/*.json` (misalnya `data/dove_watch.json`, data Council), mengikuti pola file data lain. |
| K3 | Rendah | engine | Pola duplikat: regex ulang tahun `Player.Profile.Birthday` 3 kali, regex `[pact]` 2 kali, kode razia Avalon dan Hanakaze 2 kali, pengambilan prosa 5 cara (B3). | Satu helper untuk masing-masing. |
| K4 | Rendah | engine 8251 dan 8253 | Dua listener `VARIABLE_UPDATE_STARTED` yang masing-masing mengosongkan satu variabel. | Satu listener. |
| K5 | Info | `tools/merge_lorebooks.py` (1.792 baris, 199 panggilan `rep()`) | Lore dibangun dari v38 ditambah rantai 199 penggantian teks yang terus bertambah tiap rilis. Setiap perbaikan lore (S3–S5, T4) harus ditambahkan ke rantai ini. | Keputusan owner: pertahankan, atau bekukan hasil sekarang sebagai sumber dan pensiunkan rantainya. Menyentuh alur build (BUILD.md). |
| K6 | Info | `stepMigrate` | Migrasi sejak 1.2.x berjalan setiap versi naik. Murah, idempoten, dan save fixture tertua adalah 1.10.0. | Biarkan. |

### 3.7 Operasional

| ID | Temuan | Tindakan |
|---|---|---|
| O1 | Card yang terpasang di SillyTavern owner (`characters/Eldrasil — Halvard Academy.png`) versi 1.70.0, sedangkan repo 1.99.1. Fitur 1.71 sampai 1.99 belum pernah diuji live. | Sebelum uji live, impor card, lorebook bawaan card, preset dan berkas ekstensi dari `dist/`. Engine sudah memberi peringatan "Old lorebook" bila lorebook tertinggal. |

## 4. Yang sudah baik (tidak perlu diperiksa ulang)

- Determinisme: tidak ada `Math.random` atau waktu nyata di engine; semua acak lewat `roll100`, `pickOf`, `rollInt`, `rollTable` dengan seed.
- Schema: semua kunci tersembunyi engine dideklarasikan; zod tidak akan membuang state engine.
- Perlindungan state: field read-only dikembalikan, bond tidak bisa dihapus lewat update, mesin dikembalikan ke state sebelumnya bila error, celah snapshot MVU dilaporkan.
- Gerbang token yang sudah ada: Cast Sheet hanya untuk yang hadir, lore NPC tidak dikirim bila sheet penuhnya hadir, `<current_state>` meringkas bond tokoh absen jadi satu baris, `<npc_thoughts>` lama dibuang dari prompt, blok update lama dibuang regex.
- Rekursi lorebook: entri kustom `preventRecursion`; entri lore `excludeRecursion`. Tidak ada aktivasi berantai.
- UI: escaping konsisten, tidak ada kode mati.
- Fitur Settings: 31 fitur terhubung ke engine, EJS dan UI sesuai perannya.

## 5. Keputusan untuk owner

Diam berarti setuju dengan rekomendasi (memori `no-obvious-open-questions`).

1. P1–P4 menyentuh DECISIONS §9 (preset = upstream). Rekomendasi: kerjakan sebagai empat deviasi berumus umum di `edit_preset.py`.
2. Putaran gaya slop (S2–S5, T4) mengubah kata-kata lore NPC dan tempat yang sudah disetujui, tanpa mengubah fakta. Rekomendasi: draf
   dulu (`planning/DRAFT_slop_pass.md`, baris lama dan baru berdampingan), terapkan setelah "proceed".
3. T1 (susunan prompt untuk cache) mengubah letak lore bagi model. Rekomendasi: ukur cache di OpenRouter dulu; ubah hanya bila cache
   memang terbaca.
4. R2 (§9): **diputuskan owner 2026-10-23**: Embellish Mode tetap ON, Anti-parrot tetap OFF; di batch 2 cukup buang kalimat "Always
   begin your response with {{user}}'s ... first" sebagai deviasi preset.

## 6. Catatan untuk sesi pelaksana

- Ikuti aturan rilis `CLAUDE.md`: save fixture dulu, naikkan versi, build, CHANGELOG, HANDOFF, docs yang relevan, commit lokal.
- Jangan `git add audit`.
- Untuk perubahan teks aturan, jalankan semua suite yang mencari teks itu (`grep -l "<kata>" tests/test_*.cjs`).
- Cast Sheet direkam di `tests/fixtures/cast_1560.json`; perubahan teks Cast Sheet yang disengaja harus memperbarui rekaman itu setelah
  membuktikan bedanya hanya teks yang dimaksud (memori `audit-batch-plan`).
- Pengukuran token sebelum dan sesudah: skrip §10 atau `tests/token_audit.cjs`; untuk perbandingan dengan rilis lama pakai worktree, bukan
  `git stash` (memori `no-stash-for-before-after`).

## 7. Riset slop

Sumber yang dipakai:

- Buku 05 owner (`D:\Claude Project\Sillytavern Preset\Perpustakaan\05-slop-narasi.md`): slop bersifat struktural; daftar larangan panjang
  di prompt merugikan; riwayat dan prompt yang ber-slop mengajarkan slop; rubrik 12 kategori (kontras, staccato, aforisme penutup, presisi
  mustahil, anatomi pengisi, menarasikan ketiadaan, mengulang ucapan user, setup lalu jawaban berlebihan, frasa berulang, nama stok,
  kejadian mendadak, kata sifat di setiap kata benda).
- [Antislop (arXiv 2510.15061)](https://arxiv.org/abs/2510.15061): sebagian pola muncul lebih dari 1.000 kali lebih sering daripada di
  tulisan manusia. Kata paling umum di 67 model: flickered, leaned, muttered, gaze, grinned, gestured, murmured, nodded, glint, hesitated,
  whispered, blinked, hummed, faintly, unreadable. Trigram: "voice barely whisper", "air thick scent", "took deep breath", "eyes never
  leaving", "casting long shadows", "something else entirely". Nama: Elara, Kael. Perintah untuk menghindari kosakata terlarang "has
  limited efficacy and may induce a backfire effect".
- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing): paralelisme negatif ("not X but Y",
  "Y rather than X"), rule of three, penghindaran kopula ("serves as", "stands as"), kosakata per era (2026: "quietly", "steady",
  "multifaceted", "echoed").
- [tropes.fyi: negative parallelism](https://tropes.fyi/tropes/negative-parallelism) dan liputan
  [Atlantic tentang "It's not X, it's Y"](https://aiweekly.co/alerts/atlantic-ais-its-not-x-its-y-tic-proves-hardest-to-shake):
  satu kemunculan bisa efektif; kepadatannya yang menjadi tanda.
- [EQ-Bench Creative Writing](https://eqbench.com/creative_writing.html) dan
  [sam-paech/slop-score](https://github.com/sam-paech/slop-score): skor slop = 60% kata, 25% pola not-X-but-Y, 15% trigram.

Penerapan pada card: perbaiki teks yang masuk prompt (S1–S6); jangan menambah daftar larangan ke card. Daftar kata di pemindai §10 hanya
untuk audit dan tidak boleh ditempel ke prompt.

## 8. Rencana batch

Satu batch satu rilis. Urutan disarankan; kolom "Bergantung pada" wajib dipenuhi dulu.

| Batch | Isi | Bergantung pada | Bukti selesai | Status |
|---|---|---|---|---|
| 1 | B3 (helper prosa tunggal, lima tempat, plus `<npc_thoughts>`), K4, B2 | - | Test baru untuk blok tak tertutup; `ENGINE_DIFF` untuk sisa perilaku; `npm run stress` menjalankan ketiga bagian | selesai (1.99.2, 77f557c) |
| 2 | P1, P2, P3, P4, B1, R1, R2 (aturan pembuka Embellish dibuang, keputusan owner), R3 (bagian preset) sebagai deviasi preset | - | `tests/test_preset.cjs` diperbarui; teks deviasi dicek dengan uji "masuk akal di card lain" | selesai (1.99.3, 731f8d1) |
| 3 | T2, T3, T6, S6, R3 (bagian card), R4, R5 (aturan card 502, 504, 505, 509, 510, 511) | 1 | Token sebelum dan sesudah (§10) untuk keadaan sepi dan ramai; semua suite yang mencari teks aturan lulus; rekaman Cast Sheet diperbarui | selesai (1.99.4, 1d18944) |
| 4 | Draf putaran gaya: S1, S2, S3, S4, S5, T4, R6 | - | `planning/DRAFT_slop_pass.md` berisi baris lama dan baru; diterapkan setelah owner "proceed"; pemindai §10 menunjukkan penurunan; rekaman Cast Sheet diperbarui | selesai (1.99.5, 1799228) |
| 5 | T5 (lore ringkas untuk tokoh yang hanya disebut) | 4 | Token sebelum dan sesudah pada replay chat owner | selesai (1.99.6, 687b4e1; replay chat Charles 27.815 → 17.845 token) |
| 6 | E2, E4 (verifikasi kunci VectFox di sumbernya dulu), catatan E1 | - | Contoh VectFox kanon; peringatan dua ekstensi memori muncul sekali per chat | selesai (1.99.7, 83145e7) |
| 7 | T1, eksperimen cache | data cached tokens dari owner | Angka cached tokens di OpenRouter sebelum dan sesudah | tahap 1 selesai (1.99.8, 9957046: lore kata kunci di belakang entri tetap, `tests/cache_replay.cjs` 0% → 80–89%); tahap 2 (lore ke kedalaman chat, rangkuman tanpa angka, pangkas per blok) menunggu angka OpenRouter sesudah 1.99.8 dan uji A/B |
| 8 | K1, K2, K3 (dikerjakan saat fungsinya disentuh, atau sebagai satu rilis rapi) | 1 | `ENGINE_DIFF` tanpa beda | selesai (2.0.0, bersama temuan §11: `stepBonds` dan Council dipecah, data kanon ke `data/`, helper tunggal; `ENGINE_DIFF` 171 suite + QA statis tanpa beda; sisa K1 di FUTURE_PLANS §3) |

O1 (impor 1.99.1 ke SillyTavern) adalah langkah owner sebelum uji live, bukan batch.

## 9. Addendum: dua diskusi r/SillyTavernAI (2026-10-23)

Owner memakai Gemini Argon. Dua post diuji terhadap card dan preset: "Structural slop vs fillers and human slop" (daftar Cut, Allow,
Tempering, plus komentar soal ban list yang memicu pink elephant dan celah sinonim) dan "The Downsides of Argon" (hiperfiksasi sifat,
model bermain sendiri saat lore besar, tokoh tidak berkembang, pola balasan berulang). Klaim di post adalah pengalaman pengguna, bukan
pengukuran; perlakukan sebagai hipotesis yang diuji dengan `tools/audit_chat.py` pada chat Argon owner.

| Keluhan | Keadaan di card dan preset | ID |
|---|---|---|
| Argon membesar-besarkan satu sifat sampai muncul di setiap balasan | Preset bertentangan dengan dirinya sendiri. Scene Engine (aktif): "a trait is a tendency that surfaces when the moment calls on it". Card Fidelity (aktif): "A quirk that has faded from recent replies with no reason in the story comes back in the next one", yang justru memaksa kebiasaan muncul terus. Card memberi bahan kebiasaan konkret di setiap sheet (Anchor, Carries, Emotional tells), dengan penyeimbang "Don't flatten" per tokoh. | R1 |
| Pola balasan berulang (sekitar, lalu {{user}}, lalu pertanyaan) | Embellish Mode (aktif, pilihan owner 1.36.0) memerintah "Always begin your response with {{user}}'s stylized actions and dialogue first", jadi pembuka selalu sama dan ucapan pemain digemakan. Anti-parrot (melarang mengulang ucapan pemain) mati. Pacing TALK membuat NPC menutup dengan meminta atau bertanya, ACTION berhenti di titik pilihan {{user}}. Tidak ada aturan di card atau preset yang meminta bentuk pembuka dan penutup bervariasi. | R2 |
| Dengan lore besar, model bermain sendiri dan mendorong {{user}} keluar | `<now>` menawarkan banyak kail opsional sekaligus: "Likely around" (sampai 10 nama), Nearby, Happening, campus events "advance each through talk, a rumour, a notice or a letter", inisiatif NPC, gosip, tokoh baru berikutnya. Preset menambah dorongan: Scene Engine "Initiative", Pacing "WEAVE ... a long conversation gets interrupted by what fate or someone's agenda brings", Ordinary Turns "NPC-to-NPC exchanges that exclude {{user}} are encouraged". Penahan yang sudah ada: Player Input Authority, aturan Scene.Present, "never because {{user}} wants them there". | R3 |
| Tokoh tidak berkembang; perubahan terjadi seketika bila ditulis | Card sudah punya yang disarankan para komentator: data tokoh diperbarui setelah peristiwa besar (Imprints dengan `Was`, Mind, Knows, Stage per rank, Lore_changes), dan prompt Summaryception menyimpan "a change in how two people treat each other". 35 dari 60 tokoh berkanon `fixed`, 23 `shaped`, 2 `fluid`; ini keputusan desain owner ("NPCs react in character"), bukan kekurangan. Celahnya kecil: baris Personality statis ada di atas sheet tanpa penanda, Imprints dicetak jauh di bawah (`509_sheet.template.ejs` baris 53), dan perubahan bertahap hanya punya satu jalur, Mind. | R4 |
| Deskripsi sekitar di setiap balasan | Baris "Ambience at <tempat>: ..." muncul di setiap `<now>`, dan 504 meminta prosa "consistent with <now>'s Ambience line". Isyarat cue sudah dibatasi (hanya saat tempat, blok waktu atau hari berganti), tetapi baris keramaian dan cahayanya selalu ada. | R5 |
| Daftar Cut post pertama (apophasis, litotes, therapyspeak, register teknis, lelucon birokratis, banter MCU, lelucon kontras berangka, "like someone who") | Teks card hampir bersih: therapyspeak 0, "like someone who" 0, kata kerja jargon ("filed away", "catalogued") praktis 0, litotes tidak ditemukan. Pengecualian ada di contoh suara: Etnie "She is over there for four minutes." (lelucon kontras berangka), Irene "The minutes will not write themselves, however." (lelucon birokratis), Etnie "Who. Just tell me who." (banter staccato). Preset sudah menangani sebagian besar daftar itu (Anti-therapist, Anti-sycophancy, Occupational Monomania dengan Jargon register). | R6 |
| Komentar: ban list spesifik memicu pink elephant dan celah sinonim; lebih baik koreksi sesudahnya (Recast) dan pengingat depth 0 untuk tidak mengulang | Sejalan dengan P6, Buku 05 §2–3 dan paper Antislop. Card tidak menambah ban list, dan itu sudah benar. Daftar Cut post pertama jangan ditempel ke prompt; pakai sebagai rubrik audit. | R7 |

Temuan baru:

| ID | Bobot | Lokasi | Arah perbaikan |
|---|---|---|---|
| R1 | Sedang | Preset "🎭 Card Fidelity" (aktif) | Deviasi: ganti kalimat "A quirk that has faded ... comes back in the next one" dengan rumusan Scene Engine: kebiasaan muncul saat momennya memanggil, dan tidak muncul di setiap balasan. Umum, berlaku di card mana pun. |
| R2 | Sedang | Prompt preset Embellish Mode (ON), identifier `019f62e8-892f-7010-bf59-e7b17fd4476f` (`EMBELLISH` di `presets/edit_preset.py`) | **Diputuskan owner 2026-10-23**: Embellish tetap ON, Anti-parrot tetap OFF, tidak ada toggle variasi bentuk balasan. Deviasi satu-satunya: buang aturan 2 ("2. Flow: Always begin your response with {{user}}'s stylized actions and dialogue first.") dan beri nomor ulang aturan NPCs menjadi 2, lewat `rep()` yang menegaskan anchor seperti deviasi lain, dengan alasan tertulis (pembuka balasan yang selalu sama, keluhan Argon). Sisa teks Embellish tidak diubah. |
| R3 | Sedang | `505.template.ejs` (`<now>`), preset Pacing dan Ordinary Turns | Card: satu baris anggaran di `<now>`: baris opsional (Likely around, Nearby, Happening, campus events, inisiatif, gosip) dipakai paling banyak satu per balasan, dan tidak dipakai saat {{user}} sedang bertindak atau dalam percakapan yang fokus; ganti "advance each" menjadi "advance one". Preset (bersama P3): interupsi WEAVE hanya dari sumber kejadian yang disebut card. |
| R4 | Rendah | `src/worldbook/custom/509_sheet.template.ejs` | Bila tokoh punya Imprints, beri penanda tepat sesudah Personality ("Changed by experience: see Imprints; where they differ, the Imprint is true now"), atau cetak Imprints tepat di bawah Personality. Bentuk tipe `fixed`, `shaped`, `fluid` tidak diubah. |
| R5 | Rendah | 504 baris Ambience | Rumuskan ulang: Ambience adalah latar; sebutkan hanya bila berubah atau berpengaruh pada momen, dan tidak sebagai pembuka balasan berturut-turut. |
| R6 | Rendah | `data/npc_canon.json` (contoh suara Etnie, Irene) | Masuk draf putaran gaya batch 4 bersama S2. |
| R7 | Info | Metode | Daftar Cut boleh ditambahkan ke pemindai `audit/audit_2026-10-23_slop_scan.py` dan rubrik `tools/audit_chat.py` (untuk mengukur), bukan ke prompt. |

## 10. Skrip audit

Disimpan di `audit/` (tidak di-commit), siap dipakai ulang untuk pengukuran sebelum dan sesudah:

- `audit/audit_2026-10-23_tok.cjs`: render semua entri konstan dari `dist/Eldrasil_Halvard.json` untuk keadaan sepi dan ramai
  berdasarkan `tests/fixtures/saves/save_1.98.3.json`, mencetak token per entri, dan menulis prompt hasil render ke
  `audit/render_busy.txt` dan `audit/render_quiet.txt` (bahan baca untuk T2–T4 dan S6). Jalankan setelah build:
  `NODE_PATH=D:/Halvard-Academy-MVU-main/node_modules node audit/audit_2026-10-23_tok.cjs`.
- `audit/audit_2026-10-23_slop_scan.py`: pemindai kosakata, frasa, kontras, fragmen staccato dan em dash atas card, lore, EJS dan prompt
  ekstensi (`python audit/audit_2026-10-23_slop_scan.py > hasil.txt`). Hitungan menggabungkan lore dan Cast Sheet; angka lore saja ada
  di S3.

## 11. Audit singkat sebelum batch 8 (2026-10-24, card 1.99.13)

Owner menambah fitur dan perbaikan di luar batch (1.99.9 sampai 1.99.13: tag "not told yet", tanggal lahir di Cast Sheet, Who is here,
Look for, pikiran NPC hanya untuk yang hadir, tab Action). Audit singkat ini membaca diff sumber kelima rilis itu (engine, `shared.js`,
505, `509_sheet`, UI, `gen_mvu_entries.py`, `merge_lorebooks.py`, deviasi D5 preset) dan menjalankan pemeriksaan biasa.

| Pemeriksaan | Hasil |
|---|---|
| `npm test` (seluruh suite + QA statis) | Semua lulus (±5 menit) |
| `npm run lint`, `npm run lint:eslint` | Lulus (6 berkas JS, 477 entri EJS) |
| `npm run stress` (fuzz, fuzz Builder, simulasi setahun) | Ketiganya lulus |
| `python tools/build_all.py` di atas commit 1.99.13 | Hasil teks identik dengan yang di-commit (build bisa diulang) |
| Gulungan `presenceAt` vs `lookFor` (cuaca, rutinitas, sibuk, seed, string keramaian) | Konsisten: keduanya membaca data, seed dan `$ui.crowd` yang sama |

Temuan (semua diperbaiki di 2.0.0 bersama batch 8):

| ID | Bobot | Lokasi | Temuan | Perbaikan |
|---|---|---|---|---|
| A1 | Sedang | `505.template.ejs`, daftar `OPT` | Saat 1.99.11 menambah "Here now", komentar `// 1.99.11` ditaruh di depan elemen `W._Happening && … && 'Around campus today'` pada baris yang sama, jadi elemen itu ikut jadi komentar. Baris "Around campus today" tetap dicetak, tetapi tidak lagi dihitung dalam anggaran "paling banyak satu utas opsional per balasan" (R3, 1.99.4). Lint tidak menangkapnya karena JS-nya tetap sah. | Kembalikan elemen itu ke barisnya sendiri; test render 505 dengan `_Happening` terisi. |
| A2 | Sedang | engine `nowOf` (`HELD`), `509_sheet` `cHeld` | Tag "not told yet" 1.99.9 hanya dipasang bila band Trust punya `share` (bukan `null`). Pada Trust Betrayed (`share: null`) baris Bond berkata "shares nothing new with {{user}}", tetapi sheet mencetak Loves, Hates, Goals, Birthday dan seterusnya tanpa tag, jadi kebocoran yang diperbaiki 1.99.9 masih terjadi di band itu (keputusan info layers, DECISIONS §2). | Pada Betrayed, field yang belum terbuka diberi tag `[not told yet: Trust Betrayed]`, juga baris Gifts. |
| A3 | Rendah | `10_people.js` (dossier, `lookPick`) | Sejak 1.99.13 "Look for someone" di Activities disembunyikan bila Who is here mati, setelah curfew dan di area luar, karena engine tidak menggulung pencarian di sana. Tombol "Look for <name>" di dossier tidak memeriksa ketiganya, jadi pemain bisa mengirim permintaan yang tidak pernah digulung. | Satu gerbang bersama (`lookOpen`) untuk Activities dan dossier. |
| A4 | Rendah | engine `ruleCards` | Satu tempat lagi yang membaca kata-kata balasan dengan regex sendiri, bukan `proseOf`: blok `<npc_thoughts>` ikut dibaca, sehingga kata di pikiran NPC bisa membuka kartu aturan. Melanggar keputusan "The story is the prose" (DECISIONS §6, batch 1). | Pakai `proseOf`. |

Tidak ada temuan lain yang merusak fungsi. Catatan kecil yang dibiarkan: pikiran untuk tokoh hadir yang ditulis dengan nama yang tidak
dikenali `sceneIdOf` (misalnya hanya gelar) kini tidak tampil di kartu adegan balasan terbaru (dulu masuk baris "elsewhere"); kasusnya
jarang karena nama depan Extras dan roster sudah dicocokkan, dan blok 🧠 di balasan yang lebih lama tetap menampilkannya.
