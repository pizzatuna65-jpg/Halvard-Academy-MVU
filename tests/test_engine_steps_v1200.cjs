// 1.20.0 (audit A5): runEngine is a list of steps; save migrations run once, on the first update after a version change.
const fs = require('fs'), path = require('path');
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8');
const E = new Function(src + '\nreturn { ENGINE_STEPS, ENGINE_VER };')();
const clone = x => JSON.parse(JSON.stringify(x));

console.log('Engine steps');
const names = E.ENGINE_STEPS.map(f => f.name);
ok(names.length >= 30 && names.every(n => /^step[A-Z]/.test(n)) && new Set(names).size === names.length, `${names.length} distinct steps`);
ok(names[0] === 'stepSetup' && names[1] === 'stepMigrate' && names[names.length - 1] === 'stepCommit', 'setup and migrations first, commit last');
const order = ['stepTime', 'stepWeather', 'stepMagic', 'stepRest', 'stepReputation', 'stepSchoolWeek', 'stepNamesInProse', 'stepBonds', 'stepTraining', 'stepReminders', 'stepUi'];
ok(order.every((n, i) => i === 0 || names.indexOf(order[i - 1]) < names.indexOf(n)), 'sections keep their old order');
ok(!/^function runEngine[\s\S]{0,400}fillShape/.test(src) && /for \(const step of ENGINE_STEPS\) step\(c\);/.test(src), 'runEngine only runs the steps');

console.log('Save migrations');
const S = initState({ etnie: true });
ok(S.$eng.ver === E.ENGINE_VER && S.$eng.repv === 1 && S.$eng.bondv === 2 && S.$eng.tenv === 1, 'a new chat is migrated on its first run');
// Dante's restored gift: a save with the Council safety card keeps its uses under the Lodge key.
const D0 = clone(S); D0.$eng.ver = '1.33.0'; D0._Perks['Council safety card'] = { From: 'Dante', Kind: 'gift', Effect: 'old text', Uses: 0 };
const D0copy = clone(D0);
const D1 = applyPatch(D0, [{ op: 'replace', path: '/World/Time', value: '09:30' }]);
ok(D1._Perks["Groundskeeper's Lodge key"] && !D1._Perks['Council safety card'], "Dante's gift key becomes Groundskeeper's Lodge key");
ok(!(D1._Log || []).some(l => /read-only/.test(l)), 'no read-only revert of the migration');
ok(_.isEqual(D0, D0copy), "the caller's before-state is not changed");
const D2 = applyPatch(D1, [{ op: 'replace', path: '/World/Time', value: '09:40' }]);
ok(D2._Perks["Groundskeeper's Lodge key"] && !D2._Perks['Council safety card'] && D2.$eng.ver === E.ENGINE_VER, 'the rename stays on the next update');
// same version: migrations are skipped (a flag reset alone does not re-run them)
const K0 = clone(S); K0.$eng.repv = 0; K0.Player.Profile.Reputation = { ...K0.Player.Profile.Reputation, Public: 20 };
const K1 = applyPatch(K0, [{ op: 'replace', path: '/World/Time', value: '09:50' }]);
ok(K1.$eng.repv === 0 && !((K1.Player.Profile.Reputation.$xp || {}).Academy), 'same version: no migration runs');
// an older version: the flagged migrations run once
const O0 = clone(S); O0.$eng.ver = '1.2.1'; O0.$eng.repv = 0; O0.$eng.bondv = 0; O0.Player.Profile.Reputation = { Public: 20, Dorm: -12 }; O0.Bonds.Etnie.Progress = 5; O0.Bonds.Etnie.$xp = 0;
const O1 = applyPatch(O0, [{ op: 'replace', path: '/World/Time', value: '10:00' }]);
ok(O1.Player.Profile.Reputation.$xp.Academy === 25 && O1.Player.Profile.Reputation.$xp.Student === -15 && O1.Bonds.Etnie.$xp > 0, 'older version: reputation meters and bond Progress migrate');
ok(O1.$eng.repv === 1 && O1.$eng.bondv === 2 && O1.$eng.tenv === 1 && O1.$eng.ver === E.ENGINE_VER, 'flags and version are set');
ok((O1._Log || []).filter(l => /three parts/.test(l)).length === 1, 'the reputation change is logged once');
