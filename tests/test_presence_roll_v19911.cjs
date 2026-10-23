// 1.99.11 (owner-approved planning/DRAFT_presence_roll.md): the presence roll. Who is at a place now is rolled (shared.js presenceAt,
// Features presence_roll): a routine here and a teacher teaching here are certain; each other free regular is here at
// data/npc_routines.json here.target[crowd] / their number; one free roster NPC may pass through; Scene.Present is with {{user}},
// outside the roll; a seeded order cut to here.max. Engine crowdAt (one source with the ambience), nowOf's Here now line, 505's
// optional threads, the pair beat and the moment alone; the Regulars lore entries point to the roll.
const fs = require('fs'), path = require('path'), _ = require('lodash'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const go = (S, o, x = []) => applyPatch(S, [...W(o), ...x]);
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const at = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const H = JSON.parse(rd('data/npc_routines.json')).here;
const pres = X => ((X.$ui.now || {}).pres || []);
const hereLine = X => pres(X).find(l => /^Here now at/.test(l)) || '';
const hereIds = X => (X.$ui.now || {}).here || [];
const S0 = go(initState({ etnie: true }), { ...at(8), Time: '07:30', Location: 'Fire Dormitory' }, [put('/Player/Profile/Dorm', 'Fire')]);
// arrive at loc at time on day n (from the dorm that morning, so each visit is an arrival)
const visit = (n, time, loc, x = []) => go(go(S0, { ...at(n), Time: '07:30', Location: 'Fire Dormitory' }), { Time: time, Location: loc }, x);
const weekdays = (from, count) => { const out = []; for (let n = from; out.length < count; n++) if (n % 7 < 5) out.push(n); return out; };

console.log('the Here now line replaces the habit list');
{
  const X = visit(9, '12:30', 'Canteen');
  ok(hereLine(X) && !pres(X).some(l => /^Likely around/.test(l)), `Here now, no "Likely around" (${hereLine(X).slice(0, 120)})`);
  ok(hereIds(X).length >= 1 && hereIds(X).length <= H.max, `$ui.now.here lists who is here (${hereIds(X).join(', ')})`);
  ok(/Each is busy with their own thing; show them at it\. The first move is \{\{user\}\}'s, unless someone's character and Bond would bring them over, or they are marked as today's initiative\./.test(hereLine(X)),
    'presence is not interaction: the first move is {{user}}\'s');
  ok(pres(X).some(l => /^Arriving somewhere else in this reply: who is there is rolled after the reply \(the next Here now\)\. On arrival keep to the place and its unnamed people;/.test(l)),
    'a place reached in this reply has no roll yet: arrive to the place, the people come with the next Here now');
  const Y = go(X, { Time: '12:31' }, [put('/$ui/off', ['presence_roll'])]);
  ok(pres(Y).some(l => /^Likely around Canteen/.test(l)) && !hereLine(Y), 'Features presence_roll off: the habit list, as before');
}

console.log('seeded: a swipe and a return within the block find the same people');
{
  const A = visit(15, '19:10', 'Main Library'), B = visit(15, '19:10', 'Main Library');
  ok(_.isEqual(hereIds(A), hereIds(B)) && hereLine(A) === hereLine(B), `the same state, the same Here now (${hereIds(A).join(', ') || 'nobody'})`);
  const back = go(go(A, { Time: '19:25', Location: 'Courtyards' }), { Time: '19:40', Location: 'Main Library' });
  ok(_.isEqual(hereIds(back), hereIds(A)), 'Main Library → Courtyards → Main Library in the same block: the same people');
  let differs = 0;
  for (const n of weekdays(30, 20)) if (!_.isEqual(hereIds(visit(n, '19:10', 'Main Library')), hereIds(A))) differs++;
  ok(differs >= 5, `other days, other people (${differs} of 20 differ)`);
}

console.log('how many: a ceiling, not a target; busy places fill, quiet ones are often empty');
{
  const days = weekdays(36, 40);
  const lunch = days.map(n => hereIds(visit(n, '12:30', 'Canteen')));
  const forest = days.map(n => hereIds(visit(n, '16:30', 'Forest Clearing')));
  ok(lunch.every(h => h.length <= H.max) && forest.every(h => h.length <= H.max), `never more than ${H.max} names`);
  const lunchEmpty = lunch.filter(h => !h.length).length, forestEmpty = forest.filter(h => !h.length).length;
  ok(lunchEmpty <= 4, `the Canteen at lunch is rarely empty (${lunchEmpty} of 40)`);
  ok(forestEmpty >= 24, `the Forest Clearing on a weekday afternoon is mostly empty (${forestEmpty} of 40)`);
  const sizes = _.countBy(days.map(n => hereIds(visit(n, '19:10', 'Main Library')).length));
  ok(Object.keys(sizes).length >= 3, `the Main Library in the evening: 0, 1, 2 or 3 people (${JSON.stringify(sizes)})`);
  // fairness: the seeded order, not the alphabet, picks who is shown when more than three are here
  const seen = _.countBy(lunch.flat());
  const shown = Object.entries(seen).filter(([id]) => !['Bobby', 'Percival', 'Valentin', 'Linus', 'Hadrian', 'Rigel'].includes(id)).map(([, v]) => v);
  ok(shown.length >= 5, `the Canteen at lunch shows many different regulars over 40 days (${Object.keys(seen).length}: ${JSON.stringify(seen)})`);
}

console.log('tags: what each is doing; certain routines; the passer-by; an empty place');
{
  // Irene's Library Assistants shift, Mon-Fri 16:00-19:00 at the Main Library: certain on the days her routine holds
  const rows = weekdays(50, 20).map(n => visit(n, '17:00', 'Main Library'));
  const irene = rows.filter(X => /Irene \(Library Assistants shift/.test(hereLine(X)) || hereIds(X).includes('Irene'));
  ok(irene.length >= 6, `Irene at her shift on most weekdays, shown with it (${irene.length} of 20)`);
  ok(rows.some(X => /, a regular here[;)]/.test(hereLine(X))), 'a rolled regular carries their impression word, "a regular here"');
  const all = weekdays(60, 120).flatMap(n => [visit(n, '19:10', 'Gardens'), visit(n, '12:30', 'Mall')]);
  ok(all.some(X => /passing through/.test(hereLine(X))), 'now and then someone passes through who is no regular here');
  const E1 = weekdays(36, 40).map(n => visit(n, '16:30', 'Forest Clearing')).find(X => !hereIds(X).length);
  ok(E1 && /^Here now at Forest Clearing: nobody on the roster\. Only unnamed students and staff, kept in the background unless \{\{user\}\} turns to one\.$/.test(hereLine(E1)), 'empty: nobody on the roster');
  const r505 = X => renderEntry(card, 505, X);
  ok(E1 && !/Optional threads \([^)]*Here now/.test(r505(E1)), 'an empty place is no optional thread');
  const full = visit(9, '12:30', 'Canteen');
  ok(/Optional threads \([^)]*Here now[^)]*\): use at most one/.test(r505(full)), 'people here are one optional thread (at most one a reply)');
}

