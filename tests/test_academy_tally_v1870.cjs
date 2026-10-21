// 1.87.0 (owner-approved planning/DRAFT_event_frame.md 3.1, 3.10, release C): the Academy Competition computed from the seed (the
// Dorm qualifiers' cross-dorm teams, a knockout, {{user}}'s team's matches from the story, Placement and Status by the engine, the
// winners as Halvard's Kingdom team) and the tally format (Sports Day's medals, the Showcase's scores).
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { Schema, initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const E = new Function(read('src/scripts/engine.js') + '\nreturn { academyQualifiers, academyTeams, academyContest, eventTally, kcTeams, PRESENCE, toAbs };')();
const PD = E.PRESENCE, card = JSON.parse(read('dist/Eldrasil_Halvard.json')).data;
const render = (id, S) => ejs.render(card.character_book.entries.find(e => e.id === id).content, { getvar: k => _.get({ stat_data: S }, k), lastUserMessage: '' });
const op = (p, value) => ({ op: 'replace', path: p, value });
function at(W, extra = {}, seed = 777, prof = {}) {
  const S = initState();
  Object.assign(S.World, { Year: 1, Month: 6, Week: 4, Day: 'Tue', Time: '20:00', Location: 'Canteen', ...W });
  Object.assign(S.Player.Profile, { Dorm: 'Fire', Year: 1, Name: 'Aria Vale', Combat_role: 'Attack', ...prof });
  S.Player.Wallet.Points = 200; S.$eng.abs = E.toAbs(S.World); S.$eng.seed = seed;
  Object.assign(S, extra);
  return applyPatch(Schema.parse(S), []);
}
const go = (B, W, ops = [], text = '') => applyPatch(B, [...Object.entries(W).map(([k, v]) => op('/World/' + k, v)), ...ops], { text });
const nowC = S => render(505, S).split('\n').filter(l => /^(Contest: Academy|Academy Competition news|Elsewhere at the Academy|The Academy Competition went|Report the match|.* not a roster character)/.test(l));

console.log('The teams');
const Q = E.academyQualifiers(PD, 777, 1, null);
ok(Q.length === 64 && ['Fire', 'Light', 'Sky', 'Viridian'].every(d => Q.filter(e => e.dorm === d).length === 16), '64 qualifiers, 16 per dorm (lore 19 quotas)');
ok(Q.some(e => e.id === 'Royhan'), 'Royhan qualifies (lore 101, third Control in Y1)');
const T = E.academyTeams(PD, 777, 1, null);
const y1 = Q.filter(e => e.y === 1).length;
ok(T.length === Math.min(16, y1) && T.every(t => t.m.length === 4), `teams of four, as many as there are first-years to go round (${T.length}; ${y1} first-years qualified)`);
ok(!T.some(t => t.m.some(e => e.id === 'Royhan')), 'no team takes Royhan (lore 101)');
ok(T.every(t => new Set(t.m.map(e => e.y)).size === 3), 'every school year in every team (lore 19)');
ok(T.every(t => new Set(t.m.map(e => e.role)).size >= 3), 'the roles covered as far as they go (three or four in each)');
ok(JSON.stringify(E.academyContest(PD, 777, 1, null).champ) === JSON.stringify(E.academyContest(PD, 777, 1, null).champ), 'the same every swipe');
const champs = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => E.academyContest(PD, s, 1, null).champ.k));
ok(champs.size >= 4, `different winners by seed: ${[...champs].join(', ')}`);

console.log('Without {{user}}: the news, and the Kingdom team');
let N = at({ Month: 3, Week: 4, Day: 'Mon', Time: '10:00' }, {}, 777, { Combat_role: 'Healing' });
N = at({ Day: 'Wed', Time: '08:00' }, {}, 777);
ok(!nowC(N).length, 'before the first round: no news');
N = go(N, { Day: 'Thu', Time: '10:00' });
ok(nowC(N).some(l => /^Academy Competition news \(round 1\): /.test(l)), "Thursday: round one's results");
N = go(N, { Day: 'Sat', Time: '18:30' });
const AC = E.academyContest(PD, 777, 1, N);
ok(nowC(N).some(l => l.startsWith(`The Academy Competition went to ${AC.champ.k}`)), 'after the final: the winners');
ok((N.Journal || []).filter(l => /^(\[[^\]]+\] )?Academy Competition: .* won/.test(l)).length === 1, 'a Journal line, once');
const K = go(N, { Month: 9, Week: 4, Day: 'Mon', Time: '10:00' });
const hal = E.kcTeams(PD, 777, 1, K).find(t => t.k === 'Halvard');
ok(JSON.stringify(hal.m.map(e => e.id)) === JSON.stringify(AC.champ.m.map(e => e.id)), `Halvard's Kingdom team is the Academy winners: ${hal.m.map(e => e.named ? e.id : e.label).join(', ')}`);

