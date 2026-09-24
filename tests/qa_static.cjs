// Batch 5.4 static QA over the BUILT card (dist/). Run after build: NODE_PATH=<zod lodash yaml ejs> node tests/qa_static.cjs
const fs = require('fs'), path = require('path'), zlib = require('zlib'), cp = require('child_process');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const ejs = require('ejs');
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const E = card.character_book.entries;

console.log('card file');
const png = fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.png'));
const texts = []; for (let p = 8; p < png.length;) { const l = png.readUInt32BE(p), t = png.toString('latin1', p + 4, p + 8); if (t === 'tEXt') texts.push(png.toString('latin1', p + 8, p + 8 + l).split('\0')); p += 12 + l; }
const embedded = Object.fromEntries(texts.map(([k, v]) => [k, JSON.parse(Buffer.from(v, 'base64').toString('utf8'))]));
ok(embedded.chara && embedded.ccv3, 'PNG carries chara (v2) and ccv3');
ok(embedded.ccv3.data.character_version === card.character_version, `PNG matches dist JSON (version ${card.character_version})`);
ok(card.first_mes.includes('<StatusPlaceHolderImpl/>'), 'first message carries the status bar placeholder');

console.log('worldbook');
ok(new Set(E.map(e => e.id)).size === E.length, `${E.length} entries, unique uids`);
const dead = E.filter(e => e.enabled && !e.constant && !(e.keys || []).length);
ok(!dead.length, 'no enabled non-constant entry without keys' + (dead.length ? ': ' + dead.map(e => e.id).join(',') : ''));
const untagged = E.filter(e => e.enabled && !/\[mvu_(update|plot)\]/i.test(e.comment)).map(e => e.id).sort((a, b) => a - b);
ok(JSON.stringify(untagged) === JSON.stringify([0, 20, 97, 131, 132, 134, 501, 505]), `untagged entries (sent to both models) are the planned set: ${untagged}`);
const co = E.filter(e => e.comment.trim().toLowerCase() === '[config_override]');
ok(co.length === 1 && !co[0].enabled && JSON.parse(co[0].content)['更新方式'] === '随AI输出', 'exactly one disabled [config_override] with valid JSON');
const init = E.find(e => /\[initvar\]/.test(e.comment));
ok(init && !init.enabled, '[initvar] present and disabled');

console.log('EJS entries render for every month and a mid-game state');
const S0 = initState();
let bad = [];
for (const e of E.filter(x => /<%/.test(x.content))) {
  for (let m = 1; m <= 12; m++) for (const w of [1, 4]) {
    const S = applyPatch(S0, [{ op: 'replace', path: '/World/Month', value: m }, { op: 'replace', path: '/World/Week', value: w }]);
    try { ejs.render(e.content, { getvar: k => _.get({ stat_data: S }, k) }); } catch (err) { bad.push(`${e.id} M${m}W${w}: ${err.message.split('\n').pop()}`); }
  }
}
ok(!bad.length, `EJS entries (${E.filter(x => /<%/.test(x.content)).map(x => x.id)}) render without errors` + (bad.length ? ': ' + bad.slice(0, 3) : ''));
try { ejs.render(E.find(e => e.id === 505).content, { getvar: () => undefined }); ok(true, 'Now entry survives an empty state (first load)'); } catch (e) { ok(false, 'Now entry on empty state: ' + e.message); }

console.log('regex');
const R = card.extensions.regex_scripts;
ok(R.every(r => { try { const m = r.findRegex.match(/^\/([\s\S]*)\/([a-z]*)$/); new RegExp(m[1], m[2]); return true; } catch (e) { return false; } }), `${R.length} regex scripts compile`);
ok(R.filter(r => r.promptOnly).every(r => !r.markdownOnly), 'prompt-only scripts are not also markdown-only');
ok(R.find(r => /State-as-memory/.test(r.scriptName)).minDepth >= 10, 'state-as-memory trims only far chat');

console.log('scripts');
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'eldqa-'));
for (const s of card.extensions.tavern_helper.scripts) {
  const f = path.join(tmp, s.name.replace(/\W+/g, '_') + '.mjs'); fs.writeFileSync(f, s.content);
  let err = ''; try { cp.execFileSync('node', ['--check', f], { stdio: 'pipe' }); } catch (e) { err = String(e.stderr).split('\n').slice(0, 4).join(' '); }
  ok(!err, `script "${s.name}" parses` + (err ? ': ' + err : ''));
  ok(!/\b(localStorage|sessionStorage)\b/.test(s.content), `script "${s.name}" uses no browser storage`);
}
const eng = card.extensions.tavern_helper.scripts.find(s => s.name === 'Engine').content;
ok(!/Math\.random\(/.test(eng.replace(/\/\/.*$/gm, '')), 'engine never calls Math.random() (plan 4.6)');
const ui = card.extensions.tavern_helper.scripts.find(s => s.name === 'Eldrasil UI').content;
ok(!/eldrasil-assets@main/.test(ui + card.extensions.regex_scripts.map(r => r.replaceString).join('')), 'assets are pinned (no @main)');
