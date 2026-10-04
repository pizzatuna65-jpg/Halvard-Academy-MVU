// 1.53.0 (audit/AUDIT_2026-10-04_1_beban_narator.md §6, batch 1): quick narrator-load fixes. T6 the first-pact rule reaches the Occult
// student who needs it; U4 the 503 example and a short Analysis; U5 plain dates written back as calendar dates, the calendar and new bonds
// left to the engine; U6 one "the engine does these" list; U7 deed pairs and the remedial by presence; T10; Journal dates once.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const go = (S, w, x = []) => applyPatch(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })).concat(x));
const S0 = go(initState({ etnie: true }), { Location: 'Fire Dormitory', Time: '09:00' });
const occ = S => { const X = _.cloneDeep(S); X.Magic._Affinity = { ...(X.Magic._Affinity || {}), Types: ['Occult'], Dominant: 'Occult' }; return X; };

console.log('T6 the first pact');
{
  const r = S => renderEntry(card, 502, S);
  ok(/A first Spirit Pact in play is made only at the Spirit Path/.test(r(occ(S0))), 'an Occult student with no pact sees the first-pact line (1.54.0: the full rule is a card at the Spirit Path)');
  ok(!/A first (Spirit )?[Pp]act in play/.test(r(S0)), 'a student without Occult magic does not');
  const done = occ(S0); done.$eng.pactPlay = 'Pip';
  ok(!/A first (Spirit )?[Pp]act in play/.test(r(done)) && !/- Pacts \(/.test(r(done)), 'after a pact made in play the first-pact rule is gone');
}

console.log('U4 / U6 the format and the engine list');
{
  const f503 = rd('src/worldbook/custom/content/503.txt'), r = renderEntry(card, 502, S0);
  ok(!/Points: current/.test(f503) && /at most 3 short lines/.test(f503), '503: no Points sum, at most 3 Analysis lines');
  ok(/"Kind": "student_notice_help"/.test(f503) && !/"Rep": "Student", "XP"/.test(f503), '503: a named deed, not the legacy form');
  ok(/\/Bonds\/Irene\/Known_facts\/-/.test(f503) && !/"Rank": 0/.test(f503), '503: a bond fact, never a whole bond record');
  ok(/"Due": "tomorrow 16:00"/.test(f503), '503: a plain date');
  ok(/The engine does these; never write them yourself: .*stamina from walks, weather and conditions/.test(r), '502: one engine list, weather stamina in it');
  ok(!/never add it yourself|Never add the bonus yourself|never write a decrease yourself/.test(r), '502: the scattered "never add it" lines are gone');
  ok(!/Sun → Mon means Week \+1/.test(r) && /the engine turns the week, month and year/.test(r), '502: no calendar rollover to compute');
}

console.log('U5 plain dates become calendar dates');
{
  const A = go(S0, { Time: '09:10' }, [{ op: 'insert', path: '/Commitments/Study', value: { Desc: '', Due: 'tomorrow 16:00', With: 'Etnie', Where: 'Main Library', Type: 'appointment' } },
    { op: 'insert', path: '/Commitments/Lunch', value: { Desc: '', Due: 'tomorrow after class', With: '', Where: '', Type: 'promise' } },
    { op: 'insert', path: '/Commitments/Fixed', value: { Desc: '', Due: 'M1 W2 Fri 18:00', With: '', Where: '', Type: 'promise' } }]);
  const d = S0.World, nx = { Mon: 'Tue', Tue: 'Wed', Wed: 'Thu', Thu: 'Fri', Fri: 'Sat', Sat: 'Sun' }[d.Day];
  ok(nx && A.Commitments.Study.Due === `M${d.Month} W${d.Week} ${nx} 16:00`, `"tomorrow 16:00" is written back as a date (${A.Commitments.Study.Due})`);
  ok(A.Commitments.Lunch.Due === `M${d.Month} W${d.Week} ${nx} after class`, `other words stay (${A.Commitments.Lunch.Due})`);
  ok(A.Commitments.Fixed.Due === 'M1 W2 Fri 18:00', 'a calendar date is left as written');
  const B = go(A, { Time: '20:00' });
  ok(B.Commitments.Study.$abs === A.Commitments.Study.$abs && B.Commitments.Study.Due === A.Commitments.Study.Due, 'the date holds on later turns');
  const H = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Player/Injuries', value: { 'Sprained wrist': { Severity: 'minor', Body_part: 'wrist', Effect: 'x', Heals_by: 'in two days' } } }]);
  ok(/^M\d+ W\d [A-Z][a-z]{2}$/.test(H.Player.Injuries['Sprained wrist'].Heals_by), `Heals_by too (${H.Player.Injuries['Sprained wrist'].Heals_by})`);
  const T = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Player/Injuries', value: { Cut: { Severity: 'minor', Body_part: 'hand', Effect: 'x', Heals_by: 'treatment' } } }]);
  ok(T.Player.Injuries.Cut.Heals_by === 'treatment', 'a Heals_by with no date is left alone');
}

console.log('U5 a new bond from a fact');
{
  const I = go(S0, { Time: '09:10' }, [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: '' } } }, { op: 'insert', path: '/Bonds/Irene/Known_facts/-', value: 'Strict about rules' }]);
  ok(I.Bonds.Irene && I.Bonds.Irene.Known_facts.includes('Strict about rules') && I.Bonds.Irene.Rank === 0, 'the fact starts the bond; the engine fills the rest');
}

