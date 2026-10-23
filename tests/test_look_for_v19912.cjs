// 1.99.12 (owner-approved planning/DRAFT_look_for.md): Look for. The player's "I'm looking for X in Y" is rolled by <now> (505, from
// lastUserMessage) for the narrator and again by the engine after the reply (stepLook, $eng.look) from the same state, the same
// shared.js functions (lookAsk, lookFor, lookHabit) and the same crowd string ($ui.crowd), so both agree; presenceAt holds the result
// for the rest of the block. Not found: someone here with a tie to them may tell their habits, only if {{user}} asks. The Activities
// row and the dossier picker only draft the line.
const fs = require('fs'), path = require('path'), _ = require('lodash');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { lookAsk, lookFor, PRESENCE, presenceView, crowdOf, uiOn };')();
global.window = { parent: { document: {} } };
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { DATA, PANELS, view, lookPlaces };')();
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const go = (S, o, x = [], user = '') => applyPatch(S, [...W(o), ...x], { user });
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const at = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const S0 = go(initState({ etnie: true }), { ...at(8), Time: '07:30', Location: 'Fire Dormitory' }, [put('/Player/Profile/Dorm', 'Fire')]);
const visit = (n, time, loc, x = []) => go(go(S0, { ...at(n), Time: '07:30', Location: 'Fire Dormitory' }), { Time: time, Location: loc }, x);
const ask = (who, place) => `I'm looking for ${who} in the ${place}.`;
const now505 = (S, msg) => renderEntry(card, 505, S, null, { lastUserMessage: msg });
const lookLine = txt => (txt.split('\n').find(l => /^Looking for /.test(l)) || '');
const Here = X => (X.$ui.now || {}).here || [];
const H = JSON.parse(rd('data/npc_routines.json')).here;

console.log('the line is read from the player\'s message');
{
  const P = E.PRESENCE;
  ok(_.isEqual(E.lookAsk(P, "I'm looking for Trixie in the Courtyards."), { id: 'Trixie', pk: 'courtyards' }), 'the Activities / dossier line');
  ok(_.isEqual(E.lookAsk(P, 'I am looking for trixie confetti at Founder\'s Statue and Park, then I head home'), { id: 'Trixie', pk: "founder's statue and park" }), 'typed by hand: full name, "at", more text after');
  ok(E.lookAsk(P, "I'm looking for [name] in the Canteen.") === null && E.lookAsk(P, 'I look around the Canteen.') === null, 'no name, or no "looking for": nothing');
}

console.log('<now> and the engine agree, every time');
{
  const cases = [], who = ['Trixie', 'Irene', 'Gareth', 'Etnie', 'Kanae', 'Ruby', 'Dorian', 'Caralynn'], places = [['Courtyards', 'Courtyards'], ['Main Library', 'Main Library'], ['Canteen', 'Canteen'], ['Club Rooms', 'Club Rooms'], ["Founder's Statue and Park", "Founder's Statue and Park"]];
  let i = 0, agree = 0, found = 0;
  for (const n of [9, 10, 13, 15, 16, 20, 23]) for (const t of ['12:30', '16:30', '19:10']) {
    const id = who[i % who.length], [pl] = places[(i * 3) % places.length]; i++;
    const B = visit(n, t, (i % 2) ? pl : 'Fire Dormitory');
    const L = lookLine(now505(B, ask(id, pl)));
    const A = go(B, { Time: t.replace(/:(\d)\d$/, ':$15') }, [], ask(id, pl));
    const lk = A.$eng.look || {};
    const said = / is there| is already with/.test(L) ? true : / is not there now/.test(L) ? false : null;
    cases.push([id, pl, D[n % 7], t, said, lk.found]);
    if (said !== null && said === lk.found && lk.id === id) agree++;
    if (lk.found) found++;
  }
  ok(agree === cases.length, `505 and stepLook give the same answer (${agree} of ${cases.length}; found ${found})`);
  const B = visit(15, '19:10', 'Main Library');
  ok(now505(B, ask('Irene', 'Main Library')) === now505(B, ask('Irene', 'Main Library')), 'a swipe gives the same answer');
}

