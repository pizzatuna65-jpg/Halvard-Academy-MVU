// 1.6.7 (Batch G, wave G5, approved by the owner 2026-09-26 from planning/DRAFT_voices_G5.md): the voice canon of the staff
// and the others (Doves, Cathedral, facilities), with Stages. This is the last wave: every bonded NPC now has a voice.
// Baelin, Layla and Ezrel hide secrets of their own, so their alone scenes are narrator-only. Two Rank 10 texts changed with
// the owner's approval: Yvette answers the Fire Dormitory's door (the dorm admits only its own), and Layla's line about
// Yvette moved to the secret side (it was <narrator_only> lore).
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('G5 voices 1.6.7');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const R = (uid, S) => ejs.render(card.character_book.entries.find(e => e.id === uid).content, { getvar: k => _.get({ stat_data: S }, k) });
const C = JSON.parse(rd('data/npc_canon.json')), B = JSON.parse(rd('data/bond_rewards.json')).npcs;
const G5 = ['Gavlan', 'Yvette', 'Baelin', 'Layla', 'Vallie', 'Kuroo', 'Mimosa', 'Althair', 'Ezrel', 'Ottavio', 'Krieg', 'Milena', 'Tristan', 'Bobby'];
ok(G5.every(id => C.voice[id]) && Object.keys(B).every(id => C.voice[id]), 'the 14 G5 voices are in, and every bonded NPC now has a voice');
const shaped = ['Mimosa', 'Milena', 'Bobby'];
ok(G5.every(id => C.change[id] === (shaped.includes(id) ? 'shaped' : 'fixed')), 'Change types as approved: Mimosa, Milena, Bobby shaped; the rest fixed');
ok(G5.every(id => ['0-2', '3-5', '6-8', '9-10'].every(b => C.voice[id].stages[b]) && C.voice[id].scenes.length >= 5), 'every G5 voice has five or more scenes and all four stage bands');
ok(['Baelin', 'Layla', 'Ezrel'].every(id => C.voice[id].alone.length === 2) && !G5.filter(id => !['Baelin', 'Layla', 'Ezrel'].includes(id)).some(id => C.voice[id].alone.length), 'alone scenes in G5: Baelin, Layla and Ezrel only');
ok(!/\[\?\]/.test(JSON.stringify(C.voice)), 'no open-question marks left in the canon');

const here = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const at = (id, rank) => { let S = applyPatch(initState(), [here([id])]); if (rank) { S.Bonds[id].Rank = rank; S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '09:00' }]); } return R(509, S); };
const pub = id => { const v = C.voice[id]; return v.scenes.join(' ') + Object.values(v.stages).join(' ') + v.term_used + v.carries + v.dont_flatten + v.never_sounds + v.anchor; };

// secrets stay narrator-only
let t = at('Ezrel');
ok(/<narrator_only>\nAlone[^\n]*\n- Scene: mid-sentence, he stops\.[^\n]*\n- Scene: a student asks him something while his attention is elsewhere\.[^\n]*\n<\/narrator_only>/.test(t), 'Ezrel: both alone scenes stay narrator-only');
ok(!/golem\b[^.]*\bhimself|this body|stock line|eleven seconds/i.test(pub('Ezrel')), 'Ezrel: no public line hints at what he is');
ok(/Stage with \{\{user\}\} \(Rank 10\): builds \{\{user\}\} a Mannequin/.test(at('Ezrel', 10)) && /Full names too/i.test(t), 'Ezrel at Rank 10: the Mannequin stage; full names');
t = at('Baelin');
ok(/<narrator_only>\nAlone[^\n]*\n- Scene: a routine report on Tilly Marsh[^\n]*\n- Scene: something he cannot fix by letter\. Aura[^\n]*\n<\/narrator_only>/.test(t), 'Baelin: Tilly and Aura only inside narrator-only');
ok(!/Tilly|Velmora/.test(pub('Baelin')) && !/Velmora/.test(JSON.stringify(C.voice.Baelin)), 'Baelin: no public line names Tilly; Velmora named nowhere');
t = at('Layla');
ok(/<narrator_only>\nAlone[^\n]*\n- Scene: alone in her rooms, she checks the dampening charm/.test(t) && !/Potion Halls|cornered|dampening/.test(pub('Layla')), 'Layla: the gloves secret stays narrator-only');

// the two Rank 10 texts (owner-approved)
ok(/The Fire Dormitory's door becomes the one door \{\{user\}\} can knock on at any hour: whatever their dorm, she comes down to answer it/.test(B.Yvette.r10.text), 'Yvette Rank 10: she answers the dorm door, whatever {{user}}\'s dorm');
ok(/If anyone ever corners \{\{user\}\}, the gloves come off\.$/.test(B.Layla.r10.text) && !/Yvette/.test(B.Layla.r10.text) && B.Layla.r10.secret === 'The last time the gloves came off, it was for Yvette.', 'Layla Rank 10: Yvette moved to the secret side');
const built = rd('dist/Eldrasil_Halvard.json') + rd('src/scripts/engine.js');
ok(!/Her rooms in the Fire Dormitory become the one door/.test(built) && !/the way they once cornered Yvette/.test(built), 'the old wording is gone from the built card and engine');
ok(['planning/bond_rewards.md', 'docs/design/bond_rewards.md'].every(f => /<narrator_only>The last time the gloves came off, it was for Yvette\.<\/narrator_only>/.test(rd(f))) && rd('planning/bond_rewards.md') === rd('docs/design/bond_rewards.md'), 'both design copies carry the change and match');

// the rest: a line from each group
ok(/Stage with \{\{user\}\} \(Rank 10\):[^\n]*He still searches, questions and watches them like everyone else/.test(at('Krieg', 10)), 'Krieg at Rank 10: still watches {{user}}, as his benefit says');
ok(/Krieg: "Commander"/.test(at('Milena')) && /Change: shaped:/.test(at('Milena')), 'Milena: "Commander" (lore), shaped');
ok(/Stage with \{\{user\}\} \(Rank 1\): "kid", a nod[^\n]*Sky student/.test(at('Ottavio', 1)) && /Carries: round black-tinted glasses; a worn casino coin/.test(at('Ottavio')), 'Ottavio at Rank 1: Sky students are already his; coin and glasses');
ok(/Hostility only makes him friendlier/.test(at('Althair', 2)) && /Anchor: his clothes: never formal/.test(at('Althair')), 'Althair: the Delighted override in his stage; the anchor');
ok(/Change: shaped:/.test(at('Mimosa')) && /Kuroo: "Professor Varnell"/.test(at('Mimosa')), 'Mimosa: shaped; terms');
ok(/Stage with \{\{user\}\} \(Rank 9\): \{\{user\}\} is the protégé he was looking for/.test(at('Gavlan', 9)), 'Gavlan at Rank 9: the protégé stage');

// size: one G5 NPC alone, full sheet
const sizes = G5.map(id => [id, Math.round(at(id).length / 4)]);
console.log('  Cast Sheet tokens with one G5 NPC present:', sizes.map(([a, b]) => a + ' ' + b).join(', '));
ok(sizes.every(([, n]) => n < 3200), 'each G5 full sheet stays under ~3.2k tokens');
