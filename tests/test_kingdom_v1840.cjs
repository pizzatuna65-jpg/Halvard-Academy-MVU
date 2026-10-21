// 1.84.0 (owner-approved planning/DRAFT_kingdom_competition.md): the Kingdom Competition in three rounds (the Kingsmeadow hunt for three
// Kingsblooms, the Undercroft's ten rooms, the final), the other teams played by the engine from the seed, Halvard's part reported by
// the story, the round grounds open only in their round, Placement and Status by the engine, the World panel's pick, and the whole
// competition computed for a {{user}} who is not on the team.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { kcTeams, kcInit, kcAdvance, kcR2Tick, kcUp, PRESENCE, toAbs, KC };')();
const PD = E.PRESENCE, KC = E.KC, card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (id, S) => ejs.render(card.character_book.entries.find(e => e.id === id).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value }), ins = (p, value) => ({ op: 'insert', path: p, value });
const ROLES = ['Attack', 'Defense', 'Healing', 'Support', 'Control'];
const seeds = [1, 7, 42, 1234, 98765, 31337, 5, 777, 2024, 9];

console.log('Teams');
const T = E.kcTeams(PD, 42, 1, null);
ok(T.map(t => t.k).join() === 'Halvard,Ashvale,Myrdath,Veyra' && T.every(t => t.m.length === 4), 'four teams of four');
ok(T.slice(1).every(t => t.m.every(e => e.named)) && T.find(t => t.k === 'Veyra').m.some(e => e.id === 'Bellatrix'), 'Year 1: the rival teams are their lore members');
// 1.87.0 (release C): without {{user}}, Halvard's team is the Academy Competition's computed winners (every school year, lore 19)
const EA = new Function(read('src/scripts/engine.js') + '\nreturn { academyContest };')();
ok(seeds.every(s => { const H = E.kcTeams(PD, s, 1, null)[0].m, W = EA.academyContest(PD, s, 1, null).champ.m;
  return JSON.stringify(H.map(e => e.id)) === JSON.stringify(W.map(e => e.id)) && new Set(H.map(e => e.y)).size === 3; }), "Halvard's team without {{user}}: the Academy Competition's winners, every school year");
const Y3 = E.kcTeams(PD, 42, 3, null).find(t => t.k === 'Ashvale').m;
ok(Y3.some(e => !e.named && /^Ashvale Y1 student$/.test(e.label)) && Y3.some(e => e.id === 'Elion'), 'Year 3: a graduated rival leaves a student the narrator invents in their role');

console.log('The whole competition from the seed');
const full = s => { const st = E.kcInit(s, 1, null, false); E.kcAdvance(st, s, 7 * 1440, [], { Results: [] }); return st; };
const runs = seeds.map(full);
ok(runs.every(st => st.r === 4 && st.x1 && st.x2 && st.x1 !== st.x2 && st.fin.length === 2 && !st.fin.includes(st.x1) && !st.fin.includes(st.x2) && st.fin.includes(st.win)), 'every seed: one team out in each round, two finalists, a winner');
ok(JSON.stringify(full(42)) === JSON.stringify(full(42)), 'the same seed, the same competition');
ok(runs.every(st => st.w.length === 4 && new Set(st.w.map(w => w[2])).size === 4), 'the World panel picks four, one per role');
ok(new Set(runs.map(st => st.win)).size >= 2 && new Set(runs.map(st => st.x1)).size >= 2, 'different seeds, different results: winners ' + runs.map(st => st.win).join(','));
const many = Array.from({ length: 100 }, (_x, i) => full(i + 1)), early = many.filter(st => st.end2 < 1440 + 18 * 60).length;
ok(early >= 30, `round two often ends before 18:00, when two teams hold four rooms at once (${early} of 100 seeds)`);
const wins = _.countBy(many, 'win'), outs = _.countBy(many, 'x1');
ok(['Halvard', 'Ashvale', 'Myrdath', 'Veyra'].every(k => (wins[k] || 0) >= 8 && (outs[k] || 0) >= 10), 'every team can win and can go out first: wins ' + JSON.stringify(wins) + ', out in round one ' + JSON.stringify(outs));
ok(runs.every(st => st.rm.filter(r => r.o === st.fin[0]).length + st.rm.filter(r => r.o === st.fin[1]).length <= 10), 'ten rooms: never more than ten held');

