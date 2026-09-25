// 1.5.1 (Batch B, planning/DRAFT_batch_plan.md): the Cast Sheet (custom 509 @D1): every NPC in Scene.Present gets their canon
// lore (at most 4 full sheets: who spoke in the last reply first, then the highest rank; the rest a brief sheet) with automatic
// INVARIANTS, secret status and the lines between the people present; their keyword entry is empty meanwhile. P6: who spoke
// without being present, who was only mentioned (<now>). D1: the last-mile cast gate (510 @D0) only with people present.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('Cast Sheet 1.5.1');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const E = uid => card.character_book.entries.find(e => e.id === uid);
const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/npcs.json'), 'utf8'));
const gv = S => k => require('lodash').get({ stat_data: S }, k);
const R = (uid, S) => ejs.render(E(uid).content, { getvar: gv(S) });
const meet = (ids, text, extra = []) => [{ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) }, ...extra];
const at = (S, time, ids, text, extra) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...meet(ids, text, extra)], { text: text || '' });
const sheetOf = (t, id) => { const m = t.match(new RegExp('\\[' + npcs[id].name + '\\] (full|brief) sheet')); return m ? m[1] : ''; };

let S = initState({ etnie: true });
ok(!/<cast>/.test(R(509, S)) && !/final_cast_gate/.test(R(510, S)), 'nobody present: no <cast>, no gate');

// ---- one NPC
S = at(S, '09:00', ['Irene']);
let t = R(509, S);
ok(/<cast>/.test(t) && sheetOf(t, 'Irene') === 'full', 'Irene present: full sheet');
ok(/INVARIANTS: she\/her\. Called Irene; full name Irene Chanare\. Year 3 student, Light dorm; Council President\./.test(t), 'automatic invariants: pronouns, names, who she is');
ok(/Bond with \{\{user\}\}: Rank 0, Trust \d+ \(\w+\), Tension 0 \(calm\)/.test(t), 'bond bands in the invariants');
ok(/Never: giving a second chance cheaply \(Trust\)/.test(t) && /Key ties: [^.]*Aiden \(rivals\)/.test(t), 'Never lines and key ties');
ok(/Personality: Collected, strict, by-the-book/.test(t) && /Emotional tells: Composure is her armour/.test(t), 'the full canon lore is in the sheet');
ok(!/Secrets:/.test(t), 'no secrets line for a character without <narrator_only> lore');
ok(R(98, S).trim() === '', "Irene's keyword entry prints nothing while she has a full sheet");
ok(/final_cast_gate/.test(R(510, S)), 'the D0 cast gate is on');
const S0 = at(S, '09:30', []);
ok(/Personality: Collected/.test(R(98, S0)), 'she leaves: her keyword entry works again');

// ---- eight NPCs: 4 full (speaker first, then rank), 4 brief
const eight = ['Aiden', 'Castor', 'Kanae', 'Zara', 'Rei', 'Caine', 'Ruby', 'Irene'];
S.Bonds.Zara = Object.assign({}, S.Bonds.Irene, { Rank: 6, Trust: 60 });
S = at(S, '10:00', eight, 'Caine looked at the board. "We start now, young master."');
ok(S.$ui.cast.full.length === 4 && S.$ui.cast.brief.length === 4, 'eight present: 4 full sheets, 4 brief: ' + JSON.stringify(S.$ui.cast.full));
ok(S.$ui.cast.full[0] === 'Caine' && S.$ui.cast.full[1] === 'Zara', 'the speaker first, then the highest rank');
t = R(509, S);
const brief = S.$ui.cast.brief[0];
ok(sheetOf(t, brief) === 'brief' && !t.includes(fs.readFileSync(path.join(ROOT, 'src/worldbook/content/' + npcs[brief].uid_card + '.txt'), 'utf8').split('\n')[3]), `a brief sheet (${brief}) has invariants but not the lore`);
ok(R(npcs[brief].uid_card, S).trim().length > 200, 'a brief-sheet character keeps their keyword lore entry');
ok(/Between the people here[\s\S]*- Irene → Aiden: rivals\./.test(t), 'P5: lines between the people present, both ways where curated');

// ---- secrets
S = applyPatch(S, [{ op: 'insert', path: '/Campus_State/Secrets_revealed/-', value: 'Castor.magic' }]);
S = at(S, '11:00', ['Castor']);
t = R(509, S);
ok(/Secrets: the <narrator_only> parts above are for you alone\. Castor never states them/.test(t) && /\{\{user\}\} has uncovered: magic\. Castor knows \{\{user\}\} knows this/.test(t), 'P7: secret status, one uncovered');
S = at(S, '11:30', ['Kanae']);
ok(/\{\{user\}\} has uncovered none of them/.test(R(509, S)), 'P7: nothing uncovered');

// ---- P6: spoke without being present; mentioned only
S = at(S, '12:00', ['Irene'], '"Ruzzo," Irene said. Aiden grinned from the doorway. "Morning, President." Nobody had seen Castor all day.');
ok(S.$ui.cast.gone.includes('Aiden') && S.$ui.cast.ment.includes('Castor') && !S.$ui.cast.ment.includes('Aiden'), 'engine: Aiden spoke but is not present, Castor was only mentioned');
t = R(505, S);
ok(/Aiden spoke in the last reply but is not in Scene\.Present: add them if they are still here/.test(t), '<now> asks to add Aiden or keep him silent');
ok(/Mentioned, not here \(they may not speak or act on-screen\): Castor \(he\/him(; usually: [^)]+)?\)/.test(t), '<now> lists Castor as mentioned, not here');
S = at(S, '12:10', ['Irene', 'Aiden'], 'Aiden laughed.');
ok(!S.$ui.cast.gone.length && !/spoke in the last reply/.test(R(505, S)), 'once present, no reminder');
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '12:20' }]);
ok(S.$ui.cast.full.includes('Aiden'), 'an update without prose (a player tool) keeps the cast');

// ---- deny list and non-NPC names
S = at(S, '13:00', ['Irene', 'Marta'], 'Ruby light fell across the table. "Sign here," Marta said.');
ok(!S.$ui.cast.ment.includes('Ruby'), 'a sentence-initial "Ruby" (an ordinary word) is no mention');
ok(!S.$ui.cast.full.includes('Marta') && !/\[Marta/.test(R(509, S)), 'an invented character gets no sheet (Extras come in 1.6.1)');

// ---- all EJS entries render together (one scope in ST)
let err = ''; try { ejs.render(card.character_book.entries.filter(e => /<%/.test(e.content)).map(e => e.content).join('\n'), { getvar: gv(S) }); } catch (e) { err = e.message.split('\n').slice(-1)[0]; }
ok(!err, 'all EJS entries render as one template with people present' + (err ? ': ' + err : ''));
const X = uid => E(uid).extensions;
ok(X(509).position === 4 && X(509).depth === 1 && X(510).position === 4 && X(510).depth === 0 && E(510).insertion_order < E(503).insertion_order && X(503).depth === 0, '509 @D1, 510 @D0 before the output format (503 stays last)');
