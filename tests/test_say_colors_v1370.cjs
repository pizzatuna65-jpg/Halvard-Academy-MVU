// 1.37.0 (owner): dialogue colours. The narrator wraps each spoken line in <say:Name>; the card's display regex makes it a
// <span data-say>, and the UI colours it from the card's data (roster) or the engine's $say hue (Extras). Unnamed or unrecorded
// speakers share the generic colour. The colour never reaches the prompt.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { sayCss, DATA };')();
console.log('Dialogue colours 1.37.0');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')).data;
const E = uid => card.character_book.entries.find(e => e.id === uid);
const R = (uid, S) => ejs.render(E(uid).content, { getvar: k => _.get({ stat_data: S }, k) });

// ---- data: a palette of light colours that differ by kind; every roster character has three
const npcs = JSON.parse(rd('data/npcs.json')), col = JSON.parse(rd('data/dialogue_colors.json'));
const K = col.palette.length, D = col.dist;
ok(K >= 12 && Math.min(...D.flatMap((r, i) => r.filter((_, j) => j > i))) >= 9.5, `${K} colours, every two at least 9.5 apart (OKLab x100)`);
ok(col.palette.every(p => p.dark[1] >= 72 && p.light[1] >= 50), '1.37.2: no dark colours (dark theme lightness 72+, light theme 50+)');
ok(Object.keys(npcs).every(id => { const t = col.npcs[id]; return Array.isArray(t) && t.length === 3 && new Set(t).size === 3 && t.every(i => Number.isInteger(i) && i >= 0 && i < K); }), 'every roster character has a first, second and third colour');
ok(U.DATA.say.who.irene === 'Irene' && U.DATA.say.who['irene chanare'] === 'Irene' && U.DATA.say.who.chanare === 'Irene', 'every name Irene goes by points to her');

// ---- the display regex
const rx = card.extensions.regex_scripts.find(r => /speaker tag/.test(r.scriptName));
const m = rx.findRegex.match(/^\/(.*)\/(\w*)$/s), RX = new RegExp(m[1], m[2]);
const shown = '<say:Irene>"Sit down."</say> She waits. <say:Aiden:shout>“Oi!”</say> <say>"Next!"</say>'.replace(RX, (...a) => rx.replaceString.replace(/\$(\d)/g, (_, n) => a[n] || ''));
ok(shown === '"<span data-say="Irene" data-tone="">Sit down.</span>" She waits. “<span data-say="Aiden" data-tone="shout">Oi!</span>” "<span data-say="" data-tone="">Next!</span>"', 'the tag becomes a span outside the quotes, with the tone');
ok(rx.placement.join() === '2' && rx.markdownOnly && !rx.promptOnly, 'display only, on replies');
const strip = card.extensions.regex_scripts.find(r => /older replies/.test(r.scriptName));
ok(strip && strip.promptOnly && strip.minDepth === 4, 'older replies reach the prompt without the tags (the newest keep them as examples)');

