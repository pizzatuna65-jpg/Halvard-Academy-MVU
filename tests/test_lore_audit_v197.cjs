// 1.9.7 lore audit (planning/DRAFT_lore_audit.md): the hand-written calendar lore (entry 134, World Index dates, Academic Structure)
// must agree with the engine's EVENTS; {{user}}'s year in the World Index follows Player.Profile.Year; season lines and notes.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { EVENTS, SEASONS };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const entry = uid => card.character_book.entries.find(e => e.id === uid).content;
const render = (uid, S) => ejs.render(entry(uid), { getvar: k => _.get({ stat_data: S }, k) });
const at = (m, w) => E.EVENTS.filter(e => e.m === m && e.w === w);

console.log('Lore audit 1.9.7: calendar lore agrees with the engine');
{
  const cal = new Function('return ' + /const _cal = (\{[\s\S]*?\n\});/.exec(entry(134))[1])();
  const missing = E.EVENTS.filter(e => e.m !== 12 && !new RegExp(`\\bW${e.w}\\b`).test(cal[e.m])).map(e => `M${e.m}W${e.w} ${e.t}`);
  ok(!missing.length, 'every engine event week appears in the Calendar entry (134)' + (missing.length ? ': ' + missing.join('; ') : ''));
  const extra = [];
  for (let m = 1; m <= 11; m++) for (const [, w, rest] of cal[m].matchAll(/\bW(\d)\b([^.]*)/g))
    if (!/^\s*(open|normal classes)/.test(rest) && !at(m, +w).length) extra.push(`M${m}W${w}${rest}`);
  ok(!extra.length, 'every dated item in the Calendar entry has an engine event' + (extra.length ? ': ' + extra.join('; ') : ''));
  ok(/holiday all month/.test(cal[12]) && [1, 2, 3, 4].every(w => at(12, w).some(e => e.home)), 'Month 12: holiday in both');

  const idx = entry(0), dates = (line, rx) => [...(new RegExp(line + '[^\\n]*').exec(idx) || [''])[0].matchAll(rx)].map(x => [+x[1], +x[2]]);
  const want = [
    ['Competitions:', /Dorm M(\d+)W(\d)/g, /Dorm Competition/], ['Competitions:', /Academy M(\d+)W(\d)/g, /Academy Competition/],
    ['Competitions:', /Kingdom M(\d+)W(\d)/g, /Kingdom Competition/], ['Competitions:', /World M(\d+)W(\d)/g, /World Competition/],
    ['Exams:', /M(\d+)W(\d)/g, /exams/i], ['Dorm rank:', /M(\d+)W(\d)/g, /Ranking/], ['Breaks:', /M(\d+)W(\d)/g, /Break/], ['The Thinning', /M(\d+)W(\d)/g, /Thinning/],
  ];
  const bad = [];
  for (const [line, rx, title] of want) {
    const ds = dates(line, rx);
    if (!ds.length) bad.push(`${line} has no date`);
    for (const [m, w] of ds) if (!at(m, w).some(e => title.test(e.t))) bad.push(`${line} M${m}W${w} (${title})`);
  }
  ok(!bad.length, 'World Index dates (competitions, exams, rankings, breaks, the Thinning) match engine events' + (bad.length ? ': ' + bad.join('; ') : ''));
  ok(/World M11W3 to M11W4 \(abroad\)/.test(idx) && !/M12W4/.test(idx), 'World Competition is M11 W3 to W4 in the World Index (1.97.1)');
  ok(/World Competition abroad is in Month 11, from Week 3 Monday to Week 4 Monday/.test(entry(18)) && !/compete abroad in Week 4/.test(entry(18)), 'Academic Structure agrees (M11 W3 Mon to W4 Mon)');
  const seasons = /Seasons: M1-3 spring, M4-6 summer, M7-9 autumn, M10-12 winter\./.test(idx);
  ok(seasons && [0, 3, 6, 9].every((i, k) => E.SEASONS[i] === ['Spring', 'Summer', 'Autumn', 'Winter'][k]), 'World Index season line matches the engine table');
}

console.log("{{user}}'s year and the approved notes");
{
  const y1 = render(0, { Player: { Profile: { Year: 1 } } }), y2 = render(0, { Player: { Profile: { Year: 2 } } });
  ok(/\{\{user\}\} is a Year 1 student at Halvard/.test(y1) && /\{\{user\}\} is a Year 2 student at Halvard/.test(y2) && !/is a first-year at Halvard/.test(y2),
    'World Index: Year 1 and Year 2 render the current year, never "a first-year"');
  const v39 = JSON.parse(read('dist/lorebook_v39/eldrasil_v39_Core.json')).entries['0'].content;
  ok(/starts as a first-year at Halvard and moves up one year/.test(v39) && !/<%/.test(v39), 'standalone v39 World Index: plain line, no EJS');
  ok(/Combat roles: attack, defense, healing, support, control\./.test(entry(0)) && /The Ring Dining Hall opens only for feasts/.test(entry(0)), 'World Index: combat roles and Ring Dining Hall lines');
  ok(/winter is setting in/.test(entry(245)) && /stays warm all year/.test(entry(247)), 'Harvest Festival and Sunreach Bay fit the winter months');
  ok(/graduated last year without her/.test(read('src/worldbook/content/100.txt')), "Etnie's old cohort graduated last year");
  ok(!/v1\.4\.6/.test(card.creator_notes), 'creator notes carry no stale version');
}