console.log('Round two rules (one tick)');
const mk = () => { const st = E.kcInit(42, 1, null, false); st.r = 2; st.x1 = 'Veyra'; st.t = 1440 + 8 * 60; st.on = 1; st.hp = [['{{user}}', 0]]; st.rm[0].b = 1; return st; };
let st = mk(); st.pos.Ashvale = {}; st.pos.Myrdath = {};
st.T.find(t => t.k === 'Halvard').m[0] = { id: '{{user}}', role: 'Control', y: 1, s: 40, user: true };
E.kcR2Tick(st, 42, st.t + 15, [], { Results: [] });
const alone = st.rm[0].m.Halvard === 15 || st.rm[0].o === 'Halvard' || !!st.enc;
ok(alone, 'Halvard alone in a room whose beast is down: the count runs (15 of 15 minutes), unless another team walked in');
st = mk(); st.T.find(t => t.k === 'Halvard').m[0] = { id: '{{user}}', role: 'Control', y: 1, s: 40, user: true };
st.rm[0].m = { Halvard: 10 }; st.pos.Ashvale = Object.fromEntries(E.kcUp(st, 'Ashvale').map(e => [e.id, 0]));
st.pos.Myrdath = Object.fromEntries(E.kcUp(st, 'Myrdath').map(e => [e.id, 9]));
E.kcR2Tick(st, 42, st.t + 15, [], { Results: [] });
ok(st.rm[0].m.Halvard === 10 && st.rm[0].o !== 'Halvard' && st.enc && st.enc.t === 'Ashvale', 'another team in the room: the count stops at 10 and the meeting is the story\'s');
st = mk(); for (let i = 0; i < 4; i++) { st.rm[i] = { b: 1, o: 'Ashvale', m: {} }; st.rm[i + 4] = { b: 1, o: 'Myrdath', m: {} }; }
E.kcR2Tick(st, 42, st.t + 15, [], { Results: [] });
ok(st.r === 3 && st.fin.join() === 'Ashvale,Myrdath' && st.x2 === 'Halvard', 'two teams hold four rooms at the same time: round two is over, the third goes out');

// {{user}} on Halvard's team in Avalon
function team(W = {}, seed = 4242) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 9, Week: 4, Day: 'Wed', Time: '06:30', Location: 'Avalon — Whitestone Hotel', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Combat_role: 'Control', Year: 1, Name: 'Aria Vale' });
  Object.assign(S.Competition, { Tier: 'Kingdom', Status: 'qualified', Team: ['Gareth', 'Irene', 'Percival'] });
  S.Player.Wallet.Points = 100; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = seed;
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = [], text = '') => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], { text });
const res = line => [ins('/Competition/Results/-', line)];

