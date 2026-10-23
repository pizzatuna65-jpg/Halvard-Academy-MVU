// 1.52.0 (owner-approved planning/DRAFT_npc_routines.md, feature batch 4, audit 4.7): NPC weekly routines in the one whereabouts
// model (shared.js whereabouts / presenceAt), held on a day by the shared roll100 at data/npc_routines.json rate (owner: 70%).
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const go = (S, o, x = []) => applyPatch(S, [...W(o), ...x]);
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const at = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const likely = X => ((X.$ui.now || {}).pres || []).filter(l => /^Likely around|in class until/.test(l)).join(' | ');
const S0 = go(initState({ etnie: true }), { ...at(8), Time: '10:00', Location: 'Fire Dormitory' }, [put('/Player/Profile/Dorm', 'Fire'), put('/$ui/off', ['presence_roll'])]);   // 1.99.11: the habit list
// the same weekday and time on many weeks; skip the weeks with an event (the calendar may change the day)
const weekly = (dow, time, loc, weeks = 30) => { const out = []; let X = S0; for (let w = 2; w < 2 + weeks; w++) { const n = w * 7 + dow; X = go(X, { ...at(n), Time: '07:30', Location: 'Fire Dormitory' }); X = go(X, { Time: time, Location: loc }); out.push(likely(X)); } return out; };

console.log('a routine holds most days (70%)');
{
  const wed = weekly(2, '18:30', 'The Dovecote'), n = wed.filter(l => /Royhan \(stays late near the Dovecote for Dragonchess\)/.test(l)).length;
  ok(n >= 0.45 * wed.length && n <= 0.95 * wed.length, `Royhan at the Dovecote on Wednesday evenings: ${n} of ${wed.length} weeks`);
  const off = []; let X = go(S0, { Time: '10:05' }, [put('/$ui/off', ['npc_routines', 'presence_roll'])]);
  for (let w = 2; w < 14; w++) { X = go(X, { ...at(w * 7 + 2), Time: '07:30', Location: 'Fire Dormitory' }); X = go(X, { Time: '18:30', Location: 'The Dovecote' }); off.push(likely(X)); }
  ok(!off.some(l => /Royhan/.test(l)), 'NPC routines off in Features: never (haunts only, as before 1.52.0)');
  const tue = weekly(1, '18:30', 'The Dovecote', 12);
  ok(!tue.some(l => /Royhan/.test(l)), 'not on a day outside his routine');
  const rate = JSON.parse(rd('data/npc_routines.json')).rate;
  ok(rate === 70, 'the rate is data (owner: 70)');
  const eng = rd('src/scripts/shared.js');
  ok(/roll100\(V\.seed, V\.dkey, 'routine', id, i\)/.test(eng), 'the roll is the shared roll100 (one source of draws)');
}

console.log('precedence: class and teaching over routine; arrivals');
{
  const mon = weekly(0, '13:30', 'Potion Halls'), tue = weekly(1, '13:30', 'Potion Halls');
  ok(mon.some(l => /Kotaro \(asleep in the storeroom\)/.test(l)), 'Kotaro sleeps in the storeroom on a Monday afternoon (not teaching)');
  ok(tue.some(l => /in class until/.test(l)) && !tue.some(l => /in class until/.test(l) && /Kotaro \(asleep in the storeroom\)/.test(l)), 'Tuesday afternoon he teaches Potion Crafting: the class wins (a Tuesday without classes keeps the routine)');
  const dawn = weekly(3, '06:15', 'The Sparring Pavilion', 6);
  ok(!dawn.some(l => /Tsubaki/.test(l)), 'Tsubaki (arrives in Year 2) is not there in Year 1');
  const lib = weekly(0, '17:00', 'Gardens');
  ok(lib.some(l => /Cedric \(his row\)/.test(l)), 'a teacher after classes at his own routine place');
}

console.log('Map, dossier, initiative');
{
  const ui = rd('src/scripts/ui.js');
  ok(ui.includes('["Routine","Usually: Mon–Fri 16:00–18:00 at Potion Halls, Alchemy Circle work; Wed 18:00–19:30 at The Dovecote, stays late near the Dovecote for Dragonchess."'),
    'the dossier gets a Routine field (after Haunts, opened with it)');
  const m = /"Royhan":\{[^}]*?"fl":(\[\[.*?\]\]),"/.exec(ui), fl = m ? JSON.parse(m[1]) : [];
  const h = fl.findIndex(f => f[0] === 'Haunts'), r = fl.findIndex(f => f[0] === 'Routine');
  ok(h >= 0 && r === h + 1 && fl[r][2] === fl[h][2], `Routine sits right after Haunts at the same rank (${fl[h] && fl[h][2]})`);
  ok(/\['Usually here', usual\.join/.test(rd('src/ui/parts/20_map.js')) && /hauntKnown\(r, S\)\)\s*\n?\s*\.map\(x =>/.test(rd('src/ui/parts/20_map.js')), 'the Map card lists "Usually here" only for people whose Haunts you know');
  ok(/\(PRESENCE\.rt \|\| \{\}\)\[id\] \|\| \[\]\)\.map\(r => r\[4\]\)/.test(rd('src/scripts/engine.template.js')), 'initiative and favours reach for the routine places first');
}
