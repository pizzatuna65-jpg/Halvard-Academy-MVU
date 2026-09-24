// Batch 5.1: commitments (_When/_Late), notices (stamp/expire/cap), letters (direction/toast/cap), clues + mysteries, journal.
const { initState, applyPatch, ok } = require('./harness.cjs');
console.log('Conditional modules (engine)');
let S = initState();
ok(Array.isArray(S.Journal) && /^\[M1 W1 Mon\]/.test(S.Journal[0]), 'initvar journal entry is dated');
ok(!S.$ui.unlocks.includes('notices') && !S.$ui.unlocks.includes('letters'), 'notices/letters locked at the Gatehouse');

// commitments
S = applyPatch(S, [
  { op: 'insert', path: '/Commitments/Tea with Etnie', value: { Desc: 'Promised tea', Due: 'M1 W1 Mon 16:00', With: 'Etnie', Where: 'Canteen', Type: 'promise' } },
  { op: 'insert', path: '/Commitments/Essay', value: { Desc: 'History essay', Due: 'Fri', Type: 'assignment' } },
  { op: 'insert', path: '/Commitments/Vague', value: { Desc: 'someday', Due: 'soon-ish', Type: 'promise' } },
  { op: 'replace', path: '/World/Time', value: '08:00' },
]);
const C = S.Commitments;
ok(C['Tea with Etnie']._When === 'today 16:00' && !C['Tea with Etnie']._Late, `today: "${C['Tea with Etnie']._When}"`);
ok(/^in 4 days \(Fri\)$/.test(C.Essay._When), `weekday only -> next Fri: "${C.Essay._When}"`);
ok(C.Vague._When === '' && C.Vague.$abs === -1, 'unparseable due -> no tracking');
ok(S.$ui.unlocks.includes('planner'), 'planner unlocked by a commitment');
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '16:30' }]);
ok(S.Commitments['Tea with Etnie']._Late && S.Commitments['Tea with Etnie']._When === 'overdue', 'turns overdue after the due time');
ok(S._Log.some(l => /"Tea with Etnie" is overdue/.test(l)) && S.$ui.toasts.includes('Overdue: Tea with Etnie'), 'overdue logged + toast');
const nLog = S._Log.length;
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '16:45' }]);
ok(S._Log.length === nLog, 'overdue is logged only once');
S = applyPatch(S, [{ op: 'replace', path: '/Commitments/Tea with Etnie/Due', value: 'tomorrow 4pm' }]);
ok(!S.Commitments['Tea with Etnie']._Late && S.Commitments['Tea with Etnie']._When === 'tomorrow 16:00', 'rescheduled: "tomorrow 4pm" parsed');
S = applyPatch(S, [{ op: 'replace', path: '/Commitments/Essay/_Late', value: true }, { op: 'replace', path: '/World/Time', value: '17:00' }]);
ok(!S.Commitments.Essay._Late, 'AI cannot set _Late');
S = applyPatch(S, [{ op: 'insert', path: '/Commitments/Council', value: { Due: 'Month 2 Week 1', Type: 'appointment' } }]);
ok(/^M2 W1 Sun$/.test(S.Commitments.Council._When), `month+week -> Sunday of that week: "${S.Commitments.Council._When}"`);

// notices
S = applyPatch(S, [{ op: 'replace', path: '/World/Location', value: 'Lecture Halls' }]);
ok(S.$ui.unlocks.includes('notices'), 'notices unlocked on entering the castle');
S = applyPatch(S, [
  { op: 'insert', path: '/Notices/Library shift open', value: { Text: 'Evening shift, 30 pts', By: 'Main Library', Until: 'M1 W1 Tue' } },
]);
ok(S.Notices['Library shift open'].Posted === 'M1 W1 Mon' && S.$ui.toasts.includes('New notice: Library shift open'), 'notice stamped + toast');
S = applyPatch(S, [{ op: 'replace', path: '/World/Day', value: 'Wed' }, { op: 'replace', path: '/World/Time', value: '09:00' }]);
ok(!S.Notices['Library shift open'], 'expired notice removed');
const many = Array.from({ length: 12 }, (_, i) => ({ op: 'insert', path: `/Notices/N${i}`, value: 'x' }));
S = applyPatch(S, many);
ok(Object.keys(S.Notices).length === 10 && !S.Notices.N0 && S.Notices.N11 && S.Notices.N11.Text === 'x', 'notices capped at 10, bare string wrapped');

