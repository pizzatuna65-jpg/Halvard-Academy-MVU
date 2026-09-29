// 1.7.3 (owner, approved 2026-09-27: planning/DRAFT_npc_origins.md): two NPCs gain an origin in the new nations. Idris was born in
// the Arslan Sultanate and Vera in Caelmar; both families settled in Eldrasil when they were twelve. A 1.7.2 save loads.
const fs = require('fs'), path = require('path');
const { applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('NPC origins 1.7.3');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const npcs = JSON.parse(rd('data/npcs.json'));
const T = id => card.character_book.entries.find(e => e.id === npcs[id].uid_card).content;
ok(/Backstory: Born in the Arslan Sultanate to a family of fur traders, who moved to Eldrasil when he was twelve/.test(T('Idris')) && /sent to Halvard at 18, as every gifted child is/.test(T('Idris')),
  'Idris: born in the Arslan Sultanate, in Eldrasil from twelve, sent to Halvard at 18');
ok(/kept a shop on one of its middle layers, where Vera was born, before settling in a mid-sized town in Eldrasil when she was twelve/.test(T('Vera')), 'Vera: born in Caelmar, in Eldrasil from twelve');
ok(/Arslan Sultanate/.test(JSON.stringify(npcs.Idris)) && /Caelmar/.test(JSON.stringify(npcs.Vera)), 'the UI data follows');
const save = JSON.parse(rd('tests/fixtures/saves/save_1.7.2.json'));
const L = applyPatch(save, [{ op: 'replace', path: '/World/Time', value: '09:00' }]);
ok(L.$eng.ver === JSON.parse(rd('src/card/card.json')).character_version
  && Object.keys(save.Bonds).every(id => L.Bonds[id] && L.Bonds[id].Rank === save.Bonds[id].Rank && L.Bonds[id].Trust === save.Bonds[id].Trust)
  && L.Journal.length >= save.Journal.length, 'the 1.7.2 save loads with every bond, rank, Trust and the journal kept');
