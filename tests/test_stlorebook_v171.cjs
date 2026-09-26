// 1.7.1 (owner: "buat update lorebook silly tavern biasa berdasarkan 1.7"): a plain SillyTavern lorebook (no MVU, no EJS) in
// dist/lorebook_st/, from the v39 export plus the voice canon. Campaign years read as {{user}}'s school years; the cohort's
// students are on their own roster line. Also: the six cohort 2 portraits are pinned (eldrasil-assets 172dc4a) and a 1.7.0 save loads.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
console.log('Plain SillyTavern lorebook 1.7.1');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ver = JSON.parse(rd('src/card/card.json')).character_version;
const L = n => JSON.parse(rd(`dist/lorebook_st/Eldrasil_${ver}_${n}.json`));
const core = L('Core'), npc = L('NPC_Detailed'), all = [...Object.values(core.entries), ...Object.values(npc.entries)];
const v39 = n => JSON.parse(rd(`dist/lorebook_v39/eldrasil_v39_${n}.json`));
ok(fs.readdirSync(path.join(ROOT, 'dist/lorebook_st')).length === 2, 'two files: Core and NPC_Detailed, named with the card version');
ok(Object.keys(core.entries).length === Object.keys(v39('Core').entries).length && Object.keys(npc.entries).length === Object.keys(v39('NPC_Detailed').entries).length, 'every entry of the v39 export is there');
ok(all.every(e => typeof e.content === 'string' && Array.isArray(e.key) && Number.isInteger(e.uid)) && 'metadata' in core, 'SillyTavern world-info shape (entries with uid, key, content)');
ok(!all.some(e => /<%|\[from Year|campaign Year|getvar\(|stat_data/.test(e.content)), 'no EJS, no variables, no campaign-year markers');
const E = id => Object.values(npc.entries).find(e => new RegExp('^NPC — ' + id + '\\b').test(e.comment)).content;
const C = JSON.parse(rd('data/npc_canon.json'));
ok(Object.keys(C.voice).every(id => E(id).includes("Voice (canon; examples of how " + id + ' sounds')), 'every NPC with voice canon carries its voice block');
ok(/<narrator_only>Alone[\s\S]*?<\/narrator_only>/.test(E('Hadrian')) && /At its closest the bond can become a best friend, a romance or a sworn rival\. As a romance:/.test(E('Hadrian')), "Hadrian: alone lines stay secret; his branch and Rank 8 lines");
ok(/As the bond with \{\{user\}\} grows: Just met: [\s\S]*Closest: /.test(E('Aiden')) && /Change \(shaped\):/.test(E('Aiden')), 'the stages by closeness and the Change type');
ok(/^\(Arrives at Halvard as a first-year in \{\{user\}\}'s second year; not on campus before that\.\)/.test(E('Linus')), "a cohort NPC says when they arrive in {{user}}'s terms");
ok(/\nFrom \{\{user\}\}'s second year: Gets Linus Tallyworth's column/.test(E('Aiden')), "lines a cohort added read \"From {{user}}'s second year\"");
const ros = Object.values(npc.entries).find(e => e.uid === 97).content;
ok(!/Year 1:[^\n]*Linus/.test(ros) && /Arriving as first-years in \{\{user\}\}'s second year \(not at Halvard before then\): Linus \(Viridian/.test(ros), 'roster: the cohort on its own line, not among the first-years');
ok(/From \{\{user\}\}'s second year also: Linus, Maple, Tsubaki\./.test(Object.values(npc.entries).find(e => e.comment === 'Regulars — Combat Grounds').content), 'Regulars: the same wording');
ok(!/lorebook_st/.test(rd('tools/curate_data.py')), 'the card pipeline still reads the v39 export (the plain lorebook is output only)');
// portraits
const man = JSON.parse(rd('data/assets_manifest.json'));
ok(/@172dc4a91a54c2a9b6b0d5de67bf2ccb41f6da93\/$/.test(man.base_url) && ['Linus', 'Maple', 'Nerys', 'Hadrian', 'Wren', 'Tsubaki'].every(id => man.npcs[id] && man.npcs[id].focus.length === 2), 'assets pinned to 172dc4a; the six have portraits with a face focus');
// a 1.7.0 save loads
const save = JSON.parse(rd('tests/fixtures/saves/save_1.7.0.json'));
const S = applyPatch(save, [{ op: 'replace', path: '/World/Time', value: '17:00' }]);
ok(S.$eng.ver === ver && Object.keys(save.Bonds).every(id => S.Bonds[id] && S.Bonds[id].Rank === save.Bonds[id].Rank && S.Bonds[id].Trust === save.Bonds[id].Trust), 'the 1.7.0 save loads with every bond, rank and Trust unchanged');
