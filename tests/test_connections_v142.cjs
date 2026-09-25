// 1.4.2 (owner): directed lines (A → B, one arrow; a view both share is one plain line), everyone at Halvard dislikes Althair
// one way (he dislikes no one), your own Romance line (empty until a bond turns romantic), and group-rule lines (Caine and every
// mage from his Hates field, views of the Doves from the Doves field) that open with the field and reach only people you have met.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { graphModel, view, DATA, EDGE, PANELS, peopleGraphHTML, knowsName };')();
console.log('Connections 1.4.2');
const rel = (a, b) => U.DATA.rel.find(e => e[0] === a && e[1] === b);
const npcs = Object.keys(U.DATA.npcs), halvard = npcs.filter(id => !['Althair', 'Baelin', 'Ezrel'].includes(id) && !/team$/.test(U.DATA.npcs[id].g));

// Althair
ok(halvard.every(id => (rel(id, 'Althair') || [])[2] === 'dislike'), `all ${halvard.length} Halvard people dislike Althair`);
ok(!U.DATA.rel.some(e => e[0] === 'Althair' && e[2] === 'dislike') && !rel('Althair', 'Krieg') && rel('Althair', 'Ezrel')[2] === 'softspot', 'Althair dislikes no one (his soft spots stay)');
ok(!rel('Elion', 'Althair'), 'rival-academy teams are left out');
ok(rel('Baelin', 'Althair')[2] === 'wary' && rel('Ezrel', 'Althair')[2] === 'softspot', 'owner: Baelin (wary) and Ezrel (soft spot) do not dislike him');
ok(/Althair Veyne adores him/.test(rel('Ezrel', 'Althair')[5][0]) && rel('Gareth', 'Althair')[4] === 'rank:5', 'lore notes stay; a line without lore opens at Rank 5');

