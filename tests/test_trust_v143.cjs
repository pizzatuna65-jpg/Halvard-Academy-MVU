// 1.4.3 Trust (owner design, DRAFT_trust.md approved 2026-09-25): bands with the same effects for everyone (sharing, perks and
// bond events that need Trust, XP, how Tension and apologies land), four categories from the NPC's openness (start, rise, drop,
// recovery), rises only from reported deeds (capped a week), drops uncapped and spreading to friends, personal overrides (Etnie,
// Kanae, Althair, Ezrel, Caine, Krieg) and Ottavio's Sky students.
const fs = require('fs'), path = require('path'), ejs = require('ejs');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
global.window = { parent: { document: {} } };
global.substitudeMacros = () => 'Aria Vale';
const U = new Function(fs.readFileSync(path.join(ROOT, 'src/scripts/ui.js'), 'utf8') + '\nreturn { PANELS, view, graphModel, EDGE };')();
const TRU = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/trust.json'), 'utf8'));
console.log('Trust 1.4.3');
const clone = o => JSON.parse(JSON.stringify(o));
const T = (S, time, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra]);
const day = (S, d, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Day', value: d }, { op: 'replace', path: '/World/Time', value: '12:00' }, ...extra]);
const week = (S, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Week', value: S.World.Week + 1 }, { op: 'replace', path: '/World/Day', value: 'Tue' }, { op: 'replace', path: '/World/Time', value: '12:00' }, ...extra]);
const tr = (id, v) => ({ op: 'replace', path: `/Bonds/${id}/Trust`, value: v });
const ten = (id, v) => ({ op: 'replace', path: `/Bonds/${id}/Tension`, value: v });
const IA = (With, Kind, Public) => ({ op: 'insert', path: '/Interactions/-', value: Public ? { With, Kind, Public: true } : { With, Kind } });
const meet = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const set = (S, id, o) => { const X = clone(S); Object.assign(X.Bonds[id], o); return X; };
const ids = ['Trixie', 'Irene', 'Caspian', 'Mimosa', 'Etnie', 'Althair', 'Ezrel', 'Caine', 'Kanae', 'Ruby', 'Sophia', 'Ottavio', 'Aiden', 'Bobby'];
let S = T(initState(), '09:00', [meet(ids)]);

// ---- starts by category (openness)
ok(S.Bonds.Trixie.Trust === 60 && S.Bonds.Caspian.Trust === 50 && S.Bonds.Irene.Trust === 40 && S.Bonds.Mimosa.Trust === 30 && S.Bonds.Etnie.Trust === 70,
  'a new bond starts at its category: open 60, normal 50, guarded 40, closed 30; Etnie 70');
ok(S.Bonds.Ottavio.Trust === 30, 'Ottavio (closed) starts at 30 for a student outside Sky');

// ---- the narrator cannot raise it; drops count by category
let A = T(S, '09:10', [tr('Irene', 80), tr('Trixie', 50), tr('Mimosa', 20)]);
ok(A.Bonds.Irene.Trust === 40 && A._Log.some(l => /Irene's Trust cannot be raised directly/.test(l)), 'a direct raise is undone and the narrator is told to report the deed');
ok(A.Bonds.Trixie.Trust === 50 && A.Bonds.Mimosa.Trust === 15, 'drops: open x1 (60 -> 50), closed x1.5 (30 -10 -> 15)');

// ---- rises from reported deeds, by category, once a kind a day, capped a week
A = T(S, '09:10', [IA('Trixie', 'keep'), IA('Irene', 'secret'), IA('Caspian', 'defend', true)]);
ok(A.Bonds.Trixie.Trust === 66 && A.Bonds.Irene.Trust === 45 && A.Bonds.Caspian.Trust === 58, 'keep +4 x1.5 (open) = +6; secret +6 x0.75 (guarded) = +5 (rounded up from 4.5); defend in public +5 x1.5 = +8');
A = T(A, '09:20', [IA('Trixie', 'keep')]);
ok(A.Bonds.Trixie.Trust === 66, 'the same kind counts once a day');
A = T(A, '09:30', [IA('Trixie', 'confide')]);
ok(A.Bonds.Trixie.Trust === 68 && A._Log.some(l => /Trixie: Trust rises at most \+8 a week/.test(l)), 'the weekly cap (+8) holds: confide +3 x1.5 = +5, only +2 counted');
A = week(A, [IA('Trixie', 'keep')]);
ok(A.Bonds.Trixie.Trust === 74, 'a new week, a new cap');

// ---- a rank earned adds +3 (outside the cap)
let R = set(S, 'Caspian', { Rank: 2, $xp: 999, _Event_ready: true, $cool: -1 });
R = T(R, '09:15', [{ op: 'replace', path: '/Bonds/Caspian/Rank', value: 3 }]);
ok(R.Bonds.Caspian.Rank === 3 && R.Bonds.Caspian.Trust === 53, 'the Rank 3 event: Trust +3');

// ---- quiet weeks recover it towards 35 (open +3, closed never)
let Q = T(S, '09:10', [tr('Trixie', 10), tr('Mimosa', 10)]);
Q = week(week(Q));
ok(Q.Bonds.Trixie.Trust === 16 && Q.Bonds.Mimosa.Trust === 0, `quiet weeks: open +3 a week (10 -> 16), closed never (Mimosa ${Q.Bonds.Mimosa.Trust})`);

// ---- perks and bond events that need Trust
let G = set(S, 'Caspian', { Rank: 6, $xp: 999, $cool: -1, Trust: 40 });
G = T(G, '09:30');
ok(!G.Bonds.Caspian._Event_ready && G.$ui.bev.Caspian.held && G.$ui.bev.Caspian.why === 'trust' && G.$ui.bev.Caspian.need === 50, 'the event to Rank 7 waits for Trust 50');
G = set(G, 'Caspian', { Trust: 55 }); G.Bonds.Caspian.Trust = 55; G = T(G, '09:40');
ok(G.Bonds.Caspian._Event_ready, 'with Trust 55 it opens');
let E8 = set(S, 'Ruby', { Rank: 7, $xp: 999, $cool: -1, Trust: 40 }); E8 = T(E8, '09:40');
ok(E8.Bonds.Ruby._Event_ready && /can only turn into a sworn rivalry/.test(E8.$ui.bev.Ruby.dir), 'the Rank 8 event is never held; under 50 it can only end in a sworn rivalry');
let RM = set(S, 'Ruby', { Rank: 8, Trust: 40 }); RM = T(RM, '09:50', [{ op: 'replace', path: '/Bonds/Ruby/Romance', value: true }]);
ok(!RM.Bonds.Ruby.Romance && RM._Log.some(l => /Romance with Ruby needs Trust 50/.test(l)), 'a romance needs Trust 50');

// ---- XP, Tension and apologies
let X = set(S, 'Caspian', { Trust: 10 }); X = T(X, '10:00', [IA('Caspian', 'hangout')]);
ok(X.Bonds.Caspian.$xp === 2, `Betrayed: a hangout (+3) counts half (${X.Bonds.Caspian.$xp})`);
let C = set(S, 'Ruby', { Trust: 90 }); C = set(C, 'Caspian', { Trust: 10 });
C = T(C, '10:00', [ten('Ruby', 10), ten('Caspian', 10)]);
ok(C.Bonds.Ruby.Tension === 5 && C.Bonds.Caspian.Tension === 15, 'Confidant: a small rise counts half (10 -> 5); Betrayed: x1.5 (10 -> 15)');
C = T(set(S, 'Ruby', { Trust: 90 }), '10:00', [ten('Ruby', 25)]);
ok(C.Bonds.Ruby.Tension === 25, 'Confidant does not soften violence (+25)');
let P = set(set(S, 'Irene', { Trust: 70, Tension: 60 }), 'Caspian', { Trust: 10, Tension: 60 });
P = T(P, '10:00', [IA('Irene', 'apology'), IA('Caspian', 'apology')]);
ok(P.Bonds.Irene.Tension === 45 && P.Bonds.Caspian.Tension === 60, 'an apology lands by Trust: Trusting x1.5 (authority -10 -> -15), Betrayed x0');

// ---- overrides
let O = T(S, '10:00', [tr('Etnie', 30), tr('Althair', 10), tr('Ezrel', 40), IA('Ezrel', 'secret')]);
ok(O.Bonds.Etnie.Trust === 50 && O.Bonds.Etnie.Tension === 20 && O._Log.some(l => /Etnie cannot stop trusting/.test(l)), 'Etnie: never below 50; the rest of the blow (20) becomes Tension');
ok(O.Bonds.Althair.Trust === 50 && O.Bonds.Althair.$xp === 10 && O._Log.some(l => /Althair enjoyed being betrayed/.test(l)), 'Althair: Trust stays 50; the betrayal (-40) becomes bond XP (/2, capped 10 a day)');
ok(O.Bonds.Ezrel.Trust === 48, 'Ezrel: changes count half (-10 -> -5, secret +6 -> +3)');
let K = set(S, 'Caine', { Trust: 64 }); K = T(K, '10:00', [IA('Caine', 'keep')]);
ok(K.Bonds.Caine.Trust === 64, 'Caine: his Trust cannot pass 64 ({{user}} is a mage)');
K = T(K, '10:10', [{ op: 'insert', path: '/Campus_State/Secrets_revealed/-', value: 'Caine.choir' }, IA('Caine', 'secret')]);
ok(K.Bonds.Caine.Trust === 67, 'once his secret is out, the cap lifts (closed x0.5: +3)');
let KA = T(S, '10:00', [IA('Kanae', 'choose'), tr('Kanae', 0)]);
ok(KA.Bonds.Kanae.Trust === 15, 'Kanae: never below 15 while her Plan is hidden (a choose adds, then the drop is floored)');
KA = T(S, '10:00', [IA('Kanae', 'choose')]);
ok(KA.Bonds.Kanae.Trust === 45, 'Kanae: {{user}} chose her over someone: +3 x2 x0.75 = +5 (rounded)');
KA = T(S, '10:00', [{ op: 'insert', path: '/Campus_State/Secrets_revealed/-', value: 'Kanae.plan' }, IA('Kanae', 'choose'), tr('Kanae', 0)]);
ok(KA.Bonds.Kanae.Trust === 0, 'after the Plan is out she is plain Guarded: no choose, no floor');
let KR = T(initState(), '09:00', [meet(['Krieg'])]); KR.Hidden._True_magic = 'Void';   // the Builder's field
KR = applyPatch(KR, [{ op: 'replace', path: '/Hidden/Dove_attention', value: 85 }]);
ok(KR.Bonds.Krieg.Trust === 0 && KR._Log.some(l => /Krieg knows what \{\{user\}\} hid: Trust 0/.test(l)), 'Krieg: hidden magic exposed -> Trust 0');

// ---- Ottavio and his own Sky students
let SK = T(applyPatch(initState(), [{ op: 'replace', path: '/Player/Profile/Dorm', value: 'Sky' }]), '09:00', [meet(['Ottavio'])]);
ok(SK.Bonds.Ottavio.Trust === 60, 'a Sky student: Ottavio starts at 60 (open)');
SK = T(SK, '09:30', [IA('Ottavio', 'hangout'), ten('Ottavio', 20)]);
ok(SK.Bonds.Ottavio.$xp === 5 && SK.Bonds.Ottavio.Tension === 10, 'bond XP x1.5 (hangout 3 -> 5), Tension rises x0.5 (20 -> 10)');

// ---- word of a betrayal reaches their friends
const fr = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/relations.json'), 'utf8')).filter(e => e.type === 'friends' && !e.rule);
const pair = fr.find(e => ids.includes(e.from) && ids.includes(e.to) && !['Althair', 'Etnie'].includes(e.to) && !['Althair', 'Etnie'].includes(e.from));
let W = T(S, '10:00', [tr(pair.from, S.Bonds[pair.from].Trust - 20)]);
ok(W.Bonds[pair.to].Trust === S.Bonds[pair.to].Trust - 5 && W._Log.some(l => /Word of what \{\{user\}\} did to/.test(l)), `a betrayal of ${pair.from} (-20) costs their friend ${pair.to} 5 Trust`);

// ---- Rank 10 benefits suspended by low Trust
let B10 = clone(S); B10._Perks = { 'Aiden (Rank 10)': { From: 'Aiden', Kind: 'rank10', Effect: 'x', Uses: 1 } }; B10.Bonds.Aiden.Rank = 10;
B10 = T(B10, '10:00', [tr('Aiden', 20)]);
ok(B10.$ui.tsusp.includes('Aiden (Rank 10)'), 'Aiden at Trust 20: his Rank 10 benefit is suspended');
B10 = T(B10, '10:10', [{ op: 'insert', path: '/Perk_use/-', value: 'Aiden (Rank 10)' }]);
ok(B10._Perks['Aiden (Rank 10)'] && B10._Log.some(l => /suspended while Aiden's Trust is low/.test(l)), 'a suspended benefit cannot be used');

// ---- the Now entry
const now505 = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/505.txt'), 'utf8');
const gv = St => k => require('lodash').get({ stat_data: St }, k);
let N = set(set(set(S, 'Irene', { Trust: 20, Rank: 7 }), 'Caspian', { Trust: 10 }), 'Ruby', { Trust: 90, Rank: 5 });
N = T(N, '10:30');
const nw = ejs.render(now505, { getvar: gv(N) });
ok(/Trust: Irene \(Trust 20, doubtful; guarded\): says nothing personal/.test(nw) && /Trust: Ruby \(Trust 90, confidant; open\)/.test(nw), 'Now: how a doubtful and a confidant character carry it');
ok(/Bond: Irene \(Rank 7, guarded, Trust 20 doubtful\)[^\n]*Held back by low Trust: introduces \{\{user\}\} to friends; keeps \{\{user\}\}'s secrets \(needs Trust 35\); takes real risks/.test(nw), 'Now: the perks low Trust holds back');
ok(/Bond: Caspian \([^)]*Trust 10 betrayed\): shares nothing new with \{\{user\}\}/.test(nw), 'Now: Betrayed shares nothing new');
ok(/Bond: Ruby \([^)]*Trust 90 confidant\): shares [^\n]*their goals; what they think of other people/.test(nw), 'Now: a confidant shares the real tiers one rank early (goals and views at Rank 5)');
ok(/Trust: Etnie cannot stop trusting/.test(nw) && /Trust: Althair trusts no one/.test(nw) && /report \{"With": "Kanae", "Kind": "choose"\}/.test(nw), 'Now: the personal rules of Etnie, Althair and Kanae');
const rules = fs.readFileSync(path.join(ROOT, 'src/worldbook/custom/content/502.txt'), 'utf8');
ok(/Never raise Trust yourself/.test(rules) && /keep\|secret\|defend\|confide/.test(rules) && /betrayal \(reporting them, siding with their enemy, selling them out\) −25–40/.test(rules), 'rule 502: report rises, write drops by size');

// ---- the UI
U.view.arg = 'Irene';
const dos = U.PANELS.npc.render(N);
ok(/Trust 20 · Doubtful/.test(dos) && /Held back until they trust you more:/.test(dos), 'dossier: the band, and what is held back');
U.view.arg = 'Caspian'; ok(/Betrayed: time together counts for half/.test(U.PANELS.npc.render(N)), 'dossier: Betrayed warning');
U.view.arg = 'Althair'; ok(/Trust fixed/.test(U.PANELS.npc.render(N)), "dossier: Althair's fixed Trust");
