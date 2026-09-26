// 1.6.5 (Batch G, wave G3, approved by the owner 2026-09-26 from planning/DRAFT_voices_G3.md): the voice canon of the Year 2
// NPCs not in G1 (Lenna, Saffi, Idris, Dante, Florian, Tilly), with Stages. Dante and Tilly hide an identity, so their alone
// scenes are narrator-only. Dante stays fanatically lawful with no exceptions (owner): his Rank 5 gift and Rank 10 benefit no
// longer have him hide {{user}} from patrols or look away from broken rules.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('G3 voices 1.6.5');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const R = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const C = JSON.parse(rd('data/npc_canon.json')), G3 = ['Lenna', 'Saffi', 'Idris', 'Dante', 'Florian', 'Tilly'];
ok(G3.every(id => C.voice[id]) && Object.keys(C.voice).length === 19, 'the 6 G3 voices join the 13 from G1 and G2');
ok(JSON.stringify(Object.fromEntries(G3.map(id => [id, C.change[id]]))) === JSON.stringify({ Lenna: 'shaped', Saffi: 'fixed', Idris: 'shaped', Dante: 'fixed', Florian: 'fluid', Tilly: 'fixed' }), 'Change types as approved');
ok(G3.every(id => ['0-2', '3-5', '6-8', '9-10'].every(b => C.voice[id].stages[b]) && C.voice[id].scenes.length >= 5), 'every G3 voice has five or more scenes and all four stage bands');
ok(C.voice.Dante.alone.length === 2 && C.voice.Tilly.alone.length === 2 && !['Lenna', 'Saffi', 'Idris', 'Florian'].some(id => C.voice[id].alone.length), 'alone scenes in G3: Dante and Tilly only');
ok(!/\[\?\]/.test(JSON.stringify(C.voice)), 'no open-question marks left in the canon');

const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const at = (id, rank) => { let S = applyPatch(initState(), [here([id])]); if (rank) { S.Bonds[id].Rank = rank; S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:00' }]); } return R(509, S); };

// Dante: lawful, no exceptions
let t = at('Dante');
ok(/<narrator_only>\nAlone \(the mask off; \{\{user\}\} never sees this unless the story earns it\):\n- Scene: a sworn Dove enters the room\./.test(t), 'Dante: his Dove side stays narrator-only');
ok(/Don't flatten: his lawfulness into bending for friends \(there are no exceptions, not for \{\{user\}\}, not for himself\)/.test(t), 'Dante: no exceptions');
ok(!/exception/.test(C.voice.Dante.stages['9-10']) && /holds them to every rule exactly as he holds everyone/.test(at('Dante', 10)), 'Dante at Rank 10: every rule, as for everyone');
ok(/if they break it anyway, he reports it like anyone's/.test(at('Dante', 4)), 'Dante at Rank 4: warns, then reports');
const Dr = JSON.parse(rd('data/bond_rewards.json')).npcs.Dante;
ok(!/looks the other way|steers Dove attention|no patrol looks into|lying to the Doves/.test(JSON.stringify(Dr)), 'Dante\'s rewards: no hiding from patrols, no looking away');
ok(/as long as it goes in his log/.test(Dr.gift.text) && /He still reports any rule \{\{user\}\} breaks/.test(Dr.r10.text) && /demanding it be done by the book/.test(Dr.r10.text) && /formal report naming \{\{user\}\}/.test(Dr.r10.secret), 'Dante\'s new gift, benefit and secret side');
ok(!/looks the other way on any rule/.test(rd('dist/Eldrasil_Halvard.json')) && !/looks the other way on any rule/.test(rd('src/scripts/engine.js')), 'the old wording is gone from the built card and engine');

// Tilly: the princess stays secret
t = at('Tilly');
ok(/<narrator_only>\nAlone[^\n]*\n- Scene: writing to "her father the miller" in cipher/.test(t) && /Carries: Halvard Unexplained/.test(t), 'Tilly: cipher letters narrator-only; the journal in her props');
ok(!/Velmora|Ottilie|princess/i.test(C.voice.Tilly.scenes.join(' ') + C.voice.Tilly.term_used + C.voice.Tilly.carries + Object.values(C.voice.Tilly.stages).join(' ')), 'Tilly\'s public voice lines never name her real identity');

// the others
ok(/Stage with \{\{user\}\} \(Rank 7\): lets a serious moment stay serious/.test(at('Lenna', 7)), 'Lenna at Rank 7: the 6-8 stage');
ok(/Saffi sounds/.test(at('Saffi')) && /Change: shaped:/.test(at('Idris')) && /Change: fluid:/.test(at('Florian')), 'Saffi voice, Idris shaped, Florian fluid');

// size: one G3 NPC alone, full sheet
const sizes = G3.map(id => [id, Math.round(at(id).length / 4)]);
console.log('  Cast Sheet tokens with one G3 NPC present:', sizes.map(([a, b]) => a + ' ' + b).join(', '));
ok(sizes.every(([, n]) => n < 3200), 'each G3 full sheet stays under ~3.2k tokens');
