// 1.97.4 (owner-approved planning/DRAFT_world_competition.md §1b, §3, the champions' prize, 2026-10-22): the World Competition run
// by the engine (stepWorld), as the Kingdom Competition is. The World panel picks the four for how they fight together (kcPanel); the
// opening banquet draws two Phase 1 groups; Phase 1 Last Team Standing, Phase 2 the Siege, the Grand Final; Placement and Status are
// the engine's; the replica, the 10,000-point prize on landing home, Academy and Student up one level; Halvard hears the news on the
// Announcement Pillars and watches the final in Arbiter Hall; the match grounds open only on Eldrasil's days; the 1.97.5 hooks.
const fs = require('fs'), path = require('path');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { kcInit, kcAdvance, wcInit, wcAdvance, kcName, toAbs, fromAbs, WC, CT };')();
const WC = E.WC, ROLES = ['Attack', 'Defense', 'Healing', 'Support', 'Control'];
const op = (p, value) => ({ op: 'replace', path: p, value }), ins = (p, value) => ({ op: 'insert', path: p, value });
const T = (d, time) => E.fromAbs(d * 1440 + (+time.slice(0, 2)) * 60 + (+time.slice(3)));
const OUT = 10 * 28 + 14, HOME = OUT + 7;   // M11 W3 Mon, M11 W4 Mon
const at = (S, d, time, loc, ops = []) => applyPatch(S, [...['Year', 'Month', 'Week', 'Day', 'Time'].map(k => op('/World/' + k, T(d, time)[k])), op('/World/Location', loc), ...ops]);
const res = lines => lines.map(l => ins('/Competition/Results/-', l));
const INN = 'Hanakaze — The Thousand Lantern Inn';
function four(seed = 4242) {
  const S = initState();
  Object.assign(S.World, { ...T(OUT - 1, '18:00'), Location: 'Main Library' });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Combat_role: 'Control', Year: 1, Name: 'Aria Vale' });
  Object.assign(S.Competition, { Tier: 'World', Status: 'selected', Team: [] });
  S.Player.Wallet.Points = 100; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = seed;
  return applyPatch(Schema.parse(S), []);
}
const full = (seed, on = false) => { const st = E.wcInit(seed, 1, null, on); E.wcAdvance(st, seed, 8 * 1440, [], { Results: [] }); return st; };
const seeds = [1, 7, 42, 1234, 98765, 31337, 5, 777, 2024, 9];

console.log('Data');
ok(WC.teams.length === 6 && WC.teams[0] === 'Eldrasil' && Object.keys(WC.rivals).length === 5 && Object.values(WC.rivals).every(t => t.length === 4), 'six nations; five foreign fours from the team entries');
ok(WC.rivals.Norvaine.some(x => x[0] === 'Vesna') && WC.rivals.Yozakura.some(x => x[0] === 'Hibiki') && WC.magic.Lucius === 'Occult', 'standouts by id; magic types read from the lore (Lucius: Occult)');
ok(WC.panel.counter[0][0] === 'Lucius' && WC.prize === 10000 && WC.replica === 'World Trophy replica', 'Lucius\'s swarm is the panel\'s counter; the prize and the replica');

console.log('The World panel');
let picked = 0, cut = 0;
for (const s of seeds) {
  const K = E.kcInit(s, 1, null, false); E.kcAdvance(K, s, 7 * 1440, [], { Results: [] });
  ok(K.wm.length === 4 && new Set(K.wm.map(e => e.role)).size === 4 && K.w.map(w => w[0]).join() === K.wm.map(E.kcName).join(), `seed ${s}: one per role (${K.w.map(w => w[0] + ' ' + w[2]).join(', ')})`);
  if (K.wm.some(e => e.id === 'Lucius')) picked++;
  if (K.wn.some(l => /^Lucius .* left out: his swarm eats/.test(l))) cut++;
}
ok(cut > 0, `Lucius, the strongest on paper, is left out when his swarm would eat the four (left out ${cut}, picked ${picked} of ${seeds.length})`);

