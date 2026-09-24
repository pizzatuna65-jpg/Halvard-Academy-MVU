// Runs every node test suite and the static QA over the built card. Usage: npm install && npm test
// (Build first: python3 build/build_card.py. The browser smoke test is separate: python3 tests/preview/smoke_all_panels.py)
const cp = require('child_process'), fs = require('fs'), path = require('path');
const dir = __dirname, suites = fs.readdirSync(dir).filter(f => /^test_.*\.cjs$/.test(f)).sort().concat(['qa_static.cjs']);
let failed = 0;
for (const s of suites) {
  const r = cp.spawnSync(process.execPath, [path.join(dir, s)], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || ''), n = (out.match(/✓/g) || []).length, bad = out.split('\n').filter(l => /✗|Error/.test(l));
  const okay = r.status === 0 && /ALL PASSED/.test(out);
  console.log(`${okay ? 'PASS' : 'FAIL'}  ${s.padEnd(26)} ${n} checks`); if (!okay) { failed++; console.log(bad.slice(0, 10).join('\n') || out.slice(-800)); }
}
console.log(failed ? `\n${failed} suite(s) FAILED` : '\nALL SUITES PASSED'); process.exitCode = failed ? 1 : 0;
