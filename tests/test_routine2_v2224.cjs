// 2.2.4 (owner-approved planning/DRAFT_routine2*.md, roadmap B1): Routine 2.0, all of it. Weighted full-day rows, one seeded draw per
// NPC, day and block (rtPick), at least 10 free; wx, pair (one draw for both; skipped while the partner is away), ev, exam, since; the
// meeting layer (presenceAt: never certain on an open place, certain in one scheduled room); Look for on the same draw (at most 90);
// people on their way (onTheWay); Campus now; empty visits close to 2.1.2's; the "usually" displays read the main rows only.
const fs = require('fs'), path = require('path'), _ = require('lodash');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { PRESENCE, presenceView, presenceAt, whereabouts, rtPick, rtMain, lookFor, lookHabit, onTheWay, passingAt, campusFeed, uiOn, BLOCKS_AT };')();
global.window = { parent: { document: {} } };
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { DATA };')();
const P = E.PRESENCE, D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const S0 = applyPatch(initState({ etnie: true }), W({ Month: 1, Week: 2, Day: 'Mon', Time: '12:30', Location: 'Canteen' }));
const parts = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const at = (n, t, x = {}) => { const S = { ...S0, World: { ...S0.World, ...parts(n), Time: t } }; return { ...E.presenceView(P, S, id => E.uiOn(S.$ui, id)), ...x }; };
const days = (pred, from = 8, to = 336) => _.range(from, to).filter(n => pred(parts(n)));
const pick = (V, id) => E.rtPick(P, V, id);

console.log('one draw per NPC, day and block; weights and free');
{
  const V = at(9, '12:30');
  ok(_.isEqual(pick(V, 'Trixie'), pick(V, 'Trixie')) && _.isEqual(pick(V, 'Trixie'), pick({ ...V, min: V.min + 20 }, 'Trixie')), 'the same draw on a swipe and within the block');
  const wd = days(p => !['Sat', 'Sun'].includes(p.Day), 8, 200);
  const got = wd.map(n => pick(at(n, '12:30'), 'Trixie')), court = got.filter(r => r && r[3] === 'courtyards').length, free = got.filter(r => !r).length;
  ok(court / wd.length > 0.55 && court / wd.length < 0.85 && free / wd.length > 0.12 && free / wd.length < 0.45, `Trixie at lunch: the Courtyards ${court}, free ${free} of ${wd.length} weekdays (70 and 30 in fair weather)`);
  const PD2 = { ...P, rt: { ...P.rt, Testy: [[D, 960, 1080, 'gardens', 'Gardens', 'a', 'x', 'habit', 70, {}, null], [D, 960, 1080, 'archive', 'Archive', 'b', 'x', 'habit', 70, {}, null]] } };
  const two = wd.map(n => E.rtPick(PD2, at(n, '16:30'), 'Testy')), second = two.filter(r => r && r[3] === 'archive').length;
  ok(second / wd.length > 0.1 && second / wd.length < 0.3 && two.filter(r => !r).length > 0, `two rows of 70 in one block: the second gets the 20 left (${second} of ${wd.length}), at least 10 free`);
  ok(!Object.values(P.rt).flat().some(r => r.length < 11), 'every row is in the 2.2.0 shape after presence_data (old rows read as habits at 70)');
}

