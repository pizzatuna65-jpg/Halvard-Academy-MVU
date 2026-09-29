// Writes a save fixture: a state after ~6 weeks of ordinary play, made by the CURRENT build (schema, engine, Builder).
// Every release adds the previous release's save (run this on the previous release's code before changing anything);
// tests/test_saves.cjs then loads every fixture with the new build and checks nothing was lost (owner: one chat across versions).
// Usage: node tests/fixtures/make_save.cjs   -> tests/fixtures/saves/save_<character_version>.json
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ROOT } = require('../harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { TEMPLATES, blankDraft, buildOps };')();
const ver = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/card/card.json'), 'utf8')).character_version;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FRIENDS = ['Etnie', 'Irene', 'Castor', 'Kanae', 'Zara', 'Aiden', 'Rei', 'Caine'];
let S = initState();
const d = Object.assign(U.blankDraft(), U.TEMPLATES.find(t => t.id === 'spirit').make()); d.name = 'Aria Vale';
S = applyPatch(S, U.buildOps(d, S), { mvu: true });
S = applyPatch(S, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Viridian' }]);
const at = (w, ops, text) => { S = applyPatch(S, [...Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...ops], { text: text || '' }); };
for (let day = 0; day < 42; day++) {
  const W = { Month: Math.floor(day / 28) + 1, Week: Math.floor((day % 28) / 7) + 1, Day: DAYS[day % 7] };
  const who = FRIENDS.filter((_, i) => (day + i) % 3 === 0).slice(0, 3), present = Object.fromEntries(who.map(w => [w, { Note: 'talking' }]));
  const ops = [{ op: 'replace', path: '/Scene/Present', value: present },
    ...who.flatMap(w => [{ op: 'insert', path: '/Interactions/-', value: { With: w, Kind: 'talk', Note: `talked with ${w} on day ${day}` } },
      { op: 'insert', path: '/Interactions/-', value: { With: w, Kind: 'hangout', Note: `spent the afternoon with ${w}` } }])];
  if (day % 5 === 0) ops.push({ op: 'insert', path: '/Rep_events/-', value: { Rep: 'Student', XP: 2, Kind: 'repeat', Why: 'helped out' } });
  if (day % 6 === 1) ops.push({ op: 'insert', path: '/Training/-', value: { Track: 'mana' } });
  if (day === 3) ops.push({ op: 'replace', path: '/Commitments/Herbology essay', value: { Desc: 'two pages', Due: 'M2 W2 Mon 09:00', With: '', Where: '', Type: 'assignment' } },
    { op: 'replace', path: '/Campus_State/Events/Library flood', value: 'The west wing of the Main Library is closed after a burst pipe.' },
    { op: 'replace', path: '/Clues/Wet footprints', value: { Text: 'wet footprints outside the Archive at night', Thread: '' } },
    { op: 'replace', path: '/Inventory/Sunfizz', value: { Qty: 2, Note: '' } });
  at({ ...W, Time: '16:30', Location: ['Canteen', 'Main Library', 'Courtyards', 'Boathouse'][day % 4] }, ops);
  const ready = who.filter(w => S.Bonds[w] && S.Bonds[w]._Event_ready);
  at({ ...W, Time: '18:00' }, ready.map(w => ({ op: 'replace', path: `/Bonds/${w}/Rank`, value: S.Bonds[w].Rank + 1 })));
  at({ ...W, Time: '22:00', Location: 'Viridian Dormitory' }, [{ op: 'replace', path: '/Scene/Present', value: {} }, { op: 'insert', path: '/Journal/-', value: `[M${W.Month} W${W.Week} ${W.Day}] day ${day}` }]);
}
const out = path.join(__dirname, 'saves', `save_${ver}.json`);
fs.writeFileSync(out, JSON.stringify(S, null, 1) + '\n');
console.log('wrote', path.relative(ROOT, out), JSON.stringify(S).length, 'bytes; ranks', Object.fromEntries(Object.entries(S.Bonds).map(([k, b]) => [k, b.Rank])));
