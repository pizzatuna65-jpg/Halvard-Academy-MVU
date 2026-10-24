// 2.1.0 (owner roadmap R1, planning/FUTURE_PLANS.md §0.1): Campus now. What each person {{user}} has a bond with is doing now
// (shared.js campusFeed): where only from Bond Rank 3 with their Haunts open, from their routine; anyone else only what anyone can see.
// A place it names is never one Look for would miss. The bracelet folds a few of them ($ui.feed, campusFew: seeded per block, the
// same on a swipe), the People panel lists everyone; none of it reaches the prompt. Meanwhile now reads the routines too.
const fs = require('fs'), path = require('path'), _ = require('lodash');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { PRESENCE, presenceView, campusFeed, campusFew, whereabouts, lookFor, crowdOf, uiOn, placeKey };')();
global.window = { parent: { document: {} } };
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { DATA, PANELS, view, campusNowHTML };')();
const P = E.PRESENCE;
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const at = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const FRIENDS = { Irene: 3, Etnie: 5, Trixie: 1, Kanae: 0, Gareth: 4, Caralynn: 2 };
function base() {
  let S = applyPatch(initState({ etnie: true }), [...W({ ...at(8), Time: '07:30', Location: 'Fire Dormitory' }), put('/Player/Profile/Dorm', 'Fire')]);
  S = _.cloneDeep(S);   // the rank is engine-owned: set it on the prior state
  for (const [id, r] of Object.entries(FRIENDS)) S.Bonds[id] = { ...(S.Bonds[id] || S.Bonds.Etnie), Rank: r };
  return S;
}
const S0 = base();
const go = (S, o, x = [], user = '') => applyPatch(S, [...W(o), ...x], { user });
const view = S => E.presenceView(P, S, id => E.uiOn(S.$ui, id));
const feedOf = S => E.campusFeed(P, view(S), S);
const row = (F, id) => F.find(x => x.id === id);

console.log('who shows what');
{
  let routine = 0, cls = 0, checked = 0; const bad = [];
  for (let n = 8; n < 36; n++) for (const t of ['09:30', '12:30', '16:30', '19:10']) {
    const S = go(S0, { ...at(n), Time: t, Location: 'Fire Dormitory' }), F = feedOf(S), V = view(S);
    for (const x of F) {
      checked++;
      const w = E.whereabouts(P, V, x.id);
      if (x.close !== (x.rank >= 3)) bad.push(`${x.id} Rank ${x.rank}: close ${x.close}`);
      if (!x.close && (x.where || (w.rt && x.what === w.rt[5]))) bad.push(`${x.id} Rank ${x.rank} ${D[n % 7]} ${t}: "${x.what} - ${x.where}"`);
      if (w.busy) { if (x.what !== w.busy[0]) bad.push(`${x.id}: busy "${x.what}"`); cls++; }
      if (x.close && w.rt && x.where) routine++;
    }
  }
  ok(!bad.length, 'close only from Rank 3; below it no place and no routine; busy is what anyone can see' + (bad.length ? ': ' + bad.slice(0, 5).join('; ') : ''));
  ok(routine > 0 && cls > 0, `routines with a place (${routine}) and classes (${cls}) both show, over ${checked} rows`);
  const F = feedOf(go(S0, { ...at(9), Time: '12:30', Location: 'Fire Dormitory' }));
  ok(!row(F, 'Krieg') && F.every(x => S0.Bonds[x.id]), 'only people {{user}} has a bond with');
}

console.log('status, sickness, Scene.Present');
{
  const S = go(S0, { ...at(9), Time: '12:30', Location: 'Fire Dormitory' }, [put('/Campus_State/NPC_status', { Irene: 'visiting her family in the capital', Trixie: 'in the Medical Centre with a sprained ankle' }), put('/Scene/Present', { Gareth: { Note: '' } })]);
  const F = feedOf(S);
  ok(row(F, 'Irene').what === 'visiting her family in the capital', 'a close friend\'s status is told as written');
  ok(row(F, 'Trixie').what === 'away' && !row(F, 'Trixie').where, 'an acquaintance\'s status: only "away"');
  ok(!row(F, 'Gareth'), 'someone with {{user}} is not in the feed');
}