console.log('someone with {{user}} goes along, outside the roll');
{
  const X = visit(9, '12:30', 'Canteen', [put('/Scene/Present', { Trixie: { Note: 'walking with you' } })]);
  ok(!hereIds(X).includes('Trixie') && pres(X).some(l => /^With \{\{user\}\} \(outside the roll[^)]*\): Trixie\./.test(l)), 'Trixie in the scene: "With {{user}}", never in Here now');
  const Y = go(X, { Time: '12:45', Location: 'Courtyards' });
  ok(!hereIds(Y).includes('Trixie') && pres(Y).some(l => /^With \{\{user\}\}[^:]*: Trixie\./.test(l)), 'she walks on with {{user}} to the Courtyards');
}

console.log('a status keeps its own line; the sick and the away are never rolled');
{
  const X = visit(9, '12:30', 'Courtyards', [put('/Campus_State/NPC_status', { Dorian: 'in detention until Friday' })]);
  ok(!hereIds(X).includes('Dorian') && pres(X).some(l => /Regulars here with a status on record[^:]*: Dorian: in detention/.test(l)), 'Dorian\'s status, not the roll');
}

console.log('the ambience agrees with the roll');
{
  const src = rd('src/scripts/engine.template.js');
  ok(/const crowd = crowdAt\(S, evs, wxNow, S\.World\.Location, t\)/.test(src) && /S\.\$ui\.crowd = crowdKeys\(PRESENCE\)\.map\(k => \{ const n = crowdAt\(S, c\.evs, c\.wxNow/.test(src)
    && /crowdOf\(PRESENCE, UI\.crowd, pkN\)/.test(src), 'one crowd source: stepAmbience calls crowdAt, and <now> reads the crowd string stepHere builds with it (1.99.12)');
  ok(/pairLine\(c, regs, 'near', 'amb', !!hereIds\)/.test(src) && /alone = !Object\.keys\(S\.Scene\.Present \|\| \{\}\)\.length && !\(hereIds \|\| \[\]\)\.length/.test(src), 'the pair beat and the moment alone read the roll');
  let pairs = 0, bad = 0;
  for (const n of weekdays(80, 60)) for (const [t, loc] of [['12:30', 'Canteen'], ['19:10', 'Common Rooms']]) {
    const X = visit(n, t, loc), b = ((X.$ui.amb || {}).beat) || {};
    if (!b.pair) continue;
    pairs++;
    const named = Object.keys(X.Bonds).filter(id => new RegExp('\\b' + id + '\\b').test(b.text));
    if (!named.every(id => hereIds(X).includes(id))) bad++;
  }
  ok(!bad, `a "nearby" pair beat names only people here now (${pairs} beats seen)`);
}

console.log('the Regulars lore entries point to the roll');
{
  const E = (card.data || card).character_book.entries.find(e => /Regulars — Courtyards$/.test(e.comment));
  const render = off => ejs.render(E.content, { getvar: k => ({ 'stat_data.$ui.off': off, 'stat_data.World.Year': 1, 'stat_data.Campus_State.Lore_changes': {} })[k] });
  ok(/Trixie/.test(render([])) && /Habits only: who is at this place now is the Here now line in <now>\./.test(render([])), 'roll on: the canon list, then the pointer');
  ok(!/Habits only/.test(render(['presence_roll'])), 'roll off: the canon list alone');
}

console.log('tools/audit_chat.py --mechanics counts roster NPCs brought in unasked');
{
  const os = require('os'), { execFileSync } = require('child_process');
  const blk = ops => `Prose.\n\n<UpdateVariable>\n<Analysis>\n- ok\n</Analysis>\n<JSONPatch>\n${JSON.stringify(ops)}\n</JSONPatch>\n</UpdateVariable>`;
  const P = (p, v) => ({ op: 'replace', path: p, value: v });
  const chat = [{ user_name: 'Tester', character_name: 'Eldrasil' },
    { is_user: true, mes: 'I walk to the Courtyards.' },
    { is_user: false, mes: blk([P('/World/Time', '07:45'), P('/World/Location', 'Courtyards'), P('/Scene/Present', { Trixie: { Note: 'juggling' } })]) },
    { is_user: true, mes: 'I go to the Main Library to find Irene.' },
    { is_user: false, mes: blk([P('/World/Time', '08:00'), P('/World/Location', 'Main Library'), P('/Scene/Present', { Irene: { Note: 'shelving' } })]) }];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pres-')), f = path.join(dir, 'chat.jsonl'), md = path.join(dir, 'out.md');
  fs.writeFileSync(f, chat.map(x => JSON.stringify(x)).join('\n') + '\n');
  execFileSync(process.platform === 'win32' ? 'python' : 'python3', [path.join(ROOT, 'tools/audit_chat.py'), f, '--mechanics', '--no-drift', '--out', md], { stdio: ['ignore', 'ignore', 'ignore'] });
  const text = fs.readFileSync(md, 'utf8');
  ok(/\| roster NPCs brought in unasked on arrival at a new place \(1\.99\.11\) \| 1 in 2 arrivals \|/.test(text) && /\| most often brought in unasked \| Trixie 1 \|/.test(text),
    'Trixie brought in unasked on arrival counts; Irene, whom {{user}} came to find, does not');
  fs.rmSync(dir, { recursive: true, force: true });
}
