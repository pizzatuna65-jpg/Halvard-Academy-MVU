// 1.92.0 (owner-approved planning/DRAFT_kerja_club.md §4.7): the weekly club client. When {{user}} is in a service club (Tailoring,
// Smithing, Fishing, the Library Assistants), once a week a 40% chance that a student who is not a member comes to the club for a
// service on one of its days: <now> tells the narrator while {{user}} is there; otherwise the Journal says another member took it.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { toAbs, fromAbs, DAY_MIN, CLUB_MEMBERS };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (id, S) => ejs.render(card.character_book.entries.find(e => e.id === id).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value });
function at(W, seed, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 2, Week: 2, Day: 'Mon', Time: '08:00', Location: 'Canteen', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Year: 1, Name: 'Aria Vale', Club: 'Tailoring Club' });
  S.Player.Wallet.Points = 300; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = seed;
  for (const [k, v] of Object.entries(extra)) _.set(S, k, v);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = []) => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops]);
const cl = S => S.$eng.client || {};
const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

console.log('The weekly draw');
const runs = [], members = E.CLUB_MEMBERS['Tailoring Club'] || [];
for (let s = 1; s <= 120; s++) runs.push([s, at({}, s)]);
const hit = runs.filter(([, S]) => cl(S).id);
ok(hit.length >= 30 && hit.length <= 66, `about 40% of weeks bring a client (${hit.length} of 120)`);
ok(hit.every(([, S]) => !members.includes(cl(S).id)), 'never a member of the club');
ok(hit.every(([, S]) => cl(S).loc === 'workshop' && cl(S).at === 13 * 60 + 45 && cl(S).to === 16 * 60 && /^.+$/.test(cl(S).ask)), 'the Tailoring Club: the Workshop, 13:45 on Saturday, with an ask: ' + cl(hit[0][1]).ask);
ok(new Set(hit.map(([, S]) => cl(S).id)).size >= 10, 'different students across seeds');
const [s0, S0] = hit[0], id0 = cl(S0).id;
ok(cl(go(S0, { Day: 'Wed', Time: '10:00' })).id === id0, 'one client a week: the same all week');
ok(!cl(at({}, s0, { 'Player.Profile.Club': 'Soccer Club' })).id, 'not in a service club: nobody comes');
const tense = at({}, s0, { [`Bonds.${id0}`]: { Rank: 1, Trust: 20, Tension: 80 } });
ok(cl(tense).id !== id0, `Tension 70+ with {{user}}: ${id0} goes elsewhere`);

console.log('The visit');
const sat = go(S0, { Day: 'Sat', Time: hhmm(cl(S0).at + 5), Location: 'Workshop' });
const line = render(505, sat).split('\n').find(l => l.startsWith('Club work: Club client: '));
ok(line && line.includes(id0) && line.includes('comes to the Workshop') && /help Interaction/.test(line), '<now> at the Workshop: ' + (line || '').slice(0, 160));
ok(!(sat.Journal || []).some(l => /took the job/.test(l)), 'no Journal line when {{user}} was there');
const after = go(sat, { Time: '17:00', Location: 'Canteen' });
ok(!render(505, after).includes('Club client:') && !(after.Journal || []).some(l => /took the job/.test(l)), 'over: the line is gone');
const missed = go(S0, { Day: 'Sat', Time: '17:00' });
ok((missed.Journal || []).some(l => l.includes(`${id0} came to the Tailoring Club and`) && /took the job\.$/.test(l)), 'not there: the Journal says another member took the job');
const early = go(S0, { Day: 'Sat', Time: hhmm(cl(S0).at - 30), Location: 'Workshop' });
ok(!render(505, early).includes('Club client:'), 'not before they arrive');

console.log('Other clubs, the toggle');
const lib = runs.map(([s]) => at({}, s, { 'Player.Profile.Club': 'Library Assistants' })).find(S => cl(S).id);
ok(lib && cl(lib).loc === 'main library' && cl(lib).at % 60 === 45, 'the Library Assistants: a weekday or Saturday at the Main Library');
const fishing = runs.map(([s]) => at({}, s, { 'Player.Profile.Club': 'Fishing Club' })).find(S => cl(S).id);
ok(fishing && cl(fishing).loc === 'fishing house' && cl(fishing).at === 6 * 60 + 45, 'the Fishing Club: dawn at the Fishing House');
const off = applyPatch(at({}, s0), [op('/$ui/off', ['clubwork'])]);
ok(!render(505, go(off, { Day: 'Sat', Time: hhmm(cl(S0).at + 5), Location: 'Workshop' })).includes('Club client:'), 'Club work off: nobody comes');
