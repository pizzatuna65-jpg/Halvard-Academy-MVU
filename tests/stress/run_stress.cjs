// npm run stress: every stress part, each run even when an earlier one fails, with every exit code reported.
// 1.99.2 (audit 2026-10-23 B2): the old "a && b && c" script skipped fuzz_builder and sim_year whenever fuzz failed; a "; " chain
// would not work either, since npm runs scripts through cmd.exe on Windows.
const cp = require('child_process'), path = require('path');
const PARTS = [['fuzz.cjs', '30', '150', '1'], ['fuzz_builder.cjs', '300'], ['sim_year.cjs', '380']];
const codes = PARTS.map(([file, ...args]) => {
  console.log(`\n== ${file} ${args.join(' ')}`);
  const r = cp.spawnSync(process.execPath, [path.join(__dirname, file), ...args], { stdio: 'inherit' });
  return [file, r.status === null ? `signal ${r.signal}` : r.status];
});
console.log('\n' + codes.map(([f, c]) => `${c === 0 ? 'PASS' : 'FAIL'}  ${f} (exit ${c})`).join('\n'));
process.exitCode = codes.some(([, c]) => c !== 0) ? 1 : 0;
