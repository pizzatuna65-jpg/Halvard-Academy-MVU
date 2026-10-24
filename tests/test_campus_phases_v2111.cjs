// 2.1.1 (owner-approved planning/DRAFT_campus_phases.md, roadmap R3): campus phases and weekly fads. A phase is one background line
// in <now> for the days before and after the calendar's events (data/campus_phases.json phases, every year, one at a time); on a
// day without one, the week may have a fad (trends: one week in trend_rate percent, seeded per chat and week, never one of the last
// trend_gap weeks', in its season). Neither away from campus, on a home or lockdown day, or with Features campus_phases off. The
// Notice Board shows the same line; Settings counts it.
const fs = require('fs'), path = require('path'), _ = require('lodash');
const { initState, applyPatch, ok, ROOT, renderEntry } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = JSON.parse(rd('dist/Eldrasil_Halvard.json'));
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { trendOn, TRENDS, PHASES, SEASON_OF, dayParts, eventsOn };')();
global.window = { parent: { document: {} } };
const U = new Function(rd('src/scripts/ui.js') + '\nreturn { nbNotices, featureState, FEATS };')();
const DATA = JSON.parse(rd('data/campus_phases.json'));
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const parts = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const doy = w => { const m = /^M(\d+) W(\d) (\w{3})$/.exec(w); return (m[1] - 1) * 28 + (m[2] - 1) * 7 + D.indexOf(m[3]); };
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const S0 = applyPatch(initState({ etnie: true }), [...W({ Month: 1, Week: 1, Day: 'Mon', Time: '07:30', Location: 'Fire Dormitory' }), { op: 'replace', path: '/Player/Profile/Dorm', value: 'Fire' }]);
const on = n => applyPatch(S0, W({ ...parts(n), Time: '12:30', Location: 'Canteen' }));
const now = S => renderEntry(card, 505, S, null, { lastUserMessage: '' });
const lines = txt => txt.split('\n').filter(l => /^(Campus phase|Campus fad this week): /.test(l));

console.log('the data');
{
  ok(DATA.phases.length === 22 && DATA.trends.length === 22 && DATA.trend_rate === 60 && DATA.trend_gap === 8, '22 phases, 22 fads, 60%, 8 weeks');
  ok(E.PHASES.length === 22 && E.TRENDS.list.length === 22, 'the engine has them all');
}

