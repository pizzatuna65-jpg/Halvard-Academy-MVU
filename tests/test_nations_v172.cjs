// 1.7.2 (owner, approved 2026-09-27: planning/DRAFT_nations.md): five nations (Arslan Sultanate, Norvaine, Velmora, Caelmar,
// Yozakura) with the settings of Sunreach Bay, each with its own trade, woven into the entries that should know they exist, plus
// the WORLD INDEX, Kingdom and World Competition lines. Tilly's secret now has Velmora's bloody succession and her mother behind it;
// Tsubaki's and Rei's blades come from Yozakura; Kanae's crystal ball is Norvaine starglass. A 1.7.1 save loads.
const fs = require('fs'), path = require('path');
const { applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('Nations 1.7.2');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const E = card.character_book.entries, byId = uid => E.find(e => e.id === uid), txt = uid => byId(uid).content;
const strip = t => t.replace(/<narrator_only>[\s\S]*?<\/narrator_only>/g, '');
const NATIONS = { 278: 'Arslan Sultanate', 279: 'Norvaine', 333: 'Velmora', 334: 'Caelmar', 335: 'Yozakura' };
const sun = byId(246);

// ---- the five entries
for (const [uid, name] of Object.entries(NATIONS)) {
  const e = byId(Number(uid));
  ok(e && e.comment === '[mvu_plot] Nation — ' + name && e.content.startsWith('[' + name + ']'), `${name}: entry ${uid} exists, tagged [mvu_plot]`);
  ok(e.enabled && !e.constant && e.insertion_order === sun.insertion_order && e.position === sun.position && e.keys.includes(name),
    `${name}: keyword entry with Sunreach Bay's order and position`);
  ok(/\nStatus: /.test(e.content), `${name}: has a Status line`);
  const words = strip(e.content).split(/\s+/).length;
  // Norvaine carries the most approved canon (pact, export, Star Night, price, people): ~137 words, kept as approved.
  ok(words <= 140, `${name}: short, one entry's worth (${words} words)`);
}
ok(byId(278).keys.includes('Arslan') && !byId(273).keys.some(k => /Arslan/.test(k)), 'the Arslan keywords moved from the Devoured Kingdom to the nation');
ok(/World Bank/.test(txt(278)) && /starglass/.test(txt(279)) && /Export: the continent's workshop/.test(txt(334)) && /forge the katana/.test(txt(335)) && /court manners/.test(txt(333)),
  'each nation has its own trade (bank, starglass, workshop goods, katana, court manners)');
ok(/Yog-Sothoth, Lord of the Cosmos, a Spirit Lord/.test(txt(279)) && /Chosen of the Cosmos/.test(txt(279)) && !/\bSaint\b/.test(txt(279)), 'Norvaine: Yog-Sothoth, the Chosen of the Cosmos (no "Saint")');
ok(/remembers the rule, never the person/.test(txt(279)) && /each heir inherits it/.test(txt(279)), 'Norvaine: only the rule is remembered; the pact is hereditary');
ok(/mostly Beastkin/.test(txt(335)) && /titled Alpha/.test(txt(335)) && !byId(335).keys.includes('Alpha'), 'Yozakura: Beastkin, the Alpha tournament (no bare "Alpha" keyword)');
ok(/<narrator_only>Behind the manners, the succession is a blood sport/.test(txt(333)) && !/Tilly|Ottilie|princess|daughter/i.test(txt(333)), "Velmora: the bloody succession is secret, and nothing points at Tilly");

// ---- woven into other entries
const has = (uid, re, what) => ok(re.test(txt(uid)), `mention: ${what}`);
has(0, /Nations: Sunreach Bay \(resort, academy Trip destination\), the Arslan Sultanate \(money; the World Bank\), Norvaine .*Velmora .*Caelmar .*Yozakura/, 'WORLD INDEX lists every nation');
has(1, /Sunreach Bay, Velmora, the Arslan Sultanate, Norvaine, Caelmar and Yozakura are named/, 'Kingdom names every nation');
has(19, /Nations at the World Competition include Yozakura, Norvaine and Caelmar, the usual favourites, the Arslan Sultanate, Velmora and Sunreach Bay/, 'World Competition');
has(22, /Norvaine dreads/, 'Star Night: Norvaine');
has(28, /Velmoran court manners/, 'Etiquette: Velmora');
has(30, /Norvaine's army/, 'Combat Class: Norvaine');
has(55, /Caelmari-made/, 'Workshop: Caelmar');
has(66, /Yozakuran chain/, 'Mall: Yozakura');
has(81, /Norvaine starglass lens/, 'Observation Tower: Norvaine');
has(83, /Caelmari-made/, 'Commissary: Caelmar');
has(91, /Velmoran court manners/, "Noble Houses' Liaison: Velmora");
has(92, /World Bank of the Arslan Sultanate/, 'Banking House: Arslan');
has(219, /Caelmari-made/, 'Mana Grid: Caelmar');
has(231, /Yozakuran companies/, 'Airships: Yozakura');
has(246, /Half its hotels are Yozakuran/, 'Sunreach Bay: Yozakura');
has(248, /the World Bank \(Arslan Sultanate\)/, 'Graduation: Arslan');
for (const [uid, name] of Object.entries(NATIONS)) {
  const key = name === 'Arslan Sultanate' ? /Arslan|World Bank/ : new RegExp(name.slice(0, 7));
  const where = E.filter(e => e.id !== Number(uid) && key.test(e.content)).length;
  ok(where >= 4, `${name} is woven into ${where} other entries`);
}

// ---- NPC files
const npcs = JSON.parse(rd('data/npcs.json'));
const T = id => txt(npcs[id].uid_card);
ok(/<narrator_only>Identity: Princess Ottilie Seraphine of Velmora[^<]*the succession is a blood sport[^<]*Her mother, the king's concubine, sent her abroad[^<]*<\/narrator_only>/.test(T('Tilly')),
  "Tilly: her mother, the king's concubine, sent her; the blood-sport succession stays narrator_only");
ok(/<narrator_only>Backstory \(true\):[^<]*which of her half-siblings wants her dead[^<]*go to her mother/.test(T('Tilly')) && !/her father sent her/.test(T('Tilly')), 'Tilly: letters go to her mother; no trace of the old "father sent her"');
ok(!/blood sport|concubine/.test(strip(T('Tilly'))), "Tilly: nothing of it outside narrator_only");
ok(/katana forged in Yozakura, far to the south/.test(T('Tsubaki')) && !/far across the sea/.test(T('Tsubaki')), "Tsubaki's katana comes from Yozakura");
ok(/Weapon: A long single-edged katana forged in Yozakura\./.test(T('Rei')), "Rei's katana comes from Yozakura");
ok(/Her crystal ball is Norvaine starglass/.test(T('Kanae')), "Kanae's crystal ball is Norvaine starglass");
ok(!/far across the sea/.test(JSON.stringify(npcs.Tsubaki)), 'the UI data follows (Tsubaki)');

// ---- the UI shows no secrets
const loc = JSON.parse(rd('data/locations.json'));
ok(Object.values(loc).every(l => !/narrator_only|blood sport/.test(l.description || '')), 'location descriptions stay public');

// ---- the standalone lorebook carries the same entries
const v39 = JSON.parse(rd('dist/lorebook_v39/eldrasil_v39_Core.json')).entries;
ok(Object.keys(NATIONS).every(u => v39[u] && v39[u].comment === 'Nation — ' + NATIONS[u] && v39[u].content === txt(Number(u))), 'the v39 export has the same five nations');

// ---- a 1.7.1 save loads
const save = JSON.parse(rd('tests/fixtures/saves/save_1.7.1.json'));
const L = applyPatch(save, [{ op: 'replace', path: '/World/Time', value: '09:00' }]);
ok(L.$eng.ver === JSON.parse(rd('src/card/card.json')).character_version
  && Object.keys(save.Bonds).every(id => L.Bonds[id] && L.Bonds[id].Rank === save.Bonds[id].Rank && L.Bonds[id].Trust === save.Bonds[id].Trust)
  && L.Journal.length >= save.Journal.length, 'the 1.7.1 save loads with every bond, rank, Trust and the journal kept');
