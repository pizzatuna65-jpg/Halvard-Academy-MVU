// 2.3.0 (owner-approved planning/DRAFT_offscreen.md, roadmap M1 + M2): Own time. At each day change every NPC with a bond has a
// seeded chance that something small happened to them yesterday (data/offscreen.json: rate, at most once in gap + 1 days), never
// after a day mostly spent with {{user}}; one "(Own time)" line in $Recent, replacing the last; the Cast Sheet shows it for `show` days,
// Campus now for close friends, Meanwhile uses it. No bond, Trust or Tension change.
const fs = require('fs'), path = require('path'), _ = require('lodash');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { PRESENCE, OWN, TEN, NPC_GROUP, presenceView, campusFeed, uiOn, ownOf, OWN_TAG };')();
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const O = JSON.parse(rd('data/offscreen.json')), P = E.PRESENCE;
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const at = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const IDS = (P.roster || []).filter(id => E.NPC_GROUP[id] && E.NPC_GROUP[id] !== 'rival' && !(P.arr || {})[id]);
function base(opts = {}) {
  let S = applyPatch(initState({ etnie: true }), [...W({ ...at(8), Time: '20:00', Location: 'Fire Dormitory' }), put('/Player/Profile/Dorm', 'Fire')]);
  S = _.cloneDeep(S);
  for (const id of IDS) S.Bonds[id] = { ...(S.Bonds[id] || S.Bonds.Etnie), Rank: opts.rank == null ? 3 : opts.rank, $Recent: [], Trust: 50, Tension: 0 };
  if (opts.off) S.$ui.off = [...(S.$ui.off || []), 'offscreen'];
  return applyPatch(S, W({ Time: '20:10' }));
}
const own = b => (b.$Recent || []).filter(r => String(r.n).startsWith('(Own time) '));
const day = (S, n, x = []) => applyPatch(S, [...W({ ...at(n), Time: '08:00', Location: 'Fire Dormitory' }), ...x]);

console.log('the draw');
const S0 = base();
let S = S0;
const hits = {}, texts = [], perDay = [];
const snaps = [];
for (let n = 9; n < 79; n++) {
  S = day(S, n);
  let k = 0;
  for (const id of IDS) {
    const L = own(S.Bonds[id]);
    if (L.length > 1) throw new Error(`${id} holds ${L.length} Own time lines`);
    const r = L[0];
    if (r && !(hits[id] || []).includes(r.w)) { (hits[id] = hits[id] || []).push(r.w); texts.push([id, r.n]); k++; }
  }
  perDay.push(k);
  if (n === 30) snaps.push(_.cloneDeep(S));
}
{
  const elig = IDS.length, days = perDay.length, total = perDay.reduce((a, b) => a + b, 0);
  ok(IDS.every(id => !own(S0.Bonds[id]).length) && S0.$eng.own && S0.$eng.own.d === 8, 'a new chat (or a save from before 2.3.0) draws nothing on its first day: it starts from the next day');
  const mean = total / (elig * (days - 1));
  ok(mean > 0.06 && mean < 0.14, `about one in ten days per person (${(1 / mean).toFixed(1)} days on average over ${days} days, ${elig} people)`);
  ok(perDay.slice(1).some(k => k === 0) || perDay.slice(1).some(k => k <= 2), `some days are quiet (fewest in a day: ${Math.min(...perDay.slice(1))}, most: ${Math.max(...perDay)})`);
  const stamp = w => { const m = /M(\d+) W(\d) (\w+)/.exec(w); return (m[1] - 1) * 28 + (m[2] - 1) * 7 + D.indexOf(m[3]); };
  const gaps = Object.values(hits).flatMap(L => L.map(stamp).sort((a, b) => a - b).map((d, i, a) => (i ? d - a[i - 1] : 99)));
  ok(Math.min(...gaps) > O.gap, `never two in ${O.gap + 1} days (shortest gap ${Math.min(...gaps)} days)`);
  const spread = new Set(gaps.filter(g => g < 99));
  ok(spread.size >= 5, `the gaps vary, no fixed beat (${[...spread].sort((a, b) => a - b).join(', ')} days)`);
  ok(Object.keys(hits).length >= elig * 0.8, `most people get one now and then (${Object.keys(hits).length} of ${elig})`);
  ok(texts.every(([, n]) => !/\{|\}|\{\{user\}\}|undefined/.test(n) && /\.$/.test(n)), 'every line is filled in, ends with a full stop, and never names {{user}}');
  const S2 = day(snaps[0], 31), S3 = day(snaps[0], 31);
  ok(JSON.stringify(IDS.map(id => own(S2.Bonds[id]))) === JSON.stringify(IDS.map(id => own(S3.Bonds[id]))), 'the same on a swipe');
  let Q = base({ off: true }); for (let n = 9; n < 79; n++) Q = day(Q, n);
  const bonds = X => IDS.map(id => [X.Bonds[id].Rank, X.Bonds[id].Progress, X.Bonds[id].Trust, X.Bonds[id].Tension].join());
  ok(_.isEqual(bonds(S), bonds(Q)) && _.isEqual(S.Reputation, Q.Reputation), 'no bond, Trust, Tension or reputation change (the same as with Own time off, after 70 days)');
}

