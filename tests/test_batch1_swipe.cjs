// Batch 1: player-tool edits must leave the last narrator reply swipeable and replay-safe.
const fs = require('fs'), path = require('path'), assert = require('assert');
const source = fs.readFileSync(path.join(__dirname, '../src/scripts/ui.js'), 'utf8');
const start = source.indexOf('async function writeToolMessage(');
const end = source.indexOf('async function commit()', start);
assert(start >= 0 && end > start);
const clone = x => JSON.parse(JSON.stringify(x));

async function run(initial, current, expected) {
  const chat = clone(initial), refreshes = [];
  const getLastMessageId = () => chat.length - 1;
  const getChatMessages = id => chat[id] ? [chat[id]] : [];
  const getVariables = ({ message_id }) => chat[message_id]?.data;
  const createChatMessages = async ([message], opts) => {
    if (opts.insert_before === undefined) chat.push(message);
    else chat.splice(opts.insert_before, 0, message);
  };
  const Mvu = {
    parseMessage: async (_text, data) => {
      data.stat_data.tool = (data.stat_data.tool || 0) + 1;
      return data;
    },
    replaceMvuData: async (data, { message_id }) => { chat[message_id].data = clone(data); },
  };
  const setChatMessages = async (messages, opts) => refreshes.push({ messages, opts });
  const SillyTavern = { saveChat: async () => {} };
  const _ = { cloneDeep: clone };
  const writeToolMessage = new Function('getLastMessageId', 'getChatMessages', 'getVariables', 'createChatMessages', 'Mvu',
    'setChatMessages', 'SillyTavern', '_', source.slice(start, end) + '\nreturn writeToolMessage;')(
      getLastMessageId, getChatMessages, getVariables, createChatMessages, Mvu, setChatMessages, SillyTavern, _);
  await writeToolMessage('setting', clone(current));
  assert.equal(chat.at(-1).role, expected.lastRole);
  assert.equal(chat.at(-1).data.stat_data.tool, expected.lastTool);
  assert.deepEqual(refreshes.at(-1).opts.refresh, expected.refresh);
  return chat;
}

(async () => {
  const floor = (story, tool = 0) => ({ stat_data: { World: { Time: '08:00' }, story, tool } });
  const chat = await run([
    { role: 'user', message: 'action', data: floor(0) },
    { role: 'assistant', message: 'first reply', data: floor(1) },
  ], floor(1, 1), { lastRole: 'assistant', lastTool: 1, refresh: 'all' });
  assert.equal(chat.length, 3);
  assert.equal(chat[1].is_hidden, true);
  assert.equal(chat[1].data.stat_data.story, 0, 'pre-reply floor excludes the rejected narration');
  assert.equal(chat[1].data.stat_data.tool, 1, 'the edit survives a swipe');
  assert.equal(chat[2].data.stat_data.story, 1, 'the selected reply keeps its current story state');

  const again = await run(chat, floor(1, 2), { lastRole: 'assistant', lastTool: 2, refresh: 'all' });
  assert.equal(again[2].data.stat_data.story, 0);
  assert.equal(again[2].data.stat_data.tool, 2, 'multiple edits keep their order before the reply');

  const greeting = await run([{ role: 'assistant', message: 'greeting', data: floor(0) }], floor(0, 1),
    { lastRole: 'user', lastTool: 1, refresh: 'affected' });
  assert.equal(greeting.at(-1).is_hidden, true, 'a greeting with no prior floor uses the safe append path');

  const bar = fs.readFileSync(path.join(__dirname, '../src/ui/statusbar.html'), 'utf8');
  assert(bar.includes('data-open="profile:bag"'));
  assert(bar.includes("(!ui.built ? '<button class=\"btn opt\" data-open=\"builder\""));
  assert(source.includes('if (panel === \'profile\' && arg) view.tab = arg;'));
  assert(source.includes('Edit student file'));
  console.log('ALL PASSED — Batch 1 swipe/state and navigation checks');
})().catch(e => { console.error(e); process.exitCode = 1; });
