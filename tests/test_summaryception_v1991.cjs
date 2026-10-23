// 1.99.1: Summaryception (Lodactio 5.5.4) as the second memory option beside VectFox (docs/ECOSYSTEM.md "Summaryception").
// Its user prompt fills {{player_name}}, {{context_str}} and {{story_txt}} once each (String.replace) and ST macros only in Default
// mode; its template fills {{summary}}; it reads the raw `mes`; it hides summarised messages (/hide, extra.sc_ghosted).
const fs = require('fs'), path = require('path');
const { ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const FILES = ['summaryception_prompt.txt', 'summaryception_system_prompt.txt', 'summaryception_injection_template.txt'];

console.log('the download files');
for (const f of FILES) ok(fs.existsSync(path.join(ROOT, 'dist', f)) && rd('dist/' + f) === rd('src/summaryception/' + f), `dist/${f} is the copy of src/summaryception/${f}`);
const prompt = rd('src/summaryception/summaryception_prompt.txt'), tpl = rd('src/summaryception/summaryception_injection_template.txt');
const count = (s, t) => s.split(t).length - 1;
ok(['{{player_name}}', '{{context_str}}', '{{story_txt}}'].every(p => count(prompt, p) === 1), 'the prompt uses each of its three placeholders exactly once');
ok((prompt.match(/\{\{[^}]*\}\}/g) || []).length === 3 && !/\$[&'`$]/.test(prompt), 'no other {{macro}} (not filled outside Default mode) and no $ replacement pattern');
ok(/<UpdateVariable>/.test(prompt) && /<npc_thoughts>/.test(prompt) && /\(scene: /.test(prompt) && /older record lines/i.test(prompt),
  'the prompt names the raw blocks it reads past and handles both passages (chat, older record lines)');
ok(/\[Y1 M1 W2 Tue 09:10, Main Library\]/.test(prompt) && /At most 50 words/.test(prompt), 'each record line starts with the in-world date and place');
ok(count(tpl, '{{summary}}') === 1 && /<story_before_chat>[\s\S]*\{\{summary\}\}[\s\S]*<\/story_before_chat>/.test(tpl) && /not the player's message/.test(tpl),
  'the template wraps the record in <story_before_chat> and says it is not the player\'s message');
ok(/<VectFoxMemory> and <story_before_chat> are the past/.test(rd('src/worldbook/custom/content/503.txt')), '503 names both memory blocks as the past');

console.log('the engine');
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { floorOf, scChecks, scText, SC_VERBATIM_MAX };')();
{
  const chat = [
    { mes: 'I go to the Archive.', is_user: true, is_system: true, extra: { sc_ghosted: true }, send_date: 'd1' },
    { mes: 'reply one', is_user: false, is_system: true, extra: { sc_ghosted: true }, send_date: 'd2' },
    { mes: '(player tool) Settings', is_user: true, is_system: true, send_date: 'd3' },
    { mes: 'reply two', is_user: false, send_date: 'd4' },
  ];
  ok(E.floorOf(chat, 'reply one').said === 'I go to the Archive.', 'a replayed floor Summaryception hid still reads its player message');
  ok(E.floorOf(chat, 'reply two').said === 'I go to the Archive.', 'a hidden player tool entry is still skipped');
  ok(E.floorOf([{ mes: 'hidden by hand', is_user: true, is_system: true }, { mes: 'r', is_user: false }], 'r').said === '', 'a message the player hid by hand is still skipped');
}
{
  const C = (o) => E.scChecks(Object.assign({ loaded: true, settings: { enabled: true, verbatimTurns: 10 }, store: { summarizedUpTo: 40 }, chatLength: 60 }, o));
  ok(E.SC_VERBATIM_MAX === 11 && C({}).verbatim === 0 && C({ settings: { enabled: true, verbatimTurns: 11 } }).verbatim === 0, 'Verbatim Turns 10 or 11: no warning');
  ok(C({ settings: { enabled: true, verbatimTurns: 25 } }).verbatim === 25 && /keeps 25 replies/.test(E.scText.verbatim(25)), 'Verbatim Turns 25: warned');
  ok(!C({ settings: { enabled: false, verbatimTurns: 25 } }).verbatim && !C({ loaded: false, settings: { verbatimTurns: 25 } }).verbatim, 'Summaryception off or not installed: no warning');
  ok(!C({}).stale && C({ chatLength: 40 }).stale && C({ chatLength: 12 }).stale, 'deleted back into what it summarised: stale');
  ok(!C({ store: undefined, chatLength: 0 }).stale && !C({ store: { summarizedUpTo: -1 }, chatLength: 0 }).stale && !C({ loaded: false, chatLength: 1 }).stale, 'no record, or not installed: not stale');
}
