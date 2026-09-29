// Fast source syntax and template checks. Run after tools/build_all.py.
const fs = require('fs'), path = require('path'), cp = require('child_process'), ejs = require('ejs');
const root = path.join(__dirname, '..');
const files = ['src/scripts/engine.template.js', 'src/scripts/ui.template.js', 'src/scripts/mood_gifts.js',
  'src/scripts/engine.js', 'src/scripts/ui.js', 'src/scripts/schema.js'];
for (const file of files) {
  const run = cp.spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (run.status !== 0) throw Error(`${file}: ${run.stderr}`);
}
const card = JSON.parse(fs.readFileSync(path.join(root, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
let count = 0;
for (const entry of card.character_book.entries) if (entry.content.includes('<%')) {
  ejs.compile(entry.content, { filename: `worldbook/${entry.id}.txt` }); count++;
}
if (['src/scripts/engine.js', 'src/scripts/ui.js', 'src/scripts/schema.js'].some(file =>
  /\/\*@@[^*]+@@\*\//.test(fs.readFileSync(path.join(root, file), 'utf8')))) {
  throw Error('unresolved generated placeholder');
}
console.log(`lint passed: ${files.length} JavaScript files, ${count} EJS entries`);
