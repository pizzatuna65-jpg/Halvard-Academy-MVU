// 1.49.0 (audit/AUDIT_2026-10-03_4_batch_fitur.md, feature batch 1): favours (audit 4.6) and group assignments (audit 4.10),
// engine stepPromises before the bonds, the favour reason in stepInitiative, 505's favour line.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const go = (S, o, x = [], opts) => applyPatch(S, [...W(o), ...x], opts);
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const del = p => ({ op: 'remove', path: p });
const ins = (p, v) => ({ op: 'insert', path: p + '/-', value: v });
const with_ = ids => put('/Scene/Present', Object.fromEntries(ids.map(i => [i, { Note: '' }])));
const logHas = (X, rx) => (X._Log || []).some(l => rx.test(l));
// Tuesday of Week 2, evening, with Etnie (bond Rank 3) at the Study Rooms
const S0 = go(go(initState({ etnie: true }), { Week: 2, Day: 'Tue', Time: '18:00', Location: 'Study Rooms' }), { Time: '18:05' }, [with_(['Etnie'])]);

console.log('4.6 favours');
{
  const fav = (extra = {}) => put('/Commitments/Honey bun for Etnie', { Desc: 'Bring her a honey bun', Due: 'M1 W2 Thu 18:00', With: 'Etnie', Type: 'favour', ...extra });
  const A = go(S0, { Time: '18:10' }, [fav()]);
  ok(A.Commitments['Honey bun for Etnie'] && !A.Commitments['Honey bun for Etnie']._Late, 'a favour is an ordinary Commitment with Type favour');
  const kept = go(A, { Time: '18:30' }, [del('/Commitments/Honey bun for Etnie')]);
  ok(logHas(kept, /Favour for Etnie kept/) && kept.Bonds.Etnie.Trust > A.Bonds.Etnie.Trust,
    `removed before it was due with Etnie present: counted as help (Trust ${A.Bonds.Etnie.Trust} -> ${kept.Bonds.Etnie.Trust})`);
  const twice = go(A, { Time: '18:30' }, [del('/Commitments/Honey bun for Etnie'), ins('/Interactions', { With: 'Etnie', Kind: 'help' })]);
  ok(twice.Bonds.Etnie.Trust === kept.Bonds.Etnie.Trust, 'reported as help too: counted once');

  const I = go(S0, { Time: '18:10' }, [fav({ Item: 'Honey bun' })]);
  const noBag = go(I, { Time: '18:30' }, [del('/Commitments/Honey bun for Etnie')]);
  ok(logHas(noBag, /Bag held no Honey bun/) && noBag.Bonds.Etnie.Trust === I.Bonds.Etnie.Trust, 'an Item favour without the Item in the Bag is not counted');
  const bag = go(I, { Time: '18:15' }, [put('/Inventory', { 'Honey bun': { Qty: 2, Kind: 'food' } })]);
  const given = go(bag, { Time: '18:30' }, [del('/Commitments/Honey bun for Etnie')]);
  ok(given.Inventory['Honey bun'].Qty === 1 && logHas(given, /Honey bun handed over/), `the Item leaves the Bag (${given.Inventory['Honey bun'].Qty} left)`);
  const own = go(bag, { Time: '18:30' }, [del('/Commitments/Honey bun for Etnie'), put('/Inventory/Honey bun/Qty', 1)]);
  ok(own.Inventory['Honey bun'].Qty === 1, 'the narrator already took it from the Bag: not taken twice');

  const late = go(A, { Day: 'Fri', Time: '09:00' }, []);
  const t1 = late.Bonds.Etnie.Tension;
  ok(t1 > A.Bonds.Etnie.Tension && logHas(late, /favour "Honey bun for Etnie" was left undone/), `left overdue: Tension rises (0 -> ${t1})`);
  const later = go(late, { Time: '12:00' }, []);
  ok(later.Bonds.Etnie.Tension <= t1 && later._Log.filter(l => /left undone/.test(l)).length === 1, 'only once');
  const gone = go(later, { Time: '12:10' }, [del('/Commitments/Honey bun for Etnie')]);
  ok(!logHas(gone, /Favour for Etnie kept/), 'removed after it went overdue: not counted as kept');
  ok(!(gone.$eng.promise.late || []).length, 'the overdue mark is dropped with the record');
}