console.log('realistic: never for someone who is not free; rare where they are no regular; better than chance where they are');
{
  let sick = 0;
  for (const n of [9, 10, 11, 12, 15, 16]) {
    const B = visit(n, '12:30', 'Courtyards', [put('/Campus_State/NPC_status', { Trixie: 'in the Medical Centre with a sprained ankle' })]);
    if (/ is there/.test(lookLine(now505(B, ask('Trixie', 'Courtyards'))))) sick++;
  }
  ok(!sick, 'a status keeps them away: never found');
  const Bc = visit(9, '09:10', 'Courtyards');   // Wednesday 09:10: Year 1 students are in class
  ok(/ is not there now/.test(lookLine(now505(Bc, ask('Trixie', 'Courtyards')))), 'in class elsewhere: not there');
  // odds from the shared functions over many days (the same draw the engine and <now> use)
  const rate = (id, pk, t, days) => { let f = 0, k = 0; for (const n of days) { const B = visit(n, t, 'Fire Dormitory'); const V = E.presenceView(E.PRESENCE, B, x => E.uiOn(B.$ui, x));
    const r = E.lookFor(E.PRESENCE, V, id, pk, E.crowdOf(E.PRESENCE, B.$ui.crowd, pk)); k++; if (r.found) f++; } return f / k; };
  const days = []; for (let n = 34; n < 320; n += 7) days.push(n);   // the year's Sundays: no classes, no Theatre Troupe
  const rare = (rate('Trixie', 'main library', '10:30', days) + rate('Trixie', 'main library', '17:00', days)) / 2, reg = rate('Trixie', 'courtyards', '10:30', days);
  ok(rare >= 0.02 && rare <= 0.16, `no regular of the Main Library: about ${H.pass}% (${Math.round(rare * 100)}%)`);
  ok(reg >= 0.35 && reg <= 0.8, `a regular of the Courtyards on a Sunday morning: better than chance, never certain (${Math.round(reg * 100)}%)`);
  const V = E.presenceView(E.PRESENCE, visit(36, '12:30', 'Canteen'), x => true);
  const pcts = ['Anya', 'Cedric', 'Etnie', 'Lenna', 'Ruby'].map(id => E.lookFor(E.PRESENCE, V, id, 'canteen', 4).pct).filter(x => x != null);
  ok(pcts.length && pcts.every(p => p <= H.look.cap), `the bonus never passes ${H.look.cap}% (${pcts.map(Math.round).join(', ')})`);
}

console.log('the engine holds the answer: Here now follows it for the rest of the block');
{
  let fHeld = 0, nfHeld = 0, f = 0, nf = 0;
  for (const n of [36, 37, 38, 39, 40, 43, 44, 45, 46, 47]) {
    const B = visit(n, '16:20', 'Courtyards');
    const A = go(B, { Time: '16:35' }, [], ask('Dorian', 'Courtyards'));
    const lk = A.$eng.look;
    if (!lk) continue;   // a trip day: {{user}} is away (no roll in an outside area)
    if (lk.found) { f++; if (Here(A).includes('Dorian')) fHeld++; } else { nf++; if (!Here(A).includes('Dorian')) nfHeld++; }
    const A2 = go(A, { Time: '16:50' });
    if (lk.found ? !Here(A2).includes('Dorian') : Here(A2).includes('Dorian')) { fHeld = -99; }
  }
  ok(fHeld === f && nfHeld === nf, `found: in Here now, shown first; not found: not in it (found ${f}, not ${nf})`);
}

console.log('not found: a hint only from someone here with a tie to them, only if {{user}} asks');
{
  const ties = E.PRESENCE.rel.Trixie || {}, friend = Object.keys(ties).find(h => !['Trixie'].includes(h) && E.PRESENCE.roster.includes(h) && (E.PRESENCE.stu[h] || [])[0] === 1);
  ok(!!friend, `Trixie has ties (${Object.keys(ties).length}; e.g. ${friend}: ${ties[friend]})`);
  let hint = null, none = null;
  for (const n of [9, 10, 11, 12, 15, 16, 17, 18]) {
    const B = visit(n, '16:30', 'Gardens', [put('/Scene/Present', { [friend]: { Note: 'walking with you' } })]);
    const txt = now505(B, ask('Trixie', 'Gardens'));
    if (/ is not there now/.test(lookLine(txt))) { hint = txt; break; }
  }
  ok(hint && new RegExp(`^If \\{\\{user\\}\\} asks around \\(only then\\): ${friend} \\(${ties[friend]}\\) may know her habits: Trixie (usually spends this hour at|is often around) `, 'm').test(hint), 'the friend walking with {{user}} may tell her habits, if asked');
  for (const n of [9, 10, 11, 12, 15, 16, 17, 18]) {
    const B = visit(n, '16:30', 'Gardens');
    const txt = now505(B, ask('Trixie', 'Gardens'));
    if (/ is not there now/.test(lookLine(txt)) && !/If \{\{user\}\} asks around/.test(txt)) { none = txt; break; }
  }
  ok(none && /^Nobody here knows Trixie well enough to say where she might be\.$/m.test(none), 'nobody with a tie: nobody can say');
}