// ---- engine: nobody present at the same time shares a colour; a newcomer takes their second, then third colour; leaving resets
let S = initState();
const at = (time, ops, text) => { S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...ops], { text: text || '' }); };
const here = o => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(Object.keys(o).map(k => [k, { Note: o[k] }])) });
const colour = id => (id in S.$ui.say ? S.$ui.say[id] : col.npcs[id][0]);
const Y1 = Object.keys(npcs).filter(id => !(npcs[id].arrives > 1));   // anyone already at Halvard in campaign Year 1
const pairOn = (c, not = []) => Y1.find(id => col.npcs[id][0] === c && !not.includes(id));
const a1 = Y1.find(id => Y1.some(o => o !== id && col.npcs[o][0] === col.npcs[id][0]));
const a2 = pairOn(col.npcs[a1][0], [a1]);
at('09:00', [here({ [a1]: 'reading' })]);
ok(colour(a1) === col.npcs[a1][0], `${a1} alone: first colour`);
at('09:10', [here({ [a1]: 'reading', [a2]: 'arrives' })]);
ok(colour(a1) === col.npcs[a1][0] && colour(a2) === col.npcs[a2][1], `${a2} arrives on ${a1}'s colour: ${a1} keeps it, ${a2} takes their second`);
const a3 = Y1.find(id => col.npcs[id][0] === col.npcs[a2][1] && ![a1, a2].includes(id));
if (a3) {
  at('09:15', [here({ [a1]: 'reading', [a3]: 'here first' })]); at('09:16', [here({ [a1]: 'reading', [a3]: 'here first', [a2]: 'back' })]);
  ok(colour(a2) === (col.npcs[a2].find(i => i !== colour(a1) && i !== colour(a3))), `with their first and second taken, ${a2} takes their third`);
}
at('09:20', [here({})]); at('09:30', [here({ [a2]: 'alone' })]);
ok(colour(a2) === col.npcs[a2][0], 'alone again: back to the first colour');
at('10:00', [here({ Irene: 'desk', Etnie: 'tea', Kanae: 'book', Aiden: 'cards', Castor: 'ledger', Zara: 'notes', Rei: 'door', Caine: 'window', Ruby: 'cake', Percival: 'lute', Tilly: 'mop', Alyssa: 'quill' })]);
const twelve = ['Irene', 'Etnie', 'Kanae', 'Aiden', 'Castor', 'Zara', 'Rei', 'Caine', 'Ruby', 'Percival', 'Tilly', 'Alyssa'].map(colour);
ok(new Set(twelve).size === 12, 'twelve people in one scene: twelve different colours');
at('11:00', [here({ 'Marta Bellweather': 'till', Irene: 'queue' }), { op: 'replace', path: '/Extras/Marta Bellweather', value: { Who: 'Commissary clerk' } }]);
at('11:05', [here({ 'Marta Bellweather': 'till', Irene: 'queue', 'a porter': 'boxes' })]);
ok(S.$ui.sayx['Marta Bellweather'].length === 3 && Number.isInteger(S.$ui.say['Marta Bellweather']) && S.$ui.say['Marta Bellweather'] !== colour('Irene') && !('a porter' in S.$ui.say), 'a recorded Extra gets three colours and one of their own here; an unrecorded one stays generic');
ok(!/say/.test(R(501, S).replace(/<say/g, '')), 'the narrator never sees the colours');

// ---- engine: a speaker tag counts as speaking (cast order)
at('09:30', [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'at the desk' }, Kanae: { Note: 'reading' } } }], '<say:Kanae>"Mm."</say> She turns a page.');
ok(S.$ui.cast.spoke.includes('Kanae'), 'a <say:Name> tag marks its speaker');

// ---- rules: on by default, gated by the feature
ok(/<say:Irene>"Sit down\."<\/say>/.test(R(504, S)) && /<say:Name> tag/.test(R(510, S)), '504 explains the tag; 510 reminds at depth 0');
const off = _.cloneDeep(S); off.$ui.on = Object.assign({}, off.$ui.on, { say_colors: false });
ok(!/<say/.test(R(504, off)) && !/<say/.test(R(510, off)), 'Features > Dialogue colours off: no tag rule');

// ---- UI: one stylesheet in SillyTavern's page
const css = U.sayCss(S, true), P = c => `{color:oklch(${c[1]}% ${c[2] / 100} ${c[0]})}`;
const ruleFor = name => css.split('\n').find(l => l.includes(`span[data-say="${name}" i]`)) || '';
ok(ruleFor('irene').endsWith(P(col.palette[colour('Irene')].dark)) && ruleFor('irene') === ruleFor('chanare'), 'Irene in her colour (dark theme), by every name');
at('12:00', [here({ [a1]: 'reading', [a2]: 'arrives' })]);
ok(U.sayCss(S, true).split('\n').find(l => l.includes(`span[data-say="${a2.toLowerCase()}" i]`)).endsWith(P(col.palette[col.npcs[a2][1]].dark)), 'a second colour shows while it is in use');
ok(ruleFor('marta').endsWith(P(col.palette[S.$ui.sayx['Marta Bellweather'][0]].dark)) && ruleFor('marta') === ruleFor('marta bellweather'), 'Marta in her colour, by full and first name');
ok(css.startsWith(`.mes_text span[data-say]${P(col.generic.dark)}`), 'everyone else: the generic colour');
ok(U.sayCss({ ...S, Player: { Profile: { Name: 'Aria Vale' } } }, true).includes(`span[data-say="aria vale" i]${P(col.user.dark)}`), "{{user}}'s own lines in the player colour");
ok(U.sayCss(S, false).includes(P(col.palette[colour('Irene')].light)), 'a light theme gets the darker set');
