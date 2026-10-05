// 1.65.0 (audit/AUDIT_2026-10-05_1_sistem_memori.md §6, batch 6; M7): <current_state> by relevance. The engine marks what touches
// the scene ($ui.now.focus: the people here, named or expected; the Extras here or named; the clue threads tied to them, the place,
// the prose, a new clue or the trace beat). 501 prints those in full and the rest as one "…_not_shown" index line; a person here
// has their status and secrets in their Cast Sheet, so 501 does not print them twice.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8'));
const blk = (prose = 'They read.') => prose + '\n<UpdateVariable>\n<JSONPatch>[]</JSONPatch>\n</UpdateVariable>';
const go = (S, ops, prose, user) => applyPatch(S, ops, { text: blk(prose), user });
const T = ['The scorched ledger', 'The bell at midnight', 'The cracked stone'];
let S = go(initState({ etnie: true }), [
  { op: 'replace', path: '/World/Location', value: 'Main Library' },
  { op: 'replace', path: '/Mysteries', value: { [T[0]]: { Status: 'open', Summary: 'Someone burnt pages of the dorm ledger.' }, [T[1]]: { Status: 'open', Summary: 'The bell rings at midnight with no ringer.' }, [T[2]]: { Status: 'cold', Summary: 'A crack in the Arbiter Stone.' } } },
  { op: 'replace', path: '/Clues', value: {
    'Burnt page': { Thread: T[0], Detail: 'Etnie found a burnt page under her bed.', Where: 'Fire Dormitory' },
    'Ash on the sill': { Thread: T[0], Detail: 'Ash on the window sill.', Where: 'Fire Dormitory' },
    'Rope fibres': { Thread: T[1], Detail: 'Fresh rope fibres on the stair.', Where: 'Bell Tower' },
    'Cold draft': { Thread: T[1], Detail: 'A cold draft behind the shelves.', Where: 'Main Library' },
    'Hairline crack': { Thread: T[2], Detail: 'A hairline crack, older than it looks.', Where: 'Arbiter Hall' } } },
  { op: 'replace', path: '/Extras', value: { 'Mara Quill': { Who: 'the night librarian', Looks: 'grey braid', Voice: 'whispers' }, 'Tobin Hale': { Who: 'a second-year who sells notes', Looks: 'ink on his cuffs', Voice: 'fast' } } },
  { op: 'replace', path: '/Campus_State/NPC_status', value: { Etnie: 'has a cold', Irene: 'away at the capital', Castor: 'suspended for a week' } },
  { op: 'replace', path: '/Campus_State/New_relations', value: { 'Etnie→Kanae': 'study partners', 'Castor→Zara': 'rivals' } },
  { op: 'replace', path: '/Campus_State/Secrets_revealed', value: ['Etnie.backstory', 'Castor.goal', 'Zara.plan'] },
]);
S = go(S, [{ op: 'replace', path: '/World/Time', value: '09:00' }]);   // nothing new this reply, nobody here

console.log('nobody here, nothing named');
{
  const F = S.$ui.now.focus;
  ok(F && F.th.length === 1 && F.th[0] === T[1], `only the thread with a clue at this place is in play (${JSON.stringify(F.th)})`);
  const r = renderEntry(card, 501, S);
  ok(/Cold draft:/.test(r) && /Rope fibres:/.test(r) && !/Burnt page:\n/.test(r), 'its clues in full (the whole thread), the others not');
  ok(/Clues_not_shown:\n\s+- The scorched ledger — Burnt page; Ash on the sill\n\s+- The cracked stone \(cold\) — 1 clue/.test(r), 'every other thread is one line: its clue names, a cold one its count');
  ok(/Extras_not_shown:\n\s+- Mara Quill \(the night librarian\)\n\s+- Tobin Hale \(a second-year who sells notes\)/.test(r) && !/grey braid/.test(r), 'Extras not here: name and who they are');
  ok(/NPC_status_not_shown: Etnie, Irene, Castor/.test(r) && /New_relations_not_shown: Etnie→Kanae, Castor→Zara/.test(r) && /Secrets_revealed_not_shown: 3 more on file/.test(r), 'status, relations and secrets as index lines');
  ok(/"…_not_shown" line indexes records on file/.test(r), 'the header says what an index line is');
}

console.log('people here, named, and a thread in the prose');
{
  const P = go(S, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' }, 'Mara Quill': { Note: '' } } }], 'Etnie whispers about Castor while Mara Quill shelves books.', 'I ask about the cracked stone.');
  const F = P.$ui.now.focus;
  ok(F.ids.includes('Etnie') && F.ids.includes('Castor') && F.x.includes('Mara Quill'), `the people here and named (${JSON.stringify(F.ids)}, ${JSON.stringify(F.x)})`);
  ok(F.th.includes(T[0]) && F.th.includes(T[2]), 'a thread tied to someone here, and one the player named, are in play');
  const r = renderEntry(card, 501, P);
  ok(/Burnt page:/.test(r) && /Hairline crack:/.test(r), 'their clues in full');
  ok(/Mara Quill:\n\s+Who: the night librarian/.test(r) && /Extras_not_shown:\n\s+- Tobin Hale/.test(r), 'an Extra here in full, the other by name');
  ok(!/Etnie: has a cold/.test(r) && /Castor: suspended for a week/.test(r) && /NPC_status_not_shown: Irene/.test(r), 'someone here: status in their sheet only; someone named: in full; the rest indexed');
  ok(/"Etnie→Kanae": study partners|Etnie→Kanae: study partners/.test(r) && /"Castor→Zara": rivals|Castor→Zara: rivals/.test(r), 'relations with someone here or named in full');
  ok(/Secrets_revealed:\n\s+- Castor\.goal/.test(r) && !/Etnie\.backstory/.test(r) && /Secrets_revealed_not_shown: 1 more on file/.test(r), 'secrets: named in full, here in the sheet, the rest a count');
  const sheet = renderEntry(card, card.data.character_book.entries.find(e => e.id >= 600 && e.id < 700 && /Etnie/.test(e.comment)).id, P);
  ok(/Status on record \(overrides the lore\): has a cold/.test(sheet), "the Cast Sheet prints the present person's status");
  const Q = applyPatch(P, [{ op: 'replace', path: '/World/Time', value: '09:30' }], { text: '' });
  ok(Q.$ui.now.focus.x.includes('Mara Quill') && Q.$ui.now.focus.tn.includes(T[2]), 'an update with no reply (a player tool) keeps the names from the last prose');
}

console.log('a new clue');
{
  const P = go(S, [{ op: 'replace', path: '/Clues/Scorch mark', value: { Thread: T[0], Detail: 'A scorch mark on the door.', Where: 'Gardens' } }]);
  ok(P.$ui.now.focus.th.includes(T[0]), 'a thread that got a clue this reply is in play');
}