console.log('a place it names: Look for finds them there most times');
{
  let named = 0, agree = 0;
  for (let n = 8; n < 40; n++) for (const t of ['07:10', '12:30', '16:30', '17:40', '19:10']) {
    const S = go(S0, { ...at(n), Time: t, Location: 'Fire Dormitory' }), V = view(S);
    for (const x of E.campusFeed(P, V, S).filter(y => y.where)) {
      named++;
      const pk = E.placeKey(x.where), r = E.lookFor(P, V, x.id, pk, E.crowdOf(P, S.$ui.crowd, pk));
      if (r.found) agree++;
    }
  }
  ok(named > 10 && agree < named && agree >= 0.75 * named, `Look for finds them there most times, never for certain (${agree} of ${named}; 2.2.0 Routine 2.0: meet + 25, at most 90)`);
}

console.log('the weather keeps them off an outdoor place, as Look for does');
{
  const out = new Set(P.outd || []), hits = [];
  for (const [id, rows] of Object.entries(P.rt || {})) for (const r of rows) if (out.has(r[3]) && r[3] !== 'boathouse and lake' && r[3] !== 'fishing house') hits.push([id, r]);
  ok(hits.length > 0, `routines at outdoor places exist (${hits.length})`);
  const [id, r] = hits[0];
  let S = _.cloneDeep(S0); S.Bonds[id] = { ...S.Bonds.Etnie, Rank: 5 };
  let tried = 0, shown = 0;
  for (let n = 8; n < 60 && !shown; n++) {
    if (!r[0].includes(D[n % 7])) continue;
    const t = String(Math.floor(r[1] / 60)).padStart(2, '0') + ':' + String(r[1] % 60 + 20).padStart(2, '0');   // 2.2.1: past the 15 minutes on the way
    const A = go(S, { ...at(n), Time: t, Location: 'Fire Dormitory' }), V = view(A), w = E.whereabouts(P, V, id);
    if (!w.rt || w.rt[3] !== r[3]) continue;
    tried++;
    const clear = E.campusFeed(P, { ...V, bad: false }, A).find(x => x.id === id), wet = E.campusFeed(P, { ...V, bad: true, rain: true }, A).find(x => x.id === id);
    ok(clear.where === r[4] && wet.what === 'sheltering from the weather' && !wet.where, `${id}: "${clear.what} - ${clear.where}" in fair weather, sheltering in rain`);
    ok(!E.lookFor(P, { ...V, bad: true, rain: true }, id, r[3], 2).found, 'and Look for does not find them there either');
    shown++;
  }
  ok(tried > 0, 'a day where the routine held was found');
}

console.log('the bracelet\'s few');
{
  const S = go(S0, { ...at(10), Time: '12:30', Location: 'Canteen' });
  const fd = S.$ui.feed || [];
  ok(fd.length === 3 && fd.every(x => Array.isArray(x) && S0.Bonds[x[0]]), `three names (${fd.map(x => x[0]).join(', ')})`);
  ok(_.isEqual(go(S0, { ...at(10), Time: '12:30', Location: 'Canteen' }).$ui.feed, fd), 'the same on a swipe');
  ok(_.isEqual(go(S, { Time: '12:45' }).$ui.feed, fd), 'the same within the block');
  const seen = new Map();
  for (let n = 8; n < 64; n++) for (const t of ['09:30', '12:30', '16:30']) for (const x of go(S0, { ...at(n), Time: t, Location: 'Canteen' }).$ui.feed) seen.set(x[0], (seen.get(x[0]) || 0) + 1);
  ok((seen.get('Etnie') || 0) > (seen.get('Kanae') || 0), `weighted by rank: Etnie (5) ${seen.get('Etnie')}, Kanae (0) ${seen.get('Kanae') || 0}`);
  ok(_.isEqual(go(S0, { ...at(10), Time: '21:30', Location: 'Fire Dormitory' }).$ui.feed, []), 'after curfew: none');
  const off = _.cloneDeep(S0); off.$ui.off = [...(off.$ui.off || []), 'campus_now'];
  ok(_.isEqual(go(off, { ...at(10), Time: '12:30', Location: 'Canteen' }).$ui.feed, []), 'Features off: none');
}