console.log('The draw and the whole competition from the seed');
for (const s of seeds) {
  const st = full(s);
  const G = st.gx, ranks = G.map(g => [g.top, g.sec, g.out]).flat();
  ok(st.g.flat().sort().join() === [...WC.teams].sort().join() && new Set(ranks).size === 6, `seed ${s}: two groups of three, each ranked`);
  ok(st.sg[0].a === G[0].top && st.sg[0].b === G[1].sec && st.sg[1].a === G[1].top && st.sg[1].b === G[0].sec, 'the Siege crosses the groups: a top seed against the other group\'s second');
  ok(st.sg.every(m => Math.max(...[m.a, m.b].map(k => m.rd.filter(x => x === k).length)) === 4 && m.rd.length <= 7) && st.fin.join() === st.sg.map(m => m.w).join() && st.fin.includes(st.win), `first to four rounds; the final ${st.fin.join(' v ')}: ${st.win}`);
}
const st1 = full(42), st2 = full(42);
ok(JSON.stringify(st1) === JSON.stringify(st2), 'replay-safe: the same seed, the same competition');

console.log('With {{user}} in the four');
let S = at(four(), OUT, '12:00', 'Airship — Common Room');
const W0 = S.$eng.wc;
ok(W0 && W0.on === 1 && W0.T[0].k === 'Eldrasil' && W0.T[0].m.some(e => e.user) && W0.T[0].m.length === 4, 'Monday: the competition starts in $eng.wc with {{user}} in Eldrasil\'s four');
ok(S.$ui.wc && S.$ui.wc.g.length === 0, 'the groups are not known before the banquet');
S = at(S, OUT, '19:30', 'Hanakaze — The Hall of Victors');
ok(S.$ui.wc.g.length === 2 && S.$ui.contest.lines.some(l => /the draw at the Hall of Victors: Phase 1 Tue/.test(l)), 'the opening banquet draws the groups');
const gE = S.$eng.wc.g.findIndex(g => g.includes('Eldrasil')), P1D = OUT + 1 + gE, P1O = OUT + 2 - gE;
const ground = (St, d, time, name) => at(St, d, time, 'Hanakaze — ' + name).World.Location === 'Hanakaze — ' + name;
S = at(S, OUT, '21:00', INN);
ok(ground(at(S, P1D, '07:30', INN), P1D, '08:30', 'The Bamboo Sea') && !ground(at(S, P1O, '07:30', INN), P1O, '08:30', 'The Bamboo Sea'), `the Bamboo Sea opens on Eldrasil's Phase 1 day only (${T(P1D, '08:00').Day})`);
if (gE === 1) S = at(S, OUT + 1, '20:00', INN);
ok(gE === 0 || (S.$eng.wc.gx[0] && S.$ui.contest.lines.some(l => /Phase 1 \(Tue\): \w+ was the last team standing/.test(l))), 'the other group\'s result reaches the four at once');
S = at(S, P1D, '08:00', 'Hanakaze — The Bamboo Sea');
ok(S.$ui.contest.lines.some(l => /^World Competition, Phase 1 \((Tue|Wed)\): Last Team Standing in the Bamboo Sea/.test(l)) && S.$ui.contest.lines.some(l => /"World P1: broke <name>'s crystal"/.test(l)), '<now>: Phase 1 and its report forms');
const sw1 = at(S, P1D, '09:30', 'Hanakaze — The Bamboo Sea'), sw2 = at(S, P1D, '09:30', 'Hanakaze — The Bamboo Sea');
ok(JSON.stringify(sw1.$eng.wc) === JSON.stringify(sw2.$eng.wc), 'the same reply swiped: the same match');
const foes = S.$eng.wc.T.filter(t => S.$eng.wc.g[gE].includes(t.k) && t.k !== 'Eldrasil').flatMap(t => t.m.map(E.kcName));
S = at(S, P1D, '09:30', 'Hanakaze — The Bamboo Sea', res(foes.map(n => `World P1: broke ${n}'s crystal`)));
const gx = S.$eng.wc.gx[gE];
ok(gx && gx.top === 'Eldrasil' && S.$eng.wc.cr['{{user}}'] >= 1, `the story broke every other crystal: Eldrasil tops the group (${gx && [gx.top, gx.sec, gx.out].join(', ')})`);
ok(S.Competition.Status === 'selected' && !S.Competition.Placement, 'still in: no Placement yet');
const mi = gE, SGD = OUT + 3 + mi, SGO = OUT + 4 - mi;
S = at(S, OUT + 2, '21:00', INN);
ok(S.$eng.wc.p === 2 && S.$eng.wc.sg[mi].a === 'Eldrasil', 'Phase 2: Eldrasil is a top seed');
ok(ground(at(S, SGD, '07:30', INN), SGD, '08:30', 'Old Castle Shiroyama') && !ground(at(S, SGO, '07:30', INN), SGO, '08:30', 'Old Castle Shiroyama'), `Old Castle Shiroyama opens on Eldrasil's Siege day only (${T(SGD, '08:00').Day})`);
if (mi === 1) S = at(S, OUT + 3, '20:00', INN);
S = at(S, SGD, '09:30', 'Hanakaze — Old Castle Shiroyama');
ok(S.$ui.contest.lines.some(l => /^World Competition, Phase 2 \((Thu|Fri)\): the Siege at Old Castle Shiroyama, Eldrasil \(top seed\) against \w+/.test(l)) && S.$ui.contest.lines.some(l => /Breach Rune/.test(l)), '<now>: the Siege, Eldrasil\'s side, the round rules');
for (const [n, t] of [[1, '10:10'], [2, '10:40'], [3, '11:10'], [4, '11:40']]) S = at(S, SGD, t, 'Hanakaze — Old Castle Shiroyama', res([`World P2: won round ${n}`]));
ok(S.$eng.wc.sg[mi].w === 'Eldrasil' && S.$eng.wc.sg[mi].rd.join() === 'Eldrasil,Eldrasil,Eldrasil,Eldrasil', 'four rounds won: Eldrasil goes to the Grand Final');
const skip = at(S, SGD, '12:30', 'Hanakaze — Old Castle Shiroyama', res(['World P2: won round 7']));
ok(skip._Log.some(l => /World P2: won round 7/.test(l)) && skip.$eng.wc.sg[mi].rd.length === 4, 'a report about a match already decided is not used');
S = at(S, OUT + 5, '20:00', INN);
ok(S.$eng.wc.p === 3 && S.$eng.wc.fin.includes('Eldrasil'), 'the final: ' + S.$eng.wc.fin.join(' v '));
S = at(S, OUT + 6, '12:00', 'Hanakaze — The Crowning Ring');
ok(S.$ui.contest.lines.some(l => /^World Competition, the Grand Final: 14:00 at the Crowning Ring, Eldrasil against \w+/.test(l)), '<now>: the Grand Final');
const ac0 = S.Player.Profile.Reputation._Academy, st0 = S.Player.Profile.Reputation._Student;
S = at(S, OUT + 6, '15:30', 'Hanakaze — The Crowning Ring', res(['World P3: won']));
ok(S.Competition.Status === 'champion' && S.Competition.Placement === '1st of 6' && S.Competition.Tier === 'World', 'won the final: champion, 1st of 6');
ok(S.Player.Profile.Reputation._Academy === Math.min(5, ac0 + 1) && S.Player.Profile.Reputation._Student === Math.min(5, st0 + 1), `Academy and Student rose one level (${ac0}→${S.Player.Profile.Reputation._Academy}, ${st0}→${S.Player.Profile.Reputation._Student})`);
ok(Object.keys(S.Inventory).some(k => /World Trophy replica/.test(k)) && (S.Journal || []).length >= 0, 'the replica is in the Bag');
ok(!(S.Player.Wallet.Transactions || []).some(t => /World Competition prize/.test(t)), 'no prize abroad: points are no use there');
const H = at(at(S, HOME, '08:00', INN), HOME, '19:00', 'Main Courtyard');
ok((H.Player.Wallet.Transactions || []).filter(t => /World Competition prize/.test(t)).length === 1 && H.Player.Wallet.Points >= 10100, 'home: the 10,000-point prize, once');
const H2 = at(H, HOME, '20:00', 'Main Courtyard');
ok(H2.Player.Wallet.Points === H.Player.Wallet.Points, 'paid once only');