console.log('Round one with {{user}}');
let S = team();
ok(S.$eng.kc && S.$eng.kc.on === 1 && S.$eng.kc.T[0].m.map(e => e.id).join() === '{{user}},Gareth,Irene,Percival', "the team is {{user}} and Competition.Team");
ok(S.$ui.contest.lines.some(l => /^Kingdom Competition, round one: the Kingsmeadow hunt, 07:00 to sunset at 18:00\./.test(l)), '<now>: round one: ' + S.$ui.contest.lines[0].slice(0, 120));
ok(/Event: Kingdom Competition[^\n]*\nKingdom Competition, round one/.test(render(505, S)), 'the lines sit under the Event line in <now>');
S = go(S, { Time: '07:40', Location: 'Avalon — Long Meadow' });
ok(/^Avalon — Long Meadow/.test(S.World.Location), 'the Kingsmeadow is open on Wednesday: ' + S.World.Location);
S = go(S, { Time: '08:30' }, res('Kingdom R1: found a Kingsbloom'));
ok(S.$eng.kc.f.filter(f => f.h === 'Halvard').length === 1 && S.$ui.kc.bloom === 1, 'the story found a Kingsbloom: the team carries it');
const sw1 = go(S, { Time: '13:00' }), sw2 = go(S, { Time: '13:00' });
ok(JSON.stringify(sw1.$eng.kc) === JSON.stringify(sw2.$eng.kc), 'the same reply swiped: the same round');
S = sw1;
if (S.$eng.kc.enc) S = go(S, { Time: '13:20' }, res(`Kingdom R1: drove off ${S.$eng.kc.enc.t}`));
ok(!S.$eng.kc.enc, 'a meeting the story reported is settled');
S = go(S, { Time: '18:10', Location: "Avalon — Judges' Pavilion" });
const k1 = S.$eng.kc;
const kept = k1.f.some(f => f.h === 'Halvard');
ok(k1.r === 2 && !!k1.x1 && (!kept || k1.x1 !== 'Halvard') && k1.f.filter(f => f.h).length + 1 >= 3, `sunset: ${k1.x1} goes out; Halvard ${kept ? 'kept its Kingsbloom and is through' : 'lost it'}`);
ok(S.$ui.contest.lines.some(l => /round one went to/.test(l)) || k1.x1 === 'Halvard', 'the news of round one: ' + (S.$ui.contest.lines || []).join(' | ').slice(0, 160));

