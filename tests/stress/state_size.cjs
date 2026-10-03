// 1.48.0 (audit 2.6): how big the state is per message and how much a chat of N messages stores (MVU keeps stat_data with every
// message, so the chat file grows by about the sum). Plays N updates of ordinary days: classes, walks around the grounds, one to three
// people present (bonds of every rank), an Interaction now and then. Usage: node tests/stress/state_size.cjs [N] [engine.js] [schema.js]
// (an older engine needs its own schema). Prints the last message's stat_data, the average, and the sum over the chat, in KB.
const fs = require('fs'), path = require('path');
const { Schema: Schema0, runEngine: run0, ROOT } = require('../harness.cjs');
const YAML = require('yaml');
const N = +(process.argv[2] || 200);
const run = process.argv[3] ? new Function(fs.readFileSync(process.argv[3], 'utf8') + '\nreturn runEngine;')() : run0;
const Schema = process.argv[4] ? new Function(fs.readFileSync(process.argv[4], 'utf8').replace(/^import .*$/m, '').replace(/export const Schema/, 'const Schema').replace(/\$\(\(\) => \{[\s\S]*?\}\);\s*$/, '') + ' ; return Schema;')() : Schema0;
const ver = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/card/card.json'), 'utf8')).character_version;
const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/npcs.json'), 'utf8')), IDS = Object.keys(npcs).filter(id => (npcs[id].arrives || 1) === 1).sort();
let S = Schema.parse(YAML.parse(fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/500.txt'), 'utf8').replace('@@VERSION@@', ver)));
run(S, undefined, ''); S = Schema.parse(S);
const step = (ops, text) => { const B = S, X = _.cloneDeep(B); for (const [p, v] of ops) _.set(X, p.split('/').filter(Boolean), _.cloneDeep(v)); const P = Schema.parse(X); run(P, B, text || ''); S = Schema.parse(P); };
step([['/Player/Profile/Dorm', 'Fire'], ['/Player/Profile/Name', 'Aria']]);
const PLACES = ['Canteen', 'Main Library', 'Lecture Halls — Floor 2', 'Courtyards', 'Gardens', 'Fire Dormitory — Common Rooms', 'Gymnasium', 'The Mall', 'Boathouse and Lake'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let total = 0, abs = 8 * 60;
for (let i = 0; i < N; i++) {
  abs += 50 + (i % 5) * 25;
  const day = Math.floor(abs / 1440), t = abs % 1440;
  if (t < 7 * 60 || t > 22 * 60) { abs = (day + 1) * 1440 + 7 * 60 + 30; }
  const d = Math.floor(abs / 1440), m = 2 + Math.floor(d / 28) % 9, w = 1 + Math.floor(d % 28 / 7), tm = abs % 1440;
  const who = IDS.slice((i * 7) % (IDS.length - 3), (i * 7) % (IDS.length - 3) + 1 + i % 3);
  const ops = [['/World/Month', m], ['/World/Week', w], ['/World/Day', DAYS[d % 7]], ['/World/Time', String(Math.floor(tm / 60)).padStart(2, '0') + ':' + String(tm % 60).padStart(2, '0')],
    ['/World/Location', PLACES[i % PLACES.length]], ['/Scene/Present', Object.fromEntries(who.map(id => [id, { Note: 'here' }]))]];
  if (i % 3 === 0) ops.push(['/Interactions', who.map(id => ({ With: id, Kind: 'talk', Note: 'talked a while' }))]);
  step(ops, 'They talk a while.');
  total += JSON.stringify(S).length;
}
const kb = n => Math.round(n / 102.4) / 10;
console.log(JSON.stringify({ messages: N, last_kb: kb(JSON.stringify(S).length), avg_kb: kb(total / N), chat_kb: kb(total), ui_kb: kb(JSON.stringify(S.$ui).length),
  now_kb: kb(JSON.stringify(S.$ui.now || S.$ui.here || {}).length), moods_kb: kb(JSON.stringify(S.$ui.moods || {}).length), bonds: Object.keys(S.Bonds).length }));
