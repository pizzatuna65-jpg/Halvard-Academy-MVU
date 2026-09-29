// Batch 0 (P10): tools/audit_chat.py finds planted drift in a synthetic chat, and stays quiet on clean text.
// The planted words come from the tool's own reading of the canon, so the test follows lore changes.
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const { ok, ROOT } = require('./harness.cjs');
console.log('Drift audit tool (Batch 0)');

const PY = ['python3', 'python', 'py'].find(c => { const r = cp.spawnSync(c, ['-c', 'import sys; print(sys.version_info[0])'], { encoding: 'utf8' }); return r.status === 0 && /3/.test(r.stdout); });
if (!PY) { console.log('  (no Python 3 found: skipped)'); process.exit(0); }
const env = { ...process.env, PYTHONUTF8: '1' };
const py = code => JSON.parse(cp.spawnSync(PY, ['-c', `import sys, json; sys.path.insert(0, ${JSON.stringify(path.join(ROOT, 'tools'))}); import audit_chat as a\n${code}`], { encoding: 'utf8', env }).stdout);

// ---- canon words to plant
const canon = py(`c, al, kn, v = a.load_canon()
print(json.dumps({'kanae': sorted(c['Kanae']['secret']), 'irene': [dict(label=f['label'], rank=f['rank'], terms=sorted(f['terms'])) for f in c['Irene']['locked']]}))`);
ok(canon.kanae.length >= 3, `Kanae has distinctive <narrator_only> words (${canon.kanae.slice(0, 5).join(', ')}…)`);
const lockedField = canon.irene.find(f => f.terms.length >= 2);
ok(!!lockedField, `Irene has a rank-locked field with distinctive words (${lockedField && lockedField.label}, Rank ${lockedField && lockedField.rank})`);

// ---- synthetic chat: MVU state in message variables (msg 2-3), then patches only (msg 5)
const st = (present, rank, revealed = []) => [{ stat_data: { Scene: { Present: Object.fromEntries(present.map(n => [n, { Note: '' }])) }, Bonds: Object.fromEntries(Object.entries(rank).map(([k, r]) => [k, { Rank: r }])), Campus_State: { Secrets_revealed: revealed } } }];
const ai = (mes, variables) => ({ name: 'Eldrasil', is_user: false, is_system: false, mes, swipe_id: 0, ...(variables ? { variables } : {}) });
const user = mes => ({ name: 'Aria', is_user: true, is_system: false, mes });
const secretLine = `Kanae hums over the cards, and the talk drifts to ${canon.kanae.slice(0, 4).join(', ')}.`;
const chat = [
  { user_name: 'Aria', character_name: 'Eldrasil', chat_metadata: {} },
  user('I walk in late.'),
  ai(`Irene shook his head at the clock.\n\n"Curfew was twenty minutes ago," Irene said, already writing.\n\nAiden leaned in the doorway. "Bet you a crown she logs it," he said.`, st(['Irene'], { Irene: 2 })),
  ai(`Irene straightened a stack of papers. "${lockedField.terms.slice(0, 2).join(' and ')}, if you must know," Irene said quietly.\n\nIrenne closed the ledger.`, st(['Irene'], { Irene: 2 })),
  user('I ask Kanae for a reading.'),
  ai(secretLine + '\n\n<UpdateVariable><JSONPatch>[{"op":"replace","path":"/Scene/Present","value":{"Kanae":{"Note":""}}}]</JSONPatch></UpdateVariable>'),
  ai(secretLine + '\n\n<UpdateVariable><JSONPatch>[{"op":"insert","path":"/Campus_State/Secrets_revealed/-","value":"Kanae.readings"}]</JSONPatch></UpdateVariable>'),
  ai(`Irene steadied herself against the desk. "Again," she said.`, st(['Irene'], { Irene: 2 })),
];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eld-audit-'));
const chatFile = path.join(dir, 'synthetic.jsonl'), outJson = path.join(dir, 'out.json'), voiceFile = path.join(dir, 'voice.json');
fs.writeFileSync(chatFile, chat.map(o => JSON.stringify(o)).join('\n'));
fs.writeFileSync(voiceFile, JSON.stringify({ Irene: { never: [{ rx: 'twenty', why: 'test rule' }] } }));
const r = cp.spawnSync(PY, [path.join(ROOT, 'tools/audit_chat.py'), chatFile, '--json', outJson, '--out', path.join(dir, 'r.md'), '--voice', voiceFile], { encoding: 'utf8', env });
ok(r.status === 0, 'the tool runs' + (r.status ? ': ' + r.stderr.slice(-300) : ''));
const F = JSON.parse(fs.readFileSync(outJson, 'utf8')).findings;
const has = (msg, npc, check) => F.some(f => f.msg === msg && f.npc === npc && f.check === check);
ok(has(2, 'Irene', 'pronoun'), '"Irene shook his head" is a pronoun finding');
ok(has(2, 'Aiden', 'present'), 'Aiden speaks but is not in Scene.Present');
ok(!F.some(f => f.npc === 'Irene' && f.check === 'present'), 'Irene speaks and is present: no finding');
ok(has(2, 'Irene', 'voice'), 'a voice rule matches Irene\'s line');
ok(has(3, 'Irene', 'locked'), `Irene says ${lockedField.label} words at Rank 2 (opens at ${lockedField.rank})`);
ok(has(3, 'Irene', 'name'), '"Irenne" is reported as a misspelt name');
ok(has(5, 'Kanae', 'secret'), 'Kanae\'s <narrator_only> words in a reply are reported (state read from the patch)');
ok(!has(6, 'Kanae', 'secret'), 'the same words after "Kanae.readings" is revealed are not');
ok(!F.some(f => f.msg === 7), 'clean text ("Irene steadied herself") gives no finding');
ok(fs.readFileSync(path.join(dir, 'r.md'), 'utf8').includes('| Irene | 2 |'), 'the report lists Irene with her first finding at message 2');
fs.rmSync(dir, { recursive: true, force: true });
