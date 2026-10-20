// 1.61.0 (audit/AUDIT_2026-10-05_1_sistem_memori.md §6, batch 1): nothing important is forgotten silently. Clues of an open mystery
// outlive solved ones and leave into an archive (M1); the Journal drops repeats and lets routine engine lines go first (M2); an
// invented character past the archive keeps a short record (M8); the MVU hook reads the floor being processed (M9); VectFox gets the
// year of a Year 1 date and the narrator's turning points (M10a, M10b).
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const go = (S, w, x = []) => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x));
const S0 = go(initState(), { Week: 2, Day: 'Tue', Location: 'Canteen', Time: '12:00' }, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);

console.log('M1: Clues of an open mystery are kept, the ones that leave are archived');
{
  const S = _.cloneDeep(S0);
  S.Mysteries = { 'The scorched ledger': { Status: 'open', Summary: '' }, 'The missing cat': { Status: 'solved', Summary: 'It was in the boiler room.' } };
  S.Clues = {};
  for (let i = 0; i < 35; i++) S.Clues[`Ledger clue ${i}`] = { Thread: 'The scorched ledger', Detail: `burnt page ${i}`, Where: '', Found: 'M1 W1 Mon', Source: '', Links: [] };
  for (let i = 0; i < 5; i++) S.Clues[`Cat clue ${i}`] = { Thread: 'The missing cat', Detail: `paw print ${i}`, Where: '', Found: 'M1 W1 Tue', Source: '', Links: [] };
  const R = go(S, { Time: '12:10' }, [0, 1, 2].map(i => ({ op: 'replace', path: `/Clues/New ledger clue ${i}`, value: { Thread: 'The scorched ledger', Detail: `ash ${i}` } })));
  const ks = Object.keys(R.Clues);
  ok(ks.length === 40 && ks.filter(k => k.startsWith('Ledger clue')).length === 35 && ks.filter(k => k.startsWith('Cat clue')).length === 2, `over the cap, the solved mystery's clues leave first (${ks.filter(k => k.startsWith('Cat')).length} left)`);
  ok(['Cat clue 0', 'Cat clue 1', 'Cat clue 2'].every(k => R.$ui.cluearch[k] && R.$ui.cluearch[k].Detail), 'and stay on file in $ui.cluearch');
  const R2 = go(R, { Time: '12:20' }, [3, 4, 5].map(i => ({ op: 'replace', path: `/Clues/New ledger clue ${i}`, value: { Thread: 'The scorched ledger', Detail: `ash ${i}` } })));
  ok(!Object.keys(R2.Clues).some(k => k.startsWith('Cat')) && !R2.Clues['Ledger clue 0'] && R2.$ui.cluearch['Ledger clue 0'], 'with no closed clue left, the oldest open clue leaves, into the archive');
  const R3 = go(R2, { Time: '12:30' }, [{ op: 'replace', path: '/Clues/Ledger clue 0', value: { Thread: 'The scorched ledger', Detail: 'burnt page 0' } }]);
  ok(R3.Clues['Ledger clue 0'] && !R3.$ui.cluearch['Ledger clue 0'] && R3.$ui.cluearch['Ledger clue 1'], 'a clue the story writes again leaves the archive');
  global.window = { parent: { document: {} } };
  global.getVariables = () => ({}); global.updateVariablesWith = () => {}; global.eventEmit = () => {};
  const U = new Function(rd('src/scripts/ui.js') + '\nreturn { nbMystery };')();
  const h = U.nbMystery(R2);
  ok(/older clues?, kept on file/.test(h) && /paw print 0/.test(h) && /burnt page 0/.test(h), 'the Mystery panel lists them under their thread');
}

