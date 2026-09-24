// Batch 5.3: seeded campus happenings (F20), journal archive (F21), settings. Run: NODE_PATH=<zod lodash yaml> node tests/test_happenings_b5.cjs
const { Schema, runEngine, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const fs = require('fs'), path = require('path');
const POOL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/happenings.json'), 'utf8')).items;

console.log('seed');
const S0 = initState();
ok(S0.$eng.seed > 0, `seed set on the first engine run (${S0.$eng.seed})`);
const t1 = applyPatch(S0, [{ op: 'replace', path: '/World/Time', value: '09:00' }]);
ok(t1.$eng.seed === S0.$eng.seed, 'seed kept across updates');
const hacked = applyPatch(S0, [{ op: 'replace', path: '/World/_Happening', value: 'A dragon lands in the Courtyards' }]);
ok(!/dragon/.test(hacked.World._Happening), 'AI cannot write _Happening (engine recomputes it)');

// walk a whole year, one day at a time at 07:30, with a fixed seed
function walk(seed, freq) {
  let S = initState(); S.$eng.seed = seed; S.$ui.happenings = freq;
  const days = [];
  for (let d = 1; d < 336; d++) {
    const parts = { Month: Math.floor(d / 28) + 1, Week: Math.floor((d % 28) / 7) + 1, Day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d % 7] };
    S = applyPatch(S, [{ op: 'replace', path: '/World/Month', value: parts.Month }, { op: 'replace', path: '/World/Week', value: parts.Week },
      { op: 'replace', path: '/World/Day', value: parts.Day }, { op: 'replace', path: '/World/Time', value: '07:30' }]);
    days.push({ ...parts, hap: S.$ui.hap, txt: S.World._Happening, toasts: [...S.$ui.toasts] });
  }
  return days;
}
console.log('rolls');
const A = walk(12345, 'normal'), A2 = walk(12345, 'normal'), Bw = walk(999, 'normal');
ok(JSON.stringify(A.map(d => d.hap && d.hap.id)) === JSON.stringify(A2.map(d => d.hap && d.hap.id)), 'same seed -> same year (deterministic, replay-safe)');
ok(A.some((d, i) => (d.hap && d.hap.id) !== (Bw[i].hap && Bw[i].hap.id)), 'different seed -> different year');
const n = A.filter(d => d.hap).length;
ok(n > 60 && n < 170, `about 40% of eligible days have a happening (${n} of 335)`);
ok(A.filter(d => d.Month === 12 || (d.Month === 7 && d.Week === 3) || (d.Month === 5 && d.Week === 4)).every(d => !d.hap), 'none during breaks or the Thinning lockdown');
ok(A.every((d, i) => !d.hap || i === 0 || !A[i - 1].hap || A[i - 1].hap.id !== d.hap.id), 'no happening repeats the previous day');
ok(A.filter(d => d.hap).every(d => { const h = POOL.find(p => p.id === d.hap.id);
  return (!h.months || (d.Month >= h.months[0] && d.Month <= h.months[1])) && (!h.weeks || h.weeks.includes(d.Week))
    && (h.days === 'any' || (h.days === 'weekday' ? !['Sat', 'Sun'].includes(d.Day) : h.days === 'weekend' ? ['Sat', 'Sun'].includes(d.Day) : h.days.includes(d.Day))); }), 'every pick respects its day / month / week conditions');
ok(A.filter(d => d.hap).every(d => d.toasts.some(t => /^Around campus/.test(t))), 'a toast announces each new day\'s happening');
ok(new Set(A.filter(d => d.hap).map(d => d.hap.id)).size >= 15, `variety: ${new Set(A.filter(d => d.hap).map(d => d.hap.id)).size} different happenings in a year`);
const off = walk(12345, 'off'), often = walk(12345, 'often');
ok(off.every(d => !d.hap && !d.txt), 'setting off -> none');
ok(often.filter(d => d.hap).length > n, `setting often -> more (${often.filter(d => d.hap).length})`);

console.log('window');
const day = A.findIndex(d => d.hap && d.hap.from >= 9);
let S = initState(); S.$eng.seed = 12345;
const P = A[day];
S = applyPatch(S, [{ op: 'replace', path: '/World/Month', value: P.Month }, { op: 'replace', path: '/World/Week', value: P.Week }, { op: 'replace', path: '/World/Day', value: P.Day }, { op: 'replace', path: '/World/Time', value: '07:00' }]);
ok(S.World._Happening.startsWith(`${String(P.hap.from).padStart(2, '0')}:00`), `before the window: announced with its hours (${S.World._Happening.slice(0, 40)}…)`);
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: `${String(P.hap.from).padStart(2, '0')}:30` }]);
ok(/^Now, until/.test(S.World._Happening) && S.$ui.hap.now, 'inside the window: "Now, until …"');
ok(!S.$ui.toasts.some(t => /Around campus/.test(t)), 'no second toast on the same day');
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: `${String(Math.min(23, P.hap.to)).padStart(2, '0')}:05` }]);
ok(S.World._Happening === '' && S.$ui.hap === null, 'after the window: cleared');

console.log('journal archive');
let J = initState();
for (let i = 0; i < 35; i++) J = applyPatch(J, [{ op: 'insert', path: '/Journal/-', value: `Turning point number ${i}` }]);
ok(J.Journal.length === 30, 'narrator journal capped at 30');
ok(J.$ui.archive.length === 6 && /Arrived at Halvard/.test(J.$ui.archive[0]), `older lines moved to $ui.archive (${J.$ui.archive.length})`);
J = applyPatch(J, [{ op: 'remove', path: '/Journal/0' }]);
ok(J.$ui.archive.length === 7 && J.Journal.length === 29, 'a line the AI removes is archived, not lost');
const JS = Schema.parse(_.cloneDeep(J));
ok(JS.$ui.archive.length === 7 && JS.$eng.seed === J.$eng.seed && JS.$ui.happenings === 'normal', 'schema keeps archive, seed and setting');

console.log('settings patch (no builder auth)');
const st = applyPatch(S0, [{ op: 'replace', path: '/$ui/happenings', value: 'rare' }]);
ok(st.$ui.happenings === 'rare' && !st._Log.some(l => /read-only/.test(l)), 'happenings setting changes without tripping the read-only guard');
const bad = applyPatch(S0, [{ op: 'replace', path: '/$ui/happenings', value: 'always' }]);
ok(bad.$ui.happenings === 'normal', 'invalid setting falls back to normal');

console.log('5.4 known-facts window');
let K = initState();
for (let i = 0; i < 14; i++) K = applyPatch(K, [{ op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: `Etnie fact ${i}` }]);
ok(K.Bonds.Etnie.Known_facts.length === 10 && K.Bonds.Etnie.Known_facts[9] === 'Etnie fact 13', 'AI sees the latest 10 facts');
ok(K.Bonds.Etnie.$Known_old.length === 5 && /Third-year/.test(K.Bonds.Etnie.$Known_old[0]), 'older facts kept in $Known_old (hidden from the AI)');
K = applyPatch(K, [{ op: 'replace', path: '/World/Time', value: '10:00' }]);
ok(K.Bonds.Etnie.$Known_old.length === 5, '$Known_old survives later updates');
