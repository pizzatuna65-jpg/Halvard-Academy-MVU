// 1.77.0: a Lore change with Until is temporary: the engine parses its last day once, shows it wherever the change is printed and in
// the Planner, and ends it when that day is over (stepLoreChanges). <now> gets one "How {{user}} looks" line from what others can see
// of {{user}}: injuries, weather conditions, fatigue and lost sleep (nowOf → $ui.now.looks, printed by 505).
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const card = JSON.parse(require('fs').readFileSync(require('path').join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8'));
const LCp = (k, v) => ({ op: 'replace', path: `/Campus_State/Lore_changes/${k}`, value: v });
const at = (Day, Time) => [{ op: 'replace', path: '/World/Day', value: Day }, { op: 'replace', path: '/World/Time', value: Time }];
const S0 = applyPatch(initState(), at('Mon', '09:00'));   // a jump to Tuesday would count as a night awake (lost sleep)
const LIB = { Now: 'The reading rooms are closed while the roof is repaired.', Cause: "the storm tore the slates off", Until: 'M1 W1 Thu' };
const prose = 'Rope barriers block the library doors; slates litter the steps.';
const logHas = (S, rx) => (S._Log || []).some(l => rx.test(l));

console.log('A temporary change');
const A = applyPatch(S0, [LCp('Main Library', LIB)], { text: prose });
{
  const r = A.Campus_State.Lore_changes['Main Library'];
  ok(r && r.Until === 'M1 W1 Thu' && r.$abs > 0, `kept with its last day, parsed once ($abs ${r && r.$abs})`);
  ok(A.Journal.some(l => /Main Library, changed until M1 W1 Thu: The reading rooms/.test(l)), 'the Journal says until when');
  ok((A.$ui.agenda || []).some(x => x.k === 'lore' && /last day changed: Main Library/.test(x.t)), 'the Planner feed shows its last day');
  ok(/Changed in this campaign, M\d+ W\d \w{3}, until M1 W1 Thu; this overrides the lore below\] Main Library/.test(renderEntry(card, 56, A)), 'printed over the lore with its end');
  const T = applyPatch(S0, [LCp('Main Library', { ...LIB, Until: 'Thursday' })], { text: prose });
  ok(T.Campus_State.Lore_changes['Main Library'].Until === 'M1 W1 Thu', 'a weekday is written back as a calendar date');
  const N = applyPatch(S0, [LCp('Main Library', { ...LIB, Until: 'when it is fixed' })], { text: prose });
  ok(!N.Campus_State.Lore_changes['Main Library'] && logHas(N, /Until "when it is fixed" is not a date/), 'an Until that is no date: refused, and the report says why');
  const P = applyPatch(applyPatch(S0, at('Fri', '09:00')), [LCp('Main Library', { ...LIB, Until: 'M1 W1 Wed' })], { text: prose });
  ok(!P.Campus_State.Lore_changes['Main Library'] && logHas(P, /has already passed/), 'an Until already past: refused');
}

console.log('It ends after its last day');
{
  const Th = applyPatch(A, at('Thu', '22:00'), { text: 'Evening.' });
  ok(Th.Campus_State.Lore_changes['Main Library'], 'still on its last day');
  const F = applyPatch(Th, at('Fri', '08:00'), { text: 'Morning.' });
  ok(!F.Campus_State.Lore_changes['Main Library'], 'gone the morning after');
  ok(F.Journal.some(l => /Main Library, as it was again: the change until M1 W1 Thu is over/.test(l)) && F.$ui.toasts.includes('As it was again: Main Library'), 'a Journal line and a toast');
  const K = applyPatch(A, [LCp('Main Library', { Now: LIB.Now, Cause: LIB.Cause })], { text: prose });
  ok(K.Campus_State.Lore_changes['Main Library'].$abs === -1 && !K.Campus_State.Lore_changes['Main Library'].Until, 'Until taken out in a shown rewrite: lasting again');
  const R = applyPatch(A, [LCp('Main Library', { ...LIB, Until: 'M1 W2 Mon' })], { text: 'Breakfast.' });
  ok(R.Campus_State.Lore_changes['Main Library'].Until === 'M1 W1 Thu', 'a longer Until the reply does not show is put back');
  const L = applyPatch(S0, [LCp('Main Library', { Now: LIB.Now, Cause: LIB.Cause })], { text: prose });
  ok(applyPatch(L, at('Sun', '09:00'), { text: 'Sunday.' }).Campus_State.Lore_changes['Main Library'], 'a lasting change never ends');
}

console.log('How {{user}} looks');
{
  ok(!S0.$ui.now.looks, 'nothing to see: no line');
  const H = applyPatch(S0, [{ op: 'replace', path: '/Player/Injuries/Sprained wrist', value: { Severity: 'moderate', Body_part: 'left arm', Effect: 'cannot grip', Heals_by: 'M1 W2 Mon' } },
    { op: 'replace', path: '/Player/Conditions/Soaked', value: { Effect: 'wet' } }, { op: 'replace', path: '/Player/Vitals/Stamina', value: 25 }]);
  const l = H.$ui.now.looks || '';
  ok(/^How \{\{user\}\} looks \(anyone near can see it/.test(l), `the line (${l})`);
  ok(/Sprained wrist \(moderate, left arm\)/.test(l) && /wet through/.test(l) && /visibly exhausted/.test(l), 'injury with severity and place, the condition, fatigue');
  ok(renderEntry(card, 505, H).includes(l), '<now> prints it');
  const W = applyPatch(S0, [{ op: 'replace', path: '/Player/Injuries/Cut on the left hand', value: { Severity: 'minor', Body_part: 'left hand', Effect: 'stings' } }]);
  ok(/Cut on the left hand \(minor\)/.test(W.$ui.now.looks || ''), 'a body part already in the name is not repeated');
}
