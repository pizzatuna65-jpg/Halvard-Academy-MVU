// 1.3.6 (owner): the card installs its own lorebook like SillyTavern's Import Card Lore (ST offers it only once per character
// file). Tested against a mock of SillyTavern.getContext() with the card's real embedded book.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const VER = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/card/card.json'), 'utf8')).character_version;
console.log('Card lorebook install 1.3.6');
function setup({ worlds = {}, answer = true, state = null, linked = true } = {}) {
  const log = { saved: [], toasts: [], popups: 0, reloads: 0, links: [] };
  const C = { name: card.name, avatar: 'Eldrasil.png', data: { character_book: card.character_book, extensions: linked ? { world: card.extensions.world } : {} } };
  global.window = { parent: { document: {}, confirm: () => answer } };
  global.toastr = { success: m => log.toasts.push(m), warning: m => log.toasts.push('W:' + m), error: m => log.toasts.push('E:' + m) };
  global.getLastMessageId = () => 0; global.getVariables = () => (state ? { stat_data: state } : {});
  global.SillyTavern = {
    characters: [C], characterId: 0,
    getWorldInfoNames: () => Object.keys(worlds),
    convertCharacterBook: b => ({ entries: Object.fromEntries(b.entries.map(e => [e.id, { comment: e.comment, content: e.content }])) }),
    saveWorldInfo: async (n, d) => { worlds[n] = d; log.saved.push(n); },
    updateWorldInfoList: async () => {}, loadWorldInfo: async n => worlds[n],
    writeExtensionField: async (id, k, v) => { C.data.extensions[k] = v; log.links.push(v); },
    callGenericPopup: async () => { log.popups++; return answer; }, POPUP_TYPE: { CONFIRM: 2 },
    reloadCurrentChat: () => { log.reloads++; },
  };
  const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { ensureLorebook, loreVerOf };')();
  return { U, log, worlds, C };
}
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const name = card.extensions.world;
  ok(name === card.character_book.name, `the card links the lorebook by name ("${name}")`);
  // missing: installed and attached at once; a chat without state is loaded again so MVU initialises it
  let T = setup();
  await T.U.ensureLorebook(); await wait(900);
  ok(T.log.saved.join() === name && T.U.loreVerOf(Object.values(T.worlds[name].entries)) === VER && T.log.popups === 0, `missing: the card's lorebook ${VER} is installed without asking`);
  ok(T.log.toasts.some(m => /installed and attached/.test(m)) && T.log.reloads === 1, 'toast, and the empty chat is loaded again (MVU then reads the starting state)');
  await T.U.ensureLorebook();
  ok(T.log.saved.length === 1, 'checked once per chat');
  // an unlinked character gets its link written
  T = setup({ linked: false }); await T.U.ensureLorebook();
  ok(T.log.links.join() === card.character_book.name, 'an unlinked character is linked to it');
  // a chat that already has state is not reloaded
  T = setup({ state: { World: {} } }); await T.U.ensureLorebook(); await wait(900);
  ok(T.log.saved.length === 1 && T.log.reloads === 0, 'a chat with state is not reloaded');
  // present and current: nothing
  const cur = { [name]: { entries: { 500: { comment: '[initvar] Eldrasil starting state', content: `$eng:\n  lore: "${VER}"` } } } };
  T = setup({ worlds: cur }); await T.U.ensureLorebook();
  ok(!T.log.saved.length && !T.log.popups, 'the current version: nothing happens');
  // an older one: the player is asked; yes updates, no leaves it
  const old = { [name]: { entries: { 500: { comment: '[initvar] Eldrasil starting state', content: 'Bonds:\n  Etnie:\n    Rank: 3' } } } };
  T = setup({ worlds: JSON.parse(JSON.stringify(old)), answer: true }); await T.U.ensureLorebook();
  ok(T.log.popups === 1 && T.log.saved.length === 1 && T.U.loreVerOf(Object.values(T.worlds[name].entries)) === VER && T.log.toasts.some(m => /updated to/.test(m)), 'an older lorebook: asked, and updated on yes');
  T = setup({ worlds: JSON.parse(JSON.stringify(old)), answer: false }); await T.U.ensureLorebook();
  ok(T.log.popups === 1 && !T.log.saved.length, '"Not now" leaves it alone');
  // another character: never touched
  T = setup(); T.C.name = 'ArtificRealm'; await T.U.ensureLorebook();
  ok(!T.log.saved.length, "another character's chat is not touched");
})();
