// 1.76.0 (owner-approved planning/DRAFT_sebaran_club.md): the roster spread wider over the clubs. Lenna in the Archery Club, Dorian
// advising the Calligraphy Club, the Walking Club become the Camping Club (Faye, Nature); a save in the Walking Club moves with it.
// tools/merge_lorebooks.py club_spread, data/club_stats.json, data/npc_routines.json, engine canonClub / stepMigrate.
const fs = require('fs'), path = require('path');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const op = (p, value) => ({ op: 'replace', path: p, value });
const E = fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8');
// a constant the generator wrote on one line: "const NAME = {json};" (an end-of-line comment aside)
const data = name => JSON.parse(E.split(/\r?\n/).find(l => l.startsWith(`const ${name} = {`)).replace(`const ${name} = `, '').replace(/;\s*(\/\/.*)?$/, ''));
const MEM = data('CLUB_MEMBERS'), FOUND = data('CLUB_FOUNDING'), CLUBS = data('CLASS').clubs;

console.log('The spread');
ok(MEM['Archery Club'].join() === 'Lenna' && !MEM['Beast Handling Club'].length && FOUND.staff.Vallie === 'Beast Handling Club', 'Lenna shoots in the Archery Club; Beast Handling keeps Vallie');
ok(FOUND.staff.Dorian === 'Calligraphy Club' && MEM['Specialized Magic Club'].join() === 'Hadrian', 'Dorian advises the Calligraphy Club; Specialized Magic keeps Hadrian');
ok(!('Walking Club' in CLUBS) && MEM['Camping Club'].join() === 'Faye' && CLUBS['Camping Club'].includes('grassy field and hills'), 'the Camping Club meets on the Hills, Faye in it; no Walking Club');
const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/npcs.json'), 'utf8')), field = (id, l) => (npcs[id].fields.find(f => f.label === l) || {}).text || '';
ok(/^Archery Club\./.test(field('Lenna', 'Club')) && /Archery Range/.test(field('Lenna', 'Haunts')) && /advises the Calligraphy Club/.test(field('Dorian', 'Role'))
  && /^Camping Club/.test(field('Faye', 'Club')) && npcs.Faye.public_tags.includes('Camping Club'), 'the lore says so (Lenna, Dorian, Faye)');
const lore = id => fs.readFileSync(path.join(ROOT, `src/worldbook/content/${id}.txt`), 'utf8');
ok(/Camping – Hills/.test(lore(26)) && /the Camping Club pitches on the lower slope after dusk/.test(lore(339)), 'the club venues (the Clubs entry since 1.99.5, audit T4) and the Walking Lantern');

console.log('In play');
let S = initState();
S = applyPatch(S, [op('/World/Month', 2), op('/World/Day', 'Sat'), op('/World/Time', '13:00'), op('/World/Location', 'Grassy Field and Hills'),
  op('/Player/Profile/Dorm', 'Fire'), op('/Player/Profile/Club', 'Walking Club')]);
ok(S.Player.Profile.Club === 'Camping Club' && !S.Campus_State.Founded_club.Name, '"Walking Club" is the Camping Club, never a club to found');
const n0 = S.$eng.prof.xp.Nature;
S = applyPatch(S, [op('/World/Time', '15:30')]);
ok(S.$eng.prof.xp.Nature - n0 === 1, 'Saturday at the Camping Club trains Nature');
let M = initState();
M.Player.Profile.Club = 'Walking Club'; M.$eng.ver = '1.75.0';
M = Schema.parse(M); runEngine(M); M = Schema.parse(M);
ok(M.Player.Profile.Club === 'Camping Club' && !M.Campus_State.Founded_club.Name, 'a 1.75.0 save in the Walking Club is in the Camping Club');
