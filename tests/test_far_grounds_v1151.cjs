// 1.15.1 (owner, 2026-09-29): formal events open and close with the Headmaster's and Vice Headmaster's speeches (every feast
// begins with them); the far grounds (Lake, Grassy Field and Hills, Forest) are far, and the lore states the computed walks.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const entry = uid => card.character_book.entries.find(e => e.id === uid).content;
const L = JSON.parse(read('data/locations.json'));

console.log('Speeches at formal events and feasts');
ok(/Every formal academy event opens with speeches from Headmaster Baelin and Vice Headmaster Althair.*every feast begins with their speeches/.test(entry(0)), 'World Index states the pattern');
ok(/Entrance Feast in the Ring Dining Hall: Headmaster Baelin and Vice Headmaster Althair speak again before dinner/.test(entry(21)), 'Entrance Feast: speeches before dinner (as in v38)');
for (const [uid, name] of [[96, 'Warding Rite'], [25, 'Founder Day'], [237, 'Results'], [248, 'Graduation']])
  ok(/Headmaster's and Vice Headmaster's speeches|Headmaster and Vice Headmaster speak/.test(entry(uid)) && !/Evening: feast/.test(entry(uid)), `${name}: the feast opens with their speeches`);
ok(/Headmaster and Vice Headmaster open it with speeches/.test(entry(237)), 'Results day assembly opens with speeches');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { EVENTS };')();
const feasts = E.EVENTS.filter(e => /feast/i.test(JSON.stringify(e.s || '')));
ok(feasts.length >= 6 && feasts.every(e => /Headmaster and Vice Headmaster/.test(JSON.stringify(e.s))), `every engine day plan with a feast names the speeches (${feasts.length})`);

// 1.15.2 (owner): Remembrance Day (with Acting Warden Rei) and the Crowning Day morning
ok(/Headmaster Baelin, Vice Headmaster Althair and Acting Warden Rei speak, then the lantern release/.test(entry(244)) && !/not asked to speak/.test(entry(244)), 'Remembrance Day: three speeches before the lanterns');
ok(/no patience for ceremonial speeches \(formal addresses only: she is not shy.*gives one at Remembrance Day.*because it is the Warden's duty/.test(entry(118)) && !/never asked to speak/.test(entry(118)), "Rei's file agrees");
ok(/Headmaster Baelin and Vice Headmaster Althair speak to the assembled academy, then everyone boards the airship/.test(entry(24)), 'Crowning Day: speeches before the airship');
const plan = t => JSON.stringify((E.EVENTS.find(e => e.t.startsWith(t)) || {}).s || '');
ok(/Acting Warden Rei, then the lantern release/.test(plan('Remembrance Day')) && /07:00 speeches from the Headmaster and Vice Headmaster.*flies to the capital/.test(plan('Independence Crowning Day')), 'engine day plans match');

console.log('Far grounds');
const map = entry(132);
ok(!/beside the boathouse/i.test(map + entry(78) + entry(268)) && /Fishing House \(three minutes along the shore from the boathouse\)/.test(map) && /three minutes' walk along the shore from the boathouse/.test(entry(268)), 'Fishing House: three minutes from the boathouse, never "beside"');
ok(!/beside the Mall/.test(entry(82) + entry(83)) && !/Beside the rings/.test(entry(52)), 'Medical Centre, Commissary and Sparring Pavilion give their walk');
const leg = (a, b) => (L[a].near.find(([o]) => o === b) || [])[1];
ok(leg('boathouse_and_lake', 'gardens') === 20 && leg('boathouse_and_lake', 'fishing_house') === 3 && leg('forest', 'forest_clearing') === 30, 'legs: Gardens-boathouse 20, boathouse-Fishing House 3, Forest-Clearing 30');
const FAR = ['boathouse_and_lake', 'fishing_house', 'willow_island', 'grassy_field_and_hills', 'observation_tower', 'old_hut', 'forest', 'forest_clearing'];
ok(FAR.every(id => L[id].walk_min >= 20 && L[id].near.every(([o]) => FAR.includes(o) || ['courtyards', 'gardens'].includes(o))), 'the far grounds are 20+ minutes out and reached only by their own paths');
// every "<place> N" in the Campus Map walking line matches the computed walk from the Main Courtyard
const line = /Ordinary walking estimates[^\n]*/.exec(map)[0];
const NAMES = { 'Grassy Field and Hills': 'grassy_field_and_hills', 'Observation Tower': 'observation_tower', 'Boathouse and Lake': 'boathouse_and_lake', 'Old Hut': 'old_hut',
  'Fishing House': 'fishing_house', 'Forest treeline': 'forest', 'Willow Island': 'willow_island', 'Forest Clearing': 'forest_clearing', 'Menagerie': 'menagerie', 'Sparring Pavilion': 'sparring_pavilion', 'Sports Field': 'sports_field' };
const bad = Object.entries(NAMES).filter(([n, id]) => { const m = new RegExp(n + ' ([0-9]+)').exec(line); return !m || +m[1] !== L[id].walk_min; });
ok(!bad.length, `the walking line states the computed times (${bad.map(([n]) => n).join(', ') || 'all match'})`);
ok(/far grounds \(the Lake, the Grassy Field and Hills, the Forest\) are wide open country, much farther than the map/.test(map) && /nothing out there is next door/.test(map), 'the Campus Map explains the far grounds');
