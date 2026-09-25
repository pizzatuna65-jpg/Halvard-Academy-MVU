// 1.3.0 (owner brainstorm 2026-09-25): reputation (Academy / Student / Doves), training (Mana pool / Stamina), bond rewards
// (Rank 5 gift, Rank 10 benefit, one-use perks, monthly points), Krieg's weekly bond, the mask -> truth gate, rivals without bonds.
const fs = require('fs'), path = require('path');
const { initState, applyPatch, ok, ROOT } = require('./harness.cjs');
const REP = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/reputation.json'), 'utf8'));
const REW = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/bond_rewards.json'), 'utf8'));
console.log('Rewards, reputation, training 1.3.0');

const clone = o => JSON.parse(JSON.stringify(o));
const T = (S, time, extra = [], opts) => applyPatch(S, [{ op: 'replace', path: '/World/Time', value: time }, ...extra], opts);
const nextWeek = (S, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Week', value: S.World.Week + 1 }, { op: 'replace', path: '/World/Day', value: 'Mon' }, { op: 'replace', path: '/World/Time', value: '12:00' }, ...extra]);
const day = (S, d, extra = []) => applyPatch(S, [{ op: 'replace', path: '/World/Day', value: d }, { op: 'replace', path: '/World/Time', value: '12:00' }, ...extra]);
const RE = (Rep, XP, Kind) => ({ op: 'insert', path: '/Rep_events/-', value: { Rep, XP, Kind: Kind || 'repeat', Why: 'test' } });
const present = ids => ({ op: 'replace', path: '/Scene/Present', value: Object.fromEntries(ids.map(i => [i, { Note: '' }])) });
const rankUp = (S, id) => applyPatch(S, [{ op: 'replace', path: `/Bonds/${id}/Rank`, value: S.Bonds[id].Rank + 1 }]);
// a bond one step before an event: rank r, full bar, ready
const primed = (S, id, r) => { const X = clone(S); Object.assign(X.Bonds[id], { Rank: r, $xp: 999, _Event_ready: true, $cool: -1 }); return X; };

let S = initState();
ok(S.Player.Profile.Reputation._Academy === 0 && S.Player.Profile.Reputation.$xp.Doves === 0 && S.$eng.repv === 1, 'three reputations start at 0');

// ---- reputation: weekly cap on repeatable triggers, events and losses uncapped, levels
let A = T(S, '09:00', [RE('Academy', 2), RE('Academy', 2), RE('Academy', 2)]);
ok(A.Player.Profile.Reputation.$xp.Academy === 5 && A._Log.some(l => /weekly limit/.test(l)), `repeatable Rep XP is capped at +${REP.weekly_cap} a week (${A.Player.Profile.Reputation.$xp.Academy})`);
A = T(A, '10:00', [RE('academy', 15, 'event')]);
ok(A.Player.Profile.Reputation.$xp.Academy === 20 && A.Player.Profile.Reputation._Academy === 1, 'an event is uncapped; 20 Rep XP = level +1');
ok(A.$ui.toasts.some(t => /Academy reputation rose to \+1/.test(t)) && A.Journal.some(l => /Academy reputation rose/.test(l)), 'a level change is toasted and journaled');
A = T(A, '11:00', [RE('Academy', -8)]);
ok(A.Player.Profile.Reputation.$xp.Academy === 12 && A.Player.Profile.Reputation._Academy === 0, 'losses are never capped and a level drops again below its threshold');
A = nextWeek(A, [RE('Academy', 3)]);
ok(A.Player.Profile.Reputation.$xp.Academy === 15, 'a new week resets the weekly cap');
A = T(A, '13:00', [RE('Doves', -200, 'event')]);
ok(A.Player.Profile.Reputation.$xp.Doves === -125 && A.Player.Profile.Reputation._Doves === -5, 'Rep XP clamps at -125 (level -5)');
A = T(A, '13:10', [RE('Dorm', 5)]);
ok(A._Log.some(l => /unknown/.test(l)), 'an unknown reputation name is logged, not applied');
const W = T(S, '09:05', [{ op: 'replace', path: '/Player/Profile/Reputation/_Academy', value: 5 }]);
ok(W.Player.Profile.Reputation._Academy === 0, 'the AI cannot write a level (engine-computed)');
// migration of the pre-1.3.0 meters
const M0 = clone(S); M0.$eng.repv = 0; M0.Player.Profile.Reputation = { Public: 20, Dorm: -12 };
const M1 = T(M0, '09:10');
ok(M1.Player.Profile.Reputation.$xp.Academy === 25 && M1.Player.Profile.Reputation.$xp.Student === -15 && M1.Player.Profile.Reputation.Public === undefined,
  `old Public/Dorm become Academy/Student XP once (${JSON.stringify(M1.Player.Profile.Reputation.$xp)})`);

// ---- reputation modifies bond XP for talks and hangouts
let B = T(S, '12:00', [present(['Trixie', 'Gavlan', 'Idris'])]);
const setXP = (X, r, x) => { X = clone(X); X.Player.Profile.Reputation.$xp[r] = x; return X; };
let C = setXP(setXP(B, 'Student', 60), 'Doves', 60);
C = T(C, '12:30', ['Trixie', 'Gavlan', 'Idris'].map(w => ({ op: 'insert', path: '/Interactions/-', value: { With: w, Kind: 'talk' } })));
ok(C.Bonds.Trixie.$xp === 3 && C.Bonds.Gavlan.$xp === 1 && C.Bonds.Idris.$xp === 2,
  `Student +3: students +1; Doves +3: anti-Dove NPCs -1 (Gavlan staff 2-1=1, Idris 2+1-1=2): ${C.Bonds.Trixie.$xp}/${C.Bonds.Gavlan.$xp}/${C.Bonds.Idris.$xp}`);
C = setXP(B, 'Student', 125);
C = T(C, '12:30', [{ op: 'insert', path: '/Interactions/-', value: { With: 'Trixie', Kind: 'hangout' } }]);
ok(C.Bonds.Trixie.$xp === 5, 'Student +5: students +2 per talk or hangout');

// ---- Rank 5 gift, bond milestone reputation, training partner
let G = primed(B, 'Trixie', 4);
G = rankUp(G, 'Trixie');
ok(G.Bonds.Trixie.Rank === 5 && G._Perks["Trixie's flash powder"] && G._Perks["Trixie's flash powder"].Kind === 'gift', 'the 4 -> 5 event gives the NPC\'s gift (in _Perks)');
ok(G.Player.Profile.Reputation.$xp.Student === 5, 'a student bond at Rank 5 adds Student +5');
ok(G.$ui.toasts.some(t => /Gift from/.test(t)), 'the gift is toasted');
const G2 = applyPatch(G, [{ op: 'replace', path: '/Bonds/Trixie/Rank', value: 4 }]);
const G3 = rankUp(primed(G2, 'Trixie', 4), 'Trixie');
ok(Object.keys(G3._Perks).length === 1, 'a gift is given once');
ok(T(G, '12:40', [{ op: 'remove', path: "/_Perks/Trixie's flash powder" }])._Perks["Trixie's flash powder"], '_Perks is read-only for the AI');
// bond cap: at +3 a milestone adds nothing
let H = setXP(primed(B, 'Trixie', 4), 'Student', 60);
H = rankUp(H, 'Trixie');
ok(H.Player.Profile.Reputation.$xp.Student === 60 && H._Log.some(l => /bond milestones add no more/.test(l)), 'bond milestones count only below +3');
// the event directions carry the reward
let E = T(primed(B, 'Trixie', 4), '12:35');
ok(/This event gives \{\{user\}\} Trixie's gift/.test(E.$ui.bev.Trixie.dir), 'the 4 -> 5 event directions name the gift');

// ---- training: sessions, weekly and total limits, partner bonus, AI edits reverted, Builder moves the base
let R = T(S, '07:00', [{ op: 'insert', path: '/Training/-', value: { Track: 'stamina' } }]);
ok(R.Player.Vitals.Stamina_max === 101 && R.Player.$Training.stamina.gain === 1 && R.Training.length === 0, 'one session: +1% of the starting value');
R = T(R, '08:00', [{ op: 'insert', path: '/Training/-', value: { Track: 'Stamina' } }, { op: 'insert', path: '/Training/-', value: { Track: 'stamina' } }, { op: 'insert', path: '/Training/-', value: { Track: 'stamina' } }]);
ok(R.Player.Vitals.Stamina_max === 102.5 && R._Log.some(l => /all it can this week/.test(l)), `weekly limit +2.5% (${R.Player.Vitals.Stamina_max})`);
R = T(R, '09:00', [{ op: 'replace', path: '/Player/Vitals/Stamina_max', value: 150 }]);
ok(R.Player.Vitals.Stamina_max === 102.5 && R._Log.some(l => /grows only through training/.test(l)), 'the AI cannot raise Stamina_max directly');
let P5 = clone(B); P5.Bonds.Sophia = clone(P5.Bonds.Trixie); P5.Scene.Present.Sophia = { Note: '' };
P5._Perks[REW.npcs.Sophia.gift.name] = { From: 'Sophia', Kind: 'gift', Effect: 'x', Uses: 0 };
P5 = T(P5, '12:50', [{ op: 'insert', path: '/Training/-', value: { Track: 'mana' } }]);
ok(P5.Player.$Training.mana.gain === 1.5, `a training partner with the gift in the scene: x1.5 (${P5.Player.$Training.mana.gain})`);
let TC = clone(S); TC.Player.$Training.mana = { base: 100, gain: 99.5, w: -1, wg: 0 }; TC.Player.Vitals.Mana_max = 199.5;
TC = T(TC, '07:00', [{ op: 'insert', path: '/Training/-', value: { Track: 'mana' } }]);
ok(TC.Player.Vitals.Mana_max === 200 && TC.Player.$Training.mana.gain === 100, 'the total limit is twice the starting value');
TC = T(TC, '08:00', [{ op: 'insert', path: '/Training/-', value: { Track: 'mana' } }]);
ok(TC.Player.Vitals.Mana_max === 200 && TC._Log.some(l => /reached its limit/.test(l)), 'after the limit training adds nothing');
let BU = clone(S); BU.$eng.auth = 'builder';
BU = T(BU, '07:00', [{ op: 'replace', path: '/Player/Vitals/Mana_max', value: 300 }, { op: 'replace', path: '/$eng/auth', value: 'builder' }]);
ok(BU.Player.Vitals.Mana_max === 300 && BU.Player.$Training.mana.base === 300, 'a Builder change moves the starting value');
// jump: Gavlan's gift +10% at once, outside the weekly limit
let J = clone(B); J.Bonds.Gavlan = Object.assign(J.Bonds.Gavlan, { Rank: 4, $xp: 999, _Event_ready: true, $cool: -1 });
J.Player.$Training.mana.wg = 2.5; J.Player.$Training.mana.w = Math.floor(J.$eng.abs / 1440 / 7);
J = rankUp(J, 'Gavlan');
ok(J.Player.Vitals.Mana_max === 110 && J.Player.Profile.Reputation.$xp.Academy === 5, 'Gavlan\'s gift: Mana pool +10% at once; a staff bond at Rank 5 adds Academy +5');

// ---- Rank 10 benefits: reputation level, one-use tokens, monthly points
let K = primed(B, 'Trixie', 9); K.Bonds.Ruby = clone(K.Bonds.Trixie); K.Scene.Present.Ruby = { Note: '' };
K = setXP(K, 'Student', 10);
K = rankUp(K, 'Ruby');
ok(K._Perks['Ruby (Rank 10)'] && K.Player.Profile.Reputation._Student === 2 && K.Player.Profile.Reputation.$xp.Student === 35,
  `Ruby Rank 10: milestone +10 (to 20, level 1) then one level up (to 35): ${K.Player.Profile.Reputation.$xp.Student}`);
let Q = clone(B); Q._Perks['Kuroo (Rank 10)'] = { From: 'Kuroo', Kind: 'rank10', Effect: 'x', Uses: 1 };
Q = T(Q, '12:40', [{ op: 'insert', path: '/Perk_use/-', value: 'Kuroo (Rank 10)' }]);
ok(Q._Perks['Kuroo (Rank 10)'] && Q._Log.some(l => /only works while Academy reputation is below 0/.test(l)), "Kuroo's favour is kept while Academy is not negative");
Q = setXP(Q, 'Academy', -40);
Q = T(Q, '12:45', [{ op: 'insert', path: '/Perk_use/-', value: 'kuroo (rank 10)' }]);
ok(!Q._Perks['Kuroo (Rank 10)'] && Q.Player.Profile.Reputation._Academy === -1 && Q.Player.Profile.Reputation.$xp.Academy === -15 && Q.$ui.perks_used.length === 1,
  `used from -2: one level toward 0 (${Q.Player.Profile.Reputation.$xp.Academy}), spent and recorded`);
let U = clone(B); U._Perks['Council pardon'] = { From: 'Irene', Kind: 'gift', Effect: 'x', Uses: 1 };
U = T(U, '12:40', [{ op: 'insert', path: '/Perk_use/-', value: 'Council pardon' }]);
ok(!U._Perks['Council pardon'] && U.Journal.some(l => /used Council pardon/.test(l)), 'a one-use gift is spent');
let MP = clone(B); MP.Player.Profile.Dorm = 'Fire'; MP._Perks["Asmoday's Mercy stipend"] = { From: 'Tristan', Kind: 'gift', Effect: 'x', Uses: 0 };
MP.Player.Profile.Reputation.$xp.Academy = 125;
const pts0 = MP.Player.Wallet.Points;
MP = applyPatch(MP, [{ op: 'replace', path: '/World/Month', value: 2 }, { op: 'replace', path: '/World/Week', value: 1 }, { op: 'replace', path: '/World/Day', value: 'Mon' }]);
ok(MP.Player.Wallet.Points === pts0 + 300 + REP.academy5_monthly + REW.monthly.tristan[0], `monthly: payout + Academy +5 bonus + Tristan's stipend (${MP.Player.Wallet.Points - pts0})`);
let MN = clone(B); MN.Player.Profile.Dorm = 'Fire'; MN.Player.Profile.Reputation.$xp.Academy = -125;
MN = applyPatch(MN, [{ op: 'replace', path: '/World/Month', value: 2 }, { op: 'replace', path: '/World/Week', value: 1 }, { op: 'replace', path: '/World/Day', value: 'Mon' }]);
ok(MN.Player.Wallet.Points === pts0 + 150, 'Academy -5: the payout is halved');

// ---- Krieg (model B): the introduction is ready at once; +14 every Monday while Doves >= +1, else Tension +1
let KR = T(S, '12:00', [present(['Krieg'])]);
ok(KR.Bonds.Krieg._Event_ready && KR.Bonds.Krieg.$xp === 10, 'meeting Krieg: his introduction (0 -> 1) is ready at once');
KR = rankUp(KR, 'Krieg');
KR = T(KR, '12:30', [{ op: 'insert', path: '/Interactions/-', value: { With: 'Krieg', Kind: 'hangout' } }]);
ok(KR.Bonds.Krieg.Rank === 1 && KR.Bonds.Krieg.$xp === 0, 'Krieg gains nothing from talks or hangouts');
const tens = KR.Bonds.Krieg.Tension;
let K1 = nextWeek(KR);
ok(K1.Bonds.Krieg.$xp === 0 && K1.Bonds.Krieg.Tension === tens + 1, 'a Monday with Doves reputation 0: no XP, Tension +1');
let K2 = nextWeek(setXP(KR, 'Doves', 15));
ok(K2.Bonds.Krieg.$xp === REW.krieg.weekly_xp, `a Monday with Doves +1: +${REW.krieg.weekly_xp} XP`);

// ---- mask -> truth (Castor): nudge Fact at 7 -> 8; the 8 -> 9 event waits for a revealed secret
let MK = T(S, '12:00', [present(['Castor'])]);
MK = rankUp(primed(MK, 'Castor', 7), 'Castor');
ok(MK.Bonds.Castor.Rank === 8 && MK.Bonds.Castor.Known_facts.includes(REW.npcs.Castor.nudge.fact), 'the 7 -> 8 event adds the nudge Fact');
let MH = clone(MK); MH.Bonds.Castor.$xp = 999; MH.Bonds.Castor.$cool = -1; MH.Bonds.Castor.Trust = 70;   // 1.4.3: the 8 -> 9 event also needs Trust 65
MH = T(MH, '12:40');
ok(!MH.Bonds.Castor._Event_ready && MH.$ui.bev.Castor && MH.$ui.bev.Castor.held, 'Rank 8 with a full bar stays held while the truth is not out');
ok(rankUp(MH, 'Castor').Bonds.Castor.Rank === 8, 'the rank cannot rise while held');
MH = T(MH, '12:45', [{ op: 'insert', path: '/Campus_State/Secrets_revealed/-', value: 'Castor.identity' }]);
ok(MH.Bonds.Castor._Event_ready, 'once a Castor secret is revealed the 8 -> 9 event opens');

// ---- rival academy teams have no bond system
const RV = T(S, '12:00', [present(['Lucius', 'Irene'])]);
ok(!RV.Bonds.Lucius && RV.Bonds.Irene, 'meeting a rival team member starts no bond');
