// 1.51.0 (audit/AUDIT_2026-10-03_4_batch_fitur.md, feature batch 3): NPC-to-NPC life (audit 4.8: pair lines in Meanwhile and the
// ambience, story relations that fade) and the living mystery board (audit 4.9: trace beats at places an open thread's Clues name).
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const go = (S, o, x = []) => applyPatch(S, [...W(o), ...x]);
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const with_ = ids => put('/Scene/Present', Object.fromEntries(ids.map(i => [i, { Note: '' }])));
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const at = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data.character_book.entries;

let S0 = go(initState({ etnie: true }), { ...at(8), Time: '10:00', Location: 'Main Library' }, [put('/Player/Profile/Dorm', 'Fire')]);
S0 = go(S0, { Time: '10:30' }, [with_(['Cedric', 'Layla'])]);
S0 = go(S0, { Time: '11:00' }, [with_([])]);

console.log('4.8 pair lines in Meanwhile');
{
  const run = (X, days) => { const lines = []; for (let n = 9; n < 9 + days; n += 2) { X = go(X, { ...at(n), Time: '19:00', Location: 'Fire Dormitory' }); lines.push(...X.Journal.filter(l => /Meanwhile/.test(l))); } return [X, [...new Set(lines)]]; };
  const A = JSON.parse(JSON.stringify(S0)); A.Bonds.Cedric.Rank = 7; A.Bonds.Layla.Rank = 7;
  const [, mw] = run(A, 60);
  ok(mw.some(l => /Meanwhile: (Cedric and Layla|Layla and Cedric|Cedric was walking with Layla|Layla was walking with Cedric)/.test(l)), `two people {{user}} knows as friends are seen together (${mw.filter(l => /Cedric|Layla/.test(l)).slice(0, 3).join(' | ')})`);
  const pairDays = mw.filter(l => /Cedric/.test(l) && /Layla/.test(l)).map(l => l.slice(0, 14));
  ok(pairDays.length > 1 && new Set(pairDays).size === pairDays.length, `at most one pair line a day (${pairDays.length} on ${new Set(pairDays).size} days)`);
  const B1 = JSON.parse(JSON.stringify(S0)); B1.Bonds.Cedric.Rank = 7; delete B1.Bonds.Layla;
  const [, mw2] = run(B1, 60);
  ok(!mw2.some(l => /Layla/.test(l)), 'someone {{user}} has not met never appears in a pair line');
}

console.log('4.8 a pair moment nearby');
{
  let X = S0, hit = '';
  for (let n = 9; n < 60 && !hit; n++) for (const [t, loc] of [['12:20', 'Canteen'], ['16:30', 'Main Library'], ['17:10', 'Canteen'], ['17:40', 'Main Library']]) {
    X = go(X, { ...at(n), Time: t, Location: loc });
    const b = (X.$ui.amb || {}).beat; if (b && /Cedric|Layla/.test(b.text)) { hit = b.text; break; }
  }
  ok(/Layla|Cedric/.test(hit) && /Cedric/.test(hit) && /Layla/.test(hit), `at a place one of them haunts, a "nearby" beat may be the two of them (${hit})`);
}

console.log('4.8 story relations fade');
{
  const k = 'Cedric → Layla';
  const A = go(S0, { Time: '11:30' }, [put('/Campus_State/New_relations', { [k]: 'owes her a favour since the storeroom fire' })]);
  ok(!A.$ui.relold && A.$eng.nrel[k] >= 0, 'a new story relation is fresh');
  const f = go(A, { ...at(8 + 29), Time: '12:00' }), h = go(f, { ...at(8 + 58), Time: '12:00' });
  ok(f.$ui.relold && f.$ui.relold[k] === 1 && h.$ui.relold[k] === 2, `four weeks: faded; eight: hidden (${JSON.stringify(f.$ui.relold)} ${JSON.stringify(h.$ui.relold)})`);
  ok(h.Campus_State.New_relations[k], 'the record itself stays');
  const r = go(h, { Time: '12:30' }, [put('/Campus_State/New_relations/' + k, 'repaid the favour at the Club Festival')]);
  ok(!r.$ui.relold, 'rewritten by the narrator: renewed');
  const t = go(h, { Time: '12:30' }, [with_(['Cedric', 'Layla'])]);
  ok(!t.$ui.relold, 'the two in a scene together: renewed');
  const ui = rd('src/ui/parts/10_people.js');
  ok(/relold\[k\] >= 2\) continue/.test(ui) && /d\.faded \? 0\.25/.test(ui), 'Connections hides the eight-week lines and fades the four-week ones');
}

console.log('4.9 traces at an open thread\'s places');
{
  const clue = (X, th, status) => go(X, { Time: '11:40', Location: 'Fire Dormitory' }, [put('/Clues/Torn page', { Thread: th, Detail: 'a page torn from a ledger', Where: 'Main Library', Found: 'M1 W2' }),
    put('/Mysteries', { [th]: { Status: status, Summary: 'who tore the pages' } })]);
  const visit = (X, from, to) => { const seen = []; for (let n = from; n < to; n++) { X = go(X, { ...at(n), Time: '17:00', Location: 'Main Library' }); if ((X.$ui.amb || {}).trace) seen.push(n); X = go(X, { Time: '18:30', Location: 'Fire Dormitory' }); } return seen; };
  const open = clue(S0, 'The torn ledger', 'open'), seen = visit(open, 9, 37);
  const weeks = seen.map(n => Math.floor(n / 7));
  ok(seen.length >= 1 && new Set(weeks).size === weeks.length, `arriving at the clue's place: a trace, at most once a week (days ${seen.join(', ')})`);
  ok(!visit(clue(S0, 'The torn ledger', 'solved'), 9, 37).length, 'a solved thread leaves no trace');
  let X = open, now = '';
  for (let n = 9; n < 37 && !now; n++) { X = go(X, { ...at(n), Time: '17:00', Location: 'Main Library' }); if ((X.$ui.amb || {}).trace) now = renderEntry({ character_book: { entries: card } }, 505, X); X = go(X, { Time: '18:30', Location: 'Fire Dormitory' }); }
  ok(/Trace \(the open thread "The torn ledger" on \{\{user\}\}'s Mystery Board touches this place\)/.test(now) && /Never a solution/.test(now), '<now> names the thread and forbids a solution');
  const map = rd('src/ui/parts/20_map.js');
  ok(/function clueLocs/.test(map) && /' clue' : ''/.test(map), 'the Map marks the places of open threads');
}
