// 1.5.0 (Batch A, planning/DRAFT_batch_plan.md): card rules for character consistency. P8 canon over memory, World sources,
// N3a "close" bonds (engine flag + <now> mark + rule), N10 butterfly clause on scheduled events.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const PP = (X, id) => ((((X || {}).$ui || {}).now || {}).people || {})[id] ? X.$ui.now.people[id].join('\n') : '';   // 1.56.0 (U2): a person's block (their Cast Sheet)
console.log('Character-consistency rules 1.5.0');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const r504 = rd('src/worldbook/custom/content/504.txt'), now505 = rd('src/worldbook/custom/content/505.txt');
const gv = S => k => require('lodash').get({ stat_data: S }, k);
const render = (tpl, S) => ejs.render(tpl, { getvar: gv(S) });

// ---- P8 + World sources (504), rendered with features on and off
let S = initState({ etnie: true });
let t = render(r504, S);
ok(/Canon over memory: the lorebook and character sheets outrank the chat's own earlier prose/.test(t), 'P8: canon over memory');
ok(/Rank, Trust and Tension change how a character treats \{\{user\}\}, never who they are; closeness is not warmth/.test(t), 'P8: numbers change treatment, not identity');
ok(/Where the world's own events come from: the calendar \(_Event_today\), World\._Happening, the location's regulars, the campus phase <now> names, open Commitments, Hooks and Mysteries, campus events <now> asks you to advance/.test(t), 'World sources with every feature on');
const off = applyPatch(S, [{ op: 'replace', path: '/$ui/happenings', value: 'off' }, { op: 'replace', path: '/$ui/off', value: ['hooks'] }]);
t = render(r504, off);
ok(/Where the world's own events come from: the calendar \(_Event_today\), the location's regulars, the campus phase <now> names, open Commitments and Mysteries/.test(t), 'World sources drop happenings and hooks when those features are off');
ok(/bond is marked "close", let one small behaviour of deeper familiarity slip out/.test(t), 'N3a rule in 504');

// ---- N3a: the engine marks a bond close at 80% of the next rank's XP, before the bar is full
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '12:00' }, meet(['Irene'])]);
const need = 10;   // Rank 0 -> 1 at standard pace (bond_rules xp_base[0])
const setXP = (S, xp) => { S.Bonds.Irene.$xp = xp; return applyPatch(S, [{ op: 'replace', path: '/World/Time', value: '12:05' }]); };   // $xp is engine-owned
S = setXP(S, need * 0.8 - 1);
ok(!(S.$ui.close || []).includes('Irene'), 'below 80%: not close');
S = setXP(S, need * 0.8);
ok((S.$ui.close || []).includes('Irene'), 'at 80%: close');
t = render(now505, S);
ok(/Bond \([^)]*, close\)/.test(PP(S, 'Irene')), 'her block marks the bond close: ' + PP(S, 'Irene').slice(0, 60));
S = setXP(S, need);
ok((S.$ui.close || []).includes('Irene'), 'a full bar remains close until the next genuine interaction');
ok(/, close\)/.test(PP(S, 'Irene')), 'her block keeps the close mark on a full bar');

// ---- N10: butterfly clause on scheduled events
const roy = rd('src/worldbook/content/101.txt');
ok(/adapt it to the story as it is now; never replay it as if nothing happened/.test(roy), 'Royhan (101): the Dorm Competition weekend adapts to the story');
ok(/adapt it to the story as it is now; never replay it as if nothing happened/.test(rd('src/worldbook/custom/content/508.txt')), 'birthday (508) adapts to the story');
ok(!/Bond event available/.test(now505) && /Has grown closer through this ordinary interaction/.test(rd('src/scripts/engine.js')), 'the person block uses a natural relationship cue instead of a scripted event (1.56.0)');

// ---- the built card carries the same text
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data, E = uid => card.character_book.entries.find(e => e.id === uid).content;
ok(E(504).includes('Canon over memory') && rd('src/scripts/engine.js').includes('UI.close') && E(505).includes('NOW.people'), 'built card has the 1.5.0 rules (1.48.0: the bond lines are the engine\'s; 1.56.0: one block per person)');
