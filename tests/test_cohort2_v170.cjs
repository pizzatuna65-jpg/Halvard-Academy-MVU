// 1.7.0 (owner, approved 2026-09-26: planning/DRAFT_cohort2_npcs.md): the first incoming cohort. Six first-years (Linus, Maple,
// Nerys, Hadrian, Wren, Tsubaki) arrive in campaign Year 2. Before that nothing of them shows: not their entries, not the lines
// they added to older NPCs' files, not the roster, the Regulars, the Cast Sheet ties, the dossier or People → Connections. Their
// voice canon, Rank 8 branch, rewards (Linus and Tsubaki carry a training bonus at Rank 10) and Nerys's weekly hobby work from
// Year 2. A 1.6.11 save loads.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('Cohort 2 1.7.0');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const entry = uid => card.character_book.entries.find(e => e.id === uid).content;
const R = (uid, S) => ejs.render(entry(uid), { getvar: k => _.get({ stat_data: S }, k) });
const NEW = ['Linus', 'Maple', 'Nerys', 'Hadrian', 'Wren', 'Tsubaki'];
const npcs = JSON.parse(rd('data/npcs.json')), C = JSON.parse(rd('data/npc_canon.json')), B = JSON.parse(rd('data/bond_rewards.json')).npcs;
const COH = JSON.parse(rd('data/cohorts.json')).incoming;
const T = (S, ops) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:00' }, ...ops]);
const W = (S, w) => T(S, Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })));
const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const Y1 = initState(), Y2 = W(initState(), { Year: 2 }), Y3 = W(initState(), { Year: 3 });

// ---- data
ok(JSON.stringify(COH['2']) === JSON.stringify(NEW) && NEW.every(id => npcs[id] && npcs[id].arrives === 2 && npcs[id].group === 'Year 1'), 'cohorts.json: the six arrive in Year 2 as first-years');
ok(npcs.Maple.beast === 'red panda' && npcs.Tsubaki.beast === 'wolf' && npcs.Nerys.race === 'Elf' && npcs.Linus.dorm === 'Viridian' && npcs.Wren.dorm === 'Fire', 'roster attributes parsed (red panda B included)');
ok(NEW.every(id => npcs[id].portrait === null && npcs[id].thumb === null), 'no portraits yet: the UI shows initials');
ok(NEW.every(id => C.voice[id] && C.change[id] && C.branch[id]) && ['Nerys', 'Hadrian', 'Tsubaki'].every(id => C.branch[id] === 'A') && ['Linus', 'Maple', 'Wren'].every(id => C.branch[id] === 'C'), 'voice, Change and Rank 8 branch for all six (A: Nerys, Hadrian, Tsubaki; C: Linus, Maple, Wren)');
ok(C.voice.Hadrian.alone.length === 1 && NEW.filter(id => id !== 'Hadrian').every(id => !C.voice[id].alone.length), 'only Hadrian has an alone line');
ok(B.Linus.r10.train === 'mana' && B.Tsubaki.r10.train === 'stamina' && NEW.every(id => B[id].gift.name && B[id].r10.name), 'rewards for all six; Rank 10 training: Linus mana, Tsubaki stamina');
ok(!/\[\?\]/.test(JSON.stringify(C.voice) + JSON.stringify(B)), 'no open-question marks in the canon');

