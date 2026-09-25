# DRAFT: Konsistensi karakter dan kesetiaan pada lore untuk ratusan pesan

Status: **APPROVED oleh owner (2026-09-26)** dengan rekomendasi saya untuk semua `[?]`; urutan dan keputusan final ada di `DRAFT_batch_plan.md` (v2). Belum diterapkan. Catatan dalam Bahasa Indonesia; teks yang masuk ke card dalam Bahasa Inggris. Owner sudah bilang kenaikan token bukan masalah. Keputusan terbuka ditandai `[?]` di akhir.

## Kenapa karakter "degrade" setelah ratusan pesan (diagnosis untuk card ini)

Saya periksa bagaimana lore NPC sampai ke narator sekarang (v1.4.5):

1. **Lore NPC hanya aktif lewat keyword.** Entry Irene (uid 98, sekitar 1.000 token) aktif hanya kalau "Irene", "Chanare" atau "Library Assistants" muncul di beberapa pesan terakhir (scan depth global), dengan `sticky` 0.
   - Begitu narasi menyebutnya "the Council President", "she", atau nama panggilan, entry-nya **hilang** dari prompt.
   - Narator lalu menulis Irene dari ingatan tentang tulisannya sendiri.
2. **Posisinya jauh dari titik menulis.** Entry NPC ada di posisi "after character definitions", yaitu di atas, sebelum 24 pesan terakhir yang disimpan regex State-as-memory.
   - Yang paling dekat dengan titik menulis adalah **prosa narator sendiri**. Model meniru tulisannya sendiri, jadi penyimpangan kecil menumpuk: Irene yang sedikit terlalu ramah di pesan 120 menjadi acuan untuk pesan 121.
   - Ini sumber drift utama.
3. **Tidak ada contoh suara.** `Speech` hanya deskripsi ("Calm, articulate, friendly on the surface"). Deskripsi gaya bicara jauh lebih lemah daripada contoh kalimat.
4. **Hal kecil yang paling sering melenceng tidak dikunci:**
   - kata ganti (she/he)
   - cara memanggil {{user}} (Etnie: "Big Sister"; Caine: "Young master")
   - kebiasaan fisik
   - hal yang tidak akan pernah mereka lakukan
5. **Tidak ada "isi kepala" NPC yang bertahan.**
   - `Known_facts` = apa yang {{user}} tahu tentang NPC.
   - `$Recent` (1.4.5) = apa yang terjadi di antara mereka.
   - Tapi tidak ada catatan apa yang **NPC itu tahu tentang {{user}}**, bagaimana perasaannya sekarang, atau apa yang sedang ia pikirkan. Akibatnya NPC tahu hal yang tidak pernah ia saksikan (melanggar cognitive isolation), atau lupa hal yang pernah ia alami.
6. **Hubungan antar-NPC** hanya muncul kalau entry kedua NPC kebetulan sama-sama aktif. Padahal datanya sudah dikurasi lengkap di `relations.json` (1.4.1).
7. **Rahasia** (`<narrator_only>`) ikut hilang bersama entry-nya, jadi bisa bocor terlalu cepat atau justru terlupakan.
8. **Semua suntikan bergantung pada `Scene.Present`.** Kalau narator lupa memasukkan NPC yang ikut bicara, NPC itu tidak mendapat data apa pun.

## Arah solusi

Kanon harus **selalu ada** (tidak bergantung keyword), **dekat dengan titik menulis** (lebih dekat daripada prosa lama narator), dan **lengkap tapi terstruktur**: yang tidak boleh berubah dipisah dari yang boleh berkembang. Ditambah dua lapisan ingatan dari sisi NPC, dan satu alat audit untuk playtest.

---

## Perbandingan: bagaimana KritBlade menangani masalah ini

