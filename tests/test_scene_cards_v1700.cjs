// 1.70.0 (owner, mockup "Halvard Scene Cards"): under the newest reply, one card per person present: the full portrait, their
// true thoughts (the preset's <npc_thoughts> block, matched by name) and the bond meters. The bracelet's portrait strip steps
// aside while the cards run; without the preset's block the cards still show.
const fs = require('fs'), path = require('path');
const { initState, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { sceneThoughts, sceneIdOf, sceneHTML, DATA };')();
console.log('Scene cards 1.70.0');
const sceneThoughts = U.sceneThoughts;

// ---- the preset's block, in both of its forms, with a continuation line and markdown left in
const T = sceneThoughts(`Story...\n<npc_thoughts>\n- **Sophia**: Didn't flinch. Good.\n  Most of them *flinch*.\n- **Irene Chanare:** "The report is mine."\n- **Caspian** (Student Council office, sorting petitions): Forty minutes.\n</npc_thoughts>\n<UpdateVariable>[]</UpdateVariable>`);
ok(T.length === 3 && T[0].name === 'Sophia' && T[0].lines.join('|') === "Didn't flinch. Good.|Most of them flinch.", 'a thought and its next line, markdown stripped');
ok(T[1].name === 'Irene Chanare' && T[1].lines[0] === 'The report is mine.', '"**Name:**" and quotes');
ok(T[2].where === 'Student Council office, sorting petitions' && T[2].lines[0] === 'Forty minutes.', 'the (where, doing) form');
ok(sceneThoughts('No block here.') === null, 'no block: null (another preset, or the toggle off)');
ok(U.sceneIdOf('Irene Chanare', ['Sophia', 'Irene']) === 'Irene' && U.sceneIdOf('sophia', ['Sophia']) === 'Sophia' && U.sceneIdOf('Caspian', ['Sophia']) === 'Caspian', 'names match ids (present first, then the roster)');

// ---- the cards
const S = initState();
S.Scene = { Present: { Sophia: { Note: 'water coiled up her arm' }, Irene: { Note: 'clipboard in hand' }, 'Grinning upperclassman': { Note: 'by the fence' } } };
S.Bonds = Object.assign({}, S.Bonds, { Sophia: { Rank: 0, $xp: 2, Trust: 40, Tension: 2 } });
S.$ui = Object.assign({}, S.$ui, { names: ['Sophia'] });   // the story named her (as in the owner's chat)
const text = '<npc_thoughts>\n- **Sophia**: Didn\'t flinch.\n- **Caspian** (the office): Forty minutes.\n</npc_thoughts>';
const out = U.sceneHTML(S, text), h = out.html;
const cards = h.match(/<section class="sc"/g) || [];
ok(cards.length === 3 && out.folded, 'three people present: three cards; the thoughts all moved out of the folded block');
ok(/Sophia Helfin/.test(h) && /Didn&#39;t flinch\.|Didn't flinch\./.test(h) && /water coiled up her arm/.test(h), 'Sophia: full name (a bond), her thought and what she is doing');
ok(/class="portrait"[^>]*src="[^"]*portraits\/sophia\.webp"/.test(h), 'the full portrait, not the thumbnail');
ok(/XP<b>2\/\d+<\/b>/.test(h) && /Trust<b>40<\/b>/.test(h) && /Tension<b>Calm<\/b>/.test(h), 'the people card\'s three meters (bondMeters)');
ok(!/Irene Chanare/.test(h) && /Not met yet/.test(h) && /No thoughts shown this turn/.test(h), 'Irene, not met: no name, no meters; no thought this turn');
ok(/Invented character/.test(h) && /data-eld-keep="Grinning upperclassman"/.test(h), 'an invented character: the Keep button the strip had');
ok(!/class="away"/.test(h) && !/Caspian|Forty minutes|elsewhere/.test(h), '1.99.13 (owner): a thought about someone absent is not shown');
ok(h.indexOf('portraits/sophia') < h.indexOf('Not met yet'), 'people with thoughts get the cards first');

const none = U.sceneHTML(S, 'No block.');
ok((none.html.match(/<section class="sc"/g) || []).length === 3 && !none.folded && !/No thoughts shown/.test(none.html), 'without the preset\'s block: the cards, no thought lines, nothing to unfold');
ok(U.sceneHTML(Object.assign({}, S, { Scene: { Present: {} } }), text).html === '', 'nobody here: no cards');

const crowd = Object.assign({}, S, { Scene: { Present: Object.fromEntries(['Sophia', 'Irene', 'Caspian', 'Florian', 'Dante'].map(k => [k, { Note: '' }])) } });
const c = U.sceneHTML(crowd, text).html;
ok((c.match(/<section class="sc"/g) || []).length === 3 && /class="also"/.test(c) && (c.match(/class="also"[\s\S]*$/)[0].match(/<button/g) || []).length === 2, 'a crowd: three cards, the rest on the "also here" row');

// ---- the bracelet steps aside, the fold hides only where the cards are, the theme reaches the cards
const bar = fs.readFileSync(path.join(ROOT, 'src/ui/statusbar.html'), 'utf8'), ui = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8');
ok(/__eldrasilScene/.test(bar) && /here\.length && !cards/.test(bar), 'the bracelet drops its portrait strip while the cards run');
ok(/\.mes_text\.eld-scene-on details\[data-npc-thoughts\]\{display:none\}/.test(ui), 'the folded thoughts hide only in the reply with the cards');
ok(/themed\(SCENE_CSS\)/.test(ui) && /sceneStyle\(\); render\(\); \}/.test(ui), 'the colour theme re-colours the cards');
