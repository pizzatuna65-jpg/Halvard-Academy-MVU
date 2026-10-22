// 1.82.0 (owner-approved planning/DRAFT_event_frame.md section 3, release A2): the Dorm Competition's brackets, computed from the seed
// (shared.js contest section), {{user}}'s bouts in <now> and Competition.Results, Placement and Status by the engine, bouts played
// off-screen, the canon pins, the opponent's edge in Fortune, Training Week's scout, and the Club Festival coin vote.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { dormContest, contestField, contestResults, contestUser, PRESENCE, toAbs, CT_ORD };')();
const PD = E.PRESENCE, card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (id, S) => ejs.render(card.character_book.entries.find(e => e.id === id).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value }), ins = (p, value) => ({ op: 'insert', path: p, value });

console.log('Data');
ok(Object.keys(PD.ct.roles).length === 36 && Object.values(PD.ct.roles).every(r => ['Attack', 'Defense', 'Healing', 'Support', 'Control'].includes(r)), 'the 36 roster students have a role (draft table 3.4; 1.97.5: Vesna, Control, once she has transferred)');

console.log('Brackets from the seed');
const seeds = [1, 7, 42, 1234, 98765, 31337, 5, 777];
const A1 = E.dormContest(PD, 42, 1, 'Fire', 'Attack', null, {}), A2 = E.dormContest(PD, 42, 1, 'Fire', 'Attack', null, {});
ok(JSON.stringify(A1.rounds.map(ms => ms.map(m => m.w && m.w.id))) === JSON.stringify(A2.rounds.map(ms => ms.map(m => m.w && m.w.id))), 'the same seed draws the same bracket');
ok(seeds.every(s => { const n = E.contestField(PD, s, 1, 'Light', 'Defense', null).length; return n >= 10 && n <= 16; }), 'a bracket holds 10 to 16 entrants');
const fa = E.contestField(PD, 42, 1, 'Fire', 'Attack', null), named = fa.filter(e => e.named).map(e => e.id);
ok(named.includes('Gareth') && named.includes('Sophia') && !named.includes('Aurelian') && fa.filter(e => !e.named).length > named.length, 'Fire Attack in Year 1: Gareth, Sophia and the others there, Aurelian not yet; most entrants unnamed: ' + named.join(','));
ok(E.contestField(PD, 42, 3, 'Fire', 'Attack', null).some(e => e.id === 'Aurelian') && !E.contestField(PD, 42, 2, 'Fire', 'Attack', null).some(e => e.id === 'Gareth'), 'Aurelian enters in Year 3; Gareth has graduated by Year 2');
ok(seeds.every(s => { const K = E.dormContest(PD, s, 1, 'Fire', 'Attack', null, {}), r1 = K.rounds[0].filter(m => m.a && m.b && m.a.named && m.b.named); return r1.length === 0; }), 'roster students are seeded apart: never two of them in a first-round bout');

console.log('Canon pins');
ok(seeds.every(s => { const K = E.dormContest(PD, s, 1, 'Sky', 'Healing', null, {}), ruby = K.E.find(e => e.id === 'Ruby'); return !K.up.includes(ruby); }), 'Ruby never gets out of her heat (she loses early on purpose)');
ok(seeds.every(s => { const K = E.dormContest(PD, s, 1, 'Sky', 'Control', null, {}); return K.place(K.E.find(e => e.id === 'Royhan')) === 3; }), 'Year 1: Royhan qualifies in the last Control place of his dorm, every seed (lore 101)');
ok(seeds.every(s => { const K = E.dormContest(PD, s, 1, 'Light', 'Control', null, {}), d = K.E.find(e => e.id === 'Dante'); return K.place(d) >= 5 && K.place(d) <= 8; }), 'Dante goes out in round 2: a middling place');
const gw = seeds.filter(s => { const K = E.dormContest(PD, s, 1, 'Fire', 'Attack', null, {}); return K.place(K.E.find(e => e.id === 'Gareth')) <= 2; }).length;
ok(gw >= 5, `Gareth usually reaches the final (${gw} of ${seeds.length} seeds)`);

