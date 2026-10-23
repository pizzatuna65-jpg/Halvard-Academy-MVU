// 1.99.2 (audit/AUDIT_2026-10-23_2_audit_menyeluruh.md B3): one reading of a reply's prose (proseOf) everywhere the engine reads the
// story. The update block (closed or not, any case) and the preset's <npc_thoughts> block (closed or not) are not prose: a name or a
// story title that appears only there reveals no name ($ui.names), is no mention ($ui.cast.ment), makes no story heard ($ui.lore),
// and a time phrase there is no time skip.
const { initState, applyPatch, ok } = require('./harness.cjs');
console.log('Reply prose 1.99.2');
const meet = (S, time, text) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, { op: 'replace', path: '/World/Location', value: 'Main Courtyard' },
  { op: 'replace', path: '/Scene/Present', value: { Irene: { Note: '' } } }], { text });
const PROSE = 'Irene set the ledger down. "The east stair is closed until noon," she said, and went back to her reading.';

// ---- an update block that never closes (the reply was cut off), naming an NPC {{user}} has not met and a ghost story in a Hooks note
let S = meet(initState(), '09:00', `${PROSE}
<UpdateVariable>
<Analysis>Castor's absence stays a thread; the Faraway Laugh rumour waits for the park.</Analysis>
<JSONPatch>
[{"op":"replace","path":"/Bonds/Castor/Mind","value":"avoiding the courtyard"},
 {"op":"insert","path":"/Hooks/Park laugh","value":{"Note":"Castor heard the Faraway Laugh in Founder's Park","Kind":"secret"`);
ok(S.$ui.names.includes('Irene'), 'the prose still reveals Irene');
ok(!S.$ui.names.includes('Castor'), 'a name only in an unclosed update block reveals no name');
ok(!(S.$ui.cast.ment || []).includes('Castor'), 'a name only in an unclosed update block is no mention');
ok(!S.$ui.lore.includes('342'), 'a ghost story named only in a Hooks note of an unclosed block is not heard');

// ---- the preset's thoughts block, closed and unclosed
S = meet(initState(), '09:00', `${PROSE}
<npc_thoughts>
- **Irene**: Castor again. The Faraway Laugh is a story for first-years.
</npc_thoughts>
<UpdateVariable><JSONPatch>[]</JSONPatch></UpdateVariable>`);
ok(!S.$ui.names.includes('Castor') && !(S.$ui.cast.ment || []).includes('Castor'), 'a name only in <npc_thoughts> is no reveal and no mention');
ok(!S.$ui.lore.includes('342'), 'a story named only in <npc_thoughts> is not heard');
S = meet(initState(), '09:00', `${PROSE}
<npc_thoughts>
- **Irene**: Castor again.`);
ok(!S.$ui.names.includes('Castor') && !(S.$ui.cast.ment || []).includes('Castor'), 'an unclosed <npc_thoughts> block is not prose either');

// ---- a closed block in another case; the same names in the prose still count
S = meet(initState(), '09:00', `${PROSE}\n<updatevariable><JSONPatch>[{"op":"replace","path":"/Bonds/Castor/Mind","value":"x"}]</JSONPatch></updatevariable>`);
ok(!S.$ui.names.includes('Castor'), 'a lower-case update block is not prose');
S = meet(initState(), '09:00', `${PROSE} Nobody had seen Castor since the Faraway Laugh started up again.\n<UpdateVariable><JSONPatch>[]</JSONPatch></UpdateVariable>`);
ok(S.$ui.names.includes('Castor') && S.$ui.cast.ment.includes('Castor') && S.$ui.lore.includes('342'), 'named in the prose: revealed, mentioned and heard');

// ---- a time phrase only in an unclosed block is no time skip: a Day one back in the same week is a slip, the clock is kept
S = applyPatch(initState(), [{ op: 'replace', path: '/World/Day', value: 'Wed' }, { op: 'replace', path: '/World/Time', value: '10:00' }]);
S = applyPatch(S, [{ op: 'replace', path: '/World/Day', value: 'Tue' }, { op: 'replace', path: '/World/Time', value: '10:30' }],
  { text: `${PROSE}\n<UpdateVariable>\n<Analysis>The next morning comes after this scene.</Analysis>\n<JSONPatch>[{"op":"replace","path":"/World/Day","value":"Tue"}` });
ok(S._Log.some(l => /World\.Day went back from Wed to Tue/.test(l)), 'a Day slip with "the next morning" only in an unclosed block keeps the clock');
