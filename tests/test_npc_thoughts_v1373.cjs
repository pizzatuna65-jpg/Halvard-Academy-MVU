// 1.37.3 (owner): the preset's Internal Thoughts is ON again as a <npc_thoughts> block of its own (no Internal States), written
// before the card's update block; the preset folds it on screen and drops it from older replies; VectFox never stores it.
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
console.log('NPC Thoughts (1.37.3)');
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Realistic_Frankenstein_2_2_1_3_Eldrasil.json'), 'utf8'));
const byName = frag => P.prompts.find(p => (p.name || '').includes(frag));
const on = frag => P.prompt_order[0].order.find(o => o.identifier === byName(frag).identifier).enabled;
const IT = byName('Internal Thoughts').content;
ok(on('Internal Thoughts') && !on('Internal States 💾'), 'Internal Thoughts ON, Internal States stays OFF');
ok(IT.includes('<npc_thoughts>') && !/thoughtsTemplate|Eldrasil|Bond|Mind\b/.test(IT), 'its own block, no Internal States template, no card data');
ok(/Never \{\{user\}\}/.test(IT) && /never spells out a secret/.test(IT) && /update block stays last/.test(IT), 'never {{user}}, no spoiled secrets, the update block stays last');
ok(/right before the card's state-update block when there is one, and the update block stays last/.test(IT) && !byName('Internal Thoughts').injection_trigger.includes('impersonate'), 'the block sits before the update block; it skips Impersonate (1.68.0: upstream triggers)');

const rx = name => { const r = P.extensions.regex_scripts.find(x => x.scriptName.includes(name)); const m = r.findRegex.match(/^\/([\s\S]*)\/([a-z]*)$/); return [r, new RegExp(m[1], m[2])]; };
const reply = 'Irene looks up.\n\n<npc_thoughts>\n- **Irene**: late again. Why do I care.\n</npc_thoughts>\n\n<UpdateVariable>\n[]\n</UpdateVariable>';
const [fold, F] = rx('NPC Thoughts: fold'), [trim, T] = rx('NPC Thoughts: drop');
const shown = reply.replace(F, fold.replaceString);
ok(fold.markdownOnly && /<details data-npc-thoughts="1"[^>]*><summary[^>]*>🧠 Thoughts<\/summary>\n\n- \*\*Irene\*\*: late again\. Why do I care\.\n\n<\/details>/.test(shown) && !shown.includes('npc_thoughts>'), 'display: folded into details[data-npc-thoughts]');
const sent = reply.replace(T, trim.replaceString);
ok(trim.promptOnly && trim.minDepth === 3 && sent === 'Irene looks up.\n\n<UpdateVariable>\n[]\n</UpdateVariable>', 'prompt: older replies lose the block, the newest two keep it');

const pats = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/vectfox_cleaning_patterns.json'), 'utf8'));
const clean = pats.filter(p => p.enabled !== false).reduce((s, p) => s.replace(new RegExp(p.pattern, p.flags || 'g'), p.replacement || ''), reply);
ok(!/late again|npc_thoughts/.test(clean) && clean.includes('Irene looks up.'), 'VectFox: thoughts never enter memory, the prose stays');
const ui = fs.readFileSync(path.join(ROOT, 'src/scripts/ui.template.js'), 'utf8');
ok(/function thoughtsCss/.test(ui) && /sayCss\(S, lightText\) \+ '\\n' \+ thoughtsCss\(lightText\)/.test(ui), 'card UI styles the block in brass');

// 1.37.4: thoughts only as raw as the character is; an optional regex (OFF) keeps the AI from reading any thoughts back
ok(/only as raw as that character is/.test(IT) && /never more emotional or dramatic than their card/.test(IT), '1.37.4: a calm character thinks calmly');
const [all, A] = rx('NPC Thoughts: drop from every reply');
ok(all.disabled && all.promptOnly && all.minDepth == null && reply.replace(A, all.replaceString) === sent && /drop from every reply/.test(IT), '1.37.4: optional drop-from-every-reply regex, OFF, named in the toggle note');

// 1.99.13 (owner): only NPCs in the scene; no "where they are" line for anyone absent; no NPC here, no block
ok(/up to 3 NPCs who are in the scene right now/.test(IT) && /never someone absent, only mentioned or remembered/.test(IT) && /With no NPC in the scene, write no block/.test(IT) && !/where they are|An absent NPC appears/.test(IT), '1.99.13: thoughts only for NPCs in the scene');