console.log('M2: the Journal drops repeats, routine engine lines leave first');
{
  const S = _.cloneDeep(S0);
  S.Journal = ['[M1 W1 Mon] Sorted into the Fire Dormitory by the Arbiter Stone.'];
  const R = go(S, { Time: '12:10' }, [{ op: 'insert', path: '/Journal/-', value: 'Sorted into Fire Dormitory by the Arbiter Stone' }, { op: 'insert', path: '/Journal/-', value: 'Lied to Irene about the library.' }]);
  ok(R.Journal.length === 2 && /Lied to Irene/.test(R.Journal[1]), `a new line that repeats an earlier one is dropped (${R.Journal.length})`);
  const D = _.cloneDeep(S0);
  D.Journal = ['[M1 W1 Mon] Sorted into the Fire Dormitory by the Arbiter Stone.', '[M1 W1 Tue] Sorted into the Fire Dormitory by the Arbiter Stone'];
  ok(go(D, { Time: '12:10' }).Journal.length === 1, 'a repeat already in an older save goes on its next update');
  const F = _.cloneDeep(S0);
  F.Journal = Array.from({ length: 30 }, (_, i) => (i === 4 ? '[M1 W1 Mon] Meanwhile: Irene is busy with the Council.' : i === 9 ? '[M1 W1 Tue] First visit to the Observatory, with Etnie.' : `[M1 W1 Wed] Turning point number ${i}.`));
  const G = go(F, { Time: '12:10' }, [{ op: 'insert', path: '/Journal/-', value: 'Quarrelled with Kaito.' }, { op: 'insert', path: '/Journal/-', value: 'Made up with Kaito.' }]);
  ok(G.Journal.length === 30 && G.Journal.includes('[M1 W1 Wed] Turning point number 0.') && !G.Journal.some(l => /Meanwhile|First visit/.test(l)), 'over 30, Meanwhile and a first visit leave before the oldest turning point');
  ok(G.$ui.archive.some(l => /Meanwhile: Irene/.test(l)) && G.$ui.archive.some(l => /First visit to the Observatory/.test(l)), 'and go to the archive as before');
  const G2 = go(G, { Time: '12:20' }, [{ op: 'insert', path: '/Journal/-', value: 'Found the ledger.' }]);
  ok(!G2.Journal.includes('[M1 W1 Wed] Turning point number 0.') && G2.Journal.length === 30, 'with none left, the oldest line leaves');
}

console.log('M8: an invented character past the archive keeps a short record');
{
  const S = _.cloneDeep(S0);
  S.$ui.xold = {};
  for (let i = 0; i < 41; i++) S.$ui.xold[`Clerk ${i}`] = { Who: `a clerk at the Registry, number ${i}`, Looks: 'grey coat, ink-stained fingers, a pencil behind one ear', Manner: 'brisk', Calls_user: 'student', Voice: 'flat, clipped', $seen: 1000 + i };
  const R = go(S, { Time: '12:10' });
  ok(Object.keys(R.$ui.xold).length === 40 && !R.$ui.xold['Clerk 0'] && R.$ui.xgone['Clerk 0'] && /Registry, number 0/.test(R.$ui.xgone['Clerk 0'].Who) && R.$ui.xgone['Clerk 0'].Voice === 'flat, clipped' && !('Manner' in R.$ui.xgone['Clerk 0']), 'the least recently seen leaves its name, who, looks and voice');
  const B = go(R, { Time: '12:20' }, [{ op: 'replace', path: '/Scene/Present', value: { 'Clerk 0': { Note: 'at the counter' } } }]);
  ok(B.Extras['Clerk 0'] && /Registry, number 0/.test(B.Extras['Clerk 0'].Who) && /grey coat/.test(B.Extras['Clerk 0'].Looks) && !B.$ui.xgone['Clerk 0'], 'and comes back from it with the same face and voice');
}

