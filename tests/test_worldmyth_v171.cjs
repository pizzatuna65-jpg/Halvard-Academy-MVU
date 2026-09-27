// 1.7.1 (owner, approved 2026-09-27: planning/DRAFT_world_myth.md): a new lore category, World Myth. Five continent-wide myths
// (uid 273-277) with the Superstition entries' settings, linked to each other, and a one-line mention in the entries that should
// know they exist (WORLD INDEX, Kingdom, Veyra, Magic Theory, History, Dark Magic Defense, Main Library, Cathedral, Spirit Tiers,
// the Morning Choir and Lucifer) and in five NPC files. Lucifer stays unnamed outside narrator_only text. A 1.7.0 save loads.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('World Myth 1.7.1');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const E = card.character_book.entries, byId = uid => E.find(e => e.id === uid);
const strip = t => t.replace(/<narrator_only>[\s\S]*?<\/narrator_only>/g, '');
const MYTHS = { 273: 'The Devoured Kingdom', 274: 'The Four Who Saved the World', 275: 'The First Bargain', 276: 'The Holy Grail', 277: 'The Shaping of the World' };
const sup = byId(222);

// ---- the five entries
for (const [uid, title] of Object.entries(MYTHS)) {
  const e = byId(Number(uid));
  ok(e && e.comment === '[mvu_plot] World Myth - ' + title && e.content.startsWith('[' + title + ']'), `${title}: entry ${uid} exists, tagged [mvu_plot]`);
  ok(e.enabled && !e.constant && e.insertion_order === sup.insertion_order && e.position === sup.position && e.keys.length >= 3,
    `${title}: keyword entry with the Superstition entries' order and position`);
  ok(['Story:', 'Told:', 'Lesson:', 'Status:'].every(l => e.content.includes('\n' + l)), `${title}: Story, Told, Lesson and Status lines`);
  const words = strip(e.content).split(/\s+/).length;
  ok(words <= 95, `${title}: short like the other folklore entries (${words} words)`);
}
const txt = uid => byId(uid).content;
// Lucifer is unknown outside the cult: never named in the public text, and not by his Lucifer-entry keywords either
ok(Object.keys(MYTHS).every(u => !/Lucifer|Morning Star|Father of Magic/.test(strip(txt(Number(u))))), 'Lucifer is named only inside narrator_only');
ok(/<narrator_only>What shone was Lucifer/.test(txt(275)) && /<narrator_only>The last line is the goddess wearing another's credit: Lucifer made magic/.test(txt(277)),
  'the First Bargain and the Shaping of the World tell the narrator the hidden truth');
ok(/Archmage from the east/.test(txt(274)) && !/\b(he|she|his|her)\b/.test(strip(txt(274)).replace(/each land calls its own hero/, '')), 'the Archmage has no name or gender in the myth');
ok(/Azathoth, Lord of All, greatest of Asmoday's spirits/.test(txt(273)) && /Primal Desert, where the Arslan Sultanate stands today/.test(txt(273)), 'the Devoured Kingdom: Azathoth and the Primal Desert (owner)');
ok(/nearly every mage since is born to one type/.test(txt(275)), 'the First Bargain leaves room for the rare dual type');
ok(/not Ashvale's Elixir/.test(txt(276)), 'the Holy Grail is kept apart from the Elixir');
ok(/first the spirits/.test(txt(277)) && /mortals were born from the soil/.test(txt(277)), 'the Shaping of the World: spirits first, mortals from the soil (owner)');
// links between the myths
ok(/First Bargain/.test(txt(273)) && /First Bargain/.test(txt(274)) && /First Bargain/.test(txt(276)) && /Asmoday fractured magic/.test(txt(275)),
  'the myths point at each other (the First Bargain is the hub)');

// ---- mentions in other entries, as the brands are mentioned
const has = (uid, re, what) => ok(re.test(txt(uid)), `mention: ${what}`);
has(0, /Kingdom: Eldrasil, in the east of the continent\./, 'WORLD INDEX places Eldrasil in the east');
has(0, /World myths, told across the continent, not history: the Devoured Kingdom \(Azathoth\), the Four Who Saved the World, the First Bargain/, 'WORLD INDEX lists the myths');
has(1, /Sunreach Bay, Velmora and the Arslan Sultanate are named/, 'Kingdom names the Arslan Sultanate');
has(1, /claims the Archmage of the Four Who Saved the World/, 'Kingdom claims the Archmage');
has(3, /hero's academy/, 'Veyra');
has(17, /The First Bargain is the folk answer/, 'Magic Theory');
has(27, /myth and record/, 'History');
has(32, /Pacting opens with the First Bargain/, 'Dark Magic Defense');
has(56, /book of world myths/, 'Main Library');
has(90, /Every service opens with the Shaping of the World/, 'Cathedral');
has(122, /Every pact-holder has heard the Devoured Kingdom/, 'Spirit Tiers');
has(93, /Tells the First Bargain as scripture/, 'Morning Choir');
has(94, /He was what shone in the First Bargain/, 'Lucifer');
const npcs = JSON.parse(rd('data/npcs.json'));
const NPC = { Layla: /Opens her first lecture with the Four Who Saved the World/, Percival: /Counts the King of Knights as a personal friend/,
  Tilly: /chapter on the Holy Grail/, Morgana: /Recites the Four Who Saved the World as family history/, Elion: /sword of the King of Knights/ };
for (const [id, re] of Object.entries(NPC)) ok(re.test(txt(npcs[id].uid_card)), `mention: ${id}'s file`);
ok(txt(npcs.Tilly.uid_card).split('\n').filter(l => /Holy Grail/.test(l)).every(l => !/Velmora|princess|Ottilie|narrator_only/i.test(l)), "Tilly's line touches nothing of her Velmora secret");
// the pact-holders carry no myth line (the owner's call: no reason for anyone to shun them)
ok(['Alyssa', 'Lucius'].every(id => !/Devoured Kingdom|Azathoth/.test(txt(npcs[id].uid_card))), 'Alyssa and Lucius carry no Devoured Kingdom line');

// ---- the UI never shows the secrets
const loc = JSON.parse(rd('data/locations.json'));
ok(!/narrator_only|Lucifer|Morning Choir/.test(loc.cathedral.description + loc.main_library.description), 'location descriptions stay public');

// ---- the standalone lorebook carries the same entries
const v39 = JSON.parse(rd('dist/lorebook_v39/eldrasil_v39_Core.json')).entries;
ok(Object.keys(MYTHS).every(u => v39[u] && v39[u].comment === 'World Myth - ' + MYTHS[u] && v39[u].content === txt(Number(u))), 'the v39 export has the same five myths');

// ---- a 1.7.0 save loads
const save = JSON.parse(rd('tests/fixtures/saves/save_1.7.0.json'));
const L = applyPatch(save, [{ op: 'replace', path: '/World/Time', value: '09:00' }]);
ok(L.$eng.ver === JSON.parse(rd('src/card/card.json')).character_version && L.$eng.ver === '1.7.1'
  && Object.keys(save.Bonds).every(id => L.Bonds[id] && L.Bonds[id].Rank === save.Bonds[id].Rank && L.Bonds[id].Trust === save.Bonds[id].Trust)
  && L.Journal.length >= save.Journal.length, 'the 1.7.0 save loads with every bond, rank, Trust and the journal kept');
ok(initState().$eng !== undefined, 'a new game still starts');