// ---- Year 1: nothing of them
const Linus1 = R(410, Y1), Linus2 = R(410, Y2);
ok(!/Tallyworth/.test(Linus1) && /\[Linus Tallyworth\]/.test(Linus2), 'their own entry is empty in Year 1, present in Year 2');
ok(!/Linus|Nerys|Hadrian|Tsubaki/.test(R(106, Y1)) && /Linus Tallyworth's column/.test(R(106, Y2)) && /Tsubaki Hoshikage's duels/.test(R(106, Y2)), "Aiden's entry gains their lines only from Year 2");
ok(!/Maple|Tsubaki/.test(R(npcs.Krieg.uid_card, Y1)) && /<narrator_only>Has a file open on Maple Fernhollow's spirit/.test(R(npcs.Krieg.uid_card, Y2)) && /Hadrian Quelloris, a Light first-year, is everything Krieg believes/.test(R(npcs.Krieg.uid_card, Y2)), "Krieg: the Maple and Tsubaki lines are secret, the Hadrian line public");
ok(/<narrator_only>Hadrian Quelloris, a first-year in his dorm/.test(R(npcs.Dante.uid_card, Y2)) && !/Hadrian/.test(R(npcs.Dante.uid_card, Y1)), "Dante's line about Hadrian is secret, and waits for Year 2");
ok(/<narrator_only>He is afraid of dying/.test(Linus2 + R(413, Y2)), "Hadrian's fear of dying is narrator-only");
const cg = card.character_book.entries.find(e => /Regulars — Combat Grounds/.test(e.comment)).id;
ok(!/Linus/.test(R(cg, Y1)) && /From campaign Year 2 also: Linus, Maple, Tsubaki\./.test(R(cg, Y2)), 'Regulars (Combat Grounds): the new names only from Year 2');
const ros = y => ejs.render(entry(97), { getvar: k => ({ 'stat_data.World.Year': y, 'stat_data.Campus_State.Graduated': [] })[k] });
ok(!/Linus/.test(ros(1)) && /Year 1: Linus \(Viridian[^;]*; Maple \(Sky, red panda B/.test(ros(2)) && /Year 2: Trixie/.test(ros(2)) && /Year 2: Linus/.test(ros(3)), 'roster: they appear in Year 2 as first-years and move up in Year 3');
// the standalone export marks the lines instead
const v39 = JSON.parse(rd('dist/lorebook_v39/eldrasil_v39_NPC_Detailed.json')).entries;
ok(Object.values(v39).some(e => e.comment === 'NPC — Aiden Ruzzo' && /\n\[from Year 2\] Gets Linus Tallyworth's column/.test(e.content)), 'the v39 export marks the added lines "[from Year 2]"');

// ---- engine and Cast Sheet
let S = T(Y1, [here(['Linus'])]);
ok(!S.Bonds.Linus && !(S.$ui.cast.full || []).includes('Linus'), 'Year 1: Linus present gives no bond and no sheet');
S = T(Y2, [here(['Linus', 'Maple', 'Tsubaki'])]);
ok(S.Bonds.Linus.Trust === 60 && S.Bonds.Maple.Trust === 50 && S.Bonds.Tsubaki.Trust === 60, 'Year 2: bonds start at their own Trust (open 60, normal 50)');
let cs = R(509, S);
ok(/\[Linus Tallyworth\] full sheet/.test(cs) && /Year 1 student, Viridian dorm/.test(cs) && /Stage with \{\{user\}\} \(Rank 0\): \{\{user\}\} is a page in the Tally/.test(cs), 'Year 2: Linus has a full sheet as a Year 1 student, with his stage');
ok(/Linus → Tsubaki: respect/.test(cs) && /Tsubaki → Linus: rivals/.test(cs), 'the lines between the people present');
const aid = s => R(509, T(s, [here(['Aiden'])]));
ok(/Year 1 student, Light dorm/.test(aid(Y1)) && !/Key ties:[^\n]*(Linus|Nerys|Hadrian|Tsubaki)/.test(aid(Y1)), "Year 1: Aiden's sheet names no one from cohort 2");
ok(/Year 2 student, Light dorm/.test(aid(Y2)) && /Key ties:[^\n]*Linus \(friends\)/.test(aid(Y2)), "Year 2: Aiden is a Year 2 student, and Linus is among his ties");
// Nerys's weekly hobby
const ner = (s, w, rank) => { let x = T(W(s, w), [here(['Nerys'])]); if (rank) { x.Bonds.Nerys.Rank = rank; x = T(x, []); } return (R(509, x).match(/This week's hobby: [^\n]*/) || [''])[0]; };
const HB = C.weekly.Nerys;
ok(ner(Y2, { Month: 1, Week: 1 }).includes(HB.lines[0]) && ner(Y2, { Month: 1, Week: 2 }).includes(HB.lines[1]) && ner(Y2, { Month: 4, Week: 1 }).includes('None. She says she has no hobby this week.'), 'Year 2: the hobby follows the list week by week');
const free = HB.lines.map((_, i) => i).filter(i => !HB.pinned.includes(i));
ok(ner(Y3, { Month: 1, Week: 2 }).includes(HB.lines[free[7]]) && /revival season/.test(ner(Y3, { Month: 1, Week: 2 })) && ner(Y3, { Month: 1, Week: 1 }).includes(HB.lines[0]), 'Year 3: free weeks shift 7 slots (revival season); calendar weeks stay');
ok(!/unless \{\{user\}\} chose one/.test(ner(Y2, { Month: 2, Week: 1 })) && /unless \{\{user\}\} chose one/.test(ner(Y2, { Month: 2, Week: 1 }, 9)), 'from Rank 9 {{user}} may choose the hobby');
ok(HB.lines.length === 48 && HB.pinned.length === 26, 'the 48-week list, 26 weeks tied to the calendar');
ok(!/This week's hobby/.test(R(509, T(Y2, [here(['Linus'])]))), 'nobody else gets a hobby line');

// ---- Rank 10 training bonus (a gift used to be the only source)
const trainWith = (id, perkKind, trust) => {
  let x = T(Y2, [here([id])]); const nm = B[id].r10.name;
  x._Perks[nm] = { From: id, Kind: perkKind, Effect: '', Uses: 0 }; x.Bonds[id].Rank = 10; if (trust != null) x.Bonds[id].Trust = trust;
  x = T(x, [{ op: 'insert', path: '/Training/-', value: { Track: B[id].r10.train } }]);
  return (x._Log || []).find(l => /\] Training:/.test(l)) || '';
};
ok(/with Linus, x1\.5/.test(trainWith('Linus', 'rank10')), 'Linus at Rank 10 in the scene: Mana training x1.5');
ok(/with Tsubaki, x1\.5/.test(trainWith('Tsubaki', 'rank10')), 'Tsubaki at Rank 10: Stamina training x1.5');
ok(!/x1\.5/.test(trainWith('Linus', 'rank10', 20)), 'a suspended Rank 10 benefit (Trust under 35) gives no bonus');

// ---- UI: dossier fields and Connections lines wait for Year 2
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { DATA, fieldUnlocked, edgeVisible, avatar, PANELS, view };')();
const af = U.DATA.npcs.Aiden.fl.find(f => f[3] === 2), bondAt = (s, r) => { const x = JSON.parse(JSON.stringify(s)); x.Bonds = { Aiden: { Rank: r }, Linus: { Rank: r } }; return x; };
ok(af && /Linus Tallyworth/.test(af[1]) && !U.fieldUnlocked('Aiden', af, bondAt(Y1, 10)) && U.fieldUnlocked('Aiden', af, bondAt(Y2, 10)), "Aiden's dossier: the cohort's lines are hidden in Year 1 even at Rank 10, open in Year 2");
const e = U.DATA.rel.find(x => x[0] === 'Aiden' && x[1] === 'Linus');
ok(e && !U.edgeVisible(e, bondAt(Y1, 10)) && U.edgeVisible(e, bondAt(Y2, 10)), 'the Aiden → Linus line: hidden in Year 1, visible in Year 2');
ok(!U.DATA.rel.some(x => x[0] === 'Aiden' && x[1] === 'Sophia' && x[5].some(n => /graduated/.test(n))), "Aiden's Year 2 aside about Sophia graduating makes no Aiden → Sophia line");
ok(/<span class="av fb"/.test(U.avatar('Linus', bondAt(Y2, 1))), 'no portrait: the avatar is the initials, no image request');
const real = (s, r) => { const x = T(s, [here(['Aiden', 'Linus'])]); for (const b of Object.values(x.Bonds)) b.Rank = r; return x; };
U.view.arg = 'Linus'; const dos = U.PANELS.npc.render(real(Y2, 6));
ok(/<span class="por fb">LT<\/span>/.test(dos) && /Linus Tallyworth/.test(dos) && /How they see others/.test(dos), "Linus's dossier in Year 2: initials for the portrait, his views of others at Rank 6");
U.view.arg = 'Aiden'; ok(!/Linus/.test(U.PANELS.npc.render(real(Y1, 10))) && /Linus Tallyworth/.test(U.PANELS.npc.render(real(Y2, 10))), "Aiden's dossier at Rank 10: no word of Linus in Year 1");
const rel = JSON.parse(rd('data/relations.json')), has = (a, b, t) => rel.some(x => x.from === a && x.to === b && x.type === t);
ok([['Linus', 'Aiden', 'friends'], ['Florian', 'Linus', 'dislike'], ['Ottavio', 'Maple', 'protective'], ['Nerys', 'Yvette', 'protective'], ['Tilly', 'Nerys', 'rivals'],
  ['Hadrian', 'Wren', 'dislike'], ['Wren', 'Alyssa', 'friends'], ['Baelin', 'Tsubaki', 'protective'], ['Tsubaki', 'Rei', 'rivals'], ['Maple', 'Tsubaki', 'protective']].every(([a, b, t]) => has(a, b, t)),
  'Connections lines as the draft tables give them (a sample)');
ok(!rel.some(x => (x.from === 'Krieg' && ['Maple', 'Tsubaki'].includes(x.to)) || (x.from === 'Dante' && x.to === 'Hadrian')), 'secret lines (Krieg > Maple, Krieg > Tsubaki, Dante > Hadrian) make no Connections line');

// ---- a 1.6.11 save loads
const save = JSON.parse(rd('tests/fixtures/saves/save_1.6.11.json'));
const L = T(save, []);
ok(L.$eng.ver === '1.7.0' && Object.keys(save.Bonds).every(id => L.Bonds[id] && L.Bonds[id].Rank === save.Bonds[id].Rank && L.Bonds[id].Trust === save.Bonds[id].Trust) && L.Journal.length >= save.Journal.length,
  'the 1.6.11 save loads with every bond, rank, Trust and the journal kept');

// ---- size: each new NPC alone, full sheet (Year 2)
const sizes = NEW.map(id => [id, Math.round(R(509, T(Y2, [here([id])])).length / 4)]);
console.log('  Cast Sheet tokens with one cohort 2 NPC present:', sizes.map(([a, b]) => a + ' ' + b).join(', '));
// The approved lore is long: Hadrian's sheet (~3.45k) is over the ~3.2k the waves kept to; flagged to the owner, not cut.
ok(sizes.every(([, n]) => n < 3600), 'each full sheet stays under ~3.6k tokens (Hadrian the largest)');
