// 1.60.0: the narrator may change any fact of the lore for this campaign (Campus_State.Lore_changes), but only as a consequence of
// the story: the engine keeps a new or rewritten change only with a Cause and only when the reply shows it (stepLoreChanges). Kept
// changes are printed over the subject's lore entry (build_card), in a person's Cast Sheet, or in <current_state>; the player undoes.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const LCp = (k, v) => ({ op: 'replace', path: `/Campus_State/Lore_changes/${k}`, value: v });
const S0 = applyPatch(initState(), [{ op: 'replace', path: '/World/Time', value: '09:00' }]);
const LIB = { Now: 'The west wing collapsed in the duel; the reading rooms are closed for repairs.', Cause: "{{user}}'s duel with Caine wrecked it" };
const prose = 'Dust still hangs over the library. Half the west wing lies in the courtyard.';
const logHas = (S, rx) => (S._Log || []).some(l => rx.test(l));

console.log('Kept: caused by the story and shown in the reply');
const A = applyPatch(S0, [LCp('Main Library', LIB)], { text: prose });
{
  const r = A.Campus_State.Lore_changes['Main Library'];
  ok(r && r.Now === LIB.Now && r.Cause === LIB.Cause, 'the change is on record');
  ok(r && /^M\d+ W\d \w{3}$/.test(r.Since) && r.$uid === 56, `Since stamped (${r && r.Since}), its lore entry found (${r && r.$uid})`);
  ok(A.$ui.toasts.includes('The world changed: Main Library'), 'the player gets a toast');
  ok(A.Journal.some(l => /Main Library, changed for good: The west wing collapsed/.test(l)), 'a Journal line');
  const A2 = applyPatch(S0, [LCp('Main Library', LIB)], { text: prose });
  ok(JSON.stringify(A2.Campus_State.Lore_changes) === JSON.stringify(A.Campus_State.Lore_changes), 'replay-safe');
  const U = applyPatch(S0, [LCp('Main Library', LIB)], { text: 'Silence.', user: 'I walk back to the library to look at the damage.' });
  ok(U.Campus_State.Lore_changes['Main Library'], "the player's own message counts as the scene");
}

console.log('Refused: no cause, not shown, too many');
{
  const N = applyPatch(S0, [LCp('Main Library', { Now: LIB.Now })], { text: prose });
  ok(!N.Campus_State.Lore_changes['Main Library'] && logHas(N, /Lore change "Main Library" was not recorded: it has no Cause/), 'no Cause: refused, and the report says why');
  const O = applyPatch(S0, [LCp('Main Library', LIB)], { text: 'Etnie yawns over breakfast in the canteen.' });
  ok(!O.Campus_State.Lore_changes['Main Library'] && logHas(O, /this reply does not show it/), 'off-screen (not in the scene): refused');
  const W = applyPatch(S0, [LCp('Main Library', 'collapsed')], { text: prose });
  ok(!W.Campus_State.Lore_changes['Main Library'], 'a bare string is read as Now, and still needs a Cause');
  const M = applyPatch(S0, [LCp('Bell Tower', { Now: 'cracked', Cause: 'the duel' }), LCp('Gymnasium', { Now: 'flooded', Cause: 'the duel' }), LCp('Workshop', { Now: 'burnt', Cause: 'the duel' })],
    { text: 'The Bell Tower cracked, the Gymnasium flooded and the Workshop burnt.' });
  ok(Object.keys(M.Campus_State.Lore_changes).length === 2 && logHas(M, /at most 2 new changes a reply/), 'at most two new changes a reply');
}

console.log('A change on record: rewrites, removals, the player');
{
  const R1 = applyPatch(A, [LCp('Main Library', { ...LIB, Now: 'Rebuilt by the Groundskeeping club.' })], { text: 'Breakfast.' });
  ok(R1.Campus_State.Lore_changes['Main Library'].Now === LIB.Now, 'a rewrite the reply does not show is put back');
  const R2 = applyPatch(A, [LCp('Main Library', { Now: 'Rebuilt by the Groundskeeping club.', Cause: 'a month of repairs' })], { text: 'The library smells of fresh plaster.' });
  ok(R2.Campus_State.Lore_changes['Main Library'].Now === 'Rebuilt by the Groundskeeping club.', 'a rewrite the reply shows is kept');
  const D = applyPatch(A, [{ op: 'remove', path: '/Campus_State/Lore_changes/Main Library' }], { text: prose });
  ok(D.Campus_State.Lore_changes['Main Library'] && logHas(D, /stays on record: only the player removes/), "the narrator's removal is put back");
  const C = applyPatch(A, [LCp('main library', { ...LIB, Cause: 'x', Now: 'Burnt down.' })], { text: prose });
  ok(Object.keys(C.Campus_State.Lore_changes).length === 1 && C.Campus_State.Lore_changes['Main Library'].Now === 'Burnt down.', 'a subject in another case is the change on record');
  const L = { ...A.Campus_State.Lore_changes }; delete L['Main Library'];
  const P = applyPatch(A, [{ op: 'replace', path: '/Campus_State/Lore_changes', value: L }, { op: 'replace', path: '/$eng/tool', value: 1 }]);
  ok(!P.Campus_State.Lore_changes['Main Library'], "the player's Undo (a player tool) removes it");
  const Q = applyPatch(A, [LCp('Main Library', { ...LIB, Cause: '' })], { text: prose });
  ok(Q.Campus_State.Lore_changes['Main Library'].Cause === LIB.Cause, 'the Cause of a kept change cannot be rewritten alone');
}

