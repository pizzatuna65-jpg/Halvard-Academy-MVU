// 1.66.0 (audit/AUDIT_2026-10-05_1_sistem_memori.md §6, batch 7; M11, M10c): VectFox from the card's side. Each player message
// gets a scene marker "(scene: who · place · tN)" for VectFox's query and keyword boost (hidden from the display and the story
// prompt, dropped by the engine; a cleaning pattern turns it into [Timeline: tN]). The timeline number lives in the chat variable
// eld_tl and grows when a message is sent at a floor the chat already had (a rollback); <now> voids recalled events of the old
// timeline. Every reply's update writes a /Gist; _Recent_story shows the gists older than the chat the narrator reads.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const blk = (ops = []) => `They talk.\n<UpdateVariable>\n<JSONPatch>${JSON.stringify(ops)}</JSONPatch>\n</UpdateVariable>`;
const G = v => ({ op: 'replace', path: '/Gist', value: v });

console.log('the hook: scene marker and timeline');
{
  const H = {}, chatVars = {}, msgVars = {}, chat = [];
  const ctx = {
    eventOn: (ev, fn) => { (H[ev] = H[ev] || []).push(fn); }, eventMakeFirst: (ev, fn) => { (H[ev] = H[ev] || []).unshift(fn); },
    waitGlobalInitialized: async () => {}, Mvu: { events: { VARIABLE_UPDATE_STARTED: 's', COMMAND_PARSED: 'c', VARIABLE_UPDATE_ENDED: 'e' } },
    SillyTavern: { chat }, tavern_events: { MESSAGE_SENT: 'sent', MESSAGE_RECEIVED: 'recv', CHAT_COMPLETION_PROMPT_READY: 'ready' },
    getVariables: o => (o.type === 'chat' ? chatVars : msgVars[o.message_id]),
    updateVariablesWith: (fn, o) => { if (o.type === 'chat') fn(chatVars); },
  };
  new Function(...Object.keys(ctx), rd('src/scripts/engine.js'))(...Object.values(ctx));
  const S = initState({ etnie: true }); S.Scene.Present = { Etnie: { Note: '' }, Irene: { Note: '' } }; S.World.Location = 'Courtyards — the fountain';
  const send = (text, from) => { chat.push({ is_user: true, is_system: !!from, mes: text }); for (const f of H.sent) f(chat.length - 1, from); return chat[chat.length - 1].mes; };
  const reply = () => { chat.push({ is_user: false, mes: 'Reply.' }); msgVars[chat.length - 1] = { stat_data: S }; for (const f of H.recv) f(chat.length - 1); };
  setTimeout(() => {
    msgVars[0] = { stat_data: S }; chat.push({ is_user: false, mes: 'Greeting.' });
    const m1 = send('I wave.');
    ok(m1 === 'I wave.\n(scene: Etnie, Irene · Courtyards · t1)', `a player message gets the marker (${m1.split('\n')[1]})`);
    ok(chatVars.eld_tl.t === 1 && chatVars.eld_tl.top === 1, 'timeline 1, top floor 1');
    reply(); send('I sit.'); reply();
    ok(chatVars.eld_tl.top === 4 && chatVars.eld_tl.void.length === 0, 'going on: no rollback');
    const t0 = send('(player tool)', 'extension');
    ok(t0 === '(player tool)' && chatVars.eld_tl.top === 4, "a message Tavern Helper inserts (player tool, 'extension') is neither marked nor counted");
    chat.splice(3);   // the player deletes back to message 3 and writes again
    const m3 = send('I leave instead.');
    ok(/· t2\)$/.test(m3) && chatVars.eld_tl.t === 2 && JSON.stringify(chatVars.eld_tl.void) === '[{"t":1,"from":3}]', `a message at a floor the chat had: timeline 2, timeline 1 void from message 3 (${JSON.stringify(chatVars.eld_tl)})`);
    const after = _.cloneDeep(S), before = _.cloneDeep(S);
    for (const f of H.e) f({ stat_data: after }, { stat_data: before });
    ok(after.$eng.tl && after.$eng.tl.t === 2 && after.$ui.now.tl && /^t1 \(or with no t\) from message_order 3 on$/.test(after.$ui.now.tl[0]), 'the MVU hook stamps the timeline; <now> lists the void');
    ok(/Rewound story: recalled memories whose scene_time is marked t1 \(or with no t\) from message_order 3 on never happened/.test(renderEntry(card, 505, after)), '<now> prints it');
  }, 20);
}