console.log('U7 deed pairs and the remedial');
{
  const xp = S => S.Player.Profile.Reputation.$xp || {};
  const R = go(S0, { Time: '09:10' }, [{ op: 'insert', path: '/Rep_events/-', value: { Kind: 'reported_student_to_staff', Why: 'told Layla about the fight' } }]);
  ok(xp(R).Student === -5 && xp(R).Academy === 3, `a report to staff: Student -5 and the engine's helped_staff_report, Academy +3 (${JSON.stringify(xp(R))})`);
  const both = go(S0, { Time: '09:10' }, [{ op: 'insert', path: '/Rep_events/-', value: { Kind: 'reported_student_to_staff', Why: 'a' } }, { op: 'insert', path: '/Rep_events/-', value: { Kind: 'helped_staff_report', Why: 'a' } }]);
  ok(JSON.stringify(xp(both)) === JSON.stringify(xp(R)), 'both sides reported: counted once');
  const rem = _.cloneDeep(go(S0, { Time: '09:20' }));
  rem.$eng.study = { ...(rem.$eng.study || {}), rem: { 'Remedial History': 'Y1M3' }, marks: { Y1M3: { History: 0 } }, stand: { History: 0 } };
  const due = `M${rem.World.Month} W${rem.World.Week} ${rem.World.Day} 10:00`;
  rem.Commitments = { 'Remedial History': { Desc: 'Make-up', Due: due, With: 'Layla', Where: 'Main Library', Type: 'appointment' } };
  const r0 = go(rem, { Time: '09:30' }), there = go(go(r0, { Time: '09:50', Location: 'Main Library' }), { Time: '10:30' });
  ok(!there.Commitments['Remedial History'] && there.$eng.study.marks.Y1M3.History === 1, 'at the Main Library in its first three hours: attended, the F counts as D');
  const away = go(go(r0, { Time: '09:50', Location: 'Canteen' }), { Time: '10:30' });
  ok(away.Commitments['Remedial History'] && away.$eng.study.marks.Y1M3.History === 0, 'elsewhere: it waits for the narrator');
}

console.log('T10 and the Journal dates');
{
  ok(!/on\('class'\)/.test(rd('src/worldbook/custom/content/504.txt')), '504: the empty class gate is gone');
  const X = _.cloneDeep(S0); X.$ui.cast = { ...(X.$ui.cast || {}), xnew: ['Mara Holt'] };
  ok(/Seen before, with no Extras record yet: Mara Holt/.test(renderEntry(card, 505, X)) && !/Seen before/.test(renderEntry(card, 509, X)), 'the Extras request is in <now>, not the [mvu_plot] Cast Sheet');
  const J = _.cloneDeep(S0), w = `M${J.World.Month} W${J.World.Week} ${J.World.Day}`; J.Journal = [`[${w}] one`, `[${w}] two`];
  const line = (renderEntry(card, 505, J).match(/Journal dates[^\n]*/) || [''])[0];
  ok(line.split(w).length - 1 <= 1, `each Journal date once (${line})`);
}