console.log('4.10 group study and group assignments');
{
  const study = (X, w) => go(X, { Time: '19:10' }, [ins('/Practice', { Action: 'Group study', Subject: 'History', With: w })]);
  const solo = study(S0, ''), dup = study(S0, 'Etnie');
  const xp = X => X.Bonds.Etnie.$xp + 100 * X.Bonds.Etnie.Rank;
  ok(xp(dup) > xp(solo), `a Group study session with Etnie present is time together: bond XP (${xp(solo)} -> ${xp(dup)})`);
  const told = go(S0, { Time: '19:10' }, [ins('/Practice', { Action: 'Group study', Subject: 'History', With: 'Etnie' }), ins('/Interactions', { With: 'Etnie', Kind: 'study' })]);
  ok(xp(told) === xp(dup), 'reported as a study interaction too: counted once');
  const away = go(go(S0, { Time: '18:10' }, [with_([])]), { Time: '19:15' }, [ins('/Practice', { Action: 'Group study', Subject: 'History', With: 'Etnie' })]);
  ok(xp(away) === xp(S0) || !logHas(away, /no bond XP for study/), 'a partner not present gets nothing (and no added interaction)');

  const P = go(S0, { Time: '18:10' }, [put('/Projects/History essay', { Kind: 'assignment', Goal: 'History essay on the founding', Progress: 40, Due: 'M1 W2 Fri 12:00', With: 'Etnie' })]);
  const P2 = go(P, { Time: '18:20' }, []);
  const m0 = P2.$eng.study.mins, done = go(P2, { Time: '18:40' }, [put('/Projects/History essay/Progress', 100)]);
  ok(done.$eng.study.mins - m0 >= 45 && logHas(done, /finished on time: \+45 minutes/), `finished on time: +45 minutes of study (${m0} -> ${done.$eng.study.mins})`);
  const over = go(P2, { Day: 'Sat', Time: '10:00' }, []);
  ok(over.Bonds.Etnie.Tension > P2.Bonds.Etnie.Tension && logHas(over, /group assignment "History essay" is overdue/), `overdue: the partner's Tension rises (${P2.Bonds.Etnie.Tension} -> ${over.Bonds.Etnie.Tension})`);
  const over2 = go(over, { Time: '11:00' }, []);
  ok(over2._Log.filter(l => /is overdue \(Tension/.test(l)).length === 1, 'once');
  const lateDone = go(over2, { Time: '12:00' }, [put('/Projects/History essay/Progress', 100)]);
  ok(logHas(lateDone, /finished late: it counts as a skipped History class/) && lateDone.$eng.study.skip.History >= 1, 'finished late: a skipped History class');
}

console.log('initiative: a favour some days');
{
  let X = S0, favours = 0, perWeek = {}, sample = '';
  const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  X.Bonds.Etnie.Rank = 6;
  for (let n = 0; n < 56; n++) {
    const wk = 2 + Math.floor((n + 2) / 7), month = 1 + Math.floor((wk - 1) / 4);
    X = go(X, { Month: month, Week: ((wk - 1) % 4) + 1, Day: D[(n + 2) % 7], Time: '20:00', Location: 'Fire Dormitory' }, [with_([])]);
    const f = (X.$ui.initiative || {}).favour;
    if (f) { favours++; sample = sample || X.$ui.initiative.ask; perWeek[wk] = (perWeek[wk] || 0) + 1; }
  }
  ok(favours > 0, `over eight weeks Etnie sometimes asks a favour (${favours}): "${sample}"`);
  ok(Object.values(perWeek).every(n => n <= 2), `at most two a week (${JSON.stringify(perWeek)})`);
  X = go(X, { Time: '20:30' }, [put('/Commitments/Favour', { Desc: 'x', Due: 'M9 W1 Mon 12:00', With: 'Etnie', Type: 'favour' })]);
  let more = 0;
  for (let n = 0; n < 14; n++) { X = go(X, { Day: D[n % 7], Week: 1 + Math.floor(n / 7), Month: 4, Time: '20:00' }); if ((X.$ui.initiative || {}).favour) more++; }
  ok(more === 0, 'none while a favour for Etnie is open');
  const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data.character_book.entries;
  const V = JSON.parse(JSON.stringify(X));
  V.$ui.initiative = { id: 'Etnie', stage: 'drops by', ask: 'asks {{user}} to pick up a Honey bun for them', favour: { item: 'Honey bun', days: 2 } };
  const now = renderEntry({ character_book: { entries: card } }, 505, V);
  ok(/The reason is a favour\. If \{\{user\}\} agrees, add a Commitment with Type "favour", With "Etnie", a Due within 2 days and Item "Honey bun"/.test(now), '505 tells the narrator how to record an accepted favour');
}

console.log('rules and data');
{
  const r502 = rd('src/worldbook/custom/content/502.txt');
  ok(/assignment\|promise\|appointment\|club\|favour/.test(r502) && /A favour \(Type "favour"/.test(r502) && /Kind "assignment", With the classmates/.test(r502), '502: favours and group assignments');
  const d = JSON.parse(rd('data/initiative_asks.json')).favours;
  ok(d && d.rate > 0 && d.per_week === 2 && d.ignored_tension > 0, 'data/initiative_asks.json favours');
}
