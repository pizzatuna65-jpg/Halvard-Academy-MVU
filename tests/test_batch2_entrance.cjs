// Batch 2: entrance order, cohort knowledge and a stable roster-first tour trio.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const entry = id => card.character_book.entries.find(e => e.id === id).content;
const render = (id, S) => renderEntry(card, id, S);   // 1.48.0: the Cast Sheet is a group
const npcs = JSON.parse(read('data/npcs.json'));
const yearOf = (id, Y) => npcs[id].year + Y - (npcs[id].arrives || 1);
const world = (S, Time, more = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: Time }, ...more]);

console.log('Batch 2 entrance');
let Y1 = initState();
let tour = Y1.Campus_State.Entrance_tour;
ok(tour.Year === 1 && tour.Guide in npcs && yearOf(tour.Guide, 1) >= 2 && tour.FirstYears.length === 1
  && tour.FirstYears[0] in npcs && yearOf(tour.FirstYears[0], 1) === 1, 'Year 1: roster senior guides {{user}} and one roster first-year');
const e21 = render(21, Y1), p = Y1.World._Event_today;
ok(e21.indexOf('Headmaster Baelin and Vice Headmaster Althair') < e21.indexOf('The first-years then touch')
  && e21.indexOf('Student Council member gives') < e21.indexOf('remain in the hall until everyone is sorted at 10:00')
  && e21.indexOf('10:00-18:00 Tour') < e21.indexOf('19:00 Entrance Feast'), 'lore: speeches, Stone, Council vest, seating, tour, feast in order');
ok(p.indexOf('09:00 Headmaster and Vice Headmaster speeches') < p.indexOf('10:00–18:00 assigned tour groups')
  && p.indexOf('10:00–18:00 assigned tour groups') < p.indexOf('19:00 Entrance Feast')
  && !/speak before dinner/.test(p), 'engine schedule matches lore; speeches are before sorting');
ok(/Before sorting: the new first-years have not been assigned dorms/.test(render(505, Y1)), '<now> treats 07:30 newcomers as unsorted');
let at9 = world(Y1, '09:30');
ok(/Ceremony now: speeches before sorting/.test(render(505, at9)) && /remains in the hall after their turn/.test(render(505, at9)), '09:30: vest/seating and no free interval');
let at10 = world(at9, '10:30');
ok(/Tour now: use that exact trio/.test(render(505, at10)) && _.isEqual(at10.Campus_State.Entrance_tour, tour), '10:30: the same trio tours together');
const hijack = world(at10, '11:00', [{ op: 'replace', path: '/Campus_State/Entrance_tour', value: { Year: 1, Guide: 'Somebody New', FirstYears: ['Invented Student'] } }]);
ok(_.isEqual(hijack.Campus_State.Entrance_tour, tour), 'an unrequested narrator rewrite cannot replace the assigned trio');

const peer = tour.FirstYears[0];
const present = world(Y1, '08:00', [{ op: 'replace', path: '/Scene/Present', value: { [peer]: { Note: 'waiting for sorting' } } }]);
const cast = render(509, present), roster = render(97, present);
ok(/Entrance-day newcomer: the listed dorm and any vest in later-life lore are eventual facts/.test(cast), 'a present Year 1 peer has a pre-sort cast warning');
ok(/Before each student's own sorting, their listed dorm is future narrator information only/.test(roster), 'the roster flags eventual dorms as narrator-only information');

let Y2 = applyPatch(Y1, [{ op: 'replace', path: '/World/Year', value: 2 }, { op: 'replace', path: '/Player/Profile/Year', value: 2 }]);
tour = Y2.Campus_State.Entrance_tour;
const cohort2 = new Set(JSON.parse(read('data/cohorts.json')).incoming['2']);
ok(tour.Year === 2 && tour.Guide === '{{user}}' && tour.FirstYears.length === 2
  && tour.FirstYears.every(id => cohort2.has(id)), 'Year 2: {{user}} guides exactly two roster arrivals from the new cohort');
ok(/two assigned new first-years/.test(render(21, Y2)) && /watches the speeches and sorting from the gallery/.test(render(21, Y2)), 'returning player watches, does not sort again');
ok(/watches from the gallery, never sorting again/.test(render(505, world(Y2, '09:30'))), 'Year 2 ceremony cue does not give {{user}} another Stone turn');
const y2Peer = tour.FirstYears[0];
Y2 = world(Y2, '08:00', [{ op: 'replace', path: '/Scene/Present', value: { [y2Peer]: { Note: 'waiting for sorting' } } }]);
ok(/Entrance-day newcomer: the listed dorm/.test(render(509, Y2)), 'Year 2 cohort receives the same newcomer warning');

const absent = [...cohort2].slice(0, 5);
const Y2short = applyPatch(Y1, [
  { op: 'replace', path: '/World/Year', value: 2 }, { op: 'replace', path: '/Player/Profile/Year', value: 2 },
  { op: 'replace', path: '/Campus_State/NPC_status', value: Object.fromEntries(absent.map(id => [id, 'away from campus'])) },
]);
ok(Y2short.Campus_State.Entrance_tour.FirstYears.length === 1 && !absent.includes(Y2short.Campus_State.Entrance_tour.FirstYears[0]), 'unavailable roster arrivals are excluded; only a vacant place can be invented');