console.log('no roll after curfew, in an outside area, or with Who is here off');
{
  const off = visit(9, '12:30', 'Courtyards', [put('/$ui/off', ['presence_roll'])]);
  ok(!lookLine(now505(off, ask('Trixie', 'Courtyards'))) && !go(off, { Time: '12:40' }, [], ask('Trixie', 'Courtyards')).$eng.look, 'Who is here off: no line, nothing kept');
  const late = visit(9, '21:30', 'Courtyards');
  ok(!lookLine(now505(late, ask('Trixie', 'Courtyards'))), 'after curfew: no roll');
}

console.log('the buttons only draft the line');
{
  const X = visit(9, '12:30', 'Canteen');
  U.view.act = 'clubs';
  ok(!/Look for someone/.test(U.PANELS.activities.render(X)), '1.99.13 (owner): not on the Clubs tab');
  U.view.act = 'practice';
  const h = U.PANELS.activities.render(X);
  ok(/data-actab="practice"[^>]*>Action</.test(h) && !/>Practice</.test(h), '1.99.13 (owner): the tab is called Action and shows here without a practice place');
  ok(/data-fill="I&#39;m looking for \[name\] in the Canteen\."|data-fill="I'm looking for \[name\] in the Canteen\."/.test(h) && /Look for someone/.test(h), 'Activities: "Look for someone" at the place {{user}} is in');
  ok(!/Look for someone/.test(U.PANELS.activities.render(visit(9, '21:30', 'Courtyards'))), 'not after curfew');
  ok(!/Look for someone/.test(U.PANELS.activities.render(visit(9, '12:30', 'Canteen', [put('/$ui/off', ['presence_roll'])]))), 'Who is here off: no Look for button');
  // the dossier: only the places the file already shows, this hour's routine first, and where {{user}} is
  // Irene keeps her Haunts back until Rank 1 (a guarded person); a bond's Rank grows only through the engine, so it is set here directly
  const closed = U.lookPlaces('Irene', U.DATA.npcs.Irene, X).map(o => o.p);
  ok(_.isEqual(closed, ['Canteen']), `Haunts not open yet: only where {{user}} is (${closed.join(', ')})`);
  const T5 = _.cloneDeep(visit(16, '12:10', 'Canteen')); T5.Bonds.Trixie = { ...(T5.Bonds.Trixie || {}), Rank: 5, Trust: 70, Tension: 0, Known_facts: [], Milestones: [] };
  const open = U.lookPlaces('Trixie', U.DATA.npcs.Trixie, T5);
  ok(open.length >= 3 && open[0].p === 'Courtyards' && open[0].now && open.some(o => o.p === "Founder's Statue and Park") && open.some(o => o.here && o.p === 'Canteen'),
    `Haunts open: her places, the Courtyards first at lunch on a weekday (${open.map(o => o.p + (o.now ? '*' : '')).join(', ')})`);
  U.view.arg = 'Trixie'; U.view.look = 'Trixie';
  const dos = U.PANELS.npc.render(T5);
  ok(/Look for Trixie where\?/.test(dos) && /I(&#39;|')m looking for Trixie in the Courtyards\./.test(dos) && /usually here now/.test(dos), 'the dossier picker drafts "I\'m looking for Trixie in the Courtyards."');
  const withHer = _.cloneDeep(T5); withHer.Scene.Present = { Trixie: { Note: '' } };
  ok(!/Look for Trixie/.test(U.PANELS.npc.render(withHer)), 'no button while she is with {{user}}');
}

console.log('tools/audit_chat.py --mechanics counts the searches');
{
  const os = require('os'), { execFileSync } = require('child_process');
  const blk = ops => `Prose.\n\n<UpdateVariable>\n<Analysis>\n- ok\n</Analysis>\n<JSONPatch>\n${JSON.stringify(ops)}\n</JSONPatch>\n</UpdateVariable>`;
  const P = (p, v) => ({ op: 'replace', path: p, value: v });
  const chat = [{ user_name: 'Tester', character_name: 'Eldrasil' },
    { is_user: true, mes: "I'm looking for Trixie in the Courtyards." },
    { is_user: false, mes: blk([P('/World/Time', '07:45'), P('/World/Location', 'Courtyards')]) }];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'look-')), f = path.join(dir, 'chat.jsonl'), md = path.join(dir, 'out.md');
  fs.writeFileSync(f, chat.map(x => JSON.stringify(x)).join('\n') + '\n');
  execFileSync(process.platform === 'win32' ? 'python' : 'python3', [path.join(ROOT, 'tools/audit_chat.py'), f, '--mechanics', '--no-drift', '--out', md], { stdio: ['ignore', 'ignore', 'ignore'] });
  ok(/\| Look for: searches \/ the one sought brought in although "not there" \(1\.99\.12\) \| 1 \/ 0 \|/.test(fs.readFileSync(md, 'utf8')), 'one search, nobody brought in against it');
  fs.rmSync(dir, { recursive: true, force: true });
}