console.log('weather, pairs, events, exams, campaign years');
{
  const wd = days(p => ['Tue', 'Thu'].includes(p.Day), 8, 300);
  const bad = wd.map(n => pick(at(n, '16:30', { bad: true, rain: true }), 'Percival'));
  ok(bad.every(r => !r || (r[9] || {}).wx === 'bad') && bad.some(r => r && r[3] === 'sports field'), 'Percival in the rain: only his bad-weather rows (out playing in the storm, or the Gymnasium), never the fair Soccer Club row');
  // as the game reads it (whereabouts: someone home for the break or sick has no routine at all)
  const pair = wd.map(n => { const V = at(n, '16:30'); const z = E.whereabouts(P, V, 'Zara').rt, v = E.whereabouts(P, V, 'Vera').rt; return [!!z && !!(z[9] || {}).pair, !!v && !!(v[9] || {}).pair]; });
  ok(pair.every(([a, b]) => a === b) && pair.some(([a]) => a), `Zara and Vera on Tuesday and Thursday: together or neither (${pair.filter(([a]) => a).length} of ${pair.length} together)`);
  const V = at(wd[0], '16:30');
  ok(wd.every(n => !((pick(at(n, '16:30', { GRAD: [...V.GRAD, 'Vera'] }), 'Zara') || [])[9] || {}).pair) && wd.every(n => !((pick(at(n, '16:30', { sick: ['Vera'] }), 'Zara') || [])[9] || {}).pair),
    'the pair row is skipped while Vera is gone or sick (2.2.3)');
  const circus = days(p => p.Month === 8 && p.Week === 2 && ['Thu', 'Fri', 'Sat', 'Sun'].includes(p.Day), 200, 336), other = days(p => p.Month === 8 && p.Week === 3 && p.Day === 'Thu', 200, 336);
  const tr = circus.map(n => pick(at(n, '18:30'), 'Trixie'));
  ok(tr.filter(r => r && (r[9] || {}).ev === 'circus').length >= 2 && other.every(n => !((pick(at(n, '18:30'), 'Trixie') || [])[9] || {}).ev), `Trixie at the circus on its days (${tr.filter(r => r && (r[9] || {}).ev).length} of ${tr.length}), never on another Thursday`);
  const ex = days(p => p.Month === 2 && p.Week === 4 && p.Day !== 'Sat' && p.Day !== 'Sun'), calm = days(p => p.Month === 2 && p.Week === 2 && p.Day !== 'Sat' && p.Day !== 'Sun');
  const exr = ex.map(n => pick(at(n, '16:30'), 'Alyssa'));
  ok(exr.some(r => r && (r[9] || {}).exam) && calm.every(n => !((pick(at(n, '16:30'), 'Alyssa') || [])[9] || {}).exam), `Alyssa revises in the week before the midterms (${exr.filter(r => r && (r[9] || {}).exam).length} of ${ex.length}), not in an ordinary week`);
  ok(!days(p => p.Month === 2 && p.Week === 4).some(n => ((pick(at(n, '16:30'), 'Bruno') || [])[9] || {}).exam), 'Bruno never revises (only those the lore makes studious)');
  const suns = days(p => p.Day === 'Sun', 8, 336);
  ok(suns.every(n => !((pick(at(n, '13:30', { Y: 2 }), 'Faye') || [])[9] || {}).pair) && suns.some(n => ((pick(at(n, '13:30', { Y: 3 }), 'Faye') || [])[9] || {}).pair), 'Faye walks Tsubaki back from the Hills only from Year 3 (since)');
}

console.log('the meeting layer and Look for');
{
  let met = 0, tries = 0, lookOk = 0, lookTries = 0, lookFound = 0;
  for (const n of days(p => !['Sat', 'Sun'].includes(p.Day), 8, 120)) {
    const V = at(n, '12:40'), w = E.whereabouts(P, V, 'Trixie');
    if (!w.rt || w.rt[3] !== 'courtyards') continue;
    tries++;
    const r = E.presenceAt(P, V, 'Courtyards', 2), here = (r.regs || []).includes('Trixie');
    if (here) met++;
    const lk = E.lookFor(P, V, 'Trixie', 'courtyards', 2);
    lookTries++; if (lk.found) lookFound++;
    if (!here || lk.found) lookOk++;
  }
  ok(tries > 10 && met < tries && met / tries > 0.35, `her routine puts Trixie in the Courtyards: met ${met} of ${tries} (habit 65, at most 3 names), never certain`);
  ok(lookOk === lookTries && lookFound < lookTries, `Look for finds whoever Who is here shows, and never for certain (${lookFound} of ${lookTries})`);
  const tue = days(p => p.Day === 'Tue', 8, 120).map(n => at(n, '13:30'));
  const teach = Object.entries(P.teach || {}).find(([, s]) => s.some(x => x[0] === 'Potion Crafting'));
  ok(!teach || tue.every(V => { const w = E.whereabouts(P, V, teach[0]); return !w.busy || /teaching/.test(w.busy[0]); }), 'a teacher teaching this period stays busy (certain in their one room)');
}

