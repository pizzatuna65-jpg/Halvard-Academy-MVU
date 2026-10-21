// 1.75.0 (owner-approved planning/DRAFT_club_sendiri.md): the club {{user}} founds is a club like any other. Founding (a teacher who
// answers for no club, five members with {{user}}, a room), founded_club paid once, students who move leave their lore club (a Lore
// change), the followers, Saturday time at the venue and its Field, presence, the routine week, and the migration of an older save.
// Engine stepGuards / stepFounding / stepReputation, shared.js foundedClub / presenceAt; tools/common.py load_clubs advisors.
const { Schema, runEngine, initState, applyPatch, ok } = require('./harness.cjs');
const op = (p, value) => ({ op: 'replace', path: p, value });
const at = (S, W, ops = [], o = {}) => applyPatch(S, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], o);
const FC = S => S.Campus_State.Founded_club;
const logged = (S, rx) => (S._Log || []).some(l => rx.test(l));
const stu = S => S.Player.Profile.Reputation.$xp.Student;

console.log('Starting a club');
let S = initState();
S = at(S, { Month: 2, Week: 1, Day: 'Mon', Time: '16:30', Location: 'Club Rooms' }, [op('/Player/Profile/Dorm', 'Fire'), op('/Player/Profile/Club', 'Card Club')]);
S = at(S, { Time: '16:40' }, [op('/Player/Profile/Club', 'Stargazing Club')]);
ok(S.Player.Profile.Club === 'Card Club' && FC(S).Name === 'Stargazing Club' && FC(S).Status === 'forming',
  'a club not on record is one {{user}} founds: Founded_club starts, and {{user}} stays in the Card Club until it is founded');
ok(logged(S, /not a club yet: \{\{user\}\} is founding it/), 'the narrator is told so');
ok(FC(S).Members.includes('Etnie') && !FC(S).Members.includes('Topaz'), 'the "whichever club" students follow by themselves (Topaz arrives in Year 3)');
ok(FC(S).Field === 'Society', 'a name with no field word: Society');

console.log('The signature');
S = at(S, { Time: '16:50' }, [op('/Campus_State/Founded_club/Advisor', 'Gavlan')]);
ok(!FC(S).Advisor && logged(S, /Gavlan cannot sign for the Stargazing Club: they already answer for the Magic Duelling Club/), 'a teacher with a club cannot sign');
S = at(S, { Time: '16:55' }, [op('/Campus_State/Founded_club/Advisor', 'Headmaster Kalvor')]);
ok(!FC(S).Advisor && logged(S, /Baelin cannot sign .*not teaching staff/), 'the Headmaster is not teaching staff');
S = at(S, { Time: '17:00' }, [op('/Campus_State/Founded_club/Advisor', 'Professor Odile Marren')]);
ok(FC(S).Advisor === 'Professor Odile Marren', 'a teacher the narrator introduces signs');

console.log('Members and the room');
S = at(S, { Time: '17:05' }, [op('/Campus_State/Founded_club/Members', [...FC(S).Members, 'Aiden'])]);
ok(!FC(S).Members.includes('Aiden') && logged(S, /Aiden did not join the Stargazing Club: they are not in this reply/), 'a student joins only on screen');
S = at(S, { Time: '17:10' }, [op('/Campus_State/Founded_club/Members', [...FC(S).Members, 'Aiden', 'Gavlan'])], { text: 'Aiden signs the sheet with a flourish.' });
ok(FC(S).Members.includes('Aiden') && !FC(S).Members.includes('Gavlan'), 'named in the reply he joins; a teacher is no member');
S = at(S, { Time: '17:15' }, [op('/Campus_State/Founded_club/Venue', 'Fire Dormitory')]);
ok(!FC(S).Venue && logged(S, /not a campus place a club can meet in/), 'no room in a dormitory');
ok(FC(S).Status === 'forming' && S.Player.Profile.Club === 'Card Club', 'three of five, no room: still forming');
const x0 = stu(S);
S = at(S, { Time: '17:20' }, [op('/Campus_State/Founded_club/Venue', 'Club Rooms'), op('/Campus_State/Founded_club/Field', 'arcana'),
  op('/Scene/Present', { Gareth: { Note: '' }, Zara: { Note: '' } }), op('/Campus_State/Founded_club/Members', [...FC(S).Members, 'Gareth', 'Zara']),
  { op: 'insert', path: '/Rep_events/-', value: { Kind: 'founded_club', Why: 'founded a club' } }]);
ok(FC(S).Status === 'founded' && FC(S).Since === 'M2 W1 Mon' && S.Player.Profile.Club === 'Stargazing Club' && FC(S).Field === 'Arcana',
  'five with {{user}}, a signature and a room: founded, and {{user}} is in it');
