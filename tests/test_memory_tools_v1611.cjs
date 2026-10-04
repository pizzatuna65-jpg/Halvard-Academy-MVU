// 1.61.1 (audit/AUDIT_2026-10-05_1_sistem_memori.md §6, batch 2, M13): the memory measuring tools. tools/audit_chat.py --memory
// (replays a chat through the current engine: what each memory list wrote, lost from view, kept and lost for good; 501 tokens; the
// state's size and the chat file's projection), --vectfox (an EventBase export checked against the chat: ghosts, dates without a
// year, near-duplicates), and a short run of tests/stress/memory_soak.cjs (the memory invariants).
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const { ok, ROOT } = require('./harness.cjs');
const PY = process.platform === 'win32' ? 'python' : 'python3';
const blk = ops => `Prose.\n\n<UpdateVariable>\n<Analysis>\n- Time: M1 W1 Mon 07:30 → M1 W1 Mon 07:40\n</Analysis>\n<JSONPatch>\n${JSON.stringify(ops)}\n</JSONPatch>\n</UpdateVariable>`;
const T = v => ({ op: 'replace', path: '/World/Time', value: v });
const chat = [{ user_name: 'Tester', character_name: 'Eldrasil' },
  { name: 'Tester', is_user: true, mes: 'I sit by Irene.' },
  { name: 'Eldrasil', is_user: false, mes: blk([T('07:40'), { op: 'replace', path: '/Scene/Present', value: { Irene: { Note: 'reading' } } },
    ...Array.from({ length: 32 }, (_, i) => ({ op: 'insert', path: '/Journal/-', value: `Turning point number ${i}.` }))]) },
  { name: 'Tester', is_user: true, mes: 'I ask about her book.' },
  { name: 'Eldrasil', is_user: false, mes: blk([T('07:50'), { op: 'insert', path: '/Bonds/Irene/Known_facts/-', value: 'Reads poetry' },
    { op: 'replace', path: '/Hooks/The book', value: { Note: 'Irene will lend the book', Who: 'Irene', Kind: 'promise', Weight: 2 } }]) }];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mem-')), f = path.join(dir, 'chat.jsonl'), j = path.join(dir, 'out.json'), md = path.join(dir, 'out.md');
fs.writeFileSync(f, chat.map(x => JSON.stringify(x)).join('\n') + '\n');

