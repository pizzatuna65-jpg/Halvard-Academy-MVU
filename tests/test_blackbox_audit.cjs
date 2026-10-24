// tools/audit_chat.py --blackbox reads a playtest bundle from the Eldrasil Black Box extension (pizzatuna65-jpg/Eldrasil-BlackBox,
// format eldrasil-blackbox-bundle v1): totals, cache misses, prompt parts, saves and engine signals; the chat slice for the other reports.
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), zlib = require('zlib');
const { ok, ROOT } = require('./harness.cjs');
console.log('Black Box bundle audit (audit_chat.py --blackbox)');

const PY = ['python3', 'python', 'py'].find(c => { const r = cp.spawnSync(c, ['-c', 'import sys; print(sys.version_info[0])'], { encoding: 'utf8' }); return r.status === 0 && /3/.test(r.stdout); });
if (!PY) { console.log('  (no Python 3 found: skipped)'); process.exit(0); }
const env = { ...process.env, PYTHONUTF8: '1' };

const seg = (label, src, chars) => ({ label, src, chars });
const turn = (id, mesId, input, cached, extra = {}) => ({
  id, chatId: 'Eldrasil - test', kind: 'main', genType: 'normal', mesId, swipeId: 0, tStart: 1000, tFetch: 1200, tFirst: 2200, tEnd: 9200,
  usage: { inputTokens: input, cachedInputTokens: cached, outputTokens: 800 }, cost: 0.02, complete: true, promptChars: 1000,
  segments: [seg('<now> (505)', 'card', 400), seg('Chat history', 'history', 500), seg('Lore: Main Library', 'lore', 100)],
  lore: [{ world: 'Eldrasil', uid: 41, comment: 'Main Library', constant: false }], cardVersion: '1.99.13', ...extra,
});
const bundle = {
  format: 'eldrasil-blackbox-bundle', version: 1,
  manifest: { extension: '1.0.0', chatId: 'Eldrasil - test', cardVersion: '1.99.13', turns: 3, replies: 2, chatFrom: 10, chatMessages: 4, includePrompts: false,
    save: { sizeBytes: 50 * 1048576 } },
  turns: [
    turn('a', 11, 40000, 36000, { save: { ms: 900 } }),
    { id: 'b', kind: 'background', genType: 'quiet', mesId: null, usage: { inputTokens: 3000, cachedInputTokens: 0, outputTokens: 200 }, cost: 0.001, tFetch: 9300, complete: true },
    turn('c', 13, 40000, 1000, { save: { ms: 2600 }, signals: { eldrasil: true, floor: 13, log: ['Engine error (x): this update was not applied'], engineError: true, missed: ['Write the Journal line'] } }),
  ],
  texts: {},
  chat: { header: { chat_metadata: {}, user_name: 'unused', character_name: 'unused' }, from: 10,
    messages: [{ name: 'A', is_user: true, mes: 'I walk in.' }, { name: 'Eldrasil', is_user: false, mes: 'The doors creak.', swipe_id: 0 },
      { name: 'A', is_user: true, mes: 'I look.' }, { name: 'Eldrasil', is_user: false, mes: 'Dust.', swipe_id: 0 }] },
};
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eld-bb-'));
const file = path.join(dir, 'blackbox_test_11-13.json.gz'), outJson = path.join(dir, 'out.json'), outMd = path.join(dir, 'out.md');
fs.writeFileSync(file, zlib.gzipSync(JSON.stringify(bundle)));
const r = cp.spawnSync(PY, [path.join(ROOT, 'tools/audit_chat.py'), file, '--blackbox', '--no-drift', '--json', outJson, '--out', outMd], { encoding: 'utf8', env });
ok(r.status === 0, 'the tool reads a gzip bundle' + (r.status ? ': ' + r.stderr.slice(-400) : ''));
const B = JSON.parse(fs.readFileSync(outJson, 'utf8')).blackbox;
ok(B.replies.requests === 2 && B.replies.input === 80000 && B.replies.cached === 37000, 'reply totals: 2 replies, 80,000 input, 37,000 cached');
ok(Math.abs(B.replies.cost - 0.04) < 1e-9 && B.background.requests === 1 && B.background_kinds.quiet === 1, 'cost and the background request apart');
ok(B.misses === 1 && B.rows[1].miss && !B.rows[0].miss, 'one cache miss (msg 13)');
ok(B.rows[1].engine_error && B.rows[1].reminders === 1 && B.engine.length === 2, 'engine error and reminder of msg 13');
ok(Math.round(B.groups.card) === 16000 && Math.round(B.groups.history) === 20000 && Math.round(B.groups.lore) === 4000, 'prompt parts shared out by characters');
ok(B.saves.count === 2 && B.saves.max === 2600 && B.saves.size === 50 * 1048576, 'saves after replies and the file size');
const md = fs.readFileSync(outMd, 'utf8');
ok(md.includes('## Black Box: Eldrasil - test') && md.includes('chat slice from message 10') && md.includes('| 13 | 40,000 | 1,000 | 2.5%'), 'the report names the slice and lists msg 13');
ok(fs.existsSync(path.join(dir, 'blackbox_test_11-13.chat.jsonl')), 'the chat slice is written as .jsonl for the other reports');
const bad = path.join(dir, 'bad.json');
fs.writeFileSync(bad, '{"format":"other"}');
ok(cp.spawnSync(PY, [path.join(ROOT, 'tools/audit_chat.py'), bad, '--blackbox', '--no-drift'], { encoding: 'utf8', env }).status !== 0, 'a file that is not a bundle is refused');
fs.rmSync(dir, { recursive: true, force: true });