console.log('on the way');
{
  let seen = 0, late = 0;
  for (const n of days(p => !['Sat', 'Sun'].includes(p.Day), 8, 120)) for (const t of ['16:05', '18:05']) for (const pk of ['courtyards', 'canteen', 'bell tower', 'lecture halls']) {
    const V = at(n, t), V2 = at(n, t.replace(':05', ':25'));
    if (P.roster.some(id => E.passingAt(P, V, id, pk))) seen++;
    if (P.roster.some(id => E.passingAt(P, V2, id, pk))) late++;
  }
  ok(seen > 0 && late === 0, `someone is on the way in a block's first 15 minutes (${seen} place-moments), nobody after`);
  const V = at(9, '16:05');
  const way = P.roster.map(id => [id, E.onTheWay(P, V, id)]).filter(([, x]) => x);
  ok(way.length > 0 && way.some(([id, x]) => (P.stu || {})[id] && x[0]), `a student walks from class (${way.slice(0, 3).map(([id, x]) => id + ' ' + x[0] + ' → ' + x[1][3]).join('; ')})`);
}

console.log('Campus now, the "usually" displays');
{
  const S = { ...S0, Bonds: { ...S0.Bonds, Castor: { ...S0.Bonds.Etnie, Rank: 5 } } };
  let errand = false;
  for (const n of days(p => !['Sat', 'Sun'].includes(p.Day), 8, 60)) {
    const V = at(n, '12:40'), r = E.campusFeed(P, V, S).find(x => x.id === 'Castor');
    if (r && /quote/.test(r.what)) { errand = true; ok(!r.where, 'an errand has no one place in Campus now'); break; }
  }
  ok(errand, 'Castor chasing a quote shows as an errand');
  ok(!E.rtMain(['', 0, 0, '', '', '', '', 'habit', 80, { ev: 'circus' }, null]) && !E.rtMain(['', 0, 0, '', '', '', '', 'habit', 60, { wx: 'bad' }, null]) && E.rtMain(['', 0, 0, '', '', '', '', 'habit', 70, {}, null]), 'a main row: weight 50+, no event, exam or bad-weather row');
  const tri = (U.DATA.npcs.Trixie.fl.find(f => f[0] === 'Routine') || [])[1] || '';
  ok(tri && !/circus|indoor performance/.test(tri) && /Courtyards/.test(tri), `the dossier's Routine field: the usual days only (${tri.slice(0, 80)}…)`);
}

console.log('quiet places stay quiet (against 2.1.2)');
{
  const base = JSON.parse(rd('tests/fixtures/presence_empty_2.1.2.json')).empty;
  const places = Object.values(P.vn).sort(), out = [0, 0, 0, 0, 0], tot = [0, 0, 0, 0, 0];
  for (let n = 8; n < 36; n++) for (const t of ['12:20', '16:40', '18:40']) {
    const V = at(n, t);
    for (const p of places) for (let c = 0; c < 5; c++) { tot[c]++; if (!(E.presenceAt(P, V, p, c).regs || []).length) out[c]++; }
  }
  const now = out.map((x, i) => Math.round(x / tot[i] * 1000) / 10);
  ok(now.every((x, i) => Math.abs(x - base[i]) <= 10), `empty visits per crowd 0-4: ${now.join(' / ')} % (2.1.2: ${base.join(' / ')})`);
}
