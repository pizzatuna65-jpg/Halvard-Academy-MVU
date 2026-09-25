// 1.3.8 Tension (owner design, DRAFT_tension.md approved 2026-09-25): bands with the same effects for everyone, five categories
// that decide how it is played (and how it eases), personal overrides (Etnie, Kanae, Althair, Ezrel), rank loss at 100,
// Social's gossip campaign, Krieg at 100, fights easing confrontational NPCs, quiet-day decay.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view };')();
const TEN = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/tension.json'), 'utf8'));
const npcs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/npcs.json'), 'utf8'));
console.log('Tension 1.3.8');
const clone = o => JSON.parse(JSON.stringify(o));
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const day = (S, d, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Day', value: d }, { op: 'replace', path: '/World/Time', value: '12:00' }, ...extra]);
const ten = (id, v) => ({ op: 'replace', path: `/Bonds/${id}/Tension`, value: v });
const IA = (With, Kind) => ({ op: 'insert', path: '/Interactions/-', value: { With, Kind } });
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const xpr = (S, r) => S.Player.Profile.Reputation.$xp[r];

// ---- every bonded NPC has a category or an override; the owner's placements
const bonded = Object.entries(npcs).filter(([, n]) => !/team$/.test(n.group || '')).map(([k]) => k);
ok(bonded.length === 38 && bonded.every(k => TEN.npcs[k] || TEN.overrides[k]), 'all 38 bonded NPCs have a category or an override');
ok(TEN.npcs.Milena === 'social' && ['Castor', 'Dante', 'Gareth', 'Krieg'].every(k => TEN.npcs[k] === 'dangerous') && TEN.overrides.Kanae && TEN.overrides.Kanae.exempt && TEN.overrides.Althair.lock, "owner's placements: Milena social; Castor, Dante, Gareth dangerous; Kanae and Althair overrides");

let S = T(initState(), '09:00', [meet(['Ruby', 'Sophia', 'Irene', 'Caralynn', 'Kanae', 'Althair', 'Ezrel', 'Krieg', 'Gareth'])]);
S = T(S, '09:05', [meet([])]);
// ---- effects: Strained halves XP, Enemy stops it, Hostile holds the event
const gainAt = (id, t) => { const X = T(T(S, '09:10', [ten(id, t)]), '09:20', [IA(id, 'talk'), IA(id, 'hangout')]); return X.Bonds[id].$xp - S.Bonds[id].$xp; };
ok(gainAt('Ruby', 10) === 5 && gainAt('Ruby', 45) === 3 && gainAt('Ruby', 95) === 0, `Ruby: calm 5 XP, strained ${gainAt('Ruby', 45)}, enemy 0`);
let H = clone(S); Object.assign(H.Bonds.Ruby, { $xp: 999, $cool: -1 }); H = T(H, '09:30', [ten('Ruby', 75)]);
ok(!H.Bonds.Ruby._Event_ready && H.$ui.bev.Ruby && H.$ui.bev.Ruby.why === 'tension', 'Hostile: a full bar does not open the bond event (held for tension)');
ok(T(H, '09:40', [ten('Ruby', 60)]).Bonds.Ruby._Event_ready, 'below 70 the event opens again');

// ---- rank drop at 100 (and the milestone reputation is paid only once per rank)
let R = clone(S); R.Bonds.Irene.Rank = 5; R.Bonds.Irene.$ms = [5];
R = T(R, '10:00', [ten('Irene', 100)]);
ok(R.Bonds.Irene.Rank === 4 && R.Bonds.Irene.$xp === 0 && R.$ui.toasts.some(t => /fell to Rank 4/.test(t)) && R.Journal.some(l => /broke down to Rank 4/.test(l)), 'Tension 100: the bond falls a rank (bar emptied, toast, journal)');
ok(xpr(R, 'Student') === -15, `Irene (a student) at 100: Student -5 -10 (${xpr(R, 'Student')})`);
R = T(R, '10:05', [ten('Irene', 20)]); Object.assign(R.Bonds.Irene, { $xp: 999, _Event_ready: true, $cool: -1 });
R = T(R, '10:10', [{ op: 'replace', path: '/Bonds/Irene/Rank', value: 5 }]);
ok(R.Bonds.Irene.Rank === 5 && xpr(R, 'Student') === -15, 'rising back to Rank 5 does not pay the Rank 5 reputation again');

// ---- Social: Enemy starts a gossip campaign (Student -5)
const C = T(S, '10:00', [ten('Caralynn', 92)]);
ok(xpr(C, 'Student') === -5 - 5, `Caralynn (social) at 92: high tension -5 and the campaign -5 (${xpr(C, 'Student')})`);
// ---- Confrontational: a fight eases it (once a day)
let F = T(S, '10:00', [ten('Sophia', 60)]);
F = T(F, '10:30', [meet(['Sophia']), IA('Sophia', 'fight')]);
ok(F.Bonds.Sophia.Tension === 35 && F._Log.some(l => /fight with Sophia cleared the air/.test(l)), 'a fight with Sophia: Tension 60 -> 35');
ok(T(F, '11:00', [IA('Sophia', 'fight')]).Bonds.Sophia.Tension === 35, 'once a day');
ok(T(T(S, '10:00', [ten('Ruby', 60)]), '10:30', [IA('Ruby', 'fight')]).Bonds.Ruby.Tension === 60, 'a fight does not ease a Withdrawn NPC');
// ---- decay per category on quiet days
let D = T(S, '10:00', [ten('Ruby', 50), ten('Irene', 50), ten('Caralynn', 50), ten('Sophia', 50), ten('Gareth', 50)]);
D = day(D, 'Wed'); D = day(D, 'Fri');   // 4 quiet days
ok(D.Bonds.Ruby.Tension === 42 && D.Bonds.Irene.Tension === 46 && D.Bonds.Caralynn.Tension === 48 && D.Bonds.Sophia.Tension === 49 && D.Bonds.Gareth.Tension === 50,
  `4 quiet days: withdrawn -8, authority -4, social -2, confrontational -1, dangerous 0 (${['Ruby', 'Irene', 'Caralynn', 'Sophia', 'Gareth'].map(k => D.Bonds[k].Tension)})`);
ok(day(T(D, '13:00', [ten('Ruby', 60)]), 'Sat', [ten('Ruby', 70)]).Bonds.Ruby.Tension === 70, 'no decay on a day the tension rose');

// ---- overrides
let K = T(S, '10:00', [ten('Kanae', 100)]);
ok(K.Bonds.Kanae.Tension === 100 && xpr(K, 'Student') === 0 && K.Bonds.Kanae.Rank === 0, 'Kanae at 100: no reputation cost, no rank loss');
ok(T(K, '10:30', [IA('Kanae', 'talk'), IA('Kanae', 'hangout')]).Bonds.Kanae.$xp === 5, 'Kanae still grows the bond at full Tension');
let A = clone(S); A.Bonds.Althair.Rank = 3; A = T(A, '10:00', [ten('Althair', 25)]);
ok(A.Bonds.Althair.Tension === 0 && A.Bonds.Althair.$xp === 10 && A._Log.some(l => /Althair enjoyed that/.test(l)), 'Althair: +25 Tension becomes +10 XP (/2 rounded up = 13, capped 10 a day); Tension stays 0');
ok(T(A, '11:00', [ten('Althair', 10)]).Bonds.Althair.$xp === 10, 'the daily cap holds');
ok(day(A, 'Tue', [ten('Althair', 7)]).Bonds.Althair.$xp === 14, 'next day: +7 -> +4 XP');
ok(T(S, '10:00', [ten('Ezrel', 30)]).Bonds.Ezrel.Tension === 15, 'Ezrel: rises count half');
// ---- Krieg at 100
let Kr = clone(S); Kr.Hidden._True_magic = 'Unmaking'; Kr.Hidden.Dove_attention = 10;
Kr = T(Kr, '10:00', [ten('Krieg', 100)]);
ok(Kr.Hidden.Dove_attention === 20 && xpr(Kr, 'Doves') <= -40, `Krieg at 100: Dove attention +10, Doves reputation plummets (${xpr(Kr, 'Doves')})`);

// ---- the narrator's view (Now entry) and the UI
const card = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/Eldrasil_Halvard.json'), 'utf8')).data;
const now = X => ejs.render(card.character_book.entries.find(e => e.id === 505).content, { getvar: k => _.get({ stat_data: X }, k) });
let N = T(S, '10:00', [ten('Sophia', 95), ten('Ruby', 25), ten('Gareth', 92), meet(['Sophia', 'Ruby', 'Gareth', 'Althair', 'Irene'])]);
const out = now(N);
ok(/Tension: Sophia \(Tension 95, enemy\): a formal challenge or a grudge match[^\n]*Never: an ambush/.test(out), 'Now: Sophia at Enemy, played as a confrontational character');
ok(/Tension: Ruby \(Tension 25, friction\): quieter than usual/.test(out) && /Tension: Gareth \(Tension 92, enemy\): strikes with everything their position allows \(files it away/.test(out), 'Now: Ruby (withdrawn, friction), Gareth (dangerous) with his peak');
ok(/Tension: Althair: Althair enjoys being disliked/.test(out) && !/Tension: Irene/.test(out), 'Now: Althair always explained; Irene at 0 costs nothing');
U.view.arg = 'Sophia'; const dos = U.PANELS.npc.render(N);
ok(/Tension 95 · Enemy/.test(dos) && /cannot grow until the tension eases/.test(dos), 'dossier: the band and what it does to the bond');
U.view.arg = 'Althair'; ok(/Hostility only makes him fonder of you/.test(U.PANELS.npc.render(N)), "Althair's dossier explains his lock");
// an older save: a bond already at Rank 5 counts its Rank 5 milestone as paid
const O = clone(S); O.$eng.tenv = 0; O.Bonds.Irene.Rank = 6; O.Bonds.Irene.$ms = [];
ok(T(O, '10:00').Bonds.Irene.$ms.includes(5) && !T(O, '10:00').Bonds.Irene.$ms.includes(10), 'older saves: milestones up to the current rank count as paid');
// 1.3.9 (owner): no cap on rises ("easier to make enemies than friends"): several offences in one day all count
let Q = T(S, '10:00', [ten('Ruby', 30)]); Q = T(Q, '10:05', [ten('Ruby', 65)]); Q = T(Q, '10:10', [ten('Ruby', 95)]);
ok(Q.Bonds.Ruby.Tension === 95 && /These are sizes, not limits/.test(fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/502.txt'), 'utf8')), 'Tension rises are never capped (0 -> 95 in ten minutes); rule 502 says so');
