// 1.97.2 (owner-approved planning/DRAFT_world_competition.md §2-§4 and planning/DRAFT_demon_kingdom.md, "proceed" 2026-10-22):
// the World Competition's six nations and format in lore 19, the Demon Kingdom retcon, five foreign team entries and six standout
// NPCs (group "World teams": no bond, abroad, outside the Kingdom Competition's rivals), their year gates, the names they took out
// of the name pool, and their portraits at the new assets pin.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT, loreOf } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data, RAW = card.character_book.entries;
const E = RAW.map(e => ({ ...e, content: loreOf(e.content) })), byId = uid => E.find(e => e.id === uid), txt = uid => byId(uid).content;
const npcs = JSON.parse(rd('data/npcs.json'));
const WORLD = ['Hibiki', 'Vesna', 'Kazimir', 'Lucrezia', 'Kamran', 'Cyprien'];
const NOBOND = WORLD.filter(id => id !== 'Vesna');   // 1.97.5: Vesna is a bonded Halvard roster student who plays for Norvaine until her transfer
const at = Y => { const S = initState(); S.World.Year = Y; return S; };
const render = (uid, S) => ejs.render(RAW.find(e => e.id === uid).content, { getvar: k => require('lodash').get({ stat_data: S }, k) });

console.log('World and history');
ok(/^\[The Demon Kingdom\]/.test(txt(382)) && byId(382).keys.includes('Demon Kingdom') && /stalemate/.test(txt(382)) && /Halvard stands on one of them/.test(txt(382)),
  '382: the Demon Kingdom (the last open Gate, the stalemate, Halvard on a sealed Gate)');
ok(/crowned\s+himself the Demon King/.test(txt(275)) && /first bargain, and his favourite/.test(txt(275)) && /slew the Demon King/.test(txt(274)),
  'the First Bargain made the Demon King; the Four slew him and could not close his Gate');
ok(/one of the old Gates to the demon world, sealed by the Archmage/.test(txt(5)) && /a sealed Gate to the demon world/.test(txt(0)) && /is history, not myth/.test(txt(0)),
  'Halvard stands on a sealed Gate; the World Index calls the Demon Kingdom history');
ok(/held by the Demon King's demons/.test(txt(1)) && /freed from demon rule/.test(txt(24)) && /the Gates, the demons' rule over Eldrasil, the Demon Kingdom/.test(txt(27)),
  'Eldrasil, Crowning Day and History Class carry the new history');
ok(/\nWar: Norvaine borders the Demon Kingdom/.test(txt(279)) && /\nCulture: Slavic/.test(txt(279)) && /Koschei's Needle/.test(txt(279)) && /\nCompetitions: /.test(txt(334)),
  'Norvaine: the demon front, its culture, Koschei\'s Needle (secret); Caelmar: its competitions');

console.log('The World Competition (lore 19)');
ok(/Month 11 Week 3 Monday to Week 4 Monday/.test(txt(19)) && /Six nations compete/.test(txt(19)) && /Phase 1 \(two days/.test(txt(19)) && /Phase 2 \(two days/.test(txt(19))
  && /10,000 points/.test(txt(19)) && /for how they fight together/.test(txt(19)), 'dates, six nations, both phases, the prize, the synergy rule');
ok(/\nWorld Competition: also coaches Eldrasil's national four/.test(txt(109)) && /\nCaelmar: she knows the Altamura name/.test(txt(125)), 'Gavlan coaches abroad; Vera knows the Altamura');

console.log('Teams and NPCs');
const TEAMS = { 383: 'Yozakura', 384: 'Norvaine', 385: 'Caelmar', 386: 'Arslan', 387: 'Velmora' };
for (const [uid, n] of Object.entries(TEAMS)) ok(byId(+uid) && txt(+uid).startsWith(`[${n} team]`) && /\nTeam: /.test(txt(+uid)) && /\nCoach: /.test(txt(+uid)) && /\nPlays: /.test(txt(+uid)), `${uid}: the ${n} team (Team, Coach, Plays)`);
ok(NOBOND.every(id => npcs[id] && npcs[id].group === 'World teams') && WORLD.every(id => npcs[id].portrait === `portraits/${id.toLowerCase()}.webp`), 'five NPCs in group "World teams" (Vesna a Halvard roster student since 1.97.5), each of the six with a portrait');
ok(npcs.Vesna.group === 'Year 1' && npcs.Vesna.transfer === 'Norvaine', 'Vesna: a Halvard student (lorebook Year 1) transferring from Norvaine (test_vesna_v1975)');
ok(['Hibiki', 'Lucrezia', 'Kamran', 'Cyprien'].every(id => npcs[id].academy !== 'Halvard') && npcs.Kazimir.academy === 'Norvaine' && npcs.Vesna.year === 1 && npcs.Cyprien.year === 3,
  'nation, school year (Vesna Y1, Cyprien Y3)');
const eng = rd('src/scripts/engine.js');
ok(NOBOND.every(id => new RegExp(`"${id}":"rival"`).test(eng)) && /"Vesna":"student"/.test(eng), 'the engine groups them with the rivals: no bond, never on Halvard\'s grounds (Vesna: a student)');
const ef = JSON.parse(rd('data/event_frame.json'));
ok(!/Hibiki|Lucrezia|Kamran|Cyprien|Vesna/.test(JSON.stringify(ef.kingdom)) && !/"Hibiki"|"Vesna"/.test(eng.match(/rivals:\{[^}]*\}/) ? eng.match(/rivals:\{[^}]*\}/)[0] : ''),
  'not in the Kingdom Competition');
const tension = JSON.parse(rd('data/tension.json'));
ok(NOBOND.every(id => !tension.npcs[id]) && tension.npcs.Vesna, 'no bond data needed (no tension category); Vesna has hers');

console.log('Year gates');
ok(/Graduated and off the team: Hibiki Kurenai, Nanami Oribe, Sora Kanzaki/.test(render(383, at(3))) && /The nation fields new members/.test(render(383, at(3))),
  'Year 3: Yozakura\'s graduates leave the team, and the nation fields new members');
ok(/Now: graduated from a Velmoran academy at the end of campaign Year 1/.test(render(393, at(2))) && !/Now: graduated/.test(render(393, at(1))), 'Cyprien graduates after campaign Year 1');
ok(/Second year/.test(render(389, at(2))) && /age 19/.test(render(389, at(2))), 'Vesna moves up a year in Year 2');

console.log('Names and assets');
const pool = JSON.parse(rd('data/name_pool.json'));
ok(['Corentin', 'Domenico', 'Solenne', 'Ysabeau'].every(n => !pool.m.includes(n) && !pool.f.includes(n)) && ['Conti', 'Delaunay', 'Lemoine', 'Marchand'].every(n => !pool.surname.includes(n)),
  'the names the World teams wear left the name pool');
const man = JSON.parse(rd('data/assets_manifest.json'));
ok(/eldrasil-assets@4d229ce5/.test(man.base_url) && WORLD.every(id => man.npcs[id] && man.npcs[id].thumb === `thumbs/${id.toLowerCase()}.webp`), 'assets pinned to 4d229ce, with the six portraits and thumbnails');
