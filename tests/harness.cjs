// Node harness: loads schema.js + engine.js the way MVU would run them (zod 4 + lodash as globals).
// Usage: NODE_PATH=<dir with zod,lodash,yaml> node tests/<test>.cjs
const fs = require('fs'), path = require('path');
global._ = require('lodash');
global.z = require('zod');
const ROOT = path.join(__dirname, '..');
function loadSchema() {
  let src = fs.readFileSync(path.join(ROOT, 'src/scripts/schema.js'), 'utf8');
  src = src.replace(/^import .*$/m, '').replace(/export const Schema/, 'const Schema')
           .replace(/\$\(\(\) => \{[\s\S]*?\}\);\s*$/, '') + '\nreturn Schema;';
  return new Function(src)();
}
function loadEngine() {
  const src = fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8');
  return new Function(src + '\nreturn runEngine;')();
}
const Schema = loadSchema(), runEngine = loadEngine();
const YAML = require('yaml');
function initState() {
  const raw = YAML.parse(fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/500.txt'), 'utf8'));
  const S = Schema.parse(raw); runEngine(S, undefined); return Schema.parse(S);
}
// apply a JSONPatch the way MVU translates it (replace/delta/insert/remove), then schema + engine.
// opts.mvu: also emulate the MVU zod helper (StageDog mvu_zod.ts, isReadonlyPath): a command whose path has any segment
// starting with "_" is dropped before the schema runs, whoever wrote it (AI or a player tool). v1.0.3 (bug hunt F12).
function applyPatch(before, ops, opts = {}) {
  const S = _.cloneDeep(before);
  for (const op of ops) {
    const segs = op.path.replace(/^\//, '').split('/');
    if (opts.mvu && segs.some(x => x.startsWith('_'))) continue;
    if (op.op === 'replace') _.set(S, segs, _.cloneDeep(op.value));
    else if (op.op === 'delta') _.set(S, segs, (_.get(S, segs) || 0) + op.value);
    else if (op.op === 'insert' || op.op === 'add') {
      const last = segs.pop(), cont = segs.length ? _.get(S, segs) : S;
      if (Array.isArray(cont) && last === '-') cont.push(_.cloneDeep(op.value)); else cont[last] = _.cloneDeep(op.value);
    } else if (op.op === 'remove') {                         // arrays splice (as MVU does), records delete
      const last = segs[segs.length - 1], cont = segs.length > 1 ? _.get(S, segs.slice(0, -1)) : S;
      if (Array.isArray(cont)) cont.splice(+last, 1); else _.unset(S, segs);
    }
  }
  const P = Schema.parse(S);
  runEngine(P, before, opts.text || '');
  return Schema.parse(P);
}
function extractPatch(text) {
  const m = text.match(/<JSONPatch>([\s\S]*?)<\/JSONPatch>/); return m ? JSON.parse(m[1]) : [];
}
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) fails++; };
process.on('exit', () => { if (fails) { console.log(`${fails} FAILED`); process.exitCode = 1; } else console.log('ALL PASSED'); });
module.exports = { Schema, runEngine, initState, applyPatch, extractPatch, ok, ROOT };
