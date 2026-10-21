// 1.80.0 (audit/AUDIT_2026-10-21_2_megumin_suite.md, batch 3). MS4: <now> (505) brings back older record lines named in the player's
// NEW message (Prompt Template's lastUserMessage), for someone absent or a found place. MS3: tools/audit_chat.py --mechanics lists a
// Clue or planted-detail Hook a block records whose words are nowhere in that reply's story.
const fs = require('fs'), os = require('os'), path = require('path'), ejs = require('ejs'), { execFileSync } = require('child_process');
const { ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const now = (S, msg) => ejs.render(card.character_book.entries.find(e => e.id === 505).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: msg });

console.log('MS4: recall from the player\'s message');
const S = JSON.parse(read('tests/fixtures/saves/save_1.79.0.json'));
S.Scene.Present = { Etnie: { Note: 'eating' } };
S.$ui.cast = { full: ['Etnie'], brief: [], ment: [] };
S.$ui.now = { ...(S.$ui.now || {}), recall: [], earlier: {} };
S.$ui.discovered = [...new Set([...(S.$ui.discovered || []), 'Boathouse'])];
S.$ui.archive = ['[M1 W2 Tue] Zara showed {{user}} her hidden sketchbook at the Boathouse.', '[M1 W3 Wed] Etnie lost a bet to Castor over lunch.',
  '[M1 W3 Thu] Maple trees lined the walk to the Observatory.', '[M1 W4 Fri] The Boathouse keeper chased {{user}} off the jetty.'];
S.Journal = (S.Journal || []).filter(l => !/Zara|Boathouse/.test(l));
const line = t => (t.split('\n').find(l => l.startsWith('Earlier, from the record (named in the player')) || '');
const z = line(now(S, 'I ask Etnie whether Zara ever showed anyone else her sketches. (scene: Etnie; Canteen; t12)'));
ok(/named in the player's message: Zara Minallone/.test(z) && /\[M1 W2 Tue, [^\]]+\] Zara showed \{\{user\}\} her hidden sketchbook/.test(z), 'an absent roster name brings back her older line, dated with its age: ' + z.slice(0, 160));
ok(!/Etnie lost a bet/.test(z), 'only lines that name what the player named');
const b = line(now(S, 'Let us go down to the boathouse after class.'));
ok(/named in the player's message: Boathouse/.test(b) && /keeper chased/.test(b), 'a found place, any case; newest line first: ' + b.slice(0, 140));
ok(!line(now(S, 'The maple leaves are red today.')), 'a first name that is also a word (Maple) counts only in full');
S.Scene.Present.Zara = { Note: 'here' }; S.$ui.cast.full.push('Zara');
ok(!/Zara/.test(line(now(S, 'Zara, show me the sketchbook.'))), 'someone here already has their own sheet and recall: not repeated');
delete S.Scene.Present.Zara; S.$ui.cast.full = ['Etnie'];
ok(!line(now(S, '🖼️ Student picture updated.\n<UpdateVariable>\n<Analysis>Player setting (player tool). Not part of the story.</Analysis>\n</UpdateVariable> Zara')), 'a player-tool entry asks nothing');
ok(!line(now(S, '')) && !line(now(S, undefined)), 'no message (or no Prompt Template variable): no line');
S.$ui.archive = []; ok(!line(now(S, 'Where is Zara?')), 'nothing older on record: no line');

console.log('MS3: records with nothing on the page (audit_chat --mechanics)');
const blk = (prose, ops) => `${prose}\n\n<UpdateVariable>\n<Analysis>\n- Time: M1 W1 Mon 07:30 → M1 W1 Mon 07:40\n</Analysis>\n<JSONPatch>\n${JSON.stringify(ops)}\n</JSONPatch>\n</UpdateVariable>`;
const chat = [{ user_name: 'Tester', character_name: 'Eldrasil' }, { is_user: true, mes: 'I look around the Archive.' },
  { is_user: false, mes: blk('Etnie pointed at the wet footprints by the Archive door. "Someone was here."', [{ op: 'replace', path: '/World/Time', value: '07:40' },
    { op: 'replace', path: '/Clues/Wet footprints', value: { Detail: 'wet footprints outside the Archive', Thread: 'Night visitor' } },
    { op: 'replace', path: '/Clues/Burnt letter', value: { Detail: 'a scorched envelope in the grate', Thread: 'Night visitor' } },
    { op: 'replace', path: '/Hooks/Bell', value: { Note: 'the bell tower rings thirteen', Kind: 'detail', Weight: 1 } },
    { op: 'replace', path: '/Hooks/Tea', value: { Note: 'Irene promised tea on Friday', Kind: 'promise', Weight: 1 } }]) }];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ms3-')), f = path.join(dir, 'chat.jsonl'), j = path.join(dir, 'out.json'), md = path.join(dir, 'out.md');
fs.writeFileSync(f, chat.map(x => JSON.stringify(x)).join('\n') + '\n');
execFileSync(process.platform === 'win32' ? 'python' : 'python3', [path.join(ROOT, 'tools/audit_chat.py'), f, '--mechanics', '--no-drift', '--json', j, '--out', md], { stdio: ['ignore', 'ignore', 'ignore'] });
const R = JSON.parse(fs.readFileSync(j, 'utf8')).mechanics, un = R.rows[0].unseen.map(u => u[0] + ':' + u[1]);
ok(un.join() === 'Clue:Burnt letter,Hook:Bell', 'the clue and the planted detail the prose never shows; not the one it shows, not a promise: ' + un.join(', '));
const text = fs.readFileSync(md, 'utf8');
ok(/recorded but not in the story of their reply \(1\.80\.0\) \| 2 \|/.test(text) && /### Records not in the story/.test(text) && new RegExp(`msg ${R.rows[0].msg}: Clue "Burnt letter"`).test(text), 'the report counts them and lists each');
fs.rmSync(dir, { recursive: true, force: true });
