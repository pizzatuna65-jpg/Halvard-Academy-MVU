// 1.99.9 (owner playtest 2026-10-23: at Rank 0 Trixie and Caralynn named what they love in the Mall, though Loves opens at Rank 1).
// The Bond line listed Loves as held back, but the full sheet printed "Loves: …" and "Gifts: loves Sweets." below it. Now the engine
// hands the held fields to the sheet ($ui.now.held, not the ways they behave) and the sheet tags each one at its own line, the gift
// line included; the tag goes when the rank opens the field.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, renderEntry, ok, ROOT } = require('./harness.cjs');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const T = (S, time, ops) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...ops]);
const meet = (id, v) => [{ op: 'replace', path: '/Scene/Present', value: { [id]: { Note: '' } } }, { op: 'insert', path: '/Bonds/' + id, value: v }];
const sheet = S => renderEntry(card, 509, S, null, { lastUserMessage: '' });

console.log('Held fields tagged in the sheet 1.99.9');
let S = T(initState(), '09:00', meet('Trixie', { Rank: 0 }));
const H = ((S.$ui.now || {}).held || {}).Trixie || {};
ok(H.Loves === 1 && H.Hates === 1 && H.Doves === 2 && !('Personality' in H) && !('Emotional tells' in H) && !('Goals' in H), 'the engine holds Loves, Hates (Rank 1) and Doves (Rank 2), not Personality or Emotional tells, and not her Goals (hers to tell)');
let t = sheet(S);
ok(/^Loves \[not told yet: Rank 1\]: /m.test(t) && /^Hates \[not told yet: Rank 1\]: /m.test(t), 'Trixie at Rank 0: her Loves and Hates lines carry the tag');
ok(/^Gifts \[not told yet: Rank 1; they only react when given one\]: loves /m.test(t), 'the gift line carries it too');
ok(/^Goals: /m.test(t) && /^Personality: /m.test(t), 'her Goals and Personality lines are untagged');
S.Bonds.Trixie.Rank = 1; S = T(S, '09:10', []); t = sheet(S);
ok(/^Loves: /m.test(t) && /^Gifts: loves /m.test(t) && /^Doves \[not told yet: Rank 2\]: /m.test(t), 'Rank 1: Loves and the gift line open, Doves still waits for Rank 2');
// 1.99.10 (owner): the birthday was only in the dossier, so asked at Rank 1 the narrator had to invent a date
{
  let B = T(initState(), '09:00', meet('Trixie', { Rank: 0 }));
  const bd = (require(path.join(ROOT, 'data/npcs.json')).Trixie.fields.find(f => f.label === 'Birthday') || {}).text;
  ok(bd && sheet(B).includes(`Birthday [not told yet: Rank 1]: ${bd} (academy calendar)`), `Trixie's full sheet carries her birthday (${bd}), tagged at Rank 0`);
  B.Bonds.Trixie.Rank = 1; B = T(B, '09:10', []);
  ok(sheet(B).includes(`Birthday: ${bd} (academy calendar)`), 'Rank 1: the birthday is hers to tell, the same date the dossier shows');
}
const n = (t.match(/\[not told yet/g) || []).length;
ok(n > 0 && n <= 6, `Rank 1: few tags left (${n})`);