// direction
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
let S = applyPatch(initState(), [meet(['Gareth', 'Althair', 'Gavlan', 'Caine', 'Irene', 'Krieg', 'Milena', 'Bobby', 'Kuroo'])]);
for (const id of ['Gareth', 'Gavlan', 'Caine', 'Kuroo', 'Althair']) S.Bonds[id].Rank = 6;
U.view.gtypes = new Set(Object.keys(U.EDGE)); U.view.ggroups = new Set();
let G = U.graphModel(S);
const L = (a, b) => G.links.find(l => l.source === a && l.target === b);
ok(L('Gareth', 'Althair') && L('Gareth', 'Althair').arrow && !L('Althair', 'Gareth'), 'Gareth → Althair: one line, arrow at Althair');
ok(L('Gareth', 'Gavlan') && L('Gareth', 'Gavlan').both && !L('Gareth', 'Gavlan').arrow && !L('Gavlan', 'Gareth'),'a view both share (Gavlan and Gareth) is one line with no arrow');
ok(L('Althair', 'Kuroo').arrow && L('Althair', 'Kuroo').bend && L('Kuroo', 'Althair').bend && L('Kuroo', 'Althair').type === 'dislike', 'two different views of a pair: two arrows that bow apart');
const src = fs.readFileSync(path.join(ROOT, 'src/ui/parts/10_people.js'), 'utf8');
ok(/marker-end', d => \(d\.arrow \?/.test(src) && /'eg-arw-' \+ k/.test(src), 'arrowheads drawn at the To end, in the line colour');

// group rules
const caine = U.DATA.rel.filter(e => e[0] === 'Caine' && e[6] && e[6][0] === 'caine_mages');
ok(caine.length > 40 && caine.every(e => e[2] === 'dislike' && e[4] === 'rank:3') && !rel('Caine', 'Bobby') && rel('Caine', 'Kuroo')[2] === 'wary', `Caine dislikes ${caine.length} mages from Rank 3 (not Bobby; curated lines win: Kuroo stays wary)`);
ok(rel('Gavlan', 'Milena')[2] === 'dislike' && rel('Gavlan', 'Milena')[6][0] === 'doves' && rel('Percival', 'Krieg')[2] === 'respect' && rel('Vallie', 'Krieg')[2] === 'dislike' && !rel('Etnie', 'Krieg'),
  'Doves: haters dislike, admirers respect (Vallie keeps her Krieg exception), neutral = no line');
ok(!L('Caine', 'Sophia') && L('Caine', 'Irene') && L('Caine', 'Irene').type === 'dislike', 'rule lines reach only people you have met');
S.Bonds.Caine.Rank = 2; G = U.graphModel(S);
ok(!L('Caine', 'Irene'), 'and open with the field (Hates, Rank 3)');
S.Bonds.Caine.Rank = 6;
const Sc = applyPatch(initState(), [meet(['Caine'])]); Sc.Bonds.Caine.Rank = 6;
ok(!U.knowsName('Sophia', Sc) && !U.knowsName('Pip', Sc), 'a rule line does not teach anyone\'s name');
U.view.arg = 'Caine'; const dos = U.PANELS.npc.render(S);
ok(/<b>Mages<\/b> <span class="sub">\(\d+ people\)/.test(dos) && (dos.match(/data-open="npc:/g) || []).length < 20, 'the dossier lists the mages as one row');

// romance
ok(/data-gtype="romance"/.test(U.peopleGraphHTML(S)) && /none yet/.test(U.peopleGraphHTML(S)) && /at bond Rank 8/.test(U.peopleGraphHTML(S)), 'Romance chip is there, empty, and says when it opens');
ok(!G.links.some(l => l.type === 'romance'), 'no romance line yet');
S.Bonds.Irene.Rank = 8; S.Bonds.Irene.Romance = true; G = U.graphModel(S);
ok(G.links.some(l => l.type === 'romance' && l.source === '__you' && l.target === 'Irene') && !G.links.some(l => l.type === 'bond' && l.target === 'Irene'), 'a romance at Rank 8 turns your line to Irene into a Romance line');
ok(!/none yet/.test(U.peopleGraphHTML(S)), 'the chip is no longer empty');
U.view.gtypes.delete('romance'); G = U.graphModel(S);
ok(G.links.some(l => l.type === 'bond' && l.target === 'Irene'), 'Romance switched off: a plain bond line again');

// your own line takes a kind from the bond (data/bond_rules.json you_line)
U.view.gtypes = new Set(Object.keys(U.EDGE));
const Y = applyPatch(initState(), [meet(['Sophia', 'Ruby', 'Gareth', 'Irene', 'Caspian', 'Percival'])]);
Object.assign(Y.Bonds.Sophia, { Rank: 4, Tension: 75 }); Object.assign(Y.Bonds.Ruby, { Rank: 5, Trust: 80, Tension: 0 });
Object.assign(Y.Bonds.Gareth, { Rank: 8, Title: 'Sworn rival' }); Object.assign(Y.Bonds.Irene, { Rank: 3, Trust: 20, Tension: 0 });
Object.assign(Y.Bonds.Caspian, { Rank: 2, Tension: 45 }); Object.assign(Y.Bonds.Percival, { Rank: 2, Trust: 50, Tension: 0 });
G = U.graphModel(Y);
const mine = id => G.links.find(l => l.mine && [l.source, l.target].includes(id));
ok(mine('Sophia').type === 'dislike' && mine('Sophia').source === 'Sophia' && mine('Sophia').target === '__you' && mine('Sophia').arrow, 'Tension 75: Sophia → you, dislike');
ok(mine('Caspian').type === 'wary' && mine('Caspian').arrow && mine('Irene').type === 'wary' && mine('Irene').source === 'Irene', 'Tension 45 or Trust 20: wary of you');
ok(mine('Ruby').type === 'friends' && mine('Ruby').source === '__you' && !mine('Ruby').arrow, 'Rank 5 and Trust 80: friends, shared');
ok(mine('Gareth').type === 'rivals' && !mine('Gareth').arrow, 'a "Sworn rival" title: rivals');
ok(mine('Percival').type === 'bond', 'nothing special: the plain gold bond line');
ok(/data-gtype="dislike"/.test(U.peopleGraphHTML(Y)) && /data-gtype="friends"/.test(U.peopleGraphHTML(Y)), 'your own lines bring their chips');
U.view.gtypes.delete('dislike'); ok(U.graphModel(Y).links.find(l => l.mine && l.target === 'Sophia').type === 'bond', 'Dislike switched off: Sophia is a plain bond line again');
U.view.gtypes = new Set(Object.keys(U.EDGE));

// one-way love: Etnie (her Loves field) and Kanae (a secret on the Plan / her true feelings) → you, until you romance them
U.view.gtypes.add('romance');
let E = applyPatch(initState(), [meet(['Etnie', 'Kanae'])]);
G = U.graphModel(E);
ok(G.links.some(l => l.source === 'Etnie' && l.target === '__you' && l.type === 'romance' && l.arrow && l.bend), 'Etnie → you: a Romance arrow once her Loves field is known (she starts at Rank 3)');
ok(!G.links.some(l => l.source === 'Kanae' && l.type === 'romance'), 'Kanae hides it: no arrow before a secret comes out');
E = applyPatch(E, [{ op: 'insert', path: '/Campus_State/Secrets_revealed/-', value: 'Kanae.plan' }]);
ok(U.graphModel(E).links.some(l => l.source === 'Kanae' && l.target === '__you' && l.type === 'romance'), 'Kanae.plan revealed: Kanae → you');
ok(!/none yet/.test(U.peopleGraphHTML(E)), 'the Romance chip counts them');
ok(/distance\(d => d\.rank != null \? 120 - d\.rank \* 5/.test(src) && /d\.mine \? 2\.2 \+ d\.rank \* 0\.45 : d\.type === 'romance' \? 2\.2 :/.test(src), 'a line with no rank (their arrow to you) never gives the layout NaN (browser preview: Etnie and Kanae vanished)');
E.Bonds.Etnie.Rank = 8; E.Bonds.Etnie.Romance = true; G = U.graphModel(E);
ok(!G.links.some(l => l.source === 'Etnie' && l.type === 'romance') && G.links.some(l => l.source === '__you' && l.target === 'Etnie' && l.type === 'romance' && !l.arrow), 'a romance with Etnie at Rank 8: one shared line, no arrow');
