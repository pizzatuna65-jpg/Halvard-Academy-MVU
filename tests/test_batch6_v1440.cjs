// 1.44.0 (audit batch 6): the Agenda (one date marker, one status, one reminder, one coming-up feed), information (a heard rumour
// or story pinned as a Clue; Encyclopaedic files one real lead a week) and competition results (reputation, its price, team bonds).
const fs = require('fs'), path = require('path'), ejs = require('ejs'), _ = require('lodash');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { fromAbs, agendaState };')();
const now = S => ejs.render(read('src/worldbook/custom/content/505.txt'), { getvar: k => _.get({ stat_data: S }, k) });
const DAY = 1440;
const at = (S, d, hhmm, loc, extra = []) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * DAY + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : []), ...extra]); };
const later = (S, mins, loc, extra = []) => { const a = S.$eng.abs + mins, T = E.fromAbs(a); return at(S, Math.floor(a / DAY), T.Time, loc, extra); };
const day = (m, w, d) => (m - 1) * 28 + (w - 1) * 7 + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(d);
const S0 = initState({ etnie: true });

console.log('Agenda: one status');
ok(E.agendaState(-1, 100, 'commitment') === '' && E.agendaState(200, 100, 'commitment') === 'waiting' && E.agendaState(120, 100, 'commitment') === 'due'
  && E.agendaState(99, 100, 'commitment') === 'overdue' && E.agendaState(100 + 1440, 100, 'project') === 'due' && E.agendaState(100 - 60, 100, 'notice') === 'due',
  'waiting / due / overdue by kind: an appointment is due 30 min ahead, a project a day ahead, a notice until an hour after its last day');

console.log('Agenda: Next plans are anchored');
{
  let S = at(S0, day(2, 1, 'Mon'), '10:00', 'Canteen');
  S = applyPatch(S, [{ op: 'replace', path: '/Bonds/Etnie/Next', value: { What: 'meeting her pack', Where: 'Viridian Dormitory', Until: 'tomorrow evening' } }]);
  const a0 = S.$eng.agenda.when['n:Etnie'][1];
  S = later(S, 600, 'Canteen');
  ok(S.$eng.agenda.when['n:Etnie'][1] === a0, '"tomorrow evening" keeps its first date (it used to move a day on every turn)');
  S = later(S, 1440, 'Canteen');
  ok(!S.Bonds.Etnie.Next && S.Bonds.Etnie.$Recent.some(r => /\(Off-screen\) meeting her pack/.test(r.n)) && !S.$eng.agenda.when['n:Etnie'], 'once it is past, the plan happened off-screen and its date is dropped');
}

