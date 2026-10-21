// 1.88.1 (owner, 2026-10-22: the name and the line under it are hard to read on Frost and Parchment): the scene card's caption sits on
// the portrait, so every theme keeps its dark scrim and light text.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
console.log('Scene caption 1.88.1');
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { SCENE_CSS, recolor, THEMES };')();
for (const t of Object.keys(U.THEMES.themes)) {
  const css = U.recolor(U.SCENE_CSS, (U.THEMES.themes[t] || {}).map || {}), rule = s => (css.match(new RegExp('\\.eld-scene \\.' + s + '\\{[^}]*\\}')) || [''])[0];
  ok(/rgba\(10,13,20,\.92\)/.test(rule('cap')) && /color:#f3e8cf/.test(rule('nm')) && /color:#c3beb2/.test(rule('rl')), `${t}: dark scrim, light name and line`);
}
