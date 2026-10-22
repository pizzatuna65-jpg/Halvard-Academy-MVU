// 1.32.0 (owner): Dorm Days on Sundays, Final Ranking on M11 W2 Monday, the Academy Trip M11 W2 Sat to W3 Thu, the Kingdom
// Competition Wed-Sat in the capital (the team flies out Tue, home Sun), and <now> "Coming up": the calendar of the next seven days.
const fs = require('fs'), path = require('path'), ejs = require('ejs'), _ = require('lodash');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { fromAbs, eventsOn };')();
const at = (S, d, hhmm, loc) => { const [h, m] = hhmm.split(':').map(Number), T = E.fromAbs(d * 1440 + h * 60 + m);
  return applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => ({ op: 'replace', path: '/World/' + k, value: T[k] })),
    ...(loc ? [{ op: 'replace', path: '/World/Location', value: loc }] : [])]); };
const day = (m, w, d) => (m - 1) * 28 + (w - 1) * 7 + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(d);
const on = (m, w, d) => E.eventsOn({ Month: m, Week: w, Day: d }).map(e => e.t).join(' | ');
// 1.44.0: the seven days of <now> "Coming up" are the Agenda feed's events (the same filter as 505)
const soonOf = S => (S.$ui.agenda || []).filter(x => x.k === 'event' && !x.h && x.d >= 1 && x.d <= 7).map(x => x.on.replace(/^(Y\d+ )?M\d+ /, '') + (x.to ? '–' + x.to : '') + ': ' + x.t);
const now = S => ejs.render(read('src/worldbook/custom/content/505.txt'), { getvar: k => _.get({ stat_data: S }, k) });

console.log('Calendar moves');
ok(/Spiritual Dorm Day/.test(on(1, 4, 'Sun')) && !/Dorm Day/.test(on(1, 4, 'Sat')) && /Occult Dorm Day/.test(on(10, 2, 'Sun')), 'Dorm Days are on Sundays');
ok(/Final Ranking/.test(on(11, 1, 'Sat')) && !/Final Ranking/.test(on(11, 2, 'Mon')), 'Results & Final Ranking on M11 W1 Saturday (1.97.1)');
ok(/Academy Trip/.test(on(11, 2, 'Mon')) && /Academy Trip/.test(on(11, 2, 'Sat')) && !/Academy Trip/.test(on(11, 2, 'Sun')) && !/Academy Trip/.test(on(11, 3, 'Mon')), 'the Academy Trip runs M11 W2 Mon to Sat (1.97.1)');
ok(/Year's End/.test(on(11, 1, 'Fri')) && /World Competition/.test(on(11, 3, 'Mon')) && /World Competition/.test(on(11, 4, 'Mon')) && /Year's End/.test(on(11, 4, 'Sat')) && /Graduation/.test(on(11, 4, 'Sun')), 'Month 11 (1.97.1): Year\'s End W1 Fri, World Competition W3 Mon to W4 Mon, Year\'s End W4 Tue-Sat, Graduation W4 Sun');
ok(/flies to the capital/.test(on(9, 4, 'Tue')) && /^Kingdom Competition/.test(on(9, 4, 'Wed')) && /flies home/.test(on(9, 4, 'Sun')) && !on(10, 1, 'Mon'),
  'Kingdom Competition Wed-Sat; the team flies out Tue and home Sun, with Monday free before Remembrance Day');

console.log('Coming up');
let S = at(initState(), day(10, 2, 'Wed'), '10:00', 'Main Library');
ok(soonOf(S).some(x => /^W2 Sun: Occult Dorm Day$/.test(x)), 'the Dorm Day four days out is listed');
const n = now(S);
ok(/Coming up \(next seven days; students and staff may bring these up[^\n]*W2 Sun: Occult Dorm Day/.test(n), '<now> carries the Coming up line');
S = at(initState(), day(9, 4, 'Mon'), '10:00', 'Main Library');   // a fresh chat: the clock never runs backwards
ok(soonOf(S).some(x => /^W4 Wed–Sat: Kingdom Competition/.test(x)), 'a run of days of one event is one line');
S = at(S, day(11, 3, 'Mon'), '10:00', 'Sunreach Bay hotel');
ok(!soonOf(S).some(x => /Academy Trip/.test(x)), 'an event already running today is not repeated');
S = at(S, day(12, 1, 'Mon'), '10:00', 'Main Library');
ok(!soonOf(S).length, 'the Month 12 holiday is left out');