ok(stu(S) - x0 === 8 && logged(S, /"founded_club" is paid by the engine/), 'founded_club +8 once, paid by the engine, not by the report');
ok(S.Journal.some(j => /Founded the Stargazing Club \(Club Rooms, advisor Professor Odile Marren\)/.test(j)) && S.Journal.some(j => /Joined the Stargazing Club/.test(j)), 'the Journal');
const L = S.Campus_State.Lore_changes;
ok(/Left the Card Club for \{\{user\}\}'s Stargazing Club \(M2 W1 Mon\)\./.test((L.Aiden || {}).Now) && /Left the Board Game Club/.test((L.Gareth || {}).Now) && /Left the Tailoring Club/.test((L.Zara || {}).Now) && !L.Etnie,
  'Aiden, Gareth and Zara left their clubs (a Lore change on their entries); a follower needs none');

console.log('A club like any other');
S = at(S, { Time: '17:30' }, [op('/Campus_State/Founded_club/Name', 'Comet Club')]);
ok(FC(S).Name === 'Stargazing Club' && logged(S, /keeps its name/), 'a founded club keeps its name');
S = at(S, { Week: 1, Day: 'Sat', Time: '13:00', Location: 'Club Rooms' }, [op('/Scene/Present', {})]);
const here = (JSON.stringify(S.$ui.now || {}).match(/Club time: ([^"]*)/) || [])[1] || '';
ok(/Stargazing Club: meeting here until 16:00 \(members on record: [^)]*Aiden/.test(here) && !/Card Club: [^;]*Aiden/.test(here), 'Saturday: its members meet at its room, Aiden no longer at the Card Club');
const s0 = stu(S), a0 = S.$eng.prof.xp.Arcana;
S = at(S, { Time: '15:30' });
ok(stu(S) - s0 === 1 && S.$eng.prof.xp.Arcana - a0 === 1, 'Saturday time at its room: +1 Student and +1 Arcana (its Field)');
ok(!logged(S, /not a club on record/), 'no "not on record" line any more');
S = at(S, { Week: 2, Day: 'Mon', Time: '10:00' }, [op('/Campus_State/Founded_club/Members', FC(S).Members.filter(m => m !== 'Aiden'))]);
ok(!S.Campus_State.Lore_changes.Aiden && S.Journal.some(j => /Aiden left the Stargazing Club/.test(j)), 'Aiden leaves: back in his lore club, the change lifted');

console.log('Migration of an older save');
let M = initState();
M.Player.Profile.Club = 'Chess Club'; M.$eng.ver = '1.74.0';
M = Schema.parse(M); runEngine(M); M = Schema.parse(M);
ok(FC(M).Name === 'Chess Club' && FC(M).Status === 'founded' && M.Player.Profile.Club === 'Chess Club' && M.$eng.founded === true,
  'a club founded in the story before 1.75.0 is on record as founded; no reputation paid again');

console.log('The panels');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const fs = require('fs'), path = require('path');
const U = new Function(fs.readFileSync(path.join(__dirname, '../src/scripts/ui.js'), 'utf8') + '\nreturn { acClubs, clubsNow, graphModel, view, locCard, PANELS };')();
let A = initState();
A = at(A, { Month: 2, Week: 1, Day: 'Mon', Time: '16:30', Location: 'Club Rooms' }, [op('/Player/Profile/Dorm', 'Fire'), op('/Player/Profile/Club', 'Stargazing Club')]);
let h = U.acClubs(A);
ok(/Stargazing Club<\/span><span class="pill w">founding/.test(h) && /Members: 2\/5/.test(h) && /data-ffield="Arcana"/.test(h), 'forming: the checklist and the Field buttons');
A = at(A, { Time: '17:00' }, [op('/Campus_State/Founded_club/Advisor', 'Professor Odile Marren'), op('/Campus_State/Founded_club/Venue', 'Club Rooms'),
  op('/Scene/Present', { Gareth: { Note: '' }, Zara: { Note: '' }, Aiden: { Note: '' } }), op('/Campus_State/Founded_club/Members', ['Gareth', 'Zara', 'Aiden'])]);
h = U.acClubs(A);
ok(/<span class="t">Stargazing Club<\/span><span class="pill g">your club/.test(h) && /founded by you M2 W1 Mon · trains Society/.test(h) && /Professor Odile Marren \(advisor\)/.test(h) && /data-open="npc:Gareth"/.test(h),
  'founded: {{user}}\'s club card with room, Field, the invented advisor and the members');
ok(!U.clubsNow(A).find(c => c.name === 'Card Club').members.includes('Aiden'), 'Aiden is no longer listed in the Card Club');
U.view.gtypes = new Set(); U.view.ggroups = new Set(['club']);
const G = U.graphModel(A);
ok(G.links.some(l => l.source === 'grp:club:Stargazing' && l.target === 'Gareth') && !G.nodes.some(n => n.id === 'Professor Odile Marren'), 'the graph: its members, no invented advisor node');
