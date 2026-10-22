// 1.94.0 (owner): the player's own notes per person in the dossier, kept in Tavern Helper's chat variables (eld_notes), never in the
// game state; the Bonds card shows a note mark
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
// a stand-in for Tavern Helper's chat variables, so the panels take their chat path
let chatVars = { stat_data: {} };
global.getVariables = () => chatVars;
global.updateVariablesWith = (fn) => { chatVars = fn(JSON.parse(JSON.stringify(chatVars))); return chatVars; };
const src = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
const U = new Function(src + '\nreturn { PANELS, view, notesGet, noteFlush, peopleListHTML };')();
console.log('NPC notes (1.94.0)');

const S = applyPatch(initState(), [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: 'waving' } } }]), id = 'Etnie';
ok(S.Bonds.Etnie, 'meeting Etnie makes a bond');
U.view.arg = id;
let h = U.PANELS.npc.render(S);
ok(new RegExp(`<textarea class="pnote" data-note="${id}"[^>]*></textarea>`).test(h) && /narrator never reads them/.test(h), 'the dossier has an empty notes box');
U.PANELS.npc.input({ dataset: { note: id }, value: 'Likes jasmine tea' });
ok(U.notesGet()[id] === 'Likes jasmine tea' && !chatVars.eld_notes, 'typing keeps the text at once; the chat variable waits for the pause');
U.noteFlush();
ok(chatVars.eld_notes && chatVars.eld_notes[id] === 'Likes jasmine tea', 'after the pause the note is in the chat variable eld_notes');
ok(JSON.stringify(S).indexOf('jasmine') < 0, 'never in the game state');
ok(/>Likes jasmine tea<\/textarea>/.test(U.PANELS.npc.render(S)), 'the dossier shows it again');
ok(/class="nte"[^>]*title="Likes jasmine tea"/.test(U.peopleListHTML(S)), 'the Bonds card shows a note mark with the note');
U.PANELS.npc.input({ dataset: { note: id }, value: 'x'.repeat(1500) }); U.noteFlush();
ok(chatVars.eld_notes[id].length === 1000, 'a note is cut at 1,000 characters');
U.PANELS.npc.input({ dataset: { note: id }, value: '  ' }); U.noteFlush();
ok(!(id in chatVars.eld_notes) && !/class="nte"/.test(U.peopleListHTML(S)), 'an emptied note is removed, and so is the mark');