console.log('Agenda: reminders and the feed');
{
  let S = at(S0, day(2, 1, 'Mon'), '09:00', 'Canteen');
  S = applyPatch(S, [{ op: 'insert', path: '/Commitments/Tea with Etnie', value: { Desc: 'tea', Due: 'today 15:00', With: 'Etnie', Type: 'appointment' } },
    { op: 'insert', path: '/Projects/Herb press', value: { Kind: 'craft', Goal: 'a herb press', Progress: 20, Due: 'M2 W1 Wed' } },
    { op: 'insert', path: '/Notices/Lost cat', value: { Text: 'grey cat', By: 'a first-year', Until: 'M2 W1 Fri' } }]);
  const A = S.$ui.agenda, f = k => A.find(x => x.k === k);
  ok(f('commitment') && f('commitment').t === 'Tea with Etnie' && f('commitment').at === '15:00' && f('commitment').w === 'Etnie' && f('commitment').s === 'waiting', 'the appointment is in the feed, timed, with whom');
  ok(f('project') && f('project').d === 2 && f('notice') && f('notice').t === 'last day: Lost cat' && f('notice').d === 4, 'the project due date and the notice\'s last day too');
  ok(A.some(x => x.k === 'event') && A.every((x, i) => !i || A[i - 1].d <= x.d), 'academy events in the same feed, by day');
  S = later(S, 120, 'Canteen');   // 11:00: classes and the appointment, the sooner first
  S = at(S, day(2, 1, 'Mon'), '14:00', 'Canteen');
  ok(S.$ui.next && S.$ui.next.kind === 'plan' && S.$ui.next.at === '15:00' && S.$ui.next.what === 'Tea with Etnie', 'the bracelet\'s Next chip: the appointment at 15:00 comes before the next class');
  S = at(S, day(2, 1, 'Mon'), '15:30', 'Canteen');
  ok(S.Commitments['Tea with Etnie']._Late && S._Log.filter(l => /"Tea with Etnie" is overdue/.test(l)).length === 1, 'overdue: one reminder');
  S = later(S, 30, 'Canteen');
  ok(S._Log.filter(l => /"Tea with Etnie" is overdue/.test(l)).length === 1, '... and not again (_Log keeps the earlier line)');
  ok(/Due soon: Tea with Etnie \(OVERDUE, with Etnie\)/.test(now(S)), '<now> Due soon reads the feed');
  S = at(S, day(2, 1, 'Tue'), '00:30', 'Canteen');
  ok(S._Log.some(l => /Project "Herb press" is due tomorrow \(Progress 20%\)/.test(l)) && /Herb press due \(tomorrow\)/.test(now(S)), 'a project a day ahead: reminded once, and in <now>');
  S = at(S, day(2, 1, 'Thu'), '09:00', 'Canteen');
  ok(S._Log.some(l => /Project "Herb press" was due M2 W1 Wed and is not finished/.test(l)) && S.$ui.toasts.includes('Overdue: Herb press'), 'a project past its date: reminded once, with a toast');
  S = applyPatch(S, [{ op: 'replace', path: '/Projects/Herb press/Progress', value: 100 }]);
  ok(!S.$ui.agenda.some(x => x.k === 'project') && !S.$eng.agenda.when['p:Herb press'], 'a finished project leaves the Agenda');
}

console.log('Agenda: the letter home and the player\'s own dates');
{
  let S = at(S0, day(2, 1, 'Mon'), '10:00', 'Mail Tower');
  S = applyPatch(S, [{ op: 'insert', path: '/Letters/To Mother', value: { From: '{{user}}', To: 'Mother', Gist: 'all is well', Status: 'sent' } },
    { op: 'replace', path: '/$ui/marks', value: { 'Y1 M2 W1 Thu': 'Ask Gareth to spar' } }]);
  ok(S.$ui.agenda.some(x => x.k === 'letter' && /^Reply from Mother expected$/.test(x.t)) && S.$ui.agenda.some(x => x.k === 'note' && x.t === 'Ask Gareth to spar' && x.d === 3),
    'the reply from home is expected, and the calendar note is in the feed');
}