console.log('With {{user}} qualified');
const dorm = ['Dorm R1: beat a', 'Dorm R2: beat b', 'Dorm R3: beat c', 'Dorm R4: beat d'];
const Co = { Tier: 'Dorm', Status: 'champion', Placement: '1st of 12, Attack bracket', Team: [], Results: dorm };
let U = at({ Day: 'Wed', Time: '08:00' }, { Competition: Co });
ok(U.Competition.Tier === 'Academy' && U.Competition.Status === 'entered' && U.Competition.Team.length === 3, 'on the first day: Academy, entered; Team written from the draw: ' + U.Competition.Team.join(', '));
const DAYR = ['Wed', 'Thu', 'Fri', 'Sat'];
const nextOf = S => { const l = nowC(S).find(x => /^Report the match/.test(x)), m = l && /as "R(\d): beat (.+?)" or/.exec(l); return m ? { r: +m[1], o: m[2] } : null; };
const n1 = nextOf(U);
ok(n1 && nowC(U).some(l => new RegExp(`^Contest: Academy Competition \\(\\d+ cross-dorm teams[^\\n]*Round ${n1.r} of [34]: ${DAYR[n1.r - 1]} \\d\\d:\\d\\d, against `).test(l)), `<now>: {{user}}'s team and its first match (round ${n1 && n1.r}${n1 && n1.r > 1 ? ', after a bye' : ''})`);
const Off = go(U, { Day: DAYR[n1.r], Time: '10:00' });
ok(Off.Competition.Results.some(l => new RegExp(`^Academy R${n1.r}: (beat|lost to) .+ \\(off-screen\\)$`).test(l)), 'a match left unreported: played off-screen once the next round has begun');
let W = U, Lost = null;
for (let k = 0; k < 4; k++) {
  const n = nextOf(W);
  if (!n) break;
  if (W.World.Day !== DAYR[n.r - 1]) W = go(W, { Day: DAYR[n.r - 1], Time: '08:30' });
  if (!Lost) Lost = go(W, { Time: '15:00' }, [{ op: 'insert', path: '/Competition/Results/-', value: `R${n.r}: lost to ${n.o}` }]);
  W = go(W, { Time: '15:00' }, [{ op: 'insert', path: '/Competition/Results/-', value: `R${n.r}: beat ${n.o}` }]);
  if (k === 0) ok(W.Competition.Results.includes(`Academy R${n.r}: beat ${n.o}`) && W.Competition.Status === 'entered', 'a match reported (the tier added)');
}
ok(W.Competition.Status === 'champion' && /^1st of \d+ teams$/.test(W.Competition.Placement), 'every match won: champion, ' + W.Competition.Placement);
const KW = go(W, { Month: 9, Week: 4, Day: 'Wed', Time: '06:00' });
ok(KW.Competition.Tier === 'Kingdom' && KW.Competition.Status !== 'eliminated', "the Kingdom week: {{user}}'s team represents Halvard (Tier Kingdom)");
ok(Lost.Competition.Status === 'eliminated' && /^\d+(st|nd|rd|th) of \d+ teams$/.test(Lost.Competition.Placement), 'a loss: eliminated, ' + Lost.Competition.Placement);
const Keep = go(go(Lost, { Month: 7, Week: 1, Day: 'Mon' }), { Time: '10:00' }, [op('/Competition/Placement', '1st'), op('/Competition/Status', 'champion')]);
ok(Keep.Competition.Status === 'eliminated', "afterwards the result is the engine's");

console.log('Sports Day and the Showcase');
const SD = go(at({ Month: 6, Week: 3, Day: 'Sat', Time: '17:50', Location: 'Sports Field' }), { Time: '18:10' });
const sj = (SD.Journal || []).find(l => /Sports Day: (Fire|Light|Sky|Viridian) took the most medals \(gold-silver-copper: /.test(l));
ok(sj && /Sports Day: the medals went to (Fire|Light|Sky|Viridian) \(gold-silver-copper/.test(render(505, SD)), 'at the close: the medals in the Journal and <now>: ' + sj);
ok(!(at({ Month: 6, Week: 3, Day: 'Sat', Time: '17:00' }).Journal || []).some(l => /Sports Day:/.test(l)), 'not before the close');
const SC = go(at({ Month: 8, Week: 3, Day: 'Sat', Time: '18:50', Location: 'Courtyards' }), { Time: '19:10' });
ok((SC.Journal || []).some(l => /Academy Showcase: (Fire|Light|Sky|Viridian) was named the most talented dorm \(points: /.test(l)), 'the Showcase: the most talented dorm by points');
const wins = d => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].filter(s => E.eventTally(PD, s, 1, 'sports_day', { [d]: 20 }).win === d).length;
ok(wins('Light') > [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].filter(s => E.eventTally(PD, s, 1, 'sports_day', {}).win === 'Light').length, "a dorm's boost (its chances done) makes it win more often");
