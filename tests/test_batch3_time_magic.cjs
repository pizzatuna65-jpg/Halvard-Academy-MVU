// Playtest Batch 3: elapsed time, fast magical travel, campus casting, and club canon.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const rule502 = read('src/worldbook/custom/content/502.txt');
const rule504 = read('src/worldbook/custom/content/504.txt');
const gate = read('src/worldbook/custom/content/510.txt');
const map = read('src/worldbook/content/132.txt');
const index = read('src/worldbook/content/0.txt');
const clubs = read('src/worldbook/content/26.txt');
const combat = read('src/worldbook/content/30.txt');
console.log('Playtest Batch 3: time, movement and magic');
ok(/brief exchange can take seconds to about a minute/.test(rule502) && /same displayed minute/.test(rule502) && /sustained conversation several minutes/.test(rule502) && /large time skip needs an actual wait/.test(rule502), 'narrator distinguishes seconds, sustained talk and explicit skips');
ok(/Walks from here/.test(map) && /speed spell can shorten/.test(map) && /faster magic/.test(rule504) && /speed technique/.test(rule502) && /elapsed time matches/.test(gate), 'walking times come from <now> (1.99.5, audit T4); speed magic can shorten actual travel');
ok(/ordinary movement magic/.test(index) && /not for an ordinary safe spell/.test(index) && !/Ordinary safe magic is allowed/.test(rule504) && !/safe casting/.test(gate), 'ordinary casting is legal; Dove intervention has a real cause (1.99.4, audit T6: said once, in the WORLD INDEX)');
ok(/Magic Duelling Club/.test(clubs) && /spell duelling inside warded rings/.test(clubs) && /never swordplay, staves or fistfights/.test(clubs), 'club practises spell duelling in warded rings');
ok(/Spellcasting drills/.test(combat) && !/Norvaine/.test(combat), 'Combat Class remains magical without the Norvaine army line');
const loreDir = path.join(ROOT, 'src/worldbook/content');
const oldClub = fs.readdirSync(loreDir).filter(f => f.endsWith('.txt') && /(?<!Magic )Duelling Club/.test(fs.readFileSync(path.join(loreDir, f), 'utf8')));
ok(!oldClub.length, 'active lore has no old club name: ' + oldClub.join(', '));

let S = initState();
S.$ui.wxfx = 'off';
S = applyPatch(S, [
  { op: 'replace', path: '/Magic/_Techniques', value: { 'Lightning Step': { Type: 'Elemental', Subtype: 'Lightning', Effect: 'cross campus in a flash along a clear path', Cost_mode: 'per_use', Activation: 12 } } },
  { op: 'replace', path: '/Magic/_Affinity', value: { Types: ['Elemental'], Dominant: 'Elemental', Specialties: ['Lightning'], Preset: 'Gifted' } },
  { op: 'replace', path: '/Player/Vitals/Mana_max', value: 100 }, { op: 'replace', path: '/Player/Vitals/Mana', value: 100 },
  { op: 'replace', path: '/$ui/built', value: true }, { op: 'replace', path: '/$eng/auth', value: 'builder' },
]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '08:43' }, { op: 'replace', path: '/World/Location', value: 'Boathouse and Lake' }]);
const brief = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '08:43' }]);
ok(brief.World.Time === '08:43', '30-second exchange can remain in the same displayed minute');
const talk = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '08:53' }]);
ok(talk.World.Time === '08:53', 'ten-minute conversation advances ten minutes');
const walk = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '08:57' }, { op: 'replace', path: '/World/Location', value: 'Courtyards' }]);
ok(walk.World.Time === '08:57' && walk.World.Location === 'Courtyards', 'ordinary walk follows map-scale elapsed time');
const dash = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '08:44' }, { op: 'replace', path: '/World/Location', value: 'Arbiter Hall' }, { op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Lightning Step', Times: 1 } }]);
ok(dash.World.Time === '08:44' && dash.World.Location === 'The Arbiter Hall' && dash.Player.Vitals.Mana === 88.3,   // 1.9.4: 100 - 12 + one minute of passive regeneration
   `fast crossing takes one minute and charges mana once (${dash.Player.Vitals.Mana})`);
const backwards = applyPatch(dash, [{ op: 'replace', path: '/World/Time', value: '08:42' }]);
ok(backwards.World.Time === '08:44' && backwards._Log.some(x => /Time cannot move backwards/.test(x)), 'engine still rejects backwards time');
