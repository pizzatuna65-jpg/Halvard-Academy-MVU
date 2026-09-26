# DRAFT: Cabang Rank 8 per NPC (brainstorm, digabung sebagai catatan persetujuan)

Status: **DISETUJUI owner 2026-09-26** di thread Brainstorming (kategori: "approve, buat draft barunya", lalu perpindahan
kategori; baris dan implementasi: "approve, buat draft implementasi semua npc", lalu "ya"). **DITERAPKAN di rilis 1.6.8.**
Data yang dipakai: `data/npc_canon.json` (`branch`, `voice.<id>.romance`, `voice.<id>.rival`). Tiga bagian di bawah adalah
draf asli dari `/mnt/project-files/brainstorm/`, disalin apa adanya.

---

## Bagian 1: DRAFT — Cabang Rank 8 per NPC (brainstorm, belum diterapkan)

Status: **kategori disetujui ras 2026-09-26.** Baris per NPC ada di `DRAFT_rank8_lines.md` (belum disetujui).

### 1. Format (disetujui ras 2026-09-26)

Stage dasar tetap. Mulai Rank 8 (setelah event 7→8 memilih cabang), Cast Sheet menambahkan **satu baris pendek** sesuai
cabang yang aktif:

- `Romance:` apa yang berubah kalau bond jadi romance.
- `Rival:` cara NPC bermusuhan tanpa keluar dari karakternya.
- Best friend = Stage dasar saja, tanpa baris tambahan.

Engine memilih baris dari `Bonds.<id>.Romance` / title "rival". Setting romance global (Rank 8 default, atau Off) tetap
berlaku di atas kategori.

### 2. Empat kategori

| Kode | Kategori | Event Rank 8 bisa jadi |
|---|---|---|
| **A** | Semua cabang | best friend, romance, rival |
| **B** | Friend + Rival | best friend, rival |
| **C** | Friend + Romance | best friend, romance |
| **D** | Friends only | best friend |

### 3. Usulan kategori per NPC

| NPC | Usul | Alasan singkat |
|---|---|---|
| Etnie | C | cinta satu arah ke {{user}} sudah canon (1.4.2); rival bertentangan dengan "big sister" |
| Irene | A | ketua dewan yang strict: rival (aturan vs {{user}}) masuk akal, romance juga |
| Aiden | A | seangkatan, prankster, semua jalan wajar |
| Castor | A | model topeng; semua cabang tetap tunduk gerbang Rank 9 |
| Zara | C | pemalu; rival terasa dipaksakan `[?]` |
| Kanae | A | cinta satu arah sudah canon; rival = sabotase manis, sangat dia |
| Rei | A | muda (teman seangkatan Kuroo); cool dan bold, semua cabang cocok |
| Caine | A | 25 tahun, bukan staf akademi; mage-hater, romance lambat lewat gerbang rahasianya |
| Caralynn | A | vain, rival paling alami |
| Percival | A | "ksatria", bisa jadi rival kehormatan atau romantis |
| Trixie | C | ras 2026-09-26 |
| Vera | C | ras 2026-09-26 |
| Alyssa | C | lupa tiap minggu dan tidak pernah dingin: rival tidak bisa bertahan |
| Lenna | A | |
| Saffi | A | |
| Idris | A | sardonic, rival alami |
| Dante | A | fatherly dan lawful; rival = dingin prosedural |
| Florian | A | ras 2026-09-26 (romance melawan canon "commits to no one", lihat DRAFT_rank8_lines) |
| Tilly | C | ras 2026-09-26 |
| Caspian | A | |
| Royhan | A | |
| Sophia | A | violent, Blood Saint #2; rival alami |
| Gareth | A | #1; rival alami |
| Ruby | C | kind; rival bertentangan dengan wataknya `[?]` |
| Gavlan | D | guru |
| Yvette | D | guru, motherly |
| Baelin | D | Headmaster |
| Layla | D | guru |
| Vallie | A | blunt dan jovial, suka adu kekuatan: rival sparring atau romance yang terang-terangan |
| Kuroo | A | provokator yang aslinya tulus; rival dan romance sama-sama in character |
| Mimosa | C | "be remembered by someone"; romance yang malu-malu, rival tidak cocok dengan kecemasannya |
| Althair | D | ras 2026-09-26 |
| Ezrel | D | apatis: rival butuh peduli, dia tidak |
| Ottavio | D | dorm head Sky |
| Krieg | B | cruel, Doves; bond auto-XP dan Tension |
| Milena | A | ras 2026-09-26 |
| Tristan | B | ras 2026-09-26 |
| Bobby | C | mak comblang yang tidak pernah sadar dirinya sendiri yang ditaksir |