console.log('the panel and the bracelet');
{
  const S = go(S0, { ...at(10), Time: '12:30', Location: 'Canteen' }), fd0 = S.$ui.feed;
  U.view.ptab = 'now';
  const h = U.PANELS.people.render(S);
  ok(/data-ptab="now"/.test(h) && /They tell you their plans/.test(h) && /Others you know/.test(h), 'the People panel has a Campus now tab with both groups');
  ok(Object.keys(FRIENDS).filter(id => id !== 'Kanae' || S.Bonds.Kanae).every(id => h.includes(`data-open="npc:${id}"`)), 'everyone with a bond is on it');
  const off = _.cloneDeep(S); off.$ui.on = { ...off.$ui.on, campus_now: false };
  ok(!/data-ptab="now"/.test(U.PANELS.people.render(off)), 'Features off: no tab');
  ok(/After curfew/.test(U.campusNowHTML(go(S0, { ...at(10), Time: '21:30', Location: 'Fire Dormitory' }))), 'after curfew the tab says so');
  const bar = rd('src/ui/statusbar.html'), js = bar.split('<script>').slice(1).map(s => s.split('</script>')[0]).join('\n');
  const band = { innerHTML: '', className: '', st: {}, addEventListener() {}, querySelectorAll: () => [] };
  band.style = { setProperty: () => {} };
  const env = { document: { getElementById: id => (id === 'band' ? band : null), createElement: () => ({}) }, window: { addEventListener() {}, parent: {} },
    localStorage: { getItem: () => null, setItem() {} }, sessionStorage: { getItem: () => '1', setItem() {} },
    getCurrentMessageId: () => 0, getLastMessageId: () => 0, getVariables: () => ({ stat_data: _.cloneDeep(S) }),
    getChatMessages: () => [], tavern_events: {}, eventOn() {}, waitGlobalInitialized: () => ({ then() {} }), setInterval: () => 0, clearInterval() {}, setTimeout() {}, _ };
  new Function(...Object.keys(env), js)(...Object.values(env));
  ok(/<details class="delta cnow"><summary>Campus now <small>3 of the people you know<\/small>/.test(band.innerHTML) && /data-open="people:now"/.test(band.innerHTML), 'the bracelet folds three, with a link to the tab');
  const card = JSON.parse(rd('dist/Eldrasil_Halvard.json')), sent = [501, 505].map(u => renderEntry(card, u, S, null, { lastUserMessage: '' })).join('\n');
  ok(!/Campus now|somewhere on campus|where you found them/.test(sent) && fd0.every(x => !sent.includes(x[0] + ' : ')), 'nothing of it reaches the prompt (501 and 505 as rendered)');
}

console.log('Meanwhile reads the routines');
{
  let S = _.cloneDeep(S0); S.Bonds.Irene = { ...S.Bonds.Etnie, Rank: 7 };
  S.$ui.off = [...(S.$ui.off || []), 'offscreen'];   // 2.3.0: a week's Own time comes first (test_offscreen_v2300); here the routines alone
  S = go(S, { ...at(8), Time: '12:00', Location: 'Canteen' }, [put('/Scene/Present', { Irene: { Note: '' } })]);
  S = go(S, { Time: '12:30' }, [put('/Scene/Present', {})]);
  let line = '';
  for (let n = 9; n < 24 && !line; n++) { S = go(S, { ...at(n), Time: '12:00', Location: 'Canteen' }); line = (S.Journal || []).map(String).find(l => /Meanwhile: Irene/.test(l)) || ''; }
  const mine = (P.rt.Irene || []).map(r => `was seen at ${r[4]} as usual${r[5] ? ' (' + r[5] + ')' : ''}`);
  ok(mine.some(m => line.includes('Meanwhile: Irene ' + m)), `a Rank 7 friend unseen for a week, one of her routines: ${line}`);
}
