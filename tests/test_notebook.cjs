// Batch 5.1 UI: notebook tabs gated by unlocks, planner/calendar/timetable, notices, letters composer text, mystery board.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
const U = new Function(src + '\nreturn { DATA, PANELS, view, CAL, officialNotices, dayIdx, dayOf, datedItems };')();
console.log('Notebook panel');
ok(U.CAL.EVENTS.length > 30 && U.CAL.TIMETABLE.Mon.length === 3, 'calendar + timetable injected from the engine');
let S = initState();
let h = U.PANELS.notebook.render(S);
ok(/data-nb="planner"/.test(h) && /data-nb="journal"/.test(h) && !/data-nb="letters"/.test(h) && !/data-nb="mystery"/.test(h), 'fresh chat: only Planner + Journal tabs');
ok(/Entrance Event/.test(h) && /class="cur"|Timetable suspended|No classes|class="off ev"/.test(h), 'planner shows today\'s event in the week table');
S = applyPatch(S, [
  { op: 'replace', path: '/World/Time', value: '09:00' }, { op: 'replace', path: '/World/Location', value: 'Canteen' },
  { op: 'insert', path: '/Commitments/Tea with Etnie', value: { Desc: 'Promised tea', Due: 'Tue 16:00', With: 'Etnie', Where: 'Gardens', Type: 'promise' } },
  { op: 'insert', path: '/Commitments/Report to the Council', value: { Due: 'M1 W1 Mon 08:30', With: 'Irene', Type: 'appointment' } },
  { op: 'insert', path: '/Notices/Library shift open', value: { Text: 'Evening shift, 30 pts a night. Ask at the desk.', By: 'Main Library', Until: 'M1 W2 Sun' } },
  { op: 'insert', path: '/Letters/From home', value: { From: 'Mother', Gist: 'Proud of you', Status: 'waiting' } },
  { op: 'insert', path: '/Letters/Note from Etnie', value: { From: 'Etnie', Gist: 'Meet me at the Gardens, little one!', Status: 'read' } },
  { op: 'insert', path: '/Clues/Scorched ledger', value: { Thread: 'Missing ledgers', Detail: 'A burnt page in the bin', Where: "The Warden's Office", Links: ['Irene', 'Rei', 'Main Library'] } },
  { op: 'insert', path: '/Journal/-', value: 'Etnie dragged me to breakfast before the sorting.' },
]);
U.view.nb = 'planner'; h = U.PANELS.notebook.render(S);
ok(/data-nb="letters"/.test(h) && /data-nb="notices"/.test(h) && /data-nb="mystery"/.test(h), 'letters / notices / mystery tabs unlocked');
ok(/<i class="nbb bad">1<\/i>/.test(h) && /<i class="nbb">1<\/i>/.test(h), 'badges: 1 overdue, 1 waiting letter');
ok(h.indexOf('Report to the Council') < h.indexOf('Tea with Etnie') && /pill f">overdue/.test(h), 'commitments sorted by due, overdue marked');
ok(/data-go="gardens"/.test(h), 'commitment with Where offers Go here');
ok(/data-open="npc:Etnie"/.test(h), 'With -> dossier link');
U.view.calOff = 1; h = U.PANELS.notebook.render(S); ok(/Calendar: Month 2/.test(h) && /Warding Rite/.test(h), 'calendar next month'); U.view.calOff = 0;
U.view.arg = 'notices'; h = U.PANELS.notebook.render(S);
ok(U.view.nb === 'notices' && /Library shift open/.test(h) && /class="note off"/.test(h), 'open("notebook:notices") lands on the board; official + pinned notices');
ok(U.officialNotices(S).some(o => /Star Night/.test(o.t)) === false && U.officialNotices(S).length >= 1, 'official postings window');
U.view.nb = 'letters'; h = U.PANELS.notebook.render(S);
ok(/Go and collect/.test(h) && !/Proud of you/.test(h), 'waiting letter stays sealed');
ok(/data-reply="Etnie"/.test(h) && /Meet me at the Gardens/.test(h), 'read letter shows gist + reply');
ok(U.PANELS.notebook.live === false, 'letters tab is not live-refreshed (keeps the draft)');
U.view.nb = 'mystery'; h = U.PANELS.notebook.render(S);
ok(/Missing ledgers/.test(h) && /Scorched ledger/.test(h) && /Follow up/.test(h), 'mystery board thread + clue');
ok(/<span class="pill">Main Library<\/span>/.test(h), 'place link shown as place');
U.view.nb = 'journal'; h = U.PANELS.notebook.render(S);
ok(/Month 1/.test(h) && /Etnie dragged me/.test(h), 'journal grouped by month');
fs.writeFileSync(path.join(ROOT, 'tests/preview/sample_b5.json'), JSON.stringify(S));
// 1.2.0: interactive calendar: player notes, dated state items, birthday
{
  const C = applyPatch(S, [{ op: 'replace', path: '/$ui/marks', value: { 'Y1 M1 W2 Wed': 'Ask Gareth to spar' } },
    { op: 'replace', path: '/Player/Profile/Birthday', value: 'M1 W3 Fri' },
    { op: 'insert', path: '/Projects/Potion essay', value: { Kind: 'assignment', Goal: 'x', Progress: 20, Due: 'M1 W2 Thu' } }]);
  const D = U.datedItems(C);
  ok(D['Y1 M1 W2 Wed'].some(x => x.k === 'note' && /Gareth/.test(x.t)) && D['Y1 M1 W3 Fri'].some(x => x.k === 'birthday') && D['Y1 M1 W2 Thu'].some(x => x.k === 'project'), 'dated items: note, birthday, project due');
  ok(Object.values(D).flat().some(x => x.k === 'promise' && /Tea with Etnie/.test(x.t)), 'a promise (commitment) lands on its day');
  U.view.nb = 'planner'; U.view.calOff = 0; U.view.calSel = 'Y1 M1 W2 Wed'; U.view.markText = 'Ask Gareth to spar';
  const hc = U.PANELS.notebook.render(C);
  ok(/data-calday="Y1 M1 W2 Wed"/.test(hc) && /✎ Ask Gareth to spar/.test(hc) && /data-act="savemark"/.test(hc) && /data-act="delmark"/.test(hc), 'calendar days are buttons; the selected day shows its note editor');
  ok(/Your birthday/.test(hc), 'the birthday shows under Coming up');
  U.view.calSel = '';
}