Ringkasan (revisi 2026-09-26, ras ingin kebebasan pemain diutamakan): A 20, B 2, C 9, D 7 (revisi kedua ras 2026-09-26). Staf tetap D kalau romance
bertentangan dengan canon atau watak: Gavlan, Baelin, Yvette, Layla, Ezrel, Ottavio. Romance dengan guru: NPC tetap menjaga
batas profesionalnya selama {{user}} muridnya (pelan, tersembunyi), sesuai wataknya, bukan dipaksa mekanik.

### 4. Contoh baris (teks card, bahasa Inggris)

**Alyssa (C)**
- Romance: "Her page on {{user}} has a pressed flower in it and one line in a firmer hand: \"You love this person. Believe it.\" Every rest day she reads it and decides to believe it; shy for a day, then sure. Nothing is cured: each week's first kiss is, to her, the first."
- Rival: closed.

**Dante (A)**
- Romance: "Says it plainly, once, and keeps it like an oath. Warmer in private, the same in public. The rules do not bend for {{user}}: he would report them just as fast, then sit beside them through the hearing."
- Rival: "Judges {{user}} a criminal in waiting, not an enemy. Perfectly fair and perfectly cold: cites the rule, never touches {{user}} outside it, and still counts them back in at curfew. The warmth is gone; the fairness is not."

**Kanae (A)**
- Romance: "{{user}} is hers, and in private she is almost giddy about it; in public she is the same sweet girl, only the rumours about {{user}}'s friends spread faster now. The possessiveness does not ease; it has a reason now."
- Rival: "Never an open enemy. Sweeter than ever to {{user}}'s face; readings for others that happen to warn them off {{user}}; friends drift away one plausible rumour at a time. Accused, she is hurt, in public."

### 5. Keputusan terbuka