console.log('the marker is dropped everywhere but VectFox');
{
  const RX = card.data.extensions.regex_scripts.filter(r => /scene marker/.test(r.scriptName));
  const mk = s => new RegExp(s.slice(1, s.lastIndexOf('/')), s.slice(s.lastIndexOf('/') + 1));
  ok(RX.length === 2 && RX.some(r => r.markdownOnly && !r.promptOnly) && RX.some(r => r.promptOnly && !r.markdownOnly) && RX.every(r => 'I wave.' === 'I wave.\n(scene: Etnie · Canteen · t3)'.replace(mk(r.findRegex), '')), 'two card regexes hide it on screen and drop it from the story prompt');
  const pats = JSON.parse(rd('docs/vectfox_cleaning_patterns.json')), p = pats.find(x => /scene marker/.test(x.name));
  ok(p && 'I wave.\n(scene: Etnie · Canteen · t3)\n\nReply.'.replace(new RegExp(p.pattern, p.flags), p.replacement) === 'I wave.\n[Timeline: t3]\n\nReply.', 'VectFox turns it into a timeline line');
  const pr = rd('docs/vectfox_eventbase_prompt.txt');
  ok(/\[Timeline: tN\]/.test(pr) && /"Y1 M3 W2 Mon 13:40 t2"/.test(pr) && /repeats with the same people/.test(pr) && rd('docs/ECOSYSTEM.md').includes(pr.trim().split('\n')[30]), 'the extraction prompt adds tN to scene_time and treats repeated meetings as routine (ECOSYSTEM has the same text)');
  let S = initState({ etnie: true });
  S = applyPatch(S, [{ op: 'replace', path: '/Scene/Present', value: { Etnie: { Note: '' } } }], { text: blk(), user: 'I nod.\n(scene: Etnie, Castor · The Mall · t1)' });
  ok(!(S.$ui.cast.ment || []).includes('Castor') && !/Castor/.test(JSON.stringify(S.$ui.now.focus || {})), 'the engine never reads the marker as the player naming someone');
  ok(/A recalled memory dated after now never happened\./.test(rd('src/worldbook/custom/content/504.txt')), '504: a memory dated after now never happened');
}

console.log('gist');
{
  let S = initState({ etnie: true });
  S = applyPatch(S, [G('Etnie showed {{user}} the fountain.')], { text: blk() });
  ok(S.Gist === '' && S.$eng.gist.length === 1 && /^\[M1 W1 Mon \d\d:\d\d\] Etnie showed/.test(S.$eng.gist[0]) && S._Recent_story.length === 0, 'kept, dated, and not shown while the chat still has it');
  for (let i = 0; i < 14; i++) S = applyPatch(S, i % 3 ? [G(`Beat ${i} happened.`)] : [], { text: blk() });
  ok(S.$eng.gist.length === 15 && S._Recent_story.length === 2 && /Etnie showed/.test(S._Recent_story[0]) && /Beat 1 /.test(S._Recent_story[1]), `older than 12 replies: shown (${S._Recent_story.length}); a reply without a gist still counts`);
  const r = renderEntry(card, 501, S);
  ok(/_Recent_story:\n\s+- "?\[M1 W1 Mon/.test(r) && r.indexOf('_Recent_story') > r.indexOf('Journal:'), '<current_state> prints it after the Journal');
  const T = applyPatch(S, [G('A tool edit.'), { op: 'replace', path: '/$eng/tool', value: 1 }], { text: '' });
  ok(T.$eng.gist.length === 15, 'a player tool adds none');
  const L = applyPatch(S, [G(Array.from({ length: 40 }, (_, i) => 'w' + i).join(' '))], { text: blk() });
  ok(/ w19 …$/.test(L.$eng.gist[L.$eng.gist.length - 1]), 'a long gist is cut to 20 words');
  ok(/Gist \(every reply\): one line, at most 20 words/.test(renderEntry(card, 502, S)) && /\[mvu_update\]/.test(card.data.character_book.entries.find(e => e.id === 502).comment), '502 asks for it ([mvu_update]: the update model writes it in extra-model mode)');
  const O = applyPatch(S, [{ op: 'replace', path: '/$ui/off', value: ['gist'] }, { op: 'replace', path: '/$eng/tool', value: 1 }], { text: '' });
  ok(!O._Recent_story.length && !/Gist \(every reply\)/.test(renderEntry(card, 502, O)), 'off in Features: nothing shown, no rule');
}
