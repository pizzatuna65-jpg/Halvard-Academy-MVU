// 1.53.1 (narrator-load audit U10, batch 2): tools/audit_chat.py --mechanics on a small made-up chat. The block sizes, the engine work the
// narrator did itself, and what the replay through the current engine (tools/replay_chat.cjs) had to correct.
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const { ok, ROOT } = require('./harness.cjs');
const blk = (analysis, ops, tags = true) => `Prose.\n\n<UpdateVariable>\n<Analysis>\n${analysis}\n</Analysis>\n${tags ? '<JSONPatch>\n' : ''}${JSON.stringify(ops, null, 1)}${tags ? '\n</JSONPatch>' : ''}\n</UpdateVariable>`;
const T = v => ({ op: 'replace', path: '/World/Time', value: v });
const chat = [{ user_name: 'Tester', character_name: 'Eldrasil' },
  { is_user: true, mes: 'I sit by Irene.' },
  { is_user: false, mes: blk('- Time: M1 W1 Mon 07:30 → M1 W1 Mon 07:40 (+10 min)\n- Vitals: Stamina 50 - 5 = 45 (Chilled outdoors)',
    [T('07:40'), { op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'reading' } } },
     { op: 'insert', path: '/Bonds/Irene', value: { Rank: 0, Trust: 60, Known_facts: ['Reads a lot'] } }]) },
  { is_user: true, mes: 'I buy a roll.' },
  { is_user: false, mes: blk('- Time: M1 W1 Mon 07:40 → M1 W1 Mon 07:50', [T('07:50'), { op: 'insert', path: '/Player/Inventory/Pebble', value: { Qty: 1, Kind: 'other' } }], false) },
  { is_user: true, mes: 'Next.' },
  { is_user: false, mes: blk('- Time: M1 W1 Mon 07:50 → M1 W1 Mon 08:00', [T('08:00'), { op: 'replace', path: '/World/Month', value: 1 },
    { op: 'insert', path: '/Rep_events/-', value: { Rep: 'Student', XP: 2, Kind: 'repeat', Why: 'helped' } }, { op: 'replace', path: '/Bonds/Irene/Rank', value: 3 }]) }];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mech-')), f = path.join(dir, 'chat.jsonl'), j = path.join(dir, 'out.json'), md = path.join(dir, 'out.md');
fs.writeFileSync(f, chat.map(x => JSON.stringify(x)).join('\n') + '\n');
execFileSync(process.platform === 'win32' ? 'python' : 'python3', [path.join(ROOT, 'tools/audit_chat.py'), f, '--mechanics', '--no-drift', '--json', j, '--out', md], { stdio: ['ignore', 'ignore', 'ignore'] });
const R = JSON.parse(fs.readFileSync(j, 'utf8')).mechanics, rows = Object.fromEntries(R.rows.map(r => [r.msg, r]));
ok(R.rows.length === 3 && /from the card's starting state/.test(R.replay), `three blocks, replayed from the starting state (${R.replay})`);
ok(rows[2].analysis === 2 && rows[2].did.sums === 1 && rows[2].did.weather_stamina === 1 && rows[2].did.bond_record === 1, `reply 1: sums, weather stamina and a whole bond record (${JSON.stringify(rows[2].did)})`);
ok(rows[2].fixes.bond_new === 1 && rows[2].minutes === 10, `the replay replaced the written Trust; 10 minutes (${JSON.stringify(rows[2].fixes)})`);
ok(rows[4].read === 'repaired' && rows[4].stray === 1 && rows[4].ops === 2, `reply 2: a block without tags repaired, a list under /Player moved (${rows[4].read}, ${rows[4].stray})`);
ok(rows[6].did.calendar === 1 && rows[6].did.legacy_rep === 1 && rows[6].did.rank === 1 && rows[6].fixes.reverted === 1, `reply 3: the calendar, a legacy entry and a Rank written; the Rank reverted (${JSON.stringify(rows[6].did)}, ${JSON.stringify(rows[6].fixes)})`);
const text = fs.readFileSync(md, 'utf8');
ok(/## Mechanics/.test(text) && /\| blocks repaired by the engine \/ unreadable \| 1 \/ 0 \|/.test(text) && /### Correction lines/.test(text), 'the report has the summary, the per-reply table and the correction lines');
fs.rmSync(dir, { recursive: true, force: true });
