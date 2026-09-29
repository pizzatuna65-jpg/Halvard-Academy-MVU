const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const cal = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/calendar.json'), 'utf8'));
const engine = fs.readFileSync(path.join(ROOT, 'src/scripts/engine.js'), 'utf8');
const ui = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
const extract = (source, key) => {
  const mark = `const ${key} = `, at = source.indexOf(mark);
  if (at < 0) throw Error(`missing ${key}`);
  const start = at + mark.length;
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (escaped) { escaped = false; continue; }
    if (quoted && c === '\\') { escaped = true; continue; }
    if (c === '"') { quoted = !quoted; continue; }
    if (quoted) continue;
    if (c === '[' || c === '{') depth++;
    if ((c === ']' || c === '}') && --depth === 0) return JSON.parse(source.slice(start, i+1));
  }
  throw Error(`unclosed ${key}`);
};
console.log('Calendar source and state budget');
ok(JSON.stringify(extract(engine, 'EVENTS')) === JSON.stringify(cal.events), 'engine events match data/calendar.json');
ok(JSON.stringify(extract(ui, 'EVENTS')) === JSON.stringify(cal.events), 'UI events match data/calendar.json');
ok(JSON.stringify(extract(engine, 'TIMETABLE')) === JSON.stringify(cal.timetable), 'engine timetable matches data/calendar.json');
ok(JSON.stringify(extract(ui, 'TIMETABLE')) === JSON.stringify(cal.timetable), 'UI timetable matches data/calendar.json');
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const tagged = (m,w,d,tag) => cal.events.some(e => e.m === m && e.w === w && e.d.includes(d) && e.mood === tag);
ok(days.slice(0,4).every(d => tagged(3,1,d,'exam') && tagged(5,1,d,'exam')) && tagged(11,2,'Fri','exam'), 'exam and result days carry mood tags');
ok(tagged(2,1,'Fri','trial') && tagged(3,4,'Sun','trial') && tagged(7,3,'Mon','trial') && tagged(11,4,'Sat','trial'), 'rite, competitions and lockdown carry trial tags');
let S = initState();
S = applyPatch(S, [{op:'replace',path:'/Scene/Present',value:{Sophia:{Note:''}}}]);
ok(S.$ui.moods.Sophia && !S.$ui.moods.Trixie, 'present NPC has mood without storing all NPC moods');
for (let i=0; i<330; i++) S.Journal.push(`[M1 W1 Mon] archived line ${i}`);
S = applyPatch(S, []);
ok(S.$ui.archive.length <= 120, 'journal archive is bounded to 120 lines');
const bonded = Object.keys(S.Bonds)[0];
S.Bonds[bonded].$Known_old = Array.from({length:35},(_,i)=>`fact ${i}`);
S.Bonds[bonded].$Knows_old = Array.from({length:35},(_,i)=>`memory ${i}`);
S = applyPatch(S, []);
ok(S.Bonds[bonded].$Known_old.length === 20 && S.Bonds[bonded].$Knows_old.length === 20,
  'an older save is trimmed to the new hidden-fact caps on its first update');
