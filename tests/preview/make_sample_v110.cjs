// v1.1.0 preview sample: weather Full with a condition, the Bag, hooks, rumours, one feature off. Writes tests/preview/sample_v110.json
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ROOT } = require('../harness.cjs');
let S = applyPatch(initState(), [{ op: 'replace', path: '/$eng/seed', value: 424242 }]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Month', value: 3 }, { op: 'replace', path: '/World/Week', value: 2 }, { op: 'replace', path: '/World/Day', value: 'Mon' },
  { op: 'replace', path: '/World/Time', value: '09:00' }, { op: 'replace', path: '/World/Location', value: 'Lecture Halls' },
  { op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' },
  { op: 'insert', path: '/Inventory/Star Cookie', value: { Qty: 2, Kind: 'food', Plan: 'tonight' } }, { op: 'insert', path: '/Inventory/Umbrella', value: { Qty: 1, Kind: 'gear' } },
  { op: 'insert', path: '/Inventory/Sunfizz', value: { Qty: 1, Kind: 'drink' } },
  { op: 'insert', path: '/Hooks/Irene returns', value: { Note: 'back at noon with the ledger', Who: 'Irene', Kind: 'promise', Weight: 2, Due: 'today 12:00' } },
  { op: 'replace', path: '/Campus_State/Rumours', value: ['Someone saw a light in the Bell Tower', 'Sophia broke a training dummy in one blow'] },
  { op: 'insert', path: '/Player/Conditions/Soaked', value: { Effect: 'Wet through', Since: 'M3 W2 Mon 08:40' } },
  { op: 'replace', path: '/$ui/off', value: ['letters'] }]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:05' }]);
fs.writeFileSync(path.join(ROOT, 'tests/preview/sample_v110.json'), JSON.stringify(S));
console.log(S.World._Weather, Object.keys(S.Player.Conditions), S.$ui.unlocks);
