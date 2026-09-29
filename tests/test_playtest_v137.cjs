// 1.3.7 owner playtest: EJS entries compiled together ("redeclaration of const _U"), the Connections graph showing someone not
// met through a public family line, the student's picture in your own circle, Trust / Tension sizes for the narrator.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { graphModel, view, DATA };')();
console.log('Playtest fixes 1.3.7');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const EJS = card.character_book.entries.filter(e => /<%/.test(e.content));

// ---- EJS: entries that land together are compiled as one template by the Prompt Template extension
ok(EJS.length >= 7 && EJS.every(e => e.content.startsWith('<%_ { _%>\n') && e.content.endsWith('\n<%_ } _%>')), `every EJS entry has its own block scope (${EJS.length})`);
let S = applyPatch(initState({ etnie: true }), [{ op: 'replace', path: '/World/Location', value: 'Gymnasium' }]);
const gv = k => _.get({ stat_data: S }, k);
let err = ''; try { ejs.render(EJS.map(e => e.content).join('\n'), { getvar: gv }); } catch (e) { err = e.message.split('\n').slice(-1)[0]; }
ok(!err, `all EJS entries rendered as one template: no redeclaration (${err || 'ok'})`);
err = ''; try { ejs.render([502, 504, 505].map(i => EJS.find(e => e.id === i).content).join('\n') + '\n' + EJS.find(e => e.id === 502).content, { getvar: gv }); } catch (e) { err = e.message; }
ok(!err, 'even the same entry twice in one template');
const src502 = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/502.txt'), 'utf8');
ok(/violence against them \(a punch, a spell\) \+20–30/.test(src502) && /insult, humiliation or broken promise \+10–15/.test(src502), 'rule 502 gives the narrator sizes for Tension');

// ---- Connections: a public line (a teacher / mentor tie since 1.4.1) to someone not met is not drawn until both are met
const pub = U.DATA.rel.find(e => e[4] === 'public' && !/team$/.test((U.DATA.npcs[e[1]] || {}).g || ''));
S = applyPatch(initState(), [{ op: 'replace', path: '/Scene/Present', value: { [pub[0]]: { Note: '' } } }]);
U.view.gtypes = new Set(['friends', 'softspot', 'protective', 'respect', 'rivals', 'wary', 'dislike', 'story']);
let G = U.graphModel(S);
ok(pub && !G.nodes.some(n => n.id === pub[1]), `a public line to someone not met (${pub && pub[1]}) is not drawn`);
S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: { [pub[1]]: { Note: '' } } }]);
G = U.graphModel(S);
ok(G.nodes.some(n => n.id === pub[1]) && G.links.some(l => l.type !== 'bond' && [l.source, l.target].includes(pub[1])), 'once both are met, the public line shows');
const ppl = fs.readFileSync(path.join(ROOT, 'src/ui/parts/10_people.js'), 'utf8');
ok(/const mine = portraitURL\(S\)/.test(ppl) && /d\.you \? mine :/.test(ppl), 'your circle uses the student picture when there is one');