console.log('audit_chat.py --memory');
{
  execFileSync(PY, [path.join(ROOT, 'tools/audit_chat.py'), f, '--memory', '--no-drift', '--json', j, '--out', md], { stdio: ['ignore', 'ignore', 'ignore'] });
  const M = JSON.parse(fs.readFileSync(j, 'utf8')).memory;
  ok(M.replies === 2 && M.totals.Journal.written === 32 && M.totals.Journal.left === 1 && M.totals.Journal.kept === 1 && M.sizes.Journal === 30 && M.sizes.journal_archive === 1, `the narrator's writes are counted; over the window of 30 the start's line moves to the archive (${JSON.stringify(M.totals.Journal)}, ${M.sizes.Journal})`);
  ok(M.totals.Known_facts.written === 1 && M.hooks.length === 1 && M.hooks[0].days === 0, 'Known_facts written, the open Hook and its age');
  ok(M.t501.start > 0 && M.t501.end >= M.t501.start && M.bytes.end > 0 && M.text > 0, `501 tokens (${M.t501.start} → ${M.t501.end}) and the state's size (${M.bytes.end} bytes)`);
  const t = fs.readFileSync(md, 'utf8');
  ok(/## Memory \(what the card remembers and forgets\)/.test(t) && /\| Journal \| 32 \| 1 \| 1 \| 0 \| 0 \| 0 \| 0 \|/.test(t) && /\| 20,000 \|/.test(t) && /Open Hooks: 1/.test(t), 'the report: the list table, the projection, the Hooks');
}

console.log('the memory lists (memDiff)');
{
  const { memDiff } = require('../tools/memory_lists.cjs');
  const S = { Journal: ['[M1 W1 Mon] a', '[M1 W1 Mon] b'], $ui: { archive: ['[M1 W1 Mon] old'], cluearch: {}, xold: { Ann: {} }, xgone: {} }, Clues: { c1: { Thread: 'Open one' }, c2: { Thread: 'Done one' } },
    Mysteries: { 'Open one': { Status: 'open' }, 'Done one': { Status: 'solved' } }, Bonds: { Irene: { Knows: ['k1'], $Knows_old: [], Known_facts: ['f1'], $Known_old: ['f0'] } }, Extras: { Bob: {} } };
  const N = { Journal: ['[M1 W1 Mon] b', '[M1 W1 Tue] c'], $ui: { archive: ['[M1 W1 Mon] a'], cluearch: { c1: {} }, xold: { Bob: {} }, xgone: { Ann: {} } }, Clues: { c2: { Thread: 'Done one' } },
    Mysteries: S.Mysteries, Bonds: { Irene: { Knows: ['k1', 'k2'], $Knows_old: [], Known_facts: ['f2'], $Known_old: ['f1'] } }, Extras: {} };
  const d = memDiff(S, N, [{ op: 'insert', path: '/Journal/-', value: 'c' }, { op: 'insert', path: '/Bonds/Irene/Knows/-', value: 'k2' }]);
  ok(d.Journal.written === 1 && d.Journal.left === 1 && d.Journal.kept === 1 && d.Journal.gone === 1, `Journal: a line left into the archive, the archive's oldest lost (${JSON.stringify(d.Journal)})`);
  ok(d.Known_facts.left === 1 && d.Known_facts.kept === 1 && d.Known_facts.gone === 1 && d.Knows.written === 1, 'Known_facts the same; Knows written');
  ok(d.Clues.left === 1 && d.Clues.kept === 1 && d.openClues === 1, 'a clue of an open mystery that left is flagged');
  ok(d.Extras.left === 1 && d.Extras.kept === 1 && d.Extras.cut === 1 && d.Extras.gone === 0, 'Extras: into the archive, and one cut to a short record');
  const r = memDiff(S, { ...N, Clues: { c2: S.Clues.c2 } }, [{ op: 'remove', path: '/Clues/c1' }]);
  ok(r.Clues.story === 1 && r.Clues.left === 0 && r.openClues === 0, 'a clue the story removed is its choice, not forgetting');
}

console.log('audit_chat.py --vectfox');
{
  const djb2 = s => { let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) ^ s.charCodeAt(i); h >>>= 0; } return h; };   // VectFox 3623dc8 _djb2
  const hs = chat.slice(1).map(m => djb2(`${m.name}:${m.mes.trim()}`));
  const ev = (o) => ({ metadata: { eventbase: true, event_type: 'dialogue_significant', importance: 5, should_persist: true, characters: ['Irene', 'Tester'], source_window_start: 0, ...o } });
  const exp = { chunks: [
    ev({ summary: 'Irene told Tester about her favourite poetry book and promised to lend it tomorrow.', scene_time: 'Y1 M1 W1 Mon 07:50', source_message_hashes: [hs[2], hs[3]] }),
    ev({ summary: 'Irene told Tester about her favourite poetry book and promised to lend it tomorrow morning.', scene_time: 'M1 W1 Mon 07:50', source_message_hashes: [hs[2], hs[3]] }),
    ev({ summary: 'Something from a deleted message.', scene_time: 'Y1 M1 W1 Mon 07:40', importance: 7, source_message_hashes: [hs[0], 12345], source_window_start: 2, event_type: 'revelation' }),
    { metadata: { eventbase: false } }] };
  const ef = path.join(dir, 'export.json'); fs.writeFileSync(ef, JSON.stringify(exp));
  execFileSync(PY, [path.join(ROOT, 'tools/audit_chat.py'), f, '--no-drift', '--vectfox', ef, '--json', j, '--out', md], { stdio: ['ignore', 'ignore', 'ignore'] });
  const V = JSON.parse(fs.readFileSync(j, 'utf8')).vectfox;
  ok(V.events === 3 && V.ghosts === 1 && V.no_year === 1 && V.near_duplicates === 1 && V.turning === 1 && V.windows === 2, `ghost 1, no year 1, near-duplicates 1, importance 6+ 1 (${JSON.stringify(_.pick(V, ['events', 'ghosts', 'no_year', 'near_duplicates', 'turning', 'windows']))})`);
  ok(/Ghost events \(a source message deleted or edited\) \| 1 \|/.test(fs.readFileSync(md, 'utf8')), 'the report lists them');
}

console.log('memory_soak (short run)');
{
  let out = '', code = 0;
  try { out = execFileSync(process.execPath, [path.join(ROOT, 'tests/stress/memory_soak.cjs'), '400', '--quiet'], { encoding: 'utf8' }); } catch (e) { code = e.status; out = String(e.stdout || ''); }
  ok(code === 0 && /invariants held/.test(out) && /Known_facts: \d+ \/ \d+ \/ \d+ \/ \d+/.test(out), `400 synthetic updates: the invariants hold (${(out.match(/state max .*/) || [''])[0]})`);
}
fs.rmSync(dir, { recursive: true, force: true });
