// 1.7.5 (owner, 2026-09-27): (1) from {{user}}'s second year the Entrance Event entry and the day plan make {{user}} one of the seniors
// who take a group of new first-years round the campus; (2) a TEST card (dist/test/Eldrasil_TEST_Year2) starts the campaign in Year 2
// with bonds of different ranks from Year 1 and none with the new first-years. A 1.7.4 save loads.
const fs = require('fs'), path = require('path'), ejs = require('ejs'), YAML = require('yaml');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('Year 2 start 1.7.5');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ver = JSON.parse(rd('src/card/card.json')).character_version;
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const R = (c, uid, S) => ejs.render(c.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const W = (S, w, ops = []) => applyPatch(S, [...Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...ops]);
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { TEMPLATES, blankDraft, buildOps };')();

// ---- (1) the Entrance Event as a senior
const Y1 = initState();
ok(!/one of the seniors/.test(R(card, 21, Y1)) && /one of the seniors/.test(R(card, 21, _.merge(_.cloneDeep(Y1), { Player: { Profile: { Year: 2 } } }))), 'lore 21: the senior section only from {{user}}\'s Year 2');
const e21 = R(card, 21, _.merge(_.cloneDeep(Y1), { Player: { Profile: { Year: 3 } } }));
ok(/a returning Year 3 student: sorted in their first year and never sorted again/.test(e21) && /a group of four new first-years to take round the whole campus until 18:00/.test(e21) && /shows them their rooms/.test(e21), 'lore 21 in Year 3: never sorted again, guides four first-years, shows them their rooms');
const v39 = JSON.parse(rd('dist/lorebook_v39/eldrasil_v39_Core.json')).entries;
ok(Object.values(v39).some(e => /From \{\{user\}\}'s second year: \{\{user\}\} is a returning student/.test(e.content) && !/<%/.test(e.content)), 'the v39 export has the plain line');
let S = W(W(Y1, { Month: 12, Week: 4, Day: 'Sun', Time: '20:00' }), { Year: 2, Month: 1, Week: 1, Day: 'Mon', Time: '08:00' });
ok(/one of the seniors today: never sorted again; watches the 09:00 sorting, then takes a group of four new first-years round the campus/.test(S.World._Event_today), '_Event_today in Year 2: {{user}} is a senior guide');
ok(!/seniors today/.test(W(Y1, { Time: '08:00' }).World._Event_today), 'Year 1: the plan as before');

// ---- (2) the Year 2 TEST card
const tc = JSON.parse(rd('dist/test/Eldrasil_TEST_Year2.json')).data;
ok(tc.name === 'Eldrasil — TEST Year 2' && tc.character_book.name === tc.name && tc.extensions.world === tc.name && tc.character_book.name !== card.character_book.name, 'its own name and lorebook name');
const raw = YAML.parse(tc.character_book.entries.find(e => e.id === 500).content.replace('@@VERSION@@', ver));
let T = Schema.parse(raw); runEngine(T, undefined); T = Schema.parse(T);
ok(T.World.Year === 2 && T.World.Month === 1 && T.World.Week === 1 && T.World.Day === 'Mon' && T.Player.Profile.Year === 2 && T.Player.Profile.Age === 19, 'starts at Year 2 M1 W1 Mon, {{user}} a 19-year-old second-year');
const ranks = Object.values(T.Bonds).map(b => b.Rank);
ok(Object.keys(T.Bonds).length >= 15 && new Set(ranks).size >= 5 && Math.min(...ranks) === 1 && Math.max(...ranks) >= 6, `bonds of varied ranks (${[...new Set(ranks)].sort().join(', ')})`);
ok(Object.values(T.Bonds).some(b => b.Tension >= 40) && Object.values(T.Bonds).some(b => b.Trust >= 80) && Object.values(T.Bonds).some(b => b.Trust <= 35), 'and varied Trust and Tension');
const NEW = JSON.parse(rd('data/cohorts.json')).incoming['2'], npcs = JSON.parse(rd('data/npcs.json'));
ok(!NEW.some(id => T.Bonds[id]) && Object.keys(T.Bonds).every(id => npcs[id] && (npcs[id].arrives || 1) === 1 && !/team$/.test(npcs[id].group || '')), 'no bond with a new first-year or a rival team member');
ok(Object.values(T._Perks).filter(p => p.Kind === 'gift').map(p => p.From).sort().join() === Object.keys(T.Bonds).filter(id => T.Bonds[id].Rank >= 5 && JSON.parse(rd('data/bond_rewards.json')).npcs[id]).sort().join(), 'every Rank 5+ bond has its Rank 5 gift already');
ok(T.Journal[0] === '[Y1 M1 W1 Mon] Arrived at Halvard Academy as a first-year.' && /^\[Y2 M1 W1 Mon\]/.test(T.Journal.slice(-1)[0]), 'the Journal has Year 1 lines dated Y1');
// the first updates: the Builder, then play
const d = Object.assign(U.blankDraft(), U.TEMPLATES.find(t => t.id === 'spirit').make()); d.name = 'Aria Vale';
T = applyPatch(T, U.buildOps(d, T), { mvu: true });
ok(T.Magic._Affinity.Dominant === 'Occult' && T.Player.Profile.Dorm === 'Sky' && T._Log.some(l => /sorted them in their first year: Sky Dormitory/.test(l)) && T.Journal.some(l => /Of the Sky Dormitory since the first-year sorting/.test(l)), 'after the Builder the dorm follows the dominant type (Occult -> Sky), sorted in Year 1');
ok(['Caspian', 'Gareth', 'Irene', 'Royhan', 'Ruby', 'Sophia'].every(x => T.Campus_State.Graduated.includes(x)) && !T.Campus_State.Graduated.includes('Etnie'), "the engine sends Year 1's third-years away on the first update; Etnie stays");
ok(T.Journal.some(l => /A new class of first-years arrived at Halvard for the Year 2 Entrance Event/.test(l)) && T.Bonds.Gareth.Rank === 5 && T.Bonds.Etnie.Rank === 6, 'the new first-years are journaled; the bonds are kept (a graduate too)');
T = W(T, { Time: '10:30', Location: 'Main Courtyard' }, [{ op: 'replace', path: '/Scene/Present', value: { Linus: { Note: 'in the tour group' }, Etnie: { Note: '' } } }]);
ok(T.Bonds.Linus && T.Bonds.Linus.Rank === 0 && T.Bonds.Etnie.Rank === 6 && /one of the seniors today/.test(T.World._Event_today), 'meeting a new first-year starts a fresh bond at Rank 0');
ok(!/Graduated|Former student/.test(R(tc, 509, T).match(/\[Etnie\][^\n]*\n[^\n]*/)[0]) && /Year 3 student/.test(R(tc, 509, T)), "Etnie's sheet: a Year 3 student (repeating), not a graduate");
const Ss = W(Y1, { Time: '09:00' }, [{ op: 'replace', path: '/Player/Profile/Year', value: 1 }]);
ok(Ss.Player.Profile.Dorm === 'Unsorted', 'a first-year is still sorted by the story at the Entrance Event');

// ---- a 1.7.4 save loads
const old = JSON.parse(rd('tests/fixtures/saves/save_1.7.4.json'));
const L = W(old, { Time: '23:00' });
ok(L.$eng.ver === ver && Object.keys(old.Bonds).every(id => L.Bonds[id].Rank === old.Bonds[id].Rank && L.Bonds[id].Trust === old.Bonds[id].Trust), 'the 1.7.4 save loads with every bond kept');