- **Aturan Trust (ras 2026-09-26):** cabang rival hanya terbuka kalau Trust di bawah 50. Trust 50 ke atas: event Rank 8
  memilih best friend atau romance (rival tidak ditawarkan). Ini mempersempit teks tema Rank 8 sekarang ("the event lets
  {{user}} choose" di antara tiga).
- **NPC tanpa cabang rival (C dan D) dengan Trust di bawah 50 (ras 2026-09-26):** event Rank 8 **menunggu sampai Trust 50**.
  Ini mengubah aturan Trust 1.4.3 ("the Rank 8 event never waits") khusus untuk NPC C dan D.
- `[?]` Tanda `[?]` di tabel: Zara, Ruby. Umur staf kebanyakan tidak ada di lore (Rei, Kuroo, Tristan disimpulkan).
- `[?]` Pemain yang set romance "Any rank" / Rank 4: kategori tetap membatasi (NPC B/D tidak pernah romance).

---

## Bagian 2: DRAFT — Baris Romance / Rival Rank 8 (belum diterapkan)

Status: **disetujui ras 2026-09-26** (semua baris, termasuk pengecualian Florian). Rencana kerja: `DRAFT_rank8_implementation.md`.
Kategori per NPC sudah disetujui ras (2026-09-26) di `DRAFT_rank8_branches.md`.

### Aturan yang sudah disetujui (ras 2026-09-26)

- Stage dasar tetap. Mulai Rank 8 (setelah event 7→8 memilih cabang), Cast Sheet menambahkan **satu baris pendek** untuk
  cabang aktif: `Romance:` atau `Rival:`. Best friend = Stage dasar saja.
- Kategori: **A** semua cabang, **B** friend + rival, **C** friend + romance, **D** friends only.
- Rival **hanya** terbuka kalau Trust di bawah 50. Trust 50+ → event Rank 8 hanya menawarkan best friend atau romance.
- NPC tanpa cabang rival (C, D) dengan Trust di bawah 50 → event Rank 8 **menunggu sampai Trust 50**
  (mengubah aturan Trust 1.4.3 "the Rank 8 event never waits", hanya untuk C dan D).
- Guru/staf yang bisa romance tetap menjaga batas profesional selama {{user}} muridnya: pelan, tersembunyi, sesuai watak.

Catatan penulisan: rival di sini adalah bond Rank 8 dengan Trust rendah, jadi **dekat tapi tidak percaya**, bukan musuh
(musuh = Tension). Baris untuk NPC bertopeng (Castor, Kanae, Caine) harus tetap benar sebelum dan sesudah rahasianya terbuka.

---

### Murid

**Etnie (C)**
- Romance: Still "Big Sister", and she sees no contradiction: a big sister can love {{user}} every way there is, and she dares anyone to argue. The possessiveness gets worse, not better, because now she has a claim to point to. Kisses {{user}} in front of whoever was standing too close.

**Irene (A)**
- Romance: Admits it formally, as if reading the minutes, and is afraid for a week afterwards. Keeps it out of the Council room entirely; in private she is careful, deliberate and slow. The one sign in public is that she stops correcting {{user}}'s uniform.
- Rival: Treats {{user}} as the problem the rules exist for. Every infraction noted, every report filed on time, and her private tally of {{user}}'s wins kept as neatly as the minutes. Never unfair; she would hate herself for it.

**Aiden (A)**
- Romance: Makes it a bet first, loses on purpose, then means it. Still hustles everyone else; {{user}} gets the honest odds and the first cut. Nervous around them in a way he cannot joke off, and he stops trying.
- Rival: Turns the campus into a book on {{user}}: odds on every exam, every duel, every mistake. He never cheats, not even here; beating {{user}} straight is the whole point, and he grins when he does.

**Castor (A)**
- Romance: Quiet about it, even with {{user}}: a hand found under the table, a seat saved that nobody else notices. The melancholy deepens rather than lifts, because now there is someone who could be used against him. Only once his secret is out does he say why.
- Rival: Watches {{user}} more closely than anyone, and for once lets it be noticed. Beats them quietly where it counts, and nobody else remembers he was there.

**Zara (C)**
- Romance: Tells {{user}} in writing first, then hides for a day. With {{user}} she stops hunching entirely; in public she holds their sleeve instead of their hand. Draws them constantly and shows them none of it.

**Kanae (A)**
- Romance: {{user}} is hers, and in private she is almost giddy about it; in public she is the same sweet girl, only the rumours about {{user}}'s friends spread faster now. The possessiveness does not ease; it has a reason now.
- Rival: Never an open enemy. Sweeter than ever to {{user}}'s face; readings for others that happen to warn them off {{user}}; friends drift away one plausible rumour at a time. Accused, she is hurt, in public.

**Caralynn (A)**
- Romance: Announces it as though she chose {{user}} out of generosity, and is quietly terrified they will laugh. Sings for {{user}} alone and asks what they thought, which she has never asked anyone. Still vain; now vain about {{user}} too.
- Rival: Makes {{user}} her official rival, out loud and from the front row. Every jab stays deniable, every competition turns personal, and losing to {{user}} ruins her week. She would still never admit they are good.

**Percival (A)**
- Romance: Declares {{user}} the one his sword is sworn to, in a ballad nobody asked for, and challenges anyone who laughs. The tales about {{user}} stay the only ones he never embellishes. Alone with them he is quieter than anyone has seen him.
- Rival: Names {{user}} his nemesis, with full honours: challenges at dawn, rules of chivalry, a ballad for every bout (his losses become heroic retreats). Never mocks {{user}}, never fights dirty; he simply cannot let them win.

**Trixie (C)**
- Romance: Tells everyone, immediately, including people who did not ask. Holds {{user}}'s hand everywhere and forgets to let go. Keeps nothing about it secret, because she has no idea how.

**Vera (C)**
- Romance: Approaches it as an experiment and announces her hypothesis. Stays up a day and a half building {{user}} something, then falls asleep on them. Talks even faster around them and does not care.

**Alyssa (C)**
- Romance: Her page on {{user}} has a pressed flower in it and one line in a firmer hand: "You love this person. Believe it." Every rest day she reads it and decides to believe it; shy for a day, then sure. Nothing is cured: each week's first kiss is, to her, the first.

**Lenna (A)**
- Romance: Turns the confession into a joke, as she does every confession, and then does not take it back. Naps against {{user}} in the Elder Oak's roots; says the real thing first only when nobody else can hear. Still lazy about everything else.
- Rival: Lazily, maddeningly better: yawns through {{user}}'s best effort and wins anyway. The teasing gets sharper and is still never cruel. Provoke her properly and {{user}} meets the terrifying Lenna.

**Saffi (A)**
- Romance: Tells {{user}} at the end of a run, out of breath, and makes them run one more lap before they answer. Loud about it everywhere; carries {{user}} when they are tired, whether or not they are.
- Rival: Challenges {{user}} to anything with a score: laps, lifts, the Arena. Loud, stubborn, never dirty; she defends {{user}} from anyone else and then tries to beat them herself.

**Idris (A)**
- Romance: Sardonic about it from the first word, and the courtesy with {{user}} drops completely. Leans on them in the Gardens as if by accident. Afraid of what the Doves could do with it, and says so once.
- Rival: The cold courtesy, aimed straight at {{user}} and sharpened. Outhaggles, outargues and outwaits them, and enjoys it. When he loses he clenches his jaw and leaves.

**Dante (A)**
- Romance: Says it plainly, once, and keeps it like an oath. Warmer in private, the same in public. The rules do not bend for {{user}}: he would report them just as fast, then sit beside them through the hearing.
- Rival: Judges {{user}} a criminal in waiting, not an enemy. Perfectly fair and perfectly cold: cites the rule, never touches {{user}} outside it, and still counts them back in at curfew. The warmth is gone; the fairness is not.

**Florian (A)** `[?]`
- Romance: Still says he commits to no one, and still flirts with the whole room; he simply keeps ending up beside {{user}}, and stops pretending it is an accident. The first sincere thing he says to them costs him visibly, and he does not take it back. Jealous for the first time in his life, and furious about it.
- Rival: The one person he cannot charm, so he tries to beat them instead, in public and with style. Genuinely warm to {{user}} every time they beat him, which he hates. Still flirts with the whole room, {{user}} included, as a weapon.

**Tilly (C)**
- Romance: Delighted, formally: the court phrasing comes out in full and she does not catch it. Takes {{user}} on every reckless investigation and checks they are safe first. The secret stays hers; the flowers give everything else away.

**Caspian (A)**
- Romance: Courteous about it, and willful: once decided, he does not waver. Brings {{user}} to the Liaison without explanation and smooths over every raised eyebrow. With {{user}} the glasses cloth comes out, and so does the truth.
- Rival: A courteous argument that never ends. Smiles, smooths every room, and makes sure {{user}} loses the room anyway. Never force; he wins with words.

**Royhan (A)**
- Romance: Says it plainly, the way he offers work. Notices when {{user}} has not eaten and fixes it; then learns, slowly, to ask them for things. Fierce about {{user}} the way he is about Dunmere.
- Rival: Quiet, stubborn competition: works longer, prepares better, and refuses any favour from {{user}}. Never boasts when he wins; lets the result speak.

**Sophia (A)**
- Romance: Claims {{user}} out loud and dares the room to comment. Rough, possessive, completely loyal; the insults stay and mean the opposite. The one person she lets see how close she stands to the line.
- Rival: Names {{user}} her rival to their face, and means it as respect. Duels them whenever she can, to the edge of the rules, and never humiliates them the way she does cowards. Losing to {{user}} makes her grin.

**Gareth (A)**
- Romance: Gentle about it with the glasses on; intense about it with them off. {{user}} is still his one exception to coming first. The secret stays unconfessed, even now.
- Rival: Kind to {{user}} in public, glasses on, and absolutely set on beating them, glasses off. The only rival he admits to having; he still never admits wanting to be first.

**Ruby (C)**
- Romance: Tells {{user}} with the guitar, badly on purpose, then properly. Still warm to everyone; {{user}} is the side she has picked, and she says so. Cries more easily now, and does not hide it from them.

### Staf dan lainnya

Gavlan, Yvette, Baelin, Layla, Ezrel, Ottavio, Althair: **D**, tanpa baris tambahan.

**Rei (A)**
- Romance: Says it once, flatly, and does not repeat herself. Nothing changes in public; while {{user}} is a student she keeps it off the Warden's rounds and out of sight. In private: a cigarette shared on the wall, and the only person she lets stand behind her.
- Rival: Stops being amused. Weighs {{user}} as a risk: bars, blocks and watches them without a word of explanation, always a step ahead. Never cruel; simply immovable.

**Caine (A)**
- Romance: Before his secret is out, the courtesy stays perfect and the warmth hides in its timing: tea already poured, a door already open. He despises himself for it. After, he is honest at last: he hates what {{user}} is and wants them anyway.
- Rival: The smirk appears for {{user}}, and he no longer hides it from them. Courteous to the letter, never a word out of place, and every service carries a small humiliation only {{user}} would notice.

**Vallie (A)**
- Romance: Blunt and loud about it: tells {{user}} straight out and headlocks them when they go red. While {{user}} is a student it stays out of class and off the Expedition; off duty it is cigars, arm-wrestling and an eyepatch story she swears is the true one.
- Rival: Loves a rivalry and makes {{user}} hers: arm-wrestles, challenges and hounds them on every Expedition, because it makes them stronger. Brutal and crass, never careless; she still keeps {{user}} alive.

**Kuroo (A)**
- Romance: Provokes {{user}} into saying it first, then drops the smirk and says it back. Keeps it out of class and out of staff business while {{user}} is a student. Still provokes them constantly; now it is flirting.
- Rival: Makes {{user}} his project: finds the exact button and presses it, daily, in front of the class. If he crosses a line he still apologises sincerely, and then starts again.

**Mimosa (C)**
- Romance: Sure it is a mistake or a stroke of luck, she hides in the cupboard for a day to recover, then comes out completely carried away. Keeps it far from her classroom while {{user}} is a student. The one person allowed to sit outside the cupboard door and talk to her through it.

**Krieg (B)**
- Rival: Makes {{user}} his personal case. Cordial, patient, relentless: questions, searches and files, and never once raises his voice. The politer he gets with {{user}}, the closer he is.

**Milena (A)**
- Romance: Warm about it and honest from the start: she is a sworn Dove, and she tells {{user}} what that could mean. Keeps it out of her classroom while {{user}} is a student, and from Krieg for as long as she can. If {{user}} ever touched a forbidden art, she would still be the one to come.
- Rival: Still warm, and watching. Treats {{user}} as the student most likely to fall and reaches them first, every time: kind visits, gentle questions, a file she keeps thicker than anyone's. Never cold, never loud; if the forbidden art ever appears, she is already there.

**Tristan (B)**
- Rival: A game of questions: every conversation leaves {{user}} having agreed to something they did not mean to. Whimsical, unhurried, never threatening, and the registry stays closed even now.

**Bobby (C)**
- Romance: The matchmaker never sees it coming: {{user}} has to ask twice, because the first time he assumes they want help asking someone else. Then he plans the most elaborate date on campus, and it goes wrong in three places.

---

### Keputusan terbuka

- `[?]` Etnie: romance-nya tetap sebagai "Big Sister" (sesuai canon 1.4.2: "loves you above everything, and is wholly convinced she is your big sister"). Oke begini, atau dia melepas sebutan itu kalau romance?
- `[?]` Florian: canon suaranya bilang "commits to no one and says so" dan dont_flatten melarang "his flirting into a romance plot". Baris Romance di atas mempertahankan itu (dia tetap tidak mau menyebutnya komitmen). Kalau approve, kalimat dont_flatten Florian perlu diubah sedikit, misalnya: "...into a romance plot (he commits to no one and says so, unless a Rank 8 romance with {{user}} is the one exception he will not name)".
- `[?]` Staf yang bisa romance: batas profesional ditulis di tiap baris (Rei, Vallie, Kuroo, Mimosa, Milena). Oke, atau cukup satu aturan umum di card?
- `[?]` Pemain yang set romance "Any rank" / Rank 4: baris Romance tetap baru muncul dari Rank 8, atau ikut rank setting romance?

---

## Bagian 3: DRAFT — Implementasi cabang Rank 8 (siap diserahkan ke thread implementasi)

Status: **canon disetujui ras 2026-09-26** (kategori + semua baris, termasuk pengecualian Florian). Dokumen ini adalah rencana
kerjanya. Belum ada yang diubah di repo. Dikerjakan di thread "Lanjutkan progress Halvard Academy".

Sumber:
- `DRAFT_rank8_branches.md`: kategori per NPC dan alasannya.
- `DRAFT_rank8_lines.md`: teks card untuk setiap baris Romance/Rival.
- `rank8_branches.json`: data yang sama dalam bentuk JSON, sudah divalidasi (38 NPC; A 20, B 2, C 9, D 7; setiap NPC punya
  tepat baris yang diminta kategorinya).

Rilis yang diusulkan: **1.6.8** (`Release 1.6.8: Rank 8 branches per NPC`).

---

### 1. Aturan yang disetujui

| Kode | Cabang yang terbuka di event 7→8 |
|---|---|
| A | best friend, romance, rival |
| B | best friend, rival |
| C | best friend, romance |
| D | best friend saja |

- **Rival hanya kalau Trust di bawah gerbang Rank 8** (`trustGate(id, 8)`, sekarang 50). Trust 50+ → hanya best friend atau
  romance (kalau kategori dan Settings mengizinkan).
- **C dan D dengan Trust di bawah 50 → event 7→8 ditahan** sampai Trust 50 (seperti gerbang Rank 6/7/9/10).
  A dan B tetap tidak pernah ditahan di Rank 8 (aturan 1.4.3 tetap berlaku untuk mereka).
- **Romance tidak mungkin untuk B dan D**, apa pun setting romance-nya.
- Stage dasar tidak berubah. Cast Sheet menambah satu baris untuk cabang yang aktif: `Romance:` kalau `Bonds.<id>.Romance`,
  `Rival:` kalau cabangnya rival. Best friend tidak dapat baris tambahan.
- NPC dengan `no_gates` (Etnie C, Althair D) punya gerbang 0, jadi tidak pernah rival dan tidak pernah ditahan. Itu sesuai
  kategori mereka.

### 2. Data

**`data/npc_canon.json`**
- Tambah kunci atas `branch`: `{ "<id>": "A" | "B" | "C" | "D" }` untuk ke-38 NPC (ambil dari `rank8_branches.json`).
- Tambah `romance` dan/atau `rival` (string) ke `voice.<id>` sesuai kategori (ambil dari `rank8_branches.json` → `lines`).
- Perbarui `_note`: sebut `branch`, `romance`, `rival`, dan persetujuan ras 2026-09-26.
- **Florian `dont_flatten`** (pengecualian yang disetujui): ganti
  `his flirting into a romance plot (he commits to no one and says so)` dengan
  `his flirting into a romance plot (he commits to no one and says so; a romance with {{user}} is the one exception, and he will not call it one)`.

**`data/bond_rules.json`**
- `themes.7`: `"A turning point: the bond becomes best friends, a romance or a sworn rivalry, as far as this character allows; the event lets {{user}} choose among what is open."`
- `perks.8`: `"closest bond: best friend, romance or sworn rival, as far as this character allows (the rank 8 event decides)"`

**`data/trust.json`**: `_note` sebut bahwa gerbang Rank 8 sekarang menahan event untuk NPC C dan D.

### 3. Engine (`src/scripts/engine.template.js`, dibangun oleh `tools/gen_engine.py`)

1. `gen_engine.py` meneruskan `branch` dari `npc_canon.json` ke engine (misalnya `const BRANCH = {...}`), default `'A'` untuk
   id yang tidak ada supaya NPC baru tidak rusak.
2. Helper: `canRomance = id => 'AC'.includes(BRANCH[id] || 'A')`, `canRival = id => 'AB'.includes(BRANCH[id] || 'A')`.
3. **`trustHold`** (sekitar baris 1003): sekarang `b.Rank + 1 !== 8 && …`. Ubah supaya Rank 8 juga ditahan kalau
   `!canRival(id)`: `(b.Rank + 1 !== 8 || !canRival(id)) && num(b.Trust, 50) < trustGate(id, b.Rank + 1)`.
4. **Arahan event 7→8** (sekitar baris 1349), ganti satu kalimat rivalry dengan kalimat per kasus:
   - Trust di bawah gerbang, bisa rival: `this bond can only turn into a sworn rivalry here, not a best friendship or a romance.` (teks lama)
   - Trust cukup, `canRomance` dan Settings mengizinkan romance di Rank 8: `this bond can turn into a best friendship or a romance; not a rivalry.`
   - Trust cukup, tanpa romance (B/D, atau romance Off/rank lebih tinggi): `this bond can only turn into a best friendship here.`
5. **Penjaga flag Romance** (sekitar baris 1234): sebelum cek Settings, kalau `!canRomance(id)` → `b.Romance = false`, log
   `Romance with ${id} is closed (canon: ${id} does not become a romance).`
6. **Cabang tersimpan**: field tersembunyi `b.$branch` (`'friend' | 'romance' | 'rival'`), diisi sekali saat rank naik 7→8:
   `b.Romance ? 'romance' : (canRival(id) && b.Trust < trustGate(id, 8) ? 'rival' : 'friend')`. Saat flag Romance baru
   diterima (rank berapa pun), set `$branch = 'romance'`. Deterministik, tidak bergantung pada Title dari narator.
7. **Save lama** (bond sudah Rank 8+ tanpa `$branch`): isi saat load dengan `Romance → 'romance'`, Title mengandung `rival` →
   `'rival'`, selain itu `'friend'`. Jangan ubah Rank, Trust, Title atau Romance yang sudah ada, meskipun kategori baru
   menutup cabang itu (romance dengan NPC B/D di save lama dibiarkan; log satu kali saja).

### 4. Cast Sheet (`src/worldbook/custom/509.template.ejs`)

Di `cVoice` setelah baris Stage:
- `b.Romance && v.romance` → `Romance with {{user}}: ` + `v.romance`
- `b.$branch === 'rival' && !b.Romance && v.rival` → `Sworn rival of {{user}}: ` + `v.rival`

Dicetak juga di brief sheet (baris Stage memang dicetak untuk brief dan full). Data 509 dari `tools/gen_mvu_entries.py` harus
ikut membawa `romance`/`rival`.

### 5. UI (opsional, disarankan demi kebebasan pemain)

Dossier di People: satu baris kecil sejak Rank 6, misalnya `At Rank 8: best friend · romance · rival (Trust under 50)`, supaya
pemain tahu apa yang terbuka sebelum event. Sumber: `branch` + `trustGate`.

### 6. Dokumen

- **HANDOFF §4 Bonds**: tambah kategori A–D dan penjaga romance. **§4 Trust**: "the Rank 8 event never waits" → "never waits
  for A/B NPCs; C/D NPCs wait for Trust 50". Snapshot di atas: 1.6.8.
- `docs/BOND_EVENTS.md`: event 7→8 hanya menawarkan cabang yang terbuka untuk NPC itu.
- `tools/make_npc_brief.py`: brief NPC baru menyebut kategori cabang (NPC baru butuh kategori dan barisnya sendiri).
- `planning/NPC_BRAINSTORM_BRIEF.md`: catat kategori dan baris (aturan CLAUDE.md setelah canon diterapkan).
- Salin ketiga file brainstorm ke `planning/DRAFT_rank8_branches.md` (satu file) sebagai catatan persetujuan.
- PROGRESS 1.6.8: apa yang berubah, tes, dan "To verify in ST" (event 7→8 menawarkan pilihan yang benar; baris Cast Sheet muncul).

### 7. Tes

Baru, `tests/test_rank8_v168.cjs`:
- Setiap NPC di `change` punya `branch` A–D, dan baris yang cocok (A: dua, B: rival, C: romance, D: tidak ada).
- Teks baris lolos `TASTE` dari `test_split_v146` (tanpa "tense", "point of view", dsb.).
- Flag Romance ditolak untuk B (Krieg) dan D (Gavlan), diterima untuk C (Ruby, Trust 60, Rank 8).
- C (Ruby) Rank 7, XP penuh, Trust 40 → event ditahan (`why: 'trust'`, `need: 50`); Trust 55 → siap, arahan
  "best friendship or a romance".
- A (Irene) Trust 40 → tidak ditahan, arahan rivalry; naik ke 8 → `$branch === 'rival'`, Cast Sheet mencetak `Sworn rival of {{user}}:`.
- B (Tristan) Trust 60 → arahan "only a best friendship".
- D (Althair, no_gates) → tidak pernah ditahan, arahan best friendship saja.
- Romance aktif → Cast Sheet mencetak `Romance with {{user}}:`; best friend → tidak ada baris tambahan.

Tes lama yang harus diperbarui (keputusannya berubah, bukan tesnya yang salah):
- `tests/test_trust_v143.cjs:61` memakai **Ruby** (sekarang C) dengan Trust di bawah 50 dan mengharapkan rivalry. Ganti ke NPC
  kategori A (misalnya Irene), dan tambahkan kasus Ruby yang ditahan.
- `tests/test_trust_v143.cjs:62-63` (romance Ruby Trust 40 ditolak) tetap benar.
- `tests/test_bonds_v122.cjs:70-75` memakai Trixie (C): tetap benar.

Kompatibilitas save (wajib tiap rilis): fixture 1.6.7 di `tests/fixtures/saves/` dengan satu bond Rank 8 romance dan satu Rank 8
bertitle rival → load di 1.6.8 tanpa kehilangan data, `$branch` terisi benar, `$eng.ver` naik.

Verifikasi headless seperti biasa: `npm test`, `npm run stress`, `node tests/token_audit.cjs`, build preset dua kali
(byte-identical). Preset tidak berubah (ini aturan card).

### 8. Catatan

- Tidak ada scripted bond event Rank 7 di `data/bond_events.json` (kosong), jadi tidak ada event yang bentrok.
- Cinta satu arah Etnie (C) dan Kanae (A) di `relations_curated.json` tetap sah: keduanya kategori yang bisa romance.
- Keputusan HANDOFF §4 yang disentuh: **Trust 1.4.3** (Rank 8 kini bisa menunggu, khusus C/D) dan **Bonds** (romance tidak
  lagi terbuka untuk semua NPC). Keduanya sudah disetujui ras di thread brainstorming 2026-09-26.
