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

// ---- data: every roster character has one colour of their own
const npcs = JSON.parse(rd('data/npcs.json')), col = JSON.parse(rd('data/dialogue_colors.json'));
ok(Object.keys(npcs).every(id => Array.isArray(col.npcs[id])), 'every roster character has a dialogue colour');
ok(new Set(Object.values(col.npcs).map(c => c.join())).size === Object.keys(col.npcs).length && Object.values(col.npcs).every(([h, b]) => h >= 0 && h < 360 && (b === 0 || b === 1)), 'no two roster characters share a colour');
ok(U.DATA.say.who.irene && U.DATA.say.who['irene chanare'] && U.DATA.say.who.chanare, 'every name Irene goes by maps to her colour');

// ---- the display regex
const rx = card.extensions.regex_scripts.find(r => /speaker tag/.test(r.scriptName));
const m = rx.findRegex.match(/^\/(.*)\/(\w*)$/s), RX = new RegExp(m[1], m[2]);
const shown = '<say:Irene>"Sit down."</say> She waits. <say:Aiden:shout>“Oi!”</say> <say>"Next!"</say>'.replace(RX, (...a) => rx.replaceString.replace(/\$(\d)/g, (_, n) => a[n] || ''));
ok(shown === '"<span data-say="Irene" data-tone="">Sit down.</span>" She waits. “<span data-say="Aiden" data-tone="shout">Oi!</span>” "<span data-say="" data-tone="">Next!</span>"', 'the tag becomes a span outside the quotes, with the tone');
ok(rx.placement.join() === '2' && rx.markdownOnly && !rx.promptOnly, 'display only, on replies');
const strip = card.extensions.regex_scripts.find(r => /older replies/.test(r.scriptName));
ok(strip && strip.promptOnly && strip.minDepth === 4, 'older replies reach the prompt without the tags (the newest keep them as examples)');

// ---- engine: an Extras record gets a hue when it is written; two records get different hues
let S = initState();
const at = (time, ops, text) => { S = applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...ops], { text: text || '' }); };
at('09:00', [{ op: 'replace', path: '/Extras/Marta Bellweather', value: { Who: 'Commissary clerk' } }, { op: 'replace', path: '/Extras/Old Tom', value: { Who: '' } }]);
const h1 = S.Extras['Marta Bellweather'].$say;
ok(h1 >= 0 && S.Extras['Old Tom'].$say === -1, 'a written record gets a hue; an empty one waits');
at('09:10', [{ op: 'replace', path: '/Extras/Old Tom', value: { Who: 'gardener' } }]);
ok(S.Extras['Old Tom'].$say >= 0 && Math.min(Math.abs(S.Extras['Old Tom'].$say - h1), 360 - Math.abs(S.Extras['Old Tom'].$say - h1)) >= 90, 'the second record gets a hue far from the first');
at('09:20', []);
ok(S.Extras['Marta Bellweather'].$say === h1, 'the hue stays');
ok(!/\$say/.test(R(501, S)), 'the narrator never sees $say');

// ---- engine: a speaker tag counts as speaking (cast order)
at('09:30', [{ op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'at the desk' }, Kanae: { Note: 'reading' } } }], '<say:Kanae>"Mm."</say> She turns a page.');
ok(S.$ui.cast.spoke.includes('Kanae'), 'a <say:Name> tag marks its speaker');

// ---- rules: on by default, gated by the feature
ok(/<say:Irene>"Sit down\."<\/say>/.test(R(504, S)) && /<say:Name> tag/.test(R(510, S)), '504 explains the tag; 510 reminds at depth 0');
const off = _.cloneDeep(S); off.$ui.on = Object.assign({}, off.$ui.on, { say_colors: false });
ok(!/<say/.test(R(504, off)) && !/<say/.test(R(510, off)), 'Features > Dialogue colours off: no tag rule');

// ---- UI: one stylesheet in SillyTavern's page
const css = U.sayCss(S, true), ir = U.DATA.say.who.irene;
const ruleFor = name => css.split('\n').find(l => l.includes(`span[data-say="${name}" i]`)) || '';
ok(ruleFor('irene').endsWith(`{color:oklch(${ir[1] ? '68% 0.11' : '80% 0.14'} ${ir[0]})}`) && ruleFor('irene') === ruleFor('chanare'), 'Irene in her colour (dark theme), by every name');
ok(ruleFor('marta').endsWith(`{color:oklch(74% 0.1 ${h1})}`) && ruleFor('marta') === ruleFor('marta bellweather'), 'Marta in her Extras colour, by full and first name');
ok(/^\.mes_text span\[data-say\]\{color:oklch\(74% 0.02 250\)\}/.test(css), 'everyone else: the generic colour');
ok(/span\[data-say="aria vale" i\]\{color:oklch\(90% 0.04 80\)/.test(U.sayCss({ ...S, Player: { Profile: { Name: 'Aria Vale' } } }, true)), "{{user}}'s own lines in the player colour");
ok(/oklch\(50% 0.14 /.test(U.sayCss(S, false)) && !/oklch\(80%/.test(U.sayCss(S, false)), 'a light theme gets darker colours');
