// 1.48.0 (audit batch 7): the Cast Sheet as one entry per NPC (2.7), <now> from the engine ($ui.now, 3.11), the state diet (2.6) and
// the small items (2.9).
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { Schema, runEngine, initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data, ENT = card.character_book.entries, X = id => ENT.find(e => e.id === id);

console.log('The Cast Sheet, one entry per NPC (2.7)');
const npcs = JSON.parse(read('data/npcs.json')), sheets = ENT.filter(e => e.id >= 600 && e.id < 700);
ok(sheets.length === Object.keys(npcs).length && sheets.every(e => /^@@if \[\.\.\.\(\(getvar\('stat_data\.\$ui\.cast'\)/.test(e.content)), 'every NPC has its own sheet entry, which opens with its @@if gate');
const at = e => [e.extensions.position, e.extensions.depth, e.constant, e.extensions.ignore_budget].join();
ok([X(509), X(599), ...sheets].every(e => at(e) === '4,1,true,true') && sheets.every(e => e.insertion_order > X(509).insertion_order && e.insertion_order < X(599).insertion_order)
  && X(599).insertion_order < X(505).insertion_order && new Set(sheets.map(e => e.insertion_order)).size === sheets.length,
  'all @D1, constant, outside the budget: the head 509, the sheets in id order, the tail 599, then <now>');
ok(sheets.every(e => e.content.length < 40000) && X(509).content.length < 10000, `no entry is large any more (the biggest sheet ${Math.max(...sheets.map(e => e.content.length))} chars; was one 679 KB template)`);
// tests/fixtures/cast_1470.json: each scenario's Cast Sheet as 1.47.0's one 509 template rendered it (sha1 and length)
const { scenario, N } = require('./fixtures/cast_scenarios.cjs');
const REC = JSON.parse(read('tests/fixtures/cast_1470.json'));
const bad = [];
for (let i = 0; i < N; i++) { const t = renderEntry(card, 509, scenario(i)); if (crypto.createHash('sha1').update(t).digest('hex').slice(0, 16) + ' ' + t.length !== REC[i]) bad.push(i); }
ok(REC.length === N && !bad.length, `every scenario's <cast> is the same text as before (${N} scenarios: full and brief sheets, ties, Extras, secrets, memory, Year 2, Entrance morning)` + (bad.length ? ': differs in ' + bad.slice(0, 5).join(', ') : ''));
const S1 = applyPatch(initState(), [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'here' } } }]);
const kept = ENT.filter(e => e.id >= 600 && e.id < 700).filter(e => require('ejs').render('<%- !!(' + e.content.split('\n')[0].slice(5) + ') %>', { getvar: k => _.get({ stat_data: S1 }, k) }) === 'true');
ok(kept.length === 1 && /Irene/.test(kept[0].comment), 'with one person here, only their sheet survives the @@if');