Saya baca langsung dua proyeknya:
- [MVU_Game_Maker](https://github.com/KritBlade/MVU_Game_Maker): converter card; saya baca README dan template lorebook di `dist/index.html`.
- [ArtificRealm](https://github.com/KritBlade/ArtificRealm): card Artific Realm; saya baca lorebook `src/ArtificRealm創世域_Eng.json`, 121 entry. Gambar yang kamu kirim adalah Engni Visetta dari card ini.

KritBlade sendiri menyebut biayanya sekitar 75.000 token per balasan setelah 2.000+ pesan, jadi arahnya sama dengan kita: token bukan prioritas.

### Yang mereka lakukan

| Teknik | Di mana | Isinya |
|---|---|---|
| **Kepribadian = "kernel code"** | `Character_Generation_Protocol` | Ringkasan kepribadian hanya berisi sifat yang stabil. **Dilarang** memuat sikap terhadap orang tertentu atau keadaan emosi. "Personality defines HOW she loves, not WHO she loves"; "a shy person in love stays shy". |
| **Imprint** (maks. 5 per karakter) | sama | Perubahan karakter yang sah hanya lewat pengalaman besar (dampak 5/10 ke atas). Yang dicatat adalah **keyakinan** yang terbentuk ("Helping the weak brings pure joy"), bukan kejadiannya. Imprint bisa ditambah, diperkuat, atau ditimpa oleh pengalaman yang lebih besar. |
| **3 lapis: Trait / Disposition / Pulse** | `Trait_Behavior` (MVU Game Maker) | Trait angka yang tidak pernah berubah (Dominance, Shyness, …) adalah **batas atas dan bawah**. Disposition (Trust, Comfort, …) hanya menggeser ekspresi **di dalam** batas itu. Pulse (mood) hanya warna sesaat. Contoh mereka: "Shyness 80 + Comfort 90 → relaxed-shy, not not-shy." |
| **Arahan menulis per band sifat** | sama | Untuk tiap sifat di band High/Mid/Low: cara bicara, bahasa tubuh, cara berkonflik, cara menunjukkan sayang. Ditambah aturan kombinasi dua sifat. |
| **"Affection ≠ Warmth"** | `Story_Analysis_Detail` | Meter kedekatan bukan penentu nada. "Affection 99 dan Trust 5 tetap guarded." |
| **Contoh chat bersituasi** | tiap entry heroine (`<char chat example>`) | 5 contoh berbentuk "Scene: when {{user}} questions her origins → Character: …", termasuk adegan saat ia **sendirian** (topeng dilepas) dan saat {{user}} tertarik pada perempuan lain. |
| **Panggilan per hubungan** | tiap entry heroine (`relationships: term_used`) | "{{user}}-sama", "My supreme lord": cara memanggil dikunci per orang. |
| **Surface vs hidden traits** | tiap entry heroine | `traits` dan `hidden_traits` dipisah; `Secrets_and_Trumps` baru boleh terbuka di Affection 90+. |
| **Simulasi pikiran sebelum bertindak** | `Character_Mind_Simulation_Protocol` | Tiga dorongan yang bersaing (emosi, tujuan, hubungan), topeng sosial (niat dan perilaku boleh berbeda), dan "anti-incapacitation": karakter tidak runtuh jadi pasif karena trauma. |
| **Anti-dramatisasi** | `Anti_Dramatization` | "You are a world simulator, not a dramatist." NPC bereaksi sesuai peran dan kepentingannya, tanpa konflik buatan (contoh "Messenger Test"). |
| **Ingatan bertingkat** | README (Love genre) | PositiveMemories (5), NegativeMemories (5), ImportantEvents (10), FIFO dengan cap waktu. |
| **"Jangan andalkan ingatan"** | `Trait_Behavior`, `UpdateAnalysis` | "HARD INVARIANTS: must hold every reply, do not rely on memory — verify against the section above." Setiap balasan diawali "I have checked `<CURRENT_VARIABLE_DATA>`". |
| **Dunia di state mengalahkan lorebook** | `World_Calc.Events` | Kejadian besar disimpan di variabel dan menimpa info lorebook yang sudah basi. |

### Yang sudah kita punya (tidak perlu ditiru)

- Dunia di state mengalahkan lorebook: `Campus_State` ("the living world; it overrides the lorebook").
- Meter yang terpisah dari nada: Rank / Trust / Tension (1.3.8–1.4.3).
- Rahasia yang terkunci rank dan `Secrets_revealed`.
- Cognitive isolation (rule 504).
- `$Recent` (1.4.5).
- Aturan per kategori tentang cara NPC marah, percaya, dan menerima candaan (1.3.8–1.4.4). Ini setara dengan "arahan per band" mereka, tapi lewat kategori, bukan angka.

### Yang tidak saya sarankan ditiru

- **Profil karakter mereka juga hanya aktif lewat keyword** (entry heroine: `constant false`, `sticky 0`, sama seperti kita). Pertahanan utama mereka adalah **Trait angka di state** yang selalu tercetak, ditambah langkah "behavior check" di thinking. P1 kita (lore lengkap untuk NPC yang hadir) lebih kuat.
- **Mengonversi 38 NPC ke Trait angka dengan tabel perilaku per band** memang ampuh, tapi itu menulis ulang kanon dalam skala besar. Kategori Tension/Trust kita sudah menjalankan fungsi yang sama untuk konflik dan kepercayaan. Lihat P14 sebagai opsi, bukan inti.
- **Blok output wajib** yang besar (stat block dan analisis tertulis) menambah token output dan risiko format rusak. Untuk kita, cukup lewat langkah CoT (P9).

### Yang saya ambil (sudah dimasukkan ke usulan di bawah)

1. **P2:** tambah `term_used`, cara setiap NPC memanggil {{user}} dan orang-orang kuncinya.
2. **P3:** ganti "3 contoh kalimat" dengan **contoh bersituasi** gaya ArtificRealm: 4–6 "Scene → Character" per NPC. Wajib ada satu adegan **saat sendirian atau topeng lepas** untuk NPC bertopeng (Kanae, Castor, Caine, Gareth).
3. **P4:** tambah **Imprints** (maks. 5) dan **Defining moments**, di samping Mind dan Knows.
4. **P8:** tambah **aturan batas kepribadian**: bond, Trust dan romance mengubah *cara* kepribadian tampil, bukan kepribadiannya. Ditambah "character independence" dan "Rank ≠ warmth".
5. **P12 (baru):** aturan anti-dramatisasi.
6. **P13 (baru):** simulasi pikiran sebelum NPC bertindak, sebagai isi langkah CoT P9.
7. **P14 (opsional, baru):** Trait angka per NPC.

---

## Usulan

### P1. Cast Sheet: lore lengkap untuk setiap NPC yang hadir, selalu aktif

Entry baru (EJS, custom uid 509, `@D1`) yang untuk **setiap NPC di `Scene.Present`** mencetak **lore kanon lengkapnya**, termasuk `<narrator_only>` (itu memang untuk narator), tanpa bergantung keyword.

- **Sumber:** teks lore yang sama dengan entry lorebook (`src/worldbook/content/<uid>.txt`), dimasukkan ke EJS oleh `gen_mvu_entries.py`. Deterministik dan bisa dites di node. Alternatif: fungsi `getwi` dari Prompt Template, perlu diverifikasi dulu di sumber upstream `[?]`.
- **Supaya tidak dobel:** entry keyword NPC yang sama tidak mencetak apa-apa selama NPC itu hadir (dibungkus EJS saat merge). Entry keyword tetap berguna untuk NPC yang **disebut tapi tidak hadir**.
- **Token:** sekitar 1.000 per NPC hadir. Satu kelas berisi 8 NPC bisa 8.000+ (lihat `[?]` batas).

⚠️ **Bertentangan dengan keputusan di HANDOFF §1**, tabel pembagian tugas: "Lore activation → SillyTavern keyword World Info". Usulan ini memindahkan aktivasi lore **untuk NPC yang hadir** ke card (EJS). Keyword WI tetap dipakai untuk semua yang lain. Perlu persetujuan eksplisit.

### P2. Invariants: hal yang tidak boleh berubah, di baris paling atas setiap Cast Sheet

5–8 baris pendek per NPC, sebagian otomatis dari data yang sudah ada dan sebagian ditulis owner:
- **Otomatis:**
  - kata ganti (dari `gender` di npcs.json)
  - nama yang dipakai orang dan nama panggilan
  - cara memanggil {{user}} (dari Speech atau lore)
  - **`term_used`** (dari ArtificRealm): cara NPC memanggil {{user}} dan 2–4 orang kuncinya, bisa berubah per rank (Caine: "Young master"; Etnie: menyebut dirinya "Big Sister")
  - "Never" dari kategori Tension dan Trust
  - hubungan kunci (garis curated terkuat)
  - band Tension/Trust sekarang
- **Ditulis owner** (saya drafkan per NPC untuk disetujui): 2–3 hal yang "paling sering salah ditulis AI" untuk karakter itu.

Contoh Irene (English, masuk card):
```
INVARIANTS: she/her. Called "Irene" or "President"; addresses {{user}} by surname until Rank 4.
Composure is armour: stress shows as tidying, never as shouting. Embarrassment makes her MORE formal, never flustered-cute.
Never: breaks a rule herself in public; admits fear of the Doves; lets affection show in front of students.
Key ties: Caspian (friend, her VP), Aiden (rival: has never caught him), Althair (dislikes; uncomfortable with his praise).
```

### P3. Scene Examples: contoh bersituasi per NPC (kanon baru, perlu approval owner)

Diperbarui setelah membaca ArtificRealm (`<char chat example>`). Field lore baru untuk ke-38 NPC ber-bond:
- **4–6 contoh bersituasi** dengan bentuk "Scene: when … → Character: …" (dialog plus satu gestur). Minimal mencakup:
  - {{user}} melakukan hal yang ia sukai
  - {{user}} melakukan hal yang ia benci
  - saat tertekan atau terpojok
  - saat bersama orang ketiga (topik atau orang yang ia sayangi/benci)
  - untuk NPC bertopeng (Kanae, Castor, Caine, Gareth): **saat sendirian**, topeng lepas (bagian ini masuk `<narrator_only>`)
- satu baris **"Never sounds like"** (anti-pola)

Contoh bersituasi lebih kuat daripada contoh kalimat lepas, karena mengajarkan *kapan* suara itu berubah, bukan hanya bunyinya.

Contoh suara adalah penahan drift paling kuat; model meniru contoh jauh lebih baik daripada deskripsi. Karena ini **kanon baru**, saya tulis di `DRAFT_voices.md` terpisah per kelompok (Year 1, Year 2, Year 3, Staff, lainnya) untuk kamu review sebelum masuk lore.

Contoh bentuk (Irene, **hanya contoh, belum kanon**):
```
SCENE EXAMPLES
- Scene: {{user}} is out after curfew. Irene: "Curfew was twenty minutes ago. I'll note it, and you'll thank me for the reminder." She is already writing.
- Scene: {{user}} compliments her sincerely. Irene straightens a stack of papers that was already straight. "That is... kind. The minutes won't write themselves."
- Scene: a Dove walks into the Council room. Her smile does not move; her hands go under the table.
- Scene: Aiden slips past her again. "One day, Ruzzo." Said to an empty corridor.
Never sounds like: slang, gushing, exclamation marks, pet names.
```

### P4. Mind: isi kepala NPC yang bertahan (field baru, ditulis narator)

Field baru di setiap bond, **dari sisi NPC**:
- `Mind`: 1–2 kalimat tentang perasaannya pada {{user}} sekarang dan apa yang sedang ia pikirkan. Diperbarui saat berubah.
- `Knows`: daftar singkat apa yang **NPC itu tahu tentang {{user}}** (menyaksikan sendiri atau diberi tahu).
  - Contoh: "saw {{user}} sneak out after curfew (M1 W3)", "knows {{user}}'s birthday".
  - Ini menegakkan cognitive isolation dari arah sebaliknya: NPC hanya bereaksi pada yang ada di `Knows`.

Keduanya muncul di Cast Sheet. Rule 502 mendapat baris singkat cara mengisinya. Engine membatasi `Knows` 15 baris terakhir; baris lama pindah ke `$Knows_old`, seperti `Known_facts`.

Ditambah dua bagian, terinspirasi KritBlade:

- **`Imprints`** (maks. 5 per NPC, dari `Character_Generation_Protocol` mereka). Ini satu-satunya jalan sah bagi kepribadian untuk **berkembang**.
  - Setelah pengalaman besar dengan {{user}} (dampak 5/10 ke atas, misalnya {{user}} menyelamatkannya, atau pengkhianatan besar), narator menulis **keyakinan** yang terbentuk, bukan kejadiannya. Contoh: "Rules can be bent for someone who has earned it", bukan "{{user}} saved me at the lake".
  - Isinya: bobot (dampak), kapan, dan dari mana.
  - Engine menjaga maksimal 5: yang baru hanya bisa **menimpa** imprint berbobot lebih rendah; kalau tidak, ia **memperkuat** yang sejalan.
  - Hasilnya: karakter bisa tumbuh lewat cerita, tapi tidak bisa bergeser pelan-pelan tanpa sebab. Ini pasangan dari aturan P8.
- **`Defining moments`** (engine, maks. 5). `$Recent` hanya menyimpan 10 kejadian terakhir, jadi momen besar lama akhirnya hilang.
  - Engine otomatis menyalin baris `$Recent` yang besar ke daftar permanen yang tidak ikut bergulir: rank berubah, Trust ±15 atau lebih, Tension +20 atau lebih, romance.
  - Kalau penuh, yang paling kecil dampaknya keluar.
  - Muncul di Cast Sheet dan dossier. Setara dengan ImportantEvents / Negative / Positive Memories mereka, tapi otomatis dari data yang sudah ada.

### P5. Hubungan antar-NPC yang hadir

Kalau dua NPC atau lebih hadir, Cast Sheet menambahkan hubungan mereka **dua arah** dari `relations.json`: jenis dan kalimat lore-nya, termasuk yang belum terbuka bagi pemain, karena narator perlu tahu kebenarannya.

Contoh: "Irene → Aiden: rivals. Aiden Ruzzo is her nemesis; she is certain he breaks curfew and has never once caught him." Sekitar 40 token per pasangan.

### P6. NPC yang disebut di narasi tapi tidak ada di `Scene.Present`

Engine sudah menerima teks balasan (`runEngine(S, B, text)`) dan punya peta alias NPC. Usulan:
- NPC yang **disebut** di balasan terakhir tapi tidak hadir mendapat baris ringan di `<now>`: Invariants saja, plus di mana ia biasanya berada jam segini (dari Regulars/Timetable). Ini mencegah NPC "teleport" atau tiba-tiba ikut bicara tanpa data.
- Kalau NPC itu **berdialog** di narasi (namanya diikuti kutipan) tapi tidak ada di `Scene.Present`, `<now>` mengingatkan: "X spoke last reply but is not in Scene.Present: add them if they are still here."

### P7. Rahasia: status per NPC di Cast Sheet

Untuk setiap NPC hadir yang punya rahasia, tampilkan dua daftar:
- **Masih tersembunyi:** isi `<narrator_only>` yang topiknya belum ada di `Secrets_revealed`, dengan perintah "never state it; hints only through tells".
- **Sudah terbuka:** topik yang sudah ada di `Secrets_revealed`, dengan perintah "{{user}} knows this; the character behaves accordingly".

Tujuannya mencegah dua arah kegagalan: bocor terlalu cepat, dan lupa bahwa rahasia sudah terbongkar.

### P8. Aturan prioritas kanon (rule 504, sekitar 60 token)

> Canon outranks memory of the story's own prose: the <cast> sheets are the truth about each character. If an earlier reply drifted from them (voice, manner, knowledge), return to canon now, without comment and without explaining the change. A character changes only through what happened on-screen (their Mind and Recent say what has); never through gradual drift.
>
> Personality is a ceiling, not a mood. Rank, Trust, Tension and romance change HOW a character's personality shows toward {{user}}, never WHAT it is: a strict character who trusts {{user}} is relaxed-strict, not un-strict; a shy one in love stays shy and shows it shyly. Closeness is not warmth: read Trust, Tension and Mind for tone, not Rank. Only an Imprint can move a character's core. Every character acts from their own history, goals and interests, never to serve {{user}} or the plot.

Kalimat tambahan kedua (sekitar 90 token) diambil dari aturan ceiling dan "Affection ≠ Warmth" di MVU Game Maker. Ini menargetkan jenis drift paling umum di card romance/slice-of-life: **semua NPC pelan-pelan menjadi manis dan penurut begitu rank-nya naik**.

### P9. Langkah konsistensi di CoT preset (BOLT Chain of Thought)

Tambah satu langkah di CoT yang aktif, lewat `presets/edit_preset.py` yang memang sudah dipakai proyek ini untuk mengedit preset:

> Cast check: for each character who will speak, reread their <cast> INVARIANTS and VOICE; confirm pronouns, how they address {{user}}, what they know (Knows) and what they must not reveal.

- Biaya: sekitar 50–150 token reasoning per balasan.
- ⚠️ Menurut tabel pembagian tugas, **reasoning (CoT) adalah wilayah preset**. Proyek ini sudah punya jalur resmi untuk mengedit preset, jadi ini masih di dalam aturan, tapi tetap keputusanmu `[?]`.

### P10. Alat audit drift untuk playtest (offline, tidak masuk card)

`tools/audit_chat.py`: membaca chat yang diekspor dari SillyTavern (`.jsonl`) lalu menandai:
- kata ganti yang salah per NPC
- NPC yang berdialog tapi tidak ada di `Scene.Present`
- nama atau alias yang salah
- kata kunci rahasia (`narrator_only`) yang muncul di dialog sebelum topiknya ada di `Secrets_revealed`
- informasi yang terkunci rank (Goals, Backstory) yang disebut NPC sebelum rank-nya tercapai
- pola "Never sounds like" dari P3 (misalnya Irene memakai tanda seru)

Hasilnya laporan per NPC per rentang pesan, supaya kamu bisa melihat **di pesan ke berapa** karakter mulai melenceng.

### P11. Jendela chat yang disimpan `[?]`

Regex State-as-memory menyimpan 24 pesan terakhir. Dengan konteks 1M di preset:
- **Menaikkan jumlahnya** (misalnya 40): kontinuitas plot lebih baik, tapi lebih banyak prosa lama yang bisa ditiru.
- **Menurunkannya** (misalnya 16): drift karena meniru diri sendiri berkurang, tapi kontinuitas adegan panjang ikut berkurang.

Dengan P1 dan P8 aktif, kanon selalu lebih dekat ke titik menulis daripada prosa lama, jadi saya sarankan **tetap 24** dan diukur ulang lewat P10 setelah playtest.

### P12. Anti-dramatisasi (baru; dari `Anti_Dramatization` ArtificRealm)

Rule 504, sekitar 80 token:

> Simulate, do not dramatise. People act from their role, their interests and the situation: a clerk handles the form, a teacher the lesson, a Dove the inspection. No invented conflict, no test of {{user}} that the situation does not call for, no coincidence without a cause, no character acting against their own interest for the sake of drama. Tension comes from the world and the characters' goals, not from the narrator.

Ini menjaga NPC tetap dalam perannya. Drift jenis ini (semua NPC tiba-tiba menantang atau menggoda {{user}}) biasanya muncul makin sering di chat yang panjang.

### P13. Simulasi pikiran sebelum NPC bertindak (baru; isi langkah CoT P9)

Dari `Character_Mind_Simulation_Protocol`. Langkah "Cast check" di P9 diperluas:
> For each character who will act: (1) what they know here (Knows, cognitive isolation); (2) three pulls: feeling, goal, their history with the people present (Mind, Recent, Imprints); (3) what their personality allows (INVARIANTS, ceiling); (4) what they show versus what they intend (a mask may differ); then write them.

Ditambah prinsip "anti-incapacitation" mereka: NPC boleh takut atau sedih, tapi tetap bertindak sesuai sifatnya, tidak runtuh jadi pasif. Ini masuk wilayah preset (CoT), sama seperti P9.

### P14. (Opsional) Trait angka per NPC

Versi penuh gaya MVU Game Maker: 8–10 sifat berangka per NPC (misalnya Dominance, Confidence, Shyness, Playfulness, Kindness, Patience, EmotionalStability, Impulsive), plus tabel arahan menulis per band dan aturan kombinasi. Dicetak di Cast Sheet dan tidak bisa diubah narator.
- **Kelebihan:** paling tahan drift; arahan per band sangat konkret.
- **Kekurangan:** 38 × 8 angka adalah kanon baru yang harus kamu setujui; tabel arahan sekitar 1.300 token selalu aktif; dan tumpang tindih dengan kategori Tension/Trust.
- **Saran saya:** tunda sampai P1–P4 diuji lewat audit P10. Kalau masih ada drift sifat, baru kerjakan P14 untuk NPC yang bermasalah saja.

---

## Perkiraan token (per balasan)

| Situasi | Sekarang | Dengan P1–P8 |
|---|---|---|
| Berdua dengan 1 NPC | sekitar 1.000 (entry keyword, kalau aktif) | sekitar 1.500 (lore + invariants + mind/knows + rahasia) |
| 3 NPC | 0–3.000 (tergantung keyword) | sekitar 4.800 + 3 pasangan hubungan (sekitar 120) |
| Kelas, 8 NPC | 0–8.000 | sekitar 12.000 (atau sekitar 5.000 dengan batas `[?]`) |
| Per NPC hadir, tambahan dari P3/P4 baru | — | +250–400 (scene examples, imprints, defining moments) |
| Selalu aktif (rule P8, P12; CoT P9/P13) | — | +230 prompt, +100–250 reasoning |

## Cek terhadap prinsip dan keputusan yang ada

- **Pembagian tugas (HANDOFF §1):**
  - P1 mengubah "lore activation = keyword WI" untuk NPC yang hadir.
  - P9 menyentuh CoT (wilayah preset).
  - Keduanya ditandai dan butuh persetujuan.
  - P2–P8 tetap di wilayah card: data kanon dan state.
- **Kanon owner tetap sumber kebenaran:** P3 (voice samples) dan bagian manual P2 adalah kanon baru, jadi lewat draf terpisah dan disetujui per NPC.
- **Cognitive isolation (rule 504):** diperkuat oleh P4 (`Knows`) dan P7 (rahasia).
- **UI tidak menggerakkan cerita:** tidak ada yang berubah. Dossier bisa menampilkan `Mind` dan `Knows` hanya bila kamu mau `[?]`; defaultnya disembunyikan dari pemain karena itu isi kepala NPC.

## Urutan penerapan yang saya sarankan

1. **P1 + P8 + P5 + P7:** kerangka Cast Sheet, dengan data yang sudah ada. Dampak terbesar, tanpa kanon baru.
2. **P2 otomatis + P4:** field `Mind` dan `Knows`, schema, rule 502, engine.
3. **P6 + P10:** alat deteksi dan audit, untuk mengukur hasil 1–2 di playtest.
4. **P3 + bagian manual P2:** scene examples dan `term_used` per kelompok NPC, disetujui bertahap.
5. **P9 + P13 + P12:** langkah CoT di preset dan aturan anti-dramatisasi.
6. **P14** hanya kalau audit P10 masih menunjukkan drift sifat.

## Keputusan terbuka

1. `[?]` **P1: pindahkan aktivasi lore NPC yang hadir ke card (EJS)?** Ini mengubah keputusan pembagian tugas "Lore activation → keyword WI" di HANDOFF §1.
2. `[?]` **Sumber teks P1:** disematkan lewat `gen_mvu_entries.py` (saran saya, deterministik), atau `getwi` dari Prompt Template (perlu verifikasi upstream)?
3. `[?]` **Batas untuk adegan ramai:** semua NPC hadir mendapat lore lengkap, atau lore lengkap hanya untuk 4 NPC ber-bond dengan rank tertinggi atau yang baru bicara, sisanya Invariants saja?
4. `[?]` **P3 Scene Examples:** setuju saya drafkan untuk 38 NPC di `DRAFT_voices.md` (4–6 contoh bersituasi per NPC, gaya ArtificRealm), per kelompok? Kelompok mana dulu?
5. `[?]` **P4:** nama field `Mind` dan `Knows` oke? Tampilkan di dossier untuk pemain, atau narator saja?
6. `[?]` **P9:** tambahkan langkah "Cast check" di BOLT CoT preset?
7. `[?]` **P11:** jendela chat tetap 24 pesan?
8. `[?]` **P6:** deteksi "berdialog tapi tidak ada di Scene.Present" cukup sebagai pengingat di `<now>`, atau engine langsung menambahkannya ke `Scene.Present`?
9. `[?]` **P4 Imprints** (maks. 5, ditulis narator hanya setelah pengalaman berdampak 5/10 ke atas; engine menjaga batas dan aturan timpa) dan **Defining moments** (otomatis, maks. 5): setuju? Tampilkan Imprints di dossier untuk pemain?
10. `[?]` **P8 aturan ceiling** ("personality is a ceiling, not a mood") dan **P12 anti-dramatisasi**: setuju teksnya?
11. `[?]` **P13** simulasi pikiran di CoT preset: setuju (wilayah preset)?
12. `[?]` **P14 Trait angka:** tunda seperti saran saya, atau kerjakan sekarang?