console.log('People and new subjects');
{
  const B = applyPatch(S0, [LCp('Baelin', { Now: 'Resigned as Headmaster; Althair is acting Headmaster.', Cause: "{{user}} exposed the ledger", Replace: true })],
    { text: 'The Headmaster’s office is empty; Baelin left at dawn.' });
  const r = B.Campus_State.Lore_changes.Baelin;
  ok(r && r.Replace === false && r.$uid === 113, "a person's lore is never replaced (Replace set back to false)");
  const N = applyPatch(S0, [LCp('Night Market', { Now: 'Students run a night market in the Courtyard on Fridays.', Cause: "{{user}}'s petition passed" })],
    { text: 'The first Night Market opens in the Courtyard.' });
  ok(N.Campus_State.Lore_changes['Night Market'].$uid === -1, 'a new subject (no lore entry) is kept with $uid -1');
  const t = renderEntry(card, 501, applyPatch(N, [LCp('Main Library', LIB)], { text: prose }));
  ok(/Lore_changes:\s*\n\s*Night Market: Students run a night market/.test(t), '<current_state>: a change with no entry in full');
  const cs = t.slice(t.indexOf('Campus_State:'), t.indexOf('\nJournal:'));
  ok(/Lore_changed_in_entries:\s*\n\s*- Main Library/.test(cs) && !/The west wing collapsed/.test(cs), '<current_state>: a change with an entry by name only (its lore has the words)');
}

console.log('Printed over the lore');
{
  const plain = renderEntry(card, 56, S0);
  ok(!/Changed in this campaign/.test(plain) && plain.length > 100, 'no change: the entry is its lore');
  const t = renderEntry(card, 56, A);
  ok(/^\[Changed in this campaign, M\d+ W\d \w{3}; this overrides the lore below\] Main Library: The west wing collapsed/m.test(t) && t.includes(plain.trim().slice(0, 60)), 'a change: printed first, the lore below');
  ok(/Changed in this campaign/.test(renderEntry(card, 280, A)), 'every entry with the name carries it (the Regulars entry too)');
  const R = applyPatch(A, [LCp('Main Library', { ...LIB, Now: 'Only a burnt shell remains.', Replace: true })], { text: prose });
  const tr = renderEntry(card, 56, R);
  ok(/this overrides the lore\] Main Library: Only a burnt shell remains/.test(tr) && !tr.includes(plain.trim().slice(0, 60)), 'Replace: the old lore is left out');
  const B = applyPatch(S0, [LCp('Baelin', { Now: 'Resigned as Headmaster.', Cause: 'the ledger' }), { op: 'replace', path: '/Scene/Present', value: { Baelin: { Note: '' } } }],
    { text: 'Baelin hands back his seal.' });
  ok(/\[Changed in this campaign, [^\]]+; this overrides the lore\] Resigned as Headmaster\./.test(renderEntry(card, 509, B)), "a person's Cast Sheet carries it");
  ok(/Changed in this campaign[^\n]*Baelin: Resigned/.test(renderEntry(card, 113, B)), 'and their lore entry');
}

console.log('Older saves and habits');
{
  const old = JSON.parse(JSON.stringify(S0));
  old.$eng.ver = '1.59.0'; old.Campus_State.Location_changes = { 'Reception and Gatehouse': 'a second checkpoint after the break-in' };
  const cur = JSON.parse(JSON.stringify(old));
  const M = applyPatch(old, [{ op: 'replace', path: '/Campus_State/Location_changes', value: cur.Campus_State.Location_changes }]);
  const r = M.Campus_State.Lore_changes['Reception and Gatehouse'];
  ok(r && r.Now === 'a second checkpoint after the break-in' && r.Cause === 'recorded before 1.60.0' && r.$uid === 84, 'a Location_changes record from before 1.60.0 becomes a Lore change');
  ok(JSON.stringify(M.Campus_State.Location_changes) === '{}', 'Location_changes is emptied');
  const H = applyPatch(S0, [{ op: 'replace', path: '/Campus_State/Location_changes/Gymnasium', value: 'flooded' }], { text: 'The Gymnasium is flooded.' });
  ok(!H.Campus_State.Lore_changes.Gymnasium && logHas(H, /Lore change "Gymnasium" was not recorded: it has no Cause/), 'the old habit (Location_changes) is read as a Lore change, Cause and all');
}

console.log('Rules');
{
  const t = renderEntry(card, 502, S0);
  ok(/Lore_changes \{"<subject>"[\s\S]*never on a whim or off-screen/.test(t) && !/Location_changes/.test(t), '502: the rule (story-caused, shown, forward only)');
  ok(/Lore change only once the story shows it/.test(rd('src/worldbook/custom/content/504.txt')), '504: off-screen news becomes a Lore change only once shown');
}
