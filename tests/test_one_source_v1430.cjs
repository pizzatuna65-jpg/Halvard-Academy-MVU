// 1.43.0 (audit batch 2): one source. The constants and small rules every runtime shares live in src/scripts/shared.js (data from
// data/calendar.json); a copy written back into a template fails here before it can drift.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const SOURCES = ['src/scripts/engine.template.js', 'src/scripts/mood_gifts.js', 'src/scripts/ui.template.js', 'src/ui/statusbar.template.html',
  'src/ui/news.shared.js', 'src/worldbook/custom/505.template.ejs', 'src/worldbook/custom/506.template.ejs', 'src/worldbook/custom/509.template.ejs',
  ...fs.readdirSync(path.join(ROOT, 'src/ui/parts')).filter(f => f.endsWith('.js')).map(f => 'src/ui/parts/' + f)];
const COPIES = [
  ['the season table', /'Spring',\s*'Spring',\s*'Spring'|\['Spring',\s*'Summer',\s*'Autumn',\s*'Winter'\]/],
  ['class period hours', /\[\[\s*480,\s*600\s*\]|\[600,\s*720,\s*960\]|\[0,\s*600\],\s*\[1,\s*720\]|'08:00-10:00'|08:00–10:00|\['10:00',\s*'12:00',\s*'16:00'\]|\[8,\s*10,\s*13\]/],
  ['exam months', /\[3,\s*5,\s*9,\s*11\]/],
  ['the combat roles', /\['Attack',\s*'Defense',\s*'Healing'/],
  ['the dorm colours', /Fire:\s*'#d0583f'/],
  ['the trips', /name: 'the capital \(Crowning Day\)'/],
  ['a seeded hash', /2166136261/],
];
for (const f of SOURCES) {
  const s = rd(f), hit = COPIES.filter(([, rx]) => rx.test(s)).map(([n]) => n);
  ok(!hit.length, `${f}: no copy of shared.js${hit.length ? ' (' + hit.join(', ') + ')' : ''}`);
}
const sh = rd('src/scripts/shared.js');
ok(COPIES.filter(([n]) => !['the season table', 'class period hours', 'exam months', 'the dorm colours', 'the trips'].includes(n)).every(([, rx]) => rx.test(sh)), 'shared.js holds the rules (its data comes from data/calendar.json)');
// every runtime carries exactly one copy, with its data filled in
const cal = JSON.parse(rd('data/calendar.json'));
for (const f of ['src/scripts/engine.js', 'src/scripts/ui.js', 'src/ui/statusbar.html', 'src/worldbook/custom/content/505.txt']) {
  const s = rd(f), m = /const SH = (\{.*?\});/.exec(s);
  ok((s.match(/---- shared\.js \(1\.43\.0/g) || []).length === 1 && m && JSON.stringify(JSON.parse(m[1]).periods) === JSON.stringify(cal.periods), `${f}: one shared.js, filled from data/calendar.json`);
}
// a text that names a time or a number from the data reads it: nothing is left unfilled
for (const f of ['src/scripts/ui.js', 'src/worldbook/custom/content/505.txt']) ok(!/\{@[a-z_]+\./.test(rd(f)), `${f}: every {@data.ref} is filled`);
