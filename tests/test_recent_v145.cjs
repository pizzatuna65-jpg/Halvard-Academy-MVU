// 1.4.5 (owner): each bond keeps its latest 10 moments with {{user}} (Bonds.<id>.$Recent: when, one sentence, effect). The
// sentence is the narrator's Note on an interaction (else the kinds); quiet-day easing writes no row. The dossier shows them
// newest first; <now> gives the narrator the newest 5 for each present character. $Recent is hidden from the state dump.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view };')();
console.log('Recent history 1.4.5');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const day = (S, d, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Day', value: d }, { op: 'replace', path: '/World/Time', value: '12:00' }, ...extra]);
const IA = (With, Kind, Note) => ({ op: 'insert', path: '/Interactions/-', value: Note ? { With, Kind, Note } : { With, Kind } });
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const last = (S, id) => S.Bonds[id].$Recent[S.Bonds[id].$Recent.length - 1];

let S = T(initState(), '09:00', [meet(['Irene', 'Ruby', 'Etnie'])]);
ok(/^First met, at /.test(last(S, 'Irene').n) && last(S, 'Irene').w === 'M1 W1 Mon 09:00' && last(S, 'Irene').fx === '', 'first meeting is the first row');
ok(last(S, 'Etnie').fx === 'Bond starts at Rank 3', "Etnie's row says her bond starts at Rank 3");

S = T(S, '10:00', [IA('Irene', 'hangout', 'Studied together in the library; she corrected every one of my notes.')]);
ok(last(S, 'Irene').n === 'Studied together in the library; she corrected every one of my notes.' && last(S, 'Irene').fx === 'XP +3' && last(S, 'Irene').w === 'M1 W1 Mon 10:00', "the narrator's Note and the effect");
S = T(S, '11:00', [IA('Ruby', 'talk'), IA('Ruby', 'keep')]);
ok(last(S, 'Ruby').n === 'Talked, kept a promise.' && /XP \+2/.test(last(S, 'Ruby').fx) && /Trust \+6/.test(last(S, 'Ruby').fx), 'no Note: the kinds, and XP and Trust together');
S = T(S, '12:00', [IA('Irene', 'other', 'Told the Council about her late-night patrols.'), { op: 'replace', path: '/Bonds/Irene/Trust', value: S.Bonds.Irene.Trust - 12 }, { op: 'replace', path: '/Bonds/Irene/Tension', value: 10 }]);
ok(last(S, 'Irene').n === 'Told the Council about her late-night patrols.' && last(S, 'Irene').fx === 'Trust −15, Tension +10', 'a deed with kind "other": its Note, Trust −15 (guarded x1.25) and Tension +10');
const n0 = S.Bonds.Irene.$Recent.length;
S = day(S, 'Wed');
ok(S.Bonds.Irene.$Recent.length === n0 && S.Bonds.Irene.Tension < 10, 'quiet days ease Tension but write no row');
S = day(S, 'Thu', [{ op: 'replace', path: '/Bonds/Irene/Trust', value: S.Bonds.Irene.Trust - 4 }]);
ok(last(S, 'Irene').n === '(no note)' && /^Trust −5/.test(last(S, 'Irene').fx), 'a change written without a Note still gets a row (with the easing of the days since)');

// the cap: 10 rows, oldest out
for (let i = 0; i < 12; i++) S = T(S, `${String(13 + Math.floor(i / 6)).padStart(2, '0')}:${String((i % 6) * 10).padStart(2, '0')}`, [IA('Ruby', ['talk', 'hangout', 'help', 'gift', 'defend', 'confide'][i % 6], `Moment ${i + 1}.`)]);
ok(S.Bonds.Ruby.$Recent.length === 10 && S.Bonds.Ruby.$Recent[9].n === 'Moment 12.' && S.Bonds.Ruby.$Recent[0].n === 'Moment 3.', 'at most 10 rows, oldest dropped');

// hidden from the state dump, shown in <now> (5 newest, newest first) and the dossier (10, newest first)
const card = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/501.txt'), 'utf8');
ok(/format_message_variable::stat_data/.test(card) && Object.keys(S.Bonds.Ruby).includes('$Recent'), '$Recent is a $ field (Tavern Helper omits it from <current_state>)');
const now505 = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/505.txt'), 'utf8');
const nw = ejs.render(now505, { getvar: k => require('lodash').get({ stat_data: S }, k) });
const line = (nw.match(/Recent with \{\{user\}\}: Ruby[^\n]*/) || [''])[0];
ok(/^Recent with \{\{user\}\}: Ruby \(newest first\): \[M1 W1 Thu 14:50(, [a-z0-9 ]+)?\] Moment 12\./.test(line) && (line.match(/\[M1/g) || []).length === 5 && !/Moment 7\./.test(line), '<now>: the 5 newest, newest first');
ok(/Recent with \{\{user\}\}: Irene[^\n]*Told the Council about her late-night patrols\. \(Trust −15, Tension \+10\)/.test(nw), '<now>: the note and its effect');
U.view.arg = 'Ruby';
const dos = U.PANELS.npc.render(S);
const rows = dos.split('<table class="rt">')[1] || '';
ok(/<h3>Recent with you<\/h3>/.test(dos) && (rows.match(/<tr>/g) || []).length === 11 && rows.indexOf('Moment 12.') < rows.indexOf('Moment 11.'), 'dossier: a table of 10, newest on top');
ok(/<span class="up">XP \+\d+<\/span>/.test(rows), 'dossier: effects coloured');
const rules = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/502.txt'), 'utf8');
ok(/Add "Note": one short sentence of what happened between them/.test(rules) && /"Kind": "other", "Note"/.test(rules), 'rule 502 asks for the Note');