console.log('who gets which line');
{
  const byText = O.items.map(it => [it, new RegExp('^\\(Own time\\) ' + it.text.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\\{\w+\\\}|\{\w+\}/g, '.+') + '\\.$')]);
  const bad = [], seen = new Set();
  for (const [id, n] of texts) {
    const hit = byText.filter(([, rx]) => rx.test(n)).map(([it]) => it);
    if (!hit.length) { bad.push(`${id}: no template for "${n}"`); continue; }
    const cat = (E.TEN.overrides || {})[id] ? '' : (E.TEN.npcs || {})[id] || '', st = E.NPC_GROUP[id] === 'student';
    const fits = hit.some(it => (it.for === 'all' || it.for.includes(cat)) && (it.who === 'all' || (it.who === 'student') === st) && !(it.not || []).includes(id)
      && !(it.needs.includes('home') && P.ct.breaks.stay.includes(id)) && !(it.needs.includes('teach') && !(P.teach || {})[id]));
    if (!fits) bad.push(`${id} (${cat || 'override'}, ${st ? 'student' : 'staff'}): "${n}"`);
    hit.forEach(it => seen.add(it.id));
  }
  ok(!bad.length, 'every line fits who they are (Tension category, student or staff, home, teaching)' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  ok(seen.size >= 18, `many different kinds turn up (${seen.size} of ${O.items.length})`);
  const letter = texts.filter(([id, n]) => /from home/.test(n) && P.ct.breaks.stay.includes(id));
  ok(!letter.length, 'no letter or parcel from home for those with no home to go to (' + P.ct.breaks.stay.join(', ') + ')');
  const rival = texts.filter(([, n]) => /had words with|lost a small bet to|beat .+ at something|out of .+'s way/.test(n));
  ok(rival.every(([id, n]) => IDS.some(x => n.includes(x) && x !== id)), `a rival is someone {{user}} knows (${rival.length} rival lines)`);
  ok(!texts.some(([, n]) => / at the the |at The /.test(n)), 'place names read as prose ("at the Canteen")');
}

console.log('where it shows');
{
  // find someone whose line is from yesterday on some day, then put them in the scene
  let T = snaps[0], who = '', n0 = 30;
  for (let n = 31; n < 60 && !who; n++) { T = day(T, n); n0 = n; who = IDS.find(id => (own(T.Bonds[id])[0] || {}).w === `M${at(n - 1).Month} W${at(n - 1).Week} ${at(n - 1).Day}`) || ''; }
  ok(!!who, `someone's line is from yesterday (${who}, day ${n0})`);
  const line = own(T.Bonds[who])[0].n.slice('(Own time) '.length).replace(/\.$/, '');
  const In = applyPatch(T, [put('/Scene/Present', { [who]: { Mood: 'Normal' } }), ...W({ Time: '08:20' })]);
  const now = JSON.stringify(In.$ui.now || {});
  ok(now.includes('Own time (yesterday): ' + line + '.'), `the Cast Sheet prints it: "Own time (yesterday): ${line}"`);
  ok(!/Recent with \{\{user\}\}[^"]*\(Own time\)/.test(now), 'and not among the moments with {{user}}');
  const two = applyPatch(day(T, n0 + 1), [put('/Scene/Present', { [who]: { Mood: 'Normal' } }), ...W({ Time: '08:20' })]);
  const three = applyPatch(day(day(T, n0 + 1), n0 + 2), [put('/Scene/Present', { [who]: { Mood: 'Normal' } }), ...W({ Time: '08:20' })]);
  const o2 = own(two.Bonds[who])[0], o3 = own(three.Bonds[who])[0];
  ok(o2 && o2.n.endsWith(line + '.') ? JSON.stringify(two.$ui.now).includes('Own time (2 days ago): ' + line) : true, 'two days later: "2 days ago"');
  ok(o3 && o3.n.endsWith(line + '.') ? !JSON.stringify(three.$ui.now).includes(line) : true, 'three days later it is no longer printed (it stays in Recent)');
  const r504 = renderEntry(card, 504, In);
  ok(r504.includes('An (Own time) line is background, not an opener'), '504: the line is background, never an opener');
  const view = X => E.presenceView(P, X, id => E.uiOn(X.$ui, id));
  const F = E.campusFeed(P, view(T), T), row = F.find(x => x.id === who);
  ok(!row || row.own === 'yesterday: ' + line, `Campus now adds it for a close friend (${row ? row.own : 'not in the feed now'})`);
  const T1 = _.cloneDeep(T); T1.Bonds[who].Rank = 1;
  const r1 = E.campusFeed(P, view(T1), T1).find(x => x.id === who);
  ok(!r1 || !r1.own, 'not for someone below Rank 3');
  ok((T.$ui.feed || []).every(x => x.length === 4), 'the bracelet fold carries it as a fourth field');
}

console.log('time together, Meanwhile and the toggle');
{
  // a whole day in the scene with Etnie: no line for her the next morning, on any of the seeded days
  let T = base(), got = 0;
  for (let n = 9; n < 70; n++) {
    T = applyPatch(T, [...W({ ...at(n), Time: '09:00', Location: 'Canteen' }), put('/Scene/Present', { Etnie: { Mood: 'Normal' } })]);
    T = applyPatch(T, W({ Time: '15:00' }));
    T = applyPatch(T, [...W({ Time: '20:00' }), put('/Scene/Present', {})]);
    if (own(T.Bonds.Etnie).length) got++;
  }
  ok(got === 0, 'a day spent with {{user}} (4 hours or more in the scene) gives no Own time line the next day');
  const Off = base({ off: true });
  let X = Off; for (let n = 9; n < 30; n++) X = day(X, n);
  ok(IDS.every(id => !own(X.Bonds[id]).length), 'Features: Own time off draws nothing');
  ok(!renderEntry(card, 504, X).includes('(Own time) line'), 'and 504 drops the line');
  // Meanwhile (Rank 7+, a week unseen) tells the week's own time when there is one
  let M = base({ rank: 7 }), mw = [];
  for (let n = 9; n < 60; n++) { M = day(M, n); mw.push(...(M.Journal || []).map(String).filter(l => /Meanwhile: /.test(l))); }
  const tells = _.uniq(mw).filter(l => O.items.some(it => new RegExp(it.text.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\\{\w+\\\}|\{\w+\}/g, '.+')).test(l)));
  ok(tells.length > 0, `Meanwhile uses it (${tells.length} of ${_.uniq(mw).length} lines), e.g. "${(tells[0] || '').slice(0, 90)}"`);
}