console.log('Information: a rumour or a story pinned as a clue');
{
  const TOOL = { op: 'replace', path: '/$eng/tool', value: 1 };
  let S = at(S0, day(2, 1, 'Mon'), '10:00', 'Canteen', [{ op: 'replace', path: '/Campus_State/Rumours', value: ['The east ward hums at night'] }]);
  ok(S.$ui.unlocks.includes('mystery'), 'a rumour going around opens the Mystery Board (it can be pinned there)');
  S = applyPatch(S, [{ op: 'replace', path: '/Clues/Rumour: The east ward hums at night', value: { Thread: 'Unsorted clues', Detail: 'The east ward hums at night', Where: '', Links: [], Source: 'rumour' } }, TOOL]);
  const C = S.Clues['Rumour: The east ward hums at night'];
  ok(C && C.Source === 'rumour' && C.Found && S.Mysteries['Unsorted clues'] && S.$ui.toasts.includes('New clue: Rumour: The east ward hums at night'), 'the player tool pins it: Source rumour, dated, on its thread');
  ok(applyPatch(S, [{ op: 'replace', path: '/Clues/X', value: { Detail: 'y', Source: 'gossip' } }]).Clues.X.Source === '', 'Source is only rumour, story or records');

  console.log('Information: Encyclopaedic files one real lead a week');
  S = applyPatch(S, [{ op: 'replace', path: '/$eng/prof/xp/Knowledge', value: 150 }]);
  S = at(S, day(2, 1, 'Mon'), '13:00', 'Main Library');
  ok(S.Player._Proficiency.Knowledge === 5 && S.$ui.mastery && S.$ui.mastery.lead && !Object.keys(S.Clues).some(k => /^Records/.test(k)), 'walking in: the lead is open, nothing filed yet');
  S = later(S, 90, 'Main Library');
  const R = S.Clues['Records: Rumour: The east ward hums at night'];
  ok(R && R.Source === 'records' && R.Thread === 'Unsorted clues' && R.Where === 'The Main Library' && S._Log.some(l => /Encyclopaedic: digging in the Main Library turned up this week's real lead on "Rumour: The east ward hums at night"/.test(l)),
    'a reply spent there: the engine files the lead on the pinned rumour, for the narrator to reveal');
  ok(!S.$ui.mastery.lead, 'the week\'s lead is used');
  S = later(S, 90, 'Main Library');
  ok(Object.keys(S.Clues).filter(k => /^Records/.test(k)).length === 1, 'one a week');
  S = at(S, day(2, 2, 'Mon'), '13:00', 'Main Library');
  S = later(S, 60, 'Main Library', [{ op: 'insert', path: '/Clues/Old ledger', value: { Thread: 'The east ward', Detail: 'a ledger of ward repairs', Where: 'Main Library' } }]);
  ok(S.Clues['Old ledger'].Source === 'records' && S._Log.some(l => /"Old ledger" is this week's real lead/.test(l)) && Object.keys(S.Clues).filter(k => /^Records/.test(k)).length === 1,
    'next week a clue the story adds there is the lead itself');
}

console.log('Competition: reputation, its price, and the team');
{
  const xp = S => S.Player.Profile.Reputation.$xp.Academy;
  let S = at(S0, day(3, 2, 'Mon'), '10:00', 'Arbiter Hall');
  const x0 = xp(S);
  S = applyPatch(S, [{ op: 'replace', path: '/Competition', value: { Tier: 'Dorm', Status: 'qualified', Placement: '2nd of 12, Defense bracket', Team: ['Etnie'], Results: [] } }]);
  ok(xp(S) === x0 + 5 && S._Log.some(l => /Dorm Competition qualified: Academy reputation \+5/.test(l)), 'qualifying from the Dorm tier pays its deed (+5) by itself');
  ok(S._Log.some(l => /Etnie fought beside \{\{user\}\} in the Dorm Competition: \+5 bond XP/.test(l)), 'the teammate gains bond XP');
  S = applyPatch(S, [{ op: 'replace', path: '/Competition/Status', value: 'champion' }, { op: 'insert', path: '/Rep_events/-', value: { Kind: 'dorm_competition_qualified' } }]);
  ok(xp(S) === x0 + 5 && S._Log.some(l => /"dorm_competition_qualified" is paid by the engine/.test(l)), 'never twice a year, and a narrator report of it is not counted');
  ok(S._Log.filter(l => /fought beside/.test(l)).length === 1, 'team bond XP once a tier');
  S = applyPatch(S, [{ op: 'replace', path: '/Competition', value: { Tier: 'Academy', Status: 'champion', Placement: '1st', Team: ['Etnie'], Results: [] } }]);
  ok(xp(S) === x0 + 20 && S.$eng.comp.exp && S.$eng.comp.exp.tier === 'Academy' && S._Log.some(l => /Academy title: the staff now expect/.test(l)), 'the Academy title (+15), and the staff now expect a defence');
  S = applyPatch(S, [{ op: 'replace', path: '/Competition', value: { Tier: 'Kingdom', Status: 'eliminated', Placement: '', Team: ['Etnie'], Results: [] } }]);
  ok(xp(S) === x0 + 20 && S.$eng.comp.exp, 'losing a tier above the title costs nothing');
  S = applyPatch(S, [{ op: 'replace', path: '/Competition', value: { Tier: 'Dorm', Status: 'eliminated', Placement: '', Team: [], Results: [] } }]);
  ok(xp(S) === x0 + 15 && !S.$eng.comp.exp && S._Log.some(l => /Eliminated after the Academy title: the staff expected more. Academy reputation -5/.test(l)), 'the next elimination at or below the title tier: Academy -5, then the expectation is spent');
}