console.log('Round two with {{user}}');
// from a state where round one went Halvard's way (the rooms are the same for every seed: the engine's, from the story's reports)
let R = team({ Day: 'Thu', Time: '07:30', Location: 'Avalon — Undercroft Gates' });
R.$eng.kc.r = 2; R.$eng.kc.x1 = 'Veyra'; R.$eng.kc.t = 1440 + 7 * 60 + 30; R.$eng.kc.end1 = 1080; R.$eng.kc.out = {};
R = Schema.parse(R);
let R1 = go(R, { Time: '08:05', Location: 'Avalon — Undercroft Room 1' });
ok(/^Avalon — Undercroft Room 1/.test(R1.World.Location) && R1.$ui.contest.lines.some(l => /^Room 1 \(\{\{user\}\}\): its beast is up: .+ \(Grade IV\), bound by the panel/.test(l)), 'in Room 1: its beast is up: ' + (R1.$ui.contest.lines.find(l => /^Room 1/.test(l)) || ''));
R1 = go(R1, { Time: '08:20' }, [...res('Kingdom R2: Room 1 beast down'), op('/Competition/Rooms', ['Gareth: Room 2'])]);
ok(R1.$eng.kc.rm[0].b === 1 && R1.$eng.kc.hp.some(h => h[0] === 'Gareth' && h[1] === 1), 'the beast is down, and Gareth stands in Room 2 (Competition.Rooms)');
for (const t of ['08:35', '08:50', '09:05']) R1 = go(R1, { Time: t }, R1.$eng.kc.enc ? res(`Kingdom R2: drove ${R1.$eng.kc.enc.t} out of Room ${R1.$eng.kc.enc.i + 1}`) : []);
const rm0 = R1.$eng.kc.rm[0];
const enc = R1.$eng.kc.enc;
ok(rm0.o === 'Halvard' || (enc && enc.seen && R1.$ui.contest.lines.some(l => /^Now: \w+'s team/.test(l))), `Room 1 after 45 minutes, every meeting driven off: ${rm0.o ? 'held by ' + rm0.o : 'a meeting waits for the story: ' + JSON.stringify(enc)}`);
ok(!(R1.$eng.kc.out.Halvard || []).includes('{{user}}') || R1.Competition.Results.some(l => /off-screen/.test(l)), 'a meeting is never played off-screen before the story has seen it');
const held = go(R, { Time: '08:05', Location: 'Avalon — Long Meadow' });
ok(!/Long Meadow/.test(held.World.Location) && held._log === undefined || !/Long Meadow/.test(held.World.Location), 'Thursday: the Kingsmeadow is closed: ' + held.World.Location);

console.log('The final, the prize, the World panel');
let F = team({ Day: 'Sat', Time: '08:00', Location: 'Avalon — Royal Arena' });
Object.assign(F.$eng.kc, { r: 3, x1: 'Veyra', x2: 'Myrdath', fin: ['Halvard', 'Ashvale'], t: 3 * 1440 + 8 * 60, end1: 1080, end2: 1440 + 900, out: {} });
F.$eng.kc.cr = { '{{user}}': 40 };
F = Schema.parse(F);
F = go(F, { Time: '08:30' });
ok(F.$ui.contest.lines.some(l => /^Kingdom Competition, the final: 09:00 on the arena sand, Halvard against Ashvale \(Elion/.test(l)), 'Saturday: the final against Ashvale: ' + (F.$ui.contest.lines[0] || '').slice(0, 120));
F = go(F, { Time: '11:30' }, res('Kingdom R3: won'));
ok(F.Competition.Status === 'champion' && F.Competition.Placement === '1st of 4', 'won the final: champion, 1st of 4');
ok((F.Player.Wallet.Transactions || []).some(t => /Kingdom Competition prize/.test(t)) && F.Player.Wallet.Points >= 5100, 'the 5,000-point prize is paid');
ok(F.$eng.kc.w.some(w => w[0] === '{{user}}'), "{{user}}'s record puts them in the national four: " + F.$eng.kc.w.map(w => w[0]).join(', '));
let G = go(F, { Day: 'Mon', Month: 10, Week: 1, Time: '08:00', Location: 'Canteen' });
ok(G.Competition.Tier === 'World' && G.Competition.Status === 'selected' && !G.$eng.kc.T.length, 'after the week: picked for the World Competition; the rounds are cleared from the state');
let L = team({ Day: 'Sat', Time: '08:00', Location: 'Avalon — Royal Arena' });
Object.assign(L.$eng.kc, { r: 3, x1: 'Veyra', x2: 'Myrdath', fin: ['Halvard', 'Ashvale'], t: 3 * 1440 + 8 * 60, end1: 1080, end2: 1440 + 900, out: {} });
L = go(Schema.parse(L), { Time: '19:00' });
ok(L.$eng.kc.win && L.Competition.Results.some(l => /^Kingdom R3: (won|lost) the final \(off-screen\)$/.test(l)) && /^(1st|2nd) of 4$/.test(L.Competition.Placement), 'a final nobody reported by the end of the day is played off-screen: ' + L.Competition.Placement);

console.log('{{user}} not on the team');
const camp = (W) => { const S = initState(); Object.assign(S.World, { Year: 1, Month: 9, Week: 4, Time: '10:00', Location: 'Canteen', ...W }); S.$eng.abs = E.toAbs(S.World); S.$eng.seed = 4242; return applyPatch(Schema.parse(S), []); };
const c1 = camp({ Day: 'Wed', Time: '10:00' }), c2 = camp({ Day: 'Wed', Time: '20:00' }), c3 = camp({ Day: 'Sat', Time: '20:00' });
ok(!c1.$eng.kc && c1.$ui.kc && c1.$ui.kc.news.length === 0 && c1.$ui.contest.lines.some(l => /^Kingdom Competition in Avalon \(Halvard's team: .+\): today round one, the hunt in the Kingsmeadow/.test(l)), 'on campus, Wednesday morning: today round one, nothing told yet; nothing stored');
ok(c2.$ui.kc.news.length === 1 && /went out without a Kingsbloom/.test(c2.$ui.kc.news[0]), 'Wednesday evening: the news of round one: ' + c2.$ui.kc.news[0]);
ok(c3.$ui.kc.news.length === 3 && c3.$ui.kc.world.length === 4, 'Saturday evening: all three rounds and the national four');
