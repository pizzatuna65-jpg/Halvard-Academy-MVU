// 1.21.0 UI overhaul "Brass & Moonglass" (owner-approved 2026-09-29): colours are tokens, themes re-colour the tokens, the fonts
// are the Alegreya family, and the panels keep the selectors and data attributes the code and the other suites rely on.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { recolor, THEMES, CSS };')();
const bar = fs.readFileSync(path.join(ROOT, 'src/ui/statusbar.html'), 'utf8');
const barCss = bar.slice(bar.indexOf('<style id="eld-bar-css">'), bar.indexOf('</style>'));
console.log('UI overhaul 1.21.0-1.23.0');

// ---- 1. every colour outside the token block is a token, an overlay, or marked keep (so a theme reaches all of it)
const COLOR = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)/g;
function strays(css, tokenBlock) {
  const rest = css.replace(tokenBlock, '').replace(/\/\*(?!keep\*\/)[\s\S]*?\*\//g, '');   // comments are not colours
  return (rest.match(new RegExp('(?:' + COLOR.source + ')(?!\\s*\\/\\*keep\\*\\/)', 'g')) || [])
    .filter(c => !/^rgba\((0,0,0|255,255,255),[.\d]+\)$/.test(c.replace(/\s/g, '')));   // the two alpha overlays are themed as roles
}
const panelTokens = U.CSS.match(/\.ov\{[\s\S]*?\n\s*position:fixed/)[0], barTokens = barCss.match(/:root\{[\s\S]*?\n\}/)[0];
ok(!strays(U.CSS, panelTokens).length, 'panels: no colour literal outside the token block ' + JSON.stringify(strays(U.CSS, panelTokens).slice(0, 5)));
ok(!strays(barCss, barTokens).length, 'bracelet: no colour literal outside the token block ' + JSON.stringify(strays(barCss, barTokens).slice(0, 5)));

// ---- 2. the same tokens in both places, and every theme maps only token values
const toks = s => Object.fromEntries([...s.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].replace(/\/\*keep\*\//, '').trim()]));
const P = toks(panelTokens), B = toks(barTokens);
const shared = Object.keys(B).filter(k => k in P);
ok(shared.length >= 20 && shared.every(k => P[k] === B[k]), `bracelet and panels agree on ${shared.length} shared tokens`);
const hexKey = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
const defaults = new Set(Object.values(P).filter(v => /^#[0-9a-f]{6}$/i.test(v)).map(hexKey).concat(['8,10,16', 'a:0,0,0', 'a:255,255,255']));
ok(Object.values(U.THEMES.themes).every(t => Object.keys(t.map).every(k => defaults.has(k))), 'every theme re-colours token values only');
ok(['pewter', 'midnight', 'rosewood', 'parchment', 'frost'].every(id => U.THEMES.themes[id]) && U.THEMES.default === 'pewter', 'theme ids unchanged (a saved choice still applies)');
const parch = U.recolor(U.CSS, U.THEMES.themes.parchment.map);
ok(/--sheet:#fbf8f1/.test(parch) && /--ink:#2b2620/.test(parch) && /--brass:#8f6a33/.test(parch), 'parchment: the token block turns light');

// ---- 3. fonts: Alegreya family, Cinzel gone
ok(!/Cinzel/.test(U.CSS) && !/Cinzel/.test(bar), 'no Cinzel left');
ok(/family=Alegreya:ital/.test(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8')) && /Alegreya\+SC/.test(bar), 'panels and bracelet load the Alegreya family');
ok(/\.hd h2\{[^}]*var\(--f-sc\)/.test(U.CSS) && /\n\.fv\{[^}]*var\(--f-text\)/.test(U.CSS), 'nameplates in Alegreya SC, story text in Alegreya');

// ---- 4. the dialog is anchored to the top (tabs no longer move the header)
ok(/\.ov\{[^}]*align-items:flex-start/.test(U.CSS), 'overlay anchors the dialog to the top');

// ---- 5. contracts the code and other suites use are still styled
for (const sel of ['.band.stale', '.band.collapsed', '.chip.warn', '.chip.danger', '.cast .face', '.btn.primary', '.cta']) ok(barCss.includes(sel), `bracelet keeps ${sel}`);
for (const sel of ['.ov[hidden]', '.dlg.wide', '.nav button.on', '.pin.here', '.pin.sel', '.note', '.clue', '.feat.off', '.cd.today']) ok(U.CSS.includes(sel), `panels keep ${sel}`);

// ---- 6. 1.22.0 the bracelet as an object
const barT = fs.readFileSync(path.join(ROOT, 'src/ui/statusbar.template.html'), 'utf8');
ok(/\.glass\{[^}]*box-shadow:[^}]*var\(--brass-lo\)/.test(barCss) && /class="dy"/.test(barT) && /<small>points<\/small>/.test(barT), 'bracelet: brass bezel on the glass, the day apart from the clock, points labelled');
ok(/class=\\"gem\\"|class="gem"/.test(barT) && /\.gem\{/.test(barCss), 'bracelet: the dorm shows as a gem and crest');
ok(/class=\\"md\\"|class="md"/.test(barT) && !/[☀☁]/.test(barT), 'bracelet: the mood is a Font Awesome badge on the portrait (no Unicode glyphs)');
ok(/style="--ring:' \+ c\[3\]/.test(barT) && /sp\.style\.cssText = img\.style\.cssText/.test(barT), 'bracelet: portrait rings take the dorm colour, and the fallback keeps it');
ok(/h = h\.slice\(0, low\) \+ '<div class="low">'/.test(barT) && /\.band\.collapsed [^{]*\.low/.test(barCss), 'bracelet: who is here and the news share a row that collapses');
ok(/@media \(max-width:540px\)\{[\s\S]*?\.actions\{display:grid;grid-template-columns:repeat\(3/.test(barCss), 'bracelet: on a phone the charms become a 3-column grid');

// ---- 7. 1.23.0 panels
const P7 = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view, renderProfile, renderBuilder, blankDraft };')();
const S7 = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/preview/sample_v130.json'), 'utf8'));
const pl = P7.PANELS.people.render(S7);
ok(/<div class="plist">/.test(pl) && /<span class="medal" title="Rank \d+ of 10">\d+<\/span>/.test(pl) && /class="ml">Trust<b>/.test(pl) && /aria-label="here now"/.test(pl), 'People: cards with a rank medal, labelled meters and a "here now" dot');
P7.view.arg = 'Irene'; const ds = P7.PANELS.npc.render(S7);
ok(/<div class="dos"><div class="dside"><div class="mat">/.test(ds) && /<dl class="file"><dt>/.test(ds) && /Rank \d+ of 10/.test(ds) && /<\/div><\/div><\/div><\/div>$/.test(ds), 'Dossier: matted portrait column, the file as rows, everything inside the two columns');
P7.view.tab = 'settings'; const st7 = P7.renderProfile(S7);
ok(/class="th( on)?" aria-pressed="(true|false)"><span class="pv"/.test(st7) && /\/\*keep\*\//.test(st7), 'Settings: a picture per theme, kept out of the current theme');
ok(/<button class="sw" role="switch" aria-checked="(true|false)" aria-label="[^"]+" data-act="feat" data-f="[^"]+" data-v="(on|off)"/.test(st7) && !/data-act="feat"[^>]*class="on"/.test(st7), 'Settings: on/off features are switches that send the other value');
ok(/<nav class="nav steps">/.test(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8')) && /<i class="n">\$\{k \+ 1\}<\/i>/.test(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.template.js'), 'utf8')), 'Builder: numbered steps');
