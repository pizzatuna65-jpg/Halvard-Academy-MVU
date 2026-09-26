// 1.6.4 (Batch G, wave G2, approved by the owner 2026-09-26 from planning/DRAFT_voices_G2.md): the voice canon of the Year 1
// NPCs not in G1 (Caralynn, Percival, Trixie, Vera, Alyssa), with Stages (the owner's call). Alyssa's story is somber and
// bittersweet (reference: Isshuukan Friends): her alone scenes are narrator-only, and her Rank 10 benefit no longer cures the
// forgetting ("she still meets them as a stranger, but only for the length of one page").
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('G2 voices 1.6.4');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const R = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const C = JSON.parse(rd('data/npc_canon.json')), G2 = ['Caralynn', 'Percival', 'Trixie', 'Vera', 'Alyssa'];
ok(G2.every(id => C.voice[id]), 'the 5 G2 voices are in data/npc_canon.json');
ok(JSON.stringify(Object.fromEntries(G2.map(id => [id, C.change[id]]))) === JSON.stringify({ Caralynn: 'shaped', Percival: 'fixed', Trixie: 'fluid', Vera: 'fixed', Alyssa: 'fixed' }), 'Change types as approved');
ok(G2.every(id => ['0-2', '3-5', '6-8', '9-10'].every(b => C.voice[id].stages[b]) && C.voice[id].scenes.length >= 5), 'every G2 voice has five or more scenes and all four stage bands');
ok(C.voice.Alyssa.alone.length === 2 && !['Caralynn', 'Percival', 'Trixie', 'Vera'].some(id => C.voice[id].alone.length), 'alone scenes in G2: Alyssa only');
ok(!/\[\?\]/.test(JSON.stringify(C.voice)), 'no open-question marks left in the canon');

const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
let S = applyPatch(initState(), [here(['Alyssa'])]);
let t = R(509, S);
ok(/How Alyssa sounds \(examples of the voice in situations, not lines to repeat\):\n- Scene: the first day of a new week/.test(t), 'Alyssa: the scene examples on her full sheet');
ok(/<narrator_only>\nAlone \(the mask off; \{\{user\}\} never sees this unless the story earns it\):\n- Scene: the morning after the rest day[^\n]*\n- Scene: in the Canteen she sets down a second cup[^\n]*\n<\/narrator_only>/.test(t), 'Alyssa: both alone scenes stay narrator-only');
ok(/Don't flatten: her story is somber and bittersweet: quiet loss, small warmth, no melodrama\./.test(t) && /no rank, feeling or kiss cures it/.test(t) && /never as memories/.test(t), 'Alyssa: the tone, no cure, shared moments only as notes');
ok(/Stage with \{\{user\}\} \(Rank 0\): \{\{user\}\}'s page is a name, a sketch and one line\./.test(t), 'Alyssa at Rank 0: the 0-2 stage');
ok(/How they address people: \{\{user\}\}: their name, after a glance at the notebook/.test(t) && /Carries: the small leather notebook/.test(t), 'Alyssa: terms and props in the invariants');
S.Bonds.Alyssa.Rank = 7; S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:00' }]);
ok(/Stage with \{\{user\}\} \(Rank 7\): the page fills both sides\. If the story has already shown \{\{user\}\} the pattern/.test(R(509, S)), 'Alyssa at Rank 7: she admits the pattern only once the story has shown it');

// the Rank 10 benefit (bond_rewards.json, changed with the owner's approval)
const r10 = JSON.parse(rd('data/bond_rewards.json')).npcs.Alyssa.r10.text;
ok(/she still meets them as a stranger, but only for the length of one page/.test(r10) && !/never meets them as a stranger/.test(r10) && /Once a day Alyssa spends Foresight on \{\{user\}\}/.test(r10), 'Alyssa Rank 10: same benefit, no cure');
ok(!/never meets them as a stranger/.test(rd('dist/Eldrasil_Halvard.json')) && !/never meets them as a stranger/.test(rd('src/scripts/engine.js')), 'the old wording is gone from the built card and engine');

// the others: a line from each, and their change lines
S = applyPatch(initState(), [here(['Percival'])]);
S.Bonds.Percival.Rank = 6; S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:00' }]);
t = R(509, S);
ok(/Stage with \{\{user\}\} \(Rank 6\): introduces \{\{user\}\} to the whole Brotherhood/.test(t) && /Never Laetano outside the Combat Grounds/.test(t), 'Percival at Rank 6: the 6-8 stage; his spear stays in the armory');
t = R(509, applyPatch(initState(), [here(['Trixie'])]));
ok(/Change: fluid: They change with their surroundings over months/.test(t) && /do not invent one/.test(t), 'Trixie: fluid, and no invented secret');
t = R(509, applyPatch(initState(), [here(['Caralynn'])]));
ok(/Caralynn sounds/.test(t) && /Change: shaped:/.test(t) && /Sophia: she avoids saying her name at all/.test(t), 'Caralynn: voice, shaped, terms');
t = R(509, applyPatch(initState(), [here(['Vera'])]));
ok(/Vera sounds/.test(t) && /Anchor: her notebooks, one per open question/.test(t), 'Vera: voice and anchor');

// size: one G2 NPC alone, full sheet
const one = id => Math.round(R(509, applyPatch(initState(), [here([id])])).length / 4);
const sizes = G2.map(id => [id, one(id)]);
console.log('  Cast Sheet tokens with one G2 NPC present:', sizes.map(([a, b]) => a + ' ' + b).join(', '));
ok(sizes.every(([, n]) => n < 3200), 'each G2 full sheet stays under ~3.2k tokens');
