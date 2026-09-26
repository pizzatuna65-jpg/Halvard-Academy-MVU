// 1.6.10 (owner): a Connections line is how one person sees another, whoever's file tells it. "Her Dorm Head, Kuroo, has
// started pushing it" in Etnie's file is Kuroo's view of Etnie, not hers of him (relations_curated.json '<type'); the line still
// opens with the bond of the person whose file tells it ('rank:N@Via'), and a note is that person's side, not the other's.
// A 1.6.9 save loads with nothing lost.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('Connections 1.6.10');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { graphModel, view, DATA, EDGE, PANELS, knowsName };')();
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const R = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const rels = U.DATA.rel.filter(e => !e[6]);
const has = (a, b, t) => rels.some(e => e[0] === a && e[1] === b && (!t || e[2] === t));
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });

// ---- the owner's three examples
ok(has('Kuroo', 'Etnie', 'protective') && !has('Etnie', 'Kuroo'), 'Kuroo -> Etnie protective, one way (the sentence in Etnie\'s file is Kuroo\'s doing)');
ok(has('Kuroo', 'Mimosa', 'protective') && !has('Mimosa', 'Kuroo'), 'Kuroo -> Mimosa protective, one way');
ok(has('Gavlan', 'Gareth', 'protective') && !has('Gareth', 'Gavlan'), 'Gavlan -> Gareth protective, one way (both files describe Gavlan\'s view)');
let S = applyPatch(initState(), [meet(['Kuroo', 'Mimosa', 'Etnie', 'Gavlan', 'Gareth'])]);
U.view.gtypes = new Set(Object.keys(U.EDGE)); U.view.ggroups = new Set();
let G = U.graphModel(S);
const L = (a, b) => G.links.find(l => l.source === a && l.target === b);
ok(['Kuroo>Etnie', 'Kuroo>Mimosa', 'Gavlan>Gareth'].every(k => { const l = L(...k.split('>')); return l && l.arrow && !l.both; }) && !L('Etnie', 'Kuroo') && !L('Mimosa', 'Kuroo') && !L('Gareth', 'Gavlan'),
  'the graph draws three one-way arrows (public lines, everyone met)');
ok(L('Kuroo', 'Mimosa').notes.every(x => x.src === 'Kuroo' && !/imitating/.test(x.note)) && L('Kuroo', 'Mimosa').notes.some(x => /absorbs her anxiety/.test(x.note)),
  'Kuroo\'s side says what Kuroo does; Mimosa\'s imitation habit is no longer shown as a side of it');

// ---- a turned line opens with the bond of the person whose file tells it
const ce = rels.filter(e => e[0] === 'Caspian' && e[1] === 'Etnie');
ok(ce.length === 1 && ce[0][2] === 'protective' && ce[0][4] === 'rank:6@Etnie' && !has('Etnie', 'Caspian', 'protective'), `Caspian -> Etnie protective, told by Etnie's file (${ce.map(e => e[4])})`);
let T = applyPatch(initState(), [meet(['Etnie', 'Caspian'])]);
T.Bonds.Etnie.Rank = 6; G = U.graphModel(T);
ok(L('Caspian', 'Etnie') && L('Caspian', 'Etnie').arrow, 'Etnie at Rank 6: the line shows');
T.Bonds.Etnie.Rank = 5; T.Bonds.Caspian.Rank = 9; G = U.graphModel(T);
ok(!L('Caspian', 'Etnie'), 'Etnie at Rank 5 hides it, even with Caspian at Rank 9 (his own file does not say it)');
const T2 = applyPatch(initState(), [meet(['Etnie'])]); T2.Bonds.Etnie.Rank = 6; G = U.graphModel(T2);
ok(L('Caspian', 'Etnie') && U.knowsName('Caspian', T2), 'someone not met yet appears through what Etnie told you, and is named');
U.view.arg = 'Caspian'; T.Bonds.Etnie.Rank = 6;
ok((U.PANELS.npc.render(T).match(/data-open="npc:Etnie"/g) || []).length === 1, 'Caspian\'s dossier lists his view of Etnie once');

// ---- the Cast Sheet reads the same direction
const C = applyPatch(initState(), [meet(['Kuroo', 'Etnie'])]);
const t = R(509, C);
ok(/Kuroo → Etnie: protective/.test(t) && !/Etnie → Kuroo: protective/.test(t), 'Cast Sheet: "Kuroo → Etnie: protective", not the other way');

// ---- the curated data: every key's lines parse, '/N' picks exist
const CUR = JSON.parse(rd('data/relations_curated.json'));
ok(Object.values(CUR.edges).flatMap(v => [].concat(v)).every(v => v === 'drop' || /^<?(\w+)(\/\d+)?$/.test(v) && CUR.types.includes(v.replace(/^</, '').split('/')[0])), 'every curated value is drop, type, <type, with an optional /N');

// ---- a 1.6.9 save loads
const save = JSON.parse(rd('tests/fixtures/saves/save_1.6.9.json'));
const X = applyPatch(save, [{ op: 'replace', path: '/World/Time', value: '17:00' }]);
ok(X.$eng.ver === JSON.parse(rd('src/card/card.json')).character_version && Object.keys(save.Bonds).every(id => X.Bonds[id] && X.Bonds[id].Rank === save.Bonds[id].Rank && X.Bonds[id].Trust === save.Bonds[id].Trust),
  'the 1.6.9 save loads with every bond, rank and Trust');
