// 1.14.0 (owner-approved planning/DRAFT_dynamic_lore.md): lore that follows the calendar. The card prints only the current
// season's line (calendar month) and phase lines only while they apply; the v39 export keeps every season line as plain text; the
// Map's location cards show the current season's line.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
console.log('Dynamic lore 1.14.0');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const entry = uid => card.character_book.entries.find(e => e.id === uid).content;
const R = (uid, W) => ejs.render(entry(uid), { getvar: k => _.get({ stat_data: { World: W } }, k) });
const at = (Month, Week = 2, Day = 'Mon', Time = '09:00') => ({ Year: 1, Month, Week, Day, Time });
const seasonLines = t => (t.match(/^In (spring|summer|autumn|winter): /gm) || []);

// every seasonal entry prints exactly its current season's line, never another season's
const SEASON = m => ['spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter', 'winter', 'winter'][m - 1];
const seasonal = card.character_book.entries.filter(e => /^In (spring|summer|autumn|winter): /m.test(e.content)).map(e => e.id);
ok(seasonal.length === 26, `26 entries carry season lines (${seasonal.length})`);
let bad = [];
for (const uid of seasonal) for (let m = 1; m <= 12; m++) {
  const L = seasonLines(R(uid, at(m))), want = new RegExp(`^In ${SEASON(m)}: `, 'm');
  const has = entry(uid).includes(`In ${SEASON(m)}: `);
  if (L.length !== (has ? 1 : 0) || (has && !want.test(R(uid, at(m))))) bad.push(`${uid}/M${m}`);
}
ok(!bad.length, `each entry, each month: only the current season's line (${bad.slice(0, 5).join(', ') || 'all fine'})`);
ok(/In winter: Hardly anyone climbs to the Old Hut/.test(R(263, at(11))) && !/Hardly anyone/.test(R(263, at(5))), 'the owner\'s example: the Old Hut in winter, and not in summer');
ok(/In autumn: The oak turns gold/.test(R(262, at(8))) && /In spring: The inner oak comes into new leaf/.test(R(262, at(2))), 'the Viridian oak follows the year');
ok(/In winter: The boats are stored/.test(R(78, at(12))), 'winter on the lake (owner [?1]: a boat only on a still, mild day)');

// phases
ok(/Firetooth tins and Star Cookies/.test(R(56, at(3, 1))) && !/Firetooth tins/.test(R(56, at(3, 2))), 'P1: the Library\'s exam-week tables only in exam weeks');
ok(/Every slot is booked/.test(R(59, at(2, 3))) && /Every slot is booked/.test(R(59, at(9, 1))) && !/Every slot is booked/.test(R(59, at(6, 2))), 'P2: Study Rooms full in the two weeks before exams and in exam week');
ok(/This exam morning a queue snakes/.test(R(47, at(11, 1, 'Tue', '08:00'))) && !/This exam morning/.test(R(47, at(11, 1, 'Tue', '15:00'))) && !/This exam morning/.test(R(47, at(11, 2, 'Tue', '08:00'))), 'P3: the Founder\'s Hand queue on exam mornings only');
ok(!/snakes across the lawn on exam mornings/.test(entry(47)) && /superstition\. Focus of Academy Founder Day/.test(R(47, at(1))), 'P3: the always-on sentence moved into the phase line, the rest reads cleanly');
ok(/parcels going home/.test(R(70, at(5, 3))) && /parcels going home/.test(R(70, at(11, 4))) && !/parcels going home/.test(R(70, at(5, 2))), 'P4: the Mail Tower before the long breaks');

// v39 keeps all the season lines as plain text and its old exam wording
const v39 = JSON.parse(rd('dist/lorebook_v39/eldrasil_v39_Core.json')).entries;
const oldHut = Object.values(v39).find(e => /^\[Old Hut\]/.test(e.content)), park = Object.values(v39).find(e => /^\[Founder's Park\]/.test(e.content));
ok(/\nIn winter: Hardly anyone/.test(oldHut.content) && !/<%/.test(oldHut.content), 'v39: plain season lines, no EJS');
ok(/snakes across the lawn on exam mornings/.test(park.content) && (park.content.match(/^In (spring|summer|autumn|winter): /gm) || []).length === 4, 'v39: the park keeps its exam sentence and all four seasons');

// UI: the location card shows the current season's line; data/locations.json keeps the vibe clean
const L = JSON.parse(rd('data/locations.json'));
ok(Object.values(L).filter(l => l.seasons && Object.keys(l.seasons).length).length === 26 && L.old_hut.vibe === 'weathered wood, wind through gaps, grass and pine.', 'locations.json: 26 places with seasons, vibe untouched');
ok(!/In (spring|summer|autumn|winter):/.test(L.old_hut.description), 'the description no longer carries the season lines');
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { PANELS, view };')();
let S = initState(); S.World.Month = 11; S.World.Location = 'Old Hut'; S.$ui.discovered = ['Old Hut'];
U.view.panel = 'map'; U.view.pin = null;
const html = U.PANELS.map.render(S);
ok(/class="sub season"><b>Winter:<\/b> Hardly anyone climbs/.test(html), 'the Old Hut card shows its winter line in Month 11');
S.World.Month = 5;
ok(!/Hardly anyone climbs/.test(U.PANELS.map.render(S)), 'and not in Month 5');
