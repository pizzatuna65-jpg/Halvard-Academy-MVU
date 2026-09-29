// Stress test (bug hunt 1.3.3): a diligent player for a whole school year (and into the next): every day talks and hangs out
// with a circle of friends, plays each bond event when it is ready, trains, earns and loses reputation, visits places, uses
// pact abilities. Checks what accumulates (state size, caps, rewards given once) and whether the pacing holds.
// Usage: node tests/stress/sim_year.cjs [days=380] [pace=standard]
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ROOT } = require('../harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { TEMPLATES, blankDraft, buildOps, renderProfile, PANELS, view };')();
const DAYS_N = +process.argv[2] || 380, PACE = process.argv[3] || 'standard';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FRIENDS = process.env.FRIENDS ? process.env.FRIENDS.split(',') : ['Etnie', 'Saffi', 'Gareth', 'Irene', 'Baelin', 'Kuroo', 'Ruby', 'Milena', 'Krieg', 'Castor'];
const PLACES = ['Canteen', 'Main Library', 'Boathouse', 'Courtyards', 'Fishing House', 'Combat Grounds', 'Gymnasium', 'The Mall — Nightwell'];
let S = initState();
const d = Object.assign(U.blankDraft(), U.TEMPLATES.find(t => t.id === 'spirit').make()); d.name = 'Aria Vale';
S = applyPatch(S, [...U.buildOps(d, S), { op: 'replace', path: '/$ui/bondpace', value: PACE }], { mvu: true });
S = applyPatch(S, [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Viridian' }, { op: 'replace', path: '/Player/Profile/Dorm_rank', value: 12 }]);
const t0 = Date.now(); let updates = 0, maxSize = 0, maxAt = '', firstMax = {};
const rankAt = {};
const at = (w, ops) => { S = applyPatch(S, [...Object.entries(w).map(([k, v]) => ({ op: 'replace', path: '/World/' + k, value: v })), ...ops]); updates++; };
for (let day = 0; day < DAYS_N; day++) {
  const doy = day % 336, W = { Year: 1 + Math.floor(day / 336), Month: Math.floor(doy / 28) + 1, Week: Math.floor((doy % 28) / 7) + 1, Day: DAYS[doy % 7] };
  const home = /home|holiday/i.test(S.World._Event_today) && W.Month >= 5;
  // morning: training
  at({ ...W, Time: '07:30', Location: 'Combat Grounds' }, [{ op: 'replace', path: '/Scene/Present', value: { Saffi: { Note: '' } } }, { op: 'insert', path: '/Training/-', value: { Track: day % 2 ? 'mana' : 'stamina' } }]);
  // afternoon: friends, a place, a pact ability
  const who = FRIENDS.filter((_, i) => (day + i) % 3 === 0).slice(0, 4), present = Object.fromEntries(who.map(w => [w, { Note: '' }]));
  const ops = [{ op: 'replace', path: '/Scene/Present', value: present }, ...who.flatMap(w => [{ op: 'insert', path: '/Interactions/-', value: { With: w, Kind: 'talk' } }, { op: 'insert', path: '/Interactions/-', value: { With: w, Kind: 'hangout' } }])];
  if (day % 7 === 3) ops.push(...who.map(w => ({ op: 'insert', path: '/Interactions/-', value: { With: w, Kind: 'gift', Gift: 'loved' } })));
  if (day % 5 === 0) ops.push({ op: 'insert', path: '/Rep_events/-', value: { Rep: ['Academy', 'Student', 'Doves'][day % 3], XP: 2, Kind: 'repeat', Why: 'helped out' } });
  if (day % 40 === 7) ops.push({ op: 'insert', path: '/Rep_events/-', value: { Rep: 'Student', XP: -6, Kind: 'event', Why: 'a scene in the canteen' } });
  ops.push({ op: 'insert', path: '/Magic/Active/Ember', value: { Technique: 'Summon Ember', Note: '' } }, { op: 'replace', path: '/Magic/Pacts/Ember/Summoned', value: true }, { op: 'insert', path: '/Magic/Casts/-', value: { Technique: 'Ember: Scent of Danger', Times: 1 } });
  at({ ...W, Time: '16:30', Location: PLACES[day % PLACES.length] }, ops);
  // bond events that are ready and whose NPC is here
  const ready = who.filter(w => S.Bonds[w] && S.Bonds[w]._Event_ready);
  at({ ...W, Time: '17:30' }, [{ op: 'remove', path: '/Magic/Active/Ember' }, { op: 'replace', path: '/Magic/Pacts/Ember/Summoned', value: false }, ...ready.map(w => ({ op: 'replace', path: `/Bonds/${w}/Rank`, value: S.Bonds[w].Rank + 1 }))]);
  for (const w of ready) if (S.Bonds[w] && S.Bonds[w].Rank === 10 && !rankAt[w]) rankAt[w] = `M${W.Month} W${W.Week} (day ${day})`;
  // evening: journal line, sleep
  at({ ...W, Time: '22:00', Location: 'Viridian Dormitory' }, [{ op: 'replace', path: '/Scene/Present', value: {} }, { op: 'insert', path: '/Journal/-', value: `[M${W.Month} W${W.Week} ${W.Day}] day ${day}` }, { op: 'replace', path: '/Player/Vitals/Resting', value: 'sleep' }]);
  if (process.env.TRACE && day < +process.env.TRACE) console.log(day, W.Month, W.Week, W.Day, JSON.stringify(S.Player.$Training), S.Player.Vitals.Mana_max, S.Player.Vitals.Stamina_max);
  const size = JSON.stringify(S).length; if (size > maxSize) { maxSize = size; maxAt = `day ${day}`; }
  if (home) continue;
}
const ms = (Date.now() - t0) / updates;
const size = JSON.stringify(S).length, bySec = Object.fromEntries(Object.entries(S).map(([k, v]) => [k, JSON.stringify(v).length]).sort((a, b) => b[1] - a[1]).slice(0, 8));
const ui = S.$ui, eng = S.$eng;
console.log(`${DAYS_N} days, ${updates} updates, ${ms.toFixed(1)} ms/update, pace ${PACE}`);
console.log('state size', size, 'bytes (max', maxSize, 'at', maxAt + '); biggest parts', bySec);
console.log('$ui parts', Object.fromEntries(Object.entries(ui).map(([k, v]) => [k, JSON.stringify(v || '').length]).sort((a, b) => b[1] - a[1]).slice(0, 8)));
console.log('$eng parts', Object.fromEntries(Object.entries(eng).map(([k, v]) => [k, JSON.stringify(v || '').length]).sort((a, b) => b[1] - a[1]).slice(0, 6)));
console.log('ranks', Object.fromEntries(Object.entries(S.Bonds).map(([k, b]) => [k, b.Rank])), 'rank 10 reached', rankAt);
console.log('perks', Object.keys(S._Perks), 'used', ui.perks_used);
console.log('reputation', S.Player.Profile.Reputation, 'training', S.Player.$Training, 'vitals', S.Player.Vitals.Mana_max, S.Player.Vitals.Stamina_max);
console.log('wallet', S.Player.Wallet.Points, process.env.TX ? S.Player.Wallet.Transactions : S.Player.Wallet.Transactions.slice(-4));
console.log('journal', S.Journal.length, 'archive', (ui.archive || []).length, 'log', S._Log.slice(-4));
const gifts = S.Player.Wallet.Transactions.filter(t => /monthly/.test(t)).length;
U.view.tab = 'overview'; const h = U.renderProfile(S); console.log('profile renders', h.length, 'chars');