console.log('each phase prints on its days and not outside them');
{
  const bad = [];
  for (const p of DATA.phases) {
    const a = doy(p.from), z = doy(p.to);
    for (const n of [a, z]) { const L = lines(now(on(n))); if (L.length !== 1 || L[0] !== 'Campus phase: ' + p.line) bad.push(`${p.id} day ${n}: ${L.join(' | ') || 'nothing'}`); }
    for (const n of [a - 1, z + 1]) if (n > 0 && lines(now(on(n))).some(l => l.includes(p.line))) bad.push(`${p.id} also on day ${n}`);
  }
  ok(!bad.length, 'from its first to its last day, one line, and not the day before or after' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  const S = on(doy('M2 W4 Mon'));
  ok(S.$ui.phase.kind === 'phase' && S.$ui.phase.id === 'midterms_coming_1', 'the state names it ($ui.phase)');
  ok(_.isEqual(on(doy('M2 W4 Mon')).$ui.phase, S.$ui.phase), 'the same on a swipe');
}

console.log('not away, not on a home or lockdown day, not with the feature off');
{
  const ex = on(doy('M2 W3 Wed')), brk = on(doy('M5 W4 Tue')), thin = on(doy('M7 W3 Wed')), hol = on(doy('M12 W2 Mon'));
  ok([ex, brk, thin, hol].every(S => S.$ui.phase === null && !lines(now(S)).length), 'the Expedition (away), the Mid-Year Break, the Thinning, Month 12: no line');
  const off = _.cloneDeep(S0); off.$ui.off = [...(off.$ui.off || []), 'campus_phases'];
  const X = applyPatch(off, W({ ...parts(doy('M2 W4 Mon')), Time: '12:30', Location: 'Canteen' }));
  ok(X.$ui.phase === null && !lines(now(X)).length, 'Features off: no line');
}

console.log('the weekly fads');
{
  const phaseDay = new Set(DATA.phases.flatMap(p => _.range(doy(p.from), doy(p.to) + 1)));
  let weeks = 0, withFad = 0; const bad = [];
  for (let seed = 1; seed <= 20; seed++) {
    const got = [];
    for (let wk = 0; wk < 96; wk++) {   // two campaign years
      const t = E.trendOn(seed, wk); got.push(t); weeks++;
      if (!t) continue;
      withFad++;
      const season = E.SEASON_OF(E.dayParts(wk * 7).Month);
      if (!(t.season === 'all' || t.season.includes(season))) bad.push(`seed ${seed} week ${wk}: ${t.id} in ${season}`);
      const back = got.slice(Math.max(0, wk - DATA.trend_gap), wk).filter(Boolean).map(x => x.id);
      if (wk % 48 >= DATA.trend_gap && back.includes(t.id)) bad.push(`seed ${seed} week ${wk}: ${t.id} again within ${DATA.trend_gap} weeks`);
    }
    ok(_.isEqual(got, _.range(96).map(wk => E.trendOn(seed, wk))), `seed ${seed}: the same every time it is asked`);
  }
  ok(!bad.length, 'in its season, never one of the last 8 weeks\' fads' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  const pct = withFad / weeks * 100;
  ok(pct > 45 && pct < 75, `about 60% of weeks have one (${pct.toFixed(1)}%)`);
  ok(!_.isEqual(_.range(48).map(wk => (E.trendOn(1, wk) || {}).id), _.range(48).map(wk => (E.trendOn(2, wk) || {}).id)), 'another chat, another year of fads');
  // in the state and in <now>: only on a day without a phase, all week the same, with the in-character tail
  const seed = S0.$eng.seed;
  let shown = 0, wrong = [];
  for (let n = 0; n < 308; n += 3) {
    const S = on(n), ph = S.$ui.phase, t = E.trendOn(seed, Math.floor(n / 7)), away = E.eventsOn(parts(n)).some(e => e.home || e.lockdown || e.away);
    if (phaseDay.has(n) || away) { if (ph && ph.kind === 'trend') wrong.push(`day ${n}: a fad on a phase or away day`); continue; }
    if (t ? !(ph && ph.kind === 'trend' && ph.id === t.id) : ph) wrong.push(`day ${n}: ${JSON.stringify(ph)} vs ${t && t.id}`);
    if (ph && ph.kind === 'trend') {
      shown++;
      const L = lines(now(S));
      if (L.length !== 1 || L[0] !== `Campus fad this week: ${ph.line} (background; people take to it or scoff, each in character)`) wrong.push(`day ${n}: ${L.join(' | ')}`);
    }
  }
  ok(shown > 10 && !wrong.length, `this week's fad on the days without a phase (${shown} sampled days)` + (wrong.length ? ': ' + wrong.slice(0, 3).join('; ') : ''));
}

console.log('the player sees the same line; Settings counts it');
{
  const S = on(doy('M2 W4 Mon'));
  ok(U.nbNotices(S).includes('<b>On campus:</b> ' + _.escape(S.$ui.phase.line).replace(/&#39;/g, "'")) || U.nbNotices(S).includes('On campus:</b>'), 'the Notice Board: "On campus: …"');
  const f = U.FEATS.find(x => x.id === 'campus_phases');
  ok(f && U.featureState(S, f) >= 30 && U.featureState(on(doy('M5 W4 Tue')), f) === 0, `Settings: about ${U.featureState(S, f)} tokens while one runs, 0 on a day without`);
  const longest = Math.max(...[...DATA.phases, ...DATA.trends].map(x => x.line.length));
  ok(longest / 3.6 < 60, `the longest line is about ${Math.round(longest / 3.6)} tokens`);
}