// letters
S = applyPatch(S, [{ op: 'insert', path: '/Letters/From home', value: { From: 'Mother', To: '{{user}}', Gist: 'Proud of you; send word', Status: 'waiting' } }]);
ok(S.$ui.unlocks.includes('letters') && S.Letters['From home'].Date === 'M1 W1 Wed', 'letters unlocked, dated');
ok(S.$ui.toasts.some(t => /Letter waiting at the Mail Tower \(from Mother\)/.test(t)), 'waiting-letter toast');
S = applyPatch(S, [{ op: 'insert', path: '/Letters/Reply home', value: { From: '{{user}}', To: 'Mother', Gist: 'All well', Status: 'waiting' } }]);
ok(S.Letters['Reply home'].Status === 'sent', 'outgoing letter forced to "sent"');
S = applyPatch(S, [{ op: 'replace', path: '/Letters/From home/Status', value: 'READ' }]);
ok(S.Letters['From home'].Status === 'read', 'status normalised to lowercase');

// clues + mysteries + journal
S = applyPatch(S, [{ op: 'insert', path: '/Clues/Scorched ledger', value: { Thread: 'Missing ledgers', Detail: 'Burnt page in the Warden bin', Where: "The Warden's Office", Links: ['irene', 'Rei'] } }]);
ok(S.Clues['Scorched ledger'].Found === 'M1 W1 Wed' && S.Mysteries['Missing ledgers'].Status === 'open', 'clue dated, thread created');
ok(S.Clues['Scorched ledger'].Links.join() === 'Irene,Rei', 'links canonicalised to NPC ids');
ok(S.$ui.unlocks.includes('mystery'), 'mystery board unlocked by the first clue');
S = applyPatch(S, [{ op: 'insert', path: '/Clues/Loose note', value: 'A note with no thread' }]);
ok(S.Clues['Loose note'].Thread === 'Unsorted clues' && S.Clues['Loose note'].Detail === 'A note with no thread', 'bare clue -> Unsorted clues');
S = applyPatch(S, [{ op: 'replace', path: '/Mysteries/Missing ledgers', value: { Status: 'solved', Summary: 'Rei burned them' } },
  { op: 'insert', path: '/Campus_State/Secrets_revealed/-', value: 'Rei.plan' },
  { op: 'insert', path: '/Journal/-', value: 'Confronted the Acting Warden.' }]);
const J = S.Journal.join('\n');
ok(/\[M1 W1 Wed\] Confronted the Acting Warden\./.test(J), 'AI journal line dated');
ok(/Solved: Missing ledgers \(Rei burned them\)/.test(J) && /hidden truth about Rei \(plan\)/.test(J), 'engine journals solved mystery + revealed secret');
const before = S.Journal.length;
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:10' }]);
ok(S.Journal.length === before, 'no duplicate journal lines on a quiet update');
// sorting
S = applyPatch(S, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);
ok(/Sorted into the Fire Dormitory/.test(S.Journal.join()), 'sorting journaled');
// replay: same patch from the same before-state gives the same result
const B0 = JSON.parse(JSON.stringify(S));
const p = [{ op: 'insert', path: '/Letters/Parcel', value: { From: 'Uncle', Gist: 'Boots', Status: 'waiting' } }, { op: 'replace', path: '/World/Time', value: '10:00' }];
const r1 = applyPatch(B0, p), r2 = applyPatch(B0, p);
ok(JSON.stringify(r1) === JSON.stringify(r2), 'deterministic (swipe/replay safe)');
