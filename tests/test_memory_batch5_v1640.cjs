// 1.64.0 (audit/AUDIT_2026-10-05_1_sistem_memori.md §6, batch 5; M6): recall by person and place. Journal lines that left the
// narrator's view (the archive, without the Journal and _Kept_from_earlier) that name someone on a full Cast Sheet come back in their
// sheet (3, newest first); those that name the place {{user}} is at come back in <now> (2). The archive keeps 240 lines.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8'));
const BLK = '<UpdateVariable>\n<JSONPatch>[]</JSONPatch>\n</UpdateVariable>';
const go = (S, w, x = [], text = BLK) => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x), { text });
const J = v => ({ op: 'insert', path: '/Journal/-', value: v });
const S0 = go(initState({ etnie: true }), { Week: 2, Day: 'Tue', Location: 'Canteen', Time: '12:00' }, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);
let t = 12 * 60;
const tick = () => { t += 5; return { Time: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` }; };

console.log('a person on a full sheet');
let S = go(S0, tick(), [J('Etnie lent {{user}} her lucky quill before the History test.'), J('{{user}} lost a bet at the boathouse.'),
  J('Etnie and {{user}} watched the lake freeze from the boathouse.'), J('Etnie admitted she is afraid of heights.'), J('Etnie snapped at {{user}} over a borrowed book.')]);
S = go(S, { Week: 3, Day: 'Mon', Time: '09:00' }, Array.from({ length: 30 }, (_, i) => J(`Ordinary day ${i}.`)));
{
  ok(S.$ui.archive.filter(l => /Etnie/.test(l)).length === 5 && !S.Journal.some(l => /Etnie/.test(l)), 'the Etnie lines left the window for the archive');
  const P = go(S, { Time: '09:05' }, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } }]);
  ok(P.$ui.cast.full.includes('Etnie'), 'Etnie is on a full sheet');
  const E = P.$ui.now.earlier.Etnie || [];
  ok(E.length === 3 && /snapped at/.test(E[0]) && /afraid of heights/.test(E[1]) && /watched the lake/.test(E[2]), `three lines that name her, newest first (${E.length})`);
  ok(/^\[M1 W2 Tue, 6 days ago\] /.test(E[0]), `dated with their age (${E[0].slice(0, 40)})`);
  const r = renderEntry(card, card.data.character_book.entries.find(e => e.id >= 600 && e.id < 700 && /Etnie/.test(e.comment)).id, P);
  ok(/Earlier, from the record \(Journal lines that name them, older than the Journal\): \[M1 W2 Tue[^|]*snapped at/.test(r), 'her Cast Sheet prints them');
  const Q = go(P, { Time: '09:10' }, [{ op: 'replace', path: '/Scene/Present', value: {} }]);
  ok(!(Q.$ui.now.earlier || {}).Etnie, 'not on a sheet: nothing recalled');
  const K = go(P, { Time: '09:10' }, [J('Etnie made up with {{user}}.')]);
  ok((K.$ui.now.earlier.Etnie || []).every(l => !/made up/.test(l)), 'a line still in the Journal is not recalled twice');
}

console.log('the place {{user}} is at');
{
  const P = go(S, { Time: '09:05', Location: 'Boathouse and Lake — the pier' });
  const R = P.$ui.now.recall || [];
  ok(R.length === 2 && /watched the lake freeze/.test(R[0]) && /lost a bet at the boathouse/.test(R[1]) && P.$ui.now.recallAt === 'Boathouse and Lake', `lines that name the place by any of its names, newest first (${R.length})`);
  const r = renderEntry(card, 505, P);
  ok(/Earlier here, from the record \(Journal lines that name Boathouse and Lake, older than the Journal\): \[M1 W2 Tue[^|]*watched the lake/.test(r), '<now> prints them');
  const Q = go(S, { Time: '09:05', Location: 'Main Library' });
  ok(!Q.$ui.now.recall && !/Earlier here/.test(renderEntry(card, 505, Q)), 'a place no line names: nothing');
  const B = go(S, { Time: '09:05', Location: 'Boathouse and Lake' }, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } }]);
  ok((B.$ui.now.recall || []).every(l => !/Etnie/.test(l)), 'a line already recalled for someone here is not printed twice');
}

console.log('retention');
{
  let L = S;
  for (let k = 0; k < 9; k++) L = go(L, { Time: `1${k}:00` }, Array.from({ length: 30 }, (_, i) => J(`Batch ${k} line ${i}.`)));
  ok(L.$ui.archive.length === 240, `the archive keeps 240 lines (${L.$ui.archive.length})`);
}
