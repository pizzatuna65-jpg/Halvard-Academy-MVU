// 1.81.0 (owner-approved planning/DRAFT_event_frame.md, release A1): the shared event frame. Every calendar event has an id and a
// kind; today's events reach <now> as one line each (day n of m, now, next) from the engine ($ui.ev); event chances
// (data/event_frame.json) are read from what the reply reports, done once a year, and replace the 1.26.0 event XP without paying a save
// twice; event stalls are shop rows with ev that sell only on their day and hours, in the Price Guide, the Shop tab and the bracelet.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { eventBlocks, nextUp, happeningFits, eventsOn, toAbs, EVENTS, EVENT_FRAME };')();
const card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const entry = id => card.character_book.entries.find(e => e.id === id).content;
const render = (id, S) => ejs.render(entry(id), { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value });
const cal = JSON.parse(read('data/calendar.json'));

console.log('Calendar ids and kinds');
const ids = cal.events.map(e => e.id);
ok(ids.length === 46 && new Set(ids).size === 46, 'all 46 events have a unique id');
ok(cal.events.every(e => ['contest', 'showcase', 'festival', 'rite', 'trip', 'exam', 'day', 'holiday'].includes(e.kind)), 'every event has a known kind');
ok(Object.keys(E.EVENT_FRAME.chances).every(k => ids.includes(k)), 'every chance names a real event');

console.log('Timed items (eventBlocks, nextUp)');
const star = cal.events.find(e => e.id === 'star_night'), exp = cal.events.find(e => e.id === 'expedition'), harvest = cal.events.find(e => e.id === 'harvest');
const sb = E.eventBlocks(star, 'Sat');
ok(sb.some(b => b.at === 1200 && b.to === 1440 && /^Night market/.test(b.what)) && sb.some(b => b.at === 1440 && /meteor shower/.test(b.what)), 'Star Night: the 20:00–00:00 market runs to midnight, and "midnight:" is a timed item');
ok(E.eventBlocks(exp, 'Thu').some(b => b.at === 480 && /^Each group of four/.test(b.what)), '"08:00: …" is read (it was missed before 1.81.0)');
ok(E.eventBlocks(harvest, 'Fri').some(b => b.at === 1020 && /^Cafés/.test(b.what)), '"from 17:00 …" is read');
const nx = E.nextUp({ Month: 1, Week: 3, Day: 'Sat', Time: '22:00' }, [star], null);
ok(!nx || nx.at !== '24:00', 'the bracelet\'s Next never says 24:00 (midnight is the event line\'s)');

console.log('Happenings of an event');
ok(E.happeningFits({ ev: ['star_night'] }, { Month: 1, Week: 3, Day: 'Sat' }) && !E.happeningFits({ ev: ['star_night'] }, { Month: 1, Week: 3, Day: 'Fri' }), 'a happening with ev only on that event\'s days');

// a state on a given day and time at a place; points to spend; one bonded character
function at(W, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 1, Week: 3, Day: 'Sat', Time: '20:00', Location: 'Grassy Field and Hills', ...W });
  S.Player.Wallet.Points = 100; S.Player.Profile.Dorm = 'Viridian';
  S.$eng.abs = E.toAbs(S.World);
  Object.assign(S, extra);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = [], text = '') => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], { text });
const xp = (S, k) => Number(((S.$eng.prof || {}).xp || {})[k] || 0);

