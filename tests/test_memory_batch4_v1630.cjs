// 1.63.0 (audit/AUDIT_2026-10-05_1_sistem_memori.md §6, batch 4; M5 "Summaryception mini", owner-approved 2026-10-05): older memory
// is folded, never dropped. Journal lines that leave the window wait in $eng.jq; ten become one Chronicle entry (L1), four L1 one L2,
// a finished campaign year one L3. A character's Knows / Known_facts lines that leave the view wait in the hidden list and, five or
// more and the character on a full sheet, become one fold line that stays first. The fold rule card (511, [mvu_update]) carries the
// lines, so the update model needs no chat history; the engine dates, checks and stores the fold, or folds plainly after 8 replies.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const BLK = '<UpdateVariable>\n<JSONPatch>[]</JSONPatch>\n</UpdateVariable>';
const go = (S, w, x = [], text = BLK) => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x), { text });
const J = v => ({ op: 'insert', path: '/Journal/-', value: v }), F = v => ({ op: 'replace', path: '/Fold', value: v });
const S0 = go(initState({ etnie: true }), { Week: 2, Day: 'Tue', Location: 'Canteen', Time: '12:00' }, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);
let t = 12 * 60;
const tick = () => { t += 5; return { Time: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` }; };

console.log('Journal → Chronicle (L1)');
let S = go(S0, tick(), Array.from({ length: 30 }, (_, i) => J(`Turning point ${i}.`)));
S = go(S, tick(), Array.from({ length: 10 }, (_, i) => J(`Later point ${i}.`)));
{
  ok(S.$eng.jq.length >= 10 && S.$ui.fold && S.$ui.fold.k === 'journal' && S.$ui.fold.lines.length === 10 && S.$ui.fold.max === 50, `ten lines out of the window wait, and a fold is asked (${S.$eng.jq.length} waiting)`);
  const r = renderEntry(card, 511, S);
  ok(/Fold \(memory; this reply only/.test(r) && /Fold Journal lines that left the window, into one Chronicle entry, at most 50 words:/.test(r) && /  - \[M1 W2 Tue\] .*Turning point 0\./.test(r), 'the fold card prints the exact lines (no chat history needed)');
  const e511 = card.data.character_book.entries.find(e => e.id === 511);
  ok(/\[mvu_update\]/.test(e511.comment), 'it is an [mvu_update] entry: the update model writes the fold in extra-model mode');
}
const q0 = S.$eng.jq.length;
S = go(S, tick(), [F('{{user}} arrived, made friends with Etnie and Irene, and the first weeks went by in classes and small quarrels.')]);
{
  ok(S._Chronicle.length === 1 && /^\[Y1 M1 W1 Mon – Y1 M1 W2 Tue\] \{\{user\}\} arrived, made friends/.test(S._Chronicle[0]) && S.$eng.jq.length === q0 - 10 && S.Fold === '', `the fold becomes a dated Chronicle entry and its lines leave the queue (${S._Chronicle[0].slice(0, 40)})`);
  ok(S.$eng.chron.length === 1 && S.$eng.chron[0].L === 1 && S.$eng.chron[0].y === 1, 'level 1, Year 1');
  const r = renderEntry(card, 501, S);
  ok(/_Chronicle:\n\s+- .*arrived, made friends/.test(r) && r.indexOf('_Chronicle') < r.indexOf('Journal:'), '<current_state> prints the Chronicle before the Journal');
  ok(S.$ui.archive.some(l => /Turning point 0\./.test(l)), 'the original lines stay in the archive (UI)');
  global.window = { parent: { document: {} } }; global.getVariables = () => ({}); global.updateVariablesWith = () => {}; global.eventEmit = () => {};
  const U = new Function(rd('src/scripts/ui.js') + '\nreturn { nbJournal };')();
  ok(/<h3>The story so far<\/h3>/.test(U.nbJournal(S)) && /arrived, made friends/.test(U.nbJournal(S)), 'the Journal panel shows "The story so far"');
  const P = _.cloneDeep(S); P._Kept_from_earlier = ['[M1 W2 Tue] ! Irene swore an oath.'];
  ok(/📌 <\/span>Irene swore an oath\./.test(U.nbJournal(P)), 'a pinned line kept in view shows even when it never reached the archive (pinned and pushed out in one reply)');
}

console.log('a long fold is cut; an unanswered fold is made plainly');
{
  let L = go(S, tick(), Array.from({ length: 10 }, (_, i) => J(`Another point ${i}.`)));
  ok(L.$ui.fold && L.$ui.fold.k === 'journal', 'a new fold is asked');
  const C = go(L, tick(), [F(Array.from({ length: 90 }, (_, i) => `w${i}`).join(' '))]);
  ok(C._Chronicle.length === 2 && / w49 …$/.test(C._Chronicle[1]) && C._Log.some(l => /longer than 50 words and was cut/.test(l)), 'over half again the limit: cut to 50 words, and the Log says so');
  let P = L;
  for (let i = 0; i < 7; i++) P = go(P, tick());
  ok(P._Chronicle.length === 1 && P.$eng.fold.n === 7, `waiting: 7 replies (${JSON.stringify(P.$eng.fold)})`);
  const P0 = go(P, tick(), [], 'I wait.');
  ok(P0.$eng.fold.n === 7, 'a player message (no update block) does not count');
  P = go(P0, tick());
  ok(P._Chronicle.length === 2 && /Turning point \d+; /.test(P._Chronicle[1]) && P._Log.some(l => /folded those lines plainly/.test(l)), 'after 8 replies the engine folds the lines plainly');
}

console.log('Chronicle → L2, a finished year → L3');
{
  const T = _.cloneDeep(S); T.$eng.jq = [];
  T._Chronicle = Array.from({ length: 13 }, (_, i) => `[Y1 M${1 + Math.floor(i / 4)} W${1 + i % 4} Mon – Y1 M${1 + Math.floor(i / 4)} W${1 + i % 4} Sun] Entry ${i}.`); T.$eng.chron = [];
  let A = go(T, tick());
  ok(A.$ui.fold && A.$ui.fold.k === 'chronicle' && A.$ui.fold.lines.length === 4 && A.$ui.fold.max === 70, 'past 12 L1 entries, the oldest four are asked as one');
  A = go(A, tick(), [F('The first month: classes, a duel lost to Kaito, a truce.')]);
  ok(A._Chronicle.length === 10 && A._Chronicle[0] === '[Y1 M1 W1 Mon – Y1 M1 W4 Sun] The first month: classes, a duel lost to Kaito, a truce.' && A.$eng.chron[0].L === 2, `the L2 entry spans its four (${A._Chronicle[0].slice(0, 32)})`);
  const Y = _.cloneDeep(A); Y.World.Year = 2;
  let Z = go(Y, tick());
  ok(Z.$ui.fold && Z.$ui.fold.k === 'year' && Z.$ui.fold.lines.length === 10 && Z.$ui.fold.max === 100, 'in Year 2, Year 1\'s entries are asked as one');
  Z = go(Z, tick(), [F('Year 1: {{user}} found friends, lost a duel, solved the ledger.')]);
  ok(Z._Chronicle.length === 1 && Z._Chronicle[0] === '[Year 1] Year 1: {{user}} found friends, lost a duel, solved the ledger.' && Z.$eng.chron[0].L === 3 && !Z.$ui.fold, 'one L3 entry for the year');
}

console.log('Knows and Known_facts folds');
{
  let B = go(S0, tick(), [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } }]);
  B = go(B, tick(), Array.from({ length: 16 }, (_, k) => ({ op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: `Fact ${k}` })));
  const b = B.Bonds.Etnie;
  ok(b.$Known_q >= 6 && B.$ui.cast.full.includes('Etnie') && B.$ui.fold && B.$ui.fold.k === 'facts' && B.$ui.fold.who === 'Etnie' && B.$ui.fold.lines.length === b.$Known_q, `the facts past ten wait; Etnie is here: a fold is asked (${b.$Known_q})`);
  ok(/Fold what \{\{user\}\} knows about Etnie, at most 40 words:/.test(renderEntry(card, 511, B)) && /  - Fact 0\n/.test(renderEntry(card, 511, B)), 'the card prints her waiting facts');
  B = go(B, tick(), [F('Etnie loves the lake, hates mornings, and writes to her sister weekly.')]);
  const f = B.Bonds.Etnie.Known_facts;
  ok(f[0] === '[until Y1 M1 W2] Etnie loves the lake, hates mornings, and writes to her sister weekly.' && f.length === 11 && B.Bonds.Etnie.$Known_q === 0 && B.Bonds.Etnie.$Known_old.includes('Fact 0'), 'the fold line stays first in view; the originals stay in the dossier list');
  B = go(B, tick(), Array.from({ length: 5 }, (_, k) => ({ op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: `Newer fact ${k}` })));
  ok(B.Bonds.Etnie.Known_facts[0].startsWith('[until') && B.$ui.fold && B.$ui.fold.lines[0].startsWith('(earlier fold) [until Y1 M1 W2]') && B.$ui.fold.n === 5, 'the next fold takes the earlier fold with the new waiting lines');
  const Aw = go(B, tick(), [{ op: 'replace', path: '/Scene/Present', value: {} }]);
  ok(!Aw.$ui.fold, 'she leaves: no fold is asked about someone not on a full sheet');
  let N = Aw;
  for (let i = 0; i < 4; i++) N = go(N, tick(), Array.from({ length: 10 }, (_, k) => ({ op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: `Away fact ${i}-${k}` })));
  ok(N.Bonds.Etnie.$Known_q === 45 && N.Bonds.Etnie.$Known_old.length >= 45, `away, nothing is dropped before it is folded (${N.Bonds.Etnie.$Known_q} waiting, ${N.Bonds.Etnie.$Known_old.length} kept)`);
}

console.log('older saves');
{
  const O = _.cloneDeep(S0); O.$eng.ver = '1.62.0'; O.$eng.jq = [];
  O.$ui.archive = Array.from({ length: 25 }, (_, i) => `[M1 W1 Mon] Old line ${i}.`);
  O.Bonds.Etnie.$Known_old = Array.from({ length: 20 }, (_, i) => `Old fact ${i}`); O.Bonds.Etnie.$Known_q = 0;
  const M = go(O, tick());
  ok(M.$eng.jq.length === 25 && M.Bonds.Etnie.$Known_q === 20 && M.$ui.fold && M.$ui.fold.k === 'journal', 'what an older save moved out waits for a fold, and the first fold is asked');
}
