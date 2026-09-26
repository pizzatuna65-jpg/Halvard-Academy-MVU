// 1.6.6 (Batch G, wave G4, approved by the owner 2026-09-26 from planning/DRAFT_voices_G4.md): the voice canon of the Year 3
// NPCs not in G1 (Caspian, Royhan, Sophia, Gareth, Ruby), with Stages. Gareth hides his ambition and what he did to his
// brother, so his alone scenes are narrator-only and no stage line names what only <narrator_only> knows.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('G4 voices 1.6.6');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const R = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const C = JSON.parse(rd('data/npc_canon.json')), G4 = ['Caspian', 'Royhan', 'Sophia', 'Gareth', 'Ruby'];
ok(G4.every(id => C.voice[id]) && Object.keys(C.voice).length >= 24, 'the 5 G4 voices join the 19 from G1 to G3');
ok(JSON.stringify(Object.fromEntries(G4.map(id => [id, C.change[id]]))) === JSON.stringify({ Caspian: 'fixed', Royhan: 'shaped', Sophia: 'fixed', Gareth: 'fixed', Ruby: 'fixed' }), 'Change types as approved');
ok(G4.every(id => ['0-2', '3-5', '6-8', '9-10'].every(b => C.voice[id].stages[b]) && C.voice[id].scenes.length >= 5), 'every G4 voice has five or more scenes and all four stage bands');
ok(C.voice.Gareth.alone.length === 2 && !['Caspian', 'Royhan', 'Sophia', 'Ruby'].some(id => C.voice[id].alone.length), 'alone scenes in G4: Gareth only');
ok(!/\[\?\]/.test(JSON.stringify(C.voice)), 'no open-question marks left in the canon');

const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const at = (id, rank) => { let S = applyPatch(initState(), [here([id])]); if (rank) { S.Bonds[id].Rank = rank; S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:00' }]); } return R(509, S); };

// Gareth: the mask holds
let t = at('Gareth');
ok(/<narrator_only>\nAlone[^\n]*\n- Scene: someone has crossed him\.[^\n]*\n- Scene: the monthly letter to his brother[^\n]*\n<\/narrator_only>/.test(t), 'Gareth: both alone scenes stay narrator-only');
ok(/Never sounds like: \(glasses on\) boastful, crude, impatient or unkind/.test(t), 'Gareth: never sounds like, glasses on');
const pub = Object.values(C.voice.Gareth.stages).join(' ') + C.voice.Gareth.scenes.join(' ') + C.voice.Gareth.term_used + C.voice.Gareth.carries;
ok(!/sabotag|ruin|kindest to|sees? through/i.test(pub), 'Gareth: no public line names the sabotage or what he does to people who see through him');
ok(/Stage with \{\{user\}\} \(Rank 10\): \{\{user\}\} is his one exception to coming first/.test(at('Gareth', 10)), 'Gareth at Rank 10: the 9-10 stage matches his benefit');

// Sophia: never Blood
t = at('Sophia');
ok(/she has never pulled water from a living body/.test(t) && /Carries: a tactics book/.test(t), 'Sophia: the Blood line and her props');
ok(/Stage with \{\{user\}\} \(Rank 4\): \{\{user\}\} has hit back at least once/.test(at('Sophia', 4)), 'Sophia at Rank 4: the 3-5 stage');

// Royhan: prejudice, nothing more
ok(/never imply he is anything from the Crack/.test(at('Royhan')) && /Change: shaped:/.test(at('Royhan')), 'Royhan: the horns are prejudice only; shaped');
ok(/Krieg: always his full name, never shortened/.test(at('Caspian')) && !/Commander/.test(JSON.stringify(C.voice.Caspian)), 'Caspian: Krieg by full name, no invented title');
ok(/Stage with \{\{user\}\} \(Rank 9\): tells everyone who will listen that \{\{user\}\} is her friend/.test(at('Ruby', 9)), 'Ruby at Rank 9: the 9-10 stage');

// size: one G4 NPC alone, full sheet
const sizes = G4.map(id => [id, Math.round(at(id).length / 4)]);
console.log('  Cast Sheet tokens with one G4 NPC present:', sizes.map(([a, b]) => a + ' ' + b).join(', '));
ok(sizes.every(([, n]) => n < 3200), 'each G4 full sheet stays under ~3.2k tokens');