console.log('Off-screen');
let O = at(four(), OUT, '19:30', 'Hanakaze — The Hall of Victors');
for (let d = OUT + 1; d <= OUT + 4; d++) for (const t of ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '21:00']) O = at(O, d, t, INN);
const x = O.$eng.wc.xo.Eldrasil;
ok(O.Competition.Status === (x ? 'eliminated' : 'selected') && (!x || O.Competition.Placement === { 1: 'joint 5th of 6', 2: 'joint 3rd of 6' }[x]) && O.Competition.Results.some(l => /^World P[12]: .*\(off-screen\)$/.test(l)), `nothing reported: the engine plays {{user}}'s part (${O.Competition.Placement || 'still in'})`);

console.log('Halvard (not in the four)');
const camp = (d, time) => { const C = initState(); Object.assign(C.World, { ...T(d, time), Location: 'Canteen' }); C.$eng.abs = E.toAbs(C.World); C.$eng.seed = 4242; return applyPatch(Schema.parse(C), []); };
const c0 = camp(OUT, '10:00'), c1 = camp(OUT + 1, '21:00'), c6 = camp(OUT + 6, '16:00'), c7 = camp(HOME, '09:00');
ok(!c0.$eng.wc && c0.$ui.wc.news.length === 0 && c0.$ui.contest.lines.some(l => /^World Competition in Hanakaze, Yozakura \(Eldrasil's four: .+\): today the four fly out/.test(l)), 'Monday at Halvard: the four fly out; no news yet; nothing stored');
ok(camp(OUT + 1, '15:00').$ui.wc.news.length === 1 && c1.$ui.wc.news.length === 2 && /Announcement Pillars at 20:00/.test(c1.$ui.contest.lines.join(' ')), 'the day\'s result reaches Halvard with the evening announcement');
ok(c6.$ui.wc.win && /great scrying crystal in Arbiter Hall/.test(c6.$ui.contest.lines.join(' ')), 'the Grand Final, live in Arbiter Hall: ' + c6.$ui.wc.win);
ok(c7.$ui.wc.teams.some(t => t[2] === 'champions') && c7.$ui.wc.mine === 0, 'Monday: the champions on the Competition tab');

console.log('The 1.97.5 hooks');
WC.hook.same = ['Norvaine']; WC.hook.path = ['Norvaine'];
for (const s of seeds) {
  const st = full(s), gn = st.g.findIndex(g => g.includes('Norvaine'));
  ok(st.g[gn].includes('Eldrasil') && st.gx[gn].top === 'Norvaine' && st.sg.find(m => m.a === 'Norvaine').w === 'Norvaine', `seed ${s}: Norvaine is drawn with Eldrasil, tops the group and wins its Siege`);
}
WC.hook.same = []; WC.hook.path = [];
ok(JSON.stringify(full(42)) === JSON.stringify(st1), 'empty hooks: the draw as before');

console.log('UI');
global.window = { parent: { document: {} } };
const UI = new Function(read('src/scripts/ui.js') + '\nreturn { acCompetition };')();
const tab = UI.acCompetition(c6);
ok(/World Competition: Hanakaze, Yozakura/.test(tab) && /News on the Announcement Pillars/.test(tab) && /group 1/.test(tab), 'the Competition tab: the six nations, their groups and the news');
