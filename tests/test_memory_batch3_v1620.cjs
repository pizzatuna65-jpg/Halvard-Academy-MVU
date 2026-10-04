// 1.62.0 (audit/AUDIT_2026-10-05_1_sistem_memori.md §6, batch 3; M3 pins, M4 open matters in Hooks): a line that starts with "!"
// never leaves the narrator's view. A pinned Journal line that leaves the window stays in _Kept_from_earlier (20); the engine pins
// its landmarks; Knows and Known_facts keep the newest five pinned lines past their cap; "Learned {{user}}'s true magic." is pinned.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const go = (S, w, x = []) => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x));
const J = v => ({ op: 'insert', path: '/Journal/-', value: v });
const S0 = go(initState({ etnie: true }), { Week: 2, Day: 'Tue', Location: 'Canteen', Time: '12:00' }, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);

console.log('Journal pins');
{
  let S = go(S0, { Time: '12:10' }, [J('! Irene swore on her family name to keep {{user}}\'s secret.')]);
  const pinned = S.Journal.find(l => /swore on her family name/.test(l));
  ok(/^\[M1 W2 Tue\] ! Irene swore/.test(pinned), `a narrator line with ! keeps its pin after the date (${pinned})`);
  for (let i = 0; i < 3; i++) S = go(S, { Time: `13:${10 + i * 10}` }, Array.from({ length: 12 }, (_, k) => J(`Turning point ${i}-${k}.`)));
  ok(!S.Journal.includes(pinned) && S._Kept_from_earlier.includes(pinned) && S.$ui.archive.includes(pinned), 'out of the window, it stays in view in _Kept_from_earlier (and in the archive for the panel)');
  ok(!S._Kept_from_earlier.some(l => /Turning point/.test(l)) && S.$ui.archive.some(l => /Turning point 0-0/.test(l)), 'an unpinned line goes to the archive only');
  const t = renderEntry(card, 501, S);
  ok(/_Kept_from_earlier:\n\s+- .*Irene swore on her family name/.test(t) && t.indexOf('_Kept_from_earlier') < t.indexOf('Journal:'), '<current_state> prints it, before the Journal');
  const M = _.cloneDeep(S); M.Mysteries = { 'The scorched ledger': { Status: 'open', Summary: '' } };
  const R = go(M, { Time: '14:00' }, [{ op: 'replace', path: '/Mysteries/The scorched ledger', value: { Status: 'solved', Summary: 'Kaito burned it' } }]);
  ok(R.Journal.some(l => /^\[M1 W2 Tue\] ! Solved: The scorched ledger/.test(l)), 'the engine pins its landmarks (a mystery solved)');
  let K = _.cloneDeep(S0);
  for (let i = 0; i < 22; i++) K = go(K, { Time: `${String(13 + Math.floor(i / 6)).padStart(2, '0')}:${String((i % 6) * 10).padStart(2, '0')}` }, [J(`! Pinned moment ${i}.`), ...Array.from({ length: 30 }, (_, k) => J(`Filler ${i}-${k}.`))]);
  ok(K._Kept_from_earlier.length === 20 && !K._Kept_from_earlier.some(l => /Pinned moment 0\./.test(l)) && K._Kept_from_earlier.some(l => /Pinned moment 20\./.test(l)), `at most 20 kept; the oldest leaves (${K._Kept_from_earlier.length})`);
  global.window = { parent: { document: {} } };
  global.getVariables = () => ({}); global.updateVariablesWith = () => {}; global.eventEmit = () => {};
  const U = new Function(rd('src/scripts/ui.js') + '\nreturn { nbJournal };')();
  const h = U.nbJournal(S), li = h.split('<li').find(x => /Irene swore/.test(x)) || '';
  ok(/📌/.test(li) && !/class="old"/.test(li) && !/>! Irene/.test(li), 'the Journal panel shows it pinned, not faded');
}

console.log('Knows and Known_facts pins');
{
  let S = go(S0, { Time: '12:10' }, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } },
    { op: 'insert', path: '/Bonds/Etnie/Knows/-', value: '! saw {{user}} cry at the Lake' }, { op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: '! Her brother died in the Fracture' }]);
  for (let i = 0; i < 3; i++) S = go(S, { Time: `13:${10 + i * 10}` }, [...Array.from({ length: 8 }, (_, k) => ({ op: 'insert', path: '/Bonds/Etnie/Knows/-', value: `heard {{user}} say thing ${i}-${k}` })),
    ...Array.from({ length: 6 }, (_, k) => ({ op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: `Fact ${i}-${k}` }))]);
  const b = S.Bonds.Etnie;
  ok(b.Knows.length === 16 && b.Knows.some(l => /! saw \{\{user\}\} cry/.test(l)) && b.$Knows_old.some(l => /thing 0-0/.test(l)), `Knows: the latest 15 plus the pinned line (${b.Knows.length})`);
  ok(b.Known_facts.length === 11 && b.Known_facts[0] === '! Her brother died in the Fracture' && b.$Known_old.includes('Fact 0-0'), `Known_facts: the latest 10 plus the pinned fact (${b.Known_facts.length})`);
  let P = S;
  P = go(P, { Time: '15:00' }, Array.from({ length: 6 }, (_, k) => ({ op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: `! Pin ${k}` })));
  P = go(P, { Time: '15:10' }, Array.from({ length: 10 }, (_, k) => ({ op: 'insert', path: '/Bonds/Etnie/Known_facts/-', value: `Later fact ${k}` })));
  const pins = P.Bonds.Etnie.Known_facts.filter(l => l.startsWith('!'));
  ok(pins.length === 5 && !pins.includes('! Her brother died in the Fracture') && pins.includes('! Pin 5'), `the newest five pins stay; an older pin follows the cap (${pins.length})`);
  const T = _.cloneDeep(S0); T.Hidden._True_magic = true; T.Hidden.Known_by = []; T.Scene.Present = { Etnie: { Note: '' } };
  const T2 = go(T, { Time: '12:20' }, [{ op: 'replace', path: '/Hidden/Known_by', value: ['Etnie'] }]);
  ok((T2.Bonds.Etnie.Knows || []).some(l => /! Learned \{\{user\}\}'s true magic\./.test(l)), 'a new keeper of the true magic: the line is pinned');
  const O = _.cloneDeep(S0); O.$eng.ver = '1.61.1'; O.Bonds.Etnie.Knows = ["[M1 W1 Mon] Learned {{user}}'s true magic."];
  ok(go(O, { Time: '12:30' }).Bonds.Etnie.Knows[0] === "[M1 W1 Mon] ! Learned {{user}}'s true magic.", 'an older save: that line gets its pin');
}

console.log('502: pins and open matters in Hooks (M4)');
{
  const r = renderEntry(card, 502, S0);
  ok(/stays open also goes in Hooks; remove the Hook once it is settled/.test(r) && !/close it with a new line/.test(r), 'Hooks on: an open matter goes in Hooks');
  ok(/Start a line with ! only for what must never fade/.test(r) && /In Knows or Known_facts, start a line with ! \(rare, at most five per character\)/.test(r), 'one pin sentence for the Journal, one for Knows and Known_facts');
  const H = _.cloneDeep(S0); H.$ui.on = { ...(H.$ui.on || {}), hooks: false };
  ok(/When a matter a line opened is settled, close it with a new line\./.test(renderEntry(card, 502, H)), 'Hooks off: the Journal closes its own matters, as before');
}
