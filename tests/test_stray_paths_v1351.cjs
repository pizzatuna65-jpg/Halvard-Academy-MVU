// 1.35.1 (owner playtest, chat 2026-10-01): Ruby's sweet was written to /Player/Inventory/<item>, which the schema drops; the
// COMMAND_PARSED hook moves a top-level list written under Player, World or Scene (or as "Bag") back to the root.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
global._ = require('lodash');
const E = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8') + '\nreturn { fixStrayPaths, patchCommands };')();
const cmds = E.patchCommands([
  { op: 'insert', path: '/Player/Inventory/Lemon and honey sweet', value: { Qty: 1, Kind: 'food' } },
  { op: 'replace', path: '/Player/Inventory/Honey-lemon drop/Qty', value: 2 },
  { op: 'insert', path: '/Bag/Tin "of" sweets', value: { Qty: 1 } },
  { op: 'insert', path: '/Player/Commitments/Ghost hunt', value: { Desc: '' } },
  { op: 'replace', path: '/Player/Wallet/Points', value: 10 },
  { op: 'insert', path: '/Inventory/Scarf', value: { Qty: 1 } },
]);
const moved = E.fixStrayPaths(cmds);
const P = c => _.toPath(c.args[0]);
ok(_.isEqual(P(cmds[0]), ['Inventory']) && cmds[0].args[1] === '"Lemon and honey sweet"', '/Player/Inventory/<item> insert goes to /Inventory');
ok(_.isEqual(P(cmds[1]), ['Inventory', 'Honey-lemon drop', 'Qty']), 'a replace under /Player/Inventory goes to /Inventory');
ok(_.isEqual(P(cmds[2]), ['Inventory']), '/Bag is read as /Inventory');
ok(_.isEqual(P(cmds[3]), ['Commitments']), 'other top-level lists move too');
ok(_.isEqual(P(cmds[4]), ['Player', 'Wallet', 'Points']) && _.isEqual(P(cmds[5]), ['Inventory']), 'correct paths are untouched');
ok(moved.length === 3 && moved.includes('Player.Inventory → Inventory'), 'the moves are listed for the Log');
const raw = [{ type: 'set', args: ["'Player.Inventory.x'", '1'], reason: '' }];
ok(E.fixStrayPaths(raw).length === 0 && raw[0].args[0] === "'Player.Inventory.x'", '_.set commands are left to MVU\'s own pathFix');
