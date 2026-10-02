// 1.43.0 (audit batch 2): the two behaviour changes after the one-source refactor (the refactor itself is proven by ENGINE_DIFF and
// tests/snapshot_render.cjs; tests/test_one_source_v1430.cjs keeps it one source).
const fs = require('fs'), path = require('path');
const { applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { lifeX, placeOf, placeKey, rollTable, roll100 };')();

console.log('Ambient moments also paces the outside areas');
ok(E.lifeX({ amb_freq: 2 }) === 1 && Math.abs(E.lifeX({ amb_freq: 1 }) - 30 / 45) < 1e-9 && Math.abs(E.lifeX({ amb_freq: 3 }) - 60 / 45) < 1e-9,
  'Normal keeps the data rates; Rare and Often scale them by the share of ambient moments (30 and 60 against 45 in 100)');
{
  const SAVE = JSON.parse(rd('tests/fixtures/saves/save_1.42.0.json'));
  const W = (S, o, x = []) => applyPatch(S, [...Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...x]);
  const day = freq => {
    let S = W(applyPatch(SAVE, [{ op: 'replace', path: '/$ui/tune', value: { amb_freq: freq } }]), { Month: 11, Week: 2, Day: 'Sun', Time: '07:00', Location: 'Sunreach Bay — The Hanabira' });
    let n = 0;
    for (let h = 8; h <= 22; h++) for (const loc of ['Sunreach Bay — Fish Market', 'Sunreach Bay — Coral Beach']) {
      S = W(S, { Time: `${String(h).padStart(2, '0')}:${loc.includes('Fish') ? '05' : '35'}`, Location: loc });
      n += ((S.$ui.sunreach || {}).ev || []).filter(e => e.k === 'street' || e.k === 'student' || e.k === 'rival').length;
    }
    return n;
  };
  const rare = day(1), normal = day(2), often = day(3);
  ok(rare <= normal && normal <= often && rare < often, `a Sunreach day: Rare ${rare}, Normal ${normal}, Often ${often} street sights and people met`);
}

console.log('A Location written with an en dash');
ok(E.placeOf('Canteen – by the window') === 'Canteen' && E.placeKey('The Mall – Nightwell') === 'mall', 'placeOf splits at an en dash too (as locParts and the Price Guide always did)');
