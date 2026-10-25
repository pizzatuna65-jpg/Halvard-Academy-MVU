// 2.4.1 (roadmap M4, stages 2 + 3 of 2.4.x): what happened in Own time reaches {{user}}: an NPC initiative reason from it (OWN ask,
// ask_pct a day, never strained, never twice in 20) and the hurt ones in the Healing Ward (OWN hurt: whereabouts, Look for, Who is
// here and Campus now put them at the Medical Centre).
const fs = require('fs'), path = require('path'), _ = require('lodash');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const E = new Function(rd('src/scripts/engine.js') + '\nreturn { PRESENCE, NPC_GROUP, OWN, presenceView, whereabouts, lookFor, presenceAt, campusFeed, uiOn, ownAsk };')();
const O = JSON.parse(rd('data/offscreen.json')), P = E.PRESENCE;
const W = o => Object.entries(o).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v }));
const put = (p, v) => ({ op: 'replace', path: p, value: v });
const D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const at = n => ({ Month: 1 + Math.floor(n / 28), Week: 1 + Math.floor((n % 28) / 7), Day: D[n % 7] });
const IDS = (P.roster || []).filter(id => E.NPC_GROUP[id] && E.NPC_GROUP[id] !== 'rival' && !(P.arr || {})[id]);
function base(opts = {}) {
  let S = _.cloneDeep(applyPatch(initState({ etnie: true }), [...W({ ...at(8), Time: '20:00', Location: 'Fire Dormitory' }), put('/Player/Profile/Dorm', 'Fire')]));
  for (const id of IDS) S.Bonds[id] = { ...(S.Bonds[id] || S.Bonds.Etnie), Rank: 4, $Recent: [], Trust: 50, Tension: opts.tension || 0 };
  if (opts.off) S.$ui.off = [...(S.$ui.off || []), 'offscreen'];
  return applyPatch(S, W({ Time: '20:10' }));
}
const V = S => E.presenceView(P, S, id => E.uiOn(S.$ui, id));

console.log('the Healing Ward');
let S = base(), hurts = [], asks = [], inits = 0;
const askRx = O.items.filter(i => i.ask).map(i => [i.id, new RegExp('^' + i.ask.replace(/[()]/g, '\\$&').replace(/\{\{user\}\}/g, '{{user}}').replace(/\{(?!\{)\w+\}/g, '.+') + '$')]);
let checked = 0, wardOk = true, elseOk = true, feedOk = true, lookOk = true, classOk = true;
for (let n = 9; n < 121; n++) {
  S = applyPatch(S, W({ ...at(n), Time: '10:00', Location: 'Fire Dormitory' }));
  const H = S.$eng.own.hurt || {};
  for (const id of Object.keys(H)) if (H[id][0] === Math.floor(n + 0) && !hurts.some(h => h[0] === id && h[1] === n)) hurts.push([id, n, H[id][2]]);
  const v = V(S), now = Object.keys(v.hurt);
  for (const id of now) {
    checked++;
    const w = E.whereabouts(P, v, id);
    if (!(w.rt && w.rt[3] === 'medical centre' && !w.busy)) wardOk = false;
    if (v.cls && v.cls[3] === 'class' && w.busy) classOk = false;
    if (E.presenceAt(P, { ...v, hroll: false }, 'Combat Grounds', 2).regs?.includes?.(id)) elseOk = false;
    const f = E.campusFeed(P, v, S).find(x => x.id === id);
    if (!f || !/^in the Healing Ward/.test(f.what) || f.where !== 'Medical Centre') feedOk = false;
    const lk = E.lookFor(P, v, id, 'medical centre', 2), lk2 = E.lookFor(P, v, id, 'main library', 2);
    if (lk.how !== 'routine' || !(lk.pct >= 85) || lk2.found) lookOk = false;
  }
  const I = S.$ui.initiative;
  if (I && I.ask) { inits++; const m = askRx.find(([, rx]) => rx.test(I.ask)); if (m) asks.push([I.id, m[0], I.ask]); }
}
ok(hurts.length >= 3 && hurts.length <= 40, `some hurts, rarely (${hurts.length} in 112 days across ${IDS.length} people), e.g. ${hurts[0] && hurts[0][0] + ' ' + hurts[0][2]}`);
ok(hurts.every(h => O.items.some(i => i.hurt && i.ward === h[2])), 'every hurt comes from a hurt item');
ok(checked > 0 && wardOk, `in the Healing Ward all day: a duty row at the Medical Centre, out of class (${checked} person-days)`);
ok(classOk, 'a hurt student is never in class');
ok(feedOk, 'Campus now says "in the Healing Ward ..." at the Medical Centre (for anyone, close or not)');
ok(lookOk, 'Look for finds them at the Medical Centre (85%+), never elsewhere');
{
  const v0 = V(S), id = IDS[0];
  const S2 = _.cloneDeep(S); S2.$eng.own.hurt = { [id]: [0, 99999, 'in the Healing Ward with a sprained ankle'] };
  const v2 = V(S2), pa = E.presenceAt(P, { ...v2, hroll: false }, 'Medical Centre', 2);
  ok(JSON.stringify(pa).includes(id), `Who is here at the Medical Centre lists them (${id})`);
  const S3 = _.cloneDeep(S2); S3.$ui.on = { ...(S3.$ui.on || {}), offscreen: false };

  ok(!Object.keys(V(S3).hurt).length, 'Own time off: V.hurt is empty');
}
console.log('initiative reasons');
ok(asks.length >= 1, `some initiative reasons come from Own time (${asks.length} of ${inits} reasons), e.g. "${asks[0] && asks[0][0] + ' ' + asks[0][2]}"`);
ok(asks.length <= inits * 0.5, 'and most do not (the old reasons and favours stay)');
ok(asks.every(a => !/\{(?!\{)|undefined/.test(a[2].replace(/\{\{user\}\}/g, ''))), 'every Own time reason is filled in');
{
  let T = base({ tension: 75 }), n2 = 0;
  for (let n = 9; n < 60; n++) { T = applyPatch(T, W({ ...at(n), Time: '10:00', Location: 'Fire Dormitory' })); const I = T.$ui.initiative; if (I && I.ask && T.Bonds[I.id].Tension >= 70 && askRx.some(([, rx]) => rx.test(I.ask))) n2++; }
  ok(n2 === 0, 'never while strained (Tension 70+)');
  let Q = base({ off: true }), n3 = 0;
  for (let n = 9; n < 60; n++) { Q = applyPatch(Q, W({ ...at(n), Time: '10:00', Location: 'Fire Dormitory' })); const I = Q.$ui.initiative; if (I && I.ask && askRx.some(([, rx]) => rx.test(I.ask))) n3++; }
  ok(n3 === 0, 'never with Own time off');
}
