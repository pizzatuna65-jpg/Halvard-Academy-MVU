// 1.6.3 (Batch G, wave G1, approved by the owner 2026-09-25 from planning/DRAFT_voices.md): the voice canon of the 8 key NPCs
// in data/npc_canon.json (scene examples, alone scenes for masked NPCs, never sounds like, terms of address, don't flatten,
// carries, stage by bond rank band, anchor; Change type). The Cast Sheet prints it: terms and props in INVARIANTS, the voice
// and anchor on full sheets, only the stage for the current rank on every sheet. A fixed character's Imprints only deepen.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('G1 voices 1.6.3');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const R = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const C = JSON.parse(rd('data/npc_canon.json')), G1 = ['Etnie', 'Irene', 'Aiden', 'Castor', 'Zara', 'Kanae', 'Rei', 'Caine'];
ok(G1.every(id => C.voice[id]) && Object.keys(C.voice).length === 8, 'the 8 G1 voices are in data/npc_canon.json');
ok(JSON.stringify(C.change) === JSON.stringify({ Etnie: 'fixed', Irene: 'fixed', Aiden: 'shaped', Castor: 'shaped', Zara: 'shaped', Kanae: 'shaped', Rei: 'fixed', Caine: 'shaped' }), 'Change types as approved');
ok(G1.every(id => ['0-2', '3-5', '6-8', '9-10'].every(b => C.voice[id].stages[b]) && C.voice[id].scenes.length >= 5), 'every G1 voice has five or more scenes and all four stage bands');
ok(['Castor', 'Kanae', 'Caine'].every(id => C.voice[id].alone.length) && !['Etnie', 'Irene', 'Aiden', 'Zara', 'Rei'].some(id => C.voice[id].alone.length), 'alone scenes only for the masked three');
ok(!/\[\?\]/.test(JSON.stringify(C.voice)), 'no open-question marks left in the canon');

const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
let S = applyPatch(initState(), [here(['Irene'])]);
let t = R(509, S);
ok(/INVARIANTS: [^\n]*How they address people: \{\{user\}\}: by their family name until Rank 4[^\n]* Carries: the Student Council badge/.test(t), 'terms of address and props in the invariants');
ok(/How Irene sounds \(examples of the voice in situations, not lines to repeat\):\n- Scene: \{\{user\}\} is out after curfew\./.test(t) && /Never sounds like: slang, gushing/.test(t) && /Don't flatten: her strictness into coldness/.test(t) && /Anchor: her family's weekly letters/.test(t), 'full sheet: scenes, never sounds like, don\'t flatten, anchor');
ok(/Stage with \{\{user\}\} \(Rank 0\): correct, pleasant, entirely official\./.test(t) && (t.match(/Stage with \{\{user\}\}/g) || []).length === 1, 'only the stage for her rank (0-2)');
ok(/Change: fixed: Experience deepens who they are; it never rewrites them\./.test(t), 'her Change line');
ok(!/Alone \(the mask off/.test(t), 'no alone section for an unmasked character');
S.Bonds.Irene.Rank = 4; S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:00' }]);
ok(/Stage with \{\{user\}\} \(Rank 4\): still reports every break, but warns \{\{user\}\} first\./.test(R(509, S)), 'Rank 4: the 3-5 stage');
S = applyPatch(S, [here(['Castor'])]);
t = R(509, S);
ok(/<narrator_only>\nAlone \(the mask off; \{\{user\}\} never sees this unless the story earns it\):\n- Scene: alone at dawn after an errand for his father\.[^\n]*\n<\/narrator_only>/.test(t), 'a masked character\'s alone scene stays narrator-only');
// brief sheets: terms, props and stage, no scenes
S = applyPatch(S, [here(['Irene', 'Aiden', 'Castor', 'Kanae', 'Zara', 'Rei'])]);
const brief = S.$ui.cast.brief;
t = R(509, S);
const sec = id => { const nm = { Zara: 'Zara Minallone', Rei: 'Rei Kestrane', Kanae: 'Kanae Quveno', Castor: 'Castor Moretti', Aiden: 'Aiden Ruzzo', Irene: 'Irene Chanare' }[id]; const i = t.indexOf('[' + nm + ']'); const j = t.indexOf('\n[', i + 1); return t.slice(i, j < 0 ? undefined : j); };
ok(brief.length === 2 && brief.every(id => /brief sheet/.test(sec(id)) && /How they address people:/.test(sec(id)) && /Stage with \{\{user\}\}/.test(sec(id)) && !/sounds \(examples/.test(sec(id))), 'brief sheets: terms, props and stage, no scenes: ' + brief.join(', '));
// NPCs outside G1 get nothing new
S = applyPatch(S, [here(['Caspian'])]);
ok(!/How they address people|Stage with \{\{user\}\}|sounds \(examples/.test(R(509, S)), 'an NPC outside G1: no voice lines');
// fixed: the real engine now refuses to rewrite Irene
S = applyPatch(S, [here(['Irene'])]);
S = applyPatch(S, ['A', 'B', 'C', 'D', 'E'].map((b, i) => ({ op: 'insert', path: '/Bonds/Irene/Imprints/-', value: { Belief: b, Weight: 5 + i, From: 'test' } })));
S = applyPatch(S, [{ op: 'insert', path: '/Bonds/Irene/Imprints/-', value: { Belief: 'Z', Weight: 10, From: 'test' } }]);
ok(S.Bonds.Irene.Imprints.length === 5 && !S.Bonds.Irene.Imprints.some(x => x.Belief === 'Z') && /Irene does not change at the core \(fixed\)/.test(S._Log.join(' ')), 'Irene is fixed: a sixth Imprint is refused however heavy');
// size: one G1 NPC alone, full sheet
const one = id => { const T = applyPatch(initState(), [here([id])]); return Math.round(R(509, T).length / 4); };
const sizes = G1.map(id => [id, one(id)]);
console.log('  Cast Sheet tokens with one G1 NPC present:', sizes.map(([a, b]) => a + ' ' + b).join(', '));
ok(sizes.every(([, n]) => n < 3200), 'each G1 full sheet stays under ~3.2k tokens');
