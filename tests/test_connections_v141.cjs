// 1.4.1 (owner, DRAFT_connections.md): curated lines in seven kinds (no acquainted / romance / family), group label nodes for dorms,
// clubs and factions (a secret faction only after its secret is out), and dragged people stay where they are dropped.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { graphModel, groupsOf, view, DATA, EDGE, GROUP, peopleGraphHTML };')();
const CUR = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/relations_curated.json'), 'utf8'));
console.log('Connections 1.4.1');
const rel = (a, b) => U.DATA.rel.find(e => e[0] === a && e[1] === b);
ok(Object.keys(U.EDGE).join() === 'romance,friends,softspot,protective,respect,rivals,wary,dislike,story' && !U.DATA.rel.some(e => /knows|romance|family/.test(e[2])), 'seven kinds (+ story, + your own romance line since 1.4.2); no NPC romance or family lines');
ok(rel('Gavlan', 'Sophia')[2] === 'wary' && rel('Saffi', 'Lenna')[2] === 'friends' && rel('Sophia', 'Rei')[2] === 'respect' && rel('Kuroo', 'Tilly')[2] === 'wary' && rel('Royhan', 'Milena')[2] === 'friends',
  'the playtest oddities are fixed: Gavlan wary of Sophia, Saffi & Lenna friends, Sophia respects Rei, Kuroo wary of Tilly, Royhan & Milena friends');
ok(rel('Althair', 'Ezrel')[2] === 'softspot' && rel('Baelin', 'Althair')[2] === 'wary' && rel('Kuroo', 'Mimosa')[2] === 'protective' && rel('Kuroo', 'Mimosa')[4] === 'public', 'soft spot, wary allies (Baelin and Althair), a public mentor tie');
const cur = U.DATA.rel.filter(e => !e[6] && !(e[1] === 'Althair' && e[5][0] === CUR.disliked_by_all.Althair.note));   // 1.4.2 rule lines aside
const nLines = Object.values(CUR.edges).flatMap(v => [].concat(v)).filter(v => v !== 'drop').length;   // 1.6.10: a key can hold a list of lines
ok(cur.length === nLines && !rel('Mimosa', 'Irene'), `${cur.length} curated lines; passing facts dropped`);
ok(/new = \[f"\{a\}>\{b\}" for \(a, b\) in edges if/.test(fs.readFileSync(path.join(ROOT, 'tools/build_relations.py'), 'utf8')), 'the build refuses lines that were never curated');

// groups
let S = applyPatch(initState(), [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: '' }, Caspian: { Note: '' }, Ruby: { Note: '' }, Castor: { Note: '' }, Kuroo: { Note: '' } } },
  { op: 'replace', path: '/Player/Profile/Dorm', value: 'Sky' }]);
U.view.gtypes = new Set(Object.keys(U.EDGE)); U.view.ggroups = new Set();
ok(!U.graphModel(S).nodes.some(n => n.grp), 'groups are off by default');
U.view.ggroups = new Set(['dorm', 'faction', 'club']);
let G = U.graphModel(S);
const gl = id => G.links.filter(l => l.type === 'group' && l.source === id).map(l => l.target).sort().join();
ok(gl('grp:dorm:Sky') === 'Ruby,__you' && gl('grp:dorm:Viridian') === 'Caspian,Castor,Kuroo', `dorms: Sky (you, Ruby), Viridian (Caspian, Castor and the Dorm Head Kuroo): ${gl('grp:dorm:Sky')} / ${gl('grp:dorm:Viridian')}`);
ok(gl('grp:faction:council') === 'Caspian,Irene' && gl('grp:faction:staff') === 'Kuroo' && !G.nodes.some(n => n.id === 'grp:faction:choir'), 'factions: Student Council, staff; the Morning Choir stays hidden');
ok(!G.nodes.some(n => n.id.startsWith('grp:club:')), '1.6.11: at Rank 0 no one\'s club shows yet (the Club field opens at Rank 1)');
const S1 = JSON.parse(JSON.stringify(S)); for (const id of Object.keys(S1.Bonds)) S1.Bonds[id].Rank = 1;
ok(U.graphModel(S1).nodes.some(n => n.id.startsWith('grp:club:')), 'clubs appear for members you have met, from Rank 1');
const S2 = applyPatch(S, [{ op: 'insert', path: '/Campus_State/Secrets_revealed/-', value: 'Castor.cult' }]);
ok(U.graphModel(S2).links.some(l => l.source === 'grp:faction:choir' && l.target === 'Castor'), "once Castor's cult secret is out, he shows in the Morning Choir");
ok(/data-ggroup="dorm"/.test(U.peopleGraphHTML(S)) && /Groups:/.test(U.peopleGraphHTML(S)), 'group chips');

// drag: a dropped person stays (fixed position remembered for the panel)
U.view.gpos = { Ruby: { x: 111, y: -77 } };
G = U.graphModel(S);
const src = fs.readFileSync(path.join(ROOT, 'src/ui/parts/10_people.js'), 'utf8');
ok(/if \(!d\.you\) \(view\.gpos = view\.gpos \|\| \{\}\)\[d\.id\] = \{ x: d\.fx, y: d\.fy \}/.test(src) && !/d\.fx = null; d\.fy = null; \} \}\)\)/.test(src), 'drag end keeps the node fixed where it was dropped (no release back into the pull)');
ok(/n\.x = n\.fx = p\.x; n\.y = n\.fy = p\.y/.test(src) && /on\('dblclick'/.test(src), 'dropped positions are restored on redraw; double-click lets go');