console.log('Chances: Star Night');
let B = at({});
let A = go(B, { Time: '21:00' });
ok(xp(A, 'Arcana') - xp(B, 'Arcana') === 2 && A.$eng.chance['Y1:star_night:evening'] === 1, 'an hour on the hills on Star Night: Arcana +2 once (was the 1.26.0 event XP)');
const A2 = go(A, { Time: '22:00' });
ok(xp(A2, 'Arcana') === xp(A, 'Arcana'), 'and only once a year');
const L = at({}); L.$eng.prof.days['event:1:Star Night'] = true;
ok(xp(go(L, { Time: '21:00' }), 'Arcana') === xp(L, 'Arcana'), 'a save whose 1.26.0 event XP was paid is not paid again');
const ev = A.$ui.ev.find(e => e.id === 'star_night');
ok(ev && ev.n === 1 && ev.of === 2 && /^Night market/.test(ev.now) && ev.next && ev.next[0] === 'midnight' && /meteor/.test(ev.next[1]), 'the event line: day 1 of 2, now the market, next midnight\'s shower');
ok(ev.stall === true, 'a Star Night stall is open here');
let M = at({ Time: '23:20' }, { Bonds: { Kanae: { Rank: 3, Trust: 50, Tension: 0, Known_facts: [], Milestones: [] } }, Scene: { ...initState().Scene, Present: { Kanae: { Note: 'on a blanket' } } } });
ok((M.$ui.ev[0].ch || []).length === 0 || M.$ui.ev[0].ch.every(t => !/meteor/.test(t)), 'the meteor chance is not open yet at 23:20');
const M2 = go(M, { Time: '23:40' });
ok(M2.$eng.chance['Y1:star_night:meteor'] === 1 && (M2.Bonds.Kanae.$Recent || []).some(r => /meteor shower/.test(r.n)), 'on the hills when the shower starts: done, and a Rank 3 bond present remembers it');
const M0 = at({ Time: '23:00', Location: 'Canteen' });
const M3 = go(go(M0, { Time: '23:10', Location: 'Grassy Field and Hills' }), { Day: 'Sun', Time: '00:10' });
ok(M3.$eng.chance['Y1:star_night:meteor'] === 1, 'a reply that runs past midnight on the hills counts too (the window crosses into Sunday)');
console.log('Time spent across replies (min)');
const W0 = at({ Time: '19:50', Location: 'Canteen' }), W1 = go(W0, { Time: '20:05', Location: 'Grassy Field and Hills' });
ok(!W1.$eng.chance['Y1:star_night:evening'] && W1.$ui.ev[0].ch.some(t => /Spend the evening/.test(t)), 'just arrived: not done yet, and open here and now');
const W2 = go(W1, { Time: '20:35' }), W3 = go(W2, { Time: '20:55' });
ok(!W2.$eng.chance['Y1:star_night:evening'] && W3.$eng.chance['Y1:star_night:evening'] === 1, 'done once 45 minutes have passed there over several replies');
const off = at({}); off.$ui.off = [...(off.$ui.off || []), 'event_chances'];
const offA = go(Schema.parse(off), { Time: '21:00' });
ok(!offA.$eng.chance['Y1:star_night:evening'] && !(offA.$ui.ev[0].ch || []).length, 'Event chances off: nothing done, nothing printed');

console.log('Chances: Club Festival stand, by the club\'s Field');
const CF = at({ Month: 3, Week: 2, Day: 'Fri', Time: '14:00', Location: 'Main Courtyard' }); CF.Player.Profile.Club = 'Potions Club';
const CF0 = Schema.parse(CF), CF1 = go(CF0, { Time: '15:00' }, [], 'I spend the hour behind our stand, handing out samples.');
const gained = ['Knowledge', 'Arcana', 'Craft', 'Prowess', 'Society', 'Nature'].filter(k => xp(CF1, k) > xp(CF0, k));
ok(CF1.$eng.chance['Y1:club_festival:stand'] === 1 && gained.length === 1, 'helping at the stand pays 2 in one Field: ' + gained.join(','));
ok(!go(CF0, { Time: '15:00' }, [], 'I wander the courtyard.').$eng.chance['Y1:club_festival:stand'], 'without the stand in the reply it is not done');

console.log('Event stalls');
const P1 = go(A, { Time: '21:10' }, [{ op: 'insert', path: '/Purchases/-', value: { Item: 'Hot spiced cider', Qty: 1 } }]);
ok(A.Player.Wallet.Points - P1.Player.Wallet.Points === 6 && Object.keys(P1.Inventory || {}).some(k => /hot spiced cider/i.test(k)), 'bought at the market on Saturday night: 6 points, in the Bag');
const SunB = at({ Day: 'Sun', Time: '20:30' });
const P2 = go(SunB, { Time: '20:40' }, [{ op: 'insert', path: '/Purchases/-', value: { Item: 'Hot spiced cider', Qty: 1 } }]);
ok(P2.Player.Wallet.Points === SunB.Player.Wallet.Points && !(SunB.$ui.ev[0] || {}).stall, 'on Sunday the market is closed: not sold, no stall');

console.log('<now> and the Price Guide');
const now = render(505, A);
ok(/Event: Star Night, day 1 of 2\. Now: Night market[^\n]*Next: midnight The great meteor shower/.test(now), 'the event line in <now>');
ok(!/^Today: Star Night/m.test(now), 'Star Night is not printed twice on the Today line');
const nowM = render(505, W1);
ok(/Open at this event, the player's choice \(never steer the scene toward it\): Spend the evening on the Grassy Field and Hills/.test(nowM), 'an open chance is printed as the player\'s choice');
const pg = render(506, A);
ok(/Event stalls here \(Star Night market, Sat 20:00–24:00\):\n- Hot spiced cider: 6 pts/.test(pg), 'the Price Guide lists the stalls where {{user}} is');
const pgFar = render(506, go(A, { Location: 'Canteen', Time: '21:20' }));
ok(/Event stalls today: Star Night market at Grassy Field and Hills, Sat 20:00–24:00\./.test(pgFar) && !/Hot spiced cider/.test(pgFar), 'elsewhere one line says where they are');
ok(!/Star Night market/.test(render(506, at({ Month: 1, Week: 2 }))), 'not on another day');