console.log('M9: the MVU hook reads the floor being processed');
{
  const E = new Function(rd('src/scripts/engine.js') + '\nreturn { floorOf, snapGap };')();
  const chat = [
    { mes: 'greeting', is_user: false, send_date: 'd0' },
    { mes: 'I go to the Archive.', is_user: true, send_date: 'd1' },
    { mes: 'reply one', is_user: false, send_date: 'd2' },
    { mes: '(player tool) Settings', is_user: true, is_system: true, send_date: 'd3' },
    { mes: 'I tell Irene the truth.', is_user: true, send_date: 'd4' },
    { mes: 'reply two', is_user: false, send_date: 'd5' },
  ];
  let F = E.floorOf(chat, 'reply one');
  ok(F.at === 2 && F.said === 'I go to the Archive.' && F.sent === 'd2', 'a replayed floor: its own player message and send date, not the chat\'s last');
  F = E.floorOf(chat, 'reply two');
  ok(F.at === 5 && F.said === 'I tell Irene the truth.', 'in play the floor is the last message');
  F = E.floorOf(chat, 'I tell Irene the truth.');
  ok(F.at === 4 && F.said === 'I tell Irene the truth.', 'a player floor reads its own words');
  F = E.floorOf(chat, 'text MVU changed');
  ok(F.at === 5 && F.said === 'I tell Irene the truth.', 'text not found: the chat\'s end, as before');
  ok(!E.snapGap({ $eng: { floor: 4 } }, 5) && !E.snapGap({ $eng: { floor: -1 } }, 50) && !E.snapGap(undefined, 9) && !E.snapGap({ $eng: { floor: 60 } }, 12), 'no warning for the floor before, an old save, or deleted messages');
  const g = E.snapGap({ $eng: { floor: 100 } }, 121);
  ok(g && /message 100, 21 messages back/.test(g.log) && /Replay floor/.test(g.toast), 'a state from a snapshot 21 floors back is reported, with the way to rebuild it');
  const S = applyPatch(S0, []);
  ok(S.$eng.floor === -1, 'the floor stamp is declared in the schema');
}

console.log('M10: VectFox gets the year of a Year 1 date and the narrator\'s turning points');
{
  const pats = JSON.parse(rd('dist/vectfox_cleaning_patterns.json'));
  const clean = t => pats.filter(p => p.enabled !== false).reduce((s, p) => s.replace(new RegExp(p.pattern, p.flags || 'g'), p.replacement || ''), t).replace(/\n{3,}/g, '\n\n').trim();
  const msg = (time, ops) => `Irene sighs.\n\n<UpdateVariable>\n<Analysis>\n- Time: ${time} | Location: Canteen → Courtyards\n</Analysis>\n<JSONPatch>\n${JSON.stringify(ops)}\n</JSONPatch>\n</UpdateVariable>`;
  const j = { op: 'insert', path: '/Journal/-', value: 'Irene called {{user}} "a menace" and meant it.' };
  let out = clean(msg('M1 W2 Wed 13:30 → M1 W2 Wed 13:40', [{ op: 'replace', path: '/World/Time', value: '13:40' }, j]));
  ok(out === 'Irene sighs.\n\n[Turning point: Irene called {{user}} \\"a menace\\" and meant it.]\n[In-world time: Y1 M1 W2 Wed 13:40, at Courtyards]', `a Journal line becomes a turning-point note, and a Year 1 date gets Y1 (${JSON.stringify(out.slice(13, 60))})`);
  out = clean(msg('Y2 M1 W2 Wed 13:30 → Y2 M1 W2 Wed 13:40', [{ op: 'replace', path: '/World/Time', value: '13:40' }]));
  ok(out === 'Irene sighs.\n\n[In-world time: Y2 M1 W2 Wed 13:40, at Courtyards]', 'a Year 2 date keeps its own year; no Journal line, no note');
  const REDOS_MOTIF_RE = /\([^)]*[+*][^)]*\)\s*[+*]|\([^)]*\|[^)]*\)\s*[+*]/;
  ok(pats.length === 10 && pats.every(p => p.pattern.length <= 300 && !REDOS_MOTIF_RE.test(p.pattern)), 'ten patterns (1.66.0: the scene marker), every one passes VectFox\'s import check');
  const p = rd('dist/vectfox_eventbase_prompt.txt');
  ok(/\[Turning point: <text>\]/.test(p) && /importance 6 or more and should_persist true/.test(p) && /"Y1 M1 W2 Wed 13:40 t1"/.test(p) && !/\{\{user\}\}/.test(p), 'the extraction prompt reads the note and dates with the year');
  ok(/A recalled date without a year \("M3 W2 Mon"\) is from Year 1\./.test(renderEntry(card, 504, S0)), '504: an old recalled date without a year is Year 1');
}
