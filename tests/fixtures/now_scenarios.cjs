// 1.48.0 (audit batch 7, 3.11): update sequences whose <now> was compared between 1.47.0 (its EJS rules, its engine) and 1.48.0 (the
// engine's $ui.now), kept as hashes in now_1470.json (tests/test_audit_batch7_v1480.cjs). Each chain runs on one engine: run(S, B, text).
// Chains: the campus with people present (bonds at many ranks, Trust and Tension, recent moments), the Expedition forest, Crowning Day
// in Avalon, a flight aboard the airship and the Academy Trip in Sunreach Bay, hour by hour so the hourly events show. Sch: another
// release's schema (the comparison ran 1.47.0's engine with its own schema).
const fs = require('fs'), path = require('path');
const { Schema: Schema0, ROOT } = require('../harness.cjs');
const YAML = require('yaml');
const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/npcs.json'), 'utf8')), IDS = Object.keys(npcs).sort();
function chains(run, ver, Sch) {
  const Schema = Sch || Schema0;
  const raw = YAML.parse(fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/500.txt'), 'utf8').replace('@@VERSION@@', ver));
  const init = () => { const S = Schema.parse(raw); run(S, undefined, ''); return Schema.parse(S); };
  const step = (B, ops, text) => { const S = _.cloneDeep(B); for (const [p, v] of ops) _.set(S, p.split('/').filter(Boolean), _.cloneDeep(v)); const P = Schema.parse(S); run(P, B, text || ''); return Schema.parse(P); };
  const out = [];
  const W = (m, w, d, t, loc) => [['/World/Month', m], ['/World/Week', w], ['/World/Day', d], ['/World/Time', t], ['/World/Location', loc]];
  // the campus, people present
  let S = init();
  S = step(S, [['/Player/Profile/Dorm', 'Fire'], ['/Player/Profile/Year', 1]]);
  for (let i = 0; i < 40; i++) {
    const who = [IDS[(i * 5) % IDS.length], IDS[(i * 11 + 3) % IDS.length], IDS[(i * 17 + 7) % IDS.length]].slice(0, 1 + i % 3);
    const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7];
    S = step(S, [...W(2 + Math.floor(i / 7) % 9, 1 + i % 4, day, ['08:10', '11:20', '13:40', '16:30', '19:00', '22:40'][i % 6], ['Canteen', 'Main Library', 'Courtyards', 'Gardens', 'Boathouse and Lake', 'Fire Dormitory — Common Rooms'][i % 6]),
      ['/Scene/Present', Object.fromEntries(who.map(id => [id, { Note: 'here' }]))]],
      i % 4 === 0 ? 'They talk a while.' : '');
    for (const [k, id] of who.entries()) { const b = S.Bonds[id]; if (b) { b.Rank = (i + k) % 11; b.Trust = (i * 13 + k * 31) % 101; b.Tension = (i * 19 + k * 7) % 101; b.$Recent = [{ w: 'M2 W1 Mon', n: 'Shared a table.', fx: '' }]; } }
    S = step(S, [], '');
    out.push(S);
  }
  // the Expedition (M2 W3 Wed-Fri), hour by hour in the forest
  S = init();
  S = step(S, W(2, 3, 'Wed', '13:00', 'Grand Vast Forest — Base Camp'));
  const F = ['Grand Vast Forest — Base Camp', 'Grand Vast Forest — Wildwood (west)', 'Grand Vast Forest — Blightbriar', 'Grand Vast Forest — The Gloaming', 'Grand Vast Forest — Silverstair Falls'];
  for (let h = 0; h < 30; h++) { const abs = 13 * 60 + h * 90, d = ['Wed', 'Thu', 'Fri'][Math.min(2, Math.floor(abs / 1440))], t = abs % 1440; S = step(S, W(2, 3, d, String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'), F[h % F.length])); out.push(S); }
  // Crowning Day in Avalon (M4 W2 Tue)
  S = init();
  S = step(S, W(4, 2, 'Tue', '09:40', 'Avalon — Skyport'));
  const A = ['Avalon — Crown Square', 'Avalon — Lantern Market', 'Avalon — Gilded Arcade', 'Avalon — Old Town', 'Avalon — Skywheel Fair', 'Avalon — Skyport'];
  for (let h = 0; h < 12; h++) { const t = 600 + h * 30; S = step(S, [...W(4, 2, 'Tue', String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'), A[h % A.length]), ...(h === 3 ? [['/Avalon/Ride', true]] : [])]); out.push(S); }
  // the airship (M2 W3 Fri 13:00-18:00) and the day before Sunreach
  S = init();
  S = step(S, W(2, 3, 'Fri', '12:40', 'Grand Vast Forest — Base Camp'));
  for (const [t, loc] of [['13:10', 'Airship — Common Room'], ['14:20', 'Airship — Promenade Deck'], ['15:30', 'Airship — Cargo Hold'], ['16:40', 'Airship — Cabin Deck'], ['17:50', 'Airship — Common Room']]) { S = step(S, W(2, 3, 'Fri', t, loc)); out.push(S); }
  S = step(S, W(11, 2, 'Fri', '10:00', 'Canteen')); out.push(S);
  // the Academy Trip in Sunreach Bay (M11 W2 Sat 20:00 - W3 Thu 08:00)
  S = step(S, W(11, 2, 'Sat', '20:30', 'Sunreach Bay — Skydock'));
  const R = ['Sunreach Bay — Fish Market', 'Sunreach Bay — Coral Beach', 'Sunreach Bay — The Golden Tide', 'Sunreach Bay — Sea Dock', 'Sunreach Bay — Open Sea', 'Sunreach Bay — Sea Dock', 'Sunreach Bay — Velvet Lanes', 'Sunreach Bay — The Lighthouse'];
  for (let h = 0; h < 24; h++) { const abs = 20 * 60 + 30 + h * 100, d = ['Sat', 'Sun', 'Mon'][Math.floor(abs / 1440)], wk = d === 'Mon' ? 3 : 2, t = abs % 1440;
    S = step(S, [...W(11, wk, d, String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'), R[h % R.length]), ...(h === 2 ? [['/Sunreach/Bet', { Game: 'dice', Stake: 10 }]] : []), ...(h === 4 ? [['/Sunreach/Ride', 'carriage']] : [])]); out.push(S); }
  return out;
}
module.exports = { chains };