// a Fire student on Dorm Competition day
function comp(role, W = {}, extra = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 3, Week: 4, Day: 'Sat', Time: '09:00', Location: 'Combat Grounds', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Combat_role: role, Year: 1, Name: 'Aria Vale' });
  S.Player.Wallet.Points = 100; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = 4242;
  Object.assign(S, extra);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = [], text = '') => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], { text });
const res = (B, line) => [ins('/Competition/Results/-', line)];

console.log('{{user}}\'s bouts (Attack, knockout)');
let S = comp('Attack');
ok(S.Competition.Tier === 'Dorm' && S.Competition.Status === 'entered' && S.Competition.Placement === '', 'everyone is entered: Tier Dorm, Status entered');
const L0 = (S.$ui.contest || {}).lines || [];
ok(/^Contest: Dorm Competition, Attack bracket \(\d+ entrants\), round 1 of 4\. \{\{user\}\}'s next bout: Sat 09:30, against /.test(L0[0] || ''), '<now> names the next bout: ' + (L0[0] || '').slice(0, 140));
ok(L0.some(l => /Report the bout in Competition\.Results as "R1: beat <name>" or "R1: lost to <name>"/.test(l)), 'and how to report it');
const now = render(505, S);
ok(/Event: Dorm Competition, day 1 of 2\.[^\n]*\nContest: Dorm Competition, Attack bracket/.test(now), 'the contest lines sit under the Event line in <now>');
S = go(S, { Time: '10:30' }, res(S, 'R1: beat Marta Holl'));
ok(S.Competition.Results.includes('Dorm R1: beat Marta Holl') && /round 2 of 4\. \{\{user\}\}'s next bout: Sat 14:00/.test(S.$ui.contest.lines[0]), 'the engine adds the tier, and the next bout is round 2 at 14:00');
const S2 = go(S, { Time: '15:00' }, res(S, 'R2: lost to somebody'));
ok(S2.Competition.Status === 'eliminated' && /^[5-8]th of \d+, Attack bracket$/.test(S2.Competition.Placement), 'out in round 2: the engine sets Status eliminated and the Placement: ' + S2.Competition.Placement);
ok(/finished [5-8]th\./.test(S2.$ui.contest.lines[0]), 'and <now> says how it ended');
const S3 = go(S2, { Day: 'Mon', Time: '08:00', Location: 'Canteen', Week: 4 }, [op('/Competition/Placement', '1st of 14, Attack bracket'), op('/Competition/Status', 'champion')]);
ok(S3.Competition.Placement === S2.Competition.Placement && S3.Competition.Status === 'eliminated', 'afterwards the result is the engine\'s: a rewritten Placement is put back');

console.log('Champion: the prize and the deed');
let C = comp('Attack');
for (const [r, t] of [[1, '10:30'], [2, '15:00'], [3, '11:00'], [4, '16:00']]) C = go(C, r >= 3 ? { Day: 'Sun', Time: t } : { Time: t }, res(C, `R${r}: beat someone`));
ok(C.Competition.Status === 'champion' && /^1st of \d+, Attack bracket$/.test(C.Competition.Placement), 'four wins: champion, 1st');
ok((C.Player.Wallet.Transactions || []).some(t => /Dorm Competition prize \(bracket champion\)/.test(t)) && C.Player.Wallet.Points >= 200, 'the 100-point prize is paid once');

console.log('Off-screen bouts');
let O = comp('Attack');
O = go(O, { Time: '14:05' });
ok((O.Competition.Results || []).some(l => /^Dorm R1: (beat|lost to) .+ \(off-screen\)$/.test(l)), 'round 1 not reported by the time round 2 starts: played off-screen: ' + (O.Competition.Results || []).join(' | '));
const O2 = comp('Attack'), O3 = go(O2, { Time: '14:05' });
ok(JSON.stringify(O3.Competition.Results) === JSON.stringify(O.Competition.Results), 'the same on every swipe');

console.log('Heats (Defense) and paired (Support)');
let H = comp('Defense', { Time: '09:40' });
ok(/heat \d of \d with \d+ others/.test(H.$ui.contest.lines[0]) && H.$ui.contest.lines.some(l => /"R1: advanced" or "R1: out"/.test(l)), 'a heat: who is in it and how to report: ' + H.$ui.contest.lines[0].slice(0, 160));
H = go(H, { Time: '11:00' }, res(H, 'R1: advanced'));
H = go(H, { Day: 'Sun', Time: '15:00' }, res(H, 'R2: placed 2'));
ok(H.Competition.Placement.startsWith('2nd of') && H.Competition.Status === 'qualified' && (H.Player.Wallet.Transactions || []).some(t => /runner-up/.test(t)), 'second in the final: qualified, the runner-up prize');
let P = comp('Support');
ok(/\{\{user\}\} supports .+ \(Attack\); their next bout: Sat 09:30/.test(P.$ui.contest.lines[0]) && P.$ui.contest.lines.some(l => /"R1: partner beat <name>"/.test(l)), 'Support: the partner\'s bout is {{user}}\'s: ' + P.$ui.contest.lines[0].slice(0, 120));
P = go(P, { Time: '10:30' }, res(P, 'R1: partner lost to someone'));
ok(P.Competition.Status === 'eliminated' && /Support bracket$/.test(P.Competition.Placement), 'the partner out in round 1: {{user}} is placed from it');

console.log('Fortune: the opponent\'s edge');
const F = comp('Attack', { Time: '09:00' }), mods = ((F.$ui.fortune || {}).mods || []).filter(m => /^opponent /.test(m)), edge = (/(stronger|even|weaker) than \{\{user\}\}/.exec(F.$ui.contest.lines[0]) || [])[1];
ok(edge === 'even' ? !mods.length : mods.length === 1 && (edge === 'stronger' ? / -10$/ : / \+10$/).test(mods[0]), `the bout's edge (${edge}) is a Fortune modifier only when it is not even: ${mods.join(',')}`);

console.log('Training Week scout');
let T = comp('Attack', { Week: 3, Day: 'Mon', Time: '16:00', Location: 'Combat Grounds' });
T = go(T, { Time: '17:00' });
ok(((T.$eng.scout || {}).ids || []).length === 2 && T.$eng.chance['Y1:training_week:watch'] === 1, 'an evening at the sparring scouts two possible opponents');
const pr = T.$eng.prof.xp.Prowess;
T = go(go(go(T, { Time: '18:00', Location: 'Canteen' }), { Day: 'Tue', Time: '16:00', Location: 'Combat Grounds' }), { Time: '17:00' });
ok(T.$eng.scout.ids.length === 4 && T.$eng.prof.xp.Prowess === pr && T.$eng.chance['Y1:training_week:watch'] === 2, 'a second evening scouts two more, without the Prowess XP again');

console.log('Club Festival coin vote');
const clubOf = 'Board Game Club';
let V = comp('Attack', { Week: 2, Day: 'Sat', Time: '17:00', Location: 'Courtyards' });
V.Player.Profile.Club = clubOf; V = Schema.parse(V);
V = go(V, { Time: '17:50' }, [ins('/Rep_events/-', { Kind: 'club_festival_win', Why: 'we won' })]);
ok(!V.$eng.vote.Y1 && (V._Log || []).some(l => /paid by the engine from the Club Festival coin vote/.test(l)), 'before the close: no vote yet, and a reported club_festival_win is not counted');
V = go(V, { Time: '18:10' });
ok(typeof V.$eng.vote.Y1 === 'string' && (V.Journal || []).some(l => /won the Club Festival coin vote/.test(l)), 'at the close the vote is drawn once: ' + V.$eng.vote.Y1);
ok(/The coin vote went to the /.test(render(505, V)), '<now> names the winner on the day');
const wins = seeds.filter(s => { let X = comp('Attack', { Week: 2, Day: 'Sat', Time: '17:50', Location: 'Courtyards' }); X.Player.Profile.Club = clubOf; X.$eng.seed = s; X = Schema.parse(X); return go(X, { Time: '18:10' }).$eng.vote.Y1 === clubOf; }).length;
ok(wins < seeds.length, `{{user}}'s club does not always win (${wins} of ${seeds.length})`);
